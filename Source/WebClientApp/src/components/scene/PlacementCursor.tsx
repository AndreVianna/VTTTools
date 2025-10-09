// GENERATED: 2025-10-05 by Claude Code - Asset Placement System
// LAYER: UI (Component)

/**
 * PlacementCursor Component
 * Visual preview cursor showing the asset image at mouse position during placement
 * Features:
 * - Follows mouse cursor
 * - Snaps to grid when enabled
 * - Semi-transparent preview
 * - Sized to fit grid cell
 */

import React, { useState, useEffect, useRef } from 'react';
import { Group, Image as KonvaImage } from 'react-konva';
import Konva from 'konva';
import { Asset } from '@/types/domain';
import { GridConfig, Point, pointToCell, cellToPoint } from '@/utils/gridCalculator';
import { getDefaultTokenResource, getResourceUrl } from '@/utils/assetHelpers';

export interface PlacementCursorProps {
    /** Asset being placed */
    asset: Asset;
    /** Grid configuration for snap-to-grid */
    gridConfig: GridConfig;
    /** Konva stage reference for mouse tracking */
    stage: Konva.Stage | null;
    /** Viewport scale for coordinate transformation */
    scale: number;
    /** Viewport position for coordinate transformation */
    stagePos: Point;
}

export const PlacementCursor: React.FC<PlacementCursorProps> = ({
    asset,
    gridConfig,
    stage,
    scale,
    stagePos
}) => {
    const [rawMousePos, setRawMousePos] = useState<{ x: number; y: number } | null>(null);
    const [image, setImage] = useState<HTMLImageElement | null>(null);
    const imageRef = useRef<HTMLImageElement | null>(null);

    // Load asset image
    useEffect(() => {
        const tokenResource = getDefaultTokenResource(asset);
        if (!tokenResource) return;

        const img = new window.Image();
        img.src = getResourceUrl(tokenResource.resourceId);
        img.crossOrigin = 'anonymous';

        img.onload = () => {
            imageRef.current = img;
            setImage(img);
        };

        return () => {
            imageRef.current = null;
            setImage(null);
        };
    }, [asset]);

    // Track raw mouse pointer position
    useEffect(() => {
        if (!stage) return;

        const handleMouseMove = () => {
            const pointer = stage.getPointerPosition();
            if (pointer) {
                setRawMousePos({ x: pointer.x, y: pointer.y });
            }
        };

        stage.on('mousemove', handleMouseMove);

        return () => {
            stage.off('mousemove', handleMouseMove);
        };
    }, [stage]);

    // Calculate stage coordinates from raw mouse position
    const getStageCoordinates = (): Point | null => {
        if (!rawMousePos) return null;

        // Convert viewport coordinates to stage coordinates
        const stageX = (rawMousePos.x - stagePos.x) / scale;
        const stageY = (rawMousePos.y - stagePos.y) / scale;

        return { x: stageX, y: stageY };
    };

    // Calculate placement position (with snap-to-grid if enabled)
    const getPlacementPosition = (): Point | null => {
        const stageCoords = getStageCoordinates();
        if (!stageCoords) return null;

        if (gridConfig.snapToGrid) {
            const cell = pointToCell(stageCoords, gridConfig);
            return cellToPoint(cell, gridConfig);
        }

        return stageCoords;
    };

    // Calculate image size to fit grid cell (maintain aspect ratio)
    const getImageSize = (): { width: number; height: number } => {
        if (!image) {
            return { width: gridConfig.cellWidth, height: gridConfig.cellHeight };
        }

        const scale = Math.min(
            gridConfig.cellWidth / image.width,
            gridConfig.cellHeight / image.height
        );

        return {
            width: image.width * scale,
            height: image.height * scale
        };
    };

    const placementPos = getPlacementPosition();
    const imageSize = getImageSize();

    if (!placementPos || !image) {
        return null;
    }

    return (
        <Group>
            <KonvaImage
                image={image}
                x={placementPos.x}
                y={placementPos.y}
                width={imageSize.width}
                height={imageSize.height}
                offsetX={imageSize.width / 2}  // Center anchor
                offsetY={imageSize.height / 2}
                opacity={0.6}
                listening={false}  // Don't interfere with click events
            />
        </Group>
    );
};
