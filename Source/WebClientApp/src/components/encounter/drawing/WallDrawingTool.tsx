import type Konva from 'konva';
import type React from 'react';
import { useCallback, useEffect, useRef, useState } from 'react';
import { Group, Rect } from 'react-konva';
import type { useWallTransaction } from '@/hooks/useWallTransaction';
import { useGetEncounterQuery } from '@/services/encounterApi';
import type { EncounterWallSegment, Point, Pole } from '@/types/domain';
import { createPlacePoleAction } from '@/types/wallUndoActions';
import type { GridConfig } from '@/utils/gridCalculator';
import { getCrosshairPlusCursor } from '@/utils/customCursors';
import { getSnapModeFromEvent, snap, screenToWorld } from '@/utils/snapping';
import { decomposeSelfIntersectingPath } from '@/utils/wallPlanarUtils';

import { VertexMarker } from './VertexMarker';
import { WallPreview } from './WallPreview';

const INTERACTION_RECT_SIZE = 20000;
const INTERACTION_RECT_OFFSET = -INTERACTION_RECT_SIZE / 2;

export interface WallDrawingToolProps {
  encounterId: string;
  wallIndex: number;
  gridConfig: GridConfig;
  defaultHeight: number;
  onCancel: () => void;
  onFinish: () => void;
  onPolesChange?: (poles: Pole[]) => void;
  wallTransaction: ReturnType<typeof useWallTransaction>;
}

export const WallDrawingTool: React.FC<WallDrawingToolProps> = ({
  encounterId,
  wallIndex,
  gridConfig,
  defaultHeight,
  onCancel,
  onFinish,
  onPolesChange,
  wallTransaction,
}) => {
  const [poles, setPoles] = useState<Pole[]>([]);
  const [previewPoint, setPreviewPoint] = useState<Point | null>(null);
  const stageContainerRef = useRef<HTMLDivElement | null>(null);

  const { data: encounter } = useGetEncounterQuery(encounterId);
  const wall = encounter?.walls?.find((w) => w.index === wallIndex);

  useEffect(() => {
    return () => {
      if (stageContainerRef.current) {
        stageContainerRef.current.style.cursor = 'default';
      }
    };
  }, []);

  const handleFinish = useCallback(async () => {
    if (poles.length < 2) return;
    if (!encounter) return;

    const activeSegments = wallTransaction.getActiveSegments();
    const currentSegment = activeSegments[0];

    const segmentName = wall?.name || currentSegment?.name || '';

    const TOLERANCE = 5;
    const polePoints = poles.map((p) => ({ x: p.x, y: p.y }));
    const { closedWalls, openSegments } = decomposeSelfIntersectingPath(polePoints, TOLERANCE);

    const createSegmentsFromPoles = (poleList: Point[], defaultSegmentType: number = 0): EncounterWallSegment[] => {
      const segments: EncounterWallSegment[] = [];
      for (let i = 0; i < poleList.length - 1; i++) {
        const startPole = poleList[i];
        const endPole = poleList[i + 1];
        if (!startPole || !endPole) continue;
        segments.push({
          index: i,
          startPole: { x: startPole.x, y: startPole.y, h: defaultHeight },
          endPole: { x: endPole.x, y: endPole.y, h: defaultHeight },
          type: defaultSegmentType,
          state: 1,
        });
      }
      return segments;
    };

    if (closedWalls.length > 0 || openSegments.length > 1) {
      const allSegments = [
        ...closedWalls.map((wallPoles) => {
          const segments = createSegmentsFromPoles(wallPoles);
          const lastPole = wallPoles[wallPoles.length - 1];
          const firstPole = wallPoles[0];
          if (lastPole && firstPole) {
            segments.push({
              index: segments.length,
              startPole: { x: lastPole.x, y: lastPole.y, h: defaultHeight },
              endPole: { x: firstPole.x, y: firstPole.y, h: defaultHeight },
              type: 0,
              state: 1,
            });
          }
          return {
            tempId: -1,
            wallIndex: null as number | null,
            name: segmentName,
            segments,
          };
        }),
        ...openSegments.map((segmentPoles) => ({
          tempId: -1,
          wallIndex: null as number | null,
          name: segmentName,
          segments: createSegmentsFromPoles(segmentPoles),
        })),
      ];

      wallTransaction.setAllSegments(allSegments);
      onFinish();
      return;
    }

    const segments = createSegmentsFromPoles(polePoints);

    const firstPole = polePoints[0];
    const lastPole = polePoints[polePoints.length - 1];
    if (firstPole && lastPole) {
      const distanceToClose = Math.sqrt(
        Math.pow(lastPole.x - firstPole.x, 2) + Math.pow(lastPole.y - firstPole.y, 2)
      );
      if (distanceToClose < TOLERANCE) {
        segments.push({
          index: segments.length,
          startPole: { x: lastPole.x, y: lastPole.y, h: defaultHeight },
          endPole: { x: firstPole.x, y: firstPole.y, h: defaultHeight },
          type: 0,
          state: 1,
        });
      }
    }

    const finalSegment = {
      tempId: -1,
      wallIndex: null as number | null,
      name: segmentName,
      segments,
    };

    wallTransaction.setAllSegments([finalSegment]);
    onFinish();
  }, [poles, encounter, wall, wallTransaction, defaultHeight, onFinish]);

  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') {
        if (stageContainerRef.current) {
          stageContainerRef.current.style.cursor = 'default';
        }
        onCancel();
        return;
      }

      if (e.key === 'Enter' && !e.defaultPrevented) {
        if (stageContainerRef.current) {
          stageContainerRef.current.style.cursor = 'default';
        }
        handleFinish();
        return;
      }
    };

    window.addEventListener('keydown', handleKeyDown);

    return () => {
      window.removeEventListener('keydown', handleKeyDown);
    };
  }, [onCancel, handleFinish]);

  const handleMouseMove = useCallback(
    (e: Konva.KonvaEventObject<MouseEvent>) => {
      const stage = e.target.getStage();
      if (!stage) return;

      const pointer = stage.getPointerPosition();
      if (!pointer) return;

      const worldPos = screenToWorld(pointer, stage);
      const snapMode = getSnapModeFromEvent(e.evt);
      const snappedPos = snap(worldPos, gridConfig, snapMode);
      setPreviewPoint(snappedPos);
    },
    [gridConfig],
  );

  const handleClick = useCallback(
    (e: Konva.KonvaEventObject<MouseEvent>) => {
      const stage = e.target.getStage();
      if (!stage) return;

      e.cancelBubble = true;

      const pointer = stage.getPointerPosition();
      if (!pointer) return;

      const worldPos = screenToWorld(pointer, stage);
      const snapMode = getSnapModeFromEvent(e.evt);
      const snappedPos = snap(worldPos, gridConfig, snapMode);
      const newPole: Pole = {
        x: snappedPos.x,
        y: snappedPos.y,
        h: defaultHeight,
      };
      const poleIndex = poles.length;
      const newPoles = [...poles, newPole];

      setPoles(newPoles);
      onPolesChange?.(newPoles);

      const action = createPlacePoleAction(
        poleIndex,
        newPole,
        (updatedPoles) => {
          setPoles(updatedPoles);
          onPolesChange?.(updatedPoles);
        },
        () => {
          let currentPoles: Pole[] = [];
          setPoles((p) => {
            currentPoles = p;
            return p;
          });
          return currentPoles;
        },
      );
      wallTransaction.pushLocalAction(action);
    },
    [poles, gridConfig, defaultHeight, onPolesChange, wallTransaction],
  );

  const handleDoubleClick = useCallback(() => {
    if (poles.length >= 1) {
      handleFinish();
    }
  }, [poles.length, handleFinish]);

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
        onDblClick={handleDoubleClick}
        listening={true}
      />

      {poles.map((pole, index) => (
        <VertexMarker key={`pole-${pole.x}-${pole.y}-${index}`} position={{ x: pole.x, y: pole.y }} />
      ))}

      <WallPreview
        poles={poles}
        previewPoint={previewPoint}
      />

      {previewPoint && <VertexMarker position={previewPoint} preview />}
    </Group>
  );
};

WallDrawingTool.displayName = 'WallDrawingTool';
