import React, { useState, useEffect } from 'react';
import { Group, Circle, Line, Rect } from 'react-konva';
import { useTheme } from '@mui/material';
import type { Pole } from '@/types/domain';
import type { GridConfig } from '@/utils/gridCalculator';
import { snapToGrid } from '@/utils/gridCalculator';

type SelectionMode = 'pole' | 'line' | 'marquee';

export interface WallTransformerProps {
    poles: Pole[];
    onPolesChange?: (poles: Pole[]) => void;
    gridConfig?: GridConfig;
    snapEnabled?: boolean;
    onClearSelections?: () => void;
}

export const WallTransformer: React.FC<WallTransformerProps> = ({
    poles,
    onPolesChange,
    gridConfig,
    snapEnabled = true,
    onClearSelections
}) => {
    const theme = useTheme();
    const [draggingIndex, setDraggingIndex] = useState<number | null>(null);
    const [previewPoles, setPreviewPoles] = useState<Pole[]>(poles);
    const [selectedPoles, setSelectedPoles] = useState<Set<number>>(new Set());
    const [selectedLines, setSelectedLines] = useState<Set<number>>(new Set());
    const [selectionMode, setSelectionMode] = useState<SelectionMode>('pole');
    const [insertionPreview, setInsertionPreview] = useState<{ x: number; y: number; lineIndex: number } | null>(null);
    const [marqueeStart, setMarqueeStart] = useState<{ x: number; y: number } | null>(null);
    const [marqueeEnd, setMarqueeEnd] = useState<{ x: number; y: number } | null>(null);

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
                    setInsertionPreview(null);
                    onClearSelections?.();
                }
            }
        };

        window.addEventListener('keydown', handleKeyDown, { capture: true });
        return () => window.removeEventListener('keydown', handleKeyDown, { capture: true });
    }, [selectedPoles, selectedLines, poles, onPolesChange, onClearSelections]);

    const handleDragStart = (index: number) => {
        setDraggingIndex(index);
    };

    const handleDragMove = (index: number, e: any) => {
        const newPoles = [...previewPoles];
        let newX = e.target.x();
        let newY = e.target.y();

        const oldX = previewPoles[index].x;
        const oldY = previewPoles[index].y;
        const deltaX = newX - oldX;
        const deltaY = newY - oldY;

        if (snapEnabled && gridConfig) {
            const snapped = snapToGrid({ x: newX, y: newY }, gridConfig);
            newX = snapped.x;
            newY = snapped.y;
        }

        if (selectedPoles.size > 1 && selectedPoles.has(index)) {
            selectedPoles.forEach(poleIndex => {
                newPoles[poleIndex] = {
                    ...newPoles[poleIndex],
                    x: newPoles[poleIndex].x + deltaX,
                    y: newPoles[poleIndex].y + deltaY
                };
            });
        } else {
            newPoles[index] = { ...newPoles[index], x: newX, y: newY };
        }

        setPreviewPoles(newPoles);

        e.target.x(newX);
        e.target.y(newY);
    };

    const handleDragEnd = (index: number, e: any) => {
        setDraggingIndex(null);
        let newX = e.target.x();
        let newY = e.target.y();

        if (snapEnabled && gridConfig) {
            const snapped = snapToGrid({ x: newX, y: newY }, gridConfig);
            newX = snapped.x;
            newY = snapped.y;
        }

        const newPoles = [...poles];
        const oldX = poles[index].x;
        const oldY = poles[index].y;
        const deltaX = newX - oldX;
        const deltaY = newY - oldY;

        if (selectedPoles.size > 1 && selectedPoles.has(index)) {
            selectedPoles.forEach(poleIndex => {
                newPoles[poleIndex] = {
                    ...newPoles[poleIndex],
                    x: newPoles[poleIndex].x + deltaX,
                    y: newPoles[poleIndex].y + deltaY
                };
            });
        } else {
            newPoles[index] = { ...newPoles[index], x: newX, y: newY };
        }

        if (newPoles.length >= 2) {
            onPolesChange?.(newPoles);
        }
        setPreviewPoles(newPoles);
    };

    const polesToUse = draggingIndex !== null ? previewPoles : poles;

    const handleLineClick = (lineIndex: number, e: any) => {
        e.cancelBubble = true;
        setSelectedLines(new Set([lineIndex]));
        const pole1 = lineIndex;
        const pole2 = lineIndex + 1;
        setSelectedPoles(new Set([pole1, pole2]));
    };

    const marqueeRect = getMarqueeRect();

    return (
        <Group
            onMouseDown={(e) => {
                const stage = e.target.getStage();
                if (stage) {
                    const pointerPos = stage.getPointerPosition();
                    if (pointerPos && e.target === e.target.getLayer()) {
                        setMarqueeStart(pointerPos);
                        setMarqueeEnd(pointerPos);
                        setSelectionMode('marquee');
                    }
                }
            }}
            onMouseMove={(e) => {
                const stage = e.target.getStage();
                if (stage && marqueeStart) {
                    const pointerPos = stage.getPointerPosition();
                    if (pointerPos) {
                        setMarqueeEnd(pointerPos);
                    }
                }
            }}
            onMouseUp={(e) => {
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
                    <Line
                        key={`line-${index}`}
                        points={[pole.x, pole.y, nextPole.x, nextPole.y]}
                        stroke="transparent"
                        strokeWidth={10}
                        onClick={(e) => {
                            if (isLineSelected && insertionPreview && insertionPreview.lineIndex === index) {
                                e.cancelBubble = true;
                                const newPoles = [...poles];
                                const insertIndex = index + 1;
                                let insertX = insertionPreview.x;
                                let insertY = insertionPreview.y;

                                if (snapEnabled && gridConfig) {
                                    const snapped = snapToGrid({ x: insertX, y: insertY }, gridConfig);
                                    insertX = snapped.x;
                                    insertY = snapped.y;
                                }

                                const newPole: Pole = { x: insertX, y: insertY, h: pole.h };
                                newPoles.splice(insertIndex, 0, newPole);
                                onPolesChange?.(newPoles);
                                setInsertionPreview(null);
                                setSelectedLines(new Set());
                                setSelectedPoles(new Set());
                            } else {
                                handleLineClick(index, e);
                            }
                        }}
                        onMouseMove={(e) => {
                            if (isLineSelected) {
                                const stage = e.target.getStage();
                                if (stage) {
                                    const pointerPos = stage.getPointerPosition();
                                    if (pointerPos) {
                                        const projected = projectPointToLine(pointerPos, pole, nextPole);
                                        setInsertionPreview({ x: projected.x, y: projected.y, lineIndex: index });
                                    }
                                }
                            }
                        }}
                        onMouseEnter={(e) => {
                            const container = e.target.getStage()?.container();
                            if (container) {
                                container.style.cursor = isLineSelected ? 'crosshair' : 'move';
                            }
                        }}
                        onMouseLeave={(e) => {
                            const container = e.target.getStage()?.container();
                            if (container) {
                                container.style.cursor = 'crosshair';
                            }
                            if (isLineSelected) {
                                setInsertionPreview(null);
                            }
                        }}
                    />
                );
            })}

            {insertionPreview && selectedLines.has(insertionPreview.lineIndex) && (
                <Circle
                    x={insertionPreview.x}
                    y={insertionPreview.y}
                    radius={5}
                    fill={theme.palette.success.main}
                    opacity={0.7}
                    listening={false}
                />
            )}

            {polesToUse.map((pole, index) => {
                const isSelected = selectedPoles.has(index);
                return (
                    <Circle
                        key={index}
                        x={pole.x}
                        y={pole.y}
                        radius={5}
                        fill={isSelected ? theme.palette.error.main : theme.palette.primary.main}
                        draggable
                        onDragStart={() => handleDragStart(index)}
                        onDragMove={(e) => handleDragMove(index, e)}
                        onDragEnd={(e) => handleDragEnd(index, e)}
                        onClick={(e) => {
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
                        }}
                        onMouseEnter={(e) => {
                            const container = e.target.getStage()?.container();
                            if (container) {
                                container.style.cursor = 'move';
                            }
                        }}
                        onMouseLeave={(e) => {
                            const container = e.target.getStage()?.container();
                            if (container) {
                                container.style.cursor = 'crosshair';
                            }
                        }}
                    />
                );
            })}
        </Group>
    );
};

WallTransformer.displayName = 'WallTransformer';
