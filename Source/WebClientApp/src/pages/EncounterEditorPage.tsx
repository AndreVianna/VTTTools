import { EditingBlocker } from '@components/common';
import {
  type DrawingMode,
  EditorDialogs,
  EditorStatusBar,
  EncounterCanvas,
  type EncounterCanvasHandle,
  LeftToolBar,
  type SelectionCategory,
  TokenDragHandle,
  TopToolBar,
} from '@components/encounter';
import { EntityPlacement } from '@/components/encounter/EntityPlacement';
import { SourceContextMenus, DrawingToolsLayer, GameWorldLayer, StaticLayer, FogOfWarLayer, useEditorLoadingState } from './EncounterEditor/components';
import { EditorLayout } from '@components/layout';
import { Box, useTheme } from '@mui/material';
import { layerManager } from '@services/layerManager';
import { type GridConfig, GridType, getDefaultGrid } from '@utils/gridCalculator';
import type { InteractionScope } from '@utils/scopeFiltering';
import type Konva from 'konva';
import React, { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import type { SaveStatus } from '@/components/common';
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
  type PlacedAsset,
  type PlacedRegion,
  type PlacedWall,
  type Point,
  type Pole,
  type PlacedLightSource,
  type PlacedSoundSource,
  SegmentState,
  SegmentType,
} from '@/types/domain';
import { AmbientSoundSource } from '@/types/stage';

import type { LocalAction } from '@/types/regionUndoActions';
import {
  hydrateGameElements,
  hydratePlacedRegions,
  hydratePlacedLightSources,
  hydratePlacedSoundSources,
  hydratePlacedWalls,
} from '@/utils/encounterMappers';
import { createStructureHandlers, createCanvasHandlers } from './EncounterEditor/handlers';
import { getDrawingMode, isDrawingToolActive } from './EncounterEditor/utils';
import { createEncounterRefetch } from '@/utils/queryHelpers';
import {
  useAssetManagement,
  useCanvasReadyState,
  useContextMenus,
  useDrawingRegionState,
  useDrawingWallState,
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
  useScopeChangeHandler,
  useSelectionHandlers,
  useSourceSelection,
  useStageDoubleClick,
  useVideoControls,
  useViewportControls,
  useWallHandlers,
} from '@/hooks/encounter';

const DEFAULT_STAGE_WIDTH = 2800;
const DEFAULT_STAGE_HEIGHT = 2100;

const EncounterEditorPageInternal: React.FC = () => {
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
    data: encounterData,
    isLoading: isLoadingEncounter,
    error: encounterError,
    refetch,
  } = useGetEncounterQuery(encounterId || '', {
    skip: !encounterId || encounterId === 'new',
  });

  const [patchEncounter] = usePatchEncounterMutation();
  const [uploadFile] = useUploadFileMutation();
  const [addEncounterAsset] = useAddEncounterAssetMutation();
  const [updateEncounterAsset] = useUpdateEncounterAssetMutation();
  const [bulkUpdateEncounterAssets] = useBulkUpdateEncounterAssetsMutation();
  const [removeEncounterAsset] = useRemoveEncounterAssetMutation();
  const [bulkDeleteEncounterAssets] = useBulkDeleteEncounterAssetsMutation();
  const [bulkAddEncounterAssets] = useBulkAddEncounterAssetsMutation();

  const {
    addWall: stageAddWall,
    updateWall: stageUpdateWall,
    deleteWall: stageDeleteWall,
    updateStageSettings,
  } = useEncounterEditor({
    encounterId: encounterId ?? '',
    skip: !encounterId,
  });

  const [addRegion] = useAddRegionMutation();
  const [updateRegion] = useUpdateRegionMutation();
  const [deleteRegion] = useDeleteRegionMutation();

  const [addLight] = useAddLightMutation();
  const [updateLight] = useUpdateLightMutation();
  const [deleteLight] = useDeleteLightMutation();

  const [addSound] = useAddSoundMutation();
  const [updateSound] = useUpdateSoundMutation();
  const [deleteSound] = useDeleteSoundMutation();

  // ═══════════════════════════════════════════════════════════════════════════
  // 4.4 QUERY ADAPTERS
  // Wrappers that transform query results for hook consumption
  // ═══════════════════════════════════════════════════════════════════════════
  const wrappedRefetch = useMemo(() => createEncounterRefetch(refetch), [refetch]);

  const wallMutations = useMemo(() => ({
    addWall: stageAddWall,
    updateWall: stageUpdateWall,
    deleteWall: stageDeleteWall,
  }), [stageAddWall, stageUpdateWall, stageDeleteWall]);

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

  // ═══════════════════════════════════════════════════════════════════════════
  // 4.5 CONTEXT HOOKS
  // App-level context: useUndoRedoContext, useClipboard, useConnectionStatus
  // ═══════════════════════════════════════════════════════════════════════════
  const { execute, recordAction, undo, redo } = useUndoRedoContext();
  const { copyAssets, cutAssets, clipboard, canPaste, getClipboardAssets, clearClipboard } = useClipboard();
  const { isOnline } = useConnectionStatus();
  const dispatch = useAppDispatch();

  // ═══════════════════════════════════════════════════════════════════════════
  // 4.6 TRANSACTIONS
  // Transaction management hooks
  // ═══════════════════════════════════════════════════════════════════════════
  const wallTransaction = useWallTransaction();
  const regionTransaction = useRegionTransaction();

  // ═══════════════════════════════════════════════════════════════════════════
  // 4.7 STATE
  // Local component state: useState, useReducer
  // ═══════════════════════════════════════════════════════════════════════════
  const [stage, setStage] = useState<Konva.Stage | null>(null);
  const [isInitialized, setIsInitialized] = useState(false);
  const [encounter, setEncounter] = useState<Encounter | null>(null);
  const [placedWalls, setPlacedWalls] = useState<PlacedWall[]>([]);
  const [placedRegions, setPlacedRegions] = useState<PlacedRegion[]>([]);
  const [placedLightSources, setPlacedLightSources] = useState<PlacedLightSource[]>([]);
  const [placedSoundSources, setPlacedSoundSources] = useState<PlacedSoundSource[]>([]);
  const [gridConfig, setGridConfig] = useState<GridConfig>(getDefaultGrid());
  const [stageSize, setStageSize] = useState({ width: DEFAULT_STAGE_WIDTH, height: DEFAULT_STAGE_HEIGHT });
  const [imageDimensionsLoaded, setImageDimensionsLoaded] = useState(false);
  const [saveStatus, setSaveStatus] = useState<SaveStatus>('idle');
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [isStartingViewLoading, setIsStartingViewLoading] = useState(false);
  const [selectedWallIndex, setSelectedWallIndex] = useSessionState<number | null>({ key: 'selectedWallIndex', defaultValue: null, encounterId });
  const [selectedWallIndices, setSelectedWallIndices] = useState<number[]>([]);
  const [isEditingVertices, setIsEditingVertices] = useState(false);
  const [originalWallPoles, setOriginalWallPoles] = useState<Pole[] | null>(null);
  const [selectedRegionIndex, setSelectedRegionIndex] = useSessionState<number | null>({ key: 'selectedRegionIndex', defaultValue: null, encounterId });
  const [selectedRegionIndices, setSelectedRegionIndices] = useState<number[]>([]);
  const [selectedLightSourceIndex, setSelectedLightSourceIndex] = useSessionState<number | null>({ key: 'selectedLightSourceIndex', defaultValue: null, encounterId });
  const [selectedLightSourceIndices, setSelectedLightSourceIndices] = useState<number[]>([]);
  const [selectedSoundSourceIndex, setSelectedSoundSourceIndex] = useSessionState<number | null>({ key: 'selectedSoundSourceIndex', defaultValue: null, encounterId });
  const [selectedSoundSourceIndices, setSelectedSoundSourceIndices] = useState<number[]>([]);
  const [activeScope, setActiveScope] = useSessionState<InteractionScope>({ key: 'activeScope', defaultValue: null, encounterId });
  const [activePanel, setActivePanel] = useState<string | null>(() => activeScope);
  const [assetPickerOpen, setAssetPickerOpen] = useState<{ open: boolean; kind?: AssetKind }>({ open: false });
  const [soundPickerOpen, setSoundPickerOpen] = useState(false);

  // ═══════════════════════════════════════════════════════════════════════════
  // 4.8 REFS
  // References: useRef
  // ═══════════════════════════════════════════════════════════════════════════
  const canvasRef = useRef<EncounterCanvasHandle>(null);
  const stageRefObject = useRef<Konva.Stage | null>(null);
  const subscribedResourcesRef = useRef<Set<string>>(new Set());
  const encounterRef = useRef<Encounter | null>(null);
  const assetsLoadedForEncounterRef = useRef<string | null>(null);

  // ═══════════════════════════════════════════════════════════════════════════
  // 4.9 DOMAIN HOOKS
  // Feature-specific composed hooks that encapsulate business logic
  // ═══════════════════════════════════════════════════════════════════════════
  const {
    isVideoAudioMuted,
    isVideoPlaying,
    handleAudioMuteToggle,
    handleVideoPlayPauseToggle,
  } = useVideoControls();

  const {
    drawingWallIndex,
    drawingWallDefaultHeight,
    drawingWallSegmentType,
    drawingWallIsOpaque,
    drawingWallState,
    setDrawingWallIndex,
    setDrawingWallDefaultHeight,
    setDrawingWallSegmentType,
    setDrawingWallIsOpaque,
    setDrawingWallState,
    previewWallPolesRef,
    setPreviewWallPoles,
  } = useDrawingWallState();

  const {
    drawingRegionIndex,
    editingRegionIndex,
    isEditingRegionVertices,
    originalRegionVertices,
    regionPlacementMode,
    setDrawingRegionIndex,
    setEditingRegionIndex,
    setIsEditingRegionVertices,
    setOriginalRegionVertices,
    setRegionPlacementMode,
  } = useDrawingRegionState();

  const { connect: connectMediaHub, subscribeToResource, isConnected: isMediaHubConnected } = useMediaHub({
    onResourceUpdated: useCallback((event) => {
      subscribedResourcesRef.current.delete(event.resourceId);
      refetch();
    }, [refetch]),
    autoConnect: false,
  });

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
    setFogDrawingVertices,
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
    refetch: wrappedRefetch,
    execute,
    addRegion,
    deleteRegion,
  });

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

  // Derived values needed for domain hooks
  const backgroundSize = encounter?.stage?.settings?.mainBackground?.dimensions;
  const effectiveBackgroundSize = backgroundSize ?? (imageDimensionsLoaded ? stageSize : undefined);

  const savedStartingView = useMemo(() => {
    const settings = encounter?.stage?.settings;
    if (!settings) return undefined;
    const hasNonDefaultZoom = settings.zoomLevel !== 1;
    const hasNonDefaultPanning = settings.panning?.x !== 0 || settings.panning?.y !== 0;
    if (!hasNonDefaultZoom && !hasNonDefaultPanning) return undefined;
    return {
      zoomLevel: settings.zoomLevel,
      panning: settings.panning,
    };
  }, [encounter?.stage?.settings]);

  const initialViewport = {
    x: (window.innerWidth - DEFAULT_STAGE_WIDTH) / 2,
    y: (window.innerHeight - DEFAULT_STAGE_HEIGHT) / 2,
    scale: 1,
  };

  // Domain hooks that need drawingMode
  const drawingMode: DrawingMode = getDrawingMode(activeScope, regionPlacementMode);
  const isUsingDrawingTool = isDrawingToolActive(drawingMode, drawingWallIndex, drawingRegionIndex, null);

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
    refetch: wrappedRefetch,
  });

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
    refetch: wrappedRefetch,
  });

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
    refetch: wrappedRefetch,
  });

  // Update ref after assetManagement is available
  const setPlacedAssetsRef = useRef(assetManagement.setPlacedAssets);
  setPlacedAssetsRef.current = assetManagement.setPlacedAssets;

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

  const canvasReadyState = useCanvasReadyState({ stage });

  const viewportControls = useViewportControls({
    initialViewport,
    canvasRef: canvasRef as React.RefObject<EncounterCanvasHandle>,
    stageSize,
    encounterId,
    ...(effectiveBackgroundSize && { backgroundSize: effectiveBackgroundSize }),
    savedStartingView,
  });

  const contextMenus = useContextMenus({ encounter });

  const { handleClearSelection, handleSelectAllByCategory } = useSelectionHandlers({
    assetManagement,
    placedWalls,
    placedRegions,
    placedLightSources,
    placedSoundSources,
    setSelectedWallIndices,
    setSelectedRegionIndices,
    setSelectedLightSourceIndices,
    setSelectedSoundSourceIndices,
  });

  // ═══════════════════════════════════════════════════════════════════════════
  // 4.10 COMPOSED HANDLERS
  // Memoized factories that combine multiple domain hooks into cohesive bundles
  // ═══════════════════════════════════════════════════════════════════════════
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
      encounterId, encounter, wallTransaction, regionTransaction, setEncounter,
      setDrawingWallIndex, setDrawingWallDefaultHeight, setDrawingWallSegmentType,
      setDrawingWallIsOpaque, setDrawingWallState, setDrawingRegionIndex,
      setErrorMessage, activePanel, regionHandlers, wallHandlers,
    ],
  );

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
      encounterId, stageSize, canvasRef, updateStageSettings, refetch,
      setIsStartingViewLoading, assetManagement, wallTransaction, regionTransaction,
      setSelectedWallIndex, setSelectedRegionIndex, setSelectedLightSourceIndex,
      setSelectedSoundSourceIndex, setIsEditingVertices, setPreviewWallPoles,
      setIsEditingRegionVertices, setEditingRegionIndex, navigate,
    ],
  );

  // ═══════════════════════════════════════════════════════════════════════════
  // 4.11 DERIVED STATE
  // Pure computed values from props/state: useMemo
  // ═══════════════════════════════════════════════════════════════════════════
  const visibleAssets = useMemo(() => {
    return assetManagement.placedAssets.filter((asset) => {
      if (asset.asset.classification.kind === AssetKind.Object && !scopeVisibility.objects) return false;
      if (asset.asset.classification.kind === AssetKind.Creature && !scopeVisibility.monsters) return false;
      if (asset.asset.classification.kind === AssetKind.Character && !scopeVisibility.characters) return false;
      return true;
    });
  }, [assetManagement.placedAssets, scopeVisibility.objects, scopeVisibility.monsters, scopeVisibility.characters]);

  // ═══════════════════════════════════════════════════════════════════════════
  // 4.12 EFFECTS
  // Side effects: useEffect
  // ═══════════════════════════════════════════════════════════════════════════
  useEffect(() => {
    encounterRef.current = encounter;
  }, [encounter]);

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

  useEffect(() => {
    if (encounterId) {
      refetch();
    }
  }, [encounterId, refetch]);

  useEffect(() => {
    const mainBackground = encounter?.stage?.settings?.mainBackground;
    if (!mainBackground || !isMediaHubConnected) return;
    const { id } = mainBackground;
    if (id && !subscribedResourcesRef.current.has(id)) {
      subscribedResourcesRef.current.add(id);
      subscribeToResource(id).catch(() => {});
    }
  }, [encounter?.stage?.settings?.mainBackground, isMediaHubConnected, subscribeToResource]);

  useEffect(() => {
    const hasValidBackgroundSize = backgroundSize && backgroundSize.width > 0 && backgroundSize.height > 0;
    if (hasValidBackgroundSize) {
      setStageSize({ width: backgroundSize.width, height: backgroundSize.height });
    } else {
      setStageSize({ width: DEFAULT_STAGE_WIDTH, height: DEFAULT_STAGE_HEIGHT });
    }
  }, [backgroundSize]);

  useEffect(() => {
    setImageDimensionsLoaded(false);
  }, [encounterId]);

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
      snap: gridType !== GridType.NoGrid,
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

    const hydratedAssets = hydrateGameElements(
      encounterData.actors ?? [],
      encounterData.objects ?? [],
      encounterData.effects ?? [],
      encounterId,
    );

    setPlacedAssetsRef.current(hydratedAssets);
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

  useStageDoubleClick({
    stage,
    activeScope,
    setAssetPickerOpen,
    setSoundPickerOpen,
  });

  useScopeChangeHandler({
    activeScope,
    assetManagement,
    setSelectedWallIndex,
    setSelectedRegionIndex,
    setSelectedLightSourceIndex,
    setSelectedSoundSourceIndex,
    setIsEditingVertices,
    setPreviewWallPoles,
    wallTransaction,
    regionTransaction,
    setIsEditingRegionVertices,
    setEditingRegionIndex,
  });

  useKeyboardShortcuts({
    wallTransaction,
    regionTransaction,
    undo,
    redo,
  });

  // ═══════════════════════════════════════════════════════════════════════════
  // 4.13 HANDLERS
  // Event handlers: useCallback (including callback refs)
  // ═══════════════════════════════════════════════════════════════════════════
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

  const handleBackgroundImageLoaded = useCallback((dimensions: { width: number; height: number }) => {
    if (!backgroundSize || backgroundSize.width === 0 || backgroundSize.height === 0) {
      setStageSize(dimensions);
      setImageDimensionsLoaded(true);
    }
  }, [backgroundSize]);

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
          kind: asset.asset.classification.kind,
          position: updatedAsset.position,
          size: updatedAsset.size,
          rotation: updatedAsset.rotation,
        }).unwrap();

        assetManagement.setPlacedAssets((prev) => prev.map((a) => (a.id === assetId ? updatedAsset : a)));
      } catch (error) {
        setErrorMessage('Failed to update asset. Please try again.');
      }
    },
    [encounterId, encounter, assetManagement, updateEncounterAsset],
  );

  const handleGridToggle = useCallback(() => {
    setGridConfig((prev) => ({
      ...prev,
      type: prev.type === GridType.NoGrid ? GridType.Square : GridType.NoGrid,
    }));
  }, []);

  // ═══════════════════════════════════════════════════════════════════════════
  // 4.14 RENDER
  // JSX output
  // ═══════════════════════════════════════════════════════════════════════════
  const loadingState = useEditorLoadingState({
    isLoading: isLoadingEncounter,
    hasError: !!encounterError,
    hasNoData: !encounterData && !!encounterId,
  });
  if (loadingState) return loadingState;

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
      {...(backgroundUrl && { backgroundUrl })}
      {...(backgroundContentType && { backgroundContentType })}
      isUploadingBackground={isUploadingBackground}
      onBackgroundUpload={handleBackgroundUpload}
      onBackgroundSelect={handleBackgroundSelect}
      onBackgroundRemove={handleBackgroundRemove}
      useAlternateBackground={encounter?.stage?.settings?.useAlternateBackground ?? false}
      onUseAlternateBackgroundChange={handleUseAlternateBackgroundChange}
      {...(alternateBackgroundUrl && { alternateBackgroundUrl })}
      {...(alternateBackgroundContentType && { alternateBackgroundContentType })}
      isUploadingAlternateBackground={isUploadingAlternateBackground}
      onAlternateBackgroundUpload={handleAlternateBackgroundUpload}
      onAlternateBackgroundSelect={handleAlternateBackgroundSelect}
      onAlternateBackgroundRemove={handleAlternateBackgroundRemove}
      ambientSoundSource={encounter?.stage?.settings?.ambientSoundSource ?? AmbientSoundSource.NotSet}
      onAmbientSoundSourceChange={handleAmbientSoundSourceChange}
      {...(ambientSoundUrl && { ambientSoundUrl })}
      isUploadingAmbientSound={isUploadingAmbientSound}
      onAmbientSoundUpload={handleAmbientSoundUpload}
      onAmbientSoundSelect={handleAmbientSoundSelect}
      onAmbientSoundRemove={handleAmbientSoundRemove}
    >
      <Box sx={{ display: 'flex', flexDirection: 'column', height: '100%', position: 'relative' }}>
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
          sx={{ flexGrow: 1, overflow: 'hidden', bgcolor: 'background.default', position: 'relative', width: '100%', height: '100%' }}
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
            <StaticLayer
              backgroundUrl={backgroundUrl}
              backgroundContentType={backgroundContentType}
              backgroundColor={theme.palette.background.default}
              stageWidth={stageSize.width}
              stageHeight={stageSize.height}
              onImageLoaded={handleBackgroundImageLoaded}
              isVideoAudioMuted={isVideoAudioMuted}
              isVideoPlaying={isVideoPlaying}
              gridConfig={gridConfig}
            />

            <GameWorldLayer
              encounter={encounter}
              encounterId={encounterId}
              placedRegions={placedRegions}
              placedLightSources={placedLightSources}
              placedSoundSources={placedSoundSources}
              placedWalls={placedWalls}
              selectedRegionIndex={selectedRegionIndex}
              selectedLightSourceIndex={selectedLightSourceIndex}
              selectedSoundSourceIndex={selectedSoundSourceIndex}
              drawingRegionIndex={drawingRegionIndex}
              drawingWallIndex={drawingWallIndex}
              drawingWallDefaultHeight={drawingWallDefaultHeight}
              isEditingVertices={isEditingVertices}
              isEditingRegionVertices={isEditingRegionVertices}
              editingRegionIndex={editingRegionIndex}
              scopeVisibility={{ regions: scopeVisibility.regions, lights: scopeVisibility.lights, sounds: scopeVisibility.sounds, walls: scopeVisibility.walls }}
              activeScope={activeScope}
              gridConfig={gridConfig}
              viewport={viewportControls.viewport}
              wallTransaction={wallTransaction}
              regionTransaction={regionTransaction}
              isAltPressed={keyboardState.isAltPressed}
              onRegionSelect={regionHandlers.handleEditRegionVertices}
              onRegionContextMenu={contextMenus.regionContextMenu.handleOpen}
              onLightSourceSelect={handleLightSourceSelect}
              onLightSourceContextMenu={handleLightSourceContextMenu}
              onLightSourcePositionChange={handleLightSourcePositionChange}
              onLightSourceDirectionChange={handleLightSourceDirectionChange}
              onSoundSourceSelect={handleSoundSourceSelect}
              onSoundSourceContextMenu={handleSoundSourceContextMenu}
              onSoundSourcePositionChange={handleSoundSourcePositionChange}
              onWallClick={wallHandlers.handleEditVertices}
              onWallContextMenu={contextMenus.wallContextMenu.handleOpen}
              onWallBreak={wallHandlers.handleWallBreak}
              onFinishEditing={wallHandlers.handleFinishEditing}
              setPreviewWallPoles={setPreviewWallPoles}
              handleVerticesChange={structureHandlers.handleVerticesChange}
              handlePoleInserted={structureHandlers.handlePoleInserted}
              handlePoleDeleted={structureHandlers.handlePoleDeleted}
              handleRegionVerticesChange={structureHandlers.handleRegionVerticesChange}
              onFinishEditingRegion={regionHandlers.handleFinishEditingRegion}
              onCancelEditingRegion={regionHandlers.handleCancelEditingRegion}
              onSwitchToRegion={regionHandlers.handleSwitchToRegion}
              onLocalAction={(action) => regionTransaction.pushLocalAction(action)}
            />

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
                  if (asset) contextMenus.assetContextMenu.handleOpen(asset, position);
                }}
                encounter={encounter}
                activeScope={activeScope}
              />
            )}

            {encounterId && (
              <FogOfWarLayer
                encounterId={encounterId}
                fowRegions={fowRegions}
                visible={scopeVisibility.fogOfWar !== false}
              />
            )}

            {encounter && encounterId && (
              <DrawingToolsLayer
                encounter={encounter}
                encounterId={encounterId}
                drawingMode={drawingMode}
                drawingWallIndex={drawingWallIndex}
                drawingWallDefaultHeight={drawingWallDefaultHeight}
                drawingWallSegmentType={drawingWallSegmentType}
                drawingWallIsOpaque={drawingWallIsOpaque}
                drawingWallState={drawingWallState}
                drawingRegionIndex={drawingRegionIndex}
                gridConfig={gridConfig}
                wallTransaction={wallTransaction}
                regionTransaction={regionTransaction}
                setEncounter={setEncounter}
                onStructurePlacementCancel={structureHandlers.handleStructurePlacementCancel}
                onStructurePlacementFinish={structureHandlers.handleStructurePlacementFinish}
                onRegionPlacementCancel={structureHandlers.handleRegionPlacementCancel}
                onBucketFillFinish={regionHandlers.handleBucketFillFinish}
                activeTool={activeTool}
                sourcePlacementProperties={sourcePlacementProperties}
                execute={execute}
                refetch={async () => { await refetch(); }}
                onSourcePlacementFinish={handleSourcePlacementFinish}
                onSourcePlacementCancel={() => handleSourcePlacementFinish(false)}
                fogDrawingTool={fogDrawingTool}
                fogMode={fogMode}
                fogDrawingVertices={fogDrawingVertices}
                setFogDrawingVertices={setFogDrawingVertices}
                setFogDrawingTool={setFogDrawingTool}
                onPolygonComplete={handlePolygonComplete}
                onBucketFillComplete={handleBucketFillComplete}
                placedWalls={placedWalls}
                stageSize={stageSize}
              />
            )}

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
          {...(viewportControls.cursorPosition && { cursorPosition: viewportControls.cursorPosition })}
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
