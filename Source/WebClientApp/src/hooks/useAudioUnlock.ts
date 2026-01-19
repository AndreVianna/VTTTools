import { useCallback, useEffect, useRef, useState } from 'react';

// Safari compatibility: webkitAudioContext
// Declared at module level for type safety and potential reuse
type WindowWithWebkitAudio = Window & { webkitAudioContext?: typeof AudioContext };

/** Gets the AudioContext constructor, falling back to webkitAudioContext for Safari */
const getAudioContextClass = (): typeof AudioContext | undefined => {
    if (window.AudioContext) {
        return window.AudioContext;
    }
    const webkitWindow = window as WindowWithWebkitAudio;
    return webkitWindow.webkitAudioContext;
};

/**
 * Audio Unlock Pattern (AUP) hook for handling browser autoplay restrictions.
 *
 * This hook manages audio unlock state by:
 * 1. Listening for user interactions (click, touchend, keydown)
 * 2. Creating/resuming an AudioContext on first interaction
 * 3. Tracking unlock state for the session
 *
 * @returns {Object} Audio unlock state and controls
 */
export function useAudioUnlock() {
    const [isUnlocked, setIsUnlocked] = useState(false);
    const [audioContext, setAudioContext] = useState<AudioContext | null>(null);
    const audioContextRef = useRef<AudioContext | null>(null);
    const hasAttemptedUnlock = useRef(false);

    const unlockAudio = useCallback(async (): Promise<boolean> => {
        if (isUnlocked) return true;

        let currentOperation = 'initialization';
        try {
            // Create AudioContext if not exists
            if (!audioContextRef.current) {
                currentOperation = 'AudioContext creation';
                const AudioContextClass = getAudioContextClass();
                if (!AudioContextClass) {
                    console.warn('AudioContext not supported in this browser');
                    return false;
                }
                audioContextRef.current = new AudioContextClass();
                setAudioContext(audioContextRef.current);
            }

            const ctx = audioContextRef.current;

            // Resume if suspended
            if (ctx.state === 'suspended') {
                currentOperation = 'AudioContext resume';
                await ctx.resume();
            }

            // Play a silent buffer to fully unlock
            currentOperation = 'silent buffer playback';
            const buffer = ctx.createBuffer(1, 1, 22050);
            const source = ctx.createBufferSource();
            source.buffer = buffer;
            source.connect(ctx.destination);
            source.start(0);

            setIsUnlocked(true);
            return true;
        } catch (error) {
            console.error(`Failed to unlock audio during ${currentOperation}:`, error);
            return false;
        }
    }, [isUnlocked]);

    // Set up event listeners for automatic unlock on user interaction
    useEffect(() => {
        if (isUnlocked || hasAttemptedUnlock.current) return;

        const handleInteraction = async () => {
            if (hasAttemptedUnlock.current) return;
            hasAttemptedUnlock.current = true;
            await unlockAudio();
        };

        const events = ['mousedown', 'touchstart', 'pointerdown', 'keydown'] as const;
        events.forEach((event) => {
            document.addEventListener(event, handleInteraction, { once: true, passive: true });
        });

        return () => {
            events.forEach((event) => {
                document.removeEventListener(event, handleInteraction);
            });
        };
    }, [isUnlocked, unlockAudio]);

    // Cleanup AudioContext on unmount
    useEffect(() => {
        return () => {
            if (audioContextRef.current && audioContextRef.current.state !== 'closed') {
                audioContextRef.current.close().catch(() => {
                    // Ignore close errors
                });
            }
        };
    }, []);

    return {
        /** Whether audio has been unlocked */
        isUnlocked,
        /** Manually trigger audio unlock (e.g., from a button click) */
        unlockAudio,
        /** The AudioContext instance (if created) */
        audioContext,
    };
}
