/**
 * JWTVerificationService - Leaf Service
 *
 * Dependencies: did-jwt-vc, did-jwt, did-resolver, @sd-jwt/core
 *
 * Responsibilities:
 * - Verify JWT credentials and presentations
 * - Verify SD-JWT credentials with selective disclosure
 * - Extract and verify credentials from presentations
 * - Handle expiration checks
 *
 * Extracted from VerificationService to maintain <300 line limit per service.
 */

import { verifyCredential } from 'did-jwt-vc';
import { verifyJWT } from 'did-jwt';
import type { Resolver } from 'did-resolver';
import { SDJwt } from '@sd-jwt/core';
import { createSDJWTHasher } from '../utils/sdJwtHasher';

export type CredentialStatus = 'VERIFIED' | 'UNVERIFIED' | 'INVALID' | 'EXPIRED';

export interface VerificationResult {
  verified: boolean;
  status: CredentialStatus;
  did?: string;
  publicKey?: string;
  error?: string;
  payload?: unknown;
  issuer?: string;
  expirationDate?: string;
}

// TypeScript interfaces for SD-JWT claims
export interface SDJWTClaims {
  iss?: string;
  sub?: string;
  aud?: string | string[];
  exp?: number;
  nbf?: number;
  iat?: number;
  jti?: string;
  vct?: string;
  [key: string]: unknown;
}

export class JWTVerificationService {
  private resolver: Resolver;

  constructor(resolver: Resolver) {
    this.resolver = resolver;
  }

  /**
   * Check if a JWT is an SD-JWT (has ~ delimiter for disclosures)
   */
  private isSDJWT(jwt: string): boolean {
    return jwt.includes('~');
  }

  /** Verify SD-JWT credential */
  async verifySDJWT(sdJWTString: string): Promise<VerificationResult> {
    try {
      const hasher = createSDJWTHasher();
      const sdJwt = await SDJwt.fromEncode(sdJWTString, hasher);
      if (!sdJwt.jwt) throw new Error('No JWT found in SD-JWT');

      const jwtString = sdJwt.jwt.encodeJwt();
      const claims = await sdJwt.getClaims<SDJWTClaims>(hasher);
      const issuer = claims.iss;

      if (issuer && issuer.startsWith('did:')) {
        try {
          const verificationResult = await verifyJWT(jwtString, { resolver: this.resolver });
          const exp = claims.exp;
          if (exp && exp * 1000 < Date.now()) {
            return {
              verified: false,
              status: 'EXPIRED',
              did: issuer,
              error: 'Credential has expired',
              payload: claims,
              issuer: issuer,
              expirationDate: new Date(exp * 1000).toISOString()
            };
          }
          return {
            verified: true,
            status: 'VERIFIED',
            did: issuer,
            payload: claims,
            issuer: verificationResult.issuer,
            expirationDate: exp ? new Date(exp * 1000).toISOString() : undefined
          };
        } catch (verifyError: unknown) {
          return {
            verified: false,
            status: 'INVALID',
            did: issuer,
            error: verifyError instanceof Error ? verifyError.message : 'Signature verification failed',
            payload: claims,
            issuer: issuer
          };
        }
      }
      return {
        verified: false,
        status: 'UNVERIFIED',
        error: 'No DID issuer found for signature verification',
        payload: claims,
        issuer: issuer
      };
    } catch (error: unknown) {
      return {
        verified: false,
        status: 'INVALID',
        error: error instanceof Error ? error.message : 'SD-JWT processing failed'
      };
    }
  }

  /** Verify Verifiable Credential JWT (regular or SD-JWT) */
  async verifyCredentialJWT(vcJWT: string): Promise<VerificationResult> {
    if (this.isSDJWT(vcJWT)) return this.verifySDJWT(vcJWT);

    try {
      const verifiedVC = await verifyCredential(vcJWT, this.resolver);
      if (verifiedVC.payload?.exp && verifiedVC.payload.exp * 1000 < Date.now()) {
        return {
          verified: false,
          status: 'EXPIRED',
          error: 'Credential has expired',
          payload: verifiedVC.payload,
          issuer: verifiedVC.issuer,
          expirationDate: new Date(verifiedVC.payload.exp * 1000).toISOString()
        };
      }
      if (verifiedVC.verifiableCredential?.expirationDate) {
        const expDate = new Date(verifiedVC.verifiableCredential.expirationDate);
        if (expDate < new Date()) {
          return {
            verified: false,
            status: 'EXPIRED',
            error: 'Credential has expired',
            payload: verifiedVC.payload,
            issuer: verifiedVC.issuer,
            expirationDate: verifiedVC.verifiableCredential.expirationDate
          };
        }
      }
      return {
        verified: true,
        status: 'VERIFIED',
        payload: verifiedVC.payload,
        issuer: verifiedVC.issuer,
        expirationDate: verifiedVC.payload?.exp ? new Date(verifiedVC.payload.exp * 1000).toISOString() :
                        verifiedVC.verifiableCredential?.expirationDate
      };
    } catch (error: unknown) {
      return {
        verified: false,
        status: 'INVALID',
        error: error instanceof Error ? error.message : 'Verification failed'
      };
    }
  }

  /** Verify Verifiable Presentation JWT */
  async verifyPresentationJWT(vpJWT: string): Promise<VerificationResult> {
    try {
      const verifiedJWT = await verifyJWT(vpJWT, { resolver: this.resolver });
      if (verifiedJWT.payload?.exp && verifiedJWT.payload.exp * 1000 < Date.now()) {
        return {
          verified: false,
          status: 'EXPIRED',
          error: 'Presentation has expired',
          payload: verifiedJWT.payload,
          issuer: verifiedJWT.issuer,
          expirationDate: new Date(verifiedJWT.payload.exp * 1000).toISOString()
        };
      }
      return {
        verified: true,
        status: 'VERIFIED',
        payload: verifiedJWT.payload,
        issuer: verifiedJWT.issuer,
        expirationDate: verifiedJWT.payload?.exp ? new Date(verifiedJWT.payload.exp * 1000).toISOString() : undefined
      };
    } catch (error: unknown) {
      return {
        verified: false,
        status: 'INVALID',
        error: error instanceof Error ? error.message : 'Verification failed'
      };
    }
  }

  /** Extract and verify credentials from Verifiable Presentation */
  async verifyCredentialsInPresentation(vpJWT: string): Promise<{
    presentationVerified: boolean;
    credentials: Array<{
      credential: unknown;
      status: CredentialStatus;
      error?: string;
      issuer?: string;
    }>;
  }> {
    const results: Array<{
      credential: unknown;
      status: CredentialStatus;
      error?: string;
      issuer?: string;
    }> = [];
    const vpResult = await this.verifyPresentationJWT(vpJWT);
    const vp = (vpResult.payload as { vp?: { verifiableCredential?: unknown[] } })?.vp;
    if (vp?.verifiableCredential && Array.isArray(vp.verifiableCredential)) {
      for (const vc of vp.verifiableCredential) {
        if (typeof vc === 'string') {
          const vcResult = await this.verifyCredentialJWT(vc);
          results.push({
            credential: (vcResult.payload as { vc?: unknown })?.vc || vcResult.payload,
            status: vcResult.status,
            error: vcResult.error,
            issuer: vcResult.issuer
          });
        } else {
          let status: CredentialStatus = 'UNVERIFIED';
          let error: string | undefined = 'Plain JSON credential - cannot verify signature';
          const vcObj = vc as { expirationDate?: string };
          if (vcObj.expirationDate && new Date(vcObj.expirationDate) < new Date()) {
            status = 'EXPIRED';
            error = 'Credential has expired';
          }
          results.push({ credential: vc, status, error });
        }
      }
    }
    return { presentationVerified: vpResult.verified, credentials: results };
  }
}
