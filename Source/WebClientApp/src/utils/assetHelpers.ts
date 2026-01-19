import { getApiEndpoints } from '@/config/development';
import type { Asset, MediaResource } from '@/types/domain';

export function getDefaultAssetImage(asset: Asset): MediaResource | null {
  return asset.tokens?.[0] ?? asset.portrait ?? null;
}

export function getResourceUrl(resourceId: string): string {
  const apiEndpoints = getApiEndpoints();
  return `${apiEndpoints.media}/${resourceId}`;
}
