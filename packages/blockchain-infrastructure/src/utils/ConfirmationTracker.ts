/**
 * ConfirmationTracker - Background confirmation polling utility
 *
 * NOT a service - just a helper class for confirmation tracking
 *
 * Purpose:
 * - Poll blockchain for transaction confirmations every 60 seconds
 * - Stop at 6+ confirmations or 48 hours timeout
 * - Notify parent service via callbacks
 *
 * Design Pattern:
 * - Receives callbacks in constructor (dependency injection pattern)
 * - Manages setInterval pollers for multiple transactions
 * - Stops polling when confirmations >= 6 or timeout reached
 *
 * NOTE(Sprint-3A.5): Will be replaced with WebSocket block notifications
 *
 * @see docs/02-SPRINTS/sprint-3A.3B-intermediate-cleanup-sprint.md
 */

/**
 * ConfirmationTracker utility class
 *
 * Tracks confirmation status for broadcast transactions via background polling.
 * Polls every 60 seconds until 6+ confirmations or 48 hours elapsed.
 */
export class ConfirmationTracker {
  /**
   * Active confirmation pollers by txid
   * Maps transaction ID to setInterval timer handle
   */
  private confirmationPollers: Map<string, NodeJS.Timeout> = new Map();

  /**
   * Polling configuration
   */
  private readonly MAX_ATTEMPTS = 2880; // 48 hours at 60-second intervals
  private readonly POLL_INTERVAL = 60000; // 60 seconds in milliseconds
  private readonly MIN_CONFIRMATIONS = 6; // Stop polling at 6+ confirmations

  /**
   * Create ConfirmationTracker with required callbacks
   *
   * @param onConfirmationUpdate - Called when confirmations update (at 1+ and 6+ confirmations)
   * @param getTransactionStatus - Called to query current confirmation count
   */
  constructor(
    private readonly onConfirmationUpdate: (
      txid: string,
      confirmations: number
    ) => Promise<void>,
    private readonly getTransactionStatus: (
      txid: string
    ) => Promise<{ confirmations: number }>
  ) {}

  /**
   * Start tracking confirmations for a transaction
   *
   * Polls every 60 seconds until:
   * - 6+ confirmations (calls onConfirmationUpdate)
   * - 48 hours elapsed (2880 attempts)
   *
   * Prevents duplicate pollers for same txid.
   * Calls onConfirmationUpdate at first confirmation (>=1) and at 6+ confirmations.
   *
   * @param txid - Transaction ID to track
   */
  trackConfirmations(txid: string): void {
    // Prevent duplicate pollers
    if (this.confirmationPollers.has(txid)) {
      return;
    }

    let attempts = 0;

    const poller = setInterval(async () => {
      attempts++;

      try {
        const status = await this.getTransactionStatus(txid);

        // Notify parent at first confirmation (confirmations >= 1)
        // and at 6+ confirmations
        if (status.confirmations >= 1 || status.confirmations >= this.MIN_CONFIRMATIONS) {
          await this.onConfirmationUpdate(txid, status.confirmations);
        }

        if (status.confirmations >= this.MIN_CONFIRMATIONS) {
          // Stop polling at 6+ confirmations
          clearInterval(poller);
          this.confirmationPollers.delete(txid);
        } else if (attempts >= this.MAX_ATTEMPTS) {
          // Timeout after 48 hours
          console.warn(
            `[ConfirmationTracker] Timeout for ${txid} after 48 hours (${this.MAX_ATTEMPTS} attempts)`
          );
          clearInterval(poller);
          this.confirmationPollers.delete(txid);
        }
      } catch (error) {
        // Log error but continue polling (transient network errors)
        console.error(
          `[ConfirmationTracker] Error tracking ${txid}:`,
          error
        );

        // Stop after max attempts even on error
        if (attempts >= this.MAX_ATTEMPTS) {
          clearInterval(poller);
          this.confirmationPollers.delete(txid);
        }
      }
    }, this.POLL_INTERVAL);

    // Store poller for cleanup
    this.confirmationPollers.set(txid, poller);
  }

  /**
   * Stop tracking a specific transaction
   *
   * Clears the polling interval and removes from active pollers.
   * Safe to call even if txid is not being tracked.
   *
   * @param txid - Transaction ID to stop tracking
   */
  stopTracking(txid: string): void {
    const poller = this.confirmationPollers.get(txid);
    if (poller) {
      clearInterval(poller);
      this.confirmationPollers.delete(txid);
    }
  }

  /**
   * Stop all confirmation pollers
   *
   * Clears all active polling intervals and resets internal state.
   * Called by service cleanup/disposal to prevent memory leaks.
   */
  stopAll(): void {
    for (const poller of this.confirmationPollers.values()) {
      clearInterval(poller);
    }
    this.confirmationPollers.clear();
  }

  /**
   * Get active tracker count (for testing)
   *
   * @returns Number of transactions currently being tracked
   */
  getActiveCount(): number {
    return this.confirmationPollers.size;
  }
}

/**
 * Calculate confirmations for a transaction
 *
 * Per BRC-100 spec, confirmations are calculated on-demand as:
 * currentHeight - blockHeight + 1
 *
 * @param blockHeight - Block height when transaction was confirmed
 * @param currentHeight - Current blockchain height
 * @returns Number of confirmations (0 if blockHeight not set)
 *
 * @example
 * // Transaction confirmed at block 919426, current height 919492
 * calculateConfirmations(919426, 919492) // Returns 67
 *
 * // Transaction not yet confirmed
 * calculateConfirmations(undefined, 919492) // Returns 0
 */
export function calculateConfirmations(
  blockHeight: number | undefined,
  currentHeight: number
): number {
  if (!blockHeight) return 0;
  return Math.max(0, currentHeight - blockHeight + 1);
}
