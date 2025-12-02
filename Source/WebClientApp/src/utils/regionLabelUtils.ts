import type { EncounterRegion } from '@/types/domain';

export type RegionType = 'Elevation' | 'Terrain' | 'Illumination' | 'FogOfWar';

export const TERRAIN_VALUE_LABELS: Record<number, string> = {
  0: 'Normal',
  1: 'Difficult',
  2: 'Impassable',
};

export const ILLUMINATION_VALUE_LABELS: Record<number, string> = {
  [-2]: 'Darkness',
  [-1]: 'Dim',
  0: 'Normal',
  1: 'Bright',
};

export const FOG_OF_WAR_VALUE_LABELS: Record<number, string> = {
  0: 'Visible',
  1: 'Outdated',
  2: 'Hidden',
};

export const TERRAIN_VALUES = Object.entries(TERRAIN_VALUE_LABELS).map(([value, label]) => ({
  value: Number(value),
  label,
}));

export const ILLUMINATION_VALUES = Object.entries(ILLUMINATION_VALUE_LABELS)
  .map(([value, label]) => ({
    value: Number(value),
    label,
  }))
  .sort((a, b) => a.value - b.value);

export const FOG_OF_WAR_VALUES = Object.entries(FOG_OF_WAR_VALUE_LABELS).map(([value, label]) => ({
  value: Number(value),
  label,
}));

export function getRegionDisplayLabel(region: EncounterRegion): string {
  const value = region.value ?? 0;

  switch (region.type) {
    case 'Elevation':
      return value === 0 ? '0' : `${value > 0 ? '+' : ''}${value}`;

    case 'Terrain':
      return TERRAIN_VALUE_LABELS[value] ?? 'Normal';

    case 'Illumination':
      return ILLUMINATION_VALUE_LABELS[value] ?? 'Normal';

    case 'FogOfWar':
      return FOG_OF_WAR_VALUE_LABELS[value] ?? 'Visible';

    default:
      return region.type;
  }
}

export function getValidValuesForType(type: string): Array<{ value: number; label: string }> {
  switch (type) {
    case 'Terrain':
      return TERRAIN_VALUES;
    case 'Illumination':
      return ILLUMINATION_VALUES;
    case 'FogOfWar':
      return FOG_OF_WAR_VALUES;
    default:
      return [];
  }
}

export function getDefaultValueForType(type: string): number {
  switch (type) {
    case 'Terrain':
      return 0;
    case 'Illumination':
      return 0;
    case 'FogOfWar':
      return 2;
    default:
      return 0;
  }
}

export function labelToValue(type: string, label: string): number {
  switch (type) {
    case 'Terrain': {
      const entry = Object.entries(TERRAIN_VALUE_LABELS).find(([, l]) => l === label);
      return entry ? Number(entry[0]) : 0;
    }
    case 'Illumination': {
      const entry = Object.entries(ILLUMINATION_VALUE_LABELS).find(([, l]) => l === label);
      return entry ? Number(entry[0]) : 0;
    }
    case 'FogOfWar': {
      const entry = Object.entries(FOG_OF_WAR_VALUE_LABELS).find(([, l]) => l === label);
      return entry ? Number(entry[0]) : 2;
    }
    default:
      return 0;
  }
}
