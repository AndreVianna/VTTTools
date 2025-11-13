import type { Encounter, EncounterRegion, EncounterWall } from '@/types/domain';

export function addWallOptimistic(encounter: Encounter, wall: EncounterWall): Encounter {
  return {
    ...encounter,
    walls: [...encounter.walls.filter((w) => w.index !== -1), wall],
  };
}

export function updateWallOptimistic(
  encounter: Encounter,
  wallIndex: number,
  changes: Partial<EncounterWall>,
): Encounter {
  const wallIndexPosition = encounter.walls.findIndex((w) => w.index === wallIndex);

  if (wallIndexPosition === -1) {
    return encounter;
  }

  return {
    ...encounter,
    walls: encounter.walls.map((wall, idx) => (idx === wallIndexPosition ? { ...wall, ...changes } : wall)),
  };
}

export function removeWallOptimistic(encounter: Encounter, wallIndex: number): Encounter {
  return {
    ...encounter,
    walls: encounter.walls.filter((wall) => wall.index !== wallIndex),
  };
}

export function syncWallIndices(encounter: Encounter, tempToRealMap: Map<number, number>): Encounter {
  return {
    ...encounter,
    walls: encounter.walls.map((wall) => {
      if (wall.index < 0 && tempToRealMap.has(wall.index)) {
        const realIndex = tempToRealMap.get(wall.index);
        if (realIndex !== undefined) {
          return {
            ...wall,
            index: realIndex,
          };
        }
      }
      return wall;
    }),
  };
}

export function removeTempRegions(encounter: Encounter): Encounter {
  return {
    ...encounter,
    regions: encounter.regions.filter((r) => r.index !== -1),
  };
}

export function addRegionOptimistic(encounter: Encounter, region: EncounterRegion): Encounter {
  const cleanedEncounter = removeTempRegions(encounter);
  return {
    ...cleanedEncounter,
    regions: [...cleanedEncounter.regions, region],
  };
}

export function updateRegionOptimistic(
  encounter: Encounter,
  regionIndex: number,
  changes: Partial<EncounterRegion>,
): Encounter {
  const regionIndexPosition = encounter.regions.findIndex((r) => r.index === regionIndex);

  if (regionIndexPosition === -1) {
    return encounter;
  }

  return {
    ...encounter,
    regions: encounter.regions.map((region, idx) => (idx === regionIndexPosition ? { ...region, ...changes } : region)),
  };
}

export function removeRegionOptimistic(encounter: Encounter, regionIndex: number): Encounter {
  return {
    ...encounter,
    regions: encounter.regions.filter((region) => region.index !== regionIndex),
  };
}

export function syncRegionIndices(encounter: Encounter, tempToRealMap: Map<number, number>): Encounter {
  return {
    ...encounter,
    regions: encounter.regions.map((region) => {
      if (region.index < 0 && tempToRealMap.has(region.index)) {
        const realIndex = tempToRealMap.get(region.index);
        if (realIndex !== undefined) {
          return {
            ...region,
            index: realIndex,
          };
        }
      }
      return region;
    }),
  };
}

export function filterEncounterForMergeDetection(
  encounter: Encounter | null,
  options?: {
    excludeRegionIndex?: number;
  },
): Encounter | null {
  if (!encounter) return null;

  const filtered = encounter.regions.filter((r) => {
    if (r.index === -1) return false;
    if (options?.excludeRegionIndex !== undefined && r.index === options.excludeRegionIndex) {
      return false;
    }
    return true;
  });

  return {
    ...encounter,
    regions: filtered,
  };
}
