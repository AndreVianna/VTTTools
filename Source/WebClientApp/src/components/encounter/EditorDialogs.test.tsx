import { createTheme, ThemeProvider } from '@mui/material/styles';
import { render, screen, waitFor, within } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import React from 'react';
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';
import { mockMonsterAsset } from '@/test-utils/assetMocks';
import type { EncounterRegion, EncounterWall, PlacedAsset } from '../../types/domain';
import { LabelPosition, LabelVisibility, SegmentState, SegmentType } from '../../types/domain';
import { EditorDialogs } from './EditorDialogs';

// Helper to render with theme support
const renderWithTheme = (component: React.ReactElement, mode: 'light' | 'dark' = 'light') => {
    const theme = createTheme({ palette: { mode } });
    return render(<ThemeProvider theme={theme}>{component}</ThemeProvider>);
};

describe('EditorDialogs', () => {
    // Arrange: Create mock data for tests
    const mockPlacedAsset: PlacedAsset = {
        id: 'asset-1',
        assetId: 'asset-base-1',
        asset: mockMonsterAsset({ id: 'asset-base-1', name: 'Test Monster' }),
        position: { x: 100, y: 100 },
        size: { width: 50, height: 50 },
        rotation: 0,
        layer: 'agents',
        index: 0,
        number: 1,
        name: 'Test Monster',
        isHidden: false,
        isLocked: false,
        labelVisibility: LabelVisibility.Default,
        labelPosition: LabelPosition.Default,
    };

    const mockWall: EncounterWall = {
        index: 0,
        isComplete: true,
        segments: [
            {
                index: 0,
                startPole: { x: 0, y: 0, h: 10 },
                endPole: { x: 100, y: 0, h: 10 },
                type: SegmentType.Wall,
                state: SegmentState.Closed,
                isOpaque: true,
            },
        ],
    };

    const mockRegion: EncounterRegion = {
        index: 0,
        name: 'Test Region',
        type: 'Terrain',
        vertices: [
            { x: 0, y: 0 },
            { x: 100, y: 0 },
            { x: 100, y: 100 },
            { x: 0, y: 100 },
        ],
        value: 0,
    };

    const defaultProps = {
        deleteConfirmOpen: false,
        assetsToDelete: [] as PlacedAsset[],
        onDeleteConfirmClose: vi.fn(),
        onDeleteConfirm: vi.fn(),
        assetContextMenuPosition: null as { left: number; top: number } | null,
        assetContextMenuAsset: null as PlacedAsset | null,
        onAssetContextMenuClose: vi.fn(),
        onAssetRename: vi.fn(),
        onAssetDisplayUpdate: vi.fn(),
        wallContextMenuPosition: null as { left: number; top: number } | null,
        wallContextMenuWall: null as EncounterWall | null,
        wallContextMenuSegmentIndex: null as number | null,
        onWallContextMenuClose: vi.fn(),
        onWallSegmentUpdate: vi.fn(),
        regionContextMenuPosition: null as { left: number; top: number } | null,
        regionContextMenuRegion: null as EncounterRegion | null,
        onRegionContextMenuClose: vi.fn(),
        onRegionUpdate: vi.fn(),
        errorMessage: null as string | null,
        onErrorMessageClose: vi.fn(),
    };

    beforeEach(() => {
        vi.clearAllMocks();
    });

    afterEach(() => {
        vi.clearAllMocks();
    });

    describe('Delete Confirmation Dialog', () => {
        it('should render delete confirmation dialog when open', () => {
            // Arrange
            const props = {
                ...defaultProps,
                deleteConfirmOpen: true,
                assetsToDelete: [mockPlacedAsset],
            };

            // Act
            render(<EditorDialogs {...props} />);

            // Assert
            expect(screen.getByRole('dialog')).toBeInTheDocument();
            expect(screen.getByText('Delete Assets')).toBeInTheDocument();
            expect(screen.getByText('Delete 1 asset?')).toBeInTheDocument();
        });

        it('should not render delete dialog when closed', () => {
            // Arrange & Act
            render(<EditorDialogs {...defaultProps} />);

            // Assert
            expect(screen.queryByRole('dialog')).not.toBeInTheDocument();
        });

        it('should display plural message when deleting multiple assets', () => {
            // Arrange
            const secondAsset: PlacedAsset = {
                ...mockPlacedAsset,
                id: 'asset-2',
                name: 'Second Monster',
            };
            const props = {
                ...defaultProps,
                deleteConfirmOpen: true,
                assetsToDelete: [mockPlacedAsset, secondAsset],
            };

            // Act
            render(<EditorDialogs {...props} />);

            // Assert
            expect(screen.getByText('Delete 2 assets?')).toBeInTheDocument();
        });

        it('should call onDeleteConfirm when confirm button is clicked', async () => {
            // Arrange
            const user = userEvent.setup();
            const onDeleteConfirm = vi.fn();
            const props = {
                ...defaultProps,
                deleteConfirmOpen: true,
                assetsToDelete: [mockPlacedAsset],
                onDeleteConfirm,
            };

            // Act
            render(<EditorDialogs {...props} />);
            await user.click(screen.getByRole('button', { name: /delete/i }));

            // Assert
            expect(onDeleteConfirm).toHaveBeenCalledTimes(1);
        });

        it('should call onDeleteConfirmClose when cancel button is clicked', async () => {
            // Arrange
            const user = userEvent.setup();
            const onDeleteConfirmClose = vi.fn();
            const props = {
                ...defaultProps,
                deleteConfirmOpen: true,
                assetsToDelete: [mockPlacedAsset],
                onDeleteConfirmClose,
            };

            // Act
            render(<EditorDialogs {...props} />);
            await user.click(screen.getByRole('button', { name: /cancel/i }));

            // Assert
            expect(onDeleteConfirmClose).toHaveBeenCalledTimes(1);
        });

        it('should have accessible dialog structure', () => {
            // Arrange
            const props = {
                ...defaultProps,
                deleteConfirmOpen: true,
                assetsToDelete: [mockPlacedAsset],
            };

            // Act
            render(<EditorDialogs {...props} />);

            // Assert
            const dialog = screen.getByRole('dialog');
            expect(dialog).toHaveAttribute('aria-labelledby');
            expect(dialog).toHaveAttribute('aria-describedby');
        });

        it('should call onDeleteConfirmClose when Escape key is pressed', async () => {
            // Arrange
            const user = userEvent.setup();
            const onDeleteConfirmClose = vi.fn();
            const props = {
                ...defaultProps,
                deleteConfirmOpen: true,
                assetsToDelete: [mockPlacedAsset],
                onDeleteConfirmClose,
            };

            // Act
            render(<EditorDialogs {...props} />);
            await user.keyboard('{Escape}');

            // Assert
            await waitFor(() => {
                expect(onDeleteConfirmClose).toHaveBeenCalledTimes(1);
            });
        });

        it('should not close dialog on backdrop click', async () => {
            // Arrange
            const user = userEvent.setup();
            const onDeleteConfirmClose = vi.fn();
            const props = {
                ...defaultProps,
                deleteConfirmOpen: true,
                assetsToDelete: [mockPlacedAsset],
                onDeleteConfirmClose,
            };

            // Act
            render(<EditorDialogs {...props} />);

            // Find the backdrop (MUI renders it as a sibling to the dialog paper)
            const backdrop = document.querySelector('.MuiBackdrop-root');
            expect(backdrop).toBeInTheDocument();

            // Click on backdrop
            if (backdrop) {
                await user.click(backdrop);
            }

            // Assert - backdrop click should NOT close the dialog
            expect(onDeleteConfirmClose).not.toHaveBeenCalled();
        });
    });

    describe('Asset Context Menu', () => {
        it('should render asset context menu when position is set', () => {
            // Arrange
            const props = {
                ...defaultProps,
                assetContextMenuPosition: { left: 100, top: 100 },
                assetContextMenuAsset: mockPlacedAsset,
            };

            // Act
            render(<EditorDialogs {...props} />);

            // Assert
            expect(screen.getByRole('menuitem', { name: /rename/i })).toBeInTheDocument();
            expect(screen.getByRole('menuitem', { name: /display label/i })).toBeInTheDocument();
            expect(screen.getByRole('menuitem', { name: /label position/i })).toBeInTheDocument();
        });

        it('should not render asset context menu when position is null', () => {
            // Arrange
            const props = {
                ...defaultProps,
                assetContextMenuPosition: null,
                assetContextMenuAsset: mockPlacedAsset,
            };

            // Act
            render(<EditorDialogs {...props} />);

            // Assert
            expect(screen.queryByRole('menuitem', { name: /rename/i })).not.toBeInTheDocument();
        });

        it('should call onAssetRename when asset is renamed', async () => {
            // Arrange
            const user = userEvent.setup();
            const onAssetRename = vi.fn().mockResolvedValue(undefined);
            const props = {
                ...defaultProps,
                assetContextMenuPosition: { left: 100, top: 100 },
                assetContextMenuAsset: mockPlacedAsset,
                onAssetRename,
            };

            // Act
            render(<EditorDialogs {...props} />);
            await user.click(screen.getByRole('menuitem', { name: /rename/i }));
            const input = screen.getByPlaceholderText('Asset name');
            await user.clear(input);
            await user.type(input, 'Renamed Monster{Enter}');

            // Assert
            await waitFor(() => {
                expect(onAssetRename).toHaveBeenCalledWith('asset-1', 'Renamed Monster');
            });
        });

        it('should call onAssetDisplayUpdate when display option is selected', async () => {
            // Arrange
            const user = userEvent.setup();
            const onAssetDisplayUpdate = vi.fn().mockResolvedValue(undefined);
            const props = {
                ...defaultProps,
                assetContextMenuPosition: { left: 100, top: 100 },
                assetContextMenuAsset: mockPlacedAsset,
                onAssetDisplayUpdate,
            };

            // Act
            render(<EditorDialogs {...props} />);
            await user.click(screen.getByRole('menuitem', { name: /display label/i }));
            await user.click(screen.getByRole('menuitem', { name: /always/i }));

            // Assert
            await waitFor(() => {
                expect(onAssetDisplayUpdate).toHaveBeenCalledWith('asset-1', LabelVisibility.Always, undefined);
            });
        });

        it('should call onAssetDisplayUpdate when label position option is selected', async () => {
            // Arrange
            const user = userEvent.setup();
            const onAssetDisplayUpdate = vi.fn().mockResolvedValue(undefined);
            const props = {
                ...defaultProps,
                assetContextMenuPosition: { left: 100, top: 100 },
                assetContextMenuAsset: mockPlacedAsset,
                onAssetDisplayUpdate,
            };

            // Act
            render(<EditorDialogs {...props} />);
            await user.click(screen.getByRole('menuitem', { name: /label position/i }));
            await user.click(screen.getByRole('menuitem', { name: /top/i }));

            // Assert
            await waitFor(() => {
                expect(onAssetDisplayUpdate).toHaveBeenCalledWith('asset-1', undefined, LabelPosition.Top);
            });
        });

        it('should show validation error when asset name is empty', async () => {
            // Arrange
            const user = userEvent.setup();
            const onAssetRename = vi.fn().mockResolvedValue(undefined);
            const props = {
                ...defaultProps,
                assetContextMenuPosition: { left: 100, top: 100 },
                assetContextMenuAsset: mockPlacedAsset,
                onAssetRename,
            };

            // Act
            render(<EditorDialogs {...props} />);
            await user.click(screen.getByRole('menuitem', { name: /rename/i }));
            const input = screen.getByPlaceholderText('Asset name');
            await user.clear(input);
            await user.type(input, '{Enter}');

            // Assert
            await waitFor(() => {
                expect(screen.getByText('Name cannot be empty')).toBeInTheDocument();
            });
            expect(onAssetRename).not.toHaveBeenCalled();
        });

        it('should cancel rename when Escape key is pressed', async () => {
            // Arrange
            const user = userEvent.setup();
            const onAssetRename = vi.fn().mockResolvedValue(undefined);
            const props = {
                ...defaultProps,
                assetContextMenuPosition: { left: 100, top: 100 },
                assetContextMenuAsset: mockPlacedAsset,
                onAssetRename,
            };

            // Act
            render(<EditorDialogs {...props} />);
            await user.click(screen.getByRole('menuitem', { name: /rename/i }));
            const input = screen.getByPlaceholderText('Asset name');
            await user.type(input, 'New Name{Escape}');

            // Assert - should return to menu view without calling rename
            await waitFor(() => {
                expect(screen.getByRole('menuitem', { name: /rename/i })).toBeInTheDocument();
            });
            expect(onAssetRename).not.toHaveBeenCalled();
        });
    });

    describe('Wall Context Menu', () => {
        it('should render wall context menu when position is set', () => {
            // Arrange
            const props = {
                ...defaultProps,
                wallContextMenuPosition: { left: 200, top: 200 },
                wallContextMenuWall: mockWall,
                wallContextMenuSegmentIndex: 0,
            };

            // Act
            render(<EditorDialogs {...props} />);

            // Assert
            expect(screen.getByText('Wall 1')).toBeInTheDocument();
            expect(screen.getByText('Type:')).toBeInTheDocument();
            expect(screen.getByText('State:')).toBeInTheDocument();
        });

        it('should not render wall context menu when position is null', () => {
            // Arrange
            const props = {
                ...defaultProps,
                wallContextMenuPosition: null,
                wallContextMenuWall: mockWall,
                wallContextMenuSegmentIndex: 0,
            };

            // Act
            render(<EditorDialogs {...props} />);

            // Assert
            expect(screen.queryByText('Wall 1')).not.toBeInTheDocument();
        });

        it('should call onWallSegmentUpdate when segment type is changed', async () => {
            // Arrange
            const user = userEvent.setup();
            const onWallSegmentUpdate = vi.fn();
            const props = {
                ...defaultProps,
                wallContextMenuPosition: { left: 200, top: 200 },
                wallContextMenuWall: mockWall,
                wallContextMenuSegmentIndex: 0,
                onWallSegmentUpdate,
            };

            // Act
            render(<EditorDialogs {...props} />);

            // Find the type select - it shows "Wall" currently
            const typeCombobox = screen.getAllByRole('combobox')[0];
            expect(typeCombobox).toBeInTheDocument();
            await user.click(typeCombobox);

            // Select "Door" from the dropdown
            const doorOption = screen.getByRole('option', { name: 'Door' });
            await user.click(doorOption);

            // Assert
            await waitFor(() => {
                expect(onWallSegmentUpdate).toHaveBeenCalledWith(
                    0, // wallIndex
                    0, // segmentIndex
                    expect.objectContaining({ type: SegmentType.Door }),
                );
            });
        });

        it('should call onWallContextMenuClose when clicking outside', async () => {
            // Arrange
            const user = userEvent.setup();
            const onWallContextMenuClose = vi.fn();
            const props = {
                ...defaultProps,
                wallContextMenuPosition: { left: 200, top: 200 },
                wallContextMenuWall: mockWall,
                wallContextMenuSegmentIndex: 0,
                onWallContextMenuClose,
            };

            // Act
            render(
                <div>
                    <div>Outside element</div>
                    <EditorDialogs {...props} />
                </div>,
            );
            await user.click(document.body);

            // Assert
            await waitFor(() => {
                expect(onWallContextMenuClose).toHaveBeenCalled();
            });
        });
    });

    describe('Region Context Menu', () => {
        it('should render region context menu when position is set', () => {
            // Arrange
            const props = {
                ...defaultProps,
                regionContextMenuPosition: { left: 300, top: 300 },
                regionContextMenuRegion: mockRegion,
            };

            // Act
            render(<EditorDialogs {...props} />);

            // Assert
            expect(screen.getByText('Terrain')).toBeInTheDocument();
            expect(screen.getByText('Name:')).toBeInTheDocument();
            expect(screen.getByText('Value:')).toBeInTheDocument();
        });

        it('should not render region context menu when position is null', () => {
            // Arrange
            const props = {
                ...defaultProps,
                regionContextMenuPosition: null,
                regionContextMenuRegion: mockRegion,
            };

            // Act
            render(<EditorDialogs {...props} />);

            // Assert - should not find region-specific content
            expect(screen.queryByText('Name:')).not.toBeInTheDocument();
        });

        it('should display region name in text field', () => {
            // Arrange
            const props = {
                ...defaultProps,
                regionContextMenuPosition: { left: 300, top: 300 },
                regionContextMenuRegion: mockRegion,
            };

            // Act
            render(<EditorDialogs {...props} />);

            // Assert
            const nameInput = screen.getByRole('textbox');
            expect(nameInput).toHaveValue('Test Region');
        });

        it('should call onRegionUpdate when region name is changed and blurred', async () => {
            // Arrange
            const user = userEvent.setup();
            const onRegionUpdate = vi.fn();
            const props = {
                ...defaultProps,
                regionContextMenuPosition: { left: 300, top: 300 },
                regionContextMenuRegion: mockRegion,
                onRegionUpdate,
            };

            // Act
            render(<EditorDialogs {...props} />);
            const nameInput = screen.getByRole('textbox');
            await user.clear(nameInput);
            await user.type(nameInput, 'Updated Region');

            // Click outside the input to trigger blur (more reliable than tab)
            await user.click(document.body);

            // Assert
            await waitFor(() => {
                expect(onRegionUpdate).toHaveBeenCalledWith(0, { name: 'Updated Region' });
            });
        });

        it('should call onRegionUpdate when region value is changed', async () => {
            // Arrange
            const user = userEvent.setup();
            const onRegionUpdate = vi.fn();
            const props = {
                ...defaultProps,
                regionContextMenuPosition: { left: 300, top: 300 },
                regionContextMenuRegion: mockRegion,
                onRegionUpdate,
            };

            // Act
            render(<EditorDialogs {...props} />);
            const valueSelect = screen.getByRole('combobox');
            await user.click(valueSelect);

            // Select "Difficult" terrain value
            const difficultOption = screen.getByRole('option', { name: 'Difficult' });
            await user.click(difficultOption);

            // Assert
            await waitFor(() => {
                expect(onRegionUpdate).toHaveBeenCalledWith(0, { value: 1 });
            });
        });

        it('should display numeric input for Elevation region type', () => {
            // Arrange
            const elevationRegion: EncounterRegion = {
                ...mockRegion,
                type: 'Elevation',
                value: 10,
            };
            const props = {
                ...defaultProps,
                regionContextMenuPosition: { left: 300, top: 300 },
                regionContextMenuRegion: elevationRegion,
            };

            // Act
            render(<EditorDialogs {...props} />);

            // Assert
            const inputs = screen.getAllByRole('spinbutton');
            const elevationInput = inputs.find((input) => input.getAttribute('type') === 'number');
            expect(elevationInput).toBeInTheDocument();
            expect(elevationInput).toHaveValue(10);
        });

        it('should call onRegionContextMenuClose when clicking outside', async () => {
            // Arrange
            const user = userEvent.setup();
            const onRegionContextMenuClose = vi.fn();
            const props = {
                ...defaultProps,
                regionContextMenuPosition: { left: 300, top: 300 },
                regionContextMenuRegion: mockRegion,
                onRegionContextMenuClose,
            };

            // Act
            render(
                <div>
                    <div>Outside element</div>
                    <EditorDialogs {...props} />
                </div>,
            );
            await user.click(document.body);

            // Assert
            await waitFor(() => {
                expect(onRegionContextMenuClose).toHaveBeenCalled();
            });
        });
    });

    describe('Error Snackbar', () => {
        it('should render error snackbar when errorMessage is set', () => {
            // Arrange
            const props = {
                ...defaultProps,
                errorMessage: 'Something went wrong!',
            };

            // Act
            render(<EditorDialogs {...props} />);

            // Assert
            expect(screen.getByRole('alert')).toBeInTheDocument();
            expect(screen.getByText('Something went wrong!')).toBeInTheDocument();
        });

        it('should not render error snackbar when errorMessage is null', () => {
            // Arrange & Act
            render(<EditorDialogs {...defaultProps} />);

            // Assert
            expect(screen.queryByRole('alert')).not.toBeInTheDocument();
        });

        it('should call onErrorMessageClose when close button is clicked', async () => {
            // Arrange
            const user = userEvent.setup();
            const onErrorMessageClose = vi.fn();
            const props = {
                ...defaultProps,
                errorMessage: 'Error occurred',
                onErrorMessageClose,
            };

            // Act
            render(<EditorDialogs {...props} />);
            const closeButton = screen.getByRole('button', { name: /close/i });
            await user.click(closeButton);

            // Assert
            expect(onErrorMessageClose).toHaveBeenCalledTimes(1);
        });

        it('should display error alert with correct severity', () => {
            // Arrange
            const props = {
                ...defaultProps,
                errorMessage: 'Critical error',
            };

            // Act
            render(<EditorDialogs {...props} />);

            // Assert
            const alert = screen.getByRole('alert');
            expect(alert).toHaveClass('MuiAlert-colorError');
        });
    });

    describe('Multiple Dialogs Interaction', () => {
        it('should render delete dialog and error snackbar simultaneously', () => {
            // Arrange
            const props = {
                ...defaultProps,
                deleteConfirmOpen: true,
                assetsToDelete: [mockPlacedAsset],
                errorMessage: 'Background error',
            };

            // Act
            render(<EditorDialogs {...props} />);

            // Assert
            expect(screen.getByRole('dialog')).toBeInTheDocument();
            expect(screen.getByText('Background error')).toBeInTheDocument();
        });

        it('should render asset context menu and error snackbar simultaneously', () => {
            // Arrange
            const props = {
                ...defaultProps,
                assetContextMenuPosition: { left: 100, top: 100 },
                assetContextMenuAsset: mockPlacedAsset,
                errorMessage: 'Some error',
            };

            // Act
            render(<EditorDialogs {...props} />);

            // Assert
            expect(screen.getByRole('menuitem', { name: /rename/i })).toBeInTheDocument();
            expect(screen.getByText('Some error')).toBeInTheDocument();
        });
    });

    describe('Accessibility', () => {
        it('should have proper ARIA attributes on delete dialog', () => {
            // Arrange
            const props = {
                ...defaultProps,
                deleteConfirmOpen: true,
                assetsToDelete: [mockPlacedAsset],
            };

            // Act
            render(<EditorDialogs {...props} />);

            // Assert
            const dialog = screen.getByRole('dialog');
            expect(dialog).toBeInTheDocument();

            // Dialog should have proper labeling
            const title = within(dialog).getByText('Delete Assets');
            expect(title).toBeInTheDocument();
        });

        it('should have proper menu role on context menus', () => {
            // Arrange
            const props = {
                ...defaultProps,
                assetContextMenuPosition: { left: 100, top: 100 },
                assetContextMenuAsset: mockPlacedAsset,
            };

            // Act
            render(<EditorDialogs {...props} />);

            // Assert
            expect(screen.getByRole('menu')).toBeInTheDocument();
        });

        it('should have proper alert role on error snackbar', () => {
            // Arrange
            const props = {
                ...defaultProps,
                errorMessage: 'Error message',
            };

            // Act
            render(<EditorDialogs {...props} />);

            // Assert
            expect(screen.getByRole('alert')).toBeInTheDocument();
        });
    });

    describe('Theme Support', () => {
        it('should render correctly in light theme', () => {
            // Arrange
            const props = {
                ...defaultProps,
                deleteConfirmOpen: true,
                assetsToDelete: [mockPlacedAsset],
            };

            // Act
            renderWithTheme(<EditorDialogs {...props} />, 'light');

            // Assert
            expect(screen.getByRole('dialog')).toBeInTheDocument();
            expect(screen.getByText('Delete Assets')).toBeInTheDocument();
        });

        it('should render correctly in dark theme', () => {
            // Arrange
            const props = {
                ...defaultProps,
                deleteConfirmOpen: true,
                assetsToDelete: [mockPlacedAsset],
            };

            // Act
            renderWithTheme(<EditorDialogs {...props} />, 'dark');

            // Assert
            expect(screen.getByRole('dialog')).toBeInTheDocument();
            expect(screen.getByText('Delete Assets')).toBeInTheDocument();
        });

        it('should render asset context menu in light theme', () => {
            // Arrange
            const props = {
                ...defaultProps,
                assetContextMenuPosition: { left: 100, top: 100 },
                assetContextMenuAsset: mockPlacedAsset,
            };

            // Act
            renderWithTheme(<EditorDialogs {...props} />, 'light');

            // Assert
            expect(screen.getByRole('menu')).toBeInTheDocument();
            expect(screen.getByRole('menuitem', { name: /rename/i })).toBeInTheDocument();
        });

        it('should render asset context menu in dark theme', () => {
            // Arrange
            const props = {
                ...defaultProps,
                assetContextMenuPosition: { left: 100, top: 100 },
                assetContextMenuAsset: mockPlacedAsset,
            };

            // Act
            renderWithTheme(<EditorDialogs {...props} />, 'dark');

            // Assert
            expect(screen.getByRole('menu')).toBeInTheDocument();
            expect(screen.getByRole('menuitem', { name: /rename/i })).toBeInTheDocument();
        });

        it('should render error snackbar in light theme', () => {
            // Arrange
            const props = {
                ...defaultProps,
                errorMessage: 'An error occurred',
            };

            // Act
            renderWithTheme(<EditorDialogs {...props} />, 'light');

            // Assert
            expect(screen.getByRole('alert')).toBeInTheDocument();
            expect(screen.getByText('An error occurred')).toBeInTheDocument();
        });

        it('should render error snackbar in dark theme', () => {
            // Arrange
            const props = {
                ...defaultProps,
                errorMessage: 'An error occurred',
            };

            // Act
            renderWithTheme(<EditorDialogs {...props} />, 'dark');

            // Assert
            expect(screen.getByRole('alert')).toBeInTheDocument();
            expect(screen.getByText('An error occurred')).toBeInTheDocument();
        });

        it('should render wall context menu in both themes', () => {
            // Arrange
            const props = {
                ...defaultProps,
                wallContextMenuPosition: { left: 200, top: 200 },
                wallContextMenuWall: mockWall,
                wallContextMenuSegmentIndex: 0,
            };

            // Act - Light theme
            const { unmount } = renderWithTheme(<EditorDialogs {...props} />, 'light');
            expect(screen.getByText('Wall 1')).toBeInTheDocument();
            unmount();

            // Act - Dark theme
            renderWithTheme(<EditorDialogs {...props} />, 'dark');

            // Assert
            expect(screen.getByText('Wall 1')).toBeInTheDocument();
        });

        it('should render region context menu in both themes', () => {
            // Arrange
            const props = {
                ...defaultProps,
                regionContextMenuPosition: { left: 300, top: 300 },
                regionContextMenuRegion: mockRegion,
            };

            // Act - Light theme
            const { unmount } = renderWithTheme(<EditorDialogs {...props} />, 'light');
            expect(screen.getByText('Terrain')).toBeInTheDocument();
            unmount();

            // Act - Dark theme
            renderWithTheme(<EditorDialogs {...props} />, 'dark');

            // Assert
            expect(screen.getByText('Terrain')).toBeInTheDocument();
        });
    });

    describe('Region Context Menu - Keyboard Handling', () => {
        it('should update region name when Enter key is pressed', async () => {
            // Arrange
            const user = userEvent.setup();
            const onRegionUpdate = vi.fn();
            const props = {
                ...defaultProps,
                regionContextMenuPosition: { left: 300, top: 300 },
                regionContextMenuRegion: mockRegion,
                onRegionUpdate,
            };

            // Act
            render(<EditorDialogs {...props} />);
            const nameInput = screen.getByRole('textbox');
            await user.clear(nameInput);
            await user.type(nameInput, 'New Region Name{Enter}');

            // Assert
            await waitFor(() => {
                expect(onRegionUpdate).toHaveBeenCalledWith(0, { name: 'New Region Name' });
            });
        });

        it('should revert region name when Escape key is pressed', async () => {
            // Arrange
            const user = userEvent.setup();
            const onRegionUpdate = vi.fn();
            const props = {
                ...defaultProps,
                regionContextMenuPosition: { left: 300, top: 300 },
                regionContextMenuRegion: mockRegion,
                onRegionUpdate,
            };

            // Act
            render(<EditorDialogs {...props} />);
            const nameInput = screen.getByRole('textbox');
            await user.clear(nameInput);
            await user.type(nameInput, 'Modified Name');
            await user.keyboard('{Escape}');

            // Assert - should revert to original value after escape
            await waitFor(() => {
                expect(nameInput).toHaveValue('Test Region');
            });
        });
    });

    describe('Wall Context Menu - Segment State Changes', () => {
        it('should call onWallSegmentUpdate when segment state is changed', async () => {
            // Arrange
            const user = userEvent.setup();
            const onWallSegmentUpdate = vi.fn();
            const doorWall: EncounterWall = {
                ...mockWall,
                segments: [
                    {
                        ...mockWall.segments[0],
                        type: SegmentType.Door,
                        state: SegmentState.Closed,
                    },
                ],
            };
            const props = {
                ...defaultProps,
                wallContextMenuPosition: { left: 200, top: 200 },
                wallContextMenuWall: doorWall,
                wallContextMenuSegmentIndex: 0,
                onWallSegmentUpdate,
            };

            // Act
            render(<EditorDialogs {...props} />);

            // Find the state select (second combobox)
            const comboboxes = screen.getAllByRole('combobox');
            const stateCombobox = comboboxes[1];
            await user.click(stateCombobox);

            // Select "Open" state
            const openOption = screen.getByRole('option', { name: 'Open' });
            await user.click(openOption);

            // Assert
            await waitFor(() => {
                expect(onWallSegmentUpdate).toHaveBeenCalledWith(
                    0, // wallIndex
                    0, // segmentIndex
                    expect.objectContaining({ state: 'Open' }),
                );
            });
        });
    });
});
