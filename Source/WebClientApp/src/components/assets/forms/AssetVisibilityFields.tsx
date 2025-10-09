// Phase 5 Step 6 - Shared Form Component
// Asset visibility and publishing status fields - Used in both Create and Edit dialogs

import React from 'react';
import { Box, Typography, Chip, FormControlLabel, Checkbox, Stack, Alert } from '@mui/material';

export interface AssetVisibilityFieldsProps {
    isPublic: boolean;
    isPublished: boolean;
    onIsPublicChange: (value: boolean) => void;
    onIsPublishedChange: (value: boolean) => void;
    readOnly?: boolean;
}

export const AssetVisibilityFields: React.FC<AssetVisibilityFieldsProps> = ({
    isPublic,
    isPublished,
    onIsPublicChange,
    onIsPublishedChange,
    readOnly = false
}) => {
    if (readOnly) {
        return (
            <Box>
                <Typography variant="caption" color="text.secondary" sx={{ display: 'block', mb: 1 }}>
                    Visibility
                </Typography>
                <Box sx={{ display: 'flex', gap: 1 }}>
                    <Chip label={isPublic ? 'Public' : 'Private'} size="small" />
                    {isPublished && <Chip label="Published" color="success" size="small" />}
                </Box>
            </Box>
        );
    }

    return (
        <Box>
            <Typography variant="caption" color="text.secondary" sx={{ display: 'block', mb: 1 }}>
                Visibility
            </Typography>
            <Stack spacing={1}>
                <FormControlLabel
                    control={
                        <Checkbox
                            checked={isPublic}
                            onChange={(e) => onIsPublicChange(e.target.checked)}
                        />
                    }
                    label="Public (visible to all users)"
                />
                <FormControlLabel
                    control={
                        <Checkbox
                            checked={isPublished}
                            onChange={(e) => onIsPublishedChange(e.target.checked)}
                        />
                    }
                    label="Published (approved for use)"
                />
                {isPublished && !isPublic && (
                    <Alert severity="warning" sx={{ mt: 1 }}>
                        Published assets must be public
                    </Alert>
                )}
            </Stack>
        </Box>
    );
};
