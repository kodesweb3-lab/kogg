import { PublicKey } from '@solana/web3.js';

/**
 * Default DBC config key
 * 
 * This config key enforces:
 * - quoteMint: wSOL (So11111111111111111111111111111111111111112)
 * - feeClaimer: Treasury (5hDrp6eTjMKrUFx96wqeQHhXNa7zvp3ba1Z9nTY3tBjA)
 * - leftoverReceiver: Treasury (5hDrp6eTjMKrUFx96wqeQHhXNa7zvp3ba1Z9nTY3tBjA)
 * - Trading fee: 1.5% (150 bps)
 * - creatorTradingFeePercentage: 0% (all fees to partner/treasury)
 */
export const DEFAULT_POOL_CONFIG_KEY = 'GvoZ6trCqQhNWiDnS5x27XE5tTyKhGepn4dcqg9bLpmL';

/**
 * Application configuration loaded from environment variables
 */
export interface AppConfig {
  rpcUrl: string;
  poolConfigKey: string;
  pinataJwt?: string;
}

/**
 * Validates that a string is a valid Solana public key
 */
function isValidPublicKey(key: string): boolean {
  try {
    new PublicKey(key);
    return true;
  } catch {
    return false;
  }
}

/**
 * Validates and loads application configuration from environment variables
 * @throws Error if required environment variables are missing or invalid
 */
export function loadConfig(): AppConfig {
  const rpcUrl = process.env.RPC_URL;
  const poolConfigKey = process.env.POOL_CONFIG_KEY || DEFAULT_POOL_CONFIG_KEY;
  const pinataJwt = process.env.PINATA_JWT;

  // Validate RPC_URL
  if (!rpcUrl || rpcUrl.trim() === '') {
    throw new Error(
      'RPC_URL is required but not set. Please set RPC_URL in your .env file or environment variables.'
    );
  }

  // Validate POOL_CONFIG_KEY
  if (!isValidPublicKey(poolConfigKey)) {
    throw new Error(
      `POOL_CONFIG_KEY must be a valid Solana public key. Received: ${poolConfigKey}`
    );
  }

  return {
    rpcUrl: rpcUrl.trim(),
    poolConfigKey: poolConfigKey.trim(),
    pinataJwt: pinataJwt?.trim(),
  };
}

/**
 * Get the application configuration (singleton pattern)
 * Loads config on first access and caches it
 */
let cachedConfig: AppConfig | null = null;

export function getConfig(): AppConfig {
  if (!cachedConfig) {
    cachedConfig = loadConfig();
  }
  return cachedConfig;
}

/**
 * Reset the cached configuration (useful for testing)
 */
export function resetConfig(): void {
  cachedConfig = null;
}
