/** Base URL for the Kogaion launchpad. Used in metadata, referral, Twitter flows, and agent docs. */
export const BASE_URL = process.env.NEXT_PUBLIC_BASE_URL || 'https://kogaion.fun';

export const StorageKey = {
  INTEL_EXPLORER_FILTERS_CONFIG: 'intel_explorer_filters_config',
} as const;
export type StorageKey = (typeof StorageKey)[keyof typeof StorageKey];
