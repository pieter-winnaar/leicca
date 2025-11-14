/**
 * BlockchainServices Facade Tests
 *
 * Comprehensive test suite for the BlockchainServices facade.
 * Tests all payment methods with correct basket strategy.
 *
 * @see packages/blockchain-infrastructure/src/facade/BlockchainServices.ts
 * @see docs/03-PATTERNS/basket-label-tag-strategy.md
 */

import { describe, it, expect, beforeEach, vi } from 'vitest';
import { PrivateKey, PublicKey } from '@bsv/sdk';
import { BlockchainServices } from '../src/facade/BlockchainServices';
import { BRC100WalletService } from '../src/services/BRC100WalletService';
import {
  BASKET_SATOSHIS,
  BASKET_OUTGOING,
  getTokenBasket,
  LABEL_PAYMENT_SENT,
  LABEL_TYPE42_SENT,
  LABEL_TOKEN_SENT,
  TAG_TYPE42,
  TAG_PAYMENT,
  TAG_CHANGE,
  TAG_TOKEN,
  getTokenIdTag,
} from '../src/constants/BasketStrategy';

describe('BlockchainServices Facade', () => {
  let blockchainServices: BlockchainServices;
  let mockBRC100Wallet: BRC100WalletService;

  // Test fixture: valid BSV address
  const TEST_ADDRESS = '1A1zP1eP5QGefi2DMPTfTL5SLmv7DivfNa'; // Genesis block address
  const testWIF = 'L1uyy5qTuGrVXrmrsvHWHgVzW9kKdrp27wBC7Vs6nZDTF2BRUVwy';
  const masterPublicKey = PrivateKey.fromWif(testWIF).toPublicKey().toString();

  beforeEach(() => {
    // Create mock wallet with address derivation methods
    mockBRC100Wallet = {
      createAction: vi.fn().mockResolvedValue({ txid: 'mocktxid123' }),
      listOutputs: vi.fn().mockResolvedValue({ outputs: [], totalOutputs: 0 }),
      getMasterAddress: vi.fn().mockReturnValue(TEST_ADDRESS),
      getMasterPublicKey: vi.fn().mockReturnValue(masterPublicKey),
      deriveRecipientAddress: vi.fn().mockReturnValue(TEST_ADDRESS),
      deriveChangeAddress: vi.fn().mockReturnValue(TEST_ADDRESS),
    } as unknown as BRC100WalletService;

    // Create facade instance using private constructor (for testing only)
    // In production, use BlockchainServices.create(sdkToken)
    blockchainServices = (BlockchainServices as any)['create']
      ? Object.create(BlockchainServices.prototype)
      : new (BlockchainServices as any)();
    (blockchainServices as any).brc100Wallet = mockBRC100Wallet;
    (blockchainServices as any).invoiceCounter = 0;
  });

  describe('sendPayment()', () => {
    it('should send regular payment with correct baskets', async () => {
      // Setup mock outputs
      vi.mocked(mockBRC100Wallet.listOutputs).mockResolvedValueOnce({
        outputs: [
          { outpoint: 'abc.0', satoshis: 10000, lockingScript: '', tags: [] },
        ],
        totalOutputs: 1,
      });

      await blockchainServices.sendPayment([{ address: TEST_ADDRESS, satoshis: 5000 }]);

      // Verify createAction was called with correct baskets
      expect(mockBRC100Wallet.createAction).toHaveBeenCalledWith(
        expect.objectContaining({
          labels: [LABEL_PAYMENT_SENT],
          outputs: expect.arrayContaining([
            expect.objectContaining({
              basket: BASKET_OUTGOING, // Payment goes to outgoing
              tags: [TAG_PAYMENT],
            }),
            expect.objectContaining({
              basket: BASKET_SATOSHIS, // Change returns to satoshis
              tags: [TAG_CHANGE],
            }),
          ]),
        })
      );
    });

    it('should send to multiple recipients', async () => {
      vi.mocked(mockBRC100Wallet.listOutputs).mockResolvedValueOnce({
        outputs: [
          { outpoint: 'abc.0', satoshis: 10000, lockingScript: '', tags: [] },
        ],
        totalOutputs: 1,
      });

      await blockchainServices.sendPayment([
        { address: TEST_ADDRESS, satoshis: 2000 },
        { address: TEST_ADDRESS, satoshis: 3000 },
      ]);

      const call = vi.mocked(mockBRC100Wallet.createAction).mock.calls[0][0];
      expect(call.outputs.filter(o => o.tags?.includes(TAG_PAYMENT))).toHaveLength(2);
      expect(call.outputs[0].satoshis).toBe(2000);
      expect(call.outputs[1].satoshis).toBe(3000);
    });

    it('should use LABEL_PAYMENT_SENT label', async () => {
      vi.mocked(mockBRC100Wallet.listOutputs).mockResolvedValueOnce({
        outputs: [
          { outpoint: 'abc.0', satoshis: 10000, lockingScript: '', tags: [] },
        ],
        totalOutputs: 1,
      });

      await blockchainServices.sendPayment([{ address: TEST_ADDRESS, satoshis: 5000 }]);

      expect(mockBRC100Wallet.createAction).toHaveBeenCalledWith(
        expect.objectContaining({
          labels: [LABEL_PAYMENT_SENT],
        })
      );
    });

    it('should use TAG_PAYMENT and TAG_CHANGE tags', async () => {
      vi.mocked(mockBRC100Wallet.listOutputs).mockResolvedValueOnce({
        outputs: [
          { outpoint: 'abc.0', satoshis: 10000, lockingScript: '', tags: [] },
        ],
        totalOutputs: 1,
      });

      await blockchainServices.sendPayment([{ address: TEST_ADDRESS, satoshis: 5000 }]);

      const call = vi.mocked(mockBRC100Wallet.createAction).mock.calls[0][0];
      expect(call.outputs[0].tags).toContain(TAG_PAYMENT);
      expect(call.outputs[1].tags).toContain(TAG_CHANGE);
    });

    it('should throw error if insufficient funds', async () => {
      vi.mocked(mockBRC100Wallet.listOutputs).mockResolvedValueOnce({
        outputs: [
          { outpoint: 'abc.0', satoshis: 100, lockingScript: '', tags: [] },
        ],
        totalOutputs: 1,
      });

      await expect(
        blockchainServices.sendPayment([{ address: '1RecipientAddress', satoshis: 5000 }])
      ).rejects.toThrow(/Insufficient funds/);
    });

    it('should throw error if no recipients', async () => {
      await expect(
        blockchainServices.sendPayment([])
      ).rejects.toThrow(/At least one recipient required/);
    });
  });

  describe('sendPrivatePayment()', () => {
    beforeEach(() => {
      vi.mocked(mockBRC100Wallet.listOutputs).mockResolvedValue({
        outputs: [
          { outpoint: 'abc.0', satoshis: 10000, lockingScript: '', tags: [] },
        ],
        totalOutputs: 1,
      });
    });

    it('should accept optional invoiceId parameter', async () => {
      const recipientPrivKey = PrivateKey.fromWif('KwDiBf89QgGbjEhKnhXJuH7LrciVrZi3qYjgd9M7rFU73sVHnoWn');
      const recipientPubKey = recipientPrivKey.toPublicKey();
      const result = await blockchainServices.sendPrivatePayment([{
        publicKey: recipientPubKey,
        satoshis: 5000,
        invoiceId: 'CUSTOM-INV-001',
      }]);

      expect(result.invoiceIds).toEqual(['CUSTOM-INV-001']);
    });

    it('should auto-generate invoiceId if not provided', async () => {
      const recipientPrivKey = PrivateKey.fromWif('KwDiBf89QgGbjEhKnhXJuH7LrciVrZi3qYjgd9M7rFU73sVHnoWn');
      const recipientPubKey = recipientPrivKey.toPublicKey();
      const result = await blockchainServices.sendPrivatePayment([{
        publicKey: recipientPubKey,
        satoshis: 5000,
      }]);

      expect(result.invoiceIds).toHaveLength(1);
      expect(result.invoiceIds[0]).toMatch(/^\d+-\d{3}-[a-f0-9]{4}$/);
    });

    it('should send to multiple recipients with mixed invoiceIds', async () => {
      const recipientPrivKey = PrivateKey.fromWif('KwDiBf89QgGbjEhKnhXJuH7LrciVrZi3qYjgd9M7rFU73sVHnoWn');
      const recipientPubKey = recipientPrivKey.toPublicKey();

      vi.mocked(mockBRC100Wallet.listOutputs).mockResolvedValueOnce({
        outputs: [
          { outpoint: 'abc.0', satoshis: 20000, lockingScript: '', tags: [] },
        ],
        totalOutputs: 1,
      });

      const result = await blockchainServices.sendPrivatePayment([
        { publicKey: recipientPubKey, satoshis: 2000 }, // Auto-generated
        { publicKey: recipientPubKey, satoshis: 3000, invoiceId: 'custom-bob' },
      ]);

      expect(result.invoiceIds).toHaveLength(2);
      expect(result.invoiceIds[0]).toMatch(/^\d+-\d{3}-[a-f0-9]{4}$/); // Auto-generated
      expect(result.invoiceIds[1]).toBe('custom-bob'); // Custom

      const call = vi.mocked(mockBRC100Wallet.createAction).mock.calls[0][0];
      expect(call.outputs.filter(o => o.tags?.includes(TAG_PAYMENT))).toHaveLength(2);
    });

    it('should accept recipientPublicKey (not address)', async () => {
      const recipientPrivKey = PrivateKey.fromWif('KwDiBf89QgGbjEhKnhXJuH7LrciVrZi3qYjgd9M7rFU73sVHnoWn');
      const recipientPubKey = recipientPrivKey.toPublicKey();
      await blockchainServices.sendPrivatePayment([{
        publicKey: recipientPubKey,
        satoshis: 5000,
      }]);

      // Verify deriveRecipientAddress was called with PublicKey (delegated to wallet)
      expect(mockBRC100Wallet.deriveRecipientAddress).toHaveBeenCalledWith(
        recipientPubKey,
        expect.any(String)
      );
    });

    it('should use wallet for address derivation', async () => {
      const recipientPrivKey = PrivateKey.fromWif('KwDiBf89QgGbjEhKnhXJuH7LrciVrZi3qYjgd9M7rFU73sVHnoWn');
      const recipientPubKey = recipientPrivKey.toPublicKey();
      await blockchainServices.sendPrivatePayment([{
        publicKey: recipientPubKey,
        satoshis: 5000,
      }]);

      expect(mockBRC100Wallet.deriveRecipientAddress).toHaveBeenCalledWith(
        recipientPubKey,
        expect.any(String)
      );
      expect(mockBRC100Wallet.deriveChangeAddress).toHaveBeenCalledWith(
        expect.any(String)
      );
    });

    it('should set payment output basket to BASKET_OUTGOING', async () => {
      const recipientPrivKey = PrivateKey.fromWif('KwDiBf89QgGbjEhKnhXJuH7LrciVrZi3qYjgd9M7rFU73sVHnoWn');
      const recipientPubKey = recipientPrivKey.toPublicKey();
      await blockchainServices.sendPrivatePayment([{
        publicKey: recipientPubKey,
        satoshis: 5000,
      }]);

      const call = vi.mocked(mockBRC100Wallet.createAction).mock.calls[0][0];
      expect(call.outputs[0].basket).toBe(BASKET_OUTGOING);
    });

    it('should set change output basket to BASKET_SATOSHIS (normal change)', async () => {
      const recipientPrivKey = PrivateKey.fromWif('KwDiBf89QgGbjEhKnhXJuH7LrciVrZi3qYjgd9M7rFU73sVHnoWn');
      const recipientPubKey = recipientPrivKey.toPublicKey();
      await blockchainServices.sendPrivatePayment([{
        publicKey: recipientPubKey,
        satoshis: 5000,
      }]);

      const call = vi.mocked(mockBRC100Wallet.createAction).mock.calls[0][0];
      const changeOutput = call.outputs.find(o => o.tags?.includes(TAG_CHANGE));
      expect(changeOutput?.basket).toBe(BASKET_SATOSHIS);
    });

    it('should NOT pre-hash invoiceId', async () => {
      const recipientPrivKey = PrivateKey.fromWif('KwDiBf89QgGbjEhKnhXJuH7LrciVrZi3qYjgd9M7rFU73sVHnoWn');
      const recipientPubKey = recipientPrivKey.toPublicKey();
      await blockchainServices.sendPrivatePayment([{
        publicKey: recipientPubKey,
        satoshis: 5000,
        invoiceId: 'INV-001',
      }]);

      // Verify raw string passed to deriveRecipientAddress (not hashed) - delegated to wallet
      expect(mockBRC100Wallet.deriveRecipientAddress).toHaveBeenCalledWith(
        recipientPubKey,
        'INV-001' // Raw string, NOT hashed
      );
    });

    it('should store metadata in customInstructions', async () => {
      const recipientPrivKey = PrivateKey.fromWif('KwDiBf89QgGbjEhKnhXJuH7LrciVrZi3qYjgd9M7rFU73sVHnoWn');
      const recipientPubKey = recipientPrivKey.toPublicKey();
      await blockchainServices.sendPrivatePayment([{
        publicKey: recipientPubKey,
        satoshis: 5000,
        invoiceId: 'INV-001',
        memo: 'Test payment',
      }]);

      const call = vi.mocked(mockBRC100Wallet.createAction).mock.calls[0][0];
      const metadata = JSON.parse(call.outputs[0].customInstructions!);

      expect(metadata.invoiceId).toBe('INV-001');
      expect(metadata.senderPublicKey).toBeDefined();
      expect(metadata.memo).toBe('Test payment');
    });

    it('should return txid and invoiceIds array', async () => {
      const recipientPrivKey = PrivateKey.fromWif('KwDiBf89QgGbjEhKnhXJuH7LrciVrZi3qYjgd9M7rFU73sVHnoWn');
      const recipientPubKey = recipientPrivKey.toPublicKey();
      const result = await blockchainServices.sendPrivatePayment([{
        publicKey: recipientPubKey,
        satoshis: 5000,
      }]);

      expect(result.txid).toBe('mocktxid123');
      expect(result.invoiceIds).toBeDefined();
      expect(result.invoiceIds).toHaveLength(1);
    });

    it('should throw error if no recipients', async () => {
      await expect(
        blockchainServices.sendPrivatePayment([])
      ).rejects.toThrow(/At least one recipient required/);
    });
  });

  describe('sendTokenPayment()', () => {
    const EUR_TOKEN_ID = 'abc123_0';
    const EUR_TICKER = 'EUR';

    beforeEach(() => {
      vi.mocked(mockBRC100Wallet.listOutputs).mockResolvedValue({
        outputs: [
          {
            outpoint: 'token.0',
            satoshis: 1000,
            lockingScript: '',
            tags: [TAG_TOKEN],
            customInstructions: JSON.stringify({ tokenAmount: '1000' }),
          },
        ],
        totalOutputs: 1,
      });
    });

    it('should use getTokenBasket(tokenId) for inputs', async () => {
      await blockchainServices.sendTokenPayment(
        EUR_TOKEN_ID,
        [{ address: TEST_ADDRESS, amount: '100' }]
      );

      // Verify listOutputs was called with correct basket
      expect(mockBRC100Wallet.listOutputs).toHaveBeenCalledWith(
        expect.objectContaining({
          basket: getTokenBasket(EUR_TOKEN_ID),
          tags: [TAG_TOKEN],
        })
      );
    });

    it('should send to multiple recipients', async () => {
      vi.mocked(mockBRC100Wallet.listOutputs).mockResolvedValueOnce({
        outputs: [
          {
            outpoint: 'token.0',
            satoshis: 1000,
            lockingScript: '',
            tags: [TAG_TOKEN],
            customInstructions: JSON.stringify({ tokenAmount: '1000' }),
          },
        ],
        totalOutputs: 1,
      });

      await blockchainServices.sendTokenPayment(
        EUR_TOKEN_ID,
        [
          { address: TEST_ADDRESS, amount: '50' },
          { address: TEST_ADDRESS, amount: '75' },
        ]
      );

      const call = vi.mocked(mockBRC100Wallet.createAction).mock.calls[0][0];
      const paymentOutputs = call.outputs.filter(o => o.tags?.includes(TAG_PAYMENT));
      expect(paymentOutputs).toHaveLength(2);
    });

    it('should send token output to BASKET_OUTGOING', async () => {
      await blockchainServices.sendTokenPayment(
        EUR_TOKEN_ID,
        [{ address: TEST_ADDRESS, amount: '100' }]
      );

      const call = vi.mocked(mockBRC100Wallet.createAction).mock.calls[0][0];
      expect(call.outputs[0].basket).toBe(BASKET_OUTGOING);
    });

    it('should return token change to getTokenBasket(tokenId)', async () => {
      await blockchainServices.sendTokenPayment(
        EUR_TOKEN_ID,
        [{ address: TEST_ADDRESS, amount: '100' }]
      );

      const call = vi.mocked(mockBRC100Wallet.createAction).mock.calls[0][0];
      const changeOutput = call.outputs.find(o => o.tags?.includes(TAG_CHANGE) && o.tags?.includes(TAG_TOKEN));
      expect(changeOutput?.basket).toBe(getTokenBasket(EUR_TOKEN_ID));
    });

    it('should use TAG_TOKEN and getTokenIdTag(ticker)', async () => {
      await blockchainServices.sendTokenPayment(
        EUR_TOKEN_ID,
        [{ address: TEST_ADDRESS, amount: '100' }]
      );

      const call = vi.mocked(mockBRC100Wallet.createAction).mock.calls[0][0];
      expect(call.outputs[0].tags).toContain(TAG_TOKEN);
      // When token not registered, uses first 6 chars as ticker: 'ABC123'
      expect(call.outputs[0].tags).toContain(getTokenIdTag(EUR_TOKEN_ID, 'ABC123'));
    });

    it('should use LABEL_TOKEN_SENT label', async () => {
      await blockchainServices.sendTokenPayment(
        EUR_TOKEN_ID,
        [{ address: TEST_ADDRESS, amount: '100' }]
      );

      expect(mockBRC100Wallet.createAction).toHaveBeenCalledWith(
        expect.objectContaining({
          labels: [LABEL_TOKEN_SENT],
        })
      );
    });

    it('should throw error if no recipients', async () => {
      await expect(
        blockchainServices.sendTokenPayment(EUR_TOKEN_ID, [])
      ).rejects.toThrow(/At least one recipient required/);
    });
  });

  describe('sendPrivateTokens()', () => {
    const EUR_TOKEN_ID = 'abc123_0';
    const EUR_TICKER = 'EUR';

    beforeEach(() => {
      vi.mocked(mockBRC100Wallet.listOutputs).mockResolvedValue({
        outputs: [
          {
            outpoint: 'token.0',
            satoshis: 1000,
            lockingScript: '',
            tags: [TAG_TOKEN],
            customInstructions: JSON.stringify({ tokenAmount: '1000' }),
          },
        ],
        totalOutputs: 1,
      });
    });

    it('should send private token payment with Type 42', async () => {
      const recipientPrivKey = PrivateKey.fromWif('KwDiBf89QgGbjEhKnhXJuH7LrciVrZi3qYjgd9M7rFU73sVHnoWn');
      const recipientPubKey = recipientPrivKey.toPublicKey();
      await blockchainServices.sendPrivateTokens(
        EUR_TOKEN_ID,
        [{ publicKey: recipientPubKey, amount: '100' }]
      );

      const call = vi.mocked(mockBRC100Wallet.createAction).mock.calls[0][0];
      expect(call.labels).toContain(LABEL_TYPE42_SENT);
      expect(call.labels).toContain(LABEL_TOKEN_SENT);
      expect(call.outputs[0].tags).toContain(TAG_TYPE42);
      expect(call.outputs[0].tags).toContain(TAG_TOKEN);
    });

    it('should auto-generate invoiceId if not provided', async () => {
      const recipientPrivKey = PrivateKey.fromWif('KwDiBf89QgGbjEhKnhXJuH7LrciVrZi3qYjgd9M7rFU73sVHnoWn');
      const recipientPubKey = recipientPrivKey.toPublicKey();
      const result = await blockchainServices.sendPrivateTokens(
        EUR_TOKEN_ID,
        [{ publicKey: recipientPubKey, amount: '100' }]
      );

      expect(result.invoiceIds).toHaveLength(1);
      expect(result.invoiceIds[0]).toMatch(/^\d+-\d{3}-[a-f0-9]{4}$/);
    });

    it('should accept custom invoiceId', async () => {
      const recipientPrivKey = PrivateKey.fromWif('KwDiBf89QgGbjEhKnhXJuH7LrciVrZi3qYjgd9M7rFU73sVHnoWn');
      const recipientPubKey = recipientPrivKey.toPublicKey();
      const result = await blockchainServices.sendPrivateTokens(
        EUR_TOKEN_ID,
        [{ publicKey: recipientPubKey, amount: '100', invoiceId: 'TOKEN-INV-001' }]
      );

      expect(result.invoiceIds).toEqual(['TOKEN-INV-001']);
    });

    it('should send to multiple recipients with mixed invoiceIds', async () => {
      const recipientPrivKey = PrivateKey.fromWif('KwDiBf89QgGbjEhKnhXJuH7LrciVrZi3qYjgd9M7rFU73sVHnoWn');
      const recipientPubKey = recipientPrivKey.toPublicKey();

      vi.mocked(mockBRC100Wallet.listOutputs).mockResolvedValueOnce({
        outputs: [
          {
            outpoint: 'token.0',
            satoshis: 1000,
            lockingScript: '',
            tags: [TAG_TOKEN],
            customInstructions: JSON.stringify({ tokenAmount: '1000' }),
          },
        ],
        totalOutputs: 1,
      });

      const result = await blockchainServices.sendPrivateTokens(
        EUR_TOKEN_ID,
        [
          { publicKey: recipientPubKey, amount: '50' }, // Auto-generated
          { publicKey: recipientPubKey, amount: '75', invoiceId: 'custom-token-bob' },
        ]
      );

      expect(result.invoiceIds).toHaveLength(2);
      expect(result.invoiceIds[0]).toMatch(/^\d+-\d{3}-[a-f0-9]{4}$/); // Auto-generated
      expect(result.invoiceIds[1]).toBe('custom-token-bob'); // Custom

      const call = vi.mocked(mockBRC100Wallet.createAction).mock.calls[0][0];
      const paymentOutputs = call.outputs.filter(o => o.tags?.includes(TAG_PAYMENT));
      expect(paymentOutputs).toHaveLength(2);
    });

    it('should store Type 42 metadata for tokens', async () => {
      const recipientPrivKey = PrivateKey.fromWif('KwDiBf89QgGbjEhKnhXJuH7LrciVrZi3qYjgd9M7rFU73sVHnoWn');
      const recipientPubKey = recipientPrivKey.toPublicKey();
      await blockchainServices.sendPrivateTokens(
        EUR_TOKEN_ID,
        [{ publicKey: recipientPubKey, amount: '100', invoiceId: 'TOKEN-001' }]
      );

      const call = vi.mocked(mockBRC100Wallet.createAction).mock.calls[0][0];
      const metadata = JSON.parse(call.outputs[0].customInstructions!);

      expect(metadata.invoiceId).toBe('TOKEN-001');
      expect(metadata.tokenId).toBe(EUR_TOKEN_ID);
      expect(metadata.tokenAmount).toBe('100');
    });

    it('should send token output to BASKET_OUTGOING', async () => {
      const recipientPrivKey = PrivateKey.fromWif('KwDiBf89QgGbjEhKnhXJuH7LrciVrZi3qYjgd9M7rFU73sVHnoWn');
      const recipientPubKey = recipientPrivKey.toPublicKey();
      await blockchainServices.sendPrivateTokens(
        EUR_TOKEN_ID,
        [{ publicKey: recipientPubKey, amount: '100' }]
      );

      const call = vi.mocked(mockBRC100Wallet.createAction).mock.calls[0][0];
      expect(call.outputs[0].basket).toBe(BASKET_OUTGOING);
    });

    it('should return token change to getTokenBasket(tokenId)', async () => {
      const recipientPrivKey = PrivateKey.fromWif('KwDiBf89QgGbjEhKnhXJuH7LrciVrZi3qYjgd9M7rFU73sVHnoWn');
      const recipientPubKey = recipientPrivKey.toPublicKey();
      await blockchainServices.sendPrivateTokens(
        EUR_TOKEN_ID,
        [{ publicKey: recipientPubKey, amount: '100' }]
      );

      const call = vi.mocked(mockBRC100Wallet.createAction).mock.calls[0][0];
      const changeOutput = call.outputs.find(o => o.tags?.includes(TAG_CHANGE) && o.tags?.includes(TAG_TOKEN));
      expect(changeOutput?.basket).toBe(getTokenBasket(EUR_TOKEN_ID));
    });

    it('should use TAG_TYPE42 and TAG_TOKEN tags', async () => {
      const recipientPrivKey = PrivateKey.fromWif('KwDiBf89QgGbjEhKnhXJuH7LrciVrZi3qYjgd9M7rFU73sVHnoWn');
      const recipientPubKey = recipientPrivKey.toPublicKey();
      await blockchainServices.sendPrivateTokens(
        EUR_TOKEN_ID,
        [{ publicKey: recipientPubKey, amount: '100' }]
      );

      const call = vi.mocked(mockBRC100Wallet.createAction).mock.calls[0][0];
      expect(call.outputs[0].tags).toContain(TAG_TYPE42);
      expect(call.outputs[0].tags).toContain(TAG_TOKEN);
    });

    it('should return txid and invoiceIds array', async () => {
      const recipientPrivKey = PrivateKey.fromWif('KwDiBf89QgGbjEhKnhXJuH7LrciVrZi3qYjgd9M7rFU73sVHnoWn');
      const recipientPubKey = recipientPrivKey.toPublicKey();
      const result = await blockchainServices.sendPrivateTokens(
        EUR_TOKEN_ID,
        [{ publicKey: recipientPubKey, amount: '100' }]
      );

      expect(result.txid).toBe('mocktxid123');
      expect(result.invoiceIds).toBeDefined();
      expect(result.invoiceIds).toHaveLength(1);
    });

    it('should throw error if no recipients', async () => {
      await expect(
        blockchainServices.sendPrivateTokens(EUR_TOKEN_ID, [])
      ).rejects.toThrow(/At least one recipient required/);
    });
  });

  describe('Balance queries', () => {
    it('should get BSV balance from BASKET_SATOSHIS', async () => {
      vi.mocked(mockBRC100Wallet.listOutputs).mockResolvedValueOnce({
        outputs: [
          { outpoint: 'abc.0', satoshis: 10000, lockingScript: '', tags: [] },
          { outpoint: 'def.0', satoshis: 5000, lockingScript: '', tags: [] },
        ],
        totalOutputs: 2,
      });

      const balance = await blockchainServices.getBalance();

      expect(balance).toBe(15000);
      expect(mockBRC100Wallet.listOutputs).toHaveBeenCalledWith({
        basket: BASKET_SATOSHIS,
      });
    });

    it('should get token balance from getTokenBasket(tokenId)', async () => {
      const EUR_TOKEN_ID = 'abc123_0';

      vi.mocked(mockBRC100Wallet.listOutputs).mockResolvedValueOnce({
        outputs: [
          {
            outpoint: 'token.0',
            satoshis: 1000,
            lockingScript: '',
            tags: [TAG_TOKEN],
            customInstructions: JSON.stringify({ tokenAmount: '500' }),
          },
          {
            outpoint: 'token.1',
            satoshis: 1000,
            lockingScript: '',
            tags: [TAG_TOKEN],
            customInstructions: JSON.stringify({ tokenAmount: '300' }),
          },
        ],
        totalOutputs: 2,
      });

      const balance = await blockchainServices.getTokenBalance(EUR_TOKEN_ID);

      expect(balance).toBe('800'); // 500 + 300
      expect(mockBRC100Wallet.listOutputs).toHaveBeenCalledWith({
        basket: getTokenBasket(EUR_TOKEN_ID),
        tags: [TAG_TOKEN],
        includeCustomInstructions: true,
      });
    });
  });

  describe('invoiceId generation', () => {
    it('should generate unique invoiceId', async () => {
      const recipientPrivKey = PrivateKey.fromWif('KwDiBf89QgGbjEhKnhXJuH7LrciVrZi3qYjgd9M7rFU73sVHnoWn');
      const recipientPubKey = recipientPrivKey.toPublicKey();

      vi.mocked(mockBRC100Wallet.listOutputs).mockResolvedValue({
        outputs: [
          { outpoint: 'abc.0', satoshis: 10000, lockingScript: '', tags: [] },
        ],
        totalOutputs: 1,
      });

      const result1 = await blockchainServices.sendPrivatePayment([
        { publicKey: recipientPubKey, satoshis: 5000 }
      ]);
      const result2 = await blockchainServices.sendPrivatePayment([
        { publicKey: recipientPubKey, satoshis: 5000 }
      ]);

      expect(result1.invoiceIds[0]).not.toBe(result2.invoiceIds[0]);
    });

    it('should increment counter for successive payments', async () => {
      const recipientPrivKey = PrivateKey.fromWif('KwDiBf89QgGbjEhKnhXJuH7LrciVrZi3qYjgd9M7rFU73sVHnoWn');
      const recipientPubKey = recipientPrivKey.toPublicKey();

      vi.mocked(mockBRC100Wallet.listOutputs).mockResolvedValue({
        outputs: [
          { outpoint: 'abc.0', satoshis: 10000, lockingScript: '', tags: [] },
        ],
        totalOutputs: 1,
      });

      const result1 = await blockchainServices.sendPrivatePayment([
        { publicKey: recipientPubKey, satoshis: 5000 }
      ]);
      const result2 = await blockchainServices.sendPrivatePayment([
        { publicKey: recipientPubKey, satoshis: 5000 }
      ]);

      // Extract counter from invoiceId (format: timestamp-counter-random)
      const counter1 = parseInt(result1.invoiceIds[0].split('-')[1]);
      const counter2 = parseInt(result2.invoiceIds[0].split('-')[1]);

      // Counter should increase (exact increment may vary due to change invoiceIds)
      expect(counter2).toBeGreaterThan(counter1);
    });

    it('should use timestamp-counter-random format', async () => {
      const recipientPrivKey = PrivateKey.fromWif('KwDiBf89QgGbjEhKnhXJuH7LrciVrZi3qYjgd9M7rFU73sVHnoWn');
      const recipientPubKey = recipientPrivKey.toPublicKey();

      vi.mocked(mockBRC100Wallet.listOutputs).mockResolvedValue({
        outputs: [
          { outpoint: 'abc.0', satoshis: 10000, lockingScript: '', tags: [] },
        ],
        totalOutputs: 1,
      });

      const result = await blockchainServices.sendPrivatePayment([
        { publicKey: recipientPubKey, satoshis: 5000 }
      ]);

      // Verify format: timestamp-counter-random
      // Example: "1697456789123-001-a3f9"
      const parts = result.invoiceIds[0].split('-');
      expect(parts).toHaveLength(3);
      expect(parts[0]).toMatch(/^\d+$/); // Timestamp (digits)
      expect(parts[1]).toMatch(/^\d{3}$/); // Counter (3 digits)
      expect(parts[2]).toMatch(/^[a-f0-9]{4}$/); // Random (4 hex chars)
    });
  });

  describe('Integration: ActionInput field validation', () => {
    it('should populate sourceTXID in sendPayment', async () => {
      const mockWallet = {
        listOutputs: vi.fn().mockResolvedValue({
          totalOutputs: 1,
          outputs: [{
            outpoint: 'abc123.0',
            satoshis: 10000,
            lockingScript: '76a914abcdef88ac',
            tags: []
          }]
        }),
        createAction: vi.fn((args) => {
          // Verify first input has sourceTXID
          expect(args.inputs[0].sourceTXID).toBe('abc123');
          return Promise.resolve({ txid: 'def456', tx: 'beef...' });
        }),
        getMasterAddress: vi.fn().mockReturnValue(TEST_ADDRESS),
        getMasterPublicKey: vi.fn().mockReturnValue(masterPublicKey),
      };

      const service = Object.create(BlockchainServices.prototype);
      (service as any).brc100Wallet = mockWallet;
      (service as any).invoiceCounter = 0;

      await service.sendPayment([{ address: '1A1zP1eP5QGefi2DMPTfTL5SLmv7DivfNa', satoshis: 1000 }]);

      expect(mockWallet.createAction).toHaveBeenCalled();
    });

    it('should populate sourceOutputIndex in sendPayment', async () => {
      const mockWallet = {
        listOutputs: vi.fn().mockResolvedValue({
          totalOutputs: 1,
          outputs: [{
            outpoint: 'abc123.5',  // vout = 5
            satoshis: 10000,
            lockingScript: '76a914abcdef88ac',
            tags: []
          }]
        }),
        createAction: vi.fn((args) => {
          expect(args.inputs[0].sourceOutputIndex).toBe(5);
          return Promise.resolve({ txid: 'def456', tx: 'beef...' });
        }),
        getMasterAddress: vi.fn().mockReturnValue(TEST_ADDRESS),
        getMasterPublicKey: vi.fn().mockReturnValue(masterPublicKey),
      };

      const service = Object.create(BlockchainServices.prototype);
      (service as any).brc100Wallet = mockWallet;
      (service as any).invoiceCounter = 0;

      await service.sendPayment([{ address: '1A1zP1eP5QGefi2DMPTfTL5SLmv7DivfNa', satoshis: 1000 }]);

      expect(mockWallet.createAction).toHaveBeenCalled();
    });

    it('should pass lockingScript as unlockingScript', async () => {
      const testLockingScript = '76a914abc88ac';

      const mockWallet = {
        listOutputs: vi.fn().mockResolvedValue({
          totalOutputs: 1,
          outputs: [{
            outpoint: 'abc123.0',
            satoshis: 10000,
            lockingScript: testLockingScript,
            tags: []
          }]
        }),
        createAction: vi.fn((args) => {
          expect(args.inputs[0].unlockingScript).toBe(testLockingScript);
          return Promise.resolve({ txid: 'def456', tx: 'beef...' });
        }),
        getMasterAddress: vi.fn().mockReturnValue(TEST_ADDRESS),
        getMasterPublicKey: vi.fn().mockReturnValue(masterPublicKey),
      };

      const service = Object.create(BlockchainServices.prototype);
      (service as any).brc100Wallet = mockWallet;
      (service as any).invoiceCounter = 0;

      await service.sendPayment([{ address: '1A1zP1eP5QGefi2DMPTfTL5SLmv7DivfNa', satoshis: 1000 }]);

      expect(mockWallet.createAction).toHaveBeenCalled();
    });
  });
});
