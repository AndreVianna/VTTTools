import { useTheme } from '@mui/material/styles';
import type Konva from 'konva';
import type { Context } from 'konva/lib/Context';
import type React from 'react';
import { Fragment, useMemo } from 'react';
import { Circle, Line, Shape } from 'react-konva';
import type { EncounterLightSource, EncounterWall } from '@/types/domain';
import { LightSourceType } from '@/types/domain';
import type { GridConfig } from '@/utils/gridCalculator';
import { calculateLineOfSight } from '@/utils/lineOfSightCalculation';
import type { InteractionScope } from '@/utils/scopeFiltering';
import { isSourceInScope } from '@/utils/scopeFiltering';

export interface LightSourceRendererProps {
  encounterLightSource: EncounterLightSource;
  walls: EncounterWall[];
  gridConfig: GridConfig;
  activeScope: InteractionScope;
  onSelect?: (index: number) => void;
  onContextMenu?: (sourceIndex: number, position: { x: number; y: number }) => void;
  isSelected?: boolean;
}

export const LightSourceRenderer: React.FC<LightSourceRendererProps> = ({
  encounterLightSource,
  walls,
  gridConfig,
  activeScope,
  onSelect,
  onContextMenu,
  isSelected = false,
}) => {
  const theme = useTheme();
  const isInteractive = isSourceInScope(activeScope);

  const handleClick = (e: Konva.KonvaEventObject<MouseEvent>) => {
    if (onSelect && isInteractive) {
      e.cancelBubble = true;
      onSelect(encounterLightSource.index);
    }
  };

  const handleContextMenu = (e: Konva.KonvaEventObject<MouseEvent>) => {
    e.evt.preventDefault();
    e.cancelBubble = true;
    if (onContextMenu && isInteractive) {
      const stage = e.target.getStage();
      const pointerPosition = stage?.getPointerPosition();
      if (pointerPosition) {
        onContextMenu(encounterLightSource.index, {
          x: pointerPosition.x,
          y: pointerPosition.y,
        });
      }
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

  const getDefaultColorForType = (type: LightSourceType): string => {
    switch (type) {
      case LightSourceType.Natural:
        return '#FF4500';
      case LightSourceType.Artificial:
        return '#FFFFFF';
      case LightSourceType.Supernatural:
        return '#9370DB';
      default:
        return '#FFFFFF';
    }
  };

  const effectiveRange = encounterLightSource.range;

  const losPolygon = useMemo(() => {
    return calculateLineOfSight(encounterLightSource, effectiveRange, walls, gridConfig);
  }, [
    encounterLightSource.position,
    encounterLightSource.type,
    encounterLightSource.direction,
    encounterLightSource.arc,
    effectiveRange,
    walls,
    gridConfig.cellSize,
  ]);

  const isDirectional = encounterLightSource.direction !== undefined;
  const directionRadians = isDirectional ? (encounterLightSource.direction! * Math.PI) / 180 : 0;

  const rangeInPixels = effectiveRange * gridConfig.cellSize.width;
  const color = encounterLightSource.color ?? getDefaultColorForType(encounterLightSource.type);
  const transparentColor = `${color}00`;

  const isLightOn = encounterLightSource.isOn;
  const effectiveOpacity = isLightOn ? 1.0 : 0.3;

  const useSimpleCircle = losPolygon.length < 3;

  const gradientProps = {
    fillRadialGradientStartPoint: { x: 0, y: 0 },
    fillRadialGradientEndPoint: { x: 0, y: 0 },
    fillRadialGradientStartRadius: 0,
    fillRadialGradientEndRadius: rangeInPixels,
    fillRadialGradientColorStops: [0, color, 1, transparentColor],
  };

  const directionIndicatorLength = rangeInPixels * 0.4;
  const directionIndicator = isDirectional ? (
    <Line
      points={[
        encounterLightSource.position.x,
        encounterLightSource.position.y,
        encounterLightSource.position.x + Math.cos(directionRadians) * directionIndicatorLength,
        encounterLightSource.position.y + Math.sin(directionRadians) * directionIndicatorLength,
      ]}
      stroke={theme.palette.warning.main}
      strokeWidth={2}
      lineCap="round"
      opacity={effectiveOpacity}
      listening={false}
    />
  ) : null;

  if (useSimpleCircle) {
    return (
      <Fragment>
        <Circle
          x={encounterLightSource.position.x}
          y={encounterLightSource.position.y}
          radius={rangeInPixels}
          fill={color}
          opacity={effectiveOpacity}
          {...gradientProps}
          stroke={isSelected ? theme.palette.primary.main : undefined}
          strokeWidth={isSelected ? 3 : 0}
          listening={isInteractive}
          onClick={handleClick}
          onContextMenu={handleContextMenu}
          onMouseEnter={handleMouseEnter}
          onMouseLeave={handleMouseLeave}
        />
        {directionIndicator}
      </Fragment>
    );
  }

  return (
    <Fragment>
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

          const gradient = context.createRadialGradient(
            encounterLightSource.position.x,
            encounterLightSource.position.y,
            0,
            encounterLightSource.position.x,
            encounterLightSource.position.y,
            rangeInPixels,
          );

          gradient.addColorStop(0, color);
          gradient.addColorStop(1, transparentColor);

          context.fillStyle = gradient;
          context.globalAlpha = effectiveOpacity;
          context.fill();

          if (isSelected) {
            context.strokeStyle = theme.palette.primary.main;
            context.lineWidth = 3;
            context.globalAlpha = 1.0;
            context.stroke();
          }
        }}
        listening={isInteractive}
        onClick={handleClick}
        onContextMenu={handleContextMenu}
        onMouseEnter={handleMouseEnter}
        onMouseLeave={handleMouseLeave}
      />
      {directionIndicator}
    </Fragment>
  );
};

LightSourceRenderer.displayName = 'LightSourceRenderer';
