import { describe, it, expect, beforeEach, vi } from 'vitest';
import { renderHook, act, waitFor } from '@testing-library/react';
import { useAssetManagement } from './useAssetManagement';
import type { Scene, PlacedAsset, Asset } from '@/types/domain';
import { setEntityMapping, getIndexByDomId, removeEntityMapping, clearSceneMappings } from '@/utils/sceneEntityMapping';

vi.mock('@/utils/sceneMappers', () => ({
    hydratePlacedAssets: vi.fn().mockImplementation((assets) => Promise.resolve(assets))
}));

vi.mock('@/services/assetsApi', () => ({
    assetsApi: {
        endpoints: {
            getAsset: {
                initiate: vi.fn()
            }
        }
    }
}));

describe('useAssetManagement - Integration Tests for Undo/Redo with localStorage Mapping', () => {
    const testSceneId = 'test-scene-123';
    let mockScene: Scene;
    let mockAsset: Asset;
    let mockPlacedAsset: PlacedAsset;
    let mockAddSceneAsset: ReturnType<any>[0];
    let mockRemoveSceneAsset: ReturnType<any>[0];
    let mockUpdateSceneAsset: ReturnType<any>[0];
    let mockBulkUpdateSceneAssets: ReturnType<any>[0];
    let mockBulkDeleteSceneAssets: ReturnType<any>[0];
    let mockBulkAddSceneAssets: ReturnType<any>[0];
    let mockRefetch: () => Promise<{ data?: Scene }>;
    let mockSetScene: (scene: Scene) => void;
    let mockExecute: (command: any) => void;
    let mockDispatch: any;
    let mockCopyAssets: (assets: PlacedAsset[], sceneId: string) => void;
    let mockCutAssets: (assets: PlacedAsset[], sceneId: string) => void;
    let mockGetClipboardAssets: () => PlacedAsset[];

    beforeEach(() => {
        localStorage.clear();
        clearSceneMappings(testSceneId);
        vi.clearAllMocks();

        mockAsset = {
            id: 'asset-lib-001',
            name: 'Test Asset',
            imageUrl: '/test-image.png',
            width: 100,
            height: 100,
            tags: []
        };

        mockPlacedAsset = {
            id: `asset-temp-${Date.now()}-abc123`,
            index: -1,
            assetId: mockAsset.id,
            name: mockAsset.name,
            position: { x: 100, y: 100 },
            size: { width: 100, height: 100 },
            rotation: 0,
            asset: mockAsset
        };

        mockScene = {
            id: testSceneId,
            name: 'Test Scene',
            description: '',
            assets: [],
            walls: [],
            regions: [],
            sources: [],
            effects: [],
            gridSize: 50,
            gridVisible: true
        };

        mockAddSceneAsset = vi.fn().mockImplementation(() => ({
            unwrap: vi.fn().mockResolvedValue({})
        }));

        mockRemoveSceneAsset = vi.fn().mockImplementation(({ sceneId, assetNumber }) => {
            return {
                unwrap: vi.fn().mockResolvedValue({})
            };
        });

        mockUpdateSceneAsset = vi.fn().mockImplementation(() => ({
            unwrap: vi.fn().mockResolvedValue({})
        }));

        mockBulkUpdateSceneAssets = vi.fn().mockImplementation(() => ({
            unwrap: vi.fn().mockResolvedValue({})
        }));

        mockBulkDeleteSceneAssets = vi.fn().mockImplementation(() => ({
            unwrap: vi.fn().mockResolvedValue({})
        }));

        mockBulkAddSceneAssets = vi.fn().mockImplementation(() => ({
            unwrap: vi.fn().mockResolvedValue({})
        }));

        mockRefetch = vi.fn().mockResolvedValue({ data: mockScene });
        mockSetScene = vi.fn();
        mockExecute = vi.fn((command) => command.execute());
        mockDispatch = vi.fn();
        mockCopyAssets = vi.fn();
        mockCutAssets = vi.fn();
        mockGetClipboardAssets = vi.fn().mockReturnValue([]);
    });

    describe('Place Asset with localStorage Mapping', () => {
        it('should place asset and create localStorage mapping after backend sync', async () => {
            const backendIndex = 5;
            const backendAssetWithIndex = {
                assetId: mockPlacedAsset.assetId,
                position: mockPlacedAsset.position,
                size: mockPlacedAsset.size,
                rotation: mockPlacedAsset.rotation,
                index: backendIndex
            };

            mockScene.assets = [];
            const updatedScene = {
                ...mockScene,
                assets: [backendAssetWithIndex]
            };

            const localRefetch = vi.fn().mockResolvedValue({ data: updatedScene });
            const localSetScene = vi.fn();

            const { result } = renderHook(() =>
                useAssetManagement({
                    sceneId: testSceneId,
                    scene: mockScene,
                    isOnline: true,
                    setScene: localSetScene,
                    execute: mockExecute,
                    dispatch: mockDispatch,
                    copyAssets: mockCopyAssets,
                    cutAssets: mockCutAssets,
                    canPaste: false,
                    getClipboardAssets: mockGetClipboardAssets,
                    clipboard: {},
                    clearClipboard: vi.fn(),
                    addSceneAsset: mockAddSceneAsset,
                    updateSceneAsset: mockUpdateSceneAsset,
                    bulkUpdateSceneAssets: mockBulkUpdateSceneAssets,
                    removeSceneAsset: mockRemoveSceneAsset,
                    bulkDeleteSceneAssets: mockBulkDeleteSceneAssets,
                    bulkAddSceneAssets: mockBulkAddSceneAssets,
                    refetch: localRefetch
                })
            );

            await act(async () => {
                result.current.handleAssetPlaced(mockPlacedAsset);
                await vi.waitFor(() => expect(mockAddSceneAsset).toHaveBeenCalled(), { timeout: 2000 });
                await vi.waitFor(() => expect(localRefetch).toHaveBeenCalled(), { timeout: 2000 });
            });

            await waitFor(() => {
                const storedIndex = getIndexByDomId(testSceneId, 'assets', mockPlacedAsset.id);
                expect(storedIndex).toBe(backendIndex);
            }, { timeout: 3000 });

            expect(mockAddSceneAsset).toHaveBeenCalledWith({
                sceneId: testSceneId,
                libraryAssetId: mockPlacedAsset.assetId,
                position: mockPlacedAsset.position,
                size: { width: mockPlacedAsset.size.width, height: mockPlacedAsset.size.height },
                rotation: mockPlacedAsset.rotation
            });
            expect(localSetScene).toHaveBeenCalledWith(updatedScene);
        });

        it('should undo asset placement using localStorage mapping', async () => {
            const tempDomId = mockPlacedAsset.id;
            const backendIndex = 5;

            setEntityMapping(testSceneId, 'assets', tempDomId, backendIndex);

            const { result } = renderHook(() =>
                useAssetManagement({
                    sceneId: testSceneId,
                    scene: mockScene,
                    isOnline: true,
                    setScene: mockSetScene,
                    execute: mockExecute,
                    dispatch: mockDispatch,
                    copyAssets: mockCopyAssets,
                    cutAssets: mockCutAssets,
                    canPaste: false,
                    getClipboardAssets: mockGetClipboardAssets,
                    clipboard: {},
                    clearClipboard: vi.fn(),
                    addSceneAsset: mockAddSceneAsset,
                    updateSceneAsset: mockUpdateSceneAsset,
                    bulkUpdateSceneAssets: mockBulkUpdateSceneAssets,
                    removeSceneAsset: mockRemoveSceneAsset,
                    bulkDeleteSceneAssets: mockBulkDeleteSceneAssets,
                    bulkAddSceneAssets: mockBulkAddSceneAssets,
                    refetch: mockRefetch
                })
            );

            const command = {
                description: 'Test Undo',
                execute: vi.fn(),
                undo: vi.fn(async () => {
                    const retrievedIndex = getIndexByDomId(testSceneId, 'assets', tempDomId);
                    expect(retrievedIndex).toBe(backendIndex);

                    if (retrievedIndex !== undefined) {
                        await mockRemoveSceneAsset({ sceneId: testSceneId, assetNumber: retrievedIndex }).unwrap();
                        removeEntityMapping(testSceneId, 'assets', tempDomId);
                    }
                })
            };

            await act(async () => {
                await command.undo();
            });

            expect(mockRemoveSceneAsset).toHaveBeenCalledWith({
                sceneId: testSceneId,
                assetNumber: backendIndex
            });

            const storedIndex = getIndexByDomId(testSceneId, 'assets', tempDomId);
            expect(storedIndex).toBeUndefined();
        });
    });

    describe('Multiple Asset Operations', () => {
        it('should handle multiple asset placements with separate mappings', async () => {
            setEntityMapping(testSceneId, 'assets', 'asset-temp-1', 0);
            setEntityMapping(testSceneId, 'assets', 'asset-temp-2', 1);

            const index1 = getIndexByDomId(testSceneId, 'assets', 'asset-temp-1');
            const index2 = getIndexByDomId(testSceneId, 'assets', 'asset-temp-2');

            expect(index1).toBe(0);
            expect(index2).toBe(1);

            await act(async () => {
                const retrievedIndex1 = getIndexByDomId(testSceneId, 'assets', 'asset-temp-1');
                if (retrievedIndex1 !== undefined) {
                    await mockRemoveSceneAsset({ sceneId: testSceneId, assetNumber: retrievedIndex1 }).unwrap();
                }

                const retrievedIndex2 = getIndexByDomId(testSceneId, 'assets', 'asset-temp-2');
                if (retrievedIndex2 !== undefined) {
                    await mockRemoveSceneAsset({ sceneId: testSceneId, assetNumber: retrievedIndex2 }).unwrap();
                }
            });

            expect(mockRemoveSceneAsset).toHaveBeenCalledTimes(2);
        });

        it('should undo multiple asset placements in reverse order', async () => {
            const asset1Id = 'asset-temp-1';
            const asset2Id = 'asset-temp-2';

            setEntityMapping(testSceneId, 'assets', asset1Id, 0);
            setEntityMapping(testSceneId, 'assets', asset2Id, 1);

            const { result } = renderHook(() =>
                useAssetManagement({
                    sceneId: testSceneId,
                    scene: mockScene,
                    isOnline: true,
                    setScene: mockSetScene,
                    execute: mockExecute,
                    dispatch: mockDispatch,
                    copyAssets: mockCopyAssets,
                    cutAssets: mockCutAssets,
                    canPaste: false,
                    getClipboardAssets: mockGetClipboardAssets,
                    clipboard: {},
                    clearClipboard: vi.fn(),
                    addSceneAsset: mockAddSceneAsset,
                    updateSceneAsset: mockUpdateSceneAsset,
                    bulkUpdateSceneAssets: mockBulkUpdateSceneAssets,
                    removeSceneAsset: mockRemoveSceneAsset,
                    bulkDeleteSceneAssets: mockBulkDeleteSceneAssets,
                    bulkAddSceneAssets: mockBulkAddSceneAssets,
                    refetch: mockRefetch
                })
            );

            await act(async () => {
                const index2 = getIndexByDomId(testSceneId, 'assets', asset2Id);
                if (index2 !== undefined) {
                    await mockRemoveSceneAsset({ sceneId: testSceneId, assetNumber: index2 }).unwrap();
                    removeEntityMapping(testSceneId, 'assets', asset2Id);
                }
            });

            await act(async () => {
                const index1 = getIndexByDomId(testSceneId, 'assets', asset1Id);
                if (index1 !== undefined) {
                    await mockRemoveSceneAsset({ sceneId: testSceneId, assetNumber: index1 }).unwrap();
                    removeEntityMapping(testSceneId, 'assets', asset1Id);
                }
            });

            expect(mockRemoveSceneAsset).toHaveBeenCalledTimes(2);
            expect(mockRemoveSceneAsset).toHaveBeenNthCalledWith(1, {
                sceneId: testSceneId,
                assetNumber: 1
            });
            expect(mockRemoveSceneAsset).toHaveBeenNthCalledWith(2, {
                sceneId: testSceneId,
                assetNumber: 0
            });

            expect(getIndexByDomId(testSceneId, 'assets', asset1Id)).toBeUndefined();
            expect(getIndexByDomId(testSceneId, 'assets', asset2Id)).toBeUndefined();
        });
    });

    describe('Asset Movement with Undo/Redo', () => {
        it('should verify localStorage mapping remains stable during asset movement', async () => {
            const assetId = 'asset-stable-123';
            const backendIndex = 3;

            setEntityMapping(testSceneId, 'assets', assetId, backendIndex);

            const storedIndexBefore = getIndexByDomId(testSceneId, 'assets', assetId);
            expect(storedIndexBefore).toBe(backendIndex);

            const storedIndexAfter = getIndexByDomId(testSceneId, 'assets', assetId);
            expect(storedIndexAfter).toBe(backendIndex);

            await act(async () => {
                const retrievedIndex = getIndexByDomId(testSceneId, 'assets', assetId);
                if (retrievedIndex !== undefined) {
                    await mockRemoveSceneAsset({ sceneId: testSceneId, assetNumber: retrievedIndex }).unwrap();
                    removeEntityMapping(testSceneId, 'assets', assetId);
                }
            });

            expect(mockRemoveSceneAsset).toHaveBeenCalledWith({
                sceneId: testSceneId,
                assetNumber: backendIndex
            });

            const storedIndexRemoved = getIndexByDomId(testSceneId, 'assets', assetId);
            expect(storedIndexRemoved).toBeUndefined();
        });
    });

    describe('localStorage Persistence', () => {
        it('should persist mappings across hook re-renders', async () => {
            const tempDomId = 'asset-temp-persistent';
            const backendIndex = 7;

            setEntityMapping(testSceneId, 'assets', tempDomId, backendIndex);

            const { result, unmount } = renderHook(() =>
                useAssetManagement({
                    sceneId: testSceneId,
                    scene: mockScene,
                    isOnline: true,
                    setScene: mockSetScene,
                    execute: mockExecute,
                    dispatch: mockDispatch,
                    copyAssets: mockCopyAssets,
                    cutAssets: mockCutAssets,
                    canPaste: false,
                    getClipboardAssets: mockGetClipboardAssets,
                    clipboard: {},
                    clearClipboard: vi.fn(),
                    addSceneAsset: mockAddSceneAsset,
                    updateSceneAsset: mockUpdateSceneAsset,
                    bulkUpdateSceneAssets: mockBulkUpdateSceneAssets,
                    removeSceneAsset: mockRemoveSceneAsset,
                    bulkDeleteSceneAssets: mockBulkDeleteSceneAssets,
                    bulkAddSceneAssets: mockBulkAddSceneAssets,
                    refetch: mockRefetch
                })
            );

            unmount();

            const { result: result2 } = renderHook(() =>
                useAssetManagement({
                    sceneId: testSceneId,
                    scene: mockScene,
                    isOnline: true,
                    setScene: mockSetScene,
                    execute: mockExecute,
                    dispatch: mockDispatch,
                    copyAssets: mockCopyAssets,
                    cutAssets: mockCutAssets,
                    canPaste: false,
                    getClipboardAssets: mockGetClipboardAssets,
                    clipboard: {},
                    clearClipboard: vi.fn(),
                    addSceneAsset: mockAddSceneAsset,
                    updateSceneAsset: mockUpdateSceneAsset,
                    bulkUpdateSceneAssets: mockBulkUpdateSceneAssets,
                    removeSceneAsset: mockRemoveSceneAsset,
                    bulkDeleteSceneAssets: mockBulkDeleteSceneAssets,
                    bulkAddSceneAssets: mockBulkAddSceneAssets,
                    refetch: mockRefetch
                })
            );

            const retrievedIndex = getIndexByDomId(testSceneId, 'assets', tempDomId);
            expect(retrievedIndex).toBe(backendIndex);
        });

        it('should handle undo after page reload simulation', async () => {
            const tempDomId = 'asset-temp-reload';
            const backendIndex = 9;

            setEntityMapping(testSceneId, 'assets', tempDomId, backendIndex);

            const storedData = localStorage.getItem('scene-mappings');
            expect(storedData).toBeTruthy();

            localStorage.clear();
            localStorage.setItem('scene-mappings', storedData!);

            const retrievedIndex = getIndexByDomId(testSceneId, 'assets', tempDomId);
            expect(retrievedIndex).toBe(backendIndex);

            await act(async () => {
                await mockRemoveSceneAsset({ sceneId: testSceneId, assetNumber: backendIndex }).unwrap();
                removeEntityMapping(testSceneId, 'assets', tempDomId);
            });

            expect(mockRemoveSceneAsset).toHaveBeenCalledWith({
                sceneId: testSceneId,
                assetNumber: backendIndex
            });

            const afterRemovalIndex = getIndexByDomId(testSceneId, 'assets', tempDomId);
            expect(afterRemovalIndex).toBeUndefined();
        });
    });

    describe('Backend Index Stability', () => {
        it('should use correct backend index even after re-ordering', async () => {
            const asset1Id = 'asset-1';
            const asset2Id = 'asset-2';
            const asset3Id = 'asset-3';

            setEntityMapping(testSceneId, 'assets', asset1Id, 0);
            setEntityMapping(testSceneId, 'assets', asset2Id, 1);
            setEntityMapping(testSceneId, 'assets', asset3Id, 2);

            await act(async () => {
                const index2 = getIndexByDomId(testSceneId, 'assets', asset2Id);
                if (index2 !== undefined) {
                    await mockRemoveSceneAsset({ sceneId: testSceneId, assetNumber: index2 }).unwrap();
                    removeEntityMapping(testSceneId, 'assets', asset2Id);
                }
            });

            expect(mockRemoveSceneAsset).toHaveBeenCalledWith({
                sceneId: testSceneId,
                assetNumber: 1
            });

            expect(getIndexByDomId(testSceneId, 'assets', asset1Id)).toBe(0);
            expect(getIndexByDomId(testSceneId, 'assets', asset2Id)).toBeUndefined();
            expect(getIndexByDomId(testSceneId, 'assets', asset3Id)).toBe(2);
        });

        it('should handle missing mapping gracefully during undo', async () => {
            const assetId = 'asset-no-mapping';

            const { result } = renderHook(() =>
                useAssetManagement({
                    sceneId: testSceneId,
                    scene: mockScene,
                    isOnline: true,
                    setScene: mockSetScene,
                    execute: mockExecute,
                    dispatch: mockDispatch,
                    copyAssets: mockCopyAssets,
                    cutAssets: mockCutAssets,
                    canPaste: false,
                    getClipboardAssets: mockGetClipboardAssets,
                    clipboard: {},
                    clearClipboard: vi.fn(),
                    addSceneAsset: mockAddSceneAsset,
                    updateSceneAsset: mockUpdateSceneAsset,
                    bulkUpdateSceneAssets: mockBulkUpdateSceneAssets,
                    removeSceneAsset: mockRemoveSceneAsset,
                    bulkDeleteSceneAssets: mockBulkDeleteSceneAssets,
                    bulkAddSceneAssets: mockBulkAddSceneAssets,
                    refetch: mockRefetch
                })
            );

            result.current.setPlacedAssets([{
                ...mockPlacedAsset,
                id: assetId
            }]);

            await act(async () => {
                const index = getIndexByDomId(testSceneId, 'assets', assetId);
                expect(index).toBeUndefined();
            });

            expect(mockRemoveSceneAsset).not.toHaveBeenCalled();
        });
    });

    describe('Command Stack Integration', () => {
        it('should execute place and undo commands in correct order', async () => {
            const asset1 = { ...mockPlacedAsset, id: 'asset-cmd-1' };
            const asset2 = { ...mockPlacedAsset, id: 'asset-cmd-2' };

            setEntityMapping(testSceneId, 'assets', asset1.id, 0);
            setEntityMapping(testSceneId, 'assets', asset2.id, 1);

            const commands: any[] = [];
            const trackingExecute = vi.fn((command) => {
                commands.push(command);
                command.execute();
            });

            const { result } = renderHook(() =>
                useAssetManagement({
                    sceneId: testSceneId,
                    scene: mockScene,
                    isOnline: true,
                    setScene: mockSetScene,
                    execute: trackingExecute,
                    dispatch: mockDispatch,
                    copyAssets: mockCopyAssets,
                    cutAssets: mockCutAssets,
                    canPaste: false,
                    getClipboardAssets: mockGetClipboardAssets,
                    clipboard: {},
                    clearClipboard: vi.fn(),
                    addSceneAsset: mockAddSceneAsset,
                    updateSceneAsset: mockUpdateSceneAsset,
                    bulkUpdateSceneAssets: mockBulkUpdateSceneAssets,
                    removeSceneAsset: mockRemoveSceneAsset,
                    bulkDeleteSceneAssets: mockBulkDeleteSceneAssets,
                    bulkAddSceneAssets: mockBulkAddSceneAssets,
                    refetch: mockRefetch
                })
            );

            await act(async () => {
                result.current.handleAssetPlaced(asset1);
            });

            await act(async () => {
                result.current.handleAssetPlaced(asset2);
            });

            expect(commands).toHaveLength(2);

            await act(async () => {
                await commands[1].undo();
            });

            await act(async () => {
                await commands[0].undo();
            });

            await waitFor(() => {
                expect(mockRemoveSceneAsset).toHaveBeenCalledTimes(2);
            });
        });
    });
});
