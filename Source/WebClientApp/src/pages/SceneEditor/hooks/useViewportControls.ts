import { useState, useCallback } from 'react';
import type { Viewport, SceneCanvasHandle } from '@components/scene';

interface UseViewportControlsProps {
    initialViewport: Viewport;
    canvasRef: React.RefObject<SceneCanvasHandle>;
}

export const useViewportControls = ({ initialViewport, canvasRef }: UseViewportControlsProps) => {
    const [viewport, setViewport] = useState<Viewport>(initialViewport);
    const [cursorPosition, setCursorPosition] = useState<{ x: number; y: number } | undefined>(undefined);

    const handleViewportChange = (newViewport: Viewport) => {
        setViewport(newViewport);
    };

    const handleZoomIn = () => {
        canvasRef.current?.zoomIn();
    };

    const handleZoomOut = () => {
        canvasRef.current?.zoomOut();
    };

    const handleZoomReset = () => {
        canvasRef.current?.resetView();
    };

    const handleCanvasMouseMove = useCallback((e: React.MouseEvent<HTMLDivElement>) => {
        const canvasX = Math.round((e.clientX - viewport.x) / viewport.scale);
        const canvasY = Math.round((e.clientY - viewport.y) / viewport.scale);
        setCursorPosition({ x: canvasX, y: canvasY });
    }, [viewport]);

    return {
        viewport,
        cursorPosition,
        handleViewportChange,
        handleZoomIn,
        handleZoomOut,
        handleZoomReset,
        handleCanvasMouseMove
    };
};
