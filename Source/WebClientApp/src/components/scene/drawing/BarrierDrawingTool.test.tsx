import { describe, it, expect } from 'vitest';
import { BarrierDrawingTool } from './BarrierDrawingTool';

describe('BarrierDrawingTool', () => {
    it('has correct display name', () => {
        expect(BarrierDrawingTool.displayName).toBe('BarrierDrawingTool');
    });

    it('component is defined and exports correctly', () => {
        expect(BarrierDrawingTool).toBeDefined();
        expect(typeof BarrierDrawingTool).toBe('function');
    });
});
