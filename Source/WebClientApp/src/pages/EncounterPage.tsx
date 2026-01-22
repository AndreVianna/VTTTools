import { Box, Button, useTheme } from '@mui/material';
import ArrowBackIcon from '@mui/icons-material/ArrowBack';
import type React from 'react';
import { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import { Group, Layer } from 'react-konva';
import { useNavigate, useParams } from 'react-router-dom';
import { BackgroundLayer, EncounterCanvas, EntityPlacement, GridRenderer, type EncounterCanvasHandle } from '@/components/encounter';
import { DMTestCharacter } from '@/components/encounter/DMTestCharacter';
import { LightSourceRenderer } from '@/components/encounter/rendering/SourceRenderer';
import { WallRenderer } from '@/components/encounter/rendering/WallRenderer';
import { DEFAULT_BACKGROUNDS } from '@/config/defaults';
import { useAuth } from '@/hooks/useAuth';
import { useAudioUnlock } from '@/hooks/useAudioUnlock';
import {
    useActiveCharacter,
    useBackgroundMedia,
    useDMTestCharacter,
    useEncounterLoadingState,
    useGridConfigSync,
    usePreviewModeAccess,
    useSpatialAudio,
} from '@/hooks/encounter';
import { useGetEncounterQuery } from '@/services/encounterApi';
import { GroupName, LayerName } from '@/services/layerManager';
import { AssetKind, type EncounterWall, type PlacedAsset, type PlacedLightSource, type PlacedSoundSource, type PlacedWall, SegmentState } from '@/types/domain';
import { hydrateGameElements, hydratePlacedLightSources, hydratePlacedSoundSources, hydratePlacedWalls } from '@/utils/encounterMappers';
import { SnapMode } from '@/utils/snapping';
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
    const { isUnlocked: isAudioUnlocked, audioContext } = useAudioUnlock();

    // Get current user for DM check
    const { user } = useAuth();

    // Preview mode access check (Phase A: simple ownership validation)
    // Phase A: Validate ownership (Phase B will add redirect on access denied)
    usePreviewModeAccess(encounterId, encounter);

    // Determine if current user is the DM (owner) of the encounter
    const isDM = useMemo(() => {
        if (!user || !encounter) return false;
        return encounter.ownerId === user.id;
    }, [user, encounter]);

    // ═══════════════════════════════════════════════════════════════════════════
    // 4.7 STATE
    // Local component state: useState, useReducer
    // ═══════════════════════════════════════════════════════════════════════════
    const [viewport, setViewport] = useState({ x: 0, y: 0, scale: 1 });
    const [stageSize, setStageSize] = useState({ width: 1920, height: 1080 });
    const [windowSize, setWindowSize] = useState({ width: window.innerWidth, height: window.innerHeight });

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

    /**
     * Hydrate and filter assets to only show non-hidden ones.
     * Hidden assets (isHidden === true) are not shown in player view during gameplay.
     */
    const visibleAssets = useMemo((): PlacedAsset[] => {
        if (!encounter || !encounterId) return [];

        const hydratedAssets = hydrateGameElements(
            encounter.actors ?? [],
            encounter.objects ?? [],
            encounter.effects ?? [],
            encounterId,
        );

        return hydratedAssets.filter(asset => !asset.isHidden);
    }, [encounter, encounterId]);

    /**
     * Hydrate and filter light sources to only show ones that are turned on.
     * Light sources with isOn === false are not rendered in player view.
     */
    const visibleLightSources = useMemo((): PlacedLightSource[] => {
        if (!encounter || !encounterId) return [];

        const hydratedLightSources = hydratePlacedLightSources(
            encounter.stage?.lights ?? [],
            encounterId,
        );

        return hydratedLightSources.filter(light => light.isOn);
    }, [encounter, encounterId]);

    /**
     * Hydrate and filter sound sources to only show ones that are playing.
     * Sound sources with isPlaying === false are not played in player view.
     */
    const visibleSoundSources = useMemo((): PlacedSoundSource[] => {
        if (!encounter || !encounterId) return [];

        const hydratedSoundSources = hydratePlacedSoundSources(
            encounter.stage?.sounds ?? [],
            encounterId,
        );

        return hydratedSoundSources.filter(sound => sound.isPlaying);
    }, [encounter, encounterId]);

    /**
     * Encounter walls for sound propagation calculations.
     * Includes all wall segments (sound blocking is calculated per-segment).
     */
    const encounterWalls = useMemo((): EncounterWall[] => {
        return encounter?.stage?.walls ?? [];
    }, [encounter?.stage?.walls]);

    // ═══════════════════════════════════════════════════════════════════════════
    // 4.9b DOMAIN HOOKS (depends on derived state above)
    // These hooks require visibleAssets/visibleSoundSources/encounterWalls
    // ═══════════════════════════════════════════════════════════════════════════
    const {
        activeCharacterId,
        activeCharacterPosition,
        setActiveCharacter,
        isActiveCharacter,
    } = useActiveCharacter({
        encounterId,
        visibleAssets,
    });

    // DM test character for testing player-perspective features
    const {
        position: dmTestPosition,
        setPosition: setDMTestPosition,
        isSelected: isDMTestSelected,
        select: selectDMTest,
    } = useDMTestCharacter({
        encounterId,
        isDM,
        gridConfig,
        stageSize,
        activeCharacterId,
        setActiveCharacter,
    });

    // Effective listener position: DM test character when selected, else active creature
    const effectiveListenerPosition = useMemo(() => {
        if (isDMTestSelected) {
            return dmTestPosition;
        }
        return activeCharacterPosition;
    }, [isDMTestSelected, dmTestPosition, activeCharacterPosition]);

    // Spatial audio playback for sound sources
    useSpatialAudio({
        soundSources: visibleSoundSources,
        walls: encounterWalls,
        listenerPosition: effectiveListenerPosition,
        gridConfig,
        audioContext,
        isAudioUnlocked,
    });

    // ═══════════════════════════════════════════════════════════════════════════
    // 4.13 HANDLERS
    // Event handlers: useCallback (including callback refs)
    // ═══════════════════════════════════════════════════════════════════════════
    /**
     * Handle creature click for active character selection.
     * Only creatures (Characters and Creatures) can be selected as the listener.
     */
    const handleAssetClick = useCallback((assetId: string) => {
        const asset = visibleAssets.find(a => a.id === assetId);
        if (!asset) return;

        // Only allow selecting creatures (Characters and Creatures)
        const kind = asset.asset?.classification?.kind;
        if (kind === AssetKind.Character || kind === AssetKind.Creature) {
            // Toggle selection: click again to deselect
            if (isActiveCharacter(assetId)) {
                setActiveCharacter(null);
            } else {
                setActiveCharacter(assetId);
            }
        }
    }, [visibleAssets, isActiveCharacter, setActiveCharacter]);

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
    // 4.12 EFFECTS
    // Side effects: useEffect
    // ═══════════════════════════════════════════════════════════════════════════
    // Handle window resize to update canvas dimensions
    useEffect(() => {
        const handleResize = () => {
            setWindowSize({ width: window.innerWidth, height: window.innerHeight });
        };

        window.addEventListener('resize', handleResize);
        return () => window.removeEventListener('resize', handleResize);
    }, []);

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
                width={windowSize.width}
                height={windowSize.height}
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

                {/* GameWorld Layer - Walls, Light Sources */}
                <Layer name={LayerName.GameWorld} listening={false}>
                    {visibleWalls.map(wall => (
                        <WallRenderer
                            key={`wall-${wall.index}`}
                            encounterWall={wall}
                            activeScope={null}
                        />
                    ))}

                    {visibleLightSources.length > 0 && (
                        <Group name={GroupName.Structure} globalCompositeOperation="lighten">
                            {visibleLightSources.map((lightSource) => (
                                <LightSourceRenderer
                                    key={lightSource.id}
                                    encounterLightSource={lightSource}
                                    walls={encounter?.stage?.walls ?? []}
                                    gridConfig={gridConfig}
                                    activeScope={null}
                                    isSelected={false}
                                />
                            ))}
                        </Group>
                    )}
                </Layer>

                {/* EntityPlacement has its own Layer - must be a direct child of EncounterCanvas */}
                {encounter && (
                    <EntityPlacement
                        placedAssets={visibleAssets}
                        onAssetPlaced={() => {}}
                        onAssetMoved={() => {}}
                        onAssetDeleted={() => {}}
                        gridConfig={gridConfig}
                        draggedAsset={null}
                        onDragComplete={() => {}}
                        snapMode={SnapMode.Full}
                        encounter={encounter}
                        activeScope={null}
                        onAssetClick={handleAssetClick}
                    />
                )}

                {/* DMTools Layer - DM test character for testing player perspective */}
                {isDM && (
                    <Layer name={LayerName.DMTools} listening={true}>
                        <DMTestCharacter
                            position={dmTestPosition}
                            gridConfig={gridConfig}
                            isSelected={isDMTestSelected}
                            onDragEnd={setDMTestPosition}
                            onClick={selectDMTest}
                        />
                    </Layer>
                )}

            </EncounterCanvas>
        </Box>
    );
};
