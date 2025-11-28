import type { PlacedRegion } from '@/types/domain';

const ELEVATION_GREEN = '#00FF00';
const ELEVATION_RED = '#FF0000';
const ELEVATION_NAVY = '#000080';

const TERRAIN_COLORS: Record<string, string> = {
  Normal: '#4CAF50',
  Difficult: '#FFC107',
  Impassable: '#F44336',
};

const ILLUMINATION_COLORS: Record<string, string> = {
  Bright: '#FFEB3B',
  Normal: 'transparent',
  Dim: '#000000',
  Dark: '#000000',
};

const ILLUMINATION_OPACITIES: Record<string, number> = {
  Bright: 0.25,
  Normal: 0,
  Dim: 0.5,
  Dark: 0.75,
};

function hexToRgb(hex: string): { r: number; g: number; b: number } {
  const result = /^#?([a-f\d]{2})([a-f\d]{2})([a-f\d]{2})$/i.exec(hex);
  if (!result || !result[1] || !result[2] || !result[3]) {
    return { r: 0, g: 0, b: 0 };
  }
  return {
    r: parseInt(result[1], 16),
    g: parseInt(result[2], 16),
    b: parseInt(result[3], 16),
  };
}

function rgbToHex(r: number, g: number, b: number): string {
  return `#${((1 << 24) + (r << 16) + (g << 8) + b).toString(16).slice(1).toUpperCase()}`;
}

function interpolateColor(color1: string, color2: string, factor: number): string {
  const rgb1 = hexToRgb(color1);
  const rgb2 = hexToRgb(color2);

  const r = Math.round(rgb1.r + (rgb2.r - rgb1.r) * factor);
  const g = Math.round(rgb1.g + (rgb2.g - rgb1.g) * factor);
  const b = Math.round(rgb1.b + (rgb2.b - rgb1.b) * factor);

  return rgbToHex(r, g, b);
}

export function getElevationColor(
  value: number,
  sortedPositiveElevations: number[],
  sortedNegativeElevations: number[],
): string {
  if (value === 0) return ELEVATION_GREEN;

  if (value > 0) {
    const index = sortedPositiveElevations.indexOf(value);
    const count = sortedPositiveElevations.length;
    if (index === -1 || count === 0) return ELEVATION_GREEN;
    const factor = count > 1 ? (index + 1) / count : 1;
    return interpolateColor(ELEVATION_GREEN, ELEVATION_RED, factor);
  } else {
    const index = sortedNegativeElevations.indexOf(value);
    const count = sortedNegativeElevations.length;
    if (index === -1 || count === 0) return ELEVATION_GREEN;
    const factor = count > 1 ? (count - index) / count : 1;
    return interpolateColor(ELEVATION_GREEN, ELEVATION_NAVY, factor);
  }
}

export function getTerrainColor(label: string | undefined): string {
  if (!label) return TERRAIN_COLORS.Normal!;
  return TERRAIN_COLORS[label] ?? TERRAIN_COLORS.Normal!;
}

export function getIlluminationColor(label: string | undefined): string {
  if (!label) return ILLUMINATION_COLORS.Normal!;
  return ILLUMINATION_COLORS[label] ?? ILLUMINATION_COLORS.Normal!;
}

export function getIlluminationOpacity(label: string | undefined): number {
  if (!label) return ILLUMINATION_OPACITIES.Normal!;
  return ILLUMINATION_OPACITIES[label] ?? ILLUMINATION_OPACITIES.Normal!;
}

export function getRegionFillOpacity(region: PlacedRegion): number {
  if (region.type === 'Illumination') {
    return getIlluminationOpacity(region.label);
  }
  return 0.3;
}

export function getRegionColor(region: PlacedRegion, allRegions: PlacedRegion[]): string {
  switch (region.type) {
    case 'Elevation': {
      const elevationRegions = allRegions.filter((r) => r.type === 'Elevation');
      const elevationValues = elevationRegions
        .map((r) => r.value ?? 0)
        .filter((v, i, arr) => arr.indexOf(v) === i);

      const sortedPositive = elevationValues.filter((v) => v > 0).sort((a, b) => a - b);
      const sortedNegative = elevationValues.filter((v) => v < 0).sort((a, b) => a - b);

      return getElevationColor(region.value ?? 0, sortedPositive, sortedNegative);
    }
    case 'Terrain':
      return getTerrainColor(region.label);
    case 'Illumination':
      return getIlluminationColor(region.label);
    default:
      return '#9E9E9E';
  }
}

export function sortRegions(regions: PlacedRegion[]): PlacedRegion[] {
  return [...regions].sort((a, b) => {
    if (a.type === 'Elevation' && b.type === 'Elevation') {
      return (b.value ?? 0) - (a.value ?? 0);
    }
    if (a.type === 'Terrain' && b.type === 'Terrain') {
      const order: Record<string, number> = { Impassable: 0, Difficult: 1, Normal: 2 };
      return (order[a.label ?? ''] ?? 99) - (order[b.label ?? ''] ?? 99);
    }
    if (a.type === 'Illumination' && b.type === 'Illumination') {
      const order: Record<string, number> = { Bright: 0, Normal: 1, Dim: 2, Dark: 3 };
      return (order[a.label ?? ''] ?? 99) - (order[b.label ?? ''] ?? 99);
    }
    return 0;
  });
}

export function sortRegionsForRendering(regions: PlacedRegion[]): PlacedRegion[] {
  return [...regions].sort((a, b) => {
    if (a.type === 'Elevation' && b.type === 'Elevation') {
      return (a.value ?? 0) - (b.value ?? 0);
    }
    if (a.type === 'Terrain' && b.type === 'Terrain') {
      const order: Record<string, number> = { Normal: 0, Difficult: 1, Impassable: 2 };
      return (order[a.label ?? ''] ?? 99) - (order[b.label ?? ''] ?? 99);
    }
    if (a.type === 'Illumination' && b.type === 'Illumination') {
      const order: Record<string, number> = { Dark: 0, Dim: 1, Normal: 2, Bright: 3 };
      return (order[a.label ?? ''] ?? 99) - (order[b.label ?? ''] ?? 99);
    }
    return 0;
  });
}

export function isTransparentRegion(region: PlacedRegion): boolean {
  return region.type === 'Illumination' && region.label === 'Normal';
}
