import type { EncounterRegion, EncounterSource, EncounterWall } from '@/types/domain';

export const isEncounterWall = (
  structure: EncounterWall | EncounterRegion | EncounterSource,
): structure is EncounterWall => {
  return (
    'visibility' in structure &&
    'poles' in structure &&
    'isClosed' in structure &&
    !('vertices' in structure) &&
    !('position' in structure)
  );
};

export const isEncounterRegion = (
  structure: EncounterWall | EncounterRegion | EncounterSource,
): structure is EncounterRegion => {
  return 'vertices' in structure && 'type' in structure && !('poles' in structure) && !('position' in structure);
};

export const isEncounterSource = (
  structure: EncounterWall | EncounterRegion | EncounterSource,
): structure is EncounterSource => {
  return (
    'position' in structure &&
    'direction' in structure &&
    'hasGradient' in structure &&
    !('poles' in structure) &&
    !('vertices' in structure)
  );
};

isEncounterWall.displayName = 'isEncounterWall';
isEncounterRegion.displayName = 'isEncounterRegion';
isEncounterSource.displayName = 'isEncounterSource';
