import { NextApiRequest, NextApiResponse } from 'next';
import { Connection, PublicKey } from '@solana/web3.js';
import { DynamicBondingCurveClient } from '@meteora-ag/dynamic-bonding-curve-sdk';
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

// Types
type CheckFeeClaimerRequest = {
  wallet: string;        // Wallet address to check
  baseMint?: string;     // Optional: token mint address (for specific pool check)
};

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  try {
    const { wallet, baseMint } = req.body as CheckFeeClaimerRequest;

    // Validate required fields
    if (!wallet) {
      return res.status(400).json({ 
        error: 'Missing required field: wallet is required' 
      });
    }

    // Validate PublicKey format
    let walletPubkey: PublicKey;
    let baseMintPubkey: PublicKey | undefined;

    try {
      walletPubkey = new PublicKey(wallet);
      if (baseMint) {
        baseMintPubkey = new PublicKey(baseMint);
      }
    } catch (error) {
      return res.status(400).json({ 
        error: 'Invalid PublicKey format for wallet or baseMint' 
      });
    }

    const connection = new Connection(config.rpcUrl, 'confirmed');
    const client = new DynamicBondingCurveClient(connection, 'confirmed');

    let isFeeClaimer = false;

    if (baseMintPubkey) {
      // Check for specific token pool
      const poolState = await client.state.getPoolByBaseMint(baseMintPubkey);
      if (!poolState) {
        return res.status(200).json({ 
          success: true, 
          isFeeClaimer: false 
        });
      }

      const dbcConfigAddress = poolState.account.config;
      const poolConfig = await client.state.getPoolConfig(dbcConfigAddress);
      if (!poolConfig) {
        return res.status(200).json({ 
          success: true, 
          isFeeClaimer: false 
        });
      }

      const authorizedFeeClaimer = poolConfig.feeClaimer;
      isFeeClaimer = authorizedFeeClaimer.toString() === walletPubkey.toString();
    } else {
      // Check for platform feeClaimer (POOL_CONFIG_KEY)
      const poolConfig = await client.state.getPoolConfig(new PublicKey(config.poolConfigKey));
      if (!poolConfig) {
        return res.status(200).json({ 
          success: true, 
          isFeeClaimer: false 
        });
      }

      const authorizedFeeClaimer = poolConfig.feeClaimer;
      isFeeClaimer = authorizedFeeClaimer.toString() === walletPubkey.toString();
    }

    res.status(200).json({
      success: true,
      isFeeClaimer,
    });
  } catch (error) {
    logger.error('Check fee claimer error', error instanceof Error ? error : new Error(String(error)), {
      endpoint: '/api/check-fee-claimer',
    });
    
    if (error instanceof Error) {
      return res.status(500).json({ 
        error: `Failed to check fee claimer: ${error.message}` 
      });
    }
    
    return res.status(500).json({ 
      error: 'Unknown error occurred while checking fee claimer' 
    });
  }
}
