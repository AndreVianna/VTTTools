/**
 * Default configuration values for VTT Tools
 * Centralizes shared constants to maintain consistency across the application
 */

// Default background images for different content types
export const DEFAULT_BACKGROUNDS = {
    /** Default background for encounters and game sessions */
    ENCOUNTER: '/assets/backgrounds/tavern.png',
    /** Default background for adventures */
    ADVENTURE: '/assets/backgrounds/adventure.png',
} as const;
