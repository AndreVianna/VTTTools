/**
 * ResourcesPage Component Tests
 * Tests resource management with tab-based filtering and pagination
 *
 * Test Coverage:
 * - Page rendering (title, tabs, search)
 * - Loading states (spinner, disabled buttons)
 * - Error handling (API failures, error alerts)
 * - Resource display (grid rendering, counts)
 * - Tab navigation (switching resource types)
 * - Search functionality (API calls with parameters)
 * - Pagination (display, page changes)
 * - Refresh functionality
 * - Approve/Regenerate/Reject callbacks
 * - Snackbar notifications
 */

import { render, screen, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { describe, it, expect, beforeEach, vi } from 'vitest';
import { ResourcesPage } from './ResourcesPage';
import { resourcesAdminService } from '@/services/resourcesAdminService';
import type { ResourceInfo, ResourceListResponse } from '@/types/resourcesAdmin';

// Mock MUI icons to prevent file loading issues
vi.mock('@mui/icons-material', () => {
    const RefreshComponent = () => <span>RefreshIcon</span>;
    const SearchComponent = () => <span>SearchIcon</span>;
    return {
        Refresh: RefreshComponent,
        Search: SearchComponent,
    };
});

// Mock the ResourceReviewGrid component
vi.mock('@components/aiSupport', () => {
    interface MockResource {
        resourceId: string;
        assetName: string;
        generationType: string;
        status: string;
    }
    const ResourceReviewGrid = ({ resources, onApprove, onRegenerate, onReject, onApproveAll, isLoading, loadingResourceIds }: {
        resources: MockResource[];
        onApprove: (r: MockResource) => void;
        onRegenerate: (r: MockResource) => void;
        onReject: (r: MockResource) => void;
        onApproveAll: () => void;
        isLoading: boolean;
        loadingResourceIds: Set<string>;
    }) => (
        <div id="resource-review-grid" role="grid" aria-label="Resource review grid">
            <div>Resources count: {resources.length}</div>
            <div>Loading: {isLoading ? 'yes' : 'no'}</div>
            <div>Loading IDs: {Array.from(loadingResourceIds).join(',')}</div>
            {resources.map((r) => (
                <div key={r.resourceId} role="row" aria-label={`Resource ${r.assetName}`}>
                    <span>{r.assetName}</span>
                    <span>Status: {r.status}</span>
                    <button onClick={() => onApprove(r)}>Approve {r.resourceId}</button>
                    <button onClick={() => onRegenerate(r)}>Regenerate {r.resourceId}</button>
                    <button onClick={() => onReject(r)}>Reject {r.resourceId}</button>
                </div>
            ))}
            <button onClick={onApproveAll}>Approve All</button>
        </div>
    );

    return { ResourceReviewGrid };
});

// Mock the resourcesAdminService
vi.mock('@/services/resourcesAdminService', () => ({
    resourcesAdminService: {
        listUnpublished: vi.fn(),
        getResourceImageUrl: vi.fn((id: string) => `/api/resources/${id}`),
        approveResource: vi.fn(),
        regenerateResource: vi.fn(),
        rejectResource: vi.fn(),
    },
}));

describe('ResourcesPage', () => {
    const mockResources: ResourceInfo[] = [
        {
            id: 'resource-1',
            role: 'Portrait',
            fileName: 'knight-portrait.png',
            contentType: 'image/png',
            fileSize: 1024,
        },
        {
            id: 'resource-2',
            role: 'Portrait',
            fileName: 'dragon-token.png',
            contentType: 'image/png',
            fileSize: 2048,
        },
        {
            id: 'resource-3',
            role: 'Portrait',
            fileName: 'fire-effect.png',
            contentType: 'image/png',
            fileSize: 512,
        },
    ];

    const mockListResponse: ResourceListResponse = {
        items: mockResources,
        totalCount: 3,
        skip: 0,
        take: 50,
    };

    beforeEach(() => {
        vi.clearAllMocks();
        // Default mock: return data for Portrait tab (the default tab)
        vi.mocked(resourcesAdminService.listUnpublished).mockResolvedValue(mockListResponse);
    });

    describe('Rendering', () => {
        it('should render page title "Resource Review"', async () => {
            // Arrange & Act
            render(<ResourcesPage />);

            // Assert
            await waitFor(() => {
                expect(screen.getByText('Resource Review')).toBeInTheDocument();
            });
        });

        it('should render refresh button', async () => {
            // Arrange & Act
            render(<ResourcesPage />);

            // Assert
            await waitFor(() => {
                const refreshButton = screen.getByRole('button', { name: /refresh/i });
                expect(refreshButton).toBeInTheDocument();
            });
        });

        it('should render resource type tabs', async () => {
            // Arrange & Act
            render(<ResourcesPage />);

            // Assert
            await waitFor(() => {
                expect(screen.getByRole('tab', { name: /portraits/i })).toBeInTheDocument();
                expect(screen.getByRole('tab', { name: /tokens/i })).toBeInTheDocument();
                expect(screen.getByRole('tab', { name: /backgrounds/i })).toBeInTheDocument();
            });
        });

        it('should render search field', async () => {
            // Arrange & Act
            render(<ResourcesPage />);

            // Assert
            await waitFor(() => {
                expect(screen.getByLabelText(/search/i)).toBeInTheDocument();
                expect(screen.getByRole('button', { name: /search/i })).toBeInTheDocument();
            });
        });

        it('should select Portraits tab by default', async () => {
            // Arrange & Act
            render(<ResourcesPage />);

            // Assert
            await waitFor(() => {
                const portraitTab = screen.getByRole('tab', { name: /portraits/i });
                expect(portraitTab).toHaveAttribute('aria-selected', 'true');
            });
        });
    });

    describe('Loading state', () => {
        it('should show loading spinner when fetching resources', async () => {
            // Arrange
            vi.mocked(resourcesAdminService.listUnpublished).mockImplementation(
                () => new Promise((resolve) => setTimeout(() => resolve(mockListResponse), 100))
            );

            // Act
            render(<ResourcesPage />);

            // Assert - Should show loading
            expect(screen.getByRole('progressbar')).toBeInTheDocument();

            // Wait for loading to complete
            await waitFor(() => {
                expect(screen.queryByRole('progressbar')).not.toBeInTheDocument();
            });
        });

        it('should disable refresh button while loading', async () => {
            // Arrange
            vi.mocked(resourcesAdminService.listUnpublished).mockImplementation(
                () => new Promise((resolve) => setTimeout(() => resolve(mockListResponse), 100))
            );

            // Act
            render(<ResourcesPage />);

            // Assert
            const refreshButton = screen.getByRole('button', { name: /refresh/i });
            expect(refreshButton).toBeDisabled();

            await waitFor(() => {
                expect(refreshButton).not.toBeDisabled();
            });
        });

        it('should disable search button while loading', async () => {
            // Arrange
            vi.mocked(resourcesAdminService.listUnpublished).mockImplementation(
                () => new Promise((resolve) => setTimeout(() => resolve(mockListResponse), 100))
            );

            // Act
            render(<ResourcesPage />);

            // Assert
            const searchButton = screen.getByRole('button', { name: /search/i });
            expect(searchButton).toBeDisabled();

            await waitFor(() => {
                expect(searchButton).not.toBeDisabled();
            });
        });
    });

    describe('Error handling', () => {
        it('should display error alert when API fails', async () => {
            // Arrange
            vi.mocked(resourcesAdminService.listUnpublished).mockRejectedValue(new Error('API Error'));

            // Act
            render(<ResourcesPage />);

            // Assert
            await waitFor(() => {
                expect(screen.getByText('Failed to load resources')).toBeInTheDocument();
            });
        });
    });

    describe('Resources display', () => {
        it('should render ResourceReviewGrid when resources are loaded', async () => {
            // Arrange & Act
            render(<ResourcesPage />);

            // Assert
            await waitFor(() => {
                expect(screen.getByRole('grid', { name: /resource review grid/i })).toBeInTheDocument();
            });
        });

        it('should pass resources to ResourceReviewGrid', async () => {
            // Arrange & Act
            render(<ResourcesPage />);

            // Assert
            await waitFor(() => {
                expect(screen.getByText('Resources count: 3')).toBeInTheDocument();
            });
        });

        it('should display resource count with pending count', async () => {
            // Arrange & Act
            render(<ResourcesPage />);

            // Assert
            await waitFor(() => {
                // The component shows "3 portraits found (3 pending review)"
                expect(screen.getByText(/3 portraits found \(3 pending review\)/i)).toBeInTheDocument();
            });
        });
    });

    describe('Tab navigation', () => {
        it('should switch to Tokens tab when clicked', async () => {
            // Arrange
            const user = userEvent.setup();
            render(<ResourcesPage />);

            await waitFor(() => {
                expect(screen.getByRole('tab', { name: /tokens/i })).toBeInTheDocument();
            });

            vi.clearAllMocks();

            // Act
            await user.click(screen.getByRole('tab', { name: /tokens/i }));

            // Assert
            await waitFor(() => {
                expect(resourcesAdminService.listUnpublished).toHaveBeenCalledWith(
                    expect.objectContaining({ role: 'Token' })
                );
            });
        });

        it('should reset skip to 0 when switching tabs', async () => {
            // Arrange
            const user = userEvent.setup();
            render(<ResourcesPage />);

            await waitFor(() => {
                expect(screen.getByRole('tab', { name: /backgrounds/i })).toBeInTheDocument();
            });

            vi.clearAllMocks();

            // Act
            await user.click(screen.getByRole('tab', { name: /backgrounds/i }));

            // Assert
            await waitFor(() => {
                expect(resourcesAdminService.listUnpublished).toHaveBeenCalledWith(
                    expect.objectContaining({ skip: 0 })
                );
            });
        });
    });

    describe('Search functionality', () => {
        it('should update search text when typing in search field', async () => {
            // Arrange
            const user = userEvent.setup();
            render(<ResourcesPage />);

            await waitFor(() => {
                expect(screen.getByLabelText(/search/i)).toBeInTheDocument();
            });

            // Act
            const searchInput = screen.getByLabelText(/search/i);
            await user.clear(searchInput);
            await user.type(searchInput, 'dragon');

            // Assert
            expect(searchInput).toHaveValue('dragon');
        });

        it('should call API with search text when search button is clicked', async () => {
            // Arrange
            const user = userEvent.setup();
            render(<ResourcesPage />);

            await waitFor(() => {
                expect(screen.getByLabelText(/search/i)).toBeInTheDocument();
            });

            vi.clearAllMocks();

            // Act
            await user.type(screen.getByLabelText(/search/i), 'knight');
            await user.click(screen.getByRole('button', { name: /search/i }));

            // Assert
            await waitFor(() => {
                expect(resourcesAdminService.listUnpublished).toHaveBeenCalledWith(
                    expect.objectContaining({ searchText: 'knight' })
                );
            });
        });

        it('should trigger search on Enter key in search field', async () => {
            // Arrange
            const user = userEvent.setup();
            render(<ResourcesPage />);

            await waitFor(() => {
                expect(screen.getByLabelText(/search/i)).toBeInTheDocument();
            });

            vi.clearAllMocks();

            // Act
            const searchInput = screen.getByLabelText(/search/i);
            await user.type(searchInput, 'wizard{Enter}');

            // Assert
            await waitFor(() => {
                expect(resourcesAdminService.listUnpublished).toHaveBeenCalledWith(
                    expect.objectContaining({ searchText: 'wizard' })
                );
            });
        });
    });

    describe('Pagination', () => {
        it('should display pagination when there are multiple pages', async () => {
            // Arrange
            vi.mocked(resourcesAdminService.listUnpublished).mockResolvedValue({
                items: mockResources,
                totalCount: 150,
                skip: 0,
                take: 50,
            });

            // Act
            render(<ResourcesPage />);

            // Assert
            await waitFor(() => {
                expect(screen.getByRole('navigation')).toBeInTheDocument();
            });
        });

        it('should not display pagination when there is only one page', async () => {
            // Arrange
            vi.mocked(resourcesAdminService.listUnpublished).mockResolvedValue({
                items: mockResources,
                totalCount: 3,
                skip: 0,
                take: 50,
            });

            // Act
            render(<ResourcesPage />);

            // Assert
            await waitFor(() => {
                expect(screen.queryByRole('navigation')).not.toBeInTheDocument();
            });
        });

        it('should call API with correct skip value when page changes', async () => {
            // Arrange
            vi.mocked(resourcesAdminService.listUnpublished).mockResolvedValue({
                items: mockResources,
                totalCount: 150,
                skip: 0,
                take: 50,
            });

            render(<ResourcesPage />);

            await waitFor(() => {
                expect(screen.getByRole('navigation')).toBeInTheDocument();
            });

            vi.clearAllMocks();
            const user = userEvent.setup();

            // Act
            const page2Button = screen.getByRole('button', { name: 'Go to page 2' });
            await user.click(page2Button);

            // Assert
            await waitFor(() => {
                expect(resourcesAdminService.listUnpublished).toHaveBeenCalledWith(
                    expect.objectContaining({ skip: 50 })
                );
            });
        });
    });

    describe('Refresh functionality', () => {
        it('should reload resources when refresh button is clicked', async () => {
            // Arrange
            render(<ResourcesPage />);

            await waitFor(() => {
                expect(screen.getByRole('button', { name: /refresh/i })).toBeInTheDocument();
            });

            vi.clearAllMocks();
            const user = userEvent.setup();

            // Act
            const refreshButton = screen.getByRole('button', { name: /refresh/i });
            await user.click(refreshButton);

            // Assert
            await waitFor(() => {
                expect(resourcesAdminService.listUnpublished).toHaveBeenCalled();
            });
        });
    });

    describe('Approve resource', () => {
        it('should call approveResource API when approve callback is triggered', async () => {
            // Arrange
            vi.mocked(resourcesAdminService.approveResource).mockResolvedValue({ assetId: 'asset-1' });

            render(<ResourcesPage />);

            await waitFor(() => {
                expect(screen.getByRole('row', { name: /knight-portrait/i })).toBeInTheDocument();
            });

            const user = userEvent.setup();

            // Act
            const approveButton = screen.getByRole('button', { name: 'Approve resource-1' });
            await user.click(approveButton);

            // Assert
            await waitFor(() => {
                expect(resourcesAdminService.approveResource).toHaveBeenCalledWith(
                    expect.objectContaining({
                        resourceId: 'resource-1',
                    })
                );
            });
        });

        it('should show success snackbar when resource is approved', async () => {
            // Arrange
            vi.mocked(resourcesAdminService.approveResource).mockResolvedValue({ assetId: 'asset-1' });

            render(<ResourcesPage />);

            await waitFor(() => {
                expect(screen.getByRole('row', { name: /knight-portrait/i })).toBeInTheDocument();
            });

            const user = userEvent.setup();

            // Act
            const approveButton = screen.getByRole('button', { name: 'Approve resource-1' });
            await user.click(approveButton);

            // Assert
            await waitFor(() => {
                expect(screen.getByText(/approved: knight-portrait/i)).toBeInTheDocument();
            });
        });

        it('should show error snackbar when approve fails', async () => {
            // Arrange
            vi.mocked(resourcesAdminService.approveResource).mockRejectedValue(new Error('API Error'));

            render(<ResourcesPage />);

            await waitFor(() => {
                expect(screen.getByRole('row', { name: /knight-portrait/i })).toBeInTheDocument();
            });

            const user = userEvent.setup();

            // Act
            const approveButton = screen.getByRole('button', { name: 'Approve resource-1' });
            await user.click(approveButton);

            // Assert
            await waitFor(() => {
                expect(screen.getByText(/failed to approve knight-portrait/i)).toBeInTheDocument();
            });
        });
    });

    describe('Regenerate resource', () => {
        it('should call regenerateResource API when regenerate callback is triggered', async () => {
            // Arrange
            vi.mocked(resourcesAdminService.regenerateResource).mockResolvedValue({ resourceId: 'resource-2-new' });

            render(<ResourcesPage />);

            await waitFor(() => {
                expect(screen.getByRole('row', { name: /dragon-token/i })).toBeInTheDocument();
            });

            const user = userEvent.setup();

            // Act
            const regenerateButton = screen.getByRole('button', { name: 'Regenerate resource-2' });
            await user.click(regenerateButton);

            // Assert
            await waitFor(() => {
                expect(resourcesAdminService.regenerateResource).toHaveBeenCalledWith(
                    expect.objectContaining({
                        resourceId: 'resource-2',
                    })
                );
            });
        });

        it('should show success snackbar when resource is regenerated', async () => {
            // Arrange
            vi.mocked(resourcesAdminService.regenerateResource).mockResolvedValue({ resourceId: 'resource-2-new' });

            render(<ResourcesPage />);

            await waitFor(() => {
                expect(screen.getByRole('row', { name: /dragon-token/i })).toBeInTheDocument();
            });

            const user = userEvent.setup();

            // Act
            const regenerateButton = screen.getByRole('button', { name: 'Regenerate resource-2' });
            await user.click(regenerateButton);

            // Assert
            await waitFor(() => {
                expect(screen.getByText(/regenerated: dragon-token/i)).toBeInTheDocument();
            });
        });

        it('should show error snackbar when regenerate fails', async () => {
            // Arrange
            vi.mocked(resourcesAdminService.regenerateResource).mockRejectedValue(new Error('API Error'));

            render(<ResourcesPage />);

            await waitFor(() => {
                expect(screen.getByRole('row', { name: /dragon-token/i })).toBeInTheDocument();
            });

            const user = userEvent.setup();

            // Act
            const regenerateButton = screen.getByRole('button', { name: 'Regenerate resource-2' });
            await user.click(regenerateButton);

            // Assert
            await waitFor(() => {
                expect(screen.getByText(/failed to regenerate dragon-token/i)).toBeInTheDocument();
            });
        });
    });

    describe('Reject resource', () => {
        it('should call rejectResource API when reject callback is triggered', async () => {
            // Arrange
            vi.mocked(resourcesAdminService.rejectResource).mockResolvedValue();

            render(<ResourcesPage />);

            await waitFor(() => {
                expect(screen.getByRole('row', { name: /fire-effect/i })).toBeInTheDocument();
            });

            const user = userEvent.setup();

            // Act
            const rejectButton = screen.getByRole('button', { name: 'Reject resource-3' });
            await user.click(rejectButton);

            // Assert
            await waitFor(() => {
                expect(resourcesAdminService.rejectResource).toHaveBeenCalledWith('resource-3');
            });
        });

        it('should show success snackbar when resource is rejected', async () => {
            // Arrange
            vi.mocked(resourcesAdminService.rejectResource).mockResolvedValue();

            render(<ResourcesPage />);

            await waitFor(() => {
                expect(screen.getByRole('row', { name: /fire-effect/i })).toBeInTheDocument();
            });

            const user = userEvent.setup();

            // Act
            const rejectButton = screen.getByRole('button', { name: 'Reject resource-3' });
            await user.click(rejectButton);

            // Assert
            await waitFor(() => {
                expect(screen.getByText(/rejected: fire-effect/i)).toBeInTheDocument();
            });
        });

        it('should show error snackbar when reject fails', async () => {
            // Arrange
            vi.mocked(resourcesAdminService.rejectResource).mockRejectedValue(new Error('API Error'));

            render(<ResourcesPage />);

            await waitFor(() => {
                expect(screen.getByRole('row', { name: /fire-effect/i })).toBeInTheDocument();
            });

            const user = userEvent.setup();

            // Act
            const rejectButton = screen.getByRole('button', { name: 'Reject resource-3' });
            await user.click(rejectButton);

            // Assert
            await waitFor(() => {
                expect(screen.getByText(/failed to reject fire-effect/i)).toBeInTheDocument();
            });
        });

        it('should remove resource from list after successful rejection', async () => {
            // Arrange
            vi.mocked(resourcesAdminService.rejectResource).mockResolvedValue();

            render(<ResourcesPage />);

            await waitFor(() => {
                expect(screen.getByRole('row', { name: /fire-effect/i })).toBeInTheDocument();
            });

            const user = userEvent.setup();

            // Act
            const rejectButton = screen.getByRole('button', { name: 'Reject resource-3' });
            await user.click(rejectButton);

            // Assert - Resource should be removed from the list
            await waitFor(() => {
                expect(screen.queryByRole('row', { name: /fire-effect/i })).not.toBeInTheDocument();
            });
        });
    });

    describe('Loading resource states', () => {
        it('should track loading state for individual resources during approve', async () => {
            // Arrange
            vi.mocked(resourcesAdminService.approveResource).mockImplementation(
                () => new Promise((resolve) => setTimeout(() => resolve({ assetId: 'asset-1' }), 100))
            );

            render(<ResourcesPage />);

            await waitFor(() => {
                expect(screen.getByRole('row', { name: /knight-portrait/i })).toBeInTheDocument();
            });

            const user = userEvent.setup();

            // Act
            const approveButton = screen.getByRole('button', { name: 'Approve resource-1' });
            await user.click(approveButton);

            // Assert - Should show loading ID
            await waitFor(() => {
                expect(screen.getByText('Loading IDs: resource-1')).toBeInTheDocument();
            });

            // Wait for completion
            await waitFor(() => {
                expect(screen.getByText('Loading IDs:')).toBeInTheDocument();
            });
        });

        it('should track loading state for individual resources during reject', async () => {
            // Arrange
            vi.mocked(resourcesAdminService.rejectResource).mockImplementation(
                () => new Promise((resolve) => setTimeout(() => resolve(), 100))
            );

            render(<ResourcesPage />);

            await waitFor(() => {
                expect(screen.getByRole('row', { name: /fire-effect/i })).toBeInTheDocument();
            });

            const user = userEvent.setup();

            // Act
            const rejectButton = screen.getByRole('button', { name: 'Reject resource-3' });
            await user.click(rejectButton);

            // Assert - Should show loading ID
            await waitFor(() => {
                expect(screen.getByText('Loading IDs: resource-3')).toBeInTheDocument();
            });
        });
    });
});
