import React, { useState, useEffect, useRef, useCallback, memo } from 'react';
import { Group, Circle, Line, Rect } from 'react-konva';
import { useTheme } from '@mui/material';
import type Konva from 'konva';
import type { Point } from '@/types/domain';
import type { RegionSegment } from '@/hooks/useRegionTransaction';
import type { GridConfig } from '@/utils/gridCalculator';
import { snapToNearest, SnapMode } from '@/utils/structureSnapping';
import { getSnapModeFromEvent } from '@/utils/snapUtils';
import {
    getCrosshairPlusCursor,
    getMoveCursor,
    getGrabbingCursor,
    getPointerCursor
} from '@/utils/customCursors';
import {
    createMoveVertexAction,
    createMultiMoveVertexAction,
    createInsertVertexAction,
    createDeleteVertexAction,
    createMoveLineAction,
    type LocalAction
} from '@/types/regionUndoActions';

const INTERACTION_RECT_SIZE = 20000;
const INTERACTION_RECT_OFFSET = -INTERACTION_RECT_SIZE / 2;
const LINE_HIT_AREA_WIDTH = 100;

function projectPointToLineSegment(
    point: { x: number; y: number },
    lineStart: { x: number; y: number },
    lineEnd: { x: number; y: number }
): { x: number; y: number } {
    if (!point || typeof point.x !== 'number' || typeof point.y !== 'number' ||
        !isFinite(point.x) || !isFinite(point.y)) {
        throw new Error('projectPointToLineSegment: Invalid point object');
    }
    if (!lineStart || typeof lineStart.x !== 'number' || typeof lineStart.y !== 'number' ||
        !isFinite(lineStart.x) || !isFinite(lineStart.y)) {
        throw new Error('projectPointToLineSegment: Invalid lineStart object');
    }
    if (!lineEnd || typeof lineEnd.x !== 'number' || typeof lineEnd.y !== 'number' ||
        !isFinite(lineEnd.x) || !isFinite(lineEnd.y)) {
        throw new Error('projectPointToLineSegment: Invalid lineEnd object');
    }

    const dx = lineEnd.x - lineStart.x;
    const dy = lineEnd.y - lineStart.y;

    const lengthSquared = dx * dx + dy * dy;
    if (lengthSquared < Number.EPSILON) {
        return { x: lineStart.x, y: lineStart.y };
    }

    const t = Math.max(0, Math.min(1,
        ((point.x - lineStart.x) * dx + (point.y - lineStart.y) * dy) / lengthSquared
    ));

    return {
        x: lineStart.x + t * dx,
        y: lineStart.y + t * dy
    };
}

export interface RegionTransformerProps {
    sceneId: string;
    regionIndex: number;
    segment: RegionSegment;
    gridConfig: GridConfig;
    viewport: { x: number; y: number; scale: number };
    onVerticesChange: (vertices: Point[]) => void;
    onClearSelections: () => void;
    onLocalAction?: (action: LocalAction) => void;
    color?: string;
}

export const RegionTransformer: React.FC<RegionTransformerProps> = memo(({
    segment,
    gridConfig,
    onVerticesChange,
    onClearSelections,
    onLocalAction,
    color
}) => {
    const theme = useTheme();

    const [selectedVertices, setSelectedVertices] = useState<Set<number>>(new Set());
    const [selectedLineIndex, setSelectedLineIndex] = useState<number | null>(null);
    const [draggingVertexIndex, setDraggingVertexIndex] = useState<number | null>(null);
    const [draggingLine, setDraggingLine] = useState<number | null>(null);
    const [marqueeStart, setMarqueeStart] = useState<{ x: number; y: number } | null>(null);
    const [marqueeEnd, setMarqueeEnd] = useState<{ x: number; y: number } | null>(null);
    const [hoveredLineIndex, setHoveredLineIndex] = useState<number | null>(null);
    const [insertPreviewPos, setInsertPreviewPos] = useState<{x: number; y: number} | null>(null);
    const [isShiftPressed, setIsShiftPressed] = useState<boolean>(false);
    const [previewVerticesDuringDrag, setPreviewVerticesDuringDrag] = useState<Point[] | null>(null);

    const dragStartPositionRef = useRef<Point | null>(null);
    const lineDragStartRef = useRef<{ mouseX: number; mouseY: number; vertex1: Point; vertex2: Point } | null>(null);
    const vertexRefs = useRef<Map<number, Konva.Group>>(new Map());

    const previewVertices = previewVerticesDuringDrag ?? segment.vertices;

    useEffect(() => {
        const currentIndices = new Set(segment.vertices.map((_, index) => index));
        const refsToDelete: number[] = [];

        vertexRefs.current.forEach((_, index) => {
            if (!currentIndices.has(index)) {
                refsToDelete.push(index);
            }
        });

        refsToDelete.forEach(index => vertexRefs.current.delete(index));
    }, [segment.vertices]);

    const handleDeleteVertices = useCallback(() => {
        if (segment.vertices.length - selectedVertices.size < 3) {
            return;
        }

        const newVertices = segment.vertices.filter((_, index) => !selectedVertices.has(index));

        const sortedIndices = Array.from(selectedVertices).sort((a, b) => b - a);
        for (const index of sortedIndices) {
            const deletedVertex = segment.vertices[index];
            if (deletedVertex && onLocalAction) {
                const action = createDeleteVertexAction(
                    index,
                    deletedVertex,
                    () => segment,
                    (updater) => {
                        const updated = updater(segment);
                        onVerticesChange(updated.vertices);
                    }
                );
                onLocalAction(action);
            }
        }

        onVerticesChange(newVertices);
        setSelectedVertices(new Set());
        setSelectedLineIndex(null);
    }, [selectedVertices, segment, onVerticesChange, onLocalAction]);

    useEffect(() => {
        const handleKeyDown = (e: KeyboardEvent) => {
            if (e.target instanceof HTMLInputElement || e.target instanceof HTMLTextAreaElement) {
                return;
            }

            if (e.key === 'Shift') {
                setIsShiftPressed(true);
            }

            if (e.key === 'Delete') {
                e.preventDefault();
                e.stopPropagation();

                if (selectedVertices.size > 0) {
                    handleDeleteVertices();
                }
            }

            if (e.key === 'Escape') {
                if (selectedVertices.size > 0 || selectedLineIndex !== null) {
                    e.preventDefault();
                    e.stopPropagation();
                    setSelectedVertices(new Set());
                    setSelectedLineIndex(null);
                }
            }
        };

        const handleKeyUp = (e: KeyboardEvent) => {
            if (e.key === 'Shift') {
                setIsShiftPressed(false);
                setInsertPreviewPos(null);
                setHoveredLineIndex(null);
            }
        };

        window.addEventListener('keydown', handleKeyDown, { capture: true });
        window.addEventListener('keyup', handleKeyUp);
        return () => {
            window.removeEventListener('keydown', handleKeyDown, { capture: true });
            window.removeEventListener('keyup', handleKeyUp);
        };
    }, [selectedVertices, selectedLineIndex, onClearSelections, handleDeleteVertices]);

    const handleVertexDragStart = useCallback((index: number) => {
        const vertex = segment.vertices[index];
        if (!vertex) return;

        const vertexNode = vertexRefs.current.get(index);
        if (vertexNode) {
            vertexNode.position({ x: vertex.x, y: vertex.y });
        }
        setDraggingVertexIndex(index);
        dragStartPositionRef.current = { x: vertex.x, y: vertex.y };
        if (!selectedVertices.has(index)) {
            setSelectedVertices(new Set([index]));
            setSelectedLineIndex(null);
        }
    }, [segment.vertices, selectedVertices]);

    const handleVertexDragMove = useCallback((index: number, e: Konva.KonvaEventObject<DragEvent>) => {
        if (!dragStartPositionRef.current || !e || !e.target) {
            return;
        }

        let currentX = e.target.x();
        let currentY = e.target.y();

        const currentSnapMode = e.evt ? getSnapModeFromEvent(e.evt) : SnapMode.HalfSnap;

        if (gridConfig.snap) {
            const snapped = snapToNearest({ x: currentX, y: currentY }, gridConfig, currentSnapMode, 50);
            currentX = snapped.x;
            currentY = snapped.y;
            e.target.position({ x: currentX, y: currentY });
        }

        const oldX = dragStartPositionRef.current.x;
        const oldY = dragStartPositionRef.current.y;
        const deltaX = currentX - oldX;
        const deltaY = currentY - oldY;

        const newVertices = [...segment.vertices];

        if (selectedVertices.size > 1 && selectedVertices.has(index)) {
            selectedVertices.forEach(vIndex => {
                const vertex = segment.vertices[vIndex];
                if (!vertex) return;
                newVertices[vIndex] = {
                    x: vertex.x + deltaX,
                    y: vertex.y + deltaY
                };
            });
        } else {
            const vertex = segment.vertices[index];
            if (vertex) {
                newVertices[index] = { x: currentX, y: currentY };
            }
        }

        setPreviewVerticesDuringDrag(newVertices);
    }, [dragStartPositionRef, segment.vertices, selectedVertices, gridConfig]);

    const handleVertexDragEnd = useCallback((index: number, e: Konva.KonvaEventObject<DragEvent>) => {
        if (!dragStartPositionRef.current || !e || !e.target) {
            setDraggingVertexIndex(null);
            dragStartPositionRef.current = null;
            return;
        }

        let finalX = e.target.x();
        let finalY = e.target.y();

        const currentSnapMode = e.evt ? getSnapModeFromEvent(e.evt) : SnapMode.HalfSnap;

        if (gridConfig.snap) {
            const snapped = snapToNearest({ x: finalX, y: finalY }, gridConfig, currentSnapMode, 50);
            finalX = snapped.x;
            finalY = snapped.y;
        }

        const oldX = dragStartPositionRef.current.x;
        const oldY = dragStartPositionRef.current.y;
        const deltaX = finalX - oldX;
        const deltaY = finalY - oldY;

        const newVertices = [...segment.vertices];

        if (selectedVertices.size > 1 && selectedVertices.has(index)) {
            const vertexIndices = Array.from(selectedVertices);
            const oldVertices: Point[] = [];
            const newVerticesArray: Point[] = [];

            vertexIndices.forEach(vIndex => {
                const vertex = segment.vertices[vIndex];
                if (!vertex) return;
                oldVertices.push({ x: vertex.x, y: vertex.y });
                newVertices[vIndex] = {
                    x: vertex.x + deltaX,
                    y: vertex.y + deltaY
                };
                newVerticesArray.push(newVertices[vIndex]!);
            });

            if (onLocalAction && (deltaX !== 0 || deltaY !== 0)) {
                const action = createMultiMoveVertexAction(
                    vertexIndices,
                    oldVertices,
                    newVerticesArray,
                    () => segment,
                    (updater) => {
                        const updated = updater(segment);
                        onVerticesChange(updated.vertices);
                    }
                );
                onLocalAction(action);
            }
        } else {
            const oldVertex = { x: oldX, y: oldY };
            const newVertex = { x: finalX, y: finalY };
            const vertex = segment.vertices[index];
            if (vertex) {
                newVertices[index] = newVertex;
            }

            if (onLocalAction && (deltaX !== 0 || deltaY !== 0)) {
                const action = createMoveVertexAction(
                    index,
                    oldVertex,
                    newVertex,
                    () => segment,
                    (updater) => {
                        const updated = updater(segment);
                        onVerticesChange(updated.vertices);
                    }
                );
                onLocalAction(action);
            }
        }

        setDraggingVertexIndex(null);
        dragStartPositionRef.current = null;

        if (deltaX !== 0 || deltaY !== 0) {
            onVerticesChange(newVertices);
        }
        setPreviewVerticesDuringDrag(null);
    }, [segment, selectedVertices, gridConfig, onVerticesChange, onLocalAction]);

    const handleVertexClick = useCallback((index: number, e: Konva.KonvaEventObject<MouseEvent>) => {
        e.cancelBubble = true;

        const ctrlKey = e.evt.ctrlKey || e.evt.metaKey;
        if (ctrlKey) {
            const newSelected = new Set(selectedVertices);
            if (newSelected.has(index)) {
                newSelected.delete(index);
            } else {
                newSelected.add(index);
            }
            setSelectedVertices(newSelected);
        } else {
            setSelectedVertices(new Set([index]));
        }
        setSelectedLineIndex(null);
    }, [selectedVertices]);

    const handleLineClick = useCallback((lineIndex: number, e: Konva.KonvaEventObject<MouseEvent>) => {
        e.cancelBubble = true;
        setSelectedLineIndex(lineIndex);
        const vertex1Index = lineIndex;
        const vertex2Index = (lineIndex + 1) % segment.vertices.length;
        setSelectedVertices(new Set([vertex1Index, vertex2Index]));
    }, [segment.vertices.length]);

    const isPointInRect = (point: { x: number; y: number }, rect: { x: number; y: number; width: number; height: number }): boolean => {
        return point.x >= rect.x && point.x <= rect.x + rect.width &&
               point.y >= rect.y && point.y <= rect.y + rect.height;
    };

    const getMarqueeRect = () => {
        if (!marqueeStart || !marqueeEnd) return null;
        const x = Math.min(marqueeStart.x, marqueeEnd.x);
        const y = Math.min(marqueeStart.y, marqueeEnd.y);
        const width = Math.abs(marqueeEnd.x - marqueeStart.x);
        const height = Math.abs(marqueeEnd.y - marqueeStart.y);
        return { x, y, width, height };
    };

    const marqueeRect = getMarqueeRect();
    const verticesToUse = previewVertices;
    const fillColor = color || theme.palette.primary.main;

    return (
        <Group name="RegionTransformer">
            <Rect
                x={INTERACTION_RECT_OFFSET}
                y={INTERACTION_RECT_OFFSET}
                width={INTERACTION_RECT_SIZE}
                height={INTERACTION_RECT_SIZE}
                fill="transparent"
                listening={true}
                onMouseDown={(e) => {
                    const stage = e.target.getStage();
                    if (stage) {
                        const pointerPos = stage.getPointerPosition();
                        if (pointerPos) {
                            setMarqueeStart(pointerPos);
                            setMarqueeEnd(pointerPos);
                        }
                    }
                }}
                onMouseMove={(e) => {
                    const stage = e.target.getStage();
                    if (!stage) return;

                    const pointerPos = stage.getPointerPosition();
                    if (!pointerPos) return;

                    if (marqueeStart) {
                        setMarqueeEnd(pointerPos);
                    }
                }}
                onMouseUp={(_e) => {
                    if (marqueeStart && marqueeEnd && marqueeRect) {
                        const newSelected = new Set<number>();
                        verticesToUse.forEach((vertex, index) => {
                            if (isPointInRect(vertex, marqueeRect)) {
                                newSelected.add(index);
                            }
                        });
                        setSelectedVertices(newSelected);
                        setSelectedLineIndex(null);
                    }
                    setMarqueeStart(null);
                    setMarqueeEnd(null);
                }}
            />

            <Group
                onMouseMove={(e) => {
                    const stage = e.target.getStage();
                    if (!stage) return;

                    const pointerPos = stage.getPointerPosition();
                    if (!pointerPos) return;

                    if (marqueeStart) {
                        setMarqueeEnd(pointerPos);
                    }

                    if (draggingLine !== null && lineDragStartRef.current) {
                        const scale = stage.scaleX();
                        const worldPos = {
                            x: (pointerPos.x - stage.x()) / scale,
                            y: (pointerPos.y - stage.y()) / scale
                        };

                        const currentSnapMode = e.evt ? getSnapModeFromEvent(e.evt) : SnapMode.HalfSnap;

                        let snappedWorldPos = worldPos;
                        if (gridConfig.snap) {
                            snappedWorldPos = snapToNearest(worldPos, gridConfig, currentSnapMode, 50);
                        }

                        const deltaX = snappedWorldPos.x - lineDragStartRef.current.mouseX;
                        const deltaY = snappedWorldPos.y - lineDragStartRef.current.mouseY;

                        const newVertex1X = lineDragStartRef.current.vertex1.x + deltaX;
                        const newVertex1Y = lineDragStartRef.current.vertex1.y + deltaY;
                        const newVertex2X = lineDragStartRef.current.vertex2.x + deltaX;
                        const newVertex2Y = lineDragStartRef.current.vertex2.y + deltaY;

                        const newVertices = [...segment.vertices];
                        const vertex1Index = draggingLine;
                        const vertex2Index = (draggingLine + 1) % segment.vertices.length;
                        newVertices[vertex1Index] = { x: newVertex1X, y: newVertex1Y };
                        newVertices[vertex2Index] = { x: newVertex2X, y: newVertex2Y };
                        setPreviewVerticesDuringDrag(newVertices);
                    }
                }}
                onMouseUp={(e) => {
                    if (draggingLine !== null && lineDragStartRef.current) {
                        const stage = e.target.getStage();
                        if (stage) {
                            const pointerPos = stage.getPointerPosition();
                            if (pointerPos) {
                                const scale = stage.scaleX();
                                const worldPos = {
                                    x: (pointerPos.x - stage.x()) / scale,
                                    y: (pointerPos.y - stage.y()) / scale
                                };

                                const deltaX = worldPos.x - lineDragStartRef.current.mouseX;
                                const deltaY = worldPos.y - lineDragStartRef.current.mouseY;

                                const currentSnapMode = e.evt ? getSnapModeFromEvent(e.evt) : SnapMode.HalfSnap;

                                let newVertex1X = lineDragStartRef.current.vertex1.x + deltaX;
                                let newVertex1Y = lineDragStartRef.current.vertex1.y + deltaY;
                                let newVertex2X = lineDragStartRef.current.vertex2.x + deltaX;
                                let newVertex2Y = lineDragStartRef.current.vertex2.y + deltaY;

                                if (gridConfig.snap) {
                                    const snapped1 = snapToNearest({ x: newVertex1X, y: newVertex1Y }, gridConfig, currentSnapMode, 50);
                                    const actualDeltaX = snapped1.x - lineDragStartRef.current.vertex1.x;
                                    const actualDeltaY = snapped1.y - lineDragStartRef.current.vertex1.y;

                                    newVertex1X = snapped1.x;
                                    newVertex1Y = snapped1.y;
                                    newVertex2X = lineDragStartRef.current.vertex2.x + actualDeltaX;
                                    newVertex2Y = lineDragStartRef.current.vertex2.y + actualDeltaY;
                                }

                                const newVertices = [...segment.vertices];
                                const vertex1Index = draggingLine;
                                const vertex2Index = (draggingLine + 1) % segment.vertices.length;
                                newVertices[vertex1Index] = { x: newVertex1X, y: newVertex1Y };
                                newVertices[vertex2Index] = { x: newVertex2X, y: newVertex2Y };

                                if (onLocalAction && (deltaX !== 0 || deltaY !== 0)) {
                                    const action = createMoveLineAction(
                                        draggingLine,
                                        lineDragStartRef.current.vertex1,
                                        lineDragStartRef.current.vertex2,
                                        { x: newVertex1X, y: newVertex1Y },
                                        { x: newVertex2X, y: newVertex2Y },
                                        () => segment,
                                        (updater) => {
                                            const updated = updater(segment);
                                            onVerticesChange(updated.vertices);
                                        }
                                    );
                                    onLocalAction(action);
                                }

                                if (deltaX !== 0 || deltaY !== 0) {
                                    onVerticesChange(newVertices);
                                }
                            }
                        }

                        const container = e.target.getStage()?.container();
                        if (container) {
                            container.style.cursor = getMoveCursor();
                        }

                        setDraggingLine(null);
                        lineDragStartRef.current = null;
                        setPreviewVerticesDuringDrag(null);
                    }

                    if (marqueeStart && marqueeEnd && marqueeRect) {
                        const newSelected = new Set<number>();
                        verticesToUse.forEach((vertex, index) => {
                            if (isPointInRect(vertex, marqueeRect)) {
                                newSelected.add(index);
                            }
                        });
                        setSelectedVertices(newSelected);
                        setSelectedLineIndex(null);
                    }
                    setMarqueeStart(null);
                    setMarqueeEnd(null);
                }}
            >
                {marqueeRect && (
                    <Rect
                        x={marqueeRect.x}
                        y={marqueeRect.y}
                        width={marqueeRect.width}
                        height={marqueeRect.height}
                        stroke={theme.palette.primary.main}
                        strokeWidth={1}
                        dash={[5, 5]}
                        fill={theme.palette.primary.main}
                        opacity={0.1}
                        listening={false}
                    />
                )}

                {verticesToUse.map((vertex, index) => {
                    const nextVertex = verticesToUse[(index + 1) % verticesToUse.length];
                    if (!nextVertex) return null;
                    const isLineSelected = selectedLineIndex === index;
                    return (
                        <React.Fragment key={`line-segment-${index}`}>
                            <Line
                                points={[vertex.x, vertex.y, nextVertex.x, nextVertex.y]}
                                stroke={isLineSelected ? theme.palette.error.main : fillColor}
                                strokeWidth={3}
                                listening={false}
                            />

                            <Line
                                points={[vertex.x, vertex.y, nextVertex.x, nextVertex.y]}
                                stroke="transparent"
                                strokeWidth={LINE_HIT_AREA_WIDTH}
                                onMouseDown={(e: Konva.KonvaEventObject<MouseEvent>) => {
                                    if (isLineSelected) {
                                        e.cancelBubble = true;
                                        const stage = e.target.getStage();
                                        if (stage) {
                                            const pointerPos = stage.getPointerPosition();
                                            if (pointerPos) {
                                                const scale = stage.scaleX();
                                                let worldPos = {
                                                    x: (pointerPos.x - stage.x()) / scale,
                                                    y: (pointerPos.y - stage.y()) / scale
                                                };

                                                const currentSnapMode = e.evt ? getSnapModeFromEvent(e.evt) : SnapMode.HalfSnap;

                                                if (gridConfig.snap) {
                                                    worldPos = snapToNearest(worldPos, gridConfig, currentSnapMode, 50);
                                                }

                                                setDraggingLine(index);
                                                lineDragStartRef.current = {
                                                    mouseX: worldPos.x,
                                                    mouseY: worldPos.y,
                                                    vertex1: { x: vertex.x, y: vertex.y },
                                                    vertex2: { x: nextVertex.x, y: nextVertex.y }
                                                };

                                                const container = stage.container();
                                                if (container) {
                                                    container.style.cursor = getGrabbingCursor();
                                                }
                                            }
                                        }
                                    }
                                }}
                                onClick={(e: Konva.KonvaEventObject<MouseEvent>) => {
                                    e.cancelBubble = true;

                                    if (e.evt.shiftKey) {
                                        const stage = e.target.getStage();
                                        if (!stage) return;

                                        const pointerPos = stage.getPointerPosition();
                                        if (!pointerPos) return;

                                        const scale = stage.scaleX();
                                        const worldPos = {
                                            x: (pointerPos.x - stage.x()) / scale,
                                            y: (pointerPos.y - stage.y()) / scale
                                        };

                                        const projected = projectPointToLineSegment(worldPos, vertex, nextVertex);

                                        let insertPos = projected;
                                        if (gridConfig.snap) {
                                            const snapMode = getSnapModeFromEvent(e.evt);
                                            insertPos = snapToNearest(projected, gridConfig, snapMode);
                                        }

                                        const newVertices = [...segment.vertices];
                                        newVertices.splice(index + 1, 0, insertPos);

                                        if (onLocalAction) {
                                            const action = createInsertVertexAction(
                                                index + 1,
                                                insertPos,
                                                () => segment,
                                                (updater) => {
                                                    const updated = updater(segment);
                                                    onVerticesChange(updated.vertices);
                                                }
                                            );
                                            onLocalAction(action);
                                        }

                                        onVerticesChange(newVertices);

                                        setSelectedVertices(new Set([index + 1]));
                                        setSelectedLineIndex(null);
                                        return;
                                    }

                                    handleLineClick(index, e);
                                }}
                                onMouseEnter={(e: Konva.KonvaEventObject<MouseEvent>) => {
                                    const container = e.target.getStage()?.container();
                                    if (container) {
                                        const cursor = e.evt.shiftKey
                                            ? getCrosshairPlusCursor()
                                            : (isLineSelected ? getMoveCursor() : getPointerCursor());
                                        container.style.cursor = cursor;
                                    }

                                    setHoveredLineIndex(index);
                                }}
                                onMouseMove={(e: Konva.KonvaEventObject<MouseEvent>) => {
                                    const container = e.target.getStage()?.container();
                                    if (container) {
                                        const cursor = e.evt.shiftKey
                                            ? getCrosshairPlusCursor()
                                            : (isLineSelected ? getMoveCursor() : getPointerCursor());
                                        container.style.cursor = cursor;
                                    }

                                    if (e.evt.shiftKey && !draggingVertexIndex && !draggingLine && !marqueeStart) {
                                        const stage = e.target.getStage();
                                        if (!stage) return;

                                        const pointerPos = stage.getPointerPosition();
                                        if (!pointerPos) return;

                                        const scale = stage.scaleX();
                                        const worldPos = {
                                            x: (pointerPos.x - stage.x()) / scale,
                                            y: (pointerPos.y - stage.y()) / scale
                                        };

                                        const projected = projectPointToLineSegment(worldPos, vertex, nextVertex);

                                        let finalPos = projected;
                                        if (gridConfig.snap) {
                                            const currentSnapMode = getSnapModeFromEvent(e.evt);
                                            finalPos = snapToNearest(projected, gridConfig, currentSnapMode, 50);
                                        }

                                        setInsertPreviewPos(finalPos);
                                        setHoveredLineIndex(index);
                                    } else {
                                        setInsertPreviewPos(null);
                                        setHoveredLineIndex(null);
                                    }
                                }}
                                onMouseLeave={(e: Konva.KonvaEventObject<MouseEvent>) => {
                                    const container = e.target.getStage()?.container();
                                    if (container) {
                                        container.style.cursor = 'default';
                                    }

                                    if (hoveredLineIndex === index) {
                                        setInsertPreviewPos(null);
                                        setHoveredLineIndex(null);
                                    }
                                }}
                            />
                        </React.Fragment>
                    );
                })}

                {verticesToUse.map((vertex, index) => {
                    const isSelected = selectedVertices.has(index);
                    const isDragging = draggingVertexIndex === index;

                    const groupProps: Record<string, unknown> = {
                        draggable: true,
                        listening: !isShiftPressed,
                        ref: (node: Konva.Group | null) => {
                            if (node) {
                                vertexRefs.current.set(index, node);
                            } else {
                                vertexRefs.current.delete(index);
                            }
                        },
                        dragBoundFunc: (pos: { x: number; y: number }) => {
                            return pos;
                        },
                        onDragStart: (e: Konva.KonvaEventObject<DragEvent>) => {
                            handleVertexDragStart(index);
                            const container = e.target.getStage()?.container();
                            if (container) {
                                container.style.cursor = getGrabbingCursor();
                            }
                        },
                        onDragMove: (e: Konva.KonvaEventObject<DragEvent>) => handleVertexDragMove(index, e),
                        onDragEnd: (e: Konva.KonvaEventObject<DragEvent>) => {
                            handleVertexDragEnd(index, e);
                            const container = e.target.getStage()?.container();
                            if (container) {
                                container.style.cursor = getMoveCursor();
                            }
                        },
                        onClick: (e: Konva.KonvaEventObject<MouseEvent>) => handleVertexClick(index, e),
                        onMouseEnter: (e: Konva.KonvaEventObject<MouseEvent>) => {
                            const container = e.target.getStage()?.container();
                            if (container) {
                                const cursor = e.evt.shiftKey ? getCrosshairPlusCursor() : getMoveCursor();
                                container.style.cursor = cursor;
                            }
                        },
                        onMouseMove: (e: Konva.KonvaEventObject<MouseEvent>) => {
                            const container = e.target.getStage()?.container();
                            if (container) {
                                const cursor = e.evt.shiftKey ? getCrosshairPlusCursor() : getMoveCursor();
                                container.style.cursor = cursor;
                            }
                        },
                        onMouseLeave: (e: Konva.KonvaEventObject<MouseEvent>) => {
                            const container = e.target.getStage()?.container();
                            if (container) {
                                container.style.cursor = 'default';
                            }
                        }
                    };

                    if (!isDragging) {
                        groupProps.x = vertex.x;
                        groupProps.y = vertex.y;
                    }

                    return (
                        <Group key={`vertex-${index}`} {...groupProps}>
                            <Circle
                                x={0}
                                y={0}
                                radius={25}
                                fill="transparent"
                            />
                            <Circle
                                x={0}
                                y={0}
                                radius={5}
                                fill={isSelected ? theme.palette.error.main : fillColor}
                                listening={false}
                            />
                        </Group>
                    );
                })}

                {insertPreviewPos && (
                    <Circle
                        x={insertPreviewPos.x}
                        y={insertPreviewPos.y}
                        radius={5}
                        fill="transparent"
                        stroke={theme.palette.warning.main}
                        strokeWidth={2}
                        dash={[4, 4]}
                        listening={false}
                        opacity={0.8}
                    />
                )}
            </Group>
        </Group>
    );
});

RegionTransformer.displayName = 'RegionTransformer';
