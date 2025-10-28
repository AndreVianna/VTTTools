import { describe, it, expect } from 'vitest';
import { hydratePlacedAssets, dehydratePlacedAssets } from './sceneMappers';
import type { SceneAsset, Asset, PlacedAsset } from '@/types/domain';
import { AssetKind, ResourceRole, DisplayName, LabelPosition } from '@/types/domain';

const mockCreatureAsset: Asset = {
    id: 'asset-1',
    ownerId: 'user-1',
    kind: AssetKind.Creature,
    name: 'Goblin',
    description: 'A small goblin',
    isPublished: true,
    isPublic: false,
    resources: [
        {
            resourceId: 'resource-1',
            role: ResourceRole.Token
        }
    ],
    createdAt: '2024-01-01T00:00:00Z',
    updatedAt: '2024-01-01T00:00:00Z'
};

const mockObjectAsset: Asset = {
    id: 'asset-2',
    ownerId: 'user-1',
    kind: AssetKind.Object,
    name: 'Treasure Chest',
    description: 'A wooden chest',
    isPublished: true,
    isPublic: false,
    resources: [],
    createdAt: '2024-01-01T00:00:00Z',
    updatedAt: '2024-01-01T00:00:00Z'
};

describe('hydratePlacedAssets', () => {
    describe('name hydration', () => {
        it('uses sceneAsset name when provided', async () => {
            const sceneAsset: SceneAsset = {
                id: 'scene-asset-1',
                sceneId: 'scene-1',
                assetId: 'asset-1',
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
                asset: mockCreatureAsset
            };

            const sceneAssetWithName = {
                ...sceneAsset,
                name: 'Goblin #2',
                index: 1,
                number: 2
            } as any;

            const getAsset = async () => mockCreatureAsset;

            const result = await hydratePlacedAssets([sceneAssetWithName], getAsset);

            expect(result).toHaveLength(1);
            expect(result[0]?.name).toBe('Goblin #2');
        });

        it('falls back to asset name when sceneAsset name is undefined', async () => {
            const sceneAsset: SceneAsset = {
                id: 'scene-asset-1',
                sceneId: 'scene-1',
                assetId: 'asset-1',
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
                asset: mockCreatureAsset
            };

            const getAsset = async () => mockCreatureAsset;

            const result = await hydratePlacedAssets([sceneAsset], getAsset);

            expect(result).toHaveLength(1);
            expect(result[0]?.name).toBe('Goblin');
        });

        it('falls back to asset name when sceneAsset name is null', async () => {
            const sceneAsset: SceneAsset = {
                id: 'scene-asset-1',
                sceneId: 'scene-1',
                assetId: 'asset-1',
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
                asset: mockCreatureAsset
            };

            const sceneAssetWithNullName = {
                ...sceneAsset,
                name: null
            } as any;

            const getAsset = async () => mockCreatureAsset;

            const result = await hydratePlacedAssets([sceneAssetWithNullName], getAsset);

            expect(result).toHaveLength(1);
            expect(result[0]?.name).toBe('Goblin');
        });

        it('falls back to asset name when sceneAsset name is empty string', async () => {
            const sceneAsset: SceneAsset = {
                id: 'scene-asset-1',
                sceneId: 'scene-1',
                assetId: 'asset-1',
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
                asset: mockCreatureAsset
            };

            const sceneAssetWithEmptyName = {
                ...sceneAsset,
                name: ''
            } as any;

            const getAsset = async () => mockCreatureAsset;

            const result = await hydratePlacedAssets([sceneAssetWithEmptyName], getAsset);

            expect(result).toHaveLength(1);
            expect(result[0]?.name).toBe('Goblin');
        });

        it('preserves numbered creature names', async () => {
            const sceneAsset: SceneAsset = {
                id: 'scene-asset-1',
                sceneId: 'scene-1',
                assetId: 'asset-1',
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
                asset: mockCreatureAsset
            };

            const sceneAssetWithNumberedName = {
                ...sceneAsset,
                name: 'Goblin #5',
                index: 10,
                number: 5
            } as any;

            const getAsset = async () => mockCreatureAsset;

            const result = await hydratePlacedAssets([sceneAssetWithNumberedName], getAsset);

            expect(result).toHaveLength(1);
            expect(result[0]?.name).toBe('Goblin #5');
            expect(result[0].number).toBe(5);
        });

        it('handles object asset names', async () => {
            const sceneAsset: SceneAsset = {
                id: 'scene-asset-2',
                sceneId: 'scene-1',
                assetId: 'asset-2',
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
                asset: mockObjectAsset
            };

            const sceneAssetWithCustomName = {
                ...sceneAsset,
                name: 'Golden Chest'
            } as any;

            const getAsset = async () => mockObjectAsset;

            const result = await hydratePlacedAssets([sceneAssetWithCustomName], getAsset);

            expect(result).toHaveLength(1);
            expect(result[0]?.name).toBe('Golden Chest');
        });

        it('handles multiple assets with different naming patterns', async () => {
            const sceneAssets = [
                {
                    id: 'scene-asset-1',
                    sceneId: 'scene-1',
                    assetId: 'asset-1',
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
                    asset: mockCreatureAsset,
                    name: 'Goblin #1',
                    index: 0,
                    number: 1
                },
                {
                    id: 'scene-asset-2',
                    sceneId: 'scene-1',
                    assetId: 'asset-1',
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
                    asset: mockCreatureAsset,
                    index: 1,
                    number: 2
                },
                {
                    id: 'scene-asset-3',
                    sceneId: 'scene-1',
                    assetId: 'asset-2',
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
                    asset: mockObjectAsset,
                    name: 'Magic Chest'
                }
            ] as any[];

            const getAsset = async (assetId: string) => {
                return assetId === 'asset-1' ? mockCreatureAsset : mockObjectAsset;
            };

            const result = await hydratePlacedAssets(sceneAssets, getAsset);

            expect(result).toHaveLength(3);
            expect(result[0]?.name).toBe('Goblin #1');
            expect(result[1]?.name).toBe('Goblin');
            expect(result[2]?.name).toBe('Magic Chest');
        });
    });

    describe('position and size hydration', () => {
        it('handles flat position and size properties', async () => {
            const sceneAsset: SceneAsset = {
                id: 'scene-asset-1',
                sceneId: 'scene-1',
                assetId: 'asset-1',
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
                asset: mockCreatureAsset
            };

            const getAsset = async () => mockCreatureAsset;

            const result = await hydratePlacedAssets([sceneAsset], getAsset);

            expect(result).toHaveLength(1);
            expect(result[0].position).toEqual({ x: 100, y: 150 });
            expect(result[0].size).toEqual({ width: 50, height: 75 });
            expect(result[0].rotation).toBe(45);
        });

        it('handles nested position and size properties', async () => {
            const sceneAsset = {
                id: 'scene-asset-1',
                sceneId: 'scene-1',
                assetId: 'asset-1',
                position: { x: 200, y: 250 },
                size: { width: 60, height: 80 },
                rotation: 90,
                scaleX: 1,
                scaleY: 1,
                layer: 0,
                visible: true,
                locked: false,
                asset: mockCreatureAsset
            } as any;

            const getAsset = async () => mockCreatureAsset;

            const result = await hydratePlacedAssets([sceneAsset], getAsset);

            expect(result).toHaveLength(1);
            expect(result[0].position).toEqual({ x: 200, y: 250 });
            expect(result[0].size).toEqual({ width: 60, height: 80 });
            expect(result[0].rotation).toBe(90);
        });
    });

    describe('layer assignment', () => {
        it('assigns Creatures layer for creature assets', async () => {
            const sceneAsset: SceneAsset = {
                id: 'scene-asset-1',
                sceneId: 'scene-1',
                assetId: 'asset-1',
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
                asset: mockCreatureAsset
            };

            const getAsset = async () => mockCreatureAsset;

            const result = await hydratePlacedAssets([sceneAsset], getAsset);

            expect(result).toHaveLength(1);
            expect(result[0].layer).toBe('creatures');
        });

        it('assigns Objects layer for non-opaque object assets', async () => {
            const sceneAsset: SceneAsset = {
                id: 'scene-asset-2',
                sceneId: 'scene-1',
                assetId: 'asset-2',
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
                asset: mockObjectAsset
            };

            const getAsset = async () => mockObjectAsset;

            const result = await hydratePlacedAssets([sceneAsset], getAsset);

            expect(result).toHaveLength(1);
            expect(result[0].layer).toBe('objects');
        });
    });

    describe('index and number properties', () => {
        it('preserves index and number from sceneAsset', async () => {
            const sceneAsset = {
                id: 'scene-asset-1',
                sceneId: 'scene-1',
                assetId: 'asset-1',
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
                asset: mockCreatureAsset,
                index: 5,
                number: 3
            } as any;

            const getAsset = async () => mockCreatureAsset;

            const result = await hydratePlacedAssets([sceneAsset], getAsset);

            expect(result).toHaveLength(1);
            expect(result[0].index).toBe(5);
            expect(result[0].number).toBe(3);
        });

        it('uses array index as fallback for index property', async () => {
            const sceneAsset: SceneAsset = {
                id: 'scene-asset-1',
                sceneId: 'scene-1',
                assetId: 'asset-1',
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
                asset: mockCreatureAsset
            };

            const getAsset = async () => mockCreatureAsset;

            const result = await hydratePlacedAssets([sceneAsset], getAsset);

            expect(result).toHaveLength(1);
            expect(result[0].index).toBe(0);
        });

        it('defaults number to 1 when not provided', async () => {
            const sceneAsset: SceneAsset = {
                id: 'scene-asset-1',
                sceneId: 'scene-1',
                assetId: 'asset-1',
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
                asset: mockCreatureAsset
            };

            const getAsset = async () => mockCreatureAsset;

            const result = await hydratePlacedAssets([sceneAsset], getAsset);

            expect(result).toHaveLength(1);
            expect(result[0].number).toBe(1);
        });
    });

    describe('null asset handling', () => {
        it('filters out assets that fail to load', async () => {
            const sceneAssets: SceneAsset[] = [
                {
                    id: 'scene-asset-1',
                    sceneId: 'scene-1',
                    assetId: 'asset-1',
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
                    asset: mockCreatureAsset
                },
                {
                    id: 'scene-asset-2',
                    sceneId: 'scene-1',
                    assetId: 'asset-missing',
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
                    asset: mockCreatureAsset
                }
            ];

            const getAsset = async (assetId: string) => {
                if (assetId === 'asset-missing') {
                    return null as any;
                }
                return mockCreatureAsset;
            };

            const result = await hydratePlacedAssets(sceneAssets, getAsset);

            expect(result).toHaveLength(1);
            expect(result[0].assetId).toBe('asset-1');
        });
    });
});

describe('dehydratePlacedAssets', () => {
    it('converts PlacedAsset to SceneAsset format', () => {
        const placedAsset: PlacedAsset = {
            id: 'scene-asset-1',
            assetId: 'asset-1',
            asset: mockCreatureAsset,
            position: { x: 100, y: 150 },
            size: { width: 50, height: 75 },
            rotation: 45,
            layer: 'creatures',
            index: 5,
            number: 3,
            name: 'Goblin #3',
            displayName: DisplayName.Default,
            labelPosition: LabelPosition.Default
        };

        const result = dehydratePlacedAssets([placedAsset], 'scene-1');

        expect(result).toHaveLength(1);
        expect(result[0]).toEqual({
            id: 'scene-asset-1',
            sceneId: 'scene-1',
            assetId: 'asset-1',
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
            asset: mockCreatureAsset
        });
    });

    it('handles multiple placed assets', () => {
        const placedAssets: PlacedAsset[] = [
            {
                id: 'scene-asset-1',
                assetId: 'asset-1',
                asset: mockCreatureAsset,
                position: { x: 100, y: 100 },
                size: { width: 50, height: 50 },
                rotation: 0,
                layer: 'creatures',
                index: 0,
                number: 1,
                name: 'Goblin #1',
                displayName: DisplayName.Default,
                labelPosition: LabelPosition.Default
            },
            {
                id: 'scene-asset-2',
                assetId: 'asset-2',
                asset: mockObjectAsset,
                position: { x: 200, y: 200 },
                size: { width: 75, height: 75 },
                rotation: 90,
                layer: 'objects',
                index: 1,
                number: 1,
                name: 'Treasure Chest',
                displayName: DisplayName.Default,
                labelPosition: LabelPosition.Default
            }
        ];

        const result = dehydratePlacedAssets(placedAssets, 'scene-1');

        expect(result).toHaveLength(2);
        expect(result[0].assetId).toBe('asset-1');
        expect(result[1].assetId).toBe('asset-2');
    });
});
