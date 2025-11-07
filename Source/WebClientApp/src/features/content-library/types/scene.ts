import type { ContentListItem } from './contentListItem';
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

export interface Scene extends ContentListItem {
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
    getAsset: (id: string) => Promise<import('@/types/domain').Asset>,
    gridConfig: GridConfig
): Promise<PlacedAsset> => {
    const asset = await getAsset(sceneAsset.assetId);
    if (!asset) {
        throw new Error(`Asset ${sceneAsset.assetId} not found`);
    }

    const cellWidth = gridConfig.cellSize.width;
    const cellHeight = gridConfig.cellSize.height;

    return {
        id: `placed-${sceneAsset.index}`,
        assetId: sceneAsset.assetId,
        asset,
        position: {
            x: sceneAsset.position.x * cellWidth,
            y: sceneAsset.position.y * cellHeight
        },
        size: {
            width: sceneAsset.size.width * cellWidth,
            height: sceneAsset.size.height * cellHeight
        },
        rotation: sceneAsset.rotation,
        layer: 'assets',
        index: sceneAsset.index,
        number: sceneAsset.number,
        name: sceneAsset.name || asset.name
    };
};

export const mapPlacedToSceneAsset = (
    placedAsset: PlacedAsset,
    index: number,
    gridConfig: GridConfig
): SceneAssetData => {
    const cellWidth = gridConfig.cellSize.width;
    const cellHeight = gridConfig.cellSize.height;

    const defaultToken = placedAsset.asset.tokens?.find(t => t.isDefault);
    const resourceId = defaultToken?.token.id || placedAsset.asset.tokens?.[0]?.token.id || '';

    return {
        assetId: placedAsset.assetId,
        index,
        number: index + 1,
        name: '',
        description: null,
        resourceId,
        size: {
            width: Math.round(placedAsset.size.width / cellWidth),
            height: Math.round(placedAsset.size.height / cellHeight)
        },
        position: {
            x: Math.round(placedAsset.position.x / cellWidth),
            y: Math.round(placedAsset.position.y / cellHeight)
        },
        rotation: placedAsset.rotation,
        frame: null,
        elevation: 0,
        isLocked: false,
        isVisible: true,
        controlledBy: null
    };
};
