import { createTheme, ThemeProvider } from '@mui/material/styles';
import { fireEvent, render, screen, waitFor, within } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import React from 'react';
import { beforeEach, describe, expect, it, vi } from 'vitest';
import { LightSourceType, type EncounterLightSource } from '@/types/domain';
import { LightsPanel, type LightsPanelProps, type LightPlacementProperties } from './LightsPanel';

// Mock the stageApi
const mockUpdateLight = vi.fn().mockReturnValue({
    unwrap: () => Promise.resolve(),
});
const mockDeleteLight = vi.fn().mockReturnValue({
    unwrap: () => Promise.resolve(),
});

vi.mock('@/services/stageApi', () => ({
    useUpdateLightMutation: () => [mockUpdateLight],
    useDeleteLightMutation: () => [mockDeleteLight],
}));

const createMockLightSource = (overrides: Partial<EncounterLightSource> = {}): EncounterLightSource => ({
    index: 0,
    name: 'Torch',
    type: LightSourceType.Natural,
    position: { x: 100, y: 100 },
    range: 4,
    isOn: true,
    ...overrides,
});

const renderWithTheme = (component: React.ReactElement, mode: 'light' | 'dark' = 'light') => {
    const theme = createTheme({ palette: { mode } });
    return render(<ThemeProvider theme={theme}>{component}</ThemeProvider>);
};

const renderComponent = (props: Partial<LightsPanelProps> = {}, mode: 'light' | 'dark' = 'light') => {
    const defaultProps: LightsPanelProps = {
        encounterId: 'encounter-1',
        lightSources: [],
        selectedSourceIndex: null,
        onSourceSelect: vi.fn<(index: number) => void>(),
        onPlaceLight: vi.fn<(properties: LightPlacementProperties) => void>(),
        gridScale: 5,
    };

    return renderWithTheme(<LightsPanel {...defaultProps} {...props} />, mode);
};

describe('LightsPanel', () => {
    beforeEach(() => {
        // Arrange - Clean up mocks before each test
        vi.clearAllMocks();
    });

    describe('Rendering with Empty Lights List', () => {
        it('should render all section headers', () => {
            // Arrange & Act
            renderComponent();

            // Assert
            expect(screen.getByText('New Light Source')).toBeInTheDocument();
            expect(screen.getByText(/Placed Lights/)).toBeInTheDocument();
        });

        it('should display "No lights placed" when list is empty', () => {
            // Arrange & Act
            renderComponent({ lightSources: [] });

            // Assert
            expect(screen.getByText('No lights placed')).toBeInTheDocument();
        });

        it('should display placed lights count as zero', () => {
            // Arrange & Act
            renderComponent({ lightSources: [] });

            // Assert
            expect(screen.getByText('Placed Lights (0)')).toBeInTheDocument();
        });

        it('should render type selection dropdown', () => {
            // Arrange & Act
            renderComponent();

            // Assert
            expect(screen.getByLabelText('Type')).toBeInTheDocument();
        });

        it('should render mode selection dropdown', () => {
            // Arrange & Act
            renderComponent();

            // Assert
            expect(screen.getByLabelText('Mode')).toBeInTheDocument();
        });

        it('should render place light button', () => {
            // Arrange & Act
            renderComponent();

            // Assert
            expect(screen.getByRole('button', { name: /Place a Light Source/i })).toBeInTheDocument();
        });
    });

    describe('Rendering with Lights Data', () => {
        it('should display placed lights count correctly', () => {
            // Arrange
            const lights = [
                createMockLightSource({ index: 0, name: 'Torch 1' }),
                createMockLightSource({ index: 1, name: 'Torch 2' }),
            ];

            // Act
            renderComponent({ lightSources: lights });

            // Assert
            expect(screen.getByText('Placed Lights (2)')).toBeInTheDocument();
        });

        it('should display light names in the list', () => {
            // Arrange
            const lights = [
                createMockLightSource({ index: 0, name: 'Campfire' }),
                createMockLightSource({ index: 1, name: 'Lantern' }),
            ];

            // Act
            renderComponent({ lightSources: lights });

            // Assert
            expect(screen.getByText('Campfire')).toBeInTheDocument();
            expect(screen.getByText('Lantern')).toBeInTheDocument();
        });

        it('should display light type and status in secondary text', () => {
            // Arrange
            const lights = [
                createMockLightSource({ index: 0, name: 'Torch', type: LightSourceType.Natural, isOn: true }),
            ];

            // Act
            renderComponent({ lightSources: lights });

            // Assert
            expect(screen.getByText(/Natural/)).toBeInTheDocument();
            expect(screen.getByText(/On/)).toBeInTheDocument();
        });

        it('should display fallback name when light has no name', () => {
            // Arrange
            const lights = [createMockLightSource({ index: 5, name: undefined })];

            // Act
            renderComponent({ lightSources: lights });

            // Assert
            expect(screen.getByText('Light #5')).toBeInTheDocument();
        });

        it('should display Beam mode for directional lights', () => {
            // Arrange
            const lights = [
                createMockLightSource({ index: 0, name: 'Spotlight', direction: 45, arc: 60 }),
            ];

            // Act
            renderComponent({ lightSources: lights });

            // Assert
            expect(screen.getByText(/Beam/)).toBeInTheDocument();
        });

        it('should display Spot mode for non-directional lights', () => {
            // Arrange
            const lights = [
                createMockLightSource({ index: 0, name: 'Torch', direction: undefined, arc: undefined }),
            ];

            // Act
            renderComponent({ lightSources: lights });

            // Assert - Check within the list item secondary text
            const listItem = screen.getByText('Torch').closest('li');
            expect(within(listItem!).getByText(/Spot/)).toBeInTheDocument();
        });
    });

    describe('Add Light Button Interaction', () => {
        it('should call onPlaceLight when place light button is clicked', async () => {
            // Arrange
            const user = userEvent.setup();
            const onPlaceLight = vi.fn();
            renderComponent({ onPlaceLight });

            // Act
            const placeButton = screen.getByRole('button', { name: /Place a Light Source/i });
            await user.click(placeButton);

            // Assert
            expect(onPlaceLight).toHaveBeenCalledTimes(1);
        });

        it('should pass default Natural type to onPlaceLight', async () => {
            // Arrange
            const user = userEvent.setup();
            const onPlaceLight = vi.fn();
            renderComponent({ onPlaceLight });

            // Act
            const placeButton = screen.getByRole('button', { name: /Place a Light Source/i });
            await user.click(placeButton);

            // Assert
            expect(onPlaceLight).toHaveBeenCalledWith(
                expect.objectContaining({
                    type: LightSourceType.Natural,
                    isOn: true,
                }),
            );
        });

        it('should pass isDirectional false (Spot) by default', async () => {
            // Arrange
            const user = userEvent.setup();
            const onPlaceLight = vi.fn();
            renderComponent({ onPlaceLight });

            // Act
            const placeButton = screen.getByRole('button', { name: /Place a Light Source/i });
            await user.click(placeButton);

            // Assert
            expect(onPlaceLight).toHaveBeenCalledWith(
                expect.objectContaining({
                    isDirectional: false,
                }),
            );
        });
    });

    describe('Light Type Selection', () => {
        it('should render type dropdown with all light type options', async () => {
            // Arrange
            const user = userEvent.setup();
            renderComponent();

            // Act - Open dropdown
            const typeSelect = screen.getByLabelText('Type');
            await user.click(typeSelect);

            // Assert - All options should be visible
            expect(await screen.findByRole('option', { name: 'Natural' })).toBeInTheDocument();
            expect(screen.getByRole('option', { name: 'Artificial' })).toBeInTheDocument();
            expect(screen.getByRole('option', { name: 'Supernatural' })).toBeInTheDocument();
        });

        it('should allow selecting Artificial type from dropdown', async () => {
            // Arrange
            const user = userEvent.setup();
            renderComponent();

            // Act - Open dropdown and select Artificial
            const typeSelect = screen.getByLabelText('Type');
            await user.click(typeSelect);
            const artificialOption = await screen.findByRole('option', { name: 'Artificial' });
            await user.click(artificialOption);

            // Assert - Dropdown should close (option no longer visible as selected)
            await waitFor(() => {
                expect(screen.queryByRole('option', { name: 'Artificial' })).not.toBeInTheDocument();
            });
        });

        it('should allow selecting Supernatural type from dropdown', async () => {
            // Arrange
            const user = userEvent.setup();
            renderComponent();

            // Act - Open dropdown and select Supernatural
            const typeSelect = screen.getByLabelText('Type');
            await user.click(typeSelect);
            const supernaturalOption = await screen.findByRole('option', { name: 'Supernatural' });
            await user.click(supernaturalOption);

            // Assert - Dropdown should close
            await waitFor(() => {
                expect(screen.queryByRole('option', { name: 'Supernatural' })).not.toBeInTheDocument();
            });
        });
    });

    describe('Light Mode Selection', () => {
        it('should change mode when Beam is selected', async () => {
            // Arrange
            const user = userEvent.setup();
            const onPlaceLight = vi.fn();
            renderComponent({ onPlaceLight });

            // Act - Open mode dropdown and select Beam
            const modeSelect = screen.getByLabelText('Mode');
            await user.click(modeSelect);
            const beamOption = await screen.findByRole('option', { name: 'Beam' });
            await user.click(beamOption);

            // Place the light
            const placeButton = screen.getByRole('button', { name: /Place a Light Source/i });
            await user.click(placeButton);

            // Assert
            expect(onPlaceLight).toHaveBeenCalledWith(
                expect.objectContaining({
                    isDirectional: true,
                }),
            );
        });
    });

    describe('Selection Behavior', () => {
        it('should call onSourceSelect when light list item is clicked', async () => {
            // Arrange
            const user = userEvent.setup();
            const onSourceSelect = vi.fn();
            const lights = [createMockLightSource({ index: 3, name: 'Torch' })];
            renderComponent({ lightSources: lights, onSourceSelect });

            // Act
            const lightListItem = screen.getByText('Torch');
            await user.click(lightListItem);

            // Assert
            expect(onSourceSelect).toHaveBeenCalledWith(3);
        });

        it('should highlight selected light in the list', () => {
            // Arrange
            const lights = [createMockLightSource({ index: 0, name: 'Torch' })];

            // Act
            renderComponent({ lightSources: lights, selectedSourceIndex: 0 });

            // Assert - The ListItemButton should have selected class
            const listItemButton = screen.getByRole('button', { name: /Torch/i });
            expect(listItemButton).toHaveClass('Mui-selected');
        });

        it('should not highlight unselected lights', () => {
            // Arrange
            const lights = [
                createMockLightSource({ index: 0, name: 'Torch 1' }),
                createMockLightSource({ index: 1, name: 'Torch 2' }),
            ];

            // Act
            renderComponent({ lightSources: lights, selectedSourceIndex: 0 });

            // Assert
            const torch2Button = screen.getByRole('button', { name: /Torch 2/i });
            expect(torch2Button).not.toHaveClass('Mui-selected');
        });
    });

    describe('Delete Light Interactions', () => {
        it('should show delete confirmation dialog when delete button is clicked', async () => {
            // Arrange
            const user = userEvent.setup();
            const lights = [createMockLightSource({ index: 0, name: 'Torch' })];
            renderComponent({ lightSources: lights });

            // Act - Find delete button by its id
            const deleteButton = screen.getByRole('button', { name: /Delete/i });
            await user.click(deleteButton);

            // Assert
            expect(await screen.findByText('Delete Light')).toBeInTheDocument();
            expect(screen.getByText(/Are you sure you want to delete this light/i)).toBeInTheDocument();
        });

        it('should call deleteLight mutation when delete is confirmed', async () => {
            // Arrange
            const user = userEvent.setup();
            const lights = [createMockLightSource({ index: 0, name: 'Torch' })];
            renderComponent({ lightSources: lights, encounterId: 'enc-123' });

            // Act - Click delete button by its aria label
            const deleteButton = screen.getByRole('button', { name: /Delete/i });
            await user.click(deleteButton);

            // Confirm deletion
            const confirmButton = await screen.findByRole('button', { name: /Confirm/i });
            await user.click(confirmButton);

            // Assert
            expect(mockDeleteLight).toHaveBeenCalledWith({
                stageId: 'enc-123',
                index: 0,
            });
        });

        it('should not call deleteLight when delete is cancelled', async () => {
            // Arrange
            const user = userEvent.setup();
            const lights = [createMockLightSource({ index: 0, name: 'Torch' })];
            renderComponent({ lightSources: lights });

            // Act - Click delete button by its aria label
            const deleteButton = screen.getByRole('button', { name: /Delete/i });
            await user.click(deleteButton);

            // Cancel deletion
            const cancelButton = await screen.findByRole('button', { name: /Cancel/i });
            await user.click(cancelButton);

            // Assert
            expect(mockDeleteLight).not.toHaveBeenCalled();
        });
    });

    describe('Light Property Controls', () => {
        it('should toggle expansion when expand button is clicked', async () => {
            // Arrange
            const lights = [createMockLightSource({ index: 0, name: 'Torch', range: 4 })];
            renderComponent({ lightSources: lights, gridScale: 5 });

            // Act - Find the expand button
            const listItem = screen.getByText('Torch').closest('li');
            expect(listItem).toBeInTheDocument();

            const allButtons = within(listItem!).getAllByRole('button');
            const expandButton = allButtons.find((btn) =>
                btn.classList.contains('MuiIconButton-root') && !btn.hasAttribute('aria-label'),
            );

            if (expandButton) {
                fireEvent.click(expandButton);
            }

            // Assert - Should show expanded details
            await waitFor(() => {
                expect(screen.getByText(/Type:/)).toBeInTheDocument();
                expect(screen.getByText(/Mode:/)).toBeInTheDocument();
                expect(screen.getByText(/Range:/)).toBeInTheDocument();
            });
        });

        it('should show Light On checkbox when expanded', async () => {
            // Arrange
            const lights = [createMockLightSource({ index: 0, name: 'Torch', isOn: true })];
            renderComponent({ lightSources: lights });

            // Act - Expand the light
            const listItem = screen.getByText('Torch').closest('li');
            const allButtons = within(listItem!).getAllByRole('button');
            const expandButton = allButtons.find((btn) =>
                btn.classList.contains('MuiIconButton-root') && !btn.hasAttribute('aria-label'),
            );

            if (expandButton) {
                fireEvent.click(expandButton);
            }

            // Assert
            await waitFor(() => {
                expect(screen.getByRole('checkbox', { name: /Light On/i })).toBeInTheDocument();
            });
        });

        it('should call updateLight when isOn checkbox is toggled', async () => {
            // Arrange
            const user = userEvent.setup();
            const lights = [createMockLightSource({ index: 0, name: 'Torch', isOn: true })];
            renderComponent({ lightSources: lights, encounterId: 'enc-123' });

            // Act - Expand the light
            const listItem = screen.getByText('Torch').closest('li');
            const allButtons = within(listItem!).getAllByRole('button');
            const expandButton = allButtons.find((btn) =>
                btn.classList.contains('MuiIconButton-root') && !btn.hasAttribute('aria-label'),
            );

            if (expandButton) {
                fireEvent.click(expandButton);
            }

            // Toggle the checkbox
            await waitFor(() => {
                expect(screen.getByRole('checkbox', { name: /Light On/i })).toBeInTheDocument();
            });
            const checkbox = screen.getByRole('checkbox', { name: /Light On/i });
            await user.click(checkbox);

            // Assert
            expect(mockUpdateLight).toHaveBeenCalledWith({
                stageId: 'enc-123',
                index: 0,
                data: { isOn: false },
            });
        });

        it('should display range in feet based on gridScale', async () => {
            // Arrange
            const lights = [createMockLightSource({ index: 0, name: 'Torch', range: 4 })];
            renderComponent({ lightSources: lights, gridScale: 5 });

            // Act - Expand the light
            const listItem = screen.getByText('Torch').closest('li');
            const allButtons = within(listItem!).getAllByRole('button');
            const expandButton = allButtons.find((btn) =>
                btn.classList.contains('MuiIconButton-root') && !btn.hasAttribute('aria-label'),
            );

            if (expandButton) {
                fireEvent.click(expandButton);
            }

            // Assert - Range should be 4 * 5 = 20 ft
            await waitFor(() => {
                const rangeInput = screen.getByRole('spinbutton');
                expect(rangeInput).toHaveValue(20);
            });
        });

        it('should show editable name field when expanded', async () => {
            // Arrange
            const lights = [createMockLightSource({ index: 0, name: 'Torch' })];
            renderComponent({ lightSources: lights });

            // Act - Expand the light
            const listItem = screen.getByText('Torch').closest('li');
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
                expect(nameInput).toHaveValue('Torch');
            });
        });

        it('should display direction and arc for directional lights', async () => {
            // Arrange
            const lights = [
                createMockLightSource({ index: 0, name: 'Spotlight', direction: 45, arc: 60 }),
            ];
            renderComponent({ lightSources: lights });

            // Act - Expand the light
            const listItem = screen.getByText('Spotlight').closest('li');
            const allButtons = within(listItem!).getAllByRole('button');
            const expandButton = allButtons.find((btn) =>
                btn.classList.contains('MuiIconButton-root') && !btn.hasAttribute('aria-label'),
            );

            if (expandButton) {
                fireEvent.click(expandButton);
            }

            // Assert
            await waitFor(() => {
                expect(screen.getByText('Direction: 45°')).toBeInTheDocument();
                expect(screen.getByText('Arc: 60°')).toBeInTheDocument();
            });
        });

        it('should display color swatch when light has custom color', async () => {
            // Arrange
            const lights = [createMockLightSource({ index: 0, name: 'Blue Light', color: '#0000FF' })];
            renderComponent({ lightSources: lights });

            // Act - Expand the light
            const listItem = screen.getByText('Blue Light').closest('li');
            const allButtons = within(listItem!).getAllByRole('button');
            const expandButton = allButtons.find((btn) =>
                btn.classList.contains('MuiIconButton-root') && !btn.hasAttribute('aria-label'),
            );

            if (expandButton) {
                fireEvent.click(expandButton);
            }

            // Assert
            await waitFor(() => {
                expect(screen.getByText('Color:')).toBeInTheDocument();
                expect(screen.getByText('#0000FF')).toBeInTheDocument();
            });
        });
    });

    describe('Theme Support', () => {
        it('should adapt to light theme', () => {
            // Arrange & Act
            renderComponent({}, 'light');

            // Assert
            expect(screen.getByText('New Light Source')).toBeInTheDocument();
        });

        it('should adapt to dark theme', () => {
            // Arrange & Act
            renderComponent({}, 'dark');

            // Assert
            expect(screen.getByText('New Light Source')).toBeInTheDocument();
        });

        it('should render color picker input', () => {
            // Arrange & Act
            renderComponent();

            // Assert - Color input is an input element with type="color"
            const colorInput = document.querySelector('input[type="color"]');
            expect(colorInput).toBeInTheDocument();
        });
    });

    describe('Color Selection', () => {
        it('should pass custom color to onPlaceLight when set', async () => {
            // Arrange
            const user = userEvent.setup();
            const onPlaceLight = vi.fn();
            renderComponent({ onPlaceLight });

            // Act - Change color (simulate color picker change)
            // Note: Browser normalizes color values to lowercase
            const colorInput = document.querySelector('input[type="color"]') as HTMLInputElement;
            fireEvent.change(colorInput, { target: { value: '#ff0000' } });

            // Place the light
            const placeButton = screen.getByRole('button', { name: /Place a Light Source/i });
            await user.click(placeButton);

            // Assert
            expect(onPlaceLight).toHaveBeenCalledWith(
                expect.objectContaining({
                    color: '#ff0000',
                }),
            );
        });

        it('should use default color based on type when no custom color is set', async () => {
            // Arrange
            const user = userEvent.setup();
            const onPlaceLight = vi.fn();
            renderComponent({ onPlaceLight });

            // Act - Place without changing color
            const placeButton = screen.getByRole('button', { name: /Place a Light Source/i });
            await user.click(placeButton);

            // Assert - Should not have color property when using default
            const callArgs = onPlaceLight.mock.calls[0]?.[0] as LightPlacementProperties;
            expect(callArgs.color).toBeUndefined();
        });
    });

    describe('Light Expansion and Collapse', () => {
        it('should collapse when expand button is clicked again', async () => {
            // Arrange
            const lights = [createMockLightSource({ index: 0, name: 'Torch' })];
            renderComponent({ lightSources: lights });

            // Act - First expand
            const listItem = screen.getByText('Torch').closest('li');
            const allButtons = within(listItem!).getAllByRole('button');
            const expandButton = allButtons.find((btn) =>
                btn.classList.contains('MuiIconButton-root') && !btn.hasAttribute('aria-label'),
            );

            if (expandButton) {
                fireEvent.click(expandButton);
            }

            // Wait for expansion
            await waitFor(() => {
                expect(screen.getByRole('textbox')).toBeInTheDocument();
            });

            // Collapse - need to re-query
            const buttonsAfterExpand = within(listItem!).getAllByRole('button');
            const collapseButton = buttonsAfterExpand.find((btn) =>
                btn.classList.contains('MuiIconButton-root') && !btn.hasAttribute('aria-label'),
            );

            if (collapseButton) {
                fireEvent.click(collapseButton);
            }

            // Assert - Textbox should be removed
            await waitFor(() => {
                expect(screen.queryByRole('textbox')).not.toBeInTheDocument();
            });
        });

        it('should show off status for disabled lights', () => {
            // Arrange
            const lights = [createMockLightSource({ index: 0, name: 'Torch', isOn: false })];

            // Act
            renderComponent({ lightSources: lights });

            // Assert
            expect(screen.getByText(/Off/)).toBeInTheDocument();
        });
    });

    describe('Edit Name Behavior', () => {
        it('should update name on blur when changed', async () => {
            // Arrange
            const user = userEvent.setup();
            const lights = [createMockLightSource({ index: 0, name: 'Torch' })];
            renderComponent({ lightSources: lights, encounterId: 'enc-123' });

            // Act - Expand the light
            const listItem = screen.getByText('Torch').closest('li');
            const allButtons = within(listItem!).getAllByRole('button');
            const expandButton = allButtons.find((btn) =>
                btn.classList.contains('MuiIconButton-root') && !btn.hasAttribute('aria-label'),
            );

            if (expandButton) {
                fireEvent.click(expandButton);
            }

            // Wait for expansion and edit name
            await waitFor(() => {
                expect(screen.getByRole('textbox')).toBeInTheDocument();
            });

            const nameInput = screen.getByRole('textbox');
            await user.clear(nameInput);
            await user.type(nameInput, 'Campfire');
            fireEvent.blur(nameInput);

            // Assert
            await waitFor(() => {
                expect(mockUpdateLight).toHaveBeenCalledWith({
                    stageId: 'enc-123',
                    index: 0,
                    data: { name: 'Campfire' },
                });
            });
        });
    });

    describe('Default Values', () => {
        it('should use default gridScale of 5 when not provided', async () => {
            // Arrange
            const lights = [createMockLightSource({ index: 0, name: 'Torch', range: 4 })];
            const defaultProps: LightsPanelProps = {
                encounterId: 'encounter-1',
                lightSources: lights,
                selectedSourceIndex: null,
                onSourceSelect: vi.fn<(index: number) => void>(),
                onPlaceLight: vi.fn<(properties: LightPlacementProperties) => void>(),
                // gridScale not provided - should default to 5
            };
            renderWithTheme(<LightsPanel {...defaultProps} />);

            // Act - Expand the light
            const listItem = screen.getByText('Torch').closest('li');
            const allButtons = within(listItem!).getAllByRole('button');
            const expandButton = allButtons.find((btn) =>
                btn.classList.contains('MuiIconButton-root') && !btn.hasAttribute('aria-label'),
            );

            if (expandButton) {
                fireEvent.click(expandButton);
            }

            // Assert - Range should be 4 * 5 = 20 ft with default gridScale
            await waitFor(() => {
                const rangeInput = screen.getByRole('spinbutton');
                expect(rangeInput).toHaveValue(20);
            });
        });
    });
});
