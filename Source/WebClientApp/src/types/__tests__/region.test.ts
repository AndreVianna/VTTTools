import { describe, it, expect } from 'vitest';
import type {
    Region,
    SceneRegion,
    CreateRegionRequest,
    UpdateRegionRequest,
    PlaceSceneRegionRequest,
    UpdateSceneRegionRequest,
    Point
} from '../domain';

describe('Region Types', () => {
    it('should allow valid Region object', () => {
        const region: Region = {
            id: '123e4567-e89b-12d3-a456-426614174000',
            ownerId: '123e4567-e89b-12d3-a456-426614174001',
            name: 'Illumination Zone',
            description: 'A region that defines lighting levels',
            regionType: 'Illumination',
            labelMap: {
                0: 'dark',
                1: 'dim',
                2: 'bright',
            },
            createdAt: '2025-10-28T00:00:00Z',
        };
        expect(region.name).toBe('Illumination Zone');
        expect(region.regionType).toBe('Illumination');
        expect(region.labelMap[1]).toBe('dim');
    });

    it('should allow Region with extensible regionType', () => {
        const region: Region = {
            id: '123e4567-e89b-12d3-a456-426614174000',
            ownerId: '123e4567-e89b-12d3-a456-426614174001',
            name: 'Weather Zone',
            regionType: 'Weather',
            labelMap: {
                0: 'clear',
                1: 'rainy',
                2: 'stormy',
            },
            createdAt: '2025-10-28T00:00:00Z',
        };
        expect(region.regionType).toBe('Weather');
    });

    it('should allow valid SceneRegion object', () => {
        const vertices: Point[] = [
            { x: 0, y: 0 },
            { x: 10, y: 0 },
            { x: 10, y: 10 },
        ];

        const sceneRegion: SceneRegion = {
            id: '789e4567-e89b-12d3-a456-426614174000',
            sceneId: 'abc-def-ghi',
            regionId: '123e4567-e89b-12d3-a456-426614174000',
            vertices,
            value: 1,
        };
        expect(sceneRegion.vertices).toHaveLength(3);
        expect(sceneRegion.value).toBe(1);
    });

    it('should allow valid CreateRegionRequest', () => {
        const request: CreateRegionRequest = {
            name: 'Elevation Map',
            description: 'Defines terrain elevation',
            regionType: 'Elevation',
            labelMap: {
                0: 'ground',
                1: 'elevated',
                2: 'high',
            },
        };
        expect(request.name).toBe('Elevation Map');
        expect(request.regionType).toBe('Elevation');
    });

    it('should allow UpdateRegionRequest with partial updates', () => {
        const request: UpdateRegionRequest = {
            name: 'Updated Region',
            labelMap: {
                0: 'none',
                1: 'some',
            },
        };
        expect(request.name).toBe('Updated Region');
        expect(request.description).toBeUndefined();
    });

    it('should allow valid PlaceSceneRegionRequest', () => {
        const request: PlaceSceneRegionRequest = {
            regionId: '123e4567-e89b-12d3-a456-426614174000',
            vertices: [
                { x: 0, y: 0 },
                { x: 50, y: 0 },
                { x: 25, y: 50 },
            ],
            value: 2,
        };
        expect(request.regionId).toBeDefined();
        expect(request.vertices).toHaveLength(3);
        expect(request.value).toBe(2);
    });

    it('should allow UpdateSceneRegionRequest with partial updates', () => {
        const request: UpdateSceneRegionRequest = {
            value: 1,
        };
        expect(request.value).toBe(1);
        expect(request.vertices).toBeUndefined();
    });
});
