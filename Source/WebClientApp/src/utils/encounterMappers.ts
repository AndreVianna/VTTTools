import { GroupName } from '@/services/layerManager';
import type {
  Asset,
  EncounterAsset,
  EncounterRegion,
  EncounterSource,
  EncounterWall,
  ObjectAsset,
  PlacedAsset,
  PlacedRegion,
  PlacedSource,
  PlacedWall,
} from '@/types/domain';
import { DisplayName as DisplayNameEnum, LabelPosition as LabelPositionEnum } from '@/types/domain';
import { getDomIdByIndex, setEntityMapping } from './encounterEntityMapping';

/**
 * Encounter Asset Mappers - Convert between backend and frontend representations
 *
 * Backend (EncounterAsset): Stores asset references only (assetId)
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
  encounterAssets: EncounterAsset[],
  encounterId: string,
  getAsset: (assetId: string) => Promise<Asset>,
): Promise<PlacedAsset[]> {
  const assetPromises = encounterAssets.map((sa) => getAsset(sa.assetId));
  const assets = await Promise.all(assetPromises);

  return encounterAssets
    .map((sa, arrayIndex) => {
      const asset = assets[arrayIndex];
      if (!asset) return null;

      const position =
        'position' in sa ? { x: (sa as any).position.x, y: (sa as any).position.y } : { x: sa.x, y: sa.y };

      const size =
        'size' in sa
          ? { width: (sa as any).size.width, height: (sa as any).size.height }
          : { width: sa.width, height: sa.height };

      const encounterAssetAny = sa as any;
      const backendIndex = encounterAssetAny.index !== undefined ? encounterAssetAny.index : arrayIndex;

      let domId = getDomIdByIndex(encounterId, 'assets', backendIndex);

      if (!domId) {
        domId = `encounter-asset-${Date.now()}-${Math.random().toString(36).substring(2, 11)}`;
        setEntityMapping(encounterId, 'assets', domId, backendIndex);
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
        number: encounterAssetAny.number !== undefined ? encounterAssetAny.number : 1,
        name: encounterAssetAny.name || asset.name,
        visible: encounterAssetAny.visible !== undefined ? encounterAssetAny.visible : true,
        locked: encounterAssetAny.locked !== undefined ? encounterAssetAny.locked : false,
        displayName: encounterAssetAny.displayName || DisplayNameEnum.Default,
        labelPosition: encounterAssetAny.labelPosition || LabelPositionEnum.Default,
      };
      return placedAsset;
    })
    .filter((pa): pa is PlacedAsset => pa !== null);
}

export function dehydratePlacedAssets(placedAssets: PlacedAsset[], encounterId: string): EncounterAsset[] {
  return placedAssets.map((pa) => ({
    id: pa.id,
    encounterId,
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
    asset: pa.asset,
  }));
}

export function hydratePlacedWalls(encounterWalls: EncounterWall[], encounterId: string): PlacedWall[] {
  return encounterWalls.map((wall) => {
    const backendIndex = wall.index;

    let domId = getDomIdByIndex(encounterId, 'walls', backendIndex);

    if (!domId) {
      domId = `wall-${Date.now()}-${Math.random().toString(36).substring(2, 11)}`;
      setEntityMapping(encounterId, 'walls', domId, backendIndex);
    }

    const placedWall: PlacedWall = {
      ...wall,
      id: domId,
    };

    return placedWall;
  });
}

export function dehydratePlacedWalls(placedWalls: PlacedWall[]): EncounterWall[] {
  return placedWalls.map(({ id, ...wall }) => wall);
}

export function hydratePlacedRegions(encounterRegions: EncounterRegion[], encounterId: string): PlacedRegion[] {
  return encounterRegions.map((region) => {
    const domId =
      getDomIdByIndex(encounterId, 'regions', region.index) ||
      `region-${Date.now()}-${Math.random().toString(36).substring(2, 11)}`;

    if (!getDomIdByIndex(encounterId, 'regions', region.index)) {
      setEntityMapping(encounterId, 'regions', domId, region.index);
    }

    return {
      ...region,
      id: domId,
    };
  });
}

export function dehydratePlacedRegions(placedRegions: PlacedRegion[]): EncounterRegion[] {
  return placedRegions.map(({ id, ...region }) => region);
}

export function hydratePlacedSources(encounterSources: EncounterSource[], encounterId: string): PlacedSource[] {
  return encounterSources.map((source) => {
    const domId =
      getDomIdByIndex(encounterId, 'sources', source.index) ||
      `source-${Date.now()}-${Math.random().toString(36).substring(2, 11)}`;

    if (!getDomIdByIndex(encounterId, 'sources', source.index)) {
      setEntityMapping(encounterId, 'sources', domId, source.index);
    }

    return {
      ...source,
      id: domId,
    };
  });
}

export function dehydratePlacedSources(placedSources: PlacedSource[]): EncounterSource[] {
  return placedSources.map(({ id, ...source }) => source);
}
