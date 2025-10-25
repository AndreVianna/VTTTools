import React from 'react';
import {
    Box,
    Button,
    Card,
    CardContent,
    Container,
    Divider,
    Stack,
    Typography,
    useTheme
} from '@mui/material';
import {
    LockOutlined as LockIcon,
    Security as SecurityIcon,
    CheckCircle as CheckCircleIcon,
    Cancel as CancelIcon
} from '@mui/icons-material';
import { useAuth } from '@/hooks/useAuth';

export const SecuritySettingsPage: React.FC = () => {
    const theme = useTheme();
    const { user } = useAuth();

    const handleChangePassword = () => {
        alert('Change password coming soon');
    };

    const handleEnableTwoFactor = () => {
        alert('2FA setup coming soon');
    };

    const handleDisableTwoFactor = () => {
        alert('Disable 2FA coming soon');
    };

    const twoFactorEnabled = user?.twoFactorEnabled ?? false;

    return (
        <Container maxWidth="md" sx={{ py: 4 }}>
            <Box sx={{ mb: 4 }}>
                <Typography variant="h4" component="h1" gutterBottom>
                    Security Settings
                </Typography>
                <Typography variant="body2" color="text.secondary">
                    Manage your account security and authentication preferences
                </Typography>
            </Box>

            <Stack spacing={3}>
                <Card
                    sx={{
                        backgroundColor: theme.palette.background.paper,
                        boxShadow: theme.shadows[2]
                    }}
                >
                    <CardContent>
                        <Stack spacing={2}>
                            <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                                <LockIcon color="primary" />
                                <Typography variant="h6" component="h2">
                                    Password
                                </Typography>
                            </Box>

                            <Typography variant="body2" color="text.secondary">
                                Keep your account secure with a strong password. We recommend changing your password regularly and using a unique password that you don&apos;t use elsewhere.
                            </Typography>

                            <Divider />

                            <Box>
                                <Button
                                    variant="contained"
                                    startIcon={<LockIcon />}
                                    onClick={handleChangePassword}
                                    sx={{ textTransform: 'none' }}
                                >
                                    Change Password
                                </Button>
                            </Box>
                        </Stack>
                    </CardContent>
                </Card>

                <Card
                    sx={{
                        backgroundColor: theme.palette.background.paper,
                        boxShadow: theme.shadows[2]
                    }}
                >
                    <CardContent>
                        <Stack spacing={2}>
                            <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                                <SecurityIcon color="primary" />
                                <Typography variant="h6" component="h2">
                                    Two-Factor Authentication
                                </Typography>
                            </Box>

                            <Box
                                sx={{
                                    display: 'flex',
                                    alignItems: 'center',
                                    gap: 1,
                                    padding: theme.spacing(1.5),
                                    borderRadius: 1,
                                    backgroundColor: twoFactorEnabled
                                        ? theme.palette.mode === 'dark'
                                            ? 'rgba(76, 175, 80, 0.15)'
                                            : 'rgba(76, 175, 80, 0.1)'
                                        : theme.palette.mode === 'dark'
                                            ? 'rgba(158, 158, 158, 0.15)'
                                            : 'rgba(158, 158, 158, 0.1)'
                                }}
                            >
                                {twoFactorEnabled ? (
                                    <>
                                        <CheckCircleIcon
                                            sx={{
                                                color: theme.palette.success.main,
                                                fontSize: 20
                                            }}
                                        />
                                        <Typography
                                            variant="body2"
                                            sx={{
                                                fontWeight: 600,
                                                color: theme.palette.success.main
                                            }}
                                        >
                                            2FA Enabled
                                        </Typography>
                                    </>
                                ) : (
                                    <>
                                        <CancelIcon
                                            sx={{
                                                color: theme.palette.text.secondary,
                                                fontSize: 20
                                            }}
                                        />
                                        <Typography
                                            variant="body2"
                                            sx={{
                                                fontWeight: 600,
                                                color: theme.palette.text.secondary
                                            }}
                                        >
                                            2FA Disabled
                                        </Typography>
                                    </>
                                )}
                            </Box>

                            <Typography variant="body2" color="text.secondary">
                                Two-factor authentication adds an extra layer of security to your account by requiring a verification code from your mobile device in addition to your password when signing in.
                            </Typography>

                            <Divider />

                            <Box>
                                {twoFactorEnabled ? (
                                    <Button
                                        variant="outlined"
                                        color="error"
                                        startIcon={<CancelIcon />}
                                        onClick={handleDisableTwoFactor}
                                        sx={{ textTransform: 'none' }}
                                    >
                                        Disable 2FA
                                    </Button>
                                ) : (
                                    <Button
                                        variant="contained"
                                        color="success"
                                        startIcon={<SecurityIcon />}
                                        onClick={handleEnableTwoFactor}
                                        sx={{ textTransform: 'none' }}
                                    >
                                        Enable 2FA
                                    </Button>
                                )}
                            </Box>
                        </Stack>
                    </CardContent>
                </Card>
            </Stack>
        </Container>
    );
};
