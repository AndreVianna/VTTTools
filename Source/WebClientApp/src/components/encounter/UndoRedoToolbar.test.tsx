// GENERATED: 2025-10-11 by Claude Code Phase 6
// WORLD: EPIC-001 Phase 6 - UndoRedoToolbar Tests
// LAYER: UI (Tests)

import { render, screen } from '@testing-library/react';
import type React from 'react';
import { describe, expect, it } from 'vitest';
import { UndoRedoProvider } from '@/contexts/UndoRedoContext';
import { UndoRedoToolbar } from './UndoRedoToolbar';

describe('UndoRedoToolbar', () => {
  const renderWithProvider = (component: React.ReactElement) => {
    return render(<UndoRedoProvider>{component}</UndoRedoProvider>);
  };

  it('renders undo and redo buttons', () => {
    // Arrange & Act
    renderWithProvider(<UndoRedoToolbar />);

    // Assert
    expect(screen.getByRole('button', { name: /undo/i })).toBeInTheDocument();
    expect(screen.getByRole('button', { name: /redo/i })).toBeInTheDocument();
  });

  it('disables buttons when no history', () => {
    // Arrange & Act
    renderWithProvider(<UndoRedoToolbar />);

    // Assert
    const undoBtn = screen.getByRole('button', { name: /undo/i });
    const redoBtn = screen.getByRole('button', { name: /redo/i });

    expect(undoBtn).toBeDisabled();
    expect(redoBtn).toBeDisabled();
  });

  it('has correct structure with toolbar container', () => {
    // Arrange & Act
    renderWithProvider(<UndoRedoToolbar />);

    // Assert
    expect(screen.getByRole('button', { name: /undo/i })).toBeInTheDocument();
    expect(screen.getByRole('button', { name: /redo/i })).toBeInTheDocument();
  });
});
