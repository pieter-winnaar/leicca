/**
 * UTXOLockManager - UTXO locking utility
 *
 * NOT a service - just a helper class for lock management
 *
 * Responsibilities:
 * - Check if inputs are locked (prevents double-spend)
 * - Lock/unlock input UTXOs
 * - Lock/unlock output UTXOs
 * - Unlock specific outpoints
 *
 * This utility has NO dependencies (only primitives).
 * All methods are STATIC and operate on lockedUTXOs Set passed as parameter.
 *
 * @see docs/02-SPRINTS/sprint-3A.3B-intermediate-cleanup-sprint.md (Session 5)
 */

import type { ActionInput } from '../types';

/**
 * UTXOLockManager - Static utility functions for UTXO locking
 */
export class UTXOLockManager {
  /**
   * Check if inputs are locked (prevents double-spend)
   *
   * Throws error if any input is locked by a pending action.
   * This prevents double-spending UTXOs that are already in use.
   *
   * @param lockedUTXOs - Set of locked UTXO outpoints
   * @param inputs - Action inputs to check
   * @throws Error if any input is locked
   */
  static checkInputsNotLocked(
    lockedUTXOs: Set<string>,
    inputs: ActionInput[]
  ): void {
    for (const input of inputs) {
      if (lockedUTXOs.has(input.outpoint)) {
        throw new Error(`UTXO ${input.outpoint} is locked by pending action`);
      }
    }
  }

  /**
   * Lock inputs (mark as in-use)
   *
   * Adds input outpoints to lockedUTXOs Set.
   * Called after createAction() validates inputs are not locked.
   *
   * @param lockedUTXOs - Set of locked UTXO outpoints (mutated)
   * @param inputs - Action inputs to lock
   */
  static lockInputs(
    lockedUTXOs: Set<string>,
    inputs: ActionInput[]
  ): void {
    for (const input of inputs) {
      lockedUTXOs.add(input.outpoint);
    }
  }

  /**
   * Unlock inputs (release for future use)
   *
   * Removes input outpoints from lockedUTXOs Set.
   * Called when action is aborted or completed.
   *
   * @param lockedUTXOs - Set of locked UTXO outpoints (mutated)
   * @param inputs - Action inputs to unlock
   */
  static unlockInputs(
    lockedUTXOs: Set<string>,
    inputs: ActionInput[]
  ): void {
    for (const input of inputs) {
      lockedUTXOs.delete(input.outpoint);
    }
  }

  /**
   * Lock outputs (newly created, not yet spendable)
   *
   * Adds output outpoints to lockedUTXOs Set.
   * Called after transaction is broadcast.
   *
   * Outputs are locked until:
   * - MintBlue returns success: true (0-conf spending), OR
   * - confirmations >= 1 (at least 1 on-chain confirmation)
   *
   * @param lockedUTXOs - Set of locked UTXO outpoints (mutated)
   * @param txid - Transaction ID
   * @param outputCount - Number of outputs in transaction
   */
  static lockOutputs(
    lockedUTXOs: Set<string>,
    txid: string,
    outputCount: number
  ): void {
    for (let i = 0; i < outputCount; i++) {
      lockedUTXOs.add(`${txid}.${i}`);
    }
  }

  /**
   * Unlock outputs (confirmed or 0-conf spendable)
   *
   * Removes output outpoints from lockedUTXOs Set.
   * Called when:
   * - MintBlue confirms broadcast (0-conf spending enabled), OR
   * - confirmations >= 1 (at least 1 on-chain confirmation)
   *
   * @param lockedUTXOs - Set of locked UTXO outpoints (mutated)
   * @param txid - Transaction ID
   * @param outputCount - Number of outputs in transaction
   */
  static unlockOutputs(
    lockedUTXOs: Set<string>,
    txid: string,
    outputCount: number
  ): void {
    for (let i = 0; i < outputCount; i++) {
      lockedUTXOs.delete(`${txid}.${i}`);
    }
  }

  /**
   * Unlock specific outpoints
   *
   * Removes specified outpoints from lockedUTXOs Set.
   * Used for cleanup operations.
   *
   * @param lockedUTXOs - Set of locked UTXO outpoints (mutated)
   * @param outpoints - Array of outpoints to unlock (format: "txid.vout")
   */
  static unlockOutpoints(
    lockedUTXOs: Set<string>,
    outpoints: string[]
  ): void {
    for (const outpoint of outpoints) {
      lockedUTXOs.delete(outpoint);
    }
  }
}
