import type { LabelPosition, LabelVisibility, PlacedAsset, PlacedAssetSnapshot } from '@/types/domain';

export interface Command {
  execute: () => void | Promise<void>;
  undo: () => void | Promise<void>;
  description: string;
}

export interface PlaceAssetCommandParams {
  asset: PlacedAsset;
  onPlace: (asset: PlacedAsset) => void;
  onRemove: (assetId: string) => void;
}

export const createPlaceAssetCommand = (params: PlaceAssetCommandParams): Command => {
  const { asset, onPlace, onRemove } = params;

  return {
    description: `Place ${asset.asset.name}`,
    execute: () => {
      onPlace(asset);
    },
    undo: () => {
      onRemove(asset.id);
    },
  };
};

export interface MoveAssetCommandParams {
  assetId: string;
  oldPosition: { x: number; y: number };
  newPosition: { x: number; y: number };
  onMove: (assetId: string, position: { x: number; y: number }) => void;
}

export const createMoveAssetCommand = (params: MoveAssetCommandParams): Command => {
  const { assetId, oldPosition, newPosition, onMove } = params;

  return {
    description: 'Move asset',
    execute: () => {
      onMove(assetId, { ...newPosition });
    },
    undo: () => {
      onMove(assetId, { ...oldPosition });
    },
  };
};

export interface RemoveAssetCommandParams {
  asset: PlacedAsset;
  onPlace: (asset: PlacedAsset) => void;
  onRemove: (assetId: string) => void;
}

export const createRemoveAssetCommand = (params: RemoveAssetCommandParams): Command => {
  const { asset, onPlace, onRemove } = params;

  return {
    description: `Remove ${asset.asset.name}`,
    execute: () => {
      onRemove(asset.id);
    },
    undo: () => {
      onPlace(asset);
    },
  };
};

export interface ResizeAssetCommandParams {
  assetId: string;
  oldSize: { width: number; height: number };
  newSize: { width: number; height: number };
  onResize: (assetId: string, size: { width: number; height: number }) => void;
}

export const createResizeAssetCommand = (params: ResizeAssetCommandParams): Command => {
  const { assetId, oldSize, newSize, onResize } = params;

  return {
    description: 'Resize asset',
    execute: () => {
      onResize(assetId, { ...newSize });
    },
    undo: () => {
      onResize(assetId, { ...oldSize });
    },
  };
};

export interface RotateAssetCommandParams {
  assetId: string;
  oldRotation: number;
  newRotation: number;
  onRotate: (assetId: string, rotation: number) => void;
}

export const createRotateAssetCommand = (params: RotateAssetCommandParams): Command => {
  const { assetId, oldRotation, newRotation, onRotate } = params;

  return {
    description: 'Rotate asset',
    execute: () => {
      onRotate(assetId, newRotation);
    },
    undo: () => {
      onRotate(assetId, oldRotation);
    },
  };
};

export interface BatchCommandParams {
  commands: Command[];
}

export const createBatchCommand = (params: BatchCommandParams): Command => {
  const { commands } = params;

  return {
    description: `Batch (${commands.length} operations)`,
    execute: async () => {
      for (const cmd of commands) {
        const result = cmd.execute();
        if (result instanceof Promise) {
          await result;
        }
      }
    },
    undo: async () => {
      for (const cmd of [...commands].reverse()) {
        const result = cmd.undo();
        if (result instanceof Promise) {
          await result;
        }
      }
    },
  };
};

export interface UpdateAssetCommandParams {
  assetId: string;
  beforeSnapshot: PlacedAssetSnapshot;
  afterSnapshot: PlacedAssetSnapshot;
  onUpdate: (assetId: string, snapshot: PlacedAssetSnapshot) => void;
}

export const createUpdateAssetCommand = (params: UpdateAssetCommandParams): Command => {
  const { assetId, beforeSnapshot, afterSnapshot, onUpdate } = params;

  return {
    description: 'Update asset',
    execute: () => {
      onUpdate(assetId, afterSnapshot);
    },
    undo: () => {
      onUpdate(assetId, beforeSnapshot);
    },
  };
};

export interface TransformAssetCommandParams {
  assetIds: string[];
  beforeSnapshots: Map<string, PlacedAssetSnapshot>;
  afterSnapshots: Map<string, PlacedAssetSnapshot>;
  onUpdate: (assetId: string, snapshot: PlacedAssetSnapshot) => void;
}

export const createTransformAssetCommand = (params: TransformAssetCommandParams): Command => {
  const { assetIds, beforeSnapshots, afterSnapshots, onUpdate } = params;

  return {
    description: `Transform (${assetIds.length} assets)`,
    execute: () => {
      assetIds.forEach((id) => {
        const snapshot = afterSnapshots.get(id);
        if (snapshot) {
          onUpdate(id, snapshot);
        }
      });
    },
    undo: () => {
      assetIds.forEach((id) => {
        const snapshot = beforeSnapshots.get(id);
        if (snapshot) {
          onUpdate(id, snapshot);
        }
      });
    },
  };
};

export interface BulkRemoveAssetsCommandParams {
  assets: PlacedAsset[];
  onBulkRemove: (assetIds: string[]) => void;
  onBulkRestore: (assets: PlacedAsset[]) => void;
}

export const createBulkRemoveAssetsCommand = (params: BulkRemoveAssetsCommandParams): Command => {
  const { assets, onBulkRemove, onBulkRestore } = params;

  return {
    description: `Delete (${assets.length} asset${assets.length === 1 ? '' : 's'})`,
    execute: () => {
      onBulkRemove(assets.map((a) => a.id));
    },
    undo: () => {
      onBulkRestore(assets);
    },
  };
};

export interface CopyAssetsCommandParams {
  assets: PlacedAsset[];
  onCopy: (assets: PlacedAsset[]) => void;
}

export const createCopyAssetsCommand = (params: CopyAssetsCommandParams): Command => {
  const { assets, onCopy } = params;

  return {
    description: `Copy (${assets.length} asset${assets.length === 1 ? '' : 's'})`,
    execute: () => {
      onCopy(assets);
    },
    undo: () => {},
  };
};

export interface CutAssetsCommandParams {
  assets: PlacedAsset[];
  onCut: (assets: PlacedAsset[]) => Promise<void>;
  onRestore: (assets: PlacedAsset[]) => Promise<void>;
}

export const createCutAssetsCommand = (params: CutAssetsCommandParams): Command => {
  const { assets, onCut, onRestore } = params;

  return {
    description: `Cut (${assets.length} asset${assets.length === 1 ? '' : 's'})`,
    execute: () => {
      onCut(assets);
    },
    undo: () => {
      onRestore(assets);
    },
  };
};

export interface PasteAssetsCommandParams {
  clipboardAssets: PlacedAsset[];
  onPaste: (assets: PlacedAsset[]) => Promise<PlacedAsset[]>;
  onUndo: (assetIds: string[]) => Promise<void>;
}

export const createPasteAssetsCommand = (params: PasteAssetsCommandParams): Command => {
  const { clipboardAssets, onPaste, onUndo } = params;
  let pastedAssetIds: string[] = [];
  let pastePromise: Promise<PlacedAsset[]> | null = null;

  return {
    description: `Paste (${clipboardAssets.length} asset${clipboardAssets.length === 1 ? '' : 's'})`,
    execute: () => {
      pastePromise = onPaste(clipboardAssets);
      pastePromise.then((pastedAssets) => {
        pastedAssetIds = pastedAssets.map((a) => a.id);
      });
    },
    undo: async () => {
      if (pastePromise) {
        await pastePromise;
      }
      await onUndo(pastedAssetIds);
    },
  };
};

export interface RenameAssetCommandParams {
  assetId: string;
  oldName: string;
  newName: string;
  onRename: (assetId: string, name: string) => Promise<void>;
}

export const createRenameAssetCommand = (params: RenameAssetCommandParams): Command => {
  const { assetId, oldName, newName, onRename } = params;

  return {
    description: `Rename "${oldName}" to "${newName}"`,
    execute: async () => {
      await onRename(assetId, newName);
    },
    undo: async () => {
      await onRename(assetId, oldName);
    },
  };
};

export interface UpdateAssetDisplayCommandParams {
  assetId: string;
  oldDisplay: { labelVisibility?: LabelVisibility; labelPosition?: LabelPosition };
  newDisplay: { labelVisibility?: LabelVisibility; labelPosition?: LabelPosition };
  onUpdate: (assetId: string, labelVisibility?: LabelVisibility, labelPosition?: LabelPosition) => Promise<void>;
}

export const createUpdateAssetDisplayCommand = (params: UpdateAssetDisplayCommandParams): Command => {
  const { assetId, oldDisplay: oldLabel, newDisplay: newLabel, onUpdate } = params;

  return {
    description: 'Update display settings',
    execute: async () => {
      await onUpdate(assetId, newLabel.labelVisibility, newLabel.labelPosition);
    },
    undo: async () => {
      await onUpdate(assetId, oldLabel.labelVisibility, oldLabel.labelPosition);
    },
  };
};
