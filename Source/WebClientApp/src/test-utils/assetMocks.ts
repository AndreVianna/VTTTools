/**
 * Test Utilities: Asset Mock Factories
 *
 * Provides factory functions to create mock Asset objects with new backend schema
 * (AssetToken, portrait separation, size at root, ObjectData/MonsterData)
 *
 * Usage:
 *   const token = mockAssetToken({ isDefault: true });
 *   const monster = mockMonsterAsset({ name: 'Goblin' });
 *   const object = mockObjectAsset({ size: { width: 2, height: 2, isSquare: true } });
 */

import type { Asset, AssetToken, CharacterAsset, MonsterAsset, MediaResource, ObjectAsset } from '@/types/domain';
import { AssetKind, ResourceType } from '@/types/domain';

export const mockMediaResource = (overrides?: Partial<MediaResource>): MediaResource => ({
  id: 'resource-123',
  type: ResourceType.Image,
  path: '/media/test-token.png',
  metadata: {
    contentType: 'image/png',
    fileName: 'test-token.png',
    fileLength: 12345,
    imageSize: { width: 256, height: 256 },
  },
  tags: [],
  ...overrides,
});

export const mockAssetToken = (overrides?: Partial<AssetToken>): AssetToken => ({
  isDefault: true,
  token: mockMediaResource(),
  ...overrides,
});

export const mockObjectAsset = (overrides?: Partial<ObjectAsset>): ObjectAsset => ({
  id: 'asset-123',
  ownerId: 'user-123',
  kind: AssetKind.Object,
  name: 'Test Object',
  description: 'Test object description',
  isPublished: false,
  isPublic: false,
  tokens: [mockAssetToken()],
  portrait: undefined,
  size: { width: 1, height: 1, isSquare: true },
  isMovable: true,
  isOpaque: false,
  triggerEffectId: undefined,
  ...overrides,
});

export const mockMonsterAsset = (overrides?: Partial<MonsterAsset>): MonsterAsset => ({
  id: 'asset-456',
  ownerId: 'user-123',
  kind: AssetKind.Monster,
  name: 'Test Monster',
  description: 'Test monster description',
  isPublished: false,
  isPublic: false,
  tokens: [mockAssetToken({ token: mockMediaResource({ id: 'token-456' }) })],
  portrait: undefined,
  size: { width: 1, height: 1, isSquare: true },
  statBlockId: undefined,
  tokenStyle: undefined,
  ...overrides,
});

export const mockCharacterAsset = (overrides?: Partial<CharacterAsset>): CharacterAsset => ({
  id: 'asset-789',
  ownerId: 'user-123',
  kind: AssetKind.Character,
  name: 'Test Character',
  description: 'Test character description',
  isPublished: false,
  isPublic: false,
  tokens: [mockAssetToken({ token: mockMediaResource({ id: 'token-789' }) })],
  portrait: mockMediaResource({ id: 'portrait-789' }),
  size: { width: 1, height: 1, isSquare: true },
  statBlockId: undefined,
  tokenStyle: undefined,
  ...overrides,
});

export const mockAssetWithPortrait = (overrides?: Partial<Asset>): Asset => {
  const asset = mockMonsterAsset(overrides as Partial<MonsterAsset>);
  return {
    ...asset,
    portrait: mockMediaResource({
      id: 'portrait-123',
      path: '/media/test-portrait.png',
      metadata: {
        contentType: 'image/png',
        fileName: 'test-portrait.png',
        fileLength: 15000,
        imageSize: { width: 512, height: 512 },
      },
    }),
  };
};

export const mockAssetWithMultipleTokens = (overrides?: Partial<Asset>): Asset => {
  const asset = mockMonsterAsset(overrides as Partial<MonsterAsset>);
  return {
    ...asset,
    tokens: [
      mockAssetToken({
        token: mockMediaResource({ id: 'token-1' }),
        isDefault: false,
      }),
      mockAssetToken({
        token: mockMediaResource({ id: 'token-2' }),
        isDefault: true,
      }),
      mockAssetToken({
        token: mockMediaResource({ id: 'token-3' }),
        isDefault: false,
      }),
    ],
  };
};
