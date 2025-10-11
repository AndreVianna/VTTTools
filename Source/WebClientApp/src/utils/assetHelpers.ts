// Asset utility functions for resource management

import { Asset, AssetResource, ResourceRole } from '@/types/domain';

/**
 * Get the first token resource (for map display)
 * @param asset - The asset containing resources
 * @returns The first resource with Token role, or undefined
 */
export function getFirstTokenResource(asset: Asset): AssetResource | undefined {
    return asset.resources?.find(r => (r.role & ResourceRole.Token) === ResourceRole.Token);
}

/**
 * Get the first display resource (for character sheets/dialogs)
 * @param asset - The asset containing resources
 * @returns The first resource with Display role, or undefined
 */
export function getFirstDisplayResource(asset: Asset): AssetResource | undefined {
    return asset.resources?.find(r => (r.role & ResourceRole.Display) === ResourceRole.Display);
}

/**
 * Get the resource URL for display
 * @param resourceId - The resource GUID
 * @param apiBaseUrl - Base URL for the API (default: localhost:7174)
 */
export function getResourceUrl(resourceId: string, apiBaseUrl: string = 'https://localhost:7174'): string {
    return `${apiBaseUrl}/api/resources/${resourceId}`;
}
