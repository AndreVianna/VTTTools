// TODO: Phase 8.8 - Re-enable when Wall/Region/Source types are implemented
// import { describe, it, expect } from 'vitest';
// import type {
//     Wall,
//     EncounterWall,
//     CreateWallRequest,
//     UpdateWallRequest,
//     PlaceEncounterWallRequest,
//     UpdateEncounterWallRequest,
//     Pole
// } from '../domain';
// import { WallVisibility } from '../domain';

// describe('Wall Types', () => {
//     it('should allow valid Wall object', () => {
//         const Wall: Wall = {
//             id: '123e4567-e89b-12d3-a456-426614174000',
//             ownerId: '123e4567-e89b-12d3-a456-426614174001',
//             name: 'Stone Wall',
//             description: 'A solid stone wall',
//             poles: [],
//             visibility: WallVisibility.Normal,
//             isClosed: false,
//             material: 'Stone',
//             createdAt: '2025-10-28T00:00:00Z',
//         };
//         expect(Wall.name).toBe('Stone Wall');
//         expect(Wall.visibility).toBe(WallVisibility.Normal);
//         expect(Wall.isClosed).toBe(false);
//         expect(Wall.material).toBe('Stone');
//     });

//     it('should allow Wall without optional fields', () => {
//         const Wall: Wall = {
//             id: '123e4567-e89b-12d3-a456-426614174000',
//             ownerId: '123e4567-e89b-12d3-a456-426614174001',
//             name: 'Fence',
//             poles: [],
//             visibility: WallVisibility.Fence,
//             isClosed: false,
//             createdAt: '2025-10-28T00:00:00Z',
//         };
//         expect(Wall.description).toBeUndefined();
//         expect(Wall.material).toBeUndefined();
//         expect(Wall.visibility).toBe(WallVisibility.Fence);
//     });

//     it('should allow valid EncounterWall object', () => {
//         const poles: Pole[] = [
//             { x: 0, y: 0, h: 10 },
//             { x: 10, y: 10, h: 10 },
//         ];

//         const encounterWall: EncounterWall = {
//             id: '789e4567-e89b-12d3-a456-426614174000',
//             encounterId: 'abc-def-ghi',
//             WallId: '123e4567-e89b-12d3-a456-426614174000',
//             poles,
//         };
//         expect(encounterWall.poles).toHaveLength(2);
//         expect(encounterWall.poles[0]?.x).toBe(0);
//         expect(encounterWall.poles[0]?.h).toBe(10);
//     });

//     it('should allow EncounterWall with different pole heights', () => {
//         const encounterWall: EncounterWall = {
//             id: '789e4567-e89b-12d3-a456-426614174000',
//             encounterId: 'abc-def-ghi',
//             WallId: '123e4567-e89b-12d3-a456-426614174000',
//             poles: [
//                 { x: 0, y: 0, h: 5 },
//                 { x: 5, y: 5, h: 15 },
//             ],
//         };
//         expect(encounterWall.poles[0]?.h).toBe(5);
//         expect(encounterWall.poles[1]?.h).toBe(15);
//     });

//     it('should allow valid CreateWallRequest', () => {
//         const request: CreateWallRequest = {
//             name: 'Iron Wall',
//             description: 'A heavy iron wall',
//             poles: [],
//             visibility: WallVisibility.Normal,
//             isClosed: true,
//             material: 'Metal',
//         };
//         expect(request.name).toBe('Iron Wall');
//         expect(request.visibility).toBe(WallVisibility.Normal);
//         expect(request.isClosed).toBe(true);
//         expect(request.material).toBe('Metal');
//     });

//     it('should allow UpdateWallRequest with partial updates', () => {
//         const request: UpdateWallRequest = {
//             name: 'Updated Wall',
//             visibility: WallVisibility.Invisible,
//         };
//         expect(request.name).toBe('Updated Wall');
//         expect(request.description).toBeUndefined();
//         expect(request.visibility).toBe(WallVisibility.Invisible);
//     });

//     it('should allow valid PlaceEncounterWallRequest', () => {
//         const request: PlaceEncounterWallRequest = {
//             WallId: '123e4567-e89b-12d3-a456-426614174000',
//             poles: [
//                 { x: 0, y: 0, h: 10 },
//                 { x: 100, y: 100, h: 10 },
//             ],
//         };
//         expect(request.WallId).toBeDefined();
//         expect(request.poles).toHaveLength(2);
//     });

//     it('should allow UpdateEncounterWallRequest with partial updates', () => {
//         const request: UpdateEncounterWallRequest = {
//             poles: [
//                 { x: 0, y: 0, h: 20 },
//             ],
//         };
//         expect(request.poles).toHaveLength(1);
//         expect(request.poles?.[0]?.h).toBe(20);
//     });
// });
