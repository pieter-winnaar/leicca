/**
 * TokenSDKService - BSV-21 Token Operations
 *
 * LEAF SERVICE (no dependencies)
 *
 * Responsibilities:
 * - BSV-21 token transfers (via js-1sat-ord)
 * - Payment UTXO fetching
 * - Token UTXO fetching and filtering
 * - Error handling and retry logic
 *
 * Wraps js-1sat-ord with:
 * - Consistent error handling
 * - Automatic retry logic
 * - Type-safe interfaces
 */

import type {
  UTXO,
  TokenUTXO,
  TransactionResult,
  TokenTransferParams,
  TokenSDK,
} from '../types/bsv.types';
import {
  SDKError,
  NetworkError,
  AuthenticationError,
  RateLimitError,
  ValidationError,
} from '../errors/sdkErrors';
import { withRetry } from '../utils/retryUtils';

/**
 * TokenSDKService - BSV-21 token operations wrapper
 */
export class TokenSDKService {
  /**
   * Transfer BSV-21 tokens with retry logic
   *
   * @param params - Token transfer parameters
   * @param tokenSDK - Optional token SDK for testing (transferOrdTokens function)
   * @returns Transaction result
   */
  async transferTokens(
    params: TokenTransferParams,
    tokenSDK?: Pick<TokenSDK, 'transferOrdTokens'>
  ): Promise<TransactionResult> {
    return withRetry(
      async () => {
        try {
          const transferOrdTokens = tokenSDK?.transferOrdTokens || (() => {
            throw new Error('Token SDK not available - inject tokenSDK for testing');
          })();

          const result = await transferOrdTokens({
            fromAddress: params.fromAddress,
            toAddress: params.toAddress,
            tokenId: params.tokenId,
            amount: params.amount,
            privateKey: params.privateKey,
          });

          return {
            txid: result.txid,
            rawTx: result.rawTx,
          };
        } catch (error) {
          throw this.transformError(error);
        }
      },
      { maxRetries: 3, baseDelay: 1000 }
    );
  }

  /**
   * Fetch payment UTXOs for an address with retry logic
   *
   * @param address - BSV address
   * @param tokenSDK - Optional token SDK for testing (fetchPayUtxos function)
   * @returns Array of UTXOs
   */
  async fetchPaymentUtxos(
    address: string,
    tokenSDK?: Pick<TokenSDK, 'fetchPayUtxos'>
  ): Promise<UTXO[]> {
    return withRetry(
      async () => {
        try {
          const fetchPayUtxos = tokenSDK?.fetchPayUtxos || (() => {
            throw new Error('Token SDK not available - inject tokenSDK for testing');
          })();

          const utxos = await fetchPayUtxos(address);
          return utxos;
        } catch (error) {
          throw this.transformError(error);
        }
      },
      { maxRetries: 3, baseDelay: 1000 }
    );
  }

  /**
   * Fetch token UTXOs for an address with retry logic
   *
   * @param address - BSV address
   * @param tokenId - Optional token ID to filter by
   * @param tokenSDK - Optional token SDK for testing (fetchTokenUtxos function)
   * @returns Array of token UTXOs
   */
  async fetchTokenUtxos(
    address: string,
    tokenId?: string,
    tokenSDK?: Pick<TokenSDK, 'fetchTokenUtxos'>
  ): Promise<TokenUTXO[]> {
    return withRetry(
      async () => {
        try {
          const fetchTokenUtxos = tokenSDK?.fetchTokenUtxos || (() => {
            throw new Error('Token SDK not available - inject tokenSDK for testing');
          })();

          const utxos = await fetchTokenUtxos(address);

          // Filter by tokenId if provided
          if (tokenId) {
            return utxos.filter((utxo: TokenUTXO) => utxo.tokenId === tokenId);
          }

          return utxos;
        } catch (error) {
          throw this.transformError(error);
        }
      },
      { maxRetries: 3, baseDelay: 1000 }
    );
  }

  /**
   * Transform generic errors to specific SDK error types
   *
   * @param error - Original error
   * @returns Transformed SDK error
   */
  private transformError(error: unknown): SDKError {
    const errorMessage = error instanceof Error ? error.message : String(error);

    // Network errors
    if (errorMessage.includes('Network') || errorMessage.includes('network')) {
      return new NetworkError(errorMessage, error);
    }

    // Authentication errors
    if (errorMessage.includes('auth') || errorMessage.includes('token')) {
      return new AuthenticationError(errorMessage, error);
    }

    // Rate limit errors
    if (errorMessage.includes('rate limit') || errorMessage.includes('Rate limit')) {
      return new RateLimitError(errorMessage, error);
    }

    // Validation errors
    if (errorMessage.includes('Invalid') || errorMessage.includes('invalid')) {
      return new ValidationError(errorMessage, error);
    }

    // Generic SDK error
    return new SDKError(errorMessage, 'UNKNOWN_ERROR', error);
  }
}
