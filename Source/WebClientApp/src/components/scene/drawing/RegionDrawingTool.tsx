import React, { useEffect, useState, useCallback } from 'react';
import { Group, Rect } from 'react-konva';
import type Konva from 'konva';
import { snapToNearest } from '@/utils/structureSnapping';
import { getSnapModeFromEvent } from '@/utils/snapUtils';
import { VertexMarker } from './VertexMarker';
import { RegionPreview } from '../RegionPreview';
import type { Point } from '@/types/domain';
import type { GridConfig } from '@/utils/gridCalculator';

const INTERACTION_RECT_SIZE = 20000;
const INTERACTION_RECT_OFFSET = -INTERACTION_RECT_SIZE / 2;

export interface RegionDrawingToolProps {
    sceneId: string;
    regionIndex: number;
    gridConfig: GridConfig;
    onCancel: () => void;
    onFinish: () => void;
    onVerticesChange?: (vertices: Point[]) => void;
    onLocalUndo?: () => void;
    canLocalUndo?: boolean;
    regionType: string;
    regionColor?: string;
}

export const RegionDrawingTool: React.FC<RegionDrawingToolProps> = ({
    sceneId,
    regionIndex,
    gridConfig,
    onCancel,
    onFinish,
    onVerticesChange,
    onLocalUndo,
    canLocalUndo,
    regionType,
    regionColor
}) => {
    const [vertices, setVertices] = useState<Point[]>([]);
    const [previewPoint, setPreviewPoint] = useState<Point | null>(null);

    const handleFinish = useCallback(async () => {
        if (vertices.length < 3) {
            console.warn('Cannot finish region with less than 3 vertices');
            return;
        }

        onFinish();
    }, [vertices, onFinish]);

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

            if ((e.ctrlKey || e.metaKey) && e.key === 'z' && canLocalUndo) {
                e.preventDefault();
                onLocalUndo?.();
                return;
            }
        };

        window.addEventListener('keydown', handleKeyDown);

        return () => {
            window.removeEventListener('keydown', handleKeyDown);
        };
    }, [onCancel, handleFinish, onLocalUndo, canLocalUndo]);

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

        const newVertices = [...vertices, snappedPos];
        setVertices(newVertices);
        onVerticesChange?.(newVertices);
    }, [vertices, gridConfig, onVerticesChange]);

    const handleDoubleClick = useCallback(() => {
        if (vertices.length >= 3) {
            handleFinish();
        }
    }, [vertices.length, handleFinish]);

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

                {vertices.map((vertex, index) => (
                    <VertexMarker key={index} position={vertex} />
                ))}

                <RegionPreview
                    vertices={vertices}
                    cursorPos={previewPoint ?? undefined}
                    color={regionColor}
                />

                {previewPoint && (
                    <VertexMarker position={previewPoint} preview />
                )}
            </Group>
        </>
    );
};

RegionDrawingTool.displayName = 'RegionDrawingTool';
