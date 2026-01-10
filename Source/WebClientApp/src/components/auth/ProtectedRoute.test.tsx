import { ThemeProvider, createTheme } from '@mui/material';
import { render, screen } from '@testing-library/react';
import type React from 'react';
import { beforeEach, describe, expect, it, vi } from 'vitest';
import { ProtectedRoute } from './ProtectedRoute';

// Mock useAuth hook
let mockAuthState = {
    isAuthenticated: false,
    isInitializing: false,
};

vi.mock('@/hooks/useAuth', () => ({
    useAuth: () => ({
        get isAuthenticated() {
            return mockAuthState.isAuthenticated;
        },
        get isInitializing() {
            return mockAuthState.isInitializing;
        },
    }),
}));

// Mock react-router-dom
const mockNavigate = vi.fn();
const mockLocation = {
    pathname: '/dashboard',
    search: '',
    hash: '',
    state: null,
    key: 'default',
};

vi.mock('react-router-dom', () => ({
    Navigate: ({ to, state, replace }: { to: string; state?: unknown; replace?: boolean }) => (
        <div data-mock-navigate="true" data-to={to} data-state={JSON.stringify(state)} data-replace={String(replace)}>
            Navigate to {to}
        </div>
    ),
    useLocation: () => mockLocation,
    useNavigate: () => mockNavigate,
}));

// Mock LoadingOverlay
vi.mock('@/components/common', () => ({
    LoadingOverlay: ({ open, message }: { open: boolean; message?: string }) =>
        open ? (
            <div role="progressbar" aria-label="loading">
                {message}
            </div>
        ) : null,
}));

// Theme wrapper for MUI components
const theme = createTheme();
const renderWithTheme = (component: React.ReactElement) => {
    return render(<ThemeProvider theme={theme}>{component}</ThemeProvider>);
};

// Test children component
const TestChild = () => <div>Protected Content</div>;

describe('ProtectedRoute', () => {
    beforeEach(() => {
        vi.clearAllMocks();
        mockAuthState = {
            isAuthenticated: false,
            isInitializing: false,
        };
        mockLocation.pathname = '/dashboard';
        mockLocation.search = '';
    });

    // ========================================
    // Loading State
    // ========================================

    describe('loading state', () => {
        it('should display loading overlay when auth is initializing', () => {
            // Arrange
            mockAuthState.isInitializing = true;

            // Act
            renderWithTheme(
                <ProtectedRoute>
                    <TestChild />
                </ProtectedRoute>,
            );

            // Assert
            expect(screen.getByRole('progressbar', { name: /loading/i })).toBeInTheDocument();
            expect(screen.getByText(/checking authorization/i)).toBeInTheDocument();
            expect(screen.queryByText(/protected content/i)).not.toBeInTheDocument();
        });

        it('should not display children while initializing', () => {
            // Arrange
            mockAuthState.isInitializing = true;
            mockAuthState.isAuthenticated = true;

            // Act
            renderWithTheme(
                <ProtectedRoute>
                    <TestChild />
                </ProtectedRoute>,
            );

            // Assert
            expect(screen.queryByText(/protected content/i)).not.toBeInTheDocument();
        });
    });

    // ========================================
    // Anonymous Routes
    // ========================================

    describe('anonymous routes', () => {
        it('should render children for anonymous route when unauthenticated', () => {
            // Arrange
            mockAuthState.isAuthenticated = false;

            // Act
            renderWithTheme(
                <ProtectedRoute authLevel="anonymous">
                    <TestChild />
                </ProtectedRoute>,
            );

            // Assert
            expect(screen.getByText(/protected content/i)).toBeInTheDocument();
        });

        it('should render children for anonymous route when authenticated', () => {
            // Arrange
            mockAuthState.isAuthenticated = true;

            // Act
            renderWithTheme(
                <ProtectedRoute authLevel="anonymous">
                    <TestChild />
                </ProtectedRoute>,
            );

            // Assert
            expect(screen.getByText(/protected content/i)).toBeInTheDocument();
        });
    });

    // ========================================
    // Authorized Routes - Authenticated Users
    // ========================================

    describe('authorized routes - authenticated users', () => {
        it('should render children when user is authenticated', () => {
            // Arrange
            mockAuthState.isAuthenticated = true;

            // Act
            renderWithTheme(
                <ProtectedRoute authLevel="authorized">
                    <TestChild />
                </ProtectedRoute>,
            );

            // Assert
            expect(screen.getByText(/protected content/i)).toBeInTheDocument();
        });

        it('should render children with default authLevel when user is authenticated', () => {
            // Arrange
            mockAuthState.isAuthenticated = true;

            // Act
            renderWithTheme(
                <ProtectedRoute>
                    <TestChild />
                </ProtectedRoute>,
            );

            // Assert
            expect(screen.getByText(/protected content/i)).toBeInTheDocument();
        });
    });

    // ========================================
    // Authorized Routes - Unauthenticated Users (Redirect)
    // ========================================

    describe('authorized routes - unauthenticated users', () => {
        it('should redirect to login when user is not authenticated', () => {
            // Arrange
            mockAuthState.isAuthenticated = false;

            // Act
            renderWithTheme(
                <ProtectedRoute authLevel="authorized">
                    <TestChild />
                </ProtectedRoute>,
            );

            // Assert
            const navigateElement = screen.getByText(/navigate to/i);
            expect(navigateElement).toBeInTheDocument();
            expect(navigateElement).toHaveAttribute('data-to', '/login?returnUrl=%2Fdashboard');
            expect(navigateElement).toHaveAttribute('data-replace', 'true');
        });

        it('should redirect to default login path when user is not authenticated', () => {
            // Arrange
            mockAuthState.isAuthenticated = false;
            mockLocation.pathname = '/settings';

            // Act
            renderWithTheme(
                <ProtectedRoute>
                    <TestChild />
                </ProtectedRoute>,
            );

            // Assert
            const navigateElement = screen.getByText(/navigate to/i);
            expect(navigateElement).toHaveAttribute('data-to', '/login?returnUrl=%2Fsettings');
        });

        it('should redirect to custom path when redirectTo prop is provided', () => {
            // Arrange
            mockAuthState.isAuthenticated = false;

            // Act
            renderWithTheme(
                <ProtectedRoute redirectTo="/custom-login">
                    <TestChild />
                </ProtectedRoute>,
            );

            // Assert
            const navigateElement = screen.getByText(/navigate to/i);
            expect(navigateElement).toHaveAttribute('data-to', '/custom-login?returnUrl=%2Fdashboard');
        });

        it('should not render children when redirecting unauthenticated user', () => {
            // Arrange
            mockAuthState.isAuthenticated = false;

            // Act
            renderWithTheme(
                <ProtectedRoute>
                    <TestChild />
                </ProtectedRoute>,
            );

            // Assert
            expect(screen.queryByText(/protected content/i)).not.toBeInTheDocument();
        });
    });

    // ========================================
    // Return URL Preservation
    // ========================================

    describe('return URL preservation', () => {
        it('should include current pathname in returnUrl query parameter', () => {
            // Arrange
            mockAuthState.isAuthenticated = false;
            mockLocation.pathname = '/campaigns/123/edit';

            // Act
            renderWithTheme(
                <ProtectedRoute>
                    <TestChild />
                </ProtectedRoute>,
            );

            // Assert
            const navigateElement = screen.getByText(/navigate to/i);
            expect(navigateElement).toHaveAttribute('data-to', '/login?returnUrl=%2Fcampaigns%2F123%2Fedit');
        });

        it('should include search params in returnUrl when present', () => {
            // Arrange
            mockAuthState.isAuthenticated = false;
            mockLocation.pathname = '/search';
            mockLocation.search = '?query=dragons&page=2';

            // Act
            renderWithTheme(
                <ProtectedRoute>
                    <TestChild />
                </ProtectedRoute>,
            );

            // Assert
            const navigateElement = screen.getByText(/navigate to/i);
            expect(navigateElement).toHaveAttribute(
                'data-to',
                '/login?returnUrl=%2Fsearch%3Fquery%3Ddragons%26page%3D2',
            );
        });

        it('should pass location state with from property for programmatic navigation', () => {
            // Arrange
            mockAuthState.isAuthenticated = false;
            mockLocation.pathname = '/dashboard';

            // Act
            renderWithTheme(
                <ProtectedRoute>
                    <TestChild />
                </ProtectedRoute>,
            );

            // Assert
            const navigateElement = screen.getByText(/navigate to/i);
            const state = JSON.parse(navigateElement.getAttribute('data-state') || '{}');
            expect(state.from).toEqual(mockLocation);
        });
    });

    // ========================================
    // Edge Cases
    // ========================================

    describe('edge cases', () => {
        it('should handle empty children gracefully when authenticated', () => {
            // Arrange
            mockAuthState.isAuthenticated = true;

            // Act
            const { container } = renderWithTheme(<ProtectedRoute>{null}</ProtectedRoute>);

            // Assert - should not throw and render empty content
            expect(container).toBeInTheDocument();
        });

        it('should handle multiple children when authenticated', () => {
            // Arrange
            mockAuthState.isAuthenticated = true;

            // Act
            renderWithTheme(
                <ProtectedRoute>
                    <div>First Child</div>
                    <div>Second Child</div>
                </ProtectedRoute>,
            );

            // Assert
            expect(screen.getByText(/first child/i)).toBeInTheDocument();
            expect(screen.getByText(/second child/i)).toBeInTheDocument();
        });

        it('should use replace navigation to prevent back button issues', () => {
            // Arrange
            mockAuthState.isAuthenticated = false;

            // Act
            renderWithTheme(
                <ProtectedRoute>
                    <TestChild />
                </ProtectedRoute>,
            );

            // Assert
            const navigateElement = screen.getByText(/navigate to/i);
            expect(navigateElement).toHaveAttribute('data-replace', 'true');
        });
    });
});
