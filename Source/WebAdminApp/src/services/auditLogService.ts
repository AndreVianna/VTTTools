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
    result?: string;
    ipAddress?: string;
    keyword?: string;
}

export interface AuditLog {
    id: string;
    timestamp: string;
    userId?: string;
    userEmail?: string;
    action: string;
    httpMethod: string;
    path: string;
    queryString?: string;
    statusCode: number;
    ipAddress?: string;
    userAgent?: string;
    requestBody?: string;
    responseBody?: string;
    durationInMilliseconds: number;
    result: string;
}

export interface AuditLogQueryResponse {
    items: AuditLog[];
    totalCount: number;
}

export interface AuditLogCountResponse {
    count: number;
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
        if (params.result) queryParams.append('result', params.result);
        if (params.ipAddress) queryParams.append('ipAddress', params.ipAddress);
        if (params.keyword) queryParams.append('keyword', params.keyword);

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
