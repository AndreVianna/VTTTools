import React, { useState, useRef, useEffect, useCallback } from 'react';
import { Box, useTheme, CircularProgress, Typography, Alert } from '@mui/material';
import { useParams, useNavigate } from 'react-router-dom';
import { Layer, Group } from 'react-konva';
import Konva from 'konva';
import {
    SceneCanvas,
    SceneCanvasHandle,
    Viewport,
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
} from '@components/scene';
import type { WallBreakData } from '@components/scene/editing/WallTransformer';
import { EditingBlocker } from '@components/common';
import { EditorLayout } from '@components/layout';
import { GridConfig, GridType, getDefaultGrid } from '@utils/gridCalculator';
import { toBackendRotation } from '@utils/rotationUtils';
import { layerManager, LayerName, GroupName } from '@services/layerManager';
import {
    Asset,
    AssetKind,
    PlacedAsset,
    Scene,
    DisplayName,
    LabelPosition,
    SceneWall,
    PlacedWall,
    SceneRegion,
    PlacedRegion,
    SceneSource,
    PlacedSource,
    WallVisibility,
    Pole,
    Point,
    PlacedAssetSnapshot,
    createAssetSnapshot
} from '@/types/domain';
import { UndoRedoProvider, useUndoRedoContext } from '@/contexts/UndoRedoContext';
import { ClipboardProvider } from '@/contexts/ClipboardContext';
import { useClipboard } from '@/contexts/useClipboard';
import { useConnectionStatus } from '@/hooks/useConnectionStatus';
import { useWallTransaction } from '@/hooks/useWallTransaction';
import { useRegionTransaction } from '@/hooks/useRegionTransaction';
import {
    useSceneSettings,
    useGridHandlers,
    useWallHandlers,
    useRegionHandlers,
    useKeyboardState,
    useCanvasReadyState,
    useViewportControls,
    useContextMenus,
    useAssetManagement
} from './SceneEditor/hooks';
import {
    addWallOptimistic, removeWallOptimistic, syncWallIndices, updateWallOptimistic,
    addRegionOptimistic, removeRegionOptimistic, syncRegionIndices, updateRegionOptimistic
} from '@/utils/sceneStateUtils';
import { createBreakWallAction } from '@/types/wallUndoActions';
import {
    Command,
    createPlaceAssetCommand,
    createMoveAssetCommand,
    createBatchCommand,
    createBulkRemoveAssetsCommand,
    createCopyAssetsCommand,
    createCutAssetsCommand,
    createPasteAssetsCommand,
    createRenameAssetCommand,
    createUpdateAssetDisplayCommand,
    createTransformAssetCommand
} from '@/utils/commands';
import { CreateWallCommand, EditWallCommand, BreakWallCommand } from '@/utils/commands/wallCommands';
import { CreateRegionCommand, EditRegionCommand, DeleteRegionCommand } from '@/utils/commands/regionCommands';
import {
    useGetSceneQuery,
    usePatchSceneMutation,
    useAddSceneAssetMutation,
    useUpdateSceneAssetMutation,
    useBulkUpdateSceneAssetsMutation,
    useRemoveSceneAssetMutation,
    useBulkDeleteSceneAssetsMutation,
    useBulkAddSceneAssetsMutation,
    useAddSceneWallMutation,
    useRemoveSceneWallMutation,
    useUpdateSceneWallMutation,
    useAddSceneRegionMutation,
    useUpdateSceneRegionMutation,
    useRemoveSceneRegionMutation,
    useRemoveSceneSourceMutation
} from '@/services/sceneApi';
import type { SourcePlacementProperties } from '@components/scene/panels';
import { useUploadFileMutation } from '@/services/mediaApi';
import { hydratePlacedAssets, hydratePlacedWalls, hydratePlacedRegions, hydratePlacedSources } from '@/utils/sceneMappers';
import { getApiEndpoints } from '@/config/development';
import { SaveStatus } from '@/components/common';
import { useAppDispatch } from '@/store';
import { assetsApi } from '@/services/assetsApi';

const STAGE_WIDTH = 2800;
const STAGE_HEIGHT = 2100;
const SCENE_DEFAULT_BACKGROUND = '/assets/backgrounds/tavern.png';

const SceneEditorPageInternal: React.FC = () => {
    const theme = useTheme();
    const navigate = useNavigate();
    const { sceneId } = useParams<{ sceneId: string }>();
    const canvasRef = useRef<SceneCanvasHandle>(null);
    const stageRef = useRef<Konva.Stage>(null);
    const { execute, recordAction, undo, redo } = useUndoRedoContext();
    const { copyAssets, cutAssets, clipboard, canPaste, getClipboardAssets, clearClipboard } = useClipboard();
    const { isOnline } = useConnectionStatus();
    const wallTransaction = useWallTransaction();
    const regionTransaction = useRegionTransaction();
    const { data: sceneData, isLoading: isLoadingScene, error: sceneError, refetch } = useGetSceneQuery(
        sceneId || '',
        {
            skip: !sceneId
        }
    );
    const [patchScene] = usePatchSceneMutation();
    const [uploadFile, { isLoading: isUploadingBackground }] = useUploadFileMutation();
    const [addSceneAsset] = useAddSceneAssetMutation();
    const [updateSceneAsset] = useUpdateSceneAssetMutation();
    const [bulkUpdateSceneAssets] = useBulkUpdateSceneAssetsMutation();
    const [removeSceneAsset] = useRemoveSceneAssetMutation();
    const [bulkDeleteSceneAssets] = useBulkDeleteSceneAssetsMutation();
    const [bulkAddSceneAssets] = useBulkAddSceneAssetsMutation();

    const [addSceneWall] = useAddSceneWallMutation();
    const [removeSceneWall] = useRemoveSceneWallMutation();
    const [updateSceneWall] = useUpdateSceneWallMutation();

    const [addSceneRegion] = useAddSceneRegionMutation();
    const [updateSceneRegion] = useUpdateSceneRegionMutation();
    const [removeSceneRegion] = useRemoveSceneRegionMutation();
    const [removeSceneSource] = useRemoveSceneSourceMutation();

    // Force refetch on mount with forceRefetch option
    useEffect(() => {
        if (sceneId) {
            refetch();
        }
    }, []); // eslint-disable-line react-hooks/exhaustive-deps

    const [isInitialized, setIsInitialized] = useState(false);
    const [scene, setScene] = useState<Scene | null>(null);
    const sceneRef = useRef<Scene | null>(null);
    const [placedWalls, setPlacedWalls] = useState<PlacedWall[]>([]);
    const [placedRegions, setPlacedRegions] = useState<PlacedRegion[]>([]);
    const [placedSources, setPlacedSources] = useState<PlacedSource[]>([]);

    useEffect(() => {
        sceneRef.current = scene;
    }, [scene]);

    const initialViewport = {
        x: (window.innerWidth - STAGE_WIDTH) / 2,
        y: (window.innerHeight - STAGE_HEIGHT) / 2,
        scale: 1
    };

    const [gridConfig, setGridConfig] = useState<GridConfig>(getDefaultGrid());
    const [backgroundImageUrl] = useState<string>(SCENE_DEFAULT_BACKGROUND);
    const [isHydrating, setIsHydrating] = useState(false);
    const [saveStatus, setSaveStatus] = useState<SaveStatus>('idle');
    const [errorMessage, setErrorMessage] = useState<string | null>(null);

    const [drawingMode, setDrawingMode] = useState<DrawingMode>(null);
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
        if (!sceneId || !scene || !isInitialized) {
            return;
        }

        const currentData = {
            name: scene.name,
            description: scene.description,
            isPublished: scene.isPublished,
            grid: {
                type: gridConfig.type as any,
                cellSize: gridConfig.cellSize,
                offset: gridConfig.offset,
                snap: gridConfig.snap
            },
            ...overrides
        };

        const hasChanges =
            currentData.name !== scene.name ||
            currentData.description !== scene.description ||
            currentData.isPublished !== scene.isPublished ||
            JSON.stringify(currentData.grid) !== JSON.stringify({
                type: typeof scene.grid.type === 'string'
                    ? GridType[scene.grid.type as keyof typeof GridType]
                    : scene.grid.type,
                cellSize: scene.grid.cellSize,
                offset: scene.grid.offset,
                snap: scene.grid.snap
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
            const result = await patchScene({
                id: sceneId,
                request: requestPayload
            }).unwrap();

            if (result) {
                setScene(result);
            } else {
                await refetch();
            }

            setSaveStatus('saved');
        } catch (error) {
            console.error('Failed to save scene:', error);
            setSaveStatus('error');
        }
    }, [sceneId, scene, isInitialized, gridConfig, patchScene, refetch]);

    const sceneSettings = useSceneSettings({
        sceneId,
        scene,
        setScene,
        saveChanges
    });

    const gridHandlers = useGridHandlers({
        setGridConfig,
        saveChanges
    });

    const wallHandlers = useWallHandlers({
        sceneId,
        scene,
        wallTransaction,
        selectedWallIndex,
        addSceneWall,
        updateSceneWall,
        removeSceneWall,
        setScene,
        setSelectedWallIndex,
        setIsEditingVertices,
        setOriginalWallPoles,
        setActivePanel,
        setErrorMessage,
        execute,
        refetch
    });

    const regionHandlers = useRegionHandlers({
        sceneId,
        scene,
        regionTransaction,
        gridConfig,
        selectedRegionIndex,
        editingRegionIndex,
        originalRegionVertices,
        drawingMode,
        drawingRegionIndex,
        addSceneRegion,
        updateSceneRegion,
        removeSceneRegion,
        setScene,
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
            if (assetManagement.draggedAsset) {
                assetManagement.setDraggedAsset(null);
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
        scene
    });

    const dispatch = useAppDispatch();

    const assetManagement = useAssetManagement({
        sceneId,
        scene,
        isOnline,
        setScene,
        execute,
        dispatch,
        copyAssets,
        cutAssets,
        canPaste,
        getClipboardAssets,
        clipboard,
        clearClipboard,
        addSceneAsset,
        updateSceneAsset,
        bulkUpdateSceneAssets,
        removeSceneAsset,
        bulkDeleteSceneAssets,
        bulkAddSceneAssets,
        refetch
    });

    useEffect(() => {
        if (sceneData && !isInitialized) {
            const initializeScene = async () => {
                setIsHydrating(true);
                try {
                    const hydratedAssets = await hydratePlacedAssets(
                        sceneData.assets,
                        sceneId || '',
                        async (assetId: string) => {
                            const result = await dispatch(
                                assetsApi.endpoints.getAsset.initiate(assetId)
                            ).unwrap();
                            return result;
                        }
                    );

                    const hydratedWalls = hydratePlacedWalls(sceneData.walls || [], sceneId || '');
                    const hydratedRegions = hydratePlacedRegions(sceneData.regions || [], sceneId || '');
                    const hydratedSources = hydratePlacedSources(sceneData.sources || [], sceneId || '');

                    setScene(sceneData);
                    setGridConfig({
                        type: typeof sceneData.grid.type === 'string'
                            ? GridType[sceneData.grid.type as keyof typeof GridType]
                            : sceneData.grid.type,
                        cellSize: sceneData.grid.cellSize,
                        offset: sceneData.grid.offset,
                        snap: sceneData.grid.snap
                    });
                    assetManagement.setPlacedAssets(hydratedAssets);
                    setPlacedWalls(hydratedWalls);
                    setPlacedRegions(hydratedRegions);
                    setPlacedSources(hydratedSources);
                    setIsInitialized(true);
                } catch (error) {
                    console.error('Failed to hydrate scene:', error);
                    setScene(sceneData);
                    setGridConfig({
                        type: typeof sceneData.grid.type === 'string'
                            ? GridType[sceneData.grid.type as keyof typeof GridType]
                            : sceneData.grid.type,
                        cellSize: sceneData.grid.cellSize,
                        offset: sceneData.grid.offset,
                        snap: sceneData.grid.snap
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

            initializeScene();
        }
    }, [sceneData, isInitialized, dispatch, sceneId]);

    useEffect(() => {
        if (sceneData && isInitialized) {
            setScene(sceneData);
            const hydratedWalls = hydratePlacedWalls(sceneData.walls || [], sceneId || '');
            const hydratedRegions = hydratePlacedRegions(sceneData.regions || [], sceneId || '');
            const hydratedSources = hydratePlacedSources(sceneData.sources || [], sceneId || '');
            setPlacedWalls(hydratedWalls);
            setPlacedRegions(hydratedRegions);
            setPlacedSources(hydratedSources);
        }
    }, [sceneData, isInitialized, sceneId]);


    

    

    

    

    

    // Initialize Stage reference when SceneCanvas is ready
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
        if (!sceneId) return;

        try {
            const result = await uploadFile({
                file,
                type: 'scene',
                resource: 'background',
                entityId: sceneId
            }).unwrap();

            await patchScene({
                id: sceneId,
                request: {
                    backgroundId: result.id
                }
            }).unwrap();

        } catch (error) {
            console.error('Failed to upload background:', error);
        }
    }, [sceneId, uploadFile, patchScene]);

    useEffect(() => {
        const handleKeyDown = async (e: KeyboardEvent) => {
            console.log('[UNDO DEBUG] SceneEditorPage handleKeyDown CAPTURE:', { key: e.key, ctrlKey: e.ctrlKey });

            if (e.target instanceof HTMLInputElement || e.target instanceof HTMLTextAreaElement) {
                return;
            }

            const isWallTransactionActive = wallTransaction.transaction.isActive;
            const isRegionTransactionActive = regionTransaction.transaction.isActive;
            const isMac = navigator.platform.toUpperCase().indexOf('MAC') >= 0;
            const modifier = isMac ? e.metaKey : e.ctrlKey;

            if (modifier && e.key === 'z' && !e.shiftKey) {
                console.log('[UNDO DEBUG] SceneEditorPage - Detected Ctrl+Z!');
                console.log('[UNDO DEBUG] SceneEditorPage - isWallTransactionActive:', isWallTransactionActive);
                console.log('[UNDO DEBUG] SceneEditorPage - isRegionTransactionActive:', isRegionTransactionActive);
                e.preventDefault();
                e.stopImmediatePropagation();

                if (isWallTransactionActive && wallTransaction.canUndoLocal()) {
                    console.log('[UNDO DEBUG] SceneEditorPage - Wall local undo');

                    wallTransaction.undoLocal((segments) => {
                        const currentScene = sceneRef.current;
                        if (currentScene && selectedWallIndex !== null) {
                            let syncedScene = currentScene;

                            const tempWalls = currentScene.walls?.filter(w => w.index < 0) || [];
                            tempWalls.forEach(tempWall => {
                                const segmentExists = segments.some(s => s.tempId === tempWall.index);
                                if (!segmentExists) {
                                    syncedScene = removeWallOptimistic(syncedScene, tempWall.index);
                                }
                            });

                            if (segments.length === 1) {
                                syncedScene = updateWallOptimistic(syncedScene, selectedWallIndex, {
                                    poles: segments[0]!.poles,
                                    isClosed: segments[0]!.isClosed
                                });
                            } else {
                                const mainSegment = segments.find(s => s.wallIndex === selectedWallIndex || s.tempId === 0);
                                if (mainSegment) {
                                    syncedScene = updateWallOptimistic(syncedScene, selectedWallIndex, {
                                        poles: mainSegment.poles,
                                        isClosed: mainSegment.isClosed
                                    });
                                }
                            }

                            setScene(syncedScene);
                        }
                    });
                } else if (isRegionTransactionActive && regionTransaction.canUndoLocal()) {
                    console.log('[UNDO DEBUG] SceneEditorPage - Region local undo');
                    regionTransaction.undoLocal((segment) => {
                        const currentScene = sceneRef.current;
                        if (currentScene && drawingRegionIndex !== null) {
                            if (segment) {
                                const syncedScene = updateRegionOptimistic(currentScene, drawingRegionIndex, {
                                    vertices: segment.vertices
                                });
                                setScene(syncedScene);
                            } else {
                                setScene(currentScene);
                            }
                        }
                    });
                } else {
                    console.log('[UNDO DEBUG] SceneEditorPage - Calling GLOBAL undo()');
                    await undo();
                    console.log('[UNDO DEBUG] SceneEditorPage - GLOBAL undo() completed');
                }
                return;
            }

            if (modifier && (e.key === 'y' || (e.key === 'z' && e.shiftKey))) {
                e.preventDefault();
                e.stopImmediatePropagation();

                if (isWallTransactionActive && wallTransaction.canRedoLocal()) {
                    wallTransaction.redoLocal((segments) => {
                        const currentScene = sceneRef.current;
                        if (currentScene && selectedWallIndex !== null) {
                            const selectedWall = currentScene.walls?.find(w => w.index === selectedWallIndex);
                            let syncedScene = currentScene;

                            if (segments.length === 1) {
                                syncedScene = updateWallOptimistic(syncedScene, selectedWallIndex, {
                                    poles: segments[0]!.poles,
                                    isClosed: segments[0]!.isClosed
                                });
                            } else {
                                segments.forEach(segment => {
                                    if (segment.wallIndex === selectedWallIndex || segment.tempId === 0) {
                                        syncedScene = updateWallOptimistic(syncedScene, selectedWallIndex, {
                                            poles: segment.poles,
                                            isClosed: segment.isClosed
                                        });
                                    } else if (segment.wallIndex === null) {
                                        const existingWall = syncedScene.walls?.find(w => w.index === segment.tempId);
                                        if (sceneId && !existingWall && selectedWall) {
                                            const tempWall: SceneWall = {
                                                sceneId,
                                                index: segment.tempId,
                                                name: selectedWall.name,
                                                poles: segment.poles,
                                                isClosed: segment.isClosed,
                                                visibility: selectedWall.visibility,
                                                material: selectedWall.material,
                                                color: selectedWall.color
                                            };
                                            syncedScene = addWallOptimistic(syncedScene, tempWall);
                                        }
                                    }
                                });
                            }

                            setScene(syncedScene);
                        }
                    });
                } else if (isRegionTransactionActive && regionTransaction.canRedoLocal()) {
                    regionTransaction.redoLocal((segment) => {
                        const currentScene = sceneRef.current;
                        if (currentScene && drawingRegionIndex !== null && segment) {
                            const syncedScene = updateRegionOptimistic(currentScene, drawingRegionIndex, {
                                vertices: segment.vertices
                            });
                            setScene(syncedScene);
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
    }, [wallTransaction, regionTransaction, undo, redo, sceneId, selectedWallIndex, drawingRegionIndex]);

    const handleVerticesChange = useCallback(async (
        wallIndex: number,
        newPoles: Pole[],
        newIsClosed?: boolean
    ) => {
        if (!scene) return;

        if (!wallTransaction.transaction.isActive) {
            console.warn('[handleVerticesChange] No active transaction');
            return;
        }

        if (newPoles.length < 2) {
            console.warn('[handleVerticesChange] Wall must have at least 2 poles');
            return;
        }

        const wall = scene.walls?.find(w => w.index === wallIndex);
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

        const updatedScene = updateWallOptimistic(scene, wallIndex, {
            poles: newPoles,
            isClosed: effectiveIsClosed
        });
        setScene(updatedScene);
    }, [scene, wallTransaction, setScene]);

    const handleRegionVerticesChange = useCallback(async (
        regionIndex: number,
        newVertices: Point[]
    ) => {
        if (!scene) return;

        if (!regionTransaction.transaction.isActive) {
            console.warn('[handleRegionVerticesChange] No active transaction');
            return;
        }

        if (newVertices.length < 3) {
            console.warn('[handleRegionVerticesChange] Region must have at least 3 vertices');
            return;
        }

        const region = scene.regions?.find(r => r.index === regionIndex);
        if (!region) return;

        const segment = regionTransaction.transaction.segment;
        if (!segment) {
            console.warn(`[handleRegionVerticesChange] Segment not found for regionIndex ${regionIndex}`);
            return;
        }

        regionTransaction.updateVertices(newVertices);

        const updatedScene = updateRegionOptimistic(scene, regionIndex, {
            vertices: newVertices
        });
        setScene(updatedScene);
    }, [scene, regionTransaction, setScene]);

    const handleRegionPlacementCancel = useCallback(async () => {
        if (!scene) return;

        regionTransaction.rollbackTransaction();

        const cleanScene = removeRegionOptimistic(scene, -1);
        setScene(cleanScene);

        setDrawingRegionIndex(null);
        setDrawingMode(null);
    }, [scene, regionTransaction]);

    const handleStructurePlacementFinish = useCallback(async () => {
        if (!sceneId || !scene) return;
        console.log('handleStructurePlacementFinish called, drawingMode:', drawingMode, 'drawingRegionIndex:', drawingRegionIndex);

        if (drawingMode === 'region' && drawingRegionIndex !== null) {
            console.log('About to call regionTransaction.commitTransaction');
            // Filter out temp regions (index -1) before merge detection
            const sceneForCommit = scene ? {
                ...scene,
                regions: scene.regions?.filter(r => r.index !== -1)
            } : scene;
            const result = await regionTransaction.commitTransaction(
                sceneId,
                { addSceneRegion, updateSceneRegion },
                sceneForCommit,
                gridConfig
            );

            console.log('[DEBUG SceneEditorPage] Commit result:', result);

            if (result.action === 'merge') {
                console.log('[DEBUG SceneEditorPage] Processing merge, target:', result.targetRegionIndex, 'merged vertices:', result.mergedVertices?.length);
                const targetRegion = scene.regions?.find(r => r.index === result.targetRegionIndex);
                if (!targetRegion) {
                    setErrorMessage('Merge target region not found');
                    regionTransaction.rollbackTransaction();
                    setDrawingRegionIndex(null);
                    setDrawingMode(null);
                    return;
                }

                const commands: Command[] = [];

                commands.push(new EditRegionCommand({
                    sceneId,
                    regionIndex: result.targetRegionIndex!,
                    oldRegion: targetRegion,
                    newRegion: { ...targetRegion, vertices: result.mergedVertices! },
                    onUpdate: async (sceneId, regionIndex, updates) => {
                        try {
                            await updateSceneRegion({ sceneId, regionIndex, ...updates }).unwrap();
                        } catch (error) {
                            console.error('Failed to update region:', error);
                            throw error;
                        }
                    },
                    onRefetch: async () => {
                        const { data } = await refetch();
                        if (data) setScene(data);
                    }
                }));

                for (const deleteIndex of result.regionsToDelete || []) {
                    const regionToDelete = scene.regions?.find(r => r.index === deleteIndex);
                    if (regionToDelete) {
                        commands.push(new DeleteRegionCommand({
                            sceneId,
                            regionIndex: deleteIndex,
                            region: regionToDelete,
                            onAdd: async (sceneId, regionData) => {
                                const result = await addSceneRegion({ sceneId, ...regionData }).unwrap();
                                return result;
                            },
                            onRemove: async (sceneId, regionIndex) => {
                                await removeSceneRegion({ sceneId, regionIndex }).unwrap();
                            },
                            onRefetch: async () => {
                                const { data } = await refetch();
                                if (data) setScene(data);
                            }
                        }));
                    }
                }

                const batchCommand = createBatchCommand({ commands });
                await execute(batchCommand);

                console.log('[DEBUG SceneEditorPage] Before optimistic update, scene.regions count:', scene.regions?.length);
                let syncedScene = updateRegionOptimistic(scene, result.targetRegionIndex!, {
                    vertices: result.mergedVertices!
                });
                console.log('[DEBUG SceneEditorPage] After updateRegionOptimistic, regions count:', syncedScene.regions?.length);

                for (const deleteIndex of result.regionsToDelete || []) {
                    syncedScene = removeRegionOptimistic(syncedScene, deleteIndex);
                }

                // BUGFIX: Remove temp region -1 from scene state after merge
                syncedScene = {
                    ...syncedScene,
                    regions: syncedScene.regions?.filter(r => r.index !== -1) || []
                };
                console.log('[DEBUG SceneEditorPage] After temp region cleanup, regions count:', syncedScene.regions?.length);

                setScene(syncedScene);

                setDrawingRegionIndex(null);
                setDrawingMode(null);
                return;
            }

            if (result.success && result.regionIndex !== undefined) {
                const tempToReal = new Map<number, number>();
                tempToReal.set(-1, result.regionIndex);

                const syncedScene = syncRegionIndices(scene, tempToReal);
                setScene(syncedScene);

                const createdRegion = syncedScene.regions?.find(r => r.index === result.regionIndex);
                if (createdRegion) {
                    const command = new CreateRegionCommand({
                        sceneId,
                        region: createdRegion,
                        onCreate: async (sceneId, regionData) => {
                            try {
                                const result = await addSceneRegion({ sceneId, ...regionData }).unwrap();
                                return result;
                            } catch (error) {
                                console.error('Failed to recreate region:', error);
                                setErrorMessage('Failed to recreate region. Please try again.');
                                throw error;
                            }
                        },
                        onRemove: async (sceneId, regionIndex) => {
                            try {
                                await removeSceneRegion({ sceneId, regionIndex }).unwrap();
                            } catch (error) {
                                console.error('Failed to remove region:', error);
                                setErrorMessage('Failed to remove region. Please try again.');
                                throw error;
                            }
                        },
                        onRefetch: async () => {
                            const { data } = await refetch();
                            if (data) setScene(data);
                        }
                    });
                    console.log('[DEBUG SceneEditorPage] Calling recordAction - transaction already created region');
                    recordAction(command);
                }
            } else {
                regionTransaction.rollbackTransaction();
                const cleanScene = removeRegionOptimistic(scene, -1);
                setScene(cleanScene);
                setErrorMessage('Failed to place region. Please try again.');
            }

            setDrawingRegionIndex(null);
            setDrawingMode(null);
            return;
        }

        const result = await wallTransaction.commitTransaction(sceneId, {
            addSceneWall,
            updateSceneWall
        });

        if (result.success && result.segmentResults.length > 0) {
            const tempToReal = new Map<number, number>();
            result.segmentResults.forEach(r => {
                if (r.wallIndex !== undefined) {
                    tempToReal.set(r.tempId, r.wallIndex);
                }
            });

            const syncedScene = syncWallIndices(scene, tempToReal);

            const hydratedWalls = hydratePlacedWalls(syncedScene.walls || [], sceneId);

            setScene(syncedScene);
            setPlacedWalls(hydratedWalls);

            const createdWalls: PlacedWall[] = [];
            result.segmentResults.forEach(r => {
                if (r.wallIndex !== undefined) {
                    const wall = hydratedWalls.find(w => w.index === r.wallIndex);
                    if (wall) createdWalls.push(wall);
                }
            });

            createdWalls.forEach(wall => {
                const command = new CreateWallCommand({
                    sceneId,
                    wall,
                    onCreate: async (sceneId, wallData) => {
                        try {
                            const result = await addSceneWall({ sceneId, ...wallData }).unwrap();
                            return result;
                        } catch (error) {
                            console.error('Failed to recreate wall:', error);
                            setErrorMessage('Failed to recreate wall. Please try again.');
                            throw error;
                        }
                    },
                    onRemove: async (sceneId, wallIndex) => {
                        try {
                            await removeSceneWall({ sceneId, wallIndex }).unwrap();
                        } catch (error) {
                            console.error('Failed to remove wall:', error);
                            setErrorMessage('Failed to remove wall. Please try again.');
                            throw error;
                        }
                    },
                    onRefetch: async () => {
                        const { data } = await refetch();
                        if (data) setScene(data);
                    }
                });
                execute(command);
            });
        } else {
            wallTransaction.rollbackTransaction();
            const cleanScene = removeWallOptimistic(scene, -1);
            setScene(cleanScene);
            setErrorMessage('Failed to place wall. Please try again.');
        }

        setDrawingWallIndex(null);
        setDrawingMode(null);
    }, [sceneId, scene, drawingMode, drawingRegionIndex, wallTransaction, regionTransaction, addSceneWall, updateSceneWall, removeSceneWall, addSceneRegion, updateSceneRegion, removeSceneRegion, refetch, execute, gridConfig]);

    const handleDrawingModeChange = (mode: DrawingMode) => {
        setDrawingMode(mode);
    };

    const handleStructurePlacementCancel = useCallback(async () => {
        if (!scene) return;

        wallTransaction.rollbackTransaction();

        const cleanScene = removeWallOptimistic(scene, -1);
        setScene(cleanScene);

        setDrawingWallIndex(null);
        setDrawingMode(null);
    }, [scene, wallTransaction]);

    const handlePlacedAssetUpdate = useCallback(async (assetId: string, updates: Partial<PlacedAsset>) => {
        if (!sceneId || !scene) return;

        const asset = assetManagement.placedAssets.find(a => a.id === assetId);
        if (!asset) return;

        const updatedAsset = { ...asset, ...updates };

        try {
            await updateSceneAsset({
                sceneId,
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
    }, [sceneId, scene, assetManagement, updateSceneAsset]);




    const handlePlaceWall = useCallback(async (properties: {
        visibility: WallVisibility;
        isClosed: boolean;
        material?: string;
        defaultHeight: number;
        color?: string;
    }) => {
        if (!sceneId || !scene) return;

        const existingWalls = scene.walls || [];

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

        const tempWall: SceneWall = {
            sceneId,
            index: -1,
            name: wallName,
            poles: [],
            visibility: properties.visibility,
            isClosed: properties.isClosed,
            material: properties.material,
            color: properties.color || '#808080'
        };

        const updatedScene = addWallOptimistic(scene, tempWall);
        setScene(updatedScene);

        setDrawingWallIndex(-1);
        setDrawingWallDefaultHeight(properties.defaultHeight);
        setDrawingMode('wall');
        setActivePanel(null);
    }, [sceneId, scene, wallTransaction]);

    const handleSourceSelect = useCallback((index: number) => {
        setSelectedSourceIndex(index);
    }, []);

    const handleSourceDelete = useCallback(async (index: number) => {
        if (!sceneId || !scene) return;

        const source = placedSources.find(s => s.index === index);
        if (!source) return;

        const sourceId = source.id;

        try {
            await removeSceneSource({ sceneId, sourceIndex: index }).unwrap();

            const { removeEntityMapping } = await import('@/utils/sceneEntityMapping');
            removeEntityMapping(sceneId, 'sources', sourceId);

            const { data: updatedScene } = await refetch();
            if (updatedScene) {
                setScene(updatedScene);
                const hydratedSources = hydratePlacedSources(updatedScene.sources || [], sceneId);
                setPlacedSources(hydratedSources);
            }

            if (selectedSourceIndex === index) {
                setSelectedSourceIndex(null);
            }
        } catch (error) {
            console.error('Failed to delete source:', error);
            setErrorMessage('Failed to delete source. Please try again.');
        }
    }, [sceneId, scene, placedSources, removeSceneSource, selectedSourceIndex, refetch, setErrorMessage]);

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

    if (isLoadingScene || isHydrating) {
        return (
            <EditorLayout>
                <Box sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: '100%' }}>
                    <Box sx={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 2 }}>
                        <CircularProgress size={60} thickness={4} />
                        <Typography variant="h6">
                            {isLoadingScene ? 'Loading Scene...' : 'Preparing Assets...'}
                        </Typography>
                    </Box>
                </Box>
            </EditorLayout>
        );
    }

    if (sceneError || (!sceneData && sceneId)) {
        return (
            <EditorLayout>
                <Box sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: '100%', p: 3 }}>
                    <Alert severity="error">
                        Failed to load scene. The scene may not exist or there was a network error.
                    </Alert>
                </Box>
            </EditorLayout>
        );
    }

    const backgroundUrl = scene?.stage?.background
        ? `${getApiEndpoints().media}/${scene.stage.background.id}`
        : undefined;

    return (
        <EditorLayout
            scene={scene || undefined}
            onSceneNameChange={sceneSettings.handleSceneNameChange}
            onBackClick={sceneSettings.handleBackClick}
            onSceneDescriptionChange={sceneSettings.handleSceneDescriptionChange}
            onScenePublishedChange={sceneSettings.handleScenePublishedChange}
            onSceneUpdate={sceneSettings.handleSceneUpdate}
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
                    sceneId={sceneId}
                    sceneWalls={placedWalls}
                    selectedWallIndex={selectedWallIndex}
                    onWallSelect={wallHandlers.handleWallSelect}
                    onWallDelete={wallHandlers.handleWallDelete}
                    onPlaceWall={handlePlaceWall}
                    onEditVertices={wallHandlers.handleEditVertices}
                    sceneRegions={placedRegions}
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
                    sceneSources={placedSources}
                    selectedSourceIndex={selectedSourceIndex}
                    onSourceSelect={handleSourceSelect}
                    onSourceDelete={handleSourceDelete}
                    onPlaceSource={handlePlaceSource}
                />

                <SceneCanvas
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
                                {placedRegions.map((sceneRegion) => {
                                    if (sceneRegion.index === -1 && drawingRegionIndex !== null) {
                                        return null;
                                    }
                                    return (
                                        <RegionRenderer
                                            key={sceneRegion.id}
                                            sceneRegion={sceneRegion}
                                        />
                                    );
                                })}
                            </Group>
                        )}

                        {/* Sources - render second */}
                        {scene && placedSources && placedSources.length > 0 && (
                            <Group name={GroupName.Structure}>
                                {placedSources.map((sceneSource) => (
                                    <SourceRenderer
                                        key={sceneSource.id}
                                        sceneSource={sceneSource}
                                        walls={scene.walls || []}
                                        gridConfig={gridConfig}
                                    />
                                ))}
                            </Group>
                        )}

                        {/* Walls - render third (top of structures) */}
                        {scene && placedWalls && (
                            <Group name={GroupName.Structure}>
                                {placedWalls.map((sceneWall) => {
                                    const isInTransaction = wallTransaction.transaction.isActive &&
                                        wallTransaction.getActiveSegments().some(s => s.wallIndex === sceneWall.index || s.tempId === sceneWall.index);
                                    const shouldRender = !isInTransaction && !(drawingWallIndex === sceneWall.index);

                                    return (
                                        <React.Fragment key={sceneWall.id}>
                                            {shouldRender && (
                                                <WallRenderer
                                                    sceneWall={sceneWall}
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
                                                sceneId={sceneId}
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
                        {scene && scene.regions && isEditingRegionVertices && editingRegionIndex !== null && regionTransaction.transaction.isActive && regionTransaction.transaction.segment && (
                            <Group name={GroupName.Structure}>
                                <RegionTransformer
                                    sceneId={sceneId || ''}
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
                    {scene && (layerVisibility.objects || layerVisibility.creatures) && (
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
                            scene={scene}
                        />
                    )}

                    {/* Layer 6: Effects (placeholder for future) */}
                    <Layer name={LayerName.Effects}>
                        {/* Future: effects components */}
                    </Layer>

                    {/* Layer 4: Drawing Tools (in UIOverlay for topmost rendering) */}
                    {layerVisibility.overlays && scene && sceneId && (
                        <Layer name={LayerName.UIOverlay}>
                            {drawingMode === 'wall' && drawingWallIndex !== null && (
                                <WallDrawingTool
                                    sceneId={sceneId}
                                    wallIndex={drawingWallIndex}
                                    gridConfig={gridConfig}
                                    defaultHeight={drawingWallDefaultHeight}
                                    onCancel={handleStructurePlacementCancel}
                                    onFinish={handleStructurePlacementFinish}
                                    onPolesChange={(newPoles) => {
                                        wallTransaction.updateSegment(-1, { poles: newPoles });

                                        if (scene) {
                                            const updatedScene = updateWallOptimistic(scene, -1, { poles: newPoles });
                                            setScene(updatedScene);
                                        }
                                    }}
                                    wallTransaction={wallTransaction}
                                />
                            )}
                            {drawingMode === 'region' && drawingRegionIndex !== null && (
                                <RegionDrawingTool
                                    sceneId={sceneId}
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
                                        if (scene) {
                                            const updatedScene = updateRegionOptimistic(scene, -1, { vertices: newVertices });
                                            setScene(updatedScene);
                                        }
                                    }}
                                    regionTransaction={regionTransaction}
                                />
                            )}
                            {activeTool === 'sourceDrawing' && sourcePlacementProperties && scene && (
                                <SourceDrawingTool
                                    sceneId={sceneId || ''}
                                    source={{
                                        sceneId: sceneId || '',
                                        index: -1,
                                        name: `${sourcePlacementProperties.type} Source ${(scene.sources?.length || 0) + 1}`,
                                        position: { x: 0, y: 0 },
                                        ...sourcePlacementProperties
                                    }}
                                    walls={scene.walls || []}
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
                </SceneCanvas>
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

export const SceneEditorPage: React.FC = () => {
    return (
        <ClipboardProvider>
            <UndoRedoProvider>
                <SceneEditorPageInternal />
            </UndoRedoProvider>
        </ClipboardProvider>
    );
};
