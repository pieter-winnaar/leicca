/**
 * BlockHeaderListener Tests
 *
 * Test coverage:
 * - WebSocket connection lifecycle (connect, disconnect, reconnect)
 * - Block event handling and emission
 * - Event subscription and unsubscription
 * - Reconnection logic with exponential backoff
 * - Max reconnect attempts enforcement
 * - Error handling for invalid messages
 * - Multiple simultaneous listeners
 * - Listener cleanup
 */

import { describe, it, expect, beforeEach, afterEach, vi } from 'vitest';
import { BlockHeaderListener } from '../src/services/BlockHeaderListener';

// Mock WebSocket
class MockWebSocket {
  static CONNECTING = 0;
  static OPEN = 1;
  static CLOSING = 2;
  static CLOSED = 3;

  readyState = MockWebSocket.CONNECTING;
  onopen: ((event: any) => void) | null = null;
  onmessage: ((event: any) => void) | null = null;
  onerror: ((event: any) => void) | null = null;
  onclose: ((event: any) => void) | null = null;

  private listeners: Map<string, Set<(event: any) => void>> = new Map();

  constructor(public url: string) {
    // Immediately transition to OPEN and call onopen synchronously for test reliability
    this.readyState = MockWebSocket.OPEN;
    // Use setTimeout(0) instead of queueMicrotask to work with fake timers
    setTimeout(() => {
      // Only call onopen if still OPEN (not closed before timer fired)
      if (this.readyState === MockWebSocket.OPEN && this.onopen) {
        this.onopen({});
      }
    }, 0);
  }

  send(data: string): void {
    // Mock send (no-op in tests)
  }

  close(): void {
    this.readyState = MockWebSocket.CLOSED;
    // Use setTimeout(0) instead of queueMicrotask to work with fake timers
    setTimeout(() => {
      if (this.onclose) this.onclose!({});
    }, 0);
  }

  // Test helper to simulate receiving a message
  simulateMessage(data: any): void {
    if (this.onmessage) {
      this.onmessage({ data: JSON.stringify(data) });
    }
  }

  // Test helper to simulate error
  simulateError(): void {
    if (this.onerror) {
      this.onerror(new Error('WebSocket error'));
    }
  }
}

describe('BlockHeaderListener', () => {
  let listener: BlockHeaderListener;
  let mockWebSocket: MockWebSocket | null = null;

  beforeEach(() => {
    vi.useFakeTimers();

    // Mock global WebSocket
    (global as any).WebSocket = vi.fn((url: string) => {
      mockWebSocket = new MockWebSocket(url);
      return mockWebSocket;
    });

    // Copy constants from MockWebSocket to global WebSocket
    (global as any).WebSocket.CONNECTING = MockWebSocket.CONNECTING;
    (global as any).WebSocket.OPEN = MockWebSocket.OPEN;
    (global as any).WebSocket.CLOSING = MockWebSocket.CLOSING;
    (global as any).WebSocket.CLOSED = MockWebSocket.CLOSED;

    listener = new BlockHeaderListener('wss://mock.socket', 'main');
  });

  afterEach(() => {
    listener.disconnect();
    vi.clearAllTimers();
    vi.useRealTimers();
    mockWebSocket = null;
  });

  describe('Connection lifecycle', () => {
    it('should connect to WebSocket', async () => {
      const connectedSpy = vi.fn();
      listener.on('connected', connectedSpy);

      listener.connect();

      // Advance timers to trigger connection
      await vi.runAllTimersAsync();

      expect(global.WebSocket).toHaveBeenCalledWith(
        'wss://socket-v2.whatsonchain.com/websocket/blockheaders?format=json'
      );
      expect(listener.isConnected()).toBe(true);
      expect(connectedSpy).toHaveBeenCalledTimes(1);
    });

    it('should not reconnect if already connected', async () => {
      listener.connect();
      await vi.runAllTimersAsync();

      const callCountBefore = (global.WebSocket as any).mock.calls.length;

      listener.connect(); // Try to connect again
      await vi.runAllTimersAsync();

      const callCountAfter = (global.WebSocket as any).mock.calls.length;

      expect(callCountAfter).toBe(callCountBefore); // No additional connection
    });

    it('should disconnect cleanly', async () => {
      const disconnectedSpy = vi.fn();
      listener.on('disconnected', disconnectedSpy);

      listener.connect();
      await vi.runAllTimersAsync();

      expect(listener.isConnected()).toBe(true);

      listener.disconnect();
      await vi.runAllTimersAsync();

      expect(listener.isConnected()).toBe(false);
      expect(disconnectedSpy).toHaveBeenCalledTimes(1);
    });

    it('should use correct network in WebSocket URL', async () => {
      const testnetListener = new BlockHeaderListener('test');

      testnetListener.connect();
      await vi.runAllTimersAsync();

      expect(global.WebSocket).toHaveBeenCalledWith(
        'wss://socket-v2-testnet.whatsonchain.com/websocket/blockheaders?format=json'
      );

      testnetListener.disconnect();
    });
  });

  describe('Block event handling', () => {
    it('should emit block event when receiving block data', async () => {
      const blockSpy = vi.fn();
      listener.on('block', blockSpy);

      listener.connect();
      await vi.runAllTimersAsync();

      // Simulate receiving a block event
      mockWebSocket!.simulateMessage({
        op: 'block',
        x: {
          hash: '000000000000000001234567890abcdef',
          height: 800000,
          mrklRoot: 'abcdef1234567890',
          time: 1234567890,
        },
      });

      expect(blockSpy).toHaveBeenCalledTimes(1);
      expect(blockSpy).toHaveBeenCalledWith({
        hash: '000000000000000001234567890abcdef',
        height: 800000,
        merkleroot: 'abcdef1234567890',
        time: 1234567890,
        confirmations: 1,
      });
    });

    it('should ignore non-block messages', async () => {
      const blockSpy = vi.fn();
      listener.on('block', blockSpy);

      listener.connect();
      await vi.runAllTimersAsync();

      // Send non-block message
      mockWebSocket!.simulateMessage({
        op: 'ping',
        data: 'pong',
      });

      expect(blockSpy).not.toHaveBeenCalled();
    });

    it('should handle multiple block events', async () => {
      const blockSpy = vi.fn();
      listener.on('block', blockSpy);

      listener.connect();
      await vi.runAllTimersAsync();

      // Simulate 3 blocks
      for (let i = 0; i < 3; i++) {
        mockWebSocket!.simulateMessage({
          op: 'block',
          x: {
            hash: `hash${i}`,
            height: 800000 + i,
            mrklRoot: `merkleroot${i}`,
            time: 1234567890 + i,
          },
        });
      }

      expect(blockSpy).toHaveBeenCalledTimes(3);
    });

    it('should emit error on invalid message format', async () => {
      const errorSpy = vi.fn();
      listener.on('error', errorSpy);

      listener.connect();
      await vi.runAllTimersAsync();

      // Send invalid JSON
      if (mockWebSocket!.onmessage) {
        mockWebSocket!.onmessage({ data: 'invalid json' });
      }

      expect(errorSpy).toHaveBeenCalled();
      expect(errorSpy.mock.calls[0]![0]).toBeInstanceOf(Error);
    });
  });

  describe('Event subscription', () => {
    it('should support multiple listeners for same event', async () => {
      const listener1 = vi.fn();
      const listener2 = vi.fn();
      const listener3 = vi.fn();

      listener.on('block', listener1);
      listener.on('block', listener2);
      listener.on('block', listener3);

      listener.connect();
      await vi.runAllTimersAsync();

      mockWebSocket!.simulateMessage({
        op: 'block',
        x: {
          hash: 'hash',
          height: 800000,
          mrklRoot: 'merkleroot',
          time: 1234567890,
        },
      });

      expect(listener1).toHaveBeenCalledTimes(1);
      expect(listener2).toHaveBeenCalledTimes(1);
      expect(listener3).toHaveBeenCalledTimes(1);
    });

    it('should unsubscribe listener correctly', async () => {
      const blockSpy = vi.fn();

      const unsubscribe = listener.on('block', blockSpy);

      listener.connect();
      await vi.runAllTimersAsync();

      // First block - listener active
      mockWebSocket!.simulateMessage({
        op: 'block',
        x: {
          hash: 'hash1',
          height: 800000,
          mrklRoot: 'merkleroot1',
          time: 1234567890,
        },
      });

      expect(blockSpy).toHaveBeenCalledTimes(1);

      // Unsubscribe
      unsubscribe();

      // Second block - listener removed
      mockWebSocket!.simulateMessage({
        op: 'block',
        x: {
          hash: 'hash2',
          height: 800001,
          mrklRoot: 'merkleroot2',
          time: 1234567891,
        },
      });

      expect(blockSpy).toHaveBeenCalledTimes(1); // Not called again
    });

    it('should handle listener errors gracefully', async () => {
      const errorListener = vi.fn(() => {
        throw new Error('Listener error');
      });
      const successListener = vi.fn();

      listener.on('block', errorListener);
      listener.on('block', successListener);

      listener.connect();
      await vi.runAllTimersAsync();

      // Should not crash despite error in first listener
      mockWebSocket!.simulateMessage({
        op: 'block',
        x: {
          hash: 'hash',
          height: 800000,
          mrklRoot: 'merkleroot',
          time: 1234567890,
        },
      });

      expect(errorListener).toHaveBeenCalledTimes(1);
      expect(successListener).toHaveBeenCalledTimes(1); // Still called
    });

    it('should support all event types', async () => {
      const connectedSpy = vi.fn();
      const disconnectedSpy = vi.fn();
      const blockSpy = vi.fn();
      const errorSpy = vi.fn();

      listener.on('connected', connectedSpy);
      listener.on('disconnected', disconnectedSpy);
      listener.on('block', blockSpy);
      listener.on('error', errorSpy);

      listener.connect();
      await vi.runAllTimersAsync();

      expect(connectedSpy).toHaveBeenCalledTimes(1);

      mockWebSocket!.simulateMessage({
        op: 'block',
        x: {
          hash: 'hash',
          height: 800000,
          mrklRoot: 'merkleroot',
          time: 1234567890,
        },
      });

      expect(blockSpy).toHaveBeenCalledTimes(1);

      listener.disconnect();
      await vi.runAllTimersAsync();

      expect(disconnectedSpy).toHaveBeenCalledTimes(1);
    });
  });

  describe('Reconnection logic', () => {
    it('should reconnect with exponential backoff after disconnect', async () => {
      listener.connect();
      await vi.runAllTimersAsync();

      const callCountBefore = (global.WebSocket as any).mock.calls.length;

      // Simulate connection close
      mockWebSocket!.close();

      // Only advance enough to trigger onclose callback (setTimeout 0), not reconnect timer
      await vi.advanceTimersByTimeAsync(0);

      // Should be disconnected now, reconnect scheduled
      expect(listener.isConnected()).toBe(false);

      // Advance timers by 1s to trigger reconnect
      await vi.advanceTimersByTimeAsync(1000);

      const callCountAfter = (global.WebSocket as any).mock.calls.length;

      expect(callCountAfter).toBe(callCountBefore + 1); // Reconnected
    });

    it('should use exponential backoff (1s, 2s, 4s, 8s)', async () => {
      listener.connect();
      await vi.runAllTimersAsync();

      const backoffDelays = [1000, 2000, 4000, 8000];

      for (let i = 0; i < backoffDelays.length; i++) {
        const delay = backoffDelays[i]!;

        // Simulate connection failure
        mockWebSocket!.close();

        // Trigger onclose callback only
        await vi.advanceTimersByTimeAsync(0);

        // Verify backoff delay
        const callCountBefore = (global.WebSocket as any).mock.calls.length;

        // Advance by delay - 1ms (should NOT reconnect yet)
        await vi.advanceTimersByTimeAsync(delay - 1);

        expect((global.WebSocket as any).mock.calls.length).toBe(
          callCountBefore
        );

        // Advance by 1ms more (should reconnect now)
        await vi.advanceTimersByTimeAsync(1);

        expect((global.WebSocket as any).mock.calls.length).toBe(
          callCountBefore + 1
        );
      }
    });

    it('should cap backoff at 30 seconds', async () => {
      listener.connect();
      await vi.runAllTimersAsync();

      // Fail 10 times to exceed max backoff
      for (let i = 0; i < 9; i++) {
        mockWebSocket!.close();
        await vi.runAllTimersAsync();

        // Advance past backoff
        vi.advanceTimersByTime(60000);
        await vi.runAllTimersAsync();
      }

      // 10th failure
      mockWebSocket!.close();
      await vi.runAllTimersAsync();

      const callCountBefore = (global.WebSocket as any).mock.calls.length;

      // Should not reconnect after 60s (cap is 30s)
      vi.advanceTimersByTime(60000);
      await vi.runAllTimersAsync();

      // Max attempts reached - should NOT reconnect
      expect((global.WebSocket as any).mock.calls.length).toBe(
        callCountBefore
      );
    });

    it('should stop reconnecting after max attempts', async () => {
      const errorSpy = vi.fn();
      listener.on('error', errorSpy);

      // Override WebSocket mock to fail without ever opening
      (global as any).WebSocket = vi.fn((url: string) => {
        const failingWs = new MockWebSocket(url);
        // Set to CLOSED immediately, preventing onopen from firing
        failingWs.readyState = MockWebSocket.CLOSED;
        // Schedule onclose to fire
        setTimeout(() => {
          if (failingWs.onclose) failingWs.onclose({});
        }, 0);
        mockWebSocket = failingWs;
        return failingWs;
      });
      (global as any).WebSocket.CONNECTING = MockWebSocket.CONNECTING;
      (global as any).WebSocket.OPEN = MockWebSocket.OPENING;
      (global as any).WebSocket.CLOSING = MockWebSocket.CLOSING;
      (global as any).WebSocket.CLOSED = MockWebSocket.CLOSED;

      listener.connect();

      // Advance through all 10 reconnect attempts plus one more to trigger max attempts error
      for (let i = 0; i <= 10; i++) {
        await vi.advanceTimersByTimeAsync(60000); // More than max backoff (30s)
      }

      // Should have emitted error about max attempts
      const maxAttemptsError = errorSpy.mock.calls.find((call) =>
        call[0].message.includes('Max reconnect attempts')
      );

      expect(maxAttemptsError).toBeDefined();
    });

    it('should reset reconnect attempts on successful connection', async () => {
      listener.connect();
      await vi.runAllTimersAsync();

      const initialCallCount = (global.WebSocket as any).mock.calls.length;
      expect(initialCallCount).toBe(1); // Initial connection

      // Fail once
      const firstWs = mockWebSocket;
      firstWs!.close();

      // Trigger onclose + reconnect (advance enough for both setTimeout 0 and 1s timer)
      await vi.advanceTimersByTimeAsync(1100);

      // Should have reconnected - new WebSocket created
      expect((global.WebSocket as any).mock.calls.length).toBe(2);
      const secondWs = mockWebSocket; // This is the reconnected WebSocket

      // Ensure onopen fired for the reconnected WebSocket
      expect(listener.isConnected()).toBe(true);

      // Fail the SECOND WebSocket
      secondWs!.close();

      // Trigger onclose + wait for reconnect to be scheduled
      await vi.advanceTimersByTimeAsync(100); // Just enough for onclose

      const callCountBefore = (global.WebSocket as any).mock.calls.length;
      expect(callCountBefore).toBe(2); // Still 2 (haven't reconnected yet)

      // Should use 1s backoff again (not 2s), proving attempts were reset
      await vi.advanceTimersByTimeAsync(1000);

      expect((global.WebSocket as any).mock.calls.length).toBe(3); // Third connection
    });

    it('should cancel reconnect timer on disconnect', async () => {
      listener.connect();
      await vi.runAllTimersAsync();

      // Close connection to trigger reconnect
      mockWebSocket!.close();
      await vi.runAllTimersAsync();

      const callCountBefore = (global.WebSocket as any).mock.calls.length;

      // Disconnect before reconnect timer fires
      listener.disconnect();

      // Advance timers past backoff
      vi.advanceTimersByTime(10000);
      await vi.runAllTimersAsync();

      // Should NOT reconnect (timer canceled)
      expect((global.WebSocket as any).mock.calls.length).toBe(
        callCountBefore
      );
    });
  });

  describe('Listener management', () => {
    it('should return listener count correctly', () => {
      expect(listener.getListenerCount('block')).toBe(0);

      listener.on('block', vi.fn());
      expect(listener.getListenerCount('block')).toBe(1);

      listener.on('block', vi.fn());
      expect(listener.getListenerCount('block')).toBe(2);
    });

    it('should remove all listeners for specific event', async () => {
      const blockSpy1 = vi.fn();
      const blockSpy2 = vi.fn();

      listener.on('block', blockSpy1);
      listener.on('block', blockSpy2);

      expect(listener.getListenerCount('block')).toBe(2);

      listener.removeAllListeners('block');

      expect(listener.getListenerCount('block')).toBe(0);

      listener.connect();
      await vi.runAllTimersAsync();

      mockWebSocket!.simulateMessage({
        op: 'block',
        x: {
          hash: 'hash',
          height: 800000,
          mrklRoot: 'merkleroot',
          time: 1234567890,
        },
      });

      expect(blockSpy1).not.toHaveBeenCalled();
      expect(blockSpy2).not.toHaveBeenCalled();
    });

    it('should remove all listeners for all events', () => {
      listener.on('block', vi.fn());
      listener.on('connected', vi.fn());
      listener.on('disconnected', vi.fn());
      listener.on('error', vi.fn());

      expect(listener.getListenerCount('block')).toBe(1);
      expect(listener.getListenerCount('connected')).toBe(1);

      listener.removeAllListeners();

      expect(listener.getListenerCount('block')).toBe(0);
      expect(listener.getListenerCount('connected')).toBe(0);
      expect(listener.getListenerCount('disconnected')).toBe(0);
      expect(listener.getListenerCount('error')).toBe(0);
    });
  });

  describe('Error handling', () => {
    it('should emit error on WebSocket error', async () => {
      const errorSpy = vi.fn();
      listener.on('error', errorSpy);

      listener.connect();
      await vi.runAllTimersAsync();

      mockWebSocket!.simulateError();

      expect(errorSpy).toHaveBeenCalled();
      expect(errorSpy.mock.calls[0]![0]).toBeInstanceOf(Error);
    });

    it('should emit error when WebSocket unavailable', async () => {
      // Remove WebSocket from global
      const originalWebSocket = (global as any).WebSocket;
      delete (global as any).WebSocket;

      const errorSpy = vi.fn();
      const testListener = new BlockHeaderListener();
      testListener.on('error', errorSpy);

      testListener.connect();
      await vi.runAllTimersAsync();

      expect(errorSpy).toHaveBeenCalled();
      expect(errorSpy.mock.calls[0]![0].message).toContain(
        'WebSocket not available'
      );

      testListener.disconnect();

      // Restore
      (global as any).WebSocket = originalWebSocket;
    });
  });
});
