import { ThemeProvider, createTheme } from '@mui/material';
import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { describe, expect, it, vi, beforeEach } from 'vitest';
import { ZoomControls, type ZoomControlsProps } from './ZoomControls';

describe('ZoomControls', () => {
    // Arrange - theme providers for dark/light mode testing
    const lightTheme = createTheme({ palette: { mode: 'light' } });
    const darkTheme = createTheme({ palette: { mode: 'dark' } });

    const createDefaultProps = (overrides: Partial<ZoomControlsProps> = {}): ZoomControlsProps => ({
        zoomLevel: 1,
        onZoomIn: vi.fn(),
        onZoomOut: vi.fn(),
        onZoomReset: vi.fn(),
        ...overrides,
    });

    const renderWithTheme = (props: ZoomControlsProps, theme = lightTheme) => {
        return render(
            <ThemeProvider theme={theme}>
                <ZoomControls {...props} />
            </ThemeProvider>
        );
    };

    beforeEach(() => {
        vi.clearAllMocks();
    });

    describe('Rendering', () => {
        it('should render zoom in button', () => {
            // Arrange
            const props = createDefaultProps();

            // Act
            renderWithTheme(props);

            // Assert
            expect(screen.getByRole('button', { name: /zoom in/i })).toBeInTheDocument();
        });

        it('should render zoom out button', () => {
            // Arrange
            const props = createDefaultProps();

            // Act
            renderWithTheme(props);

            // Assert
            expect(screen.getByRole('button', { name: /zoom out/i })).toBeInTheDocument();
        });

        it('should render reset zoom button', () => {
            // Arrange
            const props = createDefaultProps();

            // Act
            renderWithTheme(props);

            // Assert
            expect(screen.getByRole('button', { name: /reset zoom/i })).toBeInTheDocument();
        });

        it('should render all three zoom control buttons', () => {
            // Arrange
            const props = createDefaultProps();

            // Act
            renderWithTheme(props);

            // Assert
            const buttons = screen.getAllByRole('button');
            expect(buttons).toHaveLength(3);
        });
    });

    describe('Current Zoom Level Display', () => {
        it('should display current zoom percentage at 100%', () => {
            // Arrange
            const props = createDefaultProps({ zoomLevel: 1 });

            // Act
            renderWithTheme(props);

            // Assert
            expect(screen.getByText('100%')).toBeInTheDocument();
        });

        it('should display current zoom percentage at 50%', () => {
            // Arrange
            const props = createDefaultProps({ zoomLevel: 0.5 });

            // Act
            renderWithTheme(props);

            // Assert
            expect(screen.getByText('50%')).toBeInTheDocument();
        });

        it('should display current zoom percentage at 200%', () => {
            // Arrange
            const props = createDefaultProps({ zoomLevel: 2 });

            // Act
            renderWithTheme(props);

            // Assert
            expect(screen.getByText('200%')).toBeInTheDocument();
        });

        it('should display rounded zoom percentage for fractional values', () => {
            // Arrange
            const props = createDefaultProps({ zoomLevel: 1.234 });

            // Act
            renderWithTheme(props);

            // Assert
            expect(screen.getByText('123%')).toBeInTheDocument();
        });

        it('should hide zoom percentage when showZoomPercentage is false', () => {
            // Arrange
            const props = createDefaultProps({ zoomLevel: 1, showZoomPercentage: false });

            // Act
            renderWithTheme(props);

            // Assert
            expect(screen.queryByText('100%')).not.toBeInTheDocument();
        });

        it('should show zoom percentage when showZoomPercentage is true', () => {
            // Arrange
            const props = createDefaultProps({ zoomLevel: 1, showZoomPercentage: true });

            // Act
            renderWithTheme(props);

            // Assert
            expect(screen.getByText('100%')).toBeInTheDocument();
        });
    });

    describe('Zoom In Button Click', () => {
        it('should call onZoomIn when zoom in button is clicked', async () => {
            // Arrange
            const onZoomIn = vi.fn();
            const props = createDefaultProps({ onZoomIn });
            const user = userEvent.setup();

            // Act
            renderWithTheme(props);
            await user.click(screen.getByRole('button', { name: /zoom in/i }));

            // Assert
            expect(onZoomIn).toHaveBeenCalledTimes(1);
        });

        it('should call onZoomIn multiple times when clicked multiple times', async () => {
            // Arrange
            const onZoomIn = vi.fn();
            const props = createDefaultProps({ onZoomIn });
            const user = userEvent.setup();

            // Act
            renderWithTheme(props);
            await user.click(screen.getByRole('button', { name: /zoom in/i }));
            await user.click(screen.getByRole('button', { name: /zoom in/i }));
            await user.click(screen.getByRole('button', { name: /zoom in/i }));

            // Assert
            expect(onZoomIn).toHaveBeenCalledTimes(3);
        });
    });

    describe('Zoom Out Button Click', () => {
        it('should call onZoomOut when zoom out button is clicked', async () => {
            // Arrange
            const onZoomOut = vi.fn();
            const props = createDefaultProps({ onZoomOut });
            const user = userEvent.setup();

            // Act
            renderWithTheme(props);
            await user.click(screen.getByRole('button', { name: /zoom out/i }));

            // Assert
            expect(onZoomOut).toHaveBeenCalledTimes(1);
        });

        it('should call onZoomOut multiple times when clicked multiple times', async () => {
            // Arrange
            const onZoomOut = vi.fn();
            const props = createDefaultProps({ onZoomOut });
            const user = userEvent.setup();

            // Act
            renderWithTheme(props);
            await user.click(screen.getByRole('button', { name: /zoom out/i }));
            await user.click(screen.getByRole('button', { name: /zoom out/i }));

            // Assert
            expect(onZoomOut).toHaveBeenCalledTimes(2);
        });
    });

    describe('Reset Zoom Button Click', () => {
        it('should call onZoomReset when reset zoom button is clicked', async () => {
            // Arrange
            const onZoomReset = vi.fn();
            const props = createDefaultProps({ onZoomReset });
            const user = userEvent.setup();

            // Act
            renderWithTheme(props);
            await user.click(screen.getByRole('button', { name: /reset zoom/i }));

            // Assert
            expect(onZoomReset).toHaveBeenCalledTimes(1);
        });

        it('should allow reset zoom even when at max zoom', async () => {
            // Arrange
            const onZoomReset = vi.fn();
            const props = createDefaultProps({ onZoomReset, zoomLevel: 5, maxZoom: 5 });
            const user = userEvent.setup();

            // Act
            renderWithTheme(props);
            await user.click(screen.getByRole('button', { name: /reset zoom/i }));

            // Assert
            expect(onZoomReset).toHaveBeenCalledTimes(1);
        });

        it('should allow reset zoom even when at min zoom', async () => {
            // Arrange
            const onZoomReset = vi.fn();
            const props = createDefaultProps({ onZoomReset, zoomLevel: 0.1, minZoom: 0.1 });
            const user = userEvent.setup();

            // Act
            renderWithTheme(props);
            await user.click(screen.getByRole('button', { name: /reset zoom/i }));

            // Assert
            expect(onZoomReset).toHaveBeenCalledTimes(1);
        });
    });

    describe('Zoom Limits - Minimum Zoom', () => {
        it('should disable zoom out button when at minimum zoom', () => {
            // Arrange
            const props = createDefaultProps({ zoomLevel: 0.1, minZoom: 0.1 });

            // Act
            renderWithTheme(props);

            // Assert
            expect(screen.getByRole('button', { name: /zoom out/i })).toBeDisabled();
        });

        it('should enable zoom out button when above minimum zoom', () => {
            // Arrange
            const props = createDefaultProps({ zoomLevel: 0.5, minZoom: 0.1 });

            // Act
            renderWithTheme(props);

            // Assert
            expect(screen.getByRole('button', { name: /zoom out/i })).not.toBeDisabled();
        });

        it('should use custom minimum zoom value', () => {
            // Arrange
            const props = createDefaultProps({ zoomLevel: 0.25, minZoom: 0.25 });

            // Act
            renderWithTheme(props);

            // Assert
            expect(screen.getByRole('button', { name: /zoom out/i })).toBeDisabled();
        });

        it('should not call onZoomOut when zoom out button is disabled', async () => {
            // Arrange
            const onZoomOut = vi.fn();
            const props = createDefaultProps({ onZoomOut, zoomLevel: 0.1, minZoom: 0.1 });
            const user = userEvent.setup({ pointerEventsCheck: 0 });

            // Act
            renderWithTheme(props);
            await user.click(screen.getByRole('button', { name: /zoom out/i }));

            // Assert
            expect(onZoomOut).not.toHaveBeenCalled();
        });
    });

    describe('Zoom Limits - Maximum Zoom', () => {
        it('should disable zoom in button when at maximum zoom', () => {
            // Arrange
            const props = createDefaultProps({ zoomLevel: 5, maxZoom: 5 });

            // Act
            renderWithTheme(props);

            // Assert
            expect(screen.getByRole('button', { name: /zoom in/i })).toBeDisabled();
        });

        it('should enable zoom in button when below maximum zoom', () => {
            // Arrange
            const props = createDefaultProps({ zoomLevel: 2, maxZoom: 5 });

            // Act
            renderWithTheme(props);

            // Assert
            expect(screen.getByRole('button', { name: /zoom in/i })).not.toBeDisabled();
        });

        it('should use custom maximum zoom value', () => {
            // Arrange
            const props = createDefaultProps({ zoomLevel: 3, maxZoom: 3 });

            // Act
            renderWithTheme(props);

            // Assert
            expect(screen.getByRole('button', { name: /zoom in/i })).toBeDisabled();
        });

        it('should not call onZoomIn when zoom in button is disabled', async () => {
            // Arrange
            const onZoomIn = vi.fn();
            const props = createDefaultProps({ onZoomIn, zoomLevel: 5, maxZoom: 5 });
            const user = userEvent.setup({ pointerEventsCheck: 0 });

            // Act
            renderWithTheme(props);
            await user.click(screen.getByRole('button', { name: /zoom in/i }));

            // Assert
            expect(onZoomIn).not.toHaveBeenCalled();
        });
    });

    describe('Disabled States at Limits', () => {
        it('should only disable zoom in when at max zoom', () => {
            // Arrange
            const props = createDefaultProps({ zoomLevel: 5, maxZoom: 5, minZoom: 0.1 });

            // Act
            renderWithTheme(props);

            // Assert
            expect(screen.getByRole('button', { name: /zoom in/i })).toBeDisabled();
            expect(screen.getByRole('button', { name: /zoom out/i })).not.toBeDisabled();
            expect(screen.getByRole('button', { name: /reset zoom/i })).not.toBeDisabled();
        });

        it('should only disable zoom out when at min zoom', () => {
            // Arrange
            const props = createDefaultProps({ zoomLevel: 0.1, minZoom: 0.1, maxZoom: 5 });

            // Act
            renderWithTheme(props);

            // Assert
            expect(screen.getByRole('button', { name: /zoom in/i })).not.toBeDisabled();
            expect(screen.getByRole('button', { name: /zoom out/i })).toBeDisabled();
            expect(screen.getByRole('button', { name: /reset zoom/i })).not.toBeDisabled();
        });

        it('should enable both zoom buttons when zoom is between limits', () => {
            // Arrange
            const props = createDefaultProps({ zoomLevel: 1, minZoom: 0.1, maxZoom: 5 });

            // Act
            renderWithTheme(props);

            // Assert
            expect(screen.getByRole('button', { name: /zoom in/i })).not.toBeDisabled();
            expect(screen.getByRole('button', { name: /zoom out/i })).not.toBeDisabled();
        });

        it('should never disable reset zoom button', () => {
            // Arrange
            const propsAtMin = createDefaultProps({ zoomLevel: 0.1, minZoom: 0.1 });
            const propsAtMax = createDefaultProps({ zoomLevel: 5, maxZoom: 5 });

            // Act & Assert - at minimum zoom
            const { unmount } = renderWithTheme(propsAtMin);
            expect(screen.getByRole('button', { name: /reset zoom/i })).not.toBeDisabled();
            unmount();

            // Act & Assert - at maximum zoom
            renderWithTheme(propsAtMax);
            expect(screen.getByRole('button', { name: /reset zoom/i })).not.toBeDisabled();
        });
    });

    describe('Theme Support', () => {
        it('should render correctly in light theme', () => {
            // Arrange
            const props = createDefaultProps();

            // Act
            renderWithTheme(props, lightTheme);

            // Assert
            expect(screen.getByRole('button', { name: /zoom in/i })).toBeInTheDocument();
            expect(screen.getByRole('button', { name: /zoom out/i })).toBeInTheDocument();
            expect(screen.getByRole('button', { name: /reset zoom/i })).toBeInTheDocument();
        });

        it('should render correctly in dark theme', () => {
            // Arrange
            const props = createDefaultProps();

            // Act
            renderWithTheme(props, darkTheme);

            // Assert
            expect(screen.getByRole('button', { name: /zoom in/i })).toBeInTheDocument();
            expect(screen.getByRole('button', { name: /zoom out/i })).toBeInTheDocument();
            expect(screen.getByRole('button', { name: /reset zoom/i })).toBeInTheDocument();
        });

        it('should display zoom percentage in light theme', () => {
            // Arrange
            const props = createDefaultProps({ zoomLevel: 1 });

            // Act
            renderWithTheme(props, lightTheme);

            // Assert
            expect(screen.getByText('100%')).toBeInTheDocument();
        });

        it('should display zoom percentage in dark theme', () => {
            // Arrange
            const props = createDefaultProps({ zoomLevel: 1 });

            // Act
            renderWithTheme(props, darkTheme);

            // Assert
            expect(screen.getByText('100%')).toBeInTheDocument();
        });
    });

    describe('Accessibility', () => {
        it('should have accessible name for zoom in button', () => {
            // Arrange
            const props = createDefaultProps();

            // Act
            renderWithTheme(props);

            // Assert
            expect(screen.getByRole('button', { name: /zoom in/i })).toHaveAccessibleName('Zoom In');
        });

        it('should have accessible name for zoom out button', () => {
            // Arrange
            const props = createDefaultProps();

            // Act
            renderWithTheme(props);

            // Assert
            expect(screen.getByRole('button', { name: /zoom out/i })).toHaveAccessibleName('Zoom Out');
        });

        it('should have accessible name for reset zoom button', () => {
            // Arrange
            const props = createDefaultProps();

            // Act
            renderWithTheme(props);

            // Assert
            expect(screen.getByRole('button', { name: /reset zoom/i })).toHaveAccessibleName('Reset Zoom');
        });

        it('should have aria-label for current zoom level display', () => {
            // Arrange
            const props = createDefaultProps({ zoomLevel: 1 });

            // Act
            renderWithTheme(props);

            // Assert
            expect(screen.getByLabelText('Current zoom level')).toBeInTheDocument();
        });
    });

    describe('Semantic IDs', () => {
        it('should have semantic id for zoom in button with default prefix', () => {
            // Arrange
            const props = createDefaultProps();

            // Act
            const { container } = renderWithTheme(props);

            // Assert
            expect(container.querySelector('#zoom-btn-in')).toBeInTheDocument();
        });

        it('should have semantic id for zoom out button with default prefix', () => {
            // Arrange
            const props = createDefaultProps();

            // Act
            const { container } = renderWithTheme(props);

            // Assert
            expect(container.querySelector('#zoom-btn-out')).toBeInTheDocument();
        });

        it('should have semantic id for reset button with default prefix', () => {
            // Arrange
            const props = createDefaultProps();

            // Act
            const { container } = renderWithTheme(props);

            // Assert
            expect(container.querySelector('#zoom-btn-reset')).toBeInTheDocument();
        });

        it('should use custom idPrefix for button ids', () => {
            // Arrange
            const props = createDefaultProps({ idPrefix: 'editor-zoom' });

            // Act
            const { container } = renderWithTheme(props);

            // Assert
            expect(container.querySelector('#editor-zoom-btn-in')).toBeInTheDocument();
            expect(container.querySelector('#editor-zoom-btn-out')).toBeInTheDocument();
            expect(container.querySelector('#editor-zoom-btn-reset')).toBeInTheDocument();
        });
    });

    describe('Multiple Interactions', () => {
        it('should handle zoom in and zoom out in sequence', async () => {
            // Arrange
            const onZoomIn = vi.fn();
            const onZoomOut = vi.fn();
            const props = createDefaultProps({ onZoomIn, onZoomOut });
            const user = userEvent.setup();

            // Act
            renderWithTheme(props);
            await user.click(screen.getByRole('button', { name: /zoom in/i }));
            await user.click(screen.getByRole('button', { name: /zoom in/i }));
            await user.click(screen.getByRole('button', { name: /zoom out/i }));

            // Assert
            expect(onZoomIn).toHaveBeenCalledTimes(2);
            expect(onZoomOut).toHaveBeenCalledTimes(1);
        });

        it('should handle zoom in, reset, then zoom out in sequence', async () => {
            // Arrange
            const onZoomIn = vi.fn();
            const onZoomOut = vi.fn();
            const onZoomReset = vi.fn();
            const props = createDefaultProps({ onZoomIn, onZoomOut, onZoomReset });
            const user = userEvent.setup();

            // Act
            renderWithTheme(props);
            await user.click(screen.getByRole('button', { name: /zoom in/i }));
            await user.click(screen.getByRole('button', { name: /reset zoom/i }));
            await user.click(screen.getByRole('button', { name: /zoom out/i }));

            // Assert
            expect(onZoomIn).toHaveBeenCalledTimes(1);
            expect(onZoomReset).toHaveBeenCalledTimes(1);
            expect(onZoomOut).toHaveBeenCalledTimes(1);
        });
    });

    describe('Props Updates', () => {
        it('should update zoom percentage display when zoomLevel prop changes', () => {
            // Arrange
            const props = createDefaultProps({ zoomLevel: 1 });

            // Act
            const { rerender } = renderWithTheme(props);
            expect(screen.getByText('100%')).toBeInTheDocument();

            rerender(
                <ThemeProvider theme={lightTheme}>
                    <ZoomControls {...props} zoomLevel={1.5} />
                </ThemeProvider>
            );

            // Assert
            expect(screen.getByText('150%')).toBeInTheDocument();
        });

        it('should update disabled state when reaching max zoom', () => {
            // Arrange
            const props = createDefaultProps({ zoomLevel: 4, maxZoom: 5 });

            // Act
            const { rerender } = renderWithTheme(props);
            expect(screen.getByRole('button', { name: /zoom in/i })).not.toBeDisabled();

            rerender(
                <ThemeProvider theme={lightTheme}>
                    <ZoomControls {...props} zoomLevel={5} />
                </ThemeProvider>
            );

            // Assert
            expect(screen.getByRole('button', { name: /zoom in/i })).toBeDisabled();
        });

        it('should update disabled state when reaching min zoom', () => {
            // Arrange
            const props = createDefaultProps({ zoomLevel: 0.5, minZoom: 0.1 });

            // Act
            const { rerender } = renderWithTheme(props);
            expect(screen.getByRole('button', { name: /zoom out/i })).not.toBeDisabled();

            rerender(
                <ThemeProvider theme={lightTheme}>
                    <ZoomControls {...props} zoomLevel={0.1} />
                </ThemeProvider>
            );

            // Assert
            expect(screen.getByRole('button', { name: /zoom out/i })).toBeDisabled();
        });
    });

    describe('Default Values', () => {
        it('should use default minZoom of 0.1', () => {
            // Arrange
            const props = createDefaultProps({ zoomLevel: 0.1 });

            // Act
            renderWithTheme(props);

            // Assert
            expect(screen.getByRole('button', { name: /zoom out/i })).toBeDisabled();
        });

        it('should use default maxZoom of 5', () => {
            // Arrange
            const props = createDefaultProps({ zoomLevel: 5 });

            // Act
            renderWithTheme(props);

            // Assert
            expect(screen.getByRole('button', { name: /zoom in/i })).toBeDisabled();
        });

        it('should show zoom percentage by default', () => {
            // Arrange
            const props = createDefaultProps({ zoomLevel: 1 });

            // Act
            renderWithTheme(props);

            // Assert
            expect(screen.getByText('100%')).toBeInTheDocument();
        });
    });

    describe('Edge Cases', () => {
        it('should handle very small zoom values', () => {
            // Arrange
            const props = createDefaultProps({ zoomLevel: 0.1, minZoom: 0.1 });

            // Act
            renderWithTheme(props);

            // Assert
            expect(screen.getByText('10%')).toBeInTheDocument();
            expect(screen.getByRole('button', { name: /zoom out/i })).toBeDisabled();
        });

        it('should handle very large zoom values', () => {
            // Arrange
            const props = createDefaultProps({ zoomLevel: 5, maxZoom: 5 });

            // Act
            renderWithTheme(props);

            // Assert
            expect(screen.getByText('500%')).toBeInTheDocument();
            expect(screen.getByRole('button', { name: /zoom in/i })).toBeDisabled();
        });

        it('should handle zoom level exactly at 100%', () => {
            // Arrange
            const props = createDefaultProps({ zoomLevel: 1 });

            // Act
            renderWithTheme(props);

            // Assert
            expect(screen.getByText('100%')).toBeInTheDocument();
            expect(screen.getByRole('button', { name: /zoom in/i })).not.toBeDisabled();
            expect(screen.getByRole('button', { name: /zoom out/i })).not.toBeDisabled();
        });
    });
});
