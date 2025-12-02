import { useCallback, useMemo } from 'react';
import polygonClipping from 'polygon-clipping';
import type { PlacedRegion, Point } from '@/types/domain';

export interface UseFogOfWarPlacementParams {
    encounterId: string;
    existingRegions: PlacedRegion[];
    mode: 'add' | 'subtract';
    onRegionCreated: (region: PlacedRegion) => void;
    onRegionsDeleted?: (regionIndices: number[]) => Promise<void>;
}

type GeoJSONPolygon = number[][][];
type MultiPolygon = number[][][][];

function toGeoJSONPolygon(vertices: Point[]): GeoJSONPolygon {
    if (vertices.length === 0) {
        return [[]];
    }
    const ring = vertices.map((v) => [v.x, v.y]);
    const firstPoint = ring[0];
    if (firstPoint) {
        ring.push(firstPoint);
    }
    return [ring];
}

function fromGeoJSONPolygon(polygon: GeoJSONPolygon): Point[] {
    const ring = polygon[0];
    if (!ring || ring.length === 0) {
        return [];
    }
    const vertices = ring
        .slice(0, -1)
        .filter((coord) => coord.length >= 2 && coord[0] !== undefined && coord[1] !== undefined)
        .map((coord) => ({ x: coord[0]!, y: coord[1]! }));
    return vertices;
}

function getMaxChildIndex(parentName: string, regions: PlacedRegion[]): number {
    const prefix = `${parentName}.`;
    let maxIndex = 0;

    for (const region of regions) {
        if (region.name.startsWith(prefix)) {
            const childPart = region.name.substring(prefix.length);
            const dotIndex = childPart.indexOf('.');
            const immediateChild = dotIndex === -1 ? childPart : childPart.substring(0, dotIndex);
            const childIndex = parseInt(immediateChild, 10);
            if (!isNaN(childIndex) && childIndex > maxIndex) {
                maxIndex = childIndex;
            }
        }
    }

    return maxIndex;
}

function getNextHierarchicalName(existingRegions: PlacedRegion[], mode: 'add' | 'subtract'): string {
    if (mode === 'add') {
        let maxRootIndex = 0;
        for (const region of existingRegions) {
            if (region.type === 'FogOfWar') {
                const dotIndex = region.name.indexOf('.');
                const rootPart = dotIndex === -1 ? region.name : region.name.substring(0, dotIndex);
                const rootIndex = parseInt(rootPart, 10);
                if (!isNaN(rootIndex) && rootIndex > maxRootIndex) {
                    maxRootIndex = rootIndex;
                }
            }
        }
        return `${maxRootIndex + 1}`;
    }

    const fowRegions = existingRegions.filter((r) => r.type === 'FogOfWar');
    if (fowRegions.length === 0) {
        return '1';
    }

    const sortedByIndex = [...fowRegions].sort((a, b) => b.index - a.index);
    const mostRecent = sortedByIndex[0];

    if (mostRecent === undefined) {
        return '1';
    }

    const parentName = mostRecent.name;
    const maxChildIndex = getMaxChildIndex(parentName, fowRegions);
    return `${parentName}.${maxChildIndex + 1}`;
}

export function useFogOfWarPlacement(params: UseFogOfWarPlacementParams) {
    const { encounterId, existingRegions, mode, onRegionCreated, onRegionsDeleted } = params;

    const fowRegions = useMemo(
        () => existingRegions.filter((r) => r.type === 'FogOfWar'),
        [existingRegions],
    );

    const handlePolygonComplete = useCallback(
        async (vertices: Point[]) => {
            if (!vertices || vertices.length < 3) {
                return;
            }

            if (mode === 'add') {
                const newPoly = toGeoJSONPolygon(vertices);
                const existingHiddenRegions = fowRegions.filter((r) => r.value === 2);

                let resultPolygons: MultiPolygon;

                if (existingHiddenRegions.length === 0) {
                    resultPolygons = [newPoly];
                } else {
                    const existingPolys = existingHiddenRegions.map((r) =>
                        toGeoJSONPolygon(r.vertices),
                    );
                    resultPolygons = polygonClipping.union(existingPolys as any, [newPoly] as any) as MultiPolygon;

                    if (onRegionsDeleted && existingHiddenRegions.length > 0) {
                        const indicesToDelete = existingHiddenRegions.map((r) => r.index);
                        await onRegionsDeleted(indicesToDelete);
                    }
                }

                if (resultPolygons.length === 0) {
                    return;
                }

                const nextIndex = Math.max(0, ...existingRegions.map((r) => r.index)) + 1;
                const baseName = getNextHierarchicalName(fowRegions, 'add');

                resultPolygons.forEach((poly, idx) => {
                    const resultVertices = fromGeoJSONPolygon(poly);
                    if (resultVertices.length < 3) {
                        return;
                    }

                    const regionName = resultPolygons.length > 1 ? `${baseName}.${idx + 1}` : baseName;

                    const newRegion: PlacedRegion = {
                        id: '',
                        encounterId,
                        index: nextIndex + idx,
                        type: 'FogOfWar',
                        name: regionName,
                        value: 2,
                        vertices: resultVertices,
                    };

                    onRegionCreated(newRegion);
                });
            } else {
                const nextIndex = Math.max(0, ...existingRegions.map((r) => r.index)) + 1;
                const hierarchicalName = getNextHierarchicalName(fowRegions, 'subtract');

                const newRegion: PlacedRegion = {
                    id: '',
                    encounterId,
                    index: nextIndex,
                    type: 'FogOfWar',
                    name: hierarchicalName,
                    value: 0,
                    vertices,
                };

                onRegionCreated(newRegion);
            }
        },
        [encounterId, existingRegions, fowRegions, mode, onRegionCreated, onRegionsDeleted],
    );

    return {
        handlePolygonComplete,
        handleBucketFillComplete: handlePolygonComplete,
    };
}
