/**
 * MediaLibraryPage Component Tests
 * Tests the media browser page with its 3-panel layout, filtering, and CRUD operations
 * Coverage: Media library browsing, filtering, category tabs, and state management
 */

import { createTheme, ThemeProvider } from '@mui/material/styles';
import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import React from 'react';
import { beforeEach, describe, expect, it, vi } from 'vitest';

import { ResourceRole, type MediaResource } from '@/types/domain';

// Helper to create mock media resources
const createMockMedia = (overrides: Partial<MediaResource> = {}): MediaResource => ({
    id: 'media-1',
    role: ResourceRole.Token,
    path: '/uploads/media-1.png',
    contentType: 'image/png',
    fileName: 'dragon-token.png',
    fileSize: 102400,
    dimensions: { width: 256, height: 256 },
    duration: 'PT0S',
    ...overrides,
});

// Mock functions
const mockSetSelectedCategory = vi.fn<(category: ResourceRole) => void>();
const mockSetSearchQuery = vi.fn<(query: string) => void>();
const mockSetOwnershipFilter = vi.fn<(filter: 'all' | 'mine' | 'others') => void>();
const mockSetStatusFilter = vi.fn<(filter: 'all' | 'published' | 'draft') => void>();
const mockSetViewMode = vi.fn<(mode: 'grid-large' | 'grid-small' | 'table') => void>();
const mockSetSort = vi.fn<(field: string, direction: 'asc' | 'desc') => void>();
const mockSetSelectedMediaId = vi.fn<(id: string | null) => void>();
const mockToggleMediaSelection = vi.fn<(id: string) => void>();
const mockClearSelection = vi.fn<() => void>();
const mockLoadMore = vi.fn<() => void>();
const mockResetFilters = vi.fn<() => void>();
const mockFilterMedia = vi.fn<(media: MediaResource[]) => MediaResource[]>((media: MediaResource[]) => media);
const mockDeleteResource = vi.fn<(id: string) => Promise<void>>();
const mockRefetch = vi.fn<() => void>();

// Mutable mock state objects - referenced by vi.fn() in mocks
const mockBrowserState = {
    selectedCategory: ResourceRole.Undefined,
    searchQuery: '',
    ownershipFilter: 'all' as const,
    statusFilter: 'all' as const,
    viewMode: 'grid-large' as 'grid-large' | 'grid-small' | 'table',
    sortField: 'name' as const,
    sortDirection: 'asc' as const,
    selectedMediaId: null as string | null,
    selectedMediaIds: [] as string[],
    skip: 0,
    take: 50,
    hasMore: false,
    totalCount: 0,
    inspectorOpen: false,
    isMultiSelectMode: false,
    queryParams: { skip: 0, take: 50 },
    setSelectedCategory: mockSetSelectedCategory,
    setSearchQuery: mockSetSearchQuery,
    setOwnershipFilter: mockSetOwnershipFilter,
    setStatusFilter: mockSetStatusFilter,
    setViewMode: mockSetViewMode,
    setSort: mockSetSort,
    setSelectedMediaId: mockSetSelectedMediaId,
    setSelectedMediaIds: vi.fn<(ids: string[]) => void>() as (ids: string[]) => void,
    toggleMediaSelection: mockToggleMediaSelection,
    clearSelection: mockClearSelection,
    setPagination: vi.fn<(skip: number, take: number) => void>() as (skip: number, take: number) => void,
    loadMore: mockLoadMore,
    resetFilters: mockResetFilters,
    filterMedia: mockFilterMedia,
};

const mockQueryState = {
    data: undefined as { items: MediaResource[]; totalCount: number; skip: number; take: number } | undefined,
    isLoading: false,
    isFetching: false,
    error: undefined as Error | undefined,
    refetch: mockRefetch,
};

vi.mock('@/hooks/useMediaBrowser', () => ({
    useMediaBrowser: vi.fn<() => typeof mockBrowserState>(() => mockBrowserState),
}));

vi.mock('@/services/mediaApi', () => ({
    useFilterResourcesQuery: vi.fn<() => typeof mockQueryState>(() => mockQueryState),
    useDeleteResourceMutation: vi.fn<() => [typeof mockDeleteResource, { isLoading: boolean }]>(() => [mockDeleteResource, { isLoading: false }]),
}));

// Mock child components
vi.mock('@/components/assets/browser', () => ({
    AssetBrowserLayout: vi.fn<(props: { leftSidebar: React.ReactNode; mainContent: React.ReactNode; rightSidebar: React.ReactNode }) => React.ReactElement>(({ leftSidebar, mainContent, rightSidebar }) => (
        <div data-mock="AssetBrowserLayout">
            <div data-mock="leftSidebar">{leftSidebar}</div>
            <div data-mock="mainContent">{mainContent}</div>
            <div data-mock="rightSidebar">{rightSidebar}</div>
        </div>
    )),
    BrowserToolbar: vi.fn<() => React.ReactElement>(() => <div data-mock="BrowserToolbar" />),
}));

vi.mock('@/components/media/MediaGrid', () => ({
    MediaGrid: vi.fn<() => React.ReactElement>(() => <div data-mock="MediaGrid" />),
}));

vi.mock('@/components/media/MediaList', () => ({
    MediaList: vi.fn<() => React.ReactElement>(() => <div data-mock="MediaList" />),
}));

// Import component after mocks are set up
import { MediaLibraryPage } from './MediaLibraryPage';

const TestWrapper: React.FC<{ children: React.ReactNode }> = ({ children }) => {
    const theme = createTheme({ palette: { mode: 'light' } });
    return <ThemeProvider theme={theme}>{children}</ThemeProvider>;
};
TestWrapper.displayName = 'TestWrapper';

// Helper to reset mock state to defaults
const resetMockState = () => {
    // Reset browser state
    mockBrowserState.selectedCategory = ResourceRole.Undefined;
    mockBrowserState.searchQuery = '';
    mockBrowserState.ownershipFilter = 'all';
    mockBrowserState.statusFilter = 'all';
    mockBrowserState.viewMode = 'grid-large';
    mockBrowserState.sortField = 'name';
    mockBrowserState.sortDirection = 'asc';
    mockBrowserState.selectedMediaId = null;
    mockBrowserState.selectedMediaIds = [];
    mockBrowserState.skip = 0;
    mockBrowserState.take = 50;
    mockBrowserState.hasMore = false;
    mockBrowserState.totalCount = 0;
    mockBrowserState.inspectorOpen = false;
    mockBrowserState.isMultiSelectMode = false;
    mockBrowserState.filterMedia = mockFilterMedia;

    // Reset query state
    mockQueryState.data = undefined;
    mockQueryState.isLoading = false;
    mockQueryState.isFetching = false;
    mockQueryState.error = undefined;
};

describe('MediaLibraryPage', () => {
    beforeEach(() => {
        vi.clearAllMocks();
        resetMockState();
    });

    describe('rendering', () => {
        it('should render AssetBrowserLayout', () => {
            // Arrange & Act
            render(
                <TestWrapper>
                    <MediaLibraryPage />
                </TestWrapper>,
            );

            // Assert
            expect(screen.getByText((_, element) => element?.getAttribute('data-mock') === 'AssetBrowserLayout')).toBeInTheDocument();
        });

        it('should render category tabs (All, Background, Token, etc.)', () => {
            // Arrange & Act
            render(
                <TestWrapper>
                    <MediaLibraryPage />
                </TestWrapper>,
            );

            // Assert
            expect(screen.getByRole('tab', { name: /all/i })).toBeInTheDocument();
            expect(screen.getByRole('tab', { name: /background/i })).toBeInTheDocument();
            expect(screen.getByRole('tab', { name: /token/i })).toBeInTheDocument();
            expect(screen.getByRole('tab', { name: /portrait/i })).toBeInTheDocument();
            expect(screen.getByRole('tab', { name: /overlay/i })).toBeInTheDocument();
            expect(screen.getByRole('tab', { name: /illustration/i })).toBeInTheDocument();
            expect(screen.getByRole('tab', { name: /sound effect/i })).toBeInTheDocument();
            expect(screen.getByRole('tab', { name: /ambient sound/i })).toBeInTheDocument();
            expect(screen.getByRole('tab', { name: /cut scene/i })).toBeInTheDocument();
        });

        it('should render Ownership and Status filter accordions', () => {
            // Arrange & Act
            render(
                <TestWrapper>
                    <MediaLibraryPage />
                </TestWrapper>,
            );

            // Assert
            expect(screen.getByText('Ownership')).toBeInTheDocument();
            expect(screen.getByText('Status')).toBeInTheDocument();
        });
    });

    describe('loading state', () => {
        it('should show loading spinner when loading media', () => {
            // Arrange
            mockQueryState.isLoading = true;

            // Act
            render(
                <TestWrapper>
                    <MediaLibraryPage />
                </TestWrapper>,
            );

            // Assert
            expect(screen.getByRole('progressbar')).toBeInTheDocument();
        });
    });

    describe('error state', () => {
        it('should show error alert with Retry button when query fails', () => {
            // Arrange
            mockQueryState.error = new Error('Network error');

            // Act
            render(
                <TestWrapper>
                    <MediaLibraryPage />
                </TestWrapper>,
            );

            // Assert
            expect(screen.getByRole('alert')).toBeInTheDocument();
            expect(screen.getByText(/failed to load media/i)).toBeInTheDocument();
            expect(screen.getByRole('button', { name: /retry/i })).toBeInTheDocument();
        });

        it('should call refetch when Retry button is clicked', async () => {
            // Arrange
            const user = userEvent.setup();
            mockQueryState.error = new Error('Network error');

            render(
                <TestWrapper>
                    <MediaLibraryPage />
                </TestWrapper>,
            );

            // Act
            const retryButton = screen.getByRole('button', { name: /retry/i });
            await user.click(retryButton);

            // Assert
            expect(mockRefetch).toHaveBeenCalled();
        });
    });

    describe('empty state', () => {
        it('should show "No media found" message when no media', () => {
            // Arrange
            mockQueryState.data = { items: [], totalCount: 0, skip: 0, take: 50 };

            // Act
            render(
                <TestWrapper>
                    <MediaLibraryPage />
                </TestWrapper>,
            );

            // Assert
            expect(screen.getByRole('heading', { name: /no media found/i })).toBeInTheDocument();
            expect(screen.getByText(/try adjusting your filters/i)).toBeInTheDocument();
        });
    });

    describe('data display', () => {
        it('should render MediaGrid for image categories', () => {
            // Arrange
            const mockMedia = [createMockMedia()];
            // Do NOT change selectedCategory - just test with default viewMode and data
            mockBrowserState.viewMode = 'grid-large';
            mockBrowserState.filterMedia = vi.fn<(media: MediaResource[]) => MediaResource[]>(() => mockMedia);
            mockQueryState.data = { items: mockMedia, totalCount: 1, skip: 0, take: 50 };

            // Act
            render(
                <TestWrapper>
                    <MediaLibraryPage />
                </TestWrapper>,
            );

            // Assert
            // With grid-large view mode and non-audio category (Undefined), MediaGrid should render
            expect(screen.getByText((_, element) => element?.getAttribute('data-mock') === 'MediaGrid')).toBeInTheDocument();
        });

        it('should render MediaList for audio categories', () => {
            // Arrange - audio categories use list view regardless of viewMode
            const mockMedia = [createMockMedia({ role: ResourceRole.SoundEffect })];
            mockBrowserState.selectedCategory = ResourceRole.SoundEffect;
            mockBrowserState.viewMode = 'grid-large'; // Even with grid view, audio uses list
            mockBrowserState.filterMedia = vi.fn<(media: MediaResource[]) => MediaResource[]>(() => mockMedia);
            mockQueryState.data = { items: mockMedia, totalCount: 1, skip: 0, take: 50 };

            // Act
            render(
                <TestWrapper>
                    <MediaLibraryPage />
                </TestWrapper>,
            );

            // Assert
            expect(screen.getByText((_, element) => element?.getAttribute('data-mock') === 'MediaList')).toBeInTheDocument();
        });

        it('should render MediaList for table view mode', () => {
            // Arrange - table view mode forces MediaList regardless of category
            const mockMedia = [createMockMedia()];
            mockBrowserState.viewMode = 'table';
            mockBrowserState.filterMedia = vi.fn<(media: MediaResource[]) => MediaResource[]>(() => mockMedia);
            mockQueryState.data = { items: mockMedia, totalCount: 1, skip: 0, take: 50 };

            // Act
            render(
                <TestWrapper>
                    <MediaLibraryPage />
                </TestWrapper>,
            );

            // Assert
            expect(screen.getByText((_, element) => element?.getAttribute('data-mock') === 'MediaList')).toBeInTheDocument();
        });
    });

    describe('selection', () => {
        it('should show Media Inspector panel when media is selected', () => {
            // Arrange
            const mockMedia = createMockMedia({ id: 'media-123', fileName: 'goblin.png', fileSize: 51200 });
            mockBrowserState.selectedMediaId = 'media-123';
            mockBrowserState.inspectorOpen = true;
            mockBrowserState.filterMedia = vi.fn<(media: MediaResource[]) => MediaResource[]>(() => [mockMedia]);
            mockQueryState.data = { items: [mockMedia], totalCount: 1, skip: 0, take: 50 };

            // Act
            render(
                <TestWrapper>
                    <MediaLibraryPage />
                </TestWrapper>,
            );

            // Assert
            expect(screen.getByRole('heading', { name: /media inspector/i })).toBeInTheDocument();
        });

        it('should show file details in inspector (fileName, role, size)', () => {
            // Arrange
            const mockMedia = createMockMedia({
                id: 'media-456',
                fileName: 'orc-warrior.png',
                role: ResourceRole.Token,
                fileSize: 75776, // 74 KB
            });
            mockBrowserState.selectedMediaId = 'media-456';
            mockBrowserState.inspectorOpen = true;
            mockBrowserState.filterMedia = vi.fn<(media: MediaResource[]) => MediaResource[]>(() => [mockMedia]);
            mockQueryState.data = { items: [mockMedia], totalCount: 1, skip: 0, take: 50 };

            // Act
            render(
                <TestWrapper>
                    <MediaLibraryPage />
                </TestWrapper>,
            );

            // Assert
            expect(screen.getByText('orc-warrior.png')).toBeInTheDocument();
            expect(screen.getByText(/type:.*token/i)).toBeInTheDocument();
            expect(screen.getByText(/size:.*74\.00 kb/i)).toBeInTheDocument();
        });

        it('should show Delete button in inspector when media is selected', () => {
            // Arrange
            const mockMedia = createMockMedia({ id: 'media-789' });
            mockBrowserState.selectedMediaId = 'media-789';
            mockBrowserState.inspectorOpen = true;
            mockBrowserState.filterMedia = vi.fn<(media: MediaResource[]) => MediaResource[]>(() => [mockMedia]);
            mockQueryState.data = { items: [mockMedia], totalCount: 1, skip: 0, take: 50 };

            // Act
            render(
                <TestWrapper>
                    <MediaLibraryPage />
                </TestWrapper>,
            );

            // Assert
            expect(screen.getByRole('button', { name: /delete/i })).toBeInTheDocument();
        });
    });

    describe('filter controls', () => {
        it('should show Reset Filters button when search query is active', () => {
            // Arrange - use searchQuery instead of selectedCategory to trigger active filters
            mockBrowserState.searchQuery = 'dragon';

            // Act
            render(
                <TestWrapper>
                    <MediaLibraryPage />
                </TestWrapper>,
            );

            // Assert
            expect(screen.getByRole('button', { name: /reset filters/i })).toBeInTheDocument();
        });

        it('should not show Reset Filters button when no filters are active', () => {
            // Arrange - default state has no active filters

            // Act
            render(
                <TestWrapper>
                    <MediaLibraryPage />
                </TestWrapper>,
            );

            // Assert
            expect(screen.queryByRole('button', { name: /reset filters/i })).not.toBeInTheDocument();
        });

        it('should call resetFilters when Reset Filters button is clicked', async () => {
            // Arrange - use ownershipFilter to trigger active filters state
            const user = userEvent.setup();
            mockBrowserState.ownershipFilter = 'mine';

            render(
                <TestWrapper>
                    <MediaLibraryPage />
                </TestWrapper>,
            );

            // Act
            const resetButton = screen.getByRole('button', { name: /reset filters/i });
            await user.click(resetButton);

            // Assert
            expect(mockResetFilters).toHaveBeenCalled();
        });
    });

    describe('theme support', () => {
        it('should render correctly in dark mode', () => {
            // Arrange
            const darkTheme = createTheme({ palette: { mode: 'dark' } });

            // Act
            render(
                <ThemeProvider theme={darkTheme}>
                    <MediaLibraryPage />
                </ThemeProvider>,
            );

            // Assert
            expect(screen.getByText((_, element) => element?.getAttribute('data-mock') === 'AssetBrowserLayout')).toBeInTheDocument();
        });

        it('should render correctly in light mode', () => {
            // Arrange
            const lightTheme = createTheme({ palette: { mode: 'light' } });

            // Act
            render(
                <ThemeProvider theme={lightTheme}>
                    <MediaLibraryPage />
                </ThemeProvider>,
            );

            // Assert
            expect(screen.getByText((_, element) => element?.getAttribute('data-mock') === 'AssetBrowserLayout')).toBeInTheDocument();
        });
    });
});
