/**
 * SD-JWT Hasher Utility
 *
 * Provides SHA-256 hasher function for SD-JWT verification as per SD-JWT spec.
 * Extracted to utility to keep service files under 300 lines.
 */

import { createHash } from 'crypto';

/**
 * Create a SHA-256 hasher function for SD-JWT verification
 * @returns Hasher function that takes string or ArrayBuffer and returns Uint8Array hash
 */
export function createSDJWTHasher(): (data: string | ArrayBuffer) => Promise<Uint8Array> {
  return async (data: string | ArrayBuffer): Promise<Uint8Array> => {
    const dataToHash = typeof data === 'string' ? data : Buffer.from(data);
    const hash = createHash('sha256').update(dataToHash).digest();
    return new Uint8Array(hash);
  };
}
