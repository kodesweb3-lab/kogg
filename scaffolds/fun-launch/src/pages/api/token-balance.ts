import { NextApiRequest, NextApiResponse } from 'next';
import { Connection, PublicKey } from '@solana/web3.js';
import { getAssociatedTokenAddress, getAccount } from '@solana/spl-token';
import { getConfig } from '@/lib/config';
import { logger } from '@/lib/logger';

// Load configuration
let config: ReturnType<typeof getConfig>;
try {
  config = getConfig();
} catch (error) {
  logger.error('Configuration error', error instanceof Error ? error : new Error(String(error)));
  throw error;
}

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  try {
    const { mint, wallet } = req.body;

    if (!mint || !wallet) {
      return res.status(400).json({ error: 'mint and wallet are required' });
    }

    const connection = new Connection(config.rpcUrl, 'confirmed');
    const mintPubkey = new PublicKey(mint);
    const walletPubkey = new PublicKey(wallet);

    // Get associated token account
    const ata = await getAssociatedTokenAddress(mintPubkey, walletPubkey);

    try {
      const tokenAccount = await getAccount(connection, ata);
      // Token has 6 decimals by default for Meteora DBC
      const balance = Number(tokenAccount.amount) / 1e6;
      
      res.status(200).json({
        success: true,
        balance: balance.toString(),
        rawBalance: tokenAccount.amount.toString(),
      });
    } catch (error) {
      // Account doesn't exist - no balance
      res.status(200).json({
        success: true,
        balance: '0',
        rawBalance: '0',
      });
    }
  } catch (error) {
    logger.error('Token balance error', error instanceof Error ? error : new Error(String(error)));
    return res.status(500).json({ error: 'Failed to get token balance' });
  }
}
