import { describe, it, expect, vi, beforeEach } from 'vitest';
import { renderHook } from '@testing-library/react';
import type { Theme } from '@mui/material/styles';
import { useEntityRenderingData } from './useEntityRenderingData';
import {
    AssetKind,
    LabelVisibility,
    LabelPosition,
    type PlacedAsset,
    type Asset,
} from '@/types/domain';
import type { GridConfig } from '@/utils/gridCalculator';

// Mock dependencies
vi.mock('@/utils/displayHelpers', () => ({
    getEffectiveLabelVisibility: vi.fn<(asset: PlacedAsset) => LabelVisibility>((asset: PlacedAsset) => {
        if (asset.labelVisibility !== LabelVisibility.Default) {
            return asset.labelVisibility;
        }
        if (asset.asset.classification.kind === AssetKind.Creature ||
            asset.asset.classification.kind === AssetKind.Character) {
            return LabelVisibility.Always;
        }
        return LabelVisibility.OnHover;
    }),
    getEffectiveLabelPosition: vi.fn<(asset: PlacedAsset) => LabelPosition>((asset: PlacedAsset) =>
        asset.labelPosition === LabelPosition.Default ? LabelPosition.Bottom : asset.labelPosition
    ),
}));

vi.mock('@/components/encounter/tokenPlacementUtils', () => ({
    getAssetSize: vi.fn<(asset: Asset) => { width: number; height: number }>((asset: Asset) => {
        if (asset.size?.width && asset.size?.height) {
            return { width: asset.size.width, height: asset.size.height };
        }
        return { width: 1, height: 1 };
    }),
    formatMonsterLabel: vi.fn<(name: string, maxWidth: number) => { displayText: string; fullText: string; isTruncated: boolean; displayWidth: number; fullWidth: number; displayHeight: number }>((name: string, maxWidth: number) => ({
        displayText: name.length > 10 ? name.slice(0, 10) + '...' : name,
        fullText: name,
        isTruncated: name.length > 10,
        displayWidth: Math.min(name.length * 7, maxWidth),
        fullWidth: name.length * 7,
        displayHeight: 14.4,
    })),
}));

vi.mock('@/types/placement', () => ({
    getPlacementBehavior: vi.fn<(kind: AssetKind, objectData?: unknown, monsterData?: unknown) => { allowOverlap: boolean }>((kind: AssetKind, objectData?: unknown, monsterData?: unknown) => {
        if (kind === AssetKind.Object && objectData) {
            return { allowOverlap: false };
        }
        if ((kind === AssetKind.Creature || kind === AssetKind.Character) && monsterData) {
            return { allowOverlap: false };
        }
        return { allowOverlap: false };
    }),
}));

// Factory functions
const createMockAsset = (overrides?: Partial<Asset>): Asset => ({
    id: 'asset-1',
    name: 'Test Asset',
    description: '',
    classification: {
        kind: AssetKind.Object,
        category: 'General',
        type: 'Prop',
        subtype: null,
    },
    size: { width: 1, height: 1 },
    thumbnail: null,
    portrait: null,
    tokens: [],
    statBlocks: {},
    tags: [],
    ownerId: 'user-1',
    isPublished: false,
    isPublic: false,
    ...overrides,
});

const createMockPlacedAsset = (overrides?: Partial<PlacedAsset>): PlacedAsset => ({
    id: 'placed-asset-1',
    assetId: 'asset-1',
    asset: createMockAsset(),
    position: { x: 100, y: 100 },
    size: { width: 50, height: 50 },
    rotation: 0,
    layer: 'layer-1',
    index: 0,
    number: 1,
    name: 'Test Asset',
    isHidden: false,
    isLocked: false,
    labelVisibility: LabelVisibility.Default,
    labelPosition: LabelPosition.Default,
    ...overrides,
});

const createMockCreature = (overrides?: Partial<PlacedAsset>): PlacedAsset => createMockPlacedAsset({
    id: 'creature-1',
    asset: createMockAsset({
        id: 'creature-asset-1',
        name: 'Goblin',
        classification: {
            kind: AssetKind.Creature,
            category: 'Monster',
            type: 'Goblinoid',
            subtype: null,
        },
    }),
    name: 'Goblin #1',
    ...overrides,
});

const createMockCharacter = (overrides?: Partial<PlacedAsset>): PlacedAsset => createMockPlacedAsset({
    id: 'character-1',
    asset: createMockAsset({
        id: 'character-asset-1',
        name: 'Fighter',
        classification: {
            kind: AssetKind.Character,
            category: 'PC',
            type: 'Warrior',
            subtype: null,
        },
    }),
    name: 'Sir Lancelot',
    ...overrides,
});

const createMockGridConfig = (overrides?: Partial<GridConfig>): GridConfig => ({
    gridType: 'square',
    cellSize: { width: 50, height: 50 },
    offset: { x: 0, y: 0 },
    ...overrides,
} as GridConfig);

const createMockTheme = (overrides?: Partial<Theme['palette']>): Theme => ({
    palette: {
        background: {
            paper: '#ffffff',
            default: '#f5f5f5',
        },
        divider: '#e0e0e0',
        text: {
            primary: '#212121',
            secondary: '#757575',
        },
        ...overrides,
    },
} as Theme);

describe('useEntityRenderingData', () => {
    beforeEach(() => {
        vi.clearAllMocks();
    });

    describe('labelColors', () => {
        it('should extract background color from theme', () => {
            const theme = createMockTheme();
            const { result } = renderHook(() =>
                useEntityRenderingData([], createMockGridConfig(), theme)
            );

            expect(result.current.labelColors.background).toBe('#ffffff');
        });

        it('should extract border color from theme divider', () => {
            const theme = createMockTheme();
            const { result } = renderHook(() =>
                useEntityRenderingData([], createMockGridConfig(), theme)
            );

            expect(result.current.labelColors.border).toBe('#e0e0e0');
        });

        it('should extract text color from theme primary text', () => {
            const theme = createMockTheme();
            const { result } = renderHook(() =>
                useEntityRenderingData([], createMockGridConfig(), theme)
            );

            expect(result.current.labelColors.text).toBe('#212121');
        });

        it('should update when theme changes', () => {
            const theme1 = createMockTheme();
            const theme2 = createMockTheme({
                background: { paper: '#1e1e1e', default: '#121212' },
                text: { primary: '#ffffff', secondary: '#bbbbbb' },
            });

            const { result, rerender } = renderHook(
                ({ theme }) => useEntityRenderingData([], createMockGridConfig(), theme),
                { initialProps: { theme: theme1 } }
            );

            expect(result.current.labelColors.background).toBe('#ffffff');

            rerender({ theme: theme2 });

            expect(result.current.labelColors.background).toBe('#1e1e1e');
        });
    });

    describe('labelVisibilityMap', () => {
        it('should return Always for Creature assets with Default visibility', () => {
            const creature = createMockCreature();
            const { result } = renderHook(() =>
                useEntityRenderingData([creature], createMockGridConfig(), createMockTheme())
            );

            expect(result.current.labelVisibilityMap.get('creature-1')).toBe(LabelVisibility.Always);
        });

        it('should return Always for Character assets with Default visibility', () => {
            const character = createMockCharacter();
            const { result } = renderHook(() =>
                useEntityRenderingData([character], createMockGridConfig(), createMockTheme())
            );

            expect(result.current.labelVisibilityMap.get('character-1')).toBe(LabelVisibility.Always);
        });

        it('should return OnHover for Object assets with Default visibility', () => {
            const object = createMockPlacedAsset();
            const { result } = renderHook(() =>
                useEntityRenderingData([object], createMockGridConfig(), createMockTheme())
            );

            expect(result.current.labelVisibilityMap.get('placed-asset-1')).toBe(LabelVisibility.OnHover);
        });

        it('should respect explicit visibility override', () => {
            const creature = createMockCreature({ labelVisibility: LabelVisibility.Never });
            const { result } = renderHook(() =>
                useEntityRenderingData([creature], createMockGridConfig(), createMockTheme())
            );

            expect(result.current.labelVisibilityMap.get('creature-1')).toBe(LabelVisibility.Never);
        });

        it('should map multiple assets correctly', () => {
            const assets = [
                createMockCreature({ id: 'creature-1' }),
                createMockCharacter({ id: 'character-1' }),
                createMockPlacedAsset({ id: 'object-1' }),
            ];
            const { result } = renderHook(() =>
                useEntityRenderingData(assets, createMockGridConfig(), createMockTheme())
            );

            expect(result.current.labelVisibilityMap.size).toBe(3);
            expect(result.current.labelVisibilityMap.get('creature-1')).toBe(LabelVisibility.Always);
            expect(result.current.labelVisibilityMap.get('character-1')).toBe(LabelVisibility.Always);
            expect(result.current.labelVisibilityMap.get('object-1')).toBe(LabelVisibility.OnHover);
        });

        it('should return empty Map for empty assets array', () => {
            const { result } = renderHook(() =>
                useEntityRenderingData([], createMockGridConfig(), createMockTheme())
            );

            expect(result.current.labelVisibilityMap.size).toBe(0);
        });
    });

    describe('labelPositionMap', () => {
        it('should return Bottom for assets with Default position', () => {
            const asset = createMockPlacedAsset({ labelPosition: LabelPosition.Default });
            const { result } = renderHook(() =>
                useEntityRenderingData([asset], createMockGridConfig(), createMockTheme())
            );

            expect(result.current.labelPositionMap.get('placed-asset-1')).toBe(LabelPosition.Bottom);
        });

        it('should respect explicit position override to Top', () => {
            const asset = createMockPlacedAsset({ labelPosition: LabelPosition.Top });
            const { result } = renderHook(() =>
                useEntityRenderingData([asset], createMockGridConfig(), createMockTheme())
            );

            expect(result.current.labelPositionMap.get('placed-asset-1')).toBe(LabelPosition.Top);
        });

        it('should respect explicit position override to Middle', () => {
            const asset = createMockPlacedAsset({ labelPosition: LabelPosition.Middle });
            const { result } = renderHook(() =>
                useEntityRenderingData([asset], createMockGridConfig(), createMockTheme())
            );

            expect(result.current.labelPositionMap.get('placed-asset-1')).toBe(LabelPosition.Middle);
        });

        it('should map multiple assets with different positions', () => {
            const assets = [
                createMockPlacedAsset({ id: 'asset-1', labelPosition: LabelPosition.Top }),
                createMockPlacedAsset({ id: 'asset-2', labelPosition: LabelPosition.Middle }),
                createMockPlacedAsset({ id: 'asset-3', labelPosition: LabelPosition.Default }),
            ];
            const { result } = renderHook(() =>
                useEntityRenderingData(assets, createMockGridConfig(), createMockTheme())
            );

            expect(result.current.labelPositionMap.get('asset-1')).toBe(LabelPosition.Top);
            expect(result.current.labelPositionMap.get('asset-2')).toBe(LabelPosition.Middle);
            expect(result.current.labelPositionMap.get('asset-3')).toBe(LabelPosition.Bottom);
        });
    });

    describe('assetRenderData - sizing', () => {
        it('should calculate pixel dimensions from grid cell size', () => {
            const asset = createMockPlacedAsset({
                asset: createMockAsset({ size: { width: 2, height: 3 } }),
            });
            const gridConfig = createMockGridConfig({ cellSize: { width: 50, height: 50 } });

            const { result } = renderHook(() =>
                useEntityRenderingData([asset], gridConfig, createMockTheme())
            );

            const renderData = result.current.assetRenderData.get('placed-asset-1');
            expect(renderData?.pixelWidth).toBe(100); // 2 * 50
            expect(renderData?.pixelHeight).toBe(150); // 3 * 50
        });

        it('should default to 1x1 size when asset has no size', () => {
            const asset = createMockPlacedAsset({
                asset: createMockAsset({ size: undefined as unknown as { width: number; height: number } }),
            });
            const gridConfig = createMockGridConfig({ cellSize: { width: 40, height: 40 } });

            const { result } = renderHook(() =>
                useEntityRenderingData([asset], gridConfig, createMockTheme())
            );

            const renderData = result.current.assetRenderData.get('placed-asset-1');
            expect(renderData?.size).toEqual({ width: 1, height: 1 });
            expect(renderData?.pixelWidth).toBe(40);
            expect(renderData?.pixelHeight).toBe(40);
        });

        it('should handle non-square grid cells', () => {
            const asset = createMockPlacedAsset({
                asset: createMockAsset({ size: { width: 1, height: 1 } }),
            });
            const gridConfig = createMockGridConfig({ cellSize: { width: 60, height: 40 } });

            const { result } = renderHook(() =>
                useEntityRenderingData([asset], gridConfig, createMockTheme())
            );

            const renderData = result.current.assetRenderData.get('placed-asset-1');
            expect(renderData?.pixelWidth).toBe(60);
            expect(renderData?.pixelHeight).toBe(40);
        });

        it('should preserve asset size information', () => {
            const asset = createMockPlacedAsset({
                asset: createMockAsset({ size: { width: 3, height: 2 } }),
            });

            const { result } = renderHook(() =>
                useEntityRenderingData([asset], createMockGridConfig(), createMockTheme())
            );

            const renderData = result.current.assetRenderData.get('placed-asset-1');
            expect(renderData?.size).toEqual({ width: 3, height: 2 });
        });

        it('should handle large asset sizes', () => {
            const asset = createMockPlacedAsset({
                asset: createMockAsset({ size: { width: 10, height: 10 } }),
            });
            const gridConfig = createMockGridConfig({ cellSize: { width: 50, height: 50 } });

            const { result } = renderHook(() =>
                useEntityRenderingData([asset], gridConfig, createMockTheme())
            );

            const renderData = result.current.assetRenderData.get('placed-asset-1');
            expect(renderData?.pixelWidth).toBe(500);
            expect(renderData?.pixelHeight).toBe(500);
        });

        it('should handle fractional asset sizes', () => {
            const asset = createMockPlacedAsset({
                asset: createMockAsset({ size: { width: 0.5, height: 0.5 } }),
            });
            const gridConfig = createMockGridConfig({ cellSize: { width: 100, height: 100 } });

            const { result } = renderHook(() =>
                useEntityRenderingData([asset], gridConfig, createMockTheme())
            );

            const renderData = result.current.assetRenderData.get('placed-asset-1');
            expect(renderData?.pixelWidth).toBe(50);
            expect(renderData?.pixelHeight).toBe(50);
        });

        it('should update when grid config changes', () => {
            const asset = createMockPlacedAsset({
                asset: createMockAsset({ size: { width: 2, height: 2 } }),
            });
            const gridConfig1 = createMockGridConfig({ cellSize: { width: 50, height: 50 } });
            const gridConfig2 = createMockGridConfig({ cellSize: { width: 75, height: 75 } });

            const { result, rerender } = renderHook(
                ({ gridConfig }) => useEntityRenderingData([asset], gridConfig, createMockTheme()),
                { initialProps: { gridConfig: gridConfig1 } }
            );

            expect(result.current.assetRenderData.get('placed-asset-1')?.pixelWidth).toBe(100);

            rerender({ gridConfig: gridConfig2 });

            expect(result.current.assetRenderData.get('placed-asset-1')?.pixelWidth).toBe(150);
        });

        it('should calculate correct dimensions for multiple assets', () => {
            const assets = [
                createMockPlacedAsset({
                    id: 'small',
                    asset: createMockAsset({ size: { width: 1, height: 1 } }),
                }),
                createMockPlacedAsset({
                    id: 'large',
                    asset: createMockAsset({ size: { width: 4, height: 4 } }),
                }),
            ];
            const gridConfig = createMockGridConfig({ cellSize: { width: 50, height: 50 } });

            const { result } = renderHook(() =>
                useEntityRenderingData(assets, gridConfig, createMockTheme())
            );

            expect(result.current.assetRenderData.get('small')?.pixelWidth).toBe(50);
            expect(result.current.assetRenderData.get('large')?.pixelWidth).toBe(200);
        });
    });

    describe('assetRenderData - labels', () => {
        it('should format label for Creature assets', () => {
            const creature = createMockCreature({ name: 'Goblin #1' });

            const { result } = renderHook(() =>
                useEntityRenderingData([creature], createMockGridConfig(), createMockTheme())
            );

            const renderData = result.current.assetRenderData.get('creature-1');
            expect(renderData?.formattedLabel).not.toBeNull();
            expect(renderData?.formattedLabel?.fullText).toBe('Goblin #1');
        });

        it('should format label for Character assets', () => {
            const character = createMockCharacter({ name: 'Sir Lancelot' });

            const { result } = renderHook(() =>
                useEntityRenderingData([character], createMockGridConfig(), createMockTheme())
            );

            const renderData = result.current.assetRenderData.get('character-1');
            expect(renderData?.formattedLabel).not.toBeNull();
            expect(renderData?.formattedLabel?.fullText).toBe('Sir Lancelot');
        });

        it('should not format label for Object assets', () => {
            const object = createMockPlacedAsset({ name: 'Chest' });

            const { result } = renderHook(() =>
                useEntityRenderingData([object], createMockGridConfig(), createMockTheme())
            );

            const renderData = result.current.assetRenderData.get('placed-asset-1');
            expect(renderData?.formattedLabel).toBeNull();
        });

        it('should not format label for Effect assets', () => {
            const effect = createMockPlacedAsset({
                id: 'effect-1',
                asset: createMockAsset({
                    classification: {
                        kind: AssetKind.Effect,
                        category: 'Magic',
                        type: 'Fire',
                        subtype: null,
                    },
                }),
                name: 'Fireball',
            });

            const { result } = renderHook(() =>
                useEntityRenderingData([effect], createMockGridConfig(), createMockTheme())
            );

            const renderData = result.current.assetRenderData.get('effect-1');
            expect(renderData?.formattedLabel).toBeNull();
        });

        it('should truncate long names', () => {
            const creature = createMockCreature({ name: 'Very Long Monster Name That Should Be Truncated' });

            const { result } = renderHook(() =>
                useEntityRenderingData([creature], createMockGridConfig(), createMockTheme())
            );

            const renderData = result.current.assetRenderData.get('creature-1');
            expect(renderData?.formattedLabel?.isTruncated).toBe(true);
            expect(renderData?.formattedLabel?.displayText).not.toBe(renderData?.formattedLabel?.fullText);
        });

        it('should not truncate short names', () => {
            const creature = createMockCreature({ name: 'Goblin' });

            const { result } = renderHook(() =>
                useEntityRenderingData([creature], createMockGridConfig(), createMockTheme())
            );

            const renderData = result.current.assetRenderData.get('creature-1');
            expect(renderData?.formattedLabel?.isTruncated).toBe(false);
        });

        it('should include display dimensions in formatted label', () => {
            const creature = createMockCreature({ name: 'Goblin' });

            const { result } = renderHook(() =>
                useEntityRenderingData([creature], createMockGridConfig(), createMockTheme())
            );

            const renderData = result.current.assetRenderData.get('creature-1');
            expect(renderData?.formattedLabel?.displayWidth).toBeGreaterThan(0);
            expect(renderData?.formattedLabel?.displayHeight).toBeGreaterThan(0);
        });

        it('should handle mixed asset types correctly', () => {
            const assets = [
                createMockCreature({ id: 'creature-1', name: 'Orc' }),
                createMockCharacter({ id: 'character-1', name: 'Hero' }),
                createMockPlacedAsset({ id: 'object-1', name: 'Table' }),
            ];

            const { result } = renderHook(() =>
                useEntityRenderingData(assets, createMockGridConfig(), createMockTheme())
            );

            expect(result.current.assetRenderData.get('creature-1')?.formattedLabel).not.toBeNull();
            expect(result.current.assetRenderData.get('character-1')?.formattedLabel).not.toBeNull();
            expect(result.current.assetRenderData.get('object-1')?.formattedLabel).toBeNull();
        });

        it('should update labels when assets change', () => {
            const creature1 = createMockCreature({ id: 'creature-1', name: 'Goblin' });
            const creature2 = createMockCreature({ id: 'creature-1', name: 'Orc Warrior' });

            const { result, rerender } = renderHook(
                ({ assets }) => useEntityRenderingData(assets, createMockGridConfig(), createMockTheme()),
                { initialProps: { assets: [creature1] } }
            );

            expect(result.current.assetRenderData.get('creature-1')?.formattedLabel?.fullText).toBe('Goblin');

            rerender({ assets: [creature2] });

            expect(result.current.assetRenderData.get('creature-1')?.formattedLabel?.fullText).toBe('Orc Warrior');
        });
    });

    describe('collisionData - filtering', () => {
        it('should filter out assets with missing position', () => {
            const validAsset = createMockPlacedAsset({ id: 'valid' });
            const invalidAsset = createMockPlacedAsset({
                id: 'invalid',
                position: undefined as unknown as { x: number; y: number },
            });

            const { result } = renderHook(() =>
                useEntityRenderingData([validAsset, invalidAsset], createMockGridConfig(), createMockTheme())
            );

            expect(result.current.collisionData.length).toBe(1);
            expect(result.current.collisionData[0]?.x).toBe(100);
        });

        it('should filter out assets with non-numeric position x', () => {
            const invalidAsset = createMockPlacedAsset({
                position: { x: 'abc' as unknown as number, y: 100 },
            });

            const { result } = renderHook(() =>
                useEntityRenderingData([invalidAsset], createMockGridConfig(), createMockTheme())
            );

            expect(result.current.collisionData.length).toBe(0);
        });

        it('should filter out assets with non-numeric position y', () => {
            const invalidAsset = createMockPlacedAsset({
                position: { x: 100, y: null as unknown as number },
            });

            const { result } = renderHook(() =>
                useEntityRenderingData([invalidAsset], createMockGridConfig(), createMockTheme())
            );

            expect(result.current.collisionData.length).toBe(0);
        });

        it('should filter out assets with missing size', () => {
            const invalidAsset = createMockPlacedAsset({
                size: undefined as unknown as { width: number; height: number },
            });

            const { result } = renderHook(() =>
                useEntityRenderingData([invalidAsset], createMockGridConfig(), createMockTheme())
            );

            expect(result.current.collisionData.length).toBe(0);
        });

        it('should filter out assets with zero width', () => {
            const invalidAsset = createMockPlacedAsset({
                size: { width: 0, height: 50 },
            });

            const { result } = renderHook(() =>
                useEntityRenderingData([invalidAsset], createMockGridConfig(), createMockTheme())
            );

            expect(result.current.collisionData.length).toBe(0);
        });

        it('should filter out assets with zero height', () => {
            const invalidAsset = createMockPlacedAsset({
                size: { width: 50, height: 0 },
            });

            const { result } = renderHook(() =>
                useEntityRenderingData([invalidAsset], createMockGridConfig(), createMockTheme())
            );

            expect(result.current.collisionData.length).toBe(0);
        });

        it('should filter out assets with negative dimensions', () => {
            const invalidAsset = createMockPlacedAsset({
                size: { width: -50, height: 50 },
            });

            const { result } = renderHook(() =>
                useEntityRenderingData([invalidAsset], createMockGridConfig(), createMockTheme())
            );

            expect(result.current.collisionData.length).toBe(0);
        });

        it('should filter out assets with Infinity position', () => {
            const invalidAsset = createMockPlacedAsset({
                position: { x: Infinity, y: 100 },
            });

            const { result } = renderHook(() =>
                useEntityRenderingData([invalidAsset], createMockGridConfig(), createMockTheme())
            );

            expect(result.current.collisionData.length).toBe(0);
        });

        it('should filter out assets with NaN position', () => {
            const invalidAsset = createMockPlacedAsset({
                position: { x: NaN, y: 100 },
            });

            const { result } = renderHook(() =>
                useEntityRenderingData([invalidAsset], createMockGridConfig(), createMockTheme())
            );

            expect(result.current.collisionData.length).toBe(0);
        });

        it('should filter out assets with Infinity size', () => {
            const invalidAsset = createMockPlacedAsset({
                size: { width: Infinity, height: 50 },
            });

            const { result } = renderHook(() =>
                useEntityRenderingData([invalidAsset], createMockGridConfig(), createMockTheme())
            );

            expect(result.current.collisionData.length).toBe(0);
        });

        it('should filter out assets with NaN size', () => {
            const invalidAsset = createMockPlacedAsset({
                size: { width: 50, height: NaN },
            });

            const { result } = renderHook(() =>
                useEntityRenderingData([invalidAsset], createMockGridConfig(), createMockTheme())
            );

            expect(result.current.collisionData.length).toBe(0);
        });

        it('should include valid assets only', () => {
            const validAssets = [
                createMockPlacedAsset({ id: 'a1', position: { x: 100, y: 100 }, size: { width: 50, height: 50 } }),
                createMockPlacedAsset({ id: 'a2', position: { x: 200, y: 200 }, size: { width: 50, height: 50 } }),
            ];
            const invalidAsset = createMockPlacedAsset({
                id: 'invalid',
                position: { x: NaN, y: 100 },
            });

            const { result } = renderHook(() =>
                useEntityRenderingData([...validAssets, invalidAsset], createMockGridConfig(), createMockTheme())
            );

            expect(result.current.collisionData.length).toBe(2);
        });
    });

    describe('collisionData - properties', () => {
        it('should include position coordinates in collision data', () => {
            const asset = createMockPlacedAsset({
                position: { x: 150, y: 250 },
            });

            const { result } = renderHook(() =>
                useEntityRenderingData([asset], createMockGridConfig(), createMockTheme())
            );

            expect(result.current.collisionData[0]?.x).toBe(150);
            expect(result.current.collisionData[0]?.y).toBe(250);
        });

        it('should include size dimensions in collision data', () => {
            const asset = createMockPlacedAsset({
                size: { width: 100, height: 75 },
            });

            const { result } = renderHook(() =>
                useEntityRenderingData([asset], createMockGridConfig(), createMockTheme())
            );

            expect(result.current.collisionData[0]?.width).toBe(100);
            expect(result.current.collisionData[0]?.height).toBe(75);
        });

        it('should set allowOverlap false for Object assets with valid tokenSize', () => {
            const object = createMockPlacedAsset({
                asset: createMockAsset({
                    classification: {
                        kind: AssetKind.Object,
                        category: 'Furniture',
                        type: 'Table',
                        subtype: null,
                    },
                    size: { width: 2, height: 2 },
                }),
            });

            const { result } = renderHook(() =>
                useEntityRenderingData([object], createMockGridConfig(), createMockTheme())
            );

            expect(result.current.collisionData[0]?.allowOverlap).toBe(false);
        });

        it('should set allowOverlap false for Creature assets with valid tokenSize', () => {
            const creature = createMockCreature({
                asset: createMockAsset({
                    classification: {
                        kind: AssetKind.Creature,
                        category: 'Monster',
                        type: 'Goblinoid',
                        subtype: null,
                    },
                    size: { width: 1, height: 1 },
                }),
            });

            const { result } = renderHook(() =>
                useEntityRenderingData([creature], createMockGridConfig(), createMockTheme())
            );

            expect(result.current.collisionData[0]?.allowOverlap).toBe(false);
        });

        it('should set allowOverlap false for Character assets with valid tokenSize', () => {
            const character = createMockCharacter({
                asset: createMockAsset({
                    classification: {
                        kind: AssetKind.Character,
                        category: 'PC',
                        type: 'Fighter',
                        subtype: null,
                    },
                    size: { width: 1, height: 1 },
                }),
            });

            const { result } = renderHook(() =>
                useEntityRenderingData([character], createMockGridConfig(), createMockTheme())
            );

            expect(result.current.collisionData[0]?.allowOverlap).toBe(false);
        });

        it('should not provide objectData when tokenSize is missing', () => {
            const object = createMockPlacedAsset({
                asset: createMockAsset({
                    classification: {
                        kind: AssetKind.Object,
                        category: 'Prop',
                        type: 'Rock',
                        subtype: null,
                    },
                    size: undefined as unknown as { width: number; height: number },
                }),
            });

            const { result } = renderHook(() =>
                useEntityRenderingData([object], createMockGridConfig(), createMockTheme())
            );

            // Should still have collision data, but getPlacementBehavior called with undefined objectData
            expect(result.current.collisionData.length).toBe(1);
        });

        it('should map all valid assets to collision data', () => {
            const assets = [
                createMockPlacedAsset({ id: 'a1', position: { x: 0, y: 0 }, size: { width: 50, height: 50 } }),
                createMockPlacedAsset({ id: 'a2', position: { x: 100, y: 100 }, size: { width: 50, height: 50 } }),
                createMockPlacedAsset({ id: 'a3', position: { x: 200, y: 200 }, size: { width: 50, height: 50 } }),
            ];

            const { result } = renderHook(() =>
                useEntityRenderingData(assets, createMockGridConfig(), createMockTheme())
            );

            expect(result.current.collisionData.length).toBe(3);
            expect(result.current.collisionData[0]?.x).toBe(0);
            expect(result.current.collisionData[1]?.x).toBe(100);
            expect(result.current.collisionData[2]?.x).toBe(200);
        });
    });

    describe('memoization', () => {
        it('should maintain labelColors reference when theme unchanged', () => {
            const theme = createMockTheme();
            const { result, rerender } = renderHook(
                ({ assets }) => useEntityRenderingData(assets, createMockGridConfig(), theme),
                { initialProps: { assets: [] as PlacedAsset[] } }
            );

            const firstLabelColors = result.current.labelColors;

            rerender({ assets: [createMockPlacedAsset()] });

            expect(result.current.labelColors).toBe(firstLabelColors);
        });

        it('should create new labelVisibilityMap reference when assets change', () => {
            const asset1 = createMockPlacedAsset({ id: 'asset-1' });
            const asset2 = createMockPlacedAsset({ id: 'asset-2' });

            const { result, rerender } = renderHook(
                ({ assets }) => useEntityRenderingData(assets, createMockGridConfig(), createMockTheme()),
                { initialProps: { assets: [asset1] } }
            );

            const firstMap = result.current.labelVisibilityMap;

            rerender({ assets: [asset1, asset2] });

            expect(result.current.labelVisibilityMap).not.toBe(firstMap);
        });

        it('should maintain assetRenderData reference when assets and gridConfig unchanged', () => {
            const assets = [createMockPlacedAsset()];
            const gridConfig = createMockGridConfig();
            const theme = createMockTheme();

            const { result, rerender } = renderHook(
                ({ assets: a, gridConfig: g, theme: t }) => useEntityRenderingData(a, g, t),
                { initialProps: { assets, gridConfig, theme } }
            );

            const firstRenderData = result.current.assetRenderData;

            // Change only theme, keep same assets and gridConfig references
            rerender({ assets, gridConfig, theme: createMockTheme({ text: { primary: '#333333', secondary: '#999999' } }) });

            expect(result.current.assetRenderData).toBe(firstRenderData);
        });

        it('should create new collisionData reference when assets change', () => {
            const asset1 = createMockPlacedAsset({ id: 'asset-1' });
            const asset2 = createMockPlacedAsset({ id: 'asset-2' });

            const { result, rerender } = renderHook(
                ({ assets }) => useEntityRenderingData(assets, createMockGridConfig(), createMockTheme()),
                { initialProps: { assets: [asset1] } }
            );

            const firstCollisionData = result.current.collisionData;

            rerender({ assets: [asset1, asset2] });

            expect(result.current.collisionData).not.toBe(firstCollisionData);
        });

        it('should create new assetRenderData when gridConfig cellSize changes', () => {
            const asset = createMockPlacedAsset();
            const gridConfig1 = createMockGridConfig({ cellSize: { width: 50, height: 50 } });
            const gridConfig2 = createMockGridConfig({ cellSize: { width: 60, height: 60 } });

            const { result, rerender } = renderHook(
                ({ gridConfig }) => useEntityRenderingData([asset], gridConfig, createMockTheme()),
                { initialProps: { gridConfig: gridConfig1 } }
            );

            const firstRenderData = result.current.assetRenderData;

            rerender({ gridConfig: gridConfig2 });

            expect(result.current.assetRenderData).not.toBe(firstRenderData);
        });
    });

    describe('integration', () => {
        it('should handle empty asset array', () => {
            const { result } = renderHook(() =>
                useEntityRenderingData([], createMockGridConfig(), createMockTheme())
            );

            expect(result.current.labelVisibilityMap.size).toBe(0);
            expect(result.current.labelPositionMap.size).toBe(0);
            expect(result.current.assetRenderData.size).toBe(0);
            expect(result.current.collisionData.length).toBe(0);
            expect(result.current.labelColors).toBeDefined();
        });

        it('should handle mixed valid and invalid assets', () => {
            const assets = [
                createMockPlacedAsset({ id: 'valid-1' }),
                createMockPlacedAsset({ id: 'invalid', size: { width: 0, height: 50 } }),
                createMockCreature({ id: 'valid-2' }),
            ];

            const { result } = renderHook(() =>
                useEntityRenderingData(assets, createMockGridConfig(), createMockTheme())
            );

            // All assets appear in visibility/position/render maps
            expect(result.current.labelVisibilityMap.size).toBe(3);
            expect(result.current.assetRenderData.size).toBe(3);

            // Only valid assets appear in collision data
            expect(result.current.collisionData.length).toBe(2);
        });

        it('should handle large number of assets', () => {
            const assets = Array.from({ length: 100 }, (_, i) =>
                createMockPlacedAsset({
                    id: `asset-${i}`,
                    position: { x: i * 60, y: i * 60 },
                })
            );

            const { result } = renderHook(() =>
                useEntityRenderingData(assets, createMockGridConfig(), createMockTheme())
            );

            expect(result.current.labelVisibilityMap.size).toBe(100);
            expect(result.current.assetRenderData.size).toBe(100);
            expect(result.current.collisionData.length).toBe(100);
        });

        it('should return consistent structure', () => {
            const { result } = renderHook(() =>
                useEntityRenderingData([createMockPlacedAsset()], createMockGridConfig(), createMockTheme())
            );

            expect(result.current).toHaveProperty('labelColors');
            expect(result.current).toHaveProperty('labelVisibilityMap');
            expect(result.current).toHaveProperty('labelPositionMap');
            expect(result.current).toHaveProperty('assetRenderData');
            expect(result.current).toHaveProperty('collisionData');

            expect(result.current.labelColors).toHaveProperty('background');
            expect(result.current.labelColors).toHaveProperty('border');
            expect(result.current.labelColors).toHaveProperty('text');
        });

        it('should handle rapid asset updates', () => {
            const { result, rerender } = renderHook(
                ({ assets }) => useEntityRenderingData(assets, createMockGridConfig(), createMockTheme()),
                { initialProps: { assets: [] as PlacedAsset[] } }
            );

            // Rapid updates
            for (let i = 0; i < 10; i++) {
                rerender({
                    assets: Array.from({ length: i + 1 }, (_, j) =>
                        createMockPlacedAsset({ id: `asset-${j}` })
                    ),
                });
            }

            expect(result.current.labelVisibilityMap.size).toBe(10);
        });

        it('should work with all asset kinds simultaneously', () => {
            const assets = [
                createMockPlacedAsset({
                    id: 'object-1',
                    asset: createMockAsset({
                        classification: { kind: AssetKind.Object, category: 'Prop', type: 'Chair', subtype: null },
                    }),
                }),
                createMockCreature({ id: 'creature-1' }),
                createMockCharacter({ id: 'character-1' }),
                createMockPlacedAsset({
                    id: 'effect-1',
                    asset: createMockAsset({
                        classification: { kind: AssetKind.Effect, category: 'Magic', type: 'Fire', subtype: null },
                    }),
                }),
            ];

            const { result } = renderHook(() =>
                useEntityRenderingData(assets, createMockGridConfig(), createMockTheme())
            );

            expect(result.current.labelVisibilityMap.size).toBe(4);

            // Labels only for Creature and Character
            const objectData = result.current.assetRenderData.get('object-1');
            const creatureData = result.current.assetRenderData.get('creature-1');
            const characterData = result.current.assetRenderData.get('character-1');
            const effectData = result.current.assetRenderData.get('effect-1');

            expect(objectData?.formattedLabel).toBeNull();
            expect(creatureData?.formattedLabel).not.toBeNull();
            expect(characterData?.formattedLabel).not.toBeNull();
            expect(effectData?.formattedLabel).toBeNull();
        });
    });
});
