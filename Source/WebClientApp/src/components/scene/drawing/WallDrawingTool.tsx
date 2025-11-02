import React, { useEffect, useState, useCallback, useRef } from 'react';
import { Group, Rect } from 'react-konva';
import type Konva from 'konva';
import { useGetSceneQuery, useUpdateSceneWallMutation } from '@/services/sceneApi';
import { snapToNearest, SnapMode } from '@/utils/structureSnapping';
import { VertexMarker } from './VertexMarker';
import { WallPreview } from './WallPreview';
import { SnapModeIndicator } from '../SnapModeIndicator';
import { StatusHintBar } from '../StatusHintBar';
import type { Point, Pole } from '@/types/domain';
import type { GridConfig } from '@/utils/gridCalculator';

export interface WallDrawingToolProps {
    sceneId: string;
    wallIndex: number;
    gridConfig: GridConfig;
    defaultHeight: number;
    onCancel: () => void;
}

export const WallDrawingTool: React.FC<WallDrawingToolProps> = ({
    sceneId,
    wallIndex,
    gridConfig,
    defaultHeight,
    onCancel
}) => {
    const [poles, setPoles] = useState<Pole[]>([]);
    const [previewPoint, setPreviewPoint] = useState<Point | null>(null);
    const [currentSnapMode, setCurrentSnapMode] = useState<SnapMode>(SnapMode.HalfSnap);

    const { data: scene } = useGetSceneQuery(sceneId);
    const wall = scene?.walls?.find(w => w.index === wallIndex);
    const [updateSceneWall] = useUpdateSceneWallMutation();

    // Debounced backend update (300ms)
    const updateTimeoutRef = useRef<NodeJS.Timeout | null>(null);

    const debouncedUpdateWall = useCallback((newPoles: Pole[]) => {
        if (updateTimeoutRef.current) {
            clearTimeout(updateTimeoutRef.current);
        }

        updateTimeoutRef.current = setTimeout(async () => {
            try {
                console.log('[WallDrawingTool] Updating wall with', newPoles.length, 'poles');
                await updateSceneWall({
                    sceneId,
                    wallIndex,
                    poles: newPoles
                }).unwrap();
            } catch (error) {
                console.error('[WallDrawingTool] Failed to update wall:', error);
            }
        }, 300);
    }, [sceneId, wallIndex, updateSceneWall]);

    // Cleanup timeout on unmount
    useEffect(() => {
        return () => {
            if (updateTimeoutRef.current) {
                clearTimeout(updateTimeoutRef.current);
            }
        };
    }, []);

    useEffect(() => {
        const handleKeyDown = (e: KeyboardEvent) => {
            if (e.key === 'Escape') {
                console.log('[WallDrawingTool] Canceling placement (Escape)');
                onCancel();
                return;
            }

            if (e.key === 'Enter') {
                if (poles.length >= 1) {
                    console.log('[WallDrawingTool] Finishing placement (Enter)');
                    onCancel();
                } else {
                    console.warn('[WallDrawingTool] Cannot finish - need at least 1 pole');
                }
                return;
            }

            if (e.ctrlKey && e.key === 'z') {
                e.preventDefault();
                if (poles.length > 0) {
                    const newPoles = poles.slice(0, -1);
                    console.log('[WallDrawingTool] Undo - removing last pole, now', newPoles.length, 'poles');
                    setPoles(newPoles);
                    debouncedUpdateWall(newPoles);
                }
                return;
            }
        };

        window.addEventListener('keydown', handleKeyDown);

        return () => {
            window.removeEventListener('keydown', handleKeyDown);
        };
    }, [poles, onCancel, debouncedUpdateWall]);

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

        const snapMode = e.evt.altKey && e.evt.ctrlKey
            ? SnapMode.QuarterSnap
            : e.evt.altKey
                ? SnapMode.Free
                : SnapMode.HalfSnap;

        setCurrentSnapMode(snapMode);

        const snappedPos = snapToNearest(stagePos, gridConfig, snapMode);
        setPreviewPoint(snappedPos);
    }, [gridConfig]);

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

        const snapMode = e.evt.altKey && e.evt.ctrlKey
            ? SnapMode.QuarterSnap
            : e.evt.altKey
                ? SnapMode.Free
                : SnapMode.HalfSnap;

        const snappedPos = snapToNearest(stagePos, gridConfig, snapMode);
        const newPole: Pole = {
            x: snappedPos.x,
            y: snappedPos.y,
            h: defaultHeight
        };
        const newPoles = [...poles, newPole];
        console.log('[WallDrawingTool] Pole placed at', snappedPos, ', total:', newPoles.length);
        setPoles(newPoles);
        debouncedUpdateWall(newPoles);
    }, [poles, gridConfig, defaultHeight, debouncedUpdateWall]);

    const handleDoubleClick = useCallback(() => {
        if (poles.length >= 1) {
            console.log('[WallDrawingTool] Finishing placement (double-click)');
            onCancel();
        }
    }, [poles, onCancel]);

    return (
        <>
            <Group>
                <Rect
                    x={-10000}
                    y={-10000}
                    width={20000}
                    height={20000}
                    fill="transparent"
                    onMouseMove={handleMouseMove}
                    onClick={handleClick}
                    onDblClick={handleDoubleClick}
                    listening={true}
                />

                {poles.map((pole, index) => (
                    <VertexMarker key={index} position={{ x: pole.x, y: pole.y }} />
                ))}

                <WallPreview
                    poles={poles}
                    previewPoint={previewPoint}
                    wall={wall}
                />

                {previewPoint && (
                    <VertexMarker position={previewPoint} preview />
                )}
            </Group>

            <SnapModeIndicator
                snapMode={currentSnapMode}
                visible={true}
            />
            <StatusHintBar
                mode="placement"
                visible={true}
            />
        </>
    );
};

WallDrawingTool.displayName = 'WallDrawingTool';
