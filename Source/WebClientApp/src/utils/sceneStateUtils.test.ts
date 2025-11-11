import { describe, it, expect } from 'vitest';
import type { Scene, SceneWall, SceneRegion } from '@/types/domain';
import {
  addWallOptimistic,
  updateWallOptimistic,
  removeWallOptimistic,
  syncWallIndices,
  removeTempRegions,
  addRegionOptimistic,
  updateRegionOptimistic,
  removeRegionOptimistic,
  syncRegionIndices,
  filterSceneForMergeDetection,
} from './sceneStateUtils';

const createMockScene = (overrides?: Partial<Scene>): Scene => ({
  id: 'scene-1',
  adventure: null,
  name: 'Test Scene',
  description: 'A test scene',
  isPublished: false,
  light: 'Bright' as any,
  weather: 'Clear' as any,
  elevation: 0,
  grid: {
    type: 0,
    cellSize: { width: 50, height: 50 },
    offset: { left: 0, top: 0 },
    snap: true,
  },
  stage: {
    background: null,
    zoomLevel: 1,
    panning: { x: 0, y: 0 },
  },
  assets: [],
  walls: [],
  regions: [],
  sources: [],
  ...overrides,
});

const createMockWall = (overrides?: Partial<SceneWall>): SceneWall => ({
  sceneId: 'scene-1',
  index: 0,
  name: 'Wall',
  poles: [],
  visibility: 'Normal' as any,
  isClosed: false,
  ...overrides,
});

const createMockRegion = (overrides?: Partial<SceneRegion>): SceneRegion => ({
  sceneId: 'scene-1',
  index: 0,
  name: 'Region',
  type: 'difficult-terrain',
  vertices: [
    { x: 0, y: 0 },
    { x: 100, y: 0 },
    { x: 100, y: 100 },
  ],
  ...overrides,
});

describe('sceneStateUtils', () => {
  describe('addWallOptimistic', () => {
    it('should add wall to empty walls array', () => {
      const scene = createMockScene();
      const wall = createMockWall({ index: 1 });

      const result = addWallOptimistic(scene, wall);

      expect(result.walls).toHaveLength(1);
      expect(result.walls[0]).toEqual(wall);
    });

    it('should add wall to existing walls', () => {
      const existingWall = createMockWall({ index: 1 });
      const scene = createMockScene({ walls: [existingWall] });
      const newWall = createMockWall({ index: 2 });

      const result = addWallOptimistic(scene, newWall);

      expect(result.walls).toHaveLength(2);
      expect(result.walls[1]).toEqual(newWall);
    });

    it('should filter out temporary walls (index === -1) before adding', () => {
      const tempWall = createMockWall({ index: -1, name: 'Temp' });
      const permanentWall = createMockWall({ index: 1, name: 'Permanent' });
      const scene = createMockScene({ walls: [permanentWall, tempWall] });
      const newWall = createMockWall({ index: 2, name: 'New' });

      const result = addWallOptimistic(scene, newWall);

      expect(result.walls).toHaveLength(2);
      expect(result.walls.find(w => w.name === 'Temp')).toBeUndefined();
      expect(result.walls.find(w => w.name === 'Permanent')).toBeDefined();
      expect(result.walls.find(w => w.name === 'New')).toBeDefined();
    });

    it('should preserve other scene properties', () => {
      const scene = createMockScene({ name: 'Original Name' });
      const wall = createMockWall({ index: 1 });

      const result = addWallOptimistic(scene, wall);

      expect(result.name).toBe('Original Name');
      expect(result.id).toBe(scene.id);
      expect(result.grid).toEqual(scene.grid);
    });
  });

  describe('updateWallOptimistic', () => {
    it('should update wall by index', () => {
      const wall = createMockWall({ index: 1, name: 'Original' });
      const scene = createMockScene({ walls: [wall] });

      const result = updateWallOptimistic(scene, 1, { name: 'Updated' });

      expect(result.walls[0].name).toBe('Updated');
    });

    it('should return unchanged scene when wall not found', () => {
      const wall = createMockWall({ index: 1 });
      const scene = createMockScene({ walls: [wall] });

      const result = updateWallOptimistic(scene, 99, { name: 'Updated' });

      expect(result).toEqual(scene);
    });

    it('should update only the specified wall', () => {
      const wall1 = createMockWall({ index: 1, name: 'Wall 1' });
      const wall2 = createMockWall({ index: 2, name: 'Wall 2' });
      const scene = createMockScene({ walls: [wall1, wall2] });

      const result = updateWallOptimistic(scene, 2, { name: 'Updated Wall 2' });

      expect(result.walls[0].name).toBe('Wall 1');
      expect(result.walls[1].name).toBe('Updated Wall 2');
    });

    it('should partially update wall properties', () => {
      const wall = createMockWall({ index: 1, name: 'Original', isClosed: false });
      const scene = createMockScene({ walls: [wall] });

      const result = updateWallOptimistic(scene, 1, { isClosed: true });

      expect(result.walls[0].name).toBe('Original');
      expect(result.walls[0].isClosed).toBe(true);
    });
  });

  describe('removeWallOptimistic', () => {
    it('should remove wall by index', () => {
      const wall = createMockWall({ index: 1 });
      const scene = createMockScene({ walls: [wall] });

      const result = removeWallOptimistic(scene, 1);

      expect(result.walls).toHaveLength(0);
    });

    it('should keep other walls when removing one', () => {
      const wall1 = createMockWall({ index: 1, name: 'Wall 1' });
      const wall2 = createMockWall({ index: 2, name: 'Wall 2' });
      const wall3 = createMockWall({ index: 3, name: 'Wall 3' });
      const scene = createMockScene({ walls: [wall1, wall2, wall3] });

      const result = removeWallOptimistic(scene, 2);

      expect(result.walls).toHaveLength(2);
      expect(result.walls.find(w => w.name === 'Wall 1')).toBeDefined();
      expect(result.walls.find(w => w.name === 'Wall 2')).toBeUndefined();
      expect(result.walls.find(w => w.name === 'Wall 3')).toBeDefined();
    });

    it('should return scene unchanged when wall not found', () => {
      const wall = createMockWall({ index: 1 });
      const scene = createMockScene({ walls: [wall] });

      const result = removeWallOptimistic(scene, 99);

      expect(result.walls).toHaveLength(1);
      expect(result.walls[0]).toEqual(wall);
    });
  });

  describe('syncWallIndices', () => {
    it('should update temporary wall indices to real indices', () => {
      const tempWall = createMockWall({ index: -1, name: 'Temp Wall' });
      const scene = createMockScene({ walls: [tempWall] });
      const tempToRealMap = new Map([[-1, 5]]);

      const result = syncWallIndices(scene, tempToRealMap);

      expect(result.walls[0].index).toBe(5);
    });

    it('should not update walls with positive indices', () => {
      const permanentWall = createMockWall({ index: 1 });
      const scene = createMockScene({ walls: [permanentWall] });
      const tempToRealMap = new Map([[-1, 5]]);

      const result = syncWallIndices(scene, tempToRealMap);

      expect(result.walls[0].index).toBe(1);
    });

    it('should handle multiple temp walls', () => {
      const tempWall1 = createMockWall({ index: -1, name: 'Temp 1' });
      const tempWall2 = createMockWall({ index: -2, name: 'Temp 2' });
      const permanentWall = createMockWall({ index: 1, name: 'Permanent' });
      const scene = createMockScene({ walls: [tempWall1, permanentWall, tempWall2] });
      const tempToRealMap = new Map([
        [-1, 10],
        [-2, 11],
      ]);

      const result = syncWallIndices(scene, tempToRealMap);

      expect(result.walls[0].index).toBe(10);
      expect(result.walls[1].index).toBe(1);
      expect(result.walls[2].index).toBe(11);
    });

    it('should preserve walls with temp indices not in map', () => {
      const tempWall = createMockWall({ index: -1 });
      const scene = createMockScene({ walls: [tempWall] });
      const tempToRealMap = new Map([[-2, 5]]);

      const result = syncWallIndices(scene, tempToRealMap);

      expect(result.walls[0].index).toBe(-1);
    });

    it('should handle empty map', () => {
      const tempWall = createMockWall({ index: -1 });
      const scene = createMockScene({ walls: [tempWall] });
      const tempToRealMap = new Map();

      const result = syncWallIndices(scene, tempToRealMap);

      expect(result.walls[0].index).toBe(-1);
    });
  });

  describe('removeTempRegions', () => {
    it('should remove regions with index === -1', () => {
      const tempRegion = createMockRegion({ index: -1, name: 'Temp' });
      const permanentRegion = createMockRegion({ index: 1, name: 'Permanent' });
      const scene = createMockScene({ regions: [tempRegion, permanentRegion] });

      const result = removeTempRegions(scene);

      expect(result.regions).toHaveLength(1);
      expect(result.regions[0].name).toBe('Permanent');
    });

    it('should preserve regions with valid indices', () => {
      const region1 = createMockRegion({ index: 1, name: 'Region 1' });
      const region2 = createMockRegion({ index: 2, name: 'Region 2' });
      const scene = createMockScene({ regions: [region1, region2] });

      const result = removeTempRegions(scene);

      expect(result.regions).toHaveLength(2);
      expect(result.regions).toEqual([region1, region2]);
    });

    it('should return unchanged scene when no temp regions exist', () => {
      const region = createMockRegion({ index: 1 });
      const scene = createMockScene({ regions: [region] });

      const result = removeTempRegions(scene);

      expect(result.regions).toHaveLength(1);
      expect(result.regions[0]).toEqual(region);
    });

    it('should handle scene with all temp regions', () => {
      const tempRegion1 = createMockRegion({ index: -1, name: 'Temp 1' });
      const tempRegion2 = createMockRegion({ index: -1, name: 'Temp 2' });
      const scene = createMockScene({ regions: [tempRegion1, tempRegion2] });

      const result = removeTempRegions(scene);

      expect(result.regions).toHaveLength(0);
    });

    it('should preserve scene metadata', () => {
      const tempRegion = createMockRegion({ index: -1 });
      const scene = createMockScene({
        name: 'Test Scene',
        description: 'Test Description',
        regions: [tempRegion],
      });

      const result = removeTempRegions(scene);

      expect(result.name).toBe('Test Scene');
      expect(result.description).toBe('Test Description');
      expect(result.id).toBe(scene.id);
      expect(result.grid).toEqual(scene.grid);
    });

    it('should handle empty regions array', () => {
      const scene = createMockScene({ regions: [] });

      const result = removeTempRegions(scene);

      expect(result.regions).toHaveLength(0);
    });

    it('should handle mixed temp and permanent regions', () => {
      const temp1 = createMockRegion({ index: -1, name: 'Temp 1' });
      const perm1 = createMockRegion({ index: 1, name: 'Permanent 1' });
      const temp2 = createMockRegion({ index: -1, name: 'Temp 2' });
      const perm2 = createMockRegion({ index: 2, name: 'Permanent 2' });
      const scene = createMockScene({ regions: [temp1, perm1, temp2, perm2] });

      const result = removeTempRegions(scene);

      expect(result.regions).toHaveLength(2);
      expect(result.regions[0].name).toBe('Permanent 1');
      expect(result.regions[1].name).toBe('Permanent 2');
    });
  });

  describe('addRegionOptimistic', () => {
    it('should add region to empty regions array', () => {
      const scene = createMockScene();
      const region = createMockRegion({ index: 1 });

      const result = addRegionOptimistic(scene, region);

      expect(result.regions).toHaveLength(1);
      expect(result.regions[0]).toEqual(region);
    });

    it('should add region and filter temp regions', () => {
      const tempRegion = createMockRegion({ index: -1, name: 'Temp' });
      const permanentRegion = createMockRegion({ index: 1, name: 'Permanent' });
      const scene = createMockScene({ regions: [permanentRegion, tempRegion] });
      const newRegion = createMockRegion({ index: 2, name: 'New' });

      const result = addRegionOptimistic(scene, newRegion);

      expect(result.regions).toHaveLength(2);
      expect(result.regions.find(r => r.name === 'Temp')).toBeUndefined();
      expect(result.regions.find(r => r.name === 'Permanent')).toBeDefined();
      expect(result.regions.find(r => r.name === 'New')).toBeDefined();
    });

    it('should preserve other scene properties', () => {
      const scene = createMockScene({ name: 'Original Scene' });
      const region = createMockRegion({ index: 1 });

      const result = addRegionOptimistic(scene, region);

      expect(result.name).toBe('Original Scene');
      expect(result.id).toBe(scene.id);
    });
  });

  describe('updateRegionOptimistic', () => {
    it('should update region by index', () => {
      const region = createMockRegion({ index: 1, name: 'Original' });
      const scene = createMockScene({ regions: [region] });

      const result = updateRegionOptimistic(scene, 1, { name: 'Updated' });

      expect(result.regions[0].name).toBe('Updated');
    });

    it('should return unchanged scene when region not found', () => {
      const region = createMockRegion({ index: 1 });
      const scene = createMockScene({ regions: [region] });

      const result = updateRegionOptimistic(scene, 99, { name: 'Updated' });

      expect(result).toEqual(scene);
    });

    it('should update only the specified region', () => {
      const region1 = createMockRegion({ index: 1, name: 'Region 1' });
      const region2 = createMockRegion({ index: 2, name: 'Region 2' });
      const scene = createMockScene({ regions: [region1, region2] });

      const result = updateRegionOptimistic(scene, 2, { name: 'Updated Region 2' });

      expect(result.regions[0].name).toBe('Region 1');
      expect(result.regions[1].name).toBe('Updated Region 2');
    });

    it('should partially update region properties', () => {
      const region = createMockRegion({ index: 1, name: 'Original', type: 'difficult-terrain' });
      const scene = createMockScene({ regions: [region] });

      const result = updateRegionOptimistic(scene, 1, { label: 'New Label' });

      expect(result.regions[0].name).toBe('Original');
      expect(result.regions[0].type).toBe('difficult-terrain');
      expect(result.regions[0].label).toBe('New Label');
    });
  });

  describe('removeRegionOptimistic', () => {
    it('should remove region by index', () => {
      const region = createMockRegion({ index: 1 });
      const scene = createMockScene({ regions: [region] });

      const result = removeRegionOptimistic(scene, 1);

      expect(result.regions).toHaveLength(0);
    });

    it('should keep other regions when removing one', () => {
      const region1 = createMockRegion({ index: 1, name: 'Region 1' });
      const region2 = createMockRegion({ index: 2, name: 'Region 2' });
      const region3 = createMockRegion({ index: 3, name: 'Region 3' });
      const scene = createMockScene({ regions: [region1, region2, region3] });

      const result = removeRegionOptimistic(scene, 2);

      expect(result.regions).toHaveLength(2);
      expect(result.regions.find(r => r.name === 'Region 1')).toBeDefined();
      expect(result.regions.find(r => r.name === 'Region 2')).toBeUndefined();
      expect(result.regions.find(r => r.name === 'Region 3')).toBeDefined();
    });

    it('should return scene unchanged when region not found', () => {
      const region = createMockRegion({ index: 1 });
      const scene = createMockScene({ regions: [region] });

      const result = removeRegionOptimistic(scene, 99);

      expect(result.regions).toHaveLength(1);
      expect(result.regions[0]).toEqual(region);
    });
  });

  describe('syncRegionIndices', () => {
    it('should update temporary region indices to real indices', () => {
      const tempRegion = createMockRegion({ index: -1, name: 'Temp Region' });
      const scene = createMockScene({ regions: [tempRegion] });
      const tempToRealMap = new Map([[-1, 5]]);

      const result = syncRegionIndices(scene, tempToRealMap);

      expect(result.regions[0].index).toBe(5);
    });

    it('should not update regions with positive indices', () => {
      const permanentRegion = createMockRegion({ index: 1 });
      const scene = createMockScene({ regions: [permanentRegion] });
      const tempToRealMap = new Map([[-1, 5]]);

      const result = syncRegionIndices(scene, tempToRealMap);

      expect(result.regions[0].index).toBe(1);
    });

    it('should handle multiple temp regions', () => {
      const tempRegion1 = createMockRegion({ index: -1, name: 'Temp 1' });
      const tempRegion2 = createMockRegion({ index: -2, name: 'Temp 2' });
      const permanentRegion = createMockRegion({ index: 1, name: 'Permanent' });
      const scene = createMockScene({ regions: [tempRegion1, permanentRegion, tempRegion2] });
      const tempToRealMap = new Map([
        [-1, 10],
        [-2, 11],
      ]);

      const result = syncRegionIndices(scene, tempToRealMap);

      expect(result.regions[0].index).toBe(10);
      expect(result.regions[1].index).toBe(1);
      expect(result.regions[2].index).toBe(11);
    });

    it('should preserve regions with temp indices not in map', () => {
      const tempRegion = createMockRegion({ index: -1 });
      const scene = createMockScene({ regions: [tempRegion] });
      const tempToRealMap = new Map([[-2, 5]]);

      const result = syncRegionIndices(scene, tempToRealMap);

      expect(result.regions[0].index).toBe(-1);
    });

    it('should handle empty map', () => {
      const tempRegion = createMockRegion({ index: -1 });
      const scene = createMockScene({ regions: [tempRegion] });
      const tempToRealMap = new Map();

      const result = syncRegionIndices(scene, tempToRealMap);

      expect(result.regions[0].index).toBe(-1);
    });
  });

  describe('filterSceneForMergeDetection', () => {
    it('should return null when scene is null', () => {
      const result = filterSceneForMergeDetection(null);

      expect(result).toBeNull();
    });

    it('should filter temporary regions (index === -1)', () => {
      const tempRegion = createMockRegion({ index: -1, name: 'Temp' });
      const permanentRegion = createMockRegion({ index: 1, name: 'Permanent' });
      const scene = createMockScene({ regions: [tempRegion, permanentRegion] });

      const result = filterSceneForMergeDetection(scene);

      expect(result).not.toBeNull();
      expect(result!.regions).toHaveLength(1);
      expect(result!.regions[0].name).toBe('Permanent');
    });

    it('should exclude specific region by index', () => {
      const region1 = createMockRegion({ index: 1, name: 'Region 1' });
      const region2 = createMockRegion({ index: 2, name: 'Region 2' });
      const region3 = createMockRegion({ index: 3, name: 'Region 3' });
      const scene = createMockScene({ regions: [region1, region2, region3] });

      const result = filterSceneForMergeDetection(scene, { excludeRegionIndex: 2 });

      expect(result).not.toBeNull();
      expect(result!.regions).toHaveLength(2);
      expect(result!.regions.find(r => r.name === 'Region 1')).toBeDefined();
      expect(result!.regions.find(r => r.name === 'Region 2')).toBeUndefined();
      expect(result!.regions.find(r => r.name === 'Region 3')).toBeDefined();
    });

    it('should filter temp regions and exclude specific region', () => {
      const tempRegion = createMockRegion({ index: -1, name: 'Temp' });
      const region1 = createMockRegion({ index: 1, name: 'Region 1' });
      const region2 = createMockRegion({ index: 2, name: 'Region 2' });
      const scene = createMockScene({ regions: [tempRegion, region1, region2] });

      const result = filterSceneForMergeDetection(scene, { excludeRegionIndex: 1 });

      expect(result).not.toBeNull();
      expect(result!.regions).toHaveLength(1);
      expect(result!.regions[0].name).toBe('Region 2');
    });

    it('should handle no options (just filters temp regions)', () => {
      const tempRegion = createMockRegion({ index: -1, name: 'Temp' });
      const region1 = createMockRegion({ index: 1, name: 'Region 1' });
      const region2 = createMockRegion({ index: 2, name: 'Region 2' });
      const scene = createMockScene({ regions: [tempRegion, region1, region2] });

      const result = filterSceneForMergeDetection(scene);

      expect(result).not.toBeNull();
      expect(result!.regions).toHaveLength(2);
      expect(result!.regions.find(r => r.name === 'Temp')).toBeUndefined();
    });

    it('should preserve all other region data', () => {
      const region = createMockRegion({
        index: 1,
        name: 'Test Region',
        type: 'difficult-terrain',
        vertices: [
          { x: 10, y: 20 },
          { x: 30, y: 40 },
        ],
        value: 5,
        label: 'Test Label',
        color: '#FF0000',
      });
      const scene = createMockScene({ regions: [region] });

      const result = filterSceneForMergeDetection(scene);

      expect(result).not.toBeNull();
      expect(result!.regions[0]).toEqual(region);
      expect(result!.regions[0].vertices).toEqual(region.vertices);
      expect(result!.regions[0].value).toBe(5);
      expect(result!.regions[0].label).toBe('Test Label');
      expect(result!.regions[0].color).toBe('#FF0000');
    });

    it('should handle empty regions array', () => {
      const scene = createMockScene({ regions: [] });

      const result = filterSceneForMergeDetection(scene);

      expect(result).not.toBeNull();
      expect(result!.regions).toHaveLength(0);
    });

    it('should handle scene with all temp regions', () => {
      const tempRegion1 = createMockRegion({ index: -1, name: 'Temp 1' });
      const tempRegion2 = createMockRegion({ index: -1, name: 'Temp 2' });
      const scene = createMockScene({ regions: [tempRegion1, tempRegion2] });

      const result = filterSceneForMergeDetection(scene);

      expect(result).not.toBeNull();
      expect(result!.regions).toHaveLength(0);
    });

    it('should preserve scene metadata', () => {
      const scene = createMockScene({
        name: 'Test Scene',
        description: 'Test Description',
        grid: {
          type: 1,
          cellSize: { width: 60, height: 60 },
          offset: { left: 10, top: 10 },
          snap: false,
        },
        regions: [createMockRegion({ index: 1 })],
      });

      const result = filterSceneForMergeDetection(scene);

      expect(result).not.toBeNull();
      expect(result!.name).toBe('Test Scene');
      expect(result!.description).toBe('Test Description');
      expect(result!.id).toBe(scene.id);
      expect(result!.grid).toEqual(scene.grid);
    });

    it('should handle excludeRegionIndex with undefined value', () => {
      const region1 = createMockRegion({ index: 1, name: 'Region 1' });
      const region2 = createMockRegion({ index: 2, name: 'Region 2' });
      const scene = createMockScene({ regions: [region1, region2] });

      const result = filterSceneForMergeDetection(scene, { excludeRegionIndex: undefined });

      expect(result).not.toBeNull();
      expect(result!.regions).toHaveLength(2);
    });

    it('should handle excludeRegionIndex with non-existent index', () => {
      const region1 = createMockRegion({ index: 1, name: 'Region 1' });
      const scene = createMockScene({ regions: [region1] });

      const result = filterSceneForMergeDetection(scene, { excludeRegionIndex: 99 });

      expect(result).not.toBeNull();
      expect(result!.regions).toHaveLength(1);
      expect(result!.regions[0].name).toBe('Region 1');
    });

    it('should handle mixed temp, excluded, and valid regions', () => {
      const temp1 = createMockRegion({ index: -1, name: 'Temp 1' });
      const perm1 = createMockRegion({ index: 1, name: 'Permanent 1' });
      const excluded = createMockRegion({ index: 2, name: 'Excluded' });
      const temp2 = createMockRegion({ index: -1, name: 'Temp 2' });
      const perm2 = createMockRegion({ index: 3, name: 'Permanent 2' });
      const scene = createMockScene({ regions: [temp1, perm1, excluded, temp2, perm2] });

      const result = filterSceneForMergeDetection(scene, { excludeRegionIndex: 2 });

      expect(result).not.toBeNull();
      expect(result!.regions).toHaveLength(2);
      expect(result!.regions[0].name).toBe('Permanent 1');
      expect(result!.regions[1].name).toBe('Permanent 2');
    });
  });
});
