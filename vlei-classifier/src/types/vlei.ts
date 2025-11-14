/**
 * vLEI Credential in ACDC (Authentic Chained Data Container) format
 * Based on: Trust over IP ACDC specification + KERI protocol
 * Reference: https://github.com/WebOfTrust/vLEI
 *
 * IMPORTANT: ACDC credentials use KERI event logs for authentication,
 * not embedded proof fields like W3C Verifiable Credentials.
 */
export interface VLEICredential {
  v: string;     // Version: "ACDC10JSON00011c_"
  d: string;     // Credential SAID (Self-Addressing IDentifier) - CESR encoded
  i: string;     // Issuer DID (did:keri method)
  ri: string;    // Registry identifier DID for revocation
  s: string;     // Schema identifier (SAID)

  a: {           // Attributes
    d: string;   // Attributes SAID
    i: string;   // Subject DID
    dt: string;  // Issuance datetime (ISO 8601)
    LEI: string; // Legal Entity Identifier (20 chars)
  };

  e: {           // Endorsements (credential chaining)
    d: string;   // Endorsements SAID
    qvi: {       // Qualified vLEI Issuer
      n: string; // QVI node identifier
      s: string; // QVI schema identifier
    };
  };

  r: {           // Rules (governance)
    d: string;   // Rules SAID
    usageDisclaimer: { l: string };
    issuanceDisclaimer: { l: string };
  };
}

/**
 * Verification method indicates how credential was verified
 * - 'python-verifier': Full cryptographic verification via Python vLEI verifier
 * - 'structure-validation': Structure-only validation (no cryptographic verification)
 */
export type VerificationMethod = 'python-verifier' | 'structure-validation';

/**
 * Verification result with dual-path support
 * Supports both cryptographic verification (Python verifier) and structure validation
 */
export interface VerificationResult {
  verified: boolean;
  credential: VLEICredential | null;
  jurisdiction: string | null;  // From GLEIF API or credential
  errors: string[];
  timestamp: string;

  // Dual-path verification support
  verificationMethod: VerificationMethod;
  mockVerification?: boolean;  // True if using structure validation instead of crypto
}

/**
 * KEL (Key Event Log) state captured at verification time
 *
 * Used for temporal proof: proves issuer's key state at moment of verification
 */
export interface KELState {
  /** Issuer's AID (Autonomic IDentifier) */
  issuerDid: string;

  /** Sequence number of last event in KEL (0-indexed) */
  sequenceNumber: number;

  /** SAID of last event in KEL (cryptographic digest) */
  lastEventSaid: string;

  /** ISO8601 timestamp when KEL state was captured */
  capturedAt: string;
}

/**
 * UI-specific verification result format
 * Used by Server Actions to present verification results to the UI
 */
export interface VerificationResultUI {
  verified: boolean;
  status: 'verified' | 'invalid' | 'revoked';
  credential: {
    lei: string;
    legalName: string;
    jurisdiction: string;
    issuedDate: string;
    expiresDate: string;
    said: string;
    /** Person's legal name (ECR credentials only) */
    personLegalName?: string;
    /** Engagement context role (ECR credentials only, e.g., "CFO", "CEO") */
    engagementContextRole?: string;
  } | null;
  verification: {
    saidValidation: boolean;
    qviChain: boolean;
    registryCheck: boolean;
    timestamp: string;
  } | null;
  errors: string[];

  /** KEL state at time of verification (for temporal proof) */
  kelState?: KELState;
}
