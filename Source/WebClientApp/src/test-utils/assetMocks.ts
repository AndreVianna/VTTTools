/**
 * Test Utilities: Asset Mock Factories
 *
 * Provides factory functions to create mock Asset objects with 4-image structure
 * (Portrait, Token, Miniature, Photo)
 *
 * Usage:
 *   const monster = mockMonsterAsset({ name: 'Goblin' });
 *   const object = mockObjectAsset({ size: { width: 2, height: 2, isSquare: true } });
 */

import type { Asset, MediaResource } from '@/types/domain';
import { AssetKind, ResourceRole } from '@/types/domain';

export const mockMediaResource = (overrides?: Partial<MediaResource>): MediaResource => ({
  id: 'resource-123',
  role: ResourceRole.Token,
  path: '/media/test-image.png',
  contentType: 'image/png',
  fileName: 'test-image.png',
  fileSize: 12345,
  dimensions: { width: 256, height: 256 },
  duration: '',
  ...overrides,
});

export const mockObjectAsset = (overrides?: Partial<Asset>): Asset => ({
  id: 'asset-123',
  classification: {
    kind: AssetKind.Object,
    category: 'Container',
    type: 'Crate',
    subtype: null,
  },
  name: 'Test Object',
  description: 'Test object description',
  portrait: null,
  tokenSize: { width: 1, height: 1 },
  tokens: [mockMediaResource({ id: 'token-123' })],
  statBlocks: {},
  tags: [],
  ownerId: 'user-123',
  isPublished: false,
  isPublic: false,
  ...overrides,
});

export const mockCreatureAsset = (overrides?: Partial<Asset>): Asset => ({
  id: 'asset-456',
  classification: {
    kind: AssetKind.Creature,
    category: 'Humanoid',
    type: 'Goblinoid',
    subtype: null,
  },
  name: 'Test Creature',
  description: 'Test creature description',
  portrait: null,
  tokenSize: { width: 1, height: 1 },
  tokens: [mockMediaResource({ id: 'token-456' })],
  statBlocks: {},
  tags: [],
  ownerId: 'user-123',
  isPublished: false,
  isPublic: false,
  ...overrides,
});

export const mockMonsterAsset = mockCreatureAsset;

export const mockCharacterAsset = (overrides?: Partial<Asset>): Asset => ({
  id: 'asset-789',
  classification: {
    kind: AssetKind.Character,
    category: 'PC',
    type: 'Hero',
    subtype: null,
  },
  name: 'Test Character',
  description: 'Test character description',
  portrait: mockMediaResource({ id: 'portrait-789' }),
  tokenSize: { width: 1, height: 1 },
  tokens: [mockMediaResource({ id: 'token-789' })],
  statBlocks: {},
  tags: [],
  ownerId: 'user-123',
  isPublished: false,
  isPublic: false,
  ...overrides,
});

export const mockAssetWithPortrait = (overrides?: Partial<Asset>): Asset => {
  const asset = mockCreatureAsset(overrides);
  return {
    ...asset,
    portrait: mockMediaResource({
      id: 'portrait-123',
      path: '/media/test-portrait.png',
      contentType: 'image/png',
      fileName: 'test-portrait.png',
      fileSize: 15000,
      dimensions: { width: 512, height: 512 },
    }),
  };
};

export const mockAssetWithAllImages = (overrides?: Partial<Asset>): Asset => {
  const asset = mockCreatureAsset(overrides);
  return {
    ...asset,
    portrait: mockMediaResource({ id: 'portrait-1', path: '/media/portrait.png' }),
    tokens: [
      mockMediaResource({ id: 'token-1', path: '/media/token.png' }),
      mockMediaResource({ id: 'miniature-1', path: '/media/miniature.png' }),
      mockMediaResource({ id: 'photo-1', path: '/media/photo.png' }),
    ],
  };
};
