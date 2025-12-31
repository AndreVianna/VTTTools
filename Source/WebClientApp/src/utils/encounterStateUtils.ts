import type { Encounter, EncounterRegion, EncounterWall } from '@/types/domain';
import type { StageRegion, StageWall } from '@/types/stage';

// Type alias for walls that can be either Stage or Encounter walls
type WallLike = StageWall | EncounterWall;
type RegionLike = StageRegion | EncounterRegion;

export function addWallOptimistic(encounter: Encounter, wall: WallLike): Encounter {
  return {
    ...encounter,
    stage: {
      ...encounter.stage,
      walls: [...encounter.stage.walls.filter((w) => w.index !== -1), wall as StageWall],
    },
  };
}

export function updateWallOptimistic(
  encounter: Encounter,
  wallIndex: number,
  changes: Partial<WallLike>,
): Encounter {
  const wallIndexPosition = encounter.stage.walls.findIndex((w) => w.index === wallIndex);

  if (wallIndexPosition === -1) {
    return encounter;
  }

  return {
    ...encounter,
    stage: {
      ...encounter.stage,
      walls: encounter.stage.walls.map((wall, idx) => (idx === wallIndexPosition ? { ...wall, ...changes } : wall)),
    },
  };
}

export function removeWallOptimistic(encounter: Encounter, wallIndex: number): Encounter {
  return {
    ...encounter,
    stage: {
      ...encounter.stage,
      walls: encounter.stage.walls.filter((wall) => wall.index !== wallIndex),
    },
  };
}

export function syncWallIndices(encounter: Encounter, tempToRealMap: Map<number, number>): Encounter {
  return {
    ...encounter,
    stage: {
      ...encounter.stage,
      walls: encounter.stage.walls.map((wall) => {
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
    },
  };
}

export function removeTempRegions(encounter: Encounter): Encounter {
  return {
    ...encounter,
    stage: {
      ...encounter.stage,
      regions: encounter.stage.regions.filter((r) => r.index !== -1),
    },
  };
}

export function addRegionOptimistic(encounter: Encounter, region: RegionLike): Encounter {
  const cleanedEncounter = removeTempRegions(encounter);
  return {
    ...cleanedEncounter,
    stage: {
      ...cleanedEncounter.stage,
      regions: [...cleanedEncounter.stage.regions, region as StageRegion],
    },
  };
}

export function updateRegionOptimistic(
  encounter: Encounter,
  regionIndex: number,
  changes: Partial<RegionLike>,
): Encounter {
  const regionIndexPosition = encounter.stage.regions.findIndex((r) => r.index === regionIndex);

  if (regionIndexPosition === -1) {
    return encounter;
  }

  return {
    ...encounter,
    stage: {
      ...encounter.stage,
      regions: encounter.stage.regions.map((region, idx) => (idx === regionIndexPosition ? { ...region, ...changes } : region)),
    },
  };
}

export function removeRegionOptimistic(encounter: Encounter, regionIndex: number): Encounter {
  return {
    ...encounter,
    stage: {
      ...encounter.stage,
      regions: encounter.stage.regions.filter((region) => region.index !== regionIndex),
    },
  };
}

export function syncRegionIndices(encounter: Encounter, tempToRealMap: Map<number, number>): Encounter {
  return {
    ...encounter,
    stage: {
      ...encounter.stage,
      regions: encounter.stage.regions.map((region) => {
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
    },
  };
}

export function filterEncounterForMergeDetection(
  encounter: Encounter | null,
  options?: {
    excludeRegionIndex?: number;
  },
): Encounter | null {
  if (!encounter) return null;

  const filtered = encounter.stage.regions.filter((r) => {
    if (r.index === -1) return false;
    if (options?.excludeRegionIndex !== undefined && r.index === options.excludeRegionIndex) {
      return false;
    }
    return true;
  });

  return {
    ...encounter,
    stage: {
      ...encounter.stage,
      regions: filtered,
    },
  };
}
