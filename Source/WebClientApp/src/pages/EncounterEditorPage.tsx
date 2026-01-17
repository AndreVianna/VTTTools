import { EditingBlocker } from '@components/common';
import {
  BackgroundLayer,
  type DrawingMode,
  EditorDialogs,
  EditorStatusBar,
  EncounterCanvas,
  type EncounterCanvasHandle,
  FogOfWarRenderer,
  GridRenderer,
  type LayerVisibilityType,
  LeftToolBar,
  LightSourceRenderer,
  RegionBucketFillTool,
  RegionDrawingTool,
  RegionRenderer,
  RegionTransformer,
  type SelectionCategory,
  SourceDrawingTool,
  TokenDragHandle,
  TopToolBar,
  WallDrawingTool,
  WallRenderer,
  WallTransformer,
} from '@components/encounter';
import type { LightPlacementProperties, SoundPlacementProperties } from '@components/encounter/panels';
import { EntityPlacement } from '@/components/encounter/EntityPlacement';
import { SoundSourceRenderer } from '@components/encounter';
import { SourceContextMenus } from './EncounterEditor/components';
import { EditorLayout } from '@components/layout';
import { Alert, Box, CircularProgress, Typography, useTheme } from '@mui/material';
import { GroupName, LayerName, layerManager } from '@services/layerManager';
import { type GridConfig, GridType, getDefaultGrid } from '@utils/gridCalculator';
import { sortRegionsForRendering } from '@utils/regionColorUtils';
import type { InteractionScope } from '@utils/scopeFiltering';
import type Konva from 'konva';
import React, { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import { Group, Layer } from 'react-konva';
import { useNavigate, useParams } from 'react-router-dom';
import type { SaveStatus } from '@/components/common';
import { DEFAULT_BACKGROUNDS } from '@/config/defaults';
import { getApiEndpoints } from '@/config/development';
import { ClipboardProvider } from '@/contexts/ClipboardContext';
import { UndoRedoProvider } from '@/contexts/UndoRedoContext';
import { useClipboard } from '@/contexts/useClipboard';
import { useConnectionStatus } from '@/hooks/useConnectionStatus';
import { useRegionTransaction } from '@/hooks/useRegionTransaction';
import { useSessionState } from '@/hooks/useSessionState';
import { useUndoRedoContext } from '@/hooks/useUndoRedo';
import { useWallTransaction } from '@/hooks/useWallTransaction';
import { useMediaHub } from '@/hooks/useMediaHub';
import {
  useAddEncounterAssetMutation,
  useBulkAddEncounterAssetsMutation,
  useBulkDeleteEncounterAssetsMutation,
  useBulkUpdateEncounterAssetsMutation,
  useGetEncounterQuery,
  usePatchEncounterMutation,
  useRemoveEncounterAssetMutation,
  useUpdateEncounterAssetMutation,
} from '@/services/encounterApi';
import {
  useAddLightMutation,
  useAddRegionMutation,
  useAddSoundMutation,
  useDeleteLightMutation,
  useDeleteRegionMutation,
  useDeleteSoundMutation,
  useUpdateLightMutation,
  useUpdateRegionMutation,
  useUpdateSoundMutation,
} from '@/services/stageApi';
import { useUploadFileMutation } from '@/services/mediaApi';
import { useAppDispatch } from '@/store';
import {
  AssetKind,
  type Encounter,
  type EncounterWall,
  type MediaResource,
  type PlacedAsset,
  type PlacedRegion,
  type PlacedWall,
  type Point,
  type Pole,
  type PlacedLightSource,
  type PlacedSoundSource,
  type EncounterLightSource,
  type UpdateEncounterRequest,
  RegionType,
  SegmentState,
  SegmentType,
} from '@/types/domain';
import { AmbientSoundSource } from '@/types/stage';
import { toRegionType } from '@/utils/encounter';

import type { LocalAction } from '@/types/regionUndoActions';
import {
  getBucketMinusCursor,
  getBucketPlusCursor,
  getCrosshairMinusCursor,
  getCrosshairPlusCursor,
} from '@/utils/customCursors';
import {
  hydrateGameElements,
  hydratePlacedRegions,
  hydratePlacedLightSources,
  hydratePlacedSoundSources,
  hydratePlacedWalls,
} from '@/utils/encounterMappers';
import {
  updateRegionOptimistic,
  updateWallOptimistic,
} from '@/utils/encounterStateUtils';
import { polesToSegments, isWallClosed } from '@/utils/wallUtils';
import { segmentsToPoles } from '@/utils/wallSegmentUtils';
import { createStructureHandlers, createCanvasHandlers } from './EncounterEditor/handlers';
import {
  useAssetManagement,
  useCanvasReadyState,
  useContextMenus,
  useEncounterEditor,
  useEncounterSettings,
  useFogOfWarManagement,
  useGridHandlers,
  useKeyboardShortcuts,
  useKeyboardState,
  useLayerVisibility,
  useMediaManagement,
  useRegionHandlers,
  useSaveChanges,
  useSourceSelection,
  useVideoControls,
  useViewportControls,
  useWallHandlers,
} from '@/hooks/encounter';

const DEFAULT_STAGE_WIDTH = 2800;
const DEFAULT_STAGE_HEIGHT = 2100;

const EncounterEditorPageInternal: React.FC = () => {
  const theme = useTheme();
  const navigate = useNavigate();
  const { encounterId } = useParams<{ encounterId: string }>();
  const canvasRef = useRef<EncounterCanvasHandle>(null);
  const [stage, setStage] = useState<Konva.Stage | null>(null);
  const stageRefObject = useRef<Konva.Stage | null>(null);

  const stageCallbackRef = useCallback((node: Konva.Stage | null) => {
    if (node) {
      if (stageRefObject.current !== node) {
        stageRefObject.current = node;
        setStage(node);
        layerManager.initialize(node);
        layerManager.enforceZOrder();
      }
    } else {
      if (stageRefObject.current !== null) {
        stageRefObject.current = null;
        setStage(null);
      }
    }
  }, []);
  const { execute, recordAction, undo, redo } = useUndoRedoContext();
  const { copyAssets, cutAssets, clipboard, canPaste, getClipboardAssets, clearClipboard } = useClipboard();
  const { isOnline } = useConnectionStatus();
  const wallTransaction = useWallTransaction();
  const regionTransaction = useRegionTransaction();
  const {
    data: encounterData,
    isLoading: isLoadingEncounter,
    error: encounterError,
    refetch,
  } = useGetEncounterQuery(encounterId || '', {
    skip: !encounterId || encounterId === 'new',
  });
  const [patchEncounter] = usePatchEncounterMutation();
  const [uploadFile] = useUploadFileMutation();
  const {
    isVideoAudioMuted,
    isVideoPlaying,
    handleAudioMuteToggle,
    handleVideoPlayPauseToggle,
  } = useVideoControls();
  const [addEncounterAsset] = useAddEncounterAssetMutation();
  const [updateEncounterAsset] = useUpdateEncounterAssetMutation();
  const [bulkUpdateEncounterAssets] = useBulkUpdateEncounterAssetsMutation();
  const [removeEncounterAsset] = useRemoveEncounterAssetMutation();
  const [bulkDeleteEncounterAssets] = useBulkDeleteEncounterAssetsMutation();
  const [bulkAddEncounterAssets] = useBulkAddEncounterAssetsMutation();

  // Stage API mutations (via useEncounterEditor)
  const {
    addWall: stageAddWall,
    updateWall: stageUpdateWall,
    deleteWall: stageDeleteWall,
    updateStageSettings,
  } = useEncounterEditor({
    encounterId: encounterId ?? '',
    skip: !encounterId,
  });

  // Wall mutations object for useWallHandlers
  const wallMutations = useMemo(() => ({
    addWall: stageAddWall,
    updateWall: stageUpdateWall,
    deleteWall: stageDeleteWall,
  }), [stageAddWall, stageUpdateWall, stageDeleteWall]);

  const [addRegion] = useAddRegionMutation();
  const [updateRegion] = useUpdateRegionMutation();
  const [deleteRegion] = useDeleteRegionMutation();

  const [addLight] = useAddLightMutation();
  const [updateLight] = useUpdateLightMutation();
  const [deleteLight] = useDeleteLightMutation();

  const [addSound] = useAddSoundMutation();
  const [updateSound] = useUpdateSoundMutation();
  const [deleteSound] = useDeleteSoundMutation();

  // Track resources being processed for media hub subscriptions
  const subscribedResourcesRef = useRef<Set<string>>(new Set());

  // Media hub for real-time resource updates
  // Backend now just notifies when a resource is updated - no status to check
  const { connect: connectMediaHub, subscribeToResource, isConnected: isMediaHubConnected } = useMediaHub({
    onResourceUpdated: useCallback((event) => {
      // Resource was updated - unsubscribe and refetch to get latest data
      subscribedResourcesRef.current.delete(event.resourceId);
      refetch();
    }, [refetch]),
    autoConnect: false,
  });

  // Connect to media hub when component mounts
  useEffect(() => {
    let cancelled = false;
    const timeoutId = setTimeout(() => {
      if (!cancelled) {
        connectMediaHub().catch(() => {});
      }
    }, 100);

    return () => {
      cancelled = true;
      clearTimeout(timeoutId);
    };
  }, [connectMediaHub]);

  // Media management hook for background/sound uploads
  const {
    isUploadingBackground,
    isUploadingAlternateBackground,
    isUploadingAmbientSound,
    handleBackgroundUpload,
    handleBackgroundRemove,
    handleBackgroundSelect,
    handleAlternateBackgroundUpload,
    handleAlternateBackgroundRemove,
    handleAlternateBackgroundSelect,
    handleUseAlternateBackgroundChange,
    handleAmbientSoundUpload,
    handleAmbientSoundRemove,
    handleAmbientSoundSelect,
    handleAmbientSoundSourceChange,
  } = useMediaManagement({
    encounterId: encounterId || '',
    uploadFile,
    updateStageSettings,
    refetch: async () => { await refetch(); },
    isMediaHubConnected,
    subscribeToResource,
  });

  useEffect(() => {
    if (encounterId) {
      refetch();
    }
  }, [encounterId, refetch]);

  const [isInitialized, setIsInitialized] = useState(false);
  const [encounter, setEncounter] = useState<Encounter | null>(null);
  const encounterRef = useRef<Encounter | null>(null);
  const [placedWalls, setPlacedWalls] = useState<PlacedWall[]>([]);
  const [placedRegions, setPlacedRegions] = useState<PlacedRegion[]>([]);
  const [placedLightSources, setPlacedLightSources] = useState<PlacedLightSource[]>([]);
  const [placedSoundSources, setPlacedSoundSources] = useState<PlacedSoundSource[]>([]);

  useEffect(() => {
    encounterRef.current = encounter;
  }, [encounter]);

  // Subscribe to updates for background resources
  // Backend handles placeholder/error fallback automatically via the resource path
  useEffect(() => {
    const mainBackground = encounter?.stage?.settings?.mainBackground;
    if (!mainBackground || !isMediaHubConnected) return;

    const { id } = mainBackground;

    // Subscribe to updates if not already subscribed
    if (id && !subscribedResourcesRef.current.has(id)) {
      subscribedResourcesRef.current.add(id);
      subscribeToResource(id).catch(() => {
        // Subscription errors handled by the hook
      });
    }
  }, [encounter?.stage?.settings?.mainBackground, isMediaHubConnected, subscribeToResource]);

  const [gridConfig, setGridConfig] = useState<GridConfig>(getDefaultGrid());
  const [stageSize, setStageSize] = useState({ width: DEFAULT_STAGE_WIDTH, height: DEFAULT_STAGE_HEIGHT });

  const backgroundSize = encounter?.stage?.settings?.mainBackground?.dimensions;

  useEffect(() => {
    const hasValidBackgroundSize = backgroundSize && backgroundSize.width > 0 && backgroundSize.height > 0;
    if (hasValidBackgroundSize) {
      setStageSize({ width: backgroundSize.width, height: backgroundSize.height });
    } else {
      setStageSize({ width: DEFAULT_STAGE_WIDTH, height: DEFAULT_STAGE_HEIGHT });
    }
  }, [backgroundSize]);

  // Track if we've loaded dimensions from the actual image (fallback when encounter doesn't have stored dimensions)
  const [imageDimensionsLoaded, setImageDimensionsLoaded] = useState(false);

  // Reset imageDimensionsLoaded when navigating to a different encounter
  useEffect(() => {
    setImageDimensionsLoaded(false);
  }, [encounterId]);

  const handleBackgroundImageLoaded = useCallback((dimensions: { width: number; height: number }) => {
    // Update stage size from actual image dimensions if encounter doesn't have them stored
    if (!backgroundSize || backgroundSize.width === 0 || backgroundSize.height === 0) {
      setStageSize(dimensions);
      setImageDimensionsLoaded(true);
    }
  }, [backgroundSize]);

  const initialViewport = {
    x: (window.innerWidth - DEFAULT_STAGE_WIDTH) / 2,
    y: (window.innerHeight - DEFAULT_STAGE_HEIGHT) / 2,
    scale: 1,
  };
  const [_isHydrating, setIsHydrating] = useState(false);
  const [saveStatus, setSaveStatus] = useState<SaveStatus>('idle');
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [isStartingViewLoading, setIsStartingViewLoading] = useState(false);
  const [selectedWallIndex, setSelectedWallIndex] = useSessionState<number | null>({ key: 'selectedWallIndex', defaultValue: null, encounterId });
  const [selectedWallIndices, setSelectedWallIndices] = useState<number[]>([]);
  const [drawingWallIndex, setDrawingWallIndex] = useState<number | null>(null);
  const [drawingWallDefaultHeight, setDrawingWallDefaultHeight] = useState<number>(10);
  const [drawingWallSegmentType, setDrawingWallSegmentType] = useState<SegmentType>(SegmentType.Wall);
  const [drawingWallIsOpaque, setDrawingWallIsOpaque] = useState<boolean>(true);
  const [drawingWallState, setDrawingWallState] = useState<SegmentState>(SegmentState.Visible);
  const [isEditingVertices, setIsEditingVertices] = useState(false);
  const [originalWallPoles, setOriginalWallPoles] = useState<Pole[] | null>(null);
  const previewWallPolesRef = useRef<Pole[] | null>(null);
  const [, forcePreviewUpdate] = useState(0);

  const [selectedRegionIndex, setSelectedRegionIndex] = useSessionState<number | null>({ key: 'selectedRegionIndex', defaultValue: null, encounterId });
  const [selectedRegionIndices, setSelectedRegionIndices] = useState<number[]>([]);
  const [drawingRegionIndex, setDrawingRegionIndex] = useState<number | null>(null);
  const [editingRegionIndex, setEditingRegionIndex] = useState<number | null>(null);
  const [isEditingRegionVertices, setIsEditingRegionVertices] = useState(false);
  const [originalRegionVertices, setOriginalRegionVertices] = useState<Point[] | null>(null);
  const [regionPlacementMode, setRegionPlacementMode] = useState<'polygon' | 'bucketFill' | null>(null);

  const [selectedLightSourceIndex, setSelectedLightSourceIndex] = useSessionState<number | null>({ key: 'selectedLightSourceIndex', defaultValue: null, encounterId });
  const [selectedLightSourceIndices, setSelectedLightSourceIndices] = useState<number[]>([]);
  const [selectedSoundSourceIndex, setSelectedSoundSourceIndex] = useSessionState<number | null>({ key: 'selectedSoundSourceIndex', defaultValue: null, encounterId });
  const [selectedSoundSourceIndices, setSelectedSoundSourceIndices] = useState<number[]>([]);

  const [activeScope, setActiveScope] = useSessionState<InteractionScope>({ key: 'activeScope', defaultValue: null, encounterId });

  const {
    scopeVisibility,
    handleLayerVisibilityToggle,
    handleShowAllLayers,
    handleHideAllLayers,
  } = useLayerVisibility({
    currentGridType: gridConfig.type,
    onGridTypeChange: (type) => setGridConfig((prev) => ({ ...prev, type })),
  });

  const {
    fogMode,
    fogDrawingTool,
    fogDrawingVertices,
    setFogDrawingTool,
    fowRegions,
    handleFogModeChange,
    handleFogDrawPolygon,
    handleFogBucketFill,
    handleFogHideAll,
    handleFogRevealAll,
    handlePolygonComplete,
    handleBucketFillComplete,
  } = useFogOfWarManagement({
    encounterId: encounterId || '',
    placedRegions,
    stageSize,
    setPlacedRegions,
    setEncounter,
    setErrorMessage,
    refetch: async () => {
      const result = await refetch();
      return { data: result.data };
    },
    execute,
    addRegion,
    deleteRegion,
  });

  // Source selection hook - manages light/sound selection, placement, context menus, updates
  const {
    lightContextMenuPosition,
    soundContextMenuPosition,
    sourcePlacementProperties,
    activeTool,
    handleLightSourceSelect,
    handleSoundSourceSelect,
    handleLightSourceDelete,
    handleSoundSourceDelete,
    handlePlaceLight,
    handlePlaceSound,
    handleSourcePlacementFinish,
    handleLightSourceContextMenu,
    handleSoundSourceContextMenu,
    handleLightContextMenuClose,
    handleSoundContextMenuClose,
    handleLightSourceUpdate,
    handleLightSourcePositionChange,
    handleLightSourceDirectionChange,
    handleSoundSourceUpdate,
    handleSoundSourcePositionChange,
  } = useSourceSelection({
    encounterId,
    placedLightSources,
    placedSoundSources,
    selectedLightSourceIndex,
    selectedSoundSourceIndex,
    setSelectedLightSourceIndex,
    setSelectedSoundSourceIndex,
    execute,
    refetch,
    addLight,
    deleteLight,
    updateLight,
    addSound,
    deleteSound,
    updateSound,
  });

  const [activePanel, setActivePanel] = useState<string | null>(() => activeScope);
  const [assetPickerOpen, setAssetPickerOpen] = useState<{
    open: boolean;
    kind?: AssetKind;
  }>({ open: false });
  const [soundPickerOpen, setSoundPickerOpen] = useState(false);

  const drawingMode: DrawingMode =
    activeScope === 'walls'
      ? 'wall'
      : activeScope === 'regions' && regionPlacementMode === 'polygon'
        ? 'region'
        : activeScope === 'regions' && regionPlacementMode === 'bucketFill'
          ? 'bucketFill'
          : activeScope === 'lights'
            ? 'light'
            : activeScope === 'sounds'
              ? 'sound'
              : null;

  const setPreviewWallPoles = useCallback((poles: Pole[] | null) => {
    previewWallPolesRef.current = poles;
    forcePreviewUpdate((c) => c + 1);
  }, []);

  const { saveChanges } = useSaveChanges({
    encounterId,
    encounter,
    isInitialized,
    gridConfig,
    patchEncounter,
    refetch: async () => { await refetch(); },
    setSaveStatus,
    setEncounter,
  });

  const encounterSettings = useEncounterSettings({
    encounterId,
    encounter,
    setEncounter,
    saveChanges,
  });

  const gridHandlers = useGridHandlers({
    setGridConfig,
    saveChanges,
  });

  const wallHandlers = useWallHandlers({
    encounterId,
    encounter,
    wallTransaction,
    selectedWallIndex,
    drawingMode: drawingMode === 'light' || drawingMode === 'sound' ? null : drawingMode,
    drawingWallIndex,
    wallMutations,
    setEncounter,
    setPlacedWalls,
    setSelectedWallIndex,
    setSelectedOpeningIndex: () => { },
    setDrawingWallIndex,
    setIsEditingVertices,
    setOriginalWallPoles,
    setPreviewWallPoles,
    setActivePanel,
    setErrorMessage,
    execute,
    refetch: async () => {
      const result = await refetch();
      return result.data ? { data: result.data } : {};
    },
  });

  // Wrap stage API mutations to match the expected function signatures for useRegionHandlers
  const regionMutations = useMemo(() => ({
    addRegion: async (data: Parameters<typeof addRegion>[0]['data']) => {
      if (!encounterId) throw new Error('No encounter ID');
      await addRegion({ stageId: encounterId, data }).unwrap();
    },
    updateRegion: async (index: number, data: Parameters<typeof updateRegion>[0]['data']) => {
      if (!encounterId) throw new Error('No encounter ID');
      await updateRegion({ stageId: encounterId, index, data }).unwrap();
    },
    deleteRegion: async (index: number) => {
      if (!encounterId) throw new Error('No encounter ID');
      await deleteRegion({ stageId: encounterId, index }).unwrap();
    },
  }), [encounterId, addRegion, updateRegion, deleteRegion]);

  const regionHandlers = useRegionHandlers({
    encounterId,
    encounter,
    regionTransaction,
    gridConfig,
    selectedRegionIndex,
    editingRegionIndex,
    originalRegionVertices,
    drawingMode: drawingMode === 'light' || drawingMode === 'sound' ? null : drawingMode,
    drawingRegionIndex,
    addRegion: regionMutations.addRegion,
    updateRegion: regionMutations.updateRegion,
    deleteRegion: regionMutations.deleteRegion,
    setEncounter,
    setPlacedRegions,
    setSelectedRegionIndex,
    setEditingRegionIndex,
    setIsEditingRegionVertices,
    setOriginalRegionVertices,
    setDrawingRegionIndex,
    setRegionPlacementMode,
    setErrorMessage,
    recordAction,
    refetch: async () => {
      const result = await refetch();
      return result.data ? { data: result.data } : {};
    },
  });

  const isDrawingWall = drawingMode === 'wall' && drawingWallIndex !== null;
  const isDrawingRegion = drawingMode === 'region' && drawingRegionIndex !== null;
  const isDrawingBucketFill = drawingMode === 'bucketFill' && drawingRegionIndex !== null;
  const isUsingDrawingTool = isDrawingWall || isDrawingRegion || isDrawingBucketFill || fogDrawingTool !== null;

  const keyboardState = useKeyboardState({
    gridConfig,
    ...(!isUsingDrawingTool && {
      onEscapeKey: () => {
        if (isEditingVertices && wallTransaction.transaction.isActive) {
          wallHandlers.handleCancelEditing();
        } else if (assetManagement?.draggedAsset) {
          assetManagement.setDraggedAsset(null);
        } else if (activeScope !== null) {
          setActiveScope(null);
        }
      },
      onEnterKey: () => {
        if (isEditingVertices && wallTransaction.transaction.isActive) {
          wallHandlers.handleFinishEditing();
        }
      },
    }),
  });

  const canvasReadyState = useCanvasReadyState({
    stage,
  });

  // Determine effective background size for centering - use actual backgroundSize, or fallback to stageSize after image loads
  const effectiveBackgroundSize = backgroundSize ?? (imageDimensionsLoaded ? stageSize : undefined);

  // Get saved starting view from stage settings (panning is offset from center)
  const savedStartingView = useMemo(() => {
    const settings = encounter?.stage?.settings;
    if (!settings) return undefined;
    // Only consider it a "saved" view if either zoomLevel or panning differs from defaults
    const hasNonDefaultZoom = settings.zoomLevel !== 1;
    const hasNonDefaultPanning = settings.panning?.x !== 0 || settings.panning?.y !== 0;
    if (!hasNonDefaultZoom && !hasNonDefaultPanning) return undefined;
    return {
      zoomLevel: settings.zoomLevel,
      panning: settings.panning,
    };
  }, [encounter?.stage?.settings]);

  const viewportControls = useViewportControls({
    initialViewport,
    canvasRef: canvasRef as React.RefObject<EncounterCanvasHandle>,
    stageSize,
    encounterId,
    // Pass backgroundSize directly for centering calculation to avoid timing issues with stageSize state
    ...(effectiveBackgroundSize && { backgroundSize: effectiveBackgroundSize }),
    savedStartingView,
  });

  const contextMenus = useContextMenus({
    encounter,
  });

  const dispatch = useAppDispatch();

  const assetManagement = useAssetManagement({
    encounterId,
    encounter,
    isOnline,
    setEncounter,
    execute,
    dispatch,
    copyAssets,
    cutAssets,
    canPaste,
    getClipboardAssets,
    clipboard: clipboard.operation ? { operation: clipboard.operation } : {},
    clearClipboard,
    addEncounterAsset,
    updateEncounterAsset,
    bulkUpdateEncounterAssets,
    removeEncounterAsset,
    bulkDeleteEncounterAssets,
    bulkAddEncounterAssets,
    refetch: async () => {
      const result = await refetch();
      return result.data ? { data: result.data } : {};
    },
  });

  const setPlacedAssetsRef = useRef(assetManagement.setPlacedAssets);
  setPlacedAssetsRef.current = assetManagement.setPlacedAssets;

  const assetsLoadedForEncounterRef = useRef<string | null>(null);

  useEffect(() => {
    if (!encounterData || isInitialized) return;

    const hydratedWalls = hydratePlacedWalls(encounterData.stage.walls || [], encounterId || '');
    const hydratedRegions = hydratePlacedRegions(encounterData.stage.regions || [], encounterId || '');
    const hydratedLightSources = hydratePlacedLightSources(encounterData.stage.lights || [], encounterId || '');
    const hydratedSoundSources = hydratePlacedSoundSources(encounterData.stage.sounds || [], encounterId || '');

    setEncounter(encounterData);
    const gridType = typeof encounterData.stage.grid.type === 'string'
      ? GridType[encounterData.stage.grid.type as keyof typeof GridType]
      : encounterData.stage.grid.type;
    setGridConfig({
      type: gridType,
      cellSize: encounterData.stage.grid.cellSize,
      offset: encounterData.stage.grid.offset,
      snap: gridType !== GridType.NoGrid, // snap is UI-only, default to true only when grid exists
      scale: encounterData.stage.grid.scale ?? 1,
    });
    setPlacedWalls(hydratedWalls);
    setPlacedRegions(hydratedRegions);
    setPlacedLightSources(hydratedLightSources);
    setPlacedSoundSources(hydratedSoundSources);
    setIsInitialized(true);
  }, [encounterData, isInitialized, encounterId]);

  useEffect(() => {
    if (!encounterData || !encounterId) return;
    if (assetsLoadedForEncounterRef.current === encounterId) return;

    assetsLoadedForEncounterRef.current = encounterId;
    setIsHydrating(true);

    // Hydrate actors, objects, effects directly (no legacy conversion needed)
    const hydratedAssets = hydrateGameElements(
      encounterData.actors ?? [],
      encounterData.objects ?? [],
      encounterData.effects ?? [],
      encounterId,
    );

    setPlacedAssetsRef.current(hydratedAssets);
    setIsHydrating(false);
  }, [encounterData, encounterId]);

  useEffect(() => {
    if (encounterData && isInitialized) {
      setEncounter(encounterData);
      const hydratedWalls = hydratePlacedWalls(encounterData.stage.walls || [], encounterId || '');
      const hydratedRegions = hydratePlacedRegions(encounterData.stage.regions || [], encounterId || '');
      const hydratedLightSources = hydratePlacedLightSources(encounterData.stage.lights || [], encounterId || '');
      const hydratedSoundSources = hydratePlacedSoundSources(encounterData.stage.sounds || [], encounterId || '');
      setPlacedWalls(hydratedWalls);
      setPlacedRegions(hydratedRegions);
      setPlacedLightSources(hydratedLightSources);
      setPlacedSoundSources(hydratedSoundSources);
    }
  }, [encounterData, isInitialized, encounterId]);
  useEffect(() => {
    if (!stage) return;

    const handleDblClick = (e: Konva.KonvaEventObject<MouseEvent>) => {
      if (e.target !== stage) {
        return;
      }
      if (!activeScope) {
        return;
      }

      switch (activeScope) {
        case 'objects':
          setAssetPickerOpen({ open: true, kind: AssetKind.Object });
          break;
        case 'monsters':
          setAssetPickerOpen({ open: true, kind: AssetKind.Creature });
          break;
        case 'characters':
          setAssetPickerOpen({ open: true, kind: AssetKind.Character });
          break;
        case 'walls':
          break;
        case 'regions':
          break;
        case 'lights':
          break;
        case 'sounds':
          setSoundPickerOpen(true);
          break;
        default:
          break;
      }
    };

    stage.on('dblclick', handleDblClick);
    return () => {
      stage.off('dblclick', handleDblClick);
    };
  }, [activeScope, stage]);

  const prevActiveScopeRef = useRef<InteractionScope>(null);
  useEffect(() => {
    if (prevActiveScopeRef.current !== activeScope) {
      assetManagement.handleAssetSelected([]);
      setSelectedWallIndex(null);
      setSelectedRegionIndex(null);
      setSelectedLightSourceIndex(null);
      setSelectedSoundSourceIndex(null);
      setIsEditingVertices(false);
      setPreviewWallPoles(null);
      if (wallTransaction.transaction.isActive) {
        wallTransaction.rollbackTransaction();
      }
      if (regionTransaction.transaction.isActive) {
        regionTransaction.rollbackTransaction();
      }
      setIsEditingRegionVertices(false);
      setEditingRegionIndex(null);
    }
    prevActiveScopeRef.current = activeScope;
  }, [activeScope, assetManagement, setPreviewWallPoles, setSelectedLightSourceIndex, setSelectedRegionIndex, setSelectedSoundSourceIndex, setSelectedWallIndex, wallTransaction, regionTransaction]);

  useEffect(() => {
    const handleBeforeUnload = (e: BeforeUnloadEvent) => {
      if (saveStatus === 'saving') {
        e.preventDefault();
        e.returnValue = '';
      }
    };

    window.addEventListener('beforeunload', handleBeforeUnload);

    return () => {
      window.removeEventListener('beforeunload', handleBeforeUnload);
    };
  }, [saveStatus]);

  // Keyboard shortcuts for undo/redo
  useKeyboardShortcuts({
    wallTransaction,
    regionTransaction,
    undo,
    redo,
  });

  // Structure handlers (wall/region placement) - extracted to handlers/structureHandlers.ts
  const structureHandlers = useMemo(
    () => createStructureHandlers({
      encounterId,
      encounter,
      wallTransaction,
      regionTransaction,
      setEncounter,
      setDrawingWallIndex,
      setDrawingWallDefaultHeight,
      setDrawingWallSegmentType,
      setDrawingWallIsOpaque,
      setDrawingWallState,
      setDrawingRegionIndex,
      setErrorMessage,
      activePanel,
      regionHandlers,
      wallHandlers,
    }),
    [
      encounterId,
      encounter,
      wallTransaction,
      regionTransaction,
      setEncounter,
      setDrawingWallIndex,
      setDrawingWallDefaultHeight,
      setDrawingWallSegmentType,
      setDrawingWallIsOpaque,
      setDrawingWallState,
      setDrawingRegionIndex,
      setErrorMessage,
      activePanel,
      regionHandlers,
      wallHandlers,
    ],
  );

  // Canvas handlers (viewport, preview, starting view) - extracted to handlers/canvasHandlers.ts
  const canvasHandlers = useMemo(
    () => createCanvasHandlers({
      encounterId,
      stageSize,
      canvasRef,
      updateStageSettings,
      refetch: async () => { await refetch(); },
      setIsStartingViewLoading,
      assetManagement,
      wallTransaction,
      regionTransaction,
      setSelectedWallIndex,
      setSelectedRegionIndex,
      setSelectedLightSourceIndex,
      setSelectedSoundSourceIndex,
      setIsEditingVertices,
      setPreviewWallPoles,
      setIsEditingRegionVertices,
      setEditingRegionIndex,
      navigate,
    }),
    [
      encounterId,
      stageSize,
      canvasRef,
      updateStageSettings,
      refetch,
      setIsStartingViewLoading,
      assetManagement,
      wallTransaction,
      regionTransaction,
      setSelectedWallIndex,
      setSelectedRegionIndex,
      setSelectedLightSourceIndex,
      setSelectedSoundSourceIndex,
      setIsEditingVertices,
      setPreviewWallPoles,
      setIsEditingRegionVertices,
      setEditingRegionIndex,
      navigate,
    ],
  );


  const handlePlacedAssetUpdate = useCallback(
    async (assetId: string, updates: Partial<PlacedAsset>) => {
      if (!encounterId || !encounter) return;

      const asset = assetManagement.placedAssets.find((a) => a.id === assetId);
      if (!asset) return;

      const updatedAsset = { ...asset, ...updates };

      try {
        await updateEncounterAsset({
          encounterId,
          assetNumber: asset.index,
          position: updatedAsset.position,
          size: updatedAsset.size,
          rotation: updatedAsset.rotation,
        }).unwrap();

        assetManagement.setPlacedAssets((prev) => prev.map((a) => (a.id === assetId ? updatedAsset : a)));
      } catch (error) {
        console.error('Failed to update asset:', error);
        setErrorMessage('Failed to update asset. Please try again.');
      }
    },
    [encounterId, encounter, assetManagement, updateEncounterAsset],
  );

  // Selection handlers for TopToolBar
  const handleClearSelection = useCallback(() => {
    assetManagement.handleAssetSelected([]);
    setSelectedWallIndices([]);
    setSelectedRegionIndices([]);
    setSelectedLightSourceIndices([]);
    setSelectedSoundSourceIndices([]);
  }, [assetManagement]);

  const handleSelectAllByCategory = useCallback((category: SelectionCategory) => {
    // Clear all selections first
    assetManagement.handleAssetSelected([]);
    setSelectedWallIndices([]);
    setSelectedRegionIndices([]);
    setSelectedLightSourceIndices([]);
    setSelectedSoundSourceIndices([]);

    if (category === 'all') {
      assetManagement.handleAssetSelected(assetManagement.placedAssets.map((a) => a.id));
      setSelectedWallIndices(placedWalls.map((_, i) => i));
      setSelectedRegionIndices(placedRegions.map((_, i) => i));
      setSelectedLightSourceIndices(placedLightSources.map((s) => s.index));
      setSelectedSoundSourceIndices(placedSoundSources.map((s) => s.index));
    } else if (category === 'walls') {
      setSelectedWallIndices(placedWalls.map((_, i) => i));
    } else if (category === 'regions') {
      setSelectedRegionIndices(placedRegions.map((_, i) => i));
    } else if (category === 'objects') {
      const objects = assetManagement.placedAssets.filter((a) => a.asset.classification.kind === AssetKind.Object);
      assetManagement.handleAssetSelected(objects.map((a) => a.id));
    } else if (category === 'monsters') {
      const monsters = assetManagement.placedAssets.filter((a) => a.asset.classification.kind === AssetKind.Creature);
      assetManagement.handleAssetSelected(monsters.map((a) => a.id));
    } else if (category === 'characters') {
      const characters = assetManagement.placedAssets.filter((a) => a.asset.classification.kind === AssetKind.Character);
      assetManagement.handleAssetSelected(characters.map((a) => a.id));
    } else if (category === 'lights') {
      setSelectedLightSourceIndices(placedLightSources.map((s) => s.index));
    } else if (category === 'sounds') {
      setSelectedSoundSourceIndices(placedSoundSources.map((s) => s.index));
    }
  }, [assetManagement, placedWalls, placedRegions, placedLightSources, placedSoundSources]);

  const handleGridToggle = useCallback(() => {
    setGridConfig((prev) => ({
      ...prev,
      type: prev.type === GridType.NoGrid ? GridType.Square : GridType.NoGrid,
    }));
  }, []);

  const visibleAssets = useMemo(() => {
    const filtered = assetManagement.placedAssets.filter((asset) => {
      if (asset.asset.classification.kind === AssetKind.Object && !scopeVisibility.objects) {
        return false;
      }
      if (asset.asset.classification.kind === AssetKind.Creature && !scopeVisibility.monsters) {
        return false;
      }
      if (asset.asset.classification.kind === AssetKind.Character && !scopeVisibility.characters) {
        return false;
      }
      return true;
    });

    return filtered;
  }, [assetManagement.placedAssets, scopeVisibility.objects, scopeVisibility.monsters, scopeVisibility.characters]);

  if (isLoadingEncounter) {
    return (
      <EditorLayout>
        <Box
          sx={{
            display: 'flex',
            justifyContent: 'center',
            alignItems: 'center',
            height: '100%',
          }}
        >
          <Box
            sx={{
              display: 'flex',
              flexDirection: 'column',
              alignItems: 'center',
              gap: 2,
            }}
          >
            <CircularProgress size={60} thickness={4} />
            <Typography variant='h6'>Loading Encounter...</Typography>
          </Box>
        </Box>
      </EditorLayout>
    );
  }

  if (encounterError || (!encounterData && encounterId)) {
    return (
      <EditorLayout>
        <Box
          sx={{
            display: 'flex',
            justifyContent: 'center',
            alignItems: 'center',
            height: '100%',
            p: 3,
          }}
        >
          <Alert severity='error'>
            Failed to load encounter. The encounter may not exist or there was a network error.
          </Alert>
        </Box>
      </EditorLayout>
    );
  }

  const backgroundUrl = encounter?.stage?.settings?.mainBackground
    ? `${getApiEndpoints().media}/${encounter.stage.settings.mainBackground.id}`
    : undefined;
  const backgroundContentType = encounter?.stage?.settings?.mainBackground?.contentType;
  const hasVideoBackground = backgroundContentType?.startsWith('video/') ?? false;

  const alternateBackgroundUrl = encounter?.stage?.settings?.alternateBackground
    ? `${getApiEndpoints().media}/${encounter.stage.settings.alternateBackground.id}`
    : undefined;
  const alternateBackgroundContentType = encounter?.stage?.settings?.alternateBackground?.contentType;

  const ambientSoundUrl = encounter?.stage?.settings?.ambientSound
    ? `${getApiEndpoints().media}/${encounter.stage.settings.ambientSound.id}`
    : undefined;

  return (
    <EditorLayout
      encounter={encounter || undefined}
      onEncounterNameChange={encounterSettings.handleEncounterNameChange}
      onBackClick={encounterSettings.handleBackClick}
      onEncounterDescriptionChange={encounterSettings.handleEncounterDescriptionChange}
      onEncounterPublishedChange={encounterSettings.handleEncounterPublishedChange}
      gridConfig={gridConfig}
      onGridChange={gridHandlers.handleGridChange}
      // Main (DM) Background
      {...(backgroundUrl && { backgroundUrl })}
      {...(backgroundContentType && { backgroundContentType })}
      isUploadingBackground={isUploadingBackground}
      onBackgroundUpload={handleBackgroundUpload}
      onBackgroundSelect={handleBackgroundSelect}
      onBackgroundRemove={handleBackgroundRemove}
      // Alternate (Player) Background
      useAlternateBackground={encounter?.stage?.settings?.useAlternateBackground ?? false}
      onUseAlternateBackgroundChange={handleUseAlternateBackgroundChange}
      {...(alternateBackgroundUrl && { alternateBackgroundUrl })}
      {...(alternateBackgroundContentType && { alternateBackgroundContentType })}
      isUploadingAlternateBackground={isUploadingAlternateBackground}
      onAlternateBackgroundUpload={handleAlternateBackgroundUpload}
      onAlternateBackgroundSelect={handleAlternateBackgroundSelect}
      onAlternateBackgroundRemove={handleAlternateBackgroundRemove}
      // Ambient Sound
      ambientSoundSource={encounter?.stage?.settings?.ambientSoundSource ?? AmbientSoundSource.NotSet}
      onAmbientSoundSourceChange={handleAmbientSoundSourceChange}
      {...(ambientSoundUrl && { ambientSoundUrl })}
      isUploadingAmbientSound={isUploadingAmbientSound}
      onAmbientSoundUpload={handleAmbientSoundUpload}
      onAmbientSoundSelect={handleAmbientSoundSelect}
      onAmbientSoundRemove={handleAmbientSoundRemove}
    >
      <Box
        sx={{
          display: 'flex',
          flexDirection: 'column',
          height: '100%',
          position: 'relative',
        }}
      >
        <EditingBlocker isBlocked={!isOnline} />

        <TopToolBar
          onUndoClick={undo}
          onRedoClick={redo}
          onZoomIn={viewportControls.handleZoomIn}
          onZoomOut={viewportControls.handleZoomOut}
          onZoomReset={viewportControls.handleZoomReset}
          onSaveStartingView={canvasHandlers.handleSaveStartingView}
          onClearStartingView={canvasHandlers.handleClearStartingView}
          hasStartingView={!!savedStartingView}
          isStartingViewLoading={isStartingViewLoading}
          onGridToggle={handleGridToggle}
          onClearSelection={handleClearSelection}
          onSelectAllByCategory={handleSelectAllByCategory}
          canUndo={false}
          canRedo={false}
          hasGrid={gridConfig.type !== GridType.NoGrid}
          gridVisible={gridConfig.type !== GridType.NoGrid}
          layerVisibility={scopeVisibility}
          onLayerVisibilityToggle={handleLayerVisibilityToggle}
          onShowAllLayers={handleShowAllLayers}
          onHideAllLayers={handleHideAllLayers}
          onPreviewClick={canvasHandlers.handlePreviewClick}
        />

        <Box
          id='canvas-container'
          onMouseMove={viewportControls.handleCanvasMouseMove}
          sx={{
            flexGrow: 1,
            overflow: 'hidden',
            bgcolor: 'background.default',
            position: 'relative',
            width: '100%',
            height: '100%',
          }}
        >
          <LeftToolBar
            activeScope={activeScope}
            onScopeChange={setActiveScope}
            activePanel={activePanel}
            onPanelChange={setActivePanel}
            encounterId={encounterId}
            gridConfig={gridConfig}
            encounterWalls={placedWalls}
            selectedWallIndex={selectedWallIndex}
            isEditingVertices={isEditingVertices}
            originalWallPoles={originalWallPoles}
            onWallSelect={wallHandlers.handleWallSelect}
            onWallDelete={wallHandlers.handleWallDelete}
            onPlaceWall={structureHandlers.handlePlaceWall}
            onEditVertices={wallHandlers.handleEditVertices}
            onCancelEditing={wallHandlers.handleCancelEditing}
            encounterRegions={placedRegions}
            selectedRegionIndex={selectedRegionIndex}
            onRegionSelect={regionHandlers.handleRegionSelect}
            onRegionDelete={regionHandlers.handleRegionDelete}
            onPlaceRegion={regionHandlers.handlePlaceRegion}
            onBucketFillRegion={regionHandlers.handleBucketFillRegion}
            regionPlacementMode={regionPlacementMode}
            onEditRegionVertices={regionHandlers.handleEditRegionVertices}
            placedAssets={assetManagement.placedAssets}
            selectedAssetIds={assetManagement.selectedAssetIds}
            onAssetSelectForPlacement={assetManagement.setDraggedAsset}
            onPlacedAssetSelect={assetManagement.handlePlacedAssetSelect}
            onPlacedAssetDelete={(assetId) => {
              const asset = assetManagement.placedAssets.find((a) => a.id === assetId);
              if (asset) {
                assetManagement.setAssetsToDelete([asset]);
                assetManagement.setDeleteConfirmOpen(true);
              }
            }}
            onPlacedAssetRename={assetManagement.handleAssetRename}
            onPlacedAssetUpdate={handlePlacedAssetUpdate}
            encounterLightSources={placedLightSources}
            encounterSoundSources={placedSoundSources}
            selectedLightSourceIndex={selectedLightSourceIndex}
            selectedSoundSourceIndex={selectedSoundSourceIndex}
            onLightSourceSelect={handleLightSourceSelect}
            onSoundSourceSelect={handleSoundSourceSelect}
            onPlaceLight={handlePlaceLight}
            onPlaceSound={handlePlaceSound}
            onFogHideAll={handleFogHideAll}
            onFogRevealAll={handleFogRevealAll}
            onFogModeChange={handleFogModeChange}
            onFogDrawPolygon={handleFogDrawPolygon}
            onFogBucketFill={handleFogBucketFill}
            fogMode={fogMode}
          />

          <EncounterCanvas
            ref={canvasRef}
            width={window.innerWidth}
            height={window.innerHeight}
            initialPosition={{ x: viewportControls.viewport.x, y: viewportControls.viewport.y }}
            initialScale={viewportControls.viewport.scale}
            backgroundColor={theme.palette.background.default}
            onViewportChange={viewportControls.handleViewportChange}
            stageCallbackRef={stageCallbackRef}
            onClick={canvasHandlers.handleCanvasClick}
          >
            {/* ===== KONVA LAYER HIERARCHY (Z-ORDER) =====
              *
              * LAYER STACK (bottom to top):
              * 0. Static Layer - Background image, grid lines
              * 1. GameWorld Layer - Regions, Sources, Walls, Transformers
              * 2. Assets Layer - Tokens, Objects, Monsters, Characters
              * 3. DrawingTools Layer - Wall/Region/Source drawing tools
              * 4. SelectionHandles Layer - Token selection boxes, rotation handles, marquee
              *
              * CRITICAL: Drawing tool cursors/markers MUST render above walls
              * CRITICAL: Selection handles MUST render above all content for visibility
              *
              * WHY THIS ORDER:
              * - Static below everything (non-interactive background)
              * - GameWorld structures define playable space
              * - Assets placed on top of structures (characters/objects)
              * - DrawingTools overlay for visual feedback during placement
              * - SelectionHandles always on top for clear visibility
              *
              * NOTE: React-Konva controls z-order via JSX render order, NOT zIndex props.
              * The order of <Layer> elements below defines their rendering order.
              */}

            {/* Layer 1: Static (background + grid) */}
            <Layer name={LayerName.Static} listening={false}>
              <BackgroundLayer
                imageUrl={backgroundUrl || DEFAULT_BACKGROUNDS.ENCOUNTER}
                backgroundColor={theme.palette.background.default}
                stageWidth={stageSize.width}
                stageHeight={stageSize.height}
                onImageLoaded={handleBackgroundImageLoaded}
                {...(backgroundContentType && { contentType: backgroundContentType })}
                muted={isVideoAudioMuted}
                playing={isVideoPlaying}
              />

              <GridRenderer
                grid={gridConfig}
                stageWidth={stageSize.width}
                stageHeight={stageSize.height}
                visible={gridConfig.type !== GridType.NoGrid}
              />
            </Layer>

            {/* Layer 2: GameWorld (structures, objects, monsters) */}
            <Layer name={LayerName.GameWorld} listening={true}>
              {/* Regions - render first (bottom of GameWorld), sorted from min to max so highest renders on top */}
              {scopeVisibility.regions && placedRegions && placedRegions.length > 0 && (
                <Group name={GroupName.Structure}>
                  {sortRegionsForRendering(placedRegions).map((encounterRegion) => {
                    if (encounterRegion.index === -1 && drawingRegionIndex !== null) {
                      return null;
                    }
                    if (encounterRegion.type === 'FogOfWar') {
                      return null;
                    }
                    if (isEditingRegionVertices && editingRegionIndex === encounterRegion.index) {
                      return null;
                    }
                    return (
                      <RegionRenderer
                        key={encounterRegion.id}
                        encounterRegion={encounterRegion}
                        allRegions={placedRegions}
                        activeScope={activeScope}
                        onSelect={regionHandlers.handleEditRegionVertices}
                        onContextMenu={contextMenus.regionContextMenu.handleOpen}
                        isSelected={selectedRegionIndex === encounterRegion.index}
                      />
                    );
                  })}
                </Group>
              )}

              {encounter && scopeVisibility.lights && placedLightSources.length > 0 && (
                <Group name={GroupName.Structure} globalCompositeOperation="lighten">
                  {placedLightSources.map((lightSource) => (
                    <LightSourceRenderer
                      key={lightSource.id}
                      encounterLightSource={lightSource}
                      walls={encounter.stage.walls || []}
                      gridConfig={gridConfig}
                      activeScope={activeScope}
                      onSelect={handleLightSourceSelect}
                      onContextMenu={handleLightSourceContextMenu}
                      onPositionChange={handleLightSourcePositionChange}
                      onDirectionChange={handleLightSourceDirectionChange}
                      isSelected={selectedLightSourceIndex === lightSource.index}
                    />
                  ))}
                </Group>
              )}

              {encounter && scopeVisibility.sounds && placedSoundSources.length > 0 && (
                <Group name={GroupName.Structure}>
                  {placedSoundSources.map((soundSource) => (
                    <SoundSourceRenderer
                      key={soundSource.id}
                      encounterSoundSource={soundSource}
                      gridConfig={gridConfig}
                      activeScope={activeScope}
                      onSelect={handleSoundSourceSelect}
                      onContextMenu={handleSoundSourceContextMenu}
                      onPositionChange={handleSoundSourcePositionChange}
                      isSelected={selectedSoundSourceIndex === soundSource.index}
                    />
                  ))}
                </Group>
              )}

              {/* Walls - render third (top of structures) */}
              {scopeVisibility.walls && encounter && placedWalls && (
                <Group name={GroupName.Structure}>
                  {placedWalls.map((encounterWall) => {
                    const isInTransaction =
                      wallTransaction.transaction.isActive &&
                      wallTransaction
                        .getActiveSegments()
                        .some((s) => s.wallIndex === encounterWall.index || s.tempId === encounterWall.index);
                    const shouldRender = !isInTransaction && !(drawingWallIndex === encounterWall.index);

                    return (
                      <React.Fragment key={encounterWall.id}>
                        {shouldRender && (
                          <WallRenderer
                            encounterWall={encounterWall}
                            onClick={wallHandlers.handleEditVertices}
                            onContextMenu={contextMenus.wallContextMenu.handleOpen}
                            activeScope={activeScope}
                          />
                        )}
                      </React.Fragment>
                    );
                  })}

                  {isEditingVertices &&
                    wallTransaction.transaction.isActive &&
                    wallTransaction
                      .getActiveSegments()
                      .map((segment) => {
                        const poles = segmentsToPoles({ index: segment.wallIndex || segment.tempId, name: segment.name, segments: segment.segments });
                        const wall = encounter?.stage.walls?.find(w => w.index === (segment.wallIndex || segment.tempId));
                        const isClosed = wall ? isWallClosed(wall as EncounterWall) : false;
                        return (
                          <WallTransformer
                            key={`transformer-${segment.tempId}`}
                            poles={poles}
                            isClosed={isClosed}
                            onPolesChange={(newPoles, newIsClosed) =>
                              structureHandlers.handleVerticesChange(segment.wallIndex || segment.tempId, newPoles, newIsClosed)
                            }
                            onPolesPreview={setPreviewWallPoles}
                            gridConfig={gridConfig}
                            snapEnabled={gridConfig.snap}
                            onClearSelections={wallHandlers.handleFinishEditing}
                            isAltPressed={keyboardState.isAltPressed}
                            encounterId={encounterId}
                            wallIndex={segment.wallIndex || segment.tempId}
                            wall={undefined}
                            onWallBreak={wallHandlers.handleWallBreak}
                            enableBackgroundRect={false}
                            wallTransaction={wallTransaction}
                            onPoleInserted={(insertedAtIndex) =>
                              structureHandlers.handlePoleInserted(segment.wallIndex ?? -1, insertedAtIndex)
                            }
                            onPoleDeleted={(deletedIndices) =>
                              structureHandlers.handlePoleDeleted(segment.wallIndex ?? -1, deletedIndices)
                            }
                            defaultHeight={drawingWallDefaultHeight}
                          />
                        );
                      })}
                </Group>
              )}
              {/* Region Transformer */}
              {scopeVisibility.regions &&
                encounter?.stage.regions &&
                isEditingRegionVertices &&
                editingRegionIndex !== null &&
                regionTransaction.transaction.isActive &&
                regionTransaction.transaction.segment && (
                  <Group name={GroupName.Structure}>
                    <RegionTransformer
                      encounterId={encounterId || ''}
                      regionIndex={editingRegionIndex}
                      segment={regionTransaction.transaction.segment}
                      allRegions={placedRegions}
                      gridConfig={gridConfig}
                      viewport={viewportControls.viewport}
                      onVerticesChange={(newVertices: Point[]) =>
                        structureHandlers.handleRegionVerticesChange(editingRegionIndex, newVertices)
                      }
                      onClearSelections={regionHandlers.handleFinishEditingRegion}
                      onSwitchToRegion={regionHandlers.handleSwitchToRegion}
                      onFinish={regionHandlers.handleFinishEditingRegion}
                      onCancel={regionHandlers.handleCancelEditingRegion}
                      onLocalAction={(action: LocalAction) => regionTransaction.pushLocalAction(action)}
                    />
                  </Group>
                )}

            </Layer>

            {/* Layer 3: Assets (tokens/objects/monsters) - creates Layer internally */}
            {encounter && (
              <EntityPlacement
                placedAssets={visibleAssets}
                onAssetPlaced={assetManagement.handleAssetPlaced}
                onAssetMoved={assetManagement.handleAssetMoved}
                onAssetDeleted={assetManagement.handleAssetDeleted}
                gridConfig={gridConfig}
                draggedAsset={assetManagement.draggedAsset}
                onDragComplete={assetManagement.handleDragComplete}
                onImagesLoaded={canvasReadyState.handleImagesLoaded}
                snapMode={keyboardState.assetSnapMode}
                onContextMenu={(assetId: string, position: { x: number; y: number }) => {
                  const asset = assetManagement.placedAssets.find((a) => a.id === assetId);
                  if (asset) {
                    contextMenus.assetContextMenu.handleOpen(asset, position);
                  }
                }}
                encounter={encounter}
                activeScope={activeScope}
              />
            )}

            {/* Fog of War Layer (renders on top of assets) */}
            {encounterId && scopeVisibility.fogOfWar !== false && (
              <Layer name="fog-of-war" listening={false}>
                <FogOfWarRenderer
                  encounterId={encounterId}
                  regions={fowRegions}
                  visible={true}
                />
              </Layer>
            )}

            {/* Layer 4: DrawingTools (wall/region/source/opening placement tools) */}
            {encounter && encounterId && (
              <Layer name={LayerName.DrawingTools} listening={true}>
                {drawingMode === 'wall' && drawingWallIndex !== null && (
                  <WallDrawingTool
                    encounterId={encounterId}
                    wallIndex={drawingWallIndex}
                    gridConfig={gridConfig}
                    defaultHeight={drawingWallDefaultHeight}
                    segmentType={drawingWallSegmentType}
                    isOpaque={drawingWallIsOpaque}
                    segmentState={drawingWallState}
                    onCancel={structureHandlers.handleStructurePlacementCancel}
                    onFinish={structureHandlers.handleStructurePlacementFinish}
                    onPolesChange={(newPoles) => {
                      const newSegments = polesToSegments(newPoles, false);
                      wallTransaction.updateSegment(-1, { segments: newSegments });

                      if (encounter) {
                        const updatedEncounter = updateWallOptimistic(encounter, -1, { segments: newSegments });
                        setEncounter(updatedEncounter);
                      }
                    }}
                    wallTransaction={wallTransaction}
                  />
                )}
                {drawingMode === 'region' && drawingRegionIndex !== null && (
                  <RegionDrawingTool
                    encounterId={encounterId}
                    regionIndex={drawingRegionIndex}
                    gridConfig={gridConfig}
                    regionType={regionTransaction.transaction.segment?.type || 'Elevation'}
                    {...(regionTransaction.transaction.segment?.color && {
                      regionColor: regionTransaction.transaction.segment.color,
                    })}
                    onCancel={structureHandlers.handleRegionPlacementCancel}
                    onFinish={structureHandlers.handleStructurePlacementFinish}
                    onVerticesChange={(newVertices: Point[]) => {
                      regionTransaction.updateVertices(newVertices);
                      if (encounter) {
                        const updatedEncounter = updateRegionOptimistic(encounter, -1, { vertices: newVertices });
                        setEncounter(updatedEncounter);
                      }
                    }}
                    regionTransaction={regionTransaction}
                  />
                )}
                {drawingMode === 'bucketFill' && drawingRegionIndex !== null && encounter && (
                  <RegionBucketFillTool
                    encounterId={encounterId}
                    gridConfig={gridConfig}
                    onCancel={structureHandlers.handleRegionPlacementCancel}
                    onFinish={regionHandlers.handleBucketFillFinish}
                    regionType={regionTransaction.transaction.segment?.type || 'Elevation'}
                    {...(regionTransaction.transaction.segment?.color && {
                      regionColor: regionTransaction.transaction.segment.color,
                    })}
                    regionTransaction={regionTransaction}
                    walls={placedWalls}
                    stageSize={stageSize}
                  />
                )}
                {activeTool === 'sourceDrawing' && sourcePlacementProperties && encounter && (
                  <SourceDrawingTool
                    encounterId={encounterId || ''}
                    source={
                      sourcePlacementProperties.sourceType === 'light'
                        ? {
                          sourceType: 'light' as const,
                          name: sourcePlacementProperties.name || '',
                          type: (sourcePlacementProperties as LightPlacementProperties).type,
                          isDirectional: (sourcePlacementProperties as LightPlacementProperties).isDirectional,
                          direction: (sourcePlacementProperties as LightPlacementProperties).direction || 0,
                          arc: (sourcePlacementProperties as LightPlacementProperties).arc || 90,
                          color: (sourcePlacementProperties as LightPlacementProperties).color || '',
                          isOn: (sourcePlacementProperties as LightPlacementProperties).isOn || true,
                        }
                        : {
                          sourceType: 'sound' as const,
                          name: sourcePlacementProperties.name || '',
                          resourceId: (sourcePlacementProperties as SoundPlacementProperties).resourceId || '',
                          isPlaying: (sourcePlacementProperties as SoundPlacementProperties).isPlaying || false,
                        }
                    }
                    walls={encounter.stage.walls || []}
                    gridConfig={gridConfig}
                    execute={execute}
                    onRefetch={async () => {
                      await refetch();
                    }}
                    onComplete={handleSourcePlacementFinish}
                    onCancel={() => {
                      setSourcePlacementProperties(null);
                      setActiveTool(null);
                    }}
                  />
                )}
                {fogDrawingTool === 'polygon' && (
                  <RegionDrawingTool
                    encounterId={encounterId}
                    regionIndex={-1}
                    gridConfig={gridConfig}
                    regionType='FogOfWar'
                    cursor={fogMode === 'add' ? getCrosshairPlusCursor() : getCrosshairMinusCursor()}
                    onCancel={() => {
                      setFogDrawingTool(null);
                      setFogDrawingVertices([]);
                    }}
                    onFinish={async () => {
                      await handlePolygonComplete(fogDrawingVertices);
                      setFogDrawingVertices([]);
                      setFogDrawingTool(null);
                    }}
                    onVerticesChange={(vertices: Point[]) => setFogDrawingVertices(vertices)}
                  />
                )}
                {fogDrawingTool === 'bucketFill' && encounter && (
                  <RegionBucketFillTool
                    encounterId={encounterId}
                    gridConfig={gridConfig}
                    cursor={fogMode === 'add' ? getBucketPlusCursor() : getBucketMinusCursor()}
                    onCancel={() => setFogDrawingTool(null)}
                    onFinish={handleBucketFillComplete}
                    regionType='FogOfWar'
                    regionTransaction={regionTransaction}
                    walls={placedWalls}
                    stageSize={stageSize}
                  />
                )}
              </Layer>
            )}

            {/* Layer 5: SelectionHandles (token selection boxes, rotation handles, marquee) */}
            <TokenDragHandle
              placedAssets={visibleAssets}
              selectedAssetIds={assetManagement.selectedAssetIds}
              onAssetSelected={assetManagement.handleAssetSelected}
              onAssetMoved={assetManagement.handleAssetMoved}
              onAssetDeleted={assetManagement.handleAssetDeleted}
              gridConfig={gridConfig}
              stageRef={stageRefObject}
              stageReady={!!stage}
              isPlacementMode={!!assetManagement.draggedAsset}
              enableDragMove={true}
              onReady={canvasReadyState.handleHandlersReady}
              snapMode={keyboardState.assetSnapMode}
              isShiftPressed={keyboardState.isShiftPressed}
              isCtrlPressed={keyboardState.isCtrlPressed}
              scale={viewportControls.viewport.scale}
              onAssetRotated={assetManagement.handleAssetRotated}
              onRotationStart={assetManagement.handleRotationStart}
              onRotationEnd={assetManagement.handleRotationEnd}
              activeScope={activeScope}
            />
          </EncounterCanvas>
        </Box>

        <EditorStatusBar
          {...(viewportControls.cursorPosition && {
            cursorPosition: viewportControls.cursorPosition,
          })}
          totalAssets={assetManagement.placedAssets.length}
          selectedCount={assetManagement.selectedAssetIds.length}
          zoomPercentage={viewportControls.viewport.scale * 100}
          {...(drawingMode && { activeTool: drawingMode })}
          hasGrid={gridConfig.type !== GridType.NoGrid}
          gridSnapEnabled={gridConfig.snap}
          hasVideoBackground={hasVideoBackground}
          isVideoPlaying={isVideoPlaying}
          onVideoPlayPauseToggle={handleVideoPlayPauseToggle}
          isAudioMuted={isVideoAudioMuted}
          onAudioMuteToggle={handleAudioMuteToggle}
        />
      </Box>

      <EditorDialogs
        deleteConfirmOpen={assetManagement.deleteConfirmOpen}
        assetsToDelete={assetManagement.assetsToDelete}
        onDeleteConfirmClose={() => assetManagement.setDeleteConfirmOpen(false)}
        onDeleteConfirm={assetManagement.confirmDelete}
        assetContextMenuPosition={contextMenus.assetContextMenu.position}
        assetContextMenuAsset={contextMenus.assetContextMenu.asset}
        onAssetContextMenuClose={contextMenus.assetContextMenu.handleClose}
        onAssetRename={assetManagement.handleAssetRename}
        onAssetDisplayUpdate={assetManagement.handleAssetDisplayUpdate}
        wallContextMenuPosition={contextMenus.wallContextMenu.position}
        wallContextMenuWall={contextMenus.wallContextMenu.wall}
        wallContextMenuSegmentIndex={contextMenus.wallContextMenu.segmentIndex}
        onWallContextMenuClose={contextMenus.wallContextMenu.handleClose}
        onWallSegmentUpdate={wallHandlers.handleSegmentUpdate}
        regionContextMenuPosition={contextMenus.regionContextMenu.position}
        regionContextMenuRegion={contextMenus.regionContextMenu.region}
        onRegionContextMenuClose={contextMenus.regionContextMenu.handleClose}
        onRegionUpdate={regionHandlers.handleRegionPropertyUpdate}
        errorMessage={errorMessage}
        onErrorMessageClose={() => setErrorMessage(null)}
      />

      <SourceContextMenus
        lightContextMenuPosition={lightContextMenuPosition}
        selectedLightSourceIndex={selectedLightSourceIndex}
        placedLightSources={placedLightSources}
        onLightContextMenuClose={handleLightContextMenuClose}
        onLightSourceUpdate={handleLightSourceUpdate}
        onLightSourceDelete={handleLightSourceDelete}
        soundContextMenuPosition={soundContextMenuPosition}
        selectedSoundSourceIndex={selectedSoundSourceIndex}
        placedSoundSources={placedSoundSources}
        onSoundContextMenuClose={handleSoundContextMenuClose}
        onSoundSourceUpdate={handleSoundSourceUpdate}
        onSoundSourceDelete={handleSoundSourceDelete}
        assetPickerOpen={assetPickerOpen}
        onAssetPickerClose={() => setAssetPickerOpen({ open: false })}
        onAssetSelect={(asset) => {
          setAssetPickerOpen({ open: false });
          assetManagement.setDraggedAsset(asset);
        }}
        soundPickerOpen={soundPickerOpen}
        onSoundPickerClose={() => setSoundPickerOpen(false)}
        onSoundSelect={handlePlaceSound}
      />
    </EditorLayout>
  );
};

export const EncounterEditorPage: React.FC = () => {
  return (
    <ClipboardProvider>
      <UndoRedoProvider>
        <EncounterEditorPageInternal />
      </UndoRedoProvider>
    </ClipboardProvider>
  );
};
