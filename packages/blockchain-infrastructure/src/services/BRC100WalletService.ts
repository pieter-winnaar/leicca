/**
 * BRC100WalletService - BRC-100 Wallet Interface Implementation
 *
 * COMPLEX SERVICE - Depends on:
 * - KeyService (leaf)
 * - TransactionBuilderService (leaf)
 * - BroadcastService (intermediate) - for broadcasting
 * - BEEFService (leaf)
 *
 * Responsibilities:
 * - Implement BRC-100 wallet interface (createAction, signAction, abortAction, internalizeAction)
 * - Manage action state machine (pending → signed → broadcast → completed)
 * - Manage baskets (UTXO grouping and tracking)
 * - UTXO locking to prevent double-spend
 * - State persistence (localStorage)
 * - Select UTXOs from baskets
 *
 * What it does NOT do:
 * - Build raw transactions (TransactionBuilderService)
 * - Broadcast transactions directly (delegates to BroadcastService)
 * - Derive keys (KeyService)
 *
 * CRITICAL: UTXOs are managed through baskets, NOT UTXOService.
 * Baskets are the source of truth for wallet UTXOs.
 *
 * @see docs/05-INTEGRATION/brc-100-wallet.md
 * @see docs/02-SPRINTS/sprint-3A.3-brc100-wallet.md
 */

import type { KeyService } from './KeyService';
import type { TransactionBuilderService } from './TransactionBuilderService';
import type { BEEFService } from './BEEFService';
import type { BroadcastService } from './BroadcastService';
import type { ChainTracker, BlockHeader } from '../types';
import type { BlockHeaderListener } from './BlockHeaderListener';
import type { ScriptTemplateUnlock } from '@bsv/sdk';
import { PrivateKey, PublicKey, Transaction } from '@bsv/sdk';
import {
  getUnlockTemplate,
  TEMPLATE_TYPES,
  isValidTemplateType,
  type TemplateType,
} from '../constants/TemplateRegistry';
import { WalletStateManager } from '../utils/WalletStateManager';
import { BasketManager } from '../utils/BasketManager';
import { ConfirmationTracker } from '../utils/ConfirmationTracker';
import { ActionHelpers } from '../utils/ActionHelpers';
import { UTXOLockManager } from '../utils/UTXOLockManager';
import { Type42KeyResolver } from '../utils/Type42KeyResolver';
import type {
  ActionState,
  BasketState,
  CreateActionParams,
  CreateActionResult,
  SignActionParams,
  SignActionResult,
  AbortActionParams,
  InternalizeActionParams,
  InternalizeResult,
  ListActionsParams,
  ListActionsResult,
  ListOutputsParams,
  ListOutputsResult,
} from '../types';

/**
 * BRC100WalletService - Full BRC-100 wallet interface implementation
 *
 * Session 1: Foundation & createAction()
 * Session 2: signAction() & abortAction()
 * Session 3: State persistence (localStorage)
 * Session 4: Confirmation tracking (background polling)
 */
export class BRC100WalletService {
  // Action tracking
  private actions: Map<string, ActionState> = new Map();

  // Basket management
  private baskets: BasketState = {};

  // Pending actions (reference → action)
  private pendingReferences: Map<string, ActionState> = new Map();

  // UTXO locking (prevent double-spend)
  private lockedUTXOs: Set<string> = new Set(); // Format: "txid.vout"

  // Dynamic localStorage key (address-derived for multi-wallet support)
  private readonly stateKey: string;

  // State persistence utility
  private readonly stateManager: WalletStateManager;

  // Basket management utility
  private readonly basketManager: BasketManager;

  // Confirmation tracking utility
  private readonly confirmationTracker: ConfirmationTracker;

  // ChainTracker for Merkle proof retrieval (optional - for confirmation tracking)
  private readonly chainTracker?: ChainTracker;

  // State change listeners for React components
  private stateChangeListeners: Array<() => void> = [];

  constructor(
    private readonly masterKey: PrivateKey,
    private readonly keyService: KeyService,
    private readonly txBuilder: TransactionBuilderService,
    private readonly broadcastService: BroadcastService,
    private readonly beefService: BEEFService,
    private readonly basketProjectMap: Record<string, string>,
    private readonly MIN_CONFIRMATIONS = 6,
    chainTracker?: ChainTracker,
    blockHeaderListener?: BlockHeaderListener
  ) {
    this.chainTracker = chainTracker;
    // Derive unique localStorage key from master key address
    // Allows multiple wallets in same browser without collision
    const walletAddress = masterKey.toPublicKey().toAddress().toString();
    this.stateKey = `brc100_wallet_${walletAddress}`;

    // Initialize state manager
    this.stateManager = new WalletStateManager(this.stateKey);

    // Initialize basket manager
    this.basketManager = new BasketManager();

    // Initialize confirmation tracker with callbacks
    this.confirmationTracker = new ConfirmationTracker(
      this.onConfirmationUpdate.bind(this),
      this.getTransactionStatus.bind(this)
    );

    // Subscribe to BlockHeaderListener for event-driven confirmation checks
    if (blockHeaderListener) {
      blockHeaderListener.on('block', (header: BlockHeader) => {
        this.onNewBlock(header);
      });
    }

    // Load persisted state on initialization
    this.loadState();
  }

  /**
   * Create action (declare transaction intent)
   *
   * BRC-100 compliant implementation per Sprint 3A.3 Session 1
   *
   * Steps:
   * 1. Validate params
   * 2. Check UTXO locking
   * 3. Auto-select UTXOs if needed
   * 4. Build transaction (via TransactionBuilderService)
   * 5. Generate BEEF (via BEEFService)
   * 6. Sign if signAndProcess=true
   * 7. Broadcast if signed
   * 8. Persist state after locking UTXOs
   * 9. Return result (txid + BEEF OR signableTransaction)
   */
  async createAction(args: CreateActionParams): Promise<CreateActionResult> {
    // 1. Validate params
    ActionHelpers.validateCreateActionParams(args);

    // 2. Validate inputs are provided
    // CRITICAL: Session 1-2 require explicit inputs.
    // Session 3+ will implement auto-selection from baskets.
    const inputs = args.inputs || [];
    if (inputs.length === 0 && args.outputs && args.outputs.length > 0) {
      throw new Error(
        'Auto-selection from baskets not yet implemented. ' +
          'Please provide explicit inputs via args.inputs. ' +
          'This will be implemented in Session 3+ using basket UTXOs.'
      );
    }

    // 3. Check UTXO locking (prevent double-spend)
    UTXOLockManager.checkInputsNotLocked(this.lockedUTXOs, inputs);

    // 4. Lock UTXOs BEFORE building transaction
    UTXOLockManager.lockInputs(this.lockedUTXOs, inputs);

    // 4. Build transaction (via TransactionBuilderService)
    const tx = this.txBuilder.buildTransaction({
      inputs: inputs.map((inp) => {
        const parts = inp.outpoint.split('.');
        const txid = parts[0] || '';
        const vout = parts[1] || '0';

        // Look up UTXO from baskets to get satoshis and lockingScript
        const utxo = this.basketManager.findUtxo(this.baskets, inp.outpoint);
        if (!utxo) {
          throw new Error(`UTXO ${inp.outpoint} not found in any basket - cannot build transaction`);
        }

        // Look up sourceTransaction from stored actions
        const sourceAction = Array.from(this.actions.values()).find(
          (action) => action.txid === txid
        );

        return {
          txid,
          outputIndex: parseInt(vout),
          satoshis: utxo.satoshis,
          lockingScript: utxo.lockingScript,
          sourceTransaction: sourceAction?.tx, // CRITICAL: Required for BEEF
        };
      }),
      outputs:
        args.outputs?.map((out) => ({
          lockingScript: out.lockingScript,
          satoshis: out.satoshis,
        })) || [],
      locktime: args.lockTime,
      version: args.version,
    });

    // 5. Generate BEEF (via BEEFService)
    const beefHex = this.beefService.generateBEEF(tx);

    // 6. Create pending action FIRST (always needed)
    const reference = ActionHelpers.generateReference();
    const action = ActionHelpers.createActionRecord({
      status: 'pending',
      description: args.description,
      labels: args.labels || [],
      inputs,
      outputs: args.outputs || [],
      tx, // CRITICAL: Save transaction for signAction()
      reference,
    });

    this.pendingReferences.set(reference, action);
    this.actions.set(action.actionId, action);
    this.saveState();

    // 7. Sign if signAndProcess=true
    const signAndProcess = args.options?.signAndProcess !== false;

    if (signAndProcess) {
      // NOW just call signAction() - reuses all existing logic!
      // ✅ Type42KeyResolver will detect Type 42 inputs
      // ✅ Unlock templates will be generated correctly
      // ✅ Correct keys will be used (ephemeral OR masterKey)
      // ✅ Multi-project broadcast will happen
      return await this.signAction({
        reference,
        spends: {}, // Empty - signAction derives everything
        options: { noSend: args.options?.noSend },
      });
    } else {
      // Return for later signing
      return {
        signableTransaction: {
          tx: beefHex,
          reference,
        },
      };
    }
  }

  /**
   * Save wallet state to localStorage
   *
   * Called after EVERY state mutation:
   * - After locking UTXOs
   * - After creating actions
   * - After basket mutations
   * - After state transitions
   */
  private saveState(): void {
    this.stateManager.save({
      actions: this.actions,
      baskets: this.baskets,
      lockedUTXOs: this.lockedUTXOs,
      pendingReferences: this.pendingReferences,
    });

    // Emit state change event to React components
    this.emitStateChange();
  }

  /**
   * Load wallet state from localStorage
   *
   * Called during constructor initialization.
   */
  private loadState(): void {
    const state = this.stateManager.load();
    if (!state) return;

    this.actions = state.actions;
    this.baskets = state.baskets;
    this.lockedUTXOs = state.lockedUTXOs;
    this.pendingReferences = state.pendingReferences;

    // Session 4: Resume confirmation tracking for broadcast actions
    for (const action of this.actions.values()) {
      if (action.status === 'broadcast' && action.txid) {
        this.confirmationTracker.trackConfirmations(action.txid);
      }
    }
  }

  /**
   * Sign a pending action and optionally broadcast
   *
   * BRC-100 compliant implementation per Sprint 3A.3 Session 2
   *
   * Steps:
   * 1. Retrieve pending action by reference
   * 2. Validate action is in 'pending' state
   * 3. Get built transaction from action.tx
   * 4. Apply unlocking scripts from args.spends to transaction inputs
   * 5. Broadcast via BroadcastService (unless options.noSend=true)
   * 6. Update action state: pending → signed → broadcast
   * 7. Call saveState()
   * 8. Return txid + BEEF
   */
  async signAction(args: SignActionParams): Promise<SignActionResult> {
    // 1. Retrieve pending action by reference
    const action = this.pendingReferences.get(args.reference);
    if (!action) {
      throw new Error(
        `No pending action found for reference: ${args.reference}`
      );
    }

    // 2. Validate action is in 'pending' state
    if (action.status !== 'pending') {
      throw new Error(
        `Action ${args.reference} is in '${action.status}' state, expected 'pending'`
      );
    }

    // 3. Get the built transaction from action.tx
    const tx = action.tx;
    if (!tx) {
      throw new Error(
        `No transaction found for action ${args.reference}. ` +
          `This is a bug - createAction() should save tx when signAndProcess=false.`
      );
    }

    // 4. Apply unlocking scripts from args.spends to transaction inputs
    // Extract locking scripts, satoshis, and derive appropriate keys for each input
    // Note: For Sessions 1-2, we use simplified UTXO data
    // In Session 3+, we'll look up actual UTXO data from blockchain

    const { inputScripts, inputSatoshis, privateKeys } =
      Type42KeyResolver.resolveSigningKeys(
        action,
        this.baskets,
        this.basketManager,
        this.masterKey,
        this.keyService,
        PublicKey
      );

    // Generate unlock templates from UTXO metadata
    const unlockTemplates: ScriptTemplateUnlock[] = [];
    for (let i = 0; i < action.inputs.length; i++) {
      const input = action.inputs[i];
      if (!input) {
        throw new Error(`Missing input at index ${i}`);
      }

      // Look up UTXO to get customInstructions
      const utxo = this.basketManager.findUtxo(this.baskets, input.outpoint);
      if (!utxo) {
        throw new Error(`UTXO ${input.outpoint} not found in any basket`);
      }

      // Parse metadata to determine template type
      let templateType: TemplateType = TEMPLATE_TYPES.P2PKH; // default
      if (utxo.customInstructions) {
        try {
          const metadata = JSON.parse(utxo.customInstructions);
          const storedType = metadata.templateType as string;
          if (storedType && isValidTemplateType(storedType)) {
            templateType = storedType; // Type guard ensures this is TemplateType
          }
        } catch (e) {
          // Invalid JSON or no templateType - default to p2pkh
        }
      }

      // Generate unlock template using registry
      const template = getUnlockTemplate(templateType, privateKeys[i]!);
      unlockTemplates.push(template);
    }

    // Sign transaction with appropriate keys and templates
    const signedHex = await this.txBuilder.signTransaction(
      tx,
      privateKeys,
      inputScripts,
      inputSatoshis,
      unlockTemplates // Pass templates
    );

    // 5. Broadcast via BroadcastService (unless options.noSend=true)
    const noSend = args.options?.noSend === true;
    let txid: string | undefined;
    let broadcastSuccess = false;

    if (!noSend) {
      // Determine which projects to broadcast to based on baskets used
      const projectIds = this.getProjectIdsForOutputs(action.outputs || []);

      // Broadcast to all relevant projects (multi-basket transactions)
      let firstResult;
      for (const projectId of projectIds) {
        const result = await this.broadcastService.broadcast(
          projectId,
          signedHex
        );

        // Use first result for txid and success status
        if (!firstResult) {
          firstResult = result;
        }
      }

      txid = firstResult?.txid;
      broadcastSuccess = firstResult?.success || false;

      // Always track confirmations if we have txid
      if (txid) {
        this.confirmationTracker.trackConfirmations(txid);

        this.basketManager.assignOutputsToBaskets(
          this.baskets,
          UTXOLockManager,
          this.lockedUTXOs,
          txid,
          action.outputs,
          broadcastSuccess
        );

        // Note: onActionCompleted() will be called automatically by
        // onConfirmationUpdate() when confirmations >= 6 (line 141)
        // This follows BRC-100 spec: spent UTXOs remain in baskets until fully confirmed
      }
    }

    // 6. Update action state: pending → signed → broadcast
    action.txid = txid;
    action.status = noSend ? 'signed' : 'broadcast';
    action.updatedAt = new Date();

    // Remove from pendingReferences (no longer pending)
    this.pendingReferences.delete(args.reference);

    // Generate BEEF for response
    const beefHex = this.beefService.generateBEEF(tx);

    // 7. Call saveState()
    this.saveState();

    // 8. Return txid + BEEF
    return {
      txid,
      tx: beefHex,
    };
  }

  /**
   * Abort a pending action
   *
   * BRC-100 compliant implementation per Sprint 3A.3 Session 2
   *
   * Steps:
   * 1. Retrieve pending action by reference
   * 2. Validate action is in 'pending' state
   * 3. Unlock all UTXOs (remove from lockedUTXOs Set)
   * 4. Update action status to 'aborted'
   * 5. Remove from pendingReferences Map
   * 6. Call saveState()
   * 7. Return { aborted: true }
   */
  async abortAction(args: AbortActionParams): Promise<{ aborted: true }> {
    // 1. Retrieve pending action by reference
    const action = this.pendingReferences.get(args.reference);
    if (!action) {
      throw new Error(
        `No pending action found for reference: ${args.reference}`
      );
    }

    // 2. Validate action is in 'pending' state
    if (action.status !== 'pending') {
      throw new Error(
        `Cannot abort action ${args.reference} - current status is '${action.status}' (must be 'pending')`
      );
    }

    // 3. Unlock all UTXOs (remove from lockedUTXOs Set)
    UTXOLockManager.unlockInputs(this.lockedUTXOs, action.inputs);

    // 4. Update action status to 'aborted'
    action.status = 'aborted';
    action.updatedAt = new Date();

    // 5. Remove from pendingReferences Map
    this.pendingReferences.delete(args.reference);

    // 6. Call saveState()
    this.saveState();

    // 7. Return confirmation
    return { aborted: true };
  }

  /**
   * Handle confirmation updates from ConfirmationTracker
   * ONLY saves state when status changes to completed
   *
   * Sprint 3A.5B: BRC-100 spec compliance refactor
   *
   * @param txid - Transaction ID
   * @param confirmations - Current confirmation count
   */
  private async onConfirmationUpdate(
    txid: string,
    confirmations: number
  ): Promise<void> {
    const action = ActionHelpers.getActionByTxid(this.actions, txid);
    if (!action) {
      // Action not found, nothing to update
      return;
    }

    // Get status to update blockHeight if needed
    const status = await this.getTransactionStatus(txid);

    if (status.blockHeight && !action.blockHeight) {
      action.blockHeight = status.blockHeight;
      this.saveState();
    }

    // Unlock outputs at first confirmation (confirmations >= 1)
    // Enables spending of outputs even without MintBlue success
    if (confirmations >= 1 && action.outputs) {
      UTXOLockManager.unlockOutputs(
        this.lockedUTXOs,
        txid,
        action.outputs.length
      );
    }

    if (confirmations >= this.MIN_CONFIRMATIONS) {
      // 6+ confirmations - mark as completed
      action.status = 'completed';
      action.updatedAt = new Date();
      this.onActionCompleted(action);
      // Note: onActionCompleted() calls saveState() internally
    }
    // NO saveState() for <6 confirmations - status hasn't changed
  }

  /**
   * Derive ephemeral address for recipient (Type 42)
   *
   * @param recipientPubKey - Recipient's public key
   * @param invoiceId - Invoice ID for derivation
   * @returns Derived address string
   */
  public deriveRecipientAddress(
    recipientPubKey: PublicKey,
    invoiceId: string
  ): string {
    return this.keyService.deriveEphemeralAddress(
      this.masterKey,
      recipientPubKey,
      invoiceId
    );
  }

  /**
   * Derive ephemeral change address (Type 42)
   *
   * @param invoiceId - Invoice ID for derivation
   * @returns Derived change address string
   */
  public deriveChangeAddress(invoiceId: string): string {
    return this.keyService.deriveEphemeralAddress(
      this.masterKey,
      this.masterKey.toPublicKey(),
      invoiceId
    );
  }

  /**
   * Get master wallet address (for regular payments)
   *
   * @returns Master address string
   */
  public getMasterAddress(): string {
    return this.masterKey.toPublicKey().toAddress().toString();
  }

  /**
   * Get master public key (for Type 42 metadata)
   *
   * @returns Master public key string
   */
  public getMasterPublicKey(): string {
    return this.masterKey.toPublicKey().toString();
  }

  /**
   * Get current blockchain height
   * BRC-100 required method
   *
   * @returns Promise resolving to object with height property
   * @throws Error if ChainTracker not initialized
   */
  async getHeight(): Promise<{ height: number }> {
    if (!this.chainTracker) {
      throw new Error('ChainTracker not initialized');
    }
    const height = await this.chainTracker.currentHeight();
    return { height };
  }

  /**
   * Subscribe to wallet state changes (for React components)
   *
   * Notifies when:
   * - New blocks arrive (confirmations update)
   * - Transactions are broadcast
   * - Actions complete (6+ confirmations)
   *
   * @param callback - Function to call when state changes
   * @returns Unsubscribe function
   */
  public onStateChange(callback: () => void): () => void {
    this.stateChangeListeners.push(callback);

    // Return unsubscribe function
    return () => {
      const index = this.stateChangeListeners.indexOf(callback);
      if (index > -1) {
        this.stateChangeListeners.splice(index, 1);
      }
    };
  }

  /**
   * Emit state change event to all listeners
   */
  private emitStateChange(): void {
    for (const listener of this.stateChangeListeners) {
      try {
        listener();
      } catch (error) {
        console.error('[BRC100Wallet] State change listener error:', error);
      }
    }
  }

  /**
   * Get transaction status (confirmation count)
   *
   * NOTE(Sprint-3A.5): Implement real blockchain query
   *
   * This is a STUB implementation. Sprint 3A.5 will implement:
   * - WhatsOnChainChainTracker.getBlockHeader(height) to get confirmations
   * - TAALChainTracker for higher rate limits
   * - BabbageChainTracker for Babbage Chaintracks integration
   * - Multi-provider fallback strategy
   *
   * Real implementation will:
   * 1. Query MintBlue API: GET /v2/transaction/{txid}
   *    - Returns: { block: number | null, confirmed_at: string | null }
   * 2. If block === null: return { confirmations: 0 }
   * 3. If block !== null: Query chain tip and calculate: confirmations = (chain_tip - block + 1)
   *
   * See: docs/02-SPRINTS/sprint-3A.5-real-chaintracker.md
   *
   * @param _txid - Transaction ID (unused in stub)
   * @returns Transaction status with confirmation count (always 0 until Sprint 3A.5)
   */
  public async getTransactionStatus(
    txid: string
  ): Promise<{ confirmations: number; blockHeight?: number }> {
    // Sprint 3A.5B: Returns confirmations + blockHeight (no caching)

    // If no ChainTracker, return 0 confirmations (testing mode)
    if (!this.chainTracker) {
      return { confirmations: 0 };
    }

    try {
      // Get Merkle proof for transaction
      const proof = await this.chainTracker.getMerkleProof(txid);

      if (!proof) {
        // Transaction not confirmed yet
        return { confirmations: 0 };
      }

      // Get current height
      const currentHeight = await this.chainTracker.currentHeight();

      // Calculate confirmations
      const confirmations = currentHeight - proof.blockHeight + 1;

      return {
        confirmations: Math.max(0, confirmations),
        blockHeight: proof.blockHeight
      };
    } catch (error) {
      console.error(`[BRC100Wallet] Error getting transaction status for ${txid}:`, error);
      return { confirmations: 0 };
    }
  }

  /**
   * Handle new block event from BlockHeaderListener
   *
   * Sprint 3A.5 Session 4: Event-driven confirmation checks
   *
   * Triggers immediate confirmation checks for all broadcast actions
   * instead of waiting for 60-second polling interval.
   *
   * @param header - Block header from WebSocket
   */
  private onNewBlock(header: BlockHeader): void {
    console.log(`[BRC100Wallet] New block ${header.height}`);
    this.checkPendingConfirmations();
  }

  /**
   * Check pending confirmations for broadcast actions
   * ONLY updates status at 6 confirmations (broadcast → completed)
   * Does NOT update confirmations count (calculate on-demand in UI)
   *
   * Sprint 3A.5B: BRC-100 spec compliance refactor
   */
  private async checkPendingConfirmations(): Promise<void> {
    if (!this.chainTracker) return;

    for (const action of this.actions.values()) {
      // ONLY process broadcast actions (not completed)
      if (action.status === 'broadcast' && action.txid) {
        try {
          const status = await this.getTransactionStatus(action.txid);

          // Update blockHeight if changed (e.g. chain reorg)
          if (status.blockHeight) {
            action.blockHeight = status.blockHeight;
          }

          // Transition to completed at 6 confirmations
          if (status.confirmations >= this.MIN_CONFIRMATIONS) {
            action.status = 'completed';
            action.updatedAt = new Date();
            this.onActionCompleted(action);
            // Note: onActionCompleted() calls saveState() internally
          }
        } catch (error) {
          console.error(`[BRC100Wallet] Error checking ${action.txid.slice(0, 8)}:`, error);
        }
      }
    }

    // NO saveState() here - only called via onActionCompleted() when status changes
  }

  /**
   * Unlock UTXOs for completed/aborted action
   *
   * Called by:
   * - onActionCompleted() to release UTXOs after 6+ confirmations
   *
   * @param action - Action to unlock UTXOs for
   */
  private unlockUtxosForAction(action: ActionState): void {
    UTXOLockManager.unlockInputs(this.lockedUTXOs, action.inputs);
  }

  /**
   * Clean up spent UTXOs from baskets after confirmation
   * Called by trackConfirmations() when action reaches 6+ confirmations
   *
   * Removes spent UTXOs from ALL baskets and unlocks them.
   *
   * @param action - Completed action with inputs to remove
   */
  private onActionCompleted(action: ActionState): void {
    // Remove spent UTXOs from baskets
    const spentOutpoints = action.inputs.map((input) => input.outpoint);
    this.basketManager.cleanupSpentUtxos(this.baskets, spentOutpoints);

    // Unlock spent UTXOs (already done in unlockUtxosForAction)
    this.unlockUtxosForAction(action);

    // CRITICAL: Persist state after basket cleanup
    this.saveState();
  }

  /**
   * Internalize action (accept incoming transaction)
   *
   * BRC-100 compliant implementation per Sprint 3A.3 Session 6
   *
   * Steps:
   * 1. Parse BEEF transaction (via BEEFService)
   * 2. Validate transaction structure
   * 3. For each output:
   *    - If protocol='wallet payment': increment balance (future sprint)
   *    - If protocol='basket insertion': store in basket with metadata
   * 4. Create action record (status: 'completed')
   * 5. Call saveState()
   * 6. Return { success: true, txid, internalized: true }
   *
   * @param args - Internalization parameters
   * @returns Internalization result
   */
  async internalizeAction(
    args: InternalizeActionParams
  ): Promise<InternalizeResult> {
    // 1. Parse BEEF transaction
    // For now, we extract txid from the BEEF hex
    // TODO(Sprint-3A.5): Use BEEFService to parse BEEF properly
    const tx = Transaction.fromHex(args.tx);
    const txid = tx.id('hex') as string;

    // 2. Validate transaction structure
    if (!txid) {
      throw new Error('Invalid transaction - could not extract txid');
    }

    // 3. Process each output
    for (const outputSpec of args.outputs) {
      const { outputIndex, protocol, insertionRemittance, paymentRemittance } =
        outputSpec;

      if (protocol === 'basket insertion' && insertionRemittance) {
        // Store output in specified basket
        const outpoint = `${txid}.${outputIndex}`;

        // Extract output data from transaction
        const txOutput = tx.outputs[outputIndex];
        if (!txOutput) {
          throw new Error(`Output ${outputIndex} not found in transaction`);
        }

        this.basketManager.assignToBasket(
          this.baskets,
          insertionRemittance.basket,
          {
            outpoint,
            satoshis: txOutput.satoshis || 0,
            lockingScript: txOutput.lockingScript.toHex(),
            tags: insertionRemittance.tags || [],
            customInstructions: insertionRemittance.customInstructions,
          }
        );
      } else if (protocol === 'wallet payment' && paymentRemittance) {
        // TODO(Sprint-3A.4): Implement wallet payment protocol
        // This will use BRC-29 key derivation to increment balance
        // For now, we just note that this is not implemented
        console.warn(
          '[BRC100WalletService] wallet payment protocol not yet implemented'
        );
      }
    }

    // 4. Create action record with status='completed'
    // Extract inputs and outputs from transaction for display
    const inputs = tx.inputs.map((input, index) => ({
      outpoint: `${input.sourceTXID || 'unknown'}.${input.sourceOutputIndex ?? index}`,
      inputDescription: `Input ${index}`,
      unlockingScript: input.unlockingScript?.toHex(),
    }));

    const outputs = tx.outputs.map((output, index) => ({
      lockingScript: output.lockingScript.toHex(),
      satoshis: output.satoshis || 0,
      outputDescription: `Output ${index}`,
    }));

    const action = ActionHelpers.createActionRecord({
      txid,
      status: 'completed',
      description: args.description,
      labels: args.labels || [],
      inputs,
      outputs,
      tx, // CRITICAL: Store transaction for BEEF sourceTransaction lookups
    });

    this.actions.set(action.actionId, action);

    // 5. Call saveState()
    this.saveState();

    // 6. Return result
    return {
      success: true,
      txid,
      internalized: true,
    };
  }

  /**
   * List actions with optional filtering
   *
   * @param args - Query parameters
   * @returns List of actions
   */
  async listActions(args?: ListActionsParams): Promise<ListActionsResult> {
    let filtered = Array.from(this.actions.values());

    // Filter by labels if provided
    if (args?.labels && args.labels.length > 0) {
      const mode = args.labelQueryMode || 'any';

      filtered = filtered.filter((action) => {
        if (mode === 'all') {
          // All specified labels must be present
          return args.labels!.every((label) => action.labels.includes(label));
        } else {
          // At least one label must be present
          return args.labels!.some((label) => action.labels.includes(label));
        }
      });
    }

    // Build result
    const actions = filtered.map((action) => ({
      actionId: action.actionId,
      txid: action.txid,
      status: action.status,
      description: action.description,
      labels: action.labels,
      ...(args?.includeInputs && { inputs: action.inputs }),
      ...(args?.includeOutputs && { outputs: action.outputs }),
      createdAt: action.createdAt,
      updatedAt: action.updatedAt,
      blockHeight: action.blockHeight, // Include blockHeight for UI to calculate confirmations on-demand
    }));

    return {
      totalActions: actions.length,
      actions,
    };
  }

  /**
   * List outputs (UTXOs) with optional filtering
   *
   * By default, only returns UNLOCKED UTXOs (excludes locked ones).
   * Set includeLocked=true to include locked UTXOs.
   *
   * @param args - Query parameters
   * @returns List of outputs
   */
  async listOutputs(args?: ListOutputsParams): Promise<ListOutputsResult> {
    const allOutputs = this.basketManager.listOutputs(this.baskets, {
      basket: args?.basket,
      tags: args?.tags,
      tagQueryMode: args?.tagQueryMode,
    });

    // By default, exclude locked UTXOs (only return spendable)
    const filtered = args?.includeLocked
      ? allOutputs // Include all outputs (locked + unlocked)
      : allOutputs.filter((output) => !this.lockedUTXOs.has(output.outpoint)); // Exclude locked

    // Build result
    const outputs = filtered.map((output) => ({
      outpoint: output.outpoint,
      satoshis: output.satoshis,
      lockingScript: output.lockingScript,
      tags: output.tags,
      ...(args?.includeCustomInstructions && {
        customInstructions: output.customInstructions,
      }),
    }));

    return {
      totalOutputs: outputs.length,
      outputs,
    };
  }

  /**
   * Remove output from basket (BRC-100 compliance)
   *
   * @param outpoint - Format: "txid.vout"
   * @param basket - Optional: specific basket (if omitted, remove from all baskets)
   * @returns Confirmation
   */
  async relinquishOutput(
    outpoint: string,
    basket?: string
  ): Promise<{ relinquished: true }> {
    this.basketManager.relinquishOutput(this.baskets, outpoint, basket);

    // CRITICAL: Persist state after basket mutation
    this.saveState();

    return { relinquished: true };
  }

  /**
   * Clear wallet state (for testing or wallet reset)
   *
   * Removes all state from localStorage and memory:
   * - All actions
   * - All baskets
   * - All locked UTXOs
   * - All pending references
   * - Stops all confirmation tracking pollers
   */
  clearState(): void {
    if (typeof window === 'undefined') return;

    // Stop all active pollers to prevent memory leaks
    this.confirmationTracker.stopAll();

    // Clear localStorage
    this.stateManager.clear();

    // Clear in-memory state
    this.actions.clear();
    this.baskets = {};
    this.lockedUTXOs.clear();
    this.pendingReferences.clear();
  }

  /**
   * Check if a UTXO is locked (being spent by pending action)
   *
   * @param outpoint - UTXO outpoint (format: "txid.vout")
   * @returns true if locked, false if available for spending
   */
  public isUTXOLocked(outpoint: string): boolean {
    return this.lockedUTXOs.has(outpoint);
  }

  /**
   * Determine which projects to broadcast to based on baskets used in outputs
   *
   * Strategy:
   * - Returns array of project IDs for all baskets used in transaction
   * - Enables multi-project broadcast for cross-basket transactions
   * - Falls back to first basket project if no basket specified in outputs
   *
   * @param outputs - Transaction outputs with basket assignments
   * @returns Array of project IDs to broadcast to
   */
  private getProjectIdsForOutputs(
    outputs: Array<{ basket?: string }>
  ): string[] {
    // Collect unique baskets used in outputs
    const basketsUsed = new Set<string>();
    for (const output of outputs) {
      if (output.basket) {
        basketsUsed.add(output.basket);
      }
    }

    // Get project IDs for baskets
    const projectIds = Array.from(basketsUsed)
      .map((basket) => this.basketProjectMap[basket])
      .filter(Boolean) as string[];

    if (projectIds.length === 0) {
      throw new Error(
        'No basket projects configured. Cannot broadcast transaction.'
      );
    }

    // Return all project IDs for multi-project broadcast
    return projectIds;
  }
}
