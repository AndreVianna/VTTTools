import React from 'react';
import { Line } from 'react-konva';
import { useTheme } from '@mui/material/styles';
import { RegionLabelDisplay } from './RegionLabelDisplay';
import { calculatePolygonCentroid } from '@/utils/geometryUtils';
import { REGION_PRESETS } from '../panels/regionsPanelTypes';
import type { PlacedRegion } from '@/types/domain';

export interface RegionRendererProps {
    sceneRegion: PlacedRegion;
}

export const RegionRenderer: React.FC<RegionRendererProps> = ({ sceneRegion }) => {
    const theme = useTheme();

    const getRegionColor = (): string => {
        if (sceneRegion.color) {
            return sceneRegion.color;
        }

        const preset = REGION_PRESETS.find(p => p.type === sceneRegion.type);
        if (preset) {
            return preset.color;
        }

        return theme.palette.grey[400];
    };

    const getLabelText = (): string => {
        if (sceneRegion.label) {
            return sceneRegion.label;
        }
        if (sceneRegion.value !== undefined && sceneRegion.value !== null) {
            return `${sceneRegion.value}`;
        }
        return sceneRegion.type;
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
