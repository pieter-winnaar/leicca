/**
 * BlockHeaderListener
 *
 * WebSocket-based block header listener for real-time blockchain events.
 * Subscribes to WhatsOnChain WebSocket for instant block notifications.
 *
 * Benefits:
 * - No polling intervals (instant notifications)
 * - Reduced API calls
 * - Lower latency for confirmation tracking
 * - Event-driven architecture
 *
 * Tier: LEAF (no service dependencies)
 * External Dependencies: WhatsOnChain WebSocket API (wss://socket.whatsonchain.com)
 */

import type { BlockHeader } from '../types';

export interface BlockHeaderEvents {
  block: (header: BlockHeader) => void;
  connected: () => void;
  disconnected: () => void;
  error: (error: Error) => void;
}

/**
 * WebSocket Block Header Listener
 *
 * Subscribes to block header events from WhatsOnChain WebSocket.
 * Eliminates polling by receiving real-time block notifications.
 */
export class BlockHeaderListener {
  private ws: WebSocket | null = null;
  private reconnectAttempts = 0;
  private readonly MAX_RECONNECT_ATTEMPTS = 10;
  private readonly wsUrl: string;
  private reconnectTimer: ReturnType<typeof setTimeout> | null = null;
  private manualDisconnect = false; // Flag to prevent auto-reconnect after manual disconnect

  // Event listeners storage
  private listeners: {
    block: Array<(header: BlockHeader) => void>;
    connected: Array<() => void>;
    disconnected: Array<() => void>;
    error: Array<(error: Error) => void>;
  } = {
    block: [],
    connected: [],
    disconnected: [],
    error: [],
  };

  constructor(
    network: 'main' | 'test' | 'stn' = 'main'
  ) {
    // WhatsOnChain WebSocket V2 endpoints
    if (network === 'test') {
      this.wsUrl = 'wss://socket-v2-testnet.whatsonchain.com/websocket/blockheaders?format=json';
    } else {
      // main and stn both use mainnet endpoint
      this.wsUrl = 'wss://socket-v2.whatsonchain.com/websocket/blockheaders?format=json';
    }
  }

  /**
   * Connect to WebSocket and start listening
   */
  connect(): void {
    if (this.ws) {
      console.warn('[BlockHeaderListener] Already connected');
      return;
    }

    this.manualDisconnect = false; // Reset manual disconnect flag
    this.establishConnection();
  }

  /**
   * Disconnect from WebSocket
   */
  disconnect(): void {
    this.manualDisconnect = true; // Set flag to prevent auto-reconnect

    // Clear any pending reconnect timer
    if (this.reconnectTimer) {
      clearTimeout(this.reconnectTimer);
      this.reconnectTimer = null;
    }

    if (this.ws) {
      this.ws.close();
      this.ws = null;
    }

    this.reconnectAttempts = 0;
  }

  /**
   * Check if WebSocket is connected
   */
  isConnected(): boolean {
    // Use numeric constant 1 (OPEN) instead of WebSocket.OPEN for test compatibility
    return this.ws !== null && this.ws.readyState === 1;
  }

  /**
   * Subscribe to block events
   *
   * @param event - Event type to listen for
   * @param callback - Callback function
   * @returns Unsubscribe function
   */
  on<K extends keyof BlockHeaderEvents>(
    event: K,
    callback: BlockHeaderEvents[K]
  ): () => void {
    this.listeners[event].push(callback as any);

    // Return unsubscribe function
    return () => {
      const index = this.listeners[event].indexOf(callback as any);
      if (index > -1) {
        this.listeners[event].splice(index, 1);
      }
    };
  }

  /**
   * Establish WebSocket connection
   */
  private establishConnection(): void {
    try {
      // Check if WebSocket is available (browser/Node.js with polyfill)
      if (typeof WebSocket === 'undefined') {
        throw new Error(
          'WebSocket not available. Use ws package for Node.js environments.'
        );
      }

      this.ws = new WebSocket(this.wsUrl);

      this.ws.onopen = () => {
        console.log('[BlockHeaderListener] Connected to WhatsOnChain V2 WebSocket');
        this.reconnectAttempts = 0;

        // V2 API auto-streams block headers once connected (no subscription message needed)
        // Emit connected event
        this.emitEvent('connected');
      };

      this.ws.onmessage = async (event) => {
        try {
          // Handle Blob messages (browser WebSocket may send Blob instead of string)
          let messageText: string;
          if (event.data instanceof Blob) {
            messageText = await event.data.text();
          } else {
            messageText = event.data;
          }

          const data = JSON.parse(messageText);

          // V2 format: {"channel":"woc:blockHeader","pub":{"data":{...}}}
          if (data.channel === 'woc:blockHeader' && data.pub?.data) {
            const blockData = data.pub.data;
            const header: BlockHeader = {
              hash: blockData.hash,
              height: blockData.height,
              merkleroot: blockData.merkleroot,
              time: blockData.time,
              confirmations: blockData.confirmations ?? 0,
            };

            console.log(`[BlockHeaderListener] New block ${header.height}: ${header.hash.slice(0, 16)}...`);

            // Emit block event to all listeners
            this.emitEvent('block', header);
          }
          // Legacy V1 format support (kept for compatibility)
          else if (data.op === 'block') {
            const header: BlockHeader = {
              hash: data.x.hash,
              height: data.x.height,
              merkleroot: data.x.mrklRoot,
              time: data.x.time,
              confirmations: 1,
            };

            console.log(`[BlockHeaderListener] New block ${header.height}: ${header.hash.slice(0, 16)}... (V1)`);

            // Emit block event to all listeners
            this.emitEvent('block', header);
          }
        } catch (error) {
          console.error('[BlockHeaderListener] Error parsing message:', error);
          this.emitEvent(
            'error',
            new Error(
              `Failed to parse message: ${error instanceof Error ? error.message : String(error)}`
            )
          );
        }
      };

      this.ws.onerror = (error) => {
        console.error('[BlockHeaderListener] WebSocket error:', error);
        this.emitEvent('error', new Error('WebSocket connection error'));
      };

      this.ws.onclose = () => {
        console.log('[BlockHeaderListener] Connection closed');
        this.ws = null;

        // Emit disconnected event
        this.emitEvent('disconnected');

        // Attempt reconnection
        this.scheduleReconnect();
      };
    } catch (error) {
      console.error('[BlockHeaderListener] Failed to connect:', error);
      this.emitEvent(
        'error',
        new Error(
          `Connection failed: ${error instanceof Error ? error.message : String(error)}`
        )
      );
      this.scheduleReconnect();
    }
  }

  /**
   * Schedule reconnection with exponential backoff
   */
  private scheduleReconnect(): void {
    // Don't reconnect if manual disconnect
    if (this.manualDisconnect) {
      return;
    }

    if (this.reconnectAttempts >= this.MAX_RECONNECT_ATTEMPTS) {
      console.error('[BlockHeaderListener] Max reconnect attempts reached');
      this.emitEvent(
        'error',
        new Error(
          `Max reconnect attempts (${this.MAX_RECONNECT_ATTEMPTS}) reached`
        )
      );
      return;
    }

    this.reconnectAttempts++;

    // Exponential backoff: 1s, 2s, 4s, 8s, ..., max 30s
    const backoff = Math.min(1000 * Math.pow(2, this.reconnectAttempts - 1), 30000);

    console.log(
      `[BlockHeaderListener] Reconnecting in ${backoff}ms (attempt ${this.reconnectAttempts})`
    );

    this.reconnectTimer = setTimeout(() => {
      this.reconnectTimer = null;
      this.establishConnection();
    }, backoff);
  }

  /**
   * Emit event to all listeners
   */
  private emitEvent<K extends keyof BlockHeaderEvents>(
    event: K,
    ...args: Parameters<BlockHeaderEvents[K]>
  ): void {
    for (const listener of this.listeners[event]) {
      try {
        (listener as any)(...args);
      } catch (error) {
        console.error(`[BlockHeaderListener] Listener error for ${event}:`, error);
      }
    }
  }

  /**
   * Get number of active listeners for an event
   *
   * @param event - Event type
   * @returns Number of listeners
   */
  getListenerCount(event: keyof BlockHeaderEvents): number {
    return this.listeners[event].length;
  }

  /**
   * Remove all listeners for an event
   *
   * @param event - Event type (optional, removes all if not specified)
   */
  removeAllListeners(event?: keyof BlockHeaderEvents): void {
    if (event) {
      this.listeners[event] = [];
    } else {
      this.listeners = {
        block: [],
        connected: [],
        disconnected: [],
        error: [],
      };
    }
  }
}
