import type Konva from 'konva';
import type React from 'react';
import { useCallback, useEffect, useRef, useState } from 'react';
import { Group, Rect } from 'react-konva';
import type { useRegionTransaction } from '@/hooks/useRegionTransaction';
import type { Point } from '@/types/domain';
import { createPlaceVertexAction } from '@/types/regionUndoActions';
import { getCrosshairPlusCursor } from '@/utils/customCursors';
import type { GridConfig } from '@/utils/gridCalculator';
import { getSnapModeFromEvent } from '@/utils/snapUtils';
import { snapToNearest } from '@/utils/structureSnapping';
import { RegionPreview } from '../RegionPreview';
import { VertexMarker } from './VertexMarker';

const INTERACTION_RECT_SIZE = 20000;
const INTERACTION_RECT_OFFSET = -INTERACTION_RECT_SIZE / 2;

export interface RegionDrawingToolProps {
  encounterId: string;
  regionIndex: number;
  gridConfig: GridConfig;
  onCancel: () => void;
  onFinish: () => void;
  onVerticesChange?: (vertices: Point[]) => void;
  regionType: string;
  regionColor?: string;
  regionTransaction: ReturnType<typeof useRegionTransaction>;
  cursor?: string;
}

export const RegionDrawingTool: React.FC<RegionDrawingToolProps> = ({
  gridConfig,
  onCancel,
  onFinish,
  onVerticesChange,
  regionColor,
  regionTransaction,
  cursor,
}) => {
  const [vertices, setVertices] = useState<Point[]>([]);
  const [previewPoint, setPreviewPoint] = useState<Point | null>(null);
  const stageContainerRef = useRef<HTMLDivElement | null>(null);

  useEffect(() => {
    return () => {
      if (stageContainerRef.current) {
        stageContainerRef.current.style.cursor = 'default';
      }
    };
  }, []);

  const handleFinish = useCallback(async () => {
    if (vertices.length < 3) {
      console.warn('Cannot finish region with less than 3 vertices');
      return;
    }

    onFinish();
  }, [vertices, onFinish]);

  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') {
        e.preventDefault();
        e.stopPropagation();
        if (stageContainerRef.current) {
          stageContainerRef.current.style.cursor = 'default';
        }
        onCancel();
        return;
      }

      if (e.key === 'Enter') {
        e.preventDefault();
        e.stopPropagation();
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

      const newVertices = [...vertices, snappedPos];
      setVertices(newVertices);
      onVerticesChange?.(newVertices);

      const action = createPlaceVertexAction(
        () => {
          const segment = regionTransaction.transaction.segment;
          if (!segment) return null;
          return {
            ...segment,
            vertices: newVertices,
          };
        },
        (updater) => {
          const segment = regionTransaction.transaction.segment;
          if (!segment) return;
          const updated = updater({ ...segment, vertices: newVertices });
          regionTransaction.updateVertices(updated.vertices);
          setVertices(updated.vertices);
          onVerticesChange?.(updated.vertices);
        },
      );

      regionTransaction.updateVertices(newVertices);
      regionTransaction.pushLocalAction(action);
    },
    [vertices, gridConfig, onVerticesChange, regionTransaction],
  );

  const handleDoubleClick = useCallback(() => {
    if (vertices.length >= 3) {
      handleFinish();
    }
  }, [vertices.length, handleFinish]);

  const handleMouseEnter = useCallback((e: Konva.KonvaEventObject<MouseEvent>) => {
    const stage = e.target.getStage();
    if (!stage) return;

    const container = stage.container();
    if (container) {
      stageContainerRef.current = container;
      container.style.cursor = cursor || getCrosshairPlusCursor();
    }
  }, [cursor]);

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

      {vertices.map((vertex) => (
        <VertexMarker key={`vertex-${vertex.x}-${vertex.y}`} position={vertex} />
      ))}

      <RegionPreview
        vertices={vertices}
        {...(previewPoint && { cursorPos: previewPoint })}
        {...(regionColor && { color: regionColor })}
      />

      {previewPoint && <VertexMarker position={previewPoint} preview />}
    </Group>
  );
};

RegionDrawingTool.displayName = 'RegionDrawingTool';
