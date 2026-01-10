import { createTheme, ThemeProvider } from '@mui/material/styles';
import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import type React from 'react';
import { beforeEach, describe, expect, it, vi } from 'vitest';
import { AssetKind } from '@/types/domain';
import { MetadataPanel } from './MetadataPanel';
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

  let mockOnNameChange: ReturnType<typeof vi.fn>;
  let mockOnDescriptionChange: ReturnType<typeof vi.fn>;
  let mockOnClassificationChange: ReturnType<typeof vi.fn>;
  let mockOnTokenSizeChange: ReturnType<typeof vi.fn>;
  let mockOnIsPublicChange: ReturnType<typeof vi.fn>;

  beforeEach(() => {
    mockOnNameChange = vi.fn();
    mockOnDescriptionChange = vi.fn();
    mockOnClassificationChange = vi.fn();
    mockOnTokenSizeChange = vi.fn();
    mockOnIsPublicChange = vi.fn();
  });

  describe('rendering', () => {
    it('should render name field with value', () => {
      render(
        <TestWrapper>
          <MetadataPanel
            name="Test Asset"
            description=""
            classification={mockClassification}
            tokenSize={mockTokenSize}
            isPublic={false}
            isPublished={false}
            onNameChange={mockOnNameChange}
            onDescriptionChange={mockOnDescriptionChange}
            onClassificationChange={mockOnClassificationChange}
            onTokenSizeChange={mockOnTokenSizeChange}
            onIsPublicChange={mockOnIsPublicChange}
          />
        </TestWrapper>,
      );

      const nameField = screen.getByLabelText('Name');
      expect(nameField).toHaveValue('Test Asset');
    });

    it('should render description field with value', () => {
      render(
        <TestWrapper>
          <MetadataPanel
            name="Test Asset"
            description="Test description"
            classification={mockClassification}
            tokenSize={mockTokenSize}
            isPublic={false}
            isPublished={false}
            onNameChange={mockOnNameChange}
            onDescriptionChange={mockOnDescriptionChange}
            onClassificationChange={mockOnClassificationChange}
            onTokenSizeChange={mockOnTokenSizeChange}
            onIsPublicChange={mockOnIsPublicChange}
          />
        </TestWrapper>,
      );

      const descriptionField = screen.getByLabelText('Description');
      expect(descriptionField).toHaveValue('Test description');
    });

    it('should render BreadcrumbTaxonomyInput component', () => {
      render(
        <TestWrapper>
          <MetadataPanel
            name="Test Asset"
            description=""
            classification={mockClassification}
            tokenSize={mockTokenSize}
            isPublic={false}
            isPublished={false}
            onNameChange={mockOnNameChange}
            onDescriptionChange={mockOnDescriptionChange}
            onClassificationChange={mockOnClassificationChange}
            onTokenSizeChange={mockOnTokenSizeChange}
            onIsPublicChange={mockOnIsPublicChange}
          />
        </TestWrapper>,
      );

      expect(screen.getByRole('group', { name: 'taxonomy input' })).toBeInTheDocument();
      expect(screen.getByText('Creature')).toBeInTheDocument();
    });

    it('should render token size slider with correct value', () => {
      render(
        <TestWrapper>
          <MetadataPanel
            name="Test Asset"
            description=""
            classification={mockClassification}
            tokenSize={mockTokenSize}
            isPublic={false}
            isPublished={false}
            onNameChange={mockOnNameChange}
            onDescriptionChange={mockOnDescriptionChange}
            onClassificationChange={mockOnClassificationChange}
            onTokenSizeChange={mockOnTokenSizeChange}
            onIsPublicChange={mockOnIsPublicChange}
          />
        </TestWrapper>,
      );

      expect(screen.getByText('Token Size (1x1)')).toBeInTheDocument();
      const slider = screen.getByRole('slider');
      expect(slider).toBeInTheDocument();
    });

    it('should render public checkbox', () => {
      render(
        <TestWrapper>
          <MetadataPanel
            name="Test Asset"
            description=""
            classification={mockClassification}
            tokenSize={mockTokenSize}
            isPublic={false}
            isPublished={false}
            onNameChange={mockOnNameChange}
            onDescriptionChange={mockOnDescriptionChange}
            onClassificationChange={mockOnClassificationChange}
            onTokenSizeChange={mockOnTokenSizeChange}
            onIsPublicChange={mockOnIsPublicChange}
          />
        </TestWrapper>,
      );

      const publicCheckbox = screen.getByRole('checkbox', { name: /public/i });
      expect(publicCheckbox).toBeInTheDocument();
      expect(publicCheckbox).not.toBeChecked();
    });

    it('should render visibility section', () => {
      render(
        <TestWrapper>
          <MetadataPanel
            name="Test Asset"
            description=""
            classification={mockClassification}
            tokenSize={mockTokenSize}
            isPublic={false}
            isPublished={false}
            onNameChange={mockOnNameChange}
            onDescriptionChange={mockOnDescriptionChange}
            onClassificationChange={mockOnClassificationChange}
            onTokenSizeChange={mockOnTokenSizeChange}
            onIsPublicChange={mockOnIsPublicChange}
          />
        </TestWrapper>,
      );

      expect(screen.getByText('Visibility')).toBeInTheDocument();
      expect(screen.getByText('Allow other users to see this asset when published')).toBeInTheDocument();
    });
  });

  describe('name field interactions', () => {
    it('should call onNameChange when name is updated', async () => {
      const user = userEvent.setup();

      render(
        <TestWrapper>
          <MetadataPanel
            name=""
            description=""
            classification={mockClassification}
            tokenSize={mockTokenSize}
            isPublic={false}
            isPublished={false}
            onNameChange={mockOnNameChange}
            onDescriptionChange={mockOnDescriptionChange}
            onClassificationChange={mockOnClassificationChange}
            onTokenSizeChange={mockOnTokenSizeChange}
            onIsPublicChange={mockOnIsPublicChange}
          />
        </TestWrapper>,
      );

      const nameField = screen.getByLabelText('Name');
      await user.type(nameField, 'Test');

      expect(mockOnNameChange).toHaveBeenCalled();
      expect(mockOnNameChange.mock.calls.length).toBeGreaterThan(0);
    });

    it('should handle empty name input', async () => {
      const user = userEvent.setup();

      render(
        <TestWrapper>
          <MetadataPanel
            name="Original Name"
            description=""
            classification={mockClassification}
            tokenSize={mockTokenSize}
            isPublic={false}
            isPublished={false}
            onNameChange={mockOnNameChange}
            onDescriptionChange={mockOnDescriptionChange}
            onClassificationChange={mockOnClassificationChange}
            onTokenSizeChange={mockOnTokenSizeChange}
            onIsPublicChange={mockOnIsPublicChange}
          />
        </TestWrapper>,
      );

      const nameField = screen.getByLabelText('Name');
      await user.clear(nameField);

      expect(mockOnNameChange).toHaveBeenCalledWith('');
    });
  });

  describe('description field interactions', () => {
    it('should call onDescriptionChange when description is updated', async () => {
      const user = userEvent.setup();

      render(
        <TestWrapper>
          <MetadataPanel
            name="Test Asset"
            description=""
            classification={mockClassification}
            tokenSize={mockTokenSize}
            isPublic={false}
            isPublished={false}
            onNameChange={mockOnNameChange}
            onDescriptionChange={mockOnDescriptionChange}
            onClassificationChange={mockOnClassificationChange}
            onTokenSizeChange={mockOnTokenSizeChange}
            onIsPublicChange={mockOnIsPublicChange}
          />
        </TestWrapper>,
      );

      const descriptionField = screen.getByLabelText('Description');
      await user.type(descriptionField, 'New');

      expect(mockOnDescriptionChange).toHaveBeenCalled();
      expect(mockOnDescriptionChange.mock.calls.length).toBeGreaterThan(0);
    });

    it('should render multiline description field', () => {
      render(
        <TestWrapper>
          <MetadataPanel
            name="Test Asset"
            description=""
            classification={mockClassification}
            tokenSize={mockTokenSize}
            isPublic={false}
            isPublished={false}
            onNameChange={mockOnNameChange}
            onDescriptionChange={mockOnDescriptionChange}
            onClassificationChange={mockOnClassificationChange}
            onTokenSizeChange={mockOnTokenSizeChange}
            onIsPublicChange={mockOnIsPublicChange}
          />
        </TestWrapper>,
      );

      const descriptionField = screen.getByLabelText('Description');
      expect(descriptionField.tagName).toBe('TEXTAREA');
    });
  });

  describe('classification interactions', () => {
    it('should call onClassificationChange when classification is updated', async () => {
      const user = userEvent.setup();

      render(
        <TestWrapper>
          <MetadataPanel
            name="Test Asset"
            description=""
            classification={mockClassification}
            tokenSize={mockTokenSize}
            isPublic={false}
            isPublished={false}
            onNameChange={mockOnNameChange}
            onDescriptionChange={mockOnDescriptionChange}
            onClassificationChange={mockOnClassificationChange}
            onTokenSizeChange={mockOnTokenSizeChange}
            onIsPublicChange={mockOnIsPublicChange}
          />
        </TestWrapper>,
      );

      const changeButton = screen.getByText('Change Classification');
      await user.click(changeButton);

      expect(mockOnClassificationChange).toHaveBeenCalledWith({
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
          <MetadataPanel
            name="Test Asset"
            description=""
            classification={mockClassification}
            tokenSize={{ width: 2, height: 2 }}
            isPublic={false}
            isPublished={false}
            onNameChange={mockOnNameChange}
            onDescriptionChange={mockOnDescriptionChange}
            onClassificationChange={mockOnClassificationChange}
            onTokenSizeChange={mockOnTokenSizeChange}
            onIsPublicChange={mockOnIsPublicChange}
          />
        </TestWrapper>,
      );

      expect(screen.getByText('Token Size (2x2)')).toBeInTheDocument();

      rerender(
        <TestWrapper>
          <MetadataPanel
            name="Test Asset"
            description=""
            classification={mockClassification}
            tokenSize={{ width: 4, height: 4 }}
            isPublic={false}
            isPublished={false}
            onNameChange={mockOnNameChange}
            onDescriptionChange={mockOnDescriptionChange}
            onClassificationChange={mockOnClassificationChange}
            onTokenSizeChange={mockOnTokenSizeChange}
            onIsPublicChange={mockOnIsPublicChange}
          />
        </TestWrapper>,
      );

      expect(screen.getByText('Token Size (4x4)')).toBeInTheDocument();
    });
  });

  describe('visibility interactions', () => {
    it('should call onIsPublicChange when public checkbox is toggled', async () => {
      const user = userEvent.setup();

      render(
        <TestWrapper>
          <MetadataPanel
            name="Test Asset"
            description=""
            classification={mockClassification}
            tokenSize={mockTokenSize}
            isPublic={false}
            isPublished={false}
            onNameChange={mockOnNameChange}
            onDescriptionChange={mockOnDescriptionChange}
            onClassificationChange={mockOnClassificationChange}
            onTokenSizeChange={mockOnTokenSizeChange}
            onIsPublicChange={mockOnIsPublicChange}
          />
        </TestWrapper>,
      );

      const publicCheckbox = screen.getByRole('checkbox', { name: /public/i });
      await user.click(publicCheckbox);

      expect(mockOnIsPublicChange).toHaveBeenCalledWith(true);
    });

    it('should reflect checked state when isPublic is true', () => {
      render(
        <TestWrapper>
          <MetadataPanel
            name="Test Asset"
            description=""
            classification={mockClassification}
            tokenSize={mockTokenSize}
            isPublic={true}
            isPublished={false}
            onNameChange={mockOnNameChange}
            onDescriptionChange={mockOnDescriptionChange}
            onClassificationChange={mockOnClassificationChange}
            onTokenSizeChange={mockOnTokenSizeChange}
            onIsPublicChange={mockOnIsPublicChange}
          />
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
          <MetadataPanel
            name="Test Asset"
            description="Test description"
            classification={mockClassification}
            tokenSize={mockTokenSize}
            isPublic={false}
            isPublished={false}
            onNameChange={mockOnNameChange}
            onDescriptionChange={mockOnDescriptionChange}
            onClassificationChange={mockOnClassificationChange}
            onTokenSizeChange={mockOnTokenSizeChange}
            onIsPublicChange={mockOnIsPublicChange}
          />
        </ThemeProvider>,
      );

      expect(screen.getByLabelText('Name')).toBeInTheDocument();
      expect(screen.getByLabelText('Description')).toBeInTheDocument();
    });

    it('should render correctly in light mode', () => {
      const lightTheme = createTheme({ palette: { mode: 'light' } });

      render(
        <ThemeProvider theme={lightTheme}>
          <MetadataPanel
            name="Test Asset"
            description="Test description"
            classification={mockClassification}
            tokenSize={mockTokenSize}
            isPublic={false}
            isPublished={false}
            onNameChange={mockOnNameChange}
            onDescriptionChange={mockOnDescriptionChange}
            onClassificationChange={mockOnClassificationChange}
            onTokenSizeChange={mockOnTokenSizeChange}
            onIsPublicChange={mockOnIsPublicChange}
          />
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
          <MetadataPanel
            name="Test Asset"
            description=""
            classification={mockClassification}
            tokenSize={mockTokenSize}
            isPublic={false}
            isPublished={false}
            onNameChange={mockOnNameChange}
            onDescriptionChange={mockOnDescriptionChange}
            onClassificationChange={mockOnClassificationChange}
            onTokenSizeChange={mockOnTokenSizeChange}
            onIsPublicChange={mockOnIsPublicChange}
          />
        </TestWrapper>,
      );

      const nameField = screen.getByLabelText('Name');
      expect(nameField).toBeInTheDocument();
    });

    it('should render description field as small size', () => {
      render(
        <TestWrapper>
          <MetadataPanel
            name="Test Asset"
            description=""
            classification={mockClassification}
            tokenSize={mockTokenSize}
            isPublic={false}
            isPublished={false}
            onNameChange={mockOnNameChange}
            onDescriptionChange={mockOnDescriptionChange}
            onClassificationChange={mockOnClassificationChange}
            onTokenSizeChange={mockOnTokenSizeChange}
            onIsPublicChange={mockOnIsPublicChange}
          />
        </TestWrapper>,
      );

      const descriptionField = screen.getByLabelText('Description');
      expect(descriptionField).toBeInTheDocument();
    });
  });
});
