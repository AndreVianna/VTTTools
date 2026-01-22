import apiClient from '@api/client';
import type {
    IngestAssetListResponse,
    IngestJobResponse,
    IngestAssetsRequest,
    ApproveAssetsRequest,
    RejectAssetsRequest,
    DiscardAssetsRequest,
    RetryFailedRequest,
    IngestBatchResponse,
} from '@/types/ingest';

const INGEST_API_BASE = '/api/admin/ingest';

export interface PaginationParams {
    skip?: number;
    take?: number;
}

function buildQueryParams(params: PaginationParams): URLSearchParams {
    const searchParams = new URLSearchParams();
    if (params.skip !== undefined) searchParams.append('skip', params.skip.toString());
    if (params.take !== undefined) searchParams.append('take', params.take.toString());
    return searchParams;
}

export const ingestService = {
    async ingestAssets(request: IngestAssetsRequest): Promise<IngestJobResponse> {
        const response = await apiClient.post<IngestJobResponse>(INGEST_API_BASE, request);
        return response.data;
    },

    async approveAssets(request: ApproveAssetsRequest): Promise<IngestBatchResponse> {
        const response = await apiClient.post<IngestBatchResponse>(`${INGEST_API_BASE}/approve`, request);
        return response.data;
    },

    async rejectAssets(request: RejectAssetsRequest): Promise<IngestJobResponse> {
        const response = await apiClient.post<IngestJobResponse>(`${INGEST_API_BASE}/reject`, request);
        return response.data;
    },

    async discardAssets(request: DiscardAssetsRequest): Promise<IngestBatchResponse> {
        const response = await apiClient.post<IngestBatchResponse>(`${INGEST_API_BASE}/discard`, request);
        return response.data;
    },

    async retryFailed(request: RetryFailedRequest): Promise<IngestJobResponse> {
        const response = await apiClient.post<IngestJobResponse>(`${INGEST_API_BASE}/retry`, request);
        return response.data;
    },

    async getProcessingAssets(params: PaginationParams = {}): Promise<IngestAssetListResponse> {
        const searchParams = buildQueryParams(params);
        const queryString = searchParams.toString();
        const url = queryString
            ? `${INGEST_API_BASE}/processing?${queryString}`
            : `${INGEST_API_BASE}/processing`;
        const response = await apiClient.get<IngestAssetListResponse>(url);
        return response.data;
    },

    async getReviewAssets(params: PaginationParams = {}): Promise<IngestAssetListResponse> {
        const searchParams = buildQueryParams(params);
        const queryString = searchParams.toString();
        const url = queryString
            ? `${INGEST_API_BASE}/review?${queryString}`
            : `${INGEST_API_BASE}/review`;
        const response = await apiClient.get<IngestAssetListResponse>(url);
        return response.data;
    },

    async getHistoryAssets(params: PaginationParams = {}): Promise<IngestAssetListResponse> {
        const searchParams = buildQueryParams(params);
        const queryString = searchParams.toString();
        const url = queryString
            ? `${INGEST_API_BASE}/history?${queryString}`
            : `${INGEST_API_BASE}/history`;
        const response = await apiClient.get<IngestAssetListResponse>(url);
        return response.data;
    },
};
