import { useTheme } from '@mui/material/styles';
import type Konva from 'konva';
import React, { useCallback, useEffect, useRef, useState } from 'react';
import { Circle, Group, Layer, Line, Rect } from 'react-konva';
import { LayerName } from '@/services/layerManager';
import type { PlacedAsset } from '@/types/domain';
import { getPlacementBehavior } from '@/types/placement';
import type { GridConfig } from '@/utils/gridCalculator';
import { GridType } from '@/utils/gridCalculator';
import { calculateAngleFromCenter, snapAngle } from '@/utils/rotationUtils';
import type { InteractionScope } from '@/utils/scopeFiltering';
import { isAssetInScope } from '@/utils/scopeFiltering';
import { SnapMode } from '@/utils/snapping';

/**
 * Render invalid placement indicator (red X)
 */
const renderInvalidIndicator = (position: { x: number; y: number }) => (
  <Group x={position.x} y={position.y}>
    <Circle radius={12} fill='rgba(220, 38, 38, 0.9)' stroke='white' strokeWidth={1} />
    <Line points={[-6, -6, 6, 6]} stroke='white' strokeWidth={2} lineCap='round' />
    <Line points={[6, -6, -6, 6]} stroke='white' strokeWidth={2} lineCap='round' />
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
  snapMode: SnapMode,
): { x: number; y: number } => {
  if (snapMode === SnapMode.Free || gridConfig.type === GridType.NoGrid) {
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
  const getBaseSnapIntervalCells = (sizeInCells: number) => (sizeInCells <= 0.5 ? 0.5 : 1.0);

  const baseSnapWidthCells = getBaseSnapIntervalCells(assetWidthCells);
  const baseSnapHeightCells = getBaseSnapIntervalCells(assetHeightCells);

  // Apply mode multiplier: Half mode halves the snap interval
  const multiplier = snapMode === SnapMode.Half ? 0.5 : 1.0;
  const snapWidthCells = baseSnapWidthCells * multiplier;
  const snapHeightCells = baseSnapHeightCells * multiplier;

  // Convert back to pixels
  const snapWidth = snapWidthCells * cellWidth;
  const snapHeight = snapHeightCells * cellHeight;

  // Offset = half asset size
  const offsetWidthPixels = assetSizePixels.width / 2;
  const offsetHeightPixels = assetSizePixels.height / 2;

  // Find nearest snap position
  const snapX =
    Math.round((position.x - offsetX - offsetWidthPixels) / snapWidth) * snapWidth + offsetX + offsetWidthPixels;
  const snapY =
    Math.round((position.y - offsetY - offsetHeightPixels) / snapHeight) * snapHeight + offsetY + offsetHeightPixels;

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
  onAssetMoved: (
    moves: Array<{
      assetId: string;
      oldPosition: { x: number; y: number };
      newPosition: { x: number; y: number };
    }>,
  ) => void;
  /** Callback when assets are deleted */
  onAssetDeleted: () => void;
  /** Current grid configuration */
  gridConfig: GridConfig;
  /** Konva Stage reference */
  stageRef: React.RefObject<Konva.Stage | null>;
  /** Signal that stage ref has been set and is ready for use */
  stageReady?: boolean;
  /** Whether placement mode is active (disable layer listening) */
  isPlacementMode?: boolean;
  /** Whether to enable drag-based movement (default: true, set false for click-to-pick-up) */
  enableDragMove?: boolean;
  /** Callback when handlers are attached and component is ready */
  onReady?: () => void;
  /** Snap mode from keyboard modifiers */
  snapMode: SnapMode;
  /** Whether Shift key is pressed */
  isShiftPressed: boolean;
  /** Whether Ctrl key is pressed */
  isCtrlPressed: boolean;
  /** Canvas zoom scale */
  scale: number;
  /** Callback when assets are rotated */
  onAssetRotated?: (
    updates: Array<{
      assetId: string;
      rotation: number;
      position?: { x: number; y: number };
    }>,
  ) => void;
  /** Callback when rotation starts */
  onRotationStart?: () => void;
  /** Callback when rotation ends */
  onRotationEnd?: () => void;
  /** Active interaction scope for filtering interactions */
  activeScope?: InteractionScope;
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
  activeScope,
}) => {
  const theme = useTheme();
  const transformerRef = useRef<Konva.Transformer>(null);
  const dragStartPosRef = useRef<{ x: number; y: number } | null>(null);
  const allDragStartPositionsRef = useRef<Map<string, { x: number; y: number }>>(new Map());
  const [isDragValid, setIsDragValid] = useState(true);
  const isDragValidRef = useRef(true);
  const [_draggedAssetInfo, setDraggedAssetInfo] = useState<{
    id: string;
    position: { x: number; y: number };
    size: { width: number; height: number };
  } | null>(null);
  const [invalidAssetPositions, setInvalidAssetPositions] = useState<Array<{ x: number; y: number }>>([]);
  const [draggedAssetNodePositions, setDraggedAssetNodePositions] = useState<Map<string, { x: number; y: number }>>(
    new Map(),
  );
  const hasCalledReadyRef = useRef<boolean>(false);
  const snapModeRef = useRef(snapMode);
  const selectedAssetIdsRef = useRef(selectedAssetIds);
  const isShiftPressedRef = useRef(isShiftPressed);
  const placedAssetsRef = useRef(placedAssets);
  const [marqueeSelection, setMarqueeSelection] = useState<{
    start: { x: number; y: number };
    end: { x: number; y: number };
  } | null>(null);
  const marqueeActiveRef = useRef(false);
  const [isDraggingAsset, setIsDraggingAsset] = useState(false);
  const [isRotating, setIsRotating] = useState(false);

  // Calculate available actions for selected assets (intersection)
  const availableActions = React.useMemo(() => {
    if (selectedAssetIds.length === 0) {
      return { canMove: false, canDelete: false };
    }

    const selectedAssets = placedAssets.filter((a) => selectedAssetIds.includes(a.id));
    const behaviors = selectedAssets.map((asset) => {
      return getPlacementBehavior(asset.asset.classification.kind);
    });

    return {
      canMove: behaviors.every((b) => b.canMove),
      canDelete: behaviors.every((b) => b.canDelete),
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

  const handleNodeClick = useCallback(
    (e: Konva.KonvaEventObject<MouseEvent>) => {
      const clickedNode = e.target;
      const assetId = clickedNode.id();

      if (!assetId) {
        return;
      }

      const clickedAsset = placedAssetsRef.current.find((a) => a.id === assetId);

      if (!isAssetInScope(clickedAsset, activeScope)) {
        return;
      }

      const isCtrl = e.evt.ctrlKey || isCtrlPressed;
      const currentSelection = selectedAssetIdsRef.current;
      const isCurrentlySelected = currentSelection.includes(assetId);

      if (isCtrl) {
        if (isCurrentlySelected) {
          onAssetSelected(currentSelection.filter((id) => id !== assetId));
        } else {
          onAssetSelected([...currentSelection, assetId]);
        }
      } else {
        onAssetSelected([assetId]);
      }
    },
    [onAssetSelected, isCtrlPressed, activeScope],
  );

  const handleDragStart = useCallback(
    (e: Konva.KonvaEventObject<DragEvent>) => {
      const node = e.currentTarget;
      const draggedAssetId = node.id();

      const asset = placedAssetsRef.current.find((a) => a.id === draggedAssetId);
      if (!isAssetInScope(asset, activeScope)) {
        e.evt.preventDefault();
        return;
      }

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

        assetsToMove.forEach((id) => {
          const assetNode = stage.findOne(`#${id}`);
          const asset = placedAssetsRef.current.find((a) => a.id === id);
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
          assetsToMove.forEach((id) => {
            const assetNode = stage.findOne(`#${id}`);
            if (assetNode) {
              assetNode.moveTo(dragPreviewGroup as Konva.Container);
            }
          });
        }
      }
    },
    [stageRef, onAssetSelected, activeScope],
  );

  const handleDragMove = useCallback(
    (e: Konva.KonvaEventObject<DragEvent>) => {
      const node = e.currentTarget;
      const draggedAssetId = node.id();
      const placedAsset = placedAssetsRef.current.find((a) => a.id === draggedAssetId); // Use ref

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
        y: snappedCenter.y - dragStartPosRef.current.y,
      };

      const currentSelection = selectedAssetIdsRef.current;
      currentSelection.forEach((id) => {
        if (id === draggedAssetId) return;

        const otherNode = stage.findOne(`#${id}`);
        const asset = placedAssetsRef.current.find((a) => a.id === id); // Use ref, not prop
        const originalCenterPos = allDragStartPositionsRef.current.get(id);
        if (otherNode && asset && originalCenterPos) {
          const newCenterPos = {
            x: originalCenterPos.x + snappedDelta.x,
            y: originalCenterPos.y + snappedDelta.y,
          };
          // Node is positioned at center, so set directly to new center
          otherNode.position(newCenterPos);
        }
      });

      // Check for collisions and find collision points
      let allValid = true;
      const collisionPoints: Array<{ x: number; y: number }> = [];

      // Get non-selected assets to check against
      const otherAssets = placedAssetsRef.current.filter((a) => !currentSelection.includes(a.id)); // Use ref

      for (const id of currentSelection) {
        const asset = placedAssetsRef.current.find((a) => a.id === id); // Use ref
        if (!asset) continue;

        const assetNode = stage.findOne(`#${id}`);
        if (!assetNode) continue;

        // Node is positioned at center (with offsets), so position IS the center
        const assetCenter = assetNode.position();

        const behavior = getPlacementBehavior(asset.asset.classification.kind);

        // Check collision with each other asset
        if (!behavior.allowOverlap) {
          for (const other of otherAssets) {
            const otherBehavior = getPlacementBehavior(other.asset.classification.kind);

            if (otherBehavior.allowOverlap) continue;

            // Calculate bounding boxes (with tolerance)
            const tolerance = 1;
            const box1 = {
              left: assetCenter.x - asset.size.width / 2 + tolerance,
              right: assetCenter.x + asset.size.width / 2 - tolerance,
              top: assetCenter.y - asset.size.height / 2 + tolerance,
              bottom: assetCenter.y + asset.size.height / 2 - tolerance,
            };

            const box2 = {
              left: other.position.x - other.size.width / 2 + tolerance,
              right: other.position.x + other.size.width / 2 - tolerance,
              top: other.position.y - other.size.height / 2 + tolerance,
              bottom: other.position.y + other.size.height / 2 - tolerance,
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
                y: (overlapTop + overlapBottom) / 2,
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
        size: placedAsset.size,
      });

      const newPositions = new Map<string, { x: number; y: number }>();
      currentSelection.forEach((id) => {
        const assetNode = stage.findOne(`#${id}`);
        if (assetNode) {
          newPositions.set(id, assetNode.position());
        }
      });
      setDraggedAssetNodePositions(newPositions);
    },
    [gridConfig, stageRef],
  );

  const handleDragEnd = useCallback(
    (_e: Konva.KonvaEventObject<DragEvent>) => {
      const stage = stageRef.current;
      if (!stage || !dragStartPosRef.current) return;

      const currentSelection = selectedAssetIdsRef.current;
      const isValid = isDragValidRef.current;

      currentSelection.forEach((id) => {
        const asset = placedAssetsRef.current.find((a) => a.id === id); // Use ref
        const assetNode = stage.findOne(`#${id}`);
        if (asset && assetNode) {
          const targetGroup = stage.findOne(`.${asset.layer}`);
          if (targetGroup) {
            assetNode.moveTo(targetGroup as Konva.Container);
          }
        }
      });

      if (isValid) {
        const moves: Array<{
          assetId: string;
          oldPosition: { x: number; y: number };
          newPosition: { x: number; y: number };
        }> = [];
        currentSelection.forEach((id) => {
          const asset = placedAssetsRef.current.find((a) => a.id === id); // Use ref
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
        currentSelection.forEach((id) => {
          const assetNode = stage.findOne(`#${id}`);
          const asset = placedAssetsRef.current.find((a) => a.id === id); // Use ref
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
      setDraggedAssetNodePositions(new Map());
    },
    [onAssetMoved, stageRef],
  );

  const handleKeyDown = useCallback(
    (e: KeyboardEvent) => {
      if (selectedAssetIds.length === 0 || !availableActions.canDelete) return;

      if (e.key === 'Delete') {
        e.preventDefault();
        onAssetDeleted();
      }
    },
    [selectedAssetIds, onAssetDeleted, availableActions.canDelete],
  );

  useEffect(() => {
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [handleKeyDown]);

  const handleStageClick = useCallback(
    (e: Konva.KonvaEventObject<MouseEvent>) => {
      const stage = stageRef.current;
      if (!stage) return;
      if (e.evt.button !== 0) return;
      if (e.target === stage && !marqueeActiveRef.current) {
        onAssetSelected([]);
      }
    },
    [stageRef, onAssetSelected],
  );

  useEffect(() => {
    if (!enableDragMove) return;

    const stage = stageRef.current;
    if (!stage) return;

    stage.on('click', handleStageClick);
    return () => {
      stage.off('click', handleStageClick);
    };
  }, [enableDragMove, stageRef, handleStageClick]);

  const handleMouseDown = useCallback(
    (e: Konva.KonvaEventObject<MouseEvent>) => {
      const stage = stageRef.current;
      if (!stage) return;
      if (e.evt.button !== 0 || e.target !== stage) {
        return;
      }

      const pos = stage.getPointerPosition();
      if (!pos) {
        return;
      }

      const scale = stage.scaleX();
      const stagePos = {
        x: (pos.x - stage.x()) / scale,
        y: (pos.y - stage.y()) / scale,
      };

      setMarqueeSelection({ start: stagePos, end: stagePos });
      marqueeActiveRef.current = true;
    },
    [stageRef],
  );

  const handleMouseMove = useCallback(
    (e: Konva.KonvaEventObject<MouseEvent>) => {
      const stage = stageRef.current;
      if (!stage) return;

      setMarqueeSelection((prev) => {
        if (!prev) return prev;
        if ((e.evt.buttons & 1) === 0) return prev;

        const pos = stage.getPointerPosition();
        if (!pos) return prev;

        const scale = stage.scaleX();
        const stagePos = {
          x: (pos.x - stage.x()) / scale,
          y: (pos.y - stage.y()) / scale,
        };

        return { ...prev, end: stagePos };
      });
    },
    [stageRef],
  );

  const handleMouseUp = useCallback(
    (e: Konva.KonvaEventObject<MouseEvent>) => {
      setMarqueeSelection((currentMarquee) => {
        if (!currentMarquee) return null;
        if (e.evt.button !== 0) return currentMarquee;

        const rect = {
          left: Math.min(currentMarquee.start.x, currentMarquee.end.x),
          right: Math.max(currentMarquee.start.x, currentMarquee.end.x),
          top: Math.min(currentMarquee.start.y, currentMarquee.end.y),
          bottom: Math.max(currentMarquee.start.y, currentMarquee.end.y),
        };

        const currentAssets = placedAssetsRef.current;
        const containedAssets = currentAssets
          .filter((asset) => {
            if (!isAssetInScope(asset, activeScope)) {
              return false;
            }

            const assetLeft = asset.position.x - asset.size.width / 2;
            const assetRight = asset.position.x + asset.size.width / 2;
            const assetTop = asset.position.y - asset.size.height / 2;
            const assetBottom = asset.position.y + asset.size.height / 2;

            return (
              assetLeft >= rect.left && assetRight <= rect.right && assetTop >= rect.top && assetBottom <= rect.bottom
            );
          })
          .map((a) => a.id);

        const currentSelection = selectedAssetIdsRef.current;
        if (isCtrlPressed) {
          const newSelection = [...currentSelection];
          containedAssets.forEach((id) => {
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

        setTimeout(() => {
          marqueeActiveRef.current = false;
        }, 100);

        return null;
      });
    },
    [isCtrlPressed, onAssetSelected, activeScope],
  );

  useEffect(() => {
    if (!enableDragMove) return;

    const stage = stageRef.current;
    if (!stage) return;

    stage.on('mousedown', handleMouseDown);
    stage.on('mousemove', handleMouseMove);
    stage.on('mouseup', handleMouseUp);

    return () => {
      stage.off('mousedown', handleMouseDown);
      stage.off('mousemove', handleMouseMove);
      stage.off('mouseup', handleMouseUp);
    };
  }, [enableDragMove, stageRef, handleMouseDown, handleMouseMove, handleMouseUp]);

  const handleStageClickCapture = useCallback(
    (e: Konva.KonvaEventObject<MouseEvent>) => {
      const stage = stageRef.current;
      if (!stage) return;

      if (e.target === stage) {
        return;
      }

      const targetId = e.target.id();
      if (!targetId) {
        return;
      }

      handleNodeClick(e);
    },
    [stageRef, handleNodeClick],
  );

  useEffect(() => {
    if (!enableDragMove) return;

    const stage = stageRef.current;
    if (!stage) return;

    stage.on('click', handleStageClickCapture);

    return () => {
      stage.off('click', handleStageClickCapture);
    };
  }, [enableDragMove, stageRef, handleStageClickCapture, activeScope]);

  useEffect(() => {
    if (!enableDragMove) return;
    const stage = stageRef.current;
    if (!stage) return;

    placedAssets.forEach((placedAsset) => {
      const node = stage.findOne(`#${placedAsset.id}`);
      if (node) {
        node.off('dragstart', handleDragStart);
        node.off('dragmove', handleDragMove);
        node.off('dragend', handleDragEnd);
        node.on('dragstart', handleDragStart);
        node.on('dragmove', handleDragMove);
        node.on('dragend', handleDragEnd);
      }
    });

    if (!hasCalledReadyRef.current && onReady) {
      hasCalledReadyRef.current = true;
      onReady();
    }

    return () => {
      placedAssets.forEach((placedAsset) => {
        const node = stage?.findOne(`#${placedAsset.id}`);
        if (node) {
          node.off('dragstart', handleDragStart);
          node.off('dragmove', handleDragMove);
          node.off('dragend', handleDragEnd);
        }
      });
    };
  }, [stageRef, enableDragMove, placedAssets, handleDragStart, handleDragMove, handleDragEnd, onReady]);

  useEffect(() => {
    if (!enableDragMove) return;
    const stage = stageRef.current;
    if (!stage) return;

    placedAssets.forEach((placedAsset) => {
      const node = stage.findOne(`#${placedAsset.id}`);
      if (node) {
        const behavior = getPlacementBehavior(placedAsset.asset.classification.kind);

        const isDraggable =
          behavior.canMove &&
          (selectedAssetIds.length === 0 || !selectedAssetIds.includes(placedAsset.id) || availableActions.canMove);
        node.draggable(isDraggable);
      }
    });
  }, [enableDragMove, stageRef, placedAssets, selectedAssetIds, availableActions.canMove]);

  const getAssetRenderPosition = useCallback(
    (assetId: string) => {
      const asset = placedAssets.find((a) => a.id === assetId);
      if (!asset) return null;

      const draggedNodePos = draggedAssetNodePositions.get(assetId);
      if (draggedNodePos) {
        return {
          x: draggedNodePos.x - asset.size.width / 2,
          y: draggedNodePos.y - asset.size.height / 2,
          width: asset.size.width,
          height: asset.size.height,
        };
      }

      return {
        x: asset.position.x - asset.size.width / 2,
        y: asset.position.y - asset.size.height / 2,
        width: asset.size.width,
        height: asset.size.height,
      };
    },
    [placedAssets, draggedAssetNodePositions],
  );

  const selectedAssets = React.useMemo(() => {
    return placedAssets.filter((asset) => selectedAssetIds.includes(asset.id));
  }, [placedAssets, selectedAssetIds]);

  const handleRotationMouseDown = useCallback(
    (e: Konva.KonvaEventObject<MouseEvent>, assetId: string, assetPosition: { x: number; y: number }) => {
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
          y: (pointerPosition.y - stage.y()) / stage.scaleY(),
        };

        const assetCenter = {
          x: assetPosition.x,
          y: assetPosition.y,
        };
        const newRotation = snapAngle(calculateAngleFromCenter(assetCenter, canvasPosition));
        onAssetRotated?.([{ assetId, rotation: newRotation }]);
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
    },
    [onRotationStart, onRotationEnd, onAssetRotated],
  );

  return (
    <Layer name={LayerName.SelectionHandles} listening={true}>
      {selectedAssetIds.map((assetId) => {
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

        const asset = selectedAssets[0];
        if (!asset) return null;

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
              onMouseDown={(e) => handleRotationMouseDown(e, asset.id, asset.position)}
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
          fill='rgba(33, 150, 243, 0.2)'
          stroke={theme.palette.primary.main}
          strokeWidth={1}
          dash={[4, 4]}
          listening={false}
        />
      )}

      {/* Invalid placement indicators - show on each colliding asset */}
      {invalidAssetPositions.map((pos) => (
        <React.Fragment key={`invalid-${pos.x}-${pos.y}`}>{renderInvalidIndicator(pos)}</React.Fragment>
      ))}
    </Layer>
  );
};

TokenDragHandle.displayName = 'TokenDragHandle';
