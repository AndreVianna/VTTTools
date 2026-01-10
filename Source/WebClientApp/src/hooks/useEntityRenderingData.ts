import { useMemo } from 'react';
import type { Theme } from '@mui/material/styles';
import { AssetKind, LabelVisibility as DisplayNameEnum, LabelPosition as LabelPositionEnum, type PlacedAsset } from '@/types/domain';
import { getEffectiveLabelPosition, getEffectiveLabelVisibility } from '@/utils/displayHelpers';
import type { GridConfig } from '@/utils/gridCalculator';
import { getPlacementBehavior } from '@/types/placement';
import { formatMonsterLabel, getAssetSize } from '@/components/encounter/tokenPlacementUtils';

const MAX_LABEL_WIDTH_COLLAPSED = 75;

export interface AssetRenderData {
    size: { width: number; height: number };
    pixelWidth: number;
    pixelHeight: number;
    formattedLabel: {
        displayText: string;
        fullText: string;
        isTruncated: boolean;
        displayWidth: number;
        fullWidth: number;
        displayHeight: number;
    } | null;
}

export interface RenderingDataResult {
    labelColors: {
        background: string;
        border: string;
        text: string;
    };
    labelVisibilityMap: Map<string, DisplayNameEnum>;
    labelPositionMap: Map<string, LabelPositionEnum>;
    assetRenderData: Map<string, AssetRenderData>;
    collisionData: Array<{
        x: number;
        y: number;
        width: number;
        height: number;
        allowOverlap: boolean;
    }>;
}

export const useEntityRenderingData = (
    placedAssets: PlacedAsset[],
    gridConfig: GridConfig,
    theme: Theme
): RenderingDataResult => {
    const labelColors = useMemo(
        () => ({
            background: theme.palette.background.paper,
            border: theme.palette.divider,
            text: theme.palette.text.primary,
        }),
        [theme.palette.background.paper, theme.palette.divider, theme.palette.text.primary]
    );

    const labelVisibilityMap = useMemo(() => {
        return new Map(
            placedAssets.map((asset) => [
                asset.id,
                getEffectiveLabelVisibility(asset),
            ])
        );
    }, [placedAssets]);

    const labelPositionMap = useMemo(() => {
        return new Map(
            placedAssets.map((asset) => [
                asset.id,
                getEffectiveLabelPosition(asset),
            ])
        );
    }, [placedAssets]);

    const assetRenderData = useMemo(() => {
        return new Map(
            placedAssets.map((asset) => {
                const size = getAssetSize(asset.asset);
                const pixelWidth = size.width * gridConfig.cellSize.width;
                const pixelHeight = size.height * gridConfig.cellSize.height;

                let formattedLabel = null;
                if (
                    asset.asset.classification.kind === AssetKind.Creature ||
                    asset.asset.classification.kind === AssetKind.Character
                ) {
                    formattedLabel = formatMonsterLabel(asset.name, MAX_LABEL_WIDTH_COLLAPSED);
                }

                return [
                    asset.id,
                    {
                        size,
                        pixelWidth,
                        pixelHeight,
                        formattedLabel,
                    },
                ];
            })
        );
    }, [placedAssets, gridConfig.cellSize]);

    const collisionData = useMemo(() => {
        return placedAssets
            .filter((a) => {
                return (
                    a.position &&
                    typeof a.position.x === 'number' &&
                    typeof a.position.y === 'number' &&
                    a.size &&
                    typeof a.size.width === 'number' &&
                    typeof a.size.height === 'number' &&
                    a.size.width > 0 &&
                    a.size.height > 0 &&
                    Number.isFinite(a.position.x) &&
                    Number.isFinite(a.position.y) &&
                    Number.isFinite(a.size.width) &&
                    Number.isFinite(a.size.height)
                );
            })
            .map((a) => {
                // Only provide objectData/monsterData if tokenSize is valid
                const tokenSize = a.asset.size;
                const hasValidTokenSize = tokenSize && typeof tokenSize.width === 'number' && typeof tokenSize.height === 'number';

                const objectData =
                    a.asset.classification.kind === AssetKind.Object && hasValidTokenSize
                        ? {
                            size: tokenSize,
                            isMovable: true,
                            isOpaque: false,
                        }
                        : undefined;
                const monsterData =
                    a.asset.classification.kind === AssetKind.Creature && hasValidTokenSize
                        ? {
                            size: tokenSize,
                        }
                        : undefined;

                return {
                    x: a.position.x,
                    y: a.position.y,
                    width: a.size.width,
                    height: a.size.height,
                    allowOverlap: getPlacementBehavior(a.asset.classification.kind, objectData, monsterData).allowOverlap,
                };
            });
    }, [placedAssets]);

    return {
        labelColors,
        labelVisibilityMap,
        labelPositionMap,
        assetRenderData,
        collisionData,
    };
};
