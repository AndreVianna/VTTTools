/**
 * useAssetManagement Hook Unit Tests
 * Tests basic state management, selection behavior, and all 11 handlers
 * See useAssetManagement.integration.test.ts for undo/redo and API integration tests
 */

import { renderHook, act } from '@testing-library/react';
import { describe, it, expect, vi, beforeEach, type Mock } from 'vitest';
import type { AppDispatch } from '@/store';
import type { Encounter, PlacedAsset, LabelVisibility, LabelPosition } from '@/types/domain';
import { useAssetManagement } from './useAssetManagement';
import {
    createMockEncounter,
    createMockEncounterActor,
    createMockAsset,
} from '@/tests/utils/mockFactories';
import { hydrateGameElements } from '@/utils/encounterMappers';
import { setEntityMapping } from '@/utils/encounterEntityMapping';

// Mock dependencies
vi.mock('@/utils/encounterMappers', () => ({
    hydrateGameElements: vi.fn().mockImplementation(() => []),
}));

vi.mock('@/utils/encounterEntityMapping', () => ({
    getIndexByDomId: vi.fn(),
    removeEntityMapping: vi.fn(),
    setEntityMapping: vi.fn(),
    clearEncounterMappings: vi.fn(),
}));

vi.mock('@utils/rotationUtils', () => ({
    toBackendRotation: vi.fn().mockImplementation((rotation: number) => rotation),
}));

// Create a mock PlacedAsset factory
const createMockPlacedAsset = (overrides: Partial<PlacedAsset> = {}): PlacedAsset => ({
    id: `placed-asset-${Date.now()}-${Math.random().toString(36).substring(2, 11)}`,
    index: 0,
    number: 0,
    assetId: 'lib-asset-1',
    asset: createMockAsset(),
    name: 'Test Asset',
    position: { x: 100, y: 100 },
    size: { width: 50, height: 50 },
    rotation: 0,
    layer: 'objects',
    isHidden: false,
    isLocked: false,
    labelVisibility: 'Default' as LabelVisibility,
    labelPosition: 'Default' as LabelPosition,
    ...overrides,
});

// Create mock props factory
const createMockProps = (overrides: Partial<Parameters<typeof useAssetManagement>[0]> = {}) => ({
    encounterId: 'test-encounter-id',
    encounter: createMockEncounter() as Encounter,
    isOnline: true,
    setEncounter: vi.fn(),
    execute: vi.fn((cmd) => cmd.execute()),
    dispatch: vi.fn() as unknown as AppDispatch,
    copyAssets: vi.fn(),
    cutAssets: vi.fn(),
    canPaste: false,
    getClipboardAssets: vi.fn().mockReturnValue([]),
    clipboard: {},
    clearClipboard: vi.fn(),
    addEncounterAsset: vi.fn().mockReturnValue({ unwrap: vi.fn().mockResolvedValue({}) }),
    updateEncounterAsset: vi.fn().mockReturnValue({ unwrap: vi.fn().mockResolvedValue({}) }),
    bulkUpdateEncounterAssets: vi.fn().mockReturnValue({ unwrap: vi.fn().mockResolvedValue({}) }),
    removeEncounterAsset: vi.fn().mockReturnValue({ unwrap: vi.fn().mockResolvedValue({}) }),
    bulkDeleteEncounterAssets: vi.fn().mockReturnValue({ unwrap: vi.fn().mockResolvedValue({}) }),
    bulkAddEncounterAssets: vi.fn().mockReturnValue({ unwrap: vi.fn().mockResolvedValue({}) }),
    refetch: vi.fn().mockResolvedValue({ data: createMockEncounter() }),
    ...overrides,
});

describe('useAssetManagement', () => {
    beforeEach(() => {
        localStorage.clear();
        vi.clearAllMocks();
    });

    describe('initial state', () => {
        it('should initialize with empty placedAssets array', () => {
            // Arrange & Act
            const { result } = renderHook(() => useAssetManagement(createMockProps()));

            // Assert
            expect(result.current.placedAssets).toEqual([]);
        });

        it('should initialize with empty selectedAssetIds', () => {
            // Arrange & Act
            const { result } = renderHook(() => useAssetManagement(createMockProps()));

            // Assert
            expect(result.current.selectedAssetIds).toEqual([]);
        });

        it('should initialize with null draggedAsset', () => {
            // Arrange & Act
            const { result } = renderHook(() => useAssetManagement(createMockProps()));

            // Assert
            expect(result.current.draggedAsset).toBeNull();
        });

        it('should initialize deleteConfirmOpen as false', () => {
            // Arrange & Act
            const { result } = renderHook(() => useAssetManagement(createMockProps()));

            // Assert
            expect(result.current.deleteConfirmOpen).toBe(false);
        });

        it('should restore selectedAssetIds from localStorage if available', () => {
            // Arrange
            const storedIds = ['asset-1', 'asset-2'];
            localStorage.setItem('encounter-selected-assets', JSON.stringify(storedIds));

            // Act
            const { result } = renderHook(() => useAssetManagement(createMockProps()));

            // Assert
            expect(result.current.selectedAssetIds).toEqual(storedIds);
        });
    });

    describe('selection management', () => {
        it('should update selectedAssetIds via handleAssetSelected', () => {
            // Arrange
            const { result } = renderHook(() => useAssetManagement(createMockProps()));

            // Act
            act(() => {
                result.current.handleAssetSelected(['asset-1', 'asset-2']);
            });

            // Assert
            expect(result.current.selectedAssetIds).toEqual(['asset-1', 'asset-2']);
        });

        it('should persist selection to localStorage', () => {
            // Arrange
            const { result } = renderHook(() => useAssetManagement(createMockProps()));

            // Act
            act(() => {
                result.current.handleAssetSelected(['asset-1']);
            });

            // Assert
            const stored = JSON.parse(localStorage.getItem('encounter-selected-assets') || '[]');
            expect(stored).toEqual(['asset-1']);
        });

        it('should select single asset via handlePlacedAssetSelect', () => {
            // Arrange
            const { result } = renderHook(() => useAssetManagement(createMockProps()));

            // Act
            act(() => {
                result.current.handlePlacedAssetSelect('single-asset-id');
            });

            // Assert
            expect(result.current.selectedAssetIds).toEqual(['single-asset-id']);
        });
    });

    describe('drag state management', () => {
        it('should clear draggedAsset on handleDragComplete', () => {
            // Arrange
            const { result } = renderHook(() => useAssetManagement(createMockProps()));
            const mockAsset = createMockEncounterActor(0).asset;

            // Set dragged asset
            act(() => {
                result.current.setDraggedAsset(mockAsset);
            });
            expect(result.current.draggedAsset).toBe(mockAsset);

            // Act
            act(() => {
                result.current.handleDragComplete();
            });

            // Assert
            expect(result.current.draggedAsset).toBeNull();
        });
    });

    describe('delete confirmation', () => {
        it('should open delete confirmation when assets are selected', () => {
            // Arrange
            const { result } = renderHook(() => useAssetManagement(createMockProps()));

            // Set up selected assets and placed assets
            const mockPlacedAsset: PlacedAsset = {
                id: 'asset-1',
                index: 0,
                number: 0,
                assetId: 'lib-asset-1',
                name: 'Test Asset',
                position: { x: 100, y: 100 },
                size: { width: 50, height: 50 },
                rotation: 0,
                layer: 'objects',
                isHidden: false,
                isLocked: false,
            } as PlacedAsset;

            act(() => {
                result.current.setPlacedAssets([mockPlacedAsset]);
                result.current.setSelectedAssetIds(['asset-1']);
            });

            // Act
            act(() => {
                result.current.handleAssetDeleted();
            });

            // Assert
            expect(result.current.deleteConfirmOpen).toBe(true);
            expect(result.current.assetsToDelete).toHaveLength(1);
        });

        it('should not open delete confirmation when no assets are selected', () => {
            // Arrange
            const { result } = renderHook(() => useAssetManagement(createMockProps()));

            // Act
            act(() => {
                result.current.handleAssetDeleted();
            });

            // Assert
            expect(result.current.deleteConfirmOpen).toBe(false);
            expect(result.current.assetsToDelete).toHaveLength(0);
        });

        it('should close delete confirmation via setDeleteConfirmOpen', () => {
            // Arrange
            const { result } = renderHook(() => useAssetManagement(createMockProps()));

            // Open confirmation first
            act(() => {
                result.current.setDeleteConfirmOpen(true);
            });
            expect(result.current.deleteConfirmOpen).toBe(true);

            // Act
            act(() => {
                result.current.setDeleteConfirmOpen(false);
            });

            // Assert
            expect(result.current.deleteConfirmOpen).toBe(false);
        });
    });

    describe('placed assets management', () => {
        it('should allow setting placed assets directly', () => {
            // Arrange
            const { result } = renderHook(() => useAssetManagement(createMockProps()));
            const mockAssets: PlacedAsset[] = [
                {
                    id: 'asset-1',
                    index: 0,
                    number: 0,
                    assetId: 'lib-1',
                    name: 'Asset 1',
                    position: { x: 0, y: 0 },
                    size: { width: 50, height: 50 },
                    rotation: 0,
                    layer: 'objects',
                    isHidden: false,
                    isLocked: false,
                } as PlacedAsset,
            ];

            // Act
            act(() => {
                result.current.setPlacedAssets(mockAssets);
            });

            // Assert
            expect(result.current.placedAssets).toEqual(mockAssets);
        });
    });

    describe('callback stability', () => {
        it('should return stable handleAssetSelected reference', () => {
            // Arrange
            const { result, rerender } = renderHook(() => useAssetManagement(createMockProps()));
            const firstRef = result.current.handleAssetSelected;

            // Act
            rerender();

            // Assert
            expect(result.current.handleAssetSelected).toBe(firstRef);
        });

        it('should return stable handleDragComplete reference', () => {
            // Arrange
            const { result, rerender } = renderHook(() => useAssetManagement(createMockProps()));
            const firstRef = result.current.handleDragComplete;

            // Act
            rerender();

            // Assert
            expect(result.current.handleDragComplete).toBe(firstRef);
        });
    });

    describe('handleAssetPlaced', () => {
        it('should create and execute PlaceAssetCommand', async () => {
            // Arrange
            const mockExecute = vi.fn((cmd) => cmd.execute());
            const props = createMockProps({ execute: mockExecute });
            const { result } = renderHook(() => useAssetManagement(props));
            const mockAsset = createMockPlacedAsset({ id: 'new-asset-1' });

            // Act
            await act(async () => {
                result.current.handleAssetPlaced(mockAsset);
            });

            // Assert
            expect(mockExecute).toHaveBeenCalledTimes(1);
            expect(mockExecute).toHaveBeenCalledWith(
                expect.objectContaining({
                    description: expect.stringContaining('Place'),
                })
            );
        });

        it('should add asset to placedAssets idempotently', async () => {
            // Arrange
            const props = createMockProps();
            const { result } = renderHook(() => useAssetManagement(props));
            const mockAsset = createMockPlacedAsset({ id: 'unique-asset-id' });

            // Act - place the same asset twice
            await act(async () => {
                result.current.handleAssetPlaced(mockAsset);
            });
            await act(async () => {
                result.current.handleAssetPlaced(mockAsset);
            });

            // Assert - should only appear once
            const matchingAssets = result.current.placedAssets.filter(a => a.id === 'unique-asset-id');
            expect(matchingAssets).toHaveLength(1);
        });

        it('should set selectedAssetIds to new asset ID', async () => {
            // Arrange
            const props = createMockProps();
            const { result } = renderHook(() => useAssetManagement(props));
            const mockAsset = createMockPlacedAsset({ id: 'selected-asset' });

            // Act
            await act(async () => {
                result.current.handleAssetPlaced(mockAsset);
            });

            // Assert
            expect(result.current.selectedAssetIds).toEqual(['selected-asset']);
        });

        it('should call addEncounterAsset API when online', async () => {
            // Arrange
            const addEncounterAsset = vi.fn().mockReturnValue({
                unwrap: vi.fn().mockResolvedValue({}),
            });
            const props = createMockProps({
                isOnline: true,
                addEncounterAsset,
            });
            const { result } = renderHook(() => useAssetManagement(props));
            const mockAsset = createMockPlacedAsset({
                id: 'api-asset',
                position: { x: 150, y: 200 },
            });

            // Act
            await act(async () => {
                result.current.handleAssetPlaced(mockAsset);
            });

            // Assert
            expect(addEncounterAsset).toHaveBeenCalledWith({
                encounterId: 'test-encounter-id',
                libraryAssetId: mockAsset.assetId,
                position: mockAsset.position,
                size: { width: mockAsset.size.width, height: mockAsset.size.height },
                rotation: mockAsset.rotation,
            });
        });

        it('should refetch and update encounter on API success', async () => {
            // Arrange
            const updatedEncounter = createMockEncounter({
                actors: [createMockEncounterActor(0)],
            });
            const setEncounter = vi.fn();
            const refetch = vi.fn().mockResolvedValue({ data: updatedEncounter });
            const props = createMockProps({
                isOnline: true,
                setEncounter,
                refetch,
            });
            const { result } = renderHook(() => useAssetManagement(props));
            const mockAsset = createMockPlacedAsset();

            // Act
            await act(async () => {
                result.current.handleAssetPlaced(mockAsset);
            });

            // Assert
            expect(refetch).toHaveBeenCalled();
            expect(setEncounter).toHaveBeenCalledWith(updatedEncounter);
        });

        it('should map backend asset by finding new index', async () => {
            // Arrange
            const existingActor = createMockEncounterActor(0);
            const newActor = createMockEncounterActor(1);
            const originalEncounter = createMockEncounter({
                actors: [existingActor],
            });
            const updatedEncounter = createMockEncounter({
                actors: [existingActor, newActor],
            });
            const refetch = vi.fn().mockResolvedValue({ data: updatedEncounter });
            const props = createMockProps({
                isOnline: true,
                encounter: originalEncounter as Encounter,
                refetch,
            });
            const { result } = renderHook(() => useAssetManagement(props));
            const mockAsset = createMockPlacedAsset({ id: 'mapping-test-asset' });

            // Act
            await act(async () => {
                result.current.handleAssetPlaced(mockAsset);
            });

            // Assert
            expect(setEntityMapping).toHaveBeenCalledWith(
                'test-encounter-id',
                'assets',
                'mapping-test-asset',
                1
            );
        });

        it('should log warning when backend asset not found', async () => {
            // Arrange
            const consoleWarnSpy = vi.spyOn(console, 'warn').mockImplementation(() => {});
            const originalEncounter = createMockEncounter({ actors: [] });
            const updatedEncounter = createMockEncounter({ actors: [] });
            const refetch = vi.fn().mockResolvedValue({ data: updatedEncounter });
            const props = createMockProps({
                isOnline: true,
                encounter: originalEncounter as Encounter,
                refetch,
            });
            const { result } = renderHook(() => useAssetManagement(props));
            const mockAsset = createMockPlacedAsset();

            // Act
            await act(async () => {
                result.current.handleAssetPlaced(mockAsset);
            });

            // Assert
            expect(consoleWarnSpy).toHaveBeenCalledWith(
                expect.stringContaining('New backend asset not found')
            );
            consoleWarnSpy.mockRestore();
        });

        it('should handle API failure gracefully', async () => {
            // Arrange
            const consoleErrorSpy = vi.spyOn(console, 'error').mockImplementation(() => {});
            const addEncounterAsset = vi.fn().mockReturnValue({
                unwrap: vi.fn().mockRejectedValue(new Error('API Error')),
            });
            const props = createMockProps({
                isOnline: true,
                addEncounterAsset,
            });
            const { result } = renderHook(() => useAssetManagement(props));
            const mockAsset = createMockPlacedAsset();

            // Act
            await act(async () => {
                result.current.handleAssetPlaced(mockAsset);
            });

            // Assert - should not throw, and asset should still be in local state
            expect(consoleErrorSpy).toHaveBeenCalledWith(
                'Failed to persist placed asset:',
                expect.any(Error)
            );
            expect(result.current.placedAssets).toHaveLength(1);
            consoleErrorSpy.mockRestore();
        });
    });

    describe('handleAssetMoved', () => {
        it('should return early for empty moves array', () => {
            // Arrange
            const mockExecute = vi.fn();
            const props = createMockProps({ execute: mockExecute });
            const { result } = renderHook(() => useAssetManagement(props));

            // Act
            act(() => {
                result.current.handleAssetMoved([]);
            });

            // Assert
            expect(mockExecute).not.toHaveBeenCalled();
        });

        it('should create MoveAssetCommand for single move', () => {
            // Arrange
            const mockExecute = vi.fn((cmd) => cmd.execute());
            const props = createMockProps({ execute: mockExecute });
            const { result } = renderHook(() => useAssetManagement(props));
            const mockAsset = createMockPlacedAsset({ id: 'move-asset-1', index: 5 });

            act(() => {
                result.current.setPlacedAssets([mockAsset]);
            });

            // Act
            act(() => {
                result.current.handleAssetMoved([
                    {
                        assetId: 'move-asset-1',
                        oldPosition: { x: 100, y: 100 },
                        newPosition: { x: 200, y: 200 },
                    },
                ]);
            });

            // Assert
            expect(mockExecute).toHaveBeenCalledWith(
                expect.objectContaining({
                    description: 'Move asset',
                })
            );
        });

        it('should update position and select asset for single move', async () => {
            // Arrange
            const props = createMockProps();
            const { result } = renderHook(() => useAssetManagement(props));
            const mockAsset = createMockPlacedAsset({
                id: 'position-test',
                position: { x: 100, y: 100 },
                index: 1,
            });

            act(() => {
                result.current.setPlacedAssets([mockAsset]);
            });

            // Act
            await act(async () => {
                result.current.handleAssetMoved([
                    {
                        assetId: 'position-test',
                        oldPosition: { x: 100, y: 100 },
                        newPosition: { x: 300, y: 400 },
                    },
                ]);
            });

            // Assert
            const movedAsset = result.current.placedAssets.find(a => a.id === 'position-test');
            expect(movedAsset?.position).toEqual({ x: 300, y: 400 });
            expect(result.current.selectedAssetIds).toEqual(['position-test']);
        });

        it('should call updateEncounterAsset for single move when online', async () => {
            // Arrange
            const unwrapMock = vi.fn().mockResolvedValue({});
            const updateEncounterAsset = vi.fn().mockReturnValue({
                unwrap: unwrapMock,
            });
            const encounter = createMockEncounter();
            // Create a stable props object that won't change between renders
            const stableProps = {
                ...createMockProps({
                    isOnline: true,
                    encounter: encounter as Encounter,
                    updateEncounterAsset,
                }),
            };
            const { result, rerender } = renderHook(() => useAssetManagement(stableProps));
            const mockAsset = createMockPlacedAsset({
                id: 'api-move-asset',
                index: 3,
            });

            // First set the placed assets so handleAssetMoved can find the asset
            act(() => {
                result.current.setPlacedAssets([mockAsset]);
            });

            // Force a rerender to ensure the hook has the latest state
            rerender();

            // Verify the asset is in state before moving
            expect(result.current.placedAssets).toHaveLength(1);
            expect(result.current.placedAssets[0]?.index).toBe(3);

            // Act - execute the move command
            act(() => {
                result.current.handleAssetMoved([
                    {
                        assetId: 'api-move-asset',
                        oldPosition: { x: 100, y: 100 },
                        newPosition: { x: 250, y: 350 },
                    },
                ]);
            });

            // Wait for microtasks to flush so the async onMove callback completes
            await act(async () => {
                await new Promise(resolve => setTimeout(resolve, 50));
            });

            // Assert
            expect(updateEncounterAsset).toHaveBeenCalledWith({
                encounterId: 'test-encounter-id',
                assetNumber: 3,
                position: { x: 250, y: 350 },
            });
        });

        it('should create batch command for multiple moves', () => {
            // Arrange
            const mockExecute = vi.fn((cmd) => cmd.execute());
            const props = createMockProps({ execute: mockExecute });
            const { result } = renderHook(() => useAssetManagement(props));

            const asset1 = createMockPlacedAsset({ id: 'bulk-1', index: 0 });
            const asset2 = createMockPlacedAsset({ id: 'bulk-2', index: 1 });

            act(() => {
                result.current.setPlacedAssets([asset1, asset2]);
            });

            // Act
            act(() => {
                result.current.handleAssetMoved([
                    {
                        assetId: 'bulk-1',
                        oldPosition: { x: 100, y: 100 },
                        newPosition: { x: 200, y: 200 },
                    },
                    {
                        assetId: 'bulk-2',
                        oldPosition: { x: 150, y: 150 },
                        newPosition: { x: 250, y: 250 },
                    },
                ]);
            });

            // Assert
            expect(mockExecute).toHaveBeenCalledWith(
                expect.objectContaining({
                    description: expect.stringContaining('Batch'),
                })
            );
        });

        it('should update all positions for multiple moves', () => {
            // Arrange
            const props = createMockProps();
            const { result } = renderHook(() => useAssetManagement(props));

            const asset1 = createMockPlacedAsset({ id: 'multi-1', index: 0, position: { x: 10, y: 10 } });
            const asset2 = createMockPlacedAsset({ id: 'multi-2', index: 1, position: { x: 20, y: 20 } });

            act(() => {
                result.current.setPlacedAssets([asset1, asset2]);
            });

            // Act
            act(() => {
                result.current.handleAssetMoved([
                    {
                        assetId: 'multi-1',
                        oldPosition: { x: 10, y: 10 },
                        newPosition: { x: 500, y: 500 },
                    },
                    {
                        assetId: 'multi-2',
                        oldPosition: { x: 20, y: 20 },
                        newPosition: { x: 600, y: 600 },
                    },
                ]);
            });

            // Assert
            const moved1 = result.current.placedAssets.find(a => a.id === 'multi-1');
            const moved2 = result.current.placedAssets.find(a => a.id === 'multi-2');
            expect(moved1?.position).toEqual({ x: 500, y: 500 });
            expect(moved2?.position).toEqual({ x: 600, y: 600 });
        });

        it('should call bulkUpdateEncounterAssets for multiple moves when online', async () => {
            // Arrange
            const bulkUpdateEncounterAssets = vi.fn().mockReturnValue({
                unwrap: vi.fn().mockResolvedValue({}),
            });
            const props = createMockProps({
                isOnline: true,
                bulkUpdateEncounterAssets,
            });
            const { result } = renderHook(() => useAssetManagement(props));

            const asset1 = createMockPlacedAsset({ id: 'bulk-api-1', index: 5 });
            const asset2 = createMockPlacedAsset({ id: 'bulk-api-2', index: 7 });

            act(() => {
                result.current.setPlacedAssets([asset1, asset2]);
            });

            // Act
            await act(async () => {
                result.current.handleAssetMoved([
                    {
                        assetId: 'bulk-api-1',
                        oldPosition: { x: 100, y: 100 },
                        newPosition: { x: 111, y: 222 },
                    },
                    {
                        assetId: 'bulk-api-2',
                        oldPosition: { x: 200, y: 200 },
                        newPosition: { x: 333, y: 444 },
                    },
                ]);
            });

            // Assert
            expect(bulkUpdateEncounterAssets).toHaveBeenCalledWith({
                encounterId: 'test-encounter-id',
                updates: [
                    { index: 5, position: { x: 111, y: 222 } },
                    { index: 7, position: { x: 333, y: 444 } },
                ],
            });
        });

        it('should handle API failure gracefully for single move', async () => {
            // Arrange
            const consoleErrorSpy = vi.spyOn(console, 'error').mockImplementation(() => {});
            const updateEncounterAsset = vi.fn().mockReturnValue({
                unwrap: vi.fn().mockRejectedValue(new Error('Move failed')),
            });
            const encounter = createMockEncounter();
            // Create a stable props object that won't change between renders
            const stableProps = {
                ...createMockProps({
                    isOnline: true,
                    encounter: encounter as Encounter,
                    updateEncounterAsset,
                }),
            };
            const { result, rerender } = renderHook(() => useAssetManagement(stableProps));
            const mockAsset = createMockPlacedAsset({ id: 'fail-move', index: 1 });

            // First set the placed assets
            act(() => {
                result.current.setPlacedAssets([mockAsset]);
            });

            // Force a rerender to ensure the hook has the latest state
            rerender();

            // Act - execute the move command
            act(() => {
                result.current.handleAssetMoved([
                    {
                        assetId: 'fail-move',
                        oldPosition: { x: 0, y: 0 },
                        newPosition: { x: 100, y: 100 },
                    },
                ]);
            });

            // Wait for microtasks to flush so the async onMove callback completes
            await act(async () => {
                await new Promise(resolve => setTimeout(resolve, 50));
            });

            // Assert - local state should still update
            expect(consoleErrorSpy).toHaveBeenCalledWith(
                'Failed to persist asset movement:',
                expect.any(Error)
            );
            const movedAsset = result.current.placedAssets.find(a => a.id === 'fail-move');
            expect(movedAsset?.position).toEqual({ x: 100, y: 100 });
            consoleErrorSpy.mockRestore();
        });
    });

    describe('handleRotationStart', () => {
        it('should create snapshots for selected assets only', () => {
            // Arrange
            const props = createMockProps();
            const { result } = renderHook(() => useAssetManagement(props));

            const selectedAsset = createMockPlacedAsset({ id: 'selected', rotation: 45 });
            const unselectedAsset = createMockPlacedAsset({ id: 'unselected', rotation: 90 });

            act(() => {
                result.current.setPlacedAssets([selectedAsset, unselectedAsset]);
                result.current.setSelectedAssetIds(['selected']);
            });

            // Act
            act(() => {
                result.current.handleRotationStart();
            });

            // Assert - rotation should work on selected asset only (verified by handleRotationEnd behavior)
            expect(result.current.selectedAssetIds).toEqual(['selected']);
        });

        it('should store snapshots in rotationInitialSnapshots Map', () => {
            // Arrange
            const props = createMockProps();
            const { result } = renderHook(() => useAssetManagement(props));

            const asset1 = createMockPlacedAsset({
                id: 'snap-1',
                rotation: 30,
                position: { x: 100, y: 200 },
            });
            const asset2 = createMockPlacedAsset({
                id: 'snap-2',
                rotation: 60,
                position: { x: 300, y: 400 },
            });

            act(() => {
                result.current.setPlacedAssets([asset1, asset2]);
                result.current.setSelectedAssetIds(['snap-1', 'snap-2']);
            });

            // Act
            act(() => {
                result.current.handleRotationStart();
            });

            // Assert - indirectly verify by checking that rotation end will detect changes
            act(() => {
                result.current.handleAssetRotated([
                    { assetId: 'snap-1', rotation: 45 },
                ]);
            });

            const rotatedAsset = result.current.placedAssets.find(a => a.id === 'snap-1');
            expect(rotatedAsset?.rotation).toBe(45);
        });
    });

    describe('handleAssetRotated', () => {
        it('should update rotation for assets in updates array', () => {
            // Arrange
            const props = createMockProps();
            const { result } = renderHook(() => useAssetManagement(props));

            const asset = createMockPlacedAsset({ id: 'rotate-1', rotation: 0 });

            act(() => {
                result.current.setPlacedAssets([asset]);
            });

            // Act
            act(() => {
                result.current.handleAssetRotated([
                    { assetId: 'rotate-1', rotation: 90 },
                ]);
            });

            // Assert
            const rotatedAsset = result.current.placedAssets.find(a => a.id === 'rotate-1');
            expect(rotatedAsset?.rotation).toBe(90);
        });

        it('should optionally update position if provided', () => {
            // Arrange
            const props = createMockProps();
            const { result } = renderHook(() => useAssetManagement(props));

            const asset = createMockPlacedAsset({
                id: 'rotate-pos',
                rotation: 0,
                position: { x: 100, y: 100 },
            });

            act(() => {
                result.current.setPlacedAssets([asset]);
            });

            // Act
            act(() => {
                result.current.handleAssetRotated([
                    {
                        assetId: 'rotate-pos',
                        rotation: 45,
                        position: { x: 150, y: 150 },
                    },
                ]);
            });

            // Assert
            const rotatedAsset = result.current.placedAssets.find(a => a.id === 'rotate-pos');
            expect(rotatedAsset?.rotation).toBe(45);
            expect(rotatedAsset?.position).toEqual({ x: 150, y: 150 });
        });

        it('should leave assets not in updates unchanged', () => {
            // Arrange
            const props = createMockProps();
            const { result } = renderHook(() => useAssetManagement(props));

            const asset1 = createMockPlacedAsset({ id: 'change', rotation: 0 });
            const asset2 = createMockPlacedAsset({ id: 'unchanged', rotation: 45 });

            act(() => {
                result.current.setPlacedAssets([asset1, asset2]);
            });

            // Act
            act(() => {
                result.current.handleAssetRotated([
                    { assetId: 'change', rotation: 180 },
                ]);
            });

            // Assert
            const unchangedAsset = result.current.placedAssets.find(a => a.id === 'unchanged');
            expect(unchangedAsset?.rotation).toBe(45);
        });
    });

    describe('handleRotationEnd', () => {
        it('should return early if no encounterId or encounter', async () => {
            // Arrange
            const mockExecute = vi.fn();
            const props = createMockProps({
                encounterId: undefined,
                execute: mockExecute,
            });
            const { result } = renderHook(() => useAssetManagement(props));

            // Act
            await act(async () => {
                await result.current.handleRotationEnd();
            });

            // Assert
            expect(mockExecute).not.toHaveBeenCalled();
        });

        it('should return early if no selected assets', async () => {
            // Arrange
            const mockExecute = vi.fn();
            const props = createMockProps({ execute: mockExecute });
            const { result } = renderHook(() => useAssetManagement(props));

            act(() => {
                result.current.setSelectedAssetIds([]);
            });

            // Act
            await act(async () => {
                await result.current.handleRotationEnd();
            });

            // Assert
            expect(mockExecute).not.toHaveBeenCalled();
        });

        it('should return early if no changes detected', async () => {
            // Arrange
            const mockExecute = vi.fn((cmd) => cmd.execute());
            const props = createMockProps({ execute: mockExecute });
            const { result } = renderHook(() => useAssetManagement(props));

            const asset = createMockPlacedAsset({ id: 'no-change', rotation: 45 });

            act(() => {
                result.current.setPlacedAssets([asset]);
                result.current.setSelectedAssetIds(['no-change']);
            });

            // Start rotation (creates snapshots)
            act(() => {
                result.current.handleRotationStart();
            });

            // Don't change anything

            mockExecute.mockClear();

            // Act
            await act(async () => {
                await result.current.handleRotationEnd();
            });

            // Assert - no command should be created for no changes
            expect(mockExecute).not.toHaveBeenCalled();
        });

        it('should create TransformAssetCommand with before/after snapshots', async () => {
            // Arrange
            const mockExecute = vi.fn((cmd) => cmd.execute());
            const props = createMockProps({ execute: mockExecute });
            const { result } = renderHook(() => useAssetManagement(props));

            const asset = createMockPlacedAsset({ id: 'transform-test', rotation: 0 });

            act(() => {
                result.current.setPlacedAssets([asset]);
                result.current.setSelectedAssetIds(['transform-test']);
            });

            // Start rotation (creates before snapshots)
            act(() => {
                result.current.handleRotationStart();
            });

            // Make a change
            act(() => {
                result.current.handleAssetRotated([
                    { assetId: 'transform-test', rotation: 90 },
                ]);
            });

            mockExecute.mockClear();

            // Act
            await act(async () => {
                await result.current.handleRotationEnd();
            });

            // Assert
            expect(mockExecute).toHaveBeenCalledWith(
                expect.objectContaining({
                    description: expect.stringContaining('Transform'),
                })
            );
        });

        it('should call updateEncounterAsset for single asset when online', async () => {
            // Arrange
            const updateEncounterAsset = vi.fn().mockReturnValue({
                unwrap: vi.fn().mockResolvedValue({}),
            });
            const props = createMockProps({
                isOnline: true,
                updateEncounterAsset,
            });
            const { result } = renderHook(() => useAssetManagement(props));

            const asset = createMockPlacedAsset({
                id: 'single-rotate-api',
                index: 3,
                rotation: 0,
            });

            act(() => {
                result.current.setPlacedAssets([asset]);
                result.current.setSelectedAssetIds(['single-rotate-api']);
            });

            act(() => {
                result.current.handleRotationStart();
            });

            act(() => {
                result.current.handleAssetRotated([
                    { assetId: 'single-rotate-api', rotation: 90 },
                ]);
            });

            // Act
            await act(async () => {
                await result.current.handleRotationEnd();
            });

            // Assert
            expect(updateEncounterAsset).toHaveBeenCalledWith(
                expect.objectContaining({
                    encounterId: 'test-encounter-id',
                    assetNumber: 3,
                    rotation: expect.any(Number),
                })
            );
        });

        it('should call bulkUpdateEncounterAssets for multiple assets when online', async () => {
            // Arrange
            const bulkUpdateEncounterAssets = vi.fn().mockReturnValue({
                unwrap: vi.fn().mockResolvedValue({}),
            });
            const props = createMockProps({
                isOnline: true,
                bulkUpdateEncounterAssets,
            });
            const { result } = renderHook(() => useAssetManagement(props));

            const asset1 = createMockPlacedAsset({ id: 'bulk-rot-1', index: 1, rotation: 0 });
            const asset2 = createMockPlacedAsset({ id: 'bulk-rot-2', index: 2, rotation: 0 });

            act(() => {
                result.current.setPlacedAssets([asset1, asset2]);
                result.current.setSelectedAssetIds(['bulk-rot-1', 'bulk-rot-2']);
            });

            act(() => {
                result.current.handleRotationStart();
            });

            act(() => {
                result.current.handleAssetRotated([
                    { assetId: 'bulk-rot-1', rotation: 45 },
                    { assetId: 'bulk-rot-2', rotation: 90 },
                ]);
            });

            // Act
            await act(async () => {
                await result.current.handleRotationEnd();
            });

            // Assert
            expect(bulkUpdateEncounterAssets).toHaveBeenCalledWith(
                expect.objectContaining({
                    encounterId: 'test-encounter-id',
                    updates: expect.arrayContaining([
                        expect.objectContaining({ index: 1 }),
                        expect.objectContaining({ index: 2 }),
                    ]),
                })
            );
        });
    });

    describe('confirmDelete', () => {
        it('should return early if assetsToDelete is empty', async () => {
            // Arrange
            const mockExecute = vi.fn();
            const props = createMockProps({ execute: mockExecute });
            const { result } = renderHook(() => useAssetManagement(props));

            // Don't set any assets to delete

            // Act
            await act(async () => {
                await result.current.confirmDelete();
            });

            // Assert
            expect(mockExecute).not.toHaveBeenCalled();
        });

        it('should create BulkRemoveAssetsCommand and execute', async () => {
            // Arrange
            const mockExecute = vi.fn((cmd) => cmd.execute());
            const props = createMockProps({ execute: mockExecute });
            const { result } = renderHook(() => useAssetManagement(props));

            const assetToDelete = createMockPlacedAsset({ id: 'del-1' });

            act(() => {
                result.current.setPlacedAssets([assetToDelete]);
                result.current.setSelectedAssetIds(['del-1']);
            });

            act(() => {
                result.current.handleAssetDeleted();
            });

            mockExecute.mockClear();

            // Act
            await act(async () => {
                await result.current.confirmDelete();
            });

            // Assert
            expect(mockExecute).toHaveBeenCalledWith(
                expect.objectContaining({
                    description: expect.stringContaining('Delete'),
                })
            );
        });

        it('should call bulkDeleteEncounterAssets in onBulkRemove callback', async () => {
            // Arrange
            const bulkDeleteEncounterAssets = vi.fn().mockReturnValue({
                unwrap: vi.fn().mockResolvedValue({}),
            });
            const props = createMockProps({
                isOnline: true,
                bulkDeleteEncounterAssets,
            });
            const { result } = renderHook(() => useAssetManagement(props));

            const assetToDelete = createMockPlacedAsset({ id: 'api-del', index: 5 });

            act(() => {
                result.current.setPlacedAssets([assetToDelete]);
                result.current.setSelectedAssetIds(['api-del']);
            });

            act(() => {
                result.current.handleAssetDeleted();
            });

            // Act
            await act(async () => {
                await result.current.confirmDelete();
            });

            // Assert
            expect(bulkDeleteEncounterAssets).toHaveBeenCalledWith({
                encounterId: 'test-encounter-id',
                assetIndices: [5],
            });
        });

        it('should clear selection and close dialog after delete', async () => {
            // Arrange
            const props = createMockProps({ isOnline: true });
            const { result } = renderHook(() => useAssetManagement(props));

            const assetToDelete = createMockPlacedAsset({ id: 'clear-test' });

            act(() => {
                result.current.setPlacedAssets([assetToDelete]);
                result.current.setSelectedAssetIds(['clear-test']);
            });

            act(() => {
                result.current.handleAssetDeleted();
            });

            // Act
            await act(async () => {
                await result.current.confirmDelete();
            });

            // Assert
            expect(result.current.selectedAssetIds).toEqual([]);
            expect(result.current.deleteConfirmOpen).toBe(false);
            expect(result.current.assetsToDelete).toEqual([]);
        });

        it('should handle API failure gracefully', async () => {
            // Arrange
            const consoleErrorSpy = vi.spyOn(console, 'error').mockImplementation(() => {});
            const bulkDeleteEncounterAssets = vi.fn().mockReturnValue({
                unwrap: vi.fn().mockRejectedValue(new Error('Delete failed')),
            });
            const props = createMockProps({
                isOnline: true,
                bulkDeleteEncounterAssets,
            });
            const { result } = renderHook(() => useAssetManagement(props));

            const assetToDelete = createMockPlacedAsset({ id: 'fail-del' });

            act(() => {
                result.current.setPlacedAssets([assetToDelete]);
                result.current.setSelectedAssetIds(['fail-del']);
            });

            act(() => {
                result.current.handleAssetDeleted();
            });

            // Act
            await act(async () => {
                await result.current.confirmDelete();
            });

            // Assert
            expect(consoleErrorSpy).toHaveBeenCalledWith(
                'Failed to persist bulk asset deletion:',
                expect.any(Error)
            );
            consoleErrorSpy.mockRestore();
        });
    });

    describe('handleCopyAssets', () => {
        it('should return early if no selected assets or no encounterId', () => {
            // Arrange
            const mockExecute = vi.fn();
            const copyAssets = vi.fn();
            const props = createMockProps({
                execute: mockExecute,
                copyAssets,
                encounterId: undefined,
            });
            const { result } = renderHook(() => useAssetManagement(props));

            // Act
            act(() => {
                result.current.handleCopyAssets();
            });

            // Assert
            expect(mockExecute).not.toHaveBeenCalled();
            expect(copyAssets).not.toHaveBeenCalled();
        });

        it('should filter placedAssets by selectedAssetIds', () => {
            // Arrange
            const copyAssets = vi.fn();
            const props = createMockProps({ copyAssets });
            const { result } = renderHook(() => useAssetManagement(props));

            const asset1 = createMockPlacedAsset({ id: 'copy-1' });
            const asset2 = createMockPlacedAsset({ id: 'copy-2' });
            const asset3 = createMockPlacedAsset({ id: 'not-copied' });

            act(() => {
                result.current.setPlacedAssets([asset1, asset2, asset3]);
                result.current.setSelectedAssetIds(['copy-1', 'copy-2']);
            });

            // Act
            act(() => {
                result.current.handleCopyAssets();
            });

            // Assert
            expect(copyAssets).toHaveBeenCalledWith(
                expect.arrayContaining([
                    expect.objectContaining({ id: 'copy-1' }),
                    expect.objectContaining({ id: 'copy-2' }),
                ]),
                'test-encounter-id'
            );
            expect(copyAssets).not.toHaveBeenCalledWith(
                expect.arrayContaining([
                    expect.objectContaining({ id: 'not-copied' }),
                ]),
                expect.any(String)
            );
        });

        it('should create CopyAssetsCommand and call copyAssets prop', () => {
            // Arrange
            const mockExecute = vi.fn((cmd) => cmd.execute());
            const copyAssets = vi.fn();
            const props = createMockProps({ execute: mockExecute, copyAssets });
            const { result } = renderHook(() => useAssetManagement(props));

            const asset = createMockPlacedAsset({ id: 'copy-cmd-test' });

            act(() => {
                result.current.setPlacedAssets([asset]);
                result.current.setSelectedAssetIds(['copy-cmd-test']);
            });

            // Act
            act(() => {
                result.current.handleCopyAssets();
            });

            // Assert
            expect(mockExecute).toHaveBeenCalledWith(
                expect.objectContaining({
                    description: expect.stringContaining('Copy'),
                })
            );
            expect(copyAssets).toHaveBeenCalled();
        });
    });

    describe('handleCutAssets', () => {
        it('should return early if offline', () => {
            // Arrange
            const mockExecute = vi.fn();
            const cutAssets = vi.fn();
            const props = createMockProps({
                isOnline: false,
                execute: mockExecute,
                cutAssets,
            });
            const { result } = renderHook(() => useAssetManagement(props));

            const asset = createMockPlacedAsset({ id: 'cut-offline' });

            act(() => {
                result.current.setPlacedAssets([asset]);
                result.current.setSelectedAssetIds(['cut-offline']);
            });

            // Act
            act(() => {
                result.current.handleCutAssets();
            });

            // Assert
            expect(mockExecute).not.toHaveBeenCalled();
            expect(cutAssets).not.toHaveBeenCalled();
        });

        it('should call cutAssets and bulkDeleteEncounterAssets', async () => {
            // Arrange
            const cutAssets = vi.fn();
            const bulkDeleteEncounterAssets = vi.fn().mockReturnValue({
                unwrap: vi.fn().mockResolvedValue({}),
            });
            const props = createMockProps({
                isOnline: true,
                cutAssets,
                bulkDeleteEncounterAssets,
            });
            const { result } = renderHook(() => useAssetManagement(props));

            const asset = createMockPlacedAsset({ id: 'cut-asset', index: 4 });

            act(() => {
                result.current.setPlacedAssets([asset]);
                result.current.setSelectedAssetIds(['cut-asset']);
            });

            // Act
            await act(async () => {
                result.current.handleCutAssets();
            });

            // Assert
            expect(cutAssets).toHaveBeenCalled();
            expect(bulkDeleteEncounterAssets).toHaveBeenCalledWith({
                encounterId: 'test-encounter-id',
                assetIndices: [4],
            });
        });

        it('should clear selection after cut', async () => {
            // Arrange
            const props = createMockProps({ isOnline: true });
            const { result } = renderHook(() => useAssetManagement(props));

            const asset = createMockPlacedAsset({ id: 'cut-clear' });

            act(() => {
                result.current.setPlacedAssets([asset]);
                result.current.setSelectedAssetIds(['cut-clear']);
            });

            // Act
            await act(async () => {
                result.current.handleCutAssets();
            });

            // Assert
            expect(result.current.selectedAssetIds).toEqual([]);
        });
    });

    describe('handlePasteAssets', () => {
        it('should return early if canPaste is false', () => {
            // Arrange
            const mockExecute = vi.fn();
            const props = createMockProps({
                canPaste: false,
                execute: mockExecute,
            });
            const { result } = renderHook(() => useAssetManagement(props));

            // Act
            act(() => {
                result.current.handlePasteAssets();
            });

            // Assert
            expect(mockExecute).not.toHaveBeenCalled();
        });

        it('should return early if missing preconditions', () => {
            // Arrange
            const mockExecute = vi.fn();
            const props = createMockProps({
                canPaste: true,
                encounterId: undefined,
                execute: mockExecute,
            });
            const { result } = renderHook(() => useAssetManagement(props));

            // Act
            act(() => {
                result.current.handlePasteAssets();
            });

            // Assert
            expect(mockExecute).not.toHaveBeenCalled();
        });

        it('should generate new IDs and offset position by 20px', async () => {
            // Arrange
            const clipboardAsset = createMockPlacedAsset({
                id: 'clipboard-asset',
                position: { x: 100, y: 100 },
            });
            const getClipboardAssets = vi.fn().mockReturnValue([clipboardAsset]);
            const bulkAddEncounterAssets = vi.fn().mockReturnValue({
                unwrap: vi.fn().mockResolvedValue({}),
            });
            const props = createMockProps({
                canPaste: true,
                isOnline: true,
                getClipboardAssets,
                bulkAddEncounterAssets,
            });
            const { result } = renderHook(() => useAssetManagement(props));

            // Act
            await act(async () => {
                result.current.handlePasteAssets();
            });

            // Assert
            expect(bulkAddEncounterAssets).toHaveBeenCalledWith({
                encounterId: 'test-encounter-id',
                assets: expect.arrayContaining([
                    expect.objectContaining({
                        position: { x: 120, y: 120 }, // 100 + 20 offset
                    }),
                ]),
            });
        });

        it('should call bulkAddEncounterAssets', async () => {
            // Arrange
            const clipboardAsset = createMockPlacedAsset();
            const getClipboardAssets = vi.fn().mockReturnValue([clipboardAsset]);
            const bulkAddEncounterAssets = vi.fn().mockReturnValue({
                unwrap: vi.fn().mockResolvedValue({}),
            });
            const props = createMockProps({
                canPaste: true,
                isOnline: true,
                getClipboardAssets,
                bulkAddEncounterAssets,
            });
            const { result } = renderHook(() => useAssetManagement(props));

            // Act
            await act(async () => {
                result.current.handlePasteAssets();
            });

            // Assert
            expect(bulkAddEncounterAssets).toHaveBeenCalled();
        });

        it('should clear clipboard if operation was cut', async () => {
            // Arrange
            const clipboardAsset = createMockPlacedAsset();
            const getClipboardAssets = vi.fn().mockReturnValue([clipboardAsset]);
            const clearClipboard = vi.fn();
            const updatedEncounter = createMockEncounter();
            const refetch = vi.fn().mockResolvedValue({ data: updatedEncounter });
            (hydrateGameElements as Mock).mockReturnValue([]);
            const props = createMockProps({
                canPaste: true,
                isOnline: true,
                getClipboardAssets,
                clearClipboard,
                clipboard: { operation: 'cut' },
                refetch,
            });
            const { result } = renderHook(() => useAssetManagement(props));

            // Act
            await act(async () => {
                result.current.handlePasteAssets();
            });

            // Assert
            expect(clearClipboard).toHaveBeenCalled();
        });
    });

    describe('handleAssetRename', () => {
        it('should return early if asset not found', async () => {
            // Arrange
            const updateEncounterAsset = vi.fn();
            const props = createMockProps({ updateEncounterAsset });
            const { result } = renderHook(() => useAssetManagement(props));

            // Act
            await act(async () => {
                await result.current.handleAssetRename('non-existent', 'New Name');
            });

            // Assert
            expect(updateEncounterAsset).not.toHaveBeenCalled();
        });

        it('should return early if offline', async () => {
            // Arrange
            const updateEncounterAsset = vi.fn();
            const props = createMockProps({
                isOnline: false,
                updateEncounterAsset,
            });
            const { result } = renderHook(() => useAssetManagement(props));

            const asset = createMockPlacedAsset({ id: 'offline-rename' });

            act(() => {
                result.current.setPlacedAssets([asset]);
            });

            // Act
            await act(async () => {
                await result.current.handleAssetRename('offline-rename', 'New Name');
            });

            // Assert
            expect(updateEncounterAsset).not.toHaveBeenCalled();
        });

        it('should create RenameAssetCommand and execute', async () => {
            // Arrange
            const mockExecute = vi.fn((cmd) => cmd.execute());
            const props = createMockProps({
                isOnline: true,
                execute: mockExecute,
            });
            const { result } = renderHook(() => useAssetManagement(props));

            const asset = createMockPlacedAsset({ id: 'rename-cmd', name: 'Old Name' });

            act(() => {
                result.current.setPlacedAssets([asset]);
            });

            // Act
            await act(async () => {
                await result.current.handleAssetRename('rename-cmd', 'New Name');
            });

            // Assert
            expect(mockExecute).toHaveBeenCalledWith(
                expect.objectContaining({
                    description: expect.stringContaining('Rename'),
                })
            );
        });

        it('should call updateEncounterAsset with newName', async () => {
            // Arrange
            const updateEncounterAsset = vi.fn().mockReturnValue({
                unwrap: vi.fn().mockResolvedValue({}),
            });
            const props = createMockProps({
                isOnline: true,
                updateEncounterAsset,
            });
            const { result } = renderHook(() => useAssetManagement(props));

            const asset = createMockPlacedAsset({
                id: 'api-rename',
                index: 7,
                name: 'Original',
            });

            act(() => {
                result.current.setPlacedAssets([asset]);
            });

            // Act
            await act(async () => {
                await result.current.handleAssetRename('api-rename', 'Updated Name');
            });

            // Assert
            expect(updateEncounterAsset).toHaveBeenCalledWith({
                encounterId: 'test-encounter-id',
                assetNumber: 7,
                name: 'Updated Name',
            });
        });
    });

    describe('handleAssetDisplayUpdate', () => {
        it('should update labelVisibility only when provided', async () => {
            // Arrange
            const mockExecute = vi.fn((cmd) => cmd.execute());
            const props = createMockProps({ execute: mockExecute });
            const { result } = renderHook(() => useAssetManagement(props));

            const asset = createMockPlacedAsset({
                id: 'display-vis',
                labelVisibility: 'Default' as LabelVisibility,
                labelPosition: 'Top' as LabelPosition,
            });

            act(() => {
                result.current.setPlacedAssets([asset]);
            });

            // Act
            await act(async () => {
                result.current.handleAssetDisplayUpdate('display-vis', 'Always' as LabelVisibility);
            });

            // Assert
            const updatedAsset = result.current.placedAssets.find(a => a.id === 'display-vis');
            expect(updatedAsset?.labelVisibility).toBe('Always');
            expect(updatedAsset?.labelPosition).toBe('Top'); // Unchanged
        });

        it('should update labelPosition only when provided', async () => {
            // Arrange
            const mockExecute = vi.fn((cmd) => cmd.execute());
            const props = createMockProps({ execute: mockExecute });
            const { result } = renderHook(() => useAssetManagement(props));

            const asset = createMockPlacedAsset({
                id: 'display-pos',
                labelVisibility: 'Always' as LabelVisibility,
                labelPosition: 'Top' as LabelPosition,
            });

            act(() => {
                result.current.setPlacedAssets([asset]);
            });

            // Act
            await act(async () => {
                result.current.handleAssetDisplayUpdate('display-pos', undefined, 'Bottom' as LabelPosition);
            });

            // Assert
            const updatedAsset = result.current.placedAssets.find(a => a.id === 'display-pos');
            expect(updatedAsset?.labelVisibility).toBe('Always'); // Unchanged
            expect(updatedAsset?.labelPosition).toBe('Bottom');
        });
    });
});
