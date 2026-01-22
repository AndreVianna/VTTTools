import type React from 'react';
import { useEffect, useState } from 'react';
import { Circle, Group, Line } from 'react-konva';
import type { PlacedAsset } from '@/types/domain';

/**
 * Props for the ActiveCharacterIndicator component.
 */
export interface ActiveCharacterIndicatorProps {
    /** The active character asset */
    activeCharacter: PlacedAsset;
    /** Animation enabled (default true) */
    animated?: boolean;
}

// Animation constants
const PULSE_DURATION_MS = 1500;
const MIN_OPACITY = 0.3;
const MAX_OPACITY = 0.9;
const INDICATOR_COLOR = '#4CAF50'; // Green
const HEADPHONE_COLOR = '#FFFFFF';
const ICON_SIZE = 16;
const RING_PADDING = 8;

/**
 * Visual indicator component for the active character (listener) in play mode.
 *
 * Displays:
 * - A pulsing ring around the character
 * - A headphone icon above the character
 *
 * This component uses react-konva for rendering on the canvas.
 */
export const ActiveCharacterIndicator: React.FC<ActiveCharacterIndicatorProps> = ({
    activeCharacter,
    animated = true,
}) => {
    // ═══════════════════════════════════════════════════════════════════════════
    // STATE
    // ═══════════════════════════════════════════════════════════════════════════
    const [opacity, setOpacity] = useState(MAX_OPACITY);

    // ═══════════════════════════════════════════════════════════════════════════
    // DERIVED VALUES
    // ═══════════════════════════════════════════════════════════════════════════
    const centerX = activeCharacter.position.x + activeCharacter.size.width / 2;
    const centerY = activeCharacter.position.y + activeCharacter.size.height / 2;

    // Ring radius based on asset size (larger of width/height)
    const baseRadius = Math.max(activeCharacter.size.width, activeCharacter.size.height) / 2;
    const ringRadius = baseRadius + RING_PADDING;

    // Icon position (above the character)
    const iconY = activeCharacter.position.y - ICON_SIZE - 4;

    // ═══════════════════════════════════════════════════════════════════════════
    // EFFECTS
    // ═══════════════════════════════════════════════════════════════════════════
    /**
     * Pulsing animation effect using requestAnimationFrame.
     * When animation is disabled, sets static opacity.
     */
    useEffect(() => {
        if (!animated) {
            // Reset to static opacity when animation disabled
            // eslint-disable-next-line react-hooks/set-state-in-effect -- Syncing prop change to state
            setOpacity(MAX_OPACITY);
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

            setOpacity(newOpacity);
            animationId = requestAnimationFrame(animate);
        };

        animationId = requestAnimationFrame(animate);

        return () => {
            cancelAnimationFrame(animationId);
        };
    }, [animated]);

    // ═══════════════════════════════════════════════════════════════════════════
    // RENDER
    // ═══════════════════════════════════════════════════════════════════════════
    return (
        <Group listening={false}>
            {/* Pulsing Ring */}
            <Circle
                x={centerX}
                y={centerY}
                radius={ringRadius}
                stroke={INDICATOR_COLOR}
                strokeWidth={3}
                opacity={opacity}
                dash={[8, 4]}
            />

            {/* Inner glow ring */}
            <Circle
                x={centerX}
                y={centerY}
                radius={ringRadius - 2}
                stroke={INDICATOR_COLOR}
                strokeWidth={1}
                opacity={opacity * 0.5}
            />

            {/* Headphone Icon (simplified) */}
            <Group x={centerX} y={iconY}>
                {/* Headband arc */}
                <Line
                    points={[
                        -ICON_SIZE / 2,
                        ICON_SIZE / 3,
                        -ICON_SIZE / 2,
                        -ICON_SIZE / 4,
                        -ICON_SIZE / 4,
                        -ICON_SIZE / 2,
                        0,
                        -ICON_SIZE / 2 - 2,
                        ICON_SIZE / 4,
                        -ICON_SIZE / 2,
                        ICON_SIZE / 2,
                        -ICON_SIZE / 4,
                        ICON_SIZE / 2,
                        ICON_SIZE / 3,
                    ]}
                    stroke={HEADPHONE_COLOR}
                    strokeWidth={2}
                    lineCap="round"
                    lineJoin="round"
                    opacity={opacity}
                    tension={0.3}
                />

                {/* Left ear piece */}
                <Circle
                    x={-ICON_SIZE / 2}
                    y={ICON_SIZE / 3}
                    radius={ICON_SIZE / 4}
                    fill={INDICATOR_COLOR}
                    opacity={opacity}
                />

                {/* Right ear piece */}
                <Circle
                    x={ICON_SIZE / 2}
                    y={ICON_SIZE / 3}
                    radius={ICON_SIZE / 4}
                    fill={INDICATOR_COLOR}
                    opacity={opacity}
                />
            </Group>
        </Group>
    );
};
