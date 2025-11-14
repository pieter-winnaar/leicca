/**
 * VLEIVerificationService - vLEI credential verification service
 *
 * Verifies vLEI credentials using structure validation.
 * Python vLEI verifier integration will be added after credential resolution.
 *
 * Current implementation: Structure validation only (no cryptographic verification)
 * Future implementation: Full cryptographic verification via Python vLEI verifier
 *
 * Dependencies:
 * - ACDCParser: Parses and validates ACDC credential structure
 * - GLEIFAPIClient: Enriches credentials with jurisdiction data
 */

import type { VLEICredential, VerificationResult, VerificationResultUI, VerificationMethod } from '@/types/vlei';
import { ACDCParser } from './ACDCParser';
import { GLEIFAPIClient } from './GLEIFAPIClient';
import { PythonVerifierClient } from './PythonVerifierClient';

export interface VerifyOptions {
  resolveJurisdiction?: boolean;  // Fetch jurisdiction from GLEIF API
}

export class VLEIVerificationService {
  private parser: ACDCParser;
  private gleifAPI: GLEIFAPIClient;
  private pythonVerifier: PythonVerifierClient;

  constructor(
    parser: ACDCParser,
    gleifAPI: GLEIFAPIClient,
    pythonVerifier?: PythonVerifierClient
  ) {
    this.parser = parser;
    this.gleifAPI = gleifAPI;
    this.pythonVerifier = pythonVerifier || new PythonVerifierClient();
  }

  /**
   * Verify vLEI credential
   *
   * Performs full verification workflow: structure validation, Python verifier call,
   * GLEIF API enrichment, and returns UI-formatted result.
   *
   * @param credential - Credential as JSON string or VLEICredential object
   * @param options - Verification options
   * @returns UI-formatted verification result
   */
  async verify(
    credential: string | VLEICredential,
    options?: VerifyOptions
  ): Promise<VerificationResultUI> {
    try {
      // Detect CESR format BEFORE parsing
      // CESR format: JSON credential followed by CESR attachment (starts with }-IAB or }-[A-Z]{3})
      const isCESRFormat = typeof credential === 'string' &&
        /\}-[A-Z0-9]{3}/.test(credential);

      // CESR format requires Python verifier - can't parse as JSON
      if (isCESRFormat) {
        // Try Python verifier with CESR
        let verifierResult = null;
        try {
          // Extract ACDC credential SAID from CESR stream
          // CESR contains multiple credentials (QVI, LE, ECR AUTH, ECR)
          // We need the LAST ECR credential (the one being verified)

          // Find ALL ACDC credentials in the stream
          const acdcPattern = /\{"v":"ACDC10JSON[^"]*","d":"([^"]+)"/g;
          const matches = Array.from(credential.matchAll(acdcPattern));

          if (matches.length === 0) {
            return {
              verified: false,
              status: 'invalid',
              credential: {
                lei: 'Unknown',
                legalName: 'Unknown Entity',
                jurisdiction: 'Unknown',
                issuedDate: 'Unknown',
                expiresDate: 'N/A (Revocation-based)',
                said: 'Could not extract',
              },
              verification: {
                saidValidation: false,
                qviChain: false,
                registryCheck: false,
                timestamp: new Date().toISOString(),
              },
              errors: ['Could not extract credential SAID from CESR stream'],
            };
          }

          // Take the LAST ACDC credential (the ECR being verified)
          const said = matches[matches.length - 1][1];

          if (!said) {
            return {
              verified: false,
              status: 'invalid',
              credential: {
                lei: 'Unknown',
                legalName: 'Unknown Entity',
                jurisdiction: 'Unknown',
                issuedDate: 'Unknown',
                expiresDate: 'N/A (Revocation-based)',
                said: 'Could not extract',
              },
              verification: {
                saidValidation: false,
                qviChain: false,
                registryCheck: false,
                timestamp: new Date().toISOString(),
              },
              errors: ['Could not extract credential SAID from CESR stream'],
            };
          }

          // Extract the full JSON of the last ACDC credential
          let credentialDetails: VLEICredential | null = null;
          try {
            // Find the ACDC block that contains our target SAID
            // Search for pattern: {"v":"ACDC10JSON...","d":"<our-said>"
            const escapedSaid = said.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
            const acdcStartPattern = new RegExp(`\\{"v":"ACDC10JSON[^"]*","d":"${escapedSaid}"`, 'g');
            const acdcStartMatch = acdcStartPattern.exec(credential);

            if (acdcStartMatch) {
              const jsonStart = acdcStartMatch.index;
              let depth = 0;
              let jsonEnd = jsonStart;

              // Parse the complete JSON object by tracking braces
              for (let i = jsonStart; i < credential.length; i++) {
                if (credential[i] === '{') depth++;
                if (credential[i] === '}') {
                  depth--;
                  if (depth === 0) {
                    jsonEnd = i + 1;
                    break;
                  }
                }
              }

              const credentialJson = credential.substring(jsonStart, jsonEnd);
              credentialDetails = JSON.parse(credentialJson);
            }
          } catch (e) {
            console.warn('Could not parse ACDC credential from CESR stream:', e);
          }

          // Resolve schema OOBI before verification
          if (credentialDetails?.s) {
            console.log(`Resolving schema OOBI: ${credentialDetails.s}`);
            await this.pythonVerifier.resolveSchemaOobi(credentialDetails.s);
          }

          verifierResult = await this.pythonVerifier.verifyCredential(
            credential as string,
            said
          );

          // If verification succeeded, extract credential details and return
          if (verifierResult.verified) {
            // Extract LEI and other details from parsed credential
            const lei = credentialDetails?.a?.LEI || 'Unknown';
            const personLegalName = (credentialDetails?.a as any)?.personLegalName;
            const engagementContextRole = (credentialDetails?.a as any)?.engagementContextRole;
            const issuedDate = credentialDetails?.a?.dt || 'Unknown';

            // Fetch GLEIF data if we have an LEI
            let legalName = personLegalName || 'Unknown Entity';
            let jurisdiction = 'Unknown';

            if (lei !== 'Unknown' && options?.resolveJurisdiction) {
              try {
                const gleifData = await this.gleifAPI.getLEIRecord(lei);
                if (gleifData) {
                  // Use organization name from GLEIF, fall back to person name
                  legalName = gleifData.legalName || personLegalName || legalName;
                  jurisdiction = gleifData.jurisdiction || jurisdiction;
                }
              } catch (e) {
                console.warn('Could not fetch GLEIF data:', e);
              }
            }

            // Extract issuer AID from credential details
            const issuerAID = credentialDetails?.i;

            // Extract KEL state from CESR stream if we have an issuer AID
            let kelState = null;
            if (issuerAID && typeof credential === 'string') {
              kelState = this.extractKELState(credential, issuerAID);

              if (kelState) {
                console.log(`✓ Captured KEL state for ${issuerAID}:`, {
                  sequence: kelState.sequenceNumber,
                  said: kelState.lastEventSaid.substring(0, 20) + '...'
                });
              } else {
                console.warn(`⚠️ Could not extract KEL state for ${issuerAID}`);
              }
            }

            return {
              verified: true,
              status: 'verified',
              credential: {
                lei,
                legalName,
                jurisdiction,
                issuedDate,
                expiresDate: 'N/A (Revocation-based)',
                said,
                personLegalName: personLegalName || undefined,
                engagementContextRole: engagementContextRole || undefined,
              },
              verification: {
                saidValidation: verifierResult.saidValid,
                qviChain: verifierResult.qviChainValid,
                registryCheck: verifierResult.registryChecked,
                timestamp: new Date().toISOString(),
              },
              errors: [],
              kelState: kelState || undefined,
            };
          } else {
            // Verification failed, but still extract and show credential details
            const lei = credentialDetails?.a?.LEI || 'Unknown';
            const personLegalName = (credentialDetails?.a as any)?.personLegalName;
            const engagementContextRole = (credentialDetails?.a as any)?.engagementContextRole;
            const issuedDate = credentialDetails?.a?.dt || 'Unknown';

            // Fetch GLEIF data if we have an LEI
            let legalName = personLegalName || 'Unknown Entity';
            let jurisdiction = 'Unknown';

            if (lei !== 'Unknown' && options?.resolveJurisdiction) {
              try {
                const gleifData = await this.gleifAPI.getLEIRecord(lei);
                if (gleifData) {
                  legalName = gleifData.legalName || personLegalName || legalName;
                  jurisdiction = gleifData.jurisdiction || jurisdiction;
                }
              } catch (e) {
                console.warn('Could not fetch GLEIF data:', e);
              }
            }

            // Extract issuer AID from credential details
            const issuerAID = credentialDetails?.i;

            // Extract KEL state from CESR stream if we have an issuer AID
            let kelState = null;
            if (issuerAID && typeof credential === 'string') {
              kelState = this.extractKELState(credential, issuerAID);

              if (kelState) {
                console.log(`✓ Captured KEL state for ${issuerAID} (verification failed):`, {
                  sequence: kelState.sequenceNumber,
                  said: kelState.lastEventSaid.substring(0, 20) + '...'
                });
              }
            }

            return {
              verified: false,
              status: 'invalid',
              credential: {
                lei,
                legalName,
                jurisdiction,
                issuedDate,
                expiresDate: 'N/A (Revocation-based)',
                said,
                personLegalName: personLegalName || undefined,
                engagementContextRole: engagementContextRole || undefined,
              },
              verification: {
                saidValidation: verifierResult.saidValid,
                qviChain: verifierResult.qviChainValid,
                registryCheck: verifierResult.registryChecked,
                timestamp: new Date().toISOString(),
              },
              errors: verifierResult.errors,
              kelState: kelState || undefined,
            };
          }
        } catch (error) {
          // Try to extract credential details even on error
          let credentialData = null;
          try {
            const acdcPattern = /\{"v":"ACDC10JSON[^"]*","d":"([^"]+)"/g;
            const matches = Array.from((credential as string).matchAll(acdcPattern));

            if (matches.length > 0) {
              const said = matches[matches.length - 1][1];
              const escapedSaid = said.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
              const acdcStartPattern = new RegExp(`\\{"v":"ACDC10JSON[^"]*","d":"${escapedSaid}"`, 'g');
              const acdcStartMatch = acdcStartPattern.exec(credential as string);

              if (acdcStartMatch) {
                const jsonStart = acdcStartMatch.index;
                let depth = 0;
                let jsonEnd = jsonStart;

                for (let i = jsonStart; i < (credential as string).length; i++) {
                  if ((credential as string)[i] === '{') depth++;
                  if ((credential as string)[i] === '}') {
                    depth--;
                    if (depth === 0) {
                      jsonEnd = i + 1;
                      break;
                    }
                  }
                }

                const credentialJson = (credential as string).substring(jsonStart, jsonEnd);
                const parsedCred = JSON.parse(credentialJson);

                credentialData = {
                  lei: parsedCred?.a?.LEI || 'Unknown',
                  legalName: (parsedCred?.a as any)?.personLegalName || 'Unknown Entity',
                  jurisdiction: 'Unknown',
                  issuedDate: parsedCred?.a?.dt || 'Unknown',
                  expiresDate: 'N/A (Revocation-based)',
                  said: parsedCred?.d || said,
                };
              }
            }
          } catch (e) {
            console.warn('Could not extract credential data from failed CESR:', e);
          }

          return {
            verified: false,
            status: 'invalid',
            credential: credentialData,
            verification: credentialData ? {
              saidValidation: false,
              qviChain: false,
              registryCheck: false,
              timestamp: new Date().toISOString(),
            } : null,
            errors: [
              'CESR format detected but Python verifier failed',
              error instanceof Error ? error.message : 'Unknown error',
            ],
          };
        }
      }

      // JSON format - parse and validate structure
      const parsed = this.parser.parse(credential);

      // Validate SAID formats
      const saidsValid = this.parser.validateAllSAIDs(parsed.credential);
      if (!saidsValid) {
        // Extract credential details even though SAID validation failed
        const cred = parsed.credential;
        const lei = cred.a?.LEI || 'Unknown LEI';
        const issuedDate = cred.a?.dt || 'Unknown';
        const said = cred.d;

        // Try to fetch GLEIF data
        let legalName = 'Unknown Entity';
        let jurisdiction = 'Unknown';
        if (options?.resolveJurisdiction && lei !== 'Unknown LEI') {
          try {
            const gleifData = await this.gleifAPI.getLEIRecord(lei);
            if (gleifData) {
              legalName = gleifData.legalName || legalName;
              jurisdiction = gleifData.jurisdiction || jurisdiction;
            }
          } catch (e) {
            console.warn('Could not fetch GLEIF data:', e);
          }
        }

        return {
          verified: false,
          status: 'invalid',
          credential: {
            lei,
            legalName,
            jurisdiction,
            issuedDate,
            expiresDate: 'N/A (Revocation-based)',
            said,
          },
          verification: {
            saidValidation: false,
            qviChain: false,
            registryCheck: false,
            timestamp: new Date().toISOString(),
          },
          errors: ['Invalid SAID format - credential may be tampered'],
        };
      }

      // JSON credentials - try verifier if available, but continue without it
      let verifierResult = null;
      try {
        verifierResult = await this.pythonVerifier.verifyCredential(
          credential as string,
          parsed.credential.d
        );
      } catch (error) {
        // Verifier failed or unreachable - continue with structure validation only
        console.warn('Python verifier unavailable:', error);
      }

      // Fetch GLEIF data for legalName and jurisdiction
      let gleifData: { legalName?: string; jurisdiction?: string } | undefined;
      if (options?.resolveJurisdiction && parsed.lei) {
        const leiData = await this.gleifAPI.getLEIRecord(parsed.lei);
        if (leiData) {
          gleifData = {
            legalName: leiData.legalName,
            jurisdiction: leiData.jurisdiction,
          };
        }
      }

      // Build UI-formatted result
      const cred = parsed.credential;
      const lei = cred.a?.LEI || 'Unknown LEI';
      const issuedDate = cred.a?.dt || 'Unknown';
      const said = cred.d;
      const legalName = gleifData?.legalName || 'Unknown Entity';
      const jurisdiction = gleifData?.jurisdiction || 'Unknown';
      const expiresDate = 'N/A (Revocation-based)';

      // Use verifier results if available, otherwise all false
      const saidValidation = verifierResult?.saidValid || false;
      const qviChain = verifierResult?.qviChainValid || false;
      const registryCheck = verifierResult?.registryChecked || false;
      const verified = verifierResult?.verified || false;
      const status: 'verified' | 'invalid' | 'revoked' = verified ? 'verified' : 'invalid';

      return {
        verified,
        status,
        credential: {
          lei,
          legalName,
          jurisdiction,
          issuedDate,
          expiresDate,
          said,
        },
        verification: {
          saidValidation,
          qviChain,
          registryCheck,
          timestamp: new Date().toISOString(),
        },
        errors: verifierResult?.errors || [],
      };
    } catch (error) {
      // Try to extract credential data even on catastrophic failure
      let credentialData = null;
      try {
        // Try to parse as JSON first
        let parsedCred = null;
        if (typeof credential === 'string') {
          try {
            parsedCred = JSON.parse(credential);
          } catch {
            // Not JSON, try CESR extraction
            const acdcPattern = /\{"v":"ACDC10JSON[^"]*","d":"([^"]+)"/g;
            const matches = Array.from(credential.matchAll(acdcPattern));

            if (matches.length > 0) {
              const said = matches[matches.length - 1][1];
              const escapedSaid = said.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
              const acdcStartPattern = new RegExp(`\\{"v":"ACDC10JSON[^"]*","d":"${escapedSaid}"`, 'g');
              const acdcStartMatch = acdcStartPattern.exec(credential);

              if (acdcStartMatch) {
                const jsonStart = acdcStartMatch.index;
                let depth = 0;
                let jsonEnd = jsonStart;

                for (let i = jsonStart; i < credential.length; i++) {
                  if (credential[i] === '{') depth++;
                  if (credential[i] === '}') {
                    depth--;
                    if (depth === 0) {
                      jsonEnd = i + 1;
                      break;
                    }
                  }
                }

                const credentialJson = credential.substring(jsonStart, jsonEnd);
                parsedCred = JSON.parse(credentialJson);
              }
            }
          }
        } else {
          parsedCred = credential;
        }

        if (parsedCred) {
          credentialData = {
            lei: parsedCred?.a?.LEI || 'Unknown',
            legalName: (parsedCred?.a as any)?.personLegalName || 'Unknown Entity',
            jurisdiction: 'Unknown',
            issuedDate: parsedCred?.a?.dt || 'Unknown',
            expiresDate: 'N/A (Revocation-based)',
            said: parsedCred?.d || 'Unknown',
          };
        }
      } catch (e) {
        console.warn('Could not extract credential data from failed credential:', e);
      }

      return {
        verified: false,
        status: 'invalid',
        credential: credentialData,
        verification: credentialData ? {
          saidValidation: false,
          qviChain: false,
          registryCheck: false,
          timestamp: new Date().toISOString(),
        } : null,
        errors: [error instanceof Error ? error.message : 'Unknown verification error'],
      };
    }
  }

  /**
   * Extract KEL state from CESR credential stream
   *
   * Parses KEL events for a specific issuer AID and finds the latest sequence number
   * Uses JSON parsing for robustness (field order varies)
   *
   * @param credentialCESR - Complete CESR stream containing KEL events
   * @param issuerAID - Issuer's AID to filter events for
   * @returns KEL state with sequence number and last event SAID
   */
  private extractKELState(
    credentialCESR: string,
    issuerAID: string
  ): import('@/types/vlei').KELState | null {
    try {
      // Find all KEL events (identified by "t":"icp" or "t":"ixn")
      const kelEvents: Array<{
        v: string;
        t: string;
        d: string;
        i: string;
        s: string;
      }> = [];

      // Find start positions of all JSON objects starting with {"v":"KERI10JSON
      let startPos = 0;
      while (true) {
        const kelStart = credentialCESR.indexOf('{"v":"KERI10JSON', startPos);
        if (kelStart === -1) break;

        // Extract complete JSON object by tracking braces
        let depth = 0;
        let endPos = kelStart;
        for (let i = kelStart; i < credentialCESR.length; i++) {
          if (credentialCESR[i] === '{') depth++;
          if (credentialCESR[i] === '}') {
            depth--;
            if (depth === 0) {
              endPos = i + 1;
              break;
            }
          }
        }

        const jsonStr = credentialCESR.substring(kelStart, endPos);

        try {
          const parsed = JSON.parse(jsonStr);

          // Check if this is a KEL event (has "t" field with "icp" or "ixn")
          if (parsed.t === 'icp' || parsed.t === 'ixn') {
            // Filter for this issuer's events
            if (parsed.i === issuerAID) {
              kelEvents.push(parsed);
            }
          }
        } catch (e) {
          // Not a valid JSON object, skip
        }

        startPos = endPos;
      }

      if (kelEvents.length === 0) {
        console.warn(`No KEL events found for issuer AID: ${issuerAID}`);
        return null;
      }

      // Find highest sequence number (latest event)
      let maxSequence = -1;
      let lastEventSaid = '';

      for (const event of kelEvents) {
        const sequence = parseInt(event.s, 16); // KEL sequence numbers are hex strings
        if (sequence > maxSequence) {
          maxSequence = sequence;
          lastEventSaid = event.d;
        }
      }

      return {
        issuerDid: issuerAID,
        sequenceNumber: maxSequence,
        lastEventSaid: lastEventSaid,
        capturedAt: new Date().toISOString()
      };

    } catch (error) {
      console.error('Failed to extract KEL state:', error);
      return null;
    }
  }

}
