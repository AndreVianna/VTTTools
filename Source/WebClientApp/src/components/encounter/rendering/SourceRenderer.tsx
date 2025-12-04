import { useTheme } from '@mui/material/styles';
import type Konva from 'konva';
import type { Context } from 'konva/lib/Context';
import type React from 'react';
import { Fragment, useEffect, useMemo, useState } from 'react';
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
  onPositionChange?: (sourceIndex: number, position: { x: number; y: number }) => void;
  isSelected?: boolean;
}

export const LightSourceRenderer: React.FC<LightSourceRendererProps> = ({
  encounterLightSource,
  walls,
  gridConfig,
  activeScope,
  onSelect,
  onContextMenu,
  onPositionChange,
  isSelected = false,
}) => {
  const theme = useTheme();
  const isInteractive = isSourceInScope(activeScope);
  const [dragPosition, setDragPosition] = useState<{ x: number; y: number } | null>(null);

  // Clear drag position when the props position updates (API call completed)
  useEffect(() => {
    setDragPosition(null);
  }, [encounterLightSource.position.x, encounterLightSource.position.y]);

  const currentPosition = dragPosition ?? encounterLightSource.position;

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
    if (effectiveRange <= 0 || !currentPosition) {
      return [];
    }
    const sourceWithCurrentPosition = {
      ...encounterLightSource,
      position: currentPosition,
    };
    return calculateLineOfSight(sourceWithCurrentPosition, effectiveRange, walls, gridConfig);
  }, [
    currentPosition.x,
    currentPosition.y,
    encounterLightSource.type,
    encounterLightSource.direction,
    encounterLightSource.arc,
    effectiveRange,
    walls,
    gridConfig.cellSize.width,
    gridConfig.cellSize.height,
  ]);

  const isDirectional = encounterLightSource.direction != null && encounterLightSource.arc != null;
  const directionRadians = isDirectional ? (encounterLightSource.direction! * Math.PI) / 180 : 0;

  const rangeInPixels = effectiveRange * gridConfig.cellSize.width;
  const color = encounterLightSource.color ?? getDefaultColorForType(encounterLightSource.type);
  const centerColor = `${color}99`; // 60% opacity (0x99 = 153 = 60% of 255)
  const transparentColor = `${color}00`;

  const isLightOn = encounterLightSource.isOn;
  const effectiveOpacity = isLightOn ? 1.0 : 0.3;

  const useSimpleCircle = losPolygon.length < 3;

  const gradientProps = {
    fillRadialGradientStartPoint: { x: 0, y: 0 },
    fillRadialGradientEndPoint: { x: 0, y: 0 },
    fillRadialGradientStartRadius: 0,
    fillRadialGradientEndRadius: rangeInPixels,
    fillRadialGradientColorStops: [0, centerColor, 1, transparentColor],
  };

  const directionIndicatorLength = rangeInPixels * 0.4;
  const directionIndicator = isDirectional ? (
    <Line
      points={[
        currentPosition.x,
        currentPosition.y,
        currentPosition.x + Math.cos(directionRadians) * directionIndicatorLength,
        currentPosition.y + Math.sin(directionRadians) * directionIndicatorLength,
      ]}
      stroke={theme.palette.warning.main}
      strokeWidth={2}
      lineCap="round"
      opacity={effectiveOpacity}
      listening={false}
    />
  ) : null;

  const CENTER_HIT_RADIUS = 20;
  const CENTER_MARKER_RADIUS = 8;
  const CENTER_DOT_RADIUS = 3;

  const handleDragMove = (e: Konva.KonvaEventObject<DragEvent>) => {
    const node = e.target;
    setDragPosition({
      x: node.x(),
      y: node.y(),
    });
  };

  const handleDragEnd = (e: Konva.KonvaEventObject<DragEvent>) => {
    const node = e.target;
    const finalPosition = {
      x: node.x(),
      y: node.y(),
    };
    // Keep dragPosition set - it will be cleared by useEffect when props update
    if (onPositionChange && isSelected) {
      onPositionChange(encounterLightSource.index, finalPosition);
    }
  };

  // Small solid dot always visible at the center
  const centerDot = (
    <Circle
      x={currentPosition.x}
      y={currentPosition.y}
      radius={CENTER_DOT_RADIUS}
      fill={color}
      opacity={1}
      listening={false}
    />
  );

  // Larger draggable marker when selected
  const centerMarker = isSelected ? (
    <Circle
      x={currentPosition.x}
      y={currentPosition.y}
      radius={CENTER_MARKER_RADIUS}
      fill={theme.palette.primary.main}
      stroke={theme.palette.primary.contrastText}
      strokeWidth={2}
      draggable={isSelected && !!onPositionChange}
      onDragMove={handleDragMove}
      onDragEnd={handleDragEnd}
      onMouseEnter={(e) => {
        const container = e.target.getStage()?.container();
        if (container) {
          container.style.cursor = 'move';
        }
      }}
      onMouseLeave={(e) => {
        const container = e.target.getStage()?.container();
        if (container) {
          container.style.cursor = 'default';
        }
      }}
    />
  ) : null;

  if (useSimpleCircle) {
    return (
      <Fragment>
        <Circle
          x={currentPosition.x}
          y={currentPosition.y}
          radius={rangeInPixels}
          fill={color}
          opacity={effectiveOpacity}
          {...gradientProps}
          {...(isSelected && { stroke: theme.palette.primary.main, strokeWidth: 3 })}
          listening={false}
        />
        {directionIndicator}
        {centerDot}
        {isInteractive && !dragPosition && (
          <Circle
            x={currentPosition.x}
            y={currentPosition.y}
            radius={CENTER_HIT_RADIUS}
            fill="transparent"
            listening={true}
            onClick={handleClick}
            onContextMenu={handleContextMenu}
            onMouseEnter={handleMouseEnter}
            onMouseLeave={handleMouseLeave}
          />
        )}
        {centerMarker}
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
            currentPosition.x,
            currentPosition.y,
            0,
            currentPosition.x,
            currentPosition.y,
            rangeInPixels,
          );

          gradient.addColorStop(0, centerColor);
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
        listening={false}
      />
      {directionIndicator}
      {centerDot}
      {isInteractive && !dragPosition && (
        <Circle
          x={currentPosition.x}
          y={currentPosition.y}
          radius={CENTER_HIT_RADIUS}
          fill="transparent"
          listening={true}
          onClick={handleClick}
          onContextMenu={handleContextMenu}
          onMouseEnter={handleMouseEnter}
          onMouseLeave={handleMouseLeave}
        />
      )}
      {centerMarker}
    </Fragment>
  );
};

LightSourceRenderer.displayName = 'LightSourceRenderer';
