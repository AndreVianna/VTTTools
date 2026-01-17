import { useTheme } from '@mui/material';
import React from 'react';
import { Rect } from 'react-konva';

export interface MarqueeRectProps {
    /** Marquee rectangle bounds */
    rect: {
        x: number;
        y: number;
        width: number;
        height: number;
    };
    /** Optional stroke color override (defaults to primary.main) */
    strokeColor?: string;
    /** Optional fill color override (defaults to primary.main) */
    fillColor?: string;
    /** Optional fill opacity (defaults to 0.1) */
    fillOpacity?: number;
    /** Optional stroke width (defaults to 1) */
    strokeWidth?: number;
    /** Optional dash pattern (defaults to [5, 5]) */
    dash?: number[];
}

/**
 * Reusable marquee selection rectangle component for Konva canvas.
 * Used in WallTransformer, RegionTransformer, and TokenDragHandle.
 */
export const MarqueeRect: React.FC<MarqueeRectProps> = ({
    rect,
    strokeColor,
    fillColor,
    fillOpacity = 0.1,
    strokeWidth = 1,
    dash = [5, 5],
}) => {
    const theme = useTheme();
    const stroke = strokeColor ?? theme.palette.primary.main;
    const fill = fillColor ?? theme.palette.primary.main;

    return (
        <Rect
            x={rect.x}
            y={rect.y}
            width={rect.width}
            height={rect.height}
            stroke={stroke}
            strokeWidth={strokeWidth}
            dash={dash}
            fill={fill}
            opacity={fillOpacity}
            listening={false}
        />
    );
};

MarqueeRect.displayName = 'MarqueeRect';
