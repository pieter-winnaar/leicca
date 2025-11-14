/**
 * Type definitions for SDK operations
 *
 * Note: BSV SDK types (Hash, PrivateKey, PublicKey, Address) are re-exported
 * directly from @bsv/sdk in index.ts - no duplicate interfaces here.
 *
 * This file contains only custom types for:
 * - Token transfers
 * - UTXO management
 * - Wallet operations
 * - MintBlue SDK operations
 */

import type { PrivateKey } from '@bsv/sdk';

// ============================================================================
// MintBlue SDK Types
// ============================================================================

/**
 * MintBlue key object
 */
export interface MintblueKey {
  id: string;
  name: string;
  publicKey: string;
  secret: Uint8Array;
  createdAt: string;
  toBitcoinKey: () => PrivateKey;
}

/**
 * MintBlue transaction creation parameters
 */
export interface MintblueTransactionParams {
  projectId: string;
  outputs?: Array<{
    to: string;
    amount: number;
  }>;
  data?: string | Record<string, unknown>;
  rawTx?: boolean;
}

/**
 * MintBlue transaction query parameters
 */
export interface MintblueTransactionQuery {
  projectId?: string;
  status?: string;
  limit?: number;
  offset?: number;
}

/**
 * MintBlue transaction result
 */
export interface MintblueTransaction {
  id: string;
  txid: string;
  status: string;
  createdAt: string;
  projectId: string;
  rawTx?: string;
}

/**
 * MintBlue transaction query response
 */
export interface MintblueTransactionQueryResponse {
  transactions: MintblueTransaction[];
  total: number;
}

/**
 * BSV SDK Hash namespace interface (for dependency injection)
 */
export interface BSVHashSDK {
  sha256(data: string | number[], enc?: 'hex' | 'utf8'): number[];
}

// ============================================================================
// Token SDK Function Types (js-1sat-ord)
// ============================================================================

/**
 * Token SDK interface for test injection
 * Based on js-1sat-ord package
 */
export interface TokenSDK {
  fetchPayUtxos: (address: string) => Promise<UTXO[]>;
  fetchTokenUtxos: (address: string, tokenId?: string) => Promise<TokenUTXO[]>;
  transferOrdTokens: (params: {
    fromAddress: string;
    toAddress: string;
    tokenId: string;
    amount: number;
    privateKey: PrivateKey | string;
  }) => Promise<{ txid: string; rawTx: string }>;
}

// ============================================================================
// Token Type Definitions
// ============================================================================

/**
 * Token transfer parameters
 */
export interface TokenTransferParams {
  fromAddress: string;
  toAddress: string;
  tokenId: string;
  amount: number;
  privateKey: string;
}

/**
 * UTXO (Unspent Transaction Output) - WhatsOnChain format
 */
export interface UTXO {
  tx_hash: string;
  tx_pos: number;
  value: number;
  height: number;
  status?: 'confirmed' | 'unconfirmed';
}

/**
 * Payment UTXO (normalized format)
 */
export interface PaymentUTXO {
  txid: string;
  vout: number;
  satoshis: number;
  height: number;
  status: 'confirmed' | 'unconfirmed';
}

/**
 * Token UTXO (BSV-21 token UTXO)
 */
export interface TokenUTXO {
  txid: string;
  vout: number;
  amt: number;
  tokenId: string;
  tokenAmount: number;
}

/**
 * Transaction result
 */
export interface TransactionResult {
  txid: string;
  rawTx: string;
}

/**
 * Token type enumeration (from js-1sat-ord)
 */
export enum TokenType {
  BSV20 = 1,
  BSV21 = 2,
}

// ============================================================================
// Key Derivation Types
// ============================================================================

/**
 * Type 42 derivation parameters
 */
export interface Type42DerivationParams {
  masterKey: PrivateKey;
  derivationPath: string;
}

/**
 * Wallet addresses
 */
export interface WalletAddresses {
  paymentAddress: string;
  ordinalsAddress: string;
}
