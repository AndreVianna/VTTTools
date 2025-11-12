export type RegionType = 'Elevation' | 'Terrain' | 'Illumination';

export interface RegionPreset {
  name: string;
  type: RegionType;
  defaultValue?: number;
  defaultLabel?: string;
  color: string;
  description: string;
}

export const TERRAIN_VALUES = ['Normal', 'Difficult', 'Impassable'] as const;
export type TerrainValue = (typeof TERRAIN_VALUES)[number];

export const ILLUMINATION_VALUES = ['Normal', 'Dim', 'Dark', 'Bright'] as const;
export type IlluminationValue = (typeof ILLUMINATION_VALUES)[number];

/**
 * Predefined region presets for common region types.
 * Colors are fixed hex values for consistent encounter rendering across themes.
 * These colors are applied to canvas objects, not UI elements.
 */
export const REGION_PRESETS: RegionPreset[] = [
  {
    name: 'Elevation',
    type: 'Elevation',
    defaultValue: 0,
    color: '#ed6c02',
    description: 'Height change area (in feet)',
  },
  {
    name: 'Terrain',
    type: 'Terrain',
    defaultLabel: 'Normal',
    color: '#2e7d32',
    description: 'Movement difficulty area',
  },
  {
    name: 'Illumination',
    type: 'Illumination',
    defaultLabel: 'Normal',
    color: '#ffa726',
    description: 'Light level area',
  },
];
