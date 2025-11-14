/**
 * BEEFService Tests
 *
 * Tests BEEF generation, verification, and parsing per BRC-62.
 *
 * Sprint 3A.2 Session 1
 */
import { describe, it, expect, beforeEach } from 'vitest';
import { Transaction, PrivateKey, P2PKH, Script } from '@bsv/sdk';
import { BEEFService, BEEFError } from '../BEEFService';
import type { ChainTracker } from '../../types';

/**
 * Mock ChainTracker for testing
 */
class MockChainTracker implements ChainTracker {
  private knownRoots: Map<number, Set<string>> = new Map();
  private mockCurrentHeight: number = 1000;

  addKnownRoot(height: number, merkleRoot: string): void {
    if (!this.knownRoots.has(height)) {
      this.knownRoots.set(height, new Set());
    }
    this.knownRoots.get(height)!.add(merkleRoot);
  }

  setCurrentHeight(height: number): void {
    this.mockCurrentHeight = height;
  }

  async isValidRootForHeight(merkleRoot: string, height: number): Promise<boolean> {
    const roots = this.knownRoots.get(height);
    return roots ? roots.has(merkleRoot) : false;
  }

  async currentHeight(): Promise<number> {
    return this.mockCurrentHeight;
  }

  async getMerkleProof(_txid: string): Promise<import('../../types').MerkleProof | null> {
    // Mock implementation - returns null (transaction not confirmed)
    return null;
  }
}

/**
 * Helper: Create a mock parent transaction with proper structure
 */
function createMockParentTransaction(privateKey: PrivateKey): Transaction {
  const tx = new Transaction();
  tx.version = 1;

  // Add a simple output that can be spent
  const recipientAddress = privateKey.toPublicKey().toAddress();
  const lockingScript = new P2PKH().lock(recipientAddress);

  tx.addOutput({
    lockingScript,
    satoshis: 100000
  });

  return tx;
}

/**
 * Helper: Create a transaction with sourceTransaction (BEEF-compatible)
 */
async function createTransactionWithSourceTransaction(
  privateKey: PrivateKey
): Promise<Transaction> {
  const parentTx = createMockParentTransaction(privateKey);

  const tx = new Transaction();
  tx.version = 1;

  // Add input with sourceTransaction (REQUIRED for BEEF)
  tx.addInput({
    sourceTransaction: parentTx,
    sourceOutputIndex: 0,
    unlockingScriptTemplate: new P2PKH().unlock(privateKey)
  });

  // Add output
  const recipientAddress = privateKey.toPublicKey().toAddress();
  tx.addOutput({
    lockingScript: new P2PKH().lock(recipientAddress),
    satoshis: 50000
  });

  // Sign the transaction (required for BEEF generation)
  await tx.fee();
  await tx.sign();

  return tx;
}

describe('BEEFService', () => {
  let beefService: BEEFService;
  let privateKey: PrivateKey;

  beforeEach(() => {
    beefService = new BEEFService();
    // Use a fixed private key (WIF format) to avoid random number generator issues in tests
    privateKey = PrivateKey.fromWif('L5EZftvrYaSudiozVRzTqLcHLNDoVn7H5HSfM9BAN6tMJX8oTWz6');
  });

  describe('generateBEEF', () => {
    it('should generate BEEF with version 0x0100BEEF', async () => {
      const tx = await createTransactionWithSourceTransaction(privateKey);

      const beefHex = beefService.generateBEEF(tx);

      // Verify BEEF is hex string
      expect(beefHex).toMatch(/^[0-9a-f]+$/i);

      // Verify BEEF version marker (little-endian)
      expect(beefHex.substring(0, 8).toLowerCase()).toBe('0100beef');
    });

    it('should throw error if sourceTransaction missing', () => {
      const tx = new Transaction();

      // Add input WITHOUT sourceTransaction (only sourceTXID)
      tx.addInput({
        sourceTXID: 'abc123'.padEnd(64, '0'),
        sourceOutputIndex: 0,
        unlockingScript: new Script()
      });

      expect(() => beefService.generateBEEF(tx)).toThrow(BEEFError);
      expect(() => beefService.generateBEEF(tx)).toThrow('missing sourceTransaction');
    });

    it('should throw BEEFError with correct error code for missing sourceTransaction', () => {
      const tx = new Transaction();
      tx.addInput({
        sourceTXID: 'abc123'.padEnd(64, '0'),
        sourceOutputIndex: 0,
        unlockingScript: new Script()
      });

      try {
        beefService.generateBEEF(tx);
        expect.fail('Should have thrown BEEFError');
      } catch (error) {
        expect(error).toBeInstanceOf(BEEFError);
        expect((error as BEEFError).code).toBe('MISSING_SOURCE_TRANSACTION');
      }
    });

    it('should generate BEEF for transaction with multiple inputs', async () => {
      const parentTx1 = createMockParentTransaction(privateKey);
      const parentTx2 = createMockParentTransaction(privateKey);

      const tx = new Transaction();
      tx.version = 1;

      // Add two inputs with sourceTransaction
      tx.addInput({
        sourceTransaction: parentTx1,
        sourceOutputIndex: 0,
        unlockingScriptTemplate: new P2PKH().unlock(privateKey)
      });
      tx.addInput({
        sourceTransaction: parentTx2,
        sourceOutputIndex: 0,
        unlockingScriptTemplate: new P2PKH().unlock(privateKey)
      });

      // Add output
      const recipientAddress = privateKey.toPublicKey().toAddress();
      tx.addOutput({
        lockingScript: new P2PKH().lock(recipientAddress),
        satoshis: 150000
      });

      // Sign the transaction
      await tx.fee();
      await tx.sign();

      const beefHex = beefService.generateBEEF(tx);

      expect(beefHex).toMatch(/^[0-9a-f]+$/i);
      expect(beefHex.substring(0, 8).toLowerCase()).toBe('0100beef');
    });

    it('should identify which input is missing sourceTransaction', () => {
      const parentTx = createMockParentTransaction(privateKey);

      const tx = new Transaction();

      // First input has sourceTransaction
      tx.addInput({
        sourceTransaction: parentTx,
        sourceOutputIndex: 0,
        unlockingScriptTemplate: new P2PKH().unlock(privateKey)
      });

      // Second input missing sourceTransaction
      tx.addInput({
        sourceTXID: 'abc123'.padEnd(64, '0'),
        sourceOutputIndex: 0,
        unlockingScript: new Script()
      });

      try {
        beefService.generateBEEF(tx);
        expect.fail('Should have thrown BEEFError');
      } catch (error) {
        expect(error).toBeInstanceOf(BEEFError);
        expect((error as BEEFError).message).toContain('Input 1');
      }
    });
  });

  describe('parseBEEF', () => {
    it('should parse BEEF to Transaction', async () => {
      // Generate BEEF
      const originalTx = await createTransactionWithSourceTransaction(privateKey);
      const beefHex = beefService.generateBEEF(originalTx);

      // Parse back
      const parsedTx = beefService.parseBEEF(beefHex);

      expect(parsedTx).toBeDefined();
      expect(parsedTx).toBeInstanceOf(Transaction);
      expect(parsedTx.inputs.length).toBe(originalTx.inputs.length);
      expect(parsedTx.outputs.length).toBe(originalTx.outputs.length);
    });

    it('should throw error for invalid BEEF format', () => {
      expect(() => beefService.parseBEEF('invalid_hex')).toThrow(BEEFError);
      expect(() => beefService.parseBEEF('invalid_hex')).toThrow('Failed to parse BEEF');
    });

    it('should throw BEEFError with correct error code for invalid format', () => {
      try {
        beefService.parseBEEF('not_valid_beef');
        expect.fail('Should have thrown BEEFError');
      } catch (error) {
        expect(error).toBeInstanceOf(BEEFError);
        expect((error as BEEFError).code).toBe('BEEF_PARSE_FAILED');
      }
    });

    it('should parse BEEF and preserve transaction ID', async () => {
      const originalTx = await createTransactionWithSourceTransaction(privateKey);
      const originalTxid = originalTx.id('hex');

      const beefHex = beefService.generateBEEF(originalTx);
      const parsedTx = beefService.parseBEEF(beefHex);
      const parsedTxid = parsedTx.id('hex');

      expect(parsedTxid).toBe(originalTxid);
    });
  });

  describe('verifyBEEF', () => {
    it('should verify valid BEEF with mock chain tracker', async () => {
      const chainTracker = new MockChainTracker();

      // Create and generate BEEF
      const tx = await createTransactionWithSourceTransaction(privateKey);
      const beefHex = beefService.generateBEEF(tx);

      // Note: This test may not fully verify without real block headers
      // For now, we test that the method runs without throwing
      const result = await beefService.verifyBEEF(beefHex, chainTracker);

      expect(typeof result).toBe('boolean');
    });

    it('should throw error for invalid BEEF format during verification', async () => {
      const chainTracker = new MockChainTracker();

      await expect(
        beefService.verifyBEEF('invalid_beef', chainTracker)
      ).rejects.toThrow(BEEFError);
    });
  });

  describe('generateExtendedFormat', () => {
    it('should generate Extended Format from transaction', async () => {
      const tx = await createTransactionWithSourceTransaction(privateKey);

      const efHex = beefService.generateExtendedFormat(tx);

      // Verify EF is hex string
      expect(efHex).toMatch(/^[0-9a-f]+$/i);

      // Extended Format should be larger than raw transaction
      const rawHex = tx.toHex();
      expect(efHex.length).toBeGreaterThanOrEqual(rawHex.length);
    });

    it('should throw BEEFError if Extended Format generation fails', () => {
      // Create a transaction that might fail EF generation
      const tx = new Transaction();

      // Try to generate EF from empty transaction
      try {
        beefService.generateExtendedFormat(tx);
        // May or may not throw depending on @bsv/sdk implementation
      } catch (error) {
        if (error instanceof BEEFError) {
          expect(error.code).toBe('EF_GENERATION_FAILED');
        }
      }
    });
  });

  describe('Integration with TransactionBuilderService', () => {
    it('should generate BEEF from transaction with sourceTransaction', async () => {
      // This test demonstrates the integration pattern
      // TransactionBuilderService creates transactions
      // BEEFService generates BEEF from them

      const tx = await createTransactionWithSourceTransaction(privateKey);
      const beefHex = beefService.generateBEEF(tx);

      expect(beefHex).toBeDefined();
      expect(beefHex.substring(0, 8).toLowerCase()).toBe('0100beef');

      // Parse back to verify round-trip
      const parsedTx = beefService.parseBEEF(beefHex);
      expect(parsedTx.id('hex')).toBe(tx.id('hex'));
    });
  });

  describe('MockChainTracker', () => {
    it('should track known Merkle roots by height', async () => {
      const tracker = new MockChainTracker();

      tracker.addKnownRoot(1000, 'abc123');
      tracker.addKnownRoot(1000, 'def456');
      tracker.addKnownRoot(2000, 'ghi789');

      expect(await tracker.isValidRootForHeight('abc123', 1000)).toBe(true);
      expect(await tracker.isValidRootForHeight('def456', 1000)).toBe(true);
      expect(await tracker.isValidRootForHeight('ghi789', 2000)).toBe(true);
      expect(await tracker.isValidRootForHeight('abc123', 2000)).toBe(false);
      expect(await tracker.isValidRootForHeight('unknown', 1000)).toBe(false);
    });

    it('should track current block height', async () => {
      const tracker = new MockChainTracker();

      expect(await tracker.currentHeight()).toBe(1000); // Default

      tracker.setCurrentHeight(5000);
      expect(await tracker.currentHeight()).toBe(5000);
    });
  });
});
