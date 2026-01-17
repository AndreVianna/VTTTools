import { useTheme } from '@mui/material';
import React from 'react';
import { Circle } from 'react-konva';

export interface InsertPreviewMarkerProps {
    /** Position of the preview marker */
    position: {
        x: number;
        y: number;
    };
    /** Optional radius (defaults to 5) */
    radius?: number;
    /** Optional opacity (defaults to 0.8) */
    opacity?: number;
}

/**
 * Reusable preview marker component for vertex/pole insertion.
 * Shows a dashed circle at the insertion point when Shift is held.
 * Used in WallTransformer and RegionTransformer.
 */
export const InsertPreviewMarker: React.FC<InsertPreviewMarkerProps> = ({
    position,
    radius = 5,
    opacity = 0.8,
}) => {
    const theme = useTheme();

    return (
        <Circle
            x={position.x}
            y={position.y}
            radius={radius}
            fill='transparent'
            stroke={theme.palette.warning.main}
            strokeWidth={2}
            dash={[4, 4]}
            listening={false}
            opacity={opacity}
        />
    );
};

InsertPreviewMarker.displayName = 'InsertPreviewMarker';
