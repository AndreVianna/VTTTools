// Asset utility functions for resource management

import { Asset, AssetResource, ResourceRole } from '@/types/domain';

/**
 * Get the default resource for a specific role
 * @param asset - The asset containing resources
 * @param role - The role to search for (Token or Portrait)
 * @returns The default resource for the role, or the first matching resource, or undefined
 */
export function getDefaultResourceForRole(asset: Asset, role: ResourceRole): AssetResource | undefined {
    // Find default resource with this role
    const defaultResource = asset.resources.find(
        r => r.isDefault && (r.role & role) === role
    );

    if (defaultResource) return defaultResource;

    // Fallback: Find any resource with this role
    return asset.resources.find(r => (r.role & role) === role);
}

/**
 * Get the default token resource (for map display)
 */
export function getDefaultTokenResource(asset: Asset): AssetResource | undefined {
    return getDefaultResourceForRole(asset, ResourceRole.Token);
}

/**
 * Get the default portrait resource (for character sheets/dialogs)
 */
export function getDefaultPortraitResource(asset: Asset): AssetResource | undefined {
    return getDefaultResourceForRole(asset, ResourceRole.Portrait);
}

/**
 * Get the resource URL for display
 * @param resourceId - The resource GUID
 * @param apiBaseUrl - Base URL for the API (default: localhost:7174)
 */
export function getResourceUrl(resourceId: string, apiBaseUrl: string = 'https://localhost:7174'): string {
    return `${apiBaseUrl}/api/resources/${resourceId}`;
}
