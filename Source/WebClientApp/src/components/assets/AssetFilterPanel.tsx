// GENERATED: 2025-10-07 by Claude Code Phase 5 Step 3
// EPIC: EPIC-001 Phase 5 - Asset Library UI
// LAYER: UI (Component)

/**
 * AssetFilterPanel Component
 * Comprehensive filtering controls for Asset Library
 * Filters: Kind, Creature Category, Ownership, Published Status
 */

import React from 'react';
import {
    Paper,
    Typography,
    FormControl,
    FormLabel,
    RadioGroup,
    FormControlLabel,
    Radio,
    Checkbox,
    Button,
    Divider,
    Box,
    useTheme
} from '@mui/material';
import {
    FilterList as FilterIcon,
    Clear as ClearIcon
} from '@mui/icons-material';
import { AssetKind, CreatureCategory } from '@/types/domain';

export interface AssetFilters {
    kind?: AssetKind;
    creatureCategory?: CreatureCategory;
    ownership: 'mine' | 'public' | 'all';
    publishedOnly: boolean;
    publicOnly: boolean;
}

export interface AssetFilterPanelProps {
    filters: AssetFilters;
    onFiltersChange: (filters: AssetFilters) => void;
}

export const AssetFilterPanel: React.FC<AssetFilterPanelProps> = ({
    filters,
    onFiltersChange
}) => {
    const theme = useTheme();

    const handleKindChange = (event: React.ChangeEvent<HTMLInputElement>) => {
        const value = event.target.value;
        onFiltersChange({
            ...filters,
            kind: value === 'all' ? undefined : (value as AssetKind),
            // Reset creature category when changing kind
            creatureCategory: value === AssetKind.Creature ? filters.creatureCategory : undefined
        });
    };

    const handleCreatureCategoryChange = (event: React.ChangeEvent<HTMLInputElement>) => {
        const value = event.target.value;
        onFiltersChange({
            ...filters,
            creatureCategory: value === 'all' ? undefined : (value as CreatureCategory)
        });
    };

    const handleOwnershipChange = (event: React.ChangeEvent<HTMLInputElement>) => {
        onFiltersChange({
            ...filters,
            ownership: event.target.value as 'mine' | 'public' | 'all'
        });
    };

    const handleResetFilters = () => {
        onFiltersChange({
            kind: undefined,
            creatureCategory: undefined,
            ownership: 'mine',
            publishedOnly: false,
            publicOnly: false
        });
    };

    const hasActiveFilters =
        filters.kind !== undefined ||
        filters.creatureCategory !== undefined ||
        filters.ownership !== 'mine' ||
        filters.publishedOnly ||
        filters.publicOnly;

    return (
        <Paper
            elevation={2}
            sx={{
                p: 3,
                height: 'fit-content',
                position: 'sticky',
                top: 24
            }}
        >
            {/* Header */}
            <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', mb: 2 }}>
                <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                    <FilterIcon color="primary" />
                    <Typography variant="h6">
                        Filters
                    </Typography>
                </Box>
                {hasActiveFilters && (
                    <Button
                        size="small"
                        startIcon={<ClearIcon />}
                        onClick={handleResetFilters}
                    >
                        Reset
                    </Button>
                )}
            </Box>

            <Divider sx={{ mb: 2 }} />

            {/* Kind Filter */}
            <FormControl component="fieldset" sx={{ width: '100%', mb: 3 }}>
                <FormLabel component="legend" sx={{ mb: 1, fontSize: '0.875rem', fontWeight: 500 }}>
                    Asset Kind
                </FormLabel>
                <RadioGroup
                    value={filters.kind ?? 'all'}
                    onChange={handleKindChange}
                >
                    <FormControlLabel value="all" control={<Radio size="small" />} label="All" />
                    <FormControlLabel value={AssetKind.Object} control={<Radio size="small" />} label="Objects" />
                    <FormControlLabel value={AssetKind.Creature} control={<Radio size="small" />} label="Creatures" />
                </RadioGroup>
            </FormControl>

            {/* Creature Category Filter (only when kind=Creature) */}
            {filters.kind === AssetKind.Creature && (
                <FormControl component="fieldset" sx={{ width: '100%', mb: 3 }}>
                    <FormLabel component="legend" sx={{ mb: 1, fontSize: '0.875rem', fontWeight: 500 }}>
                        Creature Type
                    </FormLabel>
                    <RadioGroup
                        value={filters.creatureCategory ?? 'all'}
                        onChange={handleCreatureCategoryChange}
                    >
                        <FormControlLabel value="all" control={<Radio size="small" />} label="All" />
                        <FormControlLabel value={CreatureCategory.Character} control={<Radio size="small" />} label="Characters" />
                        <FormControlLabel value={CreatureCategory.Monster} control={<Radio size="small" />} label="Monsters" />
                    </RadioGroup>
                </FormControl>
            )}

            <Divider sx={{ mb: 2 }} />

            {/* Ownership Filter */}
            <FormControl component="fieldset" sx={{ width: '100%', mb: 3 }}>
                <FormLabel component="legend" sx={{ mb: 1, fontSize: '0.875rem', fontWeight: 500 }}>
                    Ownership
                </FormLabel>
                <RadioGroup
                    value={filters.ownership}
                    onChange={handleOwnershipChange}
                >
                    <FormControlLabel value="mine" control={<Radio size="small" />} label="My Assets" />
                    <FormControlLabel value="public" control={<Radio size="small" />} label="Public Assets" />
                    <FormControlLabel value="all" control={<Radio size="small" />} label="All Assets" />
                </RadioGroup>
            </FormControl>

            <Divider sx={{ mb: 2 }} />

            {/* Status Filters */}
            <FormControl component="fieldset" sx={{ width: '100%' }}>
                <FormLabel component="legend" sx={{ mb: 1, fontSize: '0.875rem', fontWeight: 500 }}>
                    Status
                </FormLabel>
                <FormControlLabel
                    control={
                        <Checkbox
                            size="small"
                            checked={filters.publishedOnly}
                            onChange={(e) => onFiltersChange({ ...filters, publishedOnly: e.target.checked })}
                        />
                    }
                    label="Published Only"
                />
                <FormControlLabel
                    control={
                        <Checkbox
                            size="small"
                            checked={filters.publicOnly}
                            onChange={(e) => onFiltersChange({ ...filters, publicOnly: e.target.checked })}
                        />
                    }
                    label="Public Only"
                />
            </FormControl>
        </Paper>
    );
};
