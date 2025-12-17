import apiClient from '@api/client';

const API_BASE = '/api/admin/audit';

export interface AuditLogQueryParams {
    skip?: number;
    take?: number;
    startDate?: string;
    endDate?: string;
    userId?: string;
    action?: string;
    entityType?: string;
}

// Generic audit log with Payload
export interface AuditLog {
    id: string;
    timestamp: string;
    userId?: string;
    userEmail?: string;
    action: string;
    errorMessage?: string;
    entityType?: string;
    entityId?: string;
    payload?: string; // JSON string
}

// Payload type helpers for HTTP actions
export interface HttpAuditPayload {
    httpMethod: string;
    path: string;
    queryString?: string;
    statusCode: number;
    ipAddress?: string;
    userAgent?: string;
    requestBody?: string;
    responseBody?: string;
    durationMs: number;
    result: string;
}

// Payload type helpers for Job actions
export interface JobCreatedPayload {
    type: string;
    totalItems: number;
    estimatedDuration?: string;
}

export interface JobItemStartedPayload {
    index: number;
    startedAt: string;
}

export interface JobItemCompletedPayload {
    index: number;
    status: string;
    message?: string;
    createdAssetId?: string;
    createdResourceIds?: string[];
}

export interface JobCompletedPayload {
    completedAt: string;
    successCount: number;
    failedCount: number;
}

// Payload type helpers for Asset/Resource generation
export interface AssetGeneratedPayload {
    jobId: string;
    jobItemIndex: number;
    portraitResourceId?: string;
    tokenResourceId?: string;
}

export interface ResourceGeneratedPayload {
    jobId: string;
    jobItemIndex: number;
    resourceType: string;
}

export interface AuditLogQueryResponse {
    items: AuditLog[];
    totalCount: number;
}

export interface AuditLogCountResponse {
    count: number;
}

// Helper function to parse and type-guard payloads
export function parsePayload<T>(payload?: string): T | undefined {
    if (!payload) return undefined;
    try {
        return JSON.parse(payload) as T;
    } catch {
        return undefined;
    }
}

// Helper to determine if an action is HTTP-related
export function isHttpAction(action: string): boolean {
    return action.endsWith(':ByUser') || action.startsWith('HTTP:');
}

// Helper to determine if an action is Job-related
export function isJobAction(action: string): boolean {
    return action.startsWith('Job:') || action.startsWith('JobItem:');
}

// Helper to determine if an action is via Job (AI-generated)
export function isViaJobAction(action: string): boolean {
    return action.endsWith(':ViaJob');
}

export const auditLogService = {
    async queryAuditLogs(params: AuditLogQueryParams): Promise<AuditLogQueryResponse> {
        const queryParams = new URLSearchParams();

        if (params.skip !== undefined) queryParams.append('skip', params.skip.toString());
        if (params.take !== undefined) queryParams.append('take', params.take.toString());
        if (params.startDate) queryParams.append('startDate', params.startDate);
        if (params.endDate) queryParams.append('endDate', params.endDate);
        if (params.userId) queryParams.append('userId', params.userId);
        if (params.action) queryParams.append('action', params.action);
        if (params.entityType) queryParams.append('entityType', params.entityType);

        const response = await apiClient.get<AuditLogQueryResponse>(
            `${API_BASE}?${queryParams.toString()}`
        );
        return response.data;
    },

    async getAuditLogById(id: string): Promise<AuditLog> {
        const response = await apiClient.get<AuditLog>(`${API_BASE}/${id}`);
        return response.data;
    },

    async getAuditLogCount(): Promise<AuditLogCountResponse> {
        const response = await apiClient.get<AuditLogCountResponse>(`${API_BASE}/count`);
        return response.data;
    },
};
