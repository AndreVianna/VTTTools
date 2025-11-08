import { PlacedAsset } from '@/types/domain';

export interface Point {
    x: number;
    y: number;
}

export const calculateAngleFromCenter = (
    center: Point,
    mouse: Point
): number => {
    const deltaX = mouse.x - center.x;
    const deltaY = mouse.y - center.y;

    const radians = Math.atan2(deltaY, deltaX);
    const degrees = radians * (180 / Math.PI);

    return normalizeAngle(degrees);
};

export const getGroupCenter = (assets: PlacedAsset[]): Point => {
    if (assets.length === 0) {
        return { x: 0, y: 0 };
    }

    let minX = Infinity;
    let minY = Infinity;
    let maxX = -Infinity;
    let maxY = -Infinity;

    for (const asset of assets) {
        const left = asset.position.x;
        const right = asset.position.x + asset.size.width;
        const top = asset.position.y;
        const bottom = asset.position.y + asset.size.height;

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

export const rotatePointAroundOrigin = (
    point: Point,
    origin: Point,
    angleDegrees: number
): Point => {
    const angleRadians = angleDegrees * (Math.PI / 180);

    const translatedX = point.x - origin.x;
    const translatedY = point.y - origin.y;

    const rotatedX = translatedX * Math.cos(angleRadians) - translatedY * Math.sin(angleRadians);
    const rotatedY = translatedX * Math.sin(angleRadians) + translatedY * Math.cos(angleRadians);

    return {
        x: rotatedX + origin.x,
        y: rotatedY + origin.y,
    };
};

export const normalizeAngle = (angle: number): number => {
    let normalized = angle % 360;

    if (normalized < 0) {
        normalized += 360;
    }

    return normalized;
};
