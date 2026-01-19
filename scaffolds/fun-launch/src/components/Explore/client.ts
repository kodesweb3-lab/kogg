import ky, { Options } from 'ky';
import {
  GetChartRequest,
  GetChartResponse,
  GetGemsTokenListIndividualResponse,
  GetGemsTokenListRequest,
  GetTokenDescriptionResponse,
  GetTokenRequest,
  GetTokenResponse,
  GetTopHoldersResponse,
  GetTxsRequest,
  GetTxsResponse,
  Pool,
} from './types';
import { serializeParams } from '@/lib/utils';

const BASE_URL = 'https://datapi.jup.ag';

// Transform local DB token to Pool format for consistency
function transformLocalTokenToPool(token: any): Pool {
  const metrics = token.metrics?.[0];
  const createdAt = typeof token.createdAt === 'string' 
    ? token.createdAt 
    : new Date(token.createdAt).toISOString();

  return {
    id: token.dbcPool || token.mint,
    chain: 'solana',
    dex: 'met-dbc',
    type: 'bonding-curve',
    createdAt,
    bondingCurve: undefined,
    volume24h: metrics?.vol24h || undefined,
    isUnreliable: false,
    updatedAt: createdAt,
    baseAsset: {
      id: token.mint,
      name: token.name,
      symbol: token.symbol,
      icon: token.imageUrl || undefined,
      decimals: 9,
      tokenProgram: 'TokenkegQfeZyiNwAJbNbGKPFXCWuBvf9Ss623VQ5DA',
      launchpad: 'met-dbc',
      dev: token.creatorWallet,
      holderCount: metrics?.holders || undefined,
      mcap: metrics?.mcap || undefined,
      usdPrice: metrics?.price || undefined,
      organicScoreLabel: 'medium',
    },
    streamed: false,
  };
}

export class ApeClient {
  static async getGemsTokenList<T extends GetGemsTokenListRequest>(
    req: T,
    options?: Options
  ): Promise<{
    [K in keyof T]: undefined extends T[K]
      ? GetGemsTokenListIndividualResponse | undefined
      : GetGemsTokenListIndividualResponse;
  }> {
    return ky
      .post(`${BASE_URL}/v1/pools/gems`, {
        json: req,
        ...options,
      })
      .json();
  }

  // Try local database first, then fallback to Jupiter
  static async getToken(req: GetTokenRequest, options?: Options): Promise<GetTokenResponse> {
    // First, try to get from local database
    try {
      const localRes = await ky.get(`/api/tokens/${req.id}`, {
        timeout: 5000,
        ...options,
      }).json<{ success: boolean; data: any }>();

      if (localRes.success && localRes.data) {
        const pool = transformLocalTokenToPool(localRes.data);
        return { pools: [pool] };
      }
    } catch (localError) {
      // Local not found, try Jupiter
      console.log('[ApeClient] Token not in local DB, trying Jupiter...', req.id);
    }

    // Fallback to Jupiter API for tokens not in our DB
    try {
      return await ky
        .get(`${BASE_URL}/v1/pools`, {
          searchParams: serializeParams({
            assetIds: [req.id],
          }),
          timeout: 10000,
          ...options,
        })
        .json();
    } catch (jupiterError) {
      console.error('[ApeClient] Jupiter API also failed:', jupiterError);
      // Return empty response to avoid crash
      return { pools: [] };
    }
  }

  static async getTokenHolders(assetId: string, options?: Options): Promise<GetTopHoldersResponse> {
    return ky.get(`${BASE_URL}/v1/holders/${assetId}`, options).json();
  }

  static async getChart(
    assetId: string,
    params: GetChartRequest,
    options?: Options
  ): Promise<GetChartResponse> {
    return ky
      .get(`${BASE_URL}/v2/charts/${assetId}`, {
        searchParams: serializeParams(params),
        ...options,
      })
      .json();
  }

  static async getTokenTxs(
    assetId: string,
    req: GetTxsRequest,
    options?: Options
  ): Promise<GetTxsResponse> {
    return ky
      .get(`${BASE_URL}/v1/txs/${assetId}`, {
        searchParams: serializeParams(req),
        ...options,
      })
      .json();
  }

  static async getTokenDescription(
    assetId: string,
    options?: Options
  ): Promise<GetTokenDescriptionResponse> {
    return ky.get(`${BASE_URL}/v1/assets/${assetId}/description`, options).json();
  }
}
