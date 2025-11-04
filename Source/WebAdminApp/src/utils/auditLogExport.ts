import type { AuditLog } from '@services/auditLogService';

export const exportToCSV = (logs: AuditLog[], filename: string = 'audit_logs.csv') => {
    const headers = [
        'Timestamp',
        'User Email',
        'Action',
        'HTTP Method',
        'Path',
        'Query String',
        'Status Code',
        'Result',
        'Duration (ms)',
        'IP Address',
        'User Agent',
        'Request Body',
        'Response Body',
    ];

    const csvRows = [
        headers.join(','),
        ...logs.map((log) => {
            const values = [
                log.timestamp,
                log.userEmail || '',
                log.action,
                log.httpMethod,
                log.path,
                log.queryString || '',
                log.statusCode.toString(),
                log.result,
                log.durationInMilliseconds.toString(),
                log.ipAddress || '',
                log.userAgent || '',
                log.requestBody ? `"${log.requestBody.replace(/"/g, '""')}"` : '',
                log.responseBody ? `"${log.responseBody.replace(/"/g, '""')}"` : '',
            ];
            return values.map(v => `"${v.replace(/"/g, '""')}"`).join(',');
        }),
    ];

    const csvContent = csvRows.join('\n');
    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
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

export const exportToJSON = (logs: AuditLog[], filename: string = 'audit_logs.json') => {
    const jsonContent = JSON.stringify(logs, null, 2);
    const blob = new Blob([jsonContent], { type: 'application/json;charset=utf-8;' });
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
