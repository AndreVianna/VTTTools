import { useTheme } from '@mui/material/styles';
import type Konva from 'konva';
import React, { useCallback, useMemo } from 'react';
import { Group, Line } from 'react-konva';
import type { PlacedRegion, Point } from '@/types/domain';

const FOG_OF_WAR_TYPE = 'FogOfWar';
const FOG_VALUE_VISIBLE = 0;
const FOG_VALUE_HIDDEN = 2;

const flattenVertices = (vertices: Point[]): number[] => {
    return vertices.flatMap((v) => [v.x, v.y]);
};

export interface FogOfWarRendererProps {
    encounterId: string;
    regions: PlacedRegion[];
    visible: boolean;
}

const FogOfWarRendererComponent: React.FC<FogOfWarRendererProps> = ({
    encounterId,
    regions,
    visible,
}) => {
    const theme = useTheme();

    const fogColor = useMemo(() => {
        return theme.palette.mode === 'dark'
            ? 'rgba(0, 0, 0, 0.75)'
            : 'rgba(0, 0, 0, 0.6)';
    }, [theme.palette.mode]);

    const sortedFogRegions = useMemo(() => {
        return regions
            .filter((region) => region.type === FOG_OF_WAR_TYPE && (region.value === FOG_VALUE_HIDDEN || region.value === FOG_VALUE_VISIBLE))
            .sort((a, b) => a.name.localeCompare(b.name, undefined, { numeric: true }));
    }, [regions]);

    const handleLineRef = useCallback((node: Konva.Line | null, isSubtract: boolean) => {
        if (node && isSubtract) {
            node.globalCompositeOperation('destination-out');
        }
    }, []);

    const hasHiddenRegions = sortedFogRegions.some((r) => r.value === FOG_VALUE_HIDDEN);
    if (!visible || !hasHiddenRegions) {
        return null;
    }

    return (
        <Group id='fog-of-war-layer' listening={false}>
            {sortedFogRegions.map((region) => {
                const points = flattenVertices(region.vertices);
                const regionId = `fog-${encounterId}-${region.index}`;
                const isSubtract = region.value === FOG_VALUE_VISIBLE;

                return (
                    <Line
                        key={region.id || regionId}
                        id={regionId}
                        points={points}
                        fill={fogColor}
                        closed={true}
                        listening={false}
                        ref={(node) => handleLineRef(node, isSubtract)}
                    />
                );
            })}
        </Group>
    );
};

FogOfWarRendererComponent.displayName = 'FogOfWarRenderer';

export const FogOfWarRenderer = React.memo(FogOfWarRendererComponent);
