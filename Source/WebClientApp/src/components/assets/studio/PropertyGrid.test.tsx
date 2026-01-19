import { createTheme, ThemeProvider } from '@mui/material/styles';
import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import type React from 'react';
import { beforeEach, describe, expect, it, vi } from 'vitest';
import { PropertyGrid } from './PropertyGrid';
import type { PropertyGridSection } from './PropertyGrid';

const TestWrapper: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const theme = createTheme({ palette: { mode: 'light' } });
  return <ThemeProvider theme={theme}>{children}</ThemeProvider>;
};
TestWrapper.displayName = 'TestWrapper';

describe('PropertyGrid', () => {
  const mockSections: PropertyGridSection[] = [
    {
      title: 'Core Stats',
      properties: [
        { key: 'HP', value: '100', type: 'number' },
        { key: 'AC', value: '15', type: 'number' },
      ],
    },
    {
      title: 'Abilities',
      properties: [
        { key: 'STR', value: '18', type: 'number' },
        { key: 'DEX', value: '14', type: 'number' },
      ],
    },
  ];

  let mockOnChange: ReturnType<typeof vi.fn<(sections: PropertyGridSection[]) => void>>;

  beforeEach(() => {
    mockOnChange = vi.fn();
  });

  describe('rendering', () => {
    it('should render all sections', () => {
      render(
        <TestWrapper>
          <PropertyGrid sections={mockSections} onChange={mockOnChange} />
        </TestWrapper>,
      );

      // Note: CSS textTransform: uppercase is applied, so text content is 'Core Stats' not 'CORE STATS'
      expect(screen.getByText('Core Stats')).toBeInTheDocument();
      expect(screen.getByText('Abilities')).toBeInTheDocument();
    });

    it('should render all properties in sections', () => {
      render(
        <TestWrapper>
          <PropertyGrid sections={mockSections} onChange={mockOnChange} />
        </TestWrapper>,
      );

      expect(screen.getByText('HP')).toBeInTheDocument();
      expect(screen.getByText('AC')).toBeInTheDocument();
      expect(screen.getByText('STR')).toBeInTheDocument();
      expect(screen.getByText('DEX')).toBeInTheDocument();
    });

    it('should render property values in text fields', () => {
      render(
        <TestWrapper>
          <PropertyGrid sections={mockSections} onChange={mockOnChange} />
        </TestWrapper>,
      );

      const hpValueField = screen.getByDisplayValue('100');
      const acValueField = screen.getByDisplayValue('15');

      expect(hpValueField).toBeInTheDocument();
      expect(acValueField).toBeInTheDocument();
    });

    it('should render sections as expanded by default', () => {
      render(
        <TestWrapper>
          <PropertyGrid sections={mockSections} onChange={mockOnChange} />
        </TestWrapper>,
      );

      expect(screen.getByText('HP')).toBeVisible();
      expect(screen.getByText('AC')).toBeVisible();
    });

    it('should render empty section message when no properties exist', () => {
      const emptySections: PropertyGridSection[] = [
        {
          title: 'Empty Section',
          properties: [],
        },
      ];

      render(
        <TestWrapper>
          <PropertyGrid sections={emptySections} onChange={mockOnChange} />
        </TestWrapper>,
      );

      expect(screen.getByText('No properties')).toBeInTheDocument();
    });
  });

  describe('section expand/collapse', () => {
    it('should collapse section when header is clicked', async () => {
      const user = userEvent.setup();

      render(
        <TestWrapper>
          <PropertyGrid sections={mockSections} onChange={mockOnChange} />
        </TestWrapper>,
      );

      const coreStatsHeader = screen.getByText('Core Stats');
      await user.click(coreStatsHeader);

      expect(screen.queryByText('HP')).not.toBeVisible();
    });

    it('should expand section when collapsed header is clicked', async () => {
      const user = userEvent.setup();

      render(
        <TestWrapper>
          <PropertyGrid sections={mockSections} onChange={mockOnChange} />
        </TestWrapper>,
      );

      const coreStatsHeader = screen.getByText('Core Stats');
      await user.click(coreStatsHeader);
      expect(screen.queryByText('HP')).not.toBeVisible();

      await user.click(coreStatsHeader);
      expect(screen.getByText('HP')).toBeVisible();
    });

    it('should toggle only the clicked section', async () => {
      const user = userEvent.setup();

      render(
        <TestWrapper>
          <PropertyGrid sections={mockSections} onChange={mockOnChange} />
        </TestWrapper>,
      );

      const coreStatsHeader = screen.getByText('Core Stats');
      await user.click(coreStatsHeader);

      expect(screen.queryByText('HP')).not.toBeVisible();
      expect(screen.getByText('STR')).toBeVisible();
    });
  });

  describe('property value editing', () => {
    it('should call onChange when property value is modified', async () => {
      const user = userEvent.setup();

      render(
        <TestWrapper>
          <PropertyGrid sections={mockSections} onChange={mockOnChange} />
        </TestWrapper>,
      );

      const hpField = screen.getByDisplayValue('100');
      await user.clear(hpField);
      await user.type(hpField, '150');

      expect(mockOnChange).toHaveBeenCalled();
      const updatedSections = mockOnChange.mock.calls[mockOnChange.mock.calls.length - 1]?.[0] ?? [];
      expect(updatedSections[0]?.properties[0]?.value).toBe('150');
    });

    it('should preserve other properties when one is modified', async () => {
      const user = userEvent.setup();

      render(
        <TestWrapper>
          <PropertyGrid sections={mockSections} onChange={mockOnChange} />
        </TestWrapper>,
      );

      const hpField = screen.getByDisplayValue('100');
      await user.clear(hpField);
      await user.type(hpField, '150');

      const updatedSections = mockOnChange.mock.calls[mockOnChange.mock.calls.length - 1]?.[0] ?? [];
      expect(updatedSections[0]?.properties[1]?.value).toBe('15');
    });

    it('should preserve other sections when property in one section is modified', async () => {
      const user = userEvent.setup();

      render(
        <TestWrapper>
          <PropertyGrid sections={mockSections} onChange={mockOnChange} />
        </TestWrapper>,
      );

      const hpField = screen.getByDisplayValue('100');
      await user.clear(hpField);
      await user.type(hpField, '150');

      const updatedSections = mockOnChange.mock.calls[mockOnChange.mock.calls.length - 1]?.[0] ?? [];
      expect(updatedSections[1]?.properties[0]?.value).toBe('18');
    });

    it('should render number input for number type properties', () => {
      render(
        <TestWrapper>
          <PropertyGrid sections={mockSections} onChange={mockOnChange} />
        </TestWrapper>,
      );

      const hpField = screen.getByDisplayValue('100');
      expect(hpField).toHaveAttribute('type', 'number');
    });

    it('should render text input for text type properties', () => {
      const textSections: PropertyGridSection[] = [
        {
          title: 'Details',
          properties: [{ key: 'Name', value: 'Goblin', type: 'text' }],
        },
      ];

      render(
        <TestWrapper>
          <PropertyGrid sections={textSections} onChange={mockOnChange} />
        </TestWrapper>,
      );

      const nameField = screen.getByDisplayValue('Goblin');
      expect(nameField).toHaveAttribute('type', 'text');
    });
  });

  describe('add property functionality', () => {
    it('should show add button when allowAddProperty is true', () => {
      render(
        <TestWrapper>
          <PropertyGrid sections={mockSections} onChange={mockOnChange} allowAddProperty />
        </TestWrapper>,
      );

      const addButtons = screen.getAllByRole('button');
      expect(addButtons.length).toBeGreaterThan(0);
    });

    it('should not show add button when allowAddProperty is false', () => {
      render(
        <TestWrapper>
          <PropertyGrid sections={mockSections} onChange={mockOnChange} allowAddProperty={false} />
        </TestWrapper>,
      );

      const addButtons = screen.queryAllByRole('button');
      expect(addButtons).toHaveLength(0);
    });

    it('should call onChange with new property when add button is clicked', async () => {
      const user = userEvent.setup();

      render(
        <TestWrapper>
          <PropertyGrid sections={mockSections} onChange={mockOnChange} allowAddProperty />
        </TestWrapper>,
      );

      const addButtons = screen.getAllByRole('button');
      await user.click(addButtons[0]!);

      expect(mockOnChange).toHaveBeenCalled();
      const updatedSections = mockOnChange.mock.calls[0]?.[0] ?? [];
      expect(updatedSections[0]?.properties).toHaveLength(3);
      expect(updatedSections[0]?.properties[2]?.key).toBe('New Property');
    });

    it('should add property to correct section', async () => {
      const user = userEvent.setup();

      render(
        <TestWrapper>
          <PropertyGrid sections={mockSections} onChange={mockOnChange} allowAddProperty />
        </TestWrapper>,
      );

      const addButtons = screen.getAllByRole('button');
      await user.click(addButtons[1]!);

      const updatedSections = mockOnChange.mock.calls[0]?.[0] ?? [];
      expect(updatedSections[1]?.properties).toHaveLength(3);
    });

    it('should not propagate click event to section header when add button is clicked', async () => {
      const user = userEvent.setup();

      render(
        <TestWrapper>
          <PropertyGrid sections={mockSections} onChange={mockOnChange} allowAddProperty />
        </TestWrapper>,
      );

      expect(screen.getByText('HP')).toBeVisible();

      const addButtons = screen.getAllByRole('button');
      await user.click(addButtons[0]!);

      expect(screen.getByText('HP')).toBeVisible();
    });
  });

  describe('remove property functionality', () => {
    it('should show delete button when allowRemoveProperty is true', () => {
      render(
        <TestWrapper>
          <PropertyGrid sections={mockSections} onChange={mockOnChange} allowRemoveProperty />
        </TestWrapper>,
      );

      const deleteButtons = screen.getAllByRole('button');
      expect(deleteButtons.length).toBeGreaterThan(0);
    });

    it('should not show delete button when allowRemoveProperty is false', () => {
      render(
        <TestWrapper>
          <PropertyGrid sections={mockSections} onChange={mockOnChange} allowRemoveProperty={false} />
        </TestWrapper>,
      );

      const deleteButtons = screen.queryAllByRole('button');
      expect(deleteButtons).toHaveLength(0);
    });

    it('should call onChange with property removed when delete button is clicked', async () => {
      const user = userEvent.setup();

      render(
        <TestWrapper>
          <PropertyGrid sections={mockSections} onChange={mockOnChange} allowRemoveProperty />
        </TestWrapper>,
      );

      const deleteButtons = screen.getAllByRole('button');
      await user.click(deleteButtons[0]!);

      expect(mockOnChange).toHaveBeenCalled();
      const updatedSections = mockOnChange.mock.calls[0]?.[0] ?? [];
      expect(updatedSections[0]?.properties).toHaveLength(1);
      expect(updatedSections[0]?.properties[0]?.key).toBe('AC');
    });

    it('should preserve other sections when removing property', async () => {
      const user = userEvent.setup();

      render(
        <TestWrapper>
          <PropertyGrid sections={mockSections} onChange={mockOnChange} allowRemoveProperty />
        </TestWrapper>,
      );

      const deleteButtons = screen.getAllByRole('button');
      await user.click(deleteButtons[0]!);

      const updatedSections = mockOnChange.mock.calls[0]?.[0] ?? [];
      expect(updatedSections[1]?.properties).toHaveLength(2);
    });
  });

  describe('combined add and remove functionality', () => {
    it('should show both add and delete buttons when both flags are true', () => {
      render(
        <TestWrapper>
          <PropertyGrid sections={mockSections} onChange={mockOnChange} allowAddProperty allowRemoveProperty />
        </TestWrapper>,
      );

      const buttons = screen.getAllByRole('button');
      expect(buttons.length).toBeGreaterThan(4);
    });

    it('should add and remove properties independently', async () => {
      const user = userEvent.setup();

      render(
        <TestWrapper>
          <PropertyGrid sections={mockSections} onChange={mockOnChange} allowAddProperty allowRemoveProperty />
        </TestWrapper>,
      );

      const initialButtons = screen.getAllByRole('button');
      await user.click(initialButtons[0]!);

      let updatedSections = mockOnChange.mock.calls[0]?.[0] ?? [];
      expect(updatedSections[0]?.properties).toHaveLength(3);

      render(
        <TestWrapper>
          <PropertyGrid sections={updatedSections} onChange={mockOnChange} allowAddProperty allowRemoveProperty />
        </TestWrapper>,
      );

      const deleteButtons = screen.getAllByRole('button');
      await user.click(deleteButtons[deleteButtons.length - 1]!);

      updatedSections = mockOnChange.mock.calls[mockOnChange.mock.calls.length - 1]?.[0] ?? [];
      expect(updatedSections[0]?.properties).toHaveLength(2);
    });
  });

  describe('theme support', () => {
    it('should render correctly in dark mode', () => {
      const darkTheme = createTheme({ palette: { mode: 'dark' } });

      render(
        <ThemeProvider theme={darkTheme}>
          <PropertyGrid sections={mockSections} onChange={mockOnChange} />
        </ThemeProvider>,
      );

      expect(screen.getByText('Core Stats')).toBeInTheDocument();
    });

    it('should render correctly in light mode', () => {
      const lightTheme = createTheme({ palette: { mode: 'light' } });

      render(
        <ThemeProvider theme={lightTheme}>
          <PropertyGrid sections={mockSections} onChange={mockOnChange} />
        </ThemeProvider>,
      );

      expect(screen.getByText('Core Stats')).toBeInTheDocument();
    });
  });

  describe('edge cases', () => {
    it('should handle empty sections array', () => {
      render(
        <TestWrapper>
          <PropertyGrid sections={[]} onChange={mockOnChange} />
        </TestWrapper>,
      );

      expect(screen.queryByText('Core Stats')).not.toBeInTheDocument();
    });

    it('should handle section with single property', () => {
      const singlePropertySection: PropertyGridSection[] = [
        {
          title: 'Single',
          properties: [{ key: 'HP', value: '100', type: 'number' }],
        },
      ];

      render(
        <TestWrapper>
          <PropertyGrid sections={singlePropertySection} onChange={mockOnChange} />
        </TestWrapper>,
      );

      expect(screen.getByText('HP')).toBeInTheDocument();
    });

    it('should handle property with empty value', () => {
      const emptyValueSection: PropertyGridSection[] = [
        {
          title: 'Empty',
          properties: [{ key: 'HP', value: '', type: 'number' }],
        },
      ];

      render(
        <TestWrapper>
          <PropertyGrid sections={emptyValueSection} onChange={mockOnChange} />
        </TestWrapper>,
      );

      const hpField = screen.getByDisplayValue('');
      expect(hpField).toBeInTheDocument();
    });

    it('should handle removing the last property from a section', async () => {
      const user = userEvent.setup();

      const singlePropertySection: PropertyGridSection[] = [
        {
          title: 'Single',
          properties: [{ key: 'HP', value: '100', type: 'number' }],
        },
      ];

      render(
        <TestWrapper>
          <PropertyGrid sections={singlePropertySection} onChange={mockOnChange} allowRemoveProperty />
        </TestWrapper>,
      );

      const deleteButton = screen.getByRole('button');
      await user.click(deleteButton);

      const updatedSections = mockOnChange.mock.calls[0]?.[0] ?? [];
      expect(updatedSections[0]?.properties).toHaveLength(0);
    });
  });

  describe('layout and styling', () => {
    it('should have border around the grid', () => {
      render(
        <TestWrapper>
          <PropertyGrid sections={mockSections} onChange={mockOnChange} />
        </TestWrapper>,
      );

      const gridRoot = screen.getByRole('group', { name: /property grid/i });
      const styles = window.getComputedStyle(gridRoot);
      expect(styles.borderRadius).toBeTruthy();
    });

    it('should uppercase section titles via CSS', () => {
      render(
        <TestWrapper>
          <PropertyGrid sections={mockSections} onChange={mockOnChange} />
        </TestWrapper>,
      );

      // CSS textTransform: uppercase is applied, so we check the raw text content
      const sectionTitle = screen.getByText('Core Stats');
      expect(sectionTitle).toBeInTheDocument();
      // The uppercase styling is applied via CSS textTransform
      const styles = window.getComputedStyle(sectionTitle);
      expect(styles.textTransform).toBe('uppercase');
    });
  });
});
