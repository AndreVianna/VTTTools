export interface AdminUser {
  id: string;
  email: string;
  displayName: string;
  isAdmin: boolean;
  emailConfirmed: boolean;
  twoFactorEnabled: boolean;
}

export interface LoginRequest {
  email: string;
  password: string;
  twoFactorCode?: string;
}

export interface LoginResponse {
  success: boolean;
  requiresTwoFactor?: boolean;
  error?: string;
}

export interface AuthState {
  user: AdminUser | null;
  isAuthenticated: boolean;
  isLoading: boolean;
  error: string | null;
}
