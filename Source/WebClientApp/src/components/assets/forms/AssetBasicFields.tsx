// Phase 5 Step 6 - Shared Form Component
// Basic asset fields (name, description) - Used in both Create and Edit dialogs

import React from 'react';
import { TextField, Box, Typography } from '@mui/material';

export interface AssetBasicFieldsProps {
    name: string;
    description: string;
    onNameChange: (value: string) => void;
    onDescriptionChange: (value: string) => void;
    readOnly?: boolean;
}

export const AssetBasicFields: React.FC<AssetBasicFieldsProps> = ({
    name,
    description,
    onNameChange,
    onDescriptionChange,
    readOnly = false
}) => {
    if (readOnly) {
        return (
            <>
                <Box>
                    <Typography variant="caption" color="text.secondary">Name</Typography>
                    <Typography variant="h6">{name}</Typography>
                </Box>
                <Box>
                    <Typography variant="caption" color="text.secondary">Description</Typography>
                    <Typography>{description}</Typography>
                </Box>
            </>
        );
    }

    return (
        <>
            <TextField
                label="Name"
                value={name}
                onChange={(e) => onNameChange(e.target.value)}
                fullWidth
                required
                helperText="Required - minimum 3 characters"
                error={name.length > 0 && name.length < 3}
            />
            <TextField
                label="Description"
                value={description}
                onChange={(e) => onDescriptionChange(e.target.value)}
                multiline
                rows={3}
                fullWidth
                helperText="Brief description of this asset"
            />
        </>
    );
};
