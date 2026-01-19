import { useRouter } from 'next/router';
import { NATIVE_MINT } from '@solana/spl-token';
import { ApeQueries, QueryData, TokenInfoQueryData } from '@/components/Explore/queries';
import { useQuery } from '@tanstack/react-query';
import { formatPoolAsTokenInfo } from '@/components/Explore/pool-utils';

export function useTokenAddress() {
  const router = useRouter();
  
  // Wait for router to be ready (fixes mobile hydration issues)
  if (!router.isReady) {
    return undefined;
  }
  
  const { tokenId } = router.query;
  
  // Only return address if we have a valid tokenId from the route
  if (!tokenId) {
    return undefined;
  }
  
  const address = Array.isArray(tokenId) ? tokenId[0] : tokenId;
  return address;
}

export function usePageTokenInfo<T = TokenInfoQueryData>(select?: (data: TokenInfoQueryData) => T) {
  const tokenId = useTokenAddress();
  return useQuery({
    ...ApeQueries.tokenInfo({ id: tokenId || '' }),
    refetchInterval: 60 * 1000,
    enabled: !!tokenId,
    select,
  });
}

export function useTokenInfo<T = QueryData<typeof ApeQueries.tokenInfo>>(
  select?: (data: QueryData<typeof ApeQueries.tokenInfo>) => T
) {
  const tokenId = useTokenAddress();
  return useQuery({
    ...ApeQueries.tokenInfo({ id: tokenId || '' }),
    refetchInterval: 60 * 1000,
    enabled: !!tokenId,
    select,
  });
}

export function useHolders() {
  const address = useTokenAddress();
  return useQuery({
    ...ApeQueries.tokenHolders({ id: address || '' }),
    refetchInterval: 5 * 1000,
    enabled: !!address,
  });
}

export function usePoolMinimalTokenInfo() {
  const tokenId = useTokenAddress();
  return useQuery({
    ...ApeQueries.tokenInfo({ id: tokenId || '' }),
    enabled: !!tokenId,
    select: (pool) => {
      if (!pool) {
        return;
      }
      return formatPoolAsTokenInfo(pool);
    },
    refetchInterval: 60 * 1000,
  });
}

export function useMinimalTokenInfo() {
  const main = usePoolMinimalTokenInfo();
  return main;
}
