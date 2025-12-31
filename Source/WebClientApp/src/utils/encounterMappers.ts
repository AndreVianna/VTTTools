import { GroupName } from '@/services/layerManager';
import type {
  Asset,
  EncounterActor,
  EncounterAsset,
  EncounterEffect,
  EncounterLightSource,
  EncounterObject,
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
import type { StageLight, StageRegion, StageSound, StageWall } from '@/types/stage';
import { generateUniqueId, getDomIdByIndex, setEntityMapping } from './encounterEntityMapping';

// Union types for Stage and Encounter entities (supports both old and new structures)
type WallLike = EncounterWall | StageWall;
type RegionLike = EncounterRegion | StageRegion;
type LightSourceLike = EncounterLightSource | StageLight;
type SoundSourceLike = EncounterSoundSource | StageSound;

function convertRegionTypeToString(type: string): string {
  return type ?? RegionType.Elevation;
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

function getLabelSettings(asset: Asset): { visibility: LabelVisibilityEnum; position: LabelPositionEnum } {
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
  } else {
    visibilityKey = 'vtt-objects-label-visibility';
    positionKey = 'vtt-objects-label-position';
    defaultVisibility = LabelVisibilityEnum.OnHover;
  }

  const storedVisibility = localStorage.getItem(visibilityKey);
  const storedPosition = localStorage.getItem(positionKey);
  const defaultPosition = LabelPositionEnum.Bottom;

  return {
    visibility: storedVisibility && storedVisibility !== LabelVisibilityEnum.Default
      ? (storedVisibility as LabelVisibilityEnum)
      : defaultVisibility,
    position: storedPosition && storedPosition !== LabelVisibilityEnum.Default
      ? (storedPosition as LabelPositionEnum)
      : defaultPosition,
  };
}

// NEW: Direct hydration functions for backend types (no legacy EncounterAsset conversion)

export function hydrateActors(actors: EncounterActor[], encounterId: string): PlacedAsset[] {
  return actors.map((actor) => {
    const domId = getDomIdByIndex(encounterId, 'actors', actor.index)
      ?? (() => {
        const newId = generateUniqueId('actor', 'actors');
        setEntityMapping(encounterId, 'actors', newId, actor.index);
        return newId;
      })();

    const labels = getLabelSettings(actor.asset);

    return {
      id: domId,
      assetId: actor.asset.id,
      asset: actor.asset,
      position: { x: actor.position.x, y: actor.position.y },
      size: { width: actor.size.width, height: actor.size.height },
      rotation: actor.rotation,
      layer: getAssetLayer(actor.asset),
      index: actor.index,
      number: actor.index,
      name: actor.name ?? actor.asset.name,
      isHidden: actor.isHidden,
      isLocked: actor.isLocked,
      labelVisibility: labels.visibility,
      labelPosition: labels.position,
    };
  });
}

export function hydrateObjects(objects: EncounterObject[], encounterId: string): PlacedAsset[] {
  return objects.map((obj) => {
    const domId = getDomIdByIndex(encounterId, 'objects', obj.index)
      ?? (() => {
        const newId = generateUniqueId('object', 'objects');
        setEntityMapping(encounterId, 'objects', newId, obj.index);
        return newId;
      })();

    const labels = getLabelSettings(obj.asset);

    return {
      id: domId,
      assetId: obj.asset.id,
      asset: obj.asset,
      position: { x: obj.position.x, y: obj.position.y },
      size: { width: obj.size.width, height: obj.size.height },
      rotation: obj.rotation,
      layer: GroupName.Objects,
      index: obj.index,
      number: obj.index,
      name: obj.name ?? obj.asset.name,
      isHidden: obj.isHidden,
      isLocked: obj.isLocked,
      labelVisibility: labels.visibility,
      labelPosition: labels.position,
    };
  });
}

export function hydrateEffects(effects: EncounterEffect[], encounterId: string): PlacedAsset[] {
  return effects.map((effect) => {
    const domId = getDomIdByIndex(encounterId, 'effects', effect.index)
      ?? (() => {
        const newId = generateUniqueId('effect', 'effects');
        setEntityMapping(encounterId, 'effects', newId, effect.index);
        return newId;
      })();

    const labels = getLabelSettings(effect.asset);

    return {
      id: domId,
      assetId: effect.asset.id,
      asset: effect.asset,
      position: { x: effect.position.x, y: effect.position.y },
      size: { width: 50, height: 50 }, // Effects don't have size in backend
      rotation: effect.rotation,
      layer: GroupName.Objects, // Effects render on objects layer
      index: effect.index,
      number: effect.index,
      name: effect.name ?? effect.asset.name,
      isHidden: effect.isHidden,
      isLocked: false,
      labelVisibility: labels.visibility,
      labelPosition: labels.position,
    };
  });
}

// Combines all game elements into PlacedAssets (replaces combineGameElementsToLegacyAssets + hydratePlacedAssets)
export function hydrateGameElements(
  actors: EncounterActor[],
  objects: EncounterObject[],
  effects: EncounterEffect[],
  encounterId: string,
): PlacedAsset[] {
  const hydratedActors = hydrateActors(actors, encounterId);
  const hydratedObjects = hydrateObjects(objects, encounterId);
  const hydratedEffects = hydrateEffects(effects, encounterId);

  return [
    ...hydratedActors,
    ...hydratedObjects,
    ...hydratedEffects,
  ];
}

// LEGACY: Keep for backwards compatibility during transition
export async function hydratePlacedAssets(
  encounterAssets: EncounterAsset[],
  encounterId: string,
  getAsset: (assetId: string) => Promise<Asset>,
): Promise<PlacedAsset[]> {
  // Filter out assets with invalid IDs before making API calls
  const validAssets = encounterAssets.filter(
    sa => sa.assetId && sa.assetId !== 'undefined' && sa.assetId.length > 0
  );

  // Only fetch assets that aren't already included in the data
  const assets = await Promise.all(validAssets.map(async (sa) => {
    // Use pre-included asset if available, otherwise fetch from API
    if (sa.asset) return sa.asset;
    return getAsset(sa.assetId);
  }));

  return validAssets
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
        isHidden: encounterAssetAny.isHidden !== undefined ? encounterAssetAny.isHidden : false,
        isLocked: encounterAssetAny.isLocked !== undefined ? encounterAssetAny.isLocked : false,
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
    isHidden: false,
    isLocked: false,
    asset: pa.asset,
  }));
}

export function hydratePlacedWalls(encounterWalls: WallLike[], encounterId: string): PlacedWall[] {
  return encounterWalls.map((wall) => {
    const backendIndex = wall.index;

    let domId = getDomIdByIndex(encounterId, 'walls', backendIndex);

    if (!domId) {
      domId = generateUniqueId('wall', 'walls');
      setEntityMapping(encounterId, 'walls', domId, backendIndex);
    }

    const placedWall: PlacedWall = {
      ...(wall as EncounterWall),
      id: domId,
    };

    return placedWall;
  });
}

export function dehydratePlacedWalls(placedWalls: PlacedWall[]): EncounterWall[] {
  return placedWalls.map(({ id, ...wall }) => wall);
}

export function hydratePlacedRegions(encounterRegions: RegionLike[], encounterId: string): PlacedRegion[] {
  return encounterRegions.map((region) => {
    let domId = getDomIdByIndex(encounterId, 'regions', region.index);

    if (!domId) {
      domId = generateUniqueId('region', 'regions');
      setEntityMapping(encounterId, 'regions', domId, region.index);
    }

    // Handle both EncounterRegion (Point[]) and StageRegion (StageRegionVertex[]) vertices
    const vertices = region.vertices.map((v) => ({ x: v.x, y: v.y }));

    return {
      ...(region as EncounterRegion),
      vertices,
      id: domId,
      type: convertRegionTypeToString(String(region.type)),
    };
  });
}

export function dehydratePlacedRegions(placedRegions: PlacedRegion[]): EncounterRegion[] {
  return placedRegions.map(({ id, ...region }) => region);
}

export function hydratePlacedLightSources(encounterLightSources: LightSourceLike[], encounterId: string): PlacedLightSource[] {
  return encounterLightSources.map((lightSource) => {
    let domId = getDomIdByIndex(encounterId, 'lightSources', lightSource.index);

    if (!domId) {
      domId = generateUniqueId('light-source', 'lightSources');
      setEntityMapping(encounterId, 'lightSources', domId, lightSource.index);
    }

    return {
      ...(lightSource as EncounterLightSource),
      id: domId,
    };
  });
}

export function dehydratePlacedLightSources(placedLightSources: PlacedLightSource[]): EncounterLightSource[] {
  return placedLightSources.map(({ id, ...lightSource }) => lightSource);
}

export function hydratePlacedSoundSources(encounterSoundSources: SoundSourceLike[], encounterId: string): PlacedSoundSource[] {
  return encounterSoundSources.map((soundSource) => {
    let domId = getDomIdByIndex(encounterId, 'soundSources', soundSource.index);

    if (!domId) {
      domId = generateUniqueId('sound-source', 'soundSources');
      setEntityMapping(encounterId, 'soundSources', domId, soundSource.index);
    }

    return {
      ...(soundSource as StageSound),
      id: domId,
    };
  });
}

export function dehydratePlacedSoundSources(placedSoundSources: PlacedSoundSource[]): EncounterSoundSource[] {
  return placedSoundSources.map(({ id, ...soundSource }) => soundSource);
}
