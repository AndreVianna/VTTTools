import React, { useEffect, useState, useCallback } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import {
    Box,
    Typography,
    Alert,
    Snackbar,
    Tabs,
    Tab,
    Paper,
    Button,
} from '@mui/material';
import {
    Refresh as RefreshIcon,
    FileUpload as FileUploadIcon,
} from '@mui/icons-material';
import type { AppDispatch } from '@store/store';
import {
    fetchProcessingAssets,
    fetchReviewAssets,
    fetchHistoryAssets,
    ingestAssets,
    selectProcessingAssets,
    selectProcessingTotalCount,
    selectReviewAssets,
    selectReviewTotalCount,
    selectHistoryAssets,
    selectHistoryTotalCount,
    selectIsLoading,
    selectIsSubmitting,
    selectError,
    clearError,
} from '@store/slices/ingestSlice';
import type { IngestAssetsRequest } from '@/types/ingest';
import { ImportDialog } from '@components/ingest/ImportDialog';
import { ProcessingTab } from '@components/ingest/ProcessingTab';
import { ReviewTab } from '@components/ingest/ReviewTab';
import { HistoryTab } from '@components/ingest/HistoryTab';

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
            id={`ingest-tabpanel-${index}`}
            aria-labelledby={`ingest-tab-${index}`}
            {...other}
        >
            {value === index && <Box sx={{ pt: 3 }}>{children}</Box>}
        </div>
    );
}

export function AssetIngestPage() {
    const dispatch = useDispatch<AppDispatch>();
    const processingAssets = useSelector(selectProcessingAssets);
    const processingTotalCount = useSelector(selectProcessingTotalCount);
    const reviewAssets = useSelector(selectReviewAssets);
    const reviewTotalCount = useSelector(selectReviewTotalCount);
    const historyAssets = useSelector(selectHistoryAssets);
    const historyTotalCount = useSelector(selectHistoryTotalCount);
    const isLoading = useSelector(selectIsLoading);
    const isSubmitting = useSelector(selectIsSubmitting);
    const error = useSelector(selectError);

    const [tabValue, setTabValue] = useState(0);
    const [importDialogOpen, setImportDialogOpen] = useState(false);
    const [snackbar, setSnackbar] = useState<{
        open: boolean;
        message: string;
        severity: 'success' | 'error' | 'info' | 'warning';
    }>({
        open: false,
        message: '',
        severity: 'info',
    });

    const [processingPage, setProcessingPage] = useState(0);
    const [reviewPage, setReviewPage] = useState(0);
    const [historyPage, setHistoryPage] = useState(0);
    const rowsPerPage = 20;

    const loadProcessingData = useCallback(() => {
        dispatch(fetchProcessingAssets({ skip: processingPage * rowsPerPage, take: rowsPerPage }));
    }, [dispatch, processingPage, rowsPerPage]);

    const loadReviewData = useCallback(() => {
        dispatch(fetchReviewAssets({ skip: reviewPage * rowsPerPage, take: rowsPerPage }));
    }, [dispatch, reviewPage, rowsPerPage]);

    const loadHistoryData = useCallback(() => {
        dispatch(fetchHistoryAssets({ skip: historyPage * rowsPerPage, take: rowsPerPage }));
    }, [dispatch, historyPage, rowsPerPage]);

    const loadCurrentTabData = useCallback(() => {
        switch (tabValue) {
            case 0:
                loadProcessingData();
                break;
            case 1:
                loadReviewData();
                break;
            case 2:
                loadHistoryData();
                break;
        }
    }, [tabValue, loadProcessingData, loadReviewData, loadHistoryData]);

    // Load data when tab changes or page changes for current tab
    useEffect(() => {
        loadCurrentTabData();
    }, [loadCurrentTabData]);

    const handleTabChange = (_: React.SyntheticEvent, newValue: number) => {
        setTabValue(newValue);
    };

    const handleRefresh = useCallback(() => {
        loadCurrentTabData();
    }, [loadCurrentTabData]);

    const handleOpenImportDialog = useCallback(() => {
        setImportDialogOpen(true);
    }, []);

    const handleCloseImportDialog = useCallback(() => {
        setImportDialogOpen(false);
    }, []);

    const handleImport = useCallback(async (request: IngestAssetsRequest) => {
        const result = await dispatch(ingestAssets(request));
        if (ingestAssets.fulfilled.match(result)) {
            setImportDialogOpen(false);
            setTabValue(0); // Switch to Processing tab
            setSnackbar({
                open: true,
                message: `Import started: ${result.payload.itemCount} items queued for processing`,
                severity: 'success',
            });
            loadProcessingData(); // Load processing tab since we switched there
        } else {
            setSnackbar({
                open: true,
                message: 'Failed to import assets',
                severity: 'error',
            });
        }
    }, [dispatch, loadProcessingData]);

    const handleCloseSnackbar = useCallback(() => {
        setSnackbar(prev => ({ ...prev, open: false }));
    }, []);

    const handleCloseError = useCallback(() => {
        dispatch(clearError());
    }, [dispatch]);

    return (
        <Box>
            <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 3 }}>
                <Typography variant="h4">
                    Asset Ingest
                </Typography>
                <Box sx={{ display: 'flex', gap: 2 }}>
                    <Button
                        id="btn-import"
                        startIcon={<FileUploadIcon />}
                        onClick={handleOpenImportDialog}
                        variant="contained"
                        disabled={isSubmitting}
                    >
                        Import Assets
                    </Button>
                    <Button
                        id="btn-refresh"
                        startIcon={<RefreshIcon />}
                        onClick={handleRefresh}
                        disabled={isLoading}
                    >
                        Refresh
                    </Button>
                </Box>
            </Box>

            {error && (
                <Alert severity="error" sx={{ mb: 3 }} onClose={handleCloseError}>
                    {error}
                </Alert>
            )}

            <Paper sx={{ mb: 3 }}>
                <Tabs
                    value={tabValue}
                    onChange={handleTabChange}
                    aria-label="Asset Ingest tabs"
                    sx={{ borderBottom: 1, borderColor: 'divider' }}
                >
                    <Tab
                        label={`Processing (${processingTotalCount})`}
                        id="ingest-tab-0"
                        aria-controls="ingest-tabpanel-0"
                    />
                    <Tab
                        label={`Review (${reviewTotalCount})`}
                        id="ingest-tab-1"
                        aria-controls="ingest-tabpanel-1"
                    />
                    <Tab
                        label={`History (${historyTotalCount})`}
                        id="ingest-tab-2"
                        aria-controls="ingest-tabpanel-2"
                    />
                </Tabs>

                <Box sx={{ p: 3 }}>
                    <TabPanel value={tabValue} index={0}>
                        <ProcessingTab
                            assets={processingAssets}
                            totalCount={processingTotalCount}
                            page={processingPage}
                            rowsPerPage={rowsPerPage}
                            isLoading={isLoading}
                            onPageChange={setProcessingPage}
                            onRefresh={handleRefresh}
                        />
                    </TabPanel>

                    <TabPanel value={tabValue} index={1}>
                        <ReviewTab
                            assets={reviewAssets}
                            totalCount={reviewTotalCount}
                            page={reviewPage}
                            rowsPerPage={rowsPerPage}
                            isLoading={isLoading}
                            onPageChange={setReviewPage}
                            onRefresh={handleRefresh}
                        />
                    </TabPanel>

                    <TabPanel value={tabValue} index={2}>
                        <HistoryTab
                            assets={historyAssets}
                            totalCount={historyTotalCount}
                            page={historyPage}
                            rowsPerPage={rowsPerPage}
                            isLoading={isLoading}
                            onPageChange={setHistoryPage}
                        />
                    </TabPanel>
                </Box>
            </Paper>

            <ImportDialog
                open={importDialogOpen}
                onClose={handleCloseImportDialog}
                onImport={handleImport}
                isSubmitting={isSubmitting}
            />

            <Snackbar
                open={snackbar.open}
                autoHideDuration={6000}
                onClose={handleCloseSnackbar}
            >
                <Alert
                    onClose={handleCloseSnackbar}
                    severity={snackbar.severity}
                    sx={{ width: '100%' }}
                >
                    {snackbar.message}
                </Alert>
            </Snackbar>
        </Box>
    );
}
