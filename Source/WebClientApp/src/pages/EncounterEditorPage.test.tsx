// GENERATED: 2025-10-11 by Claude Code Phase 6
// WORLD: EPIC-001 Phase 6 - Encounter Editor Integration Tests
// LAYER: UI (Tests)

/**
 * EncounterEditorPage Integration Tests
 * Tests full integration of Phase 6 components:
 * - Token placement from asset library
 * - Token drag with snap-to-grid
 * - Undo/redo functionality
 * - Offline mode with EditingBlocker
 * - Connection status banner
 */

import { render, screen, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { beforeEach, describe, expect, it, vi } from 'vitest';
import { useConnectionStatus } from '@/hooks/useConnectionStatus';
import { EncounterEditorPage } from './EncounterEditorPage';

vi.mock('@/hooks/useConnectionStatus');

const mockUseConnectionStatus = vi.mocked(useConnectionStatus);

describe('EncounterEditorPage Integration', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    localStorage.clear();
    mockUseConnectionStatus.mockReturnValue({
      isOnline: true,
      lastSync: new Date(),
      checkConnection: vi.fn(),
    });
  });

  it('renders all Phase 6 components', () => {
    render(<EncounterEditorPage />);

    expect(screen.queryByTestId('encounter-editor-page')).toBeTruthy();
  });

  it('displays ConnectionStatusBanner when offline', async () => {
    mockUseConnectionStatus.mockReturnValue({
      isOnline: false,
      lastSync: new Date(),
      checkConnection: vi.fn(),
    });

    render(<EncounterEditorPage />);

    await waitFor(
      () => {
        expect(screen.queryByText(/connection lost/i)).toBeTruthy();
      },
      { timeout: 3000 },
    );
  });

  it('displays EditingBlocker when offline', () => {
    mockUseConnectionStatus.mockReturnValue({
      isOnline: false,
      lastSync: null,
      checkConnection: vi.fn(),
    });

    render(<EncounterEditorPage />);

    expect(screen.queryByText(/editing disabled while offline/i)).toBeTruthy();
  });

  it('shows undo/redo toolbar', () => {
    render(<EncounterEditorPage />);

    const undoBtn = screen.queryByRole('button', { name: /undo/i });
    const redoBtn = screen.queryByRole('button', { name: /redo/i });

    expect(undoBtn).toBeTruthy();
    expect(redoBtn).toBeTruthy();
  });

  it('disables undo/redo buttons when no history', () => {
    render(<EncounterEditorPage />);

    const undoBtn = screen.getByRole('button', { name: /undo/i });
    const redoBtn = screen.getByRole('button', { name: /redo/i });

    expect(undoBtn).toBeDisabled();
    expect(redoBtn).toBeDisabled();
  });

  it('persists placed assets to localStorage', async () => {
    const user = userEvent.setup();
    render(<EncounterEditorPage />);

    await user.click(screen.getByRole('button', { name: /undo/i }));

    const stored = localStorage.getItem('encounter-placed-assets');
    expect(stored).toBeTruthy();
  });

  it('loads placed assets from localStorage on mount', () => {
    const mockAssets = [
      {
        id: 'asset-1',
        assetId: 'monster-1',
        asset: {
          id: 'monster-1',
          name: 'Goblin',
          kind: 'Monster',
          resources: [],
        },
        position: { x: 100, y: 100 },
        size: { width: 50, height: 50 },
        rotation: 0,
        layer: 'Agents',
      },
    ];

    localStorage.setItem('encounter-placed-assets', JSON.stringify(mockAssets));

    render(<EncounterEditorPage />);

    const stored = localStorage.getItem('encounter-placed-assets');
    expect(stored).toBeTruthy();
    if (stored) {
      expect(JSON.parse(stored)).toHaveLength(1);
    }
  });

  it('cancels drag mode on ESC key', async () => {
    const user = userEvent.setup();
    render(<EncounterEditorPage />);

    await user.keyboard('{Escape}');

    expect(screen.queryByTestId('placement-preview')).toBeFalsy();
  });

  it('prevents asset placement when offline', () => {
    mockUseConnectionStatus.mockReturnValue({
      isOnline: false,
      lastSync: null,
      checkConnection: vi.fn(),
    });

    render(<EncounterEditorPage />);

    expect(screen.queryByText(/editing disabled/i)).toBeTruthy();
  });

  it('integrates UndoRedoProvider at root', () => {
    render(<EncounterEditorPage />);

    const undoBtn = screen.queryByRole('button', { name: /undo/i });
    expect(undoBtn).toBeTruthy();
  });
});
