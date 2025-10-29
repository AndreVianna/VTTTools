import React, { useState, useEffect } from 'react';
import {
    Dialog,
    DialogTitle,
    DialogContent,
    DialogActions,
    Button,
    TextField,
    FormControlLabel,
    Checkbox,
    Box,
    Typography,
    Divider,
    CircularProgress,
    Alert,
    Slider
} from '@mui/material';
import { Save, Cancel } from '@mui/icons-material';
import { useCreateSourceMutation, useUpdateSourceMutation } from '@/services/sourceApi';
import type { Source, CreateSourceRequest, UpdateSourceRequest } from '@/types/domain';

interface SourceEditorProps {
    open: boolean;
    source: Source | null;
    onClose: () => void;
}

export const SourceEditor: React.FC<SourceEditorProps> = ({ open, source, onClose }) => {
    const [name, setName] = useState('');
    const [description, setDescription] = useState('');
    const [sourceType, setSourceType] = useState('');
    const [defaultRange, setDefaultRange] = useState(5);
    const [defaultIntensity, setDefaultIntensity] = useState(1.0);
    const [defaultIsGradient, setDefaultIsGradient] = useState(true);

    const [createSource, { isLoading: isCreating, error: createError }] = useCreateSourceMutation();
    const [updateSource, { isLoading: isUpdating, error: updateError }] = useUpdateSourceMutation();

    const isSaving = isCreating || isUpdating;
    const error = createError || updateError;

    useEffect(() => {
        if (open) {
            if (source) {
                setName(source.name);
                setDescription(source.description ?? '');
                setSourceType(source.sourceType);
                setDefaultRange(source.defaultRange);
                setDefaultIntensity(source.defaultIntensity);
                setDefaultIsGradient(source.defaultIsGradient);
            } else {
                setName('');
                setDescription('');
                setSourceType('');
                setDefaultRange(5);
                setDefaultIntensity(1.0);
                setDefaultIsGradient(true);
            }
        }
    }, [source, open]);

    const handleSave = async () => {
        const trimmedName = name.trim();
        const trimmedType = sourceType.trim();
        if (!trimmedName || !trimmedType) return;

        const data = {
            name: trimmedName,
            description: description.trim() || undefined,
            sourceType: trimmedType,
            defaultRange,
            defaultIntensity,
            defaultIsGradient
        };

        try {
            if (source) {
                await updateSource({ id: source.id, body: data as UpdateSourceRequest }).unwrap();
            } else {
                await createSource(data as CreateSourceRequest).unwrap();
            }
            onClose();
        } catch (err) {
            console.error('Failed to save source:', err);
        }
    };

    const isFormValid = () => {
        return (
            name.trim().length >= 3 &&
            sourceType.trim().length >= 2 &&
            defaultRange >= 0.5 &&
            defaultRange <= 99.9 &&
            defaultIntensity >= 0.0 &&
            defaultIntensity <= 1.0
        );
    };

    return (
        <Dialog open={open} onClose={onClose} maxWidth="sm" fullWidth>
            <DialogTitle>
                <Typography variant="h6">
                    {source ? 'Edit Source' : 'Create Source'}
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
                        label="Source Type"
                        value={sourceType}
                        onChange={(e) => setSourceType(e.target.value)}
                        fullWidth
                        required
                        error={sourceType.trim().length > 0 && sourceType.trim().length < 2}
                        helperText='e.g., "Light", "Sound", "Heat", "Magic"'
                    />

                    <Divider sx={{ my: 1 }} />

                    <Typography variant="subtitle2" color="text.secondary">
                        Default Properties
                    </Typography>

                    <Box>
                        <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 1 }}>
                            <Typography variant="body2">Range (grid cells)</Typography>
                            <TextField
                                type="number"
                                value={defaultRange}
                                onChange={(e) => {
                                    const val = parseFloat(e.target.value);
                                    if (!isNaN(val)) {
                                        setDefaultRange(Math.max(0.5, Math.min(99.9, val)));
                                    }
                                }}
                                size="small"
                                sx={{ width: 100 }}
                                inputProps={{ step: 0.5, min: 0.5, max: 99.9 }}
                            />
                        </Box>
                        <Slider
                            value={defaultRange}
                            onChange={(_, value) => setDefaultRange(value as number)}
                            min={0.5}
                            max={50}
                            step={0.5}
                            marks={[
                                { value: 0.5, label: '0.5' },
                                { value: 10, label: '10' },
                                { value: 25, label: '25' },
                                { value: 50, label: '50' }
                            ]}
                            valueLabelDisplay="auto"
                        />
                        <Typography variant="caption" color="text.secondary">
                            Supports fractional values (e.g., 2.5 cells)
                        </Typography>
                    </Box>

                    <Box>
                        <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 1 }}>
                            <Typography variant="body2">Intensity</Typography>
                            <TextField
                                type="number"
                                value={defaultIntensity}
                                onChange={(e) => {
                                    const val = parseFloat(e.target.value);
                                    if (!isNaN(val)) {
                                        setDefaultIntensity(Math.max(0.0, Math.min(1.0, val)));
                                    }
                                }}
                                size="small"
                                sx={{ width: 100 }}
                                inputProps={{ step: 0.1, min: 0.0, max: 1.0 }}
                            />
                        </Box>
                        <Slider
                            value={defaultIntensity}
                            onChange={(_, value) => setDefaultIntensity(value as number)}
                            min={0.0}
                            max={1.0}
                            step={0.1}
                            marks={[
                                { value: 0.0, label: '0%' },
                                { value: 0.5, label: '50%' },
                                { value: 1.0, label: '100%' }
                            ]}
                            valueLabelDisplay="auto"
                            valueLabelFormat={(value) => `${(value * 100).toFixed(0)}%`}
                        />
                        <Typography variant="caption" color="text.secondary">
                            Default strength/brightness (0.0 to 1.0)
                        </Typography>
                    </Box>

                    <FormControlLabel
                        control={
                            <Checkbox
                                checked={defaultIsGradient}
                                onChange={(e) => setDefaultIsGradient(e.target.checked)}
                            />
                        }
                        label={
                            <Box>
                                <Typography variant="body2">Gradient</Typography>
                                <Typography variant="caption" color="text.secondary">
                                    Effect fades with distance from source
                                </Typography>
                            </Box>
                        }
                    />

                    {error && (
                        <Alert severity="error" sx={{ mt: 1 }}>
                            Failed to save source. Please try again.
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
                    {isSaving ? 'Saving...' : source ? 'Update' : 'Create'}
                </Button>
            </DialogActions>
        </Dialog>
    );
};
