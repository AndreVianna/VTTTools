import { GroupName } from '@/services/layerManager';
import type {
  Asset,
  EncounterAsset,
  EncounterLightSource,
  EncounterRegion,
  EncounterSoundSource,
  EncounterWall,
  PlacedAsset,
  PlacedLightSource,
  PlacedRegion,
  PlacedSoundSource,
  PlacedWall,
} from '@/types/domain';
import { LabelPosition as LabelPositionEnum, LabelVisibility as LabelVisibilityEnum, RegionType } from '@/types/domain';
import { generateUniqueId, getDomIdByIndex, setEntityMapping } from './encounterEntityMapping';

function convertRegionTypeToString(type: string | number): string {
  if (typeof type === 'string') return type;
  return RegionType[type] ?? 'Elevation';
}

function convertRegionTypeToNumber(type: string | number): number {
  if (typeof type === 'number') return type;
  return RegionType[type as keyof typeof RegionType] ?? RegionType.Elevation;
}

function getAssetLayer(asset: Asset): GroupName {
  if (asset.classification.kind === 'Creature') {
    return GroupName.Monsters;
  }

  if (asset.classification.kind === 'Character') {
    return GroupName.Characters;
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
        domId = generateUniqueId('encounter-asset', 'assets');
        setEntityMapping(encounterId, 'assets', domId, backendIndex);
      }

      const isMonster = asset.classification.kind === 'Creature';
      const isCharacter = asset.classification.kind === 'Character';

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
        defaultVisibility = LabelVisibilityEnum.Always;

        const existingValue = localStorage.getItem(visibilityKey);
        if (existingValue === LabelVisibilityEnum.OnHover) {
          localStorage.setItem(visibilityKey, LabelVisibilityEnum.Always);
        }
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
      domId = generateUniqueId('wall', 'walls');
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
    let domId = getDomIdByIndex(encounterId, 'regions', region.index);

    if (!domId) {
      domId = generateUniqueId('region', 'regions');
      setEntityMapping(encounterId, 'regions', domId, region.index);
    }

    return {
      ...region,
      id: domId,
      type: convertRegionTypeToString(region.type),
    };
  });
}

export function dehydratePlacedRegions(placedRegions: PlacedRegion[]): EncounterRegion[] {
  return placedRegions.map(({ id, ...region }) => region);
}

export function hydratePlacedLightSources(encounterLightSources: EncounterLightSource[], encounterId: string): PlacedLightSource[] {
  return encounterLightSources.map((lightSource) => {
    let domId = getDomIdByIndex(encounterId, 'lightSources', lightSource.index);

    if (!domId) {
      domId = generateUniqueId('light-source', 'lightSources');
      setEntityMapping(encounterId, 'lightSources', domId, lightSource.index);
    }

    return {
      ...lightSource,
      id: domId,
    };
  });
}

export function dehydratePlacedLightSources(placedLightSources: PlacedLightSource[]): EncounterLightSource[] {
  return placedLightSources.map(({ id, ...lightSource }) => lightSource);
}

export function hydratePlacedSoundSources(encounterSoundSources: EncounterSoundSource[], encounterId: string): PlacedSoundSource[] {
  return encounterSoundSources.map((soundSource) => {
    let domId = getDomIdByIndex(encounterId, 'soundSources', soundSource.index);

    if (!domId) {
      domId = generateUniqueId('sound-source', 'soundSources');
      setEntityMapping(encounterId, 'soundSources', domId, soundSource.index);
    }

    return {
      ...soundSource,
      id: domId,
    };
  });
}

export function dehydratePlacedSoundSources(placedSoundSources: PlacedSoundSource[]): EncounterSoundSource[] {
  return placedSoundSources.map(({ id, ...soundSource }) => soundSource);
}
