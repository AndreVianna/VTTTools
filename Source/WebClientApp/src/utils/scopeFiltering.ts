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

export function isAssetInScope(asset: PlacedAsset | undefined, scope: InteractionScope): boolean {
  if (!asset) return false;
  if (scope === null) return false;

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

export function isWallInScope(scope: InteractionScope): boolean {
  if (scope === null) return false;
  return scope === 'walls';
}

export function isOpeningInScope(scope: InteractionScope): boolean {
  if (scope === null) return false;
  return scope === 'openings';
}

export function isRegionInScope(scope: InteractionScope): boolean {
  if (scope === null) return false;
  return scope === 'regions';
}

export function isSourceInScope(scope: InteractionScope): boolean {
  if (scope === null) return false;
  return scope === 'sources';
}

export function canInteract(scope: InteractionScope): boolean {
  return scope !== null;
}
