import { useState, useCallback, useEffect } from 'react';
import type { Encounter, PlacedAsset, Asset, PlacedAssetSnapshot } from '@/types/domain';
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
import { hydratePlacedAssets } from '@/utils/encounterMappers';
import {
    setEntityMapping,
    getIndexByDomId,
    removeEntityMapping
} from '@/utils/encounterEntityMapping';
import type {
    useAddEncounterAssetMutation,
    useUpdateEncounterAssetMutation,
    useBulkUpdateEncounterAssetsMutation,
    useRemoveEncounterAssetMutation,
    useBulkDeleteEncounterAssetsMutation,
    useBulkAddEncounterAssetsMutation
} from '@/services/encounterApi';
import { assetsApi } from '@/services/assetsApi';
import type { AppDispatch } from '@/store';

interface UseAssetManagementProps {
    encounterId: string | undefined;
    encounter: Encounter | null;
    isOnline: boolean;
    setEncounter: (encounter: Encounter) => void;
    execute: (command: any) => void;
    dispatch: AppDispatch;

    copyAssets: (assets: PlacedAsset[], encounterId: string) => void;
    cutAssets: (assets: PlacedAsset[], encounterId: string) => void;
    canPaste: boolean;
    getClipboardAssets: () => PlacedAsset[];
    clipboard: { operation?: 'copy' | 'cut' };
    clearClipboard: () => void;

    addEncounterAsset: ReturnType<typeof useAddEncounterAssetMutation>[0];
    updateEncounterAsset: ReturnType<typeof useUpdateEncounterAssetMutation>[0];
    bulkUpdateEncounterAssets: ReturnType<typeof useBulkUpdateEncounterAssetsMutation>[0];
    removeEncounterAsset: ReturnType<typeof useRemoveEncounterAssetMutation>[0];
    bulkDeleteEncounterAssets: ReturnType<typeof useBulkDeleteEncounterAssetsMutation>[0];
    bulkAddEncounterAssets: ReturnType<typeof useBulkAddEncounterAssetsMutation>[0];
    refetch: () => Promise<{ data?: Encounter }>;
}

export const useAssetManagement = ({
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
}: UseAssetManagementProps) => {

    const [placedAssets, setPlacedAssets] = useState<PlacedAsset[]>([]);
    const [selectedAssetIds, setSelectedAssetIds] = useState<string[]>(() => {
        const stored = localStorage.getItem('encounter-selected-assets');
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
        localStorage.setItem('encounter-selected-assets', JSON.stringify(selectedAssetIds));
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

                if (encounterId && isOnline && encounter) {
                    try {
                        await addEncounterAsset({
                            encounterId,
                            libraryAssetId: placedAsset.assetId,
                            position: placedAsset.position,
                            size: { width: placedAsset.size.width, height: placedAsset.size.height },
                            rotation: placedAsset.rotation
                        }).unwrap();

                        const { data: updatedEncounter } = await refetch();
                        if (updatedEncounter) {
                            setEncounter(updatedEncounter);

                            const oldIndices = new Set(encounter.assets.map(a => (a as any).index));
                            const newBackendAsset = updatedEncounter.assets.find(sa => {
                                const saIndex = (sa as any).index;
                                return !oldIndices.has(saIndex);
                            });

                            if (newBackendAsset) {
                                const backendIndex = (newBackendAsset as any).index;

                                setEntityMapping(encounterId, 'assets', placedAsset.id, backendIndex);
                            } else {
                                console.warn('[PlaceAssetCommand] New backend asset not found - mapping not created!');
                            }

                            const hydratedAssets = await hydratePlacedAssets(
                                updatedEncounter.assets,
                                encounterId || '',
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
                const backendIndex = getIndexByDomId(encounterId || '', 'assets', assetId);

                if (backendIndex === undefined) {
                    console.warn('[PlaceAssetCommand] No backend index found for asset:', assetId);
                    setPlacedAssets(prev => prev.filter(a => a.id !== assetId));
                    setSelectedAssetIds(prev => prev.filter(id => id !== assetId));
                    return;
                }

                setPlacedAssets(prev => prev.filter(a => a.id !== assetId));
                setSelectedAssetIds(prev => prev.filter(id => id !== assetId));

                if (encounterId && isOnline) {
                    try {
                        await removeEncounterAsset({ encounterId, assetNumber: backendIndex }).unwrap();

                        removeEntityMapping(encounterId, 'assets', assetId);

                        const { data: updatedEncounter } = await refetch();
                        if (updatedEncounter) {
                            setEncounter(updatedEncounter);
                        }
                    } catch (error) {
                        console.error('Failed to remove asset:', error);
                    }
                }
            }
        });
        execute(command);
    }, [encounterId, isOnline, encounter, placedAssets, addEncounterAsset, removeEncounterAsset, refetch, setEncounter, dispatch, execute]);

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

                    if (encounterId && isOnline && encounter && assetIndex !== undefined) {
                        try {
                            await updateEncounterAsset({
                                encounterId,
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

            if (encounterId && isOnline && encounter && bulkUpdates.length > 0) {
                (async () => {
                    try {
                        await bulkUpdateEncounterAssets({
                            encounterId,
                            updates: bulkUpdates
                        }).unwrap();
                    } catch (error) {
                        console.error('Failed to persist bulk asset movement:', error);
                    }
                })();
            }
        }
    }, [encounterId, isOnline, encounter, placedAssets, updateEncounterAsset, bulkUpdateEncounterAssets, execute]);

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
        if (!encounterId || !encounter) return;

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
                await updateEncounterAsset({
                    encounterId,
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

                await bulkUpdateEncounterAssets({
                    encounterId,
                    updates: bulkUpdates
                }).unwrap();
            }
        } catch (error) {
            console.error('Failed to persist rotation:', error);
        }
    }, [encounterId, encounter, isOnline, placedAssets, selectedAssetIds, rotationInitialSnapshots, updateEncounterAsset, bulkUpdateEncounterAssets, execute]);

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
                if (encounterId && isOnline && encounter) {
                    try {
                        const indices = assetsToDelete.map(asset => asset.index);

                        await bulkDeleteEncounterAssets({ encounterId, assetIndices: indices }).unwrap();

                        assetsToDelete.forEach(asset => {
                            removeEntityMapping(encounterId, 'assets', asset.id);
                        });

                        const { data: updatedEncounter } = await refetch();
                        if (updatedEncounter) {
                            setEncounter(updatedEncounter);
                            const hydratedAssets = await hydratePlacedAssets(
                                updatedEncounter.assets,
                                encounterId || '',
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
                if (encounterId && isOnline && encounter) {
                    try {
                        await bulkAddEncounterAssets({
                            encounterId,
                            assets: assets.map(asset => ({
                                assetId: asset.assetId,
                                position: asset.position,
                                size: { width: asset.size.width, height: asset.size.height },
                                rotation: asset.rotation
                            }))
                        }).unwrap();

                        const { data: updatedEncounter } = await refetch();
                        if (updatedEncounter) {
                            setEncounter(updatedEncounter);
                            const hydratedAssets = await hydratePlacedAssets(
                                updatedEncounter.assets,
                                encounterId || '',
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
    }, [assetsToDelete, encounterId, isOnline, encounter, bulkDeleteEncounterAssets, bulkAddEncounterAssets, refetch, execute, dispatch, setEncounter]);

    const handleCopyAssets = useCallback(() => {
        if (selectedAssetIds.length === 0 || !encounterId) return;

        const assets = placedAssets.filter(a => selectedAssetIds.includes(a.id));

        const command = createCopyAssetsCommand({
            assets,
            onCopy: (copiedAssets) => {
                copyAssets(copiedAssets, encounterId);
            }
        });

        execute(command);
    }, [selectedAssetIds, encounterId, copyAssets, execute, placedAssets]);

    const handleCutAssets = useCallback(() => {
        if (selectedAssetIds.length === 0 || !encounterId || !isOnline) return;

        const assetsToDelete = placedAssets.filter(a => selectedAssetIds.includes(a.id));

        const command = createCutAssetsCommand({
            assets: assetsToDelete,
            onCut: async (assets) => {
                cutAssets(assets, encounterId);

                if (encounterId && isOnline && encounter) {
                    try {
                        const indices = assets.map(asset => asset.index);
                        await bulkDeleteEncounterAssets({ encounterId, assetIndices: indices }).unwrap();

                        assets.forEach(asset => {
                            removeEntityMapping(encounterId, 'assets', asset.id);
                        });

                        const { data: updatedEncounter } = await refetch();
                        if (updatedEncounter) {
                            setEncounter(updatedEncounter);
                            const hydratedAssets = await hydratePlacedAssets(
                                updatedEncounter.assets,
                                encounterId || '',
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
                if (encounterId && isOnline && encounter) {
                    try {
                        await bulkAddEncounterAssets({
                            encounterId,
                            assets: restoredAssets.map(asset => ({
                                assetId: asset.assetId,
                                position: asset.position,
                                size: { width: asset.size.width, height: asset.size.height },
                                rotation: asset.rotation
                            }))
                        }).unwrap();

                        const { data: updatedEncounter } = await refetch();
                        if (updatedEncounter) {
                            setEncounter(updatedEncounter);
                            const hydratedAssets = await hydratePlacedAssets(
                                updatedEncounter.assets,
                                encounterId || '',
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
    }, [selectedAssetIds, encounterId, isOnline, encounter, cutAssets, bulkDeleteEncounterAssets, bulkAddEncounterAssets, refetch, execute, dispatch, placedAssets, setEncounter]);

    const handlePasteAssets = useCallback(() => {
        if (!canPaste || !encounterId || !isOnline || !encounter) return;

        const clipboardAssets = getClipboardAssets();
        if (clipboardAssets.length === 0) return;

        const command = createPasteAssetsCommand({
            clipboardAssets,
            onPaste: async (assets) => {
                const PASTE_OFFSET = 20;

                const newPlacedAssets: PlacedAsset[] = assets.map(asset => ({
                    ...asset,
                    id: `encounter-asset-${Date.now()}-${Math.random().toString(36).substring(2, 11)}`,
                    position: {
                        x: asset.position.x + PASTE_OFFSET,
                        y: asset.position.y + PASTE_OFFSET
                    }
                }));

                if (encounterId && isOnline && encounter) {
                    try {
                        await bulkAddEncounterAssets({
                            encounterId,
                            assets: newPlacedAssets.map(pa => ({
                                assetId: pa.assetId,
                                position: pa.position,
                                size: { width: pa.size.width, height: pa.size.height },
                                rotation: pa.rotation
                            }))
                        }).unwrap();

                        const { data: updatedEncounter } = await refetch();
                        if (updatedEncounter) {
                            setEncounter(updatedEncounter);
                            const hydratedAssets = await hydratePlacedAssets(
                                updatedEncounter.assets,
                                encounterId || '',
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
                if (encounterId && isOnline && encounter) {
                    try {
                        let indicesToDelete: number[] = [];
                        setPlacedAssets(prev => {
                            const assetsToDelete = prev.filter(a => assetIds.includes(a.id));
                            indicesToDelete = assetsToDelete.map(a => a.index);
                            return prev.filter(a => !assetIds.includes(a.id));
                        });

                        await bulkDeleteEncounterAssets({ encounterId, assetIndices: indicesToDelete }).unwrap();

                        const { data: updatedEncounter } = await refetch();
                        if (updatedEncounter) {
                            setEncounter(updatedEncounter);
                            const hydratedAssets = await hydratePlacedAssets(
                                updatedEncounter.assets,
                                encounterId || '',
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
    }, [canPaste, encounterId, isOnline, encounter, getClipboardAssets, clipboard.operation, clearClipboard, bulkAddEncounterAssets, bulkDeleteEncounterAssets, refetch, execute, dispatch, setEncounter]);

    const handleAssetSelected = useCallback((assetIds: string[]) => {
        setSelectedAssetIds(assetIds);
    }, []);

    const handleDragComplete = useCallback(() => {
        setDraggedAsset(null);
    }, []);

    const handleAssetRename = useCallback(async (assetId: string, newName: string) => {
        const asset = placedAssets.find(a => a.id === assetId);
        if (!asset || !encounterId || !isOnline) return;

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
            await updateEncounterAsset({
                encounterId,
                assetNumber: asset.index,
                name: newName
            }).unwrap();
        } catch (error) {
            console.error('Failed to rename asset:', error);
        }
    }, [placedAssets, encounterId, isOnline, updateEncounterAsset, execute]);

    const handlePlacedAssetSelect = useCallback((assetId: string) => {
        setSelectedAssetIds([assetId]);
    }, []);

    const handleAssetDisplayUpdate = useCallback(async (assetId: string, updates: { width?: number; height?: number; rotation?: number }) => {
        const asset = placedAssets.find(a => a.id === assetId);
        if (!asset || !encounterId || !isOnline) return;

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
            await updateEncounterAsset({
                encounterId,
                assetNumber: asset.index,
                size: { width: updates.width ?? asset.size.width, height: updates.height ?? asset.size.height },
                rotation: updates.rotation !== undefined ? toBackendRotation(updates.rotation) : undefined
            }).unwrap();
        } catch (error) {
            console.error('Failed to update asset display:', error);
        }
    }, [placedAssets, encounterId, isOnline, updateEncounterAsset, execute]);

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
