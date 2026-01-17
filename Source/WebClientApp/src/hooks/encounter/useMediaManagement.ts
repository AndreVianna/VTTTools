import { useCallback, useState } from 'react';
import type { MediaResource } from '@/types/domain';
import { AmbientSoundSource } from '@/types/stage';

export interface UseMediaManagementProps {
    /** Current encounter ID */
    encounterId: string;
    /** RTK Query uploadFile mutation */
    uploadFile: (params: { file: File; role: string; ownerId: string }) => { unwrap: () => Promise<{ id: string }> };
    /** Update stage settings function */
    updateStageSettings: (settings: Record<string, unknown>) => Promise<void>;
    /** Refetch encounter data */
    refetch: () => Promise<void>;
    /** Whether media hub is connected */
    isMediaHubConnected: boolean;
    /** Subscribe to resource updates */
    subscribeToResource: (resourceId: string) => Promise<void>;
}

export interface UseMediaManagementReturn {
    // Upload state
    isUploadingBackground: boolean;
    isUploadingAlternateBackground: boolean;
    isUploadingAmbientSound: boolean;

    // Background handlers
    handleBackgroundUpload: (file: File) => Promise<void>;
    handleBackgroundRemove: () => Promise<void>;
    handleBackgroundSelect: (resource: MediaResource) => Promise<void>;

    // Alternate background handlers
    handleAlternateBackgroundUpload: (file: File) => Promise<void>;
    handleAlternateBackgroundRemove: () => Promise<void>;
    handleAlternateBackgroundSelect: (resource: MediaResource) => Promise<void>;
    handleUseAlternateBackgroundChange: (enabled: boolean) => Promise<void>;

    // Ambient sound handlers
    handleAmbientSoundUpload: (file: File) => Promise<void>;
    handleAmbientSoundRemove: () => Promise<void>;
    handleAmbientSoundSelect: (resource: MediaResource) => Promise<void>;
    handleAmbientSoundSourceChange: (source: AmbientSoundSource) => Promise<void>;
}

/**
 * Hook to manage media uploads and selections (backgrounds, ambient sounds).
 * Extracted from EncounterEditorPage for better organization.
 */
export function useMediaManagement({
    encounterId,
    uploadFile,
    updateStageSettings,
    refetch,
    isMediaHubConnected,
    subscribeToResource,
}: UseMediaManagementProps): UseMediaManagementReturn {
    // Upload state
    const [isUploadingBackground, setIsUploadingBackground] = useState(false);
    const [isUploadingAlternateBackground, setIsUploadingAlternateBackground] = useState(false);
    const [isUploadingAmbientSound, setIsUploadingAmbientSound] = useState(false);

    // Background handlers
    const handleBackgroundUpload = useCallback(
        async (file: File) => {
            if (!encounterId) return;

            setIsUploadingBackground(true);
            try {
                const result = await uploadFile({
                    file,
                    role: 'Background',
                    ownerId: encounterId,
                }).unwrap();

                await updateStageSettings({ mainBackgroundId: result.id });

                if (isMediaHubConnected) {
                    await subscribeToResource(result.id);
                }

                await refetch();
            } catch (error: unknown) {
                console.error('Failed to upload background:', error);
            } finally {
                setIsUploadingBackground(false);
            }
        },
        [encounterId, uploadFile, updateStageSettings, refetch, isMediaHubConnected, subscribeToResource],
    );

    const handleBackgroundRemove = useCallback(async () => {
        if (!encounterId) return;
        try {
            await updateStageSettings({ mainBackgroundId: null });
            await refetch();
        } catch (error: unknown) {
            console.error('Failed to remove background:', error);
        }
    }, [encounterId, updateStageSettings, refetch]);

    const handleBackgroundSelect = useCallback(
        async (resource: MediaResource) => {
            if (!encounterId) return;
            try {
                await updateStageSettings({ mainBackgroundId: resource.id });

                if (isMediaHubConnected) {
                    await subscribeToResource(resource.id);
                }

                await refetch();
            } catch (error: unknown) {
                console.error('Failed to select background:', error);
            }
        },
        [encounterId, updateStageSettings, refetch, isMediaHubConnected, subscribeToResource],
    );

    // Alternate background handlers
    const handleUseAlternateBackgroundChange = useCallback(async (enabled: boolean) => {
        if (!encounterId) return;
        try {
            await updateStageSettings({ useAlternateBackground: enabled });
            await refetch();
        } catch (error: unknown) {
            console.error('Failed to update alternate background setting:', error);
        }
    }, [encounterId, updateStageSettings, refetch]);

    const handleAlternateBackgroundUpload = useCallback(
        async (file: File) => {
            if (!encounterId) return;

            setIsUploadingAlternateBackground(true);
            try {
                const result = await uploadFile({
                    file,
                    role: 'Background',
                    ownerId: encounterId,
                }).unwrap();

                await updateStageSettings({ alternateBackgroundId: result.id });

                if (isMediaHubConnected) {
                    await subscribeToResource(result.id);
                }

                await refetch();
            } catch (error: unknown) {
                console.error('Failed to upload alternate background:', error);
            } finally {
                setIsUploadingAlternateBackground(false);
            }
        },
        [encounterId, uploadFile, updateStageSettings, refetch, isMediaHubConnected, subscribeToResource],
    );

    const handleAlternateBackgroundRemove = useCallback(async () => {
        if (!encounterId) return;
        try {
            await updateStageSettings({ alternateBackgroundId: null });
            await refetch();
        } catch (error: unknown) {
            console.error('Failed to remove alternate background:', error);
        }
    }, [encounterId, updateStageSettings, refetch]);

    const handleAlternateBackgroundSelect = useCallback(
        async (resource: MediaResource) => {
            if (!encounterId) return;
            try {
                await updateStageSettings({ alternateBackgroundId: resource.id });

                if (isMediaHubConnected) {
                    await subscribeToResource(resource.id);
                }

                await refetch();
            } catch (error: unknown) {
                console.error('Failed to select alternate background:', error);
            }
        },
        [encounterId, updateStageSettings, refetch, isMediaHubConnected, subscribeToResource],
    );

    // Ambient sound handlers
    const handleAmbientSoundSourceChange = useCallback(async (source: AmbientSoundSource) => {
        if (!encounterId) return;
        try {
            await updateStageSettings({ ambientSoundSource: source });
            await refetch();
        } catch (error: unknown) {
            console.error('Failed to update ambient sound source:', error);
        }
    }, [encounterId, updateStageSettings, refetch]);

    const handleAmbientSoundUpload = useCallback(
        async (file: File) => {
            if (!encounterId) return;

            setIsUploadingAmbientSound(true);
            try {
                const result = await uploadFile({
                    file,
                    role: 'AmbientSound',
                    ownerId: encounterId,
                }).unwrap();

                await updateStageSettings({
                    ambientSoundId: result.id,
                    ambientSoundSource: AmbientSoundSource.FromResource,
                });

                if (isMediaHubConnected) {
                    await subscribeToResource(result.id);
                }

                await refetch();
            } catch (error: unknown) {
                console.error('Failed to upload ambient sound:', error);
            } finally {
                setIsUploadingAmbientSound(false);
            }
        },
        [encounterId, uploadFile, updateStageSettings, refetch, isMediaHubConnected, subscribeToResource],
    );

    const handleAmbientSoundRemove = useCallback(async () => {
        if (!encounterId) return;
        try {
            await updateStageSettings({
                ambientSoundId: null,
                ambientSoundSource: AmbientSoundSource.NotSet,
            });
            await refetch();
        } catch (error: unknown) {
            console.error('Failed to remove ambient sound:', error);
        }
    }, [encounterId, updateStageSettings, refetch]);

    const handleAmbientSoundSelect = useCallback(
        async (resource: MediaResource) => {
            if (!encounterId) return;
            try {
                await updateStageSettings({
                    ambientSoundId: resource.id,
                    ambientSoundSource: AmbientSoundSource.FromResource,
                });

                if (isMediaHubConnected) {
                    await subscribeToResource(resource.id);
                }

                await refetch();
            } catch (error: unknown) {
                console.error('Failed to select ambient sound:', error);
            }
        },
        [encounterId, updateStageSettings, refetch, isMediaHubConnected, subscribeToResource],
    );

    return {
        // Upload state
        isUploadingBackground,
        isUploadingAlternateBackground,
        isUploadingAmbientSound,

        // Background handlers
        handleBackgroundUpload,
        handleBackgroundRemove,
        handleBackgroundSelect,

        // Alternate background handlers
        handleAlternateBackgroundUpload,
        handleAlternateBackgroundRemove,
        handleAlternateBackgroundSelect,
        handleUseAlternateBackgroundChange,

        // Ambient sound handlers
        handleAmbientSoundUpload,
        handleAmbientSoundRemove,
        handleAmbientSoundSelect,
        handleAmbientSoundSourceChange,
    };
}
