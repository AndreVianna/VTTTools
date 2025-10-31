import React, { useEffect, useState, useCallback } from 'react';
import { Layer } from 'react-konva';
import type Konva from 'konva';
import { useAddSceneSourceMutation } from '@/services/sceneApi';
import { snapToNearest, SnapMode } from '@/utils/structureSnapping';
import { SourcePreview } from './SourcePreview';
import type { Point, SceneSource, SceneWall } from '@/types/domain';
import type { GridConfig } from '@/utils/gridCalculator';

const MIN_RANGE = 0.5;
const MAX_RANGE = 50.0;

export interface SourceDrawingToolProps {
    sceneId: string;
    source: SceneSource;
    walls: SceneWall[];
    gridConfig: GridConfig;
    onComplete: (success: boolean) => void;
    onCancel: () => void;
}

export const SourceDrawingTool: React.FC<SourceDrawingToolProps> = ({
    sceneId,
    source,
    walls,
    gridConfig,
    onComplete,
    onCancel
}) => {
    const [centerPos, setCenterPos] = useState<Point | null>(null);
    const [currentMousePos, setCurrentMousePos] = useState<Point | null>(null);
    const [range, setRange] = useState<number>(source.range ?? 5.0);
    const [snapMode, setSnapMode] = useState<SnapMode>(SnapMode.HalfSnap);
    const [isPlacing, setIsPlacing] = useState<boolean>(false);
    const [addSource] = useAddSceneSourceMutation();

    const handleFinish = useCallback(async () => {
        if (!centerPos || range < MIN_RANGE || range > MAX_RANGE) return;

        try {
            await addSource({
                sceneId,
                name: source.name,
                type: source.type,
                position: centerPos,
                direction: source.direction,
                range,
                intensity: source.intensity ?? 1.0,
                hasGradient: source.hasGradient
            }).unwrap();

            onComplete(true);
        } catch (error) {
            console.error('Failed to place source:', error);
            onComplete(false);
        }
    }, [centerPos, range, sceneId, source, addSource, onComplete]);

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
                    walls={walls}
                    gridConfig={gridConfig}
                />
            )}
        </Layer>
    );
};

SourceDrawingTool.displayName = 'SourceDrawingTool';
