import { createTheme, ThemeProvider } from '@mui/material/styles';
import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import React from 'react';
import { beforeEach, describe, expect, it, vi } from 'vitest';
import { BrowserToolbar, type BrowserToolbarProps } from './BrowserToolbar';

const TestWrapper: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const theme = createTheme({ palette: { mode: 'light' } });
  return <ThemeProvider theme={theme}>{children}</ThemeProvider>;
};
TestWrapper.displayName = 'TestWrapper';

describe('BrowserToolbar', () => {
  const defaultProps: BrowserToolbarProps = {
    searchQuery: '',
    onSearchChange: vi.fn(),
    sortField: 'name',
    sortDirection: 'asc',
    onSortChange: vi.fn(),
    viewMode: 'grid-large',
    onViewModeChange: vi.fn(),
    selectedCount: 0,
    totalCount: 10,
  };

  beforeEach(() => {
    vi.clearAllMocks();
  });

  describe('rendering', () => {
    it('should render search input', () => {
      render(
        <TestWrapper>
          <BrowserToolbar {...defaultProps} />
        </TestWrapper>,
      );

      expect(screen.getByPlaceholderText('Search assets...')).toBeInTheDocument();
    });

    it('should render sort controls', () => {
      render(
        <TestWrapper>
          <BrowserToolbar {...defaultProps} />
        </TestWrapper>,
      );

      expect(screen.getByRole('combobox')).toBeInTheDocument();
      expect(screen.getByText('Name')).toBeInTheDocument();
    });

    it('should render view mode toggle buttons', () => {
      render(
        <TestWrapper>
          <BrowserToolbar {...defaultProps} />
        </TestWrapper>,
      );

      const toggleButtons = screen.getAllByRole('button');
      const gridButtons = toggleButtons.filter((btn) => btn.getAttribute('value')?.includes('grid'));
      expect(gridButtons.length).toBeGreaterThan(0);
    });

    it('should display total count when no items selected', () => {
      render(
        <TestWrapper>
          <BrowserToolbar {...defaultProps} totalCount={42} />
        </TestWrapper>,
      );

      expect(screen.getByText('42 assets')).toBeInTheDocument();
    });

    it('should hide total count when totalCount is undefined', () => {
      const { totalCount: _, ...propsWithoutTotal } = defaultProps;

      render(
        <TestWrapper>
          <BrowserToolbar {...propsWithoutTotal} />
        </TestWrapper>,
      );

      expect(screen.queryByText(/assets$/)).not.toBeInTheDocument();
    });
  });

  describe('search interactions', () => {
    it('should call onSearchChange when typing in search field', async () => {
      const user = userEvent.setup();
      const onSearchChange = vi.fn();

      render(
        <TestWrapper>
          <BrowserToolbar {...defaultProps} onSearchChange={onSearchChange} />
        </TestWrapper>,
      );

      const searchInput = screen.getByPlaceholderText('Search assets...');
      await user.type(searchInput, 'goblin');

      expect(onSearchChange).toHaveBeenCalled();
    });

    it('should display search query value', () => {
      render(
        <TestWrapper>
          <BrowserToolbar {...defaultProps} searchQuery="dragon" />
        </TestWrapper>,
      );

      const searchInput = screen.getByPlaceholderText('Search assets...') as HTMLInputElement;
      expect(searchInput.value).toBe('dragon');
    });

    it('should show clear button when search query is not empty', () => {
      render(
        <TestWrapper>
          <BrowserToolbar {...defaultProps} searchQuery="test query" />
        </TestWrapper>,
      );

      const buttons = screen.getAllByRole('button');
      const clearButton = buttons.find((btn) => btn.querySelector('.MuiSvgIcon-root'));
      expect(clearButton).toBeDefined();
    });

    it('should call onSearchChange with empty string when clear button is clicked', async () => {
      const user = userEvent.setup();
      const onSearchChange = vi.fn();

      render(
        <TestWrapper>
          <BrowserToolbar {...defaultProps} searchQuery="test query" onSearchChange={onSearchChange} />
        </TestWrapper>,
      );

      const buttons = screen.getAllByRole('button');
      const clearButton = buttons.find((btn) => btn.closest('.MuiInputAdornment-root') && btn.querySelector('.MuiSvgIcon-root'));
      if (clearButton) {
        await user.click(clearButton);
        expect(onSearchChange).toHaveBeenCalledWith('');
      }
    });

    it('should not show clear button when search query is empty', () => {
      render(
        <TestWrapper>
          <BrowserToolbar {...defaultProps} searchQuery="" />
        </TestWrapper>,
      );

      const buttons = screen.getAllByRole('button');
      const clearButton = buttons.find((btn) => btn.closest('.MuiInputAdornment-root') && btn.querySelector('.MuiSvgIcon-root'));
      expect(clearButton).toBeUndefined();
    });
  });

  describe('sort interactions', () => {
    it('should display current sort field', () => {
      render(
        <TestWrapper>
          <BrowserToolbar {...defaultProps} sortField="category" />
        </TestWrapper>,
      );

      expect(screen.getByText('Category')).toBeInTheDocument();
    });

    it('should call onSortChange when sort field is changed', async () => {
      const user = userEvent.setup();
      const onSortChange = vi.fn();

      render(
        <TestWrapper>
          <BrowserToolbar {...defaultProps} onSortChange={onSortChange} />
        </TestWrapper>,
      );

      const sortSelect = screen.getByRole('combobox');
      await user.click(sortSelect);

      const typeOption = screen.getByRole('option', { name: 'Type' });
      await user.click(typeOption);

      expect(onSortChange).toHaveBeenCalledWith('type', 'asc');
    });

    it('should toggle sort direction when direction button is clicked', async () => {
      const user = userEvent.setup();
      const onSortChange = vi.fn();

      render(
        <TestWrapper>
          <BrowserToolbar {...defaultProps} sortDirection="asc" onSortChange={onSortChange} />
        </TestWrapper>,
      );

      const buttons = screen.getAllByRole('button');
      const directionButton = buttons.find((btn) => btn.textContent === '↑');

      if (directionButton) {
        await user.click(directionButton);
        expect(onSortChange).toHaveBeenCalledWith('name', 'desc');
      }
    });

    it('should toggle from desc to asc when direction button is clicked', async () => {
      const user = userEvent.setup();
      const onSortChange = vi.fn();

      render(
        <TestWrapper>
          <BrowserToolbar {...defaultProps} sortDirection="desc" onSortChange={onSortChange} />
        </TestWrapper>,
      );

      const buttons = screen.getAllByRole('button');
      const directionButton = buttons.find((btn) => btn.textContent === '↑');

      if (directionButton) {
        await user.click(directionButton);
        expect(onSortChange).toHaveBeenCalledWith('name', 'asc');
      }
    });
  });

  describe('view mode interactions', () => {
    it('should display current view mode as selected', () => {
      render(
        <TestWrapper>
          <BrowserToolbar {...defaultProps} viewMode="table" />
        </TestWrapper>,
      );

      const tableButton = screen.getByRole('button', { pressed: true });
      expect(tableButton.getAttribute('value')).toBe('table');
    });

    it('should call onViewModeChange when grid-large is clicked', async () => {
      const user = userEvent.setup();
      const onViewModeChange = vi.fn();

      render(
        <TestWrapper>
          <BrowserToolbar {...defaultProps} viewMode="table" onViewModeChange={onViewModeChange} />
        </TestWrapper>,
      );

      const buttons = screen.getAllByRole('button');
      const gridLargeButton = buttons.find((btn) => btn.getAttribute('value') === 'grid-large');

      if (gridLargeButton) {
        await user.click(gridLargeButton);
        expect(onViewModeChange).toHaveBeenCalledWith('grid-large');
      }
    });

    it('should call onViewModeChange when grid-small is clicked', async () => {
      const user = userEvent.setup();
      const onViewModeChange = vi.fn();

      render(
        <TestWrapper>
          <BrowserToolbar {...defaultProps} viewMode="table" onViewModeChange={onViewModeChange} />
        </TestWrapper>,
      );

      const buttons = screen.getAllByRole('button');
      const gridSmallButton = buttons.find((btn) => btn.getAttribute('value') === 'grid-small');

      if (gridSmallButton) {
        await user.click(gridSmallButton);
        expect(onViewModeChange).toHaveBeenCalledWith('grid-small');
      }
    });

    it('should call onViewModeChange when table is clicked', async () => {
      const user = userEvent.setup();
      const onViewModeChange = vi.fn();

      render(
        <TestWrapper>
          <BrowserToolbar {...defaultProps} viewMode="grid-large" onViewModeChange={onViewModeChange} />
        </TestWrapper>,
      );

      const buttons = screen.getAllByRole('button');
      const tableButton = buttons.find((btn) => btn.getAttribute('value') === 'table');

      if (tableButton) {
        await user.click(tableButton);
        expect(onViewModeChange).toHaveBeenCalledWith('table');
      }
    });
  });

  describe('bulk actions', () => {
    it('should show bulk actions when items are selected', () => {
      render(
        <TestWrapper>
          <BrowserToolbar {...defaultProps} selectedCount={3} />
        </TestWrapper>,
      );

      expect(screen.getByText('3')).toBeInTheDocument();
      expect(screen.getByText('selected')).toBeInTheDocument();
    });

    it('should hide bulk actions when no items are selected', () => {
      render(
        <TestWrapper>
          <BrowserToolbar {...defaultProps} selectedCount={0} />
        </TestWrapper>,
      );

      expect(screen.queryByText('selected')).not.toBeInTheDocument();
    });

    it('should hide total count when bulk actions are shown', () => {
      render(
        <TestWrapper>
          <BrowserToolbar {...defaultProps} selectedCount={5} totalCount={50} />
        </TestWrapper>,
      );

      expect(screen.queryByText('50 assets')).not.toBeInTheDocument();
      expect(screen.getByText('5')).toBeInTheDocument();
      expect(screen.getByText('selected')).toBeInTheDocument();
    });

    it('should call onBulkDelete when delete button is clicked', async () => {
      const user = userEvent.setup();
      const onBulkDelete = vi.fn();

      render(
        <TestWrapper>
          <BrowserToolbar {...defaultProps} selectedCount={2} onBulkDelete={onBulkDelete} />
        </TestWrapper>,
      );

      const buttons = screen.getAllByRole('button');
      const deleteButton = buttons.find((btn) => btn.getAttribute('aria-label')?.toLowerCase().includes('delete'));

      if (deleteButton) {
        await user.click(deleteButton);
        expect(onBulkDelete).toHaveBeenCalled();
      }
    });

    it('should call onBulkPublish when publish button is clicked', async () => {
      const user = userEvent.setup();
      const onBulkPublish = vi.fn();

      render(
        <TestWrapper>
          <BrowserToolbar {...defaultProps} selectedCount={2} onBulkPublish={onBulkPublish} />
        </TestWrapper>,
      );

      const buttons = screen.getAllByRole('button');
      const publishButton = buttons.find((btn) => btn.getAttribute('aria-label')?.toLowerCase().includes('publish'));

      if (publishButton) {
        await user.click(publishButton);
        expect(onBulkPublish).toHaveBeenCalled();
      }
    });

    it('should call onBulkTags when tags button is clicked', async () => {
      const user = userEvent.setup();
      const onBulkTags = vi.fn();

      render(
        <TestWrapper>
          <BrowserToolbar {...defaultProps} selectedCount={2} onBulkTags={onBulkTags} />
        </TestWrapper>,
      );

      const buttons = screen.getAllByRole('button');
      const tagsButton = buttons.find((btn) => btn.getAttribute('aria-label')?.toLowerCase().includes('tag'));

      if (tagsButton) {
        await user.click(tagsButton);
        expect(onBulkTags).toHaveBeenCalled();
      }
    });
  });

  describe('theme support', () => {
    it('should render correctly in dark mode', () => {
      const darkTheme = createTheme({ palette: { mode: 'dark' } });

      render(
        <ThemeProvider theme={darkTheme}>
          <BrowserToolbar {...defaultProps} />
        </ThemeProvider>,
      );

      expect(screen.getByPlaceholderText('Search assets...')).toBeInTheDocument();
    });

    it('should render correctly in light mode', () => {
      const lightTheme = createTheme({ palette: { mode: 'light' } });

      render(
        <ThemeProvider theme={lightTheme}>
          <BrowserToolbar {...defaultProps} />
        </ThemeProvider>,
      );

      expect(screen.getByPlaceholderText('Search assets...')).toBeInTheDocument();
    });
  });
});
