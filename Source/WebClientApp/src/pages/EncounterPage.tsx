import { Box, Button, useTheme } from '@mui/material';
import ArrowBackIcon from '@mui/icons-material/ArrowBack';
import type React from 'react';
import { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import { Group, Layer } from 'react-konva';
import { useNavigate, useParams } from 'react-router-dom';
import { BackgroundLayer, EncounterCanvas, EntityPlacement, GridRenderer, type EncounterCanvasHandle } from '@/components/encounter';
import { DMTestCharacter } from '@/components/encounter/DMTestCharacter';
import { SelectionBorder, type SelectionVariant } from '@/components/encounter/konva/SelectionBorder';
import { LightSourceRenderer } from '@/components/encounter/rendering/SourceRenderer';
import { WallRenderer } from '@/components/encounter/rendering/WallRenderer';
import { ConfirmDialog } from '@/components/common/ConfirmDialog';
import { DEFAULT_BACKGROUNDS } from '@/config/defaults';
import { useAuth } from '@/hooks/useAuth';
import { useAudioUnlock } from '@/hooks/useAudioUnlock';
import {
    useActiveCharacter,
    useBackgroundMedia,
    useDMAssetSelection,
    useDMTestCharacter,
    getDMTestCharacterId,
    useEncounterLoadingState,
    useGridConfigSync,
    useKeyboardState,
    usePreviewModeAccess,
    useSpatialAudio,
} from '@/hooks/encounter';
import { useGetEncounterQuery, useRemoveEncounterAssetMutation, useUpdateEncounterAssetMutation } from '@/services/encounterApi';
import { GroupName, LayerName } from '@/services/layerManager';
import { type EncounterWall, type PlacedAsset, type PlacedLightSource, type PlacedSoundSource, type PlacedWall, SegmentState } from '@/types/domain';
import { hydrateGameElements, hydratePlacedLightSources, hydratePlacedSoundSources, hydratePlacedWalls } from '@/utils/encounterMappers';
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
 * - DM full selection capabilities (click, Ctrl+click, marquee)
 * - Keyboard actions (Delete, H for visibility, Escape to clear)
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

    const [removeEncounterAsset, { isLoading: isDeleting }] = useRemoveEncounterAssetMutation();
    const [updateEncounterAsset] = useUpdateEncounterAssetMutation();

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
    const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
    // Track asset positions during drag (for selection border to follow in real-time)
    const [draggingPositions, setDraggingPositions] = useState<Map<string, { x: number; y: number }>>(new Map());

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

        // For DM, show all assets (including hidden with reduced opacity)
        // For players, only show non-hidden
        return isDM ? hydratedAssets : hydratedAssets.filter(asset => !asset.isHidden);
    }, [encounter, encounterId, isDM]);

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

    /**
     * Get the DM test character ID for exclusion from selection.
     */
    const dmTestCharacterId = useMemo(
        () => getDMTestCharacterId(encounterId),
        [encounterId]
    );

    // ═══════════════════════════════════════════════════════════════════════════
    // 4.9b DOMAIN HOOKS (depends on derived state above)
    // These hooks require visibleAssets/visibleSoundSources/encounterWalls
    // ═══════════════════════════════════════════════════════════════════════════

    // Keyboard state for Ctrl modifier and key handlers
    const handleEscapeKey = useCallback(() => {
        // Will be connected to clearSelection below
    }, []);

    const { isCtrlPressed, assetSnapMode } = useKeyboardState({
        gridConfig,
        onEscapeKey: handleEscapeKey,
    });

    // DM asset selection state
    const {
        selectedAssetIds,
        handleAssetClick: handleSelectionClick,
        clearSelection,
        hasSelection,
    } = useDMAssetSelection({
        encounterId,
        isDM,
        excludeIds: [dmTestCharacterId],
        userId: user?.id,
        visibleAssets,
    });

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
        deselect: deselectDMTest,
    } = useDMTestCharacter({
        encounterId,
        isDM,
        gridConfig,
        stageSize,
        activeCharacterId,
        setActiveCharacter,
    });

    // Effective listener position: creature if selected, else DM test character (for DM)
    const effectiveListenerPosition = useMemo(() => {
        // If a creature is selected, use its position
        if (activeCharacterPosition) {
            return activeCharacterPosition;
        }
        // For DM, fall back to DM test character position
        if (isDM) {
            return dmTestPosition;
        }
        return null;
    }, [activeCharacterPosition, isDM, dmTestPosition]);

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
    // 4.11b DERIVED STATE (depends on domain hooks)
    // ═══════════════════════════════════════════════════════════════════════════

    /**
     * Get selection variant for an asset based on selection order.
     * First selected = anchor (teal), others = secondary (purple).
     * Single selection = primary (blue).
     */
    const getSelectionVariant = useCallback((assetId: string): SelectionVariant => {
        if (selectedAssetIds.length === 1) return 'primary';
        const index = selectedAssetIds.indexOf(assetId);
        return index === 0 ? 'anchor' : 'secondary';
    }, [selectedAssetIds]);

    /**
     * Selected assets with their details for rendering selection borders.
     */
    const selectedAssetsDetails = useMemo(() => {
        return selectedAssetIds
            .map(id => visibleAssets.find(a => a.id === id))
            .filter((a): a is PlacedAsset => a !== undefined);
    }, [selectedAssetIds, visibleAssets]);

    // ═══════════════════════════════════════════════════════════════════════════
    // 4.13 HANDLERS
    // Event handlers: useCallback (including callback refs)
    // ═══════════════════════════════════════════════════════════════════════════

    /**
     * Handle asset click for selection.
     * For DM: Select any asset.
     * For Players: Select only controlled assets.
     */
    const handleAssetClick = useCallback((assetId: string) => {
        // Deselect DM marker when selecting an asset
        deselectDMTest();

        // Handle selection
        handleSelectionClick(assetId, isCtrlPressed);

        // Also handle active character for audio listener (Characters only - they can "hear")
        const asset = visibleAssets.find(a => a.id === assetId);
        if (asset) {
            const kind = asset.asset?.classification?.kind;
            if (kind === 'Character') {
                if (isActiveCharacter(assetId)) {
                    setActiveCharacter(null);
                } else {
                    setActiveCharacter(assetId);
                }
            }
        }
    }, [deselectDMTest, handleSelectionClick, isCtrlPressed, visibleAssets, isActiveCharacter, setActiveCharacter]);

    /**
     * Handle delete request - open confirmation dialog.
     */
    const handleDeleteRequest = useCallback(() => {
        if (hasSelection && isDM) {
            setDeleteDialogOpen(true);
        }
    }, [hasSelection, isDM]);

    /**
     * Handle delete confirmation - delete all selected assets.
     * NOTE: Deletion disabled for safety during development.
     */
    const handleDeleteConfirm = useCallback(async () => {
        // TODO: Re-enable deletion when ready
        console.debug('[EncounterPage] Delete confirmed for', selectedAssetIds.length, 'assets - DISABLED for safety');

        clearSelection();
        setDeleteDialogOpen(false);
    }, [selectedAssetIds, clearSelection]);

    /**
     * Handle cancel delete.
     */
    const handleDeleteCancel = useCallback(() => {
        setDeleteDialogOpen(false);
    }, []);

    /**
     * Handle toggle visibility for selected assets.
     */
    const handleToggleVisibility = useCallback(async () => {
        if (!encounterId || !hasSelection || !isDM) return;

        for (const assetId of selectedAssetIds) {
            const asset = visibleAssets.find(a => a.id === assetId);
            if (asset) {
                try {
                    await updateEncounterAsset({
                        encounterId,
                        assetNumber: asset.index,
                        kind: asset.asset.classification.kind,
                        visible: asset.isHidden, // Toggle: if hidden, make visible; if visible, make hidden
                    }).unwrap();
                } catch (err) {
                    console.error('Failed to toggle visibility:', err);
                }
            }
        }
    }, [encounterId, hasSelection, isDM, selectedAssetIds, visibleAssets, updateEncounterAsset]);

    const handleExitToEditor = useCallback(() => {
        navigate(`/encounters/${encounterId}/edit`);
    }, [encounterId, navigate]);

    /**
     * Handle DM marker click - clears asset selection and selects DM marker.
     */
    const handleDMMarkerClick = useCallback(() => {
        clearSelection(); // Clear any selected assets
        selectDMTest(); // Select the DM marker
    }, [clearSelection, selectDMTest]);

    /**
     * Handle asset drag move - update local position for real-time selection border.
     */
    const handleAssetDrag = useCallback((assetId: string, position: { x: number; y: number }) => {
        setDraggingPositions(prev => new Map(prev).set(assetId, position));
    }, []);

    /**
     * Handle asset drag end - update position via API.
     * Note: draggingPositions is cleared by effect when selection changes.
     */
    const handleAssetDragEnd = useCallback(async (assetId: string, position: { x: number; y: number }) => {
        if (!encounterId || !isDM) return;

        const asset = visibleAssets.find(a => a.id === assetId);
        if (!asset) return;

        try {
            await updateEncounterAsset({
                encounterId,
                assetNumber: asset.index,
                kind: asset.asset.classification.kind,
                position,
            }).unwrap();
        } catch (err) {
            console.error('Failed to move asset:', err);
        }
    }, [encounterId, isDM, visibleAssets, updateEncounterAsset]);

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

    // Clear dragging positions when selection changes (prevents flicker on drop)
    useEffect(() => {
        if (draggingPositions.size === 0) return;

        // Only keep dragging positions for assets that are still selected
        setDraggingPositions(prev => {
            let changed = false;
            const next = new Map(prev);
            for (const assetId of prev.keys()) {
                if (!selectedAssetIds.includes(assetId)) {
                    next.delete(assetId);
                    changed = true;
                }
            }
            return changed ? next : prev;
        });
    }, [selectedAssetIds, draggingPositions.size]);

    // Handle window resize to update canvas dimensions
    useEffect(() => {
        const handleResize = () => {
            setWindowSize({ width: window.innerWidth, height: window.innerHeight });
        };

        window.addEventListener('resize', handleResize);
        return () => window.removeEventListener('resize', handleResize);
    }, []);

    // Keyboard shortcuts for selection actions
    useEffect(() => {
        const handleKeyDown = (e: KeyboardEvent) => {
            // Ignore if typing in input
            if (e.target instanceof HTMLInputElement || e.target instanceof HTMLTextAreaElement) {
                return;
            }

            // Only handle if DM
            if (!isDM) return;

            // Debug logging for keyboard shortcuts
            if (['Delete', 'Backspace', 'h', 'H', 'Escape'].includes(e.key)) {
                console.debug('[EncounterPage] Key pressed:', e.key, 'hasSelection:', hasSelection, 'selectedIds:', selectedAssetIds);
            }

            switch (e.key) {
                case 'Delete':
                case 'Backspace':
                    if (hasSelection) {
                        e.preventDefault();
                        console.debug('[EncounterPage] Delete requested for', selectedAssetIds.length, 'assets');
                        handleDeleteRequest();
                    }
                    break;
                case 'h':
                case 'H':
                    if (hasSelection) {
                        e.preventDefault();
                        console.debug('[EncounterPage] Toggle visibility for', selectedAssetIds.length, 'assets');
                        handleToggleVisibility();
                    }
                    break;
                case 'Escape':
                    if (hasSelection) {
                        e.preventDefault();
                        console.debug('[EncounterPage] Clearing selection');
                        clearSelection();
                    }
                    break;
            }
        };

        window.addEventListener('keydown', handleKeyDown);
        return () => window.removeEventListener('keydown', handleKeyDown);
    }, [isDM, hasSelection, selectedAssetIds, handleDeleteRequest, handleToggleVisibility, clearSelection]);

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
                            activeScope="all"
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
                                    activeScope="all"
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
                        snapMode={assetSnapMode}
                        encounter={encounter}
                        activeScope="all"
                        onAssetClick={handleAssetClick}
                        selectedAssetIds={selectedAssetIds}
                        onAssetDrag={handleAssetDrag}
                        onAssetDragEnd={handleAssetDragEnd}
                    />
                )}

                {/* Selection Layer - Selection borders and marquee (listening=false, just for rendering) */}
                {isDM && (
                    <Layer name={LayerName.SelectionHandles} listening={false}>
                        {/* Selection borders for selected assets */}
                        {selectedAssetsDetails.map(asset => {
                            // Use dragging position if asset is being dragged, otherwise use state position
                            const position = draggingPositions.get(asset.id) ?? asset.position;
                            return (
                                <SelectionBorder
                                    key={`sel-${asset.id}`}
                                    bounds={{
                                        x: position.x - asset.size.width / 2,
                                        y: position.y - asset.size.height / 2,
                                        width: asset.size.width,
                                        height: asset.size.height,
                                    }}
                                    scale={viewport.scale}
                                    variant={getSelectionVariant(asset.id)}
                                    showCornerHandles={selectedAssetIds.length === 1}
                                />
                            );
                        })}
                    </Layer>
                )}

                {/* DMTools Layer - DM test character for testing player perspective */}
                {isDM && (
                    <Layer name={LayerName.DMTools} listening={true}>
                        <DMTestCharacter
                            position={dmTestPosition}
                            gridConfig={gridConfig}
                            isSelected={isDMTestSelected}
                            onDragEnd={setDMTestPosition}
                            onClick={handleDMMarkerClick}
                        />
                    </Layer>
                )}

            </EncounterCanvas>

            {/* Delete Confirmation Dialog */}
            <ConfirmDialog
                open={deleteDialogOpen}
                onClose={handleDeleteCancel}
                onConfirm={handleDeleteConfirm}
                title="Delete Assets"
                message={`Are you sure you want to delete ${selectedAssetIds.length} selected asset${selectedAssetIds.length === 1 ? '' : 's'}? This action cannot be undone.`}
                confirmText="Delete"
                cancelText="Cancel"
                severity="error"
                isLoading={isDeleting}
            />
        </Box>
    );
};
