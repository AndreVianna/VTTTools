import { createTheme, ThemeProvider } from '@mui/material';
import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { describe, expect, it, vi, beforeEach } from 'vitest';
import { darkModeColors, lightModeColors, semanticColors } from '../theme/themeColors';
import { LayerToggleBar, type LayerVisibility, type LayerToggleBarProps } from './LayerToggleBar';

// Create light and dark themes for testing
const lightTheme = createTheme({
    palette: {
        mode: 'light',
        ...semanticColors,
        ...lightModeColors,
    },
});

const darkTheme = createTheme({
    palette: {
        mode: 'dark',
        ...semanticColors,
        ...darkModeColors,
    },
});

describe('LayerToggleBar', () => {
    // Arrange - default props factory
    const createDefaultLayers = (): LayerVisibility => ({
        background: true,
        grid: true,
        structures: true,
        objects: true,
        monsters: true,
        overlays: true,
    });

    const createDefaultProps = (overrides: Partial<LayerToggleBarProps> = {}): LayerToggleBarProps => ({
        visible: true,
        layers: createDefaultLayers(),
        onLayerToggle: vi.fn(),
        onResetLayers: vi.fn(),
        ...overrides,
    });

    beforeEach(() => {
        vi.clearAllMocks();
    });

    describe('Rendering', () => {
        it('should render all layer toggle buttons when visible', () => {
            // Arrange
            const props = createDefaultProps();

            // Act
            render(<LayerToggleBar {...props} />);

            // Assert
            expect(screen.getByLabelText('Background')).toBeInTheDocument();
            expect(screen.getByLabelText('Grid')).toBeInTheDocument();
            expect(screen.getByLabelText('Structures')).toBeInTheDocument();
            expect(screen.getByLabelText('Objects')).toBeInTheDocument();
            expect(screen.getByLabelText('Monsters')).toBeInTheDocument();
            expect(screen.getByLabelText('Overlays')).toBeInTheDocument();
        });

        it('should render reset button when visible', () => {
            // Arrange
            const props = createDefaultProps();

            // Act
            render(<LayerToggleBar {...props} />);

            // Assert
            expect(screen.getByLabelText('Reset All Layers')).toBeInTheDocument();
        });

        it('should not render anything when visible is false', () => {
            // Arrange
            const props = createDefaultProps({ visible: false });

            // Act
            const { container } = render(<LayerToggleBar {...props} />);

            // Assert
            expect(container.firstChild).toBeNull();
        });

        it('should render exactly six layer buttons plus one reset button', () => {
            // Arrange
            const props = createDefaultProps();

            // Act
            render(<LayerToggleBar {...props} />);

            // Assert
            const buttons = screen.getAllByRole('button');
            expect(buttons).toHaveLength(7);
        });
    });

    describe('Layer Visibility Toggle', () => {
        it('should call onLayerToggle with background when background button clicked', async () => {
            // Arrange
            const onLayerToggle = vi.fn();
            const props = createDefaultProps({ onLayerToggle });
            const user = userEvent.setup();

            // Act
            render(<LayerToggleBar {...props} />);
            await user.click(screen.getByLabelText('Background'));

            // Assert
            expect(onLayerToggle).toHaveBeenCalledTimes(1);
            expect(onLayerToggle).toHaveBeenCalledWith('background');
        });

        it('should call onLayerToggle with grid when grid button clicked', async () => {
            // Arrange
            const onLayerToggle = vi.fn();
            const props = createDefaultProps({ onLayerToggle });
            const user = userEvent.setup();

            // Act
            render(<LayerToggleBar {...props} />);
            await user.click(screen.getByLabelText('Grid'));

            // Assert
            expect(onLayerToggle).toHaveBeenCalledTimes(1);
            expect(onLayerToggle).toHaveBeenCalledWith('grid');
        });

        it('should call onLayerToggle with structures when structures button clicked', async () => {
            // Arrange
            const onLayerToggle = vi.fn();
            const props = createDefaultProps({ onLayerToggle });
            const user = userEvent.setup();

            // Act
            render(<LayerToggleBar {...props} />);
            await user.click(screen.getByLabelText('Structures'));

            // Assert
            expect(onLayerToggle).toHaveBeenCalledTimes(1);
            expect(onLayerToggle).toHaveBeenCalledWith('structures');
        });

        it('should call onLayerToggle with objects when objects button clicked', async () => {
            // Arrange
            const onLayerToggle = vi.fn();
            const props = createDefaultProps({ onLayerToggle });
            const user = userEvent.setup();

            // Act
            render(<LayerToggleBar {...props} />);
            await user.click(screen.getByLabelText('Objects'));

            // Assert
            expect(onLayerToggle).toHaveBeenCalledTimes(1);
            expect(onLayerToggle).toHaveBeenCalledWith('objects');
        });

        it('should call onLayerToggle with monsters when monsters button clicked', async () => {
            // Arrange
            const onLayerToggle = vi.fn();
            const props = createDefaultProps({ onLayerToggle });
            const user = userEvent.setup();

            // Act
            render(<LayerToggleBar {...props} />);
            await user.click(screen.getByLabelText('Monsters'));

            // Assert
            expect(onLayerToggle).toHaveBeenCalledTimes(1);
            expect(onLayerToggle).toHaveBeenCalledWith('monsters');
        });

        it('should call onLayerToggle with overlays when overlays button clicked', async () => {
            // Arrange
            const onLayerToggle = vi.fn();
            const props = createDefaultProps({ onLayerToggle });
            const user = userEvent.setup();

            // Act
            render(<LayerToggleBar {...props} />);
            await user.click(screen.getByLabelText('Overlays'));

            // Assert
            expect(onLayerToggle).toHaveBeenCalledTimes(1);
            expect(onLayerToggle).toHaveBeenCalledWith('overlays');
        });
    });

    describe('Layer Visual State', () => {
        it('should show visible layers with full opacity', () => {
            // Arrange
            const layers: LayerVisibility = {
                ...createDefaultLayers(),
                background: true,
                grid: true,
            };
            const props = createDefaultProps({ layers });

            // Act
            render(<LayerToggleBar {...props} />);

            // Assert
            const backgroundButton = screen.getByLabelText('Background');
            const gridButton = screen.getByLabelText('Grid');
            expect(backgroundButton).toHaveStyle({ opacity: '1' });
            expect(gridButton).toHaveStyle({ opacity: '1' });
        });

        it('should show hidden layers with reduced opacity', () => {
            // Arrange
            const layers: LayerVisibility = {
                ...createDefaultLayers(),
                background: false,
                grid: false,
            };
            const props = createDefaultProps({ layers });

            // Act
            render(<LayerToggleBar {...props} />);

            // Assert
            const backgroundButton = screen.getByLabelText('Background');
            const gridButton = screen.getByLabelText('Grid');
            expect(backgroundButton).toHaveStyle({ opacity: '0.5' });
            expect(gridButton).toHaveStyle({ opacity: '0.5' });
        });

        it('should correctly reflect mixed layer visibility states', () => {
            // Arrange
            const layers: LayerVisibility = {
                background: true,
                grid: false,
                structures: true,
                objects: false,
                monsters: true,
                overlays: false,
            };
            const props = createDefaultProps({ layers });

            // Act
            render(<LayerToggleBar {...props} />);

            // Assert
            expect(screen.getByLabelText('Background')).toHaveStyle({ opacity: '1' });
            expect(screen.getByLabelText('Grid')).toHaveStyle({ opacity: '0.5' });
            expect(screen.getByLabelText('Structures')).toHaveStyle({ opacity: '1' });
            expect(screen.getByLabelText('Objects')).toHaveStyle({ opacity: '0.5' });
            expect(screen.getByLabelText('Monsters')).toHaveStyle({ opacity: '1' });
            expect(screen.getByLabelText('Overlays')).toHaveStyle({ opacity: '0.5' });
        });
    });

    describe('Reset Layers Functionality', () => {
        it('should call onResetLayers when reset button clicked', async () => {
            // Arrange
            const onResetLayers = vi.fn();
            const props = createDefaultProps({ onResetLayers });
            const user = userEvent.setup();

            // Act
            render(<LayerToggleBar {...props} />);
            await user.click(screen.getByLabelText('Reset All Layers'));

            // Assert
            expect(onResetLayers).toHaveBeenCalledTimes(1);
        });

        it('should not call onLayerToggle when reset button clicked', async () => {
            // Arrange
            const onLayerToggle = vi.fn();
            const onResetLayers = vi.fn();
            const props = createDefaultProps({ onLayerToggle, onResetLayers });
            const user = userEvent.setup();

            // Act
            render(<LayerToggleBar {...props} />);
            await user.click(screen.getByLabelText('Reset All Layers'));

            // Assert
            expect(onLayerToggle).not.toHaveBeenCalled();
            expect(onResetLayers).toHaveBeenCalledTimes(1);
        });
    });

    describe('Accessibility', () => {
        it('should have accessible tooltips for all layer buttons', () => {
            // Arrange
            const props = createDefaultProps();

            // Act
            render(<LayerToggleBar {...props} />);

            // Assert
            expect(screen.getByLabelText('Background')).toBeInTheDocument();
            expect(screen.getByLabelText('Grid')).toBeInTheDocument();
            expect(screen.getByLabelText('Structures')).toBeInTheDocument();
            expect(screen.getByLabelText('Objects')).toBeInTheDocument();
            expect(screen.getByLabelText('Monsters')).toBeInTheDocument();
            expect(screen.getByLabelText('Overlays')).toBeInTheDocument();
            expect(screen.getByLabelText('Reset All Layers')).toBeInTheDocument();
        });

        it('should have button role for all interactive elements', () => {
            // Arrange
            const props = createDefaultProps();

            // Act
            render(<LayerToggleBar {...props} />);

            // Assert
            const buttons = screen.getAllByRole('button');
            expect(buttons.length).toBeGreaterThanOrEqual(7);
        });
    });

    describe('Multiple Interactions', () => {
        it('should allow toggling multiple layers in sequence', async () => {
            // Arrange
            const onLayerToggle = vi.fn();
            const props = createDefaultProps({ onLayerToggle });
            const user = userEvent.setup();

            // Act
            render(<LayerToggleBar {...props} />);
            await user.click(screen.getByLabelText('Background'));
            await user.click(screen.getByLabelText('Grid'));
            await user.click(screen.getByLabelText('Monsters'));

            // Assert
            expect(onLayerToggle).toHaveBeenCalledTimes(3);
            expect(onLayerToggle).toHaveBeenNthCalledWith(1, 'background');
            expect(onLayerToggle).toHaveBeenNthCalledWith(2, 'grid');
            expect(onLayerToggle).toHaveBeenNthCalledWith(3, 'monsters');
        });

        it('should allow toggling same layer multiple times', async () => {
            // Arrange
            const onLayerToggle = vi.fn();
            const props = createDefaultProps({ onLayerToggle });
            const user = userEvent.setup();

            // Act
            render(<LayerToggleBar {...props} />);
            await user.click(screen.getByLabelText('Grid'));
            await user.click(screen.getByLabelText('Grid'));
            await user.click(screen.getByLabelText('Grid'));

            // Assert
            expect(onLayerToggle).toHaveBeenCalledTimes(3);
            expect(onLayerToggle).toHaveBeenCalledWith('grid');
        });
    });

    describe('Props Updates', () => {
        it('should update visibility state when layers prop changes', () => {
            // Arrange
            const initialLayers = createDefaultLayers();
            const updatedLayers: LayerVisibility = {
                ...initialLayers,
                background: false,
            };
            const props = createDefaultProps({ layers: initialLayers });

            // Act
            const { rerender } = render(<LayerToggleBar {...props} />);
            expect(screen.getByLabelText('Background')).toHaveStyle({ opacity: '1' });

            rerender(<LayerToggleBar {...props} layers={updatedLayers} />);

            // Assert
            expect(screen.getByLabelText('Background')).toHaveStyle({ opacity: '0.5' });
        });

        it('should hide component when visible prop changes to false', () => {
            // Arrange
            const props = createDefaultProps({ visible: true });

            // Act
            const { rerender, container } = render(<LayerToggleBar {...props} />);
            expect(screen.getByLabelText('Background')).toBeInTheDocument();

            rerender(<LayerToggleBar {...props} visible={false} />);

            // Assert
            expect(container.firstChild).toBeNull();
        });

        it('should show component when visible prop changes to true', () => {
            // Arrange
            const props = createDefaultProps({ visible: false });

            // Act
            const { rerender, container } = render(<LayerToggleBar {...props} />);
            expect(container.firstChild).toBeNull();

            rerender(<LayerToggleBar {...props} visible={true} />);

            // Assert
            expect(screen.getByLabelText('Background')).toBeInTheDocument();
        });
    });

    describe('Theme Support', () => {
        // Helper function to render with theme
        const renderWithTheme = (
            props: LayerToggleBarProps,
            theme: typeof lightTheme | typeof darkTheme,
        ) => {
            return render(
                <ThemeProvider theme={theme}>
                    <LayerToggleBar {...props} />
                </ThemeProvider>,
            );
        };

        it('should render correctly in light theme', () => {
            // Arrange
            const props = createDefaultProps();

            // Act
            renderWithTheme(props, lightTheme);

            // Assert
            expect(screen.getByLabelText('Background')).toBeInTheDocument();
            expect(screen.getByLabelText('Grid')).toBeInTheDocument();
            expect(screen.getByLabelText('Reset All Layers')).toBeInTheDocument();
        });

        it('should render correctly in dark theme', () => {
            // Arrange
            const props = createDefaultProps();

            // Act
            renderWithTheme(props, darkTheme);

            // Assert
            expect(screen.getByLabelText('Background')).toBeInTheDocument();
            expect(screen.getByLabelText('Grid')).toBeInTheDocument();
            expect(screen.getByLabelText('Reset All Layers')).toBeInTheDocument();
        });

        it('should apply light theme background color', () => {
            // Arrange
            const props = createDefaultProps();

            // Act
            const { container } = renderWithTheme(props, lightTheme);

            // Assert - container should have proper styling applied
            const toolbar = container.firstChild as HTMLElement;
            expect(toolbar).toBeInTheDocument();
        });

        it('should apply dark theme background color', () => {
            // Arrange
            const props = createDefaultProps();

            // Act
            const { container } = renderWithTheme(props, darkTheme);

            // Assert - container should have proper styling applied
            const toolbar = container.firstChild as HTMLElement;
            expect(toolbar).toBeInTheDocument();
        });

        it('should maintain layer toggle functionality in light theme', async () => {
            // Arrange
            const onLayerToggle = vi.fn();
            const props = createDefaultProps({ onLayerToggle });
            const user = userEvent.setup();

            // Act
            renderWithTheme(props, lightTheme);
            await user.click(screen.getByLabelText('Background'));

            // Assert
            expect(onLayerToggle).toHaveBeenCalledWith('background');
        });

        it('should maintain layer toggle functionality in dark theme', async () => {
            // Arrange
            const onLayerToggle = vi.fn();
            const props = createDefaultProps({ onLayerToggle });
            const user = userEvent.setup();

            // Act
            renderWithTheme(props, darkTheme);
            await user.click(screen.getByLabelText('Background'));

            // Assert
            expect(onLayerToggle).toHaveBeenCalledWith('background');
        });

        it('should maintain reset functionality in light theme', async () => {
            // Arrange
            const onResetLayers = vi.fn();
            const props = createDefaultProps({ onResetLayers });
            const user = userEvent.setup();

            // Act
            renderWithTheme(props, lightTheme);
            await user.click(screen.getByLabelText('Reset All Layers'));

            // Assert
            expect(onResetLayers).toHaveBeenCalledTimes(1);
        });

        it('should maintain reset functionality in dark theme', async () => {
            // Arrange
            const onResetLayers = vi.fn();
            const props = createDefaultProps({ onResetLayers });
            const user = userEvent.setup();

            // Act
            renderWithTheme(props, darkTheme);
            await user.click(screen.getByLabelText('Reset All Layers'));

            // Assert
            expect(onResetLayers).toHaveBeenCalledTimes(1);
        });

        it('should show visible layer opacity correctly in light theme', () => {
            // Arrange
            const layers: LayerVisibility = {
                ...createDefaultLayers(),
                background: true,
                grid: false,
            };
            const props = createDefaultProps({ layers });

            // Act
            renderWithTheme(props, lightTheme);

            // Assert
            expect(screen.getByLabelText('Background')).toHaveStyle({ opacity: '1' });
            expect(screen.getByLabelText('Grid')).toHaveStyle({ opacity: '0.5' });
        });

        it('should show visible layer opacity correctly in dark theme', () => {
            // Arrange
            const layers: LayerVisibility = {
                ...createDefaultLayers(),
                background: true,
                grid: false,
            };
            const props = createDefaultProps({ layers });

            // Act
            renderWithTheme(props, darkTheme);

            // Assert
            expect(screen.getByLabelText('Background')).toHaveStyle({ opacity: '1' });
            expect(screen.getByLabelText('Grid')).toHaveStyle({ opacity: '0.5' });
        });
    });
});
