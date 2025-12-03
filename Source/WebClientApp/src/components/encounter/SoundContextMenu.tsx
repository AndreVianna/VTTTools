import {
    Box,
    Button,
    Checkbox,
    CircularProgress,
    FormControlLabel,
    Menu,
    Slider,
    TextField,
    Typography,
    useTheme,
} from '@mui/material';
import { CloudUpload as UploadIcon, FolderOpen as BrowseIcon, Clear as ClearIcon } from '@mui/icons-material';
import type React from 'react';
import { useCallback, useEffect, useRef, useState } from 'react';
import type { EncounterSoundSource } from '@/types/domain';
import { AudioPreviewPlayer, SoundPickerDialog } from '@/components/sounds';
import { useGetMediaResourceQuery, useUploadFileMutation } from '@/services/mediaApi';

export type SoundSourceUpdatePayload = {
    name?: string;
    position?: { x: number; y: number };
    range?: number;
    resourceId?: string | null;
    isPlaying?: boolean;
};

export interface SoundContextMenuProps {
    anchorPosition: { left: number; top: number } | null;
    open: boolean;
    onClose: () => void;
    encounterSoundSource: EncounterSoundSource | null;
    onSoundSourceUpdate?: (sourceIndex: number, updates: SoundSourceUpdatePayload) => void;
    onSoundSourceDelete?: (sourceIndex: number) => void;
}

export const SoundContextMenu: React.FC<SoundContextMenuProps> = ({
    anchorPosition,
    open,
    onClose,
    encounterSoundSource: soundSource,
    onSoundSourceUpdate,
    onSoundSourceDelete,
}) => {
    const theme = useTheme();
    const menuRef = useRef<HTMLDivElement>(null);

    const [nameValue, setNameValue] = useState('');
    const [rangeValue, setRangeValue] = useState(6);
    const [isPlayingValue, setIsPlayingValue] = useState(true);
    const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);
    const [soundPickerOpen, setSoundPickerOpen] = useState(false);
    const [isUploading, setIsUploading] = useState(false);

    const { data: currentResource } = useGetMediaResourceQuery(soundSource?.resourceId ?? '', {
        skip: !soundSource?.resourceId,
    });
    const [uploadFile] = useUploadFileMutation();

    const handleClickOutside = useCallback(
        (event: MouseEvent) => {
            if (menuRef.current && !menuRef.current.contains(event.target as Node)) {
                onClose();
            }
        },
        [onClose],
    );

    useEffect(() => {
        if (open) {
            document.addEventListener('mousedown', handleClickOutside);
            return () => {
                document.removeEventListener('mousedown', handleClickOutside);
            };
        }
        return undefined;
    }, [open, handleClickOutside]);

    useEffect(() => {
        if (soundSource) {
            setNameValue(soundSource.name || '');
            setRangeValue(soundSource.range);
            setIsPlayingValue(soundSource.isPlaying);
            setShowDeleteConfirm(false);
        }
    }, [soundSource]);

    if (!soundSource) return null;

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

    const handleNameChange = (event: React.ChangeEvent<HTMLInputElement>) => {
        setNameValue(event.target.value);
    };

    const handleNameBlur = () => {
        if (onSoundSourceUpdate && nameValue !== (soundSource.name || '')) {
            const trimmedName = nameValue.trim();
            onSoundSourceUpdate(soundSource.index, trimmedName ? { name: trimmedName } : {});
        } else {
            setNameValue(soundSource.name || '');
        }
    };

    const handleNameKeyDown = (event: React.KeyboardEvent<HTMLInputElement>) => {
        if (event.key === 'Enter') {
            (event.target as HTMLInputElement).blur();
        } else if (event.key === 'Escape') {
            setNameValue(soundSource.name || '');
            (event.target as HTMLInputElement).blur();
        }
    };

    const handleRangeChange = (_: Event, value: number | number[]) => {
        setRangeValue(value as number);
    };

    const handleRangeChangeCommitted = (_: Event | React.SyntheticEvent, value: number | number[]) => {
        if (onSoundSourceUpdate && value !== soundSource.range) {
            onSoundSourceUpdate(soundSource.index, { range: value as number });
        }
    };

    const handleBrowseSound = () => {
        setSoundPickerOpen(true);
    };

    const handleSoundSelected = (resourceId: string) => {
        if (onSoundSourceUpdate && soundSource) {
            onSoundSourceUpdate(soundSource.index, { resourceId });
        }
        setSoundPickerOpen(false);
    };

    const handleUploadSound = async (file: File) => {
        if (!soundSource || !onSoundSourceUpdate) return;

        setIsUploading(true);
        try {
            const result = await uploadFile({
                file,
                type: 'encounter',
                resource: 'audio',
            }).unwrap();

            onSoundSourceUpdate(soundSource.index, { resourceId: result.id });
        } catch (_error) {
            console.error('[SoundContextMenu] Failed to upload sound');
        } finally {
            setIsUploading(false);
        }
    };

    const handleClearSound = () => {
        if (onSoundSourceUpdate && soundSource) {
            onSoundSourceUpdate(soundSource.index, { resourceId: null });
        }
    };

    const handleIsPlayingChange = (event: React.ChangeEvent<HTMLInputElement>) => {
        const checked = event.target.checked;
        setIsPlayingValue(checked);
        if (onSoundSourceUpdate) {
            onSoundSourceUpdate(soundSource.index, { isPlaying: checked });
        }
    };

    const handleDeleteClick = () => {
        setShowDeleteConfirm(true);
    };

    const handleDeleteConfirm = () => {
        if (onSoundSourceDelete) {
            onSoundSourceDelete(soundSource.index);
        }
        onClose();
    };

    const handleDeleteCancel = () => {
        setShowDeleteConfirm(false);
    };

    const compactTextFieldStyle = {
        '& .MuiInputBase-root': {
            height: '28px',
            fontSize: '11px',
            backgroundColor: theme.palette.background.default,
        },
        '& .MuiInputBase-input': {
            padding: '4px 8px',
            fontSize: '11px',
        },
    };

    const compactSliderStyle = {
        '& .MuiSlider-markLabel': {
            fontSize: '8px',
        },
    };

    const compactCheckboxStyle = {
        '& .MuiFormControlLabel-label': {
            fontSize: '11px',
        },
        '& .MuiCheckbox-root': {
            padding: '4px',
        },
    };

    return (
        <Menu
            anchorReference="anchorPosition"
            {...(anchorPosition && { anchorPosition })}
            open={open}
            onClose={onClose}
            transformOrigin={{ vertical: 'top', horizontal: 'left' }}
            slotProps={{
                backdrop: {
                    invisible: true,
                    sx: { pointerEvents: 'none' },
                },
                paper: {
                    ref: menuRef,
                    sx: { pointerEvents: 'auto', minWidth: 220 },
                },
                root: {
                    sx: { pointerEvents: 'none' },
                },
            }}
        >
            <Box sx={{ px: 2, py: 1 }}>
                <Typography variant="subtitle2" sx={{ fontSize: '11px', fontWeight: 600, mb: 1 }}>
                    Sound Source
                </Typography>

                <Box sx={{ display: 'flex', flexDirection: 'column', gap: 1.5 }}>
                    <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                        <Typography sx={{ fontSize: '10px', minWidth: 60 }}>Name:</Typography>
                        <TextField
                            value={nameValue}
                            onChange={handleNameChange}
                            onBlur={handleNameBlur}
                            onKeyDown={handleNameKeyDown}
                            size="small"
                            placeholder="Optional"
                            inputProps={{ maxLength: 64 }}
                            sx={{ ...compactTextFieldStyle, flex: 1 }}
                        />
                    </Box>

                    <Box>
                        <Typography sx={{ fontSize: '10px', color: theme.palette.text.secondary, mb: 0.5 }}>
                            Range: {rangeValue} ft
                        </Typography>
                        <Slider
                            value={rangeValue}
                            onChange={handleRangeChange}
                            onChangeCommitted={handleRangeChangeCommitted}
                            min={0.5}
                            max={50}
                            step={0.5}
                            size="small"
                            sx={compactSliderStyle}
                            marks={[
                                { value: 0.5, label: '0.5' },
                                { value: 10, label: '10' },
                                { value: 25, label: '25' },
                                { value: 50, label: '50' },
                            ]}
                        />
                    </Box>

                    <Box>
                        <Typography sx={{ fontSize: '10px', color: theme.palette.text.secondary, fontWeight: 600, mb: 0.5 }}>
                            Sound Resource
                        </Typography>

                        {soundSource.resourceId ? (
                            <Box sx={{ display: 'flex', flexDirection: 'column', gap: 1 }}>
                                <Typography sx={{ fontSize: '10px' }}>
                                    {currentResource?.fileName || 'Loading...'}
                                    {currentResource?.duration && ` (${formatDuration(currentResource.duration)})`}
                                </Typography>

                                <AudioPreviewPlayer resourceId={soundSource.resourceId} compact />

                                <Box sx={{ display: 'flex', gap: 0.5 }}>
                                    <Button
                                        size='small'
                                        variant='outlined'
                                        startIcon={<BrowseIcon sx={{ fontSize: 14 }} />}
                                        onClick={handleBrowseSound}
                                        sx={{ fontSize: '10px', py: 0.25, flex: 1, textTransform: 'none' }}
                                    >
                                        Change
                                    </Button>
                                    <Button
                                        size='small'
                                        variant='outlined'
                                        color='error'
                                        startIcon={<ClearIcon sx={{ fontSize: 14 }} />}
                                        onClick={handleClearSound}
                                        sx={{ fontSize: '10px', py: 0.25, textTransform: 'none' }}
                                    >
                                        Clear
                                    </Button>
                                </Box>
                            </Box>
                        ) : (
                            <Box sx={{ display: 'flex', flexDirection: 'column', gap: 1 }}>
                                <Typography sx={{ fontSize: '10px', color: theme.palette.text.disabled }}>
                                    No sound assigned
                                </Typography>
                                <Box sx={{ display: 'flex', gap: 0.5 }}>
                                    <Button
                                        size='small'
                                        variant='outlined'
                                        startIcon={<BrowseIcon sx={{ fontSize: 14 }} />}
                                        onClick={handleBrowseSound}
                                        sx={{ fontSize: '10px', py: 0.25, flex: 1, textTransform: 'none' }}
                                    >
                                        Browse
                                    </Button>
                                    <Button
                                        size='small'
                                        variant='outlined'
                                        component='label'
                                        startIcon={isUploading ? <CircularProgress size={14} /> : <UploadIcon sx={{ fontSize: 14 }} />}
                                        disabled={isUploading}
                                        sx={{ fontSize: '10px', py: 0.25, textTransform: 'none' }}
                                    >
                                        Upload
                                        <input
                                            type='file'
                                            hidden
                                            accept='.mp3,audio/mpeg'
                                            onChange={(e) => {
                                                const file = e.target.files?.[0];
                                                if (file) {
                                                    handleUploadSound(file);
                                                }
                                                e.target.value = '';
                                            }}
                                        />
                                    </Button>
                                </Box>
                            </Box>
                        )}
                    </Box>

                    <FormControlLabel
                        control={<Checkbox checked={isPlayingValue} onChange={handleIsPlayingChange} size="small" />}
                        label="Playing"
                        sx={compactCheckboxStyle}
                    />

                    {!showDeleteConfirm ? (
                        <Button
                            variant="outlined"
                            color="error"
                            size="small"
                            onClick={handleDeleteClick}
                            sx={{
                                height: '28px',
                                fontSize: '10px',
                                textTransform: 'none',
                                mt: 0.5,
                            }}
                        >
                            Delete Sound
                        </Button>
                    ) : (
                        <Box sx={{ display: 'flex', gap: 1, mt: 0.5 }}>
                            <Button
                                variant="contained"
                                color="error"
                                size="small"
                                onClick={handleDeleteConfirm}
                                sx={{
                                    height: '28px',
                                    fontSize: '10px',
                                    textTransform: 'none',
                                    flex: 1,
                                }}
                            >
                                Confirm
                            </Button>
                            <Button
                                variant="outlined"
                                size="small"
                                onClick={handleDeleteCancel}
                                sx={{
                                    height: '28px',
                                    fontSize: '10px',
                                    textTransform: 'none',
                                    flex: 1,
                                }}
                            >
                                Cancel
                            </Button>
                        </Box>
                    )}
                </Box>
            </Box>

            {soundSource && (
                <SoundPickerDialog
                    open={soundPickerOpen}
                    onClose={() => setSoundPickerOpen(false)}
                    onSelect={handleSoundSelected}
                    {...(soundSource.resourceId && { currentResourceId: soundSource.resourceId })}
                />
            )}
        </Menu>
    );
};
