import React from 'react';
import { Box, Button, Typography } from '@mui/material';
import type { MediaResource } from '@/types/domain';

export interface MediaInspectorPanelProps {
    media: MediaResource;
    onDelete: () => void;
}

export const MediaInspectorPanel: React.FC<MediaInspectorPanelProps> = ({
    media,
    onDelete,
}) => {
    const fileSizeKB = (media.fileSize / 1024).toFixed(2);

    return (
        <Box sx={{ p: 2 }}>
            <Typography variant="h6" gutterBottom>
                Media Inspector
            </Typography>
            <Typography variant="body2" color="text.secondary" gutterBottom>
                {media.fileName}
            </Typography>
            <Typography variant="caption" display="block" gutterBottom>
                Type: {media.role}
            </Typography>
            <Typography variant="caption" display="block" gutterBottom>
                Size: {fileSizeKB} KB
            </Typography>
            <Box sx={{ mt: 2, display: 'flex', gap: 1 }}>
                <Button
                    id="media-btn-delete-selected"
                    variant="outlined"
                    size="small"
                    color="error"
                    onClick={onDelete}
                >
                    Delete
                </Button>
            </Box>
        </Box>
    );
};
