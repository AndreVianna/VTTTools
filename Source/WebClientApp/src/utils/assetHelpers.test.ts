import { describe, expect, it } from 'vitest';
import { AssetKind, ResourceType } from '@/types/domain';
import type { Asset, MediaResource } from '@/types/domain';
import { getDefaultAssetImage, getResourceUrl } from './assetHelpers';

const createMockResource = (id: string): MediaResource => ({
  id,
  description: null,
  features: {},
  type: ResourceType.Image,
  path: `/media/${id}`,
  contentType: 'image/png',
  fileName: `${id}.png`,
  fileLength: 1024,
  size: { width: 100, height: 100 },
  duration: '',
  ownerId: 'owner-1',
  isPublished: false,
  isPublic: false,
});

const createMockAsset = (overrides?: Partial<Asset>): Asset => ({
  id: 'asset-1',
  ownerId: 'owner-1',
  classification: { kind: AssetKind.Character, category: '', type: '', subtype: null },
  name: 'Test Asset',
  description: 'Test description',
  isPublished: false,
  isPublic: false,
  tokenSize: { width: 1, height: 1 },
  tokens: [],
  portrait: null,
  statBlocks: {},
  ...overrides,
});

describe('assetHelpers', () => {
  describe('getDefaultAssetImage', () => {
    it('should return topDown when available', () => {
      const asset = createMockAsset({
        tokens: [createMockResource('topdown-1')],
        portrait: createMockResource('portrait-1'),
      });

      const result = getDefaultAssetImage(asset);

      expect(result?.id).toBe('topdown-1');
    });

    it('should fallback to portrait when tokens are missing', () => {
      const asset = createMockAsset({
        tokens: [],
        portrait: createMockResource('portrait-1'),
      });

      const result = getDefaultAssetImage(asset);

      expect(result?.id).toBe('portrait-1');
    });

    it('should return portrait when available', () => {
      const asset = createMockAsset({
        tokens: [],
        portrait: createMockResource('portrait-1'),
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
        tokens: [createMockResource('topdown-obj')],
      });
      expect(getDefaultAssetImage(objectAsset)?.id).toBe('topdown-obj');

      const creatureAsset = createMockAsset({
        classification: { kind: AssetKind.Creature, category: '', type: '', subtype: null },
        tokens: [createMockResource('topdown-mon')],
      });
      expect(getDefaultAssetImage(creatureAsset)?.id).toBe('topdown-mon');

      const characterAsset = createMockAsset({
        classification: { kind: AssetKind.Character, category: '', type: '', subtype: null },
        tokens: [createMockResource('topdown-char')],
      });
      expect(getDefaultAssetImage(characterAsset)?.id).toBe('topdown-char');
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
