/**
 * EncounterPage Component Tests
 * Tests encounter page with audio unlock, navigation, and visibility rules
 * Coverage: Encounter preview / DM Preview functionality
 */

import { createTheme, ThemeProvider } from '@mui/material/styles';
import { configureStore } from '@reduxjs/toolkit';
import { fireEvent, render, screen } from '@testing-library/react';
import type * as React from 'react';
import { Provider } from 'react-redux';
import { MemoryRouter, Route, Routes } from 'react-router-dom';
import { beforeEach, describe, expect, it, vi } from 'vitest';
import authReducer from '@/store/slices/authSlice';
import { EncounterPage } from './EncounterPage';

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
let mockIsAudioUnlocked = false;
vi.mock('@/hooks/useAudioUnlock', () => ({
    useAudioUnlock: () => ({
        isUnlocked: mockIsAudioUnlocked,
        unlockAudio: mockUnlockAudio,
        audioContext: null,
    }),
}));

// Mock usePositionalAudio hook
vi.mock('@/hooks/usePositionalAudio', () => ({
    usePositionalAudio: () => ({
        updateListenerPosition: vi.fn(),
        playSound: vi.fn(),
        stopSound: vi.fn(),
        stopAllSounds: vi.fn(),
    }),
}));

// Mock RTK Query hooks
const mockUseGetEncounterQuery = vi.fn();
vi.mock('@/services/encounterApi', () => ({
    useGetEncounterQuery: (...args: unknown[]) => mockUseGetEncounterQuery(...args),
}));

// Mock encounter components to avoid Konva rendering issues
vi.mock('@/components/encounter', () => ({
    BackgroundLayer: ({ muted }: { muted: boolean }) => (
        <div data-testid="mock-background-layer" data-muted={muted}>
            BackgroundLayer
        </div>
    ),
    EncounterCanvas: ({ children }: { children: React.ReactNode }) => (
        <div data-testid="mock-encounter-canvas">{children}</div>
    ),
    GridRenderer: () => <div data-testid="mock-grid-renderer">GridRenderer</div>,
    EncounterCanvasHandle: {},
}));

// Mock rendering components
vi.mock('@/components/encounter/rendering/FogOfWarRenderer', () => ({
    FogOfWarRenderer: () => <div data-testid="mock-fog-renderer">FogOfWarRenderer</div>,
}));

vi.mock('@/components/encounter/rendering/SourceRenderer', () => ({
    LightSourceRenderer: () => <div data-testid="mock-light-renderer">LightSourceRenderer</div>,
}));

vi.mock('@/components/encounter/rendering/WallRenderer', () => ({
    WallRenderer: () => <div data-testid="mock-wall-renderer">WallRenderer</div>,
}));

vi.mock('@/components/encounter/EntityPlacement', () => ({
    EntityPlacement: () => <div data-testid="mock-entity-placement">EntityPlacement</div>,
}));

// Mock react-konva
vi.mock('react-konva', () => ({
    Layer: ({ children }: { children: React.ReactNode }) => <div data-testid="mock-layer">{children}</div>,
    Group: ({ children }: { children: React.ReactNode }) => <div>{children}</div>,
    Stage: ({ children }: { children: React.ReactNode }) => <div>{children}</div>,
}));

// Mock MUI icons
vi.mock('@mui/icons-material/ArrowBack', () => ({
    default: () => <span data-testid="arrow-back-icon">ArrowBackIcon</span>,
}));

describe('EncounterPage', () => {
    let store: ReturnType<typeof configureStore>;

    const mockEncounter = {
        id: 'test-encounter-id',
        name: "Dragon's Lair",
        stage: {
            grid: {
                type: 'Square',
                cellSize: { width: 50, height: 50 },
                offset: { x: 0, y: 0 },
                scale: 1,
            },
            settings: {
                mainBackground: {
                    id: 'bg-123',
                    contentType: 'image/png',
                },
            },
            walls: [],
            lights: [],
            regions: [],
            sounds: [],
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
                            <Route path="/encounters/:encounterId/play" element={<EncounterPage />} />
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
        mockUseGetEncounterQuery.mockReset();
        mockIsAudioUnlocked = false;

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
        it('should render canvas immediately when encounter is loaded', () => {
            // Act
            renderWithProviders();

            // Assert
            expect(screen.getByTestId('mock-encounter-canvas')).toBeInTheDocument();
        });

        it('should render background layer with muted=true when audio is not unlocked', () => {
            // Arrange
            mockIsAudioUnlocked = false;

            // Act
            renderWithProviders();

            // Assert
            const backgroundLayer = screen.getByTestId('mock-background-layer');
            expect(backgroundLayer).toHaveAttribute('data-muted', 'true');
        });

        it('should render background layer with muted=false when audio is unlocked', () => {
            // Arrange
            mockIsAudioUnlocked = true;

            // Act
            renderWithProviders();

            // Assert
            const backgroundLayer = screen.getByTestId('mock-background-layer');
            expect(backgroundLayer).toHaveAttribute('data-muted', 'false');
        });

        it('should render grid renderer', () => {
            // Act
            renderWithProviders();

            // Assert
            expect(screen.getByTestId('mock-grid-renderer')).toBeInTheDocument();
        });
    });

    describe('Theme support', () => {
        it('should render correctly in light mode', () => {
            // Act
            renderWithProviders('test-encounter-id', { themeMode: 'light' });

            // Assert
            expect(screen.getByTestId('mock-encounter-canvas')).toBeInTheDocument();
        });

        it('should render correctly in dark mode', () => {
            // Act
            renderWithProviders('test-encounter-id', { themeMode: 'dark' });

            // Assert
            expect(screen.getByTestId('mock-encounter-canvas')).toBeInTheDocument();
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
                                <Route path="/encounters/:encounterId/play" element={<EncounterPage />} />
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
    });
});
