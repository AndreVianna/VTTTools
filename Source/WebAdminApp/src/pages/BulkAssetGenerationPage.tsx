import { useEffect, useState, useCallback } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import {
    Box,
    Typography,
    Grid,
    Alert,
    Snackbar,
    Tabs,
    Tab,
    Paper,
    Button,
    Dialog,
    DialogTitle,
    DialogContent,
    DialogActions,
} from '@mui/material';
import { Refresh as RefreshIcon } from '@mui/icons-material';
import type { AppDispatch, RootState } from '@store/store';
import {
    fetchJobHistory,
    fetchJobStatus,
    startBulkGeneration,
    cancelJob,
    retryJob,
    addItemStarted,
    addItemCompleted,
    handleJobCompleted,
    handleJobCanceled,
    handleJobRetried,
    clearItemUpdates,
    selectJobs,
    selectTotalCount,
    selectCurrentJob,
    selectIsLoading,
    selectIsSubmitting,
    selectError,
    selectItemUpdates,
} from '@store/slices/jobsSlice';
import { useJobsHub } from '@/hooks/useJobsHub';
import {
    BulkAssetGenerationForm,
    JobStatusCard,
    JobProgressLog,
    JobHistoryList,
} from '@components/aiSupport';
import type {
    BulkAssetGenerationRequest,
    JobCreatedEvent,
    JobCompletedEvent,
    JobCanceledEvent,
    JobRetriedEvent,
    JobItemStartedEvent,
    JobItemCompletedEvent,
} from '@/types/jobs';
import { JobStatus } from '@/types/jobs';

interface TabPanelProps {
    children?: React.ReactNode;
    index: number;
    value: number;
}

function TabPanel(props: TabPanelProps) {
    const { children, value, index, ...other } = props;
    return (
        <div
            role="tabpanel"
            hidden={value !== index}
            id={`ai-support-tabpanel-${index}`}
            aria-labelledby={`ai-support-tab-${index}`}
            {...other}
        >
            {value === index && <Box sx={{ pt: 3 }}>{children}</Box>}
        </div>
    );
}

const EMPTY_ITEM_UPDATES: never[] = [];

export function BulkAssetGenerationPage() {
    const dispatch = useDispatch<AppDispatch>();
    const jobs = useSelector(selectJobs);
    const totalCount = useSelector(selectTotalCount);
    const currentJob = useSelector(selectCurrentJob);
    const isLoading = useSelector(selectIsLoading);
    const isSubmitting = useSelector(selectIsSubmitting);
    const error = useSelector(selectError);
    const itemUpdates = useSelector((state: RootState) => {
        const jobId = state.jobs.currentJob?.jobId;
        return jobId ? selectItemUpdates(state, jobId) : EMPTY_ITEM_UPDATES;
    });

    const [tabValue, setTabValue] = useState(0);
    const [page, setPage] = useState(0);
    const [rowsPerPage, setRowsPerPage] = useState(20);
    const [snackbar, setSnackbar] = useState<{ open: boolean; message: string; severity: 'success' | 'error' | 'info' | 'warning' }>({
        open: false,
        message: '',
        severity: 'info',
    });
    const [confirmDialog, setConfirmDialog] = useState<{ open: boolean; jobId: string | null; action: 'cancel' | 'retry' }>({
        open: false,
        jobId: null,
        action: 'cancel',
    });

    const handleJobCreated = useCallback((_event: JobCreatedEvent) => {
        // Event received - job info already in Redux from startBulkGeneration
    }, []);

    const handleJobItemStarted = useCallback((event: JobItemStartedEvent) => {
        dispatch(addItemStarted(event));
    }, [dispatch]);

    const handleJobItemCompleted = useCallback((event: JobItemCompletedEvent) => {
        dispatch(addItemCompleted(event));
    }, [dispatch]);

    const handleJobCompletedEvent = useCallback((event: JobCompletedEvent) => {
        dispatch(handleJobCompleted({ jobId: event.jobId }));
        setSnackbar({
            open: true,
            message: 'Job completed successfully',
            severity: 'success',
        });
    }, [dispatch]);

    const handleJobCanceledEvent = useCallback((event: JobCanceledEvent) => {
        dispatch(handleJobCanceled({ jobId: event.jobId }));
        setSnackbar({
            open: true,
            message: 'Job was canceled',
            severity: 'info',
        });
    }, [dispatch]);

    const handleJobRetriedEvent = useCallback((event: JobRetriedEvent) => {
        dispatch(handleJobRetried({ jobId: event.jobId }));
        setSnackbar({
            open: true,
            message: 'Job retry started',
            severity: 'info',
        });
    }, [dispatch]);

    const { connect, subscribeToJob, unsubscribeFromJob } = useJobsHub({
        onJobCreated: handleJobCreated,
        onJobCompleted: handleJobCompletedEvent,
        onJobCanceled: handleJobCanceledEvent,
        onJobRetried: handleJobRetriedEvent,
        onJobItemStarted: handleJobItemStarted,
        onJobItemCompleted: handleJobItemCompleted,
    });

    useEffect(() => {
        dispatch(fetchJobHistory({ skip: page * rowsPerPage, take: rowsPerPage }));
    }, [dispatch, page, rowsPerPage]);

    useEffect(() => {
        if (currentJob?.jobId && (currentJob.status === JobStatus.Pending || currentJob.status === JobStatus.InProgress)) {
            connect()
                .then(() => subscribeToJob(currentJob.jobId))
                .then(() => dispatch(fetchJobStatus(currentJob.jobId)))
                .catch(() => { /* SignalR connection error - job will still work via polling */ });

            return () => {
                unsubscribeFromJob(currentJob.jobId).catch(() => {});
            };
        }
        return undefined;
    }, [currentJob?.jobId, currentJob?.status, connect, subscribeToJob, unsubscribeFromJob, dispatch]);

    const handleSubmit = useCallback(async (request: BulkAssetGenerationRequest) => {
        const result = await dispatch(startBulkGeneration(request));
        if (startBulkGeneration.fulfilled.match(result)) {
            setTabValue(1);
            setSnackbar({
                open: true,
                message: 'Job started successfully',
                severity: 'success',
            });
        }
    }, [dispatch]);

    const handleCancelJob = useCallback((jobId: string) => {
        setConfirmDialog({ open: true, jobId, action: 'cancel' });
    }, []);

    const handleRetryJob = useCallback((jobId: string) => {
        setConfirmDialog({ open: true, jobId, action: 'retry' });
    }, []);

    const handleConfirmAction = useCallback(async () => {
        const { jobId, action } = confirmDialog;
        if (!jobId) return;

        if (action === 'cancel') {
            const result = await dispatch(cancelJob(jobId));
            if (cancelJob.fulfilled.match(result)) {
                setSnackbar({ open: true, message: 'Job cancelled', severity: 'info' });
            }
        } else {
            dispatch(clearItemUpdates(jobId));
            const result = await dispatch(retryJob({ jobId }));
            if (retryJob.fulfilled.match(result)) {
                setSnackbar({ open: true, message: 'Retry started', severity: 'success' });
            }
        }

        setConfirmDialog({ open: false, jobId: null, action: 'cancel' });
    }, [dispatch, confirmDialog]);

    const handleViewJob = useCallback(async (jobId: string) => {
        await dispatch(fetchJobStatus(jobId));
        setTabValue(1);
    }, [dispatch]);

    const handleRefresh = useCallback(() => {
        dispatch(fetchJobHistory({ skip: page * rowsPerPage, take: rowsPerPage }));
        if (currentJob?.jobId) {
            dispatch(fetchJobStatus(currentJob.jobId));
        }
    }, [dispatch, page, rowsPerPage, currentJob?.jobId]);

    const handleTabChange = (_: React.SyntheticEvent, newValue: number) => {
        setTabValue(newValue);
    };

    return (
        <Box>
            <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 3 }}>
                <Typography variant="h4">
                    AI-Powered Asset Generation
                </Typography>
                <Button
                    id="btn-refresh"
                    startIcon={<RefreshIcon />}
                    onClick={handleRefresh}
                    disabled={isLoading}
                >
                    Refresh
                </Button>
            </Box>

            {error && (
                <Alert severity="error" sx={{ mb: 3 }}>
                    {error}
                </Alert>
            )}

            <Paper sx={{ mb: 3 }}>
                <Tabs
                    value={tabValue}
                    onChange={handleTabChange}
                    aria-label="AI Support tabs"
                    sx={{ borderBottom: 1, borderColor: 'divider' }}
                >
                    <Tab label="New Generation" id="ai-support-tab-0" aria-controls="ai-support-tabpanel-0" />
                    <Tab
                        label={currentJob ? 'Current Job' : 'Job Details'}
                        id="ai-support-tab-1"
                        aria-controls="ai-support-tabpanel-1"
                        disabled={!currentJob}
                    />
                    <Tab label="Job History" id="ai-support-tab-2" aria-controls="ai-support-tabpanel-2" />
                </Tabs>

                <Box sx={{ p: 3 }}>
                    <TabPanel value={tabValue} index={0}>
                        <BulkAssetGenerationForm
                            onSubmit={handleSubmit}
                            isSubmitting={isSubmitting}
                            disabled={isSubmitting}
                        />
                    </TabPanel>

                    <TabPanel value={tabValue} index={1}>
                        {currentJob && (
                            <Grid container spacing={3}>
                                <Grid size={{ xs: 12, lg: 5 }}>
                                    <JobStatusCard
                                        job={currentJob}
                                        onCancel={handleCancelJob}
                                        onRetry={handleRetryJob}
                                    />
                                </Grid>
                                <Grid size={{ xs: 12, lg: 7 }}>
                                    <JobProgressLog
                                        itemUpdates={itemUpdates}
                                        totalItems={currentJob.totalItems}
                                        maxHeight={500}
                                        autoScroll
                                    />
                                </Grid>
                            </Grid>
                        )}
                    </TabPanel>

                    <TabPanel value={tabValue} index={2}>
                        <JobHistoryList
                            jobs={jobs}
                            totalCount={totalCount}
                            page={page}
                            rowsPerPage={rowsPerPage}
                            isLoading={isLoading}
                            error={error}
                            onPageChange={setPage}
                            onRowsPerPageChange={(rpp) => {
                                setRowsPerPage(rpp);
                                setPage(0);
                            }}
                            onViewJob={handleViewJob}
                            onCancelJob={handleCancelJob}
                            onRetryJob={handleRetryJob}
                        />
                    </TabPanel>
                </Box>
            </Paper>

            <Snackbar
                open={snackbar.open}
                autoHideDuration={6000}
                onClose={() => setSnackbar(prev => ({ ...prev, open: false }))}
            >
                <Alert
                    onClose={() => setSnackbar(prev => ({ ...prev, open: false }))}
                    severity={snackbar.severity}
                    sx={{ width: '100%' }}
                >
                    {snackbar.message}
                </Alert>
            </Snackbar>

            <Dialog open={confirmDialog.open} onClose={() => setConfirmDialog({ open: false, jobId: null, action: 'cancel' })}>
                <DialogTitle>
                    {confirmDialog.action === 'cancel' ? 'Cancel Job?' : 'Retry Failed Items?'}
                </DialogTitle>
                <DialogContent>
                    <Typography>
                        {confirmDialog.action === 'cancel'
                            ? 'Are you sure you want to cancel this job? This action cannot be undone.'
                            : 'This will retry all failed items in the job. Continue?'}
                    </Typography>
                </DialogContent>
                <DialogActions>
                    <Button onClick={() => setConfirmDialog({ open: false, jobId: null, action: 'cancel' })}>
                        Cancel
                    </Button>
                    <Button
                        onClick={handleConfirmAction}
                        color={confirmDialog.action === 'cancel' ? 'error' : 'primary'}
                        variant="contained"
                    >
                        {confirmDialog.action === 'cancel' ? 'Cancel Job' : 'Retry'}
                    </Button>
                </DialogActions>
            </Dialog>
        </Box>
    );
}
