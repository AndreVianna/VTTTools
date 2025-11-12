import { getApiEndpoints } from '@/config/development';
import type { Asset, AssetToken, MediaResource } from '@/types/domain';

export function getDefaultToken(asset: Asset): AssetToken | undefined {
  return asset.tokens?.find((t) => t.isDefault);
}

export function getPortrait(asset: Asset): MediaResource | undefined {
  return asset.portrait;
}

export function getResourceUrl(resourceId: string): string {
  const apiEndpoints = getApiEndpoints();
  return `${apiEndpoints.media}/${resourceId}`;
}
