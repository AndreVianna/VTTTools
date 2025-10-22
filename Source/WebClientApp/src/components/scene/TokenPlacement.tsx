
import React, { useState, useEffect, useCallback } from 'react';
import { Layer, Group, Image as KonvaImage, Rect } from 'react-konva';
import Konva from 'konva';
import type { Asset, PlacedAsset } from '@/types/domain';
import type { GridConfig } from '@/utils/gridCalculator';
import { GridType } from '@/utils/gridCalculator';
import { LayerName, GroupName } from '@/services/layerManager';
import { getApiEndpoints } from '@/config/development';

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
    /** Callback when all images are loaded */
    onImagesLoaded?: () => void;
}

const getTokenImageUrl = (asset: Asset): string | null => {
    if (!asset?.resources || !Array.isArray(asset.resources)) {
        return null;
    }

    const mediaBaseUrl = getApiEndpoints().media;

    // Check for Token flag using bitwise AND (role & 1 checks if Token bit is set)
    const tokenResource = asset.resources.find((r) => (r.role & 1) === 1);
    if (tokenResource) {
        return `${mediaBaseUrl}/${tokenResource.resourceId}`;
    }

    // Check for Display flag using bitwise AND (role & 2 checks if Display bit is set)
    const displayResource = asset.resources.find((r) => (r.role & 2) === 2);
    if (displayResource) {
        return `${mediaBaseUrl}/${displayResource.resourceId}`;
    }

    return null;
};

const getAssetGroup = (asset: Asset): GroupName => {
    if (asset.kind === 'Creature') {
        return GroupName.Creatures;
    }

    const objectAsset = asset as any;
    if (objectAsset.objectProps?.isOpaque) {
        return GroupName.Structure;
    }

    return GroupName.Objects;
};

/**
 * Get asset size from properties
 * Defaults to 1x1 if not defined
 */
const getAssetSize = (asset: Asset): { width: number; height: number } => {
    const assetWithProps = asset as any;
    const size = assetWithProps.properties?.size;

    if (size && size.width && size.height) {
        return { width: size.width, height: size.height };
    }

    // Default to 1x1 grid cells
    return { width: 1, height: 1 };
};

/**
 * Snap position to grid based on asset size
 * - Small assets (< 1 cell) snap at their size intervals (0.5×0.5 snaps every 0.5 cells)
 * - Medium/Large assets (>= 1 cell) snap every 1 cell
 * Rule: snapInterval = min(assetSize, 1 cell) per dimension
 * Tie-breaker: right over left, bottom over top
 */
const snapToGridCenter = (
    position: { x: number; y: number },
    assetSize: { width: number; height: number },
    gridConfig: GridConfig
): { x: number; y: number } => {
    if (!gridConfig.snapToGrid || gridConfig.type === GridType.NoGrid) {
        return position;
    }

    const { cellWidth, cellHeight, offsetX, offsetY } = gridConfig;

    // Snap interval = min(asset size, 1 cell) - large assets move 1 cell at a time
    const snapWidthCells = Math.min(assetSize.width, 1);
    const snapHeightCells = Math.min(assetSize.height, 1);

    // Convert to pixels
    const snapWidth = snapWidthCells * cellWidth;
    const snapHeight = snapHeightCells * cellHeight;

    // Offset = half asset size (so asset boundaries align with grid)
    const offsetWidthPixels = (assetSize.width / 2) * cellWidth;
    const offsetHeightPixels = (assetSize.height / 2) * cellHeight;

    // Find nearest snap position
    // Math.round() handles ties by rounding 0.5 up (right/bottom preference)
    const snapX = Math.round((position.x - offsetX - offsetWidthPixels) / snapWidth) * snapWidth + offsetX + offsetWidthPixels;
    const snapY = Math.round((position.y - offsetY - offsetHeightPixels) / snapHeight) * snapHeight + offsetY + offsetHeightPixels;

    return { x: snapX, y: snapY };
};

export const TokenPlacement: React.FC<TokenPlacementProps> = ({
    placedAssets,
    onAssetPlaced,
    onAssetMoved,
    onAssetDeleted: _onAssetDeleted,
    gridConfig,
    draggedAsset,
    onDragComplete,
    onImagesLoaded,
}) => {
    const [cursorPosition, setCursorPosition] = useState<{ x: number; y: number } | null>(null);
    const [imageCache, setImageCache] = useState<Map<string, HTMLImageElement>>(new Map());

    const loadImage = useCallback((url: string): Promise<HTMLImageElement> => {
        return new Promise((resolve, reject) => {
            const img = new window.Image();
            img.crossOrigin = 'anonymous';
            img.onload = () => resolve(img);
            img.onerror = reject;
            img.src = url;
        });
    }, []);

    useEffect(() => {
        const loadImages = async () => {
            const newCache = new Map<string, HTMLImageElement>();
            let allLoaded = true;

            for (const placedAsset of placedAssets) {
                const imageUrl = getTokenImageUrl(placedAsset.asset);
                if (imageUrl && !imageCache.has(placedAsset.assetId)) {
                    try {
                        const img = await loadImage(imageUrl);
                        newCache.set(placedAsset.assetId, img);
                    } catch (error) {
                        console.error(`Failed to load image for asset ${placedAsset.assetId}:`, error);
                        allLoaded = false;
                    }
                }
            }

            if (draggedAsset) {
                const imageUrl = getTokenImageUrl(draggedAsset);
                if (imageUrl && !imageCache.has(draggedAsset.id)) {
                    try {
                        const img = await loadImage(imageUrl);
                        newCache.set(draggedAsset.id, img);
                    } catch (error) {
                        console.error(`Failed to load preview image for asset ${draggedAsset.id}:`, error);
                        allLoaded = false;
                    }
                }
            }

            if (newCache.size > 0) {
                setImageCache((prevCache) => {
                    const updatedCache = new Map(prevCache);
                    newCache.forEach((img, key) => updatedCache.set(key, img));
                    return updatedCache;
                });
            }

            const totalAssetsNeeded = placedAssets.length;
            const totalAssetsLoaded = placedAssets.filter(a =>
                imageCache.has(a.assetId) || newCache.has(a.assetId)
            ).length;

            if (totalAssetsNeeded === 0 || (allLoaded && totalAssetsLoaded === totalAssetsNeeded)) {
                onImagesLoaded?.();
            }
        };

        loadImages();
    }, [placedAssets, draggedAsset, loadImage, imageCache, onImagesLoaded]);

    const handleMouseMove = useCallback((e: Konva.KonvaEventObject<MouseEvent>) => {
        if (!draggedAsset) return;

        const stage = e.target.getStage();
        if (!stage) return;

        const pointer = stage.getPointerPosition();
        if (!pointer) return;

        const scale = stage.scaleX();
        const rawPosition = {
            x: (pointer.x - stage.x()) / scale,
            y: (pointer.y - stage.y()) / scale,
        };

        // Get asset size for size-aware snapping
        const assetCellSize = getAssetSize(draggedAsset);

        // Snap to grid if enabled
        const position = snapToGridCenter(rawPosition, assetCellSize, gridConfig);
        setCursorPosition(position);
    }, [draggedAsset, gridConfig]);

    const handleClick = useCallback((_e: Konva.KonvaEventObject<MouseEvent>) => {
        if (!draggedAsset || !cursorPosition) return;
        const assetCellSize = getAssetSize(draggedAsset);
        const size = {
            width: assetCellSize.width * gridConfig.cellWidth,
            height: assetCellSize.height * gridConfig.cellHeight
        };

        const placedAsset: PlacedAsset = {
            id: `placed-${Date.now()}-${Math.random()}`,
            assetId: draggedAsset.id,
            asset: draggedAsset,
            position: cursorPosition,
            size,
            rotation: 0,
            layer: getAssetGroup(draggedAsset),
        };

        onAssetPlaced(placedAsset);
        onDragComplete();
        setCursorPosition(null);
    }, [draggedAsset, cursorPosition, gridConfig, onAssetPlaced, onDragComplete]);

    const renderAssetsByGroup = (groupName: GroupName) => {
        return placedAssets
            .filter((placedAsset) => placedAsset.layer === groupName)
            .map((placedAsset) => {
                const image = imageCache.get(placedAsset.assetId);
                if (!image) return null;

                return (
                    <KonvaImage
                        key={placedAsset.id}
                        id={placedAsset.id}
                        name="placed-asset"
                        image={image}
                        x={placedAsset.position.x - placedAsset.size.width / 2}
                        y={placedAsset.position.y - placedAsset.size.height / 2}
                        width={placedAsset.size.width}
                        height={placedAsset.size.height}
                        rotation={placedAsset.rotation}
                        draggable={false}
                        listening={true}
                    />
                );
            });
    };

    const renderPreview = () => {
        if (!draggedAsset || !cursorPosition) return null;

        const image = imageCache.get(draggedAsset.id);
        if (!image) return null;

        // Get asset size (number of grid cells)
        const assetCellSize = getAssetSize(draggedAsset);

        // Convert to pixel dimensions
        const size = {
            width: assetCellSize.width * gridConfig.cellWidth,
            height: assetCellSize.height * gridConfig.cellHeight
        };

        return (
            <KonvaImage
                image={image}
                x={cursorPosition.x - size.width / 2}
                y={cursorPosition.y - size.height / 2}
                width={size.width}
                height={size.height}
                opacity={0.6}
                listening={false}
            />
        );
    };

    const previewGroup = draggedAsset ? getAssetGroup(draggedAsset) : null;

    return (
        <Layer
            name={LayerName.GameWorld}
            listening={true}
            onMouseMove={handleMouseMove}
            onClick={handleClick}
        >
            {draggedAsset && (
                <Rect
                    x={0}
                    y={0}
                    width={10000}
                    height={10000}
                    fill="transparent"
                    listening={true}
                />
            )}

            <Group name={GroupName.Structure}>
                {renderAssetsByGroup(GroupName.Structure)}
                {previewGroup === GroupName.Structure && renderPreview()}
            </Group>

            <Group name={GroupName.Objects}>
                {renderAssetsByGroup(GroupName.Objects)}
                {previewGroup === GroupName.Objects && renderPreview()}
            </Group>

            <Group name={GroupName.Creatures}>
                {renderAssetsByGroup(GroupName.Creatures)}
                {previewGroup === GroupName.Creatures && renderPreview()}
            </Group>
        </Layer>
    );
};

TokenPlacement.displayName = 'TokenPlacement';
