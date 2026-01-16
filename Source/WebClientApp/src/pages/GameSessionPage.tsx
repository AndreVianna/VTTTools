import { Box, Button, CircularProgress, Typography, useTheme } from '@mui/material';
import ArrowBackIcon from '@mui/icons-material/ArrowBack';
import type React from 'react';
import { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import { Layer } from 'react-konva';
import { useNavigate, useParams } from 'react-router-dom';
import { BackgroundLayer, EncounterCanvas, GridRenderer, type EncounterCanvasHandle } from '@/components/encounter';
import { AutoplayHelpDialog } from '@/components/encounter/AutoplayHelpDialog';
import { EncounterEntryModal } from '@/components/encounter/EncounterEntryModal';
import { getApiEndpoints } from '@/config/development';
import { useAudioUnlock } from '@/hooks/useAudioUnlock';
import { useSessionState } from '@/hooks/useSessionState';
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
 * - Entry modal that unlocks audio on first visit
 * - Audio Unlock Pattern (AUP) for page refresh scenarios
 * - Clean view without editor toolbars
 * - DM can exit back to editor
 */
export const GameSessionPage: React.FC = () => {
    const { encounterId } = useParams<{ encounterId: string }>();
    const navigate = useNavigate();
    const theme = useTheme();
    const canvasRef = useRef<EncounterCanvasHandle>(null);

    // Audio unlock state
    const { isUnlocked: isAudioUnlocked, unlockAudio } = useAudioUnlock();
    const [showEntryModal, setShowEntryModal] = useState(true);
    const [showAutoplayHelp, setShowAutoplayHelp] = useState(false);
    const [hasEnteredEncounter, setHasEnteredEncounter] = useState(false);

    // Track initial mount to prevent race conditions with sessionStorage
    const isInitialMountRef = useRef(true);

    // Session state for tracking last visited encounter (for page refresh detection)
    // Note: encounterId is intentionally undefined to use global session storage key.
    // This tracks the LAST visited encounter across all encounters, enabling page refresh
    // detection. When user refreshes within the same encounter, we skip the entry modal.
    const [lastEncounterId, setLastEncounterId] = useSessionState<string | null>({
        key: 'lastEncounterId',
        defaultValue: null,
        encounterId: undefined,
    });

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

    // Check if this is a page refresh (same encounter visited before)
    // Only runs on initial mount to avoid re-triggering on state changes
    useEffect(() => {
        if (isInitialMountRef.current && lastEncounterId === encounterId) {
            // Page refresh - skip modal, use AUP (silent unlock on first interaction)
            setShowEntryModal(false);
            setHasEnteredEncounter(true);
        }
        isInitialMountRef.current = false;
    }, [encounterId, lastEncounterId]);

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

    // Handle entering the encounter (from modal)
    const handleEnterEncounter = useCallback(async () => {
        // Unlock audio
        await unlockAudio();

        // Track this encounter for refresh detection
        if (encounterId) {
            setLastEncounterId(encounterId);
        }

        setHasEnteredEncounter(true);
        setShowEntryModal(false);
    }, [encounterId, setLastEncounterId, unlockAudio]);

    // Handle exit to editor
    const handleExitToEditor = useCallback(() => {
        navigate(`/encounters/${encounterId}/edit`);
    }, [encounterId, navigate]);

    // Handle background image loaded
    const handleBackgroundImageLoaded = useCallback((dimensions: { width: number; height: number }) => {
        setStageSize(dimensions);
    }, []);

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

    // Encounter name for the modal
    const encounterName = encounter?.name ?? 'Unknown Encounter';

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
            {/* Entry Modal - shown on first visit to unlock audio */}
            <EncounterEntryModal
                open={showEntryModal}
                encounterName={encounterName}
                onEnter={handleEnterEncounter}
                onHelpClick={() => setShowAutoplayHelp(true)}
            />

            {/* Autoplay Help Dialog */}
            <AutoplayHelpDialog
                open={showAutoplayHelp}
                onClose={() => setShowAutoplayHelp(false)}
            />

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

            {/* Main Canvas - only render after entering encounter */}
            {hasEnteredEncounter && (
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
                            muted={!hasEnteredEncounter || !isAudioUnlocked}
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
            )}
        </Box>
    );
};
