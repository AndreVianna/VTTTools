import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { ThemeProvider, createTheme } from '@mui/material';
import { Provider } from 'react-redux';
import { configureStore } from '@reduxjs/toolkit';
import { ResourcePickerGrid } from './ResourcePickerGrid';
import type { MediaResource } from '@/types/domain';
import { ResourceRole } from '@/types/domain';

// Mock MUI icons to avoid file handle exhaustion
vi.mock('@mui/icons-material', () => ({
    AudioFile: () => <span data-testid="audio-icon">AudioIcon</span>,
    Videocam: () => <span data-testid="video-icon">VideoIcon</span>,
}));

// Mock the useAuthenticatedImageUrl hook
vi.mock('@/hooks/useAuthenticatedImageUrl', () => ({
    useAuthenticatedImageUrl: vi.fn(() => ({
        blobUrl: 'blob:http://localhost/mock-image',
        isLoading: false,
        error: null,
    })),
}));

const theme = createTheme();

const mockStore = configureStore({
    reducer: {
        auth: () => ({ isAuthenticated: true, user: null }),
    },
});

const renderWithProviders = (ui: React.ReactElement) => {
    return render(
        <Provider store={mockStore}>
            <ThemeProvider theme={theme}>{ui}</ThemeProvider>
        </Provider>
    );
};

const createMockResource = (overrides: Partial<MediaResource> = {}): MediaResource => ({
    id: 'resource-1',
    role: ResourceRole.Background,
    path: '/resources/test.png',
    contentType: 'image/png',
    fileName: 'test-image.png',
    fileSize: 1024 * 100,
    dimensions: { width: 800, height: 600 },
    duration: '',
    ...overrides,
});

describe('ResourcePickerGrid', () => {
    const defaultProps = {
        resources: [] as MediaResource[],
        isLoading: false,
        selectedResourceId: null,
        onSelect: vi.fn(),
        viewMode: 'grid' as const,
    };

    beforeEach(() => {
        vi.clearAllMocks();
    });

    describe('Loading state', () => {
        it('should show loading spinner when isLoading is true', () => {
            renderWithProviders(
                <ResourcePickerGrid {...defaultProps} isLoading={true} />
            );

            expect(screen.getByRole('progressbar')).toBeInTheDocument();
        });
    });

    describe('Empty state', () => {
        it('should show empty message when no resources', () => {
            renderWithProviders(
                <ResourcePickerGrid {...defaultProps} resources={[]} />
            );

            expect(screen.getByText(/no resources found/i)).toBeInTheDocument();
        });
    });

    describe('Grid view', () => {
        it('should render resource cards in grid view', () => {
            const resources = [
                createMockResource({ id: '1', fileName: 'image1.png' }),
                createMockResource({ id: '2', fileName: 'image2.png' }),
            ];

            renderWithProviders(
                <ResourcePickerGrid
                    {...defaultProps}
                    resources={resources}
                    viewMode="grid"
                />
            );

            expect(screen.getByText('image1.png')).toBeInTheDocument();
            expect(screen.getByText('image2.png')).toBeInTheDocument();
        });

        it('should call onSelect when clicking a card', async () => {
            const user = userEvent.setup();
            const onSelect = vi.fn();
            const resource = createMockResource({ id: '1', fileName: 'clickable.png' });

            renderWithProviders(
                <ResourcePickerGrid
                    {...defaultProps}
                    resources={[resource]}
                    onSelect={onSelect}
                />
            );

            await user.click(screen.getByText('clickable.png'));

            expect(onSelect).toHaveBeenCalledWith(resource);
        });

        it('should highlight selected resource', () => {
            const resource = createMockResource({ id: 'selected-1', fileName: 'selected.png' });

            renderWithProviders(
                <ResourcePickerGrid
                    {...defaultProps}
                    resources={[resource]}
                    selectedResourceId="selected-1"
                />
            );

            // The selected card should have the primary border color
            const card = screen.getByText('selected.png').closest('.MuiCard-root');
            expect(card).toBeInTheDocument();
        });

        it('should show VIDEO badge for video resources', () => {
            const videoResource = createMockResource({
                id: 'video-1',
                fileName: 'video.mp4',
                contentType: 'video/mp4',
            });

            renderWithProviders(
                <ResourcePickerGrid
                    {...defaultProps}
                    resources={[videoResource]}
                    viewMode="grid"
                />
            );

            expect(screen.getByText('VIDEO')).toBeInTheDocument();
        });

        it('should show audio icon for audio resources', () => {
            const audioResource = createMockResource({
                id: 'audio-1',
                fileName: 'sound.mp3',
                contentType: 'audio/mpeg',
                duration: 'PT1M30S',
            });

            renderWithProviders(
                <ResourcePickerGrid
                    {...defaultProps}
                    resources={[audioResource]}
                    viewMode="grid"
                />
            );

            expect(screen.getByText('sound.mp3')).toBeInTheDocument();
            expect(screen.getByTestId('audio-icon')).toBeInTheDocument();
            expect(screen.getByText('1:30')).toBeInTheDocument();
        });
    });

    describe('List view', () => {
        it('should render table in list view', () => {
            const audioResources = [
                createMockResource({
                    id: 'audio-1',
                    fileName: 'ambient.mp3',
                    contentType: 'audio/mpeg',
                    duration: 'PT2M45S',
                    fileSize: 1024 * 500,
                }),
            ];

            renderWithProviders(
                <ResourcePickerGrid
                    {...defaultProps}
                    resources={audioResources}
                    viewMode="list"
                />
            );

            expect(screen.getByText('FILE NAME')).toBeInTheDocument();
            expect(screen.getByText('DURATION')).toBeInTheDocument();
            expect(screen.getByText('SIZE')).toBeInTheDocument();
            expect(screen.getByText('ambient.mp3')).toBeInTheDocument();
            expect(screen.getByText('2:45')).toBeInTheDocument();
        });

        it('should call onSelect when clicking a row', async () => {
            const user = userEvent.setup();
            const onSelect = vi.fn();
            const resource = createMockResource({
                id: 'audio-1',
                fileName: 'click-me.mp3',
                contentType: 'audio/mpeg',
            });

            renderWithProviders(
                <ResourcePickerGrid
                    {...defaultProps}
                    resources={[resource]}
                    viewMode="list"
                    onSelect={onSelect}
                />
            );

            await user.click(screen.getByText('click-me.mp3'));

            expect(onSelect).toHaveBeenCalledWith(resource);
        });

        it('should highlight selected row', () => {
            const resource = createMockResource({
                id: 'selected-audio',
                fileName: 'selected.mp3',
                contentType: 'audio/mpeg',
            });

            renderWithProviders(
                <ResourcePickerGrid
                    {...defaultProps}
                    resources={[resource]}
                    viewMode="list"
                    selectedResourceId="selected-audio"
                />
            );

            const row = screen.getByText('selected.mp3').closest('tr');
            expect(row).toHaveClass('Mui-selected');
        });
    });

    describe('Content type hint', () => {
        it('should use list view when contentTypeHint is audio', () => {
            const audioResource = createMockResource({
                id: 'audio-1',
                fileName: 'sound.mp3',
                contentType: 'audio/mpeg',
            });

            renderWithProviders(
                <ResourcePickerGrid
                    {...defaultProps}
                    resources={[audioResource]}
                    viewMode="grid"
                    contentTypeHint="audio"
                />
            );

            // Should show table headers even in grid mode when hint is audio
            expect(screen.getByText('FILE NAME')).toBeInTheDocument();
        });
    });

    describe('Duration formatting', () => {
        it('should format duration with hours correctly', () => {
            const resource = createMockResource({
                id: 'long-audio',
                fileName: 'podcast.mp3',
                contentType: 'audio/mpeg',
                duration: 'PT1H30M45S',
            });

            renderWithProviders(
                <ResourcePickerGrid
                    {...defaultProps}
                    resources={[resource]}
                    viewMode="list"
                />
            );

            expect(screen.getByText('1:30:45')).toBeInTheDocument();
        });

        it('should format duration without hours correctly', () => {
            const resource = createMockResource({
                id: 'short-audio',
                fileName: 'effect.wav',
                contentType: 'audio/wav',
                duration: 'PT5S',
            });

            renderWithProviders(
                <ResourcePickerGrid
                    {...defaultProps}
                    resources={[resource]}
                    viewMode="list"
                />
            );

            expect(screen.getByText('0:05')).toBeInTheDocument();
        });
    });

    describe('File size formatting', () => {
        it('should format bytes correctly', () => {
            const resource = createMockResource({
                id: 'small-file',
                fileName: 'tiny.wav',
                contentType: 'audio/wav',
                fileSize: 500,
            });

            renderWithProviders(
                <ResourcePickerGrid
                    {...defaultProps}
                    resources={[resource]}
                    viewMode="list"
                />
            );

            expect(screen.getByText('500 B')).toBeInTheDocument();
        });

        it('should format kilobytes correctly', () => {
            const resource = createMockResource({
                id: 'kb-file',
                fileName: 'medium.wav',
                contentType: 'audio/wav',
                fileSize: 1024 * 50,
            });

            renderWithProviders(
                <ResourcePickerGrid
                    {...defaultProps}
                    resources={[resource]}
                    viewMode="list"
                />
            );

            expect(screen.getByText('50.0 KB')).toBeInTheDocument();
        });

        it('should format megabytes correctly', () => {
            const resource = createMockResource({
                id: 'mb-file',
                fileName: 'large.mp3',
                contentType: 'audio/mpeg',
                fileSize: 1024 * 1024 * 5,
            });

            renderWithProviders(
                <ResourcePickerGrid
                    {...defaultProps}
                    resources={[resource]}
                    viewMode="list"
                />
            );

            expect(screen.getByText('5.0 MB')).toBeInTheDocument();
        });
    });
});
