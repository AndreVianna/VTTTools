import { createTheme, ThemeProvider } from '@mui/material/styles';
import { render, screen, waitFor, within } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import type React from 'react';
import { beforeEach, describe, expect, it, vi } from 'vitest';
import type { World } from '@/types/domain';
import { WorldListView } from './WorldListView';

// Mock react-router-dom
const mockNavigate = vi.fn();
vi.mock('react-router-dom', () => ({
    useNavigate: () => mockNavigate,
}));

// Mock worldsApi hooks
const mockUseGetWorldsQuery = vi.fn();
const mockCreateWorld = vi.fn();
const mockDeleteWorld = vi.fn();
const mockCloneWorld = vi.fn();

vi.mock('@/services/worldsApi', () => ({
    useGetWorldsQuery: () => mockUseGetWorldsQuery(),
    useCreateWorldMutation: () => [mockCreateWorld, { isLoading: false }],
    useDeleteWorldMutation: () => [mockDeleteWorld, { isLoading: false }],
    useCloneWorldMutation: () => [mockCloneWorld, { isLoading: false }],
}));

// Mock useDebounce to return value immediately for testing
vi.mock('../../hooks', () => ({
    useDebounce: vi.fn((value: string) => value),
}));

// Mock WorldCard component
vi.mock('./WorldCard', () => ({
    WorldCard: vi.fn(({
        world,
        onOpen,
        onDuplicate,
        onDelete,
    }: {
        world: World;
        onOpen: (id: string) => void;
        onDuplicate: (id: string) => void;
        onDelete: (id: string) => void;
    }) => (
        <div data-world-id={world.id}>
            <span>{world.name}</span>
            <button onClick={() => onOpen(world.id)}>Open</button>
            <button onClick={() => onDuplicate(world.id)}>Duplicate</button>
            <button onClick={() => onDelete(world.id)}>Delete</button>
        </div>
    )),
}));

const TestWrapper: React.FC<{ children: React.ReactNode }> = ({ children }) => {
    const theme = createTheme({ palette: { mode: 'light' } });
    return <ThemeProvider theme={theme}>{children}</ThemeProvider>;
};
TestWrapper.displayName = 'TestWrapper';

describe('WorldListView', () => {
    const createMockWorld = (overrides: Partial<World> = {}): World => ({
        id: 'world-1',
        ownerId: 'owner-1',
        name: 'Test World',
        description: 'A test world',
        isPublished: false,
        isPublic: false,
        campaigns: [],
        ...overrides,
    });

    const mockWorlds: World[] = [
        createMockWorld({ id: 'world-1', name: 'Middle Earth', isPublished: true }),
        createMockWorld({ id: 'world-2', name: 'Forgotten Realms', isPublished: false }),
        createMockWorld({ id: 'world-3', name: 'Ravnica', isPublished: true }),
    ];

    beforeEach(() => {
        vi.clearAllMocks();

        // Default mock returns
        mockUseGetWorldsQuery.mockReturnValue({
            data: mockWorlds,
            isLoading: false,
            error: null,
        });

        mockCreateWorld.mockReturnValue({
            unwrap: vi.fn().mockResolvedValue({ id: 'new-world-id', name: 'Untitled World' }),
        });

        mockDeleteWorld.mockReturnValue({
            unwrap: vi.fn().mockResolvedValue(undefined),
        });

        mockCloneWorld.mockReturnValue({
            unwrap: vi.fn().mockResolvedValue({ id: 'cloned-world-id', name: 'Cloned World' }),
        });
    });

    describe('rendering', () => {
        it('should render title "Worlds"', () => {
            // Arrange & Act
            render(
                <TestWrapper>
                    <WorldListView />
                </TestWrapper>,
            );

            // Assert
            expect(screen.getByRole('heading', { name: /worlds/i })).toBeInTheDocument();
        });

        it('should render "New World" button', () => {
            // Arrange & Act
            render(
                <TestWrapper>
                    <WorldListView />
                </TestWrapper>,
            );

            // Assert
            expect(screen.getByRole('button', { name: /create new world/i })).toBeInTheDocument();
        });

        it('should render search input and status filter', () => {
            // Arrange & Act
            render(
                <TestWrapper>
                    <WorldListView />
                </TestWrapper>,
            );

            // Assert
            expect(screen.getByPlaceholderText('Search worlds...')).toBeInTheDocument();
            expect(screen.getByLabelText('Status')).toBeInTheDocument();
        });
    });

    describe('loading state', () => {
        it('should show loading message when isLoading is true', () => {
            // Arrange
            mockUseGetWorldsQuery.mockReturnValue({
                data: [],
                isLoading: true,
                error: null,
            });

            // Act
            render(
                <TestWrapper>
                    <WorldListView />
                </TestWrapper>,
            );

            // Assert
            expect(screen.getByText(/loading worlds/i)).toBeInTheDocument();
        });
    });

    describe('empty states', () => {
        it('should show empty state when no worlds and no search query', () => {
            // Arrange
            mockUseGetWorldsQuery.mockReturnValue({
                data: [],
                isLoading: false,
                error: null,
            });

            // Act
            render(
                <TestWrapper>
                    <WorldListView />
                </TestWrapper>,
            );

            // Assert
            expect(screen.getByText(/no worlds yet/i)).toBeInTheDocument();
            expect(screen.getByText(/create your first world/i)).toBeInTheDocument();
        });

        it('should show no results state when filtering returns no worlds', async () => {
            // Arrange
            const user = userEvent.setup();
            mockUseGetWorldsQuery.mockReturnValue({
                data: mockWorlds,
                isLoading: false,
                error: null,
            });

            render(
                <TestWrapper>
                    <WorldListView />
                </TestWrapper>,
            );

            // Act - search for something that does not exist
            const searchInput = screen.getByPlaceholderText('Search worlds...');
            expect(searchInput).toBeInTheDocument();
            await user.type(searchInput, 'nonexistent world xyz');

            // Assert
            expect(screen.getByText(/no worlds found/i)).toBeInTheDocument();
            expect(screen.getByText(/try adjusting your search/i)).toBeInTheDocument();
        });
    });

    describe('data display', () => {
        it('should render WorldCard for each world', () => {
            // Arrange & Act
            render(
                <TestWrapper>
                    <WorldListView />
                </TestWrapper>,
            );

            // Assert
            expect(screen.getByText('Middle Earth')).toBeInTheDocument();
            expect(screen.getByText('Forgotten Realms')).toBeInTheDocument();
            expect(screen.getByText('Ravnica')).toBeInTheDocument();
        });

        it('should filter worlds by search query', async () => {
            // Arrange
            const user = userEvent.setup();

            render(
                <TestWrapper>
                    <WorldListView />
                </TestWrapper>,
            );

            // Act
            const searchInput = screen.getByPlaceholderText('Search worlds...');
            expect(searchInput).toBeInTheDocument();
            await user.type(searchInput, 'Middle');

            // Assert
            expect(screen.getByText('Middle Earth')).toBeInTheDocument();
            expect(screen.queryByText('Forgotten Realms')).not.toBeInTheDocument();
            expect(screen.queryByText('Ravnica')).not.toBeInTheDocument();
        });

        it('should filter worlds by published status', async () => {
            // Arrange
            const user = userEvent.setup();

            render(
                <TestWrapper>
                    <WorldListView />
                </TestWrapper>,
            );

            // Act - open status filter and select "Draft"
            const statusSelect = screen.getByLabelText('Status');
            expect(statusSelect).toBeInTheDocument();
            await user.click(statusSelect);

            // Select "Draft" from dropdown
            const draftOption = await screen.findByRole('option', { name: /draft/i });
            await user.click(draftOption);

            // Assert - only draft (not published) worlds should be visible
            expect(screen.queryByText('Middle Earth')).not.toBeInTheDocument(); // published
            expect(screen.getByText('Forgotten Realms')).toBeInTheDocument(); // draft
            expect(screen.queryByText('Ravnica')).not.toBeInTheDocument(); // published
        });
    });

    describe('create flow', () => {
        it('should call createWorld and navigate on successful create', async () => {
            // Arrange
            const user = userEvent.setup();
            const mockUnwrap = vi.fn().mockResolvedValue({ id: 'new-world-123', name: 'Untitled World' });
            mockCreateWorld.mockReturnValue({ unwrap: mockUnwrap });

            render(
                <TestWrapper>
                    <WorldListView />
                </TestWrapper>,
            );

            // Act
            const createButton = screen.getByRole('button', { name: /create new world/i });
            await user.click(createButton);

            // Assert
            await waitFor(() => {
                expect(mockCreateWorld).toHaveBeenCalledWith({
                    name: 'Untitled World',
                    description: 'A new world.',
                });
            });
            await waitFor(() => {
                expect(mockNavigate).toHaveBeenCalledWith('/worlds/new-world-123');
            });
        });

        it('should show error snackbar on create failure', async () => {
            // Arrange
            const user = userEvent.setup();
            const mockUnwrap = vi.fn().mockRejectedValue(new Error('Create failed'));
            mockCreateWorld.mockReturnValue({ unwrap: mockUnwrap });

            render(
                <TestWrapper>
                    <WorldListView />
                </TestWrapper>,
            );

            // Act
            const createButton = screen.getByRole('button', { name: /create new world/i });
            await user.click(createButton);

            // Assert
            await waitFor(() => {
                expect(screen.getByText(/failed to create world/i)).toBeInTheDocument();
            });
            expect(mockNavigate).not.toHaveBeenCalled();
        });
    });

    describe('delete flow', () => {
        it('should open delete dialog when delete is clicked', async () => {
            // Arrange
            const user = userEvent.setup();

            render(
                <TestWrapper>
                    <WorldListView />
                </TestWrapper>,
            );

            // Act - find and click Delete button for first world
            const deleteButtons = screen.getAllByRole('button', { name: /delete/i });
            await user.click(deleteButtons[0]!);

            // Assert
            expect(screen.getByRole('dialog')).toBeInTheDocument();
            expect(screen.getByText(/are you sure you want to delete this world/i)).toBeInTheDocument();
        });

        it('should call deleteWorld on confirm', async () => {
            // Arrange
            const user = userEvent.setup();
            const mockUnwrap = vi.fn().mockResolvedValue(undefined);
            mockDeleteWorld.mockReturnValue({ unwrap: mockUnwrap });

            render(
                <TestWrapper>
                    <WorldListView />
                </TestWrapper>,
            );

            // Act - open delete dialog
            const deleteButtons = screen.getAllByRole('button', { name: /delete/i });
            await user.click(deleteButtons[0]!);

            // Confirm deletion
            const dialog = screen.getByRole('dialog');
            const confirmButton = within(dialog).getByRole('button', { name: /delete/i });
            await user.click(confirmButton);

            // Assert
            await waitFor(() => {
                expect(mockDeleteWorld).toHaveBeenCalledWith('world-1');
            });
        });

        it('should close dialog on cancel', async () => {
            // Arrange
            const user = userEvent.setup();

            render(
                <TestWrapper>
                    <WorldListView />
                </TestWrapper>,
            );

            // Act - open delete dialog
            const deleteButtons = screen.getAllByRole('button', { name: /delete/i });
            await user.click(deleteButtons[0]!);

            // Cancel deletion
            const cancelButton = screen.getByRole('button', { name: /cancel/i });
            await user.click(cancelButton);

            // Assert
            await waitFor(() => {
                expect(screen.queryByRole('dialog')).not.toBeInTheDocument();
            });
            expect(mockDeleteWorld).not.toHaveBeenCalled();
        });
    });

    describe('duplicate flow', () => {
        it('should call cloneWorld on duplicate', async () => {
            // Arrange
            const user = userEvent.setup();
            const mockUnwrap = vi.fn().mockResolvedValue({ id: 'cloned-world-id', name: 'Cloned World' });
            mockCloneWorld.mockReturnValue({ unwrap: mockUnwrap });

            render(
                <TestWrapper>
                    <WorldListView />
                </TestWrapper>,
            );

            // Act
            const duplicateButtons = screen.getAllByRole('button', { name: /duplicate/i });
            await user.click(duplicateButtons[0]!);

            // Assert
            await waitFor(() => {
                expect(mockCloneWorld).toHaveBeenCalledWith({ id: 'world-1' });
            });
            await waitFor(() => {
                expect(screen.getByText(/world duplicated successfully/i)).toBeInTheDocument();
            });
        });

        it('should show error snackbar on duplicate failure', async () => {
            // Arrange
            const user = userEvent.setup();
            const mockUnwrap = vi.fn().mockRejectedValue(new Error('Clone failed'));
            mockCloneWorld.mockReturnValue({ unwrap: mockUnwrap });

            render(
                <TestWrapper>
                    <WorldListView />
                </TestWrapper>,
            );

            // Act
            const duplicateButtons = screen.getAllByRole('button', { name: /duplicate/i });
            await user.click(duplicateButtons[0]!);

            // Assert
            await waitFor(() => {
                expect(screen.getByText(/failed to duplicate world/i)).toBeInTheDocument();
            });
        });
    });

    describe('navigation', () => {
        it('should navigate to world detail on card open', async () => {
            // Arrange
            const user = userEvent.setup();

            render(
                <TestWrapper>
                    <WorldListView />
                </TestWrapper>,
            );

            // Act
            const openButtons = screen.getAllByRole('button', { name: /open/i });
            await user.click(openButtons[0]!);

            // Assert
            expect(mockNavigate).toHaveBeenCalledWith('/worlds/world-1');
        });
    });

    describe('error handling', () => {
        it('should show error alert when query fails', () => {
            // Arrange
            mockUseGetWorldsQuery.mockReturnValue({
                data: [],
                isLoading: false,
                error: new Error('Failed to load'),
            });

            // Act
            render(
                <TestWrapper>
                    <WorldListView />
                </TestWrapper>,
            );

            // Assert
            expect(screen.getByRole('alert')).toBeInTheDocument();
            expect(screen.getByText(/failed to load worlds/i)).toBeInTheDocument();
        });
    });
});
