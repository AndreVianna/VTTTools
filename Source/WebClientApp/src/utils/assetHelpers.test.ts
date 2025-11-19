import { describe, expect, it } from 'vitest';
import { AssetKind, ResourceType } from '@/types/domain';
import type { Asset, MediaResource } from '@/types/domain';
import { getDefaultAssetImage, getResourceUrl } from './assetHelpers';

const createMockResource = (id: string): MediaResource => ({
  id,
  type: ResourceType.Image,
  path: `/media/${id}`,
  metadata: {
    contentType: 'image/png',
    fileName: `${id}.png`,
    fileLength: 1024,
  },
  tags: [],
});

const createMockAsset = (overrides?: Partial<Asset>): Asset => ({
  id: 'asset-1',
  ownerId: 'owner-1',
  kind: AssetKind.Character,
  name: 'Test Asset',
  description: 'Test description',
  isPublished: false,
  isPublic: false,
  size: { width: 1, height: 1, isSquare: true },
  ...overrides,
});

describe('assetHelpers', () => {
  describe('getDefaultAssetImage', () => {
    it('should return topDown when available', () => {
      const asset = createMockAsset({
        topDown: createMockResource('topdown-1'),
        miniature: createMockResource('miniature-1'),
        photo: createMockResource('photo-1'),
      });

      const result = getDefaultAssetImage(asset);

      expect(result?.id).toBe('topdown-1');
    });

    it('should fallback to miniature when topDown is missing', () => {
      const asset = createMockAsset({
        miniature: createMockResource('miniature-1'),
        photo: createMockResource('photo-1'),
        portrait: createMockResource('portrait-1'),
      });

      const result = getDefaultAssetImage(asset);

      expect(result?.id).toBe('miniature-1');
    });

    it('should fallback to photo when topDown and miniature are missing', () => {
      const asset = createMockAsset({
        photo: createMockResource('photo-1'),
        portrait: createMockResource('portrait-1'),
      });

      const result = getDefaultAssetImage(asset);

      expect(result?.id).toBe('photo-1');
    });

    it('should fallback to portrait as last resort', () => {
      const asset = createMockAsset({
        portrait: createMockResource('portrait-1'),
      });

      const result = getDefaultAssetImage(asset);

      expect(result?.id).toBe('portrait-1');
    });

    it('should return null when no images are available', () => {
      const asset = createMockAsset({});

      const result = getDefaultAssetImage(asset);

      expect(result).toBeNull();
    });

    it('should work with any asset kind', () => {
      const objectAsset = createMockAsset({
        kind: AssetKind.Object,
        topDown: createMockResource('topdown-obj'),
      });
      expect(getDefaultAssetImage(objectAsset)?.id).toBe('topdown-obj');

      const monsterAsset = createMockAsset({
        kind: AssetKind.Monster,
        topDown: createMockResource('topdown-mon'),
      });
      expect(getDefaultAssetImage(monsterAsset)?.id).toBe('topdown-mon');

      const characterAsset = createMockAsset({
        kind: AssetKind.Character,
        topDown: createMockResource('topdown-char'),
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
