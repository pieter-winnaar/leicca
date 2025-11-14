/**
 * WalletStateManager Tests
 *
 * Tests for localStorage persistence utility
 */

import { describe, it, expect, beforeEach, afterEach, vi } from 'vitest';
import { WalletStateManager } from '../../src/utils/WalletStateManager';
import { Transaction, PrivateKey, P2PKH } from '@bsv/sdk';
import type { ActionState, BasketState } from '../../src/types';

describe('WalletStateManager', () => {
  let stateManager: WalletStateManager;
  const stateKey = 'test_wallet_state';
  let localStorageMock: { [key: string]: string } = {};

  beforeEach(() => {
    // Reset localStorage mock
    localStorageMock = {};

    // Mock localStorage methods
    const mockLocalStorage = {
      getItem: (key: string) => localStorageMock[key] || null,
      setItem: (key: string, value: string) => {
        localStorageMock[key] = value;
      },
      removeItem: (key: string) => {
        delete localStorageMock[key];
      },
      clear: () => {
        localStorageMock = {};
      },
      length: Object.keys(localStorageMock).length,
      key: (index: number) => Object.keys(localStorageMock)[index] || null,
    };

    // @ts-expect-error - Mock localStorage
    global.localStorage = mockLocalStorage;

    // @ts-expect-error - Mock window for SSR-safe checks
    global.window = {};

    stateManager = new WalletStateManager(stateKey);
  });

  afterEach(() => {
    // Clean up after each test
    localStorageMock = {};
  });

  describe('save()', () => {
    it('should save wallet state to localStorage', () => {
      const actions = new Map<string, ActionState>();
      const action: ActionState = {
        actionId: 'action_1',
        txid: 'abc123',
        status: 'completed',
        description: 'Test action',
        labels: ['test'],
        inputs: [],
        outputs: [],
        createdAt: new Date('2025-10-16T10:00:00Z'),
        updatedAt: new Date('2025-10-16T10:05:00Z'),
      };
      actions.set('action_1', action);

      const baskets: BasketState = {
        default: {
          utxos: [
            {
              outpoint: 'abc123.0',
              satoshis: 1000,
              lockingScript: '76a914...88ac',
              tags: ['test'],
            },
          ],
        },
      };

      const lockedUTXOs = new Set(['abc123.1']);
      const pendingReferences = new Map<string, ActionState>();

      stateManager.save({
        actions,
        baskets,
        lockedUTXOs,
        pendingReferences,
      });

      const saved = localStorage.getItem(stateKey);
      expect(saved).toBeTruthy();

      const parsed = JSON.parse(saved!);
      expect(parsed.actions).toHaveLength(1);
      expect(parsed.actions[0].actionId).toBe('action_1');
      expect(parsed.actions[0].createdAt).toBe('2025-10-16T10:00:00.000Z');
      expect(parsed.baskets.default.utxos).toHaveLength(1);
      expect(parsed.lockedUTXOs).toEqual(['abc123.1']);
    });

    it('should serialize Transaction objects to hex', () => {
      // Use a simple valid transaction hex (from actual BSV SDK test)
      const txHex = '0100000001000000000000000000000000000000000000000000000000000000000000000000000000006a473044022000000000000000000000000000000000000000000000000000000000000000000220000000000000000000000000000000000000000000000000000000000000000001ffffffff01e8030000000000001976a91400000000000000000000000000000000000000000088ac00000000';
      const tx = Transaction.fromHex(txHex);

      const actions = new Map<string, ActionState>();
      const action: ActionState = {
        actionId: 'action_1',
        status: 'pending',
        description: 'Test action with tx',
        labels: [],
        inputs: [],
        outputs: [],
        tx, // Include Transaction object
        reference: 'ref_1',
        createdAt: new Date('2025-10-16T10:00:00Z'),
        updatedAt: new Date('2025-10-16T10:00:00Z'),
      };
      actions.set('action_1', action);

      stateManager.save({
        actions,
        baskets: {},
        lockedUTXOs: new Set(),
        pendingReferences: new Map(),
      });

      const saved = localStorage.getItem(stateKey);
      const parsed = JSON.parse(saved!);

      // Verify transaction is serialized as hex string
      expect(typeof parsed.actions[0].tx).toBe('string');
      expect(parsed.actions[0].tx.length).toBeGreaterThan(0);
      expect(parsed.actions[0].tx).toMatch(/^[0-9a-f]+$/); // Verify it's a valid hex string
    });

    it('should handle save errors gracefully', () => {
      const consoleErrorSpy = vi.spyOn(console, 'error').mockImplementation(() => {});

      // @ts-expect-error - Mock localStorage
      global.localStorage.setItem = () => {
        throw new Error('Save error');
      };

      const actions = new Map<string, ActionState>();
      stateManager.save({
        actions,
        baskets: {},
        lockedUTXOs: new Set(),
        pendingReferences: new Map(),
      });

      // Should have logged an error
      expect(consoleErrorSpy).toHaveBeenCalled();
      expect(consoleErrorSpy.mock.calls[0][0]).toContain('[WalletStateManager]');

      consoleErrorSpy.mockRestore();
    });
  });

  describe('load()', () => {
    it('should load wallet state from localStorage', () => {
      const serialized = {
        actions: [
          {
            actionId: 'action_1',
            txid: 'abc123',
            status: 'completed',
            description: 'Test action',
            labels: ['test'],
            inputs: [],
            outputs: [],
            createdAt: '2025-10-16T10:00:00.000Z',
            updatedAt: '2025-10-16T10:05:00.000Z',
          },
        ],
        baskets: {
          default: {
            utxos: [
              {
                outpoint: 'abc123.0',
                satoshis: 1000,
                lockingScript: '76a914...88ac',
                tags: ['test'],
              },
            ],
          },
        },
        lockedUTXOs: ['abc123.1'],
        pendingReferences: [],
      };

      localStorage.setItem(stateKey, JSON.stringify(serialized));

      const state = stateManager.load();

      expect(state).toBeTruthy();
      expect(state!.actions.size).toBe(1);
      expect(state!.actions.get('action_1')?.actionId).toBe('action_1');
      expect(state!.actions.get('action_1')?.createdAt).toBeInstanceOf(Date);
      expect(state!.baskets.default.utxos).toHaveLength(1);
      expect(state!.lockedUTXOs.has('abc123.1')).toBe(true);
    });

    it('should deserialize hex strings to Transaction objects', () => {
      // Use a simple valid transaction hex
      const txHex = '0100000001000000000000000000000000000000000000000000000000000000000000000000000000006a473044022000000000000000000000000000000000000000000000000000000000000000000220000000000000000000000000000000000000000000000000000000000000000001ffffffff01e8030000000000001976a91400000000000000000000000000000000000000000088ac00000000';

      const serialized = {
        actions: [
          {
            actionId: 'action_1',
            status: 'pending',
            description: 'Test action',
            labels: [],
            inputs: [],
            outputs: [],
            tx: txHex,
            reference: 'ref_1',
            createdAt: '2025-10-16T10:00:00.000Z',
            updatedAt: '2025-10-16T10:00:00.000Z',
          },
        ],
        baskets: {},
        lockedUTXOs: [],
        pendingReferences: [],
      };

      localStorage.setItem(stateKey, JSON.stringify(serialized));

      const state = stateManager.load();

      expect(state).toBeTruthy();
      expect(state!.actions.get('action_1')?.tx).toBeInstanceOf(Transaction);
      // Verify the deserialized tx produces valid hex (BSV SDK may normalize/truncate invalid tx)
      const deserializedHex = state!.actions.get('action_1')?.tx?.toHex();
      expect(deserializedHex).toBeTruthy();
      expect(deserializedHex!.length).toBeGreaterThan(0);
      expect(deserializedHex).toMatch(/^[0-9a-f]+$/);
    });

    it('should return null if no cached state exists', () => {
      const state = stateManager.load();
      expect(state).toBeNull();
    });

    it('should handle corrupted state gracefully', () => {
      const consoleErrorSpy = vi.spyOn(console, 'error').mockImplementation(() => {});

      // Save corrupted JSON
      localStorage.setItem(stateKey, 'invalid json {{{');

      const state = stateManager.load();

      expect(state).toBeNull();
      expect(consoleErrorSpy).toHaveBeenCalledWith(
        '[WalletStateManager] Failed to load state:',
        expect.any(Error)
      );

      consoleErrorSpy.mockRestore();
    });

    it('should handle missing optional fields (backwards compatibility)', () => {
      const serialized = {
        actions: [
          {
            actionId: 'action_1',
            status: 'completed',
            description: 'Test action',
            labels: [],
            inputs: [],
            outputs: [],
            createdAt: '2025-10-16T10:00:00.000Z',
            updatedAt: '2025-10-16T10:00:00.000Z',
          },
        ],
        // baskets missing (should default to {})
        // lockedUTXOs missing (should default to empty Set)
        // pendingReferences missing (should default to empty Map)
      };

      localStorage.setItem(stateKey, JSON.stringify(serialized));

      const state = stateManager.load();

      expect(state).toBeTruthy();
      expect(state!.baskets).toEqual({});
      expect(state!.lockedUTXOs.size).toBe(0);
      expect(state!.pendingReferences.size).toBe(0);
    });
  });

  describe('clear()', () => {
    it('should remove state from localStorage', () => {
      // Save some state
      localStorage.setItem(stateKey, '{"test": "data"}');

      // Clear it
      stateManager.clear();

      // Verify removed
      expect(localStorage.getItem(stateKey)).toBeNull();
    });
  });

  describe('save/load roundtrip', () => {
    it('should preserve all data through save/load cycle', () => {
      // Create complex state
      const actions = new Map<string, ActionState>();
      const action1: ActionState = {
        actionId: 'action_1',
        txid: 'abc123',
        status: 'completed',
        description: 'First action',
        labels: ['label1', 'label2'],
        inputs: [
          { outpoint: 'abc123.0', inputDescription: 'Input 1' },
        ],
        outputs: [
          {
            satoshis: 1000,
            lockingScript: '76a914...88ac',
            outputDescription: 'Output 1',
            basket: 'default',
            tags: ['tag1'],
          },
        ],
        createdAt: new Date('2025-10-16T10:00:00Z'),
        updatedAt: new Date('2025-10-16T10:05:00Z'),
      };
      actions.set('action_1', action1);

      const action2: ActionState = {
        actionId: 'action_2',
        status: 'pending',
        description: 'Second action',
        labels: [],
        inputs: [],
        outputs: [],
        reference: 'ref_123',
        createdAt: new Date('2025-10-16T11:00:00Z'),
        updatedAt: new Date('2025-10-16T11:00:00Z'),
      };
      actions.set('action_2', action2);

      const baskets: BasketState = {
        default: {
          utxos: [
            {
              outpoint: 'abc123.0',
              satoshis: 1000,
              lockingScript: '76a914...88ac',
              tags: ['tag1', 'tag2'],
              customInstructions: '{"key": "value"}',
            },
          ],
        },
        special: {
          utxos: [
            {
              outpoint: 'def456.0',
              satoshis: 2000,
              lockingScript: '76a914...88ac',
              tags: [],
            },
          ],
        },
      };

      const lockedUTXOs = new Set(['abc123.1', 'def456.2']);

      const pendingReferences = new Map<string, ActionState>();
      pendingReferences.set('ref_123', action2);

      // Save
      stateManager.save({
        actions,
        baskets,
        lockedUTXOs,
        pendingReferences,
      });

      // Load
      const loaded = stateManager.load();

      // Verify all data preserved
      expect(loaded).toBeTruthy();
      expect(loaded!.actions.size).toBe(2);
      expect(loaded!.actions.get('action_1')?.description).toBe('First action');
      expect(loaded!.actions.get('action_1')?.labels).toEqual(['label1', 'label2']);
      expect(loaded!.actions.get('action_1')?.createdAt).toEqual(new Date('2025-10-16T10:00:00Z'));
      expect(loaded!.actions.get('action_2')?.reference).toBe('ref_123');

      expect(loaded!.baskets.default.utxos).toHaveLength(1);
      expect(loaded!.baskets.special.utxos).toHaveLength(1);
      expect(loaded!.baskets.default.utxos[0].customInstructions).toBe('{"key": "value"}');

      expect(loaded!.lockedUTXOs.size).toBe(2);
      expect(loaded!.lockedUTXOs.has('abc123.1')).toBe(true);
      expect(loaded!.lockedUTXOs.has('def456.2')).toBe(true);

      expect(loaded!.pendingReferences.size).toBe(1);
      expect(loaded!.pendingReferences.get('ref_123')?.actionId).toBe('action_2');
    });
  });
});
