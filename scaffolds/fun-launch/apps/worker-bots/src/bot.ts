import { Telegraf } from 'telegraf';
import { generateResponse, buildSystemPrompt } from './huggingface.js';
import { logger } from './logger.js';

export interface BotConfig {
  tokenMint: string;
  botToken: string; // Decrypted
  systemPrompt: string;
  traits: string[];
  tone: string;
  allowed?: string[];
  forbidden?: string[];
}

export class TokenBot {
  private bot: Telegraf;
  private config: BotConfig;
  private conversationHistory: Map<number, string[]> = new Map();

  constructor(config: BotConfig) {
    this.config = config;
    this.bot = new Telegraf(config.botToken);

    this.setupHandlers();
  }

  private setupHandlers() {
    // Start command
    this.bot.start((ctx) => {
      ctx.reply(
        `🚀 Welcome! I'm the AI bot for ${this.config.tokenMint.substring(0, 8)}...\n\n` +
        `Ask me anything about this token!`
      );
    });

    // Help command
    this.bot.help((ctx) => {
      ctx.reply(
        'I\'m an AI bot powered by HuggingFace. Just chat with me naturally!'
      );
    });

    // Handle all text messages
    this.bot.on('text', async (ctx) => {
      try {
        const userId = ctx.from?.id;
        if (!userId) return;

        const userMessage = ctx.message.text;

        // Get conversation history for this user
        const history = this.conversationHistory.get(userId) || [];
        history.push(`User: ${userMessage}`);

        // Keep only last 5 messages for context
        if (history.length > 10) {
          history.splice(0, history.length - 10);
        }

        // Build context from system prompt and history
        const systemPrompt = buildSystemPrompt(
          this.config.systemPrompt,
          this.config.traits,
          this.config.tone,
          this.config.allowed,
          this.config.forbidden
        );

        const context = systemPrompt + '\n\n' + history.slice(-4).join('\n');

        // Show typing indicator
        await ctx.sendChatAction('typing');

        // Generate response
        const response = await generateResponse(userMessage, context);

        // Add response to history
        history.push(`Assistant: ${response}`);
        this.conversationHistory.set(userId, history);

        // Send response
        await ctx.reply(response);
      } catch (error) {
        logger.error(`Error handling message for bot ${this.config.tokenMint}`, error instanceof Error ? error : new Error(String(error)), {
          tokenMint: this.config.tokenMint,
          userId: ctx.from?.id,
        });
        await ctx.reply(
          'Sorry, I encountered an error. Please try again later.'
        );
      }
    });

    // Error handling
    this.bot.catch((err, ctx) => {
      logger.error(`Error in bot ${this.config.tokenMint}`, err instanceof Error ? err : new Error(String(err)), {
        tokenMint: this.config.tokenMint,
      });
      ctx.reply('An error occurred. Please try again later.');
    });
  }

  async start() {
    try {
      await this.bot.launch();
      logger.info(`Bot started for token ${this.config.tokenMint}`, { tokenMint: this.config.tokenMint });
    } catch (error) {
      logger.error(`Failed to start bot for token ${this.config.tokenMint}`, error instanceof Error ? error : new Error(String(error)), {
        tokenMint: this.config.tokenMint,
      });
      throw error;
    }
  }

  async stop() {
    try {
      await this.bot.stop();
      logger.info(`Bot stopped for token ${this.config.tokenMint}`, { tokenMint: this.config.tokenMint });
    } catch (error) {
      logger.error(`Error stopping bot for token ${this.config.tokenMint}`, error instanceof Error ? error : new Error(String(error)), {
        tokenMint: this.config.tokenMint,
      });
    }
  }
}
