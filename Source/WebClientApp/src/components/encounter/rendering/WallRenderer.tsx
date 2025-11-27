import type Konva from 'konva';
import type React from 'react';
import { useMemo } from 'react';
import { Circle, Group, Line } from 'react-konva';
import { type EncounterWall, WallVisibility } from '@/types/domain';
import type { InteractionScope } from '@/utils/scopeFiltering';
import { isWallInScope } from '@/utils/scopeFiltering';

export interface WallRendererProps {
  encounterWall: EncounterWall;
  onClick?: (index: number) => void;
  onContextMenu?: (index: number, position: { x: number; y: number }) => void;
  activeScope: InteractionScope;
}

export const WallRenderer: React.FC<WallRendererProps> = ({ encounterWall, onClick, onContextMenu, activeScope }) => {
  const style = useMemo(() => {
    const wallColor = encounterWall.color || '#808080';
    const strokeColor = wallColor;

    switch (encounterWall.visibility) {
      case WallVisibility.Fence:
        return {
          stroke: strokeColor,
          strokeWidth: 3,
          dash: [4, 4],
          opacity: 0.9,
        };
      case WallVisibility.Invisible:
        return {
          stroke: strokeColor,
          strokeWidth: 3,
          dash: [8, 4],
          opacity: 0.3,
        };
      case WallVisibility.Veil:
        return {
          stroke: strokeColor,
          strokeWidth: 3,
          dash: [8, 4, 2, 4],
          opacity: 0.9,
        };
      default:
        return {
          stroke: strokeColor,
          strokeWidth: 3,
          opacity: 1,
          dash: undefined,
        };
    }
  }, [encounterWall.visibility, encounterWall.color]);

  const isWallScopeActive = activeScope === 'walls';

  const handleClick = (e: Konva.KonvaEventObject<MouseEvent>) => {
    if (onClick && isWallScopeActive) {
      e.cancelBubble = true;
      onClick(encounterWall.index);
    }
  };

  const handleContextMenu = (e: Konva.KonvaEventObject<MouseEvent>) => {
    e.evt.preventDefault();

    if (onContextMenu) {
      const stage = e.target.getStage();
      const pointerPosition = stage?.getPointerPosition();
      if (pointerPosition) {
        onContextMenu(encounterWall.index, {
          x: pointerPosition.x,
          y: pointerPosition.y,
        });
      }
    }
  };

  const points: number[] = [];
  for (let i = 0; i < encounterWall.poles.length; i++) {
    const pole = encounterWall.poles[i];
    if (!pole) continue;
    points.push(pole.x, pole.y);
  }
  if (encounterWall.isClosed && encounterWall.poles.length > 0) {
    const firstPole = encounterWall.poles[0];
    if (firstPole) {
      points.push(firstPole.x, firstPole.y);
    }
  }

  const poleRadius = 1.5;
  const poleColor = encounterWall.color || '#808080';

  const isInteractive = isWallInScope(activeScope);

  const wallId = encounterWall.encounterId
    ? `wall-${encounterWall.encounterId}-${encounterWall.index}`
    : `wall-temp-${encounterWall.index}`;

  return (
    <Group>
      {/* Black contour behind the wall line for visibility against map backgrounds */}
      <Line
        points={points}
        stroke="#000000"
        strokeWidth={style.strokeWidth + 2}
        {...(style.dash && { dash: style.dash })}
        opacity={style.opacity * 0.5}
        listening={false}
      />
      <Line
        id={wallId}
        points={points}
        stroke={style.stroke}
        strokeWidth={style.strokeWidth}
        {...(style.dash && { dash: style.dash })}
        opacity={style.opacity}
        listening={isInteractive}
        onClick={handleClick}
        onContextMenu={handleContextMenu}
        hitStrokeWidth={8}
        onMouseEnter={(e) => {
          if (!isInteractive) return;
          const container = e.target.getStage()?.container();
          if (container) {
            container.style.cursor = isWallScopeActive ? 'pointer' : 'default';
          }
        }}
        onMouseLeave={(e) => {
          if (!isInteractive) return;
          const container = e.target.getStage()?.container();
          if (container) {
            container.style.cursor = 'default';
          }
        }}
      />

      {encounterWall.poles.map((pole, index) => (
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
