import React, { useCallback, useEffect, useRef, useState } from 'react';
import {
    CloudUpload as UploadIcon,
    Search as SearchIcon,
} from '@mui/icons-material';
import {
    Box,
    Button,
    CircularProgress,
    InputAdornment,
    LinearProgress,
    TextField,
    ToggleButton,
    ToggleButtonGroup,
    Typography,
    useTheme,
} from '@mui/material';
import { useFileUpload } from '@/hooks/useFileUpload';
import { ResourceRole } from '@/types/domain';
import { DimensionSlider } from './DimensionSlider';
import { DurationSlider } from './DurationSlider';
import { MediaTypeFilter } from './MediaTypeFilter';
import type { ResourcePickerFiltersProps } from './types';

const DEBOUNCE_DELAY = 300;

// Default dimension range: 720px (SD) to 65535px (max)
const DEFAULT_DIMENSION_RANGE: [number, number] = [720, 65535];

export const ResourcePickerFilters: React.FC<ResourcePickerFiltersProps> = ({
    searchQuery,
    onSearchChange,
    ownershipFilter,
    onOwnershipChange,
    acceptedFileTypes,
    defaultUploadRole,
    onUploadComplete,
    contentTypeHint,
    mediaTypeFilter,
    onMediaTypeChange,
    dimensionRange,
    onDimensionRangeChange,
    durationRange,
    onDurationRangeChange,
    maxDurationMs = 0,
}) => {
    const theme = useTheme();
    const [localSearchQuery, setLocalSearchQuery] = useState(searchQuery);
    const debounceTimeoutRef = useRef<ReturnType<typeof setTimeout> | null>(null);

    const { uploadState, uploadFile } = useFileUpload({
        role: defaultUploadRole ? ResourceRole[defaultUploadRole] : undefined,
        onSuccess: () => {
            onUploadComplete();
        },
        onError: (error) => {
            console.error('[ResourcePickerFilters] Upload failed:', error);
        },
    });

    // Sync external searchQuery changes to local state
    useEffect(() => {
        setLocalSearchQuery(searchQuery);
    }, [searchQuery]);

    // Debounced search
    const handleSearchChange = useCallback(
        (e: React.ChangeEvent<HTMLInputElement>) => {
            const value = e.target.value;
            setLocalSearchQuery(value);

            if (debounceTimeoutRef.current) {
                clearTimeout(debounceTimeoutRef.current);
            }

            debounceTimeoutRef.current = setTimeout(() => {
                onSearchChange(value);
            }, DEBOUNCE_DELAY);
        },
        [onSearchChange]
    );

    // Cleanup debounce timeout on unmount
    useEffect(() => {
        return () => {
            if (debounceTimeoutRef.current) {
                clearTimeout(debounceTimeoutRef.current);
            }
        };
    }, []);

    const handleOwnershipChange = useCallback(
        (_: React.MouseEvent<HTMLElement>, value: 'mine' | 'all' | null) => {
            if (value !== null) {
                onOwnershipChange(value);
            }
        },
        [onOwnershipChange]
    );

    const handleFileSelect = useCallback(
        async (e: React.ChangeEvent<HTMLInputElement>) => {
            const file = e.target.files?.[0];
            if (file) {
                await uploadFile(file);
            }
            e.target.value = '';
        },
        [uploadFile]
    );

    const getUploadButtonLabel = (): string => {
        if (uploadState.isUploading) {
            return 'Uploading...';
        }
        return 'Upload File';
    };

    // Determine which filters to show based on content type
    const showMediaTypeFilter = contentTypeHint === 'mixed' && onMediaTypeChange !== undefined;
    const showDimensionFilter = (contentTypeHint === 'mixed' || contentTypeHint === 'image' || contentTypeHint === 'video') && onDimensionRangeChange !== undefined;
    const showDurationFilter = (contentTypeHint === 'mixed' || contentTypeHint === 'video' || contentTypeHint === 'audio') && onDurationRangeChange !== undefined;
    const showSemanticFilters = showMediaTypeFilter || showDimensionFilter || showDurationFilter;

    // Handle dimension range changes (convert null to default)
    const handleDimensionRangeChange = useCallback(
        (range: [number, number]) => {
            onDimensionRangeChange?.(range);
        },
        [onDimensionRangeChange]
    );

    // Handle duration range changes
    const handleDurationRangeChange = useCallback(
        (range: [number, number]) => {
            onDurationRangeChange?.(range);
        },
        [onDurationRangeChange]
    );

    return (
        <Box
            sx={{
                width: 200,
                borderRight: `1px solid ${theme.palette.divider}`,
                p: 2,
                display: 'flex',
                flexDirection: 'column',
                gap: 2,
            }}
        >
            {/* Upload Section (moved to top) */}
            <Box>
                <Typography
                    variant="caption"
                    sx={{
                        color: theme.palette.text.secondary,
                        fontWeight: 600,
                        mb: 1,
                        display: 'block',
                    }}
                >
                    UPLOAD
                </Typography>
                <Button
                    id="btn-upload-resource"
                    variant="outlined"
                    component="label"
                    fullWidth
                    startIcon={
                        uploadState.isUploading ? (
                            <CircularProgress size={16} />
                        ) : (
                            <UploadIcon />
                        )
                    }
                    disabled={uploadState.isUploading}
                    sx={{
                        fontSize: '0.75rem',
                        py: 0.75,
                    }}
                >
                    {getUploadButtonLabel()}
                    <input
                        type="file"
                        hidden
                        accept={acceptedFileTypes}
                        onChange={handleFileSelect}
                    />
                </Button>

                {/* Upload Progress */}
                {uploadState.isUploading && (
                    <Box sx={{ mt: 1 }}>
                        <LinearProgress
                            variant="determinate"
                            value={uploadState.progress}
                            sx={{
                                height: 4,
                                borderRadius: 2,
                            }}
                        />
                        <Typography
                            variant="caption"
                            sx={{
                                color: theme.palette.text.secondary,
                                fontSize: '0.65rem',
                                display: 'block',
                                mt: 0.5,
                            }}
                        >
                            {uploadState.fileName} ({uploadState.progress}%)
                        </Typography>
                    </Box>
                )}

                {/* Upload Error */}
                {uploadState.error && (
                    <Typography
                        variant="caption"
                        sx={{
                            color: theme.palette.error.main,
                            fontSize: '0.65rem',
                            display: 'block',
                            mt: 1,
                        }}
                    >
                        {uploadState.error}
                    </Typography>
                )}
            </Box>

            {/* Search Field */}
            <TextField
                id="input-resource-search"
                size="small"
                placeholder="Search..."
                value={localSearchQuery}
                onChange={handleSearchChange}
                InputProps={{
                    startAdornment: (
                        <InputAdornment position="start">
                            <SearchIcon sx={{ fontSize: 18 }} />
                        </InputAdornment>
                    ),
                }}
                sx={{
                    '& .MuiOutlinedInput-root': {
                        fontSize: '0.875rem',
                    },
                }}
            />

            {/* Semantic Filters Section */}
            {showSemanticFilters && (
                <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
                    {/* Media Type Filter (for mixed content - backgrounds) */}
                    {showMediaTypeFilter && (
                        <MediaTypeFilter
                            value={mediaTypeFilter ?? []}
                            onChange={onMediaTypeChange}
                        />
                    )}

                    {/* Dimension Slider (for images/videos) */}
                    {showDimensionFilter && (
                        <DimensionSlider
                            value={dimensionRange ?? DEFAULT_DIMENSION_RANGE}
                            onChange={handleDimensionRangeChange}
                        />
                    )}

                    {/* Duration Slider (for video/audio) */}
                    {showDurationFilter && maxDurationMs > 0 && (
                        <DurationSlider
                            value={durationRange ?? [0, maxDurationMs]}
                            onChange={handleDurationRangeChange}
                            maxDurationMs={maxDurationMs}
                        />
                    )}
                </Box>
            )}

            {/* Ownership Filter */}
            <Box>
                <Typography
                    variant="caption"
                    sx={{
                        color: theme.palette.text.secondary,
                        fontWeight: 600,
                        mb: 1,
                        display: 'block',
                    }}
                >
                    OWNERSHIP
                </Typography>
                <ToggleButtonGroup
                    value={ownershipFilter}
                    exclusive
                    onChange={handleOwnershipChange}
                    size="small"
                    fullWidth
                    sx={{
                        '& .MuiToggleButton-root': {
                            fontSize: '0.75rem',
                            py: 0.5,
                        },
                    }}
                >
                    <ToggleButton id="btn-filter-mine" value="mine">
                        Mine
                    </ToggleButton>
                    <ToggleButton id="btn-filter-all" value="all">
                        All
                    </ToggleButton>
                </ToggleButtonGroup>
            </Box>
        </Box>
    );
};
