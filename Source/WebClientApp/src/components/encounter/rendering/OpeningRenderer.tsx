import { useTheme } from '@mui/material/styles';
import type Konva from 'konva';
import type React from 'react';
import { useMemo } from 'react';
import { Circle, Group, Line, Rect, Text } from 'react-konva';
import { type EncounterWall, OpeningState, OpeningVisibility, type PlacedOpening, type Point } from '@/types/domain';
import { type InteractionScope, isOpeningInScope } from '@/utils/scopeFiltering';

export interface OpeningRendererProps {
  encounterOpening: PlacedOpening;
  wall: EncounterWall;
  isSelected?: boolean;
  onSelect?: () => void;
  onContextMenu?: (position: Point) => void;
  activeScope: InteractionScope;
}

export const OpeningRenderer: React.FC<OpeningRendererProps> = ({
  encounterOpening,
  wall,
  isSelected = false,
  onSelect,
  onContextMenu,
  activeScope,
}) => {
  const theme = useTheme();
  const isInteractive = isOpeningInScope(activeScope);

  const openingPosition = useMemo(() => {
    const startPoleIndex = encounterOpening.startPoleIndex;
    const endPoleIndex = encounterOpening.endPoleIndex;

    if (startPoleIndex < 0 || endPoleIndex >= wall.poles.length) {
      return null;
    }

    const startPole = wall.poles[startPoleIndex];
    const endPole = wall.poles[endPoleIndex];

    if (!startPole || !endPole) {
      return null;
    }

    return {
      start: startPole,
      end: endPole,
    };
  }, [encounterOpening.startPoleIndex, encounterOpening.endPoleIndex, wall.poles]);

  const handleClick = (e: Konva.KonvaEventObject<MouseEvent>) => {
    e.cancelBubble = true;
    if (onSelect) {
      onSelect();
    }
  };

  const handleContextMenu = (e: Konva.KonvaEventObject<MouseEvent>) => {
    e.evt.preventDefault();
    e.cancelBubble = true;
    if (onContextMenu) {
      const stage = e.target.getStage();
      const pointerPosition = stage?.getPointerPosition();
      if (stage && pointerPosition) {
        const scale = stage.scaleX();
        onContextMenu({
          x: (pointerPosition.x - stage.x()) / scale,
          y: (pointerPosition.y - stage.y()) / scale,
        });
      }
    }
  };

  if (!openingPosition) {
    return null;
  }

  const { start, end } = openingPosition;

  const centerX = (start.x + end.x) / 2;
  const centerY = (start.y + end.y) / 2;

  const isSecret = encounterOpening.visibility === OpeningVisibility.Secret;
  const lineColor = isSecret ? '#FF0000' : '#0000FF';

  const strokeWidth = 2;

  const isOpen = encounterOpening.state === OpeningState.Open;
  const isClosed = encounterOpening.state === OpeningState.Closed;
  const isLocked = encounterOpening.state === OpeningState.Locked;

  if (import.meta.env.DEV && !encounterOpening.id) {
    console.warn('[OpeningRenderer] Missing ID for opening', encounterOpening.name);
  }

  return (
    <Group>
      {isSelected && (
        <Line
          points={[start.x, start.y, end.x, end.y]}
          stroke={theme.palette.primary.main}
          strokeWidth={strokeWidth + 2}
          listening={false}
        />
      )}

      <Line
        id={encounterOpening.id}
        points={[start.x, start.y, end.x, end.y]}
        stroke={lineColor}
        strokeWidth={strokeWidth}
        listening={isInteractive && !!onSelect}
        onClick={handleClick}
        onContextMenu={handleContextMenu}
        hitStrokeWidth={10}
        onMouseEnter={(e) => {
          const container = e.target.getStage()?.container();
          if (container && isInteractive && onSelect) {
            container.style.cursor = 'pointer';
          }
        }}
        onMouseLeave={(e) => {
          const container = e.target.getStage()?.container();
          if (container) {
            container.style.cursor = 'default';
          }
        }}
      />

      <Group x={centerX} y={centerY}>
        {isOpen && (
          <Group>
            <Circle
              radius={6}
              fill={theme.palette.background.paper}
              stroke={lineColor}
              strokeWidth={1}
              listening={false}
            />
            <Line
              points={[-3, -2, 0, 2, 3, -2]}
              stroke={lineColor}
              strokeWidth={1.5}
              listening={false}
            />
          </Group>
        )}

        {isClosed && (
          <Group>
            <Circle
              radius={6}
              fill={theme.palette.background.paper}
              stroke={lineColor}
              strokeWidth={1}
              listening={false}
            />
            <Rect
              x={-3}
              y={-3}
              width={6}
              height={6}
              fill={lineColor}
              listening={false}
            />
          </Group>
        )}

        {isLocked && (
          <Group>
            <Circle
              radius={8}
              fill={theme.palette.background.paper}
              stroke={theme.palette.warning.main}
              strokeWidth={1}
              listening={false}
            />
            <Rect
              x={-4}
              y={-2}
              width={8}
              height={6}
              fill={theme.palette.warning.main}
              stroke={theme.palette.warning.dark}
              strokeWidth={1}
              cornerRadius={1}
              listening={false}
            />
            <Rect
              x={-3}
              y={-6}
              width={6}
              height={4}
              stroke={theme.palette.warning.dark}
              strokeWidth={1.5}
              cornerRadius={3}
              listening={false}
            />
          </Group>
        )}
      </Group>

      {isSelected && (
        <Text
          x={centerX}
          y={centerY + 12}
          text={encounterOpening.name}
          fontSize={10}
          fill={theme.palette.primary.main}
          fontStyle="bold"
          align="center"
          offsetX={encounterOpening.name.length * 2.5}
          listening={false}
        />
      )}
    </Group>
  );
};

OpeningRenderer.displayName = 'OpeningRenderer';
