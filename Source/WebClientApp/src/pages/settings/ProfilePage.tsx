import React, { useCallback, useState } from 'react';
import { Box, Container, Paper, Tab, Tabs, Typography, useMediaQuery, useTheme } from '@mui/material';
import { AccountCircle, Security } from '@mui/icons-material';
import { ProfileSettings } from '@/components/auth/ProfileSettings';
import { SecuritySettings } from '@/components/auth/SecuritySettings';

// ═══════════════════════════════════════════════════════════════════════════
// COMPONENT
// ═══════════════════════════════════════════════════════════════════════════

export const ProfilePage: React.FC = () => {
    // ═══════════════════════════════════════════════════════════════════════════
    // THEME
    // ═══════════════════════════════════════════════════════════════════════════
    const theme = useTheme();
    const isMobile = useMediaQuery(theme.breakpoints.down('md'));

    // ═══════════════════════════════════════════════════════════════════════════
    // STATE
    // ═══════════════════════════════════════════════════════════════════════════
    const [activeTab, setActiveTab] = useState(0);

    // ═══════════════════════════════════════════════════════════════════════════
    // HANDLERS
    // ═══════════════════════════════════════════════════════════════════════════
    const handleTabChange = useCallback((_event: React.SyntheticEvent, newValue: number) => {
        setActiveTab(newValue);
    }, []);

    // ═══════════════════════════════════════════════════════════════════════════
    // RENDER
    // ═══════════════════════════════════════════════════════════════════════════
    return (
        <Container maxWidth="lg" sx={{ py: 4 }}>
            <Box sx={{ mb: 4 }}>
                <Typography variant="h4" component="h1" gutterBottom sx={{ color: theme.palette.text.primary }}>
                    Account Settings
                </Typography>
                <Typography variant="body1" sx={{ color: theme.palette.text.secondary }}>
                    Manage your profile, security settings, and authentication preferences
                </Typography>
            </Box>

            <Paper
                sx={{
                    backgroundColor: theme.palette.background.paper,
                    boxShadow: theme.shadows[2],
                }}
            >
                <Box sx={{ borderBottom: 1, borderColor: theme.palette.divider }}>
                    <Tabs
                        value={activeTab}
                        onChange={handleTabChange}
                        aria-label="account settings tabs"
                        variant={isMobile ? 'scrollable' : 'standard'}
                        scrollButtons={isMobile ? 'auto' : false}
                        sx={{
                            px: 2,
                            '& .MuiTab-root': {
                                minHeight: 64,
                                textTransform: 'none',
                                fontSize: '1rem',
                                fontWeight: 500,
                                color: theme.palette.text.secondary,
                                '&.Mui-selected': {
                                    color: theme.palette.primary.main,
                                },
                            },
                        }}
                    >
                        <Tab icon={<AccountCircle />} iconPosition="start" label="Profile" {...a11yProps(0)} />
                        <Tab icon={<Security />} iconPosition="start" label="Security" {...a11yProps(1)} />
                    </Tabs>
                </Box>

                <Box sx={{ px: { xs: 2, md: 3 }, pb: 3 }}>
                    <TabPanel value={activeTab} index={0}>
                        <ProfileSettings />
                    </TabPanel>

                    <TabPanel value={activeTab} index={1}>
                        <SecuritySettings />
                    </TabPanel>
                </Box>
            </Paper>
        </Container>
    );
};

// ═══════════════════════════════════════════════════════════════════════════
// CHILD COMPONENTS
// ═══════════════════════════════════════════════════════════════════════════

interface TabPanelProps {
    children?: React.ReactNode;
    index: number;
    value: number;
}

const TabPanel: React.FC<TabPanelProps> = ({ children, value, index }) => (
    <div
        role="tabpanel"
        hidden={value !== index}
        id={`settings-tabpanel-${index}`}
        aria-labelledby={`settings-tab-${index}`}
    >
        {value === index && <Box sx={{ py: 3 }}>{children}</Box>}
    </div>
);

// ═══════════════════════════════════════════════════════════════════════════
// HELPERS
// ═══════════════════════════════════════════════════════════════════════════

const a11yProps = (index: number) => ({
    id: `settings-tab-${index}`,
    'aria-controls': `settings-tabpanel-${index}`,
});
