import { DisplayName, LabelPosition, PlacedAsset, Scene } from '../types/domain';

export const getEffectiveDisplayName = (
    asset: PlacedAsset,
    scene: Scene
): DisplayName => {
    if (asset.displayName !== DisplayName.Default) {
        return asset.displayName;
    }

    if (asset.asset.kind === 'Creature') {
        return scene.defaultDisplayName;
    }

    return DisplayName.OnHover;
};

export const getEffectiveLabelPosition = (
    asset: PlacedAsset,
    scene: Scene
): LabelPosition => {
    return asset.labelPosition === LabelPosition.Default
        ? scene.defaultLabelPosition
        : asset.labelPosition;
};
