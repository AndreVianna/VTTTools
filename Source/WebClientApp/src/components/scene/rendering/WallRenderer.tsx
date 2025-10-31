import React from 'react';
import { Line, Circle, Group } from 'react-konva';
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
        const wallColor = sceneWall.color || '#808080';
        const strokeColor = isSelected ? theme.palette.primary.main : wallColor;
        const strokeWidth = 3;

        switch (visibility) {
            case WallVisibility.Normal:
                return {
                    stroke: strokeColor,
                    strokeWidth: strokeWidth,
                    opacity: 1,
                    dash: undefined
                };
            case WallVisibility.Fence:
                return {
                    stroke: strokeColor,
                    strokeWidth: strokeWidth,
                    opacity: 0.9,
                    dash: [8, 4]
                };
            case WallVisibility.Invisible:
                return {
                    stroke: strokeColor,
                    strokeWidth: strokeWidth,
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

    const points: number[] = [];
    for (let i = 0; i < sceneWall.poles.length; i++) {
        const pole = sceneWall.poles[i];
        points.push(pole.x, pole.y);
    }
    if (sceneWall.isClosed && sceneWall.poles.length > 0) {
        const firstPole = sceneWall.poles[0];
        points.push(firstPole.x, firstPole.y);
    }

    const poleRadius = isSelected ? 5 : 1.5;
    const poleColor = isSelected ? theme.palette.primary.main : (sceneWall.color || '#808080');

    return (
        <Group>
            <Line
                points={points}
                stroke={style.stroke}
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

            {sceneWall.poles.map((pole, index) => (
                <Circle
                    key={`pole-${index}`}
                    x={pole.x}
                    y={pole.y}
                    radius={poleRadius}
                    fill={poleColor}
                    listening={false}
                />
            ))}
        </Group>
    );
};

WallRenderer.displayName = 'WallRenderer';
