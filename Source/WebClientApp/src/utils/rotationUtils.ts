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

    // Math.atan2 with canvas Y-down gives: 0° = right, 90° = down, -90°/270° = up, ±180° = left
    const radians = Math.atan2(deltaY, deltaX);
    const degrees = radians * (180 / Math.PI);

    // Convert to our coordinate system: 0° = up, 90° = right, 180° = down, 270° = left
    // Add 90° to rotate: atan2's -90° (up) becomes our 0° (up)
    return normalizeAngle(degrees + 90);
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

/**
 * Snap angle to nearest multiple of step (default 5 degrees)
 */
export const snapAngle = (angle: number, step: number = 5): number => {
    return Math.round(angle / step) * step;
};

/**
 * Convert angle from 0-360 range to -180 to +180 range (backend format)
 */
export const toBackendRotation = (angle: number): number => {
    // First normalize to 0-360
    const normalized = normalizeAngle(angle);

    // Convert to -180 to +180
    if (normalized > 180) {
        return normalized - 360;
    }

    return normalized;
};
