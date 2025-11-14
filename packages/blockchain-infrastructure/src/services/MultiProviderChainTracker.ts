/**
 * MultiProviderChainTracker - Multi-provider fallback ChainTracker
 *
 * Implements fallback chain strategy across multiple ChainTracker providers.
 * Tries providers in order until one succeeds.
 *
 * LEAF SERVICE - No service dependencies
 *
 * Features:
 * - Fallback chain (try providers sequentially)
 * - Aggregated error reporting (all failures listed)
 * - Provider tracking for logging
 * - Automatic provider selection on success
 *
 * @see docs/02-SPRINTS/sprint-3A.5-real-chaintracker.md
 */
import type { ChainTracker } from '../types';

/**
 * Multi-provider ChainTracker with fallback support
 *
 * Tries providers in order: first → second → third → ...
 * Falls back to next provider if current fails
 */
export class MultiProviderChainTracker implements ChainTracker {
  private providers: ChainTracker[];

  constructor(providers: ChainTracker[]) {
    if (providers.length === 0) {
      throw new Error('At least one provider required for MultiProviderChainTracker');
    }
    this.providers = providers;
  }

  /**
   * Verify Merkle root for block height with fallback
   *
   * Tries each provider in order until one succeeds
   *
   * @param merkleRoot - Merkle root to verify
   * @param height - Block height
   * @returns true if any provider validates the root
   * @throws Error if all providers fail
   */
  async isValidRootForHeight(merkleRoot: string, height: number): Promise<boolean> {
    const errors: Array<{ providerIndex: number; error: unknown }> = [];

    for (let i = 0; i < this.providers.length; i++) {
      const provider = this.providers[i];
      if (!provider) continue;

      try {
        const result = await provider.isValidRootForHeight(merkleRoot, height);

        console.log(`[MultiProvider] Provider ${i} succeeded for height ${height}`);
        return result;
      } catch (error) {
        console.warn(`[MultiProvider] Provider ${i} failed, trying next:`, error);
        errors.push({ providerIndex: i, error });
      }
    }

    // All providers failed
    const errorMessages = errors
      .map((e) => `Provider ${e.providerIndex}: ${e.error}`)
      .join('; ');

    throw new Error(
      `[MultiProvider] All ${this.providers.length} providers failed to verify Merkle root. ` +
        `Errors: ${errorMessages}`
    );
  }

  /**
   * Get current block height with fallback
   *
   * Tries each provider in order until one succeeds
   *
   * @returns Current block height
   * @throws Error if all providers fail
   */
  async currentHeight(): Promise<number> {
    const errors: Array<{ providerIndex: number; error: unknown }> = [];

    for (let i = 0; i < this.providers.length; i++) {
      const provider = this.providers[i];
      if (!provider) continue;

      try {
        const height = await provider.currentHeight();

        console.log(`[MultiProvider] Provider ${i} succeeded for current height: ${height}`);
        return height;
      } catch (error) {
        console.warn(`[MultiProvider] Provider ${i} failed, trying next:`, error);
        errors.push({ providerIndex: i, error });
      }
    }

    // All providers failed
    const errorMessages = errors
      .map((e) => `Provider ${e.providerIndex}: ${e.error}`)
      .join('; ');

    throw new Error(
      `[MultiProvider] All ${this.providers.length} providers failed to get current height. ` +
        `Errors: ${errorMessages}`
    );
  }

  /**
   * Get Merkle proof for transaction with fallback
   *
   * Tries each provider in order until one returns a proof.
   * Returns null if transaction not confirmed (not an error).
   *
   * @param txid - Transaction ID
   * @returns Merkle proof if transaction confirmed, null otherwise
   */
  async getMerkleProof(txid: string): Promise<import('../types').MerkleProof | null> {
    const errors: Array<{ providerIndex: number; error: unknown }> = [];

    for (let i = 0; i < this.providers.length; i++) {
      const provider = this.providers[i];
      if (!provider) continue;

      try {
        const proof = await provider.getMerkleProof(txid);

        if (proof) {
          console.log(`[MultiProvider] Provider ${i} succeeded for merkle proof ${txid}`);
          return proof;
        }

        // Provider returned null (transaction not confirmed yet, not an error)
        console.log(`[MultiProvider] Provider ${i} returned null for ${txid}, trying next`);
      } catch (error) {
        console.warn(`[MultiProvider] Provider ${i} failed for merkle proof:`, error);
        errors.push({ providerIndex: i, error });
      }
    }

    // All providers returned null or failed - transaction not confirmed
    return null;
  }

  /**
   * Get number of configured providers
   *
   * @returns Number of providers
   */
  getProviderCount(): number {
    return this.providers.length;
  }
}
