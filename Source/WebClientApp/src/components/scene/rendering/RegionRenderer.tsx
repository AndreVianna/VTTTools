import React from 'react';
import { Line } from 'react-konva';
import { useTheme } from '@mui/material/styles';
import { RegionLabelDisplay } from './RegionLabelDisplay';
import { calculatePolygonCentroid } from '@/utils/geometryUtils';
import type { SceneRegion } from '@/types/domain';

export interface RegionRendererProps {
    sceneRegion: SceneRegion;
}

export const RegionRenderer: React.FC<RegionRendererProps> = ({ sceneRegion }) => {
    const theme = useTheme();

    const getRegionColor = (): string => {
        const regionType = sceneRegion.type.toLowerCase();
        switch (regionType) {
            case 'illumination':
                return theme.palette.warning.main;
            case 'elevation':
                return theme.palette.warning.dark;
            case 'fogofwar':
                return theme.palette.grey[500];
            case 'weather':
                return theme.palette.info.light;
            default:
                return theme.palette.grey[400];
        }
    };

    const getLabelText = (): string => {
        return sceneRegion.label || `Value: ${sceneRegion.value ?? 0}`;
    };

    const color = getRegionColor();
    const centroid = calculatePolygonCentroid(sceneRegion.vertices);
    const firstVertex = sceneRegion.vertices[0];
    if (!firstVertex) return null;
    const points = [...sceneRegion.vertices, firstVertex].flatMap(v => [v.x, v.y]);

    return (
        <>
            <Line
                points={points}
                fill={color}
                stroke={color}
                strokeWidth={2}
                opacity={0.3}
                fillOpacity={0.3}
                strokeOpacity={0.8}
                closed={true}
                listening={false}
            />
            <RegionLabelDisplay centroid={centroid} label={getLabelText()} />
        </>
    );
};

RegionRenderer.displayName = 'RegionRenderer';
