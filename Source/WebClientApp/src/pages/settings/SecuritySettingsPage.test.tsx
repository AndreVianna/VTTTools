import { createTheme, ThemeProvider } from '@mui/material/styles';
import { configureStore } from '@reduxjs/toolkit';
import { render, screen } from '@testing-library/react';
import type React from 'react';
import { Provider } from 'react-redux';
import { BrowserRouter } from 'react-router-dom';
import { describe, expect, it } from 'vitest';
import authReducer from '@/store/slices/authSlice';
import type { User } from '@/types/domain';
import { SecuritySettingsPage } from './SecuritySettingsPage';

describe('SecuritySettingsPage', () => {
  let store: ReturnType<typeof configureStore>;

  const createTestStore = (twoFactorEnabled: boolean) => {
    const user: User = {
      id: '1',
      email: 'test@example.com',
      name: 'Test User',
      displayName: 'Test',
      emailConfirmed: true,
      phoneNumberConfirmed: false,
      twoFactorEnabled,
      lockoutEnabled: false,
      accessFailedCount: 0,
      createdAt: '2025-01-01T00:00:00Z',
    };

    return configureStore({
      reducer: { auth: authReducer },
      preloadedState: {
        auth: {
          user,
          token: null,
          isAuthenticated: true,
          isLoading: false,
          error: null,
          loginAttempts: 0,
          lastLoginAttempt: null,
        },
      },
    });
  };

  const renderWithProviders = (component: React.ReactElement) => {
    const theme = createTheme({ palette: { mode: 'light' } });

    return render(
      <Provider store={store}>
        <BrowserRouter>
          <ThemeProvider theme={theme}>{component}</ThemeProvider>
        </BrowserRouter>
      </Provider>,
    );
  };

  describe('BDD: Security Settings Page rendering', () => {
    it('renders security settings heading', () => {
      store = createTestStore(false);
      renderWithProviders(<SecuritySettingsPage />);

      expect(screen.getByRole('heading', { level: 1, name: /security settings/i })).toBeInTheDocument();
    });

    it('renders change password button', () => {
      store = createTestStore(false);
      renderWithProviders(<SecuritySettingsPage />);

      expect(screen.getByRole('button', { name: /change password/i })).toBeInTheDocument();
    });
  });

  describe('BDD: 2FA status display', () => {
    it('shows 2FA disabled status when user has 2FA disabled', () => {
      store = createTestStore(false);
      renderWithProviders(<SecuritySettingsPage />);

      expect(screen.getByText(/2fa disabled/i)).toBeInTheDocument();
      expect(screen.getByRole('button', { name: /enable 2fa/i })).toBeInTheDocument();
    });

    it('shows 2FA enabled status when user has 2FA enabled', () => {
      store = createTestStore(true);
      renderWithProviders(<SecuritySettingsPage />);

      expect(screen.getByText(/2fa enabled/i)).toBeInTheDocument();
      expect(screen.getByRole('button', { name: /disable 2fa/i })).toBeInTheDocument();
    });
  });

  describe('BDD: Theme support', () => {
    it('renders correctly in dark mode', () => {
      store = createTestStore(false);
      const darkTheme = createTheme({ palette: { mode: 'dark' } });

      render(
        <Provider store={store}>
          <BrowserRouter>
            <ThemeProvider theme={darkTheme}>
              <SecuritySettingsPage />
            </ThemeProvider>
          </BrowserRouter>
        </Provider>,
      );

      expect(screen.getByRole('heading', { level: 1, name: /security settings/i })).toBeInTheDocument();
    });
  });
});
