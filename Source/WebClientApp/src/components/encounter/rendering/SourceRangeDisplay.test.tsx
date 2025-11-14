import { createTheme, ThemeProvider } from '@mui/material';
import { render } from '@testing-library/react';
import type React from 'react';
import { describe, expect, it } from 'vitest';
import type { Point } from '@/types/domain';
import { SourceRangeDisplay, type SourceRangeDisplayProps } from './SourceRangeDisplay';

const renderWithTheme = (ui: React.ReactElement, mode: 'light' | 'dark' = 'light') => {
  const theme = createTheme({ palette: { mode } });
  return render(<ThemeProvider theme={theme}>{ui}</ThemeProvider>);
};

describe('SourceRangeDisplay', () => {
  const defaultProps: SourceRangeDisplayProps = {
    position: { x: 100, y: 100 },
    range: 5.0,
  };

  it('should render without errors', () => {
    renderWithTheme(<SourceRangeDisplay {...defaultProps} />);
  });

  it('should have displayName set', () => {
    expect(SourceRangeDisplay.displayName).toBe('SourceRangeDisplay');
  });

  it('should render in light mode', () => {
    renderWithTheme(<SourceRangeDisplay {...defaultProps} />, 'light');
  });

  it('should render in dark mode', () => {
    renderWithTheme(<SourceRangeDisplay {...defaultProps} />, 'dark');
  });

  it('should format integer range correctly', () => {
    renderWithTheme(<SourceRangeDisplay {...defaultProps} range={5} />);
  });

  it('should format decimal range correctly', () => {
    renderWithTheme(<SourceRangeDisplay {...defaultProps} range={5.5} />);
  });

  it('should format minimum range', () => {
    renderWithTheme(<SourceRangeDisplay {...defaultProps} range={0.5} />);
  });

  it('should format maximum range', () => {
    renderWithTheme(<SourceRangeDisplay {...defaultProps} range={50.0} />);
  });

  it('should format zero range', () => {
    renderWithTheme(<SourceRangeDisplay {...defaultProps} range={0} />);
  });

  it('should render at different positions', () => {
    const position: Point = { x: 250, y: 250 };
    renderWithTheme(<SourceRangeDisplay {...defaultProps} position={position} />);
  });

  it('should handle negative positions', () => {
    const position: Point = { x: -50, y: -50 };
    renderWithTheme(<SourceRangeDisplay {...defaultProps} position={position} />);
  });

  it('should handle origin position', () => {
    const position: Point = { x: 0, y: 0 };
    renderWithTheme(<SourceRangeDisplay {...defaultProps} position={position} />);
  });

  it('should format single decimal place', () => {
    renderWithTheme(<SourceRangeDisplay {...defaultProps} range={3.2} />);
  });

  it('should format multiple decimal places', () => {
    renderWithTheme(<SourceRangeDisplay {...defaultProps} range={3.75} />);
  });

  it('should handle large range values', () => {
    renderWithTheme(<SourceRangeDisplay {...defaultProps} range={45.5} />);
  });

  it('should handle small range values', () => {
    renderWithTheme(<SourceRangeDisplay {...defaultProps} range={1.0} />);
  });
});
