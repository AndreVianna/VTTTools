import { useTheme } from '@mui/material/styles';
import type { Context } from 'konva/lib/Context';
import type React from 'react';
import { useMemo } from 'react';
import { Circle, Shape, Text } from 'react-konva';
import { type EncounterLightSource, type EncounterWall, type Point, LightSourceType } from '@/types/domain';
import type { GridConfig } from '@/utils/gridCalculator';
import { calculateLineOfSight } from '@/utils/lineOfSightCalculation';
import { VertexMarker } from './VertexMarker';

const DEFAULT_COLORS: Record<LightSourceType, string> = {
  [LightSourceType.Natural]: '#FF9900',
  [LightSourceType.Artificial]: '#FFFFFF',
  [LightSourceType.Supernatural]: '#9370DB',
};

export interface LightSourcePreviewProps {
  centerPos: Point;
  range: number;
  lightSource: EncounterLightSource;
  walls: EncounterWall[];
  gridConfig: GridConfig;
}

export const LightSourcePreview: React.FC<LightSourcePreviewProps> = ({
  centerPos,
  range,
  lightSource,
  walls,
  gridConfig,
}) => {
  const theme = useTheme();
  const color = lightSource.color || DEFAULT_COLORS[lightSource.type] || '#FFFFFF';

  const opaqueWalls = useMemo(() => {
    return walls;
  }, [walls]);

  const losPolygon = useMemo(() => {
    const tempSource: EncounterLightSource = {
      index: -1,
      type: lightSource.type,
      position: centerPos,
      range,
      isOn: true,
      ...(lightSource.name !== undefined && { name: lightSource.name }),
      ...(lightSource.direction !== undefined && { direction: lightSource.direction }),
      ...(lightSource.arc !== undefined && { arc: lightSource.arc }),
    };
    return calculateLineOfSight(tempSource, range, opaqueWalls, gridConfig);
  }, [centerPos, range, opaqueWalls, gridConfig, lightSource]);

  const rangeInPixels = range * gridConfig.cellSize.width;

  return (
    <>
      <Circle
        x={centerPos.x}
        y={centerPos.y}
        radius={rangeInPixels}
        stroke={color}
        strokeWidth={1}
        dash={[5, 5]}
        opacity={0.5}
        listening={false}
      />

      <Shape
        sceneFunc={(context: Context) => {
          if (losPolygon.length < 3) return;

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

          context.fillStyle = color;
          context.globalAlpha = 0.3;
          context.fill();
        }}
        listening={false}
      />

      <VertexMarker position={centerPos} preview />

      <Text
        x={centerPos.x + 10}
        y={centerPos.y - 10}
        text={`Range: ${range.toFixed(1)}`}
        fontSize={14}
        fill={theme.palette.text.primary}
        listening={false}
      />
    </>
  );
};

LightSourcePreview.displayName = 'LightSourcePreview';

export const SOUND_PREVIEW_COLOR = '#4169E1';

export interface SoundSourcePreviewProps {
  centerPos: Point;
  range: number;
  gridConfig: GridConfig;
}

export const SoundSourcePreview: React.FC<SoundSourcePreviewProps> = ({
  centerPos,
  range,
  gridConfig,
}) => {
  const theme = useTheme();
  const rangeInPixels = range * gridConfig.cellSize.width;

  return (
    <>
      <Circle
        x={centerPos.x}
        y={centerPos.y}
        radius={rangeInPixels}
        stroke={SOUND_PREVIEW_COLOR}
        strokeWidth={1}
        dash={[10, 5]}
        opacity={0.5}
        listening={false}
      />

      <Circle
        x={centerPos.x}
        y={centerPos.y}
        radius={rangeInPixels}
        fill={SOUND_PREVIEW_COLOR}
        opacity={0.1}
        listening={false}
      />

      <VertexMarker position={centerPos} preview />

      <Text
        x={centerPos.x + 10}
        y={centerPos.y - 10}
        text={`Range: ${range.toFixed(1)}`}
        fontSize={14}
        fill={theme.palette.text.primary}
        listening={false}
      />
    </>
  );
};

SoundSourcePreview.displayName = 'SoundSourcePreview';
