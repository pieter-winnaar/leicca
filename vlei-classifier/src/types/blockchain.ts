import { VerificationResult, VerificationResultUI } from './vlei';
import { ClassificationResult } from './decision-tree';
import { AuditEvent } from './audit';

/**
 * Evidence file with computed hash
 */
export interface EvidenceFile {
  filename: string;
  size: number;
  mimetype: string;
  hash: string; // SHA-256 hex string
  uploadedAt: string; // ISO 8601 timestamp
}

/**
 * Audit capsule containing verification + classification + evidence
 *
 * This structure is encrypted and anchored on-chain for tamper-proof audit trail
 */
export interface AuditCapsule {
  version: string; // "1.0.0"
  verification: VerificationResult | null; // From Sprint 2
  classification: ClassificationResult | null; // From Sprint 2
  evidence: EvidenceFile[]; // Evidence files with hashes
  metadata: {
    timestamp: string; // ISO 8601 when capsule created
    project: 'leicca-vlei-classifier';
    basket: 'leicca-vlei-audit';
    recordId: string; // Unique identifier for this classification
  };
}

/**
 * Public tags attached to blockchain transaction
 *
 * CRITICAL: NO sensitive data in public tags (only metadata)
 * Actual content is encrypted in transaction payload
 */
export interface PublicTags {
  type: 'LEICCA-Classification';
  lei?: string; // Legal Entity Identifier (from vLEI)
  jurisdiction?: string; // Jurisdiction code (e.g., "KY", "AD")
  timestamp: string; // ISO 8601
  recordId: string; // Links to audit logs
}

/**
 * Blockchain anchoring result
 */
export interface AnchoringResult {
  success: boolean;
  txid: string | null; // Bitcoin transaction ID
  basket: 'leicca-vlei-audit';
  timestamp: string; // ISO 8601
  blockNumber?: number; // After confirmation
  confirmations?: number; // Current confirmation count
  explorerUrl?: string; // Blockchain explorer link
  encryptedHex?: string; // DocV1 encrypted OP_RETURN hex (for later decryption)
  errors?: string[];
}

/**
 * Block confirmation data for temporal proof
 * Proves transaction is immutably recorded in blockchain
 */
export interface BlockConfirmation {
  /** BSV transaction ID */
  txid: string;

  /** Block height where transaction was confirmed (0 if unconfirmed) */
  blockHeight: number;

  /** Number of confirmations (blocks built on top) */
  confirmations: number;

  /** ISO8601 timestamp when confirmation was checked */
  checkedAt: string;
}

/**
 * Temporal proof bundle
 * Complete proof package showing credential was valid at specific time
 */
export interface TemporalProof {
  /** Verification result with KEL state */
  verification: VerificationResultUI;

  /** Block confirmation proving immutable timestamp */
  blockConfirmation: BlockConfirmation;

  /** ISO8601 timestamp when proof was created */
  createdAt: string;
}

/**
 * Decryption result for audit capsule
 */
export interface DecryptionResult {
  success: boolean;
  capsule?: AuditCapsule;
  error?: string;
  decryptedAt?: string; // ISO timestamp
}

/**
 * Decryption state for UI
 */
export type DecryptionState = 'idle' | 'loading' | 'success' | 'error';
