import React, { useMemo } from 'react';
import { Circle, Shape, Text } from 'react-konva';
import { useTheme } from '@mui/material';
import { calculateLineOfSight } from '@/utils/lineOfSightCalculation';
import { VertexMarker } from './VertexMarker';
import type { Point, Source, SceneBarrier, SceneSource } from '@/types/domain';
import type { GridConfig } from '@/utils/gridCalculator';

export interface SourcePreviewProps {
    centerPos: Point;
    range: number;
    source: Source;
    barriers: SceneBarrier[];
    gridConfig: GridConfig;
}

const getSourceColor = (sourceType: string, theme: ReturnType<typeof useTheme>): string => {
    switch (sourceType.toLowerCase()) {
        case 'light':
            return theme.palette.warning.light;
        case 'sound':
            return theme.palette.info.light;
        default:
            return theme.palette.grey[400];
    }
};

export const SourcePreview: React.FC<SourcePreviewProps> = ({
    centerPos,
    range,
    source,
    barriers,
    gridConfig
}) => {
    const theme = useTheme();
    const color = getSourceColor(source.sourceType, theme);

    const opaqueBarriers = useMemo(() => {
        return barriers.filter(b => b.isOpen !== true);
    }, [barriers]);

    const losPolygon = useMemo(() => {
        const tempSource: SceneSource = {
            id: 'preview',
            sceneId: 'preview',
            sourceId: source.id,
            position: centerPos,
            range,
            intensity: source.defaultIntensity,
            isGradient: source.defaultIsGradient
        };
        return calculateLineOfSight(tempSource, range, opaqueBarriers, gridConfig);
    }, [centerPos, range, opaqueBarriers, gridConfig, source.id, source.defaultIntensity, source.defaultIsGradient]);

    const rangeInPixels = range * gridConfig.cellSize.width;

    return (
        <>
            <Circle
                x={centerPos.x}
                y={centerPos.y}
                radius={rangeInPixels}
                stroke={color}
                strokeWidth={1}
                dash={[5, 5]}
                opacity={0.5}
                listening={false}
            />

            <Shape
                sceneFunc={(context) => {
                    if (losPolygon.length < 3) return;

                    context.beginPath();
                    context.moveTo(losPolygon[0].x, losPolygon[0].y);
                    for (let i = 1; i < losPolygon.length; i++) {
                        context.lineTo(losPolygon[i].x, losPolygon[i].y);
                    }
                    context.closePath();

                    context.fillStyle = color;
                    context.globalAlpha = source.defaultIsGradient ? 0.3 : 0.2;
                    context.fill();
                }}
                listening={false}
            />

            <VertexMarker position={centerPos} preview />

            <Text
                x={centerPos.x + 10}
                y={centerPos.y - 10}
                text={`Range: ${range.toFixed(1)}`}
                fontSize={14}
                fill={theme.palette.text.primary}
                listening={false}
            />
        </>
    );
};

SourcePreview.displayName = 'SourcePreview';
