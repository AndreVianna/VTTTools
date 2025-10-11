import React, { useState, useMemo } from 'react';
import { useSearchParams, useLocation } from 'react-router-dom';
import { Box } from '@mui/material';
import { LoginForm } from '@/components/auth/LoginForm';
import { SimpleLoginForm } from '@/components/auth/SimpleLoginForm';
import { SimpleRegistrationForm } from '@/components/auth/SimpleRegistrationForm';
import { PasswordResetRequestForm } from '@/components/auth/PasswordResetRequestForm';
import { PasswordResetConfirmForm } from '@/components/auth/PasswordResetConfirmForm';
import { TwoFactorVerificationForm } from '@/components/auth/TwoFactorVerificationForm';
import { RecoveryCodeForm } from '@/components/auth/RecoveryCodeForm';

type AuthMode =
  | 'login'
  | 'register'
  | 'reset-request'
  | 'reset-confirm'
  | 'two-factor'
  | 'recovery-code';

export const LoginPage: React.FC = () => {
  const [searchParams] = useSearchParams();
  const location = useLocation();

  // Derive initial mode from URL path and query parameters
  const initialMode = useMemo<AuthMode>(() => {
    const email = searchParams.get('email');
    const token = searchParams.get('token');

    if (email && token) return 'reset-confirm';
    if (location.pathname === '/register') return 'register';
    return 'login';
  }, [searchParams, location.pathname]);

  const [mode, setMode] = useState<AuthMode>(initialMode);

  const handleLoginResult = (result: any) => {
    if (result?.requiresTwoFactor) {
      setMode('two-factor');
    }
  };

  const renderCurrentForm = () => {
    switch (mode) {
      case 'login':
        return (
          <SimpleLoginForm
            onSwitchToRegister={() => setMode('register')}
            onSwitchToResetPassword={() => setMode('reset-request')}
          />
        );

      case 'register':
        return (
          <SimpleRegistrationForm
            onSwitchToLogin={() => setMode('login')}
          />
        );

      case 'reset-request':
        return (
          <PasswordResetRequestForm
            onSwitchToLogin={() => setMode('login')}
          />
        );

      case 'reset-confirm':
        return (
          <PasswordResetConfirmForm
            onSwitchToLogin={() => setMode('login')}
          />
        );

      case 'two-factor':
        return (
          <TwoFactorVerificationForm
            onSwitchToRecovery={() => setMode('recovery-code')}
            onBack={() => setMode('login')}
          />
        );

      case 'recovery-code':
        return (
          <RecoveryCodeForm
            onSwitchToTwoFactor={() => setMode('two-factor')}
            onBack={() => setMode('login')}
          />
        );

      default:
        return (
          <LoginForm
            onSwitchToRegister={() => setMode('register')}
            onSwitchToResetPassword={() => setMode('reset-request')}
            onLoginResult={handleLoginResult}
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