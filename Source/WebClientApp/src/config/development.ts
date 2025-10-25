/**
 * Development configuration for VTT Tools WebClientApp
 * Handles both Aspire orchestration and standalone development modes
 */

// Development mode detection
export const isDevelopment = import.meta.env.MODE === 'development';
export const isStandalone = !window.location.origin.includes('aspire') &&
                            !import.meta.env.VITE_ASPIRE_MODE;

// API configuration
export const API_CONFIG = {
  // Aspire orchestration mode (default)
  aspire: {
    auth: '/api/auth',
    assets: '/api/assets',
    library: '/api/library',
    adventures: '/api/adventures',
    scenes: '/api/scenes',
    sessions: '/api/sessions',
    media: '/api/resources',
    health: '/health'
  },

  // Standalone development mode - direct to microservices
  standalone: {
    auth: 'https://localhost:7050/api/auth',
    assets: 'https://localhost:7171/api/assets',
    library: 'https://localhost:7172/api/library',
    adventures: 'https://localhost:7172/api/adventures',
    scenes: 'https://localhost:7172/api/scenes',
    sessions: 'https://localhost:7173/api/sessions',
    media: 'https://localhost:7174/api/resources',
    health: 'https://localhost:7050/health'
  }
};

// Get current API endpoints based on mode
export const getApiEndpoints = () => {
  if (isStandalone && isDevelopment) {
    //console.info('🔧 VTT Tools: Running in standalone development mode');
    return API_CONFIG.standalone;
  }

  //console.info('🚀 VTT Tools: Running in Aspire orchestration mode');
  return API_CONFIG.aspire;
};

// Development features
export const DEV_FEATURES = {
  // Enable mock data when backend is unavailable
  enableMockData: isStandalone && isDevelopment,

  // Enable detailed error logging
  enableVerboseErrors: isDevelopment,

  // Enable development UI features
  showDevTools: isDevelopment,

  // Network retry configuration for development
  maxRetries: isDevelopment ? 1 : 3,
  retryDelay: isDevelopment ? 1000 : 2000,
};

// Mock data configuration
export const MOCK_DATA = {
  // Mock user for development
  user: {
    id: '550e8400-e29b-41d4-a716-446655440000', // Valid GUID for development
    email: 'developer@vtttools.dev',
    userName: 'developer@vtttools.dev',
    name: 'Developer',
    displayName: 'Developer',
    emailConfirmed: true,
    phoneNumber: null,
    phoneNumberConfirmed: false,
    twoFactorEnabled: false,
    lockoutEnd: null,
    lockoutEnabled: false,
    accessFailedCount: 0,
    createdAt: new Date().toISOString(),
    lastLoginAt: new Date().toISOString(),
    profilePictureUrl: null
  },

  // Mock API responses
  responses: {
    login: { success: true, requiresTwoFactor: false },
    register: { success: true, message: 'Registration successful' },
    adventures: [],
    assets: [],
    sessions: []
  }
};

// Development utilities
export const devUtils = {
  log: (message: string, data?: any) => {
    if (isDevelopment) {
      console.log(`🔧 VTT Tools Dev: ${message}`, data || '');
    }
  },

  error: (message: string, error?: any) => {
    if (isDevelopment) {
      console.error(`❌ VTT Tools Dev Error: ${message}`, error || '');
    }
  },

  warn: (message: string, data?: any) => {
    if (isDevelopment) {
      console.warn(`⚠️ VTT Tools Dev Warning: ${message}`, data || '');
    }
  }
};