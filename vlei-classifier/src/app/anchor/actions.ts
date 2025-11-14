/**
 * LEICCA vLEI Classifier - Anchor Page Server Actions
 *
 * Real blockchain anchoring using BlockchainAnchoringService
 */

'use server';

// CRITICAL: Polyfills MUST run before any imports that use them
// Polyfill for 'self' in Node.js environment (required by @mintblue/sdk)
(globalThis as any).self = globalThis.self || globalThis;

// DON'T polyfill Buffer in Server Actions - Node.js has native Buffer
// The polyfill was INTERFERING with @ts-bitcoin/core's Buffer checks

import { unstable_noStore as noStore } from 'next/cache';
import { BlockchainAnchoringService } from '@/services/blockchain-anchoring';
import { AuditLogService } from '@/services/audit-log';
import type { EvidenceFile, AnchoringResult, TemporalProof } from '@/types/blockchain';
import type { VerificationResult, VerificationResultUI } from '@/types/vlei';
import type { ClassificationResult } from '@/types/decision-tree';

// Singleton instance (initialized on first use)
let anchoringService: BlockchainAnchoringService | null = null;

async function getAnchoringService(): Promise<BlockchainAnchoringService> {
  if (!anchoringService) {
    const sdkToken = process.env.MINTBLUE_SDK_TOKEN;
    if (!sdkToken) {
      throw new Error('MINTBLUE_SDK_TOKEN not configured');
    }

    anchoringService = new BlockchainAnchoringService();
    await anchoringService.initialize(sdkToken);
  }
  return anchoringService;
}

/**
 * Anchor audit capsule to blockchain
 *
 * Server Action called from Anchor page
 *
 * @param verification - Verification result from Sprint 2 (VerificationResult for blockchain, but may have UI extensions)
 * @param verificationUI - UI-formatted verification result with KEL state (for temporal proof)
 * @param classification - Classification result from Sprint 2
 * @param evidence - Evidence files with computed hashes
 * @returns Anchoring result with txid and basket
 */
export async function anchorToBlockchainAction(
  verification: VerificationResult | null,
  verificationUI: VerificationResultUI | null,
  classification: ClassificationResult | null,
  evidence: EvidenceFile[]
): Promise<AnchoringResult> {
  noStore();
  try {
    const service = await getAnchoringService();
    const auditLog = AuditLogService.getInstance();

    // Debug logging
    console.log('[anchorToBlockchainAction] Received verification:', JSON.stringify(verification, null, 2));
    console.log('[anchorToBlockchainAction] LEI path check:', verification?.credential?.a?.LEI);

    // Generate unique record ID
    const recordId = `audit_${Date.now()}_${Math.random().toString(36).substring(7)}`;

    // Create audit capsule
    const capsule = service.createAuditCapsule(
      verification,
      classification,
      evidence,
      recordId
    );

    // Extract public tags
    const publicTags = service.extractPublicTags(capsule);
    console.log('[anchorToBlockchainAction] Public tags:', publicTags);

    // Anchor to blockchain
    const result = await service.anchorAuditCapsule(capsule, publicTags);

    if (result.success && result.txid) {
      // Assemble temporal proof
      let temporalProof: TemporalProof | null = null;

      // Only create temporal proof if we have verificationUI with KEL state
      if (verificationUI) {
        // Don't fetch blockHeight at anchor time - transaction just broadcast, not yet confirmed
        // Audit page will fetch live confirmation status using /api/transaction-status
        temporalProof = {
          verification: verificationUI,
          blockConfirmation: {
            txid: result.txid,
            blockHeight: 0, // Will be fetched when confirmed
            confirmations: 0,
            checkedAt: new Date().toISOString()
          },
          createdAt: new Date().toISOString()
        };

        console.log('✓ Temporal proof assembled:', {
          kelSequence: verificationUI.kelState?.sequenceNumber,
          txid: result.txid
        });
      }

      // Log success with full verification and classification data for downloads
      await auditLog.logEvent({
        id: recordId,
        type: 'anchoring',
        timestamp: result.timestamp,
        data: {
          txid: result.txid,
          basket: result.basket,
          recordId: recordId,
          lei: publicTags.lei,
          jurisdiction: publicTags.jurisdiction,
          evidenceCount: evidence.length,
          // Store encrypted hex for browser-side decryption
          encryptedHex: result.encryptedHex,
          // Store full data for downloads
          verification: verificationUI,
          classification: classification,
          temporalProof: temporalProof || undefined
        },
        txid: result.txid
      });
    } else {
      // Log failure
      await auditLog.logEvent({
        id: recordId,
        type: 'anchoring',
        timestamp: result.timestamp,
        data: {
          recordId: recordId,
          errors: result.errors
        }
      });
    }

    return result;

  } catch (error) {
    console.error('anchorToBlockchainAction failed:', error);
    return {
      success: false,
      txid: null,
      basket: 'leicca-vlei-audit',
      timestamp: new Date().toISOString(),
      errors: [error instanceof Error ? error.message : 'Unknown error']
    };
  }
}
