import type { Command } from '@/utils/commands';
import type { SceneWall } from '@/types/domain';

export interface CreateWallCommandParams {
    sceneId: string;
    wall: SceneWall;
    onCreate: (
        sceneId: string,
        wall: Omit<SceneWall, 'index' | 'sceneId'>
    ) => Promise<SceneWall>;
    onRemove: (sceneId: string, wallIndex: number) => Promise<void>;
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
        await this.params.onRemove(this.params.sceneId, this.params.wall.index);
        await this.params.onRefetch();
    }

    async redo(): Promise<void> {
        const { sceneId, wall, onCreate, onRefetch } = this.params;
        await onCreate(sceneId, {
            name: wall.name,
            poles: wall.poles,
            visibility: wall.visibility,
            isClosed: wall.isClosed,
            material: wall.material,
            color: wall.color
        });
        await onRefetch();
    }
}

export interface EditWallCommandParams {
    sceneId: string;
    wallIndex: number;
    oldWall: SceneWall;
    newWall: SceneWall;
    onUpdate: (sceneId: string, wallIndex: number, updates: Partial<SceneWall>) => Promise<void>;
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
        const { oldWall, sceneId, wallIndex, onUpdate, onRefetch } = this.params;
        const updates: Partial<SceneWall> = {
            name: oldWall.name,
            poles: oldWall.poles,
            visibility: oldWall.visibility,
            isClosed: oldWall.isClosed,
            material: oldWall.material,
            color: oldWall.color
        };
        await onUpdate(sceneId, wallIndex, updates);
        await onRefetch();
    }

    async redo(): Promise<void> {
        const { newWall, sceneId, wallIndex, onUpdate, onRefetch } = this.params;
        const updates: Partial<SceneWall> = {
            name: newWall.name,
            poles: newWall.poles,
            visibility: newWall.visibility,
            isClosed: newWall.isClosed,
            material: newWall.material,
            color: newWall.color
        };
        await onUpdate(sceneId, wallIndex, updates);
        await onRefetch();
    }
}

export interface DeleteWallCommandParams {
    sceneId: string;
    wallIndex: number;
    wall: SceneWall;
    onAdd: (
        sceneId: string,
        wall: Omit<SceneWall, 'index' | 'sceneId'>
    ) => Promise<SceneWall>;
    onRemove: (sceneId: string, wallIndex: number) => Promise<void>;
    onRefetch: () => Promise<void>;
}

export class DeleteWallCommand implements Command {
    readonly description: string;
    private restoredIndex?: number;

    constructor(private params: DeleteWallCommandParams) {
        this.description = `Delete wall "${params.wall.name}"`;
    }

    async execute(): Promise<void> {
        const { sceneId, wallIndex, onRemove, onRefetch } = this.params;
        await onRemove(sceneId, wallIndex);
        await onRefetch();
    }

    async undo(): Promise<void> {
        const { sceneId, wall, onAdd, onRefetch } = this.params;
        const restoredWall = await onAdd(sceneId, {
            name: wall.name,
            poles: wall.poles,
            visibility: wall.visibility,
            isClosed: wall.isClosed,
            material: wall.material,
            color: wall.color
        });
        this.restoredIndex = restoredWall.index;
        await onRefetch();
    }

    async redo(): Promise<void> {
        const { sceneId, onRemove, onRefetch } = this.params;
        if (this.restoredIndex !== undefined) {
            await onRemove(sceneId, this.restoredIndex);
            await onRefetch();
        }
    }
}

export interface BreakWallCommandParams {
    sceneId: string;
    originalWallIndex: number;
    originalWall: SceneWall;
    newWalls: SceneWall[];
    onAdd: (
        sceneId: string,
        wall: Omit<SceneWall, 'index' | 'sceneId'>
    ) => Promise<SceneWall>;
    onUpdate: (sceneId: string, wallIndex: number, updates: Partial<SceneWall>) => Promise<void>;
    onRemove: (sceneId: string, wallIndex: number) => Promise<void>;
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
        const { sceneId, originalWallIndex, originalWall, newWalls, onRemove, onUpdate, onRefetch } = this.params;

        for (const wall of newWalls) {
            await onRemove(sceneId, wall.index);
        }

        const updates: Partial<SceneWall> = {
            name: originalWall.name,
            poles: originalWall.poles,
            visibility: originalWall.visibility,
            isClosed: originalWall.isClosed,
            material: originalWall.material,
            color: originalWall.color
        };
        await onUpdate(sceneId, originalWallIndex, updates);

        await onRefetch();
    }

    async redo(): Promise<void> {
        const { sceneId, originalWallIndex, newWalls, onAdd, onRemove, onRefetch } = this.params;

        await onRemove(sceneId, originalWallIndex);

        this.segmentIndices = [];
        for (const wall of newWalls) {
            const addedWall = await onAdd(sceneId, {
                name: wall.name,
                poles: wall.poles,
                visibility: wall.visibility,
                isClosed: wall.isClosed,
                material: wall.material,
                color: wall.color
            });
            this.segmentIndices.push(addedWall.index);
        }

        await onRefetch();
    }
}

export interface MergeWallsCommandParams {
    sceneId: string;
    targetWallIndex: number;
    mergedWall: SceneWall;
    originalWalls: SceneWall[];
    wallsToDelete: number[];
    onUpdate: (sceneId: string, wallIndex: number, updates: Partial<SceneWall>) => Promise<void>;
    onAdd: (
        sceneId: string,
        wall: Omit<SceneWall, 'index' | 'sceneId'>
    ) => Promise<SceneWall>;
    onRemove: (sceneId: string, wallIndex: number) => Promise<void>;
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
        const { sceneId, targetWallIndex, originalWalls, onUpdate, onAdd, onRefetch } = this.params;

        this.restoredIndices.clear();

        for (const originalWall of originalWalls) {
            if (originalWall.index === targetWallIndex) {
                const updates: Partial<SceneWall> = {
                    name: originalWall.name,
                    poles: originalWall.poles,
                    visibility: originalWall.visibility,
                    isClosed: originalWall.isClosed,
                    material: originalWall.material,
                    color: originalWall.color
                };
                await onUpdate(sceneId, targetWallIndex, updates);
            } else {
                const restoredWall = await onAdd(sceneId, {
                    name: originalWall.name,
                    poles: originalWall.poles,
                    visibility: originalWall.visibility,
                    isClosed: originalWall.isClosed,
                    material: originalWall.material,
                    color: originalWall.color
                });
                this.restoredIndices.set(originalWall.index, restoredWall.index);
            }
        }

        await onRefetch();
    }

    async redo(): Promise<void> {
        const { sceneId, targetWallIndex, mergedWall, wallsToDelete, onUpdate, onRemove, onRefetch } = this.params;

        const updates: Partial<SceneWall> = {
            name: mergedWall.name,
            poles: mergedWall.poles,
            visibility: mergedWall.visibility,
            isClosed: mergedWall.isClosed,
            material: mergedWall.material,
            color: mergedWall.color
        };
        await onUpdate(sceneId, targetWallIndex, updates);

        for (const wallIndex of wallsToDelete) {
            const actualIndex = this.restoredIndices.get(wallIndex) ?? wallIndex;
            await onRemove(sceneId, actualIndex);
        }

        await onRefetch();
    }
}

export interface SplitWallsCommandParams {
    sceneId: string;
    newWall: SceneWall;
    affectedWalls: Array<{
        wallIndex: number;
        originalWall: SceneWall;
        segments: SceneWall[];
    }>;
    onUpdate: (sceneId: string, wallIndex: number, updates: Partial<SceneWall>) => Promise<void>;
    onAdd: (
        sceneId: string,
        wall: Omit<SceneWall, 'index' | 'sceneId'>
    ) => Promise<SceneWall>;
    onRemove: (sceneId: string, wallIndex: number) => Promise<void>;
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
        const { sceneId, newWall, affectedWalls, onUpdate, onRemove, onRefetch } = this.params;

        try {
            const newWallIndex = this.restoredNewWallIndex ?? newWall.index;
            await onRemove(sceneId, newWallIndex);

            for (const { wallIndex, originalWall, segments } of affectedWalls) {
                for (let i = 1; i < segments.length; i++) {
                    const segment = segments[i];
                    if (segment) {
                        const restoredIndices = this.restoredSegmentIndices.get(wallIndex);
                        const actualIndex = restoredIndices?.[i] ?? segment.index;
                        await onRemove(sceneId, actualIndex);
                    }
                }

                await onUpdate(sceneId, wallIndex, {
                    name: originalWall.name,
                    poles: originalWall.poles,
                    isClosed: originalWall.isClosed,
                    visibility: originalWall.visibility,
                    material: originalWall.material,
                    color: originalWall.color
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
        const { sceneId, newWall, affectedWalls, onUpdate, onAdd, onRefetch } = this.params;

        try {
            this.restoredSegmentIndices.clear();

            const restoredNewWall = await onAdd(sceneId, {
                name: newWall.name,
                poles: newWall.poles,
                isClosed: newWall.isClosed,
                visibility: newWall.visibility,
                material: newWall.material,
                color: newWall.color
            });
            this.restoredNewWallIndex = restoredNewWall.index;

            for (const { wallIndex, segments } of affectedWalls) {
                const indices: number[] = [];

                const firstSegment = segments[0];
                if (firstSegment) {
                    await onUpdate(sceneId, wallIndex, {
                        name: firstSegment.name,
                        poles: firstSegment.poles,
                        isClosed: firstSegment.isClosed,
                        visibility: firstSegment.visibility,
                        material: firstSegment.material,
                        color: firstSegment.color
                    });
                    indices.push(wallIndex);
                }

                for (let i = 1; i < segments.length; i++) {
                    const segment = segments[i];
                    if (segment) {
                        const addedWall = await onAdd(sceneId, {
                            name: segment.name,
                            poles: segment.poles,
                            isClosed: segment.isClosed,
                            visibility: segment.visibility,
                            material: segment.material,
                            color: segment.color
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
