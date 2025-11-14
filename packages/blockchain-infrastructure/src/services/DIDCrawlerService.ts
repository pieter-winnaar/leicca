/**
 * DIDCrawlerService - Intermediate Service
 *
 * Dependencies: JWTVerificationService (for JWT verification)
 *
 * Responsibilities:
 * - Resolve did:web DIDs per W3C spec
 * - Fetch DID documents from .well-known/did.json
 * - Crawl LinkedVerifiablePresentation service endpoints
 * - Extract credentials from presentations
 * - Cache crawled organizations (5-minute TTL)
 *
 * Compatible with W3C DID spec and LinkedVerifiablePresentation services.
 */

import { extractCredentialAttributes, getCredentialType } from '../utils/jwtUtils';
import type { VerifiableCredential } from '../utils/jwtUtils';
import { resolveDidWeb, extractContactInfo } from '../utils/didUtils';
import { JWTVerificationService, type CredentialStatus } from './JWTVerificationService';

export interface DIDDocument {
  '@context'?: string[];
  id: string;
  verificationMethod?: unknown[];
  authentication?: string[];
  assertionMethod?: string[];
  keyAgreement?: string[];
  capabilityDelegation?: string[];
  capabilityInvocation?: string[];
  service?: DIDService[];
}

export interface DIDService {
  id: string;
  type: string;
  serviceEndpoint: string | ServiceEndpointWithOrigins;
}

export interface ServiceEndpointWithOrigins {
  origins?: string[];
  [key: string]: unknown;
}

export interface CrawledCredential {
  type: string;
  displayName: string;
  status: CredentialStatus;
  attributes: Record<string, unknown>;
  raw: VerifiableCredential;
  verificationError?: string;
  issuer?: string;
}

export interface CrawledOrganization {
  did: string;
  didDocument: DIDDocument;
  services: DIDService[];
  credentials: CrawledCredential[];
  contactInfo?: {
    legalName?: string;
    url?: string;
    email?: string;
    telephone?: string;
    logo?: string;
    kvkNumber?: string;
    location?: string;
  };
}

interface CachedOrganization {
  data: CrawledOrganization;
  timestamp: number;
}

export class DIDCrawlerService {
  private cache: Map<string, CachedOrganization> = new Map();
  private readonly CACHE_TTL = 5 * 60 * 1000; // 5 minutes
  private jwtVerificationService: JWTVerificationService;

  constructor(jwtVerificationService: JWTVerificationService) {
    this.jwtVerificationService = jwtVerificationService;
  }


  /**
   * Fetch a DID document from .well-known/did.json
   */
  private async fetchDIDDocument(did: string): Promise<DIDDocument | null> {
    const url = resolveDidWeb(did);
    if (!url) {
      return null;
    }

    try {
      const response = await fetch(url, {
        headers: {
          'Accept': 'application/json',
        }
      });

      if (!response.ok) {
        // Silently fail for non-existent DIDs
        return null;
      }

      const didDoc = await response.json();
      return didDoc as DIDDocument;
    } catch (error) {
      return null;
    }
  }

  /**
   * Fetch a LinkedVerifiablePresentation JWT from service endpoint
   */
  private async fetchLinkedVP(serviceEndpoint: string | ServiceEndpointWithOrigins): Promise<string | null> {
    try {
      // Handle cases where serviceEndpoint might be an object (e.g., with origins)
      let url: string;
      if (typeof serviceEndpoint === 'string') {
        url = serviceEndpoint;
      } else if (serviceEndpoint?.origins && Array.isArray(serviceEndpoint.origins)) {
        // Skip complex service endpoints for now
        return null;
      } else {
        return null;
      }

      const response = await fetch(url, {
        headers: {
          'Accept': 'text/plain, application/jwt',
        }
      });

      if (!response.ok) {
        return null;
      }

      const jwt = await response.text();
      return jwt;
    } catch (error) {
      return null;
    }
  }


  /**
   * Crawl a DID and fetch all associated verifiable credentials
   */
  async crawlDID(did: string): Promise<CrawledOrganization | null> {
    try {
      // Check cache first
      const cached = this.cache.get(did);
      if (cached && Date.now() - cached.timestamp < this.CACHE_TTL) {
        return cached.data;
      }

      // Fetch DID document
      const didDocument = await this.fetchDIDDocument(did);
      if (!didDocument) {
        return null;
      }

      // Find LinkedVerifiablePresentation services
      const services = didDocument.service || [];
      const lvpServices = services.filter(s =>
        s.type === 'LinkedVerifiablePresentation' ||
        s.type === 'LinkedDomains' // Some orgs use this
      );

      // Fetch credentials from each service
      const allCredentials: CrawledCredential[] = [];
      const seenCredentials = new Set<string>();

      for (const service of lvpServices) {
        const jwt = await this.fetchLinkedVP(service.serviceEndpoint);
        if (!jwt) {
          continue;
        }

        try {
          // Verify the presentation and its credentials
          const verificationResult = await this.jwtVerificationService.verifyCredentialsInPresentation(jwt);

          for (const result of verificationResult.credentials) {
            const cred = result.credential as VerifiableCredential;
            if (!cred) continue;

            // Extract attributes and type
            const attributes = extractCredentialAttributes(cred);
            const type = getCredentialType(cred);

            // Create unique identifier to avoid duplicates
            const credId = `${type}-${cred.id || ''}-${JSON.stringify(cred.type || cred.vct || '')}`;
            if (seenCredentials.has(credId)) {
              continue;
            }
            seenCredentials.add(credId);

            allCredentials.push({
              type: type,
              displayName: type,
              status: result.status,
              attributes: attributes,
              raw: cred,
              verificationError: result.error,
              issuer: result.issuer
            });
          }
        } catch (error) {
          // Security: Do NOT add unverified credentials when verification fails
          continue;
        }
      }

      // Extract contact info from credentials
      const contactInfo = extractContactInfo(allCredentials);

      const result: CrawledOrganization = {
        did,
        didDocument,
        services: lvpServices,
        credentials: allCredentials,
        contactInfo
      };

      // Cache the result
      this.cache.set(did, {
        data: result,
        timestamp: Date.now()
      });

      return result;
    } catch (error) {
      return null;
    }
  }

  /**
   * Clear cache (useful for testing or forcing refresh)
   */
  clearCache(): void {
    this.cache.clear();
  }

  /**
   * Get cache size (for monitoring/debugging)
   */
  getCacheSize(): number {
    return this.cache.size;
  }
}
