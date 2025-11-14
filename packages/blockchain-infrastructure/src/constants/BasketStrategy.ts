/**
 * Basket Strategy Constants
 *
 * Centralized basket, label, and tag naming conventions.
 * Follows docs/03-PATTERNS/basket-label-tag-strategy.md
 *
 * @see docs/03-PATTERNS/basket-label-tag-strategy.md
 */

// ==================== BASKETS ====================

/**
 * BSV satoshis basket
 * Purpose: Regular BSV payments, claimed Type 42 payments
 */
export const BASKET_SATOSHIS = 'satoshis';

/**
 * Outgoing basket
 * Purpose: Type 42 change outputs (sender perspective)
 * Recipients scan this basket to claim payments
 */
export const BASKET_OUTGOING = 'outgoing';

/**
 * Get token-specific basket name
 *
 * Each token gets its own basket (NOT a single 'tokens' basket).
 *
 * @param tokenId - Token identifier (e.g., "abc123_0")
 * @returns Lowercase token basket name
 *
 * @example
 * getTokenBasket('EUR_TOKEN_abc123_0') // 'eur_token_abc123_0'
 */
export function getTokenBasket(tokenId: string): string {
  return tokenId.toLowerCase();
}

// ==================== LABELS ====================

/**
 * Labels classify ACTIONS (action.labels)
 */

export const LABEL_PAYMENT_SENT = 'payment-sent';
export const LABEL_PAYMENT_RECEIVED = 'payment-received';
export const LABEL_TYPE42_SENT = 'type42-sent';
export const LABEL_TYPE42_CLAIMED = 'type42-claimed';
export const LABEL_TOKEN_SENT = 'token-sent';
export const LABEL_TOKEN_RECEIVED = 'token-received';

// ==================== TAGS ====================

/**
 * Tags classify OUTPUTS (output.tags)
 */

export const TAG_TYPE42 = 'type42';
export const TAG_CLAIMED = 'claimed';
export const TAG_CHANGE = 'change';
export const TAG_TOKEN = 'token';
export const TAG_PAYMENT = 'payment';

/**
 * Get token ID tag for filtering
 *
 * Allows querying outputs by specific token ID and ticker.
 *
 * @param tokenId - Full token identifier in format "txid_vout" (e.g., "abc123def456_0")
 * @param ticker - Token ticker (e.g., 'EUR', 'USD')
 * @returns Tag string in format "tokenId:ticker"
 *
 * @example
 * getTokenIdTag('abc123def456_0', 'EUR') // 'tokenId:abc123def456_0:EUR'
 */
export function getTokenIdTag(tokenId: string, ticker: string): string {
  return `tokenId:${tokenId}:${ticker}`;
}