import { beforeEach, describe, expect, it, vi } from 'vitest';
import type { EncounterLightSource } from '@/types/domain';
import type { StageSound, ResourceMetadata } from '@/types/stage';
import { LightSourceType } from '@/types/domain';
import {
    CreateLightSourceCommand,
    CreateSoundSourceCommand,
    DeleteLightSourceCommand,
    DeleteSoundSourceCommand,
    UpdateLightSourceCommand,
    UpdateSoundSourceCommand,
    type CreateLightSourceCommandParams,
    type CreateSoundSourceCommandParams,
    type DeleteLightSourceCommandParams,
    type DeleteSoundSourceCommandParams,
    type UpdateLightSourceCommandParams,
    type UpdateSoundSourceCommandParams,
} from './sourceCommands';

const createMockLightSource = (overrides: Partial<EncounterLightSource> = {}): EncounterLightSource => ({
    index: 1,
    type: LightSourceType.Natural,
    position: { x: 100, y: 100 },
    range: 50,
    isOn: true,
    ...overrides,
});

const createMockResourceMetadata = (): ResourceMetadata => ({
    id: 'media-1',
    contentType: 'audio/mp3',
    path: '/sounds/ambient.mp3',
    fileName: 'ambient.mp3',
    fileSize: 1024000,
    dimensions: { width: 0, height: 0 },
    duration: '00:03:30',
});

const createMockSoundSource = (overrides: Partial<StageSound> = {}): StageSound => ({
    index: 1,
    position: { x: 200, y: 200 },
    radius: 100,
    volume: 0.8,
    isPlaying: true,
    media: createMockResourceMetadata(),
    loop: true,
    ...overrides,
});

describe('CreateLightSourceCommand', () => {
    let mockOnCreate: ReturnType<typeof vi.fn>;
    let mockOnRemove: ReturnType<typeof vi.fn>;
    let mockOnRefetch: ReturnType<typeof vi.fn>;

    beforeEach(() => {
        mockOnCreate = vi.fn().mockResolvedValue(createMockLightSource({ index: 10 }));
        mockOnRemove = vi.fn().mockResolvedValue(undefined);
        mockOnRefetch = vi.fn().mockResolvedValue(undefined);
    });

    it('should set description with source name', () => {
        const source = createMockLightSource({ name: 'Torch' });
        const params: CreateLightSourceCommandParams = {
            encounterId: 'encounter-1',
            source,
            onCreate: mockOnCreate,
            onRemove: mockOnRemove,
            onRefetch: mockOnRefetch,
        };

        const command = new CreateLightSourceCommand(params);

        expect(command.description).toBe('Create light source "Torch"');
    });

    it('should set description to Unnamed when name is undefined', () => {
        const source = createMockLightSource({ name: undefined });
        const params: CreateLightSourceCommandParams = {
            encounterId: 'encounter-1',
            source,
            onCreate: mockOnCreate,
            onRemove: mockOnRemove,
            onRefetch: mockOnRefetch,
        };

        const command = new CreateLightSourceCommand(params);

        expect(command.description).toBe('Create light source "Unnamed"');
    });

    it('should call onCreate with required fields on execute', async () => {
        const source = createMockLightSource();
        const params: CreateLightSourceCommandParams = {
            encounterId: 'encounter-1',
            source,
            onCreate: mockOnCreate,
            onRemove: mockOnRemove,
            onRefetch: mockOnRefetch,
        };

        const command = new CreateLightSourceCommand(params);
        await command.execute();

        expect(mockOnCreate).toHaveBeenCalledWith('encounter-1', {
            type: LightSourceType.Natural,
            position: { x: 100, y: 100 },
            range: 50,
            isOn: true,
        });
        expect(mockOnRefetch).toHaveBeenCalled();
    });

    it('should include optional fields when present', async () => {
        const source = createMockLightSource({
            name: 'Spotlight',
            direction: 45,
            arc: 90,
            color: '#ffff00',
        });
        const params: CreateLightSourceCommandParams = {
            encounterId: 'encounter-1',
            source,
            onCreate: mockOnCreate,
            onRemove: mockOnRemove,
            onRefetch: mockOnRefetch,
        };

        const command = new CreateLightSourceCommand(params);
        await command.execute();

        expect(mockOnCreate).toHaveBeenCalledWith('encounter-1', expect.objectContaining({
            name: 'Spotlight',
            direction: 45,
            arc: 90,
            color: '#ffff00',
        }));
    });

    it('should call onRemove with source index on undo', async () => {
        const source = createMockLightSource({ index: 7 });
        const params: CreateLightSourceCommandParams = {
            encounterId: 'encounter-1',
            source,
            onCreate: mockOnCreate,
            onRemove: mockOnRemove,
            onRefetch: mockOnRefetch,
        };

        const command = new CreateLightSourceCommand(params);
        await command.execute();
        await command.undo();

        expect(mockOnRemove).toHaveBeenCalledWith('encounter-1', 7);
        expect(mockOnRefetch).toHaveBeenCalledTimes(2);
    });

    it('should re-create source on redo', async () => {
        const source = createMockLightSource({ name: 'Redo Light' });
        const params: CreateLightSourceCommandParams = {
            encounterId: 'encounter-1',
            source,
            onCreate: mockOnCreate,
            onRemove: mockOnRemove,
            onRefetch: mockOnRefetch,
        };

        const command = new CreateLightSourceCommand(params);
        await command.execute();
        await command.undo();

        mockOnCreate.mockClear();
        await command.redo();

        expect(mockOnCreate).toHaveBeenCalledWith('encounter-1', expect.objectContaining({
            type: LightSourceType.Natural,
            position: { x: 100, y: 100 },
        }));
    });
});

describe('UpdateLightSourceCommand', () => {
    let mockOnUpdate: ReturnType<typeof vi.fn>;
    let mockOnRefetch: ReturnType<typeof vi.fn>;

    beforeEach(() => {
        mockOnUpdate = vi.fn().mockResolvedValue(undefined);
        mockOnRefetch = vi.fn().mockResolvedValue(undefined);
    });

    it('should set description with new source name', () => {
        const oldSource = createMockLightSource({ name: 'Old' });
        const newSource = createMockLightSource({ name: 'New' });
        const params: UpdateLightSourceCommandParams = {
            encounterId: 'encounter-1',
            sourceIndex: 5,
            oldSource,
            newSource,
            onUpdate: mockOnUpdate,
            onRefetch: mockOnRefetch,
        };

        const command = new UpdateLightSourceCommand(params);

        expect(command.description).toBe('Update light source "New"');
    });

    it('should call onUpdate with new source data on execute', async () => {
        const oldSource = createMockLightSource();
        const newSource = createMockLightSource({
            type: LightSourceType.Artificial,
            range: 100,
            isOn: false,
        });
        const params: UpdateLightSourceCommandParams = {
            encounterId: 'encounter-1',
            sourceIndex: 5,
            oldSource,
            newSource,
            onUpdate: mockOnUpdate,
            onRefetch: mockOnRefetch,
        };

        const command = new UpdateLightSourceCommand(params);
        await command.execute();

        expect(mockOnUpdate).toHaveBeenCalledWith('encounter-1', 5, {
            type: LightSourceType.Artificial,
            position: newSource.position,
            range: 100,
            isOn: false,
        });
        expect(mockOnRefetch).toHaveBeenCalled();
    });

    it('should call onUpdate with old source data on undo', async () => {
        const oldSource = createMockLightSource({
            name: 'Original',
            range: 25,
            direction: 180,
        });
        const newSource = createMockLightSource({ name: 'Updated', range: 75 });
        const params: UpdateLightSourceCommandParams = {
            encounterId: 'encounter-1',
            sourceIndex: 5,
            oldSource,
            newSource,
            onUpdate: mockOnUpdate,
            onRefetch: mockOnRefetch,
        };

        const command = new UpdateLightSourceCommand(params);
        await command.execute();
        await command.undo();

        expect(mockOnUpdate).toHaveBeenLastCalledWith('encounter-1', 5, expect.objectContaining({
            name: 'Original',
            range: 25,
            direction: 180,
        }));
    });

    it('should call onUpdate with new source data on redo', async () => {
        const oldSource = createMockLightSource();
        const newSource = createMockLightSource({ color: '#ff0000' });
        const params: UpdateLightSourceCommandParams = {
            encounterId: 'encounter-1',
            sourceIndex: 5,
            oldSource,
            newSource,
            onUpdate: mockOnUpdate,
            onRefetch: mockOnRefetch,
        };

        const command = new UpdateLightSourceCommand(params);
        await command.execute();
        await command.undo();

        mockOnUpdate.mockClear();
        await command.redo();

        expect(mockOnUpdate).toHaveBeenCalledWith('encounter-1', 5, expect.objectContaining({
            color: '#ff0000',
        }));
    });

    it('should include all optional properties when present', async () => {
        const oldSource = createMockLightSource();
        const newSource = createMockLightSource({
            name: 'Full',
            direction: 90,
            arc: 45,
            color: '#00ff00',
        });
        const params: UpdateLightSourceCommandParams = {
            encounterId: 'encounter-1',
            sourceIndex: 5,
            oldSource,
            newSource,
            onUpdate: mockOnUpdate,
            onRefetch: mockOnRefetch,
        };

        const command = new UpdateLightSourceCommand(params);
        await command.execute();

        expect(mockOnUpdate).toHaveBeenCalledWith('encounter-1', 5, expect.objectContaining({
            name: 'Full',
            direction: 90,
            arc: 45,
            color: '#00ff00',
        }));
    });
});

describe('DeleteLightSourceCommand', () => {
    let mockOnAdd: ReturnType<typeof vi.fn>;
    let mockOnRemove: ReturnType<typeof vi.fn>;
    let mockOnRefetch: ReturnType<typeof vi.fn>;

    beforeEach(() => {
        mockOnAdd = vi.fn().mockResolvedValue(createMockLightSource({ index: 15 }));
        mockOnRemove = vi.fn().mockResolvedValue(undefined);
        mockOnRefetch = vi.fn().mockResolvedValue(undefined);
    });

    it('should set description with source name', () => {
        const source = createMockLightSource({ name: 'Delete Me' });
        const params: DeleteLightSourceCommandParams = {
            encounterId: 'encounter-1',
            sourceIndex: 5,
            source,
            onAdd: mockOnAdd,
            onRemove: mockOnRemove,
            onRefetch: mockOnRefetch,
        };

        const command = new DeleteLightSourceCommand(params);

        expect(command.description).toBe('Delete light source "Delete Me"');
    });

    it('should call onRemove on execute', async () => {
        const source = createMockLightSource();
        const params: DeleteLightSourceCommandParams = {
            encounterId: 'encounter-1',
            sourceIndex: 5,
            source,
            onAdd: mockOnAdd,
            onRemove: mockOnRemove,
            onRefetch: mockOnRefetch,
        };

        const command = new DeleteLightSourceCommand(params);
        await command.execute();

        expect(mockOnRemove).toHaveBeenCalledWith('encounter-1', 5);
        expect(mockOnRefetch).toHaveBeenCalled();
    });

    it('should restore source on undo', async () => {
        const source = createMockLightSource({
            name: 'Restore',
            direction: 45,
            arc: 90,
            color: '#ffffff',
        });
        const params: DeleteLightSourceCommandParams = {
            encounterId: 'encounter-1',
            sourceIndex: 5,
            source,
            onAdd: mockOnAdd,
            onRemove: mockOnRemove,
            onRefetch: mockOnRefetch,
        };

        const command = new DeleteLightSourceCommand(params);
        await command.execute();
        await command.undo();

        expect(mockOnAdd).toHaveBeenCalledWith('encounter-1', expect.objectContaining({
            name: 'Restore',
            direction: 45,
            arc: 90,
            color: '#ffffff',
        }));
    });

    it('should store restored index and use it on redo', async () => {
        const source = createMockLightSource();
        mockOnAdd.mockResolvedValue(createMockLightSource({ index: 42 }));

        const params: DeleteLightSourceCommandParams = {
            encounterId: 'encounter-1',
            sourceIndex: 5,
            source,
            onAdd: mockOnAdd,
            onRemove: mockOnRemove,
            onRefetch: mockOnRefetch,
        };

        const command = new DeleteLightSourceCommand(params);
        await command.execute();
        await command.undo();

        mockOnRemove.mockClear();
        await command.redo();

        expect(mockOnRemove).toHaveBeenCalledWith('encounter-1', 42);
    });

    it('should not call onRemove on redo if undo was never called', async () => {
        const source = createMockLightSource();
        const params: DeleteLightSourceCommandParams = {
            encounterId: 'encounter-1',
            sourceIndex: 5,
            source,
            onAdd: mockOnAdd,
            onRemove: mockOnRemove,
            onRefetch: mockOnRefetch,
        };

        const command = new DeleteLightSourceCommand(params);
        await command.execute();

        mockOnRemove.mockClear();
        mockOnRefetch.mockClear();
        await command.redo();

        expect(mockOnRemove).not.toHaveBeenCalled();
        expect(mockOnRefetch).not.toHaveBeenCalled();
    });
});

describe('CreateSoundSourceCommand', () => {
    let mockOnCreate: ReturnType<typeof vi.fn>;
    let mockOnRemove: ReturnType<typeof vi.fn>;
    let mockOnRefetch: ReturnType<typeof vi.fn>;

    beforeEach(() => {
        mockOnCreate = vi.fn().mockResolvedValue(createMockSoundSource({ index: 10 }));
        mockOnRemove = vi.fn().mockResolvedValue(undefined);
        mockOnRefetch = vi.fn().mockResolvedValue(undefined);
    });

    it('should set description with source name', () => {
        const source = createMockSoundSource({ name: 'Ambient Rain' });
        const params: CreateSoundSourceCommandParams = {
            encounterId: 'encounter-1',
            source,
            onCreate: mockOnCreate,
            onRemove: mockOnRemove,
            onRefetch: mockOnRefetch,
        };

        const command = new CreateSoundSourceCommand(params);

        expect(command.description).toBe('Create sound source "Ambient Rain"');
    });

    it('should set description to Unnamed when name is undefined', () => {
        const source = createMockSoundSource({ name: undefined });
        const params: CreateSoundSourceCommandParams = {
            encounterId: 'encounter-1',
            source,
            onCreate: mockOnCreate,
            onRemove: mockOnRemove,
            onRefetch: mockOnRefetch,
        };

        const command = new CreateSoundSourceCommand(params);

        expect(command.description).toBe('Create sound source "Unnamed"');
    });

    it('should call onCreate with required fields on execute', async () => {
        const source = createMockSoundSource();
        const params: CreateSoundSourceCommandParams = {
            encounterId: 'encounter-1',
            source,
            onCreate: mockOnCreate,
            onRemove: mockOnRemove,
            onRefetch: mockOnRefetch,
        };

        const command = new CreateSoundSourceCommand(params);
        await command.execute();

        expect(mockOnCreate).toHaveBeenCalledWith('encounter-1', {
            position: source.position,
            radius: 100,
            volume: 0.8,
            isPlaying: true,
            media: source.media,
            loop: true,
        });
        expect(mockOnRefetch).toHaveBeenCalled();
    });

    it('should include name when present', async () => {
        const source = createMockSoundSource({ name: 'Battle Music' });
        const params: CreateSoundSourceCommandParams = {
            encounterId: 'encounter-1',
            source,
            onCreate: mockOnCreate,
            onRemove: mockOnRemove,
            onRefetch: mockOnRefetch,
        };

        const command = new CreateSoundSourceCommand(params);
        await command.execute();

        expect(mockOnCreate).toHaveBeenCalledWith('encounter-1', expect.objectContaining({
            name: 'Battle Music',
        }));
    });

    it('should call onRemove with source index on undo', async () => {
        const source = createMockSoundSource({ index: 7 });
        const params: CreateSoundSourceCommandParams = {
            encounterId: 'encounter-1',
            source,
            onCreate: mockOnCreate,
            onRemove: mockOnRemove,
            onRefetch: mockOnRefetch,
        };

        const command = new CreateSoundSourceCommand(params);
        await command.execute();
        await command.undo();

        expect(mockOnRemove).toHaveBeenCalledWith('encounter-1', 7);
        expect(mockOnRefetch).toHaveBeenCalledTimes(2);
    });

    it('should re-create source on redo', async () => {
        const source = createMockSoundSource({ name: 'Redo Sound' });
        const params: CreateSoundSourceCommandParams = {
            encounterId: 'encounter-1',
            source,
            onCreate: mockOnCreate,
            onRemove: mockOnRemove,
            onRefetch: mockOnRefetch,
        };

        const command = new CreateSoundSourceCommand(params);
        await command.execute();
        await command.undo();

        mockOnCreate.mockClear();
        await command.redo();

        expect(mockOnCreate).toHaveBeenCalledWith('encounter-1', expect.objectContaining({
            position: source.position,
            radius: 100,
        }));
    });
});

describe('UpdateSoundSourceCommand', () => {
    let mockOnUpdate: ReturnType<typeof vi.fn>;
    let mockOnRefetch: ReturnType<typeof vi.fn>;

    beforeEach(() => {
        mockOnUpdate = vi.fn().mockResolvedValue(undefined);
        mockOnRefetch = vi.fn().mockResolvedValue(undefined);
    });

    it('should set description with new source name', () => {
        const oldSource = createMockSoundSource({ name: 'Old Sound' });
        const newSource = createMockSoundSource({ name: 'New Sound' });
        const params: UpdateSoundSourceCommandParams = {
            encounterId: 'encounter-1',
            sourceIndex: 5,
            oldSource,
            newSource,
            onUpdate: mockOnUpdate,
            onRefetch: mockOnRefetch,
        };

        const command = new UpdateSoundSourceCommand(params);

        expect(command.description).toBe('Update sound source "New Sound"');
    });

    it('should call onUpdate with new source data on execute', async () => {
        const oldSource = createMockSoundSource();
        const newSource = createMockSoundSource({
            volume: 0.5,
            radius: 200,
            isPlaying: false,
            loop: false,
        });
        const params: UpdateSoundSourceCommandParams = {
            encounterId: 'encounter-1',
            sourceIndex: 5,
            oldSource,
            newSource,
            onUpdate: mockOnUpdate,
            onRefetch: mockOnRefetch,
        };

        const command = new UpdateSoundSourceCommand(params);
        await command.execute();

        expect(mockOnUpdate).toHaveBeenCalledWith('encounter-1', 5, {
            position: newSource.position,
            radius: 200,
            volume: 0.5,
            isPlaying: false,
            media: newSource.media,
            loop: false,
        });
        expect(mockOnRefetch).toHaveBeenCalled();
    });

    it('should call onUpdate with old source data on undo', async () => {
        const oldSource = createMockSoundSource({ name: 'Original', volume: 1.0 });
        const newSource = createMockSoundSource({ name: 'Updated', volume: 0.3 });
        const params: UpdateSoundSourceCommandParams = {
            encounterId: 'encounter-1',
            sourceIndex: 5,
            oldSource,
            newSource,
            onUpdate: mockOnUpdate,
            onRefetch: mockOnRefetch,
        };

        const command = new UpdateSoundSourceCommand(params);
        await command.execute();
        await command.undo();

        expect(mockOnUpdate).toHaveBeenLastCalledWith('encounter-1', 5, expect.objectContaining({
            name: 'Original',
            volume: 1.0,
        }));
    });

    it('should call onUpdate with new source data on redo', async () => {
        const oldSource = createMockSoundSource();
        const newSource = createMockSoundSource({ name: 'Redo Test' });
        const params: UpdateSoundSourceCommandParams = {
            encounterId: 'encounter-1',
            sourceIndex: 5,
            oldSource,
            newSource,
            onUpdate: mockOnUpdate,
            onRefetch: mockOnRefetch,
        };

        const command = new UpdateSoundSourceCommand(params);
        await command.execute();
        await command.undo();

        mockOnUpdate.mockClear();
        await command.redo();

        expect(mockOnUpdate).toHaveBeenCalledWith('encounter-1', 5, expect.objectContaining({
            name: 'Redo Test',
        }));
    });
});

describe('DeleteSoundSourceCommand', () => {
    let mockOnAdd: ReturnType<typeof vi.fn>;
    let mockOnRemove: ReturnType<typeof vi.fn>;
    let mockOnRefetch: ReturnType<typeof vi.fn>;

    beforeEach(() => {
        mockOnAdd = vi.fn().mockResolvedValue(createMockSoundSource({ index: 15 }));
        mockOnRemove = vi.fn().mockResolvedValue(undefined);
        mockOnRefetch = vi.fn().mockResolvedValue(undefined);
    });

    it('should set description with source name', () => {
        const source = createMockSoundSource({ name: 'Delete Me' });
        const params: DeleteSoundSourceCommandParams = {
            encounterId: 'encounter-1',
            sourceIndex: 5,
            source,
            onAdd: mockOnAdd,
            onRemove: mockOnRemove,
            onRefetch: mockOnRefetch,
        };

        const command = new DeleteSoundSourceCommand(params);

        expect(command.description).toBe('Delete sound source "Delete Me"');
    });

    it('should call onRemove on execute', async () => {
        const source = createMockSoundSource();
        const params: DeleteSoundSourceCommandParams = {
            encounterId: 'encounter-1',
            sourceIndex: 5,
            source,
            onAdd: mockOnAdd,
            onRemove: mockOnRemove,
            onRefetch: mockOnRefetch,
        };

        const command = new DeleteSoundSourceCommand(params);
        await command.execute();

        expect(mockOnRemove).toHaveBeenCalledWith('encounter-1', 5);
        expect(mockOnRefetch).toHaveBeenCalled();
    });

    it('should restore source on undo', async () => {
        const source = createMockSoundSource({ name: 'Restore Me', volume: 0.7 });
        const params: DeleteSoundSourceCommandParams = {
            encounterId: 'encounter-1',
            sourceIndex: 5,
            source,
            onAdd: mockOnAdd,
            onRemove: mockOnRemove,
            onRefetch: mockOnRefetch,
        };

        const command = new DeleteSoundSourceCommand(params);
        await command.execute();
        await command.undo();

        expect(mockOnAdd).toHaveBeenCalledWith('encounter-1', expect.objectContaining({
            name: 'Restore Me',
            volume: 0.7,
        }));
    });

    it('should store restored index and use it on redo', async () => {
        const source = createMockSoundSource();
        mockOnAdd.mockResolvedValue(createMockSoundSource({ index: 42 }));

        const params: DeleteSoundSourceCommandParams = {
            encounterId: 'encounter-1',
            sourceIndex: 5,
            source,
            onAdd: mockOnAdd,
            onRemove: mockOnRemove,
            onRefetch: mockOnRefetch,
        };

        const command = new DeleteSoundSourceCommand(params);
        await command.execute();
        await command.undo();

        mockOnRemove.mockClear();
        await command.redo();

        expect(mockOnRemove).toHaveBeenCalledWith('encounter-1', 42);
    });

    it('should not call onRemove on redo if undo was never called', async () => {
        const source = createMockSoundSource();
        const params: DeleteSoundSourceCommandParams = {
            encounterId: 'encounter-1',
            sourceIndex: 5,
            source,
            onAdd: mockOnAdd,
            onRemove: mockOnRemove,
            onRefetch: mockOnRefetch,
        };

        const command = new DeleteSoundSourceCommand(params);
        await command.execute();

        mockOnRemove.mockClear();
        mockOnRefetch.mockClear();
        await command.redo();

        expect(mockOnRemove).not.toHaveBeenCalled();
        expect(mockOnRefetch).not.toHaveBeenCalled();
    });
});
