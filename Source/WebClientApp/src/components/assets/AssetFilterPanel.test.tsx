/**
 * AssetFilterPanel Component Tests
 * Tests filtering controls for Asset Library
 */

import { createTheme, ThemeProvider } from '@mui/material/styles';
import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import type React from 'react';
import { beforeEach, describe, expect, it, vi } from 'vitest';
import { AssetKind } from '@/types/domain';
import { AssetFilterPanel, type AssetFilters } from './AssetFilterPanel';

// Test wrapper with theme
const TestWrapper: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const theme = createTheme({ palette: { mode: 'light' } });
  return <ThemeProvider theme={theme}>{children}</ThemeProvider>;
};
TestWrapper.displayName = 'TestWrapper';

describe('AssetFilterPanel', () => {
  const defaultFilters: AssetFilters = {
    kind: AssetKind.Object,
    showMine: true,
    showOthers: true,
    showPublic: true,
    showPrivate: true,
    showPublished: true,
    showDraft: true,
  };

  let mockOnFiltersChange: ReturnType<typeof vi.fn>;

  beforeEach(() => {
    mockOnFiltersChange = vi.fn();
  });

  describe('rendering', () => {
    it('should render filter panel with header', () => {
      render(
        <TestWrapper>
          <AssetFilterPanel filters={defaultFilters} onFiltersChange={mockOnFiltersChange} />
        </TestWrapper>,
      );

      expect(screen.getByText('Filters')).toBeInTheDocument();
    });

    it('should render ownership checkboxes', () => {
      render(
        <TestWrapper>
          <AssetFilterPanel filters={defaultFilters} onFiltersChange={mockOnFiltersChange} />
        </TestWrapper>,
      );

      expect(screen.getByRole('checkbox', { name: /mine/i })).toBeInTheDocument();
      expect(screen.getByRole('checkbox', { name: /others/i })).toBeInTheDocument();
    });

    it('should show status and visibility filters when showMine is checked', () => {
      render(
        <TestWrapper>
          <AssetFilterPanel filters={{ ...defaultFilters, showMine: true }} onFiltersChange={mockOnFiltersChange} />
        </TestWrapper>,
      );

      expect(screen.getByText('Status')).toBeInTheDocument();
      expect(screen.getByText('Visibility')).toBeInTheDocument();
      expect(screen.getByRole('checkbox', { name: /published/i })).toBeInTheDocument();
      expect(screen.getByRole('checkbox', { name: /draft/i })).toBeInTheDocument();
      expect(screen.getByRole('checkbox', { name: /public/i })).toBeInTheDocument();
      expect(screen.getByRole('checkbox', { name: /private/i })).toBeInTheDocument();
    });

    it('should hide status and visibility filters when showMine is unchecked', () => {
      render(
        <TestWrapper>
          <AssetFilterPanel filters={{ ...defaultFilters, showMine: false }} onFiltersChange={mockOnFiltersChange} />
        </TestWrapper>,
      );

      expect(screen.queryByText('Status')).not.toBeInTheDocument();
      expect(screen.queryByText('Visibility')).not.toBeInTheDocument();
    });

    it('should show reset button when filters are active', () => {
      const activeFilters: AssetFilters = {
        ...defaultFilters,
        showOthers: false, // Active filter
      };

      render(
        <TestWrapper>
          <AssetFilterPanel filters={activeFilters} onFiltersChange={mockOnFiltersChange} />
        </TestWrapper>,
      );

      expect(screen.getByRole('button', { name: /reset/i })).toBeInTheDocument();
    });

    it('should hide reset button when all filters are default', () => {
      render(
        <TestWrapper>
          <AssetFilterPanel filters={defaultFilters} onFiltersChange={mockOnFiltersChange} />
        </TestWrapper>,
      );

      expect(screen.queryByRole('button', { name: /reset/i })).not.toBeInTheDocument();
    });
  });

  describe('ownership filter interactions', () => {
    it('should call onFiltersChange when Mine checkbox is toggled', async () => {
      const user = userEvent.setup();

      render(
        <TestWrapper>
          <AssetFilterPanel filters={defaultFilters} onFiltersChange={mockOnFiltersChange} />
        </TestWrapper>,
      );

      const mineCheckbox = screen.getByRole('checkbox', { name: /mine/i });
      await user.click(mineCheckbox);

      expect(mockOnFiltersChange).toHaveBeenCalledWith({
        ...defaultFilters,
        showMine: false,
      });
    });

    it('should call onFiltersChange when Others checkbox is toggled', async () => {
      const user = userEvent.setup();

      render(
        <TestWrapper>
          <AssetFilterPanel filters={defaultFilters} onFiltersChange={mockOnFiltersChange} />
        </TestWrapper>,
      );

      const othersCheckbox = screen.getByRole('checkbox', { name: /others/i });
      await user.click(othersCheckbox);

      expect(mockOnFiltersChange).toHaveBeenCalledWith({
        ...defaultFilters,
        showOthers: false,
      });
    });
  });

  describe('status and visibility filter interactions', () => {
    it('should call onFiltersChange when Published checkbox is toggled', async () => {
      const user = userEvent.setup();

      render(
        <TestWrapper>
          <AssetFilterPanel filters={{ ...defaultFilters, showMine: true }} onFiltersChange={mockOnFiltersChange} />
        </TestWrapper>,
      );

      const publishedCheckbox = screen.getByRole('checkbox', {
        name: /published/i,
      });
      await user.click(publishedCheckbox);

      expect(mockOnFiltersChange).toHaveBeenCalledWith({
        ...defaultFilters,
        showPublished: false,
      });
    });

    it('should call onFiltersChange when Draft checkbox is toggled', async () => {
      const user = userEvent.setup();

      render(
        <TestWrapper>
          <AssetFilterPanel filters={{ ...defaultFilters, showMine: true }} onFiltersChange={mockOnFiltersChange} />
        </TestWrapper>,
      );

      const draftCheckbox = screen.getByRole('checkbox', { name: /draft/i });
      await user.click(draftCheckbox);

      expect(mockOnFiltersChange).toHaveBeenCalledWith({
        ...defaultFilters,
        showDraft: false,
      });
    });

    it('should call onFiltersChange when Public checkbox is toggled', async () => {
      const user = userEvent.setup();

      render(
        <TestWrapper>
          <AssetFilterPanel filters={{ ...defaultFilters, showMine: true }} onFiltersChange={mockOnFiltersChange} />
        </TestWrapper>,
      );

      const publicCheckbox = screen.getByRole('checkbox', { name: /public/i });
      await user.click(publicCheckbox);

      expect(mockOnFiltersChange).toHaveBeenCalledWith({
        ...defaultFilters,
        showPublic: false,
      });
    });

    it('should call onFiltersChange when Private checkbox is toggled', async () => {
      const user = userEvent.setup();

      render(
        <TestWrapper>
          <AssetFilterPanel filters={{ ...defaultFilters, showMine: true }} onFiltersChange={mockOnFiltersChange} />
        </TestWrapper>,
      );

      const privateCheckbox = screen.getByRole('checkbox', {
        name: /private/i,
      });
      await user.click(privateCheckbox);

      expect(mockOnFiltersChange).toHaveBeenCalledWith({
        ...defaultFilters,
        showPrivate: false,
      });
    });
  });

  describe('reset functionality', () => {
    it('should reset all filters to defaults when reset button is clicked', async () => {
      const user = userEvent.setup();

      const activeFilters: AssetFilters = {
        kind: AssetKind.Creature,
        showMine: false,
        showOthers: false,
        showPublic: false,
        showPrivate: false,
        showPublished: false,
        showDraft: false,
      };

      render(
        <TestWrapper>
          <AssetFilterPanel filters={activeFilters} onFiltersChange={mockOnFiltersChange} />
        </TestWrapper>,
      );

      const resetButton = screen.getByRole('button', { name: /reset/i });
      await user.click(resetButton);

      expect(mockOnFiltersChange).toHaveBeenCalledWith({
        kind: AssetKind.Creature, // Kind is preserved (controlled by parent Tabs)
        showMine: true,
        showOthers: true,
        showPublic: true,
        showPrivate: true,
        showPublished: true,
        showDraft: true,
      });
    });

    it('should preserve kind when resetting filters', async () => {
      const user = userEvent.setup();

      const filters: AssetFilters = {
        kind: AssetKind.Creature,
        showMine: false,
        showOthers: true,
        showPublic: true,
        showPrivate: true,
        showPublished: true,
        showDraft: true,
      };

      render(
        <TestWrapper>
          <AssetFilterPanel filters={filters} onFiltersChange={mockOnFiltersChange} />
        </TestWrapper>,
      );

      const resetButton = screen.getByRole('button', { name: /reset/i });
      await user.click(resetButton);

      expect(mockOnFiltersChange).toHaveBeenCalled();
      const calledFilters = mockOnFiltersChange.mock.calls[0]?.[0];
      expect(calledFilters).toBeDefined();
      expect(calledFilters?.kind).toBe(AssetKind.Creature);
    });
  });

  describe('conditional rendering logic', () => {
    it('should correctly detect active filters', () => {
      // Test case: Only default filters (no active filters)
      const { rerender } = render(
        <TestWrapper>
          <AssetFilterPanel filters={defaultFilters} onFiltersChange={mockOnFiltersChange} />
        </TestWrapper>,
      );

      expect(screen.queryByRole('button', { name: /reset/i })).not.toBeInTheDocument();

      // Test case: One filter changed (active filter)
      rerender(
        <TestWrapper>
          <AssetFilterPanel filters={{ ...defaultFilters, showMine: false }} onFiltersChange={mockOnFiltersChange} />
        </TestWrapper>,
      );

      expect(screen.getByRole('button', { name: /reset/i })).toBeInTheDocument();
    });
  });

  describe('checkbox state', () => {
    it('should reflect checked state of all checkboxes', () => {
      render(
        <TestWrapper>
          <AssetFilterPanel filters={defaultFilters} onFiltersChange={mockOnFiltersChange} />
        </TestWrapper>,
      );

      expect(screen.getByRole('checkbox', { name: /mine/i })).toBeChecked();
      expect(screen.getByRole('checkbox', { name: /others/i })).toBeChecked();
    });

    it('should reflect unchecked state when filters are disabled', () => {
      const filters: AssetFilters = {
        ...defaultFilters,
        showMine: false,
        showOthers: false,
      };

      render(
        <TestWrapper>
          <AssetFilterPanel filters={filters} onFiltersChange={mockOnFiltersChange} />
        </TestWrapper>,
      );

      expect(screen.getByRole('checkbox', { name: /mine/i })).not.toBeChecked();
      expect(screen.getByRole('checkbox', { name: /others/i })).not.toBeChecked();
    });
  });

  describe('theme support', () => {
    it('should render correctly in dark mode', () => {
      const darkTheme = createTheme({ palette: { mode: 'dark' } });

      render(
        <ThemeProvider theme={darkTheme}>
          <AssetFilterPanel filters={defaultFilters} onFiltersChange={mockOnFiltersChange} />
        </ThemeProvider>,
      );

      expect(screen.getByText('Filters')).toBeInTheDocument();
    });

    it('should render correctly in light mode', () => {
      const lightTheme = createTheme({ palette: { mode: 'light' } });

      render(
        <ThemeProvider theme={lightTheme}>
          <AssetFilterPanel filters={defaultFilters} onFiltersChange={mockOnFiltersChange} />
        </ThemeProvider>,
      );

      expect(screen.getByText('Filters')).toBeInTheDocument();
    });
  });
});
