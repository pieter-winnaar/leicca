/**
 * BasketManager tests
 *
 * Tests basket operations utility functions
 */

import { describe, it, expect, beforeEach } from 'vitest';
import { BasketManager } from '../../src/utils/BasketManager';
import type { BasketState } from '../../src/types';

describe('BasketManager', () => {
  let basketManager: BasketManager;
  let baskets: BasketState;

  beforeEach(() => {
    basketManager = new BasketManager();
    baskets = {};
  });

  describe('assignToBasket', () => {
    it('should create basket if it does not exist', () => {
      basketManager.assignToBasket(baskets, 'test-basket', {
        outpoint: 'txid1.0',
        satoshis: 1000,
        lockingScript: 'script1',
        tags: ['tag1'],
      });

      expect(baskets['test-basket']).toBeDefined();
      expect(baskets['test-basket'].utxos).toHaveLength(1);
      expect(baskets['test-basket'].utxos[0].outpoint).toBe('txid1.0');
    });

    it('should add UTXO to existing basket', () => {
      // Create basket with first UTXO
      basketManager.assignToBasket(baskets, 'test-basket', {
        outpoint: 'txid1.0',
        satoshis: 1000,
        lockingScript: 'script1',
        tags: ['tag1'],
      });

      // Add second UTXO to same basket
      basketManager.assignToBasket(baskets, 'test-basket', {
        outpoint: 'txid2.0',
        satoshis: 2000,
        lockingScript: 'script2',
        tags: ['tag2'],
      });

      expect(baskets['test-basket'].utxos).toHaveLength(2);
      expect(baskets['test-basket'].utxos[0].outpoint).toBe('txid1.0');
      expect(baskets['test-basket'].utxos[1].outpoint).toBe('txid2.0');
    });

    it('should preserve customInstructions', () => {
      basketManager.assignToBasket(baskets, 'test-basket', {
        outpoint: 'txid1.0',
        satoshis: 1000,
        lockingScript: 'script1',
        tags: ['tag1'],
        customInstructions: '{"invoiceId":"test"}',
      });

      expect(baskets['test-basket'].utxos[0].customInstructions).toBe('{"invoiceId":"test"}');
    });
  });

  describe('cleanupSpentUtxos', () => {
    beforeEach(() => {
      // Setup baskets with UTXOs
      baskets['basket1'] = {
        utxos: [
          { outpoint: 'txid1.0', satoshis: 1000, lockingScript: 'script1', tags: [] },
          { outpoint: 'txid2.0', satoshis: 2000, lockingScript: 'script2', tags: [] },
        ],
      };
      baskets['basket2'] = {
        utxos: [
          { outpoint: 'txid3.0', satoshis: 3000, lockingScript: 'script3', tags: [] },
          { outpoint: 'txid1.0', satoshis: 1000, lockingScript: 'script1', tags: [] }, // Duplicate in basket2
        ],
      };
    });

    it('should remove spent UTXOs from all baskets', () => {
      basketManager.cleanupSpentUtxos(baskets, ['txid1.0']);

      // txid1.0 removed from basket1
      expect(baskets['basket1'].utxos).toHaveLength(1);
      expect(baskets['basket1'].utxos[0].outpoint).toBe('txid2.0');

      // txid1.0 removed from basket2
      expect(baskets['basket2'].utxos).toHaveLength(1);
      expect(baskets['basket2'].utxos[0].outpoint).toBe('txid3.0');
    });

    it('should remove multiple spent UTXOs', () => {
      basketManager.cleanupSpentUtxos(baskets, ['txid1.0', 'txid3.0']);

      expect(baskets['basket1'].utxos).toHaveLength(1);
      expect(baskets['basket1'].utxos[0].outpoint).toBe('txid2.0');

      expect(baskets['basket2'].utxos).toHaveLength(0);
    });

    it('should handle empty spent list', () => {
      basketManager.cleanupSpentUtxos(baskets, []);

      expect(baskets['basket1'].utxos).toHaveLength(2);
      expect(baskets['basket2'].utxos).toHaveLength(2);
    });

    it('should handle non-existent outpoints', () => {
      basketManager.cleanupSpentUtxos(baskets, ['txid-nonexistent.0']);

      expect(baskets['basket1'].utxos).toHaveLength(2);
      expect(baskets['basket2'].utxos).toHaveLength(2);
    });

    it('should handle empty baskets', () => {
      baskets['empty-basket'] = { utxos: [] };

      basketManager.cleanupSpentUtxos(baskets, ['txid1.0']);

      expect(baskets['empty-basket'].utxos).toHaveLength(0);
    });
  });

  describe('relinquishOutput', () => {
    beforeEach(() => {
      baskets['basket1'] = {
        utxos: [
          { outpoint: 'txid1.0', satoshis: 1000, lockingScript: 'script1', tags: [] },
          { outpoint: 'txid2.0', satoshis: 2000, lockingScript: 'script2', tags: [] },
        ],
      };
      baskets['basket2'] = {
        utxos: [
          { outpoint: 'txid3.0', satoshis: 3000, lockingScript: 'script3', tags: [] },
          { outpoint: 'txid1.0', satoshis: 1000, lockingScript: 'script1', tags: [] },
        ],
      };
    });

    it('should remove output from specific basket', () => {
      basketManager.relinquishOutput(baskets, 'txid1.0', 'basket1');

      // Removed from basket1
      expect(baskets['basket1'].utxos).toHaveLength(1);
      expect(baskets['basket1'].utxos[0].outpoint).toBe('txid2.0');

      // Still in basket2
      expect(baskets['basket2'].utxos).toHaveLength(2);
      expect(baskets['basket2'].utxos.some((u) => u.outpoint === 'txid1.0')).toBe(true);
    });

    it('should remove output from all baskets when basket not specified', () => {
      basketManager.relinquishOutput(baskets, 'txid1.0');

      // Removed from basket1
      expect(baskets['basket1'].utxos).toHaveLength(1);
      expect(baskets['basket1'].utxos[0].outpoint).toBe('txid2.0');

      // Removed from basket2
      expect(baskets['basket2'].utxos).toHaveLength(1);
      expect(baskets['basket2'].utxos[0].outpoint).toBe('txid3.0');
    });

    it('should handle non-existent basket gracefully', () => {
      // Should not throw
      basketManager.relinquishOutput(baskets, 'txid1.0', 'nonexistent-basket');

      // Original baskets unchanged
      expect(baskets['basket1'].utxos).toHaveLength(2);
      expect(baskets['basket2'].utxos).toHaveLength(2);
    });

    it('should handle non-existent outpoint', () => {
      basketManager.relinquishOutput(baskets, 'txid-nonexistent.0', 'basket1');

      // Baskets unchanged
      expect(baskets['basket1'].utxos).toHaveLength(2);
      expect(baskets['basket2'].utxos).toHaveLength(2);
    });
  });

  describe('listOutputs', () => {
    beforeEach(() => {
      baskets['basket1'] = {
        utxos: [
          { outpoint: 'txid1.0', satoshis: 1000, lockingScript: 'script1', tags: ['tag1', 'tag2'] },
          { outpoint: 'txid2.0', satoshis: 2000, lockingScript: 'script2', tags: ['tag2', 'tag3'] },
        ],
      };
      baskets['basket2'] = {
        utxos: [
          { outpoint: 'txid3.0', satoshis: 3000, lockingScript: 'script3', tags: ['tag1'] },
          { outpoint: 'txid4.0', satoshis: 4000, lockingScript: 'script4', tags: ['tag3'] },
        ],
      };
    });

    it('should list all outputs when no filters provided', () => {
      const outputs = basketManager.listOutputs(baskets);

      expect(outputs).toHaveLength(4);
      expect(outputs.map((o) => o.outpoint)).toEqual([
        'txid1.0',
        'txid2.0',
        'txid3.0',
        'txid4.0',
      ]);
    });

    it('should filter by basket', () => {
      const outputs = basketManager.listOutputs(baskets, { basket: 'basket1' });

      expect(outputs).toHaveLength(2);
      expect(outputs.map((o) => o.outpoint)).toEqual(['txid1.0', 'txid2.0']);
    });

    it('should return empty array for non-existent basket', () => {
      const outputs = basketManager.listOutputs(baskets, { basket: 'nonexistent' });

      expect(outputs).toHaveLength(0);
    });

    it('should filter by tags with "any" mode (default)', () => {
      const outputs = basketManager.listOutputs(baskets, {
        tags: ['tag1'],
      });

      expect(outputs).toHaveLength(2); // txid1.0, txid3.0
      expect(outputs.map((o) => o.outpoint).sort()).toEqual(['txid1.0', 'txid3.0']);
    });

    it('should filter by tags with "any" mode (explicit)', () => {
      const outputs = basketManager.listOutputs(baskets, {
        tags: ['tag1', 'tag3'],
        tagQueryMode: 'any',
      });

      expect(outputs).toHaveLength(4); // All have tag1 or tag3
    });

    it('should filter by tags with "all" mode', () => {
      const outputs = basketManager.listOutputs(baskets, {
        tags: ['tag1', 'tag2'],
        tagQueryMode: 'all',
      });

      expect(outputs).toHaveLength(1); // Only txid1.0 has both tag1 and tag2
      expect(outputs[0].outpoint).toBe('txid1.0');
    });

    it('should combine basket and tag filters', () => {
      const outputs = basketManager.listOutputs(baskets, {
        basket: 'basket1',
        tags: ['tag1'],
        tagQueryMode: 'any',
      });

      expect(outputs).toHaveLength(1); // Only txid1.0 in basket1 with tag1
      expect(outputs[0].outpoint).toBe('txid1.0');
    });

    it('should return empty array when tag filter matches nothing', () => {
      const outputs = basketManager.listOutputs(baskets, {
        tags: ['nonexistent-tag'],
      });

      expect(outputs).toHaveLength(0);
    });

    it('should preserve customInstructions in output', () => {
      baskets['basket1'].utxos[0].customInstructions = '{"test":"data"}';

      const outputs = basketManager.listOutputs(baskets);

      const output = outputs.find((o) => o.outpoint === 'txid1.0');
      expect(output?.customInstructions).toBe('{"test":"data"}');
    });

    it('should handle empty baskets', () => {
      const outputs = basketManager.listOutputs({});

      expect(outputs).toHaveLength(0);
    });
  });

  describe('findUtxo', () => {
    it('should find UTXO in basket', () => {
      baskets['basket1'] = {
        utxos: [
          {
            outpoint: 'txid123.0',
            satoshis: 1000,
            lockingScript: '76a914...88ac',
            tags: [],
          },
        ],
      };

      const result = basketManager.findUtxo(baskets, 'txid123.0');
      expect(result).toBeDefined();
      expect(result?.satoshis).toBe(1000);
      expect(result?.lockingScript).toBe('76a914...88ac');
    });

    it('should find UTXO with customInstructions', () => {
      baskets['basket1'] = {
        utxos: [
          {
            outpoint: 'txid123.0',
            satoshis: 1000,
            lockingScript: '76a914...88ac',
            tags: [],
            customInstructions: '{"key":"value"}',
          },
        ],
      };

      const result = basketManager.findUtxo(baskets, 'txid123.0');
      expect(result).toBeDefined();
      expect(result?.customInstructions).toBe('{"key":"value"}');
    });

    it('should return undefined if UTXO not found', () => {
      baskets['basket1'] = {
        utxos: [
          {
            outpoint: 'txid123.0',
            satoshis: 1000,
            lockingScript: '76a914...88ac',
            tags: [],
          },
        ],
      };

      const result = basketManager.findUtxo(baskets, 'nonexistent.0');
      expect(result).toBeUndefined();
    });

    it('should return undefined for empty baskets', () => {
      const result = basketManager.findUtxo({}, 'txid123.0');
      expect(result).toBeUndefined();
    });

    it('should search across multiple baskets', () => {
      baskets['basket1'] = {
        utxos: [
          {
            outpoint: 'txid111.0',
            satoshis: 1000,
            lockingScript: '76a914...88ac',
            tags: [],
          },
        ],
      };
      baskets['basket2'] = {
        utxos: [
          {
            outpoint: 'txid222.0',
            satoshis: 2000,
            lockingScript: '76a915...88ac',
            tags: [],
          },
        ],
      };
      baskets['basket3'] = {
        utxos: [
          {
            outpoint: 'txid333.0',
            satoshis: 3000,
            lockingScript: '76a916...88ac',
            tags: [],
          },
        ],
      };

      const result = basketManager.findUtxo(baskets, 'txid222.0');
      expect(result).toBeDefined();
      expect(result?.satoshis).toBe(2000);
    });

    it('should find first UTXO if multiple baskets have same outpoint', () => {
      baskets['basket1'] = {
        utxos: [
          {
            outpoint: 'txid123.0',
            satoshis: 1000,
            lockingScript: '76a914...88ac',
            tags: [],
          },
        ],
      };
      baskets['basket2'] = {
        utxos: [
          {
            outpoint: 'txid123.0',
            satoshis: 2000,
            lockingScript: '76a915...88ac',
            tags: [],
          },
        ],
      };

      const result = basketManager.findUtxo(baskets, 'txid123.0');
      expect(result).toBeDefined();
      // Should find first one (order depends on Object.values, but we just verify it's found)
      expect([1000, 2000]).toContain(result?.satoshis);
    });

    it('should handle basket with multiple UTXOs', () => {
      baskets['basket1'] = {
        utxos: [
          {
            outpoint: 'txid111.0',
            satoshis: 1000,
            lockingScript: '76a914...88ac',
            tags: [],
          },
          {
            outpoint: 'txid222.0',
            satoshis: 2000,
            lockingScript: '76a915...88ac',
            tags: [],
          },
          {
            outpoint: 'txid333.0',
            satoshis: 3000,
            lockingScript: '76a916...88ac',
            tags: [],
          },
        ],
      };

      const result = basketManager.findUtxo(baskets, 'txid222.0');
      expect(result).toBeDefined();
      expect(result?.satoshis).toBe(2000);
    });
  });
});
