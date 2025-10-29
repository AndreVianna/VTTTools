import type { Command } from '@/utils/commands';
import type { SceneBarrier, SceneRegion, SceneSource, Point } from '@/types/domain';

export interface PlaceBarrierCommandParams {
    sceneId: string;
    barrierId: string;
    vertices: Point[];
    placeBarrierFn: (sceneId: string, barrierId: string, vertices: Point[]) => Promise<SceneBarrier>;
    removeBarrierFn: (sceneId: string, sceneBarrierId: string) => Promise<void>;
}

export class PlaceBarrierCommand implements Command {
    private sceneBarrierId?: string;
    private executePromise?: Promise<void>;
    description: string;

    constructor(private params: PlaceBarrierCommandParams) {
        this.description = 'Place Barrier';
    }

    execute(): void {
        this.executePromise = (async () => {
            const sceneBarrier = await this.params.placeBarrierFn(
                this.params.sceneId,
                this.params.barrierId,
                this.params.vertices
            );
            this.sceneBarrierId = sceneBarrier.id;
        })();
    }

    async undo(): Promise<void> {
        await this.executePromise;
        if (this.sceneBarrierId) {
            await this.params.removeBarrierFn(this.params.sceneId, this.sceneBarrierId);
        }
    }
}

export interface RemoveBarrierCommandParams {
    sceneId: string;
    sceneBarrier: SceneBarrier;
    placeBarrierFn: (sceneId: string, barrierId: string, vertices: Point[]) => Promise<SceneBarrier>;
    removeBarrierFn: (sceneId: string, sceneBarrierId: string) => Promise<void>;
}

export class RemoveBarrierCommand implements Command {
    private executePromise?: Promise<void>;
    description: string;

    constructor(private params: RemoveBarrierCommandParams) {
        this.description = 'Remove Barrier';
    }

    execute(): void {
        this.executePromise = this.params.removeBarrierFn(this.params.sceneId, this.params.sceneBarrier.id);
    }

    async undo(): Promise<void> {
        await this.executePromise;
        await this.params.placeBarrierFn(
            this.params.sceneId,
            this.params.sceneBarrier.barrierId,
            this.params.sceneBarrier.vertices
        );
    }
}

export interface PlaceRegionCommandParams {
    sceneId: string;
    regionId: string;
    vertices: Point[];
    value: number;
    placeRegionFn: (sceneId: string, regionId: string, vertices: Point[], value: number) => Promise<SceneRegion>;
    removeRegionFn: (sceneId: string, sceneRegionId: string) => Promise<void>;
}

export class PlaceRegionCommand implements Command {
    private sceneRegionId?: string;
    private executePromise?: Promise<void>;
    description: string;

    constructor(private params: PlaceRegionCommandParams) {
        this.description = 'Place Region';
    }

    execute(): void {
        this.executePromise = (async () => {
            const sceneRegion = await this.params.placeRegionFn(
                this.params.sceneId,
                this.params.regionId,
                this.params.vertices,
                this.params.value
            );
            this.sceneRegionId = sceneRegion.id;
        })();
    }

    async undo(): Promise<void> {
        await this.executePromise;
        if (this.sceneRegionId) {
            await this.params.removeRegionFn(this.params.sceneId, this.sceneRegionId);
        }
    }
}

export interface RemoveRegionCommandParams {
    sceneId: string;
    sceneRegion: SceneRegion;
    placeRegionFn: (sceneId: string, regionId: string, vertices: Point[], value: number) => Promise<SceneRegion>;
    removeRegionFn: (sceneId: string, sceneRegionId: string) => Promise<void>;
}

export class RemoveRegionCommand implements Command {
    private executePromise?: Promise<void>;
    description: string;

    constructor(private params: RemoveRegionCommandParams) {
        this.description = 'Remove Region';
    }

    execute(): void {
        this.executePromise = this.params.removeRegionFn(this.params.sceneId, this.params.sceneRegion.id);
    }

    async undo(): Promise<void> {
        await this.executePromise;
        await this.params.placeRegionFn(
            this.params.sceneId,
            this.params.sceneRegion.regionId,
            this.params.sceneRegion.vertices,
            this.params.sceneRegion.value
        );
    }
}

export interface PlaceSourceCommandParams {
    sceneId: string;
    sourceId: string;
    position: Point;
    range?: number;
    intensity?: number;
    isGradient?: boolean;
    placeSourceFn: (
        sceneId: string,
        sourceId: string,
        position: Point,
        range?: number,
        intensity?: number,
        isGradient?: boolean
    ) => Promise<SceneSource>;
    removeSourceFn: (sceneId: string, sceneSourceId: string) => Promise<void>;
}

export class PlaceSourceCommand implements Command {
    private sceneSourceId?: string;
    private executePromise?: Promise<void>;
    description: string;

    constructor(private params: PlaceSourceCommandParams) {
        this.description = 'Place Source';
    }

    execute(): void {
        this.executePromise = (async () => {
            const sceneSource = await this.params.placeSourceFn(
                this.params.sceneId,
                this.params.sourceId,
                this.params.position,
                this.params.range,
                this.params.intensity,
                this.params.isGradient
            );
            this.sceneSourceId = sceneSource.id;
        })();
    }

    async undo(): Promise<void> {
        await this.executePromise;
        if (this.sceneSourceId) {
            await this.params.removeSourceFn(this.params.sceneId, this.sceneSourceId);
        }
    }
}

export interface RemoveSourceCommandParams {
    sceneId: string;
    sceneSource: SceneSource;
    placeSourceFn: (
        sceneId: string,
        sourceId: string,
        position: Point,
        range?: number,
        intensity?: number,
        isGradient?: boolean
    ) => Promise<SceneSource>;
    removeSourceFn: (sceneId: string, sceneSourceId: string) => Promise<void>;
}

export class RemoveSourceCommand implements Command {
    private executePromise?: Promise<void>;
    description: string;

    constructor(private params: RemoveSourceCommandParams) {
        this.description = 'Remove Source';
    }

    execute(): void {
        this.executePromise = this.params.removeSourceFn(this.params.sceneId, this.params.sceneSource.id);
    }

    async undo(): Promise<void> {
        await this.executePromise;
        await this.params.placeSourceFn(
            this.params.sceneId,
            this.params.sceneSource.sourceId,
            this.params.sceneSource.position,
            this.params.sceneSource.range,
            this.params.sceneSource.intensity,
            this.params.sceneSource.isGradient
        );
    }
}
