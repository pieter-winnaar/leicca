/**
 * ChainTrackerFactory Tests
 *
 * SECURITY-CRITICAL: 100% coverage required
 *
 * Test coverage:
 * - Factory methods create correct instances
 * - createDefault() in production mode (mock NODE_ENV)
 * - createDefault() in development mode
 * - Feature flag prevents MockChainTracker in production
 * - Error thrown when MockChainTracker requested in production
 * - Multi-provider creation with different configurations
 */
import { describe, it, expect, beforeEach, afterEach, vi } from 'vitest';
import { ChainTrackerFactory } from '../src/services/ChainTrackerFactory';
import { WhatsOnChainChainTracker } from '../src/services/WhatsOnChainChainTracker';
import { BabbageChainTracker } from '../src/services/BabbageChainTracker';
import { MultiProviderChainTracker } from '../src/services/MultiProviderChainTracker';

describe('ChainTrackerFactory', () => {
  const originalEnv = process.env.NODE_ENV;

  afterEach(() => {
    // Restore environment variables
    process.env.NODE_ENV = originalEnv;
  });

  describe('createWhatsOnChain', () => {
    it('should create WhatsOnChainChainTracker with default network', () => {
      const tracker = ChainTrackerFactory.createWhatsOnChain();

      expect(tracker).toBeInstanceOf(WhatsOnChainChainTracker);
    });

    it('should create WhatsOnChainChainTracker with mainnet', () => {
      const tracker = ChainTrackerFactory.createWhatsOnChain('main');

      expect(tracker).toBeInstanceOf(WhatsOnChainChainTracker);
    });

    it('should create WhatsOnChainChainTracker with testnet', () => {
      const tracker = ChainTrackerFactory.createWhatsOnChain('test');

      expect(tracker).toBeInstanceOf(WhatsOnChainChainTracker);
    });

    it('should create WhatsOnChainChainTracker with STN', () => {
      const tracker = ChainTrackerFactory.createWhatsOnChain('stn');

      expect(tracker).toBeInstanceOf(WhatsOnChainChainTracker);
    });
  });

  describe('createBabbage', () => {
    it('should create BabbageChainTracker with default network', () => {
      const tracker = ChainTrackerFactory.createBabbage();

      expect(tracker).toBeInstanceOf(BabbageChainTracker);
    });

    it('should create BabbageChainTracker with mainnet', () => {
      const tracker = ChainTrackerFactory.createBabbage('main');

      expect(tracker).toBeInstanceOf(BabbageChainTracker);
    });

    it('should create BabbageChainTracker with testnet', () => {
      const tracker = ChainTrackerFactory.createBabbage('test');

      expect(tracker).toBeInstanceOf(BabbageChainTracker);
    });
  });

  describe('createMultiProvider', () => {
    it('should create MultiProviderChainTracker with providers', () => {
      const providers = [
        ChainTrackerFactory.createWhatsOnChain(),
        ChainTrackerFactory.createBabbage(),
      ];

      const tracker = ChainTrackerFactory.createMultiProvider(providers);

      expect(tracker).toBeInstanceOf(MultiProviderChainTracker);
      expect(tracker.getProviderCount()).toBe(2);
    });

    it('should throw error if no providers given', () => {
      expect(() => ChainTrackerFactory.createMultiProvider([])).toThrow(
        'At least one provider required'
      );
    });
  });

  describe('createMock', () => {
    it('should throw error in production environment', () => {
      process.env.NODE_ENV = 'production';

      expect(() => ChainTrackerFactory.createMock()).toThrow(/SECURITY VIOLATION/);
      expect(() => ChainTrackerFactory.createMock()).toThrow(/MockChainTracker is NOT allowed/);
    });

    it('should throw error with security explanation', () => {
      process.env.NODE_ENV = 'production';

      try {
        ChainTrackerFactory.createMock();
        expect.fail('Should have thrown error');
      } catch (error: any) {
        expect(error.message).toContain('SECURITY VIOLATION');
        expect(error.message).toContain('accepts ALL Merkle roots');
        expect(error.message).toContain('fraudulent BEEF transactions');
      }
    });

    it('should throw not implemented error in development', () => {
      process.env.NODE_ENV = 'development';

      expect(() => ChainTrackerFactory.createMock()).toThrow(/MockChainTracker not implemented/);
    });

    it('should throw not implemented error in test mode', () => {
      process.env.NODE_ENV = 'test';

      expect(() => ChainTrackerFactory.createMock()).toThrow(/MockChainTracker not implemented/);
    });
  });

  describe('createDefault', () => {
    it('should create MultiProviderChainTracker in production mode', () => {
      process.env.NODE_ENV = 'production';

      const tracker = ChainTrackerFactory.createDefault();

      expect(tracker).toBeInstanceOf(MultiProviderChainTracker);
    });

    it('should include Babbage and WhatsOnChain providers in production', () => {
      process.env.NODE_ENV = 'production';

      const consoleSpy = vi.spyOn(console, 'log').mockImplementation(() => {});

      const tracker = ChainTrackerFactory.createDefault();

      // Should have exactly 2 providers: Babbage Chaintracks + WhatsOnChain
      expect(tracker.getProviderCount()).toBe(2);

      consoleSpy.mockRestore();
    });

    it('should NEVER return MockChainTracker in production', () => {
      process.env.NODE_ENV = 'production';

      const tracker = ChainTrackerFactory.createDefault();

      // Verify it's MultiProvider (not Mock)
      expect(tracker).toBeInstanceOf(MultiProviderChainTracker);
      expect(tracker).not.toBeInstanceOf(WhatsOnChainChainTracker); // Not single provider
    });

    it('should use Babbage ChainTracker in development mode', () => {
      process.env.NODE_ENV = 'development';

      const consoleSpy = vi.spyOn(console, 'log').mockImplementation(() => {});

      const tracker = ChainTrackerFactory.createDefault();

      expect(tracker).toBeInstanceOf(BabbageChainTracker);

      consoleSpy.mockRestore();
    });

    it('should support custom network in production', () => {
      process.env.NODE_ENV = 'production';

      const consoleSpy = vi.spyOn(console, 'log').mockImplementation(() => {});

      const tracker = ChainTrackerFactory.createDefault('test');

      expect(tracker).toBeInstanceOf(MultiProviderChainTracker);

      consoleSpy.mockRestore();
    });

    it('should support custom network in development', () => {
      process.env.NODE_ENV = 'development';

      const consoleSpy = vi.spyOn(console, 'log').mockImplementation(() => {});

      const tracker = ChainTrackerFactory.createDefault('stn');

      expect(tracker).toBeInstanceOf(BabbageChainTracker);

      consoleSpy.mockRestore();
    });

    it('should log provider configuration in production', () => {
      process.env.NODE_ENV = 'production';

      const consoleSpy = vi.spyOn(console, 'log').mockImplementation(() => {});

      ChainTrackerFactory.createDefault();

      expect(consoleSpy).toHaveBeenCalledWith(
        expect.stringContaining('Production mode - MultiProvider: Babbage Chaintracks → WhatsOnChain')
      );

      consoleSpy.mockRestore();
    });
  });

  describe('Production Security Guard', () => {
    it('should prevent MockChainTracker usage in production via createMock', () => {
      process.env.NODE_ENV = 'production';

      expect(() => ChainTrackerFactory.createMock()).toThrow(/SECURITY VIOLATION/);
    });

    it('should never return MockChainTracker from createDefault in production', () => {
      process.env.NODE_ENV = 'production';

      const tracker = ChainTrackerFactory.createDefault();

      // Verify it's a production-safe ChainTracker
      expect(tracker).toBeInstanceOf(MultiProviderChainTracker);
    });

    it('should enforce production guard even without NODE_ENV set', () => {
      // Test undefined NODE_ENV (should NOT be production)
      delete process.env.NODE_ENV;

      const tracker = ChainTrackerFactory.createDefault();

      // Should default to development behavior (Babbage Chaintracks only)
      expect(tracker).toBeInstanceOf(BabbageChainTracker);
    });
  });
});
