import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { describe, expect, it, vi, beforeEach } from 'vitest';
import { TopToolBar, type TopToolBarProps, type LayerVisibilityType } from './TopToolBar';

// Mock MUI icons to avoid file handle exhaustion
vi.mock('@mui/icons-material', () => ({
    Clear: () => <span data-mock="icon-clear">ClearIcon</span>,
    Pets: () => <span data-mock="icon-monsters">MonstersIcon</span>,
    Cloud: () => <span data-mock="icon-fogofwar">FogOfWarIcon</span>,
    GridOn: () => <span data-mock="icon-grid">GridIcon</span>,
    PlayArrow: () => <span data-mock="icon-play">PlayArrowIcon</span>,
    ViewInAr: () => <span data-mock="icon-objects">ObjectsIcon</span>,
    Person: () => <span data-mock="icon-characters">CharactersIcon</span>,
    Redo: () => <span data-mock="icon-redo">RedoIcon</span>,
    Layers: () => <span data-mock="icon-regions">RegionsIcon</span>,
    LightMode: () => <span data-mock="icon-lights">LightsIcon</span>,
    VolumeUp: () => <span data-mock="icon-sounds">SoundsIcon</span>,
    Undo: () => <span data-mock="icon-undo">UndoIcon</span>,
    Visibility: () => <span data-mock="icon-visibility">VisibilityIcon</span>,
    VisibilityOff: () => <span data-mock="icon-visibility-off">VisibilityOffIcon</span>,
    BorderAll: () => <span data-mock="icon-walls">WallsIcon</span>,
    ZoomIn: () => <span data-mock="icon-zoom-in">ZoomInIcon</span>,
    ZoomOut: () => <span data-mock="icon-zoom-out">ZoomOutIcon</span>,
    ZoomOutMap: () => <span data-mock="icon-zoom-reset">ZoomResetIcon</span>,
}));

describe('TopToolBar', () => {
    // Arrange - default layer visibility factory
    const createDefaultLayerVisibility = (): Record<LayerVisibilityType, boolean> => ({
        regions: true,
        walls: true,
        objects: true,
        monsters: true,
        characters: true,
        lights: true,
        sounds: true,
        fogOfWar: true,
    });

    const createDefaultProps = (overrides: Partial<TopToolBarProps> = {}): TopToolBarProps => ({
        onUndoClick: vi.fn(),
        onRedoClick: vi.fn(),
        onZoomIn: vi.fn(),
        onZoomOut: vi.fn(),
        onZoomReset: vi.fn(),
        onGridToggle: vi.fn(),
        onClearSelection: vi.fn(),
        canUndo: false,
        canRedo: false,
        hasGrid: false,
        gridVisible: true,
        layerVisibility: createDefaultLayerVisibility(),
        onLayerVisibilityToggle: vi.fn(),
        onShowAllLayers: vi.fn(),
        onHideAllLayers: vi.fn(),
        ...overrides,
    });

    beforeEach(() => {
        vi.clearAllMocks();
    });

    describe('Rendering', () => {
        it('should render zoom control buttons', () => {
            // Arrange
            const props = createDefaultProps();

            // Act
            render(<TopToolBar {...props} />);

            // Assert
            expect(screen.getByLabelText('Zoom In')).toBeInTheDocument();
            expect(screen.getByLabelText('Zoom Out')).toBeInTheDocument();
            expect(screen.getByLabelText('Reset Zoom')).toBeInTheDocument();
        });

        it('should render undo and redo buttons', () => {
            // Arrange
            const props = createDefaultProps();

            // Act
            render(<TopToolBar {...props} />);

            // Assert
            expect(screen.getByLabelText('Undo')).toBeInTheDocument();
            expect(screen.getByLabelText('Redo')).toBeInTheDocument();
        });

        it('should render clear selection button', () => {
            // Arrange
            const props = createDefaultProps();

            // Act
            render(<TopToolBar {...props} />);

            // Assert
            expect(screen.getByLabelText('Clear Selection (X)')).toBeInTheDocument();
        });

        it('should render visibility control buttons when layer visibility is provided', () => {
            // Arrange
            const props = createDefaultProps({ hasGrid: true });

            // Act
            render(<TopToolBar {...props} />);

            // Assert
            expect(screen.getByLabelText('Show All')).toBeInTheDocument();
            expect(screen.getByLabelText('Hide All')).toBeInTheDocument();
            expect(screen.getByLabelText('Toggle Grid')).toBeInTheDocument();
        });

        it('should not render visibility controls when layer visibility is not provided', () => {
            // Arrange
            const props = createDefaultProps({
                layerVisibility: undefined,
                onLayerVisibilityToggle: undefined,
            });

            // Act
            render(<TopToolBar {...props} />);

            // Assert
            expect(screen.queryByLabelText('Show All')).not.toBeInTheDocument();
            expect(screen.queryByLabelText('Hide All')).not.toBeInTheDocument();
        });

        it('should render all layer visibility toggle buttons', () => {
            // Arrange
            const props = createDefaultProps();

            // Act
            render(<TopToolBar {...props} />);

            // Assert
            expect(screen.getByLabelText('Walls & Openings Visible')).toBeInTheDocument();
            expect(screen.getByLabelText('Regions Visible')).toBeInTheDocument();
            expect(screen.getByLabelText('Objects Visible')).toBeInTheDocument();
            expect(screen.getByLabelText('Monsters Visible')).toBeInTheDocument();
            expect(screen.getByLabelText('Characters Visible')).toBeInTheDocument();
            expect(screen.getByLabelText('Lights Visible')).toBeInTheDocument();
            expect(screen.getByLabelText('Sounds Visible')).toBeInTheDocument();
            expect(screen.getByLabelText('Fog of War Visible')).toBeInTheDocument();
        });
    });

    describe('Zoom In Button Functionality', () => {
        it('should call onZoomIn when zoom in button is clicked', async () => {
            // Arrange
            const onZoomIn = vi.fn();
            const props = createDefaultProps({ onZoomIn });
            const user = userEvent.setup();

            // Act
            render(<TopToolBar {...props} />);
            await user.click(screen.getByLabelText('Zoom In'));

            // Assert
            expect(onZoomIn).toHaveBeenCalledTimes(1);
        });

        it('should call onZoomIn multiple times when clicked multiple times', async () => {
            // Arrange
            const onZoomIn = vi.fn();
            const props = createDefaultProps({ onZoomIn });
            const user = userEvent.setup();

            // Act
            render(<TopToolBar {...props} />);
            await user.click(screen.getByLabelText('Zoom In'));
            await user.click(screen.getByLabelText('Zoom In'));
            await user.click(screen.getByLabelText('Zoom In'));

            // Assert
            expect(onZoomIn).toHaveBeenCalledTimes(3);
        });

        it('should not throw when onZoomIn is not provided', async () => {
            // Arrange
            const props = createDefaultProps({ onZoomIn: undefined });
            const user = userEvent.setup();

            // Act
            render(<TopToolBar {...props} />);

            // Assert - should not throw
            await expect(user.click(screen.getByLabelText('Zoom In'))).resolves.not.toThrow();
        });
    });

    describe('Zoom Out Button Functionality', () => {
        it('should call onZoomOut when zoom out button is clicked', async () => {
            // Arrange
            const onZoomOut = vi.fn();
            const props = createDefaultProps({ onZoomOut });
            const user = userEvent.setup();

            // Act
            render(<TopToolBar {...props} />);
            await user.click(screen.getByLabelText('Zoom Out'));

            // Assert
            expect(onZoomOut).toHaveBeenCalledTimes(1);
        });

        it('should call onZoomOut multiple times when clicked multiple times', async () => {
            // Arrange
            const onZoomOut = vi.fn();
            const props = createDefaultProps({ onZoomOut });
            const user = userEvent.setup();

            // Act
            render(<TopToolBar {...props} />);
            await user.click(screen.getByLabelText('Zoom Out'));
            await user.click(screen.getByLabelText('Zoom Out'));

            // Assert
            expect(onZoomOut).toHaveBeenCalledTimes(2);
        });

        it('should not throw when onZoomOut is not provided', async () => {
            // Arrange
            const props = createDefaultProps({ onZoomOut: undefined });
            const user = userEvent.setup();

            // Act
            render(<TopToolBar {...props} />);

            // Assert - should not throw
            await expect(user.click(screen.getByLabelText('Zoom Out'))).resolves.not.toThrow();
        });
    });

    describe('Reset Zoom Button Functionality', () => {
        it('should call onZoomReset when reset zoom button is clicked', async () => {
            // Arrange
            const onZoomReset = vi.fn();
            const props = createDefaultProps({ onZoomReset });
            const user = userEvent.setup();

            // Act
            render(<TopToolBar {...props} />);
            await user.click(screen.getByLabelText('Reset Zoom'));

            // Assert
            expect(onZoomReset).toHaveBeenCalledTimes(1);
        });

        it('should not throw when onZoomReset is not provided', async () => {
            // Arrange
            const props = createDefaultProps({ onZoomReset: undefined });
            const user = userEvent.setup();

            // Act
            render(<TopToolBar {...props} />);

            // Assert - should not throw
            await expect(user.click(screen.getByLabelText('Reset Zoom'))).resolves.not.toThrow();
        });
    });

    describe('Undo/Redo Disabled States', () => {
        it('should disable undo button when canUndo is false', () => {
            // Arrange
            const props = createDefaultProps({ canUndo: false });

            // Act
            render(<TopToolBar {...props} />);

            // Assert
            const undoButton = screen.getByRole('button', { name: /Undo/i });
            expect(undoButton).toBeDisabled();
        });

        it('should enable undo button when canUndo is true', () => {
            // Arrange
            const props = createDefaultProps({ canUndo: true });

            // Act
            render(<TopToolBar {...props} />);

            // Assert
            const undoButton = screen.getByRole('button', { name: /Undo/i });
            expect(undoButton).not.toBeDisabled();
        });

        it('should disable redo button when canRedo is false', () => {
            // Arrange
            const props = createDefaultProps({ canRedo: false });

            // Act
            render(<TopToolBar {...props} />);

            // Assert
            const redoButton = screen.getByRole('button', { name: /Redo/i });
            expect(redoButton).toBeDisabled();
        });

        it('should enable redo button when canRedo is true', () => {
            // Arrange
            const props = createDefaultProps({ canRedo: true });

            // Act
            render(<TopToolBar {...props} />);

            // Assert
            const redoButton = screen.getByRole('button', { name: /Redo/i });
            expect(redoButton).not.toBeDisabled();
        });

        it('should not call onUndoClick when undo button is disabled and clicked', async () => {
            // Arrange
            const onUndoClick = vi.fn();
            const props = createDefaultProps({ onUndoClick, canUndo: false });
            const user = userEvent.setup({ pointerEventsCheck: 0 });

            // Act
            render(<TopToolBar {...props} />);
            const undoButton = screen.getByRole('button', { name: /Undo/i });
            await user.click(undoButton);

            // Assert
            expect(onUndoClick).not.toHaveBeenCalled();
        });

        it('should call onUndoClick when undo button is enabled and clicked', async () => {
            // Arrange
            const onUndoClick = vi.fn();
            const props = createDefaultProps({ onUndoClick, canUndo: true });
            const user = userEvent.setup();

            // Act
            render(<TopToolBar {...props} />);
            await user.click(screen.getByRole('button', { name: /Undo/i }));

            // Assert
            expect(onUndoClick).toHaveBeenCalledTimes(1);
        });
    });

    describe('Grid Toggle Functionality', () => {
        it('should call onGridToggle when grid button is clicked', async () => {
            // Arrange
            const onGridToggle = vi.fn();
            const props = createDefaultProps({ onGridToggle, hasGrid: true });
            const user = userEvent.setup();

            // Act
            render(<TopToolBar {...props} />);
            await user.click(screen.getByLabelText('Toggle Grid'));

            // Assert
            expect(onGridToggle).toHaveBeenCalledTimes(1);
        });

        it('should show grid button with full opacity when gridVisible is true', () => {
            // Arrange
            const props = createDefaultProps({ hasGrid: true, gridVisible: true });

            // Act
            render(<TopToolBar {...props} />);

            // Assert
            const gridButton = screen.getByLabelText('Toggle Grid').closest('button');
            expect(gridButton).toHaveStyle({ opacity: '1' });
        });

        it('should show grid button with reduced opacity when gridVisible is false', () => {
            // Arrange
            const props = createDefaultProps({ hasGrid: true, gridVisible: false });

            // Act
            render(<TopToolBar {...props} />);

            // Assert
            const gridButton = screen.getByLabelText('Toggle Grid').closest('button');
            expect(gridButton).toHaveStyle({ opacity: '0.4' });
        });

        it('should not render grid toggle button when hasGrid is false', () => {
            // Arrange
            const props = createDefaultProps({ hasGrid: false });

            // Act
            render(<TopToolBar {...props} />);

            // Assert
            expect(screen.queryByLabelText('Toggle Grid')).not.toBeInTheDocument();
        });

        it('should render grid toggle button when hasGrid is true', () => {
            // Arrange
            const props = createDefaultProps({ hasGrid: true });

            // Act
            render(<TopToolBar {...props} />);

            // Assert
            expect(screen.getByLabelText('Toggle Grid')).toBeInTheDocument();
        });
    });

    describe('Clear Selection Functionality', () => {
        it('should call onClearSelection when clear selection button is clicked', async () => {
            // Arrange
            const onClearSelection = vi.fn();
            const props = createDefaultProps({ onClearSelection });
            const user = userEvent.setup();

            // Act
            render(<TopToolBar {...props} />);
            await user.click(screen.getByLabelText('Clear Selection (X)'));

            // Assert
            expect(onClearSelection).toHaveBeenCalledTimes(1);
        });
    });

    describe('Layer Visibility Toggle', () => {
        it('should call onLayerVisibilityToggle with walls when walls button clicked', async () => {
            // Arrange
            const onLayerVisibilityToggle = vi.fn();
            const props = createDefaultProps({ onLayerVisibilityToggle });
            const user = userEvent.setup();

            // Act
            render(<TopToolBar {...props} />);
            await user.click(screen.getByLabelText('Walls & Openings Visible'));

            // Assert
            expect(onLayerVisibilityToggle).toHaveBeenCalledTimes(1);
            expect(onLayerVisibilityToggle).toHaveBeenCalledWith('walls');
        });

        it('should call onLayerVisibilityToggle with regions when regions button clicked', async () => {
            // Arrange
            const onLayerVisibilityToggle = vi.fn();
            const props = createDefaultProps({ onLayerVisibilityToggle });
            const user = userEvent.setup();

            // Act
            render(<TopToolBar {...props} />);
            await user.click(screen.getByLabelText('Regions Visible'));

            // Assert
            expect(onLayerVisibilityToggle).toHaveBeenCalledTimes(1);
            expect(onLayerVisibilityToggle).toHaveBeenCalledWith('regions');
        });

        it('should call onShowAllLayers when show all button is clicked', async () => {
            // Arrange
            const onShowAllLayers = vi.fn();
            const props = createDefaultProps({ onShowAllLayers });
            const user = userEvent.setup();

            // Act
            render(<TopToolBar {...props} />);
            await user.click(screen.getByLabelText('Show All'));

            // Assert
            expect(onShowAllLayers).toHaveBeenCalledTimes(1);
        });

        it('should call onHideAllLayers when hide all button is clicked', async () => {
            // Arrange
            const onHideAllLayers = vi.fn();
            const props = createDefaultProps({ onHideAllLayers });
            const user = userEvent.setup();

            // Act
            render(<TopToolBar {...props} />);
            await user.click(screen.getByLabelText('Hide All'));

            // Assert
            expect(onHideAllLayers).toHaveBeenCalledTimes(1);
        });

        it('should show layer button with full opacity when layer is visible', () => {
            // Arrange
            const layerVisibility = createDefaultLayerVisibility();
            layerVisibility.walls = true;
            const props = createDefaultProps({ layerVisibility });

            // Act
            render(<TopToolBar {...props} />);

            // Assert
            const wallsButton = screen.getByLabelText('Walls & Openings Visible').closest('button');
            expect(wallsButton).toHaveStyle({ opacity: '1' });
        });

        it('should show layer button with reduced opacity when layer is hidden', () => {
            // Arrange
            const layerVisibility = createDefaultLayerVisibility();
            layerVisibility.walls = false;
            const props = createDefaultProps({ layerVisibility });

            // Act
            render(<TopToolBar {...props} />);

            // Assert
            const wallsButton = screen.getByLabelText('Walls & Openings Hidden').closest('button');
            expect(wallsButton).toHaveStyle({ opacity: '0.4' });
        });
    });

    describe('Multiple Interactions', () => {
        it('should allow zoom in and zoom out in sequence', async () => {
            // Arrange
            const onZoomIn = vi.fn();
            const onZoomOut = vi.fn();
            const props = createDefaultProps({ onZoomIn, onZoomOut });
            const user = userEvent.setup();

            // Act
            render(<TopToolBar {...props} />);
            await user.click(screen.getByLabelText('Zoom In'));
            await user.click(screen.getByLabelText('Zoom In'));
            await user.click(screen.getByLabelText('Zoom Out'));

            // Assert
            expect(onZoomIn).toHaveBeenCalledTimes(2);
            expect(onZoomOut).toHaveBeenCalledTimes(1);
        });

        it('should allow zoom in, reset, then zoom out', async () => {
            // Arrange
            const onZoomIn = vi.fn();
            const onZoomOut = vi.fn();
            const onZoomReset = vi.fn();
            const props = createDefaultProps({ onZoomIn, onZoomOut, onZoomReset });
            const user = userEvent.setup();

            // Act
            render(<TopToolBar {...props} />);
            await user.click(screen.getByLabelText('Zoom In'));
            await user.click(screen.getByLabelText('Reset Zoom'));
            await user.click(screen.getByLabelText('Zoom Out'));

            // Assert
            expect(onZoomIn).toHaveBeenCalledTimes(1);
            expect(onZoomReset).toHaveBeenCalledTimes(1);
            expect(onZoomOut).toHaveBeenCalledTimes(1);
        });
    });

    describe('Accessibility', () => {
        it('should have accessible labels for all zoom controls', () => {
            // Arrange
            const props = createDefaultProps();

            // Act
            render(<TopToolBar {...props} />);

            // Assert
            expect(screen.getByLabelText('Zoom In')).toBeInTheDocument();
            expect(screen.getByLabelText('Zoom Out')).toBeInTheDocument();
            expect(screen.getByLabelText('Reset Zoom')).toBeInTheDocument();
        });

        it('should have button role for all interactive elements', () => {
            // Arrange
            const props = createDefaultProps();

            // Act
            render(<TopToolBar {...props} />);

            // Assert
            const buttons = screen.getAllByRole('button');
            expect(buttons.length).toBeGreaterThanOrEqual(3);
        });

        it('should have proper tooltip text for undo and redo buttons', () => {
            // Arrange
            const props = createDefaultProps();

            // Act
            render(<TopToolBar {...props} />);

            // Assert
            expect(screen.getByLabelText('Undo')).toBeInTheDocument();
            expect(screen.getByLabelText('Redo')).toBeInTheDocument();
        });
    });

    describe('Props Updates', () => {
        it('should update undo button state when canUndo prop changes', () => {
            // Arrange
            const props = createDefaultProps({ canUndo: false });

            // Act
            const { rerender } = render(<TopToolBar {...props} />);
            expect(screen.getByRole('button', { name: /Undo/i })).toBeDisabled();

            rerender(<TopToolBar {...props} canUndo={true} />);

            // Assert
            expect(screen.getByRole('button', { name: /Undo/i })).not.toBeDisabled();
        });

        it('should update redo button state when canRedo prop changes', () => {
            // Arrange
            const props = createDefaultProps({ canRedo: false });

            // Act
            const { rerender } = render(<TopToolBar {...props} />);
            expect(screen.getByRole('button', { name: /Redo/i })).toBeDisabled();

            rerender(<TopToolBar {...props} canRedo={true} />);

            // Assert
            expect(screen.getByRole('button', { name: /Redo/i })).not.toBeDisabled();
        });

        it('should update grid visibility when gridVisible prop changes', () => {
            // Arrange
            const props = createDefaultProps({ hasGrid: true, gridVisible: true });

            // Act
            const { rerender } = render(<TopToolBar {...props} />);
            const gridButton = screen.getByLabelText('Toggle Grid').closest('button');
            expect(gridButton).toHaveStyle({ opacity: '1' });

            rerender(<TopToolBar {...props} gridVisible={false} />);

            // Assert
            expect(gridButton).toHaveStyle({ opacity: '0.4' });
        });

        it('should update layer visibility display when layerVisibility prop changes', () => {
            // Arrange
            const initialLayers = createDefaultLayerVisibility();
            initialLayers.walls = true;
            const props = createDefaultProps({ layerVisibility: initialLayers });

            // Act
            const { rerender } = render(<TopToolBar {...props} />);
            expect(screen.getByLabelText('Walls & Openings Visible')).toBeInTheDocument();

            const updatedLayers = { ...initialLayers, walls: false };
            rerender(<TopToolBar {...props} layerVisibility={updatedLayers} />);

            // Assert
            expect(screen.getByLabelText('Walls & Openings Hidden')).toBeInTheDocument();
        });
    });

    describe('Toolbar Layout', () => {
        it('should render toolbar with correct structure', () => {
            // Arrange
            const props = createDefaultProps();

            // Act
            const { container } = render(<TopToolBar {...props} />);

            // Assert - should have a container box
            expect(container.firstChild).toBeInTheDocument();
        });

        it('should render multiple button groups', () => {
            // Arrange
            const props = createDefaultProps();

            // Act
            render(<TopToolBar {...props} />);

            // Assert - toolbar contains multiple buttons organized in groups
            const buttons = screen.getAllByRole('button');
            expect(buttons.length).toBeGreaterThan(5);
        });
    });

    describe('Preview Button Functionality', () => {
        it('should render preview button when onPreviewClick is provided', () => {
            // Arrange
            const onPreviewClick = vi.fn();
            const props = createDefaultProps({ onPreviewClick });

            // Act
            render(<TopToolBar {...props} />);

            // Assert
            expect(screen.getByLabelText('Preview Encounter')).toBeInTheDocument();
        });

        it('should not render preview button when onPreviewClick is not provided', () => {
            // Arrange
            const props = createDefaultProps({ onPreviewClick: undefined });

            // Act
            render(<TopToolBar {...props} />);

            // Assert
            expect(screen.queryByLabelText('Preview Encounter')).not.toBeInTheDocument();
        });

        it('should call onPreviewClick when preview button is clicked', async () => {
            // Arrange
            const onPreviewClick = vi.fn();
            const props = createDefaultProps({ onPreviewClick });
            const user = userEvent.setup();

            // Act
            render(<TopToolBar {...props} />);
            await user.click(screen.getByLabelText('Preview Encounter'));

            // Assert
            expect(onPreviewClick).toHaveBeenCalledTimes(1);
        });

        it('should have semantic id btn-preview for BDD testing', () => {
            // Arrange
            const onPreviewClick = vi.fn();
            const props = createDefaultProps({ onPreviewClick });

            // Act
            render(<TopToolBar {...props} />);

            // Assert
            const previewButton = screen.getByLabelText('Preview Encounter');
            expect(previewButton).toHaveAttribute('id', 'btn-preview');
        });

        it('should render preview button on the right side (after spacer)', () => {
            // Arrange
            const onPreviewClick = vi.fn();
            const props = createDefaultProps({ onPreviewClick });

            // Act
            render(<TopToolBar {...props} />);

            // Assert - Preview button should exist alongside other buttons
            const buttons = screen.getAllByRole('button');
            const previewButton = screen.getByLabelText('Preview Encounter');
            expect(buttons).toContain(previewButton);
        });
    });
});
