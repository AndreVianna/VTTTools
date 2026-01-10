import type { PlacedRegion } from '@/types/domain';

const ELEVATION_GREEN = '#00FF00';
const ELEVATION_RED = '#FF0000';
const ELEVATION_NAVY = '#000080';

const TERRAIN_VALUE_COLORS: Record<number, string> = {
  0: '#4CAF50',
  1: '#FFC107',
  2: '#F44336',
};

const ILLUMINATION_VALUE_COLORS: Record<number, string> = {
  [-2]: '#000000',
  [-1]: '#000000',
  0: 'transparent',
  1: '#FFEB3B',
};

const ILLUMINATION_VALUE_OPACITIES: Record<number, number> = {
  [-2]: 0.75,
  [-1]: 0.5,
  0: 0,
  1: 0.25,
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

export function getTerrainColor(value: number): string {
  return TERRAIN_VALUE_COLORS[value] ?? TERRAIN_VALUE_COLORS[0]!;
}

export function getIlluminationColor(value: number): string {
  return ILLUMINATION_VALUE_COLORS[value] ?? ILLUMINATION_VALUE_COLORS[0]!;
}

export function getIlluminationOpacity(value: number): number {
  return ILLUMINATION_VALUE_OPACITIES[value] ?? ILLUMINATION_VALUE_OPACITIES[0]!;
}

export function getRegionFillOpacity(region: PlacedRegion): number {
  if (region.type === 'Illumination') {
    return getIlluminationOpacity(region.value ?? 0);
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
      return getTerrainColor(region.value ?? 0);
    case 'Illumination':
      return getIlluminationColor(region.value ?? 0);
    default:
      return '#9E9E9E';
  }
}

export function sortRegions(regions: PlacedRegion[]): PlacedRegion[] {
  return [...regions].sort((a, b) => {
    if (a.type === 'Elevation' && b.type === 'Elevation') {
      return (a.value ?? 0) - (b.value ?? 0);
    }
    if (a.type === 'Terrain' && b.type === 'Terrain') {
      return (a.value ?? 0) - (b.value ?? 0);
    }
    if (a.type === 'Illumination' && b.type === 'Illumination') {
      return (a.value ?? 0) - (b.value ?? 0);
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
      return (a.value ?? 0) - (b.value ?? 0);
    }
    if (a.type === 'Illumination' && b.type === 'Illumination') {
      return (a.value ?? 0) - (b.value ?? 0);
    }
    return 0;
  });
}

export function isTransparentRegion(region: PlacedRegion): boolean {
  return region.type === 'Illumination' && (region.value ?? 0) === 0;
}
