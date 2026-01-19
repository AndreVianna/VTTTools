import React, { useEffect, useState, useCallback, useMemo } from 'react';
import {
    Box,
    Typography,
    Alert,
    Snackbar,
    Paper,
    Button,
    TextField,
    Pagination,
    CircularProgress,
    Tabs,
    Tab,
    Badge,
    Stack,
} from '@mui/material';
import { Refresh as RefreshIcon, Search as SearchIcon } from '@mui/icons-material';
import { ResourceReviewGrid } from '@components/aiSupport';
import { resourcesAdminService } from '@/services/resourcesAdminService';
import type { ResourceInfo, ResourceFilterParams } from '@/types/resourcesAdmin';
import type { GeneratedResource, MediaType } from '@/types/resourceApproval';

interface ResourceTypeTab {
    value: string;
    label: string;
    count: number;
}

const RESOURCE_TYPE_TABS: Omit<ResourceTypeTab, 'count'>[] = [
    { value: 'Portrait', label: 'Portraits' },
    { value: 'Token', label: 'Tokens' },
    { value: 'Background', label: 'Backgrounds' },
    { value: 'Illustration', label: 'Illustrations' },
    { value: 'SoundEffect', label: 'Sound Effects' },
    { value: 'AmbientSound', label: 'Ambient Sounds' },
    { value: 'CutScene', label: 'Cut Scenes' },
];


function getMediaType(contentType: string): MediaType {
    if (contentType.startsWith('audio/')) return 'audio';
    if (contentType.startsWith('video/')) return 'video';
    return 'image';
}

function mapResourceInfoToGeneratedResource(resource: ResourceInfo): GeneratedResource {
    // With junction tables architecture, Resources are pure media metadata.
    // Classification, description, and visibility are set when approving (attaching to an Asset).
    return {
        resourceId: resource.id,
        assetName: resource.fileName.replace(/\.[^/.]+$/, ''),
        generationType: resource.role === 'Token' ? 'Token' : 'Portrait',
        kind: '', // Admin will select when approving
        category: undefined,
        type: undefined,
        subtype: undefined,
        description: '', // Admin will provide when approving
        tags: [],
        imageUrl: resourcesAdminService.getResourceImageUrl(resource.id),
        status: 'pending', // Unapproved resources are always pending
        mediaType: getMediaType(resource.contentType),
        contentType: resource.contentType,
    };
}

export function ResourcesPage() {
    const [resources, setResources] = useState<GeneratedResource[]>([]);
    const [filters, setFilters] = useState<ResourceFilterParams>({ take: 50, skip: 0, role: 'Portrait' });
    const [totalCount, setTotalCount] = useState(0);
    const [isLoading, setIsLoading] = useState(false);
    const [loadingResourceIds, setLoadingResourceIds] = useState<Set<string>>(new Set());
    const [isApprovingAll, setIsApprovingAll] = useState(false);
    const [error, setError] = useState<string | null>(null);
    const [snackbar, setSnackbar] = useState<{ open: boolean; message: string; severity: 'success' | 'error' | 'info' | 'warning' }>({
        open: false,
        message: '',
        severity: 'info',
    });

    const [searchText, setSearchText] = useState('');
    const [tabCounts, setTabCounts] = useState<Record<string, number>>({});
    const [isLoadingCounts, setIsLoadingCounts] = useState(false);

    const assetIdMap = useMemo(() => {
        const map = new Map<string, string>();
        resources.forEach((r) => {
            if (r.assetId) {
                map.set(r.assetName, r.assetId);
            }
        });
        return map;
    }, [resources]);

    const loadTabCounts = useCallback(async () => {
        setIsLoadingCounts(true);
        try {
            const counts: Record<string, number> = {};
            await Promise.all(
                RESOURCE_TYPE_TABS.map(async (tab) => {
                    const response = await resourcesAdminService.listUnpublished({
                        role: tab.value,
                        take: 1,
                        skip: 0,
                    });
                    counts[tab.value] = response.totalCount;
                })
            );
            setTabCounts(counts);
        } catch {
            // Silently fail - counts are not critical
        } finally {
            setIsLoadingCounts(false);
        }
    }, []);

    const loadResources = useCallback(async (params: ResourceFilterParams = filters, signal?: AbortSignal) => {
        setIsLoading(true);
        setError(null);
        try {
            const response = await resourcesAdminService.listUnpublished(params);
            if (signal?.aborted) return;
            setResources(response.items.map(mapResourceInfoToGeneratedResource));
            setTotalCount(response.totalCount);
            setTabCounts((prev) => ({
                ...prev,
                [params.role ?? '']: response.totalCount,
            }));
        } catch (_err) {
            if (signal?.aborted) return;
            setError('Failed to load resources');
        } finally {
            if (!signal?.aborted) {
                setIsLoading(false);
            }
        }
    }, [filters]);

    useEffect(() => {
        loadTabCounts();
    }, [loadTabCounts]);

    useEffect(() => {
        const controller = new AbortController();
        loadResources(filters, controller.signal);
        return () => controller.abort();
    }, [loadResources, filters]);

    const handleRefresh = useCallback(() => {
        loadResources();
        loadTabCounts();
    }, [loadResources, loadTabCounts]);

    const handleTabChange = useCallback((_: React.SyntheticEvent, newValue: string) => {
        const newFilters: ResourceFilterParams = {
            take: 50,
            skip: 0,
            role: newValue,
            searchText: searchText || undefined,
        };
        setFilters(newFilters);
    }, [searchText]);

    const handleSearch = useCallback(() => {
        const newFilters: ResourceFilterParams = {
            ...filters,
            skip: 0,
            searchText: searchText || undefined,
        };
        setFilters(newFilters);
        loadResources(newFilters);
    }, [filters, searchText, loadResources]);

    const handlePageChange = useCallback((_: React.ChangeEvent<unknown>, page: number) => {
        const newFilters = { ...filters, skip: (page - 1) * (filters.take ?? 50) };
        setFilters(newFilters);
        loadResources(newFilters);
    }, [filters, loadResources]);

    const handleApproveResource = useCallback(async (resource: GeneratedResource) => {
        setLoadingResourceIds((prev) => new Set(prev).add(resource.resourceId));

        try {
            const existingAssetId = assetIdMap.get(resource.assetName);
            const response = await resourcesAdminService.approveResource({
                resourceId: resource.resourceId,
                assetName: resource.assetName,
                generationType: resource.generationType,
                kind: resource.kind,
                category: resource.category,
                type: resource.type,
                subtype: resource.subtype,
                description: resource.description,
                tags: resource.tags,
                assetId: existingAssetId,
            });

            setResources((prev) =>
                prev.map((r) =>
                    r.resourceId === resource.resourceId
                        ? { ...r, status: 'approved' as const, assetId: response.assetId }
                        : r
                )
            );

            setSnackbar({
                open: true,
                message: `Approved: ${resource.assetName} (${resource.generationType})`,
                severity: 'success',
            });
        } catch (err) {
            const errorMessage = err instanceof Error ? err.message : 'Unknown error occurred';
            setSnackbar({
                open: true,
                message: `Failed to approve ${resource.assetName}: ${errorMessage}`,
                severity: 'error',
            });
        } finally {
            setLoadingResourceIds((prev) => {
                const next = new Set(prev);
                next.delete(resource.resourceId);
                return next;
            });
        }
    }, [assetIdMap]);

    const handleRegenerateResource = useCallback(async (resource: GeneratedResource) => {
        setLoadingResourceIds((prev) => new Set(prev).add(resource.resourceId));

        try {
            setResources((prev) =>
                prev.map((r) =>
                    r.resourceId === resource.resourceId
                        ? { ...r, status: 'regenerating' as const }
                        : r
                )
            );

            const response = await resourcesAdminService.regenerateResource({
                resourceId: resource.resourceId,
                assetName: resource.assetName,
                generationType: resource.generationType,
                kind: resource.kind,
                category: resource.category,
                type: resource.type,
                description: resource.description,
            });

            setResources((prev) =>
                prev.map((r) =>
                    r.resourceId === resource.resourceId
                        ? {
                              ...r,
                              resourceId: response.resourceId,
                              imageUrl: resourcesAdminService.getResourceImageUrl(response.resourceId),
                              status: 'pending' as const,
                          }
                        : r
                )
            );

            setSnackbar({
                open: true,
                message: `Regenerated: ${resource.assetName} (${resource.generationType})`,
                severity: 'success',
            });
        } catch (err) {
            setResources((prev) =>
                prev.map((r) =>
                    r.resourceId === resource.resourceId
                        ? { ...r, status: 'pending' as const }
                        : r
                )
            );

            const errorMessage = err instanceof Error ? err.message : 'Unknown error occurred';
            setSnackbar({
                open: true,
                message: `Failed to regenerate ${resource.assetName}: ${errorMessage}`,
                severity: 'error',
            });
        } finally {
            setLoadingResourceIds((prev) => {
                const next = new Set(prev);
                next.delete(resource.resourceId);
                return next;
            });
        }
    }, []);

    const handleRejectResource = useCallback(async (resource: GeneratedResource) => {
        setLoadingResourceIds((prev) => new Set(prev).add(resource.resourceId));

        try {
            await resourcesAdminService.rejectResource(resource.resourceId);

            setResources((prev) => prev.filter((r) => r.resourceId !== resource.resourceId));
            setTotalCount((prev) => prev - 1);
            setTabCounts((prev) => ({
                ...prev,
                [filters.role ?? '']: Math.max(0, (prev[filters.role ?? ''] ?? 0) - 1),
            }));

            setSnackbar({
                open: true,
                message: `Rejected: ${resource.assetName} (${resource.generationType})`,
                severity: 'info',
            });
        } catch (err) {
            const errorMessage = err instanceof Error ? err.message : 'Unknown error occurred';
            setSnackbar({
                open: true,
                message: `Failed to reject ${resource.assetName}: ${errorMessage}`,
                severity: 'error',
            });
        } finally {
            setLoadingResourceIds((prev) => {
                const next = new Set(prev);
                next.delete(resource.resourceId);
                return next;
            });
        }
    }, [filters.role]);

    const handleApproveAllResources = useCallback(async () => {
        const pendingResources = resources.filter((r) => r.status === 'pending');
        if (pendingResources.length === 0) return;

        setIsApprovingAll(true);

        for (const resource of pendingResources) {
            await handleApproveResource(resource);
        }

        setIsApprovingAll(false);

        setSnackbar({
            open: true,
            message: `Approved all ${pendingResources.length} resources`,
            severity: 'success',
        });
    }, [resources, handleApproveResource]);

    const handleResourceUpdated = useCallback((updatedResource: GeneratedResource) => {
        setResources((prev) =>
            prev.map((r) =>
                r.resourceId === updatedResource.resourceId ? updatedResource : r
            )
        );
    }, []);

    const pendingCount = resources.filter((r) => r.status === 'pending').length;
    const totalPages = Math.ceil(totalCount / (filters.take ?? 50));
    const currentPage = Math.floor((filters.skip ?? 0) / (filters.take ?? 50)) + 1;
    const currentTab = filters.role ?? 'Portrait';

    return (
        <Box>
            <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 3 }}>
                <Typography variant="h4">
                    Resource Review
                </Typography>
                <Button
                    id="btn-refresh"
                    startIcon={<RefreshIcon />}
                    onClick={handleRefresh}
                    disabled={isLoading || isLoadingCounts}
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
                    value={currentTab}
                    onChange={handleTabChange}
                    variant="scrollable"
                    scrollButtons="auto"
                    sx={{ borderBottom: 1, borderColor: 'divider' }}
                >
                    {RESOURCE_TYPE_TABS.map((tab) => (
                        <Tab
                            key={tab.value}
                            value={tab.value}
                            label={
                                <Badge
                                    badgeContent={tabCounts[tab.value] ?? 0}
                                    color="primary"
                                    max={999}
                                    sx={{ '& .MuiBadge-badge': { right: -12, top: 2 } }}
                                >
                                    {tab.label}
                                </Badge>
                            }
                            id={`tab-${tab.value.toLowerCase()}`}
                            sx={{ minWidth: 120 }}
                        />
                    ))}
                </Tabs>

                <Box sx={{ p: 2 }}>
                    <Stack direction="row" spacing={2} alignItems="center">
                        <TextField
                            id="input-search"
                            label="Search"
                            value={searchText}
                            onChange={(e) => setSearchText(e.target.value)}
                            onKeyDown={(e) => e.key === 'Enter' && handleSearch()}
                            size="small"
                            sx={{ minWidth: 200 }}
                        />
                        <Button
                            id="btn-search"
                            variant="contained"
                            startIcon={<SearchIcon />}
                            onClick={handleSearch}
                            disabled={isLoading}
                        >
                            Search
                        </Button>
                    </Stack>
                </Box>
            </Paper>

            <Paper sx={{ p: 3 }}>
                {isLoading ? (
                    <Box sx={{ display: 'flex', justifyContent: 'center', py: 4 }}>
                        <CircularProgress />
                    </Box>
                ) : (
                    <>
                        <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 2 }}>
                            <Typography variant="subtitle1" color="text.secondary">
                                {totalCount} {currentTab.toLowerCase()}s found ({pendingCount} pending review)
                            </Typography>
                        </Box>

                        <ResourceReviewGrid
                            resources={resources}
                            onApprove={handleApproveResource}
                            onRegenerate={handleRegenerateResource}
                            onReject={handleRejectResource}
                            onApproveAll={handleApproveAllResources}
                            onResourceUpdated={handleResourceUpdated}
                            isLoading={isApprovingAll}
                            loadingResourceIds={loadingResourceIds}
                        />

                        {totalPages > 1 && (
                            <Box sx={{ display: 'flex', justifyContent: 'center', mt: 3 }}>
                                <Pagination
                                    count={totalPages}
                                    page={currentPage}
                                    onChange={handlePageChange}
                                    color="primary"
                                />
                            </Box>
                        )}
                    </>
                )}
            </Paper>

            <Snackbar
                open={snackbar.open}
                autoHideDuration={6000}
                onClose={() => setSnackbar((prev) => ({ ...prev, open: false }))}
            >
                <Alert
                    onClose={() => setSnackbar((prev) => ({ ...prev, open: false }))}
                    severity={snackbar.severity}
                    sx={{ width: '100%' }}
                >
                    {snackbar.message}
                </Alert>
            </Snackbar>
        </Box>
    );
}
