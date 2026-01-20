import { useQuery } from '@tanstack/react-query';
import { useWallet } from '@jup-ag/wallet-adapter';

/**
 * Hook to check if the connected wallet is the feeClaimer for a given token pool
 * @param baseMint - The base mint address of the token (optional)
 * @returns Object with isFeeClaimer boolean and isLoading state
 */
export function useIsFeeClaimer(baseMint?: string) {
  const { publicKey } = useWallet();

  const { data, isLoading, error } = useQuery<{ success: boolean; isFeeClaimer: boolean }>({
    queryKey: ['isFeeClaimer', publicKey?.toBase58(), baseMint],
    queryFn: async () => {
      if (!publicKey || !baseMint) {
        return { success: false, isFeeClaimer: false };
      }

      try {
        const response = await fetch('/api/check-fee-claimer', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            wallet: publicKey.toBase58(),
            baseMint,
          }),
        });

        if (!response.ok) {
          return { success: false, isFeeClaimer: false };
        }

        const result = await response.json();
        // Ensure we return a valid object
        if (result && typeof result === 'object' && 'isFeeClaimer' in result) {
          return { success: result.success ?? true, isFeeClaimer: Boolean(result.isFeeClaimer) };
        }
        return { success: false, isFeeClaimer: false };
      } catch (error) {
        console.error('Error checking feeClaimer:', error);
        return { success: false, isFeeClaimer: false };
      }
    },
    enabled: !!publicKey && !!baseMint,
    staleTime: 5 * 60 * 1000, // Cache for 5 minutes
    retry: 1,
    retryDelay: 1000,
  });

  // Handle errors gracefully
  if (error) {
    console.error('useIsFeeClaimer error:', error);
  }

  return {
    isFeeClaimer: data?.isFeeClaimer ?? false,
    isLoading,
  };
}

/**
 * Hook to check if the connected wallet is the feeClaimer for the platform
 * by checking the POOL_CONFIG_KEY
 * @returns Object with isFeeClaimer boolean and isLoading state
 */
export function useIsPlatformFeeClaimer() {
  const { publicKey } = useWallet();

  const { data, isLoading, error } = useQuery<{ success: boolean; isFeeClaimer: boolean }>({
    queryKey: ['isPlatformFeeClaimer', publicKey?.toBase58()],
    queryFn: async () => {
      if (!publicKey) {
        return { success: false, isFeeClaimer: false };
      }

      try {
        const response = await fetch('/api/check-fee-claimer', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            wallet: publicKey.toBase58(),
          }),
        });

        if (!response.ok) {
          return { success: false, isFeeClaimer: false };
        }

        const result = await response.json();
        // Ensure we return a valid object
        if (result && typeof result === 'object' && 'isFeeClaimer' in result) {
          return { success: result.success ?? true, isFeeClaimer: Boolean(result.isFeeClaimer) };
        }
        return { success: false, isFeeClaimer: false };
      } catch (error) {
        console.error('Error checking platform feeClaimer:', error);
        return { success: false, isFeeClaimer: false };
      }
    },
    enabled: !!publicKey,
    staleTime: 5 * 60 * 1000, // Cache for 5 minutes
    retry: 1,
    retryDelay: 1000,
  });

  // Handle errors gracefully
  if (error) {
    console.error('useIsPlatformFeeClaimer error:', error);
  }

  return {
    isFeeClaimer: data?.isFeeClaimer ?? false,
    isLoading,
  };
}
