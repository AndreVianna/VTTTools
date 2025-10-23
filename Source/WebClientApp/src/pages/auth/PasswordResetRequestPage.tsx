import React from 'react';
import { useNavigate } from 'react-router-dom';
import { PasswordResetRequestForm } from '@/components/auth/PasswordResetRequestForm';

export const PasswordResetRequestPage: React.FC = () => {
  const navigate = useNavigate();

  return (
    <PasswordResetRequestForm
      onSwitchToLogin={() => navigate('/login')}
    />
  );
};
