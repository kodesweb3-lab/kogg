import { NextApiRequest, NextApiResponse } from 'next';
import { Connection, PublicKey } from '@solana/web3.js';
import { DynamicBondingCurveClient } from '@meteora-ag/dynamic-bonding-curve-sdk';
import BN from 'bn.js';
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
type SwapTransactionRequest = {
  mint: string;        // Token mint address
  amountSol: number;   // Amount of SOL to swap
  userWallet: string;  // User's wallet address
  isBuy: boolean;      // true = buy tokens with SOL, false = sell tokens for SOL
};

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  try {
    const { mint, amountSol, userWallet, isBuy } = req.body as SwapTransactionRequest;

    // Validate required fields
    if (!mint || !amountSol || !userWallet) {
      return res.status(400).json({ 
        error: 'Missing required fields: mint, amountSol, and userWallet are required' 
      });
    }

    // Validate amount
    if (amountSol <= 0 || amountSol > 10) {
      return res.status(400).json({ 
        error: 'Amount must be between 0 and 10 SOL' 
      });
    }

    // Validate PublicKey formats
    try {
      new PublicKey(mint);
      new PublicKey(userWallet);
    } catch (error) {
      return res.status(400).json({ 
        error: 'Invalid PublicKey format for mint or userWallet' 
      });
    }

    // Create swap transaction
    const swapTx = await createSwapTransaction({
      mint,
      amountSol,
      userWallet,
      isBuy: isBuy !== false, // Default to buy
    });

    res.status(200).json({
      success: true,
      swapTx: swapTx
        .serialize({
          requireAllSignatures: false,
          verifySignatures: false,
        })
        .toString('base64'),
    });
  } catch (error) {
    logger.error('Swap transaction error', error instanceof Error ? error : new Error(String(error)), {
      endpoint: '/api/swap-transaction',
    });
    
    if (error instanceof Error) {
      if (error.message.includes('Pool not found')) {
        return res.status(404).json({ 
          error: 'Pool not found for this token. Please wait for the pool to be indexed.' 
        });
      }
      return res.status(500).json({ 
        error: `Failed to create swap transaction: ${error.message}` 
      });
    }
    
    return res.status(500).json({ 
      error: 'Unknown error occurred while creating swap transaction' 
    });
  }
}

/**
 * Create DBC swap transaction
 * 
 * For dev buy:
 * - swapBaseForQuote = false (swap SOL for tokens)
 * - amountIn = SOL amount in lamports
 */
async function createSwapTransaction({
  mint,
  amountSol,
  userWallet,
  isBuy,
}: {
  mint: string;
  amountSol: number;
  userWallet: string;
  isBuy: boolean;
}) {
  const connection = new Connection(config.rpcUrl, 'confirmed');
  const client = new DynamicBondingCurveClient(connection, 'confirmed');

  // Get pool by base mint
  const poolState = await client.state.getPoolByBaseMint(new PublicKey(mint));
  if (!poolState) {
    throw new Error(`Pool not found for mint ${mint}`);
  }

  const poolAddress = poolState.publicKey;
  const dbcConfigAddress = poolState.account.config;
  
  // Get pool config
  const poolConfig = await client.state.getPoolConfig(dbcConfigAddress);
  if (!poolConfig) {
    throw new Error(`Pool config not found for ${dbcConfigAddress.toString()}`);
  }

  // Convert SOL to lamports (SOL has 9 decimals)
  const amountIn = new BN(Math.floor(amountSol * 1e9));

  // Get current point for swap quote
  let currentPoint: number | null;
  if (poolConfig.activationType === 0) {
    currentPoint = await connection.getSlot();
  } else {
    const currentSlot = await connection.getSlot();
    currentPoint = await connection.getBlockTime(currentSlot);
  }

  if (currentPoint === null) {
    throw new Error('Failed to get current block time');
  }

  // swapBaseForQuote: false = buy tokens with SOL, true = sell tokens for SOL
  const swapBaseForQuote = !isBuy;

  // Get swap quote
  const quote = await client.pool.swapQuote({
    virtualPool: poolState.account,
    config: poolConfig,
    swapBaseForQuote,
    amountIn,
    hasReferral: false,
    currentPoint: new BN(currentPoint),
  });

  // Create swap transaction
  const swapTx = await client.pool.swap({
    amountIn,
    minimumAmountOut: quote.minimumAmountOut,
    owner: new PublicKey(userWallet),
    pool: poolAddress,
    swapBaseForQuote,
    referralTokenAccount: null,
  });

  // Set transaction properties
  const { blockhash } = await connection.getLatestBlockhash();
  swapTx.feePayer = new PublicKey(userWallet);
  swapTx.recentBlockhash = blockhash;

  return swapTx;
}
