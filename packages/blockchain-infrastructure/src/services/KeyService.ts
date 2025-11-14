/**
 * KeyService - Key Derivation and Type 42 Operations
 *
 * LEAF SERVICE (no service dependencies, uses @bsv/sdk directly)
 *
 * Responsibilities:
 * - Sub-key derivation from master keys using Type 42
 * - Type 42 ephemeral address generation
 * - Change address derivation
 * - Pure cryptographic operations
 *
 * CRITICAL: All public methods accept raw string identifiers.
 * Hashing is handled internally. NEVER pre-hash inputs - causes double-hashing.
 *
 * Example of WRONG usage:
 *   const hash = Hash.sha256("INV-001");
 *   keyService.deriveEphemeralAddress(sender, recipient, hash); // ❌ Double-hashed!
 *
 * Example of CORRECT usage:
 *   keyService.deriveEphemeralAddress(sender, recipient, "INV-001"); // ✅ Raw ID
 */

import { PrivateKey, PublicKey, Hash } from '@bsv/sdk';

export class KeyService {
  /**
   * No dependencies - uses @bsv/sdk directly
   */
  constructor() {
    // Stateless service - no initialization needed
  }

  /**
   * Internal helper to hash string inputs for key derivation.
   *
   * PRIVATE to prevent double-hashing:
   * - Callers pass raw IDs (invoice IDs, key paths)
   * - This method hashes them once for deriveChild()
   * - Double-hashing creates unreachable addresses → permanent fund loss
   *
   * @param input - Raw string identifier
   * @returns SHA256 hash as hex string for deriveChild()
   */
  private _hashDerivationInput(input: string): string {
    const hashBytes = Hash.sha256(input);
    return Buffer.from(hashBytes).toString('hex');
  }

  /**
   * Derive sub-key using Type 42 hierarchical derivation
   *
   * Uses "self-derivation": parent.deriveChild(parent.publicKey, hash(keyPath))
   * Allows hierarchical key organization (token, payment, etc.)
   *
   * @param parentKey - Parent private key
   * @param keyPath - Raw derivation path string (e.g., 'token', 'payment')
   * @returns Derived private key
   */
  deriveSubKey(parentKey: PrivateKey, keyPath: string): PrivateKey {
    const pathHash = this._hashDerivationInput(keyPath);
    const parentPubKey = parentKey.toPublicKey();
    return parentKey.deriveChild(parentPubKey, pathHash);
  }

  /**
   * Derive ephemeral address for Type 42 payment
   *
   * Type 42 ECDH protocol:
   * Address = recipientPubKey.deriveChild(senderPrivKey, hash(invoiceId)).toAddress()
   *
   * CRITICAL: Must use PublicKey.deriveChild(PrivateKey, hash) for ECDH symmetry!
   * This ensures recipient can recover the same key with PrivateKey.deriveChild(PublicKey, hash)
   *
   * @param senderPrivateKey - Sender's private key
   * @param recipientPublicKey - Recipient's public key
   * @param derivationId - Raw invoice ID string (e.g., "INV-001")
   * @returns Ephemeral address string
   */
  deriveEphemeralAddress(
    senderPrivateKey: PrivateKey,
    recipientPublicKey: PublicKey,
    derivationId: string
  ): string {
    const idHash = this._hashDerivationInput(derivationId);
    // ECDH: recipientPubKey.deriveChild(senderPrivKey) produces PUBLIC key
    const ephemeralPubKey = recipientPublicKey.deriveChild(senderPrivateKey, idHash);
    return ephemeralPubKey.toAddress().toString();
  }

  /**
   * Recover private key for received funds (Type 42)
   *
   * Type 42 recovery:
   * PrivKey = recipient.deriveChild(sender.publicKey, hash(invoiceId))
   *
   * Recipient uses this to spend from ephemeral address
   *
   * @param recipientPrivateKey - Recipient's master private key
   * @param senderPublicKey - Sender's public key
   * @param derivationId - Same raw invoice ID used during derivation
   * @returns Ephemeral private key for spending received funds
   */
  recoverEphemeralPrivateKey(
    recipientPrivateKey: PrivateKey,
    senderPublicKey: PublicKey,
    derivationId: string
  ): PrivateKey {
    const idHash = this._hashDerivationInput(derivationId);
    return recipientPrivateKey.deriveChild(senderPublicKey, idHash);
  }

  /**
   * Derive change address for transaction
   *
   * Uses self-derivation with modified invoice ID for privacy:
   * Change = sender.deriveChild(sender.publicKey, hash(invoiceId + "_change"))
   *
   * @param senderPrivateKey - Sender's private key
   * @param derivationId - Raw invoice ID string (e.g., "INV-001")
   * @returns Change address string
   */
  deriveChangeAddress(
    senderPrivateKey: PrivateKey,
    derivationId: string
  ): string {
    const senderPublicKey = senderPrivateKey.toPublicKey();
    const changeId = `${derivationId}_change`;

    // Self-derivation for change
    return this.deriveEphemeralAddress(
      senderPrivateKey,
      senderPublicKey,
      changeId
    );
  }

  /**
   * Batch derive ephemeral addresses for multiple recipients
   *
   * Optimized for split payments (merchant + tax authority in one transaction)
   *
   * @param senderPrivateKey - Sender's private key
   * @param recipients - Array of recipients with id and public key
   * @param invoiceId - Raw invoice ID string (e.g., "INV-001")
   * @returns Map of recipient IDs to derived addresses
   */
  batchDeriveAddresses(
    senderPrivateKey: PrivateKey,
    recipients: Array<{ id: string; publicKey: PublicKey }>,
    invoiceId: string
  ): Map<string, string> {
    const addresses = new Map<string, string>();

    for (const recipient of recipients) {
      const ephemeralAddress = this.deriveEphemeralAddress(
        senderPrivateKey,
        recipient.publicKey,
        invoiceId
      );
      addresses.set(recipient.id, ephemeralAddress);
    }

    return addresses;
  }

  /**
   * Verify Type 42 derivation correctness (round-trip test)
   *
   * Tests complete flow:
   * 1. Sender derives ephemeral address for recipient
   * 2. Recipient recovers private key for that address
   * 3. Verify recovered key produces the same address
   *
   * @param senderPrivateKey - Sender's private key
   * @param recipientPrivateKey - Recipient's private key
   * @param derivationId - Raw invoice ID or unique identifier
   * @returns true if derivation is valid (round-trip succeeds)
   */
  verifyDerivation(
    senderPrivateKey: PrivateKey,
    recipientPrivateKey: PrivateKey,
    derivationId: string
  ): boolean {
    const senderPublicKey = senderPrivateKey.toPublicKey();
    const recipientPublicKey = recipientPrivateKey.toPublicKey();

    // Step 1: Sender derives ephemeral address
    const derivedAddress = this.deriveEphemeralAddress(
      senderPrivateKey,
      recipientPublicKey,
      derivationId
    );

    // Step 2: Recipient recovers private key
    const recoveredPrivateKey = this.recoverEphemeralPrivateKey(
      recipientPrivateKey,
      senderPublicKey,
      derivationId
    );

    // Step 3: Check if recovered key produces the same address
    const recoveredAddress = recoveredPrivateKey.toAddress().toString();

    return derivedAddress === recoveredAddress;
  }
}
