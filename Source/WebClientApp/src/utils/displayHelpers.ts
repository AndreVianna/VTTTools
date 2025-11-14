import { LabelPosition, LabelVisibility, type PlacedAsset } from '../types/domain';

export const getEffectiveLabelVisibility = (asset: PlacedAsset): LabelVisibility => {
  console.log('[getEffectiveLabelVisibility] called', {
    assetId: asset.id,
    assetKind: asset.asset.kind,
    assetName: asset.name,
    labelVisibility: asset.labelVisibility,
  });

  if (asset.labelVisibility !== LabelVisibility.Default) {
    console.log('[getEffectiveLabelVisibility] Using asset-specific visibility:', asset.labelVisibility);
    return asset.labelVisibility;
  }

  if (asset.asset.kind === 'Monster') {
    console.log('[getEffectiveLabelVisibility] Monster default: Always');
    return LabelVisibility.Always;
  }

  if (asset.asset.kind === 'Character') {
    console.log('[getEffectiveLabelVisibility] Character default: Always');
    return LabelVisibility.Always;
  }

  console.log('[getEffectiveLabelVisibility] Object default: OnHover');
  return LabelVisibility.OnHover;
};

export const getEffectiveLabelPosition = (asset: PlacedAsset): LabelPosition => {
  return asset.labelPosition === LabelPosition.Default ? LabelPosition.Bottom : asset.labelPosition;
};
