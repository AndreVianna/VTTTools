import { useTheme } from '@mui/material';
import type React from 'react';
import { Circle } from 'react-konva';
import type { Point } from '@/types/domain';

export interface VertexMarkerProps {
  position: Point;
  preview?: boolean;
}

export const VertexMarker: React.FC<VertexMarkerProps> = ({ position, preview = false }) => {
  const theme = useTheme();
  const redColor = theme.palette.error.main;

  return (
    <Circle x={position.x} y={position.y} radius={5} fill={redColor} opacity={preview ? 0.7 : 1.0} listening={false} />
  );
};

VertexMarker.displayName = 'VertexMarker';
