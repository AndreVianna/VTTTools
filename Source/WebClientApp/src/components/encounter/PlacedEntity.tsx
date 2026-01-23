import type { KonvaEventObject } from 'konva/lib/Node';
import React, { useMemo } from 'react';
import { Group, Image as KonvaImage, Rect, Text } from 'react-konva';
import type { PlacedAsset } from '@/types/domain';
import { AssetKind, LabelVisibility as DisplayNameEnum, LabelPosition as LabelPositionEnum } from '@/types/domain';
import type { AssetRenderData } from '@/hooks/useEntityRenderingData';
import type { GridConfig } from '@/utils/gridCalculator';
import { createDragBoundFunc, snap, SnapMode } from '@/utils/snapping';

export interface PlacedEntityProps {
    placedAsset: PlacedAsset;
    image: HTMLImageElement;
    renderData: AssetRenderData;
    labelVisibility: DisplayNameEnum;
    labelPosition: LabelPositionEnum;
    labelColors: {
        background: string;
        border: string;
        text: string;
    };
    isInteractive: boolean;
    isHovered: boolean;
    isExpanded: boolean;
    /** Whether this asset can be dragged (selected in play mode) */
    isDraggable?: boolean;
    /** Grid configuration for snapping */
    gridConfig?: GridConfig;
    /** Current snap mode (from keyboard modifiers) */
    snapMode?: SnapMode;
    onHoverStart: (id: string) => void;
    onHoverEnd: () => void;
    onExpandStart: (id: string) => void;
    onExpandEnd: () => void;
    onContextMenu?: ((id: string, position: { x: number; y: number }) => void) | undefined;
    onClick?: ((id: string) => void) | undefined;
    /** Callback during drag with current position (for real-time selection border updates) */
    onDrag?: ((id: string, position: { x: number; y: number }) => void) | undefined;
    /** Callback when drag ends with new position */
    onDragEnd?: ((id: string, position: { x: number; y: number }) => void) | undefined;
}

const LABEL_PADDING = 4;
const LABEL_HORIZONTAL_PADDING = 8;
const LABEL_VERTICAL_PADDING = 4;
const MAX_LABEL_WIDTH_COLLAPSED = 75;
const MIN_LABEL_WIDTH = 25;
const LABEL_FONT_SIZE = 12;
const LABEL_FONT_FAMILY = 'Arial';

export const PlacedEntity: React.FC<PlacedEntityProps> = ({
    placedAsset,
    image,
    renderData,
    labelVisibility,
    labelPosition,
    labelColors,
    isInteractive,
    isHovered,
    isExpanded,
    isDraggable = false,
    gridConfig,
    snapMode = SnapMode.Free,
    onHoverStart,
    onHoverEnd,
    onExpandStart,
    onExpandEnd,
    onContextMenu,
    onClick,
    onDrag,
    onDragEnd,
}) => {
    const { pixelWidth, pixelHeight, formattedLabel } = renderData;

    // Create drag bound function for snapping
    const dragBoundFunc = useMemo(() => {
        if (!gridConfig || !isDraggable) return undefined;
        return createDragBoundFunc(
            gridConfig,
            () => snapMode,
            () => snapMode !== SnapMode.Free,
        );
    }, [gridConfig, isDraggable, snapMode]);
    const isMonster = placedAsset.asset.classification.kind === AssetKind.Creature;
    const showLabel =
        labelVisibility === DisplayNameEnum.Always || (labelVisibility === DisplayNameEnum.OnHover && isHovered);

    // Compute opacity: hidden assets show at 50% of normal opacity (for DM view)
    const baseOpacity = isMonster ? 0.667 : 0.75;
    const effectiveOpacity = placedAsset.isHidden ? baseOpacity * 0.5 : baseOpacity;

    const handleContextMenu = (e: KonvaEventObject<MouseEvent>) => {
        e.evt.preventDefault();
        if (onContextMenu) {
            onContextMenu(placedAsset.id, {
                x: e.evt.clientX,
                y: e.evt.clientY,
            });
        }
    };

    const handleClick = () => {
        if (onClick) {
            onClick(placedAsset.id);
        }
    };

    const handleDrag = (e: KonvaEventObject<DragEvent>) => {
        if (onDrag) {
            const node = e.target;
            let pos = { x: node.x(), y: node.y() };
            // Apply snapping for consistent position reporting with dragBoundFunc
            if (gridConfig && snapMode !== SnapMode.Free) {
                pos = snap(pos, gridConfig, snapMode);
            }
            onDrag(placedAsset.id, pos);
        }
    };

    const handleDragEnd = (e: KonvaEventObject<DragEvent>) => {
        if (onDragEnd) {
            const node = e.target;
            let pos = { x: node.x(), y: node.y() };
            // Apply snapping for consistent position reporting with dragBoundFunc
            if (gridConfig && snapMode !== SnapMode.Free) {
                pos = snap(pos, gridConfig, snapMode);
            }
            onDragEnd(placedAsset.id, pos);
        }
    };

    // Case 1: Hidden Label or Never Show
    if (labelVisibility === DisplayNameEnum.Never || !showLabel) {
        return (
            <Group
                key={placedAsset.id}
                id={placedAsset.id}
                name='placed-asset'
                x={placedAsset.position.x}
                y={placedAsset.position.y}
                draggable={isDraggable}
                dragBoundFunc={dragBoundFunc}
                onDragMove={handleDrag}
                onDragEnd={handleDragEnd}
            >
                <KonvaImage
                    id={placedAsset.id}
                    image={image}
                    x={0}
                    y={0}
                    offsetX={pixelWidth / 2}
                    offsetY={pixelHeight / 2}
                    width={pixelWidth}
                    height={pixelHeight}
                    rotation={placedAsset.rotation}
                    draggable={false}
                    listening={isInteractive}
                    opacity={effectiveOpacity}
                    onMouseEnter={() => onHoverStart(placedAsset.id)}
                    onMouseLeave={() => onHoverEnd()}
                    onContextMenu={handleContextMenu}
                    onClick={handleClick}
                />
            </Group>
        );
    }

    // Case 2: Simple Non-Monster Asset (No label formatting needed or missing)
    if (!isMonster && !formattedLabel) {
        return (
            <Group
                key={placedAsset.id}
                id={placedAsset.id}
                name='placed-asset'
                x={placedAsset.position.x}
                y={placedAsset.position.y}
                draggable={isDraggable}
                dragBoundFunc={dragBoundFunc}
                onDragMove={handleDrag}
                onDragEnd={handleDragEnd}
            >
                <KonvaImage
                    id={placedAsset.id}
                    image={image}
                    x={0}
                    y={0}
                    offsetX={pixelWidth / 2}
                    offsetY={pixelHeight / 2}
                    width={pixelWidth}
                    height={pixelHeight}
                    rotation={placedAsset.rotation}
                    draggable={false}
                    listening={isInteractive}
                    onMouseEnter={() => onHoverStart(placedAsset.id)}
                    onMouseLeave={() => onHoverEnd()}
                    onContextMenu={handleContextMenu}
                    onClick={handleClick}
                />
            </Group>
        );
    }

    // Case 3: Asset with Label (Monsters or formatted objects)
    const labelInfo = formattedLabel!;
    const showFullText =
        (isExpanded && labelInfo.isTruncated) || labelVisibility === DisplayNameEnum.OnHover;
    const displayText = showFullText ? labelInfo.fullText : labelInfo.displayText;
    const measuredWidth = showFullText ? labelInfo.fullWidth : labelInfo.displayWidth;

    const labelWidth = showFullText
        ? measuredWidth + LABEL_HORIZONTAL_PADDING
        : Math.max(
            MIN_LABEL_WIDTH,
            Math.min(MAX_LABEL_WIDTH_COLLAPSED, measuredWidth + LABEL_HORIZONTAL_PADDING)
        );

    const labelHeight = labelInfo.displayHeight + LABEL_VERTICAL_PADDING;
    const halfHeight = pixelHeight / 2;
    let labelY: number;

    switch (labelPosition) {
        case LabelPositionEnum.Top:
            labelY = -halfHeight - LABEL_PADDING - labelHeight;
            break;
        case LabelPositionEnum.Middle:
            labelY = -labelHeight / 2;
            break;
        default:
            labelY = halfHeight + LABEL_PADDING;
            break;
    }

    // Note: Since Group is already at placement position, coordinates are relative to Group (roughly 0,0 center)
    // However, Original code used distinct absolute calculations. Konva Groups usually handle local coords.
    // Let's check original EntityPlacement:
    // It set Group x/y to placedAsset.position.
    // Then elements inside used x={0}, y={0} or relative offsets.
    // BUT the label calculation in original code:
    // labelY = placedAsset.position.y (+/-) ...
    // labelX = placedAsset.position.x - labelWidth / 2
    // And the elements were:
    // <Rect x={labelX - placedAsset.position.x} ... /> which effectively normalizes to relative.
    // So my relative calculation above needs to be just the offset from 0.

    const labelLocalX = -labelWidth / 2;
    const labelLocalY = labelY;

    return (
        <Group
            key={placedAsset.id}
            id={placedAsset.id}
            name='placed-asset'
            x={placedAsset.position.x}
            y={placedAsset.position.y}
            draggable={isDraggable}
            dragBoundFunc={dragBoundFunc}
            onDragMove={handleDrag}
            onDragEnd={handleDragEnd}
        >
            <KonvaImage
                id={placedAsset.id}
                image={image}
                x={0}
                y={0}
                offsetX={pixelWidth / 2}
                offsetY={pixelHeight / 2}
                width={pixelWidth}
                height={pixelHeight}
                rotation={placedAsset.rotation}
                draggable={false}
                listening={isInteractive}
                opacity={effectiveOpacity}
                onMouseEnter={() => onHoverStart(placedAsset.id)}
                onMouseLeave={() => onHoverEnd()}
                onContextMenu={handleContextMenu}
                onClick={handleClick}
            />
            <Rect
                x={labelLocalX}
                y={labelLocalY}
                width={labelWidth}
                height={labelHeight}
                fill={labelColors.background}
                stroke={labelColors.border}
                strokeWidth={1}
                listening={isInteractive}
                opacity={effectiveOpacity}
                onMouseEnter={() => {
                    onHoverStart(placedAsset.id);
                    if (labelInfo.isTruncated) {
                        onExpandStart(placedAsset.id);
                    }
                }}
                onMouseLeave={() => {
                    onHoverEnd();
                    onExpandEnd();
                }}
            />
            <Text
                x={labelLocalX}
                y={labelLocalY}
                width={labelWidth}
                height={labelHeight}
                text={displayText}
                fontSize={LABEL_FONT_SIZE}
                fontFamily={LABEL_FONT_FAMILY}
                fill={labelColors.text}
                align='center'
                verticalAlign='middle'
                listening={false}
                opacity={effectiveOpacity}
            />
        </Group>
    );
};
