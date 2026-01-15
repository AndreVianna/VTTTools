import React, { useCallback } from 'react';
import { Box, Slider, Typography, useTheme } from '@mui/material';

export interface DimensionSliderProps {
    value: [number, number];  // [minWidth, maxWidth] in pixels
    onChange: (range: [number, number]) => void;
    disabled?: boolean;
}

const DIMENSION_MARKS = [
    { value: 720, label: 'SD' },
    { value: 1920, label: 'HD' },
    { value: 2560, label: '2K' },
    { value: 3840, label: '4K' },
    { value: 65535, label: 'Huge' },  // ushort.MaxValue
];

const MIN_VALUE = 720;
const MAX_VALUE = 65535;

/**
 * Formats a dimension value for display.
 * Returns the mark label if the value matches a known mark,
 * otherwise returns the value in pixels.
 */
const formatDimensionValue = (value: number): string => {
    const mark = DIMENSION_MARKS.find((m) => m.value === value);
    if (mark) {
        return mark.label;
    }
    return `${value}px`;
};

/**
 * Formats the range label for display (e.g., "720px - 4K").
 */
const formatRangeLabel = (range: [number, number]): string => {
    const minLabel = formatDimensionValue(range[0]);
    const maxLabel = formatDimensionValue(range[1]);
    return `${minLabel} - ${maxLabel}`;
};

export const DimensionSlider: React.FC<DimensionSliderProps> = ({
    value,
    onChange,
    disabled = false,
}) => {
    const theme = useTheme();

    const handleChange = useCallback(
        (_event: Event, newValue: number | number[]) => {
            if (Array.isArray(newValue) && newValue.length === 2) {
                onChange([newValue[0], newValue[1]] as [number, number]);
            }
        },
        [onChange]
    );

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
                DIMENSIONS
            </Typography>
            <Box sx={{ px: 1 }}>
                <Slider
                    id="slider-dimension-range"
                    value={value}
                    onChange={handleChange}
                    min={MIN_VALUE}
                    max={MAX_VALUE}
                    marks={DIMENSION_MARKS}
                    disabled={disabled}
                    valueLabelDisplay="auto"
                    valueLabelFormat={formatDimensionValue}
                    sx={{
                        '& .MuiSlider-markLabel': {
                            fontSize: '0.65rem',
                            color: theme.palette.text.secondary,
                        },
                        '& .MuiSlider-valueLabel': {
                            fontSize: '0.75rem',
                        },
                    }}
                />
            </Box>
            <Typography
                variant="caption"
                sx={{
                    color: theme.palette.text.primary,
                    fontSize: '0.75rem',
                    display: 'block',
                    textAlign: 'center',
                    mt: 0.5,
                }}
            >
                {formatRangeLabel(value)}
            </Typography>
        </Box>
    );
};
