import { createTheme, ThemeProvider } from '@mui/material/styles';
import { act, render, screen } from '@testing-library/react';
import React from 'react';
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';
import * as useConnectionStatusModule from '@/hooks/useConnectionStatus';
import { ConnectionStatusBanner } from './ConnectionStatusBanner';

vi.mock('@/hooks/useConnectionStatus');

const mockUseConnectionStatus = vi.mocked(useConnectionStatusModule.useConnectionStatus);

const renderWithTheme = (component: React.ReactElement, mode: 'light' | 'dark' = 'light') => {
  const theme = createTheme({ palette: { mode } });
  return render(<ThemeProvider theme={theme}>{component}</ThemeProvider>);
};

describe('ConnectionStatusBanner', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    vi.useFakeTimers();
  });

  afterEach(() => {
    vi.runOnlyPendingTimers();
    vi.useRealTimers();
  });

  it('should not show banner when online', () => {
    mockUseConnectionStatus.mockReturnValue({
      isOnline: true,
      lastSync: new Date(),
      checkConnection: vi.fn<() => Promise<void>>(),
    });

    renderWithTheme(<ConnectionStatusBanner />);

    expect(screen.queryByText('Connection Lost')).not.toBeInTheDocument();
  });

  it('should show banner after 2 second delay when offline', async () => {
    mockUseConnectionStatus.mockReturnValue({
      isOnline: false,
      lastSync: null,
      checkConnection: vi.fn<() => Promise<void>>(),
    });

    renderWithTheme(<ConnectionStatusBanner />);

    expect(screen.queryByText('Connection Lost')).not.toBeInTheDocument();

    await act(async () => {
      vi.advanceTimersByTime(2000);
    });

    expect(screen.getByText('Connection Lost')).toBeInTheDocument();
  });

  it('should not show banner if connection is restored within 2 seconds', async () => {
    mockUseConnectionStatus.mockReturnValue({
      isOnline: false,
      lastSync: null,
      checkConnection: vi.fn<() => Promise<void>>(),
    });

    const { rerender } = renderWithTheme(<ConnectionStatusBanner />);

    await act(async () => {
      vi.advanceTimersByTime(1000);
    });

    mockUseConnectionStatus.mockReturnValue({
      isOnline: true,
      lastSync: new Date(),
      checkConnection: vi.fn<() => Promise<void>>(),
    });

    rerender(
      <ThemeProvider theme={createTheme()}>
        <ConnectionStatusBanner />
      </ThemeProvider>,
    );

    await act(async () => {
      vi.advanceTimersByTime(2000);
    });

    expect(screen.queryByText('Connection Lost')).not.toBeInTheDocument();
  });

  it('should display correct message when offline', async () => {
    mockUseConnectionStatus.mockReturnValue({
      isOnline: false,
      lastSync: null,
      checkConnection: vi.fn<() => Promise<void>>(),
    });

    renderWithTheme(<ConnectionStatusBanner />);

    await act(async () => {
      vi.advanceTimersByTime(2000);
    });

    expect(screen.getByText('Connection Lost')).toBeInTheDocument();
    expect(screen.getByText(/Changes are saved locally and will sync when restored/)).toBeInTheDocument();
  });

  it('should display last sync time when available', async () => {
    const lastSync = new Date('2025-10-19T10:30:00');
    mockUseConnectionStatus.mockReturnValue({
      isOnline: false,
      lastSync,
      checkConnection: vi.fn<() => Promise<void>>(),
    });

    renderWithTheme(<ConnectionStatusBanner />);

    await act(async () => {
      vi.advanceTimersByTime(2000);
    });

    expect(screen.getByText(/Last synced:/)).toBeInTheDocument();
  });

  it('should have semantic IDs for testing', async () => {
    mockUseConnectionStatus.mockReturnValue({
      isOnline: false,
      lastSync: null,
      checkConnection: vi.fn<() => Promise<void>>(),
    });

    renderWithTheme(<ConnectionStatusBanner />);

    await act(async () => {
      vi.advanceTimersByTime(2000);
    });

    expect(screen.getByRole('alert')).toBeInTheDocument();
    expect(screen.getByText('Connection Lost')).toBeInTheDocument();
    expect(screen.getByText(/Changes are saved locally and will sync when restored/)).toBeInTheDocument();
  });

  it('should adapt to light theme', async () => {
    mockUseConnectionStatus.mockReturnValue({
      isOnline: false,
      lastSync: null,
      checkConnection: vi.fn<() => Promise<void>>(),
    });

    renderWithTheme(<ConnectionStatusBanner />, 'light');

    await act(async () => {
      vi.advanceTimersByTime(2000);
    });

    expect(screen.getByRole('alert')).toBeInTheDocument();
  });

  it('should adapt to dark theme', async () => {
    mockUseConnectionStatus.mockReturnValue({
      isOnline: false,
      lastSync: null,
      checkConnection: vi.fn<() => Promise<void>>(),
    });

    renderWithTheme(<ConnectionStatusBanner />, 'dark');

    await act(async () => {
      vi.advanceTimersByTime(2000);
    });

    expect(screen.getByRole('alert')).toBeInTheDocument();
  });

  it('should hide banner immediately when connection is restored', async () => {
    mockUseConnectionStatus.mockReturnValue({
      isOnline: false,
      lastSync: null,
      checkConnection: vi.fn<() => Promise<void>>(),
    });

    const { rerender } = renderWithTheme(<ConnectionStatusBanner />);

    await act(async () => {
      vi.advanceTimersByTime(2000);
    });

    expect(screen.getByText('Connection Lost')).toBeInTheDocument();

    mockUseConnectionStatus.mockReturnValue({
      isOnline: true,
      lastSync: new Date(),
      checkConnection: vi.fn<() => Promise<void>>(),
    });

    rerender(
      <ThemeProvider theme={createTheme()}>
        <ConnectionStatusBanner />
      </ThemeProvider>,
    );

    expect(screen.queryByText('Connection Lost')).not.toBeInTheDocument();
  });
});
