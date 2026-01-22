import type { EncounterWall, Point } from '@/types/domain';
import { SegmentState, SegmentType } from '@/types/domain';
import type { GridConfig } from '@/utils/gridCalculator';

/**
 * Sound Propagation Utility
 *
 * Calculates shortest-path distance from a sound source to a listener
 * using BFS flood fill. Sound is blocked by walls and closed doors/windows.
 *
 * The algorithm:
 * 1. Convert radius from grid cells to pixels
 * 2. Quick rejection: if straight-line distance > radius, return blocked
 * 3. Extract barrier segments (walls + closed doors/windows)
 * 4. BFS from source, tracking distance to each cell
 * 5. Stop at radius boundary or wall barriers
 * 6. Look up listener cell in distance map
 */

/**
 * Default grid cell size in pixels for flood fill discretization.
 * Smaller values = more accurate but slower.
 * 10px provides good balance for audio (less precision needed than regions).
 */
export const DEFAULT_CELL_SIZE = 10;

/**
 * Safety multiplier for max iterations in BFS.
 * The theoretical max cells is (diameter/cellSize)^2.
 * We multiply by 4 to handle:
 * - Diagonal paths being longer than direct paths
 * - Paths that need to go around obstacles
 * - Floating point rounding in cell calculations
 */
const BFS_SAFETY_MULTIPLIER = 4;

interface LineSegment {
    start: Point;
    end: Point;
}

interface GridCell {
    x: number;
    y: number;
}

export interface SoundPropagationResult {
    /** Distance in pixels from source to listener. -1 if blocked or out of range. */
    distance: number;
    /** True if listener is reachable from source (within range and not blocked) */
    isReachable: boolean;
    /** True if the listener is out of the sound source's range */
    isOutOfRange: boolean;
}

/**
 * Check if a wall segment blocks sound.
 *
 * Sound blocking rules (same as light):
 * - Walls: Always block
 * - Doors: Block if isOpaque && state === Closed
 * - Windows: Block if isOpaque && state === Closed
 * - Open doors/windows: Sound passes through
 */
function isSegmentSoundBlocking(segment: {
    type: SegmentType;
    state: SegmentState;
    isOpaque: boolean;
}): boolean {
    if (segment.type === SegmentType.Door || segment.type === SegmentType.Window) {
        return segment.isOpaque && segment.state === SegmentState.Closed;
    }
    // Walls always block sound
    return segment.isOpaque;
}

/**
 * Extract all sound-blocking segments from encounter walls.
 */
function extractSoundBlockingSegments(encounterWalls: EncounterWall[]): LineSegment[] {
    const segments: LineSegment[] = [];

    for (const encounterWall of encounterWalls) {
        for (const wallSegment of encounterWall.segments) {
            if (isSegmentSoundBlocking(wallSegment)) {
                segments.push({
                    start: { x: wallSegment.startPole.x, y: wallSegment.startPole.y },
                    end: { x: wallSegment.endPole.x, y: wallSegment.endPole.y },
                });
            }
        }
    }

    return segments;
}

/**
 * Calculate straight-line distance between two points.
 */
function distanceBetweenPoints(p1: Point, p2: Point): number {
    const dx = p2.x - p1.x;
    const dy = p2.y - p1.y;
    return Math.sqrt(dx * dx + dy * dy);
}

/**
 * Convert world coordinates to grid cell.
 */
function worldToGrid(point: Point, cellSize: number): GridCell {
    return {
        x: Math.floor(point.x / cellSize),
        y: Math.floor(point.y / cellSize),
    };
}

/**
 * Convert grid cell to world coordinates (center of cell).
 */
function gridToWorld(cell: GridCell, cellSize: number): Point {
    return {
        x: cell.x * cellSize + cellSize / 2,
        y: cell.y * cellSize + cellSize / 2,
    };
}

/**
 * Generate a unique key for a grid cell.
 */
function cellKey(cell: GridCell): string {
    return `${cell.x},${cell.y}`;
}

/**
 * Check if a line segment from p1 to p2 intersects with another segment.
 */
function lineIntersectsSegment(p1: Point, p2: Point, seg: LineSegment): boolean {
    const d1x = p2.x - p1.x;
    const d1y = p2.y - p1.y;
    const d2x = seg.end.x - seg.start.x;
    const d2y = seg.end.y - seg.start.y;

    const cross = d1x * d2y - d1y * d2x;

    // Lines are parallel
    if (Math.abs(cross) < 1e-10) {
        return false;
    }

    const dx = seg.start.x - p1.x;
    const dy = seg.start.y - p1.y;

    const t = (dx * d2y - dy * d2x) / cross;
    const u = (dx * d1y - dy * d1x) / cross;

    // Check if intersection is within both segments
    // Use small epsilon to handle edge cases at corners
    return t > 0.001 && t < 0.999 && u > 0.001 && u < 0.999;
}

/**
 * Check if movement between two cells is blocked by any wall segment.
 */
function canMoveBetweenCells(from: Point, to: Point, segments: LineSegment[]): boolean {
    for (const segment of segments) {
        if (lineIntersectsSegment(from, to, segment)) {
            return false;
        }
    }
    return true;
}

/**
 * BFS flood fill from source position, tracking distance to each reachable cell.
 *
 * @returns Map of cell keys to distances (in pixels)
 */
function floodFillWithDistance(
    sourcePosition: Point,
    maxRangePixels: number,
    segments: LineSegment[],
    cellSize: number
): Map<string, number> {
    const distanceMap = new Map<string, number>();
    const startCell = worldToGrid(sourcePosition, cellSize);
    const startKey = cellKey(startCell);

    // Queue contains: [cell, distance from source]
    const queue: Array<[GridCell, number]> = [[startCell, 0]];
    distanceMap.set(startKey, 0);

    // Calculate max cells to process based on radius
    // maxCells = diameter in cells, maxIterations accounts for complex paths
    const maxCells = Math.ceil(maxRangePixels / cellSize) * 2;
    const maxIterations = maxCells * maxCells * BFS_SAFETY_MULTIPLIER;
    let iterations = 0;

    while (queue.length > 0 && iterations < maxIterations) {
        iterations++;
        const [current, currentDistance] = queue.shift()!;
        const currentCenter = gridToWorld(current, cellSize);

        // 4-directional neighbors (cardinal directions)
        const neighbors: GridCell[] = [
            { x: current.x + 1, y: current.y },
            { x: current.x - 1, y: current.y },
            { x: current.x, y: current.y + 1 },
            { x: current.x, y: current.y - 1 },
        ];

        for (const neighbor of neighbors) {
            const neighborKey = cellKey(neighbor);

            // Skip if already visited
            if (distanceMap.has(neighborKey)) continue;

            const neighborCenter = gridToWorld(neighbor, cellSize);
            const neighborDistance = currentDistance + cellSize;

            // Skip if beyond max range
            if (neighborDistance > maxRangePixels) continue;

            // Skip if blocked by wall
            if (!canMoveBetweenCells(currentCenter, neighborCenter, segments)) continue;

            distanceMap.set(neighborKey, neighborDistance);
            queue.push([neighbor, neighborDistance]);
        }
    }

    return distanceMap;
}

/**
 * Calculate the shortest-path distance from a sound source to a listener.
 *
 * Uses BFS flood fill to find paths around walls. Returns -1 if the
 * listener is blocked by walls or out of range.
 *
 * @param sourcePosition - Position of the sound source (in pixels)
 * @param listenerPosition - Position of the listener (in pixels)
 * @param radiusInCells - Sound radius in grid cells
 * @param config - Configuration including walls and grid config
 * @returns SoundPropagationResult with distance and reachability info
 */
export function calculateSoundDistance(
    sourcePosition: Point,
    listenerPosition: Point,
    radiusInCells: number,
    config: { walls: EncounterWall[]; gridConfig: GridConfig; cellSize?: number }
): SoundPropagationResult {
    const { walls, gridConfig, cellSize = DEFAULT_CELL_SIZE } = config;

    // Convert radius from grid cells to pixels
    const radiusInPixels = radiusInCells * gridConfig.cellSize.width;

    // Quick rejection: straight-line distance > radius
    const straightLineDistance = distanceBetweenPoints(sourcePosition, listenerPosition);
    if (straightLineDistance > radiusInPixels) {
        return {
            distance: -1,
            isReachable: false,
            isOutOfRange: true,
        };
    }

    // Edge case: no walls, just use straight-line distance
    if (!walls || walls.length === 0) {
        return {
            distance: straightLineDistance,
            isReachable: true,
            isOutOfRange: false,
        };
    }

    // Extract sound-blocking segments
    const segments = extractSoundBlockingSegments(walls);

    // Edge case: no blocking segments, just use straight-line distance
    if (segments.length === 0) {
        return {
            distance: straightLineDistance,
            isReachable: true,
            isOutOfRange: false,
        };
    }

    // Quick check: if straight-line path is unblocked, use it
    const sourceCenter = sourcePosition;
    const listenerCenter = listenerPosition;
    let isDirectPathBlocked = false;
    for (const segment of segments) {
        if (lineIntersectsSegment(sourceCenter, listenerCenter, segment)) {
            isDirectPathBlocked = true;
            break;
        }
    }

    if (!isDirectPathBlocked) {
        return {
            distance: straightLineDistance,
            isReachable: true,
            isOutOfRange: false,
        };
    }

    // BFS flood fill to find path around walls
    const distanceMap = floodFillWithDistance(sourcePosition, radiusInPixels, segments, cellSize);

    // Look up listener cell in distance map
    const listenerCell = worldToGrid(listenerPosition, cellSize);
    const listenerKey = cellKey(listenerCell);
    const pathDistance = distanceMap.get(listenerKey);

    if (pathDistance === undefined) {
        // Listener is blocked by walls or beyond range via pathfinding
        return {
            distance: -1,
            isReachable: false,
            isOutOfRange: false, // Not out of range, just blocked
        };
    }

    return {
        distance: pathDistance,
        isReachable: true,
        isOutOfRange: false,
    };
}

/**
 * Calculate volume attenuation based on distance from source.
 *
 * Uses linear decay: volume decreases linearly from 1 at source to 0 at maxRange.
 * This provides a simple and predictable attenuation model.
 *
 * @param distance - Distance in pixels from source to listener
 * @param maxRange - Maximum range of the sound source in pixels
 * @returns Attenuation factor between 0 and 1
 */
export function calculateVolumeAttenuation(distance: number, maxRange: number): number {
    if (distance < 0 || maxRange <= 0) {
        return 0;
    }

    if (distance >= maxRange) {
        return 0;
    }

    // Linear decay: 1 at source, 0 at maxRange
    return 1 - distance / maxRange;
}

/**
 * Calculate the effective volume for a sound source at a listener position.
 *
 * This combines:
 * 1. The base volume of the sound source
 * 2. Distance-based attenuation
 * 3. Wall blocking (returns 0 if blocked)
 *
 * @param sourcePosition - Position of the sound source (in pixels)
 * @param listenerPosition - Position of the listener (in pixels)
 * @param baseVolume - Base volume of the sound source (0-1)
 * @param radiusInCells - Sound radius in grid cells
 * @param config - Configuration including walls and grid config
 * @returns Effective volume between 0 and 1
 */
export function calculateEffectiveVolume(
    sourcePosition: Point,
    listenerPosition: Point,
    baseVolume: number,
    radiusInCells: number,
    config: { walls: EncounterWall[]; gridConfig: GridConfig }
): number {
    // Calculate distance and reachability
    const result = calculateSoundDistance(sourcePosition, listenerPosition, radiusInCells, config);

    if (!result.isReachable) {
        return 0;
    }

    // Convert radius to pixels for attenuation calculation
    const radiusInPixels = radiusInCells * config.gridConfig.cellSize.width;

    // Calculate attenuation based on distance
    const attenuation = calculateVolumeAttenuation(result.distance, radiusInPixels);

    // Apply attenuation to base volume
    return baseVolume * attenuation;
}
