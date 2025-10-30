import React, { useMemo } from 'react';
import { Shape } from 'react-konva';
import { useTheme } from '@mui/material';
import { calculateLineOfSight } from '@/utils/lineOfSightCalculation';
import type { SceneSource, Source, SceneBarrier } from '@/types/domain';
import type { GridConfig } from '@/utils/gridCalculator';

export interface SourceRendererProps {
    sceneSource: SceneSource;
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

export const SourceRenderer: React.FC<SourceRendererProps> = ({
    sceneSource,
    source,
    barriers,
    gridConfig
}) => {
    const theme = useTheme();
    const color = getSourceColor(source.sourceType, theme);

    const opaqueBarriers = useMemo(() => {
        return barriers.filter(b => b.isOpen !== true);
    }, [barriers]);

    const effectiveRange = sceneSource.range;
    const effectiveIntensity = sceneSource.intensity;
    const effectiveIsGradient = sceneSource.isGradient;

    const losPolygon = useMemo(() => {
        return calculateLineOfSight(sceneSource, effectiveRange, opaqueBarriers, gridConfig);
    }, [sceneSource, effectiveRange, opaqueBarriers, gridConfig]);

    const rangeInPixels = effectiveRange * gridConfig.cellSize.width;

    return (
        <Shape
            sceneFunc={(context) => {
                if (losPolygon.length < 3) return;

                context.beginPath();
                context.moveTo(losPolygon[0].x, losPolygon[0].y);
                for (let i = 1; i < losPolygon.length; i++) {
                    context.lineTo(losPolygon[i].x, losPolygon[i].y);
                }
                context.closePath();

                if (effectiveIsGradient) {
                    const gradient = context.createRadialGradient(
                        sceneSource.position.x,
                        sceneSource.position.y,
                        0,
                        sceneSource.position.x,
                        sceneSource.position.y,
                        rangeInPixels
                    );

                    const transparentColor = color.startsWith('#')
                        ? `${color}00`
                        : color.replace(')', ', 0)').replace('rgb(', 'rgba(');

                    gradient.addColorStop(0, color);
                    gradient.addColorStop(1, transparentColor);

                    context.fillStyle = gradient;
                    context.globalAlpha = effectiveIntensity;
                    context.fill();
                } else {
                    context.fillStyle = color;
                    context.globalAlpha = effectiveIntensity;
                    context.fill();
                }
            }}
            listening={false}
        />
    );
};

SourceRenderer.displayName = 'SourceRenderer';
