/**
 * WhatsOnChainChainTracker - WhatsOnChain API ChainTracker implementation
 *
 * Verifies Merkle roots against WhatsOnChain API.
 * Includes block header caching and rate limiting.
 *
 * LEAF SERVICE - No service dependencies
 *
 * External Dependencies:
 * - WhatsOnChain REST API (https://api.whatsonchain.com)
 *
 * Features:
 * - Block header caching (LRU, 1000 blocks)
 * - Rate limiting (3 req/sec free tier)
 * - Merkle proof retrieval
 * - Error handling for API failures
 *
 * @see docs/02-SPRINTS/sprint-3A.5-real-chaintracker.md
 */
import type { ChainTracker, BlockHeader, MerkleProof } from '../types';

/**
 * WhatsOnChain TSC Merkle proof response format
 * API returns an array with one TSC proof object
 */
interface TSCProofResponse {
  index: number;
  txOrId: string;
  target: string; // Block hash
  nodes: string[]; // Merkle path hashes
}

/**
 * WhatsOnChain UTXO response format
 */
export interface WhatsOnChainUTXO {
  height: number;
  tx_pos: number;
  tx_hash: string;
  value: number;
}

/**
 * WhatsOnChain API ChainTracker
 *
 * Verifies Merkle roots against WhatsOnChain API
 * Includes block header caching and rate limiting
 */
export class WhatsOnChainChainTracker implements ChainTracker {
  private readonly baseUrl: string;
  private readonly headerCache: Map<number, BlockHeader> = new Map();
  private readonly MAX_CACHE_SIZE = 1000; // LRU cache for 1000 blocks
  private requestCount = 0;
  private resetTime = Date.now() + 1000;

  constructor(network: 'main' | 'test' | 'stn' = 'main') {
    this.baseUrl = `https://api.whatsonchain.com/v1/bsv/${network}`;
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

      // Fetch from API with rate limiting
      await this.enforceRateLimit();

      const response = await fetch(`${this.baseUrl}/block/height/${height}`);

      if (!response.ok) {
        console.error(`[WhatsOnChain] Failed to fetch block ${height}: ${response.status}`);
        return false;
      }

      const block: BlockHeader = await response.json();

      // Cache header
      this.cacheHeader(height, block);

      // Verify Merkle root
      return block.merkleroot === merkleRoot && (block.confirmations ?? 0) > 0;
    } catch (error) {
      console.error('[WhatsOnChain] Error verifying Merkle root:', error);
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
      await this.enforceRateLimit();

      const response = await fetch(`${this.baseUrl}/chain/info`);

      if (!response.ok) {
        console.error(`[WhatsOnChain] Failed to fetch chain info: ${response.status}`);
        return 0;
      }

      const data = await response.json();
      return data.blocks || 0;
    } catch (error) {
      console.error('[WhatsOnChain] Error fetching current height:', error);
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
      await this.enforceRateLimit();

      const response = await fetch(`${this.baseUrl}/block/height/${height}`);

      if (!response.ok) return null;

      const block: BlockHeader = await response.json();
      this.cacheHeader(height, block);

      return block;
    } catch (error) {
      console.error('[WhatsOnChain] Error fetching header:', error);
      return null;
    }
  }

  /**
   * Get Merkle proof for transaction
   *
   * @param txid - Transaction ID
   * @returns Merkle proof
   */
  async getMerkleProof(txid: string): Promise<MerkleProof | null> {
    try {
      await this.enforceRateLimit();

      // WhatsOnChain V1 API: /tx/{hash}/proof/tsc returns TSC format (array)
      const response = await fetch(`${this.baseUrl}/tx/${txid}/proof/tsc`);

      if (!response.ok) {
        return null;
      }

      const proofArray: TSCProofResponse[] = await response.json();

      // Validate response is array with at least one proof
      if (!Array.isArray(proofArray) || proofArray.length === 0) {
        return null;
      }

      const tscProof = proofArray[0];
      if (!tscProof || !tscProof.nodes || !Array.isArray(tscProof.nodes)) {
        return null;
      }

      // Get block header from block hash (target) to get height and merkleroot
      await this.enforceRateLimit();
      const blockResponse = await fetch(`${this.baseUrl}/block/hash/${tscProof.target}`);

      if (!blockResponse.ok) {
        return null;
      }

      const blockHeader: BlockHeader = await blockResponse.json();

      // TSC proof: nodes are Merkle path hashes
      // The offset (L/R position) is determined by the transaction index bits
      // For each level, check if bit i of index is 0 (left) or 1 (right)
      const path = tscProof.nodes.map((hash, i) => ({
        offset: (tscProof.index >> i) & 1,
        hash,
      }));

      return {
        txid,
        blockHeight: blockHeader.height,
        merkleRoot: blockHeader.merkleroot,
        path,
        index: tscProof.index,
      };
    } catch (error) {
      console.error('[WhatsOnChain] Error fetching Merkle proof:', error);
      return null;
    }
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
   * Rate limiting: 3 requests/second (free tier)
   */
  private async enforceRateLimit(): Promise<void> {
    const now = Date.now();

    if (now > this.resetTime) {
      // Reset counter every second
      this.requestCount = 0;
      this.resetTime = now + 1000;
    }

    if (this.requestCount >= 3) {
      // Wait until reset
      const waitTime = this.resetTime - now;
      await new Promise((resolve) => setTimeout(resolve, waitTime));
      this.requestCount = 0;
      this.resetTime = Date.now() + 1000;
    }

    this.requestCount++;
  }

  /**
   * Get unspent outputs (UTXOs) for an address
   *
   * @param address - Bitcoin address
   * @param includeUnconfirmed - Include unconfirmed UTXOs (default: false)
   * @returns Array of UTXOs
   */
  async getAddressUtxos(
    address: string,
    includeUnconfirmed = false
  ): Promise<WhatsOnChainUTXO[]> {
    try {
      await this.enforceRateLimit();

      // Fetch confirmed UTXOs
      const confirmedResponse = await fetch(
        `${this.baseUrl}/address/${address}/unspent`
      );

      if (!confirmedResponse.ok) {
        console.error(
          `[WhatsOnChain] Failed to fetch UTXOs for ${address}: ${confirmedResponse.status}`
        );
        return [];
      }

      const confirmed: WhatsOnChainUTXO[] = await confirmedResponse.json();

      // Optionally fetch unconfirmed UTXOs
      if (includeUnconfirmed) {
        await this.enforceRateLimit();

        const unconfirmedResponse = await fetch(
          `${this.baseUrl}/address/${address}/unconfirmed/unspent`
        );

        if (unconfirmedResponse.ok) {
          const unconfirmedData = await unconfirmedResponse.json();
          // WhatsOnChain returns {result: [...]} for unconfirmed
          const unconfirmed: WhatsOnChainUTXO[] = unconfirmedData.result || [];
          return [...confirmed, ...unconfirmed];
        }
      }

      return confirmed;
    } catch (error) {
      console.error('[WhatsOnChain] Error fetching address UTXOs:', error);
      return [];
    }
  }

  /**
   * Get transaction hex
   *
   * @param txid - Transaction ID
   * @returns Transaction hex string
   */
  async getTransactionHex(txid: string): Promise<string | null> {
    try {
      await this.enforceRateLimit();

      const response = await fetch(`${this.baseUrl}/tx/${txid}/hex`);

      if (!response.ok) {
        console.error(
          `[WhatsOnChain] Failed to fetch tx hex for ${txid}: ${response.status}`
        );
        return null;
      }

      return await response.text();
    } catch (error) {
      console.error('[WhatsOnChain] Error fetching transaction hex:', error);
      return null;
    }
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
