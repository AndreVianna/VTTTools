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
import type { useWallTransaction } from '@/hooks/useWallTransaction';
import { createPlacePoleAction } from '@/types/wallUndoActions';
import { canMergeWalls } from '@/utils/wallMergeUtils';
import type { MergeResult } from '@/utils/wallMergeUtils';
import { detectSplitPoints } from '@/utils/wallSplitUtils';
import type { SplitResult } from '@/utils/wallSplitUtils';

const INTERACTION_RECT_SIZE = 20000;
const INTERACTION_RECT_OFFSET = -INTERACTION_RECT_SIZE / 2;

export interface WallDrawingToolProps {
    sceneId: string;
    wallIndex: number;
    gridConfig: GridConfig;
    defaultHeight: number;
    onCancel: () => void;
    onFinish: () => void;
    onFinishWithMerge?: (mergeResult: MergeResult) => void;
    onFinishWithSplit?: (splitResult: SplitResult) => void;
    onPolesChange?: (poles: Pole[]) => void;
    wallTransaction: ReturnType<typeof useWallTransaction>;
}

export const WallDrawingTool: React.FC<WallDrawingToolProps> = ({
    sceneId,
    wallIndex,
    gridConfig,
    defaultHeight,
    onCancel,
    onFinish,
    onFinishWithMerge,
    onFinishWithSplit,
    onPolesChange,
    wallTransaction
}) => {
    const [poles, setPoles] = useState<Pole[]>([]);
    const [previewPoint, setPreviewPoint] = useState<Point | null>(null);

    const { data: scene } = useGetSceneQuery(sceneId);
    const wall = scene?.walls?.find(w => w.index === wallIndex);

    const handleFinish = useCallback(async () => {
        if (poles.length < 2) {
            console.warn('[WallDrawingTool] Cannot finish wall with < 2 poles');
            return;
        }

        if (!scene) {
            console.warn('[WallDrawingTool] Scene not loaded');
            return;
        }

        const newWallPoles = poles.map(p => ({ x: p.x, y: p.y }));
        const existingWalls = scene.walls || [];

        const mergeResult = canMergeWalls({
            newWallPoles,
            existingWalls,
            tolerance: 5
        });

        if (mergeResult.canMerge) {
            console.log('[WallDrawingTool] Merge detected:', {
                scenario: mergeResult.isClosed ? 'Scenario 5 (closed)' : 'Scenario 3 (merge)',
                targetWallIndex: mergeResult.targetWallIndex,
                wallsToDelete: mergeResult.wallsToDelete,
                mergedPoleCount: mergeResult.mergedPoles.length
            });

            if (onFinishWithMerge) {
                onFinishWithMerge(mergeResult);
            } else {
                console.warn('[WallDrawingTool] onFinishWithMerge callback not provided');
                onFinish();
            }
            return;
        }

        const splitResult = detectSplitPoints({
            newWallPoles,
            existingWalls,
            tolerance: 5
        });

        if (splitResult.needsSplit) {
            console.log('[WallDrawingTool] Split detected:', {
                scenario: splitResult.splits.length > 1 ? 'Scenario 8 (multiple)' : 'Scenario 6/7',
                splitCount: splitResult.splits.length,
                affectedWalls: splitResult.affectedWallIndices
            });

            if (onFinishWithSplit) {
                onFinishWithSplit(splitResult);
            } else {
                console.warn('[WallDrawingTool] onFinishWithSplit callback not provided');
                onFinish();
            }
            return;
        }

        console.log('[WallDrawingTool] No merge or split detected, normal placement (Scenario 1)');
        onFinish();
    }, [poles, scene, onFinish, onFinishWithMerge, onFinishWithSplit]);

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
        };

        window.addEventListener('keydown', handleKeyDown);

        return () => {
            window.removeEventListener('keydown', handleKeyDown);
        };
    }, [onCancel, handleFinish]);

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
        const poleIndex = poles.length;
        const newPoles = [...poles, newPole];

        const AUTO_CLOSE_TOLERANCE = 15 / scale;

        if (newPoles.length >= 3) {
            const firstPole = newPoles[0];
            const lastPole = newPoles[newPoles.length - 1];

            if (firstPole && lastPole) {
                const distance = Math.sqrt(
                    Math.pow(lastPole.x - firstPole.x, 2) +
                    Math.pow(lastPole.y - firstPole.y, 2)
                );

                if (distance <= AUTO_CLOSE_TOLERANCE) {
                    console.log('[WallDrawingTool] Auto-close triggered (Scenario 4)', {
                        distance: distance.toFixed(2),
                        tolerance: AUTO_CLOSE_TOLERANCE.toFixed(2),
                        scale: scale.toFixed(2),
                        poleCount: newPoles.length - 1
                    });

                    const closedPoles = newPoles.slice(0, -1);
                    setPoles(closedPoles);
                    onPolesChange?.(closedPoles);

                    wallTransaction.updateSegment(-1, { isClosed: true });

                    setTimeout(() => handleFinish(), 0);
                    return;
                }
            }
        }

        setPoles(newPoles);
        onPolesChange?.(newPoles);

        const action = createPlacePoleAction(
            poleIndex,
            newPole,
            (updatedPoles) => {
                setPoles(updatedPoles);
                onPolesChange?.(updatedPoles);
            },
            () => {
                let currentPoles: Pole[] = [];
                setPoles(p => {
                    currentPoles = p;
                    return p;
                });
                return currentPoles;
            },
            () => false
        );
        wallTransaction.pushLocalAction(action);
    }, [poles, gridConfig, defaultHeight, onPolesChange, wallTransaction, handleFinish]);

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
