/**
 * Test Utilities: Asset Mock Factories
 *
 * Provides factory functions to create mock Asset objects with 4-image structure
 * (Portrait, TopDown, Miniature, Photo)
 *
 * Usage:
 *   const monster = mockMonsterAsset({ name: 'Goblin' });
 *   const object = mockObjectAsset({ size: { width: 2, height: 2, isSquare: true } });
 */

import type { Asset, MediaResource } from '@/types/domain';
import { AssetKind, ResourceType } from '@/types/domain';

export const mockMediaResource = (overrides?: Partial<MediaResource>): MediaResource => ({
  id: 'resource-123',
  description: null,
  features: {},
  type: ResourceType.Image,
  path: '/media/test-image.png',
  contentType: 'image/png',
  fileName: 'test-image.png',
  fileLength: 12345,
  size: { width: 256, height: 256 },
  duration: '',
  ownerId: 'test-owner',
  isPublished: true,
  isPublic: true,
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
  tokens: [mockMediaResource({ id: 'topdown-123' })],
  statBlocks: {},
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
  tokens: [mockMediaResource({ id: 'topdown-456' })],
  statBlocks: {},
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
  tokens: [mockMediaResource({ id: 'topdown-789' })],
  statBlocks: {},
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
      fileLength: 15000,
      size: { width: 512, height: 512 },
    }),
  };
};

export const mockAssetWithAllImages = (overrides?: Partial<Asset>): Asset => {
  const asset = mockCreatureAsset(overrides);
  return {
    ...asset,
    portrait: mockMediaResource({ id: 'portrait-1', path: '/media/portrait.png' }),
    tokens: [
      mockMediaResource({ id: 'topdown-1', path: '/media/topdown.png' }),
      mockMediaResource({ id: 'miniature-1', path: '/media/miniature.png' }),
      mockMediaResource({ id: 'photo-1', path: '/media/photo.png' }),
    ],
  };
};
