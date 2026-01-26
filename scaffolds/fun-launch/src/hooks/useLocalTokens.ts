import { useQuery } from '@tanstack/react-query';
import { ApeQueries } from '@/components/Explore/queries';

type UseLocalTokensOptions = {
  page?: number;
  limit?: number;
  sortBy?: 'createdAt' | 'name' | 'symbol' | 'mint';
  sortOrder?: 'asc' | 'desc';
  search?: string;
  creatorWallet?: string;
  tokenType?: 'MEMECOIN' | 'RWA';
  assetType?: string;
};

export function useLocalTokens<T = any>(options: UseLocalTokensOptions = {}) {
  return useQuery({
    ...ApeQueries.localTokens(options),
    refetchInterval: 30 * 1000, // Refetch every 30 seconds
    staleTime: 0, // Always consider data stale to ensure fresh fetches
    cacheTime: 0, // Don't cache to ensure we always get latest data
  });
}
