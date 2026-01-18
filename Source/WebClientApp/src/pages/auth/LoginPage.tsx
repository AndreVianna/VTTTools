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

const getInitialMode = (pathname: string): AuthMode => {
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
    const [mode, setMode] = useState<AuthMode>(() => getInitialMode(location.pathname));
    const [successMessage, setSuccessMessage] = useState<string | null>(null);

    // ═══════════════════════════════════════════════════════════════════════════
    // EFFECTS
    // ═══════════════════════════════════════════════════════════════════════════
    useEffect(() => {
        if (location.pathname === '/reset-password') {
            setMode('reset-confirm');
        } else if (location.pathname === '/register') {
            setMode('register');
        } else if (location.pathname === '/login') {
            setMode('login');
        }

        const message = location.state?.successMessage;
        if (message) {
            setSuccessMessage(message);
            window.history.replaceState({}, document.title);
        }
    }, [location.pathname, location.state]);

    // ═══════════════════════════════════════════════════════════════════════════
    // HANDLERS
    // ═══════════════════════════════════════════════════════════════════════════
    const handleSwitchToLogin = useCallback(() => {
        navigate('/login');
    }, [navigate]);

    const handleSwitchToRegister = useCallback(() => {
        navigate('/register');
    }, [navigate]);

    const handleSwitchToResetPassword = useCallback(() => {
        navigate('/forgot-password');
    }, [navigate]);

    const handleSwitchToRecoveryCode = useCallback(() => {
        setMode('recovery-code');
    }, []);

    const handleSwitchToTwoFactor = useCallback(() => {
        setMode('two-factor');
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
