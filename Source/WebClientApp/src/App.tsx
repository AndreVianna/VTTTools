import { useEffect } from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { Provider } from 'react-redux';
import { ThemeProvider, createTheme } from '@mui/material/styles';
import CssBaseline from '@mui/material/CssBaseline';
import { store } from '@/store';
import { setupGlobalErrorHandling } from '@/utils/errorHandling';
import { LoginPage } from '@/pages/auth/LoginPage';
import { LandingPage } from '@/pages/LandingPage';
import { ErrorBoundary, NetworkStatus, GlobalErrorDisplay } from '@/components/error';

// VTT Tools theme based on Implementation Guide Studio Professional design
const vttToolsTheme = createTheme({
  palette: {
    mode: 'light', // Using light mode as specified in Style Guide
    primary: {
      main: '#2563EB',        // Primary blue from Studio Professional palette
      light: '#3B82F6',       // Primary blue light
      dark: '#1D4ED8',        // Primary blue dark
      contrastText: '#FFFFFF',
    },
    secondary: {
      main: '#7C3AED',        // Secondary purple from Studio Professional palette
      light: '#8B5CF6',       // Secondary purple light
      dark: '#6D28D9',        // Secondary purple dark
      contrastText: '#FFFFFF',
    },
    error: {
      main: '#DC2626',        // Error red from Style Guide
      light: '#EF4444',
      dark: '#B91C1C',
      contrastText: '#FFFFFF',
    },
    warning: {
      main: '#D97706',        // Warning amber from Style Guide
      light: '#F59E0B',
      dark: '#B45309',
      contrastText: '#FFFFFF',
    },
    info: {
      main: '#0D9488',        // Info teal from Style Guide
      light: '#14B8A6',
      dark: '#0F766E',
      contrastText: '#FFFFFF',
    },
    success: {
      main: '#059669',        // Success green from Style Guide
      light: '#10B981',
      dark: '#047857',
      contrastText: '#FFFFFF',
    },
    background: {
      default: '#F9FAFB',     // Application background from Style Guide
      paper: '#FFFFFF',       // Card and modal backgrounds
    },
    text: {
      primary: '#111827',     // Primary text from Style Guide
      secondary: '#4B5563',   // Secondary text
      disabled: '#9CA3AF',    // Disabled text
    },
    divider: '#E5E7EB',       // Borders and dividers from Style Guide
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

// Main App Component with Redux Provider and Routing
function App() {
  useEffect(() => {
    // Setup global error handling on app initialization
    setupGlobalErrorHandling();
  }, []);

  return (
    <Provider store={store}>
      <ThemeProvider theme={vttToolsTheme}>
        <CssBaseline />
        <ErrorBoundary>
          <Router>
            <Routes>
              {/* Landing page - Phase 1 Week 1 */}
              <Route path="/" element={<LandingPage />} />

              {/* Authentication routes - Complete authentication system */}
              <Route path="/login" element={<LoginPage />} />
              <Route path="/register" element={<LoginPage />} />
              <Route path="/reset-password" element={<LoginPage />} />

              {/* Redirect to landing for now - will be dashboard in Phase 2 */}
              <Route path="/dashboard" element={<Navigate to="/" replace />} />

              {/* Default redirect to landing */}
              <Route path="*" element={<Navigate to="/" replace />} />
            </Routes>
          </Router>

          {/* Global error handling components */}
          <NetworkStatus />
          <GlobalErrorDisplay />
        </ErrorBoundary>
      </ThemeProvider>
    </Provider>
  );
}

export default App;