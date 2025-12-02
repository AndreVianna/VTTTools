import {
  Pets as MonstersIcon,
  Cloud as FogOfWarIcon,
  type GridOn as GridIcon,
  Lock as LockIcon,
  LockOpen as LockOpenIcon,
  ViewInAr as ObjectsIcon,
  Person as CharactersIcon,
  Layers as RegionsIcon,
  LightMode as LightsIcon,
  VolumeUp as SoundsIcon,
  BorderAll as WallsIcon,
} from '@mui/icons-material';
import { Box, Drawer, IconButton, Tooltip, Typography, useTheme } from '@mui/material';
import type React from 'react';
import { useCallback, useEffect, useRef, useState } from 'react';
import type { Asset, EncounterLightSource, EncounterSoundSource, PlacedAsset, PlacedRegion, PlacedWall } from '@/types/domain';
import { AssetKind, type SegmentType } from '@/types/domain';
import type { GridConfig } from '@/utils/gridCalculator';
import type { InteractionScope } from '@/utils/scopeFiltering';
import type { LightPlacementProperties, SoundPlacementProperties } from './panels';
import { CharactersPanel, FogOfWarPanel, LightsPanel, MonstersPanel, ObjectsPanel, RegionsPanel, SoundsPanel, WallsPanel } from './panels';
import { QuickSummonDialog, type PlacementSettings } from './quicksummon';

export type PanelType =
  | 'regions'
  | 'walls'
  | 'objects'
  | 'monsters'
  | 'characters'
  | 'lights'
  | 'sounds'
  | 'fogOfWar';

export interface LeftToolBarProps {
  activeScope?: InteractionScope;
  onScopeChange?: (scope: InteractionScope) => void;
  activePanel?: string | null;
  onPanelChange?: (panel: PanelType | null) => void;
  encounterId?: string | undefined;
  gridConfig?: GridConfig;
  encounterWalls?: PlacedWall[] | undefined;
  selectedWallIndex?: number | null | undefined;
  isEditingVertices?: boolean;
  originalWallPoles?: import('@/types/domain').Pole[] | null;
  onWallSelect?: (wallIndex: number | null) => void;
  onWallDelete?: (wallIndex: number) => void;
  onPlaceWall?: (properties: {
    segmentType: SegmentType;
    defaultHeight: number;
  }) => void;
  onEditVertices?: (wallIndex: number) => void;
  onCancelEditing?: () => void;
  encounterRegions?: PlacedRegion[] | undefined;
  selectedRegionIndex?: number | null | undefined;
  onRegionSelect?: (regionIndex: number | null) => void;
  onRegionDelete?: (regionIndex: number) => void;
  onPlaceRegion?: (properties: { name: string; type: string; value?: number; label?: string; color?: string }) => void;
  onBucketFillRegion?: (properties: { name: string; type: string; value?: number; label?: string; color?: string }) => void;
  regionPlacementMode?: 'polygon' | 'bucketFill' | null;
  onEditRegionVertices?: (regionIndex: number) => void;
  placedAssets?: PlacedAsset[] | undefined;
  selectedAssetIds?: string[] | undefined;
  onAssetSelectForPlacement?: (asset: Asset) => void;
  onAssetPlaceWithSettings?: (asset: Asset, settings: PlacementSettings, tokenIndex: number) => void;
  onPlacedAssetSelect?: (assetId: string, isCtrlPressed: boolean) => void;
  onPlacedAssetDelete?: (assetId: string) => void;
  onPlacedAssetRename?: (assetId: string, newName: string) => void;
  onPlacedAssetUpdate?: (assetId: string, updates: Partial<PlacedAsset>) => void;
  encounterLightSources?: EncounterLightSource[] | undefined;
  encounterSoundSources?: EncounterSoundSource[] | undefined;
  selectedLightSourceIndex?: number | null | undefined;
  selectedSoundSourceIndex?: number | null | undefined;
  onLightSourceSelect?: (index: number) => void;
  onSoundSourceSelect?: (index: number) => void;
  onPlaceLight?: (properties: LightPlacementProperties) => void;
  onPlaceSound?: (properties: SoundPlacementProperties) => void;
  onFogHideAll?: () => void;
  onFogRevealAll?: () => void;
  onFogModeChange?: (mode: 'add' | 'subtract') => void;
  onFogDrawPolygon?: () => void;
  onFogBucketFill?: () => void;
  fogMode?: 'add' | 'subtract';
}

export const LeftToolBar: React.FC<LeftToolBarProps> = ({
  activeScope,
  onScopeChange,
  activePanel: externalActivePanel,
  onPanelChange,
  encounterId,
  gridConfig,
  encounterWalls,
  selectedWallIndex,
  isEditingVertices,
  originalWallPoles,
  onWallSelect,
  onWallDelete,
  onPlaceWall,
  onEditVertices,
  onCancelEditing,
  encounterRegions,
  selectedRegionIndex,
  onRegionSelect,
  onRegionDelete,
  onPlaceRegion,
  onBucketFillRegion,
  regionPlacementMode,
  onEditRegionVertices,
  placedAssets = [],
  selectedAssetIds = [],
  onAssetSelectForPlacement,
  onAssetPlaceWithSettings,
  onPlacedAssetSelect,
  onPlacedAssetDelete,
  onPlacedAssetRename,
  onPlacedAssetUpdate,
  encounterLightSources,
  encounterSoundSources,
  selectedLightSourceIndex,
  selectedSoundSourceIndex,
  onLightSourceSelect,
  onSoundSourceSelect,
  onPlaceLight,
  onPlaceSound,
  onFogHideAll,
  onFogRevealAll,
  onFogModeChange,
  onFogDrawPolygon,
  onFogBucketFill,
  fogMode,
}) => {
  const theme = useTheme();
  const [internalActivePanel, setInternalActivePanel] = useState<PanelType | null>(null);
  const [isPanelLocked, setIsPanelLocked] = useState(false);
  const [isPanelVisible, setIsPanelVisible] = useState(false);
  const [assetPickerOpen, setAssetPickerOpen] = useState<{
    open: boolean;
    kind?: AssetKind;
  }>({ open: false });
  const toolbarRef = useRef<HTMLDivElement>(null);
  const drawerRef = useRef<HTMLDivElement>(null);
  const hideTimeoutRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  const activePanel =
    externalActivePanel !== undefined ? (externalActivePanel as PanelType | null) : internalActivePanel;
  const expanded = isPanelVisible && activePanel !== null;

  const cancelHideTimeout = useCallback(() => {
    if (hideTimeoutRef.current) {
      clearTimeout(hideTimeoutRef.current);
      hideTimeoutRef.current = null;
    }
  }, []);

  const scheduleHide = useCallback(() => {
    cancelHideTimeout();
    hideTimeoutRef.current = setTimeout(() => {
      setIsPanelVisible(false);
    }, 150);
  }, [cancelHideTimeout]);

  useEffect(() => {
    return () => cancelHideTimeout();
  }, [cancelHideTimeout]);

  const handlePanelClick = (panel: PanelType) => {
    const isSameScope = activeScope === panel;

    if (isSameScope) {
      onScopeChange?.(null);

      if (!isPanelLocked) {
        setIsPanelVisible(false);
        const newPanel = null;
        if (externalActivePanel !== undefined) {
          onPanelChange?.(newPanel);
        } else {
          setInternalActivePanel(newPanel);
          onPanelChange?.(newPanel);
        }
      }
    } else {
      onScopeChange?.(panel as InteractionScope);
      setIsPanelVisible(true);

      if (externalActivePanel !== undefined) {
        onPanelChange?.(panel);
      } else {
        setInternalActivePanel(panel);
        onPanelChange?.(panel);
      }
    }
  };

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (!expanded || isPanelLocked) return;

      const target = event.target as Node;
      const targetElement = target as Element;
      const isInsideToolbar = toolbarRef.current?.contains(target);
      const isInsideDrawer = drawerRef.current?.contains(target);

      const isInsideDialog = targetElement.closest?.('[role="dialog"]') !== null;
      const isInsideMenu = targetElement.closest?.('.MuiMenu-root, .MuiPopover-paper') !== null;

      if (!isInsideToolbar && !isInsideDrawer && !isInsideDialog && !isInsideMenu) {
        setIsPanelVisible(false);

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
  }, [expanded, isPanelLocked, activePanel, selectedWallIndex, onWallSelect, selectedRegionIndex, onRegionSelect]);

  const panelConfigs: Array<{
    key: PanelType;
    icon: typeof GridIcon;
    label: string;
  }> = [
    { key: 'walls', icon: WallsIcon, label: 'Walls & Openings' },
    { key: 'regions', icon: RegionsIcon, label: 'Regions' },
    { key: 'objects', icon: ObjectsIcon, label: 'Objects' },
    { key: 'monsters', icon: MonstersIcon, label: 'Monsters' },
    { key: 'characters', icon: CharactersIcon, label: 'Characters' },
    { key: 'lights', icon: LightsIcon, label: 'Lights' },
    { key: 'sounds', icon: SoundsIcon, label: 'Sounds' },
    { key: 'fogOfWar', icon: FogOfWarIcon, label: 'Fog of War' },
  ];

  return (
    <>
      <Box
        ref={toolbarRef}
        onMouseEnter={() => {
          cancelHideTimeout();
          if (activeScope && !isPanelVisible) {
            setIsPanelVisible(true);
          }
        }}
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
          overflowX: 'hidden',
        }}
      >
        <Tooltip
          title={isPanelLocked ? 'Panel Locked - Click to unlock' : 'Panel Unlocked - Click to lock'}
          placement='right'
        >
          <IconButton
            size='small'
            onClick={() => setIsPanelLocked(!isPanelLocked)}
            sx={{
              width: 28,
              height: 28,
              borderRadius: 0,
              mx: 'auto',
              flexShrink: 0,
              mb: 1,
              borderBottom: `1px solid ${theme.palette.divider}`,
              backgroundColor: 'transparent',
              '&:hover': {
                backgroundColor: theme.palette.action.hover,
              },
            }}
          >
            {isPanelLocked ? <LockIcon sx={{ fontSize: 18 }} /> : <LockOpenIcon sx={{ fontSize: 18 }} />}
          </IconButton>
        </Tooltip>

        {panelConfigs.map(({ key, icon: Icon, label }) => {
          const isActive = activeScope === key;
          return (
            <Tooltip key={key} title={`${label}${isActive ? ' (Active)' : ''}`} placement='right'>
              <IconButton
                size='small'
                onClick={() => handlePanelClick(key)}
                sx={{
                  width: 28,
                  height: 28,
                  borderRadius: 1,
                  mx: 'auto',
                  flexShrink: 0,
                  position: 'relative',
                  backgroundColor: isActive ? theme.palette.primary.main : 'transparent',
                  color: isActive ? theme.palette.primary.contrastText : theme.palette.text.primary,
                  border: isActive ? `2px solid ${theme.palette.primary.light}` : '2px solid transparent',
                  '&:hover': {
                    backgroundColor: isActive ? theme.palette.primary.dark : theme.palette.action.hover,
                  },
                  '&::after': isActive
                    ? {
                        content: '""',
                        position: 'absolute',
                        right: -2,
                        top: '50%',
                        transform: 'translateY(-50%)',
                        width: 3,
                        height: 16,
                        backgroundColor: theme.palette.primary.light,
                        borderRadius: '0 2px 2px 0',
                      }
                    : {},
                }}
              >
                <Icon sx={{ fontSize: 18 }} />
              </IconButton>
            </Tooltip>
          );
        })}
      </Box>

      <Drawer
        variant='persistent'
        anchor='left'
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
            zIndex: 999,
          },
        }}
      >
        <Box
          ref={drawerRef}
          sx={{ p: 2 }}
          onMouseEnter={cancelHideTimeout}
          onMouseLeave={() => {
            if (!isPanelLocked) {
              scheduleHide();
            }
          }}
        >
          {activeScope === null && isPanelLocked && (
            <Box sx={{ textAlign: 'center', py: 4 }}>
              <Typography variant="body2" color="text.secondary">
                Select a scope to start working.
              </Typography>
            </Box>
          )}
          {activePanel === 'regions' && (
            <RegionsPanel
              encounterId={encounterId || ''}
              encounterRegions={encounterRegions || []}
              selectedRegionIndex={selectedRegionIndex !== undefined ? selectedRegionIndex : null}
              {...(onPlaceRegion ? { onPlaceRegion } : {})}
              {...(onBucketFillRegion ? { onBucketFillRegion } : {})}
              {...(regionPlacementMode !== undefined ? { placementMode: regionPlacementMode } : {})}
              {...(onRegionSelect ? { onRegionSelect } : {})}
              {...(onRegionDelete ? { onRegionDelete } : {})}
              {...(onEditRegionVertices ? { onEditVertices: onEditRegionVertices } : {})}
            />
          )}
          {activePanel === 'walls' && (
            <WallsPanel
              encounterId={encounterId || ''}
              encounterWalls={encounterWalls || []}
              selectedWallIndex={selectedWallIndex !== undefined ? selectedWallIndex : null}
              isEditingVertices={isEditingVertices || false}
              originalWallPoles={originalWallPoles || null}
              {...(onWallSelect ? { onWallSelect } : {})}
              {...(onWallDelete ? { onWallDelete } : {})}
              {...(onPlaceWall ? { onPlaceWall } : {})}
              {...(onEditVertices ? { onEditVertices } : {})}
              {...(onCancelEditing ? { onCancelEditing } : {})}
            />
          )}
          {activePanel === 'objects' && (
            <ObjectsPanel
              placedAssets={placedAssets}
              selectedAssetIds={selectedAssetIds}
              onBrowseAssets={() => setAssetPickerOpen({ open: true, kind: AssetKind.Object })}
              {...(gridConfig ? { gridConfig } : {})}
              {...(onPlacedAssetSelect ? { onAssetSelect: onPlacedAssetSelect } : {})}
              {...(onPlacedAssetDelete ? { onAssetDelete: onPlacedAssetDelete } : {})}
              {...(onPlacedAssetRename ? { onAssetRename: onPlacedAssetRename } : {})}
              {...(onPlacedAssetUpdate ? { onAssetUpdate: onPlacedAssetUpdate } : {})}
            />
          )}
          {activePanel === 'monsters' && (
            <MonstersPanel
              placedAssets={placedAssets}
              selectedAssetIds={selectedAssetIds}
              onBrowseAssets={() => setAssetPickerOpen({ open: true, kind: AssetKind.Creature })}
              {...(gridConfig ? { gridConfig } : {})}
              {...(onPlacedAssetSelect ? { onAssetSelect: onPlacedAssetSelect } : {})}
              {...(onPlacedAssetDelete ? { onAssetDelete: onPlacedAssetDelete } : {})}
              {...(onPlacedAssetRename ? { onAssetRename: onPlacedAssetRename } : {})}
              {...(onPlacedAssetUpdate ? { onAssetUpdate: onPlacedAssetUpdate } : {})}
            />
          )}
          {activePanel === 'characters' && (
            <CharactersPanel
              placedAssets={placedAssets}
              selectedAssetIds={selectedAssetIds}
              onBrowseAssets={() => setAssetPickerOpen({ open: true, kind: AssetKind.Character })}
              {...(gridConfig ? { gridConfig } : {})}
              {...(onPlacedAssetSelect ? { onAssetSelect: onPlacedAssetSelect } : {})}
              {...(onPlacedAssetDelete ? { onAssetDelete: onPlacedAssetDelete } : {})}
              {...(onPlacedAssetRename ? { onAssetRename: onPlacedAssetRename } : {})}
              {...(onPlacedAssetUpdate ? { onAssetUpdate: onPlacedAssetUpdate } : {})}
            />
          )}
          {activePanel === 'lights' && (
            <LightsPanel
              encounterId={encounterId || ''}
              lightSources={encounterLightSources || []}
              selectedSourceIndex={selectedLightSourceIndex ?? null}
              onSourceSelect={onLightSourceSelect || (() => {})}
              onPlaceLight={onPlaceLight || (() => {})}
            />
          )}
          {activePanel === 'sounds' && (
            <SoundsPanel
              encounterId={encounterId || ''}
              soundSources={encounterSoundSources || []}
              selectedSourceIndex={selectedSoundSourceIndex ?? null}
              onSourceSelect={onSoundSourceSelect || (() => {})}
              onPlaceSound={onPlaceSound || (() => {})}
            />
          )}
          {activePanel === 'fogOfWar' && (
            <FogOfWarPanel
              onHideAll={onFogHideAll || (() => {})}
              onRevealAll={onFogRevealAll || (() => {})}
              onModeChange={onFogModeChange || (() => {})}
              onDrawPolygon={onFogDrawPolygon || (() => {})}
              onBucketFill={onFogBucketFill || (() => {})}
              currentMode={fogMode || 'add'}
            />
          )}
        </Box>
      </Drawer>

      {assetPickerOpen.kind && (
        <QuickSummonDialog
          open={assetPickerOpen.open}
          onClose={() => setAssetPickerOpen({ open: false })}
          onPlace={(asset, settings, tokenIndex) => {
            setAssetPickerOpen({ open: false });
            if (onAssetPlaceWithSettings) {
              onAssetPlaceWithSettings(asset, settings, tokenIndex);
            } else {
              onAssetSelectForPlacement?.(asset);
            }
          }}
          kind={assetPickerOpen.kind}
          title={
            assetPickerOpen.kind === AssetKind.Creature
              ? 'Place Creature'
              : assetPickerOpen.kind === AssetKind.Character
                ? 'Place Character'
                : assetPickerOpen.kind === AssetKind.Object
                  ? 'Place Object'
                  : 'Place Asset'
          }
        />
      )}
    </>
  );
};
