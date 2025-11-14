/**
 * DID Utility Functions
 *
 * Pure utility functions for DID resolution and credential processing.
 * Extracted from DIDCrawlerService to maintain <300 line service limit.
 */

import type { CrawledCredential, CrawledOrganization } from '../services/DIDCrawlerService';

/**
 * Resolve a did:web identifier to its HTTPS URL per W3C DID spec
 *
 * @param did - The did:web identifier to resolve
 * @returns HTTPS URL to the DID document, or null if invalid
 *
 * @example
 * resolveDidWeb('did:web:example.com') // 'https://example.com/.well-known/did.json'
 * resolveDidWeb('did:web:example.com:path:to:did') // 'https://example.com/path/to/did/did.json'
 */
export function resolveDidWeb(did: string): string | null {
  if (!did.startsWith('did:web:')) {
    return null;
  }

  // Validate DID format to prevent injection
  if (!/^did:web:[a-zA-Z0-9.-]+(?::[a-zA-Z0-9._-]+)*$/.test(did)) {
    return null;
  }

  // Remove the did:web: prefix
  const didPart = did.substring(8);

  // Split by colons for path segments
  const parts = didPart.split(':');
  const domain = parts[0];

  // Ensure domain exists
  if (!domain) {
    return null;
  }

  // Validate domain format
  if (!/^[a-zA-Z0-9.-]+$/.test(domain)) {
    return null;
  }

  if (parts.length === 1) {
    // Simple case: did:web:example.com
    return `https://${domain}/.well-known/did.json`;
  } else {
    // With path: did:web:example.com:path:to:did
    const path = parts.slice(1).join('/');
    // Validate path segments
    if (!/^[a-zA-Z0-9._/-]+$/.test(path)) {
      return null;
    }
    return `https://${domain}/${path}/did.json`;
  }
}

/**
 * Extract contact information from crawled credentials
 *
 * @param credentials - Array of crawled credentials
 * @returns Contact info object with available fields
 *
 * Extracts contact information from various credential types:
 * - ContactInfo credentials
 * - LPID (Legal Person ID) credentials
 * - Any credential with relevant contact attributes
 */
export function extractContactInfo(credentials: CrawledCredential[]): CrawledOrganization['contactInfo'] {
  const contactInfo: CrawledOrganization['contactInfo'] = {};

  for (const cred of credentials) {
    // Check for ContactInfo type credentials
    if (cred.type === 'ContactInfo' || cred.displayName === 'Contact Info') {
      Object.assign(contactInfo, cred.attributes);
    }

    // Check for LPID (Legal Person ID) credentials
    if (cred.type === 'LPID' || cred.displayName === 'LPID') {
      if (cred.attributes.legalName) contactInfo.legalName = cred.attributes.legalName as string;
      if (cred.attributes.kvkNumber) contactInfo.kvkNumber = cred.attributes.kvkNumber as string;
    }

    // Extract relevant attributes
    if (cred.attributes.legalName) contactInfo.legalName = cred.attributes.legalName as string;
    if (cred.attributes.url) contactInfo.url = cred.attributes.url as string;
    if (cred.attributes.email) contactInfo.email = cred.attributes.email as string;
    if (cred.attributes.telephone) contactInfo.telephone = cred.attributes.telephone as string;
    if (cred.attributes.logo) contactInfo.logo = cred.attributes.logo as string;
    if (cred.attributes.kvkNumber) contactInfo.kvkNumber = cred.attributes.kvkNumber as string;
    if (cred.attributes.location) contactInfo.location = cred.attributes.location as string;
  }

  return contactInfo;
}
