import { useCallback, useState } from 'react';

export interface UseVideoControlsReturn {
    /** Whether video audio is muted */
    isVideoAudioMuted: boolean;
    /** Whether video is playing */
    isVideoPlaying: boolean;
    /** Toggle audio mute state */
    handleAudioMuteToggle: () => void;
    /** Toggle video play/pause state */
    handleVideoPlayPauseToggle: () => void;
}

/**
 * Hook to manage video playback controls.
 * Extracted from EncounterEditorPage for better organization.
 */
export function useVideoControls(): UseVideoControlsReturn {
    // Video audio starts muted (browser autoplay policy), user can unmute via status bar
    const [isVideoAudioMuted, setIsVideoAudioMuted] = useState(true);
    // Video starts playing (autoplay), user can pause via status bar
    const [isVideoPlaying, setIsVideoPlaying] = useState(true);

    const handleAudioMuteToggle = useCallback(() => {
        setIsVideoAudioMuted((prev) => !prev);
    }, []);

    const handleVideoPlayPauseToggle = useCallback(() => {
        setIsVideoPlaying((prev) => !prev);
    }, []);

    return {
        isVideoAudioMuted,
        isVideoPlaying,
        handleAudioMuteToggle,
        handleVideoPlayPauseToggle,
    };
}
