import React, { useMemo } from 'react';
import { Shape } from 'react-konva';
import { useTheme } from '@mui/material/styles';
import type { Theme } from '@mui/material/styles';
import { calculateLineOfSight } from '@/utils/lineOfSightCalculation';
import type { EncounterSource, EncounterWall } from '@/types/domain';
import { WallVisibility } from '@/types/domain';
import type { GridConfig } from '@/utils/gridCalculator';

export interface SourceRendererProps {
    encounterSource: EncounterSource;
    walls: EncounterWall[];
    gridConfig: GridConfig;
}

const getSourceColor = (sourceType: string, theme: Theme): string => {
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
    encounterSource,
    walls,
    gridConfig
}) => {
    const theme = useTheme();
    const defaultColor = getSourceColor(encounterSource.type, theme);
    const color = encounterSource.color ?? defaultColor;

    const opaqueWalls = useMemo(() => {
        return walls.filter(w => w.visibility !== WallVisibility.Invisible);
    }, [walls]);

    const effectiveRange = encounterSource.range ?? 5.0;
    const effectiveIntensity = encounterSource.intensity ?? 1.0;
    const effectiveIsGradient = encounterSource.hasGradient;

    const losPolygon = useMemo(() => {
        return calculateLineOfSight(encounterSource, effectiveRange, opaqueWalls, gridConfig);
    }, [encounterSource, effectiveRange, opaqueWalls, gridConfig]);

    const rangeInPixels = effectiveRange * gridConfig.cellSize.width;

    return (
        <Shape
            encounterFunc={(context) => {
                if (losPolygon.length < 3) return;

                const firstPoint = losPolygon[0];
                if (!firstPoint) return;

                context.beginPath();
                context.moveTo(firstPoint.x, firstPoint.y);
                for (let i = 1; i < losPolygon.length; i++) {
                    const point = losPolygon[i];
                    if (!point) continue;
                    context.lineTo(point.x, point.y);
                }
                context.closePath();

                if (effectiveIsGradient) {
                    const gradient = context.createRadialGradient(
                        encounterSource.position.x,
                        encounterSource.position.y,
                        0,
                        encounterSource.position.x,
                        encounterSource.position.y,
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
