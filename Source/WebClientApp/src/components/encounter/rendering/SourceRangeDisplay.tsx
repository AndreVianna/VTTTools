import React from 'react';
import { Text, Rect } from 'react-konva';
import { useTheme } from '@mui/material';
import type { Point } from '@/types/domain';

export interface SourceRangeDisplayProps {
    position: Point;
    range: number;
}

export const SourceRangeDisplay: React.FC<SourceRangeDisplayProps> = ({ position, range }) => {
    const theme = useTheme();
    const text = `${range.toFixed(1)} cells`;
    const fontSize = 12;
    const padding = 4;
    const textWidth = text.length * (fontSize * 0.6);

    return (
        <>
            <Rect
                x={position.x + 8}
                y={position.y - 20}
                width={textWidth + padding * 2}
                height={fontSize + padding * 2}
                fill={theme.palette.background.paper}
                opacity={0.8}
                cornerRadius={3}
                listening={false}
            />
            <Text
                x={position.x + 8 + padding}
                y={position.y - 20 + padding}
                text={text}
                fontSize={fontSize}
                fill={theme.palette.text.primary}
                listening={false}
            />
        </>
    );
};

SourceRangeDisplay.displayName = 'SourceRangeDisplay';
