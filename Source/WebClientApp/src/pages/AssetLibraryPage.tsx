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
    AddCircleOutline as AddCircleOutlineIcon,
    Category as CategoryIcon
} from '@mui/icons-material';
import { useGetAssetsQuery } from '@/services/assetsApi';
import { Asset, AssetKind, CreatureCategory, CreatureAsset } from '@/types/domain';
import { AssetFilterPanel, AssetFilters, AssetSearchBar, AssetEditDialog, AssetCreateDialog } from '@/components/assets';
import { useDebounce } from '@/hooks/useDebounce';
import { getDefaultToken, getPortrait, getResourceUrl } from '@/utils/assetHelpers';

export const AssetLibraryPage: React.FC = () => {
    const theme = useTheme();

    const [selectedKind, setSelectedKind] = useState<AssetKind>(AssetKind.Object);

    const [filters, setFilters] = useState<AssetFilters>({
        showMine: true,
        showOthers: true,
        showPublic: true,
        showPrivate: true,
        showPublished: true,
        showDraft: true
    });

    const [searchQuery, setSearchQuery] = useState('');
    const debouncedSearch = useDebounce(searchQuery, 300);

    const [page, setPage] = useState(1);
    const pageSize = 12;

    const [selectedAsset, setSelectedAsset] = useState<Asset | null>(null);
    const [previewOpen, setPreviewOpen] = useState(false);

    const [createDialogOpen, setCreateDialogOpen] = useState(false);

    const queryParams: any = {};

    queryParams.kind = selectedKind;

    if (filters.creatureCategory) {
        queryParams.creatureCategory = filters.creatureCategory;
    }

    if (filters.showMine && !filters.showOthers) {
        queryParams.owner = 'mine';
    } else if (filters.showOthers && !filters.showMine) {
        queryParams.owner = 'public';
    } else if (filters.showMine && filters.showOthers) {
        queryParams.owner = 'all';
    }

    if (debouncedSearch) {
        queryParams.search = debouncedSearch;
    }

    if (filters.showPublished && !filters.showDraft) {
        queryParams.published = true;
    } else if (filters.showDraft && !filters.showPublished) {
        queryParams.published = false;
    }

    const { data: allAssets, isLoading, error, refetch } = useGetAssetsQuery(queryParams);

    const filteredAssets = React.useMemo(() => {
        if (!allAssets) return [];

        if (filters.showMine) {
            return allAssets.filter(asset => {
                const visibilityMatch =
                    (filters.showPublic && asset.isPublic) ||
                    (filters.showPrivate && !asset.isPublic);

                const statusMatch =
                    (filters.showPublished && filters.showDraft) ||
                    (filters.showPublished && asset.isPublished) ||
                    (filters.showDraft && !asset.isPublished);

                return visibilityMatch && statusMatch;
            });
        }

        return allAssets;
    }, [allAssets, filters.showMine, filters.showPublic, filters.showPrivate, filters.showPublished, filters.showDraft]);

    const totalAssets = filteredAssets?.length || 0;
    const totalPages = Math.ceil(totalAssets / pageSize);
    const startIndex = (page - 1) * pageSize;
    const endIndex = startIndex + pageSize;
    const assets = filteredAssets?.slice(startIndex, endIndex);

    React.useEffect(() => {
        setFilters(prev => ({
            ...prev,
            kind: selectedKind
        }));
    }, [selectedKind]);

    React.useEffect(() => {
        setPage(1);
    }, [filters, debouncedSearch, selectedKind]);

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
            <Box sx={{ mb: 4 }}>
                <Box sx={{ mb: 2 }}>
                    <Typography variant="h4" component="h1" gutterBottom>
                        Asset Library
                    </Typography>
                    <Typography variant="body2" color="text.secondary">
                        Manage your objects and creatures for scenes
                    </Typography>
                </Box>

                <Tabs
                    value={selectedKind}
                    onChange={(_, newValue) => setSelectedKind(newValue)}
                    sx={{ mb: 2, borderBottom: 1, borderColor: 'divider' }}
                >
                    <Tab label="Objects" value={AssetKind.Object} />
                    <Tab label="Creatures" value={AssetKind.Creature} />
                </Tabs>

                <AssetSearchBar
                    value={searchQuery}
                    onChange={setSearchQuery}
                    fullWidth
                />
            </Box>

            <Grid container spacing={3}>
                <Grid size={{ xs: 12, md: 3 }}>
                    <AssetFilterPanel
                        filters={filters}
                        onFiltersChange={setFilters}
                    />
                </Grid>

                <Grid size={{ xs: 12, md: 9 }}>
                    {allAssets && !isLoading && (
                        <Typography variant="body2" color="text.secondary" sx={{ mb: 2 }}>
                            {totalAssets} {totalAssets === 1 ? 'asset' : 'assets'} found
                            {totalPages > 1 && ` (page ${page} of ${totalPages})`}
                        </Typography>
                    )}

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

            {!isLoading && !error && assets && (
                <>
                    <Grid container spacing={3}>
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
                                <CardContent sx={{ pb: 1 }}>
                                    <Typography variant="subtitle2" component="h2" noWrap fontWeight={600} color="primary">
                                        Add {selectedKind === AssetKind.Object ? 'Object' : 'Creature'}
                                    </Typography>
                                </CardContent>

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

                                <CardContent sx={{ pt: 1, pb: 1, flexGrow: 1 }}>
                                    <Box sx={{ minHeight: '24px' }} />
                                </CardContent>

                                <CardActions sx={{ pt: 0, px: 2, pb: 2 }}>
                                    <Typography variant="caption" color="text.secondary" sx={{ flexGrow: 1 }}>
                                        &nbsp;
                                    </Typography>
                                </CardActions>
                            </Card>
                        </Grid>

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
                                    <CardContent sx={{ pb: 1 }}>
                                        <Typography variant="subtitle2" component="h2" noWrap fontWeight={600}>
                                            {asset.name}
                                        </Typography>
                                    </CardContent>

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
                                                const portrait = getPortrait(asset);
                                                const defaultToken = getDefaultToken(asset);
                                                const imageId = portrait?.id || defaultToken?.tokenId || asset.tokens?.[0]?.tokenId;

                                                return imageId ? (
                                                    <img
                                                        src={getResourceUrl(imageId)}
                                                        alt={asset.name}
                                                        crossOrigin="use-credentials"
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

                                    <CardContent sx={{ pt: 1, pb: 1, flexGrow: 1 }}>
                                        <Box sx={{ display: 'flex', gap: 0.5, flexWrap: 'wrap', minHeight: '24px' }}>
                                            {asset.kind === AssetKind.Creature && (asset as CreatureAsset) && (
                                                <Chip
                                                    label={(asset as CreatureAsset).category}
                                                    size="small"
                                                    sx={{
                                                        bgcolor: getCreatureCategoryColor((asset as CreatureAsset).category),
                                                        color: 'white',
                                                        fontSize: '0.7rem'
                                                    }}
                                                />
                                            )}

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

                                    <CardActions sx={{ pt: 0, px: 2, pb: 2 }}>
                                        <Typography variant="caption" color="text.secondary" sx={{ flexGrow: 1 }}>
                                            {asset.size
                                                ? `${asset.size.width}×${asset.size.height} cells`
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

            {/* Asset Edit Dialog */}
            {selectedAsset && (
                <AssetEditDialog
                    key={selectedAsset.id}
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
                key={createDialogOpen ? 'create' : 'closed'}
                open={createDialogOpen}
                onClose={() => setCreateDialogOpen(false)}
                fixedKind={selectedKind}
            />
        </Container>
    );
};
