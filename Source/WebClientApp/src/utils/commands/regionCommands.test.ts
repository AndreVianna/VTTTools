import { beforeEach, describe, expect, it, vi } from 'vitest';
import type { EncounterRegion } from '@/types/domain';
import {
    CreateRegionCommand,
    DeleteRegionCommand,
    EditRegionCommand,
    type CreateRegionCommandParams,
    type CreateRegionResult,
    type DeleteRegionCommandParams,
    type EditRegionCommandParams,
} from './regionCommands';

// Type aliases for mock function signatures
type OnCreateFn = (encounterId: string, region: Omit<EncounterRegion, 'index' | 'encounterId'>) => Promise<CreateRegionResult>;
type OnRemoveFn = (encounterId: string, regionIndex: number) => Promise<void>;
type OnRefetchFn = () => Promise<void>;
type OnUpdateFn = (encounterId: string | undefined, regionIndex: number, updates: Partial<EncounterRegion>) => Promise<void>;
type OnAddFn = OnCreateFn;

const createMockEncounterRegion = (overrides: Partial<EncounterRegion> = {}): EncounterRegion => ({
    encounterId: 'encounter-1',
    index: 5,
    type: 'FogOfWar',
    name: 'Test Region',
    vertices: [
        { x: 0, y: 0 },
        { x: 100, y: 0 },
        { x: 100, y: 100 },
    ],
    ...overrides,
});

describe('CreateRegionCommand', () => {
    let mockOnCreate: ReturnType<typeof vi.fn<OnCreateFn>>;
    let mockOnRemove: ReturnType<typeof vi.fn<OnRemoveFn>>;
    let mockOnRefetch: ReturnType<typeof vi.fn<OnRefetchFn>>;

    beforeEach(() => {
        mockOnCreate = vi.fn<OnCreateFn>().mockResolvedValue({ index: 10 });
        mockOnRemove = vi.fn<OnRemoveFn>().mockResolvedValue(undefined);
        mockOnRefetch = vi.fn<OnRefetchFn>().mockResolvedValue(undefined);
    });

    it('should set description property correctly', () => {
        const region = createMockEncounterRegion({ name: 'My Region' });
        const params: CreateRegionCommandParams = {
            encounterId: 'encounter-1',
            region,
            onCreate: mockOnCreate,
            onRemove: mockOnRemove,
            onRefetch: mockOnRefetch,
        };

        const command = new CreateRegionCommand(params);

        expect(command.description).toBe('Create region "My Region"');
    });

    it('should call onCreate with correct data on execute', async () => {
        const region = createMockEncounterRegion({ name: 'Test', value: 1 });
        const params: CreateRegionCommandParams = {
            encounterId: 'encounter-1',
            region,
            onCreate: mockOnCreate,
            onRemove: mockOnRemove,
            onRefetch: mockOnRefetch,
        };

        const command = new CreateRegionCommand(params);
        await command.execute();

        expect(mockOnCreate).toHaveBeenCalledWith('encounter-1', {
            name: 'Test',
            type: 'FogOfWar',
            vertices: region.vertices,
            value: 1,
        });
        expect(mockOnRefetch).toHaveBeenCalled();
    });

    it('should include optional properties when present', async () => {
        const region = createMockEncounterRegion({
            name: 'Labeled',
            value: 2,
            label: 'Custom Label',
            color: '#ff0000',
        });
        const params: CreateRegionCommandParams = {
            encounterId: 'encounter-1',
            region,
            onCreate: mockOnCreate,
            onRemove: mockOnRemove,
            onRefetch: mockOnRefetch,
        };

        const command = new CreateRegionCommand(params);
        await command.execute();

        expect(mockOnCreate).toHaveBeenCalledWith('encounter-1', expect.objectContaining({
            label: 'Custom Label',
            color: '#ff0000',
        }));
    });

    it('should call onRemove with region index on undo', async () => {
        const region = createMockEncounterRegion({ index: 7 });
        const params: CreateRegionCommandParams = {
            encounterId: 'encounter-1',
            region,
            onCreate: mockOnCreate,
            onRemove: mockOnRemove,
            onRefetch: mockOnRefetch,
        };

        const command = new CreateRegionCommand(params);
        await command.execute();
        await command.undo();

        expect(mockOnRemove).toHaveBeenCalledWith('encounter-1', 7);
        expect(mockOnRefetch).toHaveBeenCalledTimes(2);
    });

    it('should re-create region on redo', async () => {
        const region = createMockEncounterRegion({ name: 'Redo Test' });
        const params: CreateRegionCommandParams = {
            encounterId: 'encounter-1',
            region,
            onCreate: mockOnCreate,
            onRemove: mockOnRemove,
            onRefetch: mockOnRefetch,
        };

        const command = new CreateRegionCommand(params);
        await command.execute();
        await command.undo();

        mockOnCreate.mockClear();
        await command.redo();

        expect(mockOnCreate).toHaveBeenCalledWith('encounter-1', expect.objectContaining({
            name: 'Redo Test',
            type: 'FogOfWar',
        }));
    });

    it('should handle region without optional properties', async () => {
        const region: EncounterRegion = {
            encounterId: 'encounter-1',
            index: 0,
            type: 'Zone',
            name: 'Minimal',
            vertices: [{ x: 0, y: 0 }],
        };
        const params: CreateRegionCommandParams = {
            encounterId: 'encounter-1',
            region,
            onCreate: mockOnCreate,
            onRemove: mockOnRemove,
            onRefetch: mockOnRefetch,
        };

        const command = new CreateRegionCommand(params);
        await command.execute();

        expect(mockOnCreate).toHaveBeenCalledWith('encounter-1', {
            name: 'Minimal',
            type: 'Zone',
            vertices: [{ x: 0, y: 0 }],
        });
    });
});

describe('EditRegionCommand', () => {
    let mockOnUpdate: ReturnType<typeof vi.fn<OnUpdateFn>>;
    let mockOnRefetch: ReturnType<typeof vi.fn<OnRefetchFn>>;

    beforeEach(() => {
        mockOnUpdate = vi.fn<OnUpdateFn>().mockResolvedValue(undefined);
        mockOnRefetch = vi.fn<OnRefetchFn>().mockResolvedValue(undefined);
    });

    it('should set description property correctly', () => {
        const oldRegion = createMockEncounterRegion({ name: 'Old' });
        const newRegion = createMockEncounterRegion({ name: 'New' });
        const params: EditRegionCommandParams = {
            encounterId: 'encounter-1',
            regionIndex: 5,
            oldRegion,
            newRegion,
            onUpdate: mockOnUpdate,
            onRefetch: mockOnRefetch,
        };

        const command = new EditRegionCommand(params);

        expect(command.description).toBe('Edit region "New"');
    });

    it('should call onUpdate with new region data on execute', async () => {
        const oldRegion = createMockEncounterRegion({ name: 'Old' });
        const newRegion = createMockEncounterRegion({
            name: 'New',
            vertices: [{ x: 50, y: 50 }],
            value: 3,
        });
        const params: EditRegionCommandParams = {
            encounterId: 'encounter-1',
            regionIndex: 5,
            oldRegion,
            newRegion,
            onUpdate: mockOnUpdate,
            onRefetch: mockOnRefetch,
        };

        const command = new EditRegionCommand(params);
        await command.execute();

        expect(mockOnUpdate).toHaveBeenCalledWith('encounter-1', 5, {
            name: 'New',
            type: 'FogOfWar',
            vertices: [{ x: 50, y: 50 }],
            value: 3,
        });
        expect(mockOnRefetch).toHaveBeenCalled();
    });

    it('should call onUpdate with old region data on undo', async () => {
        const oldRegion = createMockEncounterRegion({
            name: 'Old',
            value: 1,
            label: 'Old Label',
        });
        const newRegion = createMockEncounterRegion({ name: 'New', value: 2 });
        const params: EditRegionCommandParams = {
            encounterId: 'encounter-1',
            regionIndex: 5,
            oldRegion,
            newRegion,
            onUpdate: mockOnUpdate,
            onRefetch: mockOnRefetch,
        };

        const command = new EditRegionCommand(params);
        await command.execute();
        await command.undo();

        expect(mockOnUpdate).toHaveBeenLastCalledWith('encounter-1', 5, {
            name: 'Old',
            type: 'FogOfWar',
            vertices: oldRegion.vertices,
            value: 1,
            label: 'Old Label',
        });
    });

    it('should call onUpdate with new region data on redo', async () => {
        const oldRegion = createMockEncounterRegion({ name: 'Old' });
        const newRegion = createMockEncounterRegion({ name: 'New', color: '#00ff00' });
        const params: EditRegionCommandParams = {
            encounterId: 'encounter-1',
            regionIndex: 5,
            oldRegion,
            newRegion,
            onUpdate: mockOnUpdate,
            onRefetch: mockOnRefetch,
        };

        const command = new EditRegionCommand(params);
        await command.execute();
        await command.undo();

        mockOnUpdate.mockClear();
        await command.redo();

        expect(mockOnUpdate).toHaveBeenCalledWith('encounter-1', 5, expect.objectContaining({
            name: 'New',
            color: '#00ff00',
        }));
    });

    it('should handle undefined encounterId', async () => {
        const oldRegion = createMockEncounterRegion();
        const newRegion = createMockEncounterRegion({ name: 'Updated' });
        const params: EditRegionCommandParams = {
            encounterId: undefined,
            regionIndex: 5,
            oldRegion,
            newRegion,
            onUpdate: mockOnUpdate,
            onRefetch: mockOnRefetch,
        };

        const command = new EditRegionCommand(params);
        await command.execute();

        expect(mockOnUpdate).toHaveBeenCalledWith(undefined, 5, expect.any(Object));
    });

    it('should include optional properties when present in new region', async () => {
        const oldRegion = createMockEncounterRegion();
        const newRegion = createMockEncounterRegion({
            value: 5,
            label: 'New Label',
            color: '#0000ff',
        });
        const params: EditRegionCommandParams = {
            encounterId: 'encounter-1',
            regionIndex: 5,
            oldRegion,
            newRegion,
            onUpdate: mockOnUpdate,
            onRefetch: mockOnRefetch,
        };

        const command = new EditRegionCommand(params);
        await command.execute();

        expect(mockOnUpdate).toHaveBeenCalledWith('encounter-1', 5, expect.objectContaining({
            value: 5,
            label: 'New Label',
            color: '#0000ff',
        }));
    });
});

describe('DeleteRegionCommand', () => {
    let mockOnAdd: ReturnType<typeof vi.fn<OnAddFn>>;
    let mockOnRemove: ReturnType<typeof vi.fn<OnRemoveFn>>;
    let mockOnRefetch: ReturnType<typeof vi.fn<OnRefetchFn>>;

    beforeEach(() => {
        mockOnAdd = vi.fn<OnAddFn>().mockResolvedValue({ index: 15 });
        mockOnRemove = vi.fn<OnRemoveFn>().mockResolvedValue(undefined);
        mockOnRefetch = vi.fn<OnRefetchFn>().mockResolvedValue(undefined);
    });

    it('should set description property correctly', () => {
        const region = createMockEncounterRegion({ name: 'Delete Me' });
        const params: DeleteRegionCommandParams = {
            encounterId: 'encounter-1',
            regionIndex: 5,
            region,
            onAdd: mockOnAdd,
            onRemove: mockOnRemove,
            onRefetch: mockOnRefetch,
        };

        const command = new DeleteRegionCommand(params);

        expect(command.description).toBe('Delete region "Delete Me"');
    });

    it('should call onRemove on execute', async () => {
        const region = createMockEncounterRegion();
        const params: DeleteRegionCommandParams = {
            encounterId: 'encounter-1',
            regionIndex: 5,
            region,
            onAdd: mockOnAdd,
            onRemove: mockOnRemove,
            onRefetch: mockOnRefetch,
        };

        const command = new DeleteRegionCommand(params);
        await command.execute();

        expect(mockOnRemove).toHaveBeenCalledWith('encounter-1', 5);
        expect(mockOnRefetch).toHaveBeenCalled();
    });

    it('should restore region on undo', async () => {
        const region = createMockEncounterRegion({
            name: 'Restore Me',
            value: 2,
            label: 'Label',
            color: '#ffffff',
        });
        const params: DeleteRegionCommandParams = {
            encounterId: 'encounter-1',
            regionIndex: 5,
            region,
            onAdd: mockOnAdd,
            onRemove: mockOnRemove,
            onRefetch: mockOnRefetch,
        };

        const command = new DeleteRegionCommand(params);
        await command.execute();
        await command.undo();

        expect(mockOnAdd).toHaveBeenCalledWith('encounter-1', {
            name: 'Restore Me',
            type: 'FogOfWar',
            vertices: region.vertices,
            value: 2,
            label: 'Label',
            color: '#ffffff',
        });
    });

    it('should store restored index after undo', async () => {
        const region = createMockEncounterRegion();
        mockOnAdd.mockResolvedValue({ index: 42 });

        const params: DeleteRegionCommandParams = {
            encounterId: 'encounter-1',
            regionIndex: 5,
            region,
            onAdd: mockOnAdd,
            onRemove: mockOnRemove,
            onRefetch: mockOnRefetch,
        };

        const command = new DeleteRegionCommand(params);
        await command.execute();
        await command.undo();

        mockOnRemove.mockClear();
        await command.redo();

        expect(mockOnRemove).toHaveBeenCalledWith('encounter-1', 42);
    });

    it('should delete restored region on redo', async () => {
        const region = createMockEncounterRegion();
        mockOnAdd.mockResolvedValue({ index: 20 });

        const params: DeleteRegionCommandParams = {
            encounterId: 'encounter-1',
            regionIndex: 5,
            region,
            onAdd: mockOnAdd,
            onRemove: mockOnRemove,
            onRefetch: mockOnRefetch,
        };

        const command = new DeleteRegionCommand(params);
        await command.execute();
        await command.undo();

        mockOnRemove.mockClear();
        await command.redo();

        expect(mockOnRemove).toHaveBeenCalledWith('encounter-1', 20);
        expect(mockOnRefetch).toHaveBeenCalledTimes(3);
    });

    it('should not call onRemove on redo if undo was never called', async () => {
        const region = createMockEncounterRegion();
        const params: DeleteRegionCommandParams = {
            encounterId: 'encounter-1',
            regionIndex: 5,
            region,
            onAdd: mockOnAdd,
            onRemove: mockOnRemove,
            onRefetch: mockOnRefetch,
        };

        const command = new DeleteRegionCommand(params);
        await command.execute();

        mockOnRemove.mockClear();
        mockOnRefetch.mockClear();
        await command.redo();

        expect(mockOnRemove).not.toHaveBeenCalled();
        expect(mockOnRefetch).not.toHaveBeenCalled();
    });

    it('should handle region without optional properties', async () => {
        const region: EncounterRegion = {
            encounterId: 'encounter-1',
            index: 0,
            type: 'Zone',
            name: 'Minimal',
            vertices: [{ x: 0, y: 0 }],
        };
        const params: DeleteRegionCommandParams = {
            encounterId: 'encounter-1',
            regionIndex: 0,
            region,
            onAdd: mockOnAdd,
            onRemove: mockOnRemove,
            onRefetch: mockOnRefetch,
        };

        const command = new DeleteRegionCommand(params);
        await command.execute();
        await command.undo();

        expect(mockOnAdd).toHaveBeenCalledWith('encounter-1', {
            name: 'Minimal',
            type: 'Zone',
            vertices: [{ x: 0, y: 0 }],
        });
    });
});
