import { beforeEach, describe, expect, it, vi } from 'vitest';
import type { MonsterAsset, ObjectAsset } from '@/types/domain';
import { AssetKind, ResourceType } from '@/types/domain';
import { mockApi } from './mockApi';

describe('MockApiService', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  describe('mockGetAssets', () => {
    it('should return assets with new 4-image structure', async () => {
      const assets = await mockApi.mockGetAssets();

      expect(assets).toBeDefined();
      expect(assets.length).toBeGreaterThan(0);

      const firstAsset = assets[0];
      expect(firstAsset).toHaveProperty('id');
      expect(firstAsset).toHaveProperty('topDown');
      expect(firstAsset).toHaveProperty('portrait');
      expect(firstAsset).toHaveProperty('miniature');
      expect(firstAsset).toHaveProperty('photo');
      expect(firstAsset).toHaveProperty('size');

      expect(firstAsset).not.toHaveProperty('tokens');
      expect(firstAsset).not.toHaveProperty('resources');
      expect(firstAsset).not.toHaveProperty('objectProps');
      expect(firstAsset).not.toHaveProperty('monsterProps');
    });

    it('should include assets with topDown images', async () => {
      const assets = await mockApi.mockGetAssets();
      const assetsWithTopDown = assets.filter((a) => a.topDown !== undefined);

      expect(assetsWithTopDown.length).toBeGreaterThan(0);

      assetsWithTopDown.forEach((asset) => {
        expect(asset.topDown).toHaveProperty('id');
        expect(asset.topDown).toHaveProperty('type');
        expect(asset.topDown).toHaveProperty('path');
        expect(asset.topDown).toHaveProperty('metadata');
        expect(asset.topDown?.type).toBe(ResourceType.Image);
      });
    });

    it('should include assets with portraits', async () => {
      const assets = await mockApi.mockGetAssets();
      const assetsWithPortrait = assets.filter((a) => a.portrait !== undefined);

      expect(assetsWithPortrait.length).toBeGreaterThan(0);

      assetsWithPortrait.forEach((asset) => {
        expect(asset.portrait).toHaveProperty('id');
        expect(asset.portrait).toHaveProperty('type');
        expect(asset.portrait).toHaveProperty('path');
        expect(asset.portrait).toHaveProperty('metadata');
        expect(asset.portrait?.type).toBe(ResourceType.Image);
      });
    });

    it('should include assets without portraits', async () => {
      const assets = await mockApi.mockGetAssets();
      const assetsWithoutPortrait = assets.filter((a) => a.portrait === undefined);

      expect(assetsWithoutPortrait.length).toBeGreaterThan(0);
    });

    it('should include assets with miniature images', async () => {
      const assets = await mockApi.mockGetAssets();
      const assetsWithMiniature = assets.filter((a) => a.miniature !== undefined);

      expect(assetsWithMiniature.length).toBeGreaterThan(0);

      assetsWithMiniature.forEach((asset) => {
        expect(asset.miniature).toHaveProperty('id');
        expect(asset.miniature).toHaveProperty('type');
        expect(asset.miniature).toHaveProperty('path');
        expect(asset.miniature?.type).toBe(ResourceType.Image);
      });
    });

    it('should include assets with photo images', async () => {
      const assets = await mockApi.mockGetAssets();
      const assetsWithPhoto = assets.filter((a) => a.photo !== undefined);

      expect(assetsWithPhoto.length).toBeGreaterThan(0);

      assetsWithPhoto.forEach((asset) => {
        expect(asset.photo).toHaveProperty('id');
        expect(asset.photo).toHaveProperty('type');
        expect(asset.photo).toHaveProperty('path');
        expect(asset.photo?.type).toBe(ResourceType.Image);
      });
    });

    it('should have size at root level', async () => {
      const assets = await mockApi.mockGetAssets();

      assets.forEach((asset) => {
        expect(asset.size).toBeDefined();
        expect(asset.size).toHaveProperty('width');
        expect(asset.size).toHaveProperty('height');
        expect(asset.size).toHaveProperty('isSquare');
        expect(typeof asset.size.width).toBe('number');
        expect(typeof asset.size.height).toBe('number');
        expect(typeof asset.size.isSquare).toBe('boolean');
      });
    });

    it('should include monster assets with MonsterData', async () => {
      const assets = await mockApi.mockGetAssets();
      const monsters = assets.filter((a) => a.kind === AssetKind.Monster) as MonsterAsset[];

      expect(monsters.length).toBeGreaterThan(0);

      monsters.forEach((monster) => {
        expect(monster.kind).toBe(AssetKind.Monster);
        expect(monster.size).toBeDefined();
      });
    });

    it('should include object assets with ObjectData', async () => {
      const assets = await mockApi.mockGetAssets();
      const objects = assets.filter((a) => a.kind === AssetKind.Object) as ObjectAsset[];

      expect(objects.length).toBeGreaterThan(0);

      objects.forEach((obj) => {
        expect(obj).toHaveProperty('isMovable');
        expect(obj).toHaveProperty('isOpaque');
        expect(typeof obj.isMovable).toBe('boolean');
        expect(typeof obj.isOpaque).toBe('boolean');
        expect(obj.size).toBeDefined();
      });
    });

    it('should include diverse asset sizes', async () => {
      const assets = await mockApi.mockGetAssets();

      const sizes = assets.map((a) => `${a.size.width}x${a.size.height}`);
      const uniqueSizes = new Set(sizes);

      expect(uniqueSizes.size).toBeGreaterThan(2);
      expect(sizes).toContain('1x1');
      expect(sizes.some((s) => s !== '1x1')).toBe(true);
    });

    it('should include edge case: asset with no images', async () => {
      const assets = await mockApi.mockGetAssets();
      const noImages = assets.filter(
        (a) => !a.topDown && !a.portrait && !a.miniature && !a.photo
      );

      expect(noImages.length).toBeGreaterThan(0);

      noImages.forEach((asset) => {
        expect(asset.topDown).toBeUndefined();
        expect(asset.portrait).toBeUndefined();
        expect(asset.miniature).toBeUndefined();
        expect(asset.photo).toBeUndefined();
      });
    });

    it('should include edge case: asset with all 4 image types', async () => {
      const assets = await mockApi.mockGetAssets();
      const allImages = assets.filter(
        (a) => a.topDown && a.portrait && a.miniature && a.photo
      );

      expect(allImages.length).toBeGreaterThan(0);

      allImages.forEach((asset) => {
        expect(asset.topDown).toBeDefined();
        expect(asset.portrait).toBeDefined();
        expect(asset.miniature).toBeDefined();
        expect(asset.photo).toBeDefined();
      });
    });

    it('should include square and non-square assets', async () => {
      const assets = await mockApi.mockGetAssets();
      const square = assets.filter((a) => a.size.isSquare);
      const nonSquare = assets.filter((a) => !a.size.isSquare);

      expect(square.length).toBeGreaterThan(0);
      expect(nonSquare.length).toBeGreaterThan(0);
    });

    it('should have realistic media resource metadata', async () => {
      const assets = await mockApi.mockGetAssets();
      const assetsWithTopDown = assets.filter((a) => a.topDown !== undefined);

      assetsWithTopDown.forEach((asset) => {
        const topDown = asset.topDown;
        expect(topDown).toBeDefined();
        expect(topDown?.metadata.contentType).toBe('image/png');
        expect(topDown?.metadata.fileName).toMatch(/\.png$/);
        expect(topDown?.metadata.fileLength).toBeGreaterThan(0);
        expect(topDown?.metadata.imageSize).toBeDefined();
        expect(topDown?.metadata.imageSize?.width).toBe(256);
        expect(topDown?.metadata.imageSize?.height).toBe(256);
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
