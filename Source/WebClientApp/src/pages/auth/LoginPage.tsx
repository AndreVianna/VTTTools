import React, { useState, useMemo } from 'react';
import { useSearchParams, useLocation, useNavigate } from 'react-router-dom';
import { Box, Alert } from '@mui/material';
import { SimpleLoginForm } from '@/components/auth/SimpleLoginForm';
import { SimpleRegistrationForm } from '@/components/auth/SimpleRegistrationForm';
import { PasswordResetRequestForm } from '@/components/Auth/PasswordResetRequestForm';
import { PasswordResetConfirmForm } from '@/components/auth/PasswordResetConfirmForm';
import { TwoFactorVerificationForm } from '@/components/auth/TwoFactorVerificationForm';
import { RecoveryCodeForm } from '@/components/auth/RecoveryCodeForm';

type AuthMode =
  | 'login'
  | 'register'
  | 'reset-confirm'
  | 'two-factor'
  | 'recovery-code';

export const LoginPage: React.FC = () => {
  const [searchParams] = useSearchParams();
  const location = useLocation();
  const navigate = useNavigate();

  const initialMode = useMemo<AuthMode>(() => {
    if (location.pathname === '/reset-password') return 'reset-confirm';
    if (location.pathname === '/register') return 'register';
    return 'login';
  }, [location.pathname]);

  const [mode, setMode] = useState<AuthMode>(initialMode);
  const [successMessage, setSuccessMessage] = useState<string | null>(null);

  React.useEffect(() => {
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
  }, [location.pathname, location.state, searchParams]);

  const handleSwitchToLogin = () => {
    navigate('/login');
  };

  const handleSwitchToRegister = () => {
    navigate('/register');
  };

  const handleSwitchToResetPassword = () => {
    navigate('/forgot-password');
  };

  const handleSwitchToRecoveryCode = () => {
    setMode('recovery-code');
  };

  const handleSwitchToTwoFactor = () => {
    setMode('two-factor');
  };

  const renderCurrentForm = () => {
    switch (mode) {
      case 'login':
        return (
          <SimpleLoginForm
            onSwitchToRegister={handleSwitchToRegister}
            onSwitchToResetPassword={handleSwitchToResetPassword}
          />
        );

      case 'register':
        return (
          <SimpleRegistrationForm
            onSwitchToLogin={handleSwitchToLogin}
          />
        );

      case 'reset-request':
        return (
          <PasswordResetRequestForm
            onSwitchToLogin={handleSwitchToLogin}
          />
        );

      case 'reset-confirm':
        return (
          <PasswordResetConfirmForm
            onSwitchToLogin={handleSwitchToLogin}
          />
        );

      case 'two-factor':
        return (
          <TwoFactorVerificationForm
            onSwitchToRecovery={handleSwitchToRecoveryCode}
            onBack={handleSwitchToLogin}
          />
        );

      case 'recovery-code':
        return (
          <RecoveryCodeForm
            onSwitchToTwoFactor={handleSwitchToTwoFactor}
            onBack={handleSwitchToLogin}
          />
        );
    }
  };

  return (
    <Box>
      {successMessage && (
        <Alert
          severity="success"
          onClose={() => setSuccessMessage(null)}
          sx={{
            maxWidth: '440px',
            margin: '0 auto 24px auto',
            borderRadius: '12px',
          }}
        >
          {successMessage}
        </Alert>
      )}
      {renderCurrentForm()}
    </Box>
  );
};