import { createTheme, ThemeProvider } from '@mui/material/styles';
import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import type React from 'react';
import { describe, expect, it, vi } from 'vitest';
import { EditingBlocker } from './EditingBlocker';

const renderWithTheme = (component: React.ReactElement, mode: 'light' | 'dark' = 'light') => {
  const theme = createTheme({ palette: { mode } });
  return render(<ThemeProvider theme={theme}>{component}</ThemeProvider>);
};

describe('EditingBlocker', () => {
  it('should not render when not blocked', () => {
    renderWithTheme(<EditingBlocker isBlocked={false} />);

    expect(document.getElementById('editing-blocker')).not.toBeInTheDocument();
  });

  it('should render when blocked', () => {
    renderWithTheme(<EditingBlocker isBlocked={true} />);

    expect(document.getElementById('editing-blocker')).toBeInTheDocument();
    expect(screen.getByText('Editing disabled while offline')).toBeInTheDocument();
  });

  it('should prevent click propagation', async () => {
    const user = userEvent.setup();
    const handleClick = vi.fn();

    renderWithTheme(
      <div onClick={handleClick}>
        <EditingBlocker isBlocked={true} />
      </div>,
    );

    const blocker = document.getElementById('editing-blocker');
    expect(blocker).toBeInTheDocument();

    if (blocker) {
      await user.click(blocker);
    }

    expect(handleClick).not.toHaveBeenCalled();
  });

  it('should display message paper with elevation', () => {
    renderWithTheme(<EditingBlocker isBlocked={true} />);

    const message = screen.getByText('Editing disabled while offline');
    expect(message).toBeInTheDocument();

    const paper = message.closest('.MuiPaper-root');
    expect(paper).toBeInTheDocument();
    expect(paper).toHaveClass('MuiPaper-elevation3');
  });

  it('should adapt to light theme', () => {
    renderWithTheme(<EditingBlocker isBlocked={true} />, 'light');

    const blocker = document.getElementById('editing-blocker');
    expect(blocker).toBeInTheDocument();

    const computedStyle = window.getComputedStyle(blocker!);
    expect(computedStyle.backgroundColor).toBeTruthy();
  });

  it('should adapt to dark theme', () => {
    renderWithTheme(<EditingBlocker isBlocked={true} />, 'dark');

    const blocker = document.getElementById('editing-blocker');
    expect(blocker).toBeInTheDocument();

    const computedStyle = window.getComputedStyle(blocker!);
    expect(computedStyle.backgroundColor).toBeTruthy();
  });

  it('should have correct z-index to block editing but not navigation', () => {
    renderWithTheme(<EditingBlocker isBlocked={true} />);

    const blocker = document.getElementById('editing-blocker');
    expect(blocker).toBeInTheDocument();

    const computedStyle = window.getComputedStyle(blocker!);
    expect(parseInt(computedStyle.zIndex, 10)).toBeLessThan(1300);
  });

  it('should be positioned below navigation bar (top: 64)', () => {
    renderWithTheme(<EditingBlocker isBlocked={true} />);

    const blocker = document.getElementById('editing-blocker');
    expect(blocker).toBeInTheDocument();

    const computedStyle = window.getComputedStyle(blocker!);
    expect(computedStyle.top).toBe('64px');
  });

  it('should cover the entire viewport below the header', () => {
    renderWithTheme(<EditingBlocker isBlocked={true} />);

    const blocker = document.getElementById('editing-blocker');
    expect(blocker).toBeInTheDocument();

    const computedStyle = window.getComputedStyle(blocker!);
    expect(computedStyle.position).toBe('fixed');
    expect(computedStyle.left).toBe('0px');
    expect(computedStyle.right).toBe('0px');
    expect(computedStyle.bottom).toBe('0px');
  });
});
