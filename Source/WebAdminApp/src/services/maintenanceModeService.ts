import apiClient from '@api/client';

const API_BASE = '/api/admin/maintenance';

export interface MaintenanceModeStatusResponse {
    id?: string;
    isEnabled: boolean;
    message?: string;
    scheduledStartTime?: string;
    scheduledEndTime?: string;
    enabledAt?: string;
    enabledBy?: string;
    disabledAt?: string;
    disabledBy?: string;
}

export interface EnableMaintenanceModeRequest {
    message: string;
    scheduledStartTime?: string;
    scheduledEndTime?: string;
}

export interface UpdateMaintenanceModeRequest {
    message: string;
    scheduledStartTime?: string;
    scheduledEndTime?: string;
}

export const maintenanceModeService = {
    async getStatus(): Promise<MaintenanceModeStatusResponse> {
        const response = await apiClient.get<MaintenanceModeStatusResponse>(API_BASE);
        return response.data;
    },

    async enable(request: EnableMaintenanceModeRequest): Promise<MaintenanceModeStatusResponse> {
        const response = await apiClient.put<MaintenanceModeStatusResponse>(
            `${API_BASE}/enable`,
            request
        );
        return response.data;
    },

    async disable(): Promise<MaintenanceModeStatusResponse> {
        const response = await apiClient.put<MaintenanceModeStatusResponse>(`${API_BASE}/disable`);
        return response.data;
    },

    async update(
        id: string,
        request: UpdateMaintenanceModeRequest
    ): Promise<MaintenanceModeStatusResponse> {
        const response = await apiClient.put<MaintenanceModeStatusResponse>(
            `${API_BASE}/${id}`,
            request
        );
        return response.data;
    },
};
