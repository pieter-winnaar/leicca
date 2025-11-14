import { VLEICredential, VerificationResult } from '@/types/vlei';

export class VLEIVerificationService {
  async verifyCredential(credential: string): Promise<VerificationResult> {
    // TODO(#RT-1): Implement in Sprint 2 (after RT-1: Python vLEI Verifier research)
    throw new Error('Not implemented - waiting for RT-1');
  }

  async enrichWithJurisdiction(lei: string): Promise<string | null> {
    // TODO(#RT-1): Implement in Sprint 2 (GLEIF API integration)
    throw new Error('Not implemented');
  }
}
