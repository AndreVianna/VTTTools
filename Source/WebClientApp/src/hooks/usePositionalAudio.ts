import { useCallback, useRef } from 'react';
import type { EncounterWall } from '@/types/domain';
import type { GridConfig } from '@/utils/gridCalculator';

export interface PositionalAudioOptions {
    isAmbient?: boolean;
    volume?: number;
    loop?: boolean;
    position?: { x: number; y: number };
    range?: number;
}

export interface UsePositionalAudioProps {
    audioContext: AudioContext | null;
    isEnabled: boolean;
    walls: EncounterWall[];
    gridConfig: GridConfig;
}

export interface UsePositionalAudioReturn {
    updateListenerPosition: (position: { x: number; y: number }) => void;
    playSound: (url: string, options?: PositionalAudioOptions) => void;
    stopSound: (url: string) => void;
    stopAllSounds: () => void;
}

/**
 * Hook for managing positional audio in the encounter page.
 *
 * Features:
 * - Ambient sounds: Global audio that plays at constant volume
 * - Positional sounds: Audio with distance-based attenuation (future)
 * - Wall occlusion: Sounds blocked by walls (future)
 *
 * @param props - Configuration for the positional audio system
 * @returns Controls for managing audio playback
 */
export function usePositionalAudio({
    audioContext,
    isEnabled,
}: UsePositionalAudioProps): UsePositionalAudioReturn {
    const audioElementsRef = useRef<Map<string, HTMLAudioElement>>(new Map());
    const listenerPositionRef = useRef<{ x: number; y: number }>({ x: 0, y: 0 });

    const updateListenerPosition = useCallback((position: { x: number; y: number }) => {
        listenerPositionRef.current = position;
        // Future: Update volume of positional sounds based on distance
    }, []);

    const playSound = useCallback((url: string, options: PositionalAudioOptions = {}) => {
        if (!isEnabled) return;

        // Check if sound is already playing
        const existingAudio = audioElementsRef.current.get(url);
        if (existingAudio && !existingAudio.paused) {
            return;
        }

        const audio = new Audio(url);
        audio.volume = options.volume ?? 1.0;
        audio.loop = options.loop ?? false;

        // Store reference for cleanup
        audioElementsRef.current.set(url, audio);

        // Handle audio end
        audio.addEventListener('ended', () => {
            if (!options.loop) {
                audioElementsRef.current.delete(url);
            }
        });

        // Handle errors gracefully
        audio.addEventListener('error', (e) => {
            console.warn('Failed to play audio:', url, e);
            audioElementsRef.current.delete(url);
        });

        audio.play().catch((error) => {
            console.warn('Audio playback failed:', error);
            audioElementsRef.current.delete(url);
        });
    }, [isEnabled]);

    const stopSound = useCallback((url: string) => {
        const audio = audioElementsRef.current.get(url);
        if (audio) {
            audio.pause();
            audio.currentTime = 0;
            audioElementsRef.current.delete(url);
        }
    }, []);

    const stopAllSounds = useCallback(() => {
        audioElementsRef.current.forEach((audio) => {
            audio.pause();
            audio.currentTime = 0;
        });
        audioElementsRef.current.clear();
    }, []);

    return {
        updateListenerPosition,
        playSound,
        stopSound,
        stopAllSounds,
    };
}
