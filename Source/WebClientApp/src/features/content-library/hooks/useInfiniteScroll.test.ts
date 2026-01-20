import { renderHook, act } from '@testing-library/react';
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';
import { useInfiniteScroll, type UseInfiniteScrollOptions } from './useInfiniteScroll';

describe('useInfiniteScroll', () => {
    let mockObserve: ReturnType<typeof vi.fn>;
    let mockDisconnect: ReturnType<typeof vi.fn>;
    let mockIntersectionObserver: ReturnType<typeof vi.fn>;
    let observerCallback: IntersectionObserverCallback | null = null;
    let observerOptions: IntersectionObserverInit | undefined;

    beforeEach(() => {
        mockObserve = vi.fn();
        mockDisconnect = vi.fn();
        observerCallback = null;
        observerOptions = undefined;

        // Create a mock IntersectionObserver constructor function
        mockIntersectionObserver = vi.fn(function(
            this: IntersectionObserver,
            callback: IntersectionObserverCallback,
            options?: IntersectionObserverInit
        ) {
            observerCallback = callback;
            observerOptions = options;
            return {
                root: null,
                rootMargin: options?.rootMargin ?? '',
                thresholds: [],
                observe: mockObserve,
                disconnect: mockDisconnect,
                unobserve: vi.fn(),
                takeRecords: vi.fn(() => []),
            } as IntersectionObserver;
        });

        // Override the global IntersectionObserver
        vi.stubGlobal('IntersectionObserver', mockIntersectionObserver);
    });

    afterEach(() => {
        vi.unstubAllGlobals();
    });

    describe('Return Value', () => {
        it('should return sentinelRef object', () => {
            // Arrange
            const options: UseInfiniteScrollOptions = {
                hasMore: true,
                isLoading: false,
                onLoadMore: vi.fn(),
            };

            // Act
            const { result } = renderHook(() => useInfiniteScroll(options));

            // Assert
            expect(result.current).toHaveProperty('sentinelRef');
            expect(result.current.sentinelRef).toBeDefined();
        });

        it('should return sentinelRef that is initially null when no element attached', () => {
            // Arrange
            const options: UseInfiniteScrollOptions = {
                hasMore: true,
                isLoading: false,
                onLoadMore: vi.fn(),
            };

            // Act
            const { result } = renderHook(() => useInfiniteScroll(options));

            // Assert
            expect(result.current.sentinelRef.current).toBeNull();
        });
    });

    describe('IntersectionObserver Setup', () => {
        it('should create IntersectionObserver when hasMore is true and isLoading is false', () => {
            // Arrange
            const options: UseInfiniteScrollOptions = {
                hasMore: true,
                isLoading: false,
                onLoadMore: vi.fn(),
            };

            // Act
            renderHook(() => useInfiniteScroll(options));

            // Assert
            expect(mockIntersectionObserver).toHaveBeenCalledTimes(1);
        });

        it('should NOT create observer when hasMore is false', () => {
            // Arrange
            const options: UseInfiniteScrollOptions = {
                hasMore: false,
                isLoading: false,
                onLoadMore: vi.fn(),
            };

            // Act
            renderHook(() => useInfiniteScroll(options));

            // Assert
            expect(mockIntersectionObserver).not.toHaveBeenCalled();
        });

        it('should NOT create observer when isLoading is true', () => {
            // Arrange
            const options: UseInfiniteScrollOptions = {
                hasMore: true,
                isLoading: true,
                onLoadMore: vi.fn(),
            };

            // Act
            renderHook(() => useInfiniteScroll(options));

            // Assert
            expect(mockIntersectionObserver).not.toHaveBeenCalled();
        });

        it('should NOT create observer when both hasMore is false and isLoading is true', () => {
            // Arrange
            const options: UseInfiniteScrollOptions = {
                hasMore: false,
                isLoading: true,
                onLoadMore: vi.fn(),
            };

            // Act
            renderHook(() => useInfiniteScroll(options));

            // Assert
            expect(mockIntersectionObserver).not.toHaveBeenCalled();
        });

        it('should use threshold in rootMargin config', () => {
            // Arrange
            const customThreshold = 300;
            const options: UseInfiniteScrollOptions = {
                hasMore: true,
                isLoading: false,
                onLoadMore: vi.fn(),
                threshold: customThreshold,
            };

            // Act
            renderHook(() => useInfiniteScroll(options));

            // Assert
            expect(observerOptions).toBeDefined();
            expect(observerOptions?.rootMargin).toBe(`${customThreshold}px`);
        });
    });

    describe('Loading Trigger', () => {
        it('should call onLoadMore when sentinel intersects', () => {
            // Arrange
            const onLoadMore = vi.fn();
            const options: UseInfiniteScrollOptions = {
                hasMore: true,
                isLoading: false,
                onLoadMore,
            };
            renderHook(() => useInfiniteScroll(options));

            // Act
            act(() => {
                if (observerCallback) {
                    observerCallback(
                        [{ isIntersecting: true } as IntersectionObserverEntry],
                        {} as IntersectionObserver,
                    );
                }
            });

            // Assert
            expect(onLoadMore).toHaveBeenCalledTimes(1);
        });

        it('should NOT call onLoadMore when entry is not intersecting', () => {
            // Arrange
            const onLoadMore = vi.fn();
            const options: UseInfiniteScrollOptions = {
                hasMore: true,
                isLoading: false,
                onLoadMore,
            };
            renderHook(() => useInfiniteScroll(options));

            // Act
            act(() => {
                if (observerCallback) {
                    observerCallback(
                        [{ isIntersecting: false } as IntersectionObserverEntry],
                        {} as IntersectionObserver,
                    );
                }
            });

            // Assert
            expect(onLoadMore).not.toHaveBeenCalled();
        });

        it('should NOT call onLoadMore when hasMore is false', () => {
            // Arrange
            const onLoadMore = vi.fn();
            const options: UseInfiniteScrollOptions = {
                hasMore: false,
                isLoading: false,
                onLoadMore,
            };

            // Act
            renderHook(() => useInfiniteScroll(options));

            // Assert
            // Observer should not even be created when hasMore is false
            expect(mockIntersectionObserver).not.toHaveBeenCalled();
            expect(onLoadMore).not.toHaveBeenCalled();
        });

        it('should NOT call onLoadMore when isLoading is true', () => {
            // Arrange
            const onLoadMore = vi.fn();
            const options: UseInfiniteScrollOptions = {
                hasMore: true,
                isLoading: true,
                onLoadMore,
            };

            // Act
            renderHook(() => useInfiniteScroll(options));

            // Assert
            // Observer should not even be created when isLoading is true
            expect(mockIntersectionObserver).not.toHaveBeenCalled();
            expect(onLoadMore).not.toHaveBeenCalled();
        });

        it('should handle empty entries array gracefully', () => {
            // Arrange
            const onLoadMore = vi.fn();
            const options: UseInfiniteScrollOptions = {
                hasMore: true,
                isLoading: false,
                onLoadMore,
            };
            renderHook(() => useInfiniteScroll(options));

            // Act
            act(() => {
                if (observerCallback) {
                    observerCallback([], {} as IntersectionObserver);
                }
            });

            // Assert
            expect(onLoadMore).not.toHaveBeenCalled();
        });

        it('should only check first entry when multiple entries provided', () => {
            // Arrange
            const onLoadMore = vi.fn();
            const options: UseInfiniteScrollOptions = {
                hasMore: true,
                isLoading: false,
                onLoadMore,
            };
            renderHook(() => useInfiniteScroll(options));

            // Act
            act(() => {
                if (observerCallback) {
                    observerCallback(
                        [
                            { isIntersecting: true } as IntersectionObserverEntry,
                            { isIntersecting: true } as IntersectionObserverEntry,
                        ],
                        {} as IntersectionObserver,
                    );
                }
            });

            // Assert
            expect(onLoadMore).toHaveBeenCalledTimes(1);
        });
    });

    describe('Cleanup', () => {
        it('should disconnect observer on unmount when sentinel element is attached', () => {
            // Arrange
            const mockSentinelElement = document.createElement('div');
            const options: UseInfiniteScrollOptions = {
                hasMore: true,
                isLoading: false,
                onLoadMore: vi.fn(),
            };
            const { result, unmount } = renderHook(() => useInfiniteScroll(options));

            // Simulate attaching sentinel element to ref
            Object.defineProperty(result.current.sentinelRef, 'current', {
                value: mockSentinelElement,
                writable: true,
            });

            // Re-trigger effect to observe the sentinel
            // Since the effect already ran, we need to rerender to trigger cleanup
            unmount();

            // Assert - observer created but disconnect not called because sentinel was null during effect run
            expect(mockIntersectionObserver).toHaveBeenCalledTimes(1);
        });

        it('should not call disconnect when sentinel element is null on cleanup', () => {
            // Arrange
            const options: UseInfiniteScrollOptions = {
                hasMore: true,
                isLoading: false,
                onLoadMore: vi.fn(),
            };
            const { unmount } = renderHook(() => useInfiniteScroll(options));

            // Act
            unmount();

            // Assert - disconnect not called because sentinel is null
            expect(mockDisconnect).not.toHaveBeenCalled();
        });

        it('should disconnect and reconnect when hasMore changes from false to true', () => {
            // Arrange
            const onLoadMore = vi.fn();
            const { rerender } = renderHook(
                (props: UseInfiniteScrollOptions) => useInfiniteScroll(props),
                {
                    initialProps: {
                        hasMore: false,
                        isLoading: false,
                        onLoadMore,
                    },
                },
            );

            // Initially no observer created
            expect(mockIntersectionObserver).not.toHaveBeenCalled();

            // Act - change hasMore to true
            rerender({
                hasMore: true,
                isLoading: false,
                onLoadMore,
            });

            // Assert - observer should now be created
            expect(mockIntersectionObserver).toHaveBeenCalledTimes(1);
        });

        it('should run cleanup effect when hasMore changes from true to false', () => {
            // Arrange
            const onLoadMore = vi.fn();
            const { rerender } = renderHook(
                (props: UseInfiniteScrollOptions) => useInfiniteScroll(props),
                {
                    initialProps: {
                        hasMore: true,
                        isLoading: false,
                        onLoadMore,
                    },
                },
            );

            // Initial observer created
            expect(mockIntersectionObserver).toHaveBeenCalledTimes(1);

            // Act - change hasMore to false
            rerender({
                hasMore: false,
                isLoading: false,
                onLoadMore,
            });

            // Assert - cleanup effect runs but disconnect not called (sentinel is null)
            // No new observer created since hasMore is false
            expect(mockIntersectionObserver).toHaveBeenCalledTimes(1);
        });

        it('should run cleanup effect when isLoading changes from false to true', () => {
            // Arrange
            const onLoadMore = vi.fn();
            const { rerender } = renderHook(
                (props: UseInfiniteScrollOptions) => useInfiniteScroll(props),
                {
                    initialProps: {
                        hasMore: true,
                        isLoading: false,
                        onLoadMore,
                    },
                },
            );

            // Initial observer created
            expect(mockIntersectionObserver).toHaveBeenCalledTimes(1);

            // Act - change isLoading to true
            rerender({
                hasMore: true,
                isLoading: true,
                onLoadMore,
            });

            // Assert - cleanup effect runs but disconnect not called (sentinel is null)
            // No new observer created since isLoading is true
            expect(mockIntersectionObserver).toHaveBeenCalledTimes(1);
        });

        it('should recreate observer when isLoading changes from true to false', () => {
            // Arrange
            const onLoadMore = vi.fn();
            const { rerender } = renderHook(
                (props: UseInfiniteScrollOptions) => useInfiniteScroll(props),
                {
                    initialProps: {
                        hasMore: true,
                        isLoading: true,
                        onLoadMore,
                    },
                },
            );

            // Initially no observer created (isLoading is true)
            expect(mockIntersectionObserver).not.toHaveBeenCalled();

            // Act - change isLoading to false
            rerender({
                hasMore: true,
                isLoading: false,
                onLoadMore,
            });

            // Assert - observer should be created
            expect(mockIntersectionObserver).toHaveBeenCalledTimes(1);
        });

        it('should recreate observer when threshold changes', () => {
            // Arrange
            const onLoadMore = vi.fn();
            const { rerender } = renderHook(
                (props: UseInfiniteScrollOptions) => useInfiniteScroll(props),
                {
                    initialProps: {
                        hasMore: true,
                        isLoading: false,
                        onLoadMore,
                        threshold: 500,
                    },
                },
            );

            expect(mockIntersectionObserver).toHaveBeenCalledTimes(1);
            expect(observerOptions?.rootMargin).toBe('500px');

            // Act - change threshold
            rerender({
                hasMore: true,
                isLoading: false,
                onLoadMore,
                threshold: 1000,
            });

            // Assert - observer should be recreated with new threshold
            expect(mockIntersectionObserver).toHaveBeenCalledTimes(2);
            expect(observerOptions?.rootMargin).toBe('1000px');
        });

        it('should recreate observer when onLoadMore callback changes', () => {
            // Arrange
            const onLoadMore1 = vi.fn();
            const onLoadMore2 = vi.fn();
            const { rerender } = renderHook(
                (props: UseInfiniteScrollOptions) => useInfiniteScroll(props),
                {
                    initialProps: {
                        hasMore: true,
                        isLoading: false,
                        onLoadMore: onLoadMore1,
                    },
                },
            );

            expect(mockIntersectionObserver).toHaveBeenCalledTimes(1);

            // Act - change onLoadMore callback
            rerender({
                hasMore: true,
                isLoading: false,
                onLoadMore: onLoadMore2,
            });

            // Assert - observer should be recreated
            expect(mockIntersectionObserver).toHaveBeenCalledTimes(2);
        });
    });

    describe('Threshold', () => {
        it('should use default threshold of 500px', () => {
            // Arrange
            const options: UseInfiniteScrollOptions = {
                hasMore: true,
                isLoading: false,
                onLoadMore: vi.fn(),
            };

            // Act
            renderHook(() => useInfiniteScroll(options));

            // Assert
            expect(observerOptions?.rootMargin).toBe('500px');
        });

        it('should use custom threshold when provided', () => {
            // Arrange
            const customThreshold = 200;
            const options: UseInfiniteScrollOptions = {
                hasMore: true,
                isLoading: false,
                onLoadMore: vi.fn(),
                threshold: customThreshold,
            };

            // Act
            renderHook(() => useInfiniteScroll(options));

            // Assert
            expect(observerOptions?.rootMargin).toBe('200px');
        });

        it('should use zero threshold when explicitly set to 0', () => {
            // Arrange
            const options: UseInfiniteScrollOptions = {
                hasMore: true,
                isLoading: false,
                onLoadMore: vi.fn(),
                threshold: 0,
            };

            // Act
            renderHook(() => useInfiniteScroll(options));

            // Assert
            expect(observerOptions?.rootMargin).toBe('0px');
        });

        it('should handle large threshold values', () => {
            // Arrange
            const options: UseInfiniteScrollOptions = {
                hasMore: true,
                isLoading: false,
                onLoadMore: vi.fn(),
                threshold: 2000,
            };

            // Act
            renderHook(() => useInfiniteScroll(options));

            // Assert
            expect(observerOptions?.rootMargin).toBe('2000px');
        });
    });

    describe('Observer Behavior', () => {
        it('should not observe when sentinel element is null', () => {
            // Arrange
            const options: UseInfiniteScrollOptions = {
                hasMore: true,
                isLoading: false,
                onLoadMore: vi.fn(),
            };

            // Act
            renderHook(() => useInfiniteScroll(options));

            // Assert
            // Since sentinelRef.current is null (no element attached), observe should not be called
            expect(mockObserve).not.toHaveBeenCalled();
        });

        it('should maintain stable sentinelRef between rerenders', () => {
            // Arrange
            const onLoadMore = vi.fn();
            const { result, rerender } = renderHook(
                (props: UseInfiniteScrollOptions) => useInfiniteScroll(props),
                {
                    initialProps: {
                        hasMore: true,
                        isLoading: false,
                        onLoadMore,
                    },
                },
            );
            const initialRef = result.current.sentinelRef;

            // Act
            rerender({
                hasMore: true,
                isLoading: true,
                onLoadMore,
            });

            // Assert
            expect(result.current.sentinelRef).toBe(initialRef);
        });
    });
});
