import { Box, Button, useTheme } from '@mui/material';
import ArrowBackIcon from '@mui/icons-material/ArrowBack';
import type React from 'react';
import { useCallback, useMemo, useRef, useState } from 'react';
import { Layer } from 'react-konva';
import { useNavigate, useParams } from 'react-router-dom';
import { BackgroundLayer, EncounterCanvas, GridRenderer, type EncounterCanvasHandle } from '@/components/encounter';
import { WallRenderer } from '@/components/encounter/rendering/WallRenderer';
import { DEFAULT_BACKGROUNDS } from '@/config/defaults';
import { useAudioUnlock } from '@/hooks/useAudioUnlock';
import {
    useBackgroundMedia,
    useEncounterLoadingState,
    useGridConfigSync,
} from '@/hooks/encounter';
import { useGetEncounterQuery } from '@/services/encounterApi';
import { LayerName } from '@/services/layerManager';
import { type PlacedWall, SegmentState } from '@/types/domain';
import { hydratePlacedWalls } from '@/utils/encounterMappers';
import { GridType } from '@/utils/gridCalculator';

/**
 * Encounter Page - Player/DM view of an encounter.
 *
 * This page serves two purposes:
 * 1. DM Preview - DM can preview the encounter from the player's perspective
 * 2. Game Session - Players view this page during live gameplay
 *
 * Key features:
 * - Audio Unlock Pattern (AUP) - audio unlocks on first user interaction
 * - Clean view without editor toolbars
 * - DM can exit back to editor
 * - Walls rendered with secret walls hidden from view
 */
export const EncounterPage: React.FC = () => {
    // ═══════════════════════════════════════════════════════════════════════════
    // 4.1 ROUTING
    // Router hooks: useNavigate, useParams, useLocation, useSearchParams
    // ═══════════════════════════════════════════════════════════════════════════
    const navigate = useNavigate();
    const { encounterId } = useParams<{ encounterId: string }>();

    // ═══════════════════════════════════════════════════════════════════════════
    // 4.2 THEME
    // Theme/UI hooks: useTheme, useMediaQuery
    // ═══════════════════════════════════════════════════════════════════════════
    const theme = useTheme();

    // ═══════════════════════════════════════════════════════════════════════════
    // 4.3 QUERIES & MUTATIONS
    // RTK Query hooks for data fetching and mutations
    // ═══════════════════════════════════════════════════════════════════════════
    const {
        data: encounter,
        isLoading,
        isError,
        error,
    } = useGetEncounterQuery(encounterId ?? '', {
        skip: !encounterId || encounterId === '',
    });

    // ═══════════════════════════════════════════════════════════════════════════
    // 4.5 CONTEXT HOOKS
    // App-level context: useUndoRedoContext, useClipboard, useConnectionStatus
    // ═══════════════════════════════════════════════════════════════════════════
    // Audio unlock state - unlocks on first user interaction (mousedown, touchstart, pointerdown, keydown)
    const { isUnlocked: isAudioUnlocked } = useAudioUnlock();

    // ═══════════════════════════════════════════════════════════════════════════
    // 4.7 STATE
    // Local component state: useState, useReducer
    // ═══════════════════════════════════════════════════════════════════════════
    const [viewport, setViewport] = useState({ x: 0, y: 0, scale: 1 });
    const [stageSize, setStageSize] = useState({ width: 1920, height: 1080 });

    // ═══════════════════════════════════════════════════════════════════════════
    // 4.8 REFS
    // References: useRef
    // ═══════════════════════════════════════════════════════════════════════════
    const canvasRef = useRef<EncounterCanvasHandle>(null);

    // ═══════════════════════════════════════════════════════════════════════════
    // 4.9 DOMAIN HOOKS
    // Feature-specific composed hooks that encapsulate business logic
    // ═══════════════════════════════════════════════════════════════════════════
    const { gridConfig } = useGridConfigSync({ encounter });
    const { backgroundUrl, backgroundContentType } = useBackgroundMedia({ encounter });

    // ═══════════════════════════════════════════════════════════════════════════
    // 4.11 DERIVED STATE
    // Pure computed values from props/state: useMemo
    // ═══════════════════════════════════════════════════════════════════════════
    /**
     * Filter walls to only show non-secret segments.
     * Secret walls are hidden from player view during gameplay.
     * Filter rule: Hide segments where segment.state === SegmentState.Secret
     */
    const stageWalls = encounter?.stage?.walls;
    const visibleWalls = useMemo((): PlacedWall[] => {
        if (!stageWalls || !encounterId) return [];
        const hydrated = hydratePlacedWalls(stageWalls, encounterId);
        return hydrated
            .map(wall => ({
                ...wall,
                segments: wall.segments.filter(s => s.state !== SegmentState.Secret),
            }))
            .filter(wall => wall.segments.length > 0);
    }, [stageWalls, encounterId]);

    // ═══════════════════════════════════════════════════════════════════════════
    // 4.13 HANDLERS
    // Event handlers: useCallback (including callback refs)
    // ═══════════════════════════════════════════════════════════════════════════
    const handleExitToEditor = useCallback(() => {
        navigate(`/encounters/${encounterId}/edit`);
    }, [encounterId, navigate]);

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

    const handleViewportChange = useCallback((newViewport: { x: number; y: number; scale: number }) => {
        setViewport(newViewport);
    }, []);

    const handleGoBack = useCallback(() => {
        navigate(-1);
    }, [navigate]);

    // ═══════════════════════════════════════════════════════════════════════════
    // 4.14 RENDER
    // JSX output
    // ═══════════════════════════════════════════════════════════════════════════
    const loadingState = useEncounterLoadingState({
        isLoading,
        isError,
        error,
        hasNoData: !encounter,
        onGoBack: handleGoBack,
    });
    if (loadingState) return loadingState;

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

                {/* GameWorld Layer - Walls, tokens, etc. */}
                <Layer name={LayerName.GameWorld} listening={false}>
                    {visibleWalls.map(wall => (
                        <WallRenderer
                            key={`wall-${wall.index}`}
                            encounterWall={wall}
                            activeScope="none"
                        />
                    ))}
                </Layer>
            </EncounterCanvas>
        </Box>
    );
};
