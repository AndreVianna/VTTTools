import { createTheme, ThemeProvider } from '@mui/material/styles';
import { render, screen, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import type * as React from 'react';
import { beforeEach, describe, expect, it, vi } from 'vitest';
import type { Adventure, Campaign, Encounter } from '@/types/domain';
import { AdventureStyle, ContentType } from '../types';
import { AdventureDetailPage } from './AdventureDetailPage';

// Mock react-router-dom
const mockNavigate = vi.fn();
const mockUseParams = vi.fn();

vi.mock('react-router-dom', () => ({
    useNavigate: () => mockNavigate,
    useParams: () => mockUseParams(),
}));

// Mock adventuresApi
const mockUseGetAdventureQuery = vi.fn();
const mockUseGetEncountersQuery = vi.fn();
const mockUseUpdateAdventureMutation = vi.fn();
const mockUseCreateEncounterMutation = vi.fn();
const mockUseCloneEncounterMutation = vi.fn();
const mockInvalidateTags = vi.fn();

vi.mock('@/services/adventuresApi', () => ({
    adventuresApi: { util: { invalidateTags: (tags: unknown[]) => mockInvalidateTags(tags) } },
    useGetAdventureQuery: () => mockUseGetAdventureQuery(),
    useGetEncountersQuery: () => mockUseGetEncountersQuery(),
    useUpdateAdventureMutation: () => mockUseUpdateAdventureMutation(),
    useCreateEncounterMutation: () => mockUseCreateEncounterMutation(),
    useCloneEncounterMutation: () => mockUseCloneEncounterMutation(),
}));

// Mock campaignsApi
const mockUseGetCampaignQuery = vi.fn();

vi.mock('@/services/campaignsApi', () => ({
    useGetCampaignQuery: () => mockUseGetCampaignQuery(),
}));

// Mock encounterApi
const mockUseDeleteEncounterMutation = vi.fn();

vi.mock('@/services/encounterApi', () => ({
    useDeleteEncounterMutation: () => mockUseDeleteEncounterMutation(),
}));

// Mock mediaApi
const mockUseUploadFileMutation = vi.fn();

vi.mock('@/services/mediaApi', () => ({
    useUploadFileMutation: () => mockUseUploadFileMutation(),
}));

// Mock useAuthenticatedImageUrl
vi.mock('@/hooks/useAuthenticatedImageUrl', () => ({
    useAuthenticatedImageUrl: vi.fn(() => ({ blobUrl: null })),
}));

// Mock store
const mockDispatch = vi.fn();

vi.mock('@/store', () => ({
    useAppDispatch: () => mockDispatch,
}));

// Mock development config
vi.mock('@/config/development', () => ({
    getApiEndpoints: () => ({ media: '/api/media' }),
}));

// Mock EncounterCard component
vi.mock('../components/encounters', () => ({
    EncounterCard: vi.fn(({ encounter, onOpen, onDuplicate, onDelete }: {
        encounter: { id: string; name: string };
        onOpen: (id: string) => void;
        onDuplicate: (id: string) => void;
        onDelete: (id: string) => void;
    }) => (
        <div data-mock="EncounterCard">
            <span>{encounter.name}</span>
            <button onClick={() => onOpen(encounter.id)}>Open</button>
            <button onClick={() => onDuplicate(encounter.id)}>Duplicate</button>
            <button onClick={() => onDelete(encounter.id)}>Delete</button>
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
        ) : null
    ),
}));

const TestWrapper: React.FC<{ children: React.ReactNode }> = ({ children }) => {
    const theme = createTheme({ palette: { mode: 'light' } });
    return <ThemeProvider theme={theme}>{children}</ThemeProvider>;
};
TestWrapper.displayName = 'TestWrapper';

describe('AdventureDetailPage', () => {
    const mockAdventure: Adventure = {
        id: 'adventure-123',
        type: ContentType.Adventure,
        name: 'Dragon Lair Adventure',
        description: 'An epic adventure in the dragon lair',
        isPublished: false,
        ownerId: 'user-1',
        style: AdventureStyle.DungeonCrawl,
        isOneShot: false,
        encounterCount: 2,
        background: null,
    };

    const mockCampaign: Campaign = {
        id: 'campaign-456',
        name: 'Epic Campaign',
        description: 'A grand campaign',
        ownerId: 'user-1',
        isPublished: false,
        isPublic: false,
    };

    const mockEncounters: Partial<Encounter>[] = [
        { id: 'encounter-1', name: 'Goblin Ambush' },
        { id: 'encounter-2', name: 'Dragon Boss Fight' },
    ];

    const mockUpdateAdventure = vi.fn().mockReturnValue({ unwrap: vi.fn().mockResolvedValue({}) });
    const mockCreateEncounter = vi.fn().mockReturnValue({ unwrap: vi.fn().mockResolvedValue({ id: 'new-encounter-id' }) });
    const mockCloneEncounter = vi.fn().mockReturnValue({ unwrap: vi.fn().mockResolvedValue({}) });
    const mockDeleteEncounter = vi.fn().mockReturnValue({ unwrap: vi.fn().mockResolvedValue({}) });
    const mockUploadFile = vi.fn().mockReturnValue({ unwrap: vi.fn().mockResolvedValue({ id: 'file-id' }) });

    beforeEach(() => {
        vi.clearAllMocks();

        // Default mock return values
        mockUseParams.mockReturnValue({ adventureId: 'adventure-123' });
        mockUseGetAdventureQuery.mockReturnValue({
            data: mockAdventure,
            isLoading: false,
            error: null,
        });
        mockUseGetEncountersQuery.mockReturnValue({
            data: mockEncounters,
            isLoading: false,
        });
        mockUseGetCampaignQuery.mockReturnValue({
            data: null,
        });
        mockUseUpdateAdventureMutation.mockReturnValue([mockUpdateAdventure]);
        mockUseCreateEncounterMutation.mockReturnValue([mockCreateEncounter]);
        mockUseCloneEncounterMutation.mockReturnValue([mockCloneEncounter]);
        mockUseDeleteEncounterMutation.mockReturnValue([mockDeleteEncounter, { isLoading: false }]);
        mockUseUploadFileMutation.mockReturnValue([mockUploadFile, { isLoading: false }]);
    });

    describe('loading state', () => {
        it('should show loading spinner when loading adventure', () => {
            // Arrange
            mockUseGetAdventureQuery.mockReturnValue({
                data: null,
                isLoading: true,
                error: null,
            });

            // Act
            render(
                <TestWrapper>
                    <AdventureDetailPage />
                </TestWrapper>,
            );

            // Assert
            expect(screen.getByRole('progressbar')).toBeInTheDocument();
        });
    });

    describe('error state', () => {
        it('should show error alert when adventure fails to load', () => {
            // Arrange
            mockUseGetAdventureQuery.mockReturnValue({
                data: null,
                isLoading: false,
                error: { message: 'Failed to load' },
            });

            // Act
            render(
                <TestWrapper>
                    <AdventureDetailPage />
                </TestWrapper>,
            );

            // Assert
            expect(screen.getByRole('alert')).toBeInTheDocument();
            expect(screen.getByText(/failed to load adventure/i)).toBeInTheDocument();
        });

        it('should show Back to Library button on error', () => {
            // Arrange
            mockUseGetAdventureQuery.mockReturnValue({
                data: null,
                isLoading: false,
                error: { message: 'Failed to load' },
            });

            // Act
            render(
                <TestWrapper>
                    <AdventureDetailPage />
                </TestWrapper>,
            );

            // Assert
            expect(screen.getByRole('button', { name: /back to library/i })).toBeInTheDocument();
        });
    });

    describe('rendering when adventure loaded', () => {
        it('should render adventure name input', () => {
            // Arrange & Act
            render(
                <TestWrapper>
                    <AdventureDetailPage />
                </TestWrapper>,
            );

            // Assert
            const nameInput = screen.getByPlaceholderText('Adventure Name') as HTMLInputElement;
            expect(nameInput).toBeInTheDocument();
            expect(nameInput).toHaveValue('Dragon Lair Adventure');
        });

        it('should render adventure description field', () => {
            // Arrange & Act
            render(
                <TestWrapper>
                    <AdventureDetailPage />
                </TestWrapper>,
            );

            // Assert
            const descriptionInput = screen.getByPlaceholderText('Adventure description...') as HTMLTextAreaElement;
            expect(descriptionInput).toBeInTheDocument();
            expect(descriptionInput).toHaveValue('An epic adventure in the dragon lair');
        });

        it('should render style dropdown', () => {
            // Arrange & Act
            render(
                <TestWrapper>
                    <AdventureDetailPage />
                </TestWrapper>,
            );

            // Assert
            const styleSelect = screen.getByLabelText('Style');
            expect(styleSelect).toBeInTheDocument();
        });

        it('should render Add Encounter button', () => {
            // Arrange & Act
            render(
                <TestWrapper>
                    <AdventureDetailPage />
                </TestWrapper>,
            );

            // Assert
            const addButton = screen.getByRole('button', { name: /add encounter/i });
            expect(addButton).toBeInTheDocument();
        });

        it('should render encounters count heading', () => {
            // Arrange & Act
            render(
                <TestWrapper>
                    <AdventureDetailPage />
                </TestWrapper>,
            );

            // Assert
            expect(screen.getByRole('heading', { name: /encounters \(2\)/i })).toBeInTheDocument();
        });
    });

    describe('encounters', () => {
        it('should render EncounterCard for each encounter', () => {
            // Arrange & Act
            render(
                <TestWrapper>
                    <AdventureDetailPage />
                </TestWrapper>,
            );

            // Assert
            expect(screen.getByText('Goblin Ambush')).toBeInTheDocument();
            expect(screen.getByText('Dragon Boss Fight')).toBeInTheDocument();
        });

        it('should show empty state when no encounters', () => {
            // Arrange
            mockUseGetEncountersQuery.mockReturnValue({
                data: [],
                isLoading: false,
            });

            // Act
            render(
                <TestWrapper>
                    <AdventureDetailPage />
                </TestWrapper>,
            );

            // Assert
            expect(screen.getByText(/no encounters yet/i)).toBeInTheDocument();
            expect(screen.getByText(/add your first encounter to this adventure/i)).toBeInTheDocument();
        });
    });

    describe('navigation', () => {
        it('should navigate to encounter editor on add encounter', async () => {
            // Arrange
            const user = userEvent.setup();

            render(
                <TestWrapper>
                    <AdventureDetailPage />
                </TestWrapper>,
            );

            // Act
            const addButton = screen.getByRole('button', { name: /add encounter/i });
            await user.click(addButton);

            // Assert
            await waitFor(() => {
                expect(mockCreateEncounter).toHaveBeenCalledWith({
                    adventureId: 'adventure-123',
                    request: {
                        name: 'New Encounter',
                        description: '',
                    },
                });
            });
            await waitFor(() => {
                expect(mockNavigate).toHaveBeenCalledWith('/encounter-editor/new-encounter-id');
            });
        });

        it('should navigate to encounter editor on open encounter', async () => {
            // Arrange
            const user = userEvent.setup();

            render(
                <TestWrapper>
                    <AdventureDetailPage />
                </TestWrapper>,
            );

            // Act
            const openButtons = screen.getAllByRole('button', { name: /^open$/i });
            await user.click(openButtons[0]);

            // Assert
            expect(mockNavigate).toHaveBeenCalledWith('/encounter-editor/encounter-1');
        });

        it('should navigate back to library on back button click', async () => {
            // Arrange
            const user = userEvent.setup();

            render(
                <TestWrapper>
                    <AdventureDetailPage />
                </TestWrapper>,
            );

            // Act
            const backButton = screen.getByRole('button', { name: /back to library/i });
            await user.click(backButton);

            // Assert
            expect(mockNavigate).toHaveBeenCalledWith('/content-library/adventures');
        });

        it('should navigate back to campaign when adventure has parent campaign', async () => {
            // Arrange
            const user = userEvent.setup();
            mockUseGetAdventureQuery.mockReturnValue({
                data: { ...mockAdventure, campaignId: 'campaign-456' },
                isLoading: false,
                error: null,
            });
            mockUseGetCampaignQuery.mockReturnValue({
                data: mockCampaign,
            });

            render(
                <TestWrapper>
                    <AdventureDetailPage />
                </TestWrapper>,
            );

            // Act
            const backButton = screen.getByRole('button', { name: /back to library/i });
            await user.click(backButton);

            // Assert
            expect(mockNavigate).toHaveBeenCalledWith('/campaigns/campaign-456');
        });
    });

    describe('breadcrumbs', () => {
        it('should show breadcrumbs when adventure has a parent campaign', () => {
            // Arrange
            mockUseGetAdventureQuery.mockReturnValue({
                data: { ...mockAdventure, campaignId: 'campaign-456' },
                isLoading: false,
                error: null,
            });
            mockUseGetCampaignQuery.mockReturnValue({
                data: mockCampaign,
            });

            // Act
            render(
                <TestWrapper>
                    <AdventureDetailPage />
                </TestWrapper>,
            );

            // Assert
            const breadcrumbs = screen.getByRole('navigation', { name: /breadcrumb/i });
            expect(breadcrumbs).toBeInTheDocument();
            expect(screen.getByText('Epic Campaign')).toBeInTheDocument();
        });

        it('should not show breadcrumbs when adventure has no parent campaign', () => {
            // Arrange & Act
            render(
                <TestWrapper>
                    <AdventureDetailPage />
                </TestWrapper>,
            );

            // Assert
            const breadcrumbs = screen.queryByRole('navigation', { name: /breadcrumb/i });
            expect(breadcrumbs).not.toBeInTheDocument();
        });
    });

    describe('encounter actions', () => {
        it('should call cloneEncounter when duplicate button is clicked', async () => {
            // Arrange
            const user = userEvent.setup();

            render(
                <TestWrapper>
                    <AdventureDetailPage />
                </TestWrapper>,
            );

            // Act
            const duplicateButtons = screen.getAllByRole('button', { name: /duplicate/i });
            await user.click(duplicateButtons[0]);

            // Assert
            await waitFor(() => {
                expect(mockCloneEncounter).toHaveBeenCalledWith({
                    adventureId: 'adventure-123',
                    encounterId: 'encounter-1',
                });
            });
        });

        it('should open confirm dialog when delete button is clicked', async () => {
            // Arrange
            const user = userEvent.setup();

            render(
                <TestWrapper>
                    <AdventureDetailPage />
                </TestWrapper>,
            );

            // Act
            const deleteButtons = screen.getAllByRole('button', { name: /^delete$/i });
            await user.click(deleteButtons[0]);

            // Assert
            expect(screen.getByText('Delete Encounter')).toBeInTheDocument();
            expect(screen.getByText(/are you sure you want to delete "goblin ambush"/i)).toBeInTheDocument();
        });

        it('should delete encounter and invalidate cache on confirm', async () => {
            // Arrange
            const user = userEvent.setup();

            render(
                <TestWrapper>
                    <AdventureDetailPage />
                </TestWrapper>,
            );

            // Act - open dialog
            const deleteButtons = screen.getAllByRole('button', { name: /^delete$/i });
            await user.click(deleteButtons[0]);

            // Act - confirm delete
            const confirmButton = screen.getByRole('button', { name: /confirm/i });
            await user.click(confirmButton);

            // Assert
            await waitFor(() => {
                expect(mockDeleteEncounter).toHaveBeenCalledWith('encounter-1');
            });
            await waitFor(() => {
                expect(mockDispatch).toHaveBeenCalled();
            });
        });

        it('should close confirm dialog on cancel', async () => {
            // Arrange
            const user = userEvent.setup();

            render(
                <TestWrapper>
                    <AdventureDetailPage />
                </TestWrapper>,
            );

            // Act - open dialog
            const deleteButtons = screen.getAllByRole('button', { name: /^delete$/i });
            await user.click(deleteButtons[0]);

            // Act - cancel
            const cancelButton = screen.getByRole('button', { name: /cancel/i });
            await user.click(cancelButton);

            // Assert
            expect(screen.queryByText('Delete Encounter')).not.toBeInTheDocument();
        });
    });
});
