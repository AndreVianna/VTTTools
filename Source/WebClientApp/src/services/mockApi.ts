/**
 * Mock API service for development mode
 * Provides fallback responses when backend services are unavailable
 */

import { devUtils, MOCK_DATA } from '@/config/development';
import type {
  Adventure,
  Asset,
  GameSession,
  LoginRequest,
  LoginResponse,
  MediaResource,
  RegisterRequest,
  RegisterResponse,
  User,
} from '@/types/domain';
import { AssetKind, ContentType, ResourceRole } from '@/types/domain';

// Delay to simulate network latency in development
const MOCK_DELAY = 500;

const delay = (ms: number) => new Promise((resolve) => setTimeout(resolve, ms));

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
      message: 'Mock login successful',
    };
  }

  async mockRegister(request: RegisterRequest): Promise<RegisterResponse> {
    devUtils.log('Mock register called', request.email);
    await delay(MOCK_DELAY);

    return {
      success: true,
      message: 'Mock registration successful',
    };
  }

  async mockGetCurrentUser(): Promise<User> {
    devUtils.log('Mock get current user called');
    await delay(MOCK_DELAY);

    // Build user object omitting undefined optional properties
    const user = MOCK_DATA.user;
    const result: User = {
      id: user.id,
      email: user.email,
      userName: user.userName,
      name: user.name,
      displayName: user.displayName,
      emailConfirmed: user.emailConfirmed,
      phoneNumberConfirmed: user.phoneNumberConfirmed,
      twoFactorEnabled: user.twoFactorEnabled,
      lockoutEnabled: user.lockoutEnabled,
      accessFailedCount: user.accessFailedCount,
      createdAt: user.createdAt,
    };

    // Only include optional properties if they have values
    if (user.phoneNumber) result.phoneNumber = user.phoneNumber;
    if (user.lockoutEnd) result.lockoutEnd = user.lockoutEnd;
    if (user.lastLoginAt) result.lastLoginAt = user.lastLoginAt;
    if (user.profilePictureUrl) result.profilePictureUrl = user.profilePictureUrl;

    return result;
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
        type: ContentType.Adventure,
        name: 'Demo Adventure',
        description: 'A mock adventure for development',
        isPublished: false,
        ownerId: 'mock-owner',
      },
    ];
  }

  // Assets Mock Responses
  async mockGetAssets(): Promise<Asset[]> {
    devUtils.log('Mock get assets called');
    await delay(MOCK_DELAY);

    const createMockMediaResource = (name: string, role: ResourceRole = ResourceRole.Token): MediaResource => ({
      id: crypto.randomUUID(),
      role,
      path: `/mock/${name.toLowerCase().replace(/\s+/g, '-')}.png`,
      contentType: 'image/png',
      fileName: `${name.toLowerCase().replace(/\s+/g, '-')}.png`,
      fileSize: Math.floor(Math.random() * 50000) + 10000,
      dimensions: { width: 256, height: 256 },
      duration: '',
    });

    const assets: Asset[] = [
      {
        id: 'mock-asset-1',
        classification: {
          kind: AssetKind.Character,
          category: 'PC',
          type: 'Hero',
          subtype: null,
        },
        name: 'Hero Character',
        description: 'A playable hero character with portrait',
        portrait: createMockMediaResource('hero-portrait', ResourceRole.Portrait),
        tokenSize: { width: 1, height: 1 },
        tokens: [
          createMockMediaResource('hero-topdown'),
          createMockMediaResource('hero-miniature'),
        ],
        statBlocks: {},
        tags: [],
        ownerId: 'mock-owner',
        isPublished: true,
        isPublic: true,
      },
      {
        id: 'mock-asset-2',
        classification: {
          kind: AssetKind.Creature,
          category: 'Humanoid',
          type: 'Goblinoid',
          subtype: 'Goblin',
        },
        name: 'Goblin',
        description: 'A hostile goblin enemy',
        portrait: null,
        tokenSize: { width: 1, height: 1 },
        tokens: [
          createMockMediaResource('goblin-topdown'),
          createMockMediaResource('goblin-miniature'),
        ],
        statBlocks: {},
        tags: [],
        ownerId: 'mock-owner',
        isPublished: true,
        isPublic: true,
      },
      {
        id: 'mock-asset-3',
        classification: {
          kind: AssetKind.Creature,
          category: 'Giant',
          type: 'Ogre',
          subtype: null,
        },
        name: 'Ogre',
        description: 'Large monster with multiple image types',
        portrait: createMockMediaResource('ogre-portrait', ResourceRole.Portrait),
        tokenSize: { width: 2, height: 2 },
        tokens: [
          createMockMediaResource('ogre-topdown'),
          createMockMediaResource('ogre-miniature'),
          createMockMediaResource('ogre-photo'),
        ],
        statBlocks: {},
        tags: [],
        ownerId: 'mock-owner',
        isPublished: true,
        isPublic: true,
      },
      {
        id: 'mock-asset-4',
        classification: {
          kind: AssetKind.Creature,
          category: 'Dragon',
          type: 'Red Dragon',
          subtype: 'Ancient',
        },
        name: 'Dragon',
        description: 'Huge monster with custom size',
        portrait: createMockMediaResource('dragon-portrait'),
        tokenSize: { width: 4, height: 3 },
        tokens: [
          createMockMediaResource('dragon-topdown'),
          createMockMediaResource('dragon-photo'),
        ],
        statBlocks: {},
        tags: [],
        ownerId: 'mock-owner',
        isPublished: true,
        isPublic: true,
      },
      {
        id: 'mock-asset-5',
        classification: {
          kind: AssetKind.Character,
          category: 'NPC',
          type: 'Merchant',
          subtype: null,
        },
        name: 'Portrait Only NPC',
        description: 'NPC with portrait but no token images (edge case)',
        portrait: createMockMediaResource('npc-portrait'),
        tokenSize: { width: 1, height: 1 },
        tokens: [],
        statBlocks: {},
        tags: [],
        ownerId: 'mock-owner',
        isPublished: true,
        isPublic: false,
      },
      {
        id: 'mock-asset-6',
        classification: {
          kind: AssetKind.Object,
          category: 'Container',
          type: 'Crate',
          subtype: null,
        },
        name: 'Wooden Crate',
        description: 'A moveable wooden crate',
        portrait: null,
        tokenSize: { width: 1, height: 1 },
        tokens: [createMockMediaResource('crate-topdown')],
        statBlocks: {},
        tags: [],
        ownerId: 'mock-owner',
        isPublished: true,
        isPublic: true,
      },
      {
        id: 'mock-asset-7',
        classification: {
          kind: AssetKind.Object,
          category: 'Container',
          type: 'Chest',
          subtype: null,
        },
        name: 'Treasure Chest',
        description: 'A chest containing loot with portrait image',
        portrait: createMockMediaResource('chest-portrait'),
        tokenSize: { width: 1, height: 1 },
        tokens: [
          createMockMediaResource('chest-topdown'),
          createMockMediaResource('chest-miniature'),
        ],
        statBlocks: {},
        tags: [],
        ownerId: 'mock-owner',
        isPublished: true,
        isPublic: true,
      },
      {
        id: 'mock-asset-8',
        classification: {
          kind: AssetKind.Object,
          category: 'Structure',
          type: 'Wall',
          subtype: null,
        },
        name: 'Stone Wall',
        description: 'An immovable stone wall segment',
        portrait: null,
        tokenSize: { width: 1, height: 1 },
        tokens: [createMockMediaResource('wall-topdown')],
        statBlocks: {},
        tags: [],
        ownerId: 'mock-owner',
        isPublished: true,
        isPublic: true,
      },
      {
        id: 'mock-asset-9',
        classification: {
          kind: AssetKind.Object,
          category: 'Structure',
          type: 'Door',
          subtype: null,
        },
        name: 'Wooden Door',
        description: 'A locked structural door',
        portrait: null,
        tokenSize: { width: 1, height: 1 },
        tokens: [createMockMediaResource('door-topdown')],
        statBlocks: {},
        tags: [],
        ownerId: 'mock-owner',
        isPublished: true,
        isPublic: true,
      },
      {
        id: 'mock-asset-10',
        classification: {
          kind: AssetKind.Object,
          category: 'Obstacle',
          type: 'Boulder',
          subtype: null,
        },
        name: 'Large Boulder',
        description: 'Large square obstacle (3x3)',
        portrait: null,
        tokenSize: { width: 3, height: 3 },
        tokens: [createMockMediaResource('boulder-topdown')],
        statBlocks: {},
        tags: [],
        ownerId: 'mock-owner',
        isPublished: true,
        isPublic: true,
      },
      {
        id: 'mock-asset-11',
        classification: {
          kind: AssetKind.Object,
          category: 'Test',
          type: 'Invalid',
          subtype: null,
        },
        name: 'Invalid Asset',
        description: 'Edge case: no images at all (should handle gracefully)',
        portrait: null,
        tokenSize: { width: 1, height: 1 },
        tokens: [],
        statBlocks: {},
        tags: [],
        ownerId: 'mock-owner',
        isPublished: false,
        isPublic: false,
      },
      {
        id: 'mock-asset-12',
        classification: {
          kind: AssetKind.Object,
          category: 'Test',
          type: 'Fallback',
          subtype: null,
        },
        name: 'Fallback Test Asset',
        description: 'Edge case: only miniature and photo (tests fallback order)',
        portrait: null,
        tokenSize: { width: 1, height: 1 },
        tokens: [
          createMockMediaResource('fallback-miniature'),
          createMockMediaResource('fallback-photo'),
        ],
        statBlocks: {},
        tags: [],
        ownerId: 'mock-owner',
        isPublished: false,
        isPublic: false,
      },
    ];

    return assets;
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
      timestamp: new Date().toISOString(),
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
export const shouldUseMockApi = (error?: unknown): boolean => {
  // Use mock API if:
  // 1. In standalone development mode
  // 2. Network error occurred (likely backend not running)
  // 3. CORS error occurred
  if (import.meta.env.VITE_STANDALONE === 'true') {
    return true;
  }

  if (error) {
    const err = error as { code?: string; message?: string };
    const isNetworkError =
      err.code === 'NETWORK_ERROR' ||
      err.message?.includes('fetch') ||
      err.message?.includes('network') ||
      err.message?.includes('CORS');

    if (isNetworkError) {
      devUtils.warn('Network error detected, falling back to mock API', err.message);
      return true;
    }
  }

  return false;
};
