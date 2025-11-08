import React, { useState, useEffect, useCallback } from 'react';
import {
    Dialog,
    DialogTitle,
    DialogContent,
    DialogActions,
    Button,
    Box,
    Typography,
    Grid,
    Chip,
    CircularProgress,
    Divider,
    IconButton,
    Tabs,
    Tab,
} from '@mui/material';
import {
    Close as CloseIcon,
    Lock as LockIcon,
    LockOpen as UnlockIcon,
    VerifiedUser as VerifiedIcon,
    Password as PasswordIcon,
} from '@mui/icons-material';
import { userService, UserDetailResponse } from '@services/userService';
import { RoleManagement } from '@components/users/RoleManagement';
import { UserActivity } from '@components/users/UserActivity';

interface UserDetailModalProps {
    open: boolean;
    userId: string | null;
    onClose: () => void;
    onUserUpdated?: () => void;
}

interface TabPanelProps {
    children?: React.ReactNode;
    index: number;
    value: number;
}

const TabPanel = ({ children, value, index }: TabPanelProps) => (
    <div hidden={value !== index} style={{ paddingTop: 16 }}>
        {value === index && children}
    </div>
);

export function UserDetailModal({
    open,
    userId,
    onClose,
    onUserUpdated,
}: UserDetailModalProps) {
    const [user, setUser] = useState<UserDetailResponse | null>(null);
    const [loading, setLoading] = useState(false);
    const [tabValue, setTabValue] = useState(0);
    const [actionLoading, setActionLoading] = useState(false);

    const loadUserDetails = useCallback(async () => {
        if (!userId) return;

        setLoading(true);
        try {
            const data = await userService.getUserById(userId);
            setUser(data);
        } catch (error) {
            console.error('Failed to load user details:', error);
        } finally {
            setLoading(false);
        }
    }, [userId]);

    useEffect(() => {
        if (open && userId) {
            loadUserDetails();
        }
    }, [open, userId, loadUserDetails]);

    const handleClose = () => {
        setUser(null);
        setTabValue(0);
        onClose();
    };

    const handleLockUser = async () => {
        if (!userId) return;

        setActionLoading(true);
        try {
            await userService.lockUser(userId);
            await loadUserDetails();
            onUserUpdated?.();
        } catch (error) {
            console.error('Failed to lock user:', error);
        } finally {
            setActionLoading(false);
        }
    };

    const handleUnlockUser = async () => {
        if (!userId) return;

        setActionLoading(true);
        try {
            await userService.unlockUser(userId);
            await loadUserDetails();
            onUserUpdated?.();
        } catch (error) {
            console.error('Failed to unlock user:', error);
        } finally {
            setActionLoading(false);
        }
    };

    const handleVerifyEmail = async () => {
        if (!userId) return;

        setActionLoading(true);
        try {
            await userService.verifyEmail(userId);
            await loadUserDetails();
            onUserUpdated?.();
        } catch (error) {
            console.error('Failed to verify email:', error);
        } finally {
            setActionLoading(false);
        }
    };

    const handleResetPassword = async () => {
        if (!userId || !user) return;

        setActionLoading(true);
        try {
            await userService.sendPasswordReset(userId, user.email);
            console.log('Password reset email sent');
        } catch (error) {
            console.error('Failed to send password reset:', error);
        } finally {
            setActionLoading(false);
        }
    };

    const formatDate = (dateString?: string) => {
        if (!dateString) return 'N/A';
        return new Date(dateString).toLocaleString();
    };

    return (
        <Dialog open={open} onClose={handleClose} maxWidth="md" fullWidth>
            <DialogTitle>
                <Box display="flex" alignItems="center" justifyContent="space-between">
                    <Typography variant="h6">User Details</Typography>
                    <IconButton onClick={handleClose} size="small">
                        <CloseIcon />
                    </IconButton>
                </Box>
            </DialogTitle>

            <DialogContent>
                {loading ? (
                    <Box display="flex" justifyContent="center" p={4}>
                        <CircularProgress />
                    </Box>
                ) : user ? (
                    <>
                        <Tabs value={tabValue} onChange={(_, v) => setTabValue(v)}>
                            <Tab label="Information" />
                            <Tab label="Roles" />
                            <Tab label="Activity" />
                        </Tabs>

                        <TabPanel value={tabValue} index={0}>
                            <Grid container spacing={2}>
                                <Grid size={{ xs: 12, sm: 6 }}>
                                    <Typography variant="subtitle2" color="textSecondary">
                                        Email
                                    </Typography>
                                    <Typography>{user.email}</Typography>
                                </Grid>
                                <Grid size={{ xs: 12, sm: 6 }}>
                                    <Typography variant="subtitle2" color="textSecondary">
                                        Display Name
                                    </Typography>
                                    <Typography>{user.displayName}</Typography>
                                </Grid>
                                <Grid size={{ xs: 12, sm: 6 }}>
                                    <Typography variant="subtitle2" color="textSecondary">
                                        Phone Number
                                    </Typography>
                                    <Typography>{user.phoneNumber || 'N/A'}</Typography>
                                </Grid>
                                <Grid size={{ xs: 12, sm: 6 }}>
                                    <Typography variant="subtitle2" color="textSecondary">
                                        Status
                                    </Typography>
                                    <Chip
                                        label={user.isLockedOut ? 'Locked' : 'Active'}
                                        color={user.isLockedOut ? 'error' : 'success'}
                                        size="small"
                                    />
                                </Grid>
                                <Grid size={{ xs: 12, sm: 6 }}>
                                    <Typography variant="subtitle2" color="textSecondary">
                                        Email Confirmed
                                    </Typography>
                                    <Chip
                                        label={user.emailConfirmed ? 'Yes' : 'No'}
                                        color={user.emailConfirmed ? 'success' : 'default'}
                                        size="small"
                                    />
                                </Grid>
                                <Grid size={{ xs: 12, sm: 6 }}>
                                    <Typography variant="subtitle2" color="textSecondary">
                                        Phone Confirmed
                                    </Typography>
                                    <Chip
                                        label={user.phoneNumberConfirmed ? 'Yes' : 'No'}
                                        color={user.phoneNumberConfirmed ? 'success' : 'default'}
                                        size="small"
                                    />
                                </Grid>
                                <Grid size={{ xs: 12, sm: 6 }}>
                                    <Typography variant="subtitle2" color="textSecondary">
                                        Two-Factor Enabled
                                    </Typography>
                                    <Chip
                                        label={user.twoFactorEnabled ? 'Yes' : 'No'}
                                        color={user.twoFactorEnabled ? 'success' : 'default'}
                                        size="small"
                                    />
                                </Grid>
                                <Grid size={{ xs: 12, sm: 6 }}>
                                    <Typography variant="subtitle2" color="textSecondary">
                                        Failed Login Attempts
                                    </Typography>
                                    <Typography>{user.accessFailedCount}</Typography>
                                </Grid>
                                <Grid size={{ xs: 12 }}>
                                    <Divider sx={{ my: 1 }} />
                                </Grid>
                                <Grid size={{ xs: 12, sm: 6 }}>
                                    <Typography variant="subtitle2" color="textSecondary">
                                        Created Date
                                    </Typography>
                                    <Typography>{formatDate(user.createdDate)}</Typography>
                                </Grid>
                                <Grid size={{ xs: 12, sm: 6 }}>
                                    <Typography variant="subtitle2" color="textSecondary">
                                        Last Login
                                    </Typography>
                                    <Typography>{formatDate(user.lastLoginDate)}</Typography>
                                </Grid>
                                <Grid size={{ xs: 12, sm: 6 }}>
                                    <Typography variant="subtitle2" color="textSecondary">
                                        Last Modified
                                    </Typography>
                                    <Typography>{formatDate(user.lastModifiedDate)}</Typography>
                                </Grid>
                                {user.isLockedOut && user.lockoutEnd && (
                                    <Grid size={{ xs: 12, sm: 6 }}>
                                        <Typography variant="subtitle2" color="textSecondary">
                                            Lockout Until
                                        </Typography>
                                        <Typography>{formatDate(user.lockoutEnd)}</Typography>
                                    </Grid>
                                )}
                            </Grid>
                        </TabPanel>

                        <TabPanel value={tabValue} index={1}>
                            <RoleManagement
                                userId={userId!}
                                currentRoles={user.roles}
                                onRolesUpdated={async () => {
                                    await loadUserDetails();
                                    onUserUpdated?.();
                                }}
                            />
                        </TabPanel>

                        <TabPanel value={tabValue} index={2}>
                            <UserActivity userId={userId!} />
                        </TabPanel>
                    </>
                ) : (
                    <Typography>Failed to load user details</Typography>
                )}
            </DialogContent>

            <DialogActions>
                <Box display="flex" gap={1} width="100%" justifyContent="space-between">
                    <Box display="flex" gap={1}>
                        {user && !user.emailConfirmed && (
                            <Button
                                startIcon={<VerifiedIcon />}
                                onClick={handleVerifyEmail}
                                disabled={actionLoading}
                            >
                                Verify Email
                            </Button>
                        )}
                        {user && (
                            <Button
                                startIcon={<PasswordIcon />}
                                onClick={handleResetPassword}
                                disabled={actionLoading}
                            >
                                Reset Password
                            </Button>
                        )}
                    </Box>
                    <Box display="flex" gap={1}>
                        {user?.isLockedOut ? (
                            <Button
                                startIcon={<UnlockIcon />}
                                onClick={handleUnlockUser}
                                disabled={actionLoading}
                                variant="contained"
                                color="success"
                            >
                                Unlock User
                            </Button>
                        ) : (
                            <Button
                                startIcon={<LockIcon />}
                                onClick={handleLockUser}
                                disabled={actionLoading}
                                variant="contained"
                                color="error"
                            >
                                Lock User
                            </Button>
                        )}
                        <Button onClick={handleClose} variant="outlined">
                            Close
                        </Button>
                    </Box>
                </Box>
            </DialogActions>
        </Dialog>
    );
}
