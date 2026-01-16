import { renderHook, act } from '@testing-library/react';
import { describe, expect, it } from 'vitest';
import { useMediaPlaybackState } from './useMediaPlaybackState';

describe('useMediaPlaybackState', () => {
    describe('default values', () => {
        it('should have isVideoPlaying set to true by default', () => {
            const { result } = renderHook(() => useMediaPlaybackState());

            expect(result.current.isVideoPlaying).toBe(true);
        });

        it('should have isAudioMuted set to false by default', () => {
            const { result } = renderHook(() => useMediaPlaybackState());

            expect(result.current.isAudioMuted).toBe(false);
        });

        it('should have isAudioSourcePlaying set to true by default', () => {
            const { result } = renderHook(() => useMediaPlaybackState());

            expect(result.current.isAudioSourcePlaying).toBe(true);
        });

        it('should return all expected functions', () => {
            const { result } = renderHook(() => useMediaPlaybackState());

            expect(typeof result.current.toggleVideoPlayback).toBe('function');
            expect(typeof result.current.toggleAudioMute).toBe('function');
            expect(typeof result.current.toggleAudioSourcePlayback).toBe('function');
            expect(typeof result.current.setVideoPlaying).toBe('function');
            expect(typeof result.current.setAudioMuted).toBe('function');
            expect(typeof result.current.setAudioSourcePlaying).toBe('function');
        });
    });

    describe('toggle functions', () => {
        describe('toggleVideoPlayback', () => {
            it('should toggle isVideoPlaying from true to false', () => {
                const { result } = renderHook(() => useMediaPlaybackState());

                expect(result.current.isVideoPlaying).toBe(true);

                act(() => {
                    result.current.toggleVideoPlayback();
                });

                expect(result.current.isVideoPlaying).toBe(false);
            });

            it('should toggle isVideoPlaying from false to true', () => {
                const { result } = renderHook(() => useMediaPlaybackState());

                // First toggle to false
                act(() => {
                    result.current.toggleVideoPlayback();
                });
                expect(result.current.isVideoPlaying).toBe(false);

                // Then toggle back to true
                act(() => {
                    result.current.toggleVideoPlayback();
                });
                expect(result.current.isVideoPlaying).toBe(true);
            });

            it('should toggle multiple times correctly', () => {
                const { result } = renderHook(() => useMediaPlaybackState());

                act(() => {
                    result.current.toggleVideoPlayback();
                    result.current.toggleVideoPlayback();
                    result.current.toggleVideoPlayback();
                });

                expect(result.current.isVideoPlaying).toBe(false);
            });
        });

        describe('toggleAudioMute', () => {
            it('should toggle isAudioMuted from false to true', () => {
                const { result } = renderHook(() => useMediaPlaybackState());

                expect(result.current.isAudioMuted).toBe(false);

                act(() => {
                    result.current.toggleAudioMute();
                });

                expect(result.current.isAudioMuted).toBe(true);
            });

            it('should toggle isAudioMuted from true to false', () => {
                const { result } = renderHook(() => useMediaPlaybackState());

                // First toggle to true
                act(() => {
                    result.current.toggleAudioMute();
                });
                expect(result.current.isAudioMuted).toBe(true);

                // Then toggle back to false
                act(() => {
                    result.current.toggleAudioMute();
                });
                expect(result.current.isAudioMuted).toBe(false);
            });
        });

        describe('toggleAudioSourcePlayback', () => {
            it('should toggle isAudioSourcePlaying from true to false', () => {
                const { result } = renderHook(() => useMediaPlaybackState());

                expect(result.current.isAudioSourcePlaying).toBe(true);

                act(() => {
                    result.current.toggleAudioSourcePlayback();
                });

                expect(result.current.isAudioSourcePlaying).toBe(false);
            });

            it('should toggle isAudioSourcePlaying from false to true', () => {
                const { result } = renderHook(() => useMediaPlaybackState());

                // First toggle to false
                act(() => {
                    result.current.toggleAudioSourcePlayback();
                });
                expect(result.current.isAudioSourcePlaying).toBe(false);

                // Then toggle back to true
                act(() => {
                    result.current.toggleAudioSourcePlayback();
                });
                expect(result.current.isAudioSourcePlaying).toBe(true);
            });
        });
    });

    describe('direct setters', () => {
        describe('setVideoPlaying', () => {
            it('should set isVideoPlaying to true', () => {
                const { result } = renderHook(() => useMediaPlaybackState());

                act(() => {
                    result.current.setVideoPlaying(false);
                });
                expect(result.current.isVideoPlaying).toBe(false);

                act(() => {
                    result.current.setVideoPlaying(true);
                });
                expect(result.current.isVideoPlaying).toBe(true);
            });

            it('should set isVideoPlaying to false', () => {
                const { result } = renderHook(() => useMediaPlaybackState());

                act(() => {
                    result.current.setVideoPlaying(false);
                });

                expect(result.current.isVideoPlaying).toBe(false);
            });

            it('should not change value when setting same value', () => {
                const { result } = renderHook(() => useMediaPlaybackState());

                expect(result.current.isVideoPlaying).toBe(true);

                act(() => {
                    result.current.setVideoPlaying(true);
                });

                expect(result.current.isVideoPlaying).toBe(true);
            });
        });

        describe('setAudioMuted', () => {
            it('should set isAudioMuted to true', () => {
                const { result } = renderHook(() => useMediaPlaybackState());

                act(() => {
                    result.current.setAudioMuted(true);
                });

                expect(result.current.isAudioMuted).toBe(true);
            });

            it('should set isAudioMuted to false', () => {
                const { result } = renderHook(() => useMediaPlaybackState());

                act(() => {
                    result.current.setAudioMuted(true);
                });
                expect(result.current.isAudioMuted).toBe(true);

                act(() => {
                    result.current.setAudioMuted(false);
                });
                expect(result.current.isAudioMuted).toBe(false);
            });
        });

        describe('setAudioSourcePlaying', () => {
            it('should set isAudioSourcePlaying to true', () => {
                const { result } = renderHook(() => useMediaPlaybackState());

                act(() => {
                    result.current.setAudioSourcePlaying(false);
                });
                expect(result.current.isAudioSourcePlaying).toBe(false);

                act(() => {
                    result.current.setAudioSourcePlaying(true);
                });
                expect(result.current.isAudioSourcePlaying).toBe(true);
            });

            it('should set isAudioSourcePlaying to false', () => {
                const { result } = renderHook(() => useMediaPlaybackState());

                act(() => {
                    result.current.setAudioSourcePlaying(false);
                });

                expect(result.current.isAudioSourcePlaying).toBe(false);
            });
        });
    });

    describe('callback stability', () => {
        it('should maintain stable reference for toggleVideoPlayback', () => {
            const { result, rerender } = renderHook(() => useMediaPlaybackState());

            const firstReference = result.current.toggleVideoPlayback;

            rerender();

            expect(result.current.toggleVideoPlayback).toBe(firstReference);
        });

        it('should maintain stable reference for toggleAudioMute', () => {
            const { result, rerender } = renderHook(() => useMediaPlaybackState());

            const firstReference = result.current.toggleAudioMute;

            rerender();

            expect(result.current.toggleAudioMute).toBe(firstReference);
        });

        it('should maintain stable reference for toggleAudioSourcePlayback', () => {
            const { result, rerender } = renderHook(() => useMediaPlaybackState());

            const firstReference = result.current.toggleAudioSourcePlayback;

            rerender();

            expect(result.current.toggleAudioSourcePlayback).toBe(firstReference);
        });

        it('should maintain stable reference for setVideoPlaying', () => {
            const { result, rerender } = renderHook(() => useMediaPlaybackState());

            const firstReference = result.current.setVideoPlaying;

            rerender();

            expect(result.current.setVideoPlaying).toBe(firstReference);
        });

        it('should maintain stable reference for setAudioMuted', () => {
            const { result, rerender } = renderHook(() => useMediaPlaybackState());

            const firstReference = result.current.setAudioMuted;

            rerender();

            expect(result.current.setAudioMuted).toBe(firstReference);
        });

        it('should maintain stable reference for setAudioSourcePlaying', () => {
            const { result, rerender } = renderHook(() => useMediaPlaybackState());

            const firstReference = result.current.setAudioSourcePlaying;

            rerender();

            expect(result.current.setAudioSourcePlaying).toBe(firstReference);
        });

        it('should maintain stable references after state changes', () => {
            const { result, rerender } = renderHook(() => useMediaPlaybackState());

            const toggleVideoRef = result.current.toggleVideoPlayback;
            const toggleAudioRef = result.current.toggleAudioMute;
            const setVideoRef = result.current.setVideoPlaying;

            // Change state
            act(() => {
                result.current.toggleVideoPlayback();
            });

            rerender();

            // References should still be stable
            expect(result.current.toggleVideoPlayback).toBe(toggleVideoRef);
            expect(result.current.toggleAudioMute).toBe(toggleAudioRef);
            expect(result.current.setVideoPlaying).toBe(setVideoRef);
        });
    });

    describe('independent state management', () => {
        it('should allow toggling video without affecting audio', () => {
            const { result } = renderHook(() => useMediaPlaybackState());

            act(() => {
                result.current.toggleVideoPlayback();
            });

            expect(result.current.isVideoPlaying).toBe(false);
            expect(result.current.isAudioMuted).toBe(false);
            expect(result.current.isAudioSourcePlaying).toBe(true);
        });

        it('should allow muting audio without affecting video', () => {
            const { result } = renderHook(() => useMediaPlaybackState());

            act(() => {
                result.current.toggleAudioMute();
            });

            expect(result.current.isVideoPlaying).toBe(true);
            expect(result.current.isAudioMuted).toBe(true);
            expect(result.current.isAudioSourcePlaying).toBe(true);
        });

        it('should allow toggling audio source without affecting video or mute', () => {
            const { result } = renderHook(() => useMediaPlaybackState());

            act(() => {
                result.current.toggleAudioSourcePlayback();
            });

            expect(result.current.isVideoPlaying).toBe(true);
            expect(result.current.isAudioMuted).toBe(false);
            expect(result.current.isAudioSourcePlaying).toBe(false);
        });

        it('should handle all toggles together correctly', () => {
            const { result } = renderHook(() => useMediaPlaybackState());

            act(() => {
                result.current.toggleVideoPlayback();
                result.current.toggleAudioMute();
                result.current.toggleAudioSourcePlayback();
            });

            expect(result.current.isVideoPlaying).toBe(false);
            expect(result.current.isAudioMuted).toBe(true);
            expect(result.current.isAudioSourcePlaying).toBe(false);
        });
    });
});
