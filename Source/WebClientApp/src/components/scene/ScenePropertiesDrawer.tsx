import React from 'react';
import {
    Box,
    Drawer,
    Typography,
    TextField,
    FormControlLabel,
    Switch,
    Button
} from '@mui/material';
import { useTheme } from '@mui/material/styles';
import { useNavigate } from 'react-router-dom';
import { Scene } from '@/types/domain';

export interface ScenePropertiesDrawerProps {
    open: boolean;
    onClose: () => void;
    scene: Scene | null | undefined;
    onDescriptionChange: (description: string) => void;
    onPublishedChange: (published: boolean) => void;
}

interface AdventureLinkProps {
    adventure: { id: string; name: string };
}

const AdventureLink: React.FC<AdventureLinkProps> = ({ adventure }) => {
    const navigate = useNavigate();

    const handleClick = () => {
        navigate(`/adventures/${adventure.id}`);
    };

    return (
        <Button
            variant="text"
            onClick={handleClick}
            sx={{
                textTransform: 'none',
                justifyContent: 'flex-start',
                p: 0,
                minWidth: 'auto',
                fontSize: '11px',
                fontWeight: 400,
                height: '20px'
            }}
        >
            {adventure.name}
        </Button>
    );
};

export const ScenePropertiesDrawer: React.FC<ScenePropertiesDrawerProps> = ({
    open,
    onClose,
    scene,
    onDescriptionChange,
    onPublishedChange
}) => {
    const theme = useTheme();

    const compactStyles = {
        sectionHeader: {
            fontSize: '10px',
            fontWeight: 700,
            textTransform: 'uppercase' as const,
            letterSpacing: '0.5px',
            color: theme.palette.text.secondary,
            mb: 0.5,
            lineHeight: 1.2,
            display: 'block'
        },
        textFieldMultiline: {
            '& .MuiInputBase-root': {
                fontSize: '11px',
                padding: '6px 8px',
                backgroundColor: theme.palette.background.default
            },
            '& .MuiInputLabel-root': {
                fontSize: '9px',
                transform: 'translate(8px, 6px) scale(1)',
                '&.MuiInputLabel-shrink': {
                    transform: 'translate(8px, -8px) scale(0.85)'
                }
            }
        },
        toggleLabel: {
            fontSize: '10px'
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
        <Drawer
            anchor="right"
            open={open}
            onClose={onClose}
            sx={{
                '& .MuiDrawer-paper': {
                    width: { xs: '100vw', sm: 360 },
                    backgroundColor: theme.palette.background.paper,
                    top: 28,
                    bottom: 0,
                    height: 'auto'
                }
            }}
        >
            <Box sx={{
                display: 'flex',
                flexDirection: 'column',
                gap: 1,
                p: 1.5,
                height: '100%',
                overflowY: 'auto'
            }}>
                {/* Adventure Section */}
                <Box sx={{ mb: 0 }}>
                    <Typography variant="overline" sx={compactStyles.sectionHeader}>
                        Adventure
                    </Typography>
                    {scene?.adventure ? (
                        <AdventureLink adventure={scene.adventure} />
                    ) : (
                        <Typography sx={{ color: theme.palette.text.disabled, fontSize: '11px' }}>
                            None
                        </Typography>
                    )}
                </Box>

                {/* Description */}
                <TextField
                    id="scene-description"
                    label="Description"
                    defaultValue={scene?.description ?? ''}
                    onBlur={handleDescriptionBlur}
                    multiline
                    rows={2}
                    fullWidth
                    variant="outlined"
                    placeholder="Scene description..."
                    size="small"
                    sx={compactStyles.textFieldMultiline}
                />

                {/* Published Toggle */}
                <FormControlLabel
                    control={
                        <Switch
                            id="scene-published"
                            size="small"
                            checked={scene?.isPublished ?? false}
                            onChange={handlePublishedChange}
                        />
                    }
                    label={
                        <Typography sx={compactStyles.toggleLabel}>
                            Published
                        </Typography>
                    }
                    sx={{ margin: 0 }}
                />

                {/* Display Settings - Removed: defaultDisplayName and defaultLabelPosition are now handled in localStorage */}
            </Box>
        </Drawer>
    );
};
