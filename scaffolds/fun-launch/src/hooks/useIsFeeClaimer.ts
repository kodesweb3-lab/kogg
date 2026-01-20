import { useQuery } from '@tanstack/react-query';
import { useWallet } from '@jup-ag/wallet-adapter';
import { PublicKey } from '@solana/web3.js';
import { DynamicBondingCurveClient } from '@meteora-ag/dynamic-bonding-curve-sdk';
import { Connection } from '@solana/web3.js';
import { getConfig } from '@/lib/config';

/**
 * Hook to check if the connected wallet is the feeClaimer for a given token pool
 * @param baseMint - The base mint address of the token (optional)
 * @returns Object with isFeeClaimer boolean and isLoading state
 */
export function useIsFeeClaimer(baseMint?: string) {
  const { publicKey } = useWallet();

  const { data: isFeeClaimer, isLoading } = useQuery({
    queryKey: ['isFeeClaimer', publicKey?.toBase58(), baseMint],
    queryFn: async () => {
      if (!publicKey || !baseMint) {
        return false;
      }

      try {
        const config = getConfig();
        const connection = new Connection(config.rpcUrl, 'confirmed');
        const client = new DynamicBondingCurveClient(connection, 'confirmed');

        // Get pool by base mint
        const poolState = await client.state.getPoolByBaseMint(new PublicKey(baseMint));
        if (!poolState) {
          return false;
        }

        // Get pool config to check feeClaimer
        const dbcConfigAddress = poolState.account.config;
        const poolConfig = await client.state.getPoolConfig(dbcConfigAddress);
        if (!poolConfig) {
          return false;
        }

        // Check if connected wallet matches feeClaimer
        const authorizedFeeClaimer = poolConfig.feeClaimer;
        return authorizedFeeClaimer.toString() === publicKey.toString();
      } catch (error) {
        console.error('Error checking feeClaimer:', error);
        return false;
      }
    },
    enabled: !!publicKey && !!baseMint,
    staleTime: 5 * 60 * 1000, // Cache for 5 minutes
  });

  return {
    isFeeClaimer: isFeeClaimer ?? false,
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

  const { data: isFeeClaimer, isLoading } = useQuery({
    queryKey: ['isPlatformFeeClaimer', publicKey?.toBase58()],
    queryFn: async () => {
      if (!publicKey) {
        return false;
      }

      try {
        const config = getConfig();
        const connection = new Connection(config.rpcUrl, 'confirmed');
        const client = new DynamicBondingCurveClient(connection, 'confirmed');

        // Get config from POOL_CONFIG_KEY
        const poolConfig = await client.state.getPoolConfig(new PublicKey(config.poolConfigKey));
        if (!poolConfig) {
          return false;
        }

        // Check if connected wallet matches feeClaimer
        const authorizedFeeClaimer = poolConfig.feeClaimer;
        return authorizedFeeClaimer.toString() === publicKey.toString();
      } catch (error) {
        console.error('Error checking platform feeClaimer:', error);
        return false;
      }
    },
    enabled: !!publicKey,
    staleTime: 5 * 60 * 1000, // Cache for 5 minutes
  });

  return {
    isFeeClaimer: isFeeClaimer ?? false,
    isLoading,
  };
}
