import { useTheme } from '@mui/material/styles';
import type Konva from 'konva';
import type React from 'react';
import { useMemo, useRef, useState } from 'react';
import { Circle, Group, Image as KonvaImage, Layer, Line, Rect, Text } from 'react-konva';

import { GroupName, LayerName } from '@/services/layerManager';
import type { Asset, Encounter, PlacedAsset } from '@/types/domain';
import type { GridConfig } from '@/utils/gridCalculator';
import { type InteractionScope, isAssetInScope } from '@/utils/scopeFiltering';
import { SnapMode } from '@/utils/snapping';
import { useAssetImageLoader } from '@/hooks/useAssetImageLoader';
import { useEntityInteraction } from '@/hooks/useEntityInteraction';
import { useEntityRenderingData } from '@/hooks/useEntityRenderingData';
import { PlacedEntity } from './PlacedEntity';
import { getAssetSize, measureTextHeight, measureTextWidth } from './tokenPlacementUtils';


const LABEL_HORIZONTAL_PADDING = 8;
const LABEL_VERTICAL_PADDING = 4;
const LABEL_FONT_SIZE = 12;
const LABEL_FONT_FAMILY = 'Arial';

export interface EntityPlacementProps {
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
  snapMode: SnapMode;
  /** Callback when context menu is requested */
  onContextMenu?: (assetId: string, position: { x: number; y: number }) => void;
  /** Current encounter for display settings */
  encounter: Encounter;
  /** Active interaction scope for filtering interactions */
  activeScope?: InteractionScope;
}





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
  const tooltipWidth = useMemo(
    () => measureTextWidth(tooltip.text, LABEL_FONT_SIZE, LABEL_FONT_FAMILY) + LABEL_HORIZONTAL_PADDING,
    [tooltip.text]
  );
  const tooltipHeight = useMemo(
    () => measureTextHeight(LABEL_FONT_SIZE) + LABEL_VERTICAL_PADDING,
    []
  );

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



export const EntityPlacement: React.FC<EntityPlacementProps> = ({
  placedAssets,
  onAssetPlaced,
  gridConfig,
  draggedAsset,
  onDragComplete,
  onImagesLoaded,
  snapMode,
  onContextMenu,
  activeScope,
}) => {
  const theme = useTheme();
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
  const layerRef = useRef<Konva.Layer>(null);

  // Use the extracted hook for rendering data
  const {
    labelColors,
    labelVisibilityMap,
    labelPositionMap,
    assetRenderData,
    collisionData
  } = useEntityRenderingData(placedAssets, gridConfig, theme);

  const {
    cursorPosition,
    isValidPlacement,
    handleMouseMove,
    handleClick
  } = useEntityInteraction({
    draggedAsset,
    gridConfig,
    snapMode,
    placedAssets,
    onAssetPlaced,
    onDragComplete,
    collisionData,
  });

  const imageCache = useAssetImageLoader({
    placedAssets,
    draggedAsset,
    onImagesLoaded,
  });

  const renderAssetsByGroup = (groupName: GroupName) => {
    return placedAssets
      .filter((placedAsset) => placedAsset.layer === groupName)
      .map((placedAsset) => {
        const image = imageCache.get(placedAsset.assetId);
        if (!image) return null;

        const renderData = assetRenderData.get(placedAsset.id);
        if (!renderData) return null;

        const isInteractive = isAssetInScope(placedAsset, activeScope);

        return (
          <PlacedEntity
            key={placedAsset.id}
            placedAsset={placedAsset}
            image={image}
            renderData={renderData}
            labelVisibility={labelVisibilityMap.get(placedAsset.id)!}
            labelPosition={labelPositionMap.get(placedAsset.id)!}
            labelColors={labelColors}
            isInteractive={isInteractive}
            isHovered={hoveredAssetId === placedAsset.id}
            isExpanded={expandedAssetId === placedAsset.id}
            onHoverStart={setHoveredAssetId}
            onHoverEnd={() => setHoveredAssetId(null)}
            onExpandStart={setExpandedAssetId}
            onExpandEnd={() => setExpandedAssetId(null)}
            onContextMenu={onContextMenu}
          />
        );
      });
  };

  const previewSize = useMemo(() => {
    if (!draggedAsset) return null;
    const assetCellSize = getAssetSize(draggedAsset);
    return {
      width: assetCellSize.width * gridConfig.cellSize.width,
      height: assetCellSize.height * gridConfig.cellSize.height,
    };
  }, [draggedAsset, gridConfig.cellSize]);

  const renderPreview = () => {
    if (!draggedAsset || !cursorPosition || !previewSize) return null;

    const image = imageCache.get(draggedAsset.id);
    if (!image) return null;

    return (
      <>
        <KonvaImage
          image={image}
          x={cursorPosition.x - previewSize.width / 2}
          y={cursorPosition.y - previewSize.height / 2}
          width={previewSize.width}
          height={previewSize.height}
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
      name={LayerName.Assets}
      listening={true}
      {...(draggedAsset && { onMouseMove: handleMouseMove })}
      {...(draggedAsset && { onClick: handleClick })}
    >
      {/* Invisible hit area for placement cursor tracking */}
      {draggedAsset && <Rect x={-10000} y={-10000} width={20000} height={20000} fill='transparent' listening={true} />}

      <Group name={GroupName.Structure}>{renderAssetsByGroup(GroupName.Structure)}</Group>

      <Group name={GroupName.Objects}>{renderAssetsByGroup(GroupName.Objects)}</Group>

      <Group name={GroupName.Monsters}>{renderAssetsByGroup(GroupName.Monsters)}</Group>

      <Group name={GroupName.Characters}>{renderAssetsByGroup(GroupName.Characters)}</Group>

      {/* Preview Group - Renders last so preview is always on top */}
      <Group name='preview'>{renderPreview()}</Group>

      {/* Drag Preview Group - For temporarily holding dragged assets (renders above everything) */}
      <Group name='drag-preview' />

      {tooltip?.visible && <TooltipRenderer tooltip={tooltip} labelColors={labelColors} />}
    </Layer>
  );
};

EntityPlacement.displayName = 'EntityPlacement';
