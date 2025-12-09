import { useTheme } from '@mui/material/styles';
import type Konva from 'konva';
import type React from 'react';
import { Line } from 'react-konva';
import type { PlacedRegion } from '@/types/domain';
import { getRegionColor, getRegionFillOpacity, isTransparentRegion } from '@/utils/regionColorUtils';
import type { InteractionScope } from '@/utils/scopeFiltering';
import { isRegionInScope } from '@/utils/scopeFiltering';

export interface RegionRendererProps {
  encounterRegion: PlacedRegion;
  allRegions: PlacedRegion[];
  activeScope: InteractionScope;
  onSelect?: (index: number) => void;
  onContextMenu?: (regionIndex: number, position: { x: number; y: number }) => void;
  isSelected?: boolean;
}

export const RegionRenderer: React.FC<RegionRendererProps> = ({
  encounterRegion,
  allRegions,
  activeScope,
  onSelect,
  onContextMenu,
  isSelected = false,
}) => {
  const theme = useTheme();
  const isInteractive = isRegionInScope(activeScope);

  const handleClick = (e: Konva.KonvaEventObject<MouseEvent>) => {
    if (e.evt.button !== 0) return;
    if (onSelect && isInteractive) {
      e.cancelBubble = true;
      onSelect(encounterRegion.index);
    }
  };

  const handleContextMenu = (e: Konva.KonvaEventObject<MouseEvent>) => {
    e.evt.preventDefault();
    e.cancelBubble = true;

    if (onContextMenu && isInteractive) {
      const stage = e.target.getStage();
      const pointerPosition = stage?.getPointerPosition();
      if (pointerPosition) {
        onContextMenu(encounterRegion.index, {
          x: pointerPosition.x,
          y: pointerPosition.y,
        });
      }
    }
  };

  const firstVertex = encounterRegion.vertices[0];
  if (!firstVertex) return null;

  const color = getRegionColor(encounterRegion, allRegions);
  const fillOpacity = getRegionFillOpacity(encounterRegion);
  const isTransparent = isTransparentRegion(encounterRegion);
  const points = [...encounterRegion.vertices, firstVertex].flatMap((v) => [v.x, v.y]);

  if (import.meta.env.DEV && !encounterRegion.id) {
    console.warn('[RegionRenderer] Missing ID for region at index', encounterRegion.index);
  }

  return (
    <Line
      id={encounterRegion.id}
      points={points}
      fill={isTransparent ? 'transparent' : color}
      stroke={'#ff0000'}
      strokeWidth={1}
      opacity={isSelected ? 0.5 : encounterRegion.type === 'Illumination' ? fillOpacity : 0.3}
      fillOpacity={isTransparent ? 0 : 0.3}
      strokeOpacity={1}
      closed={true}
      listening={isInteractive}
      onClick={handleClick}
      onContextMenu={handleContextMenu}
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
  );
};

RegionRenderer.displayName = 'RegionRenderer';
