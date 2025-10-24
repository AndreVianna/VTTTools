import { Outlet } from 'react-router-dom';
import { Box, Typography } from '@mui/material';

export function ContentLibraryPage() {
    return (
        <Box id="library-container" sx={{ width: '100%', height: '100%', display: 'flex', flexDirection: 'column' }}>
            <Box id="library-header" sx={{ px: 3, pt: 3, pb: 2 }}>
                <Typography id="title-library" variant="h4" component="h1">
                    Library
                </Typography>
            </Box>
            <Box id="library-content" sx={{ flex: 1, overflow: 'auto', px: 3 }}>
                <Outlet />
            </Box>
        </Box>
    );
}
