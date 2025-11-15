import { LabelPosition, LabelVisibility, type PlacedAsset } from '../types/domain';

export const getEffectiveLabelVisibility = (asset: PlacedAsset): LabelVisibility => {
  if (asset.labelVisibility !== LabelVisibility.Default) {
    return asset.labelVisibility;
  }

  if (asset.asset.kind === 'Monster') {
    return LabelVisibility.Always;
  }

  if (asset.asset.kind === 'Character') {
    return LabelVisibility.Always;
  }

  return LabelVisibility.OnHover;
};

export const getEffectiveLabelPosition = (asset: PlacedAsset): LabelPosition => {
  return asset.labelPosition === LabelPosition.Default ? LabelPosition.Bottom : asset.labelPosition;
};
