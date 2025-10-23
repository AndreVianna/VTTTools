import React, { useState, useMemo } from 'react';
import { useSearchParams, useLocation, useNavigate } from 'react-router-dom';
import { Box } from '@mui/material';
import { SimpleLoginForm } from '@/components/auth/SimpleLoginForm';
import { SimpleRegistrationForm } from '@/components/auth/SimpleRegistrationForm';
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
    const email = searchParams.get('email');
    const token = searchParams.get('token');

    if (email && token) return 'reset-confirm';
    if (location.pathname === '/register') return 'register';
    return 'login';
  }, [searchParams, location.pathname]);

  const [mode, setMode] = useState<AuthMode>(initialMode);

  React.useEffect(() => {
    const email = searchParams.get('email');
    const token = searchParams.get('token');

    if (email && token) {
      setMode('reset-confirm');
    } else if (location.pathname === '/register') {
      setMode('register');
    } else if (location.pathname === '/login') {
      setMode('login');
    }
  }, [location.pathname, searchParams]);

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
      {renderCurrentForm()}
    </Box>
  );
};