import React from 'react';
import { Group, Line, Circle } from 'react-konva';
import { useTheme } from '@mui/material';
import type { Point } from '@/types/domain';

export interface RegionPreviewProps {
    vertices: Point[];
    cursorPos?: { x: number; y: number };
    color?: string;
}

function flattenPoints(vertices: Point[]): number[] {
    return vertices.flatMap(v => [v.x, v.y]);
}

export const RegionPreview: React.FC<RegionPreviewProps> = React.memo(({
    vertices,
    cursorPos,
    color
}) => {
    const theme = useTheme();
    const strokeColor = color || theme.palette.primary.main;

    if (vertices.length === 0) return null;

    return (
        <Group name="RegionPreview">
            {vertices.length >= 3 && (
                <Line
                    points={flattenPoints(vertices)}
                    fill={strokeColor}
                    opacity={0.2}
                    closed={true}
                    listening={false}
                />
            )}

            {vertices.length >= 2 && vertices.slice(0, -1).map((vertex, index) => {
                const nextVertex = vertices[index + 1];
                if (!nextVertex) return null;
                return (
                    <Line
                        key={`segment-${index}`}
                        points={[vertex.x, vertex.y, nextVertex.x, nextVertex.y]}
                        stroke={strokeColor}
                        strokeWidth={2}
                        opacity={0.8}
                        listening={false}
                    />
                );
            })}

            {vertices.length >= 3 && (() => {
                const firstVertex = vertices[0];
                const lastVertex = vertices[vertices.length - 1];
                if (!firstVertex || !lastVertex) return null;
                return (
                    <Line
                        key="closing-line"
                        points={[lastVertex.x, lastVertex.y, firstVertex.x, firstVertex.y]}
                        stroke={strokeColor}
                        strokeWidth={2}
                        opacity={0.8}
                        listening={false}
                    />
                );
            })()}

            {cursorPos && vertices.length > 0 && (() => {
                const lastVertex = vertices[vertices.length - 1];
                const firstVertex = vertices[0];
                if (!lastVertex || !firstVertex) return null;

                return (
                    <>
                        {vertices.length >= 2 && (
                            <Line
                                key="cursor-preview-fill"
                                points={flattenPoints([...vertices, cursorPos])}
                                fill={strokeColor}
                                opacity={0.15}
                                closed={true}
                                listening={false}
                            />
                        )}

                        <Line
                            key="cursor-line-to-cursor"
                            points={[lastVertex.x, lastVertex.y, cursorPos.x, cursorPos.y]}
                            stroke={strokeColor}
                            strokeWidth={2}
                            dash={[8, 4]}
                            opacity={0.6}
                            listening={false}
                        />

                        {vertices.length >= 2 && (
                            <Line
                                key="cursor-line-to-first"
                                points={[cursorPos.x, cursorPos.y, firstVertex.x, firstVertex.y]}
                                stroke={strokeColor}
                                strokeWidth={2}
                                dash={[8, 4]}
                                opacity={0.6}
                                listening={false}
                            />
                        )}
                    </>
                );
            })()}

            {vertices.map((vertex, index) => (
                <Circle
                    key={`vertex-${index}`}
                    x={vertex.x}
                    y={vertex.y}
                    radius={5}
                    fill={strokeColor}
                    stroke={theme.palette.primary.dark}
                    strokeWidth={2}
                    listening={false}
                />
            ))}
        </Group>
    );
});

RegionPreview.displayName = 'RegionPreview';
