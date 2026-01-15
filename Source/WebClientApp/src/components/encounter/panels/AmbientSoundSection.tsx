import {
    Close as CloseIcon,
    FolderOpen as FolderOpenIcon,
    MusicNote as MusicNoteIcon,
    Pause as PauseIcon,
    PlayArrow as PlayArrowIcon,
    Upload as UploadIcon,
} from '@mui/icons-material';
import {
    Box,
    Checkbox,
    CircularProgress,
    FormControlLabel,
    IconButton,
    Tooltip,
    Typography,
    useTheme,
} from '@mui/material';
import type React from 'react';
import { useCallback, useRef, useState } from 'react';
import { AMBIENT_SOUND_PICKER_CONFIG, ResourcePickerDialog } from '@/components/resource-picker';
import type { MediaResource } from '@/types/domain';
import { AmbientSoundSource } from '../../../types/stage';

const ACCEPTED_AUDIO_TYPES = 'audio/mp3,audio/mpeg,audio/wav,audio/ogg,audio/webm';

export interface AmbientSoundSectionProps {
    source: AmbientSoundSource;
    onSourceChange: (source: AmbientSoundSource) => void;
    soundUrl?: string;
    isUploadingSound?: boolean;
    onSoundUpload?: (file: File) => void;
    /** Called when a resource is selected from the library */
    onSoundSelect?: (resource: MediaResource) => void;
    onSoundRemove?: () => void;
    /** Whether the main background is a video (enables FromBackground option) */
    mainBackgroundIsVideo: boolean;
}

export const AmbientSoundSection: React.FC<AmbientSoundSectionProps> = ({
    source,
    onSourceChange,
    soundUrl,
    isUploadingSound,
    onSoundUpload,
    onSoundSelect,
    onSoundRemove,
    mainBackgroundIsVideo,
}) => {
    const theme = useTheme();
    const audioRef = useRef<HTMLAudioElement>(null);
    const [isPlaying, setIsPlaying] = useState(false);
    const [pickerOpen, setPickerOpen] = useState(false);

    const handleCheckboxChange = (event: React.ChangeEvent<HTMLInputElement>) => {
        onSourceChange(event.target.checked ? AmbientSoundSource.FromBackground : AmbientSoundSource.NotSet);
    };

    const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const file = e.target.files?.[0];
        if (file && onSoundUpload) {
            onSoundUpload(file);
        }
        e.target.value = '';
    };

    const togglePlayPause = useCallback(() => {
        if (!audioRef.current) return;
        if (isPlaying) {
            audioRef.current.pause();
        } else {
            audioRef.current.play();
        }
        setIsPlaying(!isPlaying);
    }, [isPlaying]);

    const handleAudioEnded = useCallback(() => {
        setIsPlaying(false);
    }, []);

    const handleResourceSelect = useCallback(
        (resource: MediaResource) => {
            onSoundSelect?.(resource);
            setPickerOpen(false);
        },
        [onSoundSelect]
    );

    const hasAudioFile = !!soundUrl;
    const useBackgroundSound = source === AmbientSoundSource.FromBackground;

    return (
        <Box sx={{ display: 'flex', flexDirection: 'column', gap: 1.5 }}>
            <Typography
                variant='overline'
                sx={{
                    fontSize: '10px',
                    fontWeight: 700,
                    textTransform: 'uppercase',
                    letterSpacing: '0.5px',
                    color: theme.palette.text.secondary,
                    mb: 0,
                }}
            >
                Ambient Sound
            </Typography>

            {/* If audio file exists: show audio preview with clear button */}
            {hasAudioFile && (
                <Box
                    sx={{
                        display: 'flex',
                        alignItems: 'center',
                        gap: 1,
                        p: 1,
                        borderRadius: 1,
                        border: `1px solid ${theme.palette.divider}`,
                        bgcolor: theme.palette.background.default,
                    }}
                >
                    <audio
                        ref={audioRef}
                        src={soundUrl}
                        onEnded={handleAudioEnded}
                    />

                    <MusicNoteIcon sx={{ fontSize: 20, color: theme.palette.text.secondary }} />

                    <Typography
                        variant='body2'
                        sx={{
                            flex: 1,
                            overflow: 'hidden',
                            textOverflow: 'ellipsis',
                            whiteSpace: 'nowrap',
                            color: theme.palette.text.primary,
                        }}
                    >
                        Audio file
                    </Typography>

                    <Tooltip title={isPlaying ? 'Pause' : 'Play'}>
                        <IconButton
                            onClick={togglePlayPause}
                            size='small'
                            sx={{ width: 28, height: 28 }}
                        >
                            {isPlaying ? <PauseIcon sx={{ fontSize: 16 }} /> : <PlayArrowIcon sx={{ fontSize: 16 }} />}
                        </IconButton>
                    </Tooltip>

                    {onSoundRemove && (
                        <Tooltip title='Remove audio'>
                            <IconButton
                                onClick={onSoundRemove}
                                size='small'
                                sx={{
                                    width: 28,
                                    height: 28,
                                    '&:hover': { color: theme.palette.error.main },
                                }}
                            >
                                <CloseIcon sx={{ fontSize: 16 }} />
                            </IconButton>
                        </Tooltip>
                    )}
                </Box>
            )}

            {/* If no audio file: show checkbox (if video background) and/or upload control */}
            {!hasAudioFile && (
                <>
                    {/* Checkbox for using background video's sound - only when main background is video */}
                    {mainBackgroundIsVideo && (
                        <FormControlLabel
                            control={
                                <Checkbox
                                    size='small'
                                    checked={useBackgroundSound}
                                    onChange={handleCheckboxChange}
                                />
                            }
                            label={
                                <Typography variant='body2' sx={{ fontSize: '0.875rem' }}>
                                    Use background sound
                                </Typography>
                            }
                            sx={{ m: 0 }}
                        />
                    )}

                    {/* Upload control - hidden when using background sound */}
                    {!useBackgroundSound && (
                        <Box
                            sx={{
                                display: 'flex',
                                alignItems: 'center',
                                gap: 1,
                                p: 1,
                                borderRadius: 1,
                                border: `1px solid ${theme.palette.divider}`,
                                bgcolor: theme.palette.background.default,
                            }}
                        >
                            {isUploadingSound ? (
                                <CircularProgress size={20} />
                            ) : (
                                <MusicNoteIcon sx={{ fontSize: 20, color: theme.palette.text.secondary }} />
                            )}

                            <Typography
                                variant='body2'
                                sx={{
                                    flex: 1,
                                    overflow: 'hidden',
                                    textOverflow: 'ellipsis',
                                    whiteSpace: 'nowrap',
                                    color: theme.palette.text.secondary,
                                }}
                            >
                                No audio selected
                            </Typography>

                            {/* Browse library button */}
                            {onSoundSelect && (
                                <Tooltip title='Browse library'>
                                    <IconButton
                                        onClick={() => setPickerOpen(true)}
                                        disabled={isUploadingSound ?? false}
                                        size='small'
                                        sx={{ width: 28, height: 28 }}
                                    >
                                        <FolderOpenIcon sx={{ fontSize: 16 }} />
                                    </IconButton>
                                </Tooltip>
                            )}

                            <Tooltip title='Upload audio'>
                                <IconButton
                                    component='label'
                                    disabled={isUploadingSound ?? false}
                                    size='small'
                                    sx={{ width: 28, height: 28 }}
                                >
                                    <UploadIcon sx={{ fontSize: 16 }} />
                                    <input type='file' hidden accept={ACCEPTED_AUDIO_TYPES} onChange={handleFileChange} />
                                </IconButton>
                            </Tooltip>
                        </Box>
                    )}
                </>
            )}

            {/* Resource Picker Dialog */}
            <ResourcePickerDialog
                open={pickerOpen}
                onClose={() => setPickerOpen(false)}
                onSelect={handleResourceSelect}
                config={AMBIENT_SOUND_PICKER_CONFIG}
            />
        </Box>
    );
};
