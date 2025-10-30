import React, { useEffect, useState, useCallback } from 'react';
import { Layer } from 'react-konva';
import type Konva from 'konva';
import { usePlaceSceneBarrierMutation } from '@/services/barrierApi';
import { snapToNearest, SnapMode } from '@/utils/structureSnapping';
import { VertexMarker } from './VertexMarker';
import { BarrierPreview } from './BarrierPreview';
import type { Point, Pole, Barrier } from '@/types/domain';
import type { GridConfig } from '@/utils/gridCalculator';

export interface BarrierDrawingToolProps {
    sceneId: string;
    barrier: Barrier;
    gridConfig: GridConfig;
    defaultHeight: number;
    onComplete: (success: boolean) => void;
    onCancel: () => void;
}

export const BarrierDrawingTool: React.FC<BarrierDrawingToolProps> = ({
    sceneId,
    barrier,
    gridConfig,
    defaultHeight,
    onComplete,
    onCancel
}) => {
    const [poles, setPoles] = useState<Pole[]>([]);
    const [previewPoint, setPreviewPoint] = useState<Point | null>(null);
    const [snapMode, setSnapMode] = useState<SnapMode>(SnapMode.HalfSnap);
    const [placeBarrier] = usePlaceSceneBarrierMutation();

    const handleFinish = useCallback(async () => {
        if (poles.length < 2) return;

        try {
            await placeBarrier({
                sceneId,
                body: {
                    barrierId: barrier.id,
                    poles,
                }
            }).unwrap();

            onComplete(true);
        } catch (error) {
            console.error('Failed to place barrier:', error);
            onComplete(false);
        }
    }, [poles, sceneId, barrier.id, placeBarrier, onComplete]);

    useEffect(() => {
        const handleKeyDown = (e: KeyboardEvent) => {
            if (e.key === 'Escape') {
                onCancel();
            } else if (e.key === 'Enter' && poles.length >= 2) {
                handleFinish();
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
    }, [poles, onCancel, handleFinish]);

    const handleMouseMove = useCallback((e: Konva.KonvaEventObject<MouseEvent>) => {
        const stage = e.target.getStage();
        if (!stage) return;

        const pointer = stage.getPointerPosition();
        if (!pointer) return;

        const scale = stage.scaleX();
        const stagePos = {
            x: (pointer.x - stage.x()) / scale,
            y: (pointer.y - stage.y()) / scale,
        };

        const snappedPos = snapToNearest(stagePos, gridConfig, snapMode);
        setPreviewPoint(snappedPos);
    }, [gridConfig, snapMode]);

    const handleClick = useCallback((e: Konva.KonvaEventObject<MouseEvent>) => {
        const stage = e.target.getStage();
        if (!stage) return;

        const pointer = stage.getPointerPosition();
        if (!pointer) return;

        const scale = stage.scaleX();
        const stagePos = {
            x: (pointer.x - stage.x()) / scale,
            y: (pointer.y - stage.y()) / scale,
        };

        const snappedPos = snapToNearest(stagePos, gridConfig, snapMode);
        const newPole: Pole = {
            x: snappedPos.x,
            y: snappedPos.y,
            h: defaultHeight
        };
        setPoles([...poles, newPole]);
    }, [poles, gridConfig, snapMode, defaultHeight]);

    const handleDoubleClick = useCallback(() => {
        if (poles.length >= 2) {
            handleFinish();
        }
    }, [poles.length, handleFinish]);

    return (
        <Layer
            onMouseMove={handleMouseMove}
            onClick={handleClick}
            onDblClick={handleDoubleClick}
            listening={true}
        >
            {poles.map((pole, index) => (
                <VertexMarker key={index} position={{ x: pole.x, y: pole.y }} />
            ))}

            <BarrierPreview
                poles={poles}
                previewPoint={previewPoint}
                barrier={barrier}
            />

            {previewPoint && (
                <VertexMarker position={previewPoint} preview />
            )}
        </Layer>
    );
};

BarrierDrawingTool.displayName = 'BarrierDrawingTool';
