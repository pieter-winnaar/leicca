/**
 * MultiProviderChainTracker Tests
 *
 * Test coverage:
 * - Fallback chain: first provider succeeds
 * - Fallback chain: first fails, second succeeds
 * - Fallback chain: first fails, second fails, third succeeds
 * - All providers fail: aggregated error
 * - Provider tracking for logging
 * - Empty provider list error
 */
import { describe, it, expect, beforeEach, vi } from 'vitest';
import { MultiProviderChainTracker } from '../src/services/MultiProviderChainTracker';
import type { ChainTracker } from '../src/services/BEEFService';

// Mock ChainTracker for testing
class MockChainTracker implements ChainTracker {
  constructor(
    private readonly shouldSucceed: boolean = true,
    private readonly returnValue: boolean = true,
    private readonly heightValue: number = 800000,
    private readonly name: string = 'MockProvider'
  ) {}

  async isValidRootForHeight(merkleRoot: string, height: number): Promise<boolean> {
    if (!this.shouldSucceed) {
      throw new Error(`${this.name} failed to verify`);
    }
    return this.returnValue;
  }

  async currentHeight(): Promise<number> {
    if (!this.shouldSucceed) {
      throw new Error(`${this.name} failed to get height`);
    }
    return this.heightValue;
  }
}

describe('MultiProviderChainTracker', () => {
  describe('Constructor', () => {
    it('should throw error if no providers given', () => {
      expect(() => new MultiProviderChainTracker([])).toThrow(
        'At least one provider required'
      );
    });

    it('should accept single provider', () => {
      const provider = new MockChainTracker();
      expect(() => new MultiProviderChainTracker([provider])).not.toThrow();
    });

    it('should accept multiple providers', () => {
      const providers = [new MockChainTracker(), new MockChainTracker(), new MockChainTracker()];
      expect(() => new MultiProviderChainTracker(providers)).not.toThrow();
    });
  });

  describe('isValidRootForHeight', () => {
    it('should use first provider if it succeeds', async () => {
      const provider1 = new MockChainTracker(true, true, 0, 'Provider1');
      const provider2 = new MockChainTracker(true, false, 0, 'Provider2'); // Would return different value
      const tracker = new MultiProviderChainTracker([provider1, provider2]);

      const result = await tracker.isValidRootForHeight('merkleroot', 700000);

      // Should use provider1's result (true)
      expect(result).toBe(true);
    });

    it('should fallback to second provider if first fails', async () => {
      const provider1 = new MockChainTracker(false, false, 0, 'Provider1'); // Fails
      const provider2 = new MockChainTracker(true, true, 0, 'Provider2'); // Succeeds
      const tracker = new MultiProviderChainTracker([provider1, provider2]);

      const result = await tracker.isValidRootForHeight('merkleroot', 700000);

      // Should use provider2's result (true)
      expect(result).toBe(true);
    });

    it('should try all providers in order until one succeeds', async () => {
      const provider1 = new MockChainTracker(false, false, 0, 'Provider1'); // Fails
      const provider2 = new MockChainTracker(false, false, 0, 'Provider2'); // Fails
      const provider3 = new MockChainTracker(true, true, 0, 'Provider3'); // Succeeds
      const tracker = new MultiProviderChainTracker([provider1, provider2, provider3]);

      const result = await tracker.isValidRootForHeight('merkleroot', 700000);

      // Should use provider3's result (true)
      expect(result).toBe(true);
    });

    it('should throw aggregated error if all providers fail', async () => {
      const provider1 = new MockChainTracker(false, false, 0, 'Provider1');
      const provider2 = new MockChainTracker(false, false, 0, 'Provider2');
      const provider3 = new MockChainTracker(false, false, 0, 'Provider3');
      const tracker = new MultiProviderChainTracker([provider1, provider2, provider3]);

      await expect(tracker.isValidRootForHeight('merkleroot', 700000)).rejects.toThrow(
        /All 3 providers failed/
      );
    });

    it('should include all errors in aggregated error message', async () => {
      const provider1 = new MockChainTracker(false, false, 0, 'Provider1');
      const provider2 = new MockChainTracker(false, false, 0, 'Provider2');
      const tracker = new MultiProviderChainTracker([provider1, provider2]);

      try {
        await tracker.isValidRootForHeight('merkleroot', 700000);
        expect.fail('Should have thrown error');
      } catch (error: any) {
        expect(error.message).toContain('Provider 0');
        expect(error.message).toContain('Provider 1');
        expect(error.message).toContain('Provider1 failed');
        expect(error.message).toContain('Provider2 failed');
      }
    });

    it('should handle providers returning false vs throwing error', async () => {
      const provider1 = new MockChainTracker(true, false, 0, 'Provider1'); // Succeeds but returns false
      const provider2 = new MockChainTracker(false, false, 0, 'Provider2'); // Throws error
      const tracker = new MultiProviderChainTracker([provider1, provider2]);

      // Should return false from provider1 (no fallback needed)
      const result = await tracker.isValidRootForHeight('merkleroot', 700000);
      expect(result).toBe(false);
    });
  });

  describe('currentHeight', () => {
    it('should use first provider if it succeeds', async () => {
      const provider1 = new MockChainTracker(true, true, 800000, 'Provider1');
      const provider2 = new MockChainTracker(true, true, 900000, 'Provider2'); // Different height
      const tracker = new MultiProviderChainTracker([provider1, provider2]);

      const result = await tracker.currentHeight();

      // Should use provider1's height
      expect(result).toBe(800000);
    });

    it('should fallback to second provider if first fails', async () => {
      const provider1 = new MockChainTracker(false, true, 0, 'Provider1'); // Fails
      const provider2 = new MockChainTracker(true, true, 850000, 'Provider2'); // Succeeds
      const tracker = new MultiProviderChainTracker([provider1, provider2]);

      const result = await tracker.currentHeight();

      // Should use provider2's height
      expect(result).toBe(850000);
    });

    it('should try all providers in order until one succeeds', async () => {
      const provider1 = new MockChainTracker(false, true, 0, 'Provider1'); // Fails
      const provider2 = new MockChainTracker(false, true, 0, 'Provider2'); // Fails
      const provider3 = new MockChainTracker(true, true, 870000, 'Provider3'); // Succeeds
      const tracker = new MultiProviderChainTracker([provider1, provider2, provider3]);

      const result = await tracker.currentHeight();

      // Should use provider3's height
      expect(result).toBe(870000);
    });

    it('should throw aggregated error if all providers fail', async () => {
      const provider1 = new MockChainTracker(false, true, 0, 'Provider1');
      const provider2 = new MockChainTracker(false, true, 0, 'Provider2');
      const provider3 = new MockChainTracker(false, true, 0, 'Provider3');
      const tracker = new MultiProviderChainTracker([provider1, provider2, provider3]);

      await expect(tracker.currentHeight()).rejects.toThrow(/All 3 providers failed/);
    });

    it('should include all errors in aggregated error message', async () => {
      const provider1 = new MockChainTracker(false, true, 0, 'Provider1');
      const provider2 = new MockChainTracker(false, true, 0, 'Provider2');
      const tracker = new MultiProviderChainTracker([provider1, provider2]);

      try {
        await tracker.currentHeight();
        expect.fail('Should have thrown error');
      } catch (error: any) {
        expect(error.message).toContain('Provider 0');
        expect(error.message).toContain('Provider 1');
        expect(error.message).toContain('Provider1 failed');
        expect(error.message).toContain('Provider2 failed');
      }
    });
  });

  describe('getProviderCount', () => {
    it('should return number of providers', () => {
      const providers = [new MockChainTracker(), new MockChainTracker(), new MockChainTracker()];
      const tracker = new MultiProviderChainTracker(providers);

      expect(tracker.getProviderCount()).toBe(3);
    });

    it('should return 1 for single provider', () => {
      const tracker = new MultiProviderChainTracker([new MockChainTracker()]);

      expect(tracker.getProviderCount()).toBe(1);
    });
  });

  describe('Logging and tracking', () => {
    it('should log which provider succeeded', async () => {
      const consoleSpy = vi.spyOn(console, 'log').mockImplementation(() => {});

      const provider1 = new MockChainTracker(false, false, 0, 'Provider1'); // Fails
      const provider2 = new MockChainTracker(true, true, 0, 'Provider2'); // Succeeds
      const tracker = new MultiProviderChainTracker([provider1, provider2]);

      await tracker.isValidRootForHeight('merkleroot', 700000);

      expect(consoleSpy).toHaveBeenCalledWith(
        expect.stringContaining('Provider 1 succeeded')
      );

      consoleSpy.mockRestore();
    });

    it('should log warnings for failed providers', async () => {
      const consoleSpy = vi.spyOn(console, 'warn').mockImplementation(() => {});

      const provider1 = new MockChainTracker(false, false, 0, 'Provider1'); // Fails
      const provider2 = new MockChainTracker(true, true, 0, 'Provider2'); // Succeeds
      const tracker = new MultiProviderChainTracker([provider1, provider2]);

      await tracker.isValidRootForHeight('merkleroot', 700000);

      expect(consoleSpy).toHaveBeenCalledWith(
        expect.stringContaining('Provider 0 failed'),
        expect.any(Error)
      );

      consoleSpy.mockRestore();
    });
  });
});
