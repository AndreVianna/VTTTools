import React, { useState, useEffect, useRef } from 'react';
import { Group, Circle, Line, Rect } from 'react-konva';
import { useTheme } from '@mui/material';
import type { Pole } from '@/types/domain';
import type { GridConfig } from '@/utils/gridCalculator';
import { snapToNearest, SnapMode } from '@/utils/structureSnapping';

type SelectionMode = 'pole' | 'line' | 'marquee';

export interface WallTransformerProps {
    poles: Pole[];
    onPolesChange?: (poles: Pole[]) => void;
    gridConfig?: GridConfig;
    snapEnabled?: boolean;
    snapMode?: SnapMode;
    onClearSelections?: () => void;
}

export const WallTransformer: React.FC<WallTransformerProps> = ({
    poles,
    onPolesChange,
    gridConfig,
    snapEnabled = true,
    snapMode: externalSnapMode,
    onClearSelections
}) => {
    const theme = useTheme();
    const [draggingIndex, setDraggingIndex] = useState<number | null>(null);
    const [previewPoles, setPreviewPoles] = useState<Pole[]>(poles);
    const [selectedPoles, setSelectedPoles] = useState<Set<number>>(new Set());
    const [selectedLines, setSelectedLines] = useState<Set<number>>(new Set());
    const [selectionMode, setSelectionMode] = useState<SelectionMode>('pole');
    const [marqueeStart, setMarqueeStart] = useState<{ x: number; y: number } | null>(null);
    const [marqueeEnd, setMarqueeEnd] = useState<{ x: number; y: number } | null>(null);
    const [draggingLine, setDraggingLine] = useState<number | null>(null);
    const dragStartPositionRef = useRef<{ x: number; y: number } | null>(null);
    const lineDragStartRef = useRef<{ mouseX: number; mouseY: number; pole1: { x: number; y: number }; pole2: { x: number; y: number } } | null>(null);
    const circleRefs = useRef<Map<number, any>>(new Map());

    const projectPointToLine = (point: { x: number; y: number }, p1: Pole, p2: Pole): { x: number; y: number; t: number } => {
        const dx = p2.x - p1.x;
        const dy = p2.y - p1.y;
        const t = ((point.x - p1.x) * dx + (point.y - p1.y) * dy) / (dx * dx + dy * dy);
        const clampedT = Math.max(0.01, Math.min(0.99, t));
        return {
            x: p1.x + clampedT * dx,
            y: p1.y + clampedT * dy,
            t: clampedT
        };
    };

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

    useEffect(() => {
        setPreviewPoles(poles);
    }, [poles]);

    useEffect(() => {
        const handleKeyDown = (e: KeyboardEvent) => {
            if (e.target instanceof HTMLInputElement || e.target instanceof HTMLTextAreaElement) {
                return;
            }

            if (e.key === 'Delete') {
                e.preventDefault();
                if (selectedPoles.size > 0) {
                    const newPoles = poles.filter((_, index) => !selectedPoles.has(index));
                    if (newPoles.length >= 2) {
                        onPolesChange?.(newPoles);
                        setSelectedPoles(new Set());
                        setSelectedLines(new Set());
                    }
                }
            }

            if (e.key === 'Escape') {
                if (selectedPoles.size > 0 || selectedLines.size > 0) {
                    e.preventDefault();
                    e.stopPropagation();
                    setSelectedPoles(new Set());
                    setSelectedLines(new Set());
                } else {
                    e.preventDefault();
                    e.stopPropagation();
                    onClearSelections?.();
                }
            }
        };

        window.addEventListener('keydown', handleKeyDown, { capture: true });
        return () => {
            window.removeEventListener('keydown', handleKeyDown, { capture: true });
        };
    }, [selectedPoles, selectedLines, poles, onPolesChange, onClearSelections]);

    const handleDragStart = (index: number) => {
        const circleNode = circleRefs.current.get(index);
        if (circleNode) {
            circleNode.position({ x: poles[index].x, y: poles[index].y });
        }
        setDraggingIndex(index);
        dragStartPositionRef.current = { x: poles[index].x, y: poles[index].y };
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

        // Determine snap mode from modifier keys in the event
        let currentSnapMode = externalSnapMode ?? SnapMode.HalfSnap;
        if (!externalSnapMode && e.evt) {
            if (e.evt.altKey && e.evt.ctrlKey) {
                currentSnapMode = SnapMode.QuarterSnap;
            } else if (e.evt.altKey) {
                currentSnapMode = SnapMode.Free;
            } else {
                currentSnapMode = SnapMode.HalfSnap;
            }
        }

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
                newPoles[poleIndex] = {
                    ...newPoles[poleIndex],
                    x: poles[poleIndex].x + deltaX,
                    y: poles[poleIndex].y + deltaY
                };
            });
        } else {
            newPoles[index] = { ...newPoles[index], x: currentX, y: currentY };
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

        // Determine snap mode from modifier keys in the event
        let currentSnapMode = externalSnapMode ?? SnapMode.HalfSnap;
        if (!externalSnapMode && e.evt) {
            if (e.evt.altKey && e.evt.ctrlKey) {
                currentSnapMode = SnapMode.QuarterSnap;
            } else if (e.evt.altKey) {
                currentSnapMode = SnapMode.Free;
            } else {
                currentSnapMode = SnapMode.HalfSnap;
            }
        }

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
            selectedPoles.forEach(poleIndex => {
                newPoles[poleIndex] = {
                    ...newPoles[poleIndex],
                    x: poles[poleIndex].x + deltaX,
                    y: poles[poleIndex].y + deltaY
                };
            });
        } else {
            newPoles[index] = { ...newPoles[index], x: finalX, y: finalY };
        }

        setDraggingIndex(null);
        dragStartPositionRef.current = null;

        if (newPoles.length >= 2 && (deltaX !== 0 || deltaY !== 0)) {
            onPolesChange?.(newPoles);
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
            <Rect
                x={-10000}
                y={-10000}
                width={20000}
                height={20000}
                fill="transparent"
                listening={true}
                onMouseDown={(e) => {
                    console.log('[Background MouseDown] Starting marquee');
                    const stage = e.target.getStage();
                    if (stage) {
                        const pointerPos = stage.getPointerPosition();
                        if (pointerPos) {
                            console.log('[Background MouseDown] Marquee at:', pointerPos);
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

                    console.log('[Background MouseMove] marqueeStart:', marqueeStart, 'pointerPos:', pointerPos);

                    // Handle marquee selection
                    if (marqueeStart) {
                        setMarqueeEnd(pointerPos);
                    }
                }}
                onMouseUp={(e) => {
                    console.log('[Background MouseUp] marqueeStart:', marqueeStart, 'marqueeEnd:', marqueeEnd);
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
            />

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

                    // Determine snap mode from modifier keys
                    let currentSnapMode = externalSnapMode ?? SnapMode.HalfSnap;
                    if (!externalSnapMode && e.evt) {
                        if (e.evt.altKey && e.evt.ctrlKey) {
                            currentSnapMode = SnapMode.QuarterSnap;
                        } else if (e.evt.altKey) {
                            currentSnapMode = SnapMode.Free;
                        } else {
                            currentSnapMode = SnapMode.HalfSnap;
                        }
                    }

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
                    newPoles[draggingLine] = { ...newPoles[draggingLine], x: newPole1X, y: newPole1Y };
                    newPoles[draggingLine + 1] = { ...newPoles[draggingLine + 1], x: newPole2X, y: newPole2Y };
                    setPreviewPoles(newPoles);
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

                            // Determine snap mode from modifier keys
                            let currentSnapMode = externalSnapMode ?? SnapMode.HalfSnap;
                            if (!externalSnapMode && e.evt) {
                                if (e.evt.altKey && e.evt.ctrlKey) {
                                    currentSnapMode = SnapMode.QuarterSnap;
                                } else if (e.evt.altKey) {
                                    currentSnapMode = SnapMode.Free;
                                } else {
                                    currentSnapMode = SnapMode.HalfSnap;
                                }
                            }

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
                            newPoles[draggingLine] = { ...newPoles[draggingLine], x: newPole1X, y: newPole1Y };
                            newPoles[draggingLine + 1] = { ...newPoles[draggingLine + 1], x: newPole2X, y: newPole2Y };

                            if (deltaX !== 0 || deltaY !== 0) {
                                onPolesChange?.(newPoles);
                            }
                            setPreviewPoles(newPoles);
                        }
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
            <Line
                points={polesToUse.flatMap(p => [p.x, p.y])}
                stroke={theme.palette.primary.main}
                strokeWidth={3}
                listening={false}
            />

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
                            strokeWidth={100}
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

                                        // Determine snap mode from modifier keys
                                        let currentSnapMode = externalSnapMode ?? SnapMode.HalfSnap;
                                        if (!externalSnapMode && e.evt) {
                                            if (e.evt.altKey && e.evt.ctrlKey) {
                                                currentSnapMode = SnapMode.QuarterSnap;
                                            } else if (e.evt.altKey) {
                                                currentSnapMode = SnapMode.Free;
                                            } else {
                                                currentSnapMode = SnapMode.HalfSnap;
                                            }
                                        }

                                        // Snap the starting mouse position
                                        if (snapEnabled && gridConfig) {
                                            worldPos = snapToNearest(worldPos, gridConfig, currentSnapMode, 50);
                                        }

                                        setDraggingLine(index);
                                        lineDragStartRef.current = {
                                            mouseX: worldPos.x,
                                            mouseY: worldPos.y,
                                            pole1: { x: pole.x, y: pole.y },
                                            pole2: { x: nextPole.x, y: nextPole.y }
                                        };
                                    }
                                }
                            }
                        }}
                        onClick={(e) => {
                            handleLineClick(index, e);
                        }}
                        onMouseEnter={(e) => {
                            const container = e.target.getStage()?.container();
                            if (container) {
                                container.style.cursor = isLineSelected ? 'move' : 'pointer';
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
            })}

            {polesToUse.map((pole, index) => {
                const isSelected = selectedPoles.has(index);
                const isDragging = draggingIndex === index;

                const circleProps: any = {
                    radius: 5,
                    fill: isSelected ? theme.palette.error.main : theme.palette.primary.main,
                    draggable: true,
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
                    onDragStart: () => handleDragStart(index),
                    onDragMove: (e: any) => handleDragMove(index, e),
                    onDragEnd: (e: any) => handleDragEnd(index, e),
                    onClick: (e: any) => {
                        e.cancelBubble = true;
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
                            container.style.cursor = 'move';
                        }
                    },
                    onMouseLeave: (e: any) => {
                        const container = e.target.getStage()?.container();
                        if (container) {
                            container.style.cursor = 'crosshair';
                        }
                    }
                };

                if (!isDragging) {
                    circleProps.x = pole.x;
                    circleProps.y = pole.y;
                }

                return <Circle key={`pole-${index}`} {...circleProps} />;
            })}
            </Group>
        </Group>
    );
};

WallTransformer.displayName = 'WallTransformer';
