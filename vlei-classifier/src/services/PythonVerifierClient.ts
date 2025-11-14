/**
 * PythonVerifierClient - Python vLEI verifier integration
 *
 * Calls the Python vLEI verifier service running at localhost:7676
 * Uses CESR format (not JSON) for credential verification
 */

export interface PythonVerifierResult {
  verified: boolean;
  saidValid: boolean;
  qviChainValid: boolean;
  registryChecked: boolean;
  errors: string[];
}

export class PythonVerifierClient {
  private baseURL: string;
  private keriaAgentUrl: string;

  constructor(
    baseURL: string = 'http://localhost:7676',
    keriaAgentUrl: string = 'http://localhost:3902'
  ) {
    this.baseURL = baseURL;
    this.keriaAgentUrl = keriaAgentUrl;
  }

  /**
   * Extract issuer AID from credential CESR
   *
   * @param credentialCESR - Credential content (JSON or CESR)
   * @returns Issuer AID or null if not found
   */
  private extractIssuerAid(credentialCESR: string): string | null {
    // Look for issuer AID pattern: "i":"E..." (44-character CESR identifier starting with E)
    const issuerMatch = credentialCESR.match(/"i"\s*:\s*"(E[A-Z0-9_-]{43})"/);

    if (issuerMatch && issuerMatch[1]) {
      return issuerMatch[1];
    }

    return null;
  }

  /**
   * Detect SAID mismatch between URL parameter and credential content
   *
   * @param credentialCESR - Credential content
   * @param urlSaid - SAID from URL parameter
   * @returns Error message if mismatch detected, null otherwise
   */
  private detectSAIDMismatch(credentialCESR: string, urlSaid: string): string | null {
    // Try to extract SAID from credential content
    // Look for common SAID patterns in CESR or JSON
    const saidMatches = credentialCESR.match(/"d"\s*:\s*"([A-Z0-9_-]{44})"/);

    if (saidMatches && saidMatches[1]) {
      const credentialSaid = saidMatches[1];
      if (credentialSaid !== urlSaid) {
        return `SAID Mismatch: URL contains '${urlSaid}' but credential contains '${credentialSaid}'`;
      }
    }

    return null;
  }

  /**
   * Parse cryptographic verification errors into detailed messages
   *
   * @param errorMsg - Error message from verifier
   * @param saidMismatchError - Pre-detected SAID mismatch error
   * @returns Array of detailed error messages
   */
  private parseCryptographicError(errorMsg: string, saidMismatchError: string | null): string[] {
    const errors: string[] = [];

    // If we detected a SAID mismatch, that's likely the root cause
    if (saidMismatchError) {
      errors.push(`❌ ${saidMismatchError}`);
      errors.push('💡 The credential\'s self-addressing identifier (SAID) doesn\'t match the expected value. This usually means the credential data has been tampered with.');
    } else if (errorMsg.includes('did not cryptographically verify')) {
      // Generic cryptographic failure - provide helpful context
      errors.push('❌ Cryptographic Verification Failed: The credential signature or SAID could not be verified');
      errors.push('💡 This could mean:');
      errors.push('   • The credential data was modified after signing');
      errors.push('   • The credential is missing required cryptographic attachments (KEL/TEL)');
      errors.push('   • The signature is invalid or from an unknown issuer');
    } else if (errorMsg.includes('invalid content type')) {
      errors.push('❌ Invalid Format: Expected CESR format, not plain JSON');
      errors.push('💡 Use a .cesr file with complete cryptographic attachments');
    } else {
      errors.push(`❌ ${errorMsg}`);
    }

    return errors;
  }

  /**
   * Parse authorization error messages into detailed, user-friendly errors
   *
   * Example input: "identifier EB1... presented credentials EDBs..., w/ status Credential unauthorized, info: ECR chain validation failed, ECR_AUTH chain validation failed, LE chain validation failed, The QVI AID must be delegated"
   *
   * @param errorMsg - Raw error message from verifier
   * @returns Array of specific error messages
   */
  private parseAuthorizationError(errorMsg: string): string[] {
    const errors: string[] = [];

    // Extract the "info:" section which contains detailed validation failures
    const infoMatch = errorMsg.match(/info:\s*(.+?)$/);
    if (infoMatch) {
      const infoText = infoMatch[1];

      // Split by common separators and extract individual failures
      const failures = infoText.split(/,\s*/).filter(f => f.trim());

      for (const failure of failures) {
        // Map technical errors to user-friendly messages
        if (failure.includes('QVI AID must be delegated')) {
          errors.push('⚠️ QVI Chain: The QVI (Qualified vLEI Issuer) is not properly delegated from the Root of Trust');
        } else if (failure.includes('ECR chain validation failed')) {
          errors.push('❌ ECR Credential: Engagement Context Role credential chain validation failed');
        } else if (failure.includes('ECR_AUTH chain validation failed')) {
          errors.push('❌ ECR Authorization: Role authorization credential chain validation failed');
        } else if (failure.includes('LE chain validation failed')) {
          errors.push('❌ Legal Entity: Legal Entity credential chain validation failed');
        } else if (failure.includes('LEI') && failure.includes('not allowed')) {
          errors.push(`❌ LEI Not Allowed: ${failure}`);
        } else if (failure.includes('unknown issuer')) {
          errors.push(`❌ Unknown Issuer: ${failure}`);
        } else {
          // Include any other specific errors as-is
          errors.push(`⚠️ ${failure}`);
        }
      }
    }

    // If no specific errors were extracted, return the full message
    if (errors.length === 0) {
      errors.push(errorMsg);
    }

    return errors;
  }

  /**
   * Resolve schema OOBI to enable verifier to cache the schema
   *
   * @param schemaSaid - Schema SAID (e.g., "EEy9PkikFcANV1l...")
   * @returns true if OOBI resolution succeeded, false otherwise
   */
  async resolveSchemaOobi(schemaSaid: string): Promise<boolean> {
    try {
      // vlei-server runs at vlei-server:7723 from the verifier's perspective
      const oobiUrl = `http://vlei-server:7723/oobi/${schemaSaid}`;

      const controller = new AbortController();
      const timeoutId = setTimeout(() => controller.abort(), 10000);

      const response = await fetch(`${this.baseURL}/oobi`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ oobi: oobiUrl }),
        signal: controller.signal,
      });

      clearTimeout(timeoutId);

      if (!response.ok) {
        console.warn(`Schema OOBI resolution failed for ${schemaSaid}: ${response.status} ${response.statusText}`);
        return false;
      }

      // Wait for verifier to fetch schema
      await new Promise(resolve => setTimeout(resolve, 1000));

      console.log(`✅ Schema OOBI resolved: ${schemaSaid.substring(0, 20)}...`);
      return true;
    } catch (error) {
      console.warn(`Schema OOBI resolution error for ${schemaSaid}:`, error);
      return false;
    }
  }

  /**
   * Resolve issuer OOBI to enable verifier to fetch issuer's KEL
   *
   * @param issuerAid - Issuer's AID (e.g., "EBfdlu8R27Fbx...")
   * @returns true if OOBI resolution succeeded, false otherwise
   */
  async resolveIssuerOobi(issuerAid: string): Promise<boolean> {
    try {
      const oobiUrl = `${this.keriaAgentUrl}/oobi/${issuerAid}/agent/${issuerAid}`;

      const controller = new AbortController();
      const timeoutId = setTimeout(() => controller.abort(), 10000); // 10 second timeout

      const response = await fetch(`${this.baseURL}/oobi`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ oobi: oobiUrl }),
        signal: controller.signal,
      });

      clearTimeout(timeoutId);

      if (!response.ok) {
        console.warn(`OOBI resolution failed for ${issuerAid}: ${response.status} ${response.statusText}`);
        return false;
      }

      // Wait 2-3 seconds for verifier to fetch KEL from witness network
      await new Promise(resolve => setTimeout(resolve, 2500));

      return true;
    } catch (error) {
      console.warn(`OOBI resolution error for ${issuerAid}:`, error);
      return false;
    }
  }

  /**
   * Configure a custom Root of Trust in the Python vLEI verifier
   *
   * This is required for local development where QVIs are not delegated by GLEIF.
   * Production verifiers have GLEIF's Root of Trust pre-configured.
   *
   * The verifier enforces governance rules requiring QVIs to be delegated by
   * GLEIF Root or GLEIF External. For local testing, we configure our self-sovereign
   * QVI as a custom Root of Trust, bypassing the delegation requirement.
   *
   * @param qviAid - The QVI AID to trust (e.g., "EBa8IRZK5P...")
   * @param qviCesr - Full CESR export of the QVI credential (with -IAB attachments)
   * @param keriaAgentUrl - KERIA agent OOBI base URL (e.g., "http://127.0.0.1:3902")
   * @returns true if successfully configured, false otherwise
   */
  async configureRootOfTrust(qviAid: string, qviCesr: string, keriaAgentUrl: string): Promise<boolean> {
    // Create a completely isolated AbortController scope
    let controller: AbortController | null = null;
    let timeoutId: NodeJS.Timeout | null = null;

    try {
      // OOBI URL uses /controller suffix (KERI standard, not /agent/{aid})
      const oobiUrl = `${keriaAgentUrl}/oobi/${qviAid}/controller`;

      console.log(`Configuring Root of Trust for QVI: ${qviAid.substring(0, 20)}...`);

      controller = new AbortController();
      timeoutId = setTimeout(() => controller?.abort(), 60000);

      const response = await fetch(`${this.baseURL}/root_of_trust/${qviAid}`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          oobi: oobiUrl,
          vlei: qviCesr,
        }),
        signal: controller.signal,
      });

      // Clear timeout immediately after response
      if (timeoutId) clearTimeout(timeoutId);
      timeoutId = null;
      controller = null;

      if (!response.ok) {
        console.error(`Failed to configure Root of Trust: ${response.status} ${response.statusText}`);
        return false;
      }

      console.log(`✅ Root of Trust configured for QVI: ${qviAid.substring(0, 20)}...`);
      return true;
    } catch (error) {
      console.error(`Error configuring Root of Trust:`, error);
      return false;
    } finally {
      // Ensure cleanup in all cases
      if (timeoutId) {
        clearTimeout(timeoutId);
        timeoutId = null;
      }
      controller = null;
    }
  }

  /**
   * Verify a vLEI credential using Python vLEI verifier
   *
   * NOTE: The verifier requires CESR format, not JSON.
   * JSON credentials will fail with "invalid content type" error.
   *
   * @param credentialCESR - Credential in CESR format
   * @param said - Credential SAID (Self-Addressing Identifier)
   * @returns Verification result from Python verifier
   */
  async verifyCredential(credentialCESR: string, said: string): Promise<PythonVerifierResult> {
    try {
      // Pre-validation: Check if SAID in URL matches credential
      const saidMismatchError = this.detectSAIDMismatch(credentialCESR, said);

      // Step 0: Resolve issuer OOBI to enable verifier to fetch issuer's KEL
      const issuerAid = this.extractIssuerAid(credentialCESR);
      if (issuerAid) {
        console.log(`Resolving OOBI for issuer: ${issuerAid}`);
        await this.resolveIssuerOobi(issuerAid);
        // Note: resolveIssuerOobi includes a 2.5s delay for KEL fetching
      } else {
        console.warn('Could not extract issuer AID from credential - skipping OOBI resolution');
      }

      // Step 1: Submit credential to Python verifier (with 30s timeout)
      const controller = new AbortController();
      const timeoutId = setTimeout(() => controller.abort(), 30000); // 30 second timeout

      try {
        const submitResponse = await fetch(`${this.baseURL}/presentations/${said}`, {
          method: 'PUT',
          headers: {
            'Content-Type': 'application/json+cesr',
          },
          body: credentialCESR,
          signal: controller.signal,
        });

        clearTimeout(timeoutId);

        // Handle submission errors
        if (!submitResponse.ok) {
          const errorData = await submitResponse.json().catch(() => ({ msg: 'Unknown error' }));

          // 400: Cryptographic validation failed
          if (submitResponse.status === 400) {
            // Provide detailed errors based on what we can detect
            const detailedErrors = this.parseCryptographicError(errorData.msg || 'Unknown cryptographic error', saidMismatchError);

            return {
              verified: false,
              saidValid: false,  // HTTP 400 means cryptographic verification failed, so SAID is invalid
              qviChainValid: false,
              registryChecked: false,
              errors: detailedErrors,
            };
          }

          // 503: Service busy
          if (submitResponse.status === 503) {
            return {
              verified: false,
              saidValid: false,
              qviChainValid: false,
              registryChecked: false,
              errors: ['Verifier is busy, try again later'],
            };
          }

          throw new Error(`Verifier error: ${errorData.msg || submitResponse.statusText}`);
        }

        // Step 2: Parse submission response
        const submitData = await submitResponse.json();
        console.log('[DEBUG] Submit response:', JSON.stringify(submitData));

        const aid = submitData.aid;
        console.log('[DEBUG] Extracted AID:', aid);

        if (!aid) {
          console.log('[DEBUG] AID is undefined/null/empty');
          return {
            verified: false,
            saidValid: false,
            qviChainValid: false,
            registryChecked: false,
            errors: ['No AID returned from verifier'],
          };
        }

        console.log('[DEBUG] About to check authorization for AID:', aid);

        // Step 3: Check authorization status
        console.log('[DEBUG] Fetching authorization from:', `${this.baseURL}/authorizations/${aid}`);
        const authResponse = await fetch(`${this.baseURL}/authorizations/${aid}`, {
          method: 'GET',
        });

        console.log('[DEBUG] Authorization response status:', authResponse.status);

        // 200: Authorized (fully verified)
        if (authResponse.status === 200) {
          return {
            verified: true,
            saidValid: true,
            qviChainValid: true,
            registryChecked: true,
            errors: [],
          };
        }

        // 401: Not authorized (credential valid but not authorized)
        if (authResponse.status === 401) {
          console.log('[DEBUG] Got 401, parsing JSON response...');
          const authError = await authResponse.json().catch((e) => {
            console.log('[DEBUG] JSON parse error:', e);
            return { msg: 'Credential not authorized' };
          });
          console.log('[DEBUG] Parsed authError:', authError);
          // Parse detailed error message from verifier
          const detailedErrors = this.parseAuthorizationError(authError.msg || 'Credential not authorized (failed filters)');
          console.log('[DEBUG] Detailed errors:', detailedErrors);

          return {
            verified: true,  // Cryptographically valid
            saidValid: true,
            qviChainValid: false,  // Failed authorization filters
            registryChecked: true,
            errors: detailedErrors,
          };
        }

        // 404: Never submitted
        if (authResponse.status === 404) {
          return {
            verified: false,
            saidValid: false,
            qviChainValid: false,
            registryChecked: false,
            errors: ['Credential not found in verifier'],
          };
        }

        // Other error
        const authError = await authResponse.json().catch(() => ({ msg: 'Unknown error' }));
        return {
          verified: false,
          saidValid: false,
          qviChainValid: false,
          registryChecked: false,
          errors: [authError.msg || 'Authorization check failed'],
        };

      } catch (fetchError) {
        // Handle timeout or network errors in fetch
        if (fetchError instanceof Error && fetchError.name === 'AbortError') {
          return {
            verified: false,
            saidValid: false,
            qviChainValid: false,
            registryChecked: false,
            errors: ['Verification timeout: Python vLEI verifier took too long to respond (>30s)'],
          };
        }
        throw fetchError; // Re-throw to outer catch
      }

    } catch (error) {
      // Network error or verifier unreachable
      if (error instanceof TypeError && error.message.includes('fetch')) {
        return {
          verified: false,
          saidValid: false,
          qviChainValid: false,
          registryChecked: false,
          errors: ['Python vLEI verifier unreachable (is Docker running at localhost:7676?)'],
        };
      }

      if (error instanceof Error && error.name === 'AbortError') {
        return {
          verified: false,
          saidValid: false,
          qviChainValid: false,
          registryChecked: false,
          errors: ['Verification timeout: Python vLEI verifier took too long to respond (>30s)'],
        };
      }

      return {
        verified: false,
        saidValid: false,
        qviChainValid: false,
        registryChecked: false,
        errors: [error instanceof Error ? error.message : 'Unknown verifier error'],
      };
    }
  }

  /**
   * Check health of Python vLEI verifier service
   *
   * @returns true if verifier is healthy, false otherwise
   */
  async checkHealth(): Promise<boolean> {
    try {
      const controller = new AbortController();
      const timeoutId = setTimeout(() => controller.abort(), 5000); // 5 second timeout for health check

      const response = await fetch(`${this.baseURL}/health`, {
        method: 'GET',
        signal: controller.signal,
      });

      clearTimeout(timeoutId);
      return response.ok;
    } catch {
      return false;
    }
  }
}
