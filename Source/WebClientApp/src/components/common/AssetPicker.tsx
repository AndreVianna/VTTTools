// GENERATED: 2025-10-04 by Claude Code - Asset Picker Component
// LAYER: UI (Component)

/**
 * AssetPicker Component
 * Reusable asset selection dialog with filtering by category and type
 *
 * Usage:
 * - Can filter by single category (Static/Passive/Active)
 * - Can optionally filter by specific asset types
 * - Returns selected asset via onSelect callback
 * - Shows asset preview with image, name, and description
 */

import React, { useState, useMemo } from 'react';
import {
    Dialog,
    DialogTitle,
    DialogContent,
    DialogActions,
    Button,
    Card,
    CardMedia,
    CardContent,
    Typography,
    Box,
    TextField,
    Chip,
    CircularProgress,
    Alert,
    Grid
} from '@mui/material';
import {
    Search as SearchIcon,
    Close as CloseIcon
} from '@mui/icons-material';
import { Asset, AssetCategory, AssetType } from '@/types/domain';
import { useGetAssetsQuery } from '@/services/assetsApi';

export interface AssetPickerProps {
    open: boolean;
    onClose: () => void;
    onSelect: (asset: Asset) => void;

    // Filtering options
    category: AssetCategory;           // Required: which category to show
    allowedTypes?: AssetType[];        // Optional: limit to specific types

    // UI customization
    title?: string;
    multiSelect?: boolean;             // Future: allow selecting multiple assets
}

export const AssetPicker: React.FC<AssetPickerProps> = ({
    open,
    onClose,
    onSelect,
    category,
    allowedTypes,
    title,
    multiSelect = false
}) => {
    const [searchQuery, setSearchQuery] = useState('');
    const [selectedAsset, setSelectedAsset] = useState<Asset | null>(null);

    // Fetch assets from API
    const { data: allAssets, isLoading, error } = useGetAssetsQuery({});

    // Filter assets by category and type
    const filteredAssets = useMemo(() => {
        if (!allAssets) return [];

        return allAssets.filter(asset => {
            // Filter by category
            if (asset.category !== category) return false;

            // Filter by allowed types if specified
            if (allowedTypes && allowedTypes.length > 0) {
                if (!allowedTypes.includes(asset.type)) return false;
            }

            // Filter by search query
            if (searchQuery) {
                const query = searchQuery.toLowerCase();
                return (
                    asset.name.toLowerCase().includes(query) ||
                    asset.description.toLowerCase().includes(query)
                );
            }

            return true;
        });
    }, [allAssets, category, allowedTypes, searchQuery]);

    // Get category display name
    const getCategoryName = (cat: AssetCategory): string => {
        switch (cat) {
            case AssetCategory.Static:
                return 'Structures';
            case AssetCategory.Passive:
                return 'Objects';
            case AssetCategory.Active:
                return 'Entities';
            default:
                return 'Assets';
        }
    };

    // Get category color
    const getCategoryColor = (cat: AssetCategory): string => {
        switch (cat) {
            case AssetCategory.Static:
                return '#9E9E9E'; // Gray
            case AssetCategory.Passive:
                return '#795548'; // Brown
            case AssetCategory.Active:
                return '#4CAF50'; // Green
            default:
                return '#2196F3'; // Blue
        }
    };

    const handleAssetClick = (asset: Asset) => {
        if (multiSelect) {
            // Future: handle multi-select
            setSelectedAsset(asset);
        } else {
            setSelectedAsset(asset);
        }
    };

    const handleConfirm = () => {
        if (selectedAsset) {
            onSelect(selectedAsset);
            handleClose();
        }
    };

    const handleClose = () => {
        setSelectedAsset(null);
        setSearchQuery('');
        onClose();
    };

    const dialogTitle = title || `Select ${getCategoryName(category)}`;

    return (
        <Dialog
            open={open}
            onClose={handleClose}
            maxWidth="md"
            fullWidth
            PaperProps={{
                sx: { height: '80vh' }
            }}
        >
            <DialogTitle sx={{ pb: 1 }}>
                <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                    <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                        <Typography variant="h6">{dialogTitle}</Typography>
                        <Chip
                            label={category}
                            size="small"
                            sx={{
                                bgcolor: getCategoryColor(category),
                                color: 'white',
                                fontWeight: 500
                            }}
                        />
                    </Box>
                    <Button
                        onClick={handleClose}
                        size="small"
                        sx={{ minWidth: 'auto', p: 0.5 }}
                    >
                        <CloseIcon />
                    </Button>
                </Box>
            </DialogTitle>

            <DialogContent dividers>
                {/* Search Bar */}
                <TextField
                    fullWidth
                    size="small"
                    placeholder="Search assets..."
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    InputProps={{
                        startAdornment: <SearchIcon sx={{ mr: 1, color: 'text.secondary' }} />
                    }}
                    sx={{ mb: 2 }}
                />

                {/* Type Filters Display (if specified) */}
                {allowedTypes && allowedTypes.length > 0 && (
                    <Box sx={{ mb: 2, display: 'flex', gap: 0.5, flexWrap: 'wrap' }}>
                        <Typography variant="caption" color="text.secondary" sx={{ mr: 1 }}>
                            Types:
                        </Typography>
                        {allowedTypes.map(type => (
                            <Chip
                                key={type}
                                label={type}
                                size="small"
                                variant="outlined"
                            />
                        ))}
                    </Box>
                )}

                {/* Loading State */}
                {isLoading && (
                    <Box sx={{ display: 'flex', justifyContent: 'center', py: 4 }}>
                        <CircularProgress />
                    </Box>
                )}

                {/* Error State */}
                {error && (
                    <Alert severity="error" sx={{ mb: 2 }}>
                        Failed to load assets. Please try again.
                    </Alert>
                )}

                {/* Assets Grid */}
                {!isLoading && !error && (
                    <>
                        {filteredAssets.length === 0 ? (
                            <Box sx={{ textAlign: 'center', py: 4 }}>
                                <Typography color="text.secondary">
                                    No assets found matching your criteria
                                </Typography>
                            </Box>
                        ) : (
                            <Grid container spacing={2}>
                                {filteredAssets.map(asset => (
                                    <Grid size={{ xs: 12, sm: 6, md: 4 }} key={asset.id}>
                                        <Card
                                            sx={{
                                                cursor: 'pointer',
                                                transition: 'all 0.2s',
                                                border: selectedAsset?.id === asset.id
                                                    ? `2px solid ${getCategoryColor(category)}`
                                                    : '2px solid transparent',
                                                '&:hover': {
                                                    transform: 'translateY(-4px)',
                                                    boxShadow: 4
                                                }
                                            }}
                                            onClick={() => handleAssetClick(asset)}
                                        >
                                            {/* Asset Image */}
                                            <CardMedia
                                                component="img"
                                                height="120"
                                                image={asset.resource?.id ? `https://localhost:7174/api/resources/${asset.resource.id}` : 'https://via.placeholder.com/100/CCCCCC/FFFFFF?text=No+Image'}
                                                alt={asset.name}
                                                sx={{
                                                    objectFit: 'contain',
                                                    backgroundColor: 'action.hover',
                                                    p: 1
                                                }}
                                            />

                                            {/* Asset Info */}
                                            <CardContent sx={{ p: 1.5 }}>
                                                <Typography variant="subtitle2" noWrap>
                                                    {asset.name}
                                                </Typography>
                                                <Typography
                                                    variant="caption"
                                                    color="text.secondary"
                                                    sx={{
                                                        display: '-webkit-box',
                                                        WebkitLineClamp: 2,
                                                        WebkitBoxOrient: 'vertical',
                                                        overflow: 'hidden'
                                                    }}
                                                >
                                                    {asset.description}
                                                </Typography>
                                                <Chip
                                                    label={asset.type}
                                                    size="small"
                                                    sx={{ mt: 0.5, fontSize: '0.7rem' }}
                                                />
                                            </CardContent>
                                        </Card>
                                    </Grid>
                                ))}
                            </Grid>
                        )}
                    </>
                )}
            </DialogContent>

            <DialogActions sx={{ p: 2 }}>
                <Button onClick={handleClose} variant="outlined">
                    Cancel
                </Button>
                <Button
                    onClick={handleConfirm}
                    variant="contained"
                    disabled={!selectedAsset}
                    sx={{
                        bgcolor: getCategoryColor(category),
                        '&:hover': {
                            bgcolor: getCategoryColor(category),
                            filter: 'brightness(0.9)'
                        }
                    }}
                >
                    Select Asset
                </Button>
            </DialogActions>
        </Dialog>
    );
};
