import { createTheme, ThemeProvider } from '@mui/material/styles';
import { render, screen, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import React from 'react';
import { beforeEach, describe, expect, it, vi, type Mock } from 'vitest';
import { useNavigate } from 'react-router-dom';
import {
    useCloneAdventureMutation,
    useCreateAdventureMutation,
    useCreateEncounterMutation,
    useDeleteAdventureMutation,
} from '@/services/adventuresApi';
import { useGetContentQuery } from '@/services/contentApi';
import { useDebounce, useInfiniteScroll } from '../../hooks';
import type { Adventure } from '../../types';
import { AdventureStyle, ContentType } from '../../types';
import { AdventureListView } from './AdventureListView';

// Mock dependencies
vi.mock('react-router-dom', () => ({
    useNavigate: vi.fn<() => (to: string) => void>(),
}));

vi.mock('@/services/adventuresApi', () => ({
    useCreateAdventureMutation: vi.fn<() => [() => Promise<unknown>, { isLoading: boolean }]>(),
    useCreateEncounterMutation: vi.fn<() => [() => Promise<unknown>, { isLoading: boolean }]>(),
    useDeleteAdventureMutation: vi.fn<() => [() => Promise<unknown>, { isLoading: boolean }]>(),
    useCloneAdventureMutation: vi.fn<() => [() => Promise<unknown>, { isLoading: boolean }]>(),
}));

vi.mock('@/services/contentApi', () => ({
    useGetContentQuery: vi.fn<() => unknown>(),
}));

vi.mock('../../hooks', () => ({
    useDebounce: vi.fn((value) => value),
    useInfiniteScroll: vi.fn(() => ({ sentinelRef: { current: null } })),
}));

vi.mock('./AdventureCard', () => ({
    AdventureCard: vi.fn(({ adventure, onOpen, onDuplicate, onDelete }) => (
        <div data-mock="AdventureCard">
            <span>{adventure.name}</span>
            <button onClick={() => onOpen(adventure.id)}>Open</button>
            <button onClick={() => onDuplicate(adventure.id)}>Duplicate</button>
            <button onClick={() => onDelete(adventure.id)}>Delete</button>
        </div>
    )),
}));

const TestWrapper: React.FC<{ children: React.ReactNode }> = ({ children }) => {
    const theme = createTheme({ palette: { mode: 'light' } });
    return <ThemeProvider theme={theme}>{children}</ThemeProvider>;
};
TestWrapper.displayName = 'TestWrapper';

describe('AdventureListView', () => {
    const mockNavigate = vi.fn<(to: string) => void>();
    const mockCreateAdventure = vi.fn<() => Promise<unknown>>();
    const mockDeleteAdventure = vi.fn<(id: string) => Promise<unknown>>();
    const mockCloneAdventure = vi.fn<(id: string) => Promise<unknown>>();

    const mockAdventures: Adventure[] = [
        {
            id: 'adventure-1',
            type: ContentType.Adventure,
            name: 'Dragon Lair',
            description: 'Epic adventure',
            isPublished: false,
            ownerId: 'user-1',
            style: AdventureStyle.DungeonCrawl,
            isOneShot: false,
            encounterCount: 5,
            background: null,
        },
        {
            id: 'adventure-2',
            type: ContentType.Adventure,
            name: 'Forest Quest',
            description: 'Nature adventure',
            isPublished: true,
            ownerId: 'user-1',
            style: AdventureStyle.OpenWorld,
            isOneShot: true,
            encounterCount: 3,
            background: null,
        },
    ];

    beforeEach(() => {
        vi.clearAllMocks();

        // Setup default mocks
        (useNavigate as Mock).mockReturnValue(mockNavigate);

        (useCreateAdventureMutation as Mock).mockReturnValue([
            mockCreateAdventure,
            { isLoading: false },
        ]);

        (useCreateEncounterMutation as Mock).mockReturnValue([
            vi.fn(),
            { isLoading: false },
        ]);

        (useDeleteAdventureMutation as Mock).mockReturnValue([
            mockDeleteAdventure,
            { isLoading: false },
        ]);

        (useCloneAdventureMutation as Mock).mockReturnValue([
            mockCloneAdventure,
            { isLoading: false },
        ]);

        (useGetContentQuery as Mock).mockReturnValue({
            data: { data: mockAdventures, hasMore: false, nextCursor: null },
            isLoading: false,
            isFetching: false,
            error: null,
        });

        (useDebounce as Mock).mockImplementation((value) => value);
        (useInfiniteScroll as Mock).mockReturnValue({ sentinelRef: { current: null } });
    });

    describe('rendering', () => {
        it('should render title "Adventures"', () => {
            // Arrange & Act
            render(
                <TestWrapper>
                    <AdventureListView />
                </TestWrapper>,
            );

            // Assert
            expect(screen.getByRole('heading', { name: 'Adventures' })).toBeInTheDocument();
        });

        it('should render "New Adventure" button', () => {
            // Arrange & Act
            render(
                <TestWrapper>
                    <AdventureListView />
                </TestWrapper>,
            );

            // Assert
            expect(screen.getByRole('button', { name: /create new adventure/i })).toBeInTheDocument();
            expect(screen.getByText('New Adventure')).toBeInTheDocument();
        });

        it('should render search input and filter dropdowns', () => {
            // Arrange & Act
            render(
                <TestWrapper>
                    <AdventureListView />
                </TestWrapper>,
            );

            // Assert
            expect(screen.getByPlaceholderText('Search adventures...')).toBeInTheDocument();
            expect(screen.getByLabelText('Type')).toBeInTheDocument();
            expect(screen.getByLabelText('Style')).toBeInTheDocument();
            expect(screen.getByLabelText('Status')).toBeInTheDocument();
            expect(screen.getByLabelText('Ownership')).toBeInTheDocument();
        });
    });

    describe('loading state', () => {
        it('should show loading message when isLoading is true', () => {
            // Arrange
            (useGetContentQuery as Mock).mockReturnValue({
                data: null,
                isLoading: true,
                isFetching: false,
                error: null,
            });

            // Act
            render(
                <TestWrapper>
                    <AdventureListView />
                </TestWrapper>,
            );

            // Assert
            expect(screen.getByText('Loading adventures...')).toBeInTheDocument();
        });
    });

    describe('empty states', () => {
        it('should show empty state when no adventures and no search query', () => {
            // Arrange
            (useGetContentQuery as Mock).mockReturnValue({
                data: { data: [], hasMore: false, nextCursor: null },
                isLoading: false,
                isFetching: false,
                error: null,
            });

            // Act
            render(
                <TestWrapper>
                    <AdventureListView />
                </TestWrapper>,
            );

            // Assert
            expect(screen.getByText('No adventures yet')).toBeInTheDocument();
            expect(screen.getByText('Create your first adventure to get started')).toBeInTheDocument();
            expect(screen.getByRole('button', { name: /Create Adventure/i })).toBeInTheDocument();
        });

        it('should show no results state when no adventures but search query exists', async () => {
            // Arrange
            const user = userEvent.setup();
            (useGetContentQuery as Mock).mockReturnValue({
                data: { data: [], hasMore: false, nextCursor: null },
                isLoading: false,
                isFetching: false,
                error: null,
            });

            // Act
            render(
                <TestWrapper>
                    <AdventureListView />
                </TestWrapper>,
            );

            const searchInput = screen.getByPlaceholderText('Search adventures...') as HTMLInputElement;
            await user.type(searchInput, 'nonexistent');

            // Assert
            expect(screen.getByText('No adventures found')).toBeInTheDocument();
            expect(screen.getByText('Try adjusting your search or filters')).toBeInTheDocument();
        });
    });

    describe('data display', () => {
        it('should render AdventureCard for each adventure', () => {
            // Arrange & Act
            render(
                <TestWrapper>
                    <AdventureListView />
                </TestWrapper>,
            );

            // Assert
            expect(screen.getByText('Dragon Lair')).toBeInTheDocument();
            expect(screen.getByText('Forest Quest')).toBeInTheDocument();
        });
    });

    describe('create flow', () => {
        it('should call createAdventure and navigate on successful create', async () => {
            // Arrange
            const user = userEvent.setup();
            const createdAdventure = { id: 'new-adventure-id' };
            mockCreateAdventure.mockReturnValue({
                unwrap: () => Promise.resolve(createdAdventure),
            });

            // Act
            render(
                <TestWrapper>
                    <AdventureListView />
                </TestWrapper>,
            );

            const createButton = screen.getByRole('button', { name: /create new adventure/i });
            await user.click(createButton);

            // Assert
            await waitFor(() => {
                expect(mockCreateAdventure).toHaveBeenCalledWith({
                    name: 'Untitled Adventure',
                    description: 'A new adventure.',
                    style: AdventureStyle.Generic,
                    isOneShot: false,
                });
            });
            await waitFor(() => {
                expect(mockNavigate).toHaveBeenCalledWith('/adventures/new-adventure-id');
            });
        });

        it('should disable button and show "Creating..." while creating', async () => {
            // Arrange
            const user = userEvent.setup();
            let resolveCreate: (value: unknown) => void;
            const createPromise = new Promise((resolve) => {
                resolveCreate = resolve;
            });
            mockCreateAdventure.mockReturnValue({
                unwrap: () => createPromise,
            });

            // Act
            render(
                <TestWrapper>
                    <AdventureListView />
                </TestWrapper>,
            );

            const createButton = screen.getByRole('button', { name: /create new adventure/i });
            await user.click(createButton);

            // Assert - Button should be disabled and show "Creating..."
            await waitFor(() => {
                expect(screen.getByText('Creating...')).toBeInTheDocument();
            });
            expect(createButton).toBeDisabled();

            // Cleanup - resolve the promise
            resolveCreate!({ id: 'test' });
        });

        it('should show error snackbar on create failure', async () => {
            // Arrange
            const user = userEvent.setup();
            mockCreateAdventure.mockReturnValue({
                unwrap: () => Promise.reject(new Error('Create failed')),
            });

            // Act
            render(
                <TestWrapper>
                    <AdventureListView />
                </TestWrapper>,
            );

            const createButton = screen.getByRole('button', { name: /create new adventure/i });
            await user.click(createButton);

            // Assert
            await waitFor(() => {
                expect(screen.getByText('Failed to create adventure. Please try again.')).toBeInTheDocument();
            });
        });
    });

    describe('delete flow', () => {
        it('should open delete dialog when delete is clicked', async () => {
            // Arrange
            const user = userEvent.setup();

            // Act
            render(
                <TestWrapper>
                    <AdventureListView />
                </TestWrapper>,
            );

            const deleteButtons = screen.getAllByRole('button', { name: 'Delete' });
            await user.click(deleteButtons[0]);

            // Assert
            expect(screen.getByRole('dialog')).toBeInTheDocument();
            expect(screen.getByText('Delete Adventure')).toBeInTheDocument();
            expect(screen.getByText(/Are you sure you want to delete this adventure/)).toBeInTheDocument();
        });

        it('should call deleteAdventure on confirm', async () => {
            // Arrange
            const user = userEvent.setup();
            mockDeleteAdventure.mockReturnValue({
                unwrap: () => Promise.resolve(),
            });

            // Act
            render(
                <TestWrapper>
                    <AdventureListView />
                </TestWrapper>,
            );

            const deleteButtons = screen.getAllByRole('button', { name: 'Delete' });
            await user.click(deleteButtons[0]);

            const confirmButton = screen.getByRole('button', { name: /^delete$/i });
            await user.click(confirmButton);

            // Assert
            await waitFor(() => {
                expect(mockDeleteAdventure).toHaveBeenCalledWith('adventure-1');
            });
        });

        it('should close dialog on cancel', async () => {
            // Arrange
            const user = userEvent.setup();

            // Act
            render(
                <TestWrapper>
                    <AdventureListView />
                </TestWrapper>,
            );

            const deleteButtons = screen.getAllByRole('button', { name: 'Delete' });
            await user.click(deleteButtons[0]);

            const cancelButton = screen.getByRole('button', { name: /cancel/i });
            await user.click(cancelButton);

            // Assert
            await waitFor(() => {
                expect(screen.queryByRole('dialog')).not.toBeInTheDocument();
            });
        });

        it('should show success snackbar on successful delete', async () => {
            // Arrange
            const user = userEvent.setup();
            mockDeleteAdventure.mockReturnValue({
                unwrap: () => Promise.resolve(),
            });

            // Act
            render(
                <TestWrapper>
                    <AdventureListView />
                </TestWrapper>,
            );

            const deleteButtons = screen.getAllByRole('button', { name: 'Delete' });
            await user.click(deleteButtons[0]);

            const confirmButton = screen.getByRole('button', { name: /^delete$/i });
            await user.click(confirmButton);

            // Assert
            await waitFor(() => {
                expect(screen.getByText('Adventure deleted successfully')).toBeInTheDocument();
            });
        });

        it('should show error snackbar on delete failure', async () => {
            // Arrange
            const user = userEvent.setup();
            mockDeleteAdventure.mockReturnValue({
                unwrap: () => Promise.reject(new Error('Delete failed')),
            });

            // Act
            render(
                <TestWrapper>
                    <AdventureListView />
                </TestWrapper>,
            );

            const deleteButtons = screen.getAllByRole('button', { name: 'Delete' });
            await user.click(deleteButtons[0]);

            const confirmButton = screen.getByRole('button', { name: /^delete$/i });
            await user.click(confirmButton);

            // Assert
            await waitFor(() => {
                expect(screen.getByText('Failed to delete adventure. Please try again.')).toBeInTheDocument();
            });
        });
    });

    describe('duplicate flow', () => {
        it('should call cloneAdventure on duplicate', async () => {
            // Arrange
            const user = userEvent.setup();
            mockCloneAdventure.mockReturnValue({
                unwrap: () => Promise.resolve(),
            });

            // Act
            render(
                <TestWrapper>
                    <AdventureListView />
                </TestWrapper>,
            );

            const duplicateButtons = screen.getAllByRole('button', { name: 'Duplicate' });
            await user.click(duplicateButtons[0]);

            // Assert
            await waitFor(() => {
                expect(mockCloneAdventure).toHaveBeenCalledWith({ id: 'adventure-1' });
            });
        });

        it('should show success snackbar on successful duplicate', async () => {
            // Arrange
            const user = userEvent.setup();
            mockCloneAdventure.mockReturnValue({
                unwrap: () => Promise.resolve(),
            });

            // Act
            render(
                <TestWrapper>
                    <AdventureListView />
                </TestWrapper>,
            );

            const duplicateButtons = screen.getAllByRole('button', { name: 'Duplicate' });
            await user.click(duplicateButtons[0]);

            // Assert
            await waitFor(() => {
                expect(screen.getByText('Adventure duplicated successfully')).toBeInTheDocument();
            });
        });

        it('should show error snackbar on duplicate failure', async () => {
            // Arrange
            const user = userEvent.setup();
            mockCloneAdventure.mockReturnValue({
                unwrap: () => Promise.reject(new Error('Clone failed')),
            });

            // Act
            render(
                <TestWrapper>
                    <AdventureListView />
                </TestWrapper>,
            );

            const duplicateButtons = screen.getAllByRole('button', { name: 'Duplicate' });
            await user.click(duplicateButtons[0]);

            // Assert
            await waitFor(() => {
                expect(screen.getByText('Failed to duplicate adventure. Please try again.')).toBeInTheDocument();
            });
        });
    });

    describe('navigation', () => {
        it('should navigate to adventure detail on card open', async () => {
            // Arrange
            const user = userEvent.setup();

            // Act
            render(
                <TestWrapper>
                    <AdventureListView />
                </TestWrapper>,
            );

            const openButtons = screen.getAllByRole('button', { name: 'Open' });
            await user.click(openButtons[0]);

            // Assert
            expect(mockNavigate).toHaveBeenCalledWith('/adventures/adventure-1');
        });
    });

    describe('error handling', () => {
        it('should show error alert when query fails', () => {
            // Arrange
            (useGetContentQuery as Mock).mockReturnValue({
                data: null,
                isLoading: false,
                isFetching: false,
                error: { message: 'Network error' },
            });

            // Act
            render(
                <TestWrapper>
                    <AdventureListView />
                </TestWrapper>,
            );

            // Assert
            expect(screen.getByRole('alert')).toBeInTheDocument();
            expect(screen.getByText('Failed to load adventures. Please try again.')).toBeInTheDocument();
        });
    });

    describe('theme support', () => {
        it('should render correctly in dark mode', () => {
            // Arrange
            const darkTheme = createTheme({ palette: { mode: 'dark' } });

            // Act
            render(
                <ThemeProvider theme={darkTheme}>
                    <AdventureListView />
                </ThemeProvider>,
            );

            // Assert
            expect(screen.getByRole('heading', { name: 'Adventures' })).toBeInTheDocument();
        });

        it('should render correctly in light mode', () => {
            // Arrange
            const lightTheme = createTheme({ palette: { mode: 'light' } });

            // Act
            render(
                <ThemeProvider theme={lightTheme}>
                    <AdventureListView />
                </ThemeProvider>,
            );

            // Assert
            expect(screen.getByRole('heading', { name: 'Adventures' })).toBeInTheDocument();
        });
    });
});
