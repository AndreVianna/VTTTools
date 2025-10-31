import React from 'react';
import { Line } from 'react-konva';
import { useTheme } from '@mui/material';
import { WallVisibility, type SceneWall } from '@/types/domain';

export interface WallRendererProps {
    sceneWall: SceneWall;
    isSelected?: boolean;
    onSelect?: (index: number) => void;
    onContextMenu?: (index: number, position: { x: number; y: number }) => void;
}

export const WallRenderer: React.FC<WallRendererProps> = ({
    sceneWall,
    isSelected = false,
    onSelect,
    onContextMenu
}) => {
    const theme = useTheme();

    const getWallStyle = (visibility: WallVisibility) => {
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
            onSelect(sceneWall.index);
        }
    };

    const handleContextMenu = (e: any) => {
        e.evt.preventDefault();
        if (onContextMenu) {
            const stage = e.target.getStage();
            const pointerPosition = stage.getPointerPosition();
            onContextMenu(sceneWall.index, { x: pointerPosition.x, y: pointerPosition.y });
        }
    };

    const style = getWallStyle(sceneWall.visibility);

    const segments = sceneWall.isClosed
        ? sceneWall.poles.length
        : sceneWall.poles.length - 1;

    const points: number[] = [];
    for (let i = 0; i < segments; i++) {
        const pole = sceneWall.poles[i];
        points.push(pole.x, pole.y);
    }
    if (sceneWall.isClosed && sceneWall.poles.length > 0) {
        const firstPole = sceneWall.poles[0];
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

WallRenderer.displayName = 'WallRenderer';
