import { useTheme } from '@mui/material/styles';
import type Konva from 'konva';
import type React from 'react';
import { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import { Circle, Group, Image as KonvaImage, Layer, Line, Rect, Text } from 'react-konva';
import { getApiEndpoints } from '@/config/development';
import { GroupName, LayerName } from '@/services/layerManager';
import type { Asset, CreatureAsset, Encounter, ObjectAsset, PlacedAsset } from '@/types/domain';
import { LabelVisibility as DisplayNameEnum, LabelPosition as LabelPositionEnum } from '@/types/domain';
import { getPlacementBehavior, validatePlacement } from '@/types/placement';
import { getEffectiveLabelPosition, getEffectiveLabelVisibility } from '@/utils/displayHelpers';
import type { GridConfig } from '@/utils/gridCalculator';
import { GridType } from '@/utils/gridCalculator';
import { formatCreatureLabel } from './tokenPlacementUtils';

const LABEL_PADDING = 4;
const LABEL_HORIZONTAL_PADDING = 8;
const LABEL_VERTICAL_PADDING = 4;
const MAX_LABEL_WIDTH_COLLAPSED = 75;
const MIN_LABEL_WIDTH = 25;
const LABEL_FONT_SIZE = 12;
const LABEL_FONT_FAMILY = 'Arial';

export interface TokenPlacementProps {
  /** Assets to place on canvas (managed by parent) */
  placedAssets: PlacedAsset[];
  /** Callback when new asset is placed */
  onAssetPlaced: (asset: PlacedAsset) => void;
  /** Callback when asset is moved */
  onAssetMoved: (
    moves: Array<{
      assetId: string;
      oldPosition: { x: number; y: number };
      newPosition: { x: number; y: number };
    }>,
  ) => void;
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
  /** Callback when context menu is requested */
  onContextMenu?: (assetId: string, position: { x: number; y: number }) => void;
  /** Current encounter for display settings */
  encounter: Encounter;
}

const getTokenImageUrl = (asset: Asset): string | null => {
  if (!asset?.tokens || !Array.isArray(asset.tokens)) {
    return null;
  }

  const mediaBaseUrl = getApiEndpoints().media;

  const defaultToken = asset.tokens.find((t) => t.isDefault);

  if (defaultToken) {
    return `${mediaBaseUrl}/${defaultToken.token.id}`;
  }

  if (asset.tokens.length > 0 && asset.tokens[0]) {
    return `${mediaBaseUrl}/${asset.tokens[0].token.id}`;
  }

  if (asset.portrait) {
    return `${mediaBaseUrl}/${asset.portrait.id}`;
  }

  return null;
};

const getAssetGroup = (asset: Asset): GroupName => {
  if (asset.kind === 'Creature') {
    return GroupName.Creatures;
  }

  if (asset.kind === 'Object') {
    const objectAsset = asset as ObjectAsset;
    if (objectAsset.isOpaque) {
      return GroupName.Structure;
    }
  }

  return GroupName.Objects;
};

const getAssetSize = (asset: Asset): { width: number; height: number } => {
  if (asset.size?.width && asset.size?.height) {
    return { width: asset.size.width, height: asset.size.height };
  }

  return { width: 1, height: 1 };
};

const measureTextWidth = (
  text: string,
  fontSize: number = LABEL_FONT_SIZE,
  fontFamily: string = LABEL_FONT_FAMILY,
): number => {
  const ctx = document.createElement('canvas').getContext('2d');
  if (!ctx) {
    return text.length * fontSize * 0.6;
  }
  ctx.font = `${fontSize}px ${fontFamily}`;
  return ctx.measureText(text).width;
};

const measureTextHeight = (fontSize: number = LABEL_FONT_SIZE): number => {
  return fontSize * 1.2;
};

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
  const tooltipWidth = measureTextWidth(tooltip.text, LABEL_FONT_SIZE, LABEL_FONT_FAMILY) + LABEL_HORIZONTAL_PADDING;
  const tooltipHeight = measureTextHeight(LABEL_FONT_SIZE) + LABEL_VERTICAL_PADDING;

  return (
    <Group x={tooltip.canvasX + 10} y={tooltip.canvasY + 10}>
      <Rect
        width={tooltipWidth}
        height={tooltipHeight}
        fill={labelColors.background}
        stroke={labelColors.border}
        strokeWidth={1}
        opacity={0.667}
      />
      <Text
        text={tooltip.text}
        fontSize={LABEL_FONT_SIZE}
        fontFamily={LABEL_FONT_FAMILY}
        fill={labelColors.text}
        padding={LABEL_HORIZONTAL_PADDING / 2}
        width={tooltipWidth}
        height={tooltipHeight}
        align='center'
        verticalAlign='middle'
        opacity={0.667}
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
  snapMode: 'free' | 'grid' | 'half-step',
): { x: number; y: number } => {
  if (snapMode === 'free' || gridConfig.type === GridType.NoGrid) {
    return position;
  }

  const { cellSize, offset } = gridConfig;
  const { width: cellWidth, height: cellHeight } = cellSize;
  const { left: offsetX, top: offsetY } = offset;

  // Base snap interval per dimension: <= 0.5 → 0.5 cells, > 0.5 → 1.0 cells
  const getBaseSnapIntervalCells = (sizeInCells: number) => (sizeInCells <= 0.5 ? 0.5 : 1.0);

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
  const snapX =
    Math.round((position.x - offsetX - offsetWidthPixels) / snapWidth) * snapWidth + offsetX + offsetWidthPixels;
  const snapY =
    Math.round((position.y - offsetY - offsetHeightPixels) / snapHeight) * snapHeight + offsetY + offsetHeightPixels;

  return { x: snapX, y: snapY };
};

export const TokenPlacement: React.FC<TokenPlacementProps> = ({
  placedAssets,
  onAssetPlaced,
  gridConfig,
  draggedAsset,
  onDragComplete,
  onImagesLoaded,
  snapMode,
  onContextMenu,
}) => {
  const theme = useTheme();
  const [cursorPosition, setCursorPosition] = useState<{
    x: number;
    y: number;
  } | null>(null);
  const [imageCache, setImageCache] = useState<Map<string, HTMLImageElement>>(new Map());
  const [isValidPlacement, setIsValidPlacement] = useState(true);
  const [tooltip, _setTooltip] = useState<{
    visible: boolean;
    text: string;
    x: number;
    y: number;
    canvasX: number;
    canvasY: number;
  } | null>(null);
  const [expandedAssetId, setExpandedAssetId] = useState<string | null>(null);
  const [hoveredAssetId, setHoveredAssetId] = useState<string | null>(null);
  const snapModeRef = useRef(snapMode);
  const layerRef = useRef<Konva.Layer>(null);

  const labelColors = useMemo(
    () => ({
      background: theme.palette.background.paper,
      border: theme.palette.divider,
      text: theme.palette.text.primary,
    }),
    [theme.palette.background.paper, theme.palette.divider, theme.palette.text.primary],
  );

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
        requestAnimationFrame(() => {
          setCursorPosition({ x: centerX, y: centerY });
        });
      }
    } else if (!draggedAsset) {
      requestAnimationFrame(() => {
        setCursorPosition(null);
      });
    }
  }, [draggedAsset, cursorPosition]);

  const loadImage = useCallback((url: string): Promise<HTMLImageElement> => {
    return new Promise((resolve, reject) => {
      const img = new window.Image();
      img.crossOrigin = 'use-credentials';
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
          for (const [key, img] of newCache) {
            updatedCache.set(key, img);
          }
          return updatedCache;
        });
      }

      const totalAssetsNeeded = placedAssets.length;
      const totalAssetsLoaded = placedAssets.filter((a) => imageCache.has(a.assetId) || newCache.has(a.assetId)).length;

      if (totalAssetsNeeded === 0 || (allLoaded && totalAssetsLoaded === totalAssetsNeeded)) {
        onImagesLoaded?.();
      }
    };

    loadImages();
  }, [placedAssets, draggedAsset, loadImage, imageCache, onImagesLoaded]);

  const handleMouseMove = useCallback(
    (e: Konva.KonvaEventObject<MouseEvent>) => {
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
      const objectProperties =
        draggedAsset.kind === 'Object'
          ? {
              size: (draggedAsset as ObjectAsset).size,
              isMovable: (draggedAsset as ObjectAsset).isMovable,
              isOpaque: (draggedAsset as ObjectAsset).isOpaque,
            }
          : undefined;
      const creatureProperties =
        draggedAsset.kind === 'Creature'
          ? {
              size: (draggedAsset as CreatureAsset).size,
              category: (draggedAsset as CreatureAsset).category,
            }
          : undefined;

      const behavior = getPlacementBehavior(draggedAsset.kind, objectProperties, creatureProperties);

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
        placedAssets
          .filter((a) => {
            return (
              a.position &&
              typeof a.position.x === 'number' &&
              typeof a.position.y === 'number' &&
              a.size &&
              typeof a.size.width === 'number' &&
              typeof a.size.height === 'number' &&
              a.size.width > 0 &&
              a.size.height > 0 &&
              Number.isFinite(a.position.x) &&
              Number.isFinite(a.position.y) &&
              Number.isFinite(a.size.width) &&
              Number.isFinite(a.size.height)
            );
          })
          .map((a) => {
            const objectData =
              a.asset.kind === 'Object'
                ? {
                    size: (a.asset as ObjectAsset).size,
                    isMovable: (a.asset as ObjectAsset).isMovable,
                    isOpaque: (a.asset as ObjectAsset).isOpaque,
                  }
                : undefined;
            const creatureData =
              a.asset.kind === 'Creature'
                ? {
                    size: (a.asset as CreatureAsset).size,
                    category: (a.asset as CreatureAsset).category,
                  }
                : undefined;

            return {
              x: a.position.x,
              y: a.position.y,
              width: a.size.width,
              height: a.size.height,
              allowOverlap: getPlacementBehavior(a.asset.kind, objectData, creatureData).allowOverlap,
            };
          }),
        gridConfig,
        isShiftPressed,
      );

      setIsValidPlacement(validation.valid);
    },
    [draggedAsset, gridConfig, placedAssets],
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

      if (!cursorPosition) {
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
        visible: true,
        locked: false,
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
    [draggedAsset, cursorPosition, gridConfig, isValidPlacement, onAssetPlaced, onDragComplete, placedAssets.length],
  );

  const renderAssetsByGroup = (groupName: GroupName) => {
    return placedAssets
      .filter((placedAsset) => placedAsset.layer === groupName)
      .map((placedAsset) => {
        const image = imageCache.get(placedAsset.assetId);
        if (!image) return null;

        // Calculate size from asset's NamedSize (in grid cells) multiplied by cell size
        const assetCellSize = getAssetSize(placedAsset.asset);
        const pixelWidth = assetCellSize.width * gridConfig.cellSize.width;
        const pixelHeight = assetCellSize.height * gridConfig.cellSize.height;

        const isCreature = placedAsset.asset.kind === 'Creature';

        if (isCreature) {
          const isHovered = hoveredAssetId === placedAsset.id;
          const isExpanded = expandedAssetId === placedAsset.id;
          const effectiveDisplay = getEffectiveLabelVisibility(placedAsset);
          const effectivePosition = getEffectiveLabelPosition(placedAsset);

          const showLabel =
            effectiveDisplay === DisplayNameEnum.Always || (effectiveDisplay === DisplayNameEnum.OnHover && isHovered);

          if (effectiveDisplay === DisplayNameEnum.Never || !showLabel) {
            return (
              <KonvaImage
                key={placedAsset.id}
                id={placedAsset.id}
                name='placed-asset'
                image={image}
                x={placedAsset.position.x}
                y={placedAsset.position.y}
                offsetX={pixelWidth / 2}
                offsetY={pixelHeight / 2}
                width={pixelWidth}
                height={pixelHeight}
                rotation={placedAsset.rotation}
                draggable={false}
                listening={true}
                opacity={0.667}
                onMouseEnter={() => setHoveredAssetId(placedAsset.id)}
                onMouseLeave={() => setHoveredAssetId(null)}
                onContextMenu={(e) => {
                  e.evt.preventDefault();
                  if (onContextMenu) {
                    onContextMenu(placedAsset.id, {
                      x: e.evt.clientX,
                      y: e.evt.clientY,
                    });
                  }
                }}
              />
            );
          }

          const labelInfo = formatCreatureLabel(placedAsset.name, MAX_LABEL_WIDTH_COLLAPSED);
          // Show full text if expanded OR if label visibility is "on hover"
          const showFullText = (isExpanded && labelInfo.isTruncated) || effectiveDisplay === DisplayNameEnum.OnHover;
          const displayText = showFullText ? labelInfo.fullText : labelInfo.displayText;

          const measuredWidth = showFullText ? labelInfo.fullWidth : labelInfo.displayWidth;

          const labelWidth = showFullText
            ? measuredWidth + LABEL_HORIZONTAL_PADDING
            : Math.max(MIN_LABEL_WIDTH, Math.min(MAX_LABEL_WIDTH_COLLAPSED, measuredWidth + LABEL_HORIZONTAL_PADDING));

          const labelHeight = labelInfo.displayHeight + LABEL_VERTICAL_PADDING;

          const halfHeight = pixelHeight / 2;
          let labelY: number;

          switch (effectivePosition) {
            case LabelPositionEnum.Top:
              labelY = placedAsset.position.y - halfHeight - LABEL_PADDING - labelHeight;
              break;
            case LabelPositionEnum.Middle:
              labelY = placedAsset.position.y - labelHeight / 2;
              break;
            default:
              labelY = placedAsset.position.y + halfHeight + LABEL_PADDING;
              break;
          }

          const labelX = placedAsset.position.x - labelWidth / 2;

          return (
            <Group
              key={placedAsset.id}
              id={placedAsset.id}
              name='placed-asset'
              x={placedAsset.position.x}
              y={placedAsset.position.y}
            >
              <KonvaImage
                image={image}
                x={0}
                y={0}
                offsetX={pixelWidth / 2}
                offsetY={pixelHeight / 2}
                width={pixelWidth}
                height={pixelHeight}
                rotation={placedAsset.rotation}
                draggable={false}
                listening={true}
                opacity={0.667}
                onMouseEnter={() => setHoveredAssetId(placedAsset.id)}
                onMouseLeave={() => setHoveredAssetId(null)}
                onContextMenu={(e) => {
                  e.evt.preventDefault();
                  if (onContextMenu) {
                    onContextMenu(placedAsset.id, {
                      x: e.evt.clientX,
                      y: e.evt.clientY,
                    });
                  }
                }}
              />
              <Rect
                x={labelX - placedAsset.position.x}
                y={labelY - placedAsset.position.y}
                width={labelWidth}
                height={labelHeight}
                fill={labelColors.background}
                stroke={labelColors.border}
                strokeWidth={1}
                listening={true}
                opacity={0.667}
                onMouseEnter={() => {
                  setHoveredAssetId(placedAsset.id);
                  if (labelInfo.isTruncated) {
                    setExpandedAssetId(placedAsset.id);
                  }
                }}
                onMouseLeave={() => {
                  setHoveredAssetId(null);
                  setExpandedAssetId(null);
                }}
              />
              <Text
                x={labelX - placedAsset.position.x}
                y={labelY - placedAsset.position.y}
                width={labelWidth}
                height={labelHeight}
                text={displayText}
                fontSize={LABEL_FONT_SIZE}
                fontFamily={LABEL_FONT_FAMILY}
                fill={labelColors.text}
                align='center'
                verticalAlign='middle'
                listening={false}
                opacity={0.667}
              />
            </Group>
          );
        }

        const isHovered = hoveredAssetId === placedAsset.id;
        const isExpanded = expandedAssetId === placedAsset.id;

        const effectiveDisplay = getEffectiveLabelVisibility(placedAsset);
        const effectivePosition = getEffectiveLabelPosition(placedAsset);

        const showLabel =
          effectiveDisplay === DisplayNameEnum.Always || (effectiveDisplay === DisplayNameEnum.OnHover && isHovered);

        if (effectiveDisplay === DisplayNameEnum.Never || !showLabel) {
          return (
            <Group
              key={placedAsset.id}
              id={placedAsset.id}
              name='placed-asset'
              x={placedAsset.position.x}
              y={placedAsset.position.y}
            >
              <KonvaImage
                image={image}
                x={0}
                y={0}
                offsetX={pixelWidth / 2}
                offsetY={pixelHeight / 2}
                width={pixelWidth}
                height={pixelHeight}
                rotation={placedAsset.rotation}
                draggable={false}
                listening={true}
                opacity={0.75}
                onMouseEnter={() => setHoveredAssetId(placedAsset.id)}
                onMouseLeave={() => setHoveredAssetId(null)}
                onContextMenu={(e) => {
                  e.evt.preventDefault();
                  if (onContextMenu) {
                    onContextMenu(placedAsset.id, {
                      x: e.evt.clientX,
                      y: e.evt.clientY,
                    });
                  }
                }}
              />
            </Group>
          );
        }

        const labelInfo = formatCreatureLabel(placedAsset.name, MAX_LABEL_WIDTH_COLLAPSED);
        // Show full text if expanded OR if label visibility is "on hover"
        const showFullText = (isExpanded && labelInfo.isTruncated) || effectiveDisplay === DisplayNameEnum.OnHover;
        const displayText = showFullText ? labelInfo.fullText : labelInfo.displayText;

        const measuredWidth = showFullText ? labelInfo.fullWidth : labelInfo.displayWidth;

        const labelWidth = showFullText
          ? measuredWidth + LABEL_HORIZONTAL_PADDING
          : Math.max(MIN_LABEL_WIDTH, Math.min(MAX_LABEL_WIDTH_COLLAPSED, measuredWidth + LABEL_HORIZONTAL_PADDING));

        const labelHeight = labelInfo.displayHeight + LABEL_VERTICAL_PADDING;

        const halfHeight = pixelHeight / 2;
        let labelY: number;

        switch (effectivePosition) {
          case LabelPositionEnum.Top:
            labelY = placedAsset.position.y - halfHeight - LABEL_PADDING - labelHeight;
            break;
          case LabelPositionEnum.Middle:
            labelY = placedAsset.position.y - labelHeight / 2;
            break;
          default:
            labelY = placedAsset.position.y + halfHeight + LABEL_PADDING;
            break;
        }

        const labelX = placedAsset.position.x - labelWidth / 2;

        return (
          <Group
            key={placedAsset.id}
            id={placedAsset.id}
            name='placed-asset'
            x={placedAsset.position.x}
            y={placedAsset.position.y}
          >
            <KonvaImage
              image={image}
              x={0}
              y={0}
              offsetX={pixelWidth / 2}
              offsetY={pixelHeight / 2}
              width={pixelWidth}
              height={pixelHeight}
              rotation={placedAsset.rotation}
              draggable={false}
              listening={true}
              opacity={0.75}
              onMouseEnter={() => setHoveredAssetId(placedAsset.id)}
              onMouseLeave={() => setHoveredAssetId(null)}
              onContextMenu={(e) => {
                e.evt.preventDefault();
                if (onContextMenu) {
                  onContextMenu(placedAsset.id, {
                    x: e.evt.clientX,
                    y: e.evt.clientY,
                  });
                }
              }}
            />
            <Rect
              x={labelX - placedAsset.position.x}
              y={labelY - placedAsset.position.y}
              width={labelWidth}
              height={labelHeight}
              fill={labelColors.background}
              stroke={labelColors.border}
              strokeWidth={1}
              listening={true}
              opacity={0.75}
              onMouseEnter={() => {
                setHoveredAssetId(placedAsset.id);
                if (labelInfo.isTruncated) {
                  setExpandedAssetId(placedAsset.id);
                }
              }}
              onMouseLeave={() => {
                setHoveredAssetId(null);
                setExpandedAssetId(null);
              }}
            />
            <Text
              x={labelX - placedAsset.position.x}
              y={labelY - placedAsset.position.y}
              width={labelWidth}
              height={labelHeight}
              text={displayText}
              fontSize={LABEL_FONT_SIZE}
              fontFamily={LABEL_FONT_FAMILY}
              fill={labelColors.text}
              align='center'
              verticalAlign='middle'
              listening={false}
              opacity={0.75}
            />
          </Group>
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
      height: assetCellSize.height * gridConfig.cellSize.height,
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
      {...(draggedAsset && { onMouseMove: handleMouseMove })}
      {...(draggedAsset && { onClick: handleClick })}
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
      {draggedAsset && <Rect x={-10000} y={-10000} width={20000} height={20000} fill='transparent' listening={true} />}

      <Group name={GroupName.Structure}>{renderAssetsByGroup(GroupName.Structure)}</Group>

      <Group name={GroupName.Objects}>{renderAssetsByGroup(GroupName.Objects)}</Group>

      <Group name={GroupName.Creatures}>{renderAssetsByGroup(GroupName.Creatures)}</Group>

      {/* Preview Group - Renders last so preview is always on top */}
      <Group name='preview'>{renderPreview()}</Group>

      {/* Drag Preview Group - For temporarily holding dragged assets (renders above everything) */}
      <Group name='drag-preview' />

      {tooltip?.visible && <TooltipRenderer tooltip={tooltip} labelColors={labelColors} />}
    </Layer>
  );
};

TokenPlacement.displayName = 'TokenPlacement';
