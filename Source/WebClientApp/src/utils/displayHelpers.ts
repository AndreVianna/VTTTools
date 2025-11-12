import { DisplayName, LabelPosition, type PlacedAsset } from '../types/domain';

export const getEffectiveDisplayName = (asset: PlacedAsset): DisplayName => {
  if (asset.displayName !== DisplayName.Default) {
    return asset.displayName;
  }

  if (asset.asset.kind === 'Creature') {
    return DisplayName.Always;
  }

  return DisplayName.OnHover;
};

export const getEffectiveLabelPosition = (asset: PlacedAsset): LabelPosition => {
  return asset.labelPosition === LabelPosition.Default ? LabelPosition.Bottom : asset.labelPosition;
};
