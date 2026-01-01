import { renderHook, waitFor } from '@testing-library/react';
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';
import { useConnectionStatus } from './useConnectionStatus';

describe('useConnectionStatus', () => {
  beforeEach(() => {
    global.fetch = vi.fn();
  });

  afterEach(() => {
    vi.restoreAllMocks();
  });

  it('should initialize with online status', () => {
    vi.mocked(fetch).mockResolvedValue({ ok: true } as Response);

    const { result } = renderHook(() => useConnectionStatus());

    expect(result.current.isOnline).toBe(true);
  });

  it('should detect online status via heartbeat', async () => {
    vi.mocked(fetch).mockResolvedValue({ ok: true } as Response);

    const { result } = renderHook(() => useConnectionStatus({ pollInterval: 50 }));

    await waitFor(
      () => {
        expect(result.current.isOnline).toBe(true);
        expect(result.current.lastSync).toBeInstanceOf(Date);
      },
      { timeout: 200 },
    );
  });

  it('should detect offline status when fetch fails', async () => {
    vi.mocked(fetch).mockRejectedValue(new Error('Network error'));

    const onStatusChange = vi.fn();
    const { result } = renderHook(() => useConnectionStatus({ onStatusChange, pollInterval: 50 }));

    await waitFor(
      () => {
        expect(result.current.isOnline).toBe(false);
      },
      { timeout: 200 },
    );
  });

  it('should detect offline status when response is not ok', async () => {
    vi.mocked(fetch).mockResolvedValue({ ok: false } as Response);

    const { result } = renderHook(() => useConnectionStatus({ pollInterval: 50 }));

    await waitFor(
      () => {
        expect(result.current.isOnline).toBe(false);
      },
      { timeout: 200 },
    );
  });

  it('should call onStatusChange when connection changes', async () => {
    const onStatusChange = vi.fn();

    vi.mocked(fetch).mockResolvedValue({ ok: true } as Response);
    const { result } = renderHook(() => useConnectionStatus({ onStatusChange, pollInterval: 50 }));

    await waitFor(() => expect(result.current.isOnline).toBe(true), {
      timeout: 200,
    });

    vi.mocked(fetch).mockRejectedValue(new Error('Network error'));

    await waitFor(
      () => {
        expect(result.current.isOnline).toBe(false);
        expect(onStatusChange).toHaveBeenCalledWith(false);
      },
      { timeout: 300 },
    );
  });

  it('should poll at specified interval', async () => {
    vi.mocked(fetch).mockResolvedValue({ ok: true } as Response);

    renderHook(() => useConnectionStatus({ pollInterval: 50 }));

    await waitFor(() => expect(fetch).toHaveBeenCalled(), { timeout: 200 });
    const firstCallCount = vi.mocked(fetch).mock.calls.length;

    await new Promise((resolve) => setTimeout(resolve, 100));

    expect(vi.mocked(fetch).mock.calls.length).toBeGreaterThan(firstCallCount);
  });

  it('should use custom health endpoint', async () => {
    vi.mocked(fetch).mockResolvedValue({ ok: true } as Response);

    renderHook(() =>
      useConnectionStatus({
        healthEndpoint: '/custom/health',
        pollInterval: 50,
      }),
    );

    await waitFor(
      () => {
        expect(fetch).toHaveBeenCalledWith(
          '/custom/health',
          expect.objectContaining({
            method: 'HEAD',
            cache: 'no-store',
          }),
        );
      },
      { timeout: 200 },
    );
  });

  it('should update lastSync only when online', async () => {
    vi.mocked(fetch).mockResolvedValue({ ok: true } as Response);

    const { result } = renderHook(() => useConnectionStatus({ pollInterval: 50 }));

    await waitFor(() => expect(result.current.lastSync).toBeInstanceOf(Date), {
      timeout: 200,
    });

    // Capture lastSync time
    const lastSyncTime = result.current.lastSync?.getTime();
    expect(lastSyncTime).toBeDefined();

    vi.mocked(fetch).mockRejectedValue(new Error('Network error'));

    await waitFor(
      () => {
        expect(result.current.isOnline).toBe(false);
      },
      { timeout: 300 },
    );

    // After going offline, lastSync should not have advanced (should be same or earlier)
    // Using >= comparison to handle race condition where we captured during a poll
    const currentSyncTime = result.current.lastSync?.getTime();
    expect(currentSyncTime).toBeDefined();
    expect(currentSyncTime).toBeLessThanOrEqual(lastSyncTime! + 100); // Allow small timing variance
  });

  it('should cleanup on unmount', async () => {
    vi.mocked(fetch).mockResolvedValue({ ok: true } as Response);

    const { unmount } = renderHook(() => useConnectionStatus({ pollInterval: 50 }));

    await waitFor(() => expect(fetch).toHaveBeenCalled(), { timeout: 200 });
    const callCountBeforeUnmount = vi.mocked(fetch).mock.calls.length;

    unmount();

    await new Promise((resolve) => setTimeout(resolve, 150));

    expect(vi.mocked(fetch).mock.calls.length).toBe(callCountBeforeUnmount);
  });

  it('should handle timeout properly', async () => {
    vi.mocked(fetch).mockRejectedValue(new Error('Timeout'));

    const { result } = renderHook(() => useConnectionStatus({ pollInterval: 50 }));

    await waitFor(
      () => {
        expect(result.current.isOnline).toBe(false);
      },
      { timeout: 200 },
    );
  });

  it('should provide checkConnection method', async () => {
    vi.mocked(fetch).mockResolvedValue({ ok: true } as Response);

    const { result } = renderHook(() => useConnectionStatus());

    await result.current.checkConnection();

    expect(fetch).toHaveBeenCalled();
  });
});
