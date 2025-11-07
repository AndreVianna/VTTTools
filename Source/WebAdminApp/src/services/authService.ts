import apiClient from '@api/client';
import type { AdminUser, LoginRequest, LoginResponse } from '@types/auth';

const API_BASE = '/api/admin/auth';

export const authService = {
  async login(credentials: LoginRequest): Promise<LoginResponse> {
    try {
      const response = await apiClient.post<LoginResponse>(`${API_BASE}/login`, credentials);

      if (response.data.success) {
        return {
          success: true,
          user: response.data.user,
          token: response.data.token,
        };
      }

      return response.data;
    } catch (error) {
      if (apiClient.isAxiosError(error) && error.response) {
        if (error.response.status === 401 && error.response.data?.requiresTwoFactor) {
          return { success: false, requiresTwoFactor: true };
        }
        return {
          success: false,
          error: error.response.data?.message || 'Login failed',
        };
      }
      return { success: false, error: 'Network error' };
    }
  },

  async logout(): Promise<void> {
    try {
      await apiClient.post(`${API_BASE}/logout`, {});
    } catch {
      // Silently ignore logout errors
    }
  },

  async getCurrentUser(): Promise<AdminUser | null> {
    try {
      const response = await apiClient.get<AdminUser>(`${API_BASE}/me`);
      return response.data;
    } catch {
      return null;
    }
  },

  async checkSession(): Promise<boolean> {
    try {
      const response = await apiClient.get(`${API_BASE}/session`);
      return response.status === 200;
    } catch {
      return false;
    }
  },
};
