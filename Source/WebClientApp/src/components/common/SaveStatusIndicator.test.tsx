import { createTheme, ThemeProvider } from '@mui/material/styles';
import { render, screen, waitFor } from '@testing-library/react';
import React from 'react';
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';
import { SaveStatusIndicator } from './SaveStatusIndicator';

const renderWithTheme = (component: React.ReactElement, mode: 'light' | 'dark' = 'light') => {
  const theme = createTheme({ palette: { mode } });
  return render(<ThemeProvider theme={theme}>{component}</ThemeProvider>);
};

describe('SaveStatusIndicator', () => {
  beforeEach(() => {
    vi.useFakeTimers();
  });

  afterEach(() => {
    vi.restoreAllMocks();
  });

  it('should not render when status is idle', () => {
    const { container } = renderWithTheme(<SaveStatusIndicator status='idle' />);
    expect(container.firstChild).toBeNull();
  });

  it('should render saving status with spinner', () => {
    renderWithTheme(<SaveStatusIndicator status='saving' />);

    expect(screen.getByText('Saving...')).toBeInTheDocument();
    expect(screen.getByRole('progressbar')).toBeInTheDocument();
  });

  it('should render saved status with success icon', () => {
    renderWithTheme(<SaveStatusIndicator status='saved' />);

    expect(screen.getByText('Saved')).toBeInTheDocument();
  });

  it('should render error status with error icon', () => {
    renderWithTheme(<SaveStatusIndicator status='error' />);

    expect(screen.getByText('Save failed')).toBeInTheDocument();
  });

  it('should hide saved status after 2 seconds', async () => {
    renderWithTheme(<SaveStatusIndicator status='saved' />);

    expect(screen.getByText('Saved')).toBeInTheDocument();

    vi.advanceTimersByTime(2000);

    await waitFor(() => {
      expect(screen.queryByText('Saved')).not.toBeInTheDocument();
    });
  });

  it('should not hide error status automatically', () => {
    renderWithTheme(<SaveStatusIndicator status='error' />);

    expect(screen.getByText('Save failed')).toBeInTheDocument();

    vi.advanceTimersByTime(5000);

    expect(screen.getByText('Save failed')).toBeInTheDocument();
  });

  it('should not hide saving status automatically', () => {
    renderWithTheme(<SaveStatusIndicator status='saving' />);

    expect(screen.getByText('Saving...')).toBeInTheDocument();

    vi.advanceTimersByTime(5000);

    expect(screen.getByText('Saving...')).toBeInTheDocument();
  });

  it('should reset timer when status changes from saved to saved again', async () => {
    const { rerender } = renderWithTheme(<SaveStatusIndicator status='saved' />);

    expect(screen.getByText('Saved')).toBeInTheDocument();

    vi.advanceTimersByTime(1000);

    rerender(
      <ThemeProvider theme={createTheme({ palette: { mode: 'light' } })}>
        <SaveStatusIndicator status='idle' />
      </ThemeProvider>,
    );

    rerender(
      <ThemeProvider theme={createTheme({ palette: { mode: 'light' } })}>
        <SaveStatusIndicator status='saved' />
      </ThemeProvider>,
    );

    expect(screen.getByText('Saved')).toBeInTheDocument();

    vi.advanceTimersByTime(1500);
    expect(screen.getByText('Saved')).toBeInTheDocument();

    vi.advanceTimersByTime(500);
    await waitFor(() => {
      expect(screen.queryByText('Saved')).not.toBeInTheDocument();
    });
  });

  it('should render in compact mode', () => {
    renderWithTheme(<SaveStatusIndicator status='saving' compact={true} />);

    expect(screen.getByText('Saving...')).toBeInTheDocument();
  });

  it('should render in non-compact mode', () => {
    renderWithTheme(<SaveStatusIndicator status='saving' compact={false} />);

    expect(screen.getByText('Saving...')).toBeInTheDocument();
  });

  it('should adapt to light theme', () => {
    renderWithTheme(<SaveStatusIndicator status='saving' />, 'light');

    expect(screen.getByText('Saving...')).toBeInTheDocument();
  });

  it('should adapt to dark theme', () => {
    renderWithTheme(<SaveStatusIndicator status='saving' />, 'dark');

    expect(screen.getByText('Saving...')).toBeInTheDocument();
  });

  it('should cleanup timer on unmount', () => {
    const { unmount } = renderWithTheme(<SaveStatusIndicator status='saved' />);

    expect(screen.getByText('Saved')).toBeInTheDocument();

    unmount();

    vi.advanceTimersByTime(2000);
  });
});
