import type { Asset, SceneAsset, PlacedAsset } from '@/types/domain';

/**
 * Scene Asset Mappers - Convert between backend and frontend representations
 *
 * Backend (SceneAsset): Stores asset references only (assetId)
 * Frontend (PlacedAsset): Needs full Asset objects with images and properties
 */

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

            return {
                id: sa.id,
                assetId: sa.assetId,
                asset,
                position: { x: sa.x, y: sa.y },
                size: { width: sa.width, height: sa.height },
                rotation: sa.rotation,
                layer: `layer-${sa.layer}`
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
