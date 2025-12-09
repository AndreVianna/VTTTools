import { useTheme } from '@mui/material';
import React from 'react';
import { Circle, Group, Shape } from 'react-konva';
import type { Point } from '@/types/domain';

export interface RegionPreviewProps {
  vertices: Point[];
  holes?: Point[][];
  cursorPos?: { x: number; y: number };
  color?: string;
}

function drawPolygonWithHoles(
  ctx: CanvasRenderingContext2D,
  outer: Point[],
  holes: Point[][]
): void {
  if (outer.length < 3) return;

  ctx.beginPath();

  const first = outer[0]!;
  ctx.moveTo(first.x, first.y);
  for (let i = 1; i < outer.length; i++) {
    ctx.lineTo(outer[i]!.x, outer[i]!.y);
  }
  ctx.closePath();

  for (const hole of holes) {
    if (hole.length < 3) continue;
    const holeFirst = hole[0]!;
    ctx.moveTo(holeFirst.x, holeFirst.y);
    for (let i = 1; i < hole.length; i++) {
      ctx.lineTo(hole[i]!.x, hole[i]!.y);
    }
    ctx.closePath();
  }
}

export const RegionPreview: React.FC<RegionPreviewProps> = React.memo(({ vertices, holes = [], cursorPos, color }) => {
  const theme = useTheme();
  const strokeColor = color || theme.palette.primary.main;

  if (vertices.length === 0) return null;

  return (
    <Group name='RegionPreview'>
      {vertices.length >= 3 && (
        <Shape
          sceneFunc={(ctx, shape) => {
            drawPolygonWithHoles(ctx._context, vertices, holes);
            ctx.fillStrokeShape(shape);
          }}
          fill={strokeColor}
          opacity={0.2}
          listening={false}
        />
      )}

      {vertices.length >= 3 && (
        <Shape
          sceneFunc={(ctx) => {
            const context = ctx._context;
            context.beginPath();
            const first = vertices[0]!;
            context.moveTo(first.x, first.y);
            for (let i = 1; i < vertices.length; i++) {
              context.lineTo(vertices[i]!.x, vertices[i]!.y);
            }
            context.closePath();
            context.strokeStyle = strokeColor;
            context.lineWidth = 2;
            context.globalAlpha = 0.8;
            context.stroke();

            for (const hole of holes) {
              if (hole.length < 3) continue;
              context.beginPath();
              const holeFirst = hole[0]!;
              context.moveTo(holeFirst.x, holeFirst.y);
              for (let i = 1; i < hole.length; i++) {
                context.lineTo(hole[i]!.x, hole[i]!.y);
              }
              context.closePath();
              context.stroke();
            }
          }}
          listening={false}
        />
      )}

      {cursorPos &&
        vertices.length > 0 &&
        (() => {
          const lastVertex = vertices[vertices.length - 1];
          const firstVertex = vertices[0];
          if (!lastVertex || !firstVertex) return null;

          return (
            <>
              {vertices.length >= 2 && (
                <Shape
                  sceneFunc={(ctx, shape) => {
                    const context = ctx._context;
                    context.beginPath();
                    context.moveTo(vertices[0]!.x, vertices[0]!.y);
                    for (let i = 1; i < vertices.length; i++) {
                      context.lineTo(vertices[i]!.x, vertices[i]!.y);
                    }
                    context.lineTo(cursorPos.x, cursorPos.y);
                    context.closePath();
                    ctx.fillStrokeShape(shape);
                  }}
                  fill={strokeColor}
                  opacity={0.15}
                  listening={false}
                />
              )}

              <Shape
                sceneFunc={(ctx) => {
                  const context = ctx._context;
                  context.beginPath();
                  context.moveTo(lastVertex.x, lastVertex.y);
                  context.lineTo(cursorPos.x, cursorPos.y);
                  context.strokeStyle = strokeColor;
                  context.lineWidth = 2;
                  context.setLineDash([8, 4]);
                  context.globalAlpha = 0.6;
                  context.stroke();
                  context.setLineDash([]);
                }}
                listening={false}
              />

              {vertices.length >= 2 && (
                <Shape
                  sceneFunc={(ctx) => {
                    const context = ctx._context;
                    context.beginPath();
                    context.moveTo(cursorPos.x, cursorPos.y);
                    context.lineTo(firstVertex.x, firstVertex.y);
                    context.strokeStyle = strokeColor;
                    context.lineWidth = 2;
                    context.setLineDash([8, 4]);
                    context.globalAlpha = 0.6;
                    context.stroke();
                    context.setLineDash([]);
                  }}
                  listening={false}
                />
              )}
            </>
          );
        })()}

      {vertices.map((vertex, index) => (
        <Circle
          key={`vertex-${index}-${vertex.x}-${vertex.y}`}
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
