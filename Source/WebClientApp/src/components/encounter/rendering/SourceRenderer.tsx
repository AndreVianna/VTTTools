import { useTheme } from '@mui/material/styles';
import type Konva from 'konva';
import type { Context } from 'konva/lib/Context';
import type React from 'react';
import { Fragment, useEffect, useMemo, useRef, useState } from 'react';
import { Circle, Group, Line, Shape } from 'react-konva';
import type { EncounterLightSource, EncounterWall } from '@/types/domain';
import { LightSourceType } from '@/types/domain';
import type { GridConfig } from '@/utils/gridCalculator';
import { calculateLineOfSight } from '@/utils/lineOfSightCalculation';
import { calculateAngleFromCenter, snapAngle } from '@/utils/rotationUtils';
import type { InteractionScope } from '@/utils/scopeFiltering';
import { isLightSourceInScope } from '@/utils/scopeFiltering';

export interface LightSourceRendererProps {
  encounterLightSource: EncounterLightSource;
  walls: EncounterWall[];
  gridConfig: GridConfig;
  activeScope: InteractionScope;
  onSelect?: (index: number) => void;
  onContextMenu?: (sourceIndex: number, position: { x: number; y: number }) => void;
  onPositionChange?: (sourceIndex: number, position: { x: number; y: number }) => void;
  onDirectionChange?: (sourceIndex: number, direction: number) => void;
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
  onDirectionChange,
  isSelected = false,
}) => {
  const theme = useTheme();
  const isInteractive = isLightSourceInScope(activeScope);
  const [dragPosition, setDragPosition] = useState<{ x: number; y: number } | null>(null);
  const [dragDirection, setDragDirection] = useState<number | null>(null);
  const [isRotating, setIsRotating] = useState(false);
  const positionRef = useRef(encounterLightSource.position);
  const directionRef = useRef(encounterLightSource.direction);

  useEffect(() => {
    // Reset drag state when position prop changes externally
    if (
      positionRef.current.x !== encounterLightSource.position.x ||
      positionRef.current.y !== encounterLightSource.position.y
    ) {
      // eslint-disable-next-line react-hooks/set-state-in-effect
      setDragPosition(null);
      positionRef.current = encounterLightSource.position;
    }
  }, [encounterLightSource.position]);

  useEffect(() => {
    // Reset drag state when direction prop changes externally
    if (directionRef.current !== encounterLightSource.direction) {
      // eslint-disable-next-line react-hooks/set-state-in-effect
      setDragDirection(null);
      directionRef.current = encounterLightSource.direction;
    }
  }, [encounterLightSource.direction]);

  const currentPosition = dragPosition ?? encounterLightSource.position;
  const currentDirection = dragDirection ?? encounterLightSource.direction;

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
        // Warm amber/fire color for torches and fireplaces
        return '#FF6B1A';
      case LightSourceType.Artificial:
        return '#FFFFFF';
      case LightSourceType.Supernatural:
        return '#9370DB';
      default:
        return '#FFFFFF';
    }
  };

  /**
   * Get gradient configuration based on light source type.
   * Natural lights (fire) have a warmer, more organic falloff.
   */
  const getGradientConfig = (type: LightSourceType, baseColor: string) => {
    if (type === LightSourceType.Natural) {
      // Fire-like gradient: bright warm center, orange mid-range, fades to transparent
      // More transparent overall to blend naturally
      const innerColor = `${baseColor}B3`; // 70% opacity - bright core
      const midColor = `${baseColor}66`;   // 40% opacity - warm glow
      const outerColor = `${baseColor}1A`; // 10% opacity - subtle edge
      const transparentColor = `${baseColor}00`;
      return [0, innerColor, 0.3, midColor, 0.7, outerColor, 1, transparentColor];
    }
    // Default gradient for Artificial and Supernatural
    const centerColor = `${baseColor}99`; // 60% opacity
    const transparentColor = `${baseColor}00`;
    return [0, centerColor, 1, transparentColor];
  };

  const effectiveRange = encounterLightSource.range;

  const losPolygon = useMemo(() => {
    if (effectiveRange <= 0 || !currentPosition) {
      return [];
    }
    const sourceWithCurrentPosition: EncounterLightSource = {
      ...encounterLightSource,
      position: currentPosition,
      ...(currentDirection !== undefined && currentDirection !== null ? { direction: currentDirection } : {}),
    };
    return calculateLineOfSight(sourceWithCurrentPosition, effectiveRange, walls, gridConfig);
  }, [
    currentPosition,
    encounterLightSource,
    currentDirection,
    effectiveRange,
    walls,
    gridConfig,
  ]);

  const isDirectional = encounterLightSource.direction != null && encounterLightSource.arc != null;
  const directionRadians = isDirectional ? (currentDirection! * Math.PI) / 180 : 0;

  const rangeInPixels = effectiveRange * gridConfig.cellSize.width;
  const color = encounterLightSource.color || getDefaultColorForType(encounterLightSource.type);
  const gradientColorStops = getGradientConfig(encounterLightSource.type, color);

  const isLightOn = encounterLightSource.isOn;
  const effectiveOpacity = isLightOn ? 1.0 : 0.0;

  const useSimpleCircle = losPolygon.length < 3;

  const gradientProps = {
    fillRadialGradientStartPoint: { x: 0, y: 0 },
    fillRadialGradientEndPoint: { x: 0, y: 0 },
    fillRadialGradientStartRadius: 0,
    fillRadialGradientEndRadius: rangeInPixels,
    fillRadialGradientColorStops: gradientColorStops,
  };

  const ROTATION_HANDLE_LENGTH = 50;
  const ROTATION_HANDLE_RADIUS = 6;

  const handleRotationMouseDown = (e: Konva.KonvaEventObject<MouseEvent>) => {
    e.cancelBubble = true;
    setIsRotating(true);

    const stage = e.target.getStage();
    if (!stage) return;

    let lastDirection = currentDirection ?? 0;

    const handleMouseMove = () => {
      const pointerPosition = stage.getPointerPosition();
      if (!pointerPosition) return;

      const stageScale = stage.scaleX();
      const canvasPosition = {
        x: (pointerPosition.x - stage.x()) / stageScale,
        y: (pointerPosition.y - stage.y()) / stageScale,
      };

      const newAngle = calculateAngleFromCenter(currentPosition, canvasPosition);
      const snappedAngle = snapAngle(newAngle);
      const directionDegrees = (snappedAngle + 270) % 360;
      lastDirection = directionDegrees;
      setDragDirection(directionDegrees);
    };

    const handleMouseUp = () => {
      setIsRotating(false);
      stage.off('mousemove', handleMouseMove);
      stage.off('mouseup', handleMouseUp);
      window.removeEventListener('mouseup', handleMouseUp);
      onDirectionChange?.(encounterLightSource.index, lastDirection);
    };

    stage.on('mousemove', handleMouseMove);
    stage.on('mouseup', handleMouseUp);
    window.addEventListener('mouseup', handleMouseUp);
  };

  const rotationHandle = isDirectional && isSelected ? (
    <Group x={currentPosition.x} y={currentPosition.y}>
      <Line
        points={[
          0,
          0,
          Math.cos(directionRadians) * ROTATION_HANDLE_LENGTH,
          Math.sin(directionRadians) * ROTATION_HANDLE_LENGTH,
        ]}
        stroke="#000000"
        strokeWidth={3}
        dash={[6, 4]}
        opacity={1}
        listening={false}
      />
      <Line
        points={[
          0,
          0,
          Math.cos(directionRadians) * ROTATION_HANDLE_LENGTH,
          Math.sin(directionRadians) * ROTATION_HANDLE_LENGTH,
        ]}
        stroke="#FFFFFF"
        strokeWidth={1}
        dash={[6, 4]}
        opacity={1}
        listening={false}
      />
      <Circle
        x={Math.cos(directionRadians) * ROTATION_HANDLE_LENGTH}
        y={Math.sin(directionRadians) * ROTATION_HANDLE_LENGTH}
        radius={ROTATION_HANDLE_RADIUS}
        fill={theme.palette.warning.main}
        stroke="#000000"
        strokeWidth={2}
        hitStrokeWidth={20}
        onMouseDown={handleRotationMouseDown}
        onMouseEnter={(e) => {
          const container = e.target.getStage()?.container();
          if (container) {
            container.style.cursor = isRotating ? 'grabbing' : 'grab';
          }
        }}
        onMouseLeave={(e) => {
          const container = e.target.getStage()?.container();
          if (container) {
            container.style.cursor = 'default';
          }
        }}
      />
    </Group>
  ) : null;

  const CENTER_HIT_RADIUS = 20;
  const CENTER_MARKER_RADIUS = 6;
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
        {rotationHandle}
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

          // Apply gradient color stops (array of [position, color] pairs)
          for (let i = 0; i < gradientColorStops.length; i += 2) {
            const position = gradientColorStops[i] as number;
            const stopColor = gradientColorStops[i + 1] as string;
            gradient.addColorStop(position, stopColor);
          }

          context.globalCompositeOperation = 'lighten';
          context.fillStyle = gradient;
          context.globalAlpha = effectiveOpacity;
          context.fill();

          if (isSelected) {
            context.globalCompositeOperation = 'source-over';
            context.strokeStyle = theme.palette.primary.main;
            context.lineWidth = 3;
            context.globalAlpha = 1.0;
            context.stroke();
          }
        }}
        listening={false}
      />
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
      {rotationHandle}
    </Fragment>
  );
};

LightSourceRenderer.displayName = 'LightSourceRenderer';
