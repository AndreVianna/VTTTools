import { describe, it, expect } from 'vitest';
import type {
    Barrier,
    SceneBarrier,
    CreateBarrierRequest,
    UpdateBarrierRequest,
    PlaceSceneBarrierRequest,
    UpdateSceneBarrierRequest,
    Point
} from '../domain';

describe('Barrier Types', () => {
    it('should allow valid Barrier object', () => {
        const barrier: Barrier = {
            id: '123e4567-e89b-12d3-a456-426614174000',
            ownerId: '123e4567-e89b-12d3-a456-426614174001',
            name: 'Stone Wall',
            description: 'A solid stone wall',
            isOpaque: true,
            isSolid: true,
            isSecret: false,
            isOpenable: false,
            isLocked: false,
            createdAt: '2025-10-28T00:00:00Z',
        };
        expect(barrier.name).toBe('Stone Wall');
        expect(barrier.isOpaque).toBe(true);
        expect(barrier.isSolid).toBe(true);
    });

    it('should allow Barrier without optional description', () => {
        const barrier: Barrier = {
            id: '123e4567-e89b-12d3-a456-426614174000',
            ownerId: '123e4567-e89b-12d3-a456-426614174001',
            name: 'Door',
            isOpaque: false,
            isSolid: false,
            isSecret: false,
            isOpenable: true,
            isLocked: true,
            createdAt: '2025-10-28T00:00:00Z',
        };
        expect(barrier.description).toBeUndefined();
        expect(barrier.isOpenable).toBe(true);
    });

    it('should allow valid SceneBarrier object', () => {
        const vertices: Point[] = [
            { x: 0, y: 0 },
            { x: 10, y: 10 },
        ];

        const sceneBarrier: SceneBarrier = {
            id: '789e4567-e89b-12d3-a456-426614174000',
            sceneId: 'abc-def-ghi',
            barrierId: '123e4567-e89b-12d3-a456-426614174000',
            vertices,
        };
        expect(sceneBarrier.vertices).toHaveLength(2);
        expect(sceneBarrier.vertices[0]?.x).toBe(0);
        expect(sceneBarrier.isOpen).toBeUndefined();
    });

    it('should allow SceneBarrier with overrides', () => {
        const sceneBarrier: SceneBarrier = {
            id: '789e4567-e89b-12d3-a456-426614174000',
            sceneId: 'abc-def-ghi',
            barrierId: '123e4567-e89b-12d3-a456-426614174000',
            vertices: [
                { x: 0, y: 0 },
                { x: 5, y: 5 },
            ],
            isOpen: true,
            isLocked: false,
        };
        expect(sceneBarrier.isOpen).toBe(true);
        expect(sceneBarrier.isLocked).toBe(false);
    });

    it('should allow valid CreateBarrierRequest', () => {
        const request: CreateBarrierRequest = {
            name: 'Iron Door',
            description: 'A heavy iron door',
            isOpaque: true,
            isSolid: true,
            isSecret: false,
            isOpenable: true,
            isLocked: true,
        };
        expect(request.name).toBe('Iron Door');
        expect(request.isOpenable).toBe(true);
    });

    it('should allow UpdateBarrierRequest with partial updates', () => {
        const request: UpdateBarrierRequest = {
            name: 'Updated Wall',
            isOpaque: false,
        };
        expect(request.name).toBe('Updated Wall');
        expect(request.description).toBeUndefined();
    });

    it('should allow valid PlaceSceneBarrierRequest', () => {
        const request: PlaceSceneBarrierRequest = {
            barrierId: '123e4567-e89b-12d3-a456-426614174000',
            vertices: [
                { x: 0, y: 0 },
                { x: 100, y: 100 },
            ],
            isOpen: false,
            isLocked: true,
        };
        expect(request.barrierId).toBeDefined();
        expect(request.vertices).toHaveLength(2);
    });

    it('should allow UpdateSceneBarrierRequest with partial updates', () => {
        const request: UpdateSceneBarrierRequest = {
            isOpen: true,
        };
        expect(request.isOpen).toBe(true);
        expect(request.vertices).toBeUndefined();
    });
});
