import { beforeEach, describe, expect, it } from 'vitest';
import type { User } from '@/types/domain';
import authReducer, { type AuthState, logout, setAuthenticated } from './authSlice';

describe('authSlice - JWT Token Management', () => {
  let initialState: AuthState;
  let mockUser: User;

  beforeEach(() => {
    localStorage.clear();
    initialState = {
      user: null,
      token: null,
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
      name: 'Test User',
      displayName: 'Test',
      emailConfirmed: true,
      phoneNumber: '',
      phoneNumberConfirmed: false,
      twoFactorEnabled: false,
      lockoutEnabled: false,
      accessFailedCount: 0,
      createdAt: '2025-11-01T00:00:00Z',
    };
  });

  describe('JWT Token Storage', () => {
    it('should store JWT token in state when provided', () => {
      const result = authReducer(initialState, setAuthenticated({ user: mockUser, token: 'test-jwt-token' }));

      expect(result.token).toBe('test-jwt-token');
      expect(result.user).toEqual(mockUser);
      expect(result.isAuthenticated).toBe(true);
    });

    it('should store JWT token in localStorage when provided', () => {
      authReducer(initialState, setAuthenticated({ user: mockUser, token: 'test-jwt-token' }));

      expect(localStorage.getItem('vtt_auth_token')).toBe('test-jwt-token');
    });

    it('should handle authentication without token (cookie-based)', () => {
      const result = authReducer(initialState, setAuthenticated({ user: mockUser }));

      expect(result.token).toBeNull();
      expect(result.user).toEqual(mockUser);
      expect(result.isAuthenticated).toBe(true);
      expect(localStorage.getItem('vtt_auth_token')).toBeNull();
    });

    it('should clear JWT token from state on logout', () => {
      const authenticatedState = authReducer(
        initialState,
        setAuthenticated({ user: mockUser, token: 'test-jwt-token' }),
      );

      const result = authReducer(authenticatedState, logout());

      expect(result.token).toBeNull();
      expect(result.user).toBeNull();
      expect(result.isAuthenticated).toBe(false);
    });

    it('should clear JWT token from localStorage on logout', () => {
      const authenticatedState = authReducer(
        initialState,
        setAuthenticated({ user: mockUser, token: 'test-jwt-token' }),
      );

      authReducer(authenticatedState, logout());

      expect(localStorage.getItem('vtt_auth_token')).toBeNull();
    });
  });
});
