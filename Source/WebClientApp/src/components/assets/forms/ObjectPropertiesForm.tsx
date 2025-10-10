// Phase 5 Step 6 - Shared Form Component
// Object-specific properties (size, movable/opaque/visible) - Used in both Create and Edit dialogs

import React from 'react';
import { Box, Typography, FormControlLabel, Checkbox, Stack } from '@mui/material';
import { NamedSize } from '@/types/domain';
import { SizeSelector } from '@/components/common/SizeSelector';

export interface ObjectPropertiesFormProps {
    size: NamedSize;
    isMovable: boolean;
    isOpaque: boolean;
    onSizeChange: (value: NamedSize) => void;
    onIsMovableChange: (value: boolean) => void;
    onIsOpaqueChange: (value: boolean) => void;
    readOnly?: boolean;
}

export const ObjectPropertiesForm: React.FC<ObjectPropertiesFormProps> = ({
    size,
    isMovable,
    isOpaque,
    onSizeChange,
    onIsMovableChange,
    onIsOpaqueChange,
    readOnly = false
}) => {
    if (readOnly) {
        return (
            <Box>
                <Stack spacing={1}>
                    <SizeSelector value={size} onChange={onSizeChange} readOnly />
                    <Typography variant="body2">Movable: {isMovable ? 'Yes' : 'No'}</Typography>
                    <Typography variant="body2">Opaque: {isOpaque ? 'Yes' : 'No'}</Typography>
                </Stack>
            </Box>
        );
    }

    return (
        <Box>
            <Stack spacing={2}>
                <SizeSelector value={size} onChange={onSizeChange} />
                <FormControlLabel
                    control={
                        <Checkbox
                            checked={isMovable}
                            onChange={(e) => onIsMovableChange(e.target.checked)}
                        />
                    }
                    label="Movable"
                />
                <FormControlLabel
                    control={
                        <Checkbox
                            checked={isOpaque}
                            onChange={(e) => onIsOpaqueChange(e.target.checked)}
                        />
                    }
                    label="Opaque (blocks vision)"
                />
            </Stack>
        </Box>
    );
};
