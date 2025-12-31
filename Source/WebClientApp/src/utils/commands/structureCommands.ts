import type { EncounterRegion, EncounterLightSource, EncounterWall, Point } from '@/types/domain';
import type { StageSound } from '@/types/stage';
import type { Command } from '@/utils/commands';
import { getPolesFromWall } from '@/utils/wallUtils';

export interface PlaceWallCommandParams {
  encounterId: string;
  id: number;
  vertices: Point[];
  placeWallFn: (encounterId: string, id: number, vertices: Point[]) => Promise<EncounterWall>;
  removeWallFn: (encounterId: string, id: number) => Promise<void>;
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
      const encounterWall = await this.params.placeWallFn(
        this.params.encounterId,
        this.params.id,
        this.params.vertices,
      );
      this.id = encounterWall.index;
    })();
  }

  async undo(): Promise<void> {
    await this.executePromise;
    if (this.id !== undefined) {
      await this.params.removeWallFn(this.params.encounterId, this.id);
    }
  }
}

export interface RemoveWallCommandParams {
  encounterId: string;
  encounterWall: EncounterWall;
  placeWallFn: (encounterId: string, id: number, vertices: Point[]) => Promise<EncounterWall>;
  removeWallFn: (encounterId: string, id: number) => Promise<void>;
}

export class RemoveWallCommand implements Command {
  private executePromise?: Promise<void>;
  description: string;

  constructor(private params: RemoveWallCommandParams) {
    this.description = 'Remove Wall';
  }

  execute(): void {
    this.executePromise = this.params.removeWallFn(this.params.encounterId, this.params.encounterWall.index);
  }

  async undo(): Promise<void> {
    await this.executePromise;
    const poles = getPolesFromWall(this.params.encounterWall);
    await this.params.placeWallFn(
      this.params.encounterId,
      this.params.encounterWall.index,
      poles,
    );
  }
}

export interface PlaceRegionCommandParams {
  encounterId: string;
  id: number;
  vertices: Point[];
  value: number;
  placeRegionFn: (encounterId: string, id: number, vertices: Point[], value: number) => Promise<EncounterRegion>;
  removeRegionFn: (encounterId: string, id: number) => Promise<void>;
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
      const encounterRegion = await this.params.placeRegionFn(
        this.params.encounterId,
        this.params.id,
        this.params.vertices,
        this.params.value,
      );
      this.id = encounterRegion.index;
    })();
  }

  async undo(): Promise<void> {
    await this.executePromise;
    if (this.id) {
      await this.params.removeRegionFn(this.params.encounterId, this.id);
    }
  }
}

export interface RemoveRegionCommandParams {
  encounterId: string;
  encounterRegion: EncounterRegion;
  placeRegionFn: (
    encounterId: string,
    id: number,
    vertices: Point[],
    value: number | undefined,
  ) => Promise<EncounterRegion>;
  removeRegionFn: (encounterId: string, id: number) => Promise<void>;
}

export class RemoveRegionCommand implements Command {
  private executePromise?: Promise<void>;
  description: string;

  constructor(private params: RemoveRegionCommandParams) {
    this.description = 'Remove Region';
  }

  execute(): void {
    this.executePromise = this.params.removeRegionFn(this.params.encounterId, this.params.encounterRegion.index);
  }

  async undo(): Promise<void> {
    await this.executePromise;
    await this.params.placeRegionFn(
      this.params.encounterId,
      this.params.encounterRegion.index,
      this.params.encounterRegion.vertices,
      this.params.encounterRegion.value,
    );
  }
}

export interface PlaceSourceCommandParams {
  encounterId: string;
  id: number;
  position: Point;
  range?: number;
  intensity?: number;
  hasGradient?: boolean;
  placeSourceFn: (
    encounterId: string,
    id: number,
    position: Point,
    range?: number,
    intensity?: number,
    hasGradient?: boolean,
  ) => Promise<EncounterLightSource | StageSound>;
  removeSourceFn: (encounterId: string, id: number) => Promise<void>;
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
      const encounterSource = await this.params.placeSourceFn(
        this.params.encounterId,
        this.params.id,
        this.params.position,
        this.params.range,
        this.params.intensity,
        this.params.hasGradient,
      );
      this.id = encounterSource.index;
    })();
  }

  async undo(): Promise<void> {
    await this.executePromise;
    if (this.id) {
      await this.params.removeSourceFn(this.params.encounterId, this.id);
    }
  }
}

export interface RemoveSourceCommandParams {
  encounterId: string;
  encounterSource: EncounterLightSource | StageSound;
  placeSourceFn: (
    encounterId: string,
    id: number,
    position: Point,
    range?: number,
    intensity?: number,
    hasGradient?: boolean,
  ) => Promise<EncounterLightSource | StageSound>;
  removeSourceFn: (encounterId: string, id: number) => Promise<void>;
}

export class RemoveSourceCommand implements Command {
  private executePromise?: Promise<void>;
  description: string;

  constructor(private params: RemoveSourceCommandParams) {
    this.description = 'Remove Source';
  }

  execute(): void {
    this.executePromise = this.params.removeSourceFn(this.params.encounterId, this.params.encounterSource.index);
  }

  async undo(): Promise<void> {
    await this.executePromise;
    const source = this.params.encounterSource;
    // Handle both light sources (range) and sound sources (radius)
    const rangeOrRadius = 'range' in source ? source.range : source.radius;
    await this.params.placeSourceFn(
      this.params.encounterId,
      source.index,
      source.position,
      rangeOrRadius,
      undefined,
      undefined,
    );
  }
}

export interface UpdateWallVerticesCommandParams {
  encounterId: string;
  encounterWallId: string;
  oldVertices: Point[];
  newVertices: Point[];
  updateWallFn: (encounterId: string, encounterWallId: string, vertices: Point[]) => Promise<void>;
}

export class UpdateWallVerticesCommand implements Command {
  private executePromise?: Promise<void>;
  description: string;

  constructor(private params: UpdateWallVerticesCommandParams) {
    this.description = 'Update Wall Vertices';
  }

  execute(): void {
    this.executePromise = this.params.updateWallFn(
      this.params.encounterId,
      this.params.encounterWallId,
      this.params.newVertices,
    );
  }

  async undo(): Promise<void> {
    await this.executePromise;
    await this.params.updateWallFn(this.params.encounterId, this.params.encounterWallId, this.params.oldVertices);
  }
}
