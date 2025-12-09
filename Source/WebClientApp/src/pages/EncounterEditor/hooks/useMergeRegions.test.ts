import { act, renderHook } from '@testing-library/react';
import { beforeEach, describe, expect, it, vi } from 'vitest';
import type { Encounter, EncounterRegion, Point } from '@/types/domain';
import { Light, Weather } from '@/types/domain';
import type { Command } from '@/utils/commands';
import * as commands from '@/utils/commands';
import * as regionCommands from '@/utils/commands/regionCommands';
import * as encounterStateUtils from '@/utils/encounterStateUtils';
import { useMergeRegions } from './useMergeRegions';

vi.mock('@/utils/encounterStateUtils');
vi.mock('@/utils/commands');
vi.mock('@/utils/commands/regionCommands');

const mockUpdateRegionOptimistic = vi.mocked(encounterStateUtils.updateRegionOptimistic);
const mockRemoveRegionOptimistic = vi.mocked(encounterStateUtils.removeRegionOptimistic);
const mockRemoveTempRegions = vi.mocked(encounterStateUtils.removeTempRegions);
const mockCreateBatchCommand = vi.mocked(commands.createBatchCommand);

describe('useMergeRegions', () => {
  let mockAddEncounterRegion: ReturnType<typeof vi.fn>;
  let mockUpdateEncounterRegion: ReturnType<typeof vi.fn>;
  let mockRemoveEncounterRegion: ReturnType<typeof vi.fn>;
  let mockSetEncounter: ReturnType<typeof vi.fn>;
  let mockSetErrorMessage: ReturnType<typeof vi.fn>;
  let mockRecordAction: ReturnType<typeof vi.fn>;
  let mockRefetch: ReturnType<typeof vi.fn>;

  let testEncounter: Encounter;
  let targetRegion: EncounterRegion;
  let regionToDelete: EncounterRegion;

  beforeEach(() => {
    vi.clearAllMocks();

    mockAddEncounterRegion = vi.fn();
    mockUpdateEncounterRegion = vi.fn();
    mockRemoveEncounterRegion = vi.fn();
    mockSetEncounter = vi.fn();
    mockSetErrorMessage = vi.fn();
    mockRecordAction = vi.fn();
    mockRefetch = vi.fn().mockResolvedValue({ data: {} as Encounter });

    targetRegion = {
      encounterId: 'encounter-1',
      index: 1,
      name: 'Target Region',
      vertices: [
        { x: 0, y: 0 },
        { x: 100, y: 0 },
        { x: 50, y: 100 },
      ],
      type: 'Elevation',
      value: 10,
      color: '#FF0000',
    };

    regionToDelete = {
      encounterId: 'encounter-1',
      index: 2,
      name: 'Region to Delete',
      vertices: [
        { x: 50, y: 0 },
        { x: 150, y: 0 },
        { x: 100, y: 100 },
      ],
      type: 'Elevation',
      value: 10,
      color: '#FF0000',
    };

    testEncounter = {
      id: 'encounter-1',
      adventure: null,
      name: 'Test Encounter',
      description: '',
      isPublished: false,
      light: Light.Bright,
      weather: Weather.Clear,
      elevation: 0,
      grid: {
        type: 0,
        cellSize: { width: 50, height: 50 },
        offset: { left: 0, top: 0 },
        snap: true,
      scale: 1,
      },
      stage: { background: null, zoomLevel: 1, panning: { x: 0, y: 0 } },
      assets: [],
      regions: [targetRegion, regionToDelete],
      walls: [],
      lightSources: [],
      soundSources: [],
    };

    mockUpdateRegionOptimistic.mockImplementation((encounter, regionIndex, changes) => ({
      ...encounter,
      regions: encounter.regions.map((r) => (r.index === regionIndex ? { ...r, ...changes } : r)),
    }));

    mockRemoveRegionOptimistic.mockImplementation((encounter, regionIndex) => ({
      ...encounter,
      regions: encounter.regions.filter((r) => r.index !== regionIndex),
    }));

    mockRemoveTempRegions.mockImplementation((encounter) => ({
      ...encounter,
      regions: encounter.regions.filter((r) => r.index !== -1),
    }));

    mockCreateBatchCommand.mockImplementation(({ commands: cmds }) => ({
      description: `Batch (${cmds.length} operations)`,
      execute: vi.fn(),
      undo: vi.fn(),
    }));
  });

  describe('executeMerge - Successful Merges', () => {
    it('should merge with single target region successfully', async () => {
      const { result } = renderHook(() =>
        useMergeRegions({
          encounterId: 'encounter-1',
          encounter: testEncounter,
          addEncounterRegion: mockAddEncounterRegion,
          updateEncounterRegion: mockUpdateEncounterRegion,
          removeEncounterRegion: mockRemoveEncounterRegion,
          setEncounter: mockSetEncounter,
          setErrorMessage: mockSetErrorMessage,
          recordAction: mockRecordAction,
          refetch: mockRefetch,
        }),
      );

      const mergedVertices: Point[] = [
        { x: 0, y: 0 },
        { x: 150, y: 0 },
        { x: 100, y: 100 },
        { x: 50, y: 100 },
      ];

      const onSuccess = vi.fn();
      const onError = vi.fn();

      const mockUnwrap = vi.fn().mockResolvedValue(undefined);
      mockUpdateEncounterRegion.mockReturnValue({ unwrap: mockUnwrap });
      mockRemoveEncounterRegion.mockReturnValue({ unwrap: mockUnwrap });

      const mockEditCommand = {
        execute: vi.fn().mockResolvedValue(undefined),
      };
      const mockDeleteCommand = {
        execute: vi.fn().mockResolvedValue(undefined),
      };

      vi.spyOn(regionCommands, 'EditRegionCommand').mockImplementation(
        () => mockEditCommand as unknown as regionCommands.EditRegionCommand,
      );
      vi.spyOn(regionCommands, 'DeleteRegionCommand').mockImplementation(
        () => mockDeleteCommand as unknown as regionCommands.DeleteRegionCommand,
      );

      await act(async () => {
        await result.current.executeMerge({
          targetRegionIndex: 1,
          originalTargetRegion: targetRegion,
          mergedVertices,
          regionsToDelete: [2],
          onSuccess,
          onError,
        });
      });

      expect(mockEditCommand.execute).toHaveBeenCalledTimes(1);
      expect(mockDeleteCommand.execute).toHaveBeenCalledTimes(1);
      expect(mockRecordAction).toHaveBeenCalledTimes(1);
      expect(mockUpdateRegionOptimistic).toHaveBeenCalledWith(testEncounter, 1, { vertices: mergedVertices });
      expect(mockRemoveRegionOptimistic).toHaveBeenCalledWith(expect.any(Object), 2);
      expect(mockRemoveTempRegions).toHaveBeenCalled();
      expect(mockSetEncounter).toHaveBeenCalled();
      expect(onSuccess).toHaveBeenCalledTimes(1);
      expect(onError).not.toHaveBeenCalled();
    });

    it('should merge with multiple regions to delete', async () => {
      const region3: EncounterRegion = {
        encounterId: 'encounter-1',
        index: 3,
        name: 'Region 3',
        vertices: [
          { x: 100, y: 0 },
          { x: 150, y: 0 },
          { x: 125, y: 50 },
        ],
        type: 'Elevation',
        value: 10,
      };

      const encounterWith3Regions: Encounter = {
        ...testEncounter,
        regions: [targetRegion, regionToDelete, region3],
      };

      const { result } = renderHook(() =>
        useMergeRegions({
          encounterId: 'encounter-1',
          encounter: encounterWith3Regions,
          addEncounterRegion: mockAddEncounterRegion,
          updateEncounterRegion: mockUpdateEncounterRegion,
          removeEncounterRegion: mockRemoveEncounterRegion,
          setEncounter: mockSetEncounter,
          setErrorMessage: mockSetErrorMessage,
          recordAction: mockRecordAction,
          refetch: mockRefetch,
        }),
      );

      const mergedVertices: Point[] = [
        { x: 0, y: 0 },
        { x: 150, y: 0 },
        { x: 125, y: 150 },
      ];

      const onSuccess = vi.fn();
      const onError = vi.fn();

      const mockUnwrap = vi.fn().mockResolvedValue(undefined);
      mockUpdateEncounterRegion.mockReturnValue({ unwrap: mockUnwrap });
      mockRemoveEncounterRegion.mockReturnValue({ unwrap: mockUnwrap });

      const mockEditCommand = {
        execute: vi.fn().mockResolvedValue(undefined),
      };
      const mockDeleteCommand1 = {
        execute: vi.fn().mockResolvedValue(undefined),
      };
      const mockDeleteCommand2 = {
        execute: vi.fn().mockResolvedValue(undefined),
      };

      vi.spyOn(regionCommands, 'EditRegionCommand').mockImplementation(
        () => mockEditCommand as unknown as regionCommands.EditRegionCommand,
      );
      let deleteCallCount = 0;
      vi.spyOn(regionCommands, 'DeleteRegionCommand').mockImplementation(() => {
        deleteCallCount++;
        return (deleteCallCount === 1
          ? mockDeleteCommand1
          : mockDeleteCommand2) as unknown as regionCommands.DeleteRegionCommand;
      });

      await act(async () => {
        await result.current.executeMerge({
          targetRegionIndex: 1,
          originalTargetRegion: targetRegion,
          mergedVertices,
          regionsToDelete: [2, 3],
          onSuccess,
          onError,
        });
      });

      expect(mockEditCommand.execute).toHaveBeenCalledTimes(1);
      expect(mockDeleteCommand1.execute).toHaveBeenCalledTimes(1);
      expect(mockDeleteCommand2.execute).toHaveBeenCalledTimes(1);
      expect(mockRemoveRegionOptimistic).toHaveBeenCalledWith(expect.any(Object), 2);
      expect(mockRemoveRegionOptimistic).toHaveBeenCalledWith(expect.any(Object), 3);
      expect(onSuccess).toHaveBeenCalledTimes(1);
      expect(onError).not.toHaveBeenCalled();
    });

    it('should handle merge with no regions to delete', async () => {
      const { result } = renderHook(() =>
        useMergeRegions({
          encounterId: 'encounter-1',
          encounter: testEncounter,
          addEncounterRegion: mockAddEncounterRegion,
          updateEncounterRegion: mockUpdateEncounterRegion,
          removeEncounterRegion: mockRemoveEncounterRegion,
          setEncounter: mockSetEncounter,
          setErrorMessage: mockSetErrorMessage,
          recordAction: mockRecordAction,
          refetch: mockRefetch,
        }),
      );

      const mergedVertices: Point[] = [
        { x: 0, y: 0 },
        { x: 100, y: 0 },
        { x: 100, y: 100 },
        { x: 0, y: 100 },
      ];

      const onSuccess = vi.fn();
      const onError = vi.fn();

      const mockUnwrap = vi.fn().mockResolvedValue(undefined);
      mockUpdateEncounterRegion.mockReturnValue({ unwrap: mockUnwrap });

      const mockEditCommand = {
        execute: vi.fn().mockResolvedValue(undefined),
      };

      vi.spyOn(regionCommands, 'EditRegionCommand').mockImplementation(
        () => mockEditCommand as unknown as regionCommands.EditRegionCommand,
      );

      await act(async () => {
        await result.current.executeMerge({
          targetRegionIndex: 1,
          originalTargetRegion: targetRegion,
          mergedVertices,
          regionsToDelete: [],
          onSuccess,
          onError,
        });
      });

      expect(mockEditCommand.execute).toHaveBeenCalledTimes(1);
      expect(mockRemoveRegionOptimistic).not.toHaveBeenCalled();
      expect(onSuccess).toHaveBeenCalledTimes(1);
      expect(onError).not.toHaveBeenCalled();
    });
  });

  describe('executeMerge - Error Handling', () => {
    it('should return early when encounterId is undefined', async () => {
      const { result } = renderHook(() =>
        useMergeRegions({
          encounterId: undefined,
          encounter: testEncounter,
          addEncounterRegion: mockAddEncounterRegion,
          updateEncounterRegion: mockUpdateEncounterRegion,
          removeEncounterRegion: mockRemoveEncounterRegion,
          setEncounter: mockSetEncounter,
          setErrorMessage: mockSetErrorMessage,
          recordAction: mockRecordAction,
          refetch: mockRefetch,
        }),
      );

      const onSuccess = vi.fn();
      const onError = vi.fn();

      await act(async () => {
        await result.current.executeMerge({
          targetRegionIndex: 1,
          originalTargetRegion: targetRegion,
          mergedVertices: [{ x: 0, y: 0 }],
          regionsToDelete: [],
          onSuccess,
          onError,
        });
      });

      expect(mockRecordAction).not.toHaveBeenCalled();
      expect(onSuccess).not.toHaveBeenCalled();
      expect(onError).not.toHaveBeenCalled();
    });

    it('should return early when encounter is null', async () => {
      const { result } = renderHook(() =>
        useMergeRegions({
          encounterId: 'encounter-1',
          encounter: null,
          addEncounterRegion: mockAddEncounterRegion,
          updateEncounterRegion: mockUpdateEncounterRegion,
          removeEncounterRegion: mockRemoveEncounterRegion,
          setEncounter: mockSetEncounter,
          setErrorMessage: mockSetErrorMessage,
          recordAction: mockRecordAction,
          refetch: mockRefetch,
        }),
      );

      const onSuccess = vi.fn();
      const onError = vi.fn();

      await act(async () => {
        await result.current.executeMerge({
          targetRegionIndex: 1,
          originalTargetRegion: targetRegion,
          mergedVertices: [{ x: 0, y: 0 }],
          regionsToDelete: [],
          onSuccess,
          onError,
        });
      });

      expect(mockRecordAction).not.toHaveBeenCalled();
      expect(onSuccess).not.toHaveBeenCalled();
      expect(onError).not.toHaveBeenCalled();
    });

    it('should handle target region not found', async () => {
      const { result } = renderHook(() =>
        useMergeRegions({
          encounterId: 'encounter-1',
          encounter: testEncounter,
          addEncounterRegion: mockAddEncounterRegion,
          updateEncounterRegion: mockUpdateEncounterRegion,
          removeEncounterRegion: mockRemoveEncounterRegion,
          setEncounter: mockSetEncounter,
          setErrorMessage: mockSetErrorMessage,
          recordAction: mockRecordAction,
          refetch: mockRefetch,
        }),
      );

      const onSuccess = vi.fn();
      const onError = vi.fn();

      await act(async () => {
        await result.current.executeMerge({
          targetRegionIndex: 999,
          originalTargetRegion: targetRegion,
          mergedVertices: [{ x: 0, y: 0 }],
          regionsToDelete: [],
          onSuccess,
          onError,
        });
      });

      expect(mockSetErrorMessage).toHaveBeenCalledWith('Merge target region not found');
      expect(onError).toHaveBeenCalledTimes(1);
      expect(onSuccess).not.toHaveBeenCalled();
      expect(mockRecordAction).not.toHaveBeenCalled();
    });

    it('should handle EditRegionCommand execution failure', async () => {
      const { result } = renderHook(() =>
        useMergeRegions({
          encounterId: 'encounter-1',
          encounter: testEncounter,
          addEncounterRegion: mockAddEncounterRegion,
          updateEncounterRegion: mockUpdateEncounterRegion,
          removeEncounterRegion: mockRemoveEncounterRegion,
          setEncounter: mockSetEncounter,
          setErrorMessage: mockSetErrorMessage,
          recordAction: mockRecordAction,
          refetch: mockRefetch,
        }),
      );

      const mergedVertices: Point[] = [
        { x: 0, y: 0 },
        { x: 100, y: 0 },
        { x: 50, y: 100 },
      ];
      const onSuccess = vi.fn();
      const onError = vi.fn();

      const mockEditCommand = {
        execute: vi.fn().mockRejectedValue(new Error('Update failed')),
      };

      vi.spyOn(regionCommands, 'EditRegionCommand').mockImplementation(
        () => mockEditCommand as unknown as regionCommands.EditRegionCommand,
      );

      await act(async () => {
        await result.current.executeMerge({
          targetRegionIndex: 1,
          originalTargetRegion: targetRegion,
          mergedVertices,
          regionsToDelete: [2],
          onSuccess,
          onError,
        });
      });

      expect(mockEditCommand.execute).toHaveBeenCalledTimes(1);
      expect(mockSetErrorMessage).toHaveBeenCalledWith('Failed to merge regions. Please try again.');
      expect(onError).toHaveBeenCalledTimes(1);
      expect(onSuccess).not.toHaveBeenCalled();
      expect(mockRecordAction).not.toHaveBeenCalled();
    });

    it('should handle DeleteRegionCommand execution failure', async () => {
      const { result } = renderHook(() =>
        useMergeRegions({
          encounterId: 'encounter-1',
          encounter: testEncounter,
          addEncounterRegion: mockAddEncounterRegion,
          updateEncounterRegion: mockUpdateEncounterRegion,
          removeEncounterRegion: mockRemoveEncounterRegion,
          setEncounter: mockSetEncounter,
          setErrorMessage: mockSetErrorMessage,
          recordAction: mockRecordAction,
          refetch: mockRefetch,
        }),
      );

      const mergedVertices: Point[] = [
        { x: 0, y: 0 },
        { x: 100, y: 0 },
        { x: 50, y: 100 },
      ];
      const onSuccess = vi.fn();
      const onError = vi.fn();

      const mockEditCommand = {
        execute: vi.fn().mockResolvedValue(undefined),
      };
      const mockDeleteCommand = {
        execute: vi.fn().mockRejectedValue(new Error('Delete failed')),
      };

      vi.spyOn(regionCommands, 'EditRegionCommand').mockImplementation(
        () => mockEditCommand as unknown as regionCommands.EditRegionCommand,
      );
      vi.spyOn(regionCommands, 'DeleteRegionCommand').mockImplementation(
        () => mockDeleteCommand as unknown as regionCommands.DeleteRegionCommand,
      );

      await act(async () => {
        await result.current.executeMerge({
          targetRegionIndex: 1,
          originalTargetRegion: targetRegion,
          mergedVertices,
          regionsToDelete: [2],
          onSuccess,
          onError,
        });
      });

      expect(mockEditCommand.execute).toHaveBeenCalledTimes(1);
      expect(mockDeleteCommand.execute).toHaveBeenCalledTimes(1);
      expect(mockSetErrorMessage).toHaveBeenCalledWith('Failed to merge regions. Please try again.');
      expect(onError).toHaveBeenCalledTimes(1);
      expect(onSuccess).not.toHaveBeenCalled();
      expect(mockRecordAction).not.toHaveBeenCalled();
    });

    it('should skip delete command when region to delete not found', async () => {
      const { result } = renderHook(() =>
        useMergeRegions({
          encounterId: 'encounter-1',
          encounter: testEncounter,
          addEncounterRegion: mockAddEncounterRegion,
          updateEncounterRegion: mockUpdateEncounterRegion,
          removeEncounterRegion: mockRemoveEncounterRegion,
          setEncounter: mockSetEncounter,
          setErrorMessage: mockSetErrorMessage,
          recordAction: mockRecordAction,
          refetch: mockRefetch,
        }),
      );

      const mergedVertices: Point[] = [
        { x: 0, y: 0 },
        { x: 100, y: 0 },
        { x: 50, y: 100 },
      ];
      const onSuccess = vi.fn();
      const onError = vi.fn();

      const mockUnwrap = vi.fn().mockResolvedValue(undefined);
      mockUpdateEncounterRegion.mockReturnValue({ unwrap: mockUnwrap });

      const mockEditCommand = {
        execute: vi.fn().mockResolvedValue(undefined),
      };

      vi.spyOn(regionCommands, 'EditRegionCommand').mockImplementation(
        () => mockEditCommand as unknown as regionCommands.EditRegionCommand,
      );

      const deleteCommandSpy = vi.spyOn(regionCommands, 'DeleteRegionCommand');

      await act(async () => {
        await result.current.executeMerge({
          targetRegionIndex: 1,
          originalTargetRegion: targetRegion,
          mergedVertices,
          regionsToDelete: [999],
          onSuccess,
          onError,
        });
      });

      expect(mockEditCommand.execute).toHaveBeenCalledTimes(1);
      expect(deleteCommandSpy).not.toHaveBeenCalled();
      expect(onSuccess).toHaveBeenCalledTimes(1);
      expect(onError).not.toHaveBeenCalled();
    });
  });

  describe('executeMerge - Command Creation', () => {
    it('should create EditRegionCommand with correct parameters', async () => {
      const { result } = renderHook(() =>
        useMergeRegions({
          encounterId: 'encounter-1',
          encounter: testEncounter,
          addEncounterRegion: mockAddEncounterRegion,
          updateEncounterRegion: mockUpdateEncounterRegion,
          removeEncounterRegion: mockRemoveEncounterRegion,
          setEncounter: mockSetEncounter,
          setErrorMessage: mockSetErrorMessage,
          recordAction: mockRecordAction,
          refetch: mockRefetch,
        }),
      );

      const mergedVertices: Point[] = [
        { x: 0, y: 0 },
        { x: 150, y: 0 },
        { x: 100, y: 100 },
      ];

      const onSuccess = vi.fn();
      const onError = vi.fn();

      const mockUnwrap = vi.fn().mockResolvedValue(undefined);
      mockUpdateEncounterRegion.mockReturnValue({ unwrap: mockUnwrap });

      const mockEditCommand = {
        execute: vi.fn().mockResolvedValue(undefined),
      };

      const editCommandSpy = vi
        .spyOn(regionCommands, 'EditRegionCommand')
        .mockImplementation(() => mockEditCommand as unknown as regionCommands.EditRegionCommand);

      await act(async () => {
        await result.current.executeMerge({
          targetRegionIndex: 1,
          originalTargetRegion: targetRegion,
          mergedVertices,
          regionsToDelete: [],
          onSuccess,
          onError,
        });
      });

      expect(editCommandSpy).toHaveBeenCalledWith(
        expect.objectContaining({
          encounterId: 'encounter-1',
          regionIndex: 1,
          oldRegion: targetRegion,
          newRegion: expect.objectContaining({
            vertices: mergedVertices,
          }),
          onUpdate: expect.any(Function),
          onRefetch: expect.any(Function),
        }),
      );
    });

    it('should create DeleteRegionCommand for each region to delete', async () => {
      const region3: EncounterRegion = {
        encounterId: 'encounter-1',
        index: 3,
        name: 'Region 3',
        vertices: [
          { x: 100, y: 0 },
          { x: 150, y: 0 },
          { x: 125, y: 50 },
        ],
        type: 'Elevation',
      };

      const encounterWith3Regions: Encounter = {
        ...testEncounter,
        regions: [targetRegion, regionToDelete, region3],
      };

      const { result } = renderHook(() =>
        useMergeRegions({
          encounterId: 'encounter-1',
          encounter: encounterWith3Regions,
          addEncounterRegion: mockAddEncounterRegion,
          updateEncounterRegion: mockUpdateEncounterRegion,
          removeEncounterRegion: mockRemoveEncounterRegion,
          setEncounter: mockSetEncounter,
          setErrorMessage: mockSetErrorMessage,
          recordAction: mockRecordAction,
          refetch: mockRefetch,
        }),
      );

      const mergedVertices: Point[] = [
        { x: 0, y: 0 },
        { x: 150, y: 0 },
      ];
      const onSuccess = vi.fn();
      const onError = vi.fn();

      const mockUnwrap = vi.fn().mockResolvedValue(undefined);
      mockUpdateEncounterRegion.mockReturnValue({ unwrap: mockUnwrap });
      mockRemoveEncounterRegion.mockReturnValue({ unwrap: mockUnwrap });

      const mockEditCommand = {
        execute: vi.fn().mockResolvedValue(undefined),
      };

      vi.spyOn(regionCommands, 'EditRegionCommand').mockImplementation(
        () => mockEditCommand as unknown as regionCommands.EditRegionCommand,
      );

      const deleteCommandSpy = vi.spyOn(regionCommands, 'DeleteRegionCommand').mockImplementation(
        () =>
          ({
            execute: vi.fn().mockResolvedValue(undefined),
          }) as unknown as regionCommands.DeleteRegionCommand,
      );

      await act(async () => {
        await result.current.executeMerge({
          targetRegionIndex: 1,
          originalTargetRegion: targetRegion,
          mergedVertices,
          regionsToDelete: [2, 3],
          onSuccess,
          onError,
        });
      });

      expect(deleteCommandSpy).toHaveBeenCalledTimes(2);
      expect(deleteCommandSpy).toHaveBeenCalledWith(
        expect.objectContaining({
          encounterId: 'encounter-1',
          regionIndex: 2,
          region: regionToDelete,
          onAdd: expect.any(Function),
          onRemove: expect.any(Function),
          onRefetch: expect.any(Function),
        }),
      );
      expect(deleteCommandSpy).toHaveBeenCalledWith(
        expect.objectContaining({
          encounterId: 'encounter-1',
          regionIndex: 3,
          region: region3,
          onAdd: expect.any(Function),
          onRemove: expect.any(Function),
          onRefetch: expect.any(Function),
        }),
      );
    });

    it('should create BatchCommand wrapping all commands', async () => {
      const { result } = renderHook(() =>
        useMergeRegions({
          encounterId: 'encounter-1',
          encounter: testEncounter,
          addEncounterRegion: mockAddEncounterRegion,
          updateEncounterRegion: mockUpdateEncounterRegion,
          removeEncounterRegion: mockRemoveEncounterRegion,
          setEncounter: mockSetEncounter,
          setErrorMessage: mockSetErrorMessage,
          recordAction: mockRecordAction,
          refetch: mockRefetch,
        }),
      );

      const mergedVertices: Point[] = [
        { x: 0, y: 0 },
        { x: 100, y: 0 },
      ];
      const onSuccess = vi.fn();
      const onError = vi.fn();

      const mockUnwrap = vi.fn().mockResolvedValue(undefined);
      mockUpdateEncounterRegion.mockReturnValue({ unwrap: mockUnwrap });
      mockRemoveEncounterRegion.mockReturnValue({ unwrap: mockUnwrap });

      const mockEditCommand = {
        execute: vi.fn().mockResolvedValue(undefined),
      };
      const mockDeleteCommand = {
        execute: vi.fn().mockResolvedValue(undefined),
      };

      vi.spyOn(regionCommands, 'EditRegionCommand').mockImplementation(
        () => mockEditCommand as unknown as regionCommands.EditRegionCommand,
      );
      vi.spyOn(regionCommands, 'DeleteRegionCommand').mockImplementation(
        () => mockDeleteCommand as unknown as regionCommands.DeleteRegionCommand,
      );

      await act(async () => {
        await result.current.executeMerge({
          targetRegionIndex: 1,
          originalTargetRegion: targetRegion,
          mergedVertices,
          regionsToDelete: [2],
          onSuccess,
          onError,
        });
      });

      expect(mockCreateBatchCommand).toHaveBeenCalledWith({
        commands: expect.arrayContaining([mockEditCommand, mockDeleteCommand]),
      });
    });
  });

  describe('executeMerge - Optimistic State Updates', () => {
    it('should update encounter state with merged region vertices', async () => {
      const { result } = renderHook(() =>
        useMergeRegions({
          encounterId: 'encounter-1',
          encounter: testEncounter,
          addEncounterRegion: mockAddEncounterRegion,
          updateEncounterRegion: mockUpdateEncounterRegion,
          removeEncounterRegion: mockRemoveEncounterRegion,
          setEncounter: mockSetEncounter,
          setErrorMessage: mockSetErrorMessage,
          recordAction: mockRecordAction,
          refetch: mockRefetch,
        }),
      );

      const mergedVertices: Point[] = [
        { x: 0, y: 0 },
        { x: 150, y: 0 },
        { x: 100, y: 100 },
      ];

      const onSuccess = vi.fn();
      const onError = vi.fn();

      const mockUnwrap = vi.fn().mockResolvedValue(undefined);
      mockUpdateEncounterRegion.mockReturnValue({ unwrap: mockUnwrap });
      mockRemoveEncounterRegion.mockReturnValue({ unwrap: mockUnwrap });

      vi.spyOn(regionCommands, 'EditRegionCommand').mockImplementation(
        () =>
          ({
            execute: vi.fn().mockResolvedValue(undefined),
          }) as unknown as regionCommands.EditRegionCommand,
      );
      vi.spyOn(regionCommands, 'DeleteRegionCommand').mockImplementation(
        () =>
          ({
            execute: vi.fn().mockResolvedValue(undefined),
          }) as unknown as regionCommands.DeleteRegionCommand,
      );

      await act(async () => {
        await result.current.executeMerge({
          targetRegionIndex: 1,
          originalTargetRegion: targetRegion,
          mergedVertices,
          regionsToDelete: [2],
          onSuccess,
          onError,
        });
      });

      expect(mockUpdateRegionOptimistic).toHaveBeenCalledWith(testEncounter, 1, { vertices: mergedVertices });
    });

    it('should remove deleted regions from encounter state', async () => {
      const region3: EncounterRegion = {
        encounterId: 'encounter-1',
        index: 3,
        name: 'Region 3',
        vertices: [
          { x: 100, y: 0 },
          { x: 150, y: 0 },
          { x: 125, y: 50 },
        ],
        type: 'Elevation',
      };

      const encounterWith3Regions: Encounter = {
        ...testEncounter,
        regions: [targetRegion, regionToDelete, region3],
      };

      const { result } = renderHook(() =>
        useMergeRegions({
          encounterId: 'encounter-1',
          encounter: encounterWith3Regions,
          addEncounterRegion: mockAddEncounterRegion,
          updateEncounterRegion: mockUpdateEncounterRegion,
          removeEncounterRegion: mockRemoveEncounterRegion,
          setEncounter: mockSetEncounter,
          setErrorMessage: mockSetErrorMessage,
          recordAction: mockRecordAction,
          refetch: mockRefetch,
        }),
      );

      const mergedVertices: Point[] = [
        { x: 0, y: 0 },
        { x: 150, y: 0 },
      ];
      const onSuccess = vi.fn();
      const onError = vi.fn();

      const mockUnwrap = vi.fn().mockResolvedValue(undefined);
      mockUpdateEncounterRegion.mockReturnValue({ unwrap: mockUnwrap });
      mockRemoveEncounterRegion.mockReturnValue({ unwrap: mockUnwrap });

      vi.spyOn(regionCommands, 'EditRegionCommand').mockImplementation(
        () =>
          ({
            execute: vi.fn().mockResolvedValue(undefined),
          }) as unknown as regionCommands.EditRegionCommand,
      );
      vi.spyOn(regionCommands, 'DeleteRegionCommand').mockImplementation(
        () =>
          ({
            execute: vi.fn().mockResolvedValue(undefined),
          }) as unknown as regionCommands.DeleteRegionCommand,
      );

      await act(async () => {
        await result.current.executeMerge({
          targetRegionIndex: 1,
          originalTargetRegion: targetRegion,
          mergedVertices,
          regionsToDelete: [2, 3],
          onSuccess,
          onError,
        });
      });

      expect(mockRemoveRegionOptimistic).toHaveBeenNthCalledWith(1, expect.any(Object), 2);
      expect(mockRemoveRegionOptimistic).toHaveBeenNthCalledWith(2, expect.any(Object), 3);
    });

    it('should remove temporary regions from encounter state', async () => {
      const { result } = renderHook(() =>
        useMergeRegions({
          encounterId: 'encounter-1',
          encounter: testEncounter,
          addEncounterRegion: mockAddEncounterRegion,
          updateEncounterRegion: mockUpdateEncounterRegion,
          removeEncounterRegion: mockRemoveEncounterRegion,
          setEncounter: mockSetEncounter,
          setErrorMessage: mockSetErrorMessage,
          recordAction: mockRecordAction,
          refetch: mockRefetch,
        }),
      );

      const mergedVertices: Point[] = [
        { x: 0, y: 0 },
        { x: 100, y: 0 },
      ];
      const onSuccess = vi.fn();
      const onError = vi.fn();

      const mockUnwrap = vi.fn().mockResolvedValue(undefined);
      mockUpdateEncounterRegion.mockReturnValue({ unwrap: mockUnwrap });
      mockRemoveEncounterRegion.mockReturnValue({ unwrap: mockUnwrap });

      vi.spyOn(regionCommands, 'EditRegionCommand').mockImplementation(
        () =>
          ({
            execute: vi.fn().mockResolvedValue(undefined),
          }) as unknown as regionCommands.EditRegionCommand,
      );
      vi.spyOn(regionCommands, 'DeleteRegionCommand').mockImplementation(
        () =>
          ({
            execute: vi.fn().mockResolvedValue(undefined),
          }) as unknown as regionCommands.DeleteRegionCommand,
      );

      await act(async () => {
        await result.current.executeMerge({
          targetRegionIndex: 1,
          originalTargetRegion: targetRegion,
          mergedVertices,
          regionsToDelete: [2],
          onSuccess,
          onError,
        });
      });

      expect(mockRemoveTempRegions).toHaveBeenCalled();
    });

    it('should call setEncounter with final optimistic state', async () => {
      const { result } = renderHook(() =>
        useMergeRegions({
          encounterId: 'encounter-1',
          encounter: testEncounter,
          addEncounterRegion: mockAddEncounterRegion,
          updateEncounterRegion: mockUpdateEncounterRegion,
          removeEncounterRegion: mockRemoveEncounterRegion,
          setEncounter: mockSetEncounter,
          setErrorMessage: mockSetErrorMessage,
          recordAction: mockRecordAction,
          refetch: mockRefetch,
        }),
      );

      const mergedVertices: Point[] = [
        { x: 0, y: 0 },
        { x: 100, y: 0 },
      ];
      const onSuccess = vi.fn();
      const onError = vi.fn();

      const mockUnwrap = vi.fn().mockResolvedValue(undefined);
      mockUpdateEncounterRegion.mockReturnValue({ unwrap: mockUnwrap });
      mockRemoveEncounterRegion.mockReturnValue({ unwrap: mockUnwrap });

      vi.spyOn(regionCommands, 'EditRegionCommand').mockImplementation(
        () =>
          ({
            execute: vi.fn().mockResolvedValue(undefined),
          }) as unknown as regionCommands.EditRegionCommand,
      );
      vi.spyOn(regionCommands, 'DeleteRegionCommand').mockImplementation(
        () =>
          ({
            execute: vi.fn().mockResolvedValue(undefined),
          }) as unknown as regionCommands.DeleteRegionCommand,
      );

      const finalEncounter: Encounter = {
        ...testEncounter,
        regions: [{ ...targetRegion, vertices: mergedVertices }],
      };
      mockRemoveTempRegions.mockReturnValue(finalEncounter);

      await act(async () => {
        await result.current.executeMerge({
          targetRegionIndex: 1,
          originalTargetRegion: targetRegion,
          mergedVertices,
          regionsToDelete: [2],
          onSuccess,
          onError,
        });
      });

      expect(mockSetEncounter).toHaveBeenCalledWith(finalEncounter);
    });
  });

  describe('executeMerge - Callback Invocations', () => {
    it('should call recordAction with BatchCommand after successful execution', async () => {
      const { result } = renderHook(() =>
        useMergeRegions({
          encounterId: 'encounter-1',
          encounter: testEncounter,
          addEncounterRegion: mockAddEncounterRegion,
          updateEncounterRegion: mockUpdateEncounterRegion,
          removeEncounterRegion: mockRemoveEncounterRegion,
          setEncounter: mockSetEncounter,
          setErrorMessage: mockSetErrorMessage,
          recordAction: mockRecordAction,
          refetch: mockRefetch,
        }),
      );

      const mergedVertices: Point[] = [
        { x: 0, y: 0 },
        { x: 100, y: 0 },
      ];
      const onSuccess = vi.fn();
      const onError = vi.fn();

      const mockUnwrap = vi.fn().mockResolvedValue(undefined);
      mockUpdateEncounterRegion.mockReturnValue({ unwrap: mockUnwrap });
      mockRemoveEncounterRegion.mockReturnValue({ unwrap: mockUnwrap });

      vi.spyOn(regionCommands, 'EditRegionCommand').mockImplementation(
        () =>
          ({
            execute: vi.fn().mockResolvedValue(undefined),
          }) as unknown as regionCommands.EditRegionCommand,
      );
      vi.spyOn(regionCommands, 'DeleteRegionCommand').mockImplementation(
        () =>
          ({
            execute: vi.fn().mockResolvedValue(undefined),
          }) as unknown as regionCommands.DeleteRegionCommand,
      );

      const mockBatchCommand: Command = {
        description: 'Batch (2 operations)',
        execute: vi.fn(),
        undo: vi.fn(),
      };
      mockCreateBatchCommand.mockReturnValue(mockBatchCommand);

      await act(async () => {
        await result.current.executeMerge({
          targetRegionIndex: 1,
          originalTargetRegion: targetRegion,
          mergedVertices,
          regionsToDelete: [2],
          onSuccess,
          onError,
        });
      });

      expect(mockRecordAction).toHaveBeenCalledTimes(1);
      expect(mockRecordAction).toHaveBeenCalledWith(mockBatchCommand);
    });

    it('should call onSuccess after successful merge', async () => {
      const { result } = renderHook(() =>
        useMergeRegions({
          encounterId: 'encounter-1',
          encounter: testEncounter,
          addEncounterRegion: mockAddEncounterRegion,
          updateEncounterRegion: mockUpdateEncounterRegion,
          removeEncounterRegion: mockRemoveEncounterRegion,
          setEncounter: mockSetEncounter,
          setErrorMessage: mockSetErrorMessage,
          recordAction: mockRecordAction,
          refetch: mockRefetch,
        }),
      );

      const mergedVertices: Point[] = [
        { x: 0, y: 0 },
        { x: 100, y: 0 },
      ];
      const onSuccess = vi.fn();
      const onError = vi.fn();

      const mockUnwrap = vi.fn().mockResolvedValue(undefined);
      mockUpdateEncounterRegion.mockReturnValue({ unwrap: mockUnwrap });
      mockRemoveEncounterRegion.mockReturnValue({ unwrap: mockUnwrap });

      vi.spyOn(regionCommands, 'EditRegionCommand').mockImplementation(
        () =>
          ({
            execute: vi.fn().mockResolvedValue(undefined),
          }) as unknown as regionCommands.EditRegionCommand,
      );
      vi.spyOn(regionCommands, 'DeleteRegionCommand').mockImplementation(
        () =>
          ({
            execute: vi.fn().mockResolvedValue(undefined),
          }) as unknown as regionCommands.DeleteRegionCommand,
      );

      await act(async () => {
        await result.current.executeMerge({
          targetRegionIndex: 1,
          originalTargetRegion: targetRegion,
          mergedVertices,
          regionsToDelete: [2],
          onSuccess,
          onError,
        });
      });

      expect(onSuccess).toHaveBeenCalledTimes(1);
      expect(onError).not.toHaveBeenCalled();
    });

    it('should call onError after failed merge', async () => {
      const { result } = renderHook(() =>
        useMergeRegions({
          encounterId: 'encounter-1',
          encounter: testEncounter,
          addEncounterRegion: mockAddEncounterRegion,
          updateEncounterRegion: mockUpdateEncounterRegion,
          removeEncounterRegion: mockRemoveEncounterRegion,
          setEncounter: mockSetEncounter,
          setErrorMessage: mockSetErrorMessage,
          recordAction: mockRecordAction,
          refetch: mockRefetch,
        }),
      );

      const mergedVertices: Point[] = [
        { x: 0, y: 0 },
        { x: 100, y: 0 },
      ];
      const onSuccess = vi.fn();
      const onError = vi.fn();

      vi.spyOn(regionCommands, 'EditRegionCommand').mockImplementation(
        () =>
          ({
            execute: vi.fn().mockRejectedValue(new Error('Failed')),
          }) as unknown as regionCommands.EditRegionCommand,
      );

      await act(async () => {
        await result.current.executeMerge({
          targetRegionIndex: 1,
          originalTargetRegion: targetRegion,
          mergedVertices,
          regionsToDelete: [],
          onSuccess,
          onError,
        });
      });

      expect(onError).toHaveBeenCalledTimes(1);
      expect(onSuccess).not.toHaveBeenCalled();
    });
  });

  describe('executeMerge - Command Execution Order', () => {
    it('should execute EditRegionCommand before DeleteRegionCommand', async () => {
      const { result } = renderHook(() =>
        useMergeRegions({
          encounterId: 'encounter-1',
          encounter: testEncounter,
          addEncounterRegion: mockAddEncounterRegion,
          updateEncounterRegion: mockUpdateEncounterRegion,
          removeEncounterRegion: mockRemoveEncounterRegion,
          setEncounter: mockSetEncounter,
          setErrorMessage: mockSetErrorMessage,
          recordAction: mockRecordAction,
          refetch: mockRefetch,
        }),
      );

      const mergedVertices: Point[] = [
        { x: 0, y: 0 },
        { x: 100, y: 0 },
      ];
      const onSuccess = vi.fn();
      const onError = vi.fn();

      const mockUnwrap = vi.fn().mockResolvedValue(undefined);
      mockUpdateEncounterRegion.mockReturnValue({ unwrap: mockUnwrap });
      mockRemoveEncounterRegion.mockReturnValue({ unwrap: mockUnwrap });

      const executionOrder: string[] = [];

      const mockEditCommand = {
        execute: vi.fn().mockImplementation(async () => {
          executionOrder.push('edit');
        }),
      };
      const mockDeleteCommand = {
        execute: vi.fn().mockImplementation(async () => {
          executionOrder.push('delete');
        }),
      };

      vi.spyOn(regionCommands, 'EditRegionCommand').mockImplementation(
        () => mockEditCommand as unknown as regionCommands.EditRegionCommand,
      );
      vi.spyOn(regionCommands, 'DeleteRegionCommand').mockImplementation(
        () => mockDeleteCommand as unknown as regionCommands.DeleteRegionCommand,
      );

      await act(async () => {
        await result.current.executeMerge({
          targetRegionIndex: 1,
          originalTargetRegion: targetRegion,
          mergedVertices,
          regionsToDelete: [2],
          onSuccess,
          onError,
        });
      });

      expect(executionOrder).toEqual(['edit', 'delete']);
    });

    it('should execute all DeleteRegionCommands in order', async () => {
      const region3: EncounterRegion = {
        encounterId: 'encounter-1',
        index: 3,
        name: 'Region 3',
        vertices: [{ x: 100, y: 0 }],
        type: 'Elevation',
      };

      const encounterWith3Regions: Encounter = {
        ...testEncounter,
        regions: [targetRegion, regionToDelete, region3],
      };

      const { result } = renderHook(() =>
        useMergeRegions({
          encounterId: 'encounter-1',
          encounter: encounterWith3Regions,
          addEncounterRegion: mockAddEncounterRegion,
          updateEncounterRegion: mockUpdateEncounterRegion,
          removeEncounterRegion: mockRemoveEncounterRegion,
          setEncounter: mockSetEncounter,
          setErrorMessage: mockSetErrorMessage,
          recordAction: mockRecordAction,
          refetch: mockRefetch,
        }),
      );

      const mergedVertices: Point[] = [
        { x: 0, y: 0 },
        { x: 100, y: 0 },
      ];
      const onSuccess = vi.fn();
      const onError = vi.fn();

      const mockUnwrap = vi.fn().mockResolvedValue(undefined);
      mockUpdateEncounterRegion.mockReturnValue({ unwrap: mockUnwrap });
      mockRemoveEncounterRegion.mockReturnValue({ unwrap: mockUnwrap });

      const executionOrder: string[] = [];

      vi.spyOn(regionCommands, 'EditRegionCommand').mockImplementation(
        () =>
          ({
            execute: vi.fn().mockResolvedValue(undefined),
          }) as unknown as regionCommands.EditRegionCommand,
      );

      let deleteCallCount = 0;
      vi.spyOn(regionCommands, 'DeleteRegionCommand').mockImplementation(() => {
        const callNum = deleteCallCount++;
        return {
          execute: vi.fn().mockImplementation(async () => {
            executionOrder.push(`delete${callNum + 1}`);
          }),
        } as unknown as regionCommands.DeleteRegionCommand;
      });

      await act(async () => {
        await result.current.executeMerge({
          targetRegionIndex: 1,
          originalTargetRegion: targetRegion,
          mergedVertices,
          regionsToDelete: [2, 3],
          onSuccess,
          onError,
        });
      });

      expect(executionOrder).toContain('delete1');
      expect(executionOrder).toContain('delete2');
      expect(executionOrder.indexOf('delete1')).toBeLessThan(executionOrder.indexOf('delete2'));
    });
  });
});
