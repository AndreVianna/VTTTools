// Phase 5 Step 6 - Shared Form Component
// Creature-specific properties (size, category) - Used in both Create and Edit dialogs

import React from 'react';
import { Box, Typography, Chip, Stack } from '@mui/material';
import { CreatureCategory, NamedSize } from '@/types/domain';
import { SizeSelector } from '@/components/common/SizeSelector';

export interface CreaturePropertiesFormProps {
    size: NamedSize;
    category: CreatureCategory;
    onSizeChange: (value: NamedSize) => void;
    onCategoryChange: (value: CreatureCategory) => void;
    readOnly?: boolean;
}

export const CreaturePropertiesForm: React.FC<CreaturePropertiesFormProps> = ({
    size,
    category,
    onSizeChange,
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
                    <SizeSelector value={size} onChange={onSizeChange} readOnly />
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
                <SizeSelector value={size} onChange={onSizeChange} />
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
