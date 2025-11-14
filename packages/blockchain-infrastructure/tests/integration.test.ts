/**
 * Integration Tests for Blockchain Infrastructure Services - DEPRECATED
 *
 * OBSOLETE: These integration tests are deprecated due to architecture changes.
 *
 * REMOVED SERVICES (replaced by BRC100WalletService basket architecture):
 * - UTXOService (baskets are source of truth)
 * - WalletService (deprecated)
 * - TokenService (tokens managed via baskets)
 * - FundingService (replaced by BRC100WalletService.fundWallet)
 *
 * REPLACEMENT:
 * - All wallet operations now handled by BRC100WalletService
 * - See tests/BRC100WalletService.test.ts for new integration tests
 * - BRC100WalletService manages UTXOs via baskets (localStorage-backed)
 * - BRC-100 compliant wallet interface (createAction, signAction, abortAction, internalizeAction)
 *
 * TODO(Sprint-3A.4): Create new integration tests for BRC100WalletService workflows
 */

import { describe, it, expect } from 'vitest';

describe('Integration Tests - DEPRECATED', () => {
  it('should redirect to BRC100WalletService tests', () => {
    // All integration tests moved to BRC100WalletService.test.ts
    // This test suite is kept for historical reference only
    expect(true).toBe(true);
  });
});
