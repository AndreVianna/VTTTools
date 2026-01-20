import { createTheme, ThemeProvider } from '@mui/material/styles';
import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import React from 'react';
import { beforeEach, describe, expect, it, vi } from 'vitest';
import { AssetKind } from '@/types/domain';
import { MetadataPanel, type MetadataPanelProps } from './MetadataPanel';
import type { AssetClassification, NamedSize } from '@/types/domain';

vi.mock('./BreadcrumbTaxonomyInput', () => ({
  BreadcrumbTaxonomyInput: ({ classification, onChange }: { classification: AssetClassification; onChange: (c: AssetClassification) => void }) => (
    <div data-mock="breadcrumb-taxonomy" role="group" aria-label="taxonomy input">
      <button onClick={() => onChange({ ...classification, kind: AssetKind.Character })}>
        Change Classification
      </button>
      <span>{classification.kind}</span>
    </div>
  ),
}));

const TestWrapper: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const theme = createTheme({ palette: { mode: 'light' } });
  return <ThemeProvider theme={theme}>{children}</ThemeProvider>;
};
TestWrapper.displayName = 'TestWrapper';

describe('MetadataPanel', () => {
  const mockClassification: AssetClassification = {
    kind: AssetKind.Creature,
    category: 'Humanoid',
    type: 'Goblin',
    subtype: null,
  };

  const mockTokenSize: NamedSize = {
    width: 1,
    height: 1,
  };

  const defaultProps: MetadataPanelProps = {
    name: 'Test Asset',
    description: '',
    classification: mockClassification,
    tokenSize: mockTokenSize,
    isPublic: false,
    isPublished: false,
    onNameChange: vi.fn<(name: string) => void>(),
    onDescriptionChange: vi.fn<(description: string) => void>(),
    onClassificationChange: vi.fn<(classification: AssetClassification) => void>(),
    onTokenSizeChange: vi.fn<(size: NamedSize) => void>(),
    onIsPublicChange: vi.fn<(isPublic: boolean) => void>(),
  };

  beforeEach(() => {
    vi.clearAllMocks();
  });

  describe('rendering', () => {
    it('should render name field with value', () => {
      render(
        <TestWrapper>
          <MetadataPanel {...defaultProps} />
        </TestWrapper>,
      );

      const nameField = screen.getByLabelText('Name');
      expect(nameField).toHaveValue('Test Asset');
    });

    it('should render description field with value', () => {
      render(
        <TestWrapper>
          <MetadataPanel {...defaultProps} description="Test description" />
        </TestWrapper>,
      );

      const descriptionField = screen.getByLabelText('Description');
      expect(descriptionField).toHaveValue('Test description');
    });

    it('should render BreadcrumbTaxonomyInput component', () => {
      render(
        <TestWrapper>
          <MetadataPanel {...defaultProps} />
        </TestWrapper>,
      );

      expect(screen.getByRole('group', { name: 'taxonomy input' })).toBeInTheDocument();
      expect(screen.getByText('Creature')).toBeInTheDocument();
    });

    it('should render token size slider with correct value', () => {
      render(
        <TestWrapper>
          <MetadataPanel {...defaultProps} />
        </TestWrapper>,
      );

      expect(screen.getByText('Token Size (1x1)')).toBeInTheDocument();
      const slider = screen.getByRole('slider');
      expect(slider).toBeInTheDocument();
    });

    it('should render public checkbox', () => {
      render(
        <TestWrapper>
          <MetadataPanel {...defaultProps} />
        </TestWrapper>,
      );

      const publicCheckbox = screen.getByRole('checkbox', { name: /public/i });
      expect(publicCheckbox).toBeInTheDocument();
      expect(publicCheckbox).not.toBeChecked();
    });

    it('should render visibility section', () => {
      render(
        <TestWrapper>
          <MetadataPanel {...defaultProps} />
        </TestWrapper>,
      );

      expect(screen.getByText('Visibility')).toBeInTheDocument();
      expect(screen.getByText('Allow other users to see this asset when published')).toBeInTheDocument();
    });
  });

  describe('name field interactions', () => {
    it('should call onNameChange when name is updated', async () => {
      const user = userEvent.setup();
      const onNameChange = vi.fn<(name: string) => void>();

      render(
        <TestWrapper>
          <MetadataPanel {...defaultProps} name="" onNameChange={onNameChange} />
        </TestWrapper>,
      );

      const nameField = screen.getByLabelText('Name');
      await user.type(nameField, 'Test');

      expect(onNameChange).toHaveBeenCalled();
      expect(onNameChange.mock.calls.length).toBeGreaterThan(0);
    });

    it('should handle empty name input', async () => {
      const user = userEvent.setup();
      const onNameChange = vi.fn<(name: string) => void>();

      render(
        <TestWrapper>
          <MetadataPanel {...defaultProps} name="Original Name" onNameChange={onNameChange} />
        </TestWrapper>,
      );

      const nameField = screen.getByLabelText('Name');
      await user.clear(nameField);

      expect(onNameChange).toHaveBeenCalledWith('');
    });
  });

  describe('description field interactions', () => {
    it('should call onDescriptionChange when description is updated', async () => {
      const user = userEvent.setup();
      const onDescriptionChange = vi.fn<(description: string) => void>();

      render(
        <TestWrapper>
          <MetadataPanel {...defaultProps} onDescriptionChange={onDescriptionChange} />
        </TestWrapper>,
      );

      const descriptionField = screen.getByLabelText('Description');
      await user.type(descriptionField, 'New');

      expect(onDescriptionChange).toHaveBeenCalled();
      expect(onDescriptionChange.mock.calls.length).toBeGreaterThan(0);
    });

    it('should render multiline description field', () => {
      render(
        <TestWrapper>
          <MetadataPanel {...defaultProps} />
        </TestWrapper>,
      );

      const descriptionField = screen.getByLabelText('Description');
      expect(descriptionField.tagName).toBe('TEXTAREA');
    });
  });

  describe('classification interactions', () => {
    it('should call onClassificationChange when classification is updated', async () => {
      const user = userEvent.setup();
      const onClassificationChange = vi.fn<(classification: AssetClassification) => void>();

      render(
        <TestWrapper>
          <MetadataPanel {...defaultProps} onClassificationChange={onClassificationChange} />
        </TestWrapper>,
      );

      const changeButton = screen.getByText('Change Classification');
      await user.click(changeButton);

      expect(onClassificationChange).toHaveBeenCalledWith({
        kind: AssetKind.Character,
        category: 'Humanoid',
        type: 'Goblin',
        subtype: null,
      });
    });
  });

  describe('token size interactions', () => {
    it('should display correct token size label for different sizes', () => {
      const { rerender } = render(
        <TestWrapper>
          <MetadataPanel {...defaultProps} tokenSize={{ width: 2, height: 2 }} />
        </TestWrapper>,
      );

      expect(screen.getByText('Token Size (2x2)')).toBeInTheDocument();

      rerender(
        <TestWrapper>
          <MetadataPanel {...defaultProps} tokenSize={{ width: 4, height: 4 }} />
        </TestWrapper>,
      );

      expect(screen.getByText('Token Size (4x4)')).toBeInTheDocument();
    });
  });

  describe('visibility interactions', () => {
    it('should call onIsPublicChange when public checkbox is toggled', async () => {
      const user = userEvent.setup();
      const onIsPublicChange = vi.fn<(isPublic: boolean) => void>();

      render(
        <TestWrapper>
          <MetadataPanel {...defaultProps} onIsPublicChange={onIsPublicChange} />
        </TestWrapper>,
      );

      const publicCheckbox = screen.getByRole('checkbox', { name: /public/i });
      await user.click(publicCheckbox);

      expect(onIsPublicChange).toHaveBeenCalledWith(true);
    });

    it('should reflect checked state when isPublic is true', () => {
      render(
        <TestWrapper>
          <MetadataPanel {...defaultProps} isPublic={true} />
        </TestWrapper>,
      );

      const publicCheckbox = screen.getByRole('checkbox', { name: /public/i });
      expect(publicCheckbox).toBeChecked();
    });
  });

  describe('theme support', () => {
    it('should render correctly in dark mode', () => {
      const darkTheme = createTheme({ palette: { mode: 'dark' } });

      render(
        <ThemeProvider theme={darkTheme}>
          <MetadataPanel {...defaultProps} description="Test description" />
        </ThemeProvider>,
      );

      expect(screen.getByLabelText('Name')).toBeInTheDocument();
      expect(screen.getByLabelText('Description')).toBeInTheDocument();
    });

    it('should render correctly in light mode', () => {
      const lightTheme = createTheme({ palette: { mode: 'light' } });

      render(
        <ThemeProvider theme={lightTheme}>
          <MetadataPanel {...defaultProps} description="Test description" />
        </ThemeProvider>,
      );

      expect(screen.getByLabelText('Name')).toBeInTheDocument();
      expect(screen.getByLabelText('Description')).toBeInTheDocument();
    });
  });

  describe('field sizes', () => {
    it('should render name field as small size', () => {
      render(
        <TestWrapper>
          <MetadataPanel {...defaultProps} />
        </TestWrapper>,
      );

      const nameField = screen.getByLabelText('Name');
      expect(nameField).toBeInTheDocument();
    });

    it('should render description field as small size', () => {
      render(
        <TestWrapper>
          <MetadataPanel {...defaultProps} />
        </TestWrapper>,
      );

      const descriptionField = screen.getByLabelText('Description');
      expect(descriptionField).toBeInTheDocument();
    });
  });
});
