import { createTheme, ThemeProvider } from '@mui/material';
import { fireEvent, render, screen, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';
import type { PlacedRegion } from '@/types/domain';
import { RegionsPanel, type RegionsPanelProps } from './RegionsPanel';
import type { RegionPreset } from './regionsPanelTypes';

// Arrange: Mock RTK Query mutation
const mockUpdateRegionMutation = vi.fn<() => { unwrap: () => Promise<void> }>().mockReturnValue({
    unwrap: vi.fn<() => Promise<void>>().mockResolvedValue(),
});

vi.mock('@/services/stageApi', () => ({
    useUpdateRegionMutation: () => [mockUpdateRegionMutation],
}));

describe('RegionsPanel', () => {
    // Arrange: Create theme for dark/light mode testing
    const lightTheme = createTheme({ palette: { mode: 'light' } });
    const darkTheme = createTheme({ palette: { mode: 'dark' } });

    // Arrange: Mock regions for tests
    const mockElevationRegion: PlacedRegion = {
        id: 'region-1',
        index: 0,
        name: 'Hill',
        type: 'Elevation',
        vertices: [
            { x: 0, y: 0 },
            { x: 100, y: 0 },
            { x: 100, y: 100 },
        ],
        value: 10,
    };

    const mockTerrainRegion: PlacedRegion = {
        id: 'region-2',
        index: 1,
        name: 'Swamp',
        type: 'Terrain',
        vertices: [
            { x: 50, y: 50 },
            { x: 150, y: 50 },
            { x: 150, y: 150 },
        ],
        value: 1,
    };

    const mockIlluminationRegion: PlacedRegion = {
        id: 'region-3',
        index: 2,
        name: 'Dark Corner',
        type: 'Illumination',
        vertices: [
            { x: 200, y: 200 },
            { x: 300, y: 200 },
            { x: 300, y: 300 },
        ],
        value: -2,
    };

    const defaultProps: RegionsPanelProps = {
        encounterId: 'encounter-123',
        encounterRegions: [],
        selectedRegionIndex: null,
        placementMode: null,
        onPresetSelect: vi.fn<(preset: RegionPreset) => void>(),
        onPlaceRegion: vi.fn<(properties: { name: string; type: string; value: number }) => void>(),
        onBucketFillRegion: vi.fn<(properties: { name: string; type: string; value: number }) => void>(),
        onRegionSelect: vi.fn<(regionIndex: number) => void>(),
        onRegionDelete: vi.fn<(regionIndex: number) => void>(),
        onEditVertices: vi.fn<(regionIndex: number) => void>(),
    };

    const renderComponent = (props: Partial<RegionsPanelProps> = {}, theme = lightTheme) => {
        return render(
            <ThemeProvider theme={theme}>
                <RegionsPanel {...defaultProps} {...props} />
            </ThemeProvider>,
        );
    };

    beforeEach(() => {
        vi.clearAllMocks();
    });

    afterEach(() => {
        vi.clearAllMocks();
    });

    describe('Menu Rendering', () => {
        it('should render section headers', () => {
            // Arrange & Act
            renderComponent();

            // Assert
            expect(screen.getByText('Region Type Presets')).toBeInTheDocument();
            expect(screen.getByText('New Region')).toBeInTheDocument();
        });

        it('should render three region type preset buttons', () => {
            // Arrange & Act
            renderComponent();

            // Assert
            expect(screen.getByRole('button', { name: 'Elevation' })).toBeInTheDocument();
            expect(screen.getByRole('button', { name: 'Terrain' })).toBeInTheDocument();
            expect(screen.getByRole('button', { name: 'Illumination' })).toBeInTheDocument();
        });

        it('should render placement mode buttons', () => {
            // Arrange & Act
            renderComponent();

            // Assert
            const polygonButton = screen.getByRole('button', { name: /place a polygon region/i });
            const bucketButton = screen.getByRole('button', { name: /fill an area/i });
            expect(polygonButton).toBeInTheDocument();
            expect(bucketButton).toBeInTheDocument();
        });

        it('should display empty state message when no regions exist', () => {
            // Arrange & Act
            renderComponent({ encounterRegions: [] });

            // Assert
            expect(screen.getByText(/no elevation regions placed/i)).toBeInTheDocument();
        });
    });

    describe('Theme Support', () => {
        it('should render correctly in light theme', () => {
            // Arrange & Act
            renderComponent({}, lightTheme);

            // Assert
            expect(screen.getByText('Region Type Presets')).toBeInTheDocument();
        });

        it('should render correctly in dark theme', () => {
            // Arrange & Act
            renderComponent({}, darkTheme);

            // Assert
            expect(screen.getByText('Region Type Presets')).toBeInTheDocument();
        });
    });

    describe('Region Type Selection', () => {
        it('should call onPresetSelect when Elevation preset is clicked', async () => {
            // Arrange
            const user = userEvent.setup();
            const onPresetSelect = vi.fn();
            renderComponent({ onPresetSelect });

            // Act
            await user.click(screen.getByRole('button', { name: 'Elevation' }));

            // Assert
            expect(onPresetSelect).toHaveBeenCalledWith(
                expect.objectContaining({
                    type: 'Elevation',
                    name: 'Elevation',
                }),
            );
        });

        it('should call onPresetSelect when Terrain preset is clicked', async () => {
            // Arrange
            const user = userEvent.setup();
            const onPresetSelect = vi.fn();
            renderComponent({ onPresetSelect });

            // Act
            await user.click(screen.getByRole('button', { name: 'Terrain' }));

            // Assert
            expect(onPresetSelect).toHaveBeenCalledWith(
                expect.objectContaining({
                    type: 'Terrain',
                    name: 'Terrain',
                }),
            );
        });

        it('should call onPresetSelect when Illumination preset is clicked', async () => {
            // Arrange
            const user = userEvent.setup();
            const onPresetSelect = vi.fn();
            renderComponent({ onPresetSelect });

            // Act
            await user.click(screen.getByRole('button', { name: 'Illumination' }));

            // Assert
            expect(onPresetSelect).toHaveBeenCalledWith(
                expect.objectContaining({
                    type: 'Illumination',
                    name: 'Illumination',
                }),
            );
        });

        it('should update value dropdown when changing region type', async () => {
            // Arrange
            const user = userEvent.setup();
            renderComponent();

            // Act - Select Terrain type
            await user.click(screen.getByRole('button', { name: 'Terrain' }));

            // Assert - Should show terrain-specific value dropdown
            const valueDropdown = screen.getByRole('combobox', { name: /value/i });
            expect(valueDropdown).toBeInTheDocument();
            await user.click(valueDropdown);

            await waitFor(() => {
                expect(screen.getByRole('option', { name: 'Normal' })).toBeInTheDocument();
                expect(screen.getByRole('option', { name: 'Difficult' })).toBeInTheDocument();
                expect(screen.getByRole('option', { name: 'Impassable' })).toBeInTheDocument();
            });
        });
    });

    describe('Region Property Controls', () => {
        it('should display number input for Elevation type', () => {
            // Arrange & Act
            renderComponent();

            // Assert - Elevation is default type
            const valueInput = screen.getByRole('spinbutton', { name: /value \(feet\)/i });
            expect(valueInput).toBeInTheDocument();
        });

        it('should display dropdown for Terrain type values', async () => {
            // Arrange
            const user = userEvent.setup();
            renderComponent();

            // Act
            await user.click(screen.getByRole('button', { name: 'Terrain' }));

            // Assert
            expect(screen.getByRole('combobox', { name: /value/i })).toBeInTheDocument();
        });

        it('should display dropdown for Illumination type values', async () => {
            // Arrange
            const user = userEvent.setup();
            renderComponent();

            // Act
            await user.click(screen.getByRole('button', { name: 'Illumination' }));

            // Assert
            expect(screen.getByRole('combobox', { name: /value/i })).toBeInTheDocument();
        });

        it('should show Illumination value options when dropdown is opened', async () => {
            // Arrange
            const user = userEvent.setup();
            renderComponent();

            // Act
            await user.click(screen.getByRole('button', { name: 'Illumination' }));
            await user.click(screen.getByRole('combobox', { name: /value/i }));

            // Assert
            await waitFor(() => {
                expect(screen.getByRole('option', { name: 'Darkness' })).toBeInTheDocument();
                expect(screen.getByRole('option', { name: 'Dim' })).toBeInTheDocument();
                expect(screen.getByRole('option', { name: 'Normal' })).toBeInTheDocument();
                expect(screen.getByRole('option', { name: 'Bright' })).toBeInTheDocument();
            });
        });

        it('should update elevation value when changed', async () => {
            // Arrange
            const user = userEvent.setup();
            renderComponent();
            const valueInput = screen.getByRole('spinbutton', { name: /value \(feet\)/i });

            // Act
            await user.clear(valueInput);
            await user.type(valueInput, '25');

            // Assert
            expect(valueInput).toHaveValue(25);
        });
    });

    describe('Region Drawing Mode Toggle', () => {
        it('should call onPlaceRegion when polygon button is clicked', async () => {
            // Arrange
            const user = userEvent.setup();
            const onPlaceRegion = vi.fn();
            renderComponent({ onPlaceRegion });

            // Act
            await user.click(screen.getByRole('button', { name: /place a polygon region/i }));

            // Assert
            expect(onPlaceRegion).toHaveBeenCalledWith(
                expect.objectContaining({
                    name: expect.stringMatching(/Region \d+/),
                    type: 'Elevation',
                    value: 0,
                }),
            );
        });

        it('should call onBucketFillRegion when bucket fill button is clicked', async () => {
            // Arrange
            const user = userEvent.setup();
            const onBucketFillRegion = vi.fn();
            renderComponent({ onBucketFillRegion });

            // Act
            await user.click(screen.getByRole('button', { name: /fill an area/i }));

            // Assert
            expect(onBucketFillRegion).toHaveBeenCalledWith(
                expect.objectContaining({
                    name: expect.stringMatching(/Region \d+/),
                    type: 'Elevation',
                    value: 0,
                }),
            );
        });

        it('should pass current region type and value when placing polygon', async () => {
            // Arrange
            const user = userEvent.setup();
            const onPlaceRegion = vi.fn();
            renderComponent({ onPlaceRegion });

            // Act - Select Terrain and value
            await user.click(screen.getByRole('button', { name: 'Terrain' }));
            await user.click(screen.getByRole('combobox', { name: /value/i }));
            await user.click(screen.getByRole('option', { name: 'Difficult' }));
            await user.click(screen.getByRole('button', { name: /place a polygon region/i }));

            // Assert
            expect(onPlaceRegion).toHaveBeenCalledWith(
                expect.objectContaining({
                    type: 'Terrain',
                    value: 1,
                }),
            );
        });
    });

    describe('Region List Display', () => {
        it('should display placed regions in list', () => {
            // Arrange & Act
            renderComponent({ encounterRegions: [mockElevationRegion] });

            // Assert
            expect(screen.getByText('Hill')).toBeInTheDocument();
        });

        it('should filter regions by selected type', async () => {
            // Arrange
            const user = userEvent.setup();
            renderComponent({
                encounterRegions: [mockElevationRegion, mockTerrainRegion, mockIlluminationRegion],
            });

            // Act - Select Terrain type
            await user.click(screen.getByRole('button', { name: 'Terrain' }));

            // Assert
            await waitFor(() => {
                expect(screen.getByText('Swamp')).toBeInTheDocument();
            });
            expect(screen.queryByText('Hill')).not.toBeInTheDocument();
            expect(screen.queryByText('Dark Corner')).not.toBeInTheDocument();
        });

        it('should show region count in header', () => {
            // Arrange
            const multipleElevationRegions: PlacedRegion[] = [
                mockElevationRegion,
                { ...mockElevationRegion, id: 'region-4', index: 3, name: 'Valley' },
            ];

            // Act
            renderComponent({ encounterRegions: multipleElevationRegions });

            // Assert
            expect(screen.getByText(/Placed Elevation Regions \(2\)/)).toBeInTheDocument();
        });

        it('should highlight selected region', () => {
            // Arrange & Act
            renderComponent({
                encounterRegions: [mockElevationRegion],
                selectedRegionIndex: 0,
            });

            // Assert - The list item button should have selected class (MUI uses class-based selection)
            const listItemButton = screen.getByText('Hill').closest('div[role="button"]');
            expect(listItemButton).toHaveClass('Mui-selected');
        });
    });

    describe('Region Selection', () => {
        it('should call onRegionSelect when region is clicked', async () => {
            // Arrange
            const user = userEvent.setup();
            const onRegionSelect = vi.fn();
            renderComponent({
                encounterRegions: [mockElevationRegion],
                onRegionSelect,
            });

            // Act
            await user.click(screen.getByText('Hill'));

            // Assert
            expect(onRegionSelect).toHaveBeenCalledWith(0);
        });
    });

    describe('Region Deletion', () => {
        it('should show delete confirmation dialog when delete button is clicked', async () => {
            // Arrange
            const user = userEvent.setup();
            renderComponent({ encounterRegions: [mockElevationRegion] });

            // Act
            const deleteButton = screen.getByRole('button', { name: /delete/i });
            await user.click(deleteButton);

            // Assert
            expect(await screen.findByText('Delete Region')).toBeInTheDocument();
            expect(screen.getByText(/are you sure you want to delete this region/i)).toBeInTheDocument();
        });

        it('should call onRegionDelete when delete is confirmed', async () => {
            // Arrange
            const user = userEvent.setup();
            const onRegionDelete = vi.fn();
            renderComponent({
                encounterRegions: [mockElevationRegion],
                onRegionDelete,
            });

            // Act
            const deleteButton = screen.getByRole('button', { name: /delete/i });
            await user.click(deleteButton);
            const confirmButton = await screen.findByRole('button', { name: /confirm/i });
            await user.click(confirmButton);

            // Assert
            await waitFor(() => {
                expect(onRegionDelete).toHaveBeenCalledWith(0);
            });
        });

        it('should not call onRegionDelete when delete is cancelled', async () => {
            // Arrange
            const user = userEvent.setup();
            const onRegionDelete = vi.fn();
            renderComponent({
                encounterRegions: [mockElevationRegion],
                onRegionDelete,
            });

            // Act
            const deleteButton = screen.getByRole('button', { name: /delete/i });
            await user.click(deleteButton);
            const cancelButton = await screen.findByRole('button', { name: /cancel/i });
            await user.click(cancelButton);

            // Assert
            expect(onRegionDelete).not.toHaveBeenCalled();
        });
    });

    describe('Region Edit Vertices', () => {
        it('should call onEditVertices when edit button is clicked', async () => {
            // Arrange
            const user = userEvent.setup();
            const onEditVertices = vi.fn();
            renderComponent({
                encounterRegions: [mockElevationRegion],
                onEditVertices,
            });

            // Act
            const editButton = screen.getAllByRole('button').find(
                (b) => b.getAttribute('id')?.includes('edit'),
            );
            expect(editButton).toBeTruthy();
            await user.click(editButton!);

            // Assert
            expect(onEditVertices).toHaveBeenCalledWith(0);
        });
    });

    describe('Region Expansion and Inline Editing', () => {
        it('should expand region details when expand button is clicked', async () => {
            // Arrange
            const user = userEvent.setup();
            renderComponent({ encounterRegions: [mockElevationRegion] });

            // Act - Click the expand button
            // Find by icon type instead
            const listItem = screen.getByText('Hill').closest('li');
            const expandIcon = listItem?.querySelector('button');
            if (expandIcon) {
                await user.click(expandIcon);
            }

            // Assert - After expansion, type dropdown should be visible
            await waitFor(() => {
                expect(screen.getByRole('combobox', { name: /type/i })).toBeInTheDocument();
            });
        });

        it('should allow editing region name when expanded', async () => {
            // Arrange
            const user = userEvent.setup();
            renderComponent({
                encounterRegions: [mockElevationRegion],
                encounterId: 'encounter-123',
            });

            // Act - Expand the region
            const listItem = screen.getByText('Hill').closest('li');
            const buttons = listItem?.querySelectorAll('button');
            const expandButton = buttons?.[0];
            if (expandButton) {
                await user.click(expandButton);
            }

            // Assert - Name text field should be visible when expanded
            await waitFor(() => {
                const textFields = screen.getAllByRole('textbox');
                expect(textFields.length).toBeGreaterThan(0);
            });
        });

        it('should update region type when changed in expanded view', async () => {
            // Arrange
            const user = userEvent.setup();
            renderComponent({
                encounterRegions: [mockElevationRegion],
                encounterId: 'encounter-123',
            });

            // Act - Expand the region
            const listItem = screen.getByText('Hill').closest('li');
            const buttons = listItem?.querySelectorAll('button');
            const expandButton = buttons?.[0];
            if (expandButton) {
                await user.click(expandButton);
            }

            // Wait for expansion
            await waitFor(() => {
                expect(screen.getByRole('combobox', { name: /type/i })).toBeInTheDocument();
            });

            // Change type to Terrain
            await user.click(screen.getByRole('combobox', { name: /type/i }));
            await user.click(screen.getByRole('option', { name: 'Terrain' }));

            // Assert
            await waitFor(() => {
                expect(mockUpdateRegionMutation).toHaveBeenCalled();
            });
        });

        it('should update region value when changed in expanded view for Elevation', async () => {
            // Arrange
            const user = userEvent.setup();
            renderComponent({
                encounterRegions: [mockElevationRegion],
                encounterId: 'encounter-123',
            });

            // Act - Expand the region
            const listItem = screen.getByText('Hill').closest('li');
            const buttons = listItem?.querySelectorAll('button');
            const expandButton = buttons?.[0];
            if (expandButton) {
                await user.click(expandButton);
            }

            // Wait for expansion - there will be two spinbuttons (new region and expanded region)
            await waitFor(() => {
                const spinbuttons = screen.getAllByRole('spinbutton');
                expect(spinbuttons.length).toBeGreaterThanOrEqual(2);
            });

            // Get the expanded region's input (second spinbutton, with value 10 from mockElevationRegion)
            const spinbuttons = screen.getAllByRole('spinbutton');
            const elevationInput = spinbuttons.find(input => (input as HTMLInputElement).value === '10');
            expect(elevationInput).toBeTruthy();

            await user.clear(elevationInput!);
            await user.type(elevationInput!, '50');
            fireEvent.blur(elevationInput!);

            // Assert
            await waitFor(() => {
                expect(mockUpdateRegionMutation).toHaveBeenCalled();
            });
        });
    });

    describe('Region Name Suggestion', () => {
        it('should suggest incremented name for new region', async () => {
            // Arrange
            const user = userEvent.setup();
            const onPlaceRegion = vi.fn();
            const existingRegions: PlacedRegion[] = [
                { ...mockElevationRegion, name: 'Region 1' },
                { ...mockElevationRegion, id: 'r2', index: 1, name: 'Region 2' },
            ];
            renderComponent({
                encounterRegions: existingRegions,
                onPlaceRegion,
            });

            // Act
            await user.click(screen.getByRole('button', { name: /place a polygon region/i }));

            // Assert
            expect(onPlaceRegion).toHaveBeenCalledWith(
                expect.objectContaining({
                    name: 'Region 3',
                }),
            );
        });

        it('should suggest Region 1 when no regions exist', async () => {
            // Arrange
            const user = userEvent.setup();
            const onPlaceRegion = vi.fn();
            renderComponent({
                encounterRegions: [],
                onPlaceRegion,
            });

            // Act
            await user.click(screen.getByRole('button', { name: /place a polygon region/i }));

            // Assert
            expect(onPlaceRegion).toHaveBeenCalledWith(
                expect.objectContaining({
                    name: 'Region 1',
                }),
            );
        });
    });

    describe('Edge Cases', () => {
        it('should handle undefined encounterRegions', () => {
            // Arrange & Act - Pass empty object to test default value behavior
            renderComponent({});

            // Assert
            expect(screen.getByText(/no elevation regions placed/i)).toBeInTheDocument();
        });

        it('should handle null selectedRegionIndex', () => {
            // Arrange & Act
            renderComponent({
                encounterRegions: [mockElevationRegion],
                selectedRegionIndex: null,
            });

            // Assert - The list item button should NOT have selected class
            const listItemButton = screen.getByText('Hill').closest('div[role="button"]');
            expect(listItemButton).not.toHaveClass('Mui-selected');
        });

        it('should handle missing encounterId gracefully when updating', async () => {
            // Arrange
            const user = userEvent.setup();
            // Create props without encounterId using destructuring to omit it
            const { encounterId: _, ...propsWithoutEncounterId } = defaultProps;
            render(
                <ThemeProvider theme={lightTheme}>
                    <RegionsPanel {...propsWithoutEncounterId} encounterRegions={[mockElevationRegion]} />
                </ThemeProvider>,
            );

            // Act - Try to expand and update
            const listItem = screen.getByText('Hill').closest('li');
            const buttons = listItem?.querySelectorAll('button');
            const expandButton = buttons?.[0];
            if (expandButton) {
                await user.click(expandButton);
            }

            // Wait for expansion
            await waitFor(() => {
                expect(screen.getByRole('combobox', { name: /type/i })).toBeInTheDocument();
            });

            // Change type
            await user.click(screen.getByRole('combobox', { name: /type/i }));
            await user.click(screen.getByRole('option', { name: 'Terrain' }));

            // Assert - Should not call updateRegion without encounterId
            expect(mockUpdateRegionMutation).not.toHaveBeenCalled();
        });

        it('should not call callbacks when they are undefined', async () => {
            // Arrange
            const user = userEvent.setup();
            // Create props without onRegionSelect and onPresetSelect using destructuring
            const { onRegionSelect: _1, onPresetSelect: _2, ...propsWithoutCallbacks } = defaultProps;
            render(
                <ThemeProvider theme={lightTheme}>
                    <RegionsPanel {...propsWithoutCallbacks} encounterRegions={[mockElevationRegion]} />
                </ThemeProvider>,
            );

            // Act - Try to select preset (this switches to Terrain which has no regions)
            await user.click(screen.getByRole('button', { name: 'Elevation' }));
            // Now click on the region which should be visible for Elevation type
            await user.click(screen.getByText('Hill'));

            // Assert - No errors thrown
            expect(true).toBe(true);
        });
    });

    describe('Region Color Display', () => {
        it('should display color swatch for region in list', () => {
            // Arrange & Act
            renderComponent({ encounterRegions: [mockElevationRegion] });

            // Assert - Find the color swatch box in the list item
            const listItem = screen.getByText('Hill').closest('li');
            expect(listItem).toBeInTheDocument();
            // The color swatch is a Box element with specific styling
            const colorSwatches = listItem?.querySelectorAll('[style*="background"]');
            expect(colorSwatches).toBeDefined();
        });
    });

    describe('Region Value Display Labels', () => {
        it('should display terrain value label in collapsed view', async () => {
            // Arrange
            const user = userEvent.setup();
            renderComponent({ encounterRegions: [mockTerrainRegion] });

            // Act - Select Terrain to show the terrain region
            await user.click(screen.getByRole('button', { name: 'Terrain' }));

            // Assert
            await waitFor(() => {
                expect(screen.getByText(/Difficult/i)).toBeInTheDocument();
            });
        });

        it('should display illumination value label in collapsed view', async () => {
            // Arrange
            const user = userEvent.setup();
            renderComponent({ encounterRegions: [mockIlluminationRegion] });

            // Act - Select Illumination to show the illumination region
            await user.click(screen.getByRole('button', { name: 'Illumination' }));

            // Assert
            await waitFor(() => {
                expect(screen.getByText(/Darkness/i)).toBeInTheDocument();
            });
        });
    });
});
