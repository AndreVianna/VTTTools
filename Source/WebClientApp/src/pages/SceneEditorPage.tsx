import React, { useState, useRef, useEffect, useCallback } from 'react';
import { Box, useTheme, CircularProgress, Typography, Alert, Snackbar } from '@mui/material';
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
    AssetContextMenu,
    WallContextMenu,
    DrawingMode,
    WallDrawingTool,
    WallRenderer,
    RegionRenderer,
    SourceRenderer,
    WallTransformer,
    LeftToolBar,
    TopToolBar,
    EditorStatusBar
} from '@components/scene';
import { EditingBlocker, ConfirmDialog } from '@components/common';
import { EditorLayout } from '@components/layout';
import { GridConfig, GridType, getDefaultGrid } from '@utils/gridCalculator';
import { layerManager, LayerName, GroupName } from '@services/layerManager';
import {
    Asset,
    AssetKind,
    PlacedAsset,
    Scene,
    DisplayName,
    LabelPosition,
    SceneWall,
    SceneRegion,
    SceneSource,
    WallVisibility,
    Pole
} from '@/types/domain';
import { UndoRedoProvider, useUndoRedoContext } from '@/contexts/UndoRedoContext';
import { ClipboardProvider } from '@/contexts/ClipboardContext';
import { useClipboard } from '@/contexts/useClipboard';
import { useConnectionStatus } from '@/hooks/useConnectionStatus';
import {
    createPlaceAssetCommand,
    createMoveAssetCommand,
    createBatchCommand,
    createBulkRemoveAssetsCommand,
    createCopyAssetsCommand,
    createCutAssetsCommand,
    createPasteAssetsCommand,
    createRenameAssetCommand,
    createUpdateAssetDisplayCommand
} from '@/utils/commands';
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
    useUpdateSceneWallMutation
} from '@/services/sceneApi';
import { useUploadFileMutation } from '@/services/mediaApi';
import { hydratePlacedAssets, ensureSceneDefaults } from '@/utils/sceneMappers';
import { getApiEndpoints } from '@/config/development';
import { SaveStatus } from '@/components/common';
import { useAppDispatch } from '@/store';
import { assetsApi } from '@/services/assetsApi';

const STAGE_WIDTH = 2800;
const STAGE_HEIGHT = 2100;
const SCENE_DEFAULT_BACKGROUND = '/assets/backgrounds/tavern.png';

// No menu bar anymore (toolbars are absolute overlays), only EditorLayout header
const EDITOR_HEADER_HEIGHT = 64;
const TOTAL_TOP_HEIGHT = EDITOR_HEADER_HEIGHT;

const SceneEditorPageInternal: React.FC = () => {
    const theme = useTheme();
    const navigate = useNavigate();
    const { sceneId } = useParams<{ sceneId: string }>();
    const canvasRef = useRef<SceneCanvasHandle>(null);
    const stageRef = useRef<Konva.Stage>(null);
    const { execute } = useUndoRedoContext();
    const { copyAssets, cutAssets, clipboard, canPaste, getClipboardAssets, clearClipboard } = useClipboard();
    const { isOnline } = useConnectionStatus();
    const dispatch = useAppDispatch();

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

    // Force refetch on mount with forceRefetch option
    useEffect(() => {
        if (sceneId) {
            refetch();
        }
    }, []); // eslint-disable-line react-hooks/exhaustive-deps

    const [isInitialized, setIsInitialized] = useState(false);
    const [scene, setScene] = useState<Scene | null>(null);

    const initialViewport = {
        x: (window.innerWidth - STAGE_WIDTH) / 2,
        y: ((window.innerHeight - TOTAL_TOP_HEIGHT) - STAGE_HEIGHT) / 2,
        scale: 1
    };

    const [viewport, setViewport] = useState<Viewport>(initialViewport);
    const [gridConfig, setGridConfig] = useState<GridConfig>(getDefaultGrid());
    const [backgroundImageUrl] = useState<string>(SCENE_DEFAULT_BACKGROUND);
    const [draggedAsset, setDraggedAsset] = useState<Asset | null>(null);
    const [selectedAssetIds, setSelectedAssetIds] = useState<string[]>(() => {
        const stored = localStorage.getItem('scene-selected-assets');
        if (stored) {
            try {
                return JSON.parse(stored);
            } catch {
                return [];
            }
        }
        return [];
    });
    const [isSceneReady, setIsSceneReady] = useState<boolean>(false);
    const [imagesLoaded, setImagesLoaded] = useState<boolean>(false);
    const [handlersReady, setHandlersReady] = useState<boolean>(false);
    const [placedAssets, setPlacedAssets] = useState<PlacedAsset[]>([]);
    const [isHydrating, setIsHydrating] = useState(false);
    const [saveStatus, setSaveStatus] = useState<SaveStatus>('idle');
    const [deleteConfirmOpen, setDeleteConfirmOpen] = useState(false);
    const [assetsToDelete, setAssetsToDelete] = useState<PlacedAsset[]>([]);
    const [contextMenuPosition, setContextMenuPosition] = useState<{ left: number; top: number } | null>(null);
    const [errorMessage, setErrorMessage] = useState<string | null>(null);
    const [contextMenuAsset, setContextMenuAsset] = useState<PlacedAsset | null>(null);

    const [drawingMode, setDrawingMode] = useState<DrawingMode>(null);
    const [selectedWallIndex, setSelectedWallIndex] = useState<number | null>(null);
    const [drawingWallIndex, setDrawingWallIndex] = useState<number | null>(null);
    const [drawingWallDefaultHeight, setDrawingWallDefaultHeight] = useState<number>(10);
    const [WallContextMenuPosition, setWallContextMenuPosition] = useState<{ left: number; top: number } | null>(null);
    const [contextMenuWall, setContextMenuWall] = useState<SceneWall | null>(null);
    const [isEditingVertices, setIsEditingVertices] = useState(false);

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
    const [cursorPosition, setCursorPosition] = useState<{ x: number; y: number } | undefined>(undefined);
    const [activePanel, setActivePanel] = useState<string | null>(null);

    useEffect(() => {
        if (sceneData && !isInitialized) {
            const initializeScene = async () => {
                setIsHydrating(true);
                try {
                    const hydratedAssets = await hydratePlacedAssets(
                        sceneData.assets,
                        async (assetId: string) => {
                            const result = await dispatch(
                                assetsApi.endpoints.getAsset.initiate(assetId)
                            ).unwrap();
                            return result;
                        }
                    );

                    const sceneWithDefaults = ensureSceneDefaults(sceneData);
                    setScene(sceneWithDefaults);
                    setGridConfig({
                        type: typeof sceneData.grid.type === 'string'
                            ? GridType[sceneData.grid.type as keyof typeof GridType]
                            : sceneData.grid.type,
                        cellSize: sceneData.grid.cellSize,
                        offset: sceneData.grid.offset,
                        snap: sceneData.grid.snap
                    });
                    setPlacedAssets(hydratedAssets);
                    setIsInitialized(true);
                } catch (error) {
                    console.error('Failed to hydrate scene assets:', error);
                    const sceneWithDefaults = ensureSceneDefaults(sceneData);
                    setScene(sceneWithDefaults);
                    setGridConfig({
                        type: typeof sceneData.grid.type === 'string'
                            ? GridType[sceneData.grid.type as keyof typeof GridType]
                            : sceneData.grid.type,
                        cellSize: sceneData.grid.cellSize,
                        offset: sceneData.grid.offset,
                        snap: sceneData.grid.snap
                    });
                    setPlacedAssets([]);
                    setIsInitialized(true);
                } finally {
                    setIsHydrating(false);
                }
            };

            initializeScene();
        }
    }, [sceneData, isInitialized, dispatch]);

    useEffect(() => {
        localStorage.setItem('scene-selected-assets', JSON.stringify(selectedAssetIds));
    }, [selectedAssetIds]);

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

    const handleSceneNameChange = useCallback((name: string) => {
        if (!sceneId || !scene) return;
        setScene(prev => prev ? { ...prev, name } : null);
    }, [sceneId, scene]);

    const handleBackClick = useCallback(() => {
        if (scene?.adventure?.id) {
            navigate(`/adventures/${scene.adventure.id}`);
        } else {
            navigate('/content-library');
        }
    }, [scene, navigate]);

    const handleSceneDescriptionChange = useCallback((description: string) => {
        if (!sceneId || !scene) {
            return;
        }
        setScene(prev => prev ? { ...prev, description } : null);
        saveChanges({ description });
    }, [sceneId, scene, saveChanges]);

    const handleScenePublishedChange = useCallback((isPublished: boolean) => {
        if (!sceneId) return;
        setScene(prev => prev ? { ...prev, isPublished } : null);
        saveChanges({ isPublished });
    }, [sceneId, saveChanges]);

    const handleSceneUpdate = useCallback((updates: Partial<Scene>) => {
        if (!sceneId || !scene) return;
        setScene(prev => prev ? { ...prev, ...updates } : null);
        saveChanges(updates as any);
    }, [sceneId, scene, saveChanges]);

    // Initialize Stage reference when SceneCanvas is ready
    // CRITICAL: TokenDragHandle depends on this ref being set to attach event handlers
    useEffect(() => {
        const stage = canvasRef.current?.getStage();

        if (stage && stage !== stageRef.current) {
            stageRef.current = stage;
            layerManager.initialize(stage);
            layerManager.enforceZOrder();
        }
    }, [isSceneReady]);

    // Validation: Ensure Stage is set when scene is ready
    // This catches initialization failures early in development
    useEffect(() => {
        if (isSceneReady && !stageRef.current) {
            console.error(
                '[SceneEditorPage] CRITICAL: Scene is ready but Stage reference not set. ' +
                'TokenDragHandle will not be able to attach event handlers. ' +
                'This will break asset selection, movement, and deletion.'
            );
        }
    }, [isSceneReady]);

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

    useEffect(() => {
        if (stageRef.current && imagesLoaded && handlersReady && !isSceneReady) {
            setIsSceneReady(true);
        }
    }, [imagesLoaded, handlersReady, isSceneReady]);

    const [isAltPressed, setIsAltPressed] = useState(false);
    const [isCtrlPressed, setIsCtrlPressed] = useState(false);
    const [isShiftPressed, setIsShiftPressed] = useState(false);

    const snapMode: 'free' | 'grid' | 'half-step' =
        isAltPressed && isCtrlPressed ? 'half-step' :
        isAltPressed ? 'free' :
        isCtrlPressed ? 'grid' :
        gridConfig.snap ? 'grid' : 'free';

    useEffect(() => {
        const handleKeyDown = (e: KeyboardEvent) => {
            if (e.target instanceof HTMLInputElement || e.target instanceof HTMLTextAreaElement) {
                return;
            }

            if (e.key === 'Alt' || e.key === 'Control' || e.key === 'Shift') {
                e.preventDefault();
            }

            if (e.key === 'Escape' && draggedAsset) {
                setDraggedAsset(null);
            }

            if (e.key === 'Alt') {
                setIsAltPressed(true);
            }
            if (e.key === 'Control') {
                setIsCtrlPressed(true);
            }
            if (e.key === 'Shift') {
                setIsShiftPressed(true);
            }
        };

        const handleKeyUp = (e: KeyboardEvent) => {
            if (e.key === 'Alt' || e.key === 'Control' || e.key === 'Shift') {
                e.preventDefault();
            }

            if (e.key === 'Alt') {
                setIsAltPressed(false);
            }
            if (e.key === 'Control') {
                setIsCtrlPressed(false);
            }
            if (e.key === 'Shift') {
                setIsShiftPressed(false);
            }
        };

        const handleBlur = () => {
            setIsAltPressed(false);
            setIsCtrlPressed(false);
            setIsShiftPressed(false);
        };

        window.addEventListener('keydown', handleKeyDown, { capture: true });
        window.addEventListener('keyup', handleKeyUp, { capture: true });
        window.addEventListener('blur', handleBlur);

        return () => {
            window.removeEventListener('keydown', handleKeyDown, { capture: true });
            window.removeEventListener('keyup', handleKeyUp, { capture: true });
            window.removeEventListener('blur', handleBlur);
        };
    }, [draggedAsset]);

    const handleViewportChange = (newViewport: Viewport) => {
        setViewport(newViewport);
    };

    const handleZoomIn = () => {
        canvasRef.current?.zoomIn();
    };

    const handleZoomOut = () => {
        canvasRef.current?.zoomOut();
    };

    const handleGridChange = useCallback((newGrid: GridConfig) => {
        if (!scene || !sceneId) return;

        const normalizedGrid = {
            ...newGrid,
            type: typeof newGrid.type === 'string'
                ? GridType[newGrid.type as keyof typeof GridType]
                : newGrid.type
        };

        setGridConfig(normalizedGrid);
        setScene(prev => prev ? {
            ...prev,
            grid: {
                type: newGrid.type as any,
                cellSize: newGrid.cellSize,
                offset: newGrid.offset,
                snap: newGrid.snap
            }
        } : null);

        saveChanges({
            grid: {
                type: newGrid.type as any,
                cellSize: newGrid.cellSize,
                offset: newGrid.offset,
                snap: newGrid.snap
            }
        });
    }, [scene, sceneId, saveChanges]);

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

    const handleAssetPlaced = (asset: PlacedAsset) => {
        const command = createPlaceAssetCommand({
            asset,
            onPlace: async (placedAsset) => {
                setPlacedAssets(prev => {
                    if (prev.some(a => a.id === placedAsset.id)) {
                        return prev;
                    }
                    return [...prev, placedAsset];
                });

                if (sceneId && isOnline && scene) {
                    try {
                        await addSceneAsset({
                            sceneId,
                            libraryAssetId: placedAsset.assetId,
                            position: placedAsset.position,
                            size: { width: placedAsset.size.width, height: placedAsset.size.height },
                            rotation: placedAsset.rotation
                        }).unwrap();
                        const { data: updatedScene } = await refetch();
                        if (updatedScene) {
                            setScene(updatedScene);
                        }
                    } catch (error) {
                        console.error('Failed to persist placed asset:', error);
                    }
                }
            },
            onRemove: async (assetId) => {
                const asset = placedAssets.find(a => a.id === assetId);
                setPlacedAssets(prev => prev.filter(a => a.id !== assetId));

                if (sceneId && isOnline && scene && asset) {
                    try {
                        await removeSceneAsset({ sceneId, assetNumber: asset.index }).unwrap();
                        const { data: updatedScene } = await refetch();
                        if (updatedScene) {
                            setScene(updatedScene);
                        }
                    } catch (error) {
                        console.error('Failed to remove asset:', error);
                    }
                }
            }
        });
        execute(command);
    };

    const handleAssetMoved = (moves: Array<{ assetId: string; oldPosition: { x: number; y: number }; newPosition: { x: number; y: number } }>) => {
        if (moves.length === 0) return;

        if (moves.length === 1) {
            const move = moves[0];
            const { assetId, oldPosition, newPosition } = move as { assetId: string; oldPosition: { x: number; y: number }; newPosition: { x: number; y: number } };

            const command = createMoveAssetCommand({
                assetId,
                oldPosition,
                newPosition,
                onMove: async (id, position) => {
                    // Find asset INSIDE the setState callback to ensure we get current state
                    let assetIndex: number | undefined;
                    setPlacedAssets(prev => {
                        const asset = prev.find(a => a.id === id);
                        assetIndex = asset?.index;
                        return prev.map(a => (a.id === id ? { ...a, position } : a));
                    });

                    if (sceneId && isOnline && scene && assetIndex !== undefined) {
                        try {
                            await updateSceneAsset({
                                sceneId,
                                assetNumber: assetIndex,
                                position
                            }).unwrap();
                        } catch (error) {
                            console.error('Failed to persist asset movement:', error);
                        }
                    }
                }
            });
            execute(command);
        } else {
            // Collect backend asset indices and positions upfront for bulk update
            const bulkUpdates: Array<{ index: number; position: { x: number; y: number } }> = [];

            moves.forEach(({ assetId, newPosition }) => {
                const asset = placedAssets.find(a => a.id === assetId);
                if (asset) {
                    bulkUpdates.push({ index: asset.index, position: newPosition });
                }
            });

            const commands = moves.map(({ assetId, oldPosition, newPosition }) => {
                return createMoveAssetCommand({
                    assetId,
                    oldPosition,
                    newPosition,
                    onMove: (id, position) => {
                        setPlacedAssets(prev => prev.map(a => (a.id === id ? { ...a, position } : a)));
                    }
                });
            });

            execute(createBatchCommand({ commands }));

            // Send bulk update with all moved assets
            if (sceneId && isOnline && scene && bulkUpdates.length > 0) {
                (async () => {
                    try {
                        await bulkUpdateSceneAssets({
                            sceneId,
                            updates: bulkUpdates
                        }).unwrap();
                    } catch (error) {
                        console.error('Failed to persist bulk asset movement:', error);
                    }
                })();
            }
        }
    };

    const handleAssetDeleted = () => {
        if (selectedAssetIds.length === 0) return;

        const assets = placedAssets.filter(a => selectedAssetIds.includes(a.id));
        setAssetsToDelete(assets);
        setDeleteConfirmOpen(true);
    };

    const confirmDelete = useCallback(async () => {
        if (assetsToDelete.length === 0) return;

        const command = createBulkRemoveAssetsCommand({
            assets: assetsToDelete,
            onBulkRemove: async (_assetIds) => {
                if (sceneId && isOnline && scene) {
                    try {
                        const indices = assetsToDelete.map(asset => asset.index);

                        await bulkDeleteSceneAssets({ sceneId, assetIndices: indices }).unwrap();
                        const { data: updatedScene } = await refetch();
                        if (updatedScene) {
                            setScene(updatedScene);
                            const hydratedAssets = await hydratePlacedAssets(
                                updatedScene.assets,
                                async (assetId: string) => {
                                    const result = await dispatch(
                                        assetsApi.endpoints.getAsset.initiate(assetId)
                                    ).unwrap();
                                    return result;
                                }
                            );
                            setPlacedAssets(hydratedAssets);
                        }
                    } catch (error) {
                        console.error('Failed to persist bulk asset deletion:', error);
                    }
                }
            },
            onBulkRestore: async (assets) => {
                if (sceneId && isOnline && scene) {
                    try {
                        await bulkAddSceneAssets({
                            sceneId,
                            assets: assets.map(asset => ({
                                assetId: asset.assetId,
                                position: asset.position,
                                size: { width: asset.size.width, height: asset.size.height },
                                rotation: asset.rotation
                            }))
                        }).unwrap();

                        const { data: updatedScene } = await refetch();
                        if (updatedScene) {
                            setScene(updatedScene);
                            const hydratedAssets = await hydratePlacedAssets(
                                updatedScene.assets,
                                async (assetId: string) => {
                                    const result = await dispatch(
                                        assetsApi.endpoints.getAsset.initiate(assetId)
                                    ).unwrap();
                                    return result;
                                }
                            );
                            setPlacedAssets(hydratedAssets);
                        }
                    } catch (error) {
                        console.error('Failed to restore deleted assets:', error);
                    }
                }
            }
        });

        execute(command);
        setSelectedAssetIds([]);
        setDeleteConfirmOpen(false);
        setAssetsToDelete([]);
    }, [assetsToDelete, sceneId, isOnline, scene, bulkDeleteSceneAssets, bulkAddSceneAssets, refetch, execute, dispatch]);

    const handleCopyAssets = useCallback(() => {
        if (selectedAssetIds.length === 0 || !sceneId) return;

        const assets = placedAssets.filter(a => selectedAssetIds.includes(a.id));

        const command = createCopyAssetsCommand({
            assets,
            onCopy: (copiedAssets) => {
                copyAssets(copiedAssets, sceneId);
            }
        });

        execute(command);
    }, [selectedAssetIds, sceneId, copyAssets, execute, placedAssets]);

    const handleCutAssets = useCallback(() => {
        if (selectedAssetIds.length === 0 || !sceneId || !isOnline) return;

        const assetsToDelete = placedAssets.filter(a => selectedAssetIds.includes(a.id));

        const command = createCutAssetsCommand({
            assets: assetsToDelete,
            onCut: async (assets) => {
                cutAssets(assets, sceneId);

                if (sceneId && isOnline && scene) {
                    try {
                        const indices = assets.map(asset => asset.index);
                        await bulkDeleteSceneAssets({ sceneId, assetIndices: indices }).unwrap();
                        const { data: updatedScene } = await refetch();
                        if (updatedScene) {
                            setScene(updatedScene);
                            const hydratedAssets = await hydratePlacedAssets(
                                updatedScene.assets,
                                async (assetId: string) => {
                                    const result = await dispatch(
                                        assetsApi.endpoints.getAsset.initiate(assetId)
                                    ).unwrap();
                                    return result;
                                }
                            );
                            setPlacedAssets(hydratedAssets);
                        }
                    } catch (error) {
                        console.error('Failed to persist cut operation:', error);
                    }
                }
            },
            onRestore: async (restoredAssets) => {
                if (sceneId && isOnline && scene) {
                    try {
                        await bulkAddSceneAssets({
                            sceneId,
                            assets: restoredAssets.map(asset => ({
                                assetId: asset.assetId,
                                position: asset.position,
                                size: { width: asset.size.width, height: asset.size.height },
                                rotation: asset.rotation
                            }))
                        }).unwrap();

                        const { data: updatedScene } = await refetch();
                        if (updatedScene) {
                            setScene(updatedScene);
                            const hydratedAssets = await hydratePlacedAssets(
                                updatedScene.assets,
                                async (assetId: string) => {
                                    const result = await dispatch(
                                        assetsApi.endpoints.getAsset.initiate(assetId)
                                    ).unwrap();
                                    return result;
                                }
                            );
                            setPlacedAssets(hydratedAssets);
                        }
                    } catch (error) {
                        console.error('Failed to restore cut assets:', error);
                    }
                }
            }
        });

        execute(command);
        setSelectedAssetIds([]);
    }, [selectedAssetIds, sceneId, isOnline, scene, cutAssets, bulkDeleteSceneAssets, bulkAddSceneAssets, refetch, execute, dispatch, placedAssets]);

    const handlePasteAssets = useCallback(() => {
        if (!canPaste || !sceneId || !isOnline || !scene) return;

        const clipboardAssets = getClipboardAssets();
        if (clipboardAssets.length === 0) return;

        const command = createPasteAssetsCommand({
            clipboardAssets,
            onPaste: async (assets) => {
                const PASTE_OFFSET = 20;

                const newPlacedAssets: PlacedAsset[] = assets.map(asset => ({
                    ...asset,
                    id: `placed-${Date.now()}-${Math.random()}`,
                    position: {
                        x: asset.position.x + PASTE_OFFSET,
                        y: asset.position.y + PASTE_OFFSET
                    }
                }));

                if (sceneId && isOnline && scene) {
                    try {
                        await bulkAddSceneAssets({
                            sceneId,
                            assets: newPlacedAssets.map(pa => ({
                                assetId: pa.assetId,
                                position: pa.position,
                                size: { width: pa.size.width, height: pa.size.height },
                                rotation: pa.rotation
                            }))
                        }).unwrap();

                        const { data: updatedScene } = await refetch();
                        if (updatedScene) {
                            setScene(updatedScene);
                            const hydratedAssets = await hydratePlacedAssets(
                                updatedScene.assets,
                                async (assetId: string) => {
                                    const result = await dispatch(
                                        assetsApi.endpoints.getAsset.initiate(assetId)
                                    ).unwrap();
                                    return result;
                                }
                            );
                            setPlacedAssets(hydratedAssets);

                            if (clipboard.operation === 'cut') {
                                clearClipboard();
                            }

                            return hydratedAssets;
                        }
                    } catch (error) {
                        console.error('Failed to persist pasted assets:', error);
                        return [];
                    }
                }

                return newPlacedAssets;
            },
            onUndo: async (assetIds) => {
                if (sceneId && isOnline && scene) {
                    try {
                        let indicesToDelete: number[] = [];
                        setPlacedAssets(prev => {
                            const assetsToDelete = prev.filter(a => assetIds.includes(a.id));
                            indicesToDelete = assetsToDelete.map(a => a.index);
                            return prev.filter(a => !assetIds.includes(a.id));
                        });

                        await bulkDeleteSceneAssets({ sceneId, assetIndices: indicesToDelete }).unwrap();

                        const { data: updatedScene } = await refetch();
                        if (updatedScene) {
                            setScene(updatedScene);
                            const hydratedAssets = await hydratePlacedAssets(
                                updatedScene.assets,
                                async (assetId: string) => {
                                    const result = await dispatch(
                                        assetsApi.endpoints.getAsset.initiate(assetId)
                                    ).unwrap();
                                    return result;
                                }
                            );
                            setPlacedAssets(hydratedAssets);
                        }
                    } catch (error) {
                        console.error('Failed to undo paste operation:', error);
                    }
                }
            }
        });

        execute(command);
    }, [canPaste, sceneId, isOnline, scene, getClipboardAssets, clipboard.operation, clearClipboard, bulkAddSceneAssets, bulkDeleteSceneAssets, refetch, execute, dispatch]);

    const handleWallDelete = useCallback(async (wallIndex: number) => {
        if (!sceneId) return;

        try {
            await removeSceneWall({ sceneId, wallIndex }).unwrap();

            const { data: updatedScene } = await refetch();
            if (updatedScene) {
                setScene(updatedScene);
            }

            setSelectedWallIndex(null);
        } catch (error) {
            console.error('Failed to remove wall:', error);
            setErrorMessage('Failed to remove wall. Please try again.');
        }
    }, [sceneId, scene, removeSceneWall, refetch]);


    const handleEditVertices = useCallback((wallIndex: number) => {
        setSelectedWallIndex(wallIndex);
        setIsEditingVertices(true);
    }, []);

    const handleVerticesChange = useCallback(async (
        wallIndex: number,
        newPoles: Pole[]
    ) => {
        if (!sceneId) return;

        try {
            await updateSceneWall({
                sceneId,
                wallIndex,
                poles: newPoles
            }).unwrap();
            setIsEditingVertices(false);
        } catch (error) {
            console.error('Failed to update wall poles:', error);
            setErrorMessage('Failed to update poles. Please try again.');
        }
    }, [sceneId, updateSceneWall]);

    useEffect(() => {
        const handleKeyDown = (e: KeyboardEvent) => {
            if (e.target instanceof HTMLInputElement || e.target instanceof HTMLTextAreaElement) {
                return;
            }

            if (e.ctrlKey && e.key === 'c' && !e.shiftKey && !e.altKey) {
                e.preventDefault();
                handleCopyAssets();
            }

            if (e.ctrlKey && e.key === 'x' && !e.shiftKey && !e.altKey) {
                e.preventDefault();
                handleCutAssets();
            }

            if (e.ctrlKey && e.key === 'v' && !e.shiftKey && !e.altKey) {
                e.preventDefault();
                handlePasteAssets();
            }

            if (e.key === 'Delete' && selectedWallIndex !== null) {
                e.preventDefault();
                handleWallDelete(selectedWallIndex);
            }

            if (e.key === 'Escape') {
                e.preventDefault();
                setSelectedWallIndex(null);
                setIsEditingVertices(false);
            }
        };

        window.addEventListener('keydown', handleKeyDown, { capture: true });

        return () => {
            window.removeEventListener('keydown', handleKeyDown, { capture: true });
        };
    }, [handleCopyAssets, handleCutAssets, handlePasteAssets, selectedWallIndex, handleWallDelete]);

    const handleAssetSelected = (assetIds: string[]) => {
        setSelectedAssetIds(assetIds);
    };

    const handleDragComplete = () => {
        setDraggedAsset(null);
    };

    const handleImagesLoaded = () => {
        setImagesLoaded(true);
    };

    const handleHandlersReady = () => {
        setHandlersReady(true);
    };

    const handleAssetContextMenu = (assetId: string, position: { x: number; y: number }) => {
        const asset = placedAssets.find((a) => a.id === assetId);
        if (!asset) return;

        setContextMenuPosition({ left: position.x, top: position.y });
        setContextMenuAsset(asset);
    };

    const handleContextMenuClose = () => {
        setContextMenuPosition(null);
        setContextMenuAsset(null);
    };

    const handleAssetRename = async (assetId: string, newName: string) => {
        if (!sceneId) return;

        const asset = placedAssets.find((a) => a.id === assetId);
        if (!asset) return;

        const oldName = asset.name;

        const command = createRenameAssetCommand({
            assetId,
            oldName,
            newName,
            onRename: async (id, name) => {
                const assetToUpdate = placedAssets.find((a) => a.id === id);
                if (!assetToUpdate) return;

                await updateSceneAsset({
                    sceneId,
                    assetNumber: assetToUpdate.index,
                    name,
                }).unwrap();

                setPlacedAssets(prev => prev.map(a => a.id === id ? { ...a, name } : a));
            }
        });

        execute(command);
    };

    const handleAssetDisplayUpdate = async (
        assetId: string,
        displayName?: DisplayName,
        labelPosition?: LabelPosition
    ) => {
        if (!sceneId) return;

        const asset = placedAssets.find((a) => a.id === assetId);
        if (!asset) return;

        const oldDisplay = {
            displayName: asset.displayName,
            labelPosition: asset.labelPosition,
        };
        const newDisplay = {
            displayName: displayName ?? asset.displayName,
            labelPosition: labelPosition ?? asset.labelPosition,
        };

        const command = createUpdateAssetDisplayCommand({
            assetId,
            oldDisplay,
            newDisplay,
            onUpdate: async (id, dn, lp) => {
                const assetToUpdate = placedAssets.find((a) => a.id === id);
                if (!assetToUpdate) return;

                const updateParams: any = {
                    sceneId,
                    assetNumber: assetToUpdate.index,
                };
                if (dn !== undefined) updateParams.displayName = dn;
                if (lp !== undefined) updateParams.labelPosition = lp;

                await updateSceneAsset(updateParams).unwrap();

                setPlacedAssets(prev => prev.map(a => {
                    if (a.id === id) {
                        return {
                            ...a,
                            ...(dn !== undefined && { displayName: dn }),
                            ...(lp !== undefined && { labelPosition: lp })
                        };
                    }
                    return a;
                }));
            }
        });

        execute(command);
    };

    const handleDrawingModeChange = (mode: DrawingMode) => {
        setDrawingMode(mode);
    };

    // TODO: Implement progressive creation for regions and sources similar to walls
    // Region and source drawing currently non-functional pending implementation

    const handleStructurePlacementCancel = useCallback(async () => {
        console.log('[SceneEditorPage] Ending wall placement mode');

        // Refetch scene to get the latest wall data with poles
        const { data: updatedScene } = await refetch();
        if (updatedScene) {
            setScene(updatedScene);
        }

        setDrawingWallIndex(null);
        setDrawingMode(null);
    }, [refetch]);

    const handleCanvasMouseMove = useCallback((e: React.MouseEvent<HTMLDivElement>) => {
        const canvasX = Math.round((e.clientX - viewport.x) / viewport.scale);
        const canvasY = Math.round((e.clientY - viewport.y) / viewport.scale);
        setCursorPosition({ x: canvasX, y: canvasY });
    }, [viewport]);

    const handleWallSelect = useCallback((wallIndex: number) => {
        setSelectedWallIndex(wallIndex);
        setIsEditingVertices(false);
    }, []);

    const handleWallContextMenu = useCallback((
        wallIndex: number,
        position: { x: number; y: number }
    ) => {
        const sceneWall = scene?.walls?.find(sw => sw.index === wallIndex);

        if (sceneWall) {
            setWallContextMenuPosition({ left: position.x, top: position.y });
            setContextMenuWall(sceneWall);
        }
    }, [scene]);

    const handleWallContextMenuClose = useCallback(() => {
        setWallContextMenuPosition(null);
        setContextMenuWall(null);
    }, []);

    const handlePlaceWall = useCallback(async (properties: {
        visibility: WallVisibility;
        isClosed: boolean;
        material?: string;
        defaultHeight: number;
    }) => {
        if (!sceneId) return;

        console.log('[SceneEditorPage] handlePlaceWall called', properties);

        try {
            const existingWalls = scene?.walls || [];
            const wallCount = existingWalls.filter((w) => w.name.startsWith('Wall ')).length;
            const wallName = `Wall ${wallCount + 1}`;

            console.log('[SceneEditorPage] Creating wall with empty poles:', { wallName, wallCount });

            const response = await addSceneWall({
                sceneId,
                name: wallName,
                poles: [],
                visibility: properties.visibility,
                isClosed: properties.isClosed,
                material: properties.material,
                color: '#808080'
            }).unwrap();

            console.log('[SceneEditorPage] Wall created with index:', response.index);

            const { data: updatedScene } = await refetch();
            if (updatedScene) {
                console.log('[SceneEditorPage] Scene refetched after wall creation:', {
                    fullScene: updatedScene,
                    wallsCount: updatedScene.walls?.length || 0,
                    walls: updatedScene.walls
                });
                setScene(updatedScene);
            }

            setDrawingWallIndex(response.index);
            setDrawingWallDefaultHeight(properties.defaultHeight);
            setDrawingMode('wall');
            setActivePanel(null);

            console.log('[SceneEditorPage] Entering drawing mode for wall index:', response.index);

        } catch (error) {
            console.error('[SceneEditorPage] Failed to create wall:', error);
            setErrorMessage('Failed to create wall. Please try again.');
        }
    }, [sceneId, scene, addSceneWall, refetch]);

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
            onSceneNameChange={handleSceneNameChange}
            onBackClick={handleBackClick}
            onSceneDescriptionChange={handleSceneDescriptionChange}
            onScenePublishedChange={handleScenePublishedChange}
            onSceneUpdate={handleSceneUpdate}
        >
            <Box sx={{ display: 'flex', flexDirection: 'column', height: '100%', position: 'relative' }}>
            <EditingBlocker isBlocked={!isOnline} />

            <Box
                id="canvas-container"
                onMouseMove={handleCanvasMouseMove}
                sx={{
                    flexGrow: 1,
                    overflow: 'hidden',
                    bgcolor: 'background.default',
                    position: 'relative',
                    width: '100%',
                    height: '100%',
                    cursor: drawingMode === 'wall' ? 'crosshair' : 'default'
                }}
            >
                <TopToolBar
                    drawingMode={drawingMode}
                    onDrawingModeChange={handleDrawingModeChange}
                    onUndoClick={() => execute('undo')}
                    onRedoClick={() => execute('redo')}
                    onZoomIn={handleZoomIn}
                    onZoomOut={handleZoomOut}
                    onGridToggle={() => setGridConfig(prev => ({ ...prev, type: prev.type === GridType.NoGrid ? GridType.Square : GridType.NoGrid }))}
                    onClearSelection={() => handleAssetSelected([])}
                    canUndo={false}
                    canRedo={false}
                    gridVisible={gridConfig.type !== GridType.NoGrid}
                />

                <LeftToolBar
                    activePanel={activePanel}
                    onPanelChange={(panel) => {
                        console.log('Panel changed:', panel);
                        setActivePanel(panel);
                    }}
                    backgroundUrl={backgroundUrl}
                    isUploadingBackground={isUploadingBackground}
                    onBackgroundUpload={handleBackgroundUpload}
                    gridConfig={gridConfig}
                    onGridChange={handleGridChange}
                    sceneId={sceneId}
                    sceneWalls={scene?.walls}
                    selectedWallIndex={selectedWallIndex}
                    onWallSelect={handleWallSelect}
                    onWallDelete={handleWallDelete}
                    onPlaceWall={handlePlaceWall}
                    onEditVertices={handleEditVertices}
                />

                <EditorStatusBar
                    cursorPosition={cursorPosition}
                    totalAssets={placedAssets.length}
                    selectedCount={selectedAssetIds.length}
                    zoomPercentage={viewport.scale * 100}
                    activeTool={drawingMode || undefined}
                    gridSnapEnabled={gridConfig.snapToGrid}
                />

                <SceneCanvas
                    ref={canvasRef}
                    width={window.innerWidth}
                    height={window.innerHeight - TOTAL_TOP_HEIGHT}
                    initialPosition={{ x: initialViewport.x, y: initialViewport.y }}
                    backgroundColor={theme.palette.background.default}
                    onViewportChange={handleViewportChange}
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
                                {scene && scene.regions && (
                            <Group name={GroupName.Structure}>
                                {scene.regions.map((sceneRegion) => (
                                    <RegionRenderer
                                        key={`${sceneRegion.sceneId}-${sceneRegion.index}`}
                                        sceneRegion={sceneRegion}
                                    />
                                ))}
                            </Group>
                        )}

                        {/* Sources - render second */}
                        {scene && scene.sources && (
                            <Group name={GroupName.Structure}>
                                {scene.sources.map((sceneSource) => (
                                    <SourceRenderer
                                        key={`${sceneSource.sceneId}-${sceneSource.index}`}
                                        sceneSource={sceneSource}
                                        walls={scene.walls || []}
                                        gridConfig={gridConfig}
                                    />
                                ))}
                            </Group>
                        )}

                        {/* Walls - render third (top of structures) */}
                        {scene && scene.walls && (
                            <Group name={GroupName.Structure}>
                                {scene.walls.map((sceneWall) => (
                                    <React.Fragment key={sceneWall.index}>
                                        <WallRenderer
                                            sceneWall={sceneWall}
                                            isSelected={selectedWallIndex === sceneWall.index}
                                            onSelect={handleWallSelect}
                                            onContextMenu={handleWallContextMenu}
                                        />
                                        {isEditingVertices && selectedWallIndex === sceneWall.index && (
                                            <WallTransformer
                                                poles={sceneWall.poles}
                                                onPolesChange={(newPoles) =>
                                                    handleVerticesChange(sceneWall.index, newPoles)
                                                }
                                                gridConfig={gridConfig}
                                                snapEnabled={gridConfig.snap}
                                            />
                                        )}
                                    </React.Fragment>
                                ))}
                            </Group>
                        )}
                            </>
                        )}
                    </Layer>

                    {/* Layer 5: Assets (tokens/objects/creatures) */}
                    {scene && (layerVisibility.objects || layerVisibility.creatures) && (
                        <TokenPlacement
                            placedAssets={placedAssets.filter(asset => {
                                if (asset.asset.kind === AssetKind.Object && !layerVisibility.objects) {
                                    return false;
                                }
                                if (asset.asset.kind === AssetKind.Creature && !layerVisibility.creatures) {
                                    return false;
                                }
                                return true;
                            })}
                            onAssetPlaced={handleAssetPlaced}
                            onAssetMoved={handleAssetMoved}
                            onAssetDeleted={handleAssetDeleted}
                            gridConfig={gridConfig}
                            draggedAsset={draggedAsset}
                            onDragComplete={handleDragComplete}
                            onImagesLoaded={handleImagesLoaded}
                            snapMode={snapMode}
                            onContextMenu={handleAssetContextMenu}
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
                                />
                            )}
                            {/* TODO: Implement RegionDrawingTool with progressive creation like WallDrawingTool */}
                            {/* TODO: Implement SourceDrawingTool with progressive creation like WallDrawingTool */}
                        </Layer>
                    )}

                    {/* Layer 8: UI Overlay (transformer + selection) */}
                    <TokenDragHandle
                        placedAssets={placedAssets}
                        selectedAssetIds={selectedAssetIds}
                        onAssetSelected={handleAssetSelected}
                        onAssetMoved={handleAssetMoved}
                        onAssetDeleted={handleAssetDeleted}
                        gridConfig={gridConfig}
                        stageRef={stageRef as React.RefObject<Konva.Stage>}
                        isPlacementMode={!!draggedAsset}
                        enableDragMove={true}
                        onReady={handleHandlersReady}
                        snapMode={snapMode}
                        isShiftPressed={isShiftPressed}
                        isCtrlPressed={isCtrlPressed}
                    />
                </SceneCanvas>
            </Box>

            {/* Backdrop removed - was causing infinite loading on refresh due to handlersReady never being called */}
        </Box>

        <ConfirmDialog
            open={deleteConfirmOpen}
            onClose={() => setDeleteConfirmOpen(false)}
            onConfirm={confirmDelete}
            title="Delete Assets"
            message={`Delete ${assetsToDelete.length} asset${assetsToDelete.length === 1 ? '' : 's'}?`}
            confirmText="Delete"
            severity="error"
        />

        <AssetContextMenu
            anchorPosition={contextMenuPosition}
            open={contextMenuPosition !== null}
            onClose={handleContextMenuClose}
            asset={contextMenuAsset}
            onRename={handleAssetRename}
            onUpdateDisplay={handleAssetDisplayUpdate}
        />

        <WallContextMenu
            anchorPosition={WallContextMenuPosition}
            open={WallContextMenuPosition !== null}
            onClose={handleWallContextMenuClose}
            sceneWall={contextMenuWall}
            onEditVertices={handleEditVertices}
            onDelete={handleWallDelete}
        />

        {/* TODO: StructureSelectionModal removed - implement progressive creation for regions/sources */}

        <Snackbar
            open={!!errorMessage}
            autoHideDuration={6000}
            onClose={() => setErrorMessage(null)}
            anchorOrigin={{ vertical: 'bottom', horizontal: 'center' }}
        >
            <Alert onClose={() => setErrorMessage(null)} severity="error" sx={{ width: '100%' }}>
                {errorMessage}
            </Alert>
        </Snackbar>
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
