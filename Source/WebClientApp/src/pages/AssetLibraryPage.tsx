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
    Grid,
    Skeleton,
    Pagination,
    Tabs,
    Tab,
    Tooltip,
    useTheme
} from '@mui/material';
import {
    Add as AddIcon,
    AddCircleOutline as AddCircleOutlineIcon,
    Category as CategoryIcon
} from '@mui/icons-material';
import { useGetAssetsQuery } from '@/services/assetsApi';
import { Asset, AssetKind, CreatureCategory } from '@/types/domain';
import { AssetFilterPanel, AssetFilters, AssetSearchBar, AssetPreviewDialog, AssetCreateDialog } from '@/components/assets';
import { useDebounce } from '@/hooks/useDebounce';
import { getDefaultTokenResource, getResourceUrl } from '@/utils/assetHelpers';

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

    // Kind selection via Tabs (major filter) - defaults to Objects
    const [selectedKind, setSelectedKind] = useState<AssetKind>(AssetKind.Object);

    // Comprehensive filter state
    const [filters, setFilters] = useState<AssetFilters>({
        kind: undefined, // Set from selectedKind
        creatureCategory: undefined,
        showMine: true,
        showOthers: true,
        showPublic: true,
        showPrivate: true,
        showPublished: true,
        showDraft: true
    });

    // Search state with 300ms debounce
    const [searchQuery, setSearchQuery] = useState('');
    const debouncedSearch = useDebounce(searchQuery, 300);

    // Pagination state (12 assets per page)
    const [page, setPage] = useState(1);
    const pageSize = 12;

    // Preview dialog state
    const [selectedAsset, setSelectedAsset] = useState<Asset | null>(null);
    const [previewOpen, setPreviewOpen] = useState(false);

    // Create dialog state
    const [createDialogOpen, setCreateDialogOpen] = useState(false);

    // Build query params from selected kind and filters
    const queryParams: any = {};

    // Kind from Tabs (always set now, no 'all' option)
    queryParams.kind = selectedKind;

    // Creature category
    if (filters.creatureCategory) {
        queryParams.creatureCategory = filters.creatureCategory;
    }

    // Ownership: Determine 'owner' param based on checkboxes
    if (filters.showMine && !filters.showOthers) {
        queryParams.owner = 'mine';
    } else if (filters.showOthers && !filters.showMine) {
        queryParams.owner = 'public';
    } else if (filters.showMine && filters.showOthers) {
        queryParams.owner = 'all';
    }
    // If neither checked, no results (don't send param, filter client-side)

    // Search
    if (debouncedSearch) {
        queryParams.search = debouncedSearch;
    }

    // Published status
    if (filters.showPublished && !filters.showDraft) {
        queryParams.published = true;
    } else if (filters.showDraft && !filters.showPublished) {
        queryParams.published = false;
    }

    // Fetch assets from API with filters
    const { data: allAssets, isLoading, error, refetch } = useGetAssetsQuery(queryParams);

    // Client-side filtering for visibility/status checkboxes (when showMine is checked)
    const filteredAssets = React.useMemo(() => {
        if (!allAssets) return [];

        // Apply visibility/status filters when "Mine" checkbox is checked
        if (filters.showMine) {
            return allAssets.filter(asset => {
                // Check visibility filter
                const visibilityMatch =
                    (filters.showPublic && asset.isPublic) ||
                    (filters.showPrivate && !asset.isPublic);

                // Check status filter
                const statusMatch =
                    (filters.showPublished && filters.showDraft) || // Both checked, show all
                    (filters.showPublished && asset.isPublished) ||
                    (filters.showDraft && !asset.isPublished);

                return visibilityMatch && statusMatch;
            });
        }

        // For "Others" only, no client-side filtering needed (backend already filtered to public published)
        return allAssets;
    }, [allAssets, filters.showMine, filters.showPublic, filters.showPrivate, filters.showPublished, filters.showDraft]);

    // Client-side pagination (slice assets for current page)
    const totalAssets = filteredAssets?.length || 0;
    const totalPages = Math.ceil(totalAssets / pageSize);
    const startIndex = (page - 1) * pageSize;
    const endIndex = startIndex + pageSize;
    const assets = filteredAssets?.slice(startIndex, endIndex);

    // Sync selectedKind with filters.kind for query
    React.useEffect(() => {
        setFilters(prev => ({
            ...prev,
            kind: selectedKind
        }));
    }, [selectedKind]);

    // Reset to page 1 when filters change
    React.useEffect(() => {
        setPage(1);
    }, [filters, debouncedSearch, selectedKind]);

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
            <Box sx={{ mb: 4 }}>
                <Box sx={{ mb: 2 }}>
                    <Typography variant="h4" component="h1" gutterBottom>
                        Asset Library
                    </Typography>
                    <Typography variant="body2" color="text.secondary">
                        Manage your objects and creatures for scenes
                    </Typography>
                </Box>

                {/* Asset Kind Tabs (Major Filter) */}
                <Tabs
                    value={selectedKind}
                    onChange={(_, newValue) => setSelectedKind(newValue)}
                    sx={{ mb: 2, borderBottom: 1, borderColor: 'divider' }}
                >
                    <Tab label="Objects" value={AssetKind.Object} />
                    <Tab label="Creatures" value={AssetKind.Creature} />
                </Tabs>

                {/* Search Bar */}
                <AssetSearchBar
                    value={searchQuery}
                    onChange={setSearchQuery}
                    fullWidth
                />
            </Box>

            {/* Main Content Grid: Filter Panel + Asset Cards */}
            <Grid container spacing={3}>
                {/* Filter Panel Sidebar */}
                <Grid size={{ xs: 12, md: 3 }}>
                    <AssetFilterPanel
                        filters={filters}
                        onFiltersChange={setFilters}
                    />
                </Grid>

                {/* Asset Cards Area */}
                <Grid size={{ xs: 12, md: 9 }}>
                    {/* Results Count */}
                    {allAssets && !isLoading && (
                        <Typography variant="body2" color="text.secondary" sx={{ mb: 2 }}>
                            {totalAssets} {totalAssets === 1 ? 'asset' : 'assets'} found
                            {totalPages > 1 && ` (page ${page} of ${totalPages})`}
                        </Typography>
                    )}

            {/* Loading State */}
            {isLoading && (
                <Grid container spacing={3}>
                    {[...Array(12)].map((_, index) => (
                        <Grid key={index} size={{ xs: 6, sm: 4, md: 3, lg: 2 }}>
                            <Card>
                                <Box sx={{ paddingTop: '100%', position: 'relative' }}>
                                    <Skeleton variant="rectangular" sx={{ position: 'absolute', top: 0, left: 0, right: 0, bottom: 0 }} />
                                </Box>
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

            {/* Asset Cards Grid (always shown with virtual "Add" card) */}
            {!isLoading && !error && assets && (
                <>
                    <Grid container spacing={3}>
                        {/* Virtual "Add" Card (always first) */}
                        <Grid size={{ xs: 6, sm: 4, md: 3, lg: 2 }}>
                            <Card
                                sx={{
                                    height: '100%',
                                    display: 'flex',
                                    flexDirection: 'column',
                                    transition: 'all 0.2s',
                                    cursor: 'pointer',
                                    border: '2px dashed',
                                    borderColor: theme.palette.primary.main,
                                    bgcolor: theme.palette.mode === 'dark' ? 'rgba(255,255,255,0.02)' : 'rgba(0,0,0,0.02)',
                                    '&:hover': {
                                        transform: 'translateY(-4px)',
                                        boxShadow: 4,
                                        bgcolor: theme.palette.mode === 'dark' ? 'rgba(255,255,255,0.05)' : 'rgba(0,0,0,0.05)'
                                    }
                                }}
                                onClick={() => {
                                    setCreateDialogOpen(true);
                                }}
                            >
                                {/* Title: "Add Object" or "Add Creature" */}
                                <CardContent sx={{ pb: 1 }}>
                                    <Typography variant="subtitle2" component="h2" noWrap fontWeight={600} color="primary">
                                        Add {selectedKind === AssetKind.Object ? 'Object' : 'Creature'}
                                    </Typography>
                                </CardContent>

                                {/* Plus Icon in Image Area */}
                                <CardMedia
                                    component="div"
                                    sx={{
                                        paddingTop: '100%', // 1:1 aspect ratio (square)
                                        position: 'relative',
                                        bgcolor: 'transparent'
                                    }}
                                >
                                    <Box
                                        sx={{
                                            position: 'absolute',
                                            top: 0,
                                            left: 0,
                                            right: 0,
                                            bottom: 0,
                                            display: 'flex',
                                            alignItems: 'center',
                                            justifyContent: 'center'
                                        }}
                                    >
                                        <AddCircleOutlineIcon
                                            sx={{
                                                fontSize: 80,
                                                color: theme.palette.primary.main,
                                                opacity: 0.7
                                            }}
                                        />
                                    </Box>
                                </CardMedia>

                                {/* Empty badge area for consistent height */}
                                <CardContent sx={{ pt: 1, pb: 1, flexGrow: 1 }}>
                                    <Box sx={{ minHeight: '24px' }} />
                                </CardContent>

                                {/* Empty actions area for consistent height */}
                                <CardActions sx={{ pt: 0, px: 2, pb: 2 }}>
                                    <Typography variant="caption" color="text.secondary" sx={{ flexGrow: 1 }}>
                                        &nbsp;
                                    </Typography>
                                </CardActions>
                            </Card>
                        </Grid>

                        {/* Regular Asset Cards */}
                        {assets.map((asset) => (
                            <Grid key={asset.id} size={{ xs: 6, sm: 4, md: 3, lg: 2 }}>
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
                                        setSelectedAsset(asset);
                                        setPreviewOpen(true);
                                    }}
                                >
                                    {/* Asset Name - Above Image */}
                                    <CardContent sx={{ pb: 1 }}>
                                        <Typography variant="subtitle2" component="h2" noWrap fontWeight={600}>
                                            {asset.name}
                                        </Typography>
                                    </CardContent>

                                    {/* Asset Image with Description Tooltip */}
                                    <Tooltip title={asset.description} arrow placement="top">
                                        <CardMedia
                                            component="div"
                                            sx={{
                                                paddingTop: '100%', // 1:1 aspect ratio (square)
                                                position: 'relative',
                                                bgcolor: theme.palette.mode === 'dark' ? 'grey.800' : 'grey.200'
                                            }}
                                        >
                                            <Box
                                                sx={{
                                                    position: 'absolute',
                                                    top: 0,
                                                    left: 0,
                                                    right: 0,
                                                    bottom: 0,
                                                    display: 'flex',
                                                    alignItems: 'center',
                                                    justifyContent: 'center'
                                                }}
                                            >
                                            {(() => {
                                                const tokenResource = getDefaultTokenResource(asset);
                                                return tokenResource ? (
                                                    <img
                                                        src={getResourceUrl(tokenResource.resourceId)}
                                                        alt={asset.name}
                                                        style={{
                                                            width: '100%',
                                                            height: '100%',
                                                            objectFit: 'contain'
                                                        }}
                                                    />
                                                ) : (
                                                    <CategoryIcon sx={{ fontSize: 48, color: 'text.disabled' }} />
                                                );
                                            })()}
                                            </Box>
                                        </CardMedia>
                                    </Tooltip>

                                    {/* Asset Info - Badges (no Kind badge - redundant with Tabs) */}
                                    <CardContent sx={{ pt: 1, pb: 1, flexGrow: 1 }}>
                                        <Box sx={{ display: 'flex', gap: 0.5, flexWrap: 'wrap', minHeight: '24px' }}>
                                            {/* Creature Category Badge (only for Creatures) */}
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

                    {/* Pagination (show if multiple pages) */}
                    {totalPages > 1 && (
                        <Box sx={{ display: 'flex', justifyContent: 'center', mt: 4 }}>
                            <Pagination
                                count={totalPages}
                                page={page}
                                onChange={(_, value) => setPage(value)}
                                color="primary"
                                size="large"
                                showFirstButton
                                showLastButton
                            />
                        </Box>
                    )}
                </>
            )}
                </Grid>
            </Grid>

            {/* Asset Preview Dialog */}
            {selectedAsset && (
                <AssetPreviewDialog
                    open={previewOpen}
                    asset={selectedAsset}
                    onClose={() => {
                        setPreviewOpen(false);
                        setSelectedAsset(null);
                    }}
                />
            )}

            {/* Asset Create Dialog */}
            <AssetCreateDialog
                open={createDialogOpen}
                onClose={() => setCreateDialogOpen(false)}
                fixedKind={selectedKind}
            />
        </Container>
    );
};
