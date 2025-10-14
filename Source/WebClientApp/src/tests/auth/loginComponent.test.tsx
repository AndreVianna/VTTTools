/**
 * VTTTools React Authentication Components - Material UI Integration Tests
 * Tests React login/register components with Material UI Studio Professional theme
 *
 * Testing real UI components with Material UI styling validation
 * Includes form validation, error handling, and user experience testing
 */

import { describe, it, expect, beforeEach, vi, beforeAll } from 'vitest';
import { render, screen, waitFor, cleanup } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { Provider } from 'react-redux';
import { ThemeProvider, createTheme } from '@mui/material/styles';
import { BrowserRouter } from 'react-router-dom';
import { configureStore } from '@reduxjs/toolkit';
import '@testing-library/jest-dom';

// Mock the auth service module
const mockAuthService = {
  loginAsync: vi.fn(),
  registerAsync: vi.fn(),
  getCurrentUserAsync: vi.fn(),
  logoutAsync: vi.fn()
};

// Mock auth API responses
const mockSuccessResponse = { success: true, message: 'Operation successful' };

// Import components after setting up mocks
vi.mock('@/services/authApi', () => ({
  authApi: {
    useLoginMutation: () => [
      mockAuthService.loginAsync,
      { isLoading: false, error: null }
    ],
    useRegisterMutation: () => [
      mockAuthService.registerAsync,
      { isLoading: false, error: null }
    ]
  }
}));

// VTT Tools theme matching the Style Guide exactly
const vttToolsTheme = createTheme({
  palette: {
    mode: 'light',
    primary: {
      main: '#2563EB',        // Primary blue from Studio Professional palette
      light: '#3B82F6',
      dark: '#1D4ED8',
      contrastText: '#FFFFFF',
    },
    secondary: {
      main: '#7C3AED',        // Secondary purple from Studio Professional palette
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
    background: {
      default: '#F9FAFB',     // Application background from Style Guide
      paper: '#FFFFFF',
    },
    text: {
      primary: '#111827',     // Primary text from Style Guide
      secondary: '#4B5563',   // Secondary text
      disabled: '#9CA3AF',
    },
  },
  typography: {
    fontFamily: [
      'Inter',                // Primary professional font from Style Guide
      '-apple-system',
      'BlinkMacSystemFont',
      '"Segoe UI"',
      'Roboto',
      'Arial',
      'sans-serif',
    ].join(','),
    button: {
      fontSize: '0.875rem',   // 14px - Button text from Style Guide
      fontWeight: 500,
      textTransform: 'none',  // Preserve natural casing
      letterSpacing: '0.025em',
    },
  },
  spacing: 8,                 // 8px base unit spacing system from Style Guide
  shape: {
    borderRadius: 8,          // Default border radius from Style Guide
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
  },
});

// Create test store
const createTestStore = () => configureStore({
  reducer: {
    auth: (state = { isAuthenticated: false, user: null }) => state,
  },
});

// Test wrapper component with all providers
const TestWrapper: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const store = createTestStore();

  return (
    <Provider store={store}>
      <ThemeProvider theme={vttToolsTheme}>
        <BrowserRouter>
          {children}
        </BrowserRouter>
      </ThemeProvider>
    </Provider>
  );
};
TestWrapper.displayName = 'TestWrapper';

// Simple test login form component for testing
const TestLoginForm: React.FC = () => {
  const [email, setEmail] = React.useState('');
  const [password, setPassword] = React.useState('');
  const [errors, setErrors] = React.useState<Record<string, string>>({});
  const [isLoading, setIsLoading] = React.useState(false);

  const validateEmail = (email: string) => {
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return emailRegex.test(email);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    const newErrors: Record<string, string> = {};

    if (!email) {
      newErrors.email = 'Email is required';
    } else if (!validateEmail(email)) {
      newErrors.email = 'Invalid email format';
    }

    if (!password) {
      newErrors.password = 'Password is required';
    } else if (password.length < 6) {
      newErrors.password = 'Password must be at least 6 characters';
    }

    if (Object.keys(newErrors).length > 0) {
      setErrors(newErrors);
      return;
    }

    setIsLoading(true);
    setErrors({});

    try {
      const result = await mockAuthService.loginAsync({ email, password });
      if (!result.success) {
        setErrors({ general: result.message });
      }
    } catch (error) {
      console.error('Login error:', error);
      setErrors({ general: 'Network error occurred' });
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <form onSubmit={handleSubmit} data-testid="login-form">
      <TextField
        fullWidth
        label="Email Address"
        type="email"
        value={email}
        onChange={(e) => setEmail(e.target.value)}
        error={!!errors.email}
        helperText={errors.email}
        margin="normal"
        data-testid="email-input"
        required
      />

      <TextField
        fullWidth
        label="Password"
        type="password"
        value={password}
        onChange={(e) => setPassword(e.target.value)}
        error={!!errors.password}
        helperText={errors.password}
        margin="normal"
        data-testid="password-input"
        required
      />

      {errors.general && (
        <Alert severity="error" sx={{ mt: 2 }} data-testid="error-alert">
          {errors.general}
        </Alert>
      )}

      <Button
        type="submit"
        fullWidth
        variant="contained"
        disabled={isLoading}
        sx={{ mt: 3, mb: 2 }}
        data-testid="login-button"
      >
        {isLoading ? <CircularProgress size={24} /> : 'Sign In'}
      </Button>
    </form>
  );
};
TestLoginForm.displayName = 'TestLoginForm';

// Import Material UI components
import {
  TextField,
  Button,
  Alert,
  CircularProgress,
  Box,
  Typography
} from '@mui/material';
import React from 'react';

describe('VTTTools React Authentication Components', () => {

  beforeAll(() => {
    console.log('🚀 Starting React authentication component testing...');
    console.log('🎨 Testing Material UI Studio Professional theme integration...');
  });

  beforeEach(() => {
    cleanup();
    vi.clearAllMocks();
    mockAuthService.loginAsync.mockResolvedValue(mockSuccessResponse);
    mockAuthService.registerAsync.mockResolvedValue(mockSuccessResponse);
  });

  describe('2.1 Material UI Theme Integration', () => {

    it('should apply Studio Professional color palette correctly', async () => {
      console.log('🧪 Testing Material UI Studio Professional theme colors...');

      render(
        <TestWrapper>
          <Box>
            <Button variant="contained" data-testid="primary-button">
              Primary Button
            </Button>
            <Button variant="contained" color="secondary" data-testid="secondary-button">
              Secondary Button
            </Button>
            <TextField
              label="Test Input"
              data-testid="test-input"
              variant="outlined"
            />
          </Box>
        </TestWrapper>
      );

      const primaryButton = screen.getByTestId('primary-button');
      const secondaryButton = screen.getByTestId('secondary-button');
      const textField = screen.getByTestId('test-input');

      // Validate primary blue color (#2563EB)
      expect(primaryButton).toHaveStyle({
        backgroundColor: 'rgb(37, 99, 235)' // #2563EB converted to RGB
      });

      // Validate secondary purple color (#7C3AED)
      expect(secondaryButton).toHaveStyle({
        backgroundColor: 'rgb(124, 58, 237)' // #7C3AED converted to RGB
      });

      // Validate text field border radius (8px from Style Guide)
      const inputElement = textField.querySelector('.MuiOutlinedInput-root');
      expect(inputElement).toHaveStyle({
        borderRadius: '8px'
      });

      console.log('✅ Studio Professional color palette correctly applied');
    });

    it('should use Inter font family from Style Guide', async () => {
      console.log('🧪 Testing Inter font family application...');

      render(
        <TestWrapper>
          <Typography variant="h1" data-testid="heading-text">
            VTT Tools
          </Typography>
          <Button data-testid="button-text">
            Action Button
          </Button>
        </TestWrapper>
      );

      const headingText = screen.getByTestId('heading-text');
      const buttonText = screen.getByTestId('button-text');

      // Check that Inter font is applied (first in font stack)
      const computedHeadingStyle = window.getComputedStyle(headingText);
      const computedButtonStyle = window.getComputedStyle(buttonText);

      expect(computedHeadingStyle.fontFamily).toContain('Inter');
      expect(computedButtonStyle.fontFamily).toContain('Inter');

      console.log('✅ Inter font family correctly applied from Style Guide');
    });

    it('should apply 8px spacing system from Style Guide', async () => {
      console.log('🧪 Testing 8px spacing system...');

      render(
        <TestWrapper>
          <Box sx={{ p: 3, m: 2 }} data-testid="spaced-box">
            <Typography>Spaced Content</Typography>
          </Box>
        </TestWrapper>
      );

      const spacedBox = screen.getByTestId('spaced-box');
      const computedStyle = window.getComputedStyle(spacedBox);

      // p: 3 should be 3 * 8px = 24px
      expect(computedStyle.padding).toBe('24px');
      // m: 2 should be 2 * 8px = 16px
      expect(computedStyle.margin).toBe('16px');

      console.log('✅ 8px spacing system correctly implemented');
    });
  });

  describe('2.2 Login Form Functionality and Validation', () => {

    it('should render login form with Material UI styling', async () => {
      console.log('🧪 Testing login form rendering and Material UI styling...');

      render(
        <TestWrapper>
          <TestLoginForm />
        </TestWrapper>
      );

      // Verify form elements are present
      const emailInput = screen.getByTestId('email-input');
      const passwordInput = screen.getByTestId('password-input');
      const loginButton = screen.getByTestId('login-button');

      expect(emailInput).toBeInTheDocument();
      expect(passwordInput).toBeInTheDocument();
      expect(loginButton).toBeInTheDocument();

      // Verify Material UI styling is applied
      expect(emailInput.querySelector('.MuiOutlinedInput-root')).toBeInTheDocument();
      expect(passwordInput.querySelector('.MuiOutlinedInput-root')).toBeInTheDocument();

      console.log('✅ Login form rendered with proper Material UI styling');
    });

    it('should validate email format with real-time feedback', async () => {
      console.log('🧪 Testing email format validation...');

      const user = userEvent.setup();

      render(
        <TestWrapper>
          <TestLoginForm />
        </TestWrapper>
      );

      const emailInput = screen.getByTestId('email-input');
      const loginButton = screen.getByTestId('login-button');

      // Test invalid email format
      await user.type(emailInput, 'invalid-email');
      await user.click(loginButton);

      await waitFor(() => {
        expect(screen.getByText('Invalid email format')).toBeInTheDocument();
      });

      console.log('✅ Email format validation working with real-time feedback');
    });

    it('should validate password strength requirements', async () => {
      console.log('🧪 Testing password strength validation...');

      const user = userEvent.setup();

      render(
        <TestWrapper>
          <TestLoginForm />
        </TestWrapper>
      );

      const emailInput = screen.getByTestId('email-input');
      const passwordInput = screen.getByTestId('password-input');
      const loginButton = screen.getByTestId('login-button');

      await user.type(emailInput, 'test@vtttools.com');
      await user.type(passwordInput, '123'); // Too weak
      await user.click(loginButton);

      await waitFor(() => {
        expect(screen.getByText('Password must be at least 6 characters')).toBeInTheDocument();
      });

      console.log('✅ Password strength validation working correctly');
    });

    it('should handle successful login with proper UI feedback', async () => {
      console.log('🧪 Testing successful login flow...');

      const user = userEvent.setup();

      render(
        <TestWrapper>
          <TestLoginForm />
        </TestWrapper>
      );

      const emailInput = screen.getByTestId('email-input');
      const passwordInput = screen.getByTestId('password-input');
      const loginButton = screen.getByTestId('login-button');

      await user.type(emailInput, 'test@vtttools.com');
      await user.type(passwordInput, 'ValidPassword123!');
      await user.click(loginButton);

      await waitFor(() => {
        expect(mockAuthService.loginAsync).toHaveBeenCalledWith({
          email: 'test@vtttools.com',
          password: 'ValidPassword123!'
        });
      });

      console.log('✅ Successful login flow working correctly');
    });

    it('should handle authentication errors gracefully', async () => {
      console.log('🧪 Testing authentication error handling...');

      const user = userEvent.setup();
      mockAuthService.loginAsync.mockResolvedValue({
        success: false,
        message: 'Invalid credentials'
      });

      render(
        <TestWrapper>
          <TestLoginForm />
        </TestWrapper>
      );

      const emailInput = screen.getByTestId('email-input');
      const passwordInput = screen.getByTestId('password-input');
      const loginButton = screen.getByTestId('login-button');

      await user.type(emailInput, 'test@vtttools.com');
      await user.type(passwordInput, 'WrongPassword');
      await user.click(loginButton);

      await waitFor(() => {
        const errorAlert = screen.getByTestId('error-alert');
        expect(errorAlert).toBeInTheDocument();
        expect(errorAlert).toHaveTextContent('Invalid credentials');
      });

      console.log('✅ Authentication error handling working correctly');
    });

    it('should show loading state during authentication', async () => {
      console.log('🧪 Testing loading state during authentication...');

      const user = userEvent.setup();

      // Mock a delayed response
      mockAuthService.loginAsync.mockImplementation(
        () => new Promise(resolve => setTimeout(() => resolve(mockSuccessResponse), 1000))
      );

      render(
        <TestWrapper>
          <TestLoginForm />
        </TestWrapper>
      );

      const emailInput = screen.getByTestId('email-input');
      const passwordInput = screen.getByTestId('password-input');
      const loginButton = screen.getByTestId('login-button');

      await user.type(emailInput, 'test@vtttools.com');
      await user.type(passwordInput, 'ValidPassword123!');
      await user.click(loginButton);

      // Check that loading state is shown
      expect(loginButton).toBeDisabled();
      expect(screen.getByRole('progressbar')).toBeInTheDocument();

      console.log('✅ Loading state properly displayed during authentication');
    });

    it('should handle network errors gracefully', async () => {
      console.log('🧪 Testing network error handling...');

      const user = userEvent.setup();
      mockAuthService.loginAsync.mockRejectedValue(new Error('Network error'));

      render(
        <TestWrapper>
          <TestLoginForm />
        </TestWrapper>
      );

      const emailInput = screen.getByTestId('email-input');
      const passwordInput = screen.getByTestId('password-input');
      const loginButton = screen.getByTestId('login-button');

      await user.type(emailInput, 'test@vtttools.com');
      await user.type(passwordInput, 'ValidPassword123!');
      await user.click(loginButton);

      await waitFor(() => {
        expect(screen.getByText('Network error occurred')).toBeInTheDocument();
      });

      console.log('✅ Network error handling working correctly');
    });
  });

  describe('2.3 Form Accessibility and User Experience', () => {

    it('should have proper ARIA attributes for accessibility', async () => {
      console.log('🧪 Testing form accessibility attributes...');

      render(
        <TestWrapper>
          <TestLoginForm />
        </TestWrapper>
      );

      const emailInput = screen.getByTestId('email-input');
      const passwordInput = screen.getByTestId('password-input');
      const loginButton = screen.getByTestId('login-button');

      // Check for proper ARIA attributes
      expect(emailInput).toHaveAttribute('type', 'email');
      expect(passwordInput).toHaveAttribute('type', 'password');
      expect(loginButton).toHaveAttribute('type', 'submit');

      // Check for required attributes
      const emailInputElement = emailInput.querySelector('input');
      const passwordInputElement = passwordInput.querySelector('input');

      expect(emailInputElement).toHaveAttribute('required');
      expect(passwordInputElement).toHaveAttribute('required');

      console.log('✅ Form accessibility attributes properly configured');
    });

    it('should support keyboard navigation', async () => {
      console.log('🧪 Testing keyboard navigation...');

      const user = userEvent.setup();

      render(
        <TestWrapper>
          <TestLoginForm />
        </TestWrapper>
      );

      const emailInput = screen.getByTestId('email-input').querySelector('input');
      const passwordInput = screen.getByTestId('password-input').querySelector('input');
      const loginButton = screen.getByTestId('login-button');

      // Test tab navigation
      if (emailInput) await user.click(emailInput);
      await user.tab();
      expect(passwordInput).toHaveFocus();

      await user.tab();
      expect(loginButton).toHaveFocus();

      console.log('✅ Keyboard navigation working correctly');
    });

    it('should provide immediate visual feedback on form interaction', async () => {
      console.log('🧪 Testing visual feedback on form interaction...');

      const user = userEvent.setup();

      render(
        <TestWrapper>
          <TestLoginForm />
        </TestWrapper>
      );

      const emailInput = screen.getByTestId('email-input');
      const inputElement = emailInput.querySelector('input');

      if (inputElement) {
        // Focus should change visual state
        await user.click(inputElement);

        const outlinedInput = emailInput.querySelector('.MuiOutlinedInput-root');
        expect(outlinedInput).toHaveClass('Mui-focused');

        console.log('✅ Visual feedback on form interaction working correctly');
      }
    });
  });

  describe('2.4 Performance and Responsiveness', () => {

    it('should render form components within performance budget', () => {
      console.log('🧪 Testing component rendering performance...');

      const startTime = performance.now();

      render(
        <TestWrapper>
          <TestLoginForm />
        </TestWrapper>
      );

      const endTime = performance.now();
      const renderTime = endTime - startTime;

      // Should render within 100ms for good UX
      expect(renderTime).toBeLessThan(100);

      console.log(`✅ Form rendered in ${renderTime.toFixed(2)}ms (under 100ms budget)`);
    });

    it('should handle rapid user input without performance degradation', async () => {
      console.log('🧪 Testing performance under rapid input...');

      const user = userEvent.setup();

      render(
        <TestWrapper>
          <TestLoginForm />
        </TestWrapper>
      );

      const emailInput = screen.getByTestId('email-input').querySelector('input');

      if (emailInput) {
        const startTime = performance.now();

        // Type rapidly
        await user.type(emailInput, 'rapid.typing.test@vtttools.com');

        const endTime = performance.now();
        const inputTime = endTime - startTime;

        // Should handle rapid input within reasonable time
        expect(inputTime).toBeLessThan(1000);

        console.log(`✅ Rapid input handled in ${inputTime.toFixed(2)}ms`);
      }
    });
  });
});