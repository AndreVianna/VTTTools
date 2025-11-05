import React, { useState } from 'react';
import {
    Box,
    Button,
    List,
    ListItem,
    ListItemButton,
    ListItemText,
    Typography,
    IconButton,
    Divider,
    Collapse,
    TextField,
    Select,
    MenuItem,
    FormControl,
    FormControlLabel,
    Switch,
    InputLabel,
    useTheme
} from '@mui/material';
import {
    Delete as DeleteIcon,
    ExpandMore as ExpandMoreIcon,
    ExpandLess as ExpandLessIcon,
    AddCircleOutline as AddCircleOutlineIcon
} from '@mui/icons-material';
import { AssetKind, DisplayName, LabelPosition, type PlacedAsset } from '@/types/domain';

export interface CreaturesPanelProps {
    placedAssets: PlacedAsset[];
    selectedAssetIds: string[];
    onBrowseAssets?: () => void;
    onAssetSelect?: (assetId: string, isCtrlPressed: boolean) => void;
    onAssetDelete?: (assetId: string) => void;
    onAssetRename?: (assetId: string, newName: string) => void;
    onAssetUpdate?: (assetId: string, updates: Partial<PlacedAsset>) => void;
}

export const CreaturesPanel: React.FC<CreaturesPanelProps> = ({
    placedAssets,
    selectedAssetIds,
    onBrowseAssets,
    onAssetSelect,
    onAssetDelete,
    onAssetRename,
    onAssetUpdate
}) => {
    const theme = useTheme();
    const [expandedAssets, setExpandedAssets] = useState<Set<string>>(new Set());
    const [editedNames, setEditedNames] = useState<Map<string, string>>(new Map());

    // Default values state
    const [defaultLabelDisplay, setDefaultLabelDisplay] = useState<DisplayName>(DisplayName.Default);
    const [defaultLabelPosition, setDefaultLabelPosition] = useState<LabelPosition>(LabelPosition.Default);
    const [defaultVisible, setDefaultVisible] = useState<boolean>(true);
    const [defaultLocked, setDefaultLocked] = useState<boolean>(false);

    const creatures = placedAssets.filter(a => a.asset.kind === AssetKind.Creature);

    const toggleAssetExpanded = (assetId: string) => {
        setExpandedAssets(prev => {
            const newSet = new Set(prev);
            if (newSet.has(assetId)) {
                newSet.delete(assetId);
            } else {
                newSet.add(assetId);
            }
            return newSet;
        });
    };

    const compactStyles = {
        sectionHeader: {
            fontSize: '10px',
            fontWeight: 700,
            textTransform: 'uppercase' as const,
            letterSpacing: '0.5px',
            color: theme.palette.text.secondary,
            mb: 0.5
        },
        button: {
            height: '28px',
            fontSize: '11px',
            textTransform: 'none' as const,
            fontWeight: 500
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
            }
        }
    };

    return (
        <Box sx={{ display: 'flex', flexDirection: 'column', height: '100%', gap: 1.5 }}>
            <Typography variant="overline" sx={compactStyles.sectionHeader}>
                Creatures
            </Typography>

            <Button
                variant="contained"
                onClick={onBrowseAssets}
                startIcon={<AddCircleOutlineIcon />}
                sx={compactStyles.button}
                fullWidth
            >
                Browse Creatures
            </Button>

            <Divider sx={{ my: 0.5 }} />

            <Typography variant="overline" sx={compactStyles.sectionHeader}>
                Default Values
            </Typography>

            <Box sx={{ display: 'flex', flexDirection: 'column', gap: 1 }}>
                <FormControl size="small" fullWidth sx={compactStyles.textField}>
                    <InputLabel sx={{ fontSize: '11px' }}>Label Display</InputLabel>
                    <Select
                        value={defaultLabelDisplay}
                        onChange={(e) => setDefaultLabelDisplay(e.target.value as DisplayName)}
                        label="Label Display"
                        sx={{ fontSize: '11px' }}
                    >
                        <MenuItem value={DisplayName.Default} sx={{ fontSize: '11px' }}>Default</MenuItem>
                        <MenuItem value={DisplayName.Always} sx={{ fontSize: '11px' }}>Always</MenuItem>
                        <MenuItem value={DisplayName.OnHover} sx={{ fontSize: '11px' }}>On Hover</MenuItem>
                        <MenuItem value={DisplayName.Never} sx={{ fontSize: '11px' }}>Never</MenuItem>
                    </Select>
                </FormControl>

                <FormControl size="small" fullWidth sx={compactStyles.textField}>
                    <InputLabel sx={{ fontSize: '11px' }}>Label Position</InputLabel>
                    <Select
                        value={defaultLabelPosition}
                        onChange={(e) => setDefaultLabelPosition(e.target.value as LabelPosition)}
                        label="Label Position"
                        sx={{ fontSize: '11px' }}
                    >
                        <MenuItem value={LabelPosition.Default} sx={{ fontSize: '11px' }}>Default</MenuItem>
                        <MenuItem value={LabelPosition.Top} sx={{ fontSize: '11px' }}>Top</MenuItem>
                        <MenuItem value={LabelPosition.Middle} sx={{ fontSize: '11px' }}>Middle</MenuItem>
                        <MenuItem value={LabelPosition.Bottom} sx={{ fontSize: '11px' }}>Bottom</MenuItem>
                    </Select>
                </FormControl>

                <Box sx={{ display: 'flex', gap: 2 }}>
                    <FormControlLabel
                        control={
                            <Switch
                                checked={defaultVisible}
                                onChange={(e) => setDefaultVisible(e.target.checked)}
                                size="small"
                            />
                        }
                        label={<Typography sx={{ fontSize: '10px' }}>Visible</Typography>}
                        sx={{ m: 0 }}
                    />
                    <FormControlLabel
                        control={
                            <Switch
                                checked={defaultLocked}
                                onChange={(e) => setDefaultLocked(e.target.checked)}
                                size="small"
                            />
                        }
                        label={<Typography sx={{ fontSize: '10px' }}>Locked</Typography>}
                        sx={{ m: 0 }}
                    />
                </Box>
            </Box>

            <Divider sx={{ my: 0.5 }} />

            <Typography variant="overline" sx={compactStyles.sectionHeader}>
                Placed Creatures ({creatures.length})
            </Typography>

            <List
                sx={{
                    flex: 1,
                    minHeight: 0,
                    overflowY: 'auto',
                    py: 0,
                    border: `1px solid ${theme.palette.divider}`,
                    borderRadius: 1
                }}
            >
                {creatures.length === 0 ? (
                    <ListItem>
                        <ListItemText
                            primary={
                                <Typography sx={{ fontSize: '10px', color: theme.palette.text.disabled }}>
                                    No creatures placed
                                </Typography>
                            }
                        />
                    </ListItem>
                ) : (
                    creatures.map((placedAsset) => {
                        const isExpanded = expandedAssets.has(placedAsset.id);
                        const isSelected = selectedAssetIds.includes(placedAsset.id);

                        return (
                            <React.Fragment key={placedAsset.id}>
                                <ListItem
                                    disablePadding
                                    secondaryAction={
                                        <IconButton
                                            edge="end"
                                            size="small"
                                            onClick={(e) => {
                                                e.stopPropagation();
                                                onAssetDelete?.(placedAsset.id);
                                            }}
                                            sx={{ width: 20, height: 24, color: theme.palette.error.main }}
                                        >
                                            <DeleteIcon sx={{ fontSize: 14 }} />
                                        </IconButton>
                                    }
                                >
                                    <ListItemButton
                                        selected={isSelected}
                                        onClick={(e) => onAssetSelect?.(placedAsset.id, e.ctrlKey || e.metaKey)}
                                        sx={{ py: 0.5, pr: 6, pl: 0.5 }}
                                    >
                                        <IconButton
                                            size="small"
                                            onClick={(e) => {
                                                e.stopPropagation();
                                                toggleAssetExpanded(placedAsset.id);
                                            }}
                                            sx={{ width: 24, height: 24, mr: 0.5 }}
                                        >
                                            {isExpanded ? (
                                                <ExpandLessIcon sx={{ fontSize: 14 }} />
                                            ) : (
                                                <ExpandMoreIcon sx={{ fontSize: 14 }} />
                                            )}
                                        </IconButton>

                                        {isExpanded ? (
                                            <TextField
                                                value={editedNames.get(placedAsset.id) ?? placedAsset.name}
                                                onChange={(e) => {
                                                    setEditedNames(prev => {
                                                        const newMap = new Map(prev);
                                                        newMap.set(placedAsset.id, e.target.value);
                                                        return newMap;
                                                    });
                                                }}
                                                onBlur={(e) => {
                                                    onAssetRename?.(placedAsset.id, e.target.value);
                                                }}
                                                onKeyDown={(e) => {
                                                    e.stopPropagation();
                                                    if (e.key === 'Enter') {
                                                        e.currentTarget.blur();
                                                    }
                                                }}
                                                onClick={(e) => e.stopPropagation()}
                                                size="small"
                                                fullWidth
                                                sx={{
                                                    ...compactStyles.textField,
                                                    mr: 1
                                                }}
                                            />
                                        ) : (
                                            <ListItemText
                                                primary={placedAsset.name}
                                                secondary={placedAsset.asset.name}
                                                primaryTypographyProps={{
                                                    fontSize: '11px',
                                                    fontWeight: isSelected ? 600 : 400
                                                }}
                                                secondaryTypographyProps={{
                                                    fontSize: '9px'
                                                }}
                                            />
                                        )}
                                    </ListItemButton>
                                </ListItem>

                                <Collapse in={isExpanded} timeout="auto" unmountOnExit>
                                    <Box sx={{ px: 2, py: 1, bgcolor: theme.palette.action.hover, display: 'flex', flexDirection: 'column', gap: 1 }}>
                                        <Typography sx={{ fontSize: '9px', color: theme.palette.text.secondary, fontWeight: 600 }}>
                                            Asset: {placedAsset.asset.name}
                                        </Typography>

                                        <Typography sx={{ fontSize: '9px', color: theme.palette.text.secondary }}>
                                            Position: ({placedAsset.position.x.toFixed(0)}, {placedAsset.position.y.toFixed(0)})
                                        </Typography>

                                        <TextField
                                            label="Rotation"
                                            type="number"
                                            value={placedAsset.rotation}
                                            onChange={(e) => onAssetUpdate?.(placedAsset.id, { rotation: Number(e.target.value) })}
                                            size="small"
                                            fullWidth
                                            inputProps={{ min: 0, max: 360, step: 15 }}
                                            sx={compactStyles.textField}
                                        />

                                        <TextField
                                            label="Elevation"
                                            type="number"
                                            value={placedAsset.elevation || 0}
                                            onChange={(e) => onAssetUpdate?.(placedAsset.id, { elevation: Number(e.target.value) })}
                                            size="small"
                                            fullWidth
                                            inputProps={{ min: 0, max: 100, step: 1 }}
                                            sx={compactStyles.textField}
                                        />

                                        <FormControl size="small" fullWidth sx={compactStyles.textField}>
                                            <InputLabel sx={{ fontSize: '11px' }}>Label Display</InputLabel>
                                            <Select
                                                value={placedAsset.displayName || DisplayName.Default}
                                                onChange={(e) => onAssetUpdate?.(placedAsset.id, { displayName: e.target.value as DisplayName })}
                                                label="Label Display"
                                                sx={{ fontSize: '11px' }}
                                            >
                                                <MenuItem value={DisplayName.Default} sx={{ fontSize: '11px' }}>Default</MenuItem>
                                                <MenuItem value={DisplayName.Always} sx={{ fontSize: '11px' }}>Always</MenuItem>
                                                <MenuItem value={DisplayName.OnHover} sx={{ fontSize: '11px' }}>On Hover</MenuItem>
                                                <MenuItem value={DisplayName.Never} sx={{ fontSize: '11px' }}>Never</MenuItem>
                                            </Select>
                                        </FormControl>

                                        <FormControl size="small" fullWidth sx={compactStyles.textField}>
                                            <InputLabel sx={{ fontSize: '11px' }}>Label Position</InputLabel>
                                            <Select
                                                value={placedAsset.labelPosition || LabelPosition.Default}
                                                onChange={(e) => onAssetUpdate?.(placedAsset.id, { labelPosition: e.target.value as LabelPosition })}
                                                label="Label Position"
                                                sx={{ fontSize: '11px' }}
                                            >
                                                <MenuItem value={LabelPosition.Default} sx={{ fontSize: '11px' }}>Default</MenuItem>
                                                <MenuItem value={LabelPosition.Top} sx={{ fontSize: '11px' }}>Top</MenuItem>
                                                <MenuItem value={LabelPosition.Middle} sx={{ fontSize: '11px' }}>Middle</MenuItem>
                                                <MenuItem value={LabelPosition.Bottom} sx={{ fontSize: '11px' }}>Bottom</MenuItem>
                                            </Select>
                                        </FormControl>

                                        <Box sx={{ display: 'flex', flexDirection: 'column', gap: 0.5 }}>
                                            <FormControlLabel
                                                control={
                                                    <Switch
                                                        checked={placedAsset.visible !== false}
                                                        onChange={(e) => onAssetUpdate?.(placedAsset.id, { visible: e.target.checked })}
                                                        size="small"
                                                    />
                                                }
                                                label={<Typography sx={{ fontSize: '10px' }}>Visible</Typography>}
                                                sx={{ m: 0 }}
                                            />
                                            <FormControlLabel
                                                control={
                                                    <Switch
                                                        checked={placedAsset.locked || false}
                                                        onChange={(e) => onAssetUpdate?.(placedAsset.id, { locked: e.target.checked })}
                                                        size="small"
                                                    />
                                                }
                                                label={<Typography sx={{ fontSize: '10px' }}>Locked</Typography>}
                                                sx={{ m: 0 }}
                                            />
                                        </Box>
                                    </Box>
                                </Collapse>
                            </React.Fragment>
                        );
                    })
                )}
            </List>
        </Box>
    );
};
