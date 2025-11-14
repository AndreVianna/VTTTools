import { useTheme } from '@mui/material/styles';
import type React from 'react';
import { Line } from 'react-konva';
import type { PlacedRegion } from '@/types/domain';
import { calculatePolygonCentroid } from '@/utils/geometryUtils';
import type { InteractionScope } from '@/utils/scopeFiltering';
import { isRegionInScope } from '@/utils/scopeFiltering';
import { REGION_PRESETS } from '../panels/regionsPanelTypes';
import { RegionLabelDisplay } from './RegionLabelDisplay';

export interface RegionRendererProps {
  encounterRegion: PlacedRegion;
  activeScope: InteractionScope;
}

export const RegionRenderer: React.FC<RegionRendererProps> = ({ encounterRegion, activeScope }) => {
  const theme = useTheme();

  const getRegionColor = (): string => {
    if (encounterRegion.color) {
      return encounterRegion.color;
    }

    const preset = REGION_PRESETS.find((p) => p.type === encounterRegion.type);
    if (preset) {
      return preset.color;
    }

    return theme.palette.grey[400];
  };

  const getLabelText = (): string => {
    if (encounterRegion.label) {
      return encounterRegion.label;
    }
    if (encounterRegion.value !== undefined && encounterRegion.value !== null) {
      return `${encounterRegion.value}`;
    }
    return encounterRegion.type;
  };

  const color = getRegionColor();
  const centroid = calculatePolygonCentroid(encounterRegion.vertices);
  const firstVertex = encounterRegion.vertices[0];
  if (!firstVertex) return null;
  const points = [...encounterRegion.vertices, firstVertex].flatMap((v) => [v.x, v.y]);

  const isInteractive = isRegionInScope(activeScope);

  if (import.meta.env.DEV && !encounterRegion.id) {
    console.warn('[RegionRenderer] Missing ID for region at index', encounterRegion.index);
  }

  return (
    <>
      <Line
        id={encounterRegion.id}
        points={points}
        fill={color}
        stroke={color}
        strokeWidth={2}
        opacity={0.3}
        fillOpacity={0.3}
        strokeOpacity={0.8}
        closed={true}
        listening={isInteractive}
      />
      <RegionLabelDisplay centroid={centroid} label={getLabelText()} />
    </>
  );
};

RegionRenderer.displayName = 'RegionRenderer';
