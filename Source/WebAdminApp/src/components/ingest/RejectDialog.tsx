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
    Avatar,
    CircularProgress,
} from '@mui/material';
import type { AppDispatch } from '@store/store';
import { rejectAssets, selectIsSubmitting } from '@store/slices/ingestSlice';
import type { IngestAssetResponse } from '@/types/ingest';

interface RejectDialogProps {
    open: boolean;
    asset: IngestAssetResponse | null;
    onClose: () => void;
    onComplete: () => void;
}

export function RejectDialog({ open, asset, onClose, onComplete }: RejectDialogProps) {
    const dispatch = useDispatch<AppDispatch>();
    const isSubmitting = useSelector(selectIsSubmitting);

    const [aiPrompt, setAiPrompt] = useState('');

    useEffect(() => {
        if (open && asset) {
            setAiPrompt(asset.aiPrompt ?? asset.description ?? '');
        }
    }, [open, asset]);

    const handleClose = useCallback(() => {
        setAiPrompt('');
        onClose();
    }, [onClose]);

    const handleReject = useCallback(async () => {
        if (!asset || !aiPrompt.trim()) return;

        const result = await dispatch(rejectAssets({
            items: [{
                assetId: asset.id,
                aiPrompt: aiPrompt.trim(),
            }],
        }));

        if (rejectAssets.fulfilled.match(result)) {
            setAiPrompt('');
            onComplete();
        }
    }, [dispatch, asset, aiPrompt, onComplete]);

    if (!asset) return null;

    return (
        <Dialog open={open} onClose={handleClose} maxWidth="sm" fullWidth>
            <DialogTitle>Reject Asset</DialogTitle>
            <DialogContent>
                <Box sx={{ display: 'flex', gap: 2, mb: 3 }}>
                    <Avatar
                        src={asset.portrait?.path}
                        variant="rounded"
                        sx={{ width: 80, height: 80 }}
                    >
                        {asset.name.charAt(0)}
                    </Avatar>
                    <Box>
                        <Typography variant="h6">{asset.name}</Typography>
                        <Typography variant="body2" color="text.secondary">
                            {asset.category} / {asset.type}
                            {asset.subtype && ` / ${asset.subtype}`}
                        </Typography>
                        {asset.description && (
                            <Typography variant="body2" color="text.secondary" sx={{ mt: 1 }}>
                                {asset.description.substring(0, 150)}
                                {asset.description.length > 150 ? '...' : ''}
                            </Typography>
                        )}
                    </Box>
                </Box>

                <Typography variant="body2" color="text.secondary" sx={{ mb: 2 }}>
                    The asset will be re-queued for AI generation with the new prompt below.
                    The current portrait and token images will be replaced.
                </Typography>

                <TextField
                    fullWidth
                    multiline
                    rows={4}
                    label="AI Prompt"
                    value={aiPrompt}
                    onChange={(e) => setAiPrompt(e.target.value)}
                    placeholder="Describe how the image should look..."
                    helperText="Provide detailed instructions for the AI to generate a new image"
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
                    {isSubmitting ? 'Rejecting...' : 'Reject & Regenerate'}
                </Button>
            </DialogActions>
        </Dialog>
    );
}
