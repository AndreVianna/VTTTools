import React, { useCallback } from 'react';
import { Box, Checkbox, FormControlLabel, FormGroup, Typography, useTheme } from '@mui/material';

export interface MediaTypeFilterProps {
    value: string[];  // Selected media types: ['image'], ['video'], ['image', 'video'], or []
    onChange: (types: string[]) => void;
    disabled?: boolean;
}

const MEDIA_TYPES = [
    { value: 'image', label: 'Image' },
    { value: 'video', label: 'Video' },
];

export const MediaTypeFilter: React.FC<MediaTypeFilterProps> = ({
    value,
    onChange,
    disabled = false,
}) => {
    const theme = useTheme();

    const handleToggle = useCallback((type: string) => {
        const newValue = value.includes(type)
            ? value.filter((t) => t !== type)
            : [...value, type];
        onChange(newValue);
    }, [value, onChange]);

    return (
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
                MEDIA TYPE
            </Typography>
            <FormGroup>
                {MEDIA_TYPES.map((mediaType) => (
                    <FormControlLabel
                        key={mediaType.value}
                        control={
                            <Checkbox
                                id={`checkbox-media-${mediaType.value}`}
                                checked={value.includes(mediaType.value)}
                                onChange={() => handleToggle(mediaType.value)}
                                disabled={disabled}
                                size="small"
                            />
                        }
                        label={mediaType.label}
                        sx={{
                            '& .MuiFormControlLabel-label': {
                                fontSize: '0.875rem',
                                color: theme.palette.text.primary,
                            },
                        }}
                    />
                ))}
            </FormGroup>
        </Box>
    );
};
