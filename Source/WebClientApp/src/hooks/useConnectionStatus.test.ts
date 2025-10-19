import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import { renderHook, waitFor } from '@testing-library/react';
import { useConnectionStatus } from './useConnectionStatus';

describe('useConnectionStatus', () => {
    beforeEach(() => {
        vi.useFakeTimers();
        global.fetch = vi.fn();
    });

    afterEach(() => {
        vi.restoreAllMocks();
        vi.useRealTimers();
    });

    it('should initialize with online status', () => {
        vi.mocked(fetch).mockResolvedValue({ ok: true } as Response);

        const { result } = renderHook(() => useConnectionStatus());

        expect(result.current.isOnline).toBe(true);
    });

    it('should detect online status via heartbeat', async () => {
        vi.mocked(fetch).mockResolvedValue({ ok: true } as Response);

        const { result } = renderHook(() => useConnectionStatus());

        await vi.advanceTimersByTimeAsync(100);

        await waitFor(() => {
            expect(result.current.isOnline).toBe(true);
            expect(result.current.lastSync).toBeInstanceOf(Date);
        });
    });

    it('should detect offline status when fetch fails', async () => {
        vi.mocked(fetch).mockRejectedValue(new Error('Network error'));

        const onStatusChange = vi.fn();
        const { result } = renderHook(() =>
            useConnectionStatus({ onStatusChange })
        );

        await vi.advanceTimersByTimeAsync(100);

        await waitFor(() => {
            expect(result.current.isOnline).toBe(false);
        });
    });

    it('should detect offline status when response is not ok', async () => {
        vi.mocked(fetch).mockResolvedValue({ ok: false } as Response);

        const { result } = renderHook(() => useConnectionStatus());

        await vi.advanceTimersByTimeAsync(100);

        await waitFor(() => {
            expect(result.current.isOnline).toBe(false);
        });
    });

    it('should call onStatusChange when connection changes', async () => {
        const onStatusChange = vi.fn();

        vi.mocked(fetch).mockResolvedValueOnce({ ok: true } as Response);
        const { result } = renderHook(() =>
            useConnectionStatus({ onStatusChange })
        );

        await vi.advanceTimersByTimeAsync(100);
        await waitFor(() => expect(result.current.isOnline).toBe(true));

        vi.mocked(fetch).mockRejectedValueOnce(new Error('Network error'));
        await vi.advanceTimersByTimeAsync(5000);

        await waitFor(() => {
            expect(result.current.isOnline).toBe(false);
            expect(onStatusChange).toHaveBeenCalledWith(false);
        });
    });

    it('should poll at specified interval', async () => {
        vi.mocked(fetch).mockResolvedValue({ ok: true } as Response);

        renderHook(() =>
            useConnectionStatus({ pollInterval: 1000 })
        );

        await vi.advanceTimersByTimeAsync(100);
        await waitFor(() => expect(fetch).toHaveBeenCalledTimes(1));

        await vi.advanceTimersByTimeAsync(1000);
        await waitFor(() => expect(fetch).toHaveBeenCalledTimes(2));

        await vi.advanceTimersByTimeAsync(1000);
        await waitFor(() => expect(fetch).toHaveBeenCalledTimes(3));
    });

    it('should use custom health endpoint', async () => {
        vi.mocked(fetch).mockResolvedValue({ ok: true } as Response);

        renderHook(() =>
            useConnectionStatus({ healthEndpoint: '/custom/health' })
        );

        await vi.advanceTimersByTimeAsync(100);

        await waitFor(() => {
            expect(fetch).toHaveBeenCalledWith(
                '/custom/health',
                expect.objectContaining({
                    method: 'HEAD',
                    cache: 'no-store'
                })
            );
        });
    });

    it('should update lastSync only when online', async () => {
        vi.mocked(fetch).mockResolvedValueOnce({ ok: true } as Response);

        const { result } = renderHook(() => useConnectionStatus());

        await vi.advanceTimersByTimeAsync(100);
        await waitFor(() => expect(result.current.lastSync).toBeInstanceOf(Date));

        const firstSync = result.current.lastSync;

        vi.mocked(fetch).mockRejectedValueOnce(new Error('Network error'));
        await vi.advanceTimersByTimeAsync(5000);

        await waitFor(() => {
            expect(result.current.isOnline).toBe(false);
            expect(result.current.lastSync).toEqual(firstSync);
        });
    });

    it('should cleanup on unmount', async () => {
        vi.mocked(fetch).mockResolvedValue({ ok: true } as Response);

        const { unmount } = renderHook(() => useConnectionStatus());

        await vi.advanceTimersByTimeAsync(100);
        await waitFor(() => expect(fetch).toHaveBeenCalledTimes(1));

        unmount();

        await vi.advanceTimersByTimeAsync(5000);
        expect(fetch).toHaveBeenCalledTimes(1);
    });

    it('should handle timeout properly', async () => {
        vi.mocked(fetch).mockRejectedValue(new Error('Timeout'));

        const { result } = renderHook(() => useConnectionStatus());

        await vi.advanceTimersByTimeAsync(100);

        await waitFor(() => {
            expect(result.current.isOnline).toBe(false);
        });
    });

    it('should provide checkConnection method', async () => {
        vi.mocked(fetch).mockResolvedValue({ ok: true } as Response);

        const { result } = renderHook(() => useConnectionStatus());

        await result.current.checkConnection();

        expect(fetch).toHaveBeenCalled();
    });
});
