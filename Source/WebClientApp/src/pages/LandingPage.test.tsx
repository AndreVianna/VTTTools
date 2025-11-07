/**
 * LandingPage Component Tests
 * Tests conditional rendering based on auth state
 * Coverage: Landing Page BDD scenarios
 */

import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, screen, fireEvent } from '@testing-library/react';
import { Provider } from 'react-redux';
import { configureStore } from '@reduxjs/toolkit';
import { BrowserRouter } from 'react-router-dom';
import { ThemeProvider, createTheme } from '@mui/material/styles';
import { LandingPage } from './LandingPage';
import authReducer from '@/store/slices/authSlice';
import type { User } from '@/types/domain';
import * as React from 'react';

// Mock useAuth hook
const mockNavigate = vi.fn();
vi.mock('react-router-dom', async () => {
  const actual = await vi.importActual('react-router-dom');
  return {
    ...actual,
    useNavigate: () => mockNavigate,
  };
});

describe('LandingPage', () => {
  let store: ReturnType<typeof configureStore>;
  let mockUser: User;

  const createTestStore = (isAuthenticated = false, user: User | null = null) => {
    const preloadedState = {
      auth: {
        user,
        token: null,
        isAuthenticated,
        isLoading: false,
        error: null,
        loginAttempts: 0,
        lastLoginAttempt: null
      }
    };

    return configureStore({
      reducer: { auth: authReducer },
      preloadedState
    });
  };

  const renderWithProviders = (
    component: React.ReactElement,
    { themeMode = 'light' }: { themeMode?: 'light' | 'dark' } = {}
  ) => {
    const theme = createTheme({ palette: { mode: themeMode } });

    return render(
      <Provider store={store}>
        <BrowserRouter>
          <ThemeProvider theme={theme}>
            {component}
          </ThemeProvider>
        </BrowserRouter>
      </Provider>
    );
  };

  beforeEach(() => {
    mockUser = {
      id: '019639ea-c7de-7a01-8548-41edfccde206',
      email: 'gm@vtttools.com',
      userName: 'gm@vtttools.com',
      name: 'Game Master',
      displayName: 'Master',
      emailConfirmed: true,
      phoneNumberConfirmed: false,
      twoFactorEnabled: false,
      lockoutEnabled: false,
      accessFailedCount: 0,
      createdAt: '2025-01-01T00:00:00Z'
    };

    mockNavigate.mockClear();
  });

  describe('BDD: Conditional rendering (unauthenticated)', () => {
    beforeEach(() => {
      store = createTestStore(false, null);
    });

    it('should render hero section for unauthenticated users', () => {
      // Arrange & Act
      renderWithProviders(<LandingPage />);

      // Assert - BDD: Hero section displayed
      expect(screen.getByText('Craft Legendary Adventures')).toBeInTheDocument();
      expect(screen.getByText(/professional virtual tabletop tools/i)).toBeInTheDocument();
      expect(screen.getByRole('button', { name: /start creating/i })).toBeInTheDocument();
      expect(screen.getByRole('button', { name: /explore features/i })).toBeInTheDocument();
    });

    it('should not render dashboard preview for unauthenticated users', () => {
      // Arrange & Act
      renderWithProviders(<LandingPage />);

      // Assert - BDD: Dashboard preview NOT visible
      expect(screen.queryByText(/welcome back/i)).not.toBeInTheDocument();
      expect(screen.queryByText(/your creative workspace/i)).not.toBeInTheDocument();
      expect(screen.queryByText(/scene editor/i)).not.toBeInTheDocument();
    });

    it('should display primary heading and subtitle', () => {
      // Arrange & Act
      renderWithProviders(<LandingPage />);

      // Assert - BDD: Marketing content visible
      const heading = screen.getByRole('heading', { name: /craft legendary adventures/i });
      expect(heading).toBeInTheDocument();

      const subtitle = screen.getByText(/professional virtual tabletop tools/i);
      expect(subtitle).toBeInTheDocument();
    });

    it('should have prominently displayed CTA buttons', () => {
      // Arrange & Act
      renderWithProviders(<LandingPage />);

      // Assert - BDD: CTAs prominently displayed
      const startButton = screen.getByRole('button', { name: /start creating/i });
      const exploreButton = screen.getByRole('button', { name: /explore features/i });

      expect(startButton).toBeInTheDocument();
      expect(exploreButton).toBeInTheDocument();
      expect(startButton).toBeVisible();
      expect(exploreButton).toBeVisible();
    });
  });

  describe('BDD: Conditional rendering (authenticated)', () => {
    beforeEach(() => {
      store = createTestStore(true, mockUser);
    });

    it('should render dashboard preview for authenticated users', () => {
      // Arrange & Act
      renderWithProviders(<LandingPage />);

      // Assert - BDD: Dashboard preview displayed
      expect(screen.getByText(/welcome back, GameMaster!/i)).toBeInTheDocument();
      expect(screen.getByText(/your creative workspace/i)).toBeInTheDocument();
    });

    it('should not render hero section for authenticated users', () => {
      // Arrange & Act
      renderWithProviders(<LandingPage />);

      // Assert - BDD: Hero section NOT visible
      expect(screen.queryByText('Craft Legendary Adventures')).not.toBeInTheDocument();
      expect(screen.queryByRole('button', { name: /start creating/i })).not.toBeInTheDocument();
      expect(screen.queryByRole('button', { name: /explore features/i })).not.toBeInTheDocument();
    });

    it('should display personalized greeting with user name', () => {
      // Arrange & Act
      renderWithProviders(<LandingPage />);

      // Assert - BDD: Personalized greeting
      const greeting = screen.getByText(/welcome back, GameMaster!/i);
      expect(greeting).toBeInTheDocument();
    });

    it('should show 4 action cards', () => {
      // Arrange & Act
      renderWithProviders(<LandingPage />);

      // Assert - BDD: Exactly 4 action cards
      expect(screen.getByText('Scene Editor')).toBeInTheDocument();
      expect(screen.getByText('Content Library')).toBeInTheDocument();
      expect(screen.getByText('Asset Library')).toBeInTheDocument();
      expect(screen.getByText('Account Settings')).toBeInTheDocument();
    });
  });

  describe('BDD: Hero section navigation', () => {
    beforeEach(() => {
      store = createTestStore(false, null);
    });

    it('should navigate to registration when Start Creating is clicked', () => {
      // Arrange
      renderWithProviders(<LandingPage />);
      const startButton = screen.getByRole('button', { name: /start creating/i });

      // Act
      fireEvent.click(startButton);

      // Assert - BDD: Navigate to /register
      expect(mockNavigate).toHaveBeenCalledWith('/register');
    });

    it('should navigate to login when Explore Features is clicked', () => {
      // Arrange
      renderWithProviders(<LandingPage />);
      const exploreButton = screen.getByRole('button', { name: /explore features/i });

      // Act
      fireEvent.click(exploreButton);

      // Assert - BDD: Navigate to /login
      expect(mockNavigate).toHaveBeenCalledWith('/login');
    });
  });

  describe('BDD: Dashboard preview action cards', () => {
    beforeEach(() => {
      store = createTestStore(true, mockUser);
    });

    it('should navigate to Scene Editor when Open Editor is clicked', () => {
      // Arrange
      renderWithProviders(<LandingPage />);
      const openEditorButton = screen.getByRole('button', { name: /open editor/i });

      // Act
      fireEvent.click(openEditorButton);

      // Assert - BDD: Navigate to /scene-editor
      expect(mockNavigate).toHaveBeenCalledWith('/scene-editor');
    });

    it('should navigate to Asset Library when Browse Assets is clicked', () => {
      // Arrange
      renderWithProviders(<LandingPage />);
      const browseButton = screen.getByRole('button', { name: /browse assets/i });

      // Act
      fireEvent.click(browseButton);

      // Assert - BDD: Navigate to /assets
      expect(mockNavigate).toHaveBeenCalledWith('/assets');
    });

    it('should show active Scene Editor card', () => {
      // Arrange & Act
      renderWithProviders(<LandingPage />);

      // Assert - BDD: Scene Editor active (Phase 3-4)
      const sceneCard = screen.getByText('Scene Editor').closest('div[class*="MuiCard"]');
      expect(sceneCard).toBeInTheDocument();

      const openButton = screen.getByRole('button', { name: /open editor/i });
      expect(openButton).toBeEnabled();
    });

    it('should show active Asset Library card', () => {
      // Arrange & Act
      renderWithProviders(<LandingPage />);

      // Assert - BDD: Asset Library active
      const assetCard = screen.getByText('Asset Library').closest('div[class*="MuiCard"]');
      expect(assetCard).toBeInTheDocument();

      const browseButton = screen.getByRole('button', { name: /browse assets/i });
      expect(browseButton).toBeEnabled();
    });

    it('should show disabled Content Library card with phase label', () => {
      // Arrange & Act
      renderWithProviders(<LandingPage />);

      // Assert - BDD: Content Library disabled (Phase 7-8)
      expect(screen.getByText('Content Library')).toBeInTheDocument();

      const phase7Button = screen.getByRole('button', { name: /phase 7-8/i });
      expect(phase7Button).toBeDisabled();
    });

    it('should show disabled Account Settings card with phase label', () => {
      // Arrange & Act
      renderWithProviders(<LandingPage />);

      // Assert - BDD: Account Settings disabled (Phase 10)
      expect(screen.getByText('Account Settings')).toBeInTheDocument();

      const phase10Button = screen.getByRole('button', { name: /phase 10/i });
      expect(phase10Button).toBeDisabled();
    });

    it('should display card descriptions', () => {
      // Arrange & Act
      renderWithProviders(<LandingPage />);

      // Assert - BDD: Descriptive card content
      expect(screen.getByText(/create tactical maps with grids and tokens/i)).toBeInTheDocument();
      expect(screen.getByText(/manage epics, campaigns, adventures/i)).toBeInTheDocument();
      expect(screen.getByText(/browse creatures, characters, tokens/i)).toBeInTheDocument();
      expect(screen.getByText(/profile, security, 2FA settings/i)).toBeInTheDocument();
    });
  });

  describe('BDD: Dashboard personalization', () => {
    it('should show personalized greeting with displayName', () => {
      // Arrange
      const userWithDisplayName = { ...mockUser, email: 'alice@vtttools.com', name: 'Alice', displayName: 'Alice' };
      store = createTestStore(true, userWithDisplayName);

      // Act
      renderWithProviders(<LandingPage />);

      // Assert - BDD: Personalized greeting
      expect(screen.getByText(/welcome back, Alice!/i)).toBeInTheDocument();
    });

    it('should show fallback greeting when displayName missing', () => {
      // Arrange
      const userWithoutName = { ...mockUser, name: '', displayName: '' };
      store = createTestStore(true, userWithoutName);

      // Act
      renderWithProviders(<LandingPage />);

      // Assert - BDD: Fallback greeting
      expect(screen.getByText(/welcome back, Game Master!/i)).toBeInTheDocument();
    });

    it('should display subheading for authenticated users', () => {
      // Arrange
      store = createTestStore(true, mockUser);

      // Act
      renderWithProviders(<LandingPage />);

      // Assert
      expect(screen.getByText(/your creative workspace/i)).toBeInTheDocument();
    });
  });

  describe('BDD: Theme support', () => {
    beforeEach(() => {
      store = createTestStore(false, null);
    });

    it('should render correctly in light mode', () => {
      // Arrange & Act
      renderWithProviders(<LandingPage />, { themeMode: 'light' });

      // Assert - Component renders without errors
      expect(screen.getByText('Craft Legendary Adventures')).toBeInTheDocument();
    });

    it('should render correctly in dark mode', () => {
      // Arrange & Act
      renderWithProviders(<LandingPage />, { themeMode: 'dark' });

      // Assert - Component renders without errors
      expect(screen.getByText('Craft Legendary Adventures')).toBeInTheDocument();
    });
  });

  describe('BDD: Accessibility', () => {
    beforeEach(() => {
      store = createTestStore(false, null);
    });

    it('should have proper heading hierarchy for hero section', () => {
      // Arrange & Act
      renderWithProviders(<LandingPage />);

      // Assert - BDD: Proper ARIA hierarchy
      const mainHeading = screen.getByRole('heading', { level: 1 });
      expect(mainHeading).toHaveTextContent('Craft Legendary Adventures');
    });

    it('should have descriptive button labels', () => {
      // Arrange & Act
      renderWithProviders(<LandingPage />);

      // Assert - BDD: Buttons have descriptive labels
      const startButton = screen.getByRole('button', { name: /start creating/i });
      const exploreButton = screen.getByRole('button', { name: /explore features/i });

      expect(startButton).toBeInTheDocument();
      expect(exploreButton).toBeInTheDocument();
    });
  });

  describe('BDD: Accessibility (authenticated)', () => {
    beforeEach(() => {
      store = createTestStore(true, mockUser);
    });

    it('should have proper heading hierarchy for dashboard', () => {
      // Arrange & Act
      renderWithProviders(<LandingPage />);

      // Assert - BDD: Proper heading hierarchy
      const mainHeading = screen.getByRole('heading', { level: 1 });
      expect(mainHeading).toHaveTextContent(/welcome back, GameMaster!/i);
    });

    it('should announce card status for screen readers', () => {
      // Arrange & Act
      renderWithProviders(<LandingPage />);

      // Assert - BDD: Disabled cards indicate status
      const disabledButton1 = screen.getByRole('button', { name: /phase 7-8/i });
      const disabledButton2 = screen.getByRole('button', { name: /phase 10/i });

      expect(disabledButton1).toBeDisabled();
      expect(disabledButton2).toBeDisabled();
    });
  });

  describe('BDD: Dynamic state changes', () => {
    it('should re-render when authentication state changes to authenticated', () => {
      // Arrange - Start unauthenticated
      store = createTestStore(false, null);
      const { rerender } = renderWithProviders(<LandingPage />);

      expect(screen.getByText('Craft Legendary Adventures')).toBeInTheDocument();

      // Act - Update store to authenticated
      store.dispatch({
        type: 'auth/setAuthenticated',
        payload: { user: mockUser }
      });

      rerender(
        <Provider store={store}>
          <BrowserRouter>
            <ThemeProvider theme={createTheme()}>
              <LandingPage />
            </ThemeProvider>
          </BrowserRouter>
        </Provider>
      );

      // Assert - BDD: Page re-renders with dashboard
      expect(screen.queryByText('Craft Legendary Adventures')).not.toBeInTheDocument();
      expect(screen.getByText(/welcome back, GameMaster!/i)).toBeInTheDocument();
    });

    it('should re-render when authentication state changes to unauthenticated', () => {
      // Arrange - Start authenticated
      store = createTestStore(true, mockUser);
      const { rerender } = renderWithProviders(<LandingPage />);

      expect(screen.getByText(/welcome back, GameMaster!/i)).toBeInTheDocument();

      // Act - Logout
      store.dispatch({ type: 'auth/logout' });

      rerender(
        <Provider store={store}>
          <BrowserRouter>
            <ThemeProvider theme={createTheme()}>
              <LandingPage />
            </ThemeProvider>
          </BrowserRouter>
        </Provider>
      );

      // Assert - BDD: Page re-renders with hero section
      expect(screen.queryByText(/welcome back/i)).not.toBeInTheDocument();
      expect(screen.getByText('Craft Legendary Adventures')).toBeInTheDocument();
    });
  });

  describe('responsive design', () => {
    beforeEach(() => {
      store = createTestStore(false, null);
    });

    it('should render hero section in container', () => {
      // Arrange & Act
      renderWithProviders(<LandingPage />);

      // Assert - Container rendered
      const container = screen.getByText('Craft Legendary Adventures').closest('div[class*="MuiContainer"]');
      expect(container).toBeInTheDocument();
    });
  });
});
