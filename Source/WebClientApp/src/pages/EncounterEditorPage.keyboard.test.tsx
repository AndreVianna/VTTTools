import { renderHook } from '@testing-library/react';
import { useEffect } from 'react';
import { beforeEach, describe, expect, it, vi } from 'vitest';

describe('EncounterEditorPage - Keyboard Routing', () => {
  const mockUndoLocal = vi.fn();
  const mockRedoLocal = vi.fn();
  const mockCanUndoLocal = vi.fn();
  const mockCanRedoLocal = vi.fn();
  const mockUndo = vi.fn();
  const mockRedo = vi.fn();

  const mockWallTransaction = {
    transaction: {
      type: null,
      originalWall: null,
      segments: [],
      isActive: false,
      localUndoStack: [],
      localRedoStack: [],
    },
    undoLocal: mockUndoLocal,
    redoLocal: mockRedoLocal,
    canUndoLocal: mockCanUndoLocal,
    canRedoLocal: mockCanRedoLocal,
  };

  // Note: This duplicates EncounterEditorPage keyboard handler for isolated testing
  // Consider refactoring to test actual EncounterEditorPage integration
  const useKeyboardHandler = (
    wallTransaction: typeof mockWallTransaction,
    undo: () => Promise<void>,
    redo: () => void,
  ) => {
    useEffect(() => {
      const handleKeyDown = async (e: KeyboardEvent) => {
        if (e.target instanceof HTMLInputElement || e.target instanceof HTMLTextAreaElement) {
          return;
        }

        const isTransactionActive = wallTransaction.transaction.isActive;
        const isMac = navigator.platform.toUpperCase().indexOf('MAC') >= 0;
        const modifier = isMac ? e.metaKey : e.ctrlKey;

        if (modifier && e.key === 'z' && !e.shiftKey) {
          e.preventDefault();
          e.stopImmediatePropagation();

          if (isTransactionActive && wallTransaction.canUndoLocal()) {
            wallTransaction.undoLocal();
          } else {
            await undo();
          }
          return;
        }

        if (modifier && (e.key === 'y' || (e.key === 'z' && e.shiftKey))) {
          e.preventDefault();
          e.stopImmediatePropagation();

          if (isTransactionActive && wallTransaction.canRedoLocal()) {
            wallTransaction.redoLocal();
          } else {
            await redo();
          }
          return;
        }
      };

      window.addEventListener('keydown', handleKeyDown, { capture: true });

      return () => {
        window.removeEventListener('keydown', handleKeyDown, { capture: true });
      };
    }, [wallTransaction, undo, redo]);
  };

  beforeEach(() => {
    vi.clearAllMocks();
    mockWallTransaction.transaction.isActive = false;
  });

  describe('Local Undo Routing', () => {
    it('should call wallTransaction.undoLocal when transaction is active and local undo is available', async () => {
      mockWallTransaction.transaction.isActive = true;
      mockCanUndoLocal.mockReturnValue(true);

      renderHook(() => useKeyboardHandler(mockWallTransaction, mockUndo, mockRedo));

      const event = new KeyboardEvent('keydown', {
        key: 'z',
        ctrlKey: true,
        bubbles: true,
        cancelable: true,
      });
      const preventDefaultSpy = vi.spyOn(event, 'preventDefault');
      const stopPropagationSpy = vi.spyOn(event, 'stopImmediatePropagation');

      window.dispatchEvent(event);

      await vi.waitFor(() => {
        expect(mockUndoLocal).toHaveBeenCalledTimes(1);
      });
      expect(mockUndo).not.toHaveBeenCalled();
      expect(preventDefaultSpy).toHaveBeenCalled();
      expect(stopPropagationSpy).toHaveBeenCalled();
    });

    it('should call global undo when transaction is active but local undo is empty', async () => {
      mockWallTransaction.transaction.isActive = true;
      mockCanUndoLocal.mockReturnValue(false);

      renderHook(() => useKeyboardHandler(mockWallTransaction, mockUndo, mockRedo));

      const event = new KeyboardEvent('keydown', {
        key: 'z',
        ctrlKey: true,
        bubbles: true,
        cancelable: true,
      });

      window.dispatchEvent(event);

      await vi.waitFor(() => {
        expect(mockUndo).toHaveBeenCalledTimes(1);
      });
      expect(mockUndoLocal).not.toHaveBeenCalled();
    });

    it('should call stopImmediatePropagation when routing to local undo', async () => {
      mockWallTransaction.transaction.isActive = true;
      mockCanUndoLocal.mockReturnValue(true);

      renderHook(() => useKeyboardHandler(mockWallTransaction, mockUndo, mockRedo));

      const event = new KeyboardEvent('keydown', {
        key: 'z',
        ctrlKey: true,
        bubbles: true,
        cancelable: true,
      });
      const stopPropagationSpy = vi.spyOn(event, 'stopImmediatePropagation');

      window.dispatchEvent(event);

      await vi.waitFor(() => {
        expect(stopPropagationSpy).toHaveBeenCalledTimes(1);
      });
    });
  });

  describe('Local Redo Routing', () => {
    it('should call wallTransaction.redoLocal when transaction is active and local redo is available (Ctrl+Y)', async () => {
      mockWallTransaction.transaction.isActive = true;
      mockCanRedoLocal.mockReturnValue(true);

      renderHook(() => useKeyboardHandler(mockWallTransaction, mockUndo, mockRedo));

      const event = new KeyboardEvent('keydown', {
        key: 'y',
        ctrlKey: true,
        bubbles: true,
        cancelable: true,
      });

      window.dispatchEvent(event);

      await vi.waitFor(() => {
        expect(mockRedoLocal).toHaveBeenCalledTimes(1);
      });
      expect(mockRedo).not.toHaveBeenCalled();
    });

    it('should call wallTransaction.redoLocal on Ctrl+Shift+Z when transaction active', async () => {
      mockWallTransaction.transaction.isActive = true;
      mockCanRedoLocal.mockReturnValue(true);

      renderHook(() => useKeyboardHandler(mockWallTransaction, mockUndo, mockRedo));

      const event = new KeyboardEvent('keydown', {
        key: 'z',
        ctrlKey: true,
        shiftKey: true,
        bubbles: true,
        cancelable: true,
      });

      window.dispatchEvent(event);

      await vi.waitFor(() => {
        expect(mockRedoLocal).toHaveBeenCalledTimes(1);
      });
      expect(mockRedo).not.toHaveBeenCalled();
    });

    it('should call global redo when transaction is active but local redo is empty', async () => {
      mockWallTransaction.transaction.isActive = true;
      mockCanRedoLocal.mockReturnValue(false);

      renderHook(() => useKeyboardHandler(mockWallTransaction, mockUndo, mockRedo));

      const event = new KeyboardEvent('keydown', {
        key: 'y',
        ctrlKey: true,
        bubbles: true,
        cancelable: true,
      });

      window.dispatchEvent(event);

      await vi.waitFor(() => {
        expect(mockRedo).toHaveBeenCalledTimes(1);
      });
      expect(mockRedoLocal).not.toHaveBeenCalled();
    });

    it('should call stopImmediatePropagation when routing to local redo', async () => {
      mockWallTransaction.transaction.isActive = true;
      mockCanRedoLocal.mockReturnValue(true);

      renderHook(() => useKeyboardHandler(mockWallTransaction, mockUndo, mockRedo));

      const event = new KeyboardEvent('keydown', {
        key: 'y',
        ctrlKey: true,
        bubbles: true,
        cancelable: true,
      });
      const stopPropagationSpy = vi.spyOn(event, 'stopImmediatePropagation');

      window.dispatchEvent(event);

      await vi.waitFor(() => {
        expect(stopPropagationSpy).toHaveBeenCalledTimes(1);
      });
    });
  });

  describe('Global Undo/Redo Routing', () => {
    it('should call global undo when transaction is not active on Ctrl+Z', async () => {
      mockWallTransaction.transaction.isActive = false;

      renderHook(() => useKeyboardHandler(mockWallTransaction, mockUndo, mockRedo));

      const event = new KeyboardEvent('keydown', {
        key: 'z',
        ctrlKey: true,
        bubbles: true,
        cancelable: true,
      });

      window.dispatchEvent(event);

      await vi.waitFor(() => {
        expect(mockUndo).toHaveBeenCalledTimes(1);
      });
      expect(mockUndoLocal).not.toHaveBeenCalled();
    });

    it('should call global redo when transaction is not active on Ctrl+Y', async () => {
      mockWallTransaction.transaction.isActive = false;

      renderHook(() => useKeyboardHandler(mockWallTransaction, mockUndo, mockRedo));

      const event = new KeyboardEvent('keydown', {
        key: 'y',
        ctrlKey: true,
        bubbles: true,
        cancelable: true,
      });

      window.dispatchEvent(event);

      await vi.waitFor(() => {
        expect(mockRedo).toHaveBeenCalledTimes(1);
      });
      expect(mockRedoLocal).not.toHaveBeenCalled();
    });
  });

  describe('Platform Support', () => {
    it('should handle Cmd+Z on Mac (metaKey)', async () => {
      const originalPlatform = navigator.platform;
      Object.defineProperty(navigator, 'platform', {
        value: 'MacIntel',
        configurable: true,
      });

      mockWallTransaction.transaction.isActive = false;

      renderHook(() => useKeyboardHandler(mockWallTransaction, mockUndo, mockRedo));

      const event = new KeyboardEvent('keydown', {
        key: 'z',
        metaKey: true,
        bubbles: true,
        cancelable: true,
      });

      window.dispatchEvent(event);

      await vi.waitFor(() => {
        expect(mockUndo).toHaveBeenCalledTimes(1);
      });

      Object.defineProperty(navigator, 'platform', {
        value: originalPlatform,
        configurable: true,
      });
    });

    it('should handle Ctrl+Z on Windows (ctrlKey)', async () => {
      const originalPlatform = navigator.platform;
      Object.defineProperty(navigator, 'platform', {
        value: 'Win32',
        configurable: true,
      });

      mockWallTransaction.transaction.isActive = false;

      renderHook(() => useKeyboardHandler(mockWallTransaction, mockUndo, mockRedo));

      const event = new KeyboardEvent('keydown', {
        key: 'z',
        ctrlKey: true,
        bubbles: true,
        cancelable: true,
      });

      window.dispatchEvent(event);

      await vi.waitFor(() => {
        expect(mockUndo).toHaveBeenCalledTimes(1);
      });

      Object.defineProperty(navigator, 'platform', {
        value: originalPlatform,
        configurable: true,
      });
    });
  });

  describe('Input Field Bypass', () => {
    it('should not call undo when Ctrl+Z is pressed in an input field', async () => {
      renderHook(() => useKeyboardHandler(mockWallTransaction, mockUndo, mockRedo));

      const input = document.createElement('input');
      document.body.appendChild(input);

      const event = new KeyboardEvent('keydown', {
        key: 'z',
        ctrlKey: true,
        bubbles: true,
        cancelable: true,
      });
      Object.defineProperty(event, 'target', {
        value: input,
        configurable: true,
      });

      window.dispatchEvent(event);

      await vi.waitFor(
        () => {
          expect(mockUndo).not.toHaveBeenCalled();
        },
        { timeout: 1000 },
      );

      expect(mockUndoLocal).not.toHaveBeenCalled();

      document.body.removeChild(input);
    });
  });

  describe('Redo Shortcuts', () => {
    it('should trigger redo on Ctrl+Y', async () => {
      mockWallTransaction.transaction.isActive = false;

      renderHook(() => useKeyboardHandler(mockWallTransaction, mockUndo, mockRedo));

      const event = new KeyboardEvent('keydown', {
        key: 'y',
        ctrlKey: true,
        bubbles: true,
        cancelable: true,
      });

      window.dispatchEvent(event);

      await vi.waitFor(() => {
        expect(mockRedo).toHaveBeenCalledTimes(1);
      });
    });

    it('should trigger redo on Ctrl+Shift+Z', async () => {
      mockWallTransaction.transaction.isActive = false;

      renderHook(() => useKeyboardHandler(mockWallTransaction, mockUndo, mockRedo));

      const event = new KeyboardEvent('keydown', {
        key: 'z',
        ctrlKey: true,
        shiftKey: true,
        bubbles: true,
        cancelable: true,
      });

      window.dispatchEvent(event);

      await vi.waitFor(() => {
        expect(mockRedo).toHaveBeenCalledTimes(1);
      });
    });
  });

  describe('Event Propagation', () => {
    it('should call preventDefault for all handled shortcuts', async () => {
      mockWallTransaction.transaction.isActive = false;

      renderHook(() => useKeyboardHandler(mockWallTransaction, mockUndo, mockRedo));

      const event = new KeyboardEvent('keydown', {
        key: 'z',
        ctrlKey: true,
        bubbles: true,
        cancelable: true,
      });
      const preventDefaultSpy = vi.spyOn(event, 'preventDefault');

      window.dispatchEvent(event);

      await vi.waitFor(() => {
        expect(preventDefaultSpy).toHaveBeenCalledTimes(1);
      });
    });

    it('should call stopImmediatePropagation when routing to local', async () => {
      mockWallTransaction.transaction.isActive = true;
      mockCanUndoLocal.mockReturnValue(true);

      renderHook(() => useKeyboardHandler(mockWallTransaction, mockUndo, mockRedo));

      const event = new KeyboardEvent('keydown', {
        key: 'z',
        ctrlKey: true,
        bubbles: true,
        cancelable: true,
      });
      const stopPropagationSpy = vi.spyOn(event, 'stopImmediatePropagation');

      window.dispatchEvent(event);

      await vi.waitFor(() => {
        expect(stopPropagationSpy).toHaveBeenCalledTimes(1);
      });
    });
  });
});
