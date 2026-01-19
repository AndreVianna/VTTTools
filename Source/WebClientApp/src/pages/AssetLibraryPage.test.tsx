/**
 * AssetLibraryPage Component Tests
 * Tests the asset browser page with its 3-panel layout, filtering, and CRUD operations
 * Coverage: Asset library browsing, filtering, navigation, and state management
 */

import { createTheme, ThemeProvider } from '@mui/material/styles';
import { render, screen, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import type * as React from 'react';
import { beforeEach, describe, expect, it, vi } from 'vitest';
import type { Asset, AssetClassification } from '@/types/domain';
import { AssetKind, SizeName } from '@/types/domain';
import { AssetLibraryPage } from './AssetLibraryPage';

// Mock react-router-dom
const mockNavigate = vi.fn();
vi.mock('react-router-dom', () => ({
    useNavigate: () => mockNavigate,
}));

// Mock useAssetBrowser hook
const mockBrowser = {
    selectedPath: [] as string[],
    searchQuery: '',
    attributeFilters: {} as Record<string, [number, number]>,
    tagFilters: [] as string[],
    letterFilter: null as string | null,
    ownershipFilter: 'all' as const,
    statusFilter: 'all' as const,
    viewMode: 'grid-large' as const,
    sortField: 'name' as const,
    sortDirection: 'asc' as const,
    selectedAssetId: null as string | null,
    selectedAssetIds: [] as string[],
    expandedTreeNodes: [] as string[],
    inspectorOpen: false,
    isMultiSelectMode: false,
    queryParams: {},
    setSelectedPath: vi.fn(),
    setSearchQuery: vi.fn(),
    setAttributeFilter: vi.fn(),
    setTagFilters: vi.fn(),
    setLetterFilter: vi.fn(),
    setOwnershipFilter: vi.fn(),
    setStatusFilter: vi.fn(),
    setViewMode: vi.fn(),
    setSort: vi.fn(),
    setSelectedAssetId: vi.fn(),
    setSelectedAssetIds: vi.fn(),
    toggleAssetSelection: vi.fn(),
    clearSelection: vi.fn(),
    setExpandedTreeNodes: vi.fn(),
    resetFilters: vi.fn(),
    filterAssets: vi.fn((assets: Asset[]) => assets),
};

vi.mock('@/hooks/useAssetBrowser', () => ({
    useAssetBrowser: vi.fn(() => mockBrowser),
}));

// Mock useLetterFilter hook
vi.mock('@/hooks/useLetterFilter', () => ({
    useLetterFilter: vi.fn(() => ({ availableLetters: ['A', 'B', 'C'] })),
}));

// Mock RTK Query hooks
const mockDeleteAsset = vi.fn();
const mockCloneAsset = vi.fn();
const mockRefetch = vi.fn();

vi.mock('@/services/assetsApi', () => ({
    useGetAssetsQuery: vi.fn(() => ({
        data: undefined,
        isLoading: false,
        error: null,
        refetch: mockRefetch,
    })),
    useDeleteAssetMutation: vi.fn(() => [mockDeleteAsset]),
    useCloneAssetMutation: vi.fn(() => [mockCloneAsset]),
}));

// Mock browser components
vi.mock('@/components/assets/browser', () => ({
    AssetBrowserLayout: vi.fn(({ leftSidebar, mainContent, rightSidebar }) => (
        <div data-mock="AssetBrowserLayout">
            <div data-mock="leftSidebar">{leftSidebar}</div>
            <div data-mock="mainContent">{mainContent}</div>
            <div data-mock="rightSidebar">{rightSidebar}</div>
        </div>
    )),
    AssetCardCompact: vi.fn(({ asset, onClick, onDoubleClick }) => (
        <div
            data-mock="AssetCardCompact"
            onClick={() => onClick()}
            onDoubleClick={() => onDoubleClick()}
            role="listitem"
            aria-label={asset.name}
        >
            {asset.name}
        </div>
    )),
    AssetInspectorPanel: vi.fn(({ asset }) => (
        <div data-mock="AssetInspectorPanel" role="complementary" aria-label="Asset inspector">
            {asset.name}
        </div>
    )),
    AssetTableView: vi.fn(({ assets, onRowClick, onRowDoubleClick }) => (
        <div data-mock="AssetTableView" role="table">
            {assets.map((a: Asset) => (
                <div
                    key={a.id}
                    role="row"
                    onClick={() => onRowClick(a)}
                    onDoubleClick={() => onRowDoubleClick(a)}
                >
                    {a.name}
                </div>
            ))}
        </div>
    )),
    AttributeRangeSlider: vi.fn(({ label }) => (
        <div data-mock="AttributeRangeSlider" aria-label={label}>
            {label}
        </div>
    )),
    BrowserToolbar: vi.fn(() => <div data-mock="BrowserToolbar" role="toolbar" />),
    TaxonomyTree: vi.fn(() => <div data-mock="TaxonomyTree" role="tree" />),
}));

// Mock LetterFilterBar
vi.mock('@/components/common/LetterFilterBar', () => ({
    LetterFilterBar: vi.fn(() => <div data-mock="LetterFilterBar" role="navigation" aria-label="Letter filter" />),
}));

// Import mocked modules for manipulation
import { useAssetBrowser } from '@/hooks/useAssetBrowser';
import { useGetAssetsQuery } from '@/services/assetsApi';

const TestWrapper: React.FC<{ children: React.ReactNode }> = ({ children }) => {
    const theme = createTheme({ palette: { mode: 'light' } });
    return <ThemeProvider theme={theme}>{children}</ThemeProvider>;
};
TestWrapper.displayName = 'TestWrapper';

// Test data factory
const createMockAsset = (overrides: Partial<Asset> = {}): Asset => {
    const classification: AssetClassification = overrides.classification ?? {
        kind: AssetKind.Creature,
        category: 'Monster',
        type: 'Beast',
        subtype: 'Wolf',
    };
    return {
        id: overrides.id ?? 'asset-1',
        name: overrides.name ?? 'Test Asset',
        classification,
        description: overrides.description ?? 'A test asset',
        thumbnail: overrides.thumbnail ?? null,
        portrait: overrides.portrait ?? null,
        size: overrides.size ?? { name: SizeName.Medium, customWidthFeet: null, customHeightFeet: null },
        tokens: overrides.tokens ?? [],
        isPublished: overrides.isPublished ?? true,
        isPublic: overrides.isPublic ?? false,
        ownerId: overrides.ownerId ?? 'owner-1',
        tags: overrides.tags ?? [],
        statBlocks: overrides.statBlocks ?? {},
    };
};

describe('AssetLibraryPage', () => {
    beforeEach(() => {
        vi.clearAllMocks();

        // Reset mock browser state
        Object.assign(mockBrowser, {
            selectedPath: [],
            searchQuery: '',
            attributeFilters: {},
            tagFilters: [],
            letterFilter: null,
            ownershipFilter: 'all',
            statusFilter: 'all',
            viewMode: 'grid-large',
            sortField: 'name',
            sortDirection: 'asc',
            selectedAssetId: null,
            selectedAssetIds: [],
            expandedTreeNodes: [],
            inspectorOpen: false,
            isMultiSelectMode: false,
            queryParams: {},
        });

        // Reset useAssetBrowser mock
        vi.mocked(useAssetBrowser).mockReturnValue(mockBrowser);

        // Reset useGetAssetsQuery mock with default state
        vi.mocked(useGetAssetsQuery).mockReturnValue({
            data: undefined,
            isLoading: false,
            error: null,
            refetch: mockRefetch,
        } as ReturnType<typeof useGetAssetsQuery>);
    });

    describe('rendering', () => {
        it('should render AssetBrowserLayout', () => {
            // Arrange & Act
            render(
                <TestWrapper>
                    <AssetLibraryPage />
                </TestWrapper>,
            );

            // Assert
            expect(screen.getByText('', { selector: '[data-mock="AssetBrowserLayout"]' }).closest('[data-mock="AssetBrowserLayout"]')).toBeInTheDocument();
        });

        it('should render New Asset button', () => {
            // Arrange & Act
            render(
                <TestWrapper>
                    <AssetLibraryPage />
                </TestWrapper>,
            );

            // Assert
            expect(screen.getByRole('button', { name: /new asset/i })).toBeInTheDocument();
        });

        it('should render Classification accordion', () => {
            // Arrange & Act
            render(
                <TestWrapper>
                    <AssetLibraryPage />
                </TestWrapper>,
            );

            // Assert
            expect(screen.getByText('Classification')).toBeInTheDocument();
        });

        it('should render Attributes accordion', () => {
            // Arrange & Act
            render(
                <TestWrapper>
                    <AssetLibraryPage />
                </TestWrapper>,
            );

            // Assert
            expect(screen.getByText('Attributes')).toBeInTheDocument();
        });

        it('should render Ownership accordion', () => {
            // Arrange & Act
            render(
                <TestWrapper>
                    <AssetLibraryPage />
                </TestWrapper>,
            );

            // Assert
            expect(screen.getByText('Ownership')).toBeInTheDocument();
        });

        it('should render Status accordion', () => {
            // Arrange & Act
            render(
                <TestWrapper>
                    <AssetLibraryPage />
                </TestWrapper>,
            );

            // Assert
            expect(screen.getByText('Status')).toBeInTheDocument();
        });
    });

    describe('loading state', () => {
        it('should show loading spinner when loading assets', () => {
            // Arrange
            vi.mocked(useGetAssetsQuery).mockReturnValue({
                data: undefined,
                isLoading: true,
                error: null,
                refetch: mockRefetch,
            } as ReturnType<typeof useGetAssetsQuery>);

            // Act
            render(
                <TestWrapper>
                    <AssetLibraryPage />
                </TestWrapper>,
            );

            // Assert
            expect(screen.getByRole('progressbar')).toBeInTheDocument();
        });
    });

    describe('error state', () => {
        it('should show error alert with Retry button when query fails', async () => {
            // Arrange
            const user = userEvent.setup();
            vi.mocked(useGetAssetsQuery).mockReturnValue({
                data: undefined,
                isLoading: false,
                error: { status: 500, data: 'Server error' },
                refetch: mockRefetch,
            } as unknown as ReturnType<typeof useGetAssetsQuery>);

            // Act
            render(
                <TestWrapper>
                    <AssetLibraryPage />
                </TestWrapper>,
            );

            // Assert
            expect(screen.getByRole('alert')).toBeInTheDocument();
            expect(screen.getByText(/failed to load assets/i)).toBeInTheDocument();

            const retryButton = screen.getByRole('button', { name: /retry/i });
            expect(retryButton).toBeInTheDocument();

            // Act - click retry
            await user.click(retryButton);

            // Assert
            expect(mockRefetch).toHaveBeenCalled();
        });
    });

    describe('empty state', () => {
        it('should show No assets found message when no assets and not loading', () => {
            // Arrange
            vi.mocked(useGetAssetsQuery).mockReturnValue({
                data: [],
                isLoading: false,
                error: null,
                refetch: mockRefetch,
            } as unknown as ReturnType<typeof useGetAssetsQuery>);
            mockBrowser.filterAssets = vi.fn(() => []);

            // Act
            render(
                <TestWrapper>
                    <AssetLibraryPage />
                </TestWrapper>,
            );

            // Assert
            expect(screen.getByRole('heading', { name: /no assets found/i })).toBeInTheDocument();
            expect(screen.getByText(/try adjusting your filters/i)).toBeInTheDocument();
            expect(screen.getByRole('button', { name: /create asset/i })).toBeInTheDocument();
        });

        it('should navigate to /assets/new when Create Asset is clicked in empty state', async () => {
            // Arrange
            const user = userEvent.setup();
            vi.mocked(useGetAssetsQuery).mockReturnValue({
                data: [],
                isLoading: false,
                error: null,
                refetch: mockRefetch,
            } as unknown as ReturnType<typeof useGetAssetsQuery>);
            mockBrowser.filterAssets = vi.fn(() => []);

            render(
                <TestWrapper>
                    <AssetLibraryPage />
                </TestWrapper>,
            );

            // Act
            const createButton = screen.getByRole('button', { name: /create asset/i });
            await user.click(createButton);

            // Assert
            expect(mockNavigate).toHaveBeenCalledWith('/assets/new');
        });
    });

    describe('data display', () => {
        const mockAssets = [
            createMockAsset({ id: 'asset-1', name: 'Dragon' }),
            createMockAsset({ id: 'asset-2', name: 'Goblin' }),
            createMockAsset({ id: 'asset-3', name: 'Orc' }),
        ];

        it('should render asset cards in grid view', () => {
            // Arrange
            vi.mocked(useGetAssetsQuery).mockReturnValue({
                data: mockAssets,
                isLoading: false,
                error: null,
                refetch: mockRefetch,
            } as unknown as ReturnType<typeof useGetAssetsQuery>);
            mockBrowser.filterAssets = vi.fn(() => mockAssets);
            mockBrowser.viewMode = 'grid-large';
            vi.mocked(useAssetBrowser).mockReturnValue(mockBrowser);

            // Act
            render(
                <TestWrapper>
                    <AssetLibraryPage />
                </TestWrapper>,
            );

            // Assert
            expect(screen.getByRole('listitem', { name: /dragon/i })).toBeInTheDocument();
            expect(screen.getByRole('listitem', { name: /goblin/i })).toBeInTheDocument();
            expect(screen.getByRole('listitem', { name: /orc/i })).toBeInTheDocument();
        });

        it('should render AssetTableView in table view', () => {
            // Arrange
            vi.mocked(useGetAssetsQuery).mockReturnValue({
                data: mockAssets,
                isLoading: false,
                error: null,
                refetch: mockRefetch,
            } as unknown as ReturnType<typeof useGetAssetsQuery>);
            mockBrowser.filterAssets = vi.fn(() => mockAssets);
            mockBrowser.viewMode = 'table' as 'grid-large' | 'grid-small' | 'table';
            vi.mocked(useAssetBrowser).mockReturnValue(mockBrowser);

            // Act
            render(
                <TestWrapper>
                    <AssetLibraryPage />
                </TestWrapper>,
            );

            // Assert
            expect(screen.getByRole('table')).toBeInTheDocument();
            expect(screen.getByRole('row', { name: /dragon/i })).toBeInTheDocument();
        });
    });

    describe('navigation', () => {
        it('should navigate to /assets/new on New Asset click', async () => {
            // Arrange
            const user = userEvent.setup();
            render(
                <TestWrapper>
                    <AssetLibraryPage />
                </TestWrapper>,
            );

            // Act
            const newAssetButton = screen.getByRole('button', { name: /new asset/i });
            await user.click(newAssetButton);

            // Assert
            expect(mockNavigate).toHaveBeenCalledWith('/assets/new');
        });

        it('should navigate to asset edit page on double click in grid view', async () => {
            // Arrange
            const user = userEvent.setup();
            const mockAssets = [createMockAsset({ id: 'asset-123', name: 'Test Dragon' })];
            vi.mocked(useGetAssetsQuery).mockReturnValue({
                data: mockAssets,
                isLoading: false,
                error: null,
                refetch: mockRefetch,
            } as unknown as ReturnType<typeof useGetAssetsQuery>);
            mockBrowser.filterAssets = vi.fn(() => mockAssets);
            mockBrowser.viewMode = 'grid-large';
            vi.mocked(useAssetBrowser).mockReturnValue(mockBrowser);

            render(
                <TestWrapper>
                    <AssetLibraryPage />
                </TestWrapper>,
            );

            // Act
            const assetCard = screen.getByRole('listitem', { name: /test dragon/i });
            await user.dblClick(assetCard);

            // Assert
            expect(mockNavigate).toHaveBeenCalledWith('/assets/asset-123/edit');
        });

        it('should navigate to asset edit page on double click in table view', async () => {
            // Arrange
            const user = userEvent.setup();
            const mockAssets = [createMockAsset({ id: 'asset-456', name: 'Table Dragon' })];
            vi.mocked(useGetAssetsQuery).mockReturnValue({
                data: mockAssets,
                isLoading: false,
                error: null,
                refetch: mockRefetch,
            } as unknown as ReturnType<typeof useGetAssetsQuery>);
            mockBrowser.filterAssets = vi.fn(() => mockAssets);
            mockBrowser.viewMode = 'table' as 'grid-large' | 'grid-small' | 'table';
            vi.mocked(useAssetBrowser).mockReturnValue(mockBrowser);

            render(
                <TestWrapper>
                    <AssetLibraryPage />
                </TestWrapper>,
            );

            // Act
            const assetRow = screen.getByRole('row', { name: /table dragon/i });
            await user.dblClick(assetRow);

            // Assert
            expect(mockNavigate).toHaveBeenCalledWith('/assets/asset-456/edit');
        });
    });

    describe('selection', () => {
        it('should show AssetInspectorPanel when asset is selected', () => {
            // Arrange
            const mockAssets = [createMockAsset({ id: 'selected-asset', name: 'Selected Dragon' })];
            vi.mocked(useGetAssetsQuery).mockReturnValue({
                data: mockAssets,
                isLoading: false,
                error: null,
                refetch: mockRefetch,
            } as unknown as ReturnType<typeof useGetAssetsQuery>);
            mockBrowser.filterAssets = vi.fn(() => mockAssets);
            mockBrowser.selectedAssetId = 'selected-asset';
            mockBrowser.inspectorOpen = true;
            vi.mocked(useAssetBrowser).mockReturnValue(mockBrowser);

            // Act
            render(
                <TestWrapper>
                    <AssetLibraryPage />
                </TestWrapper>,
            );

            // Assert
            const inspectorPanel = screen.getByRole('complementary', { name: /asset inspector/i });
            expect(inspectorPanel).toBeInTheDocument();
            // Verify the inspector panel contains the selected asset name
            expect(inspectorPanel).toHaveTextContent('Selected Dragon');
        });

        it('should call setSelectedAssetId when asset is clicked', async () => {
            // Arrange
            const user = userEvent.setup();
            const mockAssets = [createMockAsset({ id: 'click-asset', name: 'Clickable Dragon' })];
            vi.mocked(useGetAssetsQuery).mockReturnValue({
                data: mockAssets,
                isLoading: false,
                error: null,
                refetch: mockRefetch,
            } as unknown as ReturnType<typeof useGetAssetsQuery>);
            mockBrowser.filterAssets = vi.fn(() => mockAssets);
            vi.mocked(useAssetBrowser).mockReturnValue(mockBrowser);

            render(
                <TestWrapper>
                    <AssetLibraryPage />
                </TestWrapper>,
            );

            // Act
            const assetCard = screen.getByRole('listitem', { name: /clickable dragon/i });
            await user.click(assetCard);

            // Assert
            expect(mockBrowser.setSelectedAssetId).toHaveBeenCalledWith('click-asset');
        });
    });

    describe('filter accordions', () => {
        it('should render Mine and Others checkboxes in Ownership accordion when expanded', async () => {
            // Arrange
            const user = userEvent.setup();
            render(
                <TestWrapper>
                    <AssetLibraryPage />
                </TestWrapper>,
            );

            // Act - expand the Ownership accordion
            const ownershipButton = screen.getByRole('button', { name: /ownership/i });
            await user.click(ownershipButton);

            // Assert - checkboxes should be accessible after expansion
            await waitFor(() => {
                expect(screen.getByText('Mine')).toBeInTheDocument();
                expect(screen.getByText('Others')).toBeInTheDocument();
            });
        });

        it('should render Published and Draft checkboxes in Status accordion when expanded', async () => {
            // Arrange
            const user = userEvent.setup();
            render(
                <TestWrapper>
                    <AssetLibraryPage />
                </TestWrapper>,
            );

            // Act - expand the Status accordion
            const statusButton = screen.getByRole('button', { name: /status/i });
            await user.click(statusButton);

            // Assert - checkboxes should be accessible after expansion
            await waitFor(() => {
                expect(screen.getByText('Published')).toBeInTheDocument();
                expect(screen.getByText('Draft')).toBeInTheDocument();
            });
        });
    });

    describe('theme support', () => {
        it('should render correctly in light mode', () => {
            // Arrange & Act
            const lightTheme = createTheme({ palette: { mode: 'light' } });
            render(
                <ThemeProvider theme={lightTheme}>
                    <AssetLibraryPage />
                </ThemeProvider>,
            );

            // Assert
            expect(screen.getByRole('button', { name: /new asset/i })).toBeInTheDocument();
        });

        it('should render correctly in dark mode', () => {
            // Arrange & Act
            const darkTheme = createTheme({ palette: { mode: 'dark' } });
            render(
                <ThemeProvider theme={darkTheme}>
                    <AssetLibraryPage />
                </ThemeProvider>,
            );

            // Assert
            expect(screen.getByRole('button', { name: /new asset/i })).toBeInTheDocument();
        });
    });
});
