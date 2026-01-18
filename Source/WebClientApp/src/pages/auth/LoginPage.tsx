import React, { useCallback, useEffect, useState } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import { Alert, Box } from '@mui/material';
import { PasswordResetConfirmForm } from '@/components/auth/PasswordResetConfirmForm';
import { PasswordResetRequestForm } from '@/components/auth/PasswordResetRequestForm';
import { RecoveryCodeForm } from '@/components/auth/RecoveryCodeForm';
import { SimpleLoginForm } from '@/components/auth/SimpleLoginForm';
import { SimpleRegistrationForm } from '@/components/auth/SimpleRegistrationForm';
import { TwoFactorVerificationForm } from '@/components/auth/TwoFactorVerificationForm';

// ═══════════════════════════════════════════════════════════════════════════
// TYPES
// ═══════════════════════════════════════════════════════════════════════════

type AuthMode = 'login' | 'register' | 'reset-request' | 'reset-confirm' | 'two-factor' | 'recovery-code';

// ═══════════════════════════════════════════════════════════════════════════
// HELPERS
// ═══════════════════════════════════════════════════════════════════════════

const getModeFromPathname = (pathname: string): AuthMode => {
    if (pathname === '/reset-password') return 'reset-confirm';
    if (pathname === '/register') return 'register';
    return 'login';
};

// ═══════════════════════════════════════════════════════════════════════════
// COMPONENT
// ═══════════════════════════════════════════════════════════════════════════

export const LoginPage: React.FC = () => {
    // ═══════════════════════════════════════════════════════════════════════════
    // ROUTING
    // ═══════════════════════════════════════════════════════════════════════════
    const location = useLocation();
    const navigate = useNavigate();

    // ═══════════════════════════════════════════════════════════════════════════
    // STATE
    // ═══════════════════════════════════════════════════════════════════════════
    // modeOverride: internal transitions (two-factor, recovery-code) that don't change URL
    // trackedPathname: tracks pathname to detect URL navigation
    const [modeOverride, setModeOverride] = useState<AuthMode | null>(null);
    const [trackedPathname, setTrackedPathname] = useState(location.pathname);
    const [successMessage, setSuccessMessage] = useState<string | null>(null);

    // ═══════════════════════════════════════════════════════════════════════════
    // DERIVED STATE (with render-time sync - getDerivedStateFromProps pattern)
    // ═══════════════════════════════════════════════════════════════════════════
    // When URL changes, reset internal mode override to follow the URL
    if (location.pathname !== trackedPathname) {
        setTrackedPathname(location.pathname);
        setModeOverride(null);
    }

    // Effective mode: override takes precedence, otherwise derive from URL
    const mode = modeOverride ?? getModeFromPathname(location.pathname);

    // ═══════════════════════════════════════════════════════════════════════════
    // EFFECTS
    // ═══════════════════════════════════════════════════════════════════════════
    // Display success message from navigation state (e.g., after registration redirect)
    useEffect(() => {
        const message = location.state?.successMessage;
        if (message) {
            // eslint-disable-next-line react-hooks/set-state-in-effect -- Valid pattern: display message from navigation state
            setSuccessMessage(message);
            window.history.replaceState({}, document.title);
        }
    }, [location.state]);

    // ═══════════════════════════════════════════════════════════════════════════
    // HANDLERS
    // ═══════════════════════════════════════════════════════════════════════════
    const handleSwitchToLogin = useCallback(() => {
        setModeOverride(null); // Clear override before navigating
        navigate('/login');
    }, [navigate]);

    const handleSwitchToRegister = useCallback(() => {
        setModeOverride(null);
        navigate('/register');
    }, [navigate]);

    const handleSwitchToResetPassword = useCallback(() => {
        setModeOverride(null);
        navigate('/forgot-password');
    }, [navigate]);

    const handleSwitchToRecoveryCode = useCallback(() => {
        setModeOverride('recovery-code');
    }, []);

    const handleSwitchToTwoFactor = useCallback(() => {
        setModeOverride('two-factor');
    }, []);

    const handleDismissSuccess = useCallback(() => {
        setSuccessMessage(null);
    }, []);

    // ═══════════════════════════════════════════════════════════════════════════
    // RENDER
    // ═══════════════════════════════════════════════════════════════════════════
    return (
        <Box>
            {successMessage && (
                <Alert
                    severity="success"
                    onClose={handleDismissSuccess}
                    sx={{
                        maxWidth: '440px',
                        margin: '0 auto 24px auto',
                        borderRadius: '12px',
                    }}
                >
                    {successMessage}
                </Alert>
            )}
            <AuthForm
                mode={mode}
                onSwitchToLogin={handleSwitchToLogin}
                onSwitchToRegister={handleSwitchToRegister}
                onSwitchToResetPassword={handleSwitchToResetPassword}
                onSwitchToRecoveryCode={handleSwitchToRecoveryCode}
                onSwitchToTwoFactor={handleSwitchToTwoFactor}
            />
        </Box>
    );
};

// ═══════════════════════════════════════════════════════════════════════════
// CHILD COMPONENTS
// ═══════════════════════════════════════════════════════════════════════════

interface AuthFormProps {
    mode: AuthMode;
    onSwitchToLogin: () => void;
    onSwitchToRegister: () => void;
    onSwitchToResetPassword: () => void;
    onSwitchToRecoveryCode: () => void;
    onSwitchToTwoFactor: () => void;
}

const AuthForm: React.FC<AuthFormProps> = ({
    mode,
    onSwitchToLogin,
    onSwitchToRegister,
    onSwitchToResetPassword,
    onSwitchToRecoveryCode,
    onSwitchToTwoFactor,
}) => {
    switch (mode) {
        case 'login':
            return (
                <SimpleLoginForm
                    onSwitchToRegister={onSwitchToRegister}
                    onSwitchToResetPassword={onSwitchToResetPassword}
                />
            );

        case 'register':
            return <SimpleRegistrationForm onSwitchToLogin={onSwitchToLogin} />;

        case 'reset-request':
            return <PasswordResetRequestForm onSwitchToLogin={onSwitchToLogin} />;

        case 'reset-confirm':
            return <PasswordResetConfirmForm onSwitchToLogin={onSwitchToLogin} />;

        case 'two-factor':
            return (
                <TwoFactorVerificationForm onSwitchToRecovery={onSwitchToRecoveryCode} onBack={onSwitchToLogin} />
            );

        case 'recovery-code':
            return <RecoveryCodeForm onSwitchToTwoFactor={onSwitchToTwoFactor} onBack={onSwitchToLogin} />;
    }
};
