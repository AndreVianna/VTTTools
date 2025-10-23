import { Box, Typography, Button } from '@mui/material';
import AddIcon from '@mui/icons-material/Add';

export function SceneListView() {
    return (
        <Box>
            <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 3 }}>
                <Typography variant="h5" component="h2">
                    Scenes
                </Typography>
                <Button
                    variant="contained"
                    startIcon={<AddIcon />}
                    aria-label="Create new scene"
                >
                    New Scene
                </Button>
            </Box>
            <Typography variant="body1" color="text.secondary">
                Scene list will be implemented in Phase 7B
            </Typography>
        </Box>
    );
}
