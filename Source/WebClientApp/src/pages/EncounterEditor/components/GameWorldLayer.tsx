import React from 'react';
import { Group, Layer } from 'react-konva';
import {
    LightSourceRenderer,
    RegionRenderer,
    RegionTransformer,
    WallRenderer,
    WallTransformer,
} from '@components/encounter';
import { SoundSourceRenderer } from '@components/encounter';
import { GroupName, LayerName } from '@services/layerManager';
import { sortRegionsForRendering } from '@utils/regionColorUtils';
import type { InteractionScope } from '@utils/scopeFiltering';
import type { GridConfig } from '@utils/gridCalculator';
import type {
    Encounter,
    EncounterWall,
    PlacedLightSource,
    PlacedRegion,
    PlacedSoundSource,
    PlacedWall,
    Point,
    Pole,
} from '@/types/domain';
import type { LocalAction } from '@/types/regionUndoActions';
import type { RegionTransaction } from '@/hooks/useRegionTransaction';
import type { WallTransaction } from '@/hooks/useWallTransaction';
import { isWallClosed } from '@/utils/wallUtils';
import { segmentsToPoles } from '@/utils/wallSegmentUtils';

export interface GameWorldLayerProps {
    // Encounter data
    encounter: Encounter | null;
    encounterId: string | undefined;

    // Placed entities
    placedRegions: PlacedRegion[];
    placedLightSources: PlacedLightSource[];
    placedSoundSources: PlacedSoundSource[];
    placedWalls: PlacedWall[];

    // Selection state
    selectedRegionIndex: number | null;
    selectedLightSourceIndex: number | null;
    selectedSoundSourceIndex: number | null;

    // Editing state
    drawingRegionIndex: number | null;
    drawingWallIndex: number | null;
    drawingWallDefaultHeight: number;
    isEditingVertices: boolean;
    isEditingRegionVertices: boolean;
    editingRegionIndex: number | null;

    // Visibility
    scopeVisibility: {
        regions: boolean;
        lights: boolean;
        sounds: boolean;
        walls: boolean;
    };
    activeScope: InteractionScope;

    // Grid and viewport
    gridConfig: GridConfig;
    viewport: { x: number; y: number; scale: number };

    // Transactions
    wallTransaction: WallTransaction;
    regionTransaction: RegionTransaction;

    // Keyboard state
    isAltPressed: boolean;

    // Callbacks for regions
    onRegionSelect: (regionIndex: number) => void;
    onRegionContextMenu: (region: PlacedRegion, position: { x: number; y: number }) => void;

    // Callbacks for lights
    onLightSourceSelect: (index: number) => void;
    onLightSourceContextMenu: (index: number, position: { left: number; top: number }) => void;
    onLightSourcePositionChange: (index: number, position: Point) => Promise<void>;
    onLightSourceDirectionChange: (index: number, direction: number) => Promise<void>;

    // Callbacks for sounds
    onSoundSourceSelect: (index: number) => void;
    onSoundSourceContextMenu: (index: number, position: { left: number; top: number }) => void;
    onSoundSourcePositionChange: (index: number, position: Point) => Promise<void>;

    // Callbacks for walls
    onWallClick: (wallIndex: number) => void;
    onWallContextMenu: (wall: PlacedWall, segmentIndex: number, position: { x: number; y: number }) => void;
    onWallBreak: (wallIndex: number, poleIndex: number) => Promise<void>;
    onFinishEditing: () => void;
    setPreviewWallPoles: (poles: Pole[] | null) => void;

    // Structure handlers
    handleVerticesChange: (wallIndex: number, newPoles: Pole[], isClosed: boolean) => void;
    handlePoleInserted: (wallIndex: number, insertedAtIndex: number) => void;
    handlePoleDeleted: (wallIndex: number, deletedIndices: number[]) => void;
    handleRegionVerticesChange: (regionIndex: number, newVertices: Point[]) => void;

    // Region handlers
    onFinishEditingRegion: () => void;
    onCancelEditingRegion: () => void;
    onSwitchToRegion: (regionIndex: number) => void;
    onLocalAction: (action: LocalAction) => void;
}

export const GameWorldLayer: React.FC<GameWorldLayerProps> = ({
    encounter,
    encounterId,
    placedRegions,
    placedLightSources,
    placedSoundSources,
    placedWalls,
    selectedRegionIndex,
    selectedLightSourceIndex,
    selectedSoundSourceIndex,
    drawingRegionIndex,
    drawingWallIndex,
    drawingWallDefaultHeight,
    isEditingVertices,
    isEditingRegionVertices,
    editingRegionIndex,
    scopeVisibility,
    activeScope,
    gridConfig,
    viewport,
    wallTransaction,
    regionTransaction,
    isAltPressed,
    onRegionSelect,
    onRegionContextMenu,
    onLightSourceSelect,
    onLightSourceContextMenu,
    onLightSourcePositionChange,
    onLightSourceDirectionChange,
    onSoundSourceSelect,
    onSoundSourceContextMenu,
    onSoundSourcePositionChange,
    onWallClick,
    onWallContextMenu,
    onWallBreak,
    onFinishEditing,
    setPreviewWallPoles,
    handleVerticesChange,
    handlePoleInserted,
    handlePoleDeleted,
    handleRegionVerticesChange,
    onFinishEditingRegion,
    onCancelEditingRegion,
    onSwitchToRegion,
    onLocalAction,
}) => {
    return (
        <Layer name={LayerName.GameWorld} listening={true}>
            {/* Regions - render first (bottom of GameWorld), sorted from min to max so highest renders on top */}
            {scopeVisibility.regions && placedRegions && placedRegions.length > 0 && (
                <Group name={GroupName.Structure}>
                    {sortRegionsForRendering(placedRegions).map((encounterRegion) => {
                        if (encounterRegion.index === -1 && drawingRegionIndex !== null) {
                            return null;
                        }
                        if (encounterRegion.type === 'FogOfWar') {
                            return null;
                        }
                        if (isEditingRegionVertices && editingRegionIndex === encounterRegion.index) {
                            return null;
                        }
                        return (
                            <RegionRenderer
                                key={encounterRegion.id}
                                encounterRegion={encounterRegion}
                                allRegions={placedRegions}
                                activeScope={activeScope}
                                onSelect={onRegionSelect}
                                onContextMenu={onRegionContextMenu}
                                isSelected={selectedRegionIndex === encounterRegion.index}
                            />
                        );
                    })}
                </Group>
            )}

            {encounter && scopeVisibility.lights && placedLightSources.length > 0 && (
                <Group name={GroupName.Structure} globalCompositeOperation="lighten">
                    {placedLightSources.map((lightSource) => (
                        <LightSourceRenderer
                            key={lightSource.id}
                            encounterLightSource={lightSource}
                            walls={encounter.stage.walls || []}
                            gridConfig={gridConfig}
                            activeScope={activeScope}
                            onSelect={onLightSourceSelect}
                            onContextMenu={onLightSourceContextMenu}
                            onPositionChange={onLightSourcePositionChange}
                            onDirectionChange={onLightSourceDirectionChange}
                            isSelected={selectedLightSourceIndex === lightSource.index}
                        />
                    ))}
                </Group>
            )}

            {encounter && scopeVisibility.sounds && placedSoundSources.length > 0 && (
                <Group name={GroupName.Structure}>
                    {placedSoundSources.map((soundSource) => (
                        <SoundSourceRenderer
                            key={soundSource.id}
                            encounterSoundSource={soundSource}
                            gridConfig={gridConfig}
                            activeScope={activeScope}
                            onSelect={onSoundSourceSelect}
                            onContextMenu={onSoundSourceContextMenu}
                            onPositionChange={onSoundSourcePositionChange}
                            isSelected={selectedSoundSourceIndex === soundSource.index}
                        />
                    ))}
                </Group>
            )}

            {/* Walls - render third (top of structures) */}
            {scopeVisibility.walls && encounter && placedWalls && (
                <Group name={GroupName.Structure}>
                    {placedWalls.map((encounterWall) => {
                        const isInTransaction =
                            wallTransaction.transaction.isActive &&
                            wallTransaction
                                .getActiveSegments()
                                .some((s) => s.wallIndex === encounterWall.index || s.tempId === encounterWall.index);
                        const shouldRender = !isInTransaction && !(drawingWallIndex === encounterWall.index);

                        return (
                            <React.Fragment key={encounterWall.id}>
                                {shouldRender && (
                                    <WallRenderer
                                        encounterWall={encounterWall}
                                        onClick={onWallClick}
                                        onContextMenu={onWallContextMenu}
                                        activeScope={activeScope}
                                    />
                                )}
                            </React.Fragment>
                        );
                    })}

                    {isEditingVertices &&
                        wallTransaction.transaction.isActive &&
                        wallTransaction
                            .getActiveSegments()
                            .map((segment) => {
                                const poles = segmentsToPoles({ index: segment.wallIndex || segment.tempId, name: segment.name, segments: segment.segments });
                                const wall = encounter?.stage.walls?.find(w => w.index === (segment.wallIndex || segment.tempId));
                                const isClosed = wall ? isWallClosed(wall as EncounterWall) : false;
                                return (
                                    <WallTransformer
                                        key={`transformer-${segment.tempId}`}
                                        poles={poles}
                                        isClosed={isClosed}
                                        onPolesChange={(newPoles, newIsClosed) =>
                                            handleVerticesChange(segment.wallIndex || segment.tempId, newPoles, newIsClosed)
                                        }
                                        onPolesPreview={setPreviewWallPoles}
                                        gridConfig={gridConfig}
                                        snapEnabled={gridConfig.snap}
                                        onClearSelections={onFinishEditing}
                                        isAltPressed={isAltPressed}
                                        encounterId={encounterId}
                                        wallIndex={segment.wallIndex || segment.tempId}
                                        wall={undefined}
                                        onWallBreak={onWallBreak}
                                        enableBackgroundRect={false}
                                        wallTransaction={wallTransaction}
                                        onPoleInserted={(insertedAtIndex) =>
                                            handlePoleInserted(segment.wallIndex ?? -1, insertedAtIndex)
                                        }
                                        onPoleDeleted={(deletedIndices) =>
                                            handlePoleDeleted(segment.wallIndex ?? -1, deletedIndices)
                                        }
                                        defaultHeight={drawingWallDefaultHeight}
                                    />
                                );
                            })}
                </Group>
            )}

            {/* Region Transformer */}
            {scopeVisibility.regions &&
                encounter?.stage.regions &&
                isEditingRegionVertices &&
                editingRegionIndex !== null &&
                regionTransaction.transaction.isActive &&
                regionTransaction.transaction.segment && (
                    <Group name={GroupName.Structure}>
                        <RegionTransformer
                            encounterId={encounterId || ''}
                            regionIndex={editingRegionIndex}
                            segment={regionTransaction.transaction.segment}
                            allRegions={placedRegions}
                            gridConfig={gridConfig}
                            viewport={viewport}
                            onVerticesChange={(newVertices: Point[]) =>
                                handleRegionVerticesChange(editingRegionIndex, newVertices)
                            }
                            onClearSelections={onFinishEditingRegion}
                            onSwitchToRegion={onSwitchToRegion}
                            onFinish={onFinishEditingRegion}
                            onCancel={onCancelEditingRegion}
                            onLocalAction={onLocalAction}
                        />
                    </Group>
                )}
        </Layer>
    );
};
