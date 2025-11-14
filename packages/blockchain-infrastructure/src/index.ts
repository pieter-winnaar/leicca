/**
 * Blockchain Infrastructure Services
 *
 * Provides blockchain-specific services for BSV operations:
 * - KeyService: Type 42 key derivation and ephemeral addresses
 * - TransactionService: Transaction building and broadcasting
 * - TransactionBuilderService: Low-level transaction construction
 * - ProjectService: Multi-project SDK client management
 * - BluePagesService: Organization discovery via FIDES Blue Pages
 * - JWTVerificationService: JWT/SD-JWT/VP cryptographic verification
 * - DIDCrawlerService: W3C did:web resolution and credential crawling
 * - BEEFService: BEEF generation and verification per BRC-62
 * - BRC100WalletService: BRC-100 wallet interface with basket management
 * - WhatsOnChainChainTracker: SPV validation via WhatsOnChain API
 * - BabbageChainTracker: SPV validation via Babbage Chaintracks API
 * - MultiProviderChainTracker: Multi-provider fallback strategy
 * - ChainTrackerFactory: ChainTracker instance factory
 * - BlockHeaderListener: WebSocket block header listener (real-time)
 *
 * REMOVED (replaced by BRC100WalletService basket architecture):
 * - UTXOService (baskets are source of truth)
 * - WalletService (deprecated)
 * - TokenService (tokens managed via baskets)
 * - FundingService (replaced by BRC100WalletService.fundWallet)
 */

export { KeyService } from './services/KeyService';
export { TransactionBuilderService } from './services/TransactionBuilderService';
export { BSV21ScriptTemplate } from './services/BSV21ScriptTemplate';
export { BroadcastService } from './services/BroadcastService';
export { BluePagesService } from './services/BluePagesService';
export { JWTVerificationService } from './services/JWTVerificationService';
export { DIDCrawlerService } from './services/DIDCrawlerService';
export { BEEFService, BEEFError } from './services/BEEFService';
export { BRC100WalletService } from './services/BRC100WalletService';
export { WhatsOnChainChainTracker, type WhatsOnChainUTXO } from './services/WhatsOnChainChainTracker';
export { BabbageChainTracker } from './services/BabbageChainTracker';
export { MultiProviderChainTracker } from './services/MultiProviderChainTracker';
export { ChainTrackerFactory } from './services/ChainTrackerFactory';
export { BlockHeaderListener } from './services/BlockHeaderListener';
export { BlockchainServices } from './facade/BlockchainServices';
export * from './constants/BasketStrategy';
export * from './constants/TemplateRegistry';
export * from './constants/TokenRegistry';

export type {
  PaymentUTXO,
  TokenUTXO,
  WalletData,
  Balance,
} from './types';

export type {
  TransactionInput,
  BuildTransactionParams,
} from './services/TransactionBuilderService';

export {
  ValidationError,
  SigningError,
} from './services/TransactionBuilderService';

export type {
  ProjectConfig,
  BroadcastResult,
} from './services/BroadcastService';

export type {
  BluePagesOrganization,
  BluePagesServiceData,
  BluePagesCredential,
  BluePagesCredentialAttribute,
  BluePagesGenericAttribute,
  BluePagesValidationResult,
  DigitalAssetIdentifier,
} from './services/BluePagesService';

export type {
  SDJWTClaims,
  CredentialStatus,
  VerificationResult,
} from './services/JWTVerificationService';

export type {
  DIDService,
  CrawledCredential,
  CrawledOrganization,
} from './services/DIDCrawlerService';

export type {
  VerifiableCredential,
  VerifiablePresentation,
  JWTPayload,
} from './utils/jwtUtils';

export {
  decodeJWT,
  extractCredentialAttributes,
  getCredentialType,
} from './utils/jwtUtils';

export { calculateConfirmations } from './utils/ConfirmationTracker';

export type {
  ChainTracker,
  BlockHeader,
  MerkleProof,
} from './types';
