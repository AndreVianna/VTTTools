import type { EncounterRegion, EncounterLightSource, EncounterSoundSource, EncounterWall } from '@/types/domain';

export const isEncounterWall = (
  structure: EncounterWall | EncounterRegion | EncounterLightSource | EncounterSoundSource,
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
  structure: EncounterWall | EncounterRegion | EncounterLightSource | EncounterSoundSource,
): structure is EncounterRegion => {
  return 'vertices' in structure && 'type' in structure && !('poles' in structure) && !('position' in structure);
};

export const isEncounterLightSource = (
  structure: EncounterWall | EncounterRegion | EncounterLightSource | EncounterSoundSource,
): structure is EncounterLightSource => {
  return (
    'position' in structure &&
    'direction' in structure &&
    'hasGradient' in structure &&
    'type' in structure &&
    'isOn' in structure &&
    !('poles' in structure) &&
    !('vertices' in structure) &&
    !('isPlaying' in structure)
  );
};

export const isEncounterSoundSource = (
  structure: EncounterWall | EncounterRegion | EncounterLightSource | EncounterSoundSource,
): structure is EncounterSoundSource => {
  return (
    'position' in structure &&
    'direction' in structure &&
    'hasGradient' in structure &&
    'isPlaying' in structure &&
    !('poles' in structure) &&
    !('vertices' in structure) &&
    !('type' in structure)
  );
};

isEncounterWall.displayName = 'isEncounterWall';
isEncounterRegion.displayName = 'isEncounterRegion';
isEncounterLightSource.displayName = 'isEncounterLightSource';
isEncounterSoundSource.displayName = 'isEncounterSoundSource';
