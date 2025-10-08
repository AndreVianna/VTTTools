// GENERATED: 2025-10-07 by Claude Code Phase 5 Step 2
// EPIC: EPIC-001 Phase 5 - Asset Library UI
// LAYER: UI (Page Component)

/**
 * Asset Library Page
 * Browse, filter, and manage asset templates (Objects and Creatures)
 * Phase 5: Asset Library UI with Material-UI Card grid
 */

import React, { useState } from 'react';
import {
    Box,
    Container,
    Typography,
    Button,
    Card,
    CardMedia,
    CardContent,
    CardActions,
    Chip,
    Alert,
    CircularProgress,
    Grid,
    Skeleton,
    useTheme
} from '@mui/material';
import {
    Add as AddIcon,
    Category as CategoryIcon
} from '@mui/icons-material';
import { useGetAssetsQuery } from '@/services/assetsApi';
import { Asset, AssetKind, CreatureCategory } from '@/types/domain';

/**
 * Asset Library Page Component
 * Displays asset templates in a responsive Material-UI Card grid
 *
 * THEME SUPPORT: Adapts to dark/light mode
 * - Dark mode: Card backgrounds dark, text light
 * - Light mode: Card backgrounds light, text dark
 */
export const AssetLibraryPage: React.FC = () => {
    const theme = useTheme();
    const [selectedKind, setSelectedKind] = useState<AssetKind | undefined>(undefined);

    // Fetch assets from API with optional kind filter
    // Only include kind in params if it's defined
    const queryParams = selectedKind ? { kind: selectedKind } : {};
    const { data: assets, isLoading, error, refetch } = useGetAssetsQuery(queryParams);

    // Get kind badge color
    const getKindColor = (kind: AssetKind): string => {
        switch (kind) {
            case AssetKind.Object:
                return theme.palette.mode === 'dark' ? '#9E9E9E' : '#757575';
            case AssetKind.Creature:
                return theme.palette.mode === 'dark' ? '#4CAF50' : '#388E3C';
            default:
                return theme.palette.primary.main;
        }
    };

    // Get creature category badge color
    const getCreatureCategoryColor = (category: CreatureCategory): string => {
        switch (category) {
            case CreatureCategory.Character:
                return theme.palette.mode === 'dark' ? '#2196F3' : '#1976D2';
            case CreatureCategory.Monster:
                return theme.palette.mode === 'dark' ? '#F44336' : '#D32F2F';
            default:
                return theme.palette.secondary.main;
        }
    };

    return (
        <Container maxWidth="xl" sx={{ py: 4 }}>
            {/* Page Header */}
            <Box sx={{ mb: 4, display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                <Box>
                    <Typography variant="h4" component="h1" gutterBottom>
                        Asset Library
                    </Typography>
                    <Typography variant="body2" color="text.secondary">
                        Manage your objects and creatures for scenes
                    </Typography>
                </Box>
                <Button
                    variant="contained"
                    startIcon={<AddIcon />}
                    onClick={() => {
                        // TODO: Open create asset dialog (Phase 5 Step 5)
                        console.log('Create asset clicked');
                    }}
                >
                    Create Asset
                </Button>
            </Box>

            {/* Filter Toolbar */}
            <Box sx={{ mb: 3, display: 'flex', gap: 1, flexWrap: 'wrap' }}>
                <Button
                    variant={selectedKind === undefined ? 'contained' : 'outlined'}
                    size="small"
                    startIcon={<CategoryIcon />}
                    onClick={() => setSelectedKind(undefined)}
                >
                    All Assets
                </Button>
                <Button
                    variant={selectedKind === AssetKind.Object ? 'contained' : 'outlined'}
                    size="small"
                    onClick={() => setSelectedKind(AssetKind.Object)}
                    sx={{
                        bgcolor: selectedKind === AssetKind.Object ? getKindColor(AssetKind.Object) : undefined,
                        '&:hover': {
                            bgcolor: selectedKind === AssetKind.Object ? getKindColor(AssetKind.Object) : undefined,
                            filter: 'brightness(0.9)'
                        }
                    }}
                >
                    Objects
                </Button>
                <Button
                    variant={selectedKind === AssetKind.Creature ? 'contained' : 'outlined'}
                    size="small"
                    onClick={() => setSelectedKind(AssetKind.Creature)}
                    sx={{
                        bgcolor: selectedKind === AssetKind.Creature ? getKindColor(AssetKind.Creature) : undefined,
                        '&:hover': {
                            bgcolor: selectedKind === AssetKind.Creature ? getKindColor(AssetKind.Creature) : undefined,
                            filter: 'brightness(0.9)'
                        }
                    }}
                >
                    Creatures
                </Button>
            </Box>

            {/* Results Count */}
            {assets && !isLoading && (
                <Typography variant="body2" color="text.secondary" sx={{ mb: 2 }}>
                    {assets.length} {assets.length === 1 ? 'asset' : 'assets'} found
                </Typography>
            )}

            {/* Loading State */}
            {isLoading && (
                <Grid container spacing={3}>
                    {[...Array(6)].map((_, index) => (
                        <Grid key={index} size={{ xs: 12, sm: 6, md: 4 }}>
                            <Card>
                                <Skeleton variant="rectangular" height={200} />
                                <CardContent>
                                    <Skeleton variant="text" width="60%" height={32} />
                                    <Skeleton variant="text" width="80%" />
                                    <Skeleton variant="rectangular" width={80} height={24} sx={{ mt: 1 }} />
                                </CardContent>
                            </Card>
                        </Grid>
                    ))}
                </Grid>
            )}

            {/* Error State */}
            {error && (
                <Alert
                    severity="error"
                    action={
                        <Button color="inherit" size="small" onClick={() => refetch()}>
                            Retry
                        </Button>
                    }
                    sx={{ mb: 3 }}
                >
                    Failed to load assets. Please try again.
                </Alert>
            )}

            {/* Empty State */}
            {!isLoading && !error && assets && assets.length === 0 && (
                <Box
                    sx={{
                        textAlign: 'center',
                        py: 8,
                        px: 2,
                        bgcolor: theme.palette.mode === 'dark' ? 'background.paper' : 'grey.50',
                        borderRadius: 2,
                        border: `1px dashed ${theme.palette.divider}`
                    }}
                >
                    <CategoryIcon sx={{ fontSize: 64, color: 'text.secondary', mb: 2 }} />
                    <Typography variant="h6" color="text.secondary" gutterBottom>
                        No Assets Found
                    </Typography>
                    <Typography variant="body2" color="text.secondary" sx={{ mb: 3 }}>
                        {selectedKind
                            ? `No ${selectedKind === AssetKind.Object ? 'objects' : 'creatures'} created yet.`
                            : 'Get started by creating your first asset template.'
                        }
                    </Typography>
                    <Button
                        variant="contained"
                        startIcon={<AddIcon />}
                        onClick={() => {
                            // TODO: Open create asset dialog
                            console.log('Create first asset');
                        }}
                    >
                        Create Your First Asset
                    </Button>
                </Box>
            )}

            {/* Asset Cards Grid */}
            {!isLoading && !error && assets && assets.length > 0 && (
                <Grid container spacing={3}>
                    {assets.map((asset) => (
                        <Grid key={asset.id} size={{ xs: 12, sm: 6, md: 4 }}>
                            <Card
                                sx={{
                                    height: '100%',
                                    display: 'flex',
                                    flexDirection: 'column',
                                    transition: 'all 0.2s',
                                    cursor: 'pointer',
                                    '&:hover': {
                                        transform: 'translateY(-4px)',
                                        boxShadow: 4
                                    }
                                }}
                                onClick={() => {
                                    // TODO: Open asset preview dialog (Phase 5 Step 5)
                                    console.log('Asset clicked:', asset.id);
                                }}
                            >
                                {/* Asset Image */}
                                <CardMedia
                                    component="div"
                                    sx={{
                                        height: 200,
                                        bgcolor: theme.palette.mode === 'dark' ? 'grey.800' : 'grey.200',
                                        display: 'flex',
                                        alignItems: 'center',
                                        justifyContent: 'center'
                                    }}
                                >
                                    {asset.resource ? (
                                        <img
                                            src={`https://localhost:7174/api/resources/${asset.resource.id}`}
                                            alt={asset.name}
                                            style={{
                                                width: '100%',
                                                height: '100%',
                                                objectFit: 'contain'
                                            }}
                                        />
                                    ) : (
                                        <CategoryIcon sx={{ fontSize: 64, color: 'text.disabled' }} />
                                    )}
                                </CardMedia>

                                {/* Asset Info */}
                                <CardContent sx={{ flexGrow: 1 }}>
                                    <Typography variant="h6" component="h2" gutterBottom noWrap>
                                        {asset.name}
                                    </Typography>

                                    <Box sx={{ display: 'flex', gap: 0.5, mb: 1, flexWrap: 'wrap' }}>
                                        {/* Kind Badge */}
                                        <Chip
                                            label={asset.kind}
                                            size="small"
                                            sx={{
                                                bgcolor: getKindColor(asset.kind),
                                                color: 'white',
                                                fontWeight: 500,
                                                fontSize: '0.7rem'
                                            }}
                                        />

                                        {/* Creature Category Badge (if Creature) */}
                                        {asset.kind === AssetKind.Creature && 'creatureProps' in asset && (
                                            <Chip
                                                label={asset.creatureProps.category}
                                                size="small"
                                                sx={{
                                                    bgcolor: getCreatureCategoryColor(asset.creatureProps.category),
                                                    color: 'white',
                                                    fontSize: '0.7rem'
                                                }}
                                            />
                                        )}

                                        {/* Published Badge */}
                                        {asset.isPublished && (
                                            <Chip
                                                label="Published"
                                                size="small"
                                                color="success"
                                                variant="outlined"
                                                sx={{ fontSize: '0.7rem' }}
                                            />
                                        )}
                                    </Box>

                                    <Typography
                                        variant="body2"
                                        color="text.secondary"
                                        sx={{
                                            overflow: 'hidden',
                                            textOverflow: 'ellipsis',
                                            display: '-webkit-box',
                                            WebkitLineClamp: 2,
                                            WebkitBoxOrient: 'vertical',
                                            minHeight: '2.5em'
                                        }}
                                    >
                                        {asset.description}
                                    </Typography>
                                </CardContent>

                                {/* Card Actions */}
                                <CardActions sx={{ pt: 0, px: 2, pb: 2 }}>
                                    <Typography variant="caption" color="text.secondary" sx={{ flexGrow: 1 }}>
                                        {asset.kind === AssetKind.Object && 'objectProps' in asset
                                            ? `${asset.objectProps.cellWidth}x${asset.objectProps.cellHeight} cells`
                                            : asset.kind === AssetKind.Creature && 'creatureProps' in asset
                                                ? `${asset.creatureProps.cellSize}x${asset.creatureProps.cellSize} cells`
                                                : ''
                                        }
                                    </Typography>
                                    <Typography variant="caption" color="text.secondary">
                                        {asset.isPublic ? 'Public' : 'Private'}
                                    </Typography>
                                </CardActions>
                            </Card>
                        </Grid>
                    ))}
                </Grid>
            )}
        </Container>
    );
};
