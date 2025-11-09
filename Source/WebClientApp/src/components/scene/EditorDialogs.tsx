import React from 'react';
import { Alert, Snackbar } from '@mui/material';
import { AssetContextMenu, WallContextMenu } from '@components/scene';
import { ConfirmDialog } from '@components/common';
import type { PlacedAsset, SceneWall } from '@/types/domain';

interface EditorDialogsProps {
    deleteConfirmOpen: boolean;
    assetsToDelete: PlacedAsset[];
    onDeleteConfirmClose: () => void;
    onDeleteConfirm: () => void;
    assetContextMenuPosition: { x: number; y: number } | null;
    assetContextMenuAsset: PlacedAsset | null;
    onAssetContextMenuClose: () => void;
    onAssetRename: (assetId: string, newName: string) => void;
    onAssetDisplayUpdate: (assetId: string, displayName: string, labelPosition: string) => void;
    wallContextMenuPosition: { x: number; y: number } | null;
    wallContextMenuWall: SceneWall | null;
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
    onErrorMessageClose
}) => {
    return (
        <>
            {deleteConfirmOpen && (
                <ConfirmDialog
                    open={deleteConfirmOpen}
                    onClose={onDeleteConfirmClose}
                    onConfirm={onDeleteConfirm}
                    title="Delete Assets"
                    message={`Delete ${assetsToDelete.length} asset${assetsToDelete.length === 1 ? '' : 's'}?`}
                    confirmText="Delete"
                    severity="error"
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
                sceneWall={wallContextMenuWall}
                onEditVertices={onWallEditVertices}
                onDelete={onWallDelete}
            />

            <Snackbar
                open={!!errorMessage}
                autoHideDuration={6000}
                onClose={onErrorMessageClose}
                anchorOrigin={{ vertical: 'bottom', horizontal: 'center' }}
            >
                <Alert onClose={onErrorMessageClose} severity="error" sx={{ width: '100%' }}>
                    {errorMessage}
                </Alert>
            </Snackbar>
        </>
    );
};
