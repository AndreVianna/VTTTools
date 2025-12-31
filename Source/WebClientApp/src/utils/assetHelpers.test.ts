import { describe, expect, it } from 'vitest';
import { AssetKind, ResourceRole } from '@/types/domain';
import type { Asset, MediaResource } from '@/types/domain';
import { getDefaultAssetImage, getResourceUrl } from './assetHelpers';

const createMockResource = (id: string, role: ResourceRole = ResourceRole.Token): MediaResource => ({
  id,
  role,
  path: `/media/${id}`,
  contentType: 'image/png',
  fileName: `${id}.png`,
  fileSize: 1024,
  dimensions: { width: 100, height: 100 },
  duration: '',
});

const createMockAsset = (overrides?: Partial<Asset>): Asset => ({
  id: 'asset-1',
  ownerId: 'owner-1',
  classification: { kind: AssetKind.Character, category: '', type: '', subtype: null },
  name: 'Test Asset',
  description: 'Test description',
  isPublished: false,
  isPublic: false,
  size: { width: 1, height: 1 },
  tokens: [],
  thumbnail: null,
  portrait: null,
  statBlocks: {},
  tags: [],
  ...overrides,
});

describe('assetHelpers', () => {
  describe('getDefaultAssetImage', () => {
    it('should return token when available', () => {
      const asset = createMockAsset({
        tokens: [createMockResource('token-1', ResourceRole.Token)],
        portrait: createMockResource('portrait-1', ResourceRole.Portrait),
      });

      const result = getDefaultAssetImage(asset);

      expect(result?.id).toBe('token-1');
    });

    it('should fallback to portrait when tokens are missing', () => {
      const asset = createMockAsset({
        tokens: [],
        portrait: createMockResource('portrait-1', ResourceRole.Portrait),
      });

      const result = getDefaultAssetImage(asset);

      expect(result?.id).toBe('portrait-1');
    });

    it('should return portrait when available', () => {
      const asset = createMockAsset({
        tokens: [],
        portrait: createMockResource('portrait-1', ResourceRole.Portrait),
      });

      const result = getDefaultAssetImage(asset);

      expect(result?.id).toBe('portrait-1');
    });

    it('should return null when no images are available', () => {
      const asset = createMockAsset({ tokens: [], portrait: null });

      const result = getDefaultAssetImage(asset);

      expect(result).toBeNull();
    });

    it('should work with any asset kind', () => {
      const objectAsset = createMockAsset({
        classification: { kind: AssetKind.Object, category: '', type: '', subtype: null },
        tokens: [createMockResource('token-obj')],
      });
      expect(getDefaultAssetImage(objectAsset)?.id).toBe('token-obj');

      const creatureAsset = createMockAsset({
        classification: { kind: AssetKind.Creature, category: '', type: '', subtype: null },
        tokens: [createMockResource('token-mon')],
      });
      expect(getDefaultAssetImage(creatureAsset)?.id).toBe('token-mon');

      const characterAsset = createMockAsset({
        classification: { kind: AssetKind.Character, category: '', type: '', subtype: null },
        tokens: [createMockResource('token-char')],
      });
      expect(getDefaultAssetImage(characterAsset)?.id).toBe('token-char');
    });
  });

  describe('getResourceUrl', () => {
    it('should construct URL with resource ID', () => {
      const resourceId = 'resource-123';

      const result = getResourceUrl(resourceId);

      expect(result).toContain(resourceId);
      expect(result).toMatch(/\/resource-123$/);
    });

    it('should handle different resource IDs', () => {
      const resourceIds = ['abc-123', 'xyz-456', 'token-789'];

      resourceIds.forEach((id) => {
        const result = getResourceUrl(id);
        expect(result).toContain(id);
        expect(result).toMatch(new RegExp(`/${id}$`));
      });
    });
  });
});
