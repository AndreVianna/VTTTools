import type { EncounterWall, EncounterWallSegment, Pole } from '@/types/domain';
import { SegmentType, SegmentState } from '@/types/domain';

export interface CleanWallPolesResult {
  poles: Pole[];
  isClosed: boolean;
}

export function cleanWallPoles(poles: Pole[], isClosed: boolean): CleanWallPolesResult {
  if (poles.length === 0) {
    return { poles: [], isClosed };
  }

  const cleanedPoles = [...poles];
  let newIsClosed = isClosed;

  for (let i = cleanedPoles.length - 1; i > 0; i--) {
    const current = cleanedPoles[i];
    const previous = cleanedPoles[i - 1];

    if (current?.x === previous?.x && current?.y === previous?.y) {
      cleanedPoles.splice(i, 1);
    }
  }

  if (cleanedPoles.length >= 2) {
    const first = cleanedPoles[0];
    const last = cleanedPoles[cleanedPoles.length - 1];

    if (first?.x === last?.x && first?.y === last?.y) {
      cleanedPoles.splice(cleanedPoles.length - 1, 1);
      if (!isClosed) {
        newIsClosed = true;
      }
    }
  }

  return { poles: cleanedPoles, isClosed: newIsClosed };
}

export function getPolesFromWall(wall: EncounterWall): Pole[] {
  if (wall.segments.length === 0) return [];

  const firstSegment = wall.segments[0];
  if (!firstSegment) return [];

  const poles: Pole[] = [firstSegment.startPole];
  wall.segments.forEach(s => poles.push(s.endPole));
  return poles;
}

export function polesToSegments(poles: Pole[], isClosed: boolean): EncounterWallSegment[] {
  if (poles.length < 2) return [];

  const segments: EncounterWallSegment[] = [];
  const segmentCount = isClosed ? poles.length : poles.length - 1;

  for (let i = 0; i < segmentCount; i++) {
    const startPole = poles[i];
    const endPole = poles[(i + 1) % poles.length];
    if (!startPole || !endPole) continue;

    segments.push({
      index: i,
      startPole,
      endPole,
      type: SegmentType.Wall,
      state: SegmentState.Closed,
    });
  }

  return segments;
}

export function isWallClosed(wall: EncounterWall): boolean {
  if (wall.segments.length === 0) return false;
  const firstSegment = wall.segments[0];
  const lastSegment = wall.segments[wall.segments.length - 1];
  if (!firstSegment || !lastSegment) return false;
  return (
    firstSegment.startPole.x === lastSegment.endPole.x &&
    firstSegment.startPole.y === lastSegment.endPole.y
  );
}
