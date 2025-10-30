import { describe, it, expect } from 'vitest';
import type {
    Barrier,
    SceneBarrier,
    CreateBarrierRequest,
    UpdateBarrierRequest,
    PlaceSceneBarrierRequest,
    UpdateSceneBarrierRequest,
    Pole
} from '../domain';
import { WallVisibility } from '../domain';

describe('Barrier Types', () => {
    it('should allow valid Barrier object', () => {
        const barrier: Barrier = {
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
        expect(barrier.name).toBe('Stone Wall');
        expect(barrier.visibility).toBe(WallVisibility.Normal);
        expect(barrier.isClosed).toBe(false);
        expect(barrier.material).toBe('Stone');
    });

    it('should allow Barrier without optional fields', () => {
        const barrier: Barrier = {
            id: '123e4567-e89b-12d3-a456-426614174000',
            ownerId: '123e4567-e89b-12d3-a456-426614174001',
            name: 'Fence',
            poles: [],
            visibility: WallVisibility.Fence,
            isClosed: false,
            createdAt: '2025-10-28T00:00:00Z',
        };
        expect(barrier.description).toBeUndefined();
        expect(barrier.material).toBeUndefined();
        expect(barrier.visibility).toBe(WallVisibility.Fence);
    });

    it('should allow valid SceneBarrier object', () => {
        const poles: Pole[] = [
            { x: 0, y: 0, h: 10 },
            { x: 10, y: 10, h: 10 },
        ];

        const sceneBarrier: SceneBarrier = {
            id: '789e4567-e89b-12d3-a456-426614174000',
            sceneId: 'abc-def-ghi',
            barrierId: '123e4567-e89b-12d3-a456-426614174000',
            poles,
        };
        expect(sceneBarrier.poles).toHaveLength(2);
        expect(sceneBarrier.poles[0]?.x).toBe(0);
        expect(sceneBarrier.poles[0]?.h).toBe(10);
    });

    it('should allow SceneBarrier with different pole heights', () => {
        const sceneBarrier: SceneBarrier = {
            id: '789e4567-e89b-12d3-a456-426614174000',
            sceneId: 'abc-def-ghi',
            barrierId: '123e4567-e89b-12d3-a456-426614174000',
            poles: [
                { x: 0, y: 0, h: 5 },
                { x: 5, y: 5, h: 15 },
            ],
        };
        expect(sceneBarrier.poles[0]?.h).toBe(5);
        expect(sceneBarrier.poles[1]?.h).toBe(15);
    });

    it('should allow valid CreateBarrierRequest', () => {
        const request: CreateBarrierRequest = {
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

    it('should allow UpdateBarrierRequest with partial updates', () => {
        const request: UpdateBarrierRequest = {
            name: 'Updated Wall',
            visibility: WallVisibility.Invisible,
        };
        expect(request.name).toBe('Updated Wall');
        expect(request.description).toBeUndefined();
        expect(request.visibility).toBe(WallVisibility.Invisible);
    });

    it('should allow valid PlaceSceneBarrierRequest', () => {
        const request: PlaceSceneBarrierRequest = {
            barrierId: '123e4567-e89b-12d3-a456-426614174000',
            poles: [
                { x: 0, y: 0, h: 10 },
                { x: 100, y: 100, h: 10 },
            ],
        };
        expect(request.barrierId).toBeDefined();
        expect(request.poles).toHaveLength(2);
    });

    it('should allow UpdateSceneBarrierRequest with partial updates', () => {
        const request: UpdateSceneBarrierRequest = {
            poles: [
                { x: 0, y: 0, h: 20 },
            ],
        };
        expect(request.poles).toHaveLength(1);
        expect(request.poles?.[0]?.h).toBe(20);
    });
});
