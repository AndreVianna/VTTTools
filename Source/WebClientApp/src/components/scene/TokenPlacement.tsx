
import React, { useState, useEffect, useCallback, useRef, useMemo } from 'react';
import { Layer, Group, Image as KonvaImage, Circle, Line, Rect, Text } from 'react-konva';
import Konva from 'konva';
import { useTheme } from '@mui/material/styles';
import type { Asset, PlacedAsset } from '@/types/domain';
import type { GridConfig } from '@/utils/gridCalculator';
import { GridType } from '@/utils/gridCalculator';
import { LayerName, GroupName } from '@/services/layerManager';
import { getApiEndpoints } from '@/config/development';
import { getPlacementBehavior, validatePlacement } from '@/types/placement';

const LABEL_PADDING = 4;
const LABEL_HORIZONTAL_PADDING = 8;
const LABEL_VERTICAL_PADDING = 4;

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
    /** Snap mode from keyboard modifiers */
    snapMode: 'free' | 'grid' | 'half-step';
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
 * Render invalid placement indicator (red X)
 */
const renderInvalidIndicator = (position: { x: number; y: number }) => (
    <Group x={position.x} y={position.y}>
        <Circle
            radius={12}
            fill="rgba(220, 38, 38, 0.9)"
            stroke="white"
            strokeWidth={1}
        />
        <Line
            points={[-6, -6, 6, 6]}
            stroke="white"
            strokeWidth={2}
            lineCap="round"
        />
        <Line
            points={[6, -6, -6, 6]}
            stroke="white"
            strokeWidth={2}
            lineCap="round"
        />
    </Group>
);

interface TooltipRendererProps {
    tooltip: {
        visible: boolean;
        text: string;
        x: number;
        y: number;
        canvasX: number;
        canvasY: number;
    };
    labelColors: {
        background: string;
        border: string;
        text: string;
    };
}

const TooltipRenderer: React.FC<TooltipRendererProps> = ({ tooltip, labelColors }) => {
    const tempText = new Konva.Text({
        text: tooltip.text,
        fontSize: 12,
        fontFamily: 'Arial',
    });

    const tooltipWidth = tempText.width() + LABEL_HORIZONTAL_PADDING;
    const tooltipHeight = tempText.height() + LABEL_VERTICAL_PADDING;
    tempText.destroy();

    return (
        <Group x={tooltip.canvasX + 10} y={tooltip.canvasY + 10}>
            <Rect
                width={tooltipWidth}
                height={tooltipHeight}
                fill={labelColors.background}
                stroke={labelColors.border}
                strokeWidth={1}
            />
            <Text
                text={tooltip.text}
                fontSize={12}
                fontFamily="Arial"
                fill={labelColors.text}
                padding={LABEL_HORIZONTAL_PADDING / 2}
                width={tooltipWidth}
                height={tooltipHeight}
                align="center"
                verticalAlign="middle"
            />
        </Group>
    );
};

/**
 * Snap position to grid based on asset size and snap mode
 * - Small assets (<= 0.5 cell): Base snap 0.5 cells
 * - Medium/Large assets (> 0.5 cell): Base snap 1 cell
 * - Half-step mode: Divides base by 2 (0.25 for small, 0.5 for medium+)
 * - Each dimension calculated independently
 */
const snapToGridCenter = (
    position: { x: number; y: number },
    assetSize: { width: number; height: number },
    gridConfig: GridConfig,
    snapMode: 'free' | 'grid' | 'half-step'
): { x: number; y: number } => {
    if (snapMode === 'free' || gridConfig.type === GridType.NoGrid) {
        return position;
    }

    const { cellSize, offset } = gridConfig;
    const { width: cellWidth, height: cellHeight } = cellSize;
    const { left: offsetX, top: offsetY } = offset;

    // Base snap interval per dimension: <= 0.5 → 0.5 cells, > 0.5 → 1.0 cells
    const getBaseSnapIntervalCells = (sizeInCells: number) =>
        sizeInCells <= 0.5 ? 0.5 : 1.0;

    const baseSnapWidthCells = getBaseSnapIntervalCells(assetSize.width);
    const baseSnapHeightCells = getBaseSnapIntervalCells(assetSize.height);

    // Apply mode multiplier
    const multiplier = snapMode === 'half-step' ? 0.5 : 1.0;
    const snapWidthCells = baseSnapWidthCells * multiplier;
    const snapHeightCells = baseSnapHeightCells * multiplier;

    // Convert to pixels
    const snapWidth = snapWidthCells * cellWidth;
    const snapHeight = snapHeightCells * cellHeight;

    // Offset = half asset size (so asset boundaries align with grid)
    const offsetWidthPixels = (assetSize.width / 2) * cellWidth;
    const offsetHeightPixels = (assetSize.height / 2) * cellHeight;

    // Find nearest snap position
    const snapX = Math.round((position.x - offsetX - offsetWidthPixels) / snapWidth) * snapWidth + offsetX + offsetWidthPixels;
    const snapY = Math.round((position.y - offsetY - offsetHeightPixels) / snapHeight) * snapHeight + offsetY + offsetHeightPixels;

    return { x: snapX, y: snapY };
};

export const TokenPlacement: React.FC<TokenPlacementProps> = ({
    placedAssets,
    onAssetPlaced,
    onAssetMoved,
    onAssetDeleted,
    gridConfig,
    draggedAsset,
    onDragComplete,
    onImagesLoaded,
    snapMode,
}) => {
    const theme = useTheme();
    const [cursorPosition, setCursorPosition] = useState<{ x: number; y: number } | null>(null);
    const [imageCache, setImageCache] = useState<Map<string, HTMLImageElement>>(new Map());
    const [isValidPlacement, setIsValidPlacement] = useState(true);
    const [tooltip, setTooltip] = useState<{
        visible: boolean;
        text: string;
        x: number;
        y: number;
        canvasX: number;
        canvasY: number;
    } | null>(null);
    const snapModeRef = useRef(snapMode);
    const layerRef = useRef<any>(null);

    const labelColors = useMemo(() => ({
        background: theme.palette.background.paper,
        border: theme.palette.divider,
        text: theme.palette.text.primary,
    }), [theme.palette.background.paper, theme.palette.divider, theme.palette.text.primary]);

    useEffect(() => {
        snapModeRef.current = snapMode;
    }, [snapMode]);

    // Initialize cursor position when draggedAsset changes from null to non-null
    useEffect(() => {
        if (draggedAsset && !cursorPosition) {
            // Get the center of the viewport as initial position
            const stage = layerRef.current?.getStage();
            if (stage) {
                const centerX = (window.innerWidth / 2 - stage.x()) / stage.scaleX();
                const centerY = (window.innerHeight / 2 - stage.y()) / stage.scaleY();
                setCursorPosition({ x: centerX, y: centerY });
            }
        } else if (!draggedAsset) {
            setCursorPosition(null);
        }
    }, [draggedAsset, cursorPosition]);

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
        if (!stage) {
            return;
        }

        const pointer = stage.getPointerPosition();
        if (!pointer) {
            return;
        }

        const scale = stage.scaleX();
        const rawPosition = {
            x: (pointer.x - stage.x()) / scale,
            y: (pointer.y - stage.y()) / scale,
        };

        // Get asset size for size-aware snapping
        const assetCellSize = getAssetSize(draggedAsset);

        // Snap to grid based on mode (use ref for current value)
        const position = snapToGridCenter(rawPosition, assetCellSize, gridConfig, snapModeRef.current);
        setCursorPosition(position);

        // Validate placement for visual feedback
        const assetWithProps = draggedAsset as any;

        const behavior = getPlacementBehavior(
            draggedAsset.kind,
            draggedAsset.kind === 'Object' ? assetWithProps.properties : undefined,
            draggedAsset.kind === 'Creature' ? assetWithProps.properties : undefined
        );

        const size = {
            width: assetCellSize.width * gridConfig.cellSize.width,
            height: assetCellSize.height * gridConfig.cellSize.height
        };

        // Check if Shift key is pressed (skip collision check for visual feedback)
        const isShiftPressed = e.evt.shiftKey;

        const validation = validatePlacement(
            position,
            size,
            behavior,
            placedAssets.map((a) => ({
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
            gridConfig,
            isShiftPressed
        );

        setIsValidPlacement(validation.valid);
    }, [draggedAsset, gridConfig, placedAssets]);

    const handleClick = useCallback((e: Konva.KonvaEventObject<MouseEvent>) => {
        if (!draggedAsset || !cursorPosition) return;

        // Only handle left-clicks (button 0), right-click is for panning
        if (e.evt.button !== 0) return;

        // Only handle if clicking on the Layer itself or Rect, not on placed assets
        if (e.target.getClassName() === 'Image') return;

        if (!isValidPlacement) {
            return;
        }

        const assetCellSize = getAssetSize(draggedAsset);
        const size = {
            width: assetCellSize.width * gridConfig.cellSize.width,
            height: assetCellSize.height * gridConfig.cellSize.height
        };

        const placedAsset: PlacedAsset = {
            id: `placed-${Date.now()}-${Math.random()}`,
            assetId: draggedAsset.id,
            asset: draggedAsset,
            position: cursorPosition,
            size,
            rotation: 0,
            layer: getAssetGroup(draggedAsset),
            index: placedAssets.length,
            number: 1,
            name: draggedAsset.name
        };

        onAssetPlaced(placedAsset);

        // Check if Shift key is pressed for continuous placement
        const isShiftPressed = e.evt.shiftKey;

        if (!isShiftPressed) {
            // Normal click: exit placement mode
            onDragComplete();
            setCursorPosition(null);
        }
        // Shift-click: keep placement mode active, cursor stays for next placement
    }, [draggedAsset, cursorPosition, gridConfig, isValidPlacement, onAssetPlaced, onDragComplete]);

    const renderAssetsByGroup = (groupName: GroupName) => {
        return placedAssets
            .filter((placedAsset) => placedAsset.layer === groupName)
            .map((placedAsset) => {
                const image = imageCache.get(placedAsset.assetId);
                if (!image) return null;

                const isCreature = placedAsset.asset.kind === 'Creature';
                const imageX = placedAsset.position.x - placedAsset.size.width / 2;
                const imageY = placedAsset.position.y - placedAsset.size.height / 2;

                if (isCreature) {
                    const tempText = new Konva.Text({
                        text: placedAsset.name,
                        fontSize: 12,
                        fontFamily: 'Arial',
                    });

                    const labelWidth = tempText.width() + LABEL_HORIZONTAL_PADDING;
                    const labelHeight = tempText.height() + LABEL_VERTICAL_PADDING;

                    tempText.destroy();

                    const labelX = placedAsset.position.x - labelWidth / 2;
                    const labelY = placedAsset.position.y + placedAsset.size.height / 2 + LABEL_PADDING;

                    return (
                        <Group key={placedAsset.id}>
                            <KonvaImage
                                id={placedAsset.id}
                                name="placed-asset"
                                image={image}
                                x={imageX}
                                y={imageY}
                                width={placedAsset.size.width}
                                height={placedAsset.size.height}
                                rotation={placedAsset.rotation}
                                draggable={false}
                                listening={true}
                            />
                            <Rect
                                x={labelX}
                                y={labelY}
                                width={labelWidth}
                                height={labelHeight}
                                fill={labelColors.background}
                                stroke={labelColors.border}
                                strokeWidth={1}
                                listening={false}
                            />
                            <Text
                                x={labelX}
                                y={labelY}
                                width={labelWidth}
                                height={labelHeight}
                                text={placedAsset.name}
                                fontSize={12}
                                fontFamily="Arial"
                                fill={labelColors.text}
                                align="center"
                                verticalAlign="middle"
                                listening={false}
                            />
                        </Group>
                    );
                }

                return (
                    <React.Fragment key={placedAsset.id}>
                        <KonvaImage
                            id={placedAsset.id}
                            name="placed-asset"
                            image={image}
                            x={imageX}
                            y={imageY}
                            width={placedAsset.size.width}
                            height={placedAsset.size.height}
                            rotation={placedAsset.rotation}
                            draggable={false}
                            listening={true}
                            onMouseEnter={(e) => {
                                const stage = e.target.getStage();
                                const pointer = stage?.getPointerPosition();
                                if (pointer && stage) {
                                    const scale = stage.scaleX();
                                    const stageX = stage.x();
                                    const stageY = stage.y();
                                    const canvasX = (pointer.x - stageX) / scale;
                                    const canvasY = (pointer.y - stageY) / scale;
                                    setTooltip({
                                        visible: true,
                                        text: placedAsset.name,
                                        x: pointer.x,
                                        y: pointer.y,
                                        canvasX,
                                        canvasY
                                    });
                                }
                            }}
                            onMouseMove={(e) => {
                                const stage = e.target.getStage();
                                const pointer = stage?.getPointerPosition();
                                if (pointer && tooltip?.visible && stage) {
                                    const scale = stage.scaleX();
                                    const stageX = stage.x();
                                    const stageY = stage.y();
                                    const canvasX = (pointer.x - stageX) / scale;
                                    const canvasY = (pointer.y - stageY) / scale;
                                    setTooltip(prev => prev ? {...prev, x: pointer.x, y: pointer.y, canvasX, canvasY} : null);
                                }
                            }}
                            onMouseLeave={() => {
                                setTooltip(null);
                            }}
                        />
                    </React.Fragment>
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
            width: assetCellSize.width * gridConfig.cellSize.width,
            height: assetCellSize.height * gridConfig.cellSize.height
        };

        return (
            <>
                <KonvaImage
                    image={image}
                    x={cursorPosition.x - size.width / 2}
                    y={cursorPosition.y - size.height / 2}
                    width={size.width}
                    height={size.height}
                    opacity={isValidPlacement ? 0.6 : 0.3}
                    listening={false}
                />
                {!isValidPlacement && renderInvalidIndicator(cursorPosition)}
            </>
        );
    };

    return (
        <Layer
            ref={layerRef}
            name={LayerName.GameWorld}
            listening={true}
            onMouseMove={draggedAsset ? handleMouseMove : undefined}
            onClick={draggedAsset ? handleClick : undefined}
        >
            {/* Invisible hit area for placement cursor tracking

                WHY THIS IS NEEDED:
                - Konva Layers only capture events where shapes exist
                - Without shapes in empty canvas areas, mousemove events don't reach the Layer
                - This Rect provides a "catch-all" surface for event capture during placement

                ONLY RENDERED DURING PLACEMENT MODE (draggedAsset !== null)

                ALTERNATIVE ARCHITECTURE (Technical Debt - see ROADMAP.md):
                - Could use separate PlacementOverlay Layer instead
                - Would make purpose more explicit and separation cleaner
                - Current approach works but mixing concerns
            */}
            {draggedAsset && (
                <Rect
                    x={-10000}
                    y={-10000}
                    width={20000}
                    height={20000}
                    fill="transparent"
                    listening={true}
                />
            )}

            <Group name={GroupName.Structure}>
                {renderAssetsByGroup(GroupName.Structure)}
            </Group>

            <Group name={GroupName.Objects}>
                {renderAssetsByGroup(GroupName.Objects)}
            </Group>

            <Group name={GroupName.Creatures}>
                {renderAssetsByGroup(GroupName.Creatures)}
            </Group>

            {/* Preview Group - Renders last so preview is always on top */}
            <Group name="preview">
                {renderPreview()}
            </Group>

            {/* Drag Preview Group - For temporarily holding dragged assets (renders above everything) */}
            <Group name="drag-preview" />

            {tooltip?.visible && (
                <TooltipRenderer
                    tooltip={tooltip}
                    labelColors={labelColors}
                />
            )}
        </Layer>
    );
};

TokenPlacement.displayName = 'TokenPlacement';
