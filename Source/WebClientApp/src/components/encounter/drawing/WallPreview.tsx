import { useTheme } from '@mui/material';
import type React from 'react';
import { useMemo } from 'react';
import { Circle, Line } from 'react-konva';
import { type EncounterWall, type Point, type Pole, WallVisibility } from '@/types/domain';

export interface WallPreviewProps {
  poles: Pole[];
  previewPoint: Point | null;
  wall?: EncounterWall | undefined;
  isClosed?: boolean;
  visibility?: WallVisibility;
}

export const WallPreview: React.FC<WallPreviewProps> = ({
  poles,
  previewPoint,
  wall,
  isClosed: isClosedProp,
  visibility: visibilityProp,
}) => {
  const theme = useTheme();

  if (poles.length === 0) return null;

  const isClosed = isClosedProp ?? wall?.isClosed ?? false;
  const visibility = visibilityProp ?? wall?.visibility ?? WallVisibility.Normal;
  const blueColor = theme.palette.primary.main;

  const dashPattern = useMemo(() => {
    switch (visibility) {
      case WallVisibility.Fence:
        return [4, 4]; // dotted
      case WallVisibility.Invisible:
        return [8, 4]; // dashed
      case WallVisibility.Veil:
        return [8, 4, 2, 4]; // dot-dash
      default:
        return undefined; // solid
    }
  }, [visibility]);

  const contourColor = '#000000';
  const contourWidth = 5;
  const lineWidth = 3;

  return (
    <>
      {/* Black contours behind segment lines */}
      {poles.slice(0, -1).map((pole, index) => {
        const nextPole = poles[index + 1];
        if (!nextPole) return null;
        return (
          <Line
            key={`contour-${pole.x}-${pole.y}-${nextPole.x}-${nextPole.y}`}
            points={[pole.x, pole.y, nextPole.x, nextPole.y]}
            stroke={contourColor}
            strokeWidth={contourWidth}
            dash={dashPattern}
            opacity={0.5}
            listening={false}
          />
        );
      })}

      {/* Lines between consecutive poles */}
      {poles.slice(0, -1).map((pole, index) => {
        const nextPole = poles[index + 1];
        if (!nextPole) return null;
        return (
          <Line
            key={`segment-${pole.x}-${pole.y}-${nextPole.x}-${nextPole.y}`}
            points={[pole.x, pole.y, nextPole.x, nextPole.y]}
            stroke={blueColor}
            strokeWidth={lineWidth}
            dash={dashPattern}
            listening={false}
          />
        );
      })}

      {/* Closing line contour for closed walls - only when NOT actively placing */}
      {isClosed &&
        poles.length > 1 &&
        !previewPoint &&
        (() => {
          const firstPole = poles[0];
          const lastPole = poles[poles.length - 1];
          if (!firstPole || !lastPole) return null;
          return (
            <Line
              key='closing-contour'
              points={[firstPole.x, firstPole.y, lastPole.x, lastPole.y]}
              stroke={contourColor}
              strokeWidth={contourWidth}
              dash={dashPattern}
              opacity={0.5}
              listening={false}
            />
          );
        })()}

      {/* Closing line for closed walls - only when NOT actively placing */}
      {isClosed &&
        poles.length > 1 &&
        !previewPoint &&
        (() => {
          const firstPole = poles[0];
          const lastPole = poles[poles.length - 1];
          if (!firstPole || !lastPole) return null;
          return (
            <Line
              key='closing-line'
              points={[firstPole.x, firstPole.y, lastPole.x, lastPole.y]}
              stroke={blueColor}
              strokeWidth={lineWidth}
              dash={dashPattern}
              listening={false}
            />
          );
        })()}

      {/* Poles as 5px circles (blue) */}
      {poles.map((pole, index) => (
        <Circle
          key={`pole-${pole.x}-${pole.y}-${index}`}
          x={pole.x}
          y={pole.y}
          radius={5}
          fill={blueColor}
          listening={false}
        />
      ))}

      {/* Preview line contour from last pole to cursor */}
      {previewPoint &&
        poles.length > 0 &&
        (() => {
          const lastPole = poles[poles.length - 1];
          if (!lastPole) return null;
          return (
            <Line
              points={[lastPole.x, lastPole.y, previewPoint.x, previewPoint.y]}
              stroke={contourColor}
              strokeWidth={contourWidth}
              dash={dashPattern}
              opacity={0.5}
              listening={false}
            />
          );
        })()}

      {/* Preview line from last pole to cursor */}
      {previewPoint &&
        poles.length > 0 &&
        (() => {
          const lastPole = poles[poles.length - 1];
          if (!lastPole) return null;
          return (
            <Line
              points={[lastPole.x, lastPole.y, previewPoint.x, previewPoint.y]}
              stroke={blueColor}
              strokeWidth={lineWidth}
              dash={dashPattern}
              listening={false}
            />
          );
        })()}

      {/* Closing preview contour from cursor to first pole when wall is closed */}
      {previewPoint &&
        isClosed &&
        poles.length > 0 &&
        (() => {
          const firstPole = poles[0];
          if (!firstPole) return null;
          return (
            <Line
              points={[previewPoint.x, previewPoint.y, firstPole.x, firstPole.y]}
              stroke={contourColor}
              strokeWidth={contourWidth}
              dash={dashPattern}
              opacity={0.5}
              listening={false}
            />
          );
        })()}

      {/* Closing preview line from cursor to first pole when wall is closed */}
      {previewPoint &&
        isClosed &&
        poles.length > 0 &&
        (() => {
          const firstPole = poles[0];
          if (!firstPole) return null;
          return (
            <Line
              points={[previewPoint.x, previewPoint.y, firstPole.x, firstPole.y]}
              stroke={blueColor}
              strokeWidth={lineWidth}
              dash={dashPattern}
              listening={false}
            />
          );
        })()}
    </>
  );
};

WallPreview.displayName = 'WallPreview';
