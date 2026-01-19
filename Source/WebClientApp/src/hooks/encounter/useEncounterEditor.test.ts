/**
 * useEncounterEditor Hook Unit Tests
 * Tests the routing of mutations between Stage API and Encounter API
 * Coverage: Data extraction, structural element mutations (Stage API), game element mutations (Encounter API)
 */

import { renderHook, act } from '@testing-library/react';
import { describe, it, expect, vi, beforeEach, type Mock } from 'vitest';
import { useEncounterEditor } from './useEncounterEditor';
import { Weather, GridType, RegionType, LightSourceType, type Encounter } from '@/types/domain';
import type { Stage } from '@/types/stage';
import { AmbientLight, AmbientSoundSource } from '@/types/stage';

// Mock encounterApi hooks
const mockUseGetEncounterQuery = vi.fn();
const mockUsePatchEncounterMutation = vi.fn();
const mockUseAddEncounterAssetMutation = vi.fn();
const mockUseUpdateEncounterAssetMutation = vi.fn();
const mockUseRemoveEncounterAssetMutation = vi.fn();
const mockUseBulkAddEncounterAssetsMutation = vi.fn();
const mockUseBulkUpdateEncounterAssetsMutation = vi.fn();
const mockUseBulkDeleteEncounterAssetsMutation = vi.fn();

vi.mock('@/services/encounterApi', () => ({
    useGetEncounterQuery: (...args: unknown[]) => mockUseGetEncounterQuery(...args),
    usePatchEncounterMutation: () => mockUsePatchEncounterMutation(),
    useAddEncounterAssetMutation: () => mockUseAddEncounterAssetMutation(),
    useUpdateEncounterAssetMutation: () => mockUseUpdateEncounterAssetMutation(),
    useRemoveEncounterAssetMutation: () => mockUseRemoveEncounterAssetMutation(),
    useBulkAddEncounterAssetsMutation: () => mockUseBulkAddEncounterAssetsMutation(),
    useBulkUpdateEncounterAssetsMutation: () => mockUseBulkUpdateEncounterAssetsMutation(),
    useBulkDeleteEncounterAssetsMutation: () => mockUseBulkDeleteEncounterAssetsMutation(),
}));

// Mock stageApi hooks
const mockUseAddWallMutation = vi.fn();
const mockUseUpdateWallMutation = vi.fn();
const mockUseDeleteWallMutation = vi.fn();
const mockUseAddRegionMutation = vi.fn();
const mockUseUpdateRegionMutation = vi.fn();
const mockUseDeleteRegionMutation = vi.fn();
const mockUseAddLightMutation = vi.fn();
const mockUseUpdateLightMutation = vi.fn();
const mockUseDeleteLightMutation = vi.fn();
const mockUseAddSoundMutation = vi.fn();
const mockUseUpdateSoundMutation = vi.fn();
const mockUseDeleteSoundMutation = vi.fn();
const mockUseUpdateStageMutation = vi.fn();

vi.mock('@/services/stageApi', () => ({
    useAddWallMutation: () => mockUseAddWallMutation(),
    useUpdateWallMutation: () => mockUseUpdateWallMutation(),
    useDeleteWallMutation: () => mockUseDeleteWallMutation(),
    useAddRegionMutation: () => mockUseAddRegionMutation(),
    useUpdateRegionMutation: () => mockUseUpdateRegionMutation(),
    useDeleteRegionMutation: () => mockUseDeleteRegionMutation(),
    useAddLightMutation: () => mockUseAddLightMutation(),
    useUpdateLightMutation: () => mockUseUpdateLightMutation(),
    useDeleteLightMutation: () => mockUseDeleteLightMutation(),
    useAddSoundMutation: () => mockUseAddSoundMutation(),
    useUpdateSoundMutation: () => mockUseUpdateSoundMutation(),
    useDeleteSoundMutation: () => mockUseDeleteSoundMutation(),
    useUpdateStageMutation: () => mockUseUpdateStageMutation(),
}));

// Helper to create mock mutation tuple
const createMockMutation = (): [Mock, { isLoading: boolean }] => {
    const mockFn = vi.fn().mockReturnValue({ unwrap: vi.fn().mockResolvedValue(undefined) });
    return [mockFn, { isLoading: false }];
};

// Test data factories
const createMockStage = (overrides: Partial<Stage> = {}): Stage => ({
    id: 'stage-123',
    ownerId: 'owner-1',
    name: 'Test Stage',
    description: 'A test stage',
    isPublished: false,
    isPublic: false,
    settings: {
        zoomLevel: 1,
        panning: { x: 0, y: 0 },
        ambientLight: AmbientLight.Default,
        ambientSound: null,
        ambientSoundSource: AmbientSoundSource.NotSet,
        ambientSoundVolume: 0.5,
        ambientSoundLoop: false,
        ambientSoundIsPlaying: false,
        weather: Weather.Clear,
        mainBackground: null,
        alternateBackground: null,
        useAlternateBackground: false,
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

const createMockEncounter = (overrides: Partial<Encounter> = {}): Encounter => ({
    id: 'encounter-456',
    ownerId: 'owner-1',
    adventure: null,
    name: 'Test Encounter',
    description: 'A test encounter',
    isPublished: false,
    isPublic: false,
    stage: createMockStage(),
    actors: [],
    objects: [],
    effects: [],
    ...overrides,
});

describe('useEncounterEditor', () => {
    // Default mutation mocks
    let mockPatchEncounter: Mock;
    let mockAddAsset: Mock;
    let mockUpdateAsset: Mock;
    let mockRemoveAsset: Mock;
    let mockBulkAddAssets: Mock;
    let mockBulkUpdateAssets: Mock;
    let mockBulkDeleteAssets: Mock;
    let mockAddWall: Mock;
    let mockUpdateWall: Mock;
    let mockDeleteWall: Mock;
    let mockAddRegion: Mock;
    let mockUpdateRegion: Mock;
    let mockDeleteRegion: Mock;
    let mockAddLight: Mock;
    let mockUpdateLight: Mock;
    let mockDeleteLight: Mock;
    let mockAddSound: Mock;
    let mockUpdateSound: Mock;
    let mockDeleteSound: Mock;
    let mockUpdateStage: Mock;
    const mockRefetch = vi.fn();

    beforeEach(() => {
        vi.clearAllMocks();

        // Setup encounter API mutations
        [mockPatchEncounter] = createMockMutation();
        mockUsePatchEncounterMutation.mockReturnValue([mockPatchEncounter]);

        [mockAddAsset] = createMockMutation();
        mockUseAddEncounterAssetMutation.mockReturnValue([mockAddAsset]);

        [mockUpdateAsset] = createMockMutation();
        mockUseUpdateEncounterAssetMutation.mockReturnValue([mockUpdateAsset]);

        [mockRemoveAsset] = createMockMutation();
        mockUseRemoveEncounterAssetMutation.mockReturnValue([mockRemoveAsset]);

        [mockBulkAddAssets] = createMockMutation();
        mockUseBulkAddEncounterAssetsMutation.mockReturnValue([mockBulkAddAssets]);

        [mockBulkUpdateAssets] = createMockMutation();
        mockUseBulkUpdateEncounterAssetsMutation.mockReturnValue([mockBulkUpdateAssets]);

        [mockBulkDeleteAssets] = createMockMutation();
        mockUseBulkDeleteEncounterAssetsMutation.mockReturnValue([mockBulkDeleteAssets]);

        // Setup stage API mutations
        [mockAddWall] = createMockMutation();
        mockUseAddWallMutation.mockReturnValue([mockAddWall]);

        [mockUpdateWall] = createMockMutation();
        mockUseUpdateWallMutation.mockReturnValue([mockUpdateWall]);

        [mockDeleteWall] = createMockMutation();
        mockUseDeleteWallMutation.mockReturnValue([mockDeleteWall]);

        [mockAddRegion] = createMockMutation();
        mockUseAddRegionMutation.mockReturnValue([mockAddRegion]);

        [mockUpdateRegion] = createMockMutation();
        mockUseUpdateRegionMutation.mockReturnValue([mockUpdateRegion]);

        [mockDeleteRegion] = createMockMutation();
        mockUseDeleteRegionMutation.mockReturnValue([mockDeleteRegion]);

        [mockAddLight] = createMockMutation();
        mockUseAddLightMutation.mockReturnValue([mockAddLight]);

        [mockUpdateLight] = createMockMutation();
        mockUseUpdateLightMutation.mockReturnValue([mockUpdateLight]);

        [mockDeleteLight] = createMockMutation();
        mockUseDeleteLightMutation.mockReturnValue([mockDeleteLight]);

        [mockAddSound] = createMockMutation();
        mockUseAddSoundMutation.mockReturnValue([mockAddSound]);

        [mockUpdateSound] = createMockMutation();
        mockUseUpdateSoundMutation.mockReturnValue([mockUpdateSound]);

        [mockDeleteSound] = createMockMutation();
        mockUseDeleteSoundMutation.mockReturnValue([mockDeleteSound]);

        [mockUpdateStage] = createMockMutation();
        mockUseUpdateStageMutation.mockReturnValue([mockUpdateStage]);

        // Default query mock - encounter loaded
        mockUseGetEncounterQuery.mockReturnValue({
            data: createMockEncounter(),
            isLoading: false,
            isError: false,
            error: null,
            refetch: mockRefetch,
        });
    });

    describe('data extraction', () => {
        it('should extract stage from encounter data', () => {
            // Arrange
            const mockStage = createMockStage({ id: 'extracted-stage-id' });
            const mockEncounter = createMockEncounter({ stage: mockStage });
            mockUseGetEncounterQuery.mockReturnValue({
                data: mockEncounter,
                isLoading: false,
                isError: false,
                error: null,
                refetch: mockRefetch,
            });

            // Act
            const { result } = renderHook(() =>
                useEncounterEditor({ encounterId: 'encounter-456' })
            );

            // Assert
            expect(result.current.stage).toBeDefined();
            expect(result.current.stage?.id).toBe('extracted-stage-id');
        });

        it('should extract stageId from stage', () => {
            // Arrange
            const mockStage = createMockStage({ id: 'my-stage-id' });
            const mockEncounter = createMockEncounter({ stage: mockStage });
            mockUseGetEncounterQuery.mockReturnValue({
                data: mockEncounter,
                isLoading: false,
                isError: false,
                error: null,
                refetch: mockRefetch,
            });

            // Act
            const { result } = renderHook(() =>
                useEncounterEditor({ encounterId: 'encounter-456' })
            );

            // Assert
            expect(result.current.stageId).toBe('my-stage-id');
        });

        it('should return undefined stage when encounter not loaded', () => {
            // Arrange
            mockUseGetEncounterQuery.mockReturnValue({
                data: undefined,
                isLoading: true,
                isError: false,
                error: null,
                refetch: mockRefetch,
            });

            // Act
            const { result } = renderHook(() =>
                useEncounterEditor({ encounterId: 'encounter-456' })
            );

            // Assert
            expect(result.current.stage).toBeUndefined();
            expect(result.current.stageId).toBeUndefined();
        });

        it('should return undefined stageId when encounter not loaded', () => {
            // Arrange
            mockUseGetEncounterQuery.mockReturnValue({
                data: undefined,
                isLoading: false,
                isError: true,
                error: new Error('Not found'),
                refetch: mockRefetch,
            });

            // Act
            const { result } = renderHook(() =>
                useEncounterEditor({ encounterId: 'encounter-456' })
            );

            // Assert
            expect(result.current.stageId).toBeUndefined();
            expect(result.current.encounter).toBeUndefined();
        });

        it('should expose loading and error states', () => {
            // Arrange
            mockUseGetEncounterQuery.mockReturnValue({
                data: undefined,
                isLoading: true,
                isError: false,
                error: null,
                refetch: mockRefetch,
            });

            // Act
            const { result } = renderHook(() =>
                useEncounterEditor({ encounterId: 'encounter-456' })
            );

            // Assert
            expect(result.current.isLoading).toBe(true);
            expect(result.current.isError).toBe(false);
        });

        it('should pass skip option to query', () => {
            // Act
            renderHook(() =>
                useEncounterEditor({ encounterId: 'encounter-456', skip: true })
            );

            // Assert
            expect(mockUseGetEncounterQuery).toHaveBeenCalledWith('encounter-456', { skip: true });
        });
    });

    describe('structural element mutations - walls (routed to Stage API via stageId)', () => {
        it('addWall should call stageApi with stageId', async () => {
            // Arrange
            const { result } = renderHook(() =>
                useEncounterEditor({ encounterId: 'encounter-456' })
            );
            const wallData = { name: 'Test Wall', segments: [] };

            // Act
            await act(async () => {
                await result.current.addWall(wallData);
            });

            // Assert
            expect(mockAddWall).toHaveBeenCalledTimes(1);
            expect(mockAddWall).toHaveBeenCalledWith({ stageId: 'stage-123', data: wallData });
        });

        it('updateWall should call stageApi with stageId and index', async () => {
            // Arrange
            const { result } = renderHook(() =>
                useEncounterEditor({ encounterId: 'encounter-456' })
            );
            const updateData = { name: 'Updated Wall' };

            // Act
            await act(async () => {
                await result.current.updateWall(2, updateData);
            });

            // Assert
            expect(mockUpdateWall).toHaveBeenCalledTimes(1);
            expect(mockUpdateWall).toHaveBeenCalledWith({ stageId: 'stage-123', index: 2, data: updateData });
        });

        it('deleteWall should call stageApi with stageId and index', async () => {
            // Arrange
            const { result } = renderHook(() =>
                useEncounterEditor({ encounterId: 'encounter-456' })
            );

            // Act
            await act(async () => {
                await result.current.deleteWall(3);
            });

            // Assert
            expect(mockDeleteWall).toHaveBeenCalledTimes(1);
            expect(mockDeleteWall).toHaveBeenCalledWith({ stageId: 'stage-123', index: 3 });
        });
    });

    describe('structural element mutations - regions (routed to Stage API via stageId)', () => {
        it('addRegion should call stageApi with stageId', async () => {
            // Arrange
            const { result } = renderHook(() =>
                useEncounterEditor({ encounterId: 'encounter-456' })
            );
            const regionData = {
                name: 'Test Region',
                type: RegionType.Terrain,
                vertices: [{ x: 0, y: 0 }, { x: 100, y: 0 }, { x: 100, y: 100 }],
            };

            // Act
            await act(async () => {
                await result.current.addRegion(regionData);
            });

            // Assert
            expect(mockAddRegion).toHaveBeenCalledTimes(1);
            expect(mockAddRegion).toHaveBeenCalledWith({ stageId: 'stage-123', data: regionData });
        });

        it('updateRegion should call stageApi with stageId and index', async () => {
            // Arrange
            const { result } = renderHook(() =>
                useEncounterEditor({ encounterId: 'encounter-456' })
            );
            const updateData = { name: 'Updated Region' };

            // Act
            await act(async () => {
                await result.current.updateRegion(1, updateData);
            });

            // Assert
            expect(mockUpdateRegion).toHaveBeenCalledTimes(1);
            expect(mockUpdateRegion).toHaveBeenCalledWith({ stageId: 'stage-123', index: 1, data: updateData });
        });

        it('deleteRegion should call stageApi with stageId and index', async () => {
            // Arrange
            const { result } = renderHook(() =>
                useEncounterEditor({ encounterId: 'encounter-456' })
            );

            // Act
            await act(async () => {
                await result.current.deleteRegion(5);
            });

            // Assert
            expect(mockDeleteRegion).toHaveBeenCalledTimes(1);
            expect(mockDeleteRegion).toHaveBeenCalledWith({ stageId: 'stage-123', index: 5 });
        });
    });

    describe('structural element mutations - lights (routed to Stage API via stageId)', () => {
        it('addLight should call stageApi with stageId', async () => {
            // Arrange
            const { result } = renderHook(() =>
                useEncounterEditor({ encounterId: 'encounter-456' })
            );
            const lightData = {
                name: 'Torch',
                type: LightSourceType.Artificial,
                position: { x: 100, y: 200 },
                range: 30,
                isOn: true,
            };

            // Act
            await act(async () => {
                await result.current.addLight(lightData);
            });

            // Assert
            expect(mockAddLight).toHaveBeenCalledTimes(1);
            expect(mockAddLight).toHaveBeenCalledWith({ stageId: 'stage-123', data: lightData });
        });

        it('updateLight should call stageApi with stageId and index', async () => {
            // Arrange
            const { result } = renderHook(() =>
                useEncounterEditor({ encounterId: 'encounter-456' })
            );
            const updateData = { range: 50, color: '#ffcc00' };

            // Act
            await act(async () => {
                await result.current.updateLight(0, updateData);
            });

            // Assert
            expect(mockUpdateLight).toHaveBeenCalledTimes(1);
            expect(mockUpdateLight).toHaveBeenCalledWith({ stageId: 'stage-123', index: 0, data: updateData });
        });

        it('deleteLight should call stageApi with stageId and index', async () => {
            // Arrange
            const { result } = renderHook(() =>
                useEncounterEditor({ encounterId: 'encounter-456' })
            );

            // Act
            await act(async () => {
                await result.current.deleteLight(4);
            });

            // Assert
            expect(mockDeleteLight).toHaveBeenCalledTimes(1);
            expect(mockDeleteLight).toHaveBeenCalledWith({ stageId: 'stage-123', index: 4 });
        });
    });

    describe('structural element mutations - sounds (routed to Stage API via stageId)', () => {
        it('addSound should call stageApi with stageId', async () => {
            // Arrange
            const { result } = renderHook(() =>
                useEncounterEditor({ encounterId: 'encounter-456' })
            );
            const soundData = {
                name: 'Waterfall',
                mediaId: 'media-123',
                position: { x: 50, y: 50 },
                radius: 100,
            };

            // Act
            await act(async () => {
                await result.current.addSound(soundData);
            });

            // Assert
            expect(mockAddSound).toHaveBeenCalledTimes(1);
            expect(mockAddSound).toHaveBeenCalledWith({ stageId: 'stage-123', data: soundData });
        });

        it('updateSound should call stageApi with stageId and index', async () => {
            // Arrange
            const { result } = renderHook(() =>
                useEncounterEditor({ encounterId: 'encounter-456' })
            );
            const updateData = { volume: 80, loop: true };

            // Act
            await act(async () => {
                await result.current.updateSound(2, updateData);
            });

            // Assert
            expect(mockUpdateSound).toHaveBeenCalledTimes(1);
            expect(mockUpdateSound).toHaveBeenCalledWith({ stageId: 'stage-123', index: 2, data: updateData });
        });

        it('deleteSound should call stageApi with stageId and index', async () => {
            // Arrange
            const { result } = renderHook(() =>
                useEncounterEditor({ encounterId: 'encounter-456' })
            );

            // Act
            await act(async () => {
                await result.current.deleteSound(1);
            });

            // Assert
            expect(mockDeleteSound).toHaveBeenCalledTimes(1);
            expect(mockDeleteSound).toHaveBeenCalledWith({ stageId: 'stage-123', index: 1 });
        });
    });

    describe('stage settings mutations (routed to Stage API via stageId)', () => {
        it('updateStageSettings should call stageApi with stageId', async () => {
            // Arrange
            const { result } = renderHook(() =>
                useEncounterEditor({ encounterId: 'encounter-456' })
            );
            const settingsData = {
                zoomLevel: 1.5,
                ambientLight: 3,
            };

            // Act
            await act(async () => {
                await result.current.updateStageSettings(settingsData);
            });

            // Assert
            expect(mockUpdateStage).toHaveBeenCalledTimes(1);
            expect(mockUpdateStage).toHaveBeenCalledWith({
                id: 'stage-123',
                data: { settings: settingsData },
            });
        });

        it('updateStageGrid should call stageApi with stageId', async () => {
            // Arrange
            const { result } = renderHook(() =>
                useEncounterEditor({ encounterId: 'encounter-456' })
            );
            const gridData = {
                type: GridType.HexV,
                cellSize: { width: 60, height: 60 },
            };

            // Act
            await act(async () => {
                await result.current.updateStageGrid(gridData);
            });

            // Assert
            expect(mockUpdateStage).toHaveBeenCalledTimes(1);
            expect(mockUpdateStage).toHaveBeenCalledWith({
                id: 'stage-123',
                data: { grid: gridData },
            });
        });
    });

    describe('game element mutations (routed to Encounter API via encounterId)', () => {
        it('addAsset should call encounterApi with encounterId', async () => {
            // Arrange
            const { result } = renderHook(() =>
                useEncounterEditor({ encounterId: 'encounter-456' })
            );
            const assetParams = {
                libraryAssetId: 'asset-789',
                position: { x: 100, y: 200 },
                size: { width: 50, height: 50 },
                rotation: 45,
            };

            // Act
            await act(async () => {
                await result.current.addAsset(assetParams);
            });

            // Assert
            expect(mockAddAsset).toHaveBeenCalledTimes(1);
            expect(mockAddAsset).toHaveBeenCalledWith({
                encounterId: 'encounter-456',
                ...assetParams,
            });
        });

        it('updateAsset should call encounterApi with encounterId', async () => {
            // Arrange
            const { result } = renderHook(() =>
                useEncounterEditor({ encounterId: 'encounter-456' })
            );
            const updateParams = {
                assetNumber: 3,
                position: { x: 150, y: 250 },
                rotation: 90,
                visible: true,
            };

            // Act
            await act(async () => {
                await result.current.updateAsset(updateParams);
            });

            // Assert
            expect(mockUpdateAsset).toHaveBeenCalledTimes(1);
            expect(mockUpdateAsset).toHaveBeenCalledWith({
                encounterId: 'encounter-456',
                ...updateParams,
            });
        });

        it('removeAsset should call encounterApi with encounterId', async () => {
            // Arrange
            const { result } = renderHook(() =>
                useEncounterEditor({ encounterId: 'encounter-456' })
            );

            // Act
            await act(async () => {
                await result.current.removeAsset(5);
            });

            // Assert
            expect(mockRemoveAsset).toHaveBeenCalledTimes(1);
            expect(mockRemoveAsset).toHaveBeenCalledWith({
                encounterId: 'encounter-456',
                assetNumber: 5,
            });
        });

        it('bulkAddAssets should call encounterApi with encounterId', async () => {
            // Arrange
            const { result } = renderHook(() =>
                useEncounterEditor({ encounterId: 'encounter-456' })
            );
            const assets = [
                { assetId: 'asset-1', position: { x: 0, y: 0 }, size: { width: 50, height: 50 } },
                { assetId: 'asset-2', position: { x: 100, y: 100 }, size: { width: 50, height: 50 } },
            ];

            // Act
            await act(async () => {
                await result.current.bulkAddAssets(assets);
            });

            // Assert
            expect(mockBulkAddAssets).toHaveBeenCalledTimes(1);
            expect(mockBulkAddAssets).toHaveBeenCalledWith({
                encounterId: 'encounter-456',
                assets,
            });
        });

        it('bulkUpdateAssets should call encounterApi with encounterId', async () => {
            // Arrange
            const { result } = renderHook(() =>
                useEncounterEditor({ encounterId: 'encounter-456' })
            );
            const updates = [
                { index: 0, position: { x: 10, y: 10 } },
                { index: 1, rotation: 180 },
            ];

            // Act
            await act(async () => {
                await result.current.bulkUpdateAssets(updates);
            });

            // Assert
            expect(mockBulkUpdateAssets).toHaveBeenCalledTimes(1);
            expect(mockBulkUpdateAssets).toHaveBeenCalledWith({
                encounterId: 'encounter-456',
                updates,
            });
        });

        it('bulkDeleteAssets should call encounterApi with encounterId', async () => {
            // Arrange
            const { result } = renderHook(() =>
                useEncounterEditor({ encounterId: 'encounter-456' })
            );
            const assetIndices = [1, 3, 5];

            // Act
            await act(async () => {
                await result.current.bulkDeleteAssets(assetIndices);
            });

            // Assert
            expect(mockBulkDeleteAssets).toHaveBeenCalledTimes(1);
            expect(mockBulkDeleteAssets).toHaveBeenCalledWith({
                encounterId: 'encounter-456',
                assetIndices,
            });
        });
    });

    describe('encounter metadata mutations', () => {
        it('updateEncounter should call patchEncounter with encounterId', async () => {
            // Arrange
            const { result } = renderHook(() =>
                useEncounterEditor({ encounterId: 'encounter-456' })
            );
            const updateData = { name: 'New Encounter Name', description: 'Updated description' };

            // Act
            await act(async () => {
                await result.current.updateEncounter(updateData);
            });

            // Assert
            expect(mockPatchEncounter).toHaveBeenCalledTimes(1);
            expect(mockPatchEncounter).toHaveBeenCalledWith({
                id: 'encounter-456',
                request: updateData,
            });
        });
    });

    describe('error handling', () => {
        it('addWall should throw when stageId is not available', async () => {
            // Arrange - no encounter data loaded
            mockUseGetEncounterQuery.mockReturnValue({
                data: undefined,
                isLoading: false,
                isError: false,
                error: null,
                refetch: mockRefetch,
            });

            const { result } = renderHook(() =>
                useEncounterEditor({ encounterId: 'encounter-456' })
            );

            // Act & Assert
            await expect(
                act(async () => {
                    await result.current.addWall({ name: 'Test' });
                })
            ).rejects.toThrow('Stage not loaded');
        });

        it('addRegion should throw when stageId is not available', async () => {
            // Arrange
            mockUseGetEncounterQuery.mockReturnValue({
                data: undefined,
                isLoading: false,
                isError: false,
                error: null,
                refetch: mockRefetch,
            });

            const { result } = renderHook(() =>
                useEncounterEditor({ encounterId: 'encounter-456' })
            );

            // Act & Assert
            await expect(
                act(async () => {
                    await result.current.addRegion({
                        type: RegionType.Terrain,
                        vertices: [],
                    });
                })
            ).rejects.toThrow('Stage not loaded');
        });

        it('addLight should throw when stageId is not available', async () => {
            // Arrange
            mockUseGetEncounterQuery.mockReturnValue({
                data: undefined,
                isLoading: false,
                isError: false,
                error: null,
                refetch: mockRefetch,
            });

            const { result } = renderHook(() =>
                useEncounterEditor({ encounterId: 'encounter-456' })
            );

            // Act & Assert
            await expect(
                act(async () => {
                    await result.current.addLight({
                        type: LightSourceType.Artificial,
                        position: { x: 0, y: 0 },
                        range: 10,
                    });
                })
            ).rejects.toThrow('Stage not loaded');
        });

        it('addSound should throw when stageId is not available', async () => {
            // Arrange
            mockUseGetEncounterQuery.mockReturnValue({
                data: undefined,
                isLoading: false,
                isError: false,
                error: null,
                refetch: mockRefetch,
            });

            const { result } = renderHook(() =>
                useEncounterEditor({ encounterId: 'encounter-456' })
            );

            // Act & Assert
            await expect(
                act(async () => {
                    await result.current.addSound({ mediaId: 'media-1' });
                })
            ).rejects.toThrow('Stage not loaded');
        });

        it('updateStageSettings should throw when stageId is not available', async () => {
            // Arrange
            mockUseGetEncounterQuery.mockReturnValue({
                data: undefined,
                isLoading: false,
                isError: false,
                error: null,
                refetch: mockRefetch,
            });

            const { result } = renderHook(() =>
                useEncounterEditor({ encounterId: 'encounter-456' })
            );

            // Act & Assert
            await expect(
                act(async () => {
                    await result.current.updateStageSettings({ zoomLevel: 2 });
                })
            ).rejects.toThrow('Stage not loaded');
        });
    });

    describe('refetch functionality', () => {
        it('should expose refetch function', () => {
            // Arrange - hook uses the default mocks from beforeEach
            const { result } = renderHook(() =>
                useEncounterEditor({ encounterId: 'encounter-456' })
            );

            // Act
            result.current.refetch();

            // Assert
            expect(mockRefetch).toHaveBeenCalledTimes(1);
        });
    });

    describe('memoization and stability', () => {
        it('should return stable references for mutation functions', () => {
            // Arrange - hook uses the default mocks from beforeEach
            const { result, rerender } = renderHook(() =>
                useEncounterEditor({ encounterId: 'encounter-456' })
            );

            const initialAddWall = result.current.addWall;
            const initialUpdateWall = result.current.updateWall;
            const initialAddAsset = result.current.addAsset;

            // Act - trigger rerender
            rerender();

            // Assert - functions should be stable (memoized)
            expect(result.current.addWall).toBe(initialAddWall);
            expect(result.current.updateWall).toBe(initialUpdateWall);
            expect(result.current.addAsset).toBe(initialAddAsset);
        });

        it('should update stageId when encounter data loads', () => {
            // Arrange - start with no data
            mockUseGetEncounterQuery.mockReturnValue({
                data: undefined,
                isLoading: true,
                isError: false,
                error: null,
                refetch: mockRefetch,
            });

            const { result, rerender } = renderHook(() =>
                useEncounterEditor({ encounterId: 'encounter-456' })
            );

            // Verify initial state
            expect(result.current.stageId).toBeUndefined();

            // Act - update with loaded data
            mockUseGetEncounterQuery.mockReturnValue({
                data: createMockEncounter(),
                isLoading: false,
                isError: false,
                error: null,
                refetch: mockRefetch,
            });
            rerender();

            // Assert - stageId should now be available
            expect(result.current.stageId).toBe('stage-123');
        });
    });
});
