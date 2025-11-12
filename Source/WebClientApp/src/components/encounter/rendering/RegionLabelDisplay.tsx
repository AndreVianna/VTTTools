import { useTheme } from '@mui/material/styles';
import type React from 'react';
import { Group, Rect, Text } from 'react-konva';
import type { Point } from '@/types/domain';

export interface RegionLabelDisplayProps {
  centroid: Point;
  label: string;
}

export const RegionLabelDisplay: React.FC<RegionLabelDisplayProps> = ({ centroid, label }) => {
  const theme = useTheme();
  const fontSize = 12;
  const padding = 4;
  const textWidth = label.length * (fontSize * 0.6);

  return (
    <Group x={centroid.x} y={centroid.y}>
      <Rect
        x={-textWidth / 2 - padding}
        y={-fontSize / 2 - padding}
        width={textWidth + padding * 2}
        height={fontSize + padding * 2}
        fill={theme.palette.background.paper}
        opacity={0.8}
        cornerRadius={2}
        listening={false}
      />
      <Text
        text={label}
        fontSize={fontSize}
        fontStyle='bold'
        fill={theme.palette.text.primary}
        align='center'
        verticalAlign='middle'
        offsetX={textWidth / 2}
        offsetY={fontSize / 2}
        listening={false}
      />
    </Group>
  );
};

RegionLabelDisplay.displayName = 'RegionLabelDisplay';
