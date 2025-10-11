// SizeSelector Component
// Unified size input with named presets and custom dimensions

import React, { useMemo } from 'react';
import {
    Box,
    Select,
    MenuItem,
    TextField,
    IconButton,
    Typography,
    FormControl,
    SelectChangeEvent
} from '@mui/material';
import {
    Lock as LockIcon,
    LockOpen as LockOpenIcon
} from '@mui/icons-material';
import { NamedSize, SizeName } from '@/types/domain';

export interface SizeSelectorProps {
    value: NamedSize;
    onChange: (size: NamedSize) => void;
    label?: string;
    readOnly?: boolean;
}

// Map SizeName to dimensions
const SIZE_MAP: Record<SizeName, { width: number; height: number }> = {
    [SizeName.Zero]: { width: 0, height: 0 },
    [SizeName.Miniscule]: { width: 0.125, height: 0.125 },
    [SizeName.Tiny]: { width: 0.25, height: 0.25 },
    [SizeName.Small]: { width: 0.5, height: 0.5 },
    [SizeName.Medium]: { width: 1, height: 1 },
    [SizeName.Large]: { width: 2, height: 2 },
    [SizeName.Huge]: { width: 3, height: 3 },
    [SizeName.Gargantuan]: { width: 4, height: 4 },
    [SizeName.Custom]: { width: 1, height: 1 }
};

// Determine SizeName from dimensions
function determineSizeName(width: number, height: number, isSquare: boolean): SizeName {
    if (width === 0 && height === 0) return SizeName.Zero;
    if (!isSquare) return SizeName.Custom;

    const tolerance = 0.001;
    if (Math.abs(width - 0.125) < tolerance) return SizeName.Miniscule;
    if (Math.abs(width - 0.25) < tolerance) return SizeName.Tiny;
    if (Math.abs(width - 0.5) < tolerance) return SizeName.Small;
    if (Math.abs(width - 1.0) < tolerance) return SizeName.Medium;
    if (Math.abs(width - 2.0) < tolerance) return SizeName.Large;
    if (Math.abs(width - 3.0) < tolerance) return SizeName.Huge;
    if (Math.abs(width - 4.0) < tolerance) return SizeName.Gargantuan;

    return SizeName.Custom;
}

// Validate fractional sizes
function isValidSize(value: number): boolean {
    if (value < 0) return false;
    if (Number.isInteger(value)) return true;

    const fraction = Number((value % 1).toFixed(3));
    return fraction === 0.125 || fraction === 0.25 || fraction === 0.5;
}

export const SizeSelector: React.FC<SizeSelectorProps> = ({
    value,
    onChange,
    label = 'Size',
    readOnly = false
}) => {
    // Derive selectedName from value props
    const selectedName = useMemo(
        () => determineSizeName(value.width, value.height, value.isSquare),
        [value.width, value.height, value.isSquare]
    );

    const handleNameChange = (event: SelectChangeEvent<SizeName>) => {
        const newName = Number(event.target.value) as SizeName;

        if (newName !== SizeName.Custom) {
            const dimensions = SIZE_MAP[newName];
            onChange({
                width: dimensions.width,
                height: dimensions.height,
                isSquare: true
            });
        }
    };

    const handleWidthChange = (newWidth: number) => {
        if (value.isSquare) {
            // Locked: Update both width and height
            onChange({
                width: newWidth,
                height: newWidth,
                isSquare: true
            });
        } else {
            // Unlocked: Update width only
            onChange({
                ...value,
                width: newWidth
            });
        }
        // Name will be re-derived automatically via useMemo
    };

    const handleHeightChange = (newHeight: number) => {
        onChange({
            ...value,
            height: newHeight
        });
        // Name will be re-derived automatically via useMemo
    };

    const handleToggleLock = () => {
        if (value.isSquare) {
            // Unlock: Keep current values
            onChange({
                ...value,
                isSquare: false
            });
        } else {
            // Lock: Sync height to width
            onChange({
                ...value,
                height: value.width,
                isSquare: true
            });
        }
    };

    if (readOnly) {
        const displayName = selectedName === SizeName.Custom
            ? value.isSquare
                ? `${value.width} (square)`
                : `${value.width} × ${value.height}`
            : Object.keys(SizeName).find(key => SizeName[key as keyof typeof SizeName] === selectedName);

        return (
            <Box>
                <Typography variant="caption" color="text.secondary">
                    {label}
                </Typography>
                <Typography variant="body2">
                    {displayName}
                </Typography>
            </Box>
        );
    }

    return (
        <Box>
            <Typography variant="caption" color="text.secondary" sx={{ display: 'block', mb: 0.5 }}>
                {label}
            </Typography>
            <Box sx={{ display: 'flex', alignItems: 'flex-start', gap: 1 }}>
                <FormControl size="small" sx={{ minWidth: 180 }}>
                    <Select
                        value={selectedName}
                        onChange={handleNameChange}
                        displayEmpty
                    >
                        <MenuItem value={SizeName.Zero}>Zero (0)</MenuItem>
                        <MenuItem value={SizeName.Miniscule}>Miniscule (⅛)</MenuItem>
                        <MenuItem value={SizeName.Tiny}>Tiny (¼)</MenuItem>
                        <MenuItem value={SizeName.Small}>Small (½)</MenuItem>
                        <MenuItem value={SizeName.Medium}>Medium (1)</MenuItem>
                        <MenuItem value={SizeName.Large}>Large (2)</MenuItem>
                        <MenuItem value={SizeName.Huge}>Huge (3)</MenuItem>
                        <MenuItem value={SizeName.Gargantuan}>Gargantuan (4)</MenuItem>
                        <MenuItem value={SizeName.Custom}>Custom</MenuItem>
                    </Select>
                </FormControl>

                {selectedName === SizeName.Custom && (
                    <>
                        <TextField
                            label={value.isSquare ? '' : 'W'}
                            placeholder={value.isSquare ? 'Size' : 'Width'}
                            type="number"
                            value={value.width}
                            onChange={(e) => handleWidthChange(parseFloat(e.target.value) || 0)}
                            inputProps={{ min: 0, step: 0.125 }}
                            size="small"
                            sx={{ width: 80 }}
                            error={!isValidSize(value.width)}
                        />

                        <IconButton
                            onClick={handleToggleLock}
                            size="small"
                            color={value.isSquare ? 'primary' : 'default'}
                        >
                            {value.isSquare ? <LockIcon /> : <LockOpenIcon />}
                        </IconButton>

                        {!value.isSquare && (
                            <>
                                <Typography variant="body2" sx={{ lineHeight: 2.5 }}>×</Typography>
                                <TextField
                                    label="H"
                                    placeholder="Height"
                                    type="number"
                                    value={value.height}
                                    onChange={(e) => handleHeightChange(parseFloat(e.target.value) || 0)}
                                    inputProps={{ min: 0, step: 0.125 }}
                                    size="small"
                                    sx={{ width: 80 }}
                                    error={!isValidSize(value.height)}
                                />
                            </>
                        )}
                    </>
                )}
            </Box>
            {selectedName === SizeName.Custom && (!isValidSize(value.width) || (!value.isSquare && !isValidSize(value.height))) && (
                <Typography variant="caption" color="error" sx={{ display: 'block', mt: 0.5 }}>
                    Valid: 0.125 (⅛), 0.25 (¼), 0.5 (½), or whole numbers
                </Typography>
            )}
        </Box>
    );
};
