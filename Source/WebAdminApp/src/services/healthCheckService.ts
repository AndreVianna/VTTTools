import apiClient from '@api/client';

export interface HealthCheckResult {
    name: string;
    status: 'Healthy' | 'Degraded' | 'Unhealthy';
    duration: string;
    description: string | null;
    data: Record<string, any> | null;
    exception: string | null;
    tags: string[];
}

export interface HealthCheckResponse {
    status: 'Healthy' | 'Degraded' | 'Unhealthy';
    totalDuration: string;
    results: HealthCheckResult[];
}

export interface ServiceHealth {
    serviceName: string;
    status: 'Healthy' | 'Degraded' | 'Unhealthy' | 'Unavailable';
    healthData: HealthCheckResponse | null;
    error: string | null;
    responseTime?: number;
}

export type AllServicesHealth = Record<string, ServiceHealth>;

class HealthCheckService {
    async getAdminHealth(): Promise<HealthCheckResponse> {
        const response = await apiClient.get<HealthCheckResponse>('/health/admin');
        return response.data;
    }

    async getAuthHealth(): Promise<HealthCheckResponse> {
        const response = await apiClient.get<HealthCheckResponse>('/alive/auth');
        return response.data;
    }

    async getAssetsHealth(): Promise<HealthCheckResponse> {
        const response = await apiClient.get<HealthCheckResponse>('/alive/assets');
        return response.data;
    }

    async getLibraryHealth(): Promise<HealthCheckResponse> {
        const response = await apiClient.get<HealthCheckResponse>('/alive/library');
        return response.data;
    }

    async getGameHealth(): Promise<HealthCheckResponse> {
        const response = await apiClient.get<HealthCheckResponse>('/alive/game');
        return response.data;
    }

    async getMediaHealth(): Promise<HealthCheckResponse> {
        const response = await apiClient.get<HealthCheckResponse>('/alive/media');
        return response.data;
    }

    async checkMainAppAvailability(): Promise<ServiceHealth> {
        const startTime = Date.now();
        try {
            await fetch('http://localhost:5173/', {
                method: 'HEAD',
                mode: 'no-cors',
            });
            const responseTime = Date.now() - startTime;

            return {
                serviceName: 'Main App',
                status: 'Healthy',
                healthData: {
                    status: 'Healthy',
                    totalDuration: `${responseTime}ms`,
                    results: [
                        {
                            name: 'availability',
                            status: 'Healthy',
                            duration: `${responseTime}ms`,
                            description: 'Main App is accessible',
                            data: null,
                            exception: null,
                            tags: ['frontend', 'availability'],
                        },
                    ],
                },
                error: null,
                responseTime,
            };
        } catch (err: any) {
            return {
                serviceName: 'Main App',
                status: 'Unavailable',
                healthData: null,
                error: err.message || 'Main App unavailable',
                responseTime: Date.now() - startTime,
            };
        }
    }

    async getAllHealth(): Promise<AllServicesHealth> {
        const services = [
            { name: 'Admin', fetch: () => this.getAdminHealth() },
            { name: 'Auth', fetch: () => this.getAuthHealth() },
            { name: 'Assets', fetch: () => this.getAssetsHealth() },
            { name: 'Library', fetch: () => this.getLibraryHealth() },
            { name: 'Game', fetch: () => this.getGameHealth() },
            { name: 'Media', fetch: () => this.getMediaHealth() },
        ];

        const results = await Promise.allSettled(
            services.map(async (service) => {
                const startTime = Date.now();
                try {
                    const healthData = await service.fetch();
                    const responseTime = Date.now() - startTime;
                    return {
                        serviceName: service.name,
                        status: healthData.status,
                        healthData,
                        error: null,
                        responseTime,
                    };
                } catch (err: any) {
                    return {
                        serviceName: service.name,
                        status: 'Unavailable' as const,
                        healthData: null,
                        error: err.message || 'Service unavailable',
                        responseTime: Date.now() - startTime,
                    };
                }
            })
        );

        const healthMap: AllServicesHealth = {};
        results.forEach((result, index) => {
            const service = services[index];
            if (result.status === 'fulfilled' && service) {
                healthMap[service.name] = result.value;
            }
        });

        healthMap['AdminApp'] = {
            serviceName: 'Admin App',
            status: 'Healthy',
            healthData: {
                status: 'Healthy',
                totalDuration: '0ms',
                results: [
                    {
                        name: 'self',
                        status: 'Healthy',
                        duration: '0ms',
                        description: 'Admin App is running',
                        data: null,
                        exception: null,
                        tags: ['live'],
                    },
                ],
            },
            error: null,
        };

        const mainAppHealth = await this.checkMainAppAvailability();
        healthMap['MainApp'] = mainAppHealth;

        return healthMap;
    }

    extractInfrastructureHealth(adminHealth: HealthCheckResponse): {
        database: ServiceHealth;
        redis: ServiceHealth;
        blobStorage: ServiceHealth;
    } {
        const createServiceHealth = (
            result: HealthCheckResult | undefined,
            serviceName: string
        ): ServiceHealth => {
            if (!result) {
                return {
                    serviceName,
                    status: 'Unavailable',
                    healthData: null,
                    error: 'Health check result not found',
                };
            }

            return {
                serviceName,
                status: result.status,
                healthData: {
                    status: result.status,
                    totalDuration: result.duration,
                    results: [result],
                },
                error: result.exception,
            };
        };

        const dbResult = adminHealth?.results?.find((r) =>
            r.tags?.includes('database') || r.name?.toLowerCase().includes('database')
        );
        const redisResult = adminHealth?.results?.find((r) =>
            r.tags?.includes('redis') || r.name?.toLowerCase().includes('redis')
        );
        const blobResult = adminHealth?.results?.find((r) =>
            r.tags?.includes('blob') || r.name?.toLowerCase().includes('blob')
        );

        return {
            database: createServiceHealth(dbResult, 'Database'),
            redis: createServiceHealth(redisResult, 'Redis'),
            blobStorage: createServiceHealth(blobResult, 'Blob Storage'),
        };
    }
}

export const healthCheckService = new HealthCheckService();
