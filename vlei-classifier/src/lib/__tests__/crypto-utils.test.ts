import { describe, it, expect } from 'vitest';
import { hashFile, hashString, truncateHash } from '../crypto-utils';

describe('crypto-utils', () => {
  describe('hashString', () => {
    it('should return 64-character hex string', async () => {
      const hash = await hashString('test data');
      expect(hash).toMatch(/^[a-f0-9]{64}$/);
      expect(hash.length).toBe(64);
    });

    it('should return consistent hash for same input', async () => {
      const hash1 = await hashString('test data');
      const hash2 = await hashString('test data');
      expect(hash1).toBe(hash2);
    });

    it('should return different hash for different input', async () => {
      const hash1 = await hashString('test data 1');
      const hash2 = await hashString('test data 2');
      expect(hash1).not.toBe(hash2);
    });

    it('should handle empty string', async () => {
      const hash = await hashString('');
      expect(hash).toMatch(/^[a-f0-9]{64}$/);
    });

    it('should handle unicode characters', async () => {
      const hash = await hashString('Hello 世界 🌍');
      expect(hash).toMatch(/^[a-f0-9]{64}$/);
    });
  });

  describe('hashFile', () => {
    it('should return 64-character hex string', async () => {
      const file = new File(['test content'], 'test.txt', { type: 'text/plain' });
      const hash = await hashFile(file);
      expect(hash).toMatch(/^[a-f0-9]{64}$/);
      expect(hash.length).toBe(64);
    });

    it('should return consistent hash for same file content', async () => {
      const file1 = new File(['test content'], 'test1.txt', { type: 'text/plain' });
      const file2 = new File(['test content'], 'test2.txt', { type: 'text/plain' });
      const hash1 = await hashFile(file1);
      const hash2 = await hashFile(file2);
      expect(hash1).toBe(hash2);
    });

    it('should return different hash for different file content', async () => {
      const file1 = new File(['content 1'], 'test1.txt', { type: 'text/plain' });
      const file2 = new File(['content 2'], 'test2.txt', { type: 'text/plain' });
      const hash1 = await hashFile(file1);
      const hash2 = await hashFile(file2);
      expect(hash1).not.toBe(hash2);
    });

    it('should handle empty file', async () => {
      const file = new File([], 'empty.txt', { type: 'text/plain' });
      const hash = await hashFile(file);
      expect(hash).toMatch(/^[a-f0-9]{64}$/);
    });

    it('should handle binary data', async () => {
      const buffer = new Uint8Array([0, 1, 2, 3, 4, 5]);
      const file = new File([buffer], 'binary.dat', { type: 'application/octet-stream' });
      const hash = await hashFile(file);
      expect(hash).toMatch(/^[a-f0-9]{64}$/);
    });

    it('should handle large files', async () => {
      const largeContent = 'x'.repeat(10000);
      const file = new File([largeContent], 'large.txt', { type: 'text/plain' });
      const hash = await hashFile(file);
      expect(hash).toMatch(/^[a-f0-9]{64}$/);
    });
  });

  describe('truncateHash', () => {
    const testHash = 'abcdef1234567890abcdef1234567890abcdef1234567890abcdef1234567890';

    it('should truncate hash with default lengths', () => {
      const truncated = truncateHash(testHash);
      expect(truncated).toBe('abcdef...567890');
      expect(truncated.length).toBe(15); // 6 + 3 + 6
    });

    it('should truncate hash with custom prefix length', () => {
      const truncated = truncateHash(testHash, 8, 6);
      expect(truncated).toBe('abcdef12...567890');
      expect(truncated.length).toBe(17); // 8 + 3 + 6
    });

    it('should truncate hash with custom suffix length', () => {
      const truncated = truncateHash(testHash, 6, 8);
      expect(truncated).toBe('abcdef...34567890');
      expect(truncated.length).toBe(17); // 6 + 3 + 8
    });

    it('should return full hash if shorter than prefix + suffix', () => {
      const shortHash = 'abcdef123';
      const truncated = truncateHash(shortHash, 6, 6);
      expect(truncated).toBe(shortHash);
    });

    it('should handle empty string', () => {
      const truncated = truncateHash('');
      expect(truncated).toBe('');
    });

    it('should handle hash equal to prefix + suffix length', () => {
      const exactHash = 'abcdef123456';
      const truncated = truncateHash(exactHash, 6, 6);
      expect(truncated).toBe(exactHash);
    });
  });

  describe('integration: hashString and truncateHash', () => {
    it('should hash and truncate display format correctly', async () => {
      const hash = await hashString('test data');
      const truncated = truncateHash(hash);

      expect(truncated).toMatch(/^[a-f0-9]{6}\.\.\.[a-f0-9]{6}$/);
      expect(truncated.length).toBe(15);
    });
  });

  describe('integration: hashFile and truncateHash', () => {
    it('should hash file and truncate display format correctly', async () => {
      const file = new File(['test content'], 'test.txt', { type: 'text/plain' });
      const hash = await hashFile(file);
      const truncated = truncateHash(hash);

      expect(truncated).toMatch(/^[a-f0-9]{6}\.\.\.[a-f0-9]{6}$/);
      expect(truncated.length).toBe(15);
    });
  });
});
