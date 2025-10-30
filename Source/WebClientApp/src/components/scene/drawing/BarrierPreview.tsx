import React from 'react';
import { Line } from 'react-konva';
import { useTheme } from '@mui/material';
import { WallVisibility, type Point, type Pole, type Barrier } from '@/types/domain';

export interface BarrierPreviewProps {
    poles: Pole[];
    previewPoint: Point | null;
    barrier: Barrier;
}

export const BarrierPreview: React.FC<BarrierPreviewProps> = ({
    poles,
    previewPoint,
    barrier
}) => {
    const theme = useTheme();

    if (poles.length === 0) return null;

    const getBarrierStyle = (visibility: WallVisibility) => {
        switch (visibility) {
            case WallVisibility.Normal:
                return {
                    stroke: theme.palette.error.main,
                    strokeWidth: 3,
                    dash: undefined
                };
            case WallVisibility.Fence:
                return {
                    stroke: theme.palette.warning.main,
                    strokeWidth: 2,
                    dash: [8, 4]
                };
            case WallVisibility.Invisible:
                return {
                    stroke: theme.palette.grey[500],
                    strokeWidth: 2,
                    dash: [4, 4]
                };
        }
    };

    const style = getBarrierStyle(barrier.visibility);

    return (
        <>
            {poles.length > 0 && (
                <Line
                    points={poles.flatMap(p => [p.x, p.y])}
                    stroke={style.stroke}
                    strokeWidth={style.strokeWidth}
                    dash={style.dash}
                    listening={false}
                />
            )}
            {poles.length > 0 && previewPoint && (() => {
                const lastPole = poles[poles.length - 1];
                if (!lastPole) return null;
                return (
                    <Line
                        points={[
                            lastPole.x,
                            lastPole.y,
                            previewPoint.x,
                            previewPoint.y
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

BarrierPreview.displayName = 'BarrierPreview';
