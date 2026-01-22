import type { EncounterCanvasHandle, Viewport } from '@components/encounter';
import { type RefObject, useCallback, useEffect, useRef, useState } from 'react';

interface SavedStartingView {
  zoomLevel: number;
  panning: { x: number; y: number };
}

interface UseViewportControlsProps {
  initialViewport: Viewport;
  canvasRef: RefObject<EncounterCanvasHandle>;
  stageSize?: { width: number; height: number };
  containerOffset?: { left: number; top: number };
  encounterId: string | undefined;
  /** The actual background size from encounter data - used for centering calculation */
  backgroundSize?: { width: number; height: number };
  /** Saved starting view from stage settings - panning is offset from centered position */
  savedStartingView?: SavedStartingView;
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

export const useViewportControls = ({ initialViewport, canvasRef, stageSize, containerOffset, encounterId, backgroundSize, savedStartingView }: UseViewportControlsProps) => {
  const offsetLeft = containerOffset?.left ?? LEFT_TOOLBAR_WIDTH;
  const offsetTop = containerOffset?.top ?? (HEADER_HEIGHT + TOP_TOOLBAR_HEIGHT);

  // Check for stored viewport once at mount
  const storedViewport = getStoredViewport(encounterId);
  const restoredFromSession = !!storedViewport;

  // Determine if we have valid background size for centering
  const hasValidBackgroundSize = !!(backgroundSize && backgroundSize.width > 0 && backgroundSize.height > 0);

  // Initialize viewport state
  const [viewport, setViewport] = useState<Viewport>(() => storedViewport ?? initialViewport);
  const hasAppliedCenteringRef = useRef(false);

  // Effect to apply centering when background size becomes known
  // Uses backgroundSize directly (not stageSize) to avoid timing issues with state updates
  useEffect(() => {
    // Skip if: restored from session, already centered, or no valid background size
    if (restoredFromSession || hasAppliedCenteringRef.current || !hasValidBackgroundSize) {
      return;
    }

    // Calculate centered viewport using backgroundSize directly
    const canvasWidth = window.innerWidth - offsetLeft;
    const canvasHeight = window.innerHeight - offsetTop;
    const centered: Viewport = {
      x: offsetLeft + (canvasWidth - backgroundSize.width) / 2,
      y: offsetTop + (canvasHeight - backgroundSize.height) / 2,
      scale: initialViewport.scale,
    };

    hasAppliedCenteringRef.current = true;

    // Update state - using eslint-disable for this legitimate initialization pattern
    // eslint-disable-next-line react-hooks/set-state-in-effect
    setViewport(centered);

    // Apply to canvas ref after DOM update
    requestAnimationFrame(() => {
      canvasRef.current?.setViewport(centered);
    });
  }, [backgroundSize, hasValidBackgroundSize, restoredFromSession, offsetLeft, offsetTop, initialViewport.scale, canvasRef]);

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

      // Calculate centered position
      const centeredX = offsetLeft + (canvasWidth - stageSize.width) / 2;
      const centeredY = offsetTop + (canvasHeight - stageSize.height) / 2;

      // Apply saved offset (default 0,0 = centered)
      const offsetX = savedStartingView?.panning?.x ?? 0;
      const offsetY = savedStartingView?.panning?.y ?? 0;
      const scale = savedStartingView?.zoomLevel ?? 1;

      const newViewport = {
        x: centeredX + offsetX,
        y: centeredY + offsetY,
        scale,
      };
      setViewport(newViewport);
      canvasRef.current?.setViewport(newViewport);
    } else {
      canvasRef.current?.resetView();
    }
  }, [stageSize, offsetLeft, offsetTop, savedStartingView, canvasRef]);

  return {
    viewport,
    handleViewportChange,
    handleZoomIn,
    handleZoomOut,
    handleZoomReset,
  };
};
