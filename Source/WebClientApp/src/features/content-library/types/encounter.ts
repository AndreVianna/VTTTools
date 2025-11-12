import { LabelPosition, LabelVisibility, type MediaResource, type PlacedAsset } from '@/types/domain';
import type { GridConfig } from '@/utils/gridCalculator';

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

export interface EncounterAssetData {
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

export interface EncounterListItem {
  id: string;
  name: string;
  description: string;
  isPublished: boolean;
  ownerId: string;
  adventureId: string | null;
  grid: GridConfig;
  stage: StageConfig;
  assets: EncounterAssetData[];
}

export interface CreateEncounterRequest {
  name: string;
  description?: string;
  adventureId?: string | null;
  grid?: GridConfig;
  stage?: StageConfig;
}

export interface UpdateEncounterRequest {
  id: string;
  name?: string;
  description?: string;
  adventureId?: string | null;
  isPublished?: boolean;
  grid?: GridConfig;
  stage?: StageConfig;
  assets?: EncounterAssetData[];
}

export interface EncounterMetadata {
  gridType: string;
  assetCount: number;
  lastModified: string;
}

export const getDefaultGrid = (): GridConfig => ({
  type: 1,
  cellSize: { width: 50, height: 50 },
  offset: { left: 0, top: 0 },
  snap: true,
});

export const getDefaultStage = (): StageConfig => ({
  background: null,
  zoomLevel: 1,
  panning: { x: 0, y: 0 },
});

export const mapEncounterAssetToPlaced = async (
  encounterAsset: EncounterAssetData,
  getAsset: (id: string) => Promise<import('@/types/domain').Asset>,
  gridConfig: GridConfig,
): Promise<PlacedAsset> => {
  const asset = await getAsset(encounterAsset.assetId);
  if (!asset) {
    throw new Error(`Asset ${encounterAsset.assetId} not found`);
  }

  const cellWidth = gridConfig.cellSize.width;
  const cellHeight = gridConfig.cellSize.height;

  return {
    id: `placed-${encounterAsset.index}`,
    assetId: encounterAsset.assetId,
    asset,
    position: {
      x: encounterAsset.position.x * cellWidth,
      y: encounterAsset.position.y * cellHeight,
    },
    size: {
      width: encounterAsset.size.width * cellWidth,
      height: encounterAsset.size.height * cellHeight,
    },
    rotation: encounterAsset.rotation,
    layer: 'assets',
    index: encounterAsset.index,
    number: encounterAsset.number,
    name: encounterAsset.name || asset.name,
    visible: encounterAsset.isVisible,
    locked: encounterAsset.isLocked,
    labelVisibility: LabelVisibility.Always,
    labelPosition: LabelPosition.Bottom,
  };
};

export const mapPlacedToEncounterAsset = (
  placedAsset: PlacedAsset,
  index: number,
  gridConfig: GridConfig,
): EncounterAssetData => {
  const cellWidth = gridConfig.cellSize.width;
  const cellHeight = gridConfig.cellSize.height;

  const defaultToken = placedAsset.asset.tokens?.find((t) => t.isDefault);
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
      height: Math.round(placedAsset.size.height / cellHeight),
    },
    position: {
      x: Math.round(placedAsset.position.x / cellWidth),
      y: Math.round(placedAsset.position.y / cellHeight),
    },
    rotation: placedAsset.rotation,
    frame: null,
    elevation: 0,
    isLocked: placedAsset.locked,
    isVisible: placedAsset.visible,
    controlledBy: null,
  };
};
