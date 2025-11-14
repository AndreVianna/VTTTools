import type { PlacedAsset } from '@/types/domain';

export type InteractionScope =
  | 'regions'
  | 'walls'
  | 'openings'
  | 'objects'
  | 'monsters'
  | 'characters'
  | 'effects'
  | 'sources'
  | 'fogOfWar'
  | null;

export function isAssetInScope(asset: PlacedAsset | undefined, scope: InteractionScope | undefined): boolean {
  if (!asset) {
    return false;
  }

  if (scope === null || scope === undefined) {
    return true;
  }

  switch (scope) {
    case 'objects':
      return asset.asset.kind === 'Object';
    case 'monsters':
      return asset.asset.kind === 'Monster';
    case 'characters':
      return asset.asset.kind === 'Character';
    case 'effects':
      return false;
    case 'regions':
    case 'walls':
    case 'openings':
    case 'sources':
    case 'fogOfWar':
      return false;
    default:
      return false;
  }
}

export function isWallInScope(scope: InteractionScope | undefined): boolean {
  return scope === null || scope === undefined ? true : scope === 'walls';
}

export function isOpeningInScope(scope: InteractionScope | undefined): boolean {
  return scope === null || scope === undefined ? true : scope === 'openings';
}

export function isRegionInScope(scope: InteractionScope | undefined): boolean {
  return scope === null || scope === undefined ? true : scope === 'regions';
}

export function isSourceInScope(scope: InteractionScope | undefined): boolean {
  return scope === null || scope === undefined ? true : scope === 'sources';
}
