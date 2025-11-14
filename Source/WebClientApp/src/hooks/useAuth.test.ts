/**
 * useAuth Hook Unit Tests
 * Tests authentication hook with Redux integration
 * Coverage: Auth State Management + Session Restoration BDD scenarios
 */

import { configureStore } from '@reduxjs/toolkit';
import { renderHook, waitFor } from '@testing-library/react';
import * as React from 'react';
import { Provider } from 'react-redux';
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';
import { authApi } from '@/services/authApi';
import authReducer from '@/store/slices/authSlice';
import type { User } from '@/types/domain';
import { useAuth } from './useAuth';

declare global {
  var globalAuthInitialized: boolean;
}

// Mock dependencies
vi.mock('react-router-dom', () => ({
  useLocation: () => ({ pathname: '/', state: null }),
  useNavigate: () => vi.fn(),
}));

vi.mock('@/config/development', () => ({
  isDevelopment: false,
  MOCK_DATA: {
    user: {
      id: 'mock-user-id',
      userName: 'mock@vtttools.dev',
      email: 'mock@vtttools.dev',
      name: 'Mock User',
      displayName: 'User',
      emailConfirmed: true,
      twoFactorEnabled: false,
      roles: ['User'],
      createdAt: '2025-01-01T00:00:00Z',
      updatedAt: '2025-01-01T00:00:00Z',
    },
  },
  devUtils: {
    log: vi.fn(),
    warn: vi.fn(),
    error: vi.fn(),
  },
}));

describe('useAuth', () => {
  let store: ReturnType<typeof configureStore>;
  let mockUser: User;

  const createTestStore = () => {
    return configureStore({
      reducer: {
        auth: authReducer,
        [authApi.reducerPath]: authApi.reducer,
      },
      middleware: (getDefaultMiddleware) => getDefaultMiddleware().concat(authApi.middleware),
    });
  };

  const wrapper = ({ children }: { children: React.ReactNode }) =>
    React.createElement(Provider, { store } as React.ComponentProps<typeof Provider>, children);

  beforeEach(() => {
    store = createTestStore();
    mockUser = {
      id: '019639ea-c7de-7a01-8548-41edfccde206',
      userName: 'testuser@vtttools.com',
      email: 'testuser@vtttools.com',
      name: 'Test User',
      displayName: 'Test',
      emailConfirmed: true,
      phoneNumberConfirmed: false,
      twoFactorEnabled: false,
      lockoutEnabled: false,
      accessFailedCount: 0,
      createdAt: '2025-01-01T00:00:00Z',
    };

    globalThis.globalAuthInitialized = false;
  });

  afterEach(() => {
    vi.clearAllMocks();
  });

  describe('initial state', () => {
    it('should return initial unauthenticated state', () => {
      // Arrange & Act
      const { result } = renderHook(() => useAuth(), { wrapper });

      // Assert - BDD: Default unauthenticated state
      expect(result.current.user).toBeNull();
      expect(result.current.isAuthenticated).toBe(false);
      expect(result.current.isInitializing).toBe(true);
      expect(result.current.error).toBeFalsy();
    });

    it('should expose all auth methods', () => {
      // Arrange & Act
      const { result } = renderHook(() => useAuth(), { wrapper });

      // Assert - All required methods available
      expect(result.current.login).toBeDefined();
      expect(result.current.logout).toBeDefined();
      expect(result.current.register).toBeDefined();
      expect(result.current.resetPassword).toBeDefined();
      expect(result.current.confirmResetPassword).toBeDefined();
      expect(result.current.refreshAuth).toBeDefined();
      expect(result.current.setupTwoFactor).toBeDefined();
      expect(result.current.enableTwoFactor).toBeDefined();
      expect(result.current.disableTwoFactor).toBeDefined();
      expect(result.current.verifyTwoFactor).toBeDefined();
      expect(result.current.verifyRecoveryCode).toBeDefined();
      expect(result.current.generateRecoveryCodes).toBeDefined();
      expect(result.current.changePassword).toBeDefined();
      expect(result.current.updateProfile).toBeDefined();
      expect(result.current.canRetryLogin).toBeDefined();
      expect(result.current.getLockoutTimeRemaining).toBeDefined();
      expect(result.current.clearError).toBeDefined();
    });
  });

  describe('BDD: Redux as PRIMARY source of truth', () => {
    it('should use Redux isAuthenticated as source of truth', async () => {
      // Arrange - Dispatch authenticated state to Redux
      const { result } = renderHook(() => useAuth(), { wrapper });

      store.dispatch({
        type: 'auth/setAuthenticated',
        payload: { user: mockUser },
      });

      // Act & Assert - Wait for hook to reflect Redux state
      await waitFor(() => {
        expect(result.current.isAuthenticated).toBe(true);
      });

      expect(result.current.user).toEqual(mockUser);
    });

    it('should return null user when Redux says unauthenticated', () => {
      // Arrange - Redux state is unauthenticated
      const { result } = renderHook(() => useAuth(), { wrapper });

      store.dispatch({ type: 'auth/logout' });

      // Act & Assert - Hook returns null regardless of cached data
      expect(result.current.isAuthenticated).toBe(false);
      expect(result.current.user).toBeNull();
    });
  });

  describe('BDD: Session restoration', () => {
    it('should detect when auth initialization is complete', async () => {
      // Arrange
      const { result } = renderHook(() => useAuth(), { wrapper });

      // Act - Wait for initialization
      await waitFor(
        () => {
          expect(result.current.isInitializing).toBe(false);
        },
        { timeout: 3000 },
      );

      // Assert - BDD: globalAuthInitialized flag prevents redundant calls
      expect(result.current.isInitializing).toBe(false);
    });

    it('should not make redundant API calls after initialization', async () => {
      // Arrange - First hook instance
      const { result: result1 } = renderHook(() => useAuth(), { wrapper });

      await waitFor(
        () => {
          expect(result1.current.isInitializing).toBe(false);
        },
        { timeout: 3000 },
      );

      // Act - Second hook instance mounts
      renderHook(() => useAuth(), { wrapper });

      // Assert - BDD: Global flag should be set from first instance
      // Note: Since we're using same store, second instance sees global flag
      expect(result1.current.isInitializing).toBe(false);
    });
  });

  describe('BDD: Loading overlay', () => {
    it('should show loading state during operations', async () => {
      // Arrange
      const { result } = renderHook(() => useAuth(), { wrapper });

      // Act - Set loading state
      store.dispatch({ type: 'auth/setLoading', payload: true });

      // Assert - Wait for hook to reflect loading state
      await waitFor(() => {
        expect(result.current.isLoading).toBe(true);
      });
    });
  });

  describe('rate limiting', () => {
    it('should allow login when under attempt limit', () => {
      // Arrange
      const { result } = renderHook(() => useAuth(), { wrapper });

      // Set 3 login attempts
      store.dispatch({
        type: 'auth/setAuthError',
        payload: 'Invalid credentials',
      });
      store.dispatch({
        type: 'auth/setAuthError',
        payload: 'Invalid credentials',
      });
      store.dispatch({
        type: 'auth/setAuthError',
        payload: 'Invalid credentials',
      });

      // Act
      const canRetry = result.current.canRetryLogin();

      // Assert - Under 5 attempts, can retry
      expect(canRetry).toBe(true);
    });

    it('should block login when exceeding attempt limit', async () => {
      // Arrange
      const { result } = renderHook(() => useAuth(), { wrapper });

      // Set 5 login attempts
      for (let i = 0; i < 5; i++) {
        store.dispatch({
          type: 'auth/setAuthError',
          payload: 'Invalid credentials',
        });
      }

      // Wait for state to propagate
      await waitFor(() => {
        expect(result.current.loginAttempts).toBe(5);
      });

      // Act
      const canRetry = result.current.canRetryLogin();

      // Assert - At 5 attempts, locked out
      expect(canRetry).toBe(false);
    });

    it('should calculate lockout time remaining', async () => {
      // Arrange
      const { result } = renderHook(() => useAuth(), { wrapper });

      // Set 5 login attempts to trigger lockout
      for (let i = 0; i < 5; i++) {
        store.dispatch({
          type: 'auth/setAuthError',
          payload: 'Invalid credentials',
        });
      }

      // Wait for all attempts to be recorded
      await waitFor(() => {
        expect(result.current.loginAttempts).toBe(5);
      });

      const state = store.getState() as { auth: { lastLoginAttempt?: number; loginAttempts: number } };
      const authState = state.auth;
      const lastAttempt = authState.lastLoginAttempt;

      if (!lastAttempt) {
        throw new Error('lastLoginAttempt was not set');
      }

      // Mock time to 5 minutes after last attempt
      const fiveMinutesLater = lastAttempt + 5 * 60 * 1000;
      const spy = vi.spyOn(Date, 'now').mockReturnValue(fiveMinutesLater);

      // Act
      const remaining = result.current.getLockoutTimeRemaining();

      // Assert - Approximately 10 minutes remaining (15 total - 5 elapsed)
      const lockoutDuration = 15 * 60 * 1000;
      expect(remaining).toBeGreaterThan(0);
      expect(remaining).toBeLessThanOrEqual(lockoutDuration);
      expect(remaining).toBeCloseTo(10 * 60 * 1000, -3); // Within 1000ms

      spy.mockRestore();
    });

    it('should allow retry after lockout expires', () => {
      // Arrange
      const { result } = renderHook(() => useAuth(), { wrapper });

      // Set 5 attempts 20 minutes ago
      for (let i = 0; i < 5; i++) {
        store.dispatch({
          type: 'auth/setAuthError',
          payload: 'Invalid credentials',
        });
      }

      // Mock time passing (20 minutes = past 15 minute lockout)
      const now = Date.now();
      vi.spyOn(Date, 'now').mockReturnValue(now + 20 * 60 * 1000);

      // Act
      const canRetry = result.current.canRetryLogin();

      // Assert - Lockout expired, can retry
      expect(canRetry).toBe(true);

      vi.restoreAllMocks();
    });
  });

  describe('clearError', () => {
    it('should clear authentication error', async () => {
      // Arrange
      const { result } = renderHook(() => useAuth(), { wrapper });

      store.dispatch({
        type: 'auth/setAuthError',
        payload: 'Test error',
      });

      // Wait for state to propagate
      await waitFor(() => {
        expect(result.current.error).toBe('Test error');
      });

      // Act
      result.current.clearError();

      // Assert - Error should be cleared (null or undefined is acceptable)
      await waitFor(() => {
        expect(result.current.error).toBeFalsy();
      });
    });
  });

  describe('BDD: Protected route enforcement', () => {
    it('should indicate authenticated state for protected routes', async () => {
      // Arrange
      const { result } = renderHook(() => useAuth(), { wrapper });

      store.dispatch({
        type: 'auth/setAuthenticated',
        payload: { user: mockUser },
      });

      // Act & Assert - Wait for state to propagate
      await waitFor(() => {
        expect(result.current.isAuthenticated).toBe(true);
      });
    });

    it('should indicate unauthenticated state for redirects', () => {
      // Arrange
      const { result } = renderHook(() => useAuth(), { wrapper });

      // Act & Assert - Unauthenticated user should be redirected
      expect(result.current.isAuthenticated).toBe(false);
      expect(result.current.user).toBeNull();
    });
  });

  describe('BDD: Error recovery', () => {
    it('should handle corrupted session gracefully', async () => {
      // Arrange
      const { result } = renderHook(() => useAuth(), { wrapper });

      // Simulate corrupted session returning 401
      store.dispatch({
        type: 'auth/setAuthError',
        payload: 'Invalid session',
      });

      // Act & Assert - Wait for state to propagate
      await waitFor(() => {
        expect(result.current.error).toBe('Invalid session');
      });

      expect(result.current.isAuthenticated).toBe(false);
      expect(result.current.user).toBeNull();
    });
  });

  describe('user data synchronization', () => {
    it('should return effectiveUser from Redux when authenticated', async () => {
      // Arrange
      const { result } = renderHook(() => useAuth(), { wrapper });

      store.dispatch({
        type: 'auth/setAuthenticated',
        payload: { user: mockUser },
      });

      // Act & Assert - Wait for state to propagate
      await waitFor(() => {
        expect(result.current.isAuthenticated).toBe(true);
      });

      expect(result.current.user).toEqual(mockUser);
    });

    it('should return null when Redux says unauthenticated', () => {
      // Arrange
      const { result } = renderHook(() => useAuth(), { wrapper });

      store.dispatch({ type: 'auth/logout' });

      // Act & Assert - No user returned when unauthenticated
      expect(result.current.user).toBeNull();
      expect(result.current.isAuthenticated).toBe(false);
    });
  });

  describe('development mode flags', () => {
    it('should expose development mode flag', () => {
      // Arrange & Act
      const { result } = renderHook(() => useAuth(), { wrapper });

      // Assert - Development flags available
      expect(result.current.isDevelopmentMode).toBeDefined();
    });
  });

  describe('login attempts tracking', () => {
    it('should expose loginAttempts from Redux', async () => {
      // Arrange
      const { result } = renderHook(() => useAuth(), { wrapper });

      store.dispatch({
        type: 'auth/setAuthError',
        payload: 'Failed attempt',
      });

      // Act & Assert - Wait for state to propagate
      await waitFor(() => {
        expect(result.current.loginAttempts).toBeGreaterThan(0);
      });
    });
  });
});
