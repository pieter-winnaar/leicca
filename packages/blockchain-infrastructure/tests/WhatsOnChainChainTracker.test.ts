/**
 * WhatsOnChainChainTracker Tests
 *
 * Test coverage:
 * - isValidRootForHeight with valid root
 * - isValidRootForHeight with invalid root
 * - Header caching works
 * - LRU eviction at 1000 blocks
 * - Rate limiting enforced (3 req/sec)
 * - Merkle proof retrieval
 * - Error handling for API failures
 * - Cache clearing
 * - Current height retrieval
 */
import { describe, it, expect, beforeEach, vi } from 'vitest';
import { WhatsOnChainChainTracker } from '../src/services/WhatsOnChainChainTracker';

// Mock fetch globally
const mockFetch = vi.fn();
global.fetch = mockFetch as any;

describe('WhatsOnChainChainTracker', () => {
  let tracker: WhatsOnChainChainTracker;

  beforeEach(() => {
    tracker = new WhatsOnChainChainTracker('main');
    tracker.clearCache();
    mockFetch.mockClear();
    vi.clearAllTimers();
  });

  describe('isValidRootForHeight', () => {
    it('should return true for valid Merkle root', async () => {
      const mockBlock = {
        hash: '000000000000000001234567890abcdef',
        height: 700000,
        merkleroot: 'abcdef1234567890',
        confirmations: 10,
        time: 1234567890,
        tx: [],
      };

      mockFetch.mockResolvedValueOnce({
        ok: true,
        json: async () => mockBlock,
      });

      const result = await tracker.isValidRootForHeight('abcdef1234567890', 700000);

      expect(result).toBe(true);
      expect(mockFetch).toHaveBeenCalledWith(
        'https://api.whatsonchain.com/v1/bsv/main/block/height/700000'
      );
    });

    it('should return false for invalid Merkle root', async () => {
      const mockBlock = {
        hash: '000000000000000001234567890abcdef',
        height: 700000,
        merkleroot: 'abcdef1234567890',
        confirmations: 10,
        time: 1234567890,
        tx: [],
      };

      mockFetch.mockResolvedValueOnce({
        ok: true,
        json: async () => mockBlock,
      });

      const result = await tracker.isValidRootForHeight('wrongroot', 700000);

      expect(result).toBe(false);
    });

    it('should return false for block with 0 confirmations', async () => {
      const mockBlock = {
        hash: '000000000000000001234567890abcdef',
        height: 700000,
        merkleroot: 'abcdef1234567890',
        confirmations: 0,
        time: 1234567890,
        tx: [],
      };

      mockFetch.mockResolvedValueOnce({
        ok: true,
        json: async () => mockBlock,
      });

      const result = await tracker.isValidRootForHeight('abcdef1234567890', 700000);

      expect(result).toBe(false);
    });

    it('should return false on API error', async () => {
      mockFetch.mockResolvedValueOnce({
        ok: false,
        status: 404,
      });

      const result = await tracker.isValidRootForHeight('abcdef1234567890', 700000);

      expect(result).toBe(false);
    });

    it('should return false on network error', async () => {
      mockFetch.mockRejectedValueOnce(new Error('Network error'));

      const result = await tracker.isValidRootForHeight('abcdef1234567890', 700000);

      expect(result).toBe(false);
    });
  });

  describe('Header caching', () => {
    it('should cache block headers', async () => {
      const mockBlock = {
        hash: '000000000000000001234567890abcdef',
        height: 700000,
        merkleroot: 'abcdef1234567890',
        confirmations: 10,
        time: 1234567890,
        tx: [],
      };

      mockFetch.mockResolvedValueOnce({
        ok: true,
        json: async () => mockBlock,
      });

      // First call - should fetch from API
      await tracker.isValidRootForHeight('abcdef1234567890', 700000);
      expect(mockFetch).toHaveBeenCalledTimes(1);

      // Second call - should use cache
      const result = await tracker.isValidRootForHeight('abcdef1234567890', 700000);
      expect(result).toBe(true);
      expect(mockFetch).toHaveBeenCalledTimes(1); // No additional API call
    });

    it('should implement LRU eviction at 1000 blocks', async () => {
      // Use fake timers to avoid rate limit delays
      vi.useFakeTimers();

      // Mock all 1001 responses upfront
      mockFetch.mockImplementation(async (url: string) => {
        // Extract height from URL
        const heightMatch = url.match(/block\/height\/(\d+)/);
        if (!heightMatch) {
          return { ok: false };
        }
        const height = parseInt(heightMatch[1] || '0', 10);

        return {
          ok: true,
          json: async () => ({
            hash: `hash${height}`,
            height,
            merkleroot: `merkleroot${height}`,
            confirmations: 10,
            time: 1234567890,
            tx: [],
          }),
        };
      });

      // Add 1000 blocks to fill cache
      for (let i = 0; i < 1000; i++) {
        const promise = tracker.isValidRootForHeight(`merkleroot${i}`, i);
        // Advance timers to bypass rate limiting
        vi.advanceTimersByTime(400); // 400ms between requests (2.5 req/sec)
        await promise;
      }

      expect(tracker.getCacheSize()).toBe(1000);

      // Add one more - should evict first entry (height 0)
      const promise1001 = tracker.isValidRootForHeight('merkleroot1000', 1000);
      vi.advanceTimersByTime(400);
      await promise1001;

      expect(tracker.getCacheSize()).toBe(1000); // Still 1000 (evicted first)

      // Verify first entry (height 0) was evicted by checking it requires new API call
      const apiCallsBefore = mockFetch.mock.calls.length;
      const promise0 = tracker.isValidRootForHeight('merkleroot0', 0);
      vi.advanceTimersByTime(400);
      await promise0;

      expect(mockFetch.mock.calls.length).toBe(apiCallsBefore + 1); // Made API call (not cached)

      vi.useRealTimers();
    });
  });

  describe('Rate limiting', () => {
    it('should enforce 3 requests per second limit', async () => {
      vi.useFakeTimers();

      const mockBlock = {
        hash: 'hash',
        height: 700000,
        merkleroot: 'merkleroot',
        confirmations: 10,
        time: 1234567890,
        tx: [],
      };

      mockFetch.mockResolvedValue({
        ok: true,
        json: async () => mockBlock,
      });

      // Make 3 requests - should go through immediately
      const start = Date.now();
      const requests = [
        tracker.isValidRootForHeight('merkleroot', 700001),
        tracker.isValidRootForHeight('merkleroot', 700002),
        tracker.isValidRootForHeight('merkleroot', 700003),
      ];

      await Promise.all(requests);
      const elapsed1 = Date.now() - start;

      expect(elapsed1).toBeLessThan(100); // Should be near-instant
      expect(mockFetch).toHaveBeenCalledTimes(3);

      // 4th request should wait
      const start2 = Date.now();
      const request4Promise = tracker.isValidRootForHeight('merkleroot', 700004);

      // Fast-forward time to trigger rate limit reset
      vi.advanceTimersByTime(1000);

      await request4Promise;
      const elapsed2 = Date.now() - start2;

      expect(elapsed2).toBeGreaterThanOrEqual(1000); // Should have waited
      expect(mockFetch).toHaveBeenCalledTimes(4);

      vi.useRealTimers();
    });
  });

  describe('getMerkleProof', () => {
    it('should retrieve Merkle proof for transaction', async () => {
      // Mock TSC proof response (array format)
      const mockTscProof = [
        {
          index: 5, // Transaction index in block
          txOrId: 'abc123txid',
          target: 'blockhash123',
          nodes: ['branch1', 'branch2', 'branch3'], // Merkle path
        },
      ];

      // Mock block header response
      const mockBlockHeader = {
        hash: 'blockhash123',
        height: 700000,
        merkleroot: 'abcdef1234567890',
        confirmations: 10,
        time: 1234567890,
      };

      // First call: TSC proof endpoint
      mockFetch.mockResolvedValueOnce({
        ok: true,
        json: async () => mockTscProof,
      });

      // Second call: Block header endpoint
      mockFetch.mockResolvedValueOnce({
        ok: true,
        json: async () => mockBlockHeader,
      });

      const result = await tracker.getMerkleProof('abc123txid');

      expect(result).toEqual({
        txid: 'abc123txid',
        blockHeight: 700000,
        merkleRoot: 'abcdef1234567890',
        path: [
          { offset: 1, hash: 'branch1' }, // bit 0 of index 5 (0b101) = 1
          { offset: 0, hash: 'branch2' }, // bit 1 of index 5 (0b101) = 0
          { offset: 1, hash: 'branch3' }, // bit 2 of index 5 (0b101) = 1
        ],
        index: 5,
      });

      expect(mockFetch).toHaveBeenNthCalledWith(
        1,
        'https://api.whatsonchain.com/v1/bsv/main/tx/abc123txid/proof/tsc'
      );
      expect(mockFetch).toHaveBeenNthCalledWith(
        2,
        'https://api.whatsonchain.com/v1/bsv/main/block/hash/blockhash123'
      );
    });

    it('should return null on API error', async () => {
      mockFetch.mockResolvedValueOnce({
        ok: false,
        status: 404,
      });

      const result = await tracker.getMerkleProof('abc123txid');

      expect(result).toBe(null);
    });

    it('should return null on network error', async () => {
      mockFetch.mockRejectedValueOnce(new Error('Network error'));

      const result = await tracker.getMerkleProof('abc123txid');

      expect(result).toBe(null);
    });
  });

  describe('getBlockHeader', () => {
    it('should retrieve block header', async () => {
      const mockBlock = {
        hash: '000000000000000001234567890abcdef',
        height: 700000,
        merkleroot: 'abcdef1234567890',
        confirmations: 10,
        time: 1234567890,
        tx: ['tx1', 'tx2'],
      };

      mockFetch.mockResolvedValueOnce({
        ok: true,
        json: async () => mockBlock,
      });

      const result = await tracker.getBlockHeader(700000);

      expect(result).toEqual(mockBlock);
    });

    it('should use cached header', async () => {
      const mockBlock = {
        hash: '000000000000000001234567890abcdef',
        height: 700000,
        merkleroot: 'abcdef1234567890',
        confirmations: 10,
        time: 1234567890,
        tx: [],
      };

      mockFetch.mockResolvedValueOnce({
        ok: true,
        json: async () => mockBlock,
      });

      // First call - fetches from API
      await tracker.getBlockHeader(700000);
      expect(mockFetch).toHaveBeenCalledTimes(1);

      // Second call - uses cache
      const result = await tracker.getBlockHeader(700000);
      expect(result).toEqual(mockBlock);
      expect(mockFetch).toHaveBeenCalledTimes(1); // No additional call
    });

    it('should return null on error', async () => {
      mockFetch.mockResolvedValueOnce({
        ok: false,
        status: 404,
      });

      const result = await tracker.getBlockHeader(700000);

      expect(result).toBe(null);
    });
  });

  describe('currentHeight', () => {
    it('should retrieve current block height', async () => {
      mockFetch.mockResolvedValueOnce({
        ok: true,
        json: async () => ({ blocks: 800000 }),
      });

      const result = await tracker.currentHeight();

      expect(result).toBe(800000);
      expect(mockFetch).toHaveBeenCalledWith(
        'https://api.whatsonchain.com/v1/bsv/main/chain/info'
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
  });

  describe('clearCache', () => {
    it('should clear the header cache', async () => {
      const mockBlock = {
        hash: 'hash',
        height: 700000,
        merkleroot: 'merkleroot',
        confirmations: 10,
        time: 1234567890,
        tx: [],
      };

      mockFetch.mockResolvedValueOnce({
        ok: true,
        json: async () => mockBlock,
      });

      // Add entry to cache
      await tracker.isValidRootForHeight('merkleroot', 700000);
      expect(tracker.getCacheSize()).toBe(1);

      // Clear cache
      tracker.clearCache();
      expect(tracker.getCacheSize()).toBe(0);
    });
  });

  describe('Network selection', () => {
    it('should use mainnet by default', async () => {
      const mainnetTracker = new WhatsOnChainChainTracker();
      mockFetch.mockResolvedValueOnce({
        ok: true,
        json: async () => ({
          hash: 'hash',
          height: 700000,
          merkleroot: 'merkleroot',
          confirmations: 10,
          time: 1234567890,
          tx: [],
        }),
      });

      await mainnetTracker.isValidRootForHeight('merkleroot', 700000);

      expect(mockFetch).toHaveBeenCalledWith(
        'https://api.whatsonchain.com/v1/bsv/main/block/height/700000'
      );
    });

    it('should support testnet', async () => {
      const testnetTracker = new WhatsOnChainChainTracker('test');
      mockFetch.mockResolvedValueOnce({
        ok: true,
        json: async () => ({
          hash: 'hash',
          height: 700000,
          merkleroot: 'merkleroot',
          confirmations: 10,
          time: 1234567890,
          tx: [],
        }),
      });

      await testnetTracker.isValidRootForHeight('merkleroot', 700000);

      expect(mockFetch).toHaveBeenCalledWith(
        'https://api.whatsonchain.com/v1/bsv/test/block/height/700000'
      );
    });

    it('should support STN', async () => {
      const stnTracker = new WhatsOnChainChainTracker('stn');
      mockFetch.mockResolvedValueOnce({
        ok: true,
        json: async () => ({
          hash: 'hash',
          height: 700000,
          merkleroot: 'merkleroot',
          confirmations: 10,
          time: 1234567890,
          tx: [],
        }),
      });

      await stnTracker.isValidRootForHeight('merkleroot', 700000);

      expect(mockFetch).toHaveBeenCalledWith(
        'https://api.whatsonchain.com/v1/bsv/stn/block/height/700000'
      );
    });
  });
});
