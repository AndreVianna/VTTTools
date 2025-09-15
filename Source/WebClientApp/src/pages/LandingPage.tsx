import React from 'react';
import {
  Container,
  Typography,
  Box,
  Button,
  Card,
  CardContent,
  Grid,
  Paper,
  Chip,
  Stack,
} from '@mui/material';
import {
  Map as MapIcon,
  Inventory2 as AssetIcon,
  Group as SessionIcon,
  Brush as CreativeIcon,
  Speed as PerformanceIcon,
  Security as SecurityIcon,
  Login as LoginIcon,
  Dashboard as DashboardIcon,
} from '@mui/icons-material';
import { useNavigate } from 'react-router-dom';
import { isDevelopment, isStandalone } from '@/config/development';

export const LandingPage: React.FC = () => {
  const navigate = useNavigate();

  const features = [
    {
      icon: <MapIcon fontSize="large" />,
      title: 'Scene Builder',
      description: 'Create immersive battle maps with drag-and-drop assets, multi-layer canvas, and grid systems.',
      phase: 'Phase 5',
    },
    {
      icon: <AssetIcon fontSize="large" />,
      title: 'Asset Management',
      description: 'Organize and manage your visual assets with smart categorization and search capabilities.',
      phase: 'Phase 3',
    },
    {
      icon: <SessionIcon fontSize="large" />,
      title: 'Game Sessions',
      description: 'Host multiplayer sessions with real-time collaboration and chat functionality.',
      phase: 'Phase 4',
    },
    {
      icon: <CreativeIcon fontSize="large" />,
      title: 'Adventure Creation',
      description: 'Design and manage complete adventures with scenes, assets, and storylines.',
      phase: 'Phase 3',
    },
    {
      icon: <PerformanceIcon fontSize="large" />,
      title: 'High Performance',
      description: 'Optimized canvas rendering with 50+ fps for smooth creative workflows.',
      phase: 'All Phases',
    },
    {
      icon: <SecurityIcon fontSize="large" />,
      title: 'Secure & Reliable',
      description: 'Enterprise-grade security with seamless authentication and data protection.',
      phase: 'Phase 1',
    },
  ];

  const developmentStatus = [
    { phase: 'Phase 1', title: 'Authentication & Infrastructure', status: 'In Progress', color: 'primary' as const },
    { phase: 'Phase 2', title: 'Navigation & Dashboard', status: 'Planned', color: 'default' as const },
    { phase: 'Phase 3', title: 'Content Management', status: 'Planned', color: 'default' as const },
    { phase: 'Phase 4', title: 'Real-time Sessions', status: 'Planned', color: 'default' as const },
    { phase: 'Phase 5', title: 'Scene Builder Canvas', status: 'Planned', color: 'default' as const },
    { phase: 'Phase 6', title: 'Polish & Production', status: 'Planned', color: 'default' as const },
  ];

  return (
    <Container maxWidth="lg" sx={{ py: 8 }}>
      {/* Hero Section */}
      <Box
        sx={{
          textAlign: 'center',
          mb: 8,
          py: 6,
        }}
      >
        <Typography
          variant="h1"
          component="h1"
          gutterBottom
          sx={{
            background: 'linear-gradient(45deg, #2563EB, #7C3AED)',
            backgroundClip: 'text',
            WebkitBackgroundClip: 'text',
            WebkitTextFillColor: 'transparent',
            mb: 2,
          }}
        >
          VTT Tools
        </Typography>
        <Typography
          variant="h4"
          component="h2"
          gutterBottom
          color="text.secondary"
          sx={{ mb: 3, fontWeight: 400 }}
        >
          Professional Virtual Tabletop Tools for Content Creators
        </Typography>
        <Typography
          variant="body1"
          sx={{
            mb: 4,
            maxWidth: 800,
            mx: 'auto',
            fontSize: '1.125rem',
            lineHeight: 1.6,
            color: 'text.secondary',
          }}
        >
          Create immersive adventures, manage assets, and build stunning scenes for your tabletop RPG sessions.
          VTT Tools provides a comprehensive platform designed specifically for game masters and content creators
          who demand professional-grade tools with exceptional performance.
        </Typography>

        <Stack
          direction={{ xs: 'column', sm: 'row' }}
          spacing={2}
          justifyContent="center"
          sx={{ mb: 4 }}
        >
          <Button
            variant="contained"
            size="large"
            startIcon={<LoginIcon />}
            onClick={() => navigate('/login')}
            sx={{ minWidth: 160, py: 1.5 }}
          >
            Get Started
          </Button>
          <Button
            variant="outlined"
            size="large"
            startIcon={<DashboardIcon />}
            onClick={() => navigate('/dashboard')}
            sx={{ minWidth: 160, py: 1.5 }}
          >
            View Dashboard
          </Button>
        </Stack>

        {/* Integration Status */}
        <Paper
          elevation={1}
          sx={{
            p: 3,
            maxWidth: 600,
            mx: 'auto',
            backgroundColor: isStandalone && isDevelopment ? 'warning.light' : 'success.light',
            color: isStandalone && isDevelopment ? 'warning.contrastText' : 'success.contrastText',
            borderRadius: 2,
          }}
        >
          {isStandalone && isDevelopment ? (
            <>
              <Typography variant="h6" gutterBottom>
                🔧 Development Mode - Standalone Configuration
              </Typography>
              <Typography variant="body2" sx={{ opacity: 0.9 }}>
                Running in standalone development mode with mock services. Backend integration available via Aspire orchestration.
              </Typography>
            </>
          ) : (
            <>
              <Typography variant="h6" gutterBottom>
                ✅ React SPA Successfully Integrated with .NET Aspire Infrastructure
              </Typography>
              <Typography variant="body2" sx={{ opacity: 0.9 }}>
                Phase 1 Week 1 implementation complete with authentication, service discovery, and error handling
              </Typography>
            </>
          )}
        </Paper>
      </Box>

      {/* Features Section */}
      <Box sx={{ mb: 8 }}>
        <Typography variant="h2" component="h2" textAlign="center" gutterBottom sx={{ mb: 6 }}>
          Comprehensive VTT Platform
        </Typography>
        <Grid container spacing={4}>
          {features.map((feature, index) => (
            <Grid item xs={12} sm={6} lg={4} key={index}>
              <Card
                sx={{
                  height: '100%',
                  transition: 'all 0.2s ease-in-out',
                  '&:hover': {
                    transform: 'translateY(-4px)',
                    boxShadow: 3,
                  },
                }}
              >
                <CardContent sx={{ p: 3, textAlign: 'center' }}>
                  <Box
                    sx={{
                      color: 'primary.main',
                      mb: 2,
                      display: 'flex',
                      justifyContent: 'center',
                    }}
                  >
                    {feature.icon}
                  </Box>
                  <Typography variant="h5" component="h3" gutterBottom>
                    {feature.title}
                  </Typography>
                  <Typography variant="body2" color="text.secondary" sx={{ mb: 2 }}>
                    {feature.description}
                  </Typography>
                  <Chip
                    label={feature.phase}
                    size="small"
                    color="primary"
                    variant="outlined"
                  />
                </CardContent>
              </Card>
            </Grid>
          ))}
        </Grid>
      </Box>

      {/* Development Status */}
      <Box sx={{ mb: 8 }}>
        <Typography variant="h2" component="h2" textAlign="center" gutterBottom sx={{ mb: 4 }}>
          Development Roadmap
        </Typography>
        <Typography variant="body1" textAlign="center" color="text.secondary" sx={{ mb: 4 }}>
          VTT Tools is being developed in phases, with each phase building upon the previous to deliver
          a complete professional VTT platform.
        </Typography>

        <Grid container spacing={2}>
          {developmentStatus.map((phase, index) => (
            <Grid item xs={12} sm={6} md={4} key={index}>
              <Paper
                elevation={1}
                sx={{
                  p: 2.5,
                  textAlign: 'center',
                  borderRadius: 2,
                  border: phase.status === 'In Progress' ? '2px solid' : '1px solid',
                  borderColor: phase.status === 'In Progress' ? 'primary.main' : 'divider',
                }}
              >
                <Typography variant="h6" gutterBottom color="primary">
                  {phase.phase}
                </Typography>
                <Typography variant="body2" color="text.secondary" sx={{ mb: 1.5 }}>
                  {phase.title}
                </Typography>
                <Chip
                  label={phase.status}
                  color={phase.color}
                  size="small"
                  variant={phase.status === 'In Progress' ? 'filled' : 'outlined'}
                />
              </Paper>
            </Grid>
          ))}
        </Grid>
      </Box>

      {/* Architecture Section */}
      <Box sx={{ textAlign: 'center' }}>
        <Typography variant="h2" component="h2" gutterBottom sx={{ mb: 4 }}>
          Modern Architecture
        </Typography>
        <Paper
          elevation={1}
          sx={{
            p: 4,
            backgroundColor: 'grey.50',
            borderRadius: 2,
          }}
        >
          <Typography variant="h5" gutterBottom>
            React 18+ with .NET Aspire Microservices
          </Typography>
          <Typography variant="body1" color="text.secondary" sx={{ mb: 3 }}>
            Built on a modern, scalable architecture combining React for the frontend with .NET Aspire
            orchestrating microservices for assets, scenes, sessions, and media management.
          </Typography>

          <Stack
            direction={{ xs: 'column', sm: 'row' }}
            spacing={2}
            justifyContent="center"
            flexWrap="wrap"
            useFlexGap
          >
            <Chip label="React 18+" color="primary" />
            <Chip label="TypeScript" color="primary" />
            <Chip label="Material UI" color="primary" />
            <Chip label="Konva.js Canvas" color="primary" />
            <Chip label="Redux Toolkit" color="primary" />
            <Chip label="SignalR" color="primary" />
            <Chip label=".NET Aspire" color="secondary" />
            <Chip label="Microservices" color="secondary" />
            <Chip label="SQL Server" color="secondary" />
            <Chip label="Redis Cache" color="secondary" />
            <Chip label="Azure Storage" color="secondary" />
          </Stack>
        </Paper>
      </Box>
    </Container>
  );
};