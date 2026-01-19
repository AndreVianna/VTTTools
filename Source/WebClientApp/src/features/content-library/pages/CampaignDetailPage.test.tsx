/**
 * CampaignDetailPage Component Tests
 * Tests campaign detail page with loading, error, and success states
 * Coverage: Campaign editing, adventures management, navigation
 */

import { createTheme, ThemeProvider } from '@mui/material/styles';
import { render, screen, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import type * as React from 'react';
import { beforeEach, describe, expect, it, vi } from 'vitest';
import type { Adventure, Campaign } from '@/types/domain';
import { AdventureStyle, ContentType } from '@/types/domain';
import { CampaignDetailPage } from './CampaignDetailPage';

// Mock react-router-dom
const mockNavigate = vi.fn();
vi.mock('react-router-dom', () => ({
    useNavigate: () => mockNavigate,
    useParams: vi.fn(() => ({ campaignId: 'campaign-123' })),
}));

// Mock campaignsApi hooks
const mockUpdateCampaign = vi.fn();
const mockCreateAdventure = vi.fn();
const mockCloneAdventure = vi.fn();
const mockRemoveAdventure = vi.fn();

vi.mock('@/services/campaignsApi', () => ({
    useGetCampaignQuery: vi.fn(),
    useGetAdventuresQuery: vi.fn(),
    useUpdateCampaignMutation: vi.fn(() => [mockUpdateCampaign, { isLoading: false }]),
    useCreateAdventureMutation: vi.fn(() => [mockCreateAdventure, { isLoading: false }]),
    useCloneAdventureMutation: vi.fn(() => [mockCloneAdventure, { isLoading: false }]),
    useRemoveAdventureMutation: vi.fn(() => [mockRemoveAdventure, { isLoading: false }]),
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

// Mock AdventureCard component
vi.mock('../components/adventures', () => ({
    AdventureCard: vi.fn(({ adventure, onOpen, onDuplicate, onDelete }) => (
        <div data-mock="AdventureCard">
            <span>{adventure.name}</span>
            <button onClick={() => onOpen(adventure.id)}>Open</button>
            <button onClick={() => onDuplicate(adventure.id)}>Duplicate</button>
            <button onClick={() => onDelete(adventure.id)}>Delete</button>
        </div>
    )),
}));

// Mock ConfirmDialog component
vi.mock('@/components/common', () => ({
    ConfirmDialog: vi.fn(({ open, onClose, onConfirm, title, message }) =>
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
    useGetCampaignQuery,
    useGetAdventuresQuery,
    useRemoveAdventureMutation,
} from '@/services/campaignsApi';

const TestWrapper: React.FC<{ children: React.ReactNode }> = ({ children }) => {
    const theme = createTheme({ palette: { mode: 'light' } });
    return <ThemeProvider theme={theme}>{children}</ThemeProvider>;
};
TestWrapper.displayName = 'TestWrapper';

describe('CampaignDetailPage', () => {
    const mockCampaign: Campaign = {
        id: 'campaign-123',
        ownerId: 'user-1',
        name: 'Epic Campaign',
        description: 'An epic campaign description',
        isPublished: false,
        isPublic: false,
        background: null,
    };

    const mockAdventures: Adventure[] = [
        {
            id: 'adventure-1',
            type: ContentType.Adventure,
            name: 'Dragon Lair',
            description: 'Hunt the dragon',
            isPublished: false,
            ownerId: 'user-1',
            style: AdventureStyle.DungeonCrawl,
            isOneShot: false,
            encounterCount: 3,
            background: null,
            campaignId: 'campaign-123',
        },
        {
            id: 'adventure-2',
            type: ContentType.Adventure,
            name: 'Goblin Cave',
            description: 'Clear the caves',
            isPublished: true,
            ownerId: 'user-1',
            style: AdventureStyle.HackNSlash,
            isOneShot: true,
            encounterCount: 5,
            background: null,
            campaignId: 'campaign-123',
        },
    ];

    beforeEach(() => {
        vi.clearAllMocks();

        // Default mock implementations
        vi.mocked(useParams).mockReturnValue({ campaignId: 'campaign-123' });

        vi.mocked(useGetCampaignQuery).mockReturnValue({
            data: mockCampaign,
            isLoading: false,
            error: null,
            refetch: vi.fn(),
        } as ReturnType<typeof useGetCampaignQuery>);

        vi.mocked(useGetAdventuresQuery).mockReturnValue({
            data: mockAdventures,
            isLoading: false,
            error: null,
            refetch: vi.fn(),
        } as ReturnType<typeof useGetAdventuresQuery>);

        vi.mocked(useRemoveAdventureMutation).mockReturnValue([
            mockRemoveAdventure,
            { isLoading: false, reset: vi.fn() },
        ] as ReturnType<typeof useRemoveAdventureMutation>);

        mockCreateAdventure.mockResolvedValue({ unwrap: () => Promise.resolve({ id: 'new-adventure-id' }) });
        mockUpdateCampaign.mockResolvedValue({ unwrap: () => Promise.resolve({}) });
        mockCloneAdventure.mockResolvedValue({ unwrap: () => Promise.resolve({}) });
        mockRemoveAdventure.mockResolvedValue({ unwrap: () => Promise.resolve({}) });
    });

    describe('loading state', () => {
        it('should show loading spinner when loading campaign', () => {
            // Arrange
            vi.mocked(useGetCampaignQuery).mockReturnValue({
                data: undefined,
                isLoading: true,
                error: null,
                refetch: vi.fn(),
            } as ReturnType<typeof useGetCampaignQuery>);

            // Act
            render(
                <TestWrapper>
                    <CampaignDetailPage />
                </TestWrapper>,
            );

            // Assert
            expect(screen.getByRole('progressbar')).toBeInTheDocument();
        });
    });

    describe('error state', () => {
        it('should show error alert when campaign fails to load', () => {
            // Arrange
            vi.mocked(useGetCampaignQuery).mockReturnValue({
                data: undefined,
                isLoading: false,
                error: { status: 500, data: 'Server error' },
                refetch: vi.fn(),
            } as ReturnType<typeof useGetCampaignQuery>);

            // Act
            render(
                <TestWrapper>
                    <CampaignDetailPage />
                </TestWrapper>,
            );

            // Assert
            expect(screen.getByRole('alert')).toBeInTheDocument();
            expect(screen.getByText(/failed to load campaign/i)).toBeInTheDocument();
        });

        it('should show Back to Library button on error', () => {
            // Arrange
            vi.mocked(useGetCampaignQuery).mockReturnValue({
                data: undefined,
                isLoading: false,
                error: { status: 404, data: 'Not found' },
                refetch: vi.fn(),
            } as ReturnType<typeof useGetCampaignQuery>);

            // Act
            render(
                <TestWrapper>
                    <CampaignDetailPage />
                </TestWrapper>,
            );

            // Assert
            const backButton = screen.getByRole('button', { name: /back to library/i });
            expect(backButton).toBeInTheDocument();
        });
    });

    describe('rendering (campaign loaded)', () => {
        it('should render campaign name input', async () => {
            // Arrange & Act
            render(
                <TestWrapper>
                    <CampaignDetailPage />
                </TestWrapper>,
            );

            // Assert
            await waitFor(() => {
                const nameInput = screen.getByPlaceholderText('Campaign Name');
                expect(nameInput).toBeInTheDocument();
            });
        });

        it('should render campaign description field', async () => {
            // Arrange & Act
            render(
                <TestWrapper>
                    <CampaignDetailPage />
                </TestWrapper>,
            );

            // Assert
            await waitFor(() => {
                const descriptionInput = screen.getByPlaceholderText('Campaign description...');
                expect(descriptionInput).toBeInTheDocument();
            });
        });

        it('should render Published switch', async () => {
            // Arrange & Act
            render(
                <TestWrapper>
                    <CampaignDetailPage />
                </TestWrapper>,
            );

            // Assert
            await waitFor(() => {
                expect(screen.getByText('Published')).toBeInTheDocument();
                expect(screen.getByRole('switch')).toBeInTheDocument();
            });
        });

        it('should render Add Adventure button', () => {
            // Arrange & Act
            render(
                <TestWrapper>
                    <CampaignDetailPage />
                </TestWrapper>,
            );

            // Assert
            const addButton = screen.getByRole('button', { name: /add adventure/i });
            expect(addButton).toBeInTheDocument();
        });

        it('should render adventures count heading', () => {
            // Arrange & Act
            render(
                <TestWrapper>
                    <CampaignDetailPage />
                </TestWrapper>,
            );

            // Assert
            expect(screen.getByRole('heading', { name: /adventures \(2\)/i })).toBeInTheDocument();
        });
    });

    describe('adventures', () => {
        it('should render AdventureCard for each adventure', () => {
            // Arrange & Act
            render(
                <TestWrapper>
                    <CampaignDetailPage />
                </TestWrapper>,
            );

            // Assert
            expect(screen.getByText('Dragon Lair')).toBeInTheDocument();
            expect(screen.getByText('Goblin Cave')).toBeInTheDocument();
            expect(screen.getAllByText(/open/i)).toHaveLength(2);
        });

        it('should show empty state when no adventures', () => {
            // Arrange
            vi.mocked(useGetAdventuresQuery).mockReturnValue({
                data: [],
                isLoading: false,
                error: null,
                refetch: vi.fn(),
            } as ReturnType<typeof useGetAdventuresQuery>);

            // Act
            render(
                <TestWrapper>
                    <CampaignDetailPage />
                </TestWrapper>,
            );

            // Assert
            expect(screen.getByText(/no adventures yet/i)).toBeInTheDocument();
            expect(screen.getByText(/add your first adventure/i)).toBeInTheDocument();
        });
    });

    describe('navigation', () => {
        it('should navigate to adventure detail on add adventure', async () => {
            // Arrange
            const user = userEvent.setup();
            mockCreateAdventure.mockReturnValue({
                unwrap: () => Promise.resolve({ id: 'new-adventure-id' }),
            });

            render(
                <TestWrapper>
                    <CampaignDetailPage />
                </TestWrapper>,
            );

            const addButton = screen.getByRole('button', { name: /add adventure/i });
            expect(addButton).toBeInTheDocument();

            // Act
            await user.click(addButton);

            // Assert
            await waitFor(() => {
                expect(mockCreateAdventure).toHaveBeenCalledWith({
                    campaignId: 'campaign-123',
                    request: {
                        name: 'New Adventure',
                        description: '',
                        style: AdventureStyle.Generic,
                    },
                });
            });

            await waitFor(() => {
                expect(mockNavigate).toHaveBeenCalledWith('/adventures/new-adventure-id');
            });
        });

        it('should navigate to adventure detail on open adventure', async () => {
            // Arrange
            const user = userEvent.setup();

            render(
                <TestWrapper>
                    <CampaignDetailPage />
                </TestWrapper>,
            );

            // Act
            const openButtons = screen.getAllByRole('button', { name: /^open$/i });
            const firstOpenButton = openButtons[0];
            expect(firstOpenButton).toBeDefined();
            await user.click(firstOpenButton!);

            // Assert
            expect(mockNavigate).toHaveBeenCalledWith('/adventures/adventure-1');
        });

        it('should navigate back to library on back button click', async () => {
            // Arrange
            const user = userEvent.setup();

            render(
                <TestWrapper>
                    <CampaignDetailPage />
                </TestWrapper>,
            );

            const backButton = screen.getByRole('button', { name: /back to library/i });
            expect(backButton).toBeInTheDocument();

            // Act
            await user.click(backButton);

            // Assert
            expect(mockNavigate).toHaveBeenCalledWith('/content-library/campaigns');
        });

        it('should navigate back to library on error page back button click', async () => {
            // Arrange
            const user = userEvent.setup();
            vi.mocked(useGetCampaignQuery).mockReturnValue({
                data: undefined,
                isLoading: false,
                error: { status: 404, data: 'Not found' },
                refetch: vi.fn(),
            } as ReturnType<typeof useGetCampaignQuery>);

            render(
                <TestWrapper>
                    <CampaignDetailPage />
                </TestWrapper>,
            );

            // Act
            const backButton = screen.getByRole('button', { name: /back to library/i });
            await user.click(backButton);

            // Assert
            expect(mockNavigate).toHaveBeenCalledWith('/content-library/campaigns');
        });
    });

    describe('adventure actions', () => {
        it('should duplicate adventure when duplicate button is clicked', async () => {
            // Arrange
            const user = userEvent.setup();
            mockCloneAdventure.mockReturnValue({
                unwrap: () => Promise.resolve({}),
            });

            render(
                <TestWrapper>
                    <CampaignDetailPage />
                </TestWrapper>,
            );

            // Act
            const duplicateButtons = screen.getAllByRole('button', { name: /duplicate/i });
            const firstDuplicateButton = duplicateButtons[0];
            expect(firstDuplicateButton).toBeDefined();
            await user.click(firstDuplicateButton!);

            // Assert
            await waitFor(() => {
                expect(mockCloneAdventure).toHaveBeenCalledWith({
                    campaignId: 'campaign-123',
                    adventureId: 'adventure-1',
                });
            });
        });

        it('should open delete confirmation dialog when delete button is clicked', async () => {
            // Arrange
            const user = userEvent.setup();

            render(
                <TestWrapper>
                    <CampaignDetailPage />
                </TestWrapper>,
            );

            // Act
            const deleteButtons = screen.getAllByRole('button', { name: /delete/i });
            const firstDeleteButton = deleteButtons[0];
            expect(firstDeleteButton).toBeDefined();
            await user.click(firstDeleteButton!);

            // Assert
            expect(screen.getByText('Delete Adventure')).toBeInTheDocument();
            expect(screen.getByText(/are you sure you want to delete "Dragon Lair"/i)).toBeInTheDocument();
        });

        it('should close delete confirmation dialog when cancel is clicked', async () => {
            // Arrange
            const user = userEvent.setup();

            render(
                <TestWrapper>
                    <CampaignDetailPage />
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
            expect(screen.queryByText('Delete Adventure')).not.toBeInTheDocument();
        });

        it('should delete adventure when confirm is clicked', async () => {
            // Arrange
            const user = userEvent.setup();
            mockRemoveAdventure.mockReturnValue({
                unwrap: () => Promise.resolve({}),
            });

            render(
                <TestWrapper>
                    <CampaignDetailPage />
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
                expect(mockRemoveAdventure).toHaveBeenCalledWith({
                    campaignId: 'campaign-123',
                    adventureId: 'adventure-1',
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
                    <CampaignDetailPage />
                </ThemeProvider>,
            );

            // Assert
            expect(screen.getByRole('heading', { name: /adventures/i })).toBeInTheDocument();
        });

        it('should render correctly in light mode', () => {
            // Arrange
            const lightTheme = createTheme({ palette: { mode: 'light' } });

            // Act
            render(
                <ThemeProvider theme={lightTheme}>
                    <CampaignDetailPage />
                </ThemeProvider>,
            );

            // Assert
            expect(screen.getByRole('heading', { name: /adventures/i })).toBeInTheDocument();
        });
    });

    describe('adventures loading state', () => {
        it('should show loading spinner when loading adventures', () => {
            // Arrange
            vi.mocked(useGetAdventuresQuery).mockReturnValue({
                data: [],
                isLoading: true,
                error: null,
                refetch: vi.fn(),
            } as ReturnType<typeof useGetAdventuresQuery>);

            // Act
            render(
                <TestWrapper>
                    <CampaignDetailPage />
                </TestWrapper>,
            );

            // Assert
            const progressIndicators = screen.getAllByRole('progressbar');
            expect(progressIndicators.length).toBeGreaterThan(0);
        });
    });
});
