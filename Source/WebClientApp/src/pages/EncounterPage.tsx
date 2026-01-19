// React
import type React from 'react';
import { useCallback, useEffect, useMemo, useRef, useState } from 'react';

// External libraries
import { Box, Button, CircularProgress, Typography, useTheme } from '@mui/material';
import ArrowBackIcon from '@mui/icons-material/ArrowBack';
import { Group, Image as KonvaImage, Layer } from 'react-konva';
import { useNavigate, useParams } from 'react-router-dom';

// Aliases - components
import { BackgroundLayer, EncounterCanvas, GridRenderer, type EncounterCanvasHandle } from '@/components/encounter';
import { FogOfWarRenderer } from '@/components/encounter/rendering/FogOfWarRenderer';
import { LightSourceRenderer } from '@/components/encounter/rendering/SourceRenderer';
import { WallRenderer } from '@/components/encounter/rendering/WallRenderer';

// Aliases - config
import { DEFAULT_BACKGROUNDS } from '@/config/defaults';
import { getApiEndpoints } from '@/config/development';

// Aliases - hooks
import { useAssetImageLoader } from '@/hooks/useAssetImageLoader';
import { useAudioUnlock } from '@/hooks/useAudioUnlock';
import { usePositionalAudio } from '@/hooks/usePositionalAudio';

// Aliases - services
import { useGetEncounterQuery } from '@/services/encounterApi';
import { GroupName, LayerName } from '@/services/layerManager';

// Aliases - types
import {
    type EncounterWallSegment,
    type PlacedAsset,
    type PlacedLightSource,
    type PlacedRegion,
    type PlacedSoundSource,
    type PlacedWall,
    SegmentState,
    SegmentType,
} from '@/types/domain';

// Aliases - utils
import {
    hydrateGameElements,
    hydratePlacedLightSources,
    hydratePlacedRegions,
    hydratePlacedSoundSources,
    hydratePlacedWalls,
} from '@/utils/encounterMappers';
import { type GridConfig, GridType, getDefaultGrid } from '@/utils/gridCalculator';

// ═══════════════════════════════════════════════════════════════════════════
// CONSTANTS
// ═══════════════════════════════════════════════════════════════════════════

/** Slight transparency for placed assets to provide visual distinction from background */
const ASSET_DEFAULT_OPACITY = 0.9;

/** Default window dimensions for SSR or when window is unavailable */
const DEFAULT_WINDOW_SIZE = { width: 1920, height: 1080 };

/**
 * Safely extracts an error message from an unknown error object.
 */
const getErrorMessage = (error: unknown): string => {
    if (error && typeof error === 'object' && 'message' in error) {
        const msg = (error as { message: unknown }).message;
        return typeof msg === 'string' ? msg : 'An unexpected error occurred';
    }
    return 'An unexpected error occurred';
};

/**
 * Encounter Page - Player/DM preview view of an encounter.
 *
 * This page serves as the in-game view for encounters:
 * 1. DM Preview - DM can preview the encounter from the player's perspective
 * 2. Game Session - Players view this page during live gameplay (future)
 *
 * Key differences from EncounterEditorPage:
 * - Hidden entities (isHidden=true) are not rendered
 * - Secret walls are rendered as normal walls (players don't know they're secret)
 * - Hidden wall segments are not rendered
 * - Only active lights are rendered
 * - Positional audio system for encounter sounds
 * - No editing toolbars or controls
 */
export const EncounterPage: React.FC = () => {
    // ═══════════════════════════════════════════════════════════════════════════
    // 4.1 ROUTING
    // ═══════════════════════════════════════════════════════════════════════════
    const { encounterId } = useParams<{ encounterId: string }>();
    const navigate = useNavigate();

    // ═══════════════════════════════════════════════════════════════════════════
    // 4.2 THEME
    // ═══════════════════════════════════════════════════════════════════════════
    const theme = useTheme();

    // ═══════════════════════════════════════════════════════════════════════════
    // 4.3 QUERIES & MUTATIONS
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
    // 4.7 STATE
    // ═══════════════════════════════════════════════════════════════════════════
    const [viewport, setViewport] = useState({ x: 0, y: 0, scale: 1 });
    const [windowSize, setWindowSize] = useState(() =>
        typeof window !== 'undefined'
            ? { width: window.innerWidth, height: window.innerHeight }
            : DEFAULT_WINDOW_SIZE
    );
    const [gridConfig, setGridConfig] = useState<GridConfig>(getDefaultGrid());

    // ═══════════════════════════════════════════════════════════════════════════
    // 4.8 REFS
    // ═══════════════════════════════════════════════════════════════════════════
    const canvasRef = useRef<EncounterCanvasHandle>(null);

    // ═══════════════════════════════════════════════════════════════════════════
    // 4.9 DOMAIN HOOKS
    // ═══════════════════════════════════════════════════════════════════════════
    // Audio unlock state - unlocks on first user interaction
    const { isUnlocked: isAudioUnlocked, getAudioContext } = useAudioUnlock();

    // Positional audio for encounter sounds
    // TODO: Wire up updateListenerPosition when character selection is implemented
    const { playSound, stopSound, stopAllSounds } = usePositionalAudio({
        getAudioContext,
        isEnabled: isAudioUnlocked,
        walls: encounter?.stage?.walls ?? [],
        gridConfig,
    });

    // ═══════════════════════════════════════════════════════════════════════════
    // 4.11 DERIVED STATE
    // ═══════════════════════════════════════════════════════════════════════════

    // Background URL
    const backgroundUrl = useMemo(() => {
        if (encounter?.stage?.settings?.mainBackground) {
            return `${getApiEndpoints().media}/${encounter.stage.settings.mainBackground.id}`;
        }
        return undefined;
    }, [encounter]);

    const backgroundContentType = useMemo(
        () => encounter?.stage?.settings?.mainBackground?.contentType,
        [encounter?.stage?.settings?.mainBackground?.contentType]
    );

    // Hydrate placed entities from encounter data
    // eslint-disable-next-line react-hooks/preserve-manual-memoization -- intentional: only re-compute when walls/encounterId change
    const placedWalls = useMemo(() => {
        if (!encounter?.stage?.walls || !encounterId) return [];
        return hydratePlacedWalls(encounter.stage.walls, encounterId);
    }, [encounter?.stage?.walls, encounterId]);

    // eslint-disable-next-line react-hooks/preserve-manual-memoization -- intentional: only re-compute when lights/encounterId change
    const placedLightSources = useMemo(() => {
        if (!encounter?.stage?.lights || !encounterId) return [];
        return hydratePlacedLightSources(encounter.stage.lights, encounterId);
    }, [encounter?.stage?.lights, encounterId]);

    // eslint-disable-next-line react-hooks/preserve-manual-memoization -- intentional: only re-compute when sounds/encounterId change
    const placedSoundSources = useMemo((): PlacedSoundSource[] => {
        if (!encounter?.stage?.sounds || !encounterId) return [];
        return hydratePlacedSoundSources(encounter.stage.sounds, encounterId);
    }, [encounter?.stage?.sounds, encounterId]);

    // eslint-disable-next-line react-hooks/preserve-manual-memoization -- intentional: only re-compute when regions/encounterId change
    const placedRegions = useMemo(() => {
        if (!encounter?.stage?.regions || !encounterId) return [];
        return hydratePlacedRegions(encounter.stage.regions, encounterId);
    }, [encounter?.stage?.regions, encounterId]);

    // Hydrate game elements (actors, objects, effects)
    const placedAssets = useMemo((): PlacedAsset[] => {
        if (!encounter || !encounterId) return [];
        return hydrateGameElements(
            encounter.actors ?? [],
            encounter.objects ?? [],
            encounter.effects ?? [],
            encounterId,
        );
    }, [encounter, encounterId]);

    // Filter visible entities - hidden entities not shown in play mode
    const visibleAssets = useMemo((): PlacedAsset[] => {
        return placedAssets.filter((asset) => !asset.isHidden);
    }, [placedAssets]);

    // Load images for visible assets
    const assetImageCache = useAssetImageLoader({
        placedAssets: visibleAssets,
        draggedAsset: null,
    });

    // Filter walls for play mode visibility
    // - Hidden segments: not rendered
    // - Secret doors (unrevealed): rendered as normal walls
    const filteredWalls = useMemo((): PlacedWall[] => {
        return placedWalls.map((wall) => {
            const filteredSegments = wall.segments
                .filter((segment: EncounterWallSegment) => {
                    // Hidden segments (barriers marked as hidden) are not visible in play mode
                    if (segment.state === SegmentState.Secret && segment.type === SegmentType.Wall) {
                        // Hidden wall - not rendered
                        return false;
                    }
                    return true;
                })
                .map((segment: EncounterWallSegment) => {
                    // Secret doors are rendered as normal walls until revealed
                    if (segment.state === SegmentState.Secret && segment.type !== SegmentType.Wall) {
                        // Secret door/window - render as closed wall segment
                        return {
                            ...segment,
                            type: SegmentType.Wall,
                            state: SegmentState.Closed,
                        };
                    }
                    return segment;
                });

            return {
                ...wall,
                segments: filteredSegments,
            };
        }).filter((wall) => wall.segments.length > 0);
    }, [placedWalls]);

    // Filter lights - only show lights that are on
    const activeLights = useMemo((): PlacedLightSource[] => {
        return placedLightSources.filter((light) => light.isOn);
    }, [placedLightSources]);

    // Filter sounds - only play sounds that are marked as playing
    const activeSounds = useMemo((): PlacedSoundSource[] => {
        return placedSoundSources.filter((sound) => sound.isPlaying);
    }, [placedSoundSources]);

    // Filter regions for fog of war
    const fogOfWarRegions = useMemo((): PlacedRegion[] => {
        return placedRegions.filter((region) => region.type === 'FogOfWar');
    }, [placedRegions]);

    // ═══════════════════════════════════════════════════════════════════════════
    // 4.12 EFFECTS
    // ═══════════════════════════════════════════════════════════════════════════
    // Update grid config when encounter loads
    useEffect(() => {
        if (encounter?.stage?.grid) {
            const stageGrid = encounter.stage.grid;
            const gridType = typeof stageGrid.type === 'string'
                ? GridType[stageGrid.type as keyof typeof GridType]
                : stageGrid.type;
            // eslint-disable-next-line react-hooks/set-state-in-effect -- Valid pattern: hydrate grid config from server data
            setGridConfig({
                type: gridType,
                cellSize: stageGrid.cellSize,
                offset: stageGrid.offset,
                snap: gridType !== GridType.NoGrid,
                scale: stageGrid.scale ?? 1,
            });
        }
    }, [encounter]);

    // Handle window resize for fullscreen support (F11)
    useEffect(() => {
        const handleResize = () => {
            setWindowSize({ width: window.innerWidth, height: window.innerHeight });
        };

        window.addEventListener('resize', handleResize);
        return () => window.removeEventListener('resize', handleResize);
    }, []);

    // Cleanup sounds on unmount
    useEffect(() => {
        return () => {
            stopAllSounds();
        };
    }, [stopAllSounds]);

    // Play ambient sound when audio is unlocked
    useEffect(() => {
        if (!isAudioUnlocked || !encounter?.stage?.settings?.ambientSound) return;

        const ambientSound = encounter.stage.settings.ambientSound;
        if (ambientSound?.id) {
            const soundUrl = `${getApiEndpoints().media}/${ambientSound.id}`;
            playSound(soundUrl, {
                isAmbient: true,
                volume: ambientSound.volume ?? 1.0,
                loop: true,
            });
        }
    }, [isAudioUnlocked, encounter?.stage?.settings?.ambientSound, playSound]);

    // Play positional encounter sounds when audio is unlocked
    // Note: Currently plays at configured volume. Distance-based attenuation
    // will be implemented when character selection is added (listener position).
    useEffect(() => {
        if (!isAudioUnlocked || activeSounds.length === 0) return;

        const soundUrls: string[] = [];
        activeSounds.forEach((sound) => {
            if (sound.media?.id) {
                const soundUrl = `${getApiEndpoints().media}/${sound.media.id}`;
                soundUrls.push(soundUrl);
                playSound(soundUrl, {
                    isAmbient: false,
                    volume: sound.volume,
                    loop: sound.loop,
                    position: sound.position,
                    range: sound.radius,
                });
            }
        });

        // Cleanup: stop sounds started in this effect when dependencies change or unmount
        return () => {
            soundUrls.forEach((url) => stopSound(url));
        };
    }, [isAudioUnlocked, activeSounds, playSound, stopSound]);

    // ═══════════════════════════════════════════════════════════════════════════
    // 4.13 HANDLERS
    // ═══════════════════════════════════════════════════════════════════════════
    const handleExitToEditor = useCallback(() => {
        navigate(`/encounters/${encounterId}/edit`);
    }, [encounterId, navigate]);

    // Handle background image loaded - center the view on the background (with saved offset if available)
    const handleBackgroundImageLoaded = useCallback((dimensions: { width: number; height: number }) => {
        // Don't update stageSize here - keep window size for proper fullscreen support
        // The background will be centered within the viewport

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

    // ═══════════════════════════════════════════════════════════════════════════
    // 4.14 RENDER
    // ═══════════════════════════════════════════════════════════════════════════

    // Loading state
    if (isLoading) {
        return (
            <Box
                id="encounter-loading-state"
                sx={{
                    display: 'flex',
                    flexDirection: 'column',
                    alignItems: 'center',
                    justifyContent: 'center',
                    height: '100vh',
                    bgcolor: 'background.default',
                }}
            >
                <CircularProgress id="encounter-loading-spinner" size={60} />
                <Typography id="encounter-loading-text" variant="h6" sx={{ mt: 2, color: 'text.secondary' }}>
                    Loading encounter...
                </Typography>
            </Box>
        );
    }

    // Error state
    if (isError || !encounter) {
        return (
            <Box
                id="encounter-error-state"
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
                <Typography id="encounter-error-title" variant="h5" color="error" sx={{ mb: 2 }}>
                    Failed to load encounter
                </Typography>
                <Typography id="encounter-error-message" variant="body1" sx={{ mb: 3, color: 'text.secondary' }}>
                    {getErrorMessage(error)}
                </Typography>
                <Button id="btn-go-back" variant="contained" onClick={() => navigate(-1)}>
                    Go Back
                </Button>
            </Box>
        );
    }

    return (
        <Box
            sx={{
                display: 'flex',
                flexDirection: 'column',
                height: '100vh',
                overflow: 'hidden',
                bgcolor: 'background.default',
            }}
        >
            {/* Canvas Container - flex child that fills remaining space */}
            <Box
                sx={{
                    position: 'relative',
                    flexGrow: 1,
                    width: '100%',
                    height: '100%',
                    overflow: 'hidden',
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

                {/* Main Canvas - key forces remount on resize because Konva Stage
                    cannot dynamically resize canvas dimensions without visual artifacts */}
                <EncounterCanvas
                    key={`canvas-${windowSize.width}-${windowSize.height}`}
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
                        stageWidth={windowSize.width}
                        stageHeight={windowSize.height}
                        onImageLoaded={handleBackgroundImageLoaded}
                        {...(backgroundContentType && { contentType: backgroundContentType })}
                        muted={!isAudioUnlocked}
                    />

                    <GridRenderer
                        grid={gridConfig}
                        stageWidth={windowSize.width}
                        stageHeight={windowSize.height}
                        visible={gridConfig.type !== GridType.NoGrid}
                    />
                </Layer>

                {/* Game World Layer - Walls, Lights, Entities */}
                <Layer name={LayerName.GameWorld} listening={false}>
                    {/* Lights Layer - Only active lights */}
                    {activeLights.length > 0 && (
                        <Group name={GroupName.Structure} globalCompositeOperation="lighten">
                            {activeLights.map((lightSource) => (
                                <LightSourceRenderer
                                    key={lightSource.id}
                                    encounterLightSource={lightSource}
                                    walls={encounter.stage.walls ?? []}
                                    gridConfig={gridConfig}
                                    activeScope={null}
                                    isSelected={false}
                                />
                            ))}
                        </Group>
                    )}

                    {/* Walls Layer - Filtered for play mode visibility */}
                    {filteredWalls.length > 0 && (
                        <Group name={GroupName.Structure}>
                            {filteredWalls.map((wall) => (
                                <WallRenderer
                                    key={wall.id}
                                    encounterWall={wall}
                                    activeScope={null}
                                />
                            ))}
                        </Group>
                    )}

                    {/* Entities Layer - Visible assets only (hidden filtered out) */}
                    {visibleAssets.length > 0 && assetImageCache && (
                        <Group name={GroupName.Characters}>
                            {visibleAssets.map((asset) => {
                                const image = assetImageCache.get(asset.assetId);
                                if (!image) return null;
                                return (
                                    <KonvaImage
                                        key={asset.id}
                                        id={asset.id}
                                        image={image}
                                        x={asset.position.x}
                                        y={asset.position.y}
                                        offsetX={asset.size.width / 2}
                                        offsetY={asset.size.height / 2}
                                        width={asset.size.width}
                                        height={asset.size.height}
                                        rotation={asset.rotation}
                                        listening={false}
                                        opacity={ASSET_DEFAULT_OPACITY}
                                    />
                                );
                            })}
                        </Group>
                    )}
                </Layer>

                {/* Fog of War Layer */}
                {fogOfWarRegions.length > 0 && encounterId && (
                    <Layer name={LayerName.FogOfWar} listening={false}>
                        <FogOfWarRenderer
                            encounterId={encounterId}
                            regions={fogOfWarRegions}
                            visible={true}
                        />
                    </Layer>
                )}
            </EncounterCanvas>
            </Box>
        </Box>
    );
};
