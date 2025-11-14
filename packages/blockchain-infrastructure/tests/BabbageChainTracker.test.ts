/**
 * BabbageChainTracker Tests
 *
 * Test coverage:
 * - isValidRootForHeight with valid root
 * - isValidRootForHeight with invalid root
 * - Header caching works
 * - LRU eviction at 1000 blocks
 * - Response envelope handling
 * - Automatic retry logic for connection errors
 * - Error handling for API failures
 * - Cache clearing
 * - Current height retrieval
 * - getMerkleProof returns null (not supported)
 */
import { describe, it, expect, beforeEach, vi } from 'vitest';
import { BabbageChainTracker } from '../src/services/BabbageChainTracker';

// Mock fetch globally
const mockFetch = vi.fn();
global.fetch = mockFetch as any;

describe('BabbageChainTracker', () => {
  let tracker: BabbageChainTracker;

  beforeEach(() => {
    tracker = new BabbageChainTracker('main');
    tracker.clearCache();
    mockFetch.mockClear();
  });

  describe('isValidRootForHeight', () => {
    it('should return true for valid Merkle root', async () => {
      const mockHeader = {
        version: 770793472,
        previousHash: '00000000000000000b6ae23bbe9f549844c20943d8c20b8ceedbae8aa1dde8e0',
        merkleRoot: '244993b9d8d961f5b4c91afa569adf9b6d8cd18e0bb6f769f5e62cdf2cc1468d',
        time: 1688957834,
        bits: 403527837,
        nonce: 742652432,
        height: 800000,
        hash: '000000000000000000ad9056924410005d91b57f100bce345944e5caf56e8565',
      };

      mockFetch.mockResolvedValueOnce({
        ok: true,
        json: async () => ({
          status: 'success',
          value: mockHeader,
        }),
      });

      const result = await tracker.isValidRootForHeight(
        '244993b9d8d961f5b4c91afa569adf9b6d8cd18e0bb6f769f5e62cdf2cc1468d',
        800000
      );

      expect(result).toBe(true);
      expect(mockFetch).toHaveBeenCalledWith(
        'https://mainnet-chaintracks.babbage.systems/findHeaderHexForHeight?height=800000'
      );
    });

    it('should return false for invalid Merkle root', async () => {
      const mockHeader = {
        version: 770793472,
        previousHash: '00000000000000000b6ae23bbe9f549844c20943d8c20b8ceedbae8aa1dde8e0',
        merkleRoot: '244993b9d8d961f5b4c91afa569adf9b6d8cd18e0bb6f769f5e62cdf2cc1468d',
        time: 1688957834,
        bits: 403527837,
        nonce: 742652432,
        height: 800000,
        hash: '000000000000000000ad9056924410005d91b57f100bce345944e5caf56e8565',
      };

      mockFetch.mockResolvedValueOnce({
        ok: true,
        json: async () => ({
          status: 'success',
          value: mockHeader,
        }),
      });

      const result = await tracker.isValidRootForHeight('wrongroot', 800000);

      expect(result).toBe(false);
    });

    it('should return false when header not found (undefined value)', async () => {
      mockFetch.mockResolvedValueOnce({
        ok: true,
        json: async () => ({
          status: 'success',
          // No value field = height not found
        }),
      });

      const result = await tracker.isValidRootForHeight(
        '244993b9d8d961f5b4c91afa569adf9b6d8cd18e0bb6f769f5e62cdf2cc1468d',
        999999999
      );

      expect(result).toBe(false);
    });

    it('should return false on API error', async () => {
      mockFetch.mockResolvedValueOnce({
        ok: false,
        status: 404,
      });

      const result = await tracker.isValidRootForHeight(
        '244993b9d8d961f5b4c91afa569adf9b6d8cd18e0bb6f769f5e62cdf2cc1468d',
        800000
      );

      expect(result).toBe(false);
    });

    it('should return false on network error', async () => {
      mockFetch.mockRejectedValueOnce(new Error('Network error'));

      const result = await tracker.isValidRootForHeight(
        '244993b9d8d961f5b4c91afa569adf9b6d8cd18e0bb6f769f5e62cdf2cc1468d',
        800000
      );

      expect(result).toBe(false);
    });

    it('should handle error status in response envelope', async () => {
      mockFetch.mockResolvedValueOnce({
        ok: true,
        json: async () => ({
          status: 'error',
          code: 'INVALID_HEIGHT',
          description: 'Height exceeds current chain height',
        }),
      });

      const result = await tracker.isValidRootForHeight(
        '244993b9d8d961f5b4c91afa569adf9b6d8cd18e0bb6f769f5e62cdf2cc1468d',
        999999999
      );

      expect(result).toBe(false);
    });
  });

  describe('Header caching', () => {
    it('should cache block headers', async () => {
      const mockHeader = {
        version: 770793472,
        previousHash: '00000000000000000b6ae23bbe9f549844c20943d8c20b8ceedbae8aa1dde8e0',
        merkleRoot: '244993b9d8d961f5b4c91afa569adf9b6d8cd18e0bb6f769f5e62cdf2cc1468d',
        time: 1688957834,
        bits: 403527837,
        nonce: 742652432,
        height: 800000,
        hash: '000000000000000000ad9056924410005d91b57f100bce345944e5caf56e8565',
      };

      // Mock for both calls
      mockFetch.mockResolvedValue({
        ok: true,
        json: async () => ({
          status: 'success',
          value: mockHeader,
        }),
      });

      // First call - should fetch from API
      const result1 = await tracker.isValidRootForHeight(
        '244993b9d8d961f5b4c91afa569adf9b6d8cd18e0bb6f769f5e62cdf2cc1468d',
        800000
      );
      expect(result1).toBe(true);
      expect(mockFetch).toHaveBeenCalledTimes(1);

      // Second call - should use cache
      const result2 = await tracker.isValidRootForHeight(
        '244993b9d8d961f5b4c91afa569adf9b6d8cd18e0bb6f769f5e62cdf2cc1468d',
        800000
      );
      expect(result2).toBe(true);
      expect(mockFetch).toHaveBeenCalledTimes(1); // No additional API call
    });

    it('should implement LRU eviction at 1000 blocks', async () => {
      // Mock all responses
      mockFetch.mockImplementation(async (url: string) => {
        const heightMatch = url.match(/height=(\d+)/);
        if (!heightMatch) {
          return { ok: false };
        }
        const height = parseInt(heightMatch[1] || '0', 10);

        return {
          ok: true,
          json: async () => ({
            status: 'success',
            value: {
              version: 770793472,
              previousHash: `prevhash${height}`,
              merkleRoot: `merkleroot${height}`,
              time: 1688957834,
              bits: 403527837,
              nonce: 742652432,
              height,
              hash: `hash${height}`,
            },
          }),
        };
      });

      // Add 1000 blocks to fill cache
      for (let i = 0; i < 1000; i++) {
        await tracker.isValidRootForHeight(`merkleroot${i}`, i);
      }

      expect(tracker.getCacheSize()).toBe(1000);

      // Add one more - should evict first entry (height 0)
      await tracker.isValidRootForHeight('merkleroot1000', 1000);

      expect(tracker.getCacheSize()).toBe(1000); // Still 1000 (evicted first)

      // Verify first entry (height 0) was evicted by checking it requires new API call
      const apiCallsBefore = mockFetch.mock.calls.length;
      await tracker.isValidRootForHeight('merkleroot0', 0);

      expect(mockFetch.mock.calls.length).toBe(apiCallsBefore + 1); // Made API call (not cached)
    });
  });

  describe('Automatic retry logic', () => {
    it('should retry on connection reset errors', async () => {
      const mockHeader = {
        version: 770793472,
        previousHash: '00000000000000000b6ae23bbe9f549844c20943d8c20b8ceedbae8aa1dde8e0',
        merkleRoot: '244993b9d8d961f5b4c91afa569adf9b6d8cd18e0bb6f769f5e62cdf2cc1468d',
        time: 1688957834,
        bits: 403527837,
        nonce: 742652432,
        height: 800000,
        hash: '000000000000000000ad9056924410005d91b57f100bce345944e5caf56e8565',
      };

      // First 2 calls fail with connection reset
      const connResetError = new Error('Connection reset');
      connResetError.name = 'ECONNRESET';

      mockFetch
        .mockRejectedValueOnce(connResetError)
        .mockRejectedValueOnce(connResetError)
        .mockResolvedValueOnce({
          ok: true,
          json: async () => ({
            status: 'success',
            value: mockHeader,
          }),
        });

      const result = await tracker.isValidRootForHeight(
        '244993b9d8d961f5b4c91afa569adf9b6d8cd18e0bb6f769f5e62cdf2cc1468d',
        800000
      );

      expect(result).toBe(true);
      expect(mockFetch).toHaveBeenCalledTimes(3); // 2 retries + success
    });

    it('should not retry on non-connection-reset errors', async () => {
      const otherError = new Error('Not found');
      otherError.name = 'NOT_FOUND';

      mockFetch.mockRejectedValueOnce(otherError);

      const result = await tracker.isValidRootForHeight(
        '244993b9d8d961f5b4c91afa569adf9b6d8cd18e0bb6f769f5e62cdf2cc1468d',
        800000
      );

      expect(result).toBe(false);
      expect(mockFetch).toHaveBeenCalledTimes(1); // No retries
    });

    it('should stop retrying after 3 attempts', async () => {
      const connResetError = new Error('Connection reset');
      connResetError.name = 'ECONNRESET';

      mockFetch.mockRejectedValue(connResetError);

      const result = await tracker.isValidRootForHeight(
        '244993b9d8d961f5b4c91afa569adf9b6d8cd18e0bb6f769f5e62cdf2cc1468d',
        800000
      );

      expect(result).toBe(false);
      expect(mockFetch).toHaveBeenCalledTimes(3); // Max retries
    });
  });

  describe('getBlockHeader', () => {
    it('should retrieve block header', async () => {
      const mockHeader = {
        version: 770793472,
        previousHash: '00000000000000000b6ae23bbe9f549844c20943d8c20b8ceedbae8aa1dde8e0',
        merkleRoot: '244993b9d8d961f5b4c91afa569adf9b6d8cd18e0bb6f769f5e62cdf2cc1468d',
        time: 1688957834,
        bits: 403527837,
        nonce: 742652432,
        height: 800000,
        hash: '000000000000000000ad9056924410005d91b57f100bce345944e5caf56e8565',
      };

      mockFetch.mockResolvedValueOnce({
        ok: true,
        json: async () => ({
          status: 'success',
          value: mockHeader,
        }),
      });

      const result = await tracker.getBlockHeader(800000);

      expect(result).toEqual({
        hash: '000000000000000000ad9056924410005d91b57f100bce345944e5caf56e8565',
        height: 800000,
        merkleroot: '244993b9d8d961f5b4c91afa569adf9b6d8cd18e0bb6f769f5e62cdf2cc1468d',
        confirmations: 1,
        time: 1688957834,
      });
    });

    it('should use cached header', async () => {
      const mockHeader = {
        version: 770793472,
        previousHash: '00000000000000000b6ae23bbe9f549844c20943d8c20b8ceedbae8aa1dde8e0',
        merkleRoot: '244993b9d8d961f5b4c91afa569adf9b6d8cd18e0bb6f769f5e62cdf2cc1468d',
        time: 1688957834,
        bits: 403527837,
        nonce: 742652432,
        height: 800000,
        hash: '000000000000000000ad9056924410005d91b57f100bce345944e5caf56e8565',
      };

      mockFetch.mockResolvedValueOnce({
        ok: true,
        json: async () => ({
          status: 'success',
          value: mockHeader,
        }),
      });

      // First call - fetches from API
      await tracker.getBlockHeader(800000);
      expect(mockFetch).toHaveBeenCalledTimes(1);

      // Second call - uses cache
      const result = await tracker.getBlockHeader(800000);
      expect(result).not.toBe(null);
      expect(result!.hash).toBe(
        '000000000000000000ad9056924410005d91b57f100bce345944e5caf56e8565'
      );
      expect(mockFetch).toHaveBeenCalledTimes(1); // No additional call
    });

    it('should return null on error', async () => {
      mockFetch.mockResolvedValueOnce({
        ok: false,
        status: 404,
      });

      const result = await tracker.getBlockHeader(800000);

      expect(result).toBe(null);
    });
  });

  describe('currentHeight', () => {
    it('should retrieve current block height', async () => {
      mockFetch.mockResolvedValueOnce({
        ok: true,
        json: async () => ({
          status: 'success',
          value: 920523,
        }),
      });

      const result = await tracker.currentHeight();

      expect(result).toBe(920523);
      expect(mockFetch).toHaveBeenCalledWith(
        'https://mainnet-chaintracks.babbage.systems/getPresentHeight'
      );
    });

    it('should return 0 on API error', async () => {
      mockFetch.mockResolvedValueOnce({
        ok: false,
        status: 500,
      });

      const result = await tracker.currentHeight();

      expect(result).toBe(0);
    });

    it('should return 0 on network error', async () => {
      mockFetch.mockRejectedValueOnce(new Error('Network error'));

      const result = await tracker.currentHeight();

      expect(result).toBe(0);
    });

    it('should return 0 when value is undefined', async () => {
      mockFetch.mockResolvedValueOnce({
        ok: true,
        json: async () => ({
          status: 'success',
          // No value field
        }),
      });

      const result = await tracker.currentHeight();

      expect(result).toBe(0);
    });
  });

  describe('getMerkleProof', () => {
    it('should return null (not supported)', async () => {
      const result = await tracker.getMerkleProof('abc123txid');

      expect(result).toBe(null);
      expect(mockFetch).not.toHaveBeenCalled();
    });
  });

  describe('clearCache', () => {
    it('should clear the header cache', async () => {
      const mockHeader = {
        version: 770793472,
        previousHash: '00000000000000000b6ae23bbe9f549844c20943d8c20b8ceedbae8aa1dde8e0',
        merkleRoot: '244993b9d8d961f5b4c91afa569adf9b6d8cd18e0bb6f769f5e62cdf2cc1468d',
        time: 1688957834,
        bits: 403527837,
        nonce: 742652432,
        height: 800000,
        hash: '000000000000000000ad9056924410005d91b57f100bce345944e5caf56e8565',
      };

      mockFetch.mockResolvedValue({
        ok: true,
        json: async () => ({
          status: 'success',
          value: mockHeader,
        }),
      });

      // Add entry to cache
      const result = await tracker.isValidRootForHeight(
        '244993b9d8d961f5b4c91afa569adf9b6d8cd18e0bb6f769f5e62cdf2cc1468d',
        800000
      );
      expect(result).toBe(true);
      expect(tracker.getCacheSize()).toBe(1);

      // Clear cache
      tracker.clearCache();
      expect(tracker.getCacheSize()).toBe(0);
    });
  });

  describe('Network selection', () => {
    it('should use mainnet by default', async () => {
      const mainnetTracker = new BabbageChainTracker();

      mockFetch.mockResolvedValueOnce({
        ok: true,
        json: async () => ({
          status: 'success',
          value: 920523,
        }),
      });

      await mainnetTracker.currentHeight();

      expect(mockFetch).toHaveBeenCalledWith(
        'https://mainnet-chaintracks.babbage.systems/getPresentHeight'
      );
    });

    it('should support testnet', async () => {
      const testnetTracker = new BabbageChainTracker('test');

      mockFetch.mockResolvedValueOnce({
        ok: true,
        json: async () => ({
          status: 'success',
          value: 1700871,
        }),
      });

      await testnetTracker.currentHeight();

      expect(mockFetch).toHaveBeenCalledWith(
        'https://testnet-chaintracks.babbage.systems/getPresentHeight'
      );
    });

    it('should fallback to mainnet for STN', async () => {
      const stnTracker = new BabbageChainTracker('stn');

      mockFetch.mockResolvedValueOnce({
        ok: true,
        json: async () => ({
          status: 'success',
          value: 920523,
        }),
      });

      await stnTracker.currentHeight();

      // STN not supported, uses mainnet
      expect(mockFetch).toHaveBeenCalledWith(
        'https://mainnet-chaintracks.babbage.systems/getPresentHeight'
      );
    });

    it('should respect CHAINTRACKS_BASE_URL environment variable', async () => {
      process.env.CHAINTRACKS_BASE_URL = 'https://custom-chaintracks.example.com';

      const customTracker = new BabbageChainTracker('main');

      mockFetch.mockResolvedValueOnce({
        ok: true,
        json: async () => ({
          status: 'success',
          value: 800000,
        }),
      });

      await customTracker.currentHeight();

      expect(mockFetch).toHaveBeenCalledWith(
        'https://custom-chaintracks.example.com/getPresentHeight'
      );

      delete process.env.CHAINTRACKS_BASE_URL;
    });
  });
});
