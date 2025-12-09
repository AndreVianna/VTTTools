import type Konva from 'konva';
import type React from 'react';
import { useMemo, useState } from 'react';
import { Circle, Group, Line, Path, Text } from 'react-konva';
import { type EncounterWall, type EncounterWallSegment, SegmentState, SegmentType } from '@/types/domain';
import type { InteractionScope } from '@/utils/scopeFiltering';
import { isWallInScope } from '@/utils/scopeFiltering';

export interface WallRendererProps {
  encounterWall: EncounterWall;
  onClick?: (index: number) => void;
  onContextMenu?: (wallIndex: number, segmentIndex: number, position: { x: number; y: number }) => void;
  activeScope: InteractionScope;
}

const WALL_COLOR = '#808080';
const BROWN_COLOR = '#8B4513';
const CYAN_COLOR = '#00CED1';

const STATE_ICON_SIZE = 6;
const STATE_ICON_BG_RADIUS = 5;
const STATE_COLORS = {
  open: '#4ade80',
  closed: '#f87171',
  locked: '#fbbf24',
  secret: '#c084fc',
};

function isInvisibleSegment(segment: EncounterWallSegment): boolean {
  const isOpaque = segment.isOpaque ?? true;
  const isOpen = segment.state === SegmentState.Open;
  const isDoorOrWindow = segment.type === SegmentType.Door || segment.type === SegmentType.Window;
  return !isOpaque && isOpen && isDoorOrWindow;
}

function getSegmentStyle(segment: EncounterWallSegment): {
  stroke: string;
  strokeWidth: number;
  dash?: number[];
  opacity: number;
} {
  const baseStyle = {
    strokeWidth: 3,
    opacity: 1,
  };

  // Default to opaque (true) if isOpaque is undefined
  const isOpaque = segment.isOpaque ?? true;

  // Non-opaque + Open doors/windows are invisible (but still interactive)
  if (isInvisibleSegment(segment)) {
    return { ...baseStyle, stroke: 'transparent', opacity: 0 };
  }

  switch (segment.type) {
    case SegmentType.Wall:
      // Wall (opaque) or Fence (non-opaque)
      return isOpaque
        ? { ...baseStyle, stroke: WALL_COLOR }
        : { ...baseStyle, stroke: WALL_COLOR, dash: [3, 3] };
    case SegmentType.Door:
      // Door (opaque) or Passage (non-opaque)
      return isOpaque
        ? { ...baseStyle, stroke: BROWN_COLOR }
        : { ...baseStyle, stroke: BROWN_COLOR, dash: [6, 4] };
    case SegmentType.Window:
      // Window (opaque) or Opening (non-opaque)
      return isOpaque
        ? { ...baseStyle, stroke: CYAN_COLOR }
        : { ...baseStyle, stroke: CYAN_COLOR, dash: [6, 4] };
    default:
      return { ...baseStyle, stroke: WALL_COLOR };
  }
}

function getSegmentMidpoint(segment: EncounterWallSegment): { x: number; y: number } {
  return {
    x: (segment.startPole.x + segment.endPole.x) / 2,
    y: (segment.startPole.y + segment.endPole.y) / 2,
  };
}

interface StateIconProps {
  x: number;
  y: number;
  state: SegmentState;
  type: SegmentType;
}

const StateIcon: React.FC<StateIconProps> = ({ x, y, state, type }) => {
  const isWallOrFence = type === SegmentType.Wall;
  if (isWallOrFence && state !== SegmentState.Secret) {
    return null;
  }

  const halfSize = STATE_ICON_SIZE / 2;

  const renderBackground = () => (
    <Circle
      x={x}
      y={y}
      radius={STATE_ICON_BG_RADIUS}
      fill="rgba(0, 0, 0, 0.7)"
      listening={false}
    />
  );

  switch (state) {
    case SegmentState.Open:
      return (
        <Group listening={false}>
          {renderBackground()}
          <Path
            x={x - halfSize}
            y={y - halfSize}
            data={`M1 ${halfSize} L${halfSize} ${STATE_ICON_SIZE - 1} L${STATE_ICON_SIZE - 1} 1`}
            stroke={STATE_COLORS.open}
            strokeWidth={2}
          />
        </Group>
      );
    case SegmentState.Closed:
      return (
        <Group listening={false}>
          {renderBackground()}
          <Group x={x} y={y}>
            <Line
              points={[-halfSize + 1, -halfSize + 1, halfSize - 1, halfSize - 1]}
              stroke={STATE_COLORS.closed}
              strokeWidth={2}
            />
            <Line
              points={[halfSize - 1, -halfSize + 1, -halfSize + 1, halfSize - 1]}
              stroke={STATE_COLORS.closed}
              strokeWidth={2}
            />
          </Group>
        </Group>
      );
    case SegmentState.Locked:
      return (
        <Group listening={false}>
          {renderBackground()}
          <Group x={x} y={y}>
            <Circle
              x={0}
              y={-1}
              radius={2}
              stroke={STATE_COLORS.locked}
              strokeWidth={1.5}
              fill="transparent"
            />
            <Path
              x={-2}
              y={0}
              data="M0 0 L0 3 L4 3 L4 0 Z"
              fill={STATE_COLORS.locked}
            />
          </Group>
        </Group>
      );
    case SegmentState.Secret:
      return (
        <Group listening={false}>
          {renderBackground()}
          <Text
            x={x - halfSize}
            y={y - halfSize - 1}
            text="S"
            fontSize={STATE_ICON_SIZE + 2}
            fontStyle="bold"
            fill={STATE_COLORS.secret}
          />
        </Group>
      );
    default:
      return null;
  }
};

const HIGHLIGHT_COLOR = '#ffff00';

export const WallRenderer: React.FC<WallRendererProps> = ({ encounterWall, onClick, onContextMenu, activeScope }) => {
  const isWallScopeActive = activeScope === 'walls';
  const [hoveredSegmentIndex, setHoveredSegmentIndex] = useState<number | null>(null);

  const handleClick = (e: Konva.KonvaEventObject<MouseEvent>) => {
    if (e.evt.button !== 0) return; // Left-click only
    if (onClick && isWallScopeActive) {
      e.cancelBubble = true;
      onClick(encounterWall.index);
    }
  };

  const handleContextMenu = (segmentIndex: number) => (e: Konva.KonvaEventObject<MouseEvent>) => {
    e.evt.preventDefault();
    e.cancelBubble = true;

    if (onContextMenu && isWallScopeActive) {
      const stage = e.target.getStage();
      const pointerPosition = stage?.getPointerPosition();
      if (pointerPosition) {
        onContextMenu(encounterWall.index, segmentIndex, {
          x: pointerPosition.x,
          y: pointerPosition.y,
        });
      }
    }
  };

  const poles = useMemo(() => {
    const poleSet = new Map<string, { x: number; y: number }>();
    for (const segment of encounterWall.segments) {
      const startKey = `${segment.startPole.x},${segment.startPole.y}`;
      const endKey = `${segment.endPole.x},${segment.endPole.y}`;
      if (!poleSet.has(startKey)) {
        poleSet.set(startKey, { x: segment.startPole.x, y: segment.startPole.y });
      }
      if (!poleSet.has(endKey)) {
        poleSet.set(endKey, { x: segment.endPole.x, y: segment.endPole.y });
      }
    }
    return Array.from(poleSet.values());
  }, [encounterWall.segments]);

  const poleRadius = 1.5;
  const poleColor = WALL_COLOR;

  const isInteractive = isWallInScope(activeScope);

  const wallId = `wall-${encounterWall.index}`;

  return (
    <Group>
      {encounterWall.segments.map((segment, segmentIdx) => {
        const style = getSegmentStyle(segment);
        const points = [segment.startPole.x, segment.startPole.y, segment.endPole.x, segment.endPole.y];
        const isHovered = hoveredSegmentIndex === segment.index;
        const midpoint = getSegmentMidpoint(segment);
        const isInvisible = isInvisibleSegment(segment);

        return (
          <Group key={`segment-${segment.index}`}>
            {!isInvisible && (
              <Line
                points={points}
                stroke='#000000'
                strokeWidth={style.strokeWidth + 2}
                {...(style.dash && { dash: style.dash })}
                opacity={style.opacity * 0.5}
                listening={false}
              />
            )}
            {isHovered && isWallScopeActive && (
              <Line
                points={points}
                stroke={HIGHLIGHT_COLOR}
                strokeWidth={style.strokeWidth + 4}
                opacity={0.5}
                listening={false}
              />
            )}
            <Line
              id={segmentIdx === 0 ? wallId : `${wallId}-seg-${segmentIdx}`}
              points={points}
              stroke={isInvisible ? 'transparent' : style.stroke}
              strokeWidth={style.strokeWidth}
              {...(style.dash && { dash: style.dash })}
              opacity={isInvisible ? 0 : style.opacity}
              listening={isInteractive}
              onClick={handleClick}
              onContextMenu={handleContextMenu(segment.index)}
              hitStrokeWidth={8}
              onMouseEnter={(e) => {
                if (!isInteractive) return;
                setHoveredSegmentIndex(segment.index);
                const container = e.target.getStage()?.container();
                if (container) {
                  container.style.cursor = isWallScopeActive ? 'pointer' : 'default';
                }
              }}
              onMouseLeave={(e) => {
                if (!isInteractive) return;
                setHoveredSegmentIndex(null);
                const container = e.target.getStage()?.container();
                if (container) {
                  container.style.cursor = 'default';
                }
              }}
            />
            {!isInvisible && (
              <StateIcon x={midpoint.x} y={midpoint.y} state={segment.state} type={segment.type} />
            )}
            {isHovered && segment.name && segment.type !== SegmentType.Wall && (() => {
              const textWidth = segment.name.length * 3.3;
              const textHeight = 6;
              const padding = 2;
              return (
                <Group x={midpoint.x - textWidth / 2 - padding} y={midpoint.y - 12} listening={false}>
                  <Line
                    points={[0, 0, textWidth + padding * 2, 0, textWidth + padding * 2, textHeight + padding * 2, 0, textHeight + padding * 2]}
                    closed
                    fill="rgba(0, 0, 0, 0.6)"
                  />
                  <Text
                    x={padding}
                    y={padding}
                    align="center"
                    verticalAlign="middle"
                    text={segment.name}
                    fontSize={6}
                    fill="#ffffff"
                  />
                </Group>
              );
            })()}
          </Group>
        );
      })}

      {poles.map((pole, index) => (
        <Circle
          key={`pole-${pole.x}-${pole.y}-${index}`}
          id={`${wallId}-pole-${index}`}
          x={pole.x}
          y={pole.y}
          radius={poleRadius}
          fill={poleColor}
          listening={false}
        />
      ))}
    </Group>
  );
};

WallRenderer.displayName = 'WallRenderer';
