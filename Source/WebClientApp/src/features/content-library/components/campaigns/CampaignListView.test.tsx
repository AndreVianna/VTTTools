import { createTheme, ThemeProvider } from '@mui/material/styles';
import { render, screen, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import type React from 'react';
import { beforeEach, describe, expect, it, vi } from 'vitest';
import type { Campaign } from '@/types/domain';
import { CampaignListView } from './CampaignListView';

// Mock react-router-dom
const mockNavigate = vi.fn();
vi.mock('react-router-dom', () => ({
    useNavigate: () => mockNavigate,
}));

// Mock campaignsApi hooks
const mockUseGetCampaignsQuery = vi.fn();
const mockCreateCampaign = vi.fn();
const mockDeleteCampaign = vi.fn();
const mockCloneCampaign = vi.fn();

vi.mock('@/services/campaignsApi', () => ({
    useGetCampaignsQuery: () => mockUseGetCampaignsQuery(),
    useCreateCampaignMutation: () => [
        (data: unknown) => ({
            unwrap: () => mockCreateCampaign(data),
        }),
    ],
    useDeleteCampaignMutation: () => [
        (id: string) => ({
            unwrap: () => mockDeleteCampaign(id),
        }),
    ],
    useCloneCampaignMutation: () => [
        (data: unknown) => ({
            unwrap: () => mockCloneCampaign(data),
        }),
    ],
}));

// Mock useDebounce to return value immediately for testing
vi.mock('../../hooks', () => ({
    useDebounce: vi.fn((value: string) => value),
}));

// Mock CampaignCard
vi.mock('./CampaignCard', () => ({
    CampaignCard: vi.fn(({ campaign, onOpen, onDuplicate, onDelete }) => (
        <div data-campaign-id={campaign.id} role="article" aria-label={campaign.name}>
            <span>{campaign.name}</span>
            <button onClick={() => onOpen(campaign.id)} aria-label={`Open ${campaign.name}`}>
                Open
            </button>
            <button onClick={() => onDuplicate(campaign.id)} aria-label={`Duplicate ${campaign.name}`}>
                Duplicate
            </button>
            <button onClick={() => onDelete(campaign.id)} aria-label={`Delete ${campaign.name}`}>
                Delete
            </button>
        </div>
    )),
}));

const TestWrapper: React.FC<{ children: React.ReactNode }> = ({ children }) => {
    const theme = createTheme({ palette: { mode: 'light' } });
    return <ThemeProvider theme={theme}>{children}</ThemeProvider>;
};
TestWrapper.displayName = 'TestWrapper';

describe('CampaignListView', () => {
    const createMockCampaign = (overrides: Partial<Campaign> = {}): Campaign => ({
        id: 'campaign-1',
        ownerId: 'owner-1',
        name: 'Test Campaign',
        description: 'A test campaign',
        isPublished: false,
        isPublic: false,
        adventures: [],
        ...overrides,
    });

    const defaultQueryResult = {
        data: [],
        isLoading: false,
        error: null,
    };

    beforeEach(() => {
        vi.clearAllMocks();
        mockUseGetCampaignsQuery.mockReturnValue(defaultQueryResult);
        mockCreateCampaign.mockResolvedValue({ id: 'new-campaign-id' });
        mockDeleteCampaign.mockResolvedValue(undefined);
        mockCloneCampaign.mockResolvedValue({ id: 'cloned-campaign-id' });
    });

    describe('rendering', () => {
        it('should render title "Campaigns"', () => {
            // Arrange & Act
            render(
                <TestWrapper>
                    <CampaignListView />
                </TestWrapper>,
            );

            // Assert
            expect(screen.getByRole('heading', { name: 'Campaigns' })).toBeInTheDocument();
        });

        it('should render "New Campaign" button', () => {
            // Arrange & Act
            render(
                <TestWrapper>
                    <CampaignListView />
                </TestWrapper>,
            );

            // Assert
            expect(screen.getByRole('button', { name: /create new campaign/i })).toBeInTheDocument();
        });

        it('should render search input and status filter', () => {
            // Arrange & Act
            render(
                <TestWrapper>
                    <CampaignListView />
                </TestWrapper>,
            );

            // Assert
            const searchInput = screen.getByPlaceholderText('Search campaigns...');
            expect(searchInput).toBeInTheDocument();

            const statusFilter = screen.getByLabelText('Status');
            expect(statusFilter).toBeInTheDocument();
        });
    });

    describe('loading state', () => {
        it('should show loading message when isLoading is true', () => {
            // Arrange
            mockUseGetCampaignsQuery.mockReturnValue({
                data: [],
                isLoading: true,
                error: null,
            });

            // Act
            render(
                <TestWrapper>
                    <CampaignListView />
                </TestWrapper>,
            );

            // Assert
            expect(screen.getByText('Loading campaigns...')).toBeInTheDocument();
        });
    });

    describe('empty states', () => {
        it('should show empty state when no campaigns and no search query', () => {
            // Arrange
            mockUseGetCampaignsQuery.mockReturnValue({
                data: [],
                isLoading: false,
                error: null,
            });

            // Act
            render(
                <TestWrapper>
                    <CampaignListView />
                </TestWrapper>,
            );

            // Assert
            expect(screen.getByText('No campaigns yet')).toBeInTheDocument();
            expect(screen.getByText('Create your first campaign to get started')).toBeInTheDocument();
        });

        it('should show no results state when no campaigns but search query exists', async () => {
            // Arrange
            const user = userEvent.setup();
            mockUseGetCampaignsQuery.mockReturnValue({
                data: [],
                isLoading: false,
                error: null,
            });

            render(
                <TestWrapper>
                    <CampaignListView />
                </TestWrapper>,
            );

            // Act
            const searchInput = screen.getByPlaceholderText('Search campaigns...') as HTMLInputElement;
            await user.type(searchInput, 'nonexistent');

            // Assert
            expect(screen.getByText('No campaigns found')).toBeInTheDocument();
            expect(screen.getByText('Try adjusting your search or filters')).toBeInTheDocument();
        });
    });

    describe('data display', () => {
        it('should render CampaignCard for each campaign', () => {
            // Arrange
            const campaigns = [
                createMockCampaign({ id: 'campaign-1', name: 'Campaign One' }),
                createMockCampaign({ id: 'campaign-2', name: 'Campaign Two' }),
                createMockCampaign({ id: 'campaign-3', name: 'Campaign Three' }),
            ];
            mockUseGetCampaignsQuery.mockReturnValue({
                data: campaigns,
                isLoading: false,
                error: null,
            });

            // Act
            render(
                <TestWrapper>
                    <CampaignListView />
                </TestWrapper>,
            );

            // Assert
            expect(screen.getByText('Campaign One')).toBeInTheDocument();
            expect(screen.getByText('Campaign Two')).toBeInTheDocument();
            expect(screen.getByText('Campaign Three')).toBeInTheDocument();
        });

        it('should filter campaigns by search query', async () => {
            // Arrange
            const user = userEvent.setup();
            const campaigns = [
                createMockCampaign({ id: 'campaign-1', name: 'Dragon Campaign' }),
                createMockCampaign({ id: 'campaign-2', name: 'Wizard Adventure' }),
                createMockCampaign({ id: 'campaign-3', name: 'Dragon Quest' }),
            ];
            mockUseGetCampaignsQuery.mockReturnValue({
                data: campaigns,
                isLoading: false,
                error: null,
            });

            render(
                <TestWrapper>
                    <CampaignListView />
                </TestWrapper>,
            );

            // Act
            const searchInput = screen.getByPlaceholderText('Search campaigns...') as HTMLInputElement;
            await user.type(searchInput, 'Dragon');

            // Assert
            expect(screen.getByText('Dragon Campaign')).toBeInTheDocument();
            expect(screen.getByText('Dragon Quest')).toBeInTheDocument();
            expect(screen.queryByText('Wizard Adventure')).not.toBeInTheDocument();
        });

        it('should filter campaigns by published status', async () => {
            // Arrange
            const user = userEvent.setup();
            const campaigns = [
                createMockCampaign({ id: 'campaign-1', name: 'Published Campaign', isPublished: true }),
                createMockCampaign({ id: 'campaign-2', name: 'Draft Campaign', isPublished: false }),
            ];
            mockUseGetCampaignsQuery.mockReturnValue({
                data: campaigns,
                isLoading: false,
                error: null,
            });

            render(
                <TestWrapper>
                    <CampaignListView />
                </TestWrapper>,
            );

            // Act - Open the select and choose "Published"
            const statusFilter = screen.getByLabelText('Status');
            await user.click(statusFilter);
            const publishedOption = screen.getByRole('option', { name: 'Published' });
            await user.click(publishedOption);

            // Assert
            expect(screen.getByText('Published Campaign')).toBeInTheDocument();
            expect(screen.queryByText('Draft Campaign')).not.toBeInTheDocument();
        });
    });

    describe('create flow', () => {
        it('should call createCampaign and navigate on successful create', async () => {
            // Arrange
            const user = userEvent.setup();
            mockUseGetCampaignsQuery.mockReturnValue({
                data: [],
                isLoading: false,
                error: null,
            });
            mockCreateCampaign.mockResolvedValue({ id: 'new-campaign-123' });

            render(
                <TestWrapper>
                    <CampaignListView />
                </TestWrapper>,
            );

            // Act
            const createButton = screen.getByRole('button', { name: /create new campaign/i });
            await user.click(createButton);

            // Assert
            await waitFor(() => {
                expect(mockCreateCampaign).toHaveBeenCalledWith({
                    name: 'Untitled Campaign',
                    description: 'A new campaign.',
                });
            });
            await waitFor(() => {
                expect(mockNavigate).toHaveBeenCalledWith('/campaigns/new-campaign-123');
            });
        });

        it('should show error snackbar on create failure', async () => {
            // Arrange
            const user = userEvent.setup();
            mockUseGetCampaignsQuery.mockReturnValue({
                data: [],
                isLoading: false,
                error: null,
            });
            mockCreateCampaign.mockRejectedValue(new Error('Network error'));

            render(
                <TestWrapper>
                    <CampaignListView />
                </TestWrapper>,
            );

            // Act
            const createButton = screen.getByRole('button', { name: /create new campaign/i });
            await user.click(createButton);

            // Assert
            await waitFor(() => {
                expect(screen.getByText('Failed to create campaign. Please try again.')).toBeInTheDocument();
            });
        });
    });

    describe('delete flow', () => {
        it('should open delete dialog when delete is clicked', async () => {
            // Arrange
            const user = userEvent.setup();
            const campaigns = [createMockCampaign({ id: 'campaign-1', name: 'My Campaign' })];
            mockUseGetCampaignsQuery.mockReturnValue({
                data: campaigns,
                isLoading: false,
                error: null,
            });

            render(
                <TestWrapper>
                    <CampaignListView />
                </TestWrapper>,
            );

            // Act
            const deleteButton = screen.getByRole('button', { name: /delete my campaign/i });
            await user.click(deleteButton);

            // Assert
            expect(screen.getByRole('dialog')).toBeInTheDocument();
            expect(screen.getByText('Delete Campaign')).toBeInTheDocument();
            expect(screen.getByText(/are you sure you want to delete this campaign/i)).toBeInTheDocument();
        });

        it('should call deleteCampaign on confirm', async () => {
            // Arrange
            const user = userEvent.setup();
            const campaigns = [createMockCampaign({ id: 'campaign-to-delete', name: 'Deletable Campaign' })];
            mockUseGetCampaignsQuery.mockReturnValue({
                data: campaigns,
                isLoading: false,
                error: null,
            });

            render(
                <TestWrapper>
                    <CampaignListView />
                </TestWrapper>,
            );

            // Act - Open dialog and confirm
            const deleteButton = screen.getByRole('button', { name: /delete deletable campaign/i });
            await user.click(deleteButton);

            const confirmButton = screen.getByRole('button', { name: /^delete$/i });
            await user.click(confirmButton);

            // Assert
            await waitFor(() => {
                expect(mockDeleteCampaign).toHaveBeenCalledWith('campaign-to-delete');
            });
        });

        it('should close dialog on cancel', async () => {
            // Arrange
            const user = userEvent.setup();
            const campaigns = [createMockCampaign({ id: 'campaign-1', name: 'My Campaign' })];
            mockUseGetCampaignsQuery.mockReturnValue({
                data: campaigns,
                isLoading: false,
                error: null,
            });

            render(
                <TestWrapper>
                    <CampaignListView />
                </TestWrapper>,
            );

            // Act - Open dialog and cancel
            const deleteButton = screen.getByRole('button', { name: /delete my campaign/i });
            await user.click(deleteButton);

            const cancelButton = screen.getByRole('button', { name: /cancel/i });
            await user.click(cancelButton);

            // Assert
            await waitFor(() => {
                expect(screen.queryByRole('dialog')).not.toBeInTheDocument();
            });
            expect(mockDeleteCampaign).not.toHaveBeenCalled();
        });
    });

    describe('duplicate flow', () => {
        it('should call cloneCampaign on duplicate', async () => {
            // Arrange
            const user = userEvent.setup();
            const campaigns = [createMockCampaign({ id: 'campaign-to-clone', name: 'Clonable Campaign' })];
            mockUseGetCampaignsQuery.mockReturnValue({
                data: campaigns,
                isLoading: false,
                error: null,
            });

            render(
                <TestWrapper>
                    <CampaignListView />
                </TestWrapper>,
            );

            // Act
            const duplicateButton = screen.getByRole('button', { name: /duplicate clonable campaign/i });
            await user.click(duplicateButton);

            // Assert
            await waitFor(() => {
                expect(mockCloneCampaign).toHaveBeenCalledWith({ id: 'campaign-to-clone' });
            });
        });

        it('should show success snackbar on successful duplicate', async () => {
            // Arrange
            const user = userEvent.setup();
            const campaigns = [createMockCampaign({ id: 'campaign-to-clone', name: 'Clonable Campaign' })];
            mockUseGetCampaignsQuery.mockReturnValue({
                data: campaigns,
                isLoading: false,
                error: null,
            });
            mockCloneCampaign.mockResolvedValue({ id: 'cloned-id' });

            render(
                <TestWrapper>
                    <CampaignListView />
                </TestWrapper>,
            );

            // Act
            const duplicateButton = screen.getByRole('button', { name: /duplicate clonable campaign/i });
            await user.click(duplicateButton);

            // Assert
            await waitFor(() => {
                expect(screen.getByText('Campaign duplicated successfully')).toBeInTheDocument();
            });
        });

        it('should show error snackbar on duplicate failure', async () => {
            // Arrange
            const user = userEvent.setup();
            const campaigns = [createMockCampaign({ id: 'campaign-to-clone', name: 'Clonable Campaign' })];
            mockUseGetCampaignsQuery.mockReturnValue({
                data: campaigns,
                isLoading: false,
                error: null,
            });
            mockCloneCampaign.mockRejectedValue(new Error('Clone failed'));

            render(
                <TestWrapper>
                    <CampaignListView />
                </TestWrapper>,
            );

            // Act
            const duplicateButton = screen.getByRole('button', { name: /duplicate clonable campaign/i });
            await user.click(duplicateButton);

            // Assert
            await waitFor(() => {
                expect(screen.getByText('Failed to duplicate campaign. Please try again.')).toBeInTheDocument();
            });
        });
    });

    describe('navigation', () => {
        it('should navigate to campaign detail on card open', async () => {
            // Arrange
            const user = userEvent.setup();
            const campaigns = [createMockCampaign({ id: 'campaign-abc', name: 'Navigable Campaign' })];
            mockUseGetCampaignsQuery.mockReturnValue({
                data: campaigns,
                isLoading: false,
                error: null,
            });

            render(
                <TestWrapper>
                    <CampaignListView />
                </TestWrapper>,
            );

            // Act
            const openButton = screen.getByRole('button', { name: /open navigable campaign/i });
            await user.click(openButton);

            // Assert
            expect(mockNavigate).toHaveBeenCalledWith('/campaigns/campaign-abc');
        });
    });

    describe('error handling', () => {
        it('should show error alert when query fails', () => {
            // Arrange
            mockUseGetCampaignsQuery.mockReturnValue({
                data: [],
                isLoading: false,
                error: { status: 500, data: 'Server error' },
            });

            // Act
            render(
                <TestWrapper>
                    <CampaignListView />
                </TestWrapper>,
            );

            // Assert
            expect(screen.getByRole('alert')).toBeInTheDocument();
            expect(screen.getByText('Failed to load campaigns. Please try again.')).toBeInTheDocument();
        });
    });

    describe('filter by draft status', () => {
        it('should filter campaigns by draft status', async () => {
            // Arrange
            const user = userEvent.setup();
            const campaigns = [
                createMockCampaign({ id: 'campaign-1', name: 'Published Campaign', isPublished: true }),
                createMockCampaign({ id: 'campaign-2', name: 'Draft Campaign', isPublished: false }),
            ];
            mockUseGetCampaignsQuery.mockReturnValue({
                data: campaigns,
                isLoading: false,
                error: null,
            });

            render(
                <TestWrapper>
                    <CampaignListView />
                </TestWrapper>,
            );

            // Act - Open the select and choose "Draft"
            const statusFilter = screen.getByLabelText('Status');
            await user.click(statusFilter);
            const draftOption = screen.getByRole('option', { name: 'Draft' });
            await user.click(draftOption);

            // Assert
            expect(screen.queryByText('Published Campaign')).not.toBeInTheDocument();
            expect(screen.getByText('Draft Campaign')).toBeInTheDocument();
        });
    });
});
