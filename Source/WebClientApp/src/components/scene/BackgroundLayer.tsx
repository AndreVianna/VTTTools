// GENERATED: 2025-10-04 by Claude Code Phase 3
// EPIC: EPIC-001 Phase 3 - Scene Editor Background Rendering
// LAYER: UI (Component)

/**
 * BackgroundLayer Component
 * Renders background image or color in Konva Layer
 * Fundamental scene feature - always visible behind grid/tokens
 * ACCEPTANCE_CRITERION: AC-03 - Default background renders with fallback color
 *
 * THEME SUPPORT: backgroundColor prop should use theme.palette.background.default
 * - Dark mode: #1F2937 (tactical dark gray)
 * - Light mode: #F9FAFB (bright white/gray)
 */

import React from 'react';
import { Layer, Rect, Image as KonvaImage } from 'react-konva';
import useImage from 'use-image';

export interface BackgroundLayerProps {
    /** Background image URL (optional) */
    imageUrl?: string;
    /** Fallback background color (hex format) */
    backgroundColor?: string;
    /** Stage width for background sizing */
    stageWidth: number;
    /** Stage height for background sizing */
    stageHeight: number;
    /** Layer name for layer manager */
    layerName?: string;
}

/**
 * BackgroundLayer - Renders scene background with image or solid color
 *
 * Features:
 * - Image loading with Konva's useImage hook
 * - 1:1 pixel-perfect rendering (no scaling at 100% zoom)
 * - Fallback to solid color rectangle
 * - Non-interactive (listening: false for performance)
 *
 * Usage:
 * ```tsx
 * <BackgroundLayer
 *   imageUrl="/images/dungeon-map.jpg"
 *   backgroundColor="#1a1a1a"
 *   stageWidth={2800}
 *   stageHeight={2100}
 * />
 * ```
 */
export const BackgroundLayer: React.FC<BackgroundLayerProps> = ({
    imageUrl,
    backgroundColor = '#f5f5f5',
    stageWidth,
    stageHeight,
    layerName = 'background'
}) => {
    // Load background image using Konva's useImage hook
    const [image, status] = useImage(imageUrl || '', 'anonymous');

    return (
        <Layer name={layerName} listening={false}>
            {/* Render image if loaded, otherwise render solid color */}
            {image && status === 'loaded' ? (
                // Render image at 1:1 native resolution (no scaling)
                <KonvaImage
                    image={image}
                    x={0}
                    y={0}
                    width={image.width}
                    height={image.height}
                    listening={false}
                />
            ) : (
                // Fallback: Solid color background
                <Rect
                    x={0}
                    y={0}
                    width={stageWidth}
                    height={stageHeight}
                    fill={backgroundColor}
                    listening={false}
                />
            )}
        </Layer>
    );
};
