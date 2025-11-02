import axios from 'axios';
import type { AdminUser, LoginRequest, LoginResponse } from '../types/auth';

const API_BASE = '/api/admin/auth';

export const authService = {
  async login(credentials: LoginRequest): Promise<LoginResponse> {
    try {
      await axios.post(`${API_BASE}/login`, credentials, {
        withCredentials: true,
      });
      return { success: true };
    } catch (error) {
      if (axios.isAxiosError(error) && error.response) {
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
      await axios.post(`${API_BASE}/logout`, {}, { withCredentials: true });
    } catch {
    }
  },

  async getCurrentUser(): Promise<AdminUser | null> {
    try {
      const response = await axios.get<AdminUser>(`${API_BASE}/me`, {
        withCredentials: true,
      });
      return response.data;
    } catch (error) {
      return null;
    }
  },

  async checkSession(): Promise<boolean> {
    try {
      const response = await axios.get(`${API_BASE}/session`, {
        withCredentials: true,
      });
      return response.status === 200;
    } catch (error) {
      return false;
    }
  },
};
