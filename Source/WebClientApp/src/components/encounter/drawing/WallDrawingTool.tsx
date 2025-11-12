import type React from 'react';
import { useCallback, useEffect, useState } from 'react';
import type Konva from 'konva';
import { Group, Rect } from 'react-konva';

import { useGetEncounterQuery } from '@/services/encounterApi';
import { createPlacePoleAction } from '@/types/wallUndoActions';
import type { Point, Pole } from '@/types/domain';
import { getSnapModeFromEvent } from '@/utils/snapUtils';
import { snapToNearest } from '@/utils/structureSnapping';
import type { GridConfig } from '@/utils/gridCalculator';
import { decomposeSelfIntersectingPath } from '@/utils/wallPlanarUtils';

import type { useWallTransaction } from '@/hooks/useWallTransaction';

import { VertexMarker } from './VertexMarker';
import { WallPreview } from './WallPreview';

const INTERACTION_RECT_SIZE = 20000;
const INTERACTION_RECT_OFFSET = -INTERACTION_RECT_SIZE / 2;

export interface WallDrawingToolProps {
    encounterId: string;
    wallIndex: number;
    gridConfig: GridConfig;
    defaultHeight: number;
    onCancel: () => void;
    onFinish: () => void;
    onPolesChange?: (poles: Pole[]) => void;
    wallTransaction: ReturnType<typeof useWallTransaction>;
}

export const WallDrawingTool: React.FC<WallDrawingToolProps> = ({
    encounterId,
    wallIndex,
    gridConfig,
    defaultHeight,
    onCancel,
    onFinish,
    onPolesChange,
    wallTransaction
}) => {
    const [poles, setPoles] = useState<Pole[]>([]);
    const [previewPoint, setPreviewPoint] = useState<Point | null>(null);

    const { data: encounter } = useGetEncounterQuery(encounterId);
    const wall = encounter?.walls?.find(w => w.index === wallIndex);

    const handleFinish = useCallback(async () => {
        if (poles.length < 2) return;
        if (!encounter) return;

        const TOLERANCE = 5;
        const polePoints = poles.map(p => ({ x: p.x, y: p.y }));
        const { closedWalls, openSegments } = decomposeSelfIntersectingPath(polePoints, TOLERANCE);

        // Create all segments from decomposition
        if (closedWalls.length > 0 || openSegments.length > 0) {
            const allSegments = [
                ...closedWalls.map(wallPoles => ({
                    tempId: -1,
                    wallIndex: null as number | null,
                    name: wall?.name || '',
                    poles: wallPoles.map(p => ({ x: p.x, y: p.y, h: defaultHeight })),
                    isClosed: true,
                    visibility: wall?.visibility || 0,
                    material: wall?.material,
                    color: wall?.color
                })),
                ...openSegments.map(segmentPoles => ({
                    tempId: -1,
                    wallIndex: null as number | null,
                    name: wall?.name || '',
                    poles: segmentPoles.map(p => ({ x: p.x, y: p.y, h: defaultHeight })),
                    isClosed: false,
                    visibility: wall?.visibility || 0,
                    material: wall?.material,
                    color: wall?.color
                }))
            ];

            wallTransaction.setAllSegments(allSegments);
            onFinish();
            return;
        }

        // Fallback: no decomposition needed, just finish
        onFinish();
    }, [poles, encounter, wall, wallTransaction, defaultHeight, onFinish]);

    useEffect(() => {
        const handleKeyDown = (e: KeyboardEvent) => {
            if (e.key === 'Escape') {
                onCancel();
                return;
            }

            if (e.key === 'Enter' && !e.defaultPrevented) {
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
    }, [poles, gridConfig, defaultHeight, onPolesChange, wallTransaction]);

    const handleDoubleClick = useCallback(() => {
        if (poles.length >= 1) {
            handleFinish();
        }
    }, [poles.length, handleFinish]);

    return (
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
    );
};

WallDrawingTool.displayName = 'WallDrawingTool';
