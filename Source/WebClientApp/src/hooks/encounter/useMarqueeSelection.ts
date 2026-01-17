import { useCallback, useState } from 'react';
import type { Rect } from '@/utils/geometry';
import { getMarqueeRect, isPointInRect } from '@/utils/geometry';

export interface Point {
    x: number;
    y: number;
}

export interface MarqueeSelectionState {
    marqueeStart: Point | null;
    marqueeEnd: Point | null;
    marqueeRect: Rect | null;
    isMarqueeActive: boolean;
}

export interface MarqueeSelectionActions {
    startMarquee: (point: Point) => void;
    updateMarquee: (point: Point) => void;
    endMarquee: () => void;
    cancelMarquee: () => void;
    getItemsInMarquee: <T extends { x: number; y: number }>(items: T[]) => T[];
    getIndicesInMarquee: <T extends { x: number; y: number }>(items: T[]) => Set<number>;
    isSimpleClick: () => boolean;
}

export type UseMarqueeSelectionReturn = MarqueeSelectionState & MarqueeSelectionActions;

const CLICK_THRESHOLD = 5;

/**
 * A generic hook for handling marquee (rectangular) selection.
 *
 * Can be used to select items in any list where items have x,y coordinates.
 * Works with walls, regions, assets, or any other positioned entities.
 *
 * @example
 * ```tsx
 * const { marqueeRect, startMarquee, updateMarquee, endMarquee, getIndicesInMarquee } = useMarqueeSelection();
 *
 * // On mouse down
 * startMarquee({ x: e.clientX, y: e.clientY });
 *
 * // On mouse move
 * updateMarquee({ x: e.clientX, y: e.clientY });
 *
 * // On mouse up
 * const selectedIndices = getIndicesInMarquee(items);
 * endMarquee();
 * ```
 */
export function useMarqueeSelection(): UseMarqueeSelectionReturn {
    const [marqueeStart, setMarqueeStart] = useState<Point | null>(null);
    const [marqueeEnd, setMarqueeEnd] = useState<Point | null>(null);

    const marqueeRect = marqueeStart && marqueeEnd
        ? getMarqueeRect(marqueeStart, marqueeEnd)
        : null;

    const isMarqueeActive = marqueeStart !== null;

    const startMarquee = useCallback((point: Point) => {
        setMarqueeStart(point);
        setMarqueeEnd(point);
    }, []);

    const updateMarquee = useCallback((point: Point) => {
        if (marqueeStart) {
            setMarqueeEnd(point);
        }
    }, [marqueeStart]);

    const endMarquee = useCallback(() => {
        setMarqueeStart(null);
        setMarqueeEnd(null);
    }, []);

    const cancelMarquee = useCallback(() => {
        setMarqueeStart(null);
        setMarqueeEnd(null);
    }, []);

    const isSimpleClick = useCallback(() => {
        if (!marqueeRect) return true;
        return marqueeRect.width < CLICK_THRESHOLD && marqueeRect.height < CLICK_THRESHOLD;
    }, [marqueeRect]);

    const getItemsInMarquee = useCallback(<T extends { x: number; y: number }>(items: T[]): T[] => {
        if (!marqueeRect) return [];
        return items.filter(item => isPointInRect(item, marqueeRect));
    }, [marqueeRect]);

    const getIndicesInMarquee = useCallback(<T extends { x: number; y: number }>(items: T[]): Set<number> => {
        if (!marqueeRect) return new Set();
        const indices = new Set<number>();
        items.forEach((item, index) => {
            if (isPointInRect(item, marqueeRect)) {
                indices.add(index);
            }
        });
        return indices;
    }, [marqueeRect]);

    return {
        // State
        marqueeStart,
        marqueeEnd,
        marqueeRect,
        isMarqueeActive,
        // Actions
        startMarquee,
        updateMarquee,
        endMarquee,
        cancelMarquee,
        getItemsInMarquee,
        getIndicesInMarquee,
        isSimpleClick,
    };
}
