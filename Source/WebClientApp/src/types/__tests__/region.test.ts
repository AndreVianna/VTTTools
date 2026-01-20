import { describe, it, expect } from 'vitest';
import type {
    EncounterRegion,
    Point
} from '../domain';
import { RegionType } from '../domain';
import type {
    StageRegion,
    StageRegionVertex,
    CreateRegionRequest,
    UpdateRegionRequest,
} from '../stage';

describe('Region Types', () => {
    describe('StageRegion', () => {
        it('should allow valid StageRegion object', () => {
            const region: StageRegion = {
                index: 0,
                name: 'Illumination Zone',
                type: RegionType.Illumination,
                vertices: [
                    { x: 0, y: 0 },
                    { x: 10, y: 0 },
                    { x: 10, y: 10 },
                ],
                value: 1,
            };
            expect(region.name).toBe('Illumination Zone');
            expect(region.type).toBe(RegionType.Illumination);
            expect(region.value).toBe(1);
        });

        it('should allow StageRegion with string type for extensibility', () => {
            const region: StageRegion = {
                index: 1,
                name: 'Custom Zone',
                type: 'CustomType',
                vertices: [
                    { x: 0, y: 0 },
                    { x: 50, y: 0 },
                    { x: 25, y: 50 },
                ],
            };
            expect(region.type).toBe('CustomType');
        });

        it('should allow StageRegion without optional properties', () => {
            const region: StageRegion = {
                index: 0,
                type: RegionType.Terrain,
                vertices: [{ x: 0, y: 0 }],
            };
            expect(region.name).toBeUndefined();
            expect(region.value).toBeUndefined();
        });
    });

    describe('EncounterRegion', () => {
        it('should allow valid EncounterRegion object', () => {
            const vertices: Point[] = [
                { x: 0, y: 0 },
                { x: 10, y: 0 },
                { x: 10, y: 10 },
            ];

            const encounterRegion: EncounterRegion = {
                index: 0,
                type: 'FogOfWar',
                vertices,
                value: 1,
            };
            expect(encounterRegion.vertices).toHaveLength(3);
            expect(encounterRegion.value).toBe(1);
        });

        it('should allow EncounterRegion with optional encounterId', () => {
            const encounterRegion: EncounterRegion = {
                encounterId: 'abc-def-ghi',
                index: 1,
                type: 'Elevation',
                vertices: [{ x: 0, y: 0 }],
            };
            expect(encounterRegion.encounterId).toBe('abc-def-ghi');
        });

        it('should allow EncounterRegion with all optional properties', () => {
            const encounterRegion: EncounterRegion = {
                encounterId: 'abc-123',
                index: 0,
                name: 'Named Region',
                type: 'Terrain',
                vertices: [{ x: 0, y: 0 }],
                value: 5,
                label: 'Difficult Terrain',
                color: '#ff0000',
            };
            expect(encounterRegion.name).toBe('Named Region');
            expect(encounterRegion.label).toBe('Difficult Terrain');
            expect(encounterRegion.color).toBe('#ff0000');
        });
    });

    describe('CreateRegionRequest', () => {
        it('should allow request with required fields', () => {
            const vertices: StageRegionVertex[] = [
                { x: 0, y: 0 },
                { x: 100, y: 0 },
                { x: 100, y: 100 },
            ];

            const request: CreateRegionRequest = {
                type: RegionType.Elevation,
                vertices,
            };
            expect(request.type).toBe(RegionType.Elevation);
            expect(request.vertices).toHaveLength(3);
        });

        it('should allow request with all optional fields', () => {
            const request: CreateRegionRequest = {
                name: 'Elevation Map',
                type: RegionType.Terrain,
                vertices: [{ x: 0, y: 0 }],
                value: 2,
            };
            expect(request.name).toBe('Elevation Map');
            expect(request.value).toBe(2);
        });
    });

    describe('UpdateRegionRequest', () => {
        it('should allow partial updates with name only', () => {
            const request: UpdateRegionRequest = {
                name: 'Updated Region',
            };
            expect(request.name).toBe('Updated Region');
            expect(request.type).toBeUndefined();
        });

        it('should allow partial updates with type only', () => {
            const request: UpdateRegionRequest = {
                type: RegionType.FogOfWar,
            };
            expect(request.type).toBe(RegionType.FogOfWar);
        });

        it('should allow partial updates with vertices only', () => {
            const request: UpdateRegionRequest = {
                vertices: [
                    { x: 0, y: 0 },
                    { x: 50, y: 50 },
                ],
            };
            expect(request.vertices).toHaveLength(2);
        });

        it('should allow partial updates with value only', () => {
            const request: UpdateRegionRequest = {
                value: 10,
            };
            expect(request.value).toBe(10);
        });

        it('should allow empty update', () => {
            const request: UpdateRegionRequest = {};
            expect(Object.keys(request)).toHaveLength(0);
        });
    });
});
