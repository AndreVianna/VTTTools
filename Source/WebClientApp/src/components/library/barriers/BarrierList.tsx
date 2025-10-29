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
import { Add, Edit, Delete, Lock, LockOpen, Visibility, VisibilityOff } from '@mui/icons-material';
import { useGetBarriersQuery, useDeleteBarrierMutation } from '@/services/barrierApi';
import { BarrierEditor } from './BarrierEditor';
import type { Barrier } from '@/types/domain';

export interface BarrierListProps {
    onSelect?: (barrier: Barrier) => void;
}

export const BarrierList: React.FC<BarrierListProps> = ({ onSelect }) => {
    const theme = useTheme();
    const [search, setSearch] = useState('');
    const [editorOpen, setEditorOpen] = useState(false);
    const [editingBarrier, setEditingBarrier] = useState<Barrier | null>(null);

    const { data: barriers, isLoading, error } = useGetBarriersQuery({ page: 1, pageSize: 100 });
    const [deleteBarrier, { isLoading: isDeleting }] = useDeleteBarrierMutation();

    const filteredBarriers = barriers?.filter(b =>
        b.name.toLowerCase().includes(search.toLowerCase())
    ) ?? [];

    const handleEdit = (barrier: Barrier) => {
        setEditingBarrier(barrier);
        setEditorOpen(true);
    };

    const handleDelete = async (id: string, name: string) => {
        if (confirm(`Delete barrier "${name}"?`)) {
            try {
                await deleteBarrier(id).unwrap();
            } catch (err) {
                console.error('Failed to delete barrier:', err);
            }
        }
    };

    const handleCreate = () => {
        setEditingBarrier(null);
        setEditorOpen(true);
    };

    const handleCloseEditor = () => {
        setEditorOpen(false);
        setEditingBarrier(null);
    };

    return (
        <Box sx={{ p: 2 }}>
            {onSelect && (
                <Chip
                    label="Selection Mode - Click to select a barrier"
                    color="primary"
                    size="small"
                    sx={{ mb: 2 }}
                />
            )}
            <Box sx={{ display: 'flex', gap: 2, mb: 2 }}>
                <TextField
                    placeholder="Search barriers..."
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
                    Failed to load barriers
                </Alert>
            )}

            {!isLoading && !error && filteredBarriers.length === 0 && (
                <Box sx={{ textAlign: 'center', p: 4 }}>
                    <Typography variant="body2" color="text.secondary">
                        {search ? 'No barriers match your search' : 'No barriers created yet'}
                    </Typography>
                </Box>
            )}

            {!isLoading && !error && filteredBarriers.length > 0 && (
                <List sx={{ bgcolor: theme.palette.background.paper, borderRadius: 1 }}>
                    {filteredBarriers.map((barrier) => (
                        <ListItem
                            key={barrier.id}
                            onClick={onSelect ? () => onSelect(barrier) : undefined}
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
                                primary={barrier.name}
                                secondary={
                                    <Box component="span">
                                        {barrier.description && (
                                            <Typography
                                                variant="body2"
                                                color="text.secondary"
                                                sx={{ mb: 0.5 }}
                                            >
                                                {barrier.description}
                                            </Typography>
                                        )}
                                        <Stack direction="row" spacing={0.5} sx={{ mt: 0.5 }}>
                                            {barrier.isOpaque && (
                                                <Chip
                                                    icon={<VisibilityOff />}
                                                    label="Opaque"
                                                    size="small"
                                                    variant="outlined"
                                                />
                                            )}
                                            {barrier.isSolid && (
                                                <Chip
                                                    label="Solid"
                                                    size="small"
                                                    variant="outlined"
                                                />
                                            )}
                                            {barrier.isOpenable && (
                                                <Chip
                                                    icon={barrier.isLocked ? <Lock /> : <LockOpen />}
                                                    label={barrier.isLocked ? 'Locked Door' : 'Door'}
                                                    size="small"
                                                    variant="outlined"
                                                    color="primary"
                                                />
                                            )}
                                            {barrier.isSecret && (
                                                <Chip
                                                    icon={<Visibility />}
                                                    label="Secret"
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
                                        onClick={() => handleEdit(barrier)}
                                        sx={{ mr: 1 }}
                                    >
                                        <Edit />
                                    </IconButton>
                                    <IconButton
                                        edge="end"
                                        onClick={() => handleDelete(barrier.id, barrier.name)}
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

            <BarrierEditor
                open={editorOpen}
                barrier={editingBarrier}
                onClose={handleCloseEditor}
            />
        </Box>
    );
};
