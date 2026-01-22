import type { KonvaEventObject } from 'konva/lib/Node';
import type React from 'react';
import { useCallback, useState } from 'react';
import { Circle, Group, Text } from 'react-konva';
import type { Point } from '@/types/domain';
import type { GridConfig } from '@/utils/gridCalculator';
import { snap, SnapMode } from '@/utils/snapping';

/**
 * Props for the DMTestCharacter component.
 */
export interface DMTestCharacterProps {
    /** Current position in pixels */
    position: Point;
    /** Grid configuration for snapping and sizing */
    gridConfig: GridConfig;
    /** Whether this character is selected as the active listener */
    isSelected: boolean;
    /** Callback when drag ends with new position */
    onDragEnd: (position: Point) => void;
    /** Callback when clicked (for selection) */
    onClick: () => void;
}

// Visual constants
const DM_COLOR = '#9C27B0'; // Purple (MUI purple[500])
const DM_COLOR_SELECTED = '#7B1FA2'; // Darker purple when selected
const FILL_OPACITY = 0.5;
const LABEL_COLOR = '#FFFFFF';
const LABEL_FONT_SIZE = 14;
const LABEL_FONT_FAMILY = 'Arial, sans-serif';
const LABEL_FONT_STYLE = 'bold';

/**
 * DMTestCharacter - A simple draggable marker for DM to test player-perspective features.
 *
 * The DM drags this marker around the map to test what a player at that
 * position would experience (spatial audio, and future: line of sight, fog of war).
 *
 * Visual: Simple semi-transparent purple circle with "DM" label.
 */
export const DMTestCharacter: React.FC<DMTestCharacterProps> = ({
    position,
    gridConfig,
    isSelected,
    onDragEnd,
    onClick,
}) => {
    // ═══════════════════════════════════════════════════════════════════════════
    // STATE
    // ═══════════════════════════════════════════════════════════════════════════
    const [isDragging, setIsDragging] = useState(false);

    // ═══════════════════════════════════════════════════════════════════════════
    // DERIVED VALUES
    // ═══════════════════════════════════════════════════════════════════════════
    const radius = Math.min(gridConfig.cellSize.width, gridConfig.cellSize.height) / 2 - 4;

    // ═══════════════════════════════════════════════════════════════════════════
    // HANDLERS
    // ═══════════════════════════════════════════════════════════════════════════
    const handleDragStart = useCallback(() => {
        setIsDragging(true);
    }, []);

    const handleDragEnd = useCallback(
        (e: KonvaEventObject<DragEvent>) => {
            setIsDragging(false);

            const node = e.target;
            const newPosition: Point = {
                x: node.x(),
                y: node.y(),
            };

            // Snap to grid center
            const snappedPosition = snap(newPosition, gridConfig, SnapMode.Full);

            // Update node position to snapped position
            node.position(snappedPosition);

            onDragEnd(snappedPosition);
        },
        [gridConfig, onDragEnd]
    );

    const handleClick = useCallback(
        (e: KonvaEventObject<MouseEvent | TouchEvent>) => {
            // Prevent click during drag
            if (isDragging) return;

            e.cancelBubble = true;
            onClick();
        },
        [isDragging, onClick]
    );

    // ═══════════════════════════════════════════════════════════════════════════
    // RENDER
    // ═══════════════════════════════════════════════════════════════════════════
    return (
        <Group
            x={position.x}
            y={position.y}
            draggable
            onDragStart={handleDragStart}
            onDragEnd={handleDragEnd}
            onClick={handleClick}
            onTap={handleClick}
        >
            {/* Simple circle */}
            <Circle
                x={0}
                y={0}
                radius={radius}
                fill={isSelected ? DM_COLOR_SELECTED : DM_COLOR}
                opacity={FILL_OPACITY}
                {...(isSelected && { stroke: LABEL_COLOR, strokeWidth: 2 })}
            />

            {/* "DM" label */}
            <Text
                x={-radius}
                y={-LABEL_FONT_SIZE / 2}
                width={radius * 2}
                text="DM"
                fontSize={LABEL_FONT_SIZE}
                fontFamily={LABEL_FONT_FAMILY}
                fontStyle={LABEL_FONT_STYLE}
                fill={LABEL_COLOR}
                align="center"
                listening={false}
            />
        </Group>
    );
};
