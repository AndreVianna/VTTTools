import { useTheme } from '@mui/material/styles';
import type Konva from 'konva';
import type { Context } from 'konva/lib/Context';
import type React from 'react';
import { Fragment, useEffect, useMemo, useRef, useState } from 'react';
import { Circle, Group, Path, Shape } from 'react-konva';
import type { EncounterSoundSource } from '@/types/domain';
import type { GridConfig } from '@/utils/gridCalculator';
import type { InteractionScope } from '@/utils/scopeFiltering';
import { isSoundSourceInScope } from '@/utils/scopeFiltering';

export interface SoundSourceRendererProps {
  encounterSoundSource: EncounterSoundSource;
  gridConfig: GridConfig;
  activeScope: InteractionScope;
  onSelect?: (index: number) => void;
  onContextMenu?: (sourceIndex: number, position: { x: number; y: number }) => void;
  onPositionChange?: (sourceIndex: number, position: { x: number; y: number }) => void;
  isSelected?: boolean;
}

export const SOUND_COLOR = '#4169E1';

export const SoundSourceRenderer: React.FC<SoundSourceRendererProps> = ({
  encounterSoundSource,
  gridConfig,
  activeScope,
  onSelect,
  onContextMenu,
  onPositionChange,
  isSelected = false,
}) => {
  const theme = useTheme();
  const isInteractive = isSoundSourceInScope(activeScope);
  const [dragPosition, setDragPosition] = useState<{ x: number; y: number } | null>(null);
  const positionRef = useRef(encounterSoundSource.position);

  useEffect(() => {
    // Reset drag state when position prop changes externally
    if (
      positionRef.current.x !== encounterSoundSource.position.x ||
      positionRef.current.y !== encounterSoundSource.position.y
    ) {
      // eslint-disable-next-line react-hooks/set-state-in-effect
      setDragPosition(null);
      positionRef.current = encounterSoundSource.position;
    }
  }, [encounterSoundSource.position]);

  const currentPosition = dragPosition ?? encounterSoundSource.position;

  const handleClick = (e: Konva.KonvaEventObject<MouseEvent>) => {
    if (onSelect && isInteractive) {
      e.cancelBubble = true;
      onSelect(encounterSoundSource.index);
    }
  };

  const handleContextMenu = (e: Konva.KonvaEventObject<MouseEvent>) => {
    e.evt.preventDefault();
    e.cancelBubble = true;
    if (onContextMenu && isInteractive) {
      const stage = e.target.getStage();
      const pointerPosition = stage?.getPointerPosition();
      if (pointerPosition) {
        onContextMenu(encounterSoundSource.index, {
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
      container.style.cursor = isSelected ? 'move' : 'pointer';
    }
  };

  const handleMouseLeave = (e: Konva.KonvaEventObject<MouseEvent>) => {
    const container = e.target.getStage()?.container();
    if (container) {
      container.style.cursor = 'default';
    }
  };

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
    if (onPositionChange && isSelected) {
      onPositionChange(encounterSoundSource.index, finalPosition);
    }
  };

  const rangeInPixels = encounterSoundSource.radius * gridConfig.cellSize.width;
  const transparentColor = `${SOUND_COLOR}00`;

  const effectiveOpacity = encounterSoundSource.isPlaying ? 1.0 : 0.3;

  const concentricRings = useMemo(() => {
    const ringCount = 3;
    const rings: React.ReactElement[] = [];

    for (let i = 1; i <= ringCount; i++) {
      const ringRadius = (rangeInPixels * i) / ringCount;
      const ringOpacity = effectiveOpacity * (1 - i / (ringCount + 1));

      rings.push(
        <Circle
          key={`ring-${i}`}
          x={currentPosition.x}
          y={currentPosition.y}
          radius={ringRadius}
          stroke={SOUND_COLOR}
          strokeWidth={1}
          dash={[5, 5]}
          opacity={ringOpacity}
          listening={false}
        />,
      );
    }

    return rings;
  }, [currentPosition.x, currentPosition.y, rangeInPixels, effectiveOpacity]);

  const ICON_SIZE = 12;
  const ICON_HIT_RADIUS = 8;

  const soundIconPath = 'M3 9v6h4l5 5V4L7 9H3zm13.5 3c0-1.77-1.02-3.29-2.5-4.03v8.05c1.48-.73 2.5-2.25 2.5-4.02zM14 3.23v2.06c2.89.86 5 3.54 5 6.71s-2.11 5.85-5 6.71v2.06c4.01-.91 7-4.49 7-8.77s-2.99-7.86-7-8.77z';

  return (
    <Fragment>
      <Shape
        sceneFunc={(context: Context) => {
          context.beginPath();
          context.arc(
            currentPosition.x,
            currentPosition.y,
            rangeInPixels,
            0,
            2 * Math.PI,
          );
          context.closePath();

          const gradient = context.createRadialGradient(
            currentPosition.x,
            currentPosition.y,
            0,
            currentPosition.x,
            currentPosition.y,
            rangeInPixels,
          );

          gradient.addColorStop(0, SOUND_COLOR);
          gradient.addColorStop(1, transparentColor);

          context.fillStyle = gradient;
          context.globalAlpha = effectiveOpacity * 0.2;
          context.fill();

          context.setLineDash([10, 5]);
          context.strokeStyle = SOUND_COLOR;
          context.lineWidth = 2;
          context.globalAlpha = effectiveOpacity;
          context.stroke();

          if (isSelected) {
            context.setLineDash([]);
            context.strokeStyle = theme.palette.primary.main;
            context.lineWidth = 3;
            context.globalAlpha = 1.0;
            context.stroke();
          }
        }}
        listening={false}
      />
      {concentricRings}

      <Group
        x={currentPosition.x}
        y={currentPosition.y}
        draggable={isSelected && !!onPositionChange}
        onDragMove={handleDragMove}
        onDragEnd={handleDragEnd}
        onClick={handleClick}
        onContextMenu={handleContextMenu}
        onMouseEnter={handleMouseEnter}
        onMouseLeave={handleMouseLeave}
      >
        <Circle
          radius={ICON_HIT_RADIUS}
          fill="transparent"
          listening={true}
        />

        <Circle
          radius={ICON_SIZE / 2 + 2}
          fill={theme.palette.background.paper}
          stroke={isSelected ? theme.palette.primary.main : SOUND_COLOR}
          strokeWidth={isSelected ? 2 : 1}
          opacity={1}
          listening={false}
        />

        <Path
          data={soundIconPath}
          x={-ICON_SIZE / 2}
          y={-ICON_SIZE / 2}
          fill={encounterSoundSource.isPlaying ? SOUND_COLOR : theme.palette.text.disabled}
          scaleX={ICON_SIZE / 24}
          scaleY={ICON_SIZE / 24}
          listening={false}
        />
      </Group>
    </Fragment>
  );
};

SoundSourceRenderer.displayName = 'SoundSourceRenderer';
