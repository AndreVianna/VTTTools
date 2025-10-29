import React, { useState } from 'react';
import { Box, Tabs, Tab, Paper, useTheme } from '@mui/material';
import { Fence as BarrierIcon, Map as RegionIcon, Lightbulb as SourceIcon } from '@mui/icons-material';
import { BarrierList } from './barriers';
import { RegionList } from './regions';
import { SourceList } from './sources';

export const StructureLibraryPanel: React.FC = () => {
    const theme = useTheme();
    const [activeTab, setActiveTab] = useState(0);

    return (
        <Paper
            elevation={2}
            sx={{
                height: '100%',
                display: 'flex',
                flexDirection: 'column',
                overflow: 'hidden',
                bgcolor: theme.palette.background.paper
            }}
        >
            <Tabs
                value={activeTab}
                onChange={(_, newValue) => setActiveTab(newValue)}
                sx={{
                    borderBottom: 1,
                    borderColor: 'divider',
                    bgcolor: theme.palette.mode === 'dark'
                        ? 'rgba(255,255,255,0.05)'
                        : 'rgba(0,0,0,0.02)',
                    minHeight: 48
                }}
            >
                <Tab
                    label="Barriers"
                    icon={<BarrierIcon />}
                    iconPosition="start"
                    sx={{ minHeight: 48 }}
                />
                <Tab
                    label="Regions"
                    icon={<RegionIcon />}
                    iconPosition="start"
                    sx={{ minHeight: 48 }}
                />
                <Tab
                    label="Sources"
                    icon={<SourceIcon />}
                    iconPosition="start"
                    sx={{ minHeight: 48 }}
                />
            </Tabs>
            <Box sx={{ flex: 1, overflow: 'auto', bgcolor: theme.palette.background.default }}>
                {activeTab === 0 && <BarrierList />}
                {activeTab === 1 && <RegionList />}
                {activeTab === 2 && <SourceList />}
            </Box>
        </Paper>
    );
};
