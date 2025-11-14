/**
 * ACDCParser - ACDC (Authentic Chained Data Container) credential parser
 *
 * Parses and validates vLEI credentials in ACDC format.
 * Performs STRUCTURE VALIDATION only - does NOT verify cryptographic signatures.
 *
 * Cryptographic verification is delegated to Python vLEI verifier service.
 *
 * Reference: Trust over IP ACDC specification
 * https://github.com/WebOfTrust/vLEI
 */

import type { VLEICredential } from '@/types/vlei';

export interface ParsedCredential {
  credential: VLEICredential;
  lei: string | null;
  subjectAid: string | null;
  issuerAid: string;
  issuanceDate: string | null;
  credentialSaid: string;
}

export interface ValidationError {
  field: string;
  message: string;
}

export class ACDCParser {
  /**
   * Parse credential input (JSON string or object)
   *
   * @param input - Credential as JSON string or VLEICredential object
   * @returns Parsed credential with extracted fields
   * @throws Error if credential structure is invalid
   */
  parse(input: string | VLEICredential): ParsedCredential {
    // Parse JSON string if needed
    const credential: VLEICredential = typeof input === 'string'
      ? JSON.parse(input)
      : input;

    // Validate required fields
    const errors = this.validateStructure(credential);
    if (errors.length > 0) {
      throw new Error(`Invalid ACDC credential: ${errors.map(e => e.message).join(', ')}`);
    }

    // Extract key fields
    return {
      credential,
      lei: this.extractLEI(credential),
      subjectAid: this.extractSubjectAid(credential),
      issuerAid: credential.i,
      issuanceDate: this.extractIssuanceDate(credential),
      credentialSaid: credential.d,
    };
  }

  /**
   * Validate ACDC credential structure
   *
   * Checks for required fields (v, d, i, ri, s, a, e, r)
   * Does NOT perform cryptographic validation
   *
   * @param credential - Credential to validate
   * @returns Array of validation errors (empty if valid)
   */
  validateStructure(credential: any): ValidationError[] {
    const errors: ValidationError[] = [];

    // Check top-level required fields
    if (!credential.v) {
      errors.push({ field: 'v', message: 'Missing version field' });
    }
    if (!credential.d) {
      errors.push({ field: 'd', message: 'Missing credential SAID (d)' });
    }
    if (!credential.i) {
      errors.push({ field: 'i', message: 'Missing issuer AID (i)' });
    }
    if (!credential.ri) {
      errors.push({ field: 'ri', message: 'Missing registry identifier (ri)' });
    }
    if (!credential.s) {
      errors.push({ field: 's', message: 'Missing schema SAID (s)' });
    }

    // Check attributes section
    if (!credential.a) {
      errors.push({ field: 'a', message: 'Missing attributes section (a)' });
    } else {
      if (!credential.a.d) {
        errors.push({ field: 'a.d', message: 'Missing attributes SAID (a.d)' });
      }
      if (!credential.a.i) {
        errors.push({ field: 'a.i', message: 'Missing subject AID (a.i)' });
      }
      if (!credential.a.dt) {
        errors.push({ field: 'a.dt', message: 'Missing issuance datetime (a.dt)' });
      }
      // Note: LEI is optional for some credential types (e.g., OOR)
    }

    // Check endorsements section
    if (!credential.e) {
      errors.push({ field: 'e', message: 'Missing endorsements section (e)' });
    } else {
      if (!credential.e.d) {
        errors.push({ field: 'e.d', message: 'Missing endorsements SAID (e.d)' });
      }
      if (!credential.e.qvi) {
        errors.push({ field: 'e.qvi', message: 'Missing QVI endorsement (e.qvi)' });
      }
    }

    // Check rules section
    if (!credential.r) {
      errors.push({ field: 'r', message: 'Missing rules section (r)' });
    } else {
      if (!credential.r.d) {
        errors.push({ field: 'r.d', message: 'Missing rules SAID (r.d)' });
      }
    }

    return errors;
  }

  /**
   * Validate SAID (Self-Addressing Identifier) format
   *
   * SAID format: CESR-encoded identifier (e.g., "E" + 43 base64 chars)
   * Note: This only validates FORMAT, not cryptographic integrity
   *
   * For demo purposes, we accept both:
   * - Strict CESR format: E + exactly 43 base64url chars
   * - Relaxed format: E + 20+ alphanumeric chars (for mock credentials)
   *
   * @param said - SAID to validate
   * @returns True if format is valid
   */
  validateSAIDFormat(said: string): boolean {
    // Strict CESR SAID pattern: starts with 'E', followed by 43 base64url chars
    const strictPattern = /^E[A-Za-z0-9_-]{43}$/;

    // Relaxed pattern for demo/mock credentials: E + at least 20 chars
    const relaxedPattern = /^E[A-Za-z0-9_-]{20,}$/;

    // Accept either strict or relaxed format
    return strictPattern.test(said) || relaxedPattern.test(said);
  }

  /**
   * Extract LEI from credential attributes
   *
   * @param credential - ACDC credential
   * @returns LEI string or null if not present
   */
  private extractLEI(credential: VLEICredential): string | null {
    return credential.a?.LEI || null;
  }

  /**
   * Extract subject AID from credential attributes
   *
   * @param credential - ACDC credential
   * @returns Subject AID or null
   */
  private extractSubjectAid(credential: VLEICredential): string | null {
    return credential.a?.i || null;
  }

  /**
   * Extract issuance date from credential attributes
   *
   * @param credential - ACDC credential
   * @returns ISO 8601 datetime string or null
   */
  private extractIssuanceDate(credential: VLEICredential): string | null {
    return credential.a?.dt || null;
  }

  /**
   * Validate all SAIDs in credential structure
   *
   * Checks format of: d, a.d, e.d, r.d
   * Note: Does NOT verify cryptographic integrity (delegated to Python verifier)
   *
   * @param credential - ACDC credential
   * @returns True if all SAID formats are valid
   */
  validateAllSAIDs(credential: VLEICredential): boolean {
    const saidsToCheck = [
      credential.d,
      credential.a?.d,
      credential.e?.d,
      credential.r?.d,
    ].filter(Boolean) as string[];

    return saidsToCheck.every(said => this.validateSAIDFormat(said));
  }

  /**
   * Extract jurisdiction from credential (if present in attributes)
   *
   * Note: Not all credentials contain jurisdiction in attributes
   * For Legal Entity credentials, jurisdiction may be in legalJurisdiction field
   *
   * @param credential - ACDC credential
   * @returns Jurisdiction code or null
   */
  extractJurisdiction(credential: VLEICredential): string | null {
    const attrs = credential.a as any;

    // Try legalJurisdiction field (for LE credentials)
    if (attrs?.legalJurisdiction) {
      return attrs.legalJurisdiction;
    }

    // Try registeredAddress.country (alternative format)
    if (attrs?.registeredAddress?.country) {
      return attrs.registeredAddress.country;
    }

    return null;
  }
}
