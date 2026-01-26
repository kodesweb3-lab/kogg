import { PublicKey } from '@solana/web3.js';

/**
 * Validate Solana wallet address format
 */
export function isValidSolanaAddress(address: string): boolean {
  try {
    new PublicKey(address);
    return true;
  } catch {
    return false;
  }
}

/**
 * Validate wallet address and check if it's a valid Solana address
 */
export function validateWalletAddress(address: string): {
  valid: boolean;
  error?: string;
} {
  if (!address || typeof address !== 'string') {
    return { valid: false, error: 'Wallet address is required' };
  }

  if (address.trim().length === 0) {
    return { valid: false, error: 'Wallet address cannot be empty' };
  }

  if (!isValidSolanaAddress(address)) {
    return { valid: false, error: 'Invalid Solana wallet address format' };
  }

  return { valid: true };
}
