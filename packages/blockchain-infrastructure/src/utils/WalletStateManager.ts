/**
 * WalletStateManager - localStorage persistence utility
 *
 * NOT a service - just a helper class for state serialization
 *
 * Handles:
 * - Saving wallet state to localStorage
 * - Loading wallet state from localStorage
 * - Transaction/Date serialization
 * - SSR-safe checks
 * - Error handling (quota exceeded, corrupted state)
 */

import { Transaction } from '@bsv/sdk';
import type { ActionState, ActionInput, ActionStatus, BasketState } from '../types';

/**
 * Serialized action state (for localStorage)
 * Transaction objects are serialized as hex strings
 * Dates are serialized as ISO strings
 */
interface SerializedActionState {
  actionId: string;
  txid?: string;
  status: ActionStatus;
  description: string;
  labels: string[];
  inputs: ActionInput[];
  outputs: Array<{
    satoshis: number;
    lockingScript: string;
    outputDescription: string;
    basket?: string;
    tags?: string[];
    customInstructions?: string;
  }>;
  tx?: string; // Transaction as hex string
  reference?: string;
  createdAt: string; // ISO string
  updatedAt: string; // ISO string
  blockHeight?: number; // Cached block height for confirmation calculation
  confirmations?: number; // Cached confirmation count
}

/**
 * WalletStateManager - localStorage persistence utility
 */
export class WalletStateManager {
  constructor(private readonly stateKey: string) {}

  /**
   * Save wallet state to localStorage
   *
   * Serializes:
   * - Transaction objects → hex strings
   * - Date objects → ISO strings
   * - Maps → arrays of entries
   * - Sets → arrays
   *
   * @param state - Wallet state to save
   */
  save(state: {
    actions: Map<string, ActionState>;
    baskets: BasketState;
    lockedUTXOs: Set<string>;
    pendingReferences: Map<string, ActionState>;
  }): void {
    // SSR-safe check
    if (typeof window === 'undefined') return;

    try {
      // Serialize with Transaction/Date handling
      const serialized = {
        actions: Array.from(state.actions.values()).map(this.serializeAction.bind(this)),
        baskets: state.baskets,
        lockedUTXOs: Array.from(state.lockedUTXOs),
        pendingReferences: Array.from(state.pendingReferences.entries()).map(
          ([ref, action]) => [ref, this.serializeAction(action)]
        ),
      };

      localStorage.setItem(this.stateKey, JSON.stringify(serialized));
    } catch (error) {
      if (error instanceof DOMException && error.name === 'QuotaExceededError') {
        console.error('[WalletStateManager] localStorage quota exceeded');
      } else {
        console.error('[WalletStateManager] Failed to save state:', error);
      }
    }
  }

  /**
   * Load wallet state from localStorage
   *
   * Deserializes:
   * - Hex strings → Transaction objects
   * - ISO strings → Date objects
   * - Arrays of entries → Maps
   * - Arrays → Sets
   *
   * @returns Wallet state or null if not found/corrupted
   */
  load(): {
    actions: Map<string, ActionState>;
    baskets: BasketState;
    lockedUTXOs: Set<string>;
    pendingReferences: Map<string, ActionState>;
  } | null {
    // SSR-safe check
    if (typeof window === 'undefined') return null;

    try {
      const cached = localStorage.getItem(this.stateKey);
      if (!cached) return null;

      const state = JSON.parse(cached);

      return {
        actions: new Map(
          state.actions.map((action: SerializedActionState) => [
            action.actionId,
            this.deserializeAction(action),
          ])
        ),
        baskets: state.baskets || {},
        lockedUTXOs: new Set(state.lockedUTXOs || []),
        pendingReferences: new Map(
          (state.pendingReferences || []).map(([ref, action]: [string, SerializedActionState]) => [
            ref,
            this.deserializeAction(action),
          ])
        ),
      };
    } catch (error) {
      console.error('[WalletStateManager] Failed to load state:', error);
      return null; // Caller will initialize defaults
    }
  }

  /**
   * Clear state from localStorage
   */
  clear(): void {
    if (typeof window === 'undefined') return;
    localStorage.removeItem(this.stateKey);
  }

  /**
   * Serialize action (Transaction → hex, Date → ISO string)
   *
   * @param action - Action state to serialize
   * @returns Serialized action state
   */
  private serializeAction(action: ActionState): SerializedActionState {
    return {
      ...action,
      tx: action.tx ? action.tx.toHex() : undefined,
      createdAt: action.createdAt.toISOString(),
      updatedAt: action.updatedAt.toISOString(),
    };
  }

  /**
   * Deserialize action (hex → Transaction, ISO string → Date)
   *
   * @param action - Serialized action state
   * @returns Deserialized action state
   */
  private deserializeAction(action: SerializedActionState): ActionState {
    return {
      ...action,
      tx: action.tx ? Transaction.fromHex(action.tx) : undefined,
      createdAt: new Date(action.createdAt),
      updatedAt: new Date(action.updatedAt),
    };
  }
}
