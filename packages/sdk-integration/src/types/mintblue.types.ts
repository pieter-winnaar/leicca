/**
 * MintBlue SDK Type Definitions
 *
 * Type-safe interfaces for MintBlue SDK operations.
 */

import type {
  MintblueTransactionParams,
  MintblueTransaction,
  MintblueTransactionQuery,
} from './bsv.types';

/**
 * MintBlue SDK client options
 */
export interface MintblueClientOptions {
  url: string;
  version: string;
  SDKTokenPrefix: string;
  ServerTokenPrefix: string;
  token: string; // API token (converted from SDK token: /sdk/ -> /api/)
  keys: {
    masterKey: object;
    recoveryKey: object;
    privateKey: string;
    publicKeyHex: string;
    kek: object;
    additionalKeys: Array<{
      info: string;
      kid: string;
      jwk: object;
      cryptoKey: object;
    }>;
  };
  userKeyAttributes: {
    kekSalt: string;
    publicKeyHex: string;
    kekIterations: number;
    masterKeyEncryptedWithKek: string;
    privateKeyEncryptedWithMasterKey: string;
    masterKeyEncryptedWithRecoveryKey: string;
    recoveryKeyEncryptedWithMasterKey: string;
  };
}

/**
 * MintBlue SDK client interface
 *
 * Matches the real @mintblue/sdk Mintblue class structure:
 * - Methods are on the instance: createTransaction(), listTransactions(), etc.
 * - Keys accessible via client.keys.findKeyByName()
 * - options.keys.additionalKeys contains internal key storage
 * - options.api contains the API client
 */
export interface MintblueClient {
  createTransaction: (params: MintblueTransactionParams) => Promise<MintblueTransaction>;
  listTransactions: (query: MintblueTransactionQuery) => Promise<MintblueTransaction[]>;
  keys: {
    findKeyByName: (keyName: string) => Promise<any>;
  };
  options: MintblueClientOptions;
  api: unknown; // Internal API client
}

/**
 * MintBlue client factory function type
 */
export type MintblueCreateFn = (config: { token: string }) => Promise<MintblueClient>;

/**
 * MintBlue project
 */
export interface MintblueProject {
  id: string;
  name: string;
  description: string;
  tags: string[];
  default_key_id: string | null;
  total_transactions_count: number;
  total_transactions_size: number;
  avg_transactions_size: number;
  created_at: string;
  archived_at: string | null;
}

/**
 * MintBlue projects list response
 */
export interface MintblueProjectsResponse {
  data: MintblueProject[];
}
