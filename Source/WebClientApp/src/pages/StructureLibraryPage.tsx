import React from 'react';
import { Container, Box, Typography } from '@mui/material';
// TODO: Phase 8.8 - Re-enable when StructureLibraryPanel is implemented
// import { StructureLibraryPanel } from '@/components/library';

export const StructureLibraryPage: React.FC = () => {
    return (
        <Container maxWidth="xl" sx={{ py: 4, height: '100vh', display: 'flex', flexDirection: 'column' }}>
            <Box sx={{ mb: 3 }}>
                <Typography variant="h4" component="h1" gutterBottom>
                    Structure Library
                </Typography>
                <Typography variant="body2" color="text.secondary">
                    Manage Walls, regions, and sources for your scenes
                </Typography>
            </Box>

            <Box sx={{ flex: 1, overflow: 'hidden' }}>
                {/* TODO: Phase 8.8 - Re-enable when StructureLibraryPanel is implemented */}
                {/* <StructureLibraryPanel /> */}
                <div>Structure Library - Coming in Phase 8.8</div>
            </Box>
        </Container>
    );
};
