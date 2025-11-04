import type { Scene, SceneWall } from '@/types/domain';

export function addWallOptimistic(scene: Scene, wall: SceneWall): Scene {
    return {
        ...scene,
        walls: [
            ...scene.walls,
            wall
        ]
    };
}

export function updateWallOptimistic(
    scene: Scene,
    wallIndex: number,
    changes: Partial<SceneWall>
): Scene {
    const wallIndexPosition = scene.walls.findIndex(w => w.index === wallIndex);

    if (wallIndexPosition === -1) {
        return scene;
    }

    return {
        ...scene,
        walls: scene.walls.map((wall, idx) =>
            idx === wallIndexPosition
                ? { ...wall, ...changes }
                : wall
        )
    };
}

export function removeWallOptimistic(scene: Scene, wallIndex: number): Scene {
    return {
        ...scene,
        walls: scene.walls.filter(wall => wall.index !== wallIndex)
    };
}

export function syncWallIndices(
    scene: Scene,
    tempToRealMap: Map<number, number>
): Scene {
    return {
        ...scene,
        walls: scene.walls.map(wall => {
            if (wall.index < 0 && tempToRealMap.has(wall.index)) {
                return {
                    ...wall,
                    index: tempToRealMap.get(wall.index)!
                };
            }
            return wall;
        })
    };
}
