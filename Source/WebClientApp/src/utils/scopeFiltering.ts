import type { PlacedAsset } from '@/types/domain';

export type InteractionScope =
  | 'regions'
  | 'walls'
  | 'objects'
  | 'monsters'
  | 'characters'
  | 'lights'
  | 'sounds'
  | 'fogOfWar'
  | null;

export function isAssetInScope(asset: PlacedAsset | undefined, scope: InteractionScope | undefined): boolean {
  if (!asset) {
    return false;
  }

  if (scope === null || scope === undefined) {
    return false;
  }

  const assetKind = asset.asset.classification.kind;

  switch (scope) {
    case 'objects':
      return assetKind === 'Object';
    case 'monsters':
      return assetKind === 'Creature';
    case 'characters':
      return assetKind === 'Character';
    case 'regions':
    case 'walls':
    case 'lights':
    case 'sounds':
    case 'fogOfWar':
      return false;
    default:
      return false;
  }
}

export function isWallInScope(scope: InteractionScope | undefined): boolean {
  return scope === 'walls';
}

export function isOpeningInScope(scope: InteractionScope | undefined): boolean {
  return scope === 'walls';
}

export function isRegionInScope(scope: InteractionScope | undefined): boolean {
  return scope === 'regions';
}

export function isSourceInScope(scope: InteractionScope | undefined): boolean {
  return scope === 'lights' || scope === 'sounds';
}
