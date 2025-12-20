import apiClient from '@api/client';
import type {
    ApproveResourceRequest,
    ApproveResourceResponse,
    RegenerateResourceRequest,
    RegenerateResourceResponse,
    RejectResourceRequest,
} from '@/types/resourceApproval';

const ADMIN_RESOURCES_API_BASE = '/api/admin/resources';

export const resourceApprovalService = {
    async approveResource(request: ApproveResourceRequest): Promise<ApproveResourceResponse> {
        const response = await apiClient.post<ApproveResourceResponse>(
            `${ADMIN_RESOURCES_API_BASE}/approve`,
            request
        );
        return response.data;
    },

    async regenerateResource(request: RegenerateResourceRequest): Promise<RegenerateResourceResponse> {
        const response = await apiClient.post<RegenerateResourceResponse>(
            `${ADMIN_RESOURCES_API_BASE}/regenerate`,
            request
        );
        return response.data;
    },

    async rejectResource(request: RejectResourceRequest): Promise<void> {
        await apiClient.post(`${ADMIN_RESOURCES_API_BASE}/reject`, request);
    },

    getResourceImageUrl(resourceId: string): string {
        return `/api/resources/${resourceId}`;
    },
};
