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
import { LabelPosition as LabelPositionEnum, LabelVisibility as LabelVisibilityEnum } from '@/types/domain';
import { getDomIdByIndex, setEntityMapping } from './encounterEntityMapping';

function getAssetLayer(asset: Asset): GroupName {
  if (asset.kind === 'Monster') {
    return GroupName.Monsters;
  }

  if (asset.kind === 'Character') {
    return GroupName.Characters;
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
  const assets = await Promise.all(encounterAssets.map(sa => getAsset(sa.assetId)));

  return encounterAssets
    .map((sa, arrayIndex) => {
      const asset = assets[arrayIndex];
      if (!asset) return null;

      // Handle both old format (x, y, width, height) and new format (position, size)
      const encounterAssetData = sa as EncounterAsset & {
        position?: { x: number; y: number };
        size?: { width: number; height: number };
      };
      const position = encounterAssetData.position || { x: sa.x, y: sa.y };
      const size = encounterAssetData.size || { width: sa.width, height: sa.height };

      const encounterAssetAny = sa;
      const backendIndex = encounterAssetAny.index !== undefined ? encounterAssetAny.index : arrayIndex;

      let domId = getDomIdByIndex(encounterId, 'assets', backendIndex);

      if (!domId) {
        domId = `encounter-asset-${Date.now()}-${Math.random().toString(36).substring(2, 11)}`;
        setEntityMapping(encounterId, 'assets', domId, backendIndex);
      }

      const isMonster = asset.kind === 'Monster';
      const isCharacter = asset.kind === 'Character';

      let visibilityKey: string;
      let positionKey: string;
      let defaultVisibility: LabelVisibilityEnum;

      if (isMonster) {
        visibilityKey = 'vtt-monsters-label-visibility';
        positionKey = 'vtt-monsters-label-position';
        defaultVisibility = LabelVisibilityEnum.Always;
      } else if (isCharacter) {
        visibilityKey = 'vtt-characters-label-visibility';
        positionKey = 'vtt-characters-label-position';
        defaultVisibility = LabelVisibilityEnum.OnHover;
      } else {
        visibilityKey = 'vtt-objects-label-visibility';
        positionKey = 'vtt-objects-label-position';
        defaultVisibility = LabelVisibilityEnum.OnHover;
      }

      const storedVisibility = localStorage.getItem(visibilityKey);
      const storedPosition = localStorage.getItem(positionKey);

      const defaultPosition = LabelPositionEnum.Bottom;

      const labelVisibility =
        storedVisibility && storedVisibility !== LabelVisibilityEnum.Default
          ? (storedVisibility as LabelVisibilityEnum)
          : defaultVisibility;

      const labelPosition =
        storedPosition && storedPosition !== LabelVisibilityEnum.Default
          ? (storedPosition as LabelPositionEnum)
          : defaultPosition;

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
        labelVisibility,
        labelPosition,
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
