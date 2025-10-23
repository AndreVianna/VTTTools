import { useState } from 'react';
import { useNavigate, Outlet, useLocation } from 'react-router-dom';
import { Box, Typography, Tabs, Tab, Tooltip } from '@mui/material';
import type { ContentType } from '../types';

interface TabData {
    label: string;
    value: ContentType;
    path: string;
    disabled: boolean;
    disabledReason?: string;
}

const tabs: TabData[] = [
    {
        label: 'Scenes',
        value: 'scene',
        path: '/content-library/scenes',
        disabled: false
    },
    {
        label: 'Adventures',
        value: 'adventure',
        path: '/content-library/adventures',
        disabled: true,
        disabledReason: 'Available in Phase 8'
    },
    {
        label: 'Campaigns',
        value: 'campaign',
        path: '/content-library/campaigns',
        disabled: true,
        disabledReason: 'Available in Phase 9'
    },
    {
        label: 'Epics',
        value: 'epic',
        path: '/content-library/epics',
        disabled: true,
        disabledReason: 'Available in Phase 9'
    }
];

export function ContentLibraryPage() {
    const navigate = useNavigate();
    const location = useLocation();

    const getCurrentTab = (): ContentType => {
        const path = location.pathname;
        const tab = tabs.find(t => path.startsWith(t.path));
        return tab?.value || 'scene';
    };

    const [currentTab, setCurrentTab] = useState<ContentType>(getCurrentTab());

    const handleTabChange = (_event: React.SyntheticEvent, newValue: ContentType) => {
        const tab = tabs.find(t => t.value === newValue);
        if (tab && !tab.disabled) {
            setCurrentTab(newValue);
            navigate(tab.path);
        }
    };

    return (
        <Box sx={{ width: '100%', height: '100%', display: 'flex', flexDirection: 'column' }}>
            <Box sx={{ borderBottom: 1, borderColor: 'divider', px: 3, pt: 3 }}>
                <Typography variant="h4" component="h1" gutterBottom>
                    Content Library
                </Typography>
                <Tabs
                    value={currentTab}
                    onChange={handleTabChange}
                    aria-label="Content library tabs"
                >
                    {tabs.map((tab) => (
                        tab.disabled ? (
                            <Tooltip key={tab.value} title={tab.disabledReason || ''} arrow>
                                <span>
                                    <Tab
                                        label={tab.label}
                                        value={tab.value}
                                        disabled={tab.disabled}
                                        aria-label={`${tab.label} tab (disabled)`}
                                    />
                                </span>
                            </Tooltip>
                        ) : (
                            <Tab
                                key={tab.value}
                                label={tab.label}
                                value={tab.value}
                                aria-label={`${tab.label} tab`}
                            />
                        )
                    ))}
                </Tabs>
            </Box>
            <Box sx={{ flex: 1, overflow: 'auto', p: 3 }}>
                <Outlet />
            </Box>
        </Box>
    );
}
