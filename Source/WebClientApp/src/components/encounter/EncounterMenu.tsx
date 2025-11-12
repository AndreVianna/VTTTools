import {
  Box,
  CircularProgress,
  Divider,
  FormControlLabel,
  Menu,
  Link as MuiLink,
  Switch,
  TextField,
  Typography,
} from '@mui/material';
import { useTheme } from '@mui/material/styles';
import type React from 'react';
import { useNavigate } from 'react-router-dom';
import { useGetAdventureQuery } from '@/services/adventuresApi';
import type { Encounter } from '@/types/domain';

export interface EncounterMenuProps {
  encounter: Encounter | undefined;
  onDescriptionChange: (description: string) => void;
  onPublishedChange: (published: boolean) => void;
  anchorEl: HTMLElement | null;
  onClose: () => void;
}

export const EncounterMenu: React.FC<EncounterMenuProps> = ({
  encounter,
  onDescriptionChange,
  onPublishedChange,
  anchorEl,
  onClose,
}) => {
  const theme = useTheme();
  const navigate = useNavigate();

  const { data: adventure, isLoading: isLoadingAdventure } = useGetAdventureQuery(encounter?.adventure?.id || '', {
    skip: !encounter?.adventure?.id,
  });

  const handleAdventureClick = (e: React.MouseEvent) => {
    e.preventDefault();
    if (encounter?.adventure?.id) {
      navigate(`/content-library/adventures/${encounter.adventure.id}`);
      onClose();
    }
  };

  const handleDescriptionBlur = (e: React.FocusEvent<HTMLInputElement>) => {
    const newDescription = e.target.value;
    if (encounter && newDescription !== encounter.description) {
      onDescriptionChange(newDescription);
    }
  };

  const handlePublishedChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    onPublishedChange(e.target.checked);
  };

  return (
    <Menu
      anchorEl={anchorEl}
      open={Boolean(anchorEl)}
      onClose={onClose}
      PaperProps={{
        sx: {
          minWidth: 320,
          p: 1.5,
          bgcolor: theme.palette.background.paper,
        },
      }}
    >
      <Typography
        variant='subtitle2'
        sx={{
          mb: 1.5,
          fontSize: '0.875rem',
          color: theme.palette.text.primary,
        }}
      >
        Encounter Properties
      </Typography>

      <Divider sx={{ my: 1 }} />

      <Box sx={{ mb: 2 }}>
        <Typography variant='caption' color='text.secondary' sx={{ mb: 0.5, display: 'block', fontSize: '0.75rem' }}>
          Adventure
        </Typography>
        {isLoadingAdventure ? (
          <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
            <CircularProgress size={16} />
            <Typography variant='body2' color='text.secondary'>
              Loading...
            </Typography>
          </Box>
        ) : encounter?.adventure?.id && adventure ? (
          <MuiLink
            component='button'
            variant='body2'
            onClick={handleAdventureClick}
            sx={{
              color: theme.palette.primary.main,
              textDecoration: 'none',
              '&:hover': {
                textDecoration: 'underline',
              },
              textAlign: 'left',
              display: 'block',
            }}
          >
            {adventure.name}
          </MuiLink>
        ) : (
          <Typography variant='body2' sx={{ color: theme.palette.text.disabled }}>
            None
          </Typography>
        )}
      </Box>

      <Box sx={{ mb: 2 }}>
        <Typography variant='caption' color='text.secondary' sx={{ mb: 0.5, display: 'block', fontSize: '0.75rem' }}>
          Description
        </Typography>
        <TextField
          fullWidth
          multiline
          rows={3}
          defaultValue={encounter?.description || ''}
          onBlur={handleDescriptionBlur}
          placeholder='Encounter description...'
          size='small'
          sx={{
            '& .MuiInputBase-root': {
              bgcolor: theme.palette.background.default,
            },
          }}
        />
      </Box>

      <Divider sx={{ my: 1 }} />

      <FormControlLabel
        control={<Switch size='small' checked={encounter?.isPublished || false} onChange={handlePublishedChange} />}
        label={<Typography variant='body2'>Published</Typography>}
      />
    </Menu>
  );
};
