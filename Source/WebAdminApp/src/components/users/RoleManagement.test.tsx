/**
 * RoleManagement Component Tests
 * Tests role assignment and removal functionality for user management
 * Coverage: Rendering, role display, assign role flow, remove role flow, error handling
 *
 * Test Coverage:
 * - Rendering (section headers, empty state, role chips, assign section)
 * - Role display (chips for current roles, delete icons, filtered dropdown)
 * - Assign role flow (button enable, service calls, callbacks, loading states)
 * - Remove role flow (service calls, callbacks, loading states)
 * - Error handling (display, dismissal, API error responses)
 */

import { render, screen, waitFor, within, fireEvent } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { describe, it, expect, beforeEach, vi } from 'vitest';
import { RoleManagement } from './RoleManagement';
import { userService } from '@services/userService';

// Mock userService
vi.mock('@services/userService', () => ({
    userService: {
        assignRole: vi.fn(),
        removeRole: vi.fn(),
    },
}));

// Mock MUI icons - simple functional components that work with MUI Chip
vi.mock('@mui/icons-material', () => {
    const AddIcon = () => <svg role="img" aria-label="Add" className="MuiSvgIcon-root" />;
    // Delete needs to accept props and spread them for MUI Chip's event handling
    const DeleteIcon = (props: Record<string, unknown>) => (
        <svg role="img" aria-label="Delete" className="MuiSvgIcon-root" {...props} />
    );
    return { Add: AddIcon, Delete: DeleteIcon };
});

describe('RoleManagement', () => {
    const mockAssignRole = userService.assignRole as ReturnType<typeof vi.fn>;
    const mockRemoveRole = userService.removeRole as ReturnType<typeof vi.fn>;

    const defaultProps = {
        userId: 'user-123',
        currentRoles: [] as string[],
        onRolesUpdated: vi.fn(),
    };

    beforeEach(() => {
        vi.resetAllMocks();

        // Default mock implementations
        mockAssignRole.mockResolvedValue({ success: true, roles: [] });
        mockRemoveRole.mockResolvedValue({ success: true, roles: [] });
    });

    describe('Rendering', () => {
        it('should render "Assigned Roles" section header', () => {
            // Arrange & Act
            render(<RoleManagement {...defaultProps} />);

            // Assert
            expect(screen.getByText('Assigned Roles')).toBeInTheDocument();
        });

        it('should render "No roles assigned" when currentRoles is empty', () => {
            // Arrange & Act
            render(<RoleManagement {...defaultProps} currentRoles={[]} />);

            // Assert
            expect(screen.getByText('No roles assigned')).toBeInTheDocument();
        });

        it('should render role chips for each current role', () => {
            // Arrange
            const roles = ['Administrator', 'User'];

            // Act
            render(<RoleManagement {...defaultProps} currentRoles={roles} />);

            // Assert
            expect(screen.getByText('Administrator')).toBeInTheDocument();
            expect(screen.getByText('User')).toBeInTheDocument();
        });

        it('should render "Assign New Role" section when roles are assignable', () => {
            // Arrange - User role only, so Administrator is assignable
            const roles = ['User'];

            // Act
            render(<RoleManagement {...defaultProps} currentRoles={roles} />);

            // Assert
            expect(screen.getByText('Assign New Role')).toBeInTheDocument();
        });

        it('should render role select dropdown with assignable roles', async () => {
            // Arrange
            const user = userEvent.setup();
            const roles = ['User']; // Administrator should be assignable

            // Act
            render(<RoleManagement {...defaultProps} currentRoles={roles} />);

            // Open the select dropdown
            const selectButton = screen.getByRole('combobox');
            await user.click(selectButton);

            // Assert
            const listbox = await screen.findByRole('listbox');
            expect(within(listbox).getByRole('option', { name: 'Administrator' })).toBeInTheDocument();
            expect(within(listbox).queryByRole('option', { name: 'User' })).not.toBeInTheDocument();
        });

        it('should render "Assign Role" button', () => {
            // Arrange
            const roles = ['User'];

            // Act
            render(<RoleManagement {...defaultProps} currentRoles={roles} />);

            // Assert
            expect(screen.getByRole('button', { name: /assign role/i })).toBeInTheDocument();
        });

        it('should NOT render assign section when all roles assigned', () => {
            // Arrange - Both roles assigned
            const roles = ['Administrator', 'User'];

            // Act
            render(<RoleManagement {...defaultProps} currentRoles={roles} />);

            // Assert
            expect(screen.queryByText('Assign New Role')).not.toBeInTheDocument();
            expect(screen.queryByRole('button', { name: /assign role/i })).not.toBeInTheDocument();
        });

        it('should render "All available roles have been assigned" message when all roles assigned', () => {
            // Arrange - Both roles assigned
            const roles = ['Administrator', 'User'];

            // Act
            render(<RoleManagement {...defaultProps} currentRoles={roles} />);

            // Assert
            expect(screen.getByText('All available roles have been assigned')).toBeInTheDocument();
        });
    });

    describe('Role Display', () => {
        it('should show chips for all current roles', () => {
            // Arrange
            const roles = ['Administrator', 'User'];

            // Act
            render(<RoleManagement {...defaultProps} currentRoles={roles} />);

            // Assert - Each role should be displayed as a chip
            roles.forEach(role => {
                expect(screen.getByText(role)).toBeInTheDocument();
            });
        });

        it('should show delete icon on each role chip', () => {
            // Arrange
            const roles = ['Administrator', 'User'];

            // Act
            render(<RoleManagement {...defaultProps} currentRoles={roles} />);

            // Assert - MUI Chip delete icons are rendered using our mocked DeleteIcon
            const deleteIcons = screen.getAllByRole('img', { name: 'Delete' });
            expect(deleteIcons).toHaveLength(2);
        });

        it('should filter out current roles from dropdown options', async () => {
            // Arrange
            const user = userEvent.setup();
            const roles = ['Administrator']; // Only User should be in dropdown

            // Act
            render(<RoleManagement {...defaultProps} currentRoles={roles} />);

            // Open the select dropdown
            const selectButton = screen.getByRole('combobox');
            await user.click(selectButton);

            // Assert
            const listbox = await screen.findByRole('listbox');
            expect(within(listbox).getByRole('option', { name: 'User' })).toBeInTheDocument();
            expect(within(listbox).queryByRole('option', { name: 'Administrator' })).not.toBeInTheDocument();
        });
    });

    describe('Assign Role Flow', () => {
        it('should enable button only when role is selected', async () => {
            // Arrange
            const user = userEvent.setup();
            const roles: string[] = [];

            // Act
            render(<RoleManagement {...defaultProps} currentRoles={roles} />);

            // Assert - Button should be disabled initially
            const assignButton = screen.getByRole('button', { name: /assign role/i });
            expect(assignButton).toBeDisabled();

            // Select a role
            const selectButton = screen.getByRole('combobox');
            await user.click(selectButton);
            const listbox = await screen.findByRole('listbox');
            await user.click(within(listbox).getByRole('option', { name: 'Administrator' }));

            // Button should now be enabled
            expect(assignButton).toBeEnabled();
        });

        it('should call userService.assignRole with correct parameters', async () => {
            // Arrange
            const user = userEvent.setup();
            const roles: string[] = [];

            render(<RoleManagement {...defaultProps} currentRoles={roles} />);

            // Act - Select role and click assign
            const selectButton = screen.getByRole('combobox');
            await user.click(selectButton);
            const listbox = await screen.findByRole('listbox');
            await user.click(within(listbox).getByRole('option', { name: 'Administrator' }));

            const assignButton = screen.getByRole('button', { name: /assign role/i });
            await user.click(assignButton);

            // Assert
            await waitFor(() => {
                expect(mockAssignRole).toHaveBeenCalledWith('user-123', { roleName: 'Administrator' });
            });
        });

        it('should call onRolesUpdated after successful assignment', async () => {
            // Arrange
            const user = userEvent.setup();
            const onRolesUpdated = vi.fn();
            const roles: string[] = [];

            render(<RoleManagement {...defaultProps} currentRoles={roles} onRolesUpdated={onRolesUpdated} />);

            // Act - Select role and click assign
            const selectButton = screen.getByRole('combobox');
            await user.click(selectButton);
            const listbox = await screen.findByRole('listbox');
            await user.click(within(listbox).getByRole('option', { name: 'Administrator' }));

            const assignButton = screen.getByRole('button', { name: /assign role/i });
            await user.click(assignButton);

            // Assert
            await waitFor(() => {
                expect(onRolesUpdated).toHaveBeenCalled();
            });
        });

        it('should clear selection after successful assignment', async () => {
            // Arrange
            const user = userEvent.setup();
            const roles: string[] = [];

            render(<RoleManagement {...defaultProps} currentRoles={roles} />);

            // Act - Select role and click assign
            const selectButton = screen.getByRole('combobox');
            await user.click(selectButton);
            let listbox = await screen.findByRole('listbox');
            await user.click(within(listbox).getByRole('option', { name: 'Administrator' }));

            const assignButton = screen.getByRole('button', { name: /assign role/i });
            await user.click(assignButton);

            // Assert - After assignment, selection should be cleared and button disabled
            await waitFor(() => {
                expect(assignButton).toBeDisabled();
            });
        });

        it('should show loading state during assignment', async () => {
            // Arrange
            const user = userEvent.setup();
            let resolveAssign: (value: { success: boolean; roles: string[] }) => void = () => {};
            mockAssignRole.mockImplementation(
                () =>
                    new Promise((resolve) => {
                        resolveAssign = resolve;
                    })
            );
            const roles: string[] = [];

            render(<RoleManagement {...defaultProps} currentRoles={roles} />);

            // Act - Select role and click assign
            const selectButton = screen.getByRole('combobox');
            await user.click(selectButton);
            const listbox = await screen.findByRole('listbox');
            await user.click(within(listbox).getByRole('option', { name: 'Administrator' }));

            const assignButton = screen.getByRole('button', { name: /assign role/i });
            await user.click(assignButton);

            // Assert - Loading spinner should be visible
            await waitFor(() => {
                expect(screen.getByRole('progressbar')).toBeInTheDocument();
            });

            // Cleanup
            resolveAssign({ success: true, roles: [] });
        });

        it('should show error alert on assignment failure', async () => {
            // Arrange
            const user = userEvent.setup();
            mockAssignRole.mockRejectedValue({
                response: { data: { error: 'Role assignment failed' } },
            });
            const roles: string[] = [];

            render(<RoleManagement {...defaultProps} currentRoles={roles} />);

            // Act - Select role and click assign
            const selectButton = screen.getByRole('combobox');
            await user.click(selectButton);
            const listbox = await screen.findByRole('listbox');
            await user.click(within(listbox).getByRole('option', { name: 'Administrator' }));

            const assignButton = screen.getByRole('button', { name: /assign role/i });
            await user.click(assignButton);

            // Assert
            await waitFor(() => {
                expect(screen.getByRole('alert')).toBeInTheDocument();
            });
            expect(screen.getByText('Role assignment failed')).toBeInTheDocument();
        });

        it('should disable controls during loading', async () => {
            // Arrange
            const user = userEvent.setup();
            let resolveAssign: (value: { success: boolean; roles: string[] }) => void = () => {};
            mockAssignRole.mockImplementation(
                () =>
                    new Promise((resolve) => {
                        resolveAssign = resolve;
                    })
            );
            const roles: string[] = [];

            render(<RoleManagement {...defaultProps} currentRoles={roles} />);

            // Act - Select role and click assign
            const selectButton = screen.getByRole('combobox');
            await user.click(selectButton);
            const listbox = await screen.findByRole('listbox');
            await user.click(within(listbox).getByRole('option', { name: 'Administrator' }));

            const assignButton = screen.getByRole('button', { name: /assign role/i });
            await user.click(assignButton);

            // Assert - Controls should be disabled during loading
            await waitFor(() => {
                expect(screen.getByRole('combobox')).toHaveAttribute('aria-disabled', 'true');
            });
            expect(assignButton).toBeDisabled();

            // Cleanup
            resolveAssign({ success: true, roles: [] });
        });
    });

    describe('Remove Role Flow', () => {
        // Helper to find and click MUI Chip delete button using fireEvent
        // MUI Chip's delete handler is attached to a wrapper element, but our mocked icon
        // may not trigger it with userEvent. Using fireEvent.click on the SVG works because
        // React's event delegation catches it.
        const clickDeleteForRole = (roleName: string) => {
            const roleChip = screen.getByText(roleName).closest('.MuiChip-root');
            const deleteIcon = roleChip?.querySelector('[aria-label="Delete"]');
            if (deleteIcon) {
                fireEvent.click(deleteIcon);
            }
        };

        it('should call userService.removeRole when delete clicked', async () => {
            // Arrange
            const roles = ['Administrator'];

            render(<RoleManagement {...defaultProps} currentRoles={roles} />);

            // Act - Find the chip's delete button
            clickDeleteForRole('Administrator');

            // Assert
            await waitFor(() => {
                expect(mockRemoveRole).toHaveBeenCalledWith('user-123', 'Administrator');
            });
        });

        it('should call onRolesUpdated after successful removal', async () => {
            // Arrange
            const onRolesUpdated = vi.fn();
            const roles = ['Administrator'];

            render(<RoleManagement {...defaultProps} currentRoles={roles} onRolesUpdated={onRolesUpdated} />);

            // Act - Click on delete icon
            clickDeleteForRole('Administrator');

            // Assert
            await waitFor(() => {
                expect(onRolesUpdated).toHaveBeenCalled();
            });
        });

        it('should show error alert on removal failure', async () => {
            // Arrange
            mockRemoveRole.mockRejectedValue({
                response: { data: { error: 'Role removal failed' } },
            });
            const roles = ['Administrator'];

            render(<RoleManagement {...defaultProps} currentRoles={roles} />);

            // Act - Click on delete icon
            clickDeleteForRole('Administrator');

            // Assert
            await waitFor(() => {
                expect(screen.getByRole('alert')).toBeInTheDocument();
            });
            expect(screen.getByText('Role removal failed')).toBeInTheDocument();
        });

        it('should disable chips during loading', async () => {
            // Arrange
            let resolveRemove: (value: { success: boolean; roles: string[] }) => void = () => {};
            mockRemoveRole.mockImplementation(
                () =>
                    new Promise((resolve) => {
                        resolveRemove = resolve;
                    })
            );
            const roles = ['Administrator', 'User'];

            render(<RoleManagement {...defaultProps} currentRoles={roles} />);

            // Act - Click on first delete icon
            clickDeleteForRole('Administrator');

            // Assert - Chips should be disabled during loading
            await waitFor(() => {
                // Check that chip buttons are disabled
                const chips = document.querySelectorAll('.MuiChip-root');
                chips.forEach(chip => {
                    expect(chip).toHaveClass('Mui-disabled');
                });
            });

            // Cleanup
            resolveRemove({ success: true, roles: [] });
        });
    });

    describe('Error Handling', () => {
        it('should display error alert', async () => {
            // Arrange
            const user = userEvent.setup();
            mockAssignRole.mockRejectedValue(new Error('Network error'));
            const roles: string[] = [];

            render(<RoleManagement {...defaultProps} currentRoles={roles} />);

            // Act - Select role and click assign
            const selectButton = screen.getByRole('combobox');
            await user.click(selectButton);
            const listbox = await screen.findByRole('listbox');
            await user.click(within(listbox).getByRole('option', { name: 'Administrator' }));

            const assignButton = screen.getByRole('button', { name: /assign role/i });
            await user.click(assignButton);

            // Assert
            await waitFor(() => {
                expect(screen.getByRole('alert')).toBeInTheDocument();
            });
        });

        it('should allow dismissing error', async () => {
            // Arrange
            const user = userEvent.setup();
            mockAssignRole.mockRejectedValue({
                response: { data: { error: 'Test error' } },
            });
            const roles: string[] = [];

            render(<RoleManagement {...defaultProps} currentRoles={roles} />);

            // Trigger error
            const selectButton = screen.getByRole('combobox');
            await user.click(selectButton);
            const listbox = await screen.findByRole('listbox');
            await user.click(within(listbox).getByRole('option', { name: 'Administrator' }));

            const assignButton = screen.getByRole('button', { name: /assign role/i });
            await user.click(assignButton);

            // Wait for error to appear
            await waitFor(() => {
                expect(screen.getByRole('alert')).toBeInTheDocument();
            });

            // Act - Click close button on alert
            const closeButton = screen.getByRole('button', { name: /close/i });
            await user.click(closeButton);

            // Assert
            await waitFor(() => {
                expect(screen.queryByRole('alert')).not.toBeInTheDocument();
            });
        });

        it('should handle API error responses without response data', async () => {
            // Arrange
            const user = userEvent.setup();
            mockAssignRole.mockRejectedValue(new Error('Network failure'));
            const roles: string[] = [];

            render(<RoleManagement {...defaultProps} currentRoles={roles} />);

            // Act - Select role and click assign
            const selectButton = screen.getByRole('combobox');
            await user.click(selectButton);
            const listbox = await screen.findByRole('listbox');
            await user.click(within(listbox).getByRole('option', { name: 'Administrator' }));

            const assignButton = screen.getByRole('button', { name: /assign role/i });
            await user.click(assignButton);

            // Assert - Should show default error message
            await waitFor(() => {
                expect(screen.getByText('Failed to assign role')).toBeInTheDocument();
            });
        });

        it('should handle remove role API error responses without response data', async () => {
            // Arrange
            mockRemoveRole.mockRejectedValue(new Error('Network failure'));
            const roles = ['Administrator'];

            render(<RoleManagement {...defaultProps} currentRoles={roles} />);

            // Act - Click on delete icon
            const roleChip = screen.getByText('Administrator').closest('.MuiChip-root');
            const deleteIcon = roleChip?.querySelector('[aria-label="Delete"]');
            if (deleteIcon) {
                fireEvent.click(deleteIcon);
            }

            // Assert - Should show default error message
            await waitFor(() => {
                expect(screen.getByText('Failed to remove role')).toBeInTheDocument();
            });
        });
    });

    describe('Edge Cases', () => {
        it('should not call assignRole when selectedRole is empty', async () => {
            // Arrange
            const roles: string[] = [];

            render(<RoleManagement {...defaultProps} currentRoles={roles} />);

            // Assert - Button should be disabled when no role selected
            const assignButton = screen.getByRole('button', { name: /assign role/i });
            expect(assignButton).toBeDisabled();

            // Even if we force a click, assignRole should not be called
            // (disabled button won't fire click event)
            expect(mockAssignRole).not.toHaveBeenCalled();
        });

        it('should handle single role scenario correctly', () => {
            // Arrange
            const roles = ['User'];

            // Act
            render(<RoleManagement {...defaultProps} currentRoles={roles} />);

            // Assert - Should show the role and allow assigning Administrator
            expect(screen.getByText('User')).toBeInTheDocument();
            expect(screen.getByText('Assign New Role')).toBeInTheDocument();
        });

        it('should not render No roles assigned when roles exist', () => {
            // Arrange
            const roles = ['Administrator'];

            // Act
            render(<RoleManagement {...defaultProps} currentRoles={roles} />);

            // Assert
            expect(screen.queryByText('No roles assigned')).not.toBeInTheDocument();
        });

        it('should not render All available roles message when roles can be assigned', () => {
            // Arrange
            const roles = ['User']; // Administrator can still be assigned

            // Act
            render(<RoleManagement {...defaultProps} currentRoles={roles} />);

            // Assert
            expect(screen.queryByText('All available roles have been assigned')).not.toBeInTheDocument();
        });
    });
});
