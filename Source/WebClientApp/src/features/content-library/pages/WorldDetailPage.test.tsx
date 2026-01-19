/**
 * WorldDetailPage Component Tests
 * Tests world detail page with loading, error, and success states
 * Coverage: World editing, campaigns management, navigation, CRUD operations
 */

import { createTheme, ThemeProvider } from '@mui/material/styles';
import { fireEvent, render, screen, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import type * as React from 'react';
import { beforeEach, describe, expect, it, vi } from 'vitest';
import type { Campaign, World } from '@/types/domain';
import { WorldDetailPage } from './WorldDetailPage';

// Mock react-router-dom
const mockNavigate = vi.fn();
vi.mock('react-router-dom', () => ({
    useNavigate: () => mockNavigate,
    useParams: vi.fn(() => ({ worldId: 'world-123' })),
}));

// Mock worldsApi hooks
const mockUpdateWorld = vi.fn();
const mockCreateCampaign = vi.fn();
const mockCloneCampaign = vi.fn();
const mockRemoveCampaign = vi.fn();

vi.mock('@/services/worldsApi', () => ({
    useGetWorldQuery: vi.fn(),
    useGetCampaignsQuery: vi.fn(),
    useUpdateWorldMutation: vi.fn(() => [mockUpdateWorld]),
    useCreateCampaignMutation: vi.fn(() => [mockCreateCampaign]),
    useCloneCampaignMutation: vi.fn(() => [mockCloneCampaign]),
    useRemoveCampaignMutation: vi.fn(() => [mockRemoveCampaign, { isLoading: false }]),
}));

// Mock mediaApi hooks
const mockUploadFile = vi.fn();
vi.mock('@/services/mediaApi', () => ({
    useUploadFileMutation: vi.fn(() => [mockUploadFile, { isLoading: false }]),
}));

// Mock useAuthenticatedImageUrl hook
vi.mock('@/hooks/useAuthenticatedImageUrl', () => ({
    useAuthenticatedImageUrl: vi.fn(() => ({ blobUrl: null })),
}));

// Mock development config
vi.mock('@/config/development', () => ({
    getApiEndpoints: () => ({ media: '/api/media' }),
}));

// Mock CampaignCard component
vi.mock('../components/campaigns', () => ({
    CampaignCard: vi.fn(({ campaign, onOpen, onDuplicate, onDelete }: {
        campaign: { id: string; name: string };
        onOpen: (id: string) => void;
        onDuplicate: (id: string) => void;
        onDelete: (id: string) => void;
    }) => (
        <div data-mock="CampaignCard">
            <span>{campaign.name}</span>
            <button onClick={() => onOpen(campaign.id)}>Open</button>
            <button onClick={() => onDuplicate(campaign.id)}>Duplicate</button>
            <button onClick={() => onDelete(campaign.id)}>Delete</button>
        </div>
    )),
}));

// Mock ConfirmDialog component
vi.mock('@/components/common', () => ({
    ConfirmDialog: vi.fn(({ open, onClose, onConfirm, title, message }: {
        open: boolean;
        onClose: () => void;
        onConfirm: () => void;
        title: string;
        message: string;
    }) =>
        open ? (
            <div data-mock="ConfirmDialog">
                <span>{title}</span>
                <span>{message}</span>
                <button onClick={onClose}>Cancel</button>
                <button onClick={onConfirm}>Confirm</button>
            </div>
        ) : null,
    ),
}));

// Import mocked modules for setting return values
import { useParams } from 'react-router-dom';
import {
    useGetWorldQuery,
    useGetCampaignsQuery,
    useRemoveCampaignMutation,
} from '@/services/worldsApi';

const TestWrapper: React.FC<{ children: React.ReactNode }> = ({ children }) => {
    const theme = createTheme({ palette: { mode: 'light' } });
    return <ThemeProvider theme={theme}>{children}</ThemeProvider>;
};
TestWrapper.displayName = 'TestWrapper';

describe('WorldDetailPage', () => {
    const mockWorld: World = {
        id: 'world-123',
        ownerId: 'user-1',
        name: 'Fantasy Realm',
        description: 'A vast fantasy world filled with magic and adventure',
        isPublished: false,
        isPublic: false,
        background: null,
    };

    const mockCampaigns: Campaign[] = [
        {
            id: 'campaign-1',
            ownerId: 'user-1',
            name: 'The Dragon Wars',
            description: 'An epic campaign about dragon warfare',
            isPublished: false,
            isPublic: false,
            worldId: 'world-123',
            background: null,
        },
        {
            id: 'campaign-2',
            ownerId: 'user-1',
            name: 'Shadow Rebellion',
            description: 'A dark campaign of intrigue',
            isPublished: true,
            isPublic: false,
            worldId: 'world-123',
            background: null,
        },
    ];

    beforeEach(() => {
        vi.clearAllMocks();

        // Default mock implementations
        vi.mocked(useParams).mockReturnValue({ worldId: 'world-123' });

        vi.mocked(useGetWorldQuery).mockReturnValue({
            data: mockWorld,
            isLoading: false,
            error: null,
            refetch: vi.fn(),
        } as ReturnType<typeof useGetWorldQuery>);

        vi.mocked(useGetCampaignsQuery).mockReturnValue({
            data: mockCampaigns,
            isLoading: false,
            error: null,
            refetch: vi.fn(),
        } as ReturnType<typeof useGetCampaignsQuery>);

        vi.mocked(useRemoveCampaignMutation).mockReturnValue([
            mockRemoveCampaign,
            { isLoading: false, reset: vi.fn() },
        ] as ReturnType<typeof useRemoveCampaignMutation>);

        mockCreateCampaign.mockReturnValue({ unwrap: () => Promise.resolve({ id: 'new-campaign-id' }) });
        mockUpdateWorld.mockReturnValue({ unwrap: () => Promise.resolve({}) });
        mockCloneCampaign.mockReturnValue({ unwrap: () => Promise.resolve({}) });
        mockRemoveCampaign.mockReturnValue({ unwrap: () => Promise.resolve({}) });
    });

    describe('loading state', () => {
        it('should show loading spinner when loading world', () => {
            // Arrange
            vi.mocked(useGetWorldQuery).mockReturnValue({
                data: undefined,
                isLoading: true,
                error: null,
                refetch: vi.fn(),
            } as ReturnType<typeof useGetWorldQuery>);

            // Act
            render(
                <TestWrapper>
                    <WorldDetailPage />
                </TestWrapper>,
            );

            // Assert
            expect(screen.getByRole('progressbar')).toBeInTheDocument();
        });
    });

    describe('error state', () => {
        it('should show error alert when world fails to load', () => {
            // Arrange
            vi.mocked(useGetWorldQuery).mockReturnValue({
                data: undefined,
                isLoading: false,
                error: { status: 500, data: 'Server error' },
                refetch: vi.fn(),
            } as ReturnType<typeof useGetWorldQuery>);

            // Act
            render(
                <TestWrapper>
                    <WorldDetailPage />
                </TestWrapper>,
            );

            // Assert
            expect(screen.getByRole('alert')).toBeInTheDocument();
            expect(screen.getByText(/failed to load world/i)).toBeInTheDocument();
        });

        it('should show Back to Library button on error', () => {
            // Arrange
            vi.mocked(useGetWorldQuery).mockReturnValue({
                data: undefined,
                isLoading: false,
                error: { status: 404, data: 'Not found' },
                refetch: vi.fn(),
            } as ReturnType<typeof useGetWorldQuery>);

            // Act
            render(
                <TestWrapper>
                    <WorldDetailPage />
                </TestWrapper>,
            );

            // Assert
            const backButton = screen.getByRole('button', { name: /back to library/i });
            expect(backButton).toBeInTheDocument();
        });
    });

    describe('rendering (world loaded)', () => {
        it('should render world name input', async () => {
            // Arrange & Act
            render(
                <TestWrapper>
                    <WorldDetailPage />
                </TestWrapper>,
            );

            // Assert
            await waitFor(() => {
                const nameInput = screen.getByPlaceholderText('World Name');
                expect(nameInput).toBeInTheDocument();
            });
        });

        it('should render world description field', async () => {
            // Arrange & Act
            render(
                <TestWrapper>
                    <WorldDetailPage />
                </TestWrapper>,
            );

            // Assert
            await waitFor(() => {
                const descriptionInput = screen.getByPlaceholderText('World description...');
                expect(descriptionInput).toBeInTheDocument();
            });
        });

        it('should render Published switch', async () => {
            // Arrange & Act
            render(
                <TestWrapper>
                    <WorldDetailPage />
                </TestWrapper>,
            );

            // Assert
            await waitFor(() => {
                expect(screen.getByText('Published')).toBeInTheDocument();
                // MUI Switch renders with role="switch"
                expect(screen.getByRole('switch')).toBeInTheDocument();
            });
        });

        it('should render Add Campaign button', () => {
            // Arrange & Act
            render(
                <TestWrapper>
                    <WorldDetailPage />
                </TestWrapper>,
            );

            // Assert
            const addButton = screen.getByRole('button', { name: /add campaign/i });
            expect(addButton).toBeInTheDocument();
        });

        it('should render campaigns count heading', () => {
            // Arrange & Act
            render(
                <TestWrapper>
                    <WorldDetailPage />
                </TestWrapper>,
            );

            // Assert
            expect(screen.getByRole('heading', { name: /campaigns \(2\)/i })).toBeInTheDocument();
        });

        it('should render back button with correct aria-label', () => {
            // Arrange & Act
            render(
                <TestWrapper>
                    <WorldDetailPage />
                </TestWrapper>,
            );

            // Assert
            const backButton = screen.getByRole('button', { name: /back to library/i });
            expect(backButton).toBeInTheDocument();
        });
    });

    describe('campaigns', () => {
        it('should render CampaignCard for each campaign', () => {
            // Arrange & Act
            render(
                <TestWrapper>
                    <WorldDetailPage />
                </TestWrapper>,
            );

            // Assert
            expect(screen.getByText('The Dragon Wars')).toBeInTheDocument();
            expect(screen.getByText('Shadow Rebellion')).toBeInTheDocument();
            expect(screen.getAllByText(/open/i)).toHaveLength(2);
        });

        it('should show empty state when no campaigns', () => {
            // Arrange
            vi.mocked(useGetCampaignsQuery).mockReturnValue({
                data: [],
                isLoading: false,
                error: null,
                refetch: vi.fn(),
            } as ReturnType<typeof useGetCampaignsQuery>);

            // Act
            render(
                <TestWrapper>
                    <WorldDetailPage />
                </TestWrapper>,
            );

            // Assert
            expect(screen.getByText(/no campaigns yet/i)).toBeInTheDocument();
            expect(screen.getByText(/add your first campaign to this world/i)).toBeInTheDocument();
        });

        it('should show loading spinner when loading campaigns', () => {
            // Arrange
            vi.mocked(useGetCampaignsQuery).mockReturnValue({
                data: [],
                isLoading: true,
                error: null,
                refetch: vi.fn(),
            } as ReturnType<typeof useGetCampaignsQuery>);

            // Act
            render(
                <TestWrapper>
                    <WorldDetailPage />
                </TestWrapper>,
            );

            // Assert
            const progressIndicators = screen.getAllByRole('progressbar');
            expect(progressIndicators.length).toBeGreaterThan(0);
        });
    });

    describe('navigation', () => {
        it('should navigate to campaign detail on add campaign', async () => {
            // Arrange
            const user = userEvent.setup();
            mockCreateCampaign.mockReturnValue({
                unwrap: () => Promise.resolve({ id: 'new-campaign-id' }),
            });

            render(
                <TestWrapper>
                    <WorldDetailPage />
                </TestWrapper>,
            );

            const addButton = screen.getByRole('button', { name: /add campaign/i });
            expect(addButton).toBeInTheDocument();

            // Act
            await user.click(addButton);

            // Assert
            await waitFor(() => {
                expect(mockCreateCampaign).toHaveBeenCalledWith({
                    worldId: 'world-123',
                    request: {
                        name: 'New Campaign',
                        description: '',
                    },
                });
            });

            await waitFor(() => {
                expect(mockNavigate).toHaveBeenCalledWith('/campaigns/new-campaign-id');
            });
        });

        it('should navigate to campaign detail on open campaign', async () => {
            // Arrange
            const user = userEvent.setup();

            render(
                <TestWrapper>
                    <WorldDetailPage />
                </TestWrapper>,
            );

            // Act
            const openButtons = screen.getAllByRole('button', { name: /^open$/i });
            const firstOpenButton = openButtons[0];
            expect(firstOpenButton).toBeDefined();
            await user.click(firstOpenButton!);

            // Assert
            expect(mockNavigate).toHaveBeenCalledWith('/campaigns/campaign-1');
        });

        it('should navigate back to library on back button click', async () => {
            // Arrange
            const user = userEvent.setup();

            render(
                <TestWrapper>
                    <WorldDetailPage />
                </TestWrapper>,
            );

            const backButton = screen.getByRole('button', { name: /back to library/i });
            expect(backButton).toBeInTheDocument();

            // Act
            await user.click(backButton);

            // Assert
            expect(mockNavigate).toHaveBeenCalledWith('/content-library/worlds');
        });

        it('should navigate back to library on error page back button click', async () => {
            // Arrange
            const user = userEvent.setup();
            vi.mocked(useGetWorldQuery).mockReturnValue({
                data: undefined,
                isLoading: false,
                error: { status: 404, data: 'Not found' },
                refetch: vi.fn(),
            } as ReturnType<typeof useGetWorldQuery>);

            render(
                <TestWrapper>
                    <WorldDetailPage />
                </TestWrapper>,
            );

            // Act
            const backButton = screen.getByRole('button', { name: /back to library/i });
            await user.click(backButton);

            // Assert
            expect(mockNavigate).toHaveBeenCalledWith('/content-library/worlds');
        });
    });

    describe('campaign actions', () => {
        it('should duplicate campaign when duplicate button is clicked', async () => {
            // Arrange
            const user = userEvent.setup();
            mockCloneCampaign.mockReturnValue({
                unwrap: () => Promise.resolve({}),
            });

            render(
                <TestWrapper>
                    <WorldDetailPage />
                </TestWrapper>,
            );

            // Act
            const duplicateButtons = screen.getAllByRole('button', { name: /duplicate/i });
            const firstDuplicateButton = duplicateButtons[0];
            expect(firstDuplicateButton).toBeDefined();
            await user.click(firstDuplicateButton!);

            // Assert
            await waitFor(() => {
                expect(mockCloneCampaign).toHaveBeenCalledWith({
                    worldId: 'world-123',
                    campaignId: 'campaign-1',
                });
            });
        });

        it('should open delete confirmation dialog when delete button is clicked', async () => {
            // Arrange
            const user = userEvent.setup();

            render(
                <TestWrapper>
                    <WorldDetailPage />
                </TestWrapper>,
            );

            // Act
            const deleteButtons = screen.getAllByRole('button', { name: /delete/i });
            const firstDeleteButton = deleteButtons[0];
            expect(firstDeleteButton).toBeDefined();
            await user.click(firstDeleteButton!);

            // Assert
            expect(screen.getByText('Delete Campaign')).toBeInTheDocument();
            expect(screen.getByText(/are you sure you want to delete "The Dragon Wars"/i)).toBeInTheDocument();
        });

        it('should close delete confirmation dialog when cancel is clicked', async () => {
            // Arrange
            const user = userEvent.setup();

            render(
                <TestWrapper>
                    <WorldDetailPage />
                </TestWrapper>,
            );

            // Open dialog
            const deleteButtons = screen.getAllByRole('button', { name: /delete/i });
            const firstDeleteButton = deleteButtons[0];
            expect(firstDeleteButton).toBeDefined();
            await user.click(firstDeleteButton!);

            // Act
            const cancelButton = screen.getByRole('button', { name: /cancel/i });
            await user.click(cancelButton);

            // Assert
            expect(screen.queryByText('Delete Campaign')).not.toBeInTheDocument();
        });

        it('should delete campaign when confirm is clicked', async () => {
            // Arrange
            const user = userEvent.setup();
            mockRemoveCampaign.mockReturnValue({
                unwrap: () => Promise.resolve({}),
            });

            render(
                <TestWrapper>
                    <WorldDetailPage />
                </TestWrapper>,
            );

            // Open dialog
            const deleteButtons = screen.getAllByRole('button', { name: /delete/i });
            const firstDeleteButton = deleteButtons[0];
            expect(firstDeleteButton).toBeDefined();
            await user.click(firstDeleteButton!);

            // Act
            const confirmButton = screen.getByRole('button', { name: /confirm/i });
            await user.click(confirmButton);

            // Assert
            await waitFor(() => {
                expect(mockRemoveCampaign).toHaveBeenCalledWith({
                    worldId: 'world-123',
                    campaignId: 'campaign-1',
                });
            });
        });
    });

    describe('world editing', () => {
        it('should save changes when name field loses focus', async () => {
            // Arrange
            const user = userEvent.setup();
            mockUpdateWorld.mockReturnValue({
                unwrap: () => Promise.resolve({}),
            });

            render(
                <TestWrapper>
                    <WorldDetailPage />
                </TestWrapper>,
            );

            await waitFor(() => {
                expect(screen.getByPlaceholderText('World Name')).toBeInTheDocument();
            });

            const nameInput = screen.getByPlaceholderText('World Name') as HTMLInputElement;

            // Act
            await user.clear(nameInput);
            await user.type(nameInput, 'Updated World Name');
            fireEvent.blur(nameInput);

            // Assert
            await waitFor(() => {
                expect(mockUpdateWorld).toHaveBeenCalledWith({
                    id: 'world-123',
                    request: expect.objectContaining({
                        name: 'Updated World Name',
                    }),
                });
            });
        });

        it('should save changes when description field loses focus', async () => {
            // Arrange
            const user = userEvent.setup();
            mockUpdateWorld.mockReturnValue({
                unwrap: () => Promise.resolve({}),
            });

            render(
                <TestWrapper>
                    <WorldDetailPage />
                </TestWrapper>,
            );

            await waitFor(() => {
                expect(screen.getByPlaceholderText('World description...')).toBeInTheDocument();
            });

            const descriptionInput = screen.getByPlaceholderText('World description...') as HTMLTextAreaElement;

            // Act
            await user.clear(descriptionInput);
            await user.type(descriptionInput, 'Updated description');
            fireEvent.blur(descriptionInput);

            // Assert
            await waitFor(() => {
                expect(mockUpdateWorld).toHaveBeenCalledWith({
                    id: 'world-123',
                    request: expect.objectContaining({
                        description: 'Updated description',
                    }),
                });
            });
        });

        it('should save changes when published switch is toggled', async () => {
            // Arrange
            const user = userEvent.setup();
            mockUpdateWorld.mockReturnValue({
                unwrap: () => Promise.resolve({}),
            });

            render(
                <TestWrapper>
                    <WorldDetailPage />
                </TestWrapper>,
            );

            await waitFor(() => {
                // MUI Switch renders with role="switch"
                expect(screen.getByRole('switch')).toBeInTheDocument();
            });

            const publishSwitch = screen.getByRole('switch');

            // Act
            await user.click(publishSwitch);

            // Assert
            await waitFor(() => {
                expect(mockUpdateWorld).toHaveBeenCalledWith({
                    id: 'world-123',
                    request: expect.objectContaining({
                        isPublished: true,
                    }),
                });
            });
        });
    });

    describe('theme support', () => {
        it('should render correctly in dark mode', () => {
            // Arrange
            const darkTheme = createTheme({ palette: { mode: 'dark' } });

            // Act
            render(
                <ThemeProvider theme={darkTheme}>
                    <WorldDetailPage />
                </ThemeProvider>,
            );

            // Assert
            expect(screen.getByRole('heading', { name: /campaigns/i })).toBeInTheDocument();
        });

        it('should render correctly in light mode', () => {
            // Arrange
            const lightTheme = createTheme({ palette: { mode: 'light' } });

            // Act
            render(
                <ThemeProvider theme={lightTheme}>
                    <WorldDetailPage />
                </ThemeProvider>,
            );

            // Assert
            expect(screen.getByRole('heading', { name: /campaigns/i })).toBeInTheDocument();
        });
    });

    describe('empty state interactions', () => {
        it('should create campaign from empty state Add Campaign button', async () => {
            // Arrange
            const user = userEvent.setup();
            vi.mocked(useGetCampaignsQuery).mockReturnValue({
                data: [],
                isLoading: false,
                error: null,
                refetch: vi.fn(),
            } as ReturnType<typeof useGetCampaignsQuery>);

            mockCreateCampaign.mockReturnValue({
                unwrap: () => Promise.resolve({ id: 'new-campaign-id' }),
            });

            render(
                <TestWrapper>
                    <WorldDetailPage />
                </TestWrapper>,
            );

            // Find the Add Campaign button in empty state (not the header one)
            const addButtons = screen.getAllByRole('button', { name: /add campaign/i });
            expect(addButtons.length).toBe(2); // Header button + empty state button

            // Act - click the empty state button (second one)
            await user.click(addButtons[1]!);

            // Assert
            await waitFor(() => {
                expect(mockCreateCampaign).toHaveBeenCalledWith({
                    worldId: 'world-123',
                    request: {
                        name: 'New Campaign',
                        description: '',
                    },
                });
            });
        });
    });

    describe('container element', () => {
        it('should render world detail container', () => {
            // Arrange & Act
            render(
                <TestWrapper>
                    <WorldDetailPage />
                </TestWrapper>,
            );

            // Assert - verify the main content is rendered (the heading is a reliable indicator)
            expect(screen.getByRole('heading', { name: /campaigns/i })).toBeInTheDocument();
        });
    });
});
