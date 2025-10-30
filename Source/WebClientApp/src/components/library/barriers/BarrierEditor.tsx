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
    FormControl,
    InputLabel,
    Select,
    MenuItem
} from '@mui/material';
import { Save, Cancel } from '@mui/icons-material';
import { useCreateBarrierMutation, useUpdateBarrierMutation } from '@/services/barrierApi';
import type { Barrier, CreateBarrierRequest, UpdateBarrierRequest, WallVisibility } from '@/types/domain';
import { WallVisibility as WallVisibilityEnum } from '@/types/domain';

interface BarrierEditorProps {
    open: boolean;
    barrier: Barrier | null;
    onClose: () => void;
}

const MATERIAL_OPTIONS = ['Stone', 'Wood', 'Metal', 'Glass', 'Magical', 'Custom'];

const BarrierEditorInternal: React.FC<BarrierEditorProps> = ({ open, barrier, onClose }) => {
    const [name, setName] = useState(barrier?.name ?? '');
    const [description, setDescription] = useState(barrier?.description ?? '');
    const [visibility, setVisibility] = useState<WallVisibility>(barrier?.visibility ?? WallVisibilityEnum.Normal);
    const [isClosed, setIsClosed] = useState(barrier?.isClosed ?? false);
    const [material, setMaterial] = useState(barrier?.material ?? 'Stone');
    const [customMaterial, setCustomMaterial] = useState('');

    const [createBarrier, { isLoading: isCreating, error: createError }] = useCreateBarrierMutation();
    const [updateBarrier, { isLoading: isUpdating, error: updateError }] = useUpdateBarrierMutation();

    const isSaving = isCreating || isUpdating;
    const error = createError || updateError;

    const handleSave = async () => {
        const trimmedName = name.trim();
        if (!trimmedName) return;

        const finalMaterial = material === 'Custom' ? customMaterial.trim() : material;

        const data = {
            name: trimmedName,
            description: description.trim() || undefined,
            visibility,
            isClosed,
            material: finalMaterial || undefined,
            poles: []
        };

        try {
            if (barrier) {
                await updateBarrier({ id: barrier.id, body: data as UpdateBarrierRequest }).unwrap();
            } else {
                await createBarrier(data as CreateBarrierRequest).unwrap();
            }
            onClose();
        } catch (err) {
            console.error('Failed to save barrier:', err);
        }
    };

    const isFormValid = () => {
        return name.trim().length >= 3;
    };

    return (
        <Dialog open={open} onClose={onClose} maxWidth="sm" fullWidth>
            <DialogTitle>
                <Typography variant="h6">
                    {barrier ? 'Edit Barrier' : 'Create Barrier'}
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

                    <Divider sx={{ my: 1 }} />

                    <Typography variant="subtitle2" color="text.secondary">
                        Wall Properties
                    </Typography>

                    <FormControl fullWidth>
                        <InputLabel id="visibility-label">Visibility</InputLabel>
                        <Select
                            labelId="visibility-label"
                            value={visibility}
                            label="Visibility"
                            onChange={(e) => setVisibility(e.target.value as WallVisibility)}
                        >
                            <MenuItem value={WallVisibilityEnum.Normal}>
                                <Box>
                                    <Typography variant="body2">Normal</Typography>
                                    <Typography variant="caption" color="text.secondary">
                                        Blocks sight and movement
                                    </Typography>
                                </Box>
                            </MenuItem>
                            <MenuItem value={WallVisibilityEnum.Fence}>
                                <Box>
                                    <Typography variant="body2">Fence</Typography>
                                    <Typography variant="caption" color="text.secondary">
                                        Blocks movement, can see through
                                    </Typography>
                                </Box>
                            </MenuItem>
                            <MenuItem value={WallVisibilityEnum.Invisible}>
                                <Box>
                                    <Typography variant="body2">Invisible Barrier</Typography>
                                    <Typography variant="caption" color="text.secondary">
                                        Blocks movement only, invisible
                                    </Typography>
                                </Box>
                            </MenuItem>
                        </Select>
                    </FormControl>

                    <FormControlLabel
                        control={
                            <Checkbox
                                checked={isClosed}
                                onChange={(e) => setIsClosed(e.target.checked)}
                            />
                        }
                        label={
                            <Box>
                                <Typography variant="body2">Closed (Enclosure/Room)</Typography>
                                <Typography variant="caption" color="text.secondary">
                                    Forms a closed shape
                                </Typography>
                            </Box>
                        }
                    />

                    <FormControl fullWidth>
                        <InputLabel id="material-label">Material</InputLabel>
                        <Select
                            labelId="material-label"
                            value={material}
                            label="Material"
                            onChange={(e) => setMaterial(e.target.value)}
                        >
                            {MATERIAL_OPTIONS.map((mat) => (
                                <MenuItem key={mat} value={mat}>
                                    {mat}
                                </MenuItem>
                            ))}
                        </Select>
                    </FormControl>

                    {material === 'Custom' && (
                        <TextField
                            label="Custom Material Name"
                            value={customMaterial}
                            onChange={(e) => setCustomMaterial(e.target.value)}
                            fullWidth
                            placeholder="Enter material name..."
                            inputProps={{ maxLength: 64 }}
                        />
                    )}

                    {error && (
                        <Alert severity="error" sx={{ mt: 1 }}>
                            Failed to save barrier. Please try again.
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
                    {isSaving ? 'Saving...' : barrier ? 'Update' : 'Create'}
                </Button>
            </DialogActions>
        </Dialog>
    );
};

export const BarrierEditor: React.FC<BarrierEditorProps> = (props) => {
    return <BarrierEditorInternal key={props.barrier?.id ?? 'new'} {...props} />;
};
