/**
 * AssetBuilder Unit Tests
 *
 * Tests for the new schema AssetBuilder
 * Run: npm test -- AssetBuilder.test.ts --run
 */

import { describe, expect, it, vi } from 'vitest';
import type { DatabaseHelper } from '../helpers/database.helper';
import { AssetBuilder, AssetKind, CreatureCategory } from './AssetBuilder';

describe('AssetBuilder (New Schema)', () => {
  const mockDb = {
    insertAsset: vi.fn().mockResolvedValue('test-asset-id'),
    generateGuidV7: vi.fn().mockReturnValue('test-guid'),
  } as unknown as DatabaseHelper;

  const testOwnerId = 'test-owner';

  it('should build basic object asset with new schema', async () => {
    const builder = new AssetBuilder(mockDb, testOwnerId);
    const asset = await builder.withName('Test Wall').withDefaultToken('token-123').build();

    expect(asset.name).toBe('Test Wall');
    expect(asset.kind).toBe(AssetKind.Object);
    expect(asset.tokens).toHaveLength(1);
    expect(asset.tokens[0].tokenId).toBe('token-123');
    expect(asset.tokens[0].isDefault).toBe(true);
    expect(asset.size).toEqual({ width: 1, height: 1, isSquare: true });
  });

  it('should build creature asset with portrait', async () => {
    const builder = new AssetBuilder(mockDb, testOwnerId);
    const asset = await builder
      .withName('Goblin')
      .asCreature({ category: CreatureCategory.Monster })
      .withDefaultToken('token-456')
      .withPortrait('portrait-789')
      .withSize(1, 1)
      .build();

    expect(asset.name).toBe('Goblin');
    expect(asset.kind).toBe(AssetKind.Creature);
    expect(asset.portrait).toBeDefined();
    expect(asset.portrait?.id).toBe('portrait-789');
    expect(asset.tokens[0].tokenId).toBe('token-456');
  });

  it('should handle multiple tokens with one default', async () => {
    const builder = new AssetBuilder(mockDb, testOwnerId);
    const asset = await builder
      .withName('Wizard')
      .asCharacter()
      .withToken('token-1', false)
      .withToken('token-2', false)
      .withDefaultToken('token-3')
      .build();

    expect(asset.tokens).toHaveLength(3);
    expect(asset.tokens.filter((t) => t.isDefault)).toHaveLength(1);
    expect(asset.tokens.find((t) => t.isDefault)?.tokenId).toBe('token-3');
  });

  it('should set object properties correctly', async () => {
    const builder = new AssetBuilder(mockDb, testOwnerId);
    const asset = await builder.withName('Boulder').asObject({ isMovable: false, isOpaque: true }).build();

    expect(asset.kind).toBe(AssetKind.Object);
    expect(asset.properties).toEqual({
      isMovable: false,
      isOpaque: true,
    });
  });

  it('should handle size with non-square dimensions', async () => {
    const builder = new AssetBuilder(mockDb, testOwnerId);
    const asset = await builder.withName('Long Wall').withSize(2, 1).build();

    expect(asset.size).toEqual({
      width: 2,
      height: 1,
      isSquare: false,
    });
  });

  it('should mark asset as published and public', async () => {
    const builder = new AssetBuilder(mockDb, testOwnerId);
    const asset = await builder.withName('Public Asset').published().build();

    expect(asset.isPublic).toBe(true);
    expect(asset.isPublished).toBe(true);
  });

  it('should use immovable and opaque helpers', async () => {
    const builder = new AssetBuilder(mockDb, testOwnerId);
    const asset = await builder.withName('Wall').immovable().opaque().build();

    expect(asset.kind).toBe(AssetKind.Object);
    const props = asset.properties as any;
    expect(props.isMovable).toBe(false);
    expect(props.isOpaque).toBe(true);
  });

  it('should call insertAsset with correct new schema data', async () => {
    const builder = new AssetBuilder(mockDb, testOwnerId);
    await builder.withName('Test').withDefaultToken('token-1').withPortrait('portrait-1').build();

    expect(mockDb.insertAsset).toHaveBeenCalledWith(
      expect.objectContaining({
        name: 'Test',
        tokens: expect.arrayContaining([
          expect.objectContaining({
            tokenId: 'token-1',
            isDefault: true,
          }),
        ]),
        portrait: expect.objectContaining({
          id: 'portrait-1',
        }),
        size: expect.objectContaining({
          width: 1,
          height: 1,
          isSquare: true,
        }),
      }),
    );
  });
});
