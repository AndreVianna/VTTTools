import apiClient from '@api/client';
import type { ResourceFilterParams, ResourceListResponse } from '@/types/resourcesAdmin';

const RESOURCES_ADMIN_API = '/api/admin/resources';

function buildFilterParams(params: ResourceFilterParams): URLSearchParams {
    const searchParams = new URLSearchParams();

    // With junction tables architecture, Resources are pure media metadata
    // filtered only by role and search text
    if (params.role) searchParams.append('role', params.role);
    if (params.searchText) searchParams.append('searchText', params.searchText);
    if (params.skip !== undefined) searchParams.append('skip', params.skip.toString());
    if (params.take !== undefined) searchParams.append('take', params.take.toString());

    return searchParams;
}

export const resourcesAdminService = {
    async listUnpublished(params: ResourceFilterParams = {}): Promise<ResourceListResponse> {
        const searchParams = buildFilterParams(params);
        const queryString = searchParams.toString();
        const url = queryString ? `${RESOURCES_ADMIN_API}?${queryString}` : RESOURCES_ADMIN_API;
        const response = await apiClient.get<ResourceListResponse>(url);
        return response.data;
    },

    getResourceImageUrl(resourceId: string): string {
        return `/api/admin/resources/image/${resourceId}`;
    },

    async approveResource(request: {
        resourceId: string;
        assetName: string;
        generationType: string;
        kind: string;
        category?: string | undefined;
        type?: string | undefined;
        subtype?: string | undefined;
        description?: string | undefined;
        tags?: string[] | undefined;
        assetId?: string | undefined;
    }): Promise<{ assetId: string }> {
        const response = await apiClient.post<{ assetId: string }>(`${RESOURCES_ADMIN_API}/approve`, request);
        return response.data;
    },

    async regenerateResource(request: {
        resourceId: string;
        assetName: string;
        generationType: string;
        kind: string;
        category?: string | undefined;
        type?: string | undefined;
        description?: string | undefined;
    }): Promise<{ resourceId: string }> {
        const response = await apiClient.post<{ resourceId: string }>(`${RESOURCES_ADMIN_API}/regenerate`, request);
        return response.data;
    },

    async rejectResource(resourceId: string): Promise<void> {
        await apiClient.post(`${RESOURCES_ADMIN_API}/reject`, { resourceId });
    },
};
