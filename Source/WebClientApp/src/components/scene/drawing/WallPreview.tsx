import React from 'react';
import { Line } from 'react-konva';
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
    const redColor = theme.palette.error.main;

    return (
        <>
            {/* Lines between consecutive poles (3px red) */}
            {poles.slice(0, -1).map((pole, index) => {
                const nextPole = poles[index + 1];
                return (
                    <Line
                        key={`segment-${index}`}
                        points={[pole.x, pole.y, nextPole.x, nextPole.y]}
                        stroke={redColor}
                        strokeWidth={3}
                        listening={false}
                    />
                );
            })}

            {/* Closing line for closed walls (first to last pole) */}
            {isClosed && poles.length > 1 && (
                <Line
                    key="closing-line"
                    points={[
                        poles[0].x,
                        poles[0].y,
                        poles[poles.length - 1].x,
                        poles[poles.length - 1].y
                    ]}
                    stroke={redColor}
                    strokeWidth={3}
                    listening={false}
                />
            )}

            {/* Preview line from last pole to cursor (dashed grey) */}
            {previewPoint && poles.length > 0 && (
                <Line
                    points={[
                        poles[poles.length - 1].x,
                        poles[poles.length - 1].y,
                        previewPoint.x,
                        previewPoint.y
                    ]}
                    stroke={theme.palette.grey[500]}
                    strokeWidth={1}
                    dash={[5, 5]}
                    opacity={0.5}
                    listening={false}
                />
            )}
        </>
    );
};

WallPreview.displayName = 'WallPreview';
