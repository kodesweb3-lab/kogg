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

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  if (req.method !== 'GET') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  try {
    const { baseMint } = req.query;

    if (!baseMint || typeof baseMint !== 'string') {
      return res.status(400).json({
        error: 'Query parameter baseMint is required',
      });
    }

    let baseMintPubkey: PublicKey;
    try {
      baseMintPubkey = new PublicKey(baseMint);
    } catch (error) {
      return res.status(400).json({
        error: 'Invalid PublicKey format for baseMint',
      });
    }

    const connection = new Connection(config.rpcUrl, 'confirmed');
    const client = new DynamicBondingCurveClient(connection, 'confirmed');

    const poolState = await client.state.getPoolByBaseMint(baseMintPubkey);
    if (!poolState) {
      return res.status(404).json({
        error: 'Pool not found for this token.',
      });
    }

    const poolAddress = poolState.publicKey;
    const feeMetrics = await client.state.getPoolFeeMetrics(poolAddress);

    // BN values to string for JSON (raw lamports / base units)
    res.status(200).json({
      success: true,
      creatorBaseFee: feeMetrics.current.creatorBaseFee.toString(),
      creatorQuoteFee: feeMetrics.current.creatorQuoteFee.toString(),
      partnerBaseFee: feeMetrics.current.partnerBaseFee.toString(),
      partnerQuoteFee: feeMetrics.current.partnerQuoteFee.toString(),
    });
  } catch (error) {
    logger.error('Pool fee metrics error', error instanceof Error ? error : new Error(String(error)), {
      endpoint: '/api/pool-fee-metrics',
    });
    return res.status(500).json({
      error: 'Failed to fetch pool fee metrics',
    });
  }
}
