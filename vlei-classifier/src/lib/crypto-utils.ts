/**
 * Compute SHA-256 hash of file contents
 *
 * @param file - File object from upload
 * @returns Hex-encoded SHA-256 hash (64-char string)
 */
export async function hashFile(file: File): Promise<string> {
  const buffer = await file.arrayBuffer();
  const hashBuffer = await crypto.subtle.digest('SHA-256', buffer);
  const hashArray = Array.from(new Uint8Array(hashBuffer));
  return hashArray.map(b => b.toString(16).padStart(2, '0')).join('');
}

/**
 * Compute SHA-256 hash of string data
 *
 * @param data - String to hash
 * @returns Hex-encoded SHA-256 hash (64-char string)
 */
export async function hashString(data: string): Promise<string> {
  const encoder = new TextEncoder();
  const buffer = encoder.encode(data);
  const hashBuffer = await crypto.subtle.digest('SHA-256', buffer);
  const hashArray = Array.from(new Uint8Array(hashBuffer));
  return hashArray.map(b => b.toString(16).padStart(2, '0')).join('');
}

/**
 * Convert hash to truncated display format
 *
 * @param hash - Full hex hash (64-char string)
 * @param prefixLen - Number of characters to show from start (default: 6)
 * @param suffixLen - Number of characters to show from end (default: 6)
 * @returns Shortened format: "abc123...def789"
 */
export function truncateHash(hash: string, prefixLen = 6, suffixLen = 6): string {
  if (hash.length <= prefixLen + suffixLen) {
    return hash;
  }
  return `${hash.slice(0, prefixLen)}...${hash.slice(-suffixLen)}`;
}
