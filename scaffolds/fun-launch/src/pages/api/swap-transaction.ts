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
  amount: number;      // Amount to swap (SOL for buy, tokens for sell)
  userWallet: string;  // User's wallet address
  isBuy: boolean;      // true = buy tokens with SOL, false = sell tokens for SOL
  // Legacy support
  amountSol?: number;  // Deprecated, use amount instead
};

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  try {
    const { mint, amount, amountSol, userWallet, isBuy } = req.body as SwapTransactionRequest;

    // Support both 'amount' and legacy 'amountSol'
    const swapAmount = amount ?? amountSol;

    // Validate required fields
    if (!mint || !swapAmount || !userWallet) {
      return res.status(400).json({ 
        error: 'Missing required fields: mint, amount, and userWallet are required' 
      });
    }

    // Validate amount
    if (swapAmount <= 0) {
      return res.status(400).json({ 
        error: 'Amount must be greater than 0' 
      });
    }

    // For buy, limit to 10 SOL
    const isBuyMode = isBuy !== false;
    if (isBuyMode && swapAmount > 10) {
      return res.status(400).json({ 
        error: 'Maximum buy amount is 10 SOL' 
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
      amount: swapAmount,
      userWallet,
      isBuy: isBuyMode,
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
 * In Meteora DBC:
 * - Base = the token we created (our token)
 * - Quote = SOL (the currency)
 * 
 * swapBaseForQuote:
 * - true = sell tokens for SOL (base -> quote)
 * - false = buy tokens with SOL (quote -> base)
 */
async function createSwapTransaction({
  mint,
  amount,
  userWallet,
  isBuy,
}: {
  mint: string;
  amount: number;
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

  // Decimals:
  // - SOL (quote) = 9 decimals
  // - Token (base) = 6 decimals (standard for Meteora DBC tokens)
  const SOL_DECIMALS = 9;
  const TOKEN_DECIMALS = 6;

  // For buy: input is SOL, for sell: input is token
  const inputDecimals = isBuy ? SOL_DECIMALS : TOKEN_DECIMALS;
  const amountIn = new BN(Math.floor(amount * Math.pow(10, inputDecimals)));

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

  // swapBaseForQuote:
  // - isBuy = true -> we want to buy tokens with SOL -> swapBaseForQuote = false
  // - isBuy = false -> we want to sell tokens for SOL -> swapBaseForQuote = true
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
