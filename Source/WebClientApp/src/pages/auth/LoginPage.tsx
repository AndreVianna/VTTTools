import React, { useState, useEffect } from 'react';
import { useSearchParams } from 'react-router-dom';
import { Box, Container, Typography, Paper } from '@mui/material';
import { LoginForm } from '@/components/auth/LoginForm';
import { RegistrationForm } from '@/components/auth/RegistrationForm';
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
  const [mode, setMode] = useState<AuthMode>('login');

  // Check URL parameters to determine initial mode
  useEffect(() => {
    const email = searchParams.get('email');
    const token = searchParams.get('token');

    // If we have email and token parameters, show password reset confirm form
    if (email && token) {
      setMode('reset-confirm');
    }
  }, [searchParams]);

  const handleLoginResult = (result: any) => {
    if (result?.requiresTwoFactor) {
      setMode('two-factor');
    }
  };

  const renderCurrentForm = () => {
    switch (mode) {
      case 'login':
        return (
          <LoginForm
            onSwitchToRegister={() => setMode('register')}
            onSwitchToResetPassword={() => setMode('reset-request')}
            onLoginResult={handleLoginResult}
          />
        );

      case 'register':
        return (
          <RegistrationForm
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
    <Container maxWidth="sm" sx={{ py: 8 }}>
      <Box
        sx={{
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center',
          minHeight: '80vh',
          justifyContent: 'center',
        }}
      >
        <Paper
          elevation={3}
          sx={{
            p: 4,
            width: '100%',
            maxWidth: mode === 'register' ? 500 : 400,
            borderRadius: 2,
            transition: 'max-width 0.3s ease-in-out',
          }}
        >
          {renderCurrentForm()}
        </Paper>

        <Box sx={{ mt: 4, textAlign: 'center' }}>
          <Typography variant="body2" color="text.secondary">
            VTT Tools - Professional Virtual Tabletop Tools for Content Creators
          </Typography>
        </Box>
      </Box>
    </Container>
  );
};