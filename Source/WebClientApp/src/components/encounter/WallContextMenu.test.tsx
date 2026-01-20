import { render, screen, waitFor, within } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';
import { type EncounterWall, type EncounterWallSegment, SegmentState, SegmentType } from '@/types/domain';
import { WallContextMenu } from './WallContextMenu';

describe('WallContextMenu', () => {
    // Arrange: Create mock wall segments for tests
    const createMockSegment = (overrides: Partial<EncounterWallSegment> = {}): EncounterWallSegment => ({
        index: 0,
        name: undefined,
        startPole: { x: 0, y: 0, h: 10 },
        endPole: { x: 100, y: 100, h: 10 },
        type: SegmentType.Wall,
        isOpaque: true,
        state: SegmentState.Closed,
        ...overrides,
    });

    const createMockWall = (segments: EncounterWallSegment[] = [createMockSegment()]): EncounterWall => ({
        index: 0,
        name: 'Test Wall',
        segments,
    });

    const defaultProps = {
        anchorPosition: { left: 100, top: 100 },
        open: true,
        onClose: vi.fn<() => void>(),
        encounterWall: createMockWall(),
        segmentIndex: 0,
        onSegmentUpdate: vi.fn<(wallIndex: number, segmentIndex: number, updates: Partial<EncounterWallSegment>) => void>(),
    };

    beforeEach(() => {
        vi.clearAllMocks();
    });

    afterEach(() => {
        vi.clearAllMocks();
    });

    describe('Menu Rendering', () => {
        it('should render segment title when open with valid segment', () => {
            // Arrange
            render(<WallContextMenu {...defaultProps} />);

            // Assert
            expect(screen.getByText('Wall 1')).toBeInTheDocument();
        });

        it('should render custom segment name when provided', () => {
            // Arrange
            const wall = createMockWall([createMockSegment({ name: 'Main Entrance' })]);
            render(<WallContextMenu {...defaultProps} encounterWall={wall} />);

            // Assert
            expect(screen.getByText('Main Entrance')).toBeInTheDocument();
        });

        it('should render type and state dropdowns', () => {
            // Arrange
            render(<WallContextMenu {...defaultProps} />);

            // Assert
            expect(screen.getByText('Type:')).toBeInTheDocument();
            expect(screen.getByText('State:')).toBeInTheDocument();
        });

        it('should not render when encounterWall is null', () => {
            // Arrange
            render(<WallContextMenu {...defaultProps} encounterWall={null} />);

            // Assert
            expect(screen.queryByText('Type:')).not.toBeInTheDocument();
            expect(screen.queryByText('State:')).not.toBeInTheDocument();
        });

        it('should not render segment content when segmentIndex is null', () => {
            // Arrange
            render(<WallContextMenu {...defaultProps} segmentIndex={null} />);

            // Assert
            expect(screen.queryByText('Wall 1')).not.toBeInTheDocument();
        });

        it('should not render segment content when segment not found', () => {
            // Arrange
            render(<WallContextMenu {...defaultProps} segmentIndex={999} />);

            // Assert
            expect(screen.queryByText('Type:')).not.toBeInTheDocument();
        });
    });

    describe('Visual Type Display', () => {
        it('should display Wall type for opaque wall segment', () => {
            // Arrange
            const wall = createMockWall([
                createMockSegment({ type: SegmentType.Wall, isOpaque: true }),
            ]);
            render(<WallContextMenu {...defaultProps} encounterWall={wall} />);

            // Assert
            const typeCombobox = screen.getAllByRole('combobox')[0];
            expect(typeCombobox).toHaveTextContent('Wall');
        });

        it('should display Fence type for non-opaque wall segment', () => {
            // Arrange
            const wall = createMockWall([
                createMockSegment({ type: SegmentType.Wall, isOpaque: false }),
            ]);
            render(<WallContextMenu {...defaultProps} encounterWall={wall} />);

            // Assert
            const typeCombobox = screen.getAllByRole('combobox')[0];
            expect(typeCombobox).toHaveTextContent('Fence');
        });

        it('should display Door type for opaque door segment', () => {
            // Arrange
            const wall = createMockWall([
                createMockSegment({ type: SegmentType.Door, isOpaque: true }),
            ]);
            render(<WallContextMenu {...defaultProps} encounterWall={wall} />);

            // Assert
            const typeCombobox = screen.getAllByRole('combobox')[0];
            expect(typeCombobox).toHaveTextContent('Door');
        });

        it('should display Passage type for non-opaque door segment', () => {
            // Arrange
            const wall = createMockWall([
                createMockSegment({ type: SegmentType.Door, isOpaque: false }),
            ]);
            render(<WallContextMenu {...defaultProps} encounterWall={wall} />);

            // Assert
            const typeCombobox = screen.getAllByRole('combobox')[0];
            expect(typeCombobox).toHaveTextContent('Passage');
        });

        it('should display Window type for opaque window segment', () => {
            // Arrange
            const wall = createMockWall([
                createMockSegment({ type: SegmentType.Window, isOpaque: true }),
            ]);
            render(<WallContextMenu {...defaultProps} encounterWall={wall} />);

            // Assert
            const typeCombobox = screen.getAllByRole('combobox')[0];
            expect(typeCombobox).toHaveTextContent('Window');
        });

        it('should display Opening type for non-opaque window segment', () => {
            // Arrange
            const wall = createMockWall([
                createMockSegment({ type: SegmentType.Window, isOpaque: false }),
            ]);
            render(<WallContextMenu {...defaultProps} encounterWall={wall} />);

            // Assert
            const typeCombobox = screen.getAllByRole('combobox')[0];
            expect(typeCombobox).toHaveTextContent('Opening');
        });
    });

    describe('Visual Type Selection', () => {
        it('should show all visual type options when type dropdown is clicked', async () => {
            // Arrange
            const user = userEvent.setup();
            render(<WallContextMenu {...defaultProps} />);

            // Act
            const typeCombobox = screen.getAllByRole('combobox')[0]!;
            await user.click(typeCombobox);

            // Assert
            const listbox = await screen.findByRole('listbox');
            expect(within(listbox).getByRole('option', { name: 'Wall' })).toBeInTheDocument();
            expect(within(listbox).getByRole('option', { name: 'Fence' })).toBeInTheDocument();
            expect(within(listbox).getByRole('option', { name: 'Door' })).toBeInTheDocument();
            expect(within(listbox).getByRole('option', { name: 'Passage' })).toBeInTheDocument();
            expect(within(listbox).getByRole('option', { name: 'Window' })).toBeInTheDocument();
            expect(within(listbox).getByRole('option', { name: 'Opening' })).toBeInTheDocument();
        });

        it('should call onSegmentUpdate when visual type is changed to Door', async () => {
            // Arrange
            const user = userEvent.setup();
            const onSegmentUpdate = vi.fn<(wallIndex: number, segmentIndex: number, updates: Partial<EncounterWallSegment>) => void>();
            render(<WallContextMenu {...defaultProps} onSegmentUpdate={onSegmentUpdate} />);

            // Act
            const typeCombobox = screen.getAllByRole('combobox')[0]!;
            await user.click(typeCombobox);
            const listbox = await screen.findByRole('listbox');
            await user.click(within(listbox).getByRole('option', { name: 'Door' }));

            // Assert
            await waitFor(() => {
                expect(onSegmentUpdate).toHaveBeenCalledWith(0, 0, {
                    type: SegmentType.Door,
                    isOpaque: true,
                    state: SegmentState.Closed,
                });
            });
        });

        it('should call onSegmentUpdate with isOpaque false when Fence is selected', async () => {
            // Arrange
            const user = userEvent.setup();
            const onSegmentUpdate = vi.fn<(wallIndex: number, segmentIndex: number, updates: Partial<EncounterWallSegment>) => void>();
            render(<WallContextMenu {...defaultProps} onSegmentUpdate={onSegmentUpdate} />);

            // Act
            const typeCombobox = screen.getAllByRole('combobox')[0]!;
            await user.click(typeCombobox);
            const listbox = await screen.findByRole('listbox');
            await user.click(within(listbox).getByRole('option', { name: 'Fence' }));

            // Assert
            await waitFor(() => {
                expect(onSegmentUpdate).toHaveBeenCalledWith(0, 0, {
                    type: SegmentType.Wall,
                    isOpaque: false,
                    state: SegmentState.Closed,
                });
            });
        });

        it('should normalize state when changing from Door to Wall type', async () => {
            // Arrange
            const user = userEvent.setup();
            const onSegmentUpdate = vi.fn<(wallIndex: number, segmentIndex: number, updates: Partial<EncounterWallSegment>) => void>();
            const wall = createMockWall([
                createMockSegment({
                    type: SegmentType.Door,
                    isOpaque: true,
                    state: SegmentState.Open,
                }),
            ]);
            render(<WallContextMenu {...defaultProps} encounterWall={wall} onSegmentUpdate={onSegmentUpdate} />);

            // Act
            const typeCombobox = screen.getAllByRole('combobox')[0]!;
            await user.click(typeCombobox);
            const listbox = await screen.findByRole('listbox');
            await user.click(within(listbox).getByRole('option', { name: 'Wall' }));

            // Assert - Open is not valid for Wall, should normalize to Closed
            await waitFor(() => {
                expect(onSegmentUpdate).toHaveBeenCalledWith(0, 0, {
                    type: SegmentType.Wall,
                    isOpaque: true,
                    state: SegmentState.Closed,
                });
            });
        });

        it('should not call onSegmentUpdate when onSegmentUpdate is undefined', async () => {
            // Arrange
            const user = userEvent.setup();
            const { onSegmentUpdate: _, ...propsWithoutOnSegmentUpdate } = defaultProps;
            render(<WallContextMenu {...propsWithoutOnSegmentUpdate} />);

            // Act
            const typeCombobox = screen.getAllByRole('combobox')[0]!;
            await user.click(typeCombobox);
            const listbox = await screen.findByRole('listbox');
            await user.click(within(listbox).getByRole('option', { name: 'Door' }));

            // Assert - no error should be thrown
            expect(true).toBe(true);
        });
    });

    describe('Segment State Display', () => {
        it('should display current state in state dropdown', () => {
            // Arrange - Use Door type which supports Locked state
            const wall = createMockWall([
                createMockSegment({ type: SegmentType.Door, isOpaque: true, state: SegmentState.Locked }),
            ]);
            render(<WallContextMenu {...defaultProps} encounterWall={wall} />);

            // Assert
            const stateCombobox = screen.getAllByRole('combobox')[1];
            expect(stateCombobox).toHaveTextContent('Locked');
        });

        it('should show only valid states for Wall type', async () => {
            // Arrange
            const user = userEvent.setup();
            const wall = createMockWall([
                createMockSegment({ type: SegmentType.Wall, isOpaque: true }),
            ]);
            render(<WallContextMenu {...defaultProps} encounterWall={wall} />);

            // Act
            const stateCombobox = screen.getAllByRole('combobox')[1]!;
            await user.click(stateCombobox);

            // Assert - Wall only allows Closed and Secret
            const listbox = await screen.findByRole('listbox');
            expect(within(listbox).getByRole('option', { name: 'Closed' })).toBeInTheDocument();
            expect(within(listbox).getByRole('option', { name: 'Secret' })).toBeInTheDocument();
            expect(within(listbox).queryByRole('option', { name: 'Open' })).not.toBeInTheDocument();
            expect(within(listbox).queryByRole('option', { name: 'Locked' })).not.toBeInTheDocument();
        });

        it('should show all states for Door type', async () => {
            // Arrange
            const user = userEvent.setup();
            const wall = createMockWall([
                createMockSegment({ type: SegmentType.Door, isOpaque: true }),
            ]);
            render(<WallContextMenu {...defaultProps} encounterWall={wall} />);

            // Act
            const stateCombobox = screen.getAllByRole('combobox')[1]!;
            await user.click(stateCombobox);

            // Assert - Door allows all states
            const listbox = await screen.findByRole('listbox');
            expect(within(listbox).getByRole('option', { name: 'Open' })).toBeInTheDocument();
            expect(within(listbox).getByRole('option', { name: 'Closed' })).toBeInTheDocument();
            expect(within(listbox).getByRole('option', { name: 'Locked' })).toBeInTheDocument();
            expect(within(listbox).getByRole('option', { name: 'Secret' })).toBeInTheDocument();
        });
    });

    describe('State Selection', () => {
        it('should call onSegmentUpdate when state is changed', async () => {
            // Arrange
            const user = userEvent.setup();
            const onSegmentUpdate = vi.fn<(wallIndex: number, segmentIndex: number, updates: Partial<EncounterWallSegment>) => void>();
            const wall = createMockWall([
                createMockSegment({ type: SegmentType.Door, isOpaque: true }),
            ]);
            render(<WallContextMenu {...defaultProps} encounterWall={wall} onSegmentUpdate={onSegmentUpdate} />);

            // Act
            const stateCombobox = screen.getAllByRole('combobox')[1]!;
            await user.click(stateCombobox);
            const listbox = await screen.findByRole('listbox');
            await user.click(within(listbox).getByRole('option', { name: 'Locked' }));

            // Assert
            await waitFor(() => {
                expect(onSegmentUpdate).toHaveBeenCalledWith(0, 0, { state: SegmentState.Locked });
            });
        });

        it('should call onSegmentUpdate with Secret state for Wall type', async () => {
            // Arrange
            const user = userEvent.setup();
            const onSegmentUpdate = vi.fn<(wallIndex: number, segmentIndex: number, updates: Partial<EncounterWallSegment>) => void>();
            render(<WallContextMenu {...defaultProps} onSegmentUpdate={onSegmentUpdate} />);

            // Act
            const stateCombobox = screen.getAllByRole('combobox')[1]!;
            await user.click(stateCombobox);
            const listbox = await screen.findByRole('listbox');
            await user.click(within(listbox).getByRole('option', { name: 'Secret' }));

            // Assert
            await waitFor(() => {
                expect(onSegmentUpdate).toHaveBeenCalledWith(0, 0, { state: SegmentState.Secret });
            });
        });

        it('should not call onSegmentUpdate when segmentIndex is null', () => {
            // Arrange
            const onSegmentUpdate = vi.fn<(wallIndex: number, segmentIndex: number, updates: Partial<EncounterWallSegment>) => void>();
            const wall = createMockWall([createMockSegment()]);
            // Force render with valid wall but null segmentIndex - segment won't render
            render(<WallContextMenu {...defaultProps} encounterWall={wall} segmentIndex={null} onSegmentUpdate={onSegmentUpdate} />);

            // Assert - no dropdowns should be visible
            expect(screen.queryAllByRole('combobox')).toHaveLength(0);
            expect(onSegmentUpdate).not.toHaveBeenCalled();
        });
    });

    describe('Segment Index Handling', () => {
        it('should find correct segment by index', () => {
            // Arrange
            const wall = createMockWall([
                createMockSegment({ index: 0, name: 'Segment Zero' }),
                createMockSegment({ index: 1, name: 'Segment One' }),
                createMockSegment({ index: 2, name: 'Segment Two' }),
            ]);
            render(<WallContextMenu {...defaultProps} encounterWall={wall} segmentIndex={1} />);

            // Assert
            expect(screen.getByText('Segment One')).toBeInTheDocument();
        });

        it('should pass correct wall and segment indices to onSegmentUpdate', async () => {
            // Arrange
            const user = userEvent.setup();
            const onSegmentUpdate = vi.fn<(wallIndex: number, segmentIndex: number, updates: Partial<EncounterWallSegment>) => void>();
            const wall: EncounterWall = {
                index: 5,
                name: 'Wall Five',
                segments: [
                    createMockSegment({ index: 0 }),
                    createMockSegment({ index: 3, type: SegmentType.Door, isOpaque: true }),
                ],
            };
            render(<WallContextMenu {...defaultProps} encounterWall={wall} segmentIndex={3} onSegmentUpdate={onSegmentUpdate} />);

            // Act
            const stateCombobox = screen.getAllByRole('combobox')[1]!;
            await user.click(stateCombobox);
            const listbox = await screen.findByRole('listbox');
            await user.click(within(listbox).getByRole('option', { name: 'Open' }));

            // Assert
            await waitFor(() => {
                expect(onSegmentUpdate).toHaveBeenCalledWith(5, 3, { state: SegmentState.Open });
            });
        });
    });

    describe('Menu Close Behavior', () => {
        it('should call onClose when clicking outside menu', async () => {
            // Arrange
            const user = userEvent.setup();
            const onClose = vi.fn<() => void>();
            render(
                <div>
                    <div>Outside Element</div>
                    <WallContextMenu {...defaultProps} onClose={onClose} />
                </div>,
            );

            // Act - click outside the menu
            await user.click(document.body);

            // Assert
            await waitFor(() => {
                expect(onClose).toHaveBeenCalled();
            });
        });

        it('should not add mousedown listener when menu is closed', () => {
            // Arrange
            const addEventListenerSpy = vi.spyOn(document, 'addEventListener');
            render(<WallContextMenu {...defaultProps} open={false} />);

            // Assert
            expect(addEventListenerSpy).not.toHaveBeenCalledWith('mousedown', expect.any(Function));

            // Cleanup
            addEventListenerSpy.mockRestore();
        });
    });

    describe('State Normalization', () => {
        it('should normalize invalid state for Wall type', () => {
            // Arrange - Wall segment with Open state (invalid for Wall)
            const wall = createMockWall([
                createMockSegment({
                    type: SegmentType.Wall,
                    isOpaque: true,
                    state: SegmentState.Open,
                }),
            ]);
            render(<WallContextMenu {...defaultProps} encounterWall={wall} />);

            // Assert - should display Closed (normalized)
            const stateCombobox = screen.getAllByRole('combobox')[1];
            expect(stateCombobox).toHaveTextContent('Closed');
        });

        it('should normalize Locked state for Fence type', () => {
            // Arrange - Fence segment with Locked state (invalid for Fence)
            const wall = createMockWall([
                createMockSegment({
                    type: SegmentType.Wall,
                    isOpaque: false,
                    state: SegmentState.Locked,
                }),
            ]);
            render(<WallContextMenu {...defaultProps} encounterWall={wall} />);

            // Assert - should display Closed (normalized)
            const stateCombobox = screen.getAllByRole('combobox')[1];
            expect(stateCombobox).toHaveTextContent('Closed');
        });

        it('should preserve Secret state for Wall type', () => {
            // Arrange - Wall segment with Secret state (valid for Wall)
            const wall = createMockWall([
                createMockSegment({
                    type: SegmentType.Wall,
                    isOpaque: true,
                    state: SegmentState.Secret,
                }),
            ]);
            render(<WallContextMenu {...defaultProps} encounterWall={wall} />);

            // Assert - should display Secret
            const stateCombobox = screen.getAllByRole('combobox')[1];
            expect(stateCombobox).toHaveTextContent('Secret');
        });

        it('should preserve Open state for Window type', () => {
            // Arrange - Window segment with Open state (valid for Window)
            const wall = createMockWall([
                createMockSegment({
                    type: SegmentType.Window,
                    isOpaque: true,
                    state: SegmentState.Open,
                }),
            ]);
            render(<WallContextMenu {...defaultProps} encounterWall={wall} />);

            // Assert - should display Open
            const stateCombobox = screen.getAllByRole('combobox')[1];
            expect(stateCombobox).toHaveTextContent('Open');
        });
    });

    describe('Segment Title Generation', () => {
        it('should generate title as "Wall 1" for first wall segment', () => {
            // Arrange
            const wall = createMockWall([
                createMockSegment({ index: 0, type: SegmentType.Wall, isOpaque: true }),
            ]);
            render(<WallContextMenu {...defaultProps} encounterWall={wall} />);

            // Assert
            expect(screen.getByText('Wall 1')).toBeInTheDocument();
        });

        it('should generate title as "Door 3" for third door segment', () => {
            // Arrange
            const wall = createMockWall([
                createMockSegment({ index: 2, type: SegmentType.Door, isOpaque: true }),
            ]);
            render(<WallContextMenu {...defaultProps} encounterWall={wall} segmentIndex={2} />);

            // Assert
            expect(screen.getByText('Door 3')).toBeInTheDocument();
        });

        it('should generate title as "Opening 5" for fifth opening segment', () => {
            // Arrange
            const wall = createMockWall([
                createMockSegment({ index: 4, type: SegmentType.Window, isOpaque: false }),
            ]);
            render(<WallContextMenu {...defaultProps} encounterWall={wall} segmentIndex={4} />);

            // Assert
            expect(screen.getByText('Opening 5')).toBeInTheDocument();
        });

        it('should prefer custom name over generated title', () => {
            // Arrange
            const wall = createMockWall([
                createMockSegment({ index: 0, name: 'Secret Passage' }),
            ]);
            render(<WallContextMenu {...defaultProps} encounterWall={wall} />);

            // Assert
            expect(screen.getByText('Secret Passage')).toBeInTheDocument();
            expect(screen.queryByText('Wall 1')).not.toBeInTheDocument();
        });
    });
});
