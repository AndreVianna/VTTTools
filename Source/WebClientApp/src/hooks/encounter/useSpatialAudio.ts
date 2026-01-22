import { useCallback, useEffect, useRef, useState } from 'react';
import { getApiEndpoints } from '@/config/development';
import type { EncounterWall, PlacedSoundSource, Point } from '@/types/domain';
import type { GridConfig } from '@/utils/gridCalculator';
import { calculateEffectiveVolume } from '@/utils/soundPropagation';

/**
 * Audio source state for tracking playing audio elements.
 */
interface AudioSourceState {
    /** The HTML Audio element */
    audio: HTMLAudioElement;
    /** MediaElementAudioSourceNode connected to AudioContext */
    source: MediaElementAudioSourceNode;
    /** GainNode for volume control */
    gainNode: GainNode;
    /** The sound source data */
    soundSource: PlacedSoundSource;
    /** Whether this source has been started */
    started: boolean;
}

/**
 * Configuration for the useSpatialAudio hook.
 */
export interface UseSpatialAudioConfig {
    /** Sound sources from the stage (StageSound[]) */
    soundSources: PlacedSoundSource[];
    /** Walls for sound blocking calculation */
    walls: EncounterWall[];
    /** Position of the listener (active character center) */
    listenerPosition: Point | null;
    /** Grid configuration for distance calculations */
    gridConfig: GridConfig;
    /** AudioContext from useAudioUnlock */
    audioContext: AudioContext | null;
    /** Whether audio has been unlocked by user interaction */
    isAudioUnlocked: boolean;
}

/**
 * Result of the useSpatialAudio hook.
 */
export interface UseSpatialAudioResult {
    /** Whether the spatial audio system is ready */
    isReady: boolean;
    /** Number of currently playing sound sources */
    activeSources: number;
}

/**
 * Fetch an authenticated resource and return a blob URL.
 * Uses the resource ID (not path) to construct the API URL.
 */
async function fetchAuthenticatedAudioUrl(resourceId: string): Promise<string | null> {
    try {
        // Use getApiEndpoints().media to match useBackgroundMedia pattern
        const fullUrl = `${getApiEndpoints().media}/${resourceId}`;

        const response = await fetch(fullUrl, {
            credentials: 'include',
            headers: {
                'X-Requested-With': 'XMLHttpRequest',
            },
        });

        if (!response.ok) {
            console.error(`Failed to fetch audio resource: ${response.status}`);
            return null;
        }

        const blob = await response.blob();
        return URL.createObjectURL(blob);
    } catch (error) {
        console.error('Failed to fetch audio resource:', error);
        return null;
    }
}

/**
 * Hook to manage spatial audio for sound sources in play mode.
 *
 * This hook:
 * 1. Creates audio elements for each playing sound source
 * 2. Routes them through Web Audio API nodes for volume control
 * 3. Calculates volume based on distance from listener to source
 * 4. Updates volumes when listener position changes
 * 5. Handles wall blocking using the soundPropagation utility
 *
 * Audio Graph per Sound Source:
 * HTMLAudioElement -> MediaElementAudioSourceNode -> GainNode -> AudioContext.destination
 *
 * @param config - Configuration for spatial audio
 * @returns Spatial audio state
 */
export function useSpatialAudio({
    soundSources,
    walls,
    listenerPosition,
    gridConfig,
    audioContext,
    isAudioUnlocked,
}: UseSpatialAudioConfig): UseSpatialAudioResult {
    // ═══════════════════════════════════════════════════════════════════════════
    // STATE
    // ═══════════════════════════════════════════════════════════════════════════
    const [activeSources, setActiveSources] = useState(0);
    const [isReady, setIsReady] = useState(false);

    // ═══════════════════════════════════════════════════════════════════════════
    // REFS
    // ═══════════════════════════════════════════════════════════════════════════
    /** Map of sound source index to audio state */
    const audioStatesRef = useRef<Map<number, AudioSourceState>>(new Map());
    /** Map of sound source index to blob URLs (for cleanup) */
    const blobUrlsRef = useRef<Map<number, string>>(new Map());
    /** Track current listener position for volume updates */
    const listenerPositionRef = useRef<Point | null>(null);

    // ═══════════════════════════════════════════════════════════════════════════
    // HANDLERS
    // ═══════════════════════════════════════════════════════════════════════════
    /**
     * Calculate and set volume for a specific audio source.
     */
    const updateSourceVolume = useCallback(
        (state: AudioSourceState, position: Point | null) => {
            if (!position) {
                // No listener - mute all sounds
                state.gainNode.gain.value = 0;
                return;
            }

            const volume = calculateEffectiveVolume(
                state.soundSource.position,
                position,
                state.soundSource.volume,
                state.soundSource.radius,
                { walls, gridConfig }
            );

            // Use smooth transition to avoid clicking
            state.gainNode.gain.setTargetAtTime(volume, state.gainNode.context.currentTime, 0.05);
        },
        [walls, gridConfig]
    );

    /**
     * Update volumes for all audio sources based on listener position.
     */
    const updateAllVolumes = useCallback(
        (position: Point | null) => {
            audioStatesRef.current.forEach((state) => {
                updateSourceVolume(state, position);
            });
        },
        [updateSourceVolume]
    );

    /**
     * Create audio infrastructure for a sound source.
     */
    const createAudioSource = useCallback(
        async (soundSource: PlacedSoundSource): Promise<AudioSourceState | null> => {
            if (!audioContext) {
                return null;
            }

            // Safety check - should not reach here due to effect filter
            if (!soundSource.media?.id) {
                return null;
            }

            try {
                // Fetch authenticated audio URL using media.id (not path)
                const blobUrl = await fetchAuthenticatedAudioUrl(soundSource.media.id);
                if (!blobUrl) {
                    return null;
                }

                // Store blob URL for cleanup
                blobUrlsRef.current.set(soundSource.index, blobUrl);

                // Create audio element
                const audio = new Audio(blobUrl);
                audio.crossOrigin = 'anonymous';
                audio.loop = soundSource.loop;
                audio.preload = 'auto';

                // Create Web Audio API nodes
                const source = audioContext.createMediaElementSource(audio);
                const gainNode = audioContext.createGain();

                // Initial volume (will be updated based on listener position)
                gainNode.gain.value = 0;

                // Connect nodes: source -> gain -> destination
                source.connect(gainNode);
                gainNode.connect(audioContext.destination);

                return {
                    audio,
                    source,
                    gainNode,
                    soundSource,
                    started: false,
                };
            } catch (error) {
                console.error('Failed to create audio source:', error);
                return null;
            }
        },
        [audioContext]
    );

    /**
     * Start playback for an audio source.
     */
    const startAudioSource = useCallback(async (state: AudioSourceState) => {
        if (state.started) return;

        try {
            await state.audio.play();
            state.started = true;
        } catch (error) {
            // Autoplay blocked - will retry on next user interaction
            console.warn('Audio playback blocked, will retry:', error);
        }
    }, []);

    /**
     * Stop and cleanup an audio source.
     */
    const cleanupAudioSource = useCallback((state: AudioSourceState) => {
        try {
            state.audio.pause();
            state.audio.currentTime = 0;
            state.gainNode.disconnect();
            state.source.disconnect();

            // Revoke blob URL
            const blobUrl = blobUrlsRef.current.get(state.soundSource.index);
            if (blobUrl) {
                URL.revokeObjectURL(blobUrl);
                blobUrlsRef.current.delete(state.soundSource.index);
            }
        } catch (error) {
            console.warn('Error cleaning up audio source:', error);
        }
    }, []);

    // ═══════════════════════════════════════════════════════════════════════════
    // EFFECTS
    // ═══════════════════════════════════════════════════════════════════════════
    /**
     * Update listener position ref and trigger volume updates.
     */
    useEffect(() => {
        listenerPositionRef.current = listenerPosition;
        updateAllVolumes(listenerPosition);
    }, [listenerPosition, updateAllVolumes]);

    /**
     * Manage audio sources based on soundSources changes.
     */
    useEffect(() => {
        if (!audioContext || !isAudioUnlocked) {
            // eslint-disable-next-line react-hooks/set-state-in-effect -- Syncing ready state with audioContext availability
            setIsReady(false);
            return;
        }

        setIsReady(true);

        // Get currently playing sound sources
        // Warn about sources that are playing but have no media id
        const playingSources = soundSources.filter((s) => {
            if (s.isPlaying && !s.media?.id) {
                console.warn(`[useSpatialAudio] Sound source at index ${s.index} has no media id`);
                return false;
            }
            return s.isPlaying && s.media?.id;
        });

        // Find sources that need to be added
        const currentIndices = new Set(playingSources.map((s) => s.index));
        const existingIndices = new Set(audioStatesRef.current.keys());

        // Remove sources that are no longer playing
        for (const index of existingIndices) {
            if (!currentIndices.has(index)) {
                const state = audioStatesRef.current.get(index);
                if (state) {
                    cleanupAudioSource(state);
                    audioStatesRef.current.delete(index);
                }
            }
        }

        // Add new sources (async IIFE to properly handle promises)
        const newSources = playingSources.filter((s) => !existingIndices.has(s.index));
        if (newSources.length > 0) {
            (async () => {
                for (const soundSource of newSources) {
                    const state = await createAudioSource(soundSource);
                    if (state) {
                        audioStatesRef.current.set(soundSource.index, state);

                        // Set initial volume
                        updateSourceVolume(state, listenerPositionRef.current);

                        // Start playback
                        await startAudioSource(state);
                    }
                }
                setActiveSources(audioStatesRef.current.size);
            })();
        }

        // Update existing sources (in case properties changed)
        for (const soundSource of playingSources) {
            const state = audioStatesRef.current.get(soundSource.index);
            if (state) {
                // Update loop state
                state.audio.loop = soundSource.loop;

                // Update volume
                state.soundSource = soundSource;
                updateSourceVolume(state, listenerPositionRef.current);
            }
        }
    }, [
        soundSources,
        audioContext,
        isAudioUnlocked,
        createAudioSource,
        cleanupAudioSource,
        startAudioSource,
        updateSourceVolume,
    ]);

    /**
     * Cleanup all audio sources on unmount.
     * Uses inline cleanup to avoid dependency on changing callback.
     */
    useEffect(() => {
        // Capture refs for cleanup
        const audioStates = audioStatesRef.current;
        const blobUrls = blobUrlsRef.current;

        return () => {
            // Inline cleanup logic to avoid dependency issues
            audioStates.forEach((state) => {
                try {
                    state.audio.pause();
                    state.audio.currentTime = 0;
                    state.gainNode.disconnect();
                    state.source.disconnect();
                } catch {
                    // Ignore cleanup errors on unmount
                }
            });
            audioStates.clear();

            // Revoke any remaining blob URLs
            blobUrls.forEach((url) => {
                URL.revokeObjectURL(url);
            });
            blobUrls.clear();
        };
    }, []);

    return {
        isReady: isReady && isAudioUnlocked && audioContext !== null,
        activeSources,
    };
}
