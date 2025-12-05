import type { EncounterLightSource, EncounterSoundSource } from '@/types/domain';
import type { Command } from '@/utils/commands';

export interface CreateLightSourceCommandParams {
  encounterId: string;
  source: EncounterLightSource;
  onCreate: (encounterId: string, source: Omit<EncounterLightSource, 'index'>) => Promise<EncounterLightSource>;
  onRemove: (encounterId: string, sourceIndex: number) => Promise<void>;
  onRefetch: () => Promise<void>;
}

export class CreateLightSourceCommand implements Command {
  readonly description: string;

  constructor(private params: CreateLightSourceCommandParams) {
    this.description = `Create light source "${params.source.name || 'Unnamed'}"`;
  }

  async execute(): Promise<void> {
    await this.redo();
  }

  async undo(): Promise<void> {
    await this.params.onRemove(this.params.encounterId, this.params.source.index);
    await this.params.onRefetch();
  }

  async redo(): Promise<void> {
    const { encounterId, source, onCreate, onRefetch } = this.params;
    const sourceData: Omit<EncounterLightSource, 'index'> = {
      name: source.name,
      type: source.type,
      position: source.position,
      range: source.range,
      isOn: source.isOn,
      ...(source.direction !== undefined && { direction: source.direction }),
      ...(source.arc !== undefined && { arc: source.arc }),
      ...(source.color !== undefined && { color: source.color }),
    };
    await onCreate(encounterId, sourceData);
    await onRefetch();
  }
}

export interface UpdateLightSourceCommandParams {
  encounterId: string;
  sourceIndex: number;
  oldSource: EncounterLightSource;
  newSource: EncounterLightSource;
  onUpdate: (encounterId: string, sourceIndex: number, updates: Partial<EncounterLightSource>) => Promise<void>;
  onRefetch: () => Promise<void>;
}

export class UpdateLightSourceCommand implements Command {
  readonly description: string;

  constructor(private params: UpdateLightSourceCommandParams) {
    this.description = `Update light source "${params.newSource.name || 'Unnamed'}"`;
  }

  async execute(): Promise<void> {
    await this.redo();
  }

  async undo(): Promise<void> {
    const { oldSource, encounterId, sourceIndex, onUpdate, onRefetch } = this.params;
    const updates: Partial<EncounterLightSource> = {
      name: oldSource.name,
      type: oldSource.type,
      position: oldSource.position,
      range: oldSource.range,
      isOn: oldSource.isOn,
      ...(oldSource.direction !== undefined && { direction: oldSource.direction }),
      ...(oldSource.arc !== undefined && { arc: oldSource.arc }),
      ...(oldSource.color !== undefined && { color: oldSource.color }),
    };
    await onUpdate(encounterId, sourceIndex, updates);
    await onRefetch();
  }

  async redo(): Promise<void> {
    const { newSource, encounterId, sourceIndex, onUpdate, onRefetch } = this.params;
    const updates: Partial<EncounterLightSource> = {
      name: newSource.name,
      type: newSource.type,
      position: newSource.position,
      range: newSource.range,
      isOn: newSource.isOn,
      ...(newSource.direction !== undefined && { direction: newSource.direction }),
      ...(newSource.arc !== undefined && { arc: newSource.arc }),
      ...(newSource.color !== undefined && { color: newSource.color }),
    };
    await onUpdate(encounterId, sourceIndex, updates);
    await onRefetch();
  }
}

export interface DeleteLightSourceCommandParams {
  encounterId: string;
  sourceIndex: number;
  source: EncounterLightSource;
  onAdd: (encounterId: string, source: Omit<EncounterLightSource, 'index'>) => Promise<EncounterLightSource>;
  onRemove: (encounterId: string, sourceIndex: number) => Promise<void>;
  onRefetch: () => Promise<void>;
}

export class DeleteLightSourceCommand implements Command {
  readonly description: string;
  private restoredIndex?: number;

  constructor(private params: DeleteLightSourceCommandParams) {
    this.description = `Delete light source "${params.source.name || 'Unnamed'}"`;
  }

  async execute(): Promise<void> {
    const { encounterId, sourceIndex, onRemove, onRefetch } = this.params;
    await onRemove(encounterId, sourceIndex);
    await onRefetch();
  }

  async undo(): Promise<void> {
    const { encounterId, source, onAdd, onRefetch } = this.params;
    const sourceData: Omit<EncounterLightSource, 'index'> = {
      name: source.name,
      type: source.type,
      position: source.position,
      range: source.range,
      isOn: source.isOn,
      ...(source.direction !== undefined && { direction: source.direction }),
      ...(source.arc !== undefined && { arc: source.arc }),
      ...(source.color !== undefined && { color: source.color }),
    };
    const restoredSource = await onAdd(encounterId, sourceData);
    this.restoredIndex = restoredSource.index;
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

export interface CreateSoundSourceCommandParams {
  encounterId: string;
  source: EncounterSoundSource;
  onCreate: (encounterId: string, source: Omit<EncounterSoundSource, 'index'>) => Promise<EncounterSoundSource>;
  onRemove: (encounterId: string, sourceIndex: number) => Promise<void>;
  onRefetch: () => Promise<void>;
}

export class CreateSoundSourceCommand implements Command {
  readonly description: string;

  constructor(private params: CreateSoundSourceCommandParams) {
    this.description = `Create sound source "${params.source.name || 'Unnamed'}"`;
  }

  async execute(): Promise<void> {
    await this.redo();
  }

  async undo(): Promise<void> {
    await this.params.onRemove(this.params.encounterId, this.params.source.index);
    await this.params.onRefetch();
  }

  async redo(): Promise<void> {
    const { encounterId, source, onCreate, onRefetch } = this.params;
    const sourceData: Omit<EncounterSoundSource, 'index'> = {
      name: source.name,
      position: source.position,
      range: source.range,
      isPlaying: source.isPlaying,
      ...(source.resourceId !== undefined && { resourceId: source.resourceId }),
    };
    await onCreate(encounterId, sourceData);
    await onRefetch();
  }
}

export interface UpdateSoundSourceCommandParams {
  encounterId: string;
  sourceIndex: number;
  oldSource: EncounterSoundSource;
  newSource: EncounterSoundSource;
  onUpdate: (encounterId: string, sourceIndex: number, updates: Partial<EncounterSoundSource>) => Promise<void>;
  onRefetch: () => Promise<void>;
}

export class UpdateSoundSourceCommand implements Command {
  readonly description: string;

  constructor(private params: UpdateSoundSourceCommandParams) {
    this.description = `Update sound source "${params.newSource.name || 'Unnamed'}"`;
  }

  async execute(): Promise<void> {
    await this.redo();
  }

  async undo(): Promise<void> {
    const { oldSource, encounterId, sourceIndex, onUpdate, onRefetch } = this.params;
    const updates: Partial<EncounterSoundSource> = {
      name: oldSource.name,
      position: oldSource.position,
      range: oldSource.range,
      isPlaying: oldSource.isPlaying,
      ...(oldSource.resourceId !== undefined && { resourceId: oldSource.resourceId }),
    };
    await onUpdate(encounterId, sourceIndex, updates);
    await onRefetch();
  }

  async redo(): Promise<void> {
    const { newSource, encounterId, sourceIndex, onUpdate, onRefetch } = this.params;
    const updates: Partial<EncounterSoundSource> = {
      name: newSource.name,
      position: newSource.position,
      range: newSource.range,
      isPlaying: newSource.isPlaying,
      ...(newSource.resourceId !== undefined && { resourceId: newSource.resourceId }),
    };
    await onUpdate(encounterId, sourceIndex, updates);
    await onRefetch();
  }
}

export interface DeleteSoundSourceCommandParams {
  encounterId: string;
  sourceIndex: number;
  source: EncounterSoundSource;
  onAdd: (encounterId: string, source: Omit<EncounterSoundSource, 'index'>) => Promise<EncounterSoundSource>;
  onRemove: (encounterId: string, sourceIndex: number) => Promise<void>;
  onRefetch: () => Promise<void>;
}

export class DeleteSoundSourceCommand implements Command {
  readonly description: string;
  private restoredIndex?: number;

  constructor(private params: DeleteSoundSourceCommandParams) {
    this.description = `Delete sound source "${params.source.name || 'Unnamed'}"`;
  }

  async execute(): Promise<void> {
    const { encounterId, sourceIndex, onRemove, onRefetch } = this.params;
    await onRemove(encounterId, sourceIndex);
    await onRefetch();
  }

  async undo(): Promise<void> {
    const { encounterId, source, onAdd, onRefetch } = this.params;
    const sourceData: Omit<EncounterSoundSource, 'index'> = {
      name: source.name,
      position: source.position,
      range: source.range,
      isPlaying: source.isPlaying,
      ...(source.resourceId !== undefined && { resourceId: source.resourceId }),
    };
    const restoredSource = await onAdd(encounterId, sourceData);
    this.restoredIndex = restoredSource.index;
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
