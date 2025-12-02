import type Konva from 'konva';
import type React from 'react';
import { useCallback, useEffect, useRef, useState } from 'react';
import { Group, Rect } from 'react-konva';
import {
  useAddEncounterLightSourceMutation,
  useAddEncounterSoundSourceMutation,
} from '@/services/encounterApi';
import type { EncounterLightSource, EncounterWall, Point, LightSourceType } from '@/types/domain';
import { getCrosshairPlusCursor } from '@/utils/customCursors';
import type { GridConfig } from '@/utils/gridCalculator';
import { getSnapModeFromEvent, screenToWorld, snap } from '@/utils/snapping';
import { LightSourcePreview, SoundSourcePreview } from './SourcePreview';
import { VertexMarker } from './VertexMarker';

const MIN_RANGE = 0.5;
const MAX_RANGE = 50.0;
const INTERACTION_RECT_SIZE = 20000;
const INTERACTION_RECT_OFFSET = -INTERACTION_RECT_SIZE / 2;

export interface LightSourceDrawingProps {
  sourceType: 'light';
  name?: string;
  type: LightSourceType;
  isDirectional: boolean;
  direction?: number;
  arc?: number;
  color?: string;
  isOn?: boolean;
}

export interface SoundSourceDrawingProps {
  sourceType: 'sound';
  name?: string;
  resourceId?: string;
  isPlaying?: boolean;
}

export type SourceDrawingConfig = LightSourceDrawingProps | SoundSourceDrawingProps;

export interface SourceDrawingToolProps {
  encounterId: string;
  source: SourceDrawingConfig;
  walls: EncounterWall[];
  gridConfig: GridConfig;
  onComplete: (success: boolean) => void;
  onCancel: () => void;
}

export const SourceDrawingTool: React.FC<SourceDrawingToolProps> = ({
  encounterId,
  source,
  walls,
  gridConfig,
  onComplete,
  onCancel,
}) => {
  const [placementPhase, setPlacementPhase] = useState<0 | 1 | 2>(0);
  const [centerPos, setCenterPos] = useState<Point | null>(null);
  const [previewPoint, setPreviewPoint] = useState<Point | null>(null);
  const [currentRange, setCurrentRange] = useState<number>(0);
  const [currentDirection, setCurrentDirection] = useState<number>(0);
  const [currentArc, setCurrentArc] = useState<number>(45);
  const [addLightSource] = useAddEncounterLightSourceMutation();
  const [addSoundSource] = useAddEncounterSoundSourceMutation();
  const stageContainerRef = useRef<HTMLDivElement | null>(null);

  const isLight = source.sourceType === 'light';
  const isDirectional = isLight && source.isDirectional;

  useEffect(() => {
    return () => {
      if (stageContainerRef.current) {
        stageContainerRef.current.style.cursor = 'default';
      }
    };
  }, []);

  const handleFinish = useCallback(
    async (explicitRange?: number) => {
      const rangeToUse = explicitRange ?? currentRange;

      if (!centerPos) {
        console.warn('Cannot finish: No center position');
        return;
      }

      if (rangeToUse < MIN_RANGE || rangeToUse > MAX_RANGE) {
        console.warn(`Invalid range: ${rangeToUse}. Must be between ${MIN_RANGE} and ${MAX_RANGE}`);
        if (stageContainerRef.current) {
          stageContainerRef.current.style.cursor = 'default';
        }
        onComplete(false);
        return;
      }

      try {
        if (isLight) {
          const lightSource = source as LightSourceDrawingProps;
          await addLightSource({
            encounterId,
            name: lightSource.name,
            type: lightSource.type,
            position: centerPos,
            direction: isDirectional ? currentDirection : undefined,
            arc: isDirectional ? currentArc : undefined,
            range: rangeToUse,
            color: lightSource.color,
            isOn: lightSource.isOn ?? true,
          }).unwrap();
        } else {
          const soundSource = source as SoundSourceDrawingProps;
          await addSoundSource({
            encounterId,
            name: soundSource.name,
            position: centerPos,
            range: rangeToUse,
            resourceId: soundSource.resourceId,
            isPlaying: soundSource.isPlaying ?? true,
          }).unwrap();
        }

        if (stageContainerRef.current) {
          stageContainerRef.current.style.cursor = 'default';
        }
        onComplete(true);
      } catch (error) {
        console.error('Failed to place source:', error);
        if (stageContainerRef.current) {
          stageContainerRef.current.style.cursor = 'default';
        }
        onComplete(false);
      }
    },
    [
      centerPos,
      currentRange,
      currentDirection,
      currentArc,
      encounterId,
      source,
      isLight,
      isDirectional,
      addLightSource,
      addSoundSource,
      onComplete,
    ],
  );

  const handleFinishWithRange = useCallback(
    (range: number) => {
      handleFinish(range);
    },
    [handleFinish],
  );

  const resetPlacement = useCallback(() => {
    setPlacementPhase(0);
    setCenterPos(null);
    setPreviewPoint(null);
    setCurrentRange(0);
    setCurrentDirection(0);
    setCurrentArc(45);
  }, []);

  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') {
        if (stageContainerRef.current) {
          stageContainerRef.current.style.cursor = 'default';
        }
        resetPlacement();
        onCancel();
      }
    };

    window.addEventListener('keydown', handleKeyDown);

    return () => {
      window.removeEventListener('keydown', handleKeyDown);
    };
  }, [onCancel, resetPlacement]);

  const getStagePosition = useCallback((e: Konva.KonvaEventObject<MouseEvent>): Point | null => {
    const stage = e.target.getStage();
    if (!stage) return null;

    const pointer = stage.getPointerPosition();
    if (!pointer) return null;

    return screenToWorld(pointer, stage);
  }, []);

  const calculateRange = useCallback(
    (center: Point, mouse: Point): number => {
      const dx = mouse.x - center.x;
      const dy = mouse.y - center.y;
      const pixelDistance = Math.sqrt(dx * dx + dy * dy);

      const cellDistance = pixelDistance / gridConfig.cellSize.width;
      const snappedRange = Math.round(cellDistance * 2) / 2;

      return Math.max(MIN_RANGE, Math.min(MAX_RANGE, snappedRange));
    },
    [gridConfig.cellSize.width],
  );

  const calculateDirection = useCallback((from: Point, to: Point): number => {
    const dx = to.x - from.x;
    const dy = to.y - from.y;
    return Math.atan2(dy, dx) * (180 / Math.PI);
  }, []);

  const calculateArcAngle = useCallback(
    (apex: Point, direction: number, mouse: Point): number => {
      const mouseAngle = calculateDirection(apex, mouse);
      let angleDiff = mouseAngle - direction;

      while (angleDiff > 180) angleDiff -= 360;
      while (angleDiff < -180) angleDiff += 360;

      const arcAngle = Math.abs(angleDiff) * 2;
      return Math.min(180, Math.max(0, Math.round(arcAngle / 5) * 5));
    },
    [calculateDirection],
  );

  const handleMouseMove = useCallback(
    (e: Konva.KonvaEventObject<MouseEvent>) => {
      const stagePos = getStagePosition(e);
      if (!stagePos) return;

      const snapMode = getSnapModeFromEvent(e.evt);
      const snappedPos = snap(stagePos, gridConfig, snapMode);
      setPreviewPoint(snappedPos);

      if (placementPhase === 1 && centerPos) {
        const newRange = calculateRange(centerPos, snappedPos);
        setCurrentRange(newRange);

        if (isDirectional) {
          const newDirection = calculateDirection(centerPos, snappedPos);
          setCurrentDirection(newDirection);
        }
      } else if (placementPhase === 2 && centerPos && isDirectional && currentRange > 0) {
        const newArc = calculateArcAngle(centerPos, currentDirection, snappedPos);
        setCurrentArc(newArc);
      }
    },
    [
      placementPhase,
      centerPos,
      isDirectional,
      currentDirection,
      currentRange,
      gridConfig,
      getStagePosition,
      calculateRange,
      calculateDirection,
      calculateArcAngle,
    ],
  );

  const handleClick = useCallback(
    (e: Konva.KonvaEventObject<MouseEvent>) => {
      const stagePos = getStagePosition(e);
      if (!stagePos) return;

      e.cancelBubble = true;

      const snapMode = getSnapModeFromEvent(e.evt);
      const snappedPos = snap(stagePos, gridConfig, snapMode);

      if (placementPhase === 0) {
        setCenterPos(snappedPos);
        setPlacementPhase(1);
      } else if (placementPhase === 1) {
        if (!centerPos) return;

        const newRange = calculateRange(centerPos, snappedPos);
        setCurrentRange(newRange);

        if (isDirectional) {
          const newDirection = calculateDirection(centerPos, snappedPos);
          setCurrentDirection(newDirection);
          setPlacementPhase(2);
        } else {
          handleFinishWithRange(newRange);
        }
      } else if (placementPhase === 2 && isDirectional) {
        if (!centerPos) return;

        const newArc = calculateArcAngle(centerPos, currentDirection, snappedPos);
        setCurrentArc(newArc);
        handleFinish();
      }
    },
    [
      placementPhase,
      centerPos,
      isDirectional,
      currentDirection,
      gridConfig,
      getStagePosition,
      calculateRange,
      calculateDirection,
      calculateArcAngle,
      handleFinish,
      handleFinishWithRange,
    ],
  );

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

  const renderPreview = () => {
    if (!centerPos || placementPhase < 1 || currentRange <= 0) return null;

    if (isLight) {
      const lightSource = source as LightSourceDrawingProps;
      const tempLightSource: EncounterLightSource = {
        index: -1,
        name: lightSource.name,
        type: lightSource.type,
        position: centerPos,
        range: currentRange,
        direction: isDirectional ? currentDirection : undefined,
        arc: isDirectional ? currentArc : undefined,
        color: lightSource.color,
        isOn: lightSource.isOn ?? true,
      };

      return (
        <LightSourcePreview
          centerPos={centerPos}
          range={currentRange}
          lightSource={tempLightSource}
          walls={walls}
          gridConfig={gridConfig}
        />
      );
    }

    return (
      <SoundSourcePreview
        centerPos={centerPos}
        range={currentRange}
        gridConfig={gridConfig}
      />
    );
  };

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

      {centerPos && placementPhase > 0 && (
        <>
          <VertexMarker position={centerPos} preview />
          {renderPreview()}
        </>
      )}

      {previewPoint && placementPhase === 0 && <VertexMarker position={previewPoint} preview />}
    </Group>
  );
};

SourceDrawingTool.displayName = 'SourceDrawingTool';
