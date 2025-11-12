import type { EncounterRegion } from '@/types/domain';
import type { Command } from '@/utils/commands';

export interface CreateRegionCommandParams {
  encounterId: string;
  region: EncounterRegion;
  onCreate: (encounterId: string, region: Omit<EncounterRegion, 'index' | 'encounterId'>) => Promise<EncounterRegion>;
  onRemove: (encounterId: string, regionIndex: number) => Promise<void>;
  onRefetch: () => Promise<void>;
}

export class CreateRegionCommand implements Command {
  readonly description: string;

  constructor(private params: CreateRegionCommandParams) {
    this.description = `Create region "${params.region.name}"`;
  }

  async execute(): Promise<void> {
    await this.redo();
  }

  async undo(): Promise<void> {
    await this.params.onRemove(this.params.encounterId, this.params.region.index);
    await this.params.onRefetch();
  }

  async redo(): Promise<void> {
    const { encounterId, region, onCreate, onRefetch } = this.params;
    const regionData: Omit<EncounterRegion, 'index' | 'encounterId'> = {
      name: region.name,
      type: region.type,
      vertices: region.vertices,
      ...(region.value !== undefined && { value: region.value }),
      ...(region.label !== undefined && { label: region.label }),
      ...(region.color !== undefined && { color: region.color }),
    };
    await onCreate(encounterId, regionData);
    await onRefetch();
  }
}

export interface EditRegionCommandParams {
  encounterId: string;
  regionIndex: number;
  oldRegion: EncounterRegion;
  newRegion: EncounterRegion;
  onUpdate: (encounterId: string, regionIndex: number, updates: Partial<EncounterRegion>) => Promise<void>;
  onRefetch: () => Promise<void>;
}

export class EditRegionCommand implements Command {
  readonly description: string;

  constructor(private params: EditRegionCommandParams) {
    this.description = `Edit region "${params.newRegion.name}"`;
  }

  async execute(): Promise<void> {
    await this.redo();
  }

  async undo(): Promise<void> {
    const { oldRegion, encounterId, regionIndex, onUpdate, onRefetch } = this.params;
    const updates: Partial<EncounterRegion> = {
      name: oldRegion.name,
      type: oldRegion.type,
      vertices: oldRegion.vertices,
      ...(oldRegion.value !== undefined && { value: oldRegion.value }),
      ...(oldRegion.label !== undefined && { label: oldRegion.label }),
      ...(oldRegion.color !== undefined && { color: oldRegion.color }),
    };
    await onUpdate(encounterId, regionIndex, updates);
    await onRefetch();
  }

  async redo(): Promise<void> {
    const { newRegion, encounterId, regionIndex, onUpdate, onRefetch } = this.params;
    const updates: Partial<EncounterRegion> = {
      name: newRegion.name,
      type: newRegion.type,
      vertices: newRegion.vertices,
      ...(newRegion.value !== undefined && { value: newRegion.value }),
      ...(newRegion.label !== undefined && { label: newRegion.label }),
      ...(newRegion.color !== undefined && { color: newRegion.color }),
    };
    await onUpdate(encounterId, regionIndex, updates);
    await onRefetch();
  }
}

export interface DeleteRegionCommandParams {
  encounterId: string;
  regionIndex: number;
  region: EncounterRegion;
  onAdd: (encounterId: string, region: Omit<EncounterRegion, 'index' | 'encounterId'>) => Promise<EncounterRegion>;
  onRemove: (encounterId: string, regionIndex: number) => Promise<void>;
  onRefetch: () => Promise<void>;
}

export class DeleteRegionCommand implements Command {
  readonly description: string;
  private restoredIndex?: number;

  constructor(private params: DeleteRegionCommandParams) {
    this.description = `Delete region "${params.region.name}"`;
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
      ...(region.value !== undefined && { value: region.value }),
      ...(region.label !== undefined && { label: region.label }),
      ...(region.color !== undefined && { color: region.color }),
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
