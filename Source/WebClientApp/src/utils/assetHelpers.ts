import { Asset, AssetResource, ResourceRole } from '@/types/domain';
import { getApiEndpoints } from '@/config/development';

export function getFirstTokenResource(asset: Asset): AssetResource | undefined {
    return asset.resources?.find(r => (r.role & ResourceRole.Token) === ResourceRole.Token);
}

export function getFirstDisplayResource(asset: Asset): AssetResource | undefined {
    return asset.resources?.find(r => (r.role & ResourceRole.Display) === ResourceRole.Display);
}

export function getResourceUrl(resourceId: string): string {
    const apiEndpoints = getApiEndpoints();
    return `${apiEndpoints.media}/${resourceId}`;
}
