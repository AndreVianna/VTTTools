import type { Asset, ObjectAsset, SceneAsset, PlacedAsset, SceneWall, PlacedWall, SceneRegion, PlacedRegion, SceneSource, PlacedSource } from '@/types/domain';
import { GroupName } from '@/services/layerManager';
import { DisplayName as DisplayNameEnum, LabelPosition as LabelPositionEnum } from '@/types/domain';
import {
    getDomIdByIndex,
    setEntityMapping
} from './sceneEntityMapping';

/**
 * Scene Asset Mappers - Convert between backend and frontend representations
 *
 * Backend (SceneAsset): Stores asset references only (assetId)
 * Frontend (PlacedAsset): Needs full Asset objects with images and properties
 */

function getAssetLayer(asset: Asset): GroupName {
    if (asset.kind === 'Creature') {
        return GroupName.Creatures;
    }

    const objectAsset = asset as ObjectAsset;
    if (objectAsset.isOpaque) {
        return GroupName.Structure;
    }

    return GroupName.Objects;
}

export async function hydratePlacedAssets(
    sceneAssets: SceneAsset[],
    sceneId: string,
    getAsset: (assetId: string) => Promise<Asset>
): Promise<PlacedAsset[]> {
    const assetPromises = sceneAssets.map(sa => getAsset(sa.assetId));
    const assets = await Promise.all(assetPromises);

    return sceneAssets
        .map((sa, arrayIndex) => {
            const asset = assets[arrayIndex];
            if (!asset) return null;

            const position = 'position' in sa
                ? { x: (sa as any).position.x, y: (sa as any).position.y }
                : { x: sa.x, y: sa.y };

            const size = 'size' in sa
                ? { width: (sa as any).size.width, height: (sa as any).size.height }
                : { width: sa.width, height: sa.height };

            const sceneAssetAny = sa as any;
            const backendIndex = sceneAssetAny.index !== undefined ? sceneAssetAny.index : arrayIndex;

            let domId = getDomIdByIndex(sceneId, 'assets', backendIndex);

            if (!domId) {
                domId = `scene-asset-${Date.now()}-${Math.random().toString(36).substring(2, 11)}`;
                setEntityMapping(sceneId, 'assets', domId, backendIndex);
            }

            const placedAsset: PlacedAsset = {
                id: domId,
                assetId: sa.assetId,
                asset,
                position,
                size,
                rotation: sa.rotation,
                layer: getAssetLayer(asset),
                index: backendIndex,
                number: sceneAssetAny.number !== undefined ? sceneAssetAny.number : 1,
                name: sceneAssetAny.name || asset.name,
                visible: sceneAssetAny.visible !== undefined ? sceneAssetAny.visible : true,
                locked: sceneAssetAny.locked !== undefined ? sceneAssetAny.locked : false,
                displayName: sceneAssetAny.displayName || DisplayNameEnum.Default,
                labelPosition: sceneAssetAny.labelPosition || LabelPositionEnum.Default
            };
            return placedAsset;
        })
        .filter((pa): pa is PlacedAsset => pa !== null);
}

export function dehydratePlacedAssets(
    placedAssets: PlacedAsset[],
    sceneId: string
): SceneAsset[] {
    return placedAssets.map(pa => ({
        id: pa.id,
        sceneId,
        assetId: pa.assetId,
        index: pa.index,
        number: pa.number,
        name: pa.name,
        x: pa.position.x,
        y: pa.position.y,
        width: pa.size.width,
        height: pa.size.height,
        rotation: pa.rotation,
        scaleX: 1,
        scaleY: 1,
        layer: parseInt(pa.layer.replace('layer-', ''), 10) || 0,
        elevation: 0,
        visible: true,
        locked: false,
        asset: pa.asset
    }));
}

export function hydratePlacedWalls(
    sceneWalls: SceneWall[],
    sceneId: string
): PlacedWall[] {
    return sceneWalls.map((wall) => {
        const backendIndex = wall.index;

        let domId = getDomIdByIndex(sceneId, 'walls', backendIndex);

        if (!domId) {
            domId = `wall-${Date.now()}-${Math.random().toString(36).substring(2, 11)}`;
            setEntityMapping(sceneId, 'walls', domId, backendIndex);
        }

        const placedWall: PlacedWall = {
            ...wall,
            id: domId
        };

        return placedWall;
    });
}

export function dehydratePlacedWalls(
    placedWalls: PlacedWall[]
): SceneWall[] {
    return placedWalls.map(({ id, ...wall }) => wall);
}

export function hydratePlacedRegions(
    sceneRegions: SceneRegion[],
    sceneId: string
): PlacedRegion[] {
    return sceneRegions.map((region) => {
        const domId = getDomIdByIndex(sceneId, 'regions', region.index) ||
            `region-${Date.now()}-${Math.random().toString(36).substring(2, 11)}`;

        if (!getDomIdByIndex(sceneId, 'regions', region.index)) {
            setEntityMapping(sceneId, 'regions', domId, region.index);
        }

        return {
            ...region,
            id: domId
        };
    });
}

export function dehydratePlacedRegions(placedRegions: PlacedRegion[]): SceneRegion[] {
    return placedRegions.map(({ id, ...region }) => region);
}

export function hydratePlacedSources(
    sceneSources: SceneSource[],
    sceneId: string
): PlacedSource[] {
    return sceneSources.map((source) => {
        const domId = getDomIdByIndex(sceneId, 'sources', source.index) ||
            `source-${Date.now()}-${Math.random().toString(36).substring(2, 11)}`;

        if (!getDomIdByIndex(sceneId, 'sources', source.index)) {
            setEntityMapping(sceneId, 'sources', domId, source.index);
        }

        return {
            ...source,
            id: domId
        };
    });
}

export function dehydratePlacedSources(placedSources: PlacedSource[]): SceneSource[] {
    return placedSources.map(({ id, ...source }) => source);
}
