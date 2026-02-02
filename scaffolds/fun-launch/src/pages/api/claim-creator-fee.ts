import { NextApiRequest, NextApiResponse } from 'next';
import { Connection, PublicKey, Transaction } from '@solana/web3.js';
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
type ClaimCreatorFeeRequest = {
  baseMint: string;  // Token mint address
  creator: string;   // Wallet address of the pool creator (must match pool state)
};

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  try {
    const { baseMint, creator } = req.body as ClaimCreatorFeeRequest;

    // Validate required fields
    if (!baseMint || !creator) {
      return res.status(400).json({
        error: 'Missing required fields: baseMint and creator are required',
      });
    }

    // Validate PublicKey formats
    let baseMintPubkey: PublicKey;
    let creatorPubkey: PublicKey;

    try {
      baseMintPubkey = new PublicKey(baseMint);
      creatorPubkey = new PublicKey(creator);
    } catch (error) {
      return res.status(400).json({
        error: 'Invalid PublicKey format for baseMint or creator',
      });
    }

    // Create claim creator fee transaction
    const claimTx = await createClaimCreatorFeeTransaction({
      baseMint: baseMintPubkey,
      creator: creatorPubkey,
    });

    res.status(200).json({
      success: true,
      claimTx: claimTx
        .serialize({
          requireAllSignatures: false,
          verifySignatures: false,
        })
        .toString('base64'),
    });
  } catch (error) {
    logger.error('Claim creator fee error', error instanceof Error ? error : new Error(String(error)), {
      endpoint: '/api/claim-creator-fee',
    });

    if (error instanceof Error) {
      if (error.message.includes('Pool not found')) {
        return res.status(404).json({
          error: 'Pool not found for this token. Please wait for the pool to be indexed.',
        });
      }
      if (error.message.includes('not the creator')) {
        return res.status(403).json({
          error: error.message,
        });
      }
      if (error.message.includes('No creator trading fees to claim')) {
        return res.status(400).json({
          error: error.message,
        });
      }
      return res.status(500).json({
        error: `Failed to create claim creator fee transaction: ${error.message}`,
      });
    }

    return res.status(500).json({
      error: 'Unknown error occurred while creating claim creator fee transaction',
    });
  }
}

/**
 * Create claim creator trading fee transaction
 *
 * This function:
 * 1. Gets the pool by base mint
 * 2. Verifies the provided wallet is the pool creator (poolState.account.creator)
 * 3. Gets fee metrics to determine claimable creator amounts
 * 4. Creates the claim transaction using client.creator.claimCreatorTradingFee
 */
async function createClaimCreatorFeeTransaction({
  baseMint,
  creator,
}: {
  baseMint: PublicKey;
  creator: PublicKey;
}): Promise<Transaction> {
  const connection = new Connection(config.rpcUrl, 'confirmed');
  const client = new DynamicBondingCurveClient(connection, 'confirmed');

  // Get pool by base mint
  const poolState = await client.state.getPoolByBaseMint(baseMint);
  if (!poolState) {
    throw new Error(`Pool not found for mint ${baseMint.toString()}`);
  }

  const poolAddress = poolState.publicKey;
  const poolCreator = poolState.account.creator;

  // Verify that the provided creator matches the pool state
  if (poolCreator.toString() !== creator.toString()) {
    throw new Error(
      `Wallet ${creator.toString()} is not the creator of this pool. ` +
        `Pool creator: ${poolCreator.toString()}`
    );
  }

  // Get fee metrics to determine claimable amounts
  const feeMetrics = await client.state.getPoolFeeMetrics(poolAddress);
  const creatorBaseFee = feeMetrics.current.creatorBaseFee;
  const creatorQuoteFee = feeMetrics.current.creatorQuoteFee;

  // Check if there are fees to claim
  if (creatorBaseFee.isZero() && creatorQuoteFee.isZero()) {
    throw new Error('No creator trading fees to claim');
  }

  // Create claim creator trading fee transaction
  const claimTx = await client.creator.claimCreatorTradingFee({
    creator: creator,
    pool: poolAddress,
    maxBaseAmount: creatorBaseFee,
    maxQuoteAmount: creatorQuoteFee,
    payer: creator,
  });

  // Set transaction properties
  const { blockhash } = await connection.getLatestBlockhash();
  claimTx.feePayer = creator;
  claimTx.recentBlockhash = blockhash;

  return claimTx;
}
