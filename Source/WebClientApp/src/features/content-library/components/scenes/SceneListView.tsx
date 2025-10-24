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
    DialogActions
} from '@mui/material';
import AddIcon from '@mui/icons-material/Add';
import SearchIcon from '@mui/icons-material/Search';
import { useNavigate } from 'react-router-dom';
import { SceneCard } from './SceneCard';
import { GridType } from '@/utils/gridCalculator';
import type { Scene } from '../../types';

export function SceneListView() {
    const navigate = useNavigate();
    const [searchQuery, setSearchQuery] = useState('');
    const [gridFilter, setGridFilter] = useState<GridType | 'all'>('all');
    const [publishedFilter, setPublishedFilter] = useState<'all' | 'published' | 'draft'>('all');
    const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
    const [sceneToDelete, setSceneToDelete] = useState<string | null>(null);

    const scenes: Scene[] = [];
    const isLoading = false;

    const handleCreateScene = () => {
        navigate('/scene-editor');
    };

    const handleOpenScene = (sceneId: string) => {
        navigate(`/scene-editor/${sceneId}`);
    };

    const handleDuplicateScene = (sceneId: string) => {
        console.log('Duplicate scene:', sceneId);
    };

    const handleDeleteScene = (sceneId: string) => {
        setSceneToDelete(sceneId);
        setDeleteDialogOpen(true);
    };

    const confirmDelete = () => {
        if (sceneToDelete) {
            console.log('Delete scene:', sceneToDelete);
        }
        setDeleteDialogOpen(false);
        setSceneToDelete(null);
    };

    const cancelDelete = () => {
        setDeleteDialogOpen(false);
        setSceneToDelete(null);
    };

    const filteredScenes = scenes.filter((scene) => {
        const matchesSearch = scene.name.toLowerCase().includes(searchQuery.toLowerCase());
        const matchesGrid = gridFilter === 'all' || scene.grid.type === gridFilter;
        const matchesPublished =
            publishedFilter === 'all' ||
            (publishedFilter === 'published' && scene.isPublished) ||
            (publishedFilter === 'draft' && !scene.isPublished);

        return matchesSearch && matchesGrid && matchesPublished;
    });

    return (
        <Box id="scene-list-container">
            <Box id="scene-list-header" sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 3 }}>
                <Typography id="title-scene-list" variant="h5" component="h2">
                    Scenes
                </Typography>
                <Button
                    id="btn-create-scene"
                    variant="contained"
                    startIcon={<AddIcon />}
                    onClick={handleCreateScene}
                    aria-label="Create new scene"
                >
                    New Scene
                </Button>
            </Box>

            <Box id="scene-list-filters" sx={{ display: 'flex', gap: 2, mb: 3 }}>
                <TextField
                    id="input-search-scenes"
                    placeholder="Search scenes..."
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    size="small"
                    sx={{ flex: 1 }}
                    InputProps={{
                        startAdornment: (
                            <InputAdornment position="start">
                                <SearchIcon />
                            </InputAdornment>
                        )
                    }}
                />
                <FormControl size="small" sx={{ minWidth: 150 }}>
                    <InputLabel id="label-filter-grid">Grid Type</InputLabel>
                    <Select
                        id="select-filter-grid"
                        labelId="label-filter-grid"
                        value={gridFilter}
                        label="Grid Type"
                        onChange={(e) => setGridFilter(e.target.value as GridType | 'all')}
                    >
                        <MenuItem value="all">All Grids</MenuItem>
                        <MenuItem value={GridType.Square}>Square</MenuItem>
                        <MenuItem value={GridType.HexH}>Hex-H</MenuItem>
                        <MenuItem value={GridType.HexV}>Hex-V</MenuItem>
                        <MenuItem value={GridType.Isometric}>Isometric</MenuItem>
                        <MenuItem value={GridType.NoGrid}>No Grid</MenuItem>
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
            </Box>

            {isLoading && (
                <Typography id="message-scene-list-loading" variant="body1" color="text.secondary" sx={{ textAlign: 'center', py: 8 }}>
                    Loading scenes...
                </Typography>
            )}

            {!isLoading && filteredScenes.length === 0 && searchQuery === '' && (
                <Box id="scene-list-empty-state" sx={{ textAlign: 'center', py: 8 }}>
                    <Typography variant="h6" gutterBottom>
                        No scenes yet
                    </Typography>
                    <Typography variant="body2" color="text.secondary" paragraph>
                        Create your first scene to get started
                    </Typography>
                    <Button
                        variant="contained"
                        startIcon={<AddIcon />}
                        onClick={handleCreateScene}
                    >
                        Create Scene
                    </Button>
                </Box>
            )}

            {!isLoading && filteredScenes.length === 0 && searchQuery !== '' && (
                <Box id="scene-list-no-results" sx={{ textAlign: 'center', py: 8 }}>
                    <Typography variant="h6" gutterBottom>
                        No scenes found
                    </Typography>
                    <Typography variant="body2" color="text.secondary">
                        Try adjusting your search or filters
                    </Typography>
                </Box>
            )}

            {!isLoading && filteredScenes.length > 0 && (
                <Grid id="scene-list-grid" container spacing={3}>
                    {filteredScenes.map((scene) => (
                        <Grid item xs={12} sm={6} md={4} lg={3} key={scene.id}>
                            <SceneCard
                                scene={scene}
                                onOpen={handleOpenScene}
                                onDuplicate={handleDuplicateScene}
                                onDelete={handleDeleteScene}
                            />
                        </Grid>
                    ))}
                </Grid>
            )}

            <Dialog
                open={deleteDialogOpen}
                onClose={cancelDelete}
                aria-labelledby="dialog-title-delete-scene"
            >
                <DialogTitle id="dialog-title-delete-scene">
                    Delete Scene
                </DialogTitle>
                <DialogContent>
                    <DialogContentText>
                        Are you sure you want to delete this scene? This action cannot be undone.
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
        </Box>
    );
}
