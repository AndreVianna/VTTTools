import type { Asset, MediaResource } from '../types/domain';

export function getDefaultAssetImage(asset: Asset): MediaResource | null {
  return asset.tokens[0] ?? asset.portrait ?? null;
}

export interface MediaUrlConfig {
  mediaBaseUrl: string;
}

let mediaConfig: MediaUrlConfig = {
  mediaBaseUrl: '',
};

export function configureMediaUrls(config: MediaUrlConfig): void {
  mediaConfig = { ...config };
}

export function getResourceUrl(resourceId: string): string {
  return `${mediaConfig.mediaBaseUrl}/${resourceId}`;
}
