import React from 'react';
import { Line } from 'react-konva';
import { useTheme } from '@mui/material';
import { WallVisibility, type SceneBarrier, type Barrier } from '@/types/domain';

export interface BarrierRendererProps {
    sceneBarrier: SceneBarrier;
    barrier: Barrier;
    isSelected?: boolean;
    onSelect?: (id: string) => void;
    onContextMenu?: (id: string, position: { x: number; y: number }) => void;
}

export const BarrierRenderer: React.FC<BarrierRendererProps> = ({
    sceneBarrier,
    barrier,
    isSelected = false,
    onSelect,
    onContextMenu
}) => {
    const theme = useTheme();

    const getBarrierStyle = (visibility: WallVisibility) => {
        switch (visibility) {
            case WallVisibility.Normal:
                return {
                    stroke: theme.palette.error.main,
                    strokeWidth: isSelected ? 6 : 4,
                    opacity: 1,
                    dash: undefined
                };
            case WallVisibility.Fence:
                return {
                    stroke: theme.palette.warning.main,
                    strokeWidth: isSelected ? 5 : 3,
                    opacity: 0.9,
                    dash: [8, 4]
                };
            case WallVisibility.Invisible:
                return {
                    stroke: theme.palette.grey[500],
                    strokeWidth: isSelected ? 4 : 2,
                    opacity: 0.3,
                    dash: [4, 4]
                };
        }
    };

    const handleClick = () => {
        if (onSelect) {
            onSelect(sceneBarrier.id);
        }
    };

    const handleContextMenu = (e: any) => {
        e.evt.preventDefault();
        if (onContextMenu) {
            const stage = e.target.getStage();
            const pointerPosition = stage.getPointerPosition();
            onContextMenu(sceneBarrier.id, { x: pointerPosition.x, y: pointerPosition.y });
        }
    };

    const style = getBarrierStyle(barrier.visibility);

    const segments = barrier.isClosed
        ? barrier.poles.length
        : barrier.poles.length - 1;

    const points: number[] = [];
    for (let i = 0; i < segments; i++) {
        const pole = barrier.poles[i];
        points.push(pole.x, pole.y);
    }
    if (barrier.isClosed && barrier.poles.length > 0) {
        const firstPole = barrier.poles[0];
        points.push(firstPole.x, firstPole.y);
    }

    return (
        <Line
            points={points}
            stroke={isSelected ? theme.palette.primary.main : style.stroke}
            strokeWidth={style.strokeWidth}
            dash={style.dash}
            opacity={style.opacity}
            listening={true}
            onClick={handleClick}
            onTap={handleClick}
            onContextMenu={handleContextMenu}
            hitStrokeWidth={8}
            onMouseEnter={(e) => {
                const container = e.target.getStage()?.container();
                if (container) {
                    container.style.cursor = 'pointer';
                }
            }}
            onMouseLeave={(e) => {
                const container = e.target.getStage()?.container();
                if (container) {
                    container.style.cursor = 'default';
                }
            }}
        />
    );
};

BarrierRenderer.displayName = 'BarrierRenderer';
