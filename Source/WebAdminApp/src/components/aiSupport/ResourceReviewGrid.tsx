import { useState, useCallback } from 'react';
import {
    Box,
    Grid,
    Typography,
    Button,
    ToggleButtonGroup,
    ToggleButton,
    Stack,
    Alert,
    CircularProgress,
} from '@mui/material';
import { CheckCircle as ApproveAllIcon } from '@mui/icons-material';
import type { GeneratedResource, ResourceApprovalStatus } from '@/types/resourceApproval';
import { ResourceThumbnail } from './ResourceThumbnail';
import { ResourcePreviewModal } from './ResourcePreviewModal';

type FilterType = 'all' | 'pending' | 'approved' | 'rejected';

interface ResourceReviewGridProps {
    resources: GeneratedResource[];
    onApprove: (resource: GeneratedResource) => Promise<void>;
    onRegenerate: (resource: GeneratedResource) => Promise<void>;
    onReject: (resource: GeneratedResource) => Promise<void>;
    onApproveAll: () => Promise<void>;
    onResourceUpdated: (resource: GeneratedResource) => void;
    isLoading: boolean;
    loadingResourceIds: Set<string>;
}

export function ResourceReviewGrid({
    resources,
    onApprove,
    onRegenerate,
    onReject,
    onApproveAll,
    onResourceUpdated,
    isLoading,
    loadingResourceIds,
}: ResourceReviewGridProps) {
    const [filter, setFilter] = useState<FilterType>('all');
    const [selectedResource, setSelectedResource] = useState<GeneratedResource | null>(null);
    const [modalOpen, setModalOpen] = useState(false);

    const handleFilterChange = useCallback((_: React.MouseEvent<HTMLElement>, newFilter: FilterType | null) => {
        if (newFilter !== null) {
            setFilter(newFilter);
        }
    }, []);

    const handleThumbnailClick = useCallback((resource: GeneratedResource) => {
        setSelectedResource(resource);
        setModalOpen(true);
    }, []);

    const handleCloseModal = useCallback(() => {
        setModalOpen(false);
        setSelectedResource(null);
    }, []);

    const handleApprove = useCallback(async (resource: GeneratedResource) => {
        await onApprove(resource);
        if (selectedResource?.resourceId === resource.resourceId) {
            handleCloseModal();
        }
    }, [onApprove, selectedResource, handleCloseModal]);

    const handleRegenerate = useCallback(async (resource: GeneratedResource) => {
        await onRegenerate(resource);
        if (selectedResource?.resourceId === resource.resourceId) {
            handleCloseModal();
        }
    }, [onRegenerate, selectedResource, handleCloseModal]);

    const handleReject = useCallback(async (resource: GeneratedResource) => {
        await onReject(resource);
        if (selectedResource?.resourceId === resource.resourceId) {
            handleCloseModal();
        }
    }, [onReject, selectedResource, handleCloseModal]);

    const handleResourceUpdated = useCallback((updatedResource: GeneratedResource) => {
        setSelectedResource(updatedResource);
        onResourceUpdated(updatedResource);
    }, [onResourceUpdated]);

    const filteredResources = resources.filter((r) => {
        if (filter === 'all') return true;
        return r.status === filter;
    });

    const pendingCount = resources.filter((r) => r.status === 'pending').length;
    const approvedCount = resources.filter((r) => r.status === 'approved').length;
    const rejectedCount = resources.filter((r) => r.status === 'rejected').length;

    const getStatusCounts = (status: ResourceApprovalStatus) => {
        switch (status) {
            case 'pending':
                return pendingCount;
            case 'approved':
                return approvedCount;
            case 'rejected':
                return rejectedCount;
            default:
                return 0;
        }
    };

    if (resources.length === 0) {
        return (
            <Box sx={{ textAlign: 'center', py: 4 }}>
                <Typography color="text.secondary">
                    No generated resources to review.
                </Typography>
            </Box>
        );
    }

    return (
        <Box>
            <Stack
                direction={{ xs: 'column', sm: 'row' }}
                justifyContent="space-between"
                alignItems={{ xs: 'stretch', sm: 'center' }}
                spacing={2}
                mb={3}
            >
                <Stack direction="row" alignItems="center" spacing={2}>
                    <Typography variant="h6">
                        Review Resources
                    </Typography>
                    <Typography variant="body2" color="text.secondary">
                        {resources.length} total
                    </Typography>
                </Stack>

                <Stack direction={{ xs: 'column', sm: 'row' }} spacing={2} alignItems="center">
                    <ToggleButtonGroup
                        value={filter}
                        exclusive
                        onChange={handleFilterChange}
                        size="small"
                    >
                        <ToggleButton value="all">
                            All ({resources.length})
                        </ToggleButton>
                        <ToggleButton value="pending">
                            Pending ({getStatusCounts('pending')})
                        </ToggleButton>
                        <ToggleButton value="approved">
                            Approved ({getStatusCounts('approved')})
                        </ToggleButton>
                        <ToggleButton value="rejected">
                            Rejected ({getStatusCounts('rejected')})
                        </ToggleButton>
                    </ToggleButtonGroup>

                    {pendingCount > 0 && (
                        <Button
                            id="btn-approve-all"
                            variant="contained"
                            color="success"
                            startIcon={isLoading ? <CircularProgress size={20} color="inherit" /> : <ApproveAllIcon />}
                            onClick={onApproveAll}
                            disabled={isLoading || pendingCount === 0}
                        >
                            Approve All ({pendingCount})
                        </Button>
                    )}
                </Stack>
            </Stack>

            {pendingCount === 0 && resources.length > 0 && (
                <Alert severity="success" sx={{ mb: 3 }}>
                    All resources have been reviewed!
                </Alert>
            )}

            <Grid container spacing={2}>
                {filteredResources.map((resource) => (
                    <Grid key={resource.resourceId} size={{ xs: 6, sm: 4, md: 3, lg: 2 }}>
                        <ResourceThumbnail
                            resource={resource}
                            onClick={() => handleThumbnailClick(resource)}
                            onApprove={() => handleApprove(resource)}
                            onRegenerate={() => handleRegenerate(resource)}
                            onReject={() => handleReject(resource)}
                            isLoading={loadingResourceIds.has(resource.resourceId)}
                        />
                    </Grid>
                ))}
            </Grid>

            <ResourcePreviewModal
                resource={selectedResource}
                open={modalOpen}
                onClose={handleCloseModal}
                onApprove={() => selectedResource && handleApprove(selectedResource)}
                onRegenerate={() => selectedResource && handleRegenerate(selectedResource)}
                onReject={() => selectedResource && handleReject(selectedResource)}
                onResourceUpdated={handleResourceUpdated}
                isLoading={selectedResource ? loadingResourceIds.has(selectedResource.resourceId) : false}
            />
        </Box>
    );
}
