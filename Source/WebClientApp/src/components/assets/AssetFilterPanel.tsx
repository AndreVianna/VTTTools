// GENERATED: 2025-10-07 by Claude Code Phase 5 Step 3
// WORLD: EPIC-001 Phase 5 - Asset Library UI
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
    FormControlLabel,
    Checkbox,
    Button,
    Divider,
    Box
} from '@mui/material';
import {
    FilterList as FilterIcon,
    Clear as ClearIcon
} from '@mui/icons-material';
import { AssetKind, CreatureCategory } from '@/types/domain';

export interface AssetFilters {
    kind?: AssetKind;
    creatureCategory?: CreatureCategory;
    // Ownership - checkboxes
    showMine: boolean;
    showOthers: boolean;
    // Visibility - checkboxes
    showPublic: boolean;
    showPrivate: boolean;
    // Status - checkboxes
    showPublished: boolean;
    showDraft: boolean;
}

export interface AssetFilterPanelProps {
    filters: AssetFilters;
    onFiltersChange: (filters: AssetFilters) => void;
}

export const AssetFilterPanel: React.FC<AssetFilterPanelProps> = ({
    filters,
    onFiltersChange
}) => {
    const handleResetFilters = () => {
        const resetFilters: AssetFilters = {
            showMine: true,
            showOthers: true,
            showPublic: true,
            showPrivate: true,
            showPublished: true,
            showDraft: true
        };

        // Keep kind if present (controlled by Tabs in parent)
        if (filters.kind !== undefined) {
            resetFilters.kind = filters.kind;
        }

        onFiltersChange(resetFilters);
    };

    const hasActiveFilters =
        filters.creatureCategory !== undefined ||
        !filters.showMine ||
        !filters.showOthers ||
        !filters.showPublic ||
        !filters.showPrivate ||
        !filters.showPublished ||
        !filters.showDraft;

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

            {/* Ownership Filter - Checkboxes */}
            <FormControl component="fieldset" sx={{ width: '100%', mb: 3 }}>
                <FormLabel component="legend" sx={{ mb: 1, fontSize: '0.875rem', fontWeight: 500 }}>
                    Ownership
                </FormLabel>
                <Box sx={{ display: 'flex', flexDirection: 'column' }}>
                    <FormControlLabel
                        control={
                            <Checkbox
                                size="small"
                                checked={filters.showMine}
                                onChange={(e) => onFiltersChange({ ...filters, showMine: e.target.checked })}
                            />
                        }
                        label="Mine"
                    />
                    <FormControlLabel
                        control={
                            <Checkbox
                                size="small"
                                checked={filters.showOthers}
                                onChange={(e) => onFiltersChange({ ...filters, showOthers: e.target.checked })}
                            />
                        }
                        label="Others"
                    />
                </Box>
            </FormControl>

            {/* Status/Visibility Filters - Only when "Mine" is checked */}
            {filters.showMine && (
                <>
                    <Divider sx={{ mb: 2 }} />

                    <FormControl component="fieldset" sx={{ width: '100%' }}>
                        <Box sx={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 2 }}>
                            {/* Status Column */}
                            <Box>
                                <FormLabel component="legend" sx={{ mb: 1, fontSize: '0.875rem', fontWeight: 500 }}>
                                    Status
                                </FormLabel>
                                <Box sx={{ display: 'flex', flexDirection: 'column' }}>
                                    <FormControlLabel
                                        control={
                                            <Checkbox
                                                size="small"
                                                checked={filters.showPublished}
                                                onChange={(e) => onFiltersChange({ ...filters, showPublished: e.target.checked })}
                                            />
                                        }
                                        label="Published"
                                    />
                                    <FormControlLabel
                                        control={
                                            <Checkbox
                                                size="small"
                                                checked={filters.showDraft}
                                                onChange={(e) => onFiltersChange({ ...filters, showDraft: e.target.checked })}
                                            />
                                        }
                                        label="Draft"
                                    />
                                </Box>
                            </Box>

                            {/* Visibility Column */}
                            <Box>
                                <FormLabel component="legend" sx={{ mb: 1, fontSize: '0.875rem', fontWeight: 500 }}>
                                    Visibility
                                </FormLabel>
                                <Box sx={{ display: 'flex', flexDirection: 'column' }}>
                                    <FormControlLabel
                                        control={
                                            <Checkbox
                                                size="small"
                                                checked={filters.showPublic}
                                                onChange={(e) => onFiltersChange({ ...filters, showPublic: e.target.checked })}
                                            />
                                        }
                                        label="Public"
                                    />
                                    <FormControlLabel
                                        control={
                                            <Checkbox
                                                size="small"
                                                checked={filters.showPrivate}
                                                onChange={(e) => onFiltersChange({ ...filters, showPrivate: e.target.checked })}
                                            />
                                        }
                                        label="Private"
                                    />
                                </Box>
                            </Box>
                        </Box>
                    </FormControl>
                </>
            )}
        </Paper>
    );
};
