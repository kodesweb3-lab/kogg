import { Connection, PublicKey } from '@solana/web3.js';
import { DynamicBondingCurveClient } from '@meteora-ag/dynamic-bonding-curve-sdk';
import { getConfig } from '@/lib/config';

/**
 * Check if a wallet address is the authorized feeClaimer for the platform
 * This function can be used server-side (e.g., in getServerSideProps)
 * 
 * @param walletAddress - The wallet address to check (as string)
 * @param baseMint - Optional: specific token mint address to check for that pool
 * @returns Promise<{ isFeeClaimer: boolean }>
 */
export async function checkFeeClaimer(
  walletAddress: string,
  baseMint?: string
): Promise<{ isFeeClaimer: boolean }> {
  try {
    // Load configuration
    const config = getConfig();

    // Validate PublicKey format
    let walletPubkey: PublicKey;
    let baseMintPubkey: PublicKey | undefined;

    try {
      walletPubkey = new PublicKey(walletAddress);
      if (baseMint) {
        baseMintPubkey = new PublicKey(baseMint);
      }
    } catch (error) {
      // Invalid PublicKey format
      return { isFeeClaimer: false };
    }

    const connection = new Connection(config.rpcUrl, 'confirmed');
    const client = new DynamicBondingCurveClient(connection, 'confirmed');

    let isFeeClaimer = false;

    if (baseMintPubkey) {
      // Check for specific token pool
      const poolState = await client.state.getPoolByBaseMint(baseMintPubkey);
      if (!poolState) {
        return { isFeeClaimer: false };
      }

      const dbcConfigAddress = poolState.account.config;
      const poolConfig = await client.state.getPoolConfig(dbcConfigAddress);
      if (!poolConfig) {
        return { isFeeClaimer: false };
      }

      const authorizedFeeClaimer = poolConfig.feeClaimer;
      isFeeClaimer = authorizedFeeClaimer.toString() === walletPubkey.toString();
    } else {
      // Check for platform feeClaimer (POOL_CONFIG_KEY)
      const poolConfig = await client.state.getPoolConfig(new PublicKey(config.poolConfigKey));
      if (!poolConfig) {
        return { isFeeClaimer: false };
      }

      const authorizedFeeClaimer = poolConfig.feeClaimer;
      isFeeClaimer = authorizedFeeClaimer.toString() === walletPubkey.toString();
    }

    return { isFeeClaimer };
  } catch (error) {
    // On any error, return false (fail-safe)
    console.error('Error checking fee claimer:', error);
    return { isFeeClaimer: false };
  }
}
