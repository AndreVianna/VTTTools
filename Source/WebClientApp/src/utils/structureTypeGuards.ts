import type { SceneWall, SceneRegion, SceneSource } from '@/types/domain';

export const isSceneWall = (structure: SceneWall | SceneRegion | SceneSource): structure is SceneWall => {
    return (
        'visibility' in structure &&
        'poles' in structure &&
        'isClosed' in structure &&
        !('vertices' in structure) &&
        !('position' in structure)
    );
};

export const isSceneRegion = (structure: SceneWall | SceneRegion | SceneSource): structure is SceneRegion => {
    return (
        'vertices' in structure &&
        'type' in structure &&
        !('poles' in structure) &&
        !('position' in structure)
    );
};

export const isSceneSource = (structure: SceneWall | SceneRegion | SceneSource): structure is SceneSource => {
    return (
        'position' in structure &&
        'direction' in structure &&
        'hasGradient' in structure &&
        !('poles' in structure) &&
        !('vertices' in structure)
    );
};

isSceneWall.displayName = 'isSceneWall';
isSceneRegion.displayName = 'isSceneRegion';
isSceneSource.displayName = 'isSceneSource';
