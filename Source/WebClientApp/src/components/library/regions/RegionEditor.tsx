import React, { useState, useEffect } from 'react';
import {
    Dialog,
    DialogTitle,
    DialogContent,
    DialogActions,
    Button,
    TextField,
    Box,
    Typography,
    Divider,
    CircularProgress,
    useTheme,
    Alert,
    IconButton,
    Paper,
    Stack
} from '@mui/material';
import { Save, Cancel, Add, Delete } from '@mui/icons-material';
import { useCreateRegionMutation, useUpdateRegionMutation } from '@/services/regionApi';
import type { Region, CreateRegionRequest, UpdateRegionRequest } from '@/types/domain';

interface RegionEditorProps {
    open: boolean;
    region: Region | null;
    onClose: () => void;
}

export const RegionEditor: React.FC<RegionEditorProps> = ({ open, region, onClose }) => {
    const theme = useTheme();
    const [name, setName] = useState('');
    const [description, setDescription] = useState('');
    const [regionType, setRegionType] = useState('');
    const [labelMap, setLabelMap] = useState<Record<number, string>>({});

    const [createRegion, { isLoading: isCreating, error: createError }] = useCreateRegionMutation();
    const [updateRegion, { isLoading: isUpdating, error: updateError }] = useUpdateRegionMutation();

    const isSaving = isCreating || isUpdating;
    const error = createError || updateError;

    useEffect(() => {
        if (open) {
            if (region) {
                setName(region.name);
                setDescription(region.description ?? '');
                setRegionType(region.regionType);
                setLabelMap({ ...region.labelMap });
            } else {
                setName('');
                setDescription('');
                setRegionType('');
                setLabelMap({});
            }
        }
    }, [region, open]);

    const handleSave = async () => {
        const trimmedName = name.trim();
        const trimmedType = regionType.trim();
        if (!trimmedName || !trimmedType) return;

        const data = {
            name: trimmedName,
            description: description.trim() || undefined,
            regionType: trimmedType,
            labelMap
        };

        try {
            if (region) {
                await updateRegion({ id: region.id, body: data as UpdateRegionRequest }).unwrap();
            } else {
                await createRegion(data as CreateRegionRequest).unwrap();
            }
            onClose();
        } catch (err) {
            console.error('Failed to save region:', err);
        }
    };

    const handleAddLabel = () => {
        const keys = Object.keys(labelMap).map(Number);
        const nextKey = keys.length > 0 ? Math.max(...keys) + 1 : 0;
        setLabelMap({ ...labelMap, [nextKey]: '' });
    };

    const handleRemoveLabel = (key: number) => {
        const newMap = { ...labelMap };
        delete newMap[key];
        setLabelMap(newMap);
    };

    const handleUpdateLabel = (key: number, value: string) => {
        setLabelMap({ ...labelMap, [key]: value });
    };

    const isFormValid = () => {
        return name.trim().length >= 3 && regionType.trim().length >= 2;
    };

    return (
        <Dialog open={open} onClose={onClose} maxWidth="sm" fullWidth>
            <DialogTitle>
                <Typography variant="h6">
                    {region ? 'Edit Region' : 'Create Region'}
                </Typography>
            </DialogTitle>
            <Divider />
            <DialogContent>
                <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2, pt: 1 }}>
                    <TextField
                        label="Name"
                        value={name}
                        onChange={(e) => setName(e.target.value)}
                        fullWidth
                        required
                        error={name.trim().length > 0 && name.trim().length < 3}
                        helperText={
                            name.trim().length > 0 && name.trim().length < 3
                                ? 'Name must be at least 3 characters'
                                : ''
                        }
                    />
                    <TextField
                        label="Description"
                        value={description}
                        onChange={(e) => setDescription(e.target.value)}
                        fullWidth
                        multiline
                        rows={3}
                        placeholder="Optional description..."
                    />

                    <TextField
                        label="Region Type"
                        value={regionType}
                        onChange={(e) => setRegionType(e.target.value)}
                        fullWidth
                        required
                        error={regionType.trim().length > 0 && regionType.trim().length < 2}
                        helperText='e.g., "Illumination", "Elevation", "FogOfWar", "Weather", "Difficulty"'
                    />

                    <Divider sx={{ my: 1 }} />

                    <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                        <Typography variant="subtitle2" color="text.secondary">
                            Label Map
                        </Typography>
                        <Button
                            size="small"
                            startIcon={<Add />}
                            onClick={handleAddLabel}
                        >
                            Add Label
                        </Button>
                    </Box>

                    <Typography variant="caption" color="text.secondary">
                        Define labels for region values (e.g., 0 = "Dark", 1 = "Dim", 2 = "Bright")
                    </Typography>

                    {Object.keys(labelMap).length === 0 ? (
                        <Paper
                            variant="outlined"
                            sx={{
                                p: 2,
                                textAlign: 'center',
                                bgcolor: theme.palette.mode === 'dark'
                                    ? 'rgba(255,255,255,0.02)'
                                    : 'rgba(0,0,0,0.01)'
                            }}
                        >
                            <Typography variant="body2" color="text.secondary">
                                No labels defined yet
                            </Typography>
                        </Paper>
                    ) : (
                        <Box sx={{ display: 'flex', flexDirection: 'column', gap: 1 }}>
                            {Object.entries(labelMap)
                                .sort(([a], [b]) => Number(a) - Number(b))
                                .map(([key, value]) => (
                                    <Stack key={key} direction="row" spacing={1} alignItems="center">
                                        <TextField
                                            label="Value"
                                            value={key}
                                            size="small"
                                            disabled
                                            sx={{ width: 100 }}
                                        />
                                        <TextField
                                            label="Label"
                                            value={value}
                                            onChange={(e) => handleUpdateLabel(Number(key), e.target.value)}
                                            size="small"
                                            fullWidth
                                            placeholder="Enter label..."
                                        />
                                        <IconButton
                                            size="small"
                                            onClick={() => handleRemoveLabel(Number(key))}
                                            color="error"
                                        >
                                            <Delete />
                                        </IconButton>
                                    </Stack>
                                ))}
                        </Box>
                    )}

                    {error && (
                        <Alert severity="error" sx={{ mt: 1 }}>
                            Failed to save region. Please try again.
                        </Alert>
                    )}
                </Box>
            </DialogContent>
            <Divider />
            <DialogActions sx={{ p: 2 }}>
                <Button
                    startIcon={<Cancel />}
                    onClick={onClose}
                    disabled={isSaving}
                >
                    Cancel
                </Button>
                <Button
                    variant="contained"
                    startIcon={isSaving ? <CircularProgress size={16} /> : <Save />}
                    onClick={handleSave}
                    disabled={isSaving || !isFormValid()}
                >
                    {isSaving ? 'Saving...' : region ? 'Update' : 'Create'}
                </Button>
            </DialogActions>
        </Dialog>
    );
};
