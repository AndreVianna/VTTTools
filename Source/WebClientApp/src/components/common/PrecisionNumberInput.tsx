import { TextField, Tooltip, type SxProps, type Theme } from '@mui/material';
import type React from 'react';
import { useCallback, useState } from 'react';

export interface PrecisionNumberInputProps {
  id: string;
  label: string;
  value: number;
  onChange: (value: number) => void;
  min?: number;
  max?: number;
  size?: 'small' | 'medium';
  fullWidth?: boolean;
  sx?: SxProps<Theme>;
  disabled?: boolean;
}

const getStepForModifiers = (e: React.KeyboardEvent): number => {
  const hasCtrl = e.ctrlKey || e.metaKey;
  const hasAlt = e.altKey;
  const hasShift = e.shiftKey;

  if (hasCtrl && hasAlt) return 0.001;
  if (hasAlt) return 0.01;
  if (hasCtrl) return 0.1;
  if (hasShift) return 10;
  return 1;
};

const roundToPrecision = (value: number, precision: number): number => {
  const factor = Math.pow(10, precision);
  return Math.round(value * factor) / factor;
};

export const PrecisionNumberInput: React.FC<PrecisionNumberInputProps> = ({
  id,
  label,
  value,
  onChange,
  min,
  max,
  size = 'small',
  fullWidth = true,
  sx,
  disabled = false,
}) => {
  const [inputValue, setInputValue] = useState<string>(String(value));
  const [isFocused, setIsFocused] = useState(false);

  const clampValue = useCallback(
    (val: number): number => {
      let result = val;
      if (min !== undefined && result < min) result = min;
      if (max !== undefined && result > max) result = max;
      return result;
    },
    [min, max],
  );

  const handleKeyDown = useCallback(
    (e: React.KeyboardEvent<HTMLInputElement>) => {
      if (e.key !== 'ArrowUp' && e.key !== 'ArrowDown') return;

      e.preventDefault();
      const step = getStepForModifiers(e);
      const direction = e.key === 'ArrowUp' ? 1 : -1;
      const currentValue = parseFloat(inputValue) || 0;
      const newValue = roundToPrecision(currentValue + step * direction, 4);
      const clampedValue = clampValue(newValue);

      setInputValue(String(clampedValue));
      onChange(clampedValue);
    },
    [inputValue, onChange, clampValue],
  );

  const handleChange = useCallback((e: React.ChangeEvent<HTMLInputElement>) => {
    setInputValue(e.target.value);
  }, []);

  const handleBlur = useCallback(() => {
    setIsFocused(false);
    const parsed = parseFloat(inputValue);
    if (Number.isNaN(parsed)) {
      setInputValue(String(value));
      return;
    }
    const clampedValue = clampValue(parsed);
    const roundedValue = roundToPrecision(clampedValue, 4);
    setInputValue(String(roundedValue));
    if (roundedValue !== value) {
      onChange(roundedValue);
    }
  }, [inputValue, value, onChange, clampValue]);

  const handleFocus = useCallback(() => {
    setIsFocused(true);
  }, []);

  const displayValue = isFocused ? inputValue : String(value);

  return (
    <Tooltip
      title='Arrow keys: ±1 | Shift: ±10 | Ctrl: ±0.1 | Alt: ±0.01 | Ctrl+Alt: ±0.001'
      placement='top'
      enterDelay={500}
    >
      <TextField
        id={id}
        label={label}
        type='number'
        value={displayValue}
        onChange={handleChange}
        onKeyDown={handleKeyDown}
        onBlur={handleBlur}
        onFocus={handleFocus}
        size={size}
        fullWidth={fullWidth}
        disabled={disabled}
        slotProps={{
          htmlInput: {
            min,
            max,
            step: 'any',
          },
        }}
        {...(sx && { sx })}
      />
    </Tooltip>
  );
};
