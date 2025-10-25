import { useState, useEffect, useRef } from 'react';
import type React from 'react';
import { Typography, TextField, Box, CircularProgress } from '@mui/material';
import type { TypographyProps } from '@mui/material';

export interface EditableTitleProps {
    value: string;
    onSave: (newValue: string) => Promise<void>;
    placeholder?: string;
    maxLength?: number;
    variant?: TypographyProps['variant'];
    disabled?: boolean;
    'aria-label'?: string;
    id?: string;
}

export function EditableTitle({
    value,
    onSave,
    placeholder = 'Untitled',
    maxLength = 128,
    variant = 'h6',
    disabled = false,
    'aria-label': ariaLabel = 'Edit title',
    id
}: EditableTitleProps) {
    const [isEditing, setIsEditing] = useState(false);
    const [editValue, setEditValue] = useState(value);
    const [isSaving, setIsSaving] = useState(false);
    const [error, setError] = useState<string | null>(null);
    const inputRef = useRef<HTMLInputElement>(null);
    const isCancelledRef = useRef(false);

    useEffect(() => {
        setEditValue(value);
    }, [value]);

    useEffect(() => {
        if (isEditing && inputRef.current) {
            isCancelledRef.current = false;
            inputRef.current.focus();
            inputRef.current.select();
        }
    }, [isEditing]);

    const startEdit = () => {
        if (!disabled) {
            setIsEditing(true);
            setError(null);
        }
    };

    const cancelEdit = () => {
        isCancelledRef.current = true;
        setIsEditing(false);
        setEditValue(value);
        setError(null);
    };

    const saveEdit = async () => {
        if (isCancelledRef.current) {
            return;
        }

        const trimmedValue = editValue.trim();

        if (!trimmedValue) {
            setError('Title cannot be empty');
            return;
        }

        if (trimmedValue === value) {
            setIsEditing(false);
            return;
        }

        setIsSaving(true);
        setError(null);

        try {
            await onSave(trimmedValue);
            setIsEditing(false);
        } catch (err) {
            setError(err instanceof Error ? err.message : 'Failed to save');
        } finally {
            setIsSaving(false);
        }
    };

    const handleKeyDown = (e: React.KeyboardEvent) => {
        if (e.key === 'Enter') {
            e.preventDefault();
            saveEdit();
        } else if (e.key === 'Escape') {
            e.preventDefault();
            cancelEdit();
        }
    };

    if (isEditing) {
        return (
            <Box id="editable-title-edit-container" sx={{ display: 'flex', flexDirection: 'column', gap: 0.5 }}>
                <TextField
                    id="input-editable-title"
                    inputRef={inputRef}
                    value={editValue}
                    onChange={(e) => setEditValue(e.target.value)}
                    onBlur={saveEdit}
                    onKeyDown={handleKeyDown}
                    disabled={isSaving}
                    placeholder={placeholder}
                    inputProps={{
                        maxLength,
                        'aria-label': ariaLabel
                    }}
                    error={!!error}
                    helperText={error}
                    size="small"
                    fullWidth
                    InputProps={{
                        endAdornment: isSaving ? (
                            <CircularProgress size={20} />
                        ) : null
                    }}
                />
            </Box>
        );
    }

    return (
        <Typography
            id={id}
            variant={variant}
            component="h1"
            onClick={startEdit}
            sx={{
                cursor: disabled ? 'default' : 'pointer',
                '&:hover': disabled ? {} : {
                    backgroundColor: 'action.hover',
                    borderRadius: 1,
                    px: 1,
                    mx: -1
                },
                transition: 'background-color 0.2s',
                display: 'inline-block',
                minWidth: '100px'
            }}
            aria-label={ariaLabel}
            role="button"
            tabIndex={disabled ? -1 : 0}
            onKeyDown={(e) => {
                if (e.key === 'Enter' || e.key === ' ') {
                    e.preventDefault();
                    startEdit();
                }
            }}
        >
            {value || placeholder}
        </Typography>
    );
}
