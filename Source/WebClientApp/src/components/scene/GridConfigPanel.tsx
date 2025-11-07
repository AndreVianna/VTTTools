// GENERATED: 2025-10-03 by Claude Code Phase 2
// SPEC: Documents/Areas/Library/Features/SceneManagement/UseCases/ConfigureGrid/USE_CASE.md
// USE_CASE: ConfigureGrid
// LAYER: UI (React Component)

/**
 * GridConfigPanel component
 * Material-UI form for configuring scene grid settings
 * ACCEPTANCE_CRITERION: AC-01 - Grid configured successfully with all properties
 */

import React, { useState } from 'react';
import {
    Box,
    FormControl,
    InputLabel,
    Select,
    MenuItem,
    TextField,
    FormControlLabel,
    Checkbox,
    Button,
    Paper,
    Typography,
    Alert
} from '@mui/material';
import { GridConfig, GridType, validateGrid } from '@utils/gridCalculator';

export interface GridConfigPanelProps {
    initialGrid: GridConfig;
    onSave: (grid: GridConfig) => Promise<void>;
    onCancel?: () => void;
}

/**
 * Grid configuration panel with Material-UI form
 * Real-time validation with live preview support
 * QUALITY_GATE: Grid config updates in <100ms (Phase 4 Gate 4)
 */
export const GridConfigPanel: React.FC<GridConfigPanelProps> = ({
    initialGrid,
    onSave,
    onCancel
}) => {
    const [grid, setGrid] = useState<GridConfig>(initialGrid);
    const [isLoading, setIsLoading] = useState(false);
    const [errors, setErrors] = useState<string[]>([]);

    // Real-time validation
    const validationErrors = validateGrid(grid);
    const hasErrors = validationErrors.length > 0;

    const handleTypeChange = (type: GridType) => {
        setGrid(prev => ({ ...prev, type }));
    };

    const handleSnapToggle = (snap: boolean) => {
        setGrid(prev => ({ ...prev, snap }));
    };

    const handleSave = async () => {
        // Validate before saving (INV-10, color format, grid type)
        const validationErrors = validateGrid(grid);
        if (validationErrors.length > 0) {
            setErrors(validationErrors);
            return;
        }

        setIsLoading(true);
        setErrors([]);

        try {
            // Call backend API: PATCH /api/library/scenes/{id}/grid
            await onSave(grid);
        } catch (_error) {
            const errorMessage = _error instanceof Error ? _error.message : 'Failed to save grid configuration';
            setErrors([errorMessage]);
        } finally {
            setIsLoading(false);
        }
    };

    return (
        <Paper elevation={2} sx={{ p: 3, maxWidth: 600 }}>
            <Typography variant="h6" gutterBottom>
                Grid Configuration
            </Typography>

            {errors.length > 0 && (
                <Alert severity="error" sx={{ mb: 2 }}>
                    {errors.map((error, index) => (
                        <div key={index}>{error}</div>
                    ))}
                </Alert>
            )}

            <Box component="form" sx={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
                {/* Grid Type */}
                <FormControl fullWidth>
                    <InputLabel id="grid-type-label">Grid Type</InputLabel>
                    <Select
                        labelId="grid-type-label"
                        value={grid.type}
                        label="Grid Type"
                        onChange={(e) => handleTypeChange(e.target.value as GridType)}
                    >
                        <MenuItem value={GridType.NoGrid}>No Grid</MenuItem>
                        <MenuItem value={GridType.Square}>Square</MenuItem>
                        <MenuItem value={GridType.HexH}>Hexagonal (Horizontal)</MenuItem>
                        <MenuItem value={GridType.HexV}>Hexagonal (Vertical)</MenuItem>
                        <MenuItem value={GridType.Isometric}>Isometric</MenuItem>
                    </Select>
                </FormControl>

                {/* Cell Dimensions - Validation INV-10: Must be > 0 */}
                <Box sx={{ display: 'flex', gap: 2 }}>
                    <TextField
                        label="Cell Width (px)"
                        type="number"
                        value={grid.cellSize.width}
                        onChange={(e) => {
                            const value = parseInt(e.target.value, 10);
                            if (!isNaN(value)) {
                                setGrid(prev => ({ ...prev, cellSize: { ...prev.cellSize, width: value } }));
                            }
                        }}
                        error={grid.cellSize.width <= 0}
                        helperText={grid.cellSize.width <= 0 ? 'Must be positive (INV-10)' : ''}
                        disabled={grid.type === GridType.NoGrid}
                        fullWidth
                        inputProps={{ min: 1 }}
                    />
                    <TextField
                        label="Cell Height (px)"
                        type="number"
                        value={grid.cellSize.height}
                        onChange={(e) => {
                            const value = parseInt(e.target.value, 10);
                            if (!isNaN(value)) {
                                setGrid(prev => ({ ...prev, cellSize: { ...prev.cellSize, height: value } }));
                            }
                        }}
                        error={grid.cellSize.height <= 0}
                        helperText={grid.cellSize.height <= 0 ? 'Must be positive (INV-10)' : ''}
                        disabled={grid.type === GridType.NoGrid}
                        fullWidth
                        inputProps={{ min: 1 }}
                    />
                </Box>

                {/* Grid Offset */}
                <Box sx={{ display: 'flex', gap: 2 }}>
                    <TextField
                        label="Offset X (px)"
                        type="number"
                        value={grid.offset.left}
                        onChange={(e) => {
                            const value = parseInt(e.target.value, 10);
                            if (!isNaN(value)) {
                                setGrid(prev => ({ ...prev, offset: { ...prev.offset, left: value } }));
                            }
                        }}
                        disabled={grid.type === GridType.NoGrid}
                        fullWidth
                    />
                    <TextField
                        label="Offset Y (px)"
                        type="number"
                        value={grid.offset.top}
                        onChange={(e) => {
                            const value = parseInt(e.target.value, 10);
                            if (!isNaN(value)) {
                                setGrid(prev => ({ ...prev, offset: { ...prev.offset, top: value } }));
                            }
                        }}
                        disabled={grid.type === GridType.NoGrid}
                        fullWidth
                    />
                </Box>


                {/* Snap to Grid */}
                <FormControlLabel
                    control={
                        <Checkbox
                            checked={grid.snap}
                            onChange={(e) => handleSnapToggle(e.target.checked)}
                            disabled={grid.type === GridType.NoGrid}
                        />
                    }
                    label="Snap assets to grid"
                />

                {/* Actions */}
                <Box sx={{ display: 'flex', gap: 2, justifyContent: 'flex-end', mt: 2 }}>
                    {onCancel && (
                        <Button
                            variant="outlined"
                            onClick={onCancel}
                            disabled={isLoading}
                        >
                            Cancel
                        </Button>
                    )}
                    <Button
                        variant="contained"
                        onClick={handleSave}
                        disabled={isLoading || hasErrors}
                    >
                        {isLoading ? 'Saving...' : 'Save Grid'}
                    </Button>
                </Box>
            </Box>
        </Paper>
    );
};
