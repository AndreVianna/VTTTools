// GENERATED: 2025-10-04 by Claude Code - Scene Editor Redesign
// LAYER: UI (Component)

/**
 * SceneEditorMenuBar Component
 * Top menu bar with hierarchical dropdown menus
 * - Stage: Background (Upload), Grid (Type, Size, Offsets, Snap), Zoom (Controls, Reset)
 * - Structures: (Coming soon)
 * - Assets: (Coming soon)
 *
 * Modifier Key Controls for Grid Size/Offset Adjustments:
 * - Default (no modifier): ±10
 * - Shift: ±1
 * - Ctrl: ±0.1
 * - Ctrl+Shift: ±0.01
 *
 * All changes apply immediately (no save button)
 */

import React, { useState } from 'react';
import {
    Box,
    Paper,
    Typography,
    IconButton,
    Select,
    MenuItem,
    Checkbox,
    FormControlLabel,
    Button,
    Menu,
    SelectChangeEvent,
    Divider
} from '@mui/material';
import {
    Add as AddIcon,
    Remove as RemoveIcon,
    ExpandMore as ExpandMoreIcon,
    Upload as UploadIcon,
    RestartAlt as ResetIcon
} from '@mui/icons-material';
import { GridConfig, GridType } from '@utils/gridCalculator';
import { AssetPicker } from '@components/common';
import { Asset, AssetCategory, AssetType } from '@/types/domain';

export interface SceneEditorMenuBarProps {
    gridConfig: GridConfig;
    onGridChange: (newGrid: GridConfig) => void;
    zoomPercentage: number;
    onZoomIn: () => void;
    onZoomOut: () => void;
    onZoomReset: () => void;
    onBackgroundUpload: () => void;
    onAssetSelect: (asset: Asset) => void;  // Callback when asset is selected for placement
}

export const SceneEditorMenuBar: React.FC<SceneEditorMenuBarProps> = ({
    gridConfig,
    onGridChange,
    zoomPercentage,
    onZoomIn,
    onZoomOut,
    onZoomReset,
    onBackgroundUpload,
    onAssetSelect
}) => {
    const [stageMenuAnchor, setStageMenuAnchor] = useState<null | HTMLElement>(null);
    const [structuresMenuAnchor, setStructuresMenuAnchor] = useState<null | HTMLElement>(null);
    const [objectsMenuAnchor, setObjectsMenuAnchor] = useState<null | HTMLElement>(null);
    const [entitiesMenuAnchor, setEntitiesMenuAnchor] = useState<null | HTMLElement>(null);

    // Asset picker state
    const [assetPickerOpen, setAssetPickerOpen] = useState(false);
    const [pickerCategory, setPickerCategory] = useState<AssetCategory>(AssetCategory.Static);
    const [pickerAllowedTypes, setPickerAllowedTypes] = useState<AssetType[] | undefined>(undefined);

    const handleStageMenuOpen = (event: React.MouseEvent<HTMLElement>) => {
        setStageMenuAnchor(event.currentTarget);
    };

    const handleStageMenuClose = () => {
        setStageMenuAnchor(null);
    };

    const handleStructuresMenuOpen = (event: React.MouseEvent<HTMLElement>) => {
        setStructuresMenuAnchor(event.currentTarget);
    };

    const handleStructuresMenuClose = () => {
        setStructuresMenuAnchor(null);
    };

    const handleObjectsMenuOpen = (event: React.MouseEvent<HTMLElement>) => {
        setObjectsMenuAnchor(event.currentTarget);
    };

    const handleObjectsMenuClose = () => {
        setObjectsMenuAnchor(null);
    };

    const handleEntitiesMenuOpen = (event: React.MouseEvent<HTMLElement>) => {
        setEntitiesMenuAnchor(event.currentTarget);
    };

    const handleEntitiesMenuClose = () => {
        setEntitiesMenuAnchor(null);
    };

    // Asset picker handlers
    const handleOpenAssetPicker = (category: AssetCategory, allowedTypes?: AssetType[]) => {
        setPickerCategory(category);
        setPickerAllowedTypes(allowedTypes);
        setAssetPickerOpen(true);
        // Close all menus
        handleStructuresMenuClose();
        handleObjectsMenuClose();
        handleEntitiesMenuClose();
    };

    const handleAssetSelected = (asset: Asset) => {
        setAssetPickerOpen(false);
        onAssetSelect(asset);
    };

    // Calculate delta based on modifier keys
    // Default: ±10, Shift: ±1, Ctrl: ±0.1, Ctrl+Shift: ±0.01
    const calculateDelta = (baseDirection: number, event: React.MouseEvent) => {
        if (event.ctrlKey && event.shiftKey) {
            return baseDirection * 0.01;
        } else if (event.ctrlKey) {
            return baseDirection * 0.1;
        } else if (event.shiftKey) {
            return baseDirection * 1;
        } else {
            return baseDirection * 10;
        }
    };

    // Grid type change handler
    const handleGridTypeChange = (event: SelectChangeEvent<number>) => {
        onGridChange({
            ...gridConfig,
            type: event.target.value as GridType
        });
    };

    // Numeric field change handlers with increment/decrement
    const handleCellWidthChange = (direction: number, event: React.MouseEvent) => {
        const delta = calculateDelta(direction, event);
        onGridChange({
            ...gridConfig,
            cellWidth: Math.max(0.01, gridConfig.cellWidth + delta)
        });
    };

    const handleCellHeightChange = (direction: number, event: React.MouseEvent) => {
        const delta = calculateDelta(direction, event);
        onGridChange({
            ...gridConfig,
            cellHeight: Math.max(0.01, gridConfig.cellHeight + delta)
        });
    };

    const handleOffsetXChange = (direction: number, event: React.MouseEvent) => {
        const delta = calculateDelta(direction, event);
        onGridChange({
            ...gridConfig,
            offsetX: gridConfig.offsetX + delta
        });
    };

    const handleOffsetYChange = (direction: number, event: React.MouseEvent) => {
        const delta = calculateDelta(direction, event);
        onGridChange({
            ...gridConfig,
            offsetY: gridConfig.offsetY + delta
        });
    };

    const handleSnapToGridChange = (event: React.ChangeEvent<HTMLInputElement>) => {
        onGridChange({
            ...gridConfig,
            snapToGrid: event.target.checked
        });
    };

    return (
        <Paper elevation={1} sx={{ p: 0.5, display: 'flex', alignItems: 'center', gap: 1 }}>
            {/* Stage Menu */}
            <Button
                onClick={handleStageMenuOpen}
                endIcon={<ExpandMoreIcon />}
                sx={{ textTransform: 'none', minWidth: 'auto', px: 1 }}
                size="small"
            >
                Stage
            </Button>
            <Menu
                anchorEl={stageMenuAnchor}
                open={Boolean(stageMenuAnchor)}
                onClose={handleStageMenuClose}
                PaperProps={{
                    sx: { minWidth: 280, p: 1.5 }
                }}
            >
                {/* Background Section */}
                <Box sx={{ mb: 1.5 }}>
                    <Typography variant="subtitle2" sx={{ mb: 0.5, fontSize: '0.875rem' }}>
                        Background
                    </Typography>
                    <Box sx={{ ml: 1 }}>
                        <Button
                            size="small"
                            startIcon={<UploadIcon />}
                            onClick={() => {
                                onBackgroundUpload();
                                handleStageMenuClose();
                            }}
                            variant="outlined"
                            fullWidth
                        >
                            Upload
                        </Button>
                    </Box>
                </Box>

                <Divider sx={{ my: 1 }} />

                {/* Grid Section */}
                <Box>
                    <Typography variant="subtitle2" sx={{ mb: 0.5, fontSize: '0.875rem' }}>
                        Grid
                    </Typography>
                    <Box sx={{ ml: 1, display: 'flex', flexDirection: 'column', gap: 1 }}>
                        {/* Grid Type */}
                        <Select
                            size="small"
                            value={gridConfig.type}
                            onChange={handleGridTypeChange}
                            fullWidth
                        >
                            <MenuItem value={GridType.NoGrid}>No Grid</MenuItem>
                            <MenuItem value={GridType.Square}>Square</MenuItem>
                            <MenuItem value={GridType.HexH}>Hex - Horizontal</MenuItem>
                            <MenuItem value={GridType.HexV}>Hex - Vertical</MenuItem>
                            <MenuItem value={GridType.Isometric}>Isometric</MenuItem>
                        </Select>

                        {/* Cell Width */}
                        <Box>
                            <Typography variant="caption" color="text.secondary" sx={{ mb: 0.25, display: 'block', fontSize: '0.75rem' }}>
                                Cell Width
                            </Typography>
                            <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.5 }}>
                                <IconButton size="small" onClick={(e) => handleCellWidthChange(-1, e)} sx={{ p: 0.5 }}>
                                    <RemoveIcon fontSize="small" />
                                </IconButton>
                                <Typography
                                    variant="body2"
                                    sx={{
                                        flexGrow: 1,
                                        textAlign: 'center',
                                        bgcolor: 'action.selected',
                                        py: 0.25,
                                        px: 0.5,
                                        borderRadius: 0.5,
                                        fontSize: '0.875rem'
                                    }}
                                >
                                    {gridConfig.cellWidth.toFixed(2)}
                                </Typography>
                                <IconButton size="small" onClick={(e) => handleCellWidthChange(1, e)} sx={{ p: 0.5 }}>
                                    <AddIcon fontSize="small" />
                                </IconButton>
                            </Box>
                        </Box>

                        {/* Cell Height */}
                        <Box>
                            <Typography variant="caption" color="text.secondary" sx={{ mb: 0.25, display: 'block', fontSize: '0.75rem' }}>
                                Cell Height
                            </Typography>
                            <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.5 }}>
                                <IconButton size="small" onClick={(e) => handleCellHeightChange(-1, e)} sx={{ p: 0.5 }}>
                                    <RemoveIcon fontSize="small" />
                                </IconButton>
                                <Typography
                                    variant="body2"
                                    sx={{
                                        flexGrow: 1,
                                        textAlign: 'center',
                                        bgcolor: 'action.selected',
                                        py: 0.25,
                                        px: 0.5,
                                        borderRadius: 0.5,
                                        fontSize: '0.875rem'
                                    }}
                                >
                                    {gridConfig.cellHeight.toFixed(2)}
                                </Typography>
                                <IconButton size="small" onClick={(e) => handleCellHeightChange(1, e)} sx={{ p: 0.5 }}>
                                    <AddIcon fontSize="small" />
                                </IconButton>
                            </Box>
                        </Box>

                        {/* Offset Left */}
                        <Box>
                            <Typography variant="caption" color="text.secondary" sx={{ mb: 0.25, display: 'block', fontSize: '0.75rem' }}>
                                Offset Left
                            </Typography>
                            <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.5 }}>
                                <IconButton size="small" onClick={(e) => handleOffsetXChange(-1, e)} sx={{ p: 0.5 }}>
                                    <RemoveIcon fontSize="small" />
                                </IconButton>
                                <Typography
                                    variant="body2"
                                    sx={{
                                        flexGrow: 1,
                                        textAlign: 'center',
                                        bgcolor: 'action.selected',
                                        py: 0.25,
                                        px: 0.5,
                                        borderRadius: 0.5,
                                        fontSize: '0.875rem'
                                    }}
                                >
                                    {gridConfig.offsetX.toFixed(2)}
                                </Typography>
                                <IconButton size="small" onClick={(e) => handleOffsetXChange(1, e)} sx={{ p: 0.5 }}>
                                    <AddIcon fontSize="small" />
                                </IconButton>
                            </Box>
                        </Box>

                        {/* Offset Top */}
                        <Box>
                            <Typography variant="caption" color="text.secondary" sx={{ mb: 0.25, display: 'block', fontSize: '0.75rem' }}>
                                Offset Top
                            </Typography>
                            <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.5 }}>
                                <IconButton size="small" onClick={(e) => handleOffsetYChange(-1, e)} sx={{ p: 0.5 }}>
                                    <RemoveIcon fontSize="small" />
                                </IconButton>
                                <Typography
                                    variant="body2"
                                    sx={{
                                        flexGrow: 1,
                                        textAlign: 'center',
                                        bgcolor: 'action.selected',
                                        py: 0.25,
                                        px: 0.5,
                                        borderRadius: 0.5,
                                        fontSize: '0.875rem'
                                    }}
                                >
                                    {gridConfig.offsetY.toFixed(2)}
                                </Typography>
                                <IconButton size="small" onClick={(e) => handleOffsetYChange(1, e)} sx={{ p: 0.5 }}>
                                    <AddIcon fontSize="small" />
                                </IconButton>
                            </Box>
                        </Box>

                        {/* Snap to Grid */}
                        <FormControlLabel
                            control={
                                <Checkbox
                                    size="small"
                                    checked={gridConfig.snapToGrid}
                                    onChange={handleSnapToGridChange}
                                />
                            }
                            label={<Typography variant="body2">Snap to Grid</Typography>}
                        />
                    </Box>
                </Box>

                <Divider sx={{ my: 1 }} />

                {/* Zoom Section */}
                <Box>
                    <Typography variant="subtitle2" sx={{ mb: 0.5, fontSize: '0.875rem' }}>
                        Zoom
                    </Typography>
                    <Box sx={{ ml: 1, display: 'flex', flexDirection: 'column', gap: 1 }}>
                        {/* Zoom Controls */}
                        <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.5 }}>
                            <IconButton size="small" onClick={onZoomOut} sx={{ p: 0.5 }}>
                                <RemoveIcon fontSize="small" />
                            </IconButton>
                            <Typography
                                variant="body2"
                                sx={{
                                    flexGrow: 1,
                                    textAlign: 'center',
                                    bgcolor: 'action.selected',
                                    py: 0.25,
                                    px: 0.5,
                                    borderRadius: 0.5,
                                    fontSize: '0.875rem',
                                    minWidth: 60
                                }}
                            >
                                {Math.round(zoomPercentage)}%
                            </Typography>
                            <IconButton size="small" onClick={onZoomIn} sx={{ p: 0.5 }}>
                                <AddIcon fontSize="small" />
                            </IconButton>
                        </Box>

                        {/* Reset Button */}
                        <Button
                            size="small"
                            startIcon={<ResetIcon />}
                            onClick={() => {
                                onZoomReset();
                                handleStageMenuClose();
                            }}
                            variant="outlined"
                            fullWidth
                        >
                            Reset
                        </Button>
                    </Box>
                </Box>
            </Menu>

            {/* Structures Menu - Static Assets (walls, doors, terrain) */}
            <Button
                onClick={handleStructuresMenuOpen}
                endIcon={<ExpandMoreIcon />}
                sx={{ textTransform: 'none', minWidth: 'auto', px: 1 }}
                size="small"
            >
                Structures
            </Button>
            <Menu
                anchorEl={structuresMenuAnchor}
                open={Boolean(structuresMenuAnchor)}
                onClose={handleStructuresMenuClose}
                PaperProps={{
                    sx: { minWidth: 200, p: 1.5 }
                }}
            >
                <Typography variant="subtitle2" sx={{ mb: 1, fontSize: '0.875rem' }}>
                    Static Assets
                </Typography>
                <Typography variant="caption" color="text.secondary" sx={{ fontSize: '0.75rem', display: 'block', mb: 1 }}>
                    Structural elements (locked in place)
                </Typography>
                <Button
                    fullWidth
                    variant="outlined"
                    size="small"
                    onClick={() => handleOpenAssetPicker(AssetCategory.Static)}
                >
                    Browse Structures
                </Button>
            </Menu>

            {/* Objects Menu - Passive Assets (furniture, items) */}
            <Button
                onClick={handleObjectsMenuOpen}
                endIcon={<ExpandMoreIcon />}
                sx={{ textTransform: 'none', minWidth: 'auto', px: 1 }}
                size="small"
            >
                Objects
            </Button>
            <Menu
                anchorEl={objectsMenuAnchor}
                open={Boolean(objectsMenuAnchor)}
                onClose={handleObjectsMenuClose}
                PaperProps={{
                    sx: { minWidth: 200, p: 1.5 }
                }}
            >
                <Typography variant="subtitle2" sx={{ mb: 1, fontSize: '0.875rem' }}>
                    Passive Assets
                </Typography>
                <Typography variant="caption" color="text.secondary" sx={{ fontSize: '0.75rem', display: 'block', mb: 1 }}>
                    Manipulable objects (furniture, items)
                </Typography>
                <Button
                    fullWidth
                    variant="outlined"
                    size="small"
                    onClick={() => handleOpenAssetPicker(AssetCategory.Passive)}
                >
                    Browse Objects
                </Button>
            </Menu>

            {/* Entities Menu - Active Assets (characters, NPCs, monsters) */}
            <Button
                onClick={handleEntitiesMenuOpen}
                endIcon={<ExpandMoreIcon />}
                sx={{ textTransform: 'none', minWidth: 'auto', px: 1 }}
                size="small"
            >
                Entities
            </Button>
            <Menu
                anchorEl={entitiesMenuAnchor}
                open={Boolean(entitiesMenuAnchor)}
                onClose={handleEntitiesMenuClose}
                PaperProps={{
                    sx: { minWidth: 200, p: 1.5 }
                }}
            >
                <Typography variant="subtitle2" sx={{ mb: 1, fontSize: '0.875rem' }}>
                    Active Assets
                </Typography>
                <Typography variant="caption" color="text.secondary" sx={{ fontSize: '0.75rem', display: 'block', mb: 1 }}>
                    Interactive entities (characters, NPCs, monsters)
                </Typography>
                <Button
                    fullWidth
                    variant="outlined"
                    size="small"
                    onClick={() => handleOpenAssetPicker(AssetCategory.Active)}
                >
                    Browse Entities
                </Button>
            </Menu>

            {/* Asset Picker Dialog */}
            <AssetPicker
                open={assetPickerOpen}
                onClose={() => setAssetPickerOpen(false)}
                onSelect={handleAssetSelected}
                category={pickerCategory}
                allowedTypes={pickerAllowedTypes}
            />
        </Paper>
    );
};
