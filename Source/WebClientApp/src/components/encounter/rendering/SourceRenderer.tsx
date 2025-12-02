import type Konva from 'konva';
import type { Context } from 'konva/lib/Context';
import type React from 'react';
import { useMemo } from 'react';
import { Circle, Shape } from 'react-konva';
import type { EncounterSource, EncounterWall } from '@/types/domain';
import type { GridConfig } from '@/utils/gridCalculator';
import { calculateLineOfSight } from '@/utils/lineOfSightCalculation';
import type { InteractionScope } from '@/utils/scopeFiltering';
import { isSourceInScope } from '@/utils/scopeFiltering';

export interface SourceRendererProps {
  encounterSource: EncounterSource;
  walls: EncounterWall[];
  gridConfig: GridConfig;
  activeScope: InteractionScope;
  onSelect?: (index: number) => void;
}

export const SourceRenderer: React.FC<SourceRendererProps> = ({
  encounterSource,
  walls,
  gridConfig,
  activeScope,
  onSelect,
}) => {
  const isInteractive = isSourceInScope(activeScope);

  const handleClick = (e: Konva.KonvaEventObject<MouseEvent>) => {
    if (onSelect && isInteractive) {
      e.cancelBubble = true;
      onSelect(encounterSource.index);
    }
  };

  const handleMouseEnter = (e: Konva.KonvaEventObject<MouseEvent>) => {
    if (!isInteractive) return;
    const container = e.target.getStage()?.container();
    if (container) {
      container.style.cursor = 'pointer';
    }
  };

  const handleMouseLeave = (e: Konva.KonvaEventObject<MouseEvent>) => {
    const container = e.target.getStage()?.container();
    if (container) {
      container.style.cursor = 'default';
    }
  };
  const effectiveRange = encounterSource.range;
  const effectiveIntensity = encounterSource.intensity;

  const losPolygon = useMemo(() => {
    return calculateLineOfSight(encounterSource, effectiveRange, walls, gridConfig);
  }, [encounterSource.position, encounterSource.type, effectiveRange, walls, gridConfig.cellSize]);

  const rangeInPixels = effectiveRange * gridConfig.cellSize.width;
  const color = encounterSource.color;

  const transparentColor = color.startsWith('#')
    ? `${color}00`
    : color.replace(')', ', 0)').replace('rgb(', 'rgba(');

  const useSimpleCircle = losPolygon.length < 3;

  const gradientProps = !encounterSource.hasGradient ? {} : {
    fillRadialGradientStartPoint: { x: 0, y: 0 },
    fillRadialGradientEndPoint: { x: 0, y: 0 },
    fillRadialGradientStartRadius: 0,
    fillRadialGradientEndRadius: rangeInPixels,
    fillRadialGradientColorStops: [0, color, 1, transparentColor],
  };

  if (useSimpleCircle) {
    return (
      <Circle
        x={encounterSource.position.x}
        y={encounterSource.position.y}
        radius={rangeInPixels}
        fill={color}
        opacity={effectiveIntensity}
        {...gradientProps}
        listening={isInteractive}
        onClick={handleClick}
        onMouseEnter={handleMouseEnter}
        onMouseLeave={handleMouseLeave}
      />
    );
  }

  return (
    <Shape
      sceneFunc={(context: Context) => {
        const firstPoint = losPolygon[0];
        if (!firstPoint) return;

        context.beginPath();
        context.moveTo(firstPoint.x, firstPoint.y);
        for (let i = 1; i < losPolygon.length; i++) {
          const point = losPolygon[i];
          if (!point) continue;
          context.lineTo(point.x, point.y);
        }
        context.closePath();

        if (encounterSource.hasGradient) {
          const gradient = context.createRadialGradient(
            encounterSource.position.x,
            encounterSource.position.y,
            0,
            encounterSource.position.x,
            encounterSource.position.y,
            rangeInPixels,
          );

          gradient.addColorStop(0, color);
          gradient.addColorStop(1, transparentColor);

          context.fillStyle = gradient;
          context.globalAlpha = effectiveIntensity;
          context.fill();
        } else {
          context.fillStyle = color;
          context.globalAlpha = effectiveIntensity;
          context.fill();
        }
      }}
      listening={isInteractive}
      onClick={handleClick}
      onMouseEnter={handleMouseEnter}
      onMouseLeave={handleMouseLeave}
    />
  );
};

SourceRenderer.displayName = 'SourceRenderer';
