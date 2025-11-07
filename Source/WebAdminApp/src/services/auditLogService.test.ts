import { describe, it, expect, beforeEach } from 'vitest';
import MockAdapter from 'axios-mock-adapter';
import apiClient from '@api/client';
import { auditLogService, type AuditLog, type AuditLogQueryParams } from './auditLogService';

describe('AuditLogService', () => {
    let mockAxios: MockAdapter;

    beforeEach(() => {
        mockAxios = new MockAdapter(apiClient);
    });

    describe('queryAuditLogs', () => {
        it('should query audit logs with default parameters', async () => {
            const mockResponse = {
                items: [
                    {
                        id: '1',
                        timestamp: '2025-01-01T00:00:00Z',
                        userId: 'user-123',
                        userEmail: 'user@test.com',
                        action: 'POST /api/test',
                        httpMethod: 'POST',
                        path: '/api/test',
                        queryString: null,
                        statusCode: 200,
                        result: 'Success',
                        ipAddress: '127.0.0.1',
                        userAgent: 'Mozilla/5.0',
                        requestBody: null,
                        responseBody: null,
                        durationInMilliseconds: 100,
                    },
                ],
                totalCount: 1,
            };

            mockAxios.onGet(/\/api\/admin\/audit/).reply(200, mockResponse);

            const result = await auditLogService.queryAuditLogs({});

            expect(result).toEqual(mockResponse);
            expect(result.items).toHaveLength(1);
            expect(result.totalCount).toBe(1);
        });

        it('should query audit logs with custom pagination', async () => {
            const mockResponse = {
                items: [],
                totalCount: 0,
            };

            mockAxios.onGet(/\/api\/admin\/audit/).reply(200, mockResponse);

            await auditLogService.queryAuditLogs({ skip: 100, take: 25 });
        });

        it('should query audit logs with all filter parameters', async () => {
            const params: AuditLogQueryParams = {
                skip: 0,
                take: 10,
                userId: 'user@test.com',
                action: 'POST',
                result: 'Success',
                ipAddress: '127.0.0.1',
                keyword: 'test',
                startDate: '2025-01-01T00:00:00Z',
                endDate: '2025-01-31T23:59:59Z',
            };

            const mockResponse = {
                items: [],
                totalCount: 0,
            };

            mockAxios.onGet(/\/api\/admin\/audit/).reply(200, mockResponse);

            await auditLogService.queryAuditLogs(params);
        });

        it('should handle empty string filters correctly', async () => {
            const params: AuditLogQueryParams = {
                userId: '',
                action: '',
                result: '',
            };

            mockAxios.onGet(/\/api\/admin\/audit/).reply(200, { items: [], totalCount: 0 });

            await auditLogService.queryAuditLogs(params);
        });

        it('should handle API errors', async () => {
            mockAxios.onGet('/api/admin/audit').reply(500, { message: 'Internal Server Error' });

            await expect(auditLogService.queryAuditLogs({})).rejects.toThrow();
        });

        it('should handle network errors', async () => {
            mockAxios.onGet('/api/admin/audit').networkError();

            await expect(auditLogService.queryAuditLogs({})).rejects.toThrow();
        });
    });

    describe('getAuditLogById', () => {
        it('should get audit log by id', async () => {
            const mockLog: AuditLog = {
                id: '123',
                timestamp: '2025-01-01T00:00:00Z',
                userId: 'user-123',
                userEmail: 'user@test.com',
                action: 'GET /api/test',
                httpMethod: 'GET',
                path: '/api/test',
                queryString: '?param=value',
                statusCode: 200,
                result: 'Success',
                ipAddress: '192.168.1.1',
                userAgent: 'Mozilla/5.0',
                requestBody: '{"data":"value"}',
                responseBody: '{"success":true}',
                durationInMilliseconds: 150,
            };

            mockAxios.onGet('/api/admin/audit/123').reply(200, mockLog);

            const result = await auditLogService.getAuditLogById('123');

            expect(result).toEqual(mockLog);
            expect(result.id).toBe('123');
        });

        it('should handle 404 not found', async () => {
            mockAxios.onGet('/api/admin/audit/999').reply(404);

            await expect(auditLogService.getAuditLogById('999')).rejects.toThrow();
        });
    });
});
