import { NextApiRequest, NextApiResponse } from 'next';
import { Connection, PublicKey } from '@solana/web3.js';
import { DynamicBondingCurveClient } from '@meteora-ag/dynamic-bonding-curve-sdk';
import { getConfig } from '@/lib/config';
import { logger } from '@/lib/logger';

// Load and validate configuration
let config: ReturnType<typeof getConfig>;
try {
  config = getConfig();
} catch (error) {
  logger.error('Configuration error', error instanceof Error ? error : new Error(String(error)));
  throw error;
}

// Types
type CreatePoolTransactionRequest = {
  mint: string;
  tokenName: string;
  tokenSymbol: string;
  metadataUri: string;
  userWallet: string;
};

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  try {
    const { mint, tokenName, tokenSymbol, metadataUri, userWallet } = req.body as CreatePoolTransactionRequest;

    // Validate required fields
    if (!mint || !tokenName || !tokenSymbol || !metadataUri || !userWallet) {
      return res.status(400).json({ 
        error: 'Missing required fields: mint, tokenName, tokenSymbol, metadataUri, and userWallet are required' 
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

    // Validate metadataUri format
    if (!metadataUri.startsWith('http://') && !metadataUri.startsWith('https://') && !metadataUri.startsWith('ipfs://')) {
      return res.status(400).json({ 
        error: 'Invalid metadataUri format. Must be a valid HTTP/HTTPS URL or IPFS URI' 
      });
    }

    // Create pool transaction
    const poolTx = await createPoolTransaction({
      mint,
      tokenName,
      tokenSymbol,
      metadataUri,
      userWallet,
    });

    res.status(200).json({
      success: true,
      poolTx: poolTx
        .serialize({
          requireAllSignatures: false,
          verifySignatures: false,
        })
        .toString('base64'),
    });
  } catch (error) {
    logger.error('Create pool transaction error', error instanceof Error ? error : new Error(String(error)), {
      endpoint: '/api/create-pool-transaction',
    });
    
    if (error instanceof Error) {
      if (error.message.includes('RPC_URL') || error.message.includes('POOL_CONFIG_KEY') || error.message.includes('required')) {
        return res.status(500).json({ 
          error: 'Server configuration error: ' + error.message 
        });
      }
      if (error.message.includes('Invalid') || error.message.includes('PublicKey')) {
        return res.status(400).json({ 
          error: error.message 
        });
      }
      return res.status(500).json({ 
        error: `Failed to create pool transaction: ${error.message}` 
      });
    }
    
    return res.status(500).json({ 
      error: 'Unknown error occurred while creating pool transaction' 
    });
  }
}

/**
 * Create DBC pool transaction
 * 
 * The DBC config key (POOL_CONFIG_KEY) enforces:
 * - quoteMint: wSOL (So11111111111111111111111111111111111111112)
 * - feeClaimer: Treasury wallet (5hDrp6eTjMKrUFx96wqeQHhXNa7zvp3ba1Z9nTY3tBjA)
 * - leftoverReceiver: Treasury wallet
 * - Trading fee: 1.5% (150 bps) total
 * - creatorTradingFeePercentage: 0% (all fees go to partner/treasury)
 * 
 * These settings are inherited from the config key and do not need to be specified here.
 */
async function createPoolTransaction({
  mint,
  tokenName,
  tokenSymbol,
  metadataUri,
  userWallet,
}: {
  mint: string;
  tokenName: string;
  tokenSymbol: string;
  metadataUri: string;
  userWallet: string;
}) {
  const connection = new Connection(config.rpcUrl, 'confirmed');
  const client = new DynamicBondingCurveClient(connection, 'confirmed');

  const poolTx = await client.pool.createPool({
    config: new PublicKey(config.poolConfigKey),
    baseMint: new PublicKey(mint),
    name: tokenName,
    symbol: tokenSymbol,
    uri: metadataUri,
    payer: new PublicKey(userWallet),
    poolCreator: new PublicKey(userWallet),
  });

  const { blockhash } = await connection.getLatestBlockhash();
  poolTx.feePayer = new PublicKey(userWallet);
  poolTx.recentBlockhash = blockhash;

  // Optional: simulate with sigVerify: false to catch onchain failures (Phantom recommendation).
  // If the RPC doesn't support the options or returns "Invalid arguments", we still return the tx.
  try {
    const simulation = await connection.simulateTransaction(poolTx, {
      sigVerify: false,
      commitment: 'confirmed',
    } as { sigVerify?: boolean; commitment?: string });
    if (simulation.value.err) {
      logger.error('Create pool transaction simulation failed', new Error(JSON.stringify(simulation.value.err)), {
        endpoint: '/api/create-pool-transaction',
      });
      throw new Error(
        `Transaction simulation failed (tx would fail onchain): ${JSON.stringify(simulation.value.err)}`
      );
    }
  } catch (simErr) {
    const msg = simErr instanceof Error ? simErr.message : String(simErr);
    // RPC may return "Invalid arguments" if sigVerify/options not supported; don't block the flow
    if (msg.includes('Invalid arguments') || msg.includes('invalid') || msg.includes('400')) {
      logger.warn('Pool tx simulation skipped (RPC may not support options)', { endpoint: '/api/create-pool-transaction' });
    } else {
      throw simErr;
    }
  }

  return poolTx;
}
