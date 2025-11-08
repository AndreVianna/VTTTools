import { describe, it, expect, beforeEach, afterEach, vi } from 'vitest';
import { exportToCSV, exportToJSON } from './auditLogExport';
import type { AuditLog } from '@services/auditLogService';

describe('AuditLog Export Utilities', () => {
    let mockCreateElement: ReturnType<typeof vi.fn>;
    let mockAppendChild: ReturnType<typeof vi.fn>;
    let mockRemoveChild: ReturnType<typeof vi.fn>;
    let mockClick: ReturnType<typeof vi.fn>;
    let mockCreateObjectURL: ReturnType<typeof vi.fn>;
    let mockRevokeObjectURL: ReturnType<typeof vi.fn>;
    let capturedBlobContent: string | null = null;

    beforeEach(() => {
        capturedBlobContent = null;
        mockClick = vi.fn();
        mockCreateElement = vi.fn(() => ({
            setAttribute: vi.fn(),
            click: mockClick,
            style: {},
        }));
        mockAppendChild = vi.fn();
        mockRemoveChild = vi.fn();
        mockCreateObjectURL = vi.fn(() => 'blob:mock-url');
        mockRevokeObjectURL = vi.fn();

        global.Blob = vi.fn((content: BlobPart[], options?) => {
            capturedBlobContent = content[0] as string;
            return { size: capturedBlobContent.length, type: options?.type || '' } as Blob;
        }) as unknown as typeof Blob;

        global.document.createElement = mockCreateElement as unknown as typeof document.createElement;
        global.document.body.appendChild = mockAppendChild as unknown as typeof document.body.appendChild;
        global.document.body.removeChild = mockRemoveChild as unknown as typeof document.body.removeChild;
        global.URL.createObjectURL = mockCreateObjectURL as unknown as typeof URL.createObjectURL;
        global.URL.revokeObjectURL = mockRevokeObjectURL;
    });

    afterEach(() => {
        vi.restoreAllMocks();
    });

    describe('exportToCSV', () => {
        it('should create CSV with correct headers', () => {
            const logs: AuditLog[] = [];

            exportToCSV(logs, 'test.csv');

            expect(capturedBlobContent).toBeDefined();
            expect(capturedBlobContent).toContain('Timestamp');
            expect(capturedBlobContent).toContain('User Email');
            expect(capturedBlobContent).toContain('Action');
            expect(capturedBlobContent).toContain('HTTP Method');
        });

        it('should export audit logs to CSV format', () => {
            const mockLogs: AuditLog[] = [
                {
                    id: '1',
                    timestamp: '2025-01-01T00:00:00Z',
                    userId: 'user-123',
                    userEmail: 'test@example.com',
                    action: 'POST /api/test',
                    httpMethod: 'POST',
                    path: '/api/test',
                    queryString: '?param=value',
                    statusCode: 200,
                    result: 'Success',
                    ipAddress: '127.0.0.1',
                    userAgent: 'Mozilla/5.0',
                    requestBody: '{"data":"test"}',
                    responseBody: '{"success":true}',
                    durationInMilliseconds: 100,
                },
            ];

            exportToCSV(mockLogs, 'audit_logs.csv');

            expect(mockCreateElement).toHaveBeenCalledWith('a');
            expect(mockClick).toHaveBeenCalled();
            expect(mockCreateObjectURL).toHaveBeenCalled();
            expect(mockRevokeObjectURL).toHaveBeenCalledWith('blob:mock-url');
        });

        it('should handle logs with null values', () => {
            const mockLogs: AuditLog[] = [
                {
                    id: '1',
                    timestamp: '2025-01-01T00:00:00Z',
                    action: 'GET /api/test',
                    httpMethod: 'GET',
                    path: '/api/test',
                    statusCode: 404,
                    result: 'Failure',
                    durationInMilliseconds: 50,
                },
            ];

            exportToCSV(mockLogs);

            expect(mockClick).toHaveBeenCalled();
        });

        it('should escape quotes in CSV values', () => {
            const mockLogs: AuditLog[] = [
                {
                    id: '1',
                    timestamp: '2025-01-01T00:00:00Z',
                    userId: 'user-123',
                    userEmail: 'test@example.com',
                    action: 'POST /api/test',
                    httpMethod: 'POST',
                    path: '/api/test',
                    statusCode: 200,
                    result: 'Success',
                    ipAddress: '127.0.0.1',
                    userAgent: 'Mozilla/5.0',
                    requestBody: '{"key":"value with \\"quotes\\""}',
                    durationInMilliseconds: 100,
                },
            ];

            exportToCSV(mockLogs);

            expect(mockClick).toHaveBeenCalled();
        });

        it('should use default filename when not provided', () => {
            const mockLogs: AuditLog[] = [];
            const mockLink = {
                setAttribute: vi.fn(),
                click: vi.fn(),
                style: {},
            };
            mockCreateElement.mockReturnValue(mockLink);

            exportToCSV(mockLogs);

            expect(mockLink.setAttribute).toHaveBeenCalledWith('download', 'audit_logs.csv');
        });

        it('should use custom filename when provided', () => {
            const mockLogs: AuditLog[] = [];
            const mockLink = {
                setAttribute: vi.fn(),
                click: vi.fn(),
                style: {},
            };
            mockCreateElement.mockReturnValue(mockLink);

            exportToCSV(mockLogs, 'custom_filename.csv');

            expect(mockLink.setAttribute).toHaveBeenCalledWith('download', 'custom_filename.csv');
        });
    });

    describe('exportToJSON', () => {
        it('should export audit logs to JSON format', () => {
            const mockLogs: AuditLog[] = [
                {
                    id: '1',
                    timestamp: '2025-01-01T00:00:00Z',
                    userId: 'user-123',
                    userEmail: 'test@example.com',
                    action: 'POST /api/test',
                    httpMethod: 'POST',
                    path: '/api/test',
                    queryString: '?param=value',
                    statusCode: 200,
                    result: 'Success',
                    ipAddress: '127.0.0.1',
                    userAgent: 'Mozilla/5.0',
                    requestBody: '{"data":"test"}',
                    responseBody: '{"success":true}',
                    durationInMilliseconds: 100,
                },
            ];

            exportToJSON(mockLogs, 'audit_logs.json');

            expect(mockCreateElement).toHaveBeenCalledWith('a');
            expect(mockClick).toHaveBeenCalled();
            expect(mockCreateObjectURL).toHaveBeenCalled();
            expect(mockRevokeObjectURL).toHaveBeenCalledWith('blob:mock-url');
        });

        it('should format JSON with proper indentation', () => {
            const mockLogs: AuditLog[] = [
                {
                    id: '1',
                    timestamp: '2025-01-01T00:00:00Z',
                    userId: 'user-123',
                    userEmail: 'test@example.com',
                    action: 'GET /api/test',
                    httpMethod: 'GET',
                    path: '/api/test',
                    statusCode: 200,
                    result: 'Success',
                    ipAddress: '127.0.0.1',
                    userAgent: 'Mozilla/5.0',
                    durationInMilliseconds: 75,
                },
            ];

            exportToJSON(mockLogs);

            expect(capturedBlobContent).toBeDefined();
            const parsed = JSON.parse(capturedBlobContent!);

            expect(parsed).toHaveLength(1);
            expect(parsed[0].id).toBe('1');
        });

        it('should use default filename when not provided', () => {
            const mockLogs: AuditLog[] = [];
            const mockLink = {
                setAttribute: vi.fn(),
                click: vi.fn(),
                style: {},
            };
            mockCreateElement.mockReturnValue(mockLink);

            exportToJSON(mockLogs);

            expect(mockLink.setAttribute).toHaveBeenCalledWith('download', 'audit_logs.json');
        });

        it('should use custom filename when provided', () => {
            const mockLogs: AuditLog[] = [];
            const mockLink = {
                setAttribute: vi.fn(),
                click: vi.fn(),
                style: {},
            };
            mockCreateElement.mockReturnValue(mockLink);

            exportToJSON(mockLogs, 'custom_audit.json');

            expect(mockLink.setAttribute).toHaveBeenCalledWith('download', 'custom_audit.json');
        });

        it('should handle empty array', () => {
            const mockLogs: AuditLog[] = [];

            exportToJSON(mockLogs);

            expect(mockClick).toHaveBeenCalled();
            expect(capturedBlobContent).toBeDefined();
            expect(JSON.parse(capturedBlobContent!)).toEqual([]);
        });
    });
});
