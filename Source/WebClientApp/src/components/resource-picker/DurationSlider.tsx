import React, { useCallback, useMemo } from 'react';
import { Box, Slider, Typography, useTheme } from '@mui/material';

export interface DurationSliderProps {
    value: [number, number];  // Milliseconds
    onChange: (range: [number, number]) => void;
    maxDurationMs: number;  // From API response (maxVideoDurationMs or maxAudioDurationMs)
    disabled?: boolean;
}

/**
 * Formats a duration in milliseconds to a human-readable string.
 * Returns format like "0s", "30s", "1:00", "5:30", etc.
 */
const formatDurationMs = (ms: number): string => {
    const seconds = Math.floor(ms / 1000);
    const minutes = Math.floor(seconds / 60);
    const remainingSeconds = seconds % 60;
    return minutes > 0
        ? `${minutes}:${remainingSeconds.toString().padStart(2, '0')}`
        : `${seconds}s`;
};

/**
 * Generates slider marks based on the maximum duration.
 * Includes standard intervals and the max value if not already included.
 */
const generateMarks = (maxMs: number): { value: number; label: string }[] => {
    const marks: { value: number; label: string }[] = [{ value: 0, label: '0s' }];
    // Intervals in milliseconds: 30s, 1m, 2m, 5m, 10m, 15m, 30m, 1h
    const intervals = [30000, 60000, 120000, 300000, 600000, 900000, 1800000, 3600000];

    for (const ms of intervals) {
        if (ms <= maxMs) {
            marks.push({ value: ms, label: formatDurationMs(ms) });
        }
    }

    if (!marks.some((m) => m.value === maxMs)) {
        marks.push({ value: maxMs, label: formatDurationMs(maxMs) });
    }

    return marks;
};

/**
 * Formats the range label for display (e.g., "0s - 5:00").
 */
const formatRangeLabel = (range: [number, number]): string => {
    const minLabel = formatDurationMs(range[0]);
    const maxLabel = formatDurationMs(range[1]);
    return `${minLabel} - ${maxLabel}`;
};

export const DurationSlider: React.FC<DurationSliderProps> = ({
    value,
    onChange,
    maxDurationMs,
    disabled = false,
}) => {
    const theme = useTheme();

    const marks = useMemo(() => generateMarks(maxDurationMs), [maxDurationMs]);

    const handleChange = useCallback(
        (_event: Event, newValue: number | number[]) => {
            if (Array.isArray(newValue) && newValue.length === 2) {
                onChange([newValue[0], newValue[1]] as [number, number]);
            }
        },
        [onChange]
    );

    // Disable slider if maxDurationMs is 0 or explicitly disabled
    const isDisabled = disabled || maxDurationMs === 0;

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
                DURATION
            </Typography>
            <Box sx={{ px: 1 }}>
                <Slider
                    id="slider-duration-range"
                    value={value}
                    onChange={handleChange}
                    min={0}
                    max={maxDurationMs || 1}  // Prevent MUI error when max is 0
                    marks={marks}
                    disabled={isDisabled}
                    valueLabelDisplay="auto"
                    valueLabelFormat={formatDurationMs}
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
