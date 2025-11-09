import { useState, useCallback, useEffect } from 'react';
import type { Scene, PlacedAsset, Asset, PlacedAssetSnapshot } from '@/types/domain';
import { createAssetSnapshot } from '@/types/domain';
import {
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
import { toBackendRotation } from '@utils/rotationUtils';
import { hydratePlacedAssets } from '@/utils/sceneMappers';
import {
    setEntityMapping,
    getIndexByDomId,
    removeEntityMapping
} from '@/utils/sceneEntityMapping';
import type {
    useAddSceneAssetMutation,
    useUpdateSceneAssetMutation,
    useBulkUpdateSceneAssetsMutation,
    useRemoveSceneAssetMutation,
    useBulkDeleteSceneAssetsMutation,
    useBulkAddSceneAssetsMutation
} from '@/services/sceneApi';
import { assetsApi } from '@/services/assetsApi';
import type { AppDispatch } from '@/store';

interface UseAssetManagementProps {
    sceneId: string | undefined;
    scene: Scene | null;
    isOnline: boolean;
    setScene: (scene: Scene) => void;
    execute: (command: any) => void;
    dispatch: AppDispatch;

    copyAssets: (assets: PlacedAsset[], sceneId: string) => void;
    cutAssets: (assets: PlacedAsset[], sceneId: string) => void;
    canPaste: boolean;
    getClipboardAssets: () => PlacedAsset[];
    clipboard: { operation?: 'copy' | 'cut' };
    clearClipboard: () => void;

    addSceneAsset: ReturnType<typeof useAddSceneAssetMutation>[0];
    updateSceneAsset: ReturnType<typeof useUpdateSceneAssetMutation>[0];
    bulkUpdateSceneAssets: ReturnType<typeof useBulkUpdateSceneAssetsMutation>[0];
    removeSceneAsset: ReturnType<typeof useRemoveSceneAssetMutation>[0];
    bulkDeleteSceneAssets: ReturnType<typeof useBulkDeleteSceneAssetsMutation>[0];
    bulkAddSceneAssets: ReturnType<typeof useBulkAddSceneAssetsMutation>[0];
    refetch: () => Promise<{ data?: Scene }>;
}

export const useAssetManagement = ({
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
}: UseAssetManagementProps) => {

    const [placedAssets, setPlacedAssets] = useState<PlacedAsset[]>([]);
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
    const [draggedAsset, setDraggedAsset] = useState<Asset | null>(null);
    const [rotationInitialSnapshots, setRotationInitialSnapshots] = useState<Map<string, PlacedAssetSnapshot>>(new Map());
    const [deleteConfirmOpen, setDeleteConfirmOpen] = useState(false);
    const [assetsToDelete, setAssetsToDelete] = useState<PlacedAsset[]>([]);

    useEffect(() => {
        localStorage.setItem('scene-selected-assets', JSON.stringify(selectedAssetIds));
    }, [selectedAssetIds]);

    const handleAssetPlaced = useCallback((asset: PlacedAsset) => {
        const command = createPlaceAssetCommand({
            asset,
            onPlace: async (placedAsset) => {
                setPlacedAssets(prev => {
                    if (prev.some(a => a.id === placedAsset.id)) {
                        return prev;
                    }
                    return [...prev, placedAsset];
                });
                setSelectedAssetIds([placedAsset.id]);

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

                            const oldIndices = new Set(scene.assets.map(a => (a as any).index));
                            const newBackendAsset = updatedScene.assets.find(sa => {
                                const saIndex = (sa as any).index;
                                return !oldIndices.has(saIndex);
                            });

                            if (newBackendAsset) {
                                const backendIndex = (newBackendAsset as any).index;

                                setEntityMapping(sceneId, 'assets', placedAsset.id, backendIndex);
                            } else {
                                console.warn('[PlaceAssetCommand] New backend asset not found - mapping not created!');
                            }

                            const hydratedAssets = await hydratePlacedAssets(
                                updatedScene.assets,
                                sceneId || '',
                                async (assetId: string) => {
                                    const result = await dispatch(
                                        (assetsApi as any).endpoints.getAsset.initiate(assetId)
                                    ).unwrap();
                                    return result;
                                }
                            );
                            setPlacedAssets(hydratedAssets);
                        }
                    } catch (error) {
                        console.error('Failed to persist placed asset:', error);
                    }
                }
            },
            onRemove: async (assetId) => {
                const backendIndex = getIndexByDomId(sceneId || '', 'assets', assetId);

                if (backendIndex === undefined) {
                    console.warn('[PlaceAssetCommand] No backend index found for asset:', assetId);
                    setPlacedAssets(prev => prev.filter(a => a.id !== assetId));
                    setSelectedAssetIds(prev => prev.filter(id => id !== assetId));
                    return;
                }

                setPlacedAssets(prev => prev.filter(a => a.id !== assetId));
                setSelectedAssetIds(prev => prev.filter(id => id !== assetId));

                if (sceneId && isOnline) {
                    try {
                        await removeSceneAsset({ sceneId, assetNumber: backendIndex }).unwrap();

                        removeEntityMapping(sceneId, 'assets', assetId);

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
    }, [sceneId, isOnline, scene, placedAssets, addSceneAsset, removeSceneAsset, refetch, setScene, dispatch, execute]);

    const handleAssetMoved = useCallback((moves: Array<{ assetId: string; oldPosition: { x: number; y: number }; newPosition: { x: number; y: number } }>) => {
        if (moves.length === 0) return;

        if (moves.length === 1) {
            const move = moves[0];
            const { assetId, oldPosition, newPosition } = move as { assetId: string; oldPosition: { x: number; y: number }; newPosition: { x: number; y: number } };

            const command = createMoveAssetCommand({
                assetId,
                oldPosition,
                newPosition,
                onMove: async (id, position) => {
                    let assetIndex: number | undefined;
                    setPlacedAssets(prev => {
                        const asset = prev.find(a => a.id === id);
                        assetIndex = asset?.index;
                        return prev.map(a => (a.id === id ? { ...a, position } : a));
                    });
                    setSelectedAssetIds([id]);

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
    }, [sceneId, isOnline, scene, placedAssets, updateSceneAsset, bulkUpdateSceneAssets, execute]);

    const handleRotationStart = useCallback(() => {
        const snapshots = new Map<string, PlacedAssetSnapshot>();
        placedAssets
            .filter(asset => selectedAssetIds.includes(asset.id))
            .forEach(asset => {
                snapshots.set(asset.id, createAssetSnapshot(asset));
            });
        setRotationInitialSnapshots(snapshots);
    }, [placedAssets, selectedAssetIds]);

    const handleAssetRotated = useCallback((updates: Array<{
        assetId: string;
        rotation: number;
        position?: { x: number; y: number };
    }>) => {
        setPlacedAssets(prev => prev.map(asset => {
            const update = updates.find(u => u.assetId === asset.id);
            if (!update) return asset;

            return {
                ...asset,
                rotation: update.rotation,
                ...(update.position ? { position: update.position } : {})
            };
        }));
    }, []);

    const handleRotationEnd = useCallback(async () => {
        if (!sceneId || !scene) return;

        const assetsToUpdate = placedAssets.filter(asset =>
            selectedAssetIds.includes(asset.id)
        );

        if (assetsToUpdate.length === 0) return;

        const afterSnapshots = new Map<string, PlacedAssetSnapshot>();
        assetsToUpdate.forEach(asset => {
            afterSnapshots.set(asset.id, createAssetSnapshot(asset));
        });

        const hasChanges = assetsToUpdate.some(asset => {
            const before = rotationInitialSnapshots.get(asset.id);
            const after = afterSnapshots.get(asset.id);
            return before && after && (
                before.rotation !== after.rotation ||
                before.position.x !== after.position.x ||
                before.position.y !== after.position.y
            );
        });

        if (!hasChanges) return;

        const command = createTransformAssetCommand({
            assetIds: assetsToUpdate.map(a => a.id),
            beforeSnapshots: rotationInitialSnapshots,
            afterSnapshots,
            onUpdate: (assetId, snapshot) => {
                setPlacedAssets(prev => prev.map(a =>
                    a.id === assetId
                        ? { ...a, ...snapshot }
                        : a
                ));
            }
        });

        execute(command);

        if (!isOnline) return;

        try {
            if (assetsToUpdate.length === 1) {
                const asset = assetsToUpdate[0];
                if (!asset) return;

                const backendRotation = toBackendRotation(asset.rotation);
                await updateSceneAsset({
                    sceneId,
                    assetNumber: asset.index,
                    rotation: backendRotation,
                    position: asset.position
                }).unwrap();
            } else {
                const bulkUpdates = assetsToUpdate.map(asset => ({
                    index: asset.index,
                    rotation: toBackendRotation(asset.rotation),
                    position: asset.position
                }));

                await bulkUpdateSceneAssets({
                    sceneId,
                    updates: bulkUpdates
                }).unwrap();
            }
        } catch (error) {
            console.error('Failed to persist rotation:', error);
        }
    }, [sceneId, scene, isOnline, placedAssets, selectedAssetIds, rotationInitialSnapshots, updateSceneAsset, bulkUpdateSceneAssets, execute]);

    const handleAssetDeleted = useCallback(() => {
        if (selectedAssetIds.length === 0) return;

        const assets = placedAssets.filter(a => selectedAssetIds.includes(a.id));
        setAssetsToDelete(assets);
        setDeleteConfirmOpen(true);
    }, [selectedAssetIds, placedAssets]);

    const confirmDelete = useCallback(async () => {
        if (assetsToDelete.length === 0) return;

        const command = createBulkRemoveAssetsCommand({
            assets: assetsToDelete,
            onBulkRemove: async (_assetIds) => {
                if (sceneId && isOnline && scene) {
                    try {
                        const indices = assetsToDelete.map(asset => asset.index);

                        await bulkDeleteSceneAssets({ sceneId, assetIndices: indices }).unwrap();

                        assetsToDelete.forEach(asset => {
                            removeEntityMapping(sceneId, 'assets', asset.id);
                        });

                        const { data: updatedScene } = await refetch();
                        if (updatedScene) {
                            setScene(updatedScene);
                            const hydratedAssets = await hydratePlacedAssets(
                                updatedScene.assets,
                                sceneId || '',
                                async (assetId: string) => {
                                    const result = await dispatch(
                                        (assetsApi as any).endpoints.getAsset.initiate(assetId)
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
                                sceneId || '',
                                async (assetId: string) => {
                                    const result = await dispatch(
                                        (assetsApi as any).endpoints.getAsset.initiate(assetId)
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
    }, [assetsToDelete, sceneId, isOnline, scene, bulkDeleteSceneAssets, bulkAddSceneAssets, refetch, execute, dispatch, setScene]);

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

                        assets.forEach(asset => {
                            removeEntityMapping(sceneId, 'assets', asset.id);
                        });

                        const { data: updatedScene } = await refetch();
                        if (updatedScene) {
                            setScene(updatedScene);
                            const hydratedAssets = await hydratePlacedAssets(
                                updatedScene.assets,
                                sceneId || '',
                                async (assetId: string) => {
                                    const result = await dispatch(
                                        (assetsApi as any).endpoints.getAsset.initiate(assetId)
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
                                sceneId || '',
                                async (assetId: string) => {
                                    const result = await dispatch(
                                        (assetsApi as any).endpoints.getAsset.initiate(assetId)
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
    }, [selectedAssetIds, sceneId, isOnline, scene, cutAssets, bulkDeleteSceneAssets, bulkAddSceneAssets, refetch, execute, dispatch, placedAssets, setScene]);

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
                    id: `scene-asset-${Date.now()}-${Math.random().toString(36).substring(2, 11)}`,
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
                                sceneId || '',
                                async (assetId: string) => {
                                    const result = await dispatch(
                                        (assetsApi as any).endpoints.getAsset.initiate(assetId)
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
                                sceneId || '',
                                async (assetId: string) => {
                                    const result = await dispatch(
                                        (assetsApi as any).endpoints.getAsset.initiate(assetId)
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
    }, [canPaste, sceneId, isOnline, scene, getClipboardAssets, clipboard.operation, clearClipboard, bulkAddSceneAssets, bulkDeleteSceneAssets, refetch, execute, dispatch, setScene]);

    const handleAssetSelected = useCallback((assetIds: string[]) => {
        setSelectedAssetIds(assetIds);
    }, []);

    const handleDragComplete = useCallback(() => {
        setDraggedAsset(null);
    }, []);

    const handleAssetRename = useCallback(async (assetId: string, newName: string) => {
        const asset = placedAssets.find(a => a.id === assetId);
        if (!asset || !sceneId || !isOnline) return;

        const command = createRenameAssetCommand({
            assetId,
            oldName: asset.name,
            newName,
            onRename: (id, name) => {
                setPlacedAssets(prev => prev.map(a => a.id === id ? { ...a, name } : a));
            }
        });

        execute(command);

        try {
            await updateSceneAsset({
                sceneId,
                assetNumber: asset.index,
                name: newName
            }).unwrap();
        } catch (error) {
            console.error('Failed to rename asset:', error);
        }
    }, [placedAssets, sceneId, isOnline, updateSceneAsset, execute]);

    const handlePlacedAssetSelect = useCallback((assetId: string) => {
        setSelectedAssetIds([assetId]);
    }, []);

    const handleAssetDisplayUpdate = useCallback(async (assetId: string, updates: { width?: number; height?: number; rotation?: number }) => {
        const asset = placedAssets.find(a => a.id === assetId);
        if (!asset || !sceneId || !isOnline) return;

        const command = createUpdateAssetDisplayCommand({
            assetId,
            oldDisplay: { width: asset.size.width, height: asset.size.height, rotation: asset.rotation },
            newDisplay: {
                width: updates.width ?? asset.size.width,
                height: updates.height ?? asset.size.height,
                rotation: updates.rotation ?? asset.rotation
            },
            onUpdate: (id, display) => {
                setPlacedAssets(prev => prev.map(a =>
                    a.id === id
                        ? {
                            ...a,
                            size: { width: display.width, height: display.height },
                            rotation: display.rotation
                        }
                        : a
                ));
            }
        });

        execute(command);

        try {
            await updateSceneAsset({
                sceneId,
                assetNumber: asset.index,
                size: { width: updates.width ?? asset.size.width, height: updates.height ?? asset.size.height },
                rotation: updates.rotation !== undefined ? toBackendRotation(updates.rotation) : undefined
            }).unwrap();
        } catch (error) {
            console.error('Failed to update asset display:', error);
        }
    }, [placedAssets, sceneId, isOnline, updateSceneAsset, execute]);

    return {
        placedAssets,
        setPlacedAssets,
        selectedAssetIds,
        setSelectedAssetIds,
        draggedAsset,
        setDraggedAsset,
        deleteConfirmOpen,
        setDeleteConfirmOpen,
        assetsToDelete,
        setAssetsToDelete,

        handleAssetPlaced,
        handleAssetMoved,
        handleRotationStart,
        handleAssetRotated,
        handleRotationEnd,
        handleAssetDeleted,
        confirmDelete,
        handleCopyAssets,
        handleCutAssets,
        handlePasteAssets,
        handleAssetSelected,
        handleDragComplete,
        handleAssetRename,
        handlePlacedAssetSelect,
        handleAssetDisplayUpdate
    };
};
