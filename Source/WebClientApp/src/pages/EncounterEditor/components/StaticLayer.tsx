import React from 'react';
import { Layer } from 'react-konva';
import { BackgroundLayer, GridRenderer } from '@components/encounter';
import { LayerName } from '@services/layerManager';
import { type GridConfig, GridType } from '@utils/gridCalculator';
import { DEFAULT_BACKGROUNDS } from '@/config/defaults';

export interface StaticLayerProps {
    // Background
    backgroundUrl: string | undefined;
    backgroundContentType: string | undefined;
    backgroundColor: string;
    stageWidth: number;
    stageHeight: number;
    onImageLoaded: (dimensions: { width: number; height: number }) => void;

    // Video controls
    isVideoAudioMuted: boolean;
    isVideoPlaying: boolean;

    // Grid
    gridConfig: GridConfig;
}

export const StaticLayer: React.FC<StaticLayerProps> = ({
    backgroundUrl,
    backgroundContentType,
    backgroundColor,
    stageWidth,
    stageHeight,
    onImageLoaded,
    isVideoAudioMuted,
    isVideoPlaying,
    gridConfig,
}) => {
    return (
        <Layer name={LayerName.Static} listening={false}>
            <BackgroundLayer
                imageUrl={backgroundUrl || DEFAULT_BACKGROUNDS.ENCOUNTER}
                backgroundColor={backgroundColor}
                stageWidth={stageWidth}
                stageHeight={stageHeight}
                onImageLoaded={onImageLoaded}
                {...(backgroundContentType && { contentType: backgroundContentType })}
                muted={isVideoAudioMuted}
                playing={isVideoPlaying}
            />

            <GridRenderer
                grid={gridConfig}
                stageWidth={stageWidth}
                stageHeight={stageHeight}
                visible={gridConfig.type !== GridType.NoGrid}
            />
        </Layer>
    );
};
