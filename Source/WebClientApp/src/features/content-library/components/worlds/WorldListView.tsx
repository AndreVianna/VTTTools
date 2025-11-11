import { useState } from 'react';
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
    Snackbar
} from '@mui/material';
import AddIcon from '@mui/icons-material/Add';
import SearchIcon from '@mui/icons-material/Search';
import { useNavigate } from 'react-router-dom';
import { WorldCard } from './WorldCard';
import {
    useGetWorldsQuery,
    useCreateWorldMutation,
    useDeleteWorldMutation,
    useCloneWorldMutation
} from '@/services/worldsApi';
import { useDebounce } from '../../hooks';

const DEFAULT_WORLD_NAME = 'Untitled World';
const DEFAULT_WORLD_DESCRIPTION = 'A new world.';

export function WorldListView() {
    const navigate = useNavigate();
    const [searchInput, setSearchInput] = useState('');
    const searchQuery = useDebounce(searchInput, 500);
    const [publishedFilter, setPublishedFilter] = useState<'all' | 'published' | 'draft'>('all');
    const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
    const [worldToDelete, setWorldToDelete] = useState<string | null>(null);
    const [successMessage, setSuccessMessage] = useState<string | null>(null);
    const [errorMessage, setErrorMessage] = useState<string | null>(null);
    const [isCreating, setIsCreating] = useState(false);

    const { data: worlds = [], isLoading, error } = useGetWorldsQuery();
    const [createWorld] = useCreateWorldMutation();
    const [deleteWorld] = useDeleteWorldMutation();
    const [cloneWorld] = useCloneWorldMutation();

    const filteredWorlds = worlds.filter((world) => {
        if (searchQuery && !world.name.toLowerCase().includes(searchQuery.toLowerCase())) {
            return false;
        }
        if (publishedFilter === 'published' && !world.isPublished) {
            return false;
        }
        if (publishedFilter === 'draft' && world.isPublished) {
            return false;
        }
        return true;
    });

    const handleCreateWorld = async () => {
        setIsCreating(true);
        try {
            const world = await createWorld({
                name: DEFAULT_WORLD_NAME,
                description: DEFAULT_WORLD_DESCRIPTION
            }).unwrap();

            navigate(`/worlds/${world.id}`);
        } catch (error) {
            console.error('Failed to create world:', error);
            setErrorMessage('Failed to create world. Please try again.');
        } finally {
            setIsCreating(false);
        }
    };

    const handleOpenWorld = (worldId: string) => {
        navigate(`/worlds/${worldId}`);
    };

    const handleDuplicateWorld = async (worldId: string) => {
        try {
            await cloneWorld({ id: worldId }).unwrap();
            setSuccessMessage('World duplicated successfully');
        } catch (error) {
            console.error('Failed to duplicate world:', error);
            setErrorMessage('Failed to duplicate world. Please try again.');
        }
    };

    const handleDeleteWorld = (worldId: string) => {
        setWorldToDelete(worldId);
        setDeleteDialogOpen(true);
    };

    const confirmDelete = async () => {
        if (worldToDelete) {
            try {
                await deleteWorld(worldToDelete).unwrap();
                setSuccessMessage('World deleted successfully');
            } catch (error) {
                console.error('Failed to delete world:', error);
                setErrorMessage('Failed to delete world. Please try again.');
            }
        }
        setDeleteDialogOpen(false);
        setWorldToDelete(null);
    };

    const cancelDelete = () => {
        setDeleteDialogOpen(false);
        setWorldToDelete(null);
    };

    return (
        <Box id="world-list-container">
            <Box id="world-list-header" sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 3 }}>
                <Typography id="title-world-list" variant="h5" component="h2">
                    Worlds
                </Typography>
                <Button
                    id="btn-create-world"
                    variant="contained"
                    startIcon={<AddIcon />}
                    onClick={handleCreateWorld}
                    disabled={isCreating}
                    aria-label="Create new world"
                >
                    {isCreating ? 'Creating...' : 'New World'}
                </Button>
            </Box>

            <Box id="world-list-filters" sx={{ display: 'flex', gap: 2, mb: 3, flexWrap: 'wrap' }}>
                <TextField
                    id="input-search-worlds"
                    placeholder="Search worlds..."
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
            </Box>

            {isLoading && (
                <Typography id="message-world-list-loading" variant="body1" color="text.secondary" sx={{ textAlign: 'center', py: 8 }}>
                    Loading worlds...
                </Typography>
            )}

            {!isLoading && filteredWorlds.length === 0 && searchInput === '' && (
                <Box id="world-list-empty-state" sx={{ textAlign: 'center', py: 8 }}>
                    <Typography variant="h6" gutterBottom>
                        No worlds yet
                    </Typography>
                    <Typography variant="body2" color="text.secondary" paragraph>
                        Create your first world to get started
                    </Typography>
                    <Button
                        variant="contained"
                        startIcon={<AddIcon />}
                        onClick={handleCreateWorld}
                    >
                        Create World
                    </Button>
                </Box>
            )}

            {!isLoading && filteredWorlds.length === 0 && searchInput !== '' && (
                <Box id="world-list-no-results" sx={{ textAlign: 'center', py: 8 }}>
                    <Typography variant="h6" gutterBottom>
                        No worlds found
                    </Typography>
                    <Typography variant="body2" color="text.secondary">
                        Try adjusting your search or filters
                    </Typography>
                </Box>
            )}

            {!isLoading && filteredWorlds.length > 0 && (
                <Grid id="world-list-grid" container spacing={3}>
                    {filteredWorlds.map((world) => (
                        <Grid size={{ xs: 12, sm: 6, md: 4, lg: 3 }} key={world.id}>
                            <WorldCard
                                world={world}
                                onOpen={handleOpenWorld}
                                onDuplicate={handleDuplicateWorld}
                                onDelete={handleDeleteWorld}
                            />
                        </Grid>
                    ))}
                </Grid>
            )}

            <Dialog
                open={deleteDialogOpen}
                onClose={cancelDelete}
                aria-labelledby="dialog-title-delete-world"
            >
                <DialogTitle id="dialog-title-delete-world">
                    Delete World
                </DialogTitle>
                <DialogContent>
                    <DialogContentText>
                        Are you sure you want to delete this world? This will also delete all campaigns and adventures within it. This action cannot be undone.
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
                    Failed to load worlds. Please try again.
                </Alert>
            )}
        </Box>
    );
}
