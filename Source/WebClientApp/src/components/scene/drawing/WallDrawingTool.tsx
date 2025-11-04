import React, { useEffect, useState, useCallback } from 'react';
import { Group, Rect } from 'react-konva';
import type Konva from 'konva';
import { useGetSceneQuery } from '@/services/sceneApi';
import { snapToNearest } from '@/utils/structureSnapping';
import { getSnapModeFromEvent } from '@/utils/snapUtils';
import { VertexMarker } from './VertexMarker';
import { WallPreview } from './WallPreview';
import type { Point, Pole } from '@/types/domain';
import type { GridConfig } from '@/utils/gridCalculator';

const INTERACTION_RECT_SIZE = 20000;
const INTERACTION_RECT_OFFSET = -INTERACTION_RECT_SIZE / 2;

export interface WallDrawingToolProps {
    sceneId: string;
    wallIndex: number;
    gridConfig: GridConfig;
    defaultHeight: number;
    onCancel: () => void;
    onFinish: () => void;
    onPolesChange?: (poles: Pole[]) => void;
}

export const WallDrawingTool: React.FC<WallDrawingToolProps> = ({
    sceneId,
    wallIndex,
    gridConfig,
    defaultHeight,
    onCancel,
    onFinish,
    onPolesChange
}) => {
    const [poles, setPoles] = useState<Pole[]>([]);
    const [previewPoint, setPreviewPoint] = useState<Point | null>(null);

    const { data: scene } = useGetSceneQuery(sceneId);
    const wall = scene?.walls?.find(w => w.index === wallIndex);

    const handleFinish = useCallback(async () => {
        if (poles.length < 1) {
            console.warn('Cannot finish wall with no poles');
            return;
        }

        onFinish();
    }, [poles, onFinish]);

    useEffect(() => {
        const handleKeyDown = (e: KeyboardEvent) => {
            if (e.key === 'Escape') {
                onCancel();
                return;
            }

            if (e.key === 'Enter') {
                handleFinish();
                return;
            }

            if (e.ctrlKey && e.key === 'z') {
                e.preventDefault();
                if (poles.length > 0) {
                    const newPoles = poles.slice(0, -1);
                    setPoles(newPoles);
                    onPolesChange?.(newPoles);
                }
                return;
            }
        };

        window.addEventListener('keydown', handleKeyDown);

        return () => {
            window.removeEventListener('keydown', handleKeyDown);
        };
    }, [poles, onCancel, onPolesChange, handleFinish]);

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

        const snapMode = getSnapModeFromEvent(e.evt);
        const snappedPos = snapToNearest(stagePos, gridConfig, snapMode);
        setPreviewPoint(snappedPos);
    }, [gridConfig]);

    const handleClick = useCallback((e: Konva.KonvaEventObject<MouseEvent>) => {
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
        const newPole: Pole = {
            x: snappedPos.x,
            y: snappedPos.y,
            h: defaultHeight
        };
        const newPoles = [...poles, newPole];
        setPoles(newPoles);

        onPolesChange?.(newPoles);
    }, [poles, gridConfig, defaultHeight, onPolesChange]);

    const handleDoubleClick = useCallback(() => {
        if (poles.length >= 1) {
            handleFinish();
        }
    }, [poles.length, handleFinish]);

    return (
        <>
            <Group>
                <Rect
                    x={INTERACTION_RECT_OFFSET}
                    y={INTERACTION_RECT_OFFSET}
                    width={INTERACTION_RECT_SIZE}
                    height={INTERACTION_RECT_SIZE}
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
        </>
    );
};

WallDrawingTool.displayName = 'WallDrawingTool';
