import React, { useState, useEffect, useRef } from 'react';
import { Box, IconButton, Drawer, Tooltip, useTheme, Typography, Button } from '@mui/material';
import {
  Wallpaper as BackgroundIcon,
  Terrain as ElevationIcon,
  GridOn as GridIcon,
  BorderAll as WallsIcon,
  MeetingRoom as OpeningsIcon,
  ViewInAr as ObjectsIcon,
  Pets as CreaturesIcon,
  Person as PlayersIcon,
  AutoAwesome as EffectsIcon,
  Lightbulb as LightSourcesIcon,
  Layers as OverlaysIcon,
  Cloud as WeatherIcon,
  LightMode as GlobalLightingIcon,
  VisibilityOff as FogOfWarIcon,
  AddCircleOutline as AddCircleOutlineIcon
} from '@mui/icons-material';
import { BackgroundPanel, GridPanel, WallsPanel } from './panels';
import { AssetPicker } from '@/components/common';
import { GridConfig } from '@/utils/gridCalculator';
import { AssetKind } from '@/types/domain';
import type { SceneWall, WallVisibility, Asset } from '@/types/domain';

export type PanelType =
  | 'background'
  | 'elevation'
  | 'grid'
  | 'walls'
  | 'openings'
  | 'objects'
  | 'creatures'
  | 'players'
  | 'effects'
  | 'lightSources'
  | 'overlays'
  | 'weather'
  | 'globalLighting'
  | 'fogOfWar';

export interface LeftToolBarProps {
  activePanel?: string | null;
  onPanelChange?: (panel: PanelType | null) => void;
  backgroundUrl?: string;
  isUploadingBackground?: boolean;
  onBackgroundUpload?: (file: File) => void;
  gridConfig?: GridConfig;
  onGridChange?: (grid: GridConfig) => void;
  sceneId?: string;
  sceneWalls?: SceneWall[];
  selectedWallIndex?: number | null;
  onWallSelect?: (wallIndex: number | null) => void;
  onWallDelete?: (wallIndex: number) => void;
  onPlaceWall?: (properties: {
    visibility: WallVisibility;
    isClosed: boolean;
    material?: string;
    defaultHeight: number;
  }) => void;
  onEditVertices?: (wallIndex: number) => void;
  onAssetSelect?: (asset: Asset) => void;
}

export const LeftToolBar: React.FC<LeftToolBarProps> = ({
  activePanel: externalActivePanel,
  onPanelChange,
  backgroundUrl,
  isUploadingBackground,
  onBackgroundUpload,
  gridConfig,
  onGridChange,
  sceneId,
  sceneWalls,
  selectedWallIndex,
  onWallSelect,
  onWallDelete,
  onPlaceWall,
  onEditVertices,
  onAssetSelect
}) => {
  const theme = useTheme();
  const [internalActivePanel, setInternalActivePanel] = useState<PanelType | null>(null);
  const [assetPickerOpen, setAssetPickerOpen] = useState<{ open: boolean; kind?: AssetKind }>({ open: false });
  const toolbarRef = useRef<HTMLDivElement>(null);
  const drawerRef = useRef<HTMLDivElement>(null);

  const activePanel = externalActivePanel !== undefined ? (externalActivePanel as PanelType | null) : internalActivePanel;
  const expanded = activePanel !== null;

  const handlePanelClick = (panel: PanelType) => {
    const newPanel = (activePanel === panel) ? null : panel;

    if (externalActivePanel !== undefined) {
      onPanelChange?.(newPanel);
    } else {
      setInternalActivePanel(newPanel);
      onPanelChange?.(newPanel);
    }
  };

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (!expanded) return;

      const target = event.target as Node;
      const isInsideToolbar = toolbarRef.current?.contains(target);
      const isInsideDrawer = drawerRef.current?.contains(target);

      const isInsideDialog = (target as Element).closest?.('[role="dialog"]') !== null;

      if (!isInsideToolbar && !isInsideDrawer && !isInsideDialog) {
        if (externalActivePanel !== undefined) {
          onPanelChange?.(null);
        } else {
          setInternalActivePanel(null);
          onPanelChange?.(null);
        }

        if (activePanel === 'walls' && selectedWallIndex !== null) {
          onWallSelect?.(null);
        }
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, [expanded, externalActivePanel, onPanelChange, activePanel, selectedWallIndex, onWallSelect]);

  const panelConfigs: Array<{ key: PanelType; icon: typeof BackgroundIcon; label: string }> = [
    { key: 'background', icon: BackgroundIcon, label: 'Background' },
    { key: 'elevation', icon: ElevationIcon, label: 'Elevation' },
    { key: 'grid', icon: GridIcon, label: 'Grid' },
    { key: 'walls', icon: WallsIcon, label: 'Walls' },
    { key: 'openings', icon: OpeningsIcon, label: 'Openings' },
    { key: 'objects', icon: ObjectsIcon, label: 'Objects' },
    { key: 'creatures', icon: CreaturesIcon, label: 'Creatures' },
    { key: 'players', icon: PlayersIcon, label: 'Players' },
    { key: 'effects', icon: EffectsIcon, label: 'Effects' },
    { key: 'lightSources', icon: LightSourcesIcon, label: 'Light Sources' },
    { key: 'overlays', icon: OverlaysIcon, label: 'Overlays' },
    { key: 'weather', icon: WeatherIcon, label: 'Weather' },
    { key: 'globalLighting', icon: GlobalLightingIcon, label: 'Global Lighting' },
    { key: 'fogOfWar', icon: FogOfWarIcon, label: 'Fog of War' }
  ];

  return (
    <>
      <Box
        ref={toolbarRef}
        sx={{
          position: 'absolute',
          left: 0,
          top: 36,
          bottom: 0,
          width: 32,
          backgroundColor: theme.palette.background.paper,
          borderRight: `1px solid ${theme.palette.divider}`,
          display: 'flex',
          flexDirection: 'column',
          gap: 0.25,
          py: 0.5,
          zIndex: 1000,
          overflowY: 'auto',
          overflowX: 'hidden'
        }}
      >
        {panelConfigs.map(({ key, icon: Icon, label }) => (
          <Tooltip key={key} title={label} placement="right">
            <IconButton
              size="small"
              onClick={() => handlePanelClick(key)}
              sx={{
                width: 28,
                height: 28,
                borderRadius: 0,
                mx: 'auto',
                flexShrink: 0,
                backgroundColor: activePanel === key ? theme.palette.action.selected : 'transparent',
                '&:hover': {
                  backgroundColor: theme.palette.action.hover
                }
              }}
            >
              <Icon sx={{ fontSize: 18 }} />
            </IconButton>
          </Tooltip>
        ))}
      </Box>

      <Drawer
        variant="persistent"
        anchor="left"
        open={expanded}
        sx={{
          '& .MuiDrawer-paper': {
            width: 280,
            left: 32,
            top: 64,
            bottom: 20,
            boxSizing: 'border-box',
            backgroundColor: theme.palette.background.paper,
            borderRight: `1px solid ${theme.palette.divider}`,
            zIndex: 999
          }
        }}
      >
        <Box ref={drawerRef} sx={{ p: 2 }}>
          {activePanel === 'background' && (
            <BackgroundPanel
              backgroundUrl={backgroundUrl}
              isUploadingBackground={isUploadingBackground}
              onBackgroundUpload={onBackgroundUpload}
            />
          )}
          {activePanel === 'elevation' && (
            <Box>
              <Typography sx={{ mb: 2, fontWeight: 'bold', fontSize: '10px', textTransform: 'uppercase' }}>Elevation Settings</Typography>
              <Typography sx={{ fontSize: '11px', color: 'text.secondary' }}>Elevation region controls</Typography>
            </Box>
          )}
          {activePanel === 'grid' && gridConfig && (
            <GridPanel
              gridConfig={gridConfig}
              onGridChange={onGridChange}
            />
          )}
          {activePanel === 'walls' && (
            <WallsPanel
              sceneId={sceneId}
              sceneWalls={sceneWalls}
              selectedWallIndex={selectedWallIndex}
              onWallSelect={onWallSelect}
              onWallDelete={onWallDelete}
              onPlaceWall={onPlaceWall}
              onEditVertices={onEditVertices}
            />
          )}
          {activePanel === 'openings' && (
            <Box>
              <Box sx={{ mb: 2, fontWeight: 'bold' }}>Openings</Box>
              <Box>Door/window controls</Box>
            </Box>
          )}
          {activePanel === 'objects' && (
            <Box>
              <Typography sx={{ mb: 2, fontWeight: 'bold', fontSize: '12px', textTransform: 'uppercase' }}>
                Objects
              </Typography>
              <Typography sx={{ fontSize: '11px', color: 'text.secondary', mb: 2 }}>
                Place furniture, props, and static elements on the scene
              </Typography>
              <Button
                fullWidth
                variant="contained"
                size="small"
                startIcon={<AddCircleOutlineIcon />}
                onClick={() => setAssetPickerOpen({ open: true, kind: AssetKind.Object })}
              >
                Browse Objects
              </Button>
            </Box>
          )}
          {activePanel === 'creatures' && (
            <Box>
              <Typography sx={{ mb: 2, fontWeight: 'bold', fontSize: '12px', textTransform: 'uppercase' }}>
                Creatures
              </Typography>
              <Typography sx={{ fontSize: '11px', color: 'text.secondary', mb: 2 }}>
                Place NPCs, monsters, and creatures on the scene
              </Typography>
              <Button
                fullWidth
                variant="contained"
                size="small"
                startIcon={<AddCircleOutlineIcon />}
                onClick={() => setAssetPickerOpen({ open: true, kind: AssetKind.Creature })}
              >
                Browse Creatures
              </Button>
            </Box>
          )}
          {activePanel === 'players' && (
            <Box>
              <Typography sx={{ mb: 2, fontWeight: 'bold', fontSize: '12px', textTransform: 'uppercase' }}>
                Players
              </Typography>
              <Typography sx={{ fontSize: '11px', color: 'text.secondary', mb: 2 }}>
                Place player character tokens on the scene (uses creature assets)
              </Typography>
              <Button
                fullWidth
                variant="contained"
                size="small"
                startIcon={<AddCircleOutlineIcon />}
                onClick={() => setAssetPickerOpen({ open: true, kind: AssetKind.Creature })}
              >
                Browse Player Tokens
              </Button>
            </Box>
          )}
          {activePanel === 'effects' && (
            <Box>
              <Box sx={{ mb: 2, fontWeight: 'bold' }}>Effects</Box>
              <Box>Visual effects controls</Box>
            </Box>
          )}
          {activePanel === 'lightSources' && (
            <Box>
              <Box sx={{ mb: 2, fontWeight: 'bold' }}>Light Sources</Box>
              <Box>Light source placement controls</Box>
            </Box>
          )}
          {activePanel === 'overlays' && (
            <Box>
              <Box sx={{ mb: 2, fontWeight: 'bold' }}>Overlays</Box>
              <Box>UI overlay controls</Box>
            </Box>
          )}
          {activePanel === 'weather' && (
            <Box>
              <Box sx={{ mb: 2, fontWeight: 'bold' }}>Weather</Box>
              <Box>Weather region controls</Box>
            </Box>
          )}
          {activePanel === 'globalLighting' && (
            <Box>
              <Box sx={{ mb: 2, fontWeight: 'bold' }}>Global Lighting</Box>
              <Box>Global lighting mode controls</Box>
            </Box>
          )}
          {activePanel === 'fogOfWar' && (
            <Box>
              <Box sx={{ mb: 2, fontWeight: 'bold' }}>Fog of War</Box>
              <Box>Fog of war controls</Box>
            </Box>
          )}
        </Box>
      </Drawer>

      <AssetPicker
        open={assetPickerOpen.open}
        onClose={() => setAssetPickerOpen({ open: false })}
        onSelect={(asset) => {
          setAssetPickerOpen({ open: false });
          onAssetSelect?.(asset);
        }}
        kind={assetPickerOpen.kind}
      />
    </>
  );
};
