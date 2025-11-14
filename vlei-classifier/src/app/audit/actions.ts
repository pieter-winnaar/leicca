/**
 * LEICCA vLEI Classifier - Audit Page Server Actions
 *
 * Server-side actions for audit event retrieval from AuditLogService
 */

'use server';

// CRITICAL: Polyfills MUST run before any imports that use them
// Polyfill for 'self' in Node.js environment (required by @mintblue/sdk)
(globalThis as any).self = globalThis.self || globalThis;

// DON'T polyfill Buffer in Server Actions - Node.js has native Buffer
// The polyfill was INTERFERING with @ts-bitcoin/core's Buffer checks

import { unstable_noStore as noStore } from 'next/cache';
import { AuditLogService } from '@/services/audit-log';
import { BlockchainAnchoringService } from '@/services/blockchain-anchoring';
import type { DecryptionResult } from '@/types/blockchain';

export interface AuditEvent {
  id: string;
  type: 'verification' | 'classification' | 'anchoring';
  timestamp: string;
  referenceId: string;
  description: string;
  data: Record<string, any>;
  txid?: string;
  details: {
    lei?: string;
    said?: string;
    txid?: string;
    blockHeight?: number;
    classification?: string;
    files?: string[];
    status?: string;
    basket?: string;
    recordId?: string;
    evidenceCount?: number;
    jurisdiction?: string;
    encryptedHex?: string; // DocV1 encrypted OP_RETURN hex for decryption
    verification?: any; // Full verification data for downloads
    classificationData?: any; // Full classification data for downloads
    temporalProof?: any; // Temporal proof with KEL state and block confirmation
  };
}

interface AuditFilters {
  eventType?: string;
  dateStart?: string;
  dateEnd?: string;
  search?: string;
}

/**
 * Get audit events with optional filtering
 */
export async function getAuditEventsAction(filters: AuditFilters): Promise<AuditEvent[]> {
  noStore();
  const service = AuditLogService.getInstance();

  // Get all events from service
  const allEvents = await service.getEvents();

  // Transform to AuditEvent format
  const transformedEvents: AuditEvent[] = allEvents.map((event) => ({
    id: event.id,
    type: event.type,
    timestamp: event.timestamp,
    referenceId: event.data?.lei || event.data?.recordId || event.id,
    description: getEventDescription(event),
    data: event.data || {},
    txid: event.txid,
    details: {
      lei: event.data?.lei,
      said: event.data?.said,
      txid: event.txid,
      basket: event.data?.basket,
      recordId: event.data?.recordId,
      evidenceCount: event.data?.evidenceCount,
      jurisdiction: event.data?.jurisdiction,
      encryptedHex: event.data?.encryptedHex, // Include encrypted data for decryption
      // Extract string representation from classification object
      classification: event.data?.classification?.category ||
                      (typeof event.data?.classification === 'string' ? event.data?.classification : undefined),
      status: event.txid ? 'Confirmed' : 'Pending',
      // Include full data for downloads
      verification: event.data?.verification,
      classificationData: typeof event.data?.classification === 'object' ? event.data?.classification : undefined,
      temporalProof: event.data?.temporalProof, // Include temporal proof data
    },
  }));

  // Apply filters
  let filtered = transformedEvents;

  // Event type filter
  if (filters.eventType && filters.eventType !== 'all') {
    filtered = filtered.filter((event) => event.type === filters.eventType);
  }

  // Search filter
  if (filters.search && filters.search.trim()) {
    const query = filters.search.toLowerCase();
    filtered = filtered.filter(
      (event) =>
        event.referenceId.toLowerCase().includes(query) ||
        event.description.toLowerCase().includes(query) ||
        event.details.lei?.toLowerCase().includes(query) ||
        event.details.said?.toLowerCase().includes(query)
    );
  }

  // Date range filter
  if (filters.dateStart) {
    const startDate = new Date(filters.dateStart);
    filtered = filtered.filter((event) => new Date(event.timestamp) >= startDate);
  }
  if (filters.dateEnd) {
    const endDate = new Date(filters.dateEnd);
    filtered = filtered.filter((event) => new Date(event.timestamp) <= endDate);
  }

  return filtered;
}

/**
 * Generate human-readable description for audit event
 */
function getEventDescription(event: any): string {
  switch (event.type) {
    case 'verification':
      return `vLEI credential verified for ${event.data?.lei || 'entity'}`;
    case 'classification':
      return `Basel CCR classification completed`;
    case 'anchoring':
      return `Evidence capsule anchored to blockchain (${event.data?.evidenceCount || 0} files)`;
    default:
      return 'Audit event';
  }
}

// Singleton instance for decryption (initialized on first use)
let anchoringServiceForDecryption: BlockchainAnchoringService | null = null;

async function getAnchoringServiceForDecryption(): Promise<BlockchainAnchoringService> {
  if (!anchoringServiceForDecryption) {
    const sdkToken = process.env.MINTBLUE_SDK_TOKEN;
    if (!sdkToken) {
      throw new Error('MINTBLUE_SDK_TOKEN not configured');
    }

    anchoringServiceForDecryption = new BlockchainAnchoringService();
    await anchoringServiceForDecryption.initialize(sdkToken);
  }
  return anchoringServiceForDecryption;
}

/**
 * Decrypt audit capsule from blockchain transaction
 *
 * Server Action called from Audit page to decrypt on-chain data
 *
 * @param txid - Transaction ID (for logging/reference)
 * @param encryptedHex - DocV1 encrypted OP_RETURN script hex (from AuditEvent.details.encryptedHex)
 * @returns Decryption result with capsule or error
 */
export async function decryptAuditCapsuleAction(
  txid: string,
  encryptedHex: string
): Promise<DecryptionResult> {
  noStore();
  try {
    console.log('[decryptAuditCapsuleAction] Decrypting capsule for txid:', txid);

    // Validate inputs
    if (!encryptedHex || encryptedHex.length === 0) {
      return {
        success: false,
        error: 'No encrypted data provided. This audit event may not have blockchain data.',
        decryptedAt: new Date().toISOString()
      };
    }

    // Get service instance
    const service = await getAnchoringServiceForDecryption();

    // Decrypt capsule using BlockchainAnchoringService
    const capsule = await service.decryptAuditCapsule(encryptedHex);

    console.log('[decryptAuditCapsuleAction] Successfully decrypted capsule:', {
      version: capsule.version,
      recordId: capsule.metadata?.recordId,
      hasVerification: !!capsule.verification,
      hasClassification: !!capsule.classification
    });

    return {
      success: true,
      capsule,
      decryptedAt: new Date().toISOString()
    };

  } catch (error) {
    console.error('[decryptAuditCapsuleAction] Decryption failed:', error);

    // Return user-friendly error messages
    let errorMessage = 'Failed to decrypt audit capsule';

    if (error instanceof Error) {
      if (error.message.includes('key not found')) {
        errorMessage = 'Decryption key not available. Cannot decrypt this capsule.';
      } else if (error.message.includes('invalid') || error.message.includes('corrupted')) {
        errorMessage = 'Invalid or corrupted encrypted data.';
      } else if (error.message.includes('not initialized')) {
        errorMessage = 'Blockchain service not available. Please try again.';
      } else {
        errorMessage = error.message;
      }
    }

    return {
      success: false,
      error: errorMessage,
      decryptedAt: new Date().toISOString()
    };
  }
}
