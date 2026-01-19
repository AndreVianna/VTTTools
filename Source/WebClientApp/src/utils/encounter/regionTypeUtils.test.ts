import { describe, expect, it } from 'vitest';
import { RegionType } from '@/types/domain';
import { castRegionsWithEncounterId, toRegionType } from './regionTypeUtils';

describe('toRegionType', () => {
    it('should return valid RegionType for valid string', () => {
        expect(toRegionType('Terrain')).toBe(RegionType.Terrain);
        expect(toRegionType('Elevation')).toBe(RegionType.Elevation);
        expect(toRegionType('Illumination')).toBe(RegionType.Illumination);
    });

    it('should return Terrain for invalid string', () => {
        expect(toRegionType('InvalidType')).toBe(RegionType.Terrain);
        expect(toRegionType('')).toBe(RegionType.Terrain);
    });
});

describe('castRegionsWithEncounterId', () => {
    it('should add encounterId to all regions', () => {
        const regions = [
            { index: 0, name: 'Region 1', type: RegionType.Terrain, vertices: [{ x: 0, y: 0 }] },
            { index: 1, name: 'Region 2', type: RegionType.Elevation, vertices: [{ x: 10, y: 10 }] },
        ];
        const result = castRegionsWithEncounterId(regions, 'encounter-123');
        expect(result).toHaveLength(2);
        expect(result[0]?.encounterId).toBe('encounter-123');
        expect(result[1]?.encounterId).toBe('encounter-123');
    });

    it('should preserve all original properties', () => {
        const regions = [
            { index: 0, name: 'Test', type: RegionType.Illumination, vertices: [{ x: 5, y: 5 }], value: 42 },
        ];
        const result = castRegionsWithEncounterId(regions, 'enc-456');
        expect(result[0]).toEqual({
            index: 0,
            name: 'Test',
            type: RegionType.Illumination,
            vertices: [{ x: 5, y: 5 }],
            value: 42,
            encounterId: 'enc-456',
        });
    });
});
