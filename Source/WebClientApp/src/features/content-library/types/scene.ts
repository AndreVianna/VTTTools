import type { ContentItem } from './contentItem';
import type { GridConfig } from '@/utils/gridCalculator';
import type { PlacedAsset, MediaResource } from '@/types/domain';

export interface Point {
    x: number;
    y: number;
}

export interface StageConfig {
    background: MediaResource | null;
    zoomLevel: number;
    panning: Point;
}

export interface Frame {
    shape: string;
    borderColor: string;
    borderThickness: number;
    background: string;
}

export interface SceneAssetData {
    assetId: string;
    index: number;
    number: number;
    name: string;
    description: string | null;
    resourceId: string;
    size: { width: number; height: number };
    position: Point;
    rotation: number;
    frame: Frame | null;
    elevation: number;
    isLocked: boolean;
    isVisible: boolean;
    controlledBy: string | null;
}

export interface Scene extends ContentItem {
    type: 'scene';
    adventureId: string | null;
    grid: GridConfig;
    stage: StageConfig;
    assets: SceneAssetData[];
}

export interface CreateSceneRequest {
    name: string;
    description?: string;
    adventureId?: string | null;
    grid?: GridConfig;
    stage?: StageConfig;
}

export interface UpdateSceneRequest {
    id: string;
    name?: string;
    description?: string;
    adventureId?: string | null;
    isPublished?: boolean;
    grid?: GridConfig;
    stage?: StageConfig;
    assets?: SceneAssetData[];
}

export interface SceneMetadata {
    gridType: string;
    assetCount: number;
    lastModified: string;
}

export const getDefaultGrid = (): GridConfig => ({
    type: 1,
    cellSize: { width: 50, height: 50 },
    offset: { left: 0, top: 0 },
    snap: true
});

export const getDefaultStage = (): StageConfig => ({
    background: null,
    zoomLevel: 1,
    panning: { x: 0, y: 0 }
});

export const mapSceneAssetToPlaced = async (
    sceneAsset: SceneAssetData,
    getAsset: (id: string) => Promise<import('@/types/domain').Asset>
): Promise<PlacedAsset> => {
    const asset = await getAsset(sceneAsset.assetId);
    if (!asset) {
        throw new Error(`Asset ${sceneAsset.assetId} not found`);
    }
    return {
        id: `${sceneAsset.number}`,
        assetId: sceneAsset.assetId,
        asset,
        position: sceneAsset.position,
        size: sceneAsset.size,
        rotation: sceneAsset.rotation,
        layer: 'assets'
    };
};

export const mapPlacedToSceneAsset = (
    placedAsset: PlacedAsset,
    index: number = 0
): SceneAssetData => ({
    assetId: placedAsset.assetId,
    index,
    number: parseInt(placedAsset.id, 10) || index,
    name: '',
    description: null,
    resourceId: placedAsset.asset.resources[0]?.resourceId || '',
    size: placedAsset.size,
    position: placedAsset.position,
    rotation: placedAsset.rotation,
    frame: null,
    elevation: 0,
    isLocked: false,
    isVisible: true,
    controlledBy: null
});
