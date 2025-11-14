/**
 * GLEIFAPIClient Tests
 *
 * Tests GLEIF API integration for jurisdiction lookup
 * Uses real GLEIF API for integration testing
 */

import { describe, it, expect, beforeEach } from 'vitest';
import { GLEIFAPIClient } from '../GLEIFAPIClient';

describe('GLEIFAPIClient', () => {
  let client: GLEIFAPIClient;

  beforeEach(() => {
    client = new GLEIFAPIClient();
  });

  describe('getJurisdiction', () => {
    it('should fetch jurisdiction for valid LEI (GLEIF Foundation)', async () => {
      // Real LEI: GLEIF Foundation
      const lei = '506700GE1G29325QX363';

      const result = await client.getJurisdiction(lei);

      expect(result).toBeTruthy();
      expect(result?.source).toBe('gleif');
      expect(result?.value).toBeTruthy();
      expect(typeof result?.value).toBe('string');
      expect(result?.value.length).toBe(2); // ISO 3166-1 alpha-2
    }, 10000); // 10s timeout for real API call

    it('should return null for invalid LEI', async () => {
      const invalidLei = 'INVALID000000000000';

      const result = await client.getJurisdiction(invalidLei);

      expect(result).toBeNull();
    }, 10000);

    it('should return null for non-existent LEI', async () => {
      const nonExistentLei = '999999NONEXISTENT999';

      const result = await client.getJurisdiction(nonExistentLei);

      expect(result).toBeNull();
    }, 10000);
  });

  describe('Rate Limiting', () => {
    it('should handle multiple requests without hitting rate limit', async () => {
      const lei = '506700GE1G29325QX363'; // GLEIF Foundation

      // Make 3 requests quickly
      const requests = [
        client.getJurisdiction(lei),
        client.getJurisdiction(lei),
        client.getJurisdiction(lei),
      ];

      const results = await Promise.all(requests);

      // All should succeed (rate limit is 60/min)
      expect(results.every(r => r !== null)).toBe(true);
    }, 15000);
  });

  describe('Error Handling', () => {
    it('should gracefully handle network errors', async () => {
      // Use invalid base URL to trigger network error
      const badClient = new GLEIFAPIClient('https://invalid-domain-that-does-not-exist-12345.com');

      const result = await badClient.getJurisdiction('506700GE1G29325QX363');

      // Should return null instead of throwing
      expect(result).toBeNull();
    }, 10000);
  });
});
