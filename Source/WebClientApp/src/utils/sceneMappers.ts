import type { Asset, SceneAsset, PlacedAsset } from '@/types/domain';
import { GroupName } from '@/services/layerManager';

/**
 * Scene Asset Mappers - Convert between backend and frontend representations
 *
 * Backend (SceneAsset): Stores asset references only (assetId)
 * Frontend (PlacedAsset): Needs full Asset objects with images and properties
 */

/**
 * Determine the layer group for an asset based on its kind and properties
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

/**
 * Hydrate SceneAssets to PlacedAssets by fetching full Asset objects
 * @param sceneAssets Backend scene assets with asset references
 * @param getAsset Function to fetch full asset by ID
 * @returns PlacedAssets with full asset objects
 */
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

            // Handle both flat and nested property structures
            // Backend stores pixel coordinates directly (despite Position model docs saying "cell-based")
            const position = 'position' in sa
                ? { x: (sa as any).position.x, y: (sa as any).position.y }
                : { x: sa.x, y: sa.y };

            const size = 'size' in sa
                ? { width: (sa as any).size.width, height: (sa as any).size.height }
                : { width: sa.width, height: sa.height };

            // Backend SceneAsset doesn't have an id property, use index for unique identification
            const sceneAssetAny = sa as any;
            return {
                id: sceneAssetAny.id || `scene-asset-${sceneAssetAny.index || index}`,
                assetId: sa.assetId,
                asset,
                position,
                size,
                rotation: sa.rotation,
                layer: getAssetLayer(asset)
            };
        })
        .filter((pa): pa is PlacedAsset => pa !== null);
}

/**
 * Dehydrate PlacedAssets to SceneAssets for backend persistence
 * @param placedAssets Frontend placed assets with full objects
 * @param sceneId Scene ID these assets belong to
 * @returns SceneAssets with only asset references
 */
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
