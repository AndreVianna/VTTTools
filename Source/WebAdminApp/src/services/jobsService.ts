import apiClient from '@api/client';
import type {
    JobResponse,
    JobListResponse,
    JobType,
    BulkAssetGenerationRequest,
    JobRetryRequest,
} from '@/types/jobs';

const JOBS_API_BASE = '/api/jobs';
const AI_API_BASE = '/api/ai';

export interface JobHistoryParams {
    jobType?: JobType;
    skip?: number;
    take?: number;
}

function buildJobHistoryParams(params: JobHistoryParams): URLSearchParams {
    const searchParams = new URLSearchParams();

    if (params.jobType !== undefined) searchParams.append('jobType', params.jobType);
    if (params.skip !== undefined) searchParams.append('skip', params.skip.toString());
    if (params.take !== undefined) searchParams.append('take', params.take.toString());

    return searchParams;
}

export const jobsService = {
    async getJobHistory(params: JobHistoryParams = {}): Promise<JobListResponse> {
        const searchParams = buildJobHistoryParams(params);
        const queryString = searchParams.toString();
        const url = queryString ? `${JOBS_API_BASE}?${queryString}` : JOBS_API_BASE;
        const response = await apiClient.get<JobListResponse>(url);
        return response.data;
    },

    async getJobStatus(jobId: string): Promise<JobResponse> {
        const response = await apiClient.get<JobResponse>(`${JOBS_API_BASE}/${jobId}`);
        return response.data;
    },

    async cancelJob(jobId: string): Promise<void> {
        await apiClient.patch(`${JOBS_API_BASE}/${jobId}/status`, { status: 'Cancelled' });
    },

    async retryJob(request: JobRetryRequest): Promise<JobResponse> {
        const response = await apiClient.post<JobResponse>(`${JOBS_API_BASE}/retry`, request);
        return response.data;
    },

    async startBulkGeneration(request: BulkAssetGenerationRequest): Promise<JobResponse> {
        const response = await apiClient.post<JobResponse>(`${AI_API_BASE}/bulk-generation`, request);
        return response.data;
    },
};
