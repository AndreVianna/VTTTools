import type Konva from 'konva';
import type { KonvaEventObject } from 'konva/lib/Node';
import type React from 'react';
import { useCallback, useEffect, useRef, useState } from 'react';
import { Circle, Group, Line, Text } from 'react-konva';
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
const DM_COLOR_OPACITY = 0.7;
const SELECTED_RING_COLOR = '#4CAF50'; // Green (same as ActiveCharacterIndicator)
const LABEL_COLOR = '#FFFFFF';
const LABEL_FONT_SIZE = 14;
const LABEL_FONT_FAMILY = 'Arial, sans-serif';
const LABEL_FONT_STYLE = 'bold';

// Animation constants
const PULSE_DURATION_MS = 1500;
const MIN_OPACITY = 0.3;
const MAX_OPACITY = 0.9;
const RING_PADDING = 4;

// Eye icon constants
const EYE_SCALE = 0.3;

/**
 * DMTestCharacter - Virtual character for DM to test player-perspective features.
 *
 * This component renders a draggable marker that the DM can use to test:
 * - Spatial audio (as the listener position)
 * - Line of sight (future)
 * - Fog of war (future)
 *
 * Visual features:
 * - Semi-transparent purple circle with "DM" label
 * - Eye icon to indicate "viewer" perspective
 * - Pulsing green ring when selected as listener
 * - Grid snapping on drag
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
    const [pulseOpacity, setPulseOpacity] = useState(MAX_OPACITY);
    const [isDragging, setIsDragging] = useState(false);

    // ═══════════════════════════════════════════════════════════════════════════
    // REFS
    // ═══════════════════════════════════════════════════════════════════════════
    const groupRef = useRef<Konva.Group>(null);

    // ═══════════════════════════════════════════════════════════════════════════
    // DERIVED VALUES
    // ═══════════════════════════════════════════════════════════════════════════
    // Size based on grid cell (1 cell = 1 token size)
    const radius = Math.min(gridConfig.cellSize.width, gridConfig.cellSize.height) / 2 - 4;
    const ringRadius = radius + RING_PADDING;

    // Eye icon scaled to fit within the circle
    const eyeSize = radius * EYE_SCALE;

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
    // EFFECTS
    // ═══════════════════════════════════════════════════════════════════════════
    /**
     * Pulsing animation for selected state.
     */
    useEffect(() => {
        if (!isSelected) {
            // eslint-disable-next-line react-hooks/set-state-in-effect -- Syncing prop change to state
            setPulseOpacity(MAX_OPACITY);
            return;
        }

        let animationId: number;
        const startTime = Date.now();

        const animate = () => {
            const elapsed = Date.now() - startTime;
            const progress = (elapsed % PULSE_DURATION_MS) / PULSE_DURATION_MS;

            // Sinusoidal pulse
            const pulseValue = Math.sin(progress * Math.PI * 2);
            const newOpacity = MIN_OPACITY + ((MAX_OPACITY - MIN_OPACITY) * (pulseValue + 1)) / 2;

            setPulseOpacity(newOpacity);
            animationId = requestAnimationFrame(animate);
        };

        animationId = requestAnimationFrame(animate);

        return () => {
            cancelAnimationFrame(animationId);
        };
    }, [isSelected]);

    // ═══════════════════════════════════════════════════════════════════════════
    // RENDER
    // ═══════════════════════════════════════════════════════════════════════════
    return (
        <Group
            ref={groupRef}
            x={position.x}
            y={position.y}
            draggable
            onDragStart={handleDragStart}
            onDragEnd={handleDragEnd}
            onClick={handleClick}
            onTap={handleClick}
        >
            {/* Selection ring (shown when selected) */}
            {isSelected && (
                <>
                    {/* Outer pulsing ring */}
                    <Circle
                        x={0}
                        y={0}
                        radius={ringRadius}
                        stroke={SELECTED_RING_COLOR}
                        strokeWidth={3}
                        opacity={pulseOpacity}
                        dash={[8, 4]}
                        listening={false}
                    />
                    {/* Inner glow ring */}
                    <Circle
                        x={0}
                        y={0}
                        radius={ringRadius - 2}
                        stroke={SELECTED_RING_COLOR}
                        strokeWidth={1}
                        opacity={pulseOpacity * 0.5}
                        listening={false}
                    />
                </>
            )}

            {/* Main circle body */}
            <Circle
                x={0}
                y={0}
                radius={radius}
                fill={DM_COLOR}
                opacity={DM_COLOR_OPACITY}
                stroke={isSelected ? SELECTED_RING_COLOR : DM_COLOR}
                strokeWidth={isSelected ? 2 : 1}
            />

            {/* Eye icon (simplified) */}
            <Group x={0} y={-radius * 0.15} listening={false}>
                {/* Eye outline */}
                <Line
                    points={[
                        -eyeSize * 2,
                        0,
                        -eyeSize,
                        -eyeSize,
                        0,
                        -eyeSize * 1.2,
                        eyeSize,
                        -eyeSize,
                        eyeSize * 2,
                        0,
                        eyeSize,
                        eyeSize,
                        0,
                        eyeSize * 1.2,
                        -eyeSize,
                        eyeSize,
                        -eyeSize * 2,
                        0,
                    ]}
                    stroke={LABEL_COLOR}
                    strokeWidth={1.5}
                    closed
                    opacity={DM_COLOR_OPACITY}
                    tension={0.3}
                />
                {/* Pupil */}
                <Circle
                    x={0}
                    y={0}
                    radius={eyeSize * 0.6}
                    fill={LABEL_COLOR}
                    opacity={DM_COLOR_OPACITY}
                />
            </Group>

            {/* "DM" label */}
            <Text
                x={-radius}
                y={radius * 0.3}
                width={radius * 2}
                text="DM"
                fontSize={LABEL_FONT_SIZE}
                fontFamily={LABEL_FONT_FAMILY}
                fontStyle={LABEL_FONT_STYLE}
                fill={LABEL_COLOR}
                align="center"
                opacity={DM_COLOR_OPACITY + 0.1}
                listening={false}
            />

            {/* Headphone icon (when selected) */}
            {isSelected && (
                <Group x={0} y={-radius - 12} listening={false}>
                    {/* Headband arc */}
                    <Line
                        points={[
                            -8,
                            4,
                            -8,
                            -2,
                            -4,
                            -6,
                            0,
                            -7,
                            4,
                            -6,
                            8,
                            -2,
                            8,
                            4,
                        ]}
                        stroke={LABEL_COLOR}
                        strokeWidth={2}
                        lineCap="round"
                        lineJoin="round"
                        opacity={pulseOpacity}
                        tension={0.3}
                    />
                    {/* Left ear piece */}
                    <Circle
                        x={-8}
                        y={4}
                        radius={4}
                        fill={SELECTED_RING_COLOR}
                        opacity={pulseOpacity}
                    />
                    {/* Right ear piece */}
                    <Circle
                        x={8}
                        y={4}
                        radius={4}
                        fill={SELECTED_RING_COLOR}
                        opacity={pulseOpacity}
                    />
                </Group>
            )}
        </Group>
    );
};
