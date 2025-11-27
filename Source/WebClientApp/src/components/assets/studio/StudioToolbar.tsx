import React from 'react';
import { Box, Button, Chip, IconButton, Tooltip, Typography, useTheme } from '@mui/material';
import {
  ArrowBack as BackIcon,
  Save as SaveIcon,
  Delete as DeleteIcon,
  Publish as PublishIcon,
  Unpublished as UnpublishIcon,
} from '@mui/icons-material';

export interface StudioToolbarProps {
  title: string;
  isNew: boolean;
  isDirty: boolean;
  isPublished: boolean;
  isSaving: boolean;
  onBack: () => void;
  onSave: () => void;
  onDelete: (() => void) | null;
  onPublish: (() => void) | null;
  onUnpublish: (() => void) | null;
}

export const StudioToolbar: React.FC<StudioToolbarProps> = ({
  title,
  isNew,
  isDirty,
  isPublished,
  isSaving,
  onBack,
  onSave,
  onDelete,
  onPublish,
  onUnpublish,
}) => {
  const theme = useTheme();

  return (
    <Box
      sx={{
        display: 'flex',
        alignItems: 'center',
        gap: 2,
        px: 2,
        py: 1,
        minHeight: 48,
      }}
    >
      <Tooltip title="Back to Library">
        <IconButton onClick={onBack} size="small">
          <BackIcon />
        </IconButton>
      </Tooltip>

      <Typography variant="h6" sx={{ fontWeight: 600, flexGrow: 1 }}>
        {isNew ? 'New Asset' : title}
        {isDirty && (
          <Typography component="span" sx={{ color: theme.palette.warning.main, ml: 1 }}>
            *
          </Typography>
        )}
      </Typography>

      {!isNew && (
        <Chip
          label={isPublished ? 'Published' : 'Draft'}
          size="small"
          color={isPublished ? 'success' : 'default'}
          variant={isPublished ? 'filled' : 'outlined'}
        />
      )}

      <Box sx={{ display: 'flex', gap: 1 }}>
        {!isNew && onDelete && (
          <Tooltip title="Delete Asset">
            <IconButton color="error" size="small" onClick={onDelete}>
              <DeleteIcon />
            </IconButton>
          </Tooltip>
        )}

        {!isNew && !isPublished && onPublish && (
          <Button
            variant="outlined"
            size="small"
            startIcon={<PublishIcon />}
            onClick={onPublish}
          >
            Publish
          </Button>
        )}

        {!isNew && isPublished && onUnpublish && (
          <Button
            variant="outlined"
            size="small"
            startIcon={<UnpublishIcon />}
            onClick={onUnpublish}
          >
            Unpublish
          </Button>
        )}

        <Button
          variant="contained"
          size="small"
          startIcon={<SaveIcon />}
          onClick={onSave}
          disabled={!isDirty || isSaving}
        >
          {isSaving ? 'Saving...' : 'Save'}
        </Button>
      </Box>
    </Box>
  );
};

export default StudioToolbar;
