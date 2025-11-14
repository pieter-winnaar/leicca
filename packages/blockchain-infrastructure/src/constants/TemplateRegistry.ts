/**
 * Template Registry - Maps template types to implementations
 *
 * CENTRAL REGISTRY for all script template types (lock + unlock).
 * This ensures consistent template usage across the system.
 *
 * NOTE: Type 42 is NOT a template type - it's just P2PKH with ephemeral keys.
 *       The key derivation happens in KeyService, not in the template.
 *
 * @see docs/03-PATTERNS/basket-label-tag-strategy.md
 */

import { P2PKH, LockingScript, type PrivateKey, type ScriptTemplateUnlock } from '@bsv/sdk';
import { BSV21ScriptTemplate } from '../services/BSV21ScriptTemplate';

/**
 * Template type constants
 * These are stored in customInstructions metadata
 */
export const TEMPLATE_TYPES = {
  P2PKH: 'p2pkh',
  BSV21: 'bsv21',
} as const;

export type TemplateType = typeof TEMPLATE_TYPES[keyof typeof TEMPLATE_TYPES];

/**
 * Script template interface with both lock and unlock methods
 */
interface ScriptTemplate {
  lock(...args: any[]): LockingScript;
  unlock(privateKey: PrivateKey): ScriptTemplateUnlock;
}

/**
 * Template registry mapping types to template instances
 */
export const TEMPLATE_REGISTRY: Record<TemplateType, ScriptTemplate> = {
  [TEMPLATE_TYPES.P2PKH]: {
    lock: (address: string) => new P2PKH().lock(address),
    unlock: (privateKey: PrivateKey) => new P2PKH().unlock(privateKey),
  },

  [TEMPLATE_TYPES.BSV21]: {
    lock: (tokenId: string, ownerAddress: string, amount: number = 1, decimals: number = 8) => {
      return new BSV21ScriptTemplate().lock(tokenId, ownerAddress, amount, decimals);
    },
    unlock: (privateKey: PrivateKey) => {
      return new BSV21ScriptTemplate().unlock(privateKey);
    },
  },
};

/**
 * Get locking script for given template type
 *
 * @param templateType - Template type constant
 * @param args - Arguments for lock method
 * @returns LockingScript
 */
export function getLockingScript(
  templateType: TemplateType,
  ...args: any[]
): LockingScript {
  const template = TEMPLATE_REGISTRY[templateType];
  if (!template) {
    throw new Error(`Unknown template type: ${templateType}`);
  }
  return template.lock(...args);
}

/**
 * Get unlock template for given type and key
 *
 * @param templateType - Template type constant
 * @param privateKey - Private key for unlocking
 * @returns ScriptTemplateUnlock instance
 */
export function getUnlockTemplate(
  templateType: TemplateType,
  privateKey: PrivateKey
): ScriptTemplateUnlock {
  const template = TEMPLATE_REGISTRY[templateType];
  if (!template) {
    throw new Error(`Unknown template type: ${templateType}`);
  }
  return template.unlock(privateKey);
}

/**
 * Validate template type
 *
 * @param templateType - Template type to validate
 * @returns True if valid template type
 */
export function isValidTemplateType(templateType: string): templateType is TemplateType {
  return Object.values(TEMPLATE_TYPES).includes(templateType as TemplateType);
}
