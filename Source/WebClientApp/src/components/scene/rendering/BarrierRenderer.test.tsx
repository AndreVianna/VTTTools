import { describe, it, expect } from 'vitest';
import { BarrierRenderer } from './BarrierRenderer';

describe('BarrierRenderer', () => {
    it('has correct display name', () => {
        expect(BarrierRenderer.displayName).toBe('BarrierRenderer');
    });

    it('component is defined and exports correctly', () => {
        expect(BarrierRenderer).toBeDefined();
        expect(typeof BarrierRenderer).toBe('function');
    });
});
