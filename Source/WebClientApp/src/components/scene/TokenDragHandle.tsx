// GENERATED: 2025-10-11 by Claude Code Phase 6
// EPIC: EPIC-001 Phase 6 - Scene Editor Tokens, Undo/Redo, Offline
// LAYER: UI (Component)

/**
 * TokenDragHandle Component
 * Provides interaction layer for placed tokens:
 * - Select tokens with click
 * - Drag tokens with mouse
 * - Delete tokens with Delete/Backspace keys
 * - Visual feedback with Konva Transformer
 * - Snap-to-grid during drag
 * ACCEPTANCE_CRITERION: AC-02 - Drag-and-drop with snap-to-grid working
 */

import React, { useEffect, useRef, useState, useCallback } from 'react';
import { Transformer, Rect } from 'react-konva';
import Konva from 'konva';
import type { PlacedAsset } from '@/types/domain';
import type { GridConfig } from '@/utils/gridCalculator';
import {
    getPlacementBehavior,
    snapAssetPosition,
    validatePlacement,
} from '@/types/placement';

/**
 * TokenDragHandle component props
 */
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

/**
 * TokenDragHandle Component
 * Manages token selection and dragging with Transformer
 */
export const TokenDragHandle: React.FC<TokenDragHandleProps> = ({
    placedAssets,
    selectedAssetId,
    onAssetSelected,
    onAssetMoved,
    onAssetDeleted,
    gridConfig,
    stageRef,
}) => {
    const transformerRef = useRef<Konva.Transformer>(null);
    const selectionRectRef = useRef<Konva.Rect>(null);

    // Track drag start position for validation
    const [dragStartPos, setDragStartPos] = useState<{ x: number; y: number } | null>(null);

    /**
     * Get selected asset node from stage
     */
    const getSelectedNode = useCallback((): Konva.Node | null => {
        if (!selectedAssetId || !stageRef.current) return null;

        return stageRef.current.findOne(`#${selectedAssetId}`) ?? null;
    }, [selectedAssetId, stageRef]);

    /**
     * Update transformer when selection changes
     */
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

    /**
     * Handle node click to select asset
     */
    const handleNodeClick = useCallback((e: Konva.KonvaEventObject<MouseEvent>) => {
        const clickedNode = e.target;

        // Clicked on stage (deselect)
        if (clickedNode === clickedNode.getStage()) {
            onAssetSelected(null);
            return;
        }

        // Clicked on an asset
        const assetId = clickedNode.id();
        if (assetId && assetId !== selectedAssetId) {
            onAssetSelected(assetId);
        }
    }, [selectedAssetId, onAssetSelected]);

    /**
     * Handle drag start
     */
    const handleDragStart = useCallback((e: Konva.KonvaEventObject<DragEvent>) => {
        const node = e.target;
        const position = node.position();
        setDragStartPos(position);
    }, []);

    /**
     * Handle drag move with snap-to-grid
     */
    const handleDragMove = useCallback((e: Konva.KonvaEventObject<DragEvent>) => {
        const node = e.target;
        const assetId = node.id();
        const placedAsset = placedAssets.find((a) => a.id === assetId);

        if (!placedAsset) return;

        // Get placement behavior
        const behavior = getPlacementBehavior(
            placedAsset.asset.kind,
            (placedAsset.asset as any).objectProps,
            (placedAsset.asset as any).creatureProps
        );

        // Current center position (node position is top-left)
        const nodePos = node.position();
        const centerPos = {
            x: nodePos.x + placedAsset.size.width / 2,
            y: nodePos.y + placedAsset.size.height / 2,
        };

        // Snap to grid
        const snappedCenter = snapAssetPosition(
            centerPos,
            placedAsset.size,
            behavior,
            gridConfig
        );

        // Update node position (convert back to top-left)
        node.position({
            x: snappedCenter.x - placedAsset.size.width / 2,
            y: snappedCenter.y - placedAsset.size.height / 2,
        });
    }, [placedAssets, gridConfig]);

    /**
     * Handle drag end with validation
     */
    const handleDragEnd = useCallback((e: Konva.KonvaEventObject<DragEvent>) => {
        const node = e.target;
        const assetId = node.id();
        const placedAsset = placedAssets.find((a) => a.id === assetId);

        if (!placedAsset || !dragStartPos) return;

        // Get placement behavior
        const behavior = getPlacementBehavior(
            placedAsset.asset.kind,
            (placedAsset.asset as any).objectProps,
            (placedAsset.asset as any).creatureProps
        );

        // Current center position
        const nodePos = node.position();
        const centerPos = {
            x: nodePos.x + placedAsset.size.width / 2,
            y: nodePos.y + placedAsset.size.height / 2,
        };

        // Validate placement
        const validation = validatePlacement(
            centerPos,
            placedAsset.size,
            behavior,
            placedAssets
                .filter((a) => a.id !== assetId) // Exclude self
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
            // Valid placement - notify parent
            onAssetMoved(assetId, centerPos);
        } else {
            // Invalid placement - revert to start position
            console.warn('Invalid drag placement:', validation.errors);
            node.position(dragStartPos);
        }

        setDragStartPos(null);
    }, [placedAssets, dragStartPos, gridConfig, onAssetMoved]);

    /**
     * Handle keyboard events (Delete/Backspace to delete selected asset)
     */
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

    /**
     * Handle stage click to deselect
     */
    useEffect(() => {
        const stage = stageRef.current;
        if (!stage) return;

        const handleStageClick = (e: Konva.KonvaEventObject<MouseEvent>) => {
            // Clicked on stage background (not on a node)
            if (e.target === stage) {
                onAssetSelected(null);
            }
        };

        stage.on('click', handleStageClick);
        return () => {
            stage.off('click', handleStageClick);
        };
    }, [stageRef, onAssetSelected]);

    /**
     * Make asset nodes draggable and attach event handlers
     */
    useEffect(() => {
        const stage = stageRef.current;
        if (!stage) return;

        placedAssets.forEach((placedAsset) => {
            const node = stage.findOne(`#${placedAsset.id}`);
            if (node) {
                // Get placement behavior
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

        // Cleanup
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
            {/* Transformer for visual feedback on selected asset */}
            <Transformer
                ref={transformerRef}
                rotateEnabled={false} // Disable rotation for Phase 6
                resizeEnabled={false} // Disable resize for Phase 6
                borderStroke="#2196f3"
                borderStrokeWidth={2}
                anchorStroke="#2196f3"
                anchorFill="#fff"
                anchorSize={8}
            />

            {/* Hidden selection rect (not rendered, used for programmatic selection) */}
            <Rect
                ref={selectionRectRef}
                visible={false}
            />
        </>
    );
};

TokenDragHandle.displayName = 'TokenDragHandle';
