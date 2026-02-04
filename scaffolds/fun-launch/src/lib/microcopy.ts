export type MicrocopyKey = 'pending' | 'success' | 'error' | 'loading' | 'confirm';

export const microcopy: Record<MicrocopyKey, string> = {
  pending: 'The chain listens...',
  loading: 'The chain listens...',
  success: 'The seal holds.',
  error: 'The ritual failed. Gas was not enough.',
  confirm: 'The pact is sealed.',
};

export function getMicrocopy(key: MicrocopyKey): string {
  return microcopy[key] ?? '';
}
