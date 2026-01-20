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

        // Parse JSON with error handling
        let result: any;
        try {
          result = await response.json();
        } catch (parseError) {
          console.error('Error parsing JSON response:', parseError);
          return { success: false, isFeeClaimer: false };
        }

        // Strict validation: ensure result is an object with required fields
        if (
          result &&
          typeof result === 'object' &&
          !Array.isArray(result) &&
          'isFeeClaimer' in result &&
          typeof result.isFeeClaimer === 'boolean'
        ) {
          return {
            success: typeof result.success === 'boolean' ? result.success : true,
            isFeeClaimer: Boolean(result.isFeeClaimer),
          };
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
    // Prevent query from running unnecessarily
    refetchOnWindowFocus: false,
    refetchOnMount: false,
  });

  // Handle errors gracefully - ensure we never return invalid data
  // Don't log error object directly to prevent React error #130
  if (error) {
    const errorMessage = error instanceof Error ? error.message : String(error);
    console.error('useIsFeeClaimer error:', errorMessage);
  }

  // Ensure we always return primitive boolean values, never objects
  // Double-check that data is valid and extract isFeeClaimer safely
  let isFeeClaimerValue: boolean = false;
  
  if (data && typeof data === 'object' && !Array.isArray(data) && 'isFeeClaimer' in data) {
    const value = data.isFeeClaimer;
    if (typeof value === 'boolean') {
      isFeeClaimerValue = value;
    }
  }

  // Always return primitive values - never objects
  return {
    isFeeClaimer: Boolean(isFeeClaimerValue),
    isLoading: Boolean(isLoading),
  };
}

/**
 * Hook to check if the connected wallet is the feeClaimer for the platform
 * by checking the POOL_CONFIG_KEY
 * @returns Object with isFeeClaimer boolean and isLoading state
 */
export function useIsPlatformFeeClaimer() {
  const { publicKey } = useWallet();
  const walletAddress = publicKey?.toBase58();

  const { data, isLoading, error } = useQuery<{ success: boolean; isFeeClaimer: boolean }>({
    queryKey: ['isPlatformFeeClaimer', walletAddress],
    queryFn: async () => {
      if (!publicKey || !walletAddress) {
        return { success: false, isFeeClaimer: false };
      }

      try {
        const response = await fetch('/api/check-fee-claimer', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            wallet: walletAddress,
          }),
        });

        if (!response.ok) {
          return { success: false, isFeeClaimer: false };
        }

        // Parse JSON with error handling
        let result: any;
        try {
          result = await response.json();
        } catch (parseError) {
          console.error('Error parsing JSON response:', parseError);
          return { success: false, isFeeClaimer: false };
        }

        // Strict validation: ensure result is an object with required fields
        if (
          result &&
          typeof result === 'object' &&
          !Array.isArray(result) &&
          'isFeeClaimer' in result &&
          typeof result.isFeeClaimer === 'boolean'
        ) {
          return {
            success: typeof result.success === 'boolean' ? result.success : true,
            isFeeClaimer: Boolean(result.isFeeClaimer),
          };
        }
        return { success: false, isFeeClaimer: false };
      } catch (error) {
        console.error('Error checking platform feeClaimer:', error);
        return { success: false, isFeeClaimer: false };
      }
    },
    enabled: !!publicKey && !!walletAddress,
    staleTime: 5 * 60 * 1000, // Cache for 5 minutes
    retry: 1,
    retryDelay: 1000,
    // Prevent query from running if wallet is not connected
    refetchOnWindowFocus: false,
    refetchOnMount: false,
  });

  // Handle errors gracefully - ensure we never return invalid data
  // Don't log error object directly to prevent React error #130
  if (error) {
    const errorMessage = error instanceof Error ? error.message : String(error);
    console.error('useIsPlatformFeeClaimer error:', errorMessage);
  }

  // Ensure we always return primitive boolean values, never objects
  // Double-check that data is valid and extract isFeeClaimer safely
  let isFeeClaimerValue: boolean = false;
  
  if (data && typeof data === 'object' && !Array.isArray(data) && 'isFeeClaimer' in data) {
    const value = data.isFeeClaimer;
    if (typeof value === 'boolean') {
      isFeeClaimerValue = value;
    }
  }

  // Always return primitive values - never objects
  return {
    isFeeClaimer: Boolean(isFeeClaimerValue),
    isLoading: Boolean(isLoading),
  };
}
