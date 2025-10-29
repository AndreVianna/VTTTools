import React, { useState } from 'react';
import {
    Box,
    List,
    ListItem,
    ListItemText,
    ListItemSecondaryAction,
    IconButton,
    TextField,
    Button,
    Typography,
    CircularProgress,
    Alert,
    useTheme,
    Chip,
    Stack
} from '@mui/material';
import { Add, Edit, Delete, Gradient } from '@mui/icons-material';
import { useGetSourcesQuery, useDeleteSourceMutation } from '@/services/sourceApi';
import { SourceEditor } from './SourceEditor';
import type { Source } from '@/types/domain';

export interface SourceListProps {
    onSelect?: (source: Source) => void;
}

export const SourceList: React.FC<SourceListProps> = ({ onSelect }) => {
    const theme = useTheme();
    const [search, setSearch] = useState('');
    const [editorOpen, setEditorOpen] = useState(false);
    const [editingSource, setEditingSource] = useState<Source | null>(null);

    const { data: sources, isLoading, error } = useGetSourcesQuery({ page: 1, pageSize: 100 });
    const [deleteSource, { isLoading: isDeleting }] = useDeleteSourceMutation();

    const filteredSources = sources?.filter(s =>
        s.name.toLowerCase().includes(search.toLowerCase()) ||
        s.sourceType.toLowerCase().includes(search.toLowerCase())
    ) ?? [];

    const handleEdit = (source: Source) => {
        setEditingSource(source);
        setEditorOpen(true);
    };

    const handleDelete = async (id: string, name: string) => {
        if (confirm(`Delete source "${name}"?`)) {
            try {
                await deleteSource(id).unwrap();
            } catch (err) {
                console.error('Failed to delete source:', err);
            }
        }
    };

    const handleCreate = () => {
        setEditingSource(null);
        setEditorOpen(true);
    };

    const handleCloseEditor = () => {
        setEditorOpen(false);
        setEditingSource(null);
    };

    return (
        <Box sx={{ p: 2 }}>
            {onSelect && (
                <Chip
                    label="Selection Mode - Click to select a source"
                    color="primary"
                    size="small"
                    sx={{ mb: 2 }}
                />
            )}
            <Box sx={{ display: 'flex', gap: 2, mb: 2 }}>
                <TextField
                    placeholder="Search sources..."
                    value={search}
                    onChange={(e) => setSearch(e.target.value)}
                    size="small"
                    fullWidth
                    sx={{
                        bgcolor: theme.palette.background.paper
                    }}
                />
                {!onSelect && (
                    <Button
                        variant="contained"
                        startIcon={<Add />}
                        onClick={handleCreate}
                        sx={{ minWidth: 120 }}
                    >
                        Create
                    </Button>
                )}
            </Box>

            {isLoading && (
                <Box sx={{ display: 'flex', justifyContent: 'center', p: 4 }}>
                    <CircularProgress />
                </Box>
            )}

            {error && (
                <Alert severity="error" sx={{ mb: 2 }}>
                    Failed to load sources
                </Alert>
            )}

            {!isLoading && !error && filteredSources.length === 0 && (
                <Box sx={{ textAlign: 'center', p: 4 }}>
                    <Typography variant="body2" color="text.secondary">
                        {search ? 'No sources match your search' : 'No sources created yet'}
                    </Typography>
                </Box>
            )}

            {!isLoading && !error && filteredSources.length > 0 && (
                <List sx={{ bgcolor: theme.palette.background.paper, borderRadius: 1 }}>
                    {filteredSources.map((source) => (
                        <ListItem
                            key={source.id}
                            onClick={onSelect ? () => onSelect(source) : undefined}
                            sx={{
                                borderBottom: 1,
                                borderColor: 'divider',
                                '&:last-child': { borderBottom: 0 },
                                cursor: onSelect ? 'pointer' : 'default',
                                '&:hover': onSelect ? {
                                    bgcolor: theme.palette.action.hover
                                } : {}
                            }}
                        >
                            <ListItemText
                                primary={source.name}
                                secondary={
                                    <Box component="span">
                                        {source.description && (
                                            <Typography
                                                variant="body2"
                                                color="text.secondary"
                                                sx={{ mb: 0.5 }}
                                            >
                                                {source.description}
                                            </Typography>
                                        )}
                                        <Stack direction="row" spacing={0.5} sx={{ mt: 0.5 }}>
                                            <Chip
                                                label={source.sourceType}
                                                size="small"
                                                color="primary"
                                                variant="outlined"
                                            />
                                            <Chip
                                                label={`Range: ${source.defaultRange}`}
                                                size="small"
                                                variant="outlined"
                                            />
                                            <Chip
                                                label={`Intensity: ${(source.defaultIntensity * 100).toFixed(0)}%`}
                                                size="small"
                                                variant="outlined"
                                            />
                                            {source.defaultIsGradient && (
                                                <Chip
                                                    icon={<Gradient />}
                                                    label="Gradient"
                                                    size="small"
                                                    variant="outlined"
                                                    color="secondary"
                                                />
                                            )}
                                        </Stack>
                                    </Box>
                                }
                            />
                            {!onSelect && (
                                <ListItemSecondaryAction>
                                    <IconButton
                                        edge="end"
                                        onClick={() => handleEdit(source)}
                                        sx={{ mr: 1 }}
                                    >
                                        <Edit />
                                    </IconButton>
                                    <IconButton
                                        edge="end"
                                        onClick={() => handleDelete(source.id, source.name)}
                                        disabled={isDeleting}
                                    >
                                        <Delete />
                                    </IconButton>
                                </ListItemSecondaryAction>
                            )}
                        </ListItem>
                    ))}
                </List>
            )}

            <SourceEditor
                open={editorOpen}
                source={editingSource}
                onClose={handleCloseEditor}
            />
        </Box>
    );
};
