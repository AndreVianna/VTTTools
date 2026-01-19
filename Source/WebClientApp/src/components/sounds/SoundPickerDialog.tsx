import React, { useEffect, useState } from 'react';
import {
    AudioFile as AudioFileIcon,
    Close as CloseIcon,
    CloudUpload as UploadIcon,
    Search as SearchIcon,
} from '@mui/icons-material';
import {
    Box,
    Button,
    Card,
    CardContent,
    CircularProgress,
    Dialog,
    IconButton,
    InputAdornment,
    TextField,
    ToggleButton,
    ToggleButtonGroup,
    Typography,
    useTheme,
} from '@mui/material';
import { useFileUpload } from '@/hooks/useFileUpload';
import { useFilterResourcesQuery } from '@/services/mediaApi';
import { ResourceRole } from '@/types/domain';
import { AudioPreviewPlayer } from './AudioPreviewPlayer';

export interface SoundPickerDialogProps {
    open: boolean;
    onClose: () => void;
    onSelect: (resourceId: string) => void;
    currentResourceId?: string;
    defaultResourceType?: ResourceRole.SoundEffect | ResourceRole.AmbientSound;
}

export const SoundPickerDialog: React.FC<SoundPickerDialogProps> = ({
    open,
    onClose,
    onSelect,
    currentResourceId,
    defaultResourceType = ResourceRole.AmbientSound,
}) => {
    const theme = useTheme();

    const [searchQuery, setSearchQuery] = useState('');
    const [ownershipFilter, setOwnershipFilter] = useState<'mine' | 'all'>('mine');
    const [soundTypeFilter, setSoundTypeFilter] = useState<ResourceRole.SoundEffect | ResourceRole.AmbientSound>(defaultResourceType);
    const [selectedResourceId, setSelectedResourceId] = useState<string | null>(null);


    const { data, isLoading, refetch } = useFilterResourcesQuery({
        role: soundTypeFilter,
        ...(searchQuery && { searchText: searchQuery }),
        take: 50,
    }, { skip: !open });
    const resources = data?.items ?? [];
    const { uploadState, uploadFile } = useFileUpload({
        role: ResourceRole[soundTypeFilter],
        onSuccess: async (resource) => {
            await refetch();
            setSelectedResourceId(resource.id);
        },
        onError: (error) => {
            console.error('[SoundPickerDialog] Failed to upload sound:', error);
        },
    });

    const filteredResources = resources;

    useEffect(() => {
        if (open && currentResourceId) {
            queueMicrotask(() => {
                setSelectedResourceId(currentResourceId);
            });
        }
    }, [open, currentResourceId]);

    const handleClose = () => {
        setSearchQuery('');
        setSelectedResourceId(null);
        onClose();
    };

    const handleSelect = () => {
        if (selectedResourceId) {
            onSelect(selectedResourceId);
            handleClose();
        }
    };

    const handleCardClick = (resourceId: string) => {
        setSelectedResourceId(resourceId);
    };

    const handleUpload = async (file: File) => {
        await uploadFile(file);
    };

    const selectedResource = filteredResources.find((r) => r.id === selectedResourceId);

    const formatFileSize = (bytes: number): string => {
        if (bytes < 1024) return `${bytes} B`;
        if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)} KB`;
        return `${(bytes / (1024 * 1024)).toFixed(1)} MB`;
    };

    const formatDuration = (duration: string): string => {
        if (!duration) return '0:00';

        const match = duration.match(/PT(?:(\d+)H)?(?:(\d+)M)?(?:(\d+(?:\.\d+)?)S)?/);
        if (!match) return duration;

        const hours = parseInt(match[1] || '0', 10);
        const minutes = parseInt(match[2] || '0', 10);
        const seconds = Math.floor(parseFloat(match[3] || '0'));

        if (hours > 0) {
            return `${hours}:${minutes.toString().padStart(2, '0')}:${seconds.toString().padStart(2, '0')}`;
        }
        return `${minutes}:${seconds.toString().padStart(2, '0')}`;
    };

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
                    Select Sound
                </Typography>
                <IconButton onClick={handleClose} size="small">
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
                {/* Left Sidebar */}
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
                    <TextField
                        size="small"
                        placeholder="Search..."
                        value={searchQuery}
                        onChange={(e) => setSearchQuery(e.target.value)}
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
                            SOUND TYPE
                        </Typography>
                        <ToggleButtonGroup
                            value={soundTypeFilter}
                            exclusive
                            onChange={(_, value) => {
                                if (value !== null) {
                                    setSoundTypeFilter(value);
                                    setSelectedResourceId(null);
                                }
                            }}
                            size="small"
                            fullWidth
                            sx={{
                                '& .MuiToggleButton-root': {
                                    fontSize: '0.65rem',
                                    py: 0.5,
                                },
                            }}
                        >
                            <ToggleButton value={ResourceRole.AmbientSound}>Ambient</ToggleButton>
                            <ToggleButton value={ResourceRole.SoundEffect}>Effect</ToggleButton>
                        </ToggleButtonGroup>
                    </Box>

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
                            onChange={(_, value) => {
                                if (value !== null) {
                                    setOwnershipFilter(value);
                                }
                            }}
                            size="small"
                            fullWidth
                            sx={{
                                '& .MuiToggleButton-root': {
                                    fontSize: '0.75rem',
                                    py: 0.5,
                                },
                            }}
                        >
                            <ToggleButton value="mine">Mine</ToggleButton>
                            <ToggleButton value="all">All</ToggleButton>
                        </ToggleButtonGroup>
                    </Box>

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
                            variant="outlined"
                            component="label"
                            fullWidth
                            startIcon={uploadState.isUploading ? <CircularProgress size={16} /> : <UploadIcon />}
                            disabled={uploadState.isUploading}
                            sx={{
                                fontSize: '0.65rem',
                                py: 0.75,
                            }}
                        >
                            {uploadState.isUploading ? 'Uploading...' : `Upload ${soundTypeFilter === ResourceRole.SoundEffect ? 'Effect' : 'Ambient'}`}
                            <input
                                type="file"
                                hidden
                                accept=".mp3,.wav,.ogg,.webm,audio/mpeg,audio/wav,audio/ogg,audio/webm"
                                onChange={(e) => {
                                    const file = e.target.files?.[0];
                                    if (file) {
                                        handleUpload(file);
                                    }
                                    e.target.value = '';
                                }}
                            />
                        </Button>
                    </Box>
                </Box>

                {/* Main Content Area */}
                <Box
                    sx={{
                        flex: 1,
                        display: 'flex',
                        overflow: 'hidden',
                    }}
                >
                    {/* Sound Cards Grid */}
                    <Box
                        sx={{
                            flex: 1,
                            p: 2,
                            overflow: 'auto',
                        }}
                    >
                        {isLoading ? (
                            <Box
                                sx={{
                                    display: 'flex',
                                    alignItems: 'center',
                                    justifyContent: 'center',
                                    height: '100%',
                                }}
                            >
                                <CircularProgress />
                            </Box>
                        ) : filteredResources.length === 0 ? (
                            <Box
                                sx={{
                                    display: 'flex',
                                    alignItems: 'center',
                                    justifyContent: 'center',
                                    height: '100%',
                                }}
                            >
                                <Typography
                                    sx={{
                                        color: theme.palette.text.secondary,
                                        fontSize: '0.875rem',
                                    }}
                                >
                                    No sounds found
                                </Typography>
                            </Box>
                        ) : (
                            <Box
                                sx={{
                                    display: 'flex',
                                    flexWrap: 'wrap',
                                    gap: 2,
                                    alignContent: 'flex-start',
                                }}
                            >
                                {filteredResources.map((resource) => (
                                    <Card
                                        key={resource.id}
                                        onClick={() => handleCardClick(resource.id)}
                                        sx={{
                                            width: 140,
                                            height: 100,
                                            cursor: 'pointer',
                                            border: `2px solid ${
                                                selectedResourceId === resource.id
                                                    ? theme.palette.primary.main
                                                    : 'transparent'
                                            }`,
                                            backgroundColor:
                                                selectedResourceId === resource.id
                                                    ? theme.palette.action.selected
                                                    : theme.palette.background.paper,
                                            transition: 'all 0.2s',
                                            '&:hover': {
                                                backgroundColor: theme.palette.action.hover,
                                                borderColor: theme.palette.primary.light,
                                            },
                                        }}
                                    >
                                        <CardContent
                                            sx={{
                                                p: 1.5,
                                                '&:last-child': { pb: 1.5 },
                                                display: 'flex',
                                                flexDirection: 'column',
                                                alignItems: 'center',
                                                justifyContent: 'center',
                                                height: '100%',
                                            }}
                                        >
                                            <AudioFileIcon
                                                sx={{
                                                    fontSize: 32,
                                                    color: theme.palette.primary.main,
                                                    mb: 1,
                                                }}
                                            />
                                            <Typography
                                                sx={{
                                                    fontSize: '0.75rem',
                                                    fontWeight: 500,
                                                    textAlign: 'center',
                                                    overflow: 'hidden',
                                                    textOverflow: 'ellipsis',
                                                    whiteSpace: 'nowrap',
                                                    width: '100%',
                                                    mb: 0.5,
                                                }}
                                            >
                                                {resource.fileName}
                                            </Typography>
                                            <Typography
                                                sx={{
                                                    fontSize: '0.65rem',
                                                    color: theme.palette.text.secondary,
                                                }}
                                            >
                                                {formatDuration(resource.duration)}
                                            </Typography>
                                        </CardContent>
                                    </Card>
                                ))}
                            </Box>
                        )}
                    </Box>

                    {/* Right Sidebar - Preview */}
                    {selectedResource && (
                        <Box
                            sx={{
                                width: 280,
                                borderLeft: `1px solid ${theme.palette.divider}`,
                                p: 2,
                                overflow: 'auto',
                                backgroundColor:
                                    theme.palette.mode === 'dark'
                                        ? 'rgba(0,0,0,0.2)'
                                        : theme.palette.grey[50],
                            }}
                        >
                            <Typography
                                variant="caption"
                                sx={{
                                    color: theme.palette.text.secondary,
                                    fontWeight: 600,
                                    display: 'block',
                                    mb: 2,
                                }}
                            >
                                PREVIEW
                            </Typography>

                            <Box sx={{ mb: 3 }}>
                                <AudioPreviewPlayer resourceId={selectedResource.id} />
                            </Box>

                            <Box sx={{ display: 'flex', flexDirection: 'column', gap: 1.5 }}>
                                <Box>
                                    <Typography
                                        variant="caption"
                                        sx={{
                                            color: theme.palette.text.secondary,
                                            fontSize: '0.65rem',
                                            fontWeight: 600,
                                        }}
                                    >
                                        FILE NAME
                                    </Typography>
                                    <Typography
                                        sx={{
                                            fontSize: '0.75rem',
                                            wordBreak: 'break-all',
                                        }}
                                    >
                                        {selectedResource.fileName}
                                    </Typography>
                                </Box>

                                <Box>
                                    <Typography
                                        variant="caption"
                                        sx={{
                                            color: theme.palette.text.secondary,
                                            fontSize: '0.65rem',
                                            fontWeight: 600,
                                        }}
                                    >
                                        DURATION
                                    </Typography>
                                    <Typography sx={{ fontSize: '0.75rem' }}>
                                        {formatDuration(selectedResource.duration)}
                                    </Typography>
                                </Box>

                                <Box>
                                    <Typography
                                        variant="caption"
                                        sx={{
                                            color: theme.palette.text.secondary,
                                            fontSize: '0.65rem',
                                            fontWeight: 600,
                                        }}
                                    >
                                        FILE SIZE
                                    </Typography>
                                    <Typography sx={{ fontSize: '0.75rem' }}>
                                        {formatFileSize(selectedResource.fileSize)}
                                    </Typography>
                                </Box>

                                <Box>
                                    <Typography
                                        variant="caption"
                                        sx={{
                                            color: theme.palette.text.secondary,
                                            fontSize: '0.65rem',
                                            fontWeight: 600,
                                        }}
                                    >
                                        CONTENT TYPE
                                    </Typography>
                                    <Typography sx={{ fontSize: '0.75rem' }}>
                                        {selectedResource.contentType}
                                    </Typography>
                                </Box>
                            </Box>
                        </Box>
                    )}
                </Box>
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
                        theme.palette.mode === 'dark' ? 'rgba(0,0,0,0.2)' : theme.palette.grey[50],
                }}
            >
                <Button onClick={handleClose} variant="outlined">
                    Cancel
                </Button>
                <Button
                    onClick={handleSelect}
                    variant="contained"
                    disabled={!selectedResourceId}
                    sx={{ minWidth: 120 }}
                >
                    Select Sound
                </Button>
            </Box>
        </Dialog>
    );
};
