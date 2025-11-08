import React, { useState, useEffect, useRef } from 'react';
import { Box, IconButton, Drawer, Tooltip, useTheme } from '@mui/material';
import {
  GridOn as GridIcon,
  Layers as RegionsIcon,
  BorderAll as WallsIcon,
  MeetingRoom as OpeningsIcon,
  ViewInAr as ObjectsIcon,
  Pets as CreaturesIcon,
  Person as PlayersIcon,
  AutoAwesome as EffectsIcon,
  LightMode as SourcesIcon,
  VisibilityOff as FogOfWarIcon
} from '@mui/icons-material';
import { GridPanel, WallsPanel, ObjectsPanel, CreaturesPanel, SourcesPanel, RegionsPanel } from './panels';
import type { SourcePlacementProperties } from './panels';
import { AssetPicker } from '@/components/common';
import { GridConfig } from '@/utils/gridCalculator';
import { AssetKind } from '@/types/domain';
import type { SceneWall, WallVisibility, Asset, PlacedAsset, SceneSource, SceneRegion } from '@/types/domain';

export type PanelType =
  | 'grid'
  | 'regions'
  | 'walls'
  | 'openings'
  | 'objects'
  | 'creatures'
  | 'players'
  | 'effects'
  | 'lightSources'
  | 'fogOfWar';

export interface LeftToolBarProps {
  activePanel?: string | null;
  onPanelChange?: (panel: PanelType | null) => void;
  gridConfig?: GridConfig | undefined;
  onGridChange?: (grid: GridConfig) => void;
  sceneId?: string | undefined;
  sceneWalls?: SceneWall[] | undefined;
  selectedWallIndex?: number | null | undefined;
  onWallSelect?: (wallIndex: number | null) => void;
  onWallDelete?: (wallIndex: number) => void;
  onPlaceWall?: (properties: {
    visibility: WallVisibility;
    isClosed: boolean;
    material?: string;
    defaultHeight: number;
  }) => void;
  onEditVertices?: (wallIndex: number) => void;
  sceneRegions?: SceneRegion[] | undefined;
  selectedRegionIndex?: number | null | undefined;
  onRegionSelect?: (regionIndex: number) => void;
  onRegionDelete?: (regionIndex: number) => void;
  onPlaceRegion?: (properties: {
    name: string;
    type: string;
    value?: number;
    label?: string;
    color?: string;
  }) => void;
  onEditRegionVertices?: (regionIndex: number) => void;
  placedAssets?: PlacedAsset[] | undefined;
  selectedAssetIds?: string[] | undefined;
  onAssetSelectForPlacement?: (asset: Asset) => void;
  onPlacedAssetSelect?: (assetId: string, isCtrlPressed: boolean) => void;
  onPlacedAssetDelete?: (assetId: string) => void;
  onPlacedAssetRename?: (assetId: string, newName: string) => void;
  onPlacedAssetUpdate?: (assetId: string, updates: Partial<PlacedAsset>) => void;
  sceneSources?: SceneSource[] | undefined;
  selectedSourceIndex?: number | null | undefined;
  onSourceSelect?: (index: number) => void;
  onSourceDelete?: (index: number) => void;
  onPlaceSource?: (properties: SourcePlacementProperties) => void;
  onEditSource?: (index: number, updates: any) => void;
}

export const LeftToolBar: React.FC<LeftToolBarProps> = ({
  activePanel: externalActivePanel,
  onPanelChange,
  gridConfig,
  onGridChange,
  sceneId,
  sceneWalls,
  selectedWallIndex,
  onWallSelect,
  onWallDelete,
  onPlaceWall,
  onEditVertices,
  sceneRegions,
  selectedRegionIndex,
  onRegionSelect,
  onRegionDelete,
  onPlaceRegion,
  onEditRegionVertices,
  placedAssets = [],
  selectedAssetIds = [],
  onAssetSelectForPlacement,
  onPlacedAssetSelect,
  onPlacedAssetDelete,
  onPlacedAssetRename,
  onPlacedAssetUpdate,
  sceneSources,
  selectedSourceIndex,
  onSourceSelect,
  onSourceDelete,
  onPlaceSource,
  onEditSource
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
      const targetElement = target as Element;
      const isInsideToolbar = toolbarRef.current?.contains(target);
      const isInsideDrawer = drawerRef.current?.contains(target);

      const isInsideDialog = targetElement.closest?.('[role="dialog"]') !== null;
      const isInsideMenu = targetElement.closest?.('.MuiMenu-root, .MuiPopover-paper') !== null;

      if (!isInsideToolbar && !isInsideDrawer && !isInsideDialog && !isInsideMenu) {
        if (externalActivePanel !== undefined) {
          onPanelChange?.(null);
        } else {
          setInternalActivePanel(null);
          onPanelChange?.(null);
        }

        if (activePanel === 'walls' && selectedWallIndex !== null) {
          onWallSelect?.(null);
        }
        if (activePanel === 'regions' && selectedRegionIndex !== null) {
          onRegionSelect?.(null);
        }
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, [expanded, externalActivePanel, onPanelChange, activePanel, selectedWallIndex, onWallSelect, selectedRegionIndex, onRegionSelect]);

  const panelConfigs: Array<{ key: PanelType; icon: typeof GridIcon; label: string }> = [
    { key: 'grid', icon: GridIcon, label: 'Grid' },
    { key: 'regions', icon: RegionsIcon, label: 'Regions' },
    { key: 'walls', icon: WallsIcon, label: 'Walls' },
    { key: 'openings', icon: OpeningsIcon, label: 'Openings' },
    { key: 'objects', icon: ObjectsIcon, label: 'Objects' },
    { key: 'creatures', icon: CreaturesIcon, label: 'Creatures' },
    { key: 'players', icon: PlayersIcon, label: 'Players' },
    { key: 'effects', icon: EffectsIcon, label: 'Effects' },
    { key: 'lightSources', icon: SourcesIcon, label: 'Sources' },
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
          {activePanel === 'grid' && gridConfig && (
            <GridPanel
              gridConfig={gridConfig}
              {...(onGridChange ? { onGridChange } : {})}
            />
          )}
          {activePanel === 'regions' && (
            <RegionsPanel
              sceneRegions={sceneRegions || []}
              selectedRegionIndex={selectedRegionIndex !== undefined ? selectedRegionIndex : null}
              {...(onPlaceRegion ? { onPlaceRegion } : {})}
              {...(onRegionSelect ? { onRegionSelect } : {})}
              {...(onRegionDelete ? { onRegionDelete } : {})}
              {...(onEditRegionVertices ? { onEditVertices: onEditRegionVertices } : {})}
            />
          )}
          {activePanel === 'walls' && (
            <WallsPanel
              sceneId={sceneId || ''}
              sceneWalls={sceneWalls || []}
              selectedWallIndex={selectedWallIndex !== undefined ? selectedWallIndex : null}
              {...(onWallSelect ? { onWallSelect } : {})}
              {...(onWallDelete ? { onWallDelete } : {})}
              {...(onPlaceWall ? { onPlaceWall } : {})}
              {...(onEditVertices ? { onEditVertices } : {})}
            />
          )}
          {activePanel === 'openings' && (
            <Box>
              <Box sx={{ mb: 2, fontWeight: 'bold' }}>Openings</Box>
              <Box>Door/window controls</Box>
            </Box>
          )}
          {activePanel === 'objects' && (
            <ObjectsPanel
              placedAssets={placedAssets}
              selectedAssetIds={selectedAssetIds}
              onBrowseAssets={() => setAssetPickerOpen({ open: true, kind: AssetKind.Object })}
              {...(onPlacedAssetSelect ? { onAssetSelect: onPlacedAssetSelect } : {})}
              {...(onPlacedAssetDelete ? { onAssetDelete: onPlacedAssetDelete } : {})}
              {...(onPlacedAssetRename ? { onAssetRename: onPlacedAssetRename } : {})}
              {...(onPlacedAssetUpdate ? { onAssetUpdate: onPlacedAssetUpdate } : {})}
            />
          )}
          {activePanel === 'creatures' && (
            <CreaturesPanel
              placedAssets={placedAssets}
              selectedAssetIds={selectedAssetIds}
              onBrowseAssets={() => setAssetPickerOpen({ open: true, kind: AssetKind.Creature })}
              {...(onPlacedAssetSelect ? { onAssetSelect: onPlacedAssetSelect } : {})}
              {...(onPlacedAssetDelete ? { onAssetDelete: onPlacedAssetDelete } : {})}
              {...(onPlacedAssetRename ? { onAssetRename: onPlacedAssetRename } : {})}
              {...(onPlacedAssetUpdate ? { onAssetUpdate: onPlacedAssetUpdate } : {})}
            />
          )}
          {activePanel === 'players' && (
            <Box>
              <Box sx={{ mb: 2, fontWeight: 'bold' }}>Players</Box>
              <Box>Player token controls (coming soon)</Box>
            </Box>
          )}
          {activePanel === 'effects' && (
            <Box>
              <Box sx={{ mb: 2, fontWeight: 'bold' }}>Effects</Box>
              <Box>Visual effects controls</Box>
            </Box>
          )}
          {activePanel === 'lightSources' && (
            <SourcesPanel
              sceneId={sceneId || ''}
              sceneSources={sceneSources || []}
              selectedSourceIndex={selectedSourceIndex !== undefined ? selectedSourceIndex : null}
              onSourceSelect={onSourceSelect || (() => {})}
              onSourceDelete={onSourceDelete || (() => {})}
              onPlaceSource={onPlaceSource || (() => {})}
              {...(onEditSource ? { onEditSource } : {})}
            />
          )}
          {activePanel === 'fogOfWar' && (
            <Box>
              <Box sx={{ mb: 2, fontWeight: 'bold' }}>Fog of War</Box>
              <Box>Fog of war controls</Box>
            </Box>
          )}
        </Box>
      </Drawer>

      {assetPickerOpen.kind && (
        <AssetPicker
          open={assetPickerOpen.open}
          onClose={() => setAssetPickerOpen({ open: false })}
          onSelect={(asset) => {
            setAssetPickerOpen({ open: false });
            onAssetSelectForPlacement?.(asset);
          }}
          kind={assetPickerOpen.kind}
        />
      )}
    </>
  );
};
