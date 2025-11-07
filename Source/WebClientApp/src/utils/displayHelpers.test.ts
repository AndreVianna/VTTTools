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

            expect(getEffectiveDisplayName(asset)).toBe(DisplayName.Never);
        });

        it('returns scene default for Creatures when asset is Default', () => {
            const asset = {
                displayName: DisplayName.Default,
                asset: { kind: 'Creature' },
            } as any;

            expect(getEffectiveDisplayName(asset)).toBe(DisplayName.OnHover);
        });

        it('returns OnHover for Objects when asset is Default (ignores scene default)', () => {
            const asset = {
                displayName: DisplayName.Default,
                asset: { kind: 'Object' },
            } as any;

            expect(getEffectiveDisplayName(asset)).toBe(DisplayName.OnHover);
        });

        it('returns asset override for Objects when not Default', () => {
            const asset = {
                displayName: DisplayName.Always,
                asset: { kind: 'Object' },
            } as any;

            expect(getEffectiveDisplayName(asset)).toBe(DisplayName.Always);
        });
    });

    describe('getEffectiveLabelPosition', () => {
        it('returns asset override when not Default', () => {
            const asset = { labelPosition: LabelPosition.Top } as any;

            expect(getEffectiveLabelPosition(asset)).toBe(LabelPosition.Top);
        });

        it('returns scene default when asset is Default', () => {
            const asset = { labelPosition: LabelPosition.Default } as any;

            expect(getEffectiveLabelPosition(asset)).toBe(LabelPosition.Middle);
        });
    });
});
