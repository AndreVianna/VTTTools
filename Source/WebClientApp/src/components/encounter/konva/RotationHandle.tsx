import { useTheme } from '@mui/material/styles';
import type Konva from 'konva';
import React from 'react';
import { Circle, Group, Line } from 'react-konva';

export interface RotationHandleProps {
    /** Center position of the asset being rotated */
    center: {
        x: number;
        y: number;
    };
    /** Current rotation angle in degrees */
    rotation: number;
    /** Size of the asset (longest dimension used for handle length) */
    assetSize: {
        width: number;
        height: number;
    };
    /** Current canvas scale (for responsive sizing) */
    scale: number;
    /** Whether rotation is currently in progress */
    isRotating?: boolean;
    /** Callback when rotation handle is pressed */
    onMouseDown: (e: Konva.KonvaEventObject<MouseEvent>) => void;
}

/**
 * Rotation handle component for rotating assets.
 * Displays a dashed line from center with a draggable circle at the end.
 * Used in TokenDragHandle.
 */
export const RotationHandle: React.FC<RotationHandleProps> = ({
    center,
    rotation,
    assetSize,
    scale,
    isRotating = false,
    onMouseDown,
}) => {
    const theme = useTheme();

    const longestDimension = Math.max(assetSize.width, assetSize.height);
    const handleLength = longestDimension * 0.75;
    const angleRadians = ((rotation - 90) * Math.PI) / 180;
    const lineEndX = Math.cos(angleRadians) * handleLength;
    const lineEndY = Math.sin(angleRadians) * handleLength;
    const strokeWidth = 1 / scale;
    const arrowSize = Math.max(4, Math.min(6, 5 / scale));
    const lineColor = theme.palette.mode === 'dark' ? '#9CA3AF' : '#6B7280';

    const groupKey = `rotation-handle-${center.x.toFixed(1)}-${center.y.toFixed(1)}`;

    return (
        <Group key={groupKey} name={groupKey} x={center.x} y={center.y}>
            <Line
                points={[0, 0, lineEndX, lineEndY]}
                stroke={lineColor}
                strokeWidth={strokeWidth}
                dash={[5, 5]}
                opacity={0.8}
                listening={false}
            />
            <Circle
                x={lineEndX}
                y={lineEndY}
                radius={arrowSize}
                fill={lineColor}
                stroke={lineColor}
                strokeWidth={1}
                cursor={isRotating ? 'grabbing' : 'grab'}
                hitStrokeWidth={20}
                onMouseDown={onMouseDown}
            />
        </Group>
    );
};

RotationHandle.displayName = 'RotationHandle';
