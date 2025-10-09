/**
 * VTT Tools Theme Color Configuration
 * Centralized color palette for easy theme customization
 *
 * To change the theme colors, simply update the values in this file.
 * All components will automatically use the new colors.
 */

// ============================================================================
// SEMANTIC COLORS (Shared across both light and dark modes)
// ============================================================================

export const semanticColors = {
  // Primary brand color (Blue)
  primary: {
    main: '#2563EB',      // Primary blue
    light: '#3B82F6',     // Lighter blue for hover states
    dark: '#1D4ED8',      // Darker blue for active states
    contrastText: '#FFFFFF',
  },

  // Secondary brand color (Purple)
  secondary: {
    main: '#7C3AED',      // Purple
    light: '#8B5CF6',     // Lighter purple
    dark: '#6D28D9',      // Darker purple
    contrastText: '#FFFFFF',
  },

  // Error state (Red)
  error: {
    main: '#DC2626',      // Red
    light: '#EF4444',     // Lighter red
    dark: '#B91C1C',      // Darker red
    contrastText: '#FFFFFF',
  },

  // Warning state (Amber)
  warning: {
    main: '#D97706',      // Amber
    light: '#F59E0B',     // Lighter amber
    dark: '#B45309',      // Darker amber
    contrastText: '#FFFFFF',
  },

  // Info state (Teal)
  info: {
    main: '#0D9488',      // Teal
    light: '#14B8A6',     // Lighter teal
    dark: '#0F766E',      // Darker teal
    contrastText: '#FFFFFF',
  },

  // Success state (Green)
  success: {
    main: '#059669',      // Green
    light: '#10B981',     // Lighter green
    dark: '#047857',      // Darker green
    contrastText: '#FFFFFF',
  },
} as const;

// ============================================================================
// LIGHT MODE COLORS
// ============================================================================

export const lightModeColors = {
  background: {
    default: '#F9FAFB',   // Light gray background for pages
    paper: '#FFFFFF',     // White for cards and panels
  },

  text: {
    primary: '#111827',   // Very dark gray for primary text
    secondary: '#4B5563', // Medium gray for secondary text
    disabled: '#9CA3AF',  // Light gray for disabled text
  },

  divider: '#E5E7EB',     // Light gray for borders and dividers
} as const;

// ============================================================================
// DARK MODE COLORS
// ============================================================================

export const darkModeColors = {
  background: {
    default: '#1F2937',   // Dark gray background for pages
    paper: '#111827',     // Very dark gray for cards and panels
  },

  text: {
    primary: '#F9FAFB',   // Light gray for primary text
    secondary: '#D1D5DB', // Medium light gray for secondary text
    disabled: '#6B7280',  // Medium gray for disabled text
  },

  divider: '#374151',     // Medium dark gray for borders and dividers
} as const;

// ============================================================================
// HELPER FUNCTIONS
// ============================================================================

/**
 * Get the complete color palette for a specific theme mode
 */
export const getColorPalette = (mode: 'light' | 'dark') => ({
  mode,
  ...semanticColors,
  ...(mode === 'light' ? lightModeColors : darkModeColors),
});

// ============================================================================
// ALTERNATIVE THEME PRESETS (Examples for future use)
// ============================================================================

/**
 * Example: High Contrast Theme (for accessibility)
 * Uncomment and use in VTTThemeProvider to enable
 */
export const highContrastColors = {
  primary: {
    main: '#0000FF',      // Pure blue
    light: '#3333FF',
    dark: '#0000CC',
    contrastText: '#FFFFFF',
  },
  // ... other colors with higher contrast
};

/**
 * Example: Fantasy Theme (alternative color scheme)
 * Uncomment and use in VTTThemeProvider to enable
 */
export const fantasyColors = {
  primary: {
    main: '#8B4513',      // Brown
    light: '#A0522D',
    dark: '#654321',
    contrastText: '#FFFFFF',
  },
  secondary: {
    main: '#228B22',      // Forest green
    light: '#32CD32',
    dark: '#006400',
    contrastText: '#FFFFFF',
  },
  // ... other fantasy-themed colors
};

// ============================================================================
// EXPORT DEFAULT CONFIGURATION
// ============================================================================

export const themeColors = {
  semantic: semanticColors,
  light: lightModeColors,
  dark: darkModeColors,
  getColorPalette,
} as const;
