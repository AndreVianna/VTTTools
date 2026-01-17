import { renderHook } from '@testing-library/react';
import { describe, expect, it, vi, beforeEach, afterEach } from 'vitest';
import { useKeyboardShortcuts } from './useKeyboardShortcuts';

describe('useKeyboardShortcuts', () => {
    const createMockTransaction = (isActive: boolean, canUndo = false, canRedo = false) => ({
        transaction: { isActive },
        canUndoLocal: vi.fn().mockReturnValue(canUndo),
        canRedoLocal: vi.fn().mockReturnValue(canRedo),
        undoLocal: vi.fn(),
        redoLocal: vi.fn(),
    });

    const createMockProps = () => ({
        wallTransaction: createMockTransaction(false),
        regionTransaction: createMockTransaction(false),
        undo: vi.fn().mockResolvedValue(undefined),
        redo: vi.fn().mockResolvedValue(undefined),
    });

    const dispatchKeyEvent = (key: string, options: Partial<KeyboardEventInit> = {}) => {
        const event = new KeyboardEvent('keydown', {
            key,
            bubbles: true,
            ...options,
        });
        window.dispatchEvent(event);
    };

    let originalPlatform: PropertyDescriptor | undefined;

    beforeEach(() => {
        originalPlatform = Object.getOwnPropertyDescriptor(navigator, 'platform');
    });

    afterEach(() => {
        if (originalPlatform) {
            Object.defineProperty(navigator, 'platform', originalPlatform);
        }
    });

    it('should call global undo on Ctrl+Z when no transaction is active', async () => {
        const props = createMockProps();
        renderHook(() => useKeyboardShortcuts(props));

        dispatchKeyEvent('z', { ctrlKey: true });

        // Wait for async operations
        await new Promise((r) => setTimeout(r, 0));

        expect(props.undo).toHaveBeenCalled();
    });

    it('should call global redo on Ctrl+Y when no transaction is active', async () => {
        const props = createMockProps();
        renderHook(() => useKeyboardShortcuts(props));

        dispatchKeyEvent('y', { ctrlKey: true });

        await new Promise((r) => setTimeout(r, 0));

        expect(props.redo).toHaveBeenCalled();
    });

    it('should call global redo on Ctrl+Shift+Z when no transaction is active', async () => {
        const props = createMockProps();
        renderHook(() => useKeyboardShortcuts(props));

        dispatchKeyEvent('z', { ctrlKey: true, shiftKey: true });

        await new Promise((r) => setTimeout(r, 0));

        expect(props.redo).toHaveBeenCalled();
    });

    it('should call wall transaction undoLocal when wall transaction is active and can undo', async () => {
        const props = createMockProps();
        props.wallTransaction = createMockTransaction(true, true, false);
        renderHook(() => useKeyboardShortcuts(props));

        dispatchKeyEvent('z', { ctrlKey: true });

        await new Promise((r) => setTimeout(r, 0));

        expect(props.wallTransaction.undoLocal).toHaveBeenCalled();
        expect(props.undo).not.toHaveBeenCalled();
    });

    it('should call wall transaction redoLocal when wall transaction is active and can redo', async () => {
        const props = createMockProps();
        props.wallTransaction = createMockTransaction(true, false, true);
        renderHook(() => useKeyboardShortcuts(props));

        dispatchKeyEvent('y', { ctrlKey: true });

        await new Promise((r) => setTimeout(r, 0));

        expect(props.wallTransaction.redoLocal).toHaveBeenCalled();
        expect(props.redo).not.toHaveBeenCalled();
    });

    it('should call region transaction undoLocal when region transaction is active and can undo', async () => {
        const props = createMockProps();
        props.regionTransaction = createMockTransaction(true, true, false);
        renderHook(() => useKeyboardShortcuts(props));

        dispatchKeyEvent('z', { ctrlKey: true });

        await new Promise((r) => setTimeout(r, 0));

        expect(props.regionTransaction.undoLocal).toHaveBeenCalled();
        expect(props.undo).not.toHaveBeenCalled();
    });

    it('should call region transaction redoLocal when region transaction is active and can redo', async () => {
        const props = createMockProps();
        props.regionTransaction = createMockTransaction(true, false, true);
        renderHook(() => useKeyboardShortcuts(props));

        dispatchKeyEvent('y', { ctrlKey: true });

        await new Promise((r) => setTimeout(r, 0));

        expect(props.regionTransaction.redoLocal).toHaveBeenCalled();
        expect(props.redo).not.toHaveBeenCalled();
    });

    it('should prioritize wall transaction over region transaction', async () => {
        const props = createMockProps();
        props.wallTransaction = createMockTransaction(true, true, false);
        props.regionTransaction = createMockTransaction(true, true, false);
        renderHook(() => useKeyboardShortcuts(props));

        dispatchKeyEvent('z', { ctrlKey: true });

        await new Promise((r) => setTimeout(r, 0));

        expect(props.wallTransaction.undoLocal).toHaveBeenCalled();
        expect(props.regionTransaction.undoLocal).not.toHaveBeenCalled();
    });

    it('should fall back to global undo when transaction is active but cannot undo', async () => {
        const props = createMockProps();
        props.wallTransaction = createMockTransaction(true, false, false);
        renderHook(() => useKeyboardShortcuts(props));

        dispatchKeyEvent('z', { ctrlKey: true });

        await new Promise((r) => setTimeout(r, 0));

        expect(props.wallTransaction.undoLocal).not.toHaveBeenCalled();
        expect(props.undo).toHaveBeenCalled();
    });

    it('should not respond when typing in input fields', async () => {
        const props = createMockProps();
        renderHook(() => useKeyboardShortcuts(props));

        const input = document.createElement('input');
        document.body.appendChild(input);
        input.focus();

        const event = new KeyboardEvent('keydown', {
            key: 'z',
            ctrlKey: true,
            bubbles: true,
        });
        Object.defineProperty(event, 'target', { value: input });
        window.dispatchEvent(event);

        await new Promise((r) => setTimeout(r, 0));

        expect(props.undo).not.toHaveBeenCalled();
        document.body.removeChild(input);
    });

    it('should not respond when typing in textarea fields', async () => {
        const props = createMockProps();
        renderHook(() => useKeyboardShortcuts(props));

        const textarea = document.createElement('textarea');
        document.body.appendChild(textarea);
        textarea.focus();

        const event = new KeyboardEvent('keydown', {
            key: 'z',
            ctrlKey: true,
            bubbles: true,
        });
        Object.defineProperty(event, 'target', { value: textarea });
        window.dispatchEvent(event);

        await new Promise((r) => setTimeout(r, 0));

        expect(props.undo).not.toHaveBeenCalled();
        document.body.removeChild(textarea);
    });

    it('should not respond to Z without modifier key', async () => {
        const props = createMockProps();
        renderHook(() => useKeyboardShortcuts(props));

        dispatchKeyEvent('z');

        await new Promise((r) => setTimeout(r, 0));

        expect(props.undo).not.toHaveBeenCalled();
    });

    it('should not respond to Y without modifier key', async () => {
        const props = createMockProps();
        renderHook(() => useKeyboardShortcuts(props));

        dispatchKeyEvent('y');

        await new Promise((r) => setTimeout(r, 0));

        expect(props.redo).not.toHaveBeenCalled();
    });
});
