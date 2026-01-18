import React, { useCallback } from 'react';
import { alpha, Box, Button, Card, CardContent, Container, Divider, Stack, Typography, useTheme } from '@mui/material';
import {
    Cancel as CancelIcon,
    CheckCircle as CheckCircleIcon,
    LockOutlined as LockIcon,
    Security as SecurityIcon,
} from '@mui/icons-material';
import { useAuth } from '@/hooks/useAuth';

export const SecuritySettingsPage: React.FC = () => {
    // ═══════════════════════════════════════════════════════════════════════════
    // THEME
    // ═══════════════════════════════════════════════════════════════════════════
    const theme = useTheme();

    // ═══════════════════════════════════════════════════════════════════════════
    // CONTEXT HOOKS
    // ═══════════════════════════════════════════════════════════════════════════
    const { user } = useAuth();

    // ═══════════════════════════════════════════════════════════════════════════
    // DERIVED STATE
    // ═══════════════════════════════════════════════════════════════════════════
    const twoFactorEnabled = user?.twoFactorEnabled ?? false;

    // ═══════════════════════════════════════════════════════════════════════════
    // HANDLERS
    // ═══════════════════════════════════════════════════════════════════════════
    const handleChangePassword = useCallback(() => {
        alert('Change password coming soon');
    }, []);

    const handleEnableTwoFactor = useCallback(() => {
        alert('2FA setup coming soon');
    }, []);

    const handleDisableTwoFactor = useCallback(() => {
        alert('Disable 2FA coming soon');
    }, []);

    // ═══════════════════════════════════════════════════════════════════════════
    // RENDER
    // ═══════════════════════════════════════════════════════════════════════════
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
                <PasswordCard theme={theme} onChangePassword={handleChangePassword} />
                <TwoFactorCard
                    theme={theme}
                    twoFactorEnabled={twoFactorEnabled}
                    onEnable={handleEnableTwoFactor}
                    onDisable={handleDisableTwoFactor}
                />
            </Stack>
        </Container>
    );
};

// ═══════════════════════════════════════════════════════════════════════════
// CHILD COMPONENTS
// ═══════════════════════════════════════════════════════════════════════════

interface PasswordCardProps {
    theme: ReturnType<typeof useTheme>;
    onChangePassword: () => void;
}

const PasswordCard: React.FC<PasswordCardProps> = ({ theme, onChangePassword }) => (
    <Card
        sx={{
            backgroundColor: theme.palette.background.paper,
            boxShadow: theme.shadows[2],
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
                    Keep your account secure with a strong password. We recommend changing your password regularly and using
                    a unique password that you don&apos;t use elsewhere.
                </Typography>

                <Divider />

                <Box>
                    <Button
                        variant="contained"
                        startIcon={<LockIcon />}
                        onClick={onChangePassword}
                        sx={{ textTransform: 'none' }}
                    >
                        Change Password
                    </Button>
                </Box>
            </Stack>
        </CardContent>
    </Card>
);

interface TwoFactorCardProps {
    theme: ReturnType<typeof useTheme>;
    twoFactorEnabled: boolean;
    onEnable: () => void;
    onDisable: () => void;
}

const TwoFactorCard: React.FC<TwoFactorCardProps> = ({ theme, twoFactorEnabled, onEnable, onDisable }) => (
    <Card
        sx={{
            backgroundColor: theme.palette.background.paper,
            boxShadow: theme.shadows[2],
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

                <TwoFactorStatus theme={theme} enabled={twoFactorEnabled} />

                <Typography variant="body2" color="text.secondary">
                    Two-factor authentication adds an extra layer of security to your account by requiring a verification
                    code from your mobile device in addition to your password when signing in.
                </Typography>

                <Divider />

                <Box>
                    {twoFactorEnabled ? (
                        <Button
                            variant="outlined"
                            color="error"
                            startIcon={<CancelIcon />}
                            onClick={onDisable}
                            sx={{ textTransform: 'none' }}
                        >
                            Disable 2FA
                        </Button>
                    ) : (
                        <Button
                            variant="contained"
                            color="success"
                            startIcon={<SecurityIcon />}
                            onClick={onEnable}
                            sx={{ textTransform: 'none' }}
                        >
                            Enable 2FA
                        </Button>
                    )}
                </Box>
            </Stack>
        </CardContent>
    </Card>
);

interface TwoFactorStatusProps {
    theme: ReturnType<typeof useTheme>;
    enabled: boolean;
}

const TwoFactorStatus: React.FC<TwoFactorStatusProps> = ({ theme, enabled }) => (
    <Box
        sx={{
            display: 'flex',
            alignItems: 'center',
            gap: 1,
            padding: theme.spacing(1.5),
            borderRadius: 1,
            backgroundColor: alpha(
                enabled ? theme.palette.success.main : theme.palette.grey[500],
                0.15
            ),
        }}
    >
        {enabled ? (
            <>
                <CheckCircleIcon sx={{ color: theme.palette.success.main, fontSize: 20 }} />
                <Typography variant="body2" sx={{ fontWeight: 600, color: theme.palette.success.main }}>
                    2FA Enabled
                </Typography>
            </>
        ) : (
            <>
                <CancelIcon sx={{ color: theme.palette.text.secondary, fontSize: 20 }} />
                <Typography variant="body2" sx={{ fontWeight: 600, color: theme.palette.text.secondary }}>
                    2FA Disabled
                </Typography>
            </>
        )}
    </Box>
);
