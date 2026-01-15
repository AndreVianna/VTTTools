import { useCallback, useState } from 'react';

/**
 * Return type for the useMediaPlaybackState hook.
 */
export interface UseMediaPlaybackStateReturn {
    /** Whether video is currently playing */
    isVideoPlaying: boolean;
    /** Whether audio is currently muted */
    isAudioMuted: boolean;
    /** Whether separate audio source is playing (only used when audio comes from separate resource) */
    isAudioSourcePlaying: boolean;
    /** Toggle video playback state */
    toggleVideoPlayback: () => void;
    /** Toggle audio mute state */
    toggleAudioMute: () => void;
    /** Toggle separate audio source playback state */
    toggleAudioSourcePlayback: () => void;
    /** Set video playing state directly */
    setVideoPlaying: (playing: boolean) => void;
    /** Set audio muted state directly */
    setAudioMuted: (muted: boolean) => void;
    /** Set audio source playing state directly */
    setAudioSourcePlaying: (playing: boolean) => void;
}

/**
 * Hook for managing media playback state in the Encounter Editor.
 *
 * This is frontend-only state (not persisted) for controlling:
 * - Video playback (auto-plays by default)
 * - Audio mute/unmute (audio on by default)
 * - Separate audio source playback (when audio comes from separate resource, not video)
 *
 * @returns Media playback state and control functions
 */
export function useMediaPlaybackState(): UseMediaPlaybackStateReturn {
    // Video auto-plays by default
    const [isVideoPlaying, setIsVideoPlaying] = useState(true);

    // Audio is on by default
    const [isAudioMuted, setIsAudioMuted] = useState(false);

    // Separate audio source auto-plays by default
    const [isAudioSourcePlaying, setIsAudioSourcePlaying] = useState(true);

    // Toggle handlers (memoized for stable references)
    const toggleVideoPlayback = useCallback(() => {
        setIsVideoPlaying((prev) => !prev);
    }, []);

    const toggleAudioMute = useCallback(() => {
        setIsAudioMuted((prev) => !prev);
    }, []);

    const toggleAudioSourcePlayback = useCallback(() => {
        setIsAudioSourcePlaying((prev) => !prev);
    }, []);

    // Direct setters (memoized for stable references)
    const setVideoPlaying = useCallback((playing: boolean) => {
        setIsVideoPlaying(playing);
    }, []);

    const setAudioMuted = useCallback((muted: boolean) => {
        setIsAudioMuted(muted);
    }, []);

    const setAudioSourcePlaying = useCallback((playing: boolean) => {
        setIsAudioSourcePlaying(playing);
    }, []);

    return {
        isVideoPlaying,
        isAudioMuted,
        isAudioSourcePlaying,
        toggleVideoPlayback,
        toggleAudioMute,
        toggleAudioSourcePlayback,
        setVideoPlaying,
        setAudioMuted,
        setAudioSourcePlaying,
    };
}
