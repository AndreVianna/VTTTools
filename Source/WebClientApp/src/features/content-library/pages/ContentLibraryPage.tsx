import { Box, Tab, Tabs, Typography } from '@mui/material';
import type { SyntheticEvent } from 'react';
import { Outlet, useLocation, useNavigate } from 'react-router-dom';

export function ContentLibraryPage() {
  const location = useLocation();
  const navigate = useNavigate();

  const getCurrentTab = () => {
    if (location.pathname.startsWith('/content-library/worlds')) {
      return 'worlds';
    }
    if (location.pathname.startsWith('/content-library/campaigns')) {
      return 'campaigns';
    }
    if (location.pathname.startsWith('/content-library/adventures')) {
      return 'adventures';
    }
    return 'adventures';
  };

  const currentTab = getCurrentTab();

  const handleTabChange = (_event: SyntheticEvent, newValue: string) => {
    navigate(`/content-library/${newValue}`);
  };

  return (
    <Box
      id='library-container'
      sx={{
        width: '100%',
        height: '100%',
        display: 'flex',
        flexDirection: 'column',
      }}
    >
      <Box id='library-header' sx={{ px: 3, pt: 3, pb: 2 }}>
        <Typography id='title-library' variant='h4' component='h1'>
          Library
        </Typography>
      </Box>
      <Box id='library-tabs' sx={{ borderBottom: 1, borderColor: 'divider', px: 3 }}>
        <Tabs value={currentTab} onChange={handleTabChange} aria-label='content library tabs'>
          <Tab label='Worlds' value='worlds' id='tab-worlds' />
          <Tab label='Campaigns' value='campaigns' id='tab-campaigns' />
          <Tab label='Adventures' value='adventures' id='tab-adventures' />
        </Tabs>
      </Box>
      <Box id='library-content' sx={{ flex: 1, overflow: 'auto', px: 3, py: 3 }}>
        <Outlet />
      </Box>
    </Box>
  );
}
