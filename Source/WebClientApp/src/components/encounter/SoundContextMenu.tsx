import {
    Box,
    Button,
    Checkbox,
    FormControlLabel,
    Menu,
    Slider,
    TextField,
    Typography,
    useTheme,
} from '@mui/material';
import type React from 'react';
import { useCallback, useEffect, useRef, useState } from 'react';
import type { EncounterSoundSource } from '@/types/domain';

export interface SoundContextMenuProps {
    anchorPosition: { left: number; top: number } | null;
    open: boolean;
    onClose: () => void;
    soundSource: EncounterSoundSource | null;
    onSoundSourceUpdate?: (sourceIndex: number, updates: Partial<EncounterSoundSource>) => void;
    onSoundSourceDelete?: (sourceIndex: number) => void;
}

export const SoundContextMenu: React.FC<SoundContextMenuProps> = ({
    anchorPosition,
    open,
    onClose,
    soundSource,
    onSoundSourceUpdate,
    onSoundSourceDelete,
}) => {
    const theme = useTheme();
    const menuRef = useRef<HTMLDivElement>(null);

    const [nameValue, setNameValue] = useState('');
    const [rangeValue, setRangeValue] = useState(6);
    const [resourceIdValue, setResourceIdValue] = useState('');
    const [isPlayingValue, setIsPlayingValue] = useState(true);
    const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);

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
            setResourceIdValue(soundSource.resourceId || '');
            setIsPlayingValue(soundSource.isPlaying);
            setShowDeleteConfirm(false);
        }
    }, [soundSource]);

    if (!soundSource) return null;

    const handleNameChange = (event: React.ChangeEvent<HTMLInputElement>) => {
        setNameValue(event.target.value);
    };

    const handleNameBlur = () => {
        if (onSoundSourceUpdate && nameValue !== (soundSource.name || '')) {
            onSoundSourceUpdate(soundSource.index, { name: nameValue.trim() || undefined });
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

    const handleResourceIdChange = (event: React.ChangeEvent<HTMLInputElement>) => {
        setResourceIdValue(event.target.value);
    };

    const handleResourceIdBlur = () => {
        if (onSoundSourceUpdate && resourceIdValue !== (soundSource.resourceId || '')) {
            onSoundSourceUpdate(soundSource.index, { resourceId: resourceIdValue.trim() || undefined });
        } else {
            setResourceIdValue(soundSource.resourceId || '');
        }
    };

    const handleResourceIdKeyDown = (event: React.KeyboardEvent<HTMLInputElement>) => {
        if (event.key === 'Enter') {
            (event.target as HTMLInputElement).blur();
        } else if (event.key === 'Escape') {
            setResourceIdValue(soundSource.resourceId || '');
            (event.target as HTMLInputElement).blur();
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

                    <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                        <Typography sx={{ fontSize: '10px', minWidth: 60 }}>Resource:</Typography>
                        <TextField
                            value={resourceIdValue}
                            onChange={handleResourceIdChange}
                            onBlur={handleResourceIdBlur}
                            onKeyDown={handleResourceIdKeyDown}
                            size="small"
                            placeholder="Audio ID"
                            inputProps={{ maxLength: 64 }}
                            sx={{ ...compactTextFieldStyle, flex: 1 }}
                        />
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
        </Menu>
    );
};
