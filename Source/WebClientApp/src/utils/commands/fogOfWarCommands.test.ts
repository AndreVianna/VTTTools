import { beforeEach, describe, expect, it, vi } from 'vitest';
import type { EncounterRegion, PlacedRegion } from '@/types/domain';
import {
  CreateFogOfWarRegionCommand,
  DeleteFogOfWarRegionCommand,
  RevealAllFogOfWarCommand,
  type CreateFogOfWarRegionCommandParams,
  type DeleteFogOfWarRegionCommandParams,
  type RevealAllFogOfWarCommandParams,
} from './fogOfWarCommands';

const createMockPlacedRegion = (name: string, value: number): PlacedRegion => ({
  id: `region-${name}`,
  encounterId: 'encounter-1',
  index: 0,
  type: 'FogOfWar',
  name,
  label: 'Hidden',
  value,
  vertices: [
    { x: 0, y: 0 },
    { x: 100, y: 0 },
    { x: 100, y: 100 },
  ],
});

const createMockEncounterRegion = (name: string, index: number, value: number): EncounterRegion => ({
  encounterId: 'encounter-1',
  index,
  type: 'FogOfWar',
  name,
  label: 'Hidden',
  value,
  vertices: [
    { x: 0, y: 0 },
    { x: 100, y: 0 },
    { x: 100, y: 100 },
  ],
});

describe('CreateFogOfWarRegionCommand', () => {
  let mockOnAdd: ReturnType<typeof vi.fn>;
  let mockOnRemove: ReturnType<typeof vi.fn>;
  let mockOnRefetch: ReturnType<typeof vi.fn>;

  beforeEach(() => {
    mockOnAdd = vi.fn().mockResolvedValue(createMockEncounterRegion('1', 5, 1));
    mockOnRemove = vi.fn().mockResolvedValue(undefined);
    mockOnRefetch = vi.fn().mockResolvedValue(undefined);
  });

  it('should set description property correctly', () => {
    const mockRegion = createMockPlacedRegion('1', 1);
    const params: CreateFogOfWarRegionCommandParams = {
      encounterId: 'encounter-1',
      region: mockRegion,
      onAdd: mockOnAdd,
      onRemove: mockOnRemove,
      onRefetch: mockOnRefetch,
    };

    const command = new CreateFogOfWarRegionCommand(params);

    expect(command.description).toBe('Create Fog of War region "1"');
  });

  it('should call onAdd with correct data on execute', async () => {
    const mockRegion = createMockPlacedRegion('1', 1);
    const params: CreateFogOfWarRegionCommandParams = {
      encounterId: 'encounter-1',
      region: mockRegion,
      onAdd: mockOnAdd,
      onRemove: mockOnRemove,
      onRefetch: mockOnRefetch,
    };

    const command = new CreateFogOfWarRegionCommand(params);
    await command.execute();

    expect(mockOnAdd).toHaveBeenCalledWith('encounter-1', {
      name: '1',
      type: 'FogOfWar',
      vertices: mockRegion.vertices,
      value: 1,
    });
    expect(mockOnRefetch).toHaveBeenCalled();
  });

  it('should store created index after execute', async () => {
    const mockRegion = createMockPlacedRegion('1', 1);
    mockOnAdd.mockResolvedValue(createMockEncounterRegion('1', 42, 1));

    const params: CreateFogOfWarRegionCommandParams = {
      encounterId: 'encounter-1',
      region: mockRegion,
      onAdd: mockOnAdd,
      onRemove: mockOnRemove,
      onRefetch: mockOnRefetch,
    };

    const command = new CreateFogOfWarRegionCommand(params);
    await command.execute();

    await command.undo();

    expect(mockOnRemove).toHaveBeenCalledWith('encounter-1', 42);
  });

  it('should call onRemove with stored index on undo', async () => {
    const mockRegion = createMockPlacedRegion('1', 1);
    const params: CreateFogOfWarRegionCommandParams = {
      encounterId: 'encounter-1',
      region: mockRegion,
      onAdd: mockOnAdd,
      onRemove: mockOnRemove,
      onRefetch: mockOnRefetch,
    };

    const command = new CreateFogOfWarRegionCommand(params);
    await command.execute();
    await command.undo();

    expect(mockOnRemove).toHaveBeenCalledWith('encounter-1', 5);
    expect(mockOnRefetch).toHaveBeenCalledTimes(2);
  });

  it('should re-create region on redo', async () => {
    const mockRegion = createMockPlacedRegion('1', 1);
    const params: CreateFogOfWarRegionCommandParams = {
      encounterId: 'encounter-1',
      region: mockRegion,
      onAdd: mockOnAdd,
      onRemove: mockOnRemove,
      onRefetch: mockOnRefetch,
    };

    const command = new CreateFogOfWarRegionCommand(params);
    await command.execute();
    await command.undo();

    mockOnAdd.mockClear();
    await command.redo();

    expect(mockOnAdd).toHaveBeenCalledWith('encounter-1', {
      name: '1',
      type: 'FogOfWar',
      vertices: mockRegion.vertices,
      value: 1,
    });
  });

  it('should handle regions without optional properties', async () => {
    const mockRegion: PlacedRegion = {
      id: 'region-test',
      encounterId: 'encounter-1',
      index: 0,
      type: 'FogOfWar',
      name: '1',
      label: 'Hidden',
      vertices: [
        { x: 0, y: 0 },
        { x: 100, y: 0 },
        { x: 100, y: 100 },
      ],
    };

    const params: CreateFogOfWarRegionCommandParams = {
      encounterId: 'encounter-1',
      region: mockRegion,
      onAdd: mockOnAdd,
      onRemove: mockOnRemove,
      onRefetch: mockOnRefetch,
    };

    const command = new CreateFogOfWarRegionCommand(params);
    await command.execute();

    expect(mockOnAdd).toHaveBeenCalledWith('encounter-1', expect.objectContaining({
      name: '1',
      type: 'FogOfWar',
      vertices: mockRegion.vertices,
    }));
  });
});

describe('DeleteFogOfWarRegionCommand', () => {
  let mockOnAdd: ReturnType<typeof vi.fn>;
  let mockOnRemove: ReturnType<typeof vi.fn>;
  let mockOnRefetch: ReturnType<typeof vi.fn>;

  beforeEach(() => {
    mockOnAdd = vi.fn().mockResolvedValue(createMockEncounterRegion('1', 10, 1));
    mockOnRemove = vi.fn().mockResolvedValue(undefined);
    mockOnRefetch = vi.fn().mockResolvedValue(undefined);
  });

  it('should set description property correctly', () => {
    const mockRegion = createMockEncounterRegion('1', 5, 1);
    const params: DeleteFogOfWarRegionCommandParams = {
      encounterId: 'encounter-1',
      regionIndex: 5,
      region: mockRegion,
      onAdd: mockOnAdd,
      onRemove: mockOnRemove,
      onRefetch: mockOnRefetch,
    };

    const command = new DeleteFogOfWarRegionCommand(params);

    expect(command.description).toBe('Delete Fog of War region "1"');
  });

  it('should call onRemove on execute', async () => {
    const mockRegion = createMockEncounterRegion('1', 5, 1);
    const params: DeleteFogOfWarRegionCommandParams = {
      encounterId: 'encounter-1',
      regionIndex: 5,
      region: mockRegion,
      onAdd: mockOnAdd,
      onRemove: mockOnRemove,
      onRefetch: mockOnRefetch,
    };

    const command = new DeleteFogOfWarRegionCommand(params);
    await command.execute();

    expect(mockOnRemove).toHaveBeenCalledWith('encounter-1', 5);
    expect(mockOnRefetch).toHaveBeenCalled();
  });

  it('should restore region on undo', async () => {
    const mockRegion = createMockEncounterRegion('1', 5, 1);
    const params: DeleteFogOfWarRegionCommandParams = {
      encounterId: 'encounter-1',
      regionIndex: 5,
      region: mockRegion,
      onAdd: mockOnAdd,
      onRemove: mockOnRemove,
      onRefetch: mockOnRefetch,
    };

    const command = new DeleteFogOfWarRegionCommand(params);
    await command.execute();
    await command.undo();

    expect(mockOnAdd).toHaveBeenCalledWith('encounter-1', {
      name: '1',
      type: 'FogOfWar',
      vertices: mockRegion.vertices,
      value: 1,
    });
  });

  it('should delete restored region on redo', async () => {
    const mockRegion = createMockEncounterRegion('1', 5, 1);
    const params: DeleteFogOfWarRegionCommandParams = {
      encounterId: 'encounter-1',
      regionIndex: 5,
      region: mockRegion,
      onAdd: mockOnAdd,
      onRemove: mockOnRemove,
      onRefetch: mockOnRefetch,
    };

    const command = new DeleteFogOfWarRegionCommand(params);
    await command.execute();
    await command.undo();

    mockOnRemove.mockClear();
    await command.redo();

    expect(mockOnRemove).toHaveBeenCalledWith('encounter-1', 10);
  });
});

describe('RevealAllFogOfWarCommand', () => {
  let mockOnAdd: ReturnType<typeof vi.fn>;
  let mockOnRemove: ReturnType<typeof vi.fn>;
  let mockOnRefetch: ReturnType<typeof vi.fn>;

  beforeEach(() => {
    mockOnAdd = vi.fn();
    mockOnRemove = vi.fn().mockResolvedValue(undefined);
    mockOnRefetch = vi.fn().mockResolvedValue(undefined);
  });

  it('should set description property correctly', () => {
    const params: RevealAllFogOfWarCommandParams = {
      encounterId: 'encounter-1',
      fogRegions: [],
      onAdd: mockOnAdd,
      onRemove: mockOnRemove,
      onRefetch: mockOnRefetch,
    };

    const command = new RevealAllFogOfWarCommand(params);

    expect(command.description).toBe('Reveal all Fog of War');
  });

  it('should remove all FoW regions on execute', async () => {
    const fogRegions = [
      createMockEncounterRegion('1', 1, 1),
      createMockEncounterRegion('1.1', 2, -1),
      createMockEncounterRegion('2', 3, 1),
    ];

    const params: RevealAllFogOfWarCommandParams = {
      encounterId: 'encounter-1',
      fogRegions,
      onAdd: mockOnAdd,
      onRemove: mockOnRemove,
      onRefetch: mockOnRefetch,
    };

    const command = new RevealAllFogOfWarCommand(params);
    await command.execute();

    expect(mockOnRemove).toHaveBeenCalledTimes(3);
    expect(mockOnRemove).toHaveBeenCalledWith('encounter-1', 1);
    expect(mockOnRemove).toHaveBeenCalledWith('encounter-1', 2);
    expect(mockOnRemove).toHaveBeenCalledWith('encounter-1', 3);
    expect(mockOnRefetch).toHaveBeenCalled();
  });

  it('should restore all regions on undo', async () => {
    const fogRegions = [
      createMockEncounterRegion('1', 1, 1),
      createMockEncounterRegion('2', 2, 1),
    ];

    mockOnAdd.mockResolvedValueOnce(createMockEncounterRegion('1', 10, 1));
    mockOnAdd.mockResolvedValueOnce(createMockEncounterRegion('2', 11, 1));

    const params: RevealAllFogOfWarCommandParams = {
      encounterId: 'encounter-1',
      fogRegions,
      onAdd: mockOnAdd,
      onRemove: mockOnRemove,
      onRefetch: mockOnRefetch,
    };

    const command = new RevealAllFogOfWarCommand(params);
    await command.execute();
    await command.undo();

    expect(mockOnAdd).toHaveBeenCalledTimes(2);
    expect(mockOnAdd).toHaveBeenCalledWith('encounter-1', expect.objectContaining({
      name: '1',
      type: 'FogOfWar',
    }));
    expect(mockOnAdd).toHaveBeenCalledWith('encounter-1', expect.objectContaining({
      name: '2',
      type: 'FogOfWar',
    }));
  });

  it('should remove restored regions on redo', async () => {
    const fogRegions = [
      createMockEncounterRegion('1', 1, 1),
      createMockEncounterRegion('2', 2, 1),
    ];

    mockOnAdd.mockResolvedValueOnce(createMockEncounterRegion('1', 10, 1));
    mockOnAdd.mockResolvedValueOnce(createMockEncounterRegion('2', 11, 1));

    const params: RevealAllFogOfWarCommandParams = {
      encounterId: 'encounter-1',
      fogRegions,
      onAdd: mockOnAdd,
      onRemove: mockOnRemove,
      onRefetch: mockOnRefetch,
    };

    const command = new RevealAllFogOfWarCommand(params);
    await command.execute();
    await command.undo();

    mockOnRemove.mockClear();
    await command.redo();

    expect(mockOnRemove).toHaveBeenCalledTimes(2);
    expect(mockOnRemove).toHaveBeenCalledWith('encounter-1', 10);
    expect(mockOnRemove).toHaveBeenCalledWith('encounter-1', 11);
  });

  it('should handle empty fog regions array', async () => {
    const params: RevealAllFogOfWarCommandParams = {
      encounterId: 'encounter-1',
      fogRegions: [],
      onAdd: mockOnAdd,
      onRemove: mockOnRemove,
      onRefetch: mockOnRefetch,
    };

    const command = new RevealAllFogOfWarCommand(params);
    await command.execute();

    expect(mockOnRemove).not.toHaveBeenCalled();
    expect(mockOnRefetch).toHaveBeenCalled();
  });

  it('should preserve region hierarchy on undo', async () => {
    const fogRegions = [
      createMockEncounterRegion('1', 1, 1),
      createMockEncounterRegion('1.1', 2, -1),
      createMockEncounterRegion('1.2', 3, -1),
    ];

    mockOnAdd.mockResolvedValueOnce(createMockEncounterRegion('1', 10, 1));
    mockOnAdd.mockResolvedValueOnce(createMockEncounterRegion('1.1', 11, -1));
    mockOnAdd.mockResolvedValueOnce(createMockEncounterRegion('1.2', 12, -1));

    const params: RevealAllFogOfWarCommandParams = {
      encounterId: 'encounter-1',
      fogRegions,
      onAdd: mockOnAdd,
      onRemove: mockOnRemove,
      onRefetch: mockOnRefetch,
    };

    const command = new RevealAllFogOfWarCommand(params);
    await command.execute();
    await command.undo();

    expect(mockOnAdd).toHaveBeenNthCalledWith(1, 'encounter-1', expect.objectContaining({
      name: '1',
      value: 1,
    }));
    expect(mockOnAdd).toHaveBeenNthCalledWith(2, 'encounter-1', expect.objectContaining({
      name: '1.1',
      value: -1,
    }));
    expect(mockOnAdd).toHaveBeenNthCalledWith(3, 'encounter-1', expect.objectContaining({
      name: '1.2',
      value: -1,
    }));
  });
});
