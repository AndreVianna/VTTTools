import { useTheme } from '@mui/material';
import React, { useMemo } from 'react';
import { Group, Rect } from 'react-konva';

/**
 * Variant types for selection border colors.
 * - primary: Single selection (blue)
 * - anchor: Multi-select anchor/first item (teal)
 * - secondary: Multi-select other items (purple)
 */
export type SelectionVariant = 'primary' | 'anchor' | 'secondary';

export interface SelectionBorderProps {
    /** Position and size of the selection border */
    bounds: {
        x: number;
        y: number;
        width: number;
        height: number;
    };
    /** Optional stroke color override (defaults based on variant) */
    strokeColor?: string;
    /** Optional stroke width (defaults to 2) */
    strokeWidth?: number;
    /** Canvas scale for responsive sizing */
    scale?: number;
    /** Show corner handles for single selection */
    showCornerHandles?: boolean;
    /** Color variant for multi-select differentiation */
    variant?: SelectionVariant;
    /** Use glow effect instead of border for tiny assets (<30px) */
    useTinyMode?: boolean;
}

/**
 * Size threshold below which tiny mode (glow effect) is used.
 */
const TINY_THRESHOLD = 30;

/**
 * Corner handle size at scale 1.
 */
const HANDLE_BASE_SIZE = 8;

/**
 * Minimum corner handle size (never smaller than this).
 */
const HANDLE_MIN_SIZE = 4;

/**
 * Maximum corner handle size (never larger than this).
 */
const HANDLE_MAX_SIZE = 16;

/**
 * Reusable selection border component for highlighting selected assets.
 * Used in TokenDragHandle and EncounterPage for asset selection.
 *
 * Features:
 * - Responsive stroke width based on canvas scale
 * - Color variants for single/multi-select differentiation
 * - Optional corner handles for single selection
 * - Tiny mode (glow effect) for small assets
 */
export const SelectionBorder: React.FC<SelectionBorderProps> = ({
    bounds,
    strokeColor,
    strokeWidth = 2,
    scale = 1,
    showCornerHandles = false,
    variant = 'primary',
    useTinyMode = false,
}) => {
    const theme = useTheme();

    // Determine stroke color based on variant
    const effectiveStrokeColor = useMemo(() => {
        if (strokeColor) return strokeColor;

        switch (variant) {
            case 'anchor':
                return theme.palette.info.main;
            case 'secondary':
                return theme.palette.secondary.main;
            case 'primary':
            default:
                return theme.palette.primary.main;
        }
    }, [strokeColor, variant, theme.palette]);

    // Calculate responsive stroke width (never thinner than 1px)
    const effectiveStrokeWidth = useMemo(
        () => Math.max(1, strokeWidth / scale),
        [strokeWidth, scale]
    );

    // Calculate responsive handle size (clamped to min/max)
    const handleSize = useMemo(
        () => Math.min(HANDLE_MAX_SIZE, Math.max(HANDLE_MIN_SIZE, HANDLE_BASE_SIZE / scale)),
        [scale]
    );

    // Check if tiny mode should be auto-enabled
    const isTiny = useMemo(() => {
        if (useTinyMode) return true;
        const minDimension = Math.min(bounds.width, bounds.height);
        return minDimension < TINY_THRESHOLD;
    }, [useTinyMode, bounds.width, bounds.height]);

    // Render tiny mode (glow effect)
    if (isTiny) {
        const padding = 4 / scale;
        const shadowBlur = 8 / scale;

        return (
            <Rect
                x={bounds.x - padding}
                y={bounds.y - padding}
                width={bounds.width + padding * 2}
                height={bounds.height + padding * 2}
                fill="transparent"
                shadowColor={effectiveStrokeColor}
                shadowBlur={shadowBlur}
                shadowOpacity={0.8}
                listening={false}
            />
        );
    }

    // Corner handle positions
    const cornerPositions = useMemo(() => {
        if (!showCornerHandles) return [];

        const halfHandle = handleSize / 2;
        return [
            { x: bounds.x - halfHandle, y: bounds.y - halfHandle }, // Top-left
            { x: bounds.x + bounds.width - halfHandle, y: bounds.y - halfHandle }, // Top-right
            { x: bounds.x - halfHandle, y: bounds.y + bounds.height - halfHandle }, // Bottom-left
            { x: bounds.x + bounds.width - halfHandle, y: bounds.y + bounds.height - halfHandle }, // Bottom-right
        ];
    }, [showCornerHandles, handleSize, bounds]);

    return (
        <Group listening={false}>
            {/* Main selection border */}
            <Rect
                x={bounds.x}
                y={bounds.y}
                width={bounds.width}
                height={bounds.height}
                stroke={effectiveStrokeColor}
                strokeWidth={effectiveStrokeWidth}
                listening={false}
            />

            {/* Corner handles */}
            {cornerPositions.map((pos, index) => (
                <Rect
                    key={`corner-${index}`}
                    x={pos.x}
                    y={pos.y}
                    width={handleSize}
                    height={handleSize}
                    fill={theme.palette.background.paper}
                    stroke={effectiveStrokeColor}
                    strokeWidth={Math.max(1, 1 / scale)}
                    listening={false}
                />
            ))}
        </Group>
    );
};

SelectionBorder.displayName = 'SelectionBorder';
