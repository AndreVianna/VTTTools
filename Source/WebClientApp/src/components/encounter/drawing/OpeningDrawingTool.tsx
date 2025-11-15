import type Konva from 'konva';
import type React from 'react';
import { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import { Group, Line, Rect, Text } from 'react-konva';
import { useTheme } from '@mui/material/styles';
import type { EncounterWall, Point } from '@/types/domain';
import type { GridConfig } from '@/utils/gridCalculator';
import { getCrosshairPlusCursor } from '@/utils/customCursors';
import type { OpeningPlacementProperties } from '../panels/OpeningsPanel';

const INTERACTION_RECT_SIZE = 20000;
const INTERACTION_RECT_OFFSET = -INTERACTION_RECT_SIZE / 2;

export interface OpeningDrawingToolProps {
    encounterId: string;
    properties: OpeningPlacementProperties;
    walls: EncounterWall[];
    gridConfig: GridConfig;
    onComplete: (wallIndex: number, centerPosition: number) => void;
    onCancel: () => void;
}

export const OpeningDrawingTool: React.FC<OpeningDrawingToolProps> = ({
    encounterId: _encounterId,
    properties,
    walls,
    gridConfig,
    onComplete,
    onCancel,
}) => {
    const theme = useTheme();
    const [hoveredWallIndex, setHoveredWallIndex] = useState<number | null>(null);
    const [selectedWallIndex, setSelectedWallIndex] = useState<number | null>(null);
    const [clickPosition, setClickPosition] = useState<Point | null>(null);
    const [previewPosition, setPreviewPosition] = useState<number | null>(null);
    const stageContainerRef = useRef<HTMLDivElement | null>(null);

    useEffect(() => {
        return () => {
            if (stageContainerRef.current) {
                stageContainerRef.current.style.cursor = 'default';
            }
        };
    }, []);

    useEffect(() => {
        const handleKeyDown = (e: KeyboardEvent) => {
            if (e.key === 'Escape') {
                if (stageContainerRef.current) {
                    stageContainerRef.current.style.cursor = 'default';
                }
                onCancel();
            } else if (e.key === 'Enter' && selectedWallIndex !== null && previewPosition !== null) {
                if (stageContainerRef.current) {
                    stageContainerRef.current.style.cursor = 'default';
                }
                onComplete(selectedWallIndex, previewPosition);
            }
        };

        window.addEventListener('keydown', handleKeyDown);
        return () => {
            window.removeEventListener('keydown', handleKeyDown);
        };
    }, [onCancel, onComplete, selectedWallIndex, previewPosition]);

    const getStagePosition = useCallback((e: Konva.KonvaEventObject<MouseEvent>): Point | null => {
        const stage = e.target.getStage();
        if (!stage) return null;

        const pointer = stage.getPointerPosition();
        if (!pointer) return null;

        const scale = stage.scaleX();
        return {
            x: (pointer.x - stage.x()) / scale,
            y: (pointer.y - stage.y()) / scale,
        };
    }, []);

    const calculatePositionOnWall = useCallback(
        (wall: EncounterWall, point: Point): { position: number; closestPoint: Point } | null => {
            if (!wall.poles || wall.poles.length < 2) return null;

            let minDistance = Infinity;
            let bestPosition = 0;
            let bestPoint: Point = { x: 0, y: 0 };

            for (let i = 0; i < wall.poles.length - 1; i++) {
                const p1 = wall.poles[i];
                const p2 = wall.poles[i + 1];
                if (!p1 || !p2) continue;

                const segmentDx = p2.x - p1.x;
                const segmentDy = p2.y - p1.y;
                const segmentLength = Math.sqrt(segmentDx * segmentDx + segmentDy * segmentDy);

                if (segmentLength === 0) continue;

                const pointDx = point.x - p1.x;
                const pointDy = point.y - p1.y;

                const t = Math.max(
                    0,
                    Math.min(1, (pointDx * segmentDx + pointDy * segmentDy) / (segmentLength * segmentLength)),
                );

                const projectedX = p1.x + t * segmentDx;
                const projectedY = p1.y + t * segmentDy;

                const distanceToSegment = Math.sqrt(
                    (point.x - projectedX) ** 2 + (point.y - projectedY) ** 2,
                );

                if (distanceToSegment < minDistance) {
                    minDistance = distanceToSegment;

                    let accumulatedDistance = 0;
                    for (let j = 0; j < i; j++) {
                        const pole1 = wall.poles[j];
                        const pole2 = wall.poles[j + 1];
                        if (!pole1 || !pole2) continue;
                        const dx = pole2.x - pole1.x;
                        const dy = pole2.y - pole1.y;
                        accumulatedDistance += Math.sqrt(dx * dx + dy * dy);
                    }

                    const segmentPosition = t * segmentLength;
                    const positionInPixels = accumulatedDistance + segmentPosition;
                    const positionInFeet = positionInPixels / gridConfig.cellSize.width;

                    bestPosition = positionInFeet;
                    bestPoint = { x: projectedX, y: projectedY };
                }
            }

            return { position: bestPosition, closestPoint: bestPoint };
        },
        [gridConfig.cellSize.width],
    );

    const handleMouseMove = useCallback(
        (e: Konva.KonvaEventObject<MouseEvent>) => {
            const stagePos = getStagePosition(e);
            if (!stagePos) return;

            if (selectedWallIndex === null) {
                let closestWallIndex: number | null = null;
                let minDistance = 50;

                walls.forEach((wall) => {
                    const result = calculatePositionOnWall(wall, stagePos);
                    if (result) {
                        const distance = Math.sqrt(
                            (stagePos.x - result.closestPoint.x) ** 2 +
                                (stagePos.y - result.closestPoint.y) ** 2,
                        );
                        if (distance < minDistance) {
                            minDistance = distance;
                            closestWallIndex = wall.index;
                        }
                    }
                });

                setHoveredWallIndex(closestWallIndex);
            } else {
                const wall = walls.find((w) => w.index === selectedWallIndex);
                if (wall) {
                    const result = calculatePositionOnWall(wall, stagePos);
                    if (result) {
                        setPreviewPosition(result.position);
                        setClickPosition(result.closestPoint);
                    }
                }
            }
        },
        [walls, selectedWallIndex, getStagePosition, calculatePositionOnWall],
    );

    const handleClick = useCallback(
        (e: Konva.KonvaEventObject<MouseEvent>) => {
            const stagePos = getStagePosition(e);
            if (!stagePos) return;

            e.cancelBubble = true;

            if (selectedWallIndex === null) {
                if (hoveredWallIndex !== null) {
                    setSelectedWallIndex(hoveredWallIndex);
                }
            } else if (previewPosition !== null) {
                if (stageContainerRef.current) {
                    stageContainerRef.current.style.cursor = 'default';
                }
                onComplete(selectedWallIndex, previewPosition);
            }
        },
        [selectedWallIndex, hoveredWallIndex, previewPosition, getStagePosition, onComplete],
    );

    const previewOpeningShape = useMemo(() => {
        if (selectedWallIndex === null || clickPosition === null || previewPosition === null) {
            return null;
        }

        const wall = walls.find((w) => w.index === selectedWallIndex);
        if (!wall || !wall.poles || wall.poles.length < 2) return null;

        const widthInPixels = properties.width * gridConfig.cellSize.width;
        const heightInPixels = properties.height * gridConfig.cellSize.width;

        let totalDistance = 0;
        let segmentIndex = -1;
        let segmentT = 0;
        const targetDistanceInPixels = previewPosition * gridConfig.cellSize.width;

        for (let i = 0; i < wall.poles.length - 1; i++) {
            const p1 = wall.poles[i];
            const p2 = wall.poles[i + 1];
            if (!p1 || !p2) continue;

            const dx = p2.x - p1.x;
            const dy = p2.y - p1.y;
            const segmentLength = Math.sqrt(dx * dx + dy * dy);

            if (totalDistance + segmentLength >= targetDistanceInPixels) {
                segmentIndex = i;
                segmentT = (targetDistanceInPixels - totalDistance) / segmentLength;
                break;
            }

            totalDistance += segmentLength;
        }

        if (segmentIndex === -1) return null;

        const p1 = wall.poles[segmentIndex];
        const p2 = wall.poles[segmentIndex + 1];
        if (!p1 || !p2) return null;

        const dx = p2.x - p1.x;
        const dy = p2.y - p1.y;
        const segmentLength = Math.sqrt(dx * dx + dy * dy);

        const normalX = -dy / segmentLength;
        const normalY = dx / segmentLength;

        const centerX = p1.x + dx * segmentT;
        const centerY = p1.y + dy * segmentT;

        const halfWidth = widthInPixels / 2;

        const start = {
            x: centerX - (dx / segmentLength) * halfWidth,
            y: centerY - (dy / segmentLength) * halfWidth,
        };
        const end = {
            x: centerX + (dx / segmentLength) * halfWidth,
            y: centerY + (dy / segmentLength) * halfWidth,
        };

        return {
            points: [
                start.x,
                start.y,
                end.x,
                end.y,
                end.x + normalX * heightInPixels,
                end.y + normalY * heightInPixels,
                start.x + normalX * heightInPixels,
                start.y + normalY * heightInPixels,
            ],
            center: { x: centerX, y: centerY },
            angle: Math.atan2(dy, dx) * (180 / Math.PI),
        };
    }, [selectedWallIndex, clickPosition, previewPosition, walls, properties, gridConfig.cellSize.width]);

    const handleMouseEnter = useCallback((e: Konva.KonvaEventObject<MouseEvent>) => {
        const stage = e.target.getStage();
        if (!stage) return;

        const container = stage.container();
        if (container) {
            stageContainerRef.current = container;
            container.style.cursor = getCrosshairPlusCursor();
        }
    }, []);

    const handleMouseLeave = useCallback((e: Konva.KonvaEventObject<MouseEvent>) => {
        const stage = e.target.getStage();
        if (!stage) return;

        const container = stage.container();
        if (container) {
            container.style.cursor = 'default';
        }
    }, []);

    return (
        <Group>
            <Rect
                x={INTERACTION_RECT_OFFSET}
                y={INTERACTION_RECT_OFFSET}
                width={INTERACTION_RECT_SIZE}
                height={INTERACTION_RECT_SIZE}
                fill='transparent'
                onMouseEnter={handleMouseEnter}
                onMouseLeave={handleMouseLeave}
                onMouseMove={handleMouseMove}
                onClick={handleClick}
                listening={true}
            />

            {walls.map((wall) => {
                const isHovered = hoveredWallIndex === wall.index;
                const isSelected = selectedWallIndex === wall.index;

                if (!isHovered && !isSelected) return null;

                const points: number[] = [];
                for (let i = 0; i < wall.poles.length; i++) {
                    const pole = wall.poles[i];
                    if (!pole) continue;
                    points.push(pole.x, pole.y);
                }

                if (wall.isClosed && wall.poles.length > 0) {
                    const firstPole = wall.poles[0];
                    if (firstPole) {
                        points.push(firstPole.x, firstPole.y);
                    }
                }

                return (
                    <Line
                        key={`wall-highlight-${wall.index}`}
                        points={points}
                        stroke={isSelected ? theme.palette.success.main : theme.palette.primary.main}
                        strokeWidth={isSelected ? 6 : 4}
                        opacity={isSelected ? 0.8 : 0.5}
                        listening={false}
                    />
                );
            })}

            {previewOpeningShape && (
                <>
                    <Line
                        points={previewOpeningShape.points}
                        stroke={theme.palette.primary.main}
                        strokeWidth={2}
                        fill={properties.color || theme.palette.grey[600]}
                        opacity={0.6}
                        dash={[4, 4]}
                        listening={false}
                    />
                    <Text
                        x={previewOpeningShape.center.x}
                        y={previewOpeningShape.center.y - 20}
                        text={`${properties.width}' × ${properties.height}'`}
                        fontSize={12}
                        fill={theme.palette.primary.main}
                        fontStyle='bold'
                        align='center'
                        offsetX={25}
                        listening={false}
                    />
                </>
            )}
        </Group>
    );
};

OpeningDrawingTool.displayName = 'OpeningDrawingTool';
