/**
 * BlockchainServices Facade
 *
 * High-level API for common blockchain operations with correct basket strategy.
 * Follows docs/03-PATTERNS/basket-label-tag-strategy.md exactly.
 *
 * CRITICAL DESIGN PRINCIPLES:
 * - ALL change must go back to origin basket at all times
 * - Token transactions need BOTH token inputs AND satoshi inputs (for fees)
 * - Token input amounts MUST equal token output amounts (validated)
 * - Type 42 change goes to origin basket WITH Type 42 metadata (NOT BASKET_OUTGOING)
 * - BASKET_OUTGOING is for recipients to scan/claim ONLY
 *
 * @see docs/03-PATTERNS/basket-label-tag-strategy.md
 * @see docs/02-SPRINTS/sprint-3A.4-blockchain-facade.md
 */

import { PublicKey, PrivateKey, P2PKH } from '@bsv/sdk';
import { BRC100WalletService } from '../services/BRC100WalletService';
import { KeyService } from '../services/KeyService';
import type { ActionOutput } from '../types/index';
import { MintBlueSDKService, type MintblueClient } from '@design-system-demo/sdk-integration';
import { TransactionBuilderService } from '../services/TransactionBuilderService';
import { BEEFService } from '../services/BEEFService';
import { BroadcastService } from '../services/BroadcastService';
import { ChainTrackerFactory } from '../services/ChainTrackerFactory';
import { BlockHeaderListener } from '../services/BlockHeaderListener';

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
} from '../constants/BasketStrategy';
import {
  getLockingScript,
  getUnlockTemplate,
  isValidTemplateType,
  TEMPLATE_TYPES,
  type TemplateType,
} from '../constants/TemplateRegistry';
import { getTickerFromTokenId } from '../constants/TokenRegistry';

/**
 * Blockchain Services Facade
 *
 * Provides developer-friendly API wrapping BRC100WalletService.
 * All methods follow basket-label-tag strategy.
 */
export class BlockchainServices {
  // invoiceId auto-generation state
  private invoiceCounter = 0;

  // Private constructor - only create() can instantiate
  private constructor(
    public readonly brc100Wallet: BRC100WalletService
  ) {}

  /**
   * Create BlockchainServices with simple one-line initialization
   *
   * @param sdkToken - MintBlue SDK token
   * @param basketNames - Basket names for project-per-basket architecture
   * @returns Fully initialized BlockchainServices instance
   */
  static async create(
    sdkToken: string,
    basketNames: string[] = ['satoshis', 'outgoing']
  ): Promise<BlockchainServices> {
    if (basketNames.length === 0) {
      throw new Error('basketNames cannot be empty (must provide at least one basket)');
    }

    // 1. Create SDK client for broadcast operations
    const mintblueSDK = new MintBlueSDKService();
    const client = await mintblueSDK.createClient(sdkToken);

    // 2. Get Bitcoin key (always 'bitcoin')
    const bitcoinKey = await mintblueSDK.findKeyByName(client, 'bitcoin');
    if (!bitcoinKey) {
      throw new Error("No 'bitcoin' key found in MintBlue project");
    }
    // Convert MintBlue SDK v9 key to BSV SDK PrivateKey
    const bsvPrivateKey = bitcoinKey.toBitcoinKey(); // Returns @ts-bitcoin/core PrivKey
    const masterKey = new PrivateKey(Array.from((bsvPrivateKey as any).toBuffer()));

    // 3. Derive wallet address for project naming
    const walletAddress = masterKey.toPublicKey().toAddress().toString();

    // 4. Create projects for each basket
    const basketProjectMap: Record<string, string> = {};
    for (const basketName of basketNames) {
      const projectId = await BlockchainServices.discoverOrCreateProjectForBasket(
        mintblueSDK,
        client,
        walletAddress,
        basketName
      );
      basketProjectMap[basketName] = projectId;
    }

    // 5. Initialize services
    const keyService = new KeyService(); // No dependencies - uses @bsv/sdk directly
    const txBuilder = new TransactionBuilderService();
    const beefService = new BEEFService();
    const broadcastService = new BroadcastService(mintblueSDK); // Session 3: Uses MintBlueSDKService

    // 6. Configure broadcast clients (one per basket project)
    for (const projectId of Object.values(basketProjectMap)) {
      await broadcastService.configureClient({
        projectId,
        sdkToken,
      });
    }

    // 7. Create production ChainTracker (NEVER mock in production)
    const chainTracker = ChainTrackerFactory.createDefault('main');

    // 8. Create BlockHeaderListener if WebSocket available
    let blockHeaderListener: BlockHeaderListener | undefined;
    if (typeof WebSocket !== 'undefined') {
      blockHeaderListener = new BlockHeaderListener('main');
      blockHeaderListener.connect();
    }

    // 9. Construct wallet with ChainTracker and BlockHeaderListener
    const wallet = new BRC100WalletService(
      masterKey,
      keyService,
      txBuilder,
      broadcastService,
      beefService,
      basketProjectMap,
      6,                      // MIN_CONFIRMATIONS (default)
      chainTracker,           // Sprint 3A.5 Session 4
      blockHeaderListener     // Sprint 3A.5 Session 4
    );

    // 10. Return facade
    return new BlockchainServices(wallet);
  }

  /**
   * Discover or create project for specific basket
   *
   * Tag format: `wallet-{walletAddress}-{basketName}`
   * Example: `wallet-1A1zP1eP5QGefi2DMPTfTL5SLmv7DivfNa-satoshis`
   */
  private static async discoverOrCreateProjectForBasket(
    mintblueSDK: MintBlueSDKService,
    client: MintblueClient,
    walletAddress: string,
    basketName: string
  ): Promise<string> {
    const projectTag = `wallet-${walletAddress}-${basketName}`;

    let page = 0;
    const limit = 100;

    // Search for existing project
    while (true) {
      const offset = page * limit;
      const projects = await mintblueSDK.listProjects(client, limit, offset);

      // Look for project with matching tag
      const project = projects.find((p: any) => p.tags?.includes(projectTag));

      if (project) {
        return project.id;
      }

      // End of results
      if (projects.length < limit) {
        break;
      }

      page++;
    }

    // No project found - create new one
    const project = await mintblueSDK.createProject(
      client,
      `wallet-${basketName}`,
      `BRC-100 basket for ${basketName} (${walletAddress})`,
      [projectTag, 'brc100', 'wallet', `basket:${basketName}`]
    );

    return project.id;
  }

  /**
   * Send regular BSV payment to multiple recipients
   *
   * Basket Strategy:
   * - Inputs: Selected from BASKET_SATOSHIS
   * - Payment outputs: Go to BASKET_OUTGOING (recipients can scan)
   * - Change output: Returns to BASKET_SATOSHIS (origin basket)
   *
   * @param recipients - Array of { address, satoshis } or single recipient
   * @param options - Optional description
   * @returns Transaction ID
   *
   * @example
   * // Single recipient
   * await blockchain.sendPayment([{ address: 'addr1', satoshis: 100 }]);
   *
   * // Multiple recipients
   * await blockchain.sendPayment([
   *   { address: 'alice_address', satoshis: 100 },
   *   { address: 'bob_address', satoshis: 200 },
   * ]);
   */
  async sendPayment(
    recipients: Array<{ address: string; satoshis: number }>,
    options?: { description?: string }
  ): Promise<string> {
    // Validate recipients array
    if (!recipients || recipients.length === 0) {
      throw new Error('At least one recipient required');
    }

    // Calculate total payment amount
    const totalPayment = recipients.reduce((sum, r) => sum + r.satoshis, 0);

    // Select inputs from BASKET_SATOSHIS
    const inputs = await this.selectInputs(BASKET_SATOSHIS, totalPayment + 1000);
    const totalInput = inputs.reduce((sum, i) => sum + i.satoshis, 0);

    // Build locking scripts for all outputs (payment + change)
    const outputSpecs: Array<{ lockingScriptHex: string }> = [];

    // Payment locking scripts for each recipient
    const recipientLockingScripts = recipients.map(r =>
      new P2PKH().lock(r.address).toHex()
    );
    recipientLockingScripts.forEach(script =>
      outputSpecs.push({ lockingScriptHex: script })
    );

    // Change locking script
    const changeLockingScript = new P2PKH()
      .lock(this.brc100Wallet.getMasterAddress())
      .toHex();
    outputSpecs.push({ lockingScriptHex: changeLockingScript });

    // Calculate fee dynamically based on actual transaction size (all outputs)
    const fee = await this.calculateFee(inputs, outputSpecs);

    const change = totalInput - totalPayment - fee;

    // Build outputs for all recipients
    const outputs = recipients.map((recipient, index) => {
      const lockingScript = recipientLockingScripts[index];
      if (!lockingScript) {
        throw new Error(`Failed to generate locking script for recipient ${index}`);
      }
      return {
        lockingScript,
        satoshis: recipient.satoshis,
        outputDescription: `Payment to recipient ${index + 1}`,
        basket: BASKET_OUTGOING, // Recipients can scan this
        tags: [TAG_PAYMENT],
      };
    });

    // Add change output
    outputs.push({
      lockingScript: changeLockingScript,
      satoshis: change,
      outputDescription: 'Change',
      basket: BASKET_SATOSHIS, // Change returns to satoshis (origin)
      tags: [TAG_CHANGE],
    });

    const result = await this.brc100Wallet.createAction({
      description: options?.description || `BSV payment to ${recipients.length} recipient(s)`,
      labels: [LABEL_PAYMENT_SENT],
      inputs: inputs.map((i) => {
        const [txid, vout] = i.outpoint.split('.');
        return {
          outpoint: i.outpoint,
          sourceTXID: txid!,
          sourceOutputIndex: parseInt(vout!),
          inputDescription: 'Payment UTXO',
          unlockingScript: i.lockingScript, // Locking script for generating unlock
        };
      }),
      outputs,
      options: { signAndProcess: true },
    });

    return result.txid!;
  }

  /**
   * Send private BSV payment (Type 42) to multiple recipients
   *
   * Payment goes to ephemeral addresses derived from Type 42 protocol.
   * Change goes back to BASKET_SATOSHIS with Type 42 metadata for spending later.
   *
   * CRITICAL: Change goes to BASKET_SATOSHIS (NOT BASKET_OUTGOING) with Type 42 metadata.
   * BASKET_OUTGOING is for recipients to claim, NOT for sender's change.
   *
   * @param recipients - Array of recipients with publicKey, satoshis, optional invoiceId/memo
   * @param options - Optional transaction-level description
   * @returns Transaction ID and array of generated invoiceIds (same order as recipients)
   *
   * @example
   * // Single recipient
   * const result = await blockchain.sendPrivatePayment([
   *   { publicKey: alicePubKey, satoshis: 100, memo: 'For Alice' }
   * ]);
   * // result.invoiceIds = ['1697456789123-001-a3f9']
   *
   * // Multiple recipients with mixed auto-generated and custom invoiceIds
   * const result = await blockchain.sendPrivatePayment([
   *   { publicKey: alicePubKey, satoshis: 100 },  // Auto-generated invoiceId
   *   { publicKey: bobPubKey, satoshis: 200, invoiceId: 'custom-bob', memo: 'For Bob' },
   * ]);
   * // result.invoiceIds = ['1697456789123-001-a3f9', 'custom-bob']
   */
  async sendPrivatePayment(
    recipients: Array<{
      publicKey: PublicKey;
      satoshis: number;
      invoiceId?: string; // Auto-generated if omitted
      memo?: string;
    }>,
    options?: { description?: string }
  ): Promise<{
    txid: string;
    invoiceIds: string[];
  }> {
    // Validate recipients array
    if (!recipients || recipients.length === 0) {
      throw new Error('At least one recipient required');
    }

    // Calculate total payment amount
    const totalPayment = recipients.reduce((sum, r) => sum + r.satoshis, 0);

    // 1. Generate invoiceIds for all recipients (auto-generate if omitted)
    const invoiceIds = recipients.map(r => r.invoiceId || this.generateInvoiceId());

    // 2. Derive ephemeral addresses for all payment outputs
    const recipientAddresses = recipients.map((r, index) =>
      this.brc100Wallet.deriveRecipientAddress(
        r.publicKey,
        invoiceIds[index]! // Raw string, NOT pre-hashed
      )
    );

    // 3. Select inputs from BASKET_SATOSHIS
    const inputs = await this.selectInputs(BASKET_SATOSHIS, totalPayment + 1000);
    const totalInput = inputs.reduce((sum, i) => sum + i.satoshis, 0);

    // 4. Derive ephemeral address for change (send to self)
    const changeInvoiceId = this.generateInvoiceId();
    const changeEphemeralAddress = this.brc100Wallet.deriveChangeAddress(
      changeInvoiceId // Unique derivation
    );

    // 5. Build locking scripts for all outputs (payment + change)
    const paymentLockingScripts = recipientAddresses.map(addr =>
      new P2PKH().lock(addr).toHex()
    );
    const changeLockingScript = new P2PKH().lock(changeEphemeralAddress).toHex();

    const outputSpecs = [
      ...paymentLockingScripts.map(script => ({ lockingScriptHex: script })),
      { lockingScriptHex: changeLockingScript },
    ];

    // Calculate fee dynamically based on actual transaction size
    const fee = await this.calculateFee(inputs, outputSpecs);

    const change = totalInput - totalPayment - fee;

    // 6. Build payment outputs for all recipients
    const outputs = recipients.map((recipient, index) => {
      const lockingScript = paymentLockingScripts[index];
      const invoiceId = invoiceIds[index];
      if (!lockingScript || !invoiceId) {
        throw new Error(`Failed to generate locking script or invoiceId for recipient ${index}`);
      }

      const paymentMetadata = {
        templateType: TEMPLATE_TYPES.P2PKH,
        invoiceId, // NEVER pre-hash
        senderPublicKey: this.brc100Wallet.getMasterPublicKey(),
        memo: recipient.memo,
      };

      return {
        // Type 42 payment output (recipient claims from BASKET_OUTGOING)
        lockingScript,
        satoshis: recipient.satoshis,
        outputDescription: `Private payment ${invoiceId}`,
        basket: BASKET_OUTGOING, // Recipient scans this
        tags: [TAG_TYPE42, TAG_PAYMENT],
        customInstructions: JSON.stringify(paymentMetadata),
      };
    });

    // 7. Add change output
    const changeMetadata = {
      templateType: TEMPLATE_TYPES.P2PKH,
      invoiceId: changeInvoiceId,
      senderPublicKey: this.brc100Wallet.getMasterPublicKey(),
    };

    outputs.push({
      // Type 42 change (back to BASKET_SATOSHIS with metadata)
      lockingScript: changeLockingScript,
      satoshis: change,
      outputDescription: 'Type 42 change',
      basket: BASKET_SATOSHIS, // Change returns to satoshis (origin)
      tags: [TAG_TYPE42, TAG_CHANGE],
      customInstructions: JSON.stringify(changeMetadata),
    });

    const result = await this.brc100Wallet.createAction({
      description: options?.description || `Private payment to ${recipients.length} recipient(s)`,
      labels: [LABEL_TYPE42_SENT, LABEL_PAYMENT_SENT],
      inputs: inputs.map((i) => {
        const [txid, vout] = i.outpoint.split('.');
        return {
          outpoint: i.outpoint,
          sourceTXID: txid!,
          sourceOutputIndex: parseInt(vout!),
          unlockingScript: i.lockingScript,
          inputDescription: 'Payment UTXO',
        };
      }),
      outputs,
      options: { signAndProcess: true },
    });

    return {
      txid: result.txid!,
      invoiceIds,
    };
  }

  /**
   * Send BSV-21 token payment to multiple recipients
   *
   * CRITICAL: Token transactions need BOTH token inputs AND satoshi inputs (for fees).
   * Each token UTXO requires 1 satoshi.
   *
   * Basket Strategy:
   * - Token inputs: Selected from getTokenBasket(tokenId)
   * - Satoshi inputs: Selected from BASKET_SATOSHIS (for fees)
   * - Token payment outputs: Go to BASKET_OUTGOING
   * - Token change output: Returns to getTokenBasket(tokenId) (origin)
   * - Satoshi change output: Returns to BASKET_SATOSHIS (origin)
   *
   * @param tokenId - Token identifier (format: "txid_vout")
   * @param recipients - Array of recipients with address and amount
   * @param options - Optional description
   * @returns Transaction ID
   *
   * @example
   * // Single recipient
   * await blockchain.sendTokenPayment('EUR_TOKEN_ID', [
   *   { address: 'alice_address', amount: '100' }
   * ]);
   *
   * // Multiple recipients
   * await blockchain.sendTokenPayment('EUR_TOKEN_ID', [
   *   { address: 'alice_address', amount: '50' },
   *   { address: 'bob_address', amount: '75' },
   * ]);
   */
  async sendTokenPayment(
    tokenId: string,
    recipients: Array<{ address: string; amount: string }>,
    options?: { description?: string }
  ): Promise<string> {
    // Validate recipients array
    if (!recipients || recipients.length === 0) {
      throw new Error('At least one recipient required');
    }

    // Calculate total token amount to send
    const totalAmount = recipients.reduce(
      (sum, r) => this.addTokens(sum, r.amount),
      '0'
    );
    const tokenBasket = getTokenBasket(tokenId);

    // 1. Select token inputs from token basket
    const tokenInputs = await this.selectTokenInputs(tokenBasket, totalAmount);

    // 2. Calculate token change
    const totalTokens = this.calculateTotalTokens(tokenInputs);
    const tokenChange = this.subtractTokens(totalTokens, totalAmount);

    // Validate token amounts match
    if (this.addTokens(totalAmount, tokenChange) !== totalTokens) {
      throw new Error(
        `Token amount mismatch: inputs=${totalTokens}, outputs=${totalAmount} + ${tokenChange}`
      );
    }

    // 3. Select satoshi inputs for fees (with buffer)
    const paymentSats = recipients.length; // 1 sat per recipient token output
    const changeSats = tokenChange !== '0' ? 1 : 0; // 1 sat for change output if exists
    const estimatedFee = 500; // Initial estimate for selection
    const totalSatoshisNeeded = paymentSats + changeSats + estimatedFee;

    const satoshiInputs = await this.selectInputs(
      BASKET_SATOSHIS,
      totalSatoshisNeeded
    );
    const totalSatoshis = satoshiInputs.reduce((sum, i) => sum + i.satoshis, 0);

    // 4. Build all locking scripts for fee calculation
    const allInputs = [...tokenInputs, ...satoshiInputs];

    // Build payment locking scripts for all recipients
    const paymentLockingScripts = recipients.map(r =>
      getLockingScript(
        TEMPLATE_TYPES.BSV21,
        tokenId,
        r.address,
        r.amount
      ).toHex()
    );

    const outputSpecs: Array<{ lockingScriptHex: string }> = paymentLockingScripts.map(
      script => ({ lockingScriptHex: script })
    );

    let tokenChangeLockingScript: string | undefined;
    if (tokenChange !== '0') {
      tokenChangeLockingScript = getLockingScript(
        TEMPLATE_TYPES.BSV21,
        tokenId,
        this.brc100Wallet.getMasterAddress(),
        tokenChange
      ).toHex();
      outputSpecs.push({ lockingScriptHex: tokenChangeLockingScript });
    }

    const satoshiChangeLockingScript = new P2PKH()
      .lock(this.brc100Wallet.getMasterAddress())
      .toHex();
    outputSpecs.push({ lockingScriptHex: satoshiChangeLockingScript });

    // Calculate fee dynamically based on actual transaction size
    const fee = await this.calculateFee(allInputs, outputSpecs);

    // Recalculate satoshi change with exact fee
    const satoshiChange = totalSatoshis - paymentSats - changeSats - fee;

    // 5. Build outputs for all recipients
    const ticker = this.getTicker(tokenId);
    const outputs = recipients.map((recipient, index) => {
      const lockingScript = paymentLockingScripts[index];
      if (!lockingScript) {
        throw new Error(`Failed to generate locking script for token recipient ${index}`);
      }
      return {
        // Token payment output
        lockingScript,
        satoshis: 1, // 1 sat per token output
        outputDescription: `${recipient.amount} tokens to recipient ${index + 1}`,
        basket: BASKET_OUTGOING, // Recipient can scan
        tags: [TAG_TOKEN, TAG_PAYMENT, getTokenIdTag(tokenId, ticker)],
        customInstructions: JSON.stringify({
          templateType: TEMPLATE_TYPES.BSV21,
          tokenId: tokenId,
          tokenAmount: recipient.amount,
        }),
      };
    });

    // Token change output (if exists)
    if (tokenChange !== '0' && tokenChangeLockingScript) {
      outputs.push({
        lockingScript: tokenChangeLockingScript,
        satoshis: changeSats,
        outputDescription: 'Token change',
        basket: tokenBasket, // Returns to token basket (origin)
        tags: [TAG_TOKEN, TAG_CHANGE, getTokenIdTag(tokenId, ticker)],
        customInstructions: JSON.stringify({
          templateType: TEMPLATE_TYPES.BSV21,
          tokenId: tokenId,
          tokenAmount: tokenChange,
        }),
      });
    }

    // Satoshi change output (if exists)
    if (satoshiChange > 0) {
      outputs.push({
        lockingScript: satoshiChangeLockingScript,
        satoshis: satoshiChange,
        outputDescription: 'Satoshi change',
        basket: BASKET_SATOSHIS, // Returns to satoshis (origin)
        tags: [TAG_CHANGE],
        customInstructions: JSON.stringify({
          templateType: TEMPLATE_TYPES.P2PKH,
        }),
      });
    }

    const result = await this.brc100Wallet.createAction({
      description: options?.description || `Send ${totalAmount} ${ticker} tokens to ${recipients.length} recipient(s)`,
      labels: [LABEL_TOKEN_SENT],
      inputs: [
        ...tokenInputs.map((i) => {
          const [txid, vout] = i.outpoint.split('.');
          return {
            outpoint: i.outpoint,
            sourceTXID: txid!,
            sourceOutputIndex: parseInt(vout!),
            unlockingScript: i.lockingScript,
            inputDescription: 'Token UTXO',
          };
        }),
        ...satoshiInputs.map((i) => {
          const [txid, vout] = i.outpoint.split('.');
          return {
            outpoint: i.outpoint,
            sourceTXID: txid!,
            sourceOutputIndex: parseInt(vout!),
            unlockingScript: i.lockingScript,
            inputDescription: 'Fee UTXO',
          };
        }),
      ],
      outputs,
      options: { signAndProcess: true },
    });

    return result.txid!;
  }

  /**
   * Send private BSV-21 token payment (Type 42) to multiple recipients
   *
   * Token payments use Type 42 ephemeral addresses.
   * Token change returns to token basket with Type 42 metadata.
   * Satoshi change returns to BASKET_SATOSHIS.
   *
   * CRITICAL: Requires BOTH token inputs AND satoshi inputs (for fees).
   *
   * @param tokenId - Token identifier (format: "txid_vout")
   * @param recipients - Array of recipients with publicKey, amount, optional invoiceId/memo
   * @param options - Optional transaction-level description
   * @returns Transaction ID and array of generated invoiceIds (same order as recipients)
   *
   * @example
   * // Single recipient
   * const result = await blockchain.sendPrivateTokens('EUR_TOKEN_ID', [
   *   { publicKey: alicePubKey, amount: '50' }
   * ]);
   * // result.invoiceIds = ['1697456789123-001-a3f9']
   *
   * // Multiple recipients with mixed auto-generated and custom invoiceIds
   * const result = await blockchain.sendPrivateTokens('EUR_TOKEN_ID', [
   *   { publicKey: alicePubKey, amount: '50' },
   *   { publicKey: bobPubKey, amount: '75', invoiceId: 'custom-bob' },
   * ]);
   * // result.invoiceIds = ['1697456789123-002-b4e8', 'custom-bob']
   */
  async sendPrivateTokens(
    tokenId: string,
    recipients: Array<{
      publicKey: PublicKey;
      amount: string;
      invoiceId?: string;
      memo?: string;
    }>,
    options?: { description?: string }
  ): Promise<{
    txid: string;
    invoiceIds: string[];
  }> {
    // Validate recipients array
    if (!recipients || recipients.length === 0) {
      throw new Error('At least one recipient required');
    }

    // Calculate total token amount to send
    const totalAmount = recipients.reduce(
      (sum, r) => this.addTokens(sum, r.amount),
      '0'
    );

    const tokenBasket = getTokenBasket(tokenId);

    // 1. Generate invoiceIds for all recipients (auto-generate if omitted)
    const invoiceIds = recipients.map(r => r.invoiceId || this.generateInvoiceId());

    // 2. Derive ephemeral addresses for all payment outputs
    const recipientAddresses = recipients.map((r, index) =>
      this.brc100Wallet.deriveRecipientAddress(
        r.publicKey,
        invoiceIds[index]!
      )
    );

    // 3. Select token inputs
    const tokenInputs = await this.selectTokenInputs(tokenBasket, totalAmount);

    // 4. Calculate token change
    const totalTokens = this.calculateTotalTokens(tokenInputs);
    const tokenChange = this.subtractTokens(totalTokens, totalAmount);

    // Validate token amounts match
    if (this.addTokens(totalAmount, tokenChange) !== totalTokens) {
      throw new Error(
        `Token amount mismatch: inputs=${totalTokens}, outputs=${totalAmount} + ${tokenChange}`
      );
    }

    // 5. Select satoshi inputs (with buffer for fees)
    const paymentSats = recipients.length; // 1 sat per recipient token output
    const changeSats = tokenChange !== '0' ? 1 : 0;
    const estimatedFee = 500; // Initial estimate for selection
    const totalSatoshisNeeded = paymentSats + changeSats + estimatedFee;

    const satoshiInputs = await this.selectInputs(
      BASKET_SATOSHIS,
      totalSatoshisNeeded
    );
    const totalSatoshis = satoshiInputs.reduce((sum, i) => sum + i.satoshis, 0);

    // 6. Build all locking scripts for fee calculation
    const allInputs = [...tokenInputs, ...satoshiInputs];

    // Build payment locking scripts for all recipients
    const paymentLockingScripts = recipients.map((r, index) =>
      getLockingScript(
        TEMPLATE_TYPES.BSV21,
        tokenId,
        recipientAddresses[index],
        r.amount
      ).toHex()
    );

    const outputSpecs: Array<{ lockingScriptHex: string }> = paymentLockingScripts.map(
      script => ({ lockingScriptHex: script })
    );

    let tokenChangeLockingScript: string | undefined;
    if (tokenChange !== '0') {
      tokenChangeLockingScript = getLockingScript(
        TEMPLATE_TYPES.BSV21,
        tokenId,
        this.brc100Wallet.getMasterAddress(),
        tokenChange
      ).toHex();
      outputSpecs.push({ lockingScriptHex: tokenChangeLockingScript });
    }

    const satoshiChangeLockingScript = new P2PKH()
      .lock(this.brc100Wallet.getMasterAddress())
      .toHex();
    outputSpecs.push({ lockingScriptHex: satoshiChangeLockingScript });

    // Calculate fee dynamically based on actual transaction size
    const fee = await this.calculateFee(allInputs, outputSpecs);

    // Recalculate satoshi change with exact fee
    const satoshiChange = totalSatoshis - paymentSats - changeSats - fee;

    // 7. Build payment outputs for all recipients
    const ticker = this.getTicker(tokenId);
    const outputs = recipients.map((recipient, index) => {
      const lockingScript = paymentLockingScripts[index];
      const invoiceId = invoiceIds[index];
      if (!lockingScript || !invoiceId) {
        throw new Error(`Failed to generate locking script or invoiceId for token recipient ${index}`);
      }

      const paymentMetadata = {
        templateType: 'bsv21',
        invoiceId,
        senderPublicKey: this.brc100Wallet.getMasterPublicKey(),
        tokenId,
        tokenAmount: recipient.amount,
        memo: recipient.memo,
      };

      return {
        // Type 42 token payment output
        lockingScript,
        satoshis: 1, // 1 sat per token output
        outputDescription: `Private token payment ${invoiceId}`,
        basket: BASKET_OUTGOING, // Recipient scans this
        tags: [
          TAG_TYPE42,
          TAG_TOKEN,
          TAG_PAYMENT,
          getTokenIdTag(tokenId, ticker),
        ],
        customInstructions: JSON.stringify(paymentMetadata),
      };
    }) as ActionOutput[];

    // 8. Add token change output (if exists)
    if (tokenChange !== '0' && tokenChangeLockingScript) {
      const changeMetadata = {
        templateType: 'bsv21',
        invoiceId: this.generateInvoiceId(),
        senderPublicKey: this.brc100Wallet.getMasterPublicKey(),
        tokenId,
        tokenAmount: tokenChange,
      };

      outputs.push({
        lockingScript: tokenChangeLockingScript,
        satoshis: changeSats,
        outputDescription: 'Token change (Type 42)',
        basket: tokenBasket, // Returns to token basket (origin)
        tags: [
          TAG_TYPE42,
          TAG_TOKEN,
          TAG_CHANGE,
          getTokenIdTag(tokenId, ticker),
        ],
        customInstructions: JSON.stringify(changeMetadata),
      });
    }

    // 9. Add satoshi change output (if exists)
    if (satoshiChange > 0) {
      outputs.push({
        lockingScript: satoshiChangeLockingScript,
        satoshis: satoshiChange,
        outputDescription: 'Satoshi change',
        basket: BASKET_SATOSHIS, // Returns to satoshis (origin)
        tags: [TAG_CHANGE],
      });
    }

    const result = await this.brc100Wallet.createAction({
      description: options?.description || `Private token payment to ${recipients.length} recipient(s)`,
      labels: [LABEL_TYPE42_SENT, LABEL_TOKEN_SENT],
      inputs: [
        ...tokenInputs.map((i) => {
          const [txid, vout] = i.outpoint.split('.');
          return {
            outpoint: i.outpoint,
            sourceTXID: txid!,
            sourceOutputIndex: parseInt(vout!),
            unlockingScript: i.lockingScript,
            inputDescription: 'Token UTXO',
          };
        }),
        ...satoshiInputs.map((i) => {
          const [txid, vout] = i.outpoint.split('.');
          return {
            outpoint: i.outpoint,
            sourceTXID: txid!,
            sourceOutputIndex: parseInt(vout!),
            unlockingScript: i.lockingScript,
            inputDescription: 'Fee UTXO',
          };
        }),
      ],
      outputs,
      options: { signAndProcess: true },
    });

    return {
      txid: result.txid!,
      invoiceIds,
    };
  }

  /**
   * Get BSV satoshi balance
   *
   * @returns Total satoshis in BASKET_SATOSHIS
   */
  async getBalance(): Promise<number> {
    return this.getBasketBalance(BASKET_SATOSHIS);
  }

  /**
   * Get satoshi balance for specific basket
   *
   * @param basket - Basket name
   * @returns Total satoshis in basket
   */
  async getBasketBalance(basket: string): Promise<number> {
    const outputs = await this.brc100Wallet.listOutputs({
      basket,
    });

    return outputs.outputs.reduce((sum, utxo) => sum + utxo.satoshis, 0);
  }

  /**
   * Get token balance for specific token
   *
   * @param tokenId - Token identifier
   * @returns Total token amount (string for precision)
   */
  async getTokenBalance(tokenId: string): Promise<string> {
    const outputs = await this.brc100Wallet.listOutputs({
      basket: getTokenBasket(tokenId),
      tags: [TAG_TOKEN],
      includeCustomInstructions: true,
    });

    return this.sumTokenAmounts(outputs.outputs);
  }

  /**
   * Get master wallet address
   *
   * @returns Master wallet address (P2PKH format)
   */
  getMasterAddress(): string {
    return this.brc100Wallet.getMasterAddress();
  }

  /**
   * Get current blockchain height
   * BRC-100 required method
   *
   * @returns Promise resolving to object with height property
   * @throws Error if ChainTracker not initialized
   */
  async getHeight(): Promise<{ height: number }> {
    return this.brc100Wallet.getHeight();
  }

  /**
   * Get master public key
   *
   * @returns Master public key hex string
   */
  getMasterPublicKey(): string {
    return this.brc100Wallet.getMasterPublicKey();
  }

  /**
   * Sync wallet from blockchain (discover and import UTXOs)
   *
   * Queries WhatsOnChain for UTXOs at master address and adds them to baskets.
   * Useful for initial wallet funding or recovering from local storage loss.
   *
   * @param includeUnconfirmed - Include unconfirmed UTXOs (default: false)
   * @returns Sync result with counts
   */
  async syncFromBlockchain(includeUnconfirmed = false): Promise<{
    discovered: number;
    imported: number;
    skipped: number;
    errors: string[];
  }> {
    const result = {
      discovered: 0,
      imported: 0,
      skipped: 0,
      errors: [] as string[],
    };

    try {
      // 1. Get master address
      const address = this.getMasterAddress();
      console.log(`[BlockchainServices] Syncing UTXOs for address: ${address}`);

      // 2. Fetch UTXOs from WhatsOnChain
      const { WhatsOnChainChainTracker } = await import('../services/WhatsOnChainChainTracker');
      const chainTracker = new WhatsOnChainChainTracker('main');
      const utxos = await chainTracker.getAddressUtxos(address, includeUnconfirmed);

      result.discovered = utxos.length;
      console.log(`[BlockchainServices] Discovered ${utxos.length} UTXOs`);

      if (utxos.length === 0) {
        return result;
      }

      // 3. Group UTXOs by transaction hash to prevent duplicate action records
      const utxosByTx = new Map<string, typeof utxos>();
      for (const utxo of utxos) {
        if (!utxosByTx.has(utxo.tx_hash)) {
          utxosByTx.set(utxo.tx_hash, []);
        }
        utxosByTx.get(utxo.tx_hash)!.push(utxo);
      }

      console.log(
        `[BlockchainServices] Grouped ${utxos.length} UTXOs into ${utxosByTx.size} unique transactions`
      );

      // 4. For each transaction, fetch hex and internalize with all wallet outputs
      for (const [txHash, txUtxos] of utxosByTx.entries()) {
        try {
          // Fetch transaction hex once per transaction
          const txHex = await chainTracker.getTransactionHex(txHash);

          if (!txHex) {
            result.errors.push(`Failed to fetch tx ${txHash}`);
            result.skipped += txUtxos.length;
            continue;
          }

          // Use internalizeAction ONCE per transaction with ALL wallet outputs
          await this.brc100Wallet.internalizeAction({
            tx: txHex,
            description: `Synced from blockchain (block ${txUtxos[0]?.height || 0})`,
            labels: ['blockchain-sync'],
            outputs: txUtxos.map((utxo) => ({
              outputIndex: utxo.tx_pos,
              protocol: 'basket insertion',
              insertionRemittance: {
                basket: BASKET_SATOSHIS, // Add to satoshis basket
                tags: ['synced'],
              },
            })),
          });

          result.imported += txUtxos.length;
          console.log(
            `[BlockchainServices] Imported transaction ${txHash} with ${txUtxos.length} output(s)`
          );
        } catch (error) {
          const errorMsg =
            error instanceof Error ? error.message : String(error);
          result.errors.push(`Error importing ${txHash}: ${errorMsg}`);
          result.skipped += txUtxos.length;
        }
      }

      console.log(
        `[BlockchainServices] Sync complete: ${result.imported} imported, ${result.skipped} skipped`
      );

      return result;
    } catch (error) {
      const errorMsg = error instanceof Error ? error.message : String(error);
      result.errors.push(`Sync failed: ${errorMsg}`);
      console.error('[BlockchainServices] Sync error:', error);
      return result;
    }
  }


  // ==================== HELPER METHODS (private) ====================

  /**
   * Select inputs from basket for spending
   *
   * @param basket - Basket name
   * @param needed - Required satoshis
   * @returns Selected UTXOs with locking script and metadata for unlocking
   */
  private async selectInputs(
    basket: string,
    needed: number
  ): Promise<
    Array<{
      outpoint: string;
      satoshis: number;
      lockingScript: string;
      customInstructions?: string;
    }>
  > {
    const outputs = await this.brc100Wallet.listOutputs({
      basket,
      includeCustomInstructions: true,
    });

    // Simple selection: take inputs until we have enough
    const selected: Array<{
      outpoint: string;
      satoshis: number;
      lockingScript: string;
      customInstructions?: string;
    }> = [];
    let total = 0;

    for (const output of outputs.outputs) {
      selected.push({
        outpoint: output.outpoint,
        satoshis: output.satoshis,
        lockingScript: output.lockingScript,
        customInstructions: output.customInstructions,
      });
      total += output.satoshis;

      if (total >= needed) {
        break;
      }
    }

    if (total < needed) {
      throw new Error(
        `Insufficient funds in basket '${basket}': need ${needed}, have ${total}`
      );
    }

    return selected;
  }

  /**
   * Select token inputs from basket
   *
   * @param basket - Basket name
   * @param amount - Required token amount
   * @returns Selected token UTXOs with locking script for unlocking
   */
  private async selectTokenInputs(
    basket: string,
    amount: string
  ): Promise<
    Array<{
      outpoint: string;
      amount: string;
      satoshis: number;
      lockingScript: string;
    }>
  > {
    const outputs = await this.brc100Wallet.listOutputs({
      basket,
      tags: [TAG_TOKEN],
      includeCustomInstructions: true,
    });

    // Simple selection: take inputs until we have enough
    const selected: Array<{
      outpoint: string;
      amount: string;
      satoshis: number;
      lockingScript: string;
    }> = [];
    let totalAmount = '0';

    for (const output of outputs.outputs) {
      // Extract token amount from customInstructions
      const metadata = output.customInstructions
        ? JSON.parse(output.customInstructions)
        : {};
      const outputAmount = metadata.tokenAmount || '0';

      selected.push({
        outpoint: output.outpoint,
        amount: outputAmount,
        satoshis: output.satoshis,
        lockingScript: output.lockingScript, // Pass through for unlocking script generation
      });

      totalAmount = this.addTokens(totalAmount, outputAmount);

      // Compare amounts (string comparison for precision)
      if (this.compareTokens(totalAmount, amount) >= 0) {
        break;
      }
    }

    if (this.compareTokens(totalAmount, amount) < 0) {
      throw new Error(
        `Insufficient token balance in basket '${basket}': need ${amount}, have ${totalAmount}`
      );
    }

    return selected;
  }

  /**
   * Calculate total token amount from inputs
   *
   * @param inputs - Token inputs
   * @returns Total amount (string for precision)
   */
  private calculateTotalTokens(
    inputs: Array<{ outpoint: string; amount: string }>
  ): string {
    return inputs.reduce(
      (sum, input) => this.addTokens(sum, input.amount),
      '0'
    );
  }

  /**
   * Subtract token amounts
   *
   * @param total - Total amount
   * @param amount - Amount to subtract
   * @returns Remaining amount (string for precision)
   */
  private subtractTokens(total: string, amount: string): string {
    const totalNum = parseFloat(total);
    const amountNum = parseFloat(amount);
    const result = totalNum - amountNum;

    if (result < 0) {
      throw new Error(
        `Negative token amount: ${total} - ${amount} = ${result}`
      );
    }

    return result.toString();
  }

  /**
   * Add token amounts
   *
   * @param a - First amount
   * @param b - Second amount
   * @returns Sum (string for precision)
   */
  private addTokens(a: string, b: string): string {
    const aNum = parseFloat(a);
    const bNum = parseFloat(b);
    return (aNum + bNum).toString();
  }

  /**
   * Compare token amounts
   *
   * @param a - First amount
   * @param b - Second amount
   * @returns -1 if a < b, 0 if a === b, 1 if a > b
   */
  private compareTokens(a: string, b: string): number {
    const aNum = parseFloat(a);
    const bNum = parseFloat(b);

    if (aNum < bNum) return -1;
    if (aNum > bNum) return 1;
    return 0;
  }

  /**
   * Extract ticker from tokenId
   *
   * @param tokenId - Token identifier (format: "txid_vout")
   * @returns Token ticker
   */
  private getTicker(tokenId: string): string {
    return getTickerFromTokenId(tokenId);
  }

  /**
   * Sum token amounts from outputs
   *
   * @param outputs - Output list
   * @returns Total amount (string for precision)
   */
  private sumTokenAmounts(
    outputs: Array<{ customInstructions?: string }>
  ): string {
    return outputs.reduce((sum, output) => {
      if (!output.customInstructions) return sum;

      const metadata = JSON.parse(output.customInstructions);
      const amount = metadata.tokenAmount || '0';

      return this.addTokens(sum, amount);
    }, '0');
  }

  /**
   * Calculate transaction fee dynamically based on actual data
   *
   * Uses 50 satoshis per kilobyte fee rate (BSV standard).
   * Calculates actual transaction size from input/output specifications.
   *
   * Transaction size calculation:
   * - Version (4) + Input count varint (1) + Output count varint (1) + Locktime (4)
   * - Each input: txid (32) + vout (4) + scriptLen varint (1) + unlockScript + sequence (4)
   * - Each output: satoshis (8) + scriptLen varint (1-3) + lockingScript
   *
   * @param inputs - Input UTXOs with locking scripts and metadata
   * @param outputSpecs - Output specifications with locking script hex
   * @returns Calculated fee in satoshis
   */
  private async calculateFee(
    inputs: Array<{ lockingScript: string; customInstructions?: string }>,
    outputSpecs: Array<{ lockingScriptHex: string }>
  ): Promise<number> {
    // Fixed dummy private key for estimating unlock script lengths
    // Using a fixed key avoids test environment issues with random generation
    const dummyKey = PrivateKey.fromString(
      '0000000000000000000000000000000000000000000000000000000000000001',
      'hex'
    );

    // Calculate input sizes
    let totalInputSize = 0;
    for (const input of inputs) {
      // Extract template type from metadata (or infer from script)
      let templateType: TemplateType = TEMPLATE_TYPES.P2PKH;

      if (input.customInstructions) {
        try {
          const metadata = JSON.parse(input.customInstructions);
          if (
            metadata.templateType &&
            isValidTemplateType(metadata.templateType)
          ) {
            templateType = metadata.templateType;
          }
        } catch {
          // Fallback to script-based detection
        }
      }

      // If no metadata, infer from locking script length
      if (templateType === TEMPLATE_TYPES.P2PKH) {
        const lockingScriptBytes = Buffer.from(
          input.lockingScript,
          'hex'
        ).length;
        // P2PKH is 25 bytes, BSV21 with ordinal inscription is much larger
        if (lockingScriptBytes > 25) {
          templateType = TEMPLATE_TYPES.BSV21;
        }
      }

      // Get unlock template and estimate length
      const unlockTemplate = getUnlockTemplate(templateType, dummyKey);
      const unlockLength = await unlockTemplate.estimateLength(
        null as any,
        0
      );

      // Input component sizes:
      // - Previous txid: 32 bytes
      // - Previous vout: 4 bytes
      // - Script length varint: 1 byte (for ~107 byte scripts)
      // - Unlocking script: variable
      // - Sequence: 4 bytes
      totalInputSize += 32 + 4 + 1 + unlockLength + 4;
    }

    // Calculate output sizes
    let totalOutputSize = 0;
    for (const output of outputSpecs) {
      const lockingScriptBytes = Buffer.from(
        output.lockingScriptHex,
        'hex'
      ).length;

      // Output component sizes:
      // - Satoshis: 8 bytes
      // - Script length varint: 1-3 bytes
      // - Locking script: variable
      const varintSize =
        lockingScriptBytes < 253 ? 1 : lockingScriptBytes < 65536 ? 3 : 5;
      totalOutputSize += 8 + varintSize + lockingScriptBytes;
    }

    // Transaction overhead:
    // - Version: 4 bytes
    // - Input count varint: 1 byte (for < 253 inputs)
    // - Output count varint: 1 byte (for < 253 outputs)
    // - Locktime: 4 bytes
    const overhead = 4 + 1 + 1 + 4;

    // Total transaction size in bytes
    const totalSize = overhead + totalInputSize + totalOutputSize;

    // Fee calculation: 50 sats per kilobyte, rounded up
    const feePerKB = 50;
    const fee = Math.ceil((totalSize / 1024) * feePerKB);

    return fee;
  }

  /**
   * Generate unique invoiceId for Type 42 payments
   *
   * Format: timestamp-counter-random
   * Example: "1697456789123-001-a3f9"
   *
   * Ensures uniqueness even for rapid successive payments.
   *
   * @returns Unique invoice ID
   */
  private generateInvoiceId(): string {
    const timestamp = Date.now();
    const counter = this.invoiceCounter++;

    // Use Web Crypto API (works in both browser and Node.js)
    const cryptoObj =
      typeof window !== 'undefined'
        ? window.crypto
        : globalThis.crypto || require('crypto').webcrypto;
    const random = Array.from(cryptoObj.getRandomValues(new Uint8Array(2)))
      .map((b) => b.toString(16).padStart(2, '0'))
      .join('');

    return `${timestamp}-${counter.toString().padStart(3, '0')}-${random}`;
  }
}
