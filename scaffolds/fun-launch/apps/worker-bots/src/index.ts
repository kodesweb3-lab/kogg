import 'dotenv/config';
import { prisma } from './db.js';
import { decrypt } from './encryption.js';
import { TokenBot } from './bot.js';
import { startHealthServer } from './health-server.js';
import { logger } from './logger.js';

const activeBots = new Map<string, TokenBot>();

/**
 * Load and start all active bots
 */
async function loadBots() {
  try {
    const bots = await prisma.telegramBot.findMany({
      where: {
        status: 'ACTIVE',
      },
      include: {
        persona: true,
      },
    });

    logger.info(`Found ${bots.length} active bots`);

    for (const botData of bots) {
      try {
        // Skip if already loaded
        if (activeBots.has(botData.tokenMint)) {
          continue;
        }

        // Decrypt bot token
        const decryptedToken = decrypt(botData.encryptedToken);

        // Parse persona data (100% user-owned - Kogaion only loads it)
        const traits = JSON.parse(botData.persona.traitsJson) as string[];
        const allowed = botData.persona.allowed
          ? (JSON.parse(botData.persona.allowed) as string[])
          : undefined;
        const forbidden = botData.persona.forbidden
          ? (JSON.parse(botData.persona.forbidden) as string[])
          : undefined;

        // Use user-owned system prompt (NOT Kogaion platform voice)
        const userSystemPrompt = botData.persona.systemPrompt;

        // Create and start bot with USER'S persona
        const bot = new TokenBot({
          tokenMint: botData.tokenMint,
          botToken: decryptedToken,
          systemPrompt: userSystemPrompt, // User-owned, not Kogaion
          traits,
          tone: botData.persona.tone,
          allowed,
          forbidden,
        });

        await bot.start();
        activeBots.set(botData.tokenMint, bot);
      } catch (error) {
        logger.error(`Failed to load bot for token ${botData.tokenMint}`, error instanceof Error ? error : new Error(String(error)), {
          tokenMint: botData.tokenMint,
        });
        
        // Mark bot as error
        await prisma.telegramBot.update({
          where: { tokenMint: botData.tokenMint },
          data: { status: 'ERROR' },
        });
      }
    }
  } catch (error) {
    logger.error('Error loading bots', error instanceof Error ? error : new Error(String(error)));
  }
}

/**
 * Stop and remove a bot
 */
async function unloadBot(tokenMint: string) {
  const bot = activeBots.get(tokenMint);
  if (bot) {
    await bot.stop();
    activeBots.delete(tokenMint);
    logger.info(`Unloaded bot for token ${tokenMint}`, { tokenMint });
  }
}

/**
 * Reload bots periodically to pick up new activations
 */
async function reloadBots() {
  logger.info('Reloading bots...');
  
  // Get current active bots from DB
  const dbBots = await prisma.telegramBot.findMany({
    where: { status: 'ACTIVE' },
    select: { tokenMint: true },
  });

  const dbTokenMints = new Set(dbBots.map((b) => b.tokenMint));

  // Unload bots that are no longer active
  for (const [tokenMint] of activeBots) {
    if (!dbTokenMints.has(tokenMint)) {
      await unloadBot(tokenMint);
    }
  }

  // Load new bots
  await loadBots();
}

/**
 * Graceful shutdown
 */
async function shutdown() {
  logger.info('Shutting down...');
  
  for (const [tokenMint, bot] of activeBots) {
    await bot.stop();
  }
  
  await prisma.$disconnect();
  process.exit(0);
}

// Main execution
async function main() {
  logger.info('Starting Kogaion Bot Worker...');

  // Validate environment variables
  if (!process.env.DATABASE_URL) {
    throw new Error('DATABASE_URL environment variable is required');
  }
  if (!process.env.ENCRYPTION_KEY) {
    throw new Error('ENCRYPTION_KEY environment variable is required');
  }
  if (!process.env.HUGGINGFACE_API_KEY) {
    throw new Error('HUGGINGFACE_API_KEY environment variable is required');
  }

  // Start health check server
  startHealthServer();

  // Initial load
  await loadBots();

  // Reload bots every 30 seconds
  setInterval(reloadBots, 30 * 1000);

  // Handle shutdown signals
  process.once('SIGINT', shutdown);
  process.once('SIGTERM', shutdown);

  logger.info('Bot worker running. Press Ctrl+C to stop.');
}

main().catch((error) => {
  logger.error('Fatal error', error instanceof Error ? error : new Error(String(error)));
  process.exit(1);
});
