import React, { useState, useRef, useEffect } from 'react';
import { Box, useTheme, Backdrop, CircularProgress, Typography } from '@mui/material';
import { Layer } from 'react-konva';
import Konva from 'konva';
import {
    SceneCanvas,
    SceneCanvasHandle,
    Viewport,
    BackgroundLayer,
    GridRenderer,
    SceneEditorMenuBar,
    TokenPlacement,
    TokenDragHandle
} from '@components/scene';
import { EditingBlocker } from '@components/common';
import { GridConfig, GridType, getDefaultGrid } from '@utils/gridCalculator';
import { layerManager, LayerName } from '@services/layerManager';
import { Asset, PlacedAsset } from '@/types/domain';
import { UndoRedoProvider, useUndoRedoContext } from '@/contexts/UndoRedoContext';
import { useConnectionStatus } from '@/hooks/useConnectionStatus';
import {
    createPlaceAssetCommand,
    createMoveAssetCommand,
    createRemoveAssetCommand,
    createBatchCommand
} from '@/utils/commands';

const STAGE_WIDTH = 2800;
const STAGE_HEIGHT = 2100;
const DEFAULT_BACKGROUND_IMAGE = '/assets/backgrounds/default.png';

const MENU_BAR_HEIGHT = 50;
const EDITOR_HEADER_HEIGHT = 64;
const TOTAL_TOP_HEIGHT = EDITOR_HEADER_HEIGHT + MENU_BAR_HEIGHT;

const SceneEditorPageInternal: React.FC = () => {
    const theme = useTheme();
    const canvasRef = useRef<SceneCanvasHandle>(null);
    const stageRef = useRef<Konva.Stage>(null);
    const { execute } = useUndoRedoContext();
    const { isOnline } = useConnectionStatus();

    const initialViewport = {
        x: (window.innerWidth - STAGE_WIDTH) / 2,
        y: ((window.innerHeight - TOTAL_TOP_HEIGHT) - STAGE_HEIGHT) / 2,
        scale: 1
    };

    const [viewport, setViewport] = useState<Viewport>(initialViewport);
    const [gridConfig, setGridConfig] = useState<GridConfig>(getDefaultGrid());
    const [backgroundImageUrl] = useState<string>(DEFAULT_BACKGROUND_IMAGE);
    const [draggedAsset, setDraggedAsset] = useState<Asset | null>(null);
    const [selectedAssetIds, setSelectedAssetIds] = useState<string[]>(() => {
        const stored = localStorage.getItem('scene-selected-assets');
        if (stored) {
            try {
                return JSON.parse(stored);
            } catch {
                return [];
            }
        }
        return [];
    });
    const [isSceneReady, setIsSceneReady] = useState<boolean>(false);
    const [imagesLoaded, setImagesLoaded] = useState<boolean>(false);
    const [handlersReady, setHandlersReady] = useState<boolean>(false);

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
        localStorage.setItem('scene-selected-assets', JSON.stringify(selectedAssetIds));
    }, [selectedAssetIds]);

    useEffect(() => {
        const stage = canvasRef.current?.getStage();
        if (stage) {
            stageRef.current = stage;
            layerManager.initialize(stage);
            layerManager.enforceZOrder();
        }
    }, []);

    useEffect(() => {
        if (stageRef.current && imagesLoaded && handlersReady && !isSceneReady) {
            // eslint-disable-next-line react-hooks/set-state-in-effect
            setIsSceneReady(true);
        }
    }, [imagesLoaded, handlersReady, isSceneReady]);

    const [isAltPressed, setIsAltPressed] = useState(false);
    const [isCtrlPressed, setIsCtrlPressed] = useState(false);
    const [isShiftPressed, setIsShiftPressed] = useState(false);

    const snapMode: 'free' | 'grid' | 'half-step' =
        isAltPressed && isCtrlPressed ? 'half-step' :
        isAltPressed ? 'free' :
        isCtrlPressed ? 'grid' :
        gridConfig.snapToGrid ? 'grid' : 'free';

    useEffect(() => {
        const handleKeyDown = (e: KeyboardEvent) => {
            if (e.key === 'Alt' || e.key === 'Control' || e.key === 'Shift') {
                e.preventDefault();
            }

            if (e.key === 'Escape' && draggedAsset) {
                setDraggedAsset(null);
            }
            if (e.key === 'Alt') {
                setIsAltPressed(true);
            }
            if (e.key === 'Control') {
                setIsCtrlPressed(true);
            }
            if (e.key === 'Shift') {
                setIsShiftPressed(true);
            }
        };

        const handleKeyUp = (e: KeyboardEvent) => {
            if (e.key === 'Alt' || e.key === 'Control' || e.key === 'Shift') {
                e.preventDefault();
            }

            if (e.key === 'Alt') {
                setIsAltPressed(false);
            }
            if (e.key === 'Control') {
                setIsCtrlPressed(false);
            }
            if (e.key === 'Shift') {
                setIsShiftPressed(false);
            }
        };

        window.addEventListener('keydown', handleKeyDown, { capture: true });
        window.addEventListener('keyup', handleKeyUp, { capture: true });

        return () => {
            window.removeEventListener('keydown', handleKeyDown, { capture: true });
            window.removeEventListener('keyup', handleKeyUp, { capture: true });
        };
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
        // TODO: Implement background upload functionality
    };

    const handleOutsideClick = () => {
        if (draggedAsset) {
            setDraggedAsset(null);
        }
    };

    const handleAssetSelect = (asset: Asset) => {
        if (!isOnline) {
            return;
        }
        setDraggedAsset(asset);
    };

    const handleAssetPlaced = (asset: PlacedAsset) => {
        const command = createPlaceAssetCommand({
            asset,
            onPlace: (placedAsset) => {
                setPlacedAssets(prev => {
                    if (prev.some(a => a.id === placedAsset.id)) {
                        return prev;
                    }
                    return [...prev, placedAsset];
                });
            },
            onRemove: (assetId) => {
                setPlacedAssets(prev => prev.filter(a => a.id !== assetId));
            }
        });
        execute(command);
    };

    const handleAssetMoved = (moves: Array<{ assetId: string; oldPosition: { x: number; y: number }; newPosition: { x: number; y: number } }>) => {
        if (moves.length === 0) return;

        if (moves.length === 1) {
            const { assetId, oldPosition, newPosition } = moves[0];

            const command = createMoveAssetCommand({
                assetId,
                oldPosition,
                newPosition,
                onMove: (id, position) => {
                    setPlacedAssets(prev =>
                        prev.map(a => (a.id === id ? { ...a, position } : a))
                    );
                }
            });
            execute(command);
        } else {
            const commands = moves.map(({ assetId, oldPosition, newPosition }) => {
                return createMoveAssetCommand({
                    assetId,
                    oldPosition,
                    newPosition,
                    onMove: (id, position) => {
                        setPlacedAssets(prev =>
                            prev.map(a => (a.id === id ? { ...a, position } : a))
                        );
                    }
                });
            });

            execute(createBatchCommand({ commands }));
        }
    };

    const handleAssetDeleted = () => {
        if (selectedAssetIds.length === 0) return;

        const assetsToDelete = placedAssets.filter(a => selectedAssetIds.includes(a.id));

        if (assetsToDelete.length === 1) {
            const command = createRemoveAssetCommand({
                asset: assetsToDelete[0],
                onPlace: (placedAsset) => {
                    setPlacedAssets(prev => {
                        if (prev.some(a => a.id === placedAsset.id)) {
                            return prev;
                        }
                        return [...prev, placedAsset];
                    });
                },
                onRemove: (id) => {
                    setPlacedAssets(prev => prev.filter(a => a.id !== id));
                }
            });
            execute(command);
        } else {
            const commands = assetsToDelete.map(asset =>
                createRemoveAssetCommand({
                    asset,
                    onPlace: (placedAsset) => {
                        setPlacedAssets(prev => {
                            if (prev.some(a => a.id === placedAsset.id)) {
                                return prev;
                            }
                            return [...prev, placedAsset];
                        });
                    },
                    onRemove: (id) => {
                        setPlacedAssets(prev => prev.filter(a => a.id !== id));
                    }
                })
            );
            execute(createBatchCommand({ commands }));
        }

        setSelectedAssetIds([]);
    };

    const handleAssetSelected = (assetIds: string[]) => {
        setSelectedAssetIds(assetIds);
    };

    const handleDragComplete = () => {
        setDraggedAsset(null);
    };

    const handleImagesLoaded = () => {
        setImagesLoaded(true);
    };

    const handleHandlersReady = () => {
        setHandlersReady(true);
    };

    return (
        <Box sx={{ display: 'flex', flexDirection: 'column', height: '100%', position: 'relative' }}>
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
                    {/* Layer 1: Static (background + grid) */}
                    <Layer name={LayerName.Static} listening={false}>
                        <BackgroundLayer
                            imageUrl={backgroundImageUrl}
                            backgroundColor={theme.palette.background.default}
                            stageWidth={STAGE_WIDTH}
                            stageHeight={STAGE_HEIGHT}
                        />

                        <GridRenderer
                            grid={gridConfig}
                            stageWidth={STAGE_WIDTH}
                            stageHeight={STAGE_HEIGHT}
                            visible={gridConfig.type !== GridType.NoGrid}
                        />
                    </Layer>

                    {/* Layer 2: Game World (structure + objects + creatures) */}
                    <TokenPlacement
                        placedAssets={placedAssets}
                        onAssetPlaced={handleAssetPlaced}
                        onAssetMoved={handleAssetMoved}
                        onAssetDeleted={handleAssetDeleted}
                        gridConfig={gridConfig}
                        draggedAsset={draggedAsset}
                        onDragComplete={handleDragComplete}
                        onImagesLoaded={handleImagesLoaded}
                        snapMode={snapMode}
                    />

                    {/* Layer 3: Effects (placeholder for future) */}
                    <Layer name={LayerName.Effects}>
                        {/* Future: effects components */}
                    </Layer>

                    {/* Layer 4: UI Overlay (transformer + selection) */}
                    <TokenDragHandle
                        placedAssets={placedAssets}
                        selectedAssetIds={selectedAssetIds}
                        onAssetSelected={handleAssetSelected}
                        onAssetMoved={handleAssetMoved}
                        onAssetDeleted={handleAssetDeleted}
                        gridConfig={gridConfig}
                        stageRef={stageRef as React.RefObject<Konva.Stage>}
                        isPlacementMode={!!draggedAsset}
                        enableDragMove={true}
                        onReady={handleHandlersReady}
                        snapMode={snapMode}
                        isShiftPressed={isShiftPressed}
                        isCtrlPressed={isCtrlPressed}
                    />
                </SceneCanvas>
            </Box>

            <Backdrop
                open={!isSceneReady}
                sx={{
                    color: theme.palette.text.primary,
                    bgcolor: theme.palette.background.default,
                    zIndex: theme.zIndex.drawer + 1,
                    position: 'absolute',
                    top: 0,
                    left: 0,
                    right: 0,
                    bottom: 0
                }}
            >
                <Box
                    sx={{
                        display: 'flex',
                        flexDirection: 'column',
                        alignItems: 'center',
                        gap: theme.spacing(2)
                    }}
                >
                    <CircularProgress
                        size={60}
                        thickness={4}
                        sx={{
                            color: theme.palette.primary.main
                        }}
                    />
                    <Typography
                        variant="h6"
                        sx={{
                            color: theme.palette.text.primary
                        }}
                    >
                        Loading Scene...
                    </Typography>
                </Box>
            </Backdrop>
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
