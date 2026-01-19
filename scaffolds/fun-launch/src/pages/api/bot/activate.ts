import { NextApiRequest, NextApiResponse } from 'next';
import { Connection, Keypair, PublicKey, SystemProgram, Transaction } from '@solana/web3.js';
import { getConfig } from '@/lib/config';
import { prisma } from '@/lib/db';
import { logger } from '@/lib/logger';

const TREASURY_WALLET = new PublicKey('5hDrp6eTjMKrUFx96wqeQHhXNa7zvp3ba1Z9nTY3tBjA');
const ACTIVATION_FEE = 0.1; // SOL

type ActivateBotRequest = {
  tokenMint: string;
  botToken: string; // BotFather token (will be encrypted)
  systemPrompt: string;
  traitsJson: string; // JSON string
  allowed?: string; // JSON string
  forbidden?: string; // JSON string
  tone: string;
  personaStyleJson?: string; // JSON: { chaos, friendliness, formality, aggression, humor }
  brandingJson?: string; // JSON: { catchphrases, emojis, voiceStyle, doList, dontList }
  presetUsed?: string; // Which preset was used
  userWallet: string;
};

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  try {
    const {
      tokenMint,
      botToken,
      systemPrompt,
      traitsJson,
      allowed,
      forbidden,
      tone,
      personaStyleJson,
      brandingJson,
      presetUsed,
      userWallet,
    } = req.body as ActivateBotRequest;

    // Validate required fields
    if (!tokenMint || !botToken || !systemPrompt || !traitsJson || !tone || !userWallet) {
      return res.status(400).json({
        error: 'Missing required fields: tokenMint, botToken, systemPrompt, traitsJson, tone, and userWallet are required',
      });
    }

    // Validate JSON fields (personaStyleJson, brandingJson are optional)
    if (personaStyleJson) {
      try {
        JSON.parse(personaStyleJson);
      } catch (error) {
        return res.status(400).json({
          error: 'Invalid JSON format in personaStyleJson',
        });
      }
    }
    if (brandingJson) {
      try {
        JSON.parse(brandingJson);
      } catch (error) {
        return res.status(400).json({
          error: 'Invalid JSON format in brandingJson',
        });
      }
    }

    // Validate PublicKey formats
    try {
      new PublicKey(tokenMint);
      new PublicKey(userWallet);
    } catch (error) {
      return res.status(400).json({
        error: 'Invalid PublicKey format for tokenMint or userWallet',
      });
    }

    // Validate JSON fields
    try {
      JSON.parse(traitsJson);
      if (allowed) JSON.parse(allowed);
      if (forbidden) JSON.parse(forbidden);
    } catch (error) {
      return res.status(400).json({
        error: 'Invalid JSON format in traitsJson, allowed, or forbidden',
      });
    }

    // Check if token exists
    const token = await prisma.token.findUnique({
      where: { mint: tokenMint },
    });

    if (!token) {
      return res.status(404).json({
        error: 'Token not found. Token must be launched first.',
      });
    }

    // Check if bot already exists for this token
    const existingBot = await prisma.telegramBot.findUnique({
      where: { tokenMint },
    });

    if (existingBot && existingBot.status === 'ACTIVE') {
      return res.status(409).json({
        error: 'Bot already active for this token',
      });
    }

    // Create or update persona (store temporarily, will be activated after payment)
    // This is 100% user-owned - Kogaion only stores it
    await prisma.botPersona.upsert({
      where: { tokenMint },
      create: {
        tokenMint,
        systemPrompt, // User-owned final system prompt
        traitsJson,
        allowed: allowed || null,
        forbidden: forbidden || null,
        tone,
        personaStyleJson: personaStyleJson || null,
        brandingJson: brandingJson || null,
        presetUsed: presetUsed || null,
      },
      update: {
        systemPrompt,
        traitsJson,
        allowed: allowed || null,
        forbidden: forbidden || null,
        tone,
        personaStyleJson: personaStyleJson || null,
        brandingJson: brandingJson || null,
        presetUsed: presetUsed || null,
        updatedAt: new Date(),
      },
    });

    // Create payment transaction
    const config = getConfig();
    const connection = new Connection(config.rpcUrl, 'confirmed');

    const transaction = new Transaction();
    const { blockhash } = await connection.getLatestBlockhash('finalized');
    transaction.recentBlockhash = blockhash;
    transaction.feePayer = new PublicKey(userWallet);

    // Add SOL transfer instruction
    transaction.add(
      SystemProgram.transfer({
        fromPubkey: new PublicKey(userWallet),
        toPubkey: TREASURY_WALLET,
        lamports: ACTIVATION_FEE * 1e9, // Convert SOL to lamports
      })
    );

    // Serialize transaction for client to sign
    const serializedTx = transaction.serialize({
      requireAllSignatures: false,
      verifySignatures: false,
    });

    // Store pending bot with encrypted token (temporary, will be activated after payment confirmation)
    const encryptionModule = await import('@/lib/encryption');
    const encryptedToken = encryptionModule.encrypt(botToken);

    await prisma.telegramBot.upsert({
      where: { tokenMint },
      create: {
        tokenMint,
        encryptedToken,
        status: 'PENDING',
      },
      update: {
        encryptedToken,
        status: 'PENDING',
        updatedAt: new Date(),
      },
    });

    res.status(200).json({
      success: true,
      transaction: serializedTx.toString('base64'),
      treasuryWallet: TREASURY_WALLET.toBase58(),
      amount: ACTIVATION_FEE,
    });
  } catch (error) {
    logger.error('Error activating bot', error instanceof Error ? error : new Error(String(error)), {
      endpoint: '/api/bot/activate',
    });
    if (error instanceof Error) {
      return res.status(500).json({
        error: `Failed to activate bot: ${error.message}`,
      });
    }
    return res.status(500).json({
      error: 'Unknown error occurred while activating bot',
    });
  }
}
