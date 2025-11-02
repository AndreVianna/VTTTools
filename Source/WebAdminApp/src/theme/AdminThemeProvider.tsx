import React from 'react';
import { ThemeProvider, createTheme } from '@mui/material/styles';
import CssBaseline from '@mui/material/CssBaseline';
import { useAppSelector } from '@store/hooks';
import { selectTheme } from '@store/slices/uiSlice';
import { getColorPalette } from './themeColors';

interface AdminThemeProviderProps {
  children: React.ReactNode;
}

export const AdminThemeProvider: React.FC<AdminThemeProviderProps> = ({ children }) => {
  const themeMode = useAppSelector(selectTheme);

  const theme = React.useMemo(() => {
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
          'Inter',
          '-apple-system',
          'BlinkMacSystemFont',
          '"Segoe UI"',
          'Roboto',
          '"Helvetica Neue"',
          'Arial',
          'sans-serif',
        ].join(','),
        h1: {
          fontSize: '2.25rem',
          fontWeight: 700,
          lineHeight: 1.2,
          letterSpacing: '-0.025em',
        },
        h2: {
          fontSize: '1.875rem',
          fontWeight: 600,
          lineHeight: 1.3,
          letterSpacing: '-0.025em',
        },
        h3: {
          fontSize: '1.5rem',
          fontWeight: 600,
          lineHeight: 1.4,
        },
        h4: {
          fontSize: '1.25rem',
          fontWeight: 600,
          lineHeight: 1.4,
        },
        h5: {
          fontSize: '1.125rem',
          fontWeight: 600,
          lineHeight: 1.4,
        },
        h6: {
          fontSize: '1rem',
          fontWeight: 600,
          lineHeight: 1.4,
        },
        body1: {
          fontSize: '1rem',
          fontWeight: 400,
          lineHeight: 1.5,
        },
        body2: {
          fontSize: '0.875rem',
          fontWeight: 400,
          lineHeight: 1.5,
        },
        button: {
          fontSize: '0.875rem',
          fontWeight: 500,
          textTransform: 'none',
          letterSpacing: '0.025em',
        },
        caption: {
          fontSize: '0.75rem',
          fontWeight: 400,
          lineHeight: 1.4,
        },
      },
      spacing: 8,
      shape: {
        borderRadius: 8,
      },
      components: {
        MuiButton: {
          styleOverrides: {
            root: {
              borderRadius: 8,
              padding: '10px 20px',
              boxShadow: 'none',
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
        MuiCssBaseline: {
          styleOverrides: (themeParam) => ({
            body: {
              scrollbarColor: themeParam.palette.mode === 'dark'
                ? '#6b6b6b #2b2b2b'
                : '#c1c1c1 #f1f1f1',
              '&::-webkit-scrollbar, & *::-webkit-scrollbar': {
                width: '8px',
                height: '8px',
              },
              '&::-webkit-scrollbar-thumb, & *::-webkit-scrollbar-thumb': {
                borderRadius: 8,
                backgroundColor: themeParam.palette.mode === 'dark' ? '#6b6b6b' : '#c1c1c1',
                minHeight: 24,
              },
              '&::-webkit-scrollbar-track, & *::-webkit-scrollbar-track': {
                backgroundColor: themeParam.palette.mode === 'dark' ? '#2b2b2b' : '#f1f1f1',
              },
            },
          }),
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
