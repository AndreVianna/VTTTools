/**
 * Mock API service for development mode
 * Provides fallback responses when backend services are unavailable
 */

import { MOCK_DATA, devUtils } from '@/config/development';
import type {
  User,
  LoginRequest,
  LoginResponse,
  RegisterRequest,
  RegisterResponse,
  Adventure,
  Scene,
  Asset,
  GameSession,
  MediaResource
} from '@/types/domain';

// Delay to simulate network latency in development
const MOCK_DELAY = 500;

const delay = (ms: number) => new Promise(resolve => setTimeout(resolve, ms));

export class MockApiService {
  private static instance: MockApiService;

  public static getInstance(): MockApiService {
    if (!MockApiService.instance) {
      MockApiService.instance = new MockApiService();
    }
    return MockApiService.instance;
  }

  // Authentication Mock Responses
  async mockLogin(request: LoginRequest): Promise<LoginResponse> {
    devUtils.log('Mock login called', request.email);
    await delay(MOCK_DELAY);

    return {
      success: true,
      requiresTwoFactor: false,
      message: 'Mock login successful'
    };
  }

  async mockRegister(request: RegisterRequest): Promise<RegisterResponse> {
    devUtils.log('Mock register called', request.email);
    await delay(MOCK_DELAY);

    return {
      success: true,
      message: 'Mock registration successful'
    };
  }

  async mockGetCurrentUser(): Promise<User> {
    devUtils.log('Mock get current user called');
    await delay(MOCK_DELAY);

    return MOCK_DATA.user;
  }

  async mockLogout(): Promise<void> {
    devUtils.log('Mock logout called');
    await delay(MOCK_DELAY);
  }

  // Adventures Mock Responses
  async mockGetAdventures(): Promise<Adventure[]> {
    devUtils.log('Mock get adventures called');
    await delay(MOCK_DELAY);

    return [
      {
        id: 'mock-adventure-1',
        name: 'Demo Adventure',
        description: 'A mock adventure for development',
        type: 'OneShot' as const,
        campaignId: undefined,
        backgroundId: undefined,
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString()
      }
    ];
  }

  // Assets Mock Responses
  async mockGetAssets(): Promise<Asset[]> {
    devUtils.log('Mock get assets called');
    await delay(MOCK_DELAY);

    return [
      {
        id: 'mock-asset-1',
        type: 'Character' as const,
        name: 'Demo Character',
        description: 'A mock character asset',
        displayId: undefined,
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString()
      }
    ];
  }

  // Game Sessions Mock Responses
  async mockGetSessions(): Promise<GameSession[]> {
    devUtils.log('Mock get sessions called');
    await delay(MOCK_DELAY);

    return [];
  }

  // Media Mock Responses
  async mockGetMedia(): Promise<MediaResource[]> {
    devUtils.log('Mock get media called');
    await delay(MOCK_DELAY);

    return [];
  }

  // Health Check Mock
  async mockHealthCheck(): Promise<{ status: string; timestamp: string }> {
    devUtils.log('Mock health check called');
    await delay(100); // Faster for health checks

    return {
      status: 'healthy',
      timestamp: new Date().toISOString()
    };
  }

  // Generic error response for unsupported operations
  mockError(operation: string): never {
    const error = new Error(`Mock API: ${operation} not implemented in development mode`);
    devUtils.warn(`Mock API called for: ${operation}`);
    throw error;
  }
}

// Export singleton instance
export const mockApi = MockApiService.getInstance();

// Utility function to check if we should use mock responses
export const shouldUseMockApi = (error?: any): boolean => {
  // Use mock API if:
  // 1. In standalone development mode
  // 2. Network error occurred (likely backend not running)
  // 3. CORS error occurred
  if (import.meta.env.VITE_STANDALONE === 'true') {
    return true;
  }

  if (error) {
    const isNetworkError = error.code === 'NETWORK_ERROR' ||
                          error.message?.includes('fetch') ||
                          error.message?.includes('network') ||
                          error.message?.includes('CORS');

    if (isNetworkError) {
      devUtils.warn('Network error detected, falling back to mock API', error.message);
      return true;
    }
  }

  return false;
};