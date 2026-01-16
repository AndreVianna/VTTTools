import React, { useCallback, useEffect } from 'react';
import { Close as CloseIcon } from '@mui/icons-material';
import {
    Box,
    Button,
    Dialog,
    IconButton,
    Typography,
    useTheme,
} from '@mui/material';
import type { ResourcePickerDialogProps } from './types';
import { useResourcePicker } from './useResourcePicker';
import { ResourcePickerFilters } from './ResourcePickerFilters';
import { ResourcePickerGrid } from './ResourcePickerGrid';
import { ResourcePickerPreview } from './ResourcePickerPreview';

export const ResourcePickerDialog: React.FC<ResourcePickerDialogProps> = ({
    open,
    onClose,
    onSelect,
    currentResourceId,
    config,
}) => {
    const theme = useTheme();

    const {
        resources,
        selectedResource,
        isLoading,
        searchQuery,
        ownershipFilter,
        selectedResourceId,
        viewMode,
        refetch,
        setSearchQuery,
        setOwnershipFilter,
        selectResource,
        reset,
    } = useResourcePicker({
        config,
        initialResourceId: currentResourceId,
    });

    // Reset state when dialog opens with a new currentResourceId
    useEffect(() => {
        if (open && currentResourceId) {
            const existing = resources.find((r) => r.id === currentResourceId);
            if (existing) {
                selectResource(existing);
            }
        }
    }, [open, currentResourceId, resources, selectResource]);

    const handleClose = useCallback(() => {
        reset();
        onClose();
    }, [reset, onClose]);

    const handleSelect = useCallback(() => {
        if (selectedResource) {
            onSelect(selectedResource);
            handleClose();
        }
    }, [selectedResource, onSelect, handleClose]);

    const handleUploadComplete = useCallback(() => {
        refetch();
    }, [refetch]);

    const dialogTitle = config.title ?? 'Select Resource';
    const selectButtonLabel = config.selectButtonLabel ?? 'Select';

    return (
        <Dialog
            open={open}
            onClose={handleClose}
            maxWidth="lg"
            fullWidth
            PaperProps={{
                sx: {
                    height: '80vh',
                    backgroundColor: theme.palette.background.paper,
                },
            }}
        >
            {/* Header */}
            <Box
                sx={{
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'space-between',
                    px: 3,
                    py: 1.5,
                    borderBottom: `1px solid ${theme.palette.divider}`,
                }}
            >
                <Typography variant="h6" sx={{ fontWeight: 600 }}>
                    {dialogTitle}
                </Typography>
                <IconButton id="btn-close-dialog" onClick={handleClose} size="small">
                    <CloseIcon />
                </IconButton>
            </Box>

            {/* Main Content */}
            <Box
                sx={{
                    display: 'flex',
                    flex: 1,
                    overflow: 'hidden',
                }}
            >
                {/* Left Sidebar - Filters */}
                <ResourcePickerFilters
                    searchQuery={searchQuery}
                    onSearchChange={setSearchQuery}
                    ownershipFilter={ownershipFilter}
                    onOwnershipChange={setOwnershipFilter}
                    acceptedFileTypes={config.acceptedFileTypes}
                    defaultUploadRole={config.defaultUploadRole}
                    onUploadComplete={handleUploadComplete}
                />

                {/* Center - Resource Grid */}
                <ResourcePickerGrid
                    resources={resources}
                    isLoading={isLoading}
                    selectedResourceId={selectedResourceId}
                    onSelect={selectResource}
                    viewMode={viewMode}
                    contentTypeHint={config.contentTypeHint}
                />

                {/* Right Sidebar - Preview */}
                <ResourcePickerPreview resource={selectedResource} />
            </Box>

            {/* Footer */}
            <Box
                sx={{
                    display: 'flex',
                    justifyContent: 'flex-end',
                    gap: 2,
                    px: 3,
                    py: 1.5,
                    borderTop: `1px solid ${theme.palette.divider}`,
                    backgroundColor:
                        theme.palette.mode === 'dark'
                            ? 'rgba(0,0,0,0.2)'
                            : theme.palette.grey[50],
                }}
            >
                <Button id="btn-cancel" onClick={handleClose} variant="outlined">
                    Cancel
                </Button>
                <Button
                    id="btn-select-resource"
                    onClick={handleSelect}
                    variant="contained"
                    disabled={!selectedResource}
                    sx={{ minWidth: 120 }}
                >
                    {selectButtonLabel}
                </Button>
            </Box>
        </Dialog>
    );
};
