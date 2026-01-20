import { act, renderHook, waitFor } from '@testing-library/react';
import { beforeEach, describe, expect, it, vi } from 'vitest';
import type {
  useAddEncounterAssetMutation,
  useBulkAddEncounterAssetsMutation,
  useBulkDeleteEncounterAssetsMutation,
  useBulkUpdateEncounterAssetsMutation,
  useRemoveEncounterAssetMutation,
  useUpdateEncounterAssetMutation,
} from '@/services/encounterApi';
import type { AppDispatch } from '@/store';
import type { Asset, Encounter, PlacedAsset } from '@/types/domain';
import { AssetKind, GridType, LabelPosition, LabelVisibility, ResourceRole, Weather } from '@/types/domain';
import type { Stage } from '@/types/stage';
import { AmbientLight, AmbientSoundSource } from '@/types/stage';
import type { Command } from '@/utils/commands';
import {
  clearEncounterMappings,
  getIndexByDomId,
  removeEntityMapping,
  setEntityMapping,
} from '@/utils/encounterEntityMapping';
import { useAssetManagement } from './useAssetManagement';

const createMockStage = (overrides?: Partial<Stage>): Stage => ({
  id: 'stage-1',
  ownerId: 'owner-1',
  name: 'Test Stage',
  description: '',
  isPublished: false,
  isPublic: false,
  settings: {
    zoomLevel: 1,
    panning: { x: 0, y: 0 },
    ambientLight: AmbientLight.Default,
    ambientSoundSource: AmbientSoundSource.NotSet,
    ambientSoundVolume: 1,
    ambientSoundLoop: false,
    ambientSoundIsPlaying: false,
    useAlternateBackground: false,
    weather: Weather.Clear,
  },
  grid: {
    type: GridType.Square,
    cellSize: { width: 50, height: 50 },
    offset: { left: 0, top: 0 },
    scale: 1,
  },
  walls: [],
  regions: [],
  lights: [],
  elements: [],
  sounds: [],
  ...overrides,
});

const createMockEncounter = (): Encounter => ({
  id: 'test-encounter-123',
  ownerId: 'owner-1',
  adventure: null,
  name: 'Test Encounter',
  description: '',
  isPublished: false,
  isPublic: false,
  stage: createMockStage(),
  actors: [],
  objects: [],
  effects: [],
});

vi.mock('@/utils/encounterMappers', () => ({
  hydratePlacedAssets: vi.fn().mockImplementation((assets) => Promise.resolve(assets)),
}));

vi.mock('@/services/assetsApi', () => ({
  assetsApi: {
    endpoints: {
      getAsset: {
        initiate: vi.fn(),
      },
    },
  },
}));

describe('useAssetManagement - Integration Tests for Undo/Redo with localStorage Mapping', () => {
  const testEncounterId = 'test-encounter-123';
  let mockEncounter: Encounter;
  let mockAsset: Asset;
  let mockPlacedAsset: PlacedAsset;
  let mockAddEncounterAsset: ReturnType<typeof useAddEncounterAssetMutation>[0];
  let mockRemoveEncounterAsset: ReturnType<typeof useRemoveEncounterAssetMutation>[0];
  let mockUpdateEncounterAsset: ReturnType<typeof useUpdateEncounterAssetMutation>[0];
  let mockBulkUpdateEncounterAssets: ReturnType<typeof useBulkUpdateEncounterAssetsMutation>[0];
  let mockBulkDeleteEncounterAssets: ReturnType<typeof useBulkDeleteEncounterAssetsMutation>[0];
  let mockBulkAddEncounterAssets: ReturnType<typeof useBulkAddEncounterAssetsMutation>[0];
  let mockRefetch: () => Promise<{ data?: Encounter }>;
  let mockSetEncounter: (encounter: Encounter) => void;
  let mockExecute: (command: unknown) => void;
  let mockDispatch: AppDispatch;
  let mockCopyAssets: (assets: PlacedAsset[], encounterId: string) => void;
  let mockCutAssets: (assets: PlacedAsset[], encounterId: string) => void;
  let mockGetClipboardAssets: () => PlacedAsset[];

  beforeEach(() => {
    localStorage.clear();
    clearEncounterMappings(testEncounterId);
    vi.clearAllMocks();

    mockAsset = {
      id: 'asset-lib-001',
      ownerId: 'owner-123',
      classification: {
        kind: AssetKind.Object,
        category: 'Test',
        type: 'Object',
        subtype: null,
      },
      name: 'Test Asset',
      description: 'Test asset description',
      isPublished: true,
      isPublic: true,
      tokens: [
        {
          id: 'token-123',
          role: ResourceRole.Token,
          path: '/test-image.png',
          contentType: 'image/png',
          fileName: 'test-image.png',
          fileSize: 1024,
          dimensions: { width: 100, height: 100 },
          duration: '',
          name: 'Test Token',
          description: null,
          tags: [],
        },
      ],
      thumbnail: null,
      portrait: null,
      size: {
        width: 100,
        height: 100,
      },
      statBlocks: {},
      tags: [],
    };

    mockPlacedAsset = {
      id: `asset-temp-${Date.now()}-abc123`,
      index: -1,
      number: 0,
      assetId: mockAsset.id,
      name: mockAsset.name,
      position: { x: 100, y: 100 },
      size: { width: 100, height: 100 },
      rotation: 0,
      layer: 'objects',
      isHidden: false,
      isLocked: false,
      labelVisibility: LabelVisibility.Default,
      labelPosition: LabelPosition.Default,
      asset: mockAsset,
    };

    mockEncounter = createMockEncounter();

    mockAddEncounterAsset = vi.fn().mockImplementation(() => ({
      unwrap: vi.fn().mockResolvedValue({}),
    }));

    mockRemoveEncounterAsset = vi.fn().mockImplementation(() => ({
      unwrap: vi.fn().mockResolvedValue({}),
    }));

    mockUpdateEncounterAsset = vi.fn().mockImplementation(() => ({
      unwrap: vi.fn().mockResolvedValue({}),
    }));

    mockBulkUpdateEncounterAssets = vi.fn().mockImplementation(() => ({
      unwrap: vi.fn().mockResolvedValue({}),
    }));

    mockBulkDeleteEncounterAssets = vi.fn().mockImplementation(() => ({
      unwrap: vi.fn().mockResolvedValue({}),
    }));

    mockBulkAddEncounterAssets = vi.fn().mockImplementation(() => ({
      unwrap: vi.fn().mockResolvedValue({}),
    }));

    mockRefetch = vi.fn().mockResolvedValue({ data: mockEncounter });
    mockSetEncounter = vi.fn();
    mockExecute = vi.fn((command) => command.execute());
    mockDispatch = vi.fn() as unknown as AppDispatch;
    mockCopyAssets = vi.fn();
    mockCutAssets = vi.fn();
    mockGetClipboardAssets = vi.fn().mockReturnValue([]);
  });

  describe('Place Asset with localStorage Mapping', () => {
    it('should place asset and create localStorage mapping after backend sync', async () => {
      const backendIndex = 5;
      // Note: Encounter no longer has 'assets' at root level after Stage refactoring
      // The hook now manages actors, objects, and effects instead
      const updatedEncounter = mockEncounter;

      const localRefetch = vi.fn().mockResolvedValue({ data: updatedEncounter });
      const localSetEncounter = vi.fn();

      const { result } = renderHook(() =>
        useAssetManagement({
          encounterId: testEncounterId,
          encounter: mockEncounter,
          isOnline: true,
          setEncounter: localSetEncounter,
          execute: mockExecute,
          dispatch: mockDispatch,
          copyAssets: mockCopyAssets,
          cutAssets: mockCutAssets,
          canPaste: false,
          getClipboardAssets: mockGetClipboardAssets,
          clipboard: {},
          clearClipboard: vi.fn(),
          addEncounterAsset: mockAddEncounterAsset,
          updateEncounterAsset: mockUpdateEncounterAsset,
          bulkUpdateEncounterAssets: mockBulkUpdateEncounterAssets,
          removeEncounterAsset: mockRemoveEncounterAsset,
          bulkDeleteEncounterAssets: mockBulkDeleteEncounterAssets,
          bulkAddEncounterAssets: mockBulkAddEncounterAssets,
          refetch: localRefetch,
        }),
      );

      await act(async () => {
        result.current.handleAssetPlaced(mockPlacedAsset);
        await vi.waitFor(() => expect(mockAddEncounterAsset).toHaveBeenCalled(), { timeout: 2000 });
        await vi.waitFor(() => expect(localRefetch).toHaveBeenCalled(), {
          timeout: 2000,
        });
      });

      await waitFor(
        () => {
          const storedIndex = getIndexByDomId(testEncounterId, 'assets', mockPlacedAsset.id);
          expect(storedIndex).toBe(backendIndex);
        },
        { timeout: 3000 },
      );

      expect(mockAddEncounterAsset).toHaveBeenCalledWith({
        encounterId: testEncounterId,
        libraryAssetId: mockPlacedAsset.assetId,
        position: mockPlacedAsset.position,
        size: {
          width: mockPlacedAsset.size.width,
          height: mockPlacedAsset.size.height,
        },
        rotation: mockPlacedAsset.rotation,
      });
      expect(localSetEncounter).toHaveBeenCalledWith(updatedEncounter);
    });

    it('should undo asset placement using localStorage mapping', async () => {
      const tempDomId = mockPlacedAsset.id;
      const backendIndex = 5;

      setEntityMapping(testEncounterId, 'assets', tempDomId, backendIndex);

      renderHook(() =>
        useAssetManagement({
          encounterId: testEncounterId,
          encounter: mockEncounter,
          isOnline: true,
          setEncounter: mockSetEncounter,
          execute: mockExecute,
          dispatch: mockDispatch,
          copyAssets: mockCopyAssets,
          cutAssets: mockCutAssets,
          canPaste: false,
          getClipboardAssets: mockGetClipboardAssets,
          clipboard: {},
          clearClipboard: vi.fn(),
          addEncounterAsset: mockAddEncounterAsset,
          updateEncounterAsset: mockUpdateEncounterAsset,
          bulkUpdateEncounterAssets: mockBulkUpdateEncounterAssets,
          removeEncounterAsset: mockRemoveEncounterAsset,
          bulkDeleteEncounterAssets: mockBulkDeleteEncounterAssets,
          bulkAddEncounterAssets: mockBulkAddEncounterAssets,
          refetch: mockRefetch,
        }),
      );

      const command = {
        description: 'Test Undo',
        execute: vi.fn(),
        undo: vi.fn(async () => {
          const retrievedIndex = getIndexByDomId(testEncounterId, 'assets', tempDomId);
          expect(retrievedIndex).toBe(backendIndex);

          if (retrievedIndex !== undefined) {
            await mockRemoveEncounterAsset({
              encounterId: testEncounterId,
              assetNumber: retrievedIndex,
              kind: AssetKind.Object,
            }).unwrap();
            removeEntityMapping(testEncounterId, 'assets', tempDomId);
          }
        }),
      };

      await act(async () => {
        await command.undo();
      });

      expect(mockRemoveEncounterAsset).toHaveBeenCalledWith({
        encounterId: testEncounterId,
        assetNumber: backendIndex,
      });

      const storedIndex = getIndexByDomId(testEncounterId, 'assets', tempDomId);
      expect(storedIndex).toBeUndefined();
    });
  });

  describe('Multiple Asset Operations', () => {
    it('should handle multiple asset placements with separate mappings', async () => {
      setEntityMapping(testEncounterId, 'assets', 'asset-temp-1', 0);
      setEntityMapping(testEncounterId, 'assets', 'asset-temp-2', 1);

      const index1 = getIndexByDomId(testEncounterId, 'assets', 'asset-temp-1');
      const index2 = getIndexByDomId(testEncounterId, 'assets', 'asset-temp-2');

      expect(index1).toBe(0);
      expect(index2).toBe(1);

      await act(async () => {
        const retrievedIndex1 = getIndexByDomId(testEncounterId, 'assets', 'asset-temp-1');
        if (retrievedIndex1 !== undefined) {
          await mockRemoveEncounterAsset({
            encounterId: testEncounterId,
            assetNumber: retrievedIndex1,
            kind: AssetKind.Object,
          }).unwrap();
        }

        const retrievedIndex2 = getIndexByDomId(testEncounterId, 'assets', 'asset-temp-2');
        if (retrievedIndex2 !== undefined) {
          await mockRemoveEncounterAsset({
            encounterId: testEncounterId,
            assetNumber: retrievedIndex2,
            kind: AssetKind.Object,
          }).unwrap();
        }
      });

      expect(mockRemoveEncounterAsset).toHaveBeenCalledTimes(2);
    });

    it('should undo multiple asset placements in reverse order', async () => {
      const asset1Id = 'asset-temp-1';
      const asset2Id = 'asset-temp-2';

      setEntityMapping(testEncounterId, 'assets', asset1Id, 0);
      setEntityMapping(testEncounterId, 'assets', asset2Id, 1);

      renderHook(() =>
        useAssetManagement({
          encounterId: testEncounterId,
          encounter: mockEncounter,
          isOnline: true,
          setEncounter: mockSetEncounter,
          execute: mockExecute,
          dispatch: mockDispatch,
          copyAssets: mockCopyAssets,
          cutAssets: mockCutAssets,
          canPaste: false,
          getClipboardAssets: mockGetClipboardAssets,
          clipboard: {},
          clearClipboard: vi.fn(),
          addEncounterAsset: mockAddEncounterAsset,
          updateEncounterAsset: mockUpdateEncounterAsset,
          bulkUpdateEncounterAssets: mockBulkUpdateEncounterAssets,
          removeEncounterAsset: mockRemoveEncounterAsset,
          bulkDeleteEncounterAssets: mockBulkDeleteEncounterAssets,
          bulkAddEncounterAssets: mockBulkAddEncounterAssets,
          refetch: mockRefetch,
        }),
      );

      await act(async () => {
        const index2 = getIndexByDomId(testEncounterId, 'assets', asset2Id);
        if (index2 !== undefined) {
          await mockRemoveEncounterAsset({
            encounterId: testEncounterId,
            assetNumber: index2,
            kind: AssetKind.Object,
          }).unwrap();
          removeEntityMapping(testEncounterId, 'assets', asset2Id);
        }
      });

      await act(async () => {
        const index1 = getIndexByDomId(testEncounterId, 'assets', asset1Id);
        if (index1 !== undefined) {
          await mockRemoveEncounterAsset({
            encounterId: testEncounterId,
            assetNumber: index1,
            kind: AssetKind.Object,
          }).unwrap();
          removeEntityMapping(testEncounterId, 'assets', asset1Id);
        }
      });

      expect(mockRemoveEncounterAsset).toHaveBeenCalledTimes(2);
      expect(mockRemoveEncounterAsset).toHaveBeenNthCalledWith(1, {
        encounterId: testEncounterId,
        assetNumber: 1,
      });
      expect(mockRemoveEncounterAsset).toHaveBeenNthCalledWith(2, {
        encounterId: testEncounterId,
        assetNumber: 0,
      });

      expect(getIndexByDomId(testEncounterId, 'assets', asset1Id)).toBeUndefined();
      expect(getIndexByDomId(testEncounterId, 'assets', asset2Id)).toBeUndefined();
    });
  });

  describe('Asset Movement with Undo/Redo', () => {
    it('should verify localStorage mapping remains stable during asset movement', async () => {
      const assetId = 'asset-stable-123';
      const backendIndex = 3;

      setEntityMapping(testEncounterId, 'assets', assetId, backendIndex);

      const storedIndexBefore = getIndexByDomId(testEncounterId, 'assets', assetId);
      expect(storedIndexBefore).toBe(backendIndex);

      const storedIndexAfter = getIndexByDomId(testEncounterId, 'assets', assetId);
      expect(storedIndexAfter).toBe(backendIndex);

      await act(async () => {
        const retrievedIndex = getIndexByDomId(testEncounterId, 'assets', assetId);
        if (retrievedIndex !== undefined) {
          await mockRemoveEncounterAsset({
            encounterId: testEncounterId,
            assetNumber: retrievedIndex,
            kind: AssetKind.Object,
          }).unwrap();
          removeEntityMapping(testEncounterId, 'assets', assetId);
        }
      });

      expect(mockRemoveEncounterAsset).toHaveBeenCalledWith({
        encounterId: testEncounterId,
        assetNumber: backendIndex,
        kind: AssetKind.Object,
      });

      const storedIndexRemoved = getIndexByDomId(testEncounterId, 'assets', assetId);
      expect(storedIndexRemoved).toBeUndefined();
    });
  });

  describe('localStorage Persistence', () => {
    it('should persist mappings across hook re-renders', async () => {
      const tempDomId = 'asset-temp-persistent';
      const backendIndex = 7;

      setEntityMapping(testEncounterId, 'assets', tempDomId, backendIndex);

      const { unmount } = renderHook(() =>
        useAssetManagement({
          encounterId: testEncounterId,
          encounter: mockEncounter,
          isOnline: true,
          setEncounter: mockSetEncounter,
          execute: mockExecute,
          dispatch: mockDispatch,
          copyAssets: mockCopyAssets,
          cutAssets: mockCutAssets,
          canPaste: false,
          getClipboardAssets: mockGetClipboardAssets,
          clipboard: {},
          clearClipboard: vi.fn(),
          addEncounterAsset: mockAddEncounterAsset,
          updateEncounterAsset: mockUpdateEncounterAsset,
          bulkUpdateEncounterAssets: mockBulkUpdateEncounterAssets,
          removeEncounterAsset: mockRemoveEncounterAsset,
          bulkDeleteEncounterAssets: mockBulkDeleteEncounterAssets,
          bulkAddEncounterAssets: mockBulkAddEncounterAssets,
          refetch: mockRefetch,
        }),
      );

      unmount();

      renderHook(() =>
        useAssetManagement({
          encounterId: testEncounterId,
          encounter: mockEncounter,
          isOnline: true,
          setEncounter: mockSetEncounter,
          execute: mockExecute,
          dispatch: mockDispatch,
          copyAssets: mockCopyAssets,
          cutAssets: mockCutAssets,
          canPaste: false,
          getClipboardAssets: mockGetClipboardAssets,
          clipboard: {},
          clearClipboard: vi.fn(),
          addEncounterAsset: mockAddEncounterAsset,
          updateEncounterAsset: mockUpdateEncounterAsset,
          bulkUpdateEncounterAssets: mockBulkUpdateEncounterAssets,
          removeEncounterAsset: mockRemoveEncounterAsset,
          bulkDeleteEncounterAssets: mockBulkDeleteEncounterAssets,
          bulkAddEncounterAssets: mockBulkAddEncounterAssets,
          refetch: mockRefetch,
        }),
      );

      const retrievedIndex = getIndexByDomId(testEncounterId, 'assets', tempDomId);
      expect(retrievedIndex).toBe(backendIndex);
    });

    it('should handle undo after page reload simulation', async () => {
      const tempDomId = 'asset-temp-reload';
      const backendIndex = 9;

      setEntityMapping(testEncounterId, 'assets', tempDomId, backendIndex);

      const storedData = localStorage.getItem('encounter-mappings');
      expect(storedData).toBeTruthy();

      localStorage.clear();
      if (storedData) {
        localStorage.setItem('encounter-mappings', storedData);
      }

      const retrievedIndex = getIndexByDomId(testEncounterId, 'assets', tempDomId);
      expect(retrievedIndex).toBe(backendIndex);

      await act(async () => {
        await mockRemoveEncounterAsset({
          encounterId: testEncounterId,
          assetNumber: backendIndex,
          kind: AssetKind.Object,
        }).unwrap();
        removeEntityMapping(testEncounterId, 'assets', tempDomId);
      });

      expect(mockRemoveEncounterAsset).toHaveBeenCalledWith({
        encounterId: testEncounterId,
        assetNumber: backendIndex,
        kind: AssetKind.Object,
      });

      const afterRemovalIndex = getIndexByDomId(testEncounterId, 'assets', tempDomId);
      expect(afterRemovalIndex).toBeUndefined();
    });
  });

  describe('Backend Index Stability', () => {
    it('should use correct backend index even after re-ordering', async () => {
      const asset1Id = 'asset-1';
      const asset2Id = 'asset-2';
      const asset3Id = 'asset-3';

      setEntityMapping(testEncounterId, 'assets', asset1Id, 0);
      setEntityMapping(testEncounterId, 'assets', asset2Id, 1);
      setEntityMapping(testEncounterId, 'assets', asset3Id, 2);

      await act(async () => {
        const index2 = getIndexByDomId(testEncounterId, 'assets', asset2Id);
        if (index2 !== undefined) {
          await mockRemoveEncounterAsset({
            encounterId: testEncounterId,
            assetNumber: index2,
            kind: AssetKind.Object,
          }).unwrap();
          removeEntityMapping(testEncounterId, 'assets', asset2Id);
        }
      });

      expect(mockRemoveEncounterAsset).toHaveBeenCalledWith({
        encounterId: testEncounterId,
        assetNumber: 1,
        kind: AssetKind.Object,
      });

      expect(getIndexByDomId(testEncounterId, 'assets', asset1Id)).toBe(0);
      expect(getIndexByDomId(testEncounterId, 'assets', asset2Id)).toBeUndefined();
      expect(getIndexByDomId(testEncounterId, 'assets', asset3Id)).toBe(2);
    });

    it('should handle missing mapping gracefully during undo', async () => {
      const assetId = 'asset-no-mapping';

      const { result } = renderHook(() =>
        useAssetManagement({
          encounterId: testEncounterId,
          encounter: mockEncounter,
          isOnline: true,
          setEncounter: mockSetEncounter,
          execute: mockExecute,
          dispatch: mockDispatch,
          copyAssets: mockCopyAssets,
          cutAssets: mockCutAssets,
          canPaste: false,
          getClipboardAssets: mockGetClipboardAssets,
          clipboard: {},
          clearClipboard: vi.fn(),
          addEncounterAsset: mockAddEncounterAsset,
          updateEncounterAsset: mockUpdateEncounterAsset,
          bulkUpdateEncounterAssets: mockBulkUpdateEncounterAssets,
          removeEncounterAsset: mockRemoveEncounterAsset,
          bulkDeleteEncounterAssets: mockBulkDeleteEncounterAssets,
          bulkAddEncounterAssets: mockBulkAddEncounterAssets,
          refetch: mockRefetch,
        }),
      );

      result.current.setPlacedAssets([
        {
          ...mockPlacedAsset,
          id: assetId,
        },
      ]);

      await act(async () => {
        const index = getIndexByDomId(testEncounterId, 'assets', assetId);
        expect(index).toBeUndefined();
      });

      expect(mockRemoveEncounterAsset).not.toHaveBeenCalled();
    });
  });

  describe('Command Stack Integration', () => {
    it('should execute place and undo commands in correct order', async () => {
      const asset1 = { ...mockPlacedAsset, id: 'asset-cmd-1' };
      const asset2 = { ...mockPlacedAsset, id: 'asset-cmd-2' };

      setEntityMapping(testEncounterId, 'assets', asset1.id, 0);
      setEntityMapping(testEncounterId, 'assets', asset2.id, 1);

      const commands: Command[] = [];
      const trackingExecute = vi.fn((command: unknown) => {
        const cmd = command as Command;
        commands.push(cmd);
        cmd.execute();
      }) as (command: unknown) => void;

      const { result } = renderHook(() =>
        useAssetManagement({
          encounterId: testEncounterId,
          encounter: mockEncounter,
          isOnline: true,
          setEncounter: mockSetEncounter,
          execute: trackingExecute,
          dispatch: mockDispatch,
          copyAssets: mockCopyAssets,
          cutAssets: mockCutAssets,
          canPaste: false,
          getClipboardAssets: mockGetClipboardAssets,
          clipboard: {},
          clearClipboard: vi.fn(),
          addEncounterAsset: mockAddEncounterAsset,
          updateEncounterAsset: mockUpdateEncounterAsset,
          bulkUpdateEncounterAssets: mockBulkUpdateEncounterAssets,
          removeEncounterAsset: mockRemoveEncounterAsset,
          bulkDeleteEncounterAssets: mockBulkDeleteEncounterAssets,
          bulkAddEncounterAssets: mockBulkAddEncounterAssets,
          refetch: mockRefetch,
        }),
      );

      await act(async () => {
        result.current.handleAssetPlaced(asset1);
      });

      await act(async () => {
        result.current.handleAssetPlaced(asset2);
      });

      expect(commands).toHaveLength(2);

      await act(async () => {
        await commands[1]?.undo();
      });

      await act(async () => {
        await commands[0]?.undo();
      });

      await waitFor(() => {
        expect(mockRemoveEncounterAsset).toHaveBeenCalledTimes(2);
      });
    });
  });
});
