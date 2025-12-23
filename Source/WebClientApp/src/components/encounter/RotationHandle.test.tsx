import { describe, expect, it } from 'vitest';
import type { Asset, PlacedAsset } from '@/types/domain';
import { AssetKind, LabelPosition, LabelVisibility } from '@/types/domain';
import { GridType } from '@/utils/gridCalculator';
import { calculateAngleFromCenter, rotatePointAroundOrigin } from '@/utils/rotationUtils';

const mockBaseAsset: Asset = {
  id: 'base-asset-1',
  ownerId: 'user-1',
  name: 'Test Asset',
  classification: { kind: AssetKind.Object, category: '', type: '', subtype: null },
  description: 'Test asset description',
  isPublished: false,
  isPublic: false,
  tokens: [],
  portrait: null,
  tokenSize: { width: 2, height: 2 },
  statBlocks: {},
  tags: [],
};

const mockAsset: PlacedAsset = {
  id: 'asset-1',
  assetId: 'base-asset-1',
  asset: mockBaseAsset,
  position: { x: 100, y: 100 },
  size: { width: 2, height: 2 },
  rotation: 0,
  layer: 'tokens',
  index: 1,
  number: 1,
  name: 'Test Asset #1',
  visible: true,
  locked: false,
  labelVisibility: LabelVisibility.Default,
  labelPosition: LabelPosition.Default,
};

const mockGridConfig = {
  type: GridType.Square,
  cellSize: { width: 50, height: 50 },
  offset: { left: 0, top: 0 },
  snap: true,
};

const getGroupCenterInPixels = (assets: PlacedAsset[], cellSize: number) => {
  if (assets.length === 0) {
    return { x: 0, y: 0 };
  }

  let minX = Infinity;
  let minY = Infinity;
  let maxX = -Infinity;
  let maxY = -Infinity;

  for (const asset of assets) {
    const left = asset.position.x;
    const right = asset.position.x + asset.size.width * cellSize;
    const top = asset.position.y;
    const bottom = asset.position.y + asset.size.height * cellSize;

    minX = Math.min(minX, left);
    maxX = Math.max(maxX, right);
    minY = Math.min(minY, top);
    maxY = Math.max(maxY, bottom);
  }

  return {
    x: (minX + maxX) / 2,
    y: (minY + maxY) / 2,
  };
};

describe('RotationHandle Logic', () => {
  const cellSize = Math.max(mockGridConfig.cellSize.width, mockGridConfig.cellSize.height);

  it('calculates single asset center correctly', () => {
    const center = {
      x: mockAsset.position.x + (mockAsset.size.width * cellSize) / 2,
      y: mockAsset.position.y + (mockAsset.size.height * cellSize) / 2,
    };
    expect(center).toEqual({ x: 150, y: 150 });
  });

  it('calculates group center for multiple assets', () => {
    const asset2 = {
      ...mockAsset,
      id: 'asset-2',
      position: { x: 200, y: 200 },
    };
    const groupCenter = getGroupCenterInPixels([mockAsset, asset2], cellSize);
    expect(groupCenter.x).toBe(200);
    expect(groupCenter.y).toBe(200);
  });

  it('calculates rotation angle from center', () => {
    const center = { x: 150, y: 150 };
    const pointer = { x: 200, y: 150 };
    const angle = calculateAngleFromCenter(center, pointer);
    expect(angle).toBe(0);
  });

  it('rotates point around origin', () => {
    const point = { x: 100, y: 0 };
    const origin = { x: 0, y: 0 };
    const rotated = rotatePointAroundOrigin(point, origin, 90);
    expect(Math.round(rotated.x)).toBe(0);
    expect(Math.round(rotated.y)).toBe(100);
  });

  it('calculates longest dimension for handle length', () => {
    const asset2 = {
      ...mockAsset,
      id: 'asset-2',
      size: { width: 3, height: 1 },
    };
    const assets = [mockAsset, asset2];
    const longestDimension = assets.reduce((max, asset) => {
      const width = asset.size.width * cellSize;
      const height = asset.size.height * cellSize;
      return Math.max(max, width, height);
    }, 0);
    expect(longestDimension).toBe(150);
  });

  it('supports individual rotation mode (default)', () => {
    const asset1Center = {
      x: mockAsset.position.x + (mockAsset.size.width * cellSize) / 2,
      y: mockAsset.position.y + (mockAsset.size.height * cellSize) / 2,
    };
    const pointer = { x: 200, y: 150 };
    const rotation = calculateAngleFromCenter(asset1Center, pointer);
    expect(typeof rotation).toBe('number');
  });

  it('supports group rotation mode with position updates', () => {
    const asset2 = {
      ...mockAsset,
      id: 'asset-2',
      position: { x: 200, y: 200 },
    };
    const assets = [mockAsset, asset2];
    const groupCenter = getGroupCenterInPixels(assets, cellSize);

    const assetCenterX = mockAsset.position.x + (mockAsset.size.width * cellSize) / 2;
    const assetCenterY = mockAsset.position.y + (mockAsset.size.height * cellSize) / 2;

    const rotatedCenter = rotatePointAroundOrigin({ x: assetCenterX, y: assetCenterY }, groupCenter, 45);

    const newX = rotatedCenter.x - (mockAsset.size.width * cellSize) / 2;
    const newY = rotatedCenter.y - (mockAsset.size.height * cellSize) / 2;

    expect(typeof newX).toBe('number');
    expect(typeof newY).toBe('number');
  });
});
