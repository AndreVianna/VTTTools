import { beforeEach, describe, expect, it } from 'vitest';
import { mockMonsterAsset, mockObjectAsset, mockMediaResource } from '@/test-utils/assetMocks';
import type { Asset, EncounterAsset, PlacedAsset } from '@/types/domain';
import { LabelPosition, LabelVisibility } from '@/types/domain';
import { dehydratePlacedAssets, hydratePlacedAssets } from './encounterMappers';

const mockMonsterAssetData: Asset = mockMonsterAsset({
  id: 'asset-1',
  ownerId: 'user-1',
  name: 'Goblin',
  description: 'A small goblin',
  isPublished: true,
  isPublic: false,
  topDown: mockMediaResource({ id: 'asset-1-topdown' }),
  portrait: undefined,
  miniature: undefined,
  photo: undefined,
  size: { width: 1, height: 1, isSquare: true },
  statBlockId: undefined,
  tokenStyle: undefined,
});

const mockObjectAssetData: Asset = mockObjectAsset({
  id: 'asset-2',
  ownerId: 'user-1',
  name: 'Treasure Chest',
  description: 'A wooden chest',
  isPublished: true,
  isPublic: false,
  topDown: mockMediaResource({ id: 'asset-2-topdown' }),
  portrait: undefined,
  miniature: undefined,
  photo: undefined,
  size: { width: 1, height: 1, isSquare: true },
  isMovable: true,
  isOpaque: false,
  triggerEffectId: undefined,
});

const createMockEncounterAsset = (overrides: Partial<EncounterAsset>): EncounterAsset => ({
  id: 'encounter-asset-1',
  encounterId: 'encounter-1',
  assetId: 'asset-1',
  index: 0,
  number: 1,
  name: 'Test Asset',
  x: 100,
  y: 100,
  width: 50,
  height: 50,
  rotation: 0,
  scaleX: 1,
  scaleY: 1,
  layer: 0,
  elevation: 0,
  visible: true,
  locked: false,
  asset: mockMonsterAssetData,
  ...overrides,
});

describe('hydratePlacedAssets', () => {
  describe('name hydration', () => {
    it('uses encounterAsset name when provided', async () => {
      const encounterAssetWithName = createMockEncounterAsset({
        name: 'Goblin #2',
        index: 1,
        number: 2,
      });

      const getAsset = async () => mockMonsterAssetData;

      const result = await hydratePlacedAssets([encounterAssetWithName], 'test-encounter-1', getAsset);

      expect(result).toHaveLength(1);
      expect(result[0]?.name).toBe('Goblin #2');
    });

    it('falls back to asset name when encounterAsset name is undefined', async () => {
      const encounterAsset = createMockEncounterAsset({ name: '' });

      const getAsset = async () => mockMonsterAssetData;

      const result = await hydratePlacedAssets([encounterAsset], 'test-encounter-1', getAsset);

      expect(result).toHaveLength(1);
      expect(result[0]?.name).toBe('Goblin');
    });

    it('falls back to asset name when encounterAsset name is null', async () => {
      const encounterAssetWithNullName = createMockEncounterAsset({
        name: '',
      });

      const getAsset = async () => mockMonsterAssetData;

      const result = await hydratePlacedAssets([encounterAssetWithNullName], 'test-encounter-1', getAsset);

      expect(result).toHaveLength(1);
      expect(result[0]?.name).toBe('Goblin');
    });

    it('falls back to asset name when encounterAsset name is empty string', async () => {
      const encounterAssetWithEmptyName = createMockEncounterAsset({
        name: '',
      });

      const getAsset = async () => mockMonsterAssetData;

      const result = await hydratePlacedAssets([encounterAssetWithEmptyName], 'test-encounter-1', getAsset);

      expect(result).toHaveLength(1);
      expect(result[0]?.name).toBe('Goblin');
    });

    it('preserves numbered monster names', async () => {
      const encounterAsset: EncounterAsset = {
        id: 'encounter-asset-1',
        encounterId: 'encounter-1',
        assetId: 'asset-1',
        index: 0,
        number: 1,
        name: 'Goblin',
        elevation: 0,
        x: 100,
        y: 100,
        width: 50,
        height: 50,
        rotation: 0,
        scaleX: 1,
        scaleY: 1,
        layer: 0,
        visible: true,
        locked: false,
        asset: mockMonsterAssetData,
      };

      const encounterAssetWithNumberedName = {
        ...encounterAsset,
        name: 'Goblin #5',
        index: 10,
        number: 5,
      };

      const getAsset = async () => mockMonsterAssetData;

      const result = await hydratePlacedAssets([encounterAssetWithNumberedName], 'test-encounter-1', getAsset);

      expect(result).toHaveLength(1);
      expect(result[0]?.name).toBe('Goblin #5');
      expect(result[0]?.number).toBe(5);
    });

    it('handles object asset names', async () => {
      const encounterAsset: EncounterAsset = {
        id: 'encounter-asset-2',
        encounterId: 'encounter-1',
        assetId: 'asset-2',
        index: 0,
        number: 1,
        name: 'Chest',
        elevation: 0,
        x: 200,
        y: 200,
        width: 75,
        height: 75,
        rotation: 0,
        scaleX: 1,
        scaleY: 1,
        layer: 0,
        visible: true,
        locked: false,
        asset: mockObjectAssetData,
      };

      const encounterAssetWithCustomName = {
        ...encounterAsset,
        name: 'Golden Chest',
      };

      const getAsset = async () => mockObjectAssetData;

      const result = await hydratePlacedAssets([encounterAssetWithCustomName], 'test-encounter-1', getAsset);

      expect(result).toHaveLength(1);
      expect(result[0]?.name).toBe('Golden Chest');
    });

    it('handles multiple assets with different naming patterns', async () => {
      const encounterAssets = [
        {
          id: 'encounter-asset-1',
          encounterId: 'encounter-1',
          assetId: 'asset-1',
          x: 100,
          y: 100,
          width: 50,
          height: 50,
          rotation: 0,
          scaleX: 1,
          scaleY: 1,
          layer: 0,
          elevation: 0,
          visible: true,
          locked: false,
          asset: mockMonsterAssetData,
          name: 'Goblin #1',
          index: 0,
          number: 1,
        },
        {
          id: 'encounter-asset-2',
          encounterId: 'encounter-1',
          assetId: 'asset-1',
          x: 150,
          y: 150,
          width: 50,
          height: 50,
          rotation: 0,
          scaleX: 1,
          scaleY: 1,
          layer: 0,
          elevation: 0,
          visible: true,
          locked: false,
          asset: mockMonsterAssetData,
          name: '',
          index: 1,
          number: 2,
        },
        {
          id: 'encounter-asset-3',
          encounterId: 'encounter-1',
          assetId: 'asset-2',
          x: 200,
          y: 200,
          width: 75,
          height: 75,
          rotation: 0,
          scaleX: 1,
          scaleY: 1,
          layer: 0,
          elevation: 0,
          visible: true,
          locked: false,
          asset: mockObjectAssetData,
          name: 'Magic Chest',
          index: 2,
          number: 1,
        },
      ];

      const getAsset = async (assetId: string) => {
        return assetId === 'asset-1' ? mockMonsterAssetData : mockObjectAssetData;
      };

      const result = await hydratePlacedAssets(encounterAssets, 'test-encounter-1', getAsset);

      expect(result).toHaveLength(3);
      expect(result[0]?.name).toBe('Goblin #1');
      expect(result[1]?.name).toBe('Goblin');
      expect(result[2]?.name).toBe('Magic Chest');
    });
  });

  describe('position and size hydration', () => {
    it('handles flat position and size properties', async () => {
      const encounterAsset: EncounterAsset = {
        id: 'encounter-asset-1',
        encounterId: 'encounter-1',
        assetId: 'asset-1',
        index: 0,
        number: 1,
        name: 'Goblin',
        elevation: 0,
        x: 100,
        y: 150,
        width: 50,
        height: 75,
        rotation: 45,
        scaleX: 1,
        scaleY: 1,
        layer: 0,
        visible: true,
        locked: false,
        asset: mockMonsterAssetData,
      };

      const getAsset = async () => mockMonsterAssetData;

      const result = await hydratePlacedAssets([encounterAsset], 'test-encounter-1', getAsset);

      expect(result).toHaveLength(1);
      expect(result[0]?.position).toEqual({ x: 100, y: 150 });
      expect(result[0]?.size).toEqual({ width: 50, height: 75 });
      expect(result[0]?.rotation).toBe(45);
    });

    it('handles nested position and size properties', async () => {
      const encounterAsset: EncounterAsset = {
        id: 'encounter-asset-1',
        encounterId: 'encounter-1',
        assetId: 'asset-1',
        index: 0,
        number: 1,
        name: 'Goblin',
        elevation: 0,
        x: 100,
        y: 100,
        width: 50,
        height: 50,
        rotation: 90,
        scaleX: 1,
        scaleY: 1,
        layer: 0,
        visible: true,
        locked: false,
        asset: mockMonsterAssetData,
      };

      const getAsset = async () => mockMonsterAssetData;

      const result = await hydratePlacedAssets([encounterAsset], 'test-encounter-1', getAsset);

      expect(result).toHaveLength(1);
      expect(result[0]?.position).toEqual({ x: 200, y: 250 });
      expect(result[0]?.size).toEqual({ width: 60, height: 80 });
      expect(result[0]?.rotation).toBe(90);
    });
  });

  describe('layer assignment', () => {
    it('assigns Monsters layer for monster assets', async () => {
      const encounterAsset: EncounterAsset = {
        id: 'encounter-asset-1',
        encounterId: 'encounter-1',
        assetId: 'asset-1',
        index: 0,
        number: 1,
        name: 'Goblin',
        elevation: 0,
        x: 100,
        y: 100,
        width: 50,
        height: 50,
        rotation: 0,
        scaleX: 1,
        scaleY: 1,
        layer: 0,
        visible: true,
        locked: false,
        asset: mockMonsterAssetData,
      };

      const getAsset = async () => mockMonsterAssetData;

      const result = await hydratePlacedAssets([encounterAsset], 'test-encounter-1', getAsset);

      expect(result).toHaveLength(1);
      expect(result[0]?.layer).toBe('monsters');
    });

    it('assigns Objects layer for non-opaque object assets', async () => {
      const encounterAsset: EncounterAsset = {
        id: 'encounter-asset-2',
        encounterId: 'encounter-1',
        assetId: 'asset-2',
        index: 0,
        number: 1,
        name: 'Chest',
        elevation: 0,
        x: 100,
        y: 100,
        width: 50,
        height: 50,
        rotation: 0,
        scaleX: 1,
        scaleY: 1,
        layer: 0,
        visible: true,
        locked: false,
        asset: mockObjectAssetData,
      };

      const getAsset = async () => mockObjectAssetData;

      const result = await hydratePlacedAssets([encounterAsset], 'test-encounter-1', getAsset);

      expect(result).toHaveLength(1);
      expect(result[0]?.layer).toBe('objects');
    });
  });

  describe('index and number properties', () => {
    it('preserves index and number from encounterAsset', async () => {
      const encounterAsset: EncounterAsset = {
        id: 'encounter-asset-1',
        encounterId: 'encounter-1',
        assetId: 'asset-1',
        index: 5,
        number: 3,
        name: 'Goblin',
        elevation: 0,
        x: 100,
        y: 100,
        width: 50,
        height: 50,
        rotation: 0,
        scaleX: 1,
        scaleY: 1,
        layer: 0,
        visible: true,
        locked: false,
        asset: mockMonsterAssetData,
      };

      const getAsset = async () => mockMonsterAssetData;

      const result = await hydratePlacedAssets([encounterAsset], 'test-encounter-1', getAsset);

      expect(result).toHaveLength(1);
      expect(result[0]?.index).toBe(5);
      expect(result[0]?.number).toBe(3);
    });

    it('uses array index as fallback for index property', async () => {
      const encounterAsset: EncounterAsset = {
        id: 'encounter-asset-1',
        encounterId: 'encounter-1',
        assetId: 'asset-1',
        index: 0,
        number: 1,
        name: 'Goblin',
        elevation: 0,
        x: 100,
        y: 100,
        width: 50,
        height: 50,
        rotation: 0,
        scaleX: 1,
        scaleY: 1,
        layer: 0,
        visible: true,
        locked: false,
        asset: mockMonsterAssetData,
      };

      const getAsset = async () => mockMonsterAssetData;

      const result = await hydratePlacedAssets([encounterAsset], 'test-encounter-1', getAsset);

      expect(result).toHaveLength(1);
      expect(result[0]?.index).toBe(0);
    });

    it('defaults number to 1 when not provided', async () => {
      const encounterAsset: EncounterAsset = {
        id: 'encounter-asset-1',
        encounterId: 'encounter-1',
        assetId: 'asset-1',
        index: 0,
        number: 1,
        name: 'Goblin',
        elevation: 0,
        x: 100,
        y: 100,
        width: 50,
        height: 50,
        rotation: 0,
        scaleX: 1,
        scaleY: 1,
        layer: 0,
        visible: true,
        locked: false,
        asset: mockMonsterAssetData,
      };

      const getAsset = async () => mockMonsterAssetData;

      const result = await hydratePlacedAssets([encounterAsset], 'test-encounter-1', getAsset);

      expect(result).toHaveLength(1);
      expect(result[0]?.number).toBe(1);
    });
  });

  describe('label settings hydration', () => {
    beforeEach(() => {
      localStorage.clear();
    });

    it('uses backend values when explicitly set for monsters', async () => {
      localStorage.setItem('vtt-monsters-label-visibility', LabelVisibility.Never);
      localStorage.setItem('vtt-monsters-label-position', LabelPosition.Top);
      const encounterAsset = createMockEncounterAsset({});

      const getAsset = async () => mockMonsterAssetData;

      const result = await hydratePlacedAssets([encounterAsset], 'test-encounter-1', getAsset);

      expect(result[0]?.labelVisibility).toBe(LabelVisibility.Never);
      expect(result[0]?.labelPosition).toBe(LabelPosition.Top);
    });

    it('uses localStorage values when backend is Default for monsters', async () => {
      localStorage.setItem('vtt-monsters-label-visibility', LabelVisibility.OnHover);
      localStorage.setItem('vtt-monsters-label-position', LabelPosition.Middle);

      const encounterAsset = createMockEncounterAsset({});

      const getAsset = async () => mockMonsterAssetData;

      const result = await hydratePlacedAssets([encounterAsset], 'test-encounter-1', getAsset);

      expect(result[0]?.labelVisibility).toBe(LabelVisibility.OnHover);
      expect(result[0]?.labelPosition).toBe(LabelPosition.Middle);
    });

    it('uses localStorage values when backend values are missing for monsters', async () => {
      localStorage.setItem('vtt-monsters-label-visibility', LabelVisibility.Never);
      localStorage.setItem('vtt-monsters-label-position', LabelPosition.Top);

      const encounterAsset = createMockEncounterAsset({});

      const getAsset = async () => mockMonsterAssetData;

      const result = await hydratePlacedAssets([encounterAsset], 'test-encounter-1', getAsset);

      expect(result[0]?.labelVisibility).toBe(LabelVisibility.Never);
      expect(result[0]?.labelPosition).toBe(LabelPosition.Top);
    });

    it('uses default values when both backend and localStorage are Default for monsters', async () => {
      localStorage.setItem('vtt-monsters-label-visibility', LabelVisibility.Default);
      localStorage.setItem('vtt-monsters-label-position', LabelPosition.Default);

      const encounterAsset = createMockEncounterAsset({});

      const getAsset = async () => mockMonsterAssetData;

      const result = await hydratePlacedAssets([encounterAsset], 'test-encounter-1', getAsset);

      expect(result[0]?.labelVisibility).toBe(LabelVisibility.Always);
      expect(result[0]?.labelPosition).toBe(LabelPosition.Bottom);
    });

    it('uses monster default values when localStorage is empty', async () => {
      const encounterAsset = createMockEncounterAsset({});

      const getAsset = async () => mockMonsterAssetData;

      const result = await hydratePlacedAssets([encounterAsset], 'test-encounter-1', getAsset);

      expect(result[0]?.labelVisibility).toBe(LabelVisibility.Always);
      expect(result[0]?.labelPosition).toBe(LabelPosition.Bottom);
    });

    it('uses backend values when explicitly set for objects', async () => {
      localStorage.setItem('vtt-objects-label-visibility', LabelVisibility.Always);
      localStorage.setItem('vtt-objects-label-position', LabelPosition.Middle);
      const encounterAssetWithObject = createMockEncounterAsset({
        assetId: 'asset-2',
      });

      const getAsset = async () => mockObjectAssetData;

      const result = await hydratePlacedAssets([encounterAssetWithObject], 'test-encounter-1', getAsset);

      expect(result[0]?.labelVisibility).toBe(LabelVisibility.Always);
      expect(result[0]?.labelPosition).toBe(LabelPosition.Middle);
    });

    it('uses localStorage values when backend is Default for objects', async () => {
      localStorage.setItem('vtt-objects-label-visibility', LabelVisibility.Always);
      localStorage.setItem('vtt-objects-label-position', LabelPosition.Top);

      const encounterAssetWithObject = createMockEncounterAsset({
        assetId: 'asset-2',
      });

      const getAsset = async () => mockObjectAssetData;

      const result = await hydratePlacedAssets([encounterAssetWithObject], 'test-encounter-1', getAsset);

      expect(result[0]?.labelVisibility).toBe(LabelVisibility.Always);
      expect(result[0]?.labelPosition).toBe(LabelPosition.Top);
    });

    it('uses object default values when localStorage is empty', async () => {
      const encounterAssetWithObject = createMockEncounterAsset({
        assetId: 'asset-2',
      });

      const getAsset = async () => mockObjectAssetData;

      const result = await hydratePlacedAssets([encounterAssetWithObject], 'test-encounter-1', getAsset);

      expect(result[0]?.labelVisibility).toBe(LabelVisibility.OnHover);
      expect(result[0]?.labelPosition).toBe(LabelPosition.Bottom);
    });

    it('applies different localStorage values for monsters vs objects', async () => {
      localStorage.setItem('vtt-monsters-label-visibility', LabelVisibility.Never);
      localStorage.setItem('vtt-monsters-label-position', LabelPosition.Top);
      localStorage.setItem('vtt-objects-label-visibility', LabelVisibility.Always);
      localStorage.setItem('vtt-objects-label-position', LabelPosition.Middle);

      const monsterAsset = createMockEncounterAsset({
        assetId: 'asset-1',
      });

      const objectAsset = createMockEncounterAsset({
        assetId: 'asset-2',
      });

      const getAsset = async (assetId: string) => {
        return assetId === 'asset-1' ? mockMonsterAssetData : mockObjectAssetData;
      };

      const result = await hydratePlacedAssets([monsterAsset, objectAsset], 'test-encounter-1', getAsset);

      expect(result[0]?.labelVisibility).toBe(LabelVisibility.Never);
      expect(result[0]?.labelPosition).toBe(LabelPosition.Top);
      expect(result[1]?.labelVisibility).toBe(LabelVisibility.Always);
      expect(result[1]?.labelPosition).toBe(LabelPosition.Middle);
    });

    it('backend values take precedence over localStorage', async () => {
      localStorage.setItem('vtt-monsters-label-visibility', LabelVisibility.Always);
      localStorage.setItem('vtt-monsters-label-position', LabelPosition.Bottom);

      const encounterAsset = createMockEncounterAsset({});

      const getAsset = async () => mockMonsterAssetData;

      const result = await hydratePlacedAssets([encounterAsset], 'test-encounter-1', getAsset);

      expect(result[0]?.labelVisibility).toBe(LabelVisibility.Always);
      expect(result[0]?.labelPosition).toBe(LabelPosition.Bottom);
    });
  });

  describe('null asset handling', () => {
    it('filters out assets that fail to load', async () => {
      const encounterAssets: EncounterAsset[] = [
        {
          id: 'encounter-asset-1',
          encounterId: 'encounter-1',
          assetId: 'asset-1',
          index: 0,
          number: 1,
          name: 'Goblin',
          elevation: 0,
          x: 100,
          y: 100,
          width: 50,
          height: 50,
          rotation: 0,
          scaleX: 1,
          scaleY: 1,
          layer: 0,
          visible: true,
          locked: false,
          asset: mockMonsterAssetData,
        },
        {
          id: 'encounter-asset-2',
          encounterId: 'encounter-1',
          assetId: 'asset-missing',
          index: 1,
          number: 2,
          name: 'Goblin',
          elevation: 0,
          x: 150,
          y: 150,
          width: 50,
          height: 50,
          rotation: 0,
          scaleX: 1,
          scaleY: 1,
          layer: 0,
          visible: true,
          locked: false,
          asset: mockMonsterAssetData,
        },
      ];

      const getAsset = async (_assetId: string): Promise<Asset> => {
        return mockMonsterAssetData;
      };

      const result = await hydratePlacedAssets(encounterAssets, 'test-encounter-1', getAsset);

      expect(result).toHaveLength(1);
      expect(result[0]?.assetId).toBe('asset-1');
    });
  });
});

describe('dehydratePlacedAssets', () => {
  it('converts PlacedAsset to EncounterAsset format', () => {
    const placedAsset: PlacedAsset = {
      id: 'encounter-asset-1',
      assetId: 'asset-1',
      asset: mockMonsterAssetData,
      position: { x: 100, y: 150 },
      size: { width: 50, height: 75 },
      rotation: 45,
      layer: 'monsters',
      index: 5,
      number: 3,
      name: 'Goblin #3',
      labelVisibility: LabelVisibility.Default,
      labelPosition: LabelPosition.Default,
      visible: true,
      locked: false,
    };

    const result = dehydratePlacedAssets([placedAsset], 'encounter-1');

    expect(result).toHaveLength(1);
    expect(result[0]).toEqual({
      id: 'encounter-asset-1',
      encounterId: 'encounter-1',
      assetId: 'asset-1',
      index: 5,
      number: 3,
      name: 'Goblin #3',
      x: 100,
      y: 150,
      width: 50,
      height: 75,
      rotation: 45,
      scaleX: 1,
      scaleY: 1,
      layer: 0,
      elevation: 0,
      visible: true,
      locked: false,
      asset: mockMonsterAssetData,
    });
  });

  it('handles multiple placed assets', () => {
    const placedAssets: PlacedAsset[] = [
      {
        id: 'encounter-asset-1',
        assetId: 'asset-1',
        asset: mockMonsterAssetData,
        position: { x: 100, y: 100 },
        size: { width: 50, height: 50 },
        rotation: 0,
        layer: 'monsters',
        index: 0,
        number: 1,
        name: 'Goblin #1',
        labelVisibility: LabelVisibility.Default,
        labelPosition: LabelPosition.Default,
        visible: true,
        locked: false,
      },
      {
        id: 'encounter-asset-2',
        assetId: 'asset-2',
        asset: mockObjectAssetData,
        position: { x: 200, y: 200 },
        size: { width: 75, height: 75 },
        rotation: 90,
        layer: 'objects',
        index: 1,
        number: 1,
        name: 'Treasure Chest',
        labelVisibility: LabelVisibility.Default,
        labelPosition: LabelPosition.Default,
        visible: true,
        locked: false,
      },
    ];

    const result = dehydratePlacedAssets(placedAssets, 'encounter-1');

    expect(result).toHaveLength(2);
    expect(result[0]?.assetId).toBe('asset-1');
    expect(result[1]?.assetId).toBe('asset-2');
  });
});
