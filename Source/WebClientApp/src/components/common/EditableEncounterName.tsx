import { Edit as EditIcon } from '@mui/icons-material';
import { Box, IconButton, TextField, Typography } from '@mui/material';
import { useTheme } from '@mui/material/styles';
import type React from 'react';
import { useEffect, useRef, useState } from 'react';

interface EditableEncounterNameProps {
  value: string;
  onChange: (value: string) => void;
  onBlur?: (value: string) => void;
  disabled?: boolean;
}

export const EditableEncounterName: React.FC<EditableEncounterNameProps> = ({
  value,
  onChange,
  onBlur,
  disabled = false,
}) => {
  const theme = useTheme();
  const [isEditing, setIsEditing] = useState(false);
  const [localValue, setLocalValue] = useState(value);
  const inputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    setLocalValue(value);
  }, [value]);

  useEffect(() => {
    if (isEditing && inputRef.current) {
      inputRef.current.focus();
      inputRef.current.select();
    }
  }, [isEditing]);

  const handleClick = () => {
    if (!disabled) {
      setIsEditing(true);
    }
  };

  const handleSave = () => {
    const trimmedValue = localValue.trim();
    setIsEditing(false);
    if (trimmedValue !== value) {
      onChange(trimmedValue);
    }
    // Pass the new value to onBlur so it can save immediately
    onBlur?.(trimmedValue);
  };

  const handleCancel = () => {
    setLocalValue(value);
    setIsEditing(false);
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter') {
      e.preventDefault();
      handleSave();
    } else if (e.key === 'Escape') {
      e.preventDefault();
      handleCancel();
    }
  };

  if (isEditing) {
    return (
      <TextField
        inputRef={inputRef}
        value={localValue}
        onChange={(e) => setLocalValue(e.target.value)}
        onBlur={handleSave}
        onKeyDown={handleKeyDown}
        variant='standard'
        fullWidth
        sx={{
          '& .MuiInputBase-root': {
            color: 'inherit',
            fontSize: '1.25rem',
            fontWeight: 500,
          },
          '& .MuiInput-underline:before': {
            borderBottomColor: theme.palette.divider,
          },
          '& .MuiInput-underline:hover:before': {
            borderBottomColor: theme.palette.primary.main,
          },
          '& .MuiInput-underline:after': {
            borderBottomColor: theme.palette.primary.main,
          },
        }}
      />
    );
  }

  return (
    <Box
      onClick={handleClick}
      sx={{
        display: 'flex',
        alignItems: 'center',
        gap: 1,
        cursor: disabled ? 'default' : 'pointer',
        padding: theme.spacing(0.5, 1),
        borderRadius: 1,
        '&:hover': disabled
          ? {}
          : {
              backgroundColor: 'rgba(255, 255, 255, 0.1)',
              '& .edit-icon': {
                opacity: 1,
              },
            },
      }}
    >
      <Typography
        sx={{
          fontSize: '1.25rem',
          fontWeight: 500,
          color: 'inherit',
          userSelect: 'none',
        }}
      >
        {value}
      </Typography>
      {!disabled && (
        <IconButton
          size='small'
          className='edit-icon'
          sx={{
            opacity: 0,
            transition: 'opacity 0.2s',
            color: 'inherit',
            padding: 0.5,
          }}
          aria-label='Edit encounter name'
        >
          <EditIcon fontSize='small' />
        </IconButton>
      )}
    </Box>
  );
};
