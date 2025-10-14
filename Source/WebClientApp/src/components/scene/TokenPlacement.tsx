// GENERATED: 2025-10-11 by Claude Code Phase 6
// EPIC: EPIC-001 Phase 6 - Scene Editor Tokens, Undo/Redo, Offline
// LAYER: UI (Component)

/**
 * TokenPlacement Component
 * Handles placing assets from the library onto the Konva canvas
 * Features:
 * - Drag asset from asset library onto scene
 * - Render as Konva Image with snap-to-grid
 * - Support for multi-resource assets (Token role for display)
 * - Z-index management by layer (Structure, Objects, Agents)
 * ACCEPTANCE_CRITERION: AC-01 - Token placement from asset library functional
 * ACCEPTANCE_CRITERION: AC-02 - Drag-and-drop with snap-to-grid working
 */

import React, { useState, useEffect, useCallback } from 'react';
import { Layer, Image as KonvaImage } from 'react-konva';
import Konva from 'konva';
import type { Asset, PlacedAsset } from '@/types/domain';
import type { GridConfig } from '@/utils/gridCalculator';
import {
    getPlacementBehavior,
    calculateAssetSize,
    snapAssetPosition,
    validatePlacement,
} from '@/types/placement';
import { LayerName } from '@/services/layerManager';

/**
 * TokenPlacement component props
 */
export interface TokenPlacementProps {
    /** Assets to place on canvas (managed by parent) */
    placedAssets: PlacedAsset[];
    /** Callback when new asset is placed */
    onAssetPlaced: (asset: PlacedAsset) => void;
    /** Callback when asset is moved */
    onAssetMoved: (assetId: string, position: { x: number; y: number }) => void;
    /** Callback when asset is deleted */
    onAssetDeleted: (assetId: string) => void;
    /** Current grid configuration */
    gridConfig: GridConfig;
    /** Asset being dragged from library (if any) */
    draggedAsset: Asset | null;
    /** Callback when drag completes */
    onDragComplete: () => void;
}

/**
 * Get Token resource URL from asset
 * Prioritizes Token role, falls back to first Display resource
 */
const getTokenImageUrl = (asset: Asset): string | null => {
    // Find Token role resource
    const tokenResource = asset.resources.find((r) => r.role === 1); // ResourceRole.Token
    if (tokenResource?.resource) {
        return tokenResource.resource.path;
    }

    // Fallback to Display role
    const displayResource = asset.resources.find((r) => r.role === 2); // ResourceRole.Display
    if (displayResource?.resource) {
        return displayResource.resource.path;
    }

    // No image available
    return null;
};

/**
 * Determine layer name based on asset kind
 */
const getAssetLayer = (asset: Asset): LayerName => {
    if (asset.kind === 'Creature') {
        return LayerName.Agents; // Characters and monsters
    }

    // Objects can go to Structure or Objects layer based on properties
    const objectAsset = asset as any; // Type cast for objectProps
    if (objectAsset.objectProps?.isOpaque) {
        return LayerName.Structure; // Walls, doors (blocking)
    }

    return LayerName.Objects; // Furniture, decorations
};

/**
 * TokenPlacement Component
 * Manages rendering placed assets as Konva Images
 */
export const TokenPlacement: React.FC<TokenPlacementProps> = ({
    placedAssets,
    onAssetPlaced,
    onAssetMoved: _onAssetMoved,
    onAssetDeleted: _onAssetDeleted,
    gridConfig,
    draggedAsset,
    onDragComplete,
}) => {
    // Track cursor position for preview
    const [cursorPosition, setCursorPosition] = useState<{ x: number; y: number } | null>(null);
    const [previewValid, setPreviewValid] = useState(true);

    // Image cache for performance
    const [imageCache, setImageCache] = useState<Map<string, HTMLImageElement>>(new Map());

    /**
     * Load image and cache it
     */
    const loadImage = useCallback((url: string): Promise<HTMLImageElement> => {
        return new Promise((resolve, reject) => {
            const img = new window.Image();
            img.crossOrigin = 'anonymous';
            img.onload = () => resolve(img);
            img.onerror = reject;
            img.src = url;
        });
    }, []);

    /**
     * Preload images for all placed assets
     */
    useEffect(() => {
        const loadImages = async () => {
            const newCache = new Map(imageCache);

            for (const placedAsset of placedAssets) {
                const imageUrl = getTokenImageUrl(placedAsset.asset);
                if (imageUrl && !newCache.has(placedAsset.assetId)) {
                    try {
                        const img = await loadImage(imageUrl);
                        newCache.set(placedAsset.assetId, img);
                    } catch (error) {
                        console.error(`Failed to load image for asset ${placedAsset.assetId}:`, error);
                    }
                }
            }

            // Load dragged asset preview
            if (draggedAsset) {
                const imageUrl = getTokenImageUrl(draggedAsset);
                if (imageUrl && !newCache.has(draggedAsset.id)) {
                    try {
                        const img = await loadImage(imageUrl);
                        newCache.set(draggedAsset.id, img);
                    } catch (error) {
                        console.error(`Failed to load preview image for asset ${draggedAsset.id}:`, error);
                    }
                }
            }

            setImageCache(newCache);
        };

        loadImages();
    }, [placedAssets, draggedAsset, loadImage, imageCache]);

    /**
     * Handle canvas mouse move for placement preview
     */
    const handleMouseMove = useCallback((e: Konva.KonvaEventObject<MouseEvent>) => {
        if (!draggedAsset) return;

        const stage = e.target.getStage();
        if (!stage) return;

        const pointer = stage.getPointerPosition();
        if (!pointer) return;

        // Convert to stage coordinates (account for zoom/pan)
        const scale = stage.scaleX();
        const position = {
            x: (pointer.x - stage.x()) / scale,
            y: (pointer.y - stage.y()) / scale,
        };

        setCursorPosition(position);

        // Validate placement
        const behavior = getPlacementBehavior(
            draggedAsset.kind,
            (draggedAsset as any).objectProps,
            (draggedAsset as any).creatureProps
        );

        const size = calculateAssetSize(
            (draggedAsset as any).objectProps?.size || (draggedAsset as any).creatureProps?.size,
            gridConfig
        );

        const snappedPosition = snapAssetPosition(position, size, behavior, gridConfig);

        const validation = validatePlacement(
            snappedPosition,
            size,
            behavior,
            placedAssets.map((a) => ({
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

        setPreviewValid(validation.valid);
    }, [draggedAsset, gridConfig, placedAssets]);

    /**
     * Handle canvas click to place asset
     */
    const handleClick = useCallback((_e: Konva.KonvaEventObject<MouseEvent>) => {
        if (!draggedAsset || !cursorPosition) return;

        const behavior = getPlacementBehavior(
            draggedAsset.kind,
            (draggedAsset as any).objectProps,
            (draggedAsset as any).creatureProps
        );

        const size = calculateAssetSize(
            (draggedAsset as any).objectProps?.size || (draggedAsset as any).creatureProps?.size,
            gridConfig
        );

        const snappedPosition = snapAssetPosition(cursorPosition, size, behavior, gridConfig);

        // Validate placement
        const validation = validatePlacement(
            snappedPosition,
            size,
            behavior,
            placedAssets.map((a) => ({
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

        if (!validation.valid) {
            console.warn('Invalid placement:', validation.errors);
            return;
        }

        // Create placed asset
        const placedAsset: PlacedAsset = {
            id: `placed-${Date.now()}-${Math.random()}`, // Unique ID
            assetId: draggedAsset.id,
            asset: draggedAsset,
            position: snappedPosition,
            size,
            rotation: 0,
            layer: getAssetLayer(draggedAsset),
        };

        onAssetPlaced(placedAsset);
        onDragComplete();
        setCursorPosition(null);
    }, [draggedAsset, cursorPosition, gridConfig, placedAssets, onAssetPlaced, onDragComplete]);

    /**
     * Render placed assets by layer
     */
    const renderAssetsByLayer = (layerName: LayerName) => {
        return placedAssets
            .filter((placedAsset) => placedAsset.layer === layerName)
            .map((placedAsset) => {
                const image = imageCache.get(placedAsset.assetId);
                if (!image) return null;

                return (
                    <KonvaImage
                        key={placedAsset.id}
                        id={placedAsset.id}
                        image={image}
                        x={placedAsset.position.x - placedAsset.size.width / 2}
                        y={placedAsset.position.y - placedAsset.size.height / 2}
                        width={placedAsset.size.width}
                        height={placedAsset.size.height}
                        rotation={placedAsset.rotation}
                        draggable={false} // Dragging handled by TokenDragHandle component
                    />
                );
            });
    };

    /**
     * Render placement preview
     */
    const renderPreview = () => {
        if (!draggedAsset || !cursorPosition) return null;

        const image = imageCache.get(draggedAsset.id);
        if (!image) return null;

        const behavior = getPlacementBehavior(
            draggedAsset.kind,
            (draggedAsset as any).objectProps,
            (draggedAsset as any).creatureProps
        );

        const size = calculateAssetSize(
            (draggedAsset as any).objectProps?.size || (draggedAsset as any).creatureProps?.size,
            gridConfig
        );

        const snappedPosition = snapAssetPosition(cursorPosition, size, behavior, gridConfig);

        return (
            <KonvaImage
                image={image}
                x={snappedPosition.x - size.width / 2}
                y={snappedPosition.y - size.height / 2}
                width={size.width}
                height={size.height}
                opacity={previewValid ? 0.5 : 0.3}
                listening={false}
            />
        );
    };

    return (
        <>
            {/* Structure Layer (walls, doors - blocking objects) */}
            <Layer
                name={LayerName.Structure}
                listening={!!draggedAsset}
                onMouseMove={handleMouseMove}
                onClick={handleClick}
            >
                {renderAssetsByLayer(LayerName.Structure)}
            </Layer>

            {/* Objects Layer (furniture, decorations) */}
            <Layer
                name={LayerName.Objects}
                listening={!!draggedAsset}
                onMouseMove={handleMouseMove}
                onClick={handleClick}
            >
                {renderAssetsByLayer(LayerName.Objects)}
            </Layer>

            {/* Agents Layer (characters, monsters - tokens) */}
            <Layer
                name={LayerName.Agents}
                listening={!!draggedAsset}
                onMouseMove={handleMouseMove}
                onClick={handleClick}
            >
                {renderAssetsByLayer(LayerName.Agents)}
                {renderPreview()}
            </Layer>
        </>
    );
};

TokenPlacement.displayName = 'TokenPlacement';
