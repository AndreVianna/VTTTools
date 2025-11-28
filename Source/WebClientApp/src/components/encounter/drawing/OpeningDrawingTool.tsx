import type Konva from 'konva';
import type React from 'react';
import { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import { Circle, Group, Line, Rect, Text } from 'react-konva';
import { useTheme } from '@mui/material/styles';
import type { EncounterWall, Point } from '@/types/domain';
import type { GridConfig } from '@/utils/gridCalculator';
import { getCrosshairPlusCursor } from '@/utils/customCursors';
import type { OpeningPlacementProperties } from '../panels/OpeningsPanel';

const INTERACTION_RECT_SIZE = 20000;
const INTERACTION_RECT_OFFSET = -INTERACTION_RECT_SIZE / 2;

export interface OpeningPole {
  x: number;
  y: number;
  h: number;
}

export interface OpeningDrawingToolProps {
  encounterId: string;
  properties: OpeningPlacementProperties;
  walls: EncounterWall[];
  gridConfig: GridConfig;
  onComplete: (wallIndex: number, startPole: OpeningPole, endPole: OpeningPole) => void;
  onCancel: () => void;
}

export const OpeningDrawingTool: React.FC<OpeningDrawingToolProps> = ({
  encounterId: _encounterId,
  properties,
  walls,
  gridConfig: _gridConfig,
  onComplete,
  onCancel,
}) => {
  const theme = useTheme();
  const [hoveredWallIndex, setHoveredWallIndex] = useState<number | null>(null);
  const [selectedWallIndex, setSelectedWallIndex] = useState<number | null>(null);
  const [startPole, setStartPole] = useState<OpeningPole | null>(null);
  const [currentPoint, setCurrentPoint] = useState<Point | null>(null);
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
        if (startPole) {
          setStartPole(null);
        } else {
          onCancel();
        }
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => {
      window.removeEventListener('keydown', handleKeyDown);
    };
  }, [onCancel, startPole]);

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

  const projectPointOnWall = useCallback(
    (
      wall: EncounterWall,
      point: Point,
    ): { closestPoint: Point; poleH: number; distanceToWall: number } | null => {
      if (!wall.poles || wall.poles.length < 2) return null;

      let minDistance = Infinity;
      let bestPoint: Point = { x: 0, y: 0 };
      let bestH = 0;

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
        const interpolatedH = p1.h + t * (p2.h - p1.h);

        const distanceToSegment = Math.sqrt((point.x - projectedX) ** 2 + (point.y - projectedY) ** 2);

        if (distanceToSegment < minDistance) {
          minDistance = distanceToSegment;
          bestPoint = { x: projectedX, y: projectedY };
          bestH = interpolatedH;
        }
      }

      return { closestPoint: bestPoint, poleH: bestH, distanceToWall: minDistance };
    },
    [],
  );

  const handleMouseMove = useCallback(
    (e: Konva.KonvaEventObject<MouseEvent>) => {
      const stagePos = getStagePosition(e);
      if (!stagePos) return;

      if (selectedWallIndex === null) {
        let closestWallIndex: number | null = null;
        let minDistance = 50;

        walls.forEach((wall) => {
          const result = projectPointOnWall(wall, stagePos);
          if (result && result.distanceToWall < minDistance) {
            minDistance = result.distanceToWall;
            closestWallIndex = wall.index;
          }
        });

        setHoveredWallIndex(closestWallIndex);
      } else {
        const wall = walls.find((w) => w.index === selectedWallIndex);
        if (wall) {
          const result = projectPointOnWall(wall, stagePos);
          if (result) {
            setCurrentPoint(result.closestPoint);
          }
        }
      }
    },
    [walls, selectedWallIndex, getStagePosition, projectPointOnWall],
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
      } else if (currentPoint) {
        const wall = walls.find((w) => w.index === selectedWallIndex);
        if (!wall) return;

        const result = projectPointOnWall(wall, stagePos);
        if (!result) return;

        const clickedPole: OpeningPole = {
          x: result.closestPoint.x,
          y: result.closestPoint.y,
          h: properties.height,
        };

        if (!startPole) {
          setStartPole(clickedPole);
        } else {
          if (stageContainerRef.current) {
            stageContainerRef.current.style.cursor = 'default';
          }
          onComplete(selectedWallIndex, startPole, clickedPole);
        }
      }
    },
    [
      selectedWallIndex,
      hoveredWallIndex,
      currentPoint,
      startPole,
      walls,
      properties.height,
      getStagePosition,
      projectPointOnWall,
      onComplete,
    ],
  );

  const previewWidth = useMemo(() => {
    if (!startPole || !currentPoint) return null;

    const dx = currentPoint.x - startPole.x;
    const dy = currentPoint.y - startPole.y;
    const distancePixels = Math.sqrt(dx * dx + dy * dy);

    return distancePixels;
  }, [startPole, currentPoint]);

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

  const instructionText = useMemo(() => {
    if (selectedWallIndex === null) {
      return 'Click on a wall to select it';
    }
    if (!startPole) {
      return 'Click to set opening start point';
    }
    return 'Click to set opening end point (Esc to cancel)';
  }, [selectedWallIndex, startPole]);

  return (
    <Group>
      <Rect
        x={INTERACTION_RECT_OFFSET}
        y={INTERACTION_RECT_OFFSET}
        width={INTERACTION_RECT_SIZE}
        height={INTERACTION_RECT_SIZE}
        fill="transparent"
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

      {startPole && (
        <Circle x={startPole.x} y={startPole.y} radius={5} fill={theme.palette.primary.main} listening={false} />
      )}

      {startPole && currentPoint && (
        <>
          <Line
            points={[startPole.x, startPole.y, currentPoint.x, currentPoint.y]}
            stroke={theme.palette.primary.main}
            strokeWidth={2}
            opacity={0.8}
            dash={[4, 4]}
            listening={false}
          />
          <Circle
            x={currentPoint.x}
            y={currentPoint.y}
            radius={4}
            fill={theme.palette.primary.light}
            stroke={theme.palette.primary.main}
            strokeWidth={1}
            listening={false}
          />
        </>
      )}

      {previewWidth !== null && currentPoint && startPole && (
        <Text
          x={(startPole.x + currentPoint.x) / 2}
          y={(startPole.y + currentPoint.y) / 2 - 20}
          text={`${Math.round(previewWidth)}px`}
          fontSize={12}
          fill={theme.palette.primary.main}
          fontStyle="bold"
          align="center"
          offsetX={20}
          listening={false}
        />
      )}

      {currentPoint && selectedWallIndex !== null && (
        <Text
          x={currentPoint.x + 15}
          y={currentPoint.y - 25}
          text={instructionText}
          fontSize={11}
          fill={theme.palette.text.secondary}
          listening={false}
        />
      )}
    </Group>
  );
};

OpeningDrawingTool.displayName = 'OpeningDrawingTool';
