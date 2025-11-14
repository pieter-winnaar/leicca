/**
 * ConfirmationTracker Tests
 *
 * Test coverage:
 * - trackConfirmations starts polling
 * - Stops at 6+ confirmations
 * - Stops at 48 hours (with fast-forward mocks using vi.useFakeTimers())
 * - Prevents duplicate pollers
 * - stopTracking for specific transaction
 * - stopAll clears all pollers
 * - Error handling (continues polling on transient errors)
 * - onConfirmationUpdate callback invoked
 * - getActiveCount
 *
 * Target: >90% coverage
 */

import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import { ConfirmationTracker } from '../../src/utils/ConfirmationTracker';

describe('ConfirmationTracker', () => {
  let tracker: ConfirmationTracker;
  let onConfirmationUpdate: ReturnType<typeof vi.fn>;
  let getTransactionStatus: ReturnType<typeof vi.fn>;

  beforeEach(() => {
    // Use fake timers for predictable polling
    vi.useFakeTimers();

    // Create mock callbacks
    onConfirmationUpdate = vi.fn().mockResolvedValue(undefined);
    getTransactionStatus = vi.fn().mockResolvedValue({ confirmations: 0 });

    // Create tracker
    tracker = new ConfirmationTracker(
      onConfirmationUpdate,
      getTransactionStatus
    );
  });

  afterEach(() => {
    // Clean up all pollers
    tracker.stopAll();

    // Restore real timers
    vi.useRealTimers();
  });

  describe('trackConfirmations', () => {
    it('should start polling for a transaction', async () => {
      const txid = 'abc123';

      tracker.trackConfirmations(txid);

      // Initially no status query (first poll happens after 60s)
      expect(getTransactionStatus).not.toHaveBeenCalled();
      expect(tracker.getActiveCount()).toBe(1);

      // Fast-forward 60 seconds to first poll
      await vi.advanceTimersByTimeAsync(60000);

      // First poll should query status
      expect(getTransactionStatus).toHaveBeenCalledWith(txid);
      expect(getTransactionStatus).toHaveBeenCalledTimes(1);
    });

    it('should prevent duplicate pollers for same txid', async () => {
      const txid = 'abc123';

      tracker.trackConfirmations(txid);
      tracker.trackConfirmations(txid); // Duplicate call
      tracker.trackConfirmations(txid); // Another duplicate

      expect(tracker.getActiveCount()).toBe(1);

      // Fast-forward to first poll
      await vi.advanceTimersByTimeAsync(60000);

      // Should only poll once (not 3 times)
      expect(getTransactionStatus).toHaveBeenCalledTimes(1);
    });

    it('should track multiple transactions independently', async () => {
      const txid1 = 'abc123';
      const txid2 = 'def456';

      tracker.trackConfirmations(txid1);
      tracker.trackConfirmations(txid2);

      expect(tracker.getActiveCount()).toBe(2);

      // Fast-forward to first poll
      await vi.advanceTimersByTimeAsync(60000);

      // Should poll both transactions
      expect(getTransactionStatus).toHaveBeenCalledWith(txid1);
      expect(getTransactionStatus).toHaveBeenCalledWith(txid2);
      expect(getTransactionStatus).toHaveBeenCalledTimes(2);
    });
  });

  describe('confirmation updates', () => {
    it('should call onConfirmationUpdate at first confirmation (>=1)', async () => {
      const txid = 'abc123';

      // Start with 0 confirmations, then 1 after first poll
      getTransactionStatus
        .mockResolvedValueOnce({ confirmations: 0 })
        .mockResolvedValueOnce({ confirmations: 1 });

      tracker.trackConfirmations(txid);

      // First poll: 0 confirmations
      await vi.advanceTimersByTimeAsync(60000);
      expect(onConfirmationUpdate).not.toHaveBeenCalled();

      // Second poll: 1 confirmation
      await vi.advanceTimersByTimeAsync(60000);
      expect(onConfirmationUpdate).toHaveBeenCalledWith(txid, 1);
      expect(onConfirmationUpdate).toHaveBeenCalledTimes(1);
    });

    it('should call onConfirmationUpdate at 6+ confirmations', async () => {
      const txid = 'abc123';

      // Simulate progression to 6 confirmations
      getTransactionStatus
        .mockResolvedValueOnce({ confirmations: 0 })
        .mockResolvedValueOnce({ confirmations: 1 })
        .mockResolvedValueOnce({ confirmations: 3 })
        .mockResolvedValueOnce({ confirmations: 6 });

      tracker.trackConfirmations(txid);

      // Poll 1: 0 confirmations (no callback)
      await vi.advanceTimersByTimeAsync(60000);
      expect(onConfirmationUpdate).not.toHaveBeenCalled();

      // Poll 2: 1 confirmation (callback triggered)
      await vi.advanceTimersByTimeAsync(60000);
      expect(onConfirmationUpdate).toHaveBeenCalledWith(txid, 1);

      // Poll 3: 3 confirmations (callback triggered)
      await vi.advanceTimersByTimeAsync(60000);
      expect(onConfirmationUpdate).toHaveBeenCalledWith(txid, 3);

      // Poll 4: 6 confirmations (callback triggered + polling stops)
      await vi.advanceTimersByTimeAsync(60000);
      expect(onConfirmationUpdate).toHaveBeenCalledWith(txid, 6);
      expect(onConfirmationUpdate).toHaveBeenCalledTimes(3);

      // Verify polling stopped
      expect(tracker.getActiveCount()).toBe(0);
    });
  });

  describe('stopping conditions', () => {
    it('should stop polling at 6+ confirmations', async () => {
      const txid = 'abc123';

      getTransactionStatus.mockResolvedValue({ confirmations: 6 });

      tracker.trackConfirmations(txid);
      expect(tracker.getActiveCount()).toBe(1);

      // First poll: 6 confirmations
      await vi.advanceTimersByTimeAsync(60000);

      // Polling should stop
      expect(tracker.getActiveCount()).toBe(0);

      // Verify callback was called
      expect(onConfirmationUpdate).toHaveBeenCalledWith(txid, 6);

      // Fast-forward another 60s - no more polls
      await vi.advanceTimersByTimeAsync(60000);
      expect(getTransactionStatus).toHaveBeenCalledTimes(1); // Only the first poll
    });

    it('should stop polling at 48 hours (2880 attempts)', async () => {
      const txid = 'abc123';

      // Always return 0 confirmations (never confirms)
      getTransactionStatus.mockResolvedValue({ confirmations: 0 });

      tracker.trackConfirmations(txid);

      // Fast-forward 48 hours (2880 polls at 60s intervals)
      // 2880 * 60000ms = 172,800,000ms
      const FORTY_EIGHT_HOURS_MS = 2880 * 60000;

      await vi.advanceTimersByTimeAsync(FORTY_EIGHT_HOURS_MS);

      // Should have polled 2880 times
      expect(getTransactionStatus).toHaveBeenCalledTimes(2880);

      // Polling should stop
      expect(tracker.getActiveCount()).toBe(0);

      // Fast-forward another hour - no more polls
      await vi.advanceTimersByTimeAsync(3600000);
      expect(getTransactionStatus).toHaveBeenCalledTimes(2880); // Still 2880
    });

    it('should log warning at timeout', async () => {
      const txid = 'abc123';
      const consoleWarnSpy = vi.spyOn(console, 'warn').mockImplementation(() => {});

      getTransactionStatus.mockResolvedValue({ confirmations: 0 });

      tracker.trackConfirmations(txid);

      // Fast-forward to timeout
      await vi.advanceTimersByTimeAsync(2880 * 60000);

      // Should log warning
      expect(consoleWarnSpy).toHaveBeenCalledWith(
        expect.stringContaining('[ConfirmationTracker] Timeout for abc123')
      );

      consoleWarnSpy.mockRestore();
    });
  });

  describe('error handling', () => {
    it('should continue polling on transient errors', async () => {
      const txid = 'abc123';

      // Simulate network error, then success
      getTransactionStatus
        .mockRejectedValueOnce(new Error('Network error'))
        .mockResolvedValueOnce({ confirmations: 1 });

      tracker.trackConfirmations(txid);

      // First poll: Error
      await vi.advanceTimersByTimeAsync(60000);

      // Should still be polling
      expect(tracker.getActiveCount()).toBe(1);

      // Second poll: Success
      await vi.advanceTimersByTimeAsync(60000);

      expect(onConfirmationUpdate).toHaveBeenCalledWith(txid, 1);
    });

    it('should log errors during polling', async () => {
      const txid = 'abc123';
      const consoleErrorSpy = vi.spyOn(console, 'error').mockImplementation(() => {});

      getTransactionStatus.mockRejectedValue(new Error('Network error'));

      tracker.trackConfirmations(txid);

      // First poll: Error
      await vi.advanceTimersByTimeAsync(60000);

      // Should log error
      expect(consoleErrorSpy).toHaveBeenCalledWith(
        expect.stringContaining('[ConfirmationTracker] Error tracking abc123'),
        expect.any(Error)
      );

      consoleErrorSpy.mockRestore();
    });

    it('should stop polling after max attempts even on error', async () => {
      const txid = 'abc123';

      // Always error
      getTransactionStatus.mockRejectedValue(new Error('Network error'));

      tracker.trackConfirmations(txid);

      // Fast-forward to timeout
      await vi.advanceTimersByTimeAsync(2880 * 60000);

      // Should stop polling
      expect(tracker.getActiveCount()).toBe(0);
    });

    it('should handle callback errors gracefully', async () => {
      const txid = 'abc123';
      const consoleErrorSpy = vi.spyOn(console, 'error').mockImplementation(() => {});

      // Callback throws error
      onConfirmationUpdate.mockRejectedValue(new Error('Callback error'));

      // Status query succeeds
      getTransactionStatus.mockResolvedValue({ confirmations: 1 });

      tracker.trackConfirmations(txid);

      // First poll: Status succeeds, callback fails
      await vi.advanceTimersByTimeAsync(60000);

      // Should continue polling despite callback error
      expect(tracker.getActiveCount()).toBe(1);

      consoleErrorSpy.mockRestore();
    });
  });

  describe('stopTracking', () => {
    it('should stop tracking a specific transaction', async () => {
      const txid = 'abc123';

      tracker.trackConfirmations(txid);
      expect(tracker.getActiveCount()).toBe(1);

      tracker.stopTracking(txid);
      expect(tracker.getActiveCount()).toBe(0);

      // Fast-forward - no polls should happen
      await vi.advanceTimersByTimeAsync(60000);
      expect(getTransactionStatus).not.toHaveBeenCalled();
    });

    it('should not affect other transactions', async () => {
      const txid1 = 'abc123';
      const txid2 = 'def456';

      tracker.trackConfirmations(txid1);
      tracker.trackConfirmations(txid2);
      expect(tracker.getActiveCount()).toBe(2);

      tracker.stopTracking(txid1);
      expect(tracker.getActiveCount()).toBe(1);

      // Fast-forward - only txid2 should poll
      await vi.advanceTimersByTimeAsync(60000);
      expect(getTransactionStatus).toHaveBeenCalledWith(txid2);
      expect(getTransactionStatus).toHaveBeenCalledTimes(1);
    });

    it('should be safe to call for non-existent txid', () => {
      expect(() => tracker.stopTracking('nonexistent')).not.toThrow();
      expect(tracker.getActiveCount()).toBe(0);
    });
  });

  describe('stopAll', () => {
    it('should stop all active pollers', async () => {
      const txid1 = 'abc123';
      const txid2 = 'def456';
      const txid3 = 'ghi789';

      tracker.trackConfirmations(txid1);
      tracker.trackConfirmations(txid2);
      tracker.trackConfirmations(txid3);
      expect(tracker.getActiveCount()).toBe(3);

      tracker.stopAll();
      expect(tracker.getActiveCount()).toBe(0);

      // Fast-forward - no polls should happen
      await vi.advanceTimersByTimeAsync(60000);
      expect(getTransactionStatus).not.toHaveBeenCalled();
    });

    it('should be safe to call when no pollers active', () => {
      expect(() => tracker.stopAll()).not.toThrow();
      expect(tracker.getActiveCount()).toBe(0);
    });

    it('should be safe to call multiple times', () => {
      tracker.trackConfirmations('abc123');
      tracker.stopAll();
      tracker.stopAll();
      tracker.stopAll();

      expect(tracker.getActiveCount()).toBe(0);
    });
  });

  describe('getActiveCount', () => {
    it('should return 0 initially', () => {
      expect(tracker.getActiveCount()).toBe(0);
    });

    it('should increment when tracking starts', () => {
      tracker.trackConfirmations('abc123');
      expect(tracker.getActiveCount()).toBe(1);

      tracker.trackConfirmations('def456');
      expect(tracker.getActiveCount()).toBe(2);
    });

    it('should decrement when tracking stops', async () => {
      tracker.trackConfirmations('abc123');
      tracker.trackConfirmations('def456');
      expect(tracker.getActiveCount()).toBe(2);

      // Stop one
      tracker.stopTracking('abc123');
      expect(tracker.getActiveCount()).toBe(1);

      // Stop all
      tracker.stopAll();
      expect(tracker.getActiveCount()).toBe(0);
    });

    it('should decrement when polling completes naturally', async () => {
      getTransactionStatus.mockResolvedValue({ confirmations: 6 });

      tracker.trackConfirmations('abc123');
      expect(tracker.getActiveCount()).toBe(1);

      // Poll completes (6 confirmations)
      await vi.advanceTimersByTimeAsync(60000);
      expect(tracker.getActiveCount()).toBe(0);
    });
  });

  describe('integration scenarios', () => {
    it('should handle rapid confirmation progression', async () => {
      const txid = 'abc123';

      // Simulate rapid confirmations: 0 → 3 → 7
      getTransactionStatus
        .mockResolvedValueOnce({ confirmations: 0 })
        .mockResolvedValueOnce({ confirmations: 3 })
        .mockResolvedValueOnce({ confirmations: 7 });

      tracker.trackConfirmations(txid);

      // Poll 1: 0 confirmations
      await vi.advanceTimersByTimeAsync(60000);
      expect(onConfirmationUpdate).not.toHaveBeenCalled();

      // Poll 2: 3 confirmations
      await vi.advanceTimersByTimeAsync(60000);
      expect(onConfirmationUpdate).toHaveBeenCalledWith(txid, 3);

      // Poll 3: 7 confirmations (stops polling)
      await vi.advanceTimersByTimeAsync(60000);
      expect(onConfirmationUpdate).toHaveBeenCalledWith(txid, 7);
      expect(tracker.getActiveCount()).toBe(0);
    });

    it('should handle immediate 6+ confirmations (already confirmed)', async () => {
      const txid = 'abc123';

      // Transaction already has 10 confirmations
      getTransactionStatus.mockResolvedValue({ confirmations: 10 });

      tracker.trackConfirmations(txid);

      // First poll: 10 confirmations (stops immediately)
      await vi.advanceTimersByTimeAsync(60000);

      expect(onConfirmationUpdate).toHaveBeenCalledWith(txid, 10);
      expect(tracker.getActiveCount()).toBe(0);

      // No more polls
      await vi.advanceTimersByTimeAsync(60000);
      expect(getTransactionStatus).toHaveBeenCalledTimes(1);
    });

    it('should handle multiple transactions with different confirmation speeds', async () => {
      const txidFast = 'fast123';
      const txidSlow = 'slow456';

      // Fast: Goes to 6 confirmations immediately
      // Slow: Stays at 0 confirmations
      getTransactionStatus.mockImplementation((txid) => {
        if (txid === txidFast) {
          return Promise.resolve({ confirmations: 6 });
        } else {
          return Promise.resolve({ confirmations: 0 });
        }
      });

      tracker.trackConfirmations(txidFast);
      tracker.trackConfirmations(txidSlow);
      expect(tracker.getActiveCount()).toBe(2);

      // First poll: Fast completes, Slow continues
      await vi.advanceTimersByTimeAsync(60000);
      expect(tracker.getActiveCount()).toBe(1);

      // Second poll: Only Slow polls
      await vi.advanceTimersByTimeAsync(60000);
      expect(getTransactionStatus).toHaveBeenCalledTimes(3); // Fast: 1, Slow: 2
    });
  });
});
