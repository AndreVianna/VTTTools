import React, { useEffect, useRef, useState, useCallback } from 'react';
import { Layer, Transformer, Rect, Group, Circle, Line } from 'react-konva';
import { useTheme } from '@mui/material/styles';
import Konva from 'konva';
import type { PlacedAsset } from '@/types/domain';
import type { GridConfig } from '@/utils/gridCalculator';
import { GridType } from '@/utils/gridCalculator';
import {
    getPlacementBehavior,
    validatePlacement,
} from '@/types/placement';

/**
 * Render invalid placement indicator (red X)
 */
const renderInvalidIndicator = (position: { x: number; y: number }) => (
    <Group x={position.x} y={position.y}>
        <Circle
            radius={24}
            fill="rgba(220, 38, 38, 0.9)"
            stroke="white"
            strokeWidth={2}
        />
        <Line
            points={[-12, -12, 12, 12]}
            stroke="white"
            strokeWidth={3}
            lineCap="round"
        />
        <Line
            points={[12, -12, -12, 12]}
            stroke="white"
            strokeWidth={3}
            lineCap="round"
        />
    </Group>
);

/**
 * Snap position to grid based on asset size and snap mode
 * - Small assets (<= 0.5 cell): Base snap 0.5 cells
 * - Medium/Large assets (> 0.5 cell): Base snap 1 cell
 * - Half-step mode: Divides base by 2
 * Note: assetSizePixels is in PIXELS (from placedAsset.size)
 */
const snapToGridCenter = (
    position: { x: number; y: number },
    assetSizePixels: { width: number; height: number },
    gridConfig: GridConfig,
    snapMode: 'free' | 'grid' | 'half-step'
): { x: number; y: number } => {
    if (snapMode === 'free' || gridConfig.type === GridType.NoGrid) {
        return position;
    }

    const { cellWidth, cellHeight, offsetX, offsetY } = gridConfig;

    // Convert asset size from pixels to cells
    const assetWidthCells = assetSizePixels.width / cellWidth;
    const assetHeightCells = assetSizePixels.height / cellHeight;

    // Base snap interval per dimension: <= 0.5 → 0.5 cells, > 0.5 → 1.0 cells
    const getBaseSnapIntervalCells = (sizeInCells: number) =>
        sizeInCells <= 0.5 ? 0.5 : 1.0;

    const baseSnapWidthCells = getBaseSnapIntervalCells(assetWidthCells);
    const baseSnapHeightCells = getBaseSnapIntervalCells(assetHeightCells);

    // Apply mode multiplier
    const multiplier = snapMode === 'half-step' ? 0.5 : 1.0;
    const snapWidthCells = baseSnapWidthCells * multiplier;
    const snapHeightCells = baseSnapHeightCells * multiplier;

    // Convert back to pixels
    const snapWidth = snapWidthCells * cellWidth;
    const snapHeight = snapHeightCells * cellHeight;

    // Offset = half asset size
    const offsetWidthPixels = assetSizePixels.width / 2;
    const offsetHeightPixels = assetSizePixels.height / 2;

    // Find nearest snap position
    const snapX = Math.round((position.x - offsetX - offsetWidthPixels) / snapWidth) * snapWidth + offsetX + offsetWidthPixels;
    const snapY = Math.round((position.y - offsetY - offsetHeightPixels) / snapHeight) * snapHeight + offsetY + offsetHeightPixels;

    return { x: snapX, y: snapY };
};

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
    /** Whether placement mode is active (disable layer listening) */
    isPlacementMode?: boolean;
    /** Whether to enable drag-based movement (default: true, set false for click-to-pick-up) */
    enableDragMove?: boolean;
    /** Callback when handlers are attached and component is ready */
    onReady?: () => void;
}

export const TokenDragHandle: React.FC<TokenDragHandleProps> = ({
    placedAssets,
    selectedAssetId,
    onAssetSelected,
    onAssetMoved,
    onAssetDeleted,
    gridConfig,
    stageRef,
    isPlacementMode = false,
    enableDragMove = true,
    onReady,
    snapMode,
}) => {
    const theme = useTheme();
    const transformerRef = useRef<Konva.Transformer>(null);
    const selectionRectRef = useRef<Konva.Rect>(null);
    const dragStartPosRef = useRef<{ x: number; y: number } | null>(null);
    const [isDragValid, setIsDragValid] = useState(true);
    const [draggedAssetInfo, setDraggedAssetInfo] = useState<{ id: string; position: { x: number; y: number }; size: { width: number; height: number } } | null>(null);
    const hasCalledReadyRef = useRef<boolean>(false);
    const snapModeRef = useRef(snapMode);

    // Update snapModeRef when snapMode changes
    useEffect(() => {
        snapModeRef.current = snapMode;
    }, [snapMode]);

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
        dragStartPosRef.current = position;
        setIsDragValid(true);

        // Move to drag-preview group to render above all other assets
        const stage = stageRef.current;
        if (stage) {
            const dragPreviewGroup = stage.findOne('.drag-preview');
            if (dragPreviewGroup) {
                node.moveTo(dragPreviewGroup as Konva.Container);
            }
        }
    }, [stageRef]);

    const handleDragMove = useCallback((e: Konva.KonvaEventObject<DragEvent>) => {
        const node = e.target;
        const assetId = node.id();
        const placedAsset = placedAssets.find((a) => a.id === assetId);

        if (!placedAsset) return;

        const assetWithProps = placedAsset.asset as any;
        const behavior = getPlacementBehavior(
            placedAsset.asset.kind,
            placedAsset.asset.kind === 'Object' ? assetWithProps.properties : undefined,
            placedAsset.asset.kind === 'Creature' ? assetWithProps.properties : undefined
        );

        const nodePos = node.position();
        const centerPos = {
            x: nodePos.x + placedAsset.size.width / 2,
            y: nodePos.y + placedAsset.size.height / 2,
        };

        // Use size-aware snapping with keyboard mode support (use ref for current value)
        const snappedCenter = snapToGridCenter(centerPos, placedAsset.size, gridConfig, snapModeRef.current);

        node.position({
            x: snappedCenter.x - placedAsset.size.width / 2,
            y: snappedCenter.y - placedAsset.size.height / 2,
        });

        // Validate placement for visual feedback
        const validation = validatePlacement(
            snappedCenter,
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
                        a.asset.kind === 'Object' ? (a.asset as any).properties : undefined,
                        a.asset.kind === 'Creature' ? (a.asset as any).properties : undefined
                    ).allowOverlap,
                })),
            gridConfig
        );

        setIsDragValid(validation.valid);
        setDraggedAssetInfo({
            id: assetId,
            position: snappedCenter,
            size: placedAsset.size
        });
    }, [placedAssets, gridConfig]);

    const handleDragEnd = useCallback((e: Konva.KonvaEventObject<DragEvent>) => {
        const node = e.target;
        const assetId = node.id();
        const placedAsset = placedAssets.find((a) => a.id === assetId);

        if (!placedAsset || !dragStartPosRef.current) return;

        // Move asset back to its proper group
        const stage = stageRef.current;
        if (stage) {
            const targetGroupName = placedAsset.layer;
            const targetGroup = stage.findOne(`.${targetGroupName}`);
            if (targetGroup) {
                node.moveTo(targetGroup as Konva.Container);
            }
        }

        const behavior = getPlacementBehavior(
            placedAsset.asset.kind,
            placedAsset.asset.kind === 'Object' ? (placedAsset.asset as any).properties : undefined,
            placedAsset.asset.kind === 'Creature' ? (placedAsset.asset as any).properties : undefined
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
                        a.asset.kind === 'Object' ? (a.asset as any).properties : undefined,
                        a.asset.kind === 'Creature' ? (a.asset as any).properties : undefined
                    ).allowOverlap,
                })),
            gridConfig
        );

        if (validation.valid) {
            onAssetMoved(assetId, centerPos);
        } else {
            console.warn('Invalid drag placement:', validation.errors);
            node.position(dragStartPosRef.current);
        }

        dragStartPosRef.current = null;
        setDraggedAssetInfo(null);
        setIsDragValid(true);
    }, [placedAssets, gridConfig, onAssetMoved, stageRef]);

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
        // Skip stage click handler if drag-move is disabled
        if (!enableDragMove) return;

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
    }, [enableDragMove, stageRef, onAssetSelected]);

    // Track which assets have handlers attached
    const attachedHandlersRef = useRef<Set<string>>(new Set());

    useEffect(() => {
        // Skip attaching drag handlers if drag-move is disabled
        if (!enableDragMove) return;

        const stage = stageRef.current;
        if (!stage) return;

        // Wait for next frame to ensure Konva has rendered all nodes
        const frameId = requestAnimationFrame(() => {
            const currentAssetIds = new Set(placedAssets.map(a => a.id));

            // Remove handlers from assets that no longer exist
            attachedHandlersRef.current.forEach(assetId => {
                if (!currentAssetIds.has(assetId)) {
                    const node = stage.findOne(`#${assetId}`);
                    if (node) {
                        node.off('click', handleNodeClick);
                        node.off('dragstart', handleDragStart);
                        node.off('dragmove', handleDragMove);
                        node.off('dragend', handleDragEnd);
                    }
                    attachedHandlersRef.current.delete(assetId);
                }
            });

            // Attach handlers to new assets
            placedAssets.forEach((placedAsset) => {
                // Skip if already attached
                if (attachedHandlersRef.current.has(placedAsset.id)) return;

                const node = stage.findOne(`#${placedAsset.id}`);
                if (node) {
                    const behavior = getPlacementBehavior(
                        placedAsset.asset.kind,
                        placedAsset.asset.kind === 'Object' ? (placedAsset.asset as any).properties : undefined,
                        placedAsset.asset.kind === 'Creature' ? (placedAsset.asset as any).properties : undefined
                    );

                    node.draggable(behavior.canMove);
                    node.on('click', handleNodeClick);
                    node.on('dragstart', handleDragStart);
                    node.on('dragmove', handleDragMove);
                    node.on('dragend', handleDragEnd);
                    attachedHandlersRef.current.add(placedAsset.id);
                }
            });

            if (!hasCalledReadyRef.current && onReady) {
                hasCalledReadyRef.current = true;
                onReady();
            }
        });

        return () => {
            cancelAnimationFrame(frameId);
        };
    }, [enableDragMove, placedAssets, stageRef, handleNodeClick, handleDragStart, handleDragMove, handleDragEnd, onReady]);

    return (
        <Layer name="ui-overlay" listening={!isPlacementMode && enableDragMove}>
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

            {/* Invalid placement indicator during drag */}
            {draggedAssetInfo && !isDragValid && renderInvalidIndicator(draggedAssetInfo.position)}
        </Layer>
    );
};

TokenDragHandle.displayName = 'TokenDragHandle';
