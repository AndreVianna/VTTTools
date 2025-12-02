import type { EncounterCanvasHandle, Viewport } from '@components/encounter';
import { type MouseEvent, type RefObject, useCallback, useEffect, useRef, useState } from 'react';

interface UseViewportControlsProps {
  initialViewport: Viewport;
  canvasRef: RefObject<EncounterCanvasHandle>;
  stageSize?: { width: number; height: number };
  containerOffset?: { left: number; top: number };
}

const HEADER_HEIGHT = 28;
const TOP_TOOLBAR_HEIGHT = 36;
const LEFT_TOOLBAR_WIDTH = 32;

export const useViewportControls = ({ initialViewport, canvasRef, stageSize, containerOffset }: UseViewportControlsProps) => {
  const [viewport, setViewport] = useState<Viewport>(initialViewport);
  const [cursorPosition, setCursorPosition] = useState<{ x: number; y: number } | undefined>(undefined);
  const hasInitializedRef = useRef(false);

  const offsetLeft = containerOffset?.left ?? LEFT_TOOLBAR_WIDTH;
  const offsetTop = containerOffset?.top ?? (HEADER_HEIGHT + TOP_TOOLBAR_HEIGHT);

  useEffect(() => {
    if (stageSize && stageSize.width > 0 && stageSize.height > 0) {
      if (!hasInitializedRef.current) {
        hasInitializedRef.current = true;
      }
      const canvasWidth = window.innerWidth - offsetLeft;
      const canvasHeight = window.innerHeight - offsetTop;
      const newViewport = {
        x: offsetLeft + (canvasWidth - stageSize.width) / 2,
        y: offsetTop + (canvasHeight - stageSize.height) / 2,
        scale: viewport.scale,
      };
      setViewport(newViewport);
      setTimeout(() => {
        canvasRef.current?.setViewport(newViewport);
      }, 0);
    }
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [stageSize, offsetLeft, offsetTop]);

  const handleViewportChange = (newViewport: Viewport) => {
    setViewport(newViewport);
  };

  const handleZoomIn = () => {
    canvasRef.current?.zoomIn();
  };

  const handleZoomOut = () => {
    canvasRef.current?.zoomOut();
  };

  const handleZoomReset = useCallback(() => {
    if (stageSize && stageSize.width > 0 && stageSize.height > 0) {
      const canvasWidth = window.innerWidth - offsetLeft;
      const canvasHeight = window.innerHeight - offsetTop;
      const newViewport = {
        x: offsetLeft + (canvasWidth - stageSize.width) / 2,
        y: offsetTop + (canvasHeight - stageSize.height) / 2,
        scale: 1,
      };
      setViewport(newViewport);
      canvasRef.current?.setViewport(newViewport);
    } else {
      canvasRef.current?.resetView();
    }
  }, [stageSize, offsetLeft, offsetTop, canvasRef]);

  const handleCanvasMouseMove = useCallback(
    (e: MouseEvent<HTMLDivElement>) => {
      const canvasX = Math.round((e.clientX - viewport.x) / viewport.scale);
      const canvasY = Math.round((e.clientY - viewport.y) / viewport.scale);
      setCursorPosition({ x: canvasX, y: canvasY });
    },
    [viewport],
  );

  return {
    viewport,
    cursorPosition,
    handleViewportChange,
    handleZoomIn,
    handleZoomOut,
    handleZoomReset,
    handleCanvasMouseMove,
  };
};
