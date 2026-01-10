import React, { useState, useEffect, useCallback } from 'react';
import { Box, Slider, Typography, TextField, useTheme } from '@mui/material';

export interface AttributeRangeSliderProps {
  label: string;
  min: number;
  max: number;
  value: [number, number];
  onChange: (value: [number, number]) => void;
  step?: number;
  formatValue?: (value: number) => string;
  debounceMs?: number;
}

export const AttributeRangeSlider: React.FC<AttributeRangeSliderProps> = ({
  label,
  min,
  max,
  value,
  onChange,
  step = 1,
  formatValue = (v) => String(v),
  debounceMs = 150,
}) => {
  const theme = useTheme();
  const [localValue, setLocalValue] = useState<[number, number]>(value);

  useEffect(() => {
    setLocalValue(value);
  }, [value]);

  useEffect(() => {
    const timer = setTimeout(() => {
      if (localValue[0] !== value[0] || localValue[1] !== value[1]) {
        onChange(localValue);
      }
    }, debounceMs);

    return () => clearTimeout(timer);
  }, [localValue, value, onChange, debounceMs]);

  const handleSliderChange = useCallback((_: Event, newValue: number | number[]) => {
    setLocalValue(newValue as [number, number]);
  }, []);

  const handleMinInputChange = useCallback(
    (e: React.ChangeEvent<HTMLInputElement>) => {
      const newMin = Math.min(Number(e.target.value) || min, localValue[1]);
      setLocalValue([Math.max(min, newMin), localValue[1]]);
    },
    [min, localValue]
  );

  const handleMaxInputChange = useCallback(
    (e: React.ChangeEvent<HTMLInputElement>) => {
      const newMax = Math.max(Number(e.target.value) || max, localValue[0]);
      setLocalValue([localValue[0], Math.min(max, newMax)]);
    },
    [max, localValue]
  );

  return (
    <Box sx={{ px: 1, py: 0.5 }}>
      <Typography
        variant="caption"
        sx={{
          color: theme.palette.text.secondary,
          fontWeight: 500,
          display: 'block',
          mb: 0.5,
        }}
      >
        {label}
      </Typography>
      <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
        <TextField
          size="small"
          value={localValue[0]}
          onChange={handleMinInputChange}
          slotProps={{
            input: {
              sx: {
                height: 24,
                fontSize: '0.75rem',
                '& input': {
                  textAlign: 'center',
                  padding: '2px 4px',
                },
              },
            },
          }}
          sx={{ width: 48 }}
        />
        <Slider
          value={localValue}
          onChange={handleSliderChange}
          min={min}
          max={max}
          step={step}
          valueLabelDisplay="auto"
          valueLabelFormat={formatValue}
          size="small"
          sx={{
            flexGrow: 1,
            '& .MuiSlider-thumb': {
              width: 12,
              height: 12,
            },
            '& .MuiSlider-rail': {
              height: 4,
            },
            '& .MuiSlider-track': {
              height: 4,
            },
          }}
        />
        <TextField
          size="small"
          value={localValue[1]}
          onChange={handleMaxInputChange}
          slotProps={{
            input: {
              sx: {
                height: 24,
                fontSize: '0.75rem',
                '& input': {
                  textAlign: 'center',
                  padding: '2px 4px',
                },
              },
            },
          }}
          sx={{ width: 48 }}
        />
      </Box>
    </Box>
  );
};

export default AttributeRangeSlider;
