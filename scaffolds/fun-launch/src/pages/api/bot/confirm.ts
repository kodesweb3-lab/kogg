import { NextApiRequest, NextApiResponse } from 'next';
import { Connection, PublicKey } from '@solana/web3.js';
import { getConfig } from '@/lib/config';
import { prisma } from '@/lib/db';
import { logger } from '@/lib/logger';

const TREASURY_WALLET = new PublicKey('5hDrp6eTjMKrUFx96wqeQHhXNa7zvp3ba1Z9nTY3tBjA');
const ACTIVATION_FEE = 0.1 * 1e9; // 0.1 SOL in lamports
const TOLERANCE = 1000; // Allow 1000 lamports tolerance for fees

type ConfirmBotRequest = {
  tokenMint: string;
  signature: string; // Transaction signature
};

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  try {
    const { tokenMint, signature } = req.body as ConfirmBotRequest;

    // Validate required fields
    if (!tokenMint || !signature) {
      return res.status(400).json({
        error: 'Missing required fields: tokenMint and signature are required',
      });
    }

    // Validate PublicKey format
    try {
      new PublicKey(tokenMint);
    } catch (error) {
      return res.status(400).json({
        error: 'Invalid PublicKey format for tokenMint',
      });
    }

    // Check if bot exists and is pending
    const bot = await prisma.telegramBot.findUnique({
      where: { tokenMint },
      include: { persona: true },
    });

    if (!bot) {
      return res.status(404).json({
        error: 'Bot not found. Please activate bot first.',
      });
    }

    if (bot.status !== 'PENDING') {
      return res.status(400).json({
        error: `Bot is not in PENDING status. Current status: ${bot.status}`,
      });
    }

    // Verify transaction on-chain (must be finalized)
    const config = getConfig();
    const connection = new Connection(config.rpcUrl, 'finalized');

    let transaction;
    try {
      transaction = await connection.getTransaction(signature, {
        commitment: 'finalized',
        maxSupportedTransactionVersion: 0,
      });
    } catch (error) {
      return res.status(400).json({
        error: 'Transaction not found. Please ensure the transaction is finalized.',
      });
    }

    if (!transaction) {
      return res.status(404).json({
        error: 'Transaction not found on-chain. Please wait for finalization.',
      });
    }

    // Verify transaction succeeded
    if (transaction.meta?.err) {
      return res.status(400).json({
        error: 'Transaction failed on-chain',
      });
    }

    // Verify payment amount and recipient
    const preBalances = transaction.meta?.preBalances || [];
    const postBalances = transaction.meta?.postBalances || [];
    const accountKeys = transaction.transaction.message.accountKeys;

    let treasuryIndex = -1;
    for (let i = 0; i < accountKeys.length; i++) {
      if (accountKeys[i].toBase58() === TREASURY_WALLET.toBase58()) {
        treasuryIndex = i;
        break;
      }
    }

    if (treasuryIndex === -1) {
      return res.status(400).json({
        error: 'Treasury wallet not found in transaction',
      });
    }

    const treasuryBalanceChange = (postBalances[treasuryIndex] || 0) - (preBalances[treasuryIndex] || 0);

    if (treasuryBalanceChange < ACTIVATION_FEE - TOLERANCE) {
      return res.status(400).json({
        error: `Insufficient payment. Expected at least ${ACTIVATION_FEE / 1e9} SOL, received ${treasuryBalanceChange / 1e9} SOL`,
      });
    }

    // Activate bot
    await prisma.telegramBot.update({
      where: { tokenMint },
      data: {
        status: 'ACTIVE',
        updatedAt: new Date(),
      },
    });

    res.status(200).json({
      success: true,
      message: 'Bot activated successfully',
      bot: {
        tokenMint: bot.tokenMint,
        status: 'ACTIVE',
      },
    });
  } catch (error) {
    logger.error('Error confirming bot', error instanceof Error ? error : new Error(String(error)), {
      endpoint: '/api/bot/confirm',
    });
    if (error instanceof Error) {
      return res.status(500).json({
        error: `Failed to confirm bot: ${error.message}`,
      });
    }
    return res.status(500).json({
      error: 'Unknown error occurred while confirming bot',
    });
  }
}
