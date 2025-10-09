// Phase 5 Step 6 - Shared Form Component
// Creature-specific properties (cell size, category) - Used in both Create and Edit dialogs

import React from 'react';
import { TextField, Box, Typography, Chip, Stack } from '@mui/material';
import { CreatureCategory } from '@/types/domain';

export interface CreaturePropertiesFormProps {
    cellSize: number;
    category: CreatureCategory;
    onCellSizeChange: (value: number) => void;
    onCategoryChange: (value: CreatureCategory) => void;
    readOnly?: boolean;
}

export const CreaturePropertiesForm: React.FC<CreaturePropertiesFormProps> = ({
    cellSize,
    category,
    onCellSizeChange,
    onCategoryChange,
    readOnly = false
}) => {
    if (readOnly) {
        return (
            <Box>
                <Typography variant="caption" color="text.secondary" sx={{ display: 'block', mb: 1 }}>
                    Creature Properties
                </Typography>
                <Stack spacing={1}>
                    <Typography variant="body2">Size: {cellSize}x{cellSize} cells</Typography>
                    <Box>
                        <Chip label={category} size="small" />
                    </Box>
                </Stack>
            </Box>
        );
    }

    return (
        <Box>
            <Typography variant="caption" color="text.secondary" sx={{ display: 'block', mb: 1 }}>
                Creature Properties
            </Typography>
            <Stack spacing={2}>
                <TextField
                    label="Cell Size"
                    type="number"
                    value={cellSize}
                    onChange={(e) => onCellSizeChange(parseInt(e.target.value) || 1)}
                    inputProps={{ min: 1 }}
                    size="small"
                    fullWidth
                    helperText="Size in grid cells (square)"
                    error={cellSize <= 0}
                />
                <Box>
                    <Typography variant="body2" sx={{ mb: 1 }}>Category</Typography>
                    <Box sx={{ display: 'flex', gap: 1 }}>
                        <Chip
                            label="Character"
                            onClick={() => onCategoryChange(CreatureCategory.Character)}
                            color={category === CreatureCategory.Character ? 'primary' : 'default'}
                            variant={category === CreatureCategory.Character ? 'filled' : 'outlined'}
                        />
                        <Chip
                            label="Monster"
                            onClick={() => onCategoryChange(CreatureCategory.Monster)}
                            color={category === CreatureCategory.Monster ? 'primary' : 'default'}
                            variant={category === CreatureCategory.Monster ? 'filled' : 'outlined'}
                        />
                    </Box>
                </Box>
            </Stack>
        </Box>
    );
};
