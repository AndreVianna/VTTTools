import type Konva from 'konva';
import type React from 'react';
import { useCallback, useEffect, useState } from 'react';
import { Group, Rect } from 'react-konva';
import type { useWallTransaction } from '@/hooks/useWallTransaction';
import { useGetEncounterQuery } from '@/services/encounterApi';
import type { Point, Pole } from '@/types/domain';
import { createPlacePoleAction } from '@/types/wallUndoActions';
import type { GridConfig } from '@/utils/gridCalculator';
import { getSnapModeFromEvent } from '@/utils/snapUtils';
import { snapToNearest } from '@/utils/structureSnapping';
import { decomposeSelfIntersectingPath } from '@/utils/wallPlanarUtils';
import { getCrosshairCursor } from '@/utils/customCursors';

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

  const { data: encounter } = useGetEncounterQuery(encounterId);
  const wall = encounter?.walls?.find((w) => w.index === wallIndex);

  const handleFinish = useCallback(async () => {
    if (poles.length < 2) return;
    if (!encounter) return;

    const activeSegments = wallTransaction.getActiveSegments();
    const currentSegment = activeSegments[0];

    const segmentName = wall?.name || currentSegment?.name || '';
    const segmentMaterial = wall?.material || currentSegment?.material;
    const segmentColor = wall?.color || currentSegment?.color;
    const segmentVisibility = wall?.visibility ?? currentSegment?.visibility ?? 0;

    const TOLERANCE = 5;
    const polePoints = poles.map((p) => ({ x: p.x, y: p.y }));
    const { closedWalls, openSegments } = decomposeSelfIntersectingPath(polePoints, TOLERANCE);

    if (closedWalls.length > 0 || openSegments.length > 0) {
      const allSegments = [
        ...closedWalls.map((wallPoles) => ({
          tempId: -1,
          wallIndex: null as number | null,
          name: segmentName,
          poles: wallPoles.map((p) => ({ x: p.x, y: p.y, h: defaultHeight })),
          isClosed: true,
          visibility: segmentVisibility,
          material: segmentMaterial,
          color: segmentColor,
        })),
        ...openSegments.map((segmentPoles) => ({
          tempId: -1,
          wallIndex: null as number | null,
          name: segmentName,
          poles: segmentPoles.map((p) => ({
            x: p.x,
            y: p.y,
            h: defaultHeight,
          })),
          isClosed: false,
          visibility: segmentVisibility,
          material: segmentMaterial,
          color: segmentColor,
        })),
      ];

      wallTransaction.setAllSegments(allSegments);
      onFinish();
      return;
    }

    onFinish();
  }, [poles, encounter, wall, wallTransaction, defaultHeight, onFinish]);

  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') {
        onCancel();
        return;
      }

      if (e.key === 'Enter' && !e.defaultPrevented) {
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

      const scale = stage.scaleX();
      const stagePos = {
        x: (pointer.x - stage.x()) / scale,
        y: (pointer.y - stage.y()) / scale,
      };

      const snapMode = getSnapModeFromEvent(e.evt);
      const snappedPos = snapToNearest(stagePos, gridConfig, snapMode);
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

      const scale = stage.scaleX();
      const stagePos = {
        x: (pointer.x - stage.x()) / scale,
        y: (pointer.y - stage.y()) / scale,
      };

      const snapMode = getSnapModeFromEvent(e.evt);
      const snappedPos = snapToNearest(stagePos, gridConfig, snapMode);
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
        () => false,
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
      container.style.cursor = getCrosshairCursor();
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

      <WallPreview poles={poles} previewPoint={previewPoint} wall={wall} />

      {previewPoint && <VertexMarker position={previewPoint} preview />}
    </Group>
  );
};

WallDrawingTool.displayName = 'WallDrawingTool';
