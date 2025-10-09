// GENERATED: 2025-10-04 by Claude Code Phase 3
// EPIC: EPIC-001 Phase 3 - Scene Editor Panning & Zoom
// LAYER: UI (Component)

/**
 * SceneCanvas Component
 * Reusable Konva Stage with pan and zoom controls
 * Encapsulates viewport management for scene editing
 * ACCEPTANCE_CRITERION: AC-01 - Smooth RIGHT-CLICK panning with 60 FPS (left-click reserved for assets)
 * ACCEPTANCE_CRITERION: AC-02 - Zoom with wheel (0.1x - 10x range)
 */

import React, { useState, useRef, useCallback, useImperativeHandle, forwardRef } from 'react';
import { Stage } from 'react-konva';
import Konva from 'konva';

/**
 * Viewport state (position and scale)
 */
export interface Viewport {
    x: number;
    y: number;
    scale: number;
}

/**
 * SceneCanvas component props
 */
export interface SceneCanvasProps {
    /** Canvas width (default: window.innerWidth) */
    width?: number;
    /** Canvas height (default: window.innerHeight) */
    height?: number;
    /** Initial viewport position */
    initialPosition?: { x: number; y: number };
    /** Initial zoom scale (default: 1) */
    initialScale?: number;
    /** Minimum zoom level (default: 0.1) */
    minZoom?: number;
    /** Maximum zoom level (default: 10) */
    maxZoom?: number;
    /** Enable panning with mouse drag (default: true) */
    draggable?: boolean;
    /** Callback when viewport changes */
    onViewportChange?: (viewport: Viewport) => void;
    /** Child layers and elements */
    children?: React.ReactNode;
    /** Background color (default: #f5f5f5) */
    backgroundColor?: string;
    /** Background image URL (optional - renders in background layer) */
    backgroundImageUrl?: string;
    /** Stage dimensions (for background sizing) */
    stageWidth?: number;
    /** Stage dimensions (for background sizing) */
    stageHeight?: number;
    /** Callback when canvas is clicked (left-click only) */
    onClick?: (position: { x: number; y: number }) => void;
}

/**
 * Imperative handle interface for SceneCanvas
 * Allows parent components to control zoom/pan programmatically
 */
export interface SceneCanvasHandle {
    /** Zoom in by scale factor */
    zoomIn: () => void;
    /** Zoom out by scale factor */
    zoomOut: () => void;
    /** Reset viewport to initial state */
    resetView: () => void;
    /** Get current viewport state */
    getViewport: () => Viewport;
    /** Get Konva Stage instance */
    getStage: () => Konva.Stage | null;
    /** Set viewport position and scale programmatically */
    setViewport: (viewport: Viewport) => void;
}

const DEFAULT_MIN_ZOOM = 0.1;
const DEFAULT_MAX_ZOOM = 10;
const DEFAULT_SCALE = 1;
const ZOOM_FACTOR = 1.2;

/**
 * SceneCanvas - Reusable Konva Stage with pan/zoom controls
 *
 * Features:
 * - RIGHT-CLICK drag panning (leaves left-click for asset dragging) (PHASE 3: AC-01)
 * - Mouse wheel zoom with limits (PHASE 3: AC-02)
 * - Zoom to pointer position for natural feel
 * - Imperative API for programmatic control
 * - Viewport state callback for external sync
 *
 * Controls:
 * - Right-click + drag: Pan the canvas
 * - Mouse wheel: Zoom in/out
 * - Left-click: Reserved for asset interaction (Phase 6)
 *
 * Usage:
 * ```tsx
 * const canvasRef = useRef<SceneCanvasHandle>(null);
 *
 * <SceneCanvas ref={canvasRef} onViewportChange={handleViewportChange}>
 *   <Layer name="background">...</Layer>
 *   <Layer name="content">...</Layer>
 * </SceneCanvas>
 * ```
 */
export const SceneCanvas = forwardRef<SceneCanvasHandle, SceneCanvasProps>(({
    width = window.innerWidth,
    height = window.innerHeight,
    initialPosition = { x: 0, y: 0 },
    initialScale = DEFAULT_SCALE,
    minZoom = DEFAULT_MIN_ZOOM,
    maxZoom = DEFAULT_MAX_ZOOM,
    draggable: _draggable = true,
    onViewportChange,
    children,
    backgroundColor = 'transparent',
    onClick
}, ref) => {
    // Stage reference for direct Konva access
    const stageRef = useRef<Konva.Stage>(null);

    // Viewport state
    const [stagePos, setStagePos] = useState(initialPosition);
    const [scale, setScale] = useState(initialScale);

    // Right-click panning state
    const [isPanning, setIsPanning] = useState(false);
    const lastPanPos = useRef({ x: 0, y: 0 });

    // Notify parent of viewport changes
    const notifyViewportChange = useCallback((newPos: { x: number; y: number }, newScale: number) => {
        if (onViewportChange) {
            onViewportChange({ x: newPos.x, y: newPos.y, scale: newScale });
        }
    }, [onViewportChange]);

    // PHASE 3 AC-02: Mouse wheel zoom handler
    const handleWheel = useCallback((e: Konva.KonvaEventObject<WheelEvent>) => {
        e.evt.preventDefault();

        const stage = e.target.getStage();
        if (!stage) return;

        const oldScale = stage.scaleX();
        const pointer = stage.getPointerPosition();
        if (!pointer) return;

        // Calculate new scale with zoom limits
        const scaleBy = ZOOM_FACTOR;
        const newScale = e.evt.deltaY < 0
            ? Math.min(oldScale * scaleBy, maxZoom)
            : Math.max(oldScale / scaleBy, minZoom);

        // Zoom to pointer position (natural zoom feel)
        const mousePointTo = {
            x: (pointer.x - stage.x()) / oldScale,
            y: (pointer.y - stage.y()) / oldScale,
        };

        const newPos = {
            x: pointer.x - mousePointTo.x * newScale,
            y: pointer.y - mousePointTo.y * newScale,
        };

        setScale(newScale);
        setStagePos(newPos);
        notifyViewportChange(newPos, newScale);
    }, [minZoom, maxZoom, notifyViewportChange]);

    // PHASE 3 AC-01: Right-click pan handlers
    const handleMouseDown = useCallback((e: Konva.KonvaEventObject<MouseEvent>) => {
        // Right mouse button (button === 2)
        if (e.evt.button === 2) {
            e.evt.preventDefault();
            setIsPanning(true);
            lastPanPos.current = {
                x: e.evt.clientX,
                y: e.evt.clientY
            };
        }
    }, []);

    const handleMouseMove = useCallback((e: Konva.KonvaEventObject<MouseEvent>) => {
        if (!isPanning) return;

        const dx = e.evt.clientX - lastPanPos.current.x;
        const dy = e.evt.clientY - lastPanPos.current.y;

        const newPos = {
            x: stagePos.x + dx,
            y: stagePos.y + dy
        };

        setStagePos(newPos);
        notifyViewportChange(newPos, scale);

        lastPanPos.current = {
            x: e.evt.clientX,
            y: e.evt.clientY
        };
    }, [isPanning, stagePos, scale, notifyViewportChange]);

    const handleMouseUp = useCallback((e: Konva.KonvaEventObject<MouseEvent>) => {
        if (e.evt.button === 2) {
            setIsPanning(false);
        }
    }, []);

    // Prevent context menu on right-click
    const handleContextMenu = useCallback((e: Konva.KonvaEventObject<PointerEvent>) => {
        e.evt.preventDefault();
    }, []);

    // Left-click handler for asset placement
    const handleClick = useCallback((e: Konva.KonvaEventObject<MouseEvent>) => {
        if (e.evt.button !== 0 || !onClick) return; // Left-click only

        const stage = e.target.getStage();
        if (!stage) return;

        const pointer = stage.getPointerPosition();
        if (!pointer) return;

        // Convert to stage coordinates (account for zoom/pan)
        const position = {
            x: (pointer.x - stagePos.x) / scale,
            y: (pointer.y - stagePos.y) / scale
        };

        onClick(position);
    }, [stagePos, scale, onClick]);

    // Programmatic zoom in
    const zoomIn = useCallback(() => {
        const newScale = Math.min(scale * ZOOM_FACTOR, maxZoom);
        setScale(newScale);
        notifyViewportChange(stagePos, newScale);
    }, [scale, maxZoom, stagePos, notifyViewportChange]);

    // Programmatic zoom out
    const zoomOut = useCallback(() => {
        const newScale = Math.max(scale / ZOOM_FACTOR, minZoom);
        setScale(newScale);
        notifyViewportChange(stagePos, newScale);
    }, [scale, minZoom, stagePos, notifyViewportChange]);

    // Reset viewport to initial state
    const resetView = useCallback(() => {
        setStagePos(initialPosition);
        setScale(initialScale);
        notifyViewportChange(initialPosition, initialScale);
    }, [initialPosition, initialScale, notifyViewportChange]);

    // Get current viewport state
    const getViewport = useCallback((): Viewport => ({
        x: stagePos.x,
        y: stagePos.y,
        scale
    }), [stagePos, scale]);

    // Get Konva Stage instance
    const getStage = useCallback((): Konva.Stage | null => stageRef.current, []);

    // Set viewport position and scale programmatically
    const setViewportPosition = useCallback((viewport: Viewport) => {
        setStagePos({ x: viewport.x, y: viewport.y });
        setScale(viewport.scale);
        notifyViewportChange({ x: viewport.x, y: viewport.y }, viewport.scale);
    }, [notifyViewportChange]);

    // Expose imperative handle
    useImperativeHandle(ref, () => ({
        zoomIn,
        zoomOut,
        resetView,
        getViewport,
        getStage,
        setViewport: setViewportPosition
    }), [zoomIn, zoomOut, resetView, getViewport, getStage, setViewportPosition]);

    return (
        <Stage
            ref={stageRef}
            width={width}
            height={height}
            x={stagePos.x}
            y={stagePos.y}
            scaleX={scale}
            scaleY={scale}
            onWheel={handleWheel}
            onMouseDown={handleMouseDown}
            onMouseMove={handleMouseMove}
            onMouseUp={handleMouseUp}
            onClick={handleClick}
            onContextMenu={handleContextMenu}
            style={{ backgroundColor }}
        >
            {children}
        </Stage>
    );
});

SceneCanvas.displayName = 'SceneCanvas';
