import apiClient from '@api/client';
import type {
    JobResponse,
    JobListResponse,
    JobType,
    BulkAssetGenerationRequest,
    JobRetryRequest,
    JobItemResponse,
} from '@/types/jobs';
import { JobStatus, JobItemStatus } from '@/types/jobs';

const JOBS_API_BASE = '/api/jobs';
const AI_API_BASE = '/api/ai';

export interface JobHistoryParams {
    jobType?: JobType;
    skip?: number;
    take?: number;
}

interface BackendJobItem {
    index: number;
    status: JobItemStatus | number; // Backend sends 0-4 or 'Pending'/'InProgress'/'Success'/'Failed'/'Canceled'
    data: string;
    result?: string;
    message?: string;
    startedAt?: string;
    completedAt?: string;
}

function mapItemStatusToFrontend(status: JobItemStatus | number): JobItemStatus {
    // Backend may serialize enums as numbers (0=Pending, 1=InProgress, 2=Success, 3=Failed, 4=Canceled)
    if (typeof status === 'number') {
        const statusMap: JobItemStatus[] = [
            JobItemStatus.Pending,
            JobItemStatus.InProgress,
            JobItemStatus.Success,
            JobItemStatus.Failed,
            JobItemStatus.Canceled,
        ];
        return statusMap[status] ?? JobItemStatus.Pending;
    }
    return status;
}

interface BackendJob {
    id: string;
    ownerId: string;
    type: string;
    status: string | number; // Backend sends 0/1/2/3 or 'Pending'/'InProgress'/'Canceled'/'Completed'
    estimatedDuration?: string;
    startedAt?: string;
    completedAt?: string;
    items: BackendJobItem[];
}

interface BackendJobListResponse {
    data: BackendJob[];
    skip: number;
    take: number;
    totalCount: number;
}

function mapJobItemToResponse(item: BackendJobItem, jobId: string): JobItemResponse {
    return {
        itemId: `${jobId}-${item.index}`,
        jobId,
        index: item.index,
        status: mapItemStatusToFrontend(item.status),
        ...(item.data && { inputJson: item.data }),
        ...(item.result !== undefined && { result: item.result }),
        ...(item.message !== undefined && { errorMessage: item.message }),
        ...(item.startedAt !== undefined && { startedAt: item.startedAt }),
        ...(item.completedAt !== undefined && { completedAt: item.completedAt }),
    };
}

function mapJobStatusToFrontend(backendStatus: string | number): JobStatus {
    // Backend may serialize enums as numbers (0=Pending, 1=InProgress, 2=Canceled, 3=Completed)
    // or strings ('Pending', 'InProgress', 'Canceled', 'Completed')
    const statusStr = typeof backendStatus === 'number'
        ? ['Pending', 'InProgress', 'Canceled', 'Completed'][backendStatus] ?? 'Pending'
        : backendStatus;

    switch (statusStr) {
        case 'Completed':
            return JobStatus.Completed;
        case 'Pending':
            return JobStatus.Pending;
        case 'InProgress':
            return JobStatus.InProgress;
        case 'Canceled':
            return JobStatus.Canceled;
        default:
            return JobStatus.Pending;
    }
}

function mapJobToResponse(job: BackendJob): JobResponse {
    const items = job.items ?? [];
    const completedItems = items.filter(i => mapItemStatusToFrontend(i.status) === JobItemStatus.Success).length;
    const failedItems = items.filter(i => mapItemStatusToFrontend(i.status) === JobItemStatus.Failed).length;

    const estimatedDurationMs = job.estimatedDuration ? parseDurationToMs(job.estimatedDuration) : undefined;
    const actualDurationMs = job.startedAt && job.completedAt
        ? new Date(job.completedAt).getTime() - new Date(job.startedAt).getTime()
        : undefined;

    const frontendStatus = mapJobStatusToFrontend(job.status);

    return {
        jobId: job.id,
        jobType: job.type as JobType,
        status: frontendStatus,
        totalItems: items.length,
        completedItems,
        failedItems,
        createdAt: job.startedAt ?? new Date().toISOString(),
        items: items.map(item => mapJobItemToResponse(item, job.id)),
        ...(estimatedDurationMs !== undefined && { estimatedDurationMs }),
        ...(actualDurationMs !== undefined && { actualDurationMs }),
        ...(job.startedAt !== undefined && { startedAt: job.startedAt }),
        ...(job.completedAt !== undefined && { completedAt: job.completedAt }),
    };
}

function parseDurationToMs(duration: string): number {
    if (duration.includes(':')) {
        const parts = duration.split(':');
        if (parts.length === 3) {
            const hours = parseInt(parts[0] ?? '0', 10);
            const minutes = parseInt(parts[1] ?? '0', 10);
            const secondsWithMs = parseFloat(parts[2] ?? '0');
            return (hours * 3600 + minutes * 60 + secondsWithMs) * 1000;
        }
    }
    return 0;
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
        const response = await apiClient.get<BackendJobListResponse>(url);
        const jobs = (response.data.data ?? []).map(mapJobToResponse);
        return {
            jobs,
            totalCount: response.data.totalCount,
        };
    },

    async getJobStatus(jobId: string): Promise<JobResponse> {
        const response = await apiClient.get<BackendJob>(`${JOBS_API_BASE}/${jobId}`);
        return mapJobToResponse(response.data);
    },

    async cancelJob(jobId: string): Promise<void> {
        await apiClient.delete(`${JOBS_API_BASE}/${jobId}`);
    },

    async retryJob(request: JobRetryRequest): Promise<JobResponse> {
        const response = await apiClient.post<BackendJob>(`${JOBS_API_BASE}/${request.jobId}/retry`);
        return mapJobToResponse(response.data);
    },

    async startBulkGeneration(request: BulkAssetGenerationRequest): Promise<JobResponse> {
        const response = await apiClient.post<BackendJob>(`${AI_API_BASE}/bulk-generation`, request);
        return mapJobToResponse(response.data);
    },
};
