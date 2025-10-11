// GENERATED: 2025-10-04 by Claude Code Phase 3 & 4
// EPIC: EPIC-001 Phase 3 & 4 - Scene Editor with Panning, Zoom, and Grid
// LAYER: UI (Page Component)

/**
 * Scene Editor Page
 * Konva-based tactical map editor with pan, zoom, grid overlay
 * Implements Phase 3 (pan/zoom via SceneCanvas) and Phase 4 (grid/layers)
 */

import React, { useState, useRef, useEffect } from 'react';
import { Layer, Image as KonvaImage } from 'react-konva';
import { Box, useTheme } from '@mui/material';
import {
    SceneCanvas,
    SceneCanvasHandle,
    Viewport,
    BackgroundLayer,
    GridRenderer,
    SceneEditorMenuBar,
    PlacementCursor
} from '@components/scene';
import { GridConfig, GridType, getDefaultGrid, Point, pointToCell, cellToPoint } from '@utils/gridCalculator';
import { layerManager, LayerName } from '@services/layerManager';
import { Asset, PlacedAsset, ResourceMetadata } from '@/types/domain';
import { getFirstTokenResource, getResourceUrl } from '@/utils/assetHelpers';

// Stage dimensions match the background image for 1:1 rendering at 100% zoom
const STAGE_WIDTH = 2800;
const STAGE_HEIGHT = 2100;
const DEFAULT_BACKGROUND_IMAGE = '/assets/backgrounds/default.png';

// Layout height constants
const APP_BAR_HEIGHT = 64;  // Material-UI Toolbar default height
const MENU_BAR_HEIGHT = 50;  // Scene editor menu bar (compact design)
const TOTAL_TOP_OFFSET = APP_BAR_HEIGHT + MENU_BAR_HEIGHT;  // Combined header height

// Auto-pan constants
const EDGE_PAN_THRESHOLD = 50;  // pixels from edge to trigger auto-pan
const PAN_INTERVAL = 500;        // 500ms = 2 cells per second

/**
 * Placement mode state for asset placement
 */
interface PlacementMode {
    active: boolean;
    asset: Asset | null;
}

/**
 * Scene Editor Page
 * PHASE 3: Right-click panning, zoom with wheel, 1:1 background rendering (AC: 60 FPS, smooth interaction)
 * PHASE 4: Grid rendering with 5 types, layer management (AC: all types work, z-order maintained)
 *
 * THEME SUPPORT: Canvas background adapts to dark/light mode
 * - Dark mode: #1F2937 (tactical map dark gray)
 * - Light mode: #F9FAFB (bright workspace white)
 */
export const SceneEditorPage: React.FC = () => {
    // Theme for responsive dark/light mode colors
    const theme = useTheme();

    // SceneCanvas reference for programmatic control (Phase 3)
    const canvasRef = useRef<SceneCanvasHandle>(null);

    // Calculate initial viewport position to center the stage
    const initialViewport = {
        x: (window.innerWidth - STAGE_WIDTH) / 2,
        y: ((window.innerHeight - TOTAL_TOP_OFFSET) - STAGE_HEIGHT) / 2,
        scale: 1
    };

    // Viewport state for UI display (Phase 3)
    const [viewport, setViewport] = useState<Viewport>(initialViewport);

    // Grid state (Phase 4) - Live updates, no save button needed
    const [gridConfig, setGridConfig] = useState<GridConfig>(getDefaultGrid());

    // Background state (Phase 3) - Default tavern map
    const [backgroundImageUrl] = useState<string>(DEFAULT_BACKGROUND_IMAGE);

    // Placement mode state for asset placement
    const [placementMode, setPlacementMode] = useState<PlacementMode>({ active: false, asset: null });

    // Placed assets state (single asset only) - Load from localStorage on mount
    const [placedAssets, setPlacedAssets] = useState<PlacedAsset[]>(() => {
        const stored = localStorage.getItem('scene-placed-assets');
        if (stored) {
            try {
                return JSON.parse(stored);
            } catch {
                return [];
            }
        }
        return [];
    });

    // Loaded images cache
    const [loadedImages, setLoadedImages] = useState<Record<string, HTMLImageElement>>({});

    // Auto-pan refs
    const panIntervalRef = useRef<number | null>(null);
    const mousePosRef = useRef({ x: 0, y: 0 });

    // Save placed assets to localStorage whenever they change
    useEffect(() => {
        localStorage.setItem('scene-placed-assets', JSON.stringify(placedAssets));
    }, [placedAssets]);

    // Load images for placed assets
    useEffect(() => {
        placedAssets.forEach(pa => {
            const tokenResource = getFirstTokenResource(pa.asset);
            if (!tokenResource || loadedImages[tokenResource.resourceId]) return;

            const img = new window.Image();
            img.src = getResourceUrl(tokenResource.resourceId);
            img.crossOrigin = 'anonymous';

            img.onload = () => {
                setLoadedImages(prev => ({
                    ...prev,
                    [tokenResource.resourceId]: img
                }));
            };
        });
    }, [placedAssets, loadedImages]);

    // Initialize layer manager on mount (Phase 4)
    useEffect(() => {
        const stage = canvasRef.current?.getStage();
        if (stage) {
            layerManager.initialize(stage);
            layerManager.enforceZOrder();
        }
    }, []);

    // ESC key handler to cancel placement mode
    useEffect(() => {
        const handleKeyDown = (e: KeyboardEvent) => {
            if (e.key === 'Escape' && placementMode.active) {
                setPlacementMode({ active: false, asset: null });
            }
        };
        window.addEventListener('keydown', handleKeyDown);
        return () => window.removeEventListener('keydown', handleKeyDown);
    }, [placementMode.active]);

    // Auto-pan when cursor approaches viewport edges during placement
    useEffect(() => {
        if (!placementMode.active) {
            // Clear any existing interval when placement mode exits
            if (panIntervalRef.current !== null) {
                clearInterval(panIntervalRef.current);
                panIntervalRef.current = null;
            }
            return;
        }

        // Extract pan logic to reusable function
        const executePan = () => {
            const stage = canvasRef.current?.getStage();
            const currentViewport = canvasRef.current?.getViewport();
            if (!stage || !currentViewport) return;

            const viewportWidth = window.innerWidth;
            const viewportHeight = window.innerHeight - TOTAL_TOP_OFFSET;

            // Check edges using current mouse position
            const { x: mouseX, y: mouseY } = mousePosRef.current;
            const isNearLeft = mouseX < EDGE_PAN_THRESHOLD;
            const isNearRight = mouseX > viewportWidth - EDGE_PAN_THRESHOLD;
            const isNearTop = mouseY >= TOTAL_TOP_OFFSET && mouseY < TOTAL_TOP_OFFSET + EDGE_PAN_THRESHOLD;
            const isNearBottom = mouseY > TOTAL_TOP_OFFSET +viewportHeight - EDGE_PAN_THRESHOLD;

            if (!isNearLeft && !isNearRight && !isNearTop && !isNearBottom) {
                // Mouse moved away from edges, stop panning
                if (panIntervalRef.current !== null) {
                    clearInterval(panIntervalRef.current);
                    panIntervalRef.current = null;
                }
                return;
            }

            // Calculate pan delta (2 cells per second)
            let dx = 0;
            let dy = 0;

            if (isNearLeft) dx = gridConfig.cellWidth;      // Pan right
            if (isNearRight) dx = -gridConfig.cellWidth;    // Pan left
            if (isNearTop) dy = gridConfig.cellHeight;      // Pan down
            if (isNearBottom) dy = -gridConfig.cellHeight;  // Pan up

            // Calculate new position
            const newX = currentViewport.x + dx;
            const newY = currentViewport.y + dy;

            // Calculate scene boundaries based on zoom
            const visibleSceneWidth = viewportWidth / currentViewport.scale;
            const visibleSceneHeight = viewportHeight / currentViewport.scale;

            const maxPanRight = 0;
            const maxPanLeft = Math.min(0, -(STAGE_WIDTH - visibleSceneWidth));
            const maxPanDown = 0;
            const maxPanUp = Math.min(0, -(STAGE_HEIGHT - visibleSceneHeight));

            // Clamp to boundaries
            const clampedX = Math.max(maxPanLeft, Math.min(maxPanRight, newX));
            const clampedY = Math.max(maxPanUp, Math.min(maxPanDown, newY));

            // Only update if position actually changes
            if (clampedX !== currentViewport.x || clampedY !== currentViewport.y) {
                canvasRef.current?.setViewport({
                    x: clampedX,
                    y: clampedY,
                    scale: currentViewport.scale
                });
            }
        };

        const handleMouseMove = (e: MouseEvent) => {
            // Update mouse position ref
            mousePosRef.current = { x: e.clientX, y: e.clientY };

            // Get viewport dimensions
            const viewportWidth = window.innerWidth;
            const viewportHeight = window.innerHeight - TOTAL_TOP_OFFSET;

            // Check proximity to edges
            const nearLeft = e.clientX < EDGE_PAN_THRESHOLD;
            const nearRight = e.clientX > viewportWidth - EDGE_PAN_THRESHOLD;
            const nearTop = e.clientY < TOTAL_TOP_OFFSET + EDGE_PAN_THRESHOLD;
            const nearBottom = e.clientY > TOTAL_TOP_OFFSET + viewportHeight - EDGE_PAN_THRESHOLD;

            const nearAnyEdge = nearLeft || nearRight || nearTop || nearBottom;

            if (nearAnyEdge && panIntervalRef.current === null) {
                // Execute first pan immediately
                executePan();
                panIntervalRef.current = window.setInterval(executePan, PAN_INTERVAL);
            } else if (!nearAnyEdge && panIntervalRef.current !== null) {
                // Mouse left edge zone, stop panning
                clearInterval(panIntervalRef.current);
                panIntervalRef.current = null;
            }
        };

        window.addEventListener('mousemove', handleMouseMove);

        return () => {
            window.removeEventListener('mousemove', handleMouseMove);
            if (panIntervalRef.current !== null) {
                clearInterval(panIntervalRef.current);
                panIntervalRef.current = null;
            }
        };
    }, [placementMode.active, gridConfig.cellWidth, gridConfig.cellHeight]);

    // PHASE 3: Viewport change handler
    const handleViewportChange = (newViewport: Viewport) => {
        setViewport(newViewport);
    };

    // Zoom controls
    const handleZoomIn = () => {
        canvasRef.current?.zoomIn();
    };

    const handleZoomOut = () => {
        canvasRef.current?.zoomOut();
    };

    const handleZoomReset = () => {
        canvasRef.current?.resetView();
    };

    // Grid configuration - live updates
    const handleGridChange = (newGrid: GridConfig) => {
        setGridConfig(newGrid);
        // In real implementation, this would debounce and call:
        // await sceneApi.updateGrid({ sceneId, grid: newGrid });
    };

    // Background upload handler
    const handleBackgroundUpload = () => {
        // TODO: Implement file upload dialog
        console.log('Background upload clicked');
    };

    // Cancel placement when clicking outside scene (menu bar, etc)
    const handleOutsideClick = () => {
        if (placementMode.active) {
            setPlacementMode({ active: false, asset: null });
        }
    };

    // Asset selection handler - enters placement mode
    const handleAssetSelect = (asset: Asset) => {
        setPlacementMode({ active: true, asset });
    };

    // Helper: Get layer name from asset category
    const getLayerFromCategory = (_category: string): LayerName => {
        // TODO: Implement proper category-to-layer mapping when AssetCategory enum is available
        return LayerName.Agents;
    };

    // Helper: Calculate size to fit grid cell (maintain aspect ratio)
    const calculateAssetSize = (
        metadata: ResourceMetadata | undefined,
        cellWidth: number,
        cellHeight: number
    ): { width: number; height: number } => {
        if (!metadata?.imageSize) {
            return { width: cellWidth, height: cellHeight };
        }

        const { width, height } = metadata.imageSize;
        const scale = Math.min(cellWidth / width, cellHeight / height);

        return {
            width: width * scale,
            height: height * scale
        };
    };

    // Canvas click handler for asset placement (SINGLE ASSET ONLY)
    const handleCanvasClick = (position: Point) => {
        if (!placementMode.active || !placementMode.asset) return;

        // Get placement position (with snap-to-grid if enabled)
        let placementPos = position;
        if (gridConfig.snapToGrid) {
            const cell = pointToCell(position, gridConfig);
            placementPos = cellToPoint(cell, gridConfig);
        }

        // Get token resource and calculate image size to fit cell (maintain aspect ratio)
        const tokenResource = getFirstTokenResource(placementMode.asset);
        const imageSize = calculateAssetSize(
            tokenResource?.resource?.metadata,
            gridConfig.cellWidth,
            gridConfig.cellHeight
        );

        // Determine layer from asset kind (TODO: implement proper category-to-layer mapping)
        const layer = getLayerFromCategory(placementMode.asset.kind);

        // Create placed asset instance
        const placedAsset: PlacedAsset = {
            id: crypto.randomUUID(),
            assetId: placementMode.asset.id,
            asset: placementMode.asset,
            position: placementPos,
            size: imageSize,
            rotation: 0,
            layer: layer
        };

        // Replace existing asset (SINGLE ASSET ONLY)
        setPlacedAssets([placedAsset]);

        // Exit placement mode
        setPlacementMode({ active: false, asset: null });
    };

    return (
        <Box sx={{ display: 'flex', flexDirection: 'column', height: '100vh' }}>
            {/* Top Menu Bar */}
            <Box
                onClick={handleOutsideClick}
                sx={{
                    flexShrink: 0,  // Prevent menu bar from shrinking
                    height: MENU_BAR_HEIGHT,  // Explicit height to prevent overlap
                    overflow: 'visible',  // Allow menus to extend beyond
                    position: 'relative',
                    zIndex: 10,  // Ensure menu is above canvas
                    pointerEvents: 'none'  // Make wrapper transparent to pointer events
                }}
            >
                <Box sx={{ pointerEvents: 'auto' }}>
                    <SceneEditorMenuBar
                        gridConfig={gridConfig}
                        onGridChange={handleGridChange}
                        zoomPercentage={viewport.scale * 100}
                        onZoomIn={handleZoomIn}
                        onZoomOut={handleZoomOut}
                        onZoomReset={handleZoomReset}
                        onBackgroundUpload={handleBackgroundUpload}
                        onAssetSelect={handleAssetSelect}
                    />
                </Box>
            </Box>

            {/* Main Canvas Area */}
            <Box
                sx={{
                    flexGrow: 1,
                    overflow: 'hidden',
                    bgcolor: 'background.default',
                    position: 'relative',  // Establish positioning context
                    width: '100%',
                    height: `calc(100vh - ${MENU_BAR_HEIGHT}px)`  // Explicit height calculation
                }}
            >
                <SceneCanvas
                    ref={canvasRef}
                    width={window.innerWidth}
                    height={window.innerHeight - MENU_BAR_HEIGHT}
                    initialPosition={{ x: initialViewport.x, y: initialViewport.y }}
                    backgroundColor={theme.palette.background.default}
                    onViewportChange={handleViewportChange}
                    onClick={handleCanvasClick}
                >
                    {/* Background Layer */}
                    <BackgroundLayer
                        imageUrl={backgroundImageUrl}
                        backgroundColor={theme.palette.background.default}
                        stageWidth={STAGE_WIDTH}
                        stageHeight={STAGE_HEIGHT}
                        layerName={LayerName.Background}
                    />

                    {/* Grid Layer */}
                    <GridRenderer
                        grid={gridConfig}
                        stageWidth={STAGE_WIDTH}
                        stageHeight={STAGE_HEIGHT}
                        visible={gridConfig.type !== GridType.NoGrid}
                    />

                    {/* Structure Layer - Static assets (walls, doors) */}
                    <Layer name={LayerName.Structure}>
                        {placedAssets
                            .filter(pa => pa.layer === LayerName.Structure)
                            .map(pa => {
                                const tokenResource = getFirstTokenResource(pa.asset);
                                const image = tokenResource ? loadedImages[tokenResource.resourceId] : undefined;
                                if (!image) return null;

                                return (
                                    <KonvaImage
                                        key={pa.id}
                                        x={pa.position.x}
                                        y={pa.position.y}
                                        width={pa.size.width}
                                        height={pa.size.height}
                                        rotation={pa.rotation}
                                        offsetX={pa.size.width / 2}
                                        offsetY={pa.size.height / 2}
                                        image={image}
                                    />
                                );
                            })}
                    </Layer>

                    {/* Objects Layer - Passive assets (crates, chests) */}
                    <Layer name={LayerName.Objects}>
                        {placedAssets
                            .filter(pa => pa.layer === LayerName.Objects)
                            .map(pa => {
                                const tokenResource = getFirstTokenResource(pa.asset);
                                const image = tokenResource ? loadedImages[tokenResource.resourceId] : undefined;
                                if (!image) return null;

                                return (
                                    <KonvaImage
                                        key={pa.id}
                                        x={pa.position.x}
                                        y={pa.position.y}
                                        width={pa.size.width}
                                        height={pa.size.height}
                                        rotation={pa.rotation}
                                        offsetX={pa.size.width / 2}
                                        offsetY={pa.size.height / 2}
                                        image={image}
                                    />
                                );
                            })}
                    </Layer>

                    {/* Agents Layer - Active entities (characters, creatures) */}
                    <Layer name={LayerName.Agents}>
                        {placedAssets
                            .filter(pa => pa.layer === LayerName.Agents)
                            .map(pa => {
                                const tokenResource = getFirstTokenResource(pa.asset);
                                const image = tokenResource ? loadedImages[tokenResource.resourceId] : undefined;
                                if (!image) return null;

                                return (
                                    <KonvaImage
                                        key={pa.id}
                                        x={pa.position.x}
                                        y={pa.position.y}
                                        width={pa.size.width}
                                        height={pa.size.height}
                                        rotation={pa.rotation}
                                        offsetX={pa.size.width / 2}
                                        offsetY={pa.size.height / 2}
                                        image={image}
                                    />
                                );
                            })}
                    </Layer>

                    {/* Foreground Layer */}
                    <Layer name={LayerName.Foreground}>
                        {/* Fog of war, effects will go here */}
                    </Layer>

                    {/* UI Layer - Placement cursor and overlays */}
                    <Layer name={LayerName.UI}>
                        {placementMode.active && placementMode.asset && (
                            <PlacementCursor
                                asset={placementMode.asset}
                                gridConfig={gridConfig}
                                canvasRef={canvasRef}
                                scale={viewport.scale}
                                stagePos={{ x: viewport.x, y: viewport.y }}
                            />
                        )}
                    </Layer>
                </SceneCanvas>
            </Box>
        </Box>
    );
};
