import type { MediaResource } from '@/types/domain';
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
