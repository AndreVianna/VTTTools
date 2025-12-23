import { describe, expect, it } from 'vitest';
import { AssetKind, LabelPosition, LabelVisibility, type PlacedAsset } from '../types/domain';
import { getEffectiveLabelPosition, getEffectiveLabelVisibility } from './displayHelpers';

describe('displayHelpers', () => {
  describe('getEffectiveLabelVisibility', () => {
    it('returns asset override when not Default', () => {
      const asset: PlacedAsset = {
        id: '1',
        assetId: '1',
        index: 1,
        number: 1,
        name: 'Object',
        visible: true,
        locked: false,
        labelPosition: LabelPosition.Bottom,
        position: { x: 0, y: 0 },
        size: { width: 1, height: 1 },
        rotation: 0,
        layer: 'objects',
        labelVisibility: LabelVisibility.Never,
        asset: {
          id: '1',
          classification: {
            kind: AssetKind.Creature,
            category: 'Monster',
            type: 'Humanoid',
            subtype: null,
          },
          name: 'Object',
          description: 'Object',
          portrait: null,
          tokenSize: { width: 1, height: 1 },
          tokens: [],
          statBlocks: {},
          tags: [],
          ownerId: '1',
          isPublished: true,
          isPublic: true,
        },
      };

      expect(getEffectiveLabelVisibility(asset)).toBe(LabelVisibility.Never);
    });

    it('returns encounter default for Monsters when asset is Default', () => {
      const asset: PlacedAsset = {
        id: '1',
        assetId: '1',
        index: 1,
        number: 1,
        name: 'Object',
        visible: true,
        locked: false,
        labelPosition: LabelPosition.Bottom,
        position: { x: 0, y: 0 },
        size: { width: 1, height: 1 },
        rotation: 0,
        layer: 'objects',
        labelVisibility: LabelVisibility.Default,
        asset: {
          id: '1',
          classification: {
            kind: AssetKind.Creature,
            category: 'Monster',
            type: 'Humanoid',
            subtype: null,
          },
          name: 'Object',
          description: 'Object',
          portrait: null,
          tokenSize: { width: 1, height: 1 },
          tokens: [],
          statBlocks: {},
          tags: [],
          ownerId: '1',
          isPublished: true,
          isPublic: true,
        },
      };

      expect(getEffectiveLabelVisibility(asset)).toBe(LabelVisibility.Always);
    });

    it('returns OnHover for Objects when asset is Default (ignores encounter default)', () => {
      const asset: PlacedAsset = {
        id: '1',
        assetId: '1',
        index: 1,
        number: 1,
        name: 'Object',
        visible: true,
        locked: false,
        labelPosition: LabelPosition.Bottom,
        position: { x: 0, y: 0 },
        size: { width: 1, height: 1 },
        rotation: 0,
        layer: 'objects',
        labelVisibility: LabelVisibility.Default,
        asset: {
          id: '1',
          classification: {
            kind: AssetKind.Object,
            category: 'Environment',
            type: 'Furniture',
            subtype: null,
          },
          name: 'Object',
          description: 'Object',
          portrait: null,
          tokenSize: { width: 1, height: 1 },
          tokens: [],
          statBlocks: {},
          tags: [],
          ownerId: '1',
          isPublished: true,
          isPublic: true,
        },
      };

      expect(getEffectiveLabelVisibility(asset)).toBe(LabelVisibility.OnHover);
    });

    it('returns asset override for Objects when not Default', () => {
      const asset: PlacedAsset = {
        id: '1',
        assetId: '1',
        index: 1,
        number: 1,
        name: 'Object',
        visible: true,
        locked: false,
        labelPosition: LabelPosition.Bottom,
        position: { x: 0, y: 0 },
        size: { width: 1, height: 1 },
        rotation: 0,
        layer: 'objects',
        labelVisibility: LabelVisibility.Always,
        asset: {
          id: '1',
          classification: {
            kind: AssetKind.Object,
            category: 'Environment',
            type: 'Furniture',
            subtype: null,
          },
          name: 'Object',
          description: 'Object',
          portrait: null,
          tokenSize: { width: 1, height: 1 },
          tokens: [],
          statBlocks: {},
          tags: [],
          ownerId: '1',
          isPublished: true,
          isPublic: true,
        },
      };

      expect(getEffectiveLabelVisibility(asset)).toBe(LabelVisibility.Always);
    });
  });

  describe('getEffectiveLabelPosition', () => {
    it('returns asset override when not Default', () => {
      const asset: PlacedAsset = {
        id: '1',
        assetId: '1',
        index: 1,
        number: 1,
        name: 'Object',
        visible: true,
        locked: false,
        labelPosition: LabelPosition.Top,
        position: { x: 0, y: 0 },
        size: { width: 1, height: 1 },
        rotation: 0,
        layer: 'objects',
        labelVisibility: LabelVisibility.Always,
        asset: {
          id: '1',
          classification: {
            kind: AssetKind.Creature,
            category: 'Monster',
            type: 'Humanoid',
            subtype: null,
          },
          name: 'Object',
          description: 'Object',
          portrait: null,
          tokenSize: { width: 1, height: 1 },
          tokens: [],
          statBlocks: {},
          tags: [],
          ownerId: '1',
          isPublished: true,
          isPublic: true,
        },
      };

      expect(getEffectiveLabelPosition(asset)).toBe(LabelPosition.Top);
    });

    it('returns encounter default when asset is Default', () => {
      const asset: PlacedAsset = {
        id: '1',
        assetId: '1',
        index: 1,
        number: 1,
        name: 'Object',
        visible: true,
        locked: false,
        labelPosition: LabelPosition.Default,
        position: { x: 0, y: 0 },
        size: { width: 1, height: 1 },
        rotation: 0,
        layer: 'objects',
        labelVisibility: LabelVisibility.Always,
        asset: {
          id: '1',
          classification: {
            kind: AssetKind.Creature,
            category: 'Monster',
            type: 'Humanoid',
            subtype: null,
          },
          name: 'Object',
          description: 'Object',
          portrait: null,
          tokenSize: { width: 1, height: 1 },
          tokens: [],
          statBlocks: {},
          tags: [],
          ownerId: '1',
          isPublished: true,
          isPublic: true,
        },
      };

      expect(getEffectiveLabelPosition(asset)).toBe(LabelPosition.Bottom);
    });
  });
});
