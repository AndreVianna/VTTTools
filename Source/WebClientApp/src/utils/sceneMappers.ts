import type { Asset, SceneAsset, PlacedAsset } from '@/types/domain';
import { GroupName } from '@/services/layerManager';

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

    const objectAsset = asset as any;
    if (objectAsset.objectProps?.isOpaque) {
        return GroupName.Structure;
    }

    return GroupName.Objects;
}

export async function hydratePlacedAssets(
    sceneAssets: SceneAsset[],
    getAsset: (assetId: string) => Promise<Asset>
): Promise<PlacedAsset[]> {
    const assetPromises = sceneAssets.map(sa => getAsset(sa.assetId));
    const assets = await Promise.all(assetPromises);

    return sceneAssets
        .map((sa, index) => {
            const asset = assets[index];
            if (!asset) return null;

            const position = 'position' in sa
                ? { x: (sa as any).position.x, y: (sa as any).position.y }
                : { x: sa.x, y: sa.y };

            const size = 'size' in sa
                ? { width: (sa as any).size.width, height: (sa as any).size.height }
                : { width: sa.width, height: sa.height };

            const sceneAssetAny = sa as any;
            const placedAsset: PlacedAsset = {
                id: sceneAssetAny.id || `scene-asset-${sceneAssetAny.index || index}`,
                assetId: sa.assetId,
                asset,
                position,
                size,
                rotation: sa.rotation,
                layer: getAssetLayer(asset),
                index: sceneAssetAny.index !== undefined ? sceneAssetAny.index : index,
                number: sceneAssetAny.number !== undefined ? sceneAssetAny.number : 1,
                name: sceneAssetAny.name || asset.name
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
        x: pa.position.x,
        y: pa.position.y,
        width: pa.size.width,
        height: pa.size.height,
        rotation: pa.rotation,
        scaleX: 1,
        scaleY: 1,
        layer: parseInt(pa.layer.replace('layer-', ''), 10) || 0,
        visible: true,
        locked: false,
        asset: pa.asset
    }));
}
