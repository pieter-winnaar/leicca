/**
 * ChainTrackerFactory - Factory for creating ChainTracker instances
 *
 * Provides static factory methods for creating ChainTracker instances
 * with multi-provider fallback and production feature flag enforcement.
 *
 * CRITICAL SECURITY: NEVER allows MockChainTracker in production.
 *
 * LEAF SERVICE - No service dependencies
 *
 * @see docs/02-SPRINTS/sprint-3A.5-real-chaintracker.md
 */
import type { ChainTracker } from '../types';
import { WhatsOnChainChainTracker } from './WhatsOnChainChainTracker';
import { BabbageChainTracker } from './BabbageChainTracker';
import { MultiProviderChainTracker } from './MultiProviderChainTracker';

/**
 * ChainTracker Factory
 *
 * Provides factory methods for creating ChainTracker instances
 * with correct provider selection strategy.
 */
export class ChainTrackerFactory {
  /**
   * Create WhatsOnChain ChainTracker
   *
   * @param network - Network to use (main, test, stn)
   * @returns WhatsOnChainChainTracker instance
   */
  static createWhatsOnChain(network: 'main' | 'test' | 'stn' = 'main'): ChainTracker {
    return new WhatsOnChainChainTracker(network);
  }

  /**
   * Create Babbage Chaintracks ChainTracker
   *
   * @param network - Network to use (main, test, stn)
   * @returns BabbageChainTracker instance
   */
  static createBabbage(network: 'main' | 'test' | 'stn' = 'main'): ChainTracker {
    return new BabbageChainTracker(network);
  }

  /**
   * Create multi-provider ChainTracker with fallback
   *
   * @param providers - Array of ChainTracker providers in fallback order
   * @returns MultiProviderChainTracker instance
   * @throws Error if no providers given
   */
  static createMultiProvider(providers: ChainTracker[]): ChainTracker {
    return new MultiProviderChainTracker(providers);
  }

  /**
   * Create mock ChainTracker for testing
   *
   * SECURITY: Throws error if called in production environment
   *
   * @returns MockChainTracker instance
   * @throws Error if NODE_ENV === 'production'
   */
  static createMock(): ChainTracker {
    if (process.env.NODE_ENV === 'production') {
      throw new Error(
        '[ChainTrackerFactory] SECURITY VIOLATION: MockChainTracker is NOT allowed in production. ' +
          'MockChainTracker accepts ALL Merkle roots (always returns true), enabling fraudulent BEEF transactions. ' +
          'Use createDefault() or createMultiProvider() for production.'
      );
    }

    // Import MockChainTracker dynamically only in non-production
    // For now, throw error to prevent usage until proper mock is created
    throw new Error(
      '[ChainTrackerFactory] MockChainTracker not implemented. ' +
        'Use createWhatsOnChain() or createARC() for testing with real blockchain data.'
    );
  }

  /**
   * Create default ChainTracker with production-safe configuration
   *
   * Production mode (NODE_ENV === 'production'):
   * - Uses MultiProviderChainTracker with [Babbage Chaintracks, WhatsOnChain] fallback
   * - NEVER returns MockChainTracker
   *
   * Development mode:
   * - Uses Babbage Chaintracks ChainTracker
   *
   * @param network - Network to use (main, test, stn)
   * @returns ChainTracker instance
   */
  static createDefault(network: 'main' | 'test' | 'stn' = 'main'): ChainTracker {
    if (process.env.NODE_ENV === 'production') {
      // Production: Multi-provider fallback with real APIs only
      const providers: ChainTracker[] = [];

      // Priority 1: Babbage Chaintracks (purpose-built for SPV, no auth, no rate limits)
      providers.push(new BabbageChainTracker(network));

      // Priority 2: WhatsOnChain (widely available fallback)
      providers.push(new WhatsOnChainChainTracker(network));

      console.log(
        '[ChainTrackerFactory] Production mode - MultiProvider: Babbage Chaintracks → WhatsOnChain'
      );

      return new MultiProviderChainTracker(providers);
    }

    // Development: Babbage Chaintracks only
    console.log('[ChainTrackerFactory] Development mode - using Babbage Chaintracks');

    return new BabbageChainTracker(network);
  }
}

/**
 * ⚠️ PRODUCTION GUARD: MockChainTracker Prevention
 *
 * This guard MUST remain in ChainTrackerFactory to prevent
 * MockChainTracker usage in production.
 *
 * Why critical:
 * - MockChainTracker accepts ALL Merkle roots (always returns true)
 * - Attackers can send fraudulent BEEF transactions
 * - Users lose funds from invalid transactions
 *
 * Testing MockChainTracker:
 * - Set NODE_ENV=development or NODE_ENV=test
 * - Use ChainTrackerFactory.createMock() explicitly
 *
 * Production checklist:
 * - [ ] NODE_ENV=production set
 * - [ ] ChainTrackerFactory.createDefault() used
 * - [ ] Integration tests pass with real blockchain
 */
