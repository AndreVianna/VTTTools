import type { AuditLog, HttpAuditPayload } from '@services/auditLogService';
import { isHttpAction, parsePayload } from '@services/auditLogService';

export const exportToCSV = (logs: AuditLog[], filename: string = 'audit_logs.csv') => {
    const headers = [
        'Timestamp',
        'User Email',
        'Action',
        'Entity Type',
        'Entity ID',
        'Error Message',
        'HTTP Method',
        'Path',
        'Status Code',
        'Duration (ms)',
        'IP Address',
        'Payload',
    ];

    const csvRows = [
        headers.join(','),
        ...logs.map((log) => {
            let httpMethod = '';
            let path = '';
            let statusCode = '';
            let durationMs = '';
            let ipAddress = '';

            // Parse HTTP payload if this is an HTTP action
            if (isHttpAction(log.action) && log.payload) {
                const httpPayload = parsePayload<HttpAuditPayload>(log.payload);
                if (httpPayload) {
                    httpMethod = httpPayload.httpMethod || '';
                    path = httpPayload.path || '';
                    statusCode = httpPayload.statusCode?.toString() || '';
                    durationMs = httpPayload.durationMs?.toString() || '';
                    ipAddress = httpPayload.ipAddress || '';
                }
            }

            const values = [
                log.timestamp,
                log.userEmail || '',
                log.action,
                log.entityType || '',
                log.entityId || '',
                log.errorMessage || '',
                httpMethod,
                path,
                statusCode,
                durationMs,
                ipAddress,
                log.payload ? log.payload.replace(/"/g, '""') : '',
            ];
            return values.map(v => `"${String(v).replace(/"/g, '""')}"`).join(',');
        }),
    ];

    const csvContent = csvRows.join('\n');
    downloadFile(csvContent, filename, 'text/csv;charset=utf-8;');
};

export const exportToJSON = (logs: AuditLog[], filename: string = 'audit_logs.json') => {
    // For JSON export, parse the payload for each log to provide structured data
    const enrichedLogs = logs.map((log) => {
        const parsedPayload = log.payload ? parsePayload<Record<string, unknown>>(log.payload) : undefined;
        return {
            ...log,
            parsedPayload,
        };
    });

    const jsonContent = JSON.stringify(enrichedLogs, null, 2);
    downloadFile(jsonContent, filename, 'application/json;charset=utf-8;');
};

const downloadFile = (content: string, filename: string, mimeType: string) => {
    const blob = new Blob([content], { type: mimeType });
    const link = document.createElement('a');
    const url = URL.createObjectURL(blob);
    link.setAttribute('href', url);
    link.setAttribute('download', filename);
    link.style.visibility = 'hidden';
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(url);
};
