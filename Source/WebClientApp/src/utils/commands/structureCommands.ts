import type { Command } from '@/utils/commands';
import type { SceneWall, SceneRegion, SceneSource, Point } from '@/types/domain';

export interface PlaceWallCommandParams {
    sceneId: string;
    WallId: string;
    vertices: Point[];
    placeWallFn: (sceneId: string, WallId: string, vertices: Point[]) => Promise<SceneWall>;
    removeWallFn: (sceneId: string, sceneWallId: string) => Promise<void>;
}

export class PlaceWallCommand implements Command {
    private sceneWallId?: string;
    private executePromise?: Promise<void>;
    description: string;

    constructor(private params: PlaceWallCommandParams) {
        this.description = 'Place Wall';
    }

    execute(): void {
        this.executePromise = (async () => {
            const sceneWall = await this.params.placeWallFn(
                this.params.sceneId,
                this.params.WallId,
                this.params.vertices
            );
            this.sceneWallId = sceneWall.id;
        })();
    }

    async undo(): Promise<void> {
        await this.executePromise;
        if (this.sceneWallId) {
            await this.params.removeWallFn(this.params.sceneId, this.sceneWallId);
        }
    }
}

export interface RemoveWallCommandParams {
    sceneId: string;
    sceneWall: SceneWall;
    placeWallFn: (sceneId: string, WallId: string, vertices: Point[]) => Promise<SceneWall>;
    removeWallFn: (sceneId: string, sceneWallId: string) => Promise<void>;
}

export class RemoveWallCommand implements Command {
    private executePromise?: Promise<void>;
    description: string;

    constructor(private params: RemoveWallCommandParams) {
        this.description = 'Remove Wall';
    }

    execute(): void {
        this.executePromise = this.params.removeWallFn(this.params.sceneId, this.params.sceneWall.id);
    }

    async undo(): Promise<void> {
        await this.executePromise;
        await this.params.placeWallFn(
            this.params.sceneId,
            this.params.sceneWall.WallId,
            this.params.sceneWall.vertices
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

export interface UpdateWallVerticesCommandParams {
    sceneId: string;
    sceneWallId: string;
    oldVertices: Point[];
    newVertices: Point[];
    updateWallFn: (sceneId: string, sceneWallId: string, vertices: Point[]) => Promise<void>;
}

export class UpdateWallVerticesCommand implements Command {
    private executePromise?: Promise<void>;
    description: string;

    constructor(private params: UpdateWallVerticesCommandParams) {
        this.description = 'Update Wall Vertices';
    }

    execute(): void {
        this.executePromise = this.params.updateWallFn(
            this.params.sceneId,
            this.params.sceneWallId,
            this.params.newVertices
        );
    }

    async undo(): Promise<void> {
        await this.executePromise;
        await this.params.updateWallFn(
            this.params.sceneId,
            this.params.sceneWallId,
            this.params.oldVertices
        );
    }
}


