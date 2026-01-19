import { createTheme, ThemeProvider } from '@mui/material/styles';
import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import type React from 'react';
import { beforeEach, describe, expect, it, type Mock, vi } from 'vitest';
import { StatValueType } from '@/types/domain';
import { DataPanel } from './DataPanel';
import type { StatBlockValue } from '@/types/domain';
import type { PropertyGridSection } from './PropertyGrid';

vi.mock('./PropertyGrid', () => ({
  PropertyGrid: ({ sections, onChange }: { sections: PropertyGridSection[]; onChange: (s: PropertyGridSection[]) => void }) => (
    <div data-mock="property-grid" role="region" aria-label="Property Grid">
      {sections.map((section) => (
        <section key={section.title} aria-labelledby={`section-heading-${section.title.replace(/\s+/g, '-')}`}>
          <h3 id={`section-heading-${section.title.replace(/\s+/g, '-')}`}>{section.title}</h3>
          {section.properties.map((prop) => (
            <div key={prop.key} role="listitem" aria-label={`Property ${prop.key}`}>
              {prop.key}: {prop.value}
            </div>
          ))}
          <button onClick={() => onChange([...sections, { title: 'New Section', properties: [] }])}>
            Add Section
          </button>
        </section>
      ))}
    </div>
  ),
}));

const TestWrapper: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const theme = createTheme({ palette: { mode: 'light' } });
  return <ThemeProvider theme={theme}>{children}</ThemeProvider>;
};
TestWrapper.displayName = 'TestWrapper';

describe('DataPanel', () => {
  let mockOnChange: Mock<(statBlocks: Record<number, Record<string, StatBlockValue>>) => void>;

  beforeEach(() => {
    mockOnChange = vi.fn();
  });

  describe('rendering', () => {
    it('should render Stat Block header', () => {
      const statBlocks: Record<number, Record<string, StatBlockValue>> = {
        0: {},
      };

      render(
        <TestWrapper>
          <DataPanel statBlocks={statBlocks} onChange={mockOnChange} />
        </TestWrapper>,
      );

      expect(screen.getByText('Stat Block')).toBeInTheDocument();
    });

    it('should render PropertyGrid component', () => {
      const statBlocks: Record<number, Record<string, StatBlockValue>> = {
        0: {},
      };

      render(
        <TestWrapper>
          <DataPanel statBlocks={statBlocks} onChange={mockOnChange} />
        </TestWrapper>,
      );

      expect(screen.getByRole('region', { name: 'Property Grid' })).toBeInTheDocument();
    });

    it('should not render tabs when only one level exists', () => {
      const statBlocks: Record<number, Record<string, StatBlockValue>> = {
        0: {
          HP: { key: 'HP', value: '100', type: StatValueType.Number },
        },
      };

      render(
        <TestWrapper>
          <DataPanel statBlocks={statBlocks} onChange={mockOnChange} />
        </TestWrapper>,
      );

      expect(screen.queryByRole('tablist')).not.toBeInTheDocument();
    });

    it('should render tabs when multiple levels exist', () => {
      const statBlocks: Record<number, Record<string, StatBlockValue>> = {
        0: {
          HP: { key: 'HP', value: '100', type: StatValueType.Number },
        },
        5: {
          HP: { key: 'HP', value: '150', type: StatValueType.Number },
        },
        10: {
          HP: { key: 'HP', value: '200', type: StatValueType.Number },
        },
      };

      render(
        <TestWrapper>
          <DataPanel statBlocks={statBlocks} onChange={mockOnChange} />
        </TestWrapper>,
      );

      expect(screen.getByRole('tablist')).toBeInTheDocument();
      expect(screen.getByRole('tab', { name: 'Level 0' })).toBeInTheDocument();
      expect(screen.getByRole('tab', { name: 'Level 5' })).toBeInTheDocument();
      expect(screen.getByRole('tab', { name: 'Level 10' })).toBeInTheDocument();
    });
  });

  describe('stat block organization', () => {
    it('should organize core stats into Core Stats section', () => {
      const statBlocks: Record<number, Record<string, StatBlockValue>> = {
        0: {
          HP: { key: 'HP', value: '100', type: StatValueType.Number },
          AC: { key: 'AC', value: '15', type: StatValueType.Number },
          CR: { key: 'CR', value: '5', type: StatValueType.Number },
        },
      };

      render(
        <TestWrapper>
          <DataPanel statBlocks={statBlocks} onChange={mockOnChange} />
        </TestWrapper>,
      );

      expect(screen.getByRole('heading', { name: 'Core Stats' })).toBeInTheDocument();
      expect(screen.getByRole('listitem', { name: 'Property HP' })).toHaveTextContent('HP: 100');
      expect(screen.getByRole('listitem', { name: 'Property AC' })).toHaveTextContent('AC: 15');
      expect(screen.getByRole('listitem', { name: 'Property CR' })).toHaveTextContent('CR: 5');
    });

    it('should organize ability scores into Ability Scores section', () => {
      const statBlocks: Record<number, Record<string, StatBlockValue>> = {
        0: {
          STR: { key: 'STR', value: '18', type: StatValueType.Number },
          DEX: { key: 'DEX', value: '14', type: StatValueType.Number },
          CON: { key: 'CON', value: '16', type: StatValueType.Number },
        },
      };

      render(
        <TestWrapper>
          <DataPanel statBlocks={statBlocks} onChange={mockOnChange} />
        </TestWrapper>,
      );

      expect(screen.getByRole('heading', { name: 'Ability Scores' })).toBeInTheDocument();
      expect(screen.getByRole('listitem', { name: 'Property STR' })).toHaveTextContent('STR: 18');
      expect(screen.getByRole('listitem', { name: 'Property DEX' })).toHaveTextContent('DEX: 14');
      expect(screen.getByRole('listitem', { name: 'Property CON' })).toHaveTextContent('CON: 16');
    });

    it('should organize other stats into Other section', () => {
      const statBlocks: Record<number, Record<string, StatBlockValue>> = {
        0: {
          Proficiency: { key: 'Proficiency', value: '+3', type: StatValueType.Text },
          Languages: { key: 'Languages', value: 'Common, Elvish', type: StatValueType.Text },
        },
      };

      render(
        <TestWrapper>
          <DataPanel statBlocks={statBlocks} onChange={mockOnChange} />
        </TestWrapper>,
      );

      expect(screen.getByRole('heading', { name: 'Other' })).toBeInTheDocument();
      expect(screen.getByRole('listitem', { name: 'Property Proficiency' })).toHaveTextContent('Proficiency: +3');
      expect(screen.getByRole('listitem', { name: 'Property Languages' })).toHaveTextContent('Languages: Common, Elvish');
    });

    it('should create Stats section when stat block is empty', () => {
      const statBlocks: Record<number, Record<string, StatBlockValue>> = {
        0: {},
      };

      render(
        <TestWrapper>
          <DataPanel statBlocks={statBlocks} onChange={mockOnChange} />
        </TestWrapper>,
      );

      expect(screen.getByRole('heading', { name: 'Stats' })).toBeInTheDocument();
    });

    it('should organize mixed stats into correct sections', () => {
      const statBlocks: Record<number, Record<string, StatBlockValue>> = {
        0: {
          HP: { key: 'HP', value: '100', type: StatValueType.Number },
          STR: { key: 'STR', value: '18', type: StatValueType.Number },
          Proficiency: { key: 'Proficiency', value: '+3', type: StatValueType.Text },
        },
      };

      render(
        <TestWrapper>
          <DataPanel statBlocks={statBlocks} onChange={mockOnChange} />
        </TestWrapper>,
      );

      expect(screen.getByRole('heading', { name: 'Core Stats' })).toBeInTheDocument();
      expect(screen.getByRole('heading', { name: 'Ability Scores' })).toBeInTheDocument();
      expect(screen.getByRole('heading', { name: 'Other' })).toBeInTheDocument();
    });
  });

  describe('level tab interactions', () => {
    it('should switch to different level when tab is clicked', async () => {
      const user = userEvent.setup();

      const statBlocks: Record<number, Record<string, StatBlockValue>> = {
        0: {
          HP: { key: 'HP', value: '100', type: StatValueType.Number },
        },
        5: {
          HP: { key: 'HP', value: '150', type: StatValueType.Number },
        },
      };

      render(
        <TestWrapper>
          <DataPanel statBlocks={statBlocks} onChange={mockOnChange} />
        </TestWrapper>,
      );

      expect(screen.getByRole('listitem', { name: 'Property HP' })).toHaveTextContent('HP: 100');

      const level5Tab = screen.getByRole('tab', { name: 'Level 5' });
      await user.click(level5Tab);

      expect(screen.getByRole('listitem', { name: 'Property HP' })).toHaveTextContent('HP: 150');
    });

    it('should default to first level when component mounts', () => {
      const statBlocks: Record<number, Record<string, StatBlockValue>> = {
        5: {
          HP: { key: 'HP', value: '150', type: StatValueType.Number },
        },
        10: {
          HP: { key: 'HP', value: '200', type: StatValueType.Number },
        },
      };

      render(
        <TestWrapper>
          <DataPanel statBlocks={statBlocks} onChange={mockOnChange} />
        </TestWrapper>,
      );

      expect(screen.getByRole('listitem', { name: 'Property HP' })).toHaveTextContent('HP: 150');
    });

    it('should sort levels numerically', () => {
      const statBlocks: Record<number, Record<string, StatBlockValue>> = {
        10: {
          HP: { key: 'HP', value: '200', type: StatValueType.Number },
        },
        0: {
          HP: { key: 'HP', value: '100', type: StatValueType.Number },
        },
        5: {
          HP: { key: 'HP', value: '150', type: StatValueType.Number },
        },
      };

      render(
        <TestWrapper>
          <DataPanel statBlocks={statBlocks} onChange={mockOnChange} />
        </TestWrapper>,
      );

      const tabs = screen.getAllByRole('tab');
      expect(tabs[0]).toHaveTextContent('Level 0');
      expect(tabs[1]).toHaveTextContent('Level 5');
      expect(tabs[2]).toHaveTextContent('Level 10');
    });
  });

  describe('stat block updates', () => {
    it('should call onChange when PropertyGrid is modified', async () => {
      const user = userEvent.setup();

      const statBlocks: Record<number, Record<string, StatBlockValue>> = {
        0: {
          HP: { key: 'HP', value: '100', type: StatValueType.Number },
        },
      };

      render(
        <TestWrapper>
          <DataPanel statBlocks={statBlocks} onChange={mockOnChange} />
        </TestWrapper>,
      );

      const addButton = screen.getByText('Add Section');
      await user.click(addButton);

      expect(mockOnChange).toHaveBeenCalled();
    });

    it('should preserve other levels when updating one level', async () => {
      const user = userEvent.setup();

      const statBlocks: Record<number, Record<string, StatBlockValue>> = {
        0: {
          HP: { key: 'HP', value: '100', type: StatValueType.Number },
        },
        5: {
          HP: { key: 'HP', value: '150', type: StatValueType.Number },
        },
      };

      render(
        <TestWrapper>
          <DataPanel statBlocks={statBlocks} onChange={mockOnChange} />
        </TestWrapper>,
      );

      const addButton = screen.getByText('Add Section');
      await user.click(addButton);

      expect(mockOnChange).toHaveBeenCalled();
      const updatedStatBlocks = mockOnChange.mock.calls[0]?.[0];
      expect(updatedStatBlocks).toBeDefined();
      expect(updatedStatBlocks![5]).toBeDefined();
    });
  });

  describe('empty state handling', () => {
    it('should handle empty stat blocks object', () => {
      const statBlocks: Record<number, Record<string, StatBlockValue>> = {};

      render(
        <TestWrapper>
          <DataPanel statBlocks={statBlocks} onChange={mockOnChange} />
        </TestWrapper>,
      );

      expect(screen.getByText('Stat Block')).toBeInTheDocument();
      expect(screen.getByRole('region', { name: 'Property Grid' })).toBeInTheDocument();
    });

    it('should default to level 0 when no levels exist', () => {
      const statBlocks: Record<number, Record<string, StatBlockValue>> = {};

      render(
        <TestWrapper>
          <DataPanel statBlocks={statBlocks} onChange={mockOnChange} />
        </TestWrapper>,
      );

      expect(screen.getByRole('heading', { name: 'Stats' })).toBeInTheDocument();
    });
  });

  describe('theme support', () => {
    it('should render correctly in dark mode', () => {
      const darkTheme = createTheme({ palette: { mode: 'dark' } });

      const statBlocks: Record<number, Record<string, StatBlockValue>> = {
        0: {
          HP: { key: 'HP', value: '100', type: StatValueType.Number },
        },
      };

      render(
        <ThemeProvider theme={darkTheme}>
          <DataPanel statBlocks={statBlocks} onChange={mockOnChange} />
        </ThemeProvider>,
      );

      expect(screen.getByText('Stat Block')).toBeInTheDocument();
    });

    it('should render correctly in light mode', () => {
      const lightTheme = createTheme({ palette: { mode: 'light' } });

      const statBlocks: Record<number, Record<string, StatBlockValue>> = {
        0: {
          HP: { key: 'HP', value: '100', type: StatValueType.Number },
        },
      };

      render(
        <ThemeProvider theme={lightTheme}>
          <DataPanel statBlocks={statBlocks} onChange={mockOnChange} />
        </ThemeProvider>,
      );

      expect(screen.getByText('Stat Block')).toBeInTheDocument();
    });
  });

  describe('type conversion', () => {
    it('should convert number type stats correctly', () => {
      const statBlocks: Record<number, Record<string, StatBlockValue>> = {
        0: {
          HP: { key: 'HP', value: '100', type: StatValueType.Number },
        },
      };

      render(
        <TestWrapper>
          <DataPanel statBlocks={statBlocks} onChange={mockOnChange} />
        </TestWrapper>,
      );

      expect(screen.getByRole('listitem', { name: 'Property HP' })).toHaveTextContent('HP: 100');
    });

    it('should convert text type stats correctly', () => {
      const statBlocks: Record<number, Record<string, StatBlockValue>> = {
        0: {
          Languages: { key: 'Languages', value: 'Common', type: StatValueType.Text },
        },
      };

      render(
        <TestWrapper>
          <DataPanel statBlocks={statBlocks} onChange={mockOnChange} />
        </TestWrapper>,
      );

      expect(screen.getByRole('listitem', { name: 'Property Languages' })).toHaveTextContent('Languages: Common');
    });
  });
});
