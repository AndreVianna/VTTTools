import { useTheme } from '@mui/material/styles';
import type Konva from 'konva';
import type React from 'react';
import { useState } from 'react';
import { Circle, Group, Line } from 'react-konva';

import type { PlacedAsset } from '@/types/domain';
import type { GridConfig } from '@/utils/gridCalculator';
import { calculateAngleFromCenter, snapAngle } from '@/utils/rotationUtils';

export interface RotationHandleProps {
  selectedAssets: PlacedAsset[];
  gridConfig: GridConfig;
  scale: number;
  visible?: boolean;
  stageRef?: React.RefObject<Konva.Stage>;
  dragUpdateTrigger?: number;
  getAssetRenderPosition?: (assetId: string) => { x: number; y: number; width: number; height: number } | null;
  onRotationChange?:
    | ((
        updates: Array<{
          assetId: string;
          rotation: number;
        }>,
      ) => void)
    | undefined;
  onRotationStart?: (() => void) | undefined;
  onRotationEnd?: (() => void) | undefined;
}

export const RotationHandle: React.FC<RotationHandleProps> = ({
  selectedAssets,
  scale,
  visible = true,
  stageRef: _stageRef,
  dragUpdateTrigger,
  getAssetRenderPosition,
  onRotationChange,
  onRotationStart,
  onRotationEnd,
}) => {
  const theme = useTheme();
  const [isDragging, setIsDragging] = useState(false);

  if (selectedAssets.length !== 1) {
    return null;
  }

  const asset = selectedAssets[0]!;

  let centerX: number;
  let centerY: number;

  if (getAssetRenderPosition) {
    const renderPos = getAssetRenderPosition(asset.id);
    if (!renderPos) return null;
    centerX = renderPos.x + renderPos.width / 2;
    centerY = renderPos.y + renderPos.height / 2;
  } else {
    void dragUpdateTrigger;
    centerX = asset.position.x;
    centerY = asset.position.y;
  }

  const longestDimension = Math.max(asset.size.width, asset.size.height);
  const handleLength = longestDimension * 0.75;

  const rotation = asset.rotation;

  // Convert rotation to radians and adjust so 0° points up (north) instead of right (east)
  // Standard math: 0° = right, 90° = up → We want: 0° = up, so subtract 90°
  const angleRadians = ((rotation - 90) * Math.PI) / 180;
  const lineEndX = Math.cos(angleRadians) * handleLength;
  const lineEndY = Math.sin(angleRadians) * handleLength;

  const strokeWidth = 1 / scale;
  const arrowSize = Math.max(4, Math.min(6, 5 / scale));

  const lineColor = theme.palette.mode === 'dark' ? '#9CA3AF' : '#6B7280';

  const handleMouseDown = (e: Konva.KonvaEventObject<MouseEvent>) => {
    e.cancelBubble = true;
    setIsDragging(true);
    onRotationStart?.();

    const stage = e.target.getStage();
    if (!stage) return;

    const handleMouseMove = () => {
      const pointerPosition = stage.getPointerPosition();
      if (!pointerPosition) return;

      // Convert screen coordinates to canvas/world coordinates
      const scale = stage.scaleX();
      const canvasPosition = {
        x: (pointerPosition.x - stage.x()) / scale,
        y: (pointerPosition.y - stage.y()) / scale,
      };

      const assetCenter = { x: asset.position.x, y: asset.position.y };
      const newRotation = snapAngle(calculateAngleFromCenter(assetCenter, canvasPosition));
      onRotationChange?.([{ assetId: asset.id, rotation: newRotation }]);
    };

    const handleMouseUp = () => {
      setIsDragging(false);
      onRotationEnd?.();
      stage.off('mousemove', handleMouseMove);
      stage.off('mouseup', handleMouseUp);
      window.removeEventListener('mouseup', handleMouseUp);
    };

    stage.on('mousemove', handleMouseMove);
    stage.on('mouseup', handleMouseUp);
    window.addEventListener('mouseup', handleMouseUp);
  };

  return (
    <Group x={centerX} y={centerY} visible={visible}>
      <Line
        points={[0, 0, lineEndX, lineEndY]}
        stroke={lineColor}
        strokeWidth={strokeWidth}
        dash={[5, 5]}
        opacity={0.8}
        listening={false}
      />
      <Circle
        x={lineEndX}
        y={lineEndY}
        radius={arrowSize}
        fill={lineColor}
        stroke={lineColor}
        strokeWidth={1}
        cursor={isDragging ? 'grabbing' : 'grab'}
        hitStrokeWidth={20}
        onMouseDown={handleMouseDown}
      />
    </Group>
  );
};
