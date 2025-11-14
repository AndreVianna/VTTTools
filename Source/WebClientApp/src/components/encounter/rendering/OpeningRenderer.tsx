import { useTheme } from '@mui/material/styles';
import type Konva from 'konva';
import type React from 'react';
import { useMemo } from 'react';
import { Circle, Group, Line, Rect, Text } from 'react-konva';
import {
    type EncounterWall,
    OpeningOpacity,
    OpeningState,
    OpeningVisibility,
    type PlacedOpening,
    type Point,
} from '@/types/domain';

export interface OpeningRendererProps {
    encounterOpening: PlacedOpening;
    wall: EncounterWall;
    isSelected?: boolean;
    onSelect?: () => void;
    onContextMenu?: (position: Point) => void;
}

export const OpeningRenderer: React.FC<OpeningRendererProps> = ({
    encounterOpening,
    wall,
    isSelected = false,
    onSelect,
    onContextMenu,
}) => {
    const theme = useTheme();

    const openingPosition = useMemo(() => {
        const startPoleIndex = encounterOpening.startPoleIndex;
        const endPoleIndex = encounterOpening.endPoleIndex;

        if (startPoleIndex < 0 || endPoleIndex >= wall.poles.length) {
            return null;
        }

        const startPole = wall.poles[startPoleIndex];
        const endPole = wall.poles[endPoleIndex];

        if (!startPole || !endPole) {
            return null;
        }

        return {
            start: startPole,
            end: endPole,
        };
    }, [encounterOpening.startPoleIndex, encounterOpening.endPoleIndex, wall.poles]);

    const getOpacityValue = (opacity: OpeningOpacity): number => {
        switch (opacity) {
            case OpeningOpacity.Opaque:
                return 1.0;
            case OpeningOpacity.Translucent:
                return 0.7;
            case OpeningOpacity.Transparent:
                return 0.3;
            case OpeningOpacity.Ethereal:
                return 0.5;
            default:
                return 1.0;
        }
    };

    const getVisibilityStyle = (visibility: OpeningVisibility) => {
        switch (visibility) {
            case OpeningVisibility.Visible:
                return { opacity: 1, dash: undefined };
            case OpeningVisibility.Secret:
                return { opacity: 0.8, dash: [4, 4] };
            case OpeningVisibility.Concealed:
                return { opacity: 0.2, dash: undefined };
            default:
                return { opacity: 1, dash: undefined };
        }
    };

    const handleClick = (e: Konva.KonvaEventObject<MouseEvent>) => {
        e.cancelBubble = true;
        if (onSelect) {
            onSelect();
        }
    };

    const handleContextMenu = (e: Konva.KonvaEventObject<MouseEvent>) => {
        e.evt.preventDefault();
        e.cancelBubble = true;
        if (onContextMenu) {
            const stage = e.target.getStage();
            const pointerPosition = stage?.getPointerPosition();
            if (pointerPosition) {
                const scale = stage.scaleX();
                onContextMenu({
                    x: (pointerPosition.x - stage.x()) / scale,
                    y: (pointerPosition.y - stage.y()) / scale,
                });
            }
        }
    };

    if (!openingPosition) {
        return null;
    }

    const { start, end } = openingPosition;
    const dx = end.x - start.x;
    const dy = end.y - start.y;
    const distance = Math.sqrt(dx * dx + dy * dy);

    if (distance === 0) {
        return null;
    }

    const normalX = -dy / distance;
    const normalY = dx / distance;

    const centerX = (start.x + end.x) / 2;
    const centerY = (start.y + end.y) / 2;

    const height = encounterOpening.height;
    const heightPixels = height * 5;

    const p1 = { x: start.x, y: start.y };
    const p2 = { x: end.x, y: end.y };
    const p3 = { x: end.x + normalX * heightPixels, y: end.y + normalY * heightPixels };
    const p4 = { x: start.x + normalX * heightPixels, y: start.y + normalY * heightPixels };

    const color = encounterOpening.color || theme.palette.grey[600];
    const visibilityStyle = getVisibilityStyle(encounterOpening.visibility);
    const baseOpacity = getOpacityValue(encounterOpening.opacity) * visibilityStyle.opacity;

    const isOpen = encounterOpening.state === OpeningState.Open;
    const isLocked = encounterOpening.state === OpeningState.Locked;
    const isBarred = encounterOpening.state === OpeningState.Barred;
    const isEthereal = encounterOpening.opacity === OpeningOpacity.Ethereal;

    const strokeWidth = 2;
    const selectionStrokeWidth = 4;

    return (
        <Group>
            {!isOpen && (
                <Line
                    points={[p1.x, p1.y, p2.x, p2.y, p3.x, p3.y, p4.x, p4.y]}
                    closed={true}
                    fill={color}
                    opacity={baseOpacity}
                    listening={!!onSelect}
                    onClick={handleClick}
                    onContextMenu={handleContextMenu}
                    onMouseEnter={(e) => {
                        const container = e.target.getStage()?.container();
                        if (container && onSelect) {
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
            )}

            <Line
                points={[p1.x, p1.y, p2.x, p2.y, p3.x, p3.y, p4.x, p4.y, p1.x, p1.y]}
                stroke={isSelected ? theme.palette.primary.main : color}
                strokeWidth={isSelected ? selectionStrokeWidth : strokeWidth}
                {...(visibilityStyle.dash && { dash: visibilityStyle.dash })}
                {...(isEthereal && { dash: [8, 8] })}
                opacity={visibilityStyle.opacity}
                listening={!!onSelect}
                onClick={handleClick}
                onContextMenu={handleContextMenu}
                hitStrokeWidth={10}
                onMouseEnter={(e) => {
                    const container = e.target.getStage()?.container();
                    if (container && onSelect) {
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

            {isBarred && (
                <>
                    <Line
                        points={[p1.x, p1.y, p3.x, p3.y]}
                        stroke={color}
                        strokeWidth={strokeWidth}
                        opacity={baseOpacity}
                        listening={false}
                    />
                    <Line
                        points={[p2.x, p2.y, p4.x, p4.y]}
                        stroke={color}
                        strokeWidth={strokeWidth}
                        opacity={baseOpacity}
                        listening={false}
                    />
                </>
            )}

            {isLocked && (
                <Group x={centerX} y={centerY}>
                    <Rect
                        x={-4}
                        y={-2}
                        width={8}
                        height={6}
                        fill={theme.palette.warning.main}
                        stroke={theme.palette.warning.dark}
                        strokeWidth={1}
                        cornerRadius={1}
                        listening={false}
                    />
                    <Rect
                        x={-3}
                        y={-6}
                        width={6}
                        height={4}
                        stroke={theme.palette.warning.dark}
                        strokeWidth={1.5}
                        cornerRadius={3}
                        listening={false}
                    />
                </Group>
            )}

            {isSelected && (
                <Text
                    x={centerX}
                    y={centerY + heightPixels / 2 + 5}
                    text={encounterOpening.name}
                    fontSize={10}
                    fill={theme.palette.primary.main}
                    fontStyle='bold'
                    align='center'
                    offsetX={encounterOpening.name.length * 2.5}
                    listening={false}
                />
            )}
        </Group>
    );
};

OpeningRenderer.displayName = 'OpeningRenderer';
