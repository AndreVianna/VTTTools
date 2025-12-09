import { useTheme } from '@mui/material';
import type Konva from 'konva';
import React, { useCallback, useEffect, useRef, useState } from 'react';
import { Circle, Group, Line, Rect } from 'react-konva';
import type { useWallTransaction } from '@/hooks/useWallTransaction';
import type { EncounterWall, Pole } from '@/types/domain';
import {
  createDeletePoleAction,
  createInsertPoleAction,
  createMoveLineAction,
  createMovePoleAction,
  createMultiMovePoleAction,
} from '@/types/wallUndoActions';
import { getCrosshairPlusCursor, getGrabbingCursor, getMoveCursor, getPointerCursor } from '@/utils/customCursors';
import type { GridConfig } from '@/utils/gridCalculator';
import { SnapMode, createDragBoundFunc, getSnapModeFromEvent, screenToWorld, snap } from '@/utils/snapping';

type SelectionMode = 'pole' | 'line' | 'marquee';

const INTERACTION_RECT_SIZE = 20000;
const INTERACTION_RECT_OFFSET = -INTERACTION_RECT_SIZE / 2;
const LINE_HIT_AREA_WIDTH = 16;

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
  lineEnd: { x: number; y: number },
): { x: number; y: number } {
  if (
    !point ||
    typeof point.x !== 'number' ||
    typeof point.y !== 'number' ||
    !Number.isFinite(point.x) ||
    !Number.isFinite(point.y)
  ) {
    throw new Error('projectPointToLineSegment: Invalid point object');
  }
  if (
    !lineStart ||
    typeof lineStart.x !== 'number' ||
    typeof lineStart.y !== 'number' ||
    !Number.isFinite(lineStart.x) ||
    !Number.isFinite(lineStart.y)
  ) {
    throw new Error('projectPointToLineSegment: Invalid lineStart object');
  }
  if (
    !lineEnd ||
    typeof lineEnd.x !== 'number' ||
    typeof lineEnd.y !== 'number' ||
    !Number.isFinite(lineEnd.x) ||
    !Number.isFinite(lineEnd.y)
  ) {
    throw new Error('projectPointToLineSegment: Invalid lineEnd object');
  }

  const dx = lineEnd.x - lineStart.x;
  const dy = lineEnd.y - lineStart.y;

  const lengthSquared = dx * dx + dy * dy;
  if (lengthSquared < Number.EPSILON) {
    return { x: lineStart.x, y: lineStart.y };
  }

  const t = Math.max(0, Math.min(1, ((point.x - lineStart.x) * dx + (point.y - lineStart.y) * dy) / lengthSquared));

  return {
    x: lineStart.x + t * dx,
    y: lineStart.y + t * dy,
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
  onPolesPreview?: (poles: Pole[]) => void;
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
  onPoleInserted?: (insertedAtIndex: number) => void;
  onPoleDeleted?: (deletedIndices: number[]) => void;
  defaultHeight?: number;
}

export const WallTransformer: React.FC<WallTransformerProps> = ({
  poles,
  isClosed = false,
  onPolesChange,
  onPolesPreview,
  gridConfig,
  snapEnabled: _snapEnabled = true,
  snapMode: _externalSnapMode,
  onClearSelections,
  isAltPressed = false,
  encounterId: _encounterId,
  wallIndex: _wallIndex,
  wall: _wall,
  onWallBreak,
  enableBackgroundRect = true,
  wallTransaction,
  onPoleInserted,
  onPoleDeleted,
  defaultHeight = 0,
}) => {
  const theme = useTheme();
  const [draggingIndex, setDraggingIndex] = useState<number | null>(null);
  const [previewPoles, setPreviewPoles] = useState<Pole[]>(poles);
  const [selectedPoles, setSelectedPoles] = useState<Set<number>>(new Set());
  const [selectedLines, setSelectedLines] = useState<Set<number>>(new Set());
  const [_selectionMode, setSelectionMode] = useState<SelectionMode>('pole');
  const [marqueeStart, setMarqueeStart] = useState<{
    x: number;
    y: number;
  } | null>(null);
  const [marqueeEnd, setMarqueeEnd] = useState<{ x: number; y: number } | null>(null);
  const [draggingLine, setDraggingLine] = useState<number | null>(null);
  const dragStartPositionRef = useRef<{ x: number; y: number } | null>(null);
  const lineDragStartRef = useRef<{
    mouseX: number;
    mouseY: number;
    pole1: { x: number; y: number; h: number };
    pole2: { x: number; y: number; h: number };
  } | null>(null);
  const circleRefs = useRef<Map<number, Konva.Group>>(new Map());
  const currentSnapModeRef = useRef<SnapMode>(SnapMode.Free);
  const [hoveredLineIndex, setHoveredLineIndex] = useState<number | null>(null);
  const [insertPreviewPos, setInsertPreviewPos] = useState<{
    x: number;
    y: number;
  } | null>(null);
  const [isShiftPressed, setIsShiftPressed] = useState<boolean>(false);

  const isPointInRect = (
    point: { x: number; y: number },
    rect: { x: number; y: number; width: number; height: number },
  ): boolean => {
    return point.x >= rect.x && point.x <= rect.x + rect.width && point.y >= rect.y && point.y <= rect.y + rect.height;
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
        const reorderedPoles: Pole[] = [...poles.slice(breakPoleIndex), ...poles.slice(0, breakPoleIndex + 1)];
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
            originalWallPoles,
          });
          setSelectedPoles(new Set());
          setSelectedLines(new Set());
        }
      }
    }
  }, [selectedPoles, selectedLines, poles, isClosed, onPolesChange, onWallBreak]);

  useEffect(() => {
    // Don't reset preview poles during drag - the drag handlers manage previewPoles
    if (draggingIndex === null && draggingLine === null) {
      setPreviewPoles(poles);
    }
  }, [poles, draggingIndex, draggingLine]);

  useEffect(() => {
    const currentIndices = new Set(poles.map((_, index) => index));
    const refsToDelete: number[] = [];

    circleRefs.current.forEach((_, index) => {
      if (!currentIndices.has(index)) {
        refsToDelete.push(index);
      }
    });

    for (const index of refsToDelete) {
      circleRefs.current.delete(index);
    }
  }, [poles]);

  // Track keyboard state for snap mode
  // New behavior: No key = Free, Ctrl = Half, Alt = Quarter
  useEffect(() => {
    const updateSnapMode = (e: KeyboardEvent | MouseEvent) => {
      if ('altKey' in e) {
        if (e.ctrlKey) {
          currentSnapModeRef.current = SnapMode.Half;
        } else if (e.altKey) {
          currentSnapModeRef.current = SnapMode.Quarter;
        } else {
          currentSnapModeRef.current = SnapMode.Free;
        }
      }
    };

    window.addEventListener('keydown', updateSnapMode);
    window.addEventListener('keyup', updateSnapMode);
    return () => {
      window.removeEventListener('keydown', updateSnapMode);
      window.removeEventListener('keyup', updateSnapMode);
    };
  }, []);

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
                    setPreviewPoles((p) => {
                      currentPoles = p;
                      return p;
                    });
                    return currentPoles;
                  },
                  (segments) => {
                    wallTransaction.setAllSegments([{
                      tempId: -1,
                      wallIndex: null,
                      name: _wall?.name || '',
                      segments,
                    }]);
                  },
                  defaultHeight,
                );
                wallTransaction.pushLocalAction(action);
              }

              onPoleDeleted?.(indicesToDelete);
              onPolesChange?.(newPoles, isClosed);
              setSelectedPoles(new Set());
              setSelectedLines(new Set());
            }
          } else if (selectedLines.size > 0) {
            const indicesToDelete = new Set<number>();
            selectedLines.forEach((lineIndex) => {
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
                    setPreviewPoles((p) => {
                      currentPoles = p;
                      return p;
                    });
                    return currentPoles;
                  },
                  (segments) => {
                    wallTransaction.setAllSegments([{
                      tempId: -1,
                      wallIndex: null,
                      name: _wall?.name || '',
                      segments,
                    }]);
                  },
                  defaultHeight,
                );
                wallTransaction.pushLocalAction(action);
              }

              onPoleDeleted?.(indicesToDeleteArray);
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
  }, [selectedPoles, selectedLines, poles, onPolesChange, isAltPressed, isClosed, handleBreakWall, wallTransaction, _wall?.name, defaultHeight, onPoleDeleted]);

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

  const handleDragMove = (index: number, e: Konva.KonvaEventObject<DragEvent>) => {
    if (!dragStartPositionRef.current || !e || !e.target) {
      return;
    }

    // Position is already snapped by dragBoundFunc
    const currentX = e.target.x();
    const currentY = e.target.y();

    const oldX = dragStartPositionRef.current.x;
    const oldY = dragStartPositionRef.current.y;
    const deltaX = currentX - oldX;
    const deltaY = currentY - oldY;

    const newPoles = [...poles];

    if (selectedPoles.size > 1 && selectedPoles.has(index)) {
      selectedPoles.forEach((poleIndex) => {
        const pole = poles[poleIndex];
        if (!pole) return;
        newPoles[poleIndex] = {
          x: pole.x + deltaX,
          y: pole.y + deltaY,
          h: pole.h,
        };
      });
    } else {
      const pole = poles[index];
      if (pole) {
        newPoles[index] = { x: currentX, y: currentY, h: pole.h };
      }
    }

    setPreviewPoles(newPoles);
    onPolesPreview?.(newPoles);
  };

  const handleDragEnd = (index: number, e: Konva.KonvaEventObject<DragEvent>) => {
    if (!dragStartPositionRef.current || !e || !e.target) {
      setDraggingIndex(null);
      dragStartPositionRef.current = null;
      return;
    }

    // Position is already snapped by dragBoundFunc
    const finalX = e.target.x();
    const finalY = e.target.y();

    const oldX = dragStartPositionRef.current.x;
    const oldY = dragStartPositionRef.current.y;
    const deltaX = finalX - oldX;
    const deltaY = finalY - oldY;

    const newPoles = [...poles];

    if (selectedPoles.size > 1 && selectedPoles.has(index)) {
      const moves = Array.from(selectedPoles).map((poleIndex) => {
        const pole = poles[poleIndex];
        if (!pole) throw new Error(`Pole at index ${poleIndex} not found`);
        return {
          poleIndex,
          oldPosition: { x: pole.x, y: pole.y },
          newPosition: { x: pole.x + deltaX, y: pole.y + deltaY },
        };
      });

      selectedPoles.forEach((poleIndex) => {
        const pole = poles[poleIndex];
        if (!pole) return;
        newPoles[poleIndex] = {
          x: pole.x + deltaX,
          y: pole.y + deltaY,
          h: pole.h,
        };
      });

      if (wallTransaction && (deltaX !== 0 || deltaY !== 0)) {
        const action = createMultiMovePoleAction(
          moves,
          (updatedPoles) => onPolesChange?.(updatedPoles, isClosed),
          () => {
            let currentPoles: Pole[] = [];
            setPreviewPoles((p) => {
              currentPoles = p;
              return p;
            });
            return currentPoles;
          },
          (segments) => {
            wallTransaction.setAllSegments([{
              tempId: -1,
              wallIndex: null,
              name: _wall?.name || '',
              segments,
            }]);
          },
          defaultHeight,
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
            setPreviewPoles((p) => {
              currentPoles = p;
              return p;
            });
            return currentPoles;
          },
          (segments) => {
            wallTransaction.setAllSegments([{
              tempId: -1,
              wallIndex: null,
              name: _wall?.name || '',
              segments,
            }]);
          },
          defaultHeight,
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

  const handleLineClick = (lineIndex: number, e: Konva.KonvaEventObject<MouseEvent>) => {
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
          fill='transparent'
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
              const isSimpleClick = marqueeRect.width < 5 && marqueeRect.height < 5;

              if (isSimpleClick && onClearSelections) {
                onClearSelections();
              } else {
                const newSelected = new Set<number>();
                polesToUse.forEach((pole, index) => {
                  if (isPointInRect(pole, marqueeRect)) {
                    newSelected.add(index);
                  }
                });
                setSelectedPoles(newSelected);
                setSelectedLines(new Set());
              }
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
            const worldPos = screenToWorld(pointerPos, stage);

            const currentSnapMode = e.evt
              ? getSnapModeFromEvent(e.evt)
              : SnapMode.Free;

            // Snap the current mouse position (keyboard modifier determines snap mode)
            const snappedWorldPos = gridConfig
              ? snap(worldPos, gridConfig, currentSnapMode)
              : worldPos;

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
              newPoles[draggingLine] = {
                x: newPole1X,
                y: newPole1Y,
                h: pole1.h,
              };
              newPoles[draggingLine + 1] = {
                x: newPole2X,
                y: newPole2Y,
                h: pole2.h,
              };
              setPreviewPoles(newPoles);
              onPolesPreview?.(newPoles);
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
                const worldPos = screenToWorld(pointerPos, stage);

                const deltaX = worldPos.x - lineDragStartRef.current.mouseX;
                const deltaY = worldPos.y - lineDragStartRef.current.mouseY;

                const currentSnapMode = e.evt
                  ? getSnapModeFromEvent(e.evt)
                  : SnapMode.Free;

                // Apply snapping to first pole and calculate actual delta (keyboard modifier determines snap mode)
                const snapped1 = gridConfig
                  ? snap({ x: lineDragStartRef.current.pole1.x + deltaX, y: lineDragStartRef.current.pole1.y + deltaY }, gridConfig, currentSnapMode)
                  : { x: lineDragStartRef.current.pole1.x + deltaX, y: lineDragStartRef.current.pole1.y + deltaY };
                const actualDeltaX = snapped1.x - lineDragStartRef.current.pole1.x;
                const actualDeltaY = snapped1.y - lineDragStartRef.current.pole1.y;

                const newPole1X = snapped1.x;
                const newPole1Y = snapped1.y;
                const newPole2X = lineDragStartRef.current.pole2.x + actualDeltaX;
                const newPole2Y = lineDragStartRef.current.pole2.y + actualDeltaY;

                const newPoles = [...poles];
                const pole1 = poles[draggingLine];
                const pole2 = poles[draggingLine + 1];
                if (pole1 && pole2) {
                  newPoles[draggingLine] = {
                    x: newPole1X,
                    y: newPole1Y,
                    h: pole1.h,
                  };
                  newPoles[draggingLine + 1] = {
                    x: newPole2X,
                    y: newPole2Y,
                    h: pole2.h,
                  };
                }

                if (wallTransaction && (deltaX !== 0 || deltaY !== 0)) {
                  const action = createMoveLineAction(
                    draggingLine,
                    draggingLine + 1,
                    {
                      x: lineDragStartRef.current.pole1.x,
                      y: lineDragStartRef.current.pole1.y,
                      h: lineDragStartRef.current.pole1.h,
                    },
                    {
                      x: lineDragStartRef.current.pole2.x,
                      y: lineDragStartRef.current.pole2.y,
                      h: lineDragStartRef.current.pole2.h,
                    },
                    {
                      x: newPole1X,
                      y: newPole1Y,
                      h: lineDragStartRef.current.pole1.h,
                    },
                    {
                      x: newPole2X,
                      y: newPole2Y,
                      h: lineDragStartRef.current.pole2.h,
                    },
                    (updatedPoles) => onPolesChange?.(updatedPoles, isClosed),
                    () => {
                      let currentPoles: Pole[] = [];
                      setPreviewPoles((p) => {
                        currentPoles = p;
                        return p;
                      });
                      return currentPoles;
                    },
                    (segments) => {
                      wallTransaction.setAllSegments([{
                        tempId: -1,
                        wallIndex: null,
                        name: _wall?.name || '',
                        segments,
                      }]);
                    },
                    defaultHeight,
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
            <React.Fragment key={`line-${pole.x}-${pole.y}-${nextPole.x}-${nextPole.y}`}>
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
                stroke='transparent'
                strokeWidth={LINE_HIT_AREA_WIDTH}
                onMouseDown={(e) => {
                  if (isLineSelected) {
                    e.cancelBubble = true;
                    const stage = e.target.getStage();
                    if (stage) {
                      const pointerPos = stage.getPointerPosition();
                      if (pointerPos) {
                        let worldPos = screenToWorld(pointerPos, stage);

                        const currentSnapMode = e.evt
                          ? getSnapModeFromEvent(e.evt)
                          : SnapMode.Free;

                        // Snap the starting mouse position (keyboard modifier determines snap mode)
                        if (gridConfig) {
                          worldPos = snap(worldPos, gridConfig, currentSnapMode);
                        }

                        setDraggingLine(index);
                        lineDragStartRef.current = {
                          mouseX: worldPos.x,
                          mouseY: worldPos.y,
                          pole1: { x: pole.x, y: pole.y, h: pole.h },
                          pole2: {
                            x: nextPole.x,
                            y: nextPole.y,
                            h: nextPole.h,
                          },
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

                    const worldPos = screenToWorld(pointerPos, stage);

                    const projected = nextPole ? projectPointToLineSegment(worldPos, pole, nextPole) : worldPos;

                    const snapMode = getSnapModeFromEvent(e.evt);
                    const insertPos = gridConfig
                      ? snap(projected, gridConfig, snapMode)
                      : projected;

                    const insertedPole = {
                      x: insertPos.x,
                      y: insertPos.y,
                      h: pole.h,
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
                          setPreviewPoles((p) => {
                            currentPoles = p;
                            return p;
                          });
                          return currentPoles;
                        },
                        (segments) => {
                          wallTransaction.setAllSegments([{
                            tempId: -1,
                            wallIndex: null,
                            name: _wall?.name || '',
                            segments,
                          }]);
                        },
                        defaultHeight,
                      );
                      wallTransaction.pushLocalAction(action);
                    }

                    onPoleInserted?.(index + 1);
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
                      : isLineSelected
                        ? getMoveCursor()
                        : getPointerCursor();
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
                      : isLineSelected
                        ? getMoveCursor()
                        : getPointerCursor();
                    container.style.cursor = cursor;
                  }

                  // Update preview position if Shift is pressed
                  if (e.evt.shiftKey && !draggingIndex && !draggingLine && !marqueeStart) {
                    const stage = e.target.getStage();
                    if (!stage) return;

                    const pointerPos = stage.getPointerPosition();
                    if (!pointerPos) return;

                    const worldPos = screenToWorld(pointerPos, stage);

                    // Project onto line segment
                    const projected = nextPole ? projectPointToLineSegment(worldPos, pole, nextPole) : worldPos;

                    // Apply snap (keyboard modifier determines snap mode)
                    const currentSnapMode = getSnapModeFromEvent(e.evt);
                    const finalPos = gridConfig
                      ? snap(projected, gridConfig, currentSnapMode)
                      : projected;

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

        {/* eslint-disable-next-line react-hooks/refs */}
        {polesToUse.map((pole, index) => {
          const isSelected = selectedPoles.has(index);

          const groupProps: Record<string, unknown> = {
            draggable: true,
            listening: !isShiftPressed,
            ref: (node: Konva.Group | null) => {
              if (node) {
                circleRefs.current.set(index, node);
              } else {
                circleRefs.current.delete(index);
              }
            },
            dragBoundFunc: createDragBoundFunc(
              gridConfig!,
              () => currentSnapModeRef.current,
              () => gridConfig !== undefined,
            ),
            onDragStart: (e: Konva.KonvaEventObject<DragEvent>) => {
              handleDragStart(index);
              const container = e.target.getStage()?.container();
              if (container) {
                container.style.cursor = getGrabbingCursor();
              }
            },
            onDragMove: (e: Konva.KonvaEventObject<DragEvent>) => handleDragMove(index, e),
            onDragEnd: (e: Konva.KonvaEventObject<DragEvent>) => {
              handleDragEnd(index, e);
              const container = e.target.getStage()?.container();
              if (container) {
                container.style.cursor = getMoveCursor();
              }
            },
            onClick: (e: Konva.KonvaEventObject<MouseEvent>) => {
              e.cancelBubble = true;

              if (e.evt.shiftKey) {
                const newPoles = [...poles];
                const insertIndex = index + 1;
                newPoles.splice(insertIndex, 0, {
                  x: pole.x,
                  y: pole.y,
                  h: pole.h,
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
            },
          };

          // Only set position when not dragging this pole - Konva manages position during drag
          if (draggingIndex !== index) {
            groupProps.x = pole.x;
            groupProps.y = pole.y;
          }

          return (
            <Group key={`pole-group-${index}`} {...groupProps}>
              {/* Large invisible circle - captures all events */}
              <Circle x={0} y={0} radius={8} fill='transparent' />
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
            fill='transparent'
            stroke={theme.palette.warning.main}
            strokeWidth={2}
            dash={[4, 4]}
            listening={false}
            opacity={0.8}
          />
        )}

        {/* Closing line segment for closed walls (last to first pole) - interactive - rendered AFTER poles for proper z-order */}
        {isClosed &&
          polesToUse.length > 1 &&
          (() => {
            const closingIndex = polesToUse.length - 1;
            const firstPole = polesToUse[0];
            const lastPole = polesToUse[polesToUse.length - 1];
            if (!firstPole || !lastPole) return null;
            const isLineSelected = selectedLines.has(closingIndex);

            return (
              <React.Fragment key='closing-segment'>
                <Line
                  points={[lastPole.x, lastPole.y, firstPole.x, firstPole.y]}
                  stroke={isLineSelected ? theme.palette.error.main : theme.palette.primary.main}
                  strokeWidth={3}
                  perfectDrawEnabled={false}
                  listening={false}
                />

                {/* Invisible hit area for closing line interaction */}
                <Line
                  points={[lastPole.x, lastPole.y, firstPole.x, firstPole.y]}
                  stroke='transparent'
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
                        : isLineSelected
                          ? getMoveCursor()
                          : getPointerCursor();
                      container.style.cursor = cursor;
                    }
                  }}
                  onMouseMove={(e) => {
                    const container = e.target.getStage()?.container();
                    if (container) {
                      const cursor = e.evt.shiftKey
                        ? getCrosshairPlusCursor()
                        : isLineSelected
                          ? getMoveCursor()
                          : getPointerCursor();
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
