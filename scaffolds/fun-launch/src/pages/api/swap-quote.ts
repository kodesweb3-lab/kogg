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
type SwapQuoteRequest = {
  mint: string;     // Token mint address
  amount: number;   // Amount to swap
  isBuy: boolean;   // true = buy tokens with SOL, false = sell tokens for SOL
};

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  try {
    const { mint, amount, isBuy } = req.body as SwapQuoteRequest;

    // Validate required fields
    if (!mint || !amount) {
      return res.status(400).json({ 
        error: 'Missing required fields: mint and amount are required' 
      });
    }

    // Validate amount
    if (amount <= 0) {
      return res.status(400).json({ 
        error: 'Amount must be greater than 0' 
      });
    }

    // Validate PublicKey format
    try {
      new PublicKey(mint);
    } catch (error) {
      return res.status(400).json({ 
        error: 'Invalid PublicKey format for mint' 
      });
    }

    // Get swap quote
    const quote = await getSwapQuote({
      mint,
      amount,
      isBuy: isBuy !== false,
    });

    res.status(200).json({
      success: true,
      estimatedOutput: quote.estimatedOutput,
      minimumOutput: quote.minimumOutput,
      priceImpact: quote.priceImpact,
    });
  } catch (error) {
    logger.error('Swap quote error', error instanceof Error ? error : new Error(String(error)), {
      endpoint: '/api/swap-quote',
    });
    
    if (error instanceof Error) {
      if (error.message.includes('Pool not found')) {
        return res.status(404).json({ 
          error: 'Pool not found for this token' 
        });
      }
      return res.status(500).json({ 
        error: `Failed to get swap quote: ${error.message}` 
      });
    }
    
    return res.status(500).json({ 
      error: 'Unknown error occurred while getting swap quote' 
    });
  }
}

/**
 * Get DBC swap quote
 * 
 * In Meteora DBC:
 * - Base = the token we created (our token)
 * - Quote = SOL (the currency)
 * 
 * swapBaseForQuote:
 * - true = sell tokens for SOL (base -> quote)
 * - false = buy tokens with SOL (quote -> base)
 */
async function getSwapQuote({
  mint,
  amount,
  isBuy,
}: {
  mint: string;
  amount: number;
  isBuy: boolean;
}) {
  const connection = new Connection(config.rpcUrl, 'confirmed');
  const client = new DynamicBondingCurveClient(connection, 'confirmed');

  // Get pool by base mint
  const poolState = await client.state.getPoolByBaseMint(new PublicKey(mint));
  if (!poolState) {
    throw new Error(`Pool not found for mint ${mint}`);
  }

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

  // For buy: input is SOL, output is token
  // For sell: input is token, output is SOL
  const inputDecimals = isBuy ? SOL_DECIMALS : TOKEN_DECIMALS;
  const outputDecimals = isBuy ? TOKEN_DECIMALS : SOL_DECIMALS;
  
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

  // Convert outputs to human-readable format
  const estimatedOutput = Number(quote.swapOutAmount.toString()) / Math.pow(10, outputDecimals);
  const minimumOutput = Number(quote.minimumAmountOut.toString()) / Math.pow(10, outputDecimals);
  
  // Calculate price impact (simplified)
  const swapOut = Number(quote.swapOutAmount.toString());
  const minOut = Number(quote.minimumAmountOut.toString());
  const priceImpact = swapOut > 0 
    ? (((swapOut - minOut) / swapOut) * 100).toFixed(2)
    : '0';

  return {
    estimatedOutput: estimatedOutput.toString(),
    minimumOutput: minimumOutput.toString(),
    priceImpact,
  };
}
