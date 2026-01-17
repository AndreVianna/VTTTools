import { act, renderHook } from '@testing-library/react';
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';
import { useAudioUnlock } from './useAudioUnlock';

// Mock AudioContext
const mockResume = vi.fn().mockResolvedValue(undefined);
const mockClose = vi.fn().mockResolvedValue(undefined);
const mockCreateBuffer = vi.fn().mockReturnValue({});
const mockCreateBufferSource = vi.fn().mockReturnValue({
    buffer: null,
    connect: vi.fn(),
    start: vi.fn(),
});

class MockAudioContext {
    state = 'suspended';
    resume = mockResume;
    close = mockClose;
    createBuffer = mockCreateBuffer;
    createBufferSource = mockCreateBufferSource;
    destination = {};
}

describe('useAudioUnlock', () => {
    let originalAudioContext: typeof window.AudioContext;

    beforeEach(() => {
        originalAudioContext = window.AudioContext;
        // @ts-expect-error - Mocking AudioContext
        window.AudioContext = MockAudioContext;

        vi.clearAllMocks();
        mockResume.mockResolvedValue(undefined);
        mockClose.mockResolvedValue(undefined);
    });

    afterEach(() => {
        window.AudioContext = originalAudioContext;
    });

    it('should start with isUnlocked as false', () => {
        const { result } = renderHook(() => useAudioUnlock());

        expect(result.current.isUnlocked).toBe(false);
    });

    it('should return unlockAudio function', () => {
        const { result } = renderHook(() => useAudioUnlock());

        expect(typeof result.current.unlockAudio).toBe('function');
    });

    it('should unlock audio when unlockAudio is called', async () => {
        const { result } = renderHook(() => useAudioUnlock());

        await act(async () => {
            const success = await result.current.unlockAudio();
            expect(success).toBe(true);
        });

        expect(result.current.isUnlocked).toBe(true);
    });

    it('should resume AudioContext if suspended', async () => {
        const { result } = renderHook(() => useAudioUnlock());

        await act(async () => {
            await result.current.unlockAudio();
        });

        expect(mockResume).toHaveBeenCalled();
    });

    it('should create and play a silent buffer', async () => {
        const { result } = renderHook(() => useAudioUnlock());

        await act(async () => {
            await result.current.unlockAudio();
        });

        expect(mockCreateBuffer).toHaveBeenCalledWith(1, 1, 22050);
        expect(mockCreateBufferSource).toHaveBeenCalled();
    });

    it('should return true immediately if already unlocked', async () => {
        const { result } = renderHook(() => useAudioUnlock());

        // First unlock
        await act(async () => {
            await result.current.unlockAudio();
        });

        // Second unlock should return true immediately
        await act(async () => {
            const success = await result.current.unlockAudio();
            expect(success).toBe(true);
        });

        // Resume should only be called once (first unlock)
        expect(mockResume).toHaveBeenCalledTimes(1);
    });

    it('should close AudioContext on unmount', async () => {
        const { result, unmount } = renderHook(() => useAudioUnlock());

        // Create an AudioContext by unlocking
        await act(async () => {
            await result.current.unlockAudio();
        });

        unmount();

        expect(mockClose).toHaveBeenCalled();
    });

    it('should handle AudioContext not supported', async () => {
        // @ts-expect-error - Setting AudioContext to undefined
        window.AudioContext = undefined;

        const consoleSpy = vi.spyOn(console, 'warn').mockImplementation(() => {});

        const { result } = renderHook(() => useAudioUnlock());

        await act(async () => {
            const success = await result.current.unlockAudio();
            expect(success).toBe(false);
        });

        expect(consoleSpy).toHaveBeenCalledWith('AudioContext not supported in this browser');
        consoleSpy.mockRestore();
    });

    it('should handle errors during unlock', async () => {
        mockResume.mockRejectedValueOnce(new Error('Failed to resume'));
        const consoleSpy = vi.spyOn(console, 'error').mockImplementation(() => {});

        const { result } = renderHook(() => useAudioUnlock());

        await act(async () => {
            const success = await result.current.unlockAudio();
            expect(success).toBe(false);
        });

        expect(consoleSpy).toHaveBeenCalled();
        consoleSpy.mockRestore();
    });

    describe('automatic unlock on user interaction', () => {
        it('should set up event listeners for mousedown', async () => {
            const addEventListenerSpy = vi.spyOn(document, 'addEventListener');

            renderHook(() => useAudioUnlock());

            expect(addEventListenerSpy).toHaveBeenCalledWith(
                'mousedown',
                expect.any(Function),
                expect.objectContaining({ once: true, passive: true })
            );
        });

        it('should set up event listeners for touchstart', async () => {
            const addEventListenerSpy = vi.spyOn(document, 'addEventListener');

            renderHook(() => useAudioUnlock());

            expect(addEventListenerSpy).toHaveBeenCalledWith(
                'touchstart',
                expect.any(Function),
                expect.objectContaining({ once: true, passive: true })
            );
        });

        it('should set up event listeners for pointerdown', async () => {
            const addEventListenerSpy = vi.spyOn(document, 'addEventListener');

            renderHook(() => useAudioUnlock());

            expect(addEventListenerSpy).toHaveBeenCalledWith(
                'pointerdown',
                expect.any(Function),
                expect.objectContaining({ once: true, passive: true })
            );
        });

        it('should set up event listeners for keydown', async () => {
            const addEventListenerSpy = vi.spyOn(document, 'addEventListener');

            renderHook(() => useAudioUnlock());

            expect(addEventListenerSpy).toHaveBeenCalledWith(
                'keydown',
                expect.any(Function),
                expect.objectContaining({ once: true, passive: true })
            );
        });

        it('should remove event listeners on unmount', async () => {
            const removeEventListenerSpy = vi.spyOn(document, 'removeEventListener');

            const { unmount } = renderHook(() => useAudioUnlock());

            unmount();

            expect(removeEventListenerSpy).toHaveBeenCalledWith('mousedown', expect.any(Function));
            expect(removeEventListenerSpy).toHaveBeenCalledWith('touchstart', expect.any(Function));
            expect(removeEventListenerSpy).toHaveBeenCalledWith('pointerdown', expect.any(Function));
            expect(removeEventListenerSpy).toHaveBeenCalledWith('keydown', expect.any(Function));
        });
    });

    describe('webkitAudioContext fallback', () => {
        it('should use webkitAudioContext when AudioContext is not available', async () => {
            // @ts-expect-error - Setting AudioContext to undefined
            window.AudioContext = undefined;
            // @ts-expect-error - Setting webkitAudioContext
            (window as { webkitAudioContext?: typeof AudioContext }).webkitAudioContext = MockAudioContext;

            const { result } = renderHook(() => useAudioUnlock());

            await act(async () => {
                const success = await result.current.unlockAudio();
                expect(success).toBe(true);
            });

            expect(result.current.isUnlocked).toBe(true);

            // Cleanup
            // @ts-expect-error - Cleanup webkitAudioContext
            delete (window as { webkitAudioContext?: typeof AudioContext }).webkitAudioContext;
        });
    });
});
