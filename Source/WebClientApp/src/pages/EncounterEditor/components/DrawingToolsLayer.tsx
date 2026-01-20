import React from 'react';
import { Layer } from 'react-konva';
import {
    type DrawingMode,
    RegionBucketFillTool,
    RegionDrawingTool,
    SourceDrawingTool,
    WallDrawingTool,
} from '@components/encounter';
import type { LightPlacementProperties, SoundPlacementProperties } from '@components/encounter/panels';
import { LayerName } from '@services/layerManager';
import type { GridConfig } from '@utils/gridCalculator';
import type { Encounter, PlacedWall, Point, SegmentState, SegmentType } from '@/types/domain';
import type { UseRegionTransactionReturn } from '@/hooks/useRegionTransaction';
import type { UseWallTransactionReturn } from '@/hooks/useWallTransaction';
import { polesToSegments } from '@/utils/wallUtils';
import { updateWallOptimistic, updateRegionOptimistic } from '@/utils/encounterStateUtils';
import {
    getBucketMinusCursor,
    getBucketPlusCursor,
    getCrosshairMinusCursor,
    getCrosshairPlusCursor,
} from '@/utils/customCursors';

export interface DrawingToolsLayerProps {
    // Encounter data
    encounter: Encounter | null;
    encounterId: string | undefined;

    // Drawing mode state
    drawingMode: DrawingMode | null;
    drawingWallIndex: number | null;
    drawingWallDefaultHeight: number;
    drawingWallSegmentType: SegmentType;
    drawingWallIsOpaque: boolean;
    drawingWallState: SegmentState;
    drawingRegionIndex: number | null;

    // Grid config
    gridConfig: GridConfig;

    // Transactions
    wallTransaction: UseWallTransactionReturn;
    regionTransaction: UseRegionTransactionReturn;

    // Encounter state setter
    setEncounter: React.Dispatch<React.SetStateAction<Encounter | null>>;

    // Structure handlers
    onStructurePlacementCancel: () => Promise<void>;
    onStructurePlacementFinish: () => Promise<void>;
    onRegionPlacementCancel: () => Promise<void>;
    onBucketFillFinish: () => Promise<void>;

    // Source drawing
    activeTool: string | null;
    sourcePlacementProperties: (LightPlacementProperties | SoundPlacementProperties) & { sourceType: 'light' | 'sound' } | null;
    execute: (command: unknown) => Promise<void>;
    refetch: () => Promise<void>;
    onSourcePlacementFinish: (success: boolean) => void;
    onSourcePlacementCancel: () => void;

    // Fog of war drawing
    fogDrawingTool: 'polygon' | 'bucketFill' | null;
    fogMode: 'add' | 'subtract';
    fogDrawingVertices: Point[];
    setFogDrawingVertices: React.Dispatch<React.SetStateAction<Point[]>>;
    setFogDrawingTool: React.Dispatch<React.SetStateAction<'polygon' | 'bucketFill' | null>>;
    onPolygonComplete: (vertices: Point[]) => Promise<void>;
    onBucketFillComplete: (cellsToFill: Point[][]) => Promise<void>;

    // Stage data
    placedWalls: PlacedWall[];
    stageSize: { width: number; height: number };
}

export const DrawingToolsLayer: React.FC<DrawingToolsLayerProps> = ({
    encounter,
    encounterId,
    drawingMode,
    drawingWallIndex,
    drawingWallDefaultHeight,
    drawingWallSegmentType,
    drawingWallIsOpaque,
    drawingWallState,
    drawingRegionIndex,
    gridConfig,
    wallTransaction,
    regionTransaction,
    setEncounter,
    onStructurePlacementCancel,
    onStructurePlacementFinish,
    onRegionPlacementCancel,
    onBucketFillFinish,
    activeTool,
    sourcePlacementProperties,
    execute,
    refetch,
    onSourcePlacementFinish,
    onSourcePlacementCancel,
    fogDrawingTool,
    fogMode,
    fogDrawingVertices,
    setFogDrawingVertices,
    setFogDrawingTool,
    onPolygonComplete,
    onBucketFillComplete,
    placedWalls,
    stageSize,
}) => {
    if (!encounter || !encounterId) {
        return null;
    }

    return (
        <Layer name={LayerName.DrawingTools} listening={true}>
            {drawingMode === 'wall' && drawingWallIndex !== null && (
                <WallDrawingTool
                    encounterId={encounterId}
                    wallIndex={drawingWallIndex}
                    gridConfig={gridConfig}
                    defaultHeight={drawingWallDefaultHeight}
                    segmentType={drawingWallSegmentType}
                    isOpaque={drawingWallIsOpaque}
                    segmentState={drawingWallState}
                    onCancel={onStructurePlacementCancel}
                    onFinish={onStructurePlacementFinish}
                    onPolesChange={(newPoles) => {
                        const newSegments = polesToSegments(newPoles, false);
                        wallTransaction.updateSegment(-1, { segments: newSegments });

                        setEncounter((prev) => {
                            if (!prev) return prev;
                            return updateWallOptimistic(prev, -1, { segments: newSegments });
                        });
                    }}
                    wallTransaction={wallTransaction}
                />
            )}

            {drawingMode === 'region' && drawingRegionIndex !== null && (
                <RegionDrawingTool
                    encounterId={encounterId}
                    regionIndex={drawingRegionIndex}
                    gridConfig={gridConfig}
                    regionType={regionTransaction.transaction.segment?.type || 'Elevation'}
                    {...(regionTransaction.transaction.segment?.color && {
                        regionColor: regionTransaction.transaction.segment.color,
                    })}
                    onCancel={onRegionPlacementCancel}
                    onFinish={onStructurePlacementFinish}
                    onVerticesChange={(newVertices: Point[]) => {
                        regionTransaction.updateVertices(newVertices);
                        setEncounter((prev) => {
                            if (!prev) return prev;
                            return updateRegionOptimistic(prev, -1, { vertices: newVertices });
                        });
                    }}
                    regionTransaction={regionTransaction}
                />
            )}

            {drawingMode === 'bucketFill' && drawingRegionIndex !== null && (
                <RegionBucketFillTool
                    encounterId={encounterId}
                    gridConfig={gridConfig}
                    onCancel={onRegionPlacementCancel}
                    onFinish={onBucketFillFinish}
                    regionType={regionTransaction.transaction.segment?.type || 'Elevation'}
                    {...(regionTransaction.transaction.segment?.color && {
                        regionColor: regionTransaction.transaction.segment.color,
                    })}
                    regionTransaction={regionTransaction}
                    walls={placedWalls}
                    stageSize={stageSize}
                />
            )}

            {activeTool === 'sourceDrawing' && sourcePlacementProperties && (
                <SourceDrawingTool
                    encounterId={encounterId}
                    source={
                        sourcePlacementProperties.sourceType === 'light'
                            ? {
                                sourceType: 'light' as const,
                                name: sourcePlacementProperties.name || '',
                                type: (sourcePlacementProperties as LightPlacementProperties).type,
                                isDirectional: (sourcePlacementProperties as LightPlacementProperties).isDirectional,
                                direction: (sourcePlacementProperties as LightPlacementProperties).direction || 0,
                                arc: (sourcePlacementProperties as LightPlacementProperties).arc || 90,
                                color: (sourcePlacementProperties as LightPlacementProperties).color || '',
                                isOn: (sourcePlacementProperties as LightPlacementProperties).isOn || true,
                            }
                            : {
                                sourceType: 'sound' as const,
                                name: sourcePlacementProperties.name || '',
                                resourceId: (sourcePlacementProperties as SoundPlacementProperties).resourceId || '',
                                isPlaying: (sourcePlacementProperties as SoundPlacementProperties).isPlaying || false,
                            }
                    }
                    walls={encounter.stage.walls || []}
                    gridConfig={gridConfig}
                    execute={execute}
                    onRefetch={refetch}
                    onComplete={onSourcePlacementFinish}
                    onCancel={onSourcePlacementCancel}
                />
            )}

            {fogDrawingTool === 'polygon' && (
                <RegionDrawingTool
                    encounterId={encounterId}
                    regionIndex={-1}
                    gridConfig={gridConfig}
                    regionType='FogOfWar'
                    cursor={fogMode === 'add' ? getCrosshairPlusCursor() : getCrosshairMinusCursor()}
                    onCancel={() => {
                        setFogDrawingTool(null);
                        setFogDrawingVertices([]);
                    }}
                    onFinish={async () => {
                        await onPolygonComplete(fogDrawingVertices);
                        setFogDrawingVertices([]);
                        setFogDrawingTool(null);
                    }}
                    onVerticesChange={(vertices: Point[]) => setFogDrawingVertices(vertices)}
                />
            )}

            {fogDrawingTool === 'bucketFill' && (
                <RegionBucketFillTool
                    encounterId={encounterId}
                    gridConfig={gridConfig}
                    cursor={fogMode === 'add' ? getBucketPlusCursor() : getBucketMinusCursor()}
                    onCancel={() => setFogDrawingTool(null)}
                    onFinish={onBucketFillComplete}
                    regionType='FogOfWar'
                    regionTransaction={regionTransaction}
                    walls={placedWalls}
                    stageSize={stageSize}
                />
            )}
        </Layer>
    );
};
