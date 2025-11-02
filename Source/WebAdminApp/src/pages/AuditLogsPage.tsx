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
} from '@mui/icons-material';
import IconButton from '@mui/material/IconButton';
import { DateTimePicker } from '@mui/x-date-pickers/DateTimePicker';
import { LocalizationProvider } from '@mui/x-date-pickers/LocalizationProvider';
import { AdapterDateFns } from '@mui/x-date-pickers/AdapterDateFnsV3';
import { format } from 'date-fns';
import { auditLogService, AuditLog, AuditLogQueryParams } from '@services/auditLogService';

const DATE_PRESETS = [
    { label: 'Last Hour', hours: 1 },
    { label: 'Today', hours: 24 },
    { label: 'Last 7 Days', hours: 24 * 7 },
    { label: 'Last 30 Days', hours: 24 * 30 },
];

const RESULT_OPTIONS = ['Success', 'Failure', 'Error'];

const formatJson = (json: string | undefined | null): string => {
    if (!json) return 'N/A';
    try {
        const parsed = JSON.parse(json);
        return JSON.stringify(parsed, null, 2);
    } catch {
        return json;
    }
};

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
        result: '',
        ipAddress: '',
        keyword: '',
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
            result: '',
            ipAddress: '',
            keyword: '',
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

    const columns: GridColDef[] = [
        {
            field: 'expand',
            headerName: '',
            width: 50,
            sortable: false,
            disableColumnMenu: true,
            renderCell: (params: GridRenderCellParams) => (
                <IconButton
                    size="small"
                    onClick={() => handleToggleExpand(params.row.id)}
                    aria-label={expandedRows.has(params.row.id) ? 'Collapse row' : 'Expand row'}
                >
                    {expandedRows.has(params.row.id) ? <ExpandLessIcon /> : <ExpandMoreIcon />}
                </IconButton>
            ),
        },
        {
            field: 'timestamp',
            headerName: 'Timestamp',
            width: 180,
            renderCell: (params: GridRenderCellParams) => {
                if (expandedRows.has(params.row.id)) {
                    return null;
                }
                return (
                    <Typography variant="body2">
                        {format(new Date(params.value), 'MM/dd/yyyy HH:mm:ss')}
                    </Typography>
                );
            },
        },
        {
            field: 'userEmail',
            headerName: 'User',
            width: 200,
            renderCell: (params: GridRenderCellParams) => {
                if (expandedRows.has(params.row.id)) {
                    return null;
                }
                return <Typography variant="body2">{params.value || 'Anonymous'}</Typography>;
            },
        },
        {
            field: 'action',
            headerName: 'Action',
            flex: 1,
            minWidth: 250,
            renderCell: (params: GridRenderCellParams) => {
                if (expandedRows.has(params.row.id)) {
                    return null;
                }
                return (
                    <Typography variant="body2" sx={{ fontFamily: 'monospace', fontSize: '0.85rem' }}>
                        {params.row.httpMethod} {params.row.path}
                    </Typography>
                );
            },
        },
        {
            field: 'result',
            headerName: 'Result',
            width: 120,
            renderCell: (params: GridRenderCellParams) => {
                if (expandedRows.has(params.row.id)) {
                    return null;
                }
                return (
                    <Chip
                        label={params.value}
                        color={getResultColor(params.value)}
                        size="small"
                    />
                );
            },
        },
        {
            field: 'statusCode',
            headerName: 'Status',
            width: 80,
            align: 'center',
            renderCell: (params: GridRenderCellParams) => {
                if (expandedRows.has(params.row.id)) {
                    return null;
                }
                return params.value;
            },
        },
        {
            field: 'durationInMilliseconds',
            headerName: 'Duration (ms)',
            width: 120,
            align: 'right',
            renderCell: (params: GridRenderCellParams) => {
                if (expandedRows.has(params.row.id)) {
                    return null;
                }
                return <Typography variant="body2">{params.value}</Typography>;
            },
        },
        {
            field: 'ipAddress',
            headerName: 'IP Address',
            width: 140,
            renderCell: (params: GridRenderCellParams) => {
                if (expandedRows.has(params.row.id)) {
                    return null;
                }
                return (
                    <Typography variant="body2" sx={{ fontFamily: 'monospace', fontSize: '0.85rem' }}>
                        {params.value || '-'}
                    </Typography>
                );
            },
        },
        {
            field: 'details',
            headerName: '',
            flex: 1,
            sortable: false,
            disableColumnMenu: true,
            renderCell: (params: GridRenderCellParams) => {
                if (!expandedRows.has(params.row.id)) {
                    return null;
                }
                const row = params.row as AuditLog;
                return (
                    <Box
                        sx={{
                            width: '100%',
                            p: 2,
                            backgroundColor: theme.palette.background.default,
                        }}
                    >
                        <Grid container spacing={2}>
                            <Grid item xs={12} md={6}>
                                <Typography variant="subtitle2" gutterBottom>
                                    User Agent
                                </Typography>
                                <Typography
                                    variant="body2"
                                    sx={{
                                        fontFamily: 'monospace',
                                        fontSize: '0.8rem',
                                        wordBreak: 'break-word',
                                    }}
                                >
                                    {row.userAgent || '-'}
                                </Typography>
                            </Grid>
                            <Grid item xs={12} md={6}>
                                <Typography variant="subtitle2" gutterBottom>
                                    Query String
                                </Typography>
                                <Typography
                                    variant="body2"
                                    sx={{
                                        fontFamily: 'monospace',
                                        fontSize: '0.8rem',
                                        wordBreak: 'break-word',
                                    }}
                                >
                                    {row.queryString || '-'}
                                </Typography>
                            </Grid>
                            <Grid item xs={12}>
                                <Typography variant="subtitle2" gutterBottom>
                                    Request Body
                                </Typography>
                                <Paper
                                    sx={{
                                        p: 1,
                                        backgroundColor: theme.palette.mode === 'dark'
                                            ? 'rgba(0, 0, 0, 0.3)'
                                            : 'rgba(0, 0, 0, 0.02)',
                                        maxHeight: 200,
                                        overflow: 'auto',
                                    }}
                                >
                                    <pre
                                        style={{
                                            margin: 0,
                                            fontFamily: 'monospace',
                                            fontSize: '0.75rem',
                                            whiteSpace: 'pre-wrap',
                                            wordBreak: 'break-word',
                                        }}
                                    >
                                        {formatJson(row.requestBody)}
                                    </pre>
                                </Paper>
                            </Grid>
                            <Grid item xs={12}>
                                <Typography variant="subtitle2" gutterBottom>
                                    Response Body
                                </Typography>
                                <Paper
                                    sx={{
                                        p: 1,
                                        backgroundColor: theme.palette.mode === 'dark'
                                            ? 'rgba(0, 0, 0, 0.3)'
                                            : 'rgba(0, 0, 0, 0.02)',
                                        maxHeight: 200,
                                        overflow: 'auto',
                                    }}
                                >
                                    <pre
                                        style={{
                                            margin: 0,
                                            fontFamily: 'monospace',
                                            fontSize: '0.75rem',
                                            whiteSpace: 'pre-wrap',
                                            wordBreak: 'break-word',
                                        }}
                                    >
                                        {formatJson(row.responseBody)}
                                    </pre>
                                </Paper>
                            </Grid>
                        </Grid>
                    </Box>
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
                <Grid item xs={12} md={6}>
                    <DateTimePicker
                        label="Start Date"
                        value={tempFilters.startDate ? new Date(tempFilters.startDate) : null}
                        onChange={(newValue) =>
                            setTempFilters({
                                ...tempFilters,
                                startDate: newValue?.toISOString() || undefined,
                            })
                        }
                        slotProps={{
                            textField: { fullWidth: true },
                        }}
                    />
                </Grid>
                <Grid item xs={12} md={6}>
                    <DateTimePicker
                        label="End Date"
                        value={tempFilters.endDate ? new Date(tempFilters.endDate) : null}
                        onChange={(newValue) =>
                            setTempFilters({
                                ...tempFilters,
                                endDate: newValue?.toISOString() || undefined,
                            })
                        }
                        slotProps={{
                            textField: { fullWidth: true },
                        }}
                    />
                </Grid>
                <Grid item xs={12} md={6}>
                    <TextField
                        fullWidth
                        label="User Email"
                        value={tempFilters.userId || ''}
                        onChange={(e) =>
                            setTempFilters({ ...tempFilters, userId: e.target.value })
                        }
                    />
                </Grid>
                <Grid item xs={12} md={6}>
                    <TextField
                        fullWidth
                        label="Action (Path)"
                        value={tempFilters.action || ''}
                        onChange={(e) =>
                            setTempFilters({ ...tempFilters, action: e.target.value })
                        }
                    />
                </Grid>
                <Grid item xs={12} md={6}>
                    <FormControl fullWidth>
                        <InputLabel>Result</InputLabel>
                        <Select
                            value={tempFilters.result || ''}
                            label="Result"
                            onChange={(e) =>
                                setTempFilters({ ...tempFilters, result: e.target.value })
                            }
                        >
                            <MenuItem value="">All</MenuItem>
                            {RESULT_OPTIONS.map((option) => (
                                <MenuItem key={option} value={option}>
                                    {option}
                                </MenuItem>
                            ))}
                        </Select>
                    </FormControl>
                </Grid>
                <Grid item xs={12} md={6}>
                    <TextField
                        fullWidth
                        label="IP Address"
                        value={tempFilters.ipAddress || ''}
                        onChange={(e) =>
                            setTempFilters({ ...tempFilters, ipAddress: e.target.value })
                        }
                    />
                </Grid>
                <Grid item xs={12}>
                    <TextField
                        fullWidth
                        label="Keyword (searches request/response)"
                        value={tempFilters.keyword || ''}
                        onChange={(e) =>
                            setTempFilters({ ...tempFilters, keyword: e.target.value })
                        }
                    />
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
        <LocalizationProvider dateAdapter={AdapterDateFns}>
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
                                                (Last update: {format(lastUpdate, 'HH:mm:ss')})
                                            </Typography>
                                        )}
                                    </Stack>
                                )}
                            </>
                        )}
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
                            rows={logs}
                            columns={columns}
                            rowCount={activeTab === 0 ? totalCount : logs.length}
                            loading={loading}
                            pageSizeOptions={[25, 50, 100]}
                            paginationModel={paginationModel}
                            paginationMode={activeTab === 0 ? 'server' : 'client'}
                            onPaginationModelChange={setPaginationModel}
                            disableRowSelectionOnClick
                            getDetailPanelContent={getDetailPanelContent}
                            getDetailPanelHeight={() => 'auto'}
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
                            }}
                        />
                    </Paper>
                )}
            </Box>
        </LocalizationProvider>
    );
}
