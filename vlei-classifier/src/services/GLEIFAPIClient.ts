/**
 * GLEIFAPIClient - GLEIF API integration for jurisdiction lookup
 *
 * Fetches Legal Entity Identifier (LEI) data from GLEIF's public API
 * to enrich vLEI credentials with jurisdiction information.
 *
 * API: https://api.gleif.org/api/v1
 * Format: JSON API (application/vnd.api+json)
 * Rate Limit: 60 requests/minute (conservative client-side limit)
 */

export interface JurisdictionResult {
  value: string;  // ISO 3166-1 alpha-2 code (e.g., "KY", "AD")
  source: 'gleif';
}

export class GLEIFAPIClient {
  private baseURL: string;
  private requestCount = 0;
  private requestWindow = Date.now();
  private readonly maxRequestsPerMinute = 60; // Conservative limit

  constructor(baseURL: string = 'https://api.gleif.org/api/v1') {
    this.baseURL = baseURL;
  }

  /**
   * Fetch jurisdiction for a given LEI
   *
   * @param lei - Legal Entity Identifier (20-character alphanumeric)
   * @returns Jurisdiction result or null if not found
   */
  async getJurisdiction(lei: string): Promise<JurisdictionResult | null> {
    await this.checkRateLimit();

    try {
      const response = await fetch(`${this.baseURL}/lei-records/${lei}`, {
        headers: {
          'Accept': 'application/vnd.api+json',
        },
      });

      if (!response.ok) {
        if (response.status === 404) {
          console.warn(`LEI not found: ${lei}`);
          return null; // LEI not found
        }
        if (response.status === 429) {
          // Rate limited - wait and retry once
          console.warn('GLEIF API rate limited, retrying...');
          await this.delay(1000);
          return this.getJurisdiction(lei); // Retry once
        }
        throw new Error(`GLEIF API error: ${response.status}`);
      }

      const data = await response.json();

      // Extract jurisdiction from GLEIF JSON API format
      // Path: data.attributes.entity.legalAddress.country
      const jurisdiction = data?.data?.attributes?.entity?.legalAddress?.country;

      if (!jurisdiction) {
        console.warn(`No jurisdiction found for LEI: ${lei}`);
        return null;
      }

      return {
        value: jurisdiction, // ISO 3166-1 alpha-2 code
        source: 'gleif',
      };
    } catch (error) {
      console.error('GLEIF API error:', error);
      return null; // Graceful degradation
    }
  }

  /**
   * Client-side rate limiting to prevent API abuse
   * Limits to maxRequestsPerMinute requests per minute
   */
  private async checkRateLimit(): Promise<void> {
    const now = Date.now();
    const windowDuration = 60 * 1000; // 1 minute

    // Reset window if expired
    if (now - this.requestWindow > windowDuration) {
      this.requestCount = 0;
      this.requestWindow = now;
    }

    // Wait if limit reached
    if (this.requestCount >= this.maxRequestsPerMinute) {
      const waitTime = windowDuration - (now - this.requestWindow);
      console.warn(`Rate limit reached, waiting ${waitTime}ms`);
      await this.delay(waitTime);
      this.requestCount = 0;
      this.requestWindow = Date.now();
    }

    this.requestCount++;
  }

  /**
   * Fetch full LEI record with legalName and jurisdiction
   *
   * @param lei - Legal Entity Identifier (20-character alphanumeric)
   * @returns LEI record with legalName and jurisdiction, or null if not found
   */
  async getLEIRecord(lei: string): Promise<{
    legalName: string;
    jurisdiction: string;
  } | null> {
    await this.checkRateLimit();

    try {
      const response = await fetch(`${this.baseURL}/lei-records/${lei}`, {
        headers: {
          'Accept': 'application/vnd.api+json',
        },
      });

      if (!response.ok) {
        if (response.status === 404) {
          console.warn(`LEI not found: ${lei}`);
          return null;
        }
        if (response.status === 429) {
          // Rate limited - wait and retry once
          console.warn('GLEIF API rate limited, retrying...');
          await this.delay(1000);
          return this.getLEIRecord(lei);
        }
        throw new Error(`GLEIF API error: ${response.status}`);
      }

      const data = await response.json();

      // Extract legalName and jurisdiction from GLEIF JSON API format
      const entity = data?.data?.attributes?.entity;
      const legalName = entity?.legalName?.name;
      const jurisdiction = entity?.legalAddress?.country;

      if (!legalName || !jurisdiction) {
        console.warn(`Incomplete LEI record for ${lei}`);
        return null;
      }

      return {
        legalName,
        jurisdiction, // ISO 3166-1 alpha-2 code
      };
    } catch (error) {
      console.error('GLEIF API error:', error);
      return null;
    }
  }

  /**
   * Delay helper for rate limiting and retries
   */
  private delay(ms: number): Promise<void> {
    return new Promise(resolve => setTimeout(resolve, ms));
  }
}
