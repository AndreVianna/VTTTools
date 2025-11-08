import { useTheme } from '@mui/material/styles';
import Konva from 'konva';
import React, { useState } from 'react';
import { Circle, Group, Line } from 'react-konva';

import type { PlacedAsset } from '@/types/domain';
import type { GridConfig } from '@/utils/gridCalculator';
import { calculateAngleFromCenter, rotatePointAroundOrigin, type Point } from '@/utils/rotationUtils';

interface RotationHandleProps {
    selectedAssets: PlacedAsset[];
    gridConfig: GridConfig;
    scale: number;
    altKeyPressed: boolean;
    onRotationChange?: ((updates: Array<{
        assetId: string;
        rotation: number;
        position?: { x: number; y: number };
    }>) => void) | undefined;
    onRotationStart?: (() => void) | undefined;
    onRotationEnd?: (() => void) | undefined;
}

const getGroupCenterInPixels = (assets: PlacedAsset[], cellSize: number): Point => {
    if (assets.length === 0) {
        return { x: 0, y: 0 };
    }

    let minX = Infinity;
    let minY = Infinity;
    let maxX = -Infinity;
    let maxY = -Infinity;

    for (const asset of assets) {
        const left = asset.position.x;
        const right = asset.position.x + (asset.size.width * cellSize);
        const top = asset.position.y;
        const bottom = asset.position.y + (asset.size.height * cellSize);

        minX = Math.min(minX, left);
        maxX = Math.max(maxX, right);
        minY = Math.min(minY, top);
        maxY = Math.max(maxY, bottom);
    }

    return {
        x: (minX + maxX) / 2,
        y: (minY + maxY) / 2,
    };
};

export const RotationHandle: React.FC<RotationHandleProps> = ({
    selectedAssets,
    gridConfig,
    scale,
    altKeyPressed,
    onRotationChange,
    onRotationStart,
    onRotationEnd
}) => {
    const theme = useTheme();
    const [isDragging, setIsDragging] = useState(false);
    const [startPositions, setStartPositions] = useState<Map<string, { x: number; y: number }>>(new Map());
    const [startRotations, setStartRotations] = useState<Map<string, number>>(new Map());

    if (selectedAssets.length === 0) {
        return null;
    }

    const firstAsset = selectedAssets[0]!;
    const cellSize = Math.max(gridConfig.cellSize.width, gridConfig.cellSize.height);

    const center = selectedAssets.length === 1
        ? {
            x: firstAsset.position.x + (firstAsset.size.width * cellSize) / 2,
            y: firstAsset.position.y + (firstAsset.size.height * cellSize) / 2
          }
        : getGroupCenterInPixels(selectedAssets, cellSize);

    const centerX = center.x;
    const centerY = center.y;

    const longestDimension = selectedAssets.reduce((max, asset) => {
        const width = asset.size.width * cellSize;
        const height = asset.size.height * cellSize;
        return Math.max(max, width, height);
    }, 0);
    const handleLength = longestDimension * 0.75;

    const rotation = firstAsset.rotation;

    const angleRadians = (rotation * Math.PI) / 180;
    const lineEndX = Math.cos(angleRadians) * handleLength;
    const lineEndY = Math.sin(angleRadians) * handleLength;

    const strokeWidth = 2 / scale;
    const circleRadius = Math.max(6, Math.min(12, 8 / scale));

    const lineColor = theme.palette.primary.main;

    const handleDragStart = (e: Konva.KonvaEventObject<DragEvent>) => {
        e.cancelBubble = true;
        setIsDragging(true);

        const positions = new Map<string, { x: number; y: number }>();
        const rotations = new Map<string, number>();
        selectedAssets.forEach(asset => {
            positions.set(asset.id, { x: asset.position.x, y: asset.position.y });
            rotations.set(asset.id, asset.rotation);
        });
        setStartPositions(positions);
        setStartRotations(rotations);

        onRotationStart?.();
    };

    const handleDragMove = (e: Konva.KonvaEventObject<DragEvent>) => {
        const stage = e.target.getStage();
        if (!stage) return;

        const pointerPosition = stage.getPointerPosition();
        if (!pointerPosition) return;

        if (!altKeyPressed) {
            const updates = selectedAssets.map(asset => {
                const assetCenter = {
                    x: asset.position.x + (asset.size.width * cellSize) / 2,
                    y: asset.position.y + (asset.size.height * cellSize) / 2
                };
                const newRotation = calculateAngleFromCenter(assetCenter, pointerPosition);
                return { assetId: asset.id, rotation: newRotation };
            });
            onRotationChange?.(updates);
        } else {
            const groupCenter = getGroupCenterInPixels(selectedAssets, cellSize);

            const newRotation = calculateAngleFromCenter(groupCenter, pointerPosition);

            const firstAssetStartRotation = startRotations.get(selectedAssets[0]!.id) || 0;
            const rotationDelta = newRotation - firstAssetStartRotation;

            const updates = selectedAssets.map(asset => {
                const startPos = startPositions.get(asset.id)!;
                const startRot = startRotations.get(asset.id)!;

                const assetCenterX = startPos.x + (asset.size.width * cellSize) / 2;
                const assetCenterY = startPos.y + (asset.size.height * cellSize) / 2;

                const rotatedCenter = rotatePointAroundOrigin(
                    { x: assetCenterX, y: assetCenterY },
                    groupCenter,
                    rotationDelta
                );

                const newX = rotatedCenter.x - (asset.size.width * cellSize) / 2;
                const newY = rotatedCenter.y - (asset.size.height * cellSize) / 2;

                return {
                    assetId: asset.id,
                    rotation: startRot + rotationDelta,
                    position: { x: newX, y: newY }
                };
            });

            onRotationChange?.(updates);
        }
    };

    const handleDragEnd = () => {
        setIsDragging(false);
        onRotationEnd?.();
    };

    return (
        <Group x={centerX} y={centerY}>
            <Line
                points={[0, 0, lineEndX, lineEndY]}
                stroke={lineColor}
                strokeWidth={strokeWidth}
                opacity={0.6}
                listening={false}
            />
            <Circle
                x={lineEndX}
                y={lineEndY}
                radius={circleRadius}
                fill="white"
                stroke={lineColor}
                strokeWidth={2}
                draggable={true}
                cursor={isDragging ? 'grabbing' : 'grab'}
                hitStrokeWidth={20}
                onDragStart={handleDragStart}
                onDragMove={handleDragMove}
                onDragEnd={handleDragEnd}
            />
        </Group>
    );
};
