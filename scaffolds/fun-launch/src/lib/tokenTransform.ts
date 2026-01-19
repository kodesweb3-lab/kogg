import { Pool } from '@/contexts/types';

type DbToken = {
  id: string;
  mint: string;
  name: string;
  symbol: string;
  imageUrl: string | null;
  metadataUri: string;
  dbcPool: string | null;
  creatorWallet: string;
  configKey: string;
  createdAt: Date;
  metrics: Array<{
    price: number | null;
    mcap: number | null;
    vol24h: number | null;
    holders: number | null;
  }> | null;
};

/**
 * Transform database token to Pool format for frontend
 */
export function transformDbTokenToPool(token: DbToken): Pool {
  // Get first metric (should be unique per tokenMint)
  const metrics = token.metrics && token.metrics.length > 0 ? token.metrics[0] : null;
  
  return {
    id: token.dbcPool || token.mint,
    chain: 'solana',
    dex: 'met-dbc',
    type: 'bonding-curve',
    createdAt: token.createdAt.toISOString(),
    bondingCurve: undefined,
    volume24h: metrics?.vol24h || undefined,
    isUnreliable: false,
    updatedAt: token.createdAt.toISOString(),
    baseAsset: {
      id: token.mint,
      name: token.name,
      symbol: token.symbol,
      icon: token.imageUrl || undefined,
      decimals: 9, // Default for Solana tokens
      tokenProgram: 'TokenkegQfeZyiNwAJbNbGKPFXCWuBvf9Ss623VQ5DA',
      launchpad: 'met-dbc',
      holderCount: metrics?.holders || undefined,
      mcap: metrics?.mcap || undefined,
      usdPrice: metrics?.price || undefined,
      organicScoreLabel: 'medium',
    },
    streamed: false,
  };
}
