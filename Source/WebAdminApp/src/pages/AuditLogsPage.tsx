import { useState, useEffect, useCallback, useRef } from 'react';
import {
    Box,
    Typography,
    Paper,
    Chip,
    TextField,
    Button,
    Stack,
    MenuItem,
    Select,
    FormControl,
    InputLabel,
    Grid,
    Skeleton,
    Alert,
    useTheme,
    Tabs,
    Tab,
    Switch,
    FormControlLabel,
} from '@mui/material';
import {
    DataGrid,
    GridColDef,
    GridRenderCellParams,
} from '@mui/x-data-grid';
import {
    FilterList as FilterListIcon,
    Clear as ClearIcon,
    FiberManualRecord as LiveIndicatorIcon,
    ExpandMore as ExpandMoreIcon,
    ExpandLess as ExpandLessIcon,
    Download as DownloadIcon,
} from '@mui/icons-material';
import IconButton from '@mui/material/IconButton';
import { DateTimePicker } from '@mui/x-date-pickers/DateTimePicker';
import { LocalizationProvider } from '@mui/x-date-pickers/LocalizationProvider';
import { AdapterDayjs } from '@mui/x-date-pickers/AdapterDayjs';
import dayjs from 'dayjs';
import {
    auditLogService,
    AuditLog,
    AuditLogQueryParams,
    HttpAuditPayload,
    parsePayload,
    isHttpAction,
    isJobAction,
    isViaJobAction,
} from '@services/auditLogService';
import { exportToCSV, exportToJSON } from '@utils/auditLogExport';

const DATE_PRESETS = [
    { label: 'Last Hour', hours: 1 },
    { label: 'Today', hours: 24 },
    { label: 'Last 7 Days', hours: 24 * 7 },
    { label: 'Last 30 Days', hours: 24 * 30 },
];

const ENTITY_TYPE_OPTIONS = ['Asset', 'Resource', 'Job', 'JobItem', 'User', 'Session', 'AuditLog'];

const formatJson = (json: string | undefined | null): string => {
    if (!json) return 'N/A';
    try {
        const parsed = JSON.parse(json);
        return JSON.stringify(parsed, null, 2);
    } catch {
        return json;
    }
};

interface DetailRow {
    id: string;
    isDetailRow: true;
    parentLog: AuditLog;
}

type GridRow = AuditLog | DetailRow;

const isDetailRow = (row: GridRow): row is DetailRow => {
    return 'isDetailRow' in row && row.isDetailRow === true;
};

// Helper to get result from HTTP payload or derive from action
function getResultFromLog(log: AuditLog): string {
    if (log.errorMessage) return 'Error';
    const httpPayload = parsePayload<HttpAuditPayload>(log.payload);
    if (httpPayload?.result) return httpPayload.result;
    if (isJobAction(log.action)) {
        if (log.action.includes('Failed') || log.action.includes('Canceled')) return 'Failure';
        if (log.action.includes('Completed') || log.action.includes('Created')) return 'Success';
    }
    return 'Success';
}

// Helper to get HTTP info from payload
function getHttpInfo(log: AuditLog): { method: string; path: string; statusCode: number; durationMs: number } | null {
    const httpPayload = parsePayload<HttpAuditPayload>(log.payload);
    if (!httpPayload?.httpMethod) return null;
    return {
        method: httpPayload.httpMethod,
        path: httpPayload.path,
        statusCode: httpPayload.statusCode,
        durationMs: httpPayload.durationMs,
    };
}

export function AuditLogsPage() {
    const theme = useTheme();
    const [activeTab, setActiveTab] = useState(0);
    const [logs, setLogs] = useState<AuditLog[]>([]);
    const [totalCount, setTotalCount] = useState(0);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState<string | null>(null);
    const [filtersOpen, setFiltersOpen] = useState(false);
    const [autoRefresh, setAutoRefresh] = useState(true);
    const [lastUpdate, setLastUpdate] = useState<Date | null>(null);
    const [expandedRows, setExpandedRows] = useState<Set<string>>(new Set());
    const pollingIntervalRef = useRef<ReturnType<typeof setInterval> | null>(null);

    const [paginationModel, setPaginationModel] = useState({
        page: 0,
        pageSize: 50,
    });

    const [filters, setFilters] = useState<AuditLogQueryParams>({
        userId: '',
        action: '',
        entityType: '',
    });

    const [tempFilters, setTempFilters] = useState<AuditLogQueryParams>(filters);

    const loadAuditLogs = useCallback(async (isLiveMode: boolean = false) => {
        try {
            setLoading(true);
            setError(null);

            const params: AuditLogQueryParams = isLiveMode
                ? {
                    skip: 0,
                    take: 100,
                    ...filters,
                }
                : {
                    skip: paginationModel.page * paginationModel.pageSize,
                    take: paginationModel.pageSize,
                    ...filters,
                };

            const response = await auditLogService.queryAuditLogs(params);
            setLogs(response.items);
            setTotalCount(response.totalCount);
            if (isLiveMode) {
                setLastUpdate(new Date());
            }
        } catch (err) {
            setError(err instanceof Error ? err.message : 'Failed to load audit logs');
        } finally {
            setLoading(false);
        }
    }, [paginationModel, filters]);

    useEffect(() => {
        if (activeTab === 0) {
            loadAuditLogs(false);
        }
    }, [activeTab, loadAuditLogs]);

    useEffect(() => {
        if (activeTab === 1 && autoRefresh) {
            loadAuditLogs(true);
            pollingIntervalRef.current = setInterval(() => {
                loadAuditLogs(true);
            }, 3000);
        }

        return () => {
            if (pollingIntervalRef.current) {
                clearInterval(pollingIntervalRef.current);
                pollingIntervalRef.current = null;
            }
        };
    }, [activeTab, autoRefresh, loadAuditLogs]);

    const handleApplyFilters = () => {
        const activeFilterCount = Object.values(tempFilters).filter(
            (value) => value !== '' && value !== undefined
        ).length;

        if (activeTab === 1 && activeFilterCount > 1) {
            setError('Live Monitoring supports only a single filter dimension. Please select one filter.');
            return;
        }

        setFilters(tempFilters);
        setPaginationModel({ ...paginationModel, page: 0 });
    };

    const handleClearFilters = () => {
        const clearedFilters: AuditLogQueryParams = {
            userId: '',
            action: '',
            entityType: '',
        };
        setTempFilters(clearedFilters);
        setFilters(clearedFilters);
        setPaginationModel({ ...paginationModel, page: 0 });
        setError(null);
    };

    const handleDatePreset = (hours: number) => {
        const endDate = new Date();
        const startDate = new Date(endDate.getTime() - hours * 60 * 60 * 1000);
        setTempFilters({
            ...tempFilters,
            startDate: startDate.toISOString(),
            endDate: endDate.toISOString(),
        });
    };

    const handleExportCSV = () => {
        const timestamp = dayjs().format('YYYYMMDD_HHmmss');
        exportToCSV(logs, `audit_logs_${timestamp}.csv`);
    };

    const handleExportJSON = () => {
        const timestamp = dayjs().format('YYYYMMDD_HHmmss');
        exportToJSON(logs, `audit_logs_${timestamp}.json`);
    };

    const getResultColor = (result: string): 'success' | 'warning' | 'error' | 'default' => {
        switch (result.toLowerCase()) {
            case 'success':
                return 'success';
            case 'failure':
                return 'warning';
            case 'error':
                return 'error';
            default:
                return 'default';
        }
    };

    const getActionColor = (action: string): 'primary' | 'secondary' | 'info' | 'default' => {
        if (isViaJobAction(action)) return 'secondary';
        if (isJobAction(action)) return 'info';
        if (isHttpAction(action)) return 'primary';
        return 'default';
    };

    const handleToggleExpand = (rowId: string) => {
        setExpandedRows((prev) => {
            const newSet = new Set(prev);
            if (newSet.has(rowId)) {
                newSet.delete(rowId);
            } else {
                newSet.add(rowId);
            }
            return newSet;
        });
    };

    const transformLogsToGridRows = (logs: AuditLog[]): GridRow[] => {
        const rows: GridRow[] = [];
        logs.forEach((log) => {
            rows.push(log);
            if (expandedRows.has(log.id)) {
                rows.push({
                    id: `${log.id}_detail`,
                    isDetailRow: true,
                    parentLog: log,
                });
            }
        });
        return rows;
    };

    const gridRows = transformLogsToGridRows(logs);

    const columns: GridColDef[] = [
        {
            field: 'expand',
            headerName: '',
            width: 50,
            sortable: false,
            disableColumnMenu: true,
            hideable: false,
            renderCell: (params: GridRenderCellParams<GridRow>) => {
                const row = params.row;
                if (isDetailRow(row)) {
                    const log = row.parentLog;
                    return (
                        <Box
                            sx={{
                                width: '100%',
                                p: 3,
                                bgcolor: 'background.default',
                                position: 'absolute',
                                left: 0,
                                right: 0,
                                zIndex: 1,
                            }}
                        >
                            <Grid container spacing={3}>
                                <Grid size={{ xs: 12 }}>
                                    <Typography variant="subtitle2" color="text.secondary" gutterBottom>
                                        Details
                                    </Typography>
                                </Grid>

                                {log.errorMessage && (
                                    <Grid size={{ xs: 12 }}>
                                        <Typography variant="caption" color="error">
                                            Error Message
                                        </Typography>
                                        <Typography variant="body2" color="error">
                                            {log.errorMessage}
                                        </Typography>
                                    </Grid>
                                )}

                                <Grid size={{ xs: 12 }}>
                                    <Typography variant="caption" color="text.secondary">
                                        Payload
                                    </Typography>
                                    <Box
                                        sx={{
                                            maxHeight: 400,
                                            overflow: 'auto',
                                            bgcolor: 'background.paper',
                                            p: 2,
                                            borderRadius: 1,
                                            border: 1,
                                            borderColor: 'divider',
                                        }}
                                    >
                                        <pre
                                            style={{
                                                margin: 0,
                                                fontSize: '0.75rem',
                                                whiteSpace: 'pre-wrap',
                                                wordBreak: 'break-word',
                                            }}
                                        >
                                            {formatJson(log.payload)}
                                        </pre>
                                    </Box>
                                </Grid>
                            </Grid>
                        </Box>
                    );
                }

                return (
                    <IconButton
                        size="small"
                        onClick={() => handleToggleExpand(params.row.id)}
                        aria-label={expandedRows.has(params.row.id) ? 'Collapse row' : 'Expand row'}
                    >
                        {expandedRows.has(params.row.id) ? <ExpandLessIcon /> : <ExpandMoreIcon />}
                    </IconButton>
                );
            },
        },
        {
            field: 'timestamp',
            headerName: 'Timestamp',
            width: 180,
            hideable: false,
            renderCell: (params: GridRenderCellParams<GridRow>) => {
                if (isDetailRow(params.row)) return null;
                return (
                    <Typography variant="body2">
                        {dayjs(params.value).format('MM/DD/YYYY HH:mm:ss')}
                    </Typography>
                );
            },
        },
        {
            field: 'userEmail',
            headerName: 'User',
            width: 180,
            renderCell: (params: GridRenderCellParams<GridRow>) => {
                if (isDetailRow(params.row)) return null;
                return <Typography variant="body2">{params.value || 'System'}</Typography>;
            },
        },
        {
            field: 'action',
            headerName: 'Action',
            width: 220,
            renderCell: (params: GridRenderCellParams<GridRow>) => {
                if (isDetailRow(params.row)) return null;
                const action = params.value as string;
                return (
                    <Chip
                        label={action}
                        color={getActionColor(action)}
                        size="small"
                        variant="outlined"
                        sx={{ fontFamily: 'monospace', fontSize: '0.75rem' }}
                    />
                );
            },
        },
        {
            field: 'entityType',
            headerName: 'Entity',
            width: 100,
            renderCell: (params: GridRenderCellParams<GridRow>) => {
                if (isDetailRow(params.row)) return null;
                return <Typography variant="body2">{params.value || '-'}</Typography>;
            },
        },
        {
            field: 'entityId',
            headerName: 'Entity ID',
            width: 150,
            renderCell: (params: GridRenderCellParams<GridRow>) => {
                if (isDetailRow(params.row)) return null;
                const id = params.value as string | undefined;
                if (!id) return '-';
                // Truncate long IDs
                const display = id.length > 12 ? `${id.substring(0, 8)}...` : id;
                return (
                    <Typography
                        variant="body2"
                        sx={{ fontFamily: 'monospace', fontSize: '0.75rem' }}
                        title={id}
                    >
                        {display}
                    </Typography>
                );
            },
        },
        {
            field: 'result',
            headerName: 'Result',
            width: 100,
            renderCell: (params: GridRenderCellParams<GridRow>) => {
                if (isDetailRow(params.row)) return null;
                const log = params.row as AuditLog;
                const result = getResultFromLog(log);
                return (
                    <Chip
                        label={result}
                        color={getResultColor(result)}
                        size="small"
                    />
                );
            },
        },
        {
            field: 'httpInfo',
            headerName: 'HTTP',
            flex: 1,
            minWidth: 200,
            renderCell: (params: GridRenderCellParams<GridRow>) => {
                if (isDetailRow(params.row)) return null;
                const log = params.row as AuditLog;
                const httpInfo = getHttpInfo(log);
                if (!httpInfo) return <Typography variant="body2" color="text.secondary">-</Typography>;
                return (
                    <Typography variant="body2" sx={{ fontFamily: 'monospace', fontSize: '0.8rem' }}>
                        {httpInfo.method} {httpInfo.path} ({httpInfo.statusCode}) {httpInfo.durationMs}ms
                    </Typography>
                );
            },
        },
    ];

    const renderFilters = () => (
        <Paper sx={{ p: 2, mb: 3 }}>
            <Typography variant="h6" gutterBottom>
                Filters
            </Typography>

            <Stack spacing={2} sx={{ mb: 2 }}>
                <Stack direction="row" spacing={1}>
                    {DATE_PRESETS.map((preset) => (
                        <Button
                            key={preset.label}
                            variant="outlined"
                            size="small"
                            onClick={() => handleDatePreset(preset.hours)}
                        >
                            {preset.label}
                        </Button>
                    ))}
                </Stack>
            </Stack>

            <Grid container spacing={2}>
                <Grid size={{ xs: 12, md: 6 }}>
                    <DateTimePicker
                        label="Start Date"
                        value={tempFilters.startDate ? dayjs(tempFilters.startDate) : null}
                        onChange={(newValue) => {
                            const newFilters = { ...tempFilters };
                            if (newValue) {
                                newFilters.startDate = newValue.toISOString();
                            } else {
                                delete newFilters.startDate;
                            }
                            setTempFilters(newFilters);
                        }}
                        slotProps={{
                            textField: { fullWidth: true },
                        }}
                    />
                </Grid>
                <Grid size={{ xs: 12, md: 6 }}>
                    <DateTimePicker
                        label="End Date"
                        value={tempFilters.endDate ? dayjs(tempFilters.endDate) : null}
                        onChange={(newValue) => {
                            const newFilters = { ...tempFilters };
                            if (newValue) {
                                newFilters.endDate = newValue.toISOString();
                            } else {
                                delete newFilters.endDate;
                            }
                            setTempFilters(newFilters);
                        }}
                        slotProps={{
                            textField: { fullWidth: true },
                        }}
                    />
                </Grid>
                <Grid size={{ xs: 12, md: 6 }}>
                    <TextField
                        fullWidth
                        label="User Email"
                        value={tempFilters.userId || ''}
                        onChange={(e) =>
                            setTempFilters({ ...tempFilters, userId: e.target.value })
                        }
                    />
                </Grid>
                <Grid size={{ xs: 12, md: 6 }}>
                    <TextField
                        fullWidth
                        label="Action (contains)"
                        value={tempFilters.action || ''}
                        onChange={(e) =>
                            setTempFilters({ ...tempFilters, action: e.target.value })
                        }
                        placeholder="e.g., Asset:Created, Job:, :ViaJob"
                    />
                </Grid>
                <Grid size={{ xs: 12, md: 6 }}>
                    <FormControl fullWidth>
                        <InputLabel>Entity Type</InputLabel>
                        <Select
                            value={tempFilters.entityType || ''}
                            label="Entity Type"
                            onChange={(e) =>
                                setTempFilters({ ...tempFilters, entityType: e.target.value })
                            }
                        >
                            <MenuItem value="">All</MenuItem>
                            {ENTITY_TYPE_OPTIONS.map((option) => (
                                <MenuItem key={option} value={option}>
                                    {option}
                                </MenuItem>
                            ))}
                        </Select>
                    </FormControl>
                </Grid>
            </Grid>

            <Stack direction="row" spacing={2} sx={{ mt: 2 }}>
                <Button
                    id="btn-apply-filters"
                    variant="contained"
                    onClick={handleApplyFilters}
                >
                    Apply Filters
                </Button>
                <Button
                    id="btn-clear-filters"
                    variant="outlined"
                    startIcon={<ClearIcon />}
                    onClick={handleClearFilters}
                >
                    Clear Filters
                </Button>
            </Stack>
        </Paper>
    );

    return (
        <LocalizationProvider dateAdapter={AdapterDayjs}>
            <Box>
                <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 3 }}>
                    <Typography variant="h4">Audit Logs</Typography>
                    <Stack direction="row" spacing={2} alignItems="center">
                        {activeTab === 1 && (
                            <>
                                <FormControlLabel
                                    control={
                                        <Switch
                                            checked={autoRefresh}
                                            onChange={(e) => setAutoRefresh(e.target.checked)}
                                            color="primary"
                                        />
                                    }
                                    label="Auto-refresh"
                                />
                                {autoRefresh && (
                                    <Stack direction="row" spacing={1} alignItems="center">
                                        <LiveIndicatorIcon
                                            sx={{
                                                color: 'success.main',
                                                fontSize: 12,
                                                animation: 'pulse 2s infinite',
                                                '@keyframes pulse': {
                                                    '0%, 100%': { opacity: 1 },
                                                    '50%': { opacity: 0.5 },
                                                },
                                            }}
                                        />
                                        <Typography variant="body2" color="success.main">
                                            Live
                                        </Typography>
                                        {lastUpdate && (
                                            <Typography variant="caption" color="text.secondary">
                                                (Last update: {dayjs(lastUpdate).format('HH:mm:ss')})
                                            </Typography>
                                        )}
                                    </Stack>
                                )}
                            </>
                        )}
                        <Button
                            variant="outlined"
                            startIcon={<DownloadIcon />}
                            onClick={handleExportCSV}
                            disabled={logs.length === 0}
                        >
                            Export CSV
                        </Button>
                        <Button
                            variant="outlined"
                            startIcon={<DownloadIcon />}
                            onClick={handleExportJSON}
                            disabled={logs.length === 0}
                        >
                            Export JSON
                        </Button>
                        <Button
                            id="btn-toggle-filters"
                            variant="outlined"
                            startIcon={<FilterListIcon />}
                            onClick={() => setFiltersOpen(!filtersOpen)}
                        >
                            {filtersOpen ? 'Hide Filters' : 'Show Filters'}
                        </Button>
                    </Stack>
                </Box>

                <Paper sx={{ mb: 3 }}>
                    <Tabs
                        value={activeTab}
                        onChange={(_, newValue) => {
                            setActiveTab(newValue);
                            setError(null);
                        }}
                        sx={{ borderBottom: 1, borderColor: 'divider' }}
                    >
                        <Tab label="All Logs" />
                        <Tab label="Live Monitoring" />
                    </Tabs>
                </Paper>

                {filtersOpen && renderFilters()}

                {error && (
                    <Alert severity="error" sx={{ mb: 2 }}>
                        {error}
                    </Alert>
                )}

                {loading && !logs.length ? (
                    <Paper sx={{ p: 2 }}>
                        <Skeleton variant="rectangular" height={400} />
                    </Paper>
                ) : (
                    <Paper sx={{ height: 600, width: '100%' }}>
                        <DataGrid
                            rows={gridRows}
                            columns={columns}
                            loading={loading}
                            pageSizeOptions={[25, 50, 100]}
                            disableRowSelectionOnClick
                            getRowHeight={(params) => {
                                if (isDetailRow(params.model as GridRow)) {
                                    return 'auto';
                                }
                                return 52;
                            }}
                            getRowClassName={(params) => {
                                if (isDetailRow(params.row as GridRow)) {
                                    return 'detail-row';
                                }
                                return '';
                            }}
                            {...(activeTab === 0
                                ? {
                                    paginationMode: 'server' as const,
                                    rowCount: totalCount,
                                    paginationModel: paginationModel,
                                    onPaginationModelChange: setPaginationModel,
                                }
                                : {
                                    paginationMode: 'client' as const,
                                    paginationModel: paginationModel,
                                    onPaginationModelChange: setPaginationModel,
                                }
                            )}
                            slots={{
                                noRowsOverlay: () => (
                                    <Box
                                        sx={{
                                            display: 'flex',
                                            alignItems: 'center',
                                            justifyContent: 'center',
                                            height: '100%',
                                        }}
                                    >
                                        <Typography variant="body1" color="text.secondary">
                                            No audit logs found
                                        </Typography>
                                    </Box>
                                ),
                            }}
                            sx={{
                                '& .MuiDataGrid-row': {
                                    cursor: 'pointer',
                                },
                                '& .MuiDataGrid-cell': {
                                    borderBottom: `1px solid ${theme.palette.divider}`,
                                },
                                '& .detail-row': {
                                    bgcolor: 'background.default',
                                },
                                '& .detail-row .MuiDataGrid-cell': {
                                    borderBottom: 'none',
                                    overflow: 'visible',
                                },
                                '& .detail-row .MuiDataGrid-cell:first-of-type': {
                                    position: 'relative',
                                },
                            }}
                        />
                    </Paper>
                )}
            </Box>
        </LocalizationProvider>
    );
}
