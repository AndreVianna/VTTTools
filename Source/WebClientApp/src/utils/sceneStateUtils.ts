import type { Scene, SceneWall, SceneRegion } from '@/types/domain';

export function addWallOptimistic(scene: Scene, wall: SceneWall): Scene {
    return {
        ...scene,
        walls: [
            ...scene.walls.filter(w => w.index !== -1),
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

export function removeTempRegions(scene: Scene): Scene {
    return {
        ...scene,
        regions: scene.regions.filter(r => r.index !== -1)
    };
}

export function addRegionOptimistic(scene: Scene, region: SceneRegion): Scene {
    const cleanedScene = removeTempRegions(scene);
    return {
        ...cleanedScene,
        regions: [
            ...cleanedScene.regions,
            region
        ]
    };
}

export function updateRegionOptimistic(
    scene: Scene,
    regionIndex: number,
    changes: Partial<SceneRegion>
): Scene {
    const regionIndexPosition = scene.regions.findIndex(r => r.index === regionIndex);

    if (regionIndexPosition === -1) {
        return scene;
    }

    return {
        ...scene,
        regions: scene.regions.map((region, idx) =>
            idx === regionIndexPosition
                ? { ...region, ...changes }
                : region
        )
    };
}

export function removeRegionOptimistic(scene: Scene, regionIndex: number): Scene {
    return {
        ...scene,
        regions: scene.regions.filter(region => region.index !== regionIndex)
    };
}

export function syncRegionIndices(
    scene: Scene,
    tempToRealMap: Map<number, number>
): Scene {
    return {
        ...scene,
        regions: scene.regions.map(region => {
            if (region.index < 0 && tempToRealMap.has(region.index)) {
                return {
                    ...region,
                    index: tempToRealMap.get(region.index)!
                };
            }
            return region;
        })
    };
}

export function filterSceneForMergeDetection(
    scene: Scene | null,
    options?: {
        excludeRegionIndex?: number;
    }
): Scene | null {
    if (!scene) return null;

    const filtered = scene.regions.filter(r => {
        if (r.index === -1) return false;
        if (options?.excludeRegionIndex !== undefined && r.index === options.excludeRegionIndex) {
            return false;
        }
        return true;
    });

    return {
        ...scene,
        regions: filtered
    };
}
