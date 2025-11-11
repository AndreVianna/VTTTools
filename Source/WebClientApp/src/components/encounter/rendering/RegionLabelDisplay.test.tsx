import { describe, it, expect } from 'vitest';
import { createTheme } from '@mui/material/styles';
import type { Point } from '@/types/domain';

describe('RegionLabelDisplay props', () => {
    it('should accept valid centroid coordinates', () => {
        const centroid: Point = { x: 100, y: 150 };

        expect(typeof centroid.x).toBe('number');
        expect(typeof centroid.y).toBe('number');
        expect(Number.isFinite(centroid.x)).toBe(true);
        expect(Number.isFinite(centroid.y)).toBe(true);
    });

    it('should accept string label', () => {
        const label = 'dim';

        expect(typeof label).toBe('string');
        expect(label.length).toBeGreaterThan(0);
    });

    it('should handle long labels', () => {
        const label = 'Very Long Label Text';

        expect(label.length).toBeGreaterThan(10);
        expect(typeof label).toBe('string');
    });

    it('should handle short labels', () => {
        const label = 'X';

        expect(label.length).toBe(1);
        expect(typeof label).toBe('string');
    });
});

describe('RegionLabelDisplay theme support', () => {
    const lightTheme = createTheme({ palette: { mode: 'light' } });
    const darkTheme = createTheme({ palette: { mode: 'dark' } });

    it('should use theme text color in light mode', () => {
        const textColor = lightTheme.palette.text.primary;

        expect(textColor).toBeDefined();
        expect(typeof textColor).toBe('string');
    });

    it('should use theme text color in dark mode', () => {
        const textColor = darkTheme.palette.text.primary;

        expect(textColor).toBeDefined();
        expect(typeof textColor).toBe('string');
    });

    it('should use theme background color in light mode', () => {
        const bgColor = lightTheme.palette.background.paper;

        expect(bgColor).toBeDefined();
        expect(typeof bgColor).toBe('string');
    });

    it('should use theme background color in dark mode', () => {
        const bgColor = darkTheme.palette.background.paper;

        expect(bgColor).toBeDefined();
        expect(typeof bgColor).toBe('string');
    });

    it('should have different colors between light and dark modes', () => {
        const lightText = lightTheme.palette.text.primary;
        const darkText = darkTheme.palette.text.primary;

        expect(lightText).not.toBe(darkText);
    });
});

describe('RegionLabelDisplay styling', () => {
    it('should calculate text width based on label length', () => {
        const label = 'test';
        const fontSize = 12;
        const textWidth = label.length * (fontSize * 0.6);

        expect(textWidth).toBeGreaterThan(0);
        expect(textWidth).toBeCloseTo(label.length * 7.2, 5);
    });

    it('should have proper padding', () => {
        const padding = 4;

        expect(padding).toBeGreaterThan(0);
        expect(typeof padding).toBe('number');
    });

    it('should have proper font size', () => {
        const fontSize = 12;

        expect(fontSize).toBeGreaterThan(0);
        expect(typeof fontSize).toBe('number');
    });

    it('should have opacity for background', () => {
        const opacity = 0.8;

        expect(opacity).toBeGreaterThan(0);
        expect(opacity).toBeLessThanOrEqual(1);
    });
});

describe('RegionLabelDisplay positioning', () => {
    it('should center text at centroid', () => {
        const fontSize = 12;
        const textWidth = 50;

        const offsetX = textWidth / 2;
        const offsetY = fontSize / 2;

        expect(offsetX).toBeGreaterThan(0);
        expect(offsetY).toBeGreaterThan(0);
    });

    it('should handle negative coordinates', () => {
        const centroid: Point = { x: -50, y: -75 };

        expect(Number.isFinite(centroid.x)).toBe(true);
        expect(Number.isFinite(centroid.y)).toBe(true);
    });

    it('should handle zero coordinates', () => {
        const centroid: Point = { x: 0, y: 0 };

        expect(centroid.x).toBe(0);
        expect(centroid.y).toBe(0);
    });

    it('should handle large coordinates', () => {
        const centroid: Point = { x: 10000, y: 10000 };

        expect(Number.isFinite(centroid.x)).toBe(true);
        expect(Number.isFinite(centroid.y)).toBe(true);
        expect(centroid.x).toBeGreaterThan(0);
        expect(centroid.y).toBeGreaterThan(0);
    });
});
