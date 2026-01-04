import {
    ZoomIn as ZoomInIcon,
    ZoomOut as ZoomOutIcon,
    ZoomOutMap as ZoomResetIcon,
} from '@mui/icons-material';
import { Box, IconButton, Tooltip, Typography, useTheme } from '@mui/material';
import type React from 'react';

export interface ZoomControlsProps {
    /** Current zoom level (1 = 100%) */
    zoomLevel: number;
    /** Minimum zoom level allowed */
    minZoom?: number;
    /** Maximum zoom level allowed */
    maxZoom?: number;
    /** Callback when zoom in is clicked */
    onZoomIn: () => void;
    /** Callback when zoom out is clicked */
    onZoomOut: () => void;
    /** Callback when reset zoom is clicked */
    onZoomReset: () => void;
    /** Whether to show the current zoom percentage */
    showZoomPercentage?: boolean;
    /** Custom ID prefix for semantic IDs */
    idPrefix?: string;
}

export const ZoomControls: React.FC<ZoomControlsProps> = ({
    zoomLevel,
    minZoom = 0.1,
    maxZoom = 5,
    onZoomIn,
    onZoomOut,
    onZoomReset,
    showZoomPercentage = true,
    idPrefix = 'zoom',
}) => {
    const theme = useTheme();

    const isAtMinZoom = zoomLevel <= minZoom;
    const isAtMaxZoom = zoomLevel >= maxZoom;
    const zoomPercentage = Math.round(zoomLevel * 100);

    return (
        <Box
            sx={{
                display: 'flex',
                alignItems: 'center',
                gap: 0.5,
            }}
        >
            <Tooltip title="Zoom Out">
                <span>
                    <IconButton
                        id={`${idPrefix}-btn-out`}
                        size="small"
                        onClick={onZoomOut}
                        disabled={isAtMinZoom}
                        aria-label="Zoom Out"
                        sx={{
                            width: 28,
                            height: 28,
                            borderRadius: 1,
                        }}
                    >
                        <ZoomOutIcon sx={{ fontSize: 16 }} />
                    </IconButton>
                </span>
            </Tooltip>

            {showZoomPercentage && (
                <Typography
                    variant="caption"
                    sx={{
                        minWidth: 40,
                        textAlign: 'center',
                        fontFamily: 'monospace',
                        fontSize: 11,
                        color: theme.palette.text.secondary,
                        userSelect: 'none',
                    }}
                    aria-label="Current zoom level"
                >
                    {zoomPercentage}%
                </Typography>
            )}

            <Tooltip title="Zoom In">
                <span>
                    <IconButton
                        id={`${idPrefix}-btn-in`}
                        size="small"
                        onClick={onZoomIn}
                        disabled={isAtMaxZoom}
                        aria-label="Zoom In"
                        sx={{
                            width: 28,
                            height: 28,
                            borderRadius: 1,
                        }}
                    >
                        <ZoomInIcon sx={{ fontSize: 16 }} />
                    </IconButton>
                </span>
            </Tooltip>

            <Tooltip title="Reset Zoom">
                <IconButton
                    id={`${idPrefix}-btn-reset`}
                    size="small"
                    onClick={onZoomReset}
                    aria-label="Reset Zoom"
                    sx={{
                        width: 28,
                        height: 28,
                        borderRadius: 1,
                    }}
                >
                    <ZoomResetIcon sx={{ fontSize: 16 }} />
                </IconButton>
            </Tooltip>
        </Box>
    );
};
