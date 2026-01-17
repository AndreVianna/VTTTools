import React from 'react';
import { Circle, Group, Line } from 'react-konva';

export interface InvalidPlacementIndicatorProps {
    /** Position of the indicator */
    position: {
        x: number;
        y: number;
    };
}

/**
 * Renders a red X indicator at collision points during asset drag.
 * Used in TokenDragHandle to show invalid placement locations.
 */
export const InvalidPlacementIndicator: React.FC<InvalidPlacementIndicatorProps> = ({
    position,
}) => (
    <Group x={position.x} y={position.y}>
        <Circle
            radius={12}
            fill='rgba(220, 38, 38, 0.9)'
            stroke='white'
            strokeWidth={1}
        />
        <Line
            points={[-6, -6, 6, 6]}
            stroke='white'
            strokeWidth={2}
            lineCap='round'
        />
        <Line
            points={[6, -6, -6, 6]}
            stroke='white'
            strokeWidth={2}
            lineCap='round'
        />
    </Group>
);

InvalidPlacementIndicator.displayName = 'InvalidPlacementIndicator';
