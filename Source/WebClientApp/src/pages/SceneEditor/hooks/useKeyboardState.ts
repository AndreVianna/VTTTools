import { useState, useEffect } from 'react';
import type { GridConfig } from '@/types/domain';

interface UseKeyboardStateProps {
    gridConfig: GridConfig;
    onEscapeKey?: () => void;
    onEnterKey?: () => void;
}

export const useKeyboardState = ({ gridConfig, onEscapeKey, onEnterKey }: UseKeyboardStateProps) => {
    const [isAltPressed, setIsAltPressed] = useState(false);
    const [isCtrlPressed, setIsCtrlPressed] = useState(false);
    const [isShiftPressed, setIsShiftPressed] = useState(false);

    const snapMode: 'free' | 'grid' | 'half-step' =
        isAltPressed && isCtrlPressed ? 'half-step' :
        isAltPressed ? 'free' :
        isCtrlPressed ? 'grid' :
        gridConfig.snap ? 'grid' : 'free';

    useEffect(() => {
        const handleKeyDown = (e: KeyboardEvent) => {
            if (e.target instanceof HTMLInputElement || e.target instanceof HTMLTextAreaElement) {
                return;
            }

            if (e.key === 'Alt' || e.key === 'Control' || e.key === 'Shift') {
                e.preventDefault();
            }

            if (e.key === 'Escape' && onEscapeKey) {
                e.preventDefault();
                e.stopPropagation();
                onEscapeKey();
            }

            if (e.key === 'Enter' && onEnterKey) {
                e.preventDefault();
                e.stopPropagation();
                onEnterKey();
            }

            if (e.key === 'Alt') {
                setIsAltPressed(true);
            }
            if (e.key === 'Control') {
                setIsCtrlPressed(true);
            }
            if (e.key === 'Shift') {
                setIsShiftPressed(true);
            }
        };

        const handleKeyUp = (e: KeyboardEvent) => {
            if (e.key === 'Alt' || e.key === 'Control' || e.key === 'Shift') {
                e.preventDefault();
            }

            if (e.key === 'Alt') {
                setIsAltPressed(false);
            }
            if (e.key === 'Control') {
                setIsCtrlPressed(false);
            }
            if (e.key === 'Shift') {
                setIsShiftPressed(false);
            }
        };

        const handleBlur = () => {
            setIsAltPressed(false);
            setIsCtrlPressed(false);
            setIsShiftPressed(false);
        };

        window.addEventListener('keydown', handleKeyDown, { capture: true });
        window.addEventListener('keyup', handleKeyUp, { capture: true });
        window.addEventListener('blur', handleBlur);

        return () => {
            window.removeEventListener('keydown', handleKeyDown, { capture: true });
            window.removeEventListener('keyup', handleKeyUp, { capture: true });
            window.removeEventListener('blur', handleBlur);
        };
    }, [onEscapeKey, onEnterKey]);

    return {
        isAltPressed,
        isCtrlPressed,
        isShiftPressed,
        snapMode
    };
};
