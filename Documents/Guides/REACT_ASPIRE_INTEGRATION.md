# React-Aspire Integration Guide

## Overview

This guide provides comprehensive patterns and best practices for integrating React applications with .NET Aspire services, based on Phase 1 testing experiences. It covers Vite proxy configuration, service communication patterns, authentication integration, and error handling strategies.

## Core Integration Architecture

### Aspire Service Discovery vs. Direct URLs

**Phase 1 Lesson:** Aspire service discovery names (`https+http://auth-api`) do not work directly with Vite proxy. React applications must use actual localhost URLs for development.

```typescript
// ❌ INCORRECT - Aspire service names don't work in Vite
proxy: {
  '/api/auth': 'https+http://webapp',
  '/api/assets': 'https+http://assets-api',
}

// ✅ CORRECT - Use actual localhost URLs
proxy: {
  '/api/auth': 'https://localhost:7005',      // WebApp Identity service
  '/api/assets': 'https://localhost:7001',    // Assets microservice
  '/api/adventures': 'https://localhost:7003', // Library microservice
  '/api/scenes': 'https://localhost:7003',    // Scenes (part of Library)
  '/api/sessions': 'https://localhost:7002',  // Game microservice
  '/api/media': 'https://localhost:7004',     // Media microservice
}
```

### Environment-Specific Configuration

```typescript
// vite.config.ts - Complete configuration based on Phase 1 learnings
import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';
import { resolve } from 'path';

export default defineConfig(({ mode }) => {
  const isDevelopment = mode === 'development';

  return {
    plugins: [react()],

    // Path aliases for clean imports
    resolve: {
      alias: {
        '@': resolve(__dirname, 'src'),
        '@components': resolve(__dirname, 'src/components'),
        '@services': resolve(__dirname, 'src/services'),
        '@types': resolve(__dirname, 'src/types'),
      },
    },

    // Development server configuration
    server: {
      port: 5173,
      host: true, // Allow external connections for Aspire integration

      // Proxy configuration - CRITICAL for Aspire integration
      proxy: {
        // Authentication endpoints → WebApp Identity
        '/api/auth': {
          target: 'https://localhost:7005',
          changeOrigin: true,
          secure: false, // Accept self-signed certificates in development
          ws: false,     // Disable WebSocket proxying for auth endpoints
        },

        // Asset management → Assets microservice
        '/api/assets': {
          target: 'https://localhost:7001',
          changeOrigin: true,
          secure: false,
        },

        // Adventure and scene management → Library microservice
        '/api/adventures': {
          target: 'https://localhost:7003',
          changeOrigin: true,
          secure: false,
        },
        '/api/scenes': {
          target: 'https://localhost:7003', // Same as adventures - both in Library service
          changeOrigin: true,
          secure: false,
        },

        // Game sessions → Game microservice
        '/api/sessions': {
          target: 'https://localhost:7002',
          changeOrigin: true,
          secure: false,
        },

        // File uploads and media → Media microservice
        '/api/media': {
          target: 'https://localhost:7004',
          changeOrigin: true,
          secure: false,
        },
        '/api/resources': {
          target: 'https://localhost:7004', // Media resources
          changeOrigin: true,
          secure: false,
        },

        // SignalR for real-time features → Game microservice
        '/signalr': {
          target: 'https://localhost:7002',
          ws: true,        // Enable WebSocket proxying for SignalR
          changeOrigin: true,
          secure: false,
        },
      },
    },

    // Build configuration
    build: {
      outDir: 'dist',
      sourcemap: isDevelopment,
      minify: !isDevelopment,

      // Optimize for microservice architecture
      rollupOptions: {
        output: {
          manualChunks: {
            // Separate chunks for different concerns
            vendor: ['react', 'react-dom'],
            state: ['@reduxjs/toolkit', 'react-redux'],
            ui: ['@mui/material', '@mui/icons-material'],
            canvas: ['konva', 'react-konva'],
            api: ['axios', '@microsoft/signalr'],
          },
        },
      },
    },

    // Environment variables for service URLs
    define: {
      __DEV__: isDevelopment,
      __API_BASE_URL__: JSON.stringify(isDevelopment ? '' : '/api'),
    },
  };
});
```

## Authentication Integration Patterns

### Cookie-Based Authentication with Existing Identity

**Phase 1 Success:** React app successfully integrates with existing ASP.NET Core Identity without requiring token management.

```typescript
// src/services/authService.ts - Successful authentication pattern
export class AuthService {
  private baseUrl = '/api/auth';

  // Login - uses existing WebApp Identity endpoints
  async login(email: string, password: string): Promise<AuthResult> {
    const response = await fetch(`${this.baseUrl}/login`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'X-Requested-With': 'XMLHttpRequest', // CSRF protection
      },
      credentials: 'include', // CRITICAL: Include authentication cookies
      body: JSON.stringify({ email, password }),
    });

    if (!response.ok) {
      throw new Error(`Login failed: ${response.statusText}`);
    }

    const result = await response.json();
    return result;
  }

  // Current user - validates existing session
  async getCurrentUser(): Promise<User | null> {
    try {
      const response = await fetch(`${this.baseUrl}/me`, {
        credentials: 'include', // Include existing session cookies
      });

      if (response.status === 401) {
        return null; // Not authenticated
      }

      if (!response.ok) {
        throw new Error(`Failed to get current user: ${response.statusText}`);
      }

      return await response.json();
    } catch (error) {
      console.error('Error getting current user:', error);
      return null;
    }
  }

  // Logout - clears server-side session
  async logout(): Promise<void> {
    await fetch(`${this.baseUrl}/logout`, {
      method: 'POST',
      credentials: 'include',
      headers: {
        'X-Requested-With': 'XMLHttpRequest',
      },
    });

    // Redirect handled by server or manually
    window.location.href = '/login';
  }
}
```

### React Authentication Hook

```typescript
// src/hooks/useAuth.ts - Authentication hook based on Phase 1 patterns
import { useState, useEffect } from 'react';
import { AuthService } from '@services/authService';

interface AuthState {
  user: User | null;
  isLoading: boolean;
  isAuthenticated: boolean;
  error: string | null;
}

export const useAuth = () => {
  const [state, setState] = useState<AuthState>({
    user: null,
    isLoading: true,
    isAuthenticated: false,
    error: null,
  });

  const authService = new AuthService();

  useEffect(() => {
    checkAuthStatus();
  }, []);

  const checkAuthStatus = async () => {
    try {
      setState(prev => ({ ...prev, isLoading: true, error: null }));
      const user = await authService.getCurrentUser();

      setState({
        user,
        isLoading: false,
        isAuthenticated: !!user,
        error: null,
      });
    } catch (error) {
      setState({
        user: null,
        isLoading: false,
        isAuthenticated: false,
        error: error instanceof Error ? error.message : 'Authentication error',
      });
    }
  };

  const login = async (email: string, password: string) => {
    try {
      setState(prev => ({ ...prev, isLoading: true, error: null }));
      const result = await authService.login(email, password);

      if (result.success) {
        // Re-check auth status to get user details
        await checkAuthStatus();
        return { success: true };
      } else {
        setState(prev => ({
          ...prev,
          isLoading: false,
          error: result.message || 'Login failed'
        }));
        return { success: false, error: result.message };
      }
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'Login failed';
      setState(prev => ({ ...prev, isLoading: false, error: errorMessage }));
      return { success: false, error: errorMessage };
    }
  };

  const logout = async () => {
    try {
      await authService.logout();
      setState({
        user: null,
        isLoading: false,
        isAuthenticated: false,
        error: null,
      });
    } catch (error) {
      console.error('Logout error:', error);
      // Even if logout fails, clear local state
      setState({
        user: null,
        isLoading: false,
        isAuthenticated: false,
        error: null,
      });
    }
  };

  return {
    ...state,
    login,
    logout,
    refreshAuth: checkAuthStatus,
  };
};
```

## Service Communication Patterns

### API Client Base Class

**Phase 1 Learning:** Consistent API client pattern reduces code duplication and ensures proper error handling.

```typescript
// src/services/baseApiClient.ts - Extracted from Phase 1 success patterns
export abstract class BaseApiClient {
  protected baseUrl: string;

  constructor(baseUrl: string) {
    this.baseUrl = baseUrl;
  }

  protected async request<T>(
    endpoint: string,
    options: RequestInit = {}
  ): Promise<T> {
    const url = `${this.baseUrl}${endpoint}`;

    const config: RequestInit = {
      ...options,
      credentials: 'include', // CRITICAL: Always include cookies for authentication
      headers: {
        'Content-Type': 'application/json',
        'X-Requested-With': 'XMLHttpRequest', // CSRF protection
        ...options.headers,
      },
    };

    try {
      const response = await fetch(url, config);

      // Handle authentication failures
      if (response.status === 401) {
        // Redirect to login - let existing Identity handle it
        window.location.href = '/api/auth/login';
        throw new Error('Authentication required');
      }

      if (!response.ok) {
        const errorText = await response.text();
        let errorMessage: string;

        try {
          const errorData = JSON.parse(errorText);
          errorMessage = errorData.message || errorData.error || response.statusText;
        } catch {
          errorMessage = errorText || response.statusText;
        }

        throw new Error(`API Error (${response.status}): ${errorMessage}`);
      }

      // Handle empty responses
      const contentType = response.headers.get('content-type');
      if (contentType && contentType.includes('application/json')) {
        return await response.json();
      } else {
        return {} as T; // Return empty object for non-JSON responses
      }

    } catch (error) {
      if (error instanceof TypeError && error.message.includes('fetch')) {
        // Network error - service might be down
        throw new Error('Service unavailable. Please check if all services are running.');
      }
      throw error;
    }
  }

  // Convenience methods
  protected get<T>(endpoint: string): Promise<T> {
    return this.request<T>(endpoint, { method: 'GET' });
  }

  protected post<T>(endpoint: string, data?: any): Promise<T> {
    return this.request<T>(endpoint, {
      method: 'POST',
      body: data ? JSON.stringify(data) : undefined,
    });
  }

  protected put<T>(endpoint: string, data?: any): Promise<T> {
    return this.request<T>(endpoint, {
      method: 'PUT',
      body: data ? JSON.stringify(data) : undefined,
    });
  }

  protected delete<T>(endpoint: string): Promise<T> {
    return this.request<T>(endpoint, { method: 'DELETE' });
  }
}
```

### Service Implementation Examples

```typescript
// src/services/adventuresService.ts - Library microservice client
export class AdventuresService extends BaseApiClient {
  constructor() {
    super('/api/adventures'); // Proxied to library-api (localhost:7003)
  }

  async getAdventures(): Promise<Adventure[]> {
    return this.get<Adventure[]>('');
  }

  async getAdventure(id: string): Promise<Adventure> {
    return this.get<Adventure>(`/${id}`);
  }

  async createAdventure(request: CreateAdventureRequest): Promise<Adventure> {
    return this.post<Adventure>('', request);
  }

  async updateAdventure(id: string, request: UpdateAdventureRequest): Promise<Adventure> {
    return this.put<Adventure>(`/${id}`, request);
  }

  async deleteAdventure(id: string): Promise<void> {
    return this.delete<void>(`/${id}`);
  }

  // Scene management (same service)
  async getScenes(adventureId: string): Promise<Scene[]> {
    return this.get<Scene[]>(`/${adventureId}/scenes`);
  }

  async createScene(adventureId: string, request: CreateSceneRequest): Promise<Scene> {
    return this.post<Scene>(`/${adventureId}/scenes`, request);
  }
}

// src/services/assetsService.ts - Assets microservice client
export class AssetsService extends BaseApiClient {
  constructor() {
    super('/api/assets'); // Proxied to assets-api (localhost:7001)
  }

  async getAssets(): Promise<Asset[]> {
    return this.get<Asset[]>('');
  }

  async createAsset(request: CreateAssetRequest): Promise<Asset> {
    return this.post<Asset>('', request);
  }

  async uploadAssetImage(assetId: string, file: File): Promise<void> {
    // File upload requires different handling
    const formData = new FormData();
    formData.append('file', file);

    const response = await fetch(`/api/assets/${assetId}/upload`, {
      method: 'POST',
      credentials: 'include',
      body: formData, // No Content-Type header for FormData
    });

    if (!response.ok) {
      throw new Error(`Upload failed: ${response.statusText}`);
    }
  }
}
```

## Error Handling & User Experience

### Global Error Boundary

**Phase 1 Success:** React Error Boundaries prevent crashes and provide user-friendly feedback.

```typescript
// src/components/ErrorBoundary.tsx - Based on Phase 1 successful patterns
interface ErrorBoundaryState {
  hasError: boolean;
  error: Error | null;
  errorInfo: React.ErrorInfo | null;
}

export class ErrorBoundary extends React.Component<
  React.PropsWithChildren<{}>,
  ErrorBoundaryState
> {
  constructor(props: React.PropsWithChildren<{}>) {
    super(props);
    this.state = { hasError: false, error: null, errorInfo: null };
  }

  static getDerivedStateFromError(error: Error): Partial<ErrorBoundaryState> {
    return { hasError: true, error };
  }

  componentDidCatch(error: Error, errorInfo: React.ErrorInfo) {
    this.setState({ errorInfo });

    // Log error details for debugging
    console.error('React Error Boundary caught error:', {
      error: error.message,
      stack: error.stack,
      componentStack: errorInfo.componentStack,
      timestamp: new Date().toISOString(),
      userAgent: navigator.userAgent,
      url: window.location.href,
    });

    // Report to monitoring service if available
    if (window.gtag) {
      window.gtag('event', 'exception', {
        description: error.message,
        fatal: false,
      });
    }
  }

  render() {
    if (this.state.hasError) {
      return (
        <div className="error-boundary">
          <h2>Something went wrong</h2>
          <p>
            {this.state.error?.message || 'An unexpected error occurred'}
          </p>
          <details>
            <summary>Error Details (for developers)</summary>
            <pre>{this.state.error?.stack}</pre>
            {this.state.errorInfo && (
              <pre>{this.state.errorInfo.componentStack}</pre>
            )}
          </details>
          <button
            onClick={() => this.setState({ hasError: false, error: null, errorInfo: null })}
          >
            Try Again
          </button>
          <button onClick={() => window.location.reload()}>
            Reload Page
          </button>
        </div>
      );
    }

    return this.props.children;
  }
}
```

### Service-Specific Error Handling

```typescript
// src/hooks/useApiError.ts - Centralized API error handling
export const useApiError = () => {
  const [error, setError] = useState<string | null>(null);

  const handleError = useCallback((err: unknown) => {
    let errorMessage: string;

    if (err instanceof Error) {
      // Check for specific error patterns from Phase 1 experiences
      if (err.message.includes('Service unavailable')) {
        errorMessage = 'One or more services are not running. Please check the Aspire dashboard.';
      } else if (err.message.includes('Authentication required')) {
        errorMessage = 'Please log in to continue.';
        // Redirect handled by BaseApiClient
        return;
      } else if (err.message.includes('API Error (400)')) {
        errorMessage = 'Invalid request. Please check your input and try again.';
      } else if (err.message.includes('API Error (500)')) {
        errorMessage = 'Server error. Please try again later.';
      } else {
        errorMessage = err.message;
      }
    } else {
      errorMessage = 'An unexpected error occurred.';
    }

    setError(errorMessage);

    // Auto-clear error after 5 seconds
    setTimeout(() => setError(null), 5000);
  }, []);

  const clearError = useCallback(() => setError(null), []);

  return { error, handleError, clearError };
};

// Usage in components
const AdventuresList: React.FC = () => {
  const [adventures, setAdventures] = useState<Adventure[]>([]);
  const { error, handleError, clearError } = useApiError();
  const adventuresService = new AdventuresService();

  useEffect(() => {
    const loadAdventures = async () => {
      try {
        const data = await adventuresService.getAdventures();
        setAdventures(data);
      } catch (err) {
        handleError(err);
      }
    };

    loadAdventures();
  }, []);

  if (error) {
    return (
      <div className="error-message">
        <p>{error}</p>
        <button onClick={clearError}>Dismiss</button>
      </div>
    );
  }

  return (
    <div>
      {/* Adventure list UI */}
    </div>
  );
};
```

## Real-Time Integration with SignalR

### SignalR Connection Setup

```typescript
// src/services/signalRService.ts - Real-time communication
import { HubConnectionBuilder, HubConnection, LogLevel } from '@microsoft/signalr';

export class SignalRService {
  private connection: HubConnection | null = null;

  async connect(hubUrl: string = '/signalr/gamehub'): Promise<void> {
    this.connection = new HubConnectionBuilder()
      .withUrl(hubUrl, {
        // Use existing authentication cookies
        withCredentials: true,
      })
      .withAutomaticReconnect()
      .configureLogging(LogLevel.Information)
      .build();

    try {
      await this.connection.start();
      console.log('SignalR connected');
    } catch (error) {
      console.error('SignalR connection failed:', error);
      throw error;
    }
  }

  async disconnect(): Promise<void> {
    if (this.connection) {
      await this.connection.stop();
      this.connection = null;
    }
  }

  // Game session events
  onPlayerJoined(callback: (player: Player) => void): void {
    this.connection?.on('PlayerJoined', callback);
  }

  onSceneUpdated(callback: (scene: Scene) => void): void {
    this.connection?.on('SceneUpdated', callback);
  }

  async joinGameSession(sessionId: string): Promise<void> {
    await this.connection?.invoke('JoinGameSession', sessionId);
  }

  async updateScene(sceneId: string, updates: SceneUpdate): Promise<void> {
    await this.connection?.invoke('UpdateScene', sceneId, updates);
  }
}
```

## Development Workflow Integration

### NPM Scripts for Aspire Integration

```json
// package.json - Development scripts optimized for Aspire
{
  "scripts": {
    "dev": "vite",
    "dev:aspire": "concurrently \"dotnet run --project ../../Source/AppHost\" \"npm run dev\"",
    "build": "tsc && vite build",
    "preview": "vite preview",
    "test": "vitest",
    "test:e2e": "playwright test",
    "lint": "eslint . --ext ts,tsx",
    "format": "prettier --write .",

    // Health check and debugging
    "check-services": "curl -s https://localhost:7001/health && curl -s https://localhost:7002/health && curl -s https://localhost:7003/health && curl -s https://localhost:7004/health && curl -s https://localhost:7005/health",
    "debug:proxy": "DEBUG=vite:* npm run dev"
  },
  "devDependencies": {
    "concurrently": "^8.0.0"
  }
}
```

### Environment Configuration

```typescript
// src/config/environment.ts - Environment-aware configuration
interface EnvironmentConfig {
  apiBaseUrl: string;
  signalRUrl: string;
  isDevelopment: boolean;
  enableDebugLogging: boolean;
}

export const getEnvironmentConfig = (): EnvironmentConfig => {
  const isDevelopment = import.meta.env.DEV;

  return {
    // In development, APIs are proxied through Vite
    // In production, APIs are served from the same origin
    apiBaseUrl: isDevelopment ? '' : '/api',
    signalRUrl: isDevelopment ? '/signalr' : '/signalr',
    isDevelopment,
    enableDebugLogging: isDevelopment,
  };
};

// Usage in services
export class ConfiguredApiClient extends BaseApiClient {
  constructor(endpoint: string) {
    const config = getEnvironmentConfig();
    super(`${config.apiBaseUrl}${endpoint}`);
  }
}
```

## Performance Optimization

### React Query Integration

```typescript
// src/hooks/useAdventures.ts - Optimized data fetching
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';

export const useAdventures = () => {
  return useQuery({
    queryKey: ['adventures'],
    queryFn: async () => {
      const service = new AdventuresService();
      return service.getAdventures();
    },
    staleTime: 5 * 60 * 1000, // 5 minutes
    cacheTime: 10 * 60 * 1000, // 10 minutes
  });
};

export const useCreateAdventure = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (request: CreateAdventureRequest) => {
      const service = new AdventuresService();
      return service.createAdventure(request);
    },
    onSuccess: () => {
      // Invalidate and refetch adventures list
      queryClient.invalidateQueries({ queryKey: ['adventures'] });
    },
  });
};
```

### Bundle Optimization for Microservices

```typescript
// vite.config.ts - Optimized bundling for microservice architecture
export default defineConfig({
  build: {
    rollupOptions: {
      output: {
        manualChunks: {
          // Separate chunks by service domain
          'auth-services': ['./src/services/authService.ts'],
          'adventure-services': ['./src/services/adventuresService.ts'],
          'asset-services': ['./src/services/assetsService.ts'],
          'game-services': ['./src/services/gameService.ts'],
          'media-services': ['./src/services/mediaService.ts'],

          // Separate vendor chunks
          'vendor-react': ['react', 'react-dom'],
          'vendor-ui': ['@mui/material', '@mui/icons-material'],
          'vendor-state': ['@tanstack/react-query'],
          'vendor-canvas': ['konva', 'react-konva'],
        },
      },
    },
  },
});
```

## Testing React-Aspire Integration

### Service Mock Setup

```typescript
// src/testing/serviceMocks.ts - Mock services for testing
export const createMockAuthService = () => ({
  login: jest.fn().mockResolvedValue({ success: true }),
  getCurrentUser: jest.fn().mockResolvedValue({
    id: '1',
    email: 'test@example.com',
    userName: 'testuser',
  }),
  logout: jest.fn().mockResolvedValue(undefined),
});

export const createMockAdventuresService = () => ({
  getAdventures: jest.fn().mockResolvedValue([
    { id: '1', name: 'Test Adventure', description: 'Test', type: 'OneShot' },
  ]),
  createAdventure: jest.fn().mockResolvedValue({
    id: '2',
    name: 'New Adventure',
    description: 'New',
    type: 'Campaign',
  }),
});
```

### Integration Test Patterns

```typescript
// src/testing/integrationTests.ts - Test real service integration
describe('React-Aspire Integration', () => {
  beforeAll(async () => {
    // Ensure Aspire services are running
    const healthChecks = await Promise.allSettled([
      fetch('https://localhost:7001/health'),
      fetch('https://localhost:7003/health'),
      fetch('https://localhost:7005/health'),
    ]);

    const unhealthyServices = healthChecks.filter(
      result => result.status === 'rejected'
    );

    if (unhealthyServices.length > 0) {
      throw new Error(
        'Some Aspire services are not running. Please start with: dotnet run --project Source/AppHost'
      );
    }
  });

  test('can authenticate with WebApp Identity', async () => {
    const authService = new AuthService();

    // This test requires actual Identity service running
    const result = await authService.login('test@example.com', 'Test123!');
    expect(result.success).toBe(true);
  });

  test('can fetch adventures from Library service', async () => {
    const adventuresService = new AdventuresService();

    // This test requires actual Library service running
    const adventures = await adventuresService.getAdventures();
    expect(Array.isArray(adventures)).toBe(true);
  });
});
```

---

**Key Takeaways from Phase 1:**
1. Use direct localhost URLs in Vite proxy, not Aspire service names
2. Always include `credentials: 'include'` for authentication
3. Implement comprehensive error handling for service communication
4. Test incrementally with actual services running
5. Use React Error Boundaries to prevent UI crashes
6. Monitor service health before testing features