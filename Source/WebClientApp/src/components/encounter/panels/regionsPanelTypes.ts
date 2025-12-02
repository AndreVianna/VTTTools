export type RegionType = 'Elevation' | 'Terrain' | 'Illumination';

export interface RegionPreset {
  name: string;
  type: RegionType;
  defaultValue: number;
  description: string;
}

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
    defaultValue: 0,
    description: 'Movement difficulty area',
  },
  {
    name: 'Illumination',
    type: 'Illumination',
    defaultValue: 0,
    description: 'Light level area',
  },
];
