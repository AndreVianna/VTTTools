/**
 * Mock API service for development mode
 * Provides fallback responses when backend services are unavailable
 */

import { devUtils, MOCK_DATA } from '@/config/development';
import type {
  Adventure,
  Asset,
  AssetToken,
  CharacterAsset,
  MonsterAsset,
  GameSession,
  LoginRequest,
  LoginResponse,
  MediaResource,
  ObjectAsset,
  RegisterRequest,
  RegisterResponse,
  User,
} from '@/types/domain';
import { AssetKind, ContentType, ResourceType, TokenShape } from '@/types/domain';

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

    const createMockMediaResource = (name: string, type: ResourceType = ResourceType.Image): MediaResource => ({
      id: crypto.randomUUID(),
      type,
      path: `/mock/${name.toLowerCase().replace(/\s+/g, '-')}.png`,
      metadata: {
        contentType: 'image/png',
        fileName: `${name.toLowerCase().replace(/\s+/g, '-')}.png`,
        fileLength: Math.floor(Math.random() * 50000) + 10000,
        imageSize: { width: 256, height: 256 },
      },
      tags: ['mock', 'development'],
    });

    const createMockToken = (name: string, isDefault: boolean = true): AssetToken => ({
      token: createMockMediaResource(`${name}-token`),
      isDefault,
    });

    const characterAssets: CharacterAsset[] = [
      {
        id: 'mock-asset-1',
        ownerId: 'mock-owner',
        kind: AssetKind.Character,
        name: 'Hero Character',
        description: 'A playable hero character with portrait',
        isPublished: true,
        isPublic: true,
        tokens: [createMockToken('hero')],
        portrait: createMockMediaResource('hero-portrait'),
        size: { width: 1, height: 1, isSquare: true },
        tokenStyle: { shape: TokenShape.Circle },
      },
      {
        id: 'mock-asset-5',
        ownerId: 'mock-owner',
        kind: AssetKind.Character,
        name: 'Portrait Only NPC',
        description: 'NPC with portrait but no token (edge case)',
        isPublished: true,
        isPublic: false,
        tokens: [],
        portrait: createMockMediaResource('npc-portrait'),
        size: { width: 1, height: 1, isSquare: true },
        tokenStyle: { shape: TokenShape.Square },
      },
    ];

    const monsterAssets: MonsterAsset[] = [
      {
        id: 'mock-asset-2',
        ownerId: 'mock-owner',
        kind: AssetKind.Monster,
        name: 'Goblin',
        description: 'A hostile goblin enemy',
        isPublished: true,
        isPublic: true,
        tokens: [createMockToken('goblin')],
        portrait: undefined,
        size: { width: 1, height: 1, isSquare: true },
        tokenStyle: { shape: TokenShape.Circle },
      },
      {
        id: 'mock-asset-3',
        ownerId: 'mock-owner',
        kind: AssetKind.Monster,
        name: 'Ogre',
        description: 'Large monster with multiple tokens',
        isPublished: true,
        isPublic: true,
        tokens: [createMockToken('ogre-default', true), createMockToken('ogre-alt', false)],
        portrait: createMockMediaResource('ogre-portrait'),
        size: { width: 2, height: 2, isSquare: true },
        tokenStyle: { shape: TokenShape.Circle },
      },
      {
        id: 'mock-asset-4',
        ownerId: 'mock-owner',
        kind: AssetKind.Monster,
        name: 'Dragon',
        description: 'Huge monster with custom size',
        isPublished: true,
        isPublic: true,
        tokens: [createMockToken('dragon')],
        portrait: createMockMediaResource('dragon-portrait'),
        size: { width: 4, height: 3, isSquare: false },
        tokenStyle: { shape: TokenShape.Circle, borderColor: '#ff0000' },
      },
    ];

    const objectAssets: ObjectAsset[] = [
      {
        id: 'mock-asset-6',
        ownerId: 'mock-owner',
        kind: AssetKind.Object,
        name: 'Wooden Crate',
        description: 'A moveable wooden crate',
        isPublished: true,
        isPublic: true,
        tokens: [createMockToken('crate')],
        portrait: undefined,
        size: { width: 1, height: 1, isSquare: true },
        isMovable: true,
        isOpaque: false,
      },
      {
        id: 'mock-asset-7',
        ownerId: 'mock-owner',
        kind: AssetKind.Object,
        name: 'Treasure Chest',
        description: 'A chest containing loot with portrait image',
        isPublished: true,
        isPublic: true,
        tokens: [createMockToken('chest')],
        portrait: createMockMediaResource('chest-portrait'),
        size: { width: 1, height: 1, isSquare: true },
        isMovable: true,
        isOpaque: false,
      },
      {
        id: 'mock-asset-8',
        ownerId: 'mock-owner',
        kind: AssetKind.Object,
        name: 'Stone Wall',
        description: 'An immovable stone wall segment',
        isPublished: true,
        isPublic: true,
        tokens: [createMockToken('wall')],
        portrait: undefined,
        size: { width: 1, height: 1, isSquare: true },
        isMovable: false,
        isOpaque: true,
      },
      {
        id: 'mock-asset-9',
        ownerId: 'mock-owner',
        kind: AssetKind.Object,
        name: 'Wooden Door',
        description: 'A locked structural door',
        isPublished: true,
        isPublic: true,
        tokens: [createMockToken('door')],
        portrait: undefined,
        size: { width: 1, height: 1, isSquare: true },
        isMovable: false,
        isOpaque: true,
      },
      {
        id: 'mock-asset-10',
        ownerId: 'mock-owner',
        kind: AssetKind.Object,
        name: 'Large Boulder',
        description: 'Large square obstacle (3x3)',
        isPublished: true,
        isPublic: true,
        tokens: [createMockToken('boulder')],
        portrait: undefined,
        size: { width: 3, height: 3, isSquare: true },
        isMovable: false,
        isOpaque: true,
      },
      {
        id: 'mock-asset-11',
        ownerId: 'mock-owner',
        kind: AssetKind.Object,
        name: 'Invalid Asset',
        description: 'Edge case: no tokens and no portrait (should handle gracefully)',
        isPublished: false,
        isPublic: false,
        tokens: [],
        portrait: undefined,
        size: { width: 1, height: 1, isSquare: true },
        isMovable: true,
        isOpaque: false,
      },
      {
        id: 'mock-asset-12',
        ownerId: 'mock-owner',
        kind: AssetKind.Object,
        name: 'Multi-Default Edge Case',
        description: 'Edge case: multiple default tokens (should handle gracefully)',
        isPublished: false,
        isPublic: false,
        tokens: [createMockToken('multi-1', true), createMockToken('multi-2', true)],
        portrait: undefined,
        size: { width: 1, height: 1, isSquare: true },
        isMovable: true,
        isOpaque: false,
      },
    ];

    return [...characterAssets, ...monsterAssets, ...objectAssets];
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
