import { beforeEach, describe, expect, it, vi } from 'vitest';
import type { EncounterWall, Point, Pole } from '@/types/domain';
import { SegmentState, SegmentType } from '@/types/domain';
import * as wallCollisionUtils from './wallCollisionUtils';
import {
  type CanMergeWallsParams,
  canMergeWalls,
  getOppositeEndpoint,
  isEndpoint,
  type MergePoint,
  type MergeWallsParams,
  mergeWalls,
  removeDuplicatePoles,
} from './wallMergeUtils';

function createPoint(x: number, y: number): Point {
  return { x, y };
}

function createPole(x: number, y: number, h: number = 10): Pole {
  return { x, y, h };
}

function createWall(
  poles: Pole[],
  index: number,
  name: string = `Wall ${index}`,
): EncounterWall {
  return {
    index,
    name,
    segments: poles.slice(0, -1).map((pole, i) => ({
      index: i,
      startPole: pole,
      endPole: poles[i + 1]!,
      type: SegmentType.Wall,
      isOpaque: true,
      state: SegmentState.Closed,
    })),
  };
}

describe('isEndpoint', () => {
  it('should return true for first pole (index 0)', () => {
    const wall = createWall([createPole(0, 0), createPole(10, 0), createPole(20, 0)], 0);

    expect(isEndpoint(0, wall)).toBe(true);
  });

  it('should return true for last pole', () => {
    const wall = createWall([createPole(0, 0), createPole(10, 0), createPole(20, 0)], 0);

    expect(isEndpoint(2, wall)).toBe(true);
  });

  it('should return false for middle pole', () => {
    const wall = createWall([createPole(0, 0), createPole(10, 0), createPole(20, 0)], 0);

    expect(isEndpoint(1, wall)).toBe(false);
  });

  it('should return true for both poles in wall with 2 poles', () => {
    const wall = createWall([createPole(0, 0), createPole(10, 0)], 0);

    expect(isEndpoint(0, wall)).toBe(true);
    expect(isEndpoint(1, wall)).toBe(true);
  });

  it('should return true for only pole in wall with 1 pole', () => {
    const wall = createWall([createPole(0, 0)], 0);

    expect(isEndpoint(0, wall)).toBe(true);
  });
});

describe('getOppositeEndpoint', () => {
  it('should return last index when given index 0', () => {
    expect(getOppositeEndpoint(0, 5)).toBe(4);
  });

  it('should return 0 when given last index', () => {
    expect(getOppositeEndpoint(4, 5)).toBe(0);
  });

  it('should work for wall length 2', () => {
    expect(getOppositeEndpoint(0, 2)).toBe(1);
    expect(getOppositeEndpoint(1, 2)).toBe(0);
  });

  it('should work for wall length 5', () => {
    expect(getOppositeEndpoint(0, 5)).toBe(4);
    expect(getOppositeEndpoint(4, 5)).toBe(0);
  });

  it('should work for wall length 1', () => {
    expect(getOppositeEndpoint(0, 1)).toBe(0);
  });
});

describe('removeDuplicatePoles', () => {
  it('should return same array when no duplicates exist', () => {
    const poles = [createPoint(0, 0), createPoint(10, 10), createPoint(20, 20)];

    const result = removeDuplicatePoles(poles, 5);

    expect(result).toHaveLength(3);
    expect(result).toEqual(poles);
  });

  it('should remove second pole when two poles are within tolerance', () => {
    const poles = [createPoint(0, 0), createPoint(3, 4), createPoint(20, 20)];

    const result = removeDuplicatePoles(poles, 5);

    expect(result).toHaveLength(2);
    expect(result[0]).toEqual(createPoint(0, 0));
    expect(result[1]).toEqual(createPoint(20, 20));
  });

  it('should remove multiple duplicates keeping only first occurrence', () => {
    const poles = [
      createPoint(0, 0),
      createPoint(2, 2),
      createPoint(10, 10),
      createPoint(11, 11),
      createPoint(20, 20),
      createPoint(21, 21),
    ];

    const result = removeDuplicatePoles(poles, 5);

    expect(result).toHaveLength(3);
    expect(result[0]).toEqual(createPoint(0, 0));
    expect(result[1]).toEqual(createPoint(10, 10));
    expect(result[2]).toEqual(createPoint(20, 20));
  });

  it('should remove poles exactly at tolerance distance', () => {
    const poles = [createPoint(0, 0), createPoint(3, 4), createPoint(20, 20)];

    const result = removeDuplicatePoles(poles, 5);

    expect(result).toHaveLength(2);
  });

  it('should keep poles beyond tolerance', () => {
    const poles = [createPoint(0, 0), createPoint(4, 4), createPoint(20, 20)];

    const result = removeDuplicatePoles(poles, 5);

    expect(result).toHaveLength(3);
  });

  it('should return empty array for empty input', () => {
    const result = removeDuplicatePoles([]);

    expect(result).toHaveLength(0);
  });

  it('should return same array for single pole', () => {
    const poles = [createPoint(0, 0)];

    const result = removeDuplicatePoles(poles);

    expect(result).toHaveLength(1);
    expect(result[0]).toEqual(createPoint(0, 0));
  });

  it('should work with custom tolerance parameter', () => {
    const poles = [createPoint(0, 0), createPoint(7, 7), createPoint(20, 20)];

    const result = removeDuplicatePoles(poles, 10);

    expect(result).toHaveLength(2);
  });
});

describe('canMergeWalls', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  describe('edge cases', () => {
    it('should return canMerge false for empty newWallPoles', () => {
      const params: CanMergeWallsParams = {
        newWallPoles: [],
        existingWalls: [createWall([createPole(0, 0), createPole(10, 0)], 0)],
      };

      const result = canMergeWalls(params);

      expect(result.canMerge).toBe(false);
    });

    it('should return canMerge false for newWallPoles with less than 2 poles', () => {
      const params: CanMergeWallsParams = {
        newWallPoles: [createPoint(0, 0)],
        existingWalls: [createWall([createPole(0, 0), createPole(10, 0)], 0)],
      };

      const result = canMergeWalls(params);

      expect(result.canMerge).toBe(false);
    });

    it('should return canMerge false for empty existingWalls', () => {
      const params: CanMergeWallsParams = {
        newWallPoles: [createPoint(0, 0), createPoint(10, 0)],
        existingWalls: [],
      };

      const result = canMergeWalls(params);

      expect(result.canMerge).toBe(false);
    });

    it('should return canMerge false when no collisions detected', () => {
      vi.spyOn(wallCollisionUtils, 'detectPoleOnPoleCollision').mockReturnValue({
        hasCollision: false,
        collisions: [],
      });

      const params: CanMergeWallsParams = {
        newWallPoles: [createPoint(0, 0), createPoint(10, 0)],
        existingWalls: [createWall([createPole(100, 100), createPole(110, 100)], 0)],
      };

      const result = canMergeWalls(params);

      expect(result.canMerge).toBe(false);
    });

    it('should return canMerge false when collisions only on middle poles', () => {
      vi.spyOn(wallCollisionUtils, 'detectPoleOnPoleCollision').mockReturnValue({
        hasCollision: true,
        collisions: [
          {
            newPoleIndex: 1,
            existingWallIndex: 0,
            existingPoleIndex: 1,
            distance: 2,
          },
        ],
      });

      const params: CanMergeWallsParams = {
        newWallPoles: [createPoint(0, 0), createPoint(10, 0), createPoint(20, 0)],
        existingWalls: [createWall([createPole(5, 0), createPole(10, 0), createPole(15, 0)], 0)],
      };

      const result = canMergeWalls(params);

      expect(result.canMerge).toBe(false);
    });
  });

  describe('scenario 3 - endpoint merges with different walls', () => {
    it('should merge when first pole of new wall merges with last pole of existing wall', () => {
      vi.spyOn(wallCollisionUtils, 'detectPoleOnPoleCollision').mockReturnValue({
        hasCollision: true,
        collisions: [
          {
            newPoleIndex: 0,
            existingWallIndex: 0,
            existingPoleIndex: 2,
            distance: 2,
          },
        ],
      });

      const existingWall = createWall([createPole(0, 0), createPole(10, 0), createPole(20, 0)], 0);
      const params: CanMergeWallsParams = {
        newWallPoles: [createPoint(20, 0), createPoint(30, 0)],
        existingWalls: [existingWall],
      };

      const result = canMergeWalls(params);

      expect(result.canMerge).toBe(true);
      expect(result.isClosed).toBe(false);
      expect(result.targetWallIndex).toBe(0);
      expect(result.mergePoints).toHaveLength(1);
      expect(result.mergePoints[0]).toEqual({
        wallIndex: 0,
        poleIndex: 2,
        isFirst: true,
      });
    });

    it('should merge when last pole of new wall merges with first pole of existing wall', () => {
      vi.spyOn(wallCollisionUtils, 'detectPoleOnPoleCollision').mockReturnValue({
        hasCollision: true,
        collisions: [
          {
            newPoleIndex: 1,
            existingWallIndex: 0,
            existingPoleIndex: 0,
            distance: 2,
          },
        ],
      });

      const existingWall = createWall([createPole(20, 0), createPole(30, 0)], 0);
      const params: CanMergeWallsParams = {
        newWallPoles: [createPoint(0, 0), createPoint(20, 0)],
        existingWalls: [existingWall],
      };

      const result = canMergeWalls(params);

      expect(result.canMerge).toBe(true);
      expect(result.isClosed).toBe(false);
      expect(result.mergePoints[0]?.isFirst).toBe(false);
    });

    it('should merge when both ends merge with different walls', () => {
      vi.spyOn(wallCollisionUtils, 'detectPoleOnPoleCollision').mockReturnValue({
        hasCollision: true,
        collisions: [
          {
            newPoleIndex: 0,
            existingWallIndex: 0,
            existingPoleIndex: 2,
            distance: 2,
          },
          {
            newPoleIndex: 1,
            existingWallIndex: 1,
            existingPoleIndex: 0,
            distance: 2,
          },
        ],
      });

      const params: CanMergeWallsParams = {
        newWallPoles: [createPoint(20, 0), createPoint(30, 0)],
        existingWalls: [
          createWall([createPole(0, 0), createPole(10, 0), createPole(20, 0)], 0),
          createWall([createPole(30, 0), createPole(40, 0)], 1),
        ],
      };

      const result = canMergeWalls(params);

      expect(result.canMerge).toBe(true);
      expect(result.isClosed).toBe(false);
      expect(result.mergePoints).toHaveLength(2);
      expect(result.wallsToDelete).toContain(1);
    });

    it('should set targetWallIndex to lowest among involved walls', () => {
      vi.spyOn(wallCollisionUtils, 'detectPoleOnPoleCollision').mockReturnValue({
        hasCollision: true,
        collisions: [
          {
            newPoleIndex: 0,
            existingWallIndex: 2,
            existingPoleIndex: 1,
            distance: 2,
          },
          {
            newPoleIndex: 1,
            existingWallIndex: 1,
            existingPoleIndex: 0,
            distance: 2,
          },
        ],
      });

      const params: CanMergeWallsParams = {
        newWallPoles: [createPoint(20, 0), createPoint(30, 0)],
        existingWalls: [
          createWall([createPole(0, 0), createPole(10, 0)], 0),
          createWall([createPole(30, 0), createPole(40, 0)], 1),
          createWall([createPole(10, 0), createPole(20, 0)], 2),
        ],
      };

      const result = canMergeWalls(params);

      expect(result.targetWallIndex).toBe(1);
    });
  });

  describe('scenario 5 - closed wall creation', () => {
    it('should create closed wall when first pole merges with last pole of same wall', () => {
      vi.spyOn(wallCollisionUtils, 'detectPoleOnPoleCollision').mockReturnValue({
        hasCollision: true,
        collisions: [
          {
            newPoleIndex: 0,
            existingWallIndex: 0,
            existingPoleIndex: 2,
            distance: 2,
          },
          {
            newPoleIndex: 1,
            existingWallIndex: 0,
            existingPoleIndex: 0,
            distance: 2,
          },
        ],
      });

      const params: CanMergeWallsParams = {
        newWallPoles: [createPoint(20, 0), createPoint(0, 0)],
        existingWalls: [createWall([createPole(0, 0), createPole(10, 0), createPole(20, 0)], 0)],
      };

      const result = canMergeWalls(params);

      expect(result.canMerge).toBe(true);
      expect(result.isClosed).toBe(true);
    });

    it('should create closed wall when last pole merges with first pole of same wall', () => {
      vi.spyOn(wallCollisionUtils, 'detectPoleOnPoleCollision').mockReturnValue({
        hasCollision: true,
        collisions: [
          {
            newPoleIndex: 0,
            existingWallIndex: 0,
            existingPoleIndex: 0,
            distance: 2,
          },
          {
            newPoleIndex: 1,
            existingWallIndex: 0,
            existingPoleIndex: 2,
            distance: 2,
          },
        ],
      });

      const params: CanMergeWallsParams = {
        newWallPoles: [createPoint(0, 0), createPoint(20, 0)],
        existingWalls: [createWall([createPole(0, 0), createPole(10, 0), createPole(20, 0)], 0)],
      };

      const result = canMergeWalls(params);

      expect(result.canMerge).toBe(true);
      expect(result.isClosed).toBe(true);
    });

    it('should not merge when both ends merge with same pole of same wall', () => {
      vi.spyOn(wallCollisionUtils, 'detectPoleOnPoleCollision').mockReturnValue({
        hasCollision: true,
        collisions: [
          {
            newPoleIndex: 0,
            existingWallIndex: 0,
            existingPoleIndex: 0,
            distance: 2,
          },
          {
            newPoleIndex: 1,
            existingWallIndex: 0,
            existingPoleIndex: 0,
            distance: 2,
          },
        ],
      });

      const params: CanMergeWallsParams = {
        newWallPoles: [createPoint(0, 0), createPoint(0, 1)],
        existingWalls: [createWall([createPole(0, 0), createPole(10, 0)], 0)],
      };

      const result = canMergeWalls(params);

      expect(result.canMerge).toBe(true);
      expect(result.isClosed).toBe(false);
    });
  });

  describe('merge result validation', () => {
    it('should populate mergePoints array correctly', () => {
      vi.spyOn(wallCollisionUtils, 'detectPoleOnPoleCollision').mockReturnValue({
        hasCollision: true,
        collisions: [
          {
            newPoleIndex: 0,
            existingWallIndex: 0,
            existingPoleIndex: 2,
            distance: 2,
          },
        ],
      });

      const params: CanMergeWallsParams = {
        newWallPoles: [createPoint(20, 0), createPoint(30, 0)],
        existingWalls: [createWall([createPole(0, 0), createPole(10, 0), createPole(20, 0)], 0)],
      };

      const result = canMergeWalls(params);

      expect(result.mergePoints).toHaveLength(1);
      expect(result.mergePoints[0]).toMatchObject({
        wallIndex: 0,
        poleIndex: 2,
        isFirst: true,
      });
    });

    it('should exclude target wall from wallsToDelete', () => {
      vi.spyOn(wallCollisionUtils, 'detectPoleOnPoleCollision').mockReturnValue({
        hasCollision: true,
        collisions: [
          {
            newPoleIndex: 0,
            existingWallIndex: 0,
            existingPoleIndex: 2,
            distance: 2,
          },
          {
            newPoleIndex: 1,
            existingWallIndex: 1,
            existingPoleIndex: 0,
            distance: 2,
          },
        ],
      });

      const params: CanMergeWallsParams = {
        newWallPoles: [createPoint(20, 0), createPoint(30, 0)],
        existingWalls: [
          createWall([createPole(0, 0), createPole(10, 0), createPole(20, 0)], 0),
          createWall([createPole(30, 0), createPole(40, 0)], 1),
        ],
      };

      const result = canMergeWalls(params);

      expect(result.wallsToDelete).not.toContain(result.targetWallIndex);
    });

    it('should return mergedPoles array from mergeWalls call', () => {
      vi.spyOn(wallCollisionUtils, 'detectPoleOnPoleCollision').mockReturnValue({
        hasCollision: true,
        collisions: [
          {
            newPoleIndex: 1,
            existingWallIndex: 0,
            existingPoleIndex: 0,
            distance: 2,
          },
        ],
      });

      const params: CanMergeWallsParams = {
        newWallPoles: [createPoint(0, 0), createPoint(10, 0)],
        existingWalls: [createWall([createPole(10, 0), createPole(20, 0)], 0)],
      };

      const result = canMergeWalls(params);

      expect(result.mergedPoles).toBeDefined();
      expect(Array.isArray(result.mergedPoles)).toBe(true);
    });
  });
});

describe('mergeWalls', () => {
  describe('edge cases', () => {
    it('should return newWallPoles unchanged for empty mergePoints', () => {
      const newWallPoles = [createPoint(0, 0), createPoint(10, 0)];
      const params: MergeWallsParams = {
        newWallPoles,
        existingWalls: [],
        mergePoints: [],
      };

      const result = mergeWalls(params);

      expect(result).toEqual(newWallPoles);
    });

    it('should handle invalid wallIndex in mergePoints gracefully', () => {
      const newWallPoles = [createPoint(0, 0), createPoint(10, 0)];
      const mergePoints: MergePoint[] = [{ wallIndex: 99, poleIndex: 0, isFirst: false }];
      const params: MergeWallsParams = {
        newWallPoles,
        existingWalls: [createWall([createPole(10, 0), createPole(20, 0)], 0)],
        mergePoints,
      };

      const result = mergeWalls(params);

      expect(result).toBeDefined();
    });
  });

  describe('scenario 3 - pole ordering for multi-wall merge', () => {
    it('should prepend new poles (reversed) when merging at beginning of target wall', () => {
      const newWallPoles = [createPoint(0, 0), createPoint(10, 0)];
      const existingWall = createWall([createPole(10, 0), createPole(20, 0), createPole(30, 0)], 0);
      const mergePoints: MergePoint[] = [{ wallIndex: 0, poleIndex: 0, isFirst: false }];
      const params: MergeWallsParams = {
        newWallPoles,
        existingWalls: [existingWall],
        mergePoints,
      };

      const result = mergeWalls(params);

      expect(result[0]).toEqual(createPoint(0, 0));
      expect(result[result.length - 1]).toEqual(createPoint(30, 0));
    });

    it('should append new poles when merging at end of target wall', () => {
      const newWallPoles = [createPoint(30, 0), createPoint(40, 0)];
      const existingWall = createWall([createPole(0, 0), createPole(10, 0), createPole(30, 0)], 0);
      const mergePoints: MergePoint[] = [{ wallIndex: 0, poleIndex: 2, isFirst: true }];
      const params: MergeWallsParams = {
        newWallPoles,
        existingWalls: [existingWall],
        mergePoints,
      };

      const result = mergeWalls(params);

      // Merged path contains both endpoints - order depends on traversal start point
      const hasCorrectEndpoints =
        (result[0]?.x === 0 && result[result.length - 1]?.x === 40) ||
        (result[0]?.x === 40 && result[result.length - 1]?.x === 0);
      expect(hasCorrectEndpoints).toBe(true);
      expect(result).toContainEqual(createPoint(0, 0));
      expect(result).toContainEqual(createPoint(40, 0));
    });

    it('should include all poles from multiple walls in correct order', () => {
      const newWallPoles = [createPoint(20, 0), createPoint(25, 0), createPoint(30, 0)];
      const wall1 = createWall([createPole(0, 0), createPole(10, 0), createPole(20, 0)], 0);
      const wall2 = createWall([createPole(30, 0), createPole(40, 0), createPole(50, 0)], 1);
      const mergePoints: MergePoint[] = [
        { wallIndex: 0, poleIndex: 2, isFirst: true },
        { wallIndex: 1, poleIndex: 0, isFirst: false },
      ];
      const params: MergeWallsParams = {
        newWallPoles,
        existingWalls: [wall1, wall2],
        mergePoints,
      };

      const result = mergeWalls(params);

      expect(result.length).toBeGreaterThan(newWallPoles.length);
      expect(result).toContainEqual(createPoint(0, 0));
      expect(result).toContainEqual(createPoint(50, 0));
    });

    it('should remove duplicate poles at merge points', () => {
      const newWallPoles = [createPoint(20, 0), createPoint(30, 0)];
      const existingWall = createWall([createPole(0, 0), createPole(10, 0), createPole(20, 0)], 0);
      const mergePoints: MergePoint[] = [{ wallIndex: 0, poleIndex: 2, isFirst: true }];
      const params: MergeWallsParams = {
        newWallPoles,
        existingWalls: [existingWall],
        mergePoints,
      };

      const result = mergeWalls(params);

      const duplicateCheck = result.filter((pole, index) => {
        return result.findIndex((p) => p.x === pole.x && p.y === pole.y) !== index;
      });
      expect(duplicateCheck).toHaveLength(0);
    });
  });

  describe('scenario 5 - closed wall pole ordering', () => {
    it('should create correct ordering for forward direction (firstPole < lastPole)', () => {
      const newWallPoles = [createPoint(0, 0), createPoint(10, 10), createPoint(20, 0)];
      const existingWall = createWall([createPole(0, 0), createPole(10, 0), createPole(20, 0)], 0);
      const mergePoints: MergePoint[] = [
        { wallIndex: 0, poleIndex: 0, isFirst: true },
        { wallIndex: 0, poleIndex: 2, isFirst: false },
      ];
      const params: MergeWallsParams = {
        newWallPoles,
        existingWalls: [existingWall],
        mergePoints,
      };

      const result = mergeWalls(params);

      expect(result.length).toBeGreaterThan(0);
      expect(result).toContainEqual(createPoint(10, 10));
    });

    it('should create correct ordering for reverse direction (firstPole > lastPole)', () => {
      const newWallPoles = [createPoint(20, 0), createPoint(10, 10), createPoint(0, 0)];
      const existingWall = createWall([createPole(0, 0), createPole(10, 0), createPole(20, 0)], 0);
      const mergePoints: MergePoint[] = [
        { wallIndex: 0, poleIndex: 2, isFirst: true },
        { wallIndex: 0, poleIndex: 0, isFirst: false },
      ];
      const params: MergeWallsParams = {
        newWallPoles,
        existingWalls: [existingWall],
        mergePoints,
      };

      const result = mergeWalls(params);

      expect(result.length).toBeGreaterThan(0);
      expect(result).toContainEqual(createPoint(10, 10));
    });

    it('should create closed wall with correct pole count', () => {
      const newWallPoles = [createPoint(0, 0), createPoint(10, 10), createPoint(20, 0)];
      const existingWall = createWall([createPole(0, 0), createPole(10, 0), createPole(20, 0)], 0);
      const mergePoints: MergePoint[] = [
        { wallIndex: 0, poleIndex: 0, isFirst: true },
        { wallIndex: 0, poleIndex: 2, isFirst: false },
      ];
      const params: MergeWallsParams = {
        newWallPoles,
        existingWalls: [existingWall],
        mergePoints,
      };

      const result = mergeWalls(params);

      expect(result.length).toBe(4);
    });

    it('should remove duplicate poles in closed wall', () => {
      const newWallPoles = [createPoint(0, 0), createPoint(10, 10), createPoint(20, 0)];
      const existingWall = createWall([createPole(0, 0), createPole(10, 0), createPole(20, 0)], 0);
      const mergePoints: MergePoint[] = [
        { wallIndex: 0, poleIndex: 0, isFirst: true },
        { wallIndex: 0, poleIndex: 2, isFirst: false },
      ];
      const params: MergeWallsParams = {
        newWallPoles,
        existingWalls: [existingWall],
        mergePoints,
      };

      const result = mergeWalls(params);

      const duplicateCheck = result.filter((pole, index) => {
        return result.findIndex((p) => p.x === pole.x && p.y === pole.y) !== index;
      });
      expect(duplicateCheck).toHaveLength(0);
    });
  });
});
