import { createTheme, ThemeProvider } from '@mui/material';
import { fireEvent, render, screen } from '@testing-library/react';
import { describe, expect, it, vi } from 'vitest';
import { FogOfWarPanel } from './FogOfWarPanel';

const theme = createTheme();

const renderComponent = (props = {}) => {
  const defaultProps = {
    onHideAll: vi.fn(),
    onRevealAll: vi.fn(),
    onModeChange: vi.fn(),
    onDrawPolygon: vi.fn(),
    onBucketFill: vi.fn(),
    currentMode: 'add' as 'add' | 'subtract',
  };

  return render(
    <ThemeProvider theme={theme}>
      <FogOfWarPanel {...defaultProps} {...props} />
    </ThemeProvider>,
  );
};

describe('FogOfWarPanel', () => {
  it('renders quick action buttons', () => {
    renderComponent();

    expect(screen.getByText('Quick Actions')).toBeInTheDocument();
    expect(screen.getByText('Hide All')).toBeInTheDocument();
    expect(screen.getByText('Reveal All')).toBeInTheDocument();
  });

  it('renders mode toggle buttons', () => {
    renderComponent();

    expect(screen.getByText('Mode')).toBeInTheDocument();
    expect(screen.getByRole('button', { name: /add fog/i })).toBeInTheDocument();
    expect(screen.getByRole('button', { name: /subtract fog/i })).toBeInTheDocument();
  });

  it('renders drawing tool buttons', () => {
    renderComponent();

    expect(screen.getByText('Drawing Tools')).toBeInTheDocument();
    expect(screen.getByText('Draw Polygon')).toBeInTheDocument();
    expect(screen.getByText('Bucket Fill')).toBeInTheDocument();
  });

  it('calls onHideAll when Hide All button is clicked', () => {
    const onHideAll = vi.fn();
    renderComponent({ onHideAll });

    const hideAllButton = screen.getByText('Hide All');
    fireEvent.click(hideAllButton);

    expect(onHideAll).toHaveBeenCalledTimes(1);
  });

  it('calls onRevealAll when Reveal All button is clicked', () => {
    const onRevealAll = vi.fn();
    renderComponent({ onRevealAll });

    const revealAllButton = screen.getByText('Reveal All');
    fireEvent.click(revealAllButton);

    expect(onRevealAll).toHaveBeenCalledTimes(1);
  });

  it('calls onDrawPolygon when Draw Polygon button is clicked', () => {
    const onDrawPolygon = vi.fn();
    renderComponent({ onDrawPolygon });

    const drawPolygonButton = screen.getByText('Draw Polygon');
    fireEvent.click(drawPolygonButton);

    expect(onDrawPolygon).toHaveBeenCalledTimes(1);
  });

  it('calls onBucketFill when Bucket Fill button is clicked', () => {
    const onBucketFill = vi.fn();
    renderComponent({ onBucketFill });

    const bucketFillButton = screen.getByText('Bucket Fill');
    fireEvent.click(bucketFillButton);

    expect(onBucketFill).toHaveBeenCalledTimes(1);
  });

  it('calls onModeChange with "add" when Add button is clicked', () => {
    const onModeChange = vi.fn();
    renderComponent({ currentMode: 'subtract', onModeChange });

    const addButton = screen.getByRole('button', { name: /add fog/i });
    fireEvent.click(addButton);

    expect(onModeChange).toHaveBeenCalledWith('add');
  });

  it('calls onModeChange with "subtract" when Subtract button is clicked', () => {
    const onModeChange = vi.fn();
    renderComponent({ currentMode: 'add', onModeChange });

    const subtractButton = screen.getByRole('button', { name: /subtract fog/i });
    fireEvent.click(subtractButton);

    expect(onModeChange).toHaveBeenCalledWith('subtract');
  });

  it('shows Add mode as selected when currentMode is "add"', () => {
    renderComponent({ currentMode: 'add' });

    const addButton = screen.getByRole('button', { name: /add fog/i });
    expect(addButton).toHaveClass('Mui-selected');
  });

  it('shows Subtract mode as selected when currentMode is "subtract"', () => {
    renderComponent({ currentMode: 'subtract' });

    const subtractButton = screen.getByRole('button', { name: /subtract fog/i });
    expect(subtractButton).toHaveClass('Mui-selected');
  });

  it('does not call onModeChange when clicking already selected mode', () => {
    const onModeChange = vi.fn();
    renderComponent({ currentMode: 'add', onModeChange });

    const addButton = screen.getByRole('button', { name: /add fog/i });
    fireEvent.click(addButton);

    expect(onModeChange).not.toHaveBeenCalled();
  });
});
