import React, { useState } from 'react';
import {
    Box,
    Drawer,
    Typography,
    TextField,
    FormControlLabel,
    Switch,
    Button,
    FormControl,
    InputLabel,
    Select,
    MenuItem,
    Divider,
    Accordion,
    AccordionSummary,
    AccordionDetails
} from '@mui/material';
import { useTheme } from '@mui/material/styles';
import { useNavigate } from 'react-router-dom';
import {
    ExpandMore as ExpandMoreIcon
} from '@mui/icons-material';
import { Scene, DisplayName, LabelPosition } from '@/types/domain';

export interface ScenePropertiesDrawerProps {
    open: boolean;
    onClose: () => void;
    scene: Scene | null | undefined;
    onDescriptionChange: (description: string) => void;
    onPublishedChange: (published: boolean) => void;
    onSceneUpdate?: (updates: Partial<Scene>) => void;
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
    onPublishedChange,
    onSceneUpdate
}) => {
    const theme = useTheme();

    const [displayExpanded, setDisplayExpanded] = useState(true);

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
        textField: {
            '& .MuiInputBase-root': {
                height: '28px',
                fontSize: '11px',
                backgroundColor: theme.palette.background.default
            },
            '& .MuiInputBase-input': {
                padding: '4px 8px',
                fontSize: '11px'
            },
            '& .MuiInputLabel-root': {
                fontSize: '9px',
                transform: 'translate(8px, 6px) scale(1)',
                '&.MuiInputLabel-shrink': {
                    transform: 'translate(8px, -8px) scale(0.85)'
                }
            }
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
        select: {
            height: '28px',
            fontSize: '11px',
            '& .MuiSelect-select': {
                padding: '4px 8px',
                fontSize: '11px'
            }
        },
        inputLabel: {
            fontSize: '9px',
            transform: 'translate(8px, 6px) scale(1)',
            '&.MuiInputLabel-shrink': {
                transform: 'translate(8px, -8px) scale(0.85)'
            }
        },
        toggleLabel: {
            fontSize: '10px'
        },
        menuItem: {
            fontSize: '11px',
            minHeight: '32px'
        },
        accordionSummary: {
            minHeight: '36px',
            '&.Mui-expanded': {
                minHeight: '36px'
            },
            '& .MuiAccordionSummary-content': {
                margin: '6px 0',
                '&.Mui-expanded': {
                    margin: '6px 0'
                }
            }
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
                    top: 64,
                    bottom: 20,
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

                <Divider sx={{ my: 1 }} />

                {/* Display Settings Accordion */}
                <Accordion
                    expanded={displayExpanded}
                    onChange={() => setDisplayExpanded(!displayExpanded)}
                    sx={{
                        backgroundColor: theme.palette.background.default,
                        boxShadow: 'none',
                        '&:before': { display: 'none' }
                    }}
                >
                    <AccordionSummary
                        expandIcon={<ExpandMoreIcon sx={{ fontSize: 18 }} />}
                        sx={compactStyles.accordionSummary}
                    >
                        <Typography sx={compactStyles.sectionHeader}>
                            Display Settings
                        </Typography>
                    </AccordionSummary>
                    <AccordionDetails sx={{ p: 1, pt: 0 }}>
                        <Box sx={{ display: 'flex', flexDirection: 'column', gap: 0.75 }}>
                            <FormControl fullWidth size="small">
                                <InputLabel id="label-default-display" sx={compactStyles.inputLabel}>Creature</InputLabel>
                                <Select
                                    id="select-default-display"
                                    labelId="label-default-display"
                                    value={scene?.defaultDisplayName ?? DisplayName.Always}
                                    label="Creature"
                                    onChange={(e) => {
                                        if (onSceneUpdate) {
                                            onSceneUpdate({ defaultDisplayName: e.target.value as DisplayName });
                                        }
                                    }}
                                    sx={compactStyles.select}
                                >
                                    <MenuItem sx={compactStyles.menuItem} value={DisplayName.Always}>Always</MenuItem>
                                    <MenuItem sx={compactStyles.menuItem} value={DisplayName.OnHover}>On Hover</MenuItem>
                                    <MenuItem sx={compactStyles.menuItem} value={DisplayName.Never}>Never</MenuItem>
                                </Select>
                            </FormControl>

                            <FormControl fullWidth size="small">
                                <InputLabel id="label-default-position" sx={compactStyles.inputLabel}>Label</InputLabel>
                                <Select
                                    id="select-default-position"
                                    labelId="label-default-position"
                                    value={scene?.defaultLabelPosition ?? LabelPosition.Bottom}
                                    label="Label"
                                    onChange={(e) => {
                                        if (onSceneUpdate) {
                                            onSceneUpdate({ defaultLabelPosition: e.target.value as LabelPosition });
                                        }
                                    }}
                                    sx={compactStyles.select}
                                >
                                    <MenuItem sx={compactStyles.menuItem} value={LabelPosition.Top}>Top</MenuItem>
                                    <MenuItem sx={compactStyles.menuItem} value={LabelPosition.Middle}>Middle</MenuItem>
                                    <MenuItem sx={compactStyles.menuItem} value={LabelPosition.Bottom}>Bottom</MenuItem>
                                </Select>
                            </FormControl>
                        </Box>
                    </AccordionDetails>
                </Accordion>
            </Box>
        </Drawer>
    );
};
