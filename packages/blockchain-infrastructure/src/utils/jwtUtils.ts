/**
 * JWT Utilities for Verifiable Credentials
 * Decodes and extracts attributes from VCs in W3C and SD-JWT formats
 */

import { decodeJwt } from 'jose';

export interface VerifiableCredential {
  '@context'?: string[];
  id?: string;
  type?: string[];
  issuer?: string;
  issued?: string;
  issuanceDate?: string;
  expirationDate?: string;
  credentialSubject?: Record<string, unknown>;
  credentialSchema?: {
    id?: string;
    type?: string;
  };
  // SD-JWT fields
  vct?: string;
  iat?: number;
  nbf?: number;
  exp?: number;
  iss?: string;
  sub?: string;
  [key: string]: unknown;
}

export interface VerifiablePresentation {
  '@context'?: string[];
  type?: string[];
  id?: string;
  holder?: string;
  verifiableCredential?: (string | VerifiableCredential)[];
}

export interface JWTPayload {
  iss?: string;
  sub?: string;
  aud?: string;
  exp?: number;
  nbf?: number;
  iat?: number;
  jti?: string;
  nonce?: string;
  vp?: VerifiablePresentation;
  vc?: VerifiableCredential;
  [key: string]: unknown;
}

/**
 * Decode a JWT without verification (for extracting public data)
 */
export function decodeJWT(jwt: string): JWTPayload | null {
  try {
    return decodeJwt(jwt) as JWTPayload;
  } catch (error) {
    console.error('Error decoding JWT:', error);
    return null;
  }
}

/**
 * Extract credential attributes for display from W3C VC or SD-JWT
 */
export function extractCredentialAttributes(credential: VerifiableCredential): Record<string, unknown> {
  const attributes: Record<string, unknown> = {};

  // Handle W3C VC format
  if (credential.credentialSubject) {
    Object.keys(credential.credentialSubject).forEach(key => {
      if (key !== 'id') {
        attributes[key] = credential.credentialSubject![key];
      }
    });
  }
  // Handle SD-JWT format - extract all fields except metadata
  else if (credential.vct) {
    const skipFields = ['vct', 'id', 'iat', 'nbf', 'exp', 'iss', 'sub', '_sd', '_sd_alg', 'cnf'];
    Object.keys(credential).forEach(key => {
      if (!skipFields.includes(key)) {
        // Map LPID fields to standard names for consistency
        if (credential.vct === 'LPID') {
          if (key === 'legal_person_name') {
            attributes['legalName'] = credential[key];
          } else if (key === 'legal_person_id') {
            attributes['kvkNumber'] = credential[key];
          } else {
            attributes[key] = credential[key];
          }
        } else {
          attributes[key] = credential[key];
        }
      }
    });
  }

  return attributes;
}

/**
 * Get credential type display name from W3C VC or SD-JWT
 */
export function getCredentialType(credential: VerifiableCredential): string {
  // Handle SD-JWT format (has vct field)
  if (credential.vct) {
    return credential.vct;
  }

  // Handle W3C VC format (has type array)
  if (!credential.type || !Array.isArray(credential.type)) {
    return 'Unknown';
  }

  // Filter out generic types
  const specificTypes = credential.type.filter(t =>
    t !== 'VerifiableCredential' &&
    t !== 'VerifiableAttestation'
  );

  return specificTypes[0] || 'Credential';
}
