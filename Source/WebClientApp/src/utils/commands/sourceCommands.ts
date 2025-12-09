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
    this.description = `Create light source "${params.source.name ?? 'Unnamed'}"`;
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
      type: source.type,
      position: source.position,
      range: source.range,
      isOn: source.isOn,
      ...(source.name !== undefined && { name: source.name }),
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
    this.description = `Update light source "${params.newSource.name ?? 'Unnamed'}"`;
  }

  async execute(): Promise<void> {
    await this.redo();
  }

  async undo(): Promise<void> {
    const { oldSource, encounterId, sourceIndex, onUpdate, onRefetch } = this.params;
    const updates: Partial<EncounterLightSource> = {
      type: oldSource.type,
      position: oldSource.position,
      range: oldSource.range,
      isOn: oldSource.isOn,
      ...(oldSource.name !== undefined && { name: oldSource.name }),
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
      type: newSource.type,
      position: newSource.position,
      range: newSource.range,
      isOn: newSource.isOn,
      ...(newSource.name !== undefined && { name: newSource.name }),
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
    this.description = `Delete light source "${params.source.name ?? 'Unnamed'}"`;
  }

  async execute(): Promise<void> {
    const { encounterId, sourceIndex, onRemove, onRefetch } = this.params;
    await onRemove(encounterId, sourceIndex);
    await onRefetch();
  }

  async undo(): Promise<void> {
    const { encounterId, source, onAdd, onRefetch } = this.params;
    const sourceData: Omit<EncounterLightSource, 'index'> = {
      type: source.type,
      position: source.position,
      range: source.range,
      isOn: source.isOn,
      ...(source.name !== undefined && { name: source.name }),
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
    this.description = `Create sound source "${params.source.name ?? 'Unnamed'}"`;
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
      position: source.position,
      range: source.range,
      isPlaying: source.isPlaying,
      resource: source.resource ?? null,
      ...(source.name !== undefined && { name: source.name }),
      ...(source.loop !== undefined && { loop: source.loop }),
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
    this.description = `Update sound source "${params.newSource.name ?? 'Unnamed'}"`;
  }

  async execute(): Promise<void> {
    await this.redo();
  }

  async undo(): Promise<void> {
    const { oldSource, encounterId, sourceIndex, onUpdate, onRefetch } = this.params;
    const updates: Partial<EncounterSoundSource> = {
      position: oldSource.position,
      range: oldSource.range,
      isPlaying: oldSource.isPlaying,
      resource: oldSource.resource ?? null,
      ...(oldSource.name !== undefined && { name: oldSource.name }),
      ...(oldSource.loop !== undefined && { loop: oldSource.loop }),
    };
    await onUpdate(encounterId, sourceIndex, updates);
    await onRefetch();
  }

  async redo(): Promise<void> {
    const { newSource, encounterId, sourceIndex, onUpdate, onRefetch } = this.params;
    const updates: Partial<EncounterSoundSource> = {
      position: newSource.position,
      range: newSource.range,
      isPlaying: newSource.isPlaying,
      resource: newSource.resource ?? null,
      ...(newSource.name !== undefined && { name: newSource.name }),
      ...(newSource.loop !== undefined && { loop: newSource.loop }),
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
    this.description = `Delete sound source "${params.source.name ?? 'Unnamed'}"`;
  }

  async execute(): Promise<void> {
    const { encounterId, sourceIndex, onRemove, onRefetch } = this.params;
    await onRemove(encounterId, sourceIndex);
    await onRefetch();
  }

  async undo(): Promise<void> {
    const { encounterId, source, onAdd, onRefetch } = this.params;
    const sourceData: Omit<EncounterSoundSource, 'index'> = {
      position: source.position,
      range: source.range,
      isPlaying: source.isPlaying,
      resource: source.resource ?? null,
      ...(source.name !== undefined && { name: source.name }),
      ...(source.loop !== undefined && { loop: source.loop }),
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
