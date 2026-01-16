import {
  Create as CreateIcon,
  LibraryBooks as LibraryIcon,
  Map as MapIcon,
  Settings as SettingsIcon,
} from '@mui/icons-material';
import { Box, Button, Card, CardActions, CardContent, Container, Grid, Typography, useTheme } from '@mui/material';
import { styled } from '@mui/material/styles';
import type React from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '@/hooks/useAuth';

// Professional Hero Section with gradient background
const HeroContainer = styled(Box)(({ theme }) => ({
  background: `linear-gradient(135deg, ${theme.palette.primary.main} 0%, ${theme.palette.secondary.main} 100%)`,
  borderRadius: 16,
  padding: '80px 40px',
  margin: '24px 0',
  position: 'relative',
  overflow: 'hidden',
  textAlign: 'center',

  // Subtle background pattern
  '&::before': {
    content: '""',
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    background: `url("data:image/svg+xml,%3Csvg width='60' height='60' viewBox='0 0 60 60' xmlns='http://www.w3.org/2000/svg'%3E%3Cg fill='none' fill-rule='evenodd'%3E%3Cg fill='%23ffffff' fill-opacity='0.05'%3E%3Cpath d='M36 34v-4h-2v4h-4v2h4v4h2v-4h4v-2h-4zm0-30V0h-2v4h-4v2h4v4h2V6h4V4h-4zM6 34v-4H4v4H0v2h4v4h2v-4h4v-2H6zM6 4V0H4v4H0v2h4v4h2V6h4V4H6z'/%3E%3C/g%3E%3C/g%3E%3C/svg%3E")`,
    opacity: 0.1,
  },
}));

const HeroTitle = styled(Typography)(({ theme }) => ({
  color: '#FFFFFF',
  marginBottom: theme.spacing(3),
  fontWeight: 700,
  fontSize: '3.5rem',
  lineHeight: 1.1,
  letterSpacing: '-0.025em',

  [theme.breakpoints.down('md')]: {
    fontSize: '2.5rem',
  },
}));

const HeroSubtitle = styled(Typography)(({ theme }) => ({
  color: 'rgba(255, 255, 255, 0.9)',
  marginBottom: theme.spacing(5),
  fontSize: '1.25rem',
  lineHeight: 1.5,
  maxWidth: '600px',
  margin: `0 auto ${theme.spacing(5)}px`,
}));

const CTAContainer = styled(Box)(({ theme }) => ({
  display: 'flex',
  gap: theme.spacing(2),
  justifyContent: 'center',
  alignItems: 'center',
  flexWrap: 'wrap',
}));

const PrimaryCTA = styled(Button)(({ theme }) => ({
  backgroundColor: '#FFFFFF',
  color: theme.palette.primary.main,
  padding: '14px 32px',
  fontSize: '1rem',
  fontWeight: 600,
  boxShadow: 'none',
  borderRadius: 12,

  '&:hover': {
    backgroundColor: '#F9FAFB',
    transform: 'translateY(-2px)',
    boxShadow: '0 8px 16px rgba(0, 0, 0, 0.1)',
  },
}));

const SecondaryCTA = styled(Button)(() => ({
  borderColor: '#FFFFFF',
  color: '#FFFFFF',
  padding: '14px 32px',
  fontSize: '1rem',
  fontWeight: 500,
  borderRadius: 12,

  '&:hover': {
    backgroundColor: 'rgba(255, 255, 255, 0.1)',
    borderColor: '#FFFFFF',
    transform: 'translateY(-2px)',
  },
}));

// Dashboard content container for authenticated users (future use)
// const DashboardContainer = styled(Box)(({ theme }) => ({
//   backgroundColor: theme.palette.background.paper,
//   borderRadius: 16,
//   padding: '48px 40px',
//   textAlign: 'center',
//   border: `1px solid ${theme.palette.divider}`,
//   boxShadow: '0 4px 6px rgba(17, 24, 39, 0.05), 0 2px 4px rgba(17, 24, 39, 0.06)',
// }));

export const LandingPage: React.FC = () => {
  const theme = useTheme();
  const navigate = useNavigate();
  const { user, isAuthenticated } = useAuth();

  return (
    <Container maxWidth='lg' sx={{ py: 4 }}>
      {isAuthenticated ? (
        // Dashboard Preview for authenticated users - Phase 2
        <Box>
          <Typography
            id='dashboard-greeting'
            variant='h2'
            component='h1'
            sx={{
              textAlign: 'center',
              mb: 2,
              color: theme.palette.text.primary,
            }}
          >
            Welcome back, {user?.displayName}!
          </Typography>

          <Typography
            id='dashboard-subtitle'
            variant='h5'
            sx={{
              textAlign: 'center',
              color: theme.palette.text.secondary,
              mb: 5,
              fontWeight: 400,
            }}
          >
            Your Creative Workspace
          </Typography>

          <Grid container spacing={3} sx={{ mb: 4 }}>
            {/* Encounter Editor - Phase 3-4 Complete */}
            <Grid size={{ xs: 12, sm: 6, md: 3 }}>
              <Card
                id='card-encounter-editor'
                elevation={2}
                sx={{
                  height: '100%',
                  display: 'flex',
                  flexDirection: 'column',
                }}
              >
                <CardContent sx={{ flexGrow: 1, textAlign: 'center' }}>
                  <MapIcon id='icon-encounter-editor' color='primary' sx={{ fontSize: 48, mb: 2 }} />
                  <Typography id='title-encounter-editor' variant='h6' gutterBottom>
                    Encounter Editor
                  </Typography>
                  <Typography id='desc-encounter-editor' variant='body2' color='text.secondary'>
                    Create tactical maps with grids and tokens
                  </Typography>
                </CardContent>
                <CardActions sx={{ justifyContent: 'center', pb: 2 }}>
                  <Button
                    id='btn-open-editor'
                    size='small'
                    variant='contained'
                    onClick={() => navigate('/encounters/new/edit')}
                  >
                    Open Editor
                  </Button>
                </CardActions>
              </Card>
            </Grid>

            {/* Library - Phase 7 Active */}
            <Grid size={{ xs: 12, sm: 6, md: 3 }}>
              <Card
                id='card-library'
                elevation={2}
                sx={{
                  height: '100%',
                  display: 'flex',
                  flexDirection: 'column',
                }}
              >
                <CardContent sx={{ flexGrow: 1, textAlign: 'center' }}>
                  <LibraryIcon id='icon-library' color='primary' sx={{ fontSize: 48, mb: 2 }} />
                  <Typography id='title-library' variant='h6' gutterBottom>
                    Library
                  </Typography>
                  <Typography id='desc-library' variant='body2' color='text.secondary'>
                    Manage encounters, adventures, campaigns
                  </Typography>
                </CardContent>
                <CardActions sx={{ justifyContent: 'center', pb: 2 }}>
                  <Button
                    id='btn-open-library'
                    size='small'
                    variant='contained'
                    onClick={() => navigate('/content-library')}
                  >
                    Browse Library
                  </Button>
                </CardActions>
              </Card>
            </Grid>

            {/* Asset Library - Active */}
            <Grid size={{ xs: 12, sm: 6, md: 3 }}>
              <Card
                id='card-asset-library'
                elevation={2}
                sx={{
                  height: '100%',
                  display: 'flex',
                  flexDirection: 'column',
                }}
              >
                <CardContent sx={{ flexGrow: 1, textAlign: 'center' }}>
                  <CreateIcon id='icon-asset-library' color='primary' sx={{ fontSize: 48, mb: 2 }} />
                  <Typography id='title-asset-library' variant='h6' gutterBottom>
                    Asset Library
                  </Typography>
                  <Typography id='desc-asset-library' variant='body2' color='text.secondary'>
                    Browse monsters, characters, tokens
                  </Typography>
                </CardContent>
                <CardActions sx={{ justifyContent: 'center', pb: 2 }}>
                  <Button id='btn-browse-assets' size='small' variant='contained' onClick={() => navigate('/assets')}>
                    Browse Assets
                  </Button>
                </CardActions>
              </Card>
            </Grid>

            {/* Account Settings - Phase 10 Planned */}
            <Grid size={{ xs: 12, sm: 6, md: 3 }}>
              <Card
                id='card-account-settings'
                elevation={2}
                sx={{
                  height: '100%',
                  display: 'flex',
                  flexDirection: 'column',
                  opacity: 0.6,
                }}
              >
                <CardContent sx={{ flexGrow: 1, textAlign: 'center' }}>
                  <SettingsIcon id='icon-account-settings' color='disabled' sx={{ fontSize: 48, mb: 2 }} />
                  <Typography id='title-account-settings' variant='h6' gutterBottom>
                    Account Settings
                  </Typography>
                  <Typography id='desc-account-settings' variant='body2' color='text.secondary'>
                    Profile, security, 2FA settings
                  </Typography>
                </CardContent>
                <CardActions sx={{ justifyContent: 'center', pb: 2 }}>
                  <Button id='btn-account-settings-disabled' size='small' disabled variant='outlined'>
                    Coming Soon
                  </Button>
                </CardActions>
              </Card>
            </Grid>
          </Grid>
        </Box>
      ) : (
        // Hero section for non-authenticated users
        <HeroContainer id='hero-section'>
          <HeroTitle id='hero-title' variant='h1'>
            Craft Legendary Adventures
          </HeroTitle>
          <HeroSubtitle id='hero-subtitle' variant='h5'>
            Professional Virtual Tabletop tools designed for Game Masters who create world campaigns and immersive
            worlds
          </HeroSubtitle>
          <CTAContainer>
            <PrimaryCTA id='cta-start-creating' variant='contained' onClick={() => navigate('/register')}>
              Start Creating
            </PrimaryCTA>
            <SecondaryCTA id='cta-explore-features' variant='outlined' onClick={() => navigate('/login')}>
              Explore Features
            </SecondaryCTA>
          </CTAContainer>
        </HeroContainer>
      )}
    </Container>
  );
};
