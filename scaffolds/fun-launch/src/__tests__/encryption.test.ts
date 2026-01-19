import { encrypt, decrypt } from '@/lib/encryption';

describe('Encryption Module', () => {
  const originalKey = process.env.ENCRYPTION_KEY;

  beforeAll(() => {
    // Set a test encryption key
    process.env.ENCRYPTION_KEY = 'test-encryption-key-32-bytes-long!!';
  });

  afterAll(() => {
    // Restore original key
    if (originalKey) {
      process.env.ENCRYPTION_KEY = originalKey;
    } else {
      delete process.env.ENCRYPTION_KEY;
    }
  });

  describe('encrypt', () => {
    it('should encrypt a string', () => {
      const plaintext = 'test-bot-token-12345';
      const encrypted = encrypt(plaintext);
      
      expect(encrypted).toBeDefined();
      expect(encrypted).not.toBe(plaintext);
      expect(typeof encrypted).toBe('string');
    });

    it('should produce different ciphertext for same plaintext (nonce uniqueness)', () => {
      const plaintext = 'test-bot-token-12345';
      const encrypted1 = encrypt(plaintext);
      const encrypted2 = encrypt(plaintext);
      
      // Should be different due to random nonce
      expect(encrypted1).not.toBe(encrypted2);
    });

    it('should handle empty string', () => {
      const plaintext = '';
      const encrypted = encrypt(plaintext);
      expect(encrypted).toBeDefined();
    });

    it('should handle long strings', () => {
      const plaintext = 'a'.repeat(1000);
      const encrypted = encrypt(plaintext);
      expect(encrypted).toBeDefined();
    });
  });

  describe('decrypt', () => {
    it('should decrypt encrypted string', () => {
      const plaintext = 'test-bot-token-12345';
      const encrypted = encrypt(plaintext);
      const decrypted = decrypt(encrypted);
      
      expect(decrypted).toBe(plaintext);
    });

    it('should decrypt multiple encryptions of same plaintext', () => {
      const plaintext = 'test-bot-token-12345';
      const encrypted1 = encrypt(plaintext);
      const encrypted2 = encrypt(plaintext);
      
      expect(decrypt(encrypted1)).toBe(plaintext);
      expect(decrypt(encrypted2)).toBe(plaintext);
    });

    it('should handle empty string encryption/decryption', () => {
      const plaintext = '';
      const encrypted = encrypt(plaintext);
      const decrypted = decrypt(encrypted);
      
      expect(decrypted).toBe(plaintext);
    });

    it('should throw error on invalid ciphertext', () => {
      const invalidCiphertext = 'invalid-ciphertext';
      
      expect(() => decrypt(invalidCiphertext)).toThrow();
    });

    it('should throw error on tampered ciphertext', () => {
      const plaintext = 'test-bot-token-12345';
      const encrypted = encrypt(plaintext);
      const tampered = encrypted.slice(0, -5) + 'XXXXX';
      
      expect(() => decrypt(tampered)).toThrow();
    });

    it('should throw error on wrong encryption key', () => {
      const plaintext = 'test-bot-token-12345';
      const encrypted = encrypt(plaintext);
      
      // Change encryption key
      process.env.ENCRYPTION_KEY = 'different-key-32-bytes-long!!!';
      
      expect(() => decrypt(encrypted)).toThrow();
      
      // Restore key
      process.env.ENCRYPTION_KEY = 'test-encryption-key-32-bytes-long!!';
    });
  });

  describe('round-trip encryption', () => {
    it('should encrypt and decrypt various strings', () => {
      const testCases = [
        'simple-token',
        '1234567890',
        'token-with-special-chars-!@#$%',
        'very-long-token-' + 'a'.repeat(500),
        'unicode-token-🚀-🔥',
      ];

      testCases.forEach((plaintext) => {
        const encrypted = encrypt(plaintext);
        const decrypted = decrypt(encrypted);
        expect(decrypted).toBe(plaintext);
      });
    });
  });
});
