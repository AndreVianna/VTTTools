import type { Pole } from '@/types/domain';

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

  // Step 1: Remove adjacent duplicates
  for (let i = cleanedPoles.length - 1; i > 0; i--) {
    const current = cleanedPoles[i];
    const previous = cleanedPoles[i - 1];

    if (current?.x === previous?.x && current?.y === previous?.y) {
      cleanedPoles.splice(i, 1);
    }
  }

  // Step 2: Handle first == last
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
