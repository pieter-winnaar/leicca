/**
 * BasketManager - Basket operations utility
 *
 * NOT a service - just a helper class for basket management
 *
 * Responsibilities:
 * - Assign outputs to baskets
 * - Remove spent UTXOs from baskets
 * - Remove specific outputs from baskets (relinquish)
 * - List outputs with filtering (basket, tags, tagQueryMode)
 *
 * This utility has NO dependencies (only primitives).
 * It operates on BasketState objects passed as parameters.
 */

import type { BasketState } from '../types';

export class BasketManager {
  /**
   * Assign output to basket
   *
   * Creates basket if it doesn't exist.
   * Adds UTXO to basket's utxos array.
   *
   * @param baskets - Basket state to mutate
   * @param basketName - Name of basket
   * @param utxo - UTXO to add
   */
  assignToBasket(
    baskets: BasketState,
    basketName: string,
    utxo: {
      outpoint: string;
      satoshis: number;
      lockingScript: string;
      tags: string[];
      customInstructions?: string;
    }
  ): void {
    if (!baskets[basketName]) {
      baskets[basketName] = { utxos: [] };
    }

    baskets[basketName].utxos.push(utxo);
  }

  /**
   * Remove spent UTXOs from baskets after action completion
   *
   * Called when action reaches 6+ confirmations (status: 'completed').
   * Removes UTXOs that were spent (consumed as inputs) from ALL baskets.
   *
   * @param baskets - Basket state to mutate
   * @param spentOutpoints - Array of spent outpoints (format: "txid.vout")
   */
  cleanupSpentUtxos(baskets: BasketState, spentOutpoints: string[]): void {
    const spentSet = new Set(spentOutpoints);

    for (const basketName in baskets) {
      const basket = baskets[basketName];
      if (!basket) continue;

      basket.utxos = basket.utxos.filter((utxo) => !spentSet.has(utxo.outpoint));
    }
  }

  /**
   * Remove output from basket(s)
   *
   * BRC-100 relinquishOutput() implementation.
   *
   * @param baskets - Basket state to mutate
   * @param outpoint - Outpoint to remove (format: "txid.vout")
   * @param basket - Optional: specific basket (if omitted, remove from all baskets)
   */
  relinquishOutput(
    baskets: BasketState,
    outpoint: string,
    basket?: string
  ): void {
    if (basket) {
      // Remove from specific basket
      if (baskets[basket]) {
        baskets[basket].utxos = baskets[basket].utxos.filter(
          (utxo) => utxo.outpoint !== outpoint
        );
      }
    } else {
      // Remove from all baskets
      for (const basketName in baskets) {
        const basket = baskets[basketName];
        if (basket) {
          basket.utxos = basket.utxos.filter((utxo) => utxo.outpoint !== outpoint);
        }
      }
    }
  }

  /**
   * List outputs from baskets with filtering
   *
   * BRC-100 listOutputs() implementation (basket filtering only).
   *
   * Filtering:
   * - basket: If provided, only return outputs from that basket
   * - tags: If provided, filter outputs by tags
   * - tagQueryMode: 'all' (output must have ALL tags) or 'any' (output must have at least one tag)
   *
   * @param baskets - Basket state
   * @param filters - Optional filters (basket, tags, tagQueryMode)
   * @returns Filtered outputs
   */
  listOutputs(
    baskets: BasketState,
    filters?: {
      basket?: string;
      tags?: string[];
      tagQueryMode?: 'all' | 'any';
    }
  ): Array<{
    outpoint: string;
    satoshis: number;
    lockingScript: string;
    tags: string[];
    customInstructions?: string;
  }> {
    let outputs: Array<{
      outpoint: string;
      satoshis: number;
      lockingScript: string;
      tags: string[];
      customInstructions?: string;
    }> = [];

    // Collect outputs from baskets
    if (filters?.basket) {
      const basket = baskets[filters.basket];
      if (basket) {
        outputs = basket.utxos;
      }
    } else {
      for (const basket of Object.values(baskets)) {
        outputs.push(...basket.utxos);
      }
    }

    // Filter by tags if provided
    if (filters?.tags && filters.tags.length > 0) {
      const mode = filters.tagQueryMode || 'any';

      outputs = outputs.filter((output) => {
        if (mode === 'all') {
          return filters.tags!.every((tag) => output.tags.includes(tag));
        } else {
          return filters.tags!.some((tag) => output.tags.includes(tag));
        }
      });
    }

    return outputs;
  }

  /**
   * Find UTXO in baskets
   *
   * Searches through all baskets to find UTXO by outpoint.
   * Used during signAction() to look up locking script and satoshis
   * for each input.
   *
   * NOTE: This method was moved from ActionHelpers to BasketManager
   * for better cohesion (basket-related logic should be in BasketManager).
   *
   * @param baskets - Basket state to search
   * @param outpoint - UTXO outpoint (format: "txid.vout")
   * @returns UTXO data if found, undefined otherwise
   */
  findUtxo(
    baskets: BasketState,
    outpoint: string
  ): { lockingScript: string; satoshis: number; customInstructions?: string } | undefined {
    for (const basket of Object.values(baskets)) {
      const utxo = basket.utxos.find((u) => u.outpoint === outpoint);
      if (utxo) return utxo;
    }
    return undefined;
  }

  /**
   * Assign transaction outputs to baskets and manage locking
   *
   * This method consolidates the duplicated output assignment logic from
   * createAction() and signAction(). It:
   * 1. Assigns outputs to their designated baskets
   * 2. Locks outputs initially (can't spend yet)
   * 3. Unlocks outputs if broadcast was successful (0-conf spending)
   *
   * NOTE: This method was extracted in Session 6 to eliminate duplication
   * between createAction and signAction.
   *
   * @param baskets - Basket state to mutate
   * @param lockManager - UTXOLockManager class (static methods)
   * @param lockedUTXOs - Set of locked UTXO outpoints (mutated)
   * @param txid - Transaction ID
   * @param outputs - Array of action outputs to assign
   * @param broadcastSuccess - Whether MintBlue confirmed broadcast (enables 0-conf spending)
   */
  assignOutputsToBaskets(
    baskets: BasketState,
    lockManager: typeof import('./UTXOLockManager').UTXOLockManager,
    lockedUTXOs: Set<string>,
    txid: string,
    outputs: Array<{
      basket?: string;
      satoshis: number;
      lockingScript: string;
      tags?: string[];
      customInstructions?: string;
    }> | undefined,
    broadcastSuccess: boolean
  ): void {
    if (!outputs || !txid) return;

    // Assign outputs to baskets
    for (let i = 0; i < outputs.length; i++) {
      const output = outputs[i];
      if (!output || !output.basket) continue;

      const outpoint = `${txid}.${i}`;
      this.assignToBasket(baskets, output.basket, {
        outpoint,
        satoshis: output.satoshis,
        lockingScript: output.lockingScript,
        tags: output.tags || [],
        customInstructions: output.customInstructions,
      });
    }

    // Lock outputs initially (can't spend yet)
    lockManager.lockOutputs(lockedUTXOs, txid, outputs.length);

    // Unlock outputs if MintBlue confirmed broadcast (0-conf spending enabled)
    if (broadcastSuccess) {
      lockManager.unlockOutputs(lockedUTXOs, txid, outputs.length);
    }
  }
}
