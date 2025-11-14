/**
 * MintBlueSDKService - MintBlue API Integration
 *
 * LEAF SERVICE (no dependencies)
 *
 * Responsibilities:
 * - MintBlue client initialization
 * - Key management operations
 * - Transaction creation and querying
 * - Transaction broadcasting
 * - Error handling and retry logic
 *
 * Wraps @mintblue/sdk with:
 * - Consistent error handling
 * - Automatic retry logic
 * - Type-safe interfaces
 */

import type {
  MintblueKey,
  MintblueTransactionParams,
  MintblueTransaction,
  MintblueTransactionQuery,
} from '../types/bsv.types';
import type {
  MintblueClient,
  MintblueCreateFn,
  MintblueProject,
  MintblueProjectsResponse,
} from '../types/mintblue.types';
import {
  AuthenticationError,
  SDKError,
  NetworkError,
  RateLimitError,
  ValidationError,
} from '../errors/sdkErrors';
import { withRetry } from '../utils/retryUtils';

/**
 * MintBlueSDKService - Unified wrapper for MintBlue SDK
 */
export class MintBlueSDKService {
  /**
   * Create MintBlue SDK client
   *
   * @param sdkToken - MintBlue SDK token (MINTBLUE_SDK_KEY)
   * @param createFn - Optional create function (for testing)
   * @returns MintBlue client instance
   */
  async createClient(
    sdkToken: string,
    createFn?: MintblueCreateFn
  ): Promise<MintblueClient> {
    try {
      // Use injected create function for testing, or import real SDK
      if (createFn) {
        return await createFn({ token: sdkToken });
      }

      // Production: Use real MintBlue SDK
      // IMPORTANT: Must use Mintblue.create() NOT new Mintblue()
      // The create() method properly initializes keys asynchronously
      console.log(
        '[MintBlueSDKService] Creating client with Mintblue.create()...'
      );
      const { Mintblue } = await import('@mintblue/sdk');
      const client = await Mintblue.create({ token: sdkToken });

      // TypeScript marks options as private but it's accessible at runtime
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      const anyClient = client as any;
      console.log('[MintBlueSDKService] Client created successfully');
      console.log('[MintBlueSDKService] Client keys property:', anyClient.keys);
      console.log('[MintBlueSDKService] Client keys type:', typeof anyClient.keys);
      console.log('[MintBlueSDKService] Client keys.findKeyByName:', anyClient.keys?.findKeyByName);
      console.log('[MintBlueSDKService] All client keys:', Object.keys(anyClient));
      return anyClient as MintblueClient;
    } catch (error) {
      console.error('[MintBlueSDKService] Failed to create client:', error);
      throw new AuthenticationError('Failed to create MintBlue client', error);
    }
  }

  /**
   * Find key by name with retry logic
   *
   * Uses client.keys.findKeyByName() public API method
   *
   * @param client - MintBlue client instance
   * @param keyName - Name of key to find
   * @returns Key object
   */
  async findKeyByName(
    client: MintblueClient,
    keyName: string
  ): Promise<MintblueKey> {
    return withRetry(
      async () => {
        try {
          console.log('[MintBlueSDKService] Looking for key:', keyName);

          // Use the public API method client.keys.findKeyByName()
          const key = await client.keys.findKeyByName(keyName);

          if (!key) {
            throw new Error(`Key '${keyName}' not found in MintBlue SDK keys`);
          }

          console.log('[MintBlueSDKService] Key found:', keyName);
          // Return key in expected format
          return key as any as MintblueKey;
        } catch (error) {
          throw this.transformError(error);
        }
      },
      { maxRetries: 3, baseDelay: 1000 }
    );
  }

  /**
   * Create transaction with retry logic
   *
   * @param client - MintBlue client instance
   * @param params - Transaction parameters
   * @returns Transaction result
   */
  async createTransaction(
    client: MintblueClient,
    params: MintblueTransactionParams
  ): Promise<MintblueTransaction> {
    return withRetry(
      async () => {
        try {
          return await client.createTransaction(params);
        } catch (error) {
          throw this.transformError(error);
        }
      },
      { maxRetries: 3, baseDelay: 1000 }
    );
  }

  /**
   * Query transactions with retry logic
   *
   * Uses listTransactions() which is the actual SDK method
   *
   * @param client - MintBlue client instance
   * @param query - Query parameters
   * @returns Array of transactions
   */
  async listTransactions(
    client: MintblueClient,
    query: MintblueTransactionQuery
  ): Promise<MintblueTransaction[]> {
    return withRetry(
      async () => {
        try {
          // SDK method is listTransactions(), returns Transaction[] directly
          const transactions = await client.listTransactions(query);
          return transactions;
        } catch (error) {
          throw this.transformError(error);
        }
      },
      { maxRetries: 3, baseDelay: 1000 }
    );
  }

  /**
   * Broadcast raw transaction hex to MintBlue network
   *
   * @param client - MintBlue client instance
   * @param hex - Raw transaction hex string
   * @param projectIds - Project ID(s) to broadcast to
   * @param metadata - Optional metadata to attach
   * @returns Broadcast result with txid
   */
  async broadcastTransaction(
    client: MintblueClient,
    hex: string,
    projectIds?: string | string[],
    metadata?: unknown
  ): Promise<{ success: boolean; txid: string }> {
    try {
      // Get API token from client config (v9 uses 'config' not 'options')
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      const apiToken = (client as any).config.apiToken;

      const response = await fetch(
        'https://api.mintblue.com/api/v4/broadcast-transaction',
        {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            Authorization: `Bearer ${apiToken}`,
          },
          body: JSON.stringify({
            hex,
            projectIds: projectIds || undefined,
            metadata: metadata || {},
          }),
        }
      );

      if (!response.ok) {
        const errorData = await response
          .json()
          .catch(() => ({ error: response.statusText }));
        throw new Error(`Broadcast failed: ${JSON.stringify(errorData)}`);
      }

      const result = (await response.json()) as {
        data?: { txid?: string };
      };
      return {
        success: true,
        txid: result.data?.txid || '',
      };
    } catch (error) {
      throw this.transformError(error);
    }
  }

  /**
   * List projects with pagination
   *
   * @param client - MintBlue client instance
   * @param limit - Maximum number of results
   * @param offset - Pagination offset
   * @returns Array of projects
   */
  async listProjects(
    client: MintblueClient,
    limit: number,
    offset: number
  ): Promise<MintblueProject[]> {
    try {
      // Get API token from client config (v9 uses 'config' not 'options')
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      const apiToken = (client as any).config.apiToken;

      const response = await fetch(
        `https://api.mintblue.com/api/v2/project?limit=${limit}&offset=${offset}`,
        {
          method: 'GET',
          headers: {
            Authorization: `Bearer ${apiToken}`,
            'Content-Type': 'application/json',
          },
        }
      );

      if (!response.ok) {
        throw new Error(
          `Failed to list projects: ${response.status} ${response.statusText}`
        );
      }

      const result = (await response.json()) as MintblueProjectsResponse;
      return result.data;
    } catch (error) {
      throw this.transformError(error);
    }
  }

  /**
   * Create new project
   *
   * @param client - MintBlue client instance
   * @param name - Project name
   * @param description - Project description
   * @param tags - Project tags
   * @returns Created project
   */
  async createProject(
    client: MintblueClient,
    name: string,
    description: string,
    tags: string[]
  ): Promise<MintblueProject> {
    try {
      // Get API token from client config (v9 uses 'config' not 'options')
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      const apiToken = (client as any).config.apiToken;

      const response = await fetch('https://api.mintblue.com/api/v2/project', {
        method: 'POST',
        headers: {
          Authorization: `Bearer ${apiToken}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ name, description, tags }),
      });

      if (!response.ok) {
        const errorData = await response
          .json()
          .catch(() => ({ error: response.statusText }));
        throw new Error(
          `Failed to create project: ${response.status} - ${JSON.stringify(errorData)}`
        );
      }

      return (await response.json()) as MintblueProject;
    } catch (error) {
      throw this.transformError(error);
    }
  }

  /**
   * Transform generic errors to specific SDK error types
   *
   * @param error - Original error
   * @returns Transformed SDK error
   */
  private transformError(error: unknown): SDKError {
    const errorMessage = error instanceof Error ? error.message : String(error);

    // Network errors
    if (errorMessage.includes('Network') || errorMessage.includes('network')) {
      return new NetworkError(errorMessage, error);
    }

    // Authentication errors
    if (errorMessage.includes('auth') || errorMessage.includes('token')) {
      return new AuthenticationError(errorMessage, error);
    }

    // Rate limit errors
    if (
      errorMessage.includes('rate limit') ||
      errorMessage.includes('Rate limit')
    ) {
      return new RateLimitError(errorMessage, error);
    }

    // Validation errors
    if (errorMessage.includes('Invalid') || errorMessage.includes('invalid')) {
      return new ValidationError(errorMessage, error);
    }

    // Generic SDK error
    return new SDKError(errorMessage, 'UNKNOWN_ERROR', error);
  }
}
