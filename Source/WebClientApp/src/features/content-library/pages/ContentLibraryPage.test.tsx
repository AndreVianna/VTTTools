import { createTheme, ThemeProvider } from '@mui/material/styles';
import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import React from 'react';
import { beforeEach, describe, expect, it, vi } from 'vitest';
import { ContentLibraryPage } from './ContentLibraryPage';

// Mock react-router-dom
const mockNavigate = vi.fn<(to: string) => void>();
const mockUseLocation = vi.fn<() => { pathname: string }>();

vi.mock('react-router-dom', () => ({
    useNavigate: () => mockNavigate,
    useLocation: () => mockUseLocation(),
    Outlet: vi.fn<() => React.ReactElement>(() => <div data-mock="Outlet">Outlet Content</div>),
}));

const TestWrapper: React.FC<{ children: React.ReactNode }> = ({ children }) => {
    const theme = createTheme({ palette: { mode: 'light' } });
    return <ThemeProvider theme={theme}>{children}</ThemeProvider>;
};
TestWrapper.displayName = 'TestWrapper';

describe('ContentLibraryPage', () => {
    beforeEach(() => {
        vi.clearAllMocks();
        mockUseLocation.mockReturnValue({ pathname: '/content-library/adventures' });
    });

    describe('rendering', () => {
        it('should render Library title', () => {
            // Arrange & Act
            render(
                <TestWrapper>
                    <ContentLibraryPage />
                </TestWrapper>,
            );

            // Assert
            expect(screen.getByRole('heading', { name: /library/i })).toBeInTheDocument();
        });

        it('should render Worlds, Campaigns, Adventures tabs', () => {
            // Arrange & Act
            render(
                <TestWrapper>
                    <ContentLibraryPage />
                </TestWrapper>,
            );

            // Assert
            expect(screen.getByRole('tab', { name: /worlds/i })).toBeInTheDocument();
            expect(screen.getByRole('tab', { name: /campaigns/i })).toBeInTheDocument();
            expect(screen.getByRole('tab', { name: /adventures/i })).toBeInTheDocument();
        });

        it('should render Outlet component', () => {
            // Arrange & Act
            render(
                <TestWrapper>
                    <ContentLibraryPage />
                </TestWrapper>,
            );

            // Assert
            expect(screen.getByText('Outlet Content')).toBeInTheDocument();
        });
    });

    describe('tab selection based on pathname', () => {
        it('should select Worlds tab when pathname is /content-library/worlds', () => {
            // Arrange
            mockUseLocation.mockReturnValue({ pathname: '/content-library/worlds' });

            // Act
            render(
                <TestWrapper>
                    <ContentLibraryPage />
                </TestWrapper>,
            );

            // Assert
            const worldsTab = screen.getByRole('tab', { name: /worlds/i });
            expect(worldsTab).toHaveAttribute('aria-selected', 'true');
        });

        it('should select Campaigns tab when pathname is /content-library/campaigns', () => {
            // Arrange
            mockUseLocation.mockReturnValue({ pathname: '/content-library/campaigns' });

            // Act
            render(
                <TestWrapper>
                    <ContentLibraryPage />
                </TestWrapper>,
            );

            // Assert
            const campaignsTab = screen.getByRole('tab', { name: /campaigns/i });
            expect(campaignsTab).toHaveAttribute('aria-selected', 'true');
        });

        it('should select Adventures tab when pathname is /content-library/adventures', () => {
            // Arrange
            mockUseLocation.mockReturnValue({ pathname: '/content-library/adventures' });

            // Act
            render(
                <TestWrapper>
                    <ContentLibraryPage />
                </TestWrapper>,
            );

            // Assert
            const adventuresTab = screen.getByRole('tab', { name: /adventures/i });
            expect(adventuresTab).toHaveAttribute('aria-selected', 'true');
        });

        it('should default to Adventures tab for unknown pathname', () => {
            // Arrange
            mockUseLocation.mockReturnValue({ pathname: '/content-library/unknown' });

            // Act
            render(
                <TestWrapper>
                    <ContentLibraryPage />
                </TestWrapper>,
            );

            // Assert
            const adventuresTab = screen.getByRole('tab', { name: /adventures/i });
            expect(adventuresTab).toHaveAttribute('aria-selected', 'true');
        });
    });

    describe('navigation on tab change', () => {
        it('should navigate to /content-library/worlds when Worlds tab is clicked', async () => {
            // Arrange
            const user = userEvent.setup();
            mockUseLocation.mockReturnValue({ pathname: '/content-library/adventures' });

            render(
                <TestWrapper>
                    <ContentLibraryPage />
                </TestWrapper>,
            );

            // Act
            const worldsTab = screen.getByRole('tab', { name: /worlds/i });
            await user.click(worldsTab);

            // Assert
            expect(mockNavigate).toHaveBeenCalledWith('/content-library/worlds');
        });

        it('should navigate to /content-library/campaigns when Campaigns tab is clicked', async () => {
            // Arrange
            const user = userEvent.setup();
            mockUseLocation.mockReturnValue({ pathname: '/content-library/adventures' });

            render(
                <TestWrapper>
                    <ContentLibraryPage />
                </TestWrapper>,
            );

            // Act
            const campaignsTab = screen.getByRole('tab', { name: /campaigns/i });
            await user.click(campaignsTab);

            // Assert
            expect(mockNavigate).toHaveBeenCalledWith('/content-library/campaigns');
        });

        it('should navigate to /content-library/adventures when Adventures tab is clicked', async () => {
            // Arrange
            const user = userEvent.setup();
            mockUseLocation.mockReturnValue({ pathname: '/content-library/worlds' });

            render(
                <TestWrapper>
                    <ContentLibraryPage />
                </TestWrapper>,
            );

            // Act
            const adventuresTab = screen.getByRole('tab', { name: /adventures/i });
            await user.click(adventuresTab);

            // Assert
            expect(mockNavigate).toHaveBeenCalledWith('/content-library/adventures');
        });
    });
});
