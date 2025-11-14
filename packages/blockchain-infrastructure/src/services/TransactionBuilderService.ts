/**
 * TransactionBuilderService - Pure BSV transaction builder
 *
 * LEAF SERVICE - No service dependencies
 *
 * Responsibilities:
 * - Build transactions from inputs/outputs
 * - Calculate transaction fees
 * - Add change outputs
 * - Convert to/from hex
 *
 * Session 1 scope (signing in Session 2)
 *
 * What it does NOT do:
 * - Broadcast transactions (TransactionService)
 * - Track transaction state (TransactionService)
 * - Manage UTXOs (UTXOService)
 * - Know about BRC-100 actions (BRC100WalletService)
 */

import type { ScriptTemplateUnlock } from '@bsv/sdk';
import {
  Transaction,
  P2PKH,
  LockingScript,
  UnlockingScript,
  PrivateKey,
} from '@bsv/sdk';

/**
 * Transaction input parameters
 */
export interface TransactionInput {
  txid: string;
  outputIndex: number;
  satoshis: number;
  lockingScript: string;
  unlockingScript?: string;
}

/**
 * Transaction output parameters
 */
export interface TransactionOutput {
  lockingScript: string;
  satoshis: number;
}

/**
 * Build transaction parameters
 */
export interface BuildTransactionParams {
  inputs: Array<{
    txid: string;
    outputIndex: number;
    satoshis: number;
    lockingScript: string;
    sourceTransaction?: Transaction; // CRITICAL: Required for BEEF generation
  }>;
  outputs: Array<{
    lockingScript: string;
    satoshis: number;
  }>;
  locktime?: number;
  version?: number;
}

/**
 * Validation error for transaction building
 */
export class ValidationError extends Error {
  constructor(
    message: string,
    public readonly field?: string
  ) {
    super(message);
    this.name = 'ValidationError';
  }
}

/**
 * Signing error for transaction signing failures
 */
export class SigningError extends Error {
  constructor(
    message: string,
    public readonly inputIndex?: number
  ) {
    super(message);
    this.name = 'SigningError';
  }
}

/**
 * TransactionBuilderService - Pure BSV transaction builder using @bsv/sdk
 */
export class TransactionBuilderService {
  /**
   * Dust limit in satoshis (BSV minimum output value)
   */
  private readonly DUST_LIMIT = 1;

  /**
   * Build unsigned transaction from inputs and outputs
   *
   * @param params - Transaction build parameters
   * @returns Unsigned Transaction object
   * @throws ValidationError if inputs/outputs are invalid
   */
  buildTransaction(params: BuildTransactionParams): Transaction {
    // Validate inputs
    if (!params.inputs || params.inputs.length === 0) {
      throw new ValidationError('No inputs provided', 'inputs');
    }

    if (!params.outputs || params.outputs.length === 0) {
      throw new ValidationError('No outputs provided', 'outputs');
    }

    try {
      // Create transaction
      const tx = new Transaction(params.version || 1);

      // Add inputs with empty unlocking scripts (will be replaced during signing)
      for (const input of params.inputs) {
        tx.addInput({
          sourceTransaction: input.sourceTransaction, // CRITICAL: Required for BEEF
          sourceTXID: input.txid, // Fallback if sourceTransaction not available
          sourceOutputIndex: input.outputIndex,
          sequence: 0xffffffff,
          unlockingScript: new UnlockingScript(), // Empty for unsigned tx
        });
      }

      // Add outputs
      for (const output of params.outputs) {
        tx.addOutput({
          lockingScript: LockingScript.fromHex(output.lockingScript),
          satoshis: output.satoshis,
        });
      }

      // Set locktime if provided
      if (params.locktime !== undefined) {
        tx.lockTime = params.locktime;
      }

      return tx;
    } catch (error) {
      throw new ValidationError(
        `Transaction building failed: ${error instanceof Error ? error.message : String(error)}`
      );
    }
  }

  /**
   * Calculate transaction fee based on size estimation
   *
   * Standard BSV fee calculation:
   * - Input size: 148 bytes (P2PKH)
   * - Output size: 34 bytes (P2PKH)
   * - Overhead: 10 bytes (version, locktime, counts)
   *
   * @param inputCount - Number of inputs
   * @param outputCount - Number of outputs
   * @param feeRate - Satoshis per kilobyte (default: 50)
   * @returns Fee in satoshis (rounded up)
   */
  calculateFee(
    inputCount: number,
    outputCount: number,
    feeRate: number = 50
  ): number {
    // Standard BSV transaction size estimation
    const inputSize = 148; // bytes per P2PKH input
    const outputSize = 34; // bytes per P2PKH output
    const overhead = 10; // version, locktime, counts

    const estimatedSize =
      inputCount * inputSize + outputCount * outputSize + overhead;

    // Fee rate: satoshis per kilobyte
    return Math.ceil((estimatedSize / 1024) * feeRate);
  }

  /**
   * Add change output if change amount >= dust limit
   *
   * @param tx - Transaction to modify
   * @param changeAddress - Address for change output
   * @param totalInput - Total satoshis from inputs
   * @param totalOutput - Total satoshis to outputs
   * @param fee - Transaction fee in satoshis
   * @returns Modified transaction (mutates original)
   */
  addChangeOutput(
    tx: Transaction,
    changeAddress: string,
    totalInput: number,
    totalOutput: number,
    fee: number
  ): Transaction {
    const change = totalInput - totalOutput - fee;

    // Only add change output if >= dust limit
    if (change >= this.DUST_LIMIT) {
      tx.addOutput({
        lockingScript: new P2PKH().lock(changeAddress),
        satoshis: change,
      });
    }

    return tx;
  }

  /**
   * Sign transaction inputs with private keys using P2PKH templates
   *
   * Uses @bsv/sdk P2PKH template pattern with unlockingScriptTemplate.
   * The input parameters must include satoshis for signing.
   *
   * @param tx - Transaction to sign
   * @param privateKeys - Array of private keys (one per input)
   * @param inputScripts - Array of previous output locking scripts (hex)
   * @param inputSatoshis - Array of satoshi amounts from previous outputs
   * @param unlockTemplates - Optional array of unlock templates (for BSV-21,P2PKH etc.)
   * @returns Signed transaction hex
   * @throws SigningError if signing fails
   */
  async signTransaction(
    tx: Transaction,
    privateKeys: PrivateKey[],
    inputScripts: string[],
    inputSatoshis: number[],
    unlockTemplates?: ScriptTemplateUnlock[]
  ): Promise<string> {
    // Validate inputs match keys
    if (privateKeys.length !== tx.inputs.length) {
      throw new SigningError(
        `Private key count (${privateKeys.length}) doesn't match input count (${tx.inputs.length})`
      );
    }

    if (inputScripts.length !== tx.inputs.length) {
      throw new SigningError(
        `Input script count (${inputScripts.length}) doesn't match input count (${tx.inputs.length})`
      );
    }

    if (inputSatoshis.length !== tx.inputs.length) {
      throw new SigningError(
        `Input satoshis count (${inputSatoshis.length}) doesn't match input count (${tx.inputs.length})`
      );
    }

    try {
      // Set unlocking script templates for each input
      for (let i = 0; i < tx.inputs.length; i++) {
        const privateKey = privateKeys[i];
        if (!privateKey) {
          throw new SigningError(`Missing private key for input ${i}`, i);
        }

        // Use provided template if available
        if (unlockTemplates && unlockTemplates[i]) {
          tx.inputs[i]!.unlockingScriptTemplate = unlockTemplates[i];
        } else {
          // Default to P2PKH unlock (backward compatibility)
          const inputScript = inputScripts[i];
          if (!inputScript) {
            throw new SigningError(`Missing input script for input ${i}`, i);
          }

          const satoshis = inputSatoshis[i];
          if (satoshis === undefined || satoshis === null) {
            throw new SigningError(`Missing satoshis for input ${i}`, i);
          }

          tx.inputs[i]!.unlockingScriptTemplate = new P2PKH().unlock(
            privateKey,
            'all',
            false,
            satoshis,
            LockingScript.fromHex(inputScript)
          );
        }
      }

      // Sign the transaction (calls all templates)
      await tx.sign();

      return tx.toHex();
    } catch (error) {
      throw new SigningError(
        `Transaction signing failed: ${error instanceof Error ? error.message : String(error)}`
      );
    }
  }

  /**
   * Add input to existing transaction
   *
   * @param tx - Transaction to modify
   * @param input - Input to add
   * @returns Modified transaction (mutates original)
   */
  addInput(tx: Transaction, input: TransactionInput): Transaction {
    tx.addInput({
      sourceTXID: input.txid,
      sourceOutputIndex: input.outputIndex,
      sequence: 0xffffffff,
      unlockingScript: new UnlockingScript(), // Empty for unsigned tx
    });

    return tx;
  }

  /**
   * Add output to existing transaction
   *
   * @param tx - Transaction to modify
   * @param output - Output to add
   * @returns Modified transaction (mutates original)
   */
  addOutput(tx: Transaction, output: TransactionOutput): Transaction {
    tx.addOutput({
      lockingScript: LockingScript.fromHex(output.lockingScript),
      satoshis: output.satoshis,
    });

    return tx;
  }

  /**
   * Convert transaction to hex string
   *
   * @param tx - Transaction to serialize
   * @returns Hex-encoded transaction
   */
  toHex(tx: Transaction): string {
    return tx.toHex();
  }

  /**
   * Parse transaction from hex string
   *
   * @param hex - Hex-encoded transaction
   * @returns Parsed transaction object
   */
  fromHex(hex: string): Transaction {
    return Transaction.fromHex(hex);
  }

  /**
   * Estimate transaction size in bytes
   *
   * @param inputCount - Number of inputs
   * @param outputCount - Number of outputs
   * @returns Estimated size in bytes
   */
  estimateSize(inputCount: number, outputCount: number): number {
    const inputSize = 148;
    const outputSize = 34;
    const overhead = 10;

    return inputCount * inputSize + outputCount * outputSize + overhead;
  }
}
