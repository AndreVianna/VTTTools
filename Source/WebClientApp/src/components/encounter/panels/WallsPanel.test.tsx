import { createTheme, ThemeProvider } from '@mui/material';
import { fireEvent, render, screen } from '@testing-library/react';
import { describe, expect, it, vi } from 'vitest';
import { type EncounterWall, SegmentState, SegmentType } from '@/types/domain';
import { WallsPanel } from './WallsPanel';

const theme = createTheme();

const mockEncounterWall: EncounterWall = {
  index: 0,
  name: 'Stone Wall',
  segments: [
    {
      index: 0,
      startPole: { x: 0, y: 0, h: 2.0 },
      endPole: { x: 100, y: 0, h: 2.0 },
      type: SegmentType.Wall,
      isOpaque: true,
      state: SegmentState.Visible,
    },
  ],
};

const renderComponent = (props = {}) => {
  return render(
    <ThemeProvider theme={theme}>
      <WallsPanel {...props} />
    </ThemeProvider>,
  );
};

describe('WallsPanel', () => {
  it('renders 4 wall type preset icons', () => {
    renderComponent();

    expect(screen.getByText('Wall Type Presets')).toBeInTheDocument();
    const presetButtons = screen
      .getAllByRole('button')
      .filter(
        (b) =>
          b.getAttribute('aria-label')?.includes('Normal') ||
          b.getAttribute('aria-label')?.includes('Fence') ||
          b.getAttribute('aria-label')?.includes('Invisible') ||
          b.getAttribute('aria-label')?.includes('Veil'),
      );
    expect(presetButtons.length).toBeGreaterThanOrEqual(4);
  });

  it('renders wall property controls', () => {
    renderComponent();

    expect(screen.getByLabelText(/Closed/i)).toBeInTheDocument();
    expect(screen.getByLabelText(/Height/i)).toBeInTheDocument();
  });

  it('calls onPresetSelect when preset is clicked', () => {
    const onPresetSelect = vi.fn();
    renderComponent({ onPresetSelect });

    const presetButtons = screen.getAllByRole('button');
    const firstPreset = presetButtons[0];
    expect(firstPreset).toBeTruthy();
    if (!firstPreset) throw new Error('First preset button not found');
    fireEvent.click(firstPreset);

    expect(onPresetSelect).toHaveBeenCalledWith(
      expect.objectContaining({
        segmentType: expect.any(Number),
      }),
    );
  });

  it('calls onPlaceWall when Place Wall button is clicked', () => {
    const onPlaceWall = vi.fn();
    renderComponent({ onPlaceWall });

    const placeButton = screen.getByText('Place Wall');
    fireEvent.click(placeButton);

    expect(onPlaceWall).toHaveBeenCalledWith(
      expect.objectContaining({
        segmentType: SegmentType.Wall,
        defaultHeight: 10.0,
      }),
    );
  });

  it('displays placed walls list with pole count', () => {
    renderComponent({
      encounterWalls: [mockEncounterWall],
    });

    expect(screen.getByText('Stone Wall')).toBeInTheDocument();
    expect(screen.getByText('2 poles')).toBeInTheDocument();
  });

  it('displays "No walls placed" when empty', () => {
    renderComponent({
      encounterWalls: [],
    });

    expect(screen.getByText('No walls placed')).toBeInTheDocument();
  });

  it('shows selected wall editor when wall is selected', () => {
    renderComponent({
      encounterWalls: [mockEncounterWall],
      selectedWallIndex: mockEncounterWall.index,
    });

    expect(screen.getByText('Selected Wall')).toBeInTheDocument();
    expect(screen.getByText('Edit Vertices')).toBeInTheDocument();
  });

  it('calls onWallSelect when wall is clicked in list', () => {
    const onWallSelect = vi.fn();
    renderComponent({
      encounterWalls: [mockEncounterWall],
      onWallSelect,
    });

    const wallListItem = screen.getByText('Stone Wall').closest('button');
    expect(wallListItem).toBeTruthy();
    if (!wallListItem) throw new Error('Wall list item button not found');
    fireEvent.click(wallListItem);

    expect(onWallSelect).toHaveBeenCalledWith(mockEncounterWall.index);
  });

  it('shows edit conflict dialog when placing wall while editing', async () => {
    const onPlaceWall = vi.fn();
    const onCancelEditing = vi.fn();
    renderComponent({
      isEditingVertices: true,
      onPlaceWall,
      onCancelEditing,
    });

    const placeButton = screen.getByText('Place Wall');
    fireEvent.click(placeButton);

    expect(await screen.findByText('Unsaved Edits')).toBeInTheDocument();
    expect(screen.getByText(/You have unsaved edits/i)).toBeInTheDocument();
    expect(onPlaceWall).not.toHaveBeenCalled();
  });

  it('shows edit conflict dialog when deleting wall while editing', async () => {
    const onWallDelete = vi.fn();
    const onCancelEditing = vi.fn();
    renderComponent({
      encounterWalls: [mockEncounterWall],
      isEditingVertices: true,
      onWallDelete,
      onCancelEditing,
    });

    const deleteButton = screen.getAllByRole('button').find((b) => b.querySelector('[data-testid="DeleteIcon"]'));
    expect(deleteButton).toBeTruthy();
    if (!deleteButton) throw new Error('Delete button not found');
    fireEvent.click(deleteButton);

    expect(await screen.findByText('Unsaved Edits')).toBeInTheDocument();
    expect(onWallDelete).not.toHaveBeenCalled();
  });

  it('cancels edit and proceeds with placement when edit conflict confirmed', async () => {
    const onPlaceWall = vi.fn();
    const onCancelEditing = vi.fn();
    renderComponent({
      isEditingVertices: true,
      onPlaceWall,
      onCancelEditing,
    });

    const placeButton = screen.getByText('Place Wall');
    fireEvent.click(placeButton);

    const confirmButton = await screen.findByText('Discard Changes');
    fireEvent.click(confirmButton);

    expect(onCancelEditing).toHaveBeenCalled();
    expect(onPlaceWall).toHaveBeenCalled();
  });

  it('stays in edit mode when edit conflict cancelled', async () => {
    const onPlaceWall = vi.fn();
    const onCancelEditing = vi.fn();
    renderComponent({
      isEditingVertices: true,
      onPlaceWall,
      onCancelEditing,
    });

    const placeButton = screen.getByText('Place Wall');
    fireEvent.click(placeButton);

    const cancelButton = await screen.findByText('Keep Editing');
    fireEvent.click(cancelButton);

    expect(onCancelEditing).not.toHaveBeenCalled();
    expect(onPlaceWall).not.toHaveBeenCalled();
  });

  it('places wall immediately when not editing', () => {
    const onPlaceWall = vi.fn();
    renderComponent({
      isEditingVertices: false,
      onPlaceWall,
    });

    const placeButton = screen.getByText('Place Wall');
    fireEvent.click(placeButton);

    expect(onPlaceWall).toHaveBeenCalledWith(
      expect.objectContaining({
        segmentType: SegmentType.Wall,
        defaultHeight: 10.0,
      }),
    );
  });

  it('skips edit confirmation when deleting same wall being edited', async () => {
    const onWallDelete = vi.fn();
    const onCancelEditing = vi.fn();
    const mockWall = { ...mockEncounterWall, index: 5 };

    renderComponent({
      encounterWalls: [mockWall],
      selectedWallIndex: 5,
      isEditingVertices: true,
      originalWallPoles: mockWall.segments,
      onWallDelete,
      onCancelEditing,
    });

    const deleteButton = screen.getAllByRole('button').find((b) => b.querySelector('[data-testid="DeleteIcon"]'));
    expect(deleteButton).toBeTruthy();
    if (!deleteButton) throw new Error('Delete button not found');
    fireEvent.click(deleteButton);

    expect(onCancelEditing).toHaveBeenCalled();
    expect(await screen.findByText('Delete Wall')).toBeInTheDocument();
    expect(screen.queryByText('Unsaved Edits')).not.toBeInTheDocument();
  });

  it('skips edit confirmation when deleting different wall with no changes', async () => {
    const onWallDelete = vi.fn();
    const onCancelEditing = vi.fn();
    const mockWall1 = { ...mockEncounterWall, index: 1, name: 'Wall 1' };
    const mockWall2 = { ...mockEncounterWall, index: 2, name: 'Wall 2' };

    renderComponent({
      encounterWalls: [mockWall1, mockWall2],
      selectedWallIndex: 1,
      isEditingVertices: true,
      originalWallPoles: mockWall1.segments,
      onWallDelete,
      onCancelEditing,
    });

    const deleteButtons = screen.getAllByRole('button').filter((b) => b.querySelector('[data-testid="DeleteIcon"]'));
    expect(deleteButtons.length).toBeGreaterThanOrEqual(2);
    if (!deleteButtons[1]) throw new Error('Second delete button not found');
    fireEvent.click(deleteButtons[1]);

    expect(onCancelEditing).toHaveBeenCalled();
    expect(await screen.findByText('Delete Wall')).toBeInTheDocument();
    expect(screen.queryByText('Unsaved Edits')).not.toBeInTheDocument();
  });

  it('shows edit confirmation when deleting different wall with changes', async () => {
    const onWallDelete = vi.fn();
    const onCancelEditing = vi.fn();
    const mockWall1 = { ...mockEncounterWall, index: 1, name: 'Wall 1' };
    const mockWall2 = { ...mockEncounterWall, index: 2, name: 'Wall 2' };
    const originalSegments = [
      {
        index: 0,
        startPole: { x: 0, y: 0, h: 2.0 },
        endPole: { x: 50, y: 0, h: 2.0 },
        type: SegmentType.Wall,
        state: SegmentState.Open,
      },
    ];
    const changedWall1 = {
      ...mockWall1,
      segments: [
        {
          index: 0,
          startPole: { x: 0, y: 0, h: 2.0 },
          endPole: { x: 100, y: 0, h: 2.0 },
          type: SegmentType.Wall,
          state: SegmentState.Open,
        },
      ],
    };

    renderComponent({
      encounterWalls: [changedWall1, mockWall2],
      selectedWallIndex: 1,
      isEditingVertices: true,
      originalWallPoles: originalSegments,
      onWallDelete,
      onCancelEditing,
    });

    const deleteButtons = screen.getAllByRole('button').filter((b) => b.querySelector('[data-testid="DeleteIcon"]'));
    expect(deleteButtons.length).toBeGreaterThanOrEqual(2);
    if (!deleteButtons[1]) throw new Error('Second delete button not found');
    fireEvent.click(deleteButtons[1]);

    expect(await screen.findByText('Unsaved Edits')).toBeInTheDocument();
    expect(onCancelEditing).not.toHaveBeenCalled();
    expect(screen.queryByText('Delete Wall')).not.toBeInTheDocument();
  });

  it('skips edit confirmation when placing wall with no changes', () => {
    const onPlaceWall = vi.fn();
    const onCancelEditing = vi.fn();
    const mockWall = { ...mockEncounterWall, index: 1 };

    renderComponent({
      encounterWalls: [mockWall],
      selectedWallIndex: 1,
      isEditingVertices: true,
      originalWallPoles: mockWall.segments,
      onPlaceWall,
      onCancelEditing,
    });

    const placeButton = screen.getByText('Place Wall');
    fireEvent.click(placeButton);

    expect(onCancelEditing).toHaveBeenCalled();
    expect(onPlaceWall).toHaveBeenCalled();
    expect(screen.queryByText('Unsaved Edits')).not.toBeInTheDocument();
  });

  it('shows edit confirmation when placing wall with changes', async () => {
    const onPlaceWall = vi.fn();
    const onCancelEditing = vi.fn();
    const originalSegments = [
      {
        index: 0,
        startPole: { x: 0, y: 0, h: 2.0 },
        endPole: { x: 50, y: 0, h: 2.0 },
        type: SegmentType.Wall,
        state: SegmentState.Open,
      },
    ];
    const changedWall = {
      ...mockEncounterWall,
      segments: [
        {
          index: 0,
          startPole: { x: 0, y: 0, h: 2.0 },
          endPole: { x: 100, y: 0, h: 2.0 },
          type: SegmentType.Wall,
          state: SegmentState.Open,
        },
      ],
    };

    renderComponent({
      encounterWalls: [changedWall],
      selectedWallIndex: 0,
      isEditingVertices: true,
      originalWallPoles: originalSegments,
      onPlaceWall,
      onCancelEditing,
    });

    const placeButton = screen.getByText('Place Wall');
    fireEvent.click(placeButton);

    expect(await screen.findByText('Unsaved Edits')).toBeInTheDocument();
    expect(onCancelEditing).not.toHaveBeenCalled();
    expect(onPlaceWall).not.toHaveBeenCalled();
  });
});
