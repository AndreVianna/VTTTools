import React from 'react';
import { AssetPicker } from '@components/common';
import { SoundPickerDialog } from '@/components/sounds';
import { LightContextMenu, SoundContextMenu, type SoundSourceUpdatePayload } from '@components/encounter';
import type { LightPlacementProperties, SoundPlacementProperties } from '@components/encounter/panels';
import type { EncounterLightSource, PlacedLightSource, PlacedSoundSource } from '@/types/domain';
import type { AssetKind } from '@/types/domain';

export interface SourceContextMenusProps {
    // Light context menu
    lightContextMenuPosition: { left: number; top: number } | null;
    selectedLightSourceIndex: number | null;
    placedLightSources: PlacedLightSource[];
    onLightContextMenuClose: () => void;
    onLightSourceUpdate: (sourceIndex: number, updates: Partial<EncounterLightSource>) => Promise<void>;
    onLightSourceDelete: (index: number) => Promise<void>;

    // Sound context menu
    soundContextMenuPosition: { left: number; top: number } | null;
    selectedSoundSourceIndex: number | null;
    placedSoundSources: PlacedSoundSource[];
    onSoundContextMenuClose: () => void;
    onSoundSourceUpdate: (sourceIndex: number, updates: SoundSourceUpdatePayload) => Promise<void>;
    onSoundSourceDelete: (index: number) => Promise<void>;

    // Asset picker
    assetPickerOpen: { open: boolean; kind?: AssetKind };
    onAssetPickerClose: () => void;
    onAssetSelect: (asset: unknown) => void;

    // Sound picker
    soundPickerOpen: boolean;
    onSoundPickerClose: () => void;
    onSoundSelect: (properties: SoundPlacementProperties) => void;
}

export const SourceContextMenus: React.FC<SourceContextMenusProps> = ({
    lightContextMenuPosition,
    selectedLightSourceIndex,
    placedLightSources,
    onLightContextMenuClose,
    onLightSourceUpdate,
    onLightSourceDelete,
    soundContextMenuPosition,
    selectedSoundSourceIndex,
    placedSoundSources,
    onSoundContextMenuClose,
    onSoundSourceUpdate,
    onSoundSourceDelete,
    assetPickerOpen,
    onAssetPickerClose,
    onAssetSelect,
    soundPickerOpen,
    onSoundPickerClose,
    onSoundSelect,
}) => {
    return (
        <>
            <LightContextMenu
                anchorPosition={lightContextMenuPosition}
                open={lightContextMenuPosition !== null}
                onClose={onLightContextMenuClose}
                lightSource={
                    selectedLightSourceIndex !== null
                        ? placedLightSources.find((s) => s.index === selectedLightSourceIndex) || null
                        : null
                }
                onLightSourceUpdate={onLightSourceUpdate}
                onLightSourceDelete={onLightSourceDelete}
            />

            <SoundContextMenu
                anchorPosition={soundContextMenuPosition}
                open={soundContextMenuPosition !== null}
                onClose={onSoundContextMenuClose}
                encounterSoundSource={
                    selectedSoundSourceIndex !== null
                        ? placedSoundSources.find((s) => s.index === selectedSoundSourceIndex) || null
                        : null
                }
                onSoundSourceUpdate={onSoundSourceUpdate}
                onSoundSourceDelete={onSoundSourceDelete}
            />

            {assetPickerOpen.kind && (
                <AssetPicker
                    open={assetPickerOpen.open}
                    onClose={onAssetPickerClose}
                    onSelect={onAssetSelect}
                    kind={assetPickerOpen.kind}
                />
            )}

            <SoundPickerDialog
                open={soundPickerOpen}
                onClose={onSoundPickerClose}
                onSelect={(resourceId) => {
                    onSoundPickerClose();
                    onSoundSelect({ resourceId, isPlaying: false });
                }}
            />
        </>
    );
};
