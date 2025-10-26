import React from 'react';
import {
    Box,
    Menu,
    Typography,
    TextField,
    FormControlLabel,
    Switch,
    Link as MuiLink,
    Divider,
    CircularProgress
} from '@mui/material';
import { useTheme } from '@mui/material/styles';
import { useNavigate } from 'react-router-dom';
import { Scene } from '@/types/domain';
import { useGetAdventureQuery } from '@/services/adventuresApi';

export interface SceneMenuProps {
    scene: Scene | undefined;
    onDescriptionChange: (description: string) => void;
    onPublishedChange: (published: boolean) => void;
    anchorEl: HTMLElement | null;
    onClose: () => void;
}

export const SceneMenu: React.FC<SceneMenuProps> = ({
    scene,
    onDescriptionChange,
    onPublishedChange,
    anchorEl,
    onClose
}) => {
    const theme = useTheme();
    const navigate = useNavigate();

    const { data: adventure, isLoading: isLoadingAdventure } = useGetAdventureQuery(
        scene?.adventure?.id || '',
        { skip: !scene?.adventure?.id }
    );

    const handleAdventureClick = (e: React.MouseEvent) => {
        e.preventDefault();
        if (scene?.adventure?.id) {
            navigate(`/content-library/adventures/${scene.adventure.id}`);
            onClose();
        }
    };

    const handleDescriptionBlur = (e: React.FocusEvent<HTMLInputElement>) => {
        const newDescription = e.target.value;
        if (scene && newDescription !== scene.description) {
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
                    bgcolor: theme.palette.background.paper
                }
            }}
        >
            <Typography
                variant="subtitle2"
                sx={{
                    mb: 1.5,
                    fontSize: '0.875rem',
                    color: theme.palette.text.primary
                }}
            >
                Scene Properties
            </Typography>

            <Divider sx={{ my: 1 }} />

            <Box sx={{ mb: 2 }}>
                <Typography
                    variant="caption"
                    color="text.secondary"
                    sx={{ mb: 0.5, display: 'block', fontSize: '0.75rem' }}
                >
                    Adventure
                </Typography>
                {isLoadingAdventure ? (
                    <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                        <CircularProgress size={16} />
                        <Typography variant="body2" color="text.secondary">
                            Loading...
                        </Typography>
                    </Box>
                ) : scene?.adventure?.id && adventure ? (
                    <MuiLink
                        component="button"
                        variant="body2"
                        onClick={handleAdventureClick}
                        sx={{
                            color: theme.palette.primary.main,
                            textDecoration: 'none',
                            '&:hover': {
                                textDecoration: 'underline'
                            },
                            textAlign: 'left',
                            display: 'block'
                        }}
                    >
                        {adventure.name}
                    </MuiLink>
                ) : (
                    <Typography
                        variant="body2"
                        sx={{ color: theme.palette.text.disabled }}
                    >
                        None
                    </Typography>
                )}
            </Box>

            <Box sx={{ mb: 2 }}>
                <Typography
                    variant="caption"
                    color="text.secondary"
                    sx={{ mb: 0.5, display: 'block', fontSize: '0.75rem' }}
                >
                    Description
                </Typography>
                <TextField
                    fullWidth
                    multiline
                    rows={3}
                    defaultValue={scene?.description || ''}
                    onBlur={handleDescriptionBlur}
                    placeholder="Scene description..."
                    size="small"
                    sx={{
                        '& .MuiInputBase-root': {
                            bgcolor: theme.palette.background.default
                        }
                    }}
                />
            </Box>

            <Divider sx={{ my: 1 }} />

            <FormControlLabel
                control={
                    <Switch
                        size="small"
                        checked={scene?.isPublished || false}
                        onChange={handlePublishedChange}
                    />
                }
                label={
                    <Typography variant="body2">
                        Published
                    </Typography>
                }
            />
        </Menu>
    );
};
