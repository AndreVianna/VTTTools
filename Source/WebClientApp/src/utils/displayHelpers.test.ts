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
          ownerId: '1',
          name: 'Object',
          description: 'Object',
          isPublished: true,
          isPublic: true,
          tokens: [],
          portrait: undefined,
          size: { width: 1, height: 1, isSquare: true },
          kind: AssetKind.Creature,
        },
      };

      expect(getEffectiveLabelVisibility(asset)).toBe(LabelVisibility.Never);
    });

    it('returns encounter default for Creatures when asset is Default', () => {
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
          ownerId: '1',
          name: 'Object',
          description: 'Object',
          isPublished: true,
          isPublic: true,
          tokens: [],
          portrait: undefined,
          size: { width: 1, height: 1, isSquare: true },
          kind: AssetKind.Creature,
        },
      };

      expect(getEffectiveLabelVisibility(asset)).toBe(LabelVisibility.OnHover);
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
          ownerId: '1',
          name: 'Object',
          description: 'Object',
          isPublished: true,
          isPublic: true,
          tokens: [],
          portrait: undefined,
          size: { width: 1, height: 1, isSquare: true },
          kind: AssetKind.Object,
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
          ownerId: '1',
          name: 'Object',
          description: 'Object',
          isPublished: true,
          isPublic: true,
          tokens: [],
          portrait: undefined,
          size: { width: 1, height: 1, isSquare: true },
          kind: AssetKind.Object,
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
          ownerId: '1',
          name: 'Object',
          description: 'Object',
          isPublished: true,
          isPublic: true,
          tokens: [],
          portrait: undefined,
          size: { width: 1, height: 1, isSquare: true },
          kind: AssetKind.Creature,
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
          ownerId: '1',
          name: 'Object',
          description: 'Object',
          isPublished: true,
          isPublic: true,
          tokens: [],
          portrait: undefined,
          size: { width: 1, height: 1, isSquare: true },
          kind: AssetKind.Creature,
        },
      };

      expect(getEffectiveLabelPosition(asset)).toBe(LabelPosition.Middle);
    });
  });
});
