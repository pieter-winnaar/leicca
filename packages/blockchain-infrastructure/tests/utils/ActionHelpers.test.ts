/**
 * ActionHelpers Tests
 *
 * Tests for action helper utility functions:
 * - generateActionId
 * - generateReference
 * - validateCreateActionParams
 * - getActionByTxid
 */

import { describe, it, expect } from 'vitest';
import { ActionHelpers } from '../../src/utils/ActionHelpers';
import type { CreateActionParams, ActionState } from '../../src/types';

describe('ActionHelpers', () => {
  describe('generateActionId', () => {
    it('should generate unique action IDs', () => {
      const ids = new Set<string>();
      const count = 1000;

      // Generate 1000 IDs
      for (let i = 0; i < count; i++) {
        const id = ActionHelpers.generateActionId();
        ids.add(id);
      }

      // All IDs should be unique (no collisions)
      expect(ids.size).toBe(count);
    });

    it('should have correct format', () => {
      const id = ActionHelpers.generateActionId();
      expect(id).toMatch(/^action_\d+_[a-z0-9]+$/);
    });

    it('should generate different IDs on subsequent calls', () => {
      const id1 = ActionHelpers.generateActionId();
      const id2 = ActionHelpers.generateActionId();
      expect(id1).not.toBe(id2);
    });
  });

  describe('generateReference', () => {
    it('should generate unique references', () => {
      const refs = new Set<string>();
      const count = 1000;

      // Generate 1000 references
      for (let i = 0; i < count; i++) {
        const ref = ActionHelpers.generateReference();
        refs.add(ref);
      }

      // All references should be unique (no collisions)
      expect(refs.size).toBe(count);
    });

    it('should have correct format', () => {
      const ref = ActionHelpers.generateReference();
      expect(ref).toMatch(/^ref_\d+_[a-z0-9]+$/);
    });

    it('should generate different references on subsequent calls', () => {
      const ref1 = ActionHelpers.generateReference();
      const ref2 = ActionHelpers.generateReference();
      expect(ref1).not.toBe(ref2);
    });
  });

  describe('validateCreateActionParams', () => {
    it('should pass validation for valid params with inputs and outputs', () => {
      const validParams: CreateActionParams = {
        description: 'Test transaction with inputs',
        inputs: [
          {
            outpoint: 'abc123.0',
            inputDescription: 'Test input description',
          },
        ],
        outputs: [
          {
            lockingScript: '76a914...88ac',
            satoshis: 1000,
            outputDescription: 'Test output description',
          },
        ],
      };

      expect(() => ActionHelpers.validateCreateActionParams(validParams)).not.toThrow();
    });

    it('should pass validation for params with only outputs', () => {
      const validParams: CreateActionParams = {
        description: 'Test transaction with only outputs',
        outputs: [
          {
            lockingScript: '76a914...88ac',
            satoshis: 1000,
            outputDescription: 'Test output description',
          },
        ],
      };

      expect(() => ActionHelpers.validateCreateActionParams(validParams)).not.toThrow();
    });

    it('should pass validation for params with only inputs', () => {
      const validParams: CreateActionParams = {
        description: 'Test transaction with only inputs',
        inputs: [
          {
            outpoint: 'abc123.0',
            inputDescription: 'Test input description',
          },
        ],
      };

      expect(() => ActionHelpers.validateCreateActionParams(validParams)).not.toThrow();
    });

    it('should throw error if no inputs or outputs', () => {
      const invalidParams: CreateActionParams = {
        description: 'Test transaction without inputs or outputs',
      };

      expect(() => ActionHelpers.validateCreateActionParams(invalidParams)).toThrow(
        'At least one input or output required'
      );
    });

    it('should throw error if description too short', () => {
      const invalidParams: CreateActionParams = {
        description: 'Test',
        outputs: [
          {
            lockingScript: '76a914...88ac',
            satoshis: 1000,
            outputDescription: 'Valid output description',
          },
        ],
      };

      expect(() => ActionHelpers.validateCreateActionParams(invalidParams)).toThrow(
        'Description must be 5-50 characters'
      );
    });

    it('should throw error if description too long', () => {
      const invalidParams: CreateActionParams = {
        description: 'a'.repeat(51),
        outputs: [
          {
            lockingScript: '76a914...88ac',
            satoshis: 1000,
            outputDescription: 'Valid output description',
          },
        ],
      };

      expect(() => ActionHelpers.validateCreateActionParams(invalidParams)).toThrow(
        'Description must be 5-50 characters'
      );
    });

    it('should throw error if output description too short', () => {
      const invalidParams: CreateActionParams = {
        description: 'Valid transaction description',
        outputs: [
          {
            lockingScript: '76a914...88ac',
            satoshis: 1000,
            outputDescription: 'Test',
          },
        ],
      };

      expect(() => ActionHelpers.validateCreateActionParams(invalidParams)).toThrow(
        'Output description must be 5-50 characters'
      );
    });

    it('should throw error if output description too long', () => {
      const invalidParams: CreateActionParams = {
        description: 'Valid transaction description',
        outputs: [
          {
            lockingScript: '76a914...88ac',
            satoshis: 1000,
            outputDescription: 'a'.repeat(51),
          },
        ],
      };

      expect(() => ActionHelpers.validateCreateActionParams(invalidParams)).toThrow(
        'Output description must be 5-50 characters'
      );
    });

    it('should throw error if output satoshis is zero', () => {
      const invalidParams: CreateActionParams = {
        description: 'Valid transaction description',
        outputs: [
          {
            lockingScript: '76a914...88ac',
            satoshis: 0,
            outputDescription: 'Valid output description',
          },
        ],
      };

      expect(() => ActionHelpers.validateCreateActionParams(invalidParams)).toThrow(
        'Output satoshis must be a positive integer'
      );
    });

    it('should throw error if output satoshis is negative', () => {
      const invalidParams: CreateActionParams = {
        description: 'Valid transaction description',
        outputs: [
          {
            lockingScript: '76a914...88ac',
            satoshis: -100,
            outputDescription: 'Valid output description',
          },
        ],
      };

      expect(() => ActionHelpers.validateCreateActionParams(invalidParams)).toThrow(
        'Output satoshis must be a positive integer'
      );
    });

    it('should throw error if output satoshis is not an integer', () => {
      const invalidParams: CreateActionParams = {
        description: 'Valid transaction description',
        outputs: [
          {
            lockingScript: '76a914...88ac',
            satoshis: 100.5,
            outputDescription: 'Valid output description',
          },
        ],
      };

      expect(() => ActionHelpers.validateCreateActionParams(invalidParams)).toThrow(
        'Output satoshis must be a positive integer'
      );
    });

    it('should throw error if input description too short', () => {
      const invalidParams: CreateActionParams = {
        description: 'Valid transaction description',
        inputs: [
          {
            outpoint: 'abc123.0',
            inputDescription: 'Test',
          },
        ],
      };

      expect(() => ActionHelpers.validateCreateActionParams(invalidParams)).toThrow(
        'Input description must be 5-50 characters'
      );
    });

    it('should throw error if input description too long', () => {
      const invalidParams: CreateActionParams = {
        description: 'Valid transaction description',
        inputs: [
          {
            outpoint: 'abc123.0',
            inputDescription: 'a'.repeat(51),
          },
        ],
      };

      expect(() => ActionHelpers.validateCreateActionParams(invalidParams)).toThrow(
        'Input description must be 5-50 characters'
      );
    });

    it('should validate all outputs in array', () => {
      const invalidParams: CreateActionParams = {
        description: 'Valid transaction description',
        outputs: [
          {
            lockingScript: '76a914...88ac',
            satoshis: 1000,
            outputDescription: 'Valid output description',
          },
          {
            lockingScript: '76a914...88ac',
            satoshis: 2000,
            outputDescription: 'Bad', // Too short
          },
        ],
      };

      expect(() => ActionHelpers.validateCreateActionParams(invalidParams)).toThrow(
        'Output description must be 5-50 characters'
      );
    });

    it('should validate all inputs in array', () => {
      const invalidParams: CreateActionParams = {
        description: 'Valid transaction description',
        inputs: [
          {
            outpoint: 'abc123.0',
            inputDescription: 'Valid input description',
          },
          {
            outpoint: 'def456.1',
            inputDescription: 'Bad', // Too short
          },
        ],
      };

      expect(() => ActionHelpers.validateCreateActionParams(invalidParams)).toThrow(
        'Input description must be 5-50 characters'
      );
    });
  });

  describe('getActionByTxid', () => {
    it('should find action by txid', () => {
      const actions = new Map<string, ActionState>();
      const action1: ActionState = {
        actionId: 'action1',
        txid: 'txid123',
        status: 'broadcast',
        description: 'Test action description',
        labels: [],
        inputs: [],
        outputs: [],
        createdAt: new Date(),
        updatedAt: new Date(),
      };
      const action2: ActionState = {
        actionId: 'action2',
        txid: 'txid456',
        status: 'completed',
        description: 'Another action description',
        labels: [],
        inputs: [],
        outputs: [],
        createdAt: new Date(),
        updatedAt: new Date(),
      };

      actions.set(action1.actionId, action1);
      actions.set(action2.actionId, action2);

      const result = ActionHelpers.getActionByTxid(actions, 'txid123');
      expect(result).toBe(action1);
    });

    it('should return undefined if action not found', () => {
      const actions = new Map<string, ActionState>();
      const action: ActionState = {
        actionId: 'action1',
        txid: 'txid123',
        status: 'broadcast',
        description: 'Test action description',
        labels: [],
        inputs: [],
        outputs: [],
        createdAt: new Date(),
        updatedAt: new Date(),
      };

      actions.set(action.actionId, action);

      const result = ActionHelpers.getActionByTxid(actions, 'nonexistent');
      expect(result).toBeUndefined();
    });

    it('should return undefined for empty actions map', () => {
      const actions = new Map<string, ActionState>();
      const result = ActionHelpers.getActionByTxid(actions, 'txid123');
      expect(result).toBeUndefined();
    });

    it('should find correct action among multiple actions', () => {
      const actions = new Map<string, ActionState>();
      for (let i = 0; i < 10; i++) {
        const action: ActionState = {
          actionId: `action${i}`,
          txid: `txid${i}`,
          status: 'broadcast',
          description: `Test action ${i} description`,
          labels: [],
          inputs: [],
          outputs: [],
          createdAt: new Date(),
          updatedAt: new Date(),
        };
        actions.set(action.actionId, action);
      }

      const result = ActionHelpers.getActionByTxid(actions, 'txid5');
      expect(result).toBeDefined();
      expect(result?.actionId).toBe('action5');
    });
  });
});
