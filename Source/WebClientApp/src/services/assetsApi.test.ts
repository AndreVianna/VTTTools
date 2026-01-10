import { describe, expect, it, vi } from 'vitest';
import { assetsApi } from './assetsApi';

vi.mock('./enhancedBaseQuery', () => ({
  createEnhancedBaseQuery: vi.fn(() => vi.fn()),
}));

describe('assetsApi', () => {

  describe('API configuration', () => {
    it('should have correct reducerPath', () => {
      expect(assetsApi.reducerPath).toBe('assetsApi');
    });

    it('should define all expected endpoints', () => {
      expect(assetsApi.endpoints.getAssets).toBeDefined();
      expect(assetsApi.endpoints.getAssetsPaged).toBeDefined();
      expect(assetsApi.endpoints.getAsset).toBeDefined();
      expect(assetsApi.endpoints.createAsset).toBeDefined();
      expect(assetsApi.endpoints.updateAsset).toBeDefined();
      expect(assetsApi.endpoints.deleteAsset).toBeDefined();
      expect(assetsApi.endpoints.cloneAsset).toBeDefined();
    });
  });

  describe('getAssets endpoint', () => {
    it('should be defined with correct type', () => {
      expect(assetsApi.endpoints.getAssets.useQuery).toBeDefined();
    });
  });

  describe('getAssetsPaged endpoint', () => {
    it('should be defined with correct type', () => {
      expect(assetsApi.endpoints.getAssetsPaged.useQuery).toBeDefined();
    });
  });

  describe('getAsset endpoint', () => {
    it('should be defined with correct type', () => {
      expect(assetsApi.endpoints.getAsset.useQuery).toBeDefined();
    });
  });

  describe('createAsset endpoint', () => {
    it('should be defined as mutation', () => {
      expect(assetsApi.endpoints.createAsset.useMutation).toBeDefined();
    });
  });

  describe('updateAsset endpoint', () => {
    it('should be defined as mutation', () => {
      expect(assetsApi.endpoints.updateAsset.useMutation).toBeDefined();
    });
  });

  describe('deleteAsset endpoint', () => {
    it('should be defined as mutation', () => {
      expect(assetsApi.endpoints.deleteAsset.useMutation).toBeDefined();
    });
  });

  describe('cloneAsset endpoint', () => {
    it('should be defined as mutation', () => {
      expect(assetsApi.endpoints.cloneAsset.useMutation).toBeDefined();
    });
  });

  describe('hook exports', () => {
    it('should export useGetAssetsQuery hook', async () => {
      const api = await import('./assetsApi');
      expect(typeof api.useGetAssetsQuery).toBe('function');
    });

    it('should export useGetAssetsPagedQuery hook', async () => {
      const api = await import('./assetsApi');
      expect(typeof api.useGetAssetsPagedQuery).toBe('function');
    });

    it('should export useGetAssetQuery hook', async () => {
      const api = await import('./assetsApi');
      expect(typeof api.useGetAssetQuery).toBe('function');
    });

    it('should export useCreateAssetMutation hook', async () => {
      const api = await import('./assetsApi');
      expect(typeof api.useCreateAssetMutation).toBe('function');
    });

    it('should export useUpdateAssetMutation hook', async () => {
      const api = await import('./assetsApi');
      expect(typeof api.useUpdateAssetMutation).toBe('function');
    });

    it('should export useDeleteAssetMutation hook', async () => {
      const api = await import('./assetsApi');
      expect(typeof api.useDeleteAssetMutation).toBe('function');
    });

    it('should export useCloneAssetMutation hook', async () => {
      const api = await import('./assetsApi');
      expect(typeof api.useCloneAssetMutation).toBe('function');
    });
  });
});
