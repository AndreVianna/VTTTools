import { act, renderHook } from '@testing-library/react';
import { beforeEach, describe, expect, it, vi } from 'vitest';
import type { PlacedRegion, Point } from '@/types/domain';
import { useFogOfWarPlacement } from './useFogOfWarPlacement';

vi.mock('polygon-clipping', () => ({
  default: {
    union: vi.fn((_polys1: any, _polys2: any) => {
      return [[[[0, 0], [100, 0], [100, 100], [0, 100], [0, 0]]]];
    }),
  },
}));

describe('useFogOfWarPlacement', () => {
  const mockEncounterId = 'encounter-123';
  const mockOnRegionCreated = vi.fn();

  // Note: Implementation uses value=2 for "Hidden" (add) and value=0 for "Revealed" (subtract)
  const createMockRegion = (name: string, value: number, vertices: Point[], index = 0): PlacedRegion => ({
    id: `region-${name}`,
    encounterId: mockEncounterId,
    index,
    type: 'FogOfWar',
    name,
    label: value === 2 ? 'Hidden' : 'Revealed',
    value,
    vertices,
  });

  beforeEach(() => {
    vi.clearAllMocks();
  });

  describe('Hierarchical Naming', () => {
    it('should create top-level name "1" for first add mode region', () => {
      const { result } = renderHook(() =>
        useFogOfWarPlacement({
          encounterId: mockEncounterId,
          existingRegions: [],
          mode: 'add',
          onRegionCreated: mockOnRegionCreated,
        }),
      );

      const vertices: Point[] = [
        { x: 0, y: 0 },
        { x: 100, y: 0 },
        { x: 100, y: 100 },
      ];

      act(() => {
        result.current.handlePolygonComplete(vertices);
      });

      expect(mockOnRegionCreated).toHaveBeenCalledTimes(1);
      const createdRegion = mockOnRegionCreated.mock.calls[0]?.[0];
      expect(createdRegion?.name).toBe('1');
      expect(createdRegion?.value).toBe(2); // Hidden = 2
    });

    it('should create name "2" for second add mode region', () => {
      const existingRegions: PlacedRegion[] = [
        createMockRegion('1', 2, [
          { x: 0, y: 0 },
          { x: 50, y: 0 },
          { x: 50, y: 50 },
        ]),
      ];

      const { result } = renderHook(() =>
        useFogOfWarPlacement({
          encounterId: mockEncounterId,
          existingRegions,
          mode: 'add',
          onRegionCreated: mockOnRegionCreated,
        }),
      );

      const vertices: Point[] = [
        { x: 200, y: 0 },
        { x: 300, y: 0 },
        { x: 300, y: 100 },
      ];

      act(() => {
        result.current.handlePolygonComplete(vertices);
      });

      expect(mockOnRegionCreated).toHaveBeenCalled();
      const createdRegion = mockOnRegionCreated.mock.calls[0]?.[0];
      expect(createdRegion?.name).toBe('2');
    });

    it('should create child name "1.1" for first subtract mode region', () => {
      const existingRegions: PlacedRegion[] = [
        createMockRegion('1', 2, [
          { x: 0, y: 0 },
          { x: 100, y: 0 },
          { x: 100, y: 100 },
        ]),
      ];

      const { result } = renderHook(() =>
        useFogOfWarPlacement({
          encounterId: mockEncounterId,
          existingRegions,
          mode: 'subtract',
          onRegionCreated: mockOnRegionCreated,
        }),
      );

      const vertices: Point[] = [
        { x: 10, y: 10 },
        { x: 30, y: 10 },
        { x: 30, y: 30 },
      ];

      act(() => {
        result.current.handlePolygonComplete(vertices);
      });

      expect(mockOnRegionCreated).toHaveBeenCalled();
      const createdRegion = mockOnRegionCreated.mock.calls[0]?.[0];
      expect(createdRegion?.name).toBe('1.1');
      expect(createdRegion?.value).toBe(0); // Revealed = 0
    });

    it('should create child name "1.1.1" for subtract under most recent parent "1.1"', () => {
      // Note: Implementation uses highest-index region as parent for subtract mode
      const existingRegions: PlacedRegion[] = [
        createMockRegion('1', 2, [
          { x: 0, y: 0 },
          { x: 100, y: 0 },
          { x: 100, y: 100 },
        ], 0),
        createMockRegion('1.1', 0, [
          { x: 10, y: 10 },
          { x: 20, y: 10 },
          { x: 20, y: 20 },
        ], 1),
      ];

      const { result } = renderHook(() =>
        useFogOfWarPlacement({
          encounterId: mockEncounterId,
          existingRegions,
          mode: 'subtract',
          onRegionCreated: mockOnRegionCreated,
        }),
      );

      const vertices: Point[] = [
        { x: 50, y: 50 },
        { x: 60, y: 50 },
        { x: 60, y: 60 },
      ];

      act(() => {
        result.current.handlePolygonComplete(vertices);
      });

      expect(mockOnRegionCreated).toHaveBeenCalled();
      const createdRegion = mockOnRegionCreated.mock.calls[0]?.[0];
      // Uses "1.1" as parent (highest index), so child is "1.1.1"
      expect(createdRegion?.name).toBe('1.1.1');
    });
  });

  describe('Mode-based Region Creation', () => {
    it('should create region with value=2 (Hidden) in add mode', () => {
      const { result } = renderHook(() =>
        useFogOfWarPlacement({
          encounterId: mockEncounterId,
          existingRegions: [],
          mode: 'add',
          onRegionCreated: mockOnRegionCreated,
        }),
      );

      act(() => {
        result.current.handlePolygonComplete([
          { x: 0, y: 0 },
          { x: 100, y: 0 },
          { x: 100, y: 100 },
        ]);
      });

      const createdRegion = mockOnRegionCreated.mock.calls[0]?.[0];
      expect(createdRegion?.value).toBe(2); // Hidden = 2
      expect(createdRegion?.type).toBe('FogOfWar');
    });

    it('should create region with value=0 in subtract mode', () => {
      const existingRegions: PlacedRegion[] = [
        createMockRegion('1', 2, [
          { x: 0, y: 0 },
          { x: 200, y: 0 },
          { x: 200, y: 200 },
        ]),
      ];

      const { result } = renderHook(() =>
        useFogOfWarPlacement({
          encounterId: mockEncounterId,
          existingRegions,
          mode: 'subtract',
          onRegionCreated: mockOnRegionCreated,
        }),
      );

      act(() => {
        result.current.handlePolygonComplete([
          { x: 50, y: 50 },
          { x: 100, y: 50 },
          { x: 100, y: 100 },
        ]);
      });

      const createdRegion = mockOnRegionCreated.mock.calls[0]?.[0];
      expect(createdRegion?.value).toBe(0); // Revealed = 0
    });
  });

  describe('Polygon Clipping Integration', () => {
    it('should call polygon-clipping union for add mode', async () => {
      const polygonClipping = await import('polygon-clipping');

      const existingRegions: PlacedRegion[] = [
        createMockRegion('1', 2, [ // Hidden = 2 (required for union to be called)
          { x: 0, y: 0 },
          { x: 50, y: 0 },
          { x: 50, y: 50 },
        ]),
      ];

      const { result } = renderHook(() =>
        useFogOfWarPlacement({
          encounterId: mockEncounterId,
          existingRegions,
          mode: 'add',
          onRegionCreated: mockOnRegionCreated,
        }),
      );

      act(() => {
        result.current.handlePolygonComplete([
          { x: 0, y: 0 },
          { x: 100, y: 0 },
          { x: 100, y: 100 },
        ]);
      });

      expect(polygonClipping.default.union).toHaveBeenCalled();
    });
  });

  describe('Bucket Fill', () => {
    it('should handle bucket fill completion in add mode', () => {
      const { result } = renderHook(() =>
        useFogOfWarPlacement({
          encounterId: mockEncounterId,
          existingRegions: [],
          mode: 'add',
          onRegionCreated: mockOnRegionCreated,
        }),
      );

      const vertices: Point[] = [
        { x: 0, y: 0 },
        { x: 1000, y: 0 },
        { x: 1000, y: 1000 },
        { x: 0, y: 1000 },
      ];

      act(() => {
        result.current.handleBucketFillComplete(vertices);
      });

      expect(mockOnRegionCreated).toHaveBeenCalled();
      const createdRegion = mockOnRegionCreated.mock.calls[0]?.[0];
      expect(createdRegion?.name).toBe('1');
      expect(createdRegion?.value).toBe(2); // Hidden = 2
    });

    it('should handle bucket fill completion in subtract mode', () => {
      const existingRegions: PlacedRegion[] = [
        createMockRegion('1', 2, [
          { x: 0, y: 0 },
          { x: 1000, y: 0 },
          { x: 1000, y: 1000 },
        ]),
      ];

      const { result } = renderHook(() =>
        useFogOfWarPlacement({
          encounterId: mockEncounterId,
          existingRegions,
          mode: 'subtract',
          onRegionCreated: mockOnRegionCreated,
        }),
      );

      const vertices: Point[] = [
        { x: 100, y: 100 },
        { x: 200, y: 100 },
        { x: 200, y: 200 },
      ];

      act(() => {
        result.current.handleBucketFillComplete(vertices);
      });

      expect(mockOnRegionCreated).toHaveBeenCalled();
      const createdRegion = mockOnRegionCreated.mock.calls[0]?.[0];
      expect(createdRegion?.name).toBe('1.1');
      expect(createdRegion?.value).toBe(0); // Revealed = 0
    });
  });

  describe('Edge Cases', () => {
    it('should handle empty vertices array gracefully', () => {
      const { result } = renderHook(() =>
        useFogOfWarPlacement({
          encounterId: mockEncounterId,
          existingRegions: [],
          mode: 'add',
          onRegionCreated: mockOnRegionCreated,
        }),
      );

      act(() => {
        result.current.handlePolygonComplete([]);
      });

      expect(mockOnRegionCreated).not.toHaveBeenCalled();
    });

    it('should handle region creation with no existing FoW regions', () => {
      const existingRegions: PlacedRegion[] = [
        {
          id: 'region-other',
          encounterId: mockEncounterId,
          index: 0,
          type: 'Elevation',
          name: 'Hill',
          label: 'Difficult',
          value: 2,
          vertices: [
            { x: 0, y: 0 },
            { x: 50, y: 0 },
            { x: 50, y: 50 },
          ],
        },
      ];

      const { result } = renderHook(() =>
        useFogOfWarPlacement({
          encounterId: mockEncounterId,
          existingRegions,
          mode: 'add',
          onRegionCreated: mockOnRegionCreated,
        }),
      );

      act(() => {
        result.current.handlePolygonComplete([
          { x: 100, y: 100 },
          { x: 200, y: 100 },
          { x: 200, y: 200 },
        ]);
      });

      expect(mockOnRegionCreated).toHaveBeenCalled();
      const createdRegion = mockOnRegionCreated.mock.calls[0]?.[0];
      expect(createdRegion?.name).toBe('1');
    });
  });
});
