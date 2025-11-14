/**
 * Type42KeyResolver - Type 42 key resolution utility
 *
 * NOT a service - just a helper class for resolving signing keys
 * for transaction inputs, with special handling for Type 42 inputs.
 *
 * Responsibilities:
 * - Look up UTXOs from baskets
 * - Extract locking scripts and satoshis
 * - Detect Type 42 inputs (from customInstructions metadata)
 * - Derive ephemeral private keys for Type 42 inputs
 * - Return appropriate private key for each input (master or ephemeral)
 *
 * Type 42 Detection:
 * - Type 42 inputs have customInstructions with JSON metadata:
 *   { invoiceId: string, senderPublicKey: string }
 * - For Type 42: derive ephemeral key using KeyService.recoverEphemeralPrivateKey()
 * - For regular inputs: use master key
 *
 * This utility was extracted in Session 6 to eliminate duplication
 * between signAction() implementations.
 *
 * @see docs/02-SPRINTS/sprint-3A.3B-intermediate-cleanup-sprint.md (Session 6)
 */

import type { PrivateKey, PublicKey } from '@bsv/sdk';
import type { BasketState, ActionState } from '../types';
import type { BasketManager } from './BasketManager';
import type { KeyService } from '../services/KeyService';

/**
 * Type42KeyResolver - Static utility functions for key resolution
 */
export class Type42KeyResolver {
  /**
   * Resolve signing keys for transaction inputs
   *
   * For each input in the action:
   * 1. Look up UTXO from baskets (via BasketManager.findUtxo)
   * 2. Extract locking script and satoshis
   * 3. Check if Type 42 input (has customInstructions with invoiceId + senderPublicKey)
   * 4. If Type 42: derive ephemeral private key (KeyService.recoverEphemeralPrivateKey)
   * 5. If regular: use master key
   * 6. Return arrays of: inputScripts, inputSatoshis, privateKeys
   *
   * @param action - Action with inputs to resolve
   * @param baskets - Basket state to search for UTXOs
   * @param basketManager - BasketManager instance for UTXO lookup
   * @param masterKey - Master private key (used for non-Type-42 inputs)
   * @param keyService - KeyService for deriving ephemeral keys
   * @returns Object with inputScripts, inputSatoshis, and privateKeys arrays
   * @throws Error if UTXO not found in baskets
   */
  static resolveSigningKeys(
    action: ActionState,
    baskets: BasketState,
    basketManager: BasketManager,
    masterKey: PrivateKey,
    keyService: KeyService,
    PublicKeyClass: typeof PublicKey
  ): {
    inputScripts: string[];
    inputSatoshis: number[];
    privateKeys: PrivateKey[];
  } {
    const inputScripts: string[] = [];
    const inputSatoshis: number[] = [];
    const privateKeys: PrivateKey[] = [];

    // For each input in the transaction, we need:
    // 1. Locking script and satoshis from the UTXO being spent
    // 2. Appropriate private key (master key OR ephemeral key for Type 42 inputs)

    for (let i = 0; i < action.inputs.length; i++) {
      const input = action.inputs[i];
      if (!input) {
        throw new Error(`Missing input at index ${i}`);
      }

      // Look up UTXO from baskets
      const utxo = basketManager.findUtxo(baskets, input.outpoint);

      if (!utxo) {
        throw new Error(`UTXO ${input.outpoint} not found in any basket`);
      }

      // Determine which key to use for this input
      let keyForInput = masterKey;

      // Check if this is Type 42 input (has derivation metadata)
      if (utxo.customInstructions) {
        try {
          const metadata = JSON.parse(utxo.customInstructions);

          if (metadata.invoiceId && metadata.senderPublicKey) {
            // Type 42 input - derive ephemeral key
            const senderPubKey = PublicKeyClass.fromString(metadata.senderPublicKey);
            keyForInput = keyService.recoverEphemeralPrivateKey(
              masterKey,
              senderPubKey,
              metadata.invoiceId
            );
          }
        } catch (e) {
          // Not Type 42 or parsing failed - fall through to master key
        }
      }

      // Collect data for signing
      inputScripts.push(utxo.lockingScript);
      inputSatoshis.push(utxo.satoshis);
      privateKeys.push(keyForInput);
    }

    return {
      inputScripts,
      inputSatoshis,
      privateKeys,
    };
  }
}
