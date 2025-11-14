/**
 * BroadcastService Tests
 *
 * Test coverage:
 * - Configure SDK client for project
 * - Broadcast transaction to single project
 * - Broadcast transaction to multiple projects
 * - Client caching
 * - Error handling
 */

import { describe, it, expect, vi, beforeEach } from 'vitest';
import { BroadcastService } from '../src/services/BroadcastService';
import type { MintBlueSDKService, MintblueClient } from '@design-system-demo/sdk-integration';

describe('BroadcastService', () => {
  let service: BroadcastService;
  let mockMintblueSDK: MintBlueSDKService;
  let mockClient: MintblueClient;

  beforeEach(() => {
    // Mock MintblueClient
    mockClient = {
      keys: {
        findKeyByName: vi.fn()
      },
      createTransaction: vi.fn(),
      listTransactions: vi.fn()
    } as any;

    // Mock MintBlueSDKService
    mockMintblueSDK = {
      createClient: vi.fn().mockResolvedValue(mockClient),
      broadcastTransaction: vi.fn().mockResolvedValue({
        success: true,
        txid: '0123456789abcdef'
      })
    } as any;

    // Create service with mocked dependency
    service = new BroadcastService(mockMintblueSDK);
  });

  describe('configureClient', () => {
    it('should configure SDK client for project', async () => {
      const config = {
        projectId: 'project1',
        sdkToken: 'token_abc123',
        name: 'Test Project'
      };

      const client = await service.configureClient(config);

      expect(client).toBe(mockClient);
      expect(mockMintblueSDK.createClient).toHaveBeenCalledWith('token_abc123', undefined);
    });

    it('should cache configured clients', async () => {
      const config = {
        projectId: 'project1',
        sdkToken: 'token_abc123'
      };

      // Configure twice
      const client1 = await service.configureClient(config);
      const client2 = await service.configureClient(config);

      // Should be same instance (cached)
      expect(client1).toBe(client2);
      // createClient should only be called once
      expect(mockMintblueSDK.createClient).toHaveBeenCalledTimes(1);
    });

    it('should create separate clients for different projects', async () => {
      const config1 = {
        projectId: 'project1',
        sdkToken: 'token_abc123'
      };
      const config2 = {
        projectId: 'project2',
        sdkToken: 'token_xyz789'
      };

      await service.configureClient(config1);
      await service.configureClient(config2);

      // Should be called twice for different projects
      expect(mockMintblueSDK.createClient).toHaveBeenCalledTimes(2);
    });

    it('should use custom create function for testing', async () => {
      const mockCreateFn = vi.fn().mockResolvedValue(mockClient);
      const config = {
        projectId: 'project1',
        sdkToken: 'token_abc123'
      };

      await service.configureClient(config, mockCreateFn);

      expect(mockMintblueSDK.createClient).toHaveBeenCalledWith('token_abc123', mockCreateFn);
    });
  });

  describe('broadcast', () => {
    it('should broadcast transaction to project', async () => {
      const tx = '0100000001...';  // Transaction hex
      const projectId = 'project1';

      // Configure client first
      await service.configureClient({ projectId, sdkToken: 'token1' });

      const result = await service.broadcast(projectId, tx);

      expect(result).toEqual({
        projectId: 'project1',
        txid: '0123456789abcdef',
        success: true
      });
      expect(mockMintblueSDK.broadcastTransaction).toHaveBeenCalledWith(mockClient, tx, projectId);
    });

    it('should handle broadcast errors gracefully', async () => {
      const tx = '0100000001...';
      const projectId = 'project1';

      // Configure client first
      await service.configureClient({ projectId, sdkToken: 'token1' });

      // Mock error
      (mockMintblueSDK.broadcastTransaction as any).mockRejectedValue(
        new Error('Network error')
      );

      const result = await service.broadcast(projectId, tx);

      expect(result).toEqual({
        projectId: 'project1',
        txid: '',
        success: false,
        error: 'Network error'
      });
    });

    it('should extract txid from broadcast result', async () => {
      const tx = '0100000001...';
      const projectId = 'project1';

      // Configure client first
      await service.configureClient({ projectId, sdkToken: 'token1' });

      // Mock result with different txid
      (mockMintblueSDK.broadcastTransaction as any).mockResolvedValue({
        success: true,
        txid: 'fedcba9876543210'
      });

      const result = await service.broadcast(projectId, tx);

      expect(result.txid).toBe('fedcba9876543210');
      expect(result.success).toBe(true);
    });
  });

  describe('broadcastMultiple', () => {
    it('should broadcast to multiple projects', async () => {
      const configs = [
        { projectId: 'project1', sdkToken: 'token1' },
        { projectId: 'project2', sdkToken: 'token2' },
        { projectId: 'project3', sdkToken: 'token3' }
      ];
      const tx = '0100000001...';

      const results = await service.broadcastMultiple(configs, tx);

      expect(results).toHaveLength(3);
      expect(results[0].projectId).toBe('project1');
      expect(results[1].projectId).toBe('project2');
      expect(results[2].projectId).toBe('project3');
      expect(results.every(r => r.success)).toBe(true);
    });

    it('should continue broadcasting even if one project fails', async () => {
      const configs = [
        { projectId: 'project1', sdkToken: 'token1' },
        { projectId: 'project2', sdkToken: 'token2' },
        { projectId: 'project3', sdkToken: 'token3' }
      ];
      const tx = '0100000001...';

      // Mock second broadcast to fail
      (mockMintblueSDK.broadcastTransaction as any)
        .mockResolvedValueOnce({ success: true, txid: 'txid1' })
        .mockRejectedValueOnce(new Error('Project 2 error'))
        .mockResolvedValueOnce({ success: true, txid: 'txid3' });

      const results = await service.broadcastMultiple(configs, tx);

      expect(results).toHaveLength(3);
      expect(results[0].success).toBe(true);
      expect(results[1].success).toBe(false);
      expect(results[1].error).toBe('Project 2 error');
      expect(results[2].success).toBe(true);
    });

    it('should handle client configuration errors', async () => {
      const configs = [
        { projectId: 'project1', sdkToken: 'invalid_token' }
      ];
      const tx = '0100000001...';

      // Mock createClient to fail
      (mockMintblueSDK.createClient as any).mockRejectedValue(
        new Error('Authentication failed')
      );

      const results = await service.broadcastMultiple(configs, tx);

      expect(results).toHaveLength(1);
      expect(results[0].success).toBe(false);
      expect(results[0].error).toBe('Authentication failed');
    });

    it('should use custom create function for all projects', async () => {
      const configs = [
        { projectId: 'project1', sdkToken: 'token1' },
        { projectId: 'project2', sdkToken: 'token2' }
      ];
      const tx = '0100000001...';
      const mockCreateFn = vi.fn().mockResolvedValue(mockClient);

      await service.broadcastMultiple(configs, tx, mockCreateFn);

      expect(mockMintblueSDK.createClient).toHaveBeenCalledWith('token1', mockCreateFn);
      expect(mockMintblueSDK.createClient).toHaveBeenCalledWith('token2', mockCreateFn);
    });
  });

  describe('cache management', () => {
    it('should clear client cache', async () => {
      const config = {
        projectId: 'project1',
        sdkToken: 'token_abc123'
      };

      // Configure and cache client
      await service.configureClient(config);
      expect(mockMintblueSDK.createClient).toHaveBeenCalledTimes(1);

      // Clear cache
      service.clearCache();

      // Configure again - should create new client
      await service.configureClient(config);
      expect(mockMintblueSDK.createClient).toHaveBeenCalledTimes(2);
    });

    it('should get cached client', async () => {
      const config = {
        projectId: 'project1',
        sdkToken: 'token_abc123'
      };

      // Before configuration
      expect(service.getCachedClient('project1')).toBeUndefined();

      // After configuration
      await service.configureClient(config);
      expect(service.getCachedClient('project1')).toBe(mockClient);
    });

    it('should return undefined for non-existent project', () => {
      expect(service.getCachedClient('non_existent')).toBeUndefined();
    });
  });

  describe('edge cases', () => {
    it('should handle empty project configurations array', async () => {
      const tx = '0100000001...';
      const results = await service.broadcastMultiple([], tx);

      expect(results).toHaveLength(0);
    });

    it('should handle project config with minimal fields', async () => {
      const config = {
        projectId: 'minimal',
        sdkToken: 'token'
        // No optional name/description
      };

      const client = await service.configureClient(config);

      expect(client).toBe(mockClient);
    });

    it('should handle non-Error exceptions in broadcast', async () => {
      const tx = '0100000001...';
      const projectId = 'project1';

      // Configure client first
      await service.configureClient({ projectId, sdkToken: 'token1' });

      // Mock throwing non-Error
      (mockMintblueSDK.broadcastTransaction as any).mockRejectedValue('String error');

      const result = await service.broadcast(projectId, tx);

      expect(result.success).toBe(false);
      expect(result.error).toBe('String error');
    });
  });
});
