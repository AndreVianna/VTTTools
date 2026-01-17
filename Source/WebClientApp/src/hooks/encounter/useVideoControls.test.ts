import { act, renderHook } from '@testing-library/react';
import { describe, expect, it } from 'vitest';
import { useVideoControls } from './useVideoControls';

describe('useVideoControls', () => {
    it('should initialize with audio muted', () => {
        const { result } = renderHook(() => useVideoControls());

        expect(result.current.isVideoAudioMuted).toBe(true);
    });

    it('should initialize with video playing', () => {
        const { result } = renderHook(() => useVideoControls());

        expect(result.current.isVideoPlaying).toBe(true);
    });

    it('should toggle audio mute state', () => {
        const { result } = renderHook(() => useVideoControls());

        expect(result.current.isVideoAudioMuted).toBe(true);

        act(() => {
            result.current.handleAudioMuteToggle();
        });

        expect(result.current.isVideoAudioMuted).toBe(false);

        act(() => {
            result.current.handleAudioMuteToggle();
        });

        expect(result.current.isVideoAudioMuted).toBe(true);
    });

    it('should toggle video play/pause state', () => {
        const { result } = renderHook(() => useVideoControls());

        expect(result.current.isVideoPlaying).toBe(true);

        act(() => {
            result.current.handleVideoPlayPauseToggle();
        });

        expect(result.current.isVideoPlaying).toBe(false);

        act(() => {
            result.current.handleVideoPlayPauseToggle();
        });

        expect(result.current.isVideoPlaying).toBe(true);
    });
});
