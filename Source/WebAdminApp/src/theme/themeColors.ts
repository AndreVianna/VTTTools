/**
 * WebAdminApp Theme Color Configuration
 * Follows the same pattern as WebClientApp for visual consistency
 * Admin-themed variations while maintaining VTT Tools brand identity
 */

export const semanticColors = {
  primary: {
    main: '#2563EB',
    light: '#3B82F6',
    dark: '#1D4ED8',
    contrastText: '#FFFFFF',
  },

  secondary: {
    main: '#7C3AED',
    light: '#8B5CF6',
    dark: '#6D28D9',
    contrastText: '#FFFFFF',
  },

  error: {
    main: '#DC2626',
    light: '#EF4444',
    dark: '#B91C1C',
    contrastText: '#FFFFFF',
  },

  warning: {
    main: '#D97706',
    light: '#F59E0B',
    dark: '#B45309',
    contrastText: '#FFFFFF',
  },

  info: {
    main: '#0D9488',
    light: '#14B8A6',
    dark: '#0F766E',
    contrastText: '#FFFFFF',
  },

  success: {
    main: '#059669',
    light: '#10B981',
    dark: '#047857',
    contrastText: '#FFFFFF',
  },
} as const;

export const lightModeColors = {
  background: {
    default: '#F9FAFB',
    paper: '#FFFFFF',
  },

  text: {
    primary: '#111827',
    secondary: '#4B5563',
    disabled: '#9CA3AF',
  },

  divider: '#E5E7EB',
} as const;

export const darkModeColors = {
  background: {
    default: '#1F2937',
    paper: '#111827',
  },

  text: {
    primary: '#F9FAFB',
    secondary: '#D1D5DB',
    disabled: '#6B7280',
  },

  divider: '#374151',
} as const;

export const getColorPalette = (mode: 'light' | 'dark') => ({
  mode,
  ...semanticColors,
  ...(mode === 'light' ? lightModeColors : darkModeColors),
});

export const themeColors = {
  semantic: semanticColors,
  light: lightModeColors,
  dark: darkModeColors,
  getColorPalette,
} as const;
