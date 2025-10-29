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
import { Add, Edit, Delete } from '@mui/icons-material';
import { useGetRegionsQuery, useDeleteRegionMutation } from '@/services/regionApi';
import { RegionEditor } from './RegionEditor';
import type { Region } from '@/types/domain';

export interface RegionListProps {
    onSelect?: (region: Region) => void;
}

export const RegionList: React.FC<RegionListProps> = ({ onSelect }) => {
    const theme = useTheme();
    const [search, setSearch] = useState('');
    const [editorOpen, setEditorOpen] = useState(false);
    const [editingRegion, setEditingRegion] = useState<Region | null>(null);

    const { data: regions, isLoading, error } = useGetRegionsQuery({ page: 1, pageSize: 100 });
    const [deleteRegion, { isLoading: isDeleting }] = useDeleteRegionMutation();

    const filteredRegions = regions?.filter(r =>
        r.name.toLowerCase().includes(search.toLowerCase()) ||
        r.regionType.toLowerCase().includes(search.toLowerCase())
    ) ?? [];

    const handleEdit = (region: Region) => {
        setEditingRegion(region);
        setEditorOpen(true);
    };

    const handleDelete = async (id: string, name: string) => {
        if (confirm(`Delete region "${name}"?`)) {
            try {
                await deleteRegion(id).unwrap();
            } catch (err) {
                console.error('Failed to delete region:', err);
            }
        }
    };

    const handleCreate = () => {
        setEditingRegion(null);
        setEditorOpen(true);
    };

    const handleCloseEditor = () => {
        setEditorOpen(false);
        setEditingRegion(null);
    };

    return (
        <Box sx={{ p: 2 }}>
            <Box sx={{ display: 'flex', gap: 2, mb: 2 }}>
                <TextField
                    placeholder="Search regions..."
                    value={search}
                    onChange={(e) => setSearch(e.target.value)}
                    size="small"
                    fullWidth
                    sx={{
                        bgcolor: theme.palette.background.paper
                    }}
                />
                <Button
                    variant="contained"
                    startIcon={<Add />}
                    onClick={handleCreate}
                    sx={{ minWidth: 120 }}
                >
                    Create
                </Button>
            </Box>

            {isLoading && (
                <Box sx={{ display: 'flex', justifyContent: 'center', p: 4 }}>
                    <CircularProgress />
                </Box>
            )}

            {error && (
                <Alert severity="error" sx={{ mb: 2 }}>
                    Failed to load regions
                </Alert>
            )}

            {!isLoading && !error && filteredRegions.length === 0 && (
                <Box sx={{ textAlign: 'center', p: 4 }}>
                    <Typography variant="body2" color="text.secondary">
                        {search ? 'No regions match your search' : 'No regions created yet'}
                    </Typography>
                </Box>
            )}

            {!isLoading && !error && filteredRegions.length > 0 && (
                <List sx={{ bgcolor: theme.palette.background.paper, borderRadius: 1 }}>
                    {filteredRegions.map((region) => {
                        const labelCount = Object.keys(region.labelMap).length;
                        return (
                            <ListItem
                                key={region.id}
                                onClick={onSelect ? () => onSelect(region) : undefined}
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
                                    primary={region.name}
                                    secondary={
                                        <Box component="span">
                                            {region.description && (
                                                <Typography
                                                    variant="body2"
                                                    color="text.secondary"
                                                    sx={{ mb: 0.5 }}
                                                >
                                                    {region.description}
                                                </Typography>
                                            )}
                                            <Stack direction="row" spacing={0.5} sx={{ mt: 0.5 }}>
                                                <Chip
                                                    label={region.regionType}
                                                    size="small"
                                                    color="primary"
                                                    variant="outlined"
                                                />
                                                {labelCount > 0 && (
                                                    <Chip
                                                        label={`${labelCount} label${labelCount !== 1 ? 's' : ''}`}
                                                        size="small"
                                                        variant="outlined"
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
                                            onClick={() => handleEdit(region)}
                                            sx={{ mr: 1 }}
                                        >
                                            <Edit />
                                        </IconButton>
                                        <IconButton
                                            edge="end"
                                            onClick={() => handleDelete(region.id, region.name)}
                                            disabled={isDeleting}
                                        >
                                            <Delete />
                                        </IconButton>
                                    </ListItemSecondaryAction>
                                )}
                            </ListItem>
                        );
                    })}
                </List>
            )}

            <RegionEditor
                open={editorOpen}
                region={editingRegion}
                onClose={handleCloseEditor}
            />
        </Box>
    );
};
