import { Box, Button, CircularProgress, Typography, useTheme } from '@mui/material';
import ArrowBackIcon from '@mui/icons-material/ArrowBack';
import type React from 'react';
import { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import { Layer } from 'react-konva';
import { useNavigate, useParams } from 'react-router-dom';
import { BackgroundLayer, EncounterCanvas, GridRenderer, type EncounterCanvasHandle } from '@/components/encounter';
import { getApiEndpoints } from '@/config/development';
import { useAudioUnlock } from '@/hooks/useAudioUnlock';
import { useGetEncounterQuery } from '@/services/encounterApi';
import { type GridConfig, GridType, getDefaultGrid } from '@/utils/gridCalculator';
import { LayerName } from '@/services/layerManager';
import { DEFAULT_BACKGROUNDS } from '@/config/defaults';

/**
 * Game Session Page - Player/DM view of an encounter.
 *
 * This page serves two purposes:
 * 1. DM Preview - DM can preview the encounter from the player's perspective
 * 2. Game Session - Players view this page during live gameplay
 *
 * Key features:
 * - Audio Unlock Pattern (AUP) - audio unlocks on first user interaction
 * - Clean view without editor toolbars
 * - DM can exit back to editor
 */
export const GameSessionPage: React.FC = () => {
    const { encounterId } = useParams<{ encounterId: string }>();
    const navigate = useNavigate();
    const theme = useTheme();
    const canvasRef = useRef<EncounterCanvasHandle>(null);

    // Audio unlock state - unlocks on first user interaction (mousedown, touchstart, pointerdown, keydown)
    const { isUnlocked: isAudioUnlocked } = useAudioUnlock();

    // Viewport state
    const [viewport, setViewport] = useState({ x: 0, y: 0, scale: 1 });

    // Stage size state
    const [stageSize, setStageSize] = useState({ width: 1920, height: 1080 });

    // Grid configuration
    const [gridConfig, setGridConfig] = useState<GridConfig>(getDefaultGrid());

    // Fetch encounter data
    const {
        data: encounter,
        isLoading,
        isError,
        error,
    } = useGetEncounterQuery(encounterId ?? '', {
        skip: !encounterId || encounterId === '',
    });

    // Update grid config when encounter loads
    useEffect(() => {
        if (encounter?.stage?.grid) {
            const stageGrid = encounter.stage.grid;
            const gridType = typeof stageGrid.type === 'string'
                ? GridType[stageGrid.type as keyof typeof GridType]
                : stageGrid.type;
            setGridConfig({
                type: gridType,
                cellSize: stageGrid.cellSize,
                offset: stageGrid.offset,
                snap: gridType !== GridType.NoGrid, // snap is UI-only
                scale: stageGrid.scale ?? 1,
            });
        }
    }, [encounter]);

    // Handle exit to editor
    const handleExitToEditor = useCallback(() => {
        navigate(`/encounters/${encounterId}/edit`);
    }, [encounterId, navigate]);

    // Handle background image loaded - center the view on the background (with saved offset if available)
    const handleBackgroundImageLoaded = useCallback((dimensions: { width: number; height: number }) => {
        setStageSize(dimensions);

        // Calculate centered position
        const centeredX = (window.innerWidth - dimensions.width) / 2;
        const centeredY = (window.innerHeight - dimensions.height) / 2;

        // Apply saved offset from stage settings (default 0,0 = centered)
        const settings = encounter?.stage?.settings;
        const offsetX = settings?.panning?.x ?? 0;
        const offsetY = settings?.panning?.y ?? 0;
        const scale = settings?.zoomLevel ?? 1;

        canvasRef.current?.setViewport({
            x: centeredX + offsetX,
            y: centeredY + offsetY,
            scale,
        });
    }, [encounter?.stage?.settings]);

    // Handle viewport change
    const handleViewportChange = useCallback((newViewport: { x: number; y: number; scale: number }) => {
        setViewport(newViewport);
    }, []);

    // Background URL
    const backgroundUrl = useMemo(() => {
        if (encounter?.stage?.settings?.mainBackground) {
            return `${getApiEndpoints().media}/${encounter.stage.settings.mainBackground.id}`;
        }
        return undefined;
    }, [encounter]);

    const backgroundContentType = encounter?.stage?.settings?.mainBackground?.contentType;

    // Loading state
    if (isLoading) {
        return (
            <Box
                sx={{
                    display: 'flex',
                    flexDirection: 'column',
                    alignItems: 'center',
                    justifyContent: 'center',
                    height: '100vh',
                    bgcolor: 'background.default',
                }}
            >
                <CircularProgress size={60} />
                <Typography variant="h6" sx={{ mt: 2, color: 'text.secondary' }}>
                    Loading encounter...
                </Typography>
            </Box>
        );
    }

    // Error state
    if (isError || !encounter) {
        return (
            <Box
                sx={{
                    display: 'flex',
                    flexDirection: 'column',
                    alignItems: 'center',
                    justifyContent: 'center',
                    height: '100vh',
                    bgcolor: 'background.default',
                    p: 3,
                }}
            >
                <Typography variant="h5" color="error" sx={{ mb: 2 }}>
                    Failed to load encounter
                </Typography>
                <Typography variant="body1" sx={{ mb: 3, color: 'text.secondary' }}>
                    {error && 'message' in error ? String(error.message) : 'An unexpected error occurred'}
                </Typography>
                <Button variant="contained" onClick={() => navigate(-1)}>
                    Go Back
                </Button>
            </Box>
        );
    }

    return (
        <Box
            sx={{
                position: 'relative',
                width: '100vw',
                height: '100vh',
                overflow: 'hidden',
                bgcolor: 'background.default',
            }}
        >
            {/* Exit to Editor button (DM only - for now always visible) */}
            <Box
                sx={{
                    position: 'absolute',
                    top: 16,
                    left: 16,
                    zIndex: 1000,
                }}
            >
                <Button
                    id="btn-exit-to-editor"
                    variant="contained"
                    color="secondary"
                    startIcon={<ArrowBackIcon />}
                    onClick={handleExitToEditor}
                    sx={{
                        opacity: 0.9,
                        '&:hover': {
                            opacity: 1,
                        },
                    }}
                >
                    Exit to Editor
                </Button>
            </Box>

            {/* Main Canvas */}
            <EncounterCanvas
                ref={canvasRef}
                width={window.innerWidth}
                height={window.innerHeight}
                initialPosition={{ x: viewport.x, y: viewport.y }}
                initialScale={viewport.scale}
                backgroundColor={theme.palette.background.default}
                onViewportChange={handleViewportChange}
            >
                {/* Static Layer - Background + Grid */}
                <Layer name={LayerName.Static} listening={false}>
                    <BackgroundLayer
                        imageUrl={backgroundUrl ?? DEFAULT_BACKGROUNDS.ENCOUNTER}
                        backgroundColor={theme.palette.background.default}
                        stageWidth={stageSize.width}
                        stageHeight={stageSize.height}
                        onImageLoaded={handleBackgroundImageLoaded}
                        {...(backgroundContentType && { contentType: backgroundContentType })}
                        muted={!isAudioUnlocked}
                    />

                    <GridRenderer
                        grid={gridConfig}
                        stageWidth={stageSize.width}
                        stageHeight={stageSize.height}
                        visible={gridConfig.type !== GridType.NoGrid}
                    />
                </Layer>

                {/* TODO: Add game world layer with tokens, walls, etc. */}
            </EncounterCanvas>
        </Box>
    );
};
