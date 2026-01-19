import { ApeClient } from '@/components/Explore/client';
import {
  GetGemsTokenListRequest,
  GetTxsResponse,
  ResolvedTokenListFilters,
  TokenListFilters,
  TokenListSortBy,
  TokenListSortDir,
  TokenListTimeframe,
  resolveTokenListFilters,
} from './types';
import { ExtractQueryData } from '@/types/fancytypes';
import ky from 'ky';

export type QueryData<T> = T extends (...args: infer OptionsArgs) => {
  queryFn: (...args: infer Args) => Promise<infer R>;
}
  ? R
  : never;

export type GemsTokenListQueryArgs = {
  [list in keyof GetGemsTokenListRequest]: {
    timeframe: TokenListTimeframe;
    filters?: TokenListFilters;
  };
};

export type TokenInfoQueryData = ExtractQueryData<typeof ApeQueries.tokenInfo>;

// TODO: upgrade to `queryOptions` helper in react query v5
// TODO: move this to a centralised file close to the `useQuery` hooks these are called in

// We include args in the query fn return so know args when mutating queries
export const ApeQueries = {
  gemsTokenList: (args: GemsTokenListQueryArgs) => {
    const req = {
      recent: args.recent
        ? {
            timeframe: args.recent.timeframe,
            ...resolveTokenListFilters(args.recent.filters),
          }
        : undefined,
      graduated: args.graduated
        ? {
            timeframe: args.graduated.timeframe,
            ...resolveTokenListFilters(args.graduated.filters),
          }
        : undefined,
      aboutToGraduate: args.aboutToGraduate
        ? {
            timeframe: args.aboutToGraduate.timeframe,
            ...resolveTokenListFilters(args.aboutToGraduate.filters),
          }
        : undefined,
    };

    return {
      queryKey: ['explore', 'gems', args],
      queryFn: async () => {
        const res = await ApeClient.getGemsTokenList(req);
        return Object.assign(res, { args });
      },
    };
  },
  tokenInfo: (args: { id: string }) => {
    return {
      queryKey: ['explore', 'token', args.id, 'info'],
      queryFn: async () => {
        const info = await ApeClient.getToken({ id: args.id });
        if (!info?.pools[0]) {
          throw new Error('No token info found');
        }
        const pool = info?.pools[0];

        // Add frontend fields

        return {
          ...pool,
          bondingCurveId: null as any,
        };
      },
    };
  },
  tokenHolders: (args: { id: string }) => {
    return {
      queryKey: ['explore', 'token', args.id, 'holders'],
      queryFn: async () => {
        const res = await ApeClient.getTokenHolders(args.id);
        return Object.assign(res, { args });
      },
    };
  },
  tokenDescription: (args: { id: string }) => {
    return {
      queryKey: ['explore', 'token', args.id, 'description'],
      queryFn: async () => {
        const res = await ApeClient.getTokenDescription(args.id);
        return res;
      },
    };
  },
  tokenTxs: (args: { id: string }) => {
    return {
      queryKey: ['explore', 'token', args.id, 'txs'],
      queryFn: async ({ signal, pageParam }: any) => {
        const res = await ApeClient.getTokenTxs(
          args.id,
          pageParam
            ? {
                ...pageParam,
              }
            : {},
          { signal }
        );
        return Object.assign(res, {
          args,
        });
      },
      // This gets passed as `pageParam`
      getNextPageParam: (lastPage: GetTxsResponse) => {
        // TODO: update to use BE api response when its returned
        if (lastPage?.txs.length === 0) {
          return;
        }
        const lastTs = lastPage?.txs[lastPage?.txs.length - 1]?.timestamp;
        return {
          offset: lastPage?.next,
          offsetTs: lastTs,
        };
      },
    };
  },
  // Local database tokens query
  localTokens: (args: {
    page?: number;
    limit?: number;
    sortBy?: 'createdAt' | 'name' | 'symbol' | 'mint';
    sortOrder?: 'asc' | 'desc';
    search?: string;
    creatorWallet?: string;
  }) => {
    return {
      queryKey: ['explore', 'local-tokens', args],
      queryFn: async () => {
        const params = new URLSearchParams();
        if (args.page) params.set('page', args.page.toString());
        if (args.limit) params.set('limit', args.limit.toString());
        if (args.sortBy) params.set('sortBy', args.sortBy);
        if (args.sortOrder) params.set('sortOrder', args.sortOrder);
        if (args.search) params.set('search', args.search);
        if (args.creatorWallet) params.set('creatorWallet', args.creatorWallet);

        const res = await ky.get(`/api/tokens?${params.toString()}`).json<{
          success: boolean;
          data: any[];
          pagination: {
            page: number;
            limit: number;
            total: number;
            totalPages: number;
          };
        }>();
        return Object.assign(res, { args });
      },
    };
  },
};
