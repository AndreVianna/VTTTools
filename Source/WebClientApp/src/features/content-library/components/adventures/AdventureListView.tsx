import { useState, useEffect } from 'react';
import {
    Box,
    Typography,
    Button,
    TextField,
    InputAdornment,
    Grid,
    FormControl,
    InputLabel,
    Select,
    MenuItem,
    Dialog,
    DialogTitle,
    DialogContent,
    DialogContentText,
    DialogActions,
    Alert,
    Snackbar,
    CircularProgress
} from '@mui/material';
import AddIcon from '@mui/icons-material/Add';
import SearchIcon from '@mui/icons-material/Search';
import { useNavigate } from 'react-router-dom';
import { AdventureCard } from './AdventureCard';
import { AdventureStyle } from '../../types';
import type { Adventure } from '../../types';
import {
    useCreateAdventureMutation,
    useDeleteAdventureMutation,
    useCloneAdventureMutation,
    useCreateSceneMutation
} from '@/services/adventuresApi';
import { useGetContentQuery } from '@/services/contentApi';
import { useDebounce, useInfiniteScroll } from '../../hooks';

type ContentTypeFilter = 'all' | 'single-scene' | 'one-shot' | 'adventure' | 'campaign' | 'epic';

export function AdventureListView() {
    const navigate = useNavigate();
    const [searchInput, setSearchInput] = useState('');
    const searchQuery = useDebounce(searchInput, 500);
    const [contentTypeFilter, setContentTypeFilter] = useState<ContentTypeFilter>('all');
    const [styleFilter, setStyleFilter] = useState<AdventureStyle | 'all'>('all');
    const [publishedFilter, setPublishedFilter] = useState<'all' | 'published' | 'draft'>('all');
    const [ownershipFilter, setOwnershipFilter] = useState<'all' | 'mine' | 'public'>('all');
    const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
    const [adventureToDelete, setAdventureToDelete] = useState<string | null>(null);
    const [successMessage, setSuccessMessage] = useState<string | null>(null);
    const [errorMessage, setErrorMessage] = useState<string | null>(null);
    const [isCreating, setIsCreating] = useState(false);
    const [cursor, setCursor] = useState<string | undefined>(undefined);

    const filters = {
        contentType: ['campaign', 'epic'].includes(contentTypeFilter) ? contentTypeFilter : undefined,
        style: styleFilter === 'all' ? undefined : styleFilter,
        isOneShot: contentTypeFilter === 'one-shot' ? true : undefined,
        minSceneCount: contentTypeFilter === 'single-scene' ? 1
            : contentTypeFilter === 'adventure' ? 2
            : undefined,
        maxSceneCount: contentTypeFilter === 'single-scene' ? 1 : undefined,
        isPublished: publishedFilter === 'published' ? true
            : publishedFilter === 'draft' ? false
            : undefined,
        search: searchQuery || undefined,
        owner: ownershipFilter === 'all' ? undefined : ownershipFilter,
        after: cursor,
        limit: 20
    };

    const { data, isLoading, isFetching, error } = useGetContentQuery(filters);
    const adventures: Adventure[] = data?.data || [];
    const hasMore = data?.hasMore || false;
    const nextCursor = data?.nextCursor;

    const [createAdventure] = useCreateAdventureMutation();
    const [_createScene] = useCreateSceneMutation();
    const [deleteAdventure] = useDeleteAdventureMutation();
    const [cloneAdventure] = useCloneAdventureMutation();

    const { sentinelRef } = useInfiniteScroll({
        hasMore,
        isLoading: isFetching,
        onLoadMore: () => {
            if (nextCursor) {
                setCursor(nextCursor);
            }
        }
    });

    useEffect(() => {
        setCursor(undefined);
    }, [searchQuery, contentTypeFilter, styleFilter, publishedFilter, ownershipFilter]);

    const handleCreateAdventure = async () => {
        setIsCreating(true);
        try {
            const adventure = await createAdventure({
                name: 'Untitled Adventure',
                description: 'A new adventure',
                style: AdventureStyle.Generic,
                isOneShot: false
            }).unwrap();

            navigate(`/adventures/${adventure.id}`);
        } catch (_error) {
            setErrorMessage('Failed to create adventure. Please try again.');
        } finally {
            setIsCreating(false);
        }
    };

    const handleOpenAdventure = (adventureId: string) => {
        navigate(`/adventures/${adventureId}`);
    };

    const handleDuplicateAdventure = async (adventureId: string) => {
        try {
            await cloneAdventure({ id: adventureId }).unwrap();
            setSuccessMessage('Adventure duplicated successfully');
        } catch (error) {
            console.error('Failed to duplicate adventure:', error);
            setErrorMessage('Failed to duplicate adventure. Please try again.');
        }
    };

    const handleDeleteAdventure = (adventureId: string) => {
        setAdventureToDelete(adventureId);
        setDeleteDialogOpen(true);
    };

    const confirmDelete = async () => {
        if (adventureToDelete) {
            try {
                await deleteAdventure(adventureToDelete).unwrap();
                setSuccessMessage('Adventure deleted successfully');
            } catch (_error) {
                setErrorMessage('Failed to delete adventure. Please try again.');
            }
        }
        setDeleteDialogOpen(false);
        setAdventureToDelete(null);
    };

    const cancelDelete = () => {
        setDeleteDialogOpen(false);
        setAdventureToDelete(null);
    };

    return (
        <Box id="adventure-list-container">
            <Box id="adventure-list-header" sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 3 }}>
                <Typography id="title-adventure-list" variant="h5" component="h2">
                    Adventures
                </Typography>
                <Button
                    id="btn-create-adventure"
                    variant="contained"
                    startIcon={<AddIcon />}
                    onClick={handleCreateAdventure}
                    disabled={isCreating}
                    aria-label="Create new adventure"
                >
                    {isCreating ? 'Creating...' : 'New Adventure'}
                </Button>
            </Box>

            <Box id="adventure-list-filters" sx={{ display: 'flex', gap: 2, mb: 3, flexWrap: 'wrap' }}>
                <TextField
                    id="input-search-adventures"
                    placeholder="Search adventures..."
                    value={searchInput}
                    onChange={(e) => setSearchInput(e.target.value)}
                    size="small"
                    sx={{ flex: 1, minWidth: 200 }}
                    InputProps={{
                        startAdornment: (
                            <InputAdornment position="start">
                                <SearchIcon />
                            </InputAdornment>
                        )
                    }}
                />
                <FormControl size="small" sx={{ minWidth: 180 }}>
                    <InputLabel id="label-filter-type">Type</InputLabel>
                    <Select
                        id="select-filter-type"
                        labelId="label-filter-type"
                        value={contentTypeFilter}
                        label="Type"
                        onChange={(e) => setContentTypeFilter(e.target.value as ContentTypeFilter)}
                    >
                        <MenuItem value="all">All</MenuItem>
                        <MenuItem value="single-scene">Single Scene</MenuItem>
                        <MenuItem value="one-shot">One Shot</MenuItem>
                        <MenuItem value="adventure">Adventure</MenuItem>
                        <MenuItem value="campaign">Campaign</MenuItem>
                        <MenuItem value="epic">Epic</MenuItem>
                    </Select>
                </FormControl>
                <FormControl size="small" sx={{ minWidth: 180 }}>
                    <InputLabel id="label-filter-style">Style</InputLabel>
                    <Select
                        id="select-filter-style"
                        labelId="label-filter-style"
                        value={styleFilter}
                        label="Style"
                        onChange={(e) => setStyleFilter(e.target.value as AdventureStyle | 'all')}
                    >
                        <MenuItem value="all">All</MenuItem>
                        <MenuItem value={AdventureStyle.Generic}>Generic</MenuItem>
                        <MenuItem value={AdventureStyle.OpenWorld}>Open World</MenuItem>
                        <MenuItem value={AdventureStyle.DungeonCrawl}>Dungeon Crawl</MenuItem>
                        <MenuItem value={AdventureStyle.HackNSlash}>Hack-n-Slash</MenuItem>
                        <MenuItem value={AdventureStyle.Survival}>Survival</MenuItem>
                        <MenuItem value={AdventureStyle.GoalDriven}>Goal Driven</MenuItem>
                        <MenuItem value={AdventureStyle.RandomlyGenerated}>Randomly Generated</MenuItem>
                    </Select>
                </FormControl>
                <FormControl size="small" sx={{ minWidth: 150 }}>
                    <InputLabel id="label-filter-published">Status</InputLabel>
                    <Select
                        id="select-filter-published"
                        labelId="label-filter-published"
                        value={publishedFilter}
                        label="Status"
                        onChange={(e) => setPublishedFilter(e.target.value as 'all' | 'published' | 'draft')}
                    >
                        <MenuItem value="all">All</MenuItem>
                        <MenuItem value="published">Published</MenuItem>
                        <MenuItem value="draft">Draft</MenuItem>
                    </Select>
                </FormControl>
                <FormControl size="small" sx={{ minWidth: 150 }}>
                    <InputLabel id="label-filter-ownership">Ownership</InputLabel>
                    <Select
                        id="select-filter-ownership"
                        labelId="label-filter-ownership"
                        value={ownershipFilter}
                        label="Ownership"
                        onChange={(e) => setOwnershipFilter(e.target.value as 'all' | 'mine' | 'public')}
                    >
                        <MenuItem value="all">All</MenuItem>
                        <MenuItem value="mine">Mine</MenuItem>
                        <MenuItem value="public">Public</MenuItem>
                    </Select>
                </FormControl>
            </Box>

            {isLoading && (
                <Typography id="message-adventure-list-loading" variant="body1" color="text.secondary" sx={{ textAlign: 'center', py: 8 }}>
                    Loading adventures...
                </Typography>
            )}

            {!isLoading && adventures.length === 0 && searchInput === '' && (
                <Box id="adventure-list-empty-state" sx={{ textAlign: 'center', py: 8 }}>
                    <Typography variant="h6" gutterBottom>
                        No adventures yet
                    </Typography>
                    <Typography variant="body2" color="text.secondary" paragraph>
                        Create your first adventure to get started
                    </Typography>
                    <Button
                        variant="contained"
                        startIcon={<AddIcon />}
                        onClick={handleCreateAdventure}
                    >
                        Create Adventure
                    </Button>
                </Box>
            )}

            {!isLoading && adventures.length === 0 && searchInput !== '' && (
                <Box id="adventure-list-no-results" sx={{ textAlign: 'center', py: 8 }}>
                    <Typography variant="h6" gutterBottom>
                        No adventures found
                    </Typography>
                    <Typography variant="body2" color="text.secondary">
                        Try adjusting your search or filters
                    </Typography>
                </Box>
            )}

            {!isLoading && adventures.length > 0 && (
                <Grid id="adventure-list-grid" container spacing={3}>
                    {adventures.map((adventure) => (
                        <Grid size={{ xs: 12, sm: 6, md: 4, lg: 3 }} key={adventure.id}>
                            <AdventureCard
                                adventure={adventure}
                                onOpen={handleOpenAdventure}
                                onDuplicate={handleDuplicateAdventure}
                                onDelete={handleDeleteAdventure}
                            />
                        </Grid>
                    ))}
                </Grid>
            )}

            {isFetching && cursor && (
                <Box sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center', gap: 2, py: 4 }}>
                    <CircularProgress size={24} />
                    <Typography>Loading more...</Typography>
                </Box>
            )}

            {hasMore && !isFetching && (
                <div ref={sentinelRef} style={{ height: 1 }} />
            )}

            {!hasMore && adventures.length > 0 && (
                <Typography sx={{ textAlign: 'center', py: 4, color: 'text.secondary' }}>
                    All adventures loaded
                </Typography>
            )}

            <Dialog
                open={deleteDialogOpen}
                onClose={cancelDelete}
                aria-labelledby="dialog-title-delete-adventure"
            >
                <DialogTitle id="dialog-title-delete-adventure">
                    Delete Adventure
                </DialogTitle>
                <DialogContent>
                    <DialogContentText>
                        Are you sure you want to delete this adventure? This will also delete all scenes within it. This action cannot be undone.
                    </DialogContentText>
                </DialogContent>
                <DialogActions>
                    <Button id="btn-cancel-delete" onClick={cancelDelete}>
                        Cancel
                    </Button>
                    <Button id="btn-confirm-delete" onClick={confirmDelete} color="error" variant="contained">
                        Delete
                    </Button>
                </DialogActions>
            </Dialog>

            <Snackbar
                open={!!successMessage}
                autoHideDuration={3000}
                onClose={() => setSuccessMessage(null)}
                anchorOrigin={{ vertical: 'bottom', horizontal: 'center' }}
            >
                <Alert onClose={() => setSuccessMessage(null)} severity="success">
                    {successMessage}
                </Alert>
            </Snackbar>

            <Snackbar
                open={!!errorMessage}
                autoHideDuration={6000}
                onClose={() => setErrorMessage(null)}
                anchorOrigin={{ vertical: 'bottom', horizontal: 'center' }}
            >
                <Alert onClose={() => setErrorMessage(null)} severity="error">
                    {errorMessage}
                </Alert>
            </Snackbar>

            {error && (
                <Alert severity="error" sx={{ mt: 2 }}>
                    Failed to load adventures. Please try again.
                </Alert>
            )}
        </Box>
    );
}
