import type { EncounterRegion, PlacedRegion } from '@/types/domain';
import type { Command } from '@/utils/commands';

export interface CreateFogOfWarRegionCommandParams {
  encounterId: string;
  region: PlacedRegion;
  onAdd: (encounterId: string, region: Omit<EncounterRegion, 'index' | 'encounterId'>) => Promise<EncounterRegion>;
  onRemove: (encounterId: string, regionIndex: number) => Promise<void>;
  onRefetch: () => Promise<void>;
}

export class CreateFogOfWarRegionCommand implements Command {
  readonly description: string;
  private createdIndex?: number;

  constructor(private params: CreateFogOfWarRegionCommandParams) {
    this.description = `Create Fog of War region "${params.region.name}"`;
  }

  async execute(): Promise<void> {
    const { encounterId, region, onAdd, onRefetch } = this.params;
    const regionData: Omit<EncounterRegion, 'index' | 'encounterId'> = {
      name: region.name,
      type: region.type,
      vertices: region.vertices,
      value: region.value ?? 2,
    };
    const created = await onAdd(encounterId, regionData);
    this.createdIndex = created.index;
    await onRefetch();
  }

  async undo(): Promise<void> {
    if (this.createdIndex !== undefined) {
      await this.params.onRemove(this.params.encounterId, this.createdIndex);
      await this.params.onRefetch();
    }
  }

  async redo(): Promise<void> {
    const { encounterId, region, onAdd, onRefetch } = this.params;
    const regionData: Omit<EncounterRegion, 'index' | 'encounterId'> = {
      name: region.name,
      type: region.type,
      vertices: region.vertices,
      value: region.value ?? 2,
    };
    const created = await onAdd(encounterId, regionData);
    this.createdIndex = created.index;
    await onRefetch();
  }
}

export interface DeleteFogOfWarRegionCommandParams {
  encounterId: string;
  regionIndex: number;
  region: EncounterRegion;
  onAdd: (encounterId: string, region: Omit<EncounterRegion, 'index' | 'encounterId'>) => Promise<EncounterRegion>;
  onRemove: (encounterId: string, regionIndex: number) => Promise<void>;
  onRefetch: () => Promise<void>;
}

export class DeleteFogOfWarRegionCommand implements Command {
  readonly description: string;
  private restoredIndex?: number;

  constructor(private params: DeleteFogOfWarRegionCommandParams) {
    this.description = `Delete Fog of War region "${params.region.name}"`;
  }

  async execute(): Promise<void> {
    const { encounterId, regionIndex, onRemove, onRefetch } = this.params;
    await onRemove(encounterId, regionIndex);
    await onRefetch();
  }

  async undo(): Promise<void> {
    const { encounterId, region, onAdd, onRefetch } = this.params;
    const regionData: Omit<EncounterRegion, 'index' | 'encounterId'> = {
      name: region.name,
      type: region.type,
      vertices: region.vertices,
      value: region.value ?? 2,
    };
    const restoredRegion = await onAdd(encounterId, regionData);
    this.restoredIndex = restoredRegion.index;
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

export interface RevealAllFogOfWarCommandParams {
  encounterId: string;
  fogRegions: EncounterRegion[];
  onAdd: (encounterId: string, region: Omit<EncounterRegion, 'index' | 'encounterId'>) => Promise<EncounterRegion>;
  onRemove: (encounterId: string, regionIndex: number) => Promise<void>;
  onRefetch: () => Promise<void>;
}

export class RevealAllFogOfWarCommand implements Command {
  readonly description = 'Reveal all Fog of War';
  private restoredIndices: number[] = [];

  constructor(private params: RevealAllFogOfWarCommandParams) {}

  async execute(): Promise<void> {
    const { encounterId, fogRegions, onRemove, onRefetch } = this.params;
    for (const region of fogRegions) {
      await onRemove(encounterId, region.index);
    }
    await onRefetch();
  }

  async undo(): Promise<void> {
    const { encounterId, fogRegions, onAdd, onRefetch } = this.params;
    this.restoredIndices = [];
    for (const region of fogRegions) {
      const regionData: Omit<EncounterRegion, 'index' | 'encounterId'> = {
        name: region.name,
        type: region.type,
        vertices: region.vertices,
        value: region.value ?? 2,
      };
      const restoredRegion = await onAdd(encounterId, regionData);
      this.restoredIndices.push(restoredRegion.index);
    }
    await onRefetch();
  }

  async redo(): Promise<void> {
    const { encounterId, onRemove, onRefetch } = this.params;
    for (const index of this.restoredIndices) {
      await onRemove(encounterId, index);
    }
    this.restoredIndices = [];
    await onRefetch();
  }
}
