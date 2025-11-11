import React, { useState, useEffect, useRef, useCallback } from 'react';
import { Group, Circle, Line, Rect } from 'react-konva';
import { useTheme } from '@mui/material';
import type { Pole, EncounterWall } from '@/types/domain';
import type { GridConfig } from '@/utils/gridCalculator';
import type { useWallTransaction } from '@/hooks/useWallTransaction';
import { snapToNearest, SnapMode } from '@/utils/structureSnapping';
import { getSnapModeFromEvent } from '@/utils/snapUtils';
import { getCrosshairPlusCursor, getMoveCursor, getGrabbingCursor, getPointerCursor } from '@/utils/customCursors';
import {
    createMovePoleAction,
    createMultiMovePoleAction,
    createInsertPoleAction,
    createDeletePoleAction,
    createMoveLineAction
} from '@/types/wallUndoActions';

type SelectionMode = 'pole' | 'line' | 'marquee';

const INTERACTION_RECT_SIZE = 20000;
const INTERACTION_RECT_OFFSET = -INTERACTION_RECT_SIZE / 2;
const LINE_HIT_AREA_WIDTH = 100;

/**
 * Projects a point onto a line segment (not infinite line)
 * Returns closest point on segment to the given point
 *
 * @param point - The point to project
 * @param lineStart - Start of line segment
 * @param lineEnd - End of line segment
 * @returns Projected point on line segment
 * @throws Error if inputs are invalid
 */
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

export interface WallBreakData {
    breakPoleIndex: number;
    newWallPoles: Pole[];
    originalWallPoles: Pole[];
}

export interface WallTransformerProps {
    poles: Pole[];
    isClosed?: boolean;
    onPolesChange?: (poles: Pole[], isClosed?: boolean) => void;
    gridConfig?: GridConfig | undefined;
    snapEnabled?: boolean | undefined;
    snapMode?: SnapMode | undefined;
    onClearSelections?: () => void;
    isAltPressed?: boolean | undefined;
    encounterId?: string | undefined;
    wallIndex?: number | undefined;
    wall?: EncounterWall | undefined;
    onWallBreak?: (breakData: WallBreakData) => void | Promise<void>;
    enableBackgroundRect?: boolean | undefined;
    wallTransaction?: ReturnType<typeof useWallTransaction> | undefined;
}

export const WallTransformer: React.FC<WallTransformerProps> = ({
    poles,
    isClosed = false,
    onPolesChange,
    gridConfig,
    snapEnabled = true,
    snapMode: externalSnapMode,
    onClearSelections,
    isAltPressed = false,
    encounterId: _encounterId,
    wallIndex: _wallIndex,
    wall: _wall,
    onWallBreak,
    enableBackgroundRect = true,
    wallTransaction
}) => {
    const theme = useTheme();
    const [draggingIndex, setDraggingIndex] = useState<number | null>(null);
    const [previewPoles, setPreviewPoles] = useState<Pole[]>(poles);
    const [selectedPoles, setSelectedPoles] = useState<Set<number>>(new Set());
    const [selectedLines, setSelectedLines] = useState<Set<number>>(new Set());
    const [_selectionMode, setSelectionMode] = useState<SelectionMode>('pole');
    const [marqueeStart, setMarqueeStart] = useState<{ x: number; y: number } | null>(null);
    const [marqueeEnd, setMarqueeEnd] = useState<{ x: number; y: number } | null>(null);
    const [draggingLine, setDraggingLine] = useState<number | null>(null);
    const dragStartPositionRef = useRef<{ x: number; y: number } | null>(null);
    const lineDragStartRef = useRef<{ mouseX: number; mouseY: number; pole1: { x: number; y: number; h: number }; pole2: { x: number; y: number; h: number } } | null>(null);
    const circleRefs = useRef<Map<number, any>>(new Map());
    const [hoveredLineIndex, setHoveredLineIndex] = useState<number | null>(null);
    const [insertPreviewPos, setInsertPreviewPos] = useState<{x: number; y: number} | null>(null);
    const [isShiftPressed, setIsShiftPressed] = useState<boolean>(false);

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

    const handleBreakWall = useCallback(() => {
        let breakPoleIndex: number;

        if (selectedPoles.size > 0) {
            breakPoleIndex = Math.min(...Array.from(selectedPoles));
        } else if (selectedLines.size > 0) {
            const firstLineIndex = Math.min(...Array.from(selectedLines));
            breakPoleIndex = firstLineIndex + 1;
        } else {
            return;
        }

        if (breakPoleIndex >= poles.length) {
            return;
        }

        if (isClosed) {
            if (breakPoleIndex === poles.length - 1) {
                const newPoles = poles.filter((_, index) => index !== breakPoleIndex);
                if (newPoles.length >= 2) {
                    onPolesChange?.(newPoles, true);
                    setSelectedPoles(new Set());
                    setSelectedLines(new Set());
                }
            } else {
                const reorderedPoles: Pole[] = [
                    ...poles.slice(breakPoleIndex),
                    ...poles.slice(0, breakPoleIndex + 1)
                ];
                onPolesChange?.(reorderedPoles, false);
                setSelectedPoles(new Set());
                setSelectedLines(new Set());
            }
        } else {
            if (breakPoleIndex === poles.length - 1) {
                const newPoles = poles.filter((_, index) => index !== breakPoleIndex);
                if (newPoles.length >= 2) {
                    onPolesChange?.(newPoles, false);
                    setSelectedPoles(new Set());
                    setSelectedLines(new Set());
                }
            } else {
                const originalWallPoles = poles.slice(0, breakPoleIndex + 1);
                const newWallPoles = poles.slice(breakPoleIndex);

                if (originalWallPoles.length >= 2 && newWallPoles.length >= 2 && onWallBreak) {
                    onWallBreak({
                        breakPoleIndex,
                        newWallPoles,
                        originalWallPoles
                    });
                    setSelectedPoles(new Set());
                    setSelectedLines(new Set());
                }
            }
        }
    }, [selectedPoles, selectedLines, poles, isClosed, onPolesChange, onWallBreak]);

    useEffect(() => {
        // eslint-disable-next-line react-hooks/set-state-in-effect
        setPreviewPoles(poles);
    }, [poles, isClosed]);

    useEffect(() => {
        const currentIndices = new Set(poles.map((_, index) => index));
        const refsToDelete: number[] = [];

        circleRefs.current.forEach((_, index) => {
            if (!currentIndices.has(index)) {
                refsToDelete.push(index);
            }
        });

        refsToDelete.forEach(index => circleRefs.current.delete(index));
    }, [poles]);

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

                if (isAltPressed) {
                    if (selectedPoles.size > 0 || selectedLines.size > 0) {
                        handleBreakWall();
                    }
                } else {
                    if (selectedPoles.size > 0) {
                        const indicesToDelete = Array.from(selectedPoles);
                        const newPoles = poles.filter((_, index) => !selectedPoles.has(index));
                        if (newPoles.length >= 2) {
                            if (wallTransaction) {
                                const action = createDeletePoleAction(
                                    indicesToDelete,
                                    poles.filter((_, i) => indicesToDelete.includes(i)),
                                    (updatedPoles) => onPolesChange?.(updatedPoles, isClosed),
                                    () => {
                                        let currentPoles: Pole[] = [];
                                        setPreviewPoles(p => {
                                            currentPoles = p;
                                            return p;
                                        });
                                        return currentPoles;
                                    },
                                    () => isClosed
                                );
                                wallTransaction.pushLocalAction(action);
                            }

                            onPolesChange?.(newPoles, isClosed);
                            setSelectedPoles(new Set());
                            setSelectedLines(new Set());
                        }
                    } else if (selectedLines.size > 0) {
                        const indicesToDelete = new Set<number>();
                        selectedLines.forEach(lineIndex => {
                            indicesToDelete.add(lineIndex + 1);
                        });

                        const indicesToDeleteArray = Array.from(indicesToDelete);
                        const newPoles = poles.filter((_, index) => !indicesToDelete.has(index));
                        if (newPoles.length >= 2) {
                            if (wallTransaction) {
                                const action = createDeletePoleAction(
                                    indicesToDeleteArray,
                                    poles.filter((_, i) => indicesToDelete.has(i)),
                                    (updatedPoles) => onPolesChange?.(updatedPoles, isClosed),
                                    () => {
                                        let currentPoles: Pole[] = [];
                                        setPreviewPoles(p => {
                                            currentPoles = p;
                                            return p;
                                        });
                                        return currentPoles;
                                    },
                                    () => isClosed
                                );
                                wallTransaction.pushLocalAction(action);
                            }

                            onPolesChange?.(newPoles, isClosed);
                            setSelectedPoles(new Set());
                            setSelectedLines(new Set());
                        }
                    }
                }
            }

            if (e.key === 'Escape') {
                if (selectedPoles.size > 0 || selectedLines.size > 0) {
                    e.preventDefault();
                    e.stopPropagation();
                    setSelectedPoles(new Set());
                    setSelectedLines(new Set());
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
    }, [selectedPoles, selectedLines, poles, onPolesChange, onClearSelections, isAltPressed, isClosed, handleBreakWall, wallTransaction]);

    const handleDragStart = (index: number) => {
        const pole = poles[index];
        if (!pole) return;

        const circleNode = circleRefs.current.get(index);
        if (circleNode) {
            circleNode.position({ x: pole.x, y: pole.y });
        }
        setDraggingIndex(index);
        dragStartPositionRef.current = { x: pole.x, y: pole.y };
        if (!selectedPoles.has(index)) {
            setSelectedPoles(new Set([index]));
            setSelectedLines(new Set());
        }
    };

    const handleDragMove = (index: number, e: any) => {
        if (!dragStartPositionRef.current || !e || !e.target) {
            return;
        }

        let currentX = e.target.x();
        let currentY = e.target.y();

        const currentSnapMode = e.evt ? getSnapModeFromEvent(e.evt, externalSnapMode) : (externalSnapMode ?? SnapMode.HalfSnap);

        // Apply snapping
        if (snapEnabled && gridConfig) {
            const snapped = snapToNearest({ x: currentX, y: currentY }, gridConfig, currentSnapMode, 50);
            currentX = snapped.x;
            currentY = snapped.y;
            e.target.position({ x: currentX, y: currentY });
        }

        const oldX = dragStartPositionRef.current.x;
        const oldY = dragStartPositionRef.current.y;
        const deltaX = currentX - oldX;
        const deltaY = currentY - oldY;

        const newPoles = [...poles];

        if (selectedPoles.size > 1 && selectedPoles.has(index)) {
            selectedPoles.forEach(poleIndex => {
                const pole = poles[poleIndex];
                if (!pole) return;
                newPoles[poleIndex] = {
                    x: pole.x + deltaX,
                    y: pole.y + deltaY,
                    h: pole.h
                };
            });
        } else {
            const pole = poles[index];
            if (pole) {
                newPoles[index] = { x: currentX, y: currentY, h: pole.h };
            }
        }

        setPreviewPoles(newPoles);
    };

    const handleDragEnd = (index: number, e: any) => {
        if (!dragStartPositionRef.current || !e || !e.target) {
            setDraggingIndex(null);
            dragStartPositionRef.current = null;
            return;
        }

        let finalX = e.target.x();
        let finalY = e.target.y();

        const currentSnapMode = e.evt ? getSnapModeFromEvent(e.evt, externalSnapMode) : (externalSnapMode ?? SnapMode.HalfSnap);

        // Apply final snapping
        if (snapEnabled && gridConfig) {
            const snapped = snapToNearest({ x: finalX, y: finalY }, gridConfig, currentSnapMode, 50);
            finalX = snapped.x;
            finalY = snapped.y;
        }

        const oldX = dragStartPositionRef.current.x;
        const oldY = dragStartPositionRef.current.y;
        const deltaX = finalX - oldX;
        const deltaY = finalY - oldY;

        const newPoles = [...poles];

        if (selectedPoles.size > 1 && selectedPoles.has(index)) {
            const moves = Array.from(selectedPoles).map(poleIndex => {
                const pole = poles[poleIndex];
                if (!pole) throw new Error(`Pole at index ${poleIndex} not found`);
                return {
                    poleIndex,
                    oldPosition: { x: pole.x, y: pole.y },
                    newPosition: { x: pole.x + deltaX, y: pole.y + deltaY }
                };
            });

            selectedPoles.forEach(poleIndex => {
                const pole = poles[poleIndex];
                if (!pole) return;
                newPoles[poleIndex] = {
                    x: pole.x + deltaX,
                    y: pole.y + deltaY,
                    h: pole.h
                };
            });

            if (wallTransaction && (deltaX !== 0 || deltaY !== 0)) {
                const action = createMultiMovePoleAction(
                    moves,
                    (updatedPoles) => onPolesChange?.(updatedPoles, isClosed),
                    () => {
                        let currentPoles: Pole[] = [];
                        setPreviewPoles(p => {
                            currentPoles = p;
                            return p;
                        });
                        return currentPoles;
                    },
                    () => isClosed
                );
                wallTransaction.pushLocalAction(action);
            }
        } else {
            const pole = poles[index];
            if (pole) {
                newPoles[index] = { x: finalX, y: finalY, h: pole.h };
            }

            if (wallTransaction && (deltaX !== 0 || deltaY !== 0)) {
                const action = createMovePoleAction(
                    index,
                    { x: oldX, y: oldY },
                    { x: finalX, y: finalY },
                    (updatedPoles) => onPolesChange?.(updatedPoles, isClosed),
                    () => {
                        let currentPoles: Pole[] = [];
                        setPreviewPoles(p => {
                            currentPoles = p;
                            return p;
                        });
                        return currentPoles;
                    },
                    () => isClosed
                );
                wallTransaction.pushLocalAction(action);
            }
        }

        setDraggingIndex(null);
        dragStartPositionRef.current = null;

        if (newPoles.length >= 2 && (deltaX !== 0 || deltaY !== 0)) {
            onPolesChange?.(newPoles, isClosed);
        }
        setPreviewPoles(newPoles);
    };

    const polesToUse = previewPoles;

    const handleLineClick = (lineIndex: number, e: any) => {
        e.cancelBubble = true;
        setSelectedLines(new Set([lineIndex]));
        const pole1 = lineIndex;
        const pole2 = lineIndex + 1;
        setSelectedPoles(new Set([pole1, pole2]));
    };

    const marqueeRect = getMarqueeRect();

    return (
        <Group>
            {/* Background rect to capture clicks on empty space - MUST be first for z-order */}
            {enableBackgroundRect && (
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
                                setSelectionMode('marquee');
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
                            polesToUse.forEach((pole, index) => {
                                if (isPointInRect(pole, marqueeRect)) {
                                    newSelected.add(index);
                                }
                            });
                            setSelectedPoles(newSelected);
                            setSelectedLines(new Set());
                        }
                        setMarqueeStart(null);
                        setMarqueeEnd(null);
                        setSelectionMode('pole');
                    }}
                />
            )}

            <Group
            onMouseMove={(e) => {
                const stage = e.target.getStage();
                if (!stage) return;

                const pointerPos = stage.getPointerPosition();
                if (!pointerPos) return;

                // Handle marquee selection
                if (marqueeStart) {
                    setMarqueeEnd(pointerPos);
                }

                // Handle line dragging - must be at Group level to track mouse everywhere
                if (draggingLine !== null && lineDragStartRef.current) {
                    const scale = stage.scaleX();
                    const worldPos = {
                        x: (pointerPos.x - stage.x()) / scale,
                        y: (pointerPos.y - stage.y()) / scale
                    };

                    const currentSnapMode = e.evt ? getSnapModeFromEvent(e.evt, externalSnapMode) : (externalSnapMode ?? SnapMode.HalfSnap);

                    // Snap the current mouse position
                    let snappedWorldPos = worldPos;
                    if (snapEnabled && gridConfig) {
                        snappedWorldPos = snapToNearest(worldPos, gridConfig, currentSnapMode, 50);
                    }

                    // Calculate delta from start position using snapped mouse position
                    const deltaX = snappedWorldPos.x - lineDragStartRef.current.mouseX;
                    const deltaY = snappedWorldPos.y - lineDragStartRef.current.mouseY;

                    // Apply delta to both poles
                    const newPole1X = lineDragStartRef.current.pole1.x + deltaX;
                    const newPole1Y = lineDragStartRef.current.pole1.y + deltaY;
                    const newPole2X = lineDragStartRef.current.pole2.x + deltaX;
                    const newPole2Y = lineDragStartRef.current.pole2.y + deltaY;

                    const newPoles = [...poles];
                    const pole1 = poles[draggingLine];
                    const pole2 = poles[draggingLine + 1];
                    if (pole1 && pole2) {
                        newPoles[draggingLine] = { x: newPole1X, y: newPole1Y, h: pole1.h };
                        newPoles[draggingLine + 1] = { x: newPole2X, y: newPole2Y, h: pole2.h };
                        setPreviewPoles(newPoles);
                    }
                }
            }}
            onMouseUp={(e) => {
                // Handle line drag end
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

                            const currentSnapMode = e.evt ? getSnapModeFromEvent(e.evt, externalSnapMode) : (externalSnapMode ?? SnapMode.HalfSnap);

                            let newPole1X = lineDragStartRef.current.pole1.x + deltaX;
                            let newPole1Y = lineDragStartRef.current.pole1.y + deltaY;
                            let newPole2X = lineDragStartRef.current.pole2.x + deltaX;
                            let newPole2Y = lineDragStartRef.current.pole2.y + deltaY;

                            // Apply snapping to first pole and calculate actual delta
                            if (snapEnabled && gridConfig) {
                                const snapped1 = snapToNearest({ x: newPole1X, y: newPole1Y }, gridConfig, currentSnapMode, 50);
                                const actualDeltaX = snapped1.x - lineDragStartRef.current.pole1.x;
                                const actualDeltaY = snapped1.y - lineDragStartRef.current.pole1.y;

                                newPole1X = snapped1.x;
                                newPole1Y = snapped1.y;
                                newPole2X = lineDragStartRef.current.pole2.x + actualDeltaX;
                                newPole2Y = lineDragStartRef.current.pole2.y + actualDeltaY;
                            }

                            const newPoles = [...poles];
                            const pole1 = poles[draggingLine];
                            const pole2 = poles[draggingLine + 1];
                            if (pole1 && pole2) {
                                newPoles[draggingLine] = { x: newPole1X, y: newPole1Y, h: pole1.h };
                                newPoles[draggingLine + 1] = { x: newPole2X, y: newPole2Y, h: pole2.h };
                            }

                            if (wallTransaction && (deltaX !== 0 || deltaY !== 0)) {
                                const action = createMoveLineAction(
                                    draggingLine,
                                    draggingLine + 1,
                                    { x: lineDragStartRef.current.pole1.x, y: lineDragStartRef.current.pole1.y, h: lineDragStartRef.current.pole1.h },
                                    { x: lineDragStartRef.current.pole2.x, y: lineDragStartRef.current.pole2.y, h: lineDragStartRef.current.pole2.h },
                                    { x: newPole1X, y: newPole1Y, h: lineDragStartRef.current.pole1.h },
                                    { x: newPole2X, y: newPole2Y, h: lineDragStartRef.current.pole2.h },
                                    (updatedPoles) => onPolesChange?.(updatedPoles, isClosed),
                                    () => {
                                        let currentPoles: Pole[] = [];
                                        setPreviewPoles(p => {
                                            currentPoles = p;
                                            return p;
                                        });
                                        return currentPoles;
                                    },
                                    () => isClosed
                                );
                                wallTransaction.pushLocalAction(action);
                            }

                            if (deltaX !== 0 || deltaY !== 0) {
                                onPolesChange?.(newPoles, isClosed);
                            }
                            setPreviewPoles(newPoles);
                        }
                    }

                    const container = e.target.getStage()?.container();
                    if (container) {
                        container.style.cursor = getMoveCursor();
                    }

                    setDraggingLine(null);
                    lineDragStartRef.current = null;
                }

                // Handle marquee selection
                if (marqueeStart && marqueeEnd && marqueeRect) {
                    const newSelected = new Set<number>();
                    polesToUse.forEach((pole, index) => {
                        if (isPointInRect(pole, marqueeRect)) {
                            newSelected.add(index);
                        }
                    });
                    setSelectedPoles(newSelected);
                    setSelectedLines(new Set());
                }
                setMarqueeStart(null);
                setMarqueeEnd(null);
                setSelectionMode('pole');
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

            {polesToUse.slice(0, -1).map((pole, index) => {
                const nextPole = polesToUse[index + 1];
                if (!nextPole) return null;
                const isLineSelected = selectedLines.has(index);
                return (
                    <React.Fragment key={`line-segment-${index}`}>
                        {/* Visible line - shows selection state */}
                        <Line
                            points={[pole.x, pole.y, nextPole.x, nextPole.y]}
                            stroke={isLineSelected ? theme.palette.error.main : theme.palette.primary.main}
                            strokeWidth={3}
                            listening={false}
                        />

                        {/* Invisible hit area for interaction - wide enough for snap jumps */}
                        <Line
                            points={[pole.x, pole.y, nextPole.x, nextPole.y]}
                            stroke="transparent"
                            strokeWidth={LINE_HIT_AREA_WIDTH}
                        onMouseDown={(e) => {
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

                                        const currentSnapMode = e.evt ? getSnapModeFromEvent(e.evt, externalSnapMode) : (externalSnapMode ?? SnapMode.HalfSnap);

                                        // Snap the starting mouse position
                                        if (snapEnabled && gridConfig) {
                                            worldPos = snapToNearest(worldPos, gridConfig, currentSnapMode, 50);
                                        }

                                        setDraggingLine(index);
                                        lineDragStartRef.current = {
                                            mouseX: worldPos.x,
                                            mouseY: worldPos.y,
                                            pole1: { x: pole.x, y: pole.y, h: pole.h },
                                            pole2: { x: nextPole.x, y: nextPole.y, h: nextPole.h }
                                        };

                                        const container = stage.container();
                                        if (container) {
                                            container.style.cursor = getGrabbingCursor();
                                        }
                                    }
                                }
                            }
                        }}
                        onClick={(e) => {
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

                                const projected = projectPointToLineSegment(worldPos, pole, nextPole!);

                                let insertPos = projected;
                                if (snapEnabled && gridConfig) {
                                    const snapMode = getSnapModeFromEvent(e.evt);
                                    insertPos = snapToNearest(projected, gridConfig, snapMode);
                                }

                                const insertedPole = {
                                    x: insertPos.x,
                                    y: insertPos.y,
                                    h: pole.h
                                };

                                const newPoles = [...poles];
                                newPoles.splice(index + 1, 0, insertedPole);

                                if (wallTransaction) {
                                    const action = createInsertPoleAction(
                                        index + 1,
                                        insertedPole,
                                        (updatedPoles) => onPolesChange?.(updatedPoles, isClosed),
                                        () => {
                                            let currentPoles: Pole[] = [];
                                            setPreviewPoles(p => {
                                                currentPoles = p;
                                                return p;
                                            });
                                            return currentPoles;
                                        },
                                        () => isClosed
                                    );
                                    wallTransaction.pushLocalAction(action);
                                }

                                onPolesChange?.(newPoles, isClosed);

                                setSelectedPoles(new Set([index + 1]));
                                setSelectedLines(new Set());
                                return;
                            }

                            handleLineClick(index, e);
                        }}
                        onMouseEnter={(e) => {
                            const container = e.target.getStage()?.container();
                            if (container) {
                                const cursor = e.evt.shiftKey
                                    ? getCrosshairPlusCursor()
                                    : (isLineSelected ? getMoveCursor() : getPointerCursor());
                                container.style.cursor = cursor;
                            }

                            // Initialize preview if Shift already pressed
                            setHoveredLineIndex(index);
                        }}
                        onMouseMove={(e) => {
                            const container = e.target.getStage()?.container();
                            if (container) {
                                const cursor = e.evt.shiftKey
                                    ? getCrosshairPlusCursor()
                                    : (isLineSelected ? getMoveCursor() : getPointerCursor());
                                container.style.cursor = cursor;
                            }

                            // Update preview position if Shift is pressed
                            if (e.evt.shiftKey && !draggingIndex && !draggingLine && !marqueeStart) {
                                const stage = e.target.getStage();
                                if (!stage) return;

                                const pointerPos = stage.getPointerPosition();
                                if (!pointerPos) return;

                                const scale = stage.scaleX();
                                const worldPos = {
                                    x: (pointerPos.x - stage.x()) / scale,
                                    y: (pointerPos.y - stage.y()) / scale
                                };

                                // Project onto line segment
                                const projected = projectPointToLineSegment(worldPos, pole, nextPole!);

                                // Apply snap
                                let finalPos = projected;
                                if (snapEnabled && gridConfig) {
                                    const currentSnapMode = getSnapModeFromEvent(e.evt, externalSnapMode);
                                    finalPos = snapToNearest(projected, gridConfig, currentSnapMode, 50);
                                }

                                setInsertPreviewPos(finalPos);
                                setHoveredLineIndex(index);
                            } else {
                                setInsertPreviewPos(null);
                                setHoveredLineIndex(null);
                            }
                        }}
                        onMouseLeave={(e) => {
                            const container = e.target.getStage()?.container();
                            if (container) {
                                container.style.cursor = 'default';
                            }

                            // Clear preview when leaving line
                            if (hoveredLineIndex === index) {
                                setInsertPreviewPos(null);
                                setHoveredLineIndex(null);
                            }
                        }}
                    />
                    </React.Fragment>
                );
            })}

            {polesToUse.map((pole, index) => {
                const isSelected = selectedPoles.has(index);
                const isDragging = draggingIndex === index;

                const groupProps: any = {
                    draggable: true,
                    listening: !isShiftPressed,
                    ref: (node: any) => {
                        if (node) {
                            circleRefs.current.set(index, node);
                        } else {
                            circleRefs.current.delete(index);
                        }
                    },
                    dragBoundFunc: (pos: { x: number; y: number }) => {
                        return pos;
                    },
                    onDragStart: (e: any) => {
                        handleDragStart(index);
                        const container = e.target.getStage()?.container();
                        if (container) {
                            container.style.cursor = getGrabbingCursor();
                        }
                    },
                    onDragMove: (e: any) => handleDragMove(index, e),
                    onDragEnd: (e: any) => {
                        handleDragEnd(index, e);
                        const container = e.target.getStage()?.container();
                        if (container) {
                            container.style.cursor = getMoveCursor();
                        }
                    },
                    onClick: (e: any) => {
                        e.cancelBubble = true;

                        if (e.evt.shiftKey) {
                            const newPoles = [...poles];
                            const insertIndex = index + 1;
                            newPoles.splice(insertIndex, 0, {
                                x: pole.x,
                                y: pole.y,
                                h: pole.h
                            });

                            onPolesChange?.(newPoles, isClosed);
                            setSelectedPoles(new Set([insertIndex]));
                            setSelectedLines(new Set());
                            return;
                        }

                        const ctrlKey = e.evt.ctrlKey || e.evt.metaKey;
                        if (ctrlKey) {
                            const newSelected = new Set(selectedPoles);
                            if (newSelected.has(index)) {
                                newSelected.delete(index);
                            } else {
                                newSelected.add(index);
                            }
                            setSelectedPoles(newSelected);
                        } else {
                            setSelectedPoles(new Set([index]));
                        }
                        setSelectedLines(new Set());
                    },
                    onMouseEnter: (e: any) => {
                        const container = e.target.getStage()?.container();
                        if (container) {
                            const cursor = e.evt.shiftKey ? getCrosshairPlusCursor() : getMoveCursor();
                            container.style.cursor = cursor;
                        }
                    },
                    onMouseMove: (e: any) => {
                        const container = e.target.getStage()?.container();
                        if (container) {
                            const cursor = e.evt.shiftKey ? getCrosshairPlusCursor() : getMoveCursor();
                            container.style.cursor = cursor;
                        }
                    },
                    onMouseLeave: (e: any) => {
                        const container = e.target.getStage()?.container();
                        if (container) {
                            container.style.cursor = 'default';
                        }
                    }
                };

                if (!isDragging) {
                    groupProps.x = pole.x;
                    groupProps.y = pole.y;
                }

                return (
                    <Group key={`pole-${index}`} {...groupProps}>
                        {/* Large invisible circle - captures all events */}
                        <Circle
                            x={0}
                            y={0}
                            radius={25}
                            fill="transparent"
                        />
                        {/* Small visible circle - visual representation only */}
                        <Circle
                            x={0}
                            y={0}
                            radius={5}
                            fill={isSelected ? theme.palette.error.main : theme.palette.primary.main}
                            listening={false}
                        />
                    </Group>
                );
            })}

            {/* Pole insertion preview circle */}
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

            {/* Closing line segment for closed walls (last to first pole) - interactive - rendered AFTER poles for proper z-order */}
            {isClosed && polesToUse.length > 1 && (() => {
                const closingIndex = polesToUse.length - 1;
                const firstPole = polesToUse[0];
                const lastPole = polesToUse[polesToUse.length - 1];
                if (!firstPole || !lastPole) return null;
                const isLineSelected = selectedLines.has(closingIndex);

                return (
                    <React.Fragment key="closing-segment">
                        {/* Visible closing line - shows selection state, dashed to indicate first/last */}
                        <Line
                            points={[lastPole.x, lastPole.y, firstPole.x, firstPole.y]}
                            stroke={isLineSelected ? theme.palette.error.main : theme.palette.primary.main}
                            strokeWidth={3}
                            dash={[8, 4]}
                            dashEnabled={true}
                            perfectDrawEnabled={false}
                            listening={false}
                        />

                        {/* Invisible hit area for closing line interaction */}
                        <Line
                            points={[lastPole.x, lastPole.y, firstPole.x, firstPole.y]}
                            stroke="transparent"
                            strokeWidth={LINE_HIT_AREA_WIDTH}
                            onClick={(e) => {
                                e.cancelBubble = true;
                                setSelectedLines(new Set([closingIndex]));
                                setSelectedPoles(new Set([closingIndex, 0]));
                            }}
                            onMouseEnter={(e) => {
                                const container = e.target.getStage()?.container();
                                if (container) {
                                    const cursor = e.evt.shiftKey
                                        ? getCrosshairPlusCursor()
                                        : (isLineSelected ? getMoveCursor() : getPointerCursor());
                                    container.style.cursor = cursor;
                                }
                            }}
                            onMouseMove={(e) => {
                                const container = e.target.getStage()?.container();
                                if (container) {
                                    const cursor = e.evt.shiftKey
                                        ? getCrosshairPlusCursor()
                                        : (isLineSelected ? getMoveCursor() : getPointerCursor());
                                    container.style.cursor = cursor;
                                }
                            }}
                            onMouseLeave={(e) => {
                                const container = e.target.getStage()?.container();
                                if (container) {
                                    container.style.cursor = 'default';
                                }
                            }}
                        />
                    </React.Fragment>
                );
            })()}
            </Group>
        </Group>
    );
};

WallTransformer.displayName = 'WallTransformer';
