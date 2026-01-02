/**
 * AdminLayout Component Tests
 * Tests layout rendering, navigation drawer, theme toggle, and profile menu
 * Coverage: Admin layout workflow scenarios
 *
 * Test Coverage:
 * - AppBar rendering (title, drawer toggle, theme toggle, profile button)
 * - Navigation drawer rendering (menu items when drawer open)
 * - Drawer toggle functionality
 * - Theme toggle functionality
 * - Profile menu interactions (open, display user info, logout)
 * - Navigation to routes when menu items clicked
 */

import { render, screen, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { describe, it, expect, beforeEach, vi } from 'vitest';
import { AdminLayout } from './AdminLayout';

// Mock react-router-dom
const mockNavigate = vi.fn();
vi.mock('react-router-dom', () => ({
    useNavigate: () => mockNavigate,
    Outlet: () => <div>Outlet Content</div>,
}));

// Mock store hooks
const mockDispatch = vi.fn();
const mockUseAppSelector = vi.fn();
vi.mock('@store/hooks', () => ({
    useAppDispatch: () => mockDispatch,
    useAppSelector: (selector: (state: unknown) => unknown) => mockUseAppSelector(selector),
}));

// Mock auth slice
vi.mock('@store/slices/authSlice', () => {
    const logoutMock = Object.assign(
        () => ({ type: 'auth/logout', isLogoutAction: true }),
        {
            fulfilled: { match: (result: unknown) => (result as { type?: string } | undefined)?.type === 'fulfilled' },
        }
    );
    return {
        logout: logoutMock,
    };
});

// Mock UI slice
vi.mock('@store/slices/uiSlice', () => ({
    toggleTheme: () => ({ type: 'ui/toggleTheme' }),
    toggleDrawer: () => ({ type: 'ui/toggleDrawer' }),
    selectTheme: (state: { ui: { theme: string } }) => state.ui.theme,
    selectDrawerOpen: (state: { ui: { drawerOpen: boolean } }) => state.ui.drawerOpen,
}));

// Mock MUI icons to prevent file loading issues
vi.mock('@mui/icons-material', () => {
    const MenuComponent = () => <span>MenuIcon</span>;
    const DashboardComponent = () => <span>DashboardIcon</span>;
    const PeopleComponent = () => <span>PeopleIcon</span>;
    const AssignmentComponent = () => <span>AssignmentIcon</span>;
    const SettingsComponent = () => <span>SettingsIcon</span>;
    const LibraryComponent = () => <span>LibraryIcon</span>;
    const BuildComponent = () => <span>BuildIcon</span>;
    const AiComponent = () => <span>AiIcon</span>;
    const ImageComponent = () => <span>ImageIcon</span>;
    const AccountCircleComponent = () => <span>AccountCircleIcon</span>;
    const LightModeComponent = () => <span>LightModeIcon</span>;
    const DarkModeComponent = () => <span>DarkModeIcon</span>;
    return {
        Menu: MenuComponent,
        Dashboard: DashboardComponent,
        People: PeopleComponent,
        Assignment: AssignmentComponent,
        Settings: SettingsComponent,
        LibraryBooks: LibraryComponent,
        Build: BuildComponent,
        AutoAwesome: AiComponent,
        Image: ImageComponent,
        AccountCircle: AccountCircleComponent,
        LightMode: LightModeComponent,
        DarkMode: DarkModeComponent,
    };
});

describe('AdminLayout', () => {
    const mockUser = {
        id: 'user-1',
        email: 'admin@example.com',
        displayName: 'Admin User',
        isAdmin: true,
        emailConfirmed: true,
        twoFactorEnabled: false,
    };

    const defaultState = {
        auth: { user: mockUser },
        ui: { theme: 'light', drawerOpen: true },
    };

    beforeEach(() => {
        vi.resetAllMocks();
        mockUseAppSelector.mockImplementation((selector: (state: unknown) => unknown) => {
            return selector(defaultState);
        });
        mockDispatch.mockImplementation((action: unknown) => {
            const actionObj = action as { type?: string; isLogoutAction?: boolean };
            if (actionObj?.isLogoutAction) {
                return Promise.resolve({ type: 'fulfilled' });
            }
            return action;
        });
    });

    describe('Rendering', () => {
        it('should render AppBar with title', () => {
            // Arrange & Act
            render(<AdminLayout />);

            // Assert
            expect(screen.getByText('VTT Tools - Administration')).toBeInTheDocument();
        });

        it('should render drawer toggle button', () => {
            // Arrange & Act
            render(<AdminLayout />);

            // Assert
            expect(screen.getByRole('button', { name: /toggle drawer/i })).toBeInTheDocument();
        });

        it('should render theme toggle button', () => {
            // Arrange & Act
            render(<AdminLayout />);

            // Assert
            expect(screen.getByRole('button', { name: /switch to dark mode/i })).toBeInTheDocument();
        });

        it('should render profile menu button', () => {
            // Arrange & Act
            render(<AdminLayout />);

            // Assert
            expect(screen.getByRole('button', { name: /account/i })).toBeInTheDocument();
        });

        it('should render navigation menu items when drawer is open', () => {
            // Arrange & Act
            render(<AdminLayout />);

            // Assert - Check all 8 menu items are rendered
            expect(screen.getByText('Dashboard')).toBeInTheDocument();
            expect(screen.getByText('User Management')).toBeInTheDocument();
            expect(screen.getByText('Audit Logs')).toBeInTheDocument();
            expect(screen.getByText('Maintenance Mode')).toBeInTheDocument();
            expect(screen.getByText('System Config')).toBeInTheDocument();
            expect(screen.getByText('Public Library')).toBeInTheDocument();
            expect(screen.getByText('Resources')).toBeInTheDocument();
            expect(screen.getByText('AI Generation')).toBeInTheDocument();
        });

        it('should render Outlet for nested routes', () => {
            // Arrange & Act
            render(<AdminLayout />);

            // Assert
            expect(screen.getByText('Outlet Content')).toBeInTheDocument();
        });
    });

    describe('Drawer toggle', () => {
        it('should dispatch toggleDrawer when hamburger button is clicked', async () => {
            // Arrange
            const user = userEvent.setup();
            render(<AdminLayout />);

            // Act
            const drawerToggle = screen.getByRole('button', { name: /toggle drawer/i });
            await user.click(drawerToggle);

            // Assert
            expect(mockDispatch).toHaveBeenCalledWith({ type: 'ui/toggleDrawer' });
        });
    });

    describe('Theme toggle', () => {
        it('should dispatch toggleTheme when theme button is clicked', async () => {
            // Arrange
            const user = userEvent.setup();
            render(<AdminLayout />);

            // Act
            const themeToggle = screen.getByRole('button', { name: /switch to dark mode/i });
            await user.click(themeToggle);

            // Assert
            expect(mockDispatch).toHaveBeenCalledWith({ type: 'ui/toggleTheme' });
        });

        it('should show dark mode icon when theme is light', () => {
            // Arrange
            mockUseAppSelector.mockImplementation((selector: (state: unknown) => unknown) => {
                return selector({
                    auth: { user: mockUser },
                    ui: { theme: 'light', drawerOpen: true },
                });
            });

            // Act
            render(<AdminLayout />);

            // Assert
            expect(screen.getByText('DarkModeIcon')).toBeInTheDocument();
        });

        it('should show light mode icon when theme is dark', () => {
            // Arrange
            mockUseAppSelector.mockImplementation((selector: (state: unknown) => unknown) => {
                return selector({
                    auth: { user: mockUser },
                    ui: { theme: 'dark', drawerOpen: true },
                });
            });

            // Act
            render(<AdminLayout />);

            // Assert
            expect(screen.getByText('LightModeIcon')).toBeInTheDocument();
        });

        it('should have correct aria-label for theme toggle in light mode', () => {
            // Arrange
            mockUseAppSelector.mockImplementation((selector: (state: unknown) => unknown) => {
                return selector({
                    auth: { user: mockUser },
                    ui: { theme: 'light', drawerOpen: true },
                });
            });

            // Act
            render(<AdminLayout />);

            // Assert
            expect(screen.getByRole('button', { name: /switch to dark mode/i })).toBeInTheDocument();
        });

        it('should have correct aria-label for theme toggle in dark mode', () => {
            // Arrange
            mockUseAppSelector.mockImplementation((selector: (state: unknown) => unknown) => {
                return selector({
                    auth: { user: mockUser },
                    ui: { theme: 'dark', drawerOpen: true },
                });
            });

            // Act
            render(<AdminLayout />);

            // Assert
            expect(screen.getByRole('button', { name: /switch to light mode/i })).toBeInTheDocument();
        });
    });

    describe('Profile menu', () => {
        it('should open profile menu when profile button is clicked', async () => {
            // Arrange
            const user = userEvent.setup();
            render(<AdminLayout />);

            // Act
            const profileButton = screen.getByRole('button', { name: /account/i });
            await user.click(profileButton);

            // Assert
            expect(screen.getByRole('menu')).toBeInTheDocument();
        });

        it('should display user display name in profile menu', async () => {
            // Arrange
            const user = userEvent.setup();
            render(<AdminLayout />);

            // Act
            const profileButton = screen.getByRole('button', { name: /account/i });
            await user.click(profileButton);

            // Assert
            expect(screen.getByText('Admin User')).toBeInTheDocument();
        });

        it('should display user email in profile menu', async () => {
            // Arrange
            const user = userEvent.setup();
            render(<AdminLayout />);

            // Act
            const profileButton = screen.getByRole('button', { name: /account/i });
            await user.click(profileButton);

            // Assert
            expect(screen.getByText('admin@example.com')).toBeInTheDocument();
        });

        it('should display logout option in profile menu', async () => {
            // Arrange
            const user = userEvent.setup();
            render(<AdminLayout />);

            // Act
            const profileButton = screen.getByRole('button', { name: /account/i });
            await user.click(profileButton);

            // Assert
            expect(screen.getByRole('menuitem', { name: /logout/i })).toBeInTheDocument();
        });

        it('should call logout and navigate to /login when logout is clicked', async () => {
            // Arrange
            const user = userEvent.setup();
            render(<AdminLayout />);

            // Act
            const profileButton = screen.getByRole('button', { name: /account/i });
            await user.click(profileButton);
            const logoutButton = screen.getByRole('menuitem', { name: /logout/i });
            await user.click(logoutButton);

            // Assert
            await waitFor(() => {
                expect(mockDispatch).toHaveBeenCalled();
                expect(mockNavigate).toHaveBeenCalledWith('/login');
            });
        });

        it('should close profile menu when clicking outside', async () => {
            // Arrange
            const user = userEvent.setup();
            render(<AdminLayout />);

            // Act - Open menu
            const profileButton = screen.getByRole('button', { name: /account/i });
            await user.click(profileButton);
            expect(screen.getByRole('menu')).toBeInTheDocument();

            // Act - Click backdrop to close
            await user.keyboard('{Escape}');

            // Assert
            await waitFor(() => {
                expect(screen.queryByRole('menu')).not.toBeInTheDocument();
            });
        });
    });

    describe('Navigation', () => {
        it('should navigate to /admin/dashboard when Dashboard menu item is clicked', async () => {
            // Arrange
            const user = userEvent.setup();
            render(<AdminLayout />);

            // Act
            const dashboardItem = screen.getByText('Dashboard');
            await user.click(dashboardItem);

            // Assert
            expect(mockNavigate).toHaveBeenCalledWith('/admin/dashboard');
        });

        it('should navigate to /admin/users when User Management menu item is clicked', async () => {
            // Arrange
            const user = userEvent.setup();
            render(<AdminLayout />);

            // Act
            const usersItem = screen.getByText('User Management');
            await user.click(usersItem);

            // Assert
            expect(mockNavigate).toHaveBeenCalledWith('/admin/users');
        });

        it('should navigate to /admin/audit when Audit Logs menu item is clicked', async () => {
            // Arrange
            const user = userEvent.setup();
            render(<AdminLayout />);

            // Act
            const auditItem = screen.getByText('Audit Logs');
            await user.click(auditItem);

            // Assert
            expect(mockNavigate).toHaveBeenCalledWith('/admin/audit');
        });

        it('should navigate to /admin/maintenance when Maintenance Mode menu item is clicked', async () => {
            // Arrange
            const user = userEvent.setup();
            render(<AdminLayout />);

            // Act
            const maintenanceItem = screen.getByText('Maintenance Mode');
            await user.click(maintenanceItem);

            // Assert
            expect(mockNavigate).toHaveBeenCalledWith('/admin/maintenance');
        });

        it('should navigate to /admin/config when System Config menu item is clicked', async () => {
            // Arrange
            const user = userEvent.setup();
            render(<AdminLayout />);

            // Act
            const configItem = screen.getByText('System Config');
            await user.click(configItem);

            // Assert
            expect(mockNavigate).toHaveBeenCalledWith('/admin/config');
        });

        it('should navigate to /admin/library when Public Library menu item is clicked', async () => {
            // Arrange
            const user = userEvent.setup();
            render(<AdminLayout />);

            // Act
            const libraryItem = screen.getByText('Public Library');
            await user.click(libraryItem);

            // Assert
            expect(mockNavigate).toHaveBeenCalledWith('/admin/library');
        });

        it('should navigate to /admin/resources when Resources menu item is clicked', async () => {
            // Arrange
            const user = userEvent.setup();
            render(<AdminLayout />);

            // Act
            const resourcesItem = screen.getByText('Resources');
            await user.click(resourcesItem);

            // Assert
            expect(mockNavigate).toHaveBeenCalledWith('/admin/resources');
        });

        it('should navigate to /admin/ai-generation when AI Generation menu item is clicked', async () => {
            // Arrange
            const user = userEvent.setup();
            render(<AdminLayout />);

            // Act
            const aiItem = screen.getByText('AI Generation');
            await user.click(aiItem);

            // Assert
            expect(mockNavigate).toHaveBeenCalledWith('/admin/ai-generation');
        });
    });

    describe('Drawer state', () => {
        it('should render drawer content when drawer is open', () => {
            // Arrange
            mockUseAppSelector.mockImplementation((selector: (state: unknown) => unknown) => {
                return selector({
                    auth: { user: mockUser },
                    ui: { theme: 'light', drawerOpen: true },
                });
            });

            // Act
            render(<AdminLayout />);

            // Assert - Menu items should be visible
            expect(screen.getByText('Dashboard')).toBeVisible();
        });
    });
});
