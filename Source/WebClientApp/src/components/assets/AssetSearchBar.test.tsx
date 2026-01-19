import { createTheme, ThemeProvider } from '@mui/material/styles';
import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import React from 'react';
import { beforeEach, describe, expect, it, vi } from 'vitest';
import { AssetSearchBar, type AssetSearchBarProps } from './AssetSearchBar';

const TestWrapper: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const theme = createTheme({ palette: { mode: 'light' } });
  return <ThemeProvider theme={theme}>{children}</ThemeProvider>;
};
TestWrapper.displayName = 'TestWrapper';

describe('AssetSearchBar', () => {
  const defaultProps: AssetSearchBarProps = {
    value: '',
    onChange: vi.fn<(value: string) => void>(),
    placeholder: 'Search assets by name or description...',
    fullWidth: false,
  };

  beforeEach(() => {
    vi.clearAllMocks();
  });

  describe('rendering', () => {
    it('should render search input field', () => {
      render(
        <TestWrapper>
          <AssetSearchBar {...defaultProps} />
        </TestWrapper>,
      );

      expect(screen.getByPlaceholderText('Search assets by name or description...')).toBeInTheDocument();
    });

    it('should render with custom placeholder', () => {
      render(
        <TestWrapper>
          <AssetSearchBar {...defaultProps} placeholder='Custom search placeholder' />
        </TestWrapper>,
      );

      expect(screen.getByPlaceholderText('Custom search placeholder')).toBeInTheDocument();
    });

    it('should display search icon', () => {
      render(
        <TestWrapper>
          <AssetSearchBar {...defaultProps} />
        </TestWrapper>,
      );

      const searchIcon = screen.getByRole('img', { name: 'Search' });
      expect(searchIcon).toBeInTheDocument();
    });

    it('should not display clear button when value is empty', () => {
      render(
        <TestWrapper>
          <AssetSearchBar {...defaultProps} value='' />
        </TestWrapper>,
      );

      expect(screen.queryByRole('button', { name: /clear search/i })).not.toBeInTheDocument();
    });

    it('should display clear button when value is not empty', () => {
      render(
        <TestWrapper>
          <AssetSearchBar {...defaultProps} value='test search' />
        </TestWrapper>,
      );

      expect(screen.getByRole('button', { name: /clear search/i })).toBeInTheDocument();
    });

    it('should display current search value', () => {
      render(
        <TestWrapper>
          <AssetSearchBar {...defaultProps} value='goblin' />
        </TestWrapper>,
      );

      expect(screen.getByDisplayValue('goblin')).toBeInTheDocument();
    });
  });

  describe('user interactions', () => {
    it('should call onChange when user types in search field', async () => {
      const user = userEvent.setup();
      const onChange = vi.fn<(value: string) => void>();

      render(
        <TestWrapper>
          <AssetSearchBar {...defaultProps} onChange={onChange} />
        </TestWrapper>,
      );

      const searchInput = screen.getByPlaceholderText('Search assets by name or description...');
      await user.type(searchInput, 'dragon');

      expect(onChange).toHaveBeenCalled();
      const lastCall = onChange.mock.calls[onChange.mock.calls.length - 1];
      expect(lastCall?.[0]).toBe('dragon');
    });

    it('should call onChange with empty string when clear button is clicked', async () => {
      const user = userEvent.setup();
      const onChange = vi.fn<(value: string) => void>();

      render(
        <TestWrapper>
          <AssetSearchBar {...defaultProps} value='test' onChange={onChange} />
        </TestWrapper>,
      );

      const clearButton = screen.getByRole('button', { name: /clear search/i });
      await user.click(clearButton);

      expect(onChange).toHaveBeenCalledWith('');
    });

    it('should handle multiple character inputs', async () => {
      const user = userEvent.setup();
      const onChange = vi.fn<(value: string) => void>();

      render(
        <TestWrapper>
          <AssetSearchBar {...defaultProps} onChange={onChange} />
        </TestWrapper>,
      );

      const searchInput = screen.getByPlaceholderText('Search assets by name or description...');
      await user.type(searchInput, 'abc');

      expect(onChange).toHaveBeenCalledTimes(3);
      expect(onChange).toHaveBeenNthCalledWith(1, 'a');
      expect(onChange).toHaveBeenNthCalledWith(2, 'ab');
      expect(onChange).toHaveBeenNthCalledWith(3, 'abc');
    });
  });

  describe('fullWidth prop', () => {
    it('should apply fullWidth when prop is true', () => {
      // Arrange & Act
      render(
        <TestWrapper>
          <AssetSearchBar {...defaultProps} fullWidth={true} />
        </TestWrapper>,
      );

      // Assert - Get textbox and verify parent FormControl has fullWidth class
      const textbox = screen.getByRole('textbox');
      const formControl = textbox.closest('.MuiFormControl-root');
      expect(formControl).toHaveClass('MuiFormControl-fullWidth');
    });

    it('should not apply fullWidth when prop is false', () => {
      // Arrange & Act
      render(
        <TestWrapper>
          <AssetSearchBar {...defaultProps} fullWidth={false} />
        </TestWrapper>,
      );

      // Assert - Get textbox and verify parent FormControl does not have fullWidth class
      const textbox = screen.getByRole('textbox');
      const formControl = textbox.closest('.MuiFormControl-root');
      expect(formControl).not.toHaveClass('MuiFormControl-fullWidth');
    });
  });

  describe('clear functionality', () => {
    it('should clear input and hide clear button after clicking clear', async () => {
      const user = userEvent.setup();
      const onChange = vi.fn<(value: string) => void>();

      const { rerender } = render(
        <TestWrapper>
          <AssetSearchBar {...defaultProps} value='test' onChange={onChange} />
        </TestWrapper>,
      );

      const clearButton = screen.getByRole('button', { name: /clear search/i });
      await user.click(clearButton);

      rerender(
        <TestWrapper>
          <AssetSearchBar {...defaultProps} value='' onChange={onChange} />
        </TestWrapper>,
      );

      expect(screen.queryByRole('button', { name: /clear search/i })).not.toBeInTheDocument();
    });
  });

  describe('theme support', () => {
    it('should render correctly in dark mode', () => {
      const darkTheme = createTheme({ palette: { mode: 'dark' } });

      render(
        <ThemeProvider theme={darkTheme}>
          <AssetSearchBar {...defaultProps} />
        </ThemeProvider>,
      );

      expect(screen.getByPlaceholderText('Search assets by name or description...')).toBeInTheDocument();
    });

    it('should render correctly in light mode', () => {
      const lightTheme = createTheme({ palette: { mode: 'light' } });

      render(
        <ThemeProvider theme={lightTheme}>
          <AssetSearchBar {...defaultProps} />
        </ThemeProvider>,
      );

      expect(screen.getByPlaceholderText('Search assets by name or description...')).toBeInTheDocument();
    });
  });

  describe('accessibility', () => {
    it('should have proper aria-label for clear button', () => {
      render(
        <TestWrapper>
          <AssetSearchBar {...defaultProps} value='test' />
        </TestWrapper>,
      );

      const clearButton = screen.getByRole('button', { name: /clear search/i });
      expect(clearButton).toHaveAttribute('aria-label', 'clear search');
    });
  });
});
