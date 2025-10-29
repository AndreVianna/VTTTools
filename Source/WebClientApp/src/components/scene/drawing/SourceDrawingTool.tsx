import React, { useEffect, useState, useCallback } from 'react';
import { Layer } from 'react-konva';
import type Konva from 'konva';
import { usePlaceSceneSourceMutation } from '@/services/sourceApi';
import { snapToNearest, SnapMode } from '@/utils/structureSnapping';
import { SourcePreview } from './SourcePreview';
import type { Point, Source, SceneBarrier } from '@/types/domain';
import type { GridConfig } from '@/utils/gridCalculator';

const MIN_RANGE = 0.5;
const MAX_RANGE = 50.0;

export interface SourceDrawingToolProps {
    sceneId: string;
    source: Source;
    barriers: SceneBarrier[];
    gridConfig: GridConfig;
    onComplete: (success: boolean) => void;
    onCancel: () => void;
}

export const SourceDrawingTool: React.FC<SourceDrawingToolProps> = ({
    sceneId,
    source,
    barriers,
    gridConfig,
    onComplete,
    onCancel
}) => {
    const [centerPos, setCenterPos] = useState<Point | null>(null);
    const [currentMousePos, setCurrentMousePos] = useState<Point | null>(null);
    const [range, setRange] = useState<number>(source.defaultRange);
    const [snapMode, setSnapMode] = useState<SnapMode>(SnapMode.HalfSnap);
    const [isPlacing, setIsPlacing] = useState<boolean>(false);
    const [placeSource] = usePlaceSceneSourceMutation();

    const handleFinish = useCallback(async () => {
        if (!centerPos || range < MIN_RANGE || range > MAX_RANGE) return;

        try {
            await placeSource({
                sceneId,
                body: {
                    sourceId: source.id,
                    position: centerPos,
                    range,
                    intensity: source.defaultIntensity,
                    isGradient: source.defaultIsGradient
                }
            }).unwrap();

            onComplete(true);
        } catch (error) {
            console.error('Failed to place source:', error);
            onComplete(false);
        }
    }, [centerPos, range, sceneId, source, placeSource, onComplete]);

    useEffect(() => {
        const handleKeyDown = (e: KeyboardEvent) => {
            if (e.key === 'Escape') {
                onCancel();
            }

            if (e.altKey && e.ctrlKey) {
                setSnapMode(SnapMode.QuarterSnap);
            } else if (e.altKey) {
                setSnapMode(SnapMode.Free);
            } else {
                setSnapMode(SnapMode.HalfSnap);
            }
        };

        const handleKeyUp = (e: KeyboardEvent) => {
            if (!e.altKey && !e.ctrlKey) {
                setSnapMode(SnapMode.HalfSnap);
            }
        };

        window.addEventListener('keydown', handleKeyDown);
        window.addEventListener('keyup', handleKeyUp);

        return () => {
            window.removeEventListener('keydown', handleKeyDown);
            window.removeEventListener('keyup', handleKeyUp);
        };
    }, [onCancel]);

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

    const calculateRange = useCallback((center: Point, mouse: Point): number => {
        const dx = mouse.x - center.x;
        const dy = mouse.y - center.y;
        const pixelDistance = Math.sqrt(dx * dx + dy * dy);

        const cellDistance = pixelDistance / gridConfig.cellSize.width;
        const snappedRange = Math.round(cellDistance * 2) / 2;

        return Math.max(MIN_RANGE, Math.min(MAX_RANGE, snappedRange));
    }, [gridConfig.cellSize.width]);

    const handleMouseDown = useCallback((e: Konva.KonvaEventObject<MouseEvent>) => {
        const stagePos = getStagePosition(e);
        if (!stagePos) return;

        const snappedPos = snapToNearest(stagePos, gridConfig, snapMode);
        setCenterPos(snappedPos);
        setCurrentMousePos(snappedPos);
        setIsPlacing(true);
    }, [gridConfig, snapMode, getStagePosition]);

    const handleMouseMove = useCallback((e: Konva.KonvaEventObject<MouseEvent>) => {
        const stagePos = getStagePosition(e);
        if (!stagePos) return;

        setCurrentMousePos(stagePos);

        if (isPlacing && centerPos) {
            const newRange = calculateRange(centerPos, stagePos);
            setRange(newRange);
        }
    }, [isPlacing, centerPos, calculateRange, getStagePosition]);

    const handleMouseUp = useCallback(() => {
        if (isPlacing && centerPos && range >= MIN_RANGE && range <= MAX_RANGE) {
            setIsPlacing(false);
            handleFinish();
        }
    }, [isPlacing, centerPos, range, handleFinish]);

    return (
        <Layer
            onMouseDown={handleMouseDown}
            onMouseMove={handleMouseMove}
            onMouseUp={handleMouseUp}
            listening={true}
        >
            {centerPos && currentMousePos && (
                <SourcePreview
                    centerPos={centerPos}
                    range={range}
                    source={source}
                    barriers={barriers}
                    gridConfig={gridConfig}
                />
            )}
        </Layer>
    );
};

SourceDrawingTool.displayName = 'SourceDrawingTool';
