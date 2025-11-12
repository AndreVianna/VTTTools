import { ConfirmDialog } from '@components/common';
import { AssetContextMenu, WallContextMenu } from '@components/encounter';
import { Alert, Snackbar } from '@mui/material';
import type React from 'react';
import type { EncounterWall, LabelPosition, LabelVisibility, PlacedAsset } from '@/types/domain';

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
  onWallContextMenuClose: () => void;
  onWallEditVertices: (wallIndex: number) => void;
  onWallDelete: (wallIndex: number) => void;
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
  onWallContextMenuClose,
  onWallEditVertices,
  onWallDelete,
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
        onEditVertices={onWallEditVertices}
        onDelete={onWallDelete}
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
