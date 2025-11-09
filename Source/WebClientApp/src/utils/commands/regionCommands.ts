import type { Command } from '@/utils/commands';
import type { SceneRegion } from '@/types/domain';

export interface CreateRegionCommandParams {
    sceneId: string;
    region: SceneRegion;
    onCreate: (
        sceneId: string,
        region: Omit<SceneRegion, 'index' | 'sceneId'>
    ) => Promise<SceneRegion>;
    onRemove: (sceneId: string, regionIndex: number) => Promise<void>;
    onRefetch: () => Promise<void>;
}

export class CreateRegionCommand implements Command {
    readonly description: string;

    constructor(private params: CreateRegionCommandParams) {
        this.description = `Create region "${params.region.name}"`;
    }

    execute(): void {
    }

    async undo(): Promise<void> {
        await this.params.onRemove(this.params.sceneId, this.params.region.index);
        await this.params.onRefetch();
    }

    async redo(): Promise<void> {
        const { sceneId, region, onCreate, onRefetch } = this.params;
        const regionData: Omit<SceneRegion, 'index' | 'sceneId'> = {
            name: region.name,
            type: region.type,
            vertices: region.vertices,
            ...(region.value !== undefined && { value: region.value }),
            ...(region.label !== undefined && { label: region.label }),
            ...(region.color !== undefined && { color: region.color })
        };
        await onCreate(sceneId, regionData);
        await onRefetch();
    }
}

export interface EditRegionCommandParams {
    sceneId: string;
    regionIndex: number;
    oldRegion: SceneRegion;
    newRegion: SceneRegion;
    onUpdate: (sceneId: string, regionIndex: number, updates: Partial<SceneRegion>) => Promise<void>;
    onRefetch: () => Promise<void>;
}

export class EditRegionCommand implements Command {
    readonly description: string;

    constructor(private params: EditRegionCommandParams) {
        this.description = `Edit region "${params.newRegion.name}"`;
    }

    execute(): void {
    }

    async undo(): Promise<void> {
        const { oldRegion, sceneId, regionIndex, onUpdate, onRefetch } = this.params;
        const updates: Partial<SceneRegion> = {
            name: oldRegion.name,
            type: oldRegion.type,
            vertices: oldRegion.vertices,
            ...(oldRegion.value !== undefined && { value: oldRegion.value }),
            ...(oldRegion.label !== undefined && { label: oldRegion.label }),
            ...(oldRegion.color !== undefined && { color: oldRegion.color })
        };
        await onUpdate(sceneId, regionIndex, updates);
        await onRefetch();
    }

    async redo(): Promise<void> {
        const { newRegion, sceneId, regionIndex, onUpdate, onRefetch } = this.params;
        const updates: Partial<SceneRegion> = {
            name: newRegion.name,
            type: newRegion.type,
            vertices: newRegion.vertices,
            ...(newRegion.value !== undefined && { value: newRegion.value }),
            ...(newRegion.label !== undefined && { label: newRegion.label }),
            ...(newRegion.color !== undefined && { color: newRegion.color })
        };
        await onUpdate(sceneId, regionIndex, updates);
        await onRefetch();
    }
}

export interface DeleteRegionCommandParams {
    sceneId: string;
    regionIndex: number;
    region: SceneRegion;
    onAdd: (
        sceneId: string,
        region: Omit<SceneRegion, 'index' | 'sceneId'>
    ) => Promise<SceneRegion>;
    onRemove: (sceneId: string, regionIndex: number) => Promise<void>;
    onRefetch: () => Promise<void>;
}

export class DeleteRegionCommand implements Command {
    readonly description: string;
    private restoredIndex?: number;

    constructor(private params: DeleteRegionCommandParams) {
        this.description = `Delete region "${params.region.name}"`;
    }

    execute(): void {
    }

    async undo(): Promise<void> {
        const { sceneId, region, onAdd, onRefetch } = this.params;
        const regionData: Omit<SceneRegion, 'index' | 'sceneId'> = {
            name: region.name,
            type: region.type,
            vertices: region.vertices,
            ...(region.value !== undefined && { value: region.value }),
            ...(region.label !== undefined && { label: region.label }),
            ...(region.color !== undefined && { color: region.color })
        };
        const restoredRegion = await onAdd(sceneId, regionData);
        this.restoredIndex = restoredRegion.index;
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
