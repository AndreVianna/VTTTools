import { describe, expect, it } from 'vitest';
import type { EncounterWall, Point, Pole } from '@/types/domain';
import { WallVisibility } from '@/types/domain';
import {
  calculateDistanceAlongEdge,
  detectSplitPoints,
  type SplitPoint,
  sortSplitPoints,
  splitWallAtPoints,
} from './wallSplitUtils';

function createPoint(x: number, y: number): Point {
  return { x, y };
}

function createPole(x: number, y: number, h: number = 10): Pole {
  return { x, y, h };
}

function createWall(
  poles: Pole[],
  index: number,
  isClosed: boolean = false,
  name: string = `Wall ${index}`,
): EncounterWall {
  return {
    index,
    poles,
    isClosed,
    encounterId: 'test-encounter',
    name,
    visibility: WallVisibility.Normal,
  };
}

describe('calculateDistanceAlongEdge', () => {
  it('should return 0 for point at edge start', () => {
    const point = createPoint(0, 0);
    const edgeStart = createPoint(0, 0);
    const edgeEnd = createPoint(100, 0);

    const distance = calculateDistanceAlongEdge(point, edgeStart, edgeEnd);

    expect(distance).toBe(0);
  });

  it('should return edge length for point at edge end', () => {
    const point = createPoint(100, 0);
    const edgeStart = createPoint(0, 0);
    const edgeEnd = createPoint(100, 0);

    const distance = calculateDistanceAlongEdge(point, edgeStart, edgeEnd);

    expect(distance).toBe(100);
  });

  it('should return half edge length for point at midpoint', () => {
    const point = createPoint(50, 0);
    const edgeStart = createPoint(0, 0);
    const edgeEnd = createPoint(100, 0);

    const distance = calculateDistanceAlongEdge(point, edgeStart, edgeEnd);

    expect(distance).toBe(50);
  });

  it('should calculate distance on horizontal edge', () => {
    const point = createPoint(75, 0);
    const edgeStart = createPoint(0, 0);
    const edgeEnd = createPoint(100, 0);

    const distance = calculateDistanceAlongEdge(point, edgeStart, edgeEnd);

    expect(distance).toBe(75);
  });

  it('should calculate distance on vertical edge', () => {
    const point = createPoint(0, 50);
    const edgeStart = createPoint(0, 0);
    const edgeEnd = createPoint(0, 100);

    const distance = calculateDistanceAlongEdge(point, edgeStart, edgeEnd);

    expect(distance).toBe(50);
  });

  it('should calculate distance on diagonal edge', () => {
    const point = createPoint(50, 50);
    const edgeStart = createPoint(0, 0);
    const edgeEnd = createPoint(100, 100);

    const distance = calculateDistanceAlongEdge(point, edgeStart, edgeEnd);

    expect(distance).toBeCloseTo(70.71, 1);
  });

  it('should clamp distance to 0 for point before edge start', () => {
    const point = createPoint(-10, 0);
    const edgeStart = createPoint(0, 0);
    const edgeEnd = createPoint(100, 0);

    const distance = calculateDistanceAlongEdge(point, edgeStart, edgeEnd);

    expect(distance).toBe(0);
  });

  it('should clamp distance to edge length for point after edge end', () => {
    const point = createPoint(150, 0);
    const edgeStart = createPoint(0, 0);
    const edgeEnd = createPoint(100, 0);

    const distance = calculateDistanceAlongEdge(point, edgeStart, edgeEnd);

    expect(distance).toBe(100);
  });

  it('should return 0 for zero-length edge', () => {
    const point = createPoint(50, 50);
    const edgeStart = createPoint(0, 0);
    const edgeEnd = createPoint(0, 0);

    const distance = calculateDistanceAlongEdge(point, edgeStart, edgeEnd);

    expect(distance).toBe(0);
  });
});

describe('sortSplitPoints', () => {
  it('should return empty array for empty input', () => {
    const wall = createWall([createPole(0, 0), createPole(100, 0)], 0);

    const result = sortSplitPoints([], wall);

    expect(result).toEqual([]);
  });

  it('should return single split point unchanged', () => {
    const wall = createWall([createPole(0, 0), createPole(100, 0)], 0);
    const splits: SplitPoint[] = [
      {
        wallIndex: 0,
        edgeIndex: 0,
        splitPosition: { x: 50, y: 0 },
        splitType: 'intersection',
      },
    ];

    const result = sortSplitPoints(splits, wall);

    expect(result).toEqual(splits);
    expect(result).not.toBe(splits);
  });

  it('should sort splits by edge index', () => {
    const wall = createWall([createPole(0, 0), createPole(100, 0), createPole(100, 100), createPole(0, 100)], 0);
    const splits: SplitPoint[] = [
      {
        wallIndex: 0,
        edgeIndex: 2,
        splitPosition: { x: 50, y: 100 },
        splitType: 'intersection',
      },
      {
        wallIndex: 0,
        edgeIndex: 0,
        splitPosition: { x: 50, y: 0 },
        splitType: 'intersection',
      },
      {
        wallIndex: 0,
        edgeIndex: 1,
        splitPosition: { x: 100, y: 50 },
        splitType: 'intersection',
      },
    ];

    const result = sortSplitPoints(splits, wall);

    expect(result[0]?.edgeIndex).toBe(0);
    expect(result[1]?.edgeIndex).toBe(1);
    expect(result[2]?.edgeIndex).toBe(2);
  });

  it('should sort multiple splits on same edge by distance along edge', () => {
    const wall = createWall([createPole(0, 0), createPole(100, 0), createPole(100, 100)], 0);
    const splits: SplitPoint[] = [
      {
        wallIndex: 0,
        edgeIndex: 0,
        splitPosition: { x: 75, y: 0 },
        splitType: 'intersection',
      },
      {
        wallIndex: 0,
        edgeIndex: 0,
        splitPosition: { x: 25, y: 0 },
        splitType: 'pole-on-edge',
      },
    ];

    const result = sortSplitPoints(splits, wall);

    expect(result[0]?.splitPosition.x).toBe(25);
    expect(result[1]?.splitPosition.x).toBe(75);
  });

  it('should handle mixed scenario with multiple edges and multiple splits per edge', () => {
    const wall = createWall([createPole(0, 0), createPole(100, 0), createPole(100, 100)], 0);
    const splits: SplitPoint[] = [
      {
        wallIndex: 0,
        edgeIndex: 1,
        splitPosition: { x: 100, y: 75 },
        splitType: 'intersection',
      },
      {
        wallIndex: 0,
        edgeIndex: 0,
        splitPosition: { x: 75, y: 0 },
        splitType: 'intersection',
      },
      {
        wallIndex: 0,
        edgeIndex: 1,
        splitPosition: { x: 100, y: 25 },
        splitType: 'pole-on-edge',
      },
      {
        wallIndex: 0,
        edgeIndex: 0,
        splitPosition: { x: 25, y: 0 },
        splitType: 'pole-on-edge',
      },
    ];

    const result = sortSplitPoints(splits, wall);

    expect(result[0]?.edgeIndex).toBe(0);
    expect(result[0]?.splitPosition.x).toBe(25);
    expect(result[1]?.edgeIndex).toBe(0);
    expect(result[1]?.splitPosition.x).toBe(75);
    expect(result[2]?.edgeIndex).toBe(1);
    expect(result[2]?.splitPosition.y).toBe(25);
    expect(result[3]?.edgeIndex).toBe(1);
    expect(result[3]?.splitPosition.y).toBe(75);
  });

  it('should return new array without mutating input', () => {
    const wall = createWall([createPole(0, 0), createPole(100, 0)], 0);
    const splits: SplitPoint[] = [
      {
        wallIndex: 0,
        edgeIndex: 0,
        splitPosition: { x: 75, y: 0 },
        splitType: 'intersection',
      },
      {
        wallIndex: 0,
        edgeIndex: 0,
        splitPosition: { x: 25, y: 0 },
        splitType: 'pole-on-edge',
      },
    ];
    const originalOrder = [...splits];

    const result = sortSplitPoints(splits, wall);

    expect(result).not.toBe(splits);
    expect(splits).toEqual(originalOrder);
  });
});

describe('detectSplitPoints', () => {
  describe('edge-on-edge intersection', () => {
    it('should detect X-intersection between new and existing wall', () => {
      const newWallPoles: Point[] = [createPoint(50, 0), createPoint(50, 100)];
      const existingWalls: EncounterWall[] = [createWall([createPole(0, 50), createPole(100, 50)], 0)];

      const result = detectSplitPoints({ newWallPoles, existingWalls });

      expect(result.needsSplit).toBe(true);
      expect(result.splits.length).toBeGreaterThan(0);
      const splitOnExisting = result.splits.find((s) => s.wallIndex === 0);
      expect(splitOnExisting).toBeDefined();
      expect(splitOnExisting?.edgeIndex).toBe(0);
      expect(splitOnExisting?.splitPosition.x).toBeCloseTo(50, 1);
      expect(splitOnExisting?.splitPosition.y).toBeCloseTo(50, 1);
      expect(splitOnExisting?.splitType).toBe('intersection');
    });

    it('should detect multiple intersections when new wall crosses multiple existing walls', () => {
      const newWallPoles: Point[] = [createPoint(50, 0), createPoint(50, 100)];
      const existingWalls: EncounterWall[] = [
        createWall([createPole(0, 25), createPole(100, 25)], 0),
        createWall([createPole(0, 75), createPole(100, 75)], 1),
      ];

      const result = detectSplitPoints({ newWallPoles, existingWalls });

      expect(result.needsSplit).toBe(true);
      expect(result.splits.length).toBeGreaterThanOrEqual(2);
      expect(result.affectedWallIndices).toContain(0);
      expect(result.affectedWallIndices).toContain(1);
    });

    it('should not detect intersection for parallel walls', () => {
      const newWallPoles: Point[] = [createPoint(0, 0), createPoint(100, 0)];
      const existingWalls: EncounterWall[] = [createWall([createPole(0, 50), createPole(100, 50)], 0)];

      const result = detectSplitPoints({ newWallPoles, existingWalls });

      expect(result.needsSplit).toBe(false);
      expect(result.splits).toHaveLength(0);
    });

    it('should not detect intersection for non-overlapping walls', () => {
      const newWallPoles: Point[] = [createPoint(0, 0), createPoint(10, 0)];
      const existingWalls: EncounterWall[] = [createWall([createPole(50, 0), createPole(60, 0)], 0)];

      const result = detectSplitPoints({ newWallPoles, existingWalls });

      expect(result.needsSplit).toBe(false);
    });
  });

  describe('pole-on-edge collision', () => {
    it('should detect single pole landing on existing wall edge', () => {
      const newWallPoles: Point[] = [createPoint(50, 3), createPoint(100, 0)];
      const existingWalls: EncounterWall[] = [createWall([createPole(0, 0), createPole(100, 0)], 0)];

      const result = detectSplitPoints({ newWallPoles, existingWalls });

      expect(result.needsSplit).toBe(true);
      expect(result.splits.length).toBeGreaterThan(0);
      const split = result.splits.find((s) => s.splitType === 'pole-on-edge');
      expect(split).toBeDefined();
    });

    it('should detect multiple poles landing on same edge', () => {
      const newWallPoles: Point[] = [createPoint(25, 3), createPoint(50, 3), createPoint(75, 3)];
      const existingWalls: EncounterWall[] = [createWall([createPole(0, 0), createPole(100, 0)], 0)];

      const result = detectSplitPoints({ newWallPoles, existingWalls });

      expect(result.needsSplit).toBe(true);
      expect(result.splits.filter((s) => s.wallIndex === 0).length).toBeGreaterThanOrEqual(2);
    });

    it('should detect multiple poles landing on different edges', () => {
      const newWallPoles: Point[] = [createPoint(50, 3), createPoint(103, 50)];
      const existingWalls: EncounterWall[] = [
        createWall([createPole(0, 0), createPole(100, 0), createPole(100, 100)], 0),
      ];

      const result = detectSplitPoints({ newWallPoles, existingWalls });

      expect(result.needsSplit).toBe(true);
      const edge0Split = result.splits.find((s) => s.edgeIndex === 0);
      const edge1Split = result.splits.find((s) => s.edgeIndex === 1);
      expect(edge0Split).toBeDefined();
      expect(edge1Split).toBeDefined();
    });

    it('should detect pole on edge of closed wall including wrapping edge', () => {
      const newWallPoles: Point[] = [createPoint(50, 53)];
      const existingWalls: EncounterWall[] = [
        createWall([createPole(0, 50), createPole(100, 50), createPole(100, 150), createPole(0, 150)], 0, true),
      ];

      const result = detectSplitPoints({ newWallPoles, existingWalls });

      expect(result.needsSplit).toBe(true);
    });
  });

  describe('combined scenarios', () => {
    it('should detect both edge-on-edge and pole-on-edge splits', () => {
      const newWallPoles: Point[] = [createPoint(25, 3), createPoint(50, 50)];
      const existingWalls: EncounterWall[] = [
        createWall([createPole(0, 0), createPole(100, 0)], 0),
        createWall([createPole(0, 50), createPole(100, 50)], 1),
      ];

      const result = detectSplitPoints({ newWallPoles, existingWalls });

      expect(result.needsSplit).toBe(true);
      const intersectionSplits = result.splits.filter((s) => s.splitType === 'intersection');
      const poleOnEdgeSplits = result.splits.filter((s) => s.splitType === 'pole-on-edge');
      expect(intersectionSplits.length).toBeGreaterThan(0);
      expect(poleOnEdgeSplits.length).toBeGreaterThan(0);
    });

    it('should deduplicate splits detected by both methods', () => {
      const newWallPoles: Point[] = [createPoint(0, 50), createPoint(100, 50)];
      const existingWalls: EncounterWall[] = [createWall([createPole(50, 0), createPole(50, 100)], 0)];

      const result = detectSplitPoints({ newWallPoles, existingWalls });

      expect(result.needsSplit).toBe(true);
      const splitsAtIntersection = result.splits.filter(
        (s) => Math.abs(s.splitPosition.x - 50) < 1 && Math.abs(s.splitPosition.y - 50) < 1,
      );
      expect(splitsAtIntersection.length).toBe(1);
    });
  });

  describe('edge cases', () => {
    it('should return needsSplit false for empty newWallPoles array', () => {
      const existingWalls: EncounterWall[] = [createWall([createPole(0, 0), createPole(100, 0)], 0)];

      const result = detectSplitPoints({ newWallPoles: [], existingWalls });

      expect(result.needsSplit).toBe(false);
      expect(result.splits).toHaveLength(0);
    });

    it('should return needsSplit false for empty existingWalls array', () => {
      const newWallPoles: Point[] = [createPoint(0, 0), createPoint(100, 0)];

      const result = detectSplitPoints({ newWallPoles, existingWalls: [] });

      expect(result.needsSplit).toBe(false);
    });

    it('should return needsSplit false for newWallPoles with less than 2 poles', () => {
      const newWallPoles: Point[] = [createPoint(50, 50)];
      const existingWalls: EncounterWall[] = [createWall([createPole(0, 0), createPole(100, 0)], 0)];

      const result = detectSplitPoints({ newWallPoles, existingWalls });

      expect(result.needsSplit).toBe(false);
    });

    it('should filter out split point very close to existing pole', () => {
      const newWallPoles: Point[] = [createPoint(0, 0), createPoint(100, 0)];
      const existingWalls: EncounterWall[] = [createWall([createPole(50, 2), createPole(50, 100)], 0)];

      const result = detectSplitPoints({
        newWallPoles,
        existingWalls,
        tolerance: 5,
      });

      const splitsNearPole = result.splits.filter(
        (s) => Math.abs(s.splitPosition.x - 50) < 5 && Math.abs(s.splitPosition.y - 0) < 5,
      );
      expect(splitsNearPole).toHaveLength(0);
    });

    it('should use custom tolerance parameter', () => {
      const newWallPoles: Point[] = [createPoint(50, 8)];
      const existingWalls: EncounterWall[] = [createWall([createPole(0, 0), createPole(100, 0)], 0)];

      const resultDefault = detectSplitPoints({ newWallPoles, existingWalls });
      const resultCustom = detectSplitPoints({
        newWallPoles,
        existingWalls,
        tolerance: 10,
      });

      expect(resultDefault.needsSplit).toBe(false);
      expect(resultCustom.needsSplit).toBe(true);
    });

    it('should populate affectedWallIndices correctly and sort them', () => {
      const newWallPoles: Point[] = [createPoint(50, 0), createPoint(50, 100)];
      const existingWalls: EncounterWall[] = [
        createWall([createPole(0, 25), createPole(100, 25)], 5),
        createWall([createPole(0, 50), createPole(100, 50)], 2),
        createWall([createPole(0, 75), createPole(100, 75)], 0),
      ];

      const result = detectSplitPoints({ newWallPoles, existingWalls });

      expect(result.affectedWallIndices).toEqual([0, 1, 2]);
      expect(result.affectedWallIndices.length).toBe(3);
      expect(result.splits.every((s) => s.wallIndex >= 0 && s.wallIndex <= 2)).toBe(true);
    });
  });
});

describe('splitWallAtPoints', () => {
  describe('basic splitting', () => {
    it('should split open wall with single split point', () => {
      const wall = createWall([createPole(0, 0), createPole(100, 0)], 0);
      const splits: SplitPoint[] = [
        {
          wallIndex: 0,
          edgeIndex: 0,
          splitPosition: { x: 50, y: 0 },
          splitType: 'intersection',
        },
      ];

      const result = splitWallAtPoints({
        wall,
        wallIndex: 0,
        splitPoints: splits,
      });

      expect(result).toHaveLength(2);
      expect(result[0]?.poles).toHaveLength(2);
      expect(result[1]?.poles).toHaveLength(2);
      expect(result[0]?.poles[0]).toEqual(createPole(0, 0));
      expect(result[0]?.poles[1]?.x).toBeCloseTo(50, 1);
      expect(result[1]?.poles[0]?.x).toBeCloseTo(50, 1);
      expect(result[1]?.poles[1]).toEqual(createPole(100, 0));
    });

    it('should split open wall with multiple splits on different edges', () => {
      const wall = createWall([createPole(0, 0), createPole(100, 0), createPole(100, 100)], 0);
      const splits: SplitPoint[] = [
        {
          wallIndex: 0,
          edgeIndex: 0,
          splitPosition: { x: 50, y: 0 },
          splitType: 'intersection',
        },
        {
          wallIndex: 0,
          edgeIndex: 1,
          splitPosition: { x: 100, y: 50 },
          splitType: 'intersection',
        },
      ];

      const result = splitWallAtPoints({
        wall,
        wallIndex: 0,
        splitPoints: splits,
      });

      expect(result).toHaveLength(3);
      expect(result[0]?.poles[0]).toEqual(createPole(0, 0));
      expect(result[2]?.poles[1]).toEqual(createPole(100, 100));
    });

    it('should split open wall with multiple splits on same edge in correct order', () => {
      const wall = createWall([createPole(0, 0), createPole(100, 0)], 0);
      const splits: SplitPoint[] = [
        {
          wallIndex: 0,
          edgeIndex: 0,
          splitPosition: { x: 25, y: 0 },
          splitType: 'pole-on-edge',
        },
        {
          wallIndex: 0,
          edgeIndex: 0,
          splitPosition: { x: 75, y: 0 },
          splitType: 'intersection',
        },
      ];

      const result = splitWallAtPoints({
        wall,
        wallIndex: 0,
        splitPoints: splits,
      });

      expect(result).toHaveLength(3);
      expect(result[0]?.poles[1]?.x).toBeCloseTo(25, 1);
      expect(result[1]?.poles[0]?.x).toBeCloseTo(25, 1);
      expect(result[1]?.poles[1]?.x).toBeCloseTo(75, 1);
      expect(result[2]?.poles[0]?.x).toBeCloseTo(75, 1);
    });

    it('should split closed wall', () => {
      const wall = createWall(
        [createPole(0, 0), createPole(100, 0), createPole(100, 100), createPole(0, 100)],
        0,
        true,
      );
      const splits: SplitPoint[] = [
        {
          wallIndex: 0,
          edgeIndex: 0,
          splitPosition: { x: 50, y: 0 },
          splitType: 'intersection',
        },
      ];

      const result = splitWallAtPoints({
        wall,
        wallIndex: 0,
        splitPoints: splits,
      });

      expect(result).toHaveLength(2);
      expect(result[0]?.isClosed).toBe(false);
      expect(result[1]?.isClosed).toBe(false);
    });

    it('should return original wall when no split points provided', () => {
      const wall = createWall([createPole(0, 0), createPole(100, 0)], 0);

      const result = splitWallAtPoints({ wall, wallIndex: 0, splitPoints: [] });

      expect(result).toHaveLength(1);
      expect(result[0]).toEqual(wall);
    });
  });

  describe('height interpolation', () => {
    it('should set h=0 for split pole on flat wall', () => {
      const wall = createWall([createPole(0, 0, 0), createPole(100, 0, 0)], 0);
      const splits: SplitPoint[] = [
        {
          wallIndex: 0,
          edgeIndex: 0,
          splitPosition: { x: 50, y: 0 },
          splitType: 'intersection',
        },
      ];

      const result = splitWallAtPoints({
        wall,
        wallIndex: 0,
        splitPoints: splits,
      });

      expect(result[0]?.poles[1]?.h).toBe(0);
      expect(result[1]?.poles[0]?.h).toBe(0);
    });

    it('should interpolate height correctly for split at midpoint of sloped edge', () => {
      const wall = createWall([createPole(0, 0, 0), createPole(100, 0, 10)], 0);
      const splits: SplitPoint[] = [
        {
          wallIndex: 0,
          edgeIndex: 0,
          splitPosition: { x: 50, y: 0 },
          splitType: 'intersection',
        },
      ];

      const result = splitWallAtPoints({
        wall,
        wallIndex: 0,
        splitPoints: splits,
      });

      expect(result[0]?.poles[1]?.h).toBe(5);
      expect(result[1]?.poles[0]?.h).toBe(5);
    });

    it('should interpolate height correctly for split at quarter point of sloped edge', () => {
      const wall = createWall([createPole(0, 0, 10), createPole(100, 0, 0)], 0);
      const splits: SplitPoint[] = [
        {
          wallIndex: 0,
          edgeIndex: 0,
          splitPosition: { x: 25, y: 0 },
          splitType: 'intersection',
        },
      ];

      const result = splitWallAtPoints({
        wall,
        wallIndex: 0,
        splitPoints: splits,
      });

      expect(result[0]?.poles[1]?.h).toBeCloseTo(7.5, 1);
    });

    it('should maintain same height for split on uniform height edge', () => {
      const wall = createWall([createPole(0, 0, 5), createPole(100, 0, 5)], 0);
      const splits: SplitPoint[] = [
        {
          wallIndex: 0,
          edgeIndex: 0,
          splitPosition: { x: 50, y: 0 },
          splitType: 'intersection',
        },
      ];

      const result = splitWallAtPoints({
        wall,
        wallIndex: 0,
        splitPoints: splits,
      });

      expect(result[0]?.poles[1]?.h).toBe(5);
    });

    it('should interpolate height correctly on vertical edge', () => {
      const wall = createWall([createPole(0, 0, 0), createPole(0, 100, 20)], 0);
      const splits: SplitPoint[] = [
        {
          wallIndex: 0,
          edgeIndex: 0,
          splitPosition: { x: 0, y: 50 },
          splitType: 'intersection',
        },
      ];

      const result = splitWallAtPoints({
        wall,
        wallIndex: 0,
        splitPoints: splits,
      });

      expect(result[0]?.poles[1]?.h).toBeCloseTo(10, 1);
    });

    it('should interpolate height correctly on diagonal edge', () => {
      const wall = createWall([createPole(0, 0, 0), createPole(100, 100, 10)], 0);
      const splits: SplitPoint[] = [
        {
          wallIndex: 0,
          edgeIndex: 0,
          splitPosition: { x: 50, y: 50 },
          splitType: 'intersection',
        },
      ];

      const result = splitWallAtPoints({
        wall,
        wallIndex: 0,
        splitPoints: splits,
      });

      expect(result[0]?.poles[1]?.h).toBeCloseTo(5, 1);
    });
  });

  describe('segment naming and properties', () => {
    it('should name segments with sequential numbers', () => {
      const wall = createWall([createPole(0, 0), createPole(100, 0)], 0, false, 'Main Wall');
      const splits: SplitPoint[] = [
        {
          wallIndex: 0,
          edgeIndex: 0,
          splitPosition: { x: 33, y: 0 },
          splitType: 'intersection',
        },
        {
          wallIndex: 0,
          edgeIndex: 0,
          splitPosition: { x: 66, y: 0 },
          splitType: 'intersection',
        },
      ];

      const result = splitWallAtPoints({
        wall,
        wallIndex: 0,
        splitPoints: splits,
      });

      expect(result).toHaveLength(3);
      expect(result[0]?.name).toBe('Main Wall (1)');
      expect(result[1]?.name).toBe('Main Wall (2)');
      expect(result[2]?.name).toBe('Main Wall (3)');
    });

    it('should strip existing numeric suffix before adding new ones', () => {
      const wall = createWall([createPole(0, 0), createPole(100, 0)], 0, false, 'Wall (5)');
      const splits: SplitPoint[] = [
        {
          wallIndex: 0,
          edgeIndex: 0,
          splitPosition: { x: 50, y: 0 },
          splitType: 'intersection',
        },
      ];

      const result = splitWallAtPoints({
        wall,
        wallIndex: 0,
        splitPoints: splits,
      });

      expect(result[0]?.name).toBe('Wall (1)');
      expect(result[1]?.name).toBe('Wall (2)');
    });

    it('should inherit material from original wall', () => {
      const wall = createWall([createPole(0, 0), createPole(100, 0)], 0);
      wall.material = 'stone';
      const splits: SplitPoint[] = [
        {
          wallIndex: 0,
          edgeIndex: 0,
          splitPosition: { x: 50, y: 0 },
          splitType: 'intersection',
        },
      ];

      const result = splitWallAtPoints({
        wall,
        wallIndex: 0,
        splitPoints: splits,
      });

      expect(result[0]?.material).toBe('stone');
      expect(result[1]?.material).toBe('stone');
    });

    it('should inherit color from original wall', () => {
      const wall = createWall([createPole(0, 0), createPole(100, 0)], 0);
      wall.color = '#FF0000';
      const splits: SplitPoint[] = [
        {
          wallIndex: 0,
          edgeIndex: 0,
          splitPosition: { x: 50, y: 0 },
          splitType: 'intersection',
        },
      ];

      const result = splitWallAtPoints({
        wall,
        wallIndex: 0,
        splitPoints: splits,
      });

      expect(result[0]?.color).toBe('#FF0000');
      expect(result[1]?.color).toBe('#FF0000');
    });

    it('should inherit visibility from original wall', () => {
      const wall = createWall([createPole(0, 0), createPole(100, 0)], 0);
      wall.visibility = WallVisibility.Invisible;
      const splits: SplitPoint[] = [
        {
          wallIndex: 0,
          edgeIndex: 0,
          splitPosition: { x: 50, y: 0 },
          splitType: 'intersection',
        },
      ];

      const result = splitWallAtPoints({
        wall,
        wallIndex: 0,
        splitPoints: splits,
      });

      expect(result[0]?.visibility).toBe(WallVisibility.Invisible);
      expect(result[1]?.visibility).toBe(WallVisibility.Invisible);
    });

    it('should set all segments to isClosed false', () => {
      const wall = createWall(
        [createPole(0, 0), createPole(100, 0), createPole(100, 100), createPole(0, 100)],
        0,
        true,
      );
      const splits: SplitPoint[] = [
        {
          wallIndex: 0,
          edgeIndex: 0,
          splitPosition: { x: 50, y: 0 },
          splitType: 'intersection',
        },
      ];

      const result = splitWallAtPoints({
        wall,
        wallIndex: 0,
        splitPoints: splits,
      });

      expect(result.every((segment) => segment.isClosed === false)).toBe(true);
    });
  });

  describe('edge cases', () => {
    it('should return empty array for wall with less than 2 poles', () => {
      const wall = createWall([createPole(0, 0)], 0);
      const splits: SplitPoint[] = [
        {
          wallIndex: 0,
          edgeIndex: 0,
          splitPosition: { x: 50, y: 0 },
          splitType: 'intersection',
        },
      ];

      const result = splitWallAtPoints({
        wall,
        wallIndex: 0,
        splitPoints: splits,
      });

      expect(result).toEqual([]);
    });

    it('should return original wall when no splits for this wallIndex', () => {
      const wall = createWall([createPole(0, 0), createPole(100, 0)], 0);
      const splits: SplitPoint[] = [
        {
          wallIndex: 1,
          edgeIndex: 0,
          splitPosition: { x: 50, y: 0 },
          splitType: 'intersection',
        },
      ];

      const result = splitWallAtPoints({
        wall,
        wallIndex: 0,
        splitPoints: splits,
      });

      expect(result).toHaveLength(1);
      expect(result[0]).toEqual(wall);
    });

    it('should handle split exactly at existing pole location', () => {
      const wall = createWall([createPole(0, 0), createPole(50, 0), createPole(100, 0)], 0);
      const splits: SplitPoint[] = [
        {
          wallIndex: 0,
          edgeIndex: 0,
          splitPosition: { x: 50, y: 0 },
          splitType: 'intersection',
        },
      ];

      const result = splitWallAtPoints({
        wall,
        wallIndex: 0,
        splitPoints: splits,
      });

      expect(result).toBeDefined();
      expect(result.length).toBeGreaterThan(0);
    });

    it('should handle wall with 2 poles', () => {
      const wall = createWall([createPole(0, 0), createPole(100, 0)], 0);
      const splits: SplitPoint[] = [
        {
          wallIndex: 0,
          edgeIndex: 0,
          splitPosition: { x: 50, y: 0 },
          splitType: 'intersection',
        },
      ];

      const result = splitWallAtPoints({
        wall,
        wallIndex: 0,
        splitPoints: splits,
      });

      expect(result).toHaveLength(2);
    });

    it('should not split last edge of open wall', () => {
      const wall = createWall([createPole(0, 0), createPole(100, 0), createPole(100, 100)], 0, false);
      const splits: SplitPoint[] = [
        {
          wallIndex: 0,
          edgeIndex: 2,
          splitPosition: { x: 50, y: 50 },
          splitType: 'intersection',
        },
      ];

      const result = splitWallAtPoints({
        wall,
        wallIndex: 0,
        splitPoints: splits,
      });

      expect(result).toHaveLength(1);
      expect(result[0]?.poles).toHaveLength(3);
      expect(result[0]?.poles[0]).toEqual(createPole(0, 0));
      expect(result[0]?.poles[1]).toEqual(createPole(100, 0));
      expect(result[0]?.poles[2]).toEqual(createPole(100, 100));
    });

    it('should preserve encounterId and index for all segments', () => {
      const wall = createWall([createPole(0, 0), createPole(100, 0)], 0);
      wall.encounterId = 'custom-encounter-id';
      const splits: SplitPoint[] = [
        {
          wallIndex: 0,
          edgeIndex: 0,
          splitPosition: { x: 50, y: 0 },
          splitType: 'intersection',
        },
      ];

      const result = splitWallAtPoints({
        wall,
        wallIndex: 0,
        splitPoints: splits,
      });

      expect(result[0]?.encounterId).toBe('custom-encounter-id');
      expect(result[1]?.encounterId).toBe('custom-encounter-id');
      expect(result[0]?.index).toBe(0);
      expect(result[1]?.index).toBe(0);
    });
  });
});

describe('complex integration', () => {
  it('should handle complete scenario 6 (edge-on-edge split both walls)', () => {
    const newWallPoles: Point[] = [createPoint(50, 0), createPoint(50, 100)];
    const existingWalls: EncounterWall[] = [createWall([createPole(0, 50), createPole(100, 50)], 0)];

    const splitResult = detectSplitPoints({ newWallPoles, existingWalls });
    expect(splitResult.needsSplit).toBe(true);

    const splitOnExisting = splitResult.splits.find((s) => s.wallIndex === 0);
    expect(splitOnExisting).toBeDefined();

    const segments = splitWallAtPoints({
      wall: existingWalls[0]!,
      wallIndex: 0,
      splitPoints: splitResult.splits,
    });

    expect(segments).toHaveLength(2);
    expect(segments[0]?.poles[0]).toEqual(createPole(0, 50));
    expect(segments[1]?.poles[segments[1].poles.length - 1]).toEqual(createPole(100, 50));
  });

  it('should handle complete scenario 7 (pole-on-edge split existing wall)', () => {
    const newWallPoles: Point[] = [createPoint(50, 3), createPoint(100, 50)];
    const existingWalls: EncounterWall[] = [createWall([createPole(0, 0), createPole(100, 0)], 0)];

    const splitResult = detectSplitPoints({ newWallPoles, existingWalls });
    expect(splitResult.needsSplit).toBe(true);

    const segments = splitWallAtPoints({
      wall: existingWalls[0]!,
      wallIndex: 0,
      splitPoints: splitResult.splits,
    });

    expect(segments).toHaveLength(2);
  });

  it('should handle multiple splits creating 3+ segments', () => {
    const wall = createWall([createPole(0, 0), createPole(100, 0)], 0);
    const splits: SplitPoint[] = [
      {
        wallIndex: 0,
        edgeIndex: 0,
        splitPosition: { x: 25, y: 0 },
        splitType: 'pole-on-edge',
      },
      {
        wallIndex: 0,
        edgeIndex: 0,
        splitPosition: { x: 50, y: 0 },
        splitType: 'intersection',
      },
      {
        wallIndex: 0,
        edgeIndex: 0,
        splitPosition: { x: 75, y: 0 },
        splitType: 'pole-on-edge',
      },
    ];

    const result = splitWallAtPoints({
      wall,
      wallIndex: 0,
      splitPoints: splits,
    });

    expect(result).toHaveLength(4);
    expect(result[0]?.name).toBe('Wall 0 (1)');
    expect(result[1]?.name).toBe('Wall 0 (2)');
    expect(result[2]?.name).toBe('Wall 0 (3)');
    expect(result[3]?.name).toBe('Wall 0 (4)');
  });

  it('should handle closed wall with splits on wrapping edge', () => {
    const wall = createWall([createPole(0, 0), createPole(100, 0), createPole(100, 100), createPole(0, 100)], 0, true);
    const splits: SplitPoint[] = [
      {
        wallIndex: 0,
        edgeIndex: 3,
        splitPosition: { x: 0, y: 50 },
        splitType: 'intersection',
      },
    ];

    const result = splitWallAtPoints({
      wall,
      wallIndex: 0,
      splitPoints: splits,
    });

    expect(result.length).toBeGreaterThan(0);
    expect(result.every((segment) => segment.isClosed === false)).toBe(true);
    const totalPoles = result.reduce((sum, segment) => sum + segment.poles.length, 0);
    expect(totalPoles).toBeGreaterThanOrEqual(5);
  });

  it('should handle large wall with multiple splits (performance check)', () => {
    const poles: Pole[] = [];
    for (let i = 0; i <= 20; i++) {
      poles.push(createPole(i * 10, 0));
    }
    const wall = createWall(poles, 0);

    const splits: SplitPoint[] = [];
    for (let i = 0; i < 20; i++) {
      splits.push({
        wallIndex: 0,
        edgeIndex: i,
        splitPosition: { x: i * 10 + 5, y: 0 },
        splitType: 'intersection',
      });
    }

    const startTime = performance.now();
    const result = splitWallAtPoints({
      wall,
      wallIndex: 0,
      splitPoints: splits,
    });
    const endTime = performance.now();

    expect(endTime - startTime).toBeLessThan(100);
    expect(result.length).toBeGreaterThan(1);
  });

  it('should handle multiple walls with overlapping split points', () => {
    const newWallPoles: Point[] = [createPoint(25, 3), createPoint(50, 50), createPoint(75, 3)];
    const existingWalls: EncounterWall[] = [
      createWall([createPole(0, 0), createPole(100, 0)], 0),
      createWall([createPole(0, 50), createPole(100, 50)], 1),
    ];

    const splitResult = detectSplitPoints({ newWallPoles, existingWalls });
    expect(splitResult.needsSplit).toBe(true);
    expect(splitResult.affectedWallIndices.length).toBeGreaterThan(0);

    const segments0 = splitWallAtPoints({
      wall: existingWalls[0]!,
      wallIndex: 0,
      splitPoints: splitResult.splits,
    });
    const segments1 = splitWallAtPoints({
      wall: existingWalls[1]!,
      wallIndex: 1,
      splitPoints: splitResult.splits,
    });

    expect(segments0.length).toBeGreaterThan(1);
    expect(segments1.length).toBeGreaterThanOrEqual(1);
  });

  it('should correctly order splits across multiple edges', () => {
    const wall = createWall([createPole(0, 0), createPole(100, 0), createPole(100, 100), createPole(0, 100)], 0);
    const splits: SplitPoint[] = [
      {
        wallIndex: 0,
        edgeIndex: 2,
        splitPosition: { x: 50, y: 100 },
        splitType: 'intersection',
      },
      {
        wallIndex: 0,
        edgeIndex: 0,
        splitPosition: { x: 25, y: 0 },
        splitType: 'pole-on-edge',
      },
      {
        wallIndex: 0,
        edgeIndex: 1,
        splitPosition: { x: 100, y: 50 },
        splitType: 'intersection',
      },
      {
        wallIndex: 0,
        edgeIndex: 0,
        splitPosition: { x: 75, y: 0 },
        splitType: 'pole-on-edge',
      },
    ];

    const result = splitWallAtPoints({
      wall,
      wallIndex: 0,
      splitPoints: splits,
    });

    expect(result).toHaveLength(5);
    expect(result[0]?.poles[1]?.x).toBeCloseTo(25, 1);
  });

  it('should maintain height consistency across all segments', () => {
    const wall = createWall([createPole(0, 0, 0), createPole(100, 0, 20)], 0);
    const splits: SplitPoint[] = [
      {
        wallIndex: 0,
        edgeIndex: 0,
        splitPosition: { x: 25, y: 0 },
        splitType: 'pole-on-edge',
      },
      {
        wallIndex: 0,
        edgeIndex: 0,
        splitPosition: { x: 50, y: 0 },
        splitType: 'intersection',
      },
      {
        wallIndex: 0,
        edgeIndex: 0,
        splitPosition: { x: 75, y: 0 },
        splitType: 'pole-on-edge',
      },
    ];

    const result = splitWallAtPoints({
      wall,
      wallIndex: 0,
      splitPoints: splits,
    });

    expect(result[0]?.poles[0]?.h).toBe(0);
    expect(result[0]?.poles[1]?.h).toBeCloseTo(5, 1);
    expect(result[1]?.poles[0]?.h).toBeCloseTo(5, 1);
    expect(result[1]?.poles[1]?.h).toBeCloseTo(10, 1);
    expect(result[2]?.poles[0]?.h).toBeCloseTo(10, 1);
    expect(result[2]?.poles[1]?.h).toBeCloseTo(15, 1);
    expect(result[3]?.poles[0]?.h).toBeCloseTo(15, 1);
    expect(result[3]?.poles[1]?.h).toBe(20);
  });
});
