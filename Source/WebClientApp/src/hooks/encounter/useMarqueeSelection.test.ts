import { act, renderHook } from '@testing-library/react';
import { describe, expect, it } from 'vitest';
import { useMarqueeSelection } from './useMarqueeSelection';

describe('useMarqueeSelection', () => {
    it('should start with no marquee active', () => {
        const { result } = renderHook(() => useMarqueeSelection());

        expect(result.current.marqueeStart).toBeNull();
        expect(result.current.marqueeEnd).toBeNull();
        expect(result.current.marqueeRect).toBeNull();
        expect(result.current.isMarqueeActive).toBe(false);
    });

    it('should start marquee selection', () => {
        const { result } = renderHook(() => useMarqueeSelection());

        act(() => {
            result.current.startMarquee({ x: 10, y: 20 });
        });

        expect(result.current.marqueeStart).toEqual({ x: 10, y: 20 });
        expect(result.current.marqueeEnd).toEqual({ x: 10, y: 20 });
        expect(result.current.isMarqueeActive).toBe(true);
    });

    it('should update marquee during drag', () => {
        const { result } = renderHook(() => useMarqueeSelection());

        act(() => {
            result.current.startMarquee({ x: 0, y: 0 });
        });

        act(() => {
            result.current.updateMarquee({ x: 100, y: 50 });
        });

        expect(result.current.marqueeRect).toEqual({
            x: 0,
            y: 0,
            width: 100,
            height: 50,
        });
    });

    it('should handle inverted marquee (drag up-left)', () => {
        const { result } = renderHook(() => useMarqueeSelection());

        act(() => {
            result.current.startMarquee({ x: 100, y: 100 });
        });

        act(() => {
            result.current.updateMarquee({ x: 50, y: 25 });
        });

        expect(result.current.marqueeRect).toEqual({
            x: 50,
            y: 25,
            width: 50,
            height: 75,
        });
    });

    it('should end marquee selection', () => {
        const { result } = renderHook(() => useMarqueeSelection());

        act(() => {
            result.current.startMarquee({ x: 0, y: 0 });
            result.current.updateMarquee({ x: 100, y: 100 });
        });

        act(() => {
            result.current.endMarquee();
        });

        expect(result.current.marqueeStart).toBeNull();
        expect(result.current.marqueeEnd).toBeNull();
        expect(result.current.isMarqueeActive).toBe(false);
    });

    it('should detect simple click vs drag', () => {
        const { result } = renderHook(() => useMarqueeSelection());

        // Small movement - should be a click
        act(() => {
            result.current.startMarquee({ x: 0, y: 0 });
            result.current.updateMarquee({ x: 2, y: 2 });
        });

        expect(result.current.isSimpleClick()).toBe(true);

        // Large movement - should be a drag
        act(() => {
            result.current.updateMarquee({ x: 100, y: 100 });
        });

        expect(result.current.isSimpleClick()).toBe(false);
    });

    it('should get indices of items inside marquee', () => {
        const { result } = renderHook(() => useMarqueeSelection());

        const items = [
            { x: 5, y: 5 },     // inside
            { x: 50, y: 50 },   // inside
            { x: 150, y: 150 }, // outside
            { x: 25, y: 75 },   // inside
        ];

        act(() => {
            result.current.startMarquee({ x: 0, y: 0 });
            result.current.updateMarquee({ x: 100, y: 100 });
        });

        const selectedIndices = result.current.getIndicesInMarquee(items);

        expect(selectedIndices.has(0)).toBe(true);
        expect(selectedIndices.has(1)).toBe(true);
        expect(selectedIndices.has(2)).toBe(false);
        expect(selectedIndices.has(3)).toBe(true);
        expect(selectedIndices.size).toBe(3);
    });

    it('should get items inside marquee', () => {
        const { result } = renderHook(() => useMarqueeSelection());

        const items = [
            { id: 'a', x: 5, y: 5 },
            { id: 'b', x: 150, y: 150 },
            { id: 'c', x: 25, y: 25 },
        ];

        act(() => {
            result.current.startMarquee({ x: 0, y: 0 });
            result.current.updateMarquee({ x: 50, y: 50 });
        });

        const selectedItems = result.current.getItemsInMarquee(items);

        expect(selectedItems).toHaveLength(2);
        expect(selectedItems.find(i => i.id === 'a')).toBeDefined();
        expect(selectedItems.find(i => i.id === 'b')).toBeUndefined();
        expect(selectedItems.find(i => i.id === 'c')).toBeDefined();
    });

    it('should not update marquee when not active', () => {
        const { result } = renderHook(() => useMarqueeSelection());

        act(() => {
            result.current.updateMarquee({ x: 100, y: 100 });
        });

        expect(result.current.marqueeEnd).toBeNull();
        expect(result.current.isMarqueeActive).toBe(false);
    });

    it('should return empty set when marquee not active', () => {
        const { result } = renderHook(() => useMarqueeSelection());

        const items = [{ x: 5, y: 5 }];
        const indices = result.current.getIndicesInMarquee(items);

        expect(indices.size).toBe(0);
    });
});
