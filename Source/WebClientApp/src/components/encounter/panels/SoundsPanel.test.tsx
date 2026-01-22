import { createTheme, ThemeProvider } from '@mui/material/styles';
import { fireEvent, render, screen, waitFor, within } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import React from 'react';
import { beforeEach, describe, expect, it, vi } from 'vitest';
import { type StageSound } from '@/types/stage';
import { SoundsPanel, type SoundsPanelProps, type SoundPlacementProperties } from './SoundsPanel';

// Mock the stageApi
const mockUpdateSound = vi.fn().mockReturnValue({
    unwrap: () => Promise.resolve(),
});
const mockDeleteSound = vi.fn().mockReturnValue({
    unwrap: () => Promise.resolve(),
});

vi.mock('@/services/stageApi', () => ({
    useUpdateSoundMutation: () => [mockUpdateSound],
    useDeleteSoundMutation: () => [mockDeleteSound],
}));

// Mock the mediaApi
vi.mock('@/services/mediaApi', () => ({
    useGetMediaResourceQuery: (resourceId: string) => ({
        data: resourceId ? {
            id: resourceId,
            fileName: 'test-sound.mp3',
            duration: 'PT1M30S',
            fileSize: 1024000,
            contentType: 'audio/mpeg',
        } : undefined,
    }),
}));

// Mock the SoundPickerDialog
vi.mock('@/components/sounds', () => ({
    SoundPickerDialog: ({ open, onClose, onSelect }: { open: boolean; onClose: () => void; onSelect: (id: string) => void }) => {
        if (!open) return null;
        return (
            <div data-mock="SoundPickerDialog">
                <button onClick={onClose}>Close Picker</button>
                <button onClick={() => onSelect('new-resource-id')}>Select Sound</button>
            </div>
        );
    },
    AudioPreviewPlayer: ({ resourceId, compact }: { resourceId: string; compact?: boolean }) => (
        <div data-mock="AudioPreviewPlayer" data-resource-id={resourceId} data-compact={compact}>
            Audio Player Mock
        </div>
    ),
}));

// Mock the ConfirmDialog
vi.mock('@/components/common', () => ({
    ConfirmDialog: ({ open, title, message, onConfirm, onClose }: {
        open: boolean;
        title: string;
        message: string;
        onConfirm: () => void;
        onClose: () => void;
    }) => {
        if (!open) return null;
        return (
            <div role="dialog" aria-label={title}>
                <h2>{title}</h2>
                <p>{message}</p>
                <button onClick={onConfirm}>Confirm</button>
                <button onClick={onClose}>Cancel</button>
            </div>
        );
    },
}));

const createMockSound = (overrides: Partial<StageSound> = {}): StageSound => ({
    index: 0,
    name: 'Ambient Forest',
    media: {
        id: 'media-1',
        contentType: 'audio/mpeg',
        path: '/sounds/forest.mp3',
        fileName: 'forest.mp3',
        fileSize: 1024000,
        dimensions: { width: 0, height: 0 },
        duration: 'PT1M30S',
    },
    position: { x: 100, y: 100 },
    radius: 50,
    volume: 0.8,
    loop: true,
    isPlaying: true,
    ...overrides,
});

const renderWithTheme = (component: React.ReactElement, mode: 'light' | 'dark' = 'light') => {
    const theme = createTheme({ palette: { mode } });
    return render(<ThemeProvider theme={theme}>{component}</ThemeProvider>);
};

const renderComponent = (props: Partial<SoundsPanelProps> = {}, mode: 'light' | 'dark' = 'light') => {
    const defaultProps: SoundsPanelProps = {
        stageId: 'test-stage-id',
        soundSources: [],
        selectedSourceIndex: null,
        onSourceSelect: vi.fn<(index: number) => void>(),
        onPlaceSound: vi.fn<(properties: SoundPlacementProperties) => void>(),
    };

    return renderWithTheme(<SoundsPanel {...defaultProps} {...props} />, mode);
};

describe('SoundsPanel', () => {
    beforeEach(() => {
        // Arrange - Clean up mocks before each test
        vi.clearAllMocks();
    });

    describe('Rendering', () => {
        it('should render section headers', () => {
            // Arrange & Act
            renderComponent();

            // Assert
            expect(screen.getByText('Add Sound Source')).toBeInTheDocument();
            expect(screen.getByText(/Placed Sounds/)).toBeInTheDocument();
        });

        it('should render Browse Sounds button', () => {
            // Arrange & Act
            renderComponent();

            // Assert - Button has tooltip as aria-label
            expect(screen.getByRole('button', { name: /Select from Library/i })).toBeInTheDocument();
            expect(screen.getByText('Browse Sounds')).toBeInTheDocument();
        });

        it('should display placed sounds count', () => {
            // Arrange
            const sounds = [
                createMockSound(),
                createMockSound({ index: 1, name: 'Thunder' }),
            ];

            // Act
            renderComponent({ soundSources: sounds });

            // Assert
            expect(screen.getByText('Placed Sounds (2)')).toBeInTheDocument();
        });
    });

    describe('Empty state', () => {
        it('should display "No sounds placed" when sound sources list is empty', () => {
            // Arrange & Act
            renderComponent({ soundSources: [] });

            // Assert
            expect(screen.getByText('No sounds placed')).toBeInTheDocument();
        });

        it('should display zero count in header when empty', () => {
            // Arrange & Act
            renderComponent({ soundSources: [] });

            // Assert
            expect(screen.getByText('Placed Sounds (0)')).toBeInTheDocument();
        });
    });

    describe('Sound list rendering', () => {
        it('should display sound names in the list', () => {
            // Arrange
            const sounds = [
                createMockSound({ name: 'Rain Sound' }),
                createMockSound({ index: 1, name: 'Wind Effect' }),
            ];

            // Act
            renderComponent({ soundSources: sounds });

            // Assert
            expect(screen.getByText('Rain Sound')).toBeInTheDocument();
            expect(screen.getByText('Wind Effect')).toBeInTheDocument();
        });

        it('should display default name for unnamed sounds', () => {
            // Arrange
            const sounds = [createMockSound({ index: 3, name: undefined })];

            // Act
            renderComponent({ soundSources: sounds });

            // Assert
            expect(screen.getByText('Sound #3')).toBeInTheDocument();
        });

        it('should display sound range info', () => {
            // Arrange
            const sounds = [createMockSound({ radius: 75, isPlaying: true })];

            // Act
            renderComponent({ soundSources: sounds });

            // Assert
            expect(screen.getByText(/Range: 75ft/)).toBeInTheDocument();
        });

        it('should display playing status for active sounds', () => {
            // Arrange
            const sounds = [createMockSound({ isPlaying: true })];

            // Act
            renderComponent({ soundSources: sounds });

            // Assert
            expect(screen.getByText(/Playing/)).toBeInTheDocument();
        });

        it('should display paused status for inactive sounds', () => {
            // Arrange
            const sounds = [createMockSound({ isPlaying: false })];

            // Act
            renderComponent({ soundSources: sounds });

            // Assert
            expect(screen.getByText(/Paused/)).toBeInTheDocument();
        });

        it('should indicate when sound has media assigned', () => {
            // Arrange
            const sounds = [createMockSound()];

            // Act
            renderComponent({ soundSources: sounds });

            // Assert
            expect(screen.getByText(/Has Sound/)).toBeInTheDocument();
        });
    });

    describe('Sound selection', () => {
        it('should call onSourceSelect when sound item is clicked', async () => {
            // Arrange
            const user = userEvent.setup();
            const onSourceSelect = vi.fn();
            const sounds = [createMockSound()];
            renderComponent({ soundSources: sounds, onSourceSelect });

            // Act
            const soundItem = screen.getByText('Ambient Forest');
            await user.click(soundItem);

            // Assert
            expect(onSourceSelect).toHaveBeenCalledWith(0);
        });

        it('should highlight selected sound in the list', () => {
            // Arrange
            const sounds = [createMockSound()];

            // Act
            renderComponent({ soundSources: sounds, selectedSourceIndex: 0 });

            // Assert
            const listItemButton = screen.getByRole('button', { name: /Ambient Forest/i });
            expect(listItemButton).toHaveClass('Mui-selected');
        });

        it('should not highlight unselected sounds', () => {
            // Arrange
            const sounds = [
                createMockSound({ index: 0, name: 'Sound 1' }),
                createMockSound({ index: 1, name: 'Sound 2' }),
            ];

            // Act
            renderComponent({ soundSources: sounds, selectedSourceIndex: 0 });

            // Assert
            const sound2Button = screen.getByRole('button', { name: /Sound 2/i });
            expect(sound2Button).not.toHaveClass('Mui-selected');
        });
    });

    describe('Add sound button', () => {
        it('should open sound picker when Browse Sounds is clicked', async () => {
            // Arrange
            const user = userEvent.setup();
            renderComponent();

            // Act - Button has tooltip as aria-label
            const browseButton = screen.getByRole('button', { name: /Select from Library/i });
            await user.click(browseButton);

            // Assert
            expect(screen.getByText('Close Picker')).toBeInTheDocument();
        });

        it('should call onPlaceSound with selected resource when sound is picked', async () => {
            // Arrange
            const user = userEvent.setup();
            const onPlaceSound = vi.fn();
            renderComponent({ onPlaceSound });

            // Act - Button has tooltip as aria-label
            const browseButton = screen.getByRole('button', { name: /Select from Library/i });
            await user.click(browseButton);
            const selectButton = screen.getByText('Select Sound');
            await user.click(selectButton);

            // Assert
            expect(onPlaceSound).toHaveBeenCalledWith({
                resourceId: 'new-resource-id',
                isPlaying: false,
            });
        });

        it('should close picker when cancelled', async () => {
            // Arrange
            const user = userEvent.setup();
            renderComponent();

            // Act - Button has tooltip as aria-label
            const browseButton = screen.getByRole('button', { name: /Select from Library/i });
            await user.click(browseButton);
            const closeButton = screen.getByText('Close Picker');
            await user.click(closeButton);

            // Assert
            expect(screen.queryByText('Close Picker')).not.toBeInTheDocument();
        });
    });

    describe('Delete sound interactions', () => {
        it('should show delete confirmation dialog when delete button is clicked', async () => {
            // Arrange
            const user = userEvent.setup();
            const sounds = [createMockSound()];
            renderComponent({ soundSources: sounds });

            // Act - Delete button has aria-label from Delete icon
            const listItem = screen.getByText('Ambient Forest').closest('li');
            expect(listItem).toBeInTheDocument();
            const deleteButton = within(listItem!).getByRole('button', { name: /Delete/i });
            await user.click(deleteButton);

            // Assert
            expect(screen.getByRole('dialog', { name: 'Delete Sound' })).toBeInTheDocument();
            expect(screen.getByText(/Are you sure you want to delete this sound/i)).toBeInTheDocument();
        });

        it('should call deleteSound when deletion is confirmed', async () => {
            // Arrange
            const user = userEvent.setup();
            const sounds = [createMockSound({ index: 2 })];
            renderComponent({ soundSources: sounds, });

            // Act - Click delete button (has aria-label from Delete icon)
            const listItem = screen.getByText('Ambient Forest').closest('li');
            const deleteButton = within(listItem!).getByRole('button', { name: /Delete/i });
            await user.click(deleteButton);

            // Confirm deletion
            const confirmButton = screen.getByRole('button', { name: 'Confirm' });
            await user.click(confirmButton);

            // Assert
            expect(mockDeleteSound).toHaveBeenCalledWith({
                stageId: 'test-stage-id',
                index: 2,
            });
        });

        it('should not call deleteSound when deletion is cancelled', async () => {
            // Arrange
            const user = userEvent.setup();
            const sounds = [createMockSound()];
            renderComponent({ soundSources: sounds });

            // Act - Click delete button (has aria-label from Delete icon)
            const listItem = screen.getByText('Ambient Forest').closest('li');
            const deleteButton = within(listItem!).getByRole('button', { name: /Delete/i });
            await user.click(deleteButton);

            // Cancel deletion
            const cancelButton = screen.getByRole('button', { name: 'Cancel' });
            await user.click(cancelButton);

            // Assert
            expect(mockDeleteSound).not.toHaveBeenCalled();
        });
    });

    describe('Sound expansion and editing', () => {
        it('should toggle sound expansion when expand button is clicked', async () => {
            // Arrange
            const sounds = [createMockSound()];
            renderComponent({ soundSources: sounds });

            // Act - Find and click the expand button
            const listItem = screen.getByText('Ambient Forest').closest('li');
            expect(listItem).toBeInTheDocument();

            const allButtons = within(listItem!).getAllByRole('button');
            const expandButton = allButtons.find(btn =>
                btn.classList.contains('MuiIconButton-root') && !btn.hasAttribute('aria-label')
            );

            if (expandButton) {
                fireEvent.click(expandButton);
            }

            // Assert - Should show expanded content
            await waitFor(() => {
                expect(screen.getByText('Range')).toBeInTheDocument();
            });
        });

        it('should show editable name field when sound is expanded', async () => {
            // Arrange
            const sounds = [createMockSound()];
            renderComponent({ soundSources: sounds });

            // Act - Expand the sound
            const listItem = screen.getByText('Ambient Forest').closest('li');
            const allButtons = within(listItem!).getAllByRole('button');
            const expandButton = allButtons.find(btn =>
                btn.classList.contains('MuiIconButton-root') && !btn.hasAttribute('aria-label')
            );

            if (expandButton) {
                fireEvent.click(expandButton);
            }

            // Assert - Should show text input for name
            await waitFor(() => {
                const nameInput = screen.getByRole('textbox');
                expect(nameInput).toHaveValue('Ambient Forest');
            });
        });

        it('should collapse sound when expand button is clicked again', async () => {
            // Arrange
            const sounds = [createMockSound()];
            renderComponent({ soundSources: sounds });

            // Act - First expand
            const listItem = screen.getByText('Ambient Forest').closest('li');
            const allButtons = within(listItem!).getAllByRole('button');
            const expandButton = allButtons.find(btn =>
                btn.classList.contains('MuiIconButton-root') && !btn.hasAttribute('aria-label')
            );

            if (expandButton) {
                fireEvent.click(expandButton);
            }

            // Wait for expansion
            await waitFor(() => {
                expect(screen.getByRole('textbox')).toBeInTheDocument();
            });

            // Collapse
            const buttonsAfterExpand = within(listItem!).getAllByRole('button');
            const collapseButton = buttonsAfterExpand.find(btn =>
                btn.classList.contains('MuiIconButton-root') && !btn.hasAttribute('aria-label')
            );

            if (collapseButton) {
                fireEvent.click(collapseButton);
            }

            // Assert - TextField should be removed
            await waitFor(() => {
                expect(screen.queryByRole('textbox')).not.toBeInTheDocument();
            });
        });

        it('should display range value in expanded view', async () => {
            // Arrange
            const sounds = [createMockSound({ radius: 100 })];
            renderComponent({ soundSources: sounds });

            // Act - Expand the sound
            const listItem = screen.getByText('Ambient Forest').closest('li');
            const allButtons = within(listItem!).getAllByRole('button');
            const expandButton = allButtons.find(btn =>
                btn.classList.contains('MuiIconButton-root') && !btn.hasAttribute('aria-label')
            );

            if (expandButton) {
                fireEvent.click(expandButton);
            }

            // Assert
            await waitFor(() => {
                expect(screen.getByText('100 feet')).toBeInTheDocument();
            });
        });
    });

    describe('Sound property controls', () => {
        it('should show Playing checkbox in expanded view', async () => {
            // Arrange
            const sounds = [createMockSound({ isPlaying: true })];
            renderComponent({ soundSources: sounds });

            // Act - Expand the sound
            const listItem = screen.getByText('Ambient Forest').closest('li');
            const allButtons = within(listItem!).getAllByRole('button');
            const expandButton = allButtons.find(btn =>
                btn.classList.contains('MuiIconButton-root') && !btn.hasAttribute('aria-label')
            );

            if (expandButton) {
                fireEvent.click(expandButton);
            }

            // Assert
            await waitFor(() => {
                const playingCheckbox = screen.getByRole('checkbox', { name: /Playing/i });
                expect(playingCheckbox).toBeChecked();
            });
        });

        it('should toggle isPlaying when checkbox is clicked', async () => {
            // Arrange
            const sounds = [createMockSound({ isPlaying: true, index: 5 })];
            renderComponent({ soundSources: sounds, });

            // Act - Expand the sound
            const listItem = screen.getByText('Ambient Forest').closest('li');
            const allButtons = within(listItem!).getAllByRole('button');
            const expandButton = allButtons.find(btn =>
                btn.classList.contains('MuiIconButton-root') && !btn.hasAttribute('aria-label')
            );

            if (expandButton) {
                fireEvent.click(expandButton);
            }

            await waitFor(() => {
                expect(screen.getByRole('checkbox', { name: /Playing/i })).toBeInTheDocument();
            });

            // Click the checkbox
            const playingCheckbox = screen.getByRole('checkbox', { name: /Playing/i });
            fireEvent.click(playingCheckbox);

            // Assert
            expect(mockUpdateSound).toHaveBeenCalledWith({
                stageId: 'test-stage-id',
                index: 5,
                data: { isPlaying: false },
            });
        });
    });

    describe('Sound resource management', () => {
        it('should show audio player when sound has media', async () => {
            // Arrange
            const sounds = [createMockSound()];
            renderComponent({ soundSources: sounds });

            // Act - Expand the sound
            const listItem = screen.getByText('Ambient Forest').closest('li');
            const allButtons = within(listItem!).getAllByRole('button');
            const expandButton = allButtons.find(btn =>
                btn.classList.contains('MuiIconButton-root') && !btn.hasAttribute('aria-label')
            );

            if (expandButton) {
                fireEvent.click(expandButton);
            }

            // Assert
            await waitFor(() => {
                expect(screen.getByText('Audio Player Mock')).toBeInTheDocument();
            });
        });

        it('should show "No sound assigned" when no media', async () => {
            // Arrange
            const sounds = [createMockSound({ media: undefined as unknown as StageSound['media'] })];
            renderComponent({ soundSources: sounds });

            // Act - Expand the sound
            const listItem = screen.getByText('Ambient Forest').closest('li');
            const allButtons = within(listItem!).getAllByRole('button');
            const expandButton = allButtons.find(btn =>
                btn.classList.contains('MuiIconButton-root') && !btn.hasAttribute('aria-label')
            );

            if (expandButton) {
                fireEvent.click(expandButton);
            }

            // Assert
            await waitFor(() => {
                expect(screen.getByText('No sound assigned')).toBeInTheDocument();
            });
        });

        it('should show Browse/Upload button when no media assigned', async () => {
            // Arrange
            const sounds = [createMockSound({ media: undefined as unknown as StageSound['media'] })];
            renderComponent({ soundSources: sounds });

            // Act - Expand the sound
            const listItem = screen.getByText('Ambient Forest').closest('li');
            const allButtons = within(listItem!).getAllByRole('button');
            const expandButton = allButtons.find(btn =>
                btn.classList.contains('MuiIconButton-root') && !btn.hasAttribute('aria-label')
            );

            if (expandButton) {
                fireEvent.click(expandButton);
            }

            // Assert
            await waitFor(() => {
                expect(screen.getByRole('button', { name: /Browse \/ Upload/i })).toBeInTheDocument();
            });
        });

        it('should show Change and Clear buttons when media is assigned', async () => {
            // Arrange
            const sounds = [createMockSound()];
            renderComponent({ soundSources: sounds });

            // Act - Expand the sound
            const listItem = screen.getByText('Ambient Forest').closest('li');
            const allButtons = within(listItem!).getAllByRole('button');
            const expandButton = allButtons.find(btn =>
                btn.classList.contains('MuiIconButton-root') && !btn.hasAttribute('aria-label')
            );

            if (expandButton) {
                fireEvent.click(expandButton);
            }

            // Assert
            await waitFor(() => {
                expect(screen.getByRole('button', { name: /Change/i })).toBeInTheDocument();
                expect(screen.getByRole('button', { name: /Clear/i })).toBeInTheDocument();
            });
        });

        it('should clear sound resource when Clear button is clicked', async () => {
            // Arrange
            const sounds = [createMockSound({ index: 3 })];
            renderComponent({ soundSources: sounds, });

            // Act - Expand the sound
            const listItem = screen.getByText('Ambient Forest').closest('li');
            const allButtons = within(listItem!).getAllByRole('button');
            const expandButton = allButtons.find(btn =>
                btn.classList.contains('MuiIconButton-root') && !btn.hasAttribute('aria-label')
            );

            if (expandButton) {
                fireEvent.click(expandButton);
            }

            await waitFor(() => {
                expect(screen.getByRole('button', { name: /Clear/i })).toBeInTheDocument();
            });

            // Click Clear
            const clearButton = screen.getByRole('button', { name: /Clear/i });
            fireEvent.click(clearButton);

            // Assert
            expect(mockUpdateSound).toHaveBeenCalledWith({
                stageId: 'test-stage-id',
                index: 3,
                data: { mediaId: '' },
            });
        });
    });

    describe('Theme support', () => {
        it('should render correctly in light theme', () => {
            // Arrange & Act
            renderComponent({}, 'light');

            // Assert
            expect(screen.getByText('Add Sound Source')).toBeInTheDocument();
            expect(screen.getByRole('button', { name: /Select from Library/i })).toBeInTheDocument();
        });

        it('should render correctly in dark theme', () => {
            // Arrange & Act
            renderComponent({}, 'dark');

            // Assert
            expect(screen.getByText('Add Sound Source')).toBeInTheDocument();
            expect(screen.getByRole('button', { name: /Select from Library/i })).toBeInTheDocument();
        });

        it('should render sound list correctly in light theme', () => {
            // Arrange
            const sounds = [createMockSound()];

            // Act
            renderComponent({ soundSources: sounds }, 'light');

            // Assert
            expect(screen.getByText('Ambient Forest')).toBeInTheDocument();
        });

        it('should render sound list correctly in dark theme', () => {
            // Arrange
            const sounds = [createMockSound()];

            // Act
            renderComponent({ soundSources: sounds }, 'dark');

            // Assert
            expect(screen.getByText('Ambient Forest')).toBeInTheDocument();
        });
    });

    describe('Edge cases', () => {
        it('should handle empty stageId gracefully', async () => {
            // Arrange
            const sounds = [createMockSound({ index: 1 })];
            renderComponent({ soundSources: sounds, stageId: undefined as unknown as string });

            // Act - Expand and try to toggle playing
            const listItem = screen.getByText('Ambient Forest').closest('li');
            const allButtons = within(listItem!).getAllByRole('button');
            const expandButton = allButtons.find(btn =>
                btn.classList.contains('MuiIconButton-root') && !btn.hasAttribute('aria-label')
            );

            if (expandButton) {
                fireEvent.click(expandButton);
            }

            await waitFor(() => {
                expect(screen.getByRole('checkbox', { name: /Playing/i })).toBeInTheDocument();
            });

            const playingCheckbox = screen.getByRole('checkbox', { name: /Playing/i });
            fireEvent.click(playingCheckbox);

            // Assert - Should not call update without valid stageId
            expect(mockUpdateSound).not.toHaveBeenCalled();
        });

        it('should handle undefined soundSources gracefully', () => {
            // Arrange & Act - Provide undefined to test default value
            const defaultProps: SoundsPanelProps = {
                
                soundSources: undefined as unknown as StageSound[],
                selectedSourceIndex: null,
                onSourceSelect: vi.fn<(index: number) => void>(),
                onPlaceSound: vi.fn<(properties: SoundPlacementProperties) => void>(),
            };
            renderWithTheme(<SoundsPanel {...defaultProps} />);

            // Assert
            expect(screen.getByText('No sounds placed')).toBeInTheDocument();
        });
    });
});
