// Phase 5 Step 6 - Shared Form Component
// Object-specific properties (cell dimensions, movable/opaque/visible) - Used in both Create and Edit dialogs

import React from 'react';
import { TextField, Box, Typography, FormControlLabel, Checkbox, Stack } from '@mui/material';

export interface ObjectPropertiesFormProps {
    cellWidth: number;
    cellHeight: number;
    isMovable: boolean;
    isOpaque: boolean;
    isVisible: boolean;
    onCellWidthChange: (value: number) => void;
    onCellHeightChange: (value: number) => void;
    onIsMovableChange: (value: boolean) => void;
    onIsOpaqueChange: (value: boolean) => void;
    onIsVisibleChange: (value: boolean) => void;
    readOnly?: boolean;
}

export const ObjectPropertiesForm: React.FC<ObjectPropertiesFormProps> = ({
    cellWidth,
    cellHeight,
    isMovable,
    isOpaque,
    isVisible,
    onCellWidthChange,
    onCellHeightChange,
    onIsMovableChange,
    onIsOpaqueChange,
    onIsVisibleChange,
    readOnly = false
}) => {
    if (readOnly) {
        return (
            <Box>
                <Typography variant="caption" color="text.secondary" sx={{ display: 'block', mb: 1 }}>
                    Object Properties
                </Typography>
                <Stack spacing={1}>
                    <Typography variant="body2">Size: {cellWidth}x{cellHeight} cells</Typography>
                    <Typography variant="body2">Movable: {isMovable ? 'Yes' : 'No'}</Typography>
                    <Typography variant="body2">Opaque: {isOpaque ? 'Yes' : 'No'}</Typography>
                    <Typography variant="body2">Visible: {isVisible ? 'Yes' : 'No'}</Typography>
                </Stack>
            </Box>
        );
    }

    return (
        <Box>
            <Typography variant="caption" color="text.secondary" sx={{ display: 'block', mb: 1 }}>
                Object Properties
            </Typography>
            <Stack spacing={2}>
                <Box sx={{ display: 'flex', gap: 2 }}>
                    <TextField
                        label="Cell Width"
                        type="number"
                        value={cellWidth}
                        onChange={(e) => onCellWidthChange(parseInt(e.target.value) || 1)}
                        inputProps={{ min: 1 }}
                        size="small"
                        helperText="Width in grid cells"
                        error={cellWidth <= 0}
                    />
                    <TextField
                        label="Cell Height"
                        type="number"
                        value={cellHeight}
                        onChange={(e) => onCellHeightChange(parseInt(e.target.value) || 1)}
                        inputProps={{ min: 1 }}
                        size="small"
                        helperText="Height in grid cells"
                        error={cellHeight <= 0}
                    />
                </Box>
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
                <FormControlLabel
                    control={
                        <Checkbox
                            checked={isVisible}
                            onChange={(e) => onIsVisibleChange(e.target.checked)}
                        />
                    }
                    label="Visible to players"
                />
            </Stack>
        </Box>
    );
};
