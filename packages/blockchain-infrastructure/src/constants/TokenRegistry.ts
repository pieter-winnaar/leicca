/**
 * Token Registry
 *
 * Centralized mapping of tokenId (txid_vout) to token ticker.
 * Allows getTicker() to retrieve human-readable token symbols.
 *
 * @see docs/03-PATTERNS/template-registry-pattern.md
 */

/**
 * Token registry mapping tokenId to ticker
 *
 * Format: { 'txid_vout': 'TICKER' }
 *
 * @example
 * {
 *   'abc123def456...789_0': 'EUR',
 *   'def456abc789...123_0': 'USD',
 * }
 */
export const TOKEN_REGISTRY: Record<string, string> = {
  // Add token mappings here as they are discovered/registered
  // Example:
  // 'abc123def456789012345678901234567890123456789012345678901234_0': 'EUR',
};

/**
 * Get ticker from tokenId
 *
 * @param tokenId - Token identifier (format: "txid_vout")
 * @returns Token ticker (e.g., 'EUR', 'USD') or fallback to first 6 chars
 */
export function getTickerFromTokenId(tokenId: string): string {
  // Look up in registry first
  const ticker = TOKEN_REGISTRY[tokenId];
  if (ticker) {
    return ticker;
  }

  // Fallback: use first 6 chars of txid as ticker
  return tokenId.substring(0, 6).toUpperCase();
}

/**
 * Register a new token
 *
 * @param tokenId - Token identifier (format: "txid_vout")
 * @param ticker - Token ticker (e.g., 'EUR', 'USD')
 */
export function registerToken(tokenId: string, ticker: string): void {
  TOKEN_REGISTRY[tokenId] = ticker;
}
