import React from 'react';
import { Line, Circle } from 'react-konva';
import { useTheme } from '@mui/material';
import { type Point, type Pole, type SceneWall } from '@/types/domain';

export interface WallPreviewProps {
    poles: Pole[];
    previewPoint: Point | null;
    wall?: SceneWall | undefined;
}

export const WallPreview: React.FC<WallPreviewProps> = ({
    poles,
    previewPoint,
    wall
}) => {
    const theme = useTheme();

    if (poles.length === 0) return null;

    const isClosed = wall?.isClosed ?? false;
    const blueColor = theme.palette.primary.main;

    return (
        <>
            {/* Lines between consecutive poles (3px blue) */}
            {poles.slice(0, -1).map((pole, index) => {
                const nextPole = poles[index + 1];
                return (
                    <Line
                        key={`segment-${index}`}
                        points={[pole.x, pole.y, nextPole.x, nextPole.y]}
                        stroke={blueColor}
                        strokeWidth={3}
                        listening={false}
                    />
                );
            })}

            {/* Closing line for closed walls (first to last pole) - only when NOT actively placing */}
            {isClosed && poles.length > 1 && !previewPoint && (
                <Line
                    key="closing-line"
                    points={[
                        poles[0].x,
                        poles[0].y,
                        poles[poles.length - 1].x,
                        poles[poles.length - 1].y
                    ]}
                    stroke={blueColor}
                    strokeWidth={3}
                    dash={[8, 4]}
                    dashEnabled={true}
                    perfectDrawEnabled={false}
                    listening={false}
                />
            )}

            {/* Poles as 5px circles (blue) */}
            {poles.map((pole, index) => (
                <Circle
                    key={`pole-${index}`}
                    x={pole.x}
                    y={pole.y}
                    radius={5}
                    fill={blueColor}
                    listening={false}
                />
            ))}

            {/* Preview line from last pole to cursor - solid blue (same as normal wall segments) */}
            {previewPoint && poles.length > 0 && (
                <Line
                    points={[
                        poles[poles.length - 1].x,
                        poles[poles.length - 1].y,
                        previewPoint.x,
                        previewPoint.y
                    ]}
                    stroke={blueColor}
                    strokeWidth={3}
                    listening={false}
                />
            )}

            {/* Additional dashed line from cursor to first pole when wall is closed */}
            {previewPoint && isClosed && poles.length > 0 && (
                <Line
                    points={[
                        previewPoint.x,
                        previewPoint.y,
                        poles[0].x,
                        poles[0].y
                    ]}
                    stroke={blueColor}
                    strokeWidth={3}
                    dash={[8, 4]}
                    dashEnabled={true}
                    perfectDrawEnabled={false}
                    listening={false}
                />
            )}
        </>
    );
};

WallPreview.displayName = 'WallPreview';
