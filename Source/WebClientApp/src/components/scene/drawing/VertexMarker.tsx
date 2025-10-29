import React from 'react';
import { Circle } from 'react-konva';
import { useTheme } from '@mui/material';
import type { Point } from '@/types/domain';

export interface VertexMarkerProps {
    position: Point;
    preview?: boolean;
}

export const VertexMarker: React.FC<VertexMarkerProps> = ({ position, preview = false }) => {
    const theme = useTheme();

    return (
        <Circle
            x={position.x}
            y={position.y}
            radius={preview ? 3 : 5}
            fill={preview ? theme.palette.grey[500] : theme.palette.error.main}
            opacity={preview ? 0.5 : 1.0}
            listening={false}
        />
    );
};

VertexMarker.displayName = 'VertexMarker';
