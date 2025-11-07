import { DisplayName, LabelPosition, PlacedAsset, Scene } from '../types/domain';

export const getEffectiveDisplayName = (
    asset: PlacedAsset,
    _scene: Scene
): DisplayName => {
    if (asset.displayName !== DisplayName.Default) {
        return asset.displayName;
    }

    if (asset.asset.kind === 'Creature') {
        return DisplayName.Always;
    }

    return DisplayName.OnHover;
};

export const getEffectiveLabelPosition = (
    asset: PlacedAsset,
    _scene: Scene
): LabelPosition => {
    return asset.labelPosition === LabelPosition.Default
        ? LabelPosition.Bottom
        : asset.labelPosition;
};
