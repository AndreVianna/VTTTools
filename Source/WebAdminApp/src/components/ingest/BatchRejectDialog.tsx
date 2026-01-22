import React, { useState, useCallback, useEffect } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import {
    Dialog,
    DialogTitle,
    DialogContent,
    DialogActions,
    Button,
    Box,
    Typography,
    TextField,
    CircularProgress,
} from '@mui/material';
import type { AppDispatch } from '@store/store';
import { rejectAssets, selectIsSubmitting } from '@store/slices/ingestSlice';

interface BatchRejectDialogProps {
    open: boolean;
    assetIds: string[];
    assetCount: number;
    onClose: () => void;
    onComplete: () => void;
}

export function BatchRejectDialog({ open, assetIds, assetCount, onClose, onComplete }: BatchRejectDialogProps) {
    const dispatch = useDispatch<AppDispatch>();
    const isSubmitting = useSelector(selectIsSubmitting);

    const [aiPrompt, setAiPrompt] = useState('');

    useEffect(() => {
        if (open) {
            setAiPrompt('');
        }
    }, [open]);

    const handleClose = useCallback(() => {
        setAiPrompt('');
        onClose();
    }, [onClose]);

    const handleReject = useCallback(async () => {
        if (assetIds.length === 0 || !aiPrompt.trim()) return;

        const items = assetIds.map(assetId => ({
            assetId,
            aiPrompt: aiPrompt.trim(),
        }));

        const result = await dispatch(rejectAssets({ items }));

        if (rejectAssets.fulfilled.match(result)) {
            setAiPrompt('');
            onComplete();
        }
    }, [dispatch, assetIds, aiPrompt, onComplete]);

    return (
        <Dialog open={open} onClose={handleClose} maxWidth="sm" fullWidth>
            <DialogTitle>Reject {assetCount} Asset{assetCount !== 1 ? 's' : ''}</DialogTitle>
            <DialogContent>
                <Box sx={{ mb: 3 }}>
                    <Typography variant="body2" color="text.secondary">
                        {assetCount} asset{assetCount !== 1 ? 's' : ''} will be re-queued for AI generation with the prompt below.
                        The current portrait and token images will be replaced.
                    </Typography>
                </Box>

                <TextField
                    fullWidth
                    multiline
                    rows={4}
                    label="AI Prompt"
                    value={aiPrompt}
                    onChange={(e) => setAiPrompt(e.target.value)}
                    placeholder="Describe how the images should look..."
                    helperText="This prompt will be applied to all selected assets"
                    disabled={isSubmitting}
                />
            </DialogContent>
            <DialogActions>
                <Button onClick={handleClose} disabled={isSubmitting}>
                    Cancel
                </Button>
                <Button
                    onClick={handleReject}
                    variant="contained"
                    color="warning"
                    disabled={!aiPrompt.trim() || isSubmitting}
                    startIcon={isSubmitting ? <CircularProgress size={16} /> : undefined}
                >
                    {isSubmitting ? 'Rejecting...' : `Reject ${assetCount} Asset${assetCount !== 1 ? 's' : ''}`}
                </Button>
            </DialogActions>
        </Dialog>
    );
}
