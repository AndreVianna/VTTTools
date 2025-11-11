import React, { useState, useRef, useEffect, useCallback } from 'react';
import { Box, useTheme, CircularProgress, Typography, Alert } from '@mui/material';
import { useParams } from 'react-router-dom';
import { Layer, Group } from 'react-konva';
import Konva from 'konva';
import {
    EncounterCanvas,
    EncounterCanvasHandle,
    BackgroundLayer,
    GridRenderer,
    TokenPlacement,
    TokenDragHandle,
    EditorDialogs,
    DrawingMode,
    WallDrawingTool,
    RegionDrawingTool,
    SourceDrawingTool,
    WallRenderer,
    RegionRenderer,
    SourceRenderer,
    WallTransformer,
    RegionTransformer,
    LeftToolBar,
    TopToolBar,
    EditorStatusBar
} from '@components/encounter';
import { EditingBlocker } from '@components/common';
import { EditorLayout } from '@components/layout';
import { GridConfig, GridType, getDefaultGrid } from '@utils/gridCalculator';
import { layerManager, LayerName, GroupName } from '@services/layerManager';
import {
    AssetKind,
    PlacedAsset,
    Encounter,
    EncounterWall,
    PlacedWall,
    PlacedRegion,
    PlacedSource,
    WallVisibility,
    Pole,
    Point
} from '@/types/domain';
import { UndoRedoProvider, useUndoRedoContext } from '@/contexts/UndoRedoContext';
import { ClipboardProvider } from '@/contexts/ClipboardContext';
import { useClipboard } from '@/contexts/useClipboard';
import { useConnectionStatus } from '@/hooks/useConnectionStatus';
import { useWallTransaction } from '@/hooks/useWallTransaction';
import { useRegionTransaction } from '@/hooks/useRegionTransaction';
import {
    useEncounterSettings,
    useGridHandlers,
    useWallHandlers,
    useRegionHandlers,
    useKeyboardState,
    useCanvasReadyState,
    useViewportControls,
    useContextMenus,
    useAssetManagement
} from './EncounterEditor/hooks';
import {
    addWallOptimistic, removeWallOptimistic, updateWallOptimistic,
    removeRegionOptimistic, updateRegionOptimistic
} from '@/utils/encounterStateUtils';
import {
    useGetEncounterQuery,
    usePatchEncounterMutation,
    useAddEncounterAssetMutation,
    useUpdateEncounterAssetMutation,
    useBulkUpdateEncounterAssetsMutation,
    useRemoveEncounterAssetMutation,
    useBulkDeleteEncounterAssetsMutation,
    useBulkAddEncounterAssetsMutation,
    useAddEncounterWallMutation,
    useRemoveEncounterWallMutation,
    useUpdateEncounterWallMutation,
    useAddEncounterRegionMutation,
    useUpdateEncounterRegionMutation,
    useRemoveEncounterRegionMutation,
    useRemoveEncounterSourceMutation
} from '@/services/encounterApi';
import type { SourcePlacementProperties } from '@components/encounter/panels';
import { useUploadFileMutation } from '@/services/mediaApi';
import { hydratePlacedAssets, hydratePlacedWalls, hydratePlacedRegions, hydratePlacedSources } from '@/utils/encounterMappers';
import { getApiEndpoints } from '@/config/development';
import { SaveStatus } from '@/components/common';
import { useAppDispatch } from '@/store';
import { assetsApi } from '@/services/assetsApi';

const STAGE_WIDTH = 2800;
const STAGE_HEIGHT = 2100;
const ENCOUNTER_DEFAULT_BACKGROUND = '/assets/backgrounds/tavern.png';

const EncounterEditorPageInternal: React.FC = () => {
    const theme = useTheme();
    const { encounterId } = useParams<{ encounterId: string }>();
    const canvasRef = useRef<EncounterCanvasHandle>(null);
    const stageRef = useRef<Konva.Stage>(null);
    const { execute, recordAction, undo, redo } = useUndoRedoContext();
    const { copyAssets, cutAssets, clipboard, canPaste, getClipboardAssets, clearClipboard } = useClipboard();
    const { isOnline } = useConnectionStatus();
    const wallTransaction = useWallTransaction();
    const regionTransaction = useRegionTransaction();
    const { data: encounterData, isLoading: isLoadingEncounter, error: encounterError, refetch } = useGetEncounterQuery(
        encounterId || '',
        {
            skip: !encounterId
        }
    );
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

    // Force refetch on mount with forceRefetch option
    useEffect(() => {
        if (encounterId) {
            refetch();
        }
    }, []); // eslint-disable-line react-hooks/exhaustive-deps

    const [isInitialized, setIsInitialized] = useState(false);
    const [encounter, setEncounter] = useState<Encounter | null>(null);
    const encounterRef = useRef<Encounter | null>(null);
    const [placedWalls, setPlacedWalls] = useState<PlacedWall[]>([]);
    const [placedRegions, setPlacedRegions] = useState<PlacedRegion[]>([]);
    const [placedSources, setPlacedSources] = useState<PlacedSource[]>([]);

    useEffect(() => {
        encounterRef.current = encounter;
    }, [encounter]);

    const initialViewport = {
        x: (window.innerWidth - STAGE_WIDTH) / 2,
        y: (window.innerHeight - STAGE_HEIGHT) / 2,
        scale: 1
    };

    const [gridConfig, setGridConfig] = useState<GridConfig>(getDefaultGrid());
    const [backgroundImageUrl] = useState<string>(ENCOUNTER_DEFAULT_BACKGROUND);
    const [isHydrating, setIsHydrating] = useState(false);
    const [saveStatus, setSaveStatus] = useState<SaveStatus>('idle');
    const [errorMessage, setErrorMessage] = useState<string | null>(null);

    const [drawingMode, setDrawingMode] = useState<DrawingMode>(null);
    const [selectedWallIndex, setSelectedWallIndex] = useState<number | null>(null);
    const [drawingWallIndex, setDrawingWallIndex] = useState<number | null>(null);
    const [drawingWallDefaultHeight, setDrawingWallDefaultHeight] = useState<number>(10);
    const [isEditingVertices, setIsEditingVertices] = useState(false);
    const [_originalWallPoles, setOriginalWallPoles] = useState<Pole[] | null>(null);

    const [selectedRegionIndex, setSelectedRegionIndex] = useState<number | null>(null);
    const [drawingRegionIndex, setDrawingRegionIndex] = useState<number | null>(null);
    const [editingRegionIndex, setEditingRegionIndex] = useState<number | null>(null);
    const [isEditingRegionVertices, setIsEditingRegionVertices] = useState(false);
    const [originalRegionVertices, setOriginalRegionVertices] = useState<Point[] | null>(null);

    const [selectedSourceIndex, setSelectedSourceIndex] = useState<number | null>(null);
    const [sourcePlacementProperties, setSourcePlacementProperties] = useState<SourcePlacementProperties | null>(null);
    const [activeTool, setActiveTool] = useState<string | null>(null);

    interface LayerVisibility {
        background: boolean;
        grid: boolean;
        structures: boolean;
        objects: boolean;
        creatures: boolean;
        overlays: boolean;
    }

    const [layerVisibility, _setLayerVisibility] = useState<LayerVisibility>({
        background: true,
        grid: true,
        structures: true,
        objects: true,
        creatures: true,
        overlays: true
    });
    const [activePanel, setActivePanel] = useState<string | null>(null);

    const saveChanges = useCallback(async (overrides?: Partial<{
        name: string;
        description: string;
        isPublished: boolean;
        grid: {
            type: any;
            cellSize: { width: number; height: number };
            offset: { left: number; top: number };
            snap: boolean;
        };
    }>) => {
        if (!encounterId || !encounter || !isInitialized) {
            return;
        }

        const currentData = {
            name: encounter.name,
            description: encounter.description,
            isPublished: encounter.isPublished,
            grid: {
                type: gridConfig.type as any,
                cellSize: gridConfig.cellSize,
                offset: gridConfig.offset,
                snap: gridConfig.snap
            },
            ...overrides
        };

        const hasChanges =
            currentData.name !== encounter.name ||
            currentData.description !== encounter.description ||
            currentData.isPublished !== encounter.isPublished ||
            JSON.stringify(currentData.grid) !== JSON.stringify({
                type: typeof encounter.grid.type === 'string'
                    ? GridType[encounter.grid.type as keyof typeof GridType]
                    : encounter.grid.type,
                cellSize: encounter.grid.cellSize,
                offset: encounter.grid.offset,
                snap: encounter.grid.snap
            });

        if (!hasChanges) {
            return;
        }

        setSaveStatus('saving');

        const requestPayload = {
            name: currentData.name,
            description: currentData.description,
            isPublished: currentData.isPublished,
            grid: currentData.grid
        };

        try {
            const result = await patchEncounter({
                id: encounterId,
                request: requestPayload
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
    }, [encounterId, encounter, isInitialized, gridConfig, patchEncounter, refetch]);

    const encounterSettings = useEncounterSettings({
        encounterId,
        encounter,
        setEncounter,
        saveChanges
    });

    const gridHandlers = useGridHandlers({
        setGridConfig,
        saveChanges
    });

    const wallHandlers = useWallHandlers({
        encounterId,
        encounter,
        wallTransaction,
        selectedWallIndex,
        drawingMode,
        drawingWallIndex,
        addEncounterWall,
        updateEncounterWall,
        removeEncounterWall,
        setEncounter,
        setPlacedWalls,
        setSelectedWallIndex,
        setDrawingWallIndex,
        setDrawingMode,
        setIsEditingVertices,
        setOriginalWallPoles,
        setActivePanel,
        setErrorMessage,
        execute,
        refetch
    });

    const regionHandlers = useRegionHandlers({
        encounterId,
        encounter,
        regionTransaction,
        gridConfig,
        selectedRegionIndex,
        editingRegionIndex,
        originalRegionVertices,
        drawingMode,
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
        setDrawingMode,
        setErrorMessage,
        execute,
        recordAction,
        refetch
    });

    const keyboardState = useKeyboardState({
        gridConfig,
        onEscapeKey: () => {
            if (isEditingVertices && wallTransaction.transaction.isActive) {
                wallHandlers.handleCancelEditing();
            } else if (assetManagement?.draggedAsset) {
                assetManagement.setDraggedAsset(null);
            }
        },
        onEnterKey: () => {
            if (isEditingVertices && wallTransaction.transaction.isActive) {
                wallHandlers.handleFinishEditing();
            }
        }
    });

    const canvasReadyState = useCanvasReadyState({
        stageRef
    });

    const viewportControls = useViewportControls({
        initialViewport,
        canvasRef
    });

    const contextMenus = useContextMenus({
        encounter
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
        clipboard,
        clearClipboard,
        addEncounterAsset,
        updateEncounterAsset,
        bulkUpdateEncounterAssets,
        removeEncounterAsset,
        bulkDeleteEncounterAssets,
        bulkAddEncounterAssets,
        refetch
    });

    useEffect(() => {
        if (encounterData && !isInitialized) {
            const initializeEncounter = async () => {
                setIsHydrating(true);
                try {
                    const hydratedAssets = await hydratePlacedAssets(
                        encounterData.assets,
                        encounterId || '',
                        async (assetId: string) => {
                            const result = await dispatch(
                                assetsApi.endpoints.getAsset.initiate(assetId)
                            ).unwrap();
                            return result;
                        }
                    );

                    const hydratedWalls = hydratePlacedWalls(encounterData.walls || [], encounterId || '');
                    const hydratedRegions = hydratePlacedRegions(encounterData.regions || [], encounterId || '');
                    const hydratedSources = hydratePlacedSources(encounterData.sources || [], encounterId || '');

                    setEncounter(encounterData);
                    setGridConfig({
                        type: typeof encounterData.grid.type === 'string'
                            ? GridType[encounterData.grid.type as keyof typeof GridType]
                            : encounterData.grid.type,
                        cellSize: encounterData.grid.cellSize,
                        offset: encounterData.grid.offset,
                        snap: encounterData.grid.snap
                    });
                    assetManagement.setPlacedAssets(hydratedAssets);
                    setPlacedWalls(hydratedWalls);
                    setPlacedRegions(hydratedRegions);
                    setPlacedSources(hydratedSources);
                    setIsInitialized(true);
                } catch (error) {
                    console.error('Failed to hydrate encounter:', error);
                    setEncounter(encounterData);
                    setGridConfig({
                        type: typeof encounterData.grid.type === 'string'
                            ? GridType[encounterData.grid.type as keyof typeof GridType]
                            : encounterData.grid.type,
                        cellSize: encounterData.grid.cellSize,
                        offset: encounterData.grid.offset,
                        snap: encounterData.grid.snap
                    });
                    assetManagement.setPlacedAssets([]);
                    setPlacedWalls([]);
                    setPlacedRegions([]);
                    setPlacedSources([]);
                    setIsInitialized(true);
                } finally {
                    setIsHydrating(false);
                }
            };

            initializeEncounter();
        }
    }, [encounterData, isInitialized, dispatch, encounterId]);

    useEffect(() => {
        if (encounterData && isInitialized) {
            setEncounter(encounterData);
            const hydratedWalls = hydratePlacedWalls(encounterData.walls || [], encounterId || '');
            const hydratedRegions = hydratePlacedRegions(encounterData.regions || [], encounterId || '');
            const hydratedSources = hydratePlacedSources(encounterData.sources || [], encounterId || '');
            setPlacedWalls(hydratedWalls);
            setPlacedRegions(hydratedRegions);
            setPlacedSources(hydratedSources);
        }
    }, [encounterData, isInitialized, encounterId]);


    

    

    

    

    

    // Initialize Stage reference when EncounterCanvas is ready
    // CRITICAL: TokenDragHandle depends on this ref being set to attach event handlers
    // NOTE: Runs when imagesLoaded or handlersReady changes to retry stage initialization
    const [stageReady, setStageReady] = useState(false);

    useEffect(() => {
        const stage = canvasRef.current?.getStage();

        if (stage && stage !== stageRef.current) {
            stageRef.current = stage;
            layerManager.initialize(stage);
            layerManager.enforceZOrder();
            setStageReady(true);
        }
    });


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




    const handleBackgroundUpload = useCallback(async (file: File) => {
        if (!encounterId) return;

        try {
            const result = await uploadFile({
                file,
                type: 'encounter',
                resource: 'background',
                entityId: encounterId
            }).unwrap();

            await patchEncounter({
                id: encounterId,
                request: {
                    backgroundId: result.id
                }
            }).unwrap();

        } catch (error) {
            console.error('Failed to upload background:', error);
        }
    }, [encounterId, uploadFile, patchEncounter]);

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

                            const tempWalls = currentEncounter.walls?.filter(w => w.index < 0) || [];
                            tempWalls.forEach(tempWall => {
                                const segmentExists = segments.some(s => s.tempId === tempWall.index);
                                if (!segmentExists) {
                                    syncedEncounter = removeWallOptimistic(syncedEncounter, tempWall.index);
                                }
                            });

                            if (segments.length === 1) {
                                syncedEncounter = updateWallOptimistic(syncedEncounter, selectedWallIndex, {
                                    poles: segments[0]!.poles,
                                    isClosed: segments[0]!.isClosed
                                });
                            } else {
                                const mainSegment = segments.find(s => s.wallIndex === selectedWallIndex || s.tempId === 0);
                                if (mainSegment) {
                                    syncedEncounter = updateWallOptimistic(syncedEncounter, selectedWallIndex, {
                                        poles: mainSegment.poles,
                                        isClosed: mainSegment.isClosed
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
                                    vertices: segment.vertices
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
                            const selectedWall = currentEncounter.walls?.find(w => w.index === selectedWallIndex);
                            let syncedEncounter = currentEncounter;

                            if (segments.length === 1) {
                                syncedEncounter = updateWallOptimistic(syncedEncounter, selectedWallIndex, {
                                    poles: segments[0]!.poles,
                                    isClosed: segments[0]!.isClosed
                                });
                            } else {
                                segments.forEach(segment => {
                                    if (segment.wallIndex === selectedWallIndex || segment.tempId === 0) {
                                        syncedEncounter = updateWallOptimistic(syncedEncounter, selectedWallIndex, {
                                            poles: segment.poles,
                                            isClosed: segment.isClosed
                                        });
                                    } else if (segment.wallIndex === null) {
                                        const existingWall = syncedEncounter.walls?.find(w => w.index === segment.tempId);
                                        if (encounterId && !existingWall && selectedWall) {
                                            const tempWall: EncounterWall = {
                                                encounterId,
                                                index: segment.tempId,
                                                name: selectedWall.name,
                                                poles: segment.poles,
                                                isClosed: segment.isClosed,
                                                visibility: selectedWall.visibility,
                                                material: selectedWall.material,
                                                color: selectedWall.color
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
                                vertices: segment.vertices
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

    const handleVerticesChange = useCallback(async (
        wallIndex: number,
        newPoles: Pole[],
        newIsClosed?: boolean
    ) => {
        if (!encounter) return;

        if (!wallTransaction.transaction.isActive) {
            console.warn('[handleVerticesChange] No active transaction');
            return;
        }

        if (newPoles.length < 2) {
            console.warn('[handleVerticesChange] Wall must have at least 2 poles');
            return;
        }

        const wall = encounter.walls?.find(w => w.index === wallIndex);
        if (!wall) return;

        const effectiveIsClosed = newIsClosed !== undefined ? newIsClosed : wall.isClosed;

        const segments = wallTransaction.getActiveSegments();
        const segment = segments.find(s =>
            s.wallIndex === wallIndex || s.tempId === wallIndex
        );

        if (!segment) {
            console.warn(`[handleVerticesChange] Segment not found for wallIndex ${wallIndex}`);
            return;
        }

        wallTransaction.updateSegment(segment.tempId, {
            poles: newPoles,
            isClosed: effectiveIsClosed
        });

        const updatedEncounter = updateWallOptimistic(encounter, wallIndex, {
            poles: newPoles,
            isClosed: effectiveIsClosed
        });
        setEncounter(updatedEncounter);
    }, [encounter, wallTransaction, setEncounter]);

    const handleRegionVerticesChange = useCallback(async (
        regionIndex: number,
        newVertices: Point[]
    ) => {
        if (!encounter) return;

        if (!regionTransaction.transaction.isActive) {
            console.warn('[handleRegionVerticesChange] No active transaction');
            return;
        }

        if (newVertices.length < 3) {
            console.warn('[handleRegionVerticesChange] Region must have at least 3 vertices');
            return;
        }

        const region = encounter.regions?.find(r => r.index === regionIndex);
        if (!region) return;

        const segment = regionTransaction.transaction.segment;
        if (!segment) {
            console.warn(`[handleRegionVerticesChange] Segment not found for regionIndex ${regionIndex}`);
            return;
        }

        regionTransaction.updateVertices(newVertices);

        const updatedEncounter = updateRegionOptimistic(encounter, regionIndex, {
            vertices: newVertices
        });
        setEncounter(updatedEncounter);
    }, [encounter, regionTransaction, setEncounter]);

    const handleRegionPlacementCancel = useCallback(async () => {
        if (!encounter) return;

        regionTransaction.rollbackTransaction();

        const cleanEncounter = removeRegionOptimistic(encounter, -1);
        setEncounter(cleanEncounter);

        setDrawingRegionIndex(null);
        setDrawingMode(null);
    }, [encounter, regionTransaction]);

    const handleStructurePlacementFinish = useCallback(async () => {
        try {
            if (drawingMode === 'region') {
                await regionHandlers.handleStructurePlacementFinish();
            } else if (drawingMode === 'wall') {
                await wallHandlers.handleWallPlacementFinish();
            }
        } catch (error) {
            console.error('Failed to finish structure placement:', error);
            setErrorMessage('Failed to complete structure placement. Please try again.');
        }
    }, [drawingMode, regionHandlers, wallHandlers, setErrorMessage]);

    const handleDrawingModeChange = (mode: DrawingMode) => {
        setDrawingMode(mode);
    };

    const handleStructurePlacementCancel = useCallback(async () => {
        if (!encounter) return;

        wallTransaction.rollbackTransaction();

        const cleanEncounter = removeWallOptimistic(encounter, -1);
        setEncounter(cleanEncounter);

        setDrawingWallIndex(null);
        setDrawingMode(null);
    }, [encounter, wallTransaction]);

    const handlePlacedAssetUpdate = useCallback(async (assetId: string, updates: Partial<PlacedAsset>) => {
        if (!encounterId || !encounter) return;

        const asset = assetManagement.placedAssets.find(a => a.id === assetId);
        if (!asset) return;

        const updatedAsset = { ...asset, ...updates };

        try {
            await updateEncounterAsset({
                encounterId,
                assetId,
                position: updatedAsset.position,
                size: updatedAsset.size,
                rotation: updatedAsset.rotation,
                ...(updates.displayName && { displayName: updates.displayName }),
                ...(updates.labelPosition && { labelPosition: updates.labelPosition })
            }).unwrap();

            assetManagement.setPlacedAssets(prev =>
                prev.map(a => a.id === assetId ? updatedAsset : a)
            );
        } catch (error) {
            console.error('Failed to update asset:', error);
            setErrorMessage('Failed to update asset. Please try again.');
        }
    }, [encounterId, encounter, assetManagement, updateEncounterAsset]);




    const handlePlaceWall = useCallback(async (properties: {
        visibility: WallVisibility;
        isClosed: boolean;
        material?: string;
        defaultHeight: number;
        color?: string;
    }) => {
        if (!encounterId || !encounter) return;

        const existingWalls = encounter.walls || [];

        const wallNumbers = existingWalls
            .map(w => {
                const match = w.name.match(/^Wall (\d+)$/);
                return match ? parseInt(match[1]!, 10) : null;
            })
            .filter((n): n is number => n !== null);

        const nextNumber = wallNumbers.length > 0 ? Math.max(...wallNumbers) + 1 : 1;
        const wallName = `Wall ${nextNumber}`;

        wallTransaction.startTransaction('placement', undefined, {
            name: wallName,
            visibility: properties.visibility,
            isClosed: properties.isClosed,
            material: properties.material,
            color: properties.color || '#808080'
        });

        const tempWall: EncounterWall = {
            encounterId,
            index: -1,
            name: wallName,
            poles: [],
            visibility: properties.visibility,
            isClosed: properties.isClosed,
            material: properties.material,
            color: properties.color || '#808080'
        };

        const updatedEncounter = addWallOptimistic(encounter, tempWall);
        setEncounter(updatedEncounter);

        setDrawingWallIndex(-1);
        setDrawingWallDefaultHeight(properties.defaultHeight);
        setDrawingMode('wall');
        setActivePanel(null);
    }, [encounterId, encounter, wallTransaction]);

    const handleSourceSelect = useCallback((index: number) => {
        setSelectedSourceIndex(index);
    }, []);

    const handleSourceDelete = useCallback(async (index: number) => {
        if (!encounterId || !encounter) return;

        const source = placedSources.find(s => s.index === index);
        if (!source) return;

        const sourceId = source.id;

        try {
            await removeEncounterSource({ encounterId, sourceIndex: index }).unwrap();

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
    }, [encounterId, encounter, placedSources, removeEncounterSource, selectedSourceIndex, refetch, setErrorMessage]);

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

    if (isLoadingEncounter || isHydrating) {
        return (
            <EditorLayout>
                <Box sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: '100%' }}>
                    <Box sx={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 2 }}>
                        <CircularProgress size={60} thickness={4} />
                        <Typography variant="h6">
                            {isLoadingEncounter ? 'Loading Encounter...' : 'Preparing Assets...'}
                        </Typography>
                    </Box>
                </Box>
            </EditorLayout>
        );
    }

    if (encounterError || (!encounterData && encounterId)) {
        return (
            <EditorLayout>
                <Box sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: '100%', p: 3 }}>
                    <Alert severity="error">
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
            {...(backgroundUrl && { backgroundUrl })}
            isUploadingBackground={isUploadingBackground}
            onBackgroundUpload={handleBackgroundUpload}
        >
            <Box sx={{ display: 'flex', flexDirection: 'column', height: '100%', position: 'relative' }}>
            <EditingBlocker isBlocked={!isOnline} />

            <TopToolBar
                drawingMode={drawingMode}
                onDrawingModeChange={handleDrawingModeChange}
                onUndoClick={undo}
                onRedoClick={redo}
                onZoomIn={viewportControls.handleZoomIn}
                onZoomOut={viewportControls.handleZoomOut}
                onZoomReset={viewportControls.handleZoomReset}
                onGridToggle={() => setGridConfig(prev => ({ ...prev, type: prev.type === GridType.NoGrid ? GridType.Square : GridType.NoGrid }))}
                onClearSelection={() => assetManagement.handleAssetSelected([])}
                canUndo={false}
                canRedo={false}
                gridVisible={gridConfig.type !== GridType.NoGrid}
            />

            <Box
                id="canvas-container"
                onMouseMove={viewportControls.handleCanvasMouseMove}
                sx={{
                    flexGrow: 1,
                    overflow: 'hidden',
                    bgcolor: 'background.default',
                    position: 'relative',
                    width: '100%',
                    height: '100%',
                    cursor: (drawingMode === 'wall' || drawingMode === 'region') ? 'crosshair' : 'default'
                }}
            >
                <LeftToolBar
                    activePanel={activePanel}
                    onPanelChange={setActivePanel}
                    gridConfig={gridConfig}
                    onGridChange={gridHandlers.handleGridChange}
                    encounterId={encounterId}
                    encounterWalls={placedWalls}
                    selectedWallIndex={selectedWallIndex}
                    onWallSelect={wallHandlers.handleWallSelect}
                    onWallDelete={wallHandlers.handleWallDelete}
                    onPlaceWall={handlePlaceWall}
                    onEditVertices={wallHandlers.handleEditVertices}
                    encounterRegions={placedRegions}
                    selectedRegionIndex={selectedRegionIndex}
                    onRegionSelect={regionHandlers.handleRegionSelect}
                    onRegionDelete={regionHandlers.handleRegionDelete}
                    onPlaceRegion={regionHandlers.handlePlaceRegion}
                    onEditRegionVertices={regionHandlers.handleEditRegionVertices}
                    placedAssets={assetManagement.placedAssets}
                    selectedAssetIds={assetManagement.selectedAssetIds}
                    onAssetSelectForPlacement={assetManagement.setDraggedAsset}
                    onPlacedAssetSelect={assetManagement.handlePlacedAssetSelect}
                    onPlacedAssetDelete={(assetId) => {
                        const asset = assetManagement.placedAssets.find(a => a.id === assetId);
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
                />

                <EncounterCanvas
                    ref={canvasRef}
                    width={window.innerWidth}
                    height={window.innerHeight}
                    initialPosition={{ x: initialViewport.x, y: initialViewport.y }}
                    backgroundColor={theme.palette.background.default}
                    onViewportChange={viewportControls.handleViewportChange}
                >
                    {/* Layer 1: Static (background + grid) */}
                    <Layer
                        name={LayerName.Static}
                        listening={false}
                    >
                        {layerVisibility.background && (
                            <BackgroundLayer
                                imageUrl={backgroundImageUrl}
                                backgroundColor={theme.palette.background.default}
                                stageWidth={STAGE_WIDTH}
                                stageHeight={STAGE_HEIGHT}
                            />
                        )}

                        {layerVisibility.grid && (
                            <GridRenderer
                                grid={gridConfig}
                                stageWidth={STAGE_WIDTH}
                                stageHeight={STAGE_HEIGHT}
                                visible={gridConfig.type !== GridType.NoGrid}
                            />
                        )}
                    </Layer>

                    {/* Layer 2: GameWorld (structures, objects, creatures) */}
                    <Layer name={LayerName.GameWorld}>
                        {layerVisibility.structures && (
                            <>
                                {/* Regions - render first (bottom of GameWorld) */}
                                {placedRegions && placedRegions.length > 0 && (
                            <Group name={GroupName.Structure}>
                                {placedRegions.map((encounterRegion) => {
                                    if (encounterRegion.index === -1 && drawingRegionIndex !== null) {
                                        return null;
                                    }
                                    return (
                                        <RegionRenderer
                                            key={encounterRegion.id}
                                            encounterRegion={encounterRegion}
                                        />
                                    );
                                })}
                            </Group>
                        )}

                        {/* Sources - render second */}
                        {encounter && placedSources && placedSources.length > 0 && (
                            <Group name={GroupName.Structure}>
                                {placedSources.map((encounterSource) => (
                                    <SourceRenderer
                                        key={encounterSource.id}
                                        encounterSource={encounterSource}
                                        walls={encounter.walls || []}
                                        gridConfig={gridConfig}
                                    />
                                ))}
                            </Group>
                        )}

                        {/* Walls - render third (top of structures) */}
                        {encounter && placedWalls && (
                            <Group name={GroupName.Structure}>
                                {placedWalls.map((encounterWall) => {
                                    const isInTransaction = wallTransaction.transaction.isActive &&
                                        wallTransaction.getActiveSegments().some(s => s.wallIndex === encounterWall.index || s.tempId === encounterWall.index);
                                    const shouldRender = !isInTransaction && !(drawingWallIndex === encounterWall.index);

                                    return (
                                        <React.Fragment key={encounterWall.id}>
                                            {shouldRender && (
                                                <WallRenderer
                                                    encounterWall={encounterWall}
                                                    onContextMenu={contextMenus.wallContextMenu.handleOpen}
                                                />
                                            )}
                                        </React.Fragment>
                                    );
                                })}

                                {isEditingVertices && wallTransaction.transaction.isActive && (
                                    <>
                                        {wallTransaction.getActiveSegments().map((segment) => (
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
                                    </>
                                )}
                            </Group>
                        )}

                        {/* Region Transformer */}
                        {encounter && encounter.regions && isEditingRegionVertices && editingRegionIndex !== null && regionTransaction.transaction.isActive && regionTransaction.transaction.segment && (
                            <Group name={GroupName.Structure}>
                                <RegionTransformer
                                    encounterId={encounterId || ''}
                                    regionIndex={editingRegionIndex}
                                    segment={regionTransaction.transaction.segment}
                                    gridConfig={gridConfig}
                                    viewport={viewportControls.viewport}
                                    onVerticesChange={(newVertices: Point[]) => handleRegionVerticesChange(editingRegionIndex, newVertices)}
                                    onClearSelections={regionHandlers.handleFinishEditingRegion}
                                    onFinish={regionHandlers.handleFinishEditingRegion}
                                    onCancel={regionHandlers.handleCancelEditingRegion}
                                    onLocalAction={(action: any) => regionTransaction.pushLocalAction(action)}
                                    {...(regionTransaction.transaction.segment.color && {
                                        color: regionTransaction.transaction.segment.color
                                    })}
                                />
                            </Group>
                        )}
                            </>
                        )}
                    </Layer>

                    {/* Layer 5: Assets (tokens/objects/creatures) */}
                    {encounter && (layerVisibility.objects || layerVisibility.creatures) && (
                        <TokenPlacement
                            placedAssets={assetManagement.placedAssets.filter(asset => {
                                if (asset.asset.kind === AssetKind.Object && !layerVisibility.objects) {
                                    return false;
                                }
                                if (asset.asset.kind === AssetKind.Creature && !layerVisibility.creatures) {
                                    return false;
                                }
                                return true;
                            })}
                            onAssetPlaced={assetManagement.handleAssetPlaced}
                            onAssetMoved={assetManagement.handleAssetMoved}
                            onAssetDeleted={assetManagement.handleAssetDeleted}
                            gridConfig={gridConfig}
                            draggedAsset={assetManagement.draggedAsset}
                            onDragComplete={assetManagement.handleDragComplete}
                            onImagesLoaded={canvasReadyState.handleImagesLoaded}
                            snapMode={keyboardState.snapMode}
                            onContextMenu={contextMenus.assetContextMenu.handleOpen}
                            encounter={encounter}
                        />
                    )}

                    {/* Layer 6: Effects (placeholder for future) */}
                    <Layer name={LayerName.Effects}>
                        {/* Future: effects components */}
                    </Layer>

                    {/* Layer 4: Drawing Tools (in UIOverlay for topmost rendering) */}
                    {layerVisibility.overlays && encounter && encounterId && (
                        <Layer name={LayerName.UIOverlay}>
                            {drawingMode === 'wall' && drawingWallIndex !== null && (
                                <WallDrawingTool
                                    encounterId={encounterId}
                                    wallIndex={drawingWallIndex}
                                    gridConfig={gridConfig}
                                    defaultHeight={drawingWallDefaultHeight}
                                    onCancel={handleStructurePlacementCancel}
                                    onFinish={handleStructurePlacementFinish}
                                    onFinishWithMerge={wallHandlers.handleWallPlacementFinishWithMerge}
                                    onFinishWithSplit={wallHandlers.handleWallPlacementFinishWithSplit}
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
                                        regionColor: regionTransaction.transaction.segment.color
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
                            {activeTool === 'sourceDrawing' && sourcePlacementProperties && encounter && (
                                <SourceDrawingTool
                                    encounterId={encounterId || ''}
                                    source={{
                                        encounterId: encounterId || '',
                                        index: -1,
                                        name: `${sourcePlacementProperties.type} Source ${(encounter.sources?.length || 0) + 1}`,
                                        position: { x: 0, y: 0 },
                                        ...sourcePlacementProperties
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
                        </Layer>
                    )}

                    {/* Layer 8: UI Overlay (transformer + selection) */}
                    <TokenDragHandle
                        placedAssets={assetManagement.placedAssets.filter(asset => {
                            if (asset.asset.kind === AssetKind.Object && !layerVisibility.objects) {
                                return false;
                            }
                            if (asset.asset.kind === AssetKind.Creature && !layerVisibility.creatures) {
                                return false;
                            }
                            return true;
                        })}
                        selectedAssetIds={assetManagement.selectedAssetIds}
                        onAssetSelected={assetManagement.handleAssetSelected}
                        onAssetMoved={assetManagement.handleAssetMoved}
                        onAssetDeleted={assetManagement.handleAssetDeleted}
                        gridConfig={gridConfig}
                        stageRef={stageRef as React.RefObject<Konva.Stage>}
                        stageReady={stageReady}
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
                    />
                </EncounterCanvas>
            </Box>

            <EditorStatusBar
                {...(viewportControls.cursorPosition && { cursorPosition: viewportControls.cursorPosition })}
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
