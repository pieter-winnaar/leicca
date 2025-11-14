/**
 * BEEFService - BEEF (Background Evaluation Extended Format) service
 *
 * Generates and verifies BEEF format transactions per BRC-62.
 *
 * LEAF SERVICE - No service dependencies
 *
 * Responsibilities:
 * - Generate BEEF from Transaction
 * - Verify BEEF with SPV proofs
 * - Parse BEEF to Transaction
 * - Generate Extended Format (BIP-239)
 *
 * What it does NOT do:
 * - Build transactions (TransactionBuilderService)
 * - Broadcast transactions (TransactionService)
 * - Track transaction state (BRC100WalletService)
 *
 * @see docs/05-INTEGRATION/beef-research-findings.md
 * @see docs/02-SPRINTS/sprint-3A.2-beef-service.md
 */
import { Transaction } from '@bsv/sdk';
import type { ChainTracker } from '../types';

/**
 * BEEFService error class
 */
export class BEEFError extends Error {
  constructor(
    message: string,
    public readonly code: string,
    public readonly originalError?: unknown
  ) {
    super(message);
    this.name = 'BEEFError';
  }
}

/**
 * BEEFService - BEEF format transaction generation and verification
 *
 * BEEF (Background Evaluation Extended Format) is defined in BRC-62.
 * It packages transactions with their ancestor transactions and SPV proofs.
 *
 * Version: 0x0100BEEF (4022206465 decimal)
 */
export class BEEFService {
  /**
   * Generate BEEF from transaction.
   *
   * REQUIREMENT: Transaction inputs MUST use sourceTransaction (not sourceTXID)
   *
   * The @bsv/sdk Transaction class provides built-in BEEF generation via
   * the toHexBEEF() method. This method validates that all inputs have
   * sourceTransaction set before generating BEEF.
   *
   * @param tx - Transaction with sourceTransaction in inputs
   * @returns BEEF format as hex string (starts with "0100beef")
   * @throws BEEFError if inputs missing sourceTransaction
   *
   * @example
   * ```typescript
   * const beefService = new BEEFService();
   *
   * // Create transaction with sourceTransaction
   * const tx = new Transaction();
   * tx.addInput({
   *   sourceTransaction: parentTx,  // Required for BEEF
   *   sourceOutputIndex: 0,
   *   unlockingScriptTemplate: new P2PKH().unlock(privateKey)
   * });
   * tx.addOutput({
   *   lockingScript: new P2PKH().lock(recipientAddress),
   *   satoshis: 50000
   * });
   *
   * // Generate BEEF
   * const beefHex = beefService.generateBEEF(tx);
   * console.log('BEEF version:', beefHex.substring(0, 8)); // "0100beef"
   * ```
   */
  generateBEEF(tx: Transaction): string {
    // Validate inputs have sourceTransaction
    for (let i = 0; i < tx.inputs.length; i++) {
      const input = tx.inputs[i];
      if (!input || !input.sourceTransaction) {
        throw new BEEFError(
          `Input ${i} missing sourceTransaction - ` +
          `BEEF requires sourceTransaction, not sourceTXID`,
          'MISSING_SOURCE_TRANSACTION'
        );
      }
    }

    try {
      // Use @bsv/sdk built-in BEEF generation
      return tx.toHexBEEF();
    } catch (error) {
      throw new BEEFError(
        'Failed to generate BEEF',
        'BEEF_GENERATION_FAILED',
        error
      );
    }
  }

  /**
   * Verify BEEF transaction with SPV proofs.
   *
   * Uses @bsv/sdk to parse BEEF and verify Merkle proofs against
   * block headers provided by the ChainTracker.
   *
   * @param beefHex - BEEF format transaction (hex)
   * @param chainTracker - Block header verification client
   * @returns true if valid, false otherwise
   * @throws BEEFError if BEEF format invalid
   *
   * @example
   * ```typescript
   * const beefService = new BEEFService();
   * const chainTracker: ChainTracker = {
   *   isValidRootForHeight: async (merkleRoot, height) => {
   *     // Query block headers API
   *     return true;
   *   }
   * };
   *
   * const isValid = await beefService.verifyBEEF(beefHex, chainTracker);
   * if (isValid) {
   *   console.log('BEEF verified successfully');
   * }
   * ```
   */
  async verifyBEEF(
    beefHex: string,
    chainTracker: ChainTracker
  ): Promise<boolean> {
    try {
      // Parse BEEF
      const tx = Transaction.fromHexBEEF(beefHex);

      // Verify using @bsv/sdk
      const isValid = await tx.verify(chainTracker);

      return isValid;
    } catch (error) {
      throw new BEEFError(
        'Failed to verify BEEF',
        'BEEF_VERIFICATION_FAILED',
        error
      );
    }
  }

  /**
   * Parse BEEF to Transaction object.
   *
   * @param beefHex - BEEF format transaction (hex)
   * @returns Parsed Transaction
   * @throws BEEFError if BEEF format invalid
   *
   * @example
   * ```typescript
   * const beefService = new BEEFService();
   *
   * // Parse BEEF
   * const tx = beefService.parseBEEF(beefHex);
   * console.log('Transaction ID:', tx.id('hex'));
   * console.log('Inputs:', tx.inputs.length);
   * console.log('Outputs:', tx.outputs.length);
   * ```
   */
  parseBEEF(beefHex: string): Transaction {
    try {
      return Transaction.fromHexBEEF(beefHex);
    } catch (error) {
      throw new BEEFError(
        'Failed to parse BEEF',
        'BEEF_PARSE_FAILED',
        error
      );
    }
  }

  /**
   * Generate Extended Format (BIP-239) for ARC submission.
   *
   * Extended Format includes:
   * - Transaction data
   * - Input satoshis and scriptPubKey for each input
   *
   * Enables ARC to validate without downloading parent transactions.
   *
   * @param tx - Transaction to convert
   * @returns Extended Format as hex string
   * @throws BEEFError if conversion fails
   *
   * @example
   * ```typescript
   * const beefService = new BEEFService();
   * const tx = buildMyTransaction();
   *
   * // Generate Extended Format for ARC
   * const efHex = beefService.generateExtendedFormat(tx);
   *
   * // Submit to ARC
   * await fetch('https://arc.taal.com/v1/tx', {
   *   method: 'POST',
   *   headers: { 'Content-Type': 'application/octet-stream' },
   *   body: Buffer.from(efHex, 'hex')
   * });
   * ```
   */
  generateExtendedFormat(tx: Transaction): string {
    try {
      return tx.toHexEF();
    } catch (error) {
      throw new BEEFError(
        'Failed to generate Extended Format',
        'EF_GENERATION_FAILED',
        error
      );
    }
  }
}
