/**
 * Type definitions for blockchain infrastructure services
 */

import type { Transaction } from '@bsv/sdk';

export interface PaymentUTXO {
  txid: string;
  vout: number;
  satoshis: number;
  height: number;
  status: 'confirmed' | 'unconfirmed';
  script?: string; // Locking script hex (optional - can be derived from address)
}

export interface TokenUTXO {
  txid: string;
  vout: number;
  amt: number;
  tokenId: string;
  tokenAmount: number;
}

export interface WalletData {
  address: string;
  ordinalsAddress: string;
  privateKey: string;
  paymentUtxos: PaymentUTXO[];
  tokenUtxos: TokenUTXO[];
}

export interface Balance {
  satoshis: number;
  tokens: Record<string, number>;
}

/**
 * BRC-100 Wallet Types
 */

// Action status in state machine
export type ActionStatus =
  | 'pending'
  | 'signed'
  | 'broadcast'
  | 'completed'
  | 'aborted'
  | 'failed';

// Action input specification
export interface ActionInput {
  outpoint: string;
  unlockingScript?: string;
  inputDescription: string;
  sequenceNumber?: number;
  sourceTXID?: string;
  sourceOutputIndex?: number;
}

// Action output specification
export interface ActionOutput {
  lockingScript: string;
  satoshis: number;
  outputDescription: string;
  basket?: string;
  customInstructions?: string;
  tags?: string[];
}

// Action state (internal wallet state)
export interface ActionState {
  actionId: string;
  txid?: string;
  status: ActionStatus;
  description: string;
  labels: string[];
  inputs: ActionInput[];
  outputs: ActionOutput[];
  tx?: Transaction; // Transaction object (saved for signAction())
  reference?: string;
  createdAt: Date;
  updatedAt: Date;
  blockHeight?: number; // Block height where tx was confirmed (internal only for status transitions)
}

// Basket state (UTXO grouping)
export interface BasketState {
  [basketName: string]: {
    utxos: Array<{
      outpoint: string;
      satoshis: number;
      lockingScript: string;
      tags: string[];
      customInstructions?: string;
    }>;
  };
}

// createAction() parameters
export interface CreateActionParams {
  description: string;
  inputs?: ActionInput[];
  outputs?: ActionOutput[];
  lockTime?: number;
  version?: number;
  labels?: string[];
  options?: {
    signAndProcess?: boolean;
    acceptDelayedBroadcast?: boolean;
    noSend?: boolean;
    returnTXIDOnly?: boolean;
  };
}

// createAction() result
export interface CreateActionResult {
  txid?: string;
  tx?: string; // BEEF format
  signableTransaction?: {
    tx: string; // BEEF format
    reference: string;
  };
}

// signAction() parameters
export interface SignActionParams {
  spends: Record<
    number,
    {
      unlockingScript: string;
      sequenceNumber?: number;
    }
  >;
  reference: string;
  options?: {
    acceptDelayedBroadcast?: boolean;
    trustSelf?: 'known';
    knownTxids?: string[];
    returnTXIDOnly?: boolean;
    noSend?: boolean;
    sendWith?: string[];
  };
}

// signAction() result
export interface SignActionResult {
  txid?: string;
  tx?: string; // BEEF format (AtomicBEEF)
  sendWithResults?: Array<{
    txid: string;
    status: 'unproven' | 'sending' | 'failed';
  }>;
}

// abortAction() parameters
export interface AbortActionParams {
  reference: string;
}

// internalizeAction() parameters
export interface InternalizeActionParams {
  tx: string; // BEEF hex
  outputs: Array<{
    outputIndex: number;
    protocol: 'wallet payment' | 'basket insertion';
    paymentRemittance?: {
      derivationPrefix: string;
      derivationSuffix: string;
      senderIdentityKey: string;
    };
    insertionRemittance?: {
      basket: string;
      customInstructions?: string;
      tags?: string[];
    };
  }>;
  description: string;
  labels?: string[];
}

// internalizeAction() result
export interface InternalizeResult {
  success: boolean;
  txid: string;
  internalized: boolean;
}

// listActions() parameters
export interface ListActionsParams {
  labels?: string[];
  labelQueryMode?: 'any' | 'all';
  includeInputs?: boolean;
  includeOutputs?: boolean;
}

// listActions() result
export interface ListActionsResult {
  totalActions: number;
  actions: Array<{
    actionId: string;
    txid?: string;
    status: ActionStatus;
    description: string;
    labels: string[];
    inputs?: ActionInput[];
    outputs?: ActionOutput[];
    createdAt: Date;
    updatedAt: Date;
  }>;
}

// listOutputs() parameters
export interface ListOutputsParams {
  basket?: string;
  tags?: string[];
  tagQueryMode?: 'any' | 'all';
  includeCustomInstructions?: boolean;
  includeLocked?: boolean; // Include locked UTXOs (default: false - only unlocked)
}

// listOutputs() result
export interface ListOutputsResult {
  totalOutputs: number;
  outputs: Array<{
    outpoint: string;
    satoshis: number;
    lockingScript: string;
    tags: string[];
    customInstructions?: string;
  }>;
}

/**
 * ChainTracker - SPV validation interface
 *
 * Provides block header verification for BEEF validation per @bsv/sdk requirements.
 * Implementations query blockchain APIs (WhatsOnChain, TAAL, ARC) to verify Merkle roots.
 */
export interface ChainTracker {
  /**
   * Verify that a Merkle root exists at a specific block height.
   *
   * @param merkleRoot - Merkle root to verify (hex)
   * @param height - Block height
   * @returns true if valid, false otherwise
   */
  isValidRootForHeight(merkleRoot: string, height: number): Promise<boolean>;

  /**
   * Get current block height.
   *
   * @returns Current block height
   */
  currentHeight(): Promise<number>;

  /**
   * Get Merkle proof for a transaction.
   *
   * Used for confirmation tracking - returns proof if transaction is confirmed in a block.
   *
   * @param txid - Transaction ID
   * @returns Merkle proof if transaction confirmed, null if not confirmed or not found
   */
  getMerkleProof(txid: string): Promise<MerkleProof | null>;
}

/**
 * Block header data structure
 */
export interface BlockHeader {
  hash: string;
  height: number;
  merkleroot: string;
  confirmations?: number; // Optional - not all providers return this
  time?: number; // Optional - block timestamp
}

/**
 * Merkle proof data structure
 */
export interface MerkleProof {
  txid: string;
  blockHeight: number;
  merkleRoot: string;
  path: Array<{ offset: number; hash: string }>;
  index: number;
}
