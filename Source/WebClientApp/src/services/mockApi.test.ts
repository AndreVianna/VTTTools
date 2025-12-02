import { beforeEach, describe, expect, it, vi } from 'vitest';
import { AssetKind, ResourceType } from '@/types/domain';
import { mockApi } from './mockApi';

describe('MockApiService', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  describe('mockGetAssets', () => {
    it('should return assets with new structure', async () => {
      const assets = await mockApi.mockGetAssets();

      expect(assets).toBeDefined();
      expect(assets.length).toBeGreaterThan(0);

      const firstAsset = assets[0];
      expect(firstAsset).toBeDefined();
      if (!firstAsset) return;

      expect(firstAsset).toHaveProperty('id');
      expect(firstAsset).toHaveProperty('classification');
      expect(firstAsset).toHaveProperty('name');
      expect(firstAsset).toHaveProperty('description');
      expect(firstAsset).toHaveProperty('portrait');
      expect(firstAsset).toHaveProperty('tokenSize');
      expect(firstAsset).toHaveProperty('tokens');
      expect(firstAsset).toHaveProperty('statBlocks');
      expect(firstAsset).toHaveProperty('ownerId');
      expect(firstAsset).toHaveProperty('isPublished');
      expect(firstAsset).toHaveProperty('isPublic');

      expect(firstAsset.classification).toHaveProperty('kind');
      expect(firstAsset.classification).toHaveProperty('category');
      expect(firstAsset.classification).toHaveProperty('type');
      expect(firstAsset.classification).toHaveProperty('subtype');
    });

    it('should include assets with token images', async () => {
      const assets = await mockApi.mockGetAssets();
      const assetsWithTokens = assets.filter((a) => a.tokens.length > 0);

      expect(assetsWithTokens.length).toBeGreaterThan(0);

      assetsWithTokens.forEach((asset) => {
        expect(Array.isArray(asset.tokens)).toBe(true);
        asset.tokens.forEach((token) => {
          expect(token).toHaveProperty('id');
          expect(token).toHaveProperty('type');
          expect(token).toHaveProperty('path');
          expect(token).toHaveProperty('contentType');
          expect(token).toHaveProperty('fileName');
          expect(token).toHaveProperty('fileLength');
          expect(token).toHaveProperty('size');
          expect(token.type).toBe(ResourceType.Image);
        });
      });
    });

    it('should include assets with portraits', async () => {
      const assets = await mockApi.mockGetAssets();
      const assetsWithPortrait = assets.filter((a) => a.portrait !== null);

      expect(assetsWithPortrait.length).toBeGreaterThan(0);

      assetsWithPortrait.forEach((asset) => {
        expect(asset.portrait).toHaveProperty('id');
        expect(asset.portrait).toHaveProperty('type');
        expect(asset.portrait).toHaveProperty('path');
        expect(asset.portrait).toHaveProperty('contentType');
        expect(asset.portrait).toHaveProperty('fileName');
        expect(asset.portrait?.type).toBe(ResourceType.Image);
      });
    });

    it('should include assets without portraits', async () => {
      const assets = await mockApi.mockGetAssets();
      const assetsWithoutPortrait = assets.filter((a) => a.portrait === null);

      expect(assetsWithoutPortrait.length).toBeGreaterThan(0);
    });

    it('should have tokenSize property', async () => {
      const assets = await mockApi.mockGetAssets();

      assets.forEach((asset) => {
        expect(asset.tokenSize).toBeDefined();
        expect(asset.tokenSize).toHaveProperty('width');
        expect(asset.tokenSize).toHaveProperty('height');
        expect(typeof asset.tokenSize.width).toBe('number');
        expect(typeof asset.tokenSize.height).toBe('number');
      });
    });

    it('should include creature assets', async () => {
      const assets = await mockApi.mockGetAssets();
      const creatures = assets.filter((a) => a.classification.kind === AssetKind.Creature);

      expect(creatures.length).toBeGreaterThan(0);

      creatures.forEach((creature) => {
        expect(creature.classification.kind).toBe(AssetKind.Creature);
        expect(creature.tokenSize).toBeDefined();
      });
    });

    it('should include object assets', async () => {
      const assets = await mockApi.mockGetAssets();
      const objects = assets.filter((a) => a.classification.kind === AssetKind.Object);

      expect(objects.length).toBeGreaterThan(0);

      objects.forEach((obj) => {
        expect(obj.classification.kind).toBe(AssetKind.Object);
        expect(obj.tokenSize).toBeDefined();
      });
    });

    it('should include diverse asset sizes', async () => {
      const assets = await mockApi.mockGetAssets();

      const sizes = assets.map((a) => `${a.tokenSize.width}x${a.tokenSize.height}`);
      const uniqueSizes = new Set(sizes);

      expect(uniqueSizes.size).toBeGreaterThan(2);
      expect(sizes).toContain('1x1');
      expect(sizes.some((s) => s !== '1x1')).toBe(true);
    });

    it('should include edge case: asset with no images', async () => {
      const assets = await mockApi.mockGetAssets();
      const noImages = assets.filter(
        (a) => a.tokens.length === 0 && a.portrait === null
      );

      expect(noImages.length).toBeGreaterThan(0);

      noImages.forEach((asset) => {
        expect(asset.tokens.length).toBe(0);
        expect(asset.portrait).toBeNull();
      });
    });

    it('should include edge case: asset with multiple token images', async () => {
      const assets = await mockApi.mockGetAssets();
      const multipleTokens = assets.filter((a) => a.tokens.length > 1);

      expect(multipleTokens.length).toBeGreaterThan(0);

      multipleTokens.forEach((asset) => {
        expect(asset.tokens.length).toBeGreaterThan(1);
      });
    });

    it('should have realistic media resource data', async () => {
      const assets = await mockApi.mockGetAssets();
      const assetsWithTokens = assets.filter((a) => a.tokens.length > 0);

      assetsWithTokens.forEach((asset) => {
        const token = asset.tokens[0];
        expect(token).toBeDefined();
        if (!token) return;

        expect(token.contentType).toBe('image/png');
        expect(token.fileName).toMatch(/\.png$/);
        expect(token.fileLength).toBeGreaterThan(0);
        expect(token.size).toBeDefined();
        expect(token.size?.width).toBe(256);
        expect(token.size?.height).toBe(256);
      });
    });

    it('should return exactly 12 mock assets', async () => {
      const assets = await mockApi.mockGetAssets();
      expect(assets.length).toBe(12);
    });
  });

  describe('mockGetAdventures', () => {
    it('should return adventures with new schema', async () => {
      const adventures = await mockApi.mockGetAdventures();

      expect(adventures).toBeDefined();
      expect(adventures.length).toBeGreaterThan(0);

      const firstAdventure = adventures[0];
      expect(firstAdventure).toHaveProperty('type');
      expect(firstAdventure).toHaveProperty('ownerId');
      expect(firstAdventure).toHaveProperty('isPublished');
    });
  });

  describe('mockGetCurrentUser', () => {
    it('should return valid user object', async () => {
      const user = await mockApi.mockGetCurrentUser();

      expect(user).toBeDefined();
      expect(user).toHaveProperty('id');
      expect(user).toHaveProperty('email');
      expect(user).toHaveProperty('name');
    });
  });
});
