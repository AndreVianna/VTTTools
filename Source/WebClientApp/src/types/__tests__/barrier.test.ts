import { describe, it, expect } from 'vitest';
import type {
    Wall,
    SceneWall,
    CreateWallRequest,
    UpdateWallRequest,
    PlaceSceneWallRequest,
    UpdateSceneWallRequest,
    Pole
} from '../domain';
import { WallVisibility } from '../domain';

describe('Wall Types', () => {
    it('should allow valid Wall object', () => {
        const Wall: Wall = {
            id: '123e4567-e89b-12d3-a456-426614174000',
            ownerId: '123e4567-e89b-12d3-a456-426614174001',
            name: 'Stone Wall',
            description: 'A solid stone wall',
            poles: [],
            visibility: WallVisibility.Normal,
            isClosed: false,
            material: 'Stone',
            createdAt: '2025-10-28T00:00:00Z',
        };
        expect(Wall.name).toBe('Stone Wall');
        expect(Wall.visibility).toBe(WallVisibility.Normal);
        expect(Wall.isClosed).toBe(false);
        expect(Wall.material).toBe('Stone');
    });

    it('should allow Wall without optional fields', () => {
        const Wall: Wall = {
            id: '123e4567-e89b-12d3-a456-426614174000',
            ownerId: '123e4567-e89b-12d3-a456-426614174001',
            name: 'Fence',
            poles: [],
            visibility: WallVisibility.Fence,
            isClosed: false,
            createdAt: '2025-10-28T00:00:00Z',
        };
        expect(Wall.description).toBeUndefined();
        expect(Wall.material).toBeUndefined();
        expect(Wall.visibility).toBe(WallVisibility.Fence);
    });

    it('should allow valid SceneWall object', () => {
        const poles: Pole[] = [
            { x: 0, y: 0, h: 10 },
            { x: 10, y: 10, h: 10 },
        ];

        const sceneWall: SceneWall = {
            id: '789e4567-e89b-12d3-a456-426614174000',
            sceneId: 'abc-def-ghi',
            WallId: '123e4567-e89b-12d3-a456-426614174000',
            poles,
        };
        expect(sceneWall.poles).toHaveLength(2);
        expect(sceneWall.poles[0]?.x).toBe(0);
        expect(sceneWall.poles[0]?.h).toBe(10);
    });

    it('should allow SceneWall with different pole heights', () => {
        const sceneWall: SceneWall = {
            id: '789e4567-e89b-12d3-a456-426614174000',
            sceneId: 'abc-def-ghi',
            WallId: '123e4567-e89b-12d3-a456-426614174000',
            poles: [
                { x: 0, y: 0, h: 5 },
                { x: 5, y: 5, h: 15 },
            ],
        };
        expect(sceneWall.poles[0]?.h).toBe(5);
        expect(sceneWall.poles[1]?.h).toBe(15);
    });

    it('should allow valid CreateWallRequest', () => {
        const request: CreateWallRequest = {
            name: 'Iron Wall',
            description: 'A heavy iron wall',
            poles: [],
            visibility: WallVisibility.Normal,
            isClosed: true,
            material: 'Metal',
        };
        expect(request.name).toBe('Iron Wall');
        expect(request.visibility).toBe(WallVisibility.Normal);
        expect(request.isClosed).toBe(true);
        expect(request.material).toBe('Metal');
    });

    it('should allow UpdateWallRequest with partial updates', () => {
        const request: UpdateWallRequest = {
            name: 'Updated Wall',
            visibility: WallVisibility.Invisible,
        };
        expect(request.name).toBe('Updated Wall');
        expect(request.description).toBeUndefined();
        expect(request.visibility).toBe(WallVisibility.Invisible);
    });

    it('should allow valid PlaceSceneWallRequest', () => {
        const request: PlaceSceneWallRequest = {
            WallId: '123e4567-e89b-12d3-a456-426614174000',
            poles: [
                { x: 0, y: 0, h: 10 },
                { x: 100, y: 100, h: 10 },
            ],
        };
        expect(request.WallId).toBeDefined();
        expect(request.poles).toHaveLength(2);
    });

    it('should allow UpdateSceneWallRequest with partial updates', () => {
        const request: UpdateSceneWallRequest = {
            poles: [
                { x: 0, y: 0, h: 20 },
            ],
        };
        expect(request.poles).toHaveLength(1);
        expect(request.poles?.[0]?.h).toBe(20);
    });
});
