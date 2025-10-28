import { describe, it, expect } from 'vitest';
import { getEffectiveDisplayName, getEffectiveLabelPosition } from './displayHelpers';
import { DisplayName, LabelPosition } from '../types/domain';

describe('displayHelpers', () => {
    describe('getEffectiveDisplayName', () => {
        it('returns asset override when not Default', () => {
            const asset = {
                displayName: DisplayName.Never,
                asset: { kind: 'Creature' },
            } as any;
            const scene = { defaultDisplayName: DisplayName.Always } as any;

            expect(getEffectiveDisplayName(asset, scene)).toBe(DisplayName.Never);
        });

        it('returns scene default for Creatures when asset is Default', () => {
            const asset = {
                displayName: DisplayName.Default,
                asset: { kind: 'Creature' },
            } as any;
            const scene = { defaultDisplayName: DisplayName.OnHover } as any;

            expect(getEffectiveDisplayName(asset, scene)).toBe(DisplayName.OnHover);
        });

        it('returns OnHover for Objects when asset is Default (ignores scene default)', () => {
            const asset = {
                displayName: DisplayName.Default,
                asset: { kind: 'Object' },
            } as any;
            const scene = { defaultDisplayName: DisplayName.Always } as any;

            expect(getEffectiveDisplayName(asset, scene)).toBe(DisplayName.OnHover);
        });

        it('returns asset override for Objects when not Default', () => {
            const asset = {
                displayName: DisplayName.Always,
                asset: { kind: 'Object' },
            } as any;
            const scene = { defaultDisplayName: DisplayName.Never } as any;

            expect(getEffectiveDisplayName(asset, scene)).toBe(DisplayName.Always);
        });
    });

    describe('getEffectiveLabelPosition', () => {
        it('returns asset override when not Default', () => {
            const asset = { labelPosition: LabelPosition.Top } as any;
            const scene = { defaultLabelPosition: LabelPosition.Bottom } as any;

            expect(getEffectiveLabelPosition(asset, scene)).toBe(LabelPosition.Top);
        });

        it('returns scene default when asset is Default', () => {
            const asset = { labelPosition: LabelPosition.Default } as any;
            const scene = { defaultLabelPosition: LabelPosition.Middle } as any;

            expect(getEffectiveLabelPosition(asset, scene)).toBe(LabelPosition.Middle);
        });
    });
});
