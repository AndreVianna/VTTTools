import { useTheme } from '@mui/material';
import React from 'react';
import { Rect } from 'react-konva';

export interface SelectionBorderProps {
    /** Position and size of the selection border */
    bounds: {
        x: number;
        y: number;
        width: number;
        height: number;
    };
    /** Optional stroke color override (defaults to primary.main) */
    strokeColor?: string;
    /** Optional stroke width (defaults to 2) */
    strokeWidth?: number;
}

/**
 * Reusable selection border component for highlighting selected assets.
 * Used in TokenDragHandle.
 */
export const SelectionBorder: React.FC<SelectionBorderProps> = ({
    bounds,
    strokeColor,
    strokeWidth = 2,
}) => {
    const theme = useTheme();
    const stroke = strokeColor ?? theme.palette.primary.main;

    return (
        <Rect
            x={bounds.x}
            y={bounds.y}
            width={bounds.width}
            height={bounds.height}
            stroke={stroke}
            strokeWidth={strokeWidth}
            listening={false}
        />
    );
};

SelectionBorder.displayName = 'SelectionBorder';
