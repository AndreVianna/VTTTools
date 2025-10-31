import { describe, it, expect } from 'vitest';
import { WallDrawingTool } from './WallDrawingTool';

describe('WallDrawingTool', () => {
    it('has correct display name', () => {
        expect(WallDrawingTool.displayName).toBe('WallDrawingTool');
    });

    it('component is defined and exports correctly', () => {
        expect(WallDrawingTool).toBeDefined();
        expect(typeof WallDrawingTool).toBe('function');
    });
});
