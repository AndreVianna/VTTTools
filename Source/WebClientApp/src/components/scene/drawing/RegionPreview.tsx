import React from 'react';
import { Line } from 'react-konva';
import { useTheme } from '@mui/material/styles';
import type { Point, Region } from '@/types/domain';

export interface RegionPreviewProps {
    vertices: Point[];
    previewVertex: Point | null;
    region: Region;
}

export const RegionPreview: React.FC<RegionPreviewProps> = ({
    vertices,
    previewVertex,
    region
}) => {
    const theme = useTheme();

    if (vertices.length === 0) return null;

    const getRegionColor = (): string => {
        const regionType = region.regionType.toLowerCase();
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

    const color = getRegionColor();

    return (
        <>
            {vertices.length >= 3 && (() => {
                const firstVertex = vertices[0];
                if (!firstVertex) return null;
                return (
                    <Line
                        points={[...vertices, firstVertex].flatMap(v => [v.x, v.y])}
                        fill={color}
                        stroke={color}
                        strokeWidth={2}
                        opacity={0.3}
                        fillOpacity={0.3}
                        strokeOpacity={0.8}
                        closed={true}
                        listening={false}
                    />
                );
            })()}
            {vertices.length > 0 && vertices.length < 3 && (
                <Line
                    points={vertices.flatMap(v => [v.x, v.y])}
                    stroke={color}
                    strokeWidth={2}
                    opacity={0.5}
                    listening={false}
                />
            )}
            {vertices.length > 0 && previewVertex && (() => {
                const lastVertex = vertices[vertices.length - 1];
                if (!lastVertex) return null;
                return (
                    <Line
                        points={[
                            lastVertex.x,
                            lastVertex.y,
                            previewVertex.x,
                            previewVertex.y
                        ]}
                        stroke={theme.palette.grey[500]}
                        strokeWidth={1}
                        dash={[5, 5]}
                        opacity={0.5}
                        listening={false}
                    />
                );
            })()}
        </>
    );
};

RegionPreview.displayName = 'RegionPreview';
