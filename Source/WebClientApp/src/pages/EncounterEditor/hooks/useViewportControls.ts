import type { EncounterCanvasHandle, Viewport } from '@components/encounter';
import { type MouseEvent, type RefObject, useCallback, useEffect, useRef, useState } from 'react';

interface UseViewportControlsProps {
  initialViewport: Viewport;
  canvasRef: RefObject<EncounterCanvasHandle>;
  stageSize?: { width: number; height: number };
  containerOffset?: { left: number; top: number };
  encounterId: string | undefined;
}

const HEADER_HEIGHT = 28;
const TOP_TOOLBAR_HEIGHT = 36;
const LEFT_TOOLBAR_WIDTH = 32;

const getStoredViewport = (encounterId: string | undefined): Viewport | null => {
  if (!encounterId) return null;
  try {
    const stored = sessionStorage.getItem(`viewport_${encounterId}`);
    if (stored) return JSON.parse(stored) as Viewport;
  } catch { /* ignore */ }
  return null;
};

const storeViewport = (encounterId: string | undefined, viewport: Viewport) => {
  if (!encounterId) return;
  try {
    sessionStorage.setItem(`viewport_${encounterId}`, JSON.stringify(viewport));
  } catch { /* ignore */ }
};

export const useViewportControls = ({ initialViewport, canvasRef, stageSize, containerOffset, encounterId }: UseViewportControlsProps) => {
  // Initialize viewport from session storage synchronously if available
  const [viewport, setViewport] = useState<Viewport>(() => {
    return getStoredViewport(encounterId) ?? initialViewport;
  });
  const [cursorPosition, setCursorPosition] = useState<{ x: number; y: number } | undefined>(undefined);
  const hasInitializedRef = useRef(false);
  const restoredFromSessionRef = useRef(!!getStoredViewport(encounterId));

  const offsetLeft = containerOffset?.left ?? LEFT_TOOLBAR_WIDTH;
  const offsetTop = containerOffset?.top ?? (HEADER_HEIGHT + TOP_TOOLBAR_HEIGHT);

  useEffect(() => {
    if (stageSize && stageSize.width > 0 && stageSize.height > 0) {
      // Skip centering if we restored from session storage
      if (restoredFromSessionRef.current) {
        return;
      }

      // Only center on first initialization
      if (!hasInitializedRef.current) {
        hasInitializedRef.current = true;

        const canvasWidth = window.innerWidth - offsetLeft;
        const canvasHeight = window.innerHeight - offsetTop;
        const newViewport = {
          x: offsetLeft + (canvasWidth - stageSize.width) / 2,
          y: offsetTop + (canvasHeight - stageSize.height) / 2,
          scale: initialViewport.scale,
        };
        setViewport(newViewport);
        setTimeout(() => {
          canvasRef.current?.setViewport(newViewport);
        }, 0);
      }
    }
  }, [stageSize, offsetLeft, offsetTop, encounterId, canvasRef, initialViewport.scale]);

  const handleViewportChange = useCallback((newViewport: Viewport) => {
    setViewport(newViewport);
    storeViewport(encounterId, newViewport);
  }, [encounterId]);

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
