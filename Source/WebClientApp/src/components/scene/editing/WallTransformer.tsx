import React, { useState } from 'react';
import { Group, Circle, Line } from 'react-konva';
import { useTheme } from '@mui/material';
import type { Pole } from '@/types/domain';
import type { GridConfig } from '@/utils/gridCalculator';
import { snapToGrid } from '@/utils/gridCalculator';

export interface WallTransformerProps {
    poles: Pole[];
    onPolesChange?: (poles: Pole[]) => void;
    gridConfig?: GridConfig;
    snapEnabled?: boolean;
}

export const WallTransformer: React.FC<WallTransformerProps> = ({
    poles,
    onPolesChange,
    gridConfig,
    snapEnabled = true
}) => {
    const theme = useTheme();
    const [draggingIndex, setDraggingIndex] = useState<number | null>(null);
    const [previewPoles, setPreviewPoles] = useState<Pole[]>(poles);

    const handleDragStart = (index: number) => {
        setDraggingIndex(index);
    };

    const handleDragMove = (index: number, e: any) => {
        const newPoles = [...previewPoles];
        let newX = e.target.x();
        let newY = e.target.y();

        if (snapEnabled && gridConfig) {
            const snapped = snapToGrid({ x: newX, y: newY }, gridConfig);
            newX = snapped.x;
            newY = snapped.y;
        }

        newPoles[index] = { ...newPoles[index], x: newX, y: newY };
        setPreviewPoles(newPoles);

        e.target.x(newX);
        e.target.y(newY);
    };

    const handleDragEnd = (index: number, e: any) => {
        setDraggingIndex(null);
        let newX = e.target.x();
        let newY = e.target.y();

        if (snapEnabled && gridConfig) {
            const snapped = snapToGrid({ x: newX, y: newY }, gridConfig);
            newX = snapped.x;
            newY = snapped.y;
        }

        const newPoles = [...poles];
        newPoles[index] = { ...newPoles[index], x: newX, y: newY };

        if (newPoles.length >= 2) {
            onPolesChange?.(newPoles);
        }
        setPreviewPoles(newPoles);
    };

    const polesToUse = draggingIndex !== null ? previewPoles : poles;

    return (
        <Group>
            <Line
                points={polesToUse.flatMap(p => [p.x, p.y])}
                stroke={theme.palette.primary.main}
                strokeWidth={3}
                listening={false}
            />

            {polesToUse.map((pole, index) => (
                <Circle
                    key={index}
                    x={pole.x}
                    y={pole.y}
                    radius={5}
                    fill={theme.palette.primary.main}
                    draggable
                    onDragStart={() => handleDragStart(index)}
                    onDragMove={(e) => handleDragMove(index, e)}
                    onDragEnd={(e) => handleDragEnd(index, e)}
                    onMouseEnter={(e) => {
                        const container = e.target.getStage()?.container();
                        if (container) {
                            container.style.cursor = 'move';
                        }
                    }}
                    onMouseLeave={(e) => {
                        const container = e.target.getStage()?.container();
                        if (container) {
                            container.style.cursor = 'default';
                        }
                    }}
                />
            ))}
        </Group>
    );
};

WallTransformer.displayName = 'WallTransformer';
