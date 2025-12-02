import { useTheme } from '@mui/material';
import type React from 'react';
import { Circle, Line } from 'react-konva';
import type { Point, Pole } from '@/types/domain';

export interface WallPreviewProps {
  poles: Pole[];
  previewPoint: Point | null;
}

export const WallPreview: React.FC<WallPreviewProps> = ({ poles, previewPoint }) => {
  const theme = useTheme();

  if (poles.length === 0) return null;

  const blueColor = theme.palette.primary.main;

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
            listening={false}
          />
        );
      })}

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
              listening={false}
            />
          );
        })()}
    </>
  );
};

WallPreview.displayName = 'WallPreview';
