import { describe, it, expect, vi } from 'vitest';
import {
    CreateWallCommand,
    EditWallCommand,
    DeleteWallCommand,
    BreakWallCommand,
    type CreateWallCommandParams,
    type EditWallCommandParams,
    type DeleteWallCommandParams,
    type BreakWallCommandParams,
} from './wallCommands';
import type { EncounterWall, EncounterWallSegment } from '@/types/domain';
import { SegmentType, SegmentState } from '@/types/domain';

const createMockSegment = (index: number): EncounterWallSegment => ({
    index,
    startPole: { x: index * 50, y: index * 50, h: 10 },
    endPole: { x: (index + 1) * 50, y: (index + 1) * 50, h: 10 },
    type: SegmentType.Wall,
    isOpaque: true,
    state: SegmentState.Closed,
});

const createMockWall = (index: number, name: string = `Wall ${index}`): EncounterWall => ({
    index,
    name,
    segments: [createMockSegment(0), createMockSegment(1)],
});

const createMockSegmentWall = (index: number, segments: EncounterWallSegment[]): EncounterWall => ({
    index,
    name: `Segment ${index}`,
    segments,
});

describe('CreateWallCommand', () => {
    it('should set description property correctly', () => {
        const mockWall = createMockWall(0);
        const params: CreateWallCommandParams = {
            encounterId: 'encounter-1',
            wall: mockWall,
            onCreate: vi.fn(),
            onRemove: vi.fn(),
            onRefetch: vi.fn(),
        };

        const command = new CreateWallCommand(params);

        expect(command.description).toBe('Create wall "Wall 0"');
    });

    it('should call redo on execute', async () => {
        const mockWall = createMockWall(0);
        const onCreate = vi.fn().mockResolvedValue({ ...mockWall, index: 5 });
        const onRefetch = vi.fn().mockResolvedValue(undefined);
        const params: CreateWallCommandParams = {
            encounterId: 'encounter-1',
            wall: mockWall,
            onCreate,
            onRemove: vi.fn(),
            onRefetch,
        };

        const command = new CreateWallCommand(params);
        await command.execute();

        expect(onCreate).toHaveBeenCalledWith('encounter-1', {
            name: mockWall.name,
            segments: mockWall.segments,
        });
        expect(onRefetch).toHaveBeenCalled();
    });

    it('should call onRemove with correct wallIndex on undo', async () => {
        const mockWall = createMockWall(0);
        const onRemove = vi.fn().mockResolvedValue(undefined);
        const onRefetch = vi.fn().mockResolvedValue(undefined);
        const params: CreateWallCommandParams = {
            encounterId: 'encounter-1',
            wall: mockWall,
            onCreate: vi.fn(),
            onRemove,
            onRefetch,
        };

        const command = new CreateWallCommand(params);
        await command.undo();

        expect(onRemove).toHaveBeenCalledWith('encounter-1', 0);
        expect(onRemove).toHaveBeenCalledTimes(1);
    });

    it('should call onRefetch after removal on undo', async () => {
        const mockWall = createMockWall(0);
        const onRemove = vi.fn().mockResolvedValue(undefined);
        const onRefetch = vi.fn().mockResolvedValue(undefined);
        const params: CreateWallCommandParams = {
            encounterId: 'encounter-1',
            wall: mockWall,
            onCreate: vi.fn(),
            onRemove,
            onRefetch,
        };

        const command = new CreateWallCommand(params);
        await command.undo();

        expect(onRefetch).toHaveBeenCalledTimes(1);
    });

    it('should call onCreate with wall properties on redo', async () => {
        const mockWall = createMockWall(0);
        const onCreate = vi.fn().mockResolvedValue({ ...mockWall, index: 5 });
        const onRefetch = vi.fn().mockResolvedValue(undefined);
        const params: CreateWallCommandParams = {
            encounterId: 'encounter-1',
            wall: mockWall,
            onCreate,
            onRemove: vi.fn(),
            onRefetch,
        };

        const command = new CreateWallCommand(params);
        await command.redo();

        expect(onCreate).toHaveBeenCalledWith('encounter-1', {
            name: mockWall.name,
            segments: mockWall.segments,
        });
        expect(onCreate).toHaveBeenCalledTimes(1);
    });

    it('should call onRefetch after creation on redo', async () => {
        const mockWall = createMockWall(0);
        const onCreate = vi.fn().mockResolvedValue({ ...mockWall, index: 5 });
        const onRefetch = vi.fn().mockResolvedValue(undefined);
        const params: CreateWallCommandParams = {
            encounterId: 'encounter-1',
            wall: mockWall,
            onCreate,
            onRemove: vi.fn(),
            onRefetch,
        };

        const command = new CreateWallCommand(params);
        await command.redo();

        expect(onRefetch).toHaveBeenCalledTimes(1);
    });
});

describe('EditWallCommand', () => {
    it('should set description property correctly', () => {
        const oldWall = createMockWall(0, 'Old Wall');
        const newWall = createMockWall(0, 'New Wall');
        const params: EditWallCommandParams = {
            encounterId: 'encounter-1',
            wallIndex: 0,
            oldWall,
            newWall,
            onUpdate: vi.fn(),
            onRefetch: vi.fn(),
        };

        const command = new EditWallCommand(params);

        expect(command.description).toBe('Edit wall "New Wall"');
    });

    it('should call redo on execute', async () => {
        const oldWall = createMockWall(0);
        const newWall = createMockWall(0, 'Edited Wall');
        const onUpdate = vi.fn().mockResolvedValue(undefined);
        const onRefetch = vi.fn().mockResolvedValue(undefined);
        const params: EditWallCommandParams = {
            encounterId: 'encounter-1',
            wallIndex: 0,
            oldWall,
            newWall,
            onUpdate,
            onRefetch,
        };

        const command = new EditWallCommand(params);
        await command.execute();

        expect(onUpdate).toHaveBeenCalledWith('encounter-1', 0, {
            name: newWall.name,
            segments: newWall.segments,
        });
    });

    it('should call onUpdate with oldWall properties on undo', async () => {
        const oldWall = createMockWall(0, 'Old Wall');
        const newWall = createMockWall(0, 'New Wall');
        const onUpdate = vi.fn().mockResolvedValue(undefined);
        const onRefetch = vi.fn().mockResolvedValue(undefined);
        const params: EditWallCommandParams = {
            encounterId: 'encounter-1',
            wallIndex: 0,
            oldWall,
            newWall,
            onUpdate,
            onRefetch,
        };

        const command = new EditWallCommand(params);
        await command.undo();

        expect(onUpdate).toHaveBeenCalledWith('encounter-1', 0, {
            name: oldWall.name,
            segments: oldWall.segments,
        });
        expect(onUpdate).toHaveBeenCalledTimes(1);
    });

    it('should call onRefetch after update on undo', async () => {
        const oldWall = createMockWall(0, 'Old Wall');
        const newWall = createMockWall(0, 'New Wall');
        const onUpdate = vi.fn().mockResolvedValue(undefined);
        const onRefetch = vi.fn().mockResolvedValue(undefined);
        const params: EditWallCommandParams = {
            encounterId: 'encounter-1',
            wallIndex: 0,
            oldWall,
            newWall,
            onUpdate,
            onRefetch,
        };

        const command = new EditWallCommand(params);
        await command.undo();

        expect(onRefetch).toHaveBeenCalledTimes(1);
    });

    it('should call onUpdate with newWall properties on redo', async () => {
        const oldWall = createMockWall(0, 'Old Wall');
        const newSegments: EncounterWallSegment[] = [
            {
                index: 0,
                startPole: { x: 10, y: 10, h: 15 },
                endPole: { x: 60, y: 60, h: 15 },
                type: SegmentType.Door,
                isOpaque: false,
                state: SegmentState.Open,
            },
        ];
        const newWall: EncounterWall = {
            index: 0,
            name: 'New Wall',
            segments: newSegments,
        };
        const onUpdate = vi.fn().mockResolvedValue(undefined);
        const onRefetch = vi.fn().mockResolvedValue(undefined);
        const params: EditWallCommandParams = {
            encounterId: 'encounter-1',
            wallIndex: 0,
            oldWall,
            newWall,
            onUpdate,
            onRefetch,
        };

        const command = new EditWallCommand(params);
        await command.redo();

        expect(onUpdate).toHaveBeenCalledWith('encounter-1', 0, {
            name: newWall.name,
            segments: newWall.segments,
        });
        expect(onUpdate).toHaveBeenCalledTimes(1);
    });

    it('should call onRefetch after update on redo', async () => {
        const oldWall = createMockWall(0, 'Old Wall');
        const newWall = createMockWall(0, 'New Wall');
        const onUpdate = vi.fn().mockResolvedValue(undefined);
        const onRefetch = vi.fn().mockResolvedValue(undefined);
        const params: EditWallCommandParams = {
            encounterId: 'encounter-1',
            wallIndex: 0,
            oldWall,
            newWall,
            onUpdate,
            onRefetch,
        };

        const command = new EditWallCommand(params);
        await command.redo();

        expect(onRefetch).toHaveBeenCalledTimes(1);
    });
});

describe('DeleteWallCommand', () => {
    it('should set description property correctly', () => {
        const mockWall = createMockWall(0, 'Wall to Delete');
        const params: DeleteWallCommandParams = {
            encounterId: 'encounter-1',
            wallIndex: 0,
            wall: mockWall,
            onAdd: vi.fn(),
            onRemove: vi.fn(),
            onRefetch: vi.fn(),
        };

        const command = new DeleteWallCommand(params);

        expect(command.description).toBe('Delete wall "Wall to Delete"');
    });

    it('should call onRemove on execute', async () => {
        const mockWall = createMockWall(0);
        const onRemove = vi.fn().mockResolvedValue(undefined);
        const onRefetch = vi.fn().mockResolvedValue(undefined);
        const params: DeleteWallCommandParams = {
            encounterId: 'encounter-1',
            wallIndex: 0,
            wall: mockWall,
            onAdd: vi.fn(),
            onRemove,
            onRefetch,
        };

        const command = new DeleteWallCommand(params);
        await command.execute();

        expect(onRemove).toHaveBeenCalledWith('encounter-1', 0);
        expect(onRefetch).toHaveBeenCalled();
    });

    it('should call onAdd with wall properties on undo', async () => {
        const mockWall = createMockWall(0);
        const onAdd = vi.fn().mockResolvedValue({ ...mockWall, index: 10 });
        const onRefetch = vi.fn().mockResolvedValue(undefined);
        const params: DeleteWallCommandParams = {
            encounterId: 'encounter-1',
            wallIndex: 0,
            wall: mockWall,
            onAdd,
            onRemove: vi.fn(),
            onRefetch,
        };

        const command = new DeleteWallCommand(params);
        await command.undo();

        expect(onAdd).toHaveBeenCalledWith('encounter-1', {
            name: mockWall.name,
            segments: mockWall.segments,
        });
        expect(onAdd).toHaveBeenCalledTimes(1);
    });

    it('should track restoredIndex on undo', async () => {
        const mockWall = createMockWall(0);
        const restoredIndex = 15;
        const onAdd = vi.fn().mockResolvedValue({ ...mockWall, index: restoredIndex });
        const onRefetch = vi.fn().mockResolvedValue(undefined);
        const params: DeleteWallCommandParams = {
            encounterId: 'encounter-1',
            wallIndex: 0,
            wall: mockWall,
            onAdd,
            onRemove: vi.fn(),
            onRefetch,
        };

        const command = new DeleteWallCommand(params);
        await command.undo();

        expect(onAdd).toHaveBeenCalledTimes(1);
    });

    it('should call onRefetch after restore on undo', async () => {
        const mockWall = createMockWall(0);
        const onAdd = vi.fn().mockResolvedValue({ ...mockWall, index: 10 });
        const onRefetch = vi.fn().mockResolvedValue(undefined);
        const params: DeleteWallCommandParams = {
            encounterId: 'encounter-1',
            wallIndex: 0,
            wall: mockWall,
            onAdd,
            onRemove: vi.fn(),
            onRefetch,
        };

        const command = new DeleteWallCommand(params);
        await command.undo();

        expect(onRefetch).toHaveBeenCalledTimes(1);
    });

    it('should call onRemove with restoredIndex on redo', async () => {
        const mockWall = createMockWall(0);
        const restoredIndex = 20;
        const onAdd = vi.fn().mockResolvedValue({ ...mockWall, index: restoredIndex });
        const onRemove = vi.fn().mockResolvedValue(undefined);
        const onRefetch = vi.fn().mockResolvedValue(undefined);
        const params: DeleteWallCommandParams = {
            encounterId: 'encounter-1',
            wallIndex: 0,
            wall: mockWall,
            onAdd,
            onRemove,
            onRefetch,
        };

        const command = new DeleteWallCommand(params);
        await command.undo();
        await command.redo();

        expect(onRemove).toHaveBeenCalledWith('encounter-1', restoredIndex);
        expect(onRemove).toHaveBeenCalledTimes(1);
    });

    it('should call onRefetch after removal on redo', async () => {
        const mockWall = createMockWall(0);
        const onAdd = vi.fn().mockResolvedValue({ ...mockWall, index: 10 });
        const onRemove = vi.fn().mockResolvedValue(undefined);
        const onRefetch = vi.fn().mockResolvedValue(undefined);
        const params: DeleteWallCommandParams = {
            encounterId: 'encounter-1',
            wallIndex: 0,
            wall: mockWall,
            onAdd,
            onRemove,
            onRefetch,
        };

        const command = new DeleteWallCommand(params);
        await command.undo();
        await command.redo();

        expect(onRefetch).toHaveBeenCalledTimes(2);
    });
});

describe('BreakWallCommand', () => {
    const createBreakWallParams = (): BreakWallCommandParams => {
        const originalWall = createMockWall(0, 'Original Wall');
        const segment1: EncounterWallSegment[] = [
            {
                index: 0,
                startPole: { x: 0, y: 0, h: 10 },
                endPole: { x: 50, y: 50, h: 10 },
                type: SegmentType.Wall,
                isOpaque: true,
                state: SegmentState.Closed,
            },
        ];
        const segment2: EncounterWallSegment[] = [
            {
                index: 0,
                startPole: { x: 50, y: 50, h: 10 },
                endPole: { x: 100, y: 100, h: 10 },
                type: SegmentType.Wall,
                isOpaque: true,
                state: SegmentState.Closed,
            },
        ];
        const newWalls = [
            createMockSegmentWall(1, segment1),
            createMockSegmentWall(2, segment2),
        ];

        return {
            encounterId: 'encounter-1',
            originalWallIndex: 0,
            originalWall,
            newWalls,
            onAdd: vi.fn(),
            onUpdate: vi.fn(),
            onRemove: vi.fn(),
            onRefetch: vi.fn(),
        };
    };

    it('should set description property correctly', () => {
        const params = createBreakWallParams();
        const command = new BreakWallCommand(params);

        expect(command.description).toBe('Break wall "Original Wall" into 2 segments');
    });

    it('should call redo on execute', async () => {
        const params = createBreakWallParams();
        const onRemove = vi.fn().mockResolvedValue(undefined);
        const onAdd = vi.fn()
            .mockResolvedValueOnce({ ...params.newWalls[0], index: 10 })
            .mockResolvedValueOnce({ ...params.newWalls[1], index: 11 });
        const onRefetch = vi.fn().mockResolvedValue(undefined);
        params.onRemove = onRemove;
        params.onAdd = onAdd;
        params.onRefetch = onRefetch;

        const command = new BreakWallCommand(params);
        await command.execute();

        expect(onRemove).toHaveBeenCalledWith('encounter-1', 0);
        expect(onAdd).toHaveBeenCalledTimes(2);
    });

    it('should call onRemove for all segment walls on undo', async () => {
        const params = createBreakWallParams();
        const onRemove = vi.fn().mockResolvedValue(undefined);
        const onUpdate = vi.fn().mockResolvedValue(undefined);
        const onRefetch = vi.fn().mockResolvedValue(undefined);
        params.onRemove = onRemove;
        params.onUpdate = onUpdate;
        params.onRefetch = onRefetch;

        const command = new BreakWallCommand(params);
        await command.undo();

        expect(onRemove).toHaveBeenCalledTimes(2);
        expect(onRemove).toHaveBeenCalledWith('encounter-1', 1);
        expect(onRemove).toHaveBeenCalledWith('encounter-1', 2);
    });

    it('should call onUpdate to restore original wall on undo', async () => {
        const params = createBreakWallParams();
        const onRemove = vi.fn().mockResolvedValue(undefined);
        const onUpdate = vi.fn().mockResolvedValue(undefined);
        const onRefetch = vi.fn().mockResolvedValue(undefined);
        params.onRemove = onRemove;
        params.onUpdate = onUpdate;
        params.onRefetch = onRefetch;

        const command = new BreakWallCommand(params);
        await command.undo();

        expect(onUpdate).toHaveBeenCalledWith('encounter-1', 0, {
            name: params.originalWall.name,
            segments: params.originalWall.segments,
        });
        expect(onUpdate).toHaveBeenCalledTimes(1);
    });

    it('should call onRefetch after restore on undo', async () => {
        const params = createBreakWallParams();
        const onRemove = vi.fn().mockResolvedValue(undefined);
        const onUpdate = vi.fn().mockResolvedValue(undefined);
        const onRefetch = vi.fn().mockResolvedValue(undefined);
        params.onRemove = onRemove;
        params.onUpdate = onUpdate;
        params.onRefetch = onRefetch;

        const command = new BreakWallCommand(params);
        await command.undo();

        expect(onRefetch).toHaveBeenCalledTimes(1);
    });

    it('should call onRemove for original wall on redo', async () => {
        const params = createBreakWallParams();
        const onRemove = vi.fn().mockResolvedValue(undefined);
        const onAdd = vi.fn()
            .mockResolvedValueOnce({ ...params.newWalls[0], index: 10 })
            .mockResolvedValueOnce({ ...params.newWalls[1], index: 11 });
        const onRefetch = vi.fn().mockResolvedValue(undefined);
        params.onRemove = onRemove;
        params.onAdd = onAdd;
        params.onRefetch = onRefetch;

        const command = new BreakWallCommand(params);
        await command.redo();

        expect(onRemove).toHaveBeenCalledWith('encounter-1', 0);
        expect(onRemove).toHaveBeenCalledTimes(1);
    });

    it('should call onAdd for each segment on redo', async () => {
        const params = createBreakWallParams();
        const onAdd = vi.fn()
            .mockResolvedValueOnce({ ...params.newWalls[0], index: 10 })
            .mockResolvedValueOnce({ ...params.newWalls[1], index: 11 });
        const onRemove = vi.fn().mockResolvedValue(undefined);
        const onRefetch = vi.fn().mockResolvedValue(undefined);
        params.onAdd = onAdd;
        params.onRemove = onRemove;
        params.onRefetch = onRefetch;

        const command = new BreakWallCommand(params);
        await command.redo();

        expect(onAdd).toHaveBeenCalledTimes(2);
        expect(onAdd).toHaveBeenNthCalledWith(1, 'encounter-1', {
            name: params.newWalls[0]?.name,
            segments: params.newWalls[0]?.segments,
        });
        expect(onAdd).toHaveBeenNthCalledWith(2, 'encounter-1', {
            name: params.newWalls[1]?.name,
            segments: params.newWalls[1]?.segments,
        });
    });

    it('should update segmentIndices with new indices on redo', async () => {
        const params = createBreakWallParams();
        const newIndices = [25, 26];
        const onAdd = vi.fn()
            .mockResolvedValueOnce({ ...params.newWalls[0], index: newIndices[0] })
            .mockResolvedValueOnce({ ...params.newWalls[1], index: newIndices[1] });
        const onRemove = vi.fn().mockResolvedValue(undefined);
        const onRefetch = vi.fn().mockResolvedValue(undefined);
        params.onAdd = onAdd;
        params.onRemove = onRemove;
        params.onRefetch = onRefetch;

        const command = new BreakWallCommand(params);
        await command.redo();

        expect(command['segmentIndices']).toEqual(newIndices);
    });

    it('should call onRefetch after redo', async () => {
        const params = createBreakWallParams();
        const onAdd = vi.fn()
            .mockResolvedValueOnce({ ...params.newWalls[0], index: 10 })
            .mockResolvedValueOnce({ ...params.newWalls[1], index: 11 });
        const onRemove = vi.fn().mockResolvedValue(undefined);
        const onRefetch = vi.fn().mockResolvedValue(undefined);
        params.onAdd = onAdd;
        params.onRemove = onRemove;
        params.onRefetch = onRefetch;

        const command = new BreakWallCommand(params);
        await command.redo();

        expect(onRefetch).toHaveBeenCalledTimes(1);
    });
});
