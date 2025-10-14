/**
 * authSlice Unit Tests
 * Tests Redux auth slice reducers and selectors
 * Coverage: Auth State Management BDD scenarios
 */

import { describe, it, expect, beforeEach } from 'vitest';
import authReducer, {
  setLoading,
  setAuthenticated,
  setAuthError,
  clearAuthError,
  logout,
  updateUser,
  resetLoginAttempts,
  selectAuth,
  selectUser,
  selectIsAuthenticated,
  selectAuthLoading,
  selectAuthError,
  selectLoginAttempts,
  type AuthState
} from './authSlice';
import type { User } from '@/types/domain';

describe('authSlice', () => {
  let initialState: AuthState;
  let mockUser: User;

  beforeEach(() => {
    initialState = {
      user: null,
      isAuthenticated: false,
      isLoading: false,
      error: null,
      loginAttempts: 0,
      lastLoginAttempt: null,
    };

    mockUser = {
      id: '019639ea-c7de-7a01-8548-41edfccde206',
      userName: 'testuser@vtttools.com',
      email: 'testuser@vtttools.com',
      emailConfirmed: true,
      phoneNumberConfirmed: false,
      twoFactorEnabled: false,
      lockoutEnabled: false,
      accessFailedCount: 0,
      createdAt: '2025-01-01T00:00:00Z'
    };
  });

  describe('initial state', () => {
    it('should return initial state when no action provided', () => {
      // Arrange & Act
      const result = authReducer(undefined, { type: 'unknown' });

      // Assert
      expect(result).toEqual(initialState);
    });
  });

  describe('setLoading', () => {
    it('should set loading to true when called with true', () => {
      // Arrange
      const previousState = { ...initialState };

      // Act
      const result = authReducer(previousState, setLoading(true));

      // Assert
      expect(result.isLoading).toBe(true);
      expect(result.user).toBeNull();
      expect(result.isAuthenticated).toBe(false);
    });

    it('should set loading to false when called with false', () => {
      // Arrange
      const previousState = { ...initialState, isLoading: true };

      // Act
      const result = authReducer(previousState, setLoading(false));

      // Assert
      expect(result.isLoading).toBe(false);
    });
  });

  describe('setAuthenticated', () => {
    it('should set authenticated state with user data', () => {
      // Arrange
      const previousState = { ...initialState };

      // Act
      const result = authReducer(previousState, setAuthenticated({ user: mockUser }));

      // Assert - BDD: Redux state is PRIMARY source of truth
      expect(result.isAuthenticated).toBe(true);
      expect(result.user).toEqual(mockUser);
      expect(result.isLoading).toBe(false);
      expect(result.error).toBeNull();
      expect(result.loginAttempts).toBe(0);
    });

    it('should clear error when setting authenticated state', () => {
      // Arrange
      const previousState = {
        ...initialState,
        error: 'Previous error',
        loginAttempts: 3
      };

      // Act
      const result = authReducer(previousState, setAuthenticated({ user: mockUser }));

      // Assert
      expect(result.error).toBeNull();
      expect(result.loginAttempts).toBe(0);
    });
  });

  describe('setAuthError', () => {
    it('should set error and increment login attempts', () => {
      // Arrange
      const previousState = {
        ...initialState,
        user: mockUser,
        isAuthenticated: true,
        loginAttempts: 2
      };
      const errorMessage = 'Invalid credentials';

      // Act
      const result = authReducer(previousState, setAuthError(errorMessage));

      // Assert
      expect(result.error).toBe(errorMessage);
      expect(result.isAuthenticated).toBe(false);
      expect(result.user).toBeNull();
      expect(result.isLoading).toBe(false);
      expect(result.loginAttempts).toBe(3);
      expect(result.lastLoginAttempt).toBeGreaterThan(0);
    });

    it('should clear user data when setting error', () => {
      // Arrange
      const previousState = {
        ...initialState,
        user: mockUser,
        isAuthenticated: true
      };

      // Act
      const result = authReducer(previousState, setAuthError('Error occurred'));

      // Assert
      expect(result.user).toBeNull();
      expect(result.isAuthenticated).toBe(false);
    });
  });

  describe('clearAuthError', () => {
    it('should clear error without affecting other state', () => {
      // Arrange
      const previousState = {
        ...initialState,
        user: mockUser,
        isAuthenticated: true,
        error: 'Some error'
      };

      // Act
      const result = authReducer(previousState, clearAuthError());

      // Assert
      expect(result.error).toBeNull();
      expect(result.user).toEqual(mockUser);
      expect(result.isAuthenticated).toBe(true);
    });
  });

  describe('logout', () => {
    it('should clear all auth state on logout', () => {
      // Arrange - BDD: Redux state cleared FIRST before navigation
      const previousState = {
        user: mockUser,
        isAuthenticated: true,
        isLoading: false,
        error: 'Some error',
        loginAttempts: 3,
        lastLoginAttempt: Date.now()
      };

      // Act
      const result = authReducer(previousState, logout());

      // Assert - All state cleared synchronously
      expect(result.user).toBeNull();
      expect(result.isAuthenticated).toBe(false);
      expect(result.isLoading).toBe(false);
      expect(result.error).toBeNull();
      expect(result.loginAttempts).toBe(0);
      expect(result.lastLoginAttempt).toBeNull();
    });

    it('should prevent UI flashing by clearing state immediately', () => {
      // Arrange - BDD Scenario: Logout prevents cached UI flash
      const previousState = {
        ...initialState,
        user: mockUser,
        isAuthenticated: true
      };

      // Act - Logout must clear Redux state synchronously
      const result = authReducer(previousState, logout());

      // Assert - State cleared immediately (no async delay)
      expect(result.isAuthenticated).toBe(false);
      expect(result.user).toBeNull();
    });
  });

  describe('updateUser', () => {
    it('should update user profile when user exists', () => {
      // Arrange
      const previousState = {
        ...initialState,
        user: mockUser,
        isAuthenticated: true
      };
      const updates = {
        phoneNumber: '+1234567890'
      };

      // Act
      const result = authReducer(previousState, updateUser(updates));

      // Assert
      expect(result.user).not.toBeNull();
      expect(result.user!.phoneNumber).toBe('+1234567890');
      expect(result.user!.email).toBe(mockUser.email); // Unchanged fields preserved
    });

    it('should not update when user is null', () => {
      // Arrange
      const previousState = { ...initialState };
      const updates = { phoneNumber: '+1234567890' };

      // Act
      const result = authReducer(previousState, updateUser(updates));

      // Assert
      expect(result.user).toBeNull();
    });
  });

  describe('resetLoginAttempts', () => {
    it('should reset login attempts and last attempt timestamp', () => {
      // Arrange
      const previousState = {
        ...initialState,
        loginAttempts: 5,
        lastLoginAttempt: Date.now()
      };

      // Act
      const result = authReducer(previousState, resetLoginAttempts());

      // Assert
      expect(result.loginAttempts).toBe(0);
      expect(result.lastLoginAttempt).toBeNull();
    });
  });

  describe('selectors', () => {
    let mockState: { auth: AuthState };

    beforeEach(() => {
      mockState = {
        auth: {
          user: mockUser,
          isAuthenticated: true,
          isLoading: false,
          error: 'Test error',
          loginAttempts: 2,
          lastLoginAttempt: 1234567890
        }
      };
    });

    it('should select entire auth state', () => {
      // Act
      const result = selectAuth(mockState);

      // Assert
      expect(result).toEqual(mockState.auth);
    });

    it('should select user', () => {
      // Act
      const result = selectUser(mockState);

      // Assert
      expect(result).toEqual(mockUser);
    });

    it('should select isAuthenticated', () => {
      // Act
      const result = selectIsAuthenticated(mockState);

      // Assert
      expect(result).toBe(true);
    });

    it('should select isLoading', () => {
      // Act
      const result = selectAuthLoading(mockState);

      // Assert
      expect(result).toBe(false);
    });

    it('should select error', () => {
      // Act
      const result = selectAuthError(mockState);

      // Assert
      expect(result).toBe('Test error');
    });

    it('should select loginAttempts', () => {
      // Act
      const result = selectLoginAttempts(mockState);

      // Assert
      expect(result).toBe(2);
    });
  });

  describe('BDD Coverage: Redux as PRIMARY source of truth', () => {
    it('should override cached data when logout is called', () => {
      // Arrange - Simulating cached authenticated state
      const cachedAuthenticatedState = {
        ...initialState,
        user: mockUser,
        isAuthenticated: true
      };

      // Act - Logout must clear Redux state immediately
      const result = authReducer(cachedAuthenticatedState, logout());

      // Assert - Redux state overrides any cached data
      expect(result.isAuthenticated).toBe(false);
      expect(result.user).toBeNull();
    });

    it('should allow login to synchronize Redux and RTK Query', () => {
      // Arrange
      const unauthenticatedState = { ...initialState };

      // Act - Login sets authenticated state
      const result = authReducer(unauthenticatedState, setAuthenticated({ user: mockUser }));

      // Assert - Both Redux and RTK Query should be synchronized
      expect(result.isAuthenticated).toBe(true);
      expect(result.user).toEqual(mockUser);
    });
  });

  describe('BDD Coverage: Error handling', () => {
    it('should handle corrupted session by clearing auth state', () => {
      // Arrange - User has invalid session
      const invalidSessionState = {
        ...initialState,
        user: mockUser,
        isAuthenticated: true
      };

      // Act - Backend returns 401, error is set
      const result = authReducer(invalidSessionState, setAuthError('Session expired'));

      // Assert - State cleared, user sees login page
      expect(result.isAuthenticated).toBe(false);
      expect(result.user).toBeNull();
      expect(result.error).toBe('Session expired');
    });
  });

  describe('BDD Coverage: Rate limiting', () => {
    it('should track login attempts for rate limiting', () => {
      // Arrange
      let state = { ...initialState };

      // Act - Multiple failed login attempts
      state = authReducer(state, setAuthError('Invalid credentials'));
      state = authReducer(state, setAuthError('Invalid credentials'));
      state = authReducer(state, setAuthError('Invalid credentials'));

      // Assert - Attempts tracked for lockout logic
      expect(state.loginAttempts).toBe(3);
      expect(state.lastLoginAttempt).toBeGreaterThan(0);
    });

    it('should reset attempts after successful login', () => {
      // Arrange - User locked out after 5 attempts
      const lockedOutState = {
        ...initialState,
        loginAttempts: 5,
        lastLoginAttempt: Date.now(),
        error: 'Too many attempts'
      };

      // Act - Successful login resets attempts
      const result = authReducer(lockedOutState, setAuthenticated({ user: mockUser }));

      // Assert
      expect(result.loginAttempts).toBe(0);
      expect(result.error).toBeNull();
    });
  });
});
