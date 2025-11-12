import { useTheme } from '@mui/material';
import type React from 'react';
import { Circle, Line } from 'react-konva';
import type { EncounterWall, Point, Pole } from '@/types/domain';

export interface WallPreviewProps {
  poles: Pole[];
  previewPoint: Point | null;
  wall?: EncounterWall | undefined;
}

export const WallPreview: React.FC<WallPreviewProps> = ({ poles, previewPoint, wall }) => {
  const theme = useTheme();

  if (poles.length === 0) return null;

  const isClosed = wall?.isClosed ?? false;
  const blueColor = theme.palette.primary.main;

  return (
    <>
      {/* Lines between consecutive poles (3px blue) */}
      {poles.slice(0, -1).map((pole, index) => {
        const nextPole = poles[index + 1];
        if (!nextPole) return null;
        return (
          <Line
            key={`segment-${pole.x}-${pole.y}-${nextPole.x}-${nextPole.y}`}
            points={[pole.x, pole.y, nextPole.x, nextPole.y]}
            stroke={blueColor}
            strokeWidth={3}
            listening={false}
          />
        );
      })}

      {/* Closing line for closed walls (first to last pole) - only when NOT actively placing */}
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
              strokeWidth={3}
              dash={[8, 4]}
              dashEnabled={true}
              perfectDrawEnabled={false}
              listening={false}
            />
          );
        })()}

      {/* Poles as 5px circles (blue) */}
      {poles.map((pole) => (
        <Circle key={`pole-${pole.x}-${pole.y}`} x={pole.x} y={pole.y} radius={5} fill={blueColor} listening={false} />
      ))}

      {/* Preview line from last pole to cursor - solid blue (same as normal wall segments) */}
      {previewPoint &&
        poles.length > 0 &&
        (() => {
          const lastPole = poles[poles.length - 1];
          if (!lastPole) return null;
          return (
            <Line
              points={[lastPole.x, lastPole.y, previewPoint.x, previewPoint.y]}
              stroke={blueColor}
              strokeWidth={3}
              listening={false}
            />
          );
        })()}

      {/* Additional dashed line from cursor to first pole when wall is closed */}
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
              strokeWidth={3}
              dash={[8, 4]}
              dashEnabled={true}
              perfectDrawEnabled={false}
              listening={false}
            />
          );
        })()}
    </>
  );
};

WallPreview.displayName = 'WallPreview';
