import { NextApiRequest, NextApiResponse } from 'next';
import { Connection, PublicKey, Transaction } from '@solana/web3.js';
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
type ClaimPartnerFeeRequest = {
  baseMint: string;      // Token mint address
  feeClaimer: string;    // Wallet address of the fee claimer (must match pool config)
  receiver?: string;     // Optional receiver wallet (defaults to feeClaimer)
};

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  try {
    const { baseMint, feeClaimer, receiver } = req.body as ClaimPartnerFeeRequest;

    // Validate required fields
    if (!baseMint || !feeClaimer) {
      return res.status(400).json({ 
        error: 'Missing required fields: baseMint and feeClaimer are required' 
      });
    }

    // Validate PublicKey formats
    let baseMintPubkey: PublicKey;
    let feeClaimerPubkey: PublicKey;
    let receiverPubkey: PublicKey | undefined;

    try {
      baseMintPubkey = new PublicKey(baseMint);
      feeClaimerPubkey = new PublicKey(feeClaimer);
      if (receiver) {
        receiverPubkey = new PublicKey(receiver);
      }
    } catch (error) {
      return res.status(400).json({ 
        error: 'Invalid PublicKey format for baseMint, feeClaimer, or receiver' 
      });
    }

    // Create claim partner fee transaction
    const claimTx = await createClaimPartnerFeeTransaction({
      baseMint: baseMintPubkey,
      feeClaimer: feeClaimerPubkey,
      receiver: receiverPubkey,
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
    logger.error('Claim partner fee error', error instanceof Error ? error : new Error(String(error)), {
      endpoint: '/api/claim-partner-fee',
    });
    
    if (error instanceof Error) {
      if (error.message.includes('Pool not found')) {
        return res.status(404).json({ 
          error: 'Pool not found for this token. Please wait for the pool to be indexed.' 
        });
      }
      if (error.message.includes('not the authorized fee claimer')) {
        return res.status(403).json({ 
          error: error.message 
        });
      }
      if (error.message.includes('No partner trading fees to claim')) {
        return res.status(400).json({ 
          error: error.message 
        });
      }
      return res.status(500).json({ 
        error: `Failed to create claim partner fee transaction: ${error.message}` 
      });
    }
    
    return res.status(500).json({ 
      error: 'Unknown error occurred while creating claim partner fee transaction' 
    });
  }
}

/**
 * Create claim partner trading fee transaction
 * 
 * This function:
 * 1. Gets the pool by base mint
 * 2. Gets the pool config to verify feeClaimer
 * 3. Gets fee metrics to determine claimable amounts
 * 4. Creates the claim transaction using client.partner.claimPartnerTradingFee
 */
async function createClaimPartnerFeeTransaction({
  baseMint,
  feeClaimer,
  receiver,
}: {
  baseMint: PublicKey;
  feeClaimer: PublicKey;
  receiver?: PublicKey;
}): Promise<Transaction> {
  const connection = new Connection(config.rpcUrl, 'confirmed');
  const client = new DynamicBondingCurveClient(connection, 'confirmed');

  // Get pool by base mint
  const poolState = await client.state.getPoolByBaseMint(baseMint);
  if (!poolState) {
    throw new Error(`Pool not found for mint ${baseMint.toString()}`);
  }

  const poolAddress = poolState.publicKey;
  const dbcConfigAddress = poolState.account.config;
  
  // Get pool config to verify feeClaimer
  const poolConfig = await client.state.getPoolConfig(dbcConfigAddress);
  if (!poolConfig) {
    throw new Error(`Pool config not found for ${dbcConfigAddress.toString()}`);
  }

  // Verify that the provided feeClaimer matches the pool config
  const authorizedFeeClaimer = poolConfig.feeClaimer;
  if (authorizedFeeClaimer.toString() !== feeClaimer.toString()) {
    throw new Error(
      `Wallet ${feeClaimer.toString()} is not the authorized fee claimer for this pool. ` +
      `Authorized fee claimer: ${authorizedFeeClaimer.toString()}`
    );
  }

  // Get fee metrics to determine claimable amounts
  const feeMetrics = await client.state.getPoolFeeMetrics(poolAddress);
  const partnerBaseFee = feeMetrics.current.partnerBaseFee;
  const partnerQuoteFee = feeMetrics.current.partnerQuoteFee;

  // Check if there are fees to claim
  if (partnerBaseFee.isZero() && partnerQuoteFee.isZero()) {
    throw new Error('No partner trading fees to claim');
  }

  // Use receiver if provided, otherwise default to feeClaimer
  const receiverWallet = receiver || feeClaimer;

  // Create claim partner trading fee transaction
  const claimTx = await client.partner.claimPartnerTradingFee({
    pool: poolAddress,
    feeClaimer: feeClaimer,
    payer: feeClaimer,
    maxBaseAmount: partnerBaseFee,
    maxQuoteAmount: partnerQuoteFee,
    receiver: receiverWallet,
  });

  // Set transaction properties
  const { blockhash } = await connection.getLatestBlockhash();
  claimTx.feePayer = feeClaimer;
  claimTx.recentBlockhash = blockhash;

  return claimTx;
}
