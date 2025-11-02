import { Box, Typography, Paper, Stack } from '@mui/material';

export function DashboardPage() {
  return (
    <Box>
      <Typography variant="h4" gutterBottom>
        Admin Dashboard
      </Typography>
      <Stack
        direction="row"
        flexWrap="wrap"
        gap={3}
      >
        <Box sx={{ flex: { xs: '1 1 100%', md: '1 1 calc(50% - 12px)', lg: '1 1 calc(25% - 18px)' } }}>
          <Paper id="card-stat-users" sx={{ p: 2, height: '100%' }}>
            <Typography variant="h6">Total Users</Typography>
            <Typography variant="h3">-</Typography>
          </Paper>
        </Box>
        <Box sx={{ flex: { xs: '1 1 100%', md: '1 1 calc(50% - 12px)', lg: '1 1 calc(25% - 18px)' } }}>
          <Paper id="card-stat-sessions" sx={{ p: 2, height: '100%' }}>
            <Typography variant="h6">Active Sessions</Typography>
            <Typography variant="h3">-</Typography>
          </Paper>
        </Box>
        <Box sx={{ flex: { xs: '1 1 100%', md: '1 1 calc(50% - 12px)', lg: '1 1 calc(25% - 18px)' } }}>
          <Paper id="card-stat-health" sx={{ p: 2, height: '100%' }}>
            <Typography variant="h6">System Health</Typography>
            <Typography variant="h3">OK</Typography>
          </Paper>
        </Box>
        <Box sx={{ flex: { xs: '1 1 100%', md: '1 1 calc(50% - 12px)', lg: '1 1 calc(25% - 18px)' } }}>
          <Paper id="card-stat-audits" sx={{ p: 2, height: '100%' }}>
            <Typography variant="h6">Audit Logs</Typography>
            <Typography variant="h3">-</Typography>
          </Paper>
        </Box>
      </Stack>
    </Box>
  );
}
