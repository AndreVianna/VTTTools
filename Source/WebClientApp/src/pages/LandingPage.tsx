import React from 'react';
import { useNavigate } from 'react-router-dom';
import type { Theme } from '@mui/material';
import {
    Box,
    Button,
    Card,
    CardActions,
    CardContent,
    Container,
    Grid,
    Typography,
    useTheme,
} from '@mui/material';
import { styled } from '@mui/material/styles';
import {
    Create as CreateIcon,
    LibraryBooks as LibraryIcon,
    Map as MapIcon,
    Settings as SettingsIcon,
} from '@mui/icons-material';
import { useAuth } from '@/hooks/useAuth';

// ═══════════════════════════════════════════════════════════════════════════
// STYLED COMPONENTS
// ═══════════════════════════════════════════════════════════════════════════

const HeroContainer = styled(Box)(({ theme }) => ({
    background: `linear-gradient(135deg, ${theme.palette.primary.main} 0%, ${theme.palette.secondary.main} 100%)`,
    borderRadius: 16,
    padding: '80px 40px',
    margin: '24px 0',
    position: 'relative',
    overflow: 'hidden',
    textAlign: 'center',
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
    backgroundColor: theme.palette.common.white,
    color: theme.palette.primary.main,
    padding: '14px 32px',
    fontSize: '1rem',
    fontWeight: 600,
    boxShadow: 'none',
    borderRadius: 12,
    '&:hover': {
        backgroundColor: theme.palette.grey[50],
        transform: 'translateY(-2px)',
        boxShadow: theme.shadows[4],
    },
}));

const SecondaryCTA = styled(Button)(({ theme }) => ({
    borderColor: theme.palette.common.white,
    color: theme.palette.common.white,
    padding: '14px 32px',
    fontSize: '1rem',
    fontWeight: 500,
    borderRadius: 12,
    '&:hover': {
        backgroundColor: theme.palette.action.hover,
        borderColor: theme.palette.common.white,
        transform: 'translateY(-2px)',
    },
}));

// ═══════════════════════════════════════════════════════════════════════════
// COMPONENT
// ═══════════════════════════════════════════════════════════════════════════

export const LandingPage: React.FC = () => {
    // ═══════════════════════════════════════════════════════════════════════════
    // ROUTING
    // ═══════════════════════════════════════════════════════════════════════════
    const navigate = useNavigate();

    // ═══════════════════════════════════════════════════════════════════════════
    // THEME
    // ═══════════════════════════════════════════════════════════════════════════
    const theme = useTheme();

    // ═══════════════════════════════════════════════════════════════════════════
    // CONTEXT HOOKS
    // ═══════════════════════════════════════════════════════════════════════════
    const { user, isAuthenticated } = useAuth();

    // ═══════════════════════════════════════════════════════════════════════════
    // RENDER
    // ═══════════════════════════════════════════════════════════════════════════
    if (!isAuthenticated) {
        return (
            <Container maxWidth="lg" sx={{ py: 4 }}>
                <HeroSection navigate={navigate} />
            </Container>
        );
    }

    return (
        <Container maxWidth="lg" sx={{ py: 4 }}>
            <DashboardSection
                user={user}
                theme={theme}
                navigate={navigate}
            />
        </Container>
    );
};

// ═══════════════════════════════════════════════════════════════════════════
// CHILD COMPONENTS
// ═══════════════════════════════════════════════════════════════════════════

interface HeroSectionProps {
    navigate: ReturnType<typeof useNavigate>;
}

const HeroSection: React.FC<HeroSectionProps> = ({ navigate }) => (
    <HeroContainer id="hero-section">
        <HeroTitle id="hero-title" variant="h1">
            Craft Legendary Adventures
        </HeroTitle>
        <HeroSubtitle id="hero-subtitle" variant="h5">
            Professional Virtual Tabletop tools designed for Game Masters who create world campaigns and immersive
            worlds
        </HeroSubtitle>
        <CTAContainer>
            <PrimaryCTA id="cta-start-creating" variant="contained" onClick={() => navigate('/register')}>
                Start Creating
            </PrimaryCTA>
            <SecondaryCTA id="cta-explore-features" variant="outlined" onClick={() => navigate('/login')}>
                Explore Features
            </SecondaryCTA>
        </CTAContainer>
    </HeroContainer>
);

interface DashboardSectionProps {
    user: { displayName: string } | null;
    theme: Theme;
    navigate: ReturnType<typeof useNavigate>;
}

const DashboardSection: React.FC<DashboardSectionProps> = ({ user, theme, navigate }) => (
    <Box>
        <Typography
            id="dashboard-greeting"
            variant="h2"
            component="h1"
            sx={{
                textAlign: 'center',
                mb: 2,
                color: theme.palette.text.primary,
            }}
        >
            Welcome back, {user?.displayName}!
        </Typography>

        <Typography
            id="dashboard-subtitle"
            variant="h5"
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
            <Grid size={{ xs: 12, sm: 6, md: 3 }}>
                <DashboardCard
                    id="encounter-editor"
                    icon={<MapIcon id="icon-encounter-editor" color="primary" sx={{ fontSize: 48, mb: 2 }} />}
                    title="Encounter Editor"
                    description="Create tactical maps with grids and tokens"
                    buttonId="btn-open-editor"
                    buttonText="Open Editor"
                    onClick={() => navigate('/encounters/new/edit')}
                />
            </Grid>

            <Grid size={{ xs: 12, sm: 6, md: 3 }}>
                <DashboardCard
                    id="library"
                    icon={<LibraryIcon id="icon-library" color="primary" sx={{ fontSize: 48, mb: 2 }} />}
                    title="Library"
                    description="Manage encounters, adventures, campaigns"
                    buttonId="btn-open-library"
                    buttonText="Browse Library"
                    onClick={() => navigate('/content-library')}
                />
            </Grid>

            <Grid size={{ xs: 12, sm: 6, md: 3 }}>
                <DashboardCard
                    id="asset-library"
                    icon={<CreateIcon id="icon-asset-library" color="primary" sx={{ fontSize: 48, mb: 2 }} />}
                    title="Asset Library"
                    description="Browse monsters, characters, tokens"
                    buttonId="btn-browse-assets"
                    buttonText="Browse Assets"
                    onClick={() => navigate('/assets')}
                />
            </Grid>

            <Grid size={{ xs: 12, sm: 6, md: 3 }}>
                <DashboardCard
                    id="account-settings"
                    icon={<SettingsIcon id="icon-account-settings" color="disabled" sx={{ fontSize: 48, mb: 2 }} />}
                    title="Account Settings"
                    description="Profile, security, 2FA settings"
                    buttonId="btn-account-settings-disabled"
                    buttonText="Coming Soon"
                    disabled
                />
            </Grid>
        </Grid>
    </Box>
);

interface DashboardCardProps {
    id: string;
    icon: React.ReactNode;
    title: string;
    description: string;
    buttonId: string;
    buttonText: string;
    onClick?: () => void;
    disabled?: boolean;
}

const DashboardCard: React.FC<DashboardCardProps> = ({
    id,
    icon,
    title,
    description,
    buttonId,
    buttonText,
    onClick,
    disabled = false,
}) => (
    <Card
        id={`card-${id}`}
        elevation={2}
        sx={{
            height: '100%',
            display: 'flex',
            flexDirection: 'column',
            opacity: disabled ? 0.6 : 1,
        }}
    >
        <CardContent sx={{ flexGrow: 1, textAlign: 'center' }}>
            {icon}
            <Typography id={`title-${id}`} variant="h6" gutterBottom>
                {title}
            </Typography>
            <Typography id={`desc-${id}`} variant="body2" color="text.secondary">
                {description}
            </Typography>
        </CardContent>
        <CardActions sx={{ justifyContent: 'center', pb: 2 }}>
            <Button
                id={buttonId}
                size="small"
                variant={disabled ? 'outlined' : 'contained'}
                onClick={disabled ? undefined : onClick}
                disabled={disabled}
            >
                {buttonText}
            </Button>
        </CardActions>
    </Card>
);
