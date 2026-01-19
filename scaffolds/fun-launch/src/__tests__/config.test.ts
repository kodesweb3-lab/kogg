import { loadConfig, resetConfig, DEFAULT_POOL_CONFIG_KEY } from '@/lib/config';
import { PublicKey } from '@solana/web3.js';

describe('Config Module', () => {
  beforeEach(() => {
    resetConfig();
    // Clear environment variables
    delete process.env.RPC_URL;
    delete process.env.POOL_CONFIG_KEY;
  });

  afterEach(() => {
    resetConfig();
  });

  describe('loadConfig', () => {
    it('should throw error if RPC_URL is missing', () => {
      expect(() => loadConfig()).toThrow('RPC_URL is required');
    });

    it('should throw error if RPC_URL is empty', () => {
      process.env.RPC_URL = '';
      expect(() => loadConfig()).toThrow('RPC_URL is required');
    });

    it('should throw error if RPC_URL is whitespace only', () => {
      process.env.RPC_URL = '   ';
      expect(() => loadConfig()).toThrow('RPC_URL is required');
    });

    it('should use default POOL_CONFIG_KEY if not set', () => {
      process.env.RPC_URL = 'https://api.mainnet-beta.solana.com';
      const config = loadConfig();
      expect(config.poolConfigKey).toBe(DEFAULT_POOL_CONFIG_KEY);
    });

    it('should use provided POOL_CONFIG_KEY', () => {
      process.env.RPC_URL = 'https://api.mainnet-beta.solana.com';
      process.env.POOL_CONFIG_KEY = 'TestKey123456789012345678901234567890';
      const config = loadConfig();
      expect(config.poolConfigKey).toBe('TestKey123456789012345678901234567890');
    });

    it('should throw error if POOL_CONFIG_KEY is invalid', () => {
      process.env.RPC_URL = 'https://api.mainnet-beta.solana.com';
      process.env.POOL_CONFIG_KEY = 'invalid-key';
      expect(() => loadConfig()).toThrow('POOL_CONFIG_KEY must be a valid Solana public key');
    });

    it('should trim whitespace from RPC_URL', () => {
      process.env.RPC_URL = '  https://api.mainnet-beta.solana.com  ';
      const config = loadConfig();
      expect(config.rpcUrl).toBe('https://api.mainnet-beta.solana.com');
    });

    it('should trim whitespace from POOL_CONFIG_KEY', () => {
      process.env.RPC_URL = 'https://api.mainnet-beta.solana.com';
      process.env.POOL_CONFIG_KEY = `  ${DEFAULT_POOL_CONFIG_KEY}  `;
      const config = loadConfig();
      expect(config.poolConfigKey).toBe(DEFAULT_POOL_CONFIG_KEY);
    });

    it('should validate POOL_CONFIG_KEY is a valid PublicKey', () => {
      process.env.RPC_URL = 'https://api.mainnet-beta.solana.com';
      process.env.POOL_CONFIG_KEY = DEFAULT_POOL_CONFIG_KEY;
      const config = loadConfig();
      
      // Should not throw when creating PublicKey
      expect(() => new PublicKey(config.poolConfigKey)).not.toThrow();
    });

    it('should return pinataJwt if set', () => {
      process.env.RPC_URL = 'https://api.mainnet-beta.solana.com';
      process.env.PINATA_JWT = 'test-jwt-token';
      const config = loadConfig();
      expect(config.pinataJwt).toBe('test-jwt-token');
    });

    it('should return undefined pinataJwt if not set', () => {
      process.env.RPC_URL = 'https://api.mainnet-beta.solana.com';
      const config = loadConfig();
      expect(config.pinataJwt).toBeUndefined();
    });
  });

  describe('getConfig (singleton)', () => {
    it('should cache config after first load', () => {
      process.env.RPC_URL = 'https://api.mainnet-beta.solana.com';
      const config1 = loadConfig();
      process.env.RPC_URL = 'https://different-url.com';
      const config2 = loadConfig();
      
      // Should return cached config
      expect(config1.rpcUrl).toBe(config2.rpcUrl);
    });

    it('should reset cache when resetConfig is called', () => {
      process.env.RPC_URL = 'https://api.mainnet-beta.solana.com';
      const config1 = loadConfig();
      resetConfig();
      process.env.RPC_URL = 'https://different-url.com';
      const config2 = loadConfig();
      
      // Should return new config after reset
      expect(config1.rpcUrl).not.toBe(config2.rpcUrl);
    });
  });
});
