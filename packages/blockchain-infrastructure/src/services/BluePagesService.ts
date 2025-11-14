/**
 * Blue Pages Service for FIDES Integration
 *
 * Handles organization discovery and DID resolution via Blue Pages API.
 * Based on working implementation from dashboard-demo.
 *
 * API Documentation: https://fides-bluepages.acc.credenco.com/api/public/api-docs
 */

export interface BluePagesGenericAttribute {
  value: string;
  type: string;
}

export interface BluePagesValidationResult {
  policy: string;
  result: 'passed' | 'failed';
  timestamp: string;
}

/**
 * W3C Verifiable Credential: Digital Asset Identifier
 * Replaces legacy UTXO credential format
 *
 * Based on tax-phase2a implementation using W3C VC standard.
 * Consistently named "DigitalAssetIdentifier" (not tokenCredential, not utxoCredential).
 */
export interface DigitalAssetIdentifier {
  "@context": string[];
  "type": string[];
  "credentialSubject": {
    "public_key": string;
    "blockchain": {
      "coin_type": number;  // SLIP-44 coin type (236 for BSV)
      "network"?: 'mainnet' | 'testnet' | 'regtest';
      "name"?: string;
    };
    "derivation"?: {
      "algorithm": string;  // 'Type-42-ECDH', 'BIP32', etc.
      "identifier_type"?: string;
    };
    "services"?: Array<{
      "id": string;
      "type": string;
      "serviceEndpoint": string;
    }>;
  };
  "issuanceDate"?: string;
  "issuer"?: string;
}

export interface BluePagesCredentialAttribute {
  id?: number;
  key?: string;
  value?: string;
  displayName?: string;
  dataType?: string;
}

export interface BluePagesCredential {
  id?: number;
  icon?: string;
  type?: string;
  displayName?: string;
  status?: string;
  issuer?: string;
  validationPolicyResults?: BluePagesValidationResult[];
  lastUpdated?: string;
  attributes?: BluePagesCredentialAttribute[];
}

export interface BluePagesServiceData {
  id?: number;
  externalKey?: string;
  title?: string;
  icon?: string;
  serviceId?: string;
  serviceTypeLabel?: string;
  serviceType?: string;
  serviceEndpointLabel?: string;
  serviceEndpoint?: string;
  serviceEndpointJson?: string;
  credentials?: BluePagesCredential[];
}

export interface BluePagesOrganization {
  id?: number;
  externalKey?: string;
  did: string;
  name?: string;
  title?: BluePagesGenericAttribute;
  subTitle1?: BluePagesGenericAttribute;
  subTitle2?: BluePagesGenericAttribute;
  vatNumber?: string;
  country?: string;
  publicKey?: string;
  credentialStatus?: 'none' | 'pending' | 'verified';
  digitalAssetIdentifier?: DigitalAssetIdentifier;
  services?: BluePagesServiceData[];
  // Contact info extracted from credentials
  url?: string;
  telephone?: string;
  email?: string;
  logo?: string;
}

export class BluePagesService {
  private apiUrl: string;

  constructor(apiUrl?: string) {
    this.apiUrl = apiUrl || 'https://bluepages.fides.community/api/public';
  }

  /**
   * Search organizations in Blue Pages
   */
  async searchOrganizations(query: string): Promise<BluePagesOrganization[]> {
    try {
      const endpoint = `${this.apiUrl}/organizations?q=${encodeURIComponent(query)}`;

      const response = await fetch(endpoint, {
        headers: {
          'Content-Type': 'application/json'
        }
      });

      if (!response.ok) {
        console.error('Blue Pages search failed:', response.status);
        return [];
      }

      const data = await response.json();
      // Handle paginated response format from Blue Pages API
      const organizations = data.content || data;
      return this.mapOrganizations(organizations);
    } catch (error) {
      console.error('Error searching Blue Pages:', error);
      return [];
    }
  }

  /**
   * Get organization by DID or external key
   */
  async getOrganizationByDID(did: string): Promise<BluePagesOrganization | null> {
    try {
      const endpoint = `${this.apiUrl}/organizations/${encodeURIComponent(did)}`;

      const response = await fetch(endpoint, {
        headers: {
          'Content-Type': 'application/json'
        }
      });

      if (!response.ok) {
        console.error('Blue Pages DID lookup failed:', response.status);
        return null;
      }

      const data = await response.json();
      return this.mapOrganization(data);
    } catch (error) {
      console.error('Error fetching organization by DID:', error);
      return null;
    }
  }

  /**
   * Check if a public key has an associated UTXO credential
   */
  async checkCredentialStatus(publicKey: string): Promise<'none' | 'pending' | 'verified'> {
    try {
      const response = await fetch(`${this.apiUrl}/credentials/check?public_key=${encodeURIComponent(publicKey)}`, {
        headers: {
          'Content-Type': 'application/json'
        }
      });

      if (!response.ok) {
        return 'none';
      }

      const data = await response.json();
      return data.status || 'none';
    } catch (error) {
      console.error('Error checking credential status:', error);
      return 'none';
    }
  }

  /**
   * Map API response to our organization interface
   */
  private mapOrganization(data: Partial<BluePagesOrganization>): BluePagesOrganization {
    // Extract organization name from title
    const name = data.title?.value || data.name || '';

    // Extract location/country from subtitle
    const country = data.subTitle1?.value || data.country || '';

    // Map services if available
    let services: BluePagesServiceData[] = [];
    let url = '';
    let telephone = '';
    let email = '';
    let logo = '';

    if (data.services && Array.isArray(data.services)) {
      services = data.services.map((service: Partial<BluePagesServiceData>) => {
        const mappedService: BluePagesServiceData = {
          id: service.id,
          externalKey: service.externalKey,
          title: service.title,
          icon: service.icon,
          serviceId: service.serviceId,
          serviceTypeLabel: service.serviceTypeLabel,
          serviceType: service.serviceType,
          serviceEndpointLabel: service.serviceEndpointLabel,
          serviceEndpoint: service.serviceEndpoint,
          serviceEndpointJson: service.serviceEndpointJson,
          credentials: []
        };

        // Map credentials if available
        if (service.credentials && Array.isArray(service.credentials)) {
          mappedService.credentials = service.credentials.map((cred: Partial<BluePagesCredential>) => {
            const mappedCred: BluePagesCredential = {
              id: cred.id,
              icon: cred.icon,
              type: cred.type,
              displayName: cred.displayName,
              status: cred.status,
              issuer: cred.issuer,
              validationPolicyResults: cred.validationPolicyResults || [],
              lastUpdated: cred.lastUpdated,
              attributes: []
            };

            // Map attributes and extract contact info
            if (cred.attributes && Array.isArray(cred.attributes)) {
              mappedCred.attributes = cred.attributes.map((attr: Partial<BluePagesCredentialAttribute>) => {
                // Extract contact info from ContactInfo credentials
                if (cred.type === 'ContactInfo') {
                  if (attr.key === 'url') url = attr.value || '';
                  if (attr.key === 'telephone') telephone = attr.value || '';
                  if (attr.key === 'email') email = attr.value || '';
                  if (attr.key === 'logo') logo = attr.value || '';
                }

                return {
                  id: attr.id,
                  key: attr.key,
                  value: attr.value,
                  displayName: attr.displayName,
                  dataType: attr.dataType
                };
              });
            }

            return mappedCred;
          });
        }

        return mappedService;
      });
    }

    return {
      id: data.id,
      externalKey: data.externalKey,
      did: data.did || '',
      name: name,
      title: data.title,
      subTitle1: data.subTitle1,
      subTitle2: data.subTitle2,
      vatNumber: data.vatNumber || '',
      country: country,
      publicKey: data.publicKey || '',
      credentialStatus: data.credentialStatus || 'none',
      digitalAssetIdentifier: data.digitalAssetIdentifier,
      services: services,
      url: url,
      telephone: telephone,
      email: email,
      logo: logo
    };
  }

  /**
   * Map multiple organizations
   */
  private mapOrganizations(data: unknown[]): BluePagesOrganization[] {
    if (!Array.isArray(data)) {
      return [];
    }
    return data.map(org => this.mapOrganization(org as Partial<BluePagesOrganization>));
  }

  /**
   * Register or update organization with Digital Asset Identifier credential
   * Note: Currently not needed - API only used for read/verify operations
   * Would require authentication in production
   */
  async registerOrganization(did: string, publicKey: string, credential: DigitalAssetIdentifier): Promise<boolean> {
    try {
      const response = await fetch(`${this.apiUrl}/organizations/${encodeURIComponent(did)}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          // 'Authorization': 'Bearer <token>' // Would need auth in production
        },
        body: JSON.stringify({
          publicKey,
          digitalAssetIdentifier: credential,
          credentialStatus: 'verified'
        })
      });

      return response.ok;
    } catch (error) {
      console.error('Error registering organization:', error);
      return false;
    }
  }
}
