import { ConfirmDialog } from '@components/common';
import { AssetContextMenu, RegionContextMenu, WallContextMenu } from '@components/encounter';
import { Alert, Snackbar } from '@mui/material';
import type React from 'react';
import type {
  EncounterRegion,
  EncounterWall,
  EncounterWallSegment,
  LabelPosition,
  LabelVisibility,
  PlacedAsset,
} from '@/types/domain';

interface EditorDialogsProps {
  deleteConfirmOpen: boolean;
  assetsToDelete: PlacedAsset[];
  onDeleteConfirmClose: () => void;
  onDeleteConfirm: () => void;
  assetContextMenuPosition: { left: number; top: number } | null;
  assetContextMenuAsset: PlacedAsset | null;
  onAssetContextMenuClose: () => void;
  onAssetRename: (assetId: string, newName: string) => Promise<void>;
  onAssetDisplayUpdate: (
    assetId: string,
    displayName?: LabelVisibility,
    labelPosition?: LabelPosition,
  ) => Promise<void>;
  wallContextMenuPosition: { left: number; top: number } | null;
  wallContextMenuWall: EncounterWall | null;
  wallContextMenuSegmentIndex: number | null;
  onWallContextMenuClose: () => void;
  onWallSegmentUpdate: (wallIndex: number, segmentIndex: number, updates: Partial<EncounterWallSegment>) => void;
  regionContextMenuPosition: { left: number; top: number } | null;
  regionContextMenuRegion: EncounterRegion | null;
  onRegionContextMenuClose: () => void;
  onRegionUpdate: (regionIndex: number, updates: Partial<EncounterRegion>) => void;
  errorMessage: string | null;
  onErrorMessageClose: () => void;
}

export const EditorDialogs: React.FC<EditorDialogsProps> = ({
  deleteConfirmOpen,
  assetsToDelete,
  onDeleteConfirmClose,
  onDeleteConfirm,
  assetContextMenuPosition,
  assetContextMenuAsset,
  onAssetContextMenuClose,
  onAssetRename,
  onAssetDisplayUpdate,
  wallContextMenuPosition,
  wallContextMenuWall,
  wallContextMenuSegmentIndex,
  onWallContextMenuClose,
  onWallSegmentUpdate,
  regionContextMenuPosition,
  regionContextMenuRegion,
  onRegionContextMenuClose,
  onRegionUpdate,
  errorMessage,
  onErrorMessageClose,
}) => {
  return (
    <>
      {deleteConfirmOpen && (
        <ConfirmDialog
          open={deleteConfirmOpen}
          onClose={onDeleteConfirmClose}
          onConfirm={onDeleteConfirm}
          title='Delete Assets'
          message={`Delete ${assetsToDelete.length} asset${assetsToDelete.length === 1 ? '' : 's'}?`}
          confirmText='Delete'
          severity='error'
        />
      )}

      <AssetContextMenu
        anchorPosition={assetContextMenuPosition}
        open={assetContextMenuPosition !== null}
        onClose={onAssetContextMenuClose}
        asset={assetContextMenuAsset}
        onRename={onAssetRename}
        onUpdateDisplay={onAssetDisplayUpdate}
      />

      <WallContextMenu
        anchorPosition={wallContextMenuPosition}
        open={wallContextMenuPosition !== null}
        onClose={onWallContextMenuClose}
        encounterWall={wallContextMenuWall}
        segmentIndex={wallContextMenuSegmentIndex}
        onSegmentUpdate={onWallSegmentUpdate}
      />

      <RegionContextMenu
        anchorPosition={regionContextMenuPosition}
        open={regionContextMenuPosition !== null}
        onClose={onRegionContextMenuClose}
        encounterRegion={regionContextMenuRegion}
        onRegionUpdate={onRegionUpdate}
      />

      <Snackbar
        open={!!errorMessage}
        autoHideDuration={6000}
        onClose={onErrorMessageClose}
        anchorOrigin={{ vertical: 'bottom', horizontal: 'center' }}
      >
        <Alert onClose={onErrorMessageClose} severity='error' sx={{ width: '100%' }}>
          {errorMessage}
        </Alert>
      </Snackbar>
    </>
  );
};
