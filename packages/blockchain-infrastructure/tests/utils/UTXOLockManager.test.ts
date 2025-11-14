/**
 * UTXOLockManager tests
 *
 * Tests UTXO locking utility functions
 */

import { describe, it, expect, beforeEach } from 'vitest';
import { UTXOLockManager } from '../../src/utils/UTXOLockManager';
import type { ActionInput } from '../../src/types';

describe('UTXOLockManager', () => {
  let lockedUTXOs: Set<string>;

  beforeEach(() => {
    lockedUTXOs = new Set<string>();
  });

  describe('checkInputsNotLocked', () => {
    it('should not throw if no inputs are locked', () => {
      const inputs: ActionInput[] = [
        { outpoint: 'txid1.0', inputDescription: 'Test input 1' },
        { outpoint: 'txid2.0', inputDescription: 'Test input 2' },
      ];

      expect(() =>
        UTXOLockManager.checkInputsNotLocked(lockedUTXOs, inputs)
      ).not.toThrow();
    });

    it('should throw error if any input is locked', () => {
      lockedUTXOs.add('txid1.0');

      const inputs: ActionInput[] = [
        { outpoint: 'txid1.0', inputDescription: 'Test input 1' },
        { outpoint: 'txid2.0', inputDescription: 'Test input 2' },
      ];

      expect(() =>
        UTXOLockManager.checkInputsNotLocked(lockedUTXOs, inputs)
      ).toThrow('UTXO txid1.0 is locked by pending action');
    });

    it('should throw error with correct outpoint in message', () => {
      lockedUTXOs.add('txid2.0');

      const inputs: ActionInput[] = [
        { outpoint: 'txid1.0', inputDescription: 'Test input 1' },
        { outpoint: 'txid2.0', inputDescription: 'Test input 2' },
      ];

      expect(() =>
        UTXOLockManager.checkInputsNotLocked(lockedUTXOs, inputs)
      ).toThrow('UTXO txid2.0 is locked by pending action');
    });

    it('should handle empty inputs', () => {
      expect(() =>
        UTXOLockManager.checkInputsNotLocked(lockedUTXOs, [])
      ).not.toThrow();
    });

    it('should not throw if different UTXOs are locked', () => {
      lockedUTXOs.add('txid3.0');
      lockedUTXOs.add('txid4.0');

      const inputs: ActionInput[] = [
        { outpoint: 'txid1.0', inputDescription: 'Test input 1' },
        { outpoint: 'txid2.0', inputDescription: 'Test input 2' },
      ];

      expect(() =>
        UTXOLockManager.checkInputsNotLocked(lockedUTXOs, inputs)
      ).not.toThrow();
    });
  });

  describe('lockInputs', () => {
    it('should lock all inputs', () => {
      const inputs: ActionInput[] = [
        { outpoint: 'txid1.0', inputDescription: 'Test input 1' },
        { outpoint: 'txid2.0', inputDescription: 'Test input 2' },
      ];

      UTXOLockManager.lockInputs(lockedUTXOs, inputs);

      expect(lockedUTXOs.has('txid1.0')).toBe(true);
      expect(lockedUTXOs.has('txid2.0')).toBe(true);
      expect(lockedUTXOs.size).toBe(2);
    });

    it('should handle empty inputs', () => {
      UTXOLockManager.lockInputs(lockedUTXOs, []);

      expect(lockedUTXOs.size).toBe(0);
    });

    it('should add to existing locked UTXOs', () => {
      lockedUTXOs.add('txid0.0');

      const inputs: ActionInput[] = [
        { outpoint: 'txid1.0', inputDescription: 'Test input 1' },
      ];

      UTXOLockManager.lockInputs(lockedUTXOs, inputs);

      expect(lockedUTXOs.has('txid0.0')).toBe(true);
      expect(lockedUTXOs.has('txid1.0')).toBe(true);
      expect(lockedUTXOs.size).toBe(2);
    });

    it('should be idempotent (locking already locked UTXO)', () => {
      const inputs: ActionInput[] = [
        { outpoint: 'txid1.0', inputDescription: 'Test input 1' },
      ];

      UTXOLockManager.lockInputs(lockedUTXOs, inputs);
      UTXOLockManager.lockInputs(lockedUTXOs, inputs);

      expect(lockedUTXOs.has('txid1.0')).toBe(true);
      expect(lockedUTXOs.size).toBe(1);
    });
  });

  describe('unlockInputs', () => {
    it('should unlock all inputs', () => {
      lockedUTXOs.add('txid1.0');
      lockedUTXOs.add('txid2.0');

      const inputs: ActionInput[] = [
        { outpoint: 'txid1.0', inputDescription: 'Test input 1' },
        { outpoint: 'txid2.0', inputDescription: 'Test input 2' },
      ];

      UTXOLockManager.unlockInputs(lockedUTXOs, inputs);

      expect(lockedUTXOs.has('txid1.0')).toBe(false);
      expect(lockedUTXOs.has('txid2.0')).toBe(false);
      expect(lockedUTXOs.size).toBe(0);
    });

    it('should handle empty inputs', () => {
      lockedUTXOs.add('txid1.0');

      UTXOLockManager.unlockInputs(lockedUTXOs, []);

      expect(lockedUTXOs.has('txid1.0')).toBe(true);
      expect(lockedUTXOs.size).toBe(1);
    });

    it('should preserve other locked UTXOs', () => {
      lockedUTXOs.add('txid1.0');
      lockedUTXOs.add('txid2.0');
      lockedUTXOs.add('txid3.0');

      const inputs: ActionInput[] = [
        { outpoint: 'txid1.0', inputDescription: 'Test input 1' },
      ];

      UTXOLockManager.unlockInputs(lockedUTXOs, inputs);

      expect(lockedUTXOs.has('txid1.0')).toBe(false);
      expect(lockedUTXOs.has('txid2.0')).toBe(true);
      expect(lockedUTXOs.has('txid3.0')).toBe(true);
      expect(lockedUTXOs.size).toBe(2);
    });

    it('should be idempotent (unlocking already unlocked UTXO)', () => {
      const inputs: ActionInput[] = [
        { outpoint: 'txid1.0', inputDescription: 'Test input 1' },
      ];

      UTXOLockManager.unlockInputs(lockedUTXOs, inputs);
      UTXOLockManager.unlockInputs(lockedUTXOs, inputs);

      expect(lockedUTXOs.has('txid1.0')).toBe(false);
      expect(lockedUTXOs.size).toBe(0);
    });
  });

  describe('lockOutputs', () => {
    it('should lock all outputs for transaction', () => {
      UTXOLockManager.lockOutputs(lockedUTXOs, 'txid123', 3);

      expect(lockedUTXOs.has('txid123.0')).toBe(true);
      expect(lockedUTXOs.has('txid123.1')).toBe(true);
      expect(lockedUTXOs.has('txid123.2')).toBe(true);
      expect(lockedUTXOs.size).toBe(3);
    });

    it('should handle single output', () => {
      UTXOLockManager.lockOutputs(lockedUTXOs, 'txid123', 1);

      expect(lockedUTXOs.has('txid123.0')).toBe(true);
      expect(lockedUTXOs.size).toBe(1);
    });

    it('should handle zero outputs', () => {
      UTXOLockManager.lockOutputs(lockedUTXOs, 'txid123', 0);

      expect(lockedUTXOs.size).toBe(0);
    });

    it('should add to existing locked UTXOs', () => {
      lockedUTXOs.add('txid0.0');

      UTXOLockManager.lockOutputs(lockedUTXOs, 'txid123', 2);

      expect(lockedUTXOs.has('txid0.0')).toBe(true);
      expect(lockedUTXOs.has('txid123.0')).toBe(true);
      expect(lockedUTXOs.has('txid123.1')).toBe(true);
      expect(lockedUTXOs.size).toBe(3);
    });
  });

  describe('unlockOutputs', () => {
    it('should unlock all outputs for transaction', () => {
      lockedUTXOs.add('txid123.0');
      lockedUTXOs.add('txid123.1');
      lockedUTXOs.add('txid123.2');

      UTXOLockManager.unlockOutputs(lockedUTXOs, 'txid123', 3);

      expect(lockedUTXOs.has('txid123.0')).toBe(false);
      expect(lockedUTXOs.has('txid123.1')).toBe(false);
      expect(lockedUTXOs.has('txid123.2')).toBe(false);
      expect(lockedUTXOs.size).toBe(0);
    });

    it('should handle single output', () => {
      lockedUTXOs.add('txid123.0');

      UTXOLockManager.unlockOutputs(lockedUTXOs, 'txid123', 1);

      expect(lockedUTXOs.has('txid123.0')).toBe(false);
      expect(lockedUTXOs.size).toBe(0);
    });

    it('should handle zero outputs', () => {
      lockedUTXOs.add('txid123.0');

      UTXOLockManager.unlockOutputs(lockedUTXOs, 'txid123', 0);

      expect(lockedUTXOs.has('txid123.0')).toBe(true);
      expect(lockedUTXOs.size).toBe(1);
    });

    it('should preserve other locked UTXOs', () => {
      lockedUTXOs.add('txid123.0');
      lockedUTXOs.add('txid123.1');
      lockedUTXOs.add('txid456.0');

      UTXOLockManager.unlockOutputs(lockedUTXOs, 'txid123', 2);

      expect(lockedUTXOs.has('txid123.0')).toBe(false);
      expect(lockedUTXOs.has('txid123.1')).toBe(false);
      expect(lockedUTXOs.has('txid456.0')).toBe(true);
      expect(lockedUTXOs.size).toBe(1);
    });

    it('should be idempotent (unlocking already unlocked outputs)', () => {
      UTXOLockManager.unlockOutputs(lockedUTXOs, 'txid123', 2);
      UTXOLockManager.unlockOutputs(lockedUTXOs, 'txid123', 2);

      expect(lockedUTXOs.has('txid123.0')).toBe(false);
      expect(lockedUTXOs.has('txid123.1')).toBe(false);
      expect(lockedUTXOs.size).toBe(0);
    });
  });

  describe('unlockOutpoints', () => {
    it('should unlock specified outpoints', () => {
      lockedUTXOs.add('txid1.0');
      lockedUTXOs.add('txid2.0');
      lockedUTXOs.add('txid3.0');

      UTXOLockManager.unlockOutpoints(lockedUTXOs, ['txid1.0', 'txid3.0']);

      expect(lockedUTXOs.has('txid1.0')).toBe(false);
      expect(lockedUTXOs.has('txid2.0')).toBe(true);
      expect(lockedUTXOs.has('txid3.0')).toBe(false);
      expect(lockedUTXOs.size).toBe(1);
    });

    it('should handle empty outpoints array', () => {
      lockedUTXOs.add('txid1.0');

      UTXOLockManager.unlockOutpoints(lockedUTXOs, []);

      expect(lockedUTXOs.has('txid1.0')).toBe(true);
      expect(lockedUTXOs.size).toBe(1);
    });

    it('should handle unlocking non-existent outpoints', () => {
      lockedUTXOs.add('txid1.0');

      UTXOLockManager.unlockOutpoints(lockedUTXOs, ['txid2.0', 'txid3.0']);

      expect(lockedUTXOs.has('txid1.0')).toBe(true);
      expect(lockedUTXOs.size).toBe(1);
    });

    it('should be idempotent', () => {
      lockedUTXOs.add('txid1.0');

      UTXOLockManager.unlockOutpoints(lockedUTXOs, ['txid1.0']);
      UTXOLockManager.unlockOutpoints(lockedUTXOs, ['txid1.0']);

      expect(lockedUTXOs.has('txid1.0')).toBe(false);
      expect(lockedUTXOs.size).toBe(0);
    });

    it('should handle single outpoint', () => {
      lockedUTXOs.add('txid1.0');
      lockedUTXOs.add('txid2.0');

      UTXOLockManager.unlockOutpoints(lockedUTXOs, ['txid1.0']);

      expect(lockedUTXOs.has('txid1.0')).toBe(false);
      expect(lockedUTXOs.has('txid2.0')).toBe(true);
      expect(lockedUTXOs.size).toBe(1);
    });
  });

  describe('integration scenarios', () => {
    it('should handle complete action lifecycle (lock inputs → lock outputs → unlock outputs)', () => {
      // Scenario: Create action with 2 inputs, broadcast with 3 outputs

      const inputs: ActionInput[] = [
        { outpoint: 'input1.0', inputDescription: 'Input 1' },
        { outpoint: 'input2.0', inputDescription: 'Input 2' },
      ];

      // Check inputs not locked
      expect(() =>
        UTXOLockManager.checkInputsNotLocked(lockedUTXOs, inputs)
      ).not.toThrow();

      // Lock inputs
      UTXOLockManager.lockInputs(lockedUTXOs, inputs);
      expect(lockedUTXOs.size).toBe(2);

      // Lock outputs after broadcast
      UTXOLockManager.lockOutputs(lockedUTXOs, 'txid123', 3);
      expect(lockedUTXOs.size).toBe(5); // 2 inputs + 3 outputs

      // Unlock outputs at first confirmation
      UTXOLockManager.unlockOutputs(lockedUTXOs, 'txid123', 3);
      expect(lockedUTXOs.size).toBe(2); // Only inputs remain locked

      // Unlock inputs at 6+ confirmations
      UTXOLockManager.unlockInputs(lockedUTXOs, inputs);
      expect(lockedUTXOs.size).toBe(0);
    });

    it('should handle aborted action (lock inputs → unlock inputs)', () => {
      const inputs: ActionInput[] = [
        { outpoint: 'input1.0', inputDescription: 'Input 1' },
      ];

      // Lock inputs
      UTXOLockManager.lockInputs(lockedUTXOs, inputs);
      expect(lockedUTXOs.size).toBe(1);

      // Abort action - unlock inputs
      UTXOLockManager.unlockInputs(lockedUTXOs, inputs);
      expect(lockedUTXOs.size).toBe(0);
    });

    it('should prevent double-spend across multiple actions', () => {
      const inputs1: ActionInput[] = [
        { outpoint: 'utxo1.0', inputDescription: 'Input 1' },
      ];

      const inputs2: ActionInput[] = [
        { outpoint: 'utxo1.0', inputDescription: 'Input 1 (duplicate)' },
      ];

      // Lock inputs for action 1
      UTXOLockManager.lockInputs(lockedUTXOs, inputs1);

      // Try to create action 2 with same input
      expect(() =>
        UTXOLockManager.checkInputsNotLocked(lockedUTXOs, inputs2)
      ).toThrow('UTXO utxo1.0 is locked by pending action');
    });
  });
});
