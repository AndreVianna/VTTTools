import type Konva from 'konva';
import type React from 'react';
import { useCallback, useEffect, useRef, useState } from 'react';
import { Group, Rect } from 'react-konva';
import type { useRegionTransaction } from '@/hooks/useRegionTransaction';
import type { PlacedOpening, PlacedWall, Point } from '@/types/domain';
import { getBucketPlusCursor } from '@/utils/customCursors';
import type { GridConfig } from '@/utils/gridCalculator';
import { traceBoundary } from '@/utils/regionBoundaryUtils';
import { RegionPreview } from '../RegionPreview';

const INTERACTION_RECT_SIZE = 20000;
const INTERACTION_RECT_OFFSET = -INTERACTION_RECT_SIZE / 2;

export interface RegionBucketFillToolProps {
  encounterId: string;
  gridConfig: GridConfig;
  onCancel: () => void;
  onFinish: (vertices: Point[]) => void;
  regionType: string;
  regionColor?: string;
  regionTransaction: ReturnType<typeof useRegionTransaction>;
  walls: PlacedWall[];
  openings: PlacedOpening[];
  stageSize: { width: number; height: number };
}

export const RegionBucketFillTool: React.FC<RegionBucketFillToolProps> = ({
  onCancel,
  onFinish,
  regionColor,
  walls,
  openings,
  stageSize,
}) => {
  const [previewVertices, setPreviewVertices] = useState<Point[] | null>(null);
  const [isFullStage, setIsFullStage] = useState(false);
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
        e.preventDefault();
        e.stopPropagation();
        if (stageContainerRef.current) {
          stageContainerRef.current.style.cursor = 'default';
        }
        onCancel();
        return;
      }
    };

    window.addEventListener('keydown', handleKeyDown);

    return () => {
      window.removeEventListener('keydown', handleKeyDown);
    };
  }, [onCancel]);

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

      const result = traceBoundary(stagePos, walls, openings, stageSize);

      if (result.isFullStage) {
        setIsFullStage(true);
        setPreviewVertices([
          { x: 0, y: 0 },
          { x: stageSize.width, y: 0 },
          { x: stageSize.width, y: stageSize.height },
          { x: 0, y: stageSize.height },
        ]);
      } else if (result.vertices) {
        setIsFullStage(false);
        setPreviewVertices(result.vertices);
      } else {
        setIsFullStage(false);
        setPreviewVertices(null);
      }
    },
    [walls, openings, stageSize],
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

      const result = traceBoundary(stagePos, walls, openings, stageSize);

      let finalVertices: Point[];

      if (result.isFullStage) {
        finalVertices = [
          { x: 0, y: 0 },
          { x: stageSize.width, y: 0 },
          { x: stageSize.width, y: stageSize.height },
          { x: 0, y: stageSize.height },
        ];
      } else if (result.vertices && result.vertices.length >= 3) {
        finalVertices = result.vertices;
      } else {
        return;
      }

      if (stageContainerRef.current) {
        stageContainerRef.current.style.cursor = 'default';
      }
      onFinish(finalVertices);
    },
    [walls, openings, stageSize, onFinish],
  );

  const handleMouseEnter = useCallback((e: Konva.KonvaEventObject<MouseEvent>) => {
    const stage = e.target.getStage();
    if (!stage) return;

    const container = stage.container();
    if (container) {
      stageContainerRef.current = container;
      container.style.cursor = getBucketPlusCursor();
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
        listening={true}
      />

      {previewVertices && (
        <RegionPreview
          vertices={previewVertices}
          {...(regionColor && { color: regionColor })}
          opacity={isFullStage ? 0.05 : 0.15}
        />
      )}
    </Group>
  );
};

RegionBucketFillTool.displayName = 'RegionBucketFillTool';
