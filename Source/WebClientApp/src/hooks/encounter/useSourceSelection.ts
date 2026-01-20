import { useCallback, useEffect, useState } from 'react';
import type { LightPlacementProperties, SoundPlacementProperties } from '@components/encounter/panels';
import type {
    EncounterLightSource,
    PlacedLightSource,
    PlacedSoundSource,
} from '@/types/domain';
import type { CreateSoundRequest, ResourceMetadata, StageSound } from '@/types/stage';
import {
    DeleteLightSourceCommand,
    DeleteSoundSourceCommand,
    UpdateLightSourceCommand,
    UpdateSoundSourceCommand,
} from '@/utils/commands/sourceCommands';

/** Payload for sound source updates (accepts mediaId instead of full media object) */
export interface SoundSourceUpdatePayload {
    name?: string;
    position?: { x: number; y: number };
    radius?: number;
    isPlaying?: boolean;
    loop?: boolean;
    mediaId?: string | null;
}

export interface UseSourceSelectionProps {
    /** Current encounter ID */
    encounterId: string | undefined;
    /** Placed light sources on the stage */
    placedLightSources: PlacedLightSource[];
    /** Placed sound sources on the stage */
    placedSoundSources: PlacedSoundSource[];
    /** Selected light source index (from session state) */
    selectedLightSourceIndex: number | null;
    /** Selected sound source index (from session state) */
    selectedSoundSourceIndex: number | null;
    /** Set selected light source index */
    setSelectedLightSourceIndex: (index: number | null) => void;
    /** Set selected sound source index */
    setSelectedSoundSourceIndex: (index: number | null) => void;
    /** Execute command for undo/redo */
    execute: (command: unknown) => Promise<void>;
    /** Refetch encounter data */
    refetch: () => void;
    /** Add light mutation */
    addLight: (params: { stageId: string; data: unknown }) => {
        unwrap: () => Promise<{ index: number }>;
    };
    /** Delete light mutation */
    deleteLight: (params: { stageId: string; index: number }) => {
        unwrap: () => Promise<void>;
    };
    /** Update light mutation */
    updateLight: (params: { stageId: string; index: number; data: unknown }) => {
        unwrap: () => Promise<void>;
    };
    /** Add sound mutation */
    addSound: (params: { stageId: string; data: CreateSoundRequest }) => {
        unwrap: () => Promise<{ index: number }>;
    };
    /** Delete sound mutation */
    deleteSound: (params: { stageId: string; index: number }) => {
        unwrap: () => Promise<void>;
    };
    /** Update sound mutation */
    updateSound: (params: { stageId: string; index: number; data: unknown }) => {
        unwrap: () => Promise<void>;
    };
}

export interface UseSourceSelectionReturn {
    // Context menu state
    lightContextMenuPosition: { left: number; top: number } | null;
    soundContextMenuPosition: { left: number; top: number } | null;

    // Placement state
    sourcePlacementProperties: (LightPlacementProperties | SoundPlacementProperties) & { sourceType: 'light' | 'sound' } | null;
    activeTool: string | null;

    // Selection handlers
    handleLightSourceSelect: (index: number) => void;
    handleSoundSourceSelect: (index: number) => void;

    // Delete handlers
    handleLightSourceDelete: (index: number) => Promise<void>;
    handleSoundSourceDelete: (index: number) => Promise<void>;

    // Placement handlers
    handlePlaceLight: (properties: LightPlacementProperties) => void;
    handlePlaceSound: (properties: SoundPlacementProperties) => void;
    handleSourcePlacementFinish: (success: boolean) => void;

    // Context menu handlers
    handleLightSourceContextMenu: (sourceIndex: number, position: { x: number; y: number }) => void;
    handleSoundSourceContextMenu: (sourceIndex: number, position: { x: number; y: number }) => void;
    handleLightContextMenuClose: () => void;
    handleSoundContextMenuClose: () => void;

    // Update handlers
    handleLightSourceUpdate: (sourceIndex: number, updates: Partial<EncounterLightSource>) => Promise<void>;
    handleLightSourcePositionChange: (sourceIndex: number, position: { x: number; y: number }) => void;
    handleLightSourceDirectionChange: (sourceIndex: number, direction: number) => void;
    handleSoundSourceUpdate: (sourceIndex: number, updates: SoundSourceUpdatePayload) => Promise<void>;
    handleSoundSourcePositionChange: (sourceIndex: number, position: { x: number; y: number }) => void;
}

/**
 * Convert StageSound data to CreateSoundRequest for the Stage API.
 */
function toCreateSoundRequest(source: Omit<StageSound, 'index'>): CreateSoundRequest {
    return {
        mediaId: source.media?.id ?? '',
        position: source.position,
        radius: source.radius,
        volume: source.volume ?? 1,
        isPlaying: source.isPlaying,
        ...(source.name !== undefined && { name: source.name }),
        ...(source.loop !== undefined && { loop: source.loop }),
    };
}

/**
 * Hook to manage light and sound source selection, placement, and updates.
 */
export function useSourceSelection({
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
}: UseSourceSelectionProps): UseSourceSelectionReturn {
    // Context menu state
    const [lightContextMenuPosition, setLightContextMenuPosition] = useState<{ left: number; top: number } | null>(null);
    const [soundContextMenuPosition, setSoundContextMenuPosition] = useState<{ left: number; top: number } | null>(null);

    // Placement state
    const [sourcePlacementProperties, setSourcePlacementProperties] = useState<
        (LightPlacementProperties | SoundPlacementProperties) & { sourceType: 'light' | 'sound' } | null
    >(null);
    const [activeTool, setActiveTool] = useState<string | null>(null);

    // Selection handlers
    const handleLightSourceSelect = useCallback((index: number) => {
        setSelectedLightSourceIndex(index);
        setSelectedSoundSourceIndex(null);
    }, [setSelectedLightSourceIndex, setSelectedSoundSourceIndex]);

    const handleSoundSourceSelect = useCallback((index: number) => {
        setSelectedSoundSourceIndex(index);
        setSelectedLightSourceIndex(null);
    }, [setSelectedSoundSourceIndex, setSelectedLightSourceIndex]);

    // Delete handlers
    const handleLightSourceDelete = useCallback(
        async (index: number) => {
            if (!encounterId) return;
            const source = placedLightSources.find((s) => s.index === index);
            if (!source) return;

            const command = new DeleteLightSourceCommand({
                encounterId,
                sourceIndex: index,
                source,
                onAdd: async (eid, sourceData) => {
                    const result = await addLight({ stageId: eid, data: sourceData }).unwrap();
                    // Construct full light source from input and result
                    return {
                        ...sourceData,
                        index: result.index,
                    };
                },
                onRemove: async (eid, sourceIndex) => {
                    await deleteLight({ stageId: eid, index: sourceIndex }).unwrap();
                },
                onRefetch: async () => {
                    refetch();
                },
            });

            await execute(command);
            if (selectedLightSourceIndex === index) {
                setSelectedLightSourceIndex(null);
            }
        },
        [encounterId, placedLightSources, execute, addLight, deleteLight, selectedLightSourceIndex, setSelectedLightSourceIndex, refetch],
    );

    const handleSoundSourceDelete = useCallback(
        async (index: number) => {
            if (!encounterId) return;
            const source = placedSoundSources.find((s) => s.index === index);
            if (!source) return;

            const command = new DeleteSoundSourceCommand({
                encounterId,
                sourceIndex: index,
                source,
                onAdd: async (eid, sourceData) => {
                    const request = toCreateSoundRequest(sourceData);
                    const result = await addSound({ stageId: eid, data: request }).unwrap();
                    // Construct full sound source from input and result
                    return {
                        ...sourceData,
                        index: result.index,
                    };
                },
                onRemove: async (eid, sourceIndex) => {
                    await deleteSound({ stageId: eid, index: sourceIndex }).unwrap();
                },
                onRefetch: async () => {
                    refetch();
                },
            });

            await execute(command);
            if (selectedSoundSourceIndex === index) {
                setSelectedSoundSourceIndex(null);
            }
        },
        [encounterId, placedSoundSources, execute, addSound, deleteSound, selectedSoundSourceIndex, setSelectedSoundSourceIndex, refetch],
    );

    // Keyboard delete handler
    useEffect(() => {
        const handleDeleteKey = (e: KeyboardEvent) => {
            if (e.target instanceof HTMLInputElement || e.target instanceof HTMLTextAreaElement) {
                return;
            }
            if (e.key === 'Delete') {
                if (selectedLightSourceIndex !== null) {
                    e.preventDefault();
                    handleLightSourceDelete(selectedLightSourceIndex);
                    return;
                }
                if (selectedSoundSourceIndex !== null) {
                    e.preventDefault();
                    handleSoundSourceDelete(selectedSoundSourceIndex);
                    return;
                }
            }
        };

        window.addEventListener('keydown', handleDeleteKey);
        return () => window.removeEventListener('keydown', handleDeleteKey);
    }, [selectedLightSourceIndex, selectedSoundSourceIndex, handleLightSourceDelete, handleSoundSourceDelete]);

    // Placement handlers
    const handlePlaceLight = useCallback((properties: LightPlacementProperties) => {
        setSelectedLightSourceIndex(null);
        setSelectedSoundSourceIndex(null);
        setSourcePlacementProperties({ ...properties, sourceType: 'light' });
        setActiveTool('sourceDrawing');
    }, [setSelectedLightSourceIndex, setSelectedSoundSourceIndex]);

    const handlePlaceSound = useCallback((properties: SoundPlacementProperties) => {
        setSelectedLightSourceIndex(null);
        setSelectedSoundSourceIndex(null);
        setSourcePlacementProperties({ ...properties, sourceType: 'sound' });
        setActiveTool('sourceDrawing');
    }, [setSelectedLightSourceIndex, setSelectedSoundSourceIndex]);

    const handleSourcePlacementFinish = useCallback((success: boolean) => {
        if (success) {
            setSourcePlacementProperties(null);
            setActiveTool(null);
        }
    }, []);

    // Context menu handlers
    const handleLightSourceContextMenu = useCallback((sourceIndex: number, position: { x: number; y: number }) => {
        setSelectedLightSourceIndex(sourceIndex);
        setSelectedSoundSourceIndex(null);
        setLightContextMenuPosition({ left: position.x, top: position.y });
    }, [setSelectedLightSourceIndex, setSelectedSoundSourceIndex]);

    const handleSoundSourceContextMenu = useCallback((sourceIndex: number, position: { x: number; y: number }) => {
        setSelectedSoundSourceIndex(sourceIndex);
        setSelectedLightSourceIndex(null);
        setSoundContextMenuPosition({ left: position.x, top: position.y });
    }, [setSelectedSoundSourceIndex, setSelectedLightSourceIndex]);

    const handleLightContextMenuClose = useCallback(() => {
        setLightContextMenuPosition(null);
    }, []);

    const handleSoundContextMenuClose = useCallback(() => {
        setSoundContextMenuPosition(null);
    }, []);

    // Update handlers
    const handleLightSourceUpdate = useCallback(
        async (sourceIndex: number, updates: Partial<EncounterLightSource>) => {
            if (!encounterId) return;
            const oldSource = placedLightSources.find((s) => s.index === sourceIndex);
            if (!oldSource) return;

            const newSource = { ...oldSource, ...updates };

            const command = new UpdateLightSourceCommand({
                encounterId,
                sourceIndex,
                oldSource,
                newSource,
                onUpdate: async (eid, idx, upd) => {
                    await updateLight({ stageId: eid, index: idx, data: upd }).unwrap();
                },
                onRefetch: async () => {
                    refetch();
                },
            });

            await execute(command);
        },
        [encounterId, placedLightSources, execute, updateLight, refetch],
    );

    const handleLightSourcePositionChange = useCallback(
        (sourceIndex: number, position: { x: number; y: number }) => {
            handleLightSourceUpdate(sourceIndex, { position });
        },
        [handleLightSourceUpdate],
    );

    const handleLightSourceDirectionChange = useCallback(
        (sourceIndex: number, direction: number) => {
            handleLightSourceUpdate(sourceIndex, { direction });
        },
        [handleLightSourceUpdate],
    );

    const handleSoundSourceUpdate = useCallback(
        async (sourceIndex: number, updates: SoundSourceUpdatePayload) => {
            if (!encounterId) return;
            const oldSource = placedSoundSources.find((s) => s.index === sourceIndex);
            if (!oldSource) return;

            const { mediaId, ...restUpdates } = updates;
            const mediaUpdate = mediaId !== undefined
                ? { media: mediaId === null ? null! : { id: mediaId } as ResourceMetadata }
                : {};

            const newSource = { ...oldSource, ...restUpdates, ...mediaUpdate };

            const command = new UpdateSoundSourceCommand({
                encounterId,
                sourceIndex,
                oldSource,
                newSource,
                onUpdate: async (eid, idx, upd) => {
                    const updatePayload: {
                        encounterId: string;
                        sourceIndex: number;
                        name?: string;
                        position?: { x: number; y: number };
                        radius?: number;
                        isPlaying?: boolean;
                        loop?: boolean;
                        mediaId?: string;
                    } = {
                        encounterId: eid,
                        sourceIndex: idx,
                        ...(upd.name !== undefined && { name: upd.name }),
                        ...(upd.position !== undefined && { position: upd.position }),
                        ...(upd.radius !== undefined && { radius: upd.radius }),
                        ...(upd.isPlaying !== undefined && { isPlaying: upd.isPlaying }),
                        ...(upd.loop !== undefined && { loop: upd.loop }),
                    };

                    if (upd.media !== undefined) {
                        updatePayload.mediaId = upd.media?.id ?? '';
                    }

                    await updateSound({ stageId: eid, index: idx, data: updatePayload }).unwrap();
                },
                onRefetch: async () => {
                    refetch();
                },
            });

            await execute(command);
        },
        [encounterId, placedSoundSources, execute, updateSound, refetch],
    );

    const handleSoundSourcePositionChange = useCallback(
        (sourceIndex: number, position: { x: number; y: number }) => {
            handleSoundSourceUpdate(sourceIndex, { position });
        },
        [handleSoundSourceUpdate],
    );

    return {
        // Context menu state
        lightContextMenuPosition,
        soundContextMenuPosition,

        // Placement state
        sourcePlacementProperties,
        activeTool,

        // Selection handlers
        handleLightSourceSelect,
        handleSoundSourceSelect,

        // Delete handlers
        handleLightSourceDelete,
        handleSoundSourceDelete,

        // Placement handlers
        handlePlaceLight,
        handlePlaceSound,
        handleSourcePlacementFinish,

        // Context menu handlers
        handleLightSourceContextMenu,
        handleSoundSourceContextMenu,
        handleLightContextMenuClose,
        handleSoundContextMenuClose,

        // Update handlers
        handleLightSourceUpdate,
        handleLightSourcePositionChange,
        handleLightSourceDirectionChange,
        handleSoundSourceUpdate,
        handleSoundSourcePositionChange,
    };
}
