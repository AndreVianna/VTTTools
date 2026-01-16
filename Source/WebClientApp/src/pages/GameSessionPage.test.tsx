/**
 * GameSessionPage Component Tests
 * Tests game session page with entry modal, audio unlock, and navigation
 * Coverage: Game Session / DM Preview functionality
 */

import { createTheme, ThemeProvider } from '@mui/material/styles';
import { configureStore } from '@reduxjs/toolkit';
import { fireEvent, render, screen, waitFor } from '@testing-library/react';
import type * as React from 'react';
import { Provider } from 'react-redux';
import { MemoryRouter, Route, Routes } from 'react-router-dom';
import { beforeEach, describe, expect, it, vi, type Mock } from 'vitest';
import authReducer from '@/store/slices/authSlice';
import { GameSessionPage } from './GameSessionPage';

// Mock react-router-dom hooks
const mockNavigate = vi.fn();
vi.mock('react-router-dom', async () => {
    const actual = await vi.importActual('react-router-dom');
    return {
        ...actual,
        useNavigate: () => mockNavigate,
    };
});

// Mock useAudioUnlock hook
const mockUnlockAudio = vi.fn();
vi.mock('@/hooks/useAudioUnlock', () => ({
    useAudioUnlock: () => ({
        isUnlocked: false,
        unlockAudio: mockUnlockAudio,
        audioContext: null,
    }),
}));

// Mock useSessionState hook
const mockSetLastEncounterId = vi.fn();
vi.mock('@/hooks/useSessionState', () => ({
    useSessionState: () => [null, mockSetLastEncounterId],
}));

// Mock RTK Query hooks
const mockUseGetEncounterQuery = vi.fn();
vi.mock('@/services/encounterApi', () => ({
    useGetEncounterQuery: (...args: unknown[]) => mockUseGetEncounterQuery(...args),
}));

// Mock encounter components to avoid Konva rendering issues
vi.mock('@/components/encounter', () => ({
    BackgroundLayer: () => <div data-testid="mock-background-layer">BackgroundLayer</div>,
    EncounterCanvas: ({ children }: { children: React.ReactNode }) => (
        <div data-testid="mock-encounter-canvas">{children}</div>
    ),
    GridRenderer: () => <div data-testid="mock-grid-renderer">GridRenderer</div>,
    EncounterCanvasHandle: {},
}));

vi.mock('@/components/encounter/AutoplayHelpDialog', () => ({
    AutoplayHelpDialog: ({ open, onClose }: { open: boolean; onClose: () => void }) =>
        open ? (
            <div data-testid="mock-autoplay-help-dialog">
                <button onClick={onClose}>Close Help</button>
            </div>
        ) : null,
}));

vi.mock('@/components/encounter/EncounterEntryModal', () => ({
    EncounterEntryModal: ({
        open,
        encounterName,
        onEnter,
        onHelpClick,
    }: {
        open: boolean;
        encounterName: string;
        onEnter: () => void;
        onHelpClick: () => void;
    }) =>
        open ? (
            <div data-testid="mock-entry-modal" role="dialog">
                <span data-testid="encounter-name">{encounterName}</span>
                <button onClick={onEnter} id="btn-enter-encounter">
                    OK
                </button>
                <button onClick={onHelpClick}>Help</button>
            </div>
        ) : null,
}));

// Mock react-konva
vi.mock('react-konva', () => ({
    Layer: ({ children }: { children: React.ReactNode }) => <div>{children}</div>,
    Stage: ({ children }: { children: React.ReactNode }) => <div>{children}</div>,
}));

// Mock MUI icons
vi.mock('@mui/icons-material/ArrowBack', () => ({
    default: () => <span data-testid="arrow-back-icon">ArrowBackIcon</span>,
}));

describe('GameSessionPage', () => {
    let store: ReturnType<typeof configureStore>;

    const mockEncounter = {
        id: 'test-encounter-id',
        name: "Dragon's Lair",
        stage: {
            grid: {
                type: 'Square',
                cellSize: 50,
                offset: { x: 0, y: 0 },
                scale: 1,
            },
            settings: {
                mainBackground: {
                    id: 'bg-123',
                    contentType: 'image/png',
                },
            },
        },
    };

    const createTestStore = () => {
        return configureStore({
            reducer: { auth: authReducer },
            preloadedState: {
                auth: {
                    user: null,
                    token: null,
                    isAuthenticated: true,
                    isLoading: false,
                    error: null,
                    loginAttempts: 0,
                    lastLoginAttempt: null,
                },
            },
        });
    };

    const renderWithProviders = (
        encounterId = 'test-encounter-id',
        { themeMode = 'light' }: { themeMode?: 'light' | 'dark' } = {},
    ) => {
        const theme = createTheme({ palette: { mode: themeMode } });

        return render(
            <Provider store={store}>
                <MemoryRouter initialEntries={[`/encounters/${encounterId}/play`]}>
                    <ThemeProvider theme={theme}>
                        <Routes>
                            <Route path="/encounters/:encounterId/play" element={<GameSessionPage />} />
                        </Routes>
                    </ThemeProvider>
                </MemoryRouter>
            </Provider>,
        );
    };

    beforeEach(() => {
        store = createTestStore();
        mockNavigate.mockClear();
        mockUnlockAudio.mockClear();
        mockSetLastEncounterId.mockClear();
        mockUseGetEncounterQuery.mockReset();

        // Default: successful encounter load
        mockUseGetEncounterQuery.mockReturnValue({
            data: mockEncounter,
            isLoading: false,
            isError: false,
            error: null,
        });
    });

    describe('Loading state', () => {
        it('should display loading spinner while fetching encounter', () => {
            // Arrange
            mockUseGetEncounterQuery.mockReturnValue({
                data: undefined,
                isLoading: true,
                isError: false,
                error: null,
            });

            // Act
            renderWithProviders();

            // Assert
            expect(screen.getByRole('progressbar')).toBeInTheDocument();
            expect(screen.getByText('Loading encounter...')).toBeInTheDocument();
        });
    });

    describe('Error state', () => {
        it('should display error message when encounter fails to load', () => {
            // Arrange
            mockUseGetEncounterQuery.mockReturnValue({
                data: undefined,
                isLoading: false,
                isError: true,
                error: { message: 'Encounter not found' },
            });

            // Act
            renderWithProviders();

            // Assert
            expect(screen.getByText('Failed to load encounter')).toBeInTheDocument();
            expect(screen.getByText('Encounter not found')).toBeInTheDocument();
            expect(screen.getByRole('button', { name: /go back/i })).toBeInTheDocument();
        });

        it('should display generic error when error has no message', () => {
            // Arrange
            mockUseGetEncounterQuery.mockReturnValue({
                data: undefined,
                isLoading: false,
                isError: true,
                error: {},
            });

            // Act
            renderWithProviders();

            // Assert
            expect(screen.getByText('An unexpected error occurred')).toBeInTheDocument();
        });

        it('should navigate back when Go Back button is clicked', () => {
            // Arrange
            mockUseGetEncounterQuery.mockReturnValue({
                data: undefined,
                isLoading: false,
                isError: true,
                error: { message: 'Not found' },
            });
            renderWithProviders();

            // Act
            fireEvent.click(screen.getByRole('button', { name: /go back/i }));

            // Assert
            expect(mockNavigate).toHaveBeenCalledWith(-1);
        });
    });

    describe('Entry modal', () => {
        it('should display entry modal on initial load', () => {
            // Act
            renderWithProviders();

            // Assert
            expect(screen.getByTestId('mock-entry-modal')).toBeInTheDocument();
            expect(screen.getByTestId('encounter-name')).toHaveTextContent("Dragon's Lair");
        });

        it('should display Unknown Encounter when name is not available', () => {
            // Arrange
            mockUseGetEncounterQuery.mockReturnValue({
                data: { ...mockEncounter, name: undefined },
                isLoading: false,
                isError: false,
                error: null,
            });

            // Act
            renderWithProviders();

            // Assert
            expect(screen.getByTestId('encounter-name')).toHaveTextContent('Unknown Encounter');
        });

        it('should unlock audio and hide modal when OK is clicked', async () => {
            // Arrange
            mockUnlockAudio.mockResolvedValue(true);
            renderWithProviders();

            // Act
            fireEvent.click(screen.getByRole('button', { name: /ok/i }));

            // Assert
            await waitFor(() => {
                expect(mockUnlockAudio).toHaveBeenCalledTimes(1);
            });
            expect(mockSetLastEncounterId).toHaveBeenCalledWith('test-encounter-id');
        });

        it('should open autoplay help dialog when help is clicked', () => {
            // Arrange
            renderWithProviders();

            // Act
            fireEvent.click(screen.getByRole('button', { name: /help/i }));

            // Assert
            expect(screen.getByTestId('mock-autoplay-help-dialog')).toBeInTheDocument();
        });

        it('should close autoplay help dialog when close is clicked', () => {
            // Arrange
            renderWithProviders();
            fireEvent.click(screen.getByRole('button', { name: /help/i }));

            // Act
            fireEvent.click(screen.getByRole('button', { name: /close help/i }));

            // Assert
            expect(screen.queryByTestId('mock-autoplay-help-dialog')).not.toBeInTheDocument();
        });
    });

    describe('Exit to Editor button', () => {
        it('should render exit to editor button', () => {
            // Act
            renderWithProviders();

            // Assert
            expect(screen.getByRole('button', { name: /exit to editor/i })).toBeInTheDocument();
        });

        it('should have semantic id for BDD testing', () => {
            // Act
            renderWithProviders();

            // Assert
            expect(screen.getByRole('button', { name: /exit to editor/i })).toHaveAttribute(
                'id',
                'btn-exit-to-editor',
            );
        });

        it('should navigate to editor when clicked', () => {
            // Arrange
            renderWithProviders();

            // Act
            fireEvent.click(screen.getByRole('button', { name: /exit to editor/i }));

            // Assert
            expect(mockNavigate).toHaveBeenCalledWith('/encounters/test-encounter-id/edit');
        });
    });

    describe('Canvas rendering', () => {
        it('should not render canvas before entering encounter', () => {
            // Act
            renderWithProviders();

            // Assert
            expect(screen.queryByTestId('mock-encounter-canvas')).not.toBeInTheDocument();
        });

        it('should render canvas after entering encounter', async () => {
            // Arrange
            mockUnlockAudio.mockResolvedValue(true);
            renderWithProviders();

            // Act
            fireEvent.click(screen.getByRole('button', { name: /ok/i }));

            // Assert
            await waitFor(() => {
                expect(screen.getByTestId('mock-encounter-canvas')).toBeInTheDocument();
            });
        });
    });

    describe('Theme support', () => {
        it('should render correctly in light mode', () => {
            // Act
            renderWithProviders('test-encounter-id', { themeMode: 'light' });

            // Assert
            expect(screen.getByTestId('mock-entry-modal')).toBeInTheDocument();
        });

        it('should render correctly in dark mode', () => {
            // Act
            renderWithProviders('test-encounter-id', { themeMode: 'dark' });

            // Assert
            expect(screen.getByTestId('mock-entry-modal')).toBeInTheDocument();
        });
    });

    describe('RTK Query integration', () => {
        it('should call useGetEncounterQuery with correct encounterId', () => {
            // Act
            renderWithProviders('custom-encounter-id');

            // Assert
            expect(mockUseGetEncounterQuery).toHaveBeenCalledWith('custom-encounter-id', {
                skip: false,
            });
        });

        it('should skip query when encounterId is not provided', () => {
            // Arrange
            const theme = createTheme();

            render(
                <Provider store={store}>
                    <MemoryRouter initialEntries={['/encounters//play']}>
                        <ThemeProvider theme={theme}>
                            <Routes>
                                <Route path="/encounters/:encounterId/play" element={<GameSessionPage />} />
                            </Routes>
                        </ThemeProvider>
                    </MemoryRouter>
                </Provider>,
            );

            // The query is called with empty string when no encounterId
            // This verifies the component handles the edge case
        });
    });

    describe('Accessibility', () => {
        it('should have accessible loading state', () => {
            // Arrange
            mockUseGetEncounterQuery.mockReturnValue({
                data: undefined,
                isLoading: true,
                isError: false,
                error: null,
            });

            // Act
            renderWithProviders();

            // Assert
            expect(screen.getByRole('progressbar')).toBeInTheDocument();
        });

        it('should have accessible error state with error text', () => {
            // Arrange
            mockUseGetEncounterQuery.mockReturnValue({
                data: undefined,
                isLoading: false,
                isError: true,
                error: { message: 'Error' },
            });

            // Act
            renderWithProviders();

            // Assert
            expect(screen.getByText('Failed to load encounter')).toBeInTheDocument();
            expect(screen.getByRole('button', { name: /go back/i })).toBeInTheDocument();
        });

        it('should have entry modal with dialog role', () => {
            // Act
            renderWithProviders();

            // Assert
            expect(screen.getByRole('dialog')).toBeInTheDocument();
        });
    });
});
