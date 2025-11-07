import type { Command } from '@/utils/commands';
import type { SceneWall, SceneRegion, SceneSource, Point } from '@/types/domain';

export interface PlaceWallCommandParams {
    sceneId: string;
    id: number;
    vertices: Point[];
    placeWallFn: (sceneId: string, id: number, vertices: Point[]) => Promise<SceneWall>;
    removeWallFn: (sceneId: string, id: number) => Promise<void>;
}

export class PlaceWallCommand implements Command {
    private id?: number;
    private executePromise?: Promise<void>;
    description: string;

    constructor(private params: PlaceWallCommandParams) {
        this.description = 'Place Wall';
    }

    execute(): void {
        this.executePromise = (async () => {
            const sceneWall = await this.params.placeWallFn(
                this.params.sceneId,
                this.params.id,
                this.params.vertices
            );
            this.id = sceneWall.index;
        })();
    }

    async undo(): Promise<void> {
        await this.executePromise;
        if (this.id) {
            await this.params.removeWallFn(this.params.sceneId, this.id);
        }
    }
}

export interface RemoveWallCommandParams {
    sceneId: string;
    sceneWall: SceneWall;
    placeWallFn: (sceneId: string, id: number, vertices: Point[]) => Promise<SceneWall>;
    removeWallFn: (sceneId: string, id: number) => Promise<void>;
}

export class RemoveWallCommand implements Command {
    private executePromise?: Promise<void>;
    description: string;

    constructor(private params: RemoveWallCommandParams) {
        this.description = 'Remove Wall';
    }

    execute(): void {
        this.executePromise = this.params.removeWallFn(this.params.sceneId, this.params.sceneWall.index);
    }

    async undo(): Promise<void> {
        await this.executePromise;
        await this.params.placeWallFn(
            this.params.sceneId,
            this.params.sceneWall.index,
            this.params.sceneWall.poles
        );
    }
}

export interface PlaceRegionCommandParams {
    sceneId: string;
    id: number;
    vertices: Point[];
    value: number;
    placeRegionFn: (sceneId: string, id: number, vertices: Point[], value: number) => Promise<SceneRegion>;
    removeRegionFn: (sceneId: string, id: number) => Promise<void>;
}

export class PlaceRegionCommand implements Command {
    private id?: number;
    private executePromise?: Promise<void>;
    description: string;

    constructor(private params: PlaceRegionCommandParams) {
        this.description = 'Place Region';
    }

    execute(): void {
        this.executePromise = (async () => {
            const sceneRegion = await this.params.placeRegionFn(
                this.params.sceneId,
                this.params.id,
                this.params.vertices,
                this.params.value
            );
            this.id = sceneRegion.index;
        })();
    }

    async undo(): Promise<void> {
        await this.executePromise;
        if (this.id) {
            await this.params.removeRegionFn(this.params.sceneId, this.id);
        }
    }
}

export interface RemoveRegionCommandParams {
    sceneId: string;
    sceneRegion: SceneRegion;
    placeRegionFn: (sceneId: string, id: number, vertices: Point[], value: number | undefined) => Promise<SceneRegion>;
    removeRegionFn: (sceneId: string, id: number) => Promise<void>;
}

export class RemoveRegionCommand implements Command {
    private executePromise?: Promise<void>;
    description: string;

    constructor(private params: RemoveRegionCommandParams) {
        this.description = 'Remove Region';
    }

    execute(): void {
        this.executePromise = this.params.removeRegionFn(this.params.sceneId, this.params.sceneRegion.index);
    }

    async undo(): Promise<void> {
        await this.executePromise;
        await this.params.placeRegionFn(
            this.params.sceneId,
            this.params.sceneRegion.index,
            this.params.sceneRegion.vertices,
            this.params.sceneRegion.value
        );
    }
}

export interface PlaceSourceCommandParams {
    sceneId: string;
    id: number;
    position: Point;
    range?: number;
    intensity?: number;
    hasGradient?: boolean;
    placeSourceFn: (
        sceneId: string,
        id: number,
        position: Point,
        range?: number,
        intensity?: number,
        hasGradient?: boolean
    ) => Promise<SceneSource>;
    removeSourceFn: (sceneId: string, id: number) => Promise<void>;
}

export class PlaceSourceCommand implements Command {
    private id?: number;
    private executePromise?: Promise<void>;
    description: string;

    constructor(private params: PlaceSourceCommandParams) {
        this.description = 'Place Source';
    }

    execute(): void {
        this.executePromise = (async () => {
            const sceneSource = await this.params.placeSourceFn(
                this.params.sceneId,
                this.params.id,
                this.params.position,
                this.params.range,
                this.params.intensity,
                this.params.hasGradient
            );
            this.id = sceneSource.index;
        })();
    }

    async undo(): Promise<void> {
        await this.executePromise;
        if (this.id) {
            await this.params.removeSourceFn(this.params.sceneId, this.id);
        }
    }
}

export interface RemoveSourceCommandParams {
    sceneId: string;
    sceneSource: SceneSource;
    placeSourceFn: (
        sceneId: string,
        id: number,
        position: Point,
        range?: number,
        intensity?: number,
        hasGradient?: boolean
    ) => Promise<SceneSource>;
    removeSourceFn: (sceneId: string, id: number) => Promise<void>;
}

export class RemoveSourceCommand implements Command {
    private executePromise?: Promise<void>;
    description: string;

    constructor(private params: RemoveSourceCommandParams) {
        this.description = 'Remove Source';
    }

    execute(): void {
        this.executePromise = this.params.removeSourceFn(this.params.sceneId, this.params.sceneSource.index);
    }

    async undo(): Promise<void> {
        await this.executePromise;
        await this.params.placeSourceFn(
            this.params.sceneId,
            this.params.sceneSource.index,
            this.params.sceneSource.position,
            this.params.sceneSource.range,
            this.params.sceneSource.intensity,
            this.params.sceneSource.hasGradient
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


