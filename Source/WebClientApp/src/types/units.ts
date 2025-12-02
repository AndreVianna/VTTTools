export enum UnitSystem {
  Imperial = 0,
  Metric = 1,
}

export interface UnitConfig {
  system: UnitSystem;
  abbreviation: string;
  name: string;
  defaultScale: number;
}

export const UNIT_CONFIGS: Record<UnitSystem, UnitConfig> = {
  [UnitSystem.Imperial]: {
    system: UnitSystem.Imperial,
    abbreviation: 'ft',
    name: 'feet',
    defaultScale: 5.0,
  },
  [UnitSystem.Metric]: {
    system: UnitSystem.Metric,
    abbreviation: 'm',
    name: 'meters',
    defaultScale: 1.5,
  },
};
