import React, { useMemo } from 'react';
import { Shape } from 'react-konva';
import { useTheme } from '@mui/material';
import { calculateLineOfSight } from '@/utils/lineOfSightCalculation';
import type { SceneSource, SceneWall } from '@/types/domain';
import { WallVisibility } from '@/types/domain';
import type { GridConfig } from '@/utils/gridCalculator';

export interface SourceRendererProps {
    sceneSource: SceneSource;
    walls: SceneWall[];
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
    walls,
    gridConfig
}) => {
    const theme = useTheme();
    const color = getSourceColor(sceneSource.type, theme);

    const opaqueWalls = useMemo(() => {
        return walls.filter(w => w.visibility !== WallVisibility.Invisible);
    }, [walls]);

    const effectiveRange = sceneSource.range ?? 5.0;
    const effectiveIntensity = sceneSource.intensity ?? 1.0;
    const effectiveIsGradient = sceneSource.hasGradient;

    const losPolygon = useMemo(() => {
        return calculateLineOfSight(sceneSource, effectiveRange, opaqueWalls, gridConfig);
    }, [sceneSource, effectiveRange, opaqueWalls, gridConfig]);

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
