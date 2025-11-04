import { useState } from 'react';
import {
    Box,
    Typography,
    Chip,
    FormControl,
    InputLabel,
    Select,
    MenuItem,
    Button,
    Alert,
    CircularProgress,
} from '@mui/material';
import {
    Add as AddIcon,
    Delete as DeleteIcon,
} from '@mui/icons-material';
import { userService } from '@services/userService';

interface RoleManagementProps {
    userId: string;
    currentRoles: string[];
    onRolesUpdated: () => void;
}

export function RoleManagement({
    userId,
    currentRoles,
    onRolesUpdated,
}: RoleManagementProps) {
    const [selectedRole, setSelectedRole] = useState('');
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState<string | null>(null);

    const availableRoles = ['Administrator', 'User'];

    const assignableRoles = availableRoles.filter(
        role => !currentRoles.includes(role)
    );

    const handleAssignRole = async () => {
        if (!selectedRole) return;

        setLoading(true);
        setError(null);
        try {
            await userService.assignRole(userId, { roleName: selectedRole });
            setSelectedRole('');
            onRolesUpdated();
        } catch (err: any) {
            setError(err.response?.data?.error || 'Failed to assign role');
        } finally {
            setLoading(false);
        }
    };

    const handleRemoveRole = async (roleName: string) => {
        setLoading(true);
        setError(null);
        try {
            await userService.removeRole(userId, roleName);
            onRolesUpdated();
        } catch (err: any) {
            setError(err.response?.data?.error || 'Failed to remove role');
        } finally {
            setLoading(false);
        }
    };

    return (
        <Box>
            {error && (
                <Alert severity="error" sx={{ mb: 2 }} onClose={() => setError(null)}>
                    {error}
                </Alert>
            )}

            <Typography variant="subtitle2" gutterBottom>
                Assigned Roles
            </Typography>

            {currentRoles.length === 0 ? (
                <Typography variant="body2" color="textSecondary" sx={{ mb: 2 }}>
                    No roles assigned
                </Typography>
            ) : (
                <Box display="flex" gap={1} flexWrap="wrap" mb={2}>
                    {currentRoles.map(role => (
                        <Chip
                            key={role}
                            label={role}
                            color="primary"
                            onDelete={() => handleRemoveRole(role)}
                            deleteIcon={<DeleteIcon />}
                            disabled={loading}
                        />
                    ))}
                </Box>
            )}

            {assignableRoles.length > 0 && (
                <>
                    <Typography variant="subtitle2" gutterBottom sx={{ mt: 3 }}>
                        Assign New Role
                    </Typography>
                    <Box display="flex" gap={2} alignItems="center">
                        <FormControl sx={{ minWidth: 200 }}>
                            <InputLabel>Select Role</InputLabel>
                            <Select
                                value={selectedRole}
                                label="Select Role"
                                onChange={(e) => setSelectedRole(e.target.value)}
                                disabled={loading}
                            >
                                {assignableRoles.map(role => (
                                    <MenuItem key={role} value={role}>
                                        {role}
                                    </MenuItem>
                                ))}
                            </Select>
                        </FormControl>
                        <Button
                            variant="contained"
                            startIcon={loading ? <CircularProgress size={20} /> : <AddIcon />}
                            onClick={handleAssignRole}
                            disabled={!selectedRole || loading}
                        >
                            Assign Role
                        </Button>
                    </Box>
                </>
            )}

            {assignableRoles.length === 0 && currentRoles.length > 0 && (
                <Typography variant="body2" color="textSecondary" sx={{ mt: 2 }}>
                    All available roles have been assigned
                </Typography>
            )}
        </Box>
    );
}
