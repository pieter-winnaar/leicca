/**
 * BabbageChainTracker - Babbage Chaintracks API ChainTracker implementation
 *
 * Implements ChainTracker interface using Babbage Chaintracks service,
 * the purpose-built block header tracking service for SPV validation.
 *
 * LEAF SERVICE - No service dependencies
 *
 * External Dependencies:
 * - Babbage Chaintracks API (https://mainnet-chaintracks.babbage.systems)
 *
 * Features:
 * - Block header caching (LRU, 1000 blocks)
 * - No authentication required
 * - No rate limiting
 * - Response envelope handling: {status: "success", result: data}
 * - Purpose-built for SPV validation
 * - Automatic retry logic for connection errors
 *
 * @see docs/02-SPRINTS/sprint-3A.6-arc-endpoints-sdk-migration.md
 * @see docs/05-INTEGRATION/arc-provider-research.md (Babbage Chaintracks section)
 * @see docs/05-INTEGRATION/CHAINTRACKS_QUICK_REFERENCE.md
 */
import type { ChainTracker, BlockHeader, MerkleProof } from '../types';

/**
 * Babbage Chaintracks API response envelope
 */
interface ChaintracksResponse<T> {
  status: 'success' | 'error';
  code?: string;
  description?: string;
  value?: T;
}

/**
 * Babbage Chaintracks block header format
 */
interface ChaintracksBlockHeader {
  version: number;
  previousHash: string;
  merkleRoot: string;
  time: number;
  bits: number;
  nonce: number;
  height: number;
  hash: string;
}

/**
 * Babbage Chaintracks ChainTracker
 *
 * Verifies Merkle roots against Babbage Chaintracks API
 * Includes block header caching and automatic retries
 */
export class BabbageChainTracker implements ChainTracker {
  private readonly baseUrl: string;
  private readonly headerCache: Map<number, BlockHeader> = new Map();
  private readonly MAX_CACHE_SIZE = 1000; // LRU cache for 1000 blocks
  private readonly MAX_RETRIES = 3;

  constructor(network: 'main' | 'test' | 'stn' = 'main') {
    // Read from environment variable or use default
    const envUrl = process.env.CHAINTRACKS_BASE_URL;

    if (envUrl) {
      this.baseUrl = envUrl;
    } else {
      // Default URLs based on network
      switch (network) {
        case 'main':
          this.baseUrl = 'https://mainnet-chaintracks.babbage.systems';
          break;
        case 'test':
          this.baseUrl = 'https://testnet-chaintracks.babbage.systems';
          break;
        case 'stn':
          // Babbage Chaintracks doesn't have STN - fallback to mainnet
          console.warn(
            '[BabbageChainTracker] STN network not supported by Babbage Chaintracks, using mainnet'
          );
          this.baseUrl = 'https://mainnet-chaintracks.babbage.systems';
          break;
      }
    }

    console.log(`[BabbageChainTracker] Initialized with baseUrl: ${this.baseUrl}`);
  }

  /**
   * Verify Merkle root for block height
   *
   * @param merkleRoot - Merkle root to verify
   * @param height - Block height
   * @returns true if valid
   */
  async isValidRootForHeight(merkleRoot: string, height: number): Promise<boolean> {
    try {
      // Check cache first
      const cached = this.headerCache.get(height);
      if (cached) {
        return cached.merkleroot === merkleRoot;
      }

      // Fetch from API with retries
      const chaintracksHeader = await this.getBlockHeaderInternal(height);

      if (!chaintracksHeader) {
        return false;
      }

      // Convert to BlockHeader format and cache
      const blockHeader: BlockHeader = {
        hash: chaintracksHeader.hash,
        height: chaintracksHeader.height,
        merkleroot: chaintracksHeader.merkleRoot,
        confirmations: 1,
        time: chaintracksHeader.time,
      };

      this.cacheHeader(height, blockHeader);

      // Verify Merkle root
      return blockHeader.merkleroot === merkleRoot;
    } catch (error) {
      console.error('[BabbageChainTracker] Error verifying Merkle root:', error);
      return false;
    }
  }

  /**
   * Get current block height
   *
   * @returns Current block height
   */
  async currentHeight(): Promise<number> {
    try {
      const response = await this.fetchWithRetry<number>('/getPresentHeight');

      if (response === undefined) {
        console.error('[BabbageChainTracker] Failed to fetch current height');
        return 0;
      }

      return response;
    } catch (error) {
      console.error('[BabbageChainTracker] Error fetching current height:', error);
      return 0;
    }
  }

  /**
   * Get block header for height
   *
   * @param height - Block height
   * @returns Block header
   */
  async getBlockHeader(height: number): Promise<BlockHeader | null> {
    try {
      // Check cache
      const cached = this.headerCache.get(height);
      if (cached) return cached;

      // Fetch from API
      const chaintracksHeader = await this.getBlockHeaderInternal(height);

      if (!chaintracksHeader) {
        return null;
      }

      // Convert to BlockHeader format
      const blockHeader: BlockHeader = {
        hash: chaintracksHeader.hash,
        height: chaintracksHeader.height,
        merkleroot: chaintracksHeader.merkleRoot,
        confirmations: 1, // Chaintracks only returns confirmed blocks
        time: chaintracksHeader.time,
      };

      // Cache header
      this.cacheHeader(height, blockHeader);

      return blockHeader;
    } catch (error) {
      console.error('[BabbageChainTracker] Error fetching header:', error);
      return null;
    }
  }

  /**
   * Get Merkle proof for transaction
   *
   * Note: Babbage Chaintracks does not provide Merkle proof generation endpoints.
   * This method always returns null. Use WhatsOnChain for Merkle proof queries.
   *
   * @param _txid - Transaction ID (unused)
   * @returns null (not supported by Chaintracks)
   */
  async getMerkleProof(_txid: string): Promise<MerkleProof | null> {
    console.warn(
      '[BabbageChainTracker] getMerkleProof() not supported by Babbage Chaintracks. Use WhatsOnChain for Merkle proofs.'
    );
    return null;
  }

  /**
   * Internal method to fetch block header from Chaintracks API
   *
   * @param height - Block height
   * @returns Chaintracks block header or null
   */
  private async getBlockHeaderInternal(
    height: number
  ): Promise<ChaintracksBlockHeader | null> {
    const header = await this.fetchWithRetry<ChaintracksBlockHeader>(
      `/findHeaderHexForHeight?height=${height}`
    );

    return header ?? null;
  }

  /**
   * Fetch with automatic retry logic for connection errors
   *
   * @param path - API path
   * @returns Response data or undefined
   */
  private async fetchWithRetry<T>(path: string): Promise<T | undefined> {
    let lastError: Error | undefined = undefined;

    for (let retry = 0; retry < this.MAX_RETRIES; retry++) {
      try {
        const response = await fetch(`${this.baseUrl}${path}`);

        if (!response.ok) {
          console.error(
            `[BabbageChainTracker] HTTP ${response.status} for ${path}`
          );
          return undefined;
        }

        const data: ChaintracksResponse<T> = await response.json();

        if (data.status === 'success') {
          return data.value;
        } else {
          console.error(
            `[BabbageChainTracker] API error for ${path}: ${data.code} - ${data.description}`
          );
          return undefined;
        }
      } catch (e: unknown) {
        lastError = e as Error;

        // Only retry on connection reset errors
        if (lastError.name !== 'ECONNRESET') {
          break;
        }

        console.warn(
          `[BabbageChainTracker] Connection reset on attempt ${retry + 1}/${this.MAX_RETRIES}, retrying...`
        );
      }
    }

    if (lastError) {
      console.error('[BabbageChainTracker] Fetch failed after retries:', lastError);
    }

    return undefined;
  }

  /**
   * Cache block header with LRU eviction
   */
  private cacheHeader(height: number, header: BlockHeader): void {
    // LRU eviction if cache full
    if (this.headerCache.size >= this.MAX_CACHE_SIZE) {
      const firstKey = this.headerCache.keys().next().value;
      if (firstKey !== undefined) {
        this.headerCache.delete(firstKey);
      }
    }

    this.headerCache.set(height, header);
  }

  /**
   * Clear cache (for testing)
   */
  clearCache(): void {
    this.headerCache.clear();
  }

  /**
   * Get cache size (for testing)
   */
  getCacheSize(): number {
    return this.headerCache.size;
  }
}
