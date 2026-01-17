import { act, renderHook } from '@testing-library/react';
import { beforeEach, describe, expect, it, vi } from 'vitest';
import type { CommitResult } from '@/hooks/useRegionTransaction';
import { useRegionTransaction } from '@/hooks/useRegionTransaction';
import type { Encounter, EncounterRegion, Point } from '@/types/domain';
import type { LocalAction } from '@/types/regionUndoActions';
import { GridType, Weather } from '@/types/domain';
import type { Stage, StageRegion } from '@/types/stage';
import { AmbientLight } from '@/types/stage';
import type { GridConfig } from '@/utils/gridCalculator';
import { useMergeRegions } from '../useMergeRegions';
import { useRegionHandlers } from '../useRegionHandlers';

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
    ambientSoundVolume: 1,
    ambientSoundLoop: false,
    ambientSoundIsPlaying: false,
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

const createMockEncounter = (regions: StageRegion[] = []): Encounter => ({
  id: 'test-encounter-123',
  ownerId: 'owner-1',
  adventure: null,
  name: 'Test Encounter',
  description: 'Test Description',
  isPublished: false,
  isPublic: false,
  stage: createMockStage({ regions }),
  actors: [],
  objects: [],
  effects: [],
});

describe('Region Workflows - Integration Tests', () => {
  let mockEncounter: Encounter;
  let mockSetEncounter: ReturnType<typeof vi.fn>;
  let mockSetPlacedRegions: ReturnType<typeof vi.fn>;
  let mockSetSelectedRegionIndex: ReturnType<typeof vi.fn>;
  let mockSetEditingRegionIndex: ReturnType<typeof vi.fn>;
  let mockSetIsEditingRegionVertices: ReturnType<typeof vi.fn>;
  let mockSetOriginalRegionVertices: ReturnType<typeof vi.fn>;
  let mockSetDrawingRegionIndex: ReturnType<typeof vi.fn>;
  let mockSetErrorMessage: ReturnType<typeof vi.fn>;
  let mockRecordAction: ReturnType<typeof vi.fn>;
  let mockRefetch: ReturnType<typeof vi.fn>;
  let mockAddEncounterRegion: ReturnType<typeof vi.fn>;
  let mockUpdateEncounterRegion: ReturnType<typeof vi.fn>;
  let mockRemoveEncounterRegion: ReturnType<typeof vi.fn>;
  let gridConfig: GridConfig;

  const encounterId = 'test-encounter-123';

  beforeEach(() => {
    vi.clearAllMocks();

    mockEncounter = createMockEncounter();

    gridConfig = {
      type: 1,
      cellSize: { width: 50, height: 50 },
      offset: { left: 0, top: 0 },
      snap: true,
      scale: 1,
    };

    mockSetEncounter = vi.fn();
    mockSetPlacedRegions = vi.fn();
    mockSetSelectedRegionIndex = vi.fn();
    mockSetEditingRegionIndex = vi.fn();
    mockSetIsEditingRegionVertices = vi.fn();
    mockSetOriginalRegionVertices = vi.fn();
    mockSetDrawingRegionIndex = vi.fn();
    mockSetErrorMessage = vi.fn();
    mockRecordAction = vi.fn();
    mockRefetch = vi.fn().mockResolvedValue({ data: mockEncounter });
    mockAddEncounterRegion = vi.fn().mockImplementation(() => ({
      unwrap: vi.fn().mockResolvedValue({ index: 1 }),
    }));
    mockUpdateEncounterRegion = vi.fn().mockImplementation(() => ({
      unwrap: vi.fn().mockResolvedValue({}),
    }));
    mockRemoveEncounterRegion = vi.fn().mockImplementation(() => ({
      unwrap: vi.fn().mockResolvedValue({}),
    }));
  });

  describe('1. Region Placement Workflow', () => {
    it('should complete placement workflow: start → add vertices → commit → verify encounter state', async () => {
      const { result: transactionResult } = renderHook(() => useRegionTransaction());

      act(() => {
        transactionResult.current.startTransaction('placement', undefined, {
          name: 'Danger Zone',
          type: 'Elevation',
          value: 10,
          color: '#FF0000',
        });
      });

      expect(transactionResult.current.transaction.isActive).toBe(true);
      expect(transactionResult.current.transaction.type).toBe('placement');

      act(() => {
        transactionResult.current.addVertex({ x: 0, y: 0 });
        transactionResult.current.addVertex({ x: 100, y: 0 });
        transactionResult.current.addVertex({ x: 50, y: 100 });
      });

      expect(transactionResult.current.transaction.segment?.vertices).toHaveLength(3);

      let commitResult!: CommitResult;
      await act(async () => {
        commitResult = await transactionResult.current.commitTransaction(
          encounterId,
          {
            addRegion: mockAddEncounterRegion,
            updateRegion: mockUpdateEncounterRegion,
          },
          mockEncounter,
        );
      });

      expect(commitResult.success).toBe(true);
      expect(commitResult.action).toBe('create');
      expect(commitResult.regionIndex).toBe(1);
      expect(mockAddEncounterRegion).toHaveBeenCalledWith(
        expect.objectContaining({
          encounterId,
          name: 'Danger Zone',
          type: 'Elevation',
          value: 10,
          color: '#FF0000',
        }),
      );

      expect(transactionResult.current.transaction.isActive).toBe(false);
      expect(transactionResult.current.transaction.segment).toBeNull();
    });

    it('should handle placement workflow: start → add vertices → cancel → verify rollback', async () => {
      const { result: transactionResult } = renderHook(() => useRegionTransaction());

      act(() => {
        transactionResult.current.startTransaction('placement', undefined, {
          name: 'Test Region',
          type: 'Difficult',
        });
        transactionResult.current.addVertex({ x: 0, y: 0 });
        transactionResult.current.addVertex({ x: 100, y: 0 });
        transactionResult.current.addVertex({ x: 50, y: 100 });
      });

      expect(transactionResult.current.transaction.isActive).toBe(true);

      act(() => {
        transactionResult.current.rollbackTransaction();
      });

      expect(transactionResult.current.transaction.isActive).toBe(false);
      expect(transactionResult.current.transaction.segment).toBeNull();
      expect(transactionResult.current.transaction.type).toBeNull();
      expect(mockAddEncounterRegion).not.toHaveBeenCalled();
    });

    it('should handle placement workflow: start → add vertices → undo → redo → commit', async () => {
      const { result: transactionResult } = renderHook(() => useRegionTransaction());
      const mockVertices: Point[] = [];

      const createVertexAction = (vertex: Point): LocalAction => ({
        type: 'PLACE_VERTEX',
        description: `Place vertex at (${vertex.x}, ${vertex.y})`,
        undo: () => {
          mockVertices.pop();
        },
        redo: () => {
          mockVertices.push(vertex);
        },
      });

      act(() => {
        transactionResult.current.startTransaction('placement');
      });

      act(() => {
        const v1 = { x: 0, y: 0 };
        mockVertices.push(v1);
        transactionResult.current.addVertex(v1);
        transactionResult.current.pushLocalAction(createVertexAction(v1));
      });

      act(() => {
        const v2 = { x: 100, y: 0 };
        mockVertices.push(v2);
        transactionResult.current.addVertex(v2);
        transactionResult.current.pushLocalAction(createVertexAction(v2));
      });

      act(() => {
        const v3 = { x: 50, y: 100 };
        mockVertices.push(v3);
        transactionResult.current.addVertex(v3);
        transactionResult.current.pushLocalAction(createVertexAction(v3));
      });

      expect(mockVertices).toHaveLength(3);
      expect(transactionResult.current.canUndoLocal()).toBe(true);

      act(() => {
        transactionResult.current.undoLocal();
      });

      expect(mockVertices).toHaveLength(2);
      expect(transactionResult.current.canRedoLocal()).toBe(true);

      act(() => {
        transactionResult.current.redoLocal();
      });

      expect(mockVertices).toHaveLength(3);

      await act(async () => {
        const result = await transactionResult.current.commitTransaction(encounterId, {
          addRegion: mockAddEncounterRegion,
          updateRegion: mockUpdateEncounterRegion,
        });
        expect(result.success).toBe(true);
      });
    });

    it('should handle placement with insufficient vertices (< 3) and fail validation', async () => {
      const { result: transactionResult } = renderHook(() => useRegionTransaction());

      act(() => {
        transactionResult.current.startTransaction('placement');
        transactionResult.current.addVertex({ x: 0, y: 0 });
        transactionResult.current.addVertex({ x: 100, y: 0 });
      });

      await act(async () => {
        const result = await transactionResult.current.commitTransaction(encounterId, {
          addRegion: mockAddEncounterRegion,
          updateRegion: mockUpdateEncounterRegion,
        });

        expect(result.success).toBe(false);
        expect(result.error).toBe('Region requires minimum 3 vertices');
      });

      expect(mockAddEncounterRegion).not.toHaveBeenCalled();
    });
  });

  describe('2. Region Editing Workflow', () => {
    it('should complete editing workflow: select → edit vertices → commit → verify updated', async () => {
      const existingRegion: EncounterRegion = {
        encounterId,
        index: 5,
        name: 'Forest Area',
        vertices: [
          { x: 0, y: 0 },
          { x: 100, y: 0 },
          { x: 100, y: 100 },
        ],
        type: 'Difficult',
        value: 2,
        color: '#00FF00',
      };

      mockEncounter.stage.regions = [existingRegion];

      const { result: transactionResult } = renderHook(() => useRegionTransaction());

      act(() => {
        transactionResult.current.startTransaction('editing', existingRegion);
      });

      expect(transactionResult.current.transaction.type).toBe('editing');
      expect(transactionResult.current.transaction.originalRegion).toEqual(existingRegion);

      act(() => {
        transactionResult.current.updateVertices([
          { x: 0, y: 0 },
          { x: 150, y: 0 },
          { x: 150, y: 150 },
        ]);
      });

      await act(async () => {
        const result = await transactionResult.current.commitTransaction(encounterId, {
          addRegion: mockAddEncounterRegion,
          updateRegion: mockUpdateEncounterRegion,
        });

        expect(result.success).toBe(true);
        expect(result.action).toBe('edit');
        expect(result.regionIndex).toBe(5);
      });

      expect(mockUpdateEncounterRegion).toHaveBeenCalledWith(
        expect.objectContaining({
          encounterId,
          regionIndex: 5,
          vertices: expect.arrayContaining([
            expect.objectContaining({ x: 0, y: 0 }),
            expect.objectContaining({ x: 150, y: 0 }),
            expect.objectContaining({ x: 150, y: 150 }),
          ]),
        }),
      );
    });

    it('should handle editing workflow: select → edit → cancel → verify original restored', async () => {
      const existingRegion: EncounterRegion = {
        encounterId,
        index: 3,
        name: 'Mountain',
        vertices: [
          { x: 0, y: 0 },
          { x: 50, y: 0 },
          { x: 25, y: 50 },
        ],
        type: 'Elevation',
        value: 15,
      };

      const { result: transactionResult } = renderHook(() => useRegionTransaction());

      act(() => {
        transactionResult.current.startTransaction('editing', existingRegion);
      });

      act(() => {
        transactionResult.current.updateVertices([
          { x: 0, y: 0 },
          { x: 100, y: 0 },
          { x: 50, y: 100 },
        ]);
      });

      expect(transactionResult.current.transaction.segment?.vertices).toHaveLength(3);

      act(() => {
        transactionResult.current.rollbackTransaction();
      });

      expect(transactionResult.current.transaction.isActive).toBe(false);
      expect(transactionResult.current.transaction.segment).toBeNull();
      expect(mockUpdateEncounterRegion).not.toHaveBeenCalled();
    });

    it('should preserve original vertices in EditRegionCommand when merge occurs during edit', async () => {
      const originalRegion2Vertices = [
        { x: 200, y: 0 },
        { x: 300, y: 0 },
        { x: 300, y: 100 },
        { x: 200, y: 100 },
      ];
      const existingRegion2: EncounterRegion = {
        index: 1,
        encounterId,
        name: 'Region 2',
        vertices: originalRegion2Vertices,
        type: 'difficult-terrain',
        value: 2,
      };

      const { result: transactionResult } = renderHook(() => useRegionTransaction());

      act(() => {
        transactionResult.current.startTransaction('editing', existingRegion2);
      });

      const modifiedVertices = [
        { x: 50, y: 0 },
        { x: 150, y: 0 },
        { x: 150, y: 100 },
        { x: 50, y: 100 },
      ];

      act(() => {
        transactionResult.current.updateVertices(modifiedVertices);
      });

      expect(transactionResult.current.transaction.originalRegion).toBeDefined();
      expect(transactionResult.current.transaction.originalRegion?.vertices).toEqual(originalRegion2Vertices);

      expect(transactionResult.current.transaction.segment?.vertices).toEqual(modifiedVertices);
    });

    it('should edit region properties (name, type, value, label) and commit', async () => {
      const existingRegion: EncounterRegion = {
        encounterId,
        index: 7,
        name: 'Old Name',
        vertices: [
          { x: 0, y: 0 },
          { x: 100, y: 0 },
          { x: 50, y: 100 },
        ],
        type: 'Elevation',
        value: 5,
      };

      const { result: transactionResult } = renderHook(() => useRegionTransaction());

      act(() => {
        transactionResult.current.startTransaction('editing', existingRegion);
      });

      act(() => {
        transactionResult.current.updateSegmentProperties({
          name: 'Updated Name',
          type: 'Difficult',
          value: 10,
          label: 'Dense Forest',
          color: '#008800',
        });
      });

      await act(async () => {
        const result = await transactionResult.current.commitTransaction(encounterId, {
          addRegion: mockAddEncounterRegion,
          updateRegion: mockUpdateEncounterRegion,
        });

        expect(result.success).toBe(true);
      });

      expect(mockUpdateEncounterRegion).toHaveBeenCalledWith(
        expect.objectContaining({
          encounterId,
          regionIndex: 7,
          name: 'Updated Name',
          type: 'Difficult',
          value: 10,
          label: 'Dense Forest',
          color: '#008800',
        }),
      );
    });
  });

  describe('3. Region Merge Workflow', () => {
    it('should detect and merge adjacent regions with same properties', async () => {
      const region1: EncounterRegion = {
        encounterId,
        index: 1,
        name: 'Region 1',
        vertices: [
          { x: 0, y: 0 },
          { x: 100, y: 0 },
          { x: 100, y: 100 },
          { x: 0, y: 100 },
        ],
        type: 'Elevation',
        value: 10,
      };

      mockEncounter.stage.regions = [region1];

      const { result: transactionResult } = renderHook(() => useRegionTransaction());

      act(() => {
        transactionResult.current.startTransaction('placement', undefined, {
          name: 'Region 2',
          type: 'Elevation',
          value: 10,
        });
        transactionResult.current.updateVertices([
          { x: 100, y: 0 },
          { x: 200, y: 0 },
          { x: 200, y: 100 },
          { x: 100, y: 100 },
        ]);
      });

      await act(async () => {
        const result = await transactionResult.current.commitTransaction(
          encounterId,
          {
            addRegion: mockAddEncounterRegion,
            updateRegion: mockUpdateEncounterRegion,
          },
          mockEncounter,
        );

        expect(result.action).toBe('merge');
        expect(result.targetRegionIndex).toBe(1);
        expect(result.mergedVertices).toBeDefined();
        expect(result.mergedVertices?.length).toBeGreaterThan(0);
      });
    });

    it('should NOT merge regions with different properties (type mismatch)', async () => {
      const region1: EncounterRegion = {
        encounterId,
        index: 1,
        name: 'Region 1',
        vertices: [
          { x: 0, y: 0 },
          { x: 100, y: 0 },
          { x: 100, y: 100 },
          { x: 0, y: 100 },
        ],
        type: 'Elevation',
        value: 10,
      };

      mockEncounter.stage.regions = [region1];

      const { result: transactionResult } = renderHook(() => useRegionTransaction());

      act(() => {
        transactionResult.current.startTransaction('placement', undefined, {
          name: 'Region 2',
          type: 'Difficult',
          value: 10,
        });
        transactionResult.current.updateVertices([
          { x: 100, y: 0 },
          { x: 200, y: 0 },
          { x: 200, y: 100 },
          { x: 100, y: 100 },
        ]);
      });

      await act(async () => {
        const result = await transactionResult.current.commitTransaction(
          encounterId,
          {
            addRegion: mockAddEncounterRegion,
            updateRegion: mockUpdateEncounterRegion,
          },
          mockEncounter,
        );

        expect(result.action).toBe('create');
        expect(result.action).not.toBe('merge');
      });
    });

    it('should NOT merge regions with different value properties', async () => {
      const region1: EncounterRegion = {
        encounterId,
        index: 1,
        name: 'Region 1',
        vertices: [
          { x: 0, y: 0 },
          { x: 100, y: 0 },
          { x: 100, y: 100 },
          { x: 0, y: 100 },
        ],
        type: 'Elevation',
        value: 10,
      };

      mockEncounter.stage.regions = [region1];

      const { result: transactionResult } = renderHook(() => useRegionTransaction());

      act(() => {
        transactionResult.current.startTransaction('placement', undefined, {
          name: 'Region 2',
          type: 'Elevation',
          value: 20,
        });
        transactionResult.current.updateVertices([
          { x: 100, y: 0 },
          { x: 200, y: 0 },
          { x: 200, y: 100 },
          { x: 100, y: 100 },
        ]);
      });

      await act(async () => {
        const result = await transactionResult.current.commitTransaction(
          encounterId,
          {
            addRegion: mockAddEncounterRegion,
            updateRegion: mockUpdateEncounterRegion,
          },
          mockEncounter,
        );

        expect(result.action).toBe('create');
        expect(result.action).not.toBe('merge');
      });
    });

    it('should merge with multiple regions and identify all regions to delete', async () => {
      const region1: EncounterRegion = {
        encounterId,
        index: 3,
        name: 'Region 1',
        vertices: [
          { x: 0, y: 0 },
          { x: 100, y: 0 },
          { x: 100, y: 100 },
          { x: 0, y: 100 },
        ],
        type: 'Elevation',
        value: 5,
      };

      const region2: EncounterRegion = {
        encounterId,
        index: 5,
        name: 'Region 2',
        vertices: [
          { x: 100, y: 0 },
          { x: 200, y: 0 },
          { x: 200, y: 100 },
          { x: 100, y: 100 },
        ],
        type: 'Elevation',
        value: 5,
      };

      mockEncounter.stage.regions = [region1, region2];

      const { result: transactionResult } = renderHook(() => useRegionTransaction());

      act(() => {
        transactionResult.current.startTransaction('placement', undefined, {
          name: 'Region 3',
          type: 'Elevation',
          value: 5,
        });
        transactionResult.current.updateVertices([
          { x: 50, y: 50 },
          { x: 150, y: 50 },
          { x: 100, y: 150 },
        ]);
      });

      await act(async () => {
        const result = await transactionResult.current.commitTransaction(
          encounterId,
          {
            addRegion: mockAddEncounterRegion,
            updateRegion: mockUpdateEncounterRegion,
          },
          mockEncounter,
        );

        expect(result.action).toBe('merge');
        expect(result.targetRegionIndex).toBe(3);
        expect(result.regionsToDelete).toContain(5);
      });
    });

    it('should execute merge operation using useMergeRegions hook', async () => {
      const targetRegion: EncounterRegion = {
        encounterId,
        index: 1,
        name: 'Target Region',
        vertices: [
          { x: 0, y: 0 },
          { x: 100, y: 0 },
          { x: 100, y: 100 },
          { x: 0, y: 100 },
        ],
        type: 'Elevation',
        value: 10,
      };

      const regionToDelete: EncounterRegion = {
        encounterId,
        index: 2,
        name: 'Region to Delete',
        vertices: [
          { x: 100, y: 0 },
          { x: 200, y: 0 },
          { x: 200, y: 100 },
          { x: 100, y: 100 },
        ],
        type: 'Elevation',
        value: 10,
      };

      mockEncounter.stage.regions = [targetRegion, regionToDelete];

      const { result: mergeResult } = renderHook(() =>
        useMergeRegions({
          encounterId,
          encounter: mockEncounter,
          addRegion: mockAddEncounterRegion,
          updateRegion: mockUpdateEncounterRegion,
          deleteRegion: mockRemoveEncounterRegion,
          setEncounter: mockSetEncounter,
          setErrorMessage: mockSetErrorMessage,
          recordAction: mockRecordAction,
          refetch: mockRefetch,
        }),
      );

      const mergedVertices: Point[] = [
        { x: 0, y: 0 },
        { x: 200, y: 0 },
        { x: 200, y: 100 },
        { x: 0, y: 100 },
      ];

      const onSuccess = vi.fn();
      const onError = vi.fn();

      await act(async () => {
        await mergeResult.current.executeMerge({
          targetRegionIndex: 1,
          originalTargetRegion: targetRegion,
          mergedVertices,
          regionsToDelete: [2],
          onSuccess,
          onError,
        });
      });

      expect(mockUpdateEncounterRegion).toHaveBeenCalledWith(
        expect.objectContaining({
          encounterId,
          regionIndex: 1,
          vertices: mergedVertices,
        }),
      );

      expect(mockRemoveEncounterRegion).toHaveBeenCalledWith({
        encounterId,
        regionIndex: 2,
      });

      expect(mockRecordAction).toHaveBeenCalled();
      expect(onSuccess).toHaveBeenCalled();
      expect(onError).not.toHaveBeenCalled();
    });
  });

  describe('4. Region Deletion Workflow', () => {
    it('should call delete API and verify backend interaction', async () => {
      const regionToDelete: EncounterRegion = {
        encounterId,
        index: 5,
        name: 'Region to Delete',
        vertices: [
          { x: 0, y: 0 },
          { x: 100, y: 0 },
          { x: 50, y: 100 },
        ],
        type: 'Elevation',
      };

      mockEncounter.stage.regions = [regionToDelete];

      await act(async () => {
        await mockRemoveEncounterRegion({
          encounterId,
          regionIndex: 5,
        }).unwrap();
      });

      expect(mockRemoveEncounterRegion).toHaveBeenCalledWith({
        encounterId,
        regionIndex: 5,
      });
    });

    it('should not delete region if region not found', async () => {
      mockEncounter.stage.regions = [];

      const transactionHook = renderHook(() => useRegionTransaction());

      const { result: handlersResult } = renderHook(() => {
        const transaction = transactionHook.result.current;
        return useRegionHandlers({
          encounterId,
          encounter: mockEncounter,
          regionTransaction: transaction,
          gridConfig,
          selectedRegionIndex: null,
          editingRegionIndex: null,
          originalRegionVertices: null,
          drawingMode: null,
          drawingRegionIndex: null,
          addRegion: mockAddEncounterRegion,
          updateRegion: mockUpdateEncounterRegion,
          deleteRegion: mockRemoveEncounterRegion,
          setEncounter: mockSetEncounter,
          setPlacedRegions: mockSetPlacedRegions,
          setSelectedRegionIndex: mockSetSelectedRegionIndex,
          setEditingRegionIndex: mockSetEditingRegionIndex,
          setIsEditingRegionVertices: mockSetIsEditingRegionVertices,
          setOriginalRegionVertices: mockSetOriginalRegionVertices,
          setDrawingRegionIndex: mockSetDrawingRegionIndex,
          setRegionPlacementMode: vi.fn(),
          setErrorMessage: mockSetErrorMessage,
          recordAction: mockRecordAction,
          refetch: mockRefetch,
        });
      });

      await act(async () => {
        await handlersResult.current.handleRegionDelete(999);
      });

      expect(mockRemoveEncounterRegion).not.toHaveBeenCalled();
    });
  });

  describe('5. Error Scenarios', () => {
    it('should handle backend API failure during placement', async () => {
      const { result: transactionResult } = renderHook(() => useRegionTransaction());

      const failingAddEncounterRegion = vi.fn().mockImplementation(() => ({
        unwrap: vi.fn().mockRejectedValue(new Error('Network error')),
      }));

      act(() => {
        transactionResult.current.startTransaction('placement', undefined, {
          name: 'Test Region',
          type: 'Elevation',
        });
        transactionResult.current.updateVertices([
          { x: 0, y: 0 },
          { x: 100, y: 0 },
          { x: 50, y: 100 },
        ]);
      });

      await act(async () => {
        const result = await transactionResult.current.commitTransaction(encounterId, {
          addRegion: failingAddEncounterRegion,
          updateRegion: mockUpdateEncounterRegion,
        });

        expect(result.success).toBe(false);
        expect(result.error).toBe('Network error');
      });

      expect(transactionResult.current.transaction.isActive).toBe(true);
      expect(transactionResult.current.transaction.segment).not.toBeNull();
    });

    it('should handle backend API failure during edit', async () => {
      const existingRegion: EncounterRegion = {
        encounterId,
        index: 5,
        name: 'Existing Region',
        vertices: [
          { x: 0, y: 0 },
          { x: 100, y: 0 },
          { x: 50, y: 100 },
        ],
        type: 'Elevation',
      };

      const { result: transactionResult } = renderHook(() => useRegionTransaction());

      const failingUpdateEncounterRegion = vi.fn().mockImplementation(() => ({
        unwrap: vi.fn().mockRejectedValue(new Error('Update failed')),
      }));

      act(() => {
        transactionResult.current.startTransaction('editing', existingRegion);
        transactionResult.current.updateVertices([
          { x: 0, y: 0 },
          { x: 150, y: 0 },
          { x: 75, y: 150 },
        ]);
      });

      await act(async () => {
        const result = await transactionResult.current.commitTransaction(encounterId, {
          addRegion: mockAddEncounterRegion,
          updateRegion: failingUpdateEncounterRegion,
        });

        expect(result.success).toBe(false);
        expect(result.error).toBe('Update failed');
      });
    });

    it('should handle backend API failure during merge', async () => {
      const targetRegion: EncounterRegion = {
        encounterId,
        index: 1,
        name: 'Target',
        vertices: [
          { x: 0, y: 0 },
          { x: 100, y: 0 },
          { x: 50, y: 100 },
        ],
        type: 'Elevation',
      };

      mockEncounter.stage.regions = [targetRegion];

      const failingUpdateEncounterRegion = vi.fn().mockImplementation(() => ({
        unwrap: vi.fn().mockRejectedValue(new Error('Merge failed')),
      }));

      const { result: mergeResult } = renderHook(() =>
        useMergeRegions({
          encounterId,
          encounter: mockEncounter,
          addRegion: mockAddEncounterRegion,
          updateRegion: failingUpdateEncounterRegion,
          deleteRegion: mockRemoveEncounterRegion,
          setEncounter: mockSetEncounter,
          setErrorMessage: mockSetErrorMessage,
          recordAction: mockRecordAction,
          refetch: mockRefetch,
        }),
      );

      const onSuccess = vi.fn();
      const onError = vi.fn();

      await act(async () => {
        await mergeResult.current.executeMerge({
          targetRegionIndex: 1,
          originalTargetRegion: targetRegion,
          mergedVertices: [
            { x: 0, y: 0 },
            { x: 200, y: 0 },
            { x: 100, y: 200 },
          ],
          regionsToDelete: [],
          onSuccess,
          onError,
        });
      });

      expect(mockSetErrorMessage).toHaveBeenCalledWith('Failed to merge regions. Please try again.');
      expect(onError).toHaveBeenCalled();
      expect(onSuccess).not.toHaveBeenCalled();
    });

    it('should reject invalid vertices during placement (less than 3 points)', async () => {
      const { result: transactionResult } = renderHook(() => useRegionTransaction());

      act(() => {
        transactionResult.current.startTransaction('placement');
        transactionResult.current.addVertex({ x: 0, y: 0 });
        transactionResult.current.addVertex({ x: 100, y: 0 });
      });

      await act(async () => {
        const result = await transactionResult.current.commitTransaction(encounterId, {
          addRegion: mockAddEncounterRegion,
          updateRegion: mockUpdateEncounterRegion,
        });

        expect(result.success).toBe(false);
        expect(result.error).toBe('Region requires minimum 3 vertices');
      });

      expect(mockAddEncounterRegion).not.toHaveBeenCalled();
    });

    it('should handle merge when target region not found', async () => {
      mockEncounter.stage.regions = [];

      const { result: mergeResult } = renderHook(() =>
        useMergeRegions({
          encounterId,
          encounter: mockEncounter,
          addRegion: mockAddEncounterRegion,
          updateRegion: mockUpdateEncounterRegion,
          deleteRegion: mockRemoveEncounterRegion,
          setEncounter: mockSetEncounter,
          setErrorMessage: mockSetErrorMessage,
          recordAction: mockRecordAction,
          refetch: mockRefetch,
        }),
      );

      const onSuccess = vi.fn();
      const onError = vi.fn();

      await act(async () => {
        await mergeResult.current.executeMerge({
          targetRegionIndex: 999,
          originalTargetRegion: {
            encounterId,
            index: 999,
            name: 'Ghost',
            vertices: [],
            type: 'Elevation',
          },
          mergedVertices: [
            { x: 0, y: 0 },
            { x: 100, y: 0 },
            { x: 50, y: 100 },
          ],
          regionsToDelete: [],
          onSuccess,
          onError,
        });
      });

      expect(mockSetErrorMessage).toHaveBeenCalledWith('Merge target region not found');
      expect(onError).toHaveBeenCalled();
      expect(onSuccess).not.toHaveBeenCalled();
    });
  });

  describe('6. Complete End-to-End Workflows', () => {
    it('should integrate transaction and merge workflows for placement with merge detection', async () => {
      const existingRegion: EncounterRegion = {
        encounterId,
        index: 1,
        name: 'Existing Region',
        vertices: [
          { x: 0, y: 0 },
          { x: 100, y: 0 },
          { x: 100, y: 100 },
          { x: 0, y: 100 },
        ],
        type: 'Elevation',
        value: 10,
      };

      mockEncounter.stage.regions = [existingRegion];

      const { result: transactionResult } = renderHook(() => useRegionTransaction());
      const { result: mergeResult } = renderHook(() =>
        useMergeRegions({
          encounterId,
          encounter: mockEncounter,
          addRegion: mockAddEncounterRegion,
          updateRegion: mockUpdateEncounterRegion,
          deleteRegion: mockRemoveEncounterRegion,
          setEncounter: mockSetEncounter,
          setErrorMessage: mockSetErrorMessage,
          recordAction: mockRecordAction,
          refetch: mockRefetch,
        }),
      );

      act(() => {
        transactionResult.current.startTransaction('placement', undefined, {
          name: 'Adjacent Region',
          type: 'Elevation',
          value: 10,
        });
        transactionResult.current.updateVertices([
          { x: 100, y: 0 },
          { x: 200, y: 0 },
          { x: 200, y: 100 },
          { x: 100, y: 100 },
        ]);
      });

      let commitResult!: CommitResult;
      await act(async () => {
        commitResult = await transactionResult.current.commitTransaction(
          encounterId,
          {
            addRegion: mockAddEncounterRegion,
            updateRegion: mockUpdateEncounterRegion,
          },
          mockEncounter,
        );
      });

      expect(commitResult.action).toBe('merge');
      expect(commitResult.targetRegionIndex).toBe(1);
      expect(commitResult.mergedVertices).toBeDefined();

      const onSuccess = vi.fn();
      const onError = vi.fn();

      await act(async () => {
        await mergeResult.current.executeMerge({
          targetRegionIndex: commitResult.targetRegionIndex ?? 0,
          originalTargetRegion: existingRegion,
          mergedVertices: commitResult.mergedVertices ?? [],
          regionsToDelete: commitResult.regionsToDelete || [],
          onSuccess,
          onError,
        });
      });

      expect(mockUpdateEncounterRegion).toHaveBeenCalled();
      expect(mockRecordAction).toHaveBeenCalled();
      expect(onSuccess).toHaveBeenCalled();
    });

    it('should integrate transaction workflow for editing with property changes', async () => {
      const existingRegion: EncounterRegion = {
        encounterId,
        index: 7,
        name: 'Original Name',
        vertices: [
          { x: 0, y: 0 },
          { x: 100, y: 0 },
          { x: 50, y: 100 },
        ],
        type: 'Elevation',
        value: 5,
      };

      mockEncounter.stage.regions = [existingRegion];

      const { result: transactionResult } = renderHook(() => useRegionTransaction());

      act(() => {
        transactionResult.current.startTransaction('editing', existingRegion);
        transactionResult.current.updateSegmentProperties({
          name: 'Updated Name',
          type: 'Difficult',
          value: 10,
          label: 'Dense Forest',
          color: '#008800',
        });
        transactionResult.current.updateVertices([
          { x: 0, y: 0 },
          { x: 150, y: 0 },
          { x: 75, y: 150 },
        ]);
      });

      await act(async () => {
        const result = await transactionResult.current.commitTransaction(encounterId, {
          addRegion: mockAddEncounterRegion,
          updateRegion: mockUpdateEncounterRegion,
        });

        expect(result.success).toBe(true);
        expect(result.action).toBe('edit');
        expect(result.regionIndex).toBe(7);
      });

      expect(mockUpdateEncounterRegion).toHaveBeenCalledWith(
        expect.objectContaining({
          encounterId,
          regionIndex: 7,
          name: 'Updated Name',
          type: 'Difficult',
          value: 10,
          label: 'Dense Forest',
          color: '#008800',
        }),
      );
    });
  });
});
