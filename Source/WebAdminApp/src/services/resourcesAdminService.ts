import apiClient from '@api/client';
import type { ResourceFilterParams, ResourceListResponse } from '@/types/resourcesAdmin';

const RESOURCES_ADMIN_API = '/api/admin/resources';

function buildFilterParams(params: ResourceFilterParams): URLSearchParams {
    const searchParams = new URLSearchParams();

    if (params.resourceType) searchParams.append('resourceType', params.resourceType);
    if (params.contentKind) searchParams.append('contentKind', params.contentKind);
    if (params.category) searchParams.append('category', params.category);
    if (params.searchText) searchParams.append('searchText', params.searchText);
    if (params.isPublished !== undefined) searchParams.append('isPublished', params.isPublished.toString());
    if (params.isPublic !== undefined) searchParams.append('isPublic', params.isPublic.toString());
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

    async updateResource(
        resourceId: string,
        update: {
            description?: string | null;
            classification?: {
                kind: string;
                category: string;
                type: string;
                subtype?: string | null;
            };
        }
    ): Promise<void> {
        await apiClient.patch(`${RESOURCES_ADMIN_API}/${resourceId}`, update);
    },
};
