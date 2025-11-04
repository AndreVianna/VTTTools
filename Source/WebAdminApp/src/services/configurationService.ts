import apiClient from '@api/client';

const API_BASE = '/api/admin/configuration';

export enum ConfigSourceType {
    JsonFile = 'JsonFile',
    EnvironmentVariable = 'EnvironmentVariable',
    CommandLine = 'CommandLine',
    UserSecrets = 'UserSecrets',
    AzureKeyVault = 'AzureKeyVault',
    AzureAppConfiguration = 'AzureAppConfiguration',
    InMemory = 'InMemory',
    FrontendEnvFile = 'FrontendEnvFile',
    Unknown = 'Unknown',
    NotFound = 'NotFound',
}

export interface ConfigurationSource {
    type: ConfigSourceType;
    path: string | null;
}

export interface ConfigEntry {
    key: string;
    value: string;
    source: ConfigurationSource;
    category: string | null;
    isRedacted: boolean;
}

export interface ConfigurationResponse {
    serviceName: string;
    entries: ConfigEntry[];
}

export interface RevealConfigValueRequest {
    serviceName: string;
    key: string;
    totpCode: string;
}

export interface RevealConfigValueResponse {
    value: string;
    revealedAt: string;
}

export const configurationService = {
    async getConfiguration(serviceName: string): Promise<ConfigurationResponse> {
        let endpoint: string;

        if (serviceName === 'Admin' || serviceName === 'WebClientApp' || serviceName === 'WebAdminApp') {
            endpoint = `/api/admin/configuration/${serviceName}`;
        } else {
            endpoint = `/api/${serviceName.toLowerCase()}/internal/config`;
        }

        const response = await apiClient.get<ConfigurationResponse>(endpoint);
        return response.data;
    },

    async revealConfigValue(request: RevealConfigValueRequest): Promise<RevealConfigValueResponse> {
        const response = await apiClient.post<RevealConfigValueResponse>(
            `${API_BASE}/reveal`,
            request
        );
        return response.data;
    },
};
