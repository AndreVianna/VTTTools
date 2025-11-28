import { useTheme } from '@mui/material/styles';
import type Konva from 'konva';
import type React from 'react';
import { useMemo } from 'react';
import { Line } from 'react-konva';
import type { PlacedRegion } from '@/types/domain';
import { calculatePolygonCentroid } from '@/utils/geometryUtils';
import { getRegionColor, getRegionFillOpacity, isTransparentRegion } from '@/utils/regionColorUtils';
import type { InteractionScope } from '@/utils/scopeFiltering';
import { isRegionInScope } from '@/utils/scopeFiltering';
import { RegionLabelDisplay } from './RegionLabelDisplay';

export interface RegionRendererProps {
  encounterRegion: PlacedRegion;
  allRegions: PlacedRegion[];
  activeScope: InteractionScope;
  onSelect?: (index: number) => void;
  isSelected?: boolean;
}

export const RegionRenderer: React.FC<RegionRendererProps> = ({
  encounterRegion,
  allRegions,
  activeScope,
  onSelect,
  isSelected = false,
}) => {
  const theme = useTheme();
  const isInteractive = isRegionInScope(activeScope);

  const handleClick = (e: Konva.KonvaEventObject<MouseEvent>) => {
    if (onSelect && isInteractive) {
      e.cancelBubble = true;
      onSelect(encounterRegion.index);
    }
  };

  const firstVertex = encounterRegion.vertices[0];
  if (!firstVertex) return null;

  const color = getRegionColor(encounterRegion, allRegions);
  const fillOpacity = getRegionFillOpacity(encounterRegion);
  const isTransparent = isTransparentRegion(encounterRegion);

  const labelText =
    encounterRegion.label ||
    (encounterRegion.value !== undefined && encounterRegion.value !== null
      ? `${encounterRegion.value}`
      : encounterRegion.type);

  const centroid = useMemo(
    () => calculatePolygonCentroid(encounterRegion.vertices),
    [encounterRegion.vertices],
  );

  const points = [...encounterRegion.vertices, firstVertex].flatMap((v) => [v.x, v.y]);

  if (import.meta.env.DEV && !encounterRegion.id) {
    console.warn('[RegionRenderer] Missing ID for region at index', encounterRegion.index);
  }

  return (
    <>
      <Line
        id={encounterRegion.id}
        points={points}
        fill={isTransparent ? 'transparent' : color}
        stroke={isSelected ? theme.palette.primary.main : isTransparent ? theme.palette.grey[500] : color}
        strokeWidth={isSelected ? 4 : 2}
        opacity={isSelected ? 0.5 : encounterRegion.type === 'Illumination' ? fillOpacity : 0.3}
        fillOpacity={isTransparent ? 0 : 0.3}
        strokeOpacity={isSelected ? 1 : 0.8}
        closed={true}
        listening={isInteractive}
        onClick={handleClick}
        hitStrokeWidth={10}
        onMouseEnter={(e) => {
          if (!isInteractive) return;
          const container = e.target.getStage()?.container();
          if (container) {
            container.style.cursor = 'pointer';
          }
        }}
        onMouseLeave={(e) => {
          const container = e.target.getStage()?.container();
          if (container) {
            container.style.cursor = 'default';
          }
        }}
      />
      <RegionLabelDisplay centroid={centroid} label={labelText} />
    </>
  );
};

RegionRenderer.displayName = 'RegionRenderer';
