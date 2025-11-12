import type { EncounterWall } from '@/types/domain';
import type { Command } from '@/utils/commands';

export interface CreateWallCommandParams {
  encounterId: string;
  wall: EncounterWall;
  onCreate: (encounterId: string, wall: Omit<EncounterWall, 'index' | 'encounterId'>) => Promise<EncounterWall>;
  onRemove: (encounterId: string, wallIndex: number) => Promise<void>;
  onRefetch: () => Promise<void>;
}

export class CreateWallCommand implements Command {
  readonly description: string;

  constructor(private params: CreateWallCommandParams) {
    this.description = `Create wall "${params.wall.name}"`;
  }

  async execute(): Promise<void> {
    await this.redo();
  }

  async undo(): Promise<void> {
    await this.params.onRemove(this.params.encounterId, this.params.wall.index);
    await this.params.onRefetch();
  }

  async redo(): Promise<void> {
    const { encounterId, wall, onCreate, onRefetch } = this.params;
    await onCreate(encounterId, {
      name: wall.name,
      poles: wall.poles,
      visibility: wall.visibility,
      isClosed: wall.isClosed,
      material: wall.material,
      color: wall.color,
    });
    await onRefetch();
  }
}

export interface EditWallCommandParams {
  encounterId: string;
  wallIndex: number;
  oldWall: EncounterWall;
  newWall: EncounterWall;
  onUpdate: (encounterId: string, wallIndex: number, updates: Partial<EncounterWall>) => Promise<void>;
  onRefetch: () => Promise<void>;
}

export class EditWallCommand implements Command {
  readonly description: string;

  constructor(private params: EditWallCommandParams) {
    this.description = `Edit wall "${params.newWall.name}"`;
  }

  async execute(): Promise<void> {
    await this.redo();
  }

  async undo(): Promise<void> {
    const { oldWall, encounterId, wallIndex, onUpdate, onRefetch } = this.params;
    const updates: Partial<EncounterWall> = {
      name: oldWall.name,
      poles: oldWall.poles,
      visibility: oldWall.visibility,
      isClosed: oldWall.isClosed,
      material: oldWall.material,
      color: oldWall.color,
    };
    await onUpdate(encounterId, wallIndex, updates);
    await onRefetch();
  }

  async redo(): Promise<void> {
    const { newWall, encounterId, wallIndex, onUpdate, onRefetch } = this.params;
    const updates: Partial<EncounterWall> = {
      name: newWall.name,
      poles: newWall.poles,
      visibility: newWall.visibility,
      isClosed: newWall.isClosed,
      material: newWall.material,
      color: newWall.color,
    };
    await onUpdate(encounterId, wallIndex, updates);
    await onRefetch();
  }
}

export interface DeleteWallCommandParams {
  encounterId: string;
  wallIndex: number;
  wall: EncounterWall;
  onAdd: (encounterId: string, wall: Omit<EncounterWall, 'index' | 'encounterId'>) => Promise<EncounterWall>;
  onRemove: (encounterId: string, wallIndex: number) => Promise<void>;
  onRefetch: () => Promise<void>;
}

export class DeleteWallCommand implements Command {
  readonly description: string;
  private restoredIndex?: number;

  constructor(private params: DeleteWallCommandParams) {
    this.description = `Delete wall "${params.wall.name}"`;
  }

  async execute(): Promise<void> {
    const { encounterId, wallIndex, onRemove, onRefetch } = this.params;
    await onRemove(encounterId, wallIndex);
    await onRefetch();
  }

  async undo(): Promise<void> {
    const { encounterId, wall, onAdd, onRefetch } = this.params;
    const restoredWall = await onAdd(encounterId, {
      name: wall.name,
      poles: wall.poles,
      visibility: wall.visibility,
      isClosed: wall.isClosed,
      material: wall.material,
      color: wall.color,
    });
    this.restoredIndex = restoredWall.index;
    await onRefetch();
  }

  async redo(): Promise<void> {
    const { encounterId, onRemove, onRefetch } = this.params;
    if (this.restoredIndex !== undefined) {
      await onRemove(encounterId, this.restoredIndex);
      await onRefetch();
    }
  }
}

export interface BreakWallCommandParams {
  encounterId: string;
  originalWallIndex: number;
  originalWall: EncounterWall;
  newWalls: EncounterWall[];
  onAdd: (encounterId: string, wall: Omit<EncounterWall, 'index' | 'encounterId'>) => Promise<EncounterWall>;
  onUpdate: (encounterId: string, wallIndex: number, updates: Partial<EncounterWall>) => Promise<void>;
  onRemove: (encounterId: string, wallIndex: number) => Promise<void>;
  onRefetch: () => Promise<void>;
}

export class BreakWallCommand implements Command {
  readonly description: string;
  private segmentIndices: number[] = [];

  constructor(private params: BreakWallCommandParams) {
    this.description = `Break wall "${params.originalWall.name}" into ${params.newWalls.length} segments`;
  }

  async execute(): Promise<void> {
    await this.redo();
  }

  async undo(): Promise<void> {
    const { encounterId, originalWallIndex, originalWall, newWalls, onRemove, onUpdate, onRefetch } = this.params;

    for (const wall of newWalls) {
      await onRemove(encounterId, wall.index);
    }

    const updates: Partial<EncounterWall> = {
      name: originalWall.name,
      poles: originalWall.poles,
      visibility: originalWall.visibility,
      isClosed: originalWall.isClosed,
      material: originalWall.material,
      color: originalWall.color,
    };
    await onUpdate(encounterId, originalWallIndex, updates);

    await onRefetch();
  }

  async redo(): Promise<void> {
    const { encounterId, originalWallIndex, newWalls, onAdd, onRemove, onRefetch } = this.params;

    await onRemove(encounterId, originalWallIndex);

    this.segmentIndices = [];
    for (const wall of newWalls) {
      const addedWall = await onAdd(encounterId, {
        name: wall.name,
        poles: wall.poles,
        visibility: wall.visibility,
        isClosed: wall.isClosed,
        material: wall.material,
        color: wall.color,
      });
      this.segmentIndices.push(addedWall.index);
    }

    await onRefetch();
  }
}

export interface MergeWallsCommandParams {
  encounterId: string;
  targetWallIndex: number;
  mergedWall: EncounterWall;
  originalWalls: EncounterWall[];
  wallsToDelete: number[];
  onUpdate: (encounterId: string, wallIndex: number, updates: Partial<EncounterWall>) => Promise<void>;
  onAdd: (encounterId: string, wall: Omit<EncounterWall, 'index' | 'encounterId'>) => Promise<EncounterWall>;
  onRemove: (encounterId: string, wallIndex: number) => Promise<void>;
  onRefetch: () => Promise<void>;
}

export class MergeWallsCommand implements Command {
  readonly description: string;
  private restoredIndices: Map<number, number> = new Map();

  constructor(private params: MergeWallsCommandParams) {
    const scenario = params.mergedWall.isClosed ? 'Scenario 5 (closed)' : 'Scenario 3 (merge)';
    this.description = `Merge ${params.originalWalls.length} walls (${scenario})`;
  }

  async execute(): Promise<void> {
    await this.redo();
  }

  async undo(): Promise<void> {
    const { encounterId, targetWallIndex, originalWalls, onUpdate, onAdd, onRefetch } = this.params;

    this.restoredIndices.clear();

    for (const originalWall of originalWalls) {
      if (originalWall.index === targetWallIndex) {
        const updates: Partial<EncounterWall> = {
          name: originalWall.name,
          poles: originalWall.poles,
          visibility: originalWall.visibility,
          isClosed: originalWall.isClosed,
          material: originalWall.material,
          color: originalWall.color,
        };
        await onUpdate(encounterId, targetWallIndex, updates);
      } else {
        const restoredWall = await onAdd(encounterId, {
          name: originalWall.name,
          poles: originalWall.poles,
          visibility: originalWall.visibility,
          isClosed: originalWall.isClosed,
          material: originalWall.material,
          color: originalWall.color,
        });
        this.restoredIndices.set(originalWall.index, restoredWall.index);
      }
    }

    await onRefetch();
  }

  async redo(): Promise<void> {
    const { encounterId, targetWallIndex, mergedWall, wallsToDelete, onUpdate, onRemove, onRefetch } = this.params;

    const updates: Partial<EncounterWall> = {
      name: mergedWall.name,
      poles: mergedWall.poles,
      visibility: mergedWall.visibility,
      isClosed: mergedWall.isClosed,
      material: mergedWall.material,
      color: mergedWall.color,
    };
    await onUpdate(encounterId, targetWallIndex, updates);

    for (const wallIndex of wallsToDelete) {
      const actualIndex = this.restoredIndices.get(wallIndex) ?? wallIndex;
      await onRemove(encounterId, actualIndex);
    }

    await onRefetch();
  }
}

export interface SplitWallsCommandParams {
  encounterId: string;
  newWall: EncounterWall;
  affectedWalls: Array<{
    wallIndex: number;
    originalWall: EncounterWall;
    segments: EncounterWall[];
  }>;
  onUpdate: (encounterId: string, wallIndex: number, updates: Partial<EncounterWall>) => Promise<void>;
  onAdd: (encounterId: string, wall: Omit<EncounterWall, 'index' | 'encounterId'>) => Promise<EncounterWall>;
  onRemove: (encounterId: string, wallIndex: number) => Promise<void>;
  onRefetch: () => Promise<void>;
}

export class SplitWallsCommand implements Command {
  readonly description: string;
  private restoredSegmentIndices: Map<number, number[]> = new Map();
  private restoredNewWallIndex?: number;

  constructor(private params: SplitWallsCommandParams) {
    const count = params.affectedWalls.length;
    this.description = `Split ${count} wall${count > 1 ? 's' : ''} with new wall`;
  }

  async execute(): Promise<void> {
    await this.redo();
  }

  async undo(): Promise<void> {
    const { encounterId, newWall, affectedWalls, onUpdate, onRemove, onRefetch } = this.params;

    try {
      const newWallIndex = this.restoredNewWallIndex ?? newWall.index;
      await onRemove(encounterId, newWallIndex);

      for (const { wallIndex, originalWall, segments } of affectedWalls) {
        for (let i = 1; i < segments.length; i++) {
          const segment = segments[i];
          if (segment) {
            const restoredIndices = this.restoredSegmentIndices.get(wallIndex);
            const actualIndex = restoredIndices?.[i] ?? segment.index;
            await onRemove(encounterId, actualIndex);
          }
        }

        await onUpdate(encounterId, wallIndex, {
          name: originalWall.name,
          poles: originalWall.poles,
          isClosed: originalWall.isClosed,
          visibility: originalWall.visibility,
          material: originalWall.material,
          color: originalWall.color,
        });
      }

      await onRefetch();
    } catch (error) {
      console.error('[SplitWallsCommand] Undo failed:', error);
      await onRefetch();
      throw error;
    }
  }

  async redo(): Promise<void> {
    const { encounterId, newWall, affectedWalls, onUpdate, onAdd, onRefetch } = this.params;

    try {
      this.restoredSegmentIndices.clear();

      const restoredNewWall = await onAdd(encounterId, {
        name: newWall.name,
        poles: newWall.poles,
        isClosed: newWall.isClosed,
        visibility: newWall.visibility,
        material: newWall.material,
        color: newWall.color,
      });
      this.restoredNewWallIndex = restoredNewWall.index;

      for (const { wallIndex, segments } of affectedWalls) {
        const indices: number[] = [];

        const firstSegment = segments[0];
        if (firstSegment) {
          await onUpdate(encounterId, wallIndex, {
            name: firstSegment.name,
            poles: firstSegment.poles,
            isClosed: firstSegment.isClosed,
            visibility: firstSegment.visibility,
            material: firstSegment.material,
            color: firstSegment.color,
          });
          indices.push(wallIndex);
        }

        for (let i = 1; i < segments.length; i++) {
          const segment = segments[i];
          if (segment) {
            const addedWall = await onAdd(encounterId, {
              name: segment.name,
              poles: segment.poles,
              isClosed: segment.isClosed,
              visibility: segment.visibility,
              material: segment.material,
              color: segment.color,
            });
            indices.push(addedWall.index);
          }
        }

        this.restoredSegmentIndices.set(wallIndex, indices);
      }

      await onRefetch();
    } catch (error) {
      console.error('[SplitWallsCommand] Redo failed:', error);
      await onRefetch();
      throw error;
    }
  }
}
