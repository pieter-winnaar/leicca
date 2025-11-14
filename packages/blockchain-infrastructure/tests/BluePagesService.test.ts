/**
 * BluePagesService Tests
 *
 * Tests Blue Pages API integration with REAL API response format.
 * Based on actual Blue Pages API: https://fides-bluepages.acc.credenco.com/api/public/api-docs
 */

import { describe, it, expect, vi, beforeEach } from 'vitest';
import { BluePagesService, type BluePagesOrganization } from '../src/services/BluePagesService';

describe('BluePagesService', () => {
  let service: BluePagesService;

  // Real API response fixture from Blue Pages
  const mockBluePagesOrganization = {
    id: 123,
    externalKey: 'org_abc123',
    did: 'did:web:example.com',
    name: 'Test Organization',
    title: {
      value: 'Test Organization',
      type: 'string'
    },
    subTitle1: {
      value: 'Belgium',
      type: 'string'
    },
    subTitle2: {
      value: 'Manufacturing',
      type: 'string'
    },
    vatNumber: 'BE0123456789',
    country: 'Belgium',
    publicKey: '02abc123def456789012345678901234567890123456789012345678901234567890',
    credentialStatus: 'verified' as const,
    digitalAssetIdentifier: {
      "@context": ["https://www.w3.org/2018/credentials/v1"],
      "type": ["VerifiableCredential", "DigitalAssetIdentifier"],
      "credentialSubject": {
        "public_key": "02abc123def456789012345678901234567890123456789012345678901234567890",
        "blockchain": {
          "coin_type": 236,
          "network": "mainnet" as const
        }
      }
    },
    services: [
      {
        id: 1,
        externalKey: 'service_1',
        title: 'Payment Service',
        icon: 'payment_icon',
        serviceId: 'payment-001',
        serviceTypeLabel: 'Payment Gateway',
        serviceType: 'payment',
        serviceEndpointLabel: 'API Endpoint',
        serviceEndpoint: 'https://api.example.com/payment',
        serviceEndpointJson: '{"url": "https://api.example.com/payment"}',
        credentials: [
          {
            id: 1,
            icon: 'contact_icon',
            type: 'ContactInfo',
            displayName: 'Contact Information',
            status: 'verified',
            issuer: 'did:mintblue:issuer123',
            validationPolicyResults: [],
            lastUpdated: '2024-01-15T10:30:00Z',
            attributes: [
              {
                id: 1,
                key: 'url',
                value: 'https://www.testorg.com',
                displayName: 'Website',
                dataType: 'string'
              },
              {
                id: 2,
                key: 'email',
                value: 'contact@testorg.com',
                displayName: 'Email',
                dataType: 'string'
              },
              {
                id: 3,
                key: 'telephone',
                value: '+32 2 123 45 67',
                displayName: 'Phone',
                dataType: 'string'
              },
              {
                id: 4,
                key: 'logo',
                value: 'https://www.testorg.com/logo.png',
                displayName: 'Logo',
                dataType: 'string'
              }
            ]
          }
        ]
      }
    ]
  };

  // Paginated response format from Blue Pages API
  const mockPaginatedResponse = {
    content: [mockBluePagesOrganization],
    page: {
      size: 10,
      number: 0,
      totalElements: 1,
      totalPages: 1
    }
  };

  beforeEach(() => {
    service = new BluePagesService('https://test-bluepages.example.com/api/public');

    // Reset all mocks
    vi.clearAllMocks();
  });

  describe('getOrganizationByDID', () => {
    it('should fetch organization by DID with correct endpoint', async () => {
      global.fetch = vi.fn().mockResolvedValue({
        ok: true,
        json: async () => mockBluePagesOrganization
      });

      const result = await service.getOrganizationByDID('did:web:example.com');

      expect(global.fetch).toHaveBeenCalledWith(
        'https://test-bluepages.example.com/api/public/organizations/did%3Aweb%3Aexample.com',
        {
          headers: {
            'Content-Type': 'application/json'
          }
        }
      );

      expect(result).toBeDefined();
      expect(result?.did).toBe('did:web:example.com');
      expect(result?.publicKey).toBe('02abc123def456789012345678901234567890123456789012345678901234567890');
    });

    it('should map organization response correctly', async () => {
      global.fetch = vi.fn().mockResolvedValue({
        ok: true,
        json: async () => mockBluePagesOrganization
      });

      const result = await service.getOrganizationByDID('did:web:example.com');

      expect(result).toMatchObject({
        id: 123,
        externalKey: 'org_abc123',
        did: 'did:web:example.com',
        name: 'Test Organization',
        vatNumber: 'BE0123456789',
        country: 'Belgium',
        publicKey: '02abc123def456789012345678901234567890123456789012345678901234567890',
        credentialStatus: 'verified',
        url: 'https://www.testorg.com',
        email: 'contact@testorg.com',
        telephone: '+32 2 123 45 67',
        logo: 'https://www.testorg.com/logo.png'
      });
    });

    it('should extract contact info from credentials', async () => {
      global.fetch = vi.fn().mockResolvedValue({
        ok: true,
        json: async () => mockBluePagesOrganization
      });

      const result = await service.getOrganizationByDID('did:web:example.com');

      // Verify contact info was extracted
      expect(result?.url).toBe('https://www.testorg.com');
      expect(result?.email).toBe('contact@testorg.com');
      expect(result?.telephone).toBe('+32 2 123 45 67');
      expect(result?.logo).toBe('https://www.testorg.com/logo.png');
    });

    it('should return null if organization not found', async () => {
      global.fetch = vi.fn().mockResolvedValue({
        ok: false,
        status: 404
      });

      const result = await service.getOrganizationByDID('did:web:nonexistent.com');

      expect(result).toBeNull();
    });

    it('should return null on fetch error', async () => {
      global.fetch = vi.fn().mockRejectedValue(new Error('Network error'));

      const result = await service.getOrganizationByDID('did:web:example.com');

      expect(result).toBeNull();
    });
  });

  describe('searchOrganizations', () => {
    it('should search organizations with query parameter', async () => {
      global.fetch = vi.fn().mockResolvedValue({
        ok: true,
        json: async () => mockPaginatedResponse
      });

      const results = await service.searchOrganizations('Test');

      expect(global.fetch).toHaveBeenCalledWith(
        'https://test-bluepages.example.com/api/public/organizations?q=Test',
        {
          headers: {
            'Content-Type': 'application/json'
          }
        }
      );

      expect(results).toHaveLength(1);
      expect(results[0]?.did).toBe('did:web:example.com');
    });

    it('should handle paginated response format', async () => {
      global.fetch = vi.fn().mockResolvedValue({
        ok: true,
        json: async () => mockPaginatedResponse
      });

      const results = await service.searchOrganizations('Test');

      expect(results).toHaveLength(1);
      expect(results[0]?.name).toBe('Test Organization');
    });

    it('should handle non-paginated array response', async () => {
      global.fetch = vi.fn().mockResolvedValue({
        ok: true,
        json: async () => [mockBluePagesOrganization]
      });

      const results = await service.searchOrganizations('Test');

      expect(results).toHaveLength(1);
      expect(results[0]?.name).toBe('Test Organization');
    });

    it('should return empty array on search failure', async () => {
      global.fetch = vi.fn().mockResolvedValue({
        ok: false,
        status: 500
      });

      const results = await service.searchOrganizations('Test');

      expect(results).toEqual([]);
    });

    it('should return empty array on fetch error', async () => {
      global.fetch = vi.fn().mockRejectedValue(new Error('Network error'));

      const results = await service.searchOrganizations('Test');

      expect(results).toEqual([]);
    });
  });

  describe('checkCredentialStatus', () => {
    it('should check credential status for public key', async () => {
      global.fetch = vi.fn().mockResolvedValue({
        ok: true,
        json: async () => ({ status: 'verified' })
      });

      const status = await service.checkCredentialStatus('02abc123def456');

      expect(global.fetch).toHaveBeenCalledWith(
        expect.stringContaining('/credentials/check?public_key=02abc123def456'),
        expect.any(Object)
      );

      expect(status).toBe('verified');
    });

    it('should return "none" if check fails', async () => {
      global.fetch = vi.fn().mockResolvedValue({
        ok: false,
        status: 404
      });

      const status = await service.checkCredentialStatus('02abc123def456');

      expect(status).toBe('none');
    });

    it('should return "none" on error', async () => {
      global.fetch = vi.fn().mockRejectedValue(new Error('Network error'));

      const status = await service.checkCredentialStatus('02abc123def456');

      expect(status).toBe('none');
    });
  });

  describe('registerOrganization', () => {
    it('should register organization with Digital Asset Identifier', async () => {
      global.fetch = vi.fn().mockResolvedValue({
        ok: true
      });

      const mockCredential = {
        "@context": ["https://www.w3.org/2018/credentials/v1"],
        "type": ["VerifiableCredential", "DigitalAssetIdentifier"],
        "credentialSubject": {
          "public_key": "02abc123def456",
          "blockchain": {
            "coin_type": 236,
            "network": "mainnet" as const
          }
        }
      };

      const result = await service.registerOrganization(
        'did:mintblue:abc123',
        '02abc123def456',
        mockCredential
      );

      expect(global.fetch).toHaveBeenCalledWith(
        expect.stringContaining('/organizations/did%3Amintblue%3Aabc123'),
        {
          method: 'PUT',
          headers: {
            'Content-Type': 'application/json'
          },
          body: JSON.stringify({
            publicKey: '02abc123def456',
            digitalAssetIdentifier: mockCredential,
            credentialStatus: 'verified'
          })
        }
      );

      expect(result).toBe(true);
    });

    it('should return false on registration failure', async () => {
      global.fetch = vi.fn().mockResolvedValue({
        ok: false
      });

      const mockCredential = {
        "@context": ["https://www.w3.org/2018/credentials/v1"],
        "type": ["VerifiableCredential", "DigitalAssetIdentifier"],
        "credentialSubject": {
          "public_key": "02abc123def456",
          "blockchain": {
            "coin_type": 236,
            "network": "mainnet" as const
          }
        }
      };

      const result = await service.registerOrganization(
        'did:mintblue:abc123',
        '02abc123def456',
        mockCredential
      );

      expect(result).toBe(false);
    });

    it('should return false on error', async () => {
      global.fetch = vi.fn().mockRejectedValue(new Error('Network error'));

      const mockCredential = {
        "@context": ["https://www.w3.org/2018/credentials/v1"],
        "type": ["VerifiableCredential", "DigitalAssetIdentifier"],
        "credentialSubject": {
          "public_key": "02abc123def456",
          "blockchain": {
            "coin_type": 236,
            "network": "mainnet" as const
          }
        }
      };

      const result = await service.registerOrganization(
        'did:mintblue:abc123',
        '02abc123def456',
        mockCredential
      );

      expect(result).toBe(false);
    });
  });
});
