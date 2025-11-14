// CRITICAL: Polyfills MUST run FIRST before any imports
// Polyfill for 'self' in Node.js environment (required by @mintblue/sdk)
(globalThis as any).self = globalThis.self || globalThis;

// DON'T polyfill Buffer - Node.js Server Actions have native Buffer
// Polyfilling was INTERFERING with @ts-bitcoin/core's instanceof Buffer checks

import { AuditCapsule, EvidenceFile, PublicTags, AnchoringResult } from '@/types/blockchain';
import { VerificationResult } from '@/types/vlei';
import { ClassificationResult } from '@/types/decision-tree';
import { hashString, hashFile } from '@/lib/crypto-utils';
import { BlockchainServices } from '@design-system-demo/blockchain-infrastructure';
import type { JWK } from 'jose';
import type { Mintblue } from '@mintblue/sdk';
// NOTE: @mintblue/sdk implementation is imported dynamically to allow polyfill to run first

/**
 * BlockchainAnchoringService
 *
 * Implements audit trail anchoring using:
 * - DocV1 low-level encryption (multiparty: audit_key + self_key)
 * - BlockchainServices for transaction broadcasting
 * - Custom basket: leicca-vlei-audit
 *
 * Based on RT-3 research: LOW-LEVEL APPROACH (recommended)
 */
export class BlockchainAnchoringService {
  private blockchainServices: BlockchainServices | null = null;
  private mintblue: Mintblue | null = null;
  private initialized = false;

  /**
   * Initialize BlockchainServices and Mintblue SDK
   *
   * CRITICAL: Call this ONCE at app startup, not per-request
   *
   * @param sdkToken - MintBlue SDK token (from env)
   * @throws Error if token invalid or baskets cannot be created
   */
  async initialize(sdkToken: string): Promise<void> {
    if (this.initialized) {
      return; // Already initialized
    }

    if (!sdkToken) {
      throw new Error('MINTBLUE_SDK_TOKEN not configured in environment variables');
    }

    try {
      // Create BlockchainServices with required baskets
      this.blockchainServices = await BlockchainServices.create(
        sdkToken,
        ['satoshis', 'outgoing', 'leicca-vlei-audit']
      );

      // DYNAMIC IMPORT - ensures polyfill runs first
      // This pattern is used in @design-system-demo/sdk-integration/MintBlueSDKService
      const { Mintblue } = await import('@mintblue/sdk');

      // Create Mintblue SDK instance for key management
      this.mintblue = await Mintblue.create({ token: sdkToken });

      this.initialized = true;
      console.log('[BlockchainAnchoringService] Initialized successfully');
    } catch (error) {
      console.error('[BlockchainAnchoringService] Initialization failed:', error);
      throw new Error(`Failed to initialize BlockchainAnchoringService: ${error instanceof Error ? error.message : 'Unknown error'}`);
    }
  }

  /**
   * Check if service is ready to anchor transactions
   */
  isReady(): boolean {
    return this.initialized && this.blockchainServices !== null && this.mintblue !== null;
  }

  /**
   * Get BlockchainServices instance (throws if not initialized)
   */
  private getBlockchain(): BlockchainServices {
    if (!this.blockchainServices) {
      throw new Error('BlockchainAnchoringService not initialized. Call initialize() first.');
    }
    return this.blockchainServices;
  }

  /**
   * Get Mintblue SDK instance (throws if not initialized)
   */
  private getMintblue(): Mintblue {
    if (!this.mintblue) {
      throw new Error('BlockchainAnchoringService not initialized. Call initialize() first.');
    }
    return this.mintblue;
  }

  /**
   * Create audit capsule from verification + classification results
   *
   * @param verification - vLEI verification result (Sprint 2)
   * @param classification - Basel CCR classification result (Sprint 2)
   * @param evidence - Evidence files with computed hashes
   * @param recordId - Unique identifier for this audit record
   * @returns Structured audit capsule ready for encryption
   */
  createAuditCapsule(
    verification: VerificationResult | null,
    classification: ClassificationResult | null,
    evidence: EvidenceFile[],
    recordId: string
  ): AuditCapsule {
    return {
      version: '1.0.0',
      verification,
      classification,
      evidence,
      metadata: {
        timestamp: new Date().toISOString(),
        project: 'leicca-vlei-classifier',
        basket: 'leicca-vlei-audit',
        recordId
      }
    };
  }

  /**
   * Extract public tags from audit capsule
   *
   * CRITICAL: Only non-sensitive metadata goes in public tags
   * Actual data is encrypted in transaction payload
   */
  extractPublicTags(capsule: AuditCapsule): PublicTags {
    return {
      type: 'LEICCA-Classification',
      lei: capsule.verification?.credential?.a?.LEI,
      jurisdiction: capsule.verification?.jurisdiction || undefined,
      timestamp: capsule.metadata.timestamp,
      recordId: capsule.metadata.recordId
    };
  }

  /**
   * Serialize capsule to JSON string for encryption
   */
  serializeCapsule(capsule: AuditCapsule): string {
    return JSON.stringify(capsule, null, 0); // Compact JSON
  }

  /**
   * Hash evidence file with SHA-256
   * @param file - File to hash
   * @returns 64-character hex hash
   */
  async hashEvidence(file: File): Promise<string> {
    return hashFile(file);
  }

  /**
   * Get keys from MintBlue SDK for DocV1 encryption
   *
   * Returns three keys:
   * 1. signKey - Private key for transaction signing (mintblue_signing)
   * 2. selfKeyJWK - Public key for self-decryption (mintblue_deriving)
   * 3. auditKeyJwk - Fixed public key for audit trail decryption
   *
   * Based on DocV1Writer.ts pattern
   */
  private async getKeys(): Promise<{
    signKey: any;
    selfKeyJWK: JWK;
    auditKeyJwk: JWK;
  }> {
    const mintblue = this.getMintblue();

    // 1. Signing key (with private key for transaction signing)
    const signKey = await mintblue.keys.findKeyByName('mintblue_signing');
    if (!signKey) {
      throw new Error('mintblue_signing key not found');
    }

    // 2. Self key (public only for encryption)
    const selfKey = await mintblue.keys.findKeyByName('mintblue_deriving');
    if (!selfKey) {
      throw new Error('mintblue_deriving key not found');
    }
    const selfKeyJWK = await selfKey.toJWK({ includePrivate: false });

    // 3. Audit key (fixed public key from DocV1Writer.ts)
    const auditKeyJwk: JWK = {
      kty: 'EC',
      crv: 'P-256',
      x: 'IUmBvdd2fxOXntM8LIblc6LxbOdXO-Dq-1-t_b-N9iI',
      y: 'rRD0ey3ke-tfdSedihPDiulERm1QGEOWa7T0VkHFNak',
      kid: 'HynZ-z5ebLxuKV7XroSadC0sZtggg9QOTxJXR7tsLI0',
    };

    return { signKey, selfKeyJWK, auditKeyJwk };
  }

  /**
   * Anchor audit capsule to blockchain using DocV1 encryption + BlockchainServices
   *
   * Implementation Strategy (LOW-LEVEL APPROACH from RT-3):
   * 1. Get keys from MintBlue SDK (mintblue_signing, mintblue_deriving, audit_key)
   * 2. Encode audit capsule as UTF-8
   * 3. Create DocV1 envelope with low-level API (DocV1.create)
   * 4. Extract OP_RETURN script hex (toOpReturnScriptHex)
   * 5. Create transaction with BlockchainServices using brc100Wallet.createAction
   * 6. Return txid and explorer URL
   *
   * @param capsule - Audit capsule to encrypt and anchor
   * @param publicTags - Non-sensitive metadata (attached as tags)
   * @returns Transaction result with txid and basket
   */
  async anchorAuditCapsule(
    capsule: AuditCapsule,
    publicTags: PublicTags
  ): Promise<AnchoringResult> {
    if (!this.isReady()) {
      throw new Error('BlockchainAnchoringService not initialized. Call initialize() first.');
    }

    try {
      // STEP 1: Get keys from MintBlue SDK
      const { signKey, selfKeyJWK, auditKeyJwk } = await this.getKeys();

      // STEP 2: Encode audit capsule as UTF-8
      const capsuleJson = JSON.stringify(capsule);
      const capsuleData = new TextEncoder().encode(capsuleJson);

      // STEP 3: Create DocV1 envelope with low-level API
      // DYNAMIC IMPORT for envelopes - ensures polyfill runs first
      const { envelopes } = await import('@mintblue/sdk');
      const DocV1 = envelopes.DocV1.DocV1;

      const signerJWK = await signKey.toJWK({ includePrivate: true });

      const docv1 = await DocV1.create({
        type: 'doc' as const,
        data: capsuleData,
        signers: [signerJWK],
        receivers: [auditKeyJwk, selfKeyJWK],
        iterations: 200000,
        options: {
          filename: `audit-${Date.now()}.json`,
          mimetype: 'application/json',
          meta: 'LEICCA vLEI audit trail',
        },
      });

      // STEP 4: Extract OP_RETURN script hex AND encrypted CBOR data
      const opReturnHex = docv1.toOpReturnScriptHex(); // Complete Bitcoin script for transaction
      const encryptedDataHex = Buffer.from(docv1.info.encryptedData).toString('hex'); // Raw CBOR for decryption

      // STEP 5: Sync wallet from blockchain to discover any funded UTXOs
      const blockchain = this.getBlockchain();

      // Get wallet address for funding instructions
      const address = blockchain.getMasterAddress();
      console.log('[BlockchainAnchoringService] Wallet address:', address);

      // Auto-discover UTXOs from WhatsOnChain (including unconfirmed)
      console.log('[BlockchainAnchoringService] Syncing wallet from blockchain...');
      const syncResult = await blockchain.syncFromBlockchain(true); // Include unconfirmed UTXOs
      console.log('[BlockchainAnchoringService] Sync result:', syncResult);

      // STEP 6: Get available UTXOs from 'satoshis' basket
      const satoshiOutputsResult = await blockchain.brc100Wallet.listOutputs({
        basket: 'satoshis',
        includeLocked: false, // Only get spendable UTXOs
      });

      if (!satoshiOutputsResult.outputs || satoshiOutputsResult.outputs.length === 0) {
        throw new Error(`No spendable UTXOs available in satoshis basket. Fund wallet at address: ${address} and try again.`);
      }

      // STEP 7: Select largest UTXO for funding
      const sortedOutputs = satoshiOutputsResult.outputs.sort((a, b) =>
        (b.satoshis || 0) - (a.satoshis || 0)
      );
      const selectedOutput = sortedOutputs[0];
      const inputSatoshis = selectedOutput.satoshis || 0;

      console.log(`[BlockchainAnchoringService] Selected UTXO: ${inputSatoshis} satoshis`);

      // Estimate fee (1 sat/byte * ~600 bytes for OP_RETURN tx)
      const estimatedFee = 600;

      if (inputSatoshis < estimatedFee) {
        throw new Error(`Insufficient funds. Need at least ${estimatedFee} satoshis, have ${inputSatoshis}`);
      }

      const changeSatoshis = inputSatoshis - estimatedFee;

      // Build outputs array
      const outputs: any[] = [];

      // Change output (if any) - must come first
      if (changeSatoshis > 0) {
        outputs.push({
          lockingScript: selectedOutput.lockingScript,
          satoshis: changeSatoshis,
          outputDescription: 'Change output',
          basket: 'satoshis',
        });
      }

      // OP_RETURN output with encrypted audit data
      // NOTE: OP_RETURN outputs use satoshis: 1 (minimum) to pass validation
      // The actual output will have 0 satoshis when built by TransactionBuilder
      outputs.push({
        lockingScript: opReturnHex,
        satoshis: 1, // Minimum for validation (TransactionBuilder will use 0)
        outputDescription: 'vLEI audit capsule (encrypted)',
        basket: 'leicca-vlei-audit',
        tags: [
          'audit-trail',
          `lei:${publicTags.lei || 'unknown'}`,
          `jurisdiction:${publicTags.jurisdiction || 'unknown'}`,
          `record:${publicTags.recordId}`,
        ],
      });

      // STEP 8: Create transaction with proper inputs and outputs
      const result = await blockchain.brc100Wallet.createAction({
        description: 'LEICCA vLEI audit anchoring',
        labels: ['leicca-audit', 'vlei-verification'],
        inputs: [
          {
            outpoint: selectedOutput.outpoint,
            inputDescription: 'UTXO from satoshis basket',
            sequenceNumber: 0xffffffff,
          },
        ],
        outputs,
        options: { signAndProcess: true },
      });

      // STEP 9: Return result
      return {
        success: true,
        txid: result.txid!,
        basket: 'leicca-vlei-audit',
        timestamp: new Date().toISOString(),
        explorerUrl: this.getExplorerUrl(result.txid!),
        encryptedHex: encryptedDataHex, // Store raw CBOR for decryption (NOT the script hex)
        errors: []
      };

    } catch (error) {
      console.error('[BlockchainAnchoringService] Failed to anchor audit capsule:', error);
      return {
        success: false,
        txid: null,
        basket: 'leicca-vlei-audit',
        timestamp: new Date().toISOString(),
        errors: [error instanceof Error ? error.message : 'Unknown error']
      };
    }
  }

  /**
   * Get transaction confirmation status using WhatsOnChain SPV proofs
   *
   * CRITICAL: Uses WhatsOnChain directly for getMerkleProof() support
   * (Babbage ChainTracker doesn't support getMerkleProof in dev mode)
   *
   * @param txid - Transaction ID to check
   * @returns Transaction status with block confirmation if available
   */
  async getTransactionStatus(txid: string): Promise<{
    confirmed: boolean;
    confirmations: number;
    blockHeight?: number;
  }> {
    try {
      // DYNAMIC IMPORT for WhatsOnChain ChainTracker
      const { WhatsOnChainChainTracker } = await import('@design-system-demo/blockchain-infrastructure');
      const chainTracker = new WhatsOnChainChainTracker('main');

      // Get Merkle proof (SPV proof that transaction is in a block)
      const proof = await chainTracker.getMerkleProof(txid);

      if (!proof) {
        // Transaction not confirmed yet
        return {
          confirmed: false,
          confirmations: 0
        };
      }

      // Get current height to calculate confirmations
      const currentHeight = await chainTracker.currentHeight();
      const confirmations = currentHeight - proof.blockHeight + 1;

      return {
        confirmed: confirmations >= 6,
        confirmations: Math.max(0, confirmations),
        blockHeight: proof.blockHeight
      };

    } catch (error) {
      console.error('[BlockchainAnchoringService] Failed to get transaction status:', error);

      return {
        confirmed: false,
        confirmations: 0
      };
    }
  }

  /**
   * Decrypt audit capsule from OP_RETURN encrypted hex
   *
   * CRITICAL: Requires mintblue_deriving private key for decryption
   *
   * Implementation Strategy:
   * 1. Get mintblue_deriving private key with includePrivate: true
   * 2. Parse OP_RETURN script to extract encrypted DocV1 data
   * 3. Decrypt with DocV1.parse({ encryptedData, receiverKey })
   * 4. Parse decrypted bytes as JSON to AuditCapsule
   *
   * @param encryptedHex - DocV1 encrypted OP_RETURN script hex (from AnchoringResult.encryptedHex)
   * @returns Decrypted audit capsule
   * @throws Error if decryption fails (wrong key, corrupted data, etc.)
   */
  async decryptAuditCapsule(encryptedHex: string): Promise<AuditCapsule> {
    if (!this.isReady()) {
      throw new Error('BlockchainAnchoringService not initialized. Call initialize() first.');
    }

    try {
      // STEP 1: Get mintblue_deriving private key for decryption
      const mintblue = this.getMintblue();
      const derivingKey = await mintblue.keys.findKeyByName('mintblue_deriving');

      if (!derivingKey) {
        throw new Error('mintblue_deriving key not found in wallet');
      }

      // Get private key as JWK (required for decryption)
      const receiverKeyJWK = await derivingKey.toJWK({ includePrivate: true });

      // STEP 2: Convert encrypted hex to bytes
      // encryptedHex contains the raw CBOR data (from docv1.info.encryptedData)
      const encryptedBytes = new Uint8Array(Buffer.from(encryptedHex, 'hex'));

      // STEP 3: Decrypt with DocV1.parse
      // DYNAMIC IMPORT for envelopes - ensures polyfill runs first
      const { envelopes } = await import('@mintblue/sdk');
      const DocV1 = envelopes.DocV1.DocV1;

      // NOTE: The TypeScript definition for DocV1ParseOptions incorrectly requires secret1/secret2
      // However, the implementation (v1.ts lines 148-158) supports using only receiverKey
      // Using type assertion to work around the incorrect type definition
      const docv1 = await DocV1.parse({
        encryptedData: encryptedBytes,
        receiverKey: receiverKeyJWK,
      } as any);

      // STEP 4: Extract decrypted data from info.data
      const decryptedBytes = docv1.info.data;
      const decryptedJson = new TextDecoder().decode(decryptedBytes);
      const capsule = JSON.parse(decryptedJson) as AuditCapsule;

      console.log('[BlockchainAnchoringService] Successfully decrypted audit capsule:', {
        version: capsule.version,
        recordId: capsule.metadata?.recordId,
        hasVerification: !!capsule.verification,
        hasClassification: !!capsule.classification,
        evidenceCount: capsule.evidence?.length || 0
      });

      return capsule;

    } catch (error) {
      console.error('[BlockchainAnchoringService] Failed to decrypt audit capsule:', error);

      // Provide more specific error messages
      if (error instanceof Error) {
        if (error.message.includes('key not found')) {
          throw new Error('Decryption key not found in wallet. Cannot decrypt this capsule.');
        } else if (error.message.includes('invalid')) {
          throw new Error('Invalid encrypted data format. The capsule may be corrupted.');
        } else if (error.message.includes('decrypt')) {
          throw new Error('Decryption failed. Wrong key or corrupted data.');
        }
      }

      throw new Error(`Failed to decrypt audit capsule: ${error instanceof Error ? error.message : 'Unknown error'}`);
    }
  }

  /**
   * Generate blockchain explorer URL for transaction
   */
  private getExplorerUrl(txid: string): string {
    const network = process.env.BLOCKCHAIN_NETWORK || 'main';
    if (network === 'test') {
      return `https://test.whatsonchain.com/tx/${txid}`;
    }
    return `https://whatsonchain.com/tx/${txid}`;
  }
}
