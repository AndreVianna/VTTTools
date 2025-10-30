import React, { useState } from 'react';
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

interface SourceEditorFormProps {
    source: Source | null;
    onClose: () => void;
}

const SourceEditorForm: React.FC<SourceEditorFormProps> = ({ source, onClose }) => {
    const [name, setName] = useState(source?.name ?? '');
    const [description, setDescription] = useState(source?.description ?? '');
    const [sourceType, setSourceType] = useState(source?.sourceType ?? '');
    const [defaultRange, setDefaultRange] = useState(source?.defaultRange ?? 5);
    const [defaultIntensity, setDefaultIntensity] = useState(source?.defaultIntensity ?? 1.0);
    const [defaultIsGradient, setDefaultIsGradient] = useState(source?.defaultIsGradient ?? true);

    const [createSource, { isLoading: isCreating, error: createError }] = useCreateSourceMutation();
    const [updateSource, { isLoading: isUpdating, error: updateError }] = useUpdateSourceMutation();

    const isSaving = isCreating || isUpdating;
    const error = createError || updateError;

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
        <>
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
                        helperText='e.g., "Torch", "Lantern", "Sunlight", "Magical Glow"'
                    />

                    <Divider sx={{ my: 1 }} />

                    <Typography variant="subtitle2" gutterBottom>
                        Default Properties
                    </Typography>

                    <Box>
                        <Typography variant="caption" color="text.secondary" gutterBottom>
                            Default Range (cells): {defaultRange.toFixed(1)}
                        </Typography>
                        <Slider
                            value={defaultRange}
                            onChange={(_e, value) => setDefaultRange(value as number)}
                            min={0.5}
                            max={99.9}
                            step={0.5}
                            marks={[
                                { value: 0.5, label: '0.5' },
                                { value: 25, label: '25' },
                                { value: 50, label: '50' },
                                { value: 75, label: '75' },
                                { value: 99.9, label: '100' }
                            ]}
                        />
                    </Box>

                    <Box>
                        <Typography variant="caption" color="text.secondary" gutterBottom>
                            Default Intensity: {(defaultIntensity * 100).toFixed(0)}%
                        </Typography>
                        <Slider
                            value={defaultIntensity}
                            onChange={(_e, value) => setDefaultIntensity(value as number)}
                            min={0.0}
                            max={1.0}
                            step={0.05}
                            marks={[
                                { value: 0.0, label: '0%' },
                                { value: 0.5, label: '50%' },
                                { value: 1.0, label: '100%' }
                            ]}
                        />
                    </Box>

                    <FormControlLabel
                        control={
                            <Checkbox
                                checked={defaultIsGradient}
                                onChange={(e) => setDefaultIsGradient(e.target.checked)}
                            />
                        }
                        label="Default to Gradient Effect"
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
        </>
    );
};

export const SourceEditor: React.FC<SourceEditorProps> = ({ open, source, onClose }) => {
    return (
        <Dialog open={open} onClose={onClose} maxWidth="sm" fullWidth>
            <SourceEditorForm key={source?.id ?? 'new'} source={source} onClose={onClose} />
        </Dialog>
    );
};
