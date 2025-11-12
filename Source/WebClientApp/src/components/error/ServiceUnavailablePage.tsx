import { Refresh as RefreshIcon } from '@mui/icons-material';
import { Button, Container, Paper, Typography } from '@mui/material';
import { styled } from '@mui/material/styles';
import type React from 'react';

// Professional Error Card
const ErrorCard = styled(Paper)(() => ({
  maxWidth: '500px',
  margin: '0 auto',
  padding: '64px 48px',
  borderRadius: '16px',
  boxShadow: '0 20px 25px rgba(17, 24, 39, 0.1), 0 10px 10px rgba(17, 24, 39, 0.04)',
  backgroundColor: '#FFFFFF',
  border: '1px solid rgba(220, 38, 38, 0.08)',
  textAlign: 'center',

  // Subtle background pattern
  background: `
    linear-gradient(135deg, transparent 0%, rgba(220, 38, 38, 0.02) 100%),
    #FFFFFF
  `,
}));

// Professional Retry Button
const RetryButton = styled(Button)(({ theme }) => ({
  borderRadius: '12px',
  padding: '14px 32px',
  fontSize: '0.975rem',
  fontWeight: 500,
  textTransform: 'none',
  letterSpacing: '0.025em',
  boxShadow: 'none',

  '&.MuiButton-contained': {
    background: `linear-gradient(135deg, ${theme.palette.primary.main} 0%, ${theme.palette.primary.dark} 100%)`,

    '&:hover': {
      background: `linear-gradient(135deg, ${theme.palette.primary.light} 0%, ${theme.palette.primary.main} 100%)`,
      transform: 'translateY(-2px)',
      boxShadow: '0 8px 16px rgba(37, 99, 235, 0.25)',
    },

    '&:active': {
      transform: 'translateY(0)',
    },
  },
}));

interface ServiceUnavailablePageProps {
  onRetry?: () => void;
}

export const ServiceUnavailablePage: React.FC<ServiceUnavailablePageProps> = ({ onRetry }) => {
  const handleRetry = () => {
    if (onRetry) {
      onRetry();
    } else {
      // Default action - reload the page
      window.location.reload();
    }
  };

  return (
    <Container maxWidth='sm' sx={{ py: 8 }}>
      <ErrorCard>
        <Typography
          variant='h2'
          component='h1'
          sx={{
            fontSize: '1.875rem',
            fontWeight: 600,
            color: (theme) => theme.palette.text.primary,
            marginBottom: '16px',
          }}
        >
          Adventure Temporarily Unavailable
        </Typography>

        <Typography
          variant='body1'
          sx={{
            fontSize: '1.125rem',
            color: (theme) => theme.palette.text.secondary,
            lineHeight: 1.6,
            marginBottom: '40px',
            maxWidth: '400px',
            margin: '0 auto 40px',
          }}
        >
          Our servers are taking a short rest. Please try again in a moment while we prepare your next world campaign.
        </Typography>

        <RetryButton variant='contained' startIcon={<RefreshIcon />} onClick={handleRetry} size='large'>
          Retry Connection
        </RetryButton>
      </ErrorCard>
    </Container>
  );
};
