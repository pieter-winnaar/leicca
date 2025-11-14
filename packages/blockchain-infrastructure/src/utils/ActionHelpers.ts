/**
 * ActionHelpers - Action-related utility functions
 *
 * NOT a service - just a collection of static helper functions
 * for action ID generation, validation, and UTXO lookups.
 *
 * IMPORTANT: This is a utility class with STATIC methods only.
 * No constructor needed, all methods are pure functions.
 *
 * @see docs/02-SPRINTS/sprint-3A.3B-intermediate-cleanup-sprint.md (Session 4)
 */

import type { CreateActionParams, ActionState, ActionInput, ActionOutput } from '../types';
import type { Transaction } from '@bsv/sdk';

/**
 * ActionHelpers - Static utility functions for action operations
 */
export class ActionHelpers {
  /**
   * Generate unique action ID
   *
   * Format: "action_{timestamp}_{random}"
   * - timestamp: milliseconds since epoch (13 digits)
   * - random: base36 string (9 chars)
   *
   * Collision probability: ~1 in 10^14 for concurrent calls
   *
   * @returns Unique action identifier
   */
  static generateActionId(): string {
    return `action_${Date.now()}_${Math.random().toString(36).substring(2, 11)}`;
  }

  /**
   * Generate unique reference for pending actions
   *
   * Format: "ref_{timestamp}_{random}"
   * - timestamp: milliseconds since epoch (13 digits)
   * - random: base36 string (9 chars)
   *
   * Used to correlate createAction() with signAction()
   *
   * @returns Unique reference string
   */
  static generateReference(): string {
    return `ref_${Date.now()}_${Math.random().toString(36).substring(2, 11)}`;
  }

  /**
   * Validate createAction parameters
   *
   * Validation rules:
   * - At least one input or output required
   * - Description: 5-50 characters
   * - Output descriptions: 5-50 characters
   * - Output satoshis: positive integer
   * - Input descriptions: 5-50 characters
   *
   * @param args - CreateAction parameters to validate
   * @throws Error if validation fails
   */
  static validateCreateActionParams(args: CreateActionParams): void {
    // At least one input or output required
    if (
      (!args.inputs || args.inputs.length === 0) &&
      (!args.outputs || args.outputs.length === 0)
    ) {
      throw new Error('At least one input or output required');
    }

    // Description: 5-50 chars
    if (args.description.length < 5 || args.description.length > 50) {
      throw new Error('Description must be 5-50 characters');
    }

    // Validate outputs
    if (args.outputs) {
      for (const output of args.outputs) {
        if (output.outputDescription.length < 5 || output.outputDescription.length > 50) {
          throw new Error('Output description must be 5-50 characters');
        }

        if (output.satoshis <= 0 || !Number.isInteger(output.satoshis)) {
          throw new Error('Output satoshis must be a positive integer');
        }
      }
    }

    // Validate inputs
    if (args.inputs) {
      for (const input of args.inputs) {
        if (input.inputDescription.length < 5 || input.inputDescription.length > 50) {
          throw new Error('Input description must be 5-50 characters');
        }
      }
    }
  }

  /**
   * Get action by txid
   *
   * Searches through action map to find action with matching txid.
   *
   * @param actions - Map of action ID to action state
   * @param txid - Transaction ID to search for
   * @returns ActionState if found, undefined otherwise
   */
  static getActionByTxid(
    actions: Map<string, ActionState>,
    txid: string
  ): ActionState | undefined {
    for (const action of actions.values()) {
      if (action.txid === txid) {
        return action;
      }
    }
    return undefined;
  }

  /**
   * Create action record with standard structure
   *
   * Consolidates action record creation pattern used in:
   * - createAction() (broadcast path)
   * - createAction() (pending path)
   * - internalizeAction()
   *
   * This helper eliminates duplication and ensures consistent
   * action record structure across all creation paths.
   *
   * @param options - Action record parameters
   * @returns ActionState object
   */
  static createActionRecord(options: {
    actionId?: string; // Optional: generate if not provided
    txid?: string;
    status: ActionState['status'];
    description: string;
    labels: string[];
    inputs: ActionInput[];
    outputs: ActionOutput[];
    tx?: Transaction;
    reference?: string;
  }): ActionState {
    return {
      actionId: options.actionId || ActionHelpers.generateActionId(),
      txid: options.txid,
      status: options.status,
      description: options.description,
      labels: options.labels,
      inputs: options.inputs,
      outputs: options.outputs,
      tx: options.tx,
      reference: options.reference,
      createdAt: new Date(),
      updatedAt: new Date(),
    };
  }
}
