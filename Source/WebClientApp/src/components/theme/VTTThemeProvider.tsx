import React from 'react';
import { ThemeProvider, createTheme } from '@mui/material/styles';
import CssBaseline from '@mui/material/CssBaseline';
import { useAppSelector } from '@/store';
import { selectTheme } from '@/store/slices/uiSlice';
import { getColorPalette } from './themeColors';

interface VTTThemeProviderProps {
  children: React.ReactNode;
}

export const VTTThemeProvider: React.FC<VTTThemeProviderProps> = ({ children }) => {
  const themeMode = useAppSelector(selectTheme);

  const theme = React.useMemo(() => {
    // Get centralized color palette for current theme mode
    const colors = getColorPalette(themeMode);

    return createTheme({
      palette: {
        mode: colors.mode,
        primary: colors.primary,
        secondary: colors.secondary,
        error: colors.error,
        warning: colors.warning,
        info: colors.info,
        success: colors.success,
        background: colors.background,
        text: colors.text,
        divider: colors.divider,
      },
    typography: {
      fontFamily: [
        'Inter',                // Primary professional font from Style Guide
        '-apple-system',
        'BlinkMacSystemFont',
        '"Segoe UI"',
        'Roboto',
        '"Helvetica Neue"',
        'Arial',
        'sans-serif',
      ].join(','),
      // Typography scale from Style Guide optimized for creative tools
      h1: {
        fontSize: '2.25rem',    // 36px - Page titles, major headers
        fontWeight: 700,
        lineHeight: 1.2,
        letterSpacing: '-0.025em',
      },
      h2: {
        fontSize: '1.875rem',   // 30px - Section headers
        fontWeight: 600,
        lineHeight: 1.3,
        letterSpacing: '-0.025em',
      },
      h3: {
        fontSize: '1.5rem',     // 24px - Subsection headers
        fontWeight: 600,
        lineHeight: 1.4,
      },
      h4: {
        fontSize: '1.25rem',    // 20px - Component headers
        fontWeight: 600,
        lineHeight: 1.4,
      },
      h5: {
        fontSize: '1.125rem',   // 18px - List headers
        fontWeight: 600,
        lineHeight: 1.4,
      },
      h6: {
        fontSize: '1rem',       // 16px - Small headers
        fontWeight: 600,
        lineHeight: 1.4,
      },
      body1: {
        fontSize: '1rem',       // 16px - Primary body text
        fontWeight: 400,
        lineHeight: 1.5,
      },
      body2: {
        fontSize: '0.875rem',   // 14px - Secondary body text
        fontWeight: 400,
        lineHeight: 1.5,
      },
      button: {
        fontSize: '0.875rem',   // 14px - Button text
        fontWeight: 500,
        textTransform: 'none',  // Preserve natural casing from Style Guide
        letterSpacing: '0.025em',
      },
      caption: {
        fontSize: '0.75rem',    // 12px - Small text, labels
        fontWeight: 400,
        lineHeight: 1.4,
      },
    },
    spacing: 8,                 // 8px base unit spacing system from Style Guide
    shape: {
      borderRadius: 8,          // Default border radius from Style Guide
    },
    components: {
      // Button customizations for VTT interface from Style Guide
      MuiButton: {
        styleOverrides: {
          root: {
            borderRadius: 8,
            padding: '10px 20px',
            boxShadow: 'none',    // Clean, flat design
            '&:hover': {
              boxShadow: '0 2px 8px rgba(37, 99, 235, 0.2)',
              transform: 'translateY(-1px)',
            },
            '&:active': {
              transform: 'translateY(0)',
            },
          },
          contained: {
            '&:hover': {
              boxShadow: '0 4px 12px rgba(37, 99, 235, 0.3)',
            },
          },
        },
      },
      // Paper/Card styling for panels and modals from Style Guide
      MuiPaper: {
        styleOverrides: {
          root: {
            borderRadius: 12,
            boxShadow: '0 1px 3px rgba(17, 24, 39, 0.1), 0 1px 2px rgba(17, 24, 39, 0.06)',
          },
          elevation1: {
            boxShadow: '0 1px 3px rgba(17, 24, 39, 0.1), 0 1px 2px rgba(17, 24, 39, 0.06)',
          },
          elevation2: {
            boxShadow: '0 4px 6px rgba(17, 24, 39, 0.05), 0 2px 4px rgba(17, 24, 39, 0.06)',
          },
          elevation3: {
            boxShadow: '0 10px 15px rgba(17, 24, 39, 0.1), 0 4px 6px rgba(17, 24, 39, 0.05)',
          },
        },
      },
      // Form input styling from Style Guide
      MuiTextField: {
        styleOverrides: {
          root: {
            '& .MuiOutlinedInput-root': {
              borderRadius: 8,
              '& fieldset': {
                borderColor: '#D1D5DB',
              },
              '&:hover fieldset': {
                borderColor: '#9CA3AF',
              },
              '&.Mui-focused fieldset': {
                borderColor: '#2563EB',
                borderWidth: 2,
              },
            },
          },
        },
      },
      // Card styling for asset library and content from Style Guide
      MuiCard: {
        styleOverrides: {
          root: {
            borderRadius: 12,
            boxShadow: '0 1px 3px rgba(17, 24, 39, 0.1), 0 1px 2px rgba(17, 24, 39, 0.06)',
            '&:hover': {
              boxShadow: '0 4px 6px rgba(17, 24, 39, 0.05), 0 2px 4px rgba(17, 24, 39, 0.06)',
            },
          },
        },
      },
    },
    });
  }, [themeMode]);

  return (
    <ThemeProvider theme={theme}>
      <CssBaseline />
      {children}
    </ThemeProvider>
  );
};