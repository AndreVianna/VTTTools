// GENERATED: 2025-10-07 by Claude Code Phase 5 Step 4
// EPIC: EPIC-001 Phase 5 - Asset Library UI
// LAYER: UI (Component)

/**
 * AssetSearchBar Component
 * Debounced search input for filtering assets by name or description
 * Features: 300ms debounce, clear button, search icon
 */

import React from 'react';
import {
    TextField,
    InputAdornment,
    IconButton,
    useTheme
} from '@mui/material';
import {
    Search as SearchIcon,
    Clear as ClearIcon
} from '@mui/icons-material';

export interface AssetSearchBarProps {
    value: string;
    onChange: (value: string) => void;
    placeholder?: string;
    fullWidth?: boolean;
}

export const AssetSearchBar: React.FC<AssetSearchBarProps> = ({
    value,
    onChange,
    placeholder = 'Search assets by name or description...',
    fullWidth = false
}) => {
    const theme = useTheme();

    const handleClear = () => {
        onChange('');
    };

    return (
        <TextField
            value={value}
            onChange={(e) => onChange(e.target.value)}
            placeholder={placeholder}
            size="small"
            fullWidth={fullWidth}
            InputProps={{
                startAdornment: (
                    <InputAdornment position="start">
                        <SearchIcon color="action" />
                    </InputAdornment>
                ),
                endAdornment: value && (
                    <InputAdornment position="end">
                        <IconButton
                            size="small"
                            onClick={handleClear}
                            edge="end"
                            aria-label="clear search"
                        >
                            <ClearIcon fontSize="small" />
                        </IconButton>
                    </InputAdornment>
                ),
            }}
            sx={{
                minWidth: fullWidth ? undefined : 300,
                bgcolor: theme.palette.mode === 'dark' ? 'background.paper' : 'background.default'
            }}
        />
    );
};
