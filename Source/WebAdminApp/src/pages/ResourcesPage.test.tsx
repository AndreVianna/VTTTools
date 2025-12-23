/**
 * ResourcesPage Component Tests
 * Tests resource management, filtering, pagination, and action callbacks
 * Coverage: Resource review workflow scenarios
 *
 * NOTE: These tests may encounter "EMFILE: too many open files" on Windows
 * due to MUI icons-material loading. This is a known issue with MUI + Vitest on Windows.
 * Solutions:
 * 1. Increase system file handle limit (ulimit -n 4096 on Unix, or registry on Windows)
 * 2. Run tests in WSL/Linux environment
 * 3. Use --no-threads flag: npm test -- --no-threads
 *
 * Test Coverage:
 * - Page rendering (title, buttons, filters)
 * - Loading states (spinner, disabled buttons)
 * - Error handling (API failures, error alerts)
 * - Resource display (grid rendering, counts)
 * - Filter controls (search, dropdowns, enter key)
 * - Search functionality (API calls with parameters)
 * - Pagination (display, page changes, skip values)
 * - Refresh functionality
 * - Approve/Regenerate/Reject callbacks with success/error handling
 * - Snackbar notifications
 * - Individual resource loading states
 */

import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { describe, it, expect, beforeEach, vi } from 'vitest';
import { ResourcesPage } from './ResourcesPage';
import { resourcesAdminService } from '@/services/resourcesAdminService';
import type { ResourceInfo, ResourceListResponse } from '@/types/resourcesAdmin';
import { AssetKind } from '@/types/jobs';

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
    const ResourceReviewGrid = ({ resources, onApprove, onRegenerate, onReject, onApproveAll, isLoading, loadingResourceIds }: {
        resources: any[];
        onApprove: (r: any) => void;
        onRegenerate: (r: any) => void;
        onReject: (r: any) => void;
        onApproveAll: () => void;
        isLoading: boolean;
        loadingResourceIds: Set<string>;
    }) => (
        <div data-testid="resource-review-grid">
            <div>Resources count: {resources.length}</div>
            <div>Loading: {isLoading ? 'yes' : 'no'}</div>
            <div>Loading IDs: {Array.from(loadingResourceIds).join(',')}</div>
            {resources.map((r) => (
                <div key={r.resourceId} data-testid={`resource-${r.resourceId}`}>
                    <span>{r.assetName}</span>
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
            role: 'Token',
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

        it('should render filter controls', async () => {
            // Arrange & Act
            render(<ResourcesPage />);

            // Assert
            await waitFor(() => {
                expect(screen.getByLabelText(/search/i)).toBeInTheDocument();
                expect(screen.getByLabelText(/resource type/i)).toBeInTheDocument();
                expect(screen.getByLabelText(/kind/i)).toBeInTheDocument();
                expect(screen.getByRole('button', { name: /search/i })).toBeInTheDocument();
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

        it('should not display error initially', () => {
            // Arrange & Act
            render(<ResourcesPage />);

            // Assert
            expect(screen.queryByRole('alert')).not.toBeInTheDocument();
        });
    });

    describe('Resources display', () => {
        it('should render ResourceReviewGrid when resources are loaded', async () => {
            // Arrange & Act
            render(<ResourcesPage />);

            // Assert
            await waitFor(() => {
                expect(screen.getByTestId('resource-review-grid')).toBeInTheDocument();
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

        it('should display resource count and pending count', async () => {
            // Arrange & Act
            render(<ResourcesPage />);

            // Assert
            await waitFor(() => {
                expect(screen.getByText('3 resources found (3 pending review)')).toBeInTheDocument();
            });
        });
    });

    describe('Filter controls', () => {
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

        it('should update resource type when selecting from dropdown', async () => {
            // Arrange
            const user = userEvent.setup();
            render(<ResourcesPage />);

            await waitFor(() => {
                expect(screen.getByLabelText(/resource type/i)).toBeInTheDocument();
            });

            // Act
            const roleSelect = screen.getByLabelText(/resource type/i);
            await user.click(roleSelect);
            await user.click(screen.getByRole('option', { name: 'Portrait' }));

            // Assert
            expect(roleSelect).toHaveTextContent('Portrait');
        });

        it('should update kind when selecting from dropdown', async () => {
            // Arrange
            const user = userEvent.setup();
            render(<ResourcesPage />);

            await waitFor(() => {
                expect(screen.getByLabelText(/kind/i)).toBeInTheDocument();
            });

            // Act
            const kindSelect = screen.getByLabelText(/kind/i);
            await user.click(kindSelect);
            await user.click(screen.getByRole('option', { name: 'Character' }));

            // Assert
            expect(kindSelect).toHaveTextContent('Character');
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
            await user.type(searchInput, 'knight{Enter}');

            // Assert
            await waitFor(() => {
                expect(resourcesAdminService.listUnpublished).toHaveBeenCalledWith({
                    take: 50,
                    skip: 0,
                    searchText: 'knight',
                });
            });
        });
    });

    describe('Search functionality', () => {
        it('should call API with search filters when search button is clicked', async () => {
            // Arrange
            const user = userEvent.setup();
            render(<ResourcesPage />);

            await waitFor(() => {
                expect(screen.getByLabelText(/search/i)).toBeInTheDocument();
            });

            vi.clearAllMocks();

            // Act
            await user.type(screen.getByLabelText(/search/i), 'dragon');
            await user.click(screen.getByRole('button', { name: /search/i }));

            // Assert
            await waitFor(() => {
                expect(resourcesAdminService.listUnpublished).toHaveBeenCalledWith({
                    take: 50,
                    skip: 0,
                    searchText: 'dragon',
                });
            });
        });

        it('should call API with all filter parameters', async () => {
            // Arrange
            const user = userEvent.setup();
            render(<ResourcesPage />);

            await waitFor(() => {
                expect(screen.getByLabelText(/search/i)).toBeInTheDocument();
            });

            vi.clearAllMocks();

            // Act
            await user.type(screen.getByLabelText(/search/i), 'warrior');
            await user.click(screen.getByLabelText(/resource type/i));
            await user.click(screen.getByRole('option', { name: 'Portrait' }));
            await user.click(screen.getByLabelText(/kind/i));
            await user.click(screen.getByRole('option', { name: 'Character' }));
            await user.click(screen.getByRole('button', { name: /search/i }));

            // Assert
            await waitFor(() => {
                expect(resourcesAdminService.listUnpublished).toHaveBeenCalledWith({
                    take: 50,
                    skip: 0,
                    searchText: 'warrior',
                    role: 'Portrait',
                    contentKind: 'Character',
                });
            });
        });

        it('should reset skip to 0 when searching', async () => {
            // Arrange
            const user = userEvent.setup();
            render(<ResourcesPage />);

            await waitFor(() => {
                expect(screen.getByLabelText(/search/i)).toBeInTheDocument();
            });

            vi.clearAllMocks();

            // Act
            await user.type(screen.getByLabelText(/search/i), 'test');
            await user.click(screen.getByRole('button', { name: /search/i }));

            // Assert
            await waitFor(() => {
                const lastCall = vi.mocked(resourcesAdminService.listUnpublished).mock.calls[0];
                expect(lastCall?.[0]?.skip).toBe(0);
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

            // Act
            const page2Button = screen.getByRole('button', { name: 'Go to page 2' });
            fireEvent.click(page2Button);

            // Assert
            await waitFor(() => {
                expect(resourcesAdminService.listUnpublished).toHaveBeenCalledWith({
                    take: 50,
                    skip: 50,
                });
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

            // Act
            const refreshButton = screen.getByRole('button', { name: /refresh/i });
            fireEvent.click(refreshButton);

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
                expect(screen.getByTestId('resource-resource-1')).toBeInTheDocument();
            });

            // Act
            const approveButton = screen.getByRole('button', { name: 'Approve resource-1' });
            fireEvent.click(approveButton);

            // Assert
            await waitFor(() => {
                expect(resourcesAdminService.approveResource).toHaveBeenCalledWith(
                    expect.objectContaining({
                        resourceId: 'resource-1',
                        assetName: 'knight-portrait',
                        generationType: 'Portrait',
                        kind: AssetKind.Character,
                        category: 'Humanoid',
                        type: 'Warrior',
                        subtype: 'Knight',
                        description: 'A brave knight',
                    })
                );
            });
        });

        it('should show success snackbar when resource is approved', async () => {
            // Arrange
            vi.mocked(resourcesAdminService.approveResource).mockResolvedValue({ assetId: 'asset-1' });

            render(<ResourcesPage />);

            await waitFor(() => {
                expect(screen.getByTestId('resource-resource-1')).toBeInTheDocument();
            });

            // Act
            const approveButton = screen.getByRole('button', { name: 'Approve resource-1' });
            fireEvent.click(approveButton);

            // Assert
            await waitFor(() => {
                expect(screen.getByText('Approved: knight-portrait (Portrait)')).toBeInTheDocument();
            });
        });

        it('should show error snackbar when approve fails', async () => {
            // Arrange
            vi.mocked(resourcesAdminService.approveResource).mockRejectedValue(new Error('API Error'));

            render(<ResourcesPage />);

            await waitFor(() => {
                expect(screen.getByTestId('resource-resource-1')).toBeInTheDocument();
            });

            // Act
            const approveButton = screen.getByRole('button', { name: 'Approve resource-1' });
            fireEvent.click(approveButton);

            // Assert
            await waitFor(() => {
                expect(screen.getByText('Failed to approve: knight-portrait')).toBeInTheDocument();
            });
        });

        it('should update resource status to approved after successful approval', async () => {
            // Arrange
            vi.mocked(resourcesAdminService.approveResource).mockResolvedValue({ assetId: 'asset-1' });

            render(<ResourcesPage />);

            await waitFor(() => {
                expect(screen.getByTestId('resource-resource-1')).toBeInTheDocument();
            });

            // Act
            const approveButton = screen.getByRole('button', { name: 'Approve resource-1' });
            fireEvent.click(approveButton);

            // Assert - Verify the resource is updated with approved status
            await waitFor(() => {
                expect(screen.getByText('2 resources found (2 pending review)')).toBeInTheDocument();
            });
        });
    });

    describe('Regenerate resource', () => {
        it('should call regenerateResource API when regenerate callback is triggered', async () => {
            // Arrange
            vi.mocked(resourcesAdminService.regenerateResource).mockResolvedValue({ resourceId: 'resource-1-new' });

            render(<ResourcesPage />);

            await waitFor(() => {
                expect(screen.getByTestId('resource-resource-2')).toBeInTheDocument();
            });

            // Act
            const regenerateButton = screen.getByRole('button', { name: 'Regenerate resource-2' });
            fireEvent.click(regenerateButton);

            // Assert
            await waitFor(() => {
                expect(resourcesAdminService.regenerateResource).toHaveBeenCalledWith(
                    expect.objectContaining({
                        resourceId: 'resource-2',
                        assetName: 'dragon-token',
                        generationType: 'Token',
                        kind: AssetKind.Creature,
                        category: 'Dragon',
                        type: 'Red Dragon',
                        description: 'A fearsome red dragon',
                    })
                );
            });
        });

        it('should show success snackbar when resource is regenerated', async () => {
            // Arrange
            vi.mocked(resourcesAdminService.regenerateResource).mockResolvedValue({ resourceId: 'resource-2-new' });

            render(<ResourcesPage />);

            await waitFor(() => {
                expect(screen.getByTestId('resource-resource-2')).toBeInTheDocument();
            });

            // Act
            const regenerateButton = screen.getByRole('button', { name: 'Regenerate resource-2' });
            fireEvent.click(regenerateButton);

            // Assert
            await waitFor(() => {
                expect(screen.getByText('Regenerated: dragon-token (Token)')).toBeInTheDocument();
            });
        });

        it('should show error snackbar when regenerate fails', async () => {
            // Arrange
            vi.mocked(resourcesAdminService.regenerateResource).mockRejectedValue(new Error('API Error'));

            render(<ResourcesPage />);

            await waitFor(() => {
                expect(screen.getByTestId('resource-resource-2')).toBeInTheDocument();
            });

            // Act
            const regenerateButton = screen.getByRole('button', { name: 'Regenerate resource-2' });
            fireEvent.click(regenerateButton);

            // Assert
            await waitFor(() => {
                expect(screen.getByText('Failed to regenerate: dragon-token')).toBeInTheDocument();
            });
        });

        it('should update resource ID after successful regeneration', async () => {
            // Arrange
            vi.mocked(resourcesAdminService.regenerateResource).mockResolvedValue({ resourceId: 'resource-2-new' });

            render(<ResourcesPage />);

            await waitFor(() => {
                expect(screen.getByTestId('resource-resource-2')).toBeInTheDocument();
            });

            // Act
            const regenerateButton = screen.getByRole('button', { name: 'Regenerate resource-2' });
            fireEvent.click(regenerateButton);

            // Assert - Verify the new resource ID is in the DOM
            await waitFor(() => {
                expect(screen.getByTestId('resource-resource-2-new')).toBeInTheDocument();
            });
        });
    });

    describe('Reject resource', () => {
        it('should call rejectResource API when reject callback is triggered', async () => {
            // Arrange
            vi.mocked(resourcesAdminService.rejectResource).mockResolvedValue();

            render(<ResourcesPage />);

            await waitFor(() => {
                expect(screen.getByTestId('resource-resource-3')).toBeInTheDocument();
            });

            // Act
            const rejectButton = screen.getByRole('button', { name: 'Reject resource-3' });
            fireEvent.click(rejectButton);

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
                expect(screen.getByTestId('resource-resource-3')).toBeInTheDocument();
            });

            // Act
            const rejectButton = screen.getByRole('button', { name: 'Reject resource-3' });
            fireEvent.click(rejectButton);

            // Assert
            await waitFor(() => {
                expect(screen.getByText('Rejected: fire-effect (Portrait)')).toBeInTheDocument();
            });
        });

        it('should show error snackbar when reject fails', async () => {
            // Arrange
            vi.mocked(resourcesAdminService.rejectResource).mockRejectedValue(new Error('API Error'));

            render(<ResourcesPage />);

            await waitFor(() => {
                expect(screen.getByTestId('resource-resource-3')).toBeInTheDocument();
            });

            // Act
            const rejectButton = screen.getByRole('button', { name: 'Reject resource-3' });
            fireEvent.click(rejectButton);

            // Assert
            await waitFor(() => {
                expect(screen.getByText('Failed to reject: fire-effect')).toBeInTheDocument();
            });
        });

        it('should update resource status to rejected after successful rejection', async () => {
            // Arrange
            vi.mocked(resourcesAdminService.rejectResource).mockResolvedValue();

            render(<ResourcesPage />);

            await waitFor(() => {
                expect(screen.getByTestId('resource-resource-3')).toBeInTheDocument();
            });

            // Act
            const rejectButton = screen.getByRole('button', { name: 'Reject resource-3' });
            fireEvent.click(rejectButton);

            // Assert - Verify the pending count decreases
            await waitFor(() => {
                expect(screen.getByText('3 resources found (2 pending review)')).toBeInTheDocument();
            });
        });
    });

    describe('Snackbar', () => {
        it('should close snackbar when close button is clicked', async () => {
            // Arrange
            vi.mocked(resourcesAdminService.approveResource).mockResolvedValue({ assetId: 'asset-1' });

            render(<ResourcesPage />);

            await waitFor(() => {
                expect(screen.getByTestId('resource-resource-1')).toBeInTheDocument();
            });

            // Act - Trigger approve to show snackbar
            const approveButton = screen.getByRole('button', { name: 'Approve resource-1' });
            fireEvent.click(approveButton);

            await waitFor(() => {
                expect(screen.getByText('Approved: knight-portrait (Portrait)')).toBeInTheDocument();
            });

            // Close the snackbar
            const closeButton = screen.getAllByRole('button', { name: /close/i })[0];
            if (closeButton) {
                fireEvent.click(closeButton);
            }

            // Assert - Snackbar should be closed
            await waitFor(() => {
                expect(screen.queryByText('Approved: knight-portrait (Portrait)')).not.toBeInTheDocument();
            }, { timeout: 1000 });
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
                expect(screen.getByTestId('resource-resource-1')).toBeInTheDocument();
            });

            // Act
            const approveButton = screen.getByRole('button', { name: 'Approve resource-1' });
            fireEvent.click(approveButton);

            // Assert - Should show loading ID
            await waitFor(() => {
                expect(screen.getByText('Loading IDs: resource-1')).toBeInTheDocument();
            });

            // Wait for completion
            await waitFor(() => {
                expect(screen.getByText('Loading IDs:')).toBeInTheDocument();
            });
        });

        it('should track loading state for individual resources during regenerate', async () => {
            // Arrange
            vi.mocked(resourcesAdminService.regenerateResource).mockImplementation(
                () => new Promise((resolve) => setTimeout(() => resolve({ resourceId: 'resource-2-new' }), 100))
            );

            render(<ResourcesPage />);

            await waitFor(() => {
                expect(screen.getByTestId('resource-resource-2')).toBeInTheDocument();
            });

            // Act
            const regenerateButton = screen.getByRole('button', { name: 'Regenerate resource-2' });
            fireEvent.click(regenerateButton);

            // Assert - Should show loading ID
            await waitFor(() => {
                expect(screen.getByText('Loading IDs: resource-2')).toBeInTheDocument();
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
                expect(screen.getByTestId('resource-resource-3')).toBeInTheDocument();
            });

            // Act
            const rejectButton = screen.getByRole('button', { name: 'Reject resource-3' });
            fireEvent.click(rejectButton);

            // Assert - Should show loading ID
            await waitFor(() => {
                expect(screen.getByText('Loading IDs: resource-3')).toBeInTheDocument();
            });

            // Wait for completion
            await waitFor(() => {
                expect(screen.getByText('Loading IDs:')).toBeInTheDocument();
            });
        });
    });
});
