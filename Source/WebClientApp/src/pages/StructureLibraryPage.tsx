import React from 'react';
import { Container, Box, Typography } from '@mui/material';
import { StructureLibraryPanel } from '@/components/library';

export const StructureLibraryPage: React.FC = () => {
    return (
        <Container maxWidth="xl" sx={{ py: 4, height: '100vh', display: 'flex', flexDirection: 'column' }}>
            <Box sx={{ mb: 3 }}>
                <Typography variant="h4" component="h1" gutterBottom>
                    Structure Library
                </Typography>
                <Typography variant="body2" color="text.secondary">
                    Manage barriers, regions, and sources for your scenes
                </Typography>
            </Box>

            <Box sx={{ flex: 1, overflow: 'hidden' }}>
                <StructureLibraryPanel />
            </Box>
        </Container>
    );
};
