import { describe, it, expect } from 'vitest';
import { renderHook, act } from '@testing-library/react';
import { ClipboardProvider } from './ClipboardContext';
import { useClipboard } from './useClipboard';
import type { PlacedAsset } from '../types/domain';
import { AssetKind } from '../types/domain';

const createMockPlacedAsset = (id: string, name = 'Test Asset'): PlacedAsset => ({
  id,
  assetId: `asset-${id}`,
  asset: {
    id: `asset-${id}`,
    ownerId: 'owner-1',
    kind: AssetKind.Object,
    name,
    description: 'Test asset description',
    isPublished: true,
    isPublic: false,
    resources: [],
    createdAt: '2025-01-01T00:00:00Z',
    updatedAt: '2025-01-01T00:00:00Z',
  },
  position: { x: 100, y: 100 },
  size: { width: 50, height: 50 },
  rotation: 0,
  layer: 'objects',
  index: 1,
  number: 1,
  name
});

describe('ClipboardContext', () => {
  describe('copyAssets', () => {
    it('should store assets with copy operation', () => {
      const { result } = renderHook(() => useClipboard(), {
        wrapper: ClipboardProvider,
      });

      const mockAsset = createMockPlacedAsset('1');
      const sceneId = 'scene-123';

      act(() => {
        result.current.copyAssets([mockAsset], sceneId);
      });

      expect(result.current.clipboard.assets).toHaveLength(1);
      expect(result.current.clipboard.assets[0]).toEqual(mockAsset);
      expect(result.current.clipboard.operation).toBe('copy');
      expect(result.current.clipboard.sourceSceneId).toBe(sceneId);
    });

    it('should store multiple assets', () => {
      const { result } = renderHook(() => useClipboard(), {
        wrapper: ClipboardProvider,
      });

      const asset1 = createMockPlacedAsset('1', 'Asset 1');
      const asset2 = createMockPlacedAsset('2', 'Asset 2');
      const asset3 = createMockPlacedAsset('3', 'Asset 3');

      act(() => {
        result.current.copyAssets([asset1, asset2, asset3], 'scene-123');
      });

      expect(result.current.clipboard.assets).toHaveLength(3);
      expect(result.current.clipboard.assets).toEqual([asset1, asset2, asset3]);
    });

    it('should create copy of assets array', () => {
      const { result } = renderHook(() => useClipboard(), {
        wrapper: ClipboardProvider,
      });

      const mockAsset = createMockPlacedAsset('1');
      const originalArray = [mockAsset];

      act(() => {
        result.current.copyAssets(originalArray, 'scene-123');
      });

      expect(result.current.clipboard.assets).not.toBe(originalArray);
      expect(result.current.clipboard.assets).toEqual(originalArray);
    });

    it('should overwrite previous clipboard content', () => {
      const { result } = renderHook(() => useClipboard(), {
        wrapper: ClipboardProvider,
      });

      const asset1 = createMockPlacedAsset('1');
      const asset2 = createMockPlacedAsset('2');

      act(() => {
        result.current.copyAssets([asset1], 'scene-123');
      });

      act(() => {
        result.current.copyAssets([asset2], 'scene-456');
      });

      expect(result.current.clipboard.assets).toHaveLength(1);
      expect(result.current.clipboard.assets[0]).toEqual(asset2);
      expect(result.current.clipboard.sourceSceneId).toBe('scene-456');
    });
  });

  describe('cutAssets', () => {
    it('should store assets with cut operation', () => {
      const { result } = renderHook(() => useClipboard(), {
        wrapper: ClipboardProvider,
      });

      const mockAsset = createMockPlacedAsset('1');
      const sceneId = 'scene-123';

      act(() => {
        result.current.cutAssets([mockAsset], sceneId);
      });

      expect(result.current.clipboard.assets).toHaveLength(1);
      expect(result.current.clipboard.assets[0]).toEqual(mockAsset);
      expect(result.current.clipboard.operation).toBe('cut');
      expect(result.current.clipboard.sourceSceneId).toBe(sceneId);
    });

    it('should store multiple assets with cut operation', () => {
      const { result } = renderHook(() => useClipboard(), {
        wrapper: ClipboardProvider,
      });

      const asset1 = createMockPlacedAsset('1');
      const asset2 = createMockPlacedAsset('2');

      act(() => {
        result.current.cutAssets([asset1, asset2], 'scene-123');
      });

      expect(result.current.clipboard.assets).toHaveLength(2);
      expect(result.current.clipboard.operation).toBe('cut');
    });

    it('should create copy of assets array for cut', () => {
      const { result } = renderHook(() => useClipboard(), {
        wrapper: ClipboardProvider,
      });

      const mockAsset = createMockPlacedAsset('1');
      const originalArray = [mockAsset];

      act(() => {
        result.current.cutAssets(originalArray, 'scene-123');
      });

      expect(result.current.clipboard.assets).not.toBe(originalArray);
      expect(result.current.clipboard.assets).toEqual(originalArray);
    });
  });

  describe('clearClipboard', () => {
    it('should reset clipboard state', () => {
      const { result } = renderHook(() => useClipboard(), {
        wrapper: ClipboardProvider,
      });

      const mockAsset = createMockPlacedAsset('1');

      act(() => {
        result.current.copyAssets([mockAsset], 'scene-123');
      });

      expect(result.current.clipboard.assets).toHaveLength(1);

      act(() => {
        result.current.clearClipboard();
      });

      expect(result.current.clipboard.assets).toHaveLength(0);
      expect(result.current.clipboard.operation).toBeNull();
      expect(result.current.clipboard.sourceSceneId).toBeNull();
    });

    it('should clear after cut operation', () => {
      const { result } = renderHook(() => useClipboard(), {
        wrapper: ClipboardProvider,
      });

      const mockAsset = createMockPlacedAsset('1');

      act(() => {
        result.current.cutAssets([mockAsset], 'scene-123');
      });

      expect(result.current.clipboard.operation).toBe('cut');

      act(() => {
        result.current.clearClipboard();
      });

      expect(result.current.clipboard.operation).toBeNull();
    });
  });

  describe('canPaste', () => {
    it('should return true when clipboard has assets', () => {
      const { result } = renderHook(() => useClipboard(), {
        wrapper: ClipboardProvider,
      });

      const mockAsset = createMockPlacedAsset('1');

      act(() => {
        result.current.copyAssets([mockAsset], 'scene-123');
      });

      expect(result.current.canPaste).toBe(true);
    });

    it('should return false when clipboard is empty', () => {
      const { result } = renderHook(() => useClipboard(), {
        wrapper: ClipboardProvider,
      });

      expect(result.current.canPaste).toBe(false);
    });

    it('should return false after clearing clipboard', () => {
      const { result } = renderHook(() => useClipboard(), {
        wrapper: ClipboardProvider,
      });

      const mockAsset = createMockPlacedAsset('1');

      act(() => {
        result.current.copyAssets([mockAsset], 'scene-123');
      });

      expect(result.current.canPaste).toBe(true);

      act(() => {
        result.current.clearClipboard();
      });

      expect(result.current.canPaste).toBe(false);
    });

    it('should return true when multiple assets in clipboard', () => {
      const { result } = renderHook(() => useClipboard(), {
        wrapper: ClipboardProvider,
      });

      const assets = [
        createMockPlacedAsset('1'),
        createMockPlacedAsset('2'),
        createMockPlacedAsset('3'),
      ];

      act(() => {
        result.current.copyAssets(assets, 'scene-123');
      });

      expect(result.current.canPaste).toBe(true);
    });
  });

  describe('getClipboardAssets', () => {
    it('should return copy of clipboard assets', () => {
      const { result } = renderHook(() => useClipboard(), {
        wrapper: ClipboardProvider,
      });

      const mockAsset = createMockPlacedAsset('1');

      act(() => {
        result.current.copyAssets([mockAsset], 'scene-123');
      });

      const retrievedAssets = result.current.getClipboardAssets();

      expect(retrievedAssets).toEqual([mockAsset]);
      expect(retrievedAssets).not.toBe(result.current.clipboard.assets);
    });

    it('should return empty array when clipboard is empty', () => {
      const { result } = renderHook(() => useClipboard(), {
        wrapper: ClipboardProvider,
      });

      const retrievedAssets = result.current.getClipboardAssets();

      expect(retrievedAssets).toEqual([]);
      expect(Array.isArray(retrievedAssets)).toBe(true);
    });

    it('should return independent copy of assets array', () => {
      const { result } = renderHook(() => useClipboard(), {
        wrapper: ClipboardProvider,
      });

      const asset1 = createMockPlacedAsset('1');
      const asset2 = createMockPlacedAsset('2');

      act(() => {
        result.current.copyAssets([asset1, asset2], 'scene-123');
      });

      const retrievedAssets = result.current.getClipboardAssets();
      retrievedAssets.push(createMockPlacedAsset('3'));

      expect(result.current.clipboard.assets).toHaveLength(2);
      expect(retrievedAssets).toHaveLength(3);
    });

    it('should contain same assets after copy operation', () => {
      const { result } = renderHook(() => useClipboard(), {
        wrapper: ClipboardProvider,
      });

      const assets = [
        createMockPlacedAsset('1', 'Asset 1'),
        createMockPlacedAsset('2', 'Asset 2'),
      ];

      act(() => {
        result.current.copyAssets(assets, 'scene-123');
      });

      const retrievedAssets = result.current.getClipboardAssets();

      expect(retrievedAssets[0].asset.name).toBe('Asset 1');
      expect(retrievedAssets[1].asset.name).toBe('Asset 2');
    });
  });

  describe('useClipboard hook', () => {
    it('should throw error when used outside provider', () => {
      expect(() => {
        renderHook(() => useClipboard());
      }).toThrow('useClipboard must be used within a ClipboardProvider');
    });

    it('should provide clipboard context when inside provider', () => {
      const { result } = renderHook(() => useClipboard(), {
        wrapper: ClipboardProvider,
      });

      expect(result.current).toBeDefined();
      expect(result.current.clipboard).toBeDefined();
      expect(result.current.copyAssets).toBeDefined();
      expect(result.current.cutAssets).toBeDefined();
      expect(result.current.clearClipboard).toBeDefined();
      expect(result.current.getClipboardAssets).toBeDefined();
      expect(result.current.canPaste).toBeDefined();
    });
  });

  describe('integration scenarios', () => {
    it('should handle copy then cut sequence', () => {
      const { result } = renderHook(() => useClipboard(), {
        wrapper: ClipboardProvider,
      });

      const asset1 = createMockPlacedAsset('1');
      const asset2 = createMockPlacedAsset('2');

      act(() => {
        result.current.copyAssets([asset1], 'scene-123');
      });

      expect(result.current.clipboard.operation).toBe('copy');

      act(() => {
        result.current.cutAssets([asset2], 'scene-456');
      });

      expect(result.current.clipboard.operation).toBe('cut');
      expect(result.current.clipboard.assets[0]).toEqual(asset2);
    });

    it('should maintain clipboard state across multiple operations', () => {
      const { result } = renderHook(() => useClipboard(), {
        wrapper: ClipboardProvider,
      });

      const asset1 = createMockPlacedAsset('1');
      const asset2 = createMockPlacedAsset('2');

      act(() => {
        result.current.copyAssets([asset1], 'scene-123');
      });

      expect(result.current.canPaste).toBe(true);
      expect(result.current.clipboard.assets).toHaveLength(1);

      const clipboardAssets = result.current.getClipboardAssets();
      expect(clipboardAssets).toHaveLength(1);

      act(() => {
        result.current.clearClipboard();
      });

      expect(result.current.canPaste).toBe(false);

      act(() => {
        result.current.cutAssets([asset2], 'scene-456');
      });

      expect(result.current.canPaste).toBe(true);
      expect(result.current.clipboard.operation).toBe('cut');
    });
  });
});
