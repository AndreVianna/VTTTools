// TODO: Phase 8.8 - Re-enable when Wall types are fully implemented
// import { describe, it, expect, vi } from 'vitest';
// import {
//     CreateWallCommand,
//     EditWallCommand,
//     DeleteWallCommand,
//     BreakWallCommand,
//     type CreateWallCommandParams,
//     type EditWallCommandParams,
//     type DeleteWallCommandParams,
//     type BreakWallCommandParams,
// } from './wallCommands';
// import type { SceneWall, Pole } from '@/types/domain';
// import { WallVisibility } from '@/types/domain';

// const createMockWall = (index: number, name: string = `Wall ${index}`): SceneWall => ({
//     sceneId: 'scene-1',
//     index,
//     name,
//     poles: [
//         { x: 0, y: 0, h: 10 },
//         { x: 100, y: 100, h: 10 }
//     ],
//     visibility: WallVisibility.Normal,
//     isClosed: false,
//     material: 'stone',
//     color: '#808080'
// });

// const createMockSegmentWall = (index: number, poles: Pole[]): SceneWall => ({
//     sceneId: 'scene-1',
//     index,
//     name: `Segment ${index}`,
//     poles,
//     visibility: WallVisibility.Normal,
//     isClosed: false,
//     material: 'stone',
//     color: '#808080'
// });

// describe('CreateWallCommand', () => {
//     it('should set description property correctly', () => {
//         const mockWall = createMockWall(0);
//         const params: CreateWallCommandParams = {
//             sceneId: 'scene-1',
//             wall: mockWall,
//             onCreate: vi.fn(),
//             onRemove: vi.fn(),
//             onRefetch: vi.fn(),
//         };

//         const command = new CreateWallCommand(params);

//         expect(command.description).toBe('Create wall "Wall 0"');
//     });

//     it('should execute as no-op', () => {
//         const mockWall = createMockWall(0);
//         const onCreate = vi.fn();
//         const onRemove = vi.fn();
//         const params: CreateWallCommandParams = {
//             sceneId: 'scene-1',
//             wall: mockWall,
//             onCreate,
//             onRemove,
//             onRefetch: vi.fn(),
//         };

//         const command = new CreateWallCommand(params);
//         command.execute();

//         expect(onCreate).not.toHaveBeenCalled();
//         expect(onRemove).not.toHaveBeenCalled();
//     });

//     it('should call onRemove with correct wallIndex on undo', async () => {
//         const mockWall = createMockWall(0);
//         const onRemove = vi.fn().mockResolvedValue(undefined);
//         const params: CreateWallCommandParams = {
//             sceneId: 'scene-1',
//             wall: mockWall,
//             onCreate: vi.fn(),
//             onRemove,
//             onRefetch: vi.fn(),
//         };

//         const command = new CreateWallCommand(params);
//         await command.undo();

//         expect(onRemove).toHaveBeenCalledWith('scene-1', 0);
//         expect(onRemove).toHaveBeenCalledTimes(1);
//     });

//     it('should call onRefetch after removal on undo', async () => {
//         const mockWall = createMockWall(0);
//         const onRemove = vi.fn().mockResolvedValue(undefined);
//         const onRefetch = vi.fn().mockResolvedValue(undefined);
//         const params: CreateWallCommandParams = {
//             sceneId: 'scene-1',
//             wall: mockWall,
//             onCreate: vi.fn(),
//             onRemove,
//             onRefetch,
//         };

//         const command = new CreateWallCommand(params);
//         await command.undo();

//         expect(onRefetch).toHaveBeenCalledTimes(1);
//     });

//     it('should call onCreate with wall properties on redo', async () => {
//         const mockWall = createMockWall(0);
//         const onCreate = vi.fn().mockResolvedValue({ ...mockWall, index: 5 });
//         const params: CreateWallCommandParams = {
//             sceneId: 'scene-1',
//             wall: mockWall,
//             onCreate,
//             onRemove: vi.fn(),
//             onRefetch: vi.fn(),
//         };

//         const command = new CreateWallCommand(params);
//         await command.redo();

//         expect(onCreate).toHaveBeenCalledWith('scene-1', {
//             name: mockWall.name,
//             poles: mockWall.poles,
//             visibility: mockWall.visibility,
//             isClosed: mockWall.isClosed,
//             material: mockWall.material,
//             color: mockWall.color
//         });
//         expect(onCreate).toHaveBeenCalledTimes(1);
//     });

//     it('should track new createdIndex on redo', async () => {
//         const mockWall = createMockWall(0);
//         const newIndex = 42;
//         const onCreate = vi.fn().mockResolvedValue({ ...mockWall, index: newIndex });
//         const onRemove = vi.fn().mockResolvedValue(undefined);
//         const params: CreateWallCommandParams = {
//             sceneId: 'scene-1',
//             wall: mockWall,
//             onCreate,
//             onRemove,
//             onRefetch: vi.fn(),
//         };

//         const command = new CreateWallCommand(params);
//         await command.redo();

//         await command.undo();

//         expect(onRemove).toHaveBeenCalledWith('scene-1', 0);
//     });
// });

// describe('EditWallCommand', () => {
//     it('should set description property correctly', () => {
//         const oldWall = createMockWall(0, 'Old Wall');
//         const newWall = createMockWall(0, 'New Wall');
//         const params: EditWallCommandParams = {
//             sceneId: 'scene-1',
//             wallIndex: 0,
//             oldWall,
//             newWall,
//             onUpdate: vi.fn(),
//             onRefetch: vi.fn(),
//         };

//         const command = new EditWallCommand(params);

//         expect(command.description).toBe('Edit wall "New Wall"');
//     });

//     it('should execute as no-op', () => {
//         const oldWall = createMockWall(0);
//         const newWall = createMockWall(0, 'Edited Wall');
//         const onUpdate = vi.fn();
//         const params: EditWallCommandParams = {
//             sceneId: 'scene-1',
//             wallIndex: 0,
//             oldWall,
//             newWall,
//             onUpdate,
//             onRefetch: vi.fn(),
//         };

//         const command = new EditWallCommand(params);
//         command.execute();

//         expect(onUpdate).not.toHaveBeenCalled();
//     });

//     it('should call onUpdate with oldWall properties on undo', async () => {
//         const oldWall = createMockWall(0, 'Old Wall');
//         const newWall = createMockWall(0, 'New Wall');
//         const onUpdate = vi.fn().mockResolvedValue(undefined);
//         const params: EditWallCommandParams = {
//             sceneId: 'scene-1',
//             wallIndex: 0,
//             oldWall,
//             newWall,
//             onUpdate,
//             onRefetch: vi.fn(),
//         };

//         const command = new EditWallCommand(params);
//         await command.undo();

//         expect(onUpdate).toHaveBeenCalledWith('scene-1', 0, {
//             name: oldWall.name,
//             poles: oldWall.poles,
//             visibility: oldWall.visibility,
//             isClosed: oldWall.isClosed,
//             material: oldWall.material,
//             color: oldWall.color
//         });
//         expect(onUpdate).toHaveBeenCalledTimes(1);
//     });

//     it('should call onRefetch after update on undo', async () => {
//         const oldWall = createMockWall(0, 'Old Wall');
//         const newWall = createMockWall(0, 'New Wall');
//         const onUpdate = vi.fn().mockResolvedValue(undefined);
//         const onRefetch = vi.fn().mockResolvedValue(undefined);
//         const params: EditWallCommandParams = {
//             sceneId: 'scene-1',
//             wallIndex: 0,
//             oldWall,
//             newWall,
//             onUpdate,
//             onRefetch,
//         };

//         const command = new EditWallCommand(params);
//         await command.undo();

//         expect(onRefetch).toHaveBeenCalledTimes(1);
//     });

//     it('should call onUpdate with newWall properties on redo', async () => {
//         const oldWall = createMockWall(0, 'Old Wall');
//         const newWall: SceneWall = {
//             ...createMockWall(0, 'New Wall'),
//             poles: [{ x: 50, y: 50, h: 15 }],
//             visibility: WallVisibility.Invisible,
//             isClosed: true,
//             material: 'wood',
//             color: '#ff0000'
//         };
//         const onUpdate = vi.fn().mockResolvedValue(undefined);
//         const params: EditWallCommandParams = {
//             sceneId: 'scene-1',
//             wallIndex: 0,
//             oldWall,
//             newWall,
//             onUpdate,
//             onRefetch: vi.fn(),
//         };

//         const command = new EditWallCommand(params);
//         await command.redo();

//         expect(onUpdate).toHaveBeenCalledWith('scene-1', 0, {
//             name: newWall.name,
//             poles: newWall.poles,
//             visibility: newWall.visibility,
//             isClosed: newWall.isClosed,
//             material: newWall.material,
//             color: newWall.color
//         });
//         expect(onUpdate).toHaveBeenCalledTimes(1);
//     });

//     it('should call onRefetch after update on redo', async () => {
//         const oldWall = createMockWall(0, 'Old Wall');
//         const newWall = createMockWall(0, 'New Wall');
//         const onUpdate = vi.fn().mockResolvedValue(undefined);
//         const onRefetch = vi.fn().mockResolvedValue(undefined);
//         const params: EditWallCommandParams = {
//             sceneId: 'scene-1',
//             wallIndex: 0,
//             oldWall,
//             newWall,
//             onUpdate,
//             onRefetch,
//         };

//         const command = new EditWallCommand(params);
//         await command.redo();

//         expect(onRefetch).toHaveBeenCalledTimes(1);
//     });
// });

// describe('DeleteWallCommand', () => {
//     it('should set description property correctly', () => {
//         const mockWall = createMockWall(0, 'Wall to Delete');
//         const params: DeleteWallCommandParams = {
//             sceneId: 'scene-1',
//             wallIndex: 0,
//             wall: mockWall,
//             onAdd: vi.fn(),
//             onRemove: vi.fn(),
//             onRefetch: vi.fn(),
//         };

//         const command = new DeleteWallCommand(params);

//         expect(command.description).toBe('Delete wall "Wall to Delete"');
//     });

//     it('should execute as no-op', () => {
//         const mockWall = createMockWall(0);
//         const onAdd = vi.fn();
//         const onRemove = vi.fn();
//         const params: DeleteWallCommandParams = {
//             sceneId: 'scene-1',
//             wallIndex: 0,
//             wall: mockWall,
//             onAdd,
//             onRemove,
//             onRefetch: vi.fn(),
//         };

//         const command = new DeleteWallCommand(params);
//         command.execute();

//         expect(onAdd).not.toHaveBeenCalled();
//         expect(onRemove).not.toHaveBeenCalled();
//     });

//     it('should call onAdd with wall properties on undo', async () => {
//         const mockWall = createMockWall(0);
//         const onAdd = vi.fn().mockResolvedValue({ ...mockWall, index: 10 });
//         const params: DeleteWallCommandParams = {
//             sceneId: 'scene-1',
//             wallIndex: 0,
//             wall: mockWall,
//             onAdd,
//             onRemove: vi.fn(),
//             onRefetch: vi.fn(),
//         };

//         const command = new DeleteWallCommand(params);
//         await command.undo();

//         expect(onAdd).toHaveBeenCalledWith('scene-1', {
//             name: mockWall.name,
//             poles: mockWall.poles,
//             visibility: mockWall.visibility,
//             isClosed: mockWall.isClosed,
//             material: mockWall.material,
//             color: mockWall.color
//         });
//         expect(onAdd).toHaveBeenCalledTimes(1);
//     });

//     it('should track restoredIndex on undo', async () => {
//         const mockWall = createMockWall(0);
//         const restoredIndex = 15;
//         const onAdd = vi.fn().mockResolvedValue({ ...mockWall, index: restoredIndex });
//         const params: DeleteWallCommandParams = {
//             sceneId: 'scene-1',
//             wallIndex: 0,
//             wall: mockWall,
//             onAdd,
//             onRemove: vi.fn(),
//             onRefetch: vi.fn(),
//         };

//         const command = new DeleteWallCommand(params);
//         await command.undo();

//         expect(onAdd).toHaveBeenCalledTimes(1);
//     });

//     it('should call onRefetch after restore on undo', async () => {
//         const mockWall = createMockWall(0);
//         const onAdd = vi.fn().mockResolvedValue({ ...mockWall, index: 10 });
//         const onRefetch = vi.fn().mockResolvedValue(undefined);
//         const params: DeleteWallCommandParams = {
//             sceneId: 'scene-1',
//             wallIndex: 0,
//             wall: mockWall,
//             onAdd,
//             onRemove: vi.fn(),
//             onRefetch,
//         };

//         const command = new DeleteWallCommand(params);
//         await command.undo();

//         expect(onRefetch).toHaveBeenCalledTimes(1);
//     });

//     it('should call onRemove with restoredIndex on redo', async () => {
//         const mockWall = createMockWall(0);
//         const restoredIndex = 20;
//         const onAdd = vi.fn().mockResolvedValue({ ...mockWall, index: restoredIndex });
//         const onRemove = vi.fn().mockResolvedValue(undefined);
//         const params: DeleteWallCommandParams = {
//             sceneId: 'scene-1',
//             wallIndex: 0,
//             wall: mockWall,
//             onAdd,
//             onRemove,
//             onRefetch: vi.fn(),
//         };

//         const command = new DeleteWallCommand(params);
//         await command.undo();
//         await command.redo();

//         expect(onRemove).toHaveBeenCalledWith('scene-1', restoredIndex);
//         expect(onRemove).toHaveBeenCalledTimes(1);
//     });

//     it('should call onRefetch after removal on redo', async () => {
//         const mockWall = createMockWall(0);
//         const onAdd = vi.fn().mockResolvedValue({ ...mockWall, index: 10 });
//         const onRemove = vi.fn().mockResolvedValue(undefined);
//         const onRefetch = vi.fn().mockResolvedValue(undefined);
//         const params: DeleteWallCommandParams = {
//             sceneId: 'scene-1',
//             wallIndex: 0,
//             wall: mockWall,
//             onAdd,
//             onRemove,
//             onRefetch,
//         };

//         const command = new DeleteWallCommand(params);
//         await command.undo();
//         await command.redo();

//         expect(onRefetch).toHaveBeenCalledTimes(2);
//     });
// });

// describe('BreakWallCommand', () => {
//     const createBreakWallParams = (): BreakWallCommandParams => {
//         const originalWall = createMockWall(0, 'Original Wall');
//         const newWalls = [
//             createMockSegmentWall(1, [
//                 { x: 0, y: 0, h: 10 },
//                 { x: 50, y: 50, h: 10 }
//             ]),
//             createMockSegmentWall(2, [
//                 { x: 50, y: 50, h: 10 },
//                 { x: 100, y: 100, h: 10 }
//             ])
//         ];

//         return {
//             sceneId: 'scene-1',
//             originalWallIndex: 0,
//             originalWall,
//             newWalls,
//             onAdd: vi.fn(),
//             onUpdate: vi.fn(),
//             onRemove: vi.fn(),
//             onRefetch: vi.fn(),
//         };
//     };

//     it('should set description property correctly', () => {
//         const params = createBreakWallParams();
//         const command = new BreakWallCommand(params);

//         expect(command.description).toBe('Break wall "Original Wall" into 2 segments');
//     });

//     it('should store segmentIndices from newWalls on execute', () => {
//         const params = createBreakWallParams();
//         const command = new BreakWallCommand(params);

//         command.execute();

//         expect(command['segmentIndices']).toEqual([1, 2]);
//     });

//     it('should call onRemove for all segment walls on undo', async () => {
//         const params = createBreakWallParams();
//         const onRemove = vi.fn().mockResolvedValue(undefined);
//         params.onRemove = onRemove;

//         const command = new BreakWallCommand(params);
//         command.execute();
//         await command.undo();

//         expect(onRemove).toHaveBeenCalledTimes(2);
//         expect(onRemove).toHaveBeenCalledWith('scene-1', 1);
//         expect(onRemove).toHaveBeenCalledWith('scene-1', 2);
//     });

//     it('should call onUpdate to restore original wall on undo', async () => {
//         const params = createBreakWallParams();
//         const onUpdate = vi.fn().mockResolvedValue(undefined);
//         params.onUpdate = onUpdate;

//         const command = new BreakWallCommand(params);
//         command.execute();
//         await command.undo();

//         expect(onUpdate).toHaveBeenCalledWith('scene-1', 0, {
//             name: params.originalWall.name,
//             poles: params.originalWall.poles,
//             visibility: params.originalWall.visibility,
//             isClosed: params.originalWall.isClosed,
//             material: params.originalWall.material,
//             color: params.originalWall.color
//         });
//         expect(onUpdate).toHaveBeenCalledTimes(1);
//     });

//     it('should call onRefetch after restore on undo', async () => {
//         const params = createBreakWallParams();
//         const onRefetch = vi.fn().mockResolvedValue(undefined);
//         params.onRefetch = onRefetch;

//         const command = new BreakWallCommand(params);
//         command.execute();
//         await command.undo();

//         expect(onRefetch).toHaveBeenCalledTimes(1);
//     });

//     it('should call onRemove for original wall on redo', async () => {
//         const params = createBreakWallParams();
//         const onRemove = vi.fn().mockResolvedValue(undefined);
//         const onAdd = vi.fn()
//             .mockResolvedValueOnce({ ...params.newWalls[0], index: 10 })
//             .mockResolvedValueOnce({ ...params.newWalls[1], index: 11 });
//         params.onRemove = onRemove;
//         params.onAdd = onAdd;

//         const command = new BreakWallCommand(params);
//         await command.redo();

//         expect(onRemove).toHaveBeenCalledWith('scene-1', 0);
//         expect(onRemove).toHaveBeenCalledTimes(1);
//     });

//     it('should call onAdd for each segment on redo', async () => {
//         const params = createBreakWallParams();
//         const onAdd = vi.fn()
//             .mockResolvedValueOnce({ ...params.newWalls[0], index: 10 })
//             .mockResolvedValueOnce({ ...params.newWalls[1], index: 11 });
//         params.onAdd = onAdd;

//         const command = new BreakWallCommand(params);
//         await command.redo();

//         expect(onAdd).toHaveBeenCalledTimes(2);
//         expect(onAdd).toHaveBeenNthCalledWith(1, 'scene-1', {
//             name: params.newWalls[0].name,
//             poles: params.newWalls[0].poles,
//             visibility: params.newWalls[0].visibility,
//             isClosed: params.newWalls[0].isClosed,
//             material: params.newWalls[0].material,
//             color: params.newWalls[0].color
//         });
//         expect(onAdd).toHaveBeenNthCalledWith(2, 'scene-1', {
//             name: params.newWalls[1].name,
//             poles: params.newWalls[1].poles,
//             visibility: params.newWalls[1].visibility,
//             isClosed: params.newWalls[1].isClosed,
//             material: params.newWalls[1].material,
//             color: params.newWalls[1].color
//         });
//     });

//     it('should update segmentIndices with new indices on redo', async () => {
//         const params = createBreakWallParams();
//         const newIndices = [25, 26];
//         const onAdd = vi.fn()
//             .mockResolvedValueOnce({ ...params.newWalls[0], index: newIndices[0] })
//             .mockResolvedValueOnce({ ...params.newWalls[1], index: newIndices[1] });
//         params.onAdd = onAdd;

//         const command = new BreakWallCommand(params);
//         await command.redo();

//         expect(command['segmentIndices']).toEqual(newIndices);
//     });
// });
