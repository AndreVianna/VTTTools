import { fireEvent, render, screen, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { describe, expect, it, vi, beforeEach, afterEach } from 'vitest';
import type { EncounterRegion } from '@/types/domain';
import { RegionContextMenu, type RegionContextMenuProps } from './RegionContextMenu';

describe('RegionContextMenu', () => {
    // Arrange: Default mock region used across tests
    const mockTerrainRegion: EncounterRegion = {
        index: 0,
        name: 'Test Region',
        type: 'Terrain',
        vertices: [
            { x: 0, y: 0 },
            { x: 100, y: 0 },
            { x: 100, y: 100 },
        ],
        value: 0,
    };

    const mockElevationRegion: EncounterRegion = {
        index: 1,
        name: 'Elevated Area',
        type: 'Elevation',
        vertices: [
            { x: 0, y: 0 },
            { x: 50, y: 0 },
            { x: 50, y: 50 },
        ],
        value: 10,
    };

    const mockIlluminationRegion: EncounterRegion = {
        index: 2,
        name: 'Dark Zone',
        type: 'Illumination',
        vertices: [
            { x: 0, y: 0 },
            { x: 100, y: 0 },
            { x: 100, y: 100 },
        ],
        value: -2,
    };

    const mockFogOfWarRegion: EncounterRegion = {
        index: 3,
        name: 'Hidden Area',
        type: 'FogOfWar',
        vertices: [
            { x: 0, y: 0 },
            { x: 100, y: 0 },
            { x: 100, y: 100 },
        ],
        value: 2,
    };

    const defaultProps: RegionContextMenuProps = {
        anchorPosition: { left: 100, top: 100 },
        open: true,
        onClose: vi.fn<() => void>(),
        encounterRegion: mockTerrainRegion,
        onRegionUpdate: vi.fn<(regionIndex: number, updates: Partial<EncounterRegion>) => void>(),
    };

    const renderComponent = (props: Partial<RegionContextMenuProps> = {}) => {
        return render(<RegionContextMenu {...defaultProps} {...props} />);
    };

    beforeEach(() => {
        vi.clearAllMocks();
    });

    afterEach(() => {
        vi.clearAllMocks();
    });

    describe('Rendering', () => {
        it('should render menu when open is true', () => {
            // Arrange & Act
            renderComponent();

            // Assert
            expect(screen.getByText('Terrain')).toBeInTheDocument();
            expect(screen.getByText('Name:')).toBeInTheDocument();
            expect(screen.getByText('Value:')).toBeInTheDocument();
        });

        it('should not render when open is false', () => {
            // Arrange & Act
            renderComponent({ open: false });

            // Assert
            expect(screen.queryByText('Terrain')).not.toBeInTheDocument();
        });

        it('should not render when encounterRegion is null', () => {
            // Arrange & Act
            renderComponent({ encounterRegion: null });

            // Assert
            expect(screen.queryByText('Name:')).not.toBeInTheDocument();
        });

        it('should display region type as header', () => {
            // Arrange & Act
            renderComponent({ encounterRegion: mockElevationRegion });

            // Assert
            expect(screen.getByText('Elevation')).toBeInTheDocument();
        });
    });

    describe('Name Field', () => {
        it('should display current region name in text field', () => {
            // Arrange & Act
            renderComponent();

            // Assert
            const nameInput = screen.getByRole('textbox');
            expect(nameInput).toHaveValue('Test Region');
        });

        it('should update name value on change', async () => {
            // Arrange
            const user = userEvent.setup();
            renderComponent();
            const nameInput = screen.getByRole('textbox');

            // Act
            await user.clear(nameInput);
            await user.type(nameInput, 'New Region Name');

            // Assert
            expect(nameInput).toHaveValue('New Region Name');
        });

        it('should call onRegionUpdate when name is changed and blurred', async () => {
            // Arrange
            const onRegionUpdate = vi.fn();
            const user = userEvent.setup();
            renderComponent({ onRegionUpdate });
            const nameInput = screen.getByRole('textbox');

            // Act
            await user.clear(nameInput);
            await user.type(nameInput, 'Updated Name');
            fireEvent.blur(nameInput);

            // Assert
            await waitFor(() => {
                expect(onRegionUpdate).toHaveBeenCalledWith(0, { name: 'Updated Name' });
            });
        });

        it('should not call onRegionUpdate when name is unchanged', async () => {
            // Arrange
            const onRegionUpdate = vi.fn();
            renderComponent({ onRegionUpdate });
            const nameInput = screen.getByRole('textbox');

            // Act
            fireEvent.blur(nameInput);

            // Assert
            expect(onRegionUpdate).not.toHaveBeenCalled();
        });

        it('should revert name when empty value is blurred', async () => {
            // Arrange
            const onRegionUpdate = vi.fn();
            const user = userEvent.setup();
            renderComponent({ onRegionUpdate });
            const nameInput = screen.getByRole('textbox');

            // Act
            await user.clear(nameInput);
            fireEvent.blur(nameInput);

            // Assert
            await waitFor(() => {
                expect(nameInput).toHaveValue('Test Region');
            });
            expect(onRegionUpdate).not.toHaveBeenCalled();
        });

        it('should submit name on Enter key press', async () => {
            // Arrange
            const onRegionUpdate = vi.fn();
            const user = userEvent.setup();
            renderComponent({ onRegionUpdate });
            const nameInput = screen.getByRole('textbox');

            // Act
            await user.clear(nameInput);
            await user.type(nameInput, 'Enter Name{Enter}');

            // Assert
            await waitFor(() => {
                expect(onRegionUpdate).toHaveBeenCalledWith(0, { name: 'Enter Name' });
            });
        });

        it('should revert displayed name on Escape key press', async () => {
            // Arrange
            const user = userEvent.setup();
            renderComponent();
            const nameInput = screen.getByRole('textbox');

            // Act
            await user.clear(nameInput);
            await user.type(nameInput, 'Changed Name{Escape}');

            // Assert - the displayed value should be reverted to original
            await waitFor(() => {
                expect(nameInput).toHaveValue('Test Region');
            });
        });
    });

    describe('Value Selection for Terrain', () => {
        it('should display select dropdown for terrain type', () => {
            // Arrange & Act
            renderComponent({ encounterRegion: mockTerrainRegion });

            // Assert
            expect(screen.getByRole('combobox')).toBeInTheDocument();
        });

        it('should show terrain value options when dropdown is opened', async () => {
            // Arrange
            const user = userEvent.setup();
            renderComponent({ encounterRegion: mockTerrainRegion });

            // Act
            await user.click(screen.getByRole('combobox'));

            // Assert
            await waitFor(() => {
                expect(screen.getByRole('option', { name: 'Normal' })).toBeInTheDocument();
                expect(screen.getByRole('option', { name: 'Difficult' })).toBeInTheDocument();
                expect(screen.getByRole('option', { name: 'Impassable' })).toBeInTheDocument();
            });
        });

        it('should call onRegionUpdate when terrain value is changed', async () => {
            // Arrange
            const onRegionUpdate = vi.fn();
            const user = userEvent.setup();
            renderComponent({ encounterRegion: mockTerrainRegion, onRegionUpdate });

            // Act
            await user.click(screen.getByRole('combobox'));
            await waitFor(() => {
                expect(screen.getByRole('option', { name: 'Difficult' })).toBeInTheDocument();
            });
            await user.click(screen.getByRole('option', { name: 'Difficult' }));

            // Assert
            await waitFor(() => {
                expect(onRegionUpdate).toHaveBeenCalledWith(0, { value: 1 });
            });
        });
    });

    describe('Value Selection for Illumination', () => {
        it('should show illumination value options', async () => {
            // Arrange
            const user = userEvent.setup();
            renderComponent({ encounterRegion: mockIlluminationRegion });

            // Act
            await user.click(screen.getByRole('combobox'));

            // Assert
            await waitFor(() => {
                expect(screen.getByRole('option', { name: 'Darkness' })).toBeInTheDocument();
                expect(screen.getByRole('option', { name: 'Dim' })).toBeInTheDocument();
                expect(screen.getByRole('option', { name: 'Normal' })).toBeInTheDocument();
                expect(screen.getByRole('option', { name: 'Bright' })).toBeInTheDocument();
            });
        });

        it('should call onRegionUpdate when illumination value is changed', async () => {
            // Arrange
            const onRegionUpdate = vi.fn();
            const user = userEvent.setup();
            renderComponent({ encounterRegion: mockIlluminationRegion, onRegionUpdate });

            // Act
            await user.click(screen.getByRole('combobox'));
            await waitFor(() => {
                expect(screen.getByRole('option', { name: 'Bright' })).toBeInTheDocument();
            });
            await user.click(screen.getByRole('option', { name: 'Bright' }));

            // Assert
            await waitFor(() => {
                expect(onRegionUpdate).toHaveBeenCalledWith(2, { value: 1 });
            });
        });
    });

    describe('Value Selection for FogOfWar', () => {
        it('should show fog of war value options', async () => {
            // Arrange
            const user = userEvent.setup();
            renderComponent({ encounterRegion: mockFogOfWarRegion });

            // Act
            await user.click(screen.getByRole('combobox'));

            // Assert
            await waitFor(() => {
                expect(screen.getByRole('option', { name: 'Visible' })).toBeInTheDocument();
                expect(screen.getByRole('option', { name: 'Outdated' })).toBeInTheDocument();
                expect(screen.getByRole('option', { name: 'Hidden' })).toBeInTheDocument();
            });
        });

        it('should call onRegionUpdate when fog of war value is changed', async () => {
            // Arrange
            const onRegionUpdate = vi.fn();
            const user = userEvent.setup();
            renderComponent({ encounterRegion: mockFogOfWarRegion, onRegionUpdate });

            // Act
            await user.click(screen.getByRole('combobox'));
            await waitFor(() => {
                expect(screen.getByRole('option', { name: 'Visible' })).toBeInTheDocument();
            });
            await user.click(screen.getByRole('option', { name: 'Visible' }));

            // Assert
            await waitFor(() => {
                expect(onRegionUpdate).toHaveBeenCalledWith(3, { value: 0 });
            });
        });
    });

    describe('Elevation Input', () => {
        it('should display number input for elevation type', () => {
            // Arrange & Act
            renderComponent({ encounterRegion: mockElevationRegion });

            // Assert
            const elevationInput = screen.getByRole('spinbutton');
            expect(elevationInput).toBeInTheDocument();
            expect(elevationInput).toHaveValue(10);
        });

        it('should call onRegionUpdate when elevation value is changed', async () => {
            // Arrange
            const onRegionUpdate = vi.fn();
            const user = userEvent.setup();
            renderComponent({ encounterRegion: mockElevationRegion, onRegionUpdate });
            const elevationInput = screen.getByRole('spinbutton');

            // Act
            await user.clear(elevationInput);
            await user.type(elevationInput, '25');

            // Assert
            await waitFor(() => {
                expect(onRegionUpdate).toHaveBeenCalled();
            });
        });
    });

    describe('Menu Close Behavior', () => {
        it('should call onClose when clicking outside the menu', async () => {
            // Arrange
            const onClose = vi.fn();
            renderComponent({ onClose });

            // Act
            // Simulate click outside by triggering mousedown on document
            const mouseDownEvent = new MouseEvent('mousedown', {
                bubbles: true,
                cancelable: true,
            });
            document.dispatchEvent(mouseDownEvent);

            // Assert
            await waitFor(() => {
                expect(onClose).toHaveBeenCalled();
            });
        });
    });

    describe('Edge Cases', () => {
        it('should handle region with undefined name', () => {
            // Arrange
            const regionWithNoName: EncounterRegion = {
                ...mockTerrainRegion,
                name: undefined,
            };

            // Act
            renderComponent({ encounterRegion: regionWithNoName });

            // Assert
            const nameInput = screen.getByRole('textbox');
            expect(nameInput).toHaveValue('');
        });

        it('should handle region with undefined value', () => {
            // Arrange
            const regionWithNoValue: EncounterRegion = {
                ...mockTerrainRegion,
                value: undefined,
            };

            // Act
            renderComponent({ encounterRegion: regionWithNoValue });

            // Assert
            expect(screen.getByRole('combobox')).toBeInTheDocument();
        });

        it('should not call onRegionUpdate when onRegionUpdate is undefined', async () => {
            // Arrange
            const user = userEvent.setup();
            renderComponent({ onRegionUpdate: undefined });

            // Act - should not throw
            await user.click(screen.getByRole('combobox'));
            await waitFor(() => {
                expect(screen.getByRole('option', { name: 'Difficult' })).toBeInTheDocument();
            });
            await user.click(screen.getByRole('option', { name: 'Difficult' }));

            // Assert - no error thrown
            expect(true).toBe(true);
        });

        it('should sync name value when region changes', async () => {
            // Arrange
            const { rerender } = renderComponent({ encounterRegion: mockTerrainRegion });
            expect(screen.getByRole('textbox')).toHaveValue('Test Region');

            // Act
            const newRegion: EncounterRegion = {
                ...mockTerrainRegion,
                name: 'Different Region',
            };
            rerender(<RegionContextMenu {...defaultProps} encounterRegion={newRegion} />);

            // Assert
            await waitFor(() => {
                expect(screen.getByRole('textbox')).toHaveValue('Different Region');
            });
        });

        it('should trim whitespace from name before updating', async () => {
            // Arrange
            const onRegionUpdate = vi.fn();
            const user = userEvent.setup();
            renderComponent({ onRegionUpdate });
            const nameInput = screen.getByRole('textbox');

            // Act
            await user.clear(nameInput);
            await user.type(nameInput, '  Trimmed Name  ');
            fireEvent.blur(nameInput);

            // Assert
            await waitFor(() => {
                expect(onRegionUpdate).toHaveBeenCalledWith(0, { name: 'Trimmed Name' });
            });
        });
    });
});
