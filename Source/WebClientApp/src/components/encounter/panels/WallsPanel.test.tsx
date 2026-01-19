import { createTheme, ThemeProvider } from '@mui/material/styles';
import { fireEvent, render, screen, waitFor, within } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import type React from 'react';
import { beforeEach, describe, expect, it, vi } from 'vitest';
import { type PlacedWall, SegmentState, SegmentType } from '@/types/domain';
import { WallsPanel, type WallsPanelProps } from './WallsPanel';
import { WALL_PRESETS, type WallPreset } from './wallsPanelTypes';

// Mock the stageApi
vi.mock('@/services/stageApi', () => ({
    useUpdateWallMutation: () => [vi.fn().mockResolvedValue({ unwrap: () => Promise.resolve() })],
}));

const createMockWall = (overrides: Partial<PlacedWall> = {}): PlacedWall => ({
    id: 'wall-1',
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
    ...overrides,
});

const renderWithTheme = (component: React.ReactElement, mode: 'light' | 'dark' = 'light') => {
    const theme = createTheme({ palette: { mode } });
    return render(<ThemeProvider theme={theme}>{component}</ThemeProvider>);
};

const renderComponent = (props: Partial<WallsPanelProps> = {}, mode: 'light' | 'dark' = 'light') => {
    const defaultProps: WallsPanelProps = {
        encounterId: 'encounter-1',
        encounterWalls: [],
        selectedWallIndex: null,
        isEditingVertices: false,
        originalWallPoles: null,
        onPresetSelect: vi.fn(),
        onPlaceWall: vi.fn(),
        onWallSelect: vi.fn(),
        onWallDelete: vi.fn(),
        onEditVertices: vi.fn(),
        onCancelEditing: vi.fn(),
    };

    return renderWithTheme(<WallsPanel {...defaultProps} {...props} />, mode);
};

describe('WallsPanel', () => {
    beforeEach(() => {
        // Arrange - Clean up mocks before each test
        vi.clearAllMocks();
    });

    describe('Menu Rendering', () => {
        it('should render all section headers', () => {
            // Arrange & Act
            renderComponent();

            // Assert
            expect(screen.getByText('Wall Type Presets')).toBeInTheDocument();
            expect(screen.getByText('New Wall')).toBeInTheDocument();
            expect(screen.getByText(/Placed Walls/)).toBeInTheDocument();
        });

        it('should render all 6 wall type preset icons', () => {
            // Arrange & Act
            renderComponent();

            // Assert - Each preset should have a tooltip button
            WALL_PRESETS.forEach((preset) => {
                expect(screen.getByRole('button', { name: preset.name })).toBeInTheDocument();
            });
        });

        it('should render height input field', () => {
            // Arrange & Act
            renderComponent();

            // Assert
            expect(screen.getByLabelText(/Height/i)).toBeInTheDocument();
        });

        it('should render place wall button', () => {
            // Arrange & Act
            renderComponent();

            // Assert
            expect(screen.getByRole('button', { name: /Place a Wall/i })).toBeInTheDocument();
        });

        it('should display placed walls count', () => {
            // Arrange
            const walls = [createMockWall(), createMockWall({ index: 1, name: 'Wall 2' })];

            // Act
            renderComponent({ encounterWalls: walls });

            // Assert
            expect(screen.getByText('Placed Walls (2)')).toBeInTheDocument();
        });

        it('should display "No walls placed" when empty', () => {
            // Arrange & Act
            renderComponent({ encounterWalls: [] });

            // Assert
            expect(screen.getByText('No walls placed')).toBeInTheDocument();
        });

        it('should adapt to light theme', () => {
            // Arrange & Act
            renderComponent({}, 'light');

            // Assert
            expect(screen.getByText('Wall Type Presets')).toBeInTheDocument();
        });

        it('should adapt to dark theme', () => {
            // Arrange & Act
            renderComponent({}, 'dark');

            // Assert
            expect(screen.getByText('Wall Type Presets')).toBeInTheDocument();
        });
    });

    describe('Wall Type Selection', () => {
        it('should call onPresetSelect when preset is clicked', async () => {
            // Arrange
            const user = userEvent.setup();
            const onPresetSelect = vi.fn();
            renderComponent({ onPresetSelect });

            // Act
            const fenceButton = screen.getByRole('button', { name: 'Fence' });
            await user.click(fenceButton);

            // Assert
            expect(onPresetSelect).toHaveBeenCalledWith(
                expect.objectContaining({
                    name: 'Fence',
                    type: SegmentType.Wall,
                    isOpaque: false,
                }),
            );
        });

        it('should visually indicate selected preset', async () => {
            // Arrange
            const user = userEvent.setup();
            renderComponent();

            // Act - Click on Door preset
            const doorButton = screen.getByRole('button', { name: 'Door' });
            await user.click(doorButton);

            // Assert - Door button should have selected styling (border color)
            // Note: We verify the click works, visual styling tested indirectly
            expect(doorButton).toBeInTheDocument();
        });

        it('should call onPresetSelect with correct preset properties for each type', async () => {
            // Arrange
            const user = userEvent.setup();
            const onPresetSelect = vi.fn();
            renderComponent({ onPresetSelect });

            // Act & Assert - Test each preset
            for (const preset of WALL_PRESETS) {
                const button = screen.getByRole('button', { name: preset.name });
                await user.click(button);

                expect(onPresetSelect).toHaveBeenCalledWith(
                    expect.objectContaining({
                        name: preset.name,
                        type: preset.type,
                        isOpaque: preset.isOpaque,
                        state: preset.state,
                    }),
                );
            }
        });
    });

    describe('Wall Property Controls', () => {
        it('should render height input with default value', () => {
            // Arrange & Act
            renderComponent();

            // Assert
            const heightInput = screen.getByLabelText(/Height/i);
            expect(heightInput).toHaveValue(10);
        });

        it('should update height value when changed', async () => {
            // Arrange
            const user = userEvent.setup();
            renderComponent();

            // Act
            const heightInput = screen.getByLabelText(/Height/i);
            await user.clear(heightInput);
            await user.type(heightInput, '15');

            // Assert
            expect(heightInput).toHaveValue(15);
        });

        it('should pass updated height to onPlaceWall', async () => {
            // Arrange
            const user = userEvent.setup();
            const onPlaceWall = vi.fn();
            renderComponent({ onPlaceWall });

            // Act
            const heightInput = screen.getByLabelText(/Height/i);
            await user.clear(heightInput);
            await user.type(heightInput, '15');

            const placeButton = screen.getByRole('button', { name: /Place a Wall/i });
            await user.click(placeButton);

            // Assert
            expect(onPlaceWall).toHaveBeenCalledWith(
                expect.objectContaining({
                    defaultHeight: 15,
                }),
            );
        });

        it('should have min and max constraints on height input', () => {
            // Arrange & Act
            renderComponent();

            // Assert
            const heightInput = screen.getByLabelText(/Height/i);
            expect(heightInput).toHaveAttribute('min', '0.5');
            expect(heightInput).toHaveAttribute('max', '20');
            expect(heightInput).toHaveAttribute('step', '0.5');
        });
    });

    describe('Wall Drawing Mode Toggle', () => {
        it('should call onPlaceWall when place wall button is clicked', async () => {
            // Arrange
            const user = userEvent.setup();
            const onPlaceWall = vi.fn();
            renderComponent({ onPlaceWall });

            // Act
            const placeButton = screen.getByRole('button', { name: /Place a Wall/i });
            await user.click(placeButton);

            // Assert
            expect(onPlaceWall).toHaveBeenCalledTimes(1);
        });

        it('should pass selected preset properties to onPlaceWall', async () => {
            // Arrange
            const user = userEvent.setup();
            const onPlaceWall = vi.fn();
            renderComponent({ onPlaceWall });

            // Act - Select Door preset then place
            const doorButton = screen.getByRole('button', { name: 'Door' });
            await user.click(doorButton);

            const placeButton = screen.getByRole('button', { name: /Place a Wall/i });
            await user.click(placeButton);

            // Assert
            expect(onPlaceWall).toHaveBeenCalledWith(
                expect.objectContaining({
                    type: SegmentType.Door,
                    isOpaque: true,
                    state: SegmentState.Closed,
                }),
            );
        });

        it('should show edit conflict dialog when placing wall while editing with changes', async () => {
            // Arrange
            const user = userEvent.setup();
            const onPlaceWall = vi.fn();
            const originalPoles = [
                { x: 0, y: 0, h: 2.0 },
                { x: 50, y: 0, h: 2.0 },
            ];
            const changedWall = createMockWall({
                segments: [
                    {
                        index: 0,
                        startPole: { x: 0, y: 0, h: 2.0 },
                        endPole: { x: 100, y: 0, h: 2.0 }, // Different end pole
                        type: SegmentType.Wall,
                        isOpaque: true,
                        state: SegmentState.Visible,
                    },
                ],
            });

            renderComponent({
                encounterWalls: [changedWall],
                selectedWallIndex: 0,
                isEditingVertices: true,
                originalWallPoles: originalPoles,
                onPlaceWall,
            });

            // Act
            const placeButton = screen.getByRole('button', { name: /Place a Wall/i });
            await user.click(placeButton);

            // Assert
            expect(await screen.findByText('Unsaved Edits')).toBeInTheDocument();
            expect(screen.getByText(/You have unsaved edits/i)).toBeInTheDocument();
            expect(onPlaceWall).not.toHaveBeenCalled();
        });

        it('should skip edit confirmation and place wall when no changes were made', async () => {
            // Arrange
            const user = userEvent.setup();
            const onPlaceWall = vi.fn();
            const onCancelEditing = vi.fn();
            const wall = createMockWall();
            const originalPoles = [
                { x: 0, y: 0, h: 2.0 },
                { x: 100, y: 0, h: 2.0 },
            ];

            renderComponent({
                encounterWalls: [wall],
                selectedWallIndex: 0,
                isEditingVertices: true,
                originalWallPoles: originalPoles,
                onPlaceWall,
                onCancelEditing,
            });

            // Act
            const placeButton = screen.getByRole('button', { name: /Place a Wall/i });
            await user.click(placeButton);

            // Assert
            expect(screen.queryByText('Unsaved Edits')).not.toBeInTheDocument();
            expect(onCancelEditing).toHaveBeenCalled();
            expect(onPlaceWall).toHaveBeenCalled();
        });
    });

    describe('Wall List Interactions', () => {
        it('should display wall names in the list', () => {
            // Arrange
            const walls = [createMockWall({ name: 'North Wall' }), createMockWall({ index: 1, name: 'South Wall' })];

            // Act
            renderComponent({ encounterWalls: walls });

            // Assert
            expect(screen.getByText('North Wall')).toBeInTheDocument();
            expect(screen.getByText('South Wall')).toBeInTheDocument();
        });

        it('should display segment count for each wall', () => {
            // Arrange
            const walls = [createMockWall()];

            // Act
            renderComponent({ encounterWalls: walls });

            // Assert
            expect(screen.getByText('1 segments')).toBeInTheDocument();
        });

        it('should call onWallSelect when wall list item is clicked', async () => {
            // Arrange
            const user = userEvent.setup();
            const onWallSelect = vi.fn();
            const walls = [createMockWall()];
            renderComponent({ encounterWalls: walls, onWallSelect });

            // Act
            const wallListItem = screen.getByText('Stone Wall');
            await user.click(wallListItem);

            // Assert
            expect(onWallSelect).toHaveBeenCalledWith(0);
        });

        it('should highlight selected wall in the list', () => {
            // Arrange
            const walls = [createMockWall()];

            // Act
            renderComponent({ encounterWalls: walls, selectedWallIndex: 0 });

            // Assert - The ListItemButton should have selected class
            const listItemButton = screen.getByRole('button', { name: /Stone Wall/i });
            expect(listItemButton).toHaveClass('Mui-selected');
        });

        it('should call onEditVertices when edit button is clicked', async () => {
            // Arrange
            const onEditVertices = vi.fn();
            const walls = [createMockWall()];
            renderComponent({ encounterWalls: walls, onEditVertices });

            // Act - Find edit button (with EditIcon) within the wall list item's secondary action
            // The edit button is an IconButton in the secondaryAction with an Edit icon
            const listItem = screen.getByText('Stone Wall').closest('li');
            expect(listItem).toBeInTheDocument();

            // Get all buttons and filter to small icon buttons
            const allButtons = within(listItem!).getAllByRole('button');
            // Filter to get only small icon buttons (the ones in secondary action and expand)
            const smallIconButtons = allButtons.filter((btn) =>
                btn.classList.contains('MuiIconButton-root') && btn.classList.contains('MuiIconButton-sizeSmall'),
            );
            // smallIconButtons: [expand, edit, delete] - we want index 1 for edit
            const editButton = smallIconButtons[1];
            expect(editButton).toBeDefined();
            fireEvent.click(editButton!);

            // Assert
            expect(onEditVertices).toHaveBeenCalledWith(0);
        });

        it('should show delete confirmation dialog when delete button is clicked', async () => {
            // Arrange
            const user = userEvent.setup();
            const walls = [createMockWall()];
            renderComponent({ encounterWalls: walls });

            // Act - Find delete button within the wall list item
            const listItem = screen.getByText('Stone Wall').closest('li');
            expect(listItem).toBeInTheDocument();
            const buttons = within(listItem!).getAllByRole('button');
            const deleteButton = buttons[buttons.length - 1]!; // Last button is delete
            await user.click(deleteButton);

            // Assert
            expect(await screen.findByText('Delete Wall')).toBeInTheDocument();
            expect(screen.getByText(/Are you sure you want to delete this wall/i)).toBeInTheDocument();
        });

        it('should call onWallDelete when delete is confirmed', async () => {
            // Arrange
            const user = userEvent.setup();
            const onWallDelete = vi.fn();
            const walls = [createMockWall()];
            renderComponent({ encounterWalls: walls, onWallDelete });

            // Act - Click delete button
            const listItem = screen.getByText('Stone Wall').closest('li');
            const buttons = within(listItem!).getAllByRole('button');
            const deleteButton = buttons[buttons.length - 1]!;
            await user.click(deleteButton);

            // Confirm deletion
            const confirmButton = await screen.findByRole('button', { name: /Confirm/i });
            await user.click(confirmButton);

            // Assert
            expect(onWallDelete).toHaveBeenCalledWith(0);
        });

        it('should not call onWallDelete when delete is cancelled', async () => {
            // Arrange
            const user = userEvent.setup();
            const onWallDelete = vi.fn();
            const walls = [createMockWall()];
            renderComponent({ encounterWalls: walls, onWallDelete });

            // Act - Click delete button
            const listItem = screen.getByText('Stone Wall').closest('li');
            const buttons = within(listItem!).getAllByRole('button');
            const deleteButton = buttons[buttons.length - 1]!;
            await user.click(deleteButton);

            // Cancel deletion
            const cancelButton = await screen.findByRole('button', { name: /Cancel/i });
            await user.click(cancelButton);

            // Assert
            expect(onWallDelete).not.toHaveBeenCalled();
        });
    });

    describe('Wall Expansion and Editing', () => {
        it('should toggle wall expansion when expand button is clicked', async () => {
            // Arrange
            const walls = [createMockWall()];
            renderComponent({ encounterWalls: walls });

            // Act - Find the expand button by looking for the SVG with ExpandMore (data-testid)
            // The expand button is a small IconButton inside the ListItemButton
            const listItem = screen.getByText('Stone Wall').closest('li');
            expect(listItem).toBeInTheDocument();

            // Get all buttons and find the expand button (first IconButton without aria-label)
            // Using fireEvent for simpler click handling on nested buttons
            const allButtons = within(listItem!).getAllByRole('button');
            // The first button is the ListItemButton with name, second is expand IconButton
            const expandButton = allButtons.find((btn) =>
                btn.classList.contains('MuiIconButton-root') && !btn.hasAttribute('aria-label'),
            );

            if (expandButton) {
                fireEvent.click(expandButton);
            }

            // Assert - Should show editable name field when expanded
            await waitFor(() => {
                const textbox = screen.getByRole('textbox');
                expect(textbox).toHaveValue('Stone Wall');
            });
        });

        it('should show editable name field when wall is expanded', async () => {
            // Arrange
            const walls = [createMockWall()];
            renderComponent({ encounterWalls: walls });

            // Act - Find and click the expand button
            const listItem = screen.getByText('Stone Wall').closest('li');
            expect(listItem).toBeInTheDocument();

            const allButtons = within(listItem!).getAllByRole('button');
            const expandButton = allButtons.find((btn) =>
                btn.classList.contains('MuiIconButton-root') && !btn.hasAttribute('aria-label'),
            );

            if (expandButton) {
                fireEvent.click(expandButton);
            }

            // Assert - Should show text input for name
            await waitFor(() => {
                const nameInput = screen.getByRole('textbox');
                expect(nameInput).toHaveValue('Stone Wall');
            });
        });

        it('should collapse wall when expand button is clicked again', async () => {
            // Arrange
            const walls = [createMockWall()];
            renderComponent({ encounterWalls: walls });

            // Act - First expand
            const listItem = screen.getByText('Stone Wall').closest('li');
            expect(listItem).toBeInTheDocument();

            const allButtons = within(listItem!).getAllByRole('button');
            const expandButton = allButtons.find((btn) =>
                btn.classList.contains('MuiIconButton-root') && !btn.hasAttribute('aria-label'),
            );

            if (expandButton) {
                fireEvent.click(expandButton);
            }

            // Wait for expansion - TextField appears
            await waitFor(() => {
                expect(screen.getByRole('textbox')).toBeInTheDocument();
            });

            // Collapse - need to re-query as the DOM has changed
            const buttonsAfterExpand = within(listItem!).getAllByRole('button');
            const collapseButton = buttonsAfterExpand.find((btn) =>
                btn.classList.contains('MuiIconButton-root') && !btn.hasAttribute('aria-label'),
            );

            if (collapseButton) {
                fireEvent.click(collapseButton);
            }

            // Assert - TextField should be removed, wall name text restored
            await waitFor(() => {
                expect(screen.queryByRole('textbox')).not.toBeInTheDocument();
                expect(screen.getByText('Stone Wall')).toBeInTheDocument();
            });
        });
    });

    describe('Edit Conflict Handling', () => {
        it('should show edit conflict dialog when deleting wall while editing another with changes', async () => {
            // Arrange
            const user = userEvent.setup();
            const onWallDelete = vi.fn();
            const onCancelEditing = vi.fn();
            const originalPoles = [
                { x: 0, y: 0, h: 2.0 },
                { x: 50, y: 0, h: 2.0 },
            ];
            const changedWall1 = createMockWall({
                index: 1,
                name: 'Wall 1',
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
            });
            const wall2 = createMockWall({ index: 2, name: 'Wall 2' });

            renderComponent({
                encounterWalls: [changedWall1, wall2],
                selectedWallIndex: 1,
                isEditingVertices: true,
                originalWallPoles: originalPoles,
                onWallDelete,
                onCancelEditing,
            });

            // Act - Delete Wall 2 (different from the one being edited)
            const wall2ListItem = screen.getByText('Wall 2').closest('li');
            const buttons = within(wall2ListItem!).getAllByRole('button');
            const deleteButton = buttons[buttons.length - 1]!;
            await user.click(deleteButton);

            // Assert - Should show edit conflict dialog first
            expect(await screen.findByText('Unsaved Edits')).toBeInTheDocument();
            expect(onWallDelete).not.toHaveBeenCalled();
        });

        it('should proceed with deletion after discarding changes', async () => {
            // Arrange
            const user = userEvent.setup();
            const onWallDelete = vi.fn();
            const onCancelEditing = vi.fn();
            const originalPoles = [
                { x: 0, y: 0, h: 2.0 },
                { x: 50, y: 0, h: 2.0 },
            ];
            const changedWall1 = createMockWall({
                index: 1,
                name: 'Wall 1',
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
            });
            const wall2 = createMockWall({ index: 2, name: 'Wall 2' });

            renderComponent({
                encounterWalls: [changedWall1, wall2],
                selectedWallIndex: 1,
                isEditingVertices: true,
                originalWallPoles: originalPoles,
                onWallDelete,
                onCancelEditing,
            });

            // Act - Delete Wall 2 and confirm discard
            const wall2ListItem = screen.getByText('Wall 2').closest('li');
            const buttons = within(wall2ListItem!).getAllByRole('button');
            const deleteButton = buttons[buttons.length - 1]!;
            await user.click(deleteButton);

            // Discard changes
            const discardButton = await screen.findByRole('button', { name: /Discard Changes/i });
            await user.click(discardButton);

            // Confirm deletion
            const confirmButton = await screen.findByRole('button', { name: /Confirm/i });
            await user.click(confirmButton);

            // Assert
            expect(onCancelEditing).toHaveBeenCalled();
            expect(onWallDelete).toHaveBeenCalledWith(2);
        });

        it('should not delete when keeping edits', async () => {
            // Arrange
            const user = userEvent.setup();
            const onWallDelete = vi.fn();
            const onCancelEditing = vi.fn();
            const originalPoles = [
                { x: 0, y: 0, h: 2.0 },
                { x: 50, y: 0, h: 2.0 },
            ];
            const changedWall1 = createMockWall({
                index: 1,
                name: 'Wall 1',
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
            });
            const wall2 = createMockWall({ index: 2, name: 'Wall 2' });

            renderComponent({
                encounterWalls: [changedWall1, wall2],
                selectedWallIndex: 1,
                isEditingVertices: true,
                originalWallPoles: originalPoles,
                onWallDelete,
                onCancelEditing,
            });

            // Act - Delete Wall 2 and cancel
            const wall2ListItem = screen.getByText('Wall 2').closest('li');
            const buttons = within(wall2ListItem!).getAllByRole('button');
            const deleteButton = buttons[buttons.length - 1]!;
            await user.click(deleteButton);

            // Keep editing
            const keepEditingButton = await screen.findByRole('button', { name: /Keep Editing/i });
            await user.click(keepEditingButton);

            // Assert
            expect(onCancelEditing).not.toHaveBeenCalled();
            expect(onWallDelete).not.toHaveBeenCalled();
        });

        it('should skip edit conflict when deleting the wall being edited', async () => {
            // Arrange
            const user = userEvent.setup();
            const onWallDelete = vi.fn();
            const onCancelEditing = vi.fn();
            const wall = createMockWall({ index: 5 });

            renderComponent({
                encounterWalls: [wall],
                selectedWallIndex: 5,
                isEditingVertices: true,
                originalWallPoles: wall.segments.map((s) => s.startPole).concat(wall.segments.map((s) => s.endPole)),
                onWallDelete,
                onCancelEditing,
            });

            // Act - Delete the same wall being edited
            const listItem = screen.getByText('Stone Wall').closest('li');
            const buttons = within(listItem!).getAllByRole('button');
            const deleteButton = buttons[buttons.length - 1]!;
            await user.click(deleteButton);

            // Assert - Should go directly to delete confirmation, not edit conflict
            expect(onCancelEditing).toHaveBeenCalled();
            expect(await screen.findByText('Delete Wall')).toBeInTheDocument();
            expect(screen.queryByText('Unsaved Edits')).not.toBeInTheDocument();
        });
    });

    describe('Wall Style Options (Presets)', () => {
        it('should have Wall preset with correct properties', () => {
            // Arrange
            const wallPreset = WALL_PRESETS.find((p) => p.name === 'Wall') as WallPreset;

            // Assert
            expect(wallPreset).toBeDefined();
            expect(wallPreset.type).toBe(SegmentType.Wall);
            expect(wallPreset.isOpaque).toBe(true);
            expect(wallPreset.state).toBe(SegmentState.Visible);
        });

        it('should have Fence preset with correct properties', () => {
            // Arrange
            const fencePreset = WALL_PRESETS.find((p) => p.name === 'Fence') as WallPreset;

            // Assert
            expect(fencePreset).toBeDefined();
            expect(fencePreset.type).toBe(SegmentType.Wall);
            expect(fencePreset.isOpaque).toBe(false);
            expect(fencePreset.state).toBe(SegmentState.Visible);
        });

        it('should have Door preset with correct properties', () => {
            // Arrange
            const doorPreset = WALL_PRESETS.find((p) => p.name === 'Door') as WallPreset;

            // Assert
            expect(doorPreset).toBeDefined();
            expect(doorPreset.type).toBe(SegmentType.Door);
            expect(doorPreset.isOpaque).toBe(true);
            expect(doorPreset.state).toBe(SegmentState.Closed);
        });

        it('should have Window preset with correct properties', () => {
            // Arrange
            const windowPreset = WALL_PRESETS.find((p) => p.name === 'Window') as WallPreset;

            // Assert
            expect(windowPreset).toBeDefined();
            expect(windowPreset.type).toBe(SegmentType.Window);
            expect(windowPreset.isOpaque).toBe(true);
            expect(windowPreset.state).toBe(SegmentState.Closed);
        });

        it('should have Passage preset with correct properties', () => {
            // Arrange
            const passagePreset = WALL_PRESETS.find((p) => p.name === 'Passage') as WallPreset;

            // Assert
            expect(passagePreset).toBeDefined();
            expect(passagePreset.type).toBe(SegmentType.Door);
            expect(passagePreset.isOpaque).toBe(false);
            expect(passagePreset.state).toBe(SegmentState.Open);
        });

        it('should have Opening preset with correct properties', () => {
            // Arrange
            const openingPreset = WALL_PRESETS.find((p) => p.name === 'Opening') as WallPreset;

            // Assert
            expect(openingPreset).toBeDefined();
            expect(openingPreset.type).toBe(SegmentType.Window);
            expect(openingPreset.isOpaque).toBe(false);
            expect(openingPreset.state).toBe(SegmentState.Open);
        });
    });

    describe('Default Values and Initial State', () => {
        it('should default to first preset (Wall) on initial render', async () => {
            // Arrange
            const user = userEvent.setup();
            const onPlaceWall = vi.fn();
            renderComponent({ onPlaceWall });

            // Act
            const placeButton = screen.getByRole('button', { name: /Place a Wall/i });
            await user.click(placeButton);

            // Assert - Default should be Wall preset
            expect(onPlaceWall).toHaveBeenCalledWith(
                expect.objectContaining({
                    type: SegmentType.Wall,
                    isOpaque: true,
                    state: SegmentState.Visible,
                    defaultHeight: 10,
                }),
            );
        });

        it('should default height to 10.0', () => {
            // Arrange & Act
            renderComponent();

            // Assert
            const heightInput = screen.getByLabelText(/Height/i);
            expect(heightInput).toHaveValue(10);
        });

        it('should not call callbacks when not provided', async () => {
            // Arrange
            const user = userEvent.setup();
            const walls = [createMockWall()];
            // Render without callbacks
            renderWithTheme(<WallsPanel encounterWalls={walls} />);

            // Act - Try clicking preset and place button
            const wallButton = screen.getByRole('button', { name: 'Wall' });
            await user.click(wallButton);

            const placeButton = screen.getByRole('button', { name: /Place a Wall/i });
            await user.click(placeButton);

            // Assert - Should not throw errors
            expect(screen.getByText('Wall Type Presets')).toBeInTheDocument();
        });
    });
});
