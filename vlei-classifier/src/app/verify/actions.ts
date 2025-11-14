/**
 * LEICCA vLEI Classifier - Verify Actions
 *
 * Server Actions for vLEI credential verification
 */

'use server';

import { unstable_noStore as noStore } from 'next/cache';
import { VLEIVerificationService } from '@/services/VLEIVerificationService';
import { ACDCParser } from '@/services/ACDCParser';
import { GLEIFAPIClient } from '@/services/GLEIFAPIClient';
import { PythonVerifierClient } from '@/services/PythonVerifierClient';
import type { VerificationResultUI } from '@/types/vlei';

/**
 * Verify a vLEI credential
 *
 * Integrates VLEIVerificationService with GLEIF API for full verification.
 * Performs structure validation and enriches with GLEIF data.
 *
 * @param formData - Form data containing credential JSON and filename
 * @returns Verification result with credential details and validation status
 */
export async function verifyCredentialAction(formData: FormData): Promise<VerificationResultUI> {
  // Disable caching for this server action
  noStore();

  const credentialJson = formData.get('credential') as string;
  const filename = formData.get('filename') as string;

  // Basic validation
  if (!credentialJson || !credentialJson.trim()) {
    return {
      verified: false,
      status: 'invalid',
      credential: null,
      verification: null,
      errors: ['No credential provided'],
    };
  }

  try {
    console.log('[VERIFY] Using VLEI_VERIFIER_URL:', process.env.VLEI_VERIFIER_URL);
    console.log('[VERIFY] Using KERIA_AGENT_URL:', process.env.KERIA_AGENT_URL);

    // Initialize services with DI
    const parser = new ACDCParser();
    const gleifAPI = new GLEIFAPIClient();
    const pythonVerifier = new PythonVerifierClient(
      process.env.VLEI_VERIFIER_URL || 'http://localhost:7676',
      process.env.KERIA_AGENT_URL || 'http://localhost:3902'
    );
    const service = new VLEIVerificationService(parser, gleifAPI, pythonVerifier);

    // Verify credential and get UI-formatted result directly
    const result = await service.verify(credentialJson, {
      resolveJurisdiction: true,
    });

    // Return the result (service handles all formatting internally)
    return result;

  } catch (error) {
    return {
      verified: false,
      status: 'invalid',
      credential: null,
      verification: null,
      errors: [error instanceof Error ? error.message : 'Verification failed'],
    };
  }
}
