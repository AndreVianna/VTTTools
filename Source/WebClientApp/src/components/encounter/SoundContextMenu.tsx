import {
    Box,
    Button,
    CircularProgress,
    IconButton,
    LinearProgress,
    Menu,
    Slider,
    TextField,
    Tooltip,
    Typography,
    useTheme,
} from '@mui/material';
import {
    FolderOpen as BrowseIcon,
    PlayArrow as PlayIcon,
    Pause as PauseIcon,
    Repeat as LoopIcon,
} from '@mui/icons-material';
import type React from 'react';
import { useCallback, useEffect, useRef, useState } from 'react';
import type { StageSound } from '@/types/stage';
import { SoundPickerDialog } from '@/components/sounds';
import { useGetMediaResourceQuery } from '@/services/mediaApi';
import { useAuthenticatedResource } from '@/hooks/useAuthenticatedResource';

export type SoundSourceUpdatePayload = {
    name?: string;
    position?: { x: number; y: number };
    radius?: number;
    mediaId?: string | null;
    isPlaying?: boolean;
    loop?: boolean;
};

export interface SoundContextMenuProps {
    anchorPosition: { left: number; top: number } | null;
    open: boolean;
    onClose: () => void;
    encounterSoundSource: StageSound | null;
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
    const audioRef = useRef<HTMLAudioElement>(null);

    const [nameValue, setNameValue] = useState('');
    const [rangeValue, setRangeValue] = useState(6);
    const [isPlayingValue, setIsPlayingValue] = useState(false);
    const [loopValue, setLoopValue] = useState(false);
    const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);
    const [soundPickerOpen, setSoundPickerOpen] = useState(false);

    const [currentTime, setCurrentTime] = useState(0);
    const [duration, setDuration] = useState(0);
    const [isAudioLoading, setIsAudioLoading] = useState(false);

    const resourceId = soundSource?.media?.id;
    const { data: currentResource } = useGetMediaResourceQuery(resourceId ?? '', {
        skip: !resourceId,
    });

    const audioResourceUrl = resourceId ? `/api/resources/${resourceId}` : null;
    const { url: audioBlobUrl, isLoading: isResourceLoading } = useAuthenticatedResource(audioResourceUrl ?? '');

    const prevResourceIdRef = useRef(resourceId);

    if (prevResourceIdRef.current !== resourceId) {
        prevResourceIdRef.current = resourceId;

        if (!resourceId) {
            if (isAudioLoading !== false) setIsAudioLoading(false);
            if (currentTime !== 0) setCurrentTime(0);
            if (duration !== 0) setDuration(0);
        } else {
            if (isAudioLoading !== true) setIsAudioLoading(true);
            if (currentTime !== 0) setCurrentTime(0);
            if (duration !== 0) setDuration(0);
        }
    }

    useEffect(() => {
        const audio = audioRef.current;
        if (!audio) return;

        const handleLoadedMetadata = () => {
            setDuration(audio.duration);
            setIsAudioLoading(false);
            audio.loop = loopValue;
        };

        const handleTimeUpdate = () => {
            setCurrentTime(audio.currentTime);
        };

        const handleEnded = () => {
            if (!loopValue) {
                setIsPlayingValue(false);
                setCurrentTime(0);
            }
        };

        const handleError = () => {
            setIsAudioLoading(false);
        };

        audio.addEventListener('loadedmetadata', handleLoadedMetadata);
        audio.addEventListener('timeupdate', handleTimeUpdate);
        audio.addEventListener('ended', handleEnded);
        audio.addEventListener('error', handleError);

        return () => {
            audio.removeEventListener('loadedmetadata', handleLoadedMetadata);
            audio.removeEventListener('timeupdate', handleTimeUpdate);
            audio.removeEventListener('ended', handleEnded);
            audio.removeEventListener('error', handleError);
        };
    }, [audioBlobUrl, loopValue]);

    useEffect(() => {
        const audio = audioRef.current;
        if (!audio) return;

        if (isPlayingValue && audioBlobUrl) {
            audio.play().catch(() => {
                setIsPlayingValue(false);
            });
        } else {
            audio.pause();
        }
    }, [isPlayingValue, audioBlobUrl]);

    useEffect(() => {
        const audio = audioRef.current;
        if (audio) {
            audio.loop = loopValue;
        }
    }, [loopValue]);

    useEffect(() => {
        // Reset audio playback state when menu closes
        if (!open) {
            const audio = audioRef.current;
            if (audio) {
                audio.pause();
                audio.currentTime = 0;
            }
            // eslint-disable-next-line react-hooks/set-state-in-effect
            setIsPlayingValue(false);
             
            setCurrentTime(0);
        }
    }, [open]);

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

    const sourceIndex = soundSource?.index;
    const prevSourceIndexRef = useRef<number | undefined>(undefined);

    useEffect(() => {
        // Sync form state when context menu opens or sound source changes
        if (open && soundSource && prevSourceIndexRef.current !== sourceIndex) {
            // eslint-disable-next-line react-hooks/set-state-in-effect
            setNameValue(soundSource.name || '');
             
            setRangeValue(soundSource.radius);
             
            setLoopValue(soundSource.loop ?? false);
             
            setShowDeleteConfirm(false);
            prevSourceIndexRef.current = sourceIndex;
        }
    }, [open, soundSource, sourceIndex]);

    if (!soundSource) return null;

    const formatTime = (seconds: number): string => {
        if (!isFinite(seconds)) return '0:00';
        const minutes = Math.floor(seconds / 60);
        const secs = Math.floor(seconds % 60);
        return `${minutes}:${secs.toString().padStart(2, '0')}`;
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
        if (onSoundSourceUpdate && value !== soundSource.radius) {
            onSoundSourceUpdate(soundSource.index, { radius: value as number });
        }
    };

    const handleBrowseSound = () => {
        setSoundPickerOpen(true);
    };

    const handleSoundSelected = (selectedResourceId: string) => {
        if (onSoundSourceUpdate && soundSource) {
            onSoundSourceUpdate(soundSource.index, { mediaId: selectedResourceId });
        }
        setSoundPickerOpen(false);
    };

    const handleTogglePlaying = () => {
        setIsPlayingValue(!isPlayingValue);
    };

    const handleToggleLoop = () => {
        const newValue = !loopValue;
        setLoopValue(newValue);
        if (onSoundSourceUpdate) {
            onSoundSourceUpdate(soundSource.index, { loop: newValue });
        }
    };

    const handleProgressClick = (event: React.MouseEvent<HTMLDivElement>) => {
        const audio = audioRef.current;
        if (!audio || duration === 0) return;

        const rect = event.currentTarget.getBoundingClientRect();
        const clickX = event.clientX - rect.left;
        const percentage = clickX / rect.width;
        const newTime = percentage * duration;

        audio.currentTime = newTime;
        setCurrentTime(newTime);
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

    const progressPercentage = duration > 0 ? (currentTime / duration) * 100 : 0;
    const isLoading = isResourceLoading || isAudioLoading;

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
                    <Box>
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
                        <Typography sx={{ fontSize: '9px', color: theme.palette.text.secondary, ml: '68px', mt: 0.25 }}>
                            {resourceId
                                ? (currentResource?.fileName || soundSource.media?.fileName || 'Loading...')
                                : 'No sound assigned'}
                        </Typography>
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

                    {resourceId ? (
                        <Box sx={{ display: 'flex', flexDirection: 'column', gap: 1 }}>
                            {audioBlobUrl && <audio ref={audioRef} src={audioBlobUrl} preload='metadata' loop={loopValue} />}

                                <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.5 }}>
                                    <Tooltip title={isPlayingValue ? 'Pause' : 'Play'}>
                                        <span>
                                            <IconButton
                                                size='small'
                                                onClick={handleTogglePlaying}
                                                disabled={isLoading}
                                                sx={{
                                                    color: isPlayingValue ? theme.palette.primary.main : theme.palette.text.secondary,
                                                }}
                                            >
                                                {isLoading ? (
                                                    <CircularProgress size={16} />
                                                ) : isPlayingValue ? (
                                                    <PauseIcon sx={{ fontSize: 18 }} />
                                                ) : (
                                                    <PlayIcon sx={{ fontSize: 18 }} />
                                                )}
                                            </IconButton>
                                        </span>
                                    </Tooltip>
                                    <Tooltip title={loopValue ? 'Loop enabled' : 'Loop disabled'}>
                                        <IconButton
                                            size='small'
                                            onClick={handleToggleLoop}
                                            sx={{
                                                color: loopValue ? theme.palette.primary.main : theme.palette.text.disabled,
                                            }}
                                        >
                                            <LoopIcon sx={{ fontSize: 16 }} />
                                        </IconButton>
                                    </Tooltip>
                                    <Box
                                        sx={{
                                            flex: 1,
                                            cursor: 'pointer',
                                            display: 'flex',
                                            alignItems: 'center',
                                            gap: 0.5,
                                        }}
                                        onClick={handleProgressClick}
                                    >
                                        <LinearProgress
                                            variant="determinate"
                                            value={progressPercentage}
                                            sx={{
                                                flex: 1,
                                                height: 4,
                                                borderRadius: 2,
                                                backgroundColor: theme.palette.action.disabledBackground,
                                                '& .MuiLinearProgress-bar': {
                                                    borderRadius: 2,
                                                },
                                            }}
                                        />
                                        <Typography sx={{ fontSize: '9px', color: theme.palette.text.secondary, minWidth: 55 }}>
                                            {formatTime(currentTime)} / {formatTime(duration)}
                                        </Typography>
                                    </Box>
                                </Box>

                        </Box>
                    ) : (
                        <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.5 }}>
                            <Tooltip title="Loop (will apply when sound is assigned)">
                                <IconButton
                                    size='small'
                                    onClick={handleToggleLoop}
                                    sx={{
                                        color: loopValue ? theme.palette.primary.main : theme.palette.text.disabled,
                                    }}
                                >
                                    <LoopIcon sx={{ fontSize: 16 }} />
                                </IconButton>
                            </Tooltip>
                            <Typography sx={{ fontSize: '9px', color: theme.palette.text.disabled }}>
                                {loopValue ? 'Loop enabled' : 'Loop disabled'}
                            </Typography>
                        </Box>
                    )}

                    {!showDeleteConfirm ? (
                        <Box sx={{ display: 'flex', gap: 1, mt: 0.5 }}>
                            <Button
                                size='small'
                                variant='outlined'
                                startIcon={<BrowseIcon sx={{ fontSize: 14 }} />}
                                onClick={handleBrowseSound}
                                sx={{ fontSize: '10px', py: 0.25, flex: 1, textTransform: 'none' }}
                            >
                                {resourceId ? 'Change' : 'Browse'}
                            </Button>
                            <Button
                                variant="outlined"
                                color="error"
                                size="small"
                                onClick={handleDeleteClick}
                                sx={{
                                    fontSize: '10px',
                                    textTransform: 'none',
                                    flex: 1,
                                }}
                            >
                                Delete
                            </Button>
                        </Box>
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
                    {...(resourceId && { currentResourceId: resourceId })}
                />
            )}
        </Menu>
    );
};
