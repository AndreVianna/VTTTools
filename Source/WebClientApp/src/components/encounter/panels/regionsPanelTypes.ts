export type RegionType = 'Elevation' | 'Terrain' | 'Illumination';

export interface RegionPreset {
  name: string;
  type: RegionType;
  defaultValue?: number;
  defaultLabel?: string;
  description: string;
}

export const TERRAIN_VALUES = ['Normal', 'Difficult', 'Impassable'] as const;
export type TerrainValue = (typeof TERRAIN_VALUES)[number];

export const ILLUMINATION_VALUES = ['Normal', 'Dim', 'Dark', 'Bright'] as const;
export type IlluminationValue = (typeof ILLUMINATION_VALUES)[number];

export const REGION_PRESETS: RegionPreset[] = [
  {
    name: 'Elevation',
    type: 'Elevation',
    defaultValue: 0,
    description: 'Height change area (in feet)',
  },
  {
    name: 'Terrain',
    type: 'Terrain',
    defaultLabel: 'Normal',
    description: 'Movement difficulty area',
  },
  {
    name: 'Illumination',
    type: 'Illumination',
    defaultLabel: 'Normal',
    description: 'Light level area',
  },
];
