import { WolfTheme } from '@/contexts/WolfThemeProvider';

export type MicrocopyKey = 'pending' | 'success' | 'error' | 'loading' | 'confirm';

export const microcopy: Record<MicrocopyKey, Record<NonNullable<WolfTheme> | 'default', string>> = {
  pending: {
    fire: 'The forge burns...',
    frost: 'The chain calculates...',
    blood: 'The ritual begins...',
    moon: 'The path awakens...',
    stone: 'The foundation forms...',
    default: 'The chain listens...',
  },
  loading: {
    fire: 'Igniting the forge...',
    frost: 'Processing...',
    blood: 'Binding the pact...',
    moon: 'Ascending...',
    stone: 'Building...',
    default: 'The chain listens...',
  },
  success: {
    fire: 'The flame ignites.',
    frost: 'The seal holds.',
    blood: 'The pact is sealed.',
    moon: 'The path opens.',
    stone: 'The foundation stands.',
    default: 'The seal holds.',
  },
  error: {
    fire: 'The ritual failed. The forge cools.',
    frost: 'The ritual failed. The chain broke.',
    blood: 'The ritual failed. The pact was broken.',
    moon: 'The ritual failed. The path closed.',
    stone: 'The ritual failed. The foundation crumbled.',
    default: 'The ritual failed. Gas was not enough.',
  },
  confirm: {
    fire: 'The pact is sealed.',
    frost: 'The seal holds.',
    blood: 'The bond is forged.',
    moon: 'The path is chosen.',
    stone: 'The foundation is set.',
    default: 'The pact is sealed.',
  },
};

export function getMicrocopy(key: MicrocopyKey, wolfTheme?: WolfTheme | null): string {
  const theme = (wolfTheme || 'default') as NonNullable<WolfTheme> | 'default';
  return microcopy[key]?.[theme] || microcopy[key]?.default || '';
}
