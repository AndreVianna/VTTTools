import type Konva from 'konva';
import { useCallback, useEffect, useRef, useState } from 'react';
import { AssetKind, type PlacedAsset, type Asset, LabelVisibility as DisplayNameEnum, LabelPosition as LabelPositionEnum } from '@/types/domain';
import { getPlacementBehavior, validatePlacement } from '@/types/placement';
import type { GridConfig } from '@/utils/gridCalculator';
import { snapToGridCenter } from '@/utils/gridSnapping';
import { SnapMode } from '@/utils/snapping';
import { getAssetGroup, getAssetSize } from '@/components/encounter/tokenPlacementUtils';

interface UseEntityInteractionProps {
    draggedAsset: Asset | null;
    gridConfig: GridConfig;
    snapMode: SnapMode;
    placedAssets: PlacedAsset[];
    onAssetPlaced: (asset: PlacedAsset) => void;
    onDragComplete: () => void;
    collisionData: Array<{
        x: number;
        y: number;
        width: number;
        height: number;
        allowOverlap: boolean;
    }>;
}

export const useEntityInteraction = ({
    draggedAsset,
    gridConfig,
    snapMode,
    placedAssets,
    onAssetPlaced,
    onDragComplete,
    collisionData,
}: UseEntityInteractionProps) => {
    const [cursorPosition, setCursorPosition] = useState<{
        x: number;
        y: number;
    } | null>(null);

    const [isValidPlacement, setIsValidPlacement] = useState(true);

    const snapModeRef = useRef(snapMode);
    const lastMouseMoveTime = useRef(0);

    useEffect(() => {
        snapModeRef.current = snapMode;
    }, [snapMode]);

    const handleMouseMove = useCallback(
        (e: Konva.KonvaEventObject<MouseEvent>) => {
            if (!draggedAsset) return;

            const now = Date.now();
            if (now - lastMouseMoveTime.current < 33) {
                return;
            }
            lastMouseMoveTime.current = now;

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

            const objectProperties =
                draggedAsset.classification.kind === AssetKind.Object
                    ? {
                        size: draggedAsset.size,
                        isMovable: true,
                        isOpaque: false,
                    }
                    : undefined;
            const monsterProperties =
                draggedAsset.classification.kind === AssetKind.Creature
                    ? {
                        size: draggedAsset.size,
                    }
                    : undefined;

            const behavior = getPlacementBehavior(draggedAsset.classification.kind, objectProperties, monsterProperties);

            const size = {
                width: assetCellSize.width * gridConfig.cellSize.width,
                height: assetCellSize.height * gridConfig.cellSize.height,
            };

            // Check if Shift key is pressed (skip collision check for visual feedback)
            const isShiftPressed = e.evt.shiftKey;

            const validation = validatePlacement(
                position,
                size,
                behavior,
                collisionData,
                gridConfig,
                isShiftPressed,
            );

            setIsValidPlacement(validation.valid);
        },
        [draggedAsset, gridConfig, collisionData],
    );

    const handleClick = useCallback(
        (e: Konva.KonvaEventObject<MouseEvent>) => {
            if (!draggedAsset || !cursorPosition) {
                return;
            }

            if (e.evt.button !== 0) {
                return;
            }

            if (e.target.getClassName() === 'Image') {
                return;
            }

            if (!isValidPlacement) {
                return;
            }

            const assetCellSize = getAssetSize(draggedAsset);
            const size = {
                width: assetCellSize.width * gridConfig.cellSize.width,
                height: assetCellSize.height * gridConfig.cellSize.height,
            };

            const tempIndex = placedAssets.length;
            const placedAsset: PlacedAsset = {
                id: `encounter-asset-${Date.now()}-${Math.random().toString(36).substring(2, 11)}`,
                assetId: draggedAsset.id,
                asset: draggedAsset,
                position: cursorPosition,
                size,
                rotation: 0,
                layer: getAssetGroup(draggedAsset),
                index: tempIndex,
                number: 1,
                name: draggedAsset.name,
                isHidden: false,
                isLocked: false,
                labelVisibility: DisplayNameEnum.Default,
                labelPosition: LabelPositionEnum.Default,
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
        },
        [draggedAsset, cursorPosition, gridConfig, isValidPlacement, placedAssets.length, onAssetPlaced, onDragComplete],
    );

    return {
        cursorPosition,
        isValidPlacement,
        handleMouseMove,
        handleClick,
        setCursorPosition, // Export setter if parent needs to reset it? E.g. on drag end.
        setIsValidPlacement
    };
};
