/**
 * BroadcastService - INTERMEDIATE SERVICE
 *
 * Depends on: MintBlueSDKService (leaf)
 *
 * Responsibilities:
 * - Broadcast transactions to BSV network
 * - Multi-project/provider coordination
 * - Client caching and reuse
 *
 * Future: Provider abstraction (ARC, WhatsOnChain, GorillaPool, etc.)
 * Current: Delegates to MintBlue SDK via MintBlueSDKService
 */

import { MintBlueSDKService } from '@design-system-demo/sdk-integration';
import type { MintblueClient } from '@design-system-demo/sdk-integration';

export interface ProjectConfig {
  projectId: string;
  sdkToken: string;
}

export interface BroadcastResult {
  projectId: string;
  txid: string;
  success: boolean;
  error?: string;
}

export class BroadcastService {
  // Cache for project clients (avoid re-creating)
  private clientCache: Map<string, MintblueClient> = new Map();

  constructor(private readonly mintblueSDK: MintBlueSDKService) {
    // CRITICAL: All dependencies INJECTED - NEVER instantiate internally
    // Dependencies: MintBlueSDKService for SDK operations
  }

  /**
   * Configure SDK client for specific project
   *
   * @param config - Project configuration with sdkToken and projectId
   * @param createFn - Optional create function for testing
   * @returns Configured SDK client for this project
   */
  async configureClient(
    config: ProjectConfig,
    createFn?: (config: { token: string }) => Promise<MintblueClient>
  ): Promise<MintblueClient> {
    // Check cache first
    if (this.clientCache.has(config.projectId)) {
      return this.clientCache.get(config.projectId)!;
    }

    // Create new client via MintBlueSDKService
    const client = await this.mintblueSDK.createClient(
      config.sdkToken,
      createFn
    );

    // Cache for reuse
    this.clientCache.set(config.projectId, client);

    return client;
  }

  /**
   * Broadcast transaction to specific project
   *
   * Looks up cached client by projectId. Client must be configured first via configureClient().
   *
   * @param projectId - Target project ID
   * @param tx - Transaction hex string (pre-signed raw transaction)
   * @returns Broadcast result with txid
   */
  async broadcast(projectId: string, tx: string): Promise<BroadcastResult> {
    try {
      // Look up client from cache
      const client = this.clientCache.get(projectId);
      if (!client) {
        throw new Error(
          `No client configured for project ${projectId}. Call configureClient() first.`
        );
      }

      const result = await this.mintblueSDK.broadcastTransaction(
        client,
        tx,
        projectId
      );

      return {
        projectId,
        txid: result.txid,
        success: result.success,
      };
    } catch (error) {
      return {
        projectId,
        txid: '',
        success: false,
        error: error instanceof Error ? error.message : String(error),
      };
    }
  }

  /**
   * Broadcast to multiple projects (for atomic splits)
   *
   * @param configs - Array of project configurations
   * @param tx - Transaction hex string (same tx broadcast to multiple projects)
   * @param createFn - Optional create function for testing
   * @returns Array of broadcast results
   */
  async broadcastMultiple(
    configs: ProjectConfig[],
    tx: string,
    createFn?: (config: { token: string }) => Promise<MintblueClient>
  ): Promise<BroadcastResult[]> {
    const results: BroadcastResult[] = [];

    // Broadcast to each project sequentially
    for (const config of configs) {
      try {
        await this.configureClient(config, createFn);
        const result = await this.broadcast(config.projectId, tx);
        results.push(result);
      } catch (error) {
        results.push({
          projectId: config.projectId,
          txid: '',
          success: false,
          error: error instanceof Error ? error.message : String(error),
        });
      }
    }

    return results;
  }

  /**
   * Clear client cache (useful for testing or when credentials change)
   */
  clearCache(): void {
    this.clientCache.clear();
  }

  /**
   * Get cached client for project (if exists)
   *
   * @param projectId - Project ID
   * @returns Cached client or undefined
   */
  getCachedClient(projectId: string): MintblueClient | undefined {
    return this.clientCache.get(projectId);
  }
}
