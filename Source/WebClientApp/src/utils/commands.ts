import type { PlacedAsset, PlacedAssetSnapshot } from '@/types/domain';
import { applyAssetSnapshot } from '@/types/domain';

export interface Command {
    execute: () => void;
    undo: () => void;
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
        execute: () => {
            commands.forEach((cmd) => cmd.execute());
        },
        undo: () => {
            [...commands].reverse().forEach((cmd) => cmd.undo());
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
            assetIds.forEach(id => {
                const snapshot = afterSnapshots.get(id);
                if (snapshot) {
                    onUpdate(id, snapshot);
                }
            });
        },
        undo: () => {
            assetIds.forEach(id => {
                const snapshot = beforeSnapshots.get(id);
                if (snapshot) {
                    onUpdate(id, snapshot);
                }
            });
        },
    };
};
