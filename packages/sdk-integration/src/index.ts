/**
 * SDK Integration Package
 *
 * MintBlue API operations only:
 * - Client creation and authentication
 * - Project management
 * - Key operations
 * - Transaction broadcasting
 * - Transaction queries
 *
 * For BSV cryptographic operations, use @bsv/sdk directly
 */

// MintBlue SDK service
export { MintBlueSDKService } from './services/MintBlueSDKService';

// Token operations (uses js-1sat-ord)
export { TokenSDKService } from './services/TokenSDKService';

// Error classes
export {
  SDKError,
  NetworkError,
  AuthenticationError,
  RateLimitError,
  ValidationError,
  TimeoutError,
} from './errors/sdkErrors';

// Retry utilities
export { withRetry, type RetryOptions } from './utils/retryUtils';

// MintBlue types
export type {
  MintblueClient,
  MintblueCreateFn,
  MintblueClientOptions,
  MintblueProject,
  MintblueProjectsResponse
} from './types/mintblue.types';

// Custom BSV types (NOT re-exporting @bsv/sdk classes)
export {
  type TokenSDK,
  type UTXO,
  type PaymentUTXO,
  type TokenUTXO,
  type TransactionResult,
  type TokenTransferParams,
  type Type42DerivationParams,
  type WalletAddresses,
  TokenType,
} from './types/bsv.types';
