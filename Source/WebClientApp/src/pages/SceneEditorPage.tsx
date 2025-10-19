import React, { useState, useRef, useEffect } from 'react';
import { Box, useTheme } from '@mui/material';
import Konva from 'konva';
import {
    SceneCanvas,
    SceneCanvasHandle,
    Viewport,
    BackgroundLayer,
    GridRenderer,
    SceneEditorMenuBar,
    TokenPlacement,
    TokenDragHandle,
    UndoRedoToolbar
} from '@components/scene';
import { ConnectionStatusBanner, EditingBlocker } from '@components/common';
import { GridConfig, GridType, getDefaultGrid } from '@utils/gridCalculator';
import { layerManager, LayerName } from '@services/layerManager';
import { Asset, PlacedAsset } from '@/types/domain';
import { UndoRedoProvider, useUndoRedoContext } from '@/contexts/UndoRedoContext';
import { useConnectionStatus } from '@/hooks/useConnectionStatus';
import {
    createPlaceAssetCommand,
    createMoveAssetCommand,
    createRemoveAssetCommand
} from '@/utils/commands';

const STAGE_WIDTH = 2800;
const STAGE_HEIGHT = 2100;
const DEFAULT_BACKGROUND_IMAGE = '/assets/backgrounds/default.png';

const APP_BAR_HEIGHT = 64;
const MENU_BAR_HEIGHT = 50;
const TOTAL_TOP_OFFSET = APP_BAR_HEIGHT + MENU_BAR_HEIGHT;

const SceneEditorPageInternal: React.FC = () => {
    const theme = useTheme();
    const canvasRef = useRef<SceneCanvasHandle>(null);
    const stageRef = useRef<Konva.Stage>(null);
    const { execute } = useUndoRedoContext();
    const { isOnline } = useConnectionStatus();

    const initialViewport = {
        x: (window.innerWidth - STAGE_WIDTH) / 2,
        y: ((window.innerHeight - TOTAL_TOP_OFFSET) - STAGE_HEIGHT) / 2,
        scale: 1
    };

    const [viewport, setViewport] = useState<Viewport>(initialViewport);
    const [gridConfig, setGridConfig] = useState<GridConfig>(getDefaultGrid());
    const [backgroundImageUrl] = useState<string>(DEFAULT_BACKGROUND_IMAGE);
    const [draggedAsset, setDraggedAsset] = useState<Asset | null>(null);
    const [selectedAssetId, setSelectedAssetId] = useState<string | null>(null);

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

    useEffect(() => {
        localStorage.setItem('scene-placed-assets', JSON.stringify(placedAssets));
    }, [placedAssets]);

    useEffect(() => {
        const stage = canvasRef.current?.getStage();
        if (stage) {
            stageRef.current = stage;
            layerManager.initialize(stage);
            layerManager.enforceZOrder();
        }
    }, []);

    useEffect(() => {
        const handleKeyDown = (e: KeyboardEvent) => {
            if (e.key === 'Escape' && draggedAsset) {
                setDraggedAsset(null);
            }
        };
        window.addEventListener('keydown', handleKeyDown);
        return () => window.removeEventListener('keydown', handleKeyDown);
    }, [draggedAsset]);

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

    const handleGridChange = (newGrid: GridConfig) => {
        setGridConfig(newGrid);
    };

    const handleBackgroundUpload = () => {
        console.log('Background upload clicked');
    };

    const handleOutsideClick = () => {
        if (draggedAsset) {
            setDraggedAsset(null);
        }
    };

    const handleAssetSelect = (asset: Asset) => {
        if (!isOnline) return;
        setDraggedAsset(asset);
    };

    const handleAssetPlaced = (asset: PlacedAsset) => {
        const command = createPlaceAssetCommand({
            asset,
            onPlace: (placedAsset) => {
                setPlacedAssets(prev => [...prev, placedAsset]);
            },
            onRemove: (assetId) => {
                setPlacedAssets(prev => prev.filter(a => a.id !== assetId));
            }
        });
        execute(command);
    };

    const handleAssetMoved = (assetId: string, newPosition: { x: number; y: number }) => {
        const asset = placedAssets.find(a => a.id === assetId);
        if (!asset) return;

        const command = createMoveAssetCommand({
            assetId,
            oldPosition: asset.position,
            newPosition,
            onMove: (id, position) => {
                setPlacedAssets(prev =>
                    prev.map(a => (a.id === id ? { ...a, position } : a))
                );
            }
        });
        execute(command);
    };

    const handleAssetDeleted = (assetId: string) => {
        const asset = placedAssets.find(a => a.id === assetId);
        if (!asset) return;

        const command = createRemoveAssetCommand({
            asset,
            onPlace: (placedAsset) => {
                setPlacedAssets(prev => [...prev, placedAsset]);
            },
            onRemove: (id) => {
                setPlacedAssets(prev => prev.filter(a => a.id !== id));
            }
        });
        execute(command);
    };

    const handleAssetSelected = (assetId: string | null) => {
        setSelectedAssetId(assetId);
    };

    const handleDragComplete = () => {
        setDraggedAsset(null);
    };

    return (
        <Box sx={{ display: 'flex', flexDirection: 'column', height: '100vh', position: 'relative' }}>
            <ConnectionStatusBanner />
            <EditingBlocker isBlocked={!isOnline} />

            <Box
                onClick={handleOutsideClick}
                sx={{
                    flexShrink: 0,
                    height: MENU_BAR_HEIGHT,
                    overflow: 'visible',
                    position: 'relative',
                    zIndex: 10,
                    pointerEvents: 'none'
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

            <Box
                sx={{
                    flexGrow: 1,
                    overflow: 'hidden',
                    bgcolor: 'background.default',
                    position: 'relative',
                    width: '100%',
                    height: `calc(100vh - ${MENU_BAR_HEIGHT}px)`
                }}
            >
                <SceneCanvas
                    ref={canvasRef}
                    width={window.innerWidth}
                    height={window.innerHeight - MENU_BAR_HEIGHT}
                    initialPosition={{ x: initialViewport.x, y: initialViewport.y }}
                    backgroundColor={theme.palette.background.default}
                    onViewportChange={handleViewportChange}
                >
                    <BackgroundLayer
                        imageUrl={backgroundImageUrl}
                        backgroundColor={theme.palette.background.default}
                        stageWidth={STAGE_WIDTH}
                        stageHeight={STAGE_HEIGHT}
                        layerName={LayerName.Background}
                    />

                    <GridRenderer
                        grid={gridConfig}
                        stageWidth={STAGE_WIDTH}
                        stageHeight={STAGE_HEIGHT}
                        visible={gridConfig.type !== GridType.NoGrid}
                    />

                    <TokenPlacement
                        placedAssets={placedAssets}
                        onAssetPlaced={handleAssetPlaced}
                        onAssetMoved={handleAssetMoved}
                        onAssetDeleted={handleAssetDeleted}
                        gridConfig={gridConfig}
                        draggedAsset={draggedAsset}
                        onDragComplete={handleDragComplete}
                    />

                    <TokenDragHandle
                        placedAssets={placedAssets}
                        selectedAssetId={selectedAssetId}
                        onAssetSelected={handleAssetSelected}
                        onAssetMoved={handleAssetMoved}
                        onAssetDeleted={handleAssetDeleted}
                        gridConfig={gridConfig}
                        stageRef={stageRef as React.RefObject<Konva.Stage>}
                    />
                </SceneCanvas>

                <Box
                    sx={{
                        position: 'absolute',
                        bottom: 16,
                        right: 16,
                        zIndex: 5
                    }}
                >
                    <UndoRedoToolbar />
                </Box>
            </Box>
        </Box>
    );
};

export const SceneEditorPage: React.FC = () => {
    return (
        <UndoRedoProvider>
            <SceneEditorPageInternal />
        </UndoRedoProvider>
    );
};
