/**
 * Type definitions for Admin page
 */

export interface InfrastructureStatus {
  keria: boolean;
  verifier: boolean;
  vleiServer: boolean;
  witnesses: boolean;
  error?: string;
}

export interface AIDInfo {
  name: string;
  prefix: string;
  created: string;
}

export interface RegistryInfo {
  name: string;
  registryId: string;
  issuerAid: string;
}

export interface CredentialInfo {
  said: string;
  type: 'QVI' | 'LE' | 'ECR';
  lei: string | null;
  issued: string;
  issuedTimestamp?: string; // ISO timestamp for sorting
  issuer?: string;
  holder?: string;
}

export interface ActionResult {
  success: boolean;
  error?: string;
  prefix?: string;
  registryId?: string;
  said?: string;
  content?: string;
  filename?: string;
  credential?: CredentialInfo;
  delegated?: boolean;
  delegatorPrefix?: string;
}
