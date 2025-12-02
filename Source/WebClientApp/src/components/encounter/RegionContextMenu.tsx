import { Box, FormControl, Menu, MenuItem, Select, type SelectChangeEvent, TextField, Typography } from '@mui/material';
import type React from 'react';
import { useState, useEffect, useRef, useCallback } from 'react';
import type { EncounterRegion } from '@/types/domain';
import { getValidValuesForType } from '@/utils/regionLabelUtils';

export interface RegionContextMenuProps {
  anchorPosition: { left: number; top: number } | null;
  open: boolean;
  onClose: () => void;
  encounterRegion: EncounterRegion | null;
  onRegionUpdate?: (regionIndex: number, updates: Partial<EncounterRegion>) => void;
}

export const RegionContextMenu: React.FC<RegionContextMenuProps> = ({
  anchorPosition,
  open,
  onClose,
  encounterRegion,
  onRegionUpdate,
}) => {
  const [nameValue, setNameValue] = useState('');
  const menuRef = useRef<HTMLDivElement>(null);

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
    if (encounterRegion) {
      setNameValue(encounterRegion.name);
    }
  }, [encounterRegion]);

  if (!encounterRegion) return null;

  const currentValue = encounterRegion.value ?? 0;
  const validValues = getValidValuesForType(encounterRegion.type);
  const isElevation = encounterRegion.type === 'Elevation';

  const handleNameChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    setNameValue(event.target.value);
  };

  const handleNameBlur = () => {
    if (onRegionUpdate && nameValue !== encounterRegion.name && nameValue.trim()) {
      onRegionUpdate(encounterRegion.index, { name: nameValue.trim() });
    } else {
      setNameValue(encounterRegion.name);
    }
  };

  const handleNameKeyDown = (event: React.KeyboardEvent<HTMLInputElement>) => {
    if (event.key === 'Enter') {
      (event.target as HTMLInputElement).blur();
    } else if (event.key === 'Escape') {
      setNameValue(encounterRegion.name);
      (event.target as HTMLInputElement).blur();
    }
  };

  const handleValueChange = (event: SelectChangeEvent<number>) => {
    if (!onRegionUpdate) return;
    const newValue = event.target.value as number;
    onRegionUpdate(encounterRegion.index, { value: newValue });
  };

  const handleElevationChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    if (!onRegionUpdate) return;
    const newValue = Number(event.target.value);
    onRegionUpdate(encounterRegion.index, { value: newValue });
  };

  const compactSelectStyle = {
    height: '28px',
    fontSize: '11px',
    minWidth: 100,
    '& .MuiSelect-select': {
      padding: '4px 28px 4px 8px',
      fontSize: '11px',
    },
  };

  const compactTextFieldStyle = {
    '& .MuiInputBase-root': {
      height: '28px',
      fontSize: '11px',
    },
    '& .MuiInputBase-input': {
      padding: '4px 8px',
      fontSize: '11px',
    },
  };

  return (
    <Menu
      anchorReference='anchorPosition'
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
          sx: { pointerEvents: 'auto' },
        },
        root: {
          sx: { pointerEvents: 'none' },
        },
      }}
    >
      <Box sx={{ px: 2, py: 1 }}>
        <Typography variant='subtitle2' sx={{ fontSize: '11px', fontWeight: 600, mb: 1 }}>
          {encounterRegion.type}
        </Typography>

        <Box sx={{ display: 'flex', flexDirection: 'column', gap: 1 }}>
          <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
            <Typography sx={{ fontSize: '10px', minWidth: 40 }}>Name:</Typography>
            <TextField
              value={nameValue}
              onChange={handleNameChange}
              onBlur={handleNameBlur}
              onKeyDown={handleNameKeyDown}
              size='small'
              sx={{ ...compactTextFieldStyle, width: 120 }}
            />
          </Box>

          <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
            <Typography sx={{ fontSize: '10px', minWidth: 40 }}>Value:</Typography>
            {isElevation ? (
              <TextField
                type='number'
                value={currentValue}
                onChange={handleElevationChange}
                size='small'
                sx={{ ...compactTextFieldStyle, width: 100 }}
                InputProps={{ inputProps: { min: -100, max: 100, step: 5 } }}
              />
            ) : (
              <FormControl size='small'>
                <Select value={currentValue} onChange={handleValueChange} sx={compactSelectStyle}>
                  {validValues.map(({ value, label }) => (
                    <MenuItem key={value} value={value} sx={{ fontSize: '11px' }}>
                      {label}
                    </MenuItem>
                  ))}
                </Select>
              </FormControl>
            )}
          </Box>
        </Box>
      </Box>
    </Menu>
  );
};
