/**
 * Development configuration for VTT Tools WebAdminApp
 * Handles both Aspire orchestration and standalone development modes
 */

// Development mode detection
export const isDevelopment = import.meta.env.MODE === 'development';

// API configuration
export const API_CONFIG = {
    // Aspire orchestration mode (default)
    aspire: {
        auth: '/api/admin/auth',
        admin: '/api/admin',
        health: '/health',
    },
};

// Get current API endpoints based on mode
export const getApiEndpoints = () => {
    return API_CONFIG.aspire;
};

// Development features
export const DEV_FEATURES = {
    // Enable detailed error logging
    enableVerboseErrors: isDevelopment,

    // Enable development UI features
    showDevTools: isDevelopment,

    // Network retry configuration for development
    maxRetries: isDevelopment ? 1 : 3,
    retryDelay: isDevelopment ? 1000 : 2000,
};

// Development utilities
export const devUtils = {
    log: (message: string, data?: unknown) => {
        if (isDevelopment) {
            console.log(`[VTT Admin Dev] ${message}`, data || '');
        }
    },

    error: (message: string, error?: unknown) => {
        if (isDevelopment) {
            console.error(`[VTT Admin Dev Error] ${message}`, error || '');
        }
    },

    warn: (message: string, data?: unknown) => {
        if (isDevelopment) {
            console.warn(`[VTT Admin Dev Warning] ${message}`, data || '');
        }
    },
};
