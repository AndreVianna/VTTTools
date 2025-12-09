import type { EncounterWall, EncounterWallSegment, Pole, Point } from '@/types/domain';
import { SegmentType } from '@/types/domain';

export function getPolesFromSegments(segments: EncounterWallSegment[]): Pole[] {
  if (segments.length === 0) return [];

  const firstSegment = segments[0];
  if (!firstSegment) return [];

  const poles: Pole[] = [firstSegment.startPole];
  segments.forEach(s => poles.push(s.endPole));
  return poles;
}

export function segmentsToPoles(wall: EncounterWall): Pole[] {
  return getPolesFromSegments(wall.segments);
}

export function isSegmentBlocking(segment: EncounterWallSegment): boolean {
  return segment.type === SegmentType.Wall;
}

export function isSegmentOpaque(segment: EncounterWallSegment): boolean {
  return segment.isOpaque;
}

export function segmentToLineSegment(segment: EncounterWallSegment): {
  start: Point;
  end: Point;
} {
  return {
    start: { x: segment.startPole.x, y: segment.startPole.y },
    end: { x: segment.endPole.x, y: segment.endPole.y },
  };
}
