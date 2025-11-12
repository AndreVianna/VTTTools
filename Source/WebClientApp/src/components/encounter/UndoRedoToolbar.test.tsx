// GENERATED: 2025-10-11 by Claude Code Phase 6
// WORLD: EPIC-001 Phase 6 - UndoRedoToolbar Tests
// LAYER: UI (Tests)

import { render } from '@testing-library/react';
import type React from 'react';
import { describe, expect, it } from 'vitest';
import { UndoRedoProvider } from '@/contexts/UndoRedoContext';
import { UndoRedoToolbar } from './UndoRedoToolbar';

describe('UndoRedoToolbar', () => {
  const renderWithProvider = (component: React.ReactElement) => {
    return render(<UndoRedoProvider>{component}</UndoRedoProvider>);
  };

  it('renders undo and redo buttons', () => {
    renderWithProvider(<UndoRedoToolbar />);

    expect(document.querySelector('#btn-undo')).toBeTruthy();
    expect(document.querySelector('#btn-redo')).toBeTruthy();
  });

  it('disables buttons when no history', () => {
    renderWithProvider(<UndoRedoToolbar />);

    const undoBtn = document.querySelector('#btn-undo') as HTMLButtonElement;
    const redoBtn = document.querySelector('#btn-redo') as HTMLButtonElement;

    expect(undoBtn?.disabled).toBe(true);
    expect(redoBtn?.disabled).toBe(true);
  });

  it('has correct IDs for testing', () => {
    renderWithProvider(<UndoRedoToolbar />);

    expect(document.querySelector('#undo-redo-toolbar')).toBeTruthy();
    expect(document.querySelector('#btn-undo')).toBeTruthy();
    expect(document.querySelector('#btn-redo')).toBeTruthy();
  });
});
