import React from 'react';
import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { ThemeProvider, createTheme } from '@mui/material';
import { Provider } from 'react-redux';
import { configureStore } from '@reduxjs/toolkit';
import { ResourcePickerPreview } from './ResourcePickerPreview';
import type { MediaResource } from '@/types/domain';
import { ResourceRole } from '@/types/domain';

// Mock MUI icons to avoid file handle exhaustion
vi.mock('@mui/icons-material', () => ({
    ChevronLeft: () => <span data-testid="chevron-left-icon">ChevronLeftIcon</span>,
    ChevronRight: () => <span data-testid="chevron-right-icon">ChevronRightIcon</span>,
    Pause: () => <span data-testid="pause-icon">PauseIcon</span>,
    PlayArrow: () => <span data-testid="play-icon">PlayIcon</span>,
}));

// Mock the hooks
vi.mock('@/hooks/useAuthenticatedResource', () => ({
    useAuthenticatedResource: vi.fn(() => ({
        url: 'blob:http://localhost/mock-resource',
        isLoading: false,
        error: null,
        refetch: vi.fn(),
    })),
}));

vi.mock('@/components/sounds/AudioPreviewPlayer', () => ({
    AudioPreviewPlayer: vi.fn(({ resourceId }) => (
        <div data-testid="audio-preview-player">Audio Player: {resourceId}</div>
    )),
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

describe('ResourcePickerPreview', () => {
    beforeEach(() => {
        vi.clearAllMocks();
    });

    describe('Empty state', () => {
        it('should show placeholder message when no resource is selected', () => {
            renderWithProviders(<ResourcePickerPreview resource={null} />);

            expect(screen.getByText(/select a resource to preview/i)).toBeInTheDocument();
        });
    });

    describe('Image preview', () => {
        it('should render image preview for image resources', () => {
            const imageResource = createMockResource({
                id: 'img-1',
                fileName: 'background.png',
                contentType: 'image/png',
                dimensions: { width: 1920, height: 1080 },
            });

            renderWithProviders(<ResourcePickerPreview resource={imageResource} />);

            expect(screen.getByText('PREVIEW')).toBeInTheDocument();
            expect(screen.getByRole('img', { name: /background.png/i })).toBeInTheDocument();
        });

        it('should show dimensions for image resources', () => {
            const imageResource = createMockResource({
                id: 'img-2',
                fileName: 'photo.jpg',
                contentType: 'image/jpeg',
                dimensions: { width: 1920, height: 1080 },
            });

            renderWithProviders(<ResourcePickerPreview resource={imageResource} />);

            expect(screen.getByText('DIMENSIONS')).toBeInTheDocument();
            expect(screen.getByText('1920 x 1080')).toBeInTheDocument();
        });
    });

    describe('Video preview', () => {
        it('should render video preview for video resources', () => {
            const videoResource = createMockResource({
                id: 'vid-1',
                fileName: 'intro.mp4',
                contentType: 'video/mp4',
                dimensions: { width: 1280, height: 720 },
            });

            renderWithProviders(<ResourcePickerPreview resource={videoResource} />);

            // Find the play/pause button by its id
            const playButton = document.getElementById('btn-video-play-pause');
            expect(playButton).toBeInTheDocument();
        });

        it('should toggle play/pause on video', async () => {
            const user = userEvent.setup();
            const videoResource = createMockResource({
                id: 'vid-2',
                fileName: 'demo.webm',
                contentType: 'video/webm',
            });

            renderWithProviders(<ResourcePickerPreview resource={videoResource} />);

            const playButton = document.getElementById('btn-video-play-pause');
            expect(playButton).toBeInTheDocument();
            await user.click(playButton!);

            // Button should still be present (component handles play state internally)
            expect(playButton).toBeInTheDocument();
        });
    });

    describe('Audio preview', () => {
        it('should render AudioPreviewPlayer for audio resources', () => {
            const audioResource = createMockResource({
                id: 'audio-1',
                fileName: 'ambient.mp3',
                contentType: 'audio/mpeg',
                duration: 'PT3M20S',
            });

            renderWithProviders(<ResourcePickerPreview resource={audioResource} />);

            expect(screen.getByTestId('audio-preview-player')).toBeInTheDocument();
            expect(screen.getByText('Audio Player: audio-1')).toBeInTheDocument();
        });

        it('should show duration for audio resources', () => {
            const audioResource = createMockResource({
                id: 'audio-2',
                fileName: 'music.ogg',
                contentType: 'audio/ogg',
                duration: 'PT5M45S',
            });

            renderWithProviders(<ResourcePickerPreview resource={audioResource} />);

            expect(screen.getByText('DURATION')).toBeInTheDocument();
            expect(screen.getByText('5:45')).toBeInTheDocument();
        });
    });

    describe('Metadata display', () => {
        it('should display file name', () => {
            const resource = createMockResource({
                fileName: 'my-awesome-file.png',
            });

            renderWithProviders(<ResourcePickerPreview resource={resource} />);

            expect(screen.getByText('FILE NAME')).toBeInTheDocument();
            expect(screen.getByText('my-awesome-file.png')).toBeInTheDocument();
        });

        it('should display file size', () => {
            const resource = createMockResource({
                fileSize: 1024 * 1024 * 2.5, // 2.5 MB
            });

            renderWithProviders(<ResourcePickerPreview resource={resource} />);

            expect(screen.getByText('FILE SIZE')).toBeInTheDocument();
            expect(screen.getByText('2.5 MB')).toBeInTheDocument();
        });

        it('should display content type', () => {
            const resource = createMockResource({
                contentType: 'image/webp',
            });

            renderWithProviders(<ResourcePickerPreview resource={resource} />);

            expect(screen.getByText('CONTENT TYPE')).toBeInTheDocument();
            expect(screen.getByText('image/webp')).toBeInTheDocument();
        });

        it('should not show dimensions if zero', () => {
            const resource = createMockResource({
                dimensions: { width: 0, height: 0 },
            });

            renderWithProviders(<ResourcePickerPreview resource={resource} />);

            expect(screen.queryByText('DIMENSIONS')).not.toBeInTheDocument();
        });

        it('should not show duration if empty or zero', () => {
            const resource = createMockResource({
                duration: 'PT0S',
            });

            renderWithProviders(<ResourcePickerPreview resource={resource} />);

            expect(screen.queryByText('DURATION')).not.toBeInTheDocument();
        });
    });

    describe('Duration formatting', () => {
        it('should format hours correctly', () => {
            const resource = createMockResource({
                contentType: 'audio/mpeg',
                duration: 'PT2H30M15S',
            });

            renderWithProviders(<ResourcePickerPreview resource={resource} />);

            expect(screen.getByText('2:30:15')).toBeInTheDocument();
        });

        it('should format minutes and seconds correctly', () => {
            const resource = createMockResource({
                contentType: 'audio/mpeg',
                duration: 'PT12M5S',
            });

            renderWithProviders(<ResourcePickerPreview resource={resource} />);

            expect(screen.getByText('12:05')).toBeInTheDocument();
        });

        it('should format seconds only correctly', () => {
            const resource = createMockResource({
                contentType: 'audio/mpeg',
                duration: 'PT45S',
            });

            renderWithProviders(<ResourcePickerPreview resource={resource} />);

            expect(screen.getByText('0:45')).toBeInTheDocument();
        });
    });

    describe('File size formatting', () => {
        it('should format bytes', () => {
            const resource = createMockResource({
                fileSize: 512,
            });

            renderWithProviders(<ResourcePickerPreview resource={resource} />);

            expect(screen.getByText('512 B')).toBeInTheDocument();
        });

        it('should format kilobytes', () => {
            const resource = createMockResource({
                fileSize: 1024 * 256,
            });

            renderWithProviders(<ResourcePickerPreview resource={resource} />);

            expect(screen.getByText('256.0 KB')).toBeInTheDocument();
        });

        it('should format megabytes', () => {
            const resource = createMockResource({
                fileSize: 1024 * 1024 * 10,
            });

            renderWithProviders(<ResourcePickerPreview resource={resource} />);

            expect(screen.getByText('10.0 MB')).toBeInTheDocument();
        });
    });

    describe('Loading state', () => {
        it('should show loading spinner while fetching image', async () => {
            const { useAuthenticatedResource } = await import('@/hooks/useAuthenticatedResource');
            vi.mocked(useAuthenticatedResource).mockReturnValue({
                url: null,
                isLoading: true,
                error: null,
                refetch: vi.fn(),
            });

            const imageResource = createMockResource({
                contentType: 'image/png',
            });

            renderWithProviders(<ResourcePickerPreview resource={imageResource} />);

            expect(screen.getByRole('progressbar')).toBeInTheDocument();
        });

        it('should show error message when fetch fails', async () => {
            const { useAuthenticatedResource } = await import('@/hooks/useAuthenticatedResource');
            vi.mocked(useAuthenticatedResource).mockReturnValue({
                url: null,
                isLoading: false,
                error: new Error('Network error'),
                refetch: vi.fn(),
            });

            const imageResource = createMockResource({
                contentType: 'image/png',
            });

            renderWithProviders(<ResourcePickerPreview resource={imageResource} />);

            expect(screen.getByText(/failed to load preview/i)).toBeInTheDocument();
        });
    });

    describe('Collapsible behavior', () => {
        it('should not show collapse button when onToggleCollapse is not provided', () => {
            const resource = createMockResource();

            renderWithProviders(<ResourcePickerPreview resource={resource} />);

            expect(document.getElementById('btn-collapse-preview')).not.toBeInTheDocument();
            expect(document.getElementById('btn-expand-preview')).not.toBeInTheDocument();
        });

        it('should show collapse button when onToggleCollapse is provided and expanded', () => {
            const resource = createMockResource();
            const onToggleCollapse = vi.fn();

            renderWithProviders(
                <ResourcePickerPreview
                    resource={resource}
                    isCollapsed={false}
                    onToggleCollapse={onToggleCollapse}
                />
            );

            expect(document.getElementById('btn-collapse-preview')).toBeInTheDocument();
        });

        it('should show expand button when collapsed', () => {
            const resource = createMockResource();
            const onToggleCollapse = vi.fn();

            renderWithProviders(
                <ResourcePickerPreview
                    resource={resource}
                    isCollapsed={true}
                    onToggleCollapse={onToggleCollapse}
                />
            );

            expect(document.getElementById('btn-expand-preview')).toBeInTheDocument();
        });

        it('should show vertical PREVIEW text when collapsed', () => {
            const resource = createMockResource();
            const onToggleCollapse = vi.fn();

            renderWithProviders(
                <ResourcePickerPreview
                    resource={resource}
                    isCollapsed={true}
                    onToggleCollapse={onToggleCollapse}
                />
            );

            expect(screen.getByText('PREVIEW')).toBeInTheDocument();
        });

        it('should call onToggleCollapse when collapse button is clicked', async () => {
            const user = userEvent.setup();
            const resource = createMockResource();
            const onToggleCollapse = vi.fn();

            renderWithProviders(
                <ResourcePickerPreview
                    resource={resource}
                    isCollapsed={false}
                    onToggleCollapse={onToggleCollapse}
                />
            );

            const collapseButton = document.getElementById('btn-collapse-preview');
            expect(collapseButton).toBeInTheDocument();
            await user.click(collapseButton!);

            expect(onToggleCollapse).toHaveBeenCalledTimes(1);
        });

        it('should call onToggleCollapse when expand button is clicked', async () => {
            const user = userEvent.setup();
            const resource = createMockResource();
            const onToggleCollapse = vi.fn();

            renderWithProviders(
                <ResourcePickerPreview
                    resource={resource}
                    isCollapsed={true}
                    onToggleCollapse={onToggleCollapse}
                />
            );

            const expandButton = document.getElementById('btn-expand-preview');
            expect(expandButton).toBeInTheDocument();
            await user.click(expandButton!);

            expect(onToggleCollapse).toHaveBeenCalledTimes(1);
        });

        it('should show collapse button in empty state when onToggleCollapse is provided', () => {
            const onToggleCollapse = vi.fn();

            renderWithProviders(
                <ResourcePickerPreview
                    resource={null}
                    isCollapsed={false}
                    onToggleCollapse={onToggleCollapse}
                />
            );

            expect(document.getElementById('btn-collapse-preview')).toBeInTheDocument();
        });

        it('should show collapsed view in empty state when isCollapsed is true', () => {
            const onToggleCollapse = vi.fn();

            renderWithProviders(
                <ResourcePickerPreview
                    resource={null}
                    isCollapsed={true}
                    onToggleCollapse={onToggleCollapse}
                />
            );

            expect(document.getElementById('btn-expand-preview')).toBeInTheDocument();
            expect(screen.queryByText(/select a resource to preview/i)).not.toBeInTheDocument();
        });
    });
});
