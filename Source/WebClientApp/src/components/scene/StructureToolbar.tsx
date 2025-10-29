import React, { useEffect } from 'react';
import { Box, ButtonGroup, Button, Tooltip, useTheme } from '@mui/material';
import {
    Fence as WallIcon,
    Map as RegionIcon,
    Lightbulb as LightIcon,
    Cancel as CancelIcon
} from '@mui/icons-material';

export type DrawingMode = 'barrier' | 'region' | 'source' | null;

export interface StructureToolbarProps {
    drawingMode: DrawingMode;
    onModeChange: (mode: DrawingMode) => void;
    disabled?: boolean;
}

export const StructureToolbar: React.FC<StructureToolbarProps> = ({
    drawingMode,
    onModeChange,
    disabled = false
}) => {
    const theme = useTheme();

    useEffect(() => {
        const handleKeyDown = (e: KeyboardEvent) => {
            if (disabled) return;

            if (e.target instanceof HTMLInputElement || e.target instanceof HTMLTextAreaElement) {
                return;
            }

            if (e.key === 'w' || e.key === 'W') {
                e.preventDefault();
                onModeChange('barrier');
            } else if (e.key === 'r' || e.key === 'R') {
                e.preventDefault();
                onModeChange('region');
            } else if (e.key === 'l' || e.key === 'L') {
                e.preventDefault();
                onModeChange('source');
            } else if (e.key === 'Escape') {
                e.preventDefault();
                onModeChange(null);
            }
        };

        window.addEventListener('keydown', handleKeyDown);

        return () => {
            window.removeEventListener('keydown', handleKeyDown);
        };
    }, [disabled, onModeChange]);

    return (
        <Box
            sx={{
                display: 'flex',
                gap: 1,
                padding: theme.spacing(1),
                bgcolor: theme.palette.background.paper,
                borderRadius: 1,
                boxShadow: 1
            }}
        >
            <ButtonGroup variant="contained" size="small" disabled={disabled}>
                <Tooltip title="Draw Barrier (W)" placement="bottom">
                    <Button
                        onClick={() => onModeChange('barrier')}
                        color={drawingMode === 'barrier' ? 'primary' : 'inherit'}
                        aria-label="Draw Barrier"
                    >
                        <WallIcon />
                    </Button>
                </Tooltip>
                <Tooltip title="Draw Region (R)" placement="bottom">
                    <Button
                        onClick={() => onModeChange('region')}
                        color={drawingMode === 'region' ? 'primary' : 'inherit'}
                        aria-label="Draw Region"
                    >
                        <RegionIcon />
                    </Button>
                </Tooltip>
                <Tooltip title="Place Light Source (L)" placement="bottom">
                    <Button
                        onClick={() => onModeChange('source')}
                        color={drawingMode === 'source' ? 'primary' : 'inherit'}
                        aria-label="Place Light Source"
                    >
                        <LightIcon />
                    </Button>
                </Tooltip>
                <Tooltip title="Cancel (Esc)" placement="bottom">
                    <Button
                        onClick={() => onModeChange(null)}
                        disabled={drawingMode === null}
                        aria-label="Cancel"
                    >
                        <CancelIcon />
                    </Button>
                </Tooltip>
            </ButtonGroup>
        </Box>
    );
};

StructureToolbar.displayName = 'StructureToolbar';
