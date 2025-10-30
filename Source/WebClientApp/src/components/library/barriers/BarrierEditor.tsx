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
    Alert
} from '@mui/material';
import { Save, Cancel } from '@mui/icons-material';
import { useCreateBarrierMutation, useUpdateBarrierMutation } from '@/services/barrierApi';
import type { Barrier, CreateBarrierRequest, UpdateBarrierRequest } from '@/types/domain';

interface BarrierEditorProps {
    open: boolean;
    barrier: Barrier | null;
    onClose: () => void;
}

const BarrierEditorInternal: React.FC<BarrierEditorProps> = ({ open, barrier, onClose }) => {
    const [name, setName] = useState(barrier?.name ?? '');
    const [description, setDescription] = useState(barrier?.description ?? '');
    const [isOpaque, setIsOpaque] = useState(barrier?.isOpaque ?? true);
    const [isSolid, setIsSolid] = useState(barrier?.isSolid ?? true);
    const [isSecret, setIsSecret] = useState(barrier?.isSecret ?? false);
    const [isOpenable, setIsOpenable] = useState(barrier?.isOpenable ?? false);
    const [isLocked, setIsLocked] = useState(barrier?.isLocked ?? false);

    const [createBarrier, { isLoading: isCreating, error: createError }] = useCreateBarrierMutation();
    const [updateBarrier, { isLoading: isUpdating, error: updateError }] = useUpdateBarrierMutation();

    const isSaving = isCreating || isUpdating;
    const error = createError || updateError;

    const handleSave = async () => {
        const trimmedName = name.trim();
        if (!trimmedName) return;

        const data = {
            name: trimmedName,
            description: description.trim() || undefined,
            isOpaque,
            isSolid,
            isSecret,
            isOpenable,
            isLocked: isOpenable ? isLocked : false
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
                        Physical Properties
                    </Typography>

                    <FormControlLabel
                        control={
                            <Checkbox
                                checked={isOpaque}
                                onChange={(e) => setIsOpaque(e.target.checked)}
                            />
                        }
                        label={
                            <Box>
                                <Typography variant="body2">Opaque</Typography>
                                <Typography variant="caption" color="text.secondary">
                                    Blocks line of sight
                                </Typography>
                            </Box>
                        }
                    />

                    <FormControlLabel
                        control={
                            <Checkbox
                                checked={isSolid}
                                onChange={(e) => setIsSolid(e.target.checked)}
                            />
                        }
                        label={
                            <Box>
                                <Typography variant="body2">Solid</Typography>
                                <Typography variant="caption" color="text.secondary">
                                    Blocks movement
                                </Typography>
                            </Box>
                        }
                    />

                    <FormControlLabel
                        control={
                            <Checkbox
                                checked={isSecret}
                                onChange={(e) => setIsSecret(e.target.checked)}
                            />
                        }
                        label={
                            <Box>
                                <Typography variant="body2">Secret</Typography>
                                <Typography variant="caption" color="text.secondary">
                                    Hidden until discovered
                                </Typography>
                            </Box>
                        }
                    />

                    <Divider sx={{ my: 1 }} />

                    <Typography variant="subtitle2" color="text.secondary">
                        Door Properties
                    </Typography>

                    <FormControlLabel
                        control={
                            <Checkbox
                                checked={isOpenable}
                                onChange={(e) => setIsOpenable(e.target.checked)}
                            />
                        }
                        label={
                            <Box>
                                <Typography variant="body2">Openable</Typography>
                                <Typography variant="caption" color="text.secondary">
                                    Can be opened/closed (door, window, etc.)
                                </Typography>
                            </Box>
                        }
                    />

                    {isOpenable && (
                        <FormControlLabel
                            sx={{ ml: 4 }}
                            control={
                                <Checkbox
                                    checked={isLocked}
                                    onChange={(e) => setIsLocked(e.target.checked)}
                                />
                            }
                            label={
                                <Box>
                                    <Typography variant="body2">Locked</Typography>
                                    <Typography variant="caption" color="text.secondary">
                                        Requires key or unlock action
                                    </Typography>
                                </Box>
                            }
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
