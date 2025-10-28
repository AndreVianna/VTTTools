import React, { useState, useRef, useEffect, useCallback } from 'react';
import { Box, useTheme, CircularProgress, Typography, Alert } from '@mui/material';
import { useParams, useNavigate } from 'react-router-dom';
import { Layer } from 'react-konva';
import Konva from 'konva';
import {
    SceneCanvas,
    SceneCanvasHandle,
    Viewport,
    BackgroundLayer,
    GridRenderer,
    SceneEditorMenuBar,
    TokenPlacement,
    TokenDragHandle,
    AssetContextMenu
} from '@components/scene';
import { EditingBlocker, ConfirmDialog } from '@components/common';
import { EditorLayout } from '@components/layout';
import { GridConfig, GridType, getDefaultGrid } from '@utils/gridCalculator';
import { layerManager, LayerName } from '@services/layerManager';
import { Asset, PlacedAsset, Scene, DisplayName, LabelPosition } from '@/types/domain';
import { UndoRedoProvider, useUndoRedoContext } from '@/contexts/UndoRedoContext';
import { ClipboardProvider, useClipboard } from '@/contexts/ClipboardContext';
import { useConnectionStatus } from '@/hooks/useConnectionStatus';
import {
    createPlaceAssetCommand,
    createMoveAssetCommand,
    createRemoveAssetCommand,
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
    useBulkAddSceneAssetsMutation
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

const MENU_BAR_HEIGHT = 50;
const EDITOR_HEADER_HEIGHT = 64;
const TOTAL_TOP_HEIGHT = EDITOR_HEADER_HEIGHT + MENU_BAR_HEIGHT;

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
    const [contextMenuAsset, setContextMenuAsset] = useState<PlacedAsset | null>(null);

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

    const handleSceneNameBlur = useCallback((name: string) => {
        saveChanges({ name });
    }, [saveChanges]);

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

        // Only update if stage exists and is different from current ref
        if (stage && stage !== stageRef.current) {
            stageRef.current = stage;
            layerManager.initialize(stage);
            layerManager.enforceZOrder();
        }
    }, [canvasRef.current, isSceneReady]);

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

    const handleZoomReset = () => {
        canvasRef.current?.resetView();
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

    const handleOutsideClick = () => {
        if (draggedAsset) {
            setDraggedAsset(null);
        }
    };

    const handleAssetSelect = (asset: Asset) => {
        if (!isOnline) {
            return;
        }
        setDraggedAsset(asset);
    };

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
            onBulkRemove: async (assetIds) => {
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
    }, [assetsToDelete, sceneId, isOnline, scene, placedAssets, bulkDeleteSceneAssets, bulkAddSceneAssets, refetch, execute, dispatch]);

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
    }, [selectedAssetIds, placedAssets, sceneId, copyAssets, execute]);

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
    }, [selectedAssetIds, placedAssets, sceneId, isOnline, scene, cutAssets, bulkDeleteSceneAssets, bulkAddSceneAssets, refetch, execute, dispatch]);

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
    }, [canPaste, sceneId, isOnline, scene, getClipboardAssets, clipboard.operation, clearClipboard, bulkAddSceneAssets, bulkDeleteSceneAssets, refetch, execute, dispatch, placedAssets]);

    useEffect(() => {
        const handleKeyDown = (e: KeyboardEvent) => {
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
        };

        window.addEventListener('keydown', handleKeyDown, { capture: true });

        return () => {
            window.removeEventListener('keydown', handleKeyDown, { capture: true });
        };
    }, [handleCopyAssets, handleCutAssets, handlePasteAssets]);

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
            onSceneNameBlur={handleSceneNameBlur}
            onBackClick={handleBackClick}
            saveStatus={saveStatus}
            onSceneDescriptionChange={handleSceneDescriptionChange}
            onScenePublishedChange={handleScenePublishedChange}
            onBackgroundUpload={handleBackgroundUpload}
            onGridChange={handleGridChange}
            backgroundUrl={backgroundUrl}
            isUploadingBackground={isUploadingBackground}
            onSceneUpdate={handleSceneUpdate}
        >
            <Box sx={{ display: 'flex', flexDirection: 'column', height: '100%', position: 'relative' }}>
            <EditingBlocker isBlocked={!isOnline} />

            <Box
                onClick={handleOutsideClick}
                sx={{
                    flexShrink: 0,
                    height: MENU_BAR_HEIGHT,
                    overflow: 'visible',
                    position: 'relative',
                    zIndex: 10,
                    pointerEvents: 'none'
                }}
            >
                <Box sx={{ pointerEvents: 'auto' }}>
                    <SceneEditorMenuBar
                        zoomPercentage={viewport.scale * 100}
                        onZoomIn={handleZoomIn}
                        onZoomOut={handleZoomOut}
                        onZoomReset={handleZoomReset}
                        onAssetSelect={handleAssetSelect}
                        viewport={{
                            x: initialViewport.x - viewport.x,
                            y: initialViewport.y - viewport.y
                        }}
                    />
                </Box>
            </Box>

            <Box
                id="canvas-container"
                sx={{
                    flexGrow: 1,
                    overflow: 'hidden',
                    bgcolor: 'background.default',
                    position: 'relative',
                    width: '100%',
                    height: '100%'
                }}
            >
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

                    {/* Layer 2: Game World (structure + objects + creatures) */}
                    {scene && (
                        <TokenPlacement
                            placedAssets={placedAssets}
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

                    {/* Layer 3: Effects (placeholder for future) */}
                    <Layer name={LayerName.Effects}>
                        {/* Future: effects components */}
                    </Layer>

                    {/* Layer 4: UI Overlay (transformer + selection) */}
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
