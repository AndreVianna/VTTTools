import React, { useEffect, useRef, useState, useCallback } from 'react';
import { Layer, Rect, Group, Circle, Line } from 'react-konva';
import { useTheme } from '@mui/material/styles';
import Konva from 'konva';
import type { PlacedAsset } from '@/types/domain';
import type { GridConfig } from '@/utils/gridCalculator';
import { GridType } from '@/utils/gridCalculator';
import {
    getPlacementBehavior,
} from '@/types/placement';
import { calculateAngleFromCenter, snapAngle } from '@/utils/rotationUtils';

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

    // Extract cell size and offset from nested GridConfig structure
    const { cellSize, offset } = gridConfig;
    const { width: cellWidth, height: cellHeight } = cellSize;
    const { left: offsetX, top: offsetY } = offset;

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
    /** Currently selected asset IDs */
    selectedAssetIds: string[];
    /** Callback when selection changes */
    onAssetSelected: (assetIds: string[]) => void;
    /** Callback when assets are moved (can be single or multiple) */
    onAssetMoved: (moves: Array<{ assetId: string; oldPosition: { x: number; y: number }; newPosition: { x: number; y: number } }>) => void;
    /** Callback when assets are deleted */
    onAssetDeleted: () => void;
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
    /** Snap mode from keyboard modifiers */
    snapMode: 'free' | 'grid' | 'half-step';
    /** Whether Shift key is pressed */
    isShiftPressed: boolean;
    /** Whether Ctrl key is pressed */
    isCtrlPressed: boolean;
    /** Canvas zoom scale */
    scale: number;
    /** Callback when assets are rotated */
    onAssetRotated?: (updates: Array<{ assetId: string; rotation: number; position?: { x: number; y: number } }>) => void;
    /** Callback when rotation starts */
    onRotationStart?: () => void;
    /** Callback when rotation ends */
    onRotationEnd?: () => void;
}

export const TokenDragHandle: React.FC<TokenDragHandleProps> = ({
    placedAssets,
    selectedAssetIds,
    onAssetSelected,
    onAssetMoved,
    onAssetDeleted,
    gridConfig,
    stageRef,
    enableDragMove = true,
    onReady,
    snapMode,
    isShiftPressed,
    isCtrlPressed,
    scale,
    onAssetRotated,
    onRotationStart,
    onRotationEnd,
}) => {
    const theme = useTheme();
    const transformerRef = useRef<Konva.Transformer>(null);
    const dragStartPosRef = useRef<{ x: number; y: number } | null>(null);
    const allDragStartPositionsRef = useRef<Map<string, { x: number; y: number }>>(new Map());
    const [isDragValid, setIsDragValid] = useState(true);
    const isDragValidRef = useRef(true);
    const [_draggedAssetInfo, setDraggedAssetInfo] = useState<{ id: string; position: { x: number; y: number }; size: { width: number; height: number } } | null>(null);
    const [invalidAssetPositions, setInvalidAssetPositions] = useState<Array<{ x: number; y: number }>>([]);
    const hasCalledReadyRef = useRef<boolean>(false);
    const snapModeRef = useRef(snapMode);
    const selectedAssetIdsRef = useRef(selectedAssetIds);
    const isShiftPressedRef = useRef(isShiftPressed);
    const placedAssetsRef = useRef(placedAssets);
    const [marqueeSelection, setMarqueeSelection] = useState<{ start: { x: number; y: number }; end: { x: number; y: number } } | null>(null);
    const marqueeActiveRef = useRef(false);
    const [isDraggingAsset, setIsDraggingAsset] = useState(false);
    const [isRotating, setIsRotating] = useState(false);

    // Calculate available actions for selected assets (intersection)
    const availableActions = React.useMemo(() => {
        if (selectedAssetIds.length === 0) {
            return { canMove: false, canDelete: false };
        }

        const selectedAssets = placedAssets.filter(a => selectedAssetIds.includes(a.id));
        const behaviors = selectedAssets.map(asset =>
            getPlacementBehavior(
                asset.asset.kind,
                asset.asset.kind === 'Object' ? (asset.asset as any).properties : undefined,
                asset.asset.kind === 'Creature' ? (asset.asset as any).properties : undefined
            )
        );

        return {
            canMove: behaviors.every(b => b.canMove),
            canDelete: behaviors.every(b => b.canDelete),
        };
    }, [selectedAssetIds, placedAssets]);

    useEffect(() => {
        snapModeRef.current = snapMode;
        selectedAssetIdsRef.current = selectedAssetIds;
        isShiftPressedRef.current = isShiftPressed;
        placedAssetsRef.current = placedAssets;
        isDragValidRef.current = isDragValid;
    }, [snapMode, selectedAssetIds, isShiftPressed, placedAssets, isDragValid]);

    // Transformer disabled for multi-selection (using blue borders instead)
    useEffect(() => {
        const transformer = transformerRef.current;
        if (transformer) {
            transformer.nodes([]);
        }
    }, []);

    const handleNodeClick = useCallback((e: Konva.KonvaEventObject<MouseEvent>) => {
        const clickedNode = e.currentTarget;
        const assetId = clickedNode.id();

        if (!assetId) {
            return;
        }

        const isCtrl = e.evt.ctrlKey || isCtrlPressed;
        const currentSelection = selectedAssetIdsRef.current;
        const isCurrentlySelected = currentSelection.includes(assetId);

        if (isCtrl) {
            if (isCurrentlySelected) {
                onAssetSelected(currentSelection.filter(id => id !== assetId));
            } else {
                onAssetSelected([...currentSelection, assetId]);
            }
        } else {
            onAssetSelected([assetId]);
        }
    }, [onAssetSelected, isCtrlPressed]);

    const handleDragStart = useCallback((e: Konva.KonvaEventObject<DragEvent>) => {
        const node = e.currentTarget;
        const draggedAssetId = node.id();
        const position = node.position();
        dragStartPosRef.current = position;

        setIsDraggingAsset(true);
        setIsDragValid(true);
        isDragValidRef.current = true;
        setInvalidAssetPositions([]);

        const currentSelection = selectedAssetIdsRef.current;
        let assetsToMove = currentSelection;

        if (!currentSelection.includes(draggedAssetId)) {
            assetsToMove = [draggedAssetId];
            onAssetSelected(assetsToMove);
            selectedAssetIdsRef.current = assetsToMove;
        }

        const stage = stageRef.current;
        if (stage) {
            const positions = new Map<string, { x: number; y: number }>();

            assetsToMove.forEach(id => {
                const assetNode = stage.findOne(`#${id}`);
                const asset = placedAssetsRef.current.find(a => a.id === id);
                if (assetNode && asset) {
                    // Node is positioned at center (with offsets), so position IS the center
                    const nodePos = assetNode.position();
                    positions.set(id, nodePos);
                }
            });

            allDragStartPositionsRef.current = positions;

            // Move all selected assets to drag-preview group
            const dragPreviewGroup = stage.findOne('.drag-preview');
            if (dragPreviewGroup) {
                assetsToMove.forEach(id => {
                    const assetNode = stage.findOne(`#${id}`);
                    if (assetNode) {
                        assetNode.moveTo(dragPreviewGroup as Konva.Container);
                    }
                });
            }
        }
    }, [stageRef, onAssetSelected]);

    const handleDragMove = useCallback((e: Konva.KonvaEventObject<DragEvent>) => {
        const node = e.currentTarget;
        const draggedAssetId = node.id();
        const placedAsset = placedAssetsRef.current.find((a) => a.id === draggedAssetId);  // Use ref

        if (!placedAsset || !dragStartPosRef.current) return;

        const stage = stageRef.current;
        if (!stage) return;

        const newPos = node.position();

        // Node is positioned at center (with offsets), so newPos IS the center
        const snappedCenter = snapToGridCenter(newPos, placedAsset.size, gridConfig, snapModeRef.current);

        // Set node position to snapped center
        node.position(snappedCenter);

        const snappedDelta = {
            x: snappedCenter.x - dragStartPosRef.current.x,
            y: snappedCenter.y - dragStartPosRef.current.y
        };

        const currentSelection = selectedAssetIdsRef.current;
        currentSelection.forEach(id => {
            if (id === draggedAssetId) return;

            const otherNode = stage.findOne(`#${id}`);
            const asset = placedAssetsRef.current.find(a => a.id === id);  // Use ref, not prop
            const originalCenterPos = allDragStartPositionsRef.current.get(id);
            if (otherNode && asset && originalCenterPos) {
                const newCenterPos = {
                    x: originalCenterPos.x + snappedDelta.x,
                    y: originalCenterPos.y + snappedDelta.y
                };
                // Node is positioned at center, so set directly to new center
                otherNode.position(newCenterPos);
            }
        });

        // Check for collisions and find collision points
        let allValid = true;
        const collisionPoints: Array<{ x: number; y: number }> = [];

        // Get non-selected assets to check against
        const otherAssets = placedAssetsRef.current.filter((a) => !currentSelection.includes(a.id));  // Use ref

        for (const id of currentSelection) {
            const asset = placedAssetsRef.current.find(a => a.id === id);  // Use ref
            if (!asset) continue;

            const assetNode = stage.findOne(`#${id}`);
            if (!assetNode) continue;

            // Node is positioned at center (with offsets), so position IS the center
            const assetCenter = assetNode.position();

            const behavior = getPlacementBehavior(
                asset.asset.kind,
                asset.asset.kind === 'Object' ? (asset.asset as any).properties : undefined,
                asset.asset.kind === 'Creature' ? (asset.asset as any).properties : undefined
            );

            // Check collision with each other asset
            if (!behavior.allowOverlap) {
                for (const other of otherAssets) {
                    const otherBehavior = getPlacementBehavior(
                        other.asset.kind,
                        other.asset.kind === 'Object' ? (other.asset as any).properties : undefined,
                        other.asset.kind === 'Creature' ? (other.asset as any).properties : undefined
                    );

                    if (otherBehavior.allowOverlap) continue;

                    // Calculate bounding boxes (with tolerance)
                    const tolerance = 1;
                    const box1 = {
                        left: assetCenter.x - asset.size.width / 2 + tolerance,
                        right: assetCenter.x + asset.size.width / 2 - tolerance,
                        top: assetCenter.y - asset.size.height / 2 + tolerance,
                        bottom: assetCenter.y + asset.size.height / 2 - tolerance
                    };

                    const box2 = {
                        left: other.position.x - other.size.width / 2 + tolerance,
                        right: other.position.x + other.size.width / 2 - tolerance,
                        top: other.position.y - other.size.height / 2 + tolerance,
                        bottom: other.position.y + other.size.height / 2 - tolerance
                    };

                    // Check if they overlap
                    const overlaps = !(
                        box1.right <= box2.left ||
                        box1.left >= box2.right ||
                        box1.bottom <= box2.top ||
                        box1.top >= box2.bottom
                    );

                    if (overlaps) {
                        allValid = false;

                        // Calculate overlap area center
                        const overlapLeft = Math.max(box1.left, box2.left);
                        const overlapRight = Math.min(box1.right, box2.right);
                        const overlapTop = Math.max(box1.top, box2.top);
                        const overlapBottom = Math.min(box1.bottom, box2.bottom);

                        collisionPoints.push({
                            x: (overlapLeft + overlapRight) / 2,
                            y: (overlapTop + overlapBottom) / 2
                        });
                    }
                }
            }
        }

        setIsDragValid(allValid);
        isDragValidRef.current = allValid;
        setInvalidAssetPositions(collisionPoints);
        setDraggedAssetInfo({
            id: draggedAssetId,
            position: snappedCenter,
            size: placedAsset.size
        });
    }, [gridConfig, stageRef]);

    const handleDragEnd = useCallback((_e: Konva.KonvaEventObject<DragEvent>) => {
        const stage = stageRef.current;
        if (!stage || !dragStartPosRef.current) return;

        const currentSelection = selectedAssetIdsRef.current;
        const isValid = isDragValidRef.current;

        currentSelection.forEach(id => {
            const asset = placedAssetsRef.current.find(a => a.id === id);  // Use ref
            const assetNode = stage.findOne(`#${id}`);
            if (asset && assetNode) {
                const targetGroup = stage.findOne(`.${asset.layer}`);
                if (targetGroup) {
                    assetNode.moveTo(targetGroup as Konva.Container);
                }
            }
        });

        if (isValid) {
            const moves: Array<{ assetId: string; oldPosition: { x: number; y: number }; newPosition: { x: number; y: number } }> = [];
            currentSelection.forEach(id => {
                const asset = placedAssetsRef.current.find(a => a.id === id);  // Use ref
                const assetNode = stage.findOne(`#${id}`);
                const oldPosition = allDragStartPositionsRef.current.get(id);
                if (asset && assetNode && oldPosition) {
                    // Node is positioned at center (with offsets), so position IS the center
                    const newPosition = assetNode.position();
                    moves.push({ assetId: id, oldPosition, newPosition });
                }
            });
            if (moves.length > 0) {
                onAssetMoved(moves);
            }
        } else {
            currentSelection.forEach(id => {
                const assetNode = stage.findOne(`#${id}`);
                const asset = placedAssetsRef.current.find(a => a.id === id);  // Use ref
                const originalCenterPos = allDragStartPositionsRef.current.get(id);
                if (assetNode && asset && originalCenterPos) {
                    // Node is positioned at center, so set directly to original center
                    assetNode.position(originalCenterPos);
                }
            });
        }

        dragStartPosRef.current = null;
        setIsDraggingAsset(false);
        allDragStartPositionsRef.current.clear();
        setDraggedAssetInfo(null);
        setIsDragValid(true);
        isDragValidRef.current = true;
        setInvalidAssetPositions([]);
    }, [onAssetMoved, stageRef]);

    useEffect(() => {
        const handleKeyDown = (e: KeyboardEvent) => {
            if (selectedAssetIds.length === 0 || !availableActions.canDelete) return;

            if (e.key === 'Delete') {
                e.preventDefault();
                onAssetDeleted();
            }
        };

        window.addEventListener('keydown', handleKeyDown);
        return () => window.removeEventListener('keydown', handleKeyDown);
    }, [selectedAssetIds, onAssetDeleted, availableActions.canDelete]);

    useEffect(() => {
        // Skip stage click handler if drag-move is disabled
        if (!enableDragMove) return;

        const stage = stageRef.current;
        if (!stage) return;

        const handleStageClick = (e: Konva.KonvaEventObject<MouseEvent>) => {
            if (e.evt.button !== 0) return;
            if (e.target === stage && !marqueeActiveRef.current) {
                onAssetSelected([]);
            }
        };

        stage.on('click', handleStageClick);
        return () => {
            stage.off('click', handleStageClick);
        };
    }, [enableDragMove, stageRef, onAssetSelected]);

    // Marquee selection with Shift+drag
    useEffect(() => {
        if (!enableDragMove) return;

        const stage = stageRef.current;
        if (!stage) return;

        const handleMouseDown = (e: Konva.KonvaEventObject<MouseEvent>) => {
            // Only marquee on left mouse button (button 0)
            if (e.evt.button !== 0 || e.target !== stage) return;

            const pos = stage.getPointerPosition();
            if (!pos) return;

            const scale = stage.scaleX();
            const stagePos = {
                x: (pos.x - stage.x()) / scale,
                y: (pos.y - stage.y()) / scale
            };

            setMarqueeSelection({ start: stagePos, end: stagePos });
            marqueeActiveRef.current = true;
        };

        const handleMouseMove = (e: Konva.KonvaEventObject<MouseEvent>) => {
            if (!marqueeSelection) return;
            // During mousemove, check buttons bitmask (1 = left button is pressed)
            if ((e.evt.buttons & 1) === 0) return;

            const pos = stage.getPointerPosition();
            if (!pos) return;

            const scale = stage.scaleX();
            const stagePos = {
                x: (pos.x - stage.x()) / scale,
                y: (pos.y - stage.y()) / scale
            };

            setMarqueeSelection(prev => prev ? { ...prev, end: stagePos } : null);
        };

        const handleMouseUp = (e: Konva.KonvaEventObject<MouseEvent>) => {
            if (!marqueeSelection) return;
            // Only complete on left-button release
            if (e.evt.button !== 0) return;
            const rect = {
                left: Math.min(marqueeSelection.start.x, marqueeSelection.end.x),
                right: Math.max(marqueeSelection.start.x, marqueeSelection.end.x),
                top: Math.min(marqueeSelection.start.y, marqueeSelection.end.y),
                bottom: Math.max(marqueeSelection.start.y, marqueeSelection.end.y)
            };

            const containedAssets = placedAssets.filter(asset => {
                const assetLeft = asset.position.x - asset.size.width / 2;
                const assetRight = asset.position.x + asset.size.width / 2;
                const assetTop = asset.position.y - asset.size.height / 2;
                const assetBottom = asset.position.y + asset.size.height / 2;

                return assetLeft >= rect.left &&
                       assetRight <= rect.right &&
                       assetTop >= rect.top &&
                       assetBottom <= rect.bottom;
            }).map(a => a.id);

            const currentSelection = selectedAssetIdsRef.current;
            if (isCtrlPressed) {
                const newSelection = [...currentSelection];
                containedAssets.forEach(id => {
                    if (!newSelection.includes(id)) {
                        newSelection.push(id);
                    }
                });
                onAssetSelected(newSelection);
                selectedAssetIdsRef.current = newSelection;
            } else {
                onAssetSelected(containedAssets);
                selectedAssetIdsRef.current = containedAssets;
            }

            setMarqueeSelection(null);
            setTimeout(() => {
                marqueeActiveRef.current = false;
            }, 100);
        };

        stage.on('mousedown', handleMouseDown);
        stage.on('mousemove', handleMouseMove);
        stage.on('mouseup', handleMouseUp);

        return () => {
            stage.off('mousedown', handleMouseDown);
            stage.off('mousemove', handleMouseMove);
            stage.off('mouseup', handleMouseUp);
        };
    }, [enableDragMove, stageRef, isCtrlPressed, marqueeSelection, placedAssets, selectedAssetIds, onAssetSelected]);

    // Track which assets have handlers attached
    const attachedHandlersRef = useRef<Set<string>>(new Set());

    useEffect(() => {
        console.log('[DEBUG TokenDragHandle] Event handler attachment effect triggered');
        console.log('[DEBUG TokenDragHandle] - enableDragMove:', enableDragMove);
        console.log('[DEBUG TokenDragHandle] - stageRef.current:', !!stageRef.current);
        console.log('[DEBUG TokenDragHandle] - placedAssets count:', placedAssets.length);

        if (!enableDragMove) return;

        const stage = stageRef.current;
        if (!stage) {
            console.error('[DEBUG TokenDragHandle] CRITICAL: Stage not available, cannot attach event handlers');
            return;
        }

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
                if (attachedHandlersRef.current.has(placedAsset.id)) {
                    return;
                }

                const node = stage.findOne(`#${placedAsset.id}`);

                if (node) {
                    const behavior = getPlacementBehavior(
                        placedAsset.asset.kind,
                        placedAsset.asset.kind === 'Object' ? (placedAsset.asset as any).properties : undefined,
                        placedAsset.asset.kind === 'Creature' ? (placedAsset.asset as any).properties : undefined
                    );

                    const isDraggable = behavior.canMove && (
                        selectedAssetIds.length === 0 ||
                        !selectedAssetIds.includes(placedAsset.id) ||
                        availableActions.canMove
                    );
                    node.draggable(isDraggable);
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
    }, [enableDragMove, placedAssets, stageRef, handleNodeClick, handleDragStart, handleDragMove, handleDragEnd, onReady, availableActions.canMove, selectedAssetIds, onAssetSelected]);

    // Helper to get actual node position (for selection borders during drag)
    const getAssetRenderPosition = useCallback((assetId: string) => {
        const asset = placedAssets.find(a => a.id === assetId);
        if (!asset) return null;

        // During drag, query node for live position updates
        if (dragStartPosRef.current && stageRef.current) {
            const node = stageRef.current.findOne(`#${assetId}`);
            if (node) {
                const nodePos = node.position();
                return {
                    x: nodePos.x - asset.size.width / 2,
                    y: nodePos.y - asset.size.height / 2,
                    width: asset.size.width,
                    height: asset.size.height
                };
            }
        }

        // Use stored position (renders immediately, same as rotation handle)
        return {
            x: asset.position.x - asset.size.width / 2,
            y: asset.position.y - asset.size.height / 2,
            width: asset.size.width,
            height: asset.size.height
        };
    }, [placedAssets, stageRef]);

    const selectedAssets = React.useMemo(() => {
        return placedAssets.filter(asset => selectedAssetIds.includes(asset.id));
    }, [placedAssets, selectedAssetIds]);

    return (
        <Layer name="ui-overlay" listening={true}>
            {/* Selection borders - blue outline for each selected asset */}
            {/* eslint-disable-next-line react-hooks/refs */}
            {selectedAssetIds.map(assetId => {
                const renderPos = getAssetRenderPosition(assetId);
                if (!renderPos) return null;

                return (
                    <Rect
                        key={`selection-${assetId}`}
                        x={renderPos.x}
                        y={renderPos.y}
                        width={renderPos.width}
                        height={renderPos.height}
                        stroke={theme.palette.primary.main}
                        strokeWidth={2}
                        listening={false}
                    />
                );
            })}

            {/* Rotation Handle - only for single asset selection */}
            {(() => {
                if (selectedAssets.length !== 1 || isDraggingAsset) {
                    return null;
                }

                const asset = selectedAssets[0]!;

                // eslint-disable-next-line react-hooks/refs
                const renderPos = getAssetRenderPosition(asset.id);
                if (!renderPos) return null;

                const centerX = renderPos.x + renderPos.width / 2;
                const centerY = renderPos.y + renderPos.height / 2;

                const longestDimension = Math.max(asset.size.width, asset.size.height);
                const handleLength = longestDimension * 0.75;
                const rotation = asset.rotation;
                const angleRadians = ((rotation - 90) * Math.PI) / 180;
                const lineEndX = Math.cos(angleRadians) * handleLength;
                const lineEndY = Math.sin(angleRadians) * handleLength;
                const strokeWidth = 1 / scale;
                const arrowSize = Math.max(4, Math.min(6, 5 / scale));
                const lineColor = theme.palette.mode === 'dark' ? '#9CA3AF' : '#6B7280';

                const groupKey = `rotation-handle-${centerX.toFixed(1)}-${centerY.toFixed(1)}`;

                return (
                    <Group key={groupKey} name={groupKey} x={centerX} y={centerY}>
                        <Line
                            points={[0, 0, lineEndX, lineEndY]}
                            stroke={lineColor}
                            strokeWidth={strokeWidth}
                            dash={[5, 5]}
                            opacity={0.8}
                            listening={false}
                        />
                        <Circle
                            x={lineEndX}
                            y={lineEndY}
                            radius={arrowSize}
                            fill={lineColor}
                            stroke={lineColor}
                            strokeWidth={1}
                            cursor={isRotating ? 'grabbing' : 'grab'}
                            hitStrokeWidth={20}
                            onMouseDown={(e) => {
                                e.cancelBubble = true;
                                setIsRotating(true);
                                onRotationStart?.();

                                const stage = e.target.getStage();
                                if (!stage) return;

                                const handleMouseMove = () => {
                                    const pointerPosition = stage.getPointerPosition();
                                    if (!pointerPosition) return;
                                    const canvasPosition = {
                                        x: (pointerPosition.x - stage.x()) / stage.scaleX(),
                                        y: (pointerPosition.y - stage.y()) / stage.scaleY()
                                    };

                                    const assetCenter = { x: asset.position.x, y: asset.position.y };
                                    const newRotation = snapAngle(calculateAngleFromCenter(assetCenter, canvasPosition));
                                    onAssetRotated?.([{ assetId: asset.id, rotation: newRotation }]);
                                };

                                const handleMouseUp = () => {
                                    setIsRotating(false);
                                    onRotationEnd?.();
                                    stage.off('mousemove', handleMouseMove);
                                    stage.off('mouseup', handleMouseUp);
                                    window.removeEventListener('mouseup', handleMouseUp);
                                };

                                stage.on('mousemove', handleMouseMove);
                                stage.on('mouseup', handleMouseUp);
                                window.addEventListener('mouseup', handleMouseUp);
                            }}
                        />
                    </Group>
                );
            })()}

            {/* Marquee selection rectangle */}
            {marqueeSelection && (
                <Rect
                    x={Math.min(marqueeSelection.start.x, marqueeSelection.end.x)}
                    y={Math.min(marqueeSelection.start.y, marqueeSelection.end.y)}
                    width={Math.abs(marqueeSelection.end.x - marqueeSelection.start.x)}
                    height={Math.abs(marqueeSelection.end.y - marqueeSelection.start.y)}
                    fill="rgba(33, 150, 243, 0.2)"
                    stroke={theme.palette.primary.main}
                    strokeWidth={1}
                    dash={[4, 4]}
                    listening={false}
                />
            )}

            {/* Invalid placement indicators - show on each colliding asset */}
            {invalidAssetPositions.map((pos, index) => (
                <React.Fragment key={`invalid-${index}`}>
                    {renderInvalidIndicator(pos)}
                </React.Fragment>
            ))}
        </Layer>
    );
};

TokenDragHandle.displayName = 'TokenDragHandle';
