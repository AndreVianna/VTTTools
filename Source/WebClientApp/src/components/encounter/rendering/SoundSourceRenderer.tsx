import { useTheme } from '@mui/material/styles';
import type Konva from 'konva';
import type { Context } from 'konva/lib/Context';
import type React from 'react';
import { Fragment, useMemo } from 'react';
import { Circle, Shape } from 'react-konva';
import type { EncounterSoundSource } from '@/types/domain';
import type { GridConfig } from '@/utils/gridCalculator';
import type { InteractionScope } from '@/utils/scopeFiltering';
import { isSourceInScope } from '@/utils/scopeFiltering';

export interface SoundSourceRendererProps {
  encounterSoundSource: EncounterSoundSource;
  gridConfig: GridConfig;
  activeScope: InteractionScope;
  onSelect?: (index: number) => void;
  onContextMenu?: (sourceIndex: number, position: { x: number; y: number }) => void;
  isSelected?: boolean;
}

export const SOUND_COLOR = '#4169E1';

export const SoundSourceRenderer: React.FC<SoundSourceRendererProps> = ({
  encounterSoundSource,
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
      container.style.cursor = 'pointer';
    }
  };

  const handleMouseLeave = (e: Konva.KonvaEventObject<MouseEvent>) => {
    const container = e.target.getStage()?.container();
    if (container) {
      container.style.cursor = 'default';
    }
  };

  const rangeInPixels = encounterSoundSource.range * gridConfig.cellSize.width;
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
          x={encounterSoundSource.position.x}
          y={encounterSoundSource.position.y}
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
  }, [encounterSoundSource.position.x, encounterSoundSource.position.y, rangeInPixels, effectiveOpacity]);

  return (
    <Fragment>
      <Shape
        sceneFunc={(context: Context) => {
          context.beginPath();
          context.arc(
            encounterSoundSource.position.x,
            encounterSoundSource.position.y,
            rangeInPixels,
            0,
            2 * Math.PI,
          );
          context.closePath();

          const gradient = context.createRadialGradient(
            encounterSoundSource.position.x,
            encounterSoundSource.position.y,
            0,
            encounterSoundSource.position.x,
            encounterSoundSource.position.y,
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
        listening={true}
        onClick={handleClick}
        onContextMenu={handleContextMenu}
        onMouseEnter={handleMouseEnter}
        onMouseLeave={handleMouseLeave}
      />
      {concentricRings}
      <Circle
        x={encounterSoundSource.position.x}
        y={encounterSoundSource.position.y}
        radius={4}
        fill={SOUND_COLOR}
        stroke={theme.palette.background.paper}
        strokeWidth={1}
        opacity={effectiveOpacity}
        listening={false}
      />
    </Fragment>
  );
};

SoundSourceRenderer.displayName = 'SoundSourceRenderer';
