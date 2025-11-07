// TODO: Phase 8.8 - Re-enable when Wall/Region/Source types are implemented
// import { describe, it, expect } from 'vitest';
// import type {
//     Source,
//     SceneSource,
//     CreateSourceRequest,
//     UpdateSourceRequest,
//     PlaceSceneSourceRequest,
//     UpdateSceneSourceRequest,
//     Point
// } from '../domain';

// describe('Source Types', () => {
//     it('should allow valid Source object', () => {
//         const source: Source = {
//             id: '123e4567-e89b-12d3-a456-426614174000',
//             ownerId: '123e4567-e89b-12d3-a456-426614174001',
//             name: 'Torch',
//             description: 'A burning torch providing light',
//             sourceType: 'Light',
//             defaultRange: 10.0,
//             defaultIntensity: 0.8,
//             defaultIsGradient: true,
//             createdAt: '2025-10-28T00:00:00Z',
//         };
//         expect(source.name).toBe('Torch');
//         expect(source.sourceType).toBe('Light');
//         expect(source.defaultRange).toBe(10.0);
//         expect(source.defaultIntensity).toBe(0.8);
//     });

//     it('should allow Source with extensible sourceType', () => {
//         const source: Source = {
//             id: '123e4567-e89b-12d3-a456-426614174000',
//             ownerId: '123e4567-e89b-12d3-a456-426614174001',
//             name: 'Waterfall',
//             sourceType: 'Sound',
//             defaultRange: 15.5,
//             defaultIntensity: 0.6,
//             defaultIsGradient: true,
//             createdAt: '2025-10-28T00:00:00Z',
//         };
//         expect(source.sourceType).toBe('Sound');
//     });

//     it('should allow Source with fractional range', () => {
//         const source: Source = {
//             id: '123e4567-e89b-12d3-a456-426614174000',
//             ownerId: '123e4567-e89b-12d3-a456-426614174001',
//             name: 'Candle',
//             sourceType: 'Light',
//             defaultRange: 2.5,
//             defaultIntensity: 0.3,
//             defaultIsGradient: true,
//             createdAt: '2025-10-28T00:00:00Z',
//         };
//         expect(source.defaultRange).toBe(2.5);
//     });

//     it('should allow valid SceneSource object', () => {
//         const position: Point = { x: 50, y: 75 };

//         const sceneSource: SceneSource = {
//             id: '789e4567-e89b-12d3-a456-426614174000',
//             sceneId: 'abc-def-ghi',
//             sourceId: '123e4567-e89b-12d3-a456-426614174000',
//             position,
//             range: 12.0,
//             intensity: 0.9,
//             isGradient: true,
//         };
//         expect(sceneSource.position.x).toBe(50);
//         expect(sceneSource.position.y).toBe(75);
//         expect(sceneSource.range).toBe(12.0);
//     });

//     it('should allow SceneSource with overridden properties', () => {
//         const sceneSource: SceneSource = {
//             id: '789e4567-e89b-12d3-a456-426614174000',
//             sceneId: 'abc-def-ghi',
//             sourceId: '123e4567-e89b-12d3-a456-426614174000',
//             position: { x: 100, y: 200 },
//             range: 5.0,
//             intensity: 0.5,
//             isGradient: false,
//         };
//         expect(sceneSource.isGradient).toBe(false);
//         expect(sceneSource.intensity).toBe(0.5);
//     });

//     it('should allow valid CreateSourceRequest', () => {
//         const request: CreateSourceRequest = {
//             name: 'Lantern',
//             description: 'A glowing lantern',
//             sourceType: 'Light',
//             defaultRange: 8.0,
//             defaultIntensity: 0.7,
//             defaultIsGradient: true,
//         };
//         expect(request.name).toBe('Lantern');
//         expect(request.defaultRange).toBe(8.0);
//     });

//     it('should allow UpdateSourceRequest with partial updates', () => {
//         const request: UpdateSourceRequest = {
//             name: 'Updated Torch',
//             defaultIntensity: 0.9,
//         };
//         expect(request.name).toBe('Updated Torch');
//         expect(request.defaultRange).toBeUndefined();
//     });

//     it('should allow valid PlaceSceneSourceRequest', () => {
//         const request: PlaceSceneSourceRequest = {
//             sourceId: '123e4567-e89b-12d3-a456-426614174000',
//             position: { x: 25, y: 50 },
//             range: 10.0,
//             intensity: 0.8,
//             isGradient: true,
//         };
//         expect(request.sourceId).toBeDefined();
//         expect(request.position.x).toBe(25);
//     });

//     it('should allow PlaceSceneSourceRequest with optional range/intensity/isGradient', () => {
//         const request: PlaceSceneSourceRequest = {
//             sourceId: '123e4567-e89b-12d3-a456-426614174000',
//             position: { x: 25, y: 50 },
//         };
//         expect(request.sourceId).toBeDefined();
//         expect(request.position.x).toBe(25);
//         expect(request.range).toBeUndefined();
//         expect(request.intensity).toBeUndefined();
//         expect(request.isGradient).toBeUndefined();
//     });

//     it('should allow UpdateSceneSourceRequest with partial updates', () => {
//         const request: UpdateSceneSourceRequest = {
//             intensity: 1.0,
//             isGradient: false,
//         };
//         expect(request.intensity).toBe(1.0);
//         expect(request.position).toBeUndefined();
//     });
// });
