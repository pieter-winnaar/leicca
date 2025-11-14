/**
 * BSV21ScriptTemplate - Script template for BSV-21 token transactions
 *
 * Provides locking and unlocking script generation for BSV-21 tokens
 * following the 1Sat Ordinals specification.
 */

import {
  LockingScript,
  PrivateKey,
  P2PKH,
  Transaction,
} from '@bsv/sdk';
import { toTokenSat, ReturnTypes } from 'satoshi-token';

/**
 * BSV-21 token script template for locking/unlocking token UTXOs.
 * Follows @bsv/sdk template pattern with ordinal inscription data.
 *
 * Format: OP_0 OP_IF <'ord'> OP_1 <contentType> OP_0 <tokenData> OP_ENDIF <P2PKH>
 */
export class BSV21ScriptTemplate {
  /**
   * Create locking script for BSV-21 token UTXO
   *
   * Actual BSV-21 format (from js-1sat-ord):
   * OP_0 OP_IF
   *   <'ord'>                    // Protocol identifier
   *   OP_1                       // Field marker
   *   <'application/bsv-20'>     // Content type
   *   OP_0                       // Field marker
   *   <{"p":"bsv-20",...}>       // JSON token data
   * OP_ENDIF
   * <P2PKH script>
   *
   * @param tokenId - Token identifier (hex string)
   * @param ownerAddress - Token owner's address
   * @param amount - Token amount in decimal format (e.g., 100.50 for 100.50 tokens)
   * @param decimals - Number of decimal places for this token (default: 8, matching Bitcoin)
   * @returns Locking script with BSV-21 inscription + P2PKH
   *
   * @example
   * // Send 100.50 tokens with 8 decimal places
   * const script = template.lock(tokenId, address, 100.50, 8);
   * // On-chain amount: "10050000000" (tsat format)
   */
  lock(tokenId: string, ownerAddress: string, amount: number = 1, decimals: number = 8): LockingScript {
    // Convert decimal amount to tsat (token satoshis) format
    // E.g., 100.50 tokens with 8 decimals → "10050000000" tsat
    const amountTsat = toTokenSat(amount, decimals, ReturnTypes.String);

    // Create BSV-21 token data JSON
    const tokenData = {
      p: "bsv-20",
      op: "transfer",
      id: tokenId,
      amt: amountTsat  // Amount in tsat format (string)
    };
    const tokenDataJson = JSON.stringify(tokenData);

    // Build ordinal inscription:
    // OP_0 OP_IF <'ord'> OP_1 <contentType> OP_0 <tokenData> OP_ENDIF
    const inscriptionASM = [
      'OP_0',
      'OP_IF',
      Buffer.from('ord', 'utf8').toString('hex'),
      'OP_1',
      Buffer.from('application/bsv-20', 'utf8').toString('hex'),
      'OP_0',
      Buffer.from(tokenDataJson, 'utf8').toString('hex'),
      'OP_ENDIF'
    ].join(' ');

    // Get P2PKH script
    const p2pkhScript = new P2PKH().lock(ownerAddress);

    // Combine: inscription + P2PKH
    const fullASM = inscriptionASM + ' ' + p2pkhScript.toASM();

    return LockingScript.fromASM(fullASM);
  }

  /**
   * Create unlocking script template for BSV-21 token UTXO
   * Returns signature function for transaction signing
   *
   * @param privateKey - Private key for signing
   * @returns Unlocking template with sign and estimateLength methods
   */
  unlock(privateKey: PrivateKey) {
    const sign = async (tx: Transaction, inputIndex: number) => {
      // Create P2PKH unlocking script (signature + pubkey)
      const p2pkhTemplate = new P2PKH().unlock(privateKey);

      // Use the P2PKH template's sign method
      return await p2pkhTemplate.sign(tx, inputIndex);
    };

    const estimateLength = async (_tx: Transaction, _inputIndex: number) => {
      // P2PKH unlock: ~107 bytes (signature 71-73 + pubkey 33)
      return 107;
    };

    return { sign, estimateLength };
  }
}
