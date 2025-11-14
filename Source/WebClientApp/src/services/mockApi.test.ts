import { beforeEach, describe, expect, it, vi } from 'vitest';
import type { MonsterAsset, ObjectAsset } from '@/types/domain';
import { AssetKind, ResourceType } from '@/types/domain';
import { mockApi } from './mockApi';

describe('MockApiService', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  describe('mockGetAssets', () => {
    it('should return assets with new schema structure', async () => {
      const assets = await mockApi.mockGetAssets();

      expect(assets).toBeDefined();
      expect(assets.length).toBeGreaterThan(0);

      const firstAsset = assets[0];
      expect(firstAsset).toHaveProperty('id');
      expect(firstAsset).toHaveProperty('tokens');
      expect(firstAsset).toHaveProperty('portrait');
      expect(firstAsset).toHaveProperty('size');
      expect(firstAsset).toHaveProperty('properties');

      expect(firstAsset).not.toHaveProperty('resources');
      expect(firstAsset).not.toHaveProperty('objectProps');
      expect(firstAsset).not.toHaveProperty('monsterProps');
    });

    it('should include assets with tokens', async () => {
      const assets = await mockApi.mockGetAssets();
      const assetsWithTokens = assets.filter((a) => a.tokens.length > 0);

      expect(assetsWithTokens.length).toBeGreaterThan(0);

      assetsWithTokens.forEach((asset) => {
        asset.tokens.forEach((token) => {
          expect(token).toHaveProperty('tokenId');
          expect(token).toHaveProperty('isDefault');
          expect(token.isDefault).toBeTypeOf('boolean');

          if (token.token) {
            expect(token.token).toHaveProperty('id');
            expect(token.token).toHaveProperty('type');
            expect(token.token).toHaveProperty('path');
            expect(token.token).toHaveProperty('metadata');
            expect(token.token.type).toBe(ResourceType.Image);
          }
        });
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

    it('should include assets with multiple tokens', async () => {
      const assets = await mockApi.mockGetAssets();
      const multiToken = assets.filter((a) => a.tokens.length > 1);

      expect(multiToken.length).toBeGreaterThan(0);

      multiToken.forEach((asset) => {
        expect(asset.tokens.length).toBeGreaterThan(1);
      });
    });

    it('should include edge case: asset with no tokens', async () => {
      const assets = await mockApi.mockGetAssets();
      const noTokens = assets.filter((a) => a.tokens.length === 0);

      expect(noTokens.length).toBeGreaterThan(0);

      noTokens.forEach((asset) => {
        expect(asset.tokens).toEqual([]);
      });
    });

    it('should include edge case: asset with multiple default tokens', async () => {
      const assets = await mockApi.mockGetAssets();
      const multiDefault = assets.filter((a) => {
        const defaultCount = a.tokens.filter((t) => t.isDefault).length;
        return defaultCount > 1;
      });

      expect(multiDefault.length).toBeGreaterThan(0);
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
      const assetsWithTokens = assets.filter((a) => a.tokens.length > 0 && a.tokens[0]?.token);

      assetsWithTokens.forEach((asset) => {
        const token = asset.tokens[0]?.token;
        expect(token).toBeDefined();
        expect(token?.metadata.contentType).toBe('image/png');
        expect(token?.metadata.fileName).toMatch(/\.png$/);
        expect(token?.metadata.fileLength).toBeGreaterThan(0);
        expect(token?.metadata.imageSize).toBeDefined();
        expect(token?.metadata.imageSize?.width).toBe(256);
        expect(token?.metadata.imageSize?.height).toBe(256);
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
