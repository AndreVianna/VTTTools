import React from 'react';
import { Line } from 'react-konva';
import { useTheme } from '@mui/material';
import type { SceneBarrier, Barrier } from '@/types/domain';

export interface BarrierRendererProps {
    sceneBarrier: SceneBarrier;
    barrier: Barrier;
}

export const BarrierRenderer: React.FC<BarrierRendererProps> = ({ sceneBarrier, barrier }) => {
    const theme = useTheme();

    const getColor = (): string => {
        if (barrier.isOpenable) {
            return sceneBarrier.isOpen ? theme.palette.success.main : theme.palette.info.main;
        }
        return barrier.isOpaque ? theme.palette.error.main : theme.palette.grey[600];
    };

    return (
        <Line
            points={sceneBarrier.vertices.flatMap(v => [v.x, v.y])}
            stroke={getColor()}
            strokeWidth={2}
            {...(barrier.isSecret && !sceneBarrier.isOpen && { dash: [5, 5] })}
            opacity={barrier.isSecret && !sceneBarrier.isOpen ? 0.3 : 1.0}
            listening={false}
        />
    );
};

BarrierRenderer.displayName = 'BarrierRenderer';
