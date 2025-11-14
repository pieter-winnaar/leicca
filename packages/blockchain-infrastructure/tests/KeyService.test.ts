/**
 * KeyService Tests
 *
 * Tests Type 42 key derivation and ephemeral address generation
 * Uses @bsv/sdk directly (no wrapper services)
 */

import { describe, it, expect, vi } from 'vitest';
import { KeyService } from '../src/services/KeyService';
import { PrivateKey, PublicKey, Hash } from '@bsv/sdk';

describe('KeyService', () => {
  const keyService = new KeyService();

  // Test keys (static hex keys for deterministic tests)
  const senderPrivKey = PrivateKey.fromString('0000000000000000000000000000000000000000000000000000000000000001', 'hex');
  const recipientPrivKey = PrivateKey.fromString('0000000000000000000000000000000000000000000000000000000000000002', 'hex');
  const senderPubKey = senderPrivKey.toPublicKey();
  const recipientPubKey = recipientPrivKey.toPublicKey();

  describe('deriveSubKey', () => {
    it('should derive sub-key using Type 42', () => {
      const derivedKey = keyService.deriveSubKey(senderPrivKey, 'payment');

      expect(derivedKey).toBeDefined();
      expect(derivedKey).toBeInstanceOf(PrivateKey);
      // Derived key should be different from parent
      expect(derivedKey.toString()).not.toBe(senderPrivKey.toString());
    });

    it('should produce consistent derivations for same path', () => {
      const derived1 = keyService.deriveSubKey(senderPrivKey, 'payment');
      const derived2 = keyService.deriveSubKey(senderPrivKey, 'payment');

      expect(derived1.toString()).toBe(derived2.toString());
    });

    it('should produce different keys for different paths', () => {
      const paymentKey = keyService.deriveSubKey(senderPrivKey, 'payment');
      const tokenKey = keyService.deriveSubKey(senderPrivKey, 'token');

      expect(paymentKey.toString()).not.toBe(tokenKey.toString());
    });
  });

  describe('deriveEphemeralAddress', () => {
    it('should derive ephemeral address for Type 42 payment', () => {
      const address = keyService.deriveEphemeralAddress(
        senderPrivKey,
        recipientPubKey,
        'INV-001'
      );

      expect(address).toBeDefined();
      expect(typeof address).toBe('string');
      expect(address).toMatch(/^1[a-zA-Z0-9]{25,34}$/); // BSV address format
    });

    it('should produce consistent addresses for same invoice ID', () => {
      const address1 = keyService.deriveEphemeralAddress(
        senderPrivKey,
        recipientPubKey,
        'INV-001'
      );
      const address2 = keyService.deriveEphemeralAddress(
        senderPrivKey,
        recipientPubKey,
        'INV-001'
      );

      expect(address1).toBe(address2);
    });

    it('should produce different addresses for different invoice IDs', () => {
      const address1 = keyService.deriveEphemeralAddress(
        senderPrivKey,
        recipientPubKey,
        'INV-001'
      );
      const address2 = keyService.deriveEphemeralAddress(
        senderPrivKey,
        recipientPubKey,
        'INV-002'
      );

      expect(address1).not.toBe(address2);
    });
  });

  describe('recoverEphemeralPrivateKey', () => {
    it('should recover private key for ephemeral address', () => {
      // Derive ephemeral address
      const ephemeralAddress = keyService.deriveEphemeralAddress(
        senderPrivKey,
        recipientPubKey,
        'INV-001'
      );

      // Recover private key
      const recoveredKey = keyService.recoverEphemeralPrivateKey(
        recipientPrivKey,
        senderPubKey,
        'INV-001'
      );

      // Recovered key should produce the same address
      const recoveredAddress = recoveredKey.toAddress().toString();
      expect(recoveredAddress).toBe(ephemeralAddress);
    });
  });

  describe('deriveChangeAddress', () => {
    it('should derive change address with _change suffix', () => {
      const changeAddress = keyService.deriveChangeAddress(
        senderPrivKey,
        'INV-001'
      );

      expect(changeAddress).toBeDefined();
      expect(typeof changeAddress).toBe('string');
      expect(changeAddress).toMatch(/^1[a-zA-Z0-9]{25,34}$/);

      // Change address should be different from recipient address
      const recipientAddress = keyService.deriveEphemeralAddress(
        senderPrivKey,
        recipientPubKey,
        'INV-001'
      );
      expect(changeAddress).not.toBe(recipientAddress);
    });
  });

  describe('batchDeriveAddresses', () => {
    it('should derive multiple addresses for different recipients', () => {
      // Use static test keys
      const recipient1Key = PrivateKey.fromString('0000000000000000000000000000000000000000000000000000000000000003', 'hex');
      const recipient2Key = PrivateKey.fromString('0000000000000000000000000000000000000000000000000000000000000004', 'hex');
      const recipient1 = recipient1Key.toPublicKey();
      const recipient2 = recipient2Key.toPublicKey();

      const addresses = keyService.batchDeriveAddresses(
        senderPrivKey,
        [
          { id: 'merchant', publicKey: recipient1 },
          { id: 'tax-authority', publicKey: recipient2 },
        ],
        'INV-001'
      );

      expect(addresses.size).toBe(2);
      expect(addresses.get('merchant')).toBeDefined();
      expect(addresses.get('tax-authority')).toBeDefined();
      expect(addresses.get('merchant')).not.toBe(addresses.get('tax-authority'));
    });
  });

  describe('verifyDerivation', () => {
    it('should verify correct Type 42 round-trip', () => {
      const isValid = keyService.verifyDerivation(
        senderPrivKey,
        recipientPrivKey,
        'INV-001'
      );

      expect(isValid).toBe(true);
    });

    it('should return true for multiple verifications with same keys', () => {
      const isValid1 = keyService.verifyDerivation(
        senderPrivKey,
        recipientPrivKey,
        'INV-001'
      );
      const isValid2 = keyService.verifyDerivation(
        senderPrivKey,
        recipientPrivKey,
        'INV-001'
      );

      expect(isValid1).toBe(true);
      expect(isValid2).toBe(true);
    });
  });
});
