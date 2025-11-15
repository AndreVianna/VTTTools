import { useTheme } from '@mui/material/styles';
import type { Context } from 'konva/lib/Context';
import type React from 'react';
import { useMemo } from 'react';
import { Circle, Shape } from 'react-konva';
import type { EncounterSource, EncounterWall } from '@/types/domain';
import { WallVisibility } from '@/types/domain';
import type { GridConfig } from '@/utils/gridCalculator';
import { calculateLineOfSight } from '@/utils/lineOfSightCalculation';
import type { InteractionScope } from '@/utils/scopeFiltering';
import { isSourceInScope } from '@/utils/scopeFiltering';

export interface SourceRendererProps {
  encounterSource: EncounterSource;
  walls: EncounterWall[];
  gridConfig: GridConfig;
  activeScope: InteractionScope;
}

export const SourceRenderer: React.FC<SourceRendererProps> = ({
  encounterSource,
  walls,
  gridConfig,
  activeScope,
}) => {
  const theme = useTheme();
  const defaultColor = (() => {
    switch (encounterSource.type.toLowerCase()) {
      case 'light':
        return theme.palette.warning.light;
      case 'bright light':
        return theme.palette.warning.main;
      case 'dim light':
        return theme.palette.warning.dark;
      case 'darkness':
        return theme.palette.grey[800];
      case 'magical darkness':
        return theme.palette.grey[900];
      case 'sound':
        return theme.palette.info.light;
      default:
        return theme.palette.grey[400];
    }
  })();
  const color = encounterSource.color ?? defaultColor;

  const opaqueWalls = walls.filter((w) => w.visibility !== WallVisibility.Invisible);

  const effectiveRange = encounterSource.range ?? 5.0;
  const effectiveIntensity = encounterSource.intensity ?? 1.0;
  const effectiveIsGradient = encounterSource.hasGradient;

  const losPolygon = useMemo(() => {
    return calculateLineOfSight(encounterSource, effectiveRange, opaqueWalls, gridConfig);
  }, [encounterSource.position, encounterSource.type, effectiveRange, opaqueWalls, gridConfig.cellSize]);

  const rangeInPixels = effectiveRange * gridConfig.cellSize.width;
  const isInteractive = isSourceInScope(activeScope);

  const transparentColor = color.startsWith('#')
    ? `${color}00`
    : color.replace(')', ', 0)').replace('rgb(', 'rgba(');

  const useSimpleCircle = losPolygon.length < 3;

  const gradientProps = !effectiveIsGradient ? {} : {
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
        fill={effectiveIsGradient ? color : color}
        opacity={effectiveIntensity}
        {...gradientProps}
        listening={isInteractive}
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

        if (effectiveIsGradient) {
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
    />
  );
};

SourceRenderer.displayName = 'SourceRenderer';
