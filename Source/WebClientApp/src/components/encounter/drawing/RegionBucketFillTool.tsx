import type Konva from 'konva';
import type React from 'react';
import { useCallback, useEffect, useState } from 'react';
import { Group, Rect } from 'react-konva';
import type { useRegionTransaction } from '@/hooks/useRegionTransaction';
import type { PlacedOpening, PlacedWall, Point } from '@/types/domain';
import type { GridConfig } from '@/utils/gridCalculator';
import { traceBoundary } from '@/utils/regionBoundaryUtils';
import { RegionPreview } from '../RegionPreview';

const INTERACTION_RECT_SIZE = 20000;
const INTERACTION_RECT_OFFSET = -INTERACTION_RECT_SIZE / 2;

export interface RegionBucketFillToolProps {
  encounterId: string;
  gridConfig: GridConfig;
  onCancel: () => void;
  onFinish: () => void;
  onVerticesChange?: (vertices: Point[]) => void;
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
  onVerticesChange,
  regionColor,
  walls,
  openings,
  stageSize,
}) => {
  const [previewVertices, setPreviewVertices] = useState<Point[] | null>(null);
  const [isFullStage, setIsFullStage] = useState(false);

  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') {
        e.preventDefault();
        e.stopPropagation();
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
        console.warn('Cannot create region: no valid boundary found');
        return;
      }

      onVerticesChange?.(finalVertices);
      onFinish();
    },
    [walls, openings, stageSize, onVerticesChange, onFinish],
  );

  return (
    <Group>
      <Rect
        x={INTERACTION_RECT_OFFSET}
        y={INTERACTION_RECT_OFFSET}
        width={INTERACTION_RECT_SIZE}
        height={INTERACTION_RECT_SIZE}
        fill='transparent'
        onMouseMove={handleMouseMove}
        onClick={handleClick}
        listening={true}
      />

      {previewVertices && (
        <RegionPreview
          vertices={previewVertices}
          {...(regionColor && { color: regionColor })}
          opacity={isFullStage ? 0.1 : 0.3}
        />
      )}
    </Group>
  );
};

RegionBucketFillTool.displayName = 'RegionBucketFillTool';
