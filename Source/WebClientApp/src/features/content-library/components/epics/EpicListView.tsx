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
import { EpicCard } from './EpicCard';
import {
    useGetEpicsQuery,
    useCreateEpicMutation,
    useDeleteEpicMutation,
    useCloneEpicMutation
} from '@/services/epicsApi';
import { useDebounce } from '../../hooks';

const DEFAULT_EPIC_NAME = 'Untitled Epic';
const DEFAULT_EPIC_DESCRIPTION = 'A new epic.';

export function EpicListView() {
    const navigate = useNavigate();
    const [searchInput, setSearchInput] = useState('');
    const searchQuery = useDebounce(searchInput, 500);
    const [publishedFilter, setPublishedFilter] = useState<'all' | 'published' | 'draft'>('all');
    const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
    const [epicToDelete, setEpicToDelete] = useState<string | null>(null);
    const [successMessage, setSuccessMessage] = useState<string | null>(null);
    const [errorMessage, setErrorMessage] = useState<string | null>(null);
    const [isCreating, setIsCreating] = useState(false);

    const { data: epics = [], isLoading, error } = useGetEpicsQuery();
    const [createEpic] = useCreateEpicMutation();
    const [deleteEpic] = useDeleteEpicMutation();
    const [cloneEpic] = useCloneEpicMutation();

    const filteredEpics = epics.filter((epic) => {
        if (searchQuery && !epic.name.toLowerCase().includes(searchQuery.toLowerCase())) {
            return false;
        }
        if (publishedFilter === 'published' && !epic.isPublished) {
            return false;
        }
        if (publishedFilter === 'draft' && epic.isPublished) {
            return false;
        }
        return true;
    });

    const handleCreateEpic = async () => {
        setIsCreating(true);
        try {
            const epic = await createEpic({
                name: DEFAULT_EPIC_NAME,
                description: DEFAULT_EPIC_DESCRIPTION
            }).unwrap();

            navigate(`/epics/${epic.id}`);
        } catch (error) {
            console.error('Failed to create epic:', error);
            setErrorMessage('Failed to create epic. Please try again.');
        } finally {
            setIsCreating(false);
        }
    };

    const handleOpenEpic = (epicId: string) => {
        navigate(`/epics/${epicId}`);
    };

    const handleDuplicateEpic = async (epicId: string) => {
        try {
            await cloneEpic({ id: epicId }).unwrap();
            setSuccessMessage('Epic duplicated successfully');
        } catch (error) {
            console.error('Failed to duplicate epic:', error);
            setErrorMessage('Failed to duplicate epic. Please try again.');
        }
    };

    const handleDeleteEpic = (epicId: string) => {
        setEpicToDelete(epicId);
        setDeleteDialogOpen(true);
    };

    const confirmDelete = async () => {
        if (epicToDelete) {
            try {
                await deleteEpic(epicToDelete).unwrap();
                setSuccessMessage('Epic deleted successfully');
            } catch (error) {
                console.error('Failed to delete epic:', error);
                setErrorMessage('Failed to delete epic. Please try again.');
            }
        }
        setDeleteDialogOpen(false);
        setEpicToDelete(null);
    };

    const cancelDelete = () => {
        setDeleteDialogOpen(false);
        setEpicToDelete(null);
    };

    return (
        <Box id="epic-list-container">
            <Box id="epic-list-header" sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 3 }}>
                <Typography id="title-epic-list" variant="h5" component="h2">
                    Epics
                </Typography>
                <Button
                    id="btn-create-epic"
                    variant="contained"
                    startIcon={<AddIcon />}
                    onClick={handleCreateEpic}
                    disabled={isCreating}
                    aria-label="Create new epic"
                >
                    {isCreating ? 'Creating...' : 'New Epic'}
                </Button>
            </Box>

            <Box id="epic-list-filters" sx={{ display: 'flex', gap: 2, mb: 3, flexWrap: 'wrap' }}>
                <TextField
                    id="input-search-epics"
                    placeholder="Search epics..."
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
                <Typography id="message-epic-list-loading" variant="body1" color="text.secondary" sx={{ textAlign: 'center', py: 8 }}>
                    Loading epics...
                </Typography>
            )}

            {!isLoading && filteredEpics.length === 0 && searchInput === '' && (
                <Box id="epic-list-empty-state" sx={{ textAlign: 'center', py: 8 }}>
                    <Typography variant="h6" gutterBottom>
                        No epics yet
                    </Typography>
                    <Typography variant="body2" color="text.secondary" paragraph>
                        Create your first epic to get started
                    </Typography>
                    <Button
                        variant="contained"
                        startIcon={<AddIcon />}
                        onClick={handleCreateEpic}
                    >
                        Create Epic
                    </Button>
                </Box>
            )}

            {!isLoading && filteredEpics.length === 0 && searchInput !== '' && (
                <Box id="epic-list-no-results" sx={{ textAlign: 'center', py: 8 }}>
                    <Typography variant="h6" gutterBottom>
                        No epics found
                    </Typography>
                    <Typography variant="body2" color="text.secondary">
                        Try adjusting your search or filters
                    </Typography>
                </Box>
            )}

            {!isLoading && filteredEpics.length > 0 && (
                <Grid id="epic-list-grid" container spacing={3}>
                    {filteredEpics.map((epic) => (
                        <Grid size={{ xs: 12, sm: 6, md: 4, lg: 3 }} key={epic.id}>
                            <EpicCard
                                epic={epic}
                                onOpen={handleOpenEpic}
                                onDuplicate={handleDuplicateEpic}
                                onDelete={handleDeleteEpic}
                            />
                        </Grid>
                    ))}
                </Grid>
            )}

            <Dialog
                open={deleteDialogOpen}
                onClose={cancelDelete}
                aria-labelledby="dialog-title-delete-epic"
            >
                <DialogTitle id="dialog-title-delete-epic">
                    Delete Epic
                </DialogTitle>
                <DialogContent>
                    <DialogContentText>
                        Are you sure you want to delete this epic? This will also delete all campaigns and adventures within it. This action cannot be undone.
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
                    Failed to load epics. Please try again.
                </Alert>
            )}
        </Box>
    );
}
