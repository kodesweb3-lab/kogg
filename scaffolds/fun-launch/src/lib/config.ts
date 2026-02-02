import { PublicKey } from '@solana/web3.js';

/**
 * Default DBC config key (partner program)
 * Set via POOL_CONFIG_KEY env to override. New pools use this config (feeClaimer, creatorTradingFeePercentage, etc.).
 */
export const DEFAULT_POOL_CONFIG_KEY = 'BySD2vRKkCPmaH5A5MH3k5quRe8V23yhk9cKKTR5sv5t';

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
