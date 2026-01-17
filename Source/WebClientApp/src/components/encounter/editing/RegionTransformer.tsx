import { useTheme } from '@mui/material';
import type Konva from 'konva';
import React, { memo, useCallback, useEffect, useMemo, useRef, useState } from 'react';
import { Circle, Group, Line, Rect } from 'react-konva';
import type { RegionSegment } from '@/hooks/useRegionTransaction';
import type { PlacedRegion, Point } from '@/types/domain';
import {
  createDeleteVertexAction,
  createInsertVertexAction,
  createMoveLineAction,
  createMoveVertexAction,
  createMultiMoveVertexAction,
  type LocalAction,
} from '@/types/regionUndoActions';
import { getCrosshairPlusCursor, getGrabbingCursor, getMoveCursor, getPointerCursor } from '@/utils/customCursors';
import { getMarqueeRect, isPointInPolygon, isPointInRect, projectPointToLineSegment } from '@/utils/geometry';
import type { GridConfig } from '@/utils/gridCalculator';
import { getRegionColor, getRegionFillOpacity, isTransparentRegion } from '@/utils/regionColorUtils';
import { SnapMode, createDragBoundFunc, getSnapModeFromEvent, screenToWorld, snap } from '@/utils/snapping';

const INTERACTION_RECT_SIZE = 20000;
const INTERACTION_RECT_OFFSET = -INTERACTION_RECT_SIZE / 2;
const LINE_HIT_AREA_WIDTH = 100;

export interface RegionTransformerProps {
  encounterId: string;
  regionIndex: number;
  segment: RegionSegment;
  allRegions: PlacedRegion[];
  gridConfig: GridConfig;
  viewport: { x: number; y: number; scale: number };
  onVerticesChange: (vertices: Point[]) => void;
  onClearSelections: () => void | Promise<void>;
  onSwitchToRegion?: (regionIndex: number) => void | Promise<void>;
  onFinish?: () => void;
  onCancel?: () => void;
  onLocalAction?: (action: LocalAction) => void;
}

export const RegionTransformer: React.FC<RegionTransformerProps> = memo(
  ({ segment, allRegions, gridConfig, viewport, onVerticesChange, onClearSelections, onSwitchToRegion, onFinish, onCancel, onLocalAction }) => {
    const theme = useTheme();

    const [selectedVertices, setSelectedVertices] = useState<Set<number>>(new Set());
    const [selectedLineIndex, setSelectedLineIndex] = useState<number | null>(null);
    const [draggingVertexIndex, setDraggingVertexIndex] = useState<number | null>(null);
    const [draggingLine, setDraggingLine] = useState<number | null>(null);
    const [marqueeStart, setMarqueeStart] = useState<{
      x: number;
      y: number;
    } | null>(null);
    const [marqueeEnd, setMarqueeEnd] = useState<{
      x: number;
      y: number;
    } | null>(null);
    const [hoveredLineIndex, setHoveredLineIndex] = useState<number | null>(null);
    const [insertPreviewPos, setInsertPreviewPos] = useState<{
      x: number;
      y: number;
    } | null>(null);
    const [isShiftPressed, setIsShiftPressed] = useState<boolean>(false);
    const [previewVerticesDuringDrag, setPreviewVerticesDuringDrag] = useState<Point[] | null>(null);

    const dragStartPositionRef = useRef<Point | null>(null);
    const lineDragStartRef = useRef<{
      mouseX: number;
      mouseY: number;
      vertex1: Point;
      vertex2: Point;
    } | null>(null);
    const vertexRefs = useRef<Map<number, Konva.Group>>(new Map());
    const currentSnapModeRef = useRef<SnapMode | null>(null);

    const previewVertices = previewVerticesDuringDrag ?? segment.vertices;

    useEffect(() => {
      const currentIndices = new Set(segment.vertices.map((_, index) => index));
      const refsToDelete: number[] = [];

      vertexRefs.current.forEach((_, index) => {
        if (!currentIndices.has(index)) {
          refsToDelete.push(index);
        }
      });

      for (const index of refsToDelete) {
        vertexRefs.current.delete(index);
      }
    }, [segment.vertices]);

    useEffect(() => {
      const updateSnapMode = (e: KeyboardEvent | MouseEvent) => {
        if ('altKey' in e) {
          currentSnapModeRef.current = getSnapModeFromEvent(e);
        }
      };

      window.addEventListener('keydown', updateSnapMode);
      window.addEventListener('keyup', updateSnapMode);
      return () => {
        window.removeEventListener('keydown', updateSnapMode);
        window.removeEventListener('keyup', updateSnapMode);
      };
    }, []);

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
            },
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

        if (e.key === 'Enter') {
          e.preventDefault();
          e.stopPropagation();
          if (onFinish) {
            onFinish();
          }
          return;
        }

        if (e.key === 'Delete') {
          e.preventDefault();
          e.stopPropagation();

          if (selectedVertices.size > 0) {
            handleDeleteVertices();
          }
        }

        if (e.key === 'Escape') {
          e.preventDefault();
          e.stopPropagation();

          if (onCancel) {
            onCancel();
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
    }, [selectedVertices, onFinish, onCancel, handleDeleteVertices]);

    const handleVertexDragStart = useCallback(
      (index: number) => {
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
      },
      [segment.vertices, selectedVertices],
    );

    const handleVertexDragMove = useCallback(
      (index: number, e: Konva.KonvaEventObject<DragEvent>) => {
        if (!dragStartPositionRef.current || !e || !e.target) {
          return;
        }

        const currentX = e.target.x();
        const currentY = e.target.y();

        const oldX = dragStartPositionRef.current.x;
        const oldY = dragStartPositionRef.current.y;
        const deltaX = currentX - oldX;
        const deltaY = currentY - oldY;

        const newVertices = [...segment.vertices];

        if (selectedVertices.size > 1 && selectedVertices.has(index)) {
          selectedVertices.forEach((vIndex) => {
            const vertex = segment.vertices[vIndex];
            if (!vertex) return;
            newVertices[vIndex] = {
              x: vertex.x + deltaX,
              y: vertex.y + deltaY,
            };
          });
        } else {
          const vertex = segment.vertices[index];
          if (vertex) {
            newVertices[index] = { x: currentX, y: currentY };
          }
        }

        setPreviewVerticesDuringDrag(newVertices);
      },
      [segment.vertices, selectedVertices],
    );

    const handleVertexDragEnd = useCallback(
      (index: number, e: Konva.KonvaEventObject<DragEvent>) => {
        if (!dragStartPositionRef.current || !e || !e.target) {
          setDraggingVertexIndex(null);
          dragStartPositionRef.current = null;
          return;
        }

        const finalX = e.target.x();
        const finalY = e.target.y();

        const oldX = dragStartPositionRef.current.x;
        const oldY = dragStartPositionRef.current.y;
        const deltaX = finalX - oldX;
        const deltaY = finalY - oldY;

        const newVertices = [...segment.vertices];

        if (selectedVertices.size > 1 && selectedVertices.has(index)) {
          const vertexIndices = Array.from(selectedVertices);
          const oldVertices: Point[] = [];
          const newVerticesArray: Point[] = [];

          vertexIndices.forEach((vIndex) => {
            const vertex = segment.vertices[vIndex];
            if (!vertex) return;
            oldVertices.push({ x: vertex.x, y: vertex.y });
            const movedVertex = {
              x: vertex.x + deltaX,
              y: vertex.y + deltaY,
            };
            newVertices[vIndex] = movedVertex;
            newVerticesArray.push(movedVertex);
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
              },
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
              },
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
      },
      [segment, selectedVertices, onVerticesChange, onLocalAction],
    );

    const handleVertexClick = useCallback(
      (index: number, e: Konva.KonvaEventObject<MouseEvent>) => {
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
      },
      [selectedVertices],
    );

    const handleLineClick = useCallback(
      (lineIndex: number, e: Konva.KonvaEventObject<MouseEvent>) => {
        e.cancelBubble = true;
        setSelectedLineIndex(lineIndex);
        const vertex1Index = lineIndex;
        const vertex2Index = (lineIndex + 1) % segment.vertices.length;
        setSelectedVertices(new Set([vertex1Index, vertex2Index]));
      },
      [segment.vertices.length],
    );

    const marqueeRect = marqueeStart && marqueeEnd ? getMarqueeRect(marqueeStart, marqueeEnd) : null;
    const verticesToUse = previewVertices;

    const segmentAsRegion = useMemo(
      (): PlacedRegion => ({
        id: `segment-${segment.tempId}`,
        encounterId: '',
        index: segment.regionIndex ?? -1,
        name: segment.name,
        type: segment.type,
        vertices: segment.vertices,
        ...(segment.value !== undefined && { value: segment.value }),
        ...(segment.label !== undefined && { label: segment.label }),
      }),
      [segment],
    );

    const fillColor = getRegionColor(segmentAsRegion, allRegions);
    const fillOpacity = getRegionFillOpacity(segmentAsRegion);
    const isTransparent = isTransparentRegion(segmentAsRegion);

    return (
      <Group name='RegionTransformer'>
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
            } else {
              const worldPos: Point = {
                x: (pointerPos.x - viewport.x) / viewport.scale,
                y: (pointerPos.y - viewport.y) / viewport.scale,
              };

              const otherRegions = allRegions.filter(
                (region) =>
                  region.index !== segment.regionIndex &&
                  region.type !== 'FogOfWar'
              );

              const hoveredRegion = otherRegions.find((region) =>
                isPointInPolygon(worldPos, region.vertices)
              );

              const container = stage.container();
              if (container) {
                container.style.cursor = hoveredRegion ? 'pointer' : 'default';
              }
            }
          }}
          onMouseUp={async (_e) => {
            if (marqueeStart && marqueeEnd && marqueeRect) {
              const isSimpleClick = marqueeRect.width < 5 && marqueeRect.height < 5;

              if (isSimpleClick) {
                const clickScreenPos = { x: marqueeStart.x, y: marqueeStart.y };
                const clickWorldPos: Point = {
                  x: (clickScreenPos.x - viewport.x) / viewport.scale,
                  y: (clickScreenPos.y - viewport.y) / viewport.scale,
                };

                const otherRegions = allRegions.filter(
                  (region) =>
                    region.index !== segment.regionIndex &&
                    region.type !== 'FogOfWar'
                );

                const clickedRegion = otherRegions.find((region) =>
                  isPointInPolygon(clickWorldPos, region.vertices)
                );

                if (clickedRegion && onSwitchToRegion) {
                  onSwitchToRegion(clickedRegion.index);
                } else {
                  onClearSelections();
                }
              } else {
                const newSelected = new Set<number>();
                verticesToUse.forEach((vertex, index) => {
                  if (isPointInRect(vertex, marqueeRect)) {
                    newSelected.add(index);
                  }
                });
                setSelectedVertices(newSelected);
                setSelectedLineIndex(null);
              }
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
              const worldPos = screenToWorld(pointerPos, stage);

              const currentSnapMode = e.evt ? getSnapModeFromEvent(e.evt) : SnapMode.Free;
              const snappedWorldPos = snap(worldPos, gridConfig, currentSnapMode);

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
                  const worldPos = screenToWorld(pointerPos, stage);

                  const deltaX = worldPos.x - lineDragStartRef.current.mouseX;
                  const deltaY = worldPos.y - lineDragStartRef.current.mouseY;

                  const currentSnapMode = e.evt ? getSnapModeFromEvent(e.evt) : SnapMode.Free;

                  const snapped1 = snap(
                    { x: lineDragStartRef.current.vertex1.x + deltaX, y: lineDragStartRef.current.vertex1.y + deltaY },
                    gridConfig,
                    currentSnapMode
                  );
                  const actualDeltaX = snapped1.x - lineDragStartRef.current.vertex1.x;
                  const actualDeltaY = snapped1.y - lineDragStartRef.current.vertex1.y;

                  const newVertex1X = snapped1.x;
                  const newVertex1Y = snapped1.y;
                  const newVertex2X = lineDragStartRef.current.vertex2.x + actualDeltaX;
                  const newVertex2Y = lineDragStartRef.current.vertex2.y + actualDeltaY;

                  const newVertices = [...segment.vertices];
                  const vertex1Index = draggingLine;
                  const vertex2Index = (draggingLine + 1) % segment.vertices.length;
                  newVertices[vertex1Index] = {
                    x: newVertex1X,
                    y: newVertex1Y,
                  };
                  newVertices[vertex2Index] = {
                    x: newVertex2X,
                    y: newVertex2Y,
                  };

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
                      },
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

          {/* Filled region polygon */}
          {verticesToUse.length >= 3 && (
            <Line
              points={verticesToUse.flatMap((v) => [v.x, v.y])}
              fill={isTransparent ? 'transparent' : fillColor}
              {...(isTransparent && { stroke: theme.palette.grey[500], strokeWidth: 2 })}
              closed={true}
              opacity={isTransparent ? 0.5 : segment.type === 'Illumination' ? fillOpacity : 0.3}
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
                  stroke='transparent'
                  strokeWidth={LINE_HIT_AREA_WIDTH}
                  onMouseDown={(e: Konva.KonvaEventObject<MouseEvent>) => {
                    if (isLineSelected) {
                      e.cancelBubble = true;
                      const stage = e.target.getStage();
                      if (stage) {
                        const pointerPos = stage.getPointerPosition();
                        if (pointerPos) {
                          let worldPos = screenToWorld(pointerPos, stage);

                          const currentSnapMode = e.evt ? getSnapModeFromEvent(e.evt) : SnapMode.Free;
                          worldPos = snap(worldPos, gridConfig, currentSnapMode);

                          setDraggingLine(index);
                          lineDragStartRef.current = {
                            mouseX: worldPos.x,
                            mouseY: worldPos.y,
                            vertex1: { x: vertex.x, y: vertex.y },
                            vertex2: { x: nextVertex.x, y: nextVertex.y },
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

                      const worldPos = screenToWorld(pointerPos, stage);

                      const projected = projectPointToLineSegment(worldPos, vertex, nextVertex);

                      const snapMode = getSnapModeFromEvent(e.evt);
                      const insertPos = snap(projected, gridConfig, snapMode);

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
                          },
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
                        : isLineSelected
                          ? getMoveCursor()
                          : getPointerCursor();
                      container.style.cursor = cursor;
                    }

                    setHoveredLineIndex(index);
                  }}
                  onMouseMove={(e: Konva.KonvaEventObject<MouseEvent>) => {
                    const container = e.target.getStage()?.container();
                    if (container) {
                      const cursor = e.evt.shiftKey
                        ? getCrosshairPlusCursor()
                        : isLineSelected
                          ? getMoveCursor()
                          : getPointerCursor();
                      container.style.cursor = cursor;
                    }

                    if (e.evt.shiftKey && !draggingVertexIndex && !draggingLine && !marqueeStart) {
                      const stage = e.target.getStage();
                      if (!stage) return;

                      const pointerPos = stage.getPointerPosition();
                      if (!pointerPos) return;

                      const worldPos = screenToWorld(pointerPos, stage);

                      const projected = projectPointToLineSegment(worldPos, vertex, nextVertex);

                      const currentSnapMode = getSnapModeFromEvent(e.evt);
                      const finalPos = snap(projected, gridConfig, currentSnapMode);

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

          {/* eslint-disable-next-line react-hooks/refs */}
          {verticesToUse.map((vertex, index) => {
            const isSelected = selectedVertices.has(index);

            const groupProps: Record<string, unknown> = {
              x: vertex.x,
              y: vertex.y,
              draggable: true,
              listening: !isShiftPressed,
              ref: (node: Konva.Group | null) => {
                if (node) {
                  vertexRefs.current.set(index, node);
                } else {
                  vertexRefs.current.delete(index);
                }
              },
              dragBoundFunc: createDragBoundFunc(
                gridConfig,
                () => currentSnapModeRef.current ?? SnapMode.Free,
                () => true,
              ),
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
              },
            };

            return (
              <Group key={`vertex-group-${index}`} {...groupProps}>
                <Circle x={0} y={0} radius={25} fill='transparent' />
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
              fill='transparent'
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
  },
);

RegionTransformer.displayName = 'RegionTransformer';
