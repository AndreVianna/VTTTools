import apiClient from '@api/client';

const API_BASE = '/api/admin/users';

export interface UserSearchRequest {
    skip?: number;
    take?: number;
    search?: string;
    role?: string;
    status?: 'active' | 'locked' | 'unconfirmed';
    registeredAfter?: string;
    registeredBefore?: string;
    sortBy?: 'email' | 'displayName';
    sortOrder?: 'asc' | 'desc';
}

export interface UserListItem {
    id: string;
    email: string;
    name: string;
    displayName: string;
    emailConfirmed: boolean;
    lockoutEnabled: boolean;
    isLockedOut: boolean;
    twoFactorEnabled: boolean;
    roles: string[];
}

export interface UserSearchResponse {
    users: UserListItem[];
    totalCount: number;
    hasMore: boolean;
}

export interface UserDetailResponse {
    id: string;
    email: string;
    displayName: string;
    phoneNumber?: string;
    emailConfirmed: boolean;
    phoneNumberConfirmed: boolean;
    twoFactorEnabled: boolean;
    lockoutEnabled: boolean;
    lockoutEnd?: string;
    isLockedOut: boolean;
    accessFailedCount: number;
    roles: string[];
    createdDate: string;
    lastLoginDate?: string;
    lastModifiedDate?: string;
}

export interface LockUserResponse {
    success: boolean;
    lockedUntil?: string;
}

export interface UnlockUserResponse {
    success: boolean;
}

export interface VerifyEmailResponse {
    success: boolean;
    emailConfirmed: boolean;
}

export interface PasswordResetResponse {
    success: boolean;
    emailSent: boolean;
}

export interface AssignRoleRequest {
    roleName: string;
}

export interface AssignRoleResponse {
    success: boolean;
    roles: string[];
}

export interface RemoveRoleResponse {
    success: boolean;
    roles: string[];
}

export interface AuditLogQueryRequest {
    skip?: number;
    take?: number;
    startDate?: string;
    endDate?: string;
    userId?: string;
    action?: string;
    entityType?: string;
    result?: string;
}

export interface AuditLogSummary {
    id: string;
    timestamp: string;
    action: string;
    entityType: string;
    entityId?: string;
    result: string;
    ipAddress?: string;
    durationInMilliseconds: number;
}

export interface AuditTrailResponse {
    logs: AuditLogSummary[];
    totalCount: number;
    page: number;
    pageSize: number;
}

export interface UserStatsResponse {
    totalAdministrators: number;
    totalUsers: number;
    lockedUsers: number;
    unconfirmedEmails: number;
}

export const userService = {
    async searchUsers(request: UserSearchRequest): Promise<UserSearchResponse> {
        const params = new URLSearchParams();

        if (request.skip !== undefined) params.append('skip', request.skip.toString());
        if (request.take !== undefined) params.append('take', request.take.toString());
        if (request.search) params.append('search', request.search);
        if (request.role) params.append('role', request.role);
        if (request.status) params.append('status', request.status);
        if (request.registeredAfter) params.append('registeredAfter', request.registeredAfter);
        if (request.registeredBefore) params.append('registeredBefore', request.registeredBefore);
        if (request.sortBy) params.append('sortBy', request.sortBy);
        if (request.sortOrder) params.append('sortOrder', request.sortOrder);

        const response = await apiClient.get<UserSearchResponse>(
            `${API_BASE}/search?${params.toString()}`
        );
        return response.data;
    },

    async getUserById(userId: string): Promise<UserDetailResponse> {
        const response = await apiClient.get<UserDetailResponse>(
            `${API_BASE}/${userId}`
        );
        return response.data;
    },

    async lockUser(userId: string): Promise<LockUserResponse> {
        const response = await apiClient.post<LockUserResponse>(
            `${API_BASE}/${userId}/lock`
        );
        return response.data;
    },

    async unlockUser(userId: string): Promise<UnlockUserResponse> {
        const response = await apiClient.post<UnlockUserResponse>(
            `${API_BASE}/${userId}/unlock`
        );
        return response.data;
    },

    async verifyEmail(userId: string): Promise<VerifyEmailResponse> {
        const response = await apiClient.post<VerifyEmailResponse>(
            `${API_BASE}/${userId}/verify-email`
        );
        return response.data;
    },

    async sendPasswordReset(userId: string, email: string): Promise<PasswordResetResponse> {
        const response = await apiClient.post<PasswordResetResponse>(
            `${API_BASE}/${userId}/password-reset`,
            { email }
        );
        return response.data;
    },

    async assignRole(userId: string, request: AssignRoleRequest): Promise<AssignRoleResponse> {
        const response = await apiClient.post<AssignRoleResponse>(
            `${API_BASE}/${userId}/roles`,
            request
        );
        return response.data;
    },

    async removeRole(userId: string, roleName: string): Promise<RemoveRoleResponse> {
        const response = await apiClient.delete<RemoveRoleResponse>(
            `${API_BASE}/${userId}/roles/${roleName}`
        );
        return response.data;
    },

    async getUserAuditTrail(
        userId: string,
        request: AuditLogQueryRequest
    ): Promise<AuditTrailResponse> {
        const params = new URLSearchParams();

        if (request.skip !== undefined) params.append('skip', request.skip.toString());
        if (request.take !== undefined) params.append('take', request.take.toString());
        if (request.startDate) params.append('startDate', request.startDate);
        if (request.endDate) params.append('endDate', request.endDate);
        if (request.userId) params.append('userId', request.userId);
        if (request.action) params.append('action', request.action);
        if (request.entityType) params.append('entityType', request.entityType);
        if (request.result) params.append('result', request.result);

        const response = await apiClient.get<AuditTrailResponse>(
            `${API_BASE}/${userId}/audit?${params.toString()}`
        );
        return response.data;
    },

    async getUserStats(): Promise<UserStatsResponse> {
        const response = await apiClient.get<UserStatsResponse>(
            `${API_BASE}/stats`
        );
        return response.data;
    },
};
