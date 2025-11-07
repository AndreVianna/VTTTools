import React, { useEffect, useState, useCallback } from 'react';
import { Layer } from 'react-konva';
import type Konva from 'konva';
import { useAddSceneRegionMutation } from '@/services/sceneApi';
import { snapToNearest, SnapMode } from '@/utils/structureSnapping';
import { VertexMarker } from './VertexMarker';
import { RegionPreview } from './RegionPreview';
import type { Point, SceneRegion } from '@/types/domain';
import type { GridConfig } from '@/utils/gridCalculator';

export interface RegionDrawingToolProps {
    sceneId: string;
    region: SceneRegion;
    gridConfig: GridConfig;
    onComplete: (success: boolean) => void;
    onCancel: () => void;
}

export const RegionDrawingTool: React.FC<RegionDrawingToolProps> = ({
    sceneId,
    region,
    gridConfig,
    onComplete,
    onCancel
}) => {
    const [vertices, setVertices] = useState<Point[]>([]);
    const [previewVertex, setPreviewVertex] = useState<Point | null>(null);
    const [snapMode, setSnapMode] = useState<SnapMode>(SnapMode.HalfSnap);
    const [addRegion] = useAddSceneRegionMutation();

    const handleFinish = useCallback(async () => {
        if (vertices.length < 3) return;

        try {
            await addRegion({
                sceneId,
                name: region.name,
                type: region.type,
                vertices,
                value: region.value ?? 0,
                ...(region.label && { label: region.label }),
                ...(region.color && { color: region.color })
            }).unwrap();

            onComplete(true);
        } catch (error) {
            console.error('Failed to place region:', error);
            onComplete(false);
        }
    }, [vertices, sceneId, region, addRegion, onComplete]);

    useEffect(() => {
        const handleKeyDown = (e: KeyboardEvent) => {
            if (e.key === 'Escape') {
                onCancel();
            } else if (e.key === 'Enter' && vertices.length >= 3) {
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
    }, [vertices, onCancel, handleFinish]);

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
        setPreviewVertex(snappedPos);
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
        setVertices([...vertices, snappedPos]);
    }, [vertices, gridConfig, snapMode]);

    const handleDoubleClick = useCallback(() => {
        if (vertices.length >= 3) {
            handleFinish();
        }
    }, [vertices.length, handleFinish]);

    return (
        <Layer
            onMouseMove={handleMouseMove}
            onClick={handleClick}
            onDblClick={handleDoubleClick}
            listening={true}
        >
            {vertices.map((vertex, index) => (
                <VertexMarker key={index} position={vertex} />
            ))}

            <RegionPreview
                vertices={vertices}
                previewVertex={previewVertex}
                region={region}
            />

            {previewVertex && (
                <VertexMarker position={previewVertex} preview />
            )}
        </Layer>
    );
};

RegionDrawingTool.displayName = 'RegionDrawingTool';
