import { describe, it, expect } from 'vitest';
import type {
    EncounterRegion,
    PlacedRegion,
    Point,
} from '../domain';
import { RegionType } from '../domain';

describe('Region Types', () => {
    it('should allow valid EncounterRegion object', () => {
        const vertices: Point[] = [
            { x: 0, y: 0 },
            { x: 10, y: 0 },
            { x: 10, y: 10 },
        ];

        const encounterRegion: EncounterRegion = {
            index: 0,
            type: RegionType.Terrain,
            vertices,
            value: 1,
        };
        expect(encounterRegion.vertices).toHaveLength(3);
        expect(encounterRegion.value).toBe(1);
    });

    it('should allow EncounterRegion with optional properties', () => {
        const encounterRegion: EncounterRegion = {
            index: 1,
            type: RegionType.Illumination,
            vertices: [
                { x: 0, y: 0 },
                { x: 50, y: 0 },
                { x: 25, y: 50 },
            ],
            name: 'Light Zone',
            label: 'Bright',
            color: '#ffff00',
        };
        expect(encounterRegion.name).toBe('Light Zone');
        expect(encounterRegion.label).toBe('Bright');
        expect(encounterRegion.color).toBe('#ffff00');
    });

    it('should allow PlacedRegion extending EncounterRegion', () => {
        const placedRegion: PlacedRegion = {
            id: 'region-123',
            index: 2,
            type: RegionType.FogOfWar,
            vertices: [
                { x: 0, y: 0 },
                { x: 100, y: 0 },
                { x: 100, y: 100 },
                { x: 0, y: 100 },
            ],
        };
        expect(placedRegion.id).toBe('region-123');
        expect(placedRegion.index).toBe(2);
        expect(placedRegion.vertices).toHaveLength(4);
    });

    it('should support all RegionType enum values', () => {
        expect(RegionType.Elevation).toBe('Elevation');
        expect(RegionType.Terrain).toBe('Terrain');
        expect(RegionType.Illumination).toBe('Illumination');
        expect(RegionType.FogOfWar).toBe('FogOfWar');
    });

    it('should allow EncounterRegion with backward compat encounterId', () => {
        const region: EncounterRegion = {
            encounterId: 'enc-123', // Optional for backwards compat
            index: 0,
            type: RegionType.Terrain,
            vertices: [{ x: 0, y: 0 }],
        };
        expect(region.encounterId).toBe('enc-123');
    });
});
