import { AssetPicker, EditingBlocker } from '@components/common';
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
  OpeningDrawingTool,
  OpeningRenderer,
  RegionBucketFillTool,
  RegionDrawingTool,
  RegionRenderer,
  RegionTransformer,
  SourceDrawingTool,
  SourceRenderer,
  TokenDragHandle,
  TokenPlacement,
  TopToolBar,
  WallDrawingTool,
  WallRenderer,
  WallTransformer,
} from '@components/encounter';
import type { OpeningPlacementProperties, SourcePlacementProperties } from '@components/encounter/panels';
import { EditorLayout } from '@components/layout';
import { Alert, Box, CircularProgress, Typography, useTheme } from '@mui/material';
import { GroupName, LayerName, LayerZIndex, layerManager } from '@services/layerManager';
import { type GridConfig, GridType, getDefaultGrid } from '@utils/gridCalculator';
import type { InteractionScope } from '@utils/scopeFiltering';
import type Konva from 'konva';
import React, { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import { flushSync } from 'react-dom';
import { Group, Layer } from 'react-konva';
import { useParams } from 'react-router-dom';
import type { SaveStatus } from '@/components/common';
import { getApiEndpoints } from '@/config/development';
import { ClipboardProvider } from '@/contexts/ClipboardContext';
import { UndoRedoProvider } from '@/contexts/UndoRedoContext';
import { useClipboard } from '@/contexts/useClipboard';
import { useConnectionStatus } from '@/hooks/useConnectionStatus';
import { useFogOfWarPlacement } from '@/hooks/useFogOfWarPlacement';
import { useRegionTransaction } from '@/hooks/useRegionTransaction';
import { useUndoRedoContext } from '@/hooks/useUndoRedo';
import { useWallTransaction } from '@/hooks/useWallTransaction';
import { assetsApi } from '@/services/assetsApi';
import {
  useAddEncounterAssetMutation,
  useAddEncounterOpeningMutation,
  useAddEncounterRegionMutation,
  useAddEncounterWallMutation,
  useBulkAddEncounterAssetsMutation,
  useBulkDeleteEncounterAssetsMutation,
  useBulkUpdateEncounterAssetsMutation,
  useGetEncounterQuery,
  usePatchEncounterMutation,
  useRemoveEncounterAssetMutation,
  useRemoveEncounterOpeningMutation,
  useRemoveEncounterRegionMutation,
  useRemoveEncounterSourceMutation,
  useRemoveEncounterWallMutation,
  useUpdateEncounterAssetMutation,
  useUpdateEncounterOpeningMutation,
  useUpdateEncounterRegionMutation,
  useUpdateEncounterWallMutation,
} from '@/services/encounterApi';
import { useUploadFileMutation } from '@/services/mediaApi';
import { useAppDispatch } from '@/store';
import {
  AssetKind,
  type Encounter,
  type EncounterWall,
  type PlacedAsset,
  type PlacedOpening,
  type PlacedRegion,
  type PlacedSource,
  type PlacedWall,
  type Point,
  type Pole,
  type WallVisibility,
} from '@/types/domain';
import type { LocalAction } from '@/types/regionUndoActions';
import { CreateFogOfWarRegionCommand, RevealAllFogOfWarCommand } from '@/utils/commands/fogOfWarCommands';
import {
  getBucketMinusCursor,
  getBucketPlusCursor,
  getCrosshairMinusCursor,
  getCrosshairPlusCursor,
} from '@/utils/customCursors';
import {
  hydratePlacedAssets,
  hydratePlacedOpenings,
  hydratePlacedRegions,
  hydratePlacedSources,
  hydratePlacedWalls,
} from '@/utils/encounterMappers';
import {
  addWallOptimistic,
  removeRegionOptimistic,
  removeWallOptimistic,
  updateRegionOptimistic,
  updateWallOptimistic,
} from '@/utils/encounterStateUtils';
import {
  useAssetManagement,
  useCanvasReadyState,
  useContextMenus,
  useEncounterSettings,
  useGridHandlers,
  useKeyboardState,
  useRegionHandlers,
  useViewportControls,
  useWallHandlers,
} from './EncounterEditor/hooks';

const STAGE_WIDTH = 2800;
const STAGE_HEIGHT = 2100;
const ENCOUNTER_DEFAULT_BACKGROUND = '/assets/backgrounds/tavern.png';

const EncounterEditorPageInternal: React.FC = () => {
  const theme = useTheme();
  const { encounterId } = useParams<{ encounterId: string }>();
  const canvasRef = useRef<EncounterCanvasHandle>(null);
  const [stage, setStage] = useState<Konva.Stage | null>(null);
  const stageRefObject = useRef<Konva.Stage | null>(null);

  const stageCallbackRef = useCallback((node: Konva.Stage | null) => {
    if (node) {
      stageRefObject.current = node;
      setStage(node);
      layerManager.initialize(node);
      layerManager.enforceZOrder();
    } else {
      stageRefObject.current = null;
      setStage(null);
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
    skip: !encounterId,
  });
  const [patchEncounter] = usePatchEncounterMutation();
  const [uploadFile, { isLoading: isUploadingBackground }] = useUploadFileMutation();
  const [addEncounterAsset] = useAddEncounterAssetMutation();
  const [updateEncounterAsset] = useUpdateEncounterAssetMutation();
  const [bulkUpdateEncounterAssets] = useBulkUpdateEncounterAssetsMutation();
  const [removeEncounterAsset] = useRemoveEncounterAssetMutation();
  const [bulkDeleteEncounterAssets] = useBulkDeleteEncounterAssetsMutation();
  const [bulkAddEncounterAssets] = useBulkAddEncounterAssetsMutation();

  const [addEncounterWall] = useAddEncounterWallMutation();
  const [removeEncounterWall] = useRemoveEncounterWallMutation();
  const [updateEncounterWall] = useUpdateEncounterWallMutation();

  const [addEncounterRegion] = useAddEncounterRegionMutation();
  const [updateEncounterRegion] = useUpdateEncounterRegionMutation();
  const [removeEncounterRegion] = useRemoveEncounterRegionMutation();
  const [removeEncounterSource] = useRemoveEncounterSourceMutation();

  const [addEncounterOpening] = useAddEncounterOpeningMutation();
  const [updateEncounterOpening] = useUpdateEncounterOpeningMutation();
  const [removeEncounterOpening] = useRemoveEncounterOpeningMutation();

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
  const [placedSources, setPlacedSources] = useState<PlacedSource[]>([]);
  const [placedOpenings, setPlacedOpenings] = useState<PlacedOpening[]>([]);

  useEffect(() => {
    encounterRef.current = encounter;
  }, [encounter]);

  const initialViewport = {
    x: (window.innerWidth - STAGE_WIDTH) / 2,
    y: (window.innerHeight - STAGE_HEIGHT) / 2,
    scale: 1,
  };

  const [gridConfig, setGridConfig] = useState<GridConfig>(getDefaultGrid());
  const [backgroundImageUrl] = useState<string>(ENCOUNTER_DEFAULT_BACKGROUND);
  const [isHydrating, setIsHydrating] = useState(false);
  const [saveStatus, setSaveStatus] = useState<SaveStatus>('idle');
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [selectedWallIndex, setSelectedWallIndex] = useState<number | null>(null);
  const [drawingWallIndex, setDrawingWallIndex] = useState<number | null>(null);
  const [drawingWallDefaultHeight, setDrawingWallDefaultHeight] = useState<number>(10);
  const [isEditingVertices, setIsEditingVertices] = useState(false);
  const [originalWallPoles, setOriginalWallPoles] = useState<Pole[] | null>(null);

  const [selectedRegionIndex, setSelectedRegionIndex] = useState<number | null>(null);
  const [drawingRegionIndex, setDrawingRegionIndex] = useState<number | null>(null);
  const [editingRegionIndex, setEditingRegionIndex] = useState<number | null>(null);
  const [isEditingRegionVertices, setIsEditingRegionVertices] = useState(false);
  const [originalRegionVertices, setOriginalRegionVertices] = useState<Point[] | null>(null);
  const [regionPlacementMode, setRegionPlacementMode] = useState<'polygon' | 'bucketFill' | null>(null);

  const [selectedSourceIndex, setSelectedSourceIndex] = useState<number | null>(null);
  const [sourcePlacementProperties, setSourcePlacementProperties] = useState<SourcePlacementProperties | null>(null);
  const [activeTool, setActiveTool] = useState<string | null>(null);

  const [selectedOpeningIndex, setSelectedOpeningIndex] = useState<number | null>(null);
  const [openingPlacementProperties, setOpeningPlacementProperties] = useState<OpeningPlacementProperties | null>(null);

  const [fogMode, setFogMode] = useState<'add' | 'subtract'>('add');
  const [fogDrawingTool, setFogDrawingTool] = useState<'polygon' | 'bucketFill' | null>(null);
  const [fogDrawingVertices, setFogDrawingVertices] = useState<Point[]>([]);

  const [activeScope, setActiveScope] = useState<InteractionScope>(null);

  const [scopeVisibility, setScopeVisibility] = useState<Record<LayerVisibilityType, boolean>>({
    regions: true,
    walls: true,
    openings: true,
    objects: true,
    monsters: true,
    characters: true,
    sources: true,
    fogOfWar: true,
  });

  const [activePanel, setActivePanel] = useState<string | null>(null);
  const [assetPickerOpen, setAssetPickerOpen] = useState<{
    open: boolean;
    kind?: AssetKind;
  }>({ open: false });

  const drawingMode: DrawingMode =
    activeScope === 'walls'
      ? 'wall'
      : activeScope === 'regions' && regionPlacementMode === 'polygon'
        ? 'region'
        : activeScope === 'regions' && regionPlacementMode === 'bucketFill'
          ? 'bucketFill'
          : activeScope === 'sources'
            ? 'source'
            : null;

  const handleLayerVisibilityToggle = useCallback((layer: LayerVisibilityType) => {
    setScopeVisibility((prev) => ({
      ...prev,
      [layer]: !prev[layer],
    }));
  }, []);

  const handleShowAllLayers = useCallback(() => {
    setScopeVisibility({
      regions: true,
      walls: true,
      openings: true,
      objects: true,
      monsters: true,
      characters: true,
      sources: true,
      fogOfWar: true,
    });
    setGridConfig((prev) => ({
      ...prev,
      type: prev.type === GridType.NoGrid ? GridType.Square : prev.type,
    }));
  }, []);

  const handleHideAllLayers = useCallback(() => {
    setScopeVisibility({
      regions: false,
      walls: false,
      openings: false,
      objects: false,
      monsters: false,
      characters: false,
      sources: false,
      fogOfWar: false,
    });
    setGridConfig((prev) => ({
      ...prev,
      type: GridType.NoGrid,
    }));
  }, []);

  const saveChanges = useCallback(
    async (
      overrides?: Partial<{
        name: string;
        description: string;
        isPublished: boolean;
        grid: {
          type: GridType;
          cellSize: { width: number; height: number };
          offset: { left: number; top: number };
          snap: boolean;
        };
      }>,
    ) => {
      if (!encounterId || !encounter || !isInitialized) {
        return;
      }

      const currentData = {
        name: encounter.name,
        description: encounter.description,
        isPublished: encounter.isPublished,
        grid: {
          type: gridConfig.type,
          cellSize: gridConfig.cellSize,
          offset: gridConfig.offset,
          snap: gridConfig.snap,
        },
        ...overrides,
      };

      const hasChanges =
        currentData.name !== encounter.name ||
        currentData.description !== encounter.description ||
        currentData.isPublished !== encounter.isPublished ||
        JSON.stringify(currentData.grid) !==
          JSON.stringify({
            type:
              typeof encounter.grid.type === 'string'
                ? GridType[encounter.grid.type as keyof typeof GridType]
                : encounter.grid.type,
            cellSize: encounter.grid.cellSize,
            offset: encounter.grid.offset,
            snap: encounter.grid.snap,
          });

      if (!hasChanges) {
        return;
      }

      setSaveStatus('saving');

      const requestPayload = {
        name: currentData.name,
        description: currentData.description,
        isPublished: currentData.isPublished,
        grid: currentData.grid,
      };

      try {
        const result = await patchEncounter({
          id: encounterId,
          request: requestPayload,
        }).unwrap();

        if (result) {
          setEncounter(result);
        } else {
          await refetch();
        }

        setSaveStatus('saved');
      } catch (error) {
        console.error('Failed to save encounter:', error);
        setSaveStatus('error');
      }
    },
    [encounterId, encounter, isInitialized, gridConfig, patchEncounter, refetch],
  );

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
    drawingMode: drawingMode === 'source' ? null : drawingMode,
    drawingWallIndex,
    addEncounterWall,
    updateEncounterWall,
    removeEncounterWall,
    setEncounter,
    setPlacedWalls,
    setSelectedWallIndex,
    setDrawingWallIndex,
    setIsEditingVertices,
    setOriginalWallPoles,
    setActivePanel,
    setErrorMessage,
    execute,
    refetch: async () => {
      const result = await refetch();
      return result.data ? { data: result.data } : {};
    },
  });

  const regionHandlers = useRegionHandlers({
    encounterId,
    encounter,
    regionTransaction,
    gridConfig,
    selectedRegionIndex,
    editingRegionIndex,
    originalRegionVertices,
    drawingMode: drawingMode === 'source' ? null : drawingMode,
    drawingRegionIndex,
    addEncounterRegion,
    updateEncounterRegion,
    removeEncounterRegion,
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

  const viewportControls = useViewportControls({
    initialViewport,
    canvasRef: canvasRef as React.RefObject<EncounterCanvasHandle>,
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

  useEffect(() => {
    if (encounterData && !isInitialized) {
      let isMounted = true;

      const initializeEncounter = async () => {
        if (!isMounted) return;
        setIsHydrating(true);

        try {
          const hydratedAssets = await hydratePlacedAssets(
            encounterData.assets,
            encounterId || '',
            async (assetId: string) => {
              const result = await dispatch(assetsApi.endpoints.getAsset.initiate(assetId)).unwrap();
              return result;
            },
          );

          if (!isMounted) return;

          const hydratedWalls = hydratePlacedWalls(encounterData.walls || [], encounterId || '');
          const hydratedRegions = hydratePlacedRegions(encounterData.regions || [], encounterId || '');
          const hydratedSources = hydratePlacedSources(encounterData.sources || [], encounterId || '');
          const hydratedOpenings = hydratePlacedOpenings(encounterData.openings || [], encounterId || '');

          setEncounter(encounterData);
          setGridConfig({
            type:
              typeof encounterData.grid.type === 'string'
                ? GridType[encounterData.grid.type as keyof typeof GridType]
                : encounterData.grid.type,
            cellSize: encounterData.grid.cellSize,
            offset: encounterData.grid.offset,
            snap: encounterData.grid.snap,
          });
          assetManagement.setPlacedAssets(hydratedAssets);
          setPlacedWalls(hydratedWalls);
          setPlacedRegions(hydratedRegions);
          setPlacedSources(hydratedSources);
          setPlacedOpenings(hydratedOpenings);
          setIsInitialized(true);
        } catch (error) {
          if (!isMounted) return;

          console.error('Failed to hydrate encounter:', error);
          setEncounter(encounterData);
          setGridConfig({
            type:
              typeof encounterData.grid.type === 'string'
                ? GridType[encounterData.grid.type as keyof typeof GridType]
                : encounterData.grid.type,
            cellSize: encounterData.grid.cellSize,
            offset: encounterData.grid.offset,
            snap: encounterData.grid.snap,
          });
          assetManagement.setPlacedAssets([]);
          setPlacedWalls([]);
          setPlacedRegions([]);
          setPlacedSources([]);
          setPlacedOpenings([]);
          setIsInitialized(true);
        } finally {
          if (isMounted) {
            setIsHydrating(false);
          }
        }
      };

      initializeEncounter();

      return () => {
        isMounted = false;
      };
    }
  }, [encounterData, isInitialized, dispatch, encounterId, assetManagement]);

  useEffect(() => {
    if (encounterData && isInitialized) {
      setEncounter(encounterData);
      const hydratedWalls = hydratePlacedWalls(encounterData.walls || [], encounterId || '');
      const hydratedRegions = hydratePlacedRegions(encounterData.regions || [], encounterId || '');
      const hydratedSources = hydratePlacedSources(encounterData.sources || [], encounterId || '');
      const hydratedOpenings = hydratePlacedOpenings(encounterData.openings || [], encounterId || '');
      setPlacedWalls(hydratedWalls);
      setPlacedRegions(hydratedRegions);
      setPlacedSources(hydratedSources);
      setPlacedOpenings(hydratedOpenings);
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
          setAssetPickerOpen({ open: true, kind: AssetKind.Monster });
          break;
        case 'characters':
          setAssetPickerOpen({ open: true, kind: AssetKind.Character });
          break;
        case 'walls':
          break;
        case 'regions':
          break;
        case 'sources':
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
      setSelectedSourceIndex(null);
      setSelectedOpeningIndex(null);
      setIsEditingVertices(false);
      if (wallTransaction.transaction.isActive) {
        wallTransaction.rollbackTransaction();
      }
    }
    prevActiveScopeRef.current = activeScope;
  }, [activeScope, assetManagement.handleAssetSelected, wallTransaction]);

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

  const handleBackgroundUpload = useCallback(
    async (file: File) => {
      if (!encounterId) return;

      try {
        const result = await uploadFile({
          file,
          type: 'encounter',
          resource: 'background',
          entityId: encounterId,
        }).unwrap();

        await patchEncounter({
          id: encounterId,
          request: {
            backgroundId: result.id,
          },
        }).unwrap();
      } catch (error) {
        console.error('Failed to upload background:', error);
      }
    },
    [encounterId, uploadFile, patchEncounter],
  );

  useEffect(() => {
    const handleKeyDown = async (e: KeyboardEvent) => {
      if (e.target instanceof HTMLInputElement || e.target instanceof HTMLTextAreaElement) {
        return;
      }

      const isWallTransactionActive = wallTransaction.transaction.isActive;
      const isRegionTransactionActive = regionTransaction.transaction.isActive;
      const isMac = navigator.platform.toUpperCase().indexOf('MAC') >= 0;
      const modifier = isMac ? e.metaKey : e.ctrlKey;

      if (modifier && e.key === 'z' && !e.shiftKey) {
        e.preventDefault();
        e.stopImmediatePropagation();

        if (isWallTransactionActive && wallTransaction.canUndoLocal()) {
          wallTransaction.undoLocal((segments) => {
            const currentEncounter = encounterRef.current;
            if (currentEncounter && selectedWallIndex !== null) {
              let syncedEncounter = currentEncounter;

              const tempWalls = currentEncounter.walls?.filter((w) => w.index < 0) || [];
              tempWalls.forEach((tempWall) => {
                const segmentExists = segments.some((s) => s.tempId === tempWall.index);
                if (!segmentExists) {
                  syncedEncounter = removeWallOptimistic(syncedEncounter, tempWall.index);
                }
              });

              if (segments.length === 1 && segments[0]) {
                syncedEncounter = updateWallOptimistic(syncedEncounter, selectedWallIndex, {
                  poles: segments[0].poles,
                  isClosed: segments[0].isClosed,
                });
              } else {
                const mainSegment = segments.find((s) => s.wallIndex === selectedWallIndex || s.tempId === 0);
                if (mainSegment) {
                  syncedEncounter = updateWallOptimistic(syncedEncounter, selectedWallIndex, {
                    poles: mainSegment.poles,
                    isClosed: mainSegment.isClosed,
                  });
                }
              }

              setEncounter(syncedEncounter);
            }
          });
        } else if (isRegionTransactionActive && regionTransaction.canUndoLocal()) {
          regionTransaction.undoLocal((segment) => {
            const currentEncounter = encounterRef.current;
            if (currentEncounter && drawingRegionIndex !== null) {
              if (segment) {
                const syncedEncounter = updateRegionOptimistic(currentEncounter, drawingRegionIndex, {
                  vertices: segment.vertices,
                });
                setEncounter(syncedEncounter);
              } else {
                setEncounter(currentEncounter);
              }
            }
          });
        } else {
          await undo();
        }
        return;
      }

      if (modifier && (e.key === 'y' || (e.key === 'z' && e.shiftKey))) {
        e.preventDefault();
        e.stopImmediatePropagation();

        if (isWallTransactionActive && wallTransaction.canRedoLocal()) {
          wallTransaction.redoLocal((segments) => {
            const currentEncounter = encounterRef.current;
            if (currentEncounter && selectedWallIndex !== null) {
              const selectedWall = currentEncounter.walls?.find((w) => w.index === selectedWallIndex);
              let syncedEncounter = currentEncounter;

              if (segments.length === 1 && segments[0]) {
                syncedEncounter = updateWallOptimistic(syncedEncounter, selectedWallIndex, {
                  poles: segments[0].poles,
                  isClosed: segments[0].isClosed,
                });
              } else {
                segments.forEach((segment) => {
                  if (segment.wallIndex === selectedWallIndex || segment.tempId === 0) {
                    syncedEncounter = updateWallOptimistic(syncedEncounter, selectedWallIndex, {
                      poles: segment.poles,
                      isClosed: segment.isClosed,
                    });
                  } else if (segment.wallIndex === null) {
                    const existingWall = syncedEncounter.walls?.find((w) => w.index === segment.tempId);
                    if (encounterId && !existingWall && selectedWall) {
                      const tempWall: EncounterWall = {
                        encounterId,
                        index: segment.tempId,
                        name: selectedWall.name,
                        poles: segment.poles,
                        isClosed: segment.isClosed,
                        visibility: selectedWall.visibility,
                        color: selectedWall.color,
                      };
                      syncedEncounter = addWallOptimistic(syncedEncounter, tempWall);
                    }
                  }
                });
              }

              setEncounter(syncedEncounter);
            }
          });
        } else if (isRegionTransactionActive && regionTransaction.canRedoLocal()) {
          regionTransaction.redoLocal((segment) => {
            const currentEncounter = encounterRef.current;
            if (currentEncounter && drawingRegionIndex !== null && segment) {
              const syncedEncounter = updateRegionOptimistic(currentEncounter, drawingRegionIndex, {
                vertices: segment.vertices,
              });
              setEncounter(syncedEncounter);
            }
          });
        } else {
          await redo();
        }
        return;
      }
    };

    window.addEventListener('keydown', handleKeyDown, { capture: true });

    return () => {
      window.removeEventListener('keydown', handleKeyDown, { capture: true });
    };
  }, [wallTransaction, regionTransaction, undo, redo, encounterId, selectedWallIndex, drawingRegionIndex]);

  const handleVerticesChange = useCallback(
    async (wallIndex: number, newPoles: Pole[], newIsClosed?: boolean) => {
      if (!encounter) return;

      if (!wallTransaction.transaction.isActive) {
        console.warn('[handleVerticesChange] No active transaction');
        return;
      }

      if (newPoles.length < 2) {
        console.warn('[handleVerticesChange] Wall must have at least 2 poles');
        return;
      }

      const wall = encounter.walls?.find((w) => w.index === wallIndex);
      if (!wall) return;

      const effectiveIsClosed = newIsClosed !== undefined ? newIsClosed : wall.isClosed;

      const segments = wallTransaction.getActiveSegments();
      const segment = segments.find((s) => s.wallIndex === wallIndex || s.tempId === wallIndex);

      if (!segment) {
        console.warn(`[handleVerticesChange] Segment not found for wallIndex ${wallIndex}`);
        return;
      }

      wallTransaction.updateSegment(segment.tempId, {
        poles: newPoles,
        isClosed: effectiveIsClosed,
      });

      const updatedEncounter = updateWallOptimistic(encounter, wallIndex, {
        poles: newPoles,
        isClosed: effectiveIsClosed,
      });
      setEncounter(updatedEncounter);
    },
    [encounter, wallTransaction],
  );

  const handleRegionVerticesChange = useCallback(
    async (regionIndex: number, newVertices: Point[]) => {
      if (!encounter) return;

      if (!regionTransaction.transaction.isActive) {
        console.warn('[handleRegionVerticesChange] No active transaction');
        return;
      }

      if (newVertices.length < 3) {
        console.warn('[handleRegionVerticesChange] Region must have at least 3 vertices');
        return;
      }

      const region = encounter.regions?.find((r) => r.index === regionIndex);
      if (!region) return;

      const segment = regionTransaction.transaction.segment;
      if (!segment) {
        console.warn(`[handleRegionVerticesChange] Segment not found for regionIndex ${regionIndex}`);
        return;
      }

      regionTransaction.updateVertices(newVertices);

      const updatedEncounter = updateRegionOptimistic(encounter, regionIndex, {
        vertices: newVertices,
      });
      setEncounter(updatedEncounter);
    },
    [encounter, regionTransaction],
  );

  const handleRegionPlacementCancel = useCallback(async () => {
    if (!encounter) return;

    regionTransaction.rollbackTransaction();

    const cleanEncounter = removeRegionOptimistic(encounter, -1);
    setEncounter(cleanEncounter);

    setDrawingRegionIndex(null);
  }, [encounter, regionTransaction]);

  const handleStructurePlacementFinish = useCallback(async () => {
    console.log('[EncounterEditorPage] handleStructurePlacementFinish called, activePanel:', activePanel);
    try {
      if (activePanel === 'regions') {
        console.log('[EncounterEditorPage] Calling regionHandlers.handleStructurePlacementFinish');
        await regionHandlers.handleStructurePlacementFinish();
        console.log('[EncounterEditorPage] regionHandlers.handleStructurePlacementFinish completed');
      } else if (activePanel === 'walls') {
        await wallHandlers.handleWallPlacementFinish();
      } else {
        console.warn('[EncounterEditorPage] activePanel is not regions or walls:', activePanel);
      }
    } catch (error) {
      console.error('Failed to finish structure placement:', error);
      setErrorMessage('Failed to complete structure placement. Please try again.');
    }
  }, [activePanel, regionHandlers, wallHandlers]);

  const handleStructurePlacementCancel = useCallback(async () => {
    if (!encounter) return;

    wallTransaction.rollbackTransaction();

    const cleanEncounter = removeWallOptimistic(encounter, -1);
    setEncounter(cleanEncounter);

    setDrawingWallIndex(null);
  }, [encounter, wallTransaction]);

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

  const handlePlaceWall = useCallback(
    async (properties: {
      visibility: WallVisibility;
      isClosed: boolean;
      defaultHeight: number;
      color?: string;
    }) => {
      if (!encounterId || !encounter) return;

      const existingWalls = encounter.walls || [];

      const wallNumbers = existingWalls
        .map((w) => {
          const match = w.name.match(/^Wall (\d+)$/);
          return match?.[1] ? parseInt(match[1], 10) : null;
        })
        .filter((n): n is number => n !== null);

      const nextNumber = wallNumbers.length > 0 ? Math.max(...wallNumbers) + 1 : 1;
      const wallName = `Wall ${nextNumber}`;

      wallTransaction.startTransaction('placement', undefined, {
        name: wallName,
        visibility: properties.visibility,
        isClosed: properties.isClosed,
        color: properties.color || '#808080',
      });

      const tempWall: EncounterWall = {
        encounterId,
        index: -1,
        name: wallName,
        poles: [],
        visibility: properties.visibility,
        isClosed: properties.isClosed,
        color: properties.color || '#808080',
      };

      const updatedEncounter = addWallOptimistic(encounter, tempWall);
      setEncounter(updatedEncounter);

      setDrawingWallIndex(-1);
      setDrawingWallDefaultHeight(properties.defaultHeight);
    },
    [encounterId, encounter, wallTransaction],
  );

  const handleSourceSelect = useCallback((index: number) => {
    setSelectedSourceIndex(index);
  }, []);

  const handleSourceDelete = useCallback(
    async (index: number) => {
      if (!encounterId || !encounter) return;

      const source = placedSources.find((s) => s.index === index);
      if (!source) return;

      const sourceId = source.id;

      try {
        await removeEncounterSource({
          encounterId,
          sourceIndex: index,
        }).unwrap();

        const { removeEntityMapping } = await import('@/utils/encounterEntityMapping');
        removeEntityMapping(encounterId, 'sources', sourceId);

        const { data: updatedEncounter } = await refetch();
        if (updatedEncounter) {
          setEncounter(updatedEncounter);
          const hydratedSources = hydratePlacedSources(updatedEncounter.sources || [], encounterId);
          setPlacedSources(hydratedSources);
        }

        if (selectedSourceIndex === index) {
          setSelectedSourceIndex(null);
        }
      } catch (error) {
        console.error('Failed to delete source:', error);
        setErrorMessage('Failed to delete source. Please try again.');
      }
    },
    [encounterId, encounter, placedSources, removeEncounterSource, selectedSourceIndex, refetch],
  );

  const handlePlaceSource = useCallback((properties: SourcePlacementProperties) => {
    setSourcePlacementProperties(properties);
    setActiveTool('sourceDrawing');
  }, []);

  const handleSourcePlacementFinish = useCallback((success: boolean) => {
    if (success) {
      setSourcePlacementProperties(null);
      setActiveTool(null);
    }
  }, []);

  const handleOpeningSelect = useCallback((index: number) => {
    setSelectedOpeningIndex(index);
  }, []);

  const handleOpeningDelete = useCallback(
    async (index: number) => {
      if (!encounterId || !encounter) return;

      const opening = placedOpenings.find((o) => o.index === index);
      if (!opening) return;

      const openingId = opening.id;

      try {
        await removeEncounterOpening({
          encounterId,
          openingIndex: index,
        }).unwrap();

        const { removeEntityMapping } = await import('@/utils/encounterEntityMapping');
        removeEntityMapping(encounterId, 'openings', openingId);

        const { data: updatedEncounter } = await refetch();
        if (updatedEncounter) {
          setEncounter(updatedEncounter);
          const hydratedOpenings = hydratePlacedOpenings(updatedEncounter.openings || [], encounterId);
          setPlacedOpenings(hydratedOpenings);
        }

        if (selectedOpeningIndex === index) {
          setSelectedOpeningIndex(null);
        }
      } catch (error) {
        console.error('Failed to delete opening:', error);
        setErrorMessage('Failed to delete opening. Please try again.');
      }
    },
    [encounterId, encounter, placedOpenings, removeEncounterOpening, selectedOpeningIndex, refetch],
  );

  const handlePlaceOpening = useCallback((properties: OpeningPlacementProperties) => {
    setOpeningPlacementProperties(properties);
    setActiveTool('openingDrawing');
  }, []);

  const handleOpeningPlacementComplete = useCallback(
    async (wallIndex: number, centerPosition: number) => {
      if (!encounterId || !encounter || !openingPlacementProperties) return;

      try {
        await addEncounterOpening({
          encounterId,
          ...openingPlacementProperties,
          name: `${openingPlacementProperties.type} ${(encounter.openings?.length || 0) + 1}`,
          centerPosition,
          wallIndex,
        }).unwrap();

        const { data: updatedEncounter } = await refetch();
        if (updatedEncounter) {
          setEncounter(updatedEncounter);
          const hydratedOpenings = hydratePlacedOpenings(updatedEncounter.openings || [], encounterId);
          setPlacedOpenings(hydratedOpenings);
        }

        setOpeningPlacementProperties(null);
        setActiveTool(null);
      } catch (error) {
        console.error('Failed to place opening:', error);
        setErrorMessage('Failed to place opening. Please try again.');
      }
    },
    [encounterId, encounter, openingPlacementProperties, addEncounterOpening, refetch],
  );

  const handleEditOpening = useCallback(
    async (index: number, updates: Partial<PlacedOpening>) => {
      if (!encounterId) return;

      try {
        await updateEncounterOpening({
          encounterId,
          openingIndex: index,
          ...updates,
        }).unwrap();

        const { data: updatedEncounter } = await refetch();
        if (updatedEncounter) {
          setEncounter(updatedEncounter);
          const hydratedOpenings = hydratePlacedOpenings(updatedEncounter.openings || [], encounterId);
          setPlacedOpenings(hydratedOpenings);
        }
      } catch (error) {
        console.error('Failed to edit opening:', error);
        setErrorMessage('Failed to edit opening. Please try again.');
      }
    },
    [encounterId, updateEncounterOpening, refetch],
  );

  const fowRegions = useMemo(() => {
    return placedRegions?.filter((r) => r.type === 'FogOfWar') || [];
  }, [placedRegions]);

  const { handlePolygonComplete, handleBucketFillComplete} = useFogOfWarPlacement({
    encounterId: encounterId || '',
    existingRegions: placedRegions || [],
    mode: fogMode,
    onRegionCreated: async (region) => {
      try {
        const command = new CreateFogOfWarRegionCommand({
          encounterId: encounterId || '',
          region,
          onAdd: async (encId, regionData) => {
            const result = await addEncounterRegion({
              encounterId: encId,
              type: regionData.type,
              name: regionData.name,
              ...(regionData.label !== undefined && { label: regionData.label }),
              ...(regionData.value !== undefined && { value: regionData.value }),
              vertices: regionData.vertices,
            }).unwrap();
            return result;
          },
          onRemove: async (encId, regionIndex) => {
            await removeEncounterRegion({
              encounterId: encId,
              regionIndex,
            }).unwrap();
          },
          onRefetch: async () => {
            const { data } = await refetch();
            if (data) {
              setEncounter(data);
              const hydratedRegions = hydratePlacedRegions(data.regions || [], encounterId || '');
              setPlacedRegions(hydratedRegions);
            }
          },
        });

        await execute(command);
        setFogDrawingTool(null);
      } catch (error) {
        console.error('Failed to create FoW region:', error);
        setErrorMessage('Failed to create fog region. Please try again.');
      }
    },
    onRegionsDeleted: async (regionIndices) => {
      try {
        for (const regionIndex of regionIndices) {
          await removeEncounterRegion({
            encounterId: encounterId || '',
            regionIndex,
          }).unwrap();
        }
        const { data } = await refetch();
        if (data) {
          setEncounter(data);
          const hydratedRegions = hydratePlacedRegions(data.regions || [], encounterId || '');
          setPlacedRegions(hydratedRegions);
        }
      } catch (error) {
        console.error('Failed to delete old FoW regions:', error);
        setErrorMessage('Failed to merge fog regions. Please try again.');
      }
    },
  });

  const handleFogModeChange = useCallback((mode: 'add' | 'subtract') => {
    setFogMode(mode);
  }, []);

  const handleFogDrawPolygon = useCallback(() => {
    setFogDrawingTool('polygon');
  }, []);

  const handleFogBucketFill = useCallback(() => {
    setFogDrawingTool('bucketFill');
  }, []);

  const handleFogHideAll = useCallback(async () => {
    try {
      if (fogMode !== 'add') {
        setFogMode('add');
        return;
      }

      const fullStageVertices: Point[] = [
        { x: 0, y: 0 },
        { x: STAGE_WIDTH, y: 0 },
        { x: STAGE_WIDTH, y: STAGE_HEIGHT },
        { x: 0, y: STAGE_HEIGHT },
      ];

      await handlePolygonComplete(fullStageVertices);
    } catch (error) {
      console.error('Failed to hide all areas:', error);
      setErrorMessage('Failed to hide all areas. Please try again.');
    }
  }, [fogMode, handlePolygonComplete]);

  const handleFogRevealAll = useCallback(async () => {
    try {
      const fowRegionsToReveal = (placedRegions || [])
        .filter((region) => region.type === 'FogOfWar')
        .map((pr) => ({
          encounterId: pr.encounterId,
          index: pr.index,
          name: pr.name,
          type: pr.type,
          vertices: pr.vertices,
          ...(pr.value !== undefined && { value: pr.value }),
          ...(pr.label !== undefined && { label: pr.label }),
        }));

      if (fowRegionsToReveal.length === 0) {
        return;
      }

      const command = new RevealAllFogOfWarCommand({
        encounterId: encounterId || '',
        fogRegions: fowRegionsToReveal,
        onAdd: async (encId, regionData) => {
          const result = await addEncounterRegion({
            encounterId: encId,
            type: regionData.type,
            name: regionData.name,
            ...(regionData.label !== undefined && { label: regionData.label }),
            ...(regionData.value !== undefined && { value: regionData.value }),
            vertices: regionData.vertices,
          }).unwrap();
          return result;
        },
        onRemove: async (encId, regionIndex) => {
          await removeEncounterRegion({
            encounterId: encId,
            regionIndex,
          }).unwrap();
        },
        onRefetch: async () => {
          const { data } = await refetch();
          if (data) {
            setEncounter(data);
            const hydratedRegions = hydratePlacedRegions(data.regions || [], encounterId || '');
            setPlacedRegions(hydratedRegions);
          }
        },
      });

      await execute(command);
    } catch (error) {
      console.error('Failed to reveal all areas:', error);
      setErrorMessage('Failed to reveal all areas. Please try again.');
    }
  }, [placedRegions, encounterId, addEncounterRegion, removeEncounterRegion, refetch, execute]);

  const visibleAssets = useMemo(() => {
    return assetManagement.placedAssets.filter((asset) => {
      if (asset.asset.kind === AssetKind.Object && !scopeVisibility.objects) {
        return false;
      }
      if (asset.asset.kind === AssetKind.Monster && !scopeVisibility.monsters) {
        return false;
      }
      if (asset.asset.kind === AssetKind.Character && !scopeVisibility.characters) {
        return false;
      }
      return true;
    });
  }, [assetManagement.placedAssets, scopeVisibility.objects, scopeVisibility.monsters, scopeVisibility.characters]);

  if (isLoadingEncounter || isHydrating) {
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
            <Typography variant='h6'>{isLoadingEncounter ? 'Loading Encounter...' : 'Preparing Assets...'}</Typography>
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

  const backgroundUrl = encounter?.stage?.background
    ? `${getApiEndpoints().media}/${encounter.stage.background.id}`
    : undefined;

  return (
    <EditorLayout
      encounter={encounter || undefined}
      onEncounterNameChange={encounterSettings.handleEncounterNameChange}
      onBackClick={encounterSettings.handleBackClick}
      onEncounterDescriptionChange={encounterSettings.handleEncounterDescriptionChange}
      onEncounterPublishedChange={encounterSettings.handleEncounterPublishedChange}
      onEncounterUpdate={encounterSettings.handleEncounterUpdate}
      gridConfig={gridConfig}
      onGridChange={gridHandlers.handleGridChange}
      {...(backgroundUrl && { backgroundUrl })}
      isUploadingBackground={isUploadingBackground}
      onBackgroundUpload={handleBackgroundUpload}
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
          onGridToggle={() =>
            setGridConfig((prev) => ({
              ...prev,
              type: prev.type === GridType.NoGrid ? GridType.Square : GridType.NoGrid,
            }))
          }
          onClearSelection={() => assetManagement.handleAssetSelected([])}
          canUndo={false}
          canRedo={false}
          gridVisible={gridConfig.type !== GridType.NoGrid}
          layerVisibility={scopeVisibility}
          onLayerVisibilityToggle={handleLayerVisibilityToggle}
          onShowAllLayers={handleShowAllLayers}
          onHideAllLayers={handleHideAllLayers}
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
            onPlaceWall={handlePlaceWall}
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
            encounterSources={placedSources}
            selectedSourceIndex={selectedSourceIndex}
            onSourceSelect={handleSourceSelect}
            onSourceDelete={handleSourceDelete}
            onPlaceSource={handlePlaceSource}
            encounterOpenings={placedOpenings}
            selectedOpeningIndex={selectedOpeningIndex}
            onOpeningSelect={handleOpeningSelect}
            onOpeningDelete={handleOpeningDelete}
            onPlaceOpening={handlePlaceOpening}
            onEditOpening={handleEditOpening}
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
            initialPosition={{ x: initialViewport.x, y: initialViewport.y }}
            backgroundColor={theme.palette.background.default}
            onViewportChange={viewportControls.handleViewportChange}
            stageCallbackRef={stageCallbackRef}
          >
            {/* ===== KONVA LAYER HIERARCHY (Z-ORDER) =====
              *
              * LAYER STACK (bottom to top):
              * 0. Static Layer - Background image, grid lines
              * 1. GameWorld Layer - Regions, Sources, Walls, Openings, Transformers
              * 2. Assets Layer - Tokens, Objects, Monsters, Characters
              * 3. DrawingTools Layer - Wall/Region/Source/Opening drawing tools
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
                imageUrl={backgroundImageUrl}
                backgroundColor={theme.palette.background.default}
                stageWidth={STAGE_WIDTH}
                stageHeight={STAGE_HEIGHT}
              />

              <GridRenderer
                grid={gridConfig}
                stageWidth={STAGE_WIDTH}
                stageHeight={STAGE_HEIGHT}
                visible={gridConfig.type !== GridType.NoGrid}
              />
            </Layer>

            {/* Layer 2: GameWorld (structures, objects, monsters) */}
            <Layer name={LayerName.GameWorld} listening={true}>
              {/* Regions - render first (bottom of GameWorld) */}
              {scopeVisibility.regions && placedRegions && placedRegions.length > 0 && (
                <Group name={GroupName.Structure}>
                  {placedRegions.map((encounterRegion) => {
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
                        activeScope={activeScope}
                        onSelect={regionHandlers.handleEditRegionVertices}
                        isSelected={selectedRegionIndex === encounterRegion.index}
                      />
                    );
                  })}
                </Group>
              )}

              {/* Sources - render second */}
              {scopeVisibility.sources && encounter && placedSources && placedSources.length > 0 && (
                <Group name={GroupName.Structure}>
                  {placedSources.map((encounterSource) => (
                    <SourceRenderer
                      key={encounterSource.id}
                      encounterSource={encounterSource}
                      walls={encounter.walls || []}
                      gridConfig={gridConfig}
                      activeScope={activeScope}
                      onSelect={handleSourceSelect}
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
                      .map((segment) => (
                        <WallTransformer
                          key={`transformer-${segment.tempId}`}
                          poles={segment.poles}
                          isClosed={segment.isClosed}
                          onPolesChange={(newPoles, newIsClosed) =>
                            handleVerticesChange(segment.wallIndex || segment.tempId, newPoles, newIsClosed)
                          }
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
                        />
                      ))}
                </Group>
              )}

              {/* Openings - render fourth (on walls) */}
              {scopeVisibility.openings && encounter && placedOpenings && placedOpenings.length > 0 && (
                <Group name={GroupName.Structure}>
                  {placedOpenings.map((encounterOpening) => {
                    const wall = encounter.walls?.find((w) => w.index === encounterOpening.wallIndex);
                    if (!wall) return null;

                    return (
                      <OpeningRenderer
                        key={encounterOpening.id}
                        encounterOpening={encounterOpening}
                        wall={wall}
                        isSelected={selectedOpeningIndex === encounterOpening.index}
                        onSelect={() => handleOpeningSelect(encounterOpening.index)}
                        activeScope={activeScope}
                      />
                    );
                  })}
                </Group>
              )}

              {/* Region Transformer */}
              {scopeVisibility.regions &&
                encounter?.regions &&
                isEditingRegionVertices &&
                editingRegionIndex !== null &&
                regionTransaction.transaction.isActive &&
                regionTransaction.transaction.segment && (
                  <Group name={GroupName.Structure}>
                    <RegionTransformer
                      encounterId={encounterId || ''}
                      regionIndex={editingRegionIndex}
                      segment={regionTransaction.transaction.segment}
                      gridConfig={gridConfig}
                      viewport={viewportControls.viewport}
                      onVerticesChange={(newVertices: Point[]) =>
                        handleRegionVerticesChange(editingRegionIndex, newVertices)
                      }
                      onClearSelections={regionHandlers.handleFinishEditingRegion}
                      onFinish={regionHandlers.handleFinishEditingRegion}
                      onCancel={regionHandlers.handleCancelEditingRegion}
                      onLocalAction={(action: LocalAction) => regionTransaction.pushLocalAction(action)}
                      {...(regionTransaction.transaction.segment.color && {
                        color: regionTransaction.transaction.segment.color,
                      })}
                    />
                  </Group>
                )}
            </Layer>

            {/* Layer 3: Assets (tokens/objects/monsters) - creates Layer internally */}
            {encounter && (
              <TokenPlacement
                placedAssets={visibleAssets}
                onAssetPlaced={assetManagement.handleAssetPlaced}
                onAssetMoved={assetManagement.handleAssetMoved}
                onAssetDeleted={assetManagement.handleAssetDeleted}
                gridConfig={gridConfig}
                draggedAsset={assetManagement.draggedAsset}
                onDragComplete={assetManagement.handleDragComplete}
                onImagesLoaded={canvasReadyState.handleImagesLoaded}
                snapMode={keyboardState.snapMode}
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
                    onCancel={handleStructurePlacementCancel}
                    onFinish={handleStructurePlacementFinish}
                    onPolesChange={(newPoles) => {
                      wallTransaction.updateSegment(-1, { poles: newPoles });

                      if (encounter) {
                        const updatedEncounter = updateWallOptimistic(encounter, -1, { poles: newPoles });
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
                    onCancel={handleRegionPlacementCancel}
                    onFinish={handleStructurePlacementFinish}
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
                    onCancel={handleRegionPlacementCancel}
                    onFinish={regionHandlers.handleBucketFillFinish}
                    regionType={regionTransaction.transaction.segment?.type || 'Elevation'}
                    {...(regionTransaction.transaction.segment?.color && {
                      regionColor: regionTransaction.transaction.segment.color,
                    })}
                    regionTransaction={regionTransaction}
                    walls={encounter.walls || []}
                    openings={encounter.openings || []}
                    stageSize={{ width: STAGE_WIDTH, height: STAGE_HEIGHT }}
                  />
                )}
                {activeTool === 'sourceDrawing' && sourcePlacementProperties && encounter && (
                  <SourceDrawingTool
                    encounterId={encounterId || ''}
                    source={{
                      encounterId: encounterId || '',
                      index: -1,
                      name: `${sourcePlacementProperties.type} Source ${(encounter.sources?.length || 0) + 1}`,
                      position: { x: 0, y: 0 },
                      ...sourcePlacementProperties,
                    }}
                    walls={encounter.walls || []}
                    gridConfig={gridConfig}
                    onComplete={handleSourcePlacementFinish}
                    onCancel={() => {
                      setSourcePlacementProperties(null);
                      setActiveTool(null);
                    }}
                  />
                )}
                {activeTool === 'openingDrawing' && openingPlacementProperties && encounter && (
                  <OpeningDrawingTool
                    encounterId={encounterId || ''}
                    properties={openingPlacementProperties}
                    walls={encounter.walls || []}
                    gridConfig={gridConfig}
                    onComplete={handleOpeningPlacementComplete}
                    onCancel={() => {
                      setOpeningPlacementProperties(null);
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
                    walls={encounter.walls || []}
                    openings={encounter.openings || []}
                    stageSize={{ width: STAGE_WIDTH, height: STAGE_HEIGHT }}
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
              snapMode={keyboardState.snapMode}
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
          gridSnapEnabled={gridConfig.snap}
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
        onWallContextMenuClose={contextMenus.wallContextMenu.handleClose}
        onWallEditVertices={wallHandlers.handleEditVertices}
        onWallDelete={wallHandlers.handleWallDelete}
        errorMessage={errorMessage}
        onErrorMessageClose={() => setErrorMessage(null)}
      />

      {assetPickerOpen.kind && (
        <AssetPicker
          open={assetPickerOpen.open}
          onClose={() => setAssetPickerOpen({ open: false })}
          onSelect={(asset) => {
            setAssetPickerOpen({ open: false });
            assetManagement.setDraggedAsset(asset);
          }}
          kind={assetPickerOpen.kind}
        />
      )}
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
