import React from 'react';
import { Line } from 'react-konva';
import { useTheme } from '@mui/material';
import type { Point, Barrier } from '@/types/domain';

export interface BarrierPreviewProps {
    vertices: Point[];
    previewVertex: Point | null;
    barrier: Barrier;
}

export const BarrierPreview: React.FC<BarrierPreviewProps> = ({
    vertices,
    previewVertex,
    barrier
}) => {
    const theme = useTheme();

    if (vertices.length === 0) return null;

    const getColor = (): string => {
        if (barrier.isOpenable) {
            return theme.palette.info.main;
        }
        return barrier.isOpaque ? theme.palette.error.main : theme.palette.grey[600];
    };

    return (
        <>
            {vertices.length > 0 && (
                <Line
                    points={vertices.flatMap(v => [v.x, v.y])}
                    stroke={getColor()}
                    strokeWidth={2}
                    {...(barrier.isSecret && { dash: [5, 5] })}
                    listening={false}
                />
            )}
            {vertices.length > 0 && previewVertex && (() => {
                const lastVertex = vertices[vertices.length - 1];
                if (!lastVertex) return null;
                return (
                    <Line
                        points={[
                            lastVertex.x,
                            lastVertex.y,
                            previewVertex.x,
                            previewVertex.y
                        ]}
                        stroke={theme.palette.grey[500]}
                        strokeWidth={1}
                        dash={[5, 5]}
                        opacity={0.5}
                        listening={false}
                    />
                );
            })()}
        </>
    );
};

BarrierPreview.displayName = 'BarrierPreview';
