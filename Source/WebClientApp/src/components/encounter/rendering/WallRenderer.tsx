import React from 'react';
import { Line, Circle, Group } from 'react-konva';
import { WallVisibility, type EncounterWall } from '@/types/domain';

export interface WallRendererProps {
    encounterWall: EncounterWall;
    onContextMenu?: (index: number, position: { x: number; y: number }) => void;
}

export const WallRenderer: React.FC<WallRendererProps> = ({
    encounterWall,
    onContextMenu
}) => {

    const getWallStyle = (visibility: WallVisibility) => {
        const wallColor = encounterWall.color || '#808080';
        const strokeColor = wallColor;
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

    const handleContextMenu = (e: any) => {
        e.evt.preventDefault();
        if (onContextMenu) {
            const stage = e.target.getStage();
            const pointerPosition = stage.getPointerPosition();
            onContextMenu(encounterWall.index, { x: pointerPosition.x, y: pointerPosition.y });
        }
    };

    const style = getWallStyle(encounterWall.visibility);

    const points: number[] = [];
    for (let i = 0; i < encounterWall.poles.length; i++) {
        const pole = encounterWall.poles[i];
        if (!pole) continue;
        points.push(pole.x, pole.y);
    }
    if (encounterWall.isClosed && encounterWall.poles.length > 0) {
        const firstPole = encounterWall.poles[0];
        if (firstPole) {
            points.push(firstPole.x, firstPole.y);
        }
    }

    const poleRadius = 1.5;
    const poleColor = encounterWall.color || '#808080';

    return (
        <Group>
            <Line
                points={points}
                stroke={style.stroke}
                strokeWidth={style.strokeWidth}
                {...(style.dash && { dash: style.dash })}
                opacity={style.opacity}
                listening={true}
                onContextMenu={handleContextMenu}
                hitStrokeWidth={8}
                onMouseEnter={(e) => {
                    const container = e.target.getStage()?.container();
                    if (container) {
                        container.style.cursor = 'context-menu';
                    }
                }}
                onMouseLeave={(e) => {
                    const container = e.target.getStage()?.container();
                    if (container) {
                        container.style.cursor = 'default';
                    }
                }}
            />

            {encounterWall.poles.map((pole, index) => (
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
