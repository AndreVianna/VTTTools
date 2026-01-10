import {
  AddCircleOutline as AddCircleOutlineIcon,
  Delete as DeleteIcon,
  ExpandLess as ExpandLessIcon,
  ExpandMore as ExpandMoreIcon,
} from '@mui/icons-material';
import {
  Box,
  Button,
  Collapse,
  Divider,
  FormControlLabel,
  IconButton,
  List,
  ListItem,
  ListItemButton,
  ListItemText,
  Switch,
  TextField,
  Typography,
  useTheme,
} from '@mui/material';
import React, { useState } from 'react';
import { AssetKind, type PlacedAsset } from '@/types/domain';
import type { GridConfig } from '@/utils/gridCalculator';
import { positionToGrid } from '@/utils/gridCalculator';

export interface CharactersPanelProps {
  placedAssets: PlacedAsset[];
  selectedAssetIds: string[];
  gridConfig?: GridConfig;
  onBrowseAssets?: () => void;
  onAssetSelect?: (assetId: string, isCtrlPressed: boolean) => void;
  onAssetDelete?: (assetId: string) => void;
  onAssetRename?: (assetId: string, newName: string) => void;
  onAssetUpdate?: (assetId: string, updates: Partial<PlacedAsset>) => void;
}

export const CharactersPanel: React.FC<CharactersPanelProps> = ({
  placedAssets,
  selectedAssetIds,
  gridConfig,
  onBrowseAssets,
  onAssetSelect,
  onAssetDelete,
  onAssetRename,
  onAssetUpdate,
}) => {
  const theme = useTheme();
  const [expandedAssets, setExpandedAssets] = useState<Set<string>>(new Set());
  const [editedNames, setEditedNames] = useState<Map<string, string>>(new Map());

  const characters = placedAssets.filter((a) => a.asset.classification.kind === AssetKind.Character);

  const toggleAssetExpanded = (assetId: string) => {
    setExpandedAssets((prev) => {
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
      mb: 0.5,
    },
    button: {
      height: '28px',
      fontSize: '11px',
      textTransform: 'none' as const,
      fontWeight: 500,
    },
    textField: {
      '& .MuiInputBase-root': {
        height: '28px',
        fontSize: '11px',
        backgroundColor: theme.palette.background.default,
      },
      '& .MuiInputBase-input': {
        padding: '4px 8px',
        fontSize: '11px',
      },
    },
  };

  return (
    <Box
      sx={{
        display: 'flex',
        flexDirection: 'column',
        height: '100%',
        gap: 1.5,
      }}
    >
      <Typography variant='overline' sx={compactStyles.sectionHeader}>
        Characters
      </Typography>

      <Button
        variant='contained'
        onClick={onBrowseAssets}
        startIcon={<AddCircleOutlineIcon />}
        sx={compactStyles.button}
        fullWidth
      >
        Browse Characters
      </Button>

      <Divider sx={{ my: 0.5 }} />

      <Typography variant='overline' sx={compactStyles.sectionHeader}>
        Placed Characters ({characters.length})
      </Typography>

      <List
        sx={{
          flex: 1,
          minHeight: 0,
          overflowY: 'auto',
          py: 0,
          border: `1px solid ${theme.palette.divider}`,
          borderRadius: 1,
        }}
      >
        {characters.length === 0 ? (
          <ListItem>
            <ListItemText
              primary={
                <Typography sx={{ fontSize: '10px', color: theme.palette.text.disabled }}>
                  No characters placed
                </Typography>
              }
            />
          </ListItem>
        ) : (
          characters.map((placedAsset) => {
            const isExpanded = expandedAssets.has(placedAsset.id);
            const isSelected = selectedAssetIds.includes(placedAsset.id);

            return (
              <React.Fragment key={placedAsset.id}>
                <ListItem
                  disablePadding
                  secondaryAction={
                    <IconButton
                      edge='end'
                      size='small'
                      onClick={(e) => {
                        e.stopPropagation();
                        onAssetDelete?.(placedAsset.id);
                      }}
                      sx={{
                        width: 20,
                        height: 24,
                        color: theme.palette.error.main,
                      }}
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
                      size='small'
                      onClick={(e) => {
                        e.stopPropagation();
                        toggleAssetExpanded(placedAsset.id);
                      }}
                      sx={{ width: 24, height: 24, mr: 0.5 }}
                    >
                      {isExpanded ? <ExpandLessIcon sx={{ fontSize: 14 }} /> : <ExpandMoreIcon sx={{ fontSize: 14 }} />}
                    </IconButton>

                    {isExpanded ? (
                      <TextField
                        value={editedNames.get(placedAsset.id) ?? placedAsset.name}
                        onChange={(e) => {
                          setEditedNames((prev) => {
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
                        size='small'
                        fullWidth
                        sx={{
                          ...compactStyles.textField,
                          mr: 1,
                        }}
                      />
                    ) : (
                      <ListItemText
                        primary={placedAsset.name}
                        secondary={placedAsset.asset.name}
                        primaryTypographyProps={{
                          fontSize: '11px',
                          fontWeight: isSelected ? 600 : 400,
                        }}
                        secondaryTypographyProps={{
                          fontSize: '9px',
                        }}
                      />
                    )}
                  </ListItemButton>
                </ListItem>

                <Collapse in={isExpanded} timeout='auto' unmountOnExit>
                  <Box
                    sx={{
                      px: 2,
                      py: 1,
                      bgcolor: theme.palette.action.hover,
                      display: 'flex',
                      flexDirection: 'column',
                      gap: 1,
                    }}
                  >
                    <Typography
                      sx={{
                        fontSize: '9px',
                        color: theme.palette.text.secondary,
                        fontWeight: 600,
                      }}
                    >
                      Asset: {placedAsset.asset.name}
                    </Typography>

                    <Typography
                      sx={{
                        fontSize: '9px',
                        color: theme.palette.text.secondary,
                      }}
                    >
                      {gridConfig ? (() => {
                        const gridPos = positionToGrid(placedAsset.position || { x: 0, y: 0 }, gridConfig);
                        return `Position: (${gridPos.x.toFixed(1)}, ${gridPos.y.toFixed(1)}) grid`;
                      })() : `Position: (${placedAsset.position?.x?.toFixed(0) ?? '0'}, ${placedAsset.position?.y?.toFixed(0) ?? '0'}) px`}
                    </Typography>

                    <Box sx={{ display: 'flex', gap: 2 }}>
                      <FormControlLabel
                        control={
                          <Switch
                            checked={!placedAsset.isHidden}
                            onChange={(e) =>
                              onAssetUpdate?.(placedAsset.id, {
                                isHidden: !e.target.checked,
                              })
                            }
                            size='small'
                          />
                        }
                        label={<Typography sx={{ fontSize: '10px' }}>Visible</Typography>}
                        sx={{ m: 0 }}
                      />
                      <FormControlLabel
                        control={
                          <Switch
                            checked={placedAsset.isLocked}
                            onChange={(e) =>
                              onAssetUpdate?.(placedAsset.id, {
                                isLocked: e.target.checked,
                              })
                            }
                            size='small'
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
