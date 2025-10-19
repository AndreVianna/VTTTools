import React, { useEffect, useRef, useState, useCallback } from 'react';
import { Transformer, Rect } from 'react-konva';
import { useTheme } from '@mui/material/styles';
import Konva from 'konva';
import type { PlacedAsset } from '@/types/domain';
import type { GridConfig } from '@/utils/gridCalculator';
import {
    getPlacementBehavior,
    snapAssetPosition,
    validatePlacement,
} from '@/types/placement';

export interface TokenDragHandleProps {
    /** Placed assets on the canvas */
    placedAssets: PlacedAsset[];
    /** Currently selected asset ID (if any) */
    selectedAssetId: string | null;
    /** Callback when asset is selected */
    onAssetSelected: (assetId: string | null) => void;
    /** Callback when asset is moved */
    onAssetMoved: (assetId: string, position: { x: number; y: number }) => void;
    /** Callback when asset is deleted */
    onAssetDeleted: (assetId: string) => void;
    /** Current grid configuration */
    gridConfig: GridConfig;
    /** Konva Stage reference */
    stageRef: React.RefObject<Konva.Stage>;
}

export const TokenDragHandle: React.FC<TokenDragHandleProps> = ({
    placedAssets,
    selectedAssetId,
    onAssetSelected,
    onAssetMoved,
    onAssetDeleted,
    gridConfig,
    stageRef,
}) => {
    const theme = useTheme();
    const transformerRef = useRef<Konva.Transformer>(null);
    const selectionRectRef = useRef<Konva.Rect>(null);
    const [dragStartPos, setDragStartPos] = useState<{ x: number; y: number } | null>(null);

    const getSelectedNode = useCallback((): Konva.Node | null => {
        if (!selectedAssetId || !stageRef.current) return null;

        return stageRef.current.findOne(`#${selectedAssetId}`) ?? null;
    }, [selectedAssetId, stageRef]);

    useEffect(() => {
        const transformer = transformerRef.current;
        if (!transformer) return;

        const selectedNode = getSelectedNode();

        if (selectedNode) {
            transformer.nodes([selectedNode]);
            transformer.getLayer()?.batchDraw();
        } else {
            transformer.nodes([]);
        }
    }, [selectedAssetId, getSelectedNode]);

    const handleNodeClick = useCallback((e: Konva.KonvaEventObject<MouseEvent>) => {
        const clickedNode = e.target;

        if (clickedNode === clickedNode.getStage()) {
            onAssetSelected(null);
            return;
        }

        const assetId = clickedNode.id();
        if (assetId && assetId !== selectedAssetId) {
            onAssetSelected(assetId);
        }
    }, [selectedAssetId, onAssetSelected]);

    const handleDragStart = useCallback((e: Konva.KonvaEventObject<DragEvent>) => {
        const node = e.target;
        const position = node.position();
        setDragStartPos(position);
    }, []);

    const handleDragMove = useCallback((e: Konva.KonvaEventObject<DragEvent>) => {
        const node = e.target;
        const assetId = node.id();
        const placedAsset = placedAssets.find((a) => a.id === assetId);

        if (!placedAsset) return;

        const behavior = getPlacementBehavior(
            placedAsset.asset.kind,
            (placedAsset.asset as any).objectProps,
            (placedAsset.asset as any).creatureProps
        );

        const nodePos = node.position();
        const centerPos = {
            x: nodePos.x + placedAsset.size.width / 2,
            y: nodePos.y + placedAsset.size.height / 2,
        };

        const snappedCenter = snapAssetPosition(
            centerPos,
            placedAsset.size,
            behavior,
            gridConfig
        );

        node.position({
            x: snappedCenter.x - placedAsset.size.width / 2,
            y: snappedCenter.y - placedAsset.size.height / 2,
        });
    }, [placedAssets, gridConfig]);

    const handleDragEnd = useCallback((e: Konva.KonvaEventObject<DragEvent>) => {
        const node = e.target;
        const assetId = node.id();
        const placedAsset = placedAssets.find((a) => a.id === assetId);

        if (!placedAsset || !dragStartPos) return;

        const behavior = getPlacementBehavior(
            placedAsset.asset.kind,
            (placedAsset.asset as any).objectProps,
            (placedAsset.asset as any).creatureProps
        );

        const nodePos = node.position();
        const centerPos = {
            x: nodePos.x + placedAsset.size.width / 2,
            y: nodePos.y + placedAsset.size.height / 2,
        };

        const validation = validatePlacement(
            centerPos,
            placedAsset.size,
            behavior,
            placedAssets
                .filter((a) => a.id !== assetId)
                .map((a) => ({
                    x: a.position.x,
                    y: a.position.y,
                    width: a.size.width,
                    height: a.size.height,
                    allowOverlap: getPlacementBehavior(
                        a.asset.kind,
                        (a.asset as any).objectProps,
                        (a.asset as any).creatureProps
                    ).allowOverlap,
                })),
            gridConfig
        );

        if (validation.valid) {
            onAssetMoved(assetId, centerPos);
        } else {
            console.warn('Invalid drag placement:', validation.errors);
            node.position(dragStartPos);
        }

        setDragStartPos(null);
    }, [placedAssets, dragStartPos, gridConfig, onAssetMoved]);

    useEffect(() => {
        const handleKeyDown = (e: KeyboardEvent) => {
            if (!selectedAssetId) return;

            if (e.key === 'Delete' || e.key === 'Backspace') {
                e.preventDefault();
                onAssetDeleted(selectedAssetId);
                onAssetSelected(null);
            }
        };

        window.addEventListener('keydown', handleKeyDown);
        return () => window.removeEventListener('keydown', handleKeyDown);
    }, [selectedAssetId, onAssetDeleted, onAssetSelected]);

    useEffect(() => {
        const stage = stageRef.current;
        if (!stage) return;

        const handleStageClick = (e: Konva.KonvaEventObject<MouseEvent>) => {
            if (e.target === stage) {
                onAssetSelected(null);
            }
        };

        stage.on('click', handleStageClick);
        return () => {
            stage.off('click', handleStageClick);
        };
    }, [stageRef, onAssetSelected]);

    useEffect(() => {
        const stage = stageRef.current;
        if (!stage) return;

        placedAssets.forEach((placedAsset) => {
            const node = stage.findOne(`#${placedAsset.id}`);
            if (node) {
                const behavior = getPlacementBehavior(
                    placedAsset.asset.kind,
                    (placedAsset.asset as any).objectProps,
                    (placedAsset.asset as any).creatureProps
                );

                node.draggable(behavior.canMove);
                node.on('click', handleNodeClick);
                node.on('dragstart', handleDragStart);
                node.on('dragmove', handleDragMove);
                node.on('dragend', handleDragEnd);
            }
        });

        return () => {
            placedAssets.forEach((placedAsset) => {
                const node = stage.findOne(`#${placedAsset.id}`);
                if (node) {
                    node.off('click', handleNodeClick);
                    node.off('dragstart', handleDragStart);
                    node.off('dragmove', handleDragMove);
                    node.off('dragend', handleDragEnd);
                }
            });
        };
    }, [placedAssets, stageRef, handleNodeClick, handleDragStart, handleDragMove, handleDragEnd]);

    return (
        <>
            <Transformer
                ref={transformerRef}
                rotateEnabled={false}
                resizeEnabled={false}
                borderStroke={theme.palette.primary.main}
                borderStrokeWidth={2}
                anchorStroke={theme.palette.primary.main}
                anchorFill={theme.palette.background.paper}
                anchorSize={8}
            />

            <Rect
                ref={selectionRectRef}
                visible={false}
            />
        </>
    );
};

TokenDragHandle.displayName = 'TokenDragHandle';
