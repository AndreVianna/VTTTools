import React from 'react';
import { Layer } from 'react-konva';
import { FogOfWarRenderer } from '@components/encounter';
import type { PlacedRegion } from '@/types/domain';

export interface FogOfWarLayerProps {
    encounterId: string;
    fowRegions: PlacedRegion[];
    visible: boolean;
}

export const FogOfWarLayer: React.FC<FogOfWarLayerProps> = ({
    encounterId,
    fowRegions,
    visible,
}) => {
    if (!visible) {
        return null;
    }

    return (
        <Layer name="fog-of-war" listening={false}>
            <FogOfWarRenderer
                encounterId={encounterId}
                regions={fowRegions}
                visible={true}
            />
        </Layer>
    );
};
